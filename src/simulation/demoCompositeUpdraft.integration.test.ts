import { describe, expect, it } from "vitest";
import { composeDemoTracerSimulation } from "../app/composeDemoTracerSimulation.js";
import { createDemoHodographPoints } from "../app/demoHodographFixture.js";
import { CompositeVelocityField } from "../core/fields/CompositeVelocityField.js";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import { createEnvironmentalWindProfile } from "../scenario/createEnvironmentalWindProfile.js";
import { createUpdraftField } from "../scenario/createUpdraftField.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";

describe("DEMO composite env + updraft integration", () => {
  const seeds = DEMO_SCENARIO.simulation.tracerSeeds;
  const dt = DEMO_SCENARIO.simulation.timestep;
  const updraftDto = DEMO_SCENARIO.storm.updraft;

  function demoFields() {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const environmentField = new EnvironmentalWindField(profile);
    const updraftField = createUpdraftField(DEMO_SCENARIO);
    const composite = new CompositeVelocityField([
      environmentField,
      updraftField,
    ]);
    return { environmentField, updraftField, composite };
  }

  it("createUpdraftField maps DEMO DTO (axis Vy = peak)", () => {
    const updraft = createUpdraftField(DEMO_SCENARIO);
    const onAxis = updraft.sample(
      {
        x: updraftDto.centerX,
        y: 1000,
        z: updraftDto.centerZ,
      },
      0,
    );

    expect(updraftDto.centerX).toBe(0);
    expect(updraftDto.centerZ).toBe(0);
    expect(updraftDto.peakVerticalVelocity).toBe(20);
    expect(updraftDto.sigma).toBe(1000);
    expect(onAxis).toEqual({ x: 0, y: 20, z: 0 });
  });

  it("demo composition matches sample(env) + sample(updraft)", () => {
    const { environmentField, updraftField, composite } = demoFields();
    const points = [
      seeds[0]!,
      seeds[1]!,
      seeds[2]!,
      { x: 500, y: 1500, z: -200 },
    ];

    for (const position of points) {
      const envV = environmentField.sample(position, 0);
      const upV = updraftField.sample(position, 0);
      const total = composite.sample(position, 0);

      expect(total.x).toBeCloseTo(envV.x + upV.x, 12);
      expect(total.y).toBeCloseTo(envV.y + upV.y, 12);
      expect(total.z).toBeCloseTo(envV.z + upV.z, 12);
    }
  });

  it("center seed has env horizontal wind and positive Vy", () => {
    const { environmentField, composite } = demoFields();
    const center = seeds[0]!;
    const envV = environmentField.sample(center, 0);
    const total = composite.sample(center, 0);

    expect(center).toEqual({ x: 0, y: 1000, z: 0 });
    expect(total.x).toBe(envV.x);
    expect(total.z).toBe(envV.z);
    expect(envV.y).toBe(0);
    expect(total.y).toBeGreaterThan(0);
    expect(total.y).toBe(20);
  });

  it("far seed has smaller positive Vy than center at same height", () => {
    const { composite } = demoFields();
    const centerV = composite.sample(seeds[0]!, 0);
    const farV = composite.sample(seeds[2]!, 0);

    expect(seeds[2]).toEqual({ x: 1800, y: 1000, z: 0 });
    expect(farV.y).toBeGreaterThan(0);
    expect(farV.y).toBeLessThan(centerV.y);
  });

  it("after fixed steps near-axis y rises and horizontal drift is nonzero", () => {
    const simulation = composeDemoTracerSimulation();
    const nearAxis = simulation.particles[0]!;
    const y0 = nearAxis.position.y;

    for (let i = 0; i < 50; i++) {
      simulation.step(dt);
    }

    expect(nearAxis.position.y).toBeGreaterThan(y0);
    const horizontalDrift = Math.hypot(
      nearAxis.position.x - seeds[0]!.x,
      nearAxis.position.z - seeds[0]!.z,
    );
    expect(horizontalDrift).toBeGreaterThan(0);
  });

  it("Reset restores seed positions and clock time", () => {
    const simulation = composeDemoTracerSimulation();
    const seedsSnapshot = structuredClone(seeds);

    for (let i = 0; i < 40; i++) {
      simulation.step(dt);
    }

    expect(simulation.clock.time).toBeGreaterThan(0);

    resetTracersFromSeeds(simulation, seeds);

    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles[0]).toEqual({
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(simulation.particles[1]).toEqual({
      position: { x: 600, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(simulation.particles[2]).toEqual({
      position: { x: 1800, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(DEMO_SCENARIO.simulation.tracerSeeds).toEqual(seedsSnapshot);
  });

  it("hodograph points ignore updraft / composite", () => {
    const fromFixture = createDemoHodographPoints();
    const fromProfileOnly = hodographPoints(
      createEnvironmentalWindProfile(DEMO_SCENARIO),
    );

    expect(fromFixture).toEqual(fromProfileOnly);

    const mutated = structuredClone(DEMO_SCENARIO);
    mutated.storm.updraft.peakVerticalVelocity = 99;
    mutated.storm.updraft.sigma = 50;
    const pointsWithMutatedUpdraft = hodographPoints(
      createEnvironmentalWindProfile(mutated),
    );

    expect(pointsWithMutatedUpdraft).toEqual(fromFixture);
  });
});
