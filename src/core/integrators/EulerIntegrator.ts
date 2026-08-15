import type { Vec3 } from "../math/Vec3.js";
import type { VelocityField } from "../fields/VelocityField.js";
import type { Integrator } from "./Integrator.js";

export class EulerIntegrator implements Integrator {
  step(
    position: Vec3,
    time: number,
    dt: number,
    field: VelocityField,
  ): Vec3 {
    const velocity = field.sample(position, time);
    return {
      x: position.x + velocity.x * dt,
      y: position.y + velocity.y * dt,
      z: position.z + velocity.z * dt,
    };
  }
}
