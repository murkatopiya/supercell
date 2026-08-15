import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import { EnvironmentalWindProfile } from "../physics/environment/EnvironmentalWindProfile.js";
import { Simulation } from "./Simulation.js";
import type { TracerParticle } from "./TracerParticle.js";

describe("environmental wind field tracer acceptance", () => {
  it("advects tracers at different heights with different environmental eastward winds", () => {
    const dt = 0.1;
    const duration = 10;
    const tolerance = 1e-9;

    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 5, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 15, northward: 0, vertical: 0 },
      },
    ]);
    const field = new EnvironmentalWindField(profile);

    const tracerA: TracerParticle = {
      position: { x: 0, y: 0, z: 0 },
      age: 0,
      active: true,
    };
    const tracerB: TracerParticle = {
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    };

    const simulation = new Simulation(
      field,
      new EulerIntegrator(),
      [tracerA, tracerB],
    );

    const steps = Math.round(duration / dt);
    for (let i = 0; i < steps; i++) {
      simulation.step(dt);
    }

    expect(Math.abs(simulation.clock.time - duration)).toBeLessThan(tolerance);

    expect(Math.abs(tracerA.position.x - 50)).toBeLessThan(tolerance);
    expect(Math.abs(tracerA.position.y - 0)).toBeLessThan(tolerance);
    expect(Math.abs(tracerA.position.z - 0)).toBeLessThan(tolerance);
    expect(Math.abs(tracerA.age - duration)).toBeLessThan(tolerance);

    expect(Math.abs(tracerB.position.x - 150)).toBeLessThan(tolerance);
    expect(Math.abs(tracerB.position.y - 1000)).toBeLessThan(tolerance);
    expect(Math.abs(tracerB.position.z - 0)).toBeLessThan(tolerance);
    expect(Math.abs(tracerB.age - duration)).toBeLessThan(tolerance);
  });
});
