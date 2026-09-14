import { captureValue, enterCapture, type CaptureContext } from "./capture.js";
/** Validation-local common-partition history. No trajectory integration or admission. */
import { partitionAcceptedStep } from "./partition.js";
import { positionOnStep } from "./path.js";
import { durationAllowance, localLinearIntegrals, NeumaierAccumulator,
  normalizeExactZero, syntheticReferenceAllowance } from "./arithmetic.js";
import type { ArithmeticFailure, ArithmeticResult, EstimatorResult, HistoryPath,
  HistoryPathEvidence, HistoryRequest, HistoryResult, HistoryRole, HistoryNode,
  HistoryNodeEvent, HistoryOperands, HistoryContribution, HistoryTrace, LinearInterval,
  SegmentSubinterval, StepPartition } from "./types.js";

type Rejection = Exclude<EstimatorResult<never>, { status: "COMPLETE" }> | ArithmeticFailure;
class HistoryFault extends Error {
  constructor(readonly result: Rejection) { super("History incomplete"); }
}
function unwrap<T>(result: EstimatorResult<T> | ArithmeticResult<T>, capture?: CaptureContext): T {
  capture = enterCapture(capture, "history/unwrap");
  captureValue(capture, "input/result", result);

  if (result.status !== "COMPLETE") throw captureValue(capture, "history/site-BF/throw", new HistoryFault(result));
  return captureValue(capture, "history/site-BG/return", result.value);
}
function fail(operation: string, code: "INVALID_CONTEXT" | "NUMERICAL_AMBIGUITY" | "NONFINITE_ARITHMETIC" = "INVALID_CONTEXT", capture?: CaptureContext): never {
  capture = enterCapture(capture, "history/fail");
  captureValue(capture, "input/operation", operation);
  captureValue(capture, "input/code", code);

  throw captureValue(capture, "history/site-BJ/throw", new HistoryFault({ status: "FAILED", code, operation }));
}
function finite(value: number, operation: string, capture?: CaptureContext): number {
  capture = enterCapture(capture, "history/finite");
  captureValue(capture, "input/value", value);
  captureValue(capture, "input/operation", operation);

  if (!Number.isFinite(value)) fail(operation, "NONFINITE_ARITHMETIC", capture);
  return captureValue(capture, "history/site-CD/return", value);
}
// Object traversal freezes evidence only; all numerical streams use ordered arrays.
function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function pathEvidence(input: EstimatorResult<HistoryPath>, capture?: CaptureContext): EstimatorResult<HistoryPathEvidence> {
  capture = enterCapture(capture, "history/pathEvidence");
  captureValue(capture, "input/input", input);

  if (input.status !== "COMPLETE") return captureValue(capture, "history/site-DE/return", structuredClone(input));
  const { path, provider, eligibility } = captureValue(capture, "history/site-DF/local/{ path, provider, eligibility }", input.value);
  return captureValue(capture, "history/site-DG/return", { status: "COMPLETE", value: structuredClone({ path, eligibility,
    providerFingerprint: provider.fingerprint, topology: provider.topology }) });
}
function compareText(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function eventOrder(a: HistoryNodeEvent, b: HistoryNodeEvent): number {
  const rank = (role: HistoryRole | null) => role === "COARSE" ? 0 : role === "FINE" ? 1 : 2;
  return rank(a.role) - rank(b.role) || compareText(a.providerFingerprint ?? "", b.providerFingerprint ?? "") ||
    (a.contact?.boundary.index ?? -1) - (b.contact?.boundary.index ?? -1) || compareText(a.kind, b.kind);
}
function eventKey(event: HistoryNodeEvent): string {
  return JSON.stringify([event.role, event.kind, event.pathFingerprint, event.providerFingerprint,
    event.vertexIndex, event.contact?.boundary.index ?? null,
    event.contact?.location.kind ?? null, event.contact?.location.index ?? null]);
}
type NativeInterval = Readonly<{ partition: StepPartition; interval: SegmentSubinterval }>;

/** Caller supplies the common eligible physical interval and each path's applicability.
 * Full accepted steps intersecting that interval are checked: clipping never recovers
 * a supported fraction of a rejected step. Provider evaluators must be immutable/pure
 * under their fingerprints, as required by the reviewed provider contract.
 */
export function comparePathHistory(coarse: EstimatorResult<HistoryPath>, fine: EstimatorResult<HistoryPath>,
  suppliedRequest: HistoryRequest, capture?: CaptureContext): HistoryResult {
  capture = enterCapture(capture, "history/comparePathHistory");
  captureValue(capture, "input/coarse", coarse);
  captureValue(capture, "input/fine", fine);
  captureValue(capture, "input/suppliedRequest", suppliedRequest);

  const request = captureValue(capture, "history/site-FJ/local/request", freeze(structuredClone(suppliedRequest)));
  const inputs = captureValue(capture, "history/site-GA/local/inputs", freeze([pathEvidence(coarse, capture), pathEvidence(fine, capture)]));
  const partitions: HistoryTrace["partitions"][number][] = captureValue(capture, "history/site-GB/local/partitions", []);
  const contributions: HistoryContribution[] = captureValue(capture, "history/site-GC/local/contributions", []);
  const evaluations: HistoryTrace["evaluations"][number][] = captureValue(capture, "history/site-GD/local/evaluations", []);
  let nodes: HistoryNode[] = captureValue(capture, "history/site-GE/local/nodes", []);
  const trace = captureValue(capture, "history/site-GF/local/trace", (): HistoryTrace => freeze({ request, inputs, partitions: [...partitions], nodes: [...nodes], evaluations: [...evaluations], contributions: [...contributions] }));
  try {
    const original = captureValue(capture, "history/site-GH/local/original", [unwrap(coarse, capture), unwrap(fine, capture)]);
    const snapshots = captureValue(capture, "history/site-GI/local/snapshots", inputs.map(input => (captureValue(capture, "callback/input", input), captureValue(capture, "map/inputs/result", unwrap(input, capture)))));
    if (request.role !== "PRIMARY" && request.role !== "SECONDARY_DESCRIPTIVE") fail("history/role", undefined, capture);
    const { a, b } = captureValue(capture, "history/site-HA/local/{ a, b }", request.interval);
    finite(a, "history/interval-a", capture); finite(b, "history/interval-b", capture);
    const T = captureValue(capture, "history/site-HC/local/T", finite(b - a, "history/duration", capture));
    if (!(T > 0)) throw captureValue(capture, "history/site-HD/throw", new HistoryFault({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null }));
    for (const input of snapshots) {
    captureValue(capture, "loop/input", input);
      if (input.eligibility === "INELIGIBLE") throw captureValue(capture, "history/site-HF/throw", new HistoryFault({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null }));
      if (input.eligibility !== "ELIGIBLE") fail("history/eligibility", undefined, capture);
      const vertices = captureValue(capture, "history/site-HH/local/vertices", input.path.vertices);
      if (!vertices.length || a < vertices[0].time || b > vertices[vertices.length - 1].time)
        throw captureValue(capture, "history/site-HJ/throw", new HistoryFault({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null }));
    }
    // Capture provider method references and clone topology without cloning functions.
    const providers = captureValue(capture, "history/site-IC/local/providers", original.map((input, i) => (captureValue(capture, "callback/input", input), captureValue(capture, "callback/i", i), captureValue(capture, "map/original/result", Object.freeze({
      fingerprint: snapshots[i].providerFingerprint, topology: snapshots[i].topology,
      explicit: input.provider.explicit, ordinary: input.provider.ordinary,
    })))));
    const common = captureValue(capture, "history/site-IG/local/common", new Map<number, HistoryNodeEvent[]>());
    const addNode = captureValue(capture, "history/site-IH/local/addNode", (time: number, event: HistoryNodeEvent) => {
    captureValue(capture, "history/site-IH/callback/time", time);
    captureValue(capture, "history/site-IH/callback/event", event);
      if (time < a || time > b) return;
      time = captureValue(capture, "history/site-IJ/assign/time", normalizeExactZero(finite(time, "history/node-time", capture)));
      const events = captureValue(capture, "history/site-JA/local/events", common.get(time) ?? []);
      const key = captureValue(capture, "history/site-JB/local/key", eventKey(event));
      if (!events.some(e => eventKey(e) === key)) events.push(captureValue(capture, "history/site-JC/push", event));
      common.set(time, captureValue(capture, "history/common-events", events));
      captureValue(capture, "history/common-time", time);
    });
    for (const [time, kind] of [[a, "INTERVAL_START"], [b, "INTERVAL_END"]] as const)
      addNode(time, { role: null, kind, pathFingerprint: null, providerFingerprint: null, vertexIndex: null, contact: null });
    const native: NativeInterval[][] = captureValue(capture, "history/site-JH/local/native", [[], []]);
    const roles = captureValue(capture, "history/site-JI/local/roles", ["COARSE", "FINE"] as const);
    for (let r = captureValue(capture, "history/site-JJ/local/r", 0); r < roles.length; r++) {
    captureValue(capture, "loop/r", r);
      const path = captureValue(capture, "history/site-BAA/local/path", snapshots[r].path), provider = captureValue(capture, "history/site-BAA/local/provider", providers[r]), role = captureValue(capture, "history/site-BAA/local/role", roles[r]);
      for (let s = captureValue(capture, "history/site-BAB/local/s", 0); s < path.steps.length; s++) {
    captureValue(capture, "loop/s", s);
        const step = captureValue(capture, "history/site-BAC/local/step", path.steps[s]);
        if (step.to.time <= a || step.from.time >= b) continue;
        const result = captureValue(capture, "history/site-BAE/local/result", partitionAcceptedStep(path, s, provider, { eligibility: "ELIGIBLE",
          support: request.role === "PRIMARY" ? "FULL_SUPPORT" : "ALLOW_BOUNDARY_CONDITIONED" }, capture));
        partitions.push(captureValue(capture, "history/site-BAG/push", freeze({ role, stepIndex: s, result: structuredClone(result) })));
        const partition = captureValue(capture, "history/site-BAH/local/partition", unwrap(result, capture));
        for (const node of partition.nodes) {
    captureValue(capture, "loop/node", node);
          const base = captureValue(capture, "history/site-BAJ/local/base", { role, pathFingerprint: path.fingerprint, providerFingerprint: provider.fingerprint });
          const vertexIndex = captureValue(capture, "history/site-BBA/local/vertexIndex", node.lambda === 0 ? step.index : node.lambda === 1 ? step.index + 1 : null);
          if (vertexIndex !== null) addNode(node.time, { ...base, kind: "STEP_VERTEX", vertexIndex, contact: null });
          if (node.contact) addNode(node.time, { ...base, kind: "DIAGNOSTIC_CONTACT", vertexIndex, contact: node.contact });
        }
        for (const interval of partition.intervals) if (interval.right.time > a && interval.left.time < b)
          native[r].push(captureValue(capture, "history/site-BBF/push", { partition, interval }));
      }
      if (!native[r].length) fail("history/empty-native-partition", undefined, capture);
    }
    nodes = captureValue(capture, "history/site-BBJ/assign/nodes", [...common.entries()].sort(([x], [y]) => x - y)
      .map(([time, events]) => (captureValue(capture, "map/[...common.entries()].sort(([x], [y]) => x - y)/result", freeze({ time, events: events.sort(eventOrder) })))));
    const cursors = captureValue(capture, "history/site-BCB/local/cursors", [0, 0]);
    let support: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED" = captureValue(capture, "history/site-BCC/local/support", "FULL_SUPPORT");
    function operands(r: number, left: number, right: number, capture?: CaptureContext): HistoryOperands {
  capture = enterCapture(capture, "history/operands");
  captureValue(capture, "input/r", r);
  captureValue(capture, "input/left", left);
  captureValue(capture, "input/right", right);

      while (cursors[r] < native[r].length && native[r][cursors[r]].interval.right.time <= left) cursors[r]++;
      const item = captureValue(capture, "history/site-BCF/local/item", native[r][cursors[r]]);
      if (!item || left < item.interval.left.time || right > item.interval.right.time) fail("history/native-coverage", "NUMERICAL_AMBIGUITY", capture);
      const { interval, partition } = captureValue(capture, "history/site-BCH/local/{ interval, partition }", item), path = captureValue(capture, "history/site-BCH/local/path", snapshots[r].path), provider = captureValue(capture, "history/site-BCH/local/provider", providers[r]);
      const at = captureValue(capture, "history/site-BCI/local/at", (time: number, start: boolean) => {
    captureValue(capture, "history/site-BCI/callback/time", time);
    captureValue(capture, "history/site-BCI/callback/start", start);
        // Exact native events retain Slice-2 pinned crossing coordinates. A node
        // originating only on the other path uses this path's accepted step.
        const p = captureValue(capture, "history/site-BDB/local/p", time === interval.left.time ? interval.left.position : time === interval.right.time ? interval.right.position
          : unwrap(positionOnStep(path, partition.step.index, time, capture), capture));
        const context = captureValue(capture, "history/site-BDD/local/context", { segment: interval.segment,
          side: interval.geometry === "VALID_DEGENERATE" ? "DWELL" as const : start ? "TEMPORAL_PLUS" as const : "TEMPORAL_MINUS" as const });
        const result = captureValue(capture, "history/site-BDF/local/result", structuredClone((captureValue(capture, "history/site-BDF/provider-explicit/begin", undefined), captureValue(capture, "history/site-BDF/provider-explicit/return", provider.explicit(p, time, context, capture)))));
        evaluations.push(captureValue(capture, "history/site-BDG/push", freeze({ role: roles[r], stepIndex: partition.step.index, time, context, result })));
        const value = captureValue(capture, "history/site-BDH/local/value", unwrap(result, capture));
        if (value.context.segment.providerFingerprint !== provider.fingerprint || value.context.segment.index !== interval.segment.index)
          fail("history/returned-segment", undefined, capture);
        if (value.support === "BOUNDARY_CONDITIONED") {
          if (request.role === "PRIMARY") throw captureValue(capture, "history/site-BEB/throw", new HistoryFault({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null }));
          support = captureValue(capture, "history/site-BEC/assign/support", "BOUNDARY_CONDITIONED");
        } else if (value.support !== "FULL_SUPPORT") fail("history/returned-support", undefined, capture);
        finite(value.T1, "history/T1", capture);
        return captureValue(capture, "history/site-BEF/return", value);
      });
      return captureValue(capture, "history/site-BEH/return", freeze({ pathFingerprint: path.fingerprint, providerFingerprint: provider.fingerprint,
        stepIndex: partition.step.index, segment: interval.segment, start: at(left, true), end: at(right, false) }));
    }
    const residual = captureValue(capture, "history/site-BFA/local/residual", new NeumaierAccumulator(enterCapture(capture, "history/accumulator/residual"))), reference = captureValue(capture, "history/site-BFA/local/reference", new NeumaierAccumulator(enterCapture(capture, "history/accumulator/reference"))), durations = captureValue(capture, "history/site-BFA/local/durations", new NeumaierAccumulator(enterCapture(capture, "history/accumulator/duration")));
    const coarseLinear: LinearInterval[] = captureValue(capture, "history/site-BFB/local/coarseLinear", []), fineLinear: LinearInterval[] = captureValue(capture, "history/site-BFB/local/fineLinear", []);
    for (let i = captureValue(capture, "history/site-BFC/local/i", 0); i + 1 < nodes.length; i++) {
    captureValue(capture, "loop/i", i);
      const left = captureValue(capture, "history/site-BFD/local/left", nodes[i].time), right = captureValue(capture, "history/site-BFD/local/right", nodes[i + 1].time);
      const d = captureValue(capture, "history/site-BFE/local/d", finite(right - left, "history/local-duration", capture));
      if (!(d > 0)) fail("history/common-order", "NUMERICAL_AMBIGUITY", capture);
      const c = captureValue(capture, "history/site-BFG/local/c", operands(0, left, right, capture)), f = captureValue(capture, "history/site-BFG/local/f", operands(1, left, right, capture));
      const d0 = captureValue(capture, "history/site-BFH/local/d0", finite(c.start.T1 - f.start.T1, "history/d0", capture)), d1 = captureValue(capture, "history/site-BFH/local/d1", finite(c.end.T1 - f.end.T1, "history/d1", capture));
      const delta = captureValue(capture, "history/site-BFI/local/delta", unwrap(localLinearIntegrals(left, right, d0, d1, capture), capture));
      const fineArea = captureValue(capture, "history/site-BFJ/local/fineArea", unwrap(localLinearIntegrals(left, right, f.start.T1, f.end.T1, capture), capture));
      contributions.push(captureValue(capture, "history/site-BGA/push", freeze({ order: i, a: left, b: right, coarse: c, fine: f, d0: normalizeExactZero(d0), d1: normalizeExactZero(d1),
        residualArea: delta.abs, referenceArea: fineArea.abs, residualZeroFraction: delta.zeroFraction, referenceZeroFraction: fineArea.zeroFraction })));
      unwrap(residual.add(delta.abs), capture); unwrap(reference.add(fineArea.abs), capture); unwrap(durations.add(d), capture);
      coarseLinear.push(captureValue(capture, "history/site-BGD/push", { a: left, b: right, u: c.start.T1, v: c.end.T1 }));
      fineLinear.push(captureValue(capture, "history/site-BGE/push", { a: left, b: right, u: f.start.T1, v: f.end.T1 }));
    }
    const durationSum = captureValue(capture, "history/site-BGG/local/durationSum", unwrap(durations.total(), capture)), durationBound = captureValue(capture, "history/site-BGG/local/durationBound", unwrap(durationAllowance(coarseLinear, T, capture), capture));
    if (Math.abs(finite(durationSum - T, "history/duration-residual", capture)) > durationBound.bound)
      fail("history/duration-coverage", "NUMERICAL_AMBIGUITY", capture);
    const residualArea = captureValue(capture, "history/site-BGJ/local/residualArea", unwrap(residual.total(), capture)), referenceArea = captureValue(capture, "history/site-BGJ/local/referenceArea", unwrap(reference.total(), capture));
    const R1 = captureValue(capture, "history/site-BHA/local/R1", normalizeExactZero(finite(residualArea / T, "history/R1", capture)));
    const Aref = captureValue(capture, "history/site-BHB/local/Aref", normalizeExactZero(finite(referenceArea / T, "history/Aref", capture)));
    // Engineering bounds for the represented local interpolants only. The final
    // division term uses the computed magnitude; independent synthetic checks use
    // their independently declared analytic reference instead. No physical error
    // estimate or scientific acceptance budget is inferred from these bounds.
    const arithmetic = captureValue(capture, "history/site-BHG/local/arithmetic", {
      scope: "LOCAL_INTERPOLANT_ARITHMETIC_ONLY" as const,
      residualArea: unwrap(syntheticReferenceAllowance(coarseLinear, undefined, fineLinear, capture), capture),
      referenceArea: unwrap(syntheticReferenceAllowance(fineLinear, undefined, undefined, capture), capture),
      R1: unwrap(syntheticReferenceAllowance(coarseLinear, { T, reference: R1 }, fineLinear, capture), capture),
      Aref: unwrap(syntheticReferenceAllowance(fineLinear, { T, reference: Aref }, undefined, capture), capture),
    });
    return captureValue(capture, "history/site-BID/return", { status: "COMPLETE", value: freeze({ schema: "p2-history/v1", units: "s^-2", areaUnits: "s^-1",
      runtime: { node: process.version, v8: process.versions.v8 }, interval: { a: normalizeExactZero(a), b: normalizeExactZero(b) }, duration: T,
      role: request.role, support, coarsePathFingerprint: snapshots[0].path.fingerprint, finePathFingerprint: snapshots[1].path.fingerprint,
      coarseProviderFingerprint: providers[0].fingerprint, fineProviderFingerprint: providers[1].fingerprint,
      residualArea, referenceArea, R1, Aref, durationSum, durationAllowance: durationBound, arithmetic, trace: trace() }) });
  } catch (error) { captureValue(capture, "history/site-BII/caught", undefined);
    if (error instanceof HistoryFault) return captureValue(capture, "history/site-BIJ/return", { ...error.result, trace: trace() });
    throw captureValue(capture, "history/site-BJA/throw", error);
  }
}
