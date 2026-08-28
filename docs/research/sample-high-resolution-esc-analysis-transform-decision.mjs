/**
 * Research-only: decide whether a production Analysis transform can be
 * selected for high-resolution-mobile-esc Source profiles.
 * Not a production API. Does not mutate Source goldens or src/**.
 *
 * Native ESC bytes are read only to reconstruct retained TIME for the
 * time-domain candidate. They are gitignored and must not be committed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const artifactsDir = join(here, "artifacts");

const ESC_MISSING_WIND = 9999.0;
const ESC_MISSING_ALTITUDE = 99999.0;
const ESC_QC_MISSING = 9.0;
const ESC_QC_BAD = 3.0;

const RESEARCH_C = { eastward: 10.5, northward: -1.3 };
const PUBLISHED_GOSHEN = { srh0to1: 88, srh0to3: 167, bulk0to6: 29 };

const HEIGHT_CUTOFFS_M = [75, 100, 125, 150, 200];
const TIME_CUTOFFS_S = [25, 32, 40, 50];
const HEIGHT_GRID_M = 5;

const ESC_CASES = [
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
    expectedN: 2029,
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
    expectedN: 2733,
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
    expectedN: 2917,
  },
];

const MOORE = {
  id: "moore",
  label: "Moore OUN IGRA 2013-05-20",
  goldenPath: join(
    root,
    "src/data/igra/fixtures/ounMoore20130520.normalized.json",
  ),
  expectedN: 165,
};

function round(value, digits) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function hypot2(a, b) {
  return Math.hypot(a, b);
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function stats(values) {
  if (values.length === 0) {
    return { n: 0, min: null, p10: null, median: null, p90: null, max: null, mean: null };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return {
    n: values.length,
    min: round(sorted[0], 6),
    p10: round(percentile(sorted, 0.1), 6),
    median: round(percentile(sorted, 0.5), 6),
    p90: round(percentile(sorted, 0.9), 6),
    max: round(sorted[sorted.length - 1], 6),
    mean: round(mean, 6),
  };
}

function loadGoldenLevels(path) {
  const golden = JSON.parse(readFileSync(path, "utf8"));
  return golden.levels.map((level) => ({
    height: level.height,
    eastward: level.eastward,
    northward: level.northward,
  }));
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
    siteId: headerValue(lines, "Release Site Type/Site ID"),
    utcReleaseTime: headerValue(lines, "UTC Release Time (y,m,d,h,m,s)"),
    launchElevation: Number(parts[4]),
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
    u: Number(parts[5]),
    v: Number(parts[6]),
    alt: Number(parts[14]),
    qu: Number(parts[18]),
    qv: Number(parts[19]),
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

function roundTenth(value) {
  return Math.round(value * 10) / 10;
}

function retainI1(block, spec) {
  if (block.header.launchElevation !== spec.expectedLaunchElevationM) {
    throw new Error(
      `${spec.label}: launch elevation ${block.header.launchElevation} != ${spec.expectedLaunchElevationM}`,
    );
  }
  const kept = [];
  for (const record of block.records) {
    if (!isUsableWindRecord(record)) continue;
    kept.push({
      time: record.time,
      height: roundTenth(record.alt - spec.expectedLaunchElevationM),
      eastward: record.u,
      northward: record.v,
    });
  }
  for (let i = 1; i < kept.length; i++) {
    if (!(kept[i].height > kept[i - 1].height)) {
      throw new Error(`${spec.label}: I1 heights not strictly increasing at ${i}`);
    }
  }
  return kept;
}

function loadTimedSource(spec, golden) {
  if (!existsSync(spec.path)) {
    throw new Error(`native ESC missing: ${spec.path}`);
  }
  const text = readFileSync(spec.path, "utf8");
  const blocks = parseEscConcatenated(text);
  const hits = blocks.filter(
    (b) =>
      b.header.siteId.includes(spec.siteIdIncludes) &&
      b.header.utcReleaseTime === spec.utcReleaseTime,
  );
  if (hits.length !== 1) {
    throw new Error(`${spec.label}: expected 1 native block, got ${hits.length}`);
  }
  const kept = retainI1(hits[0], spec);
  if (kept.length !== golden.length) {
    throw new Error(`${spec.id}: I1 n=${kept.length} != golden ${golden.length}`);
  }
  for (let i = 0; i < kept.length; i++) {
    if (
      kept[i].height !== golden[i].height ||
      kept[i].eastward !== golden[i].eastward ||
      kept[i].northward !== golden[i].northward
    ) {
      throw new Error(`${spec.id}: I1/golden mismatch at ${i}`);
    }
  }
  return kept;
}

function sampleAtHeight(levels, height) {
  if (height <= levels[0].height) return { ...levels[0], height };
  const last = levels[levels.length - 1];
  if (height >= last.height) return { ...last, height };
  let lo = 0;
  let hi = levels.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (levels[mid].height <= height) lo = mid;
    else hi = mid;
  }
  const a = levels[lo];
  const b = levels[hi];
  const w = (height - a.height) / (b.height - a.height);
  return {
    height,
    eastward: a.eastward + w * (b.eastward - a.eastward),
    northward: a.northward + w * (b.northward - a.northward),
  };
}

function interpolateRegularHeight(levels, deltaM) {
  const start = levels[0].height;
  const end = levels[levels.length - 1].height;
  const out = [];
  for (let h = start; h <= end + 1e-9; h += deltaM) {
    const height = Math.min(h, end);
    out.push(sampleAtHeight(levels, height));
    if (height >= end) break;
  }
  if (out[out.length - 1].height < end) out.push(sampleAtHeight(levels, end));
  return out;
}

function mapWindsOntoHeights(sourceHeights, filteredGrid) {
  return sourceHeights.map((h) => {
    const sampled = sampleAtHeight(filteredGrid, h);
    return { height: h, eastward: sampled.eastward, northward: sampled.northward };
  });
}

function applyToComponents(levels, transform) {
  const eastward = transform(levels.map((l) => l.eastward));
  const northward = transform(levels.map((l) => l.northward));
  return levels.map((level, i) => ({
    height: level.height,
    eastward: eastward[i],
    northward: northward[i],
    time: level.time,
  }));
}

function fivePointMirror(v) {
  const n = v.length;
  const out = new Array(n);
  if (n < 5) return v.slice();
  out[0] = 0.875 * v[0] + 0.1875 * v[1] - 0.0625 * v[2];
  out[n - 1] = 0.875 * v[n - 1] + 0.1875 * v[n - 2] - 0.0625 * v[n - 3];
  out[1] = 0.1875 * v[0] + 0.625 * v[1] + 0.25 * v[2] - 0.0625 * v[3];
  out[n - 2] =
    0.1875 * v[n - 1] + 0.625 * v[n - 2] + 0.25 * v[n - 3] - 0.0625 * v[n - 4];
  for (let i = 2; i <= n - 3; i++) {
    out[i] =
      0.625 * v[i] + 0.25 * (v[i - 1] + v[i + 1]) - 0.0625 * (v[i - 2] + v[i + 2]);
  }
  return out;
}

function apply5ptStrided(y, stride) {
  const n = y.length;
  for (let offset = 0; offset < stride; offset++) {
    const idx = [];
    for (let i = offset; i < n; i += stride) idx.push(i);
    if (idx.length < 5) continue;
    const filtered = fivePointMirror(idx.map((i) => y[i]));
    for (let j = 0; j < idx.length; j++) y[idx[j]] = filtered[j];
  }
}

function leiseT5Values(values, nstep) {
  const y = values.slice();
  const n = y.length;
  if (nstep <= 0 || n < 5) return y;
  const mpyramid = 2 * nstep - 1;
  const mstep = nstep;
  let k1 = 1;
  let nns = nstep;
  for (let main = 1; main <= mpyramid; main++) {
    if (10 * k1 > n) nns = Math.min(nns, main);
    const skip = main >= nns && mpyramid - main >= nns;
    if (!skip) apply5ptStrided(y, k1);
    k1 = k1 + k1;
    if (main >= mstep) k1 = Math.floor(k1 / 4);
  }
  return y;
}

function h5(theta) {
  return 0.625 + 0.5 * Math.cos(theta) - 0.125 * Math.cos(2 * theta);
}

function leiseStrides(nstep) {
  const strides = [];
  const mpyramid = 2 * nstep - 1;
  const mstep = nstep;
  let k1 = 1;
  for (let main = 1; main <= mpyramid; main++) {
    strides.push(k1);
    k1 = k1 + k1;
    if (main >= mstep) k1 = Math.floor(k1 / 4);
  }
  return strides;
}

function leiseAnalyticGain(nstep, wavelengthSamples) {
  if (!Number.isFinite(wavelengthSamples) || wavelengthSamples <= 0) return null;
  let gain = 1;
  for (const stride of leiseStrides(nstep)) {
    gain *= h5((2 * Math.PI * stride) / wavelengthSamples);
  }
  return gain;
}

function hammingSincLowpass(fc, numTaps) {
  const m = (numTaps - 1) / 2;
  const h = [];
  let sum = 0;
  for (let n = 0; n < numTaps; n++) {
    const k = n - m;
    const sinc = k === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * k) / (Math.PI * k);
    const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (numTaps - 1));
    const val = sinc * w;
    h.push(val);
    sum += val;
  }
  return h.map((v) => v / sum);
}

function firGain(h, wavelengthSamples) {
  const m = (h.length - 1) / 2;
  let re = 0;
  let im = 0;
  const omega = (2 * Math.PI) / wavelengthSamples;
  for (let n = 0; n < h.length; n++) {
    const k = n - m;
    re += h[n] * Math.cos(-omega * k);
    im += h[n] * Math.sin(-omega * k);
  }
  return hypot2(re, im);
}

function convolveMirror(values, kernel) {
  const m = (kernel.length - 1) / 2;
  const n = values.length;
  const out = new Array(n);
  const at = (i) => {
    if (i < 0) return values[Math.min(-i - 1, n - 1)];
    if (i >= n) return values[Math.max(2 * n - 1 - i, 0)];
    return values[i];
  };
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = 0; k < kernel.length; k++) s += kernel[k] * at(i + k - m);
    out[i] = s;
  }
  return out;
}

function firTapsForCutoff(cutoffSamples) {
  return 2 * Math.round(cutoffSamples) + 1;
}

function firKernelForCutoff(cutoffSamples) {
  const taps = firTapsForCutoff(cutoffSamples);
  const fc = 1 / cutoffSamples;
  return { kernel: hammingSincLowpass(fc, taps), taps, fc, cutoffSamples };
}

function binMean100m(levels) {
  const dz = 100;
  const hMin = levels[0].height;
  const hMax = levels[levels.length - 1].height;
  const out = [];
  let k = 0;
  while (true) {
    const lo = hMin + k * dz;
    if (lo >= hMax) break;
    const hi = Math.min(lo + dz, hMax);
    const members = [];
    for (const level of levels) {
      const last = hi === hMax;
      if (last ? level.height >= lo && level.height <= hi : level.height >= lo && level.height < hi) {
        members.push(level);
      }
    }
    k += 1;
    if (members.length === 0) continue;
    out.push({
      height: members.reduce((s, m) => s + m.height, 0) / members.length,
      eastward: members.reduce((s, m) => s + m.eastward, 0) / members.length,
      northward: members.reduce((s, m) => s + m.northward, 0) / members.length,
    });
  }
  return out;
}

function srhBetween(levels, c, h0, h1) {
  const heights = [h0];
  for (const level of levels) {
    if (level.height > h0 && level.height < h1) heights.push(level.height);
  }
  heights.push(h1);
  let srh = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    const wa = sampleAtHeight(levels, heights[i]);
    const wb = sampleAtHeight(levels, heights[i + 1]);
    const ua = wa.eastward - c.eastward;
    const va = wa.northward - c.northward;
    const ub = wb.eastward - c.eastward;
    const vb = wb.northward - c.northward;
    srh += ub * va - ua * vb;
  }
  return srh + 0;
}

function bulkWindDifference(levels, h0, h1) {
  const v0 = sampleAtHeight(levels, h0);
  const v1 = sampleAtHeight(levels, h1);
  const de = v1.eastward - v0.eastward;
  const dn = v1.northward - v0.northward;
  return { eastward: de, northward: dn, magnitude: hypot2(de, dn) };
}

function omegaMagnitudes(levels) {
  const out = [];
  for (let i = 1; i < levels.length; i++) {
    const dh = levels[i].height - levels[i - 1].height;
    if (!(dh > 0)) continue;
    out.push(
      hypot2(
        levels[i].eastward - levels[i - 1].eastward,
        levels[i].northward - levels[i - 1].northward,
      ) / dh,
    );
  }
  return out;
}

function layerOmega(levels, h0, h1) {
  const vals = [];
  for (let i = 1; i < levels.length; i++) {
    const z0 = levels[i - 1].height;
    const z1 = levels[i].height;
    if (z1 <= h0 || z0 >= h1) continue;
    const dh = z1 - z0;
    if (!(dh > 0)) continue;
    vals.push(
      hypot2(
        levels[i].eastward - levels[i - 1].eastward,
        levels[i].northward - levels[i - 1].northward,
      ) / dh,
    );
  }
  return stats(vals);
}

function hodographArcLength(levels, h0, h1) {
  const knots = [sampleAtHeight(levels, h0)];
  for (const level of levels) {
    if (level.height > h0 && level.height < h1) knots.push(level);
  }
  knots.push(sampleAtHeight(levels, h1));
  let len = 0;
  for (let i = 1; i < knots.length; i++) {
    len += hypot2(
      knots[i].eastward - knots[i - 1].eastward,
      knots[i].northward - knots[i - 1].northward,
    );
  }
  return len;
}

function sampleAtTime(series, time) {
  if (time <= series[0].time) return series[0];
  const last = series[series.length - 1];
  if (time >= last.time) return last;
  let lo = 0;
  let hi = series.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (series[mid].time <= time) lo = mid;
    else hi = mid;
  }
  const a = series[lo];
  const b = series[hi];
  const w = (time - a.time) / (b.time - a.time);
  return {
    time,
    height: a.height + w * (b.height - a.height),
    eastward: a.eastward + w * (b.eastward - a.eastward),
    northward: a.northward + w * (b.northward - a.northward),
    interpolated: true,
  };
}

function resampleUniformTime(timed) {
  const t0 = timed[0].time;
  const t1 = timed[timed.length - 1].time;
  if (!Number.isInteger(t0) || !Number.isInteger(t1)) {
    throw new Error("retained TIME is not integer seconds");
  }
  const observed = new Map(timed.map((p) => [p.time, p]));
  const uniform = [];
  let interpolatedCount = 0;
  for (let t = t0; t <= t1; t += 1) {
    const src = observed.get(t);
    if (src) {
      uniform.push({ ...src, interpolated: false });
    } else {
      uniform.push({ ...sampleAtTime(timed, t), interpolated: true });
      interpolatedCount += 1;
    }
  }
  const dt = [];
  const gapHistogram = new Map();
  for (let i = 1; i < timed.length; i++) {
    const d = timed[i].time - timed[i - 1].time;
    dt.push(d);
    gapHistogram.set(d, (gapHistogram.get(d) ?? 0) + 1);
  }
  return {
    uniform,
    interpolatedCount,
    uniformN: uniform.length,
    retainedN: timed.length,
    interpolationFraction: interpolatedCount / uniform.length,
    dtHistogram: Object.fromEntries([...gapHistogram.entries()].sort((a, b) => a[0] - b[0])),
    exact1sShare: (gapHistogram.get(1) ?? 0) / Math.max(dt.length, 1),
    dtStats: stats(dt),
  };
}

function filterUniformTime(timed, transform) {
  const pack = resampleUniformTime(timed);
  const eastward = transform(pack.uniform.map((p) => p.eastward));
  const northward = transform(pack.uniform.map((p) => p.northward));
  const filteredUniform = pack.uniform.map((p, i) => ({
    time: p.time,
    height: p.height,
    eastward: eastward[i],
    northward: northward[i],
    interpolated: p.interpolated,
  }));
  const byTime = new Map(filteredUniform.map((p) => [p.time, p]));
  const mapped = timed.map((p) => {
    const f = byTime.get(p.time);
    return {
      height: p.height,
      eastward: f.eastward,
      northward: f.northward,
      time: p.time,
    };
  });
  return { levels: mapped, pack, filteredUniform };
}

function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function fftInPlace(re, im) {
  const n = re.length;
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
    let m = n >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }
  for (let size = 2; size <= n; size *= 2) {
    const half = size / 2;
    const ang = (-2 * Math.PI) / size;
    for (let i = 0; i < n; i += size) {
      for (let k = 0; k < half; k++) {
        const wr = Math.cos(ang * k);
        const wi = Math.sin(ang * k);
        const xr = re[i + k + half];
        const xi = im[i + k + half];
        const tr = wr * xr - wi * xi;
        const ti = wr * xi + wi * xr;
        re[i + k + half] = re[i + k] - tr;
        im[i + k + half] = im[i + k] - ti;
        re[i + k] += tr;
        im[i + k] += ti;
      }
    }
  }
}

function hannPeriodogram(values, dx) {
  const nRaw = values.length;
  const n = nextPow2(nRaw);
  const w = new Array(nRaw);
  let wsum = 0;
  for (let i = 0; i < nRaw; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (nRaw - 1)));
    wsum += w[i];
  }
  const wmean = wsum / nRaw;
  let mean = 0;
  for (const v of values) mean += v;
  mean /= nRaw;
  const re = new Array(n).fill(0);
  const im = new Array(n).fill(0);
  for (let i = 0; i < nRaw; i++) re[i] = ((values[i] - mean) * w[i]) / wmean;
  fftInPlace(re, im);
  const bins = [];
  const nFreq = Math.floor(n / 2);
  for (let k = 1; k < nFreq; k++) {
    const power = (re[k] * re[k] + im[k] * im[k]) / nRaw;
    const freq = k / (n * dx);
    bins.push({ k, freq, period: 1 / freq, power });
  }
  return { nRaw, nPadded: n, dx, bins };
}

function bandPower(bins, lo, hi) {
  let s = 0;
  let n = 0;
  let peak = null;
  for (const bin of bins) {
    if (bin.period >= lo && bin.period <= hi) {
      s += bin.power;
      n += 1;
      if (!peak || bin.power > peak.power) peak = bin;
    }
  }
  return {
    n,
    sum: s,
    peakPeriod: peak ? peak.period : null,
    peakPower: peak ? peak.power : 0,
  };
}

function movingAverageResidual(values, halfWindow) {
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
    out[i] = values[i] - sum / n;
  }
  return out;
}

function slimBand(band) {
  return {
    n: band.n,
    sum: round(band.sum, 8),
    peakPeriod: band.peakPeriod === null ? null : round(band.peakPeriod, 3),
    peakPower: round(band.peakPower, 8),
  };
}

function spectralTime(levels, dx) {
  const uRes = movingAverageResidual(
    levels.map((l) => l.eastward),
    15,
  );
  const vRes = movingAverageResidual(
    levels.map((l) => l.northward),
    15,
  );
  const pgU = hannPeriodogram(uRes, dx);
  const pgV = hannPeriodogram(vRes, dx);
  return {
    u16to20: slimBand(bandPower(pgU.bins, 16, 20)),
    v16to20: slimBand(bandPower(pgV.bins, 16, 20)),
    u6to20: slimBand(bandPower(pgU.bins, 6, 20)),
    u25to40: slimBand(bandPower(pgU.bins, 25, 40)),
    u80to200: slimBand(bandPower(pgU.bins, 80, 200)),
  };
}

function spectralHeight(levels, dz) {
  const uRes = movingAverageResidual(
    levels.map((l) => l.eastward),
    Math.max(1, Math.round(75 / dz)),
  );
  const pgU = hannPeriodogram(uRes, dz);
  return {
    u90to110: slimBand(bandPower(pgU.bins, 90, 110)),
    u60to140: slimBand(bandPower(pgU.bins, 60, 140)),
    u400to800: slimBand(bandPower(pgU.bins, 400, 800)),
    u1000to2000: slimBand(bandPower(pgU.bins, 1000, 2000)),
  };
}

function ratio(num, den) {
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return round(num / den, 6);
}

function layerMetrics(levels, c) {
  const hMin = levels[0].height;
  const hMax = levels[levels.length - 1].height;
  const layers = {};
  for (const [name, h1] of [
    ["near0to1", 1000],
    ["near0to3", 3000],
    ["near0to6", 6000],
  ]) {
    if (hMin >= h1 || hMax < h1) {
      layers[name] = null;
      continue;
    }
    const bwd = bulkWindDifference(levels, hMin, h1);
    const chord = bwd.magnitude;
    const arc = hodographArcLength(levels, hMin, h1);
    layers[name] = {
      h0: round(hMin, 2),
      h1,
      srh: round(srhBetween(levels, c, hMin, h1), 3),
      bulkMagnitude: round(bwd.magnitude, 4),
      arcLength: round(arc, 4),
      excessPath: round(arc - chord, 4),
      omega: layerOmega(levels, hMin, h1),
    };
  }
  return layers;
}

function launchIndependentBulk(levels) {
  const hMax = levels[levels.length - 1].height;
  if (hMax < 6000) return null;
  const w6 = sampleAtHeight(levels, 6000);
  return {
    bulk500to6: round(bulkWindDifference(levels, 500, 6000).magnitude, 4),
    bulk1000to6: round(bulkWindDifference(levels, 1000, 6000).magnitude, 4),
    windAt6km: {
      eastward: round(w6.eastward, 4),
      northward: round(w6.northward, 4),
    },
  };
}

function launchWindow(levels, depthM) {
  const h0 = levels[0].height;
  const h1 = h0 + depthM;
  if (levels[levels.length - 1].height < h1) return null;
  const bwd = bulkWindDifference(levels, h0, h1);
  const arc = hodographArcLength(levels, h0, h1);
  const first = levels[0];
  const atTop = sampleAtHeight(levels, h1);
  return {
    h0: round(h0, 3),
    h1: round(h1, 3),
    nKnots: levels.filter((l) => l.height >= h0 && l.height <= h1).length,
    firstKnot: {
      height: round(first.height, 3),
      eastward: round(first.eastward, 4),
      northward: round(first.northward, 4),
    },
    windAtTop: {
      eastward: round(atTop.eastward, 4),
      northward: round(atTop.northward, 4),
    },
    srh: round(srhBetween(levels, RESEARCH_C, h0, h1), 3),
    bulkMagnitude: round(bwd.magnitude, 4),
    arcLength: round(arc, 4),
    excessPath: round(arc - bwd.magnitude, 4),
    omega: layerOmega(levels, h0, h1),
  };
}

function describeOperator(name, levels, extra) {
  const omega = omegaMagnitudes(levels);
  return {
    name,
    n: levels.length,
    hMin: round(levels[0].height, 3),
    hMax: round(levels[levels.length - 1].height, 3),
    firstKnot: {
      height: round(levels[0].height, 3),
      eastward: round(levels[0].eastward, 4),
      northward: round(levels[0].northward, 4),
    },
    lastKnot: {
      height: round(levels[levels.length - 1].height, 3),
      eastward: round(levels[levels.length - 1].eastward, 4),
      northward: round(levels[levels.length - 1].northward, 4),
    },
    layers: layerMetrics(levels, RESEARCH_C),
    launchIndependentBulk: launchIndependentBulk(levels),
    omegaAll: stats(omega),
    launch200: launchWindow(levels, 200),
    launch500: launchWindow(levels, 500),
    ...extra,
  };
}

function ascentStats(timed) {
  const rates = [];
  for (let i = 1; i < timed.length; i++) {
    const dt = timed[i].time - timed[i - 1].time;
    if (dt > 0) rates.push((timed[i].height - timed[i - 1].height) / dt);
  }
  return { rates, summary: stats(rates) };
}

function polylineSvg(series, width, height, xMin, xMax, yMin, yMax, stroke, sw = 1.2) {
  const pts = [];
  for (const p of series) {
    const x = ((p.x - xMin) / (xMax - xMin)) * (width - 48) + 40;
    const y = height - 28 - ((p.y - yMin) / (yMax - yMin)) * (height - 44);
    pts.push(`${round(x, 1)},${round(y, 1)}`);
  }
  return `<polyline fill="none" stroke="${stroke}" stroke-width="${sw}" points="${pts.join(" ")}"/>`;
}

function writeSvg(path, inner, width, height, title) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<title>${title}</title>
<rect width="100%" height="100%" fill="#fff"/>
${inner}
<text x="8" y="14" font-size="11" font-family="sans-serif">${title}</text>
</svg>
`;
  writeFileSync(path, svg);
}

function hodographPoints(levels, c, h1) {
  const pts = [];
  for (const level of levels) {
    if (level.height > h1) break;
    pts.push({
      x: level.eastward - c.eastward,
      y: level.northward - c.northward,
    });
  }
  return pts;
}

function relativeChange(filtered, raw) {
  if (raw === 0 || raw === null || filtered === null) return null;
  return round((filtered - raw) / raw, 4);
}

function main() {
  mkdirSync(artifactsDir, { recursive: true });

  const timeFirDesigns = TIME_CUTOFFS_S.map((cutoff) => {
    const d = firKernelForCutoff(cutoff);
    return {
      cutoffS: cutoff,
      ...d,
      gainAt18: round(firGain(d.kernel, 18), 5),
      gainAt19: round(firGain(d.kernel, 19), 5),
      gainAt32: round(firGain(d.kernel, 32), 5),
      gainAt64: round(firGain(d.kernel, 64), 5),
      gainAt80: round(firGain(d.kernel, 80), 5),
      gainAt128: round(firGain(d.kernel, 128), 5),
      gainAt180: round(firGain(d.kernel, 180), 5),
    };
  });

  const heightFirDesigns = HEIGHT_CUTOFFS_M.map((cutoffM) => {
    const cutoffSamples = cutoffM / HEIGHT_GRID_M;
    const d = firKernelForCutoff(cutoffSamples);
    return {
      cutoffM,
      cutoffSamples,
      ...d,
      gainAt75m: round(firGain(d.kernel, 75 / HEIGHT_GRID_M), 5),
      gainAt90m: round(firGain(d.kernel, 90 / HEIGHT_GRID_M), 5),
      gainAt100m: round(firGain(d.kernel, 100 / HEIGHT_GRID_M), 5),
      gainAt110m: round(firGain(d.kernel, 110 / HEIGHT_GRID_M), 5),
      gainAt200m: round(firGain(d.kernel, 200 / HEIGHT_GRID_M), 5),
      gainAt400m: round(firGain(d.kernel, 400 / HEIGHT_GRID_M), 5),
      gainAt1000m: round(firGain(d.kernel, 1000 / HEIGHT_GRID_M), 5),
    };
  });

  const leiseGain = {
    at18: round(leiseAnalyticGain(5, 18), 6),
    at19: round(leiseAnalyticGain(5, 19), 6),
    at32: round(leiseAnalyticGain(5, 32), 6),
    at64: round(leiseAnalyticGain(5, 64), 6),
    at80: round(leiseAnalyticGain(5, 80), 6),
    at128: round(leiseAnalyticGain(5, 128), 6),
    at180: round(leiseAnalyticGain(5, 180), 6),
    strides: leiseStrides(5),
  };

  const caseResults = {};
  const timedByCase = {};

  for (const spec of ESC_CASES) {
    const golden = loadGoldenLevels(spec.goldenPath);
    if (golden.length !== spec.expectedN) {
      throw new Error(`${spec.id}: expected ${spec.expectedN}, got ${golden.length}`);
    }
    const timed = loadTimedSource(spec, golden);
    timedByCase[spec.id] = timed;
    const ascent = ascentStats(timed);
    const medianAscent = ascent.summary.median;

    const operators = {};
    operators.c0_source = describeOperator("C0_source", golden, {
      family: "C0",
      domain: "none",
      purpose: "control; I1-retained Source, no Analysis transform",
    });

    const leiseIndex = applyToComponents(golden, (v) => leiseT5Values(v, 5));
    operators.c1_t5fltr_nativeIndex = describeOperator(
      "C1_T5FLTR5_nativeIndex",
      leiseIndex,
      {
        family: "C1",
        domain: "source-index of I1-retained samples",
        operator: "T5FLTR NSTEP=5",
        gapPolicy: "QC gaps remain as adjacent index steps; 2-4 s gaps are treated as Δ=1 sample",
        phase: "zero-phase 5-pt passes; half-sample mirror ends",
        stopbandSamples: 32,
        declaredScale: `32 retained samples; median equivalent ${round(32 * medianAscent, 1)} m / 32 s if Δt=1`,
      },
    );

    const leiseTime = filterUniformTime(timed, (v) => leiseT5Values(v, 5));
    operators.c1_t5fltr_uniform1s = describeOperator(
      "C1_T5FLTR5_uniform1s",
      leiseTime.levels,
      {
        family: "C1",
        domain: "time (uniform 1 s after research interpolation)",
        operator: "T5FLTR NSTEP=5",
        gapPolicy:
          "linear interpolate U/V/height onto missing integer seconds; filter; map winds back to retained times/heights",
        interpolationFraction: round(leiseTime.pack.interpolationFraction, 5),
        interpolatedCount: leiseTime.pack.interpolatedCount,
        uniformN: leiseTime.pack.uniformN,
        phase: "zero-phase; half-sample mirror ends",
        stopbandS: 32,
        medianEffectiveM: round(32 * medianAscent, 1),
      },
    );

    const regular5 = interpolateRegularHeight(golden, HEIGHT_GRID_M);
    const c2Mapped = {};
    const c2Grids = {};
    const c3Levels = {};
    for (const cutoffM of HEIGHT_CUTOFFS_M) {
      const design = heightFirDesigns.find((d) => d.cutoffM === cutoffM);
      const filteredGrid = applyToComponents(regular5, (v) =>
        convolveMirror(v, design.kernel),
      );
      const mapped = mapWindsOntoHeights(
        golden.map((l) => l.height),
        filteredGrid,
      );
      c2Mapped[cutoffM] = mapped;
      c2Grids[cutoffM] = filteredGrid;
      operators[`c2_heightFir_${cutoffM}m`] = describeOperator(
        `C2_heightFIR_${cutoffM}m`,
        mapped,
        {
          family: "C2",
          domain: "height",
          operator: "zero-phase Hamming-sinc FIR",
          resamplingPolicy: `piecewise-linear onto ${HEIGHT_GRID_M} m AGL from Source hMin, not claimed as observational resolution`,
          interpolationPolicy: "internal only; output winds remapped onto original Source heights",
          gapPolicy: "irregular Source Δz linearly interpolated onto the 5 m analysis grid",
          cutoffWavelengthM: cutoffM,
          taps: design.taps,
          fc_cyclesPerSample: design.fc,
          phase: "linear / zero after centering; half-sample mirror",
          internalGridN: regular5.length,
          sourceN: golden.length,
        },
      );
    }

    for (const cutoffS of TIME_CUTOFFS_S) {
      const design = timeFirDesigns.find((d) => d.cutoffS === cutoffS);
      const filtered = filterUniformTime(timed, (v) => convolveMirror(v, design.kernel));
      c3Levels[cutoffS] = filtered.levels;
      operators[`c3_timeFir_${cutoffS}s`] = describeOperator(
        `C3_timeFIR_${cutoffS}s`,
        filtered.levels,
        {
          family: "C3",
          domain: "time",
          operator: "zero-phase Hamming-sinc FIR",
          gapPolicy:
            "linear interpolate U/V/height onto missing integer seconds; filter; map winds back to retained times/heights",
          interpolationFraction: round(filtered.pack.interpolationFraction, 5),
          interpolatedCount: filtered.pack.interpolatedCount,
          cutoffS,
          taps: design.taps,
          fc_hz: design.fc,
          phase: "linear / zero after centering; half-sample mirror",
          medianEffectiveM: round(cutoffS * medianAscent, 1),
          p10EffectiveM: round(cutoffS * ascent.summary.p10, 1),
          p90EffectiveM: round(cutoffS * ascent.summary.p90, 1),
        },
      );
    }

    operators.baseline_binMean100m = describeOperator(
      "baseline_binMean100m_AGL",
      binMean100m(golden),
      {
        family: "baseline",
        domain: "height bins",
        purpose: "Architecture 54 construction; control only, not a selection candidate",
      },
    );

    const specRawT = spectralTime(golden, 1);
    const specRawH = spectralHeight(regular5, HEIGHT_GRID_M);
    const spectral = { rawTimeIndex: specRawT, rawHeight5m: specRawH };

    const spectralCompare = {};
    const addTimeCompare = (key, levels) => {
      const st = spectralTime(levels, 1);
      spectralCompare[key] = {
        time: st,
        u16to20Ratio: ratio(st.u16to20.sum, specRawT.u16to20.sum),
        u80to200Ratio: ratio(st.u80to200.sum, specRawT.u80to200.sum),
      };
    };
    addTimeCompare("c1_t5fltr_nativeIndex", leiseIndex);
    addTimeCompare("c1_t5fltr_uniform1s", leiseTime.levels);
    for (const cutoffS of TIME_CUTOFFS_S) {
      addTimeCompare(`c3_timeFir_${cutoffS}s`, c3Levels[cutoffS]);
    }
    for (const cutoffM of HEIGHT_CUTOFFS_M) {
      const filteredGrid = c2Grids[cutoffM];
      const mapped = c2Mapped[cutoffM];
      const sh = spectralHeight(filteredGrid, HEIGHT_GRID_M);
      const st = spectralTime(mapped, 1);
      spectralCompare[`c2_heightFir_${cutoffM}m`] = {
        height5m: sh,
        timeOnSourceKnots: st,
        u90to110Ratio: ratio(sh.u90to110.sum, specRawH.u90to110.sum),
        u400to800Ratio: ratio(sh.u400to800.sum, specRawH.u400to800.sum),
        u16to20Ratio: ratio(st.u16to20.sum, specRawT.u16to20.sum),
        u80to200Ratio: ratio(st.u80to200.sum, specRawT.u80to200.sum),
      };
    }

    const dtPack = resampleUniformTime(timed);
    caseResults[spec.id] = {
      label: spec.label,
      n: golden.length,
      firstHeight: golden[0].height,
      firstTime: timed[0].time,
      lastTime: timed[timed.length - 1].time,
      ascent: ascent.summary,
      equivalent18sM: round(18 * medianAscent, 1),
      equivalent17sM: round(17 * medianAscent, 1),
      equivalent19sM: round(19 * medianAscent, 1),
      leise5StopbandM: round(32 * medianAscent, 1),
      gaps: {
        exact1sShare: round(dtPack.exact1sShare, 5),
        dtHistogram: dtPack.dtHistogram,
        interpolationFraction: round(dtPack.interpolationFraction, 5),
        interpolatedCount: dtPack.interpolatedCount,
        uniformN: dtPack.uniformN,
        note: "Research interpolation onto integer seconds is not observational resolution.",
      },
      operators,
      spectral,
      spectralCompare,
    };
  }

  const mooreRaw = loadGoldenLevels(MOORE.goldenPath);
  if (mooreRaw.length !== MOORE.expectedN) {
    throw new Error(`moore: expected ${MOORE.expectedN}, got ${mooreRaw.length}`);
  }
  const mooreDh = [];
  for (let i = 1; i < mooreRaw.length; i++) {
    mooreDh.push(mooreRaw[i].height - mooreRaw[i - 1].height);
  }
  const mooreMedianDz = stats(mooreDh).median;
  const mooreLeise = leiseT5Values(
    mooreRaw.map((l) => l.eastward),
    5,
  );
  const mooreCompat = {
    label: MOORE.label,
    n: mooreRaw.length,
    medianDzM: mooreMedianDz,
    samplingClass: "coarse-operational-raob",
    nativeIndexLeise5: {
      mathematicallyFeasible: mooreRaw.length >= 80,
      stopbandNativeLevels: 32,
      stopbandEquivalentMedianM: round(32 * mooreMedianDz, 1),
      verdict: "NOT the ESC 32 s / ~150-180 m policy. Index-domain Leise-5 on Moore is ~5.6 km.",
    },
    heightDomainEscFir: {
      wouldRequireDenseResample: true,
      note: "Resampling IGRA Δz~174 m onto a 5 m ESC analysis grid is fake precision under Architecture 58.",
    },
    timeDomainEscFir: {
      applicable: false,
      reason: "Moore IGRA Source has no 1 s retained TIME series.",
    },
    escPolicyApplicability: "NON-APPLICABLE",
  };

  const operatorKeys = Object.keys(caseResults.goshen.operators);
  const cross = {};
  for (const key of operatorKeys) {
    const rows = {};
    for (const id of ["goshen", "prospect", "dumas"]) {
      const op = caseResults[id].operators[key];
      const raw = caseResults[id].operators.c0_source;
      rows[id] = {
        bulk500to6: op.launchIndependentBulk?.bulk500to6 ?? null,
        bulk500to6Rel: relativeChange(
          op.launchIndependentBulk?.bulk500to6,
          raw.launchIndependentBulk?.bulk500to6,
        ),
        bulk1000to6: op.launchIndependentBulk?.bulk1000to6 ?? null,
        bulk1000to6Rel: relativeChange(
          op.launchIndependentBulk?.bulk1000to6,
          raw.launchIndependentBulk?.bulk1000to6,
        ),
        windAt6km: op.launchIndependentBulk?.windAt6km ?? null,
        srh0to1: op.layers.near0to1?.srh ?? null,
        srh0to1Rel: relativeChange(op.layers.near0to1?.srh, raw.layers.near0to1?.srh),
        srh0to3: op.layers.near0to3?.srh ?? null,
        srh0to3Rel: relativeChange(op.layers.near0to3?.srh, raw.layers.near0to3?.srh),
        omegaMedian: op.omegaAll.median,
        omegaMedianRel: relativeChange(op.omegaAll.median, raw.omegaAll.median),
        omegaP90: op.omegaAll.p90,
        excess0to6: op.layers.near0to6?.excessPath ?? null,
        excess0to6Rel: relativeChange(
          op.layers.near0to6?.excessPath,
          raw.layers.near0to6?.excessPath,
        ),
        firstU: op.firstKnot.eastward,
        firstV: op.firstKnot.northward,
        dFirstU: round(op.firstKnot.eastward - raw.firstKnot.eastward, 4),
        dFirstV: round(op.firstKnot.northward - raw.firstKnot.northward, 4),
        launch200srh: op.launch200?.srh ?? null,
        launch200excess: op.launch200?.excessPath ?? null,
        launch200omegaMed: op.launch200?.omega?.median ?? null,
      };
    }
    const bulkRels = ["goshen", "prospect", "dumas"].map((id) => rows[id].bulk0to6Rel);
    const srhRels = ["goshen", "prospect", "dumas"].map((id) => rows[id].srh0to1Rel);
    cross[key] = {
      family: caseResults.goshen.operators[key].family,
      rows,
      bulk0to6RelRange: {
        min: round(Math.min(...bulkRels), 4),
        max: round(Math.max(...bulkRels), 4),
      },
      srh0to1RelRange: {
        min: round(Math.min(...srhRels), 4),
        max: round(Math.max(...srhRels), 4),
      },
    };
  }

  const summary = {
    generatedAt: "2026-08-28",
    purpose:
      "Research decision experiment: can a scientifically defensible production Analysis transform be selected for high-resolution-mobile-esc?",
    not: [
      "production implementation",
      "runtime wiring",
      "hodograph UI",
      "diagnostic rewiring",
      "BL-010 implementation",
    ],
    architecture58: "PRESERVED; this slice does not reopen Architecture 58",
    stormMotionPolicy: {
      C: RESEARCH_C,
      note: "Fixed research comparison C, published Goshen Fig. 2b motion. NOT observed storm motion for Prospect or Dumas. Used only so operator-to-operator SRH is comparable. 88/167 are external, not a tuning target.",
    },
    publishedGoshenExternal: PUBLISHED_GOSHEN,
    sourcePreservation: "Source goldens unread-mutated. Output Analysis is research-only.",
    nativeDependency:
      "C3 and C1-uniform1s require local gitignored native ESC files to reconstruct I1-retained TIME. Committed goldens alone are sufficient for C0, C1-native-index, C2, and the 100 m baseline.",
    transfer: {
      leise5: leiseGain,
      timeFir: timeFirDesigns.map(({ kernel, ...rest }) => rest),
      heightFir: heightFirDesigns.map(({ kernel, ...rest }) => rest),
    },
    cases: caseResults,
    cross,
    moore: mooreCompat,
  };

  writeFileSync(
    join(artifactsDir, "high-resolution-esc-analysis-transform-decision-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );

  const periods = [];
  for (let p = 4; p <= 200; p += 1) periods.push(p);
  const tfInner = [
    polylineSvg(
      periods.map((p) => ({ x: p, y: Math.abs(leiseAnalyticGain(5, p)) })),
      760,
      300,
      4,
      200,
      0,
      1.05,
      "#1d4ed8",
    ),
    ...timeFirDesigns.map((d, i) =>
      polylineSvg(
        periods.map((p) => ({ x: p, y: firGain(d.kernel, p) })),
        760,
        300,
        4,
        200,
        0,
        1.05,
        ["#047857", "#0f766e", "#65a30d", "#a16207"][i],
      ),
    ),
    `<line x1="${40 + ((18 - 4) / 196) * 712}" y1="20" x2="${40 + ((18 - 4) / 196) * 712}" y2="272" stroke="#991b1b" stroke-dasharray="3 3"/>`,
    `<text x="90" y="32" font-size="9" fill="#991b1b" font-family="sans-serif">18 s</text>`,
    `<text x="520" y="36" font-size="10" fill="#1d4ed8" font-family="sans-serif">T5FLTR-5</text>`,
    `<text x="520" y="50" font-size="10" fill="#047857" font-family="sans-serif">FIR 25 s</text>`,
    `<text x="520" y="64" font-size="10" fill="#0f766e" font-family="sans-serif">FIR 32 s</text>`,
    `<text x="520" y="78" font-size="10" fill="#65a30d" font-family="sans-serif">FIR 40 s</text>`,
    `<text x="520" y="92" font-size="10" fill="#a16207" font-family="sans-serif">FIR 50 s</text>`,
  ].join("\n");
  writeSvg(
    join(artifactsDir, "esc-analysis-time-domain-transfer.svg"),
    tfInner,
    760,
    300,
    "Time-domain |H| vs period (samples ≈ seconds on 1 s grid)",
  );

  const heightWaves = [];
  for (let m = 20; m <= 800; m += 5) heightWaves.push(m);
  const hfInner = heightFirDesigns
    .map((d, i) =>
      polylineSvg(
        heightWaves.map((m) => ({ x: m, y: firGain(d.kernel, m / HEIGHT_GRID_M) })),
        760,
        300,
        20,
        800,
        0,
        1.05,
        ["#7c3aed", "#2563eb", "#0891b2", "#16a34a", "#ca8a04"][i],
      ),
    )
    .concat([
      `<text x="500" y="36" font-size="10" fill="#7c3aed" font-family="sans-serif">75 m</text>`,
      `<text x="500" y="50" font-size="10" fill="#2563eb" font-family="sans-serif">100 m</text>`,
      `<text x="500" y="64" font-size="10" fill="#0891b2" font-family="sans-serif">125 m</text>`,
      `<text x="500" y="78" font-size="10" fill="#16a34a" font-family="sans-serif">150 m</text>`,
      `<text x="500" y="92" font-size="10" fill="#ca8a04" font-family="sans-serif">200 m</text>`,
    ])
    .join("\n");
  writeSvg(
    join(artifactsDir, "esc-analysis-height-domain-transfer.svg"),
    hfInner,
    760,
    300,
    "Height-domain FIR |H| vs vertical wavelength (m) on 5 m grid",
  );

  const goshen = timedByCase.goshen;
  const goshenGolden = loadGoldenLevels(ESC_CASES[0].goldenPath);
  const hodographs = [
    { name: "C0 source", stroke: "#9ca3af", levels: goshenGolden },
    {
      name: "C1 T5FLTR-5 1s",
      stroke: "#1d4ed8",
      levels: filterUniformTime(goshen, (v) => leiseT5Values(v, 5)).levels,
    },
    {
      name: "C2 FIR 150 m",
      stroke: "#16a34a",
      levels: mapWindsOntoHeights(
        goshenGolden.map((l) => l.height),
        applyToComponents(interpolateRegularHeight(goshenGolden, 5), (v) =>
          convolveMirror(v, heightFirDesigns.find((d) => d.cutoffM === 150).kernel),
        ),
      ),
    },
    {
      name: "C3 FIR 40 s",
      stroke: "#b45309",
      levels: filterUniformTime(goshen, (v) =>
        convolveMirror(v, timeFirDesigns.find((d) => d.cutoffS === 40).kernel),
      ).levels,
    },
  ];
  let hodInner = "";
  for (const h of hodographs) {
    hodInner += polylineSvg(
      hodographPoints(h.levels, RESEARCH_C, 6000).map((p) => ({ x: p.x, y: p.y })),
      640,
      480,
      -20,
      25,
      -8,
      22,
      h.stroke,
    );
  }
  hodInner += `<text x="420" y="36" font-size="10" fill="#9ca3af" font-family="sans-serif">C0 source</text>`;
  hodInner += `<text x="420" y="50" font-size="10" fill="#1d4ed8" font-family="sans-serif">C1 T5FLTR-5 1s</text>`;
  hodInner += `<text x="420" y="64" font-size="10" fill="#16a34a" font-family="sans-serif">C2 FIR 150 m</text>`;
  hodInner += `<text x="420" y="78" font-size="10" fill="#b45309" font-family="sans-serif">C3 FIR 40 s</text>`;
  writeSvg(
    join(artifactsDir, "esc-analysis-goshen-sr-hodograph-0-6km.svg"),
    hodInner,
    640,
    480,
    "Goshen 0-6 km SR hodograph (research C=10.5,-1.3)",
  );

  let launchInner = "";
  for (const h of hodographs) {
    launchInner += polylineSvg(
      hodographPoints(h.levels, RESEARCH_C, goshenGolden[0].height + 500).map((p) => ({
        x: p.x,
        y: p.y,
      })),
      640,
      400,
      -18,
      8,
      -6,
      14,
      h.stroke,
    );
  }
  writeSvg(
    join(artifactsDir, "esc-analysis-goshen-launch-0-500m.svg"),
    launchInner,
    640,
    400,
    "Goshen first 500 m SR hodograph (research C)",
  );

  const lines = [];
  lines.push("ESC Analysis transform decision experiment");
  lines.push(`C = (${RESEARCH_C.eastward}, ${RESEARCH_C.northward}) research comparison only`);
  lines.push(
    `Leise-5 |H|(18)=${leiseGain.at18} |H|(32)=${leiseGain.at32} |H|(64)=${leiseGain.at64} |H|(180)=${leiseGain.at180}`,
  );
  for (const d of timeFirDesigns) {
    lines.push(
      `time FIR ${d.cutoffS}s taps=${d.taps} |H|(18)=${d.gainAt18} |H|(32)=${d.gainAt32} |H|(80)=${d.gainAt80} |H|(180)=${d.gainAt180}`,
    );
  }
  for (const d of heightFirDesigns) {
    lines.push(
      `height FIR ${d.cutoffM}m taps=${d.taps} |H|(90m)=${d.gainAt90m} |H|(110m)=${d.gainAt110m} |H|(400m)=${d.gainAt400m} |H|(1000m)=${d.gainAt1000m}`,
    );
  }
  for (const id of ["goshen", "prospect", "dumas"]) {
    const c = caseResults[id];
    lines.push(
      `${id} n=${c.n} h0=${c.firstHeight} t0=${c.firstTime} medianAscent=${c.ascent.median} 18s→${c.equivalent18sM}m interpFrac=${c.gaps.interpolationFraction}`,
    );
    for (const key of [
      "c0_source",
      "c1_t5fltr_nativeIndex",
      "c1_t5fltr_uniform1s",
      "c2_heightFir_100m",
      "c2_heightFir_150m",
      "c3_timeFir_32s",
      "c3_timeFir_40s",
      "baseline_binMean100m",
    ]) {
      const op = c.operators[key];
      const specC = c.spectralCompare[key];
      const r16 = specC?.u16to20Ratio ?? "n/a";
      lines.push(
        `  ${key} SRH01=${op.layers.near0to1.srh} SRH03=${op.layers.near0to3.srh} BWD06=${op.layers.near0to6.bulkMagnitude} BWD500-6=${op.launchIndependentBulk?.bulk500to6} BWD1-6=${op.launchIndependentBulk?.bulk1000to6} ωmed=${op.omegaAll.median} first=(${op.firstKnot.eastward},${op.firstKnot.northward}) u16-20=${r16}`,
      );
    }
  }
  lines.push(
    `moore medianΔz=${mooreCompat.medianDzM} leise5 stopband≈${mooreCompat.nativeIndexLeise5.stopbandEquivalentMedianM}m applicability=${mooreCompat.escPolicyApplicability}`,
  );
  console.log(lines.join("\n"));
}

main();
