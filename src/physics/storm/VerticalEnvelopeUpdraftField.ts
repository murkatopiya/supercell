import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";

export interface VerticalEnvelopeUpdraftFieldParams {
  /** World east coordinate of the updraft axis. Units: m */
  centerX: number;
  /** World south coordinate of the updraft axis. Units: m */
  centerZ: number;
  /** Global max vertical velocity, attained at axis and y_mid. Units: m/s; must be > 0 */
  peakVerticalVelocity: number;
  /** Gaussian horizontal scale in exp(-r²/(2σ²)). Units: m; must be > 0 */
  sigma: number;
  /** World +Y of the lower lid. Units: m */
  baseHeight: number;
  /** World +Y of the upper lid. Units: m; must be > baseHeight */
  topHeight: number;
}

export class VerticalEnvelopeUpdraftFieldError extends Error {
  readonly name = "VerticalEnvelopeUpdraftFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new VerticalEnvelopeUpdraftFieldError(`${label} must be finite`);
  }
}

/**
 * Height-dependent Gaussian updraft with a half-sine vertical envelope
 * (docs/physics/15-vertical-updraft-envelope.md).
 * Not a mass-consistent supercell or a continuity solver.
 *
 * E_r(r) = exp(-r² / (2 * sigma²))
 * F(y)   = sin(π (y - baseHeight) / H) on [baseHeight, topHeight], else 0
 * V      = (0, W0 * E_r * F, 0)
 */
export class VerticalEnvelopeUpdraftField implements VelocityField {
  private readonly centerX: number;
  private readonly centerZ: number;
  private readonly peakVerticalVelocity: number;
  private readonly sigma: number;
  private readonly baseHeight: number;
  private readonly topHeight: number;
  private readonly heightSpan: number;

  constructor(params: VerticalEnvelopeUpdraftFieldParams) {
    assertFinite(params.centerX, "centerX");
    assertFinite(params.centerZ, "centerZ");
    assertFinite(params.peakVerticalVelocity, "peakVerticalVelocity");
    assertFinite(params.sigma, "sigma");
    assertFinite(params.baseHeight, "baseHeight");
    assertFinite(params.topHeight, "topHeight");

    if (params.sigma <= 0) {
      throw new VerticalEnvelopeUpdraftFieldError("sigma must be > 0");
    }
    if (params.peakVerticalVelocity <= 0) {
      throw new VerticalEnvelopeUpdraftFieldError(
        "peakVerticalVelocity must be > 0",
      );
    }
    if (params.topHeight <= params.baseHeight) {
      throw new VerticalEnvelopeUpdraftFieldError(
        "topHeight must be > baseHeight",
      );
    }

    this.centerX = params.centerX;
    this.centerZ = params.centerZ;
    this.peakVerticalVelocity = params.peakVerticalVelocity;
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
    const w = this.peakVerticalVelocity * radialEnvelope * verticalEnvelope;

    return { x: 0, y: w, z: 0 };
  }
}
