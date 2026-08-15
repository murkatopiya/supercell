import type { Vec3 } from "../math/Vec3.js";
import type { VelocityField } from "../fields/VelocityField.js";
import type { Integrator } from "./Integrator.js";

/** Explicit midpoint RK2. Temporary choice for curved-field validation; not an ADR. */
export class RK2Integrator implements Integrator {
  step(
    position: Vec3,
    time: number,
    dt: number,
    field: VelocityField,
  ): Vec3 {
    const v1 = field.sample(position, time);
    const midpoint = {
      x: position.x + v1.x * (dt / 2),
      y: position.y + v1.y * (dt / 2),
      z: position.z + v1.z * (dt / 2),
    };
    const v2 = field.sample(midpoint, time + dt / 2);
    return {
      x: position.x + v2.x * dt,
      y: position.y + v2.y * dt,
      z: position.z + v2.z * dt,
    };
  }
}
