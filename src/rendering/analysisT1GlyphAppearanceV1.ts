import type { TrajectoryTiltingGlyphAppearance } from "./trajectoryTiltingGlyph.js";
import type { TrajectoryTiltingWhatIfGlyphAppearance } from "./trajectoryTiltingWhatIfGlyph.js";

/**
 * Production artistic colors for the actual Analysis mechanism glyph.
 * Operand identity is not encoded scientifically in RGB.
 * Not the production T1 display-saturation object.
 */
export const ANALYSIS_T1_GLYPH_APPEARANCE_V1: TrajectoryTiltingGlyphAppearance =
  {
    omegaColor: 0x00aacc,
    gradientColor: 0xccaa00,
    arcColor: 0x8899aa,
    arcRadiusFraction: 0.4,
  };

/**
 * Hypothetical what-if geometry. Distinct from actual glyph colors.
 * Visualization convention only. World-space dashes sized for typical
 * display lengths of hundreds of meters, not screen-space scaling.
 * Higher opacity / warmer contrast against the dark storm scene.
 */
export const ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1: TrajectoryTiltingWhatIfGlyphAppearance =
  {
    hypotheticalGradientColor: 0xf2c14e,
    hypotheticalArcColor: 0xe6d38a,
    opacity: 0.88,
    dashSize: 12,
    gapSize: 8,
    arcRadiusFraction: 0.4,
  };
