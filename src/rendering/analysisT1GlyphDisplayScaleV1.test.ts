import { describe, expect, it } from "vitest";
import { ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1 } from "./analysisT1GlyphDisplayScaleV1.js";
import {
  ANALYSIS_T1_GLYPH_METERS_PER_S_MINUS_1_V1,
  ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1_VERSION,
} from "./analysisT1GlyphDisplayScaleV1.js";
import scaleSrc from "./analysisT1GlyphDisplayScaleV1.ts?raw";

describe("ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1", () => {
  it("maps exact 0 to display 0 and uses a common linear presentation scale", () => {
    expect(ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1.version).toBe(
      ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1_VERSION,
    );
    expect(
      ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1.worldLengthFromPhysicalMagnitude(0),
    ).toBe(0);
    expect(
      ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1.worldLengthFromPhysicalMagnitude(0.01),
    ).toBe(0.01 * ANALYSIS_T1_GLYPH_METERS_PER_S_MINUS_1_V1);
    expect(scaleSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(scaleSrc).not.toMatch(/per-vector|normalize/);
  });
});
