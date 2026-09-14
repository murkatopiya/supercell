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
function demand(condition: unknown, reason: string, evidence: unknown = null): asserts condition {
  if (!condition) throw new Fault(reason, evidence);
}
function finite(x: number, operation: string): number {
  demand(Number.isFinite(x), "NONFINITE_ARITHMETIC", { operation, value: null }); return x === 0 ? 0 : x;
}
function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
function guarded<T>(work: () => T): Result<T> {
  try { return { status: "COMPLETE", value: freeze(work()) }; }
  catch (e) {
    if (e instanceof Fault) return freeze({ status: "QUALIFICATION_INCOMPLETE", reason: e.reason,
      control: e.control, value: null, evidence: e.evidence });
    throw e;
  }
}
const samePosition = (a: Position, b: Position) => a.x === b.x && a.y === b.y && a.z === b.z;
const inf = (p: Position) => Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
const complete = <T>(value: T) => ({ status: "COMPLETE" as const, value });
const dense = (values: readonly unknown[]) => Array.isArray(values) && Array.from(values).every(v => v !== undefined && v !== null);
function unwrap<T>(r: EstimatorResult<T>): T {
  if (r.status !== "COMPLETE") throw new Fault("ESTIMATOR_INCOMPLETE", r);
  return r.value;
}
function caseSpec(id: string) {
  const c = S.cases.find(c => c.id === id); demand(c, "FOREIGN_CASE", id); return c;
}
function registered(candidate: Candidate) {
  demand(S.candidates.some(c => c.T === candidate.T && c.h === candidate.h), "UNREGISTERED_CANDIDATE", candidate);
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
function topology(t: ProviderTopology | null, required: boolean) {
  if (t === null) { demand(!required, "MISSING_TOPOLOGY"); return; }
  demand(t.fingerprint && t.version && dense(t.heights) && dense(t.support) && dense(t.segments) && dense(t.boundaries) &&
    t.heights.length >= 2, "MALFORMED_PROFILE", t);
  demand(t.heights.every((h, i) => Number.isFinite(h) && (i === 0 || h > t.heights[i - 1])), "MALFORMED_PROFILE", t);
  demand(t.support.length === t.heights.length - 1 && t.segments.length === t.support.length &&
    t.boundaries.length === t.heights.length, "MALFORMED_PROFILE", t);
  demand(t.support.every(s => s === "FULL_SUPPORT" || s === "BOUNDARY_CONDITIONED") &&
    [t.segments, t.boundaries].every(ids => ids.every((id, i) => id.index === i && id.providerFingerprint === t.fingerprint)),
  "MALFORMED_PROFILE", t);
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
export function prepareRun(supplied: RunInput): Result<RunEvidence> {
  return guarded(() => {
    const input = freeze(structuredClone(supplied)), c = caseSpec(input.caseId);
    const member = c.members.find(m => m.id === input.memberId), seed = S.seeds.find(s => s.id === input.seedId);
    const r = S.resolutions.find(r => r.id === input.resolutionId);
    demand(member && seed && r, "RUN_IDENTITY", input);
    if (!dense(input.C) || input.C.length !== 2 || input.C.some((v, i) => v !== member.C[i]))
      throw new Fault("CONFIGURATION_DRIFT/C", input.C, "UNEXPLAINED");
    topology(input.topologies.Source, true); topology(input.topologies.Analysis, c.analysisAvailable);
    demand(c.analysisAvailable || input.topologies.Analysis === null, "UNAVAILABLE_ANALYSIS_HAS_TOPOLOGY");
    demand(dense(input.samples) && dense(input.steps) && input.samples.length > 0 && input.steps.length === input.samples.length - 1,
      "MISSING_SAMPLE_OR_STEP", input);
    input.samples.forEach((s, i) => demand(s.index === i && s.tick === i * r.ticks && s.time === s.tick / S.ticksPerSecond &&
      s.time <= 540 && finitePosition(s.position), "STORED_CLOCK_OR_POSITION", { id: i, sample: s }));
    demand(samePosition(input.samples[0].position, seed), "INITIAL_SEED_MISMATCH", input.samples[0]);
    input.steps.forEach((s, i) => demand(s.fromIndex === i && typeof s.clipped === "boolean", "STEP_METADATA", s));
    demand(input.initialVelocity === null || finitePosition(input.initialVelocity), "NONFINITE_INITIAL_VELOCITY");
    const sourceInitial = full(input.topologies.Source, seed.y);
    let primary = sourceInitial && (!c.analysisAvailable || full(input.topologies.Analysis, seed.y));
    let primaryPrefix: number | null = primary ? 0 : null, sourcePrefix: number | null = sourceInitial ? 0 : null;
    const primaryAtSample = [primary], events: PreparedLifecycleEvent[] = [], crossings: PreparedCrossingBracket[] = [];
    let analysisLost = !primary, stopped = !sourceInitial;
    let expectedTermination: RunInput["termination"] = stopped ? "INITIAL_INVALID" : "MAX_TIME";
    input.steps.forEach((step, i) => {
      demand(!stopped, "STEP_AFTER_SOURCE_EXIT_OR_GROUND", { index: i });
      const a = input.samples[i], b = input.samples[i + 1], y0 = a.position.y, y1 = b.position.y;
      demand(!step.clipped || y1 === 0, "CLIPPED_ENDPOINT_NOT_GROUND", { index: i, endpoint: b });
      const src = eligible(input.topologies.Source, y0, y1), ana = eligible(input.topologies.Analysis, y0, y1);
      const event = (kind: string, representation: Channel | null) => events.push({ a: a.time, b: b.time, kind, representation, category: "LIFECYCLE" });
      for (const representation of ["Source", "Analysis"] as const) {
        const t = input.topologies[representation];
        if (t) for (const y of (y1 < y0 ? t.heights.slice(1, -1).reverse() : t.heights.slice(1, -1))) {
          if (y1 > y0 ? y0 < y && y <= y1 : y1 < y && y <= y0)
            crossings.push({ a: a.time, b: b.time, representation });
        }
      }
      if (!src) event("source-exit", "Source");
      if (c.analysisAvailable && !ana && !analysisLost) { event("analysis-loss", "Analysis"); analysisLost = true; }
      if (step.clipped) event("ground", null);
      primary = primary && src && (!c.analysisAvailable || ana) && !step.clipped;
      primaryAtSample.push(primary); if (primary) primaryPrefix = b.time;
      if (src && !step.clipped) sourcePrefix = b.time;
      if (!src || step.clipped) { stopped = true; expectedTermination = step.clipped ? "GROUND" : "SOURCE_EXIT"; }
    });
    demand(input.termination === expectedTermination, "TERMINATION_METADATA", input.termination);
    demand(stopped || input.samples[input.samples.length - 1].time === 540, "MISSING_RECORDED_TAIL", input);
    demand(input.steps.length ? input.initialVelocity !== null : input.initialVelocity === null, "FIRST_STEP_METADATA", input);
    const path = input.steps.length ? unwrap(createAcceptedPath(input.samples)) : null;
    const result = freeze({ id: p2RunId(c.id, member.id, seed.id, r.id), caseId: c.id, memberId: member.id,
      seedId: seed.id, resolutionId: r.id, h: r.h, C: input.C, path, input, primaryPrefix, sourcePrefix,
      primaryAtSample, events, crossings });
    preparedRuns.add(result); return result;
  });
}

export type RunSummary = Readonly<{ id: string; memberId: string; resolutionId: string; h: number;
  pathFingerprint: string | null; primaryPrefix: number | null; sourcePrefix: number | null;
  support: "FULL_DURATION" | "TRUNCATED" | "INITIAL_INVALID" }>;
export type OracleEvidence = Readonly<{ runId: string; baselineId: string; status: "PASS" | "UNEXPLAINED" | "INELIGIBLE";
  residual: number | null; tolerance: number | null; expected: Position | null; scale: number | null; reason: string }>;
function oracle(member: RunEvidence, baseline: RunEvidence, velocities: readonly Position[]): OracleEvidence {
  if (!member.path || !baseline.path || member.input.steps[0].clipped || baseline.input.steps[0].clipped || velocities.length !== S.memberIds.length)
    return { runId: member.id, baselineId: baseline.id, status: "INELIGIBLE", residual: null, tolerance: null,
      expected: null, scale: null, reason: "IMMEDIATE_CLIPPING_OR_INITIAL_INVALID" };
  demand(velocities.length === S.memberIds.length && velocities.every(finitePosition), "ORACLE_INITIAL_VELOCITIES");
  const expected = { x: finite(-member.h * finite(member.C[0] - baseline.C[0], "oracle/dC"), "oracle/x"), y: 0,
    z: finite(member.h * finite(member.C[1] - baseline.C[1], "oracle/dC"), "oracle/z") };
  const m = member.path.vertices[1].position, b = baseline.path.vertices[1].position;
  const residual = Math.max(...(["x", "y", "z"] as const).map(k => Math.abs(finite(finite(m[k] - b[k], "oracle/displacement") - expected[k], "oracle/error"))));
  const scale = Math.max(1, inf(member.input.samples[0].position), finite(member.h * Math.max(...velocities.map(inf)), "oracle/scale"));
  const tolerance = Math.max(1e-9, finite(128 * 2 ** -52 * scale, "oracle/tolerance"));
  return { runId: member.id, baselineId: baseline.id, status: residual <= tolerance ? "PASS" : "UNEXPLAINED",
    residual, tolerance, expected, scale, reason: residual <= tolerance ? "WITHIN_TOLERANCE" : "FIRST_STEP_DISCREPANCY" };
}
export type GroupPlan = Readonly<{ schema: typeof S.evidenceSchema; authority: Readonly<{ id: string; hash: string }>;
  caseId: string; seedId: string; candidate: Candidate; interval: Interval | null;
  runs: readonly RunSummary[]; oracles: readonly OracleEvidence[]; viable: boolean;
}>;
const planRuns = new WeakMap<GroupPlan, readonly RunEvidence[]>();
export function planGroup(supplied: readonly RunEvidence[], candidate: Candidate): Result<GroupPlan> {
  return guarded(() => {
    registered(candidate); demand(supplied.length === S.memberIds.length * S.resolutions.length, "INCOMPLETE_GROUP");
    demand(supplied.every(r => preparedRuns.has(r)), "UNVALIDATED_RUN");
    const first = supplied[0], c = caseSpec(first.caseId);
    demand(supplied.every(r => r.caseId === first.caseId && r.seedId === first.seedId), "MIXED_GROUP");
    const ordered = S.memberIds.flatMap(m => S.resolutions.map(r => {
      const matches = supplied.filter(u => u.memberId === m && u.resolutionId === r.id);
      demand(matches.length === 1, "MISSING_OR_DUPLICATE_RUN", { member: m, resolution: r.id }); return matches[0];
    }));
    // Every resolution must use the same provider identities/topology within a representation.
    for (const channel of ["Source", "Analysis"] as const) {
      const reference = ordered[0].input.topologies[channel];
      demand(ordered.every(r => isDeepStrictEqual(r.input.topologies[channel], reference)), "PROVIDER_TOPOLOGY_DRIFT");
    }
    const summaries = ordered.map(r => ({ id: r.id, memberId: r.memberId, resolutionId: r.resolutionId, h: r.h,
      pathFingerprint: r.path?.fingerprint ?? null, primaryPrefix: r.primaryPrefix, sourcePrefix: r.sourcePrefix,
      support: r.primaryPrefix === null ? "INITIAL_INVALID" as const : r.primaryPrefix >= candidate.T ? "FULL_DURATION" as const : "TRUNCATED" as const }));
    const triple = summaries.filter(r => [candidate.h, candidate.h / 2, candidate.h / 4].includes(r.h));
    const end = triple.some(r => r.primaryPrefix === null) ? 0 :
      Math.floor(Math.min(candidate.T, ...triple.map(r => r.primaryPrefix!)) / candidate.h) * candidate.h;
    const oracles = S.resolutions.flatMap(resolution => {
      const runs = S.memberIds.map(m => ordered.find(r => r.memberId === m && r.resolutionId === resolution.id)!);
      const velocities = runs.map(r => r.input.initialVelocity).filter((v): v is Position => v !== null);
      return runs.slice(1).map(m => oracle(m, runs[0], velocities));
    });
    const plan = freeze({ schema: S.evidenceSchema, authority: { id: S.id, hash: S.documentSha256 }, caseId: c.id,
      seedId: first.seedId, candidate: { ...candidate }, interval: end > 0 ? { a: 0, b: end } : null,
      runs: summaries, oracles, viable: summaries.every(r => r.support === "FULL_DURATION") });
    plans.add(plan); planRuns.set(plan, ordered); return plan;
  });
}

export type Family = "geometry" | "response" | "history" | "exposure" | "pointwise" | "events";
export type Requirement = Readonly<{ key: string; family: Family; memberId: string; pair: number;
  channel: Channel; context: ComparisonContext; ineligible: boolean; unavailable: boolean;
  metrics: readonly ComparisonMetric[]; baselineIds: Readonly<{ coarse: string; fine: string }> }>;
function requirements(plan: GroupPlan): Requirement[] {
  const c = caseSpec(plan.caseId), requests: Requirement[] = [];
  for (const memberId of S.memberIds) for (const pair of [0, 1]) {
    const h = plan.candidate.h / 2 ** pair;
    const get = (m: string, dt: number) => plan.runs.find(r => r.memberId === m && r.h === dt)!;
    const coarse = get(memberId, h), fine = get(memberId, h / 2);
    const baselineIds = { coarse: get("C0", h).id, fine: get("C0", h / 2).id };
    function add(family: Family, channel: Channel, metrics: ComparisonMetric[]) {
      const lifecycle = family === "events";
      const run = (r: RunSummary) => ({ id: r.id, pathFingerprint: r.pathFingerprint ?? "NO_ACCEPTED_PATH", h: r.h });
      requests.push({ key: `${memberId}/${pair}/${channel}/${family}`, family, memberId, pair, channel,
        context: { coarse: run(coarse), fine: run(fine), interval: lifecycle ? { a: 0, b: plan.candidate.T } : plan.interval ?? { a: 0, b: 0 },
          channel, role: c.analysisAvailable && channel === "Source" ? "SECONDARY_DESCRIPTIVE" : "PRIMARY" },
        ineligible: !lifecycle && plan.interval === null, unavailable: channel === "Analysis" && !c.analysisAvailable,
        metrics, baselineIds });
    }
    const primary = c.analysisAvailable ? "Analysis" : "Source";
    add("geometry", primary, ["POSITION", "VERTICAL"]);
    add("response", primary, ["RESPONSE", "VERTICAL_RESPONSE"]);
    add("events", primary, ["PREFIX_TIME", "EVENT_COUNT"]);
    for (const channel of ["Source", "Analysis"] as const) {
      add("history", channel, ["HISTORY"]); add("exposure", channel, ["EXPOSURE_ABS", "EXPOSURE_SIGNED"]);
      add("pointwise", channel, ["POINTWISE"]);
    }
  }
  return requests;
}
export function comparisonRequirements(plan: GroupPlan): readonly Requirement[] {
  demand(plans.has(plan), "UNVALIDATED_PLAN"); return freeze(requirements(plan));
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
function eventInput(plan: GroupPlan, request: Requirement) {
  const runs = planRuns.get(plan)!;
  const get = (id: string) => runs.find(r => r.id === id)!;
  const prefix = (h: number) => {
    const ps = runs.filter(r => r.h === h).map(r => r.primaryPrefix);
    return ps.some(p => p === null) ? -1 : Math.min(plan.candidate.T, ...ps as number[]);
  };
  return { coarseEvents: get(request.context.coarse.id).events, fineEvents: get(request.context.fine.id).events,
    coarsePrefixTime: prefix(request.context.coarse.h), finePrefixTime: prefix(request.context.fine.h) };
}
function pointwiseIndices(plan: GroupPlan, req: Requirement): number[] {
  const runs = planRuns.get(plan)!, c = runs.find(r => r.id === req.context.coarse.id)!, f = runs.find(r => r.id === req.context.fine.id)!;
  const brackets = [...c.crossings, ...f.crossings].filter(b => b.representation === req.channel && b.b <= req.context.interval.b)
    .sort((a, b) => a.a - b.a || a.b - b.b);
  const indices: number[] = [];
  let bracketIndex = 0;
  for (let i = 0; i <= req.context.interval.b / c.h; i++) {
    const a = c.input.samples[i], b = f.input.samples[2 * i];
    demand(a && b && a.time === b.time, "MISSING_COMMON_POINTWISE_SAMPLE", req.key);
    while (bracketIndex < brackets.length && brackets[bracketIndex].b + 2 * c.h < a.time) bracketIndex++;
    const excluded = bracketIndex < brackets.length && a.time >= brackets[bracketIndex].a - 2 * c.h;
    if (owned(c.input.topologies[req.channel], a.position.y) === owned(f.input.topologies[req.channel], b.position.y) && !excluded) indices.push(i);
  }
  return indices;
}
/** Validate every required result and derive refinement internally; no caller-supplied PASS booleans. */
export function assessGroup(plan: GroupPlan, supplied: readonly EvidenceEntry[]): Result<GroupAssessment> {
  return guarded(() => {
    demand(plans.has(plan), "UNVALIDATED_PLAN");
    const reqs = comparisonRequirements(plan), entries = freeze(structuredClone(supplied));
    demand(dense(entries) && entries.length === reqs.length && new Set(entries.map(e => e.key)).size === entries.length &&
      entries.every(e => reqs.some(r => r.key === e.key)), "MISSING_DUPLICATE_OR_FOREIGN_REQUIREMENT");
    const ordered = reqs.map(r => entries.find(e => e.key === r.key)!);
    const reasons: string[] = [], refinements: { key: string; result: ComparisonResult<RefinementEvidence> }[] = [];
    let incomplete = false, invalid = !plan.viable;
    const unexplained = plan.oracles.some(o => o.status === "UNEXPLAINED");
    if (!plan.viable) reasons.push("FULL_DURATION_ALL_FOUR_RESOLUTIONS_REQUIRED");
    if (plan.oracles.some(o => o.status === "INELIGIBLE")) { invalid = true; reasons.push("ORACLE_INELIGIBLE"); }
    if (unexplained) { incomplete = true; reasons.push("FIRST_STEP_DISCREPANCY"); }
    for (const [i, req] of reqs.entries()) {
      const result = ordered[i].result;
      if (req.unavailable || req.ineligible) {
        demand(req.unavailable ? result.status === "N_A" && result.reason === "COLUMN_UNAVAILABLE" && result.value === null :
          result.status === "INELIGIBLE" && result.reason === "INELIGIBLE_INTERVAL" && result.value === null, "INVALID_APPLICABILITY", req.key);
        if (result.status === "N_A") demand(sameContext(result.evidence.context, req.context), "RESULT_CONTEXT_MISMATCH", req.key);
        continue;
      }
      if (result.status !== "COMPLETE") {
        demand(result.status !== "INELIGIBLE", "UNEXPECTED_INELIGIBILITY", req.key);
        demand(sameContext(result.evidence.context, req.context), "RESULT_CONTEXT_MISMATCH", req.key);
        if (result.status === "N_A") {
          demand((req.family === "response" && req.memberId === "C0" && result.reason === "BASELINE_SELF_RESPONSE") ||
            (req.family === "pointwise" && result.reason === "NO_SEGMENT_MATCHED_SAMPLES"), "UNEXPECTED_N_A", req.key);
          if (req.family === "pointwise") demand(pointwiseIndices(plan, req).length === 0, "MISSING_REQUIRED_POINTWISE_CHECKS", req.key);
        } else { incomplete = true; reasons.push(`${req.key}/${result.status}`); }
        continue;
      }
      demand(!(req.family === "response" && req.memberId === "C0"), "FABRICATED_BASELINE_RESPONSE");
      const b = result.value;
      demand(b.schema === "p2-comparison/v1" && sameContext(b.context, req.context), "RESULT_CONTEXT_MISMATCH", req.key);
      demand(b.checks.length > 0 && new Set(b.checks.map(c => c.key)).size === b.checks.length &&
        req.metrics.every(m => b.checks.some(c => c.metric === m)), "MISSING_REQUIRED_METRIC", req.key);
      const allowed = req.family === "events" ? ["PREFIX_TIME", "EVENT_COUNT", "EVENT_WIDTH", "EVENT_TYPES", "EVENT_TIME"] : req.metrics;
      demand(b.checks.every(c => allowed.includes(c.metric)), "FOREIGN_METRIC", req.key);
      if (req.family !== "events" && req.family !== "pointwise") demand(b.checks.length === req.metrics.length, "DUPLICATE_METRIC", req.key);
      if (req.family === "pointwise") {
        const indices = pointwiseIndices(plan, req);
        demand(indices.length === b.checks.length && indices.every((index, i) => b.checks[i].key === `POINTWISE/${index}` &&
          b.checks[i].details.time === index * req.context.coarse.h), "MISSING_REQUIRED_POINTWISE_CHECKS", req.key);
      }
      if (req.family === "response") {
        const ids = (b.details.input as { baselineIds?: { coarse: string; fine: string } } | undefined)?.baselineIds;
        demand(ids?.coarse === req.baselineIds.coarse && ids?.fine === req.baselineIds.fine, "BASELINE_BINDING_MISMATCH", req.key);
      }
      const providerFingerprint = planRuns.get(plan)![0].input.topologies[req.channel]?.fingerprint;
      if (req.family === "history") demand(b.checks[0].details.coarseProviderFingerprint === providerFingerprint &&
        b.checks[0].details.fineProviderFingerprint === providerFingerprint, "HISTORY_PROVIDER_BINDING", req.key);
      if (req.family === "exposure") for (const side of ["coarse", "fine"] as const) {
        const e = b.details[side] as { pathFingerprint?: string; providerFingerprint?: string } | undefined;
        demand(e?.pathFingerprint === req.context[side].pathFingerprint && e?.providerFingerprint === providerFingerprint,
          "EXPOSURE_PROVIDER_BINDING", req.key);
      }
      for (const check of b.checks) {
        demand(Number.isFinite(check.residual) && check.residual >= 0 && Number.isFinite(check.tolerance) && check.tolerance >= 0 &&
          check.outcome === (check.residual <= check.tolerance ? "PASS" : "INVALID CONTROL"), "INVALID_CHECK", req.key);
        // Prepared comparisons cannot introduce a different scientific budget.
        const expectedUnits = ["POSITION", "VERTICAL", "RESPONSE", "VERTICAL_RESPONSE"].includes(check.metric) ? "m" :
          ["HISTORY", "POINTWISE"].includes(check.metric) ? "s^-2" : check.metric.startsWith("EXPOSURE") ? "s^-1" :
            ["EVENT_COUNT", "EVENT_TYPES"].includes(check.metric) ? "1" : "s";
        demand(check.units === expectedUnits, "METRIC_UNITS", req.key);
        let expectedTolerance: number | null = null;
        if (["POSITION", "RESPONSE"].includes(check.metric)) expectedTolerance = 10;
        if (["VERTICAL", "VERTICAL_RESPONSE"].includes(check.metric)) expectedTolerance = 3;
        if (["HISTORY", "POINTWISE", "EXPOSURE_ABS", "EXPOSURE_SIGNED"].includes(check.metric)) {
          demand(check.scale !== null && Number.isFinite(check.scale) && check.scale >= 0, "INVALID_METRIC_SCALE", req.key);
          expectedTolerance = check.metric === "HISTORY" ? 1e-6 + 0.01 * check.scale :
            check.metric === "POINTWISE" ? 5e-6 + 0.02 * check.scale : Math.max(1e-5, 0.01 * Math.max(check.scale, 1e-3));
          if (check.metric === "HISTORY") demand(check.details.R1 === check.residual && check.details.Aref === check.scale,
            "HISTORY_SCALE_OR_RESIDUAL_MISMATCH", req.key);
          else {
            const coarse = check.metric === "POINTWISE" ? (check.details.coarse as EndpointOperand)?.T1 : check.details.coarse;
            const fine = check.metric === "POINTWISE" ? (check.details.fine as EndpointOperand)?.T1 : check.details.fine;
            demand(typeof coarse === "number" && Number.isFinite(coarse) && typeof fine === "number" && Number.isFinite(fine),
              "MISSING_COMPARISON_OPERANDS", req.key);
            demand(check.residual === Math.abs(finite(coarse - fine, "comparison/operand-difference")) &&
              check.scale === (check.metric === "POINTWISE" ? Math.abs(fine) : Math.max(Math.abs(fine), 1e-3)),
              "COMPARISON_SCALE_OR_RESIDUAL_MISMATCH", req.key);
          }
        }
        demand(expectedTolerance === null || check.tolerance === expectedTolerance, "SCIENTIFIC_BUDGET_MISMATCH", req.key);
      }
      demand(b.outcome === (b.checks.every(c => c.outcome === "PASS") ? "PASS" : "INVALID CONTROL"), "INVALID_BUNDLE_OUTCOME", req.key);
      // Lifecycle completeness is reconstructible without provider evaluation, including every co-event.
      if (req.family === "events") {
        const expected = compareEvents(req.context, complete(eventInput(plan, req)));
        demand(expected.status === "COMPLETE" && isDeepStrictEqual(expected.value.checks, b.checks), "LIFECYCLE_EVIDENCE_MISMATCH", req.key);
      }
      if (b.outcome !== "PASS") { invalid = true; reasons.push(`${req.key}/TOLERANCE_EXCEEDED`); }
    }
    for (const req of reqs.filter(r => r.pair === 0 && !r.ineligible && !r.unavailable &&
      ["geometry", "response", "history", "exposure"].includes(r.family) && !(r.family === "response" && r.memberId === "C0"))) {
      const fineKey = `${req.memberId}/1/${req.channel}/${req.family}`;
      const coarse = ordered.find(e => e.key === req.key)!.result, fine = ordered.find(e => e.key === fineKey)!.result;
      demand(coarse.status !== "INELIGIBLE" && fine.status !== "INELIGIBLE", "REFINEMENT_APPLICABILITY");
      const result = compareSuccessiveRefinement(coarse, fine); refinements.push({ key: req.key, result });
      if (result.status !== "COMPLETE") { incomplete = true; reasons.push(`${req.key}/REFINEMENT_INCOMPLETE`); }
      else if (result.value.outcome !== "PASS") { invalid = true; reasons.push(`${req.key}/REFINEMENT_FAILED`); }
    }
    // Detach the summary from the plan's retained-path cache. Estimator results themselves retain their traces.
    const assessment = freeze({ plan: structuredClone(plan), requirements: reqs, entries: ordered, refinements,
      state: incomplete ? "QUALIFICATION_INCOMPLETE" as const : "QUALIFICATION_COMPLETE" as const,
      admission: incomplete ? "UNASSESSED" as const : invalid ? "REJECTED" as const : "ADMITTED" as const,
      resolution: incomplete ? "UNASSESSED" as const : invalid ? "NOT_QUALIFIED" as const : "QUALIFIED" as const,
      control: unexplained ? "UNEXPLAINED" as const : incomplete ? null : invalid ? "INVALID CONTROL" as const : "completed check" as const,
      reasons });
    assessments.add(assessment); return assessment;
  });
}

export type Providers = Readonly<Record<Channel, VerticalDiagnosticProvider>>;
/** Evaluate retained accepted paths with the approved estimators. Never advances any clock. */
export function evaluateGroup(plan: GroupPlan, providers: Providers): Result<GroupAssessment> {
  const evaluated = guarded(() => {
    demand(plans.has(plan), "UNVALIDATED_PLAN");
    const runs = planRuns.get(plan)!;
    for (const channel of ["Source", "Analysis"] as const) {
      const expected = runs[0].input.topologies[channel], actual = providers[channel];
      demand(actual && typeof actual.ordinary === "function" && typeof actual.explicit === "function" && actual.fingerprint &&
        isDeepStrictEqual(actual.topology, expected) && (!expected || expected.fingerprint === actual.fingerprint),
      "PROVIDER_BINDING_MISMATCH", channel);
    }
    const get = (id: string) => runs.find(r => r.id === id)!;
    return comparisonRequirements(plan).map((req): EvidenceEntry => {
      const c = req.context, coarse = get(c.coarse.id), fine = get(c.fine.id);
      const rejection = (reason: "COLUMN_UNAVAILABLE"): ComparisonResult => ({ status: "N_A", reason, value: null,
        evidence: { context: c, input: { requirement: req.key } } });
      if (req.unavailable) return { key: req.key, result: rejection("COLUMN_UNAVAILABLE") };
      if (req.ineligible) return { key: req.key, result: { status: "INELIGIBLE", reason: "INELIGIBLE_INTERVAL", value: null } };
      let result: ComparisonResult;
      if (req.family === "events") result = compareEvents(c, complete(eventInput(plan, req)));
      else {
        const provider = providers[req.channel], cp = coarse.path!, fp = fine.path!;
        const sample = (r: RunEvidence, index: number) => {
          const s = r.input.samples[index]; demand(s && r.primaryAtSample[index], "MISSING_ELIGIBLE_STORED_SAMPLE", { run: r.id, index }); return s;
        };
        const rows = () => Array.from({ length: c.interval.b / coarse.h + 1 }, (_, i) => ({
          coarse: sample(coarse, i), fine: sample(fine, 2 * i) }));
        if (req.family === "geometry" || req.family === "response") {
          const response = req.family === "response";
          result = compareGeometry(c, complete({ basis: "STORED_COMMON_COARSE_TIMES",
            kind: response ? req.memberId === "C0" ? "BASELINE_SELF_RESPONSE" : "MEMBER_RESPONSE" : "POSITION",
            baselineIds: response ? req.baselineIds : null,
            samples: rows().map((row, i) => ({ ...row,
              coarseBaseline: response ? sample(get(req.baselineIds.coarse), i) : null,
              fineBaseline: response ? sample(get(req.baselineIds.fine), 2 * i) : null })) }));
        } else if (req.family === "history") {
          result = compareHistory(c, comparePathHistory(complete({ path: cp, provider, eligibility: "ELIGIBLE" }),
            complete({ path: fp, provider, eligibility: "ELIGIBLE" }), { interval: c.interval, role: c.role }));
        } else if (req.family === "exposure") {
          const exposure = (path: AcceptedPath) => integratePathExposure(path.steps.filter(s => s.to.time <= c.interval.b).map(s =>
            partitionAcceptedStep(path, s.index, provider, { eligibility: "ELIGIBLE",
              support: c.role === "PRIMARY" ? "FULL_SUPPORT" : "ALLOW_BOUNDARY_CONDITIONED" })), { role: c.role });
          result = compareExposures(c, exposure(cp), exposure(fp));
        } else {
          const samples: { coarse: EndpointOperand; fine: EndpointOperand }[] = [];
          let rejected: Exclude<EstimatorResult<EndpointOperand>, { status: "COMPLETE" }> | null = null;
          for (const row of rows()) {
            const a = provider.ordinary(row.coarse.position, row.coarse.time), b = provider.ordinary(row.fine.position, row.fine.time);
            if (a.status !== "COMPLETE") { rejected = a; break; }
            if (b.status !== "COMPLETE") { rejected = b; break; }
            for (const [operand, vertex] of [[a.value, row.coarse], [b.value, row.fine]] as const)
              demand(operand.time === vertex.time && samePosition(operand.position, vertex.position) && operand.context.side === "ORDINARY" &&
                operand.context.segment.providerFingerprint === provider.fingerprint &&
                operand.context.segment.index === owned(provider.topology, vertex.position.y), "ORDINARY_OPERAND_BINDING");
            samples.push({ coarse: a.value, fine: b.value });
          }
          result = comparePointwise(c, rejected ?? complete({ basis: "STORED_COMMON_COARSE_TIMES", samples,
            coarseCrossings: coarse.crossings, fineCrossings: fine.crossings }));
        }
      }
      return { key: req.key, result };
    });
  });
  return evaluated.status === "COMPLETE" ? assessGroup(plan, evaluated.value) : evaluated;
}

export type Decision = Readonly<{ schema: typeof S.evidenceSchema; authority: Readonly<{ id: string; hash: string }>;
  executionAuthority: "NOT_AUTHORIZED"; state: "QUALIFICATION_COMPLETE" | "QUALIFICATION_INCOMPLETE";
  selected: Candidate | null; control: "completed check" | "INVALID CONTROL" | "UNEXPLAINED" | null;
  candidates: readonly Readonly<{ candidate: Candidate; groups: readonly GroupAssessment[]; admitted: boolean }>[];
  reasons: readonly string[] }>;
/** Validate the complete ledger, then apply frozen candidate-order decision precedence. */
export function selectCandidate(supplied: readonly GroupAssessment[]): Result<Decision> {
  return guarded(() => {
    demand(supplied.length === S.candidates.length * S.cases.length * S.seeds.length &&
      supplied.every(g => assessments.has(g)), "INCOMPLETE_OR_UNVALIDATED_CAMPAIGN_LEDGER");
    const candidates = S.candidates.map(candidate => ({ candidate, groups: S.cases.flatMap(c => S.seeds.map(seed => {
      const matches = supplied.filter(g => g.plan.caseId === c.id && g.plan.seedId === seed.id &&
        g.plan.candidate.T === candidate.T && g.plan.candidate.h === candidate.h);
      demand(matches.length === 1, "MISSING_DUPLICATE_OR_FOREIGN_GROUP", { candidate, caseId: c.id, seedId: seed.id }); return matches[0];
    })), admitted: false }));
    candidates.forEach(c => { c.admitted = c.groups.every(g => g.admission === "ADMITTED"); });
    let incomplete = false, unexplained = false, selected: Candidate | null = null;
    for (const candidate of candidates) {
      if (candidate.groups.some(g => g.state !== "QUALIFICATION_COMPLETE")) {
        incomplete = true;
        unexplained = candidate.groups.some(g => g.control === "UNEXPLAINED");
        break;
      }
      if (candidate.admitted) { selected = candidate.candidate; break; }
    }
    return { schema: S.evidenceSchema, authority: { id: S.id, hash: S.documentSha256 }, executionAuthority: "NOT_AUTHORIZED",
      state: incomplete ? "QUALIFICATION_INCOMPLETE" : "QUALIFICATION_COMPLETE", selected,
      control: unexplained ? "UNEXPLAINED" : incomplete ? null : selected ? "completed check" : "INVALID CONTROL",
      candidates, reasons: incomplete ? ["UNRESOLVED_EVIDENCE_BLOCKS_SELECTION"] : selected ? [] : ["NO_COMPLETE_QUALIFIED_ENSEMBLE"] };
  });
}
