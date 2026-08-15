import type { VelocityField } from "../../core/fields/VelocityField.js";
import { atmosphericVelocityToWorld } from "../../core/math/AtmosphericVelocity.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import type { EnvironmentalWindProfile } from "./EnvironmentalWindProfile.js";

export class EnvironmentalWindField implements VelocityField {
  constructor(private readonly profile: EnvironmentalWindProfile) {}

  sample(position: Vec3, _time: number): Vec3 {
    return atmosphericVelocityToWorld(
      this.profile.sampleAtHeight(position.y),
    );
  }
}
