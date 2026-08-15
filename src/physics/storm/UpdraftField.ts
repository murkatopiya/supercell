import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";

export interface UpdraftFieldParams {
  /** World east coordinate of the updraft axis. Units: m */
  centerX: number;
  /** World south coordinate of the updraft axis. Units: m */
  centerZ: number;
  /** Vertical velocity on the axis. Units: m/s; must be > 0 */
  peakVerticalVelocity: number;
  /** Gaussian horizontal scale in exp(-r²/(2σ²)). Units: m; must be > 0 */
  sigma: number;
}

export class UpdraftFieldError extends Error {
  readonly name = "UpdraftFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new UpdraftFieldError(`${label} must be finite`);
  }
}

/**
 * Controlled Gaussian vertical storm mechanism (docs/physics/11-updraft-field.md).
 * Not a realistic supercell or mesocyclone model.
 *
 * w(r) = W0 * exp(-r² / (2 * sigma²))
 * V = (0, w(r), 0) in world coordinates
 */
export class UpdraftField implements VelocityField {
  private readonly centerX: number;
  private readonly centerZ: number;
  private readonly peakVerticalVelocity: number;
  private readonly sigma: number;

  constructor(params: UpdraftFieldParams) {
    assertFinite(params.centerX, "centerX");
    assertFinite(params.centerZ, "centerZ");
    assertFinite(params.peakVerticalVelocity, "peakVerticalVelocity");
    assertFinite(params.sigma, "sigma");

    if (params.sigma <= 0) {
      throw new UpdraftFieldError("sigma must be > 0");
    }
    if (params.peakVerticalVelocity <= 0) {
      throw new UpdraftFieldError("peakVerticalVelocity must be > 0");
    }

    this.centerX = params.centerX;
    this.centerZ = params.centerZ;
    this.peakVerticalVelocity = params.peakVerticalVelocity;
    this.sigma = params.sigma;
  }

  sample(position: Vec3, _time: number): Vec3 {
    const dx = position.x - this.centerX;
    const dz = position.z - this.centerZ;
    const r2 = dx * dx + dz * dz;
    const w =
      this.peakVerticalVelocity *
      Math.exp(-r2 / (2 * this.sigma * this.sigma));

    return { x: 0, y: w, z: 0 };
  }
}
