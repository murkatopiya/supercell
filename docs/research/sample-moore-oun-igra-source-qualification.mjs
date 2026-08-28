/**
 * Research-only Moore / OUN IGRA source-qualification sampler.
 * Not a production adapter. Reads gitignored data/Moore bytes.
 */
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const dataPath = join(root, "data/Moore/USM00072357-data.txt");
const artifactsDir = join(here, "artifacts");

const MISSING = -9999;
const QA_REMOVED = -8888;

function parseHeader(line) {
  return {
    raw: line,
    headrec: line.slice(0, 1),
    id: line.slice(1, 12).trim(),
    year: Number(line.slice(13, 17)),
    month: Number(line.slice(18, 20)),
    day: Number(line.slice(21, 23)),
    hour: Number(line.slice(24, 26)),
    reltime: Number(line.slice(27, 31)),
    numlev: Number(line.slice(32, 36)),
    pSrc: line.slice(37, 45).trim(),
    npSrc: line.slice(46, 54).trim(),
    latRaw: Number(line.slice(55, 62)),
    lonRaw: Number(line.slice(63, 71)),
    lat: Number(line.slice(55, 62)) / 10000,
    lon: Number(line.slice(63, 71)) / 10000,
  };
}

function parseLevel(line) {
  const wdir = Number(line.slice(40, 45));
  const wspd = Number(line.slice(46, 51));
  const gph = Number(line.slice(16, 21));
  const press = Number(line.slice(9, 15));
  const etime = Number(line.slice(3, 8));
  return {
    raw: line,
    lvltyp1: Number(line.slice(0, 1)),
    lvltyp2: Number(line.slice(1, 2)),
    etime,
    press,
    pflag: line.slice(15, 16),
    gph,
    zflag: line.slice(21, 22),
    temp: Number(line.slice(22, 27)),
    tflag: line.slice(27, 28),
    rh: Number(line.slice(28, 33)),
    dpdp: Number(line.slice(34, 39)),
    wdir,
    wspd,
  };
}

function isPresent(value) {
  return value !== MISSING && value !== QA_REMOVED;
}

function lvltyp1Name(v) {
  return { 1: "standard-pressure", 2: "other-pressure", 3: "non-pressure" }[v] ?? String(v);
}

function lvltyp2Name(v) {
  return { 1: "surface", 2: "tropopause", 0: "other" }[v] ?? String(v);
}

function etimeLabel(etime) {
  if (etime === MISSING) return "missing-9999";
  if (etime === QA_REMOVED) return "qa-removed-8888";
  const abs = Math.abs(etime);
  const mm = Math.floor(abs / 100);
  const ss = abs % 100;
  return `${etime < 0 ? "-" : ""}${mm}:${String(ss).padStart(2, "0")}`;
}

function metToEastNorth(dirDeg, speedTenths) {
  const speed = speedTenths / 10;
  const rad = (dirDeg * Math.PI) / 180;
  return {
    speed,
    eastward: -speed * Math.sin(rad),
    northward: -speed * Math.cos(rad),
  };
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function round(value, digits = 1) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function countBy(arr, fn) {
  const map = new Map();
  for (const item of arr) {
    const key = fn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Object.fromEntries([...map.entries()].sort((a, b) => a[0].localeCompare(String(b[0]))));
}

function auditSounding(header, levels, stationElev) {
  const cats = {
    A_validGph: 0,
    B_noGphWithPressure: 0,
    C_nonPressure: 0,
    D_surface: 0,
    E_has8888: 0,
    F_has9999: 0,
    usableWindDir: 0,
    usableWindSpd: 0,
    usableWindBoth: 0,
    usableGph: 0,
    usableWindAndGph: 0,
  };

  const dropped = [];
  const kept = [];

  for (const level of levels) {
    const hasGph = isPresent(level.gph);
    const hasP = isPresent(level.press);
    const hasDir = isPresent(level.wdir);
    const hasSpd = isPresent(level.wspd);
    const has8888 = [level.etime, level.press, level.gph, level.wdir, level.wspd].includes(QA_REMOVED);
    const has9999 = [level.etime, level.press, level.gph, level.wdir, level.wspd].includes(MISSING);

    if (hasGph) cats.A_validGph += 1;
    if (!hasGph && hasP) cats.B_noGphWithPressure += 1;
    if (level.lvltyp1 === 3) cats.C_nonPressure += 1;
    if (level.lvltyp2 === 1) cats.D_surface += 1;
    if (has8888) cats.E_has8888 += 1;
    if (has9999) cats.F_has9999 += 1;
    if (hasDir) cats.usableWindDir += 1;
    if (hasSpd) cats.usableWindSpd += 1;
    if (hasDir && hasSpd) cats.usableWindBoth += 1;
    if (hasGph) cats.usableGph += 1;

    const dropReasons = [];
    if (!(hasDir && hasSpd)) dropReasons.push("missing-or-qa-removed-wind");
    if (!hasGph) dropReasons.push("missing-or-qa-removed-gph");

    if (dropReasons.length === 0) {
      cats.usableWindAndGph += 1;
      const uv = metToEastNorth(level.wdir, level.wspd);
      const worldY = level.gph - stationElev;
      kept.push({
        lvltyp1: lvltyp1Name(level.lvltyp1),
        lvltyp2: lvltyp2Name(level.lvltyp2),
        etime: level.etime,
        etimeLabel: etimeLabel(level.etime),
        pressPa: level.press,
        gph: level.gph,
        worldY,
        wdir: level.wdir,
        wspdTenths: level.wspd,
        ...uv,
        pflag: level.pflag,
        zflag: level.zflag,
      });
    } else {
      dropped.push({
        lvltyp1: lvltyp1Name(level.lvltyp1),
        lvltyp2: lvltyp2Name(level.lvltyp2),
        etime: level.etime,
        press: level.press,
        gph: level.gph,
        wdir: level.wdir,
        wspd: level.wspd,
        reasons: dropReasons,
        has8888,
        has9999,
      });
    }
  }

  const dropReasonCounts = countBy(dropped, (d) => d.reasons.join("+"));
  const dropTypeCounts = countBy(dropped, (d) => `${d.lvltyp1}/${d.lvltyp2}`);
  const keptTypeCounts = countBy(kept, (d) => `${d.lvltyp1}/${d.lvltyp2}`);

  let decreasing = 0;
  let duplicate = 0;
  const dY = [];
  const inversions = [];
  const gaps50 = [];
  const gaps100 = [];
  const gaps250 = [];
  for (let i = 1; i < kept.length; i++) {
    const delta = kept[i].worldY - kept[i - 1].worldY;
    dY.push(delta);
    if (delta < 0) decreasing += 1;
    if (delta === 0) duplicate += 1;
    const rec = {
      from: kept[i - 1].worldY,
      to: kept[i].worldY,
      delta,
      fromGph: kept[i - 1].gph,
      toGph: kept[i].gph,
      fromEtime: kept[i - 1].etimeLabel,
      toEtime: kept[i].etimeLabel,
      fromType: `${kept[i - 1].lvltyp1}/${kept[i - 1].lvltyp2}`,
      toType: `${kept[i].lvltyp1}/${kept[i].lvltyp2}`,
    };
    if (delta < 0) inversions.push(rec);
    if (delta > 50) gaps50.push(rec);
    if (delta > 100) gaps100.push(rec);
    if (delta > 250) gaps250.push(rec);
  }
  const dYSorted = [...dY].sort((a, b) => a - b);

  const inBand = (lo, hi) => kept.filter((k) => k.worldY >= lo && k.worldY <= hi).length;

  const etimePresent = levels.filter((l) => isPresent(l.etime)).length;
  const uniqueDirs = new Set(kept.map((k) => k.wdir));
  const uniqueSpd = new Set(kept.map((k) => k.wspdTenths));

  const surfaceLevels = levels.filter((l) => l.lvltyp2 === 1);
  const firstKept = kept[0] ?? null;
  const lastKept = kept[kept.length - 1] ?? null;

  return {
    header,
    stationElevUsed: stationElev,
    nativeNumlev: header.numlev,
    parsedLevels: levels.length,
    categories: cats,
    kept: {
      n: kept.length,
      typeCounts: keptTypeCounts,
      minWorldY: firstKept?.worldY ?? null,
      maxWorldY: lastKept?.worldY ?? null,
      first: firstKept,
      last: lastKept,
      n0to200: inBand(0, 200),
      n0to500: inBand(0, 500),
      n0to1000: inBand(0, 1000),
      n0to3000: inBand(0, 3000),
      n0to6000: inBand(0, 6000),
      nBelow0: kept.filter((k) => k.worldY < 0).length,
    },
    dropped: {
      n: dropped.length,
      reasonCounts: dropReasonCounts,
      typeCounts: dropTypeCounts,
      samplesMissingGphWithWind: dropped
        .filter((d) => d.reasons.includes("missing-or-qa-removed-gph") && isPresent(d.wdir) && isPresent(d.wspd))
        .slice(0, 8),
      samplesMissingWindWithGph: dropped
        .filter((d) => d.reasons.includes("missing-or-qa-removed-wind") && isPresent(d.gph))
        .slice(0, 8),
    },
    dY: {
      n: dY.length,
      min: dYSorted[0] ?? null,
      p10: percentile(dYSorted, 0.1),
      median: percentile(dYSorted, 0.5),
      p90: percentile(dYSorted, 0.9),
      max: dYSorted[dYSorted.length - 1] ?? null,
      decreasing,
      inversions,
      duplicate,
      gapsOver50: gaps50,
      gapsOver100: gaps100,
      gapsOver250: gaps250,
    },
    sortedByGphIfNamed: (() => {
      const sorted = [...kept].sort((a, b) => a.worldY - b.worldY);
      const ds = [];
      for (let i = 1; i < sorted.length; i++) ds.push(sorted[i].worldY - sorted[i - 1].worldY);
      const ss = [...ds].sort((a, b) => a - b);
      return {
        note: "NOT an accepted adapter step; diagnostic only",
        minWorldY: sorted[0]?.worldY ?? null,
        maxWorldY: sorted[sorted.length - 1]?.worldY ?? null,
        dYmin: ss[0] ?? null,
        dYp10: percentile(ss, 0.1),
        dYmedian: percentile(ss, 0.5),
        dYp90: percentile(ss, 0.9),
        dYmax: ss[ss.length - 1] ?? null,
        nEqualAfterSort: ds.filter((d) => d === 0).length,
        nNegativeAfterSort: ds.filter((d) => d < 0).length,
        gapsOver50: ds.filter((d) => d > 50).length,
        gapsOver100: ds.filter((d) => d > 100).length,
        gapsOver250: ds.filter((d) => d > 250).length,
        n0to200: sorted.filter((k) => k.worldY >= 0 && k.worldY <= 200).length,
        n0to500: sorted.filter((k) => k.worldY >= 0 && k.worldY <= 500).length,
        n0to1000: sorted.filter((k) => k.worldY >= 0 && k.worldY <= 1000).length,
        n0to3000: sorted.filter((k) => k.worldY >= 0 && k.worldY <= 3000).length,
        n0to6000: sorted.filter((k) => k.worldY >= 0 && k.worldY <= 6000).length,
      };
    })(),
    etime: {
      present: etimePresent,
      missing9999: levels.filter((l) => l.etime === MISSING).length,
      qaRemoved8888: levels.filter((l) => l.etime === QA_REMOVED).length,
      notOnAllLevels: etimePresent !== levels.length,
    },
    resolution: {
      wdirIntegerDegrees: true,
      wspdTenthsMs: true,
      uniqueWdirKept: uniqueDirs.size,
      uniqueWspdTenthsKept: uniqueSpd.size,
    },
    surface: surfaceLevels.map((l) => ({
      lvltyp1: lvltyp1Name(l.lvltyp1),
      etime: l.etime,
      press: l.press,
      gph: l.gph,
      wdir: l.wdir,
      wspd: l.wspd,
      worldYIfElev: isPresent(l.gph) ? l.gph - stationElev : null,
    })),
    lowLevelKept: kept.filter((k) => k.worldY <= 500).map((k) => ({
      worldY: k.worldY,
      gph: k.gph,
      wdir: k.wdir,
      speed: round(k.speed, 1),
      eastward: round(k.eastward, 2),
      northward: round(k.northward, 2),
      etimeLabel: k.etimeLabel,
      type: `${k.lvltyp1}/${k.lvltyp2}`,
    })),
  };
}

const neighbors = [];
let target = null;
let current = null;

const rl = createInterface({
  input: createReadStream(dataPath, { encoding: "utf8" }),
  crlfDelay: Infinity,
});

for await (const line of rl) {
  if (line.startsWith("#")) {
    if (current && current.header.year === 2013 && current.header.month === 5 && current.header.day === 20) {
      neighbors.push({
        hour: current.header.hour,
        reltime: current.header.reltime,
        numlev: current.header.numlev,
        pSrc: current.header.pSrc,
        npSrc: current.header.npSrc,
        lat: current.header.lat,
        lon: current.header.lon,
        nParsed: current.levels.length,
      });
      if (current.header.hour === 17 && current.header.reltime === 1651) {
        target = current;
      }
    }
    current = { header: parseHeader(line), levels: [] };
  } else if (current) {
    current.levels.push(parseLevel(line));
  }
}
if (current && current.header.year === 2013 && current.header.month === 5 && current.header.day === 20) {
  neighbors.push({
    hour: current.header.hour,
    reltime: current.header.reltime,
    numlev: current.header.numlev,
    pSrc: current.header.pSrc,
    npSrc: current.header.npSrc,
    lat: current.header.lat,
    lon: current.header.lon,
    nParsed: current.levels.length,
  });
  if (current.header.hour === 17 && current.header.reltime === 1651) {
    target = current;
  }
}

if (!target) {
  throw new Error("target sounding 2013-05-20 hour=17 reltime=1651 not found");
}

const STATION_ELEV_CANDIDATE = 345;
const audit345 = auditSounding(target.header, target.levels, STATION_ELEV_CANDIDATE);

const dYCompact = {
  n: audit345.dY.n,
  min: audit345.dY.min,
  p10: audit345.dY.p10,
  median: audit345.dY.median,
  p90: audit345.dY.p90,
  max: audit345.dY.max,
  decreasing: audit345.dY.decreasing,
  duplicate: audit345.dY.duplicate,
  inversions: audit345.dY.inversions,
  gapsOver50Count: audit345.dY.gapsOver50.length,
  gapsOver100Count: audit345.dY.gapsOver100.length,
  gapsOver250Count: audit345.dY.gapsOver250.length,
};

const summary = {
  file: "data/Moore/USM00072357-data.txt",
  formatSourceOfRecord: "data/Moore/igra2-data-format.txt (IGRA v2.2, 19 January 2023)",
  stationList: {
    source: "https://www.ncei.noaa.gov/pub/data/igra/igra2-station-list.txt",
    line: "USM00072357 35.1808 -97.4378 344.9 OK NORMAN/MAX WESTHEIMER A; OK. 1974 2026 28199",
    elevationM: 344.9,
    name: "NORMAN/MAX WESTHEIMER A; OK.",
    firstYear: 1974,
    lastYear: 2026,
  },
  neighborsOn20130520: neighbors,
  adjacentHeadersNotSelected: [
    {
      date: "2013-05-21",
      hour: 0,
      reltime: 2304,
      numlev: 167,
      pSrc: "ncdc6301",
      npSrc: "ncdc6301",
      note: "next calendar-day header; not selected",
    },
    {
      date: "2013-05-21",
      hour: 12,
      reltime: 1200,
      numlev: 191,
      pSrc: "ncdc6301",
      npSrc: "ncdc6301",
      note: "next calendar-day header; not selected",
    },
  ],
  targetHeaderRaw: target.header.raw,
  targetHeader: target.header,
  auditStationElev345: {
    header: audit345.header,
    stationElevUsed: audit345.stationElevUsed,
    nativeNumlev: audit345.nativeNumlev,
    parsedLevels: audit345.parsedLevels,
    categories: audit345.categories,
    kept: audit345.kept,
    dropped: audit345.dropped,
    dY: dYCompact,
    sortedByGphIfNamed: audit345.sortedByGphIfNamed,
    etime: audit345.etime,
    resolution: audit345.resolution,
    surface: audit345.surface,
    lowLevelKept: audit345.lowLevelKept,
  },
};

mkdirSync(artifactsDir, { recursive: true });
writeFileSync(
  join(artifactsDir, "moore-oun-igra-source-qualification-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      neighbors: neighbors,
      header: target.header,
      headerRaw: target.header.raw,
      numlevMatch: target.header.numlev === target.levels.length,
      categories: audit345.categories,
      kept: {
        n: audit345.kept.n,
        typeCounts: audit345.kept.typeCounts,
        minWorldY: audit345.kept.minWorldY,
        maxWorldY: audit345.kept.maxWorldY,
        n0to200: audit345.kept.n0to200,
        n0to500: audit345.kept.n0to500,
        n0to1000: audit345.kept.n0to1000,
        n0to3000: audit345.kept.n0to3000,
        n0to6000: audit345.kept.n0to6000,
      },
      dropped: { n: audit345.dropped.n, reasonCounts: audit345.dropped.reasonCounts },
      dY: dYCompact,
      sortedByGphIfNamed: audit345.sortedByGphIfNamed,
      etime: audit345.etime,
      resolution: audit345.resolution,
      surface: audit345.surface,
      lowLevelKept: audit345.lowLevelKept,
    },
    null,
    2,
  ),
);
