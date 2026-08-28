/**
 * Research-only ESC flight-phase + high-frequency wind audit.
 * Not a production API. Does not import sounding bytes into src/.
 * Does not mutate Source profiles, goldens, or physics.
 * Reads gitignored native data/ copies that must not be committed.
 *
 * Spectral interpolation, if used, exists only inside this sampler
 * and is never written back into Source data.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const artifactsDir = join(here, "artifacts");

const ESC_MISSING_WIND = 9999.0;
const ESC_MISSING_ALTITUDE = 99999.0;
const ESC_MISSING_ASCENT = 999.0;
const ESC_QC_MISSING = 9.0;
const ESC_QC_BAD = 3.0;
const G = 9.80665;

const CASES = [
  {
    id: "goshen",
    label: "Goshen NSSL1 2009-06-05 21:55:22",
    path: join(root, "data/114.114 Goshen/NSSL_MGAUS_20090605.cls"),
    siteIdIncludes: "NSSL1",
    utcReleaseTime: "2009, 06, 05, 21:55:22",
    expectedLaunchElevationM: 1557.9,
    goldenPath: join(
      root,
      "src/data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json",
    ),
    expectedKept: 2029,
  },
  {
    id: "prospect",
    label: "Prospect Valley NSSL1 2010-05-26 22:23:46",
    path: join(root, "data/114.114 2010-05-26/NSSL_MGAUS_20100526.cls"),
    siteIdIncludes: "NSSL1",
    utcReleaseTime: "2010, 05, 26, 22:23:46",
    expectedLaunchElevationM: 1358.9,
    goldenPath: join(
      root,
      "src/data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.normalized.json",
    ),
    expectedKept: 2733,
  },
  {
    id: "dumas",
    label: "Dumas/Stinnett NSSL2 2010-05-18 21:52:18",
    path: join(root, "data/114.114 2010-05-18/NSSL_MGAUS_20100518.cls"),
    siteIdIncludes: "NSSL2",
    utcReleaseTime: "2010, 05, 18, 21:52:18",
    expectedLaunchElevationM: 1122.1,
    goldenPath: join(
      root,
      "src/data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.normalized.json",
    ),
    expectedKept: 2917,
  },
];

const MOORE_GOLDEN = join(
  root,
  "src/data/igra/fixtures/ounMoore20130520.normalized.json",
);

function roundTenth(value) {
  return Math.round(value * 10) / 10;
}

function round(value, digits) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function summarize(values) {
  if (values.length === 0) {
    return { n: 0, min: null, p10: null, median: null, p90: null, max: null };
  }
  const sorted = [...values].sort((a, b) => a - b);
  return {
    n: values.length,
    min: sorted[0],
    p10: percentile(sorted, 0.1),
    median: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    max: sorted[sorted.length - 1],
  };
}

function countBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Object.fromEntries(
    [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))),
  );
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
    postProcessing: headerValue(lines, "Post Processing Comments"),
    comments: headerValue(lines, "System Operator/Comments"),
  };
}

function parseDataRecord(line, nativeIndex) {
  const parts = line.split(/\s+/).filter((part) => part.length > 0);
  if (parts.length !== 21) {
    throw new Error(`ESC data record must have 21 fields, got ${parts.length}`);
  }
  return {
    nativeIndex,
    time: Number(parts[0]),
    press: Number(parts[1]),
    u: Number(parts[5]),
    v: Number(parts[6]),
    spd: Number(parts[7]),
    dir: Number(parts[8]),
    wcmp: Number(parts[9]),
    alt: Number(parts[14]),
    qu: Number(parts[18]),
    qv: Number(parts[19]),
    qdz: Number(parts[20]),
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
    const records = blockLines.slice(15).map((line, i) => parseDataRecord(line, i));
    blocks.push({ header, records });
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

function findBlock(blocks, spec) {
  const hits = blocks.filter(
    (b) =>
      b.header.siteId.includes(spec.siteIdIncludes) &&
      b.header.utcReleaseTime === spec.utcReleaseTime,
  );
  if (hits.length !== 1) {
    throw new Error(`${spec.label}: expected 1 block, got ${hits.length}`);
  }
  return hits[0];
}

function consecutiveDeltas(records, valueFn) {
  const out = [];
  for (let i = 1; i < records.length; i++) {
    const a = valueFn(records[i - 1]);
    const b = valueFn(records[i]);
    if (Number.isFinite(a) && Number.isFinite(b)) out.push(b - a);
  }
  return out;
}

function flightPhaseAudit(records) {
  const validAlt = records
    .map((r, i) => ({ i, r }))
    .filter(({ r }) => r.alt !== ESC_MISSING_ALTITUDE && Number.isFinite(r.alt));
  if (validAlt.length === 0) {
    throw new Error("no valid Alt records");
  }
  let maxIdxInValid = 0;
  for (let i = 1; i < validAlt.length; i++) {
    if (validAlt[i].r.alt > validAlt[maxIdxInValid].r.alt) maxIdxInValid = i;
  }
  const maxEntry = validAlt[maxIdxInValid];
  const maxNativeIndex = maxEntry.r.nativeIndex;
  const postNative = records.filter((r) => r.nativeIndex > maxNativeIndex);
  const preValid = validAlt.filter(({ r }) => r.nativeIndex < maxNativeIndex).map(({ r }) => r);
  const postValid = validAlt.filter(({ r }) => r.nativeIndex > maxNativeIndex).map(({ r }) => r);

  const dAltPre = consecutiveDeltas(preValid, (r) => r.alt);
  const dAltPost = consecutiveDeltas(
    [records[maxNativeIndex], ...postValid],
    (r) => r.alt,
  );
  const dTPre = consecutiveDeltas(preValid, (r) => r.time);
  const dTPost = consecutiveDeltas(
    [records[maxNativeIndex], ...postValid],
    (r) => r.time,
  );
  const ratePre = [];
  for (let i = 1; i < preValid.length; i++) {
    const dt = preValid[i].time - preValid[i - 1].time;
    if (dt > 0) ratePre.push((preValid[i].alt - preValid[i - 1].alt) / dt);
  }
  const ratePost = [];
  const postSeq = [records[maxNativeIndex], ...postValid];
  for (let i = 1; i < postSeq.length; i++) {
    const dt = postSeq[i].time - postSeq[i - 1].time;
    if (dt > 0) ratePost.push((postSeq[i].alt - postSeq[i - 1].alt) / dt);
  }

  const postNegativeAltSteps = dAltPost.filter((d) => d < 0).length;
  const postPositiveAltSteps = dAltPost.filter((d) => d > 0).length;
  const postZeroAltSteps = dAltPost.filter((d) => d === 0).length;
  const persistentlyDecreasing =
    postValid.length >= 5 &&
    postNegativeAltSteps / Math.max(dAltPost.length, 1) >= 0.8 &&
    (summarize(dAltPost).median ?? 0) < 0;

  const postUsable = postNative.filter(isUsableWindRecord);
  const postUsableWouldBreakMonotone = [];
  if (postUsable.length > 0) {
    const lastPreUsable = records
      .slice(0, maxNativeIndex + 1)
      .filter(isUsableWindRecord)
      .at(-1);
    let prevAlt = lastPreUsable?.alt ?? maxEntry.r.alt;
    for (const rec of postUsable) {
      if (!(rec.alt > prevAlt)) {
        postUsableWouldBreakMonotone.push({
          nativeIndex: rec.nativeIndex,
          time: rec.time,
          alt: rec.alt,
          prevAlt,
          u: rec.u,
          v: rec.v,
          qu: rec.qu,
          qv: rec.qv,
        });
      }
      prevAlt = rec.alt;
    }
  }

  return {
    firstNative: {
      nativeIndex: records[0].nativeIndex,
      time: records[0].time,
      alt: records[0].alt,
      u: records[0].u,
      v: records[0].v,
    },
    lastNative: {
      nativeIndex: records[records.length - 1].nativeIndex,
      time: records[records.length - 1].time,
      alt: records[records.length - 1].alt,
      u: records[records.length - 1].u,
      v: records[records.length - 1].v,
    },
    maximumAltitude: {
      nativeIndex: maxNativeIndex,
      time: maxEntry.r.time,
      alt: maxEntry.r.alt,
      press: maxEntry.r.press,
      u: maxEntry.r.u,
      v: maxEntry.r.v,
      usable: isUsableWindRecord(maxEntry.r),
      isLastNativeRecord: maxNativeIndex === records.length - 1,
    },
    nativeRecordCount: records.length,
    postMaxNativeCount: postNative.length,
    postMaxValidAltCount: postValid.length,
    postMaxUsableI1Count: postUsable.length,
    postMaxUsableWouldBreakStrictlyIncreasing: postUsableWouldBreakMonotone.length,
    postMaxUsableBreakExamples: postUsableWouldBreakMonotone.slice(0, 8),
    persistentlyDecreasingAfterMax: persistentlyDecreasing,
    dAltPre: roundSummary(summarize(dAltPre)),
    dAltPost: roundSummary(summarize(dAltPost)),
    dTPre: roundSummary(summarize(dTPre)),
    dTPost: roundSummary(summarize(dTPost)),
    ascentRatePre: roundSummary(summarize(ratePre)),
    ascentRatePost: roundSummary(summarize(ratePost)),
    postAltStepSign: {
      negative: postNegativeAltSteps,
      zero: postZeroAltSteps,
      positive: postPositiveAltSteps,
    },
    lastValidAlt: validAlt[validAlt.length - 1].r.alt,
    lastValidTime: validAlt[validAlt.length - 1].r.time,
  };
}

function roundSummary(s) {
  if (s.n === 0) return s;
  return {
    n: s.n,
    min: round(s.min, 4),
    p10: round(s.p10, 4),
    median: round(s.median, 4),
    p90: round(s.p90, 4),
    max: round(s.max, 4),
  };
}

function retainI1(block, spec) {
  if (block.header.launchElevation !== spec.expectedLaunchElevationM) {
    throw new Error(
      `${spec.label}: launch elevation ${block.header.launchElevation} != ${spec.expectedLaunchElevationM}`,
    );
  }
  const kept = [];
  const dropped = [];
  for (const record of block.records) {
    if (!isUsableWindRecord(record)) {
      dropped.push(record);
      continue;
    }
    kept.push({
      nativeIndex: record.nativeIndex,
      time: record.time,
      alt: record.alt,
      height: roundTenth(record.alt - spec.expectedLaunchElevationM),
      u: record.u,
      v: record.v,
      wcmp: record.wcmp,
      press: record.press,
      qu: record.qu,
      qv: record.qv,
    });
  }
  for (let i = 1; i < kept.length; i++) {
    if (!(kept[i].height > kept[i - 1].height)) {
      throw new Error(
        `${spec.label}: I1-retained heights not strictly increasing at kept index ${i} (native ${kept[i].nativeIndex})`,
      );
    }
  }
  return { kept, dropped };
}

function compareGolden(kept, golden, spec) {
  const levels = golden.levels;
  const mismatches = [];
  if (kept.length !== levels.length) {
    mismatches.push({
      kind: "count",
      kept: kept.length,
      golden: levels.length,
    });
  }
  const n = Math.min(kept.length, levels.length);
  for (let i = 0; i < n; i++) {
    if (
      kept[i].height !== levels[i].height ||
      kept[i].u !== levels[i].eastward ||
      kept[i].v !== levels[i].northward
    ) {
      mismatches.push({
        kind: "value",
        i,
        kept: { height: kept[i].height, u: kept[i].u, v: kept[i].v },
        golden: levels[i],
      });
      if (mismatches.length > 6) break;
    }
  }
  return {
    goldenCount: levels.length,
    keptCount: kept.length,
    firstGolden: levels[0] ?? null,
    lastGolden: levels[levels.length - 1] ?? null,
    firstKept: kept[0]
      ? { height: kept[0].height, u: kept[0].u, v: kept[0].v, time: kept[0].time }
      : null,
    lastKept: kept[kept.length - 1]
      ? {
          height: kept[kept.length - 1].height,
          u: kept[kept.length - 1].u,
          v: kept[kept.length - 1].v,
          time: kept[kept.length - 1].time,
        }
      : null,
    exactMatch: mismatches.length === 0 && kept.length === levels.length,
    mismatches,
    expectedKept: spec.expectedKept,
    expectedKeptMatch: kept.length === spec.expectedKept,
  };
}

function samplingAndAscent(kept) {
  const dt = [];
  const dAlt = [];
  const dHeight = [];
  const rates = [];
  const gaps = [];
  for (let i = 1; i < kept.length; i++) {
    const dT = kept[i].time - kept[i - 1].time;
    const dA = kept[i].alt - kept[i - 1].alt;
    const dH = kept[i].height - kept[i - 1].height;
    dt.push(dT);
    dAlt.push(dA);
    dHeight.push(dH);
    if (dT > 0) rates.push(dA / dT);
    if (dT > 2.0 || dH > 20) {
      gaps.push({
        fromTime: kept[i - 1].time,
        toTime: kept[i].time,
        dt: round(dT, 3),
        fromHeight: kept[i - 1].height,
        toHeight: kept[i].height,
        dHeight: round(dH, 3),
      });
    }
  }
  const exact1s = dt.filter((x) => x === 1).length;
  return {
    nKept: kept.length,
    time: {
      first: kept[0]?.time ?? null,
      last: kept[kept.length - 1]?.time ?? null,
      delta: roundSummary(summarize(dt)),
      uniqueRounded: [...new Set(dt.map((x) => roundTenth(x)))].sort((a, b) => a - b).slice(0, 16),
      exact1sShare: dt.length ? exact1s / dt.length : null,
      exact1sCount: exact1s,
    },
    dAlt: roundSummary(summarize(dAlt)),
    dHeight: roundSummary(summarize(dHeight)),
    ascentRate: roundSummary(summarize(rates)),
    reportedWcmp: roundSummary(
      summarize(kept.map((k) => k.wcmp).filter((w) => w !== ESC_MISSING_ASCENT && Number.isFinite(w))),
    ),
    discontinuitiesDtGt2OrDzGt20: {
      n: gaps.length,
      examples: gaps.slice(0, 12),
    },
  };
}

function movingAverage(values, halfWindow) {
  const out = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const lo = Math.max(0, i - halfWindow);
    const hi = Math.min(values.length - 1, i + halfWindow);
    let sum = 0;
    let n = 0;
    for (let j = lo; j <= hi; j++) {
      sum += values[j];
      n += 1;
    }
    out[i] = sum / n;
  }
  return out;
}

function linearDetrend(values) {
  const n = values.length;
  if (n < 2) return values.slice();
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return values.map((y, i) => y - (intercept + slope * i));
}

function hann(n) {
  const w = new Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
  return w;
}

function periodogram(values, dt) {
  const n = values.length;
  const w = hann(n);
  let meanW = 0;
  for (const wi of w) meanW += wi;
  meanW /= n;
  const x = new Array(n);
  let mean = 0;
  for (let i = 0; i < n; i++) mean += values[i];
  mean /= n;
  for (let i = 0; i < n; i++) x[i] = (values[i] - mean) * (w[i] / meanW);
  const nFreq = Math.floor(n / 2);
  const bins = [];
  for (let k = 1; k < nFreq; k++) {
    let re = 0;
    let im = 0;
    const ang0 = (-2 * Math.PI * k) / n;
    for (let t = 0; t < n; t++) {
      const ang = ang0 * t;
      re += x[t] * Math.cos(ang);
      im += x[t] * Math.sin(ang);
    }
    const freq = k / (n * dt);
    bins.push({
      k,
      freq,
      period: 1 / freq,
      power: (re * re + im * im) / n,
    });
  }
  return bins;
}

function welchPeriodogram(values, dt, windowLen, overlapFrac) {
  const step = Math.max(1, Math.floor(windowLen * (1 - overlapFrac)));
  const acc = new Map();
  let nWindows = 0;
  for (let start = 0; start + windowLen <= values.length; start += step) {
    const slice = values.slice(start, start + windowLen);
    const bins = periodogram(slice, dt);
    nWindows += 1;
    for (const bin of bins) {
      const prev = acc.get(bin.k) ?? { ...bin, power: 0 };
      prev.power += bin.power;
      acc.set(bin.k, prev);
    }
  }
  const bins = [...acc.values()]
    .map((bin) => ({
      k: bin.k,
      freq: bin.freq,
      period: bin.period,
      power: nWindows ? bin.power / nWindows : 0,
    }))
    .sort((a, b) => a.k - b.k);
  return { nWindows, windowLen, overlapFrac, bins };
}

function localMaxima(bins, periodMin, periodMax) {
  const inBand = bins.filter((b) => b.period >= periodMin && b.period <= periodMax);
  const peaks = [];
  for (let i = 1; i < inBand.length - 1; i++) {
    if (inBand[i].power >= inBand[i - 1].power && inBand[i].power >= inBand[i + 1].power) {
      peaks.push(inBand[i]);
    }
  }
  const bandMedian =
    inBand.length === 0
      ? 0
      : percentile(
          [...inBand.map((b) => b.power)].sort((a, b) => a - b),
          0.5,
        );
  return peaks
    .map((p) => ({
      period: round(p.period, 3),
      freq: round(p.freq, 5),
      power: round(p.power, 6),
      prominence: bandMedian > 0 ? round(p.power / bandMedian, 2) : null,
    }))
    .sort((a, b) => b.power - a.power);
}

function autocorr(values, maxLag) {
  const n = values.length;
  let mean = 0;
  for (const v of values) mean += v;
  mean /= n;
  const y = values.map((v) => v - mean);
  let var0 = 0;
  for (const v of y) var0 += v * v;
  if (var0 === 0) return [];
  const out = [];
  for (let lag = 0; lag <= maxLag; lag++) {
    let s = 0;
    const m = n - lag;
    for (let i = 0; i < m; i++) s += y[i] * y[i + lag];
    out.push({ lag, r: s / var0 });
  }
  return out;
}

function firstPositiveAutocorrPeak(acf) {
  let i = 2;
  while (i < acf.length && acf[i].r <= acf[i - 1].r) i += 1;
  while (i < acf.length - 1 && acf[i].r < acf[i + 1].r) i += 1;
  if (i >= acf.length - 1 || acf[i].r <= 0) return null;
  return { lag: acf[i].lag, r: round(acf[i].r, 4) };
}

function interpolateUniform1s(kept) {
  const t0 = Math.ceil(kept[0].time);
  const t1 = Math.floor(kept[kept.length - 1].time);
  const times = [];
  const u = [];
  const v = [];
  const observed = [];
  let j = 0;
  for (let t = t0; t <= t1; t += 1) {
    while (j + 1 < kept.length && kept[j + 1].time < t) j += 1;
    const a = kept[j];
    const b = kept[Math.min(j + 1, kept.length - 1)];
    times.push(t);
    if (a.time === t) {
      u.push(a.u);
      v.push(a.v);
      observed.push(true);
    } else if (b.time === t) {
      u.push(b.u);
      v.push(b.v);
      observed.push(true);
    } else if (b.time !== a.time && t > a.time && t < b.time) {
      const w = (t - a.time) / (b.time - a.time);
      u.push(a.u + w * (b.u - a.u));
      v.push(a.v + w * (b.v - a.v));
      observed.push(false);
    } else {
      u.push(a.u);
      v.push(a.v);
      observed.push(a.time === t);
    }
  }
  const observedShare = observed.filter(Boolean).length / observed.length;
  return { times, u, v, observed, observedShare, dt: 1, t0, t1 };
}

function firstDifferences1s(kept) {
  const dU = [];
  const dV = [];
  const mag = [];
  for (let i = 1; i < kept.length; i++) {
    const dt = kept[i].time - kept[i - 1].time;
    if (dt !== 1) continue;
    const du = kept[i].u - kept[i - 1].u;
    const dv = kept[i].v - kept[i - 1].v;
    dU.push(du);
    dV.push(dv);
    mag.push(Math.hypot(du, dv));
  }
  return { dU, dV, mag };
}

function peakTable(bins, label) {
  return {
    label,
    band4to40s: localMaxima(bins, 4, 40).slice(0, 6),
    band6to20s: localMaxima(bins, 6, 20).slice(0, 6),
    band40to120s: localMaxima(bins, 40, 120).slice(0, 4),
  };
}

function windowedPeakPersistence(values, dt, windowLen, periodLo, periodHi) {
  const step = Math.floor(windowLen / 2);
  const windows = [];
  for (let start = 0; start + windowLen <= values.length; start += step) {
    const bins = periodogram(values.slice(start, start + windowLen), dt);
    const peaks = localMaxima(bins, periodLo, periodHi);
    windows.push({
      startIndex: start,
      startTimeOffsetS: start * dt,
      top: peaks[0] ?? null,
      top3: peaks.slice(0, 3),
    });
  }
  const periods = windows.map((w) => w.top?.period).filter((p) => p != null);
  const medianTop = periods.length ? percentile([...periods].sort((a, b) => a - b), 0.5) : null;
  const nearMedian =
    medianTop == null
      ? 0
      : periods.filter((p) => Math.abs(p - medianTop) / medianTop <= 0.2).length;
  return {
    nWindows: windows.length,
    windowLenS: windowLen * dt,
    medianTopPeriodS: medianTop == null ? null : round(medianTop, 3),
    fractionWithin20pctOfMedian: windows.length ? round(nearMedian / windows.length, 3) : null,
    windows: windows.map((w) => ({
      startTimeOffsetS: w.startTimeOffsetS,
      topPeriodS: w.top?.period ?? null,
      topProminence: w.top?.prominence ?? null,
    })),
  };
}

function halfFlightPeaks(values, dt, label) {
  const mid = Math.floor(values.length / 2);
  const first = periodogram(values.slice(0, mid), dt);
  const second = periodogram(values.slice(mid), dt);
  return {
    label,
    firstHalf: peakTable(first, `${label}-first-half`).band6to20s.slice(0, 3),
    secondHalf: peakTable(second, `${label}-second-half`).band6to20s.slice(0, 3),
  };
}

function spectralAudit(kept) {
  const diffs = firstDifferences1s(kept);
  const grid = interpolateUniform1s(kept);
  const uDetrend = linearDetrend(grid.u);
  const vDetrend = linearDetrend(grid.v);
  const uRes30 = grid.u.map((x, i) => x - movingAverage(grid.u, 15)[i]);
  const vRes30 = grid.v.map((x, i) => x - movingAverage(grid.v, 15)[i]);
  const uRes60 = grid.u.map((x, i) => x - movingAverage(grid.u, 30)[i]);
  const vRes60 = grid.v.map((x, i) => x - movingAverage(grid.v, 30)[i]);
  const magRes30 = uRes30.map((u, i) => Math.hypot(u, vRes30[i]));

  const specDiffU = periodogram(diffs.dU, 1);
  const specDiffV = periodogram(diffs.dV, 1);
  const specDetU = periodogram(uDetrend, 1);
  const specDetV = periodogram(vDetrend, 1);
  const specRes30U = periodogram(uRes30, 1);
  const specRes30V = periodogram(vRes30, 1);
  const specRes60U = periodogram(uRes60, 1);
  const specRes60V = periodogram(vRes60, 1);
  const specMag30 = periodogram(magRes30, 1);
  const welchU = welchPeriodogram(uRes30, 1, 256, 0.5);
  const welchV = welchPeriodogram(vRes30, 1, 256, 0.5);

  const acfU = autocorr(uRes30, 60);
  const acfV = autocorr(vRes30, 60);
  const acfDU = autocorr(diffs.dU, 60);

  return {
    method: {
      retainedDtCheck: "exact 1 s share of consecutive I1-retained TIME steps",
      fft: "Hann-windowed periodogram of research-only series; dt = 1 s",
      interpolation:
        "linear interpolation of U/V onto integer-second grid spanning first..last kept TIME, solely for spectral diagnostics; never written back",
      firstDifferences: "only consecutive retained pairs with Δt exactly 1 s; no interpolation",
      backgrounds: [
        "first differences ΔU/ΔV",
        "linear detrend of interpolated U/V",
        "residual after centered 31-s moving average (~30 s)",
        "residual after centered 61-s moving average (~60 s)",
      ],
      welch: "256 s windows, 50% overlap, 30 s MA residual",
      windowedPersistence: "256 s windows, 50% overlap, 6–20 s band peak tracking",
    },
    interpolation: {
      nGrid: grid.u.length,
      observedShare: round(grid.observedShare, 4),
      filledShare: round(1 - grid.observedShare, 4),
      t0: grid.t0,
      t1: grid.t1,
    },
    firstDifferenceStats: {
      nExact1sPairs: diffs.dU.length,
      dU: roundSummary(summarize(diffs.dU)),
      dV: roundSummary(summarize(diffs.dV)),
      residualSpeed: roundSummary(summarize(diffs.mag)),
    },
    residual30sStats: {
      u: roundSummary(summarize(uRes30)),
      v: roundSummary(summarize(vRes30)),
      mag: roundSummary(summarize(magRes30)),
    },
    peaks: {
      firstDiffU: peakTable(specDiffU, "dU"),
      firstDiffV: peakTable(specDiffV, "dV"),
      detrendU: peakTable(specDetU, "U-detrend"),
      detrendV: peakTable(specDetV, "V-detrend"),
      residual30sU: peakTable(specRes30U, "U-res30"),
      residual30sV: peakTable(specRes30V, "V-res30"),
      residual60sU: peakTable(specRes60U, "U-res60"),
      residual60sV: peakTable(specRes60V, "V-res60"),
      residual30sMag: peakTable(specMag30, "|res30|"),
      welchU: peakTable(welchU.bins, "welch-U-res30"),
      welchV: peakTable(welchV.bins, "welch-V-res30"),
    },
    welchWindows: { u: welchU.nWindows, v: welchV.nWindows, windowLen: 256 },
    autocorrFirstPositivePeak: {
      uRes30: firstPositiveAutocorrPeak(acfU),
      vRes30: firstPositiveAutocorrPeak(acfV),
      dU: firstPositiveAutocorrPeak(acfDU),
    },
    persistence6to20s: {
      uRes30: windowedPeakPersistence(uRes30, 1, 256, 6, 20),
      vRes30: windowedPeakPersistence(vRes30, 1, 256, 6, 20),
    },
    halfFlight6to20s: {
      uRes30: halfFlightPeaks(uRes30, 1, "U-res30"),
      vRes30: halfFlightPeaks(vRes30, 1, "V-res30"),
    },
    plotSeries: {
      times: grid.times,
      uRes30,
      vRes30,
      specRes30U,
      specRes30V,
      specWelchU: welchU.bins,
      specWelchV: welchV.bins,
    },
  };
}

function dominantCandidates(spectral) {
  const pools = [
    spectral.peaks.residual30sU.band6to20s[0],
    spectral.peaks.residual30sV.band6to20s[0],
    spectral.peaks.welchU.band6to20s[0],
    spectral.peaks.welchV.band6to20s[0],
    spectral.peaks.firstDiffU.band6to20s[0],
    spectral.peaks.firstDiffV.band6to20s[0],
  ].filter(Boolean);
  const byPeriod = new Map();
  for (const peak of pools) {
    const key = String(round(peak.period, 1));
    const prev = byPeriod.get(key) ?? { period: peak.period, hits: 0, maxProminence: 0 };
    prev.hits += 1;
    prev.maxProminence = Math.max(prev.maxProminence, peak.prominence ?? 0);
    byPeriod.set(key, prev);
  }
  return [...byPeriod.values()].sort((a, b) => b.hits - a.hits || b.maxProminence - a.maxProminence);
}

function verticalScales(ascentRate, periods) {
  const med = ascentRate.median;
  const p10 = ascentRate.p10;
  const p90 = ascentRate.p90;
  if (med == null) return [];
  return periods.map((p) => ({
    periodS: p,
    lambdaZMedianM: round(med * p, 1),
    lambdaZp10M: p10 == null ? null : round(p10 * p, 1),
    lambdaZp90M: p90 == null ? null : round(p90 * p, 1),
  }));
}

function escToSvg(points, width, height, xMin, xMax, yMin, yMax) {
  if (points.length === 0) return "";
  const sx = (x) => ((x - xMin) / (xMax - xMin || 1)) * (width - 48) + 36;
  const sy = (y) => height - 28 - ((y - yMin) / (yMax - yMin || 1)) * (height - 48);
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
    .join(" ");
}

function svgFrame(title, paths, width = 720, height = 280) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f7f4ee"/>
  <text x="16" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" fill="#222">${escapeXml(title)}</text>
  ${paths}
</svg>
`;
}

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function writeAltitudeTimeSvg(id, kept, phase, path) {
  const pts = kept.map((k) => ({ x: k.time, y: k.alt }));
  const xMin = pts[0].x;
  const xMax = pts[pts.length - 1].x;
  const yMin = Math.min(...pts.map((p) => p.y));
  const yMax = Math.max(...pts.map((p) => p.y));
  const d = escToSvg(pts, 720, 280, xMin, xMax, yMin, yMax);
  const maxX = ((phase.maximumAltitude.time - xMin) / (xMax - xMin || 1)) * (720 - 48) + 36;
  const body = `
  <path d="${d}" fill="none" stroke="#1f4e79" stroke-width="1.2"/>
  <line x1="${maxX.toFixed(1)}" x2="${maxX.toFixed(1)}" y1="24" y2="252" stroke="#b33" stroke-dasharray="4 3"/>
  <text x="36" y="270" font-size="10" font-family="ui-sans-serif, system-ui, sans-serif" fill="#444">time s; red dashed = native max Alt</text>`;
  writeFileSync(path, svgFrame(`${id} altitude vs TIME (I1-retained)`, body));
}

function downsample(points, n) {
  if (points.length <= n) return points;
  const out = [];
  const step = (points.length - 1) / (n - 1);
  for (let i = 0; i < n; i++) out.push(points[Math.round(i * step)]);
  return out;
}

function writeResidualSvg(id, spectral, path) {
  const ptsU = downsample(
    spectral.plotSeries.times.map((t, i) => ({ x: t, y: spectral.plotSeries.uRes30[i] })),
    1200,
  );
  const ptsV = downsample(
    spectral.plotSeries.times.map((t, i) => ({ x: t, y: spectral.plotSeries.vRes30[i] })),
    1200,
  );
  const ys = [...ptsU, ...ptsV].map((p) => p.y);
  const xMin = ptsU[0].x;
  const xMax = ptsU[ptsU.length - 1].x;
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const dU = escToSvg(ptsU, 720, 280, xMin, xMax, yMin, yMax);
  const dV = escToSvg(ptsV, 720, 280, xMin, xMax, yMin, yMax);
  const body = `
  <path d="${dU}" fill="none" stroke="#1f4e79" stroke-width="0.9"/>
  <path d="${dV}" fill="none" stroke="#b35c1f" stroke-width="0.9"/>
  <text x="36" y="270" font-size="10" font-family="ui-sans-serif, system-ui, sans-serif" fill="#444">blue U residual, orange V residual; 31-s MA background removed; research-only</text>`;
  writeFileSync(path, svgFrame(`${id} U/V residual after ~30 s MA (research-only)`, body));
}

function writePeriodogramSvg(id, spectral, path) {
  const u = spectral.plotSeries.specWelchU.filter((b) => b.period >= 4 && b.period <= 60);
  const v = spectral.plotSeries.specWelchV.filter((b) => b.period >= 4 && b.period <= 60);
  const ptsU = u.map((b) => ({ x: b.period, y: b.power }));
  const ptsV = v.map((b) => ({ x: b.period, y: b.power }));
  const ys = [...ptsU, ...ptsV].map((p) => p.y);
  const yMax = Math.max(...ys, 1e-12);
  const dU = escToSvg(ptsU, 720, 280, 4, 60, 0, yMax);
  const dV = escToSvg(ptsV, 720, 280, 4, 60, 0, yMax);
  const body = `
  <path d="${dU}" fill="none" stroke="#1f4e79" stroke-width="1.2"/>
  <path d="${dV}" fill="none" stroke="#b35c1f" stroke-width="1.2"/>
  <text x="36" y="270" font-size="10" font-family="ui-sans-serif, system-ui, sans-serif" fill="#444">Welch PSD of 30 s MA residual; x = period s (4–60); blue U, orange V</text>`;
  writeFileSync(path, svgFrame(`${id} Welch periodogram U/V residual (research-only)`, body));
}

function writeOverlayPeriodogramSvg(results, path) {
  const colors = { goshen: "#1f4e79", prospect: "#2a7f4f", dumas: "#b35c1f" };
  const series = results.map((r) => {
    const bins = r.spectral.plotSeries.specWelchU.filter((b) => b.period >= 4 && b.period <= 60);
    const maxP = Math.max(...bins.map((b) => b.power), 1e-12);
    return {
      id: r.id,
      pts: bins.map((b) => ({ x: b.period, y: b.power / maxP })),
    };
  });
  const paths = series
    .map(
      (s) =>
        `<path d="${escToSvg(s.pts, 720, 280, 4, 60, 0, 1)}" fill="none" stroke="${colors[s.id]}" stroke-width="1.3"/>`,
    )
    .join("\n  ");
  const body = `
  ${paths}
  <text x="36" y="270" font-size="10" font-family="ui-sans-serif, system-ui, sans-serif" fill="#444">normalized Welch U-residual PSD; blue Goshen, green Prospect, orange Dumas</text>`;
  writeFileSync(path, svgFrame("Cross-sounding Welch U residual periodogram (research-only)", body));
}

function pendulumPeriods() {
  const lengths = [20, 30, 40, 55];
  return lengths.map((L) => ({
    lengthM: L,
    simplePendulumPeriodS: round(2 * Math.PI * Math.sqrt(L / G), 2),
    note:
      L === 30
        ? "Dirksen et al. 2014 mention ~30 m RS92 unwinder in a ventilation estimate"
        : L === 55
          ? "RS41 Vaisala unwinder; DO NOT transfer to RS92 without qualification"
          : "plausible radiosonde train length, not a VORTEX2 measured length",
  }));
}

function mooreControl() {
  if (!existsSync(MOORE_GOLDEN)) return { present: false };
  const golden = JSON.parse(readFileSync(MOORE_GOLDEN, "utf8"));
  const levels = golden.levels;
  const dH = [];
  const dU = [];
  const dV = [];
  const mag = [];
  for (let i = 1; i < levels.length; i++) {
    dH.push(levels[i].height - levels[i - 1].height);
    const du = levels[i].eastward - levels[i - 1].eastward;
    const dv = levels[i].northward - levels[i - 1].northward;
    dU.push(du);
    dV.push(dv);
    mag.push(Math.hypot(du, dv));
  }
  return {
    present: true,
    note: "IGRA operational/coarse control. No ESC 1-s TIME. Do not apply RS92/Aspen assumptions. Absence of hodograph hair is not evidence of absence of pendulation; high-frequency content is unresolved.",
    nLevels: levels.length,
    dHeight: roundSummary(summarize(dH)),
    consecutiveDU: roundSummary(summarize(dU.map(Math.abs))),
    consecutiveDV: roundSummary(summarize(dV.map(Math.abs))),
    consecutiveSpeedJump: roundSummary(summarize(mag)),
    nyquist: "no uniform 1-s series; periods near 10 s are not observable",
  };
}

function classifyFlightPhase(phase) {
  if (phase.postMaxUsableWouldBreakStrictlyIncreasing > 0) {
    return "POSSIBLE CONTAMINATION / BLOCKER";
  }
  if (phase.postMaxNativeCount === 0 || phase.maximumAltitude.isLastNativeRecord) {
    return "CLEAN ASCENT";
  }
  if (phase.postMaxUsableI1Count === 0) {
    return "DESCENT PRESENT BUT EXCLUDED";
  }
  if (phase.postMaxValidAltCount > 0 && phase.persistentlyDecreasingAfterMax) {
    return "DESCENT PRESENT BUT EXCLUDED";
  }
  return "CLEAN ASCENT";
}

function pickReportPeriod(spectral) {
  const ranked = dominantCandidates(spectral);
  return ranked[0] ?? null;
}

function stripPlotSeries(spectral) {
  const { plotSeries, ...rest } = spectral;
  return rest;
}

const missing = CASES.filter((c) => !existsSync(c.path));
if (missing.length) {
  throw new Error(
    `native ESC missing: ${missing.map((c) => c.path).join("; ")}. Research sampler requires gitignored data/ copies.`,
  );
}

mkdirSync(artifactsDir, { recursive: true });

const results = [];
for (const spec of CASES) {
  const blocks = parseEscConcatenated(readFileSync(spec.path, "utf8"));
  const block = findBlock(blocks, spec);
  const phase = flightPhaseAudit(block.records);
  const { kept, dropped } = retainI1(block, spec);
  const golden = JSON.parse(readFileSync(spec.goldenPath, "utf8"));
  const goldenCmp = compareGolden(kept, golden, spec);
  const sampling = samplingAndAscent(kept);
  const spectral = spectralAudit(kept);
  const ranked = dominantCandidates(spectral);
  const candidatePeriods = ranked.slice(0, 4).map((r) => r.period);
  const scales = verticalScales(sampling.ascentRate, candidatePeriods);
  const flightClass = classifyFlightPhase(phase);

  writeAltitudeTimeSvg(
    spec.id,
    kept,
    phase,
    join(artifactsDir, `esc-${spec.id}-altitude-time.svg`),
  );
  writeResidualSvg(
    spec.id,
    spectral,
    join(artifactsDir, `esc-${spec.id}-uv-residual-30s.svg`),
  );
  writePeriodogramSvg(
    spec.id,
    spectral,
    join(artifactsDir, `esc-${spec.id}-welch-periodogram.svg`),
  );

  if (!goldenCmp.exactMatch) {
    throw new Error(
      `${spec.id}: I1-retained column does not exactly match production golden. ${JSON.stringify(goldenCmp.mismatches.slice(0, 3))}`,
    );
  }
  if (flightClass === "POSSIBLE CONTAMINATION / BLOCKER") {
    console.error(`BLOCKER: ${spec.id} has I1-usable post-max records that would break strictly increasing height`);
  }

  results.push({
    id: spec.id,
    label: spec.label,
    identity: {
      siteId: block.header.siteId,
      utcReleaseTime: block.header.utcReleaseTime,
      dataType: block.header.dataType,
      sonde: block.header.sonde,
      postProcessing: block.header.postProcessing,
      comments: block.header.comments,
      launchElevation: block.header.launchElevation,
    },
    flightPhaseClass: flightClass,
    flightPhase: phase,
    nativeVsRetainedVsGolden: {
      nativeRecords: block.records.length,
      i1Dropped: dropped.length,
      i1Kept: kept.length,
      productionGolden: goldenCmp,
      postMaxNative: phase.postMaxNativeCount,
      postMaxI1Usable: phase.postMaxUsableI1Count,
      postMaxI1UsableWouldEnterProduction: phase.postMaxUsableWouldBreakStrictlyIncreasing > 0,
    },
    sampling,
    spectral: { ...spectral, rankedCandidates: ranked },
    verticalScales: scales,
    reportedCandidate: pickReportPeriod(spectral),
  });
}

writeOverlayPeriodogramSvg(
  results,
  join(artifactsDir, "esc-three-sounding-welch-u-overlay.svg"),
);

const summary = {
  generatedAt: "2026-08-28",
  purpose:
    "Research-only qualification of ESC flight phase and high-frequency U/V structure. Not an Analysis operator. Not a production filter.",
  dropPolicy:
    "I1 isUsableWindRecord: drop missing U or V (9999), Qu/Qv MISSING(9) or BAD(3), missing Alt (99999). Native order preserved. Heights must be strictly increasing after drop.",
  pendulumLengthTable: pendulumPeriods(),
  mooreControl: mooreControl(),
  soundings: results.map((r) => ({
    id: r.id,
    label: r.label,
    identity: r.identity,
    flightPhaseClass: r.flightPhaseClass,
    flightPhase: r.flightPhase,
    nativeVsRetainedVsGolden: r.nativeVsRetainedVsGolden,
    sampling: r.sampling,
    spectral: stripPlotSeries(r.spectral),
    verticalScales: r.verticalScales,
    reportedCandidate: r.reportedCandidate,
  })),
};

const summaryPath = join(
  artifactsDir,
  "esc-flight-phase-and-high-frequency-wind-audit-summary.json",
);
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

const consoleReport = {
  checks: results.map((r) => ({
    id: r.id,
    flightPhaseClass: r.flightPhaseClass,
    native: r.nativeVsRetainedVsGolden.nativeRecords,
    kept: r.nativeVsRetainedVsGolden.i1Kept,
    goldenMatch: r.nativeVsRetainedVsGolden.productionGolden.exactMatch,
    postMaxNative: r.flightPhase.postMaxNativeCount,
    postMaxI1Usable: r.flightPhase.postMaxUsableI1Count,
    maxIsLast: r.flightPhase.maximumAltitude.isLastNativeRecord,
    maxAlt: r.flightPhase.maximumAltitude.alt,
    lastAlt: r.flightPhase.lastNative.alt,
    dtMedian: r.sampling.time.delta.median,
    exact1sShare: r.sampling.time.exact1sShare,
    ascentMedian: r.sampling.ascentRate.median,
    ascentP10: r.sampling.ascentRate.p10,
    ascentP90: r.sampling.ascentRate.p90,
    candidate: r.reportedCandidate,
    ranked: r.spectral.rankedCandidates.slice(0, 4),
    verticalScales: r.verticalScales,
    persistU: {
      medianTopPeriodS: r.spectral.persistence6to20s.uRes30.medianTopPeriodS,
      fraction: r.spectral.persistence6to20s.uRes30.fractionWithin20pctOfMedian,
    },
    persistV: {
      medianTopPeriodS: r.spectral.persistence6to20s.vRes30.medianTopPeriodS,
      fraction: r.spectral.persistence6to20s.vRes30.fractionWithin20pctOfMedian,
    },
    autocorr: r.spectral.autocorrFirstPositivePeak,
    interpFilledShare: r.spectral.interpolation.filledShare,
    halfU: r.spectral.halfFlight6to20s.uRes30,
    halfV: r.spectral.halfFlight6to20s.vRes30,
  })),
  moore: summary.mooreControl,
};
console.log(JSON.stringify(consoleReport, null, 2));
