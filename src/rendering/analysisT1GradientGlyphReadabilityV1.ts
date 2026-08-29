import type { Vec3 } from "../core/math/Vec3.js";

/**
 * Visibility multiplier for prescribed ∇_h Vy glyph arrows only.
 * Applied after the shared s⁻¹→m display scale.
 * Not a physical scale. Not |∇|. Not applied to environmental ω_h.
 */
export const ANALYSIS_T1_GRADIENT_GLYPH_READABILITY_MULTIPLIER_V1 = 2;

/**
 * Stretch a display displacement for gradient-arrow readability.
 * Null (no direction) and exact-zero display stay unchanged.
 */
export function applyGradientGlyphReadabilityDisplacement(
  displacement: Vec3 | null,
): Vec3 | null {
  if (displacement === null) {
    return null;
  }
  const multiplier = ANALYSIS_T1_GRADIENT_GLYPH_READABILITY_MULTIPLIER_V1;
  return {
    x: displacement.x * multiplier,
    y: 0,
    z: displacement.z * multiplier,
  };
}
