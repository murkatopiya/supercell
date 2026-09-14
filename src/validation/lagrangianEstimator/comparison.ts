import { captureValue, enterCapture, type CaptureContext } from "./capture.js";
/** Frozen P2 §16 criteria over prepared evidence only; inherited P §9/§19 details. */
import { normalizeExactZero } from "./arithmetic.js";
import type { ComparisonBundle, ComparisonCheck, ComparisonContext, ComparisonMetric, ComparisonOutcome,
  ComparisonRejection, ComparisonResult, PreparedComparison, PreparedGeometry, PreparedPointwise,
  PreparedEvents, PreparedLifecycleEvent, ExposureResult, HistoryResult, Interval, Position,
  RefinementEvidence } from "./types.js";

class Fault extends Error {
  constructor(readonly result: ComparisonRejection) { super("Comparison incomplete"); }
}
function fail(operation: string, code: "INVALID_CONTEXT" | "NONFINITE_ARITHMETIC" = "INVALID_CONTEXT", capture?: CaptureContext): never {
  capture = enterCapture(capture, "comparison/fail");
  captureValue(capture, "input/operation", operation);
  captureValue(capture, "input/code", code);

  throw captureValue(capture, "comparison/site-BB/throw", new Fault({ status: "FAILED", code, operation }));
}
function finite(x: number, operation: string, capture?: CaptureContext): number {
  capture = enterCapture(capture, "comparison/finite");
  captureValue(capture, "input/x", x);
  captureValue(capture, "input/operation", operation);

  if (!Number.isFinite(x)) fail(operation, "NONFINITE_ARITHMETIC", capture);
  return captureValue(capture, "comparison/site-BF/return", normalizeExactZero(x));
}
function nonnegative(x: number, operation: string, capture?: CaptureContext): number {
  capture = enterCapture(capture, "comparison/nonnegative");
  captureValue(capture, "input/x", x);
  captureValue(capture, "input/operation", operation);

  finite(x, operation, capture); if (x < 0) fail(operation, undefined, capture); return captureValue(capture, "comparison/site-BI/return", x);
}
function unwrap<T>(r: PreparedComparison<T>, capture?: CaptureContext): T {
  capture = enterCapture(capture, "comparison/unwrap");
  captureValue(capture, "input/r", r);

  if (r.status !== "COMPLETE") throw captureValue(capture, "comparison/site-CB/throw", new Fault(r));
  return captureValue(capture, "comparison/site-CC/return", r.value);
}
function freeze<T>(x: T): T {
  if (x !== null && typeof x === "object" && !Object.isFrozen(x)) {
    for (const v of Object.values(x)) freeze(v);
    Object.freeze(x);
  }
  return x;
}
function sameInterval(a: Interval, b: Interval): boolean { return a.a === b.a && a.b === b.b; }
function validateContext(c: ComparisonContext, capture?: CaptureContext) {
  capture = enterCapture(capture, "comparison/validateContext");
  captureValue(capture, "input/c", c);

  finite(c.interval.a, "comparison/interval", capture); finite(c.interval.b, "comparison/interval", capture);
  if (!(finite(c.interval.b - c.interval.a, "comparison/duration", capture) > 0))
    throw captureValue(capture, "comparison/site-DF/throw", new Fault({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null }));
  for (const run of [c.coarse, c.fine]) {
    captureValue(capture, "loop/run", run);
    if (!run.id || !run.pathFingerprint || !(finite(run.h, "comparison/h", capture) > 0)) fail("comparison/run", undefined, capture);
  }
  if (c.coarse.id === c.fine.id || c.coarse.h !== finite(2 * c.fine.h, "comparison/nested-h", capture)) fail("comparison/nested-pair", undefined, capture);
  if (!c.channel || (c.role !== "PRIMARY" && c.role !== "SECONDARY_DESCRIPTIVE")) fail("comparison/context", undefined, capture);
}
function guarded<T>(context: ComparisonContext, input: unknown, work: () => T, capture?: CaptureContext): ComparisonResult<T> {
  capture = enterCapture(capture, "comparison/guarded");
  captureValue(capture, "input/context", context);
  captureValue(capture, "input/input", input);
  captureValue(capture, "input/work", work);

  try { validateContext(context, capture); return captureValue(capture, "comparison/site-ED/return", { status: "COMPLETE", value: freeze(work()) }); }
  catch (error) { captureValue(capture, "comparison/site-EE/caught", undefined);
    if (error instanceof Fault) return captureValue(capture, "comparison/site-EF/return", { ...error.result, evidence: freeze({ context, input }) });
    throw captureValue(capture, "comparison/site-EG/throw", error);
  }
}
function outcome(checks: readonly { outcome: ComparisonOutcome }[]): ComparisonOutcome {
  return checks.some(c => c.outcome === "INVALID CONTROL") ? "INVALID CONTROL" : "PASS";
}
function check(metric: ComparisonMetric, residual: number, tolerance: number, units: ComparisonCheck["units"],
  details: ComparisonCheck["details"] = {}, options: Partial<Pick<ComparisonCheck, "key" | "scale" | "absoluteTerm" | "relativeTerm" | "arithmetic">> = {}, capture?: CaptureContext): ComparisonCheck {
  capture = enterCapture(capture, "comparison/check");
  captureValue(capture, "input/metric", metric);
  captureValue(capture, "input/residual", residual);
  captureValue(capture, "input/tolerance", tolerance);
  captureValue(capture, "input/units", units);
  captureValue(capture, "input/details", details);
  captureValue(capture, "input/options", options);

  nonnegative(residual, "comparison/residual", capture); nonnegative(tolerance, "comparison/tolerance", capture);
  if (options.scale !== undefined && options.scale !== null) nonnegative(options.scale, "comparison/scale", capture);
  for (const a of options.arithmetic ?? []) {
    captureValue(capture, "loop/a", a);
    if (!Number.isSafeInteger(a.k) || a.k <= 0) fail("comparison/arithmetic-k", undefined, capture);
    nonnegative(a.scale, "comparison/arithmetic-scale", capture); nonnegative(a.bound, "comparison/arithmetic-bound", capture);
  }
  const passed = captureValue(capture, "comparison/site-GA/local/passed", residual <= tolerance);
  return captureValue(capture, "comparison/site-GB/return", freeze({ metric, key: options.key ?? metric, units, residual: normalizeExactZero(residual), tolerance,
    scale: options.scale ?? null, absoluteTerm: options.absoluteTerm ?? null, relativeTerm: options.relativeTerm ?? null,
    arithmetic: options.arithmetic ?? [], details, outcome: passed ? "PASS" : "INVALID CONTROL",
    reason: passed ? "WITHIN_TOLERANCE" : "TOLERANCE_EXCEEDED" }));
}
function bundle(context: ComparisonContext, checks: readonly ComparisonCheck[], details: ComparisonBundle["details"] = {}, capture?: CaptureContext): ComparisonBundle {
  capture = enterCapture(capture, "comparison/bundle");
  captureValue(capture, "input/context", context);
  captureValue(capture, "input/checks", checks);
  captureValue(capture, "input/details", details);

  return captureValue(capture, "comparison/site-GH/return", { schema: "p2-comparison/v1", context, checks, outcome: outcome(checks), details });
}
function difference(a: number, b: number, capture?: CaptureContext): number {
  capture = enterCapture(capture, "comparison/difference");
  captureValue(capture, "input/a", a);
  captureValue(capture, "input/b", b);

  finite(a, "comparison/operand", capture); finite(b, "comparison/operand", capture);
  return captureValue(capture, "comparison/site-HB/return", finite(a - b, "comparison/subtract", capture));
}
function subtract(a: Position, b: Position, capture?: CaptureContext): Position {
  capture = enterCapture(capture, "comparison/subtract");
  captureValue(capture, "input/a", a);
  captureValue(capture, "input/b", b);

  return captureValue(capture, "comparison/site-HE/return", { x: difference(a.x, b.x, capture), y: difference(a.y, b.y, capture), z: difference(a.z, b.z, capture) });
}
// Validate the supplied complete common-grid rows, without generating any samples.
function commonTimes(c: ComparisonContext, times: readonly number[], capture?: CaptureContext) {
  capture = enterCapture(capture, "comparison/commonTimes");
  captureValue(capture, "input/c", c);
  captureValue(capture, "input/times", times);

  if (!times.length) fail("comparison/missing-common-samples", undefined, capture);
  for (let i = captureValue(capture, "comparison/site-HJ/local/i", 0); i < times.length; i++) {
    captureValue(capture, "loop/i", i);
    finite(times[i], "comparison/sample-time", capture);
    const expected = captureValue(capture, "comparison/site-IB/local/expected", finite(c.interval.a + finite(i * c.coarse.h, "comparison/grid-offset", capture), "comparison/grid-time", capture));
    if (times[i] !== expected || (i > 0 && !(times[i] > times[i - 1]))) fail("comparison/common-grid", undefined, capture);
  }
  if (times[times.length - 1] !== c.interval.b) fail("comparison/incomplete-common-grid", undefined, capture);
}
export function compareGeometry(suppliedContext: ComparisonContext, supplied: PreparedComparison<PreparedGeometry>, capture?: CaptureContext): ComparisonResult {
  capture = enterCapture(capture, "comparison/compareGeometry");
  captureValue(capture, "input/suppliedContext", suppliedContext);
  captureValue(capture, "input/supplied", supplied);

  const c = captureValue(capture, "comparison/site-IH/local/c", freeze(structuredClone(suppliedContext))), input = captureValue(capture, "comparison/site-IH/local/input", freeze(structuredClone(supplied)));
  return captureValue(capture, "comparison/site-II/return", guarded(c, input, () => {
    const data = captureValue(capture, "comparison/site-IJ/local/data", unwrap(input, capture));
    if (data.kind === "BASELINE_SELF_RESPONSE") throw captureValue(capture, "comparison/site-JA/throw", new Fault({ status: "N_A", reason: "BASELINE_SELF_RESPONSE", value: null }));
    if (data.basis !== "STORED_COMMON_COARSE_TIMES" || !["POSITION", "MEMBER_RESPONSE"].includes(data.kind)) fail("geometry/basis", undefined, capture);
    const response = captureValue(capture, "comparison/site-JC/local/response", data.kind === "MEMBER_RESPONSE");
    if (response && (!data.baselineIds?.coarse || !data.baselineIds.fine)) fail("geometry/baseline-identity", undefined, capture);
    if (response && (data.baselineIds!.coarse === c.coarse.id || data.baselineIds!.fine === c.fine.id)) {
      if (data.baselineIds!.coarse !== c.coarse.id || data.baselineIds!.fine !== c.fine.id) fail("geometry/baseline-role-mismatch", undefined, capture);
      throw captureValue(capture, "comparison/site-JG/throw", new Fault({ status: "N_A", reason: "BASELINE_SELF_RESPONSE", value: null }));
    }
    commonTimes(c, data.samples.map(row => (captureValue(capture, "callback/row", row), captureValue(capture, "map/data.samples/result", row.coarse.time))), capture);
    let maxPosition = captureValue(capture, "comparison/site-JJ/local/maxPosition", 0), maxVertical = captureValue(capture, "comparison/site-JJ/local/maxVertical", 0), positionIndex = captureValue(capture, "comparison/site-JJ/local/positionIndex", 0), verticalIndex = captureValue(capture, "comparison/site-JJ/local/verticalIndex", 0);
    const residuals = captureValue(capture, "comparison/site-BAA/local/residuals", data.samples.map((row, i) => {
    captureValue(capture, "comparison/site-BAA/callback/row", row);
    captureValue(capture, "comparison/site-BAA/callback/i", i);
      if (row.coarse.time !== row.fine.time) fail("geometry/unmatched-time", undefined, capture);
      let pc = captureValue(capture, "comparison/site-BAC/local/pc", row.coarse.position), pf = captureValue(capture, "comparison/site-BAC/local/pf", row.fine.position);
      if (response) {
        if (!row.coarseBaseline || !row.fineBaseline || row.coarseBaseline.time !== row.coarse.time || row.fineBaseline.time !== row.fine.time)
          fail("geometry/baseline-time", undefined, capture);
        pc = captureValue(capture, "comparison/site-BAG/assign/pc", subtract(pc, row.coarseBaseline.position, capture)); pf = captureValue(capture, "comparison/site-BAG/assign/pf", subtract(pf, row.fineBaseline.position, capture));
      }
      const delta = captureValue(capture, "comparison/site-BAI/local/delta", subtract(pc, pf, capture)), position = captureValue(capture, "comparison/site-BAI/local/position", finite(Math.hypot(delta.x, delta.y, delta.z), "geometry/norm", capture)), vertical = captureValue(capture, "comparison/site-BAI/local/vertical", Math.abs(delta.y));
      if (position > maxPosition) { maxPosition = captureValue(capture, "comparison/site-BAJ/assign/maxPosition", position); positionIndex = captureValue(capture, "comparison/site-BAJ/assign/positionIndex", i); }
      if (vertical > maxVertical) { maxVertical = captureValue(capture, "comparison/site-BBA/assign/maxVertical", vertical); verticalIndex = captureValue(capture, "comparison/site-BBA/assign/verticalIndex", i); }
      return captureValue(capture, "comparison/site-BBB/return", { time: row.coarse.time, delta, position, vertical });
    }));
    return captureValue(capture, "comparison/site-BBD/return", bundle(c, [check(response ? "RESPONSE" : "POSITION", maxPosition, 10, "m", { index: positionIndex }, undefined, capture),
      check(response ? "VERTICAL_RESPONSE" : "VERTICAL", maxVertical, 3, "m", { index: verticalIndex }, undefined, capture)], { input: data, residuals }, capture));
  }, capture));
}
function support(c: ComparisonContext, role: string, state: string, capture?: CaptureContext) {
  capture = enterCapture(capture, "comparison/support");
  captureValue(capture, "input/c", c);
  captureValue(capture, "input/role", role);
  captureValue(capture, "input/state", state);

  if (!["PRIMARY", "SECONDARY_DESCRIPTIVE"].includes(role) || !["FULL_SUPPORT", "BOUNDARY_CONDITIONED"].includes(state)) fail("comparison/support-contract", undefined, capture);
  if (c.role === "PRIMARY" && (role !== "PRIMARY" || state !== "FULL_SUPPORT"))
    throw captureValue(capture, "comparison/site-BCA/throw", new Fault({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null }));
}
export function compareHistory(suppliedContext: ComparisonContext, supplied: HistoryResult, capture?: CaptureContext): ComparisonResult {
  capture = enterCapture(capture, "comparison/compareHistory");
  captureValue(capture, "input/suppliedContext", suppliedContext);
  captureValue(capture, "input/supplied", supplied);

  const c = captureValue(capture, "comparison/site-BCD/local/c", freeze(structuredClone(suppliedContext))), input = captureValue(capture, "comparison/site-BCD/local/input", freeze(structuredClone(supplied)));
  return captureValue(capture, "comparison/site-BCE/return", guarded(c, input, () => {
    const e = captureValue(capture, "comparison/site-BCF/local/e", unwrap(input, capture));
    if (e.schema !== "p2-history/v1" || e.units !== "s^-2" || !sameInterval(c.interval, e.interval) ||
      e.coarsePathFingerprint !== c.coarse.pathFingerprint || e.finePathFingerprint !== c.fine.pathFingerprint) fail("history/comparison-identity", undefined, capture);
    support(c, e.role, e.support, capture);
    nonnegative(e.R1, "history/R1", capture); nonnegative(e.Aref, "history/Aref", capture);
    const absoluteTerm = captureValue(capture, "comparison/site-BDA/local/absoluteTerm", 1e-6), relativeTerm = captureValue(capture, "comparison/site-BDA/local/relativeTerm", finite(0.01 * e.Aref, "history/relative-term", capture));
    const tolerance = captureValue(capture, "comparison/site-BDB/local/tolerance", finite(absoluteTerm + relativeTerm, "history/threshold", capture));
    return captureValue(capture, "comparison/site-BDC/return", bundle(c, [check("HISTORY", e.R1, tolerance, "s^-2", { R1: e.R1, Aref: e.Aref,
      coarseProviderFingerprint: e.coarseProviderFingerprint, fineProviderFingerprint: e.fineProviderFingerprint },
    { scale: e.Aref, absoluteTerm, relativeTerm, arithmetic: [e.arithmetic.R1, e.arithmetic.Aref] }, capture)], { input: e }, capture));
  }, capture));
}
export function compareExposures(suppliedContext: ComparisonContext, suppliedCoarse: ExposureResult, suppliedFine: ExposureResult, capture?: CaptureContext): ComparisonResult {
  capture = enterCapture(capture, "comparison/compareExposures");
  captureValue(capture, "input/suppliedContext", suppliedContext);
  captureValue(capture, "input/suppliedCoarse", suppliedCoarse);
  captureValue(capture, "input/suppliedFine", suppliedFine);

  const c = captureValue(capture, "comparison/site-BDI/local/c", freeze(structuredClone(suppliedContext))), input = captureValue(capture, "comparison/site-BDI/local/input", freeze(structuredClone([suppliedCoarse, suppliedFine])));
  return captureValue(capture, "comparison/site-BDJ/return", guarded(c, input, () => {
    const coarse = captureValue(capture, "comparison/site-BEA/local/coarse", unwrap(input[0], capture)), fine = captureValue(capture, "comparison/site-BEA/local/fine", unwrap(input[1], capture));
    for (const [e, run] of [[coarse, c.coarse], [fine, c.fine]] as const) {
      if (e.schema !== "p2-exposure/v1" || e.units !== "s^-1" || !sameInterval(c.interval, e.interval) || e.pathFingerprint !== run.pathFingerprint)
        fail("exposure/comparison-identity", undefined, capture);
      support(c, e.role, e.support, capture);
    }
    const checks = captureValue(capture, "comparison/site-BEG/local/checks", (["Eabs", "Esigned"] as const).map(quantity => {
    captureValue(capture, "comparison/site-BEG/callback/quantity", quantity);
      const residual = captureValue(capture, "comparison/site-BEH/local/residual", Math.abs(difference(coarse[quantity], fine[quantity], capture)));
      const scale = captureValue(capture, "comparison/site-BEI/local/scale", Math.max(Math.abs(fine[quantity]), 1e-3)), relativeTerm = captureValue(capture, "comparison/site-BEI/local/relativeTerm", finite(0.01 * scale, "exposure/relative-term", capture));
      return captureValue(capture, "comparison/site-BEJ/return", check(quantity === "Eabs" ? "EXPOSURE_ABS" : "EXPOSURE_SIGNED", residual, Math.max(1e-5, relativeTerm), "s^-1",
        { coarse: coarse[quantity], fine: fine[quantity], scaleFloor: 1e-3, toleranceFloor: 1e-5 },
        { scale, absoluteTerm: 1e-5, relativeTerm, arithmetic: [coarse.allowance, fine.allowance] }, capture));
    }));
    return captureValue(capture, "comparison/site-BFD/return", bundle(c, checks, { coarse, fine }, capture));
  }, capture));
}
export function comparePointwise(suppliedContext: ComparisonContext, supplied: PreparedComparison<PreparedPointwise>, capture?: CaptureContext): ComparisonResult {
  capture = enterCapture(capture, "comparison/comparePointwise");
  captureValue(capture, "input/suppliedContext", suppliedContext);
  captureValue(capture, "input/supplied", supplied);

  const c = captureValue(capture, "comparison/site-BFH/local/c", freeze(structuredClone(suppliedContext))), input = captureValue(capture, "comparison/site-BFH/local/input", freeze(structuredClone(supplied)));
  const audit = captureValue(capture, "comparison/site-BFI/local/audit", { input, excluded: [] as { index: number; reason: string }[], excludedCount: 0, excludedFraction: 0 });
  return captureValue(capture, "comparison/site-BFJ/return", guarded(c, audit, () => {
    const data = captureValue(capture, "comparison/site-BGA/local/data", unwrap(input, capture));
    if (data.basis !== "STORED_COMMON_COARSE_TIMES") fail("pointwise/basis", undefined, capture);
    commonTimes(c, data.samples.map(s => (captureValue(capture, "callback/s", s), captureValue(capture, "map/data.samples/result", s.coarse.time))), capture);
    const expansion = captureValue(capture, "comparison/site-BGD/local/expansion", finite(2 * c.coarse.h, "pointwise/expansion", capture));
    const brackets = captureValue(capture, "comparison/site-BGE/local/brackets", [...data.coarseCrossings, ...data.fineCrossings].filter(b => {
    captureValue(capture, "comparison/site-BGE/callback/b", b);
      finite(b.a, "pointwise/bracket", capture); finite(b.b, "pointwise/bracket", capture); if (b.b < b.a) fail("pointwise/bracket-order", undefined, capture);
      return captureValue(capture, "comparison/site-BGG/return", b.representation === c.channel && b.b <= c.interval.b);
    }).map(b => (captureValue(capture, "callback/b", b), captureValue(capture, "map/[...data.coarseCrossings, ...data.fineCrossings].filter(b => {\n    captureValue(capture, \"comparison/site-BGE/callback/b\", b);\n      finite(b.a, \"pointwise/bracket\", capture); finite(b.b, \"pointwise/bracket\", capture); if (b.b < b.a) fail(\"pointwise/bracket-order\", undefined, capture);\n      return captureValue(capture, \"comparison/site-BGG/return\", b.representation === c.channel && b.b <= c.interval.b);\n    })/result", ({ a: finite(b.a - expansion, "pointwise/exclusion-start", capture), b: finite(b.b + expansion, "pointwise/exclusion-end", capture) })))));
    const checks: ComparisonCheck[] = captureValue(capture, "comparison/site-BGI/local/checks", []), excluded = captureValue(capture, "comparison/site-BGI/local/excluded", audit.excluded);
    data.samples.forEach(({ coarse, fine }, index) => {
    captureValue(capture, "comparison/site-BGJ/callback/index", index);
      if (coarse.time !== fine.time) fail("pointwise/unmatched-time", undefined, capture);
      for (const operand of [coarse, fine]) {
    captureValue(capture, "loop/operand", operand); support(c, c.role, operand.support, capture); finite(operand.T1, "pointwise/T1", capture); }
      const sameSegment = captureValue(capture, "comparison/site-BHC/local/sameSegment", coarse.context.segment.providerFingerprint === fine.context.segment.providerFingerprint && coarse.context.segment.index === fine.context.segment.index);
      if (!sameSegment || brackets.some(b => coarse.time >= b.a && coarse.time <= b.b)) {
        excluded.push(captureValue(capture, "comparison/site-BHE/push", { index, reason: !sameSegment ? "SEGMENT_MISMATCH" : "CROSSING_NEIGHBORHOOD" })); return;
      }
      const scale = captureValue(capture, "comparison/site-BHG/local/scale", Math.abs(fine.T1)), relativeTerm = captureValue(capture, "comparison/site-BHG/local/relativeTerm", finite(0.02 * scale, "pointwise/relative-term", capture));
      checks.push(captureValue(capture, "comparison/site-BHH/push", check("POINTWISE", Math.abs(difference(coarse.T1, fine.T1, capture)), finite(5e-6 + relativeTerm, "pointwise/threshold", capture), "s^-2",
        { index, time: coarse.time, coarse, fine }, { key: `POINTWISE/${index}`, scale, absoluteTerm: 5e-6, relativeTerm }, capture)));
    });
    audit.excludedCount = captureValue(capture, "comparison/site-BIA/assign/audit.excludedCount", excluded.length); audit.excludedFraction = captureValue(capture, "comparison/site-BIA/assign/audit.excludedFraction", excluded.length / data.samples.length);
    if (!checks.length) throw captureValue(capture, "comparison/site-BIB/throw", new Fault({ status: "N_A", reason: "NO_SEGMENT_MATCHED_SAMPLES", value: null }));
    return captureValue(capture, "comparison/site-BIC/return", bundle(c, checks, { input: data, excluded, excludedCount: excluded.length, excludedFraction: excluded.length / data.samples.length }, capture));
  }, capture));
}
function textOrder(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function numberOrder(a: number, b: number): number { return a < b ? -1 : a > b ? 1 : 0; }
export function compareEvents(suppliedContext: ComparisonContext, supplied: PreparedComparison<PreparedEvents>, capture?: CaptureContext): ComparisonResult {
  capture = enterCapture(capture, "comparison/compareEvents");
  captureValue(capture, "input/suppliedContext", suppliedContext);
  captureValue(capture, "input/supplied", supplied);

  const c = captureValue(capture, "comparison/site-BII/local/c", freeze(structuredClone(suppliedContext))), input = captureValue(capture, "comparison/site-BII/local/input", freeze(structuredClone(supplied)));
  return captureValue(capture, "comparison/site-BIJ/return", guarded(c, input, () => {
    const data = captureValue(capture, "comparison/site-BJA/local/data", unwrap(input, capture)), tolerance = captureValue(capture, "comparison/site-BJA/local/tolerance", Math.max(1, finite(2 * c.coarse.h, "events/tolerance", capture)));
    const selected = captureValue(capture, "comparison/site-BJB/local/selected", [data.coarseEvents, data.fineEvents].map(events => (captureValue(capture, "callback/events", events), captureValue(capture, "map/[data.coarseEvents, data.fineEvents]/result", events.filter(e => {
    captureValue(capture, "comparison/site-BJB/callback/e", e);
      finite(e.a, "events/a", capture); finite(e.b, "events/b", capture); if (e.b < e.a || !e.kind) fail("events/bracket", undefined, capture);
      if (e.category !== "LIFECYCLE" && e.category !== "DIAGNOSTIC_CROSSING") fail("events/category", undefined, capture);
      return captureValue(capture, "comparison/site-BJE/return", e.category === "LIFECYCLE" && e.b <= c.interval.b);
    }).slice().sort((a, b) => numberOrder(a.a, b.a) || numberOrder(a.b, b.b) || textOrder(a.kind, b.kind) || textOrder(a.representation ?? "", b.representation ?? ""))))));
    const checks = captureValue(capture, "comparison/site-BJG/local/checks", [check("PREFIX_TIME", Math.abs(difference(data.coarsePrefixTime, data.finePrefixTime, capture)), tolerance, "s", undefined, undefined, capture)]);
    selected.forEach((events, r) => events.forEach((e, i) => checks.push(captureValue(capture, "comparison/site-BJH/push", check("EVENT_WIDTH", difference(e.b, e.a, capture), r === 0 ? c.coarse.h : c.fine.h,
      "s", { event: e, role: r === 0 ? "COARSE" : "FINE" }, { key: `EVENT_WIDTH/${r}/${i}` }, capture)))));
    function groups(events: readonly PreparedLifecycleEvent[], capture?: CaptureContext) {
  capture = enterCapture(capture, "comparison/groups");
  captureValue(capture, "input/events", events);

      const out: PreparedLifecycleEvent[][] = captureValue(capture, "comparison/site-CAA/local/out", []);
      for (const event of events) {
    captureValue(capture, "loop/event", event);
        const group = captureValue(capture, "comparison/site-CAC/local/group", out[out.length - 1]);
        if (group && event.a <= finite(group[0].b + tolerance, "events/group-window", capture)) group.push(captureValue(capture, "comparison/site-CAD/push", event));
        else out.push(captureValue(capture, "comparison/site-CAE/push", [event]));
      }
      return captureValue(capture, "comparison/site-CAG/return", out);
    }
    const coarseGroups = captureValue(capture, "comparison/site-CAI/local/coarseGroups", groups(selected[0], capture)), fineGroups = captureValue(capture, "comparison/site-CAI/local/fineGroups", groups(selected[1], capture));
    checks.push(captureValue(capture, "comparison/site-CAJ/push", check("EVENT_COUNT", Math.abs(coarseGroups.length - fineGroups.length), 0, "1", undefined, undefined, capture)));
    const kindKey = captureValue(capture, "comparison/site-CBA/local/kindKey", (e: PreparedLifecycleEvent) => JSON.stringify([e.kind, e.representation]));
    coarseGroups.forEach((group, i) => {
    captureValue(capture, "comparison/site-CBB/callback/group", group);
    captureValue(capture, "comparison/site-CBB/callback/i", i);
      const other = captureValue(capture, "comparison/site-CBC/local/other", fineGroups[i]); if (!other) return;
      const kinds = captureValue(capture, "comparison/site-CBD/local/kinds", (g: readonly PreparedLifecycleEvent[]) => [...new Set(g.map(kindKey))].sort(textOrder));
      const coarseKinds = captureValue(capture, "comparison/site-CBE/local/coarseKinds", kinds(group)), fineKinds = captureValue(capture, "comparison/site-CBE/local/fineKinds", kinds(other));
      checks.push(captureValue(capture, "comparison/site-CBF/push", check("EVENT_TYPES", JSON.stringify(coarseKinds) === JSON.stringify(fineKinds) ? 0 : 1, 0, "1",
        { coarseKinds, fineKinds }, { key: `EVENT_TYPES/${i}` }, capture)));
      group.forEach((event, j) => {
    captureValue(capture, "comparison/site-CBH/callback/event", event);
    captureValue(capture, "comparison/site-CBH/callback/j", j);
        const matches = captureValue(capture, "comparison/site-CBI/local/matches", other.filter(e => kindKey(e) === kindKey(event)));
        if (!matches.length) return;
        let residual: number | null = captureValue(capture, "comparison/site-CCA/local/residual", null);
        for (const e of matches) {
    captureValue(capture, "loop/e", e);
          const d = captureValue(capture, "comparison/site-CCC/local/d", Math.max(Math.abs(difference(event.a, e.a, capture)), Math.abs(difference(event.b, e.b, capture))));
          if (residual === null || d < residual) residual = captureValue(capture, "comparison/site-CCD/assign/residual", d);
        }
        checks.push(captureValue(capture, "comparison/site-CCF/push", check("EVENT_TIME", residual!, tolerance, "s", { event, matches }, { key: `EVENT_TIME/${i}/${j}` }, capture)));
      });
    });
    return captureValue(capture, "comparison/site-CCI/return", bundle(c, checks, { input: data, coarseGroups, fineGroups }, capture));
  }, capture));
}
const refinementMetrics: readonly ComparisonMetric[] = ["POSITION", "VERTICAL", "RESPONSE", "VERTICAL_RESPONSE", "HISTORY", "EXPOSURE_ABS", "EXPOSURE_SIGNED"];
/** P2 §16: compare only whitelisted aggregates, using the finer pair's own budget. */
export function compareSuccessiveRefinement(suppliedCoarser: ComparisonResult, suppliedFiner: ComparisonResult, capture?: CaptureContext): ComparisonResult<RefinementEvidence> {
  capture = enterCapture(capture, "comparison/compareSuccessiveRefinement");
  captureValue(capture, "input/suppliedCoarser", suppliedCoarser);
  captureValue(capture, "input/suppliedFiner", suppliedFiner);

  const coarserInput = captureValue(capture, "comparison/site-CDE/local/coarserInput", freeze(structuredClone(suppliedCoarser))), finerInput = captureValue(capture, "comparison/site-CDE/local/finerInput", freeze(structuredClone(suppliedFiner)));
  // Retain an upstream nonnumeric state before trying to access numeric contexts.
  if (coarserInput.status !== "COMPLETE") return captureValue(capture, "comparison/site-CDG/return", coarserInput);
  if (finerInput.status !== "COMPLETE") return captureValue(capture, "comparison/site-CDH/return", finerInput);
  const coarser = captureValue(capture, "comparison/site-CDI/local/coarser", coarserInput.value), finer = captureValue(capture, "comparison/site-CDI/local/finer", finerInput.value), c = captureValue(capture, "comparison/site-CDI/local/c", coarser.context), f = captureValue(capture, "comparison/site-CDI/local/f", finer.context);
  return captureValue(capture, "comparison/site-CDJ/return", guarded(c, [coarser, finer], () => {
    validateContext(f, capture);
    if (!sameInterval(c.interval, f.interval) || c.channel !== f.channel || c.role !== f.role ||
      c.fine.id !== f.coarse.id || c.fine.pathFingerprint !== f.coarse.pathFingerprint || c.fine.h !== f.coarse.h || c.coarse.id === f.fine.id)
      fail("refinement/triple-identity-interval", undefined, capture);
    for (const b of [coarser, finer]) {
    captureValue(capture, "loop/b", b);
      if (b.schema !== "p2-comparison/v1" || !b.checks.length || new Set(b.checks.map(x => (captureValue(capture, "callback/x", x), captureValue(capture, "map/b.checks/result", x.key)))).size !== b.checks.length) fail("refinement/checks", undefined, capture);
      for (const x of b.checks) {
    captureValue(capture, "loop/x", x);
        nonnegative(x.residual, "refinement/residual", capture); nonnegative(x.tolerance, "refinement/tolerance", capture);
        if (x.outcome !== (x.residual <= x.tolerance ? "PASS" : "INVALID CONTROL")) fail("refinement/ordinary-outcome", undefined, capture);
      }
      if (b.outcome !== outcome(b.checks)) fail("refinement/bundle-outcome", undefined, capture);
    }
    const coarseAggregate = captureValue(capture, "comparison/site-CFC/local/coarseAggregate", coarser.checks.filter(x => refinementMetrics.includes(x.metric)));
    const fineAggregate = captureValue(capture, "comparison/site-CFD/local/fineAggregate", finer.checks.filter(x => refinementMetrics.includes(x.metric)));
    if (coarseAggregate.length !== fineAggregate.length) fail("refinement/metric-set", undefined, capture);
    const nonWorsening = captureValue(capture, "comparison/site-CFF/local/nonWorsening", fineAggregate.map(x => {
    captureValue(capture, "comparison/site-CFF/callback/x", x);
      const previous = captureValue(capture, "comparison/site-CFG/local/previous", coarseAggregate.find(p => p.key === x.key));
      if (!previous || previous.metric !== x.metric || previous.units !== x.units) fail("refinement/metric-identity", undefined, capture);
      const increase = captureValue(capture, "comparison/site-CFI/local/increase", Math.max(0, difference(x.residual, previous.residual, capture)));
      const allowance = captureValue(capture, "comparison/site-CFJ/local/allowance", finite(0.1 * x.tolerance, "refinement/non-worsening-bound", capture));
      return captureValue(capture, "comparison/site-CGA/return", { key: x.key, metric: x.metric, units: x.units, coarserResidual: previous.residual, finerResidual: x.residual,
        finerTolerance: x.tolerance, increase, allowance, outcome: increase <= allowance ? "PASS" as const : "INVALID CONTROL" as const });
    }));
    const ordinaryOutcome = captureValue(capture, "comparison/site-CGD/local/ordinaryOutcome", outcome([coarser, finer]));
    return captureValue(capture, "comparison/site-CGE/return", { schema: "p2-refinement/v1", coarser, finer, nonWorsening,
      excluded: finer.checks.filter(x => !refinementMetrics.includes(x.metric)).map(x => (captureValue(capture, "callback/x", x), captureValue(capture, "map/finer.checks.filter(x => !refinementMetrics.includes(x.metric))/result", ({ key: x.key, reason: "NOT_AN_AGGREGATE_REFINEMENT_METRIC" as const })))),
      ordinaryOutcome, outcome: ordinaryOutcome === "PASS" ? outcome(nonWorsening) : "INVALID CONTROL" });
  }, capture));
}
