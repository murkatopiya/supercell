import type { VelocityField } from "../../core/fields/VelocityField.js";
import {
  atmosphericVelocityToWorld,
  worldVelocityToAtmospheric,
} from "../../core/math/AtmosphericVelocity.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import { EnvironmentalWindField } from "./EnvironmentalWindField.js";
import {
  type StormMotion,
  stormRelativeWind,
} from "./stormRelativeWind.js";

export class StormRelativeEnvironmentalAdvectionFieldError extends Error {
  readonly name = "StormRelativeEnvironmentalAdvectionFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new StormRelativeEnvironmentalAdvectionFieldError(
      `${label} must be finite`,
    );
  }
}

/**
 * D2 environmental advection adapter
 * (docs/physics/19-storm-relative-environmental-advection.md):
 * V_env_sr = V_env_ground − C (horizontal only).
 *
 * Wraps ground-relative EnvironmentalWindField. Does not mutate it,
 * does not sample the profile itself, and does not know storm fields.
 */
export class StormRelativeEnvironmentalAdvectionField implements VelocityField {
  private readonly environmentalField: EnvironmentalWindField;
  private readonly stormMotion: StormMotion;

  constructor(
    environmentalField: EnvironmentalWindField,
    stormMotion: StormMotion,
  ) {
    assertFinite(stormMotion.eastward, "stormMotion.eastward");
    assertFinite(stormMotion.northward, "stormMotion.northward");

    this.environmentalField = environmentalField;
    this.stormMotion = {
      eastward: stormMotion.eastward,
      northward: stormMotion.northward,
    };
  }

  sample(position: Vec3, time: number): Vec3 {
    const groundWorld = this.environmentalField.sample(position, time);
    return atmosphericVelocityToWorld(
      stormRelativeWind(
        worldVelocityToAtmospheric(groundWorld),
        this.stormMotion,
      ),
    );
  }
}
