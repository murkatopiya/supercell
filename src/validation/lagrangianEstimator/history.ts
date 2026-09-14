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
function unwrap<T>(result: EstimatorResult<T> | ArithmeticResult<T>): T {
  if (result.status !== "COMPLETE") throw new HistoryFault(result);
  return result.value;
}
function fail(operation: string, code: "INVALID_CONTEXT" | "NUMERICAL_AMBIGUITY" | "NONFINITE_ARITHMETIC" = "INVALID_CONTEXT"): never {
  throw new HistoryFault({ status: "FAILED", code, operation });
}
function finite(value: number, operation: string): number {
  if (!Number.isFinite(value)) fail(operation, "NONFINITE_ARITHMETIC");
  return value;
}
// Object traversal freezes evidence only; all numerical streams use ordered arrays.
function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function pathEvidence(input: EstimatorResult<HistoryPath>): EstimatorResult<HistoryPathEvidence> {
  if (input.status !== "COMPLETE") return structuredClone(input);
  const { path, provider, eligibility } = input.value;
  return { status: "COMPLETE", value: structuredClone({ path, eligibility,
    providerFingerprint: provider.fingerprint, topology: provider.topology }) };
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
  suppliedRequest: HistoryRequest): HistoryResult {
  const request = freeze(structuredClone(suppliedRequest));
  const inputs = freeze([pathEvidence(coarse), pathEvidence(fine)]);
  const partitions: HistoryTrace["partitions"][number][] = [];
  const contributions: HistoryContribution[] = [];
  const evaluations: HistoryTrace["evaluations"][number][] = [];
  let nodes: HistoryNode[] = [];
  const trace = (): HistoryTrace => freeze({ request, inputs, partitions: [...partitions], nodes: [...nodes], evaluations: [...evaluations], contributions: [...contributions] });
  try {
    const original = [unwrap(coarse), unwrap(fine)];
    const snapshots = inputs.map(input => unwrap(input));
    if (request.role !== "PRIMARY" && request.role !== "SECONDARY_DESCRIPTIVE") fail("history/role");
    const { a, b } = request.interval;
    finite(a, "history/interval-a"); finite(b, "history/interval-b");
    const T = finite(b - a, "history/duration");
    if (!(T > 0)) throw new HistoryFault({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null });
    for (const input of snapshots) {
      if (input.eligibility === "INELIGIBLE") throw new HistoryFault({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null });
      if (input.eligibility !== "ELIGIBLE") fail("history/eligibility");
      const vertices = input.path.vertices;
      if (!vertices.length || a < vertices[0].time || b > vertices[vertices.length - 1].time)
        throw new HistoryFault({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null });
    }
    // Capture provider method references and clone topology without cloning functions.
    const providers = original.map((input, i) => Object.freeze({
      fingerprint: snapshots[i].providerFingerprint, topology: snapshots[i].topology,
      explicit: input.provider.explicit, ordinary: input.provider.ordinary,
    }));
    const common = new Map<number, HistoryNodeEvent[]>();
    const addNode = (time: number, event: HistoryNodeEvent) => {
      if (time < a || time > b) return;
      time = normalizeExactZero(finite(time, "history/node-time"));
      const events = common.get(time) ?? [];
      const key = eventKey(event);
      if (!events.some(e => eventKey(e) === key)) events.push(event);
      common.set(time, events);
    };
    for (const [time, kind] of [[a, "INTERVAL_START"], [b, "INTERVAL_END"]] as const)
      addNode(time, { role: null, kind, pathFingerprint: null, providerFingerprint: null, vertexIndex: null, contact: null });
    const native: NativeInterval[][] = [[], []];
    const roles = ["COARSE", "FINE"] as const;
    for (let r = 0; r < roles.length; r++) {
      const path = snapshots[r].path, provider = providers[r], role = roles[r];
      for (let s = 0; s < path.steps.length; s++) {
        const step = path.steps[s];
        if (step.to.time <= a || step.from.time >= b) continue;
        const result = partitionAcceptedStep(path, s, provider, { eligibility: "ELIGIBLE",
          support: request.role === "PRIMARY" ? "FULL_SUPPORT" : "ALLOW_BOUNDARY_CONDITIONED" });
        partitions.push(freeze({ role, stepIndex: s, result: structuredClone(result) }));
        const partition = unwrap(result);
        for (const node of partition.nodes) {
          const base = { role, pathFingerprint: path.fingerprint, providerFingerprint: provider.fingerprint };
          const vertexIndex = node.lambda === 0 ? step.index : node.lambda === 1 ? step.index + 1 : null;
          if (vertexIndex !== null) addNode(node.time, { ...base, kind: "STEP_VERTEX", vertexIndex, contact: null });
          if (node.contact) addNode(node.time, { ...base, kind: "DIAGNOSTIC_CONTACT", vertexIndex, contact: node.contact });
        }
        for (const interval of partition.intervals) if (interval.right.time > a && interval.left.time < b)
          native[r].push({ partition, interval });
      }
      if (!native[r].length) fail("history/empty-native-partition");
    }
    nodes = [...common.entries()].sort(([x], [y]) => x - y)
      .map(([time, events]) => freeze({ time, events: events.sort(eventOrder) }));
    const cursors = [0, 0];
    let support: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED" = "FULL_SUPPORT";
    function operands(r: number, left: number, right: number): HistoryOperands {
      while (cursors[r] < native[r].length && native[r][cursors[r]].interval.right.time <= left) cursors[r]++;
      const item = native[r][cursors[r]];
      if (!item || left < item.interval.left.time || right > item.interval.right.time) fail("history/native-coverage", "NUMERICAL_AMBIGUITY");
      const { interval, partition } = item, path = snapshots[r].path, provider = providers[r];
      const at = (time: number, start: boolean) => {
        // Exact native events retain Slice-2 pinned crossing coordinates. A node
        // originating only on the other path uses this path's accepted step.
        const p = time === interval.left.time ? interval.left.position : time === interval.right.time ? interval.right.position
          : unwrap(positionOnStep(path, partition.step.index, time));
        const context = { segment: interval.segment,
          side: interval.geometry === "VALID_DEGENERATE" ? "DWELL" as const : start ? "TEMPORAL_PLUS" as const : "TEMPORAL_MINUS" as const };
        const result = structuredClone(provider.explicit(p, time, context));
        evaluations.push(freeze({ role: roles[r], stepIndex: partition.step.index, time, context, result }));
        const value = unwrap(result);
        if (value.context.segment.providerFingerprint !== provider.fingerprint || value.context.segment.index !== interval.segment.index)
          fail("history/returned-segment");
        if (value.support === "BOUNDARY_CONDITIONED") {
          if (request.role === "PRIMARY") throw new HistoryFault({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null });
          support = "BOUNDARY_CONDITIONED";
        } else if (value.support !== "FULL_SUPPORT") fail("history/returned-support");
        finite(value.T1, "history/T1");
        return value;
      };
      return freeze({ pathFingerprint: path.fingerprint, providerFingerprint: provider.fingerprint,
        stepIndex: partition.step.index, segment: interval.segment, start: at(left, true), end: at(right, false) });
    }
    const residual = new NeumaierAccumulator(), reference = new NeumaierAccumulator(), durations = new NeumaierAccumulator();
    const coarseLinear: LinearInterval[] = [], fineLinear: LinearInterval[] = [];
    for (let i = 0; i + 1 < nodes.length; i++) {
      const left = nodes[i].time, right = nodes[i + 1].time;
      const d = finite(right - left, "history/local-duration");
      if (!(d > 0)) fail("history/common-order", "NUMERICAL_AMBIGUITY");
      const c = operands(0, left, right), f = operands(1, left, right);
      const d0 = finite(c.start.T1 - f.start.T1, "history/d0"), d1 = finite(c.end.T1 - f.end.T1, "history/d1");
      const delta = unwrap(localLinearIntegrals(left, right, d0, d1));
      const fineArea = unwrap(localLinearIntegrals(left, right, f.start.T1, f.end.T1));
      contributions.push(freeze({ order: i, a: left, b: right, coarse: c, fine: f, d0: normalizeExactZero(d0), d1: normalizeExactZero(d1),
        residualArea: delta.abs, referenceArea: fineArea.abs, residualZeroFraction: delta.zeroFraction, referenceZeroFraction: fineArea.zeroFraction }));
      unwrap(residual.add(delta.abs)); unwrap(reference.add(fineArea.abs)); unwrap(durations.add(d));
      coarseLinear.push({ a: left, b: right, u: c.start.T1, v: c.end.T1 });
      fineLinear.push({ a: left, b: right, u: f.start.T1, v: f.end.T1 });
    }
    const durationSum = unwrap(durations.total()), durationBound = unwrap(durationAllowance(coarseLinear, T));
    if (Math.abs(finite(durationSum - T, "history/duration-residual")) > durationBound.bound)
      fail("history/duration-coverage", "NUMERICAL_AMBIGUITY");
    const residualArea = unwrap(residual.total()), referenceArea = unwrap(reference.total());
    const R1 = normalizeExactZero(finite(residualArea / T, "history/R1"));
    const Aref = normalizeExactZero(finite(referenceArea / T, "history/Aref"));
    // Engineering bounds for the represented local interpolants only. The final
    // division term uses the computed magnitude; independent synthetic checks use
    // their independently declared analytic reference instead. No physical error
    // estimate or scientific acceptance budget is inferred from these bounds.
    const arithmetic = {
      scope: "LOCAL_INTERPOLANT_ARITHMETIC_ONLY" as const,
      residualArea: unwrap(syntheticReferenceAllowance(coarseLinear, undefined, fineLinear)),
      referenceArea: unwrap(syntheticReferenceAllowance(fineLinear)),
      R1: unwrap(syntheticReferenceAllowance(coarseLinear, { T, reference: R1 }, fineLinear)),
      Aref: unwrap(syntheticReferenceAllowance(fineLinear, { T, reference: Aref })),
    };
    return { status: "COMPLETE", value: freeze({ schema: "p2-history/v1", units: "s^-2", areaUnits: "s^-1",
      runtime: { node: process.version, v8: process.versions.v8 }, interval: { a: normalizeExactZero(a), b: normalizeExactZero(b) }, duration: T,
      role: request.role, support, coarsePathFingerprint: snapshots[0].path.fingerprint, finePathFingerprint: snapshots[1].path.fingerprint,
      coarseProviderFingerprint: providers[0].fingerprint, fineProviderFingerprint: providers[1].fingerprint,
      residualArea, referenceArea, R1, Aref, durationSum, durationAllowance: durationBound, arithmetic, trace: trace() }) };
  } catch (error) {
    if (error instanceof HistoryFault) return { ...error.result, trace: trace() };
    throw error;
  }
}
