import type { Vec3 } from "../math/Vec3.js";
import type { VelocityField } from "../fields/VelocityField.js";

export interface Integrator {
  step(
    position: Vec3,
    time: number,
    dt: number,
    field: VelocityField,
  ): Vec3;
}
