import { describe, expect, it } from "vitest";
import { ConstantVelocityField } from "./ConstantVelocityField.js";

describe("ConstantVelocityField", () => {
  it("returns the same world velocity at every position and time", () => {
    const field = new ConstantVelocityField({ x: 10, y: 0, z: 0 });

    expect(field.sample({ x: 0, y: 0, z: 0 }, 0)).toEqual({
      x: 10,
      y: 0,
      z: 0,
    });
    expect(field.sample({ x: 100, y: 1000, z: -50 }, 10)).toEqual({
      x: 10,
      y: 0,
      z: 0,
    });
  });
});
