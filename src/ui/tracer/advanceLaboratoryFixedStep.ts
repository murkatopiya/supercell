import type { Simulation } from "../../simulation/Simulation.js";
import type { TracerPathHistory } from "../../simulation/TracerPathHistory.js";
import type { VisualAirflowPopulation } from "../../visualization/VisualAirflowPopulation.js";

export interface AdvanceLaboratoryFixedStepOptions {
  pathHistory?: TracerPathHistory | null;
  visualAirflowPopulation?: VisualAirflowPopulation | null;
}

/**
 * One consumed fixed step of the live laboratory.
 *
 * Captures pre-step clock time, advances scientific Simulation, then
 * steps the Explore visual population with the same dt and that time.
 * Does not apply timeScale. Caller decides how many steps to consume.
 */
export function advanceLaboratoryFixedStep(
  simulation: Simulation,
  dt: number,
  options: AdvanceLaboratoryFixedStepOptions = {},
): void {
  const t0 = simulation.clock.time;
  simulation.step(dt);
  options.pathHistory?.recordAfterStep(simulation.particles);
  options.visualAirflowPopulation?.step(dt, t0);
}
