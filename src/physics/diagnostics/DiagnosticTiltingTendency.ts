import type { Vec3 } from "../../core/math/Vec3.js";
import type { EnvironmentalWindProfile } from "../environment/EnvironmentalWindProfile.js";
import {
  horizontalVorticityFromShear,
  type HorizontalVorticity,
} from "../environment/horizontalVorticity.js";
import { verticalWindShearBetween } from "../environment/verticalWindShear.js";
import type { VerticalEnvelopeUpdraftField } from "../storm/VerticalEnvelopeUpdraftField.js";

export class DiagnosticTiltingTendencyError extends Error {
  readonly name = "DiagnosticTiltingTendencyError";
}

/**
 * World-horizontal vorticity on the project triad.
 * omegaX along +X East, omegaZ along +Z South. Units: 1/s.
 * docs/physics/22-diagnostic-tilting-tendency.md §6
 */
export interface WorldHorizontalVorticity {
  readonly omegaX: number;
  readonly omegaZ: number;
}

/**
 * Piecewise-linear sounding segment that contains a height,
 * or null outside [minHeight, maxHeight].
 * docs/architecture/26-diagnostic-tilting-tendency-architecture.md §6.1
 */
export interface EnvironmentalSoundingSegment {
  readonly hLo: number;
  readonly hHi: number;
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new DiagnosticTiltingTendencyError(`${label} must be finite`);
  }
}

/**
 * Atmospheric east/north ω_h → world (ω_x, ω_z).
 *
 * omegaX = omegaEastward
 * omegaZ = −omegaNorthward
 *
 * Does not change horizontalVorticityFromShear.
 * Not a hodograph screen transform.
 */
export function worldHorizontalVorticityFromAtmospheric(
  vorticity: HorizontalVorticity,
): WorldHorizontalVorticity {
  return {
    omegaX: vorticity.omegaEastward,
    // 0 - x avoids IEEE signed zero from unary minus on +0
    omegaZ: 0 - vorticity.omegaNorthward,
  };
}

/**
 * Half-open interior segments [h_i, h_{i+1}); last segment [h_{n-1}, h_n].
 * Interior knots select the upper segment. No clamp, no extrapolation.
 */
export function soundingSegmentContainingHeight(
  profile: EnvironmentalWindProfile,
  height: number,
): EnvironmentalSoundingSegment | null {
  assertFinite(height, "height");

  const heights = profile.levelHeights();
  const minHeight = heights[0]!;
  const maxHeight = heights[heights.length - 1]!;

  if (height < minHeight || height > maxHeight) {
    return null;
  }

  const lastIndex = heights.length - 1;
  for (let i = 0; i < lastIndex - 1; i++) {
    const hLo = heights[i]!;
    const hHi = heights[i + 1]!;
    if (height >= hLo && height < hHi) {
      return { hLo, hHi };
    }
  }

  return {
    hLo: heights[lastIndex - 1]!,
    hHi: heights[lastIndex]!,
  };
}

export interface DiagnosticTiltingTendencyParams {
  readonly profile: EnvironmentalWindProfile;
  readonly updraft: VerticalEnvelopeUpdraftField;
}

/**
 * Eulerian diagnostic tilting tendency of world-vertical vorticity.
 *
 * T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z   [s⁻²]
 *
 * Observes the injected environmental profile and updraft.
 * Not a VelocityField. No clock, no tracers, no Inspector payload.
 * docs/physics/22-diagnostic-tilting-tendency.md
 * docs/architecture/26-diagnostic-tilting-tendency-architecture.md
 */
export class DiagnosticTiltingTendency {
  readonly profile: EnvironmentalWindProfile;
  readonly updraft: VerticalEnvelopeUpdraftField;

  constructor(params: DiagnosticTiltingTendencyParams) {
    this.profile = params.profile;
    this.updraft = params.updraft;
  }

  /**
   * Signed T_tilt,y at world P and laboratory time t. Units: s⁻².
   * Forwards t to the updraft gradient. Does not own a clock.
   */
  sample(position: Vec3, time: number): number {
    assertFinite(position.x, "position.x");
    assertFinite(position.y, "position.y");
    assertFinite(position.z, "position.z");
    assertFinite(time, "time");

    const segment = soundingSegmentContainingHeight(
      this.profile,
      position.y,
    );
    const gradient = this.updraft.horizontalGradientOfVerticalVelocity(
      position,
      time,
    );

    if (segment === null) {
      return 0;
    }

    const shear = verticalWindShearBetween(
      this.profile,
      segment.hLo,
      segment.hHi,
    );
    const world = worldHorizontalVorticityFromAtmospheric(
      horizontalVorticityFromShear(shear),
    );
    const tiltingTendency =
      world.omegaX * gradient.dVyDx + world.omegaZ * gradient.dVyDz;
    return tiltingTendency === 0 ? 0 : tiltingTendency;
  }
}
