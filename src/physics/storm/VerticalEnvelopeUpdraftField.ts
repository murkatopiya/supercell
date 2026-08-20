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

/**
 * Analytic horizontal gradient of world vertical velocity.
 * Units: 1/s. Not a Vec3; there is no dummy vertical component.
 * docs/physics/22-diagnostic-tilting-tendency.md §11
 */
export interface HorizontalGradientOfVerticalVelocity {
  /** ∂Vy/∂x. Units: 1/s */
  readonly dVyDx: number;
  /** ∂Vy/∂z. Units: 1/s */
  readonly dVyDz: number;
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

  /**
   * Analytic ∇_h Vy of this field. Same W0, σ, center, and F(y) as sample.
   * Accepts laboratory time; the current envelope is Eulerian-steady.
   * Units: 1/s.
   *
   * dVyDx = W0 F E_r (−dx / σ²)
   * dVyDz = W0 F E_r (−dz / σ²)
   *
   * Outside [baseHeight, topHeight], F = 0 ⇒ both components 0.
   * Not a VelocityField.derivative / curl API.
   */
  horizontalGradientOfVerticalVelocity(
    position: Vec3,
    time: number,
  ): HorizontalGradientOfVerticalVelocity {
    assertFinite(position.x, "position.x");
    assertFinite(position.y, "position.y");
    assertFinite(position.z, "position.z");
    assertFinite(time, "time");

    // Closed interval: F(y_b)=F(y_t)=0 exactly. Do not use sin(π),
    // which is a tiny IEEE residual and would leak a fake gradient.
    if (position.y <= this.baseHeight || position.y >= this.topHeight) {
      return { dVyDx: 0, dVyDz: 0 };
    }

    const dx = position.x - this.centerX;
    const dz = position.z - this.centerZ;
    const r2 = dx * dx + dz * dz;
    const radialEnvelope = Math.exp(-r2 / (2 * this.sigma * this.sigma));
    const xi = (position.y - this.baseHeight) / this.heightSpan;
    const verticalEnvelope = Math.sin(Math.PI * xi);
    const factor =
      this.peakVerticalVelocity * verticalEnvelope * radialEnvelope;
    const invSigma2 = 1 / (this.sigma * this.sigma);

    // 0 - x avoids IEEE signed zero from multiplying by dx/dz = 0
    return {
      dVyDx: 0 - factor * dx * invSigma2,
      dVyDz: 0 - factor * dz * invSigma2,
    };
  }
}
