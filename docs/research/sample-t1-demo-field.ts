/**
 * Research-only DEMO T1 field sampler.
 * Not a production API. Not imported by composition, labs, or renderer.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  composeDemoTracerFields,
  composeDemoTracersWithObservation,
} from "../../src/app/composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../../src/app/IntegrationFrame.js";
import {
  DiagnosticTiltingTendency,
  soundingSegmentContainingHeight,
  worldHorizontalVorticityFromAtmospheric,
} from "../../src/physics/diagnostics/DiagnosticTiltingTendency.js";
import { horizontalVorticityFromShear } from "../../src/physics/environment/horizontalVorticity.js";
import { verticalWindShearBetween } from "../../src/physics/environment/verticalWindShear.js";
import { createRotationField } from "../../src/scenario/createRotationField.js";
import { DEMO_SCENARIO } from "../../src/scenario/DEMO_SCENARIO.js";

const here = dirname(fileURLToPath(import.meta.url));
const artifactsDir = join(here, "artifacts");

const SIGMA = DEMO_SCENARIO.storm.updraft.sigma;
const W0 = DEMO_SCENARIO.storm.updraft.peakVerticalVelocity;
const Y_BASE = DEMO_SCENARIO.storm.updraft.baseHeight;
const Y_TOP = DEMO_SCENARIO.storm.updraft.topHeight;
const HEIGHT_SPAN = Y_TOP - Y_BASE;
const GRID_HALF = 3 * SIGMA;
const GRID_N = 41;
const TIME = 0;

const SLICE_HEIGHTS = [
  { y: -200, role: "below sounding and below updraft" },
  { y: 0, role: "updraft lower lid; sounding minHeight" },
  { y: 500, role: "lower active updraft; first sounding segment" },
  { y: 999, role: "just below interior knot 1000; lower segment" },
  { y: 1000, role: "interior knot 1000; locked upper segment" },
  { y: 1001, role: "just above knot 1000; upper segment" },
  { y: 1500, role: "lower–mid active updraft; segment [1000, 2000)" },
  { y: 1999, role: "just below interior knot 2000" },
  { y: 2000, role: "interior knot 2000; locked upper segment" },
  { y: 2001, role: "just above knot 2000" },
  { y: 4000, role: "updraft y_mid; F = 1; segment [2000, 6000)" },
  { y: 5000, role: "upper–mid active updraft; same segment as 4000" },
  { y: 5999, role: "just below interior knot 6000" },
  { y: 6000, role: "interior knot 6000; locked upper segment" },
  { y: 6001, role: "just above knot 6000" },
  { y: 7000, role: "upper active updraft; segment [6000, 12000]" },
  { y: 8000, role: "updraft upper lid; F = 0" },
  { y: 9000, role: "above updraft; still inside sounding" },
  { y: 13000, role: "above sounding maxHeight" },
] as const;

const PLOT_HEIGHTS = [500, 999, 1000, 1500, 2000, 4000, 6000, 7000];

function verticalEnvelope(y: number): number {
  if (y <= Y_BASE || y >= Y_TOP) {
    return 0;
  }
  return Math.sin((Math.PI * (y - Y_BASE)) / HEIGHT_SPAN);
}

function hypot2(x: number, z: number): number {
  return Math.hypot(x, z);
}

function fmt(value: number, digits = 6): string {
  if (value === 0) {
    return "0";
  }
  const abs = Math.abs(value);
  if (abs >= 1e-2 && abs < 1e2) {
    return value.toFixed(digits);
  }
  return value.toExponential(3);
}

function bearingDegFromEastTowardSouth(x: number, z: number): number | null {
  if (x === 0 && z === 0) {
    return null;
  }
  const deg = (Math.atan2(z, x) * 180) / Math.PI;
  return deg < 0 ? deg + 360 : deg;
}

function compassFromWorldXZ(x: number, z: number): string {
  const mag = hypot2(x, z);
  if (mag === 0) {
    return "zero";
  }
  const east = x / mag;
  const south = z / mag;
  const north = -south;
  const parts: string[] = [];
  if (Math.abs(north) >= Math.abs(east)) {
    parts.push(north >= 0 ? "N" : "S");
    if (Math.abs(east) > 0.15) {
      parts.push(east >= 0 ? "E" : "W");
    }
  } else {
    parts.push(east >= 0 ? "E" : "W");
    if (Math.abs(north) > 0.15) {
      parts.push(north >= 0 ? "N" : "S");
    }
  }
  return parts.join("");
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
  omegaX: number,
  omegaZ: number,
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
  const mag = hypot2(omegaX, omegaZ);
  let arrow = "";
  if (mag > 0) {
    const len = 48;
    const ux = omegaX / mag;
    const uz = omegaZ / mag;
    const x2 = cx + ux * len;
    const y2 = cz + uz * len;
    arrow = `<line x1="${cx}" y1="${cz}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="2" marker-end="url(#arrow)"/>`;
  }
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="#111"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${cells.join("\n  ")}
  <rect x="${pad}" y="${pad}" width="${size}" height="${size}" fill="none" stroke="#333" stroke-width="1"/>
  <circle cx="${cx}" cy="${cz}" r="2.5" fill="#111"/>
  ${arrow}
  <text x="${pad}" y="18" font-family="ui-monospace, monospace" font-size="12" fill="#111">y = ${y} m · T_tilt,y · peak |T| = ${fmt(peak)} s^-2</text>
  <text x="${pad}" y="${pad + size + 16}" font-family="ui-monospace, monospace" font-size="11" fill="#333">+X East →</text>
  <text x="${pad + size - 70}" y="${pad + size + 16}" font-family="ui-monospace, monospace" font-size="11" fill="#333">+Z South ↓</text>
  <text x="8" y="${cz}" font-family="ui-monospace, monospace" font-size="11" fill="#333" transform="rotate(-90 10 ${cz})">N (−Z)</text>
  <text x="${pad + size + 8}" y="${pad + 14}" font-family="ui-monospace, monospace" font-size="10" fill="#b05020">T &gt; 0</text>
  <text x="${pad + size + 8}" y="${pad + 28}" font-family="ui-monospace, monospace" font-size="10" fill="#2a7a28">T &lt; 0</text>
</svg>
`;
  writeFileSync(path, svg);
}

const composed = composeDemoTracerFields(
  IntegrationFrame.StormRelativeLaboratory,
);
const t1 = new DiagnosticTiltingTendency({
  profile: composed.profile,
  updraft: composed.updraftField,
});

const xs: number[] = [];
for (let i = 0; i < GRID_N; i++) {
  xs.push(-GRID_HALF + (2 * GRID_HALF * i) / (GRID_N - 1));
}

type SliceReport = {
  y: number;
  role: string;
  F: number;
  segment: { hLo: number; hHi: number } | null;
  shearEastward: number | null;
  shearNorthward: number | null;
  omegaEastward: number | null;
  omegaNorthward: number | null;
  omegaX: number | null;
  omegaZ: number | null;
  omegaMag: number | null;
  omegaCompass: string;
  predictedPositiveCompass: string;
  predictedZeroLineCompass: string;
  sampledMaxT: number;
  sampledMinT: number;
  maxAt: { x: number; z: number; r: number; bearingDeg: number | null };
  minAt: { x: number; z: number; r: number; bearingDeg: number | null };
  centerT: number;
  maxAbsGradH: number;
  analyticMaxAbsGradH: number;
  analyticAlignedMaxAbsT: number;
  parallelPlusT: number | null;
  parallelMinusT: number | null;
  perpPlusT: number | null;
  perpMinusT: number | null;
  farT: number;
  dipoleMatch: boolean | null;
};

const sliceReports: SliceReport[] = [];
const plotValues = new Map<number, number[]>();

for (const spec of SLICE_HEIGHTS) {
  const y = spec.y;
  const F = verticalEnvelope(y);
  const segment = soundingSegmentContainingHeight(composed.profile, y);
  let shearEastward: number | null = null;
  let shearNorthward: number | null = null;
  let omegaEastward: number | null = null;
  let omegaNorthward: number | null = null;
  let omegaX: number | null = null;
  let omegaZ: number | null = null;
  let omegaMag: number | null = null;
  if (segment) {
    const shear = verticalWindShearBetween(
      composed.profile,
      segment.hLo,
      segment.hHi,
    );
    const atm = horizontalVorticityFromShear(shear);
    const world = worldHorizontalVorticityFromAtmospheric(atm);
    shearEastward = shear.shearEastward;
    shearNorthward = shear.shearNorthward;
    omegaEastward = atm.omegaEastward;
    omegaNorthward = atm.omegaNorthward;
    omegaX = world.omegaX;
    omegaZ = world.omegaZ;
    omegaMag = hypot2(omegaX, omegaZ);
  }

  const values: number[] = [];
  let sampledMaxT = -Infinity;
  let sampledMinT = Infinity;
  let maxAt = { x: 0, z: 0 };
  let minAt = { x: 0, z: 0 };
  let maxAbsGradH = 0;
  const centerT = t1.sample({ x: 0, y, z: 0 }, TIME);

  for (const z of xs) {
    for (const x of xs) {
      const T = t1.sample({ x, y, z }, TIME);
      values.push(T);
      if (T > sampledMaxT) {
        sampledMaxT = T;
        maxAt = { x, z };
      }
      if (T < sampledMinT) {
        sampledMinT = T;
        minAt = { x, z };
      }
      const g = composed.updraftField.horizontalGradientOfVerticalVelocity(
        { x, y, z },
        TIME,
      );
      maxAbsGradH = Math.max(maxAbsGradH, hypot2(g.dVyDx, g.dVyDz));
    }
  }

  if (PLOT_HEIGHTS.includes(y)) {
    plotValues.set(y, values);
  }

  const analyticMaxAbsGradH =
    (W0 * Math.abs(F) * Math.exp(-0.5)) / SIGMA;
  const analyticAlignedMaxAbsT =
    omegaMag === null ? 0 : omegaMag * analyticMaxAbsGradH;

  let parallelPlusT: number | null = null;
  let parallelMinusT: number | null = null;
  let perpPlusT: number | null = null;
  let perpMinusT: number | null = null;
  let dipoleMatch: boolean | null = null;
  let predictedPositiveCompass = "n/a";
  let predictedZeroLineCompass = "n/a";

  if (omegaMag !== null && omegaMag > 0 && omegaX !== null && omegaZ !== null) {
    const ux = omegaX / omegaMag;
    const uz = omegaZ / omegaMag;
    const px = -uz;
    const pz = ux;
    const a = SIGMA;
    parallelPlusT = t1.sample({ x: a * ux, y, z: a * uz }, TIME);
    parallelMinusT = t1.sample({ x: -a * ux, y, z: -a * uz }, TIME);
    perpPlusT = t1.sample({ x: a * px, y, z: a * pz }, TIME);
    perpMinusT = t1.sample({ x: -a * px, y, z: -a * pz }, TIME);
    predictedPositiveCompass = compassFromWorldXZ(-omegaX, -omegaZ);
    predictedZeroLineCompass = compassFromWorldXZ(px, pz);
    const expectedPlusNegative = parallelPlusT < 0;
    const expectedMinusPositive = parallelMinusT > 0;
    const perpSmall =
      Math.abs(perpPlusT) < 0.15 * Math.max(Math.abs(sampledMaxT), Math.abs(sampledMinT), 1e-20) &&
      Math.abs(perpMinusT) < 0.15 * Math.max(Math.abs(sampledMaxT), Math.abs(sampledMinT), 1e-20);
    dipoleMatch =
      F === 0 || omegaMag === 0
        ? sampledMaxT === 0 && sampledMinT === 0
        : expectedPlusNegative && expectedMinusPositive && perpSmall;
  }

  const farAlongOmega =
    omegaMag !== null && omegaMag > 0 && omegaX !== null && omegaZ !== null
      ? t1.sample(
          {
            x: (3 * SIGMA * omegaX) / omegaMag,
            y,
            z: (3 * SIGMA * omegaZ) / omegaMag,
          },
          TIME,
        )
      : t1.sample({ x: 3 * SIGMA, y, z: 0 }, TIME);

  sliceReports.push({
    y,
    role: spec.role,
    F,
    segment,
    shearEastward,
    shearNorthward,
    omegaEastward,
    omegaNorthward,
    omegaX,
    omegaZ,
    omegaMag,
    omegaCompass:
      omegaX === null || omegaZ === null
        ? "n/a"
        : compassFromWorldXZ(omegaX, omegaZ),
    predictedPositiveCompass,
    predictedZeroLineCompass,
    sampledMaxT,
    sampledMinT,
    maxAt: {
      x: maxAt.x,
      z: maxAt.z,
      r: hypot2(maxAt.x, maxAt.z),
      bearingDeg: bearingDegFromEastTowardSouth(maxAt.x, maxAt.z),
    },
    minAt: {
      x: minAt.x,
      z: minAt.z,
      r: hypot2(minAt.x, minAt.z),
      bearingDeg: bearingDegFromEastTowardSouth(minAt.x, minAt.z),
    },
    centerT,
    maxAbsGradH,
    analyticMaxAbsGradH,
    analyticAlignedMaxAbsT,
    parallelPlusT,
    parallelMinusT,
    perpPlusT,
    perpMinusT,
    farT: farAlongOmega,
    dipoleMatch,
  });
}

mkdirSync(artifactsDir, { recursive: true });

let globalPeak = 0;
for (const y of PLOT_HEIGHTS) {
  const values = plotValues.get(y)!;
  for (const t of values) {
    globalPeak = Math.max(globalPeak, Math.abs(t));
  }
}

for (const y of PLOT_HEIGHTS) {
  const report = sliceReports.find((s) => s.y === y)!;
  const values = plotValues.get(y)!;
  writeSliceSvg(
    join(artifactsDir, `t1-slice-y${y}.svg`),
    y,
    values,
    Math.max(Math.abs(report.sampledMaxT), Math.abs(report.sampledMinT)),
    report.omegaX ?? 0,
    report.omegaZ ?? 0,
  );
}

const independencePoint = { x: -SIGMA, y: 4000, z: 0 };
const tLive = t1.sample(independencePoint, TIME);
const otherScenario = structuredClone(DEMO_SCENARIO);
otherScenario.storm.rotation.angularVelocity = 0.02;
const rotDemo = composed.rotationField.sample(independencePoint, TIME);
const rotOther = createRotationField(otherScenario).sample(
  independencePoint,
  TIME,
);
const tAfterOmegaFixture = t1.sample(independencePoint, TIME);

const ground = composeDemoTracersWithObservation(
  IntegrationFrame.GroundRelativeWindTunnel,
  [],
);
const stormRelative = composeDemoTracersWithObservation(
  IntegrationFrame.StormRelativeLaboratory,
  [],
);
const tGround = ground.tiltingTendency.sample(independencePoint, TIME);
const tStorm = stormRelative.tiltingTendency.sample(independencePoint, TIME);
const vGround = ground.velocityObservation.total.sample(independencePoint, TIME);
const vStorm = stormRelative.velocityObservation.total.sample(
  independencePoint,
  TIME,
);

const summary = {
  generatedAt: "2026-08-20",
  commitNote: "research sampling of current DEMO T1; not a runtime asset",
  updraft: {
    centerX: 0,
    centerZ: 0,
    W0,
    sigma: SIGMA,
    baseHeight: Y_BASE,
    topHeight: Y_TOP,
  },
  grid: {
    n: GRID_N,
    halfExtentM: GRID_HALF,
    spacingM: (2 * GRID_HALF) / (GRID_N - 1),
    axes: "+X East, +Z South, +Y Up",
  },
  slices: sliceReports,
  independence: {
    point: independencePoint,
    tWithDemoOmega: tLive,
    tAfterModifiedOmegaFixture: tAfterOmegaFixture,
    rotationVelocityDemo: rotDemo,
    rotationVelocityModified: rotOther,
    tGroundRelative: tGround,
    tStormRelative: tStorm,
    vTotalGround: vGround,
    vTotalStormRelative: vStorm,
    stormMotion: DEMO_SCENARIO.stormMotion,
  },
};

writeFileSync(
  join(artifactsDir, "t1-demo-field-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

function line(report: SliceReport): string {
  const seg =
    report.segment === null
      ? "outside sounding"
      : `[${report.segment.hLo}, ${report.segment.hHi}]`;
  return [
    `y=${report.y}`,
    `F=${fmt(report.F, 4)}`,
    `seg=${seg}`,
    `ωe=${fmt(report.omegaEastward ?? 0)}`,
    `ωn=${fmt(report.omegaNorthward ?? 0)}`,
    `ωx=${fmt(report.omegaX ?? 0)}`,
    `ωz=${fmt(report.omegaZ ?? 0)}`,
    `|ω|=${fmt(report.omegaMag ?? 0)}`,
    `ω:${report.omegaCompass}`,
    `T+pred:${report.predictedPositiveCompass}`,
    `Tmax=${fmt(report.sampledMaxT)} @ (${fmt(report.maxAt.x, 1)}, ${fmt(report.maxAt.z, 1)})`,
    `Tmin=${fmt(report.sampledMinT)} @ (${fmt(report.minAt.x, 1)}, ${fmt(report.minAt.z, 1)})`,
    `T0=${fmt(report.centerT)}`,
    `|∇hVy|_max=${fmt(report.maxAbsGradH)}`,
    `∥+T=${fmt(report.parallelPlusT ?? 0)}`,
    `∥−T=${fmt(report.parallelMinusT ?? 0)}`,
    `⊥+T=${fmt(report.perpPlusT ?? 0)}`,
    `⊥−T=${fmt(report.perpMinusT ?? 0)}`,
    `dipole=${String(report.dipoleMatch)}`,
  ].join(" | ");
}

console.log("T1 DEMO field validation");
console.log(`grid ${GRID_N}x${GRID_N} over ±${GRID_HALF} m, spacing ${fmt((2 * GRID_HALF) / (GRID_N - 1), 1)} m`);
console.log("");
for (const report of sliceReports) {
  console.log(line(report));
  console.log(`  role: ${report.role}`);
}
console.log("");
console.log("Independence");
console.log(`  P = ${JSON.stringify(independencePoint)}`);
console.log(`  T demo Ω = ${fmt(tLive)}`);
console.log(`  T after Ω fixture = ${fmt(tAfterOmegaFixture)}`);
console.log(`  V_rot demo = ${JSON.stringify(rotDemo)}`);
console.log(`  V_rot modified = ${JSON.stringify(rotOther)}`);
console.log(`  T ground = ${fmt(tGround)}`);
console.log(`  T storm-relative = ${fmt(tStorm)}`);
console.log(`  V_total ground = ${JSON.stringify(vGround)}`);
console.log(`  V_total SR = ${JSON.stringify(vStorm)}`);
console.log(`  ΔVx = ${fmt(vStorm.x - vGround.x)}`);
