import { EnvironmentalWindProfile } from "../physics/environment/EnvironmentalWindProfile.js";
import type { ScenarioConfig } from "./ScenarioConfig.js";

export class ScenarioConfigError extends Error {
  readonly name = "ScenarioConfigError";

  constructor(message: string) {
    super(message);
  }
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new ScenarioConfigError(`${label} must be finite`);
  }
}

/**
 * Scenario-specific validation only (storm motion, timestep, tracer seeds).
 * Profile level invariants are owned by EnvironmentalWindProfile.
 */
function assertScenarioOwnedFields(config: ScenarioConfig): void {
  assertFinite(config.stormMotion.eastward, "stormMotion.eastward");
  assertFinite(config.stormMotion.northward, "stormMotion.northward");

  assertFinite(config.simulation.timestep, "simulation.timestep");
  if (!(config.simulation.timestep > 0)) {
    throw new ScenarioConfigError("simulation.timestep must be > 0");
  }

  for (let i = 0; i < config.simulation.tracerSeeds.length; i++) {
    const seed = config.simulation.tracerSeeds[i]!;
    assertFinite(seed.x, `tracerSeeds[${i}].x`);
    assertFinite(seed.y, `tracerSeeds[${i}].y`);
    assertFinite(seed.z, `tracerSeeds[${i}].z`);
  }
}

/**
 * Map scenario wind levels → EnvironmentalWindProfile.
 * Inserts vertical: 0; delegates profile invariants to the profile constructor.
 */
export function createEnvironmentalWindProfile(
  config: ScenarioConfig,
): EnvironmentalWindProfile {
  assertScenarioOwnedFields(config);

  const levels = config.environment.windLevels.map((level) => ({
    height: level.height,
    velocity: {
      eastward: level.eastward,
      northward: level.northward,
      vertical: 0,
    },
  }));

  return new EnvironmentalWindProfile(levels);
}
