import { describe, expect, it } from "vitest";
import { SolidBodyRotationYField } from "./SolidBodyRotationYField.js";

describe("SolidBodyRotationYField (mathematical learning field)", () => {
  const omega = 0.2;

  it("samples positive +Y rotation (CCW from above) in the X-Z plane", () => {
    const field = new SolidBodyRotationYField(omega);

    // On +X: velocity toward -Z (north) → CCW when viewed from above.
    const onPlusX = field.sample({ x: 1000, y: 500, z: 0 }, 0);
    expect(onPlusX.x).toBe(0);
    expect(onPlusX.y).toBe(0);
    expect(onPlusX.z).toBe(-omega * 1000);

    // On +Z: velocity toward +X (east).
    const onPlusZ = field.sample({ x: 0, y: 500, z: 1000 }, 0);
    expect(onPlusZ.x).toBe(omega * 1000);
    expect(onPlusZ.y).toBe(0);
    expect(onPlusZ.z + 0).toBe(0); // coerce -0 from -omega*0
  });

  it("is steady and does not mutate the sampled position", () => {
    const field = new SolidBodyRotationYField(omega);
    const position = { x: 10, y: 20, z: 30 };

    expect(field.sample(position, 0)).toEqual(field.sample(position, 99));
    field.sample(position, 0);
    expect(position).toEqual({ x: 10, y: 20, z: 30 });
  });
});
