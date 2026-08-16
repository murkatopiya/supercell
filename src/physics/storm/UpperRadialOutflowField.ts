import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";

export interface UpperRadialOutflowFieldParams {
  /** World east coordinate of the outflow axis. Units: m */
  centerX: number;
  /** World south coordinate of the outflow axis. Units: m */
  centerZ: number;
  /**
   * Near-axis radial strain coefficient in v_r = +A r E G.
   * Strictly outward; must be > 0. Units: 1/s
   */
  outflowStrainRate: number;
  /** Gaussian horizontal scale in exp(-r²/(2σ²)). Units: m; must be > 0 */
  sigma: number;
  /** World +Y of the lower lid. Units: m */
  baseHeight: number;
  /** World +Y of the upper lid. Units: m; must be > baseHeight */
  topHeight: number;
}

export class UpperRadialOutflowFieldError extends Error {
  readonly name = "UpperRadialOutflowFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new UpperRadialOutflowFieldError(`${label} must be finite`);
  }
}

/**
 * Controlled Gaussian-modulated linear outflow, localized by a half-sine
 * vertical envelope (docs/physics/16-upper-radial-outflow-field.md).
 * Not an anvil, continuity solver, or mass-consistent storm outflow.
 *
 * E(r) = exp(-r² / (2 * sigma²))
 * G(y) = sin(π (y - baseHeight) / H) on [baseHeight, topHeight], else 0
 * Vx = +A * E * dx * G, Vy = 0, Vz = +A * E * dz * G
 */
export class UpperRadialOutflowField implements VelocityField {
  private readonly centerX: number;
  private readonly centerZ: number;
  private readonly outflowStrainRate: number;
  private readonly sigma: number;
  private readonly baseHeight: number;
  private readonly topHeight: number;
  private readonly heightSpan: number;

  constructor(params: UpperRadialOutflowFieldParams) {
    assertFinite(params.centerX, "centerX");
    assertFinite(params.centerZ, "centerZ");
    assertFinite(params.outflowStrainRate, "outflowStrainRate");
    assertFinite(params.sigma, "sigma");
    assertFinite(params.baseHeight, "baseHeight");
    assertFinite(params.topHeight, "topHeight");

    if (params.sigma <= 0) {
      throw new UpperRadialOutflowFieldError("sigma must be > 0");
    }
    if (params.outflowStrainRate <= 0) {
      throw new UpperRadialOutflowFieldError("outflowStrainRate must be > 0");
    }
    if (params.topHeight <= params.baseHeight) {
      throw new UpperRadialOutflowFieldError("topHeight must be > baseHeight");
    }

    this.centerX = params.centerX;
    this.centerZ = params.centerZ;
    this.outflowStrainRate = params.outflowStrainRate;
    this.sigma = params.sigma;
    this.baseHeight = params.baseHeight;
    this.topHeight = params.topHeight;
    this.heightSpan = params.topHeight - params.baseHeight;
  }

  sample(position: Vec3, _time: number): Vec3 {
    if (position.y < this.baseHeight || position.y > this.topHeight) {
      return { x: 0, y: 0, z: 0 };
    }

    const dx = position.x - this.centerX;
    const dz = position.z - this.centerZ;
    const r2 = dx * dx + dz * dz;
    const radialEnvelope = Math.exp(-r2 / (2 * this.sigma * this.sigma));
    const xi = (position.y - this.baseHeight) / this.heightSpan;
    const verticalEnvelope = Math.sin(Math.PI * xi);
    const strainEff = this.outflowStrainRate * radialEnvelope * verticalEnvelope;

    // +0 canonicalizes IEEE-754 signed zero from a scaled zero offset.
    return {
      x: strainEff * dx + 0,
      y: 0,
      z: strainEff * dz + 0,
    };
  }
}
