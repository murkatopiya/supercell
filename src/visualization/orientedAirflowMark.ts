import type { Vec3 } from "../core/math/Vec3.js";
import type { VelocityField } from "../core/fields/VelocityField.js";

/**
 * Perceptual fixture for R1/R2 baseline marks.
 * Length is not speed. docs/architecture/23-perceptual-airflow-workbench.md
 */
export const ORIENTED_AIRFLOW_MARK_LENGTH_M = 500;

/**
 * Speeds at or below this are treated as no instantaneous direction.
 * Degenerate mark: both endpoints collapse to the sample position.
 */
export const ZERO_AIRFLOW_SPEED_MPS = 1e-6;

export function unitDirectionOrZero(velocity: Vec3): Vec3 {
  const x = velocity.x;
  const y = velocity.y;
  const z = velocity.z;
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return { x: 0, y: 0, z: 0 };
  }
  const speed = Math.hypot(x, y, z);
  if (!(speed > ZERO_AIRFLOW_SPEED_MPS)) {
    return { x: 0, y: 0, z: 0 };
  }
  return { x: x / speed, y: y / speed, z: z / speed };
}

/**
 * Sample canonical field at xyz positions. Writes unit directions,
 * or (0,0,0) for zero/non-finite speed. Does not compose physics.
 */
export function writeUnitDirectionsFromField(
  field: VelocityField,
  positions: Float32Array,
  count: number,
  time: number,
  out: Float32Array,
): void {
  const needed = count * 3;
  if (positions.length < needed || out.length < needed) {
    throw new Error("direction buffers must hold count * 3 values");
  }
  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    const velocity = field.sample(
      {
        x: positions[offset]!,
        y: positions[offset + 1]!,
        z: positions[offset + 2]!,
      },
      time,
    );
    const direction = unitDirectionOrZero(velocity);
    out[offset] = direction.x;
    out[offset + 1] = direction.y;
    out[offset + 2] = direction.z;
  }
}

/**
 * Tail at P − 0.5 L d̂, head at P + 0.5 L d̂.
 * Zero direction collapses both endpoints onto P.
 * Length is the caller-supplied fixture, not |V|.
 */
export function writeOrientedMarkEndpoints(
  positions: Float32Array,
  unitDirections: Float32Array,
  count: number,
  lengthM: number,
  out: Float32Array,
): void {
  const neededIn = count * 3;
  const neededOut = count * 6;
  if (
    positions.length < neededIn ||
    unitDirections.length < neededIn ||
    out.length < neededOut
  ) {
    throw new Error("oriented-mark buffers must hold count samples");
  }
  const half = lengthM * 0.5;
  for (let i = 0; i < count; i++) {
    const src = i * 3;
    const dst = i * 6;
    const px = positions[src]!;
    const py = positions[src + 1]!;
    const pz = positions[src + 2]!;
    const dx = unitDirections[src]!;
    const dy = unitDirections[src + 1]!;
    const dz = unitDirections[src + 2]!;
    const tx = dx * half;
    const ty = dy * half;
    const tz = dz * half;
    out[dst] = px - tx;
    out[dst + 1] = py - ty;
    out[dst + 2] = pz - tz;
    out[dst + 3] = px + tx;
    out[dst + 4] = py + ty;
    out[dst + 5] = pz + tz;
  }
}
