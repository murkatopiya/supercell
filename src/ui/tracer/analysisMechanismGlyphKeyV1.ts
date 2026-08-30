import {
  ANALYSIS_T1_GLYPH_APPEARANCE_V1,
  ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1,
} from "../../rendering/analysisT1GlyphAppearanceV1.js";
import type { TrajectoryTiltingGlyphModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import type { TrajectoryTiltingWhatIfModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";

/**
 * CSS sRGB from a Three.js LineBasicMaterial hex.
 * Glyph materials take sRGB hex; the 2D key must use that same encoding,
 * not the trail's linear-vertex path.
 */
export function cssHexFromGlyphColor(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

export const ANALYSIS_MECHANISM_GLYPH_KEY_V1 = {
  omegaColorCss: cssHexFromGlyphColor(
    ANALYSIS_T1_GLYPH_APPEARANCE_V1.omegaColor,
  ),
  actualGradientColorCss: cssHexFromGlyphColor(
    ANALYSIS_T1_GLYPH_APPEARANCE_V1.gradientColor,
  ),
  hypotheticalGradientColorCss: cssHexFromGlyphColor(
    ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.hypotheticalGradientColor,
  ),
  hypotheticalOpacity: ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.opacity,
  dashSize: ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.dashSize,
  gapSize: ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.gapSize,
  omegaLabel: "Environmental ωₕ · fixed",
  actualGradientLabel: "∇ₕVᵧ · actual",
  hypotheticalGradientLabel: "∇ₕVᵧ · hypothetical",
} as const;

export function shouldShowAnalysisMechanismGlyphKey(
  glyphModel: TrajectoryTiltingGlyphModel | null | undefined,
): boolean {
  return glyphModel?.kind === "SUPPORTED";
}

export function shouldShowHypotheticalGlyphKeyRow(
  whatIfModel: TrajectoryTiltingWhatIfModel | null | undefined,
): boolean {
  return whatIfModel?.kind === "AVAILABLE";
}
