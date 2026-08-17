import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";

export interface NearGroundRadialOutflowFieldParams {
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
  /**
   * World +Y below which G = 1 and above which the taper begins.
   * Units: m
   */
  baseHeight: number;
  /**
   * World +Y at which G = 0; outflow is zero at and above this height.
   * Units: m; must be > baseHeight
   */
  topHeight: number;
}

export class NearGroundRadialOutflowFieldError extends Error {
  readonly name = "NearGroundRadialOutflowFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new NearGroundRadialOutflowFieldError(`${label} must be finite`);
  }
}

/**
 * Prescribed near-ground divergent horizontal outflow
 * (docs/physics/21-near-ground-radial-outflow.md).
 * Not a cold pool, gust front, density current, or D1 continuation.
 *
 * E(r) = exp(-r² / (2 * sigma²))
 * G(y) = 1                         for y ≤ baseHeight
 * G(y) = cos(π (y - baseHeight) / (2 H))  for baseHeight < y < topHeight
 * G(y) = 0                         for y ≥ topHeight
 * Vx = +A * E * dx * G, Vy = 0, Vz = +A * E * dz * G
 */
export class NearGroundRadialOutflowField implements VelocityField {
  private readonly centerX: number;
  private readonly centerZ: number;
  private readonly outflowStrainRate: number;
  private readonly sigma: number;
  private readonly baseHeight: number;
  private readonly topHeight: number;
  private readonly heightSpan: number;

  constructor(params: NearGroundRadialOutflowFieldParams) {
    assertFinite(params.centerX, "centerX");
    assertFinite(params.centerZ, "centerZ");
    assertFinite(params.outflowStrainRate, "outflowStrainRate");
    assertFinite(params.sigma, "sigma");
    assertFinite(params.baseHeight, "baseHeight");
    assertFinite(params.topHeight, "topHeight");

    if (params.sigma <= 0) {
      throw new NearGroundRadialOutflowFieldError("sigma must be > 0");
    }
    if (params.outflowStrainRate <= 0) {
      throw new NearGroundRadialOutflowFieldError(
        "outflowStrainRate must be > 0",
      );
    }
    if (params.topHeight <= params.baseHeight) {
      throw new NearGroundRadialOutflowFieldError(
        "topHeight must be > baseHeight",
      );
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

    const strainEff = this.outflowStrainRate * radialEnvelope * verticalEnvelope;

    // +0 canonicalizes IEEE-754 signed zero from a scaled zero offset.
    return {
      x: strainEff * dx + 0,
      y: 0,
      z: strainEff * dz + 0,
    };
  }
}
