import { describe, expect, it } from "vitest";
import { cometOccupancyFade, COMET_FADE_IN_S, COMET_FADE_OUT_S } from "./cometOccupancyFade.js";
import fadeSrc from "./cometOccupancyFade.ts?raw";

describe("cometOccupancyFade", () => {
  it("fades in after reseed and out before maxAge", () => {
    expect(cometOccupancyFade(0, 80)).toBe(0);
    expect(cometOccupancyFade(COMET_FADE_IN_S, 80)).toBe(1);
    expect(cometOccupancyFade(80, 80)).toBe(0);
    expect(cometOccupancyFade(40, 80)).toBe(1);
    expect(cometOccupancyFade(80 - COMET_FADE_OUT_S / 2, 80)).toBeCloseTo(0.5);
  });

  it("is occupancy age, not scientific history", () => {
    expect(fadeSrc).not.toMatch(/TracerPathHistory/);
    expect(fadeSrc).not.toMatch(/tracerId/);
  });
});
