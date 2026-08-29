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
 * Visualization convention only.
 */
export const ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1: TrajectoryTiltingWhatIfGlyphAppearance =
  {
    hypotheticalGradientColor: 0x88aacc,
    hypotheticalArcColor: 0xaabbcc,
    opacity: 0.55,
    dashSize: 40,
    gapSize: 24,
    arcRadiusFraction: 0.4,
  };
