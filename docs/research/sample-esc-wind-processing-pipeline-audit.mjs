/**
 * Research-only audit: could Aspen / RS92 / GAUS processing create or
 * reshape the ~17–19 s U/V signature in published ESC winds?
 * Not a production API. Does not write into Source data or src/.
 * Reads gitignored native data/ copies.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const artifactsDir = join(here, "artifacts");

const ESC_MISSING_WIND = 9999.0;
const ESC_MISSING_ALTITUDE = 99999.0;
const ESC_MISSING_POS = 9999.0;
const ESC_QC_MISSING = 9.0;
const ESC_QC_BAD = 3.0;

const CASES = [
  {
    id: "goshen",
    label: "Goshen NSSL1 2009-06-05 21:55:22",
    path: join(root, "data/114.114 Goshen/NSSL_MGAUS_20090605.cls"),
    siteIdIncludes: "NSSL1",
    utcReleaseTime: "2009, 06, 05, 21:55:22",
    expectedLaunchElevationM: 1557.9,
  },
  {
    id: "prospect",
    label: "Prospect Valley NSSL1 2010-05-26 22:23:46",
    path: join(root, "data/114.114 2010-05-26/NSSL_MGAUS_20100526.cls"),
    siteIdIncludes: "NSSL1",
    utcReleaseTime: "2010, 05, 26, 22:23:46",
    expectedLaunchElevationM: 1358.9,
  },
  {
    id: "dumas",
    label: "Dumas/Stinnett NSSL2 2010-05-18 21:52:18",
    path: join(root, "data/114.114 2010-05-18/NSSL_MGAUS_20100518.cls"),
    siteIdIncludes: "NSSL2",
    utcReleaseTime: "2010, 05, 18, 21:52:18",
    expectedLaunchElevationM: 1122.1,
  },
];

function round(value, digits) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

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
    siteId: headerValue(lines, "Release Site Type/Site ID"),
    utcReleaseTime: headerValue(lines, "UTC Release Time (y,m,d,h,m,s)"),
    sonde: headerValue(lines, "Sonde Id/Sonde Type"),
    postProcessing: headerValue(lines, "Post Processing Comments"),
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
    wcmp: Number(parts[9]),
    lon: Number(parts[10]),
    lat: Number(parts[11]),
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

function retainI1(block, spec) {
  if (block.header.launchElevation !== spec.expectedLaunchElevationM) {
    throw new Error(`${spec.label}: launch elevation mismatch`);
  }
  const kept = [];
  for (const record of block.records) {
    if (!isUsableWindRecord(record)) continue;
    kept.push({
      time: record.time,
      height: roundTenth(record.alt - spec.expectedLaunchElevationM),
      u: record.u,
      v: record.v,
      wcmp: record.wcmp,
      lon: record.lon,
      lat: record.lat,
      alt: record.alt,
    });
  }
  return kept;
}

function interpolateUniform1s(kept) {
  const t0 = Math.ceil(kept[0].time);
  const t1 = Math.floor(kept[kept.length - 1].time);
  const times = [];
  const u = [];
  const v = [];
  const height = [];
  const wcmp = [];
  let j = 0;
  let nObs = 0;
  for (let t = t0; t <= t1; t += 1) {
    while (j + 1 < kept.length && kept[j + 1].time < t) j += 1;
    const a = kept[j];
    const b = kept[Math.min(j + 1, kept.length - 1)];
    times.push(t);
    if (a.time === t || b.time === t) {
      const src = a.time === t ? a : b;
      u.push(src.u);
      v.push(src.v);
      height.push(src.height);
      wcmp.push(src.wcmp);
      nObs += 1;
    } else if (b.time !== a.time && t > a.time && t < b.time) {
      const w = (t - a.time) / (b.time - a.time);
      u.push(a.u + w * (b.u - a.u));
      v.push(a.v + w * (b.v - a.v));
      height.push(a.height + w * (b.height - a.height));
      wcmp.push(a.wcmp + w * (b.wcmp - a.wcmp));
    } else {
      u.push(a.u);
      v.push(a.v);
      height.push(a.height);
      wcmp.push(a.wcmp);
    }
  }
  return { times, u, v, height, wcmp, observedShare: nObs / times.length, t0, t1 };
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

function residual(values, halfWindow) {
  const bg = movingAverage(values, halfWindow);
  return values.map((x, i) => x - bg[i]);
}

function hann(n) {
  const w = new Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
  return w;
}

function dft(values) {
  const n = values.length;
  const w = hann(n);
  let meanW = 0;
  for (const wi of w) meanW += wi;
  meanW /= n;
  let mean = 0;
  for (const v of values) mean += v;
  mean /= n;
  const x = values.map((v, i) => (v - mean) * (w[i] / meanW));
  const nFreq = Math.floor(n / 2);
  const re = new Array(nFreq);
  const im = new Array(nFreq);
  for (let k = 0; k < nFreq; k++) {
    let r = 0;
    let m = 0;
    const ang0 = (-2 * Math.PI * k) / n;
    for (let t = 0; t < n; t++) {
      const ang = ang0 * t;
      r += x[t] * Math.cos(ang);
      m += x[t] * Math.sin(ang);
    }
    re[k] = r;
    im[k] = m;
  }
  return { n, dt: 1, re, im };
}

function periodogramFromDft(dftU) {
  const bins = [];
  for (let k = 1; k < dftU.re.length; k++) {
    const power = (dftU.re[k] * dftU.re[k] + dftU.im[k] * dftU.im[k]) / dftU.n;
    const freq = k / (dftU.n * dftU.dt);
    bins.push({ k, freq, period: 1 / freq, power });
  }
  return bins;
}

function welchCrossSpectrum(u, v, windowLen, overlapFrac) {
  const step = Math.max(1, Math.floor(windowLen * (1 - overlapFrac)));
  const acc = [];
  let nWindows = 0;
  for (let start = 0; start + windowLen <= u.length; start += step) {
    const dU = dft(u.slice(start, start + windowLen));
    const dV = dft(v.slice(start, start + windowLen));
    nWindows += 1;
    for (let k = 1; k < dU.re.length; k++) {
      if (!acc[k]) {
        acc[k] = { k, guu: 0, gvv: 0, covRe: 0, covIm: 0 };
      }
      acc[k].guu += (dU.re[k] * dU.re[k] + dU.im[k] * dU.im[k]) / dU.n;
      acc[k].gvv += (dV.re[k] * dV.re[k] + dV.im[k] * dV.im[k]) / dV.n;
      acc[k].covRe += (dU.re[k] * dV.re[k] + dU.im[k] * dV.im[k]) / dU.n;
      acc[k].covIm += (dU.im[k] * dV.re[k] - dU.re[k] * dV.im[k]) / dU.n;
    }
  }
  const bins = [];
  for (let k = 1; k < acc.length; k++) {
    const a = acc[k];
    if (!a) continue;
    const guu = a.guu / nWindows;
    const gvv = a.gvv / nWindows;
    const covRe = a.covRe / nWindows;
    const covIm = a.covIm / nWindows;
    const mag2 = covRe * covRe + covIm * covIm;
    const coh = guu > 0 && gvv > 0 ? mag2 / (guu * gvv) : 0;
    const freq = k / (windowLen * 1);
    bins.push({
      k,
      freq,
      period: 1 / freq,
      powerU: guu,
      powerV: gvv,
      coherence: coh,
      phaseDeg: (Math.atan2(covIm, covRe) * 180) / Math.PI,
    });
  }
  return { nWindows, windowLen, bins };
}

function localMaxima(bins, periodMin, periodMax) {
  const inBand = bins.filter((b) => b.period >= periodMin && b.period <= periodMax);
  const peaks = [];
  for (let i = 1; i < inBand.length - 1; i++) {
    if (inBand[i].power >= inBand[i - 1].power && inBand[i].power >= inBand[i + 1].power) {
      peaks.push(inBand[i]);
    }
  }
  return peaks.sort((a, b) => b.power - a.power);
}

function halfPowerWidth(bins, peak) {
  const half = peak.power / 2;
  let lo = peak;
  let hi = peak;
  const byK = new Map(bins.map((b) => [b.k, b]));
  for (let k = peak.k; k >= 1; k--) {
    const b = byK.get(k);
    if (!b || b.power < half) break;
    lo = b;
  }
  for (let k = peak.k; k < bins[bins.length - 1].k; k++) {
    const b = byK.get(k);
    if (!b || b.power < half) break;
    hi = b;
  }
  return {
    periodLoS: round(hi.period, 2),
    periodHiS: round(lo.period, 2),
    widthS: round(lo.period - hi.period, 2),
  };
}

function nearestBin(bins, period) {
  return bins.reduce((best, b) =>
    Math.abs(b.period - period) < Math.abs(best.period - period) ? b : best,
  );
}

function meanCoherencePhase(bins, periodLo, periodHi) {
  const inBand = bins.filter((b) => b.period >= periodLo && b.period <= periodHi);
  if (inBand.length === 0) return null;
  let sC = 0;
  let sSin = 0;
  let sCos = 0;
  for (const b of inBand) {
    sC += b.coherence;
    const rad = (b.phaseDeg * Math.PI) / 180;
    sSin += Math.sin(rad) * b.coherence;
    sCos += Math.cos(rad) * b.coherence;
  }
  const meanCoh = sC / inBand.length;
  const circ = (Math.atan2(sSin, sCos) * 180) / Math.PI;
  return {
    n: inBand.length,
    meanCoherence: round(meanCoh, 3),
    coherenceWeightedPhaseDeg: round(circ, 1),
  };
}

function xcorrMaxLag(u, v, maxLag) {
  const n = u.length;
  let mu = 0;
  let mv = 0;
  for (let i = 0; i < n; i++) {
    mu += u[i];
    mv += v[i];
  }
  mu /= n;
  mv /= n;
  const a = u.map((x) => x - mu);
  const b = v.map((x) => x - mv);
  let best = { lag: 0, r: -Infinity };
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    let s = 0;
    let va = 0;
    let vb = 0;
    const i0 = Math.max(0, -lag);
    const i1 = Math.min(n, n - lag);
    for (let i = i0; i < i1; i++) {
      s += a[i] * b[i + lag];
      va += a[i] * a[i];
      vb += b[i + lag] * b[i + lag];
    }
    const r = va > 0 && vb > 0 ? s / Math.sqrt(va * vb) : 0;
    if (r > best.r) best = { lag, r };
  }
  return { lagS: best.lag, r: round(best.r, 4) };
}

function amplitudeVsHeight(times, height, uRes, vRes, periodHint) {
  const win = 256;
  const step = 128;
  const rows = [];
  for (let start = 0; start + win <= times.length; start += step) {
    const u = uRes.slice(start, start + win);
    const v = vRes.slice(start, start + win);
    const h = height.slice(start, start + win);
    const bins = periodogramFromDft(dft(u));
    const peak = localMaxima(bins, 6, 20)[0];
    let rmsU = 0;
    let rmsV = 0;
    for (let i = 0; i < win; i++) {
      rmsU += u[i] * u[i];
      rmsV += v[i] * v[i];
    }
    rows.push({
      tMid: times[start + Math.floor(win / 2)],
      heightMid: round(h.reduce((s, x) => s + x, 0) / win, 1),
      residualRms: round(Math.sqrt((rmsU + rmsV) / win), 3),
      topPeriodS: peak ? round(peak.period, 2) : null,
      nearHint:
        peak && periodHint
          ? Math.abs(peak.period - periodHint) / periodHint <= 0.25
          : null,
    });
  }
  const near = rows.filter((r) => r.nearHint);
  return {
    nWindows: rows.length,
    fractionNearHint: rows.length ? round(near.length / rows.length, 3) : null,
    windows: rows,
  };
}

function lonLatPrecision(kept) {
  const lons = kept.map((k) => k.lon).filter((x) => Number.isFinite(x) && x < ESC_MISSING_POS / 2);
  const lats = kept.map((k) => k.lat).filter((x) => Number.isFinite(x) && Math.abs(x) < 900);
  const dLon = [];
  const dLat = [];
  for (let i = 1; i < kept.length; i++) {
    if (kept[i].time - kept[i - 1].time !== 1) continue;
    dLon.push(Math.abs(kept[i].lon - kept[i - 1].lon));
    dLat.push(Math.abs(kept[i].lat - kept[i - 1].lat));
  }
  const nonzeroLon = dLon.filter((d) => d > 0);
  const minStep = nonzeroLon.length ? Math.min(...nonzeroLon) : null;
  return {
    printedDecimalsLikely: 3,
    minNonzeroDlonDeg: minStep,
    minNonzeroDlonMApprox: minStep == null ? null : round(minStep * 111000 * Math.cos((lats[0] * Math.PI) / 180), 1),
    cannotRecover1sWindFromPosition:
      minStep == null || minStep >= 0.0005
        ? "ESC lon/lat print precision is too coarse for an independent 1-s wind derivative"
        : "unexpectedly fine position steps; inspect before claiming independence",
  };
}

function sinc(x) {
  if (Math.abs(x) < 1e-12) return 1;
  return Math.sin(Math.PI * x) / (Math.PI * x);
}

function illustrativeBoxcarGain(wavelengthS, periodS) {
  return Math.abs(sinc(wavelengthS / periodS));
}

function escToSvg(points, width, height, xMin, xMax, yMin, yMax) {
  const sx = (x) => ((x - xMin) / (xMax - xMin || 1)) * (width - 48) + 36;
  const sy = (y) => height - 28 - ((y - yMin) / (yMax - yMin || 1)) * (height - 48);
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
    .join(" ");
}

function svgFrame(title, body, width = 720, height = 280) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f7f4ee"/>
  <text x="16" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" fill="#222">${title}</text>
  ${body}
</svg>
`;
}

const missing = CASES.filter((c) => !existsSync(c.path));
if (missing.length) {
  throw new Error(`native ESC missing: ${missing.map((c) => c.path).join("; ")}`);
}
mkdirSync(artifactsDir, { recursive: true });

const results = [];
for (const spec of CASES) {
  const block = findBlock(parseEscConcatenated(readFileSync(spec.path, "utf8")), spec);
  const kept = retainI1(block, spec);
  const grid = interpolateUniform1s(kept);
  const uRes = residual(grid.u, 15);
  const vRes = residual(grid.v, 15);
  const specU = periodogramFromDft(dft(uRes));
  const specV = periodogramFromDft(dft(vRes));
  const welch = welchCrossSpectrum(uRes, vRes, 256, 0.5);
  const xspec = welch.bins;
  const peakU = localMaxima(specU, 6, 20)[0];
  const peakV = localMaxima(specV, 6, 20)[0];
  const peakPeriod = peakU?.period ?? 18;
  const atPeak = nearestBin(xspec, peakPeriod);
  const band1719 = meanCoherencePhase(xspec, 16, 20);
  const band6to20 = meanCoherencePhase(xspec, 6, 20);
  const harmonicHalf = nearestBin(xspec, peakPeriod / 2);
  const harmonic2 = nearestBin(xspec, peakPeriod * 2);
  const shoulder25 = nearestBin(specU, 32);
  const xcorr = xcorrMaxLag(uRes, vRes, 30);
  const amp = amplitudeVsHeight(grid.times, grid.height, uRes, vRes, peakPeriod);

  results.push({
    id: spec.id,
    label: spec.label,
    identity: {
      siteId: block.header.siteId,
      utcReleaseTime: block.header.utcReleaseTime,
      dataType: block.header.dataType,
      sonde: block.header.sonde,
      postProcessing: block.header.postProcessing,
    },
    interpolation: { n: grid.u.length, observedShare: round(grid.observedShare, 4) },
    welchCross: { nWindows: welch.nWindows, windowLenS: welch.windowLen, overlap: 0.5 },
    positionPrecision: lonLatPrecision(kept),
    peaks6to20s: {
      u: peakU
        ? {
            period: round(peakU.period, 3),
            power: round(peakU.power, 5),
            halfPower: halfPowerWidth(specU, peakU),
          }
        : null,
      v: peakV
        ? {
            period: round(peakV.period, 3),
            power: round(peakV.power, 5),
            halfPower: halfPowerWidth(specV, peakV),
          }
        : null,
    },
    crossSpectrumAtUPeak: {
      period: round(atPeak.period, 3),
      coherence: round(atPeak.coherence, 3),
      phaseDeg: round(atPeak.phaseDeg, 1),
    },
    coherencePhase: { band16to20s: band1719, band6to20s: band6to20 },
    harmonics: {
      halfPeriod: {
        period: round(harmonicHalf.period, 2),
        coherence: round(harmonicHalf.coherence, 3),
        powerU: round(harmonicHalf.powerU, 5),
      },
      doublePeriod: {
        period: round(harmonic2.period, 2),
        coherence: round(harmonic2.coherence, 3),
        powerU: round(harmonic2.powerU, 5),
      },
      near32sPowerU: round(shoulder25.power, 5),
      peakUPower: peakU ? round(peakU.power, 5) : null,
      ratio32sToPeakU: peakU ? round(shoulder25.power / peakU.power, 2) : null,
    },
    residualXcorrMax: xcorr,
    windowedAmplitude: {
      nWindows: amp.nWindows,
      fractionNearHint: amp.fractionNearHint,
      residualRms: {
        first: amp.windows[0]?.residualRms ?? null,
        mid: amp.windows[Math.floor(amp.windows.length / 2)]?.residualRms ?? null,
        last: amp.windows.at(-1)?.residualRms ?? null,
      },
    },
    plot: { specU, xspec },
  });
}

const illustrative = [0, 10, 20, 30, 40].map((W) => ({
  wavelengthS: W,
  note:
    W === 0
      ? "no smoother; gain = 1"
      : "illustrative boxcar/MA low-pass |sinc(W/T)|, NOT an Aspen B-spline clone",
  gainAt18s: W === 0 ? 1 : round(illustrativeBoxcarGain(W, 18), 3),
  gainAt11s: W === 0 ? 1 : round(illustrativeBoxcarGain(W, 11), 3),
  gainAt40s: W === 0 ? 1 : round(illustrativeBoxcarGain(W, 40), 3),
}));

const colors = { goshen: "#1f4e79", prospect: "#2a7f4f", dumas: "#b35c1f" };

const cohPts = results.map((r) => ({
  id: r.id,
  pts: r.plot.xspec
    .filter((b) => b.period >= 4 && b.period <= 60)
    .map((b) => ({ x: b.period, y: b.coherence })),
}));
const cohPaths = cohPts
  .map(
    (s) =>
      `<path d="${escToSvg(s.pts, 720, 280, 4, 60, 0, 1)}" fill="none" stroke="${colors[s.id]}" stroke-width="1.2"/>`,
  )
  .join("\n  ");
writeFileSync(
  join(artifactsDir, "esc-processing-uv-coherence.svg"),
  svgFrame(
    "U–V coherence vs period (30 s MA residual; research-only)",
    `${cohPaths}
  <text x="36" y="270" font-size="10" font-family="ui-sans-serif, system-ui, sans-serif" fill="#444">blue Goshen, green Prospect, orange Dumas; x = period s</text>`,
  ),
);

const phasePts = results.map((r) => ({
  id: r.id,
  pts: r.plot.xspec
    .filter((b) => b.period >= 6 && b.period <= 40)
    .map((b) => ({ x: b.period, y: b.phaseDeg })),
}));
const phasePaths = phasePts
  .map(
    (s) =>
      `<path d="${escToSvg(s.pts, 720, 280, 6, 40, -180, 180)}" fill="none" stroke="${colors[s.id]}" stroke-width="1.1"/>`,
  )
  .join("\n  ");
writeFileSync(
  join(artifactsDir, "esc-processing-uv-phase.svg"),
  svgFrame(
    "U–V cross-spectrum phase vs period (research-only)",
    `${phasePaths}
  <line x1="36" x2="684" y1="126" y2="126" stroke="#888" stroke-dasharray="3 3"/>
  <text x="36" y="270" font-size="10" font-family="ui-sans-serif, system-ui, sans-serif" fill="#444">±180°; dashed 0°. Quadrature ≈ ±90° would support rotating platform motion.</text>`,
  ),
);

const gainPts = [8, 10, 12, 15, 18, 20, 25, 30, 40, 60].flatMap((T) =>
  [10, 20, 40].map((W) => ({ W, T, g: illustrativeBoxcarGain(W, T) })),
);
const gainPaths = [10, 20, 40]
  .map((W, i) => {
    const col = ["#1f4e79", "#2a7f4f", "#b35c1f"][i];
    const pts = [6, 8, 10, 12, 15, 18, 20, 25, 30, 40, 50, 80].map((T) => ({
      x: T,
      y: illustrativeBoxcarGain(W, T),
    }));
    return `<path d="${escToSvg(pts, 720, 280, 6, 80, 0, 1)}" fill="none" stroke="${col}" stroke-width="1.3"/>`;
  })
  .join("\n  ");
writeFileSync(
  join(artifactsDir, "esc-processing-illustrative-lowpass-gain.svg"),
  svgFrame(
    "Illustrative MA low-pass |H| (NOT Aspen B-spline). W=10/20/40 s",
    `${gainPaths}
  <text x="36" y="270" font-size="10" font-family="ui-sans-serif, system-ui, sans-serif" fill="#444">blue W=10 s, green 20 s, orange 40 s; x = period s. A 40 s smoother strongly damps 18 s.</text>`,
  ),
);

const overlayPts = results.map((r) => {
  const bins = r.plot.specU.filter((b) => b.period >= 4 && b.period <= 60);
  const maxP = Math.max(...bins.map((b) => b.power), 1e-12);
  return {
    id: r.id,
    pts: bins.map((b) => ({ x: b.period, y: b.power / maxP })),
  };
});
const overlayPaths = overlayPts
  .map(
    (s) =>
      `<path d="${escToSvg(s.pts, 720, 280, 4, 60, 0, 1)}" fill="none" stroke="${colors[s.id]}" stroke-width="1.2"/>`,
  )
  .join("\n  ");
writeFileSync(
  join(artifactsDir, "esc-processing-u-residual-periodogram-overlay.svg"),
  svgFrame(
    "Normalized U residual PSD (research-only 30 s MA residual)",
    `${overlayPaths}
  <text x="36" y="270" font-size="10" font-family="ui-sans-serif, system-ui, sans-serif" fill="#444">blue Goshen, green Prospect, orange Dumas</text>`,
  ),
);

const summary = {
  generatedAt: "2026-08-28",
  purpose:
    "Research-only: could processing generate or reshape the ~17–19 s ESC U/V signature? Not an Analysis operator.",
  interpolationNote:
    "Linear interpolation onto integer seconds solely for spectral/cross-spectral diagnostics; never written back.",
  illustrativeFilter: illustrative,
  soundings: results.map(({ plot, ...rest }) => rest),
};

writeFileSync(
  join(artifactsDir, "esc-wind-processing-pipeline-audit-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      illustrative,
      checks: results.map((r) => ({
        id: r.id,
        postProcessing: r.identity.postProcessing,
        peaks: r.peaks6to20s,
        welch: r.welchCross,
        cross: r.crossSpectrumAtUPeak,
        coh: r.coherencePhase,
        harmonics: r.harmonics,
        xcorr: r.residualXcorrMax,
        windows: r.windowedAmplitude,
        position: r.positionPrecision,
      })),
    },
    null,
    2,
  ),
);
