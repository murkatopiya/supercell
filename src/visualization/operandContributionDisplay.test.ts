import { describe, expect, it } from "vitest";
import {
  contributionDisplayStrength,
  UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS,
} from "./operandContributionDisplay.js";
import displaySrc from "./operandContributionDisplay.ts?raw";

describe("contributionDisplayStrength", () => {
  it("maps zero to no salience and saturates at the display reference", () => {
    expect(contributionDisplayStrength(0)).toBe(0);
    expect(contributionDisplayStrength(-1)).toBe(0);
    expect(contributionDisplayStrength(Number.NaN)).toBe(0);
    expect(
      contributionDisplayStrength(UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS / 2),
    ).toBeCloseTo(0.5);
    expect(
      contributionDisplayStrength(UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS),
    ).toBe(1);
    expect(
      contributionDisplayStrength(UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS * 3),
    ).toBe(1);
  });

  it("does not import ScenarioConfig or claim a physics threshold", () => {
    expect(displaySrc).not.toMatch(/DEMO_SCENARIO/);
    expect(displaySrc).not.toMatch(/createUpdraftField/);
    expect(UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS).toBe(30);
  });
});
