import { captureValue, enterCapture, type CaptureContext } from "./lagrangianEstimator/capture.js";
/** Pure, validation-local P2 controller. Supplied paths only; no collection or execution gate. */
import { isDeepStrictEqual } from "node:util";
import { P2_SPEC as S, p2RunId, type Candidate } from "./observedLagrangianPhaseP2Spec.js";
import { createAcceptedPath, finitePosition } from "./lagrangianEstimator/path.js";
import { partitionAcceptedStep } from "./lagrangianEstimator/partition.js";
import { integratePathExposure } from "./lagrangianEstimator/exposure.js";
import { comparePathHistory } from "./lagrangianEstimator/history.js";
import { compareGeometry, compareHistory, compareExposures, comparePointwise, compareEvents,
  compareSuccessiveRefinement } from "./lagrangianEstimator/comparison.js";
import type { AcceptedPath, Position, ProviderTopology, VerticalDiagnosticProvider, Interval,
  ComparisonContext, ComparisonResult, ComparisonMetric, RefinementEvidence, PreparedLifecycleEvent,
  PreparedCrossingBracket, EndpointOperand, EstimatorResult } from "./lagrangianEstimator/types.js";

export type Channel = "Source" | "Analysis";
export type Failure = Readonly<{ status: "QUALIFICATION_INCOMPLETE";
  reason: string; control: "UNEXPLAINED" | null; value: null; evidence: unknown }>;
export type Result<T> = Readonly<{ status: "COMPLETE"; value: T }> | Failure;
class Fault extends Error {
  constructor(readonly reason: string, readonly evidence: unknown, readonly control: "UNEXPLAINED" | null = null) { super(reason); }
}
function demand(condition: unknown, reason: string, evidence: unknown = null, capture?: CaptureContext): asserts condition {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/demand");
  captureValue(capture, "input/condition", condition);
  captureValue(capture, "input/reason", reason);
  captureValue(capture, "input/evidence", evidence);

  if (!condition) throw captureValue(capture, "observedLagrangianPhaseP2Controller/21/throw", new Fault(reason, evidence));
}
function finite(x: number, operation: string, capture?: CaptureContext): number {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/finite");
  captureValue(capture, "input/x", x);
  captureValue(capture, "input/operation", operation);

  demand(Number.isFinite(x), "NONFINITE_ARITHMETIC", { operation, value: null }, capture); return captureValue(capture, "observedLagrangianPhaseP2Controller/24/return", x === 0 ? 0 : x);
}
function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
function guarded<T>(work: () => T, capture?: CaptureContext): Result<T> {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/guarded");
  captureValue(capture, "input/work", work);

  try { return captureValue(capture, "observedLagrangianPhaseP2Controller/33/return", { status: "COMPLETE", value: freeze(work()) }); }
  catch (e) { captureValue(capture, "observedLagrangianPhaseP2Controller/34/caught", undefined);
    if (e instanceof Fault) return captureValue(capture, "observedLagrangianPhaseP2Controller/35/return", freeze({ status: "QUALIFICATION_INCOMPLETE", reason: e.reason,
      control: e.control, value: null, evidence: e.evidence }));
    throw captureValue(capture, "observedLagrangianPhaseP2Controller/37/throw", e);
  }
}
const samePosition = (a: Position, b: Position) => a.x === b.x && a.y === b.y && a.z === b.z;
const inf = (p: Position) => Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
const complete = <T>(value: T) => ({ status: "COMPLETE" as const, value });
const dense = (values: readonly unknown[]) => Array.isArray(values) && Array.from(values).every(v => v !== undefined && v !== null);
function unwrap<T>(r: EstimatorResult<T>, capture?: CaptureContext): T {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/unwrap");
  captureValue(capture, "input/r", r);

  if (r.status !== "COMPLETE") throw captureValue(capture, "observedLagrangianPhaseP2Controller/45/throw", new Fault("ESTIMATOR_INCOMPLETE", r));
  return captureValue(capture, "observedLagrangianPhaseP2Controller/46/return", r.value);
}
function caseSpec(id: string, capture?: CaptureContext) {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/caseSpec");
  captureValue(capture, "input/id", id);

  const c = captureValue(capture, "observedLagrangianPhaseP2Controller/49/local/c", S.cases.find(c => c.id === id)); demand(c, "FOREIGN_CASE", id, capture); return captureValue(capture, "observedLagrangianPhaseP2Controller/49/return", c);
}
function registered(candidate: Candidate, capture?: CaptureContext) {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/registered");
  captureValue(capture, "input/candidate", candidate);

  demand(S.candidates.some(c => c.T === candidate.T && c.h === candidate.h), "UNREGISTERED_CANDIDATE", candidate, capture);
}

export type RunInput = Readonly<{
  caseId: string; memberId: string; seedId: string; resolutionId: string;
  C: readonly [number, number];
  samples: readonly Readonly<{ index: number; tick: number; time: number; position: Position }>[];
  // Exactly one record per accepted step; clipping comes from retained lifecycle metadata.
  steps: readonly Readonly<{ fromIndex: number; clipped: boolean }>[];
  initialVelocity: Position | null;
  topologies: Readonly<Record<Channel, ProviderTopology | null>>;
  termination: "MAX_TIME" | "SOURCE_EXIT" | "GROUND" | "INITIAL_INVALID";
}>;
export type RunEvidence = Readonly<{
  id: string; caseId: string; memberId: string; seedId: string; resolutionId: string; h: number;
  C: readonly [number, number]; path: AcceptedPath | null; input: RunInput;
  primaryPrefix: number | null; sourcePrefix: number | null;
  primaryAtSample: readonly boolean[];
  events: readonly PreparedLifecycleEvent[]; crossings: readonly PreparedCrossingBracket[];
}>;
// Membership prevents accepting a mutable/forged prepared run or plan as a validated one.
// These are validation seals, not scientific-execution authorization capabilities.
const preparedRuns = new WeakSet<object>(), plans = new WeakSet<object>(), assessments = new WeakSet<object>();
function topology(t: ProviderTopology | null, required: boolean, capture?: CaptureContext) {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/topology");
  captureValue(capture, "input/t", t);
  captureValue(capture, "input/required", required);

  if (t === null) { demand(!required, "MISSING_TOPOLOGY", undefined, capture); return; }
  demand(t.fingerprint && t.version && dense(t.heights) && dense(t.support) && dense(t.segments) && dense(t.boundaries) &&
    t.heights.length >= 2, "MALFORMED_PROFILE", t, capture);
  demand(t.heights.every((h, i) => Number.isFinite(h) && (i === 0 || h > t.heights[i - 1])), "MALFORMED_PROFILE", t, capture);
  demand(t.support.length === t.heights.length - 1 && t.segments.length === t.support.length &&
    t.boundaries.length === t.heights.length, "MALFORMED_PROFILE", t, capture);
  demand(t.support.every(s => s === "FULL_SUPPORT" || s === "BOUNDARY_CONDITIONED") &&
    [t.segments, t.boundaries].every(ids => ids.every((id, i) => id.index === i && id.providerFingerprint === t.fingerprint)),
  "MALFORMED_PROFILE", t, capture);
}
function owned(t: ProviderTopology | null, y: number): number | null {
  if (!t || y < t.heights[0] || y > t.heights[t.heights.length - 1]) return null;
  let lo = 0, hi = t.heights.length - 1;
  while (lo + 1 < hi) { const m = Math.floor((lo + hi) / 2); if (y < t.heights[m]) hi = m; else lo = m; }
  return Math.min(lo, t.support.length - 1);
}
function full(t: ProviderTopology | null, y: number): boolean {
  const i = owned(t, y); return i !== null && t!.support[i] === "FULL_SUPPORT";
}
/** Inherited closed-step/owned-endpoint test, independent of quadrature's one-sided limits. */
function eligible(t: ProviderTopology | null, y0: number, y1: number): boolean {
  if (!t || !full(t, y0) || !full(t, y1)) return false;
  const min = Math.min(y0, y1), max = Math.max(y0, y1);
  return t.support.every((s, i) => !(max >= t.heights[i] &&
    (i === t.support.length - 1 ? min <= t.heights[i + 1] : min < t.heights[i + 1])) || s === "FULL_SUPPORT");
}
export function prepareRun(supplied: RunInput, capture?: CaptureContext): Result<RunEvidence> {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/prepareRun");
  captureValue(capture, "input/supplied", supplied);

  return captureValue(capture, "observedLagrangianPhaseP2Controller/103/return", guarded(() => {
    const input = captureValue(capture, "observedLagrangianPhaseP2Controller/104/local/input", freeze(structuredClone(supplied))), c = captureValue(capture, "observedLagrangianPhaseP2Controller/104/local/c", caseSpec(input.caseId, capture));
    const member = captureValue(capture, "observedLagrangianPhaseP2Controller/105/local/member", c.members.find(m => m.id === input.memberId)), seed = captureValue(capture, "observedLagrangianPhaseP2Controller/105/local/seed", S.seeds.find(s => s.id === input.seedId));
    const r = captureValue(capture, "observedLagrangianPhaseP2Controller/106/local/r", S.resolutions.find(r => r.id === input.resolutionId));
    demand(member && seed && r, "RUN_IDENTITY", input, capture);
    if (!dense(input.C) || input.C.length !== 2 || input.C.some((v, i) => v !== member.C[i]))
      throw captureValue(capture, "observedLagrangianPhaseP2Controller/109/throw", new Fault("CONFIGURATION_DRIFT/C", input.C, "UNEXPLAINED"));
    topology(input.topologies.Source, true, capture); topology(input.topologies.Analysis, c.analysisAvailable, capture);
    demand(c.analysisAvailable || input.topologies.Analysis === null, "UNAVAILABLE_ANALYSIS_HAS_TOPOLOGY", undefined, capture);
    demand(dense(input.samples) && dense(input.steps) && input.samples.length > 0 && input.steps.length === input.samples.length - 1,
      "MISSING_SAMPLE_OR_STEP", input, capture);
    input.samples.forEach((s, i) => demand(s.index === i && s.tick === i * r.ticks && s.time === s.tick / S.ticksPerSecond &&
      s.time <= 540 && finitePosition(s.position), "STORED_CLOCK_OR_POSITION", { id: i, sample: s }, capture));
    demand(samePosition(input.samples[0].position, seed), "INITIAL_SEED_MISMATCH", input.samples[0], capture);
    input.steps.forEach((s, i) => demand(s.fromIndex === i && typeof s.clipped === "boolean", "STEP_METADATA", s, capture));
    demand(input.initialVelocity === null || finitePosition(input.initialVelocity), "NONFINITE_INITIAL_VELOCITY", undefined, capture);
    const sourceInitial = captureValue(capture, "observedLagrangianPhaseP2Controller/119/local/sourceInitial", full(input.topologies.Source, seed.y));
    let primary = captureValue(capture, "observedLagrangianPhaseP2Controller/120/local/primary", sourceInitial && (!c.analysisAvailable || full(input.topologies.Analysis, seed.y)));
    let primaryPrefix: number | null = captureValue(capture, "observedLagrangianPhaseP2Controller/121/local/primaryPrefix", primary ? 0 : null), sourcePrefix: number | null = captureValue(capture, "observedLagrangianPhaseP2Controller/121/local/sourcePrefix", sourceInitial ? 0 : null);
    const primaryAtSample = captureValue(capture, "observedLagrangianPhaseP2Controller/122/local/primaryAtSample", [primary]), events: PreparedLifecycleEvent[] = captureValue(capture, "observedLagrangianPhaseP2Controller/122/local/events", []), crossings: PreparedCrossingBracket[] = captureValue(capture, "observedLagrangianPhaseP2Controller/122/local/crossings", []);
    let analysisLost = captureValue(capture, "observedLagrangianPhaseP2Controller/123/local/analysisLost", !primary), stopped = captureValue(capture, "observedLagrangianPhaseP2Controller/123/local/stopped", !sourceInitial);
    let expectedTermination: RunInput["termination"] = captureValue(capture, "observedLagrangianPhaseP2Controller/124/local/expectedTermination", stopped ? "INITIAL_INVALID" : "MAX_TIME");
    input.steps.forEach((step, i) => {
    captureValue(capture, "observedLagrangianPhaseP2Controller/125/callback/step", step);
    captureValue(capture, "observedLagrangianPhaseP2Controller/125/callback/i", i);
      demand(!stopped, "STEP_AFTER_SOURCE_EXIT_OR_GROUND", { index: i }, capture);
      const a = captureValue(capture, "observedLagrangianPhaseP2Controller/127/local/a", input.samples[i]), b = captureValue(capture, "observedLagrangianPhaseP2Controller/127/local/b", input.samples[i + 1]), y0 = captureValue(capture, "observedLagrangianPhaseP2Controller/127/local/y0", a.position.y), y1 = captureValue(capture, "observedLagrangianPhaseP2Controller/127/local/y1", b.position.y);
      demand(!step.clipped || y1 === 0, "CLIPPED_ENDPOINT_NOT_GROUND", { index: i, endpoint: b }, capture);
      const src = captureValue(capture, "observedLagrangianPhaseP2Controller/129/local/src", eligible(input.topologies.Source, y0, y1)), ana = captureValue(capture, "observedLagrangianPhaseP2Controller/129/local/ana", eligible(input.topologies.Analysis, y0, y1));
      const event = captureValue(capture, "observedLagrangianPhaseP2Controller/130/local/event", (kind: string, representation: Channel | null) => events.push(captureValue(capture, "observedLagrangianPhaseP2Controller/130/push", { a: a.time, b: b.time, kind, representation, category: "LIFECYCLE" })));
      for (const representation of ["Source", "Analysis"] as const) {
    captureValue(capture, "loop/representation", representation);
        const t = captureValue(capture, "observedLagrangianPhaseP2Controller/132/local/t", input.topologies[representation]);
        if (t) for (const y of (y1 < y0 ? t.heights.slice(1, -1).reverse() : t.heights.slice(1, -1))) {
    captureValue(capture, "loop/y", y);
          if (y1 > y0 ? y0 < y && y <= y1 : y1 < y && y <= y0)
            crossings.push(captureValue(capture, "observedLagrangianPhaseP2Controller/135/push", { a: a.time, b: b.time, representation }));
        }
      }
      if (!src) event("source-exit", "Source");
      if (c.analysisAvailable && !ana && !analysisLost) { event("analysis-loss", "Analysis"); analysisLost = captureValue(capture, "observedLagrangianPhaseP2Controller/139/assign/analysisLost", true); }
      if (step.clipped) event("ground", null);
      primary = captureValue(capture, "observedLagrangianPhaseP2Controller/141/assign/primary", primary && src && (!c.analysisAvailable || ana) && !step.clipped);
      primaryAtSample.push(captureValue(capture, "observedLagrangianPhaseP2Controller/142/push", primary)); if (primary) primaryPrefix = captureValue(capture, "observedLagrangianPhaseP2Controller/142/assign/primaryPrefix", b.time);
      if (src && !step.clipped) sourcePrefix = captureValue(capture, "observedLagrangianPhaseP2Controller/143/assign/sourcePrefix", b.time);
      if (!src || step.clipped) { stopped = captureValue(capture, "observedLagrangianPhaseP2Controller/144/assign/stopped", true); expectedTermination = captureValue(capture, "observedLagrangianPhaseP2Controller/144/assign/expectedTermination", step.clipped ? "GROUND" : "SOURCE_EXIT"); }
    });
    demand(input.termination === expectedTermination, "TERMINATION_METADATA", input.termination, capture);
    demand(stopped || input.samples[input.samples.length - 1].time === 540, "MISSING_RECORDED_TAIL", input, capture);
    demand(input.steps.length ? input.initialVelocity !== null : input.initialVelocity === null, "FIRST_STEP_METADATA", input, capture);
    const path = captureValue(capture, "observedLagrangianPhaseP2Controller/149/local/path", input.steps.length ? unwrap(createAcceptedPath(input.samples, capture), capture) : null);
    const result = captureValue(capture, "observedLagrangianPhaseP2Controller/150/local/result", freeze({ id: p2RunId(c.id, member.id, seed.id, r.id), caseId: c.id, memberId: member.id,
      seedId: seed.id, resolutionId: r.id, h: r.h, C: input.C, path, input, primaryPrefix, sourcePrefix,
      primaryAtSample, events, crossings }));
    preparedRuns.add(result); return captureValue(capture, "observedLagrangianPhaseP2Controller/153/return", result);
  }, capture));
}

export type RunSummary = Readonly<{ id: string; memberId: string; resolutionId: string; h: number;
  pathFingerprint: string | null; primaryPrefix: number | null; sourcePrefix: number | null;
  support: "FULL_DURATION" | "TRUNCATED" | "INITIAL_INVALID" }>;
export type OracleEvidence = Readonly<{ runId: string; baselineId: string; status: "PASS" | "UNEXPLAINED" | "INELIGIBLE";
  residual: number | null; tolerance: number | null; expected: Position | null; scale: number | null; reason: string }>;
function oracle(member: RunEvidence, baseline: RunEvidence, velocities: readonly Position[], capture?: CaptureContext): OracleEvidence {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/oracle");
  captureValue(capture, "input/member", member);
  captureValue(capture, "input/baseline", baseline);
  captureValue(capture, "input/velocities", velocities);

  if (!member.path || !baseline.path || member.input.steps[0].clipped || baseline.input.steps[0].clipped || velocities.length !== S.memberIds.length)
    return captureValue(capture, "observedLagrangianPhaseP2Controller/164/return", { runId: member.id, baselineId: baseline.id, status: "INELIGIBLE", residual: null, tolerance: null,
      expected: null, scale: null, reason: "IMMEDIATE_CLIPPING_OR_INITIAL_INVALID" });
  demand(velocities.length === S.memberIds.length && velocities.every(finitePosition), "ORACLE_INITIAL_VELOCITIES", undefined, capture);
  const expected = captureValue(capture, "observedLagrangianPhaseP2Controller/167/local/expected", { x: finite(-member.h * finite(member.C[0] - baseline.C[0], "oracle/dC", capture), "oracle/x", capture), y: 0,
    z: finite(member.h * finite(member.C[1] - baseline.C[1], "oracle/dC", capture), "oracle/z", capture) });
  const m = captureValue(capture, "observedLagrangianPhaseP2Controller/169/local/m", member.path.vertices[1].position), b = captureValue(capture, "observedLagrangianPhaseP2Controller/169/local/b", baseline.path.vertices[1].position);
  const residual = captureValue(capture, "observedLagrangianPhaseP2Controller/170/local/residual", Math.max(...(["x", "y", "z"] as const).map(k => (captureValue(capture, "callback/k", k), captureValue(capture, "map/([\"x\", \"y\", \"z\"] as const)/result", Math.abs(finite(finite(m[k] - b[k], "oracle/displacement", capture) - expected[k], "oracle/error", capture)))))));
  const scale = captureValue(capture, "observedLagrangianPhaseP2Controller/171/local/scale", Math.max(1, inf(member.input.samples[0].position), finite(member.h * Math.max(...velocities.map(inf)), "oracle/scale", capture)));
  const tolerance = captureValue(capture, "observedLagrangianPhaseP2Controller/172/local/tolerance", Math.max(1e-9, finite(128 * 2 ** -52 * scale, "oracle/tolerance", capture)));
  return captureValue(capture, "observedLagrangianPhaseP2Controller/173/return", { runId: member.id, baselineId: baseline.id, status: residual <= tolerance ? "PASS" : "UNEXPLAINED",
    residual, tolerance, expected, scale, reason: residual <= tolerance ? "WITHIN_TOLERANCE" : "FIRST_STEP_DISCREPANCY" });
}
export type GroupPlan = Readonly<{ schema: typeof S.evidenceSchema; authority: Readonly<{ id: string; hash: string }>;
  caseId: string; seedId: string; candidate: Candidate; interval: Interval | null;
  runs: readonly RunSummary[]; oracles: readonly OracleEvidence[]; viable: boolean;
}>;
const planRuns = new WeakMap<GroupPlan, readonly RunEvidence[]>();
export function planGroup(supplied: readonly RunEvidence[], candidate: Candidate, capture?: CaptureContext): Result<GroupPlan> {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/planGroup");
  captureValue(capture, "input/supplied", supplied);
  captureValue(capture, "input/candidate", candidate);

  return captureValue(capture, "observedLagrangianPhaseP2Controller/182/return", guarded(() => {
    registered(candidate, capture); demand(supplied.length === S.memberIds.length * S.resolutions.length, "INCOMPLETE_GROUP", undefined, capture);
    demand(supplied.every(r => preparedRuns.has(r)), "UNVALIDATED_RUN", undefined, capture);
    const first = captureValue(capture, "observedLagrangianPhaseP2Controller/185/local/first", supplied[0]), c = captureValue(capture, "observedLagrangianPhaseP2Controller/185/local/c", caseSpec(first.caseId, capture));
    demand(supplied.every(r => r.caseId === first.caseId && r.seedId === first.seedId), "MIXED_GROUP", undefined, capture);
    const ordered = captureValue(capture, "observedLagrangianPhaseP2Controller/187/local/ordered", S.memberIds.flatMap(m => (captureValue(capture, "callback/m", m), captureValue(capture, "map/S.memberIds/result", S.resolutions.map(r => {
    captureValue(capture, "observedLagrangianPhaseP2Controller/187/callback/r", r);
      const matches = captureValue(capture, "observedLagrangianPhaseP2Controller/188/local/matches", supplied.filter(u => u.memberId === m && u.resolutionId === r.id));
      demand(matches.length === 1, "MISSING_OR_DUPLICATE_RUN", { member: m, resolution: r.id }, capture); return captureValue(capture, "observedLagrangianPhaseP2Controller/189/return", matches[0]);
    })))));
    // Every resolution must use the same provider identities/topology within a representation.
    for (const channel of ["Source", "Analysis"] as const) {
    captureValue(capture, "loop/channel", channel);
      const reference = captureValue(capture, "observedLagrangianPhaseP2Controller/193/local/reference", ordered[0].input.topologies[channel]);
      demand(ordered.every(r => isDeepStrictEqual(r.input.topologies[channel], reference)), "PROVIDER_TOPOLOGY_DRIFT", undefined, capture);
    }
    const summaries = captureValue(capture, "observedLagrangianPhaseP2Controller/196/local/summaries", ordered.map(r => (captureValue(capture, "callback/r", r), captureValue(capture, "map/ordered/result", ({ id: r.id, memberId: r.memberId, resolutionId: r.resolutionId, h: r.h,
      pathFingerprint: r.path?.fingerprint ?? null, primaryPrefix: r.primaryPrefix, sourcePrefix: r.sourcePrefix,
      support: r.primaryPrefix === null ? "INITIAL_INVALID" as const : r.primaryPrefix >= candidate.T ? "FULL_DURATION" as const : "TRUNCATED" as const })))));
    const triple = captureValue(capture, "observedLagrangianPhaseP2Controller/199/local/triple", summaries.filter(r => [candidate.h, candidate.h / 2, candidate.h / 4].includes(r.h)));
    const end = captureValue(capture, "observedLagrangianPhaseP2Controller/200/local/end", triple.some(r => r.primaryPrefix === null) ? 0 :
      Math.floor(Math.min(candidate.T, ...triple.map(r => (captureValue(capture, "callback/r", r), captureValue(capture, "map/triple/result", r.primaryPrefix!)))) / candidate.h) * candidate.h);
    const oracles = captureValue(capture, "observedLagrangianPhaseP2Controller/202/local/oracles", S.resolutions.flatMap(resolution => {
    captureValue(capture, "observedLagrangianPhaseP2Controller/202/callback/resolution", resolution);
      const runs = captureValue(capture, "observedLagrangianPhaseP2Controller/203/local/runs", S.memberIds.map(m => (captureValue(capture, "callback/m", m), captureValue(capture, "map/S.memberIds/result", ordered.find(r => r.memberId === m && r.resolutionId === resolution.id)!))));
      const velocities = captureValue(capture, "observedLagrangianPhaseP2Controller/204/local/velocities", runs.map(r => (captureValue(capture, "callback/r", r), captureValue(capture, "map/runs/result", r.input.initialVelocity))).filter((v): v is Position => v !== null));
      return captureValue(capture, "observedLagrangianPhaseP2Controller/205/return", runs.slice(1).map(m => (captureValue(capture, "callback/m", m), captureValue(capture, "map/runs.slice(1)/result", oracle(m, runs[0], velocities, capture)))));
    }));
    const plan = captureValue(capture, "observedLagrangianPhaseP2Controller/207/local/plan", freeze({ schema: S.evidenceSchema, authority: { id: S.id, hash: S.documentSha256 }, caseId: c.id,
      seedId: first.seedId, candidate: { ...candidate }, interval: end > 0 ? { a: 0, b: end } : null,
      runs: summaries, oracles, viable: summaries.every(r => r.support === "FULL_DURATION") }));
    plans.add(plan); planRuns.set(plan, ordered); return captureValue(capture, "observedLagrangianPhaseP2Controller/210/return", plan);
  }, capture));
}

export type Family = "geometry" | "response" | "history" | "exposure" | "pointwise" | "events";
export type Requirement = Readonly<{ key: string; family: Family; memberId: string; pair: number;
  channel: Channel; context: ComparisonContext; ineligible: boolean; unavailable: boolean;
  metrics: readonly ComparisonMetric[]; baselineIds: Readonly<{ coarse: string; fine: string }> }>;
function requirements(plan: GroupPlan, capture?: CaptureContext): Requirement[] {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/requirements");
  captureValue(capture, "input/plan", plan);

  const c = captureValue(capture, "observedLagrangianPhaseP2Controller/219/local/c", caseSpec(plan.caseId, capture)), requests: Requirement[] = captureValue(capture, "observedLagrangianPhaseP2Controller/219/local/requests", []);
  for (const memberId of S.memberIds) for (const pair of [0, 1]) {
    captureValue(capture, "loop/pair", pair);
    const h = captureValue(capture, "observedLagrangianPhaseP2Controller/221/local/h", plan.candidate.h / 2 ** pair);
    const get = captureValue(capture, "observedLagrangianPhaseP2Controller/222/local/get", (m: string, dt: number) => plan.runs.find(r => r.memberId === m && r.h === dt)!);
    const coarse = captureValue(capture, "observedLagrangianPhaseP2Controller/223/local/coarse", get(memberId, h)), fine = captureValue(capture, "observedLagrangianPhaseP2Controller/223/local/fine", get(memberId, h / 2));
    const baselineIds = captureValue(capture, "observedLagrangianPhaseP2Controller/224/local/baselineIds", { coarse: get("C0", h).id, fine: get("C0", h / 2).id });
    function add(family: Family, channel: Channel, metrics: ComparisonMetric[], capture?: CaptureContext) {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/add");
  captureValue(capture, "input/family", family);
  captureValue(capture, "input/channel", channel);
  captureValue(capture, "input/metrics", metrics);

      const lifecycle = captureValue(capture, "observedLagrangianPhaseP2Controller/226/local/lifecycle", family === "events");
      const run = captureValue(capture, "observedLagrangianPhaseP2Controller/227/local/run", (r: RunSummary) => ({ id: r.id, pathFingerprint: r.pathFingerprint ?? "NO_ACCEPTED_PATH", h: r.h }));
      requests.push(captureValue(capture, "observedLagrangianPhaseP2Controller/228/push", { key: `${memberId}/${pair}/${channel}/${family}`, family, memberId, pair, channel,
        context: { coarse: run(coarse), fine: run(fine), interval: lifecycle ? { a: 0, b: plan.candidate.T } : plan.interval ?? { a: 0, b: 0 },
          channel, role: c.analysisAvailable && channel === "Source" ? "SECONDARY_DESCRIPTIVE" : "PRIMARY" },
        ineligible: !lifecycle && plan.interval === null, unavailable: channel === "Analysis" && !c.analysisAvailable,
        metrics, baselineIds }));
    }
    const primary = captureValue(capture, "observedLagrangianPhaseP2Controller/234/local/primary", c.analysisAvailable ? "Analysis" : "Source");
    add("geometry", primary, ["POSITION", "VERTICAL"], capture);
    add("response", primary, ["RESPONSE", "VERTICAL_RESPONSE"], capture);
    add("events", primary, ["PREFIX_TIME", "EVENT_COUNT"], capture);
    for (const channel of ["Source", "Analysis"] as const) {
    captureValue(capture, "loop/channel", channel);
      add("history", channel, ["HISTORY"], capture); add("exposure", channel, ["EXPOSURE_ABS", "EXPOSURE_SIGNED"], capture);
      add("pointwise", channel, ["POINTWISE"], capture);
    }
  }
  return captureValue(capture, "observedLagrangianPhaseP2Controller/243/return", requests);
}
export function comparisonRequirements(plan: GroupPlan, capture?: CaptureContext): readonly Requirement[] {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/comparisonRequirements");
  captureValue(capture, "input/plan", plan);

  demand(plans.has(plan), "UNVALIDATED_PLAN", undefined, capture); return captureValue(capture, "observedLagrangianPhaseP2Controller/246/return", freeze(requirements(plan, capture)));
}
export type EvidenceEntry = Readonly<{ key: string; result: ComparisonResult | Readonly<{
  status: "INELIGIBLE"; reason: "INELIGIBLE_INTERVAL"; value: null;
}> }>;
export type GroupAssessment = Readonly<{ plan: GroupPlan; requirements: readonly Requirement[];
  entries: readonly EvidenceEntry[]; refinements: readonly Readonly<{ key: string; result: ComparisonResult<RefinementEvidence> }>[];
  state: "QUALIFICATION_COMPLETE" | "QUALIFICATION_INCOMPLETE";
  admission: "ADMITTED" | "REJECTED" | "UNASSESSED";
  resolution: "QUALIFIED" | "NOT_QUALIFIED" | "UNASSESSED";
  control: "completed check" | "INVALID CONTROL" | "UNEXPLAINED" | null;
  reasons: readonly string[];
}>;
function sameContext(a: ComparisonContext, b: ComparisonContext): boolean {
  return a.channel === b.channel && a.role === b.role && a.interval.a === b.interval.a && a.interval.b === b.interval.b &&
    (["coarse", "fine"] as const).every(k => a[k].id === b[k].id && a[k].pathFingerprint === b[k].pathFingerprint && a[k].h === b[k].h);
}
function eventInput(plan: GroupPlan, request: Requirement, capture?: CaptureContext) {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/eventInput");
  captureValue(capture, "input/plan", plan);
  captureValue(capture, "input/request", request);

  const runs = captureValue(capture, "observedLagrangianPhaseP2Controller/264/local/runs", planRuns.get(plan)!);
  const get = captureValue(capture, "observedLagrangianPhaseP2Controller/265/local/get", (id: string) => runs.find(r => r.id === id)!);
  const prefix = captureValue(capture, "observedLagrangianPhaseP2Controller/266/local/prefix", (h: number) => {
    captureValue(capture, "observedLagrangianPhaseP2Controller/266/callback/h", h);
    const ps = captureValue(capture, "observedLagrangianPhaseP2Controller/267/local/ps", runs.filter(r => r.h === h).map(r => (captureValue(capture, "callback/r", r), captureValue(capture, "map/runs.filter(r => r.h === h)/result", r.primaryPrefix))));
    return captureValue(capture, "observedLagrangianPhaseP2Controller/268/return", ps.some(p => p === null) ? -1 : Math.min(plan.candidate.T, ...ps as number[]));
  });
  return captureValue(capture, "observedLagrangianPhaseP2Controller/270/return", { coarseEvents: get(request.context.coarse.id).events, fineEvents: get(request.context.fine.id).events,
    coarsePrefixTime: prefix(request.context.coarse.h), finePrefixTime: prefix(request.context.fine.h) });
}
function pointwiseIndices(plan: GroupPlan, req: Requirement, capture?: CaptureContext): number[] {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/pointwiseIndices");
  captureValue(capture, "input/plan", plan);
  captureValue(capture, "input/req", req);

  const runs = captureValue(capture, "observedLagrangianPhaseP2Controller/274/local/runs", planRuns.get(plan)!), c = captureValue(capture, "observedLagrangianPhaseP2Controller/274/local/c", runs.find(r => r.id === req.context.coarse.id)!), f = captureValue(capture, "observedLagrangianPhaseP2Controller/274/local/f", runs.find(r => r.id === req.context.fine.id)!);
  const brackets = captureValue(capture, "observedLagrangianPhaseP2Controller/275/local/brackets", [...c.crossings, ...f.crossings].filter(b => b.representation === req.channel && b.b <= req.context.interval.b)
    .sort((a, b) => a.a - b.a || a.b - b.b));
  const indices: number[] = captureValue(capture, "observedLagrangianPhaseP2Controller/277/local/indices", []);
  let bracketIndex = captureValue(capture, "observedLagrangianPhaseP2Controller/278/local/bracketIndex", 0);
  for (let i = captureValue(capture, "observedLagrangianPhaseP2Controller/279/local/i", 0); i <= req.context.interval.b / c.h; i++) {
    captureValue(capture, "loop/i", i);
    const a = captureValue(capture, "observedLagrangianPhaseP2Controller/280/local/a", c.input.samples[i]), b = captureValue(capture, "observedLagrangianPhaseP2Controller/280/local/b", f.input.samples[2 * i]);
    demand(a && b && a.time === b.time, "MISSING_COMMON_POINTWISE_SAMPLE", req.key, capture);
    while (bracketIndex < brackets.length && brackets[bracketIndex].b + 2 * c.h < a.time) bracketIndex++;
    const excluded = captureValue(capture, "observedLagrangianPhaseP2Controller/283/local/excluded", bracketIndex < brackets.length && a.time >= brackets[bracketIndex].a - 2 * c.h);
    if (owned(c.input.topologies[req.channel], a.position.y) === owned(f.input.topologies[req.channel], b.position.y) && !excluded) indices.push(captureValue(capture, "observedLagrangianPhaseP2Controller/284/push", i));
  }
  return captureValue(capture, "observedLagrangianPhaseP2Controller/286/return", indices);
}
/** Validate every required result and derive refinement internally; no caller-supplied PASS booleans. */
export function assessGroup(plan: GroupPlan, supplied: readonly EvidenceEntry[], capture?: CaptureContext): Result<GroupAssessment> {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/assessGroup");
  captureValue(capture, "input/plan", plan);
  captureValue(capture, "input/supplied", supplied);

  return captureValue(capture, "observedLagrangianPhaseP2Controller/290/return", guarded(() => {
    demand(plans.has(plan), "UNVALIDATED_PLAN", undefined, capture);
    const reqs = captureValue(capture, "observedLagrangianPhaseP2Controller/292/local/reqs", comparisonRequirements(plan, capture)), entries = captureValue(capture, "observedLagrangianPhaseP2Controller/292/local/entries", freeze(structuredClone(supplied)));
    demand(dense(entries) && entries.length === reqs.length && new Set(entries.map(e => (captureValue(capture, "callback/e", e), captureValue(capture, "map/entries/result", e.key)))).size === entries.length &&
      entries.every(e => reqs.some(r => r.key === e.key)), "MISSING_DUPLICATE_OR_FOREIGN_REQUIREMENT", undefined, capture);
    const ordered = captureValue(capture, "observedLagrangianPhaseP2Controller/295/local/ordered", reqs.map(r => (captureValue(capture, "callback/r", r), captureValue(capture, "map/reqs/result", entries.find(e => e.key === r.key)!))));
    const reasons: string[] = captureValue(capture, "observedLagrangianPhaseP2Controller/296/local/reasons", []), refinements: { key: string; result: ComparisonResult<RefinementEvidence> }[] = captureValue(capture, "observedLagrangianPhaseP2Controller/296/local/refinements", []);
    let incomplete = captureValue(capture, "observedLagrangianPhaseP2Controller/297/local/incomplete", false), invalid = captureValue(capture, "observedLagrangianPhaseP2Controller/297/local/invalid", !plan.viable);
    const unexplained = captureValue(capture, "observedLagrangianPhaseP2Controller/298/local/unexplained", plan.oracles.some(o => o.status === "UNEXPLAINED"));
    if (!plan.viable) reasons.push(captureValue(capture, "observedLagrangianPhaseP2Controller/299/push", "FULL_DURATION_ALL_FOUR_RESOLUTIONS_REQUIRED"));
    if (plan.oracles.some(o => o.status === "INELIGIBLE")) { invalid = captureValue(capture, "observedLagrangianPhaseP2Controller/300/assign/invalid", true); reasons.push(captureValue(capture, "observedLagrangianPhaseP2Controller/300/push", "ORACLE_INELIGIBLE")); }
    if (unexplained) { incomplete = captureValue(capture, "observedLagrangianPhaseP2Controller/301/assign/incomplete", true); reasons.push(captureValue(capture, "observedLagrangianPhaseP2Controller/301/push", "FIRST_STEP_DISCREPANCY")); }
    for (const [i, req] of reqs.entries()) {
      const result = captureValue(capture, "observedLagrangianPhaseP2Controller/303/local/result", ordered[i].result);
      if (req.unavailable || req.ineligible) {
        demand(req.unavailable ? result.status === "N_A" && result.reason === "COLUMN_UNAVAILABLE" && result.value === null :
          result.status === "INELIGIBLE" && result.reason === "INELIGIBLE_INTERVAL" && result.value === null, "INVALID_APPLICABILITY", req.key, capture);
        if (result.status === "N_A") demand(sameContext(result.evidence.context, req.context), "RESULT_CONTEXT_MISMATCH", req.key, capture);
        continue;
      }
      if (result.status !== "COMPLETE") {
        demand(result.status !== "INELIGIBLE", "UNEXPECTED_INELIGIBILITY", req.key, capture);
        demand(sameContext(result.evidence.context, req.context), "RESULT_CONTEXT_MISMATCH", req.key, capture);
        if (result.status === "N_A") {
          demand((req.family === "response" && req.memberId === "C0" && result.reason === "BASELINE_SELF_RESPONSE") ||
            (req.family === "pointwise" && result.reason === "NO_SEGMENT_MATCHED_SAMPLES"), "UNEXPECTED_N_A", req.key, capture);
          if (req.family === "pointwise") demand(pointwiseIndices(plan, req, capture).length === 0, "MISSING_REQUIRED_POINTWISE_CHECKS", req.key, capture);
        } else { incomplete = captureValue(capture, "observedLagrangianPhaseP2Controller/317/assign/incomplete", true); reasons.push(captureValue(capture, "observedLagrangianPhaseP2Controller/317/push", `${req.key}/${result.status}`)); }
        continue;
      }
      demand(!(req.family === "response" && req.memberId === "C0"), "FABRICATED_BASELINE_RESPONSE", undefined, capture);
      const b = captureValue(capture, "observedLagrangianPhaseP2Controller/321/local/b", result.value);
      demand(b.schema === "p2-comparison/v1" && sameContext(b.context, req.context), "RESULT_CONTEXT_MISMATCH", req.key, capture);
      demand(b.checks.length > 0 && new Set(b.checks.map(c => (captureValue(capture, "callback/c", c), captureValue(capture, "map/b.checks/result", c.key)))).size === b.checks.length &&
        req.metrics.every(m => b.checks.some(c => c.metric === m)), "MISSING_REQUIRED_METRIC", req.key, capture);
      const allowed = captureValue(capture, "observedLagrangianPhaseP2Controller/325/local/allowed", req.family === "events" ? ["PREFIX_TIME", "EVENT_COUNT", "EVENT_WIDTH", "EVENT_TYPES", "EVENT_TIME"] : req.metrics);
      demand(b.checks.every(c => allowed.includes(c.metric)), "FOREIGN_METRIC", req.key, capture);
      if (req.family !== "events" && req.family !== "pointwise") demand(b.checks.length === req.metrics.length, "DUPLICATE_METRIC", req.key, capture);
      if (req.family === "pointwise") {
        const indices = captureValue(capture, "observedLagrangianPhaseP2Controller/329/local/indices", pointwiseIndices(plan, req, capture));
        demand(indices.length === b.checks.length && indices.every((index, i) => b.checks[i].key === `POINTWISE/${index}` &&
          b.checks[i].details.time === index * req.context.coarse.h), "MISSING_REQUIRED_POINTWISE_CHECKS", req.key, capture);
      }
      if (req.family === "response") {
        const ids = captureValue(capture, "observedLagrangianPhaseP2Controller/334/local/ids", (b.details.input as { baselineIds?: { coarse: string; fine: string } } | undefined)?.baselineIds);
        demand(ids?.coarse === req.baselineIds.coarse && ids?.fine === req.baselineIds.fine, "BASELINE_BINDING_MISMATCH", req.key, capture);
      }
      const providerFingerprint = captureValue(capture, "observedLagrangianPhaseP2Controller/337/local/providerFingerprint", planRuns.get(plan)![0].input.topologies[req.channel]?.fingerprint);
      if (req.family === "history") demand(b.checks[0].details.coarseProviderFingerprint === providerFingerprint &&
        b.checks[0].details.fineProviderFingerprint === providerFingerprint, "HISTORY_PROVIDER_BINDING", req.key, capture);
      if (req.family === "exposure") for (const side of ["coarse", "fine"] as const) {
    captureValue(capture, "loop/side", side);
        const e = captureValue(capture, "observedLagrangianPhaseP2Controller/341/local/e", b.details[side] as { pathFingerprint?: string; providerFingerprint?: string } | undefined);
        demand(e?.pathFingerprint === req.context[side].pathFingerprint && e?.providerFingerprint === providerFingerprint,
          "EXPOSURE_PROVIDER_BINDING", req.key, capture);
      }
      for (const check of b.checks) {
    captureValue(capture, "loop/check", check);
        demand(Number.isFinite(check.residual) && check.residual >= 0 && Number.isFinite(check.tolerance) && check.tolerance >= 0 &&
          check.outcome === (check.residual <= check.tolerance ? "PASS" : "INVALID CONTROL"), "INVALID_CHECK", req.key, capture);
        // Prepared comparisons cannot introduce a different scientific budget.
        const expectedUnits = captureValue(capture, "observedLagrangianPhaseP2Controller/349/local/expectedUnits", ["POSITION", "VERTICAL", "RESPONSE", "VERTICAL_RESPONSE"].includes(check.metric) ? "m" :
          ["HISTORY", "POINTWISE"].includes(check.metric) ? "s^-2" : check.metric.startsWith("EXPOSURE") ? "s^-1" :
            ["EVENT_COUNT", "EVENT_TYPES"].includes(check.metric) ? "1" : "s");
        demand(check.units === expectedUnits, "METRIC_UNITS", req.key, capture);
        let expectedTolerance: number | null = captureValue(capture, "observedLagrangianPhaseP2Controller/353/local/expectedTolerance", null);
        if (["POSITION", "RESPONSE"].includes(check.metric)) expectedTolerance = captureValue(capture, "observedLagrangianPhaseP2Controller/354/assign/expectedTolerance", 10);
        if (["VERTICAL", "VERTICAL_RESPONSE"].includes(check.metric)) expectedTolerance = captureValue(capture, "observedLagrangianPhaseP2Controller/355/assign/expectedTolerance", 3);
        if (["HISTORY", "POINTWISE", "EXPOSURE_ABS", "EXPOSURE_SIGNED"].includes(check.metric)) {
          demand(check.scale !== null && Number.isFinite(check.scale) && check.scale >= 0, "INVALID_METRIC_SCALE", req.key, capture);
          expectedTolerance = captureValue(capture, "observedLagrangianPhaseP2Controller/358/assign/expectedTolerance", check.metric === "HISTORY" ? 1e-6 + 0.01 * check.scale :
            check.metric === "POINTWISE" ? 5e-6 + 0.02 * check.scale : Math.max(1e-5, 0.01 * Math.max(check.scale, 1e-3)));
          if (check.metric === "HISTORY") demand(check.details.R1 === check.residual && check.details.Aref === check.scale,
            "HISTORY_SCALE_OR_RESIDUAL_MISMATCH", req.key, capture);
          else {
            const coarse = captureValue(capture, "observedLagrangianPhaseP2Controller/363/local/coarse", check.metric === "POINTWISE" ? (check.details.coarse as EndpointOperand)?.T1 : check.details.coarse);
            const fine = captureValue(capture, "observedLagrangianPhaseP2Controller/364/local/fine", check.metric === "POINTWISE" ? (check.details.fine as EndpointOperand)?.T1 : check.details.fine);
            demand(typeof coarse === "number" && Number.isFinite(coarse) && typeof fine === "number" && Number.isFinite(fine),
              "MISSING_COMPARISON_OPERANDS", req.key, capture);
            demand(check.residual === Math.abs(finite(coarse - fine, "comparison/operand-difference", capture)) &&
              check.scale === (check.metric === "POINTWISE" ? Math.abs(fine) : Math.max(Math.abs(fine), 1e-3)),
              "COMPARISON_SCALE_OR_RESIDUAL_MISMATCH", req.key, capture);
          }
        }
        demand(expectedTolerance === null || check.tolerance === expectedTolerance, "SCIENTIFIC_BUDGET_MISMATCH", req.key, capture);
      }
      demand(b.outcome === (b.checks.every(c => c.outcome === "PASS") ? "PASS" : "INVALID CONTROL"), "INVALID_BUNDLE_OUTCOME", req.key, capture);
      // Lifecycle completeness is reconstructible without provider evaluation, including every co-event.
      if (req.family === "events") {
        const expected = captureValue(capture, "observedLagrangianPhaseP2Controller/377/local/expected", compareEvents(req.context, complete(eventInput(plan, req, capture)), capture));
        demand(expected.status === "COMPLETE" && isDeepStrictEqual(expected.value.checks, b.checks), "LIFECYCLE_EVIDENCE_MISMATCH", req.key, capture);
      }
      if (b.outcome !== "PASS") { invalid = captureValue(capture, "observedLagrangianPhaseP2Controller/380/assign/invalid", true); reasons.push(captureValue(capture, "observedLagrangianPhaseP2Controller/380/push", `${req.key}/TOLERANCE_EXCEEDED`)); }
    }
    for (const req of reqs.filter(r => r.pair === 0 && !r.ineligible && !r.unavailable &&
      ["geometry", "response", "history", "exposure"].includes(r.family) && !(r.family === "response" && r.memberId === "C0"))) {
    captureValue(capture, "loop/req", req);
      const fineKey = captureValue(capture, "observedLagrangianPhaseP2Controller/384/local/fineKey", `${req.memberId}/1/${req.channel}/${req.family}`);
      const coarse = captureValue(capture, "observedLagrangianPhaseP2Controller/385/local/coarse", ordered.find(e => e.key === req.key)!.result), fine = captureValue(capture, "observedLagrangianPhaseP2Controller/385/local/fine", ordered.find(e => e.key === fineKey)!.result);
      demand(coarse.status !== "INELIGIBLE" && fine.status !== "INELIGIBLE", "REFINEMENT_APPLICABILITY", undefined, capture);
      const result = captureValue(capture, "observedLagrangianPhaseP2Controller/387/local/result", compareSuccessiveRefinement(coarse, fine, capture)); refinements.push(captureValue(capture, "observedLagrangianPhaseP2Controller/387/push", { key: req.key, result }));
      if (result.status !== "COMPLETE") { incomplete = captureValue(capture, "observedLagrangianPhaseP2Controller/388/assign/incomplete", true); reasons.push(captureValue(capture, "observedLagrangianPhaseP2Controller/388/push", `${req.key}/REFINEMENT_INCOMPLETE`)); }
      else if (result.value.outcome !== "PASS") { invalid = captureValue(capture, "observedLagrangianPhaseP2Controller/389/assign/invalid", true); reasons.push(captureValue(capture, "observedLagrangianPhaseP2Controller/389/push", `${req.key}/REFINEMENT_FAILED`)); }
    }
    // Detach the summary from the plan's retained-path cache. Estimator results themselves retain their traces.
    const assessment = captureValue(capture, "observedLagrangianPhaseP2Controller/392/local/assessment", freeze({ plan: structuredClone(plan), requirements: reqs, entries: ordered, refinements,
      state: incomplete ? "QUALIFICATION_INCOMPLETE" as const : "QUALIFICATION_COMPLETE" as const,
      admission: incomplete ? "UNASSESSED" as const : invalid ? "REJECTED" as const : "ADMITTED" as const,
      resolution: incomplete ? "UNASSESSED" as const : invalid ? "NOT_QUALIFIED" as const : "QUALIFIED" as const,
      control: unexplained ? "UNEXPLAINED" as const : incomplete ? null : invalid ? "INVALID CONTROL" as const : "completed check" as const,
      reasons }));
    assessments.add(assessment); return captureValue(capture, "observedLagrangianPhaseP2Controller/398/return", assessment);
  }, capture));
}

export type Providers = Readonly<Record<Channel, VerticalDiagnosticProvider>>;
/** Evaluate retained accepted paths with the approved estimators. Never advances any clock. */
export function evaluateGroup(plan: GroupPlan, providers: Providers, capture?: CaptureContext): Result<GroupAssessment> {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/evaluateGroup");
  captureValue(capture, "input/plan", plan);
  captureValue(capture, "input/providers", providers);

  const evaluated = captureValue(capture, "observedLagrangianPhaseP2Controller/405/local/evaluated", guarded(() => {
    demand(plans.has(plan), "UNVALIDATED_PLAN", undefined, capture);
    const runs = captureValue(capture, "observedLagrangianPhaseP2Controller/407/local/runs", planRuns.get(plan)!);
    for (const channel of ["Source", "Analysis"] as const) {
    captureValue(capture, "loop/channel", channel);
      const expected = captureValue(capture, "observedLagrangianPhaseP2Controller/409/local/expected", runs[0].input.topologies[channel]), actual = captureValue(capture, "observedLagrangianPhaseP2Controller/409/local/actual", providers[channel]);
      demand(actual && typeof actual.ordinary === "function" && typeof actual.explicit === "function" && actual.fingerprint &&
        isDeepStrictEqual(actual.topology, expected) && (!expected || expected.fingerprint === actual.fingerprint),
      "PROVIDER_BINDING_MISMATCH", channel, capture);
    }
    const get = captureValue(capture, "observedLagrangianPhaseP2Controller/414/local/get", (id: string) => runs.find(r => r.id === id)!);
    return captureValue(capture, "observedLagrangianPhaseP2Controller/415/return", comparisonRequirements(plan, capture).map((req): EvidenceEntry => {
    captureValue(capture, "observedLagrangianPhaseP2Controller/415/callback/req", req);
      const c = captureValue(capture, "observedLagrangianPhaseP2Controller/416/local/c", req.context), coarse = captureValue(capture, "observedLagrangianPhaseP2Controller/416/local/coarse", get(c.coarse.id)), fine = captureValue(capture, "observedLagrangianPhaseP2Controller/416/local/fine", get(c.fine.id));
      const rejection = captureValue(capture, "observedLagrangianPhaseP2Controller/417/local/rejection", (reason: "COLUMN_UNAVAILABLE"): ComparisonResult => ({ status: "N_A", reason, value: null,
        evidence: { context: c, input: { requirement: req.key } } }));
      if (req.unavailable) return captureValue(capture, "observedLagrangianPhaseP2Controller/419/return", { key: req.key, result: rejection("COLUMN_UNAVAILABLE") });
      if (req.ineligible) return captureValue(capture, "observedLagrangianPhaseP2Controller/420/return", { key: req.key, result: { status: "INELIGIBLE", reason: "INELIGIBLE_INTERVAL", value: null } });
      let result: ComparisonResult;
      if (req.family === "events") result = captureValue(capture, "observedLagrangianPhaseP2Controller/422/assign/result", compareEvents(c, complete(eventInput(plan, req, capture)), capture));
      else {
        const provider = captureValue(capture, "observedLagrangianPhaseP2Controller/424/local/provider", providers[req.channel]), cp = captureValue(capture, "observedLagrangianPhaseP2Controller/424/local/cp", coarse.path!), fp = captureValue(capture, "observedLagrangianPhaseP2Controller/424/local/fp", fine.path!);
        const sample = captureValue(capture, "observedLagrangianPhaseP2Controller/425/local/sample", (r: RunEvidence, index: number) => {
    captureValue(capture, "observedLagrangianPhaseP2Controller/425/callback/r", r);
    captureValue(capture, "observedLagrangianPhaseP2Controller/425/callback/index", index);
          const s = captureValue(capture, "observedLagrangianPhaseP2Controller/426/local/s", r.input.samples[index]); demand(s && r.primaryAtSample[index], "MISSING_ELIGIBLE_STORED_SAMPLE", { run: r.id, index }, capture); return captureValue(capture, "observedLagrangianPhaseP2Controller/426/return", s);
        });
        const rows = captureValue(capture, "observedLagrangianPhaseP2Controller/428/local/rows", () => Array.from({ length: c.interval.b / coarse.h + 1 }, (_, i) => ({
          coarse: sample(coarse, i), fine: sample(fine, 2 * i) })));
        if (req.family === "geometry" || req.family === "response") {
          const response = captureValue(capture, "observedLagrangianPhaseP2Controller/431/local/response", req.family === "response");
          result = captureValue(capture, "observedLagrangianPhaseP2Controller/432/assign/result", compareGeometry(c, complete({ basis: "STORED_COMMON_COARSE_TIMES",
            kind: response ? req.memberId === "C0" ? "BASELINE_SELF_RESPONSE" : "MEMBER_RESPONSE" : "POSITION",
            baselineIds: response ? req.baselineIds : null,
            samples: rows().map((row, i) => (captureValue(capture, "callback/row", row), captureValue(capture, "callback/i", i), captureValue(capture, "map/rows()/result", ({ ...row,
              coarseBaseline: response ? sample(get(req.baselineIds.coarse), i) : null,
              fineBaseline: response ? sample(get(req.baselineIds.fine), 2 * i) : null })))) }), capture));
        } else if (req.family === "history") {
          result = captureValue(capture, "observedLagrangianPhaseP2Controller/439/assign/result", compareHistory(c, comparePathHistory(complete({ path: cp, provider, eligibility: "ELIGIBLE" }),
            complete({ path: fp, provider, eligibility: "ELIGIBLE" }), { interval: c.interval, role: c.role }, capture), capture));
        } else if (req.family === "exposure") {
          const exposure = captureValue(capture, "observedLagrangianPhaseP2Controller/442/local/exposure", (path: AcceptedPath) => integratePathExposure(path.steps.filter(s => s.to.time <= c.interval.b).map(s =>
            (captureValue(capture, "callback/s", s), captureValue(capture, "map/path.steps.filter(s => s.to.time <= c.interval.b)/result", partitionAcceptedStep(path, s.index, provider, { eligibility: "ELIGIBLE",
              support: c.role === "PRIMARY" ? "FULL_SUPPORT" : "ALLOW_BOUNDARY_CONDITIONED" }, capture)))), { role: c.role }, capture));
          result = captureValue(capture, "observedLagrangianPhaseP2Controller/445/assign/result", compareExposures(c, exposure(cp), exposure(fp), capture));
        } else {
          const samples: { coarse: EndpointOperand; fine: EndpointOperand }[] = captureValue(capture, "observedLagrangianPhaseP2Controller/447/local/samples", []);
          let rejected: Exclude<EstimatorResult<EndpointOperand>, { status: "COMPLETE" }> | null = captureValue(capture, "observedLagrangianPhaseP2Controller/448/local/rejected", null);
          for (const row of rows()) {
    captureValue(capture, "loop/row", row);
            const a = (captureValue(capture, "observedLagrangianPhaseP2Controller/450/provider-ordinary/begin", undefined), captureValue(capture, "observedLagrangianPhaseP2Controller/450/local/a", captureValue(capture, "observedLagrangianPhaseP2Controller/450/provider-ordinary/return", provider.ordinary(row.coarse.position, row.coarse.time, capture)))), b = (captureValue(capture, "observedLagrangianPhaseP2Controller/450/provider-ordinary/begin", undefined), captureValue(capture, "observedLagrangianPhaseP2Controller/450/local/b", captureValue(capture, "observedLagrangianPhaseP2Controller/450/provider-ordinary/return", provider.ordinary(row.fine.position, row.fine.time, capture))));
            if (a.status !== "COMPLETE") { rejected = captureValue(capture, "observedLagrangianPhaseP2Controller/451/assign/rejected", a); break; }
            if (b.status !== "COMPLETE") { rejected = captureValue(capture, "observedLagrangianPhaseP2Controller/452/assign/rejected", b); break; }
            for (const [operand, vertex] of [[a.value, row.coarse], [b.value, row.fine]] as const)
              demand(operand.time === vertex.time && samePosition(operand.position, vertex.position) && operand.context.side === "ORDINARY" &&
                operand.context.segment.providerFingerprint === provider.fingerprint &&
                operand.context.segment.index === owned(provider.topology, vertex.position.y), "ORDINARY_OPERAND_BINDING", undefined, capture);
            samples.push(captureValue(capture, "observedLagrangianPhaseP2Controller/457/push", { coarse: a.value, fine: b.value }));
          }
          result = captureValue(capture, "observedLagrangianPhaseP2Controller/459/assign/result", comparePointwise(c, rejected ?? complete({ basis: "STORED_COMMON_COARSE_TIMES", samples,
            coarseCrossings: coarse.crossings, fineCrossings: fine.crossings }), capture));
        }
      }
      return captureValue(capture, "observedLagrangianPhaseP2Controller/463/return", { key: req.key, result });
    }));
  }, capture));
  return captureValue(capture, "observedLagrangianPhaseP2Controller/466/return", evaluated.status === "COMPLETE" ? assessGroup(plan, evaluated.value, capture) : evaluated);
}

export type Decision = Readonly<{ schema: typeof S.evidenceSchema; authority: Readonly<{ id: string; hash: string }>;
  executionAuthority: "NOT_AUTHORIZED"; state: "QUALIFICATION_COMPLETE" | "QUALIFICATION_INCOMPLETE";
  selected: Candidate | null; control: "completed check" | "INVALID CONTROL" | "UNEXPLAINED" | null;
  candidates: readonly Readonly<{ candidate: Candidate; groups: readonly GroupAssessment[]; admitted: boolean }>[];
  reasons: readonly string[] }>;
/** Validate the complete ledger, then apply frozen candidate-order decision precedence. */
export function selectCandidate(supplied: readonly GroupAssessment[], capture?: CaptureContext): Result<Decision> {
  capture = enterCapture(capture, "observedLagrangianPhaseP2Controller/selectCandidate");
  captureValue(capture, "input/supplied", supplied);

  return captureValue(capture, "observedLagrangianPhaseP2Controller/476/return", guarded(() => {
    demand(supplied.length === S.candidates.length * S.cases.length * S.seeds.length &&
      supplied.every(g => assessments.has(g)), "INCOMPLETE_OR_UNVALIDATED_CAMPAIGN_LEDGER", undefined, capture);
    const candidates = captureValue(capture, "observedLagrangianPhaseP2Controller/479/local/candidates", S.candidates.map(candidate => (captureValue(capture, "callback/candidate", candidate), captureValue(capture, "map/S.candidates/result", ({ candidate, groups: S.cases.flatMap(c => (captureValue(capture, "callback/c", c), captureValue(capture, "map/S.cases/result", S.seeds.map(seed => {
    captureValue(capture, "observedLagrangianPhaseP2Controller/479/callback/seed", seed);
      const matches = captureValue(capture, "observedLagrangianPhaseP2Controller/480/local/matches", supplied.filter(g => g.plan.caseId === c.id && g.plan.seedId === seed.id &&
        g.plan.candidate.T === candidate.T && g.plan.candidate.h === candidate.h));
      demand(matches.length === 1, "MISSING_DUPLICATE_OR_FOREIGN_GROUP", { candidate, caseId: c.id, seedId: seed.id }, capture); return captureValue(capture, "observedLagrangianPhaseP2Controller/482/return", matches[0]);
    })))), admitted: false })))));
    candidates.forEach(c => {
    captureValue(capture, "observedLagrangianPhaseP2Controller/484/callback/c", c); c.admitted = captureValue(capture, "observedLagrangianPhaseP2Controller/484/assign/c.admitted", c.groups.every(g => g.admission === "ADMITTED")); });
    let incomplete = captureValue(capture, "observedLagrangianPhaseP2Controller/485/local/incomplete", false), unexplained = captureValue(capture, "observedLagrangianPhaseP2Controller/485/local/unexplained", false), selected: Candidate | null = captureValue(capture, "observedLagrangianPhaseP2Controller/485/local/selected", null);
    for (const candidate of candidates) {
    captureValue(capture, "loop/candidate", candidate);
      if (candidate.groups.some(g => g.state !== "QUALIFICATION_COMPLETE")) {
        incomplete = captureValue(capture, "observedLagrangianPhaseP2Controller/488/assign/incomplete", true);
        unexplained = captureValue(capture, "observedLagrangianPhaseP2Controller/489/assign/unexplained", candidate.groups.some(g => g.control === "UNEXPLAINED"));
        break;
      }
      if (candidate.admitted) { selected = captureValue(capture, "observedLagrangianPhaseP2Controller/492/assign/selected", candidate.candidate); break; }
    }
    return captureValue(capture, "observedLagrangianPhaseP2Controller/494/return", { schema: S.evidenceSchema, authority: { id: S.id, hash: S.documentSha256 }, executionAuthority: "NOT_AUTHORIZED",
      state: incomplete ? "QUALIFICATION_INCOMPLETE" : "QUALIFICATION_COMPLETE", selected,
      control: unexplained ? "UNEXPLAINED" : incomplete ? null : selected ? "completed check" : "INVALID CONTROL",
      candidates, reasons: incomplete ? ["UNRESOLVED_EVIDENCE_BLOCKS_SELECTION"] : selected ? [] : ["NO_COMPLETE_QUALIFIED_ENSEMBLE"] });
  }, capture));
}
