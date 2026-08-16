import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";

export interface RadialInflowFieldParams {
  /** World east coordinate of the inflow axis. Units: m */
  centerX: number;
  /** World south coordinate of the inflow axis. Units: m */
  centerZ: number;
  /**
   * Near-axis radial strain coefficient in v_r = -A r E.
   * Strictly inward; must be > 0. Units: 1/s
   */
  radialStrainRate: number;
  /** Gaussian horizontal scale in exp(-r²/(2σ²)). Units: m; must be > 0 */
  sigma: number;
}

export class RadialInflowFieldError extends Error {
  readonly name = "RadialInflowFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RadialInflowFieldError(`${label} must be finite`);
  }
}

/**
 * Controlled Gaussian-modulated linear inflow toward a vertical axis
 * (docs/physics/14-radial-inflow-field.md).
 * Not a mass-consistent supercell inflow or pressure-driven solver.
 *
 * v_r(r) = -A * r * exp(-r² / (2 * sigma²))
 * Vx = -A * E * dx, Vy = 0, Vz = -A * E * dz
 */
export class RadialInflowField implements VelocityField {
  private readonly centerX: number;
  private readonly centerZ: number;
  private readonly radialStrainRate: number;
  private readonly sigma: number;

  constructor(params: RadialInflowFieldParams) {
    assertFinite(params.centerX, "centerX");
    assertFinite(params.centerZ, "centerZ");
    assertFinite(params.radialStrainRate, "radialStrainRate");
    assertFinite(params.sigma, "sigma");

    if (params.sigma <= 0) {
      throw new RadialInflowFieldError("sigma must be > 0");
    }
    if (params.radialStrainRate <= 0) {
      throw new RadialInflowFieldError("radialStrainRate must be > 0");
    }

    this.centerX = params.centerX;
    this.centerZ = params.centerZ;
    this.radialStrainRate = params.radialStrainRate;
    this.sigma = params.sigma;
  }

  sample(position: Vec3, _time: number): Vec3 {
    const dx = position.x - this.centerX;
    const dz = position.z - this.centerZ;
    const r2 = dx * dx + dz * dz;
    const envelope = Math.exp(-r2 / (2 * this.sigma * this.sigma));
    const strainEff = this.radialStrainRate * envelope;

    // +0 canonicalizes IEEE-754 signed zero from a negated zero offset.
    return {
      x: -strainEff * dx + 0,
      y: 0,
      z: -strainEff * dz + 0,
    };
  }
}
