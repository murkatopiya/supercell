import type { Vec3 } from "../../core/math/Vec3.js";
import type { VerticalEnvelopeRotationField } from "../storm/VerticalEnvelopeRotationField.js";

export class DiagnosticVerticalVorticityError extends Error {
  readonly name = "DiagnosticVerticalVorticityError";
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new DiagnosticVerticalVorticityError(`${label} must be finite`);
  }
}

export interface DiagnosticVerticalVorticityParams {
  readonly rotation: VerticalEnvelopeRotationField;
}

/**
 * Eulerian diagnostic current world-vertical vorticity of V_total.
 *
 * ω_y,current(P, t) := (∇ × V_total)_y   [s⁻¹]
 *
 * v1 evaluates that total by the analytic rotation contribution
 * (CURRENT STACK IDENTITY, not a universal law):
 *   sample(P, t) → rotation.worldVerticalVorticity(P, t)
 *
 * Observes the injected live VerticalEnvelopeRotationField.
 * Not a VelocityField. No clock, no tracers, no Inspector payload.
 * docs/physics/23-diagnostic-vertical-vorticity.md
 * docs/architecture/28-diagnostic-vertical-vorticity-architecture.md
 */
export class DiagnosticVerticalVorticity {
  readonly rotation: VerticalEnvelopeRotationField;

  constructor(params: DiagnosticVerticalVorticityParams) {
    this.rotation = params.rotation;
  }

  /**
   * Signed ω_y,current at world P and laboratory time t. Units: s⁻¹.
   * Forwards t to the rotation analytic method. Does not own a clock.
   */
  sample(position: Vec3, time: number): number {
    assertFinite(position.x, "position.x");
    assertFinite(position.y, "position.y");
    assertFinite(position.z, "position.z");
    assertFinite(time, "time");
    return this.rotation.worldVerticalVorticity(position, time);
  }
}
