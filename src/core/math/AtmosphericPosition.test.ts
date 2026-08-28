import { describe, expect, it } from "vitest";
import type { Vec3 } from "./Vec3.js";
import {
  type AtmosphericPosition,
  atmosphericPositionToWorld,
  worldPositionToAtmospheric,
} from "./AtmosphericPosition.js";

describe("AtmosphericPosition coordinate conversion", () => {
  it("maps world x to east without changing sign", () => {
    expect(worldPositionToAtmospheric({ x: 512, y: 0, z: 0 }).east).toBe(512);
    expect(worldPositionToAtmospheric({ x: -512, y: 0, z: 0 }).east).toBe(-512);
  });

  it("maps world z to north with a sign change", () => {
    expect(worldPositionToAtmospheric({ x: 0, y: 0, z: 984 }).north).toBe(-984);
    expect(worldPositionToAtmospheric({ x: 0, y: 0, z: -984 }).north).toBe(984);
  });

  it("maps world y to altitude", () => {
    expect(worldPositionToAtmospheric({ x: 0, y: 240, z: 0 }).altitude).toBe(
      240,
    );
  });

  it("does not emit signed zero from a zero world component", () => {
    const atmospheric = worldPositionToAtmospheric({ x: 0, y: 0, z: 0 });
    expect(Object.is(atmospheric.east, -0)).toBe(false);
    expect(Object.is(atmospheric.north, -0)).toBe(false);
    expect(Object.is(atmospheric.altitude, -0)).toBe(false);
    expect(atmospheric).toEqual({ east: 0, north: 0, altitude: 0 });
  });

  const cardinals: {
    name: string;
    atmospheric: AtmosphericPosition;
    world: Vec3;
  }[] = [
    {
      name: "East",
      atmospheric: { east: 10, north: 0, altitude: 0 },
      world: { x: 10, y: 0, z: 0 },
    },
    {
      name: "West",
      atmospheric: { east: -10, north: 0, altitude: 0 },
      world: { x: -10, y: 0, z: 0 },
    },
    {
      name: "North",
      atmospheric: { east: 0, north: 10, altitude: 0 },
      world: { x: 0, y: 0, z: -10 },
    },
    {
      name: "South",
      atmospheric: { east: 0, north: -10, altitude: 0 },
      world: { x: 0, y: 0, z: 10 },
    },
  ];

  for (const { name, atmospheric, world } of cardinals) {
    it(`maps ${name} atmospheric position -> world`, () => {
      expect(atmosphericPositionToWorld(atmospheric)).toEqual(world);
    });

    it(`maps ${name} world -> atmospheric position`, () => {
      expect(worldPositionToAtmospheric(world)).toEqual(atmospheric);
    });
  }
});
