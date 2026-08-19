import { describe, expect, it } from "vitest";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import {
  STORM_OPERAND_HIGHLIGHT_DISPLAY_REFERENCE_MPS,
  STORM_OPERAND_HIGHLIGHT_KEYS,
  contributionDisplayStrength,
  displayReferenceMpsForOperand,
  isStormOperandHighlightKey,
  OPERAND_HIGHLIGHT_PROTOTYPE_HUE,
  resolveStormOperandHighlightField,
} from "./operandContributionDisplay.js";
import displaySrc from "./operandContributionDisplay.ts?raw";

describe("contributionDisplayStrength", () => {
  it("maps zero to no salience and saturates at the given display reference", () => {
    expect(contributionDisplayStrength(0, 30)).toBe(0);
    expect(contributionDisplayStrength(-1, 30)).toBe(0);
    expect(contributionDisplayStrength(Number.NaN, 30)).toBe(0);
    expect(contributionDisplayStrength(15, 30)).toBeCloseTo(0.5);
    expect(contributionDisplayStrength(30, 30)).toBe(1);
    expect(contributionDisplayStrength(90, 30)).toBe(1);
    expect(contributionDisplayStrength(3, 3)).toBe(1);
    expect(contributionDisplayStrength(3, 30)).toBeCloseTo(0.1);
  });

  it("treats a non-positive reference as no salience, not a physics threshold", () => {
    expect(contributionDisplayStrength(20, 0)).toBe(0);
    expect(contributionDisplayStrength(20, Number.NaN)).toBe(0);
  });
});

describe("storm operand highlight display policy", () => {
  it("covers the six diagnostic storm operands and excludes environment", () => {
    expect(STORM_OPERAND_HIGHLIGHT_KEYS).toEqual([
      "updraft",
      "rotation",
      "lowerInflow",
      "upperOutflow",
      "downdraft",
      "nearGroundOutflow",
    ]);
    expect(STORM_OPERAND_HIGHLIGHT_KEYS).not.toContain("environmentAdvection");
    expect(isStormOperandHighlightKey("updraft")).toBe(true);
    expect(isStormOperandHighlightKey("environmentAdvection")).toBe(false);
    expect(isStormOperandHighlightKey("hue-a")).toBe(false);
  });

  it("keeps per-operand visualization references, not ScenarioConfig physics", () => {
    expect(STORM_OPERAND_HIGHLIGHT_DISPLAY_REFERENCE_MPS.updraft).toBe(30);
    expect(STORM_OPERAND_HIGHLIGHT_DISPLAY_REFERENCE_MPS.lowerInflow).toBe(3);
    expect(STORM_OPERAND_HIGHLIGHT_DISPLAY_REFERENCE_MPS.nearGroundOutflow).toBe(
      10,
    );
    expect(displayReferenceMpsForOperand("rotation")).toBe(12);
    expect(displaySrc).not.toMatch(/DEMO_SCENARIO/);
    expect(displaySrc).not.toMatch(/createUpdraftField/);
    expect(displaySrc).not.toMatch(/createRotationField/);
    expect(displaySrc).not.toMatch(/peakVerticalVelocity/);
    expect(displaySrc).not.toMatch(/angularVelocity/);
  });

  it("uses one prototype hue and does not resolve a second field", () => {
    expect(OPERAND_HIGHLIGHT_PROTOTYPE_HUE).toBe(0xff2ec8);
    expect(displaySrc).not.toMatch(/hue-a|hue-b|hue-c/);
    expect(displaySrc).not.toMatch(/input type=["']color["']/);
    const dummy = new ConstantVelocityField({ x: 0, y: 30, z: 0 });
    expect(
      resolveStormOperandHighlightField(
        [{ key: "updraft", field: dummy }],
        "updraft",
      ),
    ).toBe(dummy);
    expect(
      resolveStormOperandHighlightField(
        [{ key: "updraft", field: dummy }],
        "rotation",
      ),
    ).toBeNull();
  });
});
