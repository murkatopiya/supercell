import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";

export interface RotationFieldParams {
  /** World east coordinate of the rotation axis. Units: m */
  centerX: number;
  /** World south coordinate of the rotation axis. Units: m */
  centerZ: number;
  /**
   * Angular velocity about +Y on the axis (right-hand rule).
   * Sign sets rotation sense; zero is allowed. Units: rad/s
   */
  angularVelocity: number;
  /** Gaussian horizontal scale in exp(-r²/(2σ²)). Units: m; must be > 0 */
  sigma: number;
}

export class RotationFieldError extends Error {
  readonly name = "RotationFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RotationFieldError(`${label} must be finite`);
  }
}

/**
 * Controlled Gaussian-modulated solid-body rotation about a vertical axis
 * (docs/physics/13-rotation-field.md).
 * Not a realistic mesocyclone or tornado model.
 *
 * v_theta(r) = Ω * r * exp(-r² / (2 * sigma²))
 * Vx = Ω * E * dz, Vy = 0, Vz = -Ω * E * dx
 */
export class RotationField implements VelocityField {
  private readonly centerX: number;
  private readonly centerZ: number;
  private readonly angularVelocity: number;
  private readonly sigma: number;

  constructor(params: RotationFieldParams) {
    assertFinite(params.centerX, "centerX");
    assertFinite(params.centerZ, "centerZ");
    assertFinite(params.angularVelocity, "angularVelocity");
    assertFinite(params.sigma, "sigma");

    if (params.sigma <= 0) {
      throw new RotationFieldError("sigma must be > 0");
    }

    this.centerX = params.centerX;
    this.centerZ = params.centerZ;
    this.angularVelocity = params.angularVelocity;
    this.sigma = params.sigma;
  }

  sample(position: Vec3, _time: number): Vec3 {
    const dx = position.x - this.centerX;
    const dz = position.z - this.centerZ;
    const r2 = dx * dx + dz * dz;
    const envelope = Math.exp(-r2 / (2 * this.sigma * this.sigma));
    const omegaEff = this.angularVelocity * envelope;

    // +0 canonicalizes IEEE-754 signed zero from a negated zero offset.
    return {
      x: omegaEff * dz + 0,
      y: 0,
      z: -omegaEff * dx + 0,
    };
  }
}
