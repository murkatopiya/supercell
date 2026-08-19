/**
 * Clamp wall-frame dt for perceptual animation that must not advance
 * laboratory time. Not pause-aware and not Simulation elapsed.
 */
const MAX_VISUAL_WALL_DELTA = 0.25;

export function visualAirflowElapsedFromWall(wallFrameDt: number): number {
  if (!Number.isFinite(wallFrameDt) || wallFrameDt < 0) {
    throw new Error("wallFrameDt must be finite and >= 0");
  }
  return Math.min(wallFrameDt, MAX_VISUAL_WALL_DELTA);
}
