/**
 * Research-only VORTEX2 ESC source-qualification sampler.
 * Not a production API. Does not import sounding bytes into src/.
 * Reads local data/ copies that must not be committed.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const artifactsDir = join(here, "artifacts");

const ESC_MISSING_WIND = 9999.0;
const ESC_MISSING_ALTITUDE = 99999.0;
const ESC_QC_MISSING = 9.0;
const ESC_QC_BAD = 3.0;

const QC_NAME = {
  1: "GOOD",
  2: "MAYBE",
  3: "BAD",
  4: "ESTIMATED",
  9: "MISSING",
  99: "UNCHECKED",
};

const FILES = {
  goshen: join(root, "data/114.114 Goshen/NSSL_MGAUS_20090605.cls"),
  prospect: join(root, "data/114.114 2010-05-26/NSSL_MGAUS_20100526.cls"),
  dumasNssl: join(root, "data/114.114 2010-05-18/NSSL_MGAUS_20100518.cls"),
  dumasNcar: join(root, "data/114.115 2010-05-18/NCAR_MGAUS_20100518.cls"),
};

function roundTenth(value) {
  return Math.round(value * 10) / 10;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function headerValue(lines, label) {
  const prefix = `${label}:`;
  for (const line of lines) {
    if (line.startsWith(prefix) || line.startsWith(label)) {
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      return line.slice(colon + 1).trim();
    }
  }
  return null;
}

function parseHeader(lines) {
  const location = headerValue(lines, "Release Location (lon,lat,alt)") ?? "";
  const parts = location.split(",").map((part) => part.trim());
  return {
    dataType: headerValue(lines, "Data Type"),
    projectId: headerValue(lines, "Project ID"),
    siteId: headerValue(lines, "Release Site Type/Site ID"),
    locationRaw: location,
    longitude: Number(parts[2]),
    latitude: Number(parts[3]),
    launchElevation: Number(parts[4]),
    utcReleaseTime: headerValue(lines, "UTC Release Time (y,m,d,h,m,s)"),
    sonde: headerValue(lines, "Sonde Id/Sonde Type"),
    referenceLaunch: headerValue(lines, "Reference Launch Data Source/Time"),
    comments: headerValue(lines, "System Operator/Comments"),
    postProcessing: headerValue(lines, "Post Processing Comments"),
    nominalReleaseTime: headerValue(lines, "Nominal Release Time (y,m,d,h,m,s)"),
    rawLines: lines,
  };
}

function parseDataRecord(line) {
  const parts = line.split(/\s+/).filter((part) => part.length > 0);
  if (parts.length !== 21) {
    throw new Error(`ESC data record must have 21 fields, got ${parts.length}`);
  }
  return {
    time: Number(parts[0]),
    press: Number(parts[1]),
    u: Number(parts[5]),
    v: Number(parts[6]),
    spd: Number(parts[7]),
    dir: Number(parts[8]),
    alt: Number(parts[14]),
    qu: Number(parts[18]),
    qv: Number(parts[19]),
    width: line.length,
  };
}

function parseEscConcatenated(text) {
  const lines = text.split(/\r?\n/);
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("Data Type:")) starts.push(i);
  }
  const blocks = [];
  for (let s = 0; s < starts.length; s++) {
    const start = starts[s];
    const end = s + 1 < starts.length ? starts[s + 1] : lines.length;
    const blockLines = lines.slice(start, end).filter((line, index, all) => {
      if (line.length > 0) return true;
      return index !== all.length - 1;
    });
    const header = parseHeader(blockLines.slice(0, 15));
    const records = blockLines.slice(15).map(parseDataRecord);
    blocks.push({ header, records, ordinal: s + 1 });
  }
  return blocks;
}

function isUsableWindRecord(record) {
  if (record.u === ESC_MISSING_WIND || record.v === ESC_MISSING_WIND) return false;
  if (
    record.qu === ESC_QC_MISSING ||
    record.qv === ESC_QC_MISSING ||
    record.qu === ESC_QC_BAD ||
    record.qv === ESC_QC_BAD
  ) {
    return false;
  }
  if (record.alt === ESC_MISSING_ALTITUDE) return false;
  return true;
}

function qcPair(record) {
  return `${QC_NAME[record.qu] ?? record.qu}/${QC_NAME[record.qv] ?? record.qv}`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function parseUtc(utc) {
  const m = utc.match(
    /(\d{4}),\s*(\d{2}),\s*(\d{2}),\s*(\d{2}):(\d{2}):(\d{2})/,
  );
  if (!m) return null;
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5]),
    second: Number(m[6]),
    hhmmss: `${m[4]}:${m[5]}:${m[6]}`,
    minutes: Number(m[4]) * 60 + Number(m[5]) + Number(m[6]) / 60,
  };
}

function inWindow(utc, startMin, endMin) {
  const t = parseUtc(utc);
  if (!t) return false;
  return t.minutes >= startMin && t.minutes <= endMin;
}

function countBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Object.fromEntries([...map.entries()].sort((a, b) => b[1] - a[1]));
}

function metDir(u, v) {
  const deg = (Math.atan2(-u, -v) * 180) / Math.PI;
  return (deg + 360) % 360;
}

function nearestKept(kept, height) {
  return kept.reduce((best, level) =>
    Math.abs(level.height - height) < Math.abs(best.height - height)
      ? level
      : best,
  );
}

function timeCadence(records) {
  const times = records.map((r) => r.time).filter((t) => Number.isFinite(t));
  const steps = [];
  for (let i = 1; i < times.length; i++) steps.push(roundTenth(times[i] - times[i - 1]));
  const unique = [...new Set(steps)].sort((a, b) => a - b);
  return {
    timeMin: times[0],
    timeMax: times[times.length - 1],
    nRecords: records.length,
    stepUnique: unique.slice(0, 12),
    exact1sShare:
      steps.length === 0
        ? null
        : steps.filter((s) => s === 1).length / steps.length,
  };
}

function auditColumn(block, label) {
  const { header, records } = block;
  const launchElev = header.launchElevation;
  const qcWind = countBy(records, qcPair);
  const missingUV = records.filter(
    (r) => r.u === ESC_MISSING_WIND && r.v === ESC_MISSING_WIND,
  ).length;
  const oneSidedUV = records.filter(
    (r) =>
      (r.u === ESC_MISSING_WIND) !== (r.v === ESC_MISSING_WIND),
  ).length;
  const missingAlt = records.filter((r) => r.alt === ESC_MISSING_ALTITUDE).length;
  const widths = countBy(records, (r) => String(r.width));

  const kept = [];
  const dropped = [];
  for (const record of records) {
    if (!isUsableWindRecord(record)) {
      dropped.push(record);
      continue;
    }
    const height = roundTenth(record.alt - launchElev);
    kept.push({
      time: record.time,
      height,
      eastward: record.u,
      northward: record.v,
      alt: record.alt,
      qu: record.qu,
      qv: record.qv,
    });
  }

  const dY = [];
  let decreasing = 0;
  let duplicate = 0;
  for (let i = 1; i < kept.length; i++) {
    const delta = roundTenth(kept[i].height - kept[i - 1].height);
    dY.push(delta);
    if (!(kept[i].height > kept[i - 1].height)) {
      if (kept[i].height === kept[i - 1].height) duplicate += 1;
      else decreasing += 1;
    }
  }
  const dYSorted = [...dY].sort((a, b) => a - b);
  const gapsOver50 = [];
  for (let i = 1; i < kept.length; i++) {
    const delta = roundTenth(kept[i].height - kept[i - 1].height);
    if (delta > 50) {
      gapsOver50.push({
        fromHeight: kept[i - 1].height,
        toHeight: kept[i].height,
        delta,
        fromTime: kept[i - 1].time,
      });
    }
  }

  const first20s = kept.filter((l) => l.time >= 0 && l.time <= 20);
  const lowest200 = kept.filter((l) => l.height <= 200);
  const lowest500 = kept.filter((l) => l.height <= 500);
  const consecDv = [];
  for (let i = 1; i < lowest200.length; i++) {
    const du = lowest200[i].eastward - lowest200[i - 1].eastward;
    const dv = lowest200[i].northward - lowest200[i - 1].northward;
    consecDv.push({
      time0: lowest200[i - 1].time,
      time1: lowest200[i].time,
      height0: lowest200[i - 1].height,
      height1: lowest200[i].height,
      dU: roundTenth(du),
      dV: roundTenth(dv),
      dSpd: roundTenth(Math.hypot(du, dv)),
    });
  }
  consecDv.sort((a, b) => b.dSpd - a.dSpd);

  const t0 = kept.find((l) => l.time === 0);
  const t1 = kept.find((l) => l.time === 1);
  const launchJump =
    t0 && t1
      ? {
          t0,
          t1,
          dU: roundTenth(t1.eastward - t0.eastward),
          dV: roundTenth(t1.northward - t0.northward),
          dSpd: roundTenth(
            Math.hypot(t1.eastward - t0.eastward, t1.northward - t0.northward),
          ),
        }
      : { t0: t0 ?? null, t1: t1 ?? null, note: "t=0 or t=1 not both kept" };

  const uniqueU = new Set(kept.map((l) => l.eastward));
  const uniqueV = new Set(kept.map((l) => l.northward));
  const uSteps = [];
  const sortedU = [...uniqueU].sort((a, b) => a - b);
  for (let i = 1; i < sortedU.length; i++) {
    uSteps.push(roundTenth(sortedU[i] - sortedU[i - 1]));
  }
  const uStepCounts = countBy(uSteps, (s) => s.toFixed(1));

  const knotsAt = {};
  for (const h of [0, 200, 500, 1000, 3000, 6000]) {
    if (kept.length === 0) continue;
    const n = nearestKept(kept, h);
    knotsAt[h] = {
      height: n.height,
      eastward: n.eastward,
      northward: n.northward,
      spd: roundTenth(Math.hypot(n.eastward, n.northward)),
      dirFrom: roundTenth(metDir(n.eastward, n.northward)),
      time: n.time,
    };
  }

  function bulk(h0, h1) {
    if (kept.length < 2) return null;
    const a = nearestKept(kept, h0);
    const b = nearestKept(kept, h1);
    const dU = b.eastward - a.eastward;
    const dV = b.northward - a.northward;
    return {
      fromHeight: a.height,
      toHeight: b.height,
      dU: roundTenth(dU),
      dV: roundTenth(dV),
      magnitude: roundTenth(Math.hypot(dU, dV)),
      fromDir: roundTenth(metDir(a.eastward, a.northward)),
      toDir: roundTenth(metDir(b.eastward, b.northward)),
    };
  }

  const firstKept = kept[0] ?? null;
  const lastKept = kept[kept.length - 1] ?? null;
  const lastPress = [...records].reverse().find((r) => r.press !== 9999.0);

  return {
    label,
    identity: {
      siteId: header.siteId,
      utcReleaseTime: header.utcReleaseTime,
      locationRaw: header.locationRaw,
      longitude: header.longitude,
      latitude: header.latitude,
      launchElevation: launchElev,
      sonde: header.sonde,
      referenceLaunch: header.referenceLaunch,
      comments: header.comments,
      postProcessing: header.postProcessing,
      dataType: header.dataType,
      projectId: header.projectId,
      nominalReleaseTime: header.nominalReleaseTime,
    },
    records: {
      n: records.length,
      widthCounts: widths,
      time: timeCadence(records),
      lastPressureMb: lastPress?.press ?? null,
    },
    qc: {
      windPairCounts: qcWind,
      missingUVTogether: missingUV,
      oneSidedUV,
      missingAlt,
    },
    dropPolicy: "I1 isUsableWindRecord: drop missing U or V, Qu/Qv MISSING(9) or BAD(3), missing Alt",
    kept: {
      n: kept.length,
      dropped: dropped.length,
      minHeight: firstKept?.height ?? null,
      maxHeight: lastKept?.height ?? null,
      firstKept,
      lastKept,
      decreasingHeightPairs: decreasing,
      duplicateHeightPairs: duplicate,
    },
    dY: {
      n: dY.length,
      min: dYSorted[0] ?? null,
      p10: percentile(dYSorted, 0.1),
      median: percentile(dYSorted, 0.5),
      p90: percentile(dYSorted, 0.9),
      max: dYSorted[dYSorted.length - 1] ?? null,
      gapsOver50m: gapsOver50,
    },
    lowLevel: {
      nKept0to200: lowest200.length,
      nKept0to500: lowest500.length,
      first20s: first20s.map((l) => ({
        time: l.time,
        height: l.height,
        eastward: l.eastward,
        northward: l.northward,
      })),
      launchJumpT0T1: launchJump,
      largestConsecDvIn0to200m: consecDv.slice(0, 5),
    },
    quantization: {
      uniqueU: uniqueU.size,
      uniqueV: uniqueV.size,
      uStepCounts: uStepCounts,
      note: "ESC U/V have 0.1 m/s printed precision",
    },
    sourceKnotsNearest: knotsAt,
    sourceBulkShear: {
      "0-1km": bulk(0, 1000),
      "0-3km": bulk(0, 3000),
      "0-6km": bulk(0, 6000),
    },
  };
}

function inventory(blocks, source) {
  return blocks.map((block) => {
    const t = parseUtc(block.header.utcReleaseTime);
    return {
      source,
      ordinal: block.ordinal,
      siteId: block.header.siteId,
      utcReleaseTime: block.header.utcReleaseTime,
      hhmmss: t?.hhmmss ?? null,
      longitude: block.header.longitude,
      latitude: block.header.latitude,
      launchElevation: block.header.launchElevation,
      comments: block.header.comments,
      sonde: block.header.sonde,
      postProcessing: block.header.postProcessing,
      nRecords: block.records.length,
    };
  });
}

function load(path) {
  return parseEscConcatenated(readFileSync(path, "utf8"));
}

const goshenBlocks = load(FILES.goshen);
const prospectBlocks = load(FILES.prospect);
const dumasNsslBlocks = load(FILES.dumasNssl);
const dumasNcarBlocks = load(FILES.dumasNcar);

const DUMAS_TX = { lat: 35.8617, lon: -101.9731 };
const startMin = 21 * 60 + 30;
const endMin = 22 * 60 + 30;

const dumasWindow = [
  ...inventory(dumasNsslBlocks, "114.114 NSSL_MGAUS_20100518.cls"),
  ...inventory(dumasNcarBlocks, "114.115 NCAR_MGAUS_20100518.cls"),
]
  .filter((row) => inWindow(row.utcReleaseTime, startMin, endMin))
  .map((row) => ({
    ...row,
    distanceToDumasKm: roundTenth(
      haversineKm(row.latitude, row.longitude, DUMAS_TX.lat, DUMAS_TX.lon),
    ),
    bearingFromDumas:
      Math.atan2(
        row.longitude - DUMAS_TX.lon,
        row.latitude - DUMAS_TX.lat,
      ),
    southOfDumas: row.latitude < DUMAS_TX.lat,
  }))
  .sort((a, b) => a.hhmmss.localeCompare(b.hhmmss));

function findBlock(blocks, pred) {
  const hits = blocks.filter(pred);
  if (hits.length !== 1) {
    throw new Error(`expected 1 block, got ${hits.length}`);
  }
  return hits[0];
}

const goshen = findBlock(
  goshenBlocks,
  (b) =>
    b.header.siteId.includes("NSSL1") &&
    b.header.utcReleaseTime === "2009, 06, 05, 21:55:22",
);
const prospect = findBlock(
  prospectBlocks,
  (b) =>
    b.header.siteId.includes("NSSL1") &&
    b.header.utcReleaseTime === "2010, 05, 26, 22:23:46",
);

const nssl2_215218 = dumasNsslBlocks.find(
  (b) => b.header.utcReleaseTime === "2010, 05, 18, 21:52:18",
);

const summary = {
  files: {
    goshen: {
      path: "data/114.114 Goshen/NSSL_MGAUS_20090605.cls",
      nBlocks: goshenBlocks.length,
    },
    prospect: {
      path: "data/114.114 2010-05-26/NSSL_MGAUS_20100526.cls",
      nBlocks: prospectBlocks.length,
      all: inventory(prospectBlocks, "114.114 NSSL_MGAUS_20100526.cls"),
    },
    dumasNssl: {
      path: "data/114.114 2010-05-18/NSSL_MGAUS_20100518.cls",
      nBlocks: dumasNsslBlocks.length,
      all: inventory(dumasNsslBlocks, "114.114 NSSL_MGAUS_20100518.cls"),
    },
    dumasNcar: {
      path: "data/114.115 2010-05-18/NCAR_MGAUS_20100518.cls",
      nBlocks: dumasNcarBlocks.length,
      all: inventory(dumasNcarBlocks, "114.115 NCAR_MGAUS_20100518.cls"),
    },
  },
  prospectValleyIdentityConfirmed: {
    expected: "NSSL1 2010-05-26 22:23:46",
    found: prospect.header.siteId + " / " + prospect.header.utcReleaseTime,
  },
  dumasWindow2130to2230: dumasWindow,
  nssl2_215218_present: Boolean(nssl2_215218),
  audits: {
    goshen2155: auditColumn(goshen, "Goshen NSSL1 2009-06-05 21:55:22"),
    prospectValley222346: auditColumn(
      prospect,
      "Prospect Valley NSSL1 2010-05-26 22:23:46",
    ),
    dumasNssl2_215218: nssl2_215218
      ? auditColumn(nssl2_215218, "Dumas NSSL2 2010-05-18 21:52:18")
      : null,
  },
};

mkdirSync(artifactsDir, { recursive: true });
writeFileSync(
  join(artifactsDir, "vortex2-source-qualification-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      prospectBlocks: summary.files.prospect.all,
      dumasWindow: dumasWindow,
      prospectIdentity: prospect.header,
      goshenKept: summary.audits.goshen2155.kept,
      prospectKept: summary.audits.prospectValley222346.kept,
      prospectDY: summary.audits.prospectValley222346.dY,
      prospectLow: summary.audits.prospectValley222346.lowLevel.launchJumpT0T1,
      prospectBulk: summary.audits.prospectValley222346.sourceBulkShear,
      goshenBulk: summary.audits.goshen2155.sourceBulkShear,
      dumasBulk: summary.audits.dumasNssl2_215218?.sourceBulkShear,
      dumasKept: summary.audits.dumasNssl2_215218?.kept,
      dumasDY: summary.audits.dumasNssl2_215218?.dY,
      dumasLow: summary.audits.dumasNssl2_215218?.lowLevel.launchJumpT0T1,
      dumasId: summary.audits.dumasNssl2_215218?.identity,
      prospectKnots: summary.audits.prospectValley222346.sourceKnotsNearest,
      goshenKnots: summary.audits.goshen2155.sourceKnotsNearest,
      dumasKnots: summary.audits.dumasNssl2_215218?.sourceKnotsNearest,
      prospectQc: summary.audits.prospectValley222346.qc,
      dumasQc: summary.audits.dumasNssl2_215218?.qc,
      goshenQc: summary.audits.goshen2155.qc,
      prospectTime: summary.audits.prospectValley222346.records.time,
      dumasTime: summary.audits.dumasNssl2_215218?.records.time,
      goshenTime: summary.audits.goshen2155.records.time,
      prospectQuant: summary.audits.prospectValley222346.quantization,
      dumasQuant: summary.audits.dumasNssl2_215218?.quantization,
      goshenQuant: summary.audits.goshen2155.quantization,
      prospectLow200: summary.audits.prospectValley222346.lowLevel,
      dumasLow200: summary.audits.dumasNssl2_215218?.lowLevel,
      goshenLow200: summary.audits.goshen2155.lowLevel,
    },
    null,
    2,
  ),
);
