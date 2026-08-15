import { describe, expect, it } from "vitest";
import { EnvironmentalWindField } from "./EnvironmentalWindField.js";
import { EnvironmentalWindProfile } from "./EnvironmentalWindProfile.js";

describe("EnvironmentalWindField", () => {
  const profile = new EnvironmentalWindProfile([
    {
      height: 1000,
      velocity: { eastward: 10, northward: 0, vertical: 0 },
    },
    {
      height: 2000,
      velocity: { eastward: 20, northward: 10, vertical: 0 },
    },
  ]);
  const field = new EnvironmentalWindField(profile);

  it("samples exact level heights into world velocity", () => {
    expect(field.sample({ x: 0, y: 1000, z: 0 }, 0)).toEqual({
      x: 10,
      y: 0,
      z: 0,
    });
    expect(field.sample({ x: 0, y: 2000, z: 0 }, 0)).toEqual({
      x: 20,
      y: 0,
      z: -10,
    });
  });

  it("maps midpoint atmospheric wind with northward -> -Z", () => {
    expect(field.sample({ x: 0, y: 1500, z: 0 }, 0)).toEqual({
      x: 15,
      y: 0,
      z: -5,
    });
  });

  it("clamps below and above the profile range", () => {
    expect(field.sample({ x: 0, y: 0, z: 0 }, 0)).toEqual(
      field.sample({ x: 0, y: 1000, z: 0 }, 0),
    );
    expect(field.sample({ x: 0, y: 3000, z: 0 }, 0)).toEqual(
      field.sample({ x: 0, y: 2000, z: 0 }, 0),
    );
  });

  it("is horizontally homogeneous", () => {
    const a = field.sample({ x: -50, y: 1500, z: 20 }, 0);
    const b = field.sample({ x: 100, y: 1500, z: -80 }, 0);
    expect(a).toEqual(b);
  });

  it("ignores simulation time", () => {
    const position = { x: 0, y: 1500, z: 0 };
    expect(field.sample(position, 0)).toEqual(field.sample(position, 99));
  });

  it("keeps world.y = 0 for the horizontal environmental profile", () => {
    expect(field.sample({ x: 0, y: 1000, z: 0 }, 0).y).toBe(0);
    expect(field.sample({ x: 0, y: 1500, z: 0 }, 0).y).toBe(0);
    expect(field.sample({ x: 0, y: 2000, z: 0 }, 0).y).toBe(0);
  });

  it("returns an independent Vec3 each call", () => {
    const first = field.sample({ x: 0, y: 1500, z: 0 }, 0);
    first.x = 999;
    first.z = 999;

    expect(field.sample({ x: 0, y: 1500, z: 0 }, 0)).toEqual({
      x: 15,
      y: 0,
      z: -5,
    });
  });
});
