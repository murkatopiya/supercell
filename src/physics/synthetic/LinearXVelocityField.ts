import type { Vec3 } from "../../core/math/Vec3.js";
import type { VelocityField } from "../../core/fields/VelocityField.js";

/**
 * Mathematical learning field: Vx = k * x, Vy = 0, Vz = 0.
 * Not an atmospheric storm mechanism.
 */
export class LinearXVelocityField implements VelocityField {
  /** Stretch rate along +X; unit 1/s. */
  constructor(private readonly k: number) {}

  sample(position: Vec3, _time: number): Vec3 {
    return { x: this.k * position.x, y: 0, z: 0 };
  }
}
