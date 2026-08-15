import { describe, expect, it } from "vitest";
import { LinearXVelocityField } from "./LinearXVelocityField.js";

describe("LinearXVelocityField (mathematical learning field)", () => {
  it("returns velocity proportional to x and independent of y, z, and time", () => {
    const field = new LinearXVelocityField(0.1);
    const position = { x: 10, y: 999, z: -3 };

    expect(field.sample(position, 0)).toEqual({ x: 1, y: 0, z: 0 });
    expect(field.sample(position, 50)).toEqual({ x: 1, y: 0, z: 0 });
    expect(field.sample({ x: 50, y: 0, z: 0 }, 0)).toEqual({
      x: 5,
      y: 0,
      z: 0,
    });
  });

  it("does not mutate the sampled position", () => {
    const field = new LinearXVelocityField(0.1);
    const position = { x: 10, y: 999, z: -3 };

    field.sample(position, 0);

    expect(position).toEqual({ x: 10, y: 999, z: -3 });
  });
});
