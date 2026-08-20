import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";

export interface VerticalEnvelopeRotationFieldParams {
  /** World east coordinate of the rotation axis. Units: m */
  centerX: number;
  /** World south coordinate of the rotation axis. Units: m */
  centerZ: number;
  /**
   * Angular velocity about +Y on the axis at G = 1 (right-hand rule).
   * Sign sets rotation sense; zero is allowed. Units: rad/s
   */
  angularVelocity: number;
  /** Gaussian horizontal scale in exp(-r²/(2σ²)). Units: m; must be > 0 */
  sigma: number;
  /** World +Y of the lower lid (G = 0). Units: m */
  baseHeight: number;
  /** World +Y of the upper lid (G = 0). Units: m; must be > baseHeight */
  topHeight: number;
}

export class VerticalEnvelopeRotationFieldError extends Error {
  readonly name = "VerticalEnvelopeRotationFieldError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new VerticalEnvelopeRotationFieldError(`${label} must be finite`);
  }
}

/**
 * Height-localized Gaussian-modulated solid-body rotation
 * (docs/physics/18-vertical-rotation-envelope.md).
 * Not a mesocyclone, tilting, or environmental-vorticity-derived rotation.
 *
 * E(r) = exp(-r² / (2 * sigma²))
 * G(y) = sin(π (y - baseHeight) / H) on [baseHeight, topHeight], else 0
 * Vx = Ω * E * G * dz, Vy = 0, Vz = -Ω * E * G * dx
 */
export class VerticalEnvelopeRotationField implements VelocityField {
  private readonly centerX: number;
  private readonly centerZ: number;
  private readonly angularVelocity: number;
  private readonly sigma: number;
  private readonly baseHeight: number;
  private readonly topHeight: number;
  private readonly heightSpan: number;

  constructor(params: VerticalEnvelopeRotationFieldParams) {
    assertFinite(params.centerX, "centerX");
    assertFinite(params.centerZ, "centerZ");
    assertFinite(params.angularVelocity, "angularVelocity");
    assertFinite(params.sigma, "sigma");
    assertFinite(params.baseHeight, "baseHeight");
    assertFinite(params.topHeight, "topHeight");

    if (params.sigma <= 0) {
      throw new VerticalEnvelopeRotationFieldError("sigma must be > 0");
    }
    if (params.topHeight <= params.baseHeight) {
      throw new VerticalEnvelopeRotationFieldError(
        "topHeight must be > baseHeight",
      );
    }

    this.centerX = params.centerX;
    this.centerZ = params.centerZ;
    this.angularVelocity = params.angularVelocity;
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
    const omegaEff = this.angularVelocity * radialEnvelope * verticalEnvelope;

    // +0 canonicalizes IEEE-754 signed zero from a negated zero offset.
    return {
      x: omegaEff * dz + 0,
      y: 0,
      z: -omegaEff * dx + 0,
    };
  }

  /**
   * Analytic world-vertical vorticity ω_y of this field.
   * Same Ω, σ, center, and G(y) as sample.
   * Accepts laboratory time; the current envelope is Eulerian-steady.
   * Units: 1/s. Signed scalar.
   *
   * ω_y = 2 Ω G E (1 − r² / (2 σ²))
   * E = exp(−r² / (2 σ²))
   *
   * On and outside [baseHeight, topHeight], G = 0 ⇒ ω_y = +0.
   * Not a VelocityField.curl / vorticity API.
   * docs/physics/23-diagnostic-vertical-vorticity.md
   */
  worldVerticalVorticity(position: Vec3, time: number): number {
    assertFinite(position.x, "position.x");
    assertFinite(position.y, "position.y");
    assertFinite(position.z, "position.z");
    assertFinite(time, "time");

    // Closed interval: G(y_b)=G(y_t)=0 exactly. Do not use sin(π),
    // which is a tiny IEEE residual and would leak fake vorticity.
    if (position.y <= this.baseHeight || position.y >= this.topHeight) {
      return 0;
    }

    const dx = position.x - this.centerX;
    const dz = position.z - this.centerZ;
    const r2 = dx * dx + dz * dz;
    const sigma2 = this.sigma * this.sigma;
    const radialEnvelope = Math.exp(-r2 / (2 * sigma2));
    const xi = (position.y - this.baseHeight) / this.heightSpan;
    const verticalEnvelope = Math.sin(Math.PI * xi);

    // +0 canonicalizes IEEE-754 signed zero (Ω < 0 on the zero ring).
    return (
      2 *
        this.angularVelocity *
        verticalEnvelope *
        radialEnvelope *
        (1 - r2 / (2 * sigma2)) +
      0
    );
  }
}
