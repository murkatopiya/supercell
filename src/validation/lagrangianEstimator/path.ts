import { captureValue, enterCapture, type CaptureContext } from "./capture.js";
/** Accepted linear geometry only. Never advances a simulation or queries diagnostics. */
import { createHash } from "node:crypto";
import type { AcceptedPath, PathVertex, Position, EstimatorResult } from "./types.js";

export const finitePosition = (p: Position): boolean =>
  !!p && [p.x, p.y, p.z].every(Number.isFinite);
const copyPosition = (p: Position): Position => Object.freeze({ x: p.x, y: p.y, z: p.z });

export function createAcceptedPath(input: readonly PathVertex[], capture?: CaptureContext): EstimatorResult<AcceptedPath> {
  capture = enterCapture(capture, "path/createAcceptedPath");
  captureValue(capture, "input/input", input);

  if (input.length < 2) return captureValue(capture, "path/site-J/return", { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/vertices" });
  for (let i = captureValue(capture, "path/site-BA/local/i", 0); i < input.length; i++) {
    captureValue(capture, "loop/i", i);
    const v = captureValue(capture, "path/site-BB/local/v", input[i]);
    if (!v || !Number.isFinite(v.time) || !finitePosition(v.position))
      return captureValue(capture, "path/site-BD/return", { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/finite" });
    if (i > 0) {
      const duration = captureValue(capture, "path/site-BF/local/duration", v.time - input[i - 1].time);
      if (!(duration > 0) || !Number.isFinite(duration))
        return captureValue(capture, "path/site-BH/return", { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/time-order" });
    }
  }
  const vertices = captureValue(capture, "path/site-CA/local/vertices", Object.freeze(input.map(v => (captureValue(capture, "callback/v", v), captureValue(capture, "map/input/result", Object.freeze({ time: v.time, position: copyPosition(v.position) }))))));
  // Fixed tuple encoding, no user object keys. JSON canonicalizes exact signed zero.
  const fingerprint = captureValue(capture, "path/site-CC/local/fingerprint", createHash("sha256").update(JSON.stringify(["accepted-linear-path/v1",
    vertices.map(v => (captureValue(capture, "callback/v", v), captureValue(capture, "map/vertices/result", [v.time, v.position.x, v.position.y, v.position.z])))]), "utf8").digest("hex"));
  const steps = captureValue(capture, "path/site-CE/local/steps", Object.freeze(vertices.slice(1).map((to, index) => (captureValue(capture, "callback/to", to), captureValue(capture, "callback/index", index), captureValue(capture, "map/vertices.slice(1)/result", Object.freeze({
    pathFingerprint: fingerprint, index, from: vertices[index], to,
  }))))));
  return captureValue(capture, "path/site-CH/return", { status: "COMPLETE", value: Object.freeze({ fingerprint, vertices, steps }) });
}

/** Ordinary lookup owns an interior vertex with the following step; final vertex uses last. */
export function locateAcceptedStep(path: AcceptedPath, time: number, capture?: CaptureContext): EstimatorResult<number> {
  capture = enterCapture(capture, "path/locateAcceptedStep");
  captureValue(capture, "input/path", path);
  captureValue(capture, "input/time", time);

  if (!Number.isFinite(time) || time < path.vertices[0].time || time > path.vertices[path.vertices.length - 1].time)
    return captureValue(capture, "path/site-DD/return", { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/lookup-time" });
  let lo = captureValue(capture, "path/site-DE/local/lo", 0), hi = captureValue(capture, "path/site-DE/local/hi", path.vertices.length - 1);
  while (lo + 1 < hi) { const mid = captureValue(capture, "path/site-DF/local/mid", (lo + hi) >>> 1); if (time < path.vertices[mid].time) hi = captureValue(capture, "path/site-DF/assign/hi", mid); else lo = captureValue(capture, "path/site-DF/assign/lo", mid); }
  return captureValue(capture, "path/site-DG/return", { status: "COMPLETE", value: Math.min(lo, path.steps.length - 1) });
}

export function positionOnStep(path: AcceptedPath, index: number, time: number, capture?: CaptureContext): EstimatorResult<Position> {
  capture = enterCapture(capture, "path/positionOnStep");
  captureValue(capture, "input/path", path);
  captureValue(capture, "input/index", index);
  captureValue(capture, "input/time", time);

  const step = captureValue(capture, "path/site-EA/local/step", path.steps[index]);
  if (!Number.isInteger(index) || !step || !Number.isFinite(time) || time < step.from.time || time > step.to.time)
    return captureValue(capture, "path/site-EC/return", { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/evaluate-time" });
  if (time === step.from.time) return captureValue(capture, "path/site-ED/return", { status: "COMPLETE", value: step.from.position });
  if (time === step.to.time) return captureValue(capture, "path/site-EE/return", { status: "COMPLETE", value: step.to.position });
  const theta = captureValue(capture, "path/site-EF/local/theta", (time - step.from.time) / (step.to.time - step.from.time));
  if (!(theta > 0 && theta < 1)) return captureValue(capture, "path/site-EG/return", { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "path/theta" });
  const p = captureValue(capture, "path/site-EH/local/p", {
    x: step.from.position.x + theta * (step.to.position.x - step.from.position.x),
    y: step.from.position.y + theta * (step.to.position.y - step.from.position.y),
    z: step.from.position.z + theta * (step.to.position.z - step.from.position.z),
  });
  if (!finitePosition(p)) return captureValue(capture, "path/site-FC/return", { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "path/position" });
  return captureValue(capture, "path/site-FD/return", { status: "COMPLETE", value: copyPosition(p) });
}
