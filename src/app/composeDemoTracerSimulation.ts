import { CompositeVelocityField } from "../core/fields/CompositeVelocityField.js";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import { createEnvironmentalWindProfile } from "../scenario/createEnvironmentalWindProfile.js";
import { createUpdraftField } from "../scenario/createUpdraftField.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { createTracersFromSeeds } from "../simulation/createTracersFromSeeds.js";
import { Simulation } from "../simulation/Simulation.js";

/**
 * Compose demo tracer Simulation from DEMO_SCENARIO:
 * EnvironmentalWindField + UpdraftField → CompositeVelocityField.
 */
export function composeDemoTracerSimulation(): Simulation {
  const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
  const environmentField = new EnvironmentalWindField(profile);
  const updraftField = createUpdraftField(DEMO_SCENARIO);
  const field = new CompositeVelocityField([environmentField, updraftField]);
  const particles = createTracersFromSeeds(DEMO_SCENARIO.simulation.tracerSeeds);
  return new Simulation(field, new EulerIntegrator(), particles);
}
