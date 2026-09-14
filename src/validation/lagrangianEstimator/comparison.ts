/** Frozen P2 §16 criteria over prepared evidence only; inherited P §9/§19 details. */
import { normalizeExactZero } from "./arithmetic.js";
import type { ComparisonBundle, ComparisonCheck, ComparisonContext, ComparisonMetric, ComparisonOutcome,
  ComparisonRejection, ComparisonResult, PreparedComparison, PreparedGeometry, PreparedPointwise,
  PreparedEvents, PreparedLifecycleEvent, ExposureResult, HistoryResult, Interval, Position,
  RefinementEvidence } from "./types.js";

class Fault extends Error {
  constructor(readonly result: ComparisonRejection) { super("Comparison incomplete"); }
}
function fail(operation: string, code: "INVALID_CONTEXT" | "NONFINITE_ARITHMETIC" = "INVALID_CONTEXT"): never {
  throw new Fault({ status: "FAILED", code, operation });
}
function finite(x: number, operation: string): number {
  if (!Number.isFinite(x)) fail(operation, "NONFINITE_ARITHMETIC");
  return normalizeExactZero(x);
}
function nonnegative(x: number, operation: string): number {
  finite(x, operation); if (x < 0) fail(operation); return x;
}
function unwrap<T>(r: PreparedComparison<T>): T {
  if (r.status !== "COMPLETE") throw new Fault(r);
  return r.value;
}
function freeze<T>(x: T): T {
  if (x !== null && typeof x === "object" && !Object.isFrozen(x)) {
    for (const v of Object.values(x)) freeze(v);
    Object.freeze(x);
  }
  return x;
}
function sameInterval(a: Interval, b: Interval): boolean { return a.a === b.a && a.b === b.b; }
function validateContext(c: ComparisonContext) {
  finite(c.interval.a, "comparison/interval"); finite(c.interval.b, "comparison/interval");
  if (!(finite(c.interval.b - c.interval.a, "comparison/duration") > 0))
    throw new Fault({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null });
  for (const run of [c.coarse, c.fine]) {
    if (!run.id || !run.pathFingerprint || !(finite(run.h, "comparison/h") > 0)) fail("comparison/run");
  }
  if (c.coarse.id === c.fine.id || c.coarse.h !== finite(2 * c.fine.h, "comparison/nested-h")) fail("comparison/nested-pair");
  if (!c.channel || (c.role !== "PRIMARY" && c.role !== "SECONDARY_DESCRIPTIVE")) fail("comparison/context");
}
function guarded<T>(context: ComparisonContext, input: unknown, work: () => T): ComparisonResult<T> {
  try { validateContext(context); return { status: "COMPLETE", value: freeze(work()) }; }
  catch (error) {
    if (error instanceof Fault) return { ...error.result, evidence: freeze({ context, input }) };
    throw error;
  }
}
function outcome(checks: readonly { outcome: ComparisonOutcome }[]): ComparisonOutcome {
  return checks.some(c => c.outcome === "INVALID CONTROL") ? "INVALID CONTROL" : "PASS";
}
function check(metric: ComparisonMetric, residual: number, tolerance: number, units: ComparisonCheck["units"],
  details: ComparisonCheck["details"] = {}, options: Partial<Pick<ComparisonCheck, "key" | "scale" | "absoluteTerm" | "relativeTerm" | "arithmetic">> = {}): ComparisonCheck {
  nonnegative(residual, "comparison/residual"); nonnegative(tolerance, "comparison/tolerance");
  if (options.scale !== undefined && options.scale !== null) nonnegative(options.scale, "comparison/scale");
  for (const a of options.arithmetic ?? []) {
    if (!Number.isSafeInteger(a.k) || a.k <= 0) fail("comparison/arithmetic-k");
    nonnegative(a.scale, "comparison/arithmetic-scale"); nonnegative(a.bound, "comparison/arithmetic-bound");
  }
  const passed = residual <= tolerance;
  return freeze({ metric, key: options.key ?? metric, units, residual: normalizeExactZero(residual), tolerance,
    scale: options.scale ?? null, absoluteTerm: options.absoluteTerm ?? null, relativeTerm: options.relativeTerm ?? null,
    arithmetic: options.arithmetic ?? [], details, outcome: passed ? "PASS" : "INVALID CONTROL",
    reason: passed ? "WITHIN_TOLERANCE" : "TOLERANCE_EXCEEDED" });
}
function bundle(context: ComparisonContext, checks: readonly ComparisonCheck[], details: ComparisonBundle["details"] = {}): ComparisonBundle {
  return { schema: "p2-comparison/v1", context, checks, outcome: outcome(checks), details };
}
function difference(a: number, b: number): number {
  finite(a, "comparison/operand"); finite(b, "comparison/operand");
  return finite(a - b, "comparison/subtract");
}
function subtract(a: Position, b: Position): Position {
  return { x: difference(a.x, b.x), y: difference(a.y, b.y), z: difference(a.z, b.z) };
}
// Validate the supplied complete common-grid rows, without generating any samples.
function commonTimes(c: ComparisonContext, times: readonly number[]) {
  if (!times.length) fail("comparison/missing-common-samples");
  for (let i = 0; i < times.length; i++) {
    finite(times[i], "comparison/sample-time");
    const expected = finite(c.interval.a + finite(i * c.coarse.h, "comparison/grid-offset"), "comparison/grid-time");
    if (times[i] !== expected || (i > 0 && !(times[i] > times[i - 1]))) fail("comparison/common-grid");
  }
  if (times[times.length - 1] !== c.interval.b) fail("comparison/incomplete-common-grid");
}
export function compareGeometry(suppliedContext: ComparisonContext, supplied: PreparedComparison<PreparedGeometry>): ComparisonResult {
  const c = freeze(structuredClone(suppliedContext)), input = freeze(structuredClone(supplied));
  return guarded(c, input, () => {
    const data = unwrap(input);
    if (data.kind === "BASELINE_SELF_RESPONSE") throw new Fault({ status: "N_A", reason: "BASELINE_SELF_RESPONSE", value: null });
    if (data.basis !== "STORED_COMMON_COARSE_TIMES" || !["POSITION", "MEMBER_RESPONSE"].includes(data.kind)) fail("geometry/basis");
    const response = data.kind === "MEMBER_RESPONSE";
    if (response && (!data.baselineIds?.coarse || !data.baselineIds.fine)) fail("geometry/baseline-identity");
    if (response && (data.baselineIds!.coarse === c.coarse.id || data.baselineIds!.fine === c.fine.id)) {
      if (data.baselineIds!.coarse !== c.coarse.id || data.baselineIds!.fine !== c.fine.id) fail("geometry/baseline-role-mismatch");
      throw new Fault({ status: "N_A", reason: "BASELINE_SELF_RESPONSE", value: null });
    }
    commonTimes(c, data.samples.map(row => row.coarse.time));
    let maxPosition = 0, maxVertical = 0, positionIndex = 0, verticalIndex = 0;
    const residuals = data.samples.map((row, i) => {
      if (row.coarse.time !== row.fine.time) fail("geometry/unmatched-time");
      let pc = row.coarse.position, pf = row.fine.position;
      if (response) {
        if (!row.coarseBaseline || !row.fineBaseline || row.coarseBaseline.time !== row.coarse.time || row.fineBaseline.time !== row.fine.time)
          fail("geometry/baseline-time");
        pc = subtract(pc, row.coarseBaseline.position); pf = subtract(pf, row.fineBaseline.position);
      }
      const delta = subtract(pc, pf), position = finite(Math.hypot(delta.x, delta.y, delta.z), "geometry/norm"), vertical = Math.abs(delta.y);
      if (position > maxPosition) { maxPosition = position; positionIndex = i; }
      if (vertical > maxVertical) { maxVertical = vertical; verticalIndex = i; }
      return { time: row.coarse.time, delta, position, vertical };
    });
    return bundle(c, [check(response ? "RESPONSE" : "POSITION", maxPosition, 10, "m", { index: positionIndex }),
      check(response ? "VERTICAL_RESPONSE" : "VERTICAL", maxVertical, 3, "m", { index: verticalIndex })], { input: data, residuals });
  });
}
function support(c: ComparisonContext, role: string, state: string) {
  if (!["PRIMARY", "SECONDARY_DESCRIPTIVE"].includes(role) || !["FULL_SUPPORT", "BOUNDARY_CONDITIONED"].includes(state)) fail("comparison/support-contract");
  if (c.role === "PRIMARY" && (role !== "PRIMARY" || state !== "FULL_SUPPORT"))
    throw new Fault({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null });
}
export function compareHistory(suppliedContext: ComparisonContext, supplied: HistoryResult): ComparisonResult {
  const c = freeze(structuredClone(suppliedContext)), input = freeze(structuredClone(supplied));
  return guarded(c, input, () => {
    const e = unwrap(input);
    if (e.schema !== "p2-history/v1" || e.units !== "s^-2" || !sameInterval(c.interval, e.interval) ||
      e.coarsePathFingerprint !== c.coarse.pathFingerprint || e.finePathFingerprint !== c.fine.pathFingerprint) fail("history/comparison-identity");
    support(c, e.role, e.support);
    nonnegative(e.R1, "history/R1"); nonnegative(e.Aref, "history/Aref");
    const absoluteTerm = 1e-6, relativeTerm = finite(0.01 * e.Aref, "history/relative-term");
    const tolerance = finite(absoluteTerm + relativeTerm, "history/threshold");
    return bundle(c, [check("HISTORY", e.R1, tolerance, "s^-2", { R1: e.R1, Aref: e.Aref,
      coarseProviderFingerprint: e.coarseProviderFingerprint, fineProviderFingerprint: e.fineProviderFingerprint },
    { scale: e.Aref, absoluteTerm, relativeTerm, arithmetic: [e.arithmetic.R1, e.arithmetic.Aref] })], { input: e });
  });
}
export function compareExposures(suppliedContext: ComparisonContext, suppliedCoarse: ExposureResult, suppliedFine: ExposureResult): ComparisonResult {
  const c = freeze(structuredClone(suppliedContext)), input = freeze(structuredClone([suppliedCoarse, suppliedFine]));
  return guarded(c, input, () => {
    const coarse = unwrap(input[0]), fine = unwrap(input[1]);
    for (const [e, run] of [[coarse, c.coarse], [fine, c.fine]] as const) {
      if (e.schema !== "p2-exposure/v1" || e.units !== "s^-1" || !sameInterval(c.interval, e.interval) || e.pathFingerprint !== run.pathFingerprint)
        fail("exposure/comparison-identity");
      support(c, e.role, e.support);
    }
    const checks = (["Eabs", "Esigned"] as const).map(quantity => {
      const residual = Math.abs(difference(coarse[quantity], fine[quantity]));
      const scale = Math.max(Math.abs(fine[quantity]), 1e-3), relativeTerm = finite(0.01 * scale, "exposure/relative-term");
      return check(quantity === "Eabs" ? "EXPOSURE_ABS" : "EXPOSURE_SIGNED", residual, Math.max(1e-5, relativeTerm), "s^-1",
        { coarse: coarse[quantity], fine: fine[quantity], scaleFloor: 1e-3, toleranceFloor: 1e-5 },
        { scale, absoluteTerm: 1e-5, relativeTerm, arithmetic: [coarse.allowance, fine.allowance] });
    });
    return bundle(c, checks, { coarse, fine });
  });
}
export function comparePointwise(suppliedContext: ComparisonContext, supplied: PreparedComparison<PreparedPointwise>): ComparisonResult {
  const c = freeze(structuredClone(suppliedContext)), input = freeze(structuredClone(supplied));
  const audit = { input, excluded: [] as { index: number; reason: string }[], excludedCount: 0, excludedFraction: 0 };
  return guarded(c, audit, () => {
    const data = unwrap(input);
    if (data.basis !== "STORED_COMMON_COARSE_TIMES") fail("pointwise/basis");
    commonTimes(c, data.samples.map(s => s.coarse.time));
    const expansion = finite(2 * c.coarse.h, "pointwise/expansion");
    const brackets = [...data.coarseCrossings, ...data.fineCrossings].filter(b => {
      finite(b.a, "pointwise/bracket"); finite(b.b, "pointwise/bracket"); if (b.b < b.a) fail("pointwise/bracket-order");
      return b.representation === c.channel && b.b <= c.interval.b;
    }).map(b => ({ a: finite(b.a - expansion, "pointwise/exclusion-start"), b: finite(b.b + expansion, "pointwise/exclusion-end") }));
    const checks: ComparisonCheck[] = [], excluded = audit.excluded;
    data.samples.forEach(({ coarse, fine }, index) => {
      if (coarse.time !== fine.time) fail("pointwise/unmatched-time");
      for (const operand of [coarse, fine]) { support(c, c.role, operand.support); finite(operand.T1, "pointwise/T1"); }
      const sameSegment = coarse.context.segment.providerFingerprint === fine.context.segment.providerFingerprint && coarse.context.segment.index === fine.context.segment.index;
      if (!sameSegment || brackets.some(b => coarse.time >= b.a && coarse.time <= b.b)) {
        excluded.push({ index, reason: !sameSegment ? "SEGMENT_MISMATCH" : "CROSSING_NEIGHBORHOOD" }); return;
      }
      const scale = Math.abs(fine.T1), relativeTerm = finite(0.02 * scale, "pointwise/relative-term");
      checks.push(check("POINTWISE", Math.abs(difference(coarse.T1, fine.T1)), finite(5e-6 + relativeTerm, "pointwise/threshold"), "s^-2",
        { index, time: coarse.time, coarse, fine }, { key: `POINTWISE/${index}`, scale, absoluteTerm: 5e-6, relativeTerm }));
    });
    audit.excludedCount = excluded.length; audit.excludedFraction = excluded.length / data.samples.length;
    if (!checks.length) throw new Fault({ status: "N_A", reason: "NO_SEGMENT_MATCHED_SAMPLES", value: null });
    return bundle(c, checks, { input: data, excluded, excludedCount: excluded.length, excludedFraction: excluded.length / data.samples.length });
  });
}
function textOrder(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function numberOrder(a: number, b: number): number { return a < b ? -1 : a > b ? 1 : 0; }
export function compareEvents(suppliedContext: ComparisonContext, supplied: PreparedComparison<PreparedEvents>): ComparisonResult {
  const c = freeze(structuredClone(suppliedContext)), input = freeze(structuredClone(supplied));
  return guarded(c, input, () => {
    const data = unwrap(input), tolerance = Math.max(1, finite(2 * c.coarse.h, "events/tolerance"));
    const selected = [data.coarseEvents, data.fineEvents].map(events => events.filter(e => {
      finite(e.a, "events/a"); finite(e.b, "events/b"); if (e.b < e.a || !e.kind) fail("events/bracket");
      if (e.category !== "LIFECYCLE" && e.category !== "DIAGNOSTIC_CROSSING") fail("events/category");
      return e.category === "LIFECYCLE" && e.b <= c.interval.b;
    }).slice().sort((a, b) => numberOrder(a.a, b.a) || numberOrder(a.b, b.b) || textOrder(a.kind, b.kind) || textOrder(a.representation ?? "", b.representation ?? "")));
    const checks = [check("PREFIX_TIME", Math.abs(difference(data.coarsePrefixTime, data.finePrefixTime)), tolerance, "s")];
    selected.forEach((events, r) => events.forEach((e, i) => checks.push(check("EVENT_WIDTH", difference(e.b, e.a), r === 0 ? c.coarse.h : c.fine.h,
      "s", { event: e, role: r === 0 ? "COARSE" : "FINE" }, { key: `EVENT_WIDTH/${r}/${i}` }))));
    function groups(events: readonly PreparedLifecycleEvent[]) {
      const out: PreparedLifecycleEvent[][] = [];
      for (const event of events) {
        const group = out[out.length - 1];
        if (group && event.a <= finite(group[0].b + tolerance, "events/group-window")) group.push(event);
        else out.push([event]);
      }
      return out;
    }
    const coarseGroups = groups(selected[0]), fineGroups = groups(selected[1]);
    checks.push(check("EVENT_COUNT", Math.abs(coarseGroups.length - fineGroups.length), 0, "1"));
    const kindKey = (e: PreparedLifecycleEvent) => JSON.stringify([e.kind, e.representation]);
    coarseGroups.forEach((group, i) => {
      const other = fineGroups[i]; if (!other) return;
      const kinds = (g: readonly PreparedLifecycleEvent[]) => [...new Set(g.map(kindKey))].sort(textOrder);
      const coarseKinds = kinds(group), fineKinds = kinds(other);
      checks.push(check("EVENT_TYPES", JSON.stringify(coarseKinds) === JSON.stringify(fineKinds) ? 0 : 1, 0, "1",
        { coarseKinds, fineKinds }, { key: `EVENT_TYPES/${i}` }));
      group.forEach((event, j) => {
        const matches = other.filter(e => kindKey(e) === kindKey(event));
        if (!matches.length) return;
        let residual: number | null = null;
        for (const e of matches) {
          const d = Math.max(Math.abs(difference(event.a, e.a)), Math.abs(difference(event.b, e.b)));
          if (residual === null || d < residual) residual = d;
        }
        checks.push(check("EVENT_TIME", residual!, tolerance, "s", { event, matches }, { key: `EVENT_TIME/${i}/${j}` }));
      });
    });
    return bundle(c, checks, { input: data, coarseGroups, fineGroups });
  });
}
const refinementMetrics: readonly ComparisonMetric[] = ["POSITION", "VERTICAL", "RESPONSE", "VERTICAL_RESPONSE", "HISTORY", "EXPOSURE_ABS", "EXPOSURE_SIGNED"];
/** P2 §16: compare only whitelisted aggregates, using the finer pair's own budget. */
export function compareSuccessiveRefinement(suppliedCoarser: ComparisonResult, suppliedFiner: ComparisonResult): ComparisonResult<RefinementEvidence> {
  const coarserInput = freeze(structuredClone(suppliedCoarser)), finerInput = freeze(structuredClone(suppliedFiner));
  // Retain an upstream nonnumeric state before trying to access numeric contexts.
  if (coarserInput.status !== "COMPLETE") return coarserInput;
  if (finerInput.status !== "COMPLETE") return finerInput;
  const coarser = coarserInput.value, finer = finerInput.value, c = coarser.context, f = finer.context;
  return guarded(c, [coarser, finer], () => {
    validateContext(f);
    if (!sameInterval(c.interval, f.interval) || c.channel !== f.channel || c.role !== f.role ||
      c.fine.id !== f.coarse.id || c.fine.pathFingerprint !== f.coarse.pathFingerprint || c.fine.h !== f.coarse.h || c.coarse.id === f.fine.id)
      fail("refinement/triple-identity-interval");
    for (const b of [coarser, finer]) {
      if (b.schema !== "p2-comparison/v1" || !b.checks.length || new Set(b.checks.map(x => x.key)).size !== b.checks.length) fail("refinement/checks");
      for (const x of b.checks) {
        nonnegative(x.residual, "refinement/residual"); nonnegative(x.tolerance, "refinement/tolerance");
        if (x.outcome !== (x.residual <= x.tolerance ? "PASS" : "INVALID CONTROL")) fail("refinement/ordinary-outcome");
      }
      if (b.outcome !== outcome(b.checks)) fail("refinement/bundle-outcome");
    }
    const coarseAggregate = coarser.checks.filter(x => refinementMetrics.includes(x.metric));
    const fineAggregate = finer.checks.filter(x => refinementMetrics.includes(x.metric));
    if (coarseAggregate.length !== fineAggregate.length) fail("refinement/metric-set");
    const nonWorsening = fineAggregate.map(x => {
      const previous = coarseAggregate.find(p => p.key === x.key);
      if (!previous || previous.metric !== x.metric || previous.units !== x.units) fail("refinement/metric-identity");
      const increase = Math.max(0, difference(x.residual, previous.residual));
      const allowance = finite(0.1 * x.tolerance, "refinement/non-worsening-bound");
      return { key: x.key, metric: x.metric, units: x.units, coarserResidual: previous.residual, finerResidual: x.residual,
        finerTolerance: x.tolerance, increase, allowance, outcome: increase <= allowance ? "PASS" as const : "INVALID CONTROL" as const };
    });
    const ordinaryOutcome = outcome([coarser, finer]);
    return { schema: "p2-refinement/v1", coarser, finer, nonWorsening,
      excluded: finer.checks.filter(x => !refinementMetrics.includes(x.metric)).map(x => ({ key: x.key, reason: "NOT_AN_AGGREGATE_REFINEMENT_METRIC" as const })),
      ordinaryOutcome, outcome: ordinaryOutcome === "PASS" ? outcome(nonWorsening) : "INVALID CONTROL" };
  });
}
