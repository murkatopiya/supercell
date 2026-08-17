import { EnvironmentalWindProfile } from "../physics/environment/EnvironmentalWindProfile.js";
import type { ScenarioConfig, ScenarioTracerSeed } from "./ScenarioConfig.js";

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

function assertFiniteSeeds(
  seeds: readonly ScenarioTracerSeed[],
  label: string,
): void {
  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i]!;
    assertFinite(seed.x, `${label}[${i}].x`);
    assertFinite(seed.y, `${label}[${i}].y`);
    assertFinite(seed.z, `${label}[${i}].z`);
  }
}

/**
 * Scenario-specific validation only (storm motion, timestep, seed arrays).
 * Profile level invariants are owned by EnvironmentalWindProfile.
 */
function assertScenarioOwnedFields(config: ScenarioConfig): void {
  assertFinite(config.stormMotion.eastward, "stormMotion.eastward");
  assertFinite(config.stormMotion.northward, "stormMotion.northward");

  assertFinite(config.simulation.timestep, "simulation.timestep");
  if (!(config.simulation.timestep > 0)) {
    throw new ScenarioConfigError("simulation.timestep must be > 0");
  }

  assertFiniteSeeds(config.simulation.diagnosticSeeds, "diagnosticSeeds");
  assertFiniteSeeds(config.simulation.storySeeds, "storySeeds");
  assertFiniteSeeds(
    config.simulation.downwardPathlineSeeds,
    "downwardPathlineSeeds",
  );
  assertFiniteSeeds(
    config.simulation.nearGroundOutflowPathlineSeeds,
    "nearGroundOutflowPathlineSeeds",
  );
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
