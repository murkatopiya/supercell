import { describe, expect, it } from "vitest";
import { createTracersFromSeeds } from "./createTracersFromSeeds.js";

describe("createTracersFromSeeds", () => {
  it("copies seed positions into exact initial tracer positions", () => {
    const seeds = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1000, z: 0 },
      { x: 0, y: 2000, z: 0 },
    ];

    const particles = createTracersFromSeeds(seeds);

    expect(particles).toHaveLength(3);
    expect(particles[0]).toEqual({
      position: { x: 0, y: 0, z: 0 },
      age: 0,
      active: true,
    });
    expect(particles[1]).toEqual({
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(particles[2]).toEqual({
      position: { x: 0, y: 2000, z: 0 },
      age: 0,
      active: true,
    });

    seeds[0]!.x = 999;
    expect(particles[0]!.position.x).toBe(0);
  });
});
