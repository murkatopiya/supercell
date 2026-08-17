import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";

export interface VerticalEnvelopeDowndraftFieldParams {
  /** World east coordinate of the downdraft axis. Units: m */
  centerX: number;
  /** World south coordinate of the downdraft axis. Units: m */
  centerZ: number;
  /**
   * Global max of |Vy|, attained at axis and y_mid.
   * Units: m/s; must be > 0. Actual Vy is negative.
   */
  peakDownwardVelocity: number;
  /** Gaussian horizontal scale in exp(-r²/(2σ²)). Units: m; must be > 0 */
  sigma: number;
  /** World +Y of the lower lid. Units: m */
  baseHeight: number;
  /** World +Y of the upper lid. Units: m; must be > baseHeight */
  topHeight: number;
}

export class VerticalEnvelopeDowndraftFieldError extends Error {
  readonly name = "VerticalEnvelopeDowndraftFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new VerticalEnvelopeDowndraftFieldError(`${label} must be finite`);
  }
}

/**
 * Height-dependent Gaussian downdraft with a half-sine vertical envelope
 * (docs/physics/20-vertical-downdraft-envelope.md).
 * Independent prescribed operand; not a signed updraft, return branch,
 * continuity solver, or ground-collision engine.
 *
 * E_r(r) = exp(-r² / (2 * sigma²))
 * F(y)   = sin(π (y - baseHeight) / H) on [baseHeight, topHeight], else 0
 * V      = (0, -D0 * E_r * F, 0)
 */
export class VerticalEnvelopeDowndraftField implements VelocityField {
  private readonly centerX: number;
  private readonly centerZ: number;
  private readonly peakDownwardVelocity: number;
  private readonly sigma: number;
  private readonly baseHeight: number;
  private readonly topHeight: number;
  private readonly heightSpan: number;

  constructor(params: VerticalEnvelopeDowndraftFieldParams) {
    assertFinite(params.centerX, "centerX");
    assertFinite(params.centerZ, "centerZ");
    assertFinite(params.peakDownwardVelocity, "peakDownwardVelocity");
    assertFinite(params.sigma, "sigma");
    assertFinite(params.baseHeight, "baseHeight");
    assertFinite(params.topHeight, "topHeight");

    if (params.sigma <= 0) {
      throw new VerticalEnvelopeDowndraftFieldError("sigma must be > 0");
    }
    if (params.peakDownwardVelocity <= 0) {
      throw new VerticalEnvelopeDowndraftFieldError(
        "peakDownwardVelocity must be > 0",
      );
    }
    if (params.topHeight <= params.baseHeight) {
      throw new VerticalEnvelopeDowndraftFieldError(
        "topHeight must be > baseHeight",
      );
    }

    this.centerX = params.centerX;
    this.centerZ = params.centerZ;
    this.peakDownwardVelocity = params.peakDownwardVelocity;
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
    const vy =
      -this.peakDownwardVelocity * radialEnvelope * verticalEnvelope;

    return { x: 0, y: vy, z: 0 };
  }
}
