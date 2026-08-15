import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { Simulation } from "./Simulation.js";
import type { TracerParticle } from "./TracerParticle.js";

describe("constant velocity tracer acceptance", () => {
  it("reaches (100, 1000, 0) after 10 s of eastward motion at 10 m/s", () => {
    const dt = 0.1;
    const duration = 10;
    const tolerance = 1e-9;

    const field = new ConstantVelocityField({ x: 10, y: 0, z: 0 });
    const particle: TracerParticle = {
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    };
    const simulation = new Simulation(field, new EulerIntegrator(), [particle]);

    const steps = Math.round(duration / dt);
    for (let i = 0; i < steps; i++) {
      simulation.step(dt);
    }

    expect(Math.abs(simulation.clock.time - duration)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.x - 100)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.y - 1000)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.z - 0)).toBeLessThan(tolerance);
    expect(Math.abs(particle.age - duration)).toBeLessThan(tolerance);
  });

  it("reaches (0, 1100, 0) after 20 s of vertical motion at 5 m/s", () => {
    const dt = 0.1;
    const duration = 20;
    const tolerance = 1e-9;

    const field = new ConstantVelocityField({ x: 0, y: 5, z: 0 });
    const particle: TracerParticle = {
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    };
    const simulation = new Simulation(field, new EulerIntegrator(), [particle]);

    const steps = Math.round(duration / dt);
    for (let i = 0; i < steps; i++) {
      simulation.step(dt);
    }

    expect(Math.abs(simulation.clock.time - duration)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.x - 0)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.y - 1100)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.z - 0)).toBeLessThan(tolerance);
    expect(Math.abs(particle.age - duration)).toBeLessThan(tolerance);
  });
});
