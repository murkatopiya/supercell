/**
 * Adaptation notice: the one-dimensional filtering/control sequence is
 * adapted from Jim Leise's T5FLTR (8/80), NCAR/lrose-cedric:
 * https://github.com/NCAR/lrose-cedric/blob/master/cedric/legacy/svn-trunk/T5FLTR.f
 * Modified JavaScript research sampler; not the original UCAR implementation.
 * Adapted upstream material retains the following LROSE license; it is excluded
 * from the Iryna-owned project-code license. See ../../THIRD_PARTY_NOTICES.md.
 *
 * LROSE BSD LICENSE
 * =================
 *
 * Copyright (c) 1990 - 2016, University Corporation for Atmospheric
 * Research (UCAR), Boulder, Colorado, USA.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * 1) If the software is modified to produce derivative works, such
 * modified software should be clearly marked, so as not to confuse it
 * with the version available from UCAR.
 *
 * 2) Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *
 * 3) Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * 4) Neither the name of UCAR nor the names of its contributors, if any,
 * may be used to endorse or promote products derived from this software
 * without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Research-only: reconstruct the Leise T5FLTR 5-step operator and compare
 * it with a 100 m bin-mean, a 100 m-class boxcar, and a Hamming-sinc FIR.
 * Not a production API. Does not mutate Source goldens or src/**.
 *
 * Leise kernel: CEDRIC T5FLTR.f (Jim Leise 8/80), the FORTRAN package
 * shipped with NOAA Tech. Memo. ERL WPL-82.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const artifactsDir = join(here, "artifacts");

const PUBLISHED_C = { eastward: 10.5, northward: -1.3 };
const PUBLISHED_GOSHEN = {
  srh0to1: 88,
  srh0to3: 167,
  bulk0to6: 29,
};

const ESC_CASES = [
  {
    id: "goshen",
    label: "Goshen NSSL1 2009-06-05 21:55:22",
    goldenPath: join(
      root,
      "src/data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json",
    ),
    expectedN: 2029,
    medianAscent: 5.7,
  },
  {
    id: "prospect",
    label: "Prospect Valley NSSL1 2010-05-26 22:23:46",
    goldenPath: join(
      root,
      "src/data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.normalized.json",
    ),
    expectedN: 2733,
    medianAscent: 4.8,
  },
  {
    id: "dumas",
    label: "Dumas/Stinnett NSSL2 2010-05-18 21:52:18",
    goldenPath: join(
      root,
      "src/data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.normalized.json",
    ),
    expectedN: 2917,
    medianAscent: 5.2,
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
  medianAscent: null,
};

function round(value, digits) {
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
    return { n: 0, min: null, median: null, p90: null, max: null, mean: null };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return {
    n: values.length,
    min: round(sorted[0], 6),
    median: round(percentile(sorted, 0.5), 6),
    p90: round(percentile(sorted, 0.9), 6),
    max: round(sorted[sorted.length - 1], 6),
    mean: round(mean, 6),
  };
}

function loadLevels(path) {
  const golden = JSON.parse(readFileSync(path, "utf8"));
  return golden.levels.map((level) => ({
    height: level.height,
    eastward: level.eastward,
    northward: level.northward,
  }));
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
  if (out[out.length - 1].height < end) {
    out.push(sampleAtHeight(levels, end));
  }
  return out;
}

function applyToComponents(levels, transform) {
  const eastward = transform(levels.map((l) => l.eastward));
  const northward = transform(levels.map((l) => l.northward));
  return levels.map((level, i) => ({
    height: level.height,
    eastward: eastward[i],
    northward: northward[i],
  }));
}

/**
 * Original Leise 5-pt central stencil (T5FLTR.f):
 *   [-1/16, 1/4, 5/8, 1/4, -1/16]
 * Boundary: half-sample mirror, y[-1]=y[0], y[-2]=y[1].
 */
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
      0.625 * v[i] +
      0.25 * (v[i - 1] + v[i + 1]) -
      0.0625 * (v[i - 2] + v[i + 2]);
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

/**
 * 1-D T5FLTR. NSTEP pyramid: 2*NSTEP-1 passes of the 5-pt filter.
 * Strides climb 1,2,4,...,2^(N-1) then descend. Coarsest stride once;
 * finer strides twice. Restriction: n >= 5*2^(NSTEP-1).
 */
function leiseT5(values, nstep) {
  const y = values.slice();
  const n = y.length;
  if (nstep <= 0 || n < 5) return y;
  const minN = 5 * 2 ** (nstep - 1);
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
  return { values: y, minN, feasible: n >= minN, n, nstep };
}

function leiseT5Values(values, nstep) {
  return leiseT5(values, nstep).values;
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
    const theta = (2 * Math.PI * stride) / wavelengthSamples;
    gain *= h5(theta);
  }
  return gain;
}

function boxcarGain(widthSamples, wavelengthSamples) {
  if (wavelengthSamples <= 0) return null;
  const x = widthSamples / wavelengthSamples;
  if (Math.abs(x) < 1e-15) return 1;
  return Math.sin(Math.PI * x) / (Math.PI * x);
}

function hammingSincLowpass(fc, numTaps) {
  const m = (numTaps - 1) / 2;
  const h = [];
  let sum = 0;
  for (let n = 0; n < numTaps; n++) {
    const k = n - m;
    const sinc =
      k === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * k) / (Math.PI * k);
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

function movingAverageOdd(values, width) {
  const kernel = new Array(width).fill(1 / width);
  return convolveMirror(values, kernel);
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
    const height =
      members.reduce((s, m) => s + m.height, 0) / members.length;
    const eastward =
      members.reduce((s, m) => s + m.eastward, 0) / members.length;
    const northward =
      members.reduce((s, m) => s + m.northward, 0) / members.length;
    out.push({ height, eastward, northward });
  }
  for (let i = 1; i < out.length; i++) {
    if (out[i].height <= out[i - 1].height) {
      throw new Error("bin-mean heights not strictly increasing");
    }
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
  return {
    eastward: de,
    northward: dn,
    magnitude: hypot2(de, dn),
  };
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
    layers[name] = {
      h0: round(hMin, 2),
      h1,
      srh: round(srhBetween(levels, c, hMin, h1), 3),
      bulkMagnitude: round(bwd.magnitude, 4),
      shearMagnitude: round(bwd.magnitude / (h1 - hMin), 8),
    };
  }
  return layers;
}

function omegaMagnitudes(levels) {
  const out = [];
  for (let i = 1; i < levels.length; i++) {
    const dh = levels[i].height - levels[i - 1].height;
    if (!(dh > 0)) continue;
    const de = levels[i].eastward - levels[i - 1].eastward;
    const dn = levels[i].northward - levels[i - 1].northward;
    out.push(hypot2(de, dn) / dh);
  }
  return out;
}

function hodographArcLength(levels, h0, h1) {
  const knots = [];
  knots.push(sampleAtHeight(levels, h0));
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

function empiricalGain(filterFn, n, wavelength) {
  const x = new Array(n);
  for (let i = 0; i < n; i++) x[i] = Math.cos((2 * Math.PI * i) / wavelength);
  const y = filterFn(x);
  const mid = Math.floor(n / 2);
  const span = Math.min(256, Math.floor(n / 4));
  let num = 0;
  let den = 0;
  for (let i = mid - span; i <= mid + span; i++) {
    num += y[i] * x[i];
    den += x[i] * x[i];
  }
  return den > 0 ? num / den : null;
}

function polylineSvg(series, width, height, xMin, xMax, yMin, yMax, stroke) {
  const pts = [];
  for (const p of series) {
    const x = ((p.x - xMin) / (xMax - xMin)) * (width - 48) + 40;
    const y = height - 28 - ((p.y - yMin) / (yMax - yMin)) * (height - 44);
    pts.push(`${round(x, 1)},${round(y, 1)}`);
  }
  return `<polyline fill="none" stroke="${stroke}" stroke-width="1.2" points="${pts.join(" ")}"/>`;
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

function operatorBundle(raw, firKernel) {
  const n = raw.length;
  const leiseNative = applyToComponents(raw, (v) => leiseT5Values(v, 5));
  const regular5 = interpolateRegularHeight(raw, 5);
  const leise5m = applyToComponents(regular5, (v) => leiseT5Values(v, 5));
  const boxcar5m = applyToComponents(regular5, (v) => movingAverageOdd(v, 21));
  const fir5m = applyToComponents(regular5, (v) => convolveMirror(v, firKernel));
  const bin100 = binMean100m(raw);
  return {
    raw,
    leiseNative,
    regular5,
    leise5m,
    boxcar5m,
    fir5m,
    bin100,
    leiseFeasible: n >= 5 * 2 ** 4,
  };
}

function describeOperator(name, levels, c, extra) {
  const layers = layerMetrics(levels, c);
  const omega = omegaMagnitudes(levels);
  const hMin = levels[0].height;
  const hMax = levels[levels.length - 1].height;
  const h1 = Math.min(6000, hMax);
  return {
    name,
    n: levels.length,
    hMin: round(hMin, 3),
    hMax: round(hMax, 3),
    firstKnot: {
      height: round(levels[0].height, 3),
      eastward: round(levels[0].eastward, 4),
      northward: round(levels[0].northward, 4),
    },
    layers,
    omega: stats(omega),
    arcLength0to6:
      hMax >= 1000 ? round(hodographArcLength(levels, hMin, h1), 4) : null,
    ...extra,
  };
}

function spectralForNative(levels, dx) {
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
  const slim = (band) => ({
    n: band.n,
    sum: round(band.sum, 8),
    peakPeriod: band.peakPeriod === null ? null : round(band.peakPeriod, 3),
    peakPower: round(band.peakPower, 8),
  });
  return {
    u16to20: slim(bandPower(pgU.bins, 16, 20)),
    v16to20: slim(bandPower(pgV.bins, 16, 20)),
    u6to20: slim(bandPower(pgU.bins, 6, 20)),
    v6to20: slim(bandPower(pgV.bins, 6, 20)),
    u25to40: slim(bandPower(pgU.bins, 25, 40)),
    periodogramU: pgU.bins.filter((b) => b.period >= 6 && b.period <= 80),
  };
}

function spectralForHeight(levels, dz) {
  const uRes = movingAverageResidual(
    levels.map((l) => l.eastward),
    Math.max(1, Math.round(75 / dz)),
  );
  const pgU = hannPeriodogram(uRes, dz);
  const slim = (band) => ({
    n: band.n,
    sum: round(band.sum, 8),
    peakPeriod: band.peakPeriod === null ? null : round(band.peakPeriod, 3),
    peakPower: round(band.peakPower, 8),
  });
  return {
    u90to110: slim(bandPower(pgU.bins, 90, 110)),
    u60to140: slim(bandPower(pgU.bins, 60, 140)),
    u400to800: slim(bandPower(pgU.bins, 400, 800)),
    periodogramU: pgU.bins.filter((b) => b.period >= 20 && b.period <= 800),
  };
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

function main() {
  mkdirSync(artifactsDir, { recursive: true });

  const firTaps = 41;
  const firFc = 5 / 100;
  const firKernel = hammingSincLowpass(firFc, firTaps);

  const wavelengths = [];
  for (let p = 2; p <= 256; p += 1) wavelengths.push(p);

  const transfer = wavelengths.map((lam) => ({
    wavelengthSamples: lam,
    leise5: leiseAnalyticGain(5, lam),
    leise1: leiseAnalyticGain(1, lam),
    boxcar20: boxcarGain(20, lam),
    boxcar21: boxcarGain(21, lam),
    fir41_fc0p05: firGain(firKernel, lam),
  }));

  const nSine = 2048;
  const empiricalCheck = [4, 8, 16, 18, 19, 32, 64, 100, 128].map((lam) => {
    const analytic = leiseAnalyticGain(5, lam);
    const empirical = empiricalGain((x) => leiseT5Values(x, 5), nSine, lam);
    return {
      wavelengthSamples: lam,
      analytic: round(analytic, 6),
      empiricalMid: round(empirical, 6),
      absDiff: round(Math.abs(analytic - empirical), 6),
    };
  });

  const leise5at = {
    samples2: leiseAnalyticGain(5, 2),
    samples16: leiseAnalyticGain(5, 16),
    samples18: leiseAnalyticGain(5, 18),
    samples19: leiseAnalyticGain(5, 19),
    samples32: leiseAnalyticGain(5, 32),
    samples64: leiseAnalyticGain(5, 64),
    samples128: leiseAnalyticGain(5, 128),
  };

  const domainMap = ESC_CASES.map((spec) => {
    const t = [17, 18, 19];
    return {
      id: spec.id,
      medianAscent: spec.medianAscent,
      equivalentVerticalM: t.map((s) => round(s * spec.medianAscent, 1)),
      leise5NativeIndexStopbandM: round(32 * spec.medianAscent, 1),
      leise5On5mStopbandM: 32 * 5,
      leise5On5mEquivalentPeriodS: round((32 * 5) / spec.medianAscent, 2),
      boxcar100mEquivalentPeriodS: round(100 / spec.medianAscent, 2),
    };
  });

  const caseResults = {};
  for (const spec of ESC_CASES) {
    const raw = loadLevels(spec.goldenPath);
    if (raw.length !== spec.expectedN) {
      throw new Error(`${spec.id}: expected ${spec.expectedN}, got ${raw.length}`);
    }
    const bundle = operatorBundle(raw, firKernel);
    const dh = [];
    for (let i = 1; i < raw.length; i++) dh.push(raw[i].height - raw[i - 1].height);
    const nativeSpec = spectralForNative(bundle.raw, 1);
    const leiseNativeSpec = spectralForNative(bundle.leiseNative, 1);
    const heightRaw = spectralForHeight(bundle.regular5, 5);
    const heightLeise = spectralForHeight(bundle.leise5m, 5);
    const heightBox = spectralForHeight(bundle.boxcar5m, 5);
    const heightFir = spectralForHeight(bundle.fir5m, 5);
    const dropPg = ({ periodogramU, ...rest }) => rest;

    caseResults[spec.id] = {
      label: spec.label,
      n: raw.length,
      dHeight: stats(dh),
      medianAscentAssumed: spec.medianAscent,
      operators: {
        raw: describeOperator("raw", bundle.raw, PUBLISHED_C),
        leise5_nativeIndex: describeOperator(
          "leise5_nativeIndex_T5FLTR",
          bundle.leiseNative,
          PUBLISHED_C,
          {
            domain: "sample-index (≈1 s if ESC dt=1 s)",
            stopbandSamples: 32,
            stopbandEquivalentM: round(32 * spec.medianAscent, 1),
          },
        ),
        leise5_regular5m: describeOperator(
          "leise5_regular5m_T5FLTR",
          bundle.leise5m,
          PUBLISHED_C,
          {
            domain: "uniform height 5 m, research linear resample",
            stopbandM: 160,
            equivalentPeriodS: round(160 / spec.medianAscent, 2),
          },
        ),
        boxcar21_regular5m: describeOperator(
          "boxcar21_regular5m_105m",
          bundle.boxcar5m,
          PUBLISHED_C,
          { domain: "uniform height 5 m", widthM: 105 },
        ),
        firHamming41_regular5m: describeOperator(
          "firHamming41_fc5over100_regular5m",
          bundle.fir5m,
          PUBLISHED_C,
          {
            domain: "uniform height 5 m",
            fc: "0.05 cycles/sample ≡ 100 m wavelength on 5 m grid",
            taps: firTaps,
          },
        ),
        binMean100m: describeOperator("binMean100m_AGL", bundle.bin100, PUBLISHED_C, {
          domain: "height bins, no interpolation of empty bins",
          dz: 100,
        }),
      },
      spectralNativeIndex: {
        raw: dropPg(nativeSpec),
        leise5: dropPg(leiseNativeSpec),
        u16to20Ratio: round(
          leiseNativeSpec.u16to20.sum / Math.max(nativeSpec.u16to20.sum, 1e-30),
          6,
        ),
        v16to20Ratio: round(
          leiseNativeSpec.v16to20.sum / Math.max(nativeSpec.v16to20.sum, 1e-30),
          6,
        ),
      },
      spectralHeight5m: {
        raw: dropPg(heightRaw),
        leise5: dropPg(heightLeise),
        boxcar21: dropPg(heightBox),
        fir41: dropPg(heightFir),
        u90to110_leiseRatio: round(
          heightLeise.u90to110.sum / Math.max(heightRaw.u90to110.sum, 1e-30),
          6,
        ),
        u90to110_boxcarRatio: round(
          heightBox.u90to110.sum / Math.max(heightRaw.u90to110.sum, 1e-30),
          6,
        ),
        u90to110_firRatio: round(
          heightFir.u90to110.sum / Math.max(heightRaw.u90to110.sum, 1e-30),
          6,
        ),
      },
      publishedGoshenExternal:
        spec.id === "goshen"
          ? {
              ...PUBLISHED_GOSHEN,
              note: "Fig. 2b inset for the SMOOTH curve. Not a tuning target.",
            }
          : null,
    };
  }

  const mooreRaw = loadLevels(MOORE.goldenPath);
  if (mooreRaw.length !== MOORE.expectedN) {
    throw new Error(`moore: expected ${MOORE.expectedN}, got ${mooreRaw.length}`);
  }
  const mooreDh = [];
  for (let i = 1; i < mooreRaw.length; i++) {
    mooreDh.push(mooreRaw[i].height - mooreRaw[i - 1].height);
  }
  const mooreLeise = leiseT5(
    mooreRaw.map((l) => l.eastward),
    5,
  );
  const mooreBin = binMean100m(mooreRaw);
  const mooreRegular5 = interpolateRegularHeight(mooreRaw, 5);
  const emptyBinEstimate = Math.ceil(
    (mooreRaw[mooreRaw.length - 1].height - mooreRaw[0].height) / 100,
  );

  const mooreResult = {
    label: MOORE.label,
    n: mooreRaw.length,
    dHeight: stats(mooreDh),
    leise5_nativeIndex: {
      mathematicallyFeasible: mooreLeise.feasible,
      minN: mooreLeise.minN,
      n: mooreLeise.n,
      stopbandIfAppliedAsIndex: "32 native levels, not 32×100 m",
      medianDz: 174,
      stopbandEquivalentMedianM: 32 * 174,
      note: "NSTEP=5 on 165 irregular RAOB levels is a sample-index operator. It is not a 100 m filter. Applying it pretends native Δz is the analysis scale.",
    },
    binMean100m: describeOperator("binMean100m_AGL", mooreBin, PUBLISHED_C, {
      possibleBins: emptyBinEstimate,
      emittedKnots: mooreBin.length,
      skippedEmptyBins: emptyBinEstimate - mooreBin.length,
      note: "Empty bins skipped. Output spacing remains O(median 174 m), not 100 m. 100 m is finer than the source.",
    }),
    regular5mLeise: {
      wouldInventSubgrid: true,
      nAfterLinearResample: mooreRegular5.length,
      note: "Linear interpolation to 5 m then Leise-5 would fabricate ~20 knots per native gap. Fake precision. Not run as a candidate metric source.",
    },
    operators: {
      raw: describeOperator("raw", mooreRaw, PUBLISHED_C),
    },
  };

  const goshen = caseResults.goshen;
  const summary = {
    generatedAt: "2026-08-28",
    purpose:
      "Reconstruct Leise T5FLTR (NSTEP=5) and compare analysis-operator responses. Not a production filter selection.",
    citation: {
      original: "Leise, J. A., 1981: NOAA Tech. Memo. ERL WPL-82. FORTRAN T5FLTR dated 8/80.",
      cedricSource:
        "NCAR/RadarAnalysisTools cedric/trunk/T5FLTR.f (Jim Leise 8/80 comments intact)",
      cedricManual:
        "CEDRIC User Manual, September 2009, FILTER command, data.eol.ucar.edu cedric.2009sep_doc.pdf",
      markowski:
        "Markowski et al. 2012 MWR Part I Fig. 2b caption (5-step) and methods (3-step suppresses ≤8Δ)",
      cai2005:
        "Cai 2005 MWR: cutoff 2^m Δ; wavelength 2^{m+1} Δ damped ~24%",
    },
    algorithm: {
      stencil: [-0.0625, 0.25, 0.625, 0.25, -0.0625],
      boundary: "half-sample mirror (repeat-endpoint): y[-1]=y[0], y[-2]=y[1]",
      nstepMeaning:
        "NSTEP pyramid of 2*NSTEP-1 five-point passes; strides 1..2^(N-1)..1",
      stridesN5: leiseStrides(5),
      stopbandSamples: "≥ 2^NSTEP grid points/cycle (Leise comment; CEDRIC first zero)",
      passbandSamples: "≤ 2^(NSTEP+2) in Leise comment; |H|(2^{N+1})≈0.75^k depending on pyramid",
      uniformSpacingRequired: true,
      uAndVIndependent: true,
      zeroPhase: true,
      previousProxyNote:
        "docs/research/sample-goshen-2155-hodograph-reproduction.ts used two-way 1-2-1, frozen ends. That is NOT T5FLTR.",
    },
    transferChecks: empiricalCheck,
    leise5GainAtSelectedWavelengths: leise5at,
    domainMap,
    fir: {
      type: "symmetric Hamming-windowed sinc FIR, unity DC gain",
      taps: firTaps,
      fc_cyclesPerSample: firFc,
      designGrid: "5 m height",
      cutoffWavelengthM: 100,
      phase: "linear / zero after centering",
    },
    boxcar: {
      sliding: "21-point on 5 m grid = 105 m, nearest odd length to 100 m",
      binMean: "architecture 54 candidate: 100 m AGL bins, mean of member knots",
    },
    stormMotionForComparison: PUBLISHED_C,
    stormMotionNote:
      "Published Goshen C is used for ALL cases so operator-to-operator SRH is comparable. It is NOT observed storm motion for Prospect, Dumas, or Moore.",
    cases: caseResults,
    moore: mooreResult,
    transferSelected: [2, 4, 8, 16, 18, 19, 20, 21, 32, 40, 64, 100, 105, 128].map(
      (lam) => transfer.find((t) => t.wavelengthSamples === lam),
    ),
  };

  writeFileSync(
    join(artifactsDir, "leise-filter-and-analysis-operator-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );

  const tfSeries = [
    {
      name: "Leise-5 T5FLTR",
      stroke: "#1d4ed8",
      pts: transfer.map((t) => ({ x: t.wavelengthSamples, y: Math.abs(t.leise5) })),
    },
    {
      name: "boxcar 20",
      stroke: "#b45309",
      pts: transfer.map((t) => ({ x: t.wavelengthSamples, y: Math.abs(t.boxcar20) })),
    },
    {
      name: "FIR Hamming 41 fc=0.05",
      stroke: "#047857",
      pts: transfer.map((t) => ({
        x: t.wavelengthSamples,
        y: Math.abs(t.fir41_fc0p05),
      })),
    },
  ];
  const tfInner = [
    polylineSvg(tfSeries[0].pts, 720, 280, 2, 128, 0, 1.05, tfSeries[0].stroke),
    polylineSvg(tfSeries[1].pts, 720, 280, 2, 128, 0, 1.05, tfSeries[1].stroke),
    polylineSvg(tfSeries[2].pts, 720, 280, 2, 128, 0, 1.05, tfSeries[2].stroke),
    `<text x="48" y="268" font-size="10" font-family="sans-serif">wavelength (samples) → 128</text>`,
    `<text x="520" y="36" font-size="10" fill="#1d4ed8" font-family="sans-serif">Leise-5</text>`,
    `<text x="520" y="50" font-size="10" fill="#b45309" font-family="sans-serif">boxcar 20</text>`,
    `<text x="520" y="64" font-size="10" fill="#047857" font-family="sans-serif">FIR Hamming-41</text>`,
    `<line x1="${40 + ((18 - 2) / 126) * 672}" y1="20" x2="${40 + ((18 - 2) / 126) * 672}" y2="252" stroke="#991b1b" stroke-dasharray="3 3"/>`,
    `<text x="118" y="32" font-size="9" fill="#991b1b" font-family="sans-serif">18 samples</text>`,
  ].join("\n");
  writeSvg(
    join(artifactsDir, "leise-transfer-function.svg"),
    tfInner,
    720,
    280,
    "Amplitude response vs wavelength (samples)",
  );

  const goshenRaw = loadLevels(ESC_CASES[0].goldenPath);
  const goshenBundle = operatorBundle(goshenRaw, firKernel);
  const hodographs = [
    { name: "raw", stroke: "#9ca3af", levels: goshenBundle.raw },
    { name: "Leise-5 index", stroke: "#1d4ed8", levels: goshenBundle.leiseNative },
    { name: "bin 100 m", stroke: "#b45309", levels: goshenBundle.bin100 },
    { name: "FIR 5 m", stroke: "#047857", levels: goshenBundle.fir5m },
  ];
  let hodInner = "";
  for (const h of hodographs) {
    const pts = hodographPoints(h.levels, PUBLISHED_C, 6000).map((p) => ({
      x: p.x,
      y: p.y,
    }));
    hodInner += polylineSvg(pts, 640, 480, -20, 25, -8, 22, h.stroke);
  }
  hodInner += `<circle cx="${40 + ((0 + 20) / 45) * 592}" cy="${480 - 28 - ((0 + 8) / 30) * 436}" r="3" fill="#111"/>`;
  hodInner += `<text x="430" y="36" font-size="10" fill="#9ca3af" font-family="sans-serif">raw</text>`;
  hodInner += `<text x="430" y="50" font-size="10" fill="#1d4ed8" font-family="sans-serif">Leise-5 native index</text>`;
  hodInner += `<text x="430" y="64" font-size="10" fill="#b45309" font-family="sans-serif">100 m bin-mean</text>`;
  hodInner += `<text x="430" y="78" font-size="10" fill="#047857" font-family="sans-serif">FIR Hamming-41 on 5 m</text>`;
  writeSvg(
    join(artifactsDir, "leise-goshen-sr-hodograph-0-6km.svg"),
    hodInner,
    640,
    480,
    "Goshen 0-6 km AGL storm-relative (C=10.5,-1.3)",
  );

  const specPts = (bins, keyPower) =>
    bins
      .filter((b) => b.period >= 6 && b.period <= 40)
      .map((b) => ({ x: b.period, y: Math.log10(Math.max(b.power, 1e-18)) }));
  const rawSpec = spectralForNative(goshenBundle.raw, 1).periodogramU;
  const leiSpec = spectralForNative(goshenBundle.leiseNative, 1).periodogramU;
  const specInner = [
    polylineSvg(specPts(rawSpec), 720, 280, 6, 40, -6, 2, "#9ca3af"),
    polylineSvg(specPts(leiSpec), 720, 280, 6, 40, -6, 2, "#1d4ed8"),
    `<text x="520" y="36" font-size="10" fill="#9ca3af" font-family="sans-serif">raw residual U</text>`,
    `<text x="520" y="50" font-size="10" fill="#1d4ed8" font-family="sans-serif">Leise-5 native</text>`,
  ].join("\n");
  writeSvg(
    join(artifactsDir, "leise-goshen-u-residual-periodogram.svg"),
    specInner,
    720,
    280,
    "Goshen U residual periodogram (log10 power) vs period s",
  );

  const lines = [];
  lines.push("Leise T5FLTR reconstruction checks");
  lines.push(`strides N=5: ${leiseStrides(5).join(",")}`);
  lines.push(
    `H5(λ=2)=${leiseAnalyticGain(1, 2).toFixed(6)} (NSTEP=1 first zero, expect 0)`,
  );
  lines.push(
    `H5(λ=4)=${leiseAnalyticGain(1, 4).toFixed(6)} (Cai ~0.75 / 24% reduction)`,
  );
  lines.push(`Leise-5 |H|(18 s samples)=${leise5at.samples18.toExponential(3)}`);
  lines.push(`Leise-5 |H|(32)=${leise5at.samples32.toExponential(3)}`);
  lines.push(`Leise-5 |H|(64)=${leise5at.samples64.toFixed(4)}`);
  for (const id of ["goshen", "prospect", "dumas"]) {
    const c = caseResults[id];
    lines.push(
      `${id} SRH0-1 raw ${c.operators.raw.layers.near0to1.srh}  leiseIdx ${c.operators.leise5_nativeIndex.layers.near0to1.srh}  bin100 ${c.operators.binMean100m.layers.near0to1.srh}  fir ${c.operators.firHamming41_regular5m.layers.near0to1.srh}`,
    );
    lines.push(
      `${id} BWD0-6 raw ${c.operators.raw.layers.near0to6.bulkMagnitude}  leiseIdx ${c.operators.leise5_nativeIndex.layers.near0to6.bulkMagnitude}  bin100 ${c.operators.binMean100m.layers.near0to6.bulkMagnitude}`,
    );
    lines.push(
      `${id} U16-20 power ratio leise/raw ${c.spectralNativeIndex.u16to20Ratio}`,
    );
  }
  lines.push(
    `moore n=${mooreResult.n} bin100 emitted ${mooreResult.binMean100m.emittedKnots}/${mooreResult.binMean100m.possibleBins} leise feasible ${mooreResult.leise5_nativeIndex.mathematicallyFeasible}`,
  );
  console.log(lines.join("\n"));
}

main();
