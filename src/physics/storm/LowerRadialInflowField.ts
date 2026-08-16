import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";

export interface LowerRadialInflowFieldParams {
  /** World east coordinate of the inflow axis. Units: m */
  centerX: number;
  /** World south coordinate of the inflow axis. Units: m */
  centerZ: number;
  /**
   * Near-axis radial strain coefficient in v_r = -A r E G.
   * Strictly inward; must be > 0. Units: 1/s
   */
  radialStrainRate: number;
  /** Gaussian horizontal scale in exp(-r²/(2σ²)). Units: m; must be > 0 */
  sigma: number;
  /**
   * World +Y below which G = 1 and above which the taper begins.
   * Units: m
   */
  baseHeight: number;
  /**
   * World +Y at which G = 0; inflow is zero at and above this height.
   * Units: m; must be > baseHeight
   */
  topHeight: number;
}

export class LowerRadialInflowFieldError extends Error {
  readonly name = "LowerRadialInflowFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new LowerRadialInflowFieldError(`${label} must be finite`);
  }
}

/**
 * Controlled Gaussian-modulated linear inflow with a lower plateau and
 * a quarter-cosine upper taper (docs/physics/17-lower-radial-inflow-field.md).
 * Not a boundary-layer model, continuity solver, or mass-consistent inflow.
 *
 * E(r) = exp(-r² / (2 * sigma²))
 * G(y) = 1                         for y ≤ baseHeight
 * G(y) = cos(π (y - baseHeight) / (2 H))  for baseHeight < y < topHeight
 * G(y) = 0                         for y ≥ topHeight
 * Vx = -A * E * dx * G, Vy = 0, Vz = -A * E * dz * G
 */
export class LowerRadialInflowField implements VelocityField {
  private readonly centerX: number;
  private readonly centerZ: number;
  private readonly radialStrainRate: number;
  private readonly sigma: number;
  private readonly baseHeight: number;
  private readonly topHeight: number;
  private readonly heightSpan: number;

  constructor(params: LowerRadialInflowFieldParams) {
    assertFinite(params.centerX, "centerX");
    assertFinite(params.centerZ, "centerZ");
    assertFinite(params.radialStrainRate, "radialStrainRate");
    assertFinite(params.sigma, "sigma");
    assertFinite(params.baseHeight, "baseHeight");
    assertFinite(params.topHeight, "topHeight");

    if (params.sigma <= 0) {
      throw new LowerRadialInflowFieldError("sigma must be > 0");
    }
    if (params.radialStrainRate <= 0) {
      throw new LowerRadialInflowFieldError("radialStrainRate must be > 0");
    }
    if (params.topHeight <= params.baseHeight) {
      throw new LowerRadialInflowFieldError("topHeight must be > baseHeight");
    }

    this.centerX = params.centerX;
    this.centerZ = params.centerZ;
    this.radialStrainRate = params.radialStrainRate;
    this.sigma = params.sigma;
    this.baseHeight = params.baseHeight;
    this.topHeight = params.topHeight;
    this.heightSpan = params.topHeight - params.baseHeight;
  }

  sample(position: Vec3, _time: number): Vec3 {
    if (position.y >= this.topHeight) {
      return { x: 0, y: 0, z: 0 };
    }

    const dx = position.x - this.centerX;
    const dz = position.z - this.centerZ;
    const r2 = dx * dx + dz * dz;
    const radialEnvelope = Math.exp(-r2 / (2 * this.sigma * this.sigma));

    let verticalEnvelope = 1;
    if (position.y > this.baseHeight) {
      const xi = (position.y - this.baseHeight) / this.heightSpan;
      verticalEnvelope = Math.cos((Math.PI * xi) / 2);
    }

    const strainEff = this.radialStrainRate * radialEnvelope * verticalEnvelope;

    // +0 canonicalizes IEEE-754 signed zero from a negated zero offset.
    return {
      x: -strainEff * dx + 0,
      y: 0,
      z: -strainEff * dz + 0,
    };
  }
}
