import type { Vec3 } from "../../core/math/Vec3.js";
import type { VelocityField } from "../../core/fields/VelocityField.js";

/**
 * Mathematical learning field: solid-body rotation about world +Y.
 * Vx = omega * z, Vy = 0, Vz = -omega * x
 * Positive omega = right-hand rule / CCW when viewed from above.
 * Not an atmospheric storm mechanism.
 */
export class SolidBodyRotationYField implements VelocityField {
  /** Angular rate about +Y; rad/s. */
  constructor(private readonly omega: number) {}

  sample(position: Vec3, _time: number): Vec3 {
    return {
      x: this.omega * position.z,
      y: 0,
      z: -this.omega * position.x,
    };
  }
}
