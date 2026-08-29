import { describe, expect, it } from "vitest";
import {
  ANALYSIS_T1_GLYPH_APPEARANCE_V1,
  ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1,
} from "./analysisT1GlyphAppearanceV1.js";
import appearanceSrc from "./analysisT1GlyphAppearanceV1.ts?raw";

describe("ANALYSIS_T1_GLYPH_APPEARANCE_V1", () => {
  it("keeps actual and hypothetical palettes distinct and non-scientific", () => {
    expect(ANALYSIS_T1_GLYPH_APPEARANCE_V1.omegaColor).not.toBe(
      ANALYSIS_T1_GLYPH_APPEARANCE_V1.gradientColor,
    );
    expect(ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.hypotheticalGradientColor).not.toBe(
      ANALYSIS_T1_GLYPH_APPEARANCE_V1.gradientColor,
    );
    expect(ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.opacity).toBeGreaterThan(0.7);
    expect(ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.opacity).toBeLessThan(1);
    expect(ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.dashSize).toBeGreaterThan(0);
    expect(ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.gapSize).toBeGreaterThan(0);
    expect(appearanceSrc).toMatch(/World-space dashes/);
    expect(appearanceSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(appearanceSrc).not.toMatch(/queryAnalysisTilting/);
  });
});
