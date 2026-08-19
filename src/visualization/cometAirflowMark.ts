import { cometOccupancyFade } from "./cometOccupancyFade.js";
import { ORIENTED_AIRFLOW_MARK_LENGTH_M } from "./orientedAirflowMark.js";

/**
 * Fixed perceptual comet length. Not |V|. Head at occupant P,
 * tail behind along −direction.
 */
export const COMET_AIRFLOW_LENGTH_M = ORIENTED_AIRFLOW_MARK_LENGTH_M;

/** LineSegments pieces per comet. Not a stored path. */
export const COMET_SEGMENT_COUNT = 4;

/**
 * Write tail→head polylines as LineSegments pairs.
 * Occupancy fade scales RGB. Highlight strength is unused here;
 * the renderer mixes color.
 */
export function writeCometMarkEndpoints(
  positions: Float32Array,
  unitDirections: Float32Array,
  count: number,
  lengthM: number,
  out: Float32Array,
): void {
  const verticesPerComet = COMET_SEGMENT_COUNT * 2;
  const neededOut = count * verticesPerComet * 3;
  const neededIn = count * 3;
  if (
    positions.length < neededIn ||
    unitDirections.length < neededIn ||
    out.length < neededOut
  ) {
    throw new Error("comet buffers must hold count samples");
  }
  for (let i = 0; i < count; i++) {
    const src = i * 3;
    const px = positions[src]!;
    const py = positions[src + 1]!;
    const pz = positions[src + 2]!;
    const dx = unitDirections[src]!;
    const dy = unitDirections[src + 1]!;
    const dz = unitDirections[src + 2]!;
    const base = i * verticesPerComet * 3;
    for (let s = 0; s < COMET_SEGMENT_COUNT; s++) {
      const t0 = s / COMET_SEGMENT_COUNT;
      const t1 = (s + 1) / COMET_SEGMENT_COUNT;
      writeCometPoint(out, base + s * 6, px, py, pz, dx, dy, dz, lengthM, t0);
      writeCometPoint(out, base + s * 6 + 3, px, py, pz, dx, dy, dz, lengthM, t1);
    }
  }
}

export function cometFadeFromAges(
  ages: Float32Array,
  count: number,
  maxAge: number,
  out: Float32Array,
): void {
  if (ages.length < count || out.length < count) {
    throw new Error("fade buffers must hold count values");
  }
  for (let i = 0; i < count; i++) {
    out[i] = cometOccupancyFade(ages[i]!, maxAge);
  }
}

function writeCometPoint(
  out: Float32Array,
  offset: number,
  px: number,
  py: number,
  pz: number,
  dx: number,
  dy: number,
  dz: number,
  lengthM: number,
  tHeadward: number,
): void {
  const behind = (1 - tHeadward) * lengthM;
  out[offset] = px - dx * behind;
  out[offset + 1] = py - dy * behind;
  out[offset + 2] = pz - dz * behind;
}
