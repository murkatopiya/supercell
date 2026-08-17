import { describe, expect, it } from "vitest";
import createTracersFromSeedsSrc from "./createTracersFromSeeds.ts?raw";
import { createTracersFromSeeds } from "./createTracersFromSeeds.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";

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

  it("is role-agnostic: copies whichever coordinate array the caller passes", () => {
    const storyParticles = createTracersFromSeeds(
      DEMO_SCENARIO.simulation.storySeeds,
    );
    const diagnosticParticles = createTracersFromSeeds(
      DEMO_SCENARIO.simulation.diagnosticSeeds,
    );
    const downwardParticles = createTracersFromSeeds(
      DEMO_SCENARIO.simulation.downwardPathlineSeeds,
    );

    expect(storyParticles.map((particle) => particle.position)).toEqual(
      DEMO_SCENARIO.simulation.storySeeds,
    );
    expect(diagnosticParticles.map((particle) => particle.position)).toEqual(
      DEMO_SCENARIO.simulation.diagnosticSeeds,
    );
    expect(downwardParticles.map((particle) => particle.position)).toEqual(
      DEMO_SCENARIO.simulation.downwardPathlineSeeds,
    );
    expect(createTracersFromSeedsSrc).not.toMatch(/diagnosticSeeds/);
    expect(createTracersFromSeedsSrc).not.toMatch(/storySeeds/);
    expect(createTracersFromSeedsSrc).not.toMatch(/downwardPathlineSeeds/);
    expect(createTracersFromSeedsSrc).not.toMatch(/IntegrationFrame/);
    expect(createTracersFromSeedsSrc).not.toMatch(/TracerPedagogy/);
    expect(createTracersFromSeedsSrc).not.toMatch(/\bsigma\b/);
    expect(createTracersFromSeedsSrc).not.toMatch(/\bbasin\b/);
  });
});
