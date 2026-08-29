/**
 * Research-only Goshen 2155 hodograph reproduction sampler.
 * Not a production API. Not imported by composition, labs, or renderer.
 * Does not modify the committed golden or DEMO storm motion.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nssl1Goshen2155Record } from "../../src/data/eolNsslMgausEsc/toEnvironmentalWindProfileRecord.js";
import goldenJson from "../../src/data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json";
import type { GoshenNormalizedGolden } from "../../src/data/eolNsslMgausEsc/types.js";
import { EnvironmentalWindProfile } from "../../src/physics/environment/EnvironmentalWindProfile.js";
import { hodographPoints } from "../../src/physics/environment/hodograph.js";
import { horizontalVorticityFromShear } from "../../src/physics/environment/horizontalVorticity.js";
import { stormRelativeHelicityBetween } from "../../src/physics/environment/stormRelativeHelicity.js";
import { verticalWindShearBetween } from "../../src/physics/environment/verticalWindShear.js";
import { soundingSegmentContainingHeight } from "../../src/physics/diagnostics/DiagnosticTiltingTendency.js";

const here = dirname(fileURLToPath(import.meta.url));
const artifactsDir = join(here, "artifacts");

/** Markowski et al. (2012) Part I Fig. 2b published observed storm motion. */
const PUBLISHED_C = { eastward: 10.5, northward: -1.3 } as const;
const DEMO_C = { eastward: 10, northward: 0 } as const;

type WindLevel = { height: number; eastward: number; northward: number };

function round(value: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function hypot2(east: number, north: number): number {
  return Math.hypot(east, north);
}

function nearestLevel(levels: readonly WindLevel[], height: number): WindLevel {
  return levels.reduce((best, level) =>
    Math.abs(level.height - height) < Math.abs(best.height - height)
      ? level
      : best,
  );
}

function profileFromLevels(levels: readonly WindLevel[]): EnvironmentalWindProfile {
  return new EnvironmentalWindProfile(
    levels.map((level) => ({
      height: level.height,
      velocity: {
        eastward: level.eastward,
        northward: level.northward,
        vertical: 0,
      },
    })),
  );
}

function bulkWindDifference(
  profile: EnvironmentalWindProfile,
  h0: number,
  h1: number,
): {
  deltaEastward: number;
  deltaNorthward: number;
  magnitude: number;
} {
  const v0 = profile.sampleAtHeight(h0);
  const v1 = profile.sampleAtHeight(h1);
  const deltaEastward = v1.eastward - v0.eastward;
  const deltaNorthward = v1.northward - v0.northward;
  return {
    deltaEastward,
    deltaNorthward,
    magnitude: hypot2(deltaEastward, deltaNorthward),
  };
}

function layerDiagnostics(
  profile: EnvironmentalWindProfile,
  h0: number,
  h1: number,
  stormMotion: { eastward: number; northward: number },
) {
  const srh = stormRelativeHelicityBetween(profile, stormMotion, h0, h1).srh;
  const bwd = bulkWindDifference(profile, h0, h1);
  const shear = verticalWindShearBetween(profile, h0, h1);
  const vorticity = horizontalVorticityFromShear(shear);
  return {
    h0,
    h1,
    srh,
    bulkWindDifferenceEastward: bwd.deltaEastward,
    bulkWindDifferenceNorthward: bwd.deltaNorthward,
    bulkWindDifferenceMagnitude: bwd.magnitude,
    shearEastward: shear.shearEastward,
    shearNorthward: shear.shearNorthward,
    omegaEastward: vorticity.omegaEastward,
    omegaNorthward: vorticity.omegaNorthward,
    omegaMagnitude: hypot2(vorticity.omegaEastward, vorticity.omegaNorthward),
  };
}

/**
 * Two-way 1-2-1 (Hanning) at a given index stride.
 * Interior points only. Endpoints inside `stride` are unchanged.
 * CEDRIC: Leise NSTEP=1 ≈ two-way Hanning at grid spacing.
 */
function twoWayHanning(values: readonly number[], stride: number): number[] {
  let current = values.slice();
  for (let pass = 0; pass < 2; pass++) {
    const next = current.slice();
    for (let i = stride; i < current.length - stride; i++) {
      next[i] =
        0.25 * current[i - stride]! +
        0.5 * current[i]! +
        0.25 * current[i + stride]!;
    }
    current = next;
  }
  return current;
}

/**
 * 1-D N-step Leise scale-telescoped filter on equal-index samples.
 * Step k applies two-way 1-2-1 at stride 2^k.
 * First response zero at wavelength 2^N * Δ (CEDRIC / Leise 1982).
 * Research-only. Grid, endpoint, and one-vs-two-way details are not
 * uniquely specified by Markowski et al. (2012) Fig. 2b caption.
 */
function leise1d(values: readonly number[], nstep: number): number[] {
  let current = values.slice();
  for (let step = 0; step < nstep; step++) {
    current = twoWayHanning(current, 2 ** step);
  }
  return current;
}

function applyLeiseToLevels(
  levels: readonly WindLevel[],
  nstep: number,
): WindLevel[] {
  const eastward = leise1d(
    levels.map((level) => level.eastward),
    nstep,
  );
  const northward = leise1d(
    levels.map((level) => level.northward),
    nstep,
  );
  return levels.map((level, i) => ({
    height: level.height,
    eastward: eastward[i]!,
    northward: northward[i]!,
  }));
}

function interpolateRegularHeight(
  profile: EnvironmentalWindProfile,
  deltaM: number,
): WindLevel[] {
  const levels: WindLevel[] = [];
  const start = profile.minHeight;
  const end = profile.maxHeight;
  for (let h = start; h <= end + 1e-9; h += deltaM) {
    const height = Math.min(h, end);
    const v = profile.sampleAtHeight(height);
    levels.push({
      height: round(height, 4),
      eastward: v.eastward,
      northward: v.northward,
    });
    if (height >= end) {
      break;
    }
  }
  if (levels[levels.length - 1]!.height < end) {
    const v = profile.sampleAtHeight(end);
    levels.push({ height: end, eastward: v.eastward, northward: v.northward });
  }
  return levels;
}

function binAverage(levels: readonly WindLevel[], binM: number): WindLevel[] {
  const minH = levels[0]!.height;
  const maxH = levels[levels.length - 1]!.height;
  const out: WindLevel[] = [];
  for (let lo = minH; lo < maxH; lo += binM) {
    const hi = Math.min(lo + binM, maxH);
    const members = levels.filter((l) => l.height >= lo && l.height < hi);
    if (members.length === 0) {
      continue;
    }
    const eastward =
      members.reduce((s, l) => s + l.eastward, 0) / members.length;
    const northward =
      members.reduce((s, l) => s + l.northward, 0) / members.length;
    const height =
      members.reduce((s, l) => s + l.height, 0) / members.length;
    out.push({ height, eastward, northward });
  }
  const last = levels[levels.length - 1]!;
  if (out.length === 0 || out[out.length - 1]!.height < last.height) {
    out.push({ ...last });
  }
  return out;
}

function hodographArcLength(
  levels: readonly WindLevel[],
  h0: number,
  h1: number,
): number {
  let length = 0;
  for (let i = 0; i < levels.length - 1; i++) {
    const a = levels[i]!;
    const b = levels[i + 1]!;
    if (b.height <= h0 || a.height >= h1) {
      continue;
    }
    length += hypot2(b.eastward - a.eastward, b.northward - a.northward);
  }
  return length;
}

function localOmegaMagnitudes(
  profile: EnvironmentalWindProfile,
): number[] {
  const heights = profile.levelHeights();
  const mags: number[] = [];
  for (let i = 0; i < heights.length - 1; i++) {
    const hLo = heights[i]!;
    const hHi = heights[i + 1]!;
    const shear = verticalWindShearBetween(profile, hLo, hHi);
    const vorticity = horizontalVorticityFromShear(shear);
    mags.push(hypot2(vorticity.omegaEastward, vorticity.omegaNorthward));
  }
  return mags;
}

function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) {
    return Number.NaN;
  }
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) {
    return sorted[lo]!;
  }
  return sorted[lo]! * (hi - idx) + sorted[hi]! * (idx - lo);
}

function stats(values: readonly number[]) {
  const sorted = values.slice().sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return {
    n: values.length,
    min: sorted[0],
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    p95: percentile(sorted, 0.95),
    max: sorted[sorted.length - 1],
    mean,
  };
}

function sampleAt(profile: EnvironmentalWindProfile, height: number) {
  const v = profile.sampleAtHeight(height);
  return {
    height,
    eastward: v.eastward,
    northward: v.northward,
    srEastward: v.eastward - PUBLISHED_C.eastward,
    srNorthward: v.northward - PUBLISHED_C.northward,
    srSpeed: hypot2(
      v.eastward - PUBLISHED_C.eastward,
      v.northward - PUBLISHED_C.northward,
    ),
  };
}

function omegaAtHeight(profile: EnvironmentalWindProfile, height: number) {
  const segment = soundingSegmentContainingHeight(profile, height);
  if (segment === null) {
    return null;
  }
  const shear = verticalWindShearBetween(profile, segment.hLo, segment.hHi);
  const vorticity = horizontalVorticityFromShear(shear);
  return {
    height,
    hLo: segment.hLo,
    hHi: segment.hHi,
    omegaEastward: vorticity.omegaEastward,
    omegaNorthward: vorticity.omegaNorthward,
    omegaMagnitude: hypot2(vorticity.omegaEastward, vorticity.omegaNorthward),
    directionFromEastDeg:
      (Math.atan2(vorticity.omegaNorthward, vorticity.omegaEastward) * 180) /
      Math.PI,
  };
}

function svgHodograph(
  series: Array<{
    name: string;
    color: string;
    width: number;
    levels: readonly WindLevel[];
    stormRelative: boolean;
  }>,
  title: string,
): string {
  const width = 720;
  const height = 720;
  const pad = 56;
  const points = series.flatMap((s) =>
    s.levels.map((l) => ({
      u: s.stormRelative ? l.eastward - PUBLISHED_C.eastward : l.eastward,
      v: s.stormRelative ? l.northward - PUBLISHED_C.northward : l.northward,
    })),
  );
  const maxAbs = Math.max(
    20,
    ...points.map((p) => Math.max(Math.abs(p.u), Math.abs(p.v))),
  );
  const domain = Math.ceil(maxAbs / 5) * 5;
  const toX = (u: number) =>
    pad + ((u + domain) / (2 * domain)) * (width - 2 * pad);
  const toY = (v: number) =>
    height - pad - ((v + domain) / (2 * domain)) * (height - 2 * pad);

  const grid: string[] = [];
  for (let t = -domain; t <= domain; t += 5) {
    grid.push(
      `<line x1="${toX(t)}" y1="${toY(-domain)}" x2="${toX(t)}" y2="${toY(domain)}" stroke="#ddd" />`,
      `<line x1="${toX(-domain)}" y1="${toY(t)}" x2="${toX(domain)}" y2="${toY(t)}" stroke="#ddd" />`,
    );
  }

  const paths = series.map((s) => {
    const d = s.levels
      .map((l, i) => {
        const u = s.stormRelative
          ? l.eastward - PUBLISHED_C.eastward
          : l.eastward;
        const v = s.stormRelative
          ? l.northward - PUBLISHED_C.northward
          : l.northward;
        return `${i === 0 ? "M" : "L"}${toX(u).toFixed(2)},${toY(v).toFixed(2)}`;
      })
      .join(" ");
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width}" />`;
  });

  const kmMarks = [0.0024, 0.5, 1, 2, 3, 4, 6, 8, 10, 12].map((km) => {
    const h = km * 1000;
    const src = series[0]!;
    const nearest = nearestLevel(src.levels, h);
    const u = src.stormRelative
      ? nearest.eastward - PUBLISHED_C.eastward
      : nearest.eastward;
    const v = src.stormRelative
      ? nearest.northward - PUBLISHED_C.northward
      : nearest.northward;
    return `<circle cx="${toX(u)}" cy="${toY(v)}" r="3" fill="#111" /><text x="${toX(u) + 6}" y="${toY(v) - 6}" font-size="11">${km === 0.0024 ? "sfc" : `${km}`}</text>`;
  });

  const origin = srcStormRelative(series)
    ? `<circle cx="${toX(0)}" cy="${toY(0)}" r="4" fill="#c00" /><text x="${toX(0) + 8}" y="${toY(0) + 14}" font-size="11" fill="#c00">C origin</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#fff"/>
  ${grid.join("\n  ")}
  <line x1="${toX(-domain)}" y1="${toY(0)}" x2="${toX(domain)}" y2="${toY(0)}" stroke="#333" />
  <line x1="${toX(0)}" y1="${toY(-domain)}" x2="${toX(0)}" y2="${toY(domain)}" stroke="#333" />
  ${paths.join("\n  ")}
  ${origin}
  ${kmMarks.join("\n  ")}
  <text x="${width / 2}" y="22" text-anchor="middle" font-size="14">${escapeXml(title)}</text>
  <text x="${width / 2}" y="${height - 16}" text-anchor="middle" font-size="12">eastward m/s</text>
  <text x="18" y="${height / 2}" text-anchor="middle" font-size="12" transform="rotate(-90 18 ${height / 2})">northward m/s</text>
</svg>
`;
}

function srcStormRelative(
  series: Array<{ stormRelative: boolean }>,
): boolean {
  return series.some((s) => s.stormRelative);
}

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function clipLevels(
  levels: readonly WindLevel[],
  hMax: number,
): WindLevel[] {
  return levels.filter((l) => l.height <= hMax);
}

const golden = goldenJson as GoshenNormalizedGolden;
const record = nssl1Goshen2155Record(golden.levels, golden.coverage, {
  latitude: 41.278,
  longitude: -103.893,
});
const rawProfile = record.profile;
const rawLevels = golden.levels;

const rawHodo = hodographPoints(rawProfile);
if (rawHodo.length !== 2029) {
  throw new Error(`expected 2029 knots, got ${rawHodo.length}`);
}

const h0 = rawProfile.minHeight;
const layers = [
  { name: "near-0–1 km", h1: 1000 },
  { name: "near-0–3 km", h1: 3000 },
  { name: "near-0–6 km", h1: 6000 },
] as const;

const rawPublishedC = Object.fromEntries(
  layers.map((layer) => [
    layer.name,
    layerDiagnostics(rawProfile, h0, layer.h1, PUBLISHED_C),
  ]),
);
const rawDemoC = Object.fromEntries(
  layers.map((layer) => [
    layer.name,
    layerDiagnostics(rawProfile, h0, layer.h1, DEMO_C),
  ]),
);

const leiseNative = applyLeiseToLevels(rawLevels, 5);
const leiseNativeProfile = profileFromLevels(leiseNative);
const leiseNativeDiag = Object.fromEntries(
  layers.map((layer) => [
    layer.name,
    layerDiagnostics(leiseNativeProfile, h0, layer.h1, PUBLISHED_C),
  ]),
);

const regular5 = interpolateRegularHeight(rawProfile, 5);
const leise5m = applyLeiseToLevels(regular5, 5);
const leise5mProfile = profileFromLevels(leise5m);
const leise5mDiag = Object.fromEntries(
  layers.map((layer) => [
    layer.name,
    layerDiagnostics(leise5mProfile, h0, layer.h1, PUBLISHED_C),
  ]),
);

const regular10 = interpolateRegularHeight(rawProfile, 10);
const leise10m = applyLeiseToLevels(regular10, 5);
const leise10mProfile = profileFromLevels(leise10m);
const leise10mDiag = Object.fromEntries(
  layers.map((layer) => [
    layer.name,
    layerDiagnostics(leise10mProfile, h0, layer.h1, PUBLISHED_C),
  ]),
);

function binnedDiagnostics(levels: readonly WindLevel[]) {
  const profile = profileFromLevels(levels);
  return Object.fromEntries(
    layers.map((layer) => [
      layer.name,
      layerDiagnostics(profile, profile.minHeight, layer.h1, PUBLISHED_C),
    ]),
  );
}

const bin50 = binAverage(rawLevels, 50);
const bin100 = binAverage(rawLevels, 100);
const bin250 = binAverage(rawLevels, 250);
const bin50Diag = binnedDiagnostics(bin50);
const bin100Diag = binnedDiagnostics(bin100);
const bin250Diag = binnedDiagnostics(bin250);

const sampleHeights = [h0, 500, 1000, 2000, 3000, 4000, 6000, 8000, 10000, 12000];
const rawOmega = localOmegaMagnitudes(rawProfile);
const leiseNativeOmega = localOmegaMagnitudes(leiseNativeProfile);
const leise5mOmega = localOmegaMagnitudes(leise5mProfile);

const skipFirst = rawLevels.slice(1);
const skipFirstProfile = profileFromLevels(skipFirst);
const skipFirstDiag = Object.fromEntries(
  layers.map((layer) => [
    layer.name,
    layerDiagnostics(
      skipFirstProfile,
      skipFirstProfile.minHeight,
      layer.h1,
      PUBLISHED_C,
    ),
  ]),
);

const summary = {
  identity: {
    sourceIdentity: record.provenance.sourceIdentity,
    validTime: record.provenance.validTime,
    location: record.provenance.location,
    heightDatum: record.provenance.heightDatum,
    keptLevelCount: golden.coverage.keptLevelCount,
    minHeight: rawProfile.minHeight,
    maxHeight: rawProfile.maxHeight,
  },
  published: {
    paper: "Markowski et al. (2012) MWR Part I, DOI 10.1175/MWR-D-11-00336.1",
    figure: "Fig. 2b",
    stormMotion: PUBLISHED_C,
    stormMotionUnits: "m/s eastward, northward",
    hodographFrame: "storm-relative; C subtracted from ground-relative winds",
    heightLabels: "km AGL",
    blackCurve: "5-step Leise filter",
    grayCurve: "unsmoothed",
    printedDiagnosticsOn: "smooth (black) hodograph",
    fig2b_0to1kmSRH: { value: 88, units: "m^2 s^-2", source: "Fig. 2b inset, smooth hodograph" },
    fig2b_0to3kmSRH: { value: 167, units: "m^2 s^-2", source: "Fig. 2b inset, smooth hodograph" },
    fig2b_0to6kmShear: { value: 29, units: "m s^-1", source: "Fig. 2b inset, smooth hodograph; magnitude of 0-6 km vector wind difference" },
    intro0to3kmSRH: { value: 170, units: "m^2 s^-2", qualifier: "approximately; Introduction citing Fig. 2b" },
    intro0to6kmBWD: { value: 30, units: "m s^-1", qualifier: "approximately; Introduction citing Fig. 2b" },
  },
  characteristicPointsRawGR: Object.fromEntries(
    sampleHeights.map((h) => {
      const nearest = nearestLevel(rawLevels, h);
      return [`nearest_${h}`, nearest];
    }),
  ),
  characteristicPointsRawSR: sampleHeights.map((h) => sampleAt(rawProfile, h)),
  endpoints: {
    first: rawLevels[0],
    second: rawLevels[1],
    last: rawLevels[rawLevels.length - 1],
  },
  rawDiagnosticsPublishedC: rawPublishedC,
  rawDiagnosticsDemoC: rawDemoC,
  skipFirstKnotPublishedC: skipFirstDiag,
  experiments: {
    leise5_nativeIndex: {
      description:
        "5-step Leise on native 2029 knots, equal-index two-way 1-2-1, stride 2^k. Endpoints within stride unchanged. First zero ~32 samples (~32 s if 1-s, ~160 m if ~5 m/s ascent).",
      diagnostics: leiseNativeDiag,
      omegaStats: stats(leiseNativeOmega),
      arcLength0to6: hodographArcLength(leiseNative, h0, 6000),
    },
    leise5_regular5m: {
      description:
        "Linear interpolate to 5 m, then 5-step Leise. First zero 160 m.",
      diagnostics: leise5mDiag,
      omegaStats: stats(leise5mOmega),
      arcLength0to6: hodographArcLength(leise5m, h0, 6000),
    },
    leise5_regular10m: {
      description:
        "Linear interpolate to 10 m, then 5-step Leise. First zero 320 m.",
      diagnostics: leise10mDiag,
      arcLength0to6: hodographArcLength(leise10m, h0, 6000),
    },
    bin50m: { diagnostics: bin50Diag, arcLength0to6: hodographArcLength(bin50, h0, 6000) },
    bin100m: { diagnostics: bin100Diag, arcLength0to6: hodographArcLength(bin100, h0, 6000) },
    bin250m: { diagnostics: bin250Diag, arcLength0to6: hodographArcLength(bin250, h0, 6000) },
  },
  rawShapeMetrics: {
    arcLength0to1: hodographArcLength(rawLevels, h0, 1000),
    arcLength0to3: hodographArcLength(rawLevels, h0, 3000),
    arcLength0to6: hodographArcLength(rawLevels, h0, 6000),
    chord0to6: bulkWindDifference(rawProfile, h0, 6000).magnitude,
    localOmegaStats: stats(rawOmega),
    omegaAt0p5km: omegaAtHeight(rawProfile, 500),
    omegaAt1km: omegaAtHeight(rawProfile, 1000),
    omegaAt2km: omegaAtHeight(rawProfile, 2000),
    leiseNativeOmegaAt0p5km: omegaAtHeight(leiseNativeProfile, 500),
    leiseNativeOmegaAt1km: omegaAtHeight(leiseNativeProfile, 1000),
    leiseNativeOmegaAt2km: omegaAtHeight(leiseNativeProfile, 2000),
  },
};

mkdirSync(artifactsDir, { recursive: true });
writeFileSync(
  join(artifactsDir, "goshen-2155-hodograph-reproduction-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

writeFileSync(
  join(artifactsDir, "goshen-2155-ground-relative-raw.svg"),
  svgHodograph(
    [
      {
        name: "raw GR",
        color: "#555",
        width: 0.6,
        levels: rawLevels,
        stormRelative: false,
      },
    ],
    "Goshen NSSL1 2155 UTC ground-relative raw (2029 knots)",
  ),
);

writeFileSync(
  join(artifactsDir, "goshen-2155-storm-relative-raw.svg"),
  svgHodograph(
    [
      {
        name: "raw SR",
        color: "#888",
        width: 0.7,
        levels: rawLevels,
        stormRelative: true,
      },
    ],
    "Goshen NSSL1 2155 UTC storm-relative raw; C=(10.5,-1.3)",
  ),
);

writeFileSync(
  join(artifactsDir, "goshen-2155-storm-relative-raw-vs-leise5.svg"),
  svgHodograph(
    [
      {
        name: "raw SR",
        color: "#bbb",
        width: 0.8,
        levels: rawLevels,
        stormRelative: true,
      },
      {
        name: "Leise-5 native",
        color: "#111",
        width: 1.6,
        levels: leiseNative,
        stormRelative: true,
      },
    ],
    "Fig. 2b analogue: gray=raw, black=5-step Leise (native index)",
  ),
);

writeFileSync(
  join(artifactsDir, "goshen-2155-storm-relative-0-6km-raw-vs-leise5.svg"),
  svgHodograph(
    [
      {
        name: "raw SR 0-6",
        color: "#bbb",
        width: 0.9,
        levels: clipLevels(rawLevels, 6000),
        stormRelative: true,
      },
      {
        name: "Leise-5 native 0-6",
        color: "#111",
        width: 1.8,
        levels: clipLevels(leiseNative, 6000),
        stormRelative: true,
      },
    ],
    "0–6 km AGL storm-relative: raw vs 5-step Leise (native index)",
  ),
);

const one = rawPublishedC["near-0–1 km"]!;
const three = rawPublishedC["near-0–3 km"]!;
const six = rawPublishedC["near-0–6 km"]!;
console.log("Goshen 2155 research diagnostics");
console.log(`levels ${rawHodo.length}  minH ${h0}  maxH ${rawProfile.maxHeight}`);
console.log(
  `raw 0-1 SRH ${one.srh.toFixed(1)}  BWD ${one.bulkWindDifferenceMagnitude.toFixed(2)}`,
);
console.log(
  `raw 0-3 SRH ${three.srh.toFixed(1)}  BWD ${three.bulkWindDifferenceMagnitude.toFixed(2)}`,
);
console.log(
  `raw 0-6 SRH ${six.srh.toFixed(1)}  BWD ${six.bulkWindDifferenceMagnitude.toFixed(2)}`,
);
console.log(
  `Leise5-native 0-1 ${leiseNativeDiag["near-0–1 km"]!.srh.toFixed(1)}  0-3 ${leiseNativeDiag["near-0–3 km"]!.srh.toFixed(1)}  0-6 BWD ${leiseNativeDiag["near-0–6 km"]!.bulkWindDifferenceMagnitude.toFixed(2)}`,
);
console.log(
  `Leise5-5m 0-1 ${leise5mDiag["near-0–1 km"]!.srh.toFixed(1)}  0-3 ${leise5mDiag["near-0–3 km"]!.srh.toFixed(1)}  0-6 BWD ${leise5mDiag["near-0–6 km"]!.bulkWindDifferenceMagnitude.toFixed(2)}`,
);
console.log(
  `raw |ω_h| p50 ${summary.rawShapeMetrics.localOmegaStats.p50!.toExponential(3)}  p95 ${summary.rawShapeMetrics.localOmegaStats.p95!.toExponential(3)}  max ${summary.rawShapeMetrics.localOmegaStats.max!.toExponential(3)}`,
);
console.log(`wrote ${artifactsDir}`);
