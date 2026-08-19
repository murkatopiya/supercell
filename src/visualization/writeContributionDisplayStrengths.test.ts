import { describe, expect, it } from "vitest";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS } from "./operandContributionDisplay.js";
import { writeContributionDisplayStrengths } from "./writeContributionDisplayStrengths.js";
import writeSrc from "./writeContributionDisplayStrengths.ts?raw";

class TimeDependentYField implements VelocityField {
  sample(_position: Vec3, time: number): Vec3 {
    return { x: 0, y: time, z: 0 };
  }
}

describe("writeContributionDisplayStrengths", () => {
  it("samples the given operand at laboratory time", () => {
    const positions = new Float32Array([1, 2, 3]);
    const out = new Float32Array(1);
    writeContributionDisplayStrengths(
      new TimeDependentYField(),
      positions,
      1,
      15,
      out,
    );
    expect(out[0]).toBeCloseTo(15 / UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS);
    writeContributionDisplayStrengths(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      positions,
      1,
      15,
      out,
    );
    expect(out[0]).toBe(0);
  });

  it("does not construct a second updraft field", () => {
    expect(writeSrc).not.toMatch(/createUpdraftField/);
    expect(writeSrc).not.toMatch(/VerticalEnvelopeUpdraftField/);
  });
});
