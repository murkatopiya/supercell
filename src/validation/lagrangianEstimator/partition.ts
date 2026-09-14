import { captureValue, enterCapture, type CaptureContext } from "./capture.js";
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
  request: PartitionRequest, capture?: CaptureContext): EstimatorResult<StepPartition> {
  capture = enterCapture(capture, "partition/partitionAcceptedStep");
  captureValue(capture, "input/path", path);
  captureValue(capture, "input/stepIndex", stepIndex);
  captureValue(capture, "input/provider", provider);
  captureValue(capture, "input/request", request);

  if (request.eligibility === "INELIGIBLE") return captureValue(capture, "partition/site-BF/return", { status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null });
  if (request.eligibility !== "ELIGIBLE" || !["FULL_SUPPORT", "ALLOW_BOUNDARY_CONDITIONED"].includes(request.support))
    return captureValue(capture, "partition/site-BH/return", { status: "FAILED", code: "INVALID_CONTEXT", operation: "partition/request" });
  const step = captureValue(capture, "partition/site-BI/local/step", path.steps[stepIndex]);
  if (!Number.isInteger(stepIndex) || !step || step.pathFingerprint !== path.fingerprint)
    return captureValue(capture, "partition/site-CA/return", { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "partition/step-identity" });
  const topology = captureValue(capture, "partition/site-CB/local/topology", provider.topology);
  if (!topology) return captureValue(capture, "partition/site-CC/return", { status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null });
  if (topology.fingerprint !== provider.fingerprint || topology.segments.some(s => s.providerFingerprint !== provider.fingerprint) ||
    topology.boundaries.some(b => b.providerFingerprint !== provider.fingerprint))
    return captureValue(capture, "partition/site-CF/return", { status: "FAILED", code: "PROVIDER_MISMATCH", operation: "partition/provider-identity" });
  const hs = captureValue(capture, "partition/site-CG/local/hs", topology.heights);
  const y0 = captureValue(capture, "partition/site-CH/local/y0", step.from.position.y), y1 = captureValue(capture, "partition/site-CH/local/y1", step.to.position.y);
  const d = captureValue(capture, "partition/site-CI/local/d", step.to.time - step.from.time), dy = captureValue(capture, "partition/site-CI/local/dy", y1 - y0);
  if (!(d > 0) || !Number.isFinite(d) || !Number.isFinite(dy))
    return captureValue(capture, "partition/site-DA/return", { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/differences" });
  const direction = captureValue(capture, "partition/site-DB/local/direction", Math.sign(dy));
  const contact = captureValue(capture, "partition/site-DC/local/contact", (boundaryIndex: number, location: BoundaryContact["location"]): BoundaryContact => Object.freeze({
    pathFingerprint: path.fingerprint, boundary: topology.boundaries[boundaryIndex], location: Object.freeze(location),
  }));
  const vertexNode = captureValue(capture, "partition/site-DF/local/vertexNode", (last: boolean): PartitionNode => {
    captureValue(capture, "partition/site-DF/callback/last", last);
    const vertex = captureValue(capture, "partition/site-DG/local/vertex", last ? step.to : step.from);
    const k = captureValue(capture, "partition/site-DH/local/k", hs.indexOf(vertex.position.y));
    return captureValue(capture, "partition/site-DI/return", Object.freeze({ time: vertex.time, lambda: last ? 1 : 0, position: vertex.position,
      contact: k < 0 ? null : contact(k, { kind: "VERTEX", index: step.index + (last ? 1 : 0) }) }));
  });
  const nodes: PartitionNode[] = captureValue(capture, "partition/site-EB/local/nodes", [vertexNode(false)]);
  const boundaryIndices: number[] = captureValue(capture, "partition/site-EC/local/boundaryIndices", []);
  if (direction !== 0) {
    for (let i = captureValue(capture, "partition/site-EE/local/i", 0); i < hs.length; i++) if (Math.min(y0, y1) < hs[i] && hs[i] < Math.max(y0, y1)) boundaryIndices.push(captureValue(capture, "partition/site-EE/push", i));
    if (direction < 0) boundaryIndices.reverse();
  }
  captureValue(capture, "partition/ordered-boundary-indices", boundaryIndices);
  for (const k of boundaryIndices) {
    captureValue(capture, "loop/k", k);
    const lambda = captureValue(capture, "partition/site-EI/local/lambda", (hs[k] - y0) / dy);
    const time = captureValue(capture, "partition/site-EJ/local/time", step.from.time + lambda * d);
    const position = captureValue(capture, "partition/site-FA/local/position", Object.freeze({
      x: step.from.position.x + lambda * (step.to.position.x - step.from.position.x),
      y: hs[k],
      z: step.from.position.z + lambda * (step.to.position.z - step.from.position.z),
    }));
    const previous = captureValue(capture, "partition/site-FF/local/previous", nodes[nodes.length - 1]);
    if (!(lambda > previous.lambda && lambda < 1 && time > previous.time && time < step.to.time) || !finitePosition(position))
      return captureValue(capture, "partition/site-FH/return", { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/crossing-order" });
    nodes.push(captureValue(capture, "partition/site-FI/push", Object.freeze({ lambda, time, position, contact: contact(k, { kind: "STEP_INTERIOR", index: step.index }) })));
    captureValue(capture, "partition/nodes-accepted-count", nodes.length);
  }
  nodes.push(captureValue(capture, "partition/site-GA/push", vertexNode(true)));
  captureValue(capture, "partition/nodes-accepted-count", nodes.length);
  if (ownedSegment(topology, y0) === null || ownedSegment(topology, y1) === null)
    return captureValue(capture, "partition/site-GC/return", { status: "UNSUPPORTED", reason: "OUT_OF_DOMAIN", value: null });
  // Preserve conservative closed-step support, including owned endpoint contacts.
  if (request.support === "FULL_SUPPORT") {
    for (let i = captureValue(capture, "partition/site-GF/local/i", 0); i < topology.support.length; i++) {
    captureValue(capture, "loop/i", i);
      const intersects = captureValue(capture, "partition/site-GG/local/intersects", Math.max(y0, y1) >= hs[i] &&
        (i === topology.support.length - 1 ? Math.min(y0, y1) <= hs[i + 1] : Math.min(y0, y1) < hs[i + 1]));
      if (intersects && topology.support[i] !== "FULL_SUPPORT")
        return captureValue(capture, "partition/site-GJ/return", { status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null });
    }
  }
  const intervals: SegmentSubinterval[] = captureValue(capture, "partition/site-HC/local/intervals", []);
  const durations = captureValue(capture, "partition/site-HD/local/durations", new NeumaierAccumulator(enterCapture(capture, "partition/site-HD/accumulator")));
  for (let i = captureValue(capture, "partition/site-HE/local/i", 0); i + 1 < nodes.length; i++) {
    captureValue(capture, "loop/i", i);
    const left = captureValue(capture, "partition/site-HF/local/left", nodes[i]), right = captureValue(capture, "partition/site-HF/local/right", nodes[i + 1]);
    if (!(right.time > left.time)) return captureValue(capture, "partition/site-HG/return", { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/duration" });
    let segmentIndex = captureValue(capture, "partition/site-HH/local/segmentIndex", ownedSegment(topology, left.position.y)!);
    const exactBoundary = captureValue(capture, "partition/site-HI/local/exactBoundary", hs.indexOf(left.position.y));
    // Downward departure selects the lower segment without displaced/midpoint lookup.
    if (direction < 0 && exactBoundary >= 0) segmentIndex = captureValue(capture, "partition/site-IA/assign/segmentIndex", exactBoundary - 1);
    const segment = captureValue(capture, "partition/site-IB/local/segment", topology.segments[segmentIndex]);
    if (!segment || left.position.y < hs[segmentIndex] || left.position.y > hs[segmentIndex + 1] ||
      right.position.y < hs[segmentIndex] || right.position.y > hs[segmentIndex + 1])
      return captureValue(capture, "partition/site-IE/return", { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/segment-closure" });
    const start = (captureValue(capture, "partition/site-IF/provider-explicit/begin", undefined), captureValue(capture, "partition/site-IF/local/start", captureValue(capture, "partition/site-IF/provider-explicit/return", provider.explicit(left.position, left.time, { segment, side: direction === 0 ? "DWELL" : "TEMPORAL_PLUS" }, capture))));
    if (start.status !== "COMPLETE") return captureValue(capture, "partition/site-IG/return", start);
    const end = (captureValue(capture, "partition/site-IH/provider-explicit/begin", undefined), captureValue(capture, "partition/site-IH/local/end", captureValue(capture, "partition/site-IH/provider-explicit/return", provider.explicit(right.position, right.time, { segment, side: direction === 0 ? "DWELL" : "TEMPORAL_MINUS" }, capture))));
    if (end.status !== "COMPLETE") return captureValue(capture, "partition/site-II/return", end);
    if (request.support === "FULL_SUPPORT" && (start.value.support !== "FULL_SUPPORT" || end.value.support !== "FULL_SUPPORT"))
      return captureValue(capture, "partition/site-JA/return", { status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null });
    intervals.push(captureValue(capture, "partition/site-JB/push", Object.freeze({ left, right, segment, geometry: direction === 0 ? "VALID_DEGENERATE" : "REGULAR",
      start: start.value, end: end.value })));
    const added = captureValue(capture, "partition/site-JD/local/added", durations.add(right.time - left.time));
    if (added.status === "FAILED") return captureValue(capture, "partition/site-JE/return", { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: added.operation });
  }
  const total = captureValue(capture, "partition/site-JG/local/total", durations.total()), bound = captureValue(capture, "partition/site-JG/local/bound", durationAllowance(intervals.map(i => (captureValue(capture, "callback/i", i), captureValue(capture, "map/intervals/result", ({ a: i.left.time, b: i.right.time })))), d, capture));
  if (total.status !== "COMPLETE" || bound.status !== "COMPLETE")
    return captureValue(capture, "partition/site-JI/return", { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "partition/duration-bound" });
  if (Math.abs(total.value - d) > bound.value.bound)
    return captureValue(capture, "partition/site-BAA/return", { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/coverage" });
  return captureValue(capture, "partition/site-BAB/return", { status: "COMPLETE", value: Object.freeze({ step, nodes: Object.freeze(nodes), intervals: Object.freeze(intervals),
    crossingCount: boundaryIndices.length, durationSum: total.value, durationBound: bound.value.bound }) });
}
