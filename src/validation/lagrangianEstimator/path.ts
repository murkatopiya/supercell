/** Accepted linear geometry only. Never advances a simulation or queries diagnostics. */
import { createHash } from "node:crypto";
import type { AcceptedPath, PathVertex, Position, EstimatorResult } from "./types.js";

export const finitePosition = (p: Position): boolean =>
  !!p && [p.x, p.y, p.z].every(Number.isFinite);
const copyPosition = (p: Position): Position => Object.freeze({ x: p.x, y: p.y, z: p.z });

export function createAcceptedPath(input: readonly PathVertex[]): EstimatorResult<AcceptedPath> {
  if (input.length < 2) return { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/vertices" };
  for (let i = 0; i < input.length; i++) {
    const v = input[i];
    if (!v || !Number.isFinite(v.time) || !finitePosition(v.position))
      return { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/finite" };
    if (i > 0) {
      const duration = v.time - input[i - 1].time;
      if (!(duration > 0) || !Number.isFinite(duration))
        return { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/time-order" };
    }
  }
  const vertices = Object.freeze(input.map(v => Object.freeze({ time: v.time, position: copyPosition(v.position) })));
  // Fixed tuple encoding, no user object keys. JSON canonicalizes exact signed zero.
  const fingerprint = createHash("sha256").update(JSON.stringify(["accepted-linear-path/v1",
    vertices.map(v => [v.time, v.position.x, v.position.y, v.position.z])]), "utf8").digest("hex");
  const steps = Object.freeze(vertices.slice(1).map((to, index) => Object.freeze({
    pathFingerprint: fingerprint, index, from: vertices[index], to,
  })));
  return { status: "COMPLETE", value: Object.freeze({ fingerprint, vertices, steps }) };
}

/** Ordinary lookup owns an interior vertex with the following step; final vertex uses last. */
export function locateAcceptedStep(path: AcceptedPath, time: number): EstimatorResult<number> {
  if (!Number.isFinite(time) || time < path.vertices[0].time || time > path.vertices[path.vertices.length - 1].time)
    return { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/lookup-time" };
  let lo = 0, hi = path.vertices.length - 1;
  while (lo + 1 < hi) { const mid = (lo + hi) >>> 1; if (time < path.vertices[mid].time) hi = mid; else lo = mid; }
  return { status: "COMPLETE", value: Math.min(lo, path.steps.length - 1) };
}

export function positionOnStep(path: AcceptedPath, index: number, time: number): EstimatorResult<Position> {
  const step = path.steps[index];
  if (!Number.isInteger(index) || !step || !Number.isFinite(time) || time < step.from.time || time > step.to.time)
    return { status: "FAILED", code: "INVALID_TRAJECTORY", operation: "path/evaluate-time" };
  if (time === step.from.time) return { status: "COMPLETE", value: step.from.position };
  if (time === step.to.time) return { status: "COMPLETE", value: step.to.position };
  const theta = (time - step.from.time) / (step.to.time - step.from.time);
  if (!(theta > 0 && theta < 1)) return { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "path/theta" };
  const p = {
    x: step.from.position.x + theta * (step.to.position.x - step.from.position.x),
    y: step.from.position.y + theta * (step.to.position.y - step.from.position.y),
    z: step.from.position.z + theta * (step.to.position.z - step.from.position.z),
  };
  if (!finitePosition(p)) return { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "path/position" };
  return { status: "COMPLETE", value: copyPosition(p) };
}
