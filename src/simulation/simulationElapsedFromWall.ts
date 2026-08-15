export interface SimulationElapsedFromWallOptions {
  paused: boolean;
  timeScale: number;
  /** Spiral guard on wall seconds only (before timeScale). */
  maxWallDelta?: number;
}

const DEFAULT_MAX_WALL_DELTA = 0.25;

/**
 * Convert wall-frame dt into simulation elapsed for the fixed-step accumulator.
 * Pause → 0. Wall clamp happens here; timeScale multiplies after clamp.
 */
export function simulationElapsedFromWall(
  wallFrameDt: number,
  options: SimulationElapsedFromWallOptions,
): number {
  const { paused, timeScale, maxWallDelta = DEFAULT_MAX_WALL_DELTA } = options;

  if (!Number.isFinite(wallFrameDt) || wallFrameDt < 0) {
    throw new Error("wallFrameDt must be finite and >= 0");
  }
  if (!(maxWallDelta > 0) || !Number.isFinite(maxWallDelta)) {
    throw new Error("maxWallDelta must be finite and > 0");
  }
  if (!(timeScale > 0) || !Number.isFinite(timeScale)) {
    throw new Error("timeScale must be finite and > 0");
  }

  if (paused) {
    return 0;
  }

  const clampedWall = Math.min(wallFrameDt, maxWallDelta);
  return clampedWall * timeScale;
}
