import type { TrajectoryTiltingGlyphVectorDisplayScale } from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";

/**
 * Presentation display-length map for Analysis tilting glyphs.
 * Shared by environmental ω_h and prescribed ∇_h Vy.
 * Architecture 62 §23 item 4 remains OPEN: this is not a frozen
 * production physics exaggeration. Exact 0 → display 0.
 */
export const ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1_VERSION =
  "ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1";

/**
 * Presentation meters per s⁻¹. Not a scientific calibration.
 * Typical |ω_h| ~ 10⁻² s⁻¹ → ~1 km display arrow in the storm view.
 */
export const ANALYSIS_T1_GLYPH_METERS_PER_S_MINUS_1_V1 = 1e5;

export const ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1: TrajectoryTiltingGlyphVectorDisplayScale =
  {
    version: ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1_VERSION,
    worldLengthFromPhysicalMagnitude(magnitudeSMinus1: number): number {
      return magnitudeSMinus1 * ANALYSIS_T1_GLYPH_METERS_PER_S_MINUS_1_V1;
    },
  };
