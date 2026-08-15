import type { Vec3 } from "../../core/math/Vec3.js";
import type { VelocityField } from "../../core/fields/VelocityField.js";

export class ConstantVelocityField implements VelocityField {
  constructor(private readonly velocity: Vec3) {}

  sample(_position: Vec3, _time: number): Vec3 {
    return this.velocity;
  }
}
