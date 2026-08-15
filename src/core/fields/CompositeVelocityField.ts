import type { Vec3 } from "../math/Vec3.js";
import type { VelocityField } from "./VelocityField.js";

export class CompositeVelocityFieldError extends Error {
  readonly name = "CompositeVelocityFieldError";
}

/**
 * Generic world-space sum of VelocityField operands
 * (docs/physics/12-composite-velocity-field.md).
 *
 * Mathematical composition only — not mass-consistent storm physics.
 */
export class CompositeVelocityField implements VelocityField {
  private readonly fields: readonly VelocityField[];

  constructor(fields: readonly VelocityField[]) {
    if (fields.length === 0) {
      throw new CompositeVelocityFieldError(
        "CompositeVelocityField requires at least one field",
      );
    }

    this.fields = fields.slice();
  }

  sample(position: Vec3, time: number): Vec3 {
    let x = 0;
    let y = 0;
    let z = 0;

    for (const field of this.fields) {
      const velocity = field.sample(position, time);
      x += velocity.x;
      y += velocity.y;
      z += velocity.z;
    }

    return { x, y, z };
  }
}
