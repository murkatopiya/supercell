import { describe, expect, it } from "vitest";
import { composeDemoTracerSimulation } from "../app/composeDemoTracerSimulation.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { resetTracersFromSeeds } from "./resetTracersFromSeeds.js";

describe("resetTracersFromSeeds", () => {
  it("restores diagnostic seed positions and clock time without mutating DEMO seeds", () => {
    const seeds = DEMO_SCENARIO.simulation.diagnosticSeeds;
    const seedsSnapshot = structuredClone(seeds);
    const storySnapshot = structuredClone(DEMO_SCENARIO.simulation.storySeeds);
    const downwardSnapshot = structuredClone(
      DEMO_SCENARIO.simulation.downwardPathlineSeeds,
    );
    const simulation = composeDemoTracerSimulation();
    const particles = simulation.particles;

    const dt = DEMO_SCENARIO.simulation.timestep;
    for (let i = 0; i < 50; i++) {
      simulation.step(dt);
    }

    expect(simulation.clock.time).toBeGreaterThan(0);
    expect(particles[0]!.position.y).not.toBe(1000);
    expect(particles).toHaveLength(3);

    resetTracersFromSeeds(simulation, seeds);

    expect(simulation.clock.time).toBe(0);
    expect(particles[0]).toEqual({
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(particles[1]).toEqual({
      position: { x: 2400, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(particles[2]).toEqual({
      position: { x: 0, y: 1000, z: -2400 },
      age: 0,
      active: true,
    });
    expect(particles).toHaveLength(3);

    expect(DEMO_SCENARIO.simulation.diagnosticSeeds).toEqual(seedsSnapshot);
    expect(DEMO_SCENARIO.simulation.storySeeds).toEqual(storySnapshot);
    expect(DEMO_SCENARIO.simulation.downwardPathlineSeeds).toEqual(
      downwardSnapshot,
    );
  });
});
