import type { VisualAirflowPopulation } from "./VisualAirflowPopulation.js";

/**
 * One perceptual advection step on a frozen laboratory time.
 * Does not touch the scientific clock or tracers.
 * `frozenTime` must be t_pause for every step.
 */
export function stepVisualAirflowOnFrozenField(
  population: VisualAirflowPopulation,
  dt: number,
  frozenTime: number,
): void {
  population.step(dt, frozenTime);
}
