import { env } from "node:process";
import { describe, expect, it, vi } from "vitest";
import { CompositeVelocityField } from "../core/fields/CompositeVelocityField.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { worldVelocityToAtmospheric } from "../core/math/AtmosphericVelocity.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { EnvironmentalWindProfile } from "../physics/environment/EnvironmentalWindProfile.js";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import { StormRelativeEnvironmentalAdvectionField } from "../physics/environment/StormRelativeEnvironmentalAdvectionField.js";
import { verticalWindShearBetween } from "../physics/environment/verticalWindShear.js";
import { horizontalVorticityFromShear } from "../physics/environment/horizontalVorticity.js";
import { decomposeHorizontalVorticity, StreamwiseCrosswiseVorticityError } from "../physics/environment/streamwiseCrosswiseVorticity.js";
import { stormRelativeHelicityBetween } from "../physics/environment/stormRelativeHelicity.js";
import type { StormMotion, StormRelativeWind } from "../physics/environment/stormRelativeWind.js";
import { DiagnosticTiltingTendency, soundingSegmentContainingHeight, type EnvironmentalSoundingSegment } from "../physics/diagnostics/DiagnosticTiltingTendency.js";
import { VerticalEnvelopeUpdraftField } from "../physics/storm/VerticalEnvelopeUpdraftField.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { Simulation } from "../simulation/Simulation.js";
import { TracerPathHistory, type PathHistorySample } from "../simulation/TracerPathHistory.js";

// Test-only. Owning contracts: research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md
// and research/2026-09-12-storm-motion-validation-harness-design.md.
// No campaign runs on import or during ordinary tests. Select ONE reviewed stage;
// classification of the preceding stage is a human gate (see README.md).
const stage = env.STORM_MOTION_VALIDATION_STAGE;
const stages = ["H1", "H2", "H3-Eulerian", "H3-trajectories"];
if (stage !== undefined && !stages.includes(stage)) {
  throw new Error(`Unknown STORM_MOTION_VALIDATION_STAGE: ${stage}`);
}

type Status = "PASS" | "FAIL" | "UNEXPLAINED" | "INVALID CONTROL";
interface Check {
  id: string;
  expected: unknown;
  observed: unknown;
  status: Status;
}
const equal = (a: number, b: number) =>
  Number.isFinite(a) && Number.isFinite(b) &&
  Math.abs(a - b) <= 1e-9 + 1e-9 * Math.max(Math.abs(a), Math.abs(b));
function check(id: string, expected: unknown, observed: unknown, pass: boolean,
  otherwise: Status = "UNEXPLAINED"): Check {
  return { id, expected, observed, status: pass ? "PASS" : otherwise };
}
function numericCheck(id: string, expected: number[], observed: number[]): Check {
  return check(id, { values: expected, rule: "|a-b| <= 1e-9 + 1e-9*max(|a|,|b|)" },
    observed, expected.length === observed.length && expected.every((v, i) => equal(v, observed[i])));
}
const motion = (eastward: number, northward: number): StormMotion => ({ eastward, northward });
const H1_C = [motion(0, 0), motion(10, 0), motion(20, 0), motion(30, 0),
  motion(10, -10), motion(10, 0), motion(10, 10)];
const H2_C = [motion(10, 0), motion(10, 10), motion(20, 10)];
const H3_C = { A: motion(5, 8), B: motion(5, 13) };
const DT = 0.1;
const STEPS = 6000;
const SIGMA = 1000;
const EPSILON_T1 = 1e-6; // Material-sign classification only; never a physical zero.
const SEED = { x: -3000, y: 500, z: 0 };

function profileFor(kind: "straight" | "curved") {
  const winds = kind === "straight" ? [[0, 0], [10, 0], [20, 0], [30, 0]]
    : [[15, 8], [23, 10], [29, 16], [31, 24]];
  return new EnvironmentalWindProfile(winds.map(([eastward, northward], i) => ({
    height: i * 1000, velocity: { eastward, northward, vertical: 0 },
  })));
}
function fields(kind: "straight" | "curved", stormMotion: StormMotion) {
  const profile = profileFor(kind);
  const environment = new EnvironmentalWindField(profile);
  const advection = new StormRelativeEnvironmentalAdvectionField(environment, stormMotion);
  const updraft = new VerticalEnvelopeUpdraftField({ centerX: 0, centerZ: 0,
    peakVerticalVelocity: 20, sigma: SIGMA, baseHeight: 0, topHeight: 8000 });
  const tilting = new DiagnosticTiltingTendency({ profile, updraft });
  return { profile, environment, advection, updraft, tilting };
}
type Fields = ReturnType<typeof fields>;
const grid = [500, 1500, 2500].flatMap(y =>
  [[0, 0], [1000, 0], [-1000, 0], [0, 1000]].map(([x, z]) => ({ x, y, z })));

function eulerian(f: Fields, position: Vec3) {
  const segment = soundingSegmentContainingHeight(f.profile, position.y);
  if (segment === null) throw new Error("Fixed Eulerian control must have a containing segment");
  const shear = verticalWindShearBetween(f.profile, segment.hLo, segment.hHi);
  return { position: { ...position }, time: 0, segment,
    q: f.profile.sampleAtHeight(position.y), shear,
    vorticity: horizontalVorticityFromShear(shear), w: f.updraft.sample(position, 0).y,
    gradient: f.updraft.horizontalGradientOfVerticalVelocity(position, 0),
    t1: f.tilting.sample(position, 0) };
}
function eulerianValues(p: ReturnType<typeof eulerian>) {
  return [p.q.eastward, p.q.northward, p.q.vertical, p.shear.shearEastward,
    p.shear.shearNorthward, p.vorticity.omegaEastward, p.vorticity.omegaNorthward,
    p.w, p.gradient.dVyDx, p.gradient.dVyDz, p.t1];
}
function decomposition(wind: StormRelativeWind, f: Fields, height: number) {
  const segment = soundingSegmentContainingHeight(f.profile, height);
  if (segment === null) throw new Error("Decomposition control outside sounding");
  const omega = horizontalVorticityFromShear(verticalWindShearBetween(f.profile, segment.hLo, segment.hHi));
  try {
    return { kind: "defined" as const, value: decomposeHorizontalVorticity(wind, omega) };
  } catch (error) {
    if (!(error instanceof StreamwiseCrosswiseVorticityError) || wind.eastward !== 0 || wind.northward !== 0) throw error;
    return { kind: "undefined" as const, error: error.name, message: error.message };
  }
}
function collectEulerianRun(stormMotion: StormMotion) {
  const f = fields("straight", stormMotion);
  const winds = [0, 1000, 2000, 3000, 1500].map(height => {
    const q = f.profile.sampleAtHeight(height);
    const sr = worldVelocityToAtmospheric(f.advection.sample({ x: 0, y: height, z: 0 }, 0));
    return { height, q, sr, decomposition: decomposition(sr, f, height) };
  });
  const segments = winds.slice(0, 3).map((lo, i) => {
    const hi = winds[i + 1];
    return { hLo: lo.height, hHi: hi.height,
      groundDifference: [hi.q.eastward - lo.q.eastward, hi.q.northward - lo.q.northward],
      relativeDifference: [hi.sr.eastward - lo.sr.eastward, hi.sr.northward - lo.sr.northward] };
  });
  return { stormMotion: { ...stormMotion }, winds, segments,
    srh: stormRelativeHelicityBetween(f.profile, stormMotion, 0, 3000).srh,
    controls: grid.map(p => eulerian(f, p)) };
}
type EulerianRun = ReturnType<typeof collectEulerianRun>;
function decompositionDiffers(a: EulerianRun, b: EulerianRun) {
  const left = a.winds[4].decomposition, right = b.winds[4].decomposition;
  if (left.kind !== "defined" || right.kind !== "defined") return left.kind !== right.kind;
  return !equal(left.value.omegaStreamwise, right.value.omegaStreamwise) ||
    !equal(left.value.omegaCrosswise, right.value.omegaCrosswise);
}
function invariantChecks(runs: EulerianRun[]): Check[] {
  return runs.flatMap((run, i) => [
    ...run.winds.flatMap(p => [
      numericCheck(`${i}/q/${p.height}`, [p.height / 100, 0, 0], Object.values(p.q)),
      numericCheck(`${i}/sr/${p.height}`, [p.height / 100 - run.stormMotion.eastward,
        -run.stormMotion.northward, 0], Object.values(p.sr)),
      check(`${i}/basis/${p.height}`, "undefined expected error iff horizontal sr is exactly (0,0)",
        p.decomposition, (p.sr.eastward === 0 && p.sr.northward === 0)
          ? p.decomposition.kind === "undefined" : p.decomposition.kind === "defined"),
    ]),
    ...run.segments.map((s, j) => numericCheck(`${i}/translation/${j}`, s.groundDifference, s.relativeDifference)),
    ...run.controls.map((p, j) => numericCheck(`${i}/same-point/${j}`, eulerianValues(runs[0].controls[j]), eulerianValues(p))),
  ]);
}
function decompositionPair(id: string, a: EulerianRun, b: EulerianRun, zeroStreamwise: boolean): Check {
  const left = a.winds[4].decomposition;
  const right = b.winds[4].decomposition;
  if (left.kind !== "defined" || right.kind !== "defined") {
    return check(id, "defined decomposition at 1500 m", { left, right }, false);
  }
  const l = left.value, r = right.value;
  return check(id, { equalStreamwise: true, equalCrosswiseMagnitude: true,
    oppositeSignedCrosswise: true, zeroStreamwise, basis: "(-v,u)/|sr,h|", tolerance: "strict equality" }, { left, right },
    equal(l.omegaStreamwise, r.omegaStreamwise) &&
    (!zeroStreamwise || (equal(l.omegaStreamwise, 0) && equal(r.omegaStreamwise, 0))) &&
    equal(Math.abs(l.omegaCrosswise), Math.abs(r.omegaCrosswise)) &&
    equal(l.omegaCrosswise, -r.omegaCrosswise) && l.omegaCrosswise * r.omegaCrosswise < 0);
}
function srhCheck(id: string, expected: number, observed: number) {
  return check(id, { srh: expected, absoluteTolerance: 1e-6, units: "m^2/s^2" }, observed,
    Number.isFinite(observed) && Math.abs(observed - expected) <= 1e-6);
}
function runH1() {
  const runs = H1_C.map(collectEulerianRun);
  const checks = invariantChecks(runs);
  checks.push(...runs.slice(0, 4).map((r, i) => srhCheck(`H1/sweep-A/${i}`, 0, r.srh)),
    decompositionPair("H1/crosswise-reversal", runs[1], runs[2], true),
    check("H1/sweep-B-response", "SRH and decomposition change across transverse sweep",
      runs.slice(4).map(r => ({ srh: r.srh, decomposition: r.winds[4].decomposition })),
      !equal(runs[4].srh, runs[5].srh) && !equal(runs[5].srh, runs[6].srh) &&
      decompositionDiffers(runs[4], runs[5]) && decompositionDiffers(runs[5], runs[6])));
  return { stage: "H1", runs, checks };
}
function runH2() {
  const runs = H2_C.map(collectEulerianRun);
  const checks = invariantChecks(runs);
  checks.push(...runs.map((r, i) => srhCheck(`H2/SRH/${i}`, [0, -300, -300][i], r.srh)),
    srhCheck("H2/iso-SRH", 0, runs[1].srh - runs[2].srh),
    decompositionPair("H2/decomposition", runs[1], runs[2], false),
    check("H2/iso-SRH-distinct-winds", "C2/C3 sr differs at every knot and 1500 m",
      runs.slice(1).map(r => r.winds), runs[1].winds.every((p, i) =>
        !equal(p.sr.eastward, runs[2].winds[i].sr.eastward) || !equal(p.sr.northward, runs[2].winds[i].sr.northward))));
  return { stage: "H2", runs, checks };
}

type T1Evidence = { validity: "valid"; value: number; segment: EnvironmentalSoundingSegment }
  | { validity: "outside-profile / invalid-for-T1-evidence"; value: null; segment: null };
interface Sample extends PathHistorySample {
  index: number;
  r: number;
  w: number;
  t1: T1Evidence;
}
function sampleDiagnostics(f: Fields, p: PathHistorySample, index: number): Sample {
  const segment = soundingSegmentContainingHeight(f.profile, p.position.y);
  return { index, position: { ...p.position }, simulationTime: p.simulationTime,
    r: Math.sqrt(p.position.x ** 2 + p.position.z ** 2),
    w: f.updraft.sample(p.position, p.simulationTime).y,
    t1: segment === null
      ? { validity: "outside-profile / invalid-for-T1-evidence", value: null, segment: null }
      : { validity: "valid", value: f.tilting.sample(p.position, p.simulationTime), segment } };
}
function recordPath(simulation: Simulation, requestedSteps: number) {
  const history = new TracerPathHistory(1, 1);
  history.captureInitial(simulation.particles, simulation.clock.time);
  let executedSteps = 0;
  while (executedSteps < requestedSteps && simulation.particles[0].active) {
    simulation.step(DT);
    history.recordAfterStep(simulation.particles, simulation.clock.time);
    executedSteps++;
  }
  const tracer = simulation.particles[0];
  return { history, executedSteps, finalSimulationTime: simulation.clock.time,
    finalTracer: { active: tracer.active, age: tracer.age, position: { ...tracer.position }, tracerId: tracer.tracerId },
    terminalTime: tracer.active ? null : simulation.clock.time };
}
function extrema(samples: Sample[]) {
  if (samples.length === 0) throw new Error("Cannot summarize an empty path");
  // Strict comparisons retain the first recorded sample on a tied extremum.
  const rMin = samples.reduce((a, b) => b.r < a.r ? b : a);
  const wMax = samples.reduce((a, b) => b.w > a.w ? b : a);
  const valid = samples.filter(s => s.t1.validity === "valid");
  const t1Max = valid.reduce<Sample | null>((a, b) =>
    a === null || Math.abs(b.t1.value!) > Math.abs(a.t1.value!) ? b : a, null);
  return { rMin, wMax, maxAbsT1: t1Max === null ? null : { magnitude: Math.abs(t1Max.t1.value!), sample: t1Max },
    validT1SampleCount: valid.length, outsideProfileSampleCount: samples.length - valid.length };
}
function materialSign(s: Sample): "positive" | "negative" | "neutral" | "invalid" {
  if (s.t1.validity !== "valid") return "invalid";
  return s.t1.value > EPSILON_T1 ? "positive" : s.t1.value < -EPSILON_T1 ? "negative" : "neutral";
}
const sameSegment = (a: EnvironmentalSoundingSegment | null, b: EnvironmentalSoundingSegment | null) =>
  a !== null && b !== null && a.hLo === b.hLo && a.hHi === b.hHi;
function opposite(a: Sample, b: Sample) {
  const l = materialSign(a), r = materialSign(b);
  return (l === "positive" && r === "negative") || (l === "negative" && r === "positive");
}
interface SignPair {
  left: Sample;
  right: Sample;
  sameSoundingSegment: boolean;
}
function corePassage(samples: Sample[]) {
  const core = extrema(samples).rMin;
  const iCore = core.index;
  if (core.r > 1.5 * SIGMA) return { iCore, window: null, materialEvidence: [],
    discreteTransitions: [], candidate: null, sameSegmentEvidence: null };
  let start = iCore, end = iCore;
  while (start > 0 && samples[start - 1].r <= 1.5 * SIGMA) start--;
  while (end + 1 < samples.length && samples[end + 1].r <= 1.5 * SIGMA) end++;
  const local = samples.slice(start, end + 1);
  const materialEvidence = local.filter(s => ["positive", "negative"].includes(materialSign(s)))
    .map(sample => ({ sample, sign: materialSign(sample), side: sample.index < iCore ? "before" : sample.index > iCore ? "after" : "core" }));
  const discreteTransitions = local.slice(1).flatMap((right, i) => {
    const left = local[i];
    return opposite(left, right) ? [{ left, right, sameSoundingSegment: sameSegment(left.t1.segment, right.t1.segment) }] : [];
  });
  let candidate: SignPair | null = null;
  let sameSegmentEvidence: SignPair | null = null;
  // A qualifying interval includes iCore, so it must lie entirely inside the
  // contiguous run of its containing segment. Endpoint equality alone is insufficient.
  let segmentStart = iCore, segmentEnd = iCore;
  if (core.t1.segment !== null) {
    while (segmentStart > start && sameSegment(samples[segmentStart - 1].t1.segment, core.t1.segment)) segmentStart--;
    while (segmentEnd < end && sameSegment(samples[segmentEnd + 1].t1.segment, core.t1.segment)) segmentEnd++;
  }
  for (const sign of ["positive", "negative"] as const) {
    const left = local.find(s => s.index < iCore && materialSign(s) === sign);
    const right = local.find(s => s.index > iCore && left !== undefined && opposite(left, s));
    if (candidate === null && left && right) candidate = { left, right,
      sameSoundingSegment: left.index >= segmentStart && right.index <= segmentEnd && core.t1.segment !== null };
    const cleanLeft = local.find(s => s.index >= segmentStart && s.index < iCore && materialSign(s) === sign);
    const cleanRight = local.find(s => s.index > iCore && s.index <= segmentEnd && cleanLeft !== undefined && opposite(cleanLeft, s));
    if (sameSegmentEvidence === null && cleanLeft && cleanRight && core.t1.segment !== null) {
      sameSegmentEvidence = { left: cleanLeft, right: cleanRight, sameSoundingSegment: true };
    }
  }
  return { iCore, window: { start, end, radiusLimit: 1.5 * SIGMA }, materialEvidence,
    discreteTransitions, candidate, sameSegmentEvidence };
}
function signReversalCheck(samples: Sample[], passage: ReturnType<typeof corePassage>): Check {
  const nearCore = extrema(samples).rMin.r <= 500;
  const pass = nearCore && passage.sameSegmentEvidence !== null;
  // Without the intended opposite-flank/projection geometry, absence of signs
  // alone cannot establish a physics failure. Preserve it for classification.
  const invalid = !nearCore || (passage.candidate !== null && passage.sameSegmentEvidence === null);
  return check("H3/A/sign-reversal", "near-core; opposite material signs before/after i_core in one core passage and one containing segment; no sampled zero required",
    passage, pass, invalid ? "INVALID CONTROL" : "UNEXPLAINED");
}
function runH3Trajectory(id: "A" | "B") {
  const f = fields("curved", H3_C[id]);
  const simulation = new Simulation(new CompositeVelocityField([f.advection, f.updraft]),
    new EulerIntegrator(), [{ position: { ...SEED }, age: 0, active: true }],
    { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN });
  const { history, ...lifecycle } = recordPath(simulation, STEPS);
  const samples = history.samplesFor(0).map((p, i) => sampleDiagnostics(f, p, i));
  const passage = corePassage(samples);
  const checks = [check(`H3/${id}/sample-count`, "initial + every completed step, including terminal sample",
    { samples: samples.length, ...lifecycle }, samples.length === lifecycle.executedSteps + 1),
    check(`H3/${id}/full-active-count`, "full active run: 6000 steps / 6001 samples; early inactive run: terminal sample only",
      { samples: samples.length, ...lifecycle }, lifecycle.finalTracer.active
        ? lifecycle.executedSteps === STEPS && samples.length === 6001
        : lifecycle.terminalTime === samples.at(-1)!.simulationTime)];
  return { id, stormMotion: { ...H3_C[id] }, requestedSteps: STEPS, dt: DT,
    ...lifecycle, sampleCount: samples.length, ...extrema(samples), corePassage: passage, samples, checks };
}
function runH3Eulerian() {
  const a = fields("curved", H3_C.A), b = fields("curved", H3_C.B);
  const observations = grid.map(position => ({ a: eulerian(a, position), b: eulerian(b, position) }));
  return { stage: "H3-Eulerian", stormMotions: H3_C, observations,
    checks: observations.map((p, i) => numericCheck(`H3/same-point/${i}`, eulerianValues(p.a), eulerianValues(p.b))) };
}
function reportAndAssert<T extends { checks: Check[] }>(result: T) {
  // Emit observations BEFORE assertions so discrepancies survive a failing stage.
  // No scientific Results document is written by tests.
  console.log(JSON.stringify(result, null, 2));
  expect(result.checks.filter(c => c.status !== "PASS"), "Stop and classify before selecting the next stage").toEqual([]);
}
it.skipIf(stage !== "H1")("campaign H1 (explicit stage only)", () => reportAndAssert(runH1()));
it.skipIf(stage !== "H2")("campaign H2 (explicit stage only)", () => reportAndAssert(runH2()));
it.skipIf(stage !== "H3-Eulerian")("campaign H3 Eulerian (explicit stage only)", () => reportAndAssert(runH3Eulerian()));
it.skipIf(stage !== "H3-trajectories")("campaign H3 trajectories (explicit stage only)", () => {
  const samePoint = runH3Eulerian();
  // A failing same-point control prevents trajectory execution even in this stage.
  if (samePoint.checks.some(c => c.status !== "PASS")) {
    reportAndAssert(samePoint);
    return;
  }
  const a = runH3Trajectory("A"), b = runH3Trajectory("B");
  const geometryA = a.rMin.r <= 500, geometryB = b.rMin.r >= 750 && b.rMin.r <= 1500;
  const checks = [...samePoint.checks, ...a.checks, ...b.checks,
    check("H3/A/geometry", "r_min <= 500 m", a.rMin, geometryA, "INVALID CONTROL"),
    check("H3/B/geometry", "750 m <= r_min <= 1500 m", b.rMin, geometryB, "INVALID CONTROL"),
    check("H3/w-contrast", "max sampled w_A >= max sampled w_B + 2 m/s", { a: a.wMax, b: b.wMax },
      a.wMax.w >= b.wMax.w + 2, geometryA && geometryB ? "UNEXPLAINED" : "INVALID CONTROL"),
    signReversalCheck(a.samples, a.corePassage)];
  reportAndAssert({ stage: "H3-trajectories", samePoint, runs: [a, b], checks });
});

// Infrastructure verification uses constructed records / short lifecycle fixtures,
// never the H1/H2 collectors or the frozen 6000-step H3 trajectory campaign.
function fixture(radii: number[], values: (number | null)[], heights = radii.map(() => 500)): Sample[] {
  return radii.map((r, index) => ({ index, r, w: index, simulationTime: index * DT,
    position: { x: r, y: heights[index], z: 0 },
    t1: values[index] === null
      ? { validity: "outside-profile / invalid-for-T1-evidence", value: null, segment: null }
      : { validity: "valid", value: values[index]!, segment: heights[index] < 1000 ? { hLo: 0, hHi: 1000 } : { hLo: 1000, hHi: 2000 } } }));
}
describe("harness infrastructure (not campaign evidence)", () => {
  it("uses frozen equality boundaries and rejects nonfinite values", () => {
    expect(equal(0, 1e-9)).toBe(true);
    expect(equal(0, 2e-9)).toBe(false);
    expect(equal(NaN, NaN)).toBe(false);
  });
  it("classifies the material threshold inclusively as neutral without changing values", () => {
    const samples = fixture([1, 1, 1, 1, 1], [EPSILON_T1, -EPSILON_T1, 2e-6, -2e-6, null]);
    expect(samples.map(materialSign)).toEqual(["neutral", "neutral", "positive", "negative", "invalid"]);
    expect(samples[0].t1.value).toBe(EPSILON_T1);
  });
  it("finds the maximal local passage and accepts reversal without a sampled zero", () => {
    const samples = fixture([1600, 1500, 400, 600, 1500, 1600], [2e-6, 2e-6, 2e-6, -2e-6, -2e-6, -2e-6]);
    const passage = corePassage(samples);
    expect(passage.window).toEqual({ start: 1, end: 4, radiusLimit: 1500 });
    expect(passage.sameSegmentEvidence?.left.index).toBe(1);
    expect(passage.sameSegmentEvidence?.right.index).toBe(3);
    expect(passage.discreteTransitions.map(p => [p.left.index, p.right.index])).toEqual([[2, 3]]);
    expect(signReversalCheck(samples, passage).status).toBe("PASS");
  });
  it("accepts reversed sign order and neutral intermediate samples", () => {
    const samples = fixture([1200, 300, 1000], [-2e-6, 0, 2e-6]);
    expect(signReversalCheck(samples, corePassage(samples)).status).toBe("PASS");
  });
  it("rejects same endpoints when an intervening segment or invalid sample breaks support", () => {
    for (const middle of [0, null]) {
      const samples = fixture([1200, 300, 1000], [2e-6, middle, -2e-6], [500, 1500, 500]);
      const passage = corePassage(samples);
      expect(passage.candidate).not.toBeNull();
      expect(passage.sameSegmentEvidence).toBeNull();
      expect(signReversalCheck(samples, passage).status).toBe("INVALID CONTROL");
    }
  });
  it("does not search another passage or accept both signs on one side of core", () => {
    const elsewhere = fixture([1000, 1600, 900, 300, 800], [-2e-6, 0, 2e-6, 2e-6, 2e-6]);
    const sameSide = fixture([1000, 900, 300, 800], [2e-6, -2e-6, 0, 0]);
    for (const samples of [elsewhere, sameSide]) expect(corePassage(samples).sameSegmentEvidence).toBeNull();
    const flank = fixture([1200, 800, 1000], [2e-6, 0, -2e-6]);
    expect(signReversalCheck(flank, corePassage(flank)).status).toBe("INVALID CONTROL");
    expect(corePassage(fixture([1600], [0])).window).toBeNull();
  });
  it("keeps first tied extrema, signed valid T1, and explicit no-valid-evidence null", () => {
    const samples = fixture([600, 300, 300], [-3e-6, null, 2e-6]);
    const result = extrema(samples);
    expect(result.rMin.index).toBe(1);
    expect(result.wMax.index).toBe(2);
    expect(result.maxAbsT1?.sample.t1.value).toBe(-3e-6);
    expect(result.validT1SampleCount).toBe(2);
    expect(result.outsideProfileSampleCount).toBe(1);
    expect(extrema(fixture([1], [null])).maxAbsT1).toBeNull();
  });
  it("guards core T1 before sampling and preserves production knot ownership", () => {
    const f = fields("curved", H3_C.A);
    const diagnostic = vi.spyOn(f.tilting, "sample").mockReturnValue(7);
    try {
      const samples = [-1, 0, 1000, 3000, 3001].map((y, i) => sampleDiagnostics(f,
        { position: { x: 0, y, z: 0 }, simulationTime: i * DT }, i));
      expect(diagnostic).toHaveBeenCalledTimes(3);
      expect(samples.map(p => p.t1.segment)).toEqual([null, { hLo: 0, hHi: 1000 },
        { hLo: 1000, hHi: 2000 }, { hLo: 2000, hHi: 3000 }, null]);
      expect(samples[0].t1.value).toBeNull();
      expect(samples[4].t1.value).toBeNull();
    } finally { diagnostic.mockRestore(); }
  });
  it("records initial and post-step states, evaluates diagnostics at recorded position/time", () => {
    const velocity: VelocityField = { sample: (_p, t) => ({ x: 10 + t, y: 0, z: 0 }) };
    const sim = new Simulation(velocity, new EulerIntegrator(), [{ position: { x: 0, y: 500, z: 0 }, age: 0, active: true }],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN });
    const result = recordPath(sim, 2);
    const samples = result.history.samplesFor(0);
    expect(samples.map(s => s.simulationTime)).toEqual([0, 0.1, 0.2]);
    expect(samples.map(s => s.position.x)).toEqual([0, 1, 2.01]);
    const f = fields("curved", H3_C.A);
    const w = vi.spyOn(f.updraft, "sample").mockReturnValue({ x: 0, y: 123, z: 0 });
    const t1 = vi.spyOn(f.tilting, "sample").mockReturnValue(456);
    try {
      const observed = samples.map((p, i) => sampleDiagnostics(f, p, i));
      samples.forEach((p, i) => {
        expect(w).toHaveBeenNthCalledWith(i + 1, p.position, p.simulationTime);
        expect(t1).toHaveBeenNthCalledWith(i + 1, p.position, p.simulationTime);
      });
      expect(observed[2].w).toBe(123);
      expect(observed[2].t1.value).toBe(456);
    } finally { w.mockRestore(); t1.mockRestore(); }
  });
  it("records terminal accepted sample once and stops without fabricated later samples", () => {
    const sim = new Simulation({ sample: () => ({ x: 10, y: -10, z: 0 }) }, new EulerIntegrator(),
      [{ position: { x: 0, y: 0.5, z: 0 }, age: 0, active: true }], { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN });
    const result = recordPath(sim, 5);
    expect(result.executedSteps).toBe(1);
    expect(result.terminalTime).toBe(0.1);
    expect(result.finalTracer.active).toBe(false);
    expect(result.history.samplesFor(0)).toEqual([
      { position: { x: 0, y: 0.5, z: 0 }, simulationTime: 0 },
      { position: { x: 0.5, y: 0, z: 0 }, simulationTime: 0.1 },
    ]);
  });
  it("records exact zero-flow decomposition as the expected error", () => {
    const f = fields("straight", motion(10, 0));
    const result = decomposition({ eastward: 0, northward: 0, vertical: 0 }, f, 1500);
    expect(result.kind).toBe("undefined");
    expect(result).not.toHaveProperty("value");
  });
});
