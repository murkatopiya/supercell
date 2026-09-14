/** Single accepted-step topology and endpoint operands only. No integral accumulation. */
import { durationAllowance, NeumaierAccumulator } from "./arithmetic.js";
import { finitePosition } from "./path.js";
import type { AcceptedPath, VerticalDiagnosticProvider, PartitionRequest, EstimatorResult,
  StepPartition, PartitionNode, SegmentSubinterval, ProviderTopology, BoundaryContact } from "./types.js";

function ownedSegment(t: ProviderTopology, y: number): number | null {
  const h = t.heights;
  if (y < h[0] || y > h[h.length - 1]) return null;
  let lo = 0, hi = h.length - 1;
  while (lo + 1 < hi) { const m = (lo + hi) >>> 1; if (y < h[m]) hi = m; else lo = m; }
  return Math.min(lo, h.length - 2);
}
export function partitionAcceptedStep(path: AcceptedPath, stepIndex: number, provider: VerticalDiagnosticProvider,
  request: PartitionRequest): EstimatorResult<StepPartition> {
  if (request.eligibility === "INELIGIBLE") return { status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null };
  if (request.eligibility !== "ELIGIBLE" || !["FULL_SUPPORT", "ALLOW_BOUNDARY_CONDITIONED"].includes(request.support))
    return { status: "FAILED", code: "INVALID_CONTEXT", operation: "partition/request" };
  const step = path.steps[stepIndex];
  if (!Number.isInteger(stepIndex) || !step || step.pathFingerprint !== path.fingerprint)
    return { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "partition/step-identity" };
  const topology = provider.topology;
  if (!topology) return { status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null };
  if (topology.fingerprint !== provider.fingerprint || topology.segments.some(s => s.providerFingerprint !== provider.fingerprint) ||
    topology.boundaries.some(b => b.providerFingerprint !== provider.fingerprint))
    return { status: "FAILED", code: "PROVIDER_MISMATCH", operation: "partition/provider-identity" };
  const hs = topology.heights;
  const y0 = step.from.position.y, y1 = step.to.position.y;
  const d = step.to.time - step.from.time, dy = y1 - y0;
  if (!(d > 0) || !Number.isFinite(d) || !Number.isFinite(dy))
    return { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/differences" };
  const direction = Math.sign(dy);
  const contact = (boundaryIndex: number, location: BoundaryContact["location"]): BoundaryContact => Object.freeze({
    pathFingerprint: path.fingerprint, boundary: topology.boundaries[boundaryIndex], location: Object.freeze(location),
  });
  const vertexNode = (last: boolean): PartitionNode => {
    const vertex = last ? step.to : step.from;
    const k = hs.indexOf(vertex.position.y);
    return Object.freeze({ time: vertex.time, lambda: last ? 1 : 0, position: vertex.position,
      contact: k < 0 ? null : contact(k, { kind: "VERTEX", index: step.index + (last ? 1 : 0) }) });
  };
  const nodes: PartitionNode[] = [vertexNode(false)];
  const boundaryIndices: number[] = [];
  if (direction !== 0) {
    for (let i = 0; i < hs.length; i++) if (Math.min(y0, y1) < hs[i] && hs[i] < Math.max(y0, y1)) boundaryIndices.push(i);
    if (direction < 0) boundaryIndices.reverse();
  }
  for (const k of boundaryIndices) {
    const lambda = (hs[k] - y0) / dy;
    const time = step.from.time + lambda * d;
    const position = Object.freeze({
      x: step.from.position.x + lambda * (step.to.position.x - step.from.position.x),
      y: hs[k],
      z: step.from.position.z + lambda * (step.to.position.z - step.from.position.z),
    });
    const previous = nodes[nodes.length - 1];
    if (!(lambda > previous.lambda && lambda < 1 && time > previous.time && time < step.to.time) || !finitePosition(position))
      return { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/crossing-order" };
    nodes.push(Object.freeze({ lambda, time, position, contact: contact(k, { kind: "STEP_INTERIOR", index: step.index }) }));
  }
  nodes.push(vertexNode(true));
  if (ownedSegment(topology, y0) === null || ownedSegment(topology, y1) === null)
    return { status: "UNSUPPORTED", reason: "OUT_OF_DOMAIN", value: null };
  // Preserve conservative closed-step support, including owned endpoint contacts.
  if (request.support === "FULL_SUPPORT") {
    for (let i = 0; i < topology.support.length; i++) {
      const intersects = Math.max(y0, y1) >= hs[i] &&
        (i === topology.support.length - 1 ? Math.min(y0, y1) <= hs[i + 1] : Math.min(y0, y1) < hs[i + 1]);
      if (intersects && topology.support[i] !== "FULL_SUPPORT")
        return { status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null };
    }
  }
  const intervals: SegmentSubinterval[] = [];
  const durations = new NeumaierAccumulator();
  for (let i = 0; i + 1 < nodes.length; i++) {
    const left = nodes[i], right = nodes[i + 1];
    if (!(right.time > left.time)) return { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/duration" };
    let segmentIndex = ownedSegment(topology, left.position.y)!;
    const exactBoundary = hs.indexOf(left.position.y);
    // Downward departure selects the lower segment without displaced/midpoint lookup.
    if (direction < 0 && exactBoundary >= 0) segmentIndex = exactBoundary - 1;
    const segment = topology.segments[segmentIndex];
    if (!segment || left.position.y < hs[segmentIndex] || left.position.y > hs[segmentIndex + 1] ||
      right.position.y < hs[segmentIndex] || right.position.y > hs[segmentIndex + 1])
      return { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/segment-closure" };
    const start = provider.explicit(left.position, left.time, { segment, side: direction === 0 ? "DWELL" : "TEMPORAL_PLUS" });
    if (start.status !== "COMPLETE") return start;
    const end = provider.explicit(right.position, right.time, { segment, side: direction === 0 ? "DWELL" : "TEMPORAL_MINUS" });
    if (end.status !== "COMPLETE") return end;
    if (request.support === "FULL_SUPPORT" && (start.value.support !== "FULL_SUPPORT" || end.value.support !== "FULL_SUPPORT"))
      return { status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null };
    intervals.push(Object.freeze({ left, right, segment, geometry: direction === 0 ? "VALID_DEGENERATE" : "REGULAR",
      start: start.value, end: end.value }));
    const added = durations.add(right.time - left.time);
    if (added.status === "FAILED") return { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: added.operation };
  }
  const total = durations.total(), bound = durationAllowance(intervals.map(i => ({ a: i.left.time, b: i.right.time })), d);
  if (total.status !== "COMPLETE" || bound.status !== "COMPLETE")
    return { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "partition/duration-bound" };
  if (Math.abs(total.value - d) > bound.value.bound)
    return { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/coverage" };
  return { status: "COMPLETE", value: Object.freeze({ step, nodes: Object.freeze(nodes), intervals: Object.freeze(intervals),
    crossingCount: boundaryIndices.length, durationSum: total.value, durationBound: bound.value.bound }) };
}
