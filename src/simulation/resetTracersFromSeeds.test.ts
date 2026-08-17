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
    const nearGroundSnapshot = structuredClone(
      DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds,
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

    const particleRefs = particles.slice();
    const ids = particles.map((particle) => particle.tracerId);
    expect(ids).toEqual([1, 2, 3]);

    resetTracersFromSeeds(simulation, seeds);

    expect(simulation.clock.time).toBe(0);
    expect(particles[0]).toBe(particleRefs[0]);
    expect(particles[1]).toBe(particleRefs[1]);
    expect(particles[2]).toBe(particleRefs[2]);
    expect(particles.map((particle) => particle.tracerId)).toEqual(ids);
    expect(particles[0]).toMatchObject({
      tracerId: 1,
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(particles[1]).toMatchObject({
      tracerId: 2,
      position: { x: 2400, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(particles[2]).toMatchObject({
      tracerId: 3,
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
    expect(DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds).toEqual(
      nearGroundSnapshot,
    );
  });
});
