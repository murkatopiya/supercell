import { describe, expect, it } from "vitest";
import { ANALYSIS_T1_VALUE_APPEARANCE_V1 } from "./analysisT1ValueAppearanceV1.js";
import appearanceSrc from "./analysisT1ValueAppearanceV1.ts?raw";
import { linearRgbFromSrgbHex } from "./vertexColorSpace.js";

describe("ANALYSIS_T1_VALUE_APPEARANCE_V1", () => {
  it("maps warm / exact 0 / cool without a scientific scale", () => {
    const warm = linearRgbFromSrgbHex(0xb2182b);
    const cool = linearRgbFromSrgbHex(0x2166ac);
    const neutral = linearRgbFromSrgbHex(0xf7f7f7);
    expect(
      ANALYSIS_T1_VALUE_APPEARANCE_V1.linearRgbFromSignedUnit(0),
    ).toEqual(neutral);
    expect(
      ANALYSIS_T1_VALUE_APPEARANCE_V1.linearRgbFromSignedUnit(1),
    ).toEqual(warm);
    expect(
      ANALYSIS_T1_VALUE_APPEARANCE_V1.linearRgbFromSignedUnit(-1),
    ).toEqual(cool);
    expect(appearanceSrc).not.toMatch(/T1_COLOR_SCALE/);
    expect(appearanceSrc).not.toMatch(/queryAnalysis/);
    expect(appearanceSrc).toMatch(/§23 item 5/);
  });
});
