import { describe, expect, it } from "vitest";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { STORM_OPERAND_HIGHLIGHT_DISPLAY_REFERENCE_MPS } from "./operandContributionDisplay.js";
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
    const updraftReference =
      STORM_OPERAND_HIGHLIGHT_DISPLAY_REFERENCE_MPS.updraft;
    writeContributionDisplayStrengths(
      new TimeDependentYField(),
      positions,
      1,
      15,
      out,
      updraftReference,
    );
    expect(out[0]).toBeCloseTo(15 / updraftReference);
    writeContributionDisplayStrengths(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      positions,
      1,
      15,
      out,
      updraftReference,
    );
    expect(out[0]).toBe(0);
  });

  it("applies the caller display reference without constructing a field", () => {
    const positions = new Float32Array([0, 0, 0]);
    const out = new Float32Array(1);
    const field = new ConstantVelocityField({ x: 3, y: 0, z: 0 });
    writeContributionDisplayStrengths(field, positions, 1, 0, out, 30);
    expect(out[0]).toBeCloseTo(0.1);
    writeContributionDisplayStrengths(field, positions, 1, 0, out, 3);
    expect(out[0]).toBe(1);
    expect(writeSrc).not.toMatch(/createUpdraftField/);
    expect(writeSrc).not.toMatch(/createRotationField/);
    expect(writeSrc).not.toMatch(/VerticalEnvelopeUpdraftField/);
  });
});
