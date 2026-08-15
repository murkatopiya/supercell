import { describe, expect, it } from "vitest";
import type { Vec3 } from "./Vec3.js";
import {
  type AtmosphericVelocity,
  atmosphericVelocityToWorld,
  worldVelocityToAtmospheric,
} from "./AtmosphericVelocity.js";

describe("AtmosphericVelocity coordinate conversion", () => {
  const cardinals: {
    name: string;
    atmospheric: AtmosphericVelocity;
    world: Vec3;
  }[] = [
    {
      name: "East",
      atmospheric: { eastward: 10, northward: 0, vertical: 0 },
      world: { x: 10, y: 0, z: 0 },
    },
    {
      name: "West",
      atmospheric: { eastward: -10, northward: 0, vertical: 0 },
      world: { x: -10, y: 0, z: 0 },
    },
    {
      name: "North",
      atmospheric: { eastward: 0, northward: 10, vertical: 0 },
      world: { x: 0, y: 0, z: -10 },
    },
    {
      name: "South",
      atmospheric: { eastward: 0, northward: -10, vertical: 0 },
      world: { x: 0, y: 0, z: 10 },
    },
    {
      name: "Up",
      atmospheric: { eastward: 0, northward: 0, vertical: 10 },
      world: { x: 0, y: 10, z: 0 },
    },
    {
      name: "Down",
      atmospheric: { eastward: 0, northward: 0, vertical: -10 },
      world: { x: 0, y: -10, z: 0 },
    },
  ];

  for (const { name, atmospheric, world } of cardinals) {
    it(`maps ${name} atmospheric -> world`, () => {
      expect(atmosphericVelocityToWorld(atmospheric)).toEqual(world);
    });

    it(`maps ${name} world -> atmospheric`, () => {
      expect(worldVelocityToAtmospheric(world)).toEqual(atmospheric);
    });
  }

  const mixedAtmospheric: AtmosphericVelocity[] = [
    { eastward: 3, northward: -4, vertical: 5 },
    { eastward: -2.5, northward: 7, vertical: -1 },
    { eastward: 0, northward: 0, vertical: 0 },
  ];

  const mixedWorld: Vec3[] = [
    { x: 8, y: -3, z: 6 },
    { x: -1, y: 0, z: -9 },
    { x: 0.5, y: 2.25, z: -4.5 },
  ];

  for (const atmospheric of mixedAtmospheric) {
    it(`round-trips atmospheric -> world -> atmospheric for ${JSON.stringify(atmospheric)}`, () => {
      expect(
        worldVelocityToAtmospheric(atmosphericVelocityToWorld(atmospheric)),
      ).toEqual(atmospheric);
    });
  }

  for (const world of mixedWorld) {
    it(`round-trips world -> atmospheric -> world for ${JSON.stringify(world)}`, () => {
      expect(
        atmosphericVelocityToWorld(worldVelocityToAtmospheric(world)),
      ).toEqual(world);
    });
  }
});
