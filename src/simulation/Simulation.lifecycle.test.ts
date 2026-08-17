import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { Simulation } from "./Simulation.js";
import type { TracerAdvectionState } from "./TracerParticle.js";
import simulationSrc from "./Simulation.ts?raw";

function particle(
  x: number,
  y: number,
  z: number,
  active = true,
): TracerAdvectionState {
  return {
    position: { x, y, z },
    age: 0,
    active,
  };
}

describe("Simulation particle lifecycle", () => {
  it("steps with zero particles and still advances the clock", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      [],
    );
    simulation.step(0.1);
    expect(simulation.particles).toHaveLength(0);
    expect(simulation.clock.time).toBeCloseTo(0.1, 12);
  });

  it("addParticle appends the same object without cloning or resetting the clock", () => {
    const existing = particle(0, 0, 0);
    existing.age = 4;
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      [existing],
    );
    simulation.step(0.1);
    const clockAfterStep = simulation.clock.time;
    const existingBefore = {
      position: { ...existing.position },
      age: existing.age,
      active: existing.active,
    };

    const born = particle(5, 6, 7);
    simulation.addParticle(born);

    expect(simulation.clock.time).toBe(clockAfterStep);
    expect(simulation.particles).toHaveLength(2);
    expect(simulation.particles[0]).toBe(existing);
    expect(simulation.particles[1]).toBe(born);
    expect(existing.position).toEqual(existingBefore.position);
    expect(existing.age).toBe(existingBefore.age);
    expect(existing.active).toBe(existingBefore.active);
    expect(born.age).toBe(0);
  });

  it("addParticles preserves order and treats an empty batch as a no-op", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [],
    );
    simulation.addParticles([]);
    expect(simulation.particles).toHaveLength(0);

    const first = particle(1, 0, 0);
    const second = particle(2, 0, 0);
    simulation.addParticles([first, second]);
    expect(simulation.particles).toEqual([first, second]);
    expect(simulation.particles[0]).toBe(first);
    expect(simulation.particles[1]).toBe(second);
  });

  it("clearParticles empties the cohort without changing the clock", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      [particle(0, 0, 0)],
    );
    simulation.step(0.25);
    simulation.clearParticles();
    expect(simulation.particles).toHaveLength(0);
    expect(simulation.clock.time).toBeCloseTo(0.25, 12);

    simulation.step(0.1);
    expect(simulation.particles).toHaveLength(0);
    expect(simulation.clock.time).toBeCloseTo(0.35, 12);
  });

  it("a newly added particle participates in the next step", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      [],
    );
    const born = particle(0, 100, 0);
    simulation.addParticle(born);
    simulation.step(0.1);
    expect(born.position).toEqual({ x: 1, y: 100, z: 0 });
    expect(born.age).toBeCloseTo(0.1, 12);
  });

  it("does not import history, renderer, UI, or pedagogy", () => {
    expect(simulationSrc).not.toMatch(/TracerPathHistory/);
    expect(simulationSrc).not.toMatch(/TracerScene/);
    expect(simulationSrc).not.toMatch(/from ["']three["']/);
    expect(simulationSrc).not.toMatch(/TracerPedagogy/);
    expect(simulationSrc).not.toMatch(/from ["'].*ui\//);
    expect(simulationSrc).not.toMatch(/from ["'].*rendering\//);
    expect(simulationSrc).not.toMatch(/from ["'].*interaction\//);
    expect(simulationSrc).not.toMatch(/TracerSelection/);
  });
});
