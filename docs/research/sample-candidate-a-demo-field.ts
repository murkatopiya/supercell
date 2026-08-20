/**
 * Research-only DEMO Candidate A field sampler.
 * Not a production API. Not imported by composition, labs, or renderer.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { composeDemoTracersWithObservation } from "../../src/app/composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../../src/app/IntegrationFrame.js";
import { DEMO_SCENARIO } from "../../src/scenario/DEMO_SCENARIO.js";

const here = dirname(fileURLToPath(import.meta.url));
const artifactsDir = join(here, "artifacts");

const ROT = DEMO_SCENARIO.storm.rotation;
const OMEGA = ROT.angularVelocity;
const SIGMA = ROT.sigma;
const CENTER_X = ROT.centerX;
const CENTER_Z = ROT.centerZ;
const Y_BASE = ROT.baseHeight;
const Y_TOP = ROT.topHeight;
const HEIGHT_SPAN = Y_TOP - Y_BASE;
const Y_MID = (Y_BASE + Y_TOP) / 2;
const GRID_HALF = 3 * SIGMA;
const GRID_N = 41;
const TIME = 0;

const AXIS_HEIGHTS = [
  { y: -200, role: "below rotation layer" },
  { y: 0, role: "lower lid" },
  { y: 1000, role: "lower interior; physics 23 illustration" },
  { y: 3250, role: "y_mid; G = 1" },
  { y: 4000, role: "upper-mid interior; T1 y_mid for comparison" },
  { y: 5000, role: "upper interior" },
  { y: 6500, role: "upper lid" },
  { y: 8000, role: "above rotation; still inside updraft" },
  { y: 9000, role: "above rotation layer" },
] as const;

function verticalEnvelope(y: number): number {
  if (y <= Y_BASE || y >= Y_TOP) {
    return 0;
  }
  return Math.sin((Math.PI * (y - Y_BASE)) / HEIGHT_SPAN);
}

/** Independent expected ω_y. Must not call production methods. */
function expectedOmegaY(dx: number, dz: number, y: number): number {
  if (y <= Y_BASE || y >= Y_TOP) {
    return 0;
  }
  const r2 = dx * dx + dz * dz;
  const E = Math.exp(-r2 / (2 * SIGMA * SIGMA));
  const G = Math.sin((Math.PI * (y - Y_BASE)) / HEIGHT_SPAN);
  return 2 * OMEGA * G * E * (1 - r2 / (2 * SIGMA * SIGMA));
}

function fmt(value: number, digits = 6): string {
  if (value === 0) {
    return "0";
  }
  const abs = Math.abs(value);
  if (abs >= 1e-4 && abs < 1e2) {
    return value.toFixed(digits);
  }
  return value.toExponential(3);
}

function close(observed: number, expected: number, label: string): void {
  const scale = Math.max(1, Math.abs(expected), Math.abs(observed));
  const tol = 1e-12 * scale;
  if (Math.abs(observed - expected) > tol) {
    throw new Error(
      `STOP: ${label}\n  expected ${expected}\n  observed ${observed}\n  |Δ| ${Math.abs(observed - expected)}`,
    );
  }
}

function exactZero(observed: number, label: string): void {
  if (observed !== 0) {
    throw new Error(
      `STOP: ${label} must be exact +0, observed ${observed}`,
    );
  }
}

function hypot2(x: number, z: number): number {
  return Math.hypot(x, z);
}

function signedColor(t: number, peak: number): string {
  if (peak === 0 || t === 0) {
    return "rgb(248,248,248)";
  }
  const u = Math.max(-1, Math.min(1, t / peak));
  if (u > 0) {
    const a = u;
    const r = Math.round(248 - a * 180);
    const g = Math.round(248 - a * 200);
    const b = Math.round(248 - a * 40);
    return `rgb(${r},${g},${b})`;
  }
  const a = -u;
  const r = Math.round(248 - a * 40);
  const g = Math.round(248 - a * 170);
  const b = Math.round(248 - a * 30);
  return `rgb(${r},${g},${b})`;
}

function writeSliceSvg(
  path: string,
  y: number,
  values: number[],
  peak: number,
): void {
  const cell = 8;
  const pad = 36;
  const size = GRID_N * cell;
  const width = size + pad * 2;
  const height = size + pad * 2 + 28;
  const cells: string[] = [];
  for (let j = 0; j < GRID_N; j++) {
    for (let i = 0; i < GRID_N; i++) {
      const t = values[j * GRID_N + i]!;
      cells.push(
        `<rect x="${pad + i * cell}" y="${pad + j * cell}" width="${cell}" height="${cell}" fill="${signedColor(t, peak)}" stroke="none"/>`,
      );
    }
  }
  const cx = pad + (GRID_N / 2) * cell;
  const cz = pad + (GRID_N / 2) * cell;
  const rZero = (SIGMA * Math.SQRT2 / GRID_HALF) * (size / 2);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${cells.join("\n  ")}
  <rect x="${pad}" y="${pad}" width="${size}" height="${size}" fill="none" stroke="#333" stroke-width="1"/>
  <circle cx="${cx}" cy="${cz}" r="${rZero}" fill="none" stroke="#555" stroke-dasharray="3 3" stroke-width="1"/>
  <circle cx="${cx}" cy="${cz}" r="2.5" fill="#111"/>
  <text x="${pad}" y="18" font-family="ui-monospace, monospace" font-size="12" fill="#111">y = ${y} m · ω_y,current · peak |ω_y| = ${fmt(peak)} s^-1</text>
  <text x="${pad}" y="${pad + size + 16}" font-family="ui-monospace, monospace" font-size="11" fill="#333">+X East →</text>
  <text x="${pad + size - 70}" y="${pad + size + 16}" font-family="ui-monospace, monospace" font-size="11" fill="#333">+Z South ↓</text>
  <text x="8" y="${cz}" font-family="ui-monospace, monospace" font-size="11" fill="#333" transform="rotate(-90 10 ${cz})">N (−Z)</text>
  <text x="${pad + size + 8}" y="${pad + 14}" font-family="ui-monospace, monospace" font-size="10" fill="#b05020">ω_y &gt; 0</text>
  <text x="${pad + size + 8}" y="${pad + 28}" font-family="ui-monospace, monospace" font-size="10" fill="#2a7a28">ω_y &lt; 0</text>
  <text x="${pad + size + 8}" y="${pad + 44}" font-family="ui-monospace, monospace" font-size="9" fill="#555">dashed: r=σ√2</text>
</svg>
`;
  writeFileSync(path, svg);
}

function writeLineSvg(
  path: string,
  title: string,
  xs: number[],
  ys: number[],
  xLabel: string,
  yLabel: string,
): void {
  const padL = 64;
  const padR = 16;
  const padT = 28;
  const padB = 40;
  const innerW = 420;
  const innerH = 220;
  const width = padL + innerW + padR;
  const height = padT + innerH + padB;
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(0, ...ys);
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;
  const xOf = (x: number) => padL + ((x - xMin) / xSpan) * innerW;
  const yOf = (y: number) => padT + innerH - ((y - yMin) / ySpan) * innerH;
  const pts = xs.map((x, i) => `${xOf(x)},${yOf(ys[i]!)}`).join(" ");
  const zeroY = yOf(0);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${padL}" y="18" font-family="ui-monospace, monospace" font-size="12" fill="#111">${title}</text>
  <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + innerH}" stroke="#333"/>
  <line x1="${padL}" y1="${padT + innerH}" x2="${padL + innerW}" y2="${padT + innerH}" stroke="#333"/>
  <line x1="${padL}" y1="${zeroY}" x2="${padL + innerW}" y2="${zeroY}" stroke="#bbb"/>
  <polyline fill="none" stroke="#1a4a8a" stroke-width="2" points="${pts}"/>
  <text x="${padL + innerW / 2}" y="${height - 8}" font-family="ui-monospace, monospace" font-size="11" fill="#333" text-anchor="middle">${xLabel}</text>
  <text x="14" y="${padT + innerH / 2}" font-family="ui-monospace, monospace" font-size="11" fill="#333" transform="rotate(-90 14 ${padT + innerH / 2})">${yLabel}</text>
</svg>
`;
  writeFileSync(path, svg);
}

const observed = composeDemoTracersWithObservation(
  IntegrationFrame.StormRelativeLaboratory,
  [],
);
const diagnostic = observed.currentVerticalVorticity;
const rotation = diagnostic.rotation;
const t1 = observed.tiltingTendency;

if (rotation !== observed.velocityObservation.parts!.find((p) => p.key === "rotation")!.field) {
  throw new Error("STOP: Candidate A rotation is not the live V_total rotation operand");
}

function sample(dx: number, dz: number, y: number, time = TIME): number {
  return diagnostic.sample(
    { x: CENTER_X + dx, y, z: CENTER_Z + dz },
    time,
  );
}

function sampleRotation(dx: number, dz: number, y: number, time = TIME): number {
  return rotation.worldVerticalVorticity(
    { x: CENTER_X + dx, y, z: CENTER_Z + dz },
    time,
  );
}

const mismatches: string[] = [];
function checkPoint(dx: number, dz: number, y: number, label: string): number {
  const omegaY = sample(dx, dz, y);
  const fromRotation = sampleRotation(dx, dz, y);
  const expected = expectedOmegaY(dx, dz, y);
  if (omegaY !== fromRotation) {
    mismatches.push(
      `${label}: DiagnosticVerticalVorticity ${omegaY} ≠ rotation.worldVerticalVorticity ${fromRotation}`,
    );
  }
  close(omegaY, expected, label);
  return omegaY;
}

const axisSurvey = AXIS_HEIGHTS.map((spec) => {
  const G = verticalEnvelope(spec.y);
  const omegaY = checkPoint(0, 0, spec.y, `axis y=${spec.y}`);
  const expected = 2 * OMEGA * G;
  if (spec.y <= Y_BASE || spec.y >= Y_TOP) {
    exactZero(omegaY, `axis lid/exterior y=${spec.y}`);
  }
  return {
    y: spec.y,
    role: spec.role,
    G,
    omegaY,
    expected,
    t1: t1.sample({ x: CENTER_X, y: spec.y, z: CENTER_Z }, TIME),
  };
});

const radialContract = [
  { rLabel: "0", dx: 0, dz: 0 },
  { rLabel: "σ", dx: SIGMA, dz: 0 },
  { rLabel: "σ√2 exact r²=2σ²", dx: SIGMA, dz: SIGMA },
  { rLabel: "2σ", dx: 2 * SIGMA, dz: 0 },
  { rLabel: "3σ", dx: 3 * SIGMA, dz: 0 },
  { rLabel: "8σ", dx: 8 * SIGMA, dz: 0 },
].map((spec) => {
  const r = hypot2(spec.dx, spec.dz);
  const omegaY = checkPoint(spec.dx, spec.dz, Y_MID, `radial ${spec.rLabel} y_mid`);
  return {
    rLabel: spec.rLabel,
    r,
    dx: spec.dx,
    dz: spec.dz,
    omegaY,
    expected: expectedOmegaY(spec.dx, spec.dz, Y_MID),
    G: 1,
  };
});

exactZero(
  radialContract.find((p) => p.rLabel.startsWith("σ√2"))!.omegaY,
  "zero ring r²=2σ² at y_mid",
);

const core = radialContract.find((p) => p.rLabel === "0")!.omegaY;
const outer = radialContract.find((p) => p.rLabel === "2σ")!.omegaY;
if (!(core > 0)) {
  throw new Error(`STOP: DEMO Ω > 0 so core ω_y must be > 0, observed ${core}`);
}
if (!(outer < 0)) {
  throw new Error(`STOP: outer annulus at r=2σ must be < 0, observed ${outer}`);
}

const cardinals = (
  [
    { name: "+X East", dx: SIGMA, dz: 0 },
    { name: "-X West", dx: -SIGMA, dz: 0 },
    { name: "+Z South", dx: 0, dz: SIGMA },
    { name: "-Z North", dx: 0, dz: -SIGMA },
  ] as const
).map((spec) => {
  const omegaY = checkPoint(spec.dx, spec.dz, Y_MID, `cardinal ${spec.name}`);
  return { ...spec, r: SIGMA, omegaY };
});
const cardinalSpread = Math.max(...cardinals.map((c) => c.omegaY)) -
  Math.min(...cardinals.map((c) => c.omegaY));
if (cardinalSpread > 1e-15) {
  throw new Error(`STOP: axisymmetry failed at r=σ, spread ${cardinalSpread}`);
}

const times = [0, 12, 99, 3600];
const timePoint = { dx: SIGMA, dz: -SIGMA / 2, y: Y_MID - 200 };
const timeSamples = times.map((t) => sample(timePoint.dx, timePoint.dz, timePoint.y, t));
for (let i = 1; i < timeSamples.length; i++) {
  if (timeSamples[i] !== timeSamples[0]) {
    throw new Error(
      `STOP: time dependence at CURRENT field: t=${times[0]} ${timeSamples[0]} vs t=${times[i]} ${timeSamples[i]}`,
    );
  }
}

const ground = composeDemoTracersWithObservation(
  IntegrationFrame.GroundRelativeWindTunnel,
  [],
);
const stormRelative = composeDemoTracersWithObservation(
  IntegrationFrame.StormRelativeLaboratory,
  [],
);
const cCheckPoint = { x: CENTER_X + SIGMA, y: Y_MID, z: CENTER_Z };
const omegaGround = ground.currentVerticalVorticity.sample(cCheckPoint, TIME);
const omegaStorm = stormRelative.currentVerticalVorticity.sample(cCheckPoint, TIME);
if (omegaGround !== omegaStorm) {
  throw new Error(
    `STOP: C should not change ω_y; ground ${omegaGround} vs SR ${omegaStorm}`,
  );
}
const vGround = ground.velocityObservation.total.sample(cCheckPoint, TIME);
const vStorm = stormRelative.velocityObservation.total.sample(cCheckPoint, TIME);

const t1Couple = { x: -1200, y: 4000, z: 3600 };
const t1Axis = { x: CENTER_X, y: 4000, z: CENTER_Z };
const contrast = {
  candidateAAtRotationAxisMid: sample(0, 0, Y_MID),
  t1AtRotationAxisMid: t1.sample({ x: CENTER_X, y: Y_MID, z: CENTER_Z }, TIME),
  candidateAAtT1CoupleY4000: diagnostic.sample(t1Couple, TIME),
  t1AtT1CoupleY4000: t1.sample(t1Couple, TIME),
  candidateAAtUpdraftAxisY4000: diagnostic.sample(t1Axis, TIME),
  t1AtUpdraftAxisY4000: t1.sample(t1Axis, TIME),
};

const xs: number[] = [];
for (let i = 0; i < GRID_N; i++) {
  xs.push(-GRID_HALF + (2 * GRID_HALF * i) / (GRID_N - 1));
}

const sliceValues: number[] = [];
let sliceMax = -Infinity;
let sliceMin = Infinity;
for (const z of xs) {
  for (const x of xs) {
    const omegaY = diagnostic.sample(
      { x: CENTER_X + x, y: Y_MID, z: CENTER_Z + z },
      TIME,
    );
    sliceValues.push(omegaY);
    sliceMax = Math.max(sliceMax, omegaY);
    sliceMin = Math.min(sliceMin, omegaY);
  }
}

const radialLineR: number[] = [];
const radialLineW: number[] = [];
for (let i = 0; i <= 80; i++) {
  const r = (3 * SIGMA * i) / 80;
  radialLineR.push(r);
  radialLineW.push(checkPoint(r, 0, Y_MID, `radial line r=${r}`));
}

const verticalLineY: number[] = [];
const verticalLineW: number[] = [];
for (let i = 0; i <= 80; i++) {
  const y = Y_BASE - 500 + ((Y_TOP + 500 - (Y_BASE - 500)) * i) / 80;
  verticalLineY.push(y);
  verticalLineW.push(checkPoint(0, 0, y, `vertical line y=${y}`));
}

if (mismatches.length > 0) {
  throw new Error(`STOP: CURRENT STACK IDENTITY failed\n${mismatches.join("\n")}`);
}

mkdirSync(artifactsDir, { recursive: true });
writeSliceSvg(
  join(artifactsDir, "candidate-a-slice-ymid.svg"),
  Y_MID,
  sliceValues,
  Math.max(Math.abs(sliceMax), Math.abs(sliceMin)),
);
writeLineSvg(
  join(artifactsDir, "candidate-a-radial-ymid.svg"),
  `ω_y(r) at y_mid = ${Y_MID} m`,
  radialLineR,
  radialLineW,
  "r (m) from (centerX, centerZ)",
  "ω_y (s^-1)",
);
writeLineSvg(
  join(artifactsDir, "candidate-a-vertical-axis.svg"),
  "ω_y(y) on the rotation axis",
  verticalLineY,
  verticalLineW,
  "y (m)",
  "ω_y (s^-1)",
);

const summary = {
  generatedAt: "2026-08-20",
  commitNote:
    "research sampling of current DEMO Candidate A; not a runtime asset",
  evaluator: "DiagnosticVerticalVorticity.sample from composeDemoTracersWithObservation",
  rotation: {
    centerX: CENTER_X,
    centerZ: CENTER_Z,
    angularVelocity: OMEGA,
    sigma: SIGMA,
    baseHeight: Y_BASE,
    topHeight: Y_TOP,
    yMid: Y_MID,
    demoCenterIsOrigin: CENTER_X === 0 && CENTER_Z === 0,
  },
  grid: {
    n: GRID_N,
    halfExtentM: GRID_HALF,
    spacingM: (2 * GRID_HALF) / (GRID_N - 1),
    axes: "+X East, +Z South, +Y Up",
  },
  axisSurvey,
  radialContract,
  cardinals,
  time: {
    point: {
      x: CENTER_X + timePoint.dx,
      y: timePoint.y,
      z: CENTER_Z + timePoint.dz,
    },
    times,
    values: timeSamples,
  },
  stormMotionIndependence: {
    point: cCheckPoint,
    omegaGround,
    omegaStorm,
    vTotalGround: vGround,
    vTotalStormRelative: vStorm,
    stormMotion: DEMO_SCENARIO.stormMotion,
  },
  contrastWithT1: contrast,
  sliceYMid: {
    max: sliceMax,
    min: sliceMin,
  },
  identity: "DiagnosticVerticalVorticity.sample === rotation.worldVerticalVorticity at all checked points (CURRENT STACK IDENTITY, not a universal law)",
  passed: true,
};

writeFileSync(
  join(artifactsDir, "candidate-a-demo-field-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log("Candidate A DEMO field validation");
console.log(
  `center=(${CENTER_X}, ${CENTER_Z}) Ω=${OMEGA} σ=${SIGMA} [${Y_BASE}, ${Y_TOP}] y_mid=${Y_MID}`,
);
console.log("");
console.log("Axis");
for (const row of axisSurvey) {
  console.log(
    `  y=${row.y} G=${fmt(row.G, 4)} ω_y=${fmt(row.omegaY)} expected=${fmt(row.expected)} T1=${fmt(row.t1)}  ${row.role}`,
  );
}
console.log("");
console.log("Radial at y_mid");
for (const row of radialContract) {
  console.log(
    `  ${row.rLabel} r=${fmt(row.r, 3)} ω_y=${fmt(row.omegaY)} expected=${fmt(row.expected)}`,
  );
}
console.log("");
console.log("Cardinals at r=σ, y_mid");
for (const row of cardinals) {
  console.log(`  ${row.name} ω_y=${fmt(row.omegaY)}`);
}
console.log("");
console.log(
  `Time t=${times.join(",")} ω_y=${fmt(timeSamples[0]!)} (identical)`,
);
console.log(
  `C-independence ω_y ground=${fmt(omegaGround)} SR=${fmt(omegaStorm)} ΔVx=${fmt(vStorm.x - vGround.x)}`,
);
console.log("");
console.log("T1 contrast");
console.log(`  axis mid  ω_y=${fmt(contrast.candidateAAtRotationAxisMid)}  T1=${fmt(contrast.t1AtRotationAxisMid)}`);
console.log(
  `  T1 couple y=4000  ω_y=${fmt(contrast.candidateAAtT1CoupleY4000)}  T1=${fmt(contrast.t1AtT1CoupleY4000)}`,
);
console.log(
  `  updraft axis y=4000  ω_y=${fmt(contrast.candidateAAtUpdraftAxisY4000)}  T1=${fmt(contrast.t1AtUpdraftAxisY4000)}`,
);
console.log("");
console.log(`slice y_mid max=${fmt(sliceMax)} min=${fmt(sliceMin)}`);
console.log("PASSED");
