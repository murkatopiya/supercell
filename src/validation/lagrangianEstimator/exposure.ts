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
export function integrateStepExposure(input: EstimatorResult<StepPartition>, request: ExposureRequest): ExposureResult {
  return integratePathExposure([input], request);
}

/** Contiguous ordered accepted steps of one path/provider; never sum step totals.
 * PRIMARY requires caller-authorized primary partitions. Secondary authorization
 * is retained even when every explicit operand happens to have full support.
 */
export function integratePathExposure(
  supplied: readonly EstimatorResult<StepPartition>[], request: ExposureRequest,
): ExposureResult {
  const inputs = freeze(structuredClone(supplied));
  const contributions: ExposureContribution[] = [];
  const trace = () => freeze({ inputs, contributions: [...contributions] });
  const invalid = (operation: string): ExposureResult => ({ status: "FAILED", code: "INVALID_CONTEXT", operation, trace: trace() });
  const failedArithmetic = (r: Exclude<ArithmeticResult<unknown>, { status: "COMPLETE" }>): ExposureResult => ({ ...r, trace: trace() });
  if (!inputs.length) return invalid("exposure/empty");
  if (request.role !== "PRIMARY" && request.role !== "SECONDARY_DESCRIPTIVE") return invalid("exposure/role");
  // Rejected/unavailable input dominates: never turn an incomplete path into zero.
  for (const input of inputs) if (input.status !== "COMPLETE") return { ...input, trace: trace() };
  const partitions = inputs.map(input => (input as { status: "COMPLETE"; value: StepPartition }).value);
  const first = partitions[0];
  const pathDuration = partitions[partitions.length - 1].step.to.time - first.step.from.time;
  if (!Number.isFinite(pathDuration)) return failedArithmetic({ status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "exposure/path-duration" });
  if (!(pathDuration > 0)) return invalid("exposure/path-duration");
  const pathFingerprint = first.step.pathFingerprint;
  const providerFingerprint = first.intervals[0]?.segment.providerFingerprint;
  if (!providerFingerprint) return invalid("exposure/empty-partition");
  const signed = new NeumaierAccumulator(), absolute = new NeumaierAccumulator();
  const linear: LinearInterval[] = [];
  let support: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED" = "FULL_SUPPORT";
  let crossingCount = 0;
  for (let s = 0; s < partitions.length; s++) {
    const partition = partitions[s], step = partition.step;
    if (step.pathFingerprint !== pathFingerprint) return invalid("exposure/path-identity");
    if (!partition.intervals.length) return invalid("exposure/empty-partition");
    if (s > 0) {
      const previous = partitions[s - 1].step;
      if (step.index !== previous.index + 1 || step.from.time !== previous.to.time ||
        !samePosition(step.from.position, previous.to.position)) return invalid("exposure/step-adjacency");
    }
    if (partition.nodes.length !== partition.intervals.length + 1) return invalid("exposure/node-count");
    crossingCount += partition.crossingCount;
    for (let j = 0; j < partition.intervals.length; j++) {
      const interval = partition.intervals[j], { left, right, start, end, segment } = interval;
      if (segment.providerFingerprint !== providerFingerprint ||
        start.context.segment.providerFingerprint !== providerFingerprint || end.context.segment.providerFingerprint !== providerFingerprint)
        return { status: "FAILED", code: "PROVIDER_MISMATCH", operation: "exposure/provider-identity", trace: trace() };
      if (start.context.segment.index !== segment.index || end.context.segment.index !== segment.index)
        return invalid("exposure/segment-context");
      // Validate supplied coverage, without reconstructing topology or operands.
      const preceding = j === 0 ? step.from : partition.intervals[j - 1].right;
      if (left.time !== preceding.time || !samePosition(left.position, preceding.position) ||
        start.time !== left.time || end.time !== right.time ||
        !samePosition(start.position, left.position) || !samePosition(end.position, right.position) ||
        left.time !== partition.nodes[j].time || right.time !== partition.nodes[j + 1].time ||
        !samePosition(left.position, partition.nodes[j].position) || !samePosition(right.position, partition.nodes[j + 1].position))
        return invalid("exposure/interval-adjacency");
      if (j === partition.intervals.length - 1 &&
        (right.time !== step.to.time || !samePosition(right.position, step.to.position))) return invalid("exposure/step-coverage");
      for (const operand of [start, end]) {
        if (operand.support === "BOUNDARY_CONDITIONED") {
          if (request.role === "PRIMARY") return { status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null, trace: trace() };
          support = "BOUNDARY_CONDITIONED";
        } else if (operand.support !== "FULL_SUPPORT") return invalid("exposure/support");
      }
      const operands = { a: left.time, b: right.time, u: start.T1, v: end.T1 };
      const local = localLinearIntegrals(operands.a, operands.b, operands.u, operands.v);
      if (local.status !== "COMPLETE") return failedArithmetic(local);
      contributions.push(freeze({ order: contributions.length, stepIndex: step.index, subintervalIndex: j,
        pathFingerprint, interval, ...local.value }));
      linear.push(operands);
      const addedSigned = signed.add(local.value.signed);
      if (addedSigned.status !== "COMPLETE") return failedArithmetic(addedSigned);
      const addedAbsolute = absolute.add(local.value.abs);
      if (addedAbsolute.status !== "COMPLETE") return failedArithmetic(addedAbsolute);
    }
  }
  const Esigned = signed.total(), Eabs = absolute.total();
  if (Esigned.status !== "COMPLETE") return failedArithmetic(Esigned);
  if (Eabs.status !== "COMPLETE") return failedArithmetic(Eabs);
  const allowance = exposureAllowance(linear);
  if (allowance.status !== "COMPLETE") return failedArithmetic(allowance);
  const upper = Eabs.value + allowance.value.bound;
  if (!Number.isFinite(upper)) return failedArithmetic({ status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "exposure/invariant-upper" });
  const invariants = { absoluteNonnegative: Eabs.value >= -allowance.value.bound, signedBounded: Math.abs(Esigned.value) <= upper };
  if (!invariants.absoluteNonnegative || !invariants.signedBounded) return invalid("exposure/invariants");
  return { status: "COMPLETE", value: freeze({ schema: "p2-exposure/v1", units: "s^-1", role: request.role,
    support, pathFingerprint, providerFingerprint, interval: { a: first.step.from.time, b: partitions[partitions.length - 1].step.to.time },
    stepCount: partitions.length, subintervalCount: contributions.length, crossingCount,
    Esigned: Esigned.value, Eabs: Eabs.value, allowance: allowance.value, invariants, trace: trace() }) };
}
