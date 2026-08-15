/**
 * Pure fixed-step accumulator: simulation elapsed → how many steps to run.
 *
 * Does not clamp wall time, apply pause, or timeScale — that belongs to
 * runtime orchestration / simulationElapsedFromWall.
 * Caller runs simulation.step(timestep) `steps` times.
 */
export function consumeFixedTimesteps(
  previousAccumulator: number,
  simulationElapsed: number,
  timestep: number,
): { steps: number; accumulator: number } {
  if (!(timestep > 0) || !Number.isFinite(timestep)) {
    throw new Error("timestep must be finite and > 0");
  }
  if (!Number.isFinite(previousAccumulator) || previousAccumulator < 0) {
    throw new Error("previousAccumulator must be finite and >= 0");
  }
  if (!Number.isFinite(simulationElapsed) || simulationElapsed < 0) {
    throw new Error("simulationElapsed must be finite and >= 0");
  }

  let accumulator = previousAccumulator + simulationElapsed;
  let steps = 0;

  while (accumulator >= timestep) {
    accumulator -= timestep;
    steps += 1;
  }

  return { steps, accumulator };
}
