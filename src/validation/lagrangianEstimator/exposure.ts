import { captureValue, enterCapture, type CaptureContext } from "./capture.js";
/** Validation-local quadrature of accepted Slice-2 partitions. No provider queries.
 * Endpoint values define a local diagnostic interpolant, not physical linearity.
 */
import { exposureAllowance, localLinearIntegrals, NeumaierAccumulator } from "./arithmetic.js";
import type { ArithmeticResult, EstimatorResult, ExposureContribution, ExposureRequest,
  ExposureResult, LinearInterval, Position, StepPartition } from "./types.js";

// Snapshot evidence, including caller-owned input records. Object traversal is only
// for immutability; scientific contribution order always follows the input arrays.
function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function samePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

/** One step uses exactly the same chronological contribution stream as a path. */
export function integrateStepExposure(input: EstimatorResult<StepPartition>, request: ExposureRequest, capture?: CaptureContext): ExposureResult {
  capture = enterCapture(capture, "exposure/integrateStepExposure");
  captureValue(capture, "input/input", input);
  captureValue(capture, "input/request", request);

  return captureValue(capture, "exposure/site-CC/return", integratePathExposure([input], request, capture));
}

/** Contiguous ordered accepted steps of one path/provider; never sum step totals.
 * PRIMARY requires caller-authorized primary partitions. Secondary authorization
 * is retained even when every explicit operand happens to have full support.
 */
export function integratePathExposure(
  supplied: readonly EstimatorResult<StepPartition>[], request: ExposureRequest,capture?: CaptureContext
): ExposureResult {
  capture = enterCapture(capture, "exposure/integratePathExposure");
  captureValue(capture, "input/supplied", supplied);
  captureValue(capture, "input/request", request);

  const inputs = captureValue(capture, "exposure/site-DC/local/inputs", freeze(structuredClone(supplied)));
  const contributions: ExposureContribution[] = captureValue(capture, "exposure/site-DD/local/contributions", []);
  const trace = captureValue(capture, "exposure/site-DE/local/trace", () => freeze({ inputs, contributions: [...contributions] }));
  const invalid = captureValue(capture, "exposure/site-DF/local/invalid", (operation: string): ExposureResult => ({ status: "FAILED", code: "INVALID_CONTEXT", operation, trace: trace() }));
  const failedArithmetic = captureValue(capture, "exposure/site-DG/local/failedArithmetic", (r: Exclude<ArithmeticResult<unknown>, { status: "COMPLETE" }>): ExposureResult => ({ ...r, trace: trace() }));
  if (!inputs.length) return captureValue(capture, "exposure/site-DH/return", invalid("exposure/empty"));
  if (request.role !== "PRIMARY" && request.role !== "SECONDARY_DESCRIPTIVE") return captureValue(capture, "exposure/site-DI/return", invalid("exposure/role"));
  // Rejected/unavailable input dominates: never turn an incomplete path into zero.
  for (const input of inputs) if (input.status !== "COMPLETE") return captureValue(capture, "exposure/site-EA/return", { ...input, trace: trace() });
  const partitions = captureValue(capture, "exposure/site-EB/local/partitions", inputs.map(input => (captureValue(capture, "callback/input", input), captureValue(capture, "map/inputs/result", (input as { status: "COMPLETE"; value: StepPartition }).value))));
  const first = captureValue(capture, "exposure/site-EC/local/first", partitions[0]);
  const pathDuration = captureValue(capture, "exposure/site-ED/local/pathDuration", partitions[partitions.length - 1].step.to.time - first.step.from.time);
  if (!Number.isFinite(pathDuration)) return captureValue(capture, "exposure/site-EE/return", failedArithmetic({ status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "exposure/path-duration" }));
  if (!(pathDuration > 0)) return captureValue(capture, "exposure/site-EF/return", invalid("exposure/path-duration"));
  const pathFingerprint = captureValue(capture, "exposure/site-EG/local/pathFingerprint", first.step.pathFingerprint);
  const providerFingerprint = captureValue(capture, "exposure/site-EH/local/providerFingerprint", first.intervals[0]?.segment.providerFingerprint);
  if (!providerFingerprint) return captureValue(capture, "exposure/site-EI/return", invalid("exposure/empty-partition"));
  const signed = captureValue(capture, "exposure/site-EJ/local/signed", new NeumaierAccumulator(enterCapture(capture, "exposure/accumulator/signed"))), absolute = captureValue(capture, "exposure/site-EJ/local/absolute", new NeumaierAccumulator(enterCapture(capture, "exposure/accumulator/absolute")));
  const linear: LinearInterval[] = captureValue(capture, "exposure/site-FA/local/linear", []);
  let support: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED" = captureValue(capture, "exposure/site-FB/local/support", "FULL_SUPPORT");
  let crossingCount = captureValue(capture, "exposure/site-FC/local/crossingCount", 0);
  for (let s = captureValue(capture, "exposure/site-FD/local/s", 0); s < partitions.length; s++) {
    captureValue(capture, "loop/s", s);
    const partition = captureValue(capture, "exposure/site-FE/local/partition", partitions[s]), step = captureValue(capture, "exposure/site-FE/local/step", partition.step);
    if (step.pathFingerprint !== pathFingerprint) return captureValue(capture, "exposure/site-FF/return", invalid("exposure/path-identity"));
    if (!partition.intervals.length) return captureValue(capture, "exposure/site-FG/return", invalid("exposure/empty-partition"));
    if (s > 0) {
      const previous = captureValue(capture, "exposure/site-FI/local/previous", partitions[s - 1].step);
      if (step.index !== previous.index + 1 || step.from.time !== previous.to.time ||
        !samePosition(step.from.position, previous.to.position)) return captureValue(capture, "exposure/site-GA/return", invalid("exposure/step-adjacency"));
    }
    if (partition.nodes.length !== partition.intervals.length + 1) return captureValue(capture, "exposure/site-GC/return", invalid("exposure/node-count"));
    crossingCount += partition.crossingCount;
    for (let j = captureValue(capture, "exposure/site-GE/local/j", 0); j < partition.intervals.length; j++) {
    captureValue(capture, "loop/j", j);
      const interval = captureValue(capture, "exposure/site-GF/local/interval", partition.intervals[j]), { left, right, start, end, segment } = captureValue(capture, "exposure/site-GF/local/{ left, right, start, end, segment }", interval);
      if (segment.providerFingerprint !== providerFingerprint ||
        start.context.segment.providerFingerprint !== providerFingerprint || end.context.segment.providerFingerprint !== providerFingerprint)
        return captureValue(capture, "exposure/site-GI/return", { status: "FAILED", code: "PROVIDER_MISMATCH", operation: "exposure/provider-identity", trace: trace() });
      if (start.context.segment.index !== segment.index || end.context.segment.index !== segment.index)
        return captureValue(capture, "exposure/site-HA/return", invalid("exposure/segment-context"));
      // Validate supplied coverage, without reconstructing topology or operands.
      const preceding = captureValue(capture, "exposure/site-HC/local/preceding", j === 0 ? step.from : partition.intervals[j - 1].right);
      if (left.time !== preceding.time || !samePosition(left.position, preceding.position) ||
        start.time !== left.time || end.time !== right.time ||
        !samePosition(start.position, left.position) || !samePosition(end.position, right.position) ||
        left.time !== partition.nodes[j].time || right.time !== partition.nodes[j + 1].time ||
        !samePosition(left.position, partition.nodes[j].position) || !samePosition(right.position, partition.nodes[j + 1].position))
        return captureValue(capture, "exposure/site-HI/return", invalid("exposure/interval-adjacency"));
      if (j === partition.intervals.length - 1 &&
        (right.time !== step.to.time || !samePosition(right.position, step.to.position))) return captureValue(capture, "exposure/site-IA/return", invalid("exposure/step-coverage"));
      for (const operand of [start, end]) {
    captureValue(capture, "loop/operand", operand);
        if (operand.support === "BOUNDARY_CONDITIONED") {
          if (request.role === "PRIMARY") return captureValue(capture, "exposure/site-ID/return", { status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null, trace: trace() });
          support = captureValue(capture, "exposure/site-IE/assign/support", "BOUNDARY_CONDITIONED");
        } else if (operand.support !== "FULL_SUPPORT") return captureValue(capture, "exposure/site-IF/return", invalid("exposure/support"));
      }
      const operands = captureValue(capture, "exposure/site-IH/local/operands", { a: left.time, b: right.time, u: start.T1, v: end.T1 });
      const local = captureValue(capture, "exposure/site-II/local/local", localLinearIntegrals(operands.a, operands.b, operands.u, operands.v, capture));
      if (local.status !== "COMPLETE") return captureValue(capture, "exposure/site-IJ/return", failedArithmetic(local));
      contributions.push(captureValue(capture, "exposure/site-JA/push", freeze({ order: contributions.length, stepIndex: step.index, subintervalIndex: j,
        pathFingerprint, interval, ...local.value })));
      linear.push(captureValue(capture, "exposure/site-JC/push", operands));
      const addedSigned = captureValue(capture, "exposure/site-JD/local/addedSigned", signed.add(local.value.signed));
      if (addedSigned.status !== "COMPLETE") return captureValue(capture, "exposure/site-JE/return", failedArithmetic(addedSigned));
      const addedAbsolute = captureValue(capture, "exposure/site-JF/local/addedAbsolute", absolute.add(local.value.abs));
      if (addedAbsolute.status !== "COMPLETE") return captureValue(capture, "exposure/site-JG/return", failedArithmetic(addedAbsolute));
    }
  }
  const Esigned = captureValue(capture, "exposure/site-JJ/local/Esigned", signed.total()), Eabs = captureValue(capture, "exposure/site-JJ/local/Eabs", absolute.total());
  if (Esigned.status !== "COMPLETE") return captureValue(capture, "exposure/site-BAA/return", failedArithmetic(Esigned));
  if (Eabs.status !== "COMPLETE") return captureValue(capture, "exposure/site-BAB/return", failedArithmetic(Eabs));
  const allowance = captureValue(capture, "exposure/site-BAC/local/allowance", exposureAllowance(linear, capture));
  if (allowance.status !== "COMPLETE") return captureValue(capture, "exposure/site-BAD/return", failedArithmetic(allowance));
  const upper = captureValue(capture, "exposure/site-BAE/local/upper", Eabs.value + allowance.value.bound);
  if (!Number.isFinite(upper)) return captureValue(capture, "exposure/site-BAF/return", failedArithmetic({ status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "exposure/invariant-upper" }));
  const invariants = captureValue(capture, "exposure/site-BAG/local/invariants", { absoluteNonnegative: Eabs.value >= -allowance.value.bound, signedBounded: Math.abs(Esigned.value) <= upper });
  if (!invariants.absoluteNonnegative || !invariants.signedBounded) return captureValue(capture, "exposure/site-BAH/return", invalid("exposure/invariants"));
  return captureValue(capture, "exposure/site-BAI/return", { status: "COMPLETE", value: freeze({ schema: "p2-exposure/v1", units: "s^-1", role: request.role,
    support, pathFingerprint, providerFingerprint, interval: { a: first.step.from.time, b: partitions[partitions.length - 1].step.to.time },
    stepCount: partitions.length, subintervalCount: contributions.length, crossingCount,
    Esigned: Esigned.value, Eabs: Eabs.value, allowance: allowance.value, invariants, trace: trace() }) });
}
