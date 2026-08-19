import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { Simulation } from "../simulation/Simulation.js";
import { VisualAirflowPopulation } from "./VisualAirflowPopulation.js";
import { stepVisualAirflowOnFrozenField } from "./stepVisualAirflowOnFrozenField.js";
import stepSrc from "./stepVisualAirflowOnFrozenField.ts?raw";

class RecordingTimeField implements VelocityField {
  readonly times: number[] = [];
  sample(_position: Vec3, time: number): Vec3 {
    this.times.push(time);
    return { x: 5, y: 0, z: 0 };
  }
}

describe("stepVisualAirflowOnFrozenField", () => {
  it("moves occupants while leaving Simulation clock and particles unchanged", () => {
    const field = new ConstantVelocityField({ x: 4, y: 0, z: 0 });
    const integrator = new EulerIntegrator();
    const simulation = new Simulation(
      field,
      integrator,
      [{ position: { x: 1, y: 2, z: 3 }, age: 0, active: true }],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const population = new VisualAirflowPopulation(field, integrator, {
      count: 1,
      maxAge: 1000,
      jitterSeed: 1,
      volume: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 100, y: 100, z: 100 },
      },
    });
    const beforeOccupant = population.occupants()[0]!.position;
    const beforeParticle = { ...simulation.particles[0]!.position };
    stepVisualAirflowOnFrozenField(population, 0.5, 0);
    expect(population.occupants()[0]!.position.x).toBeCloseTo(
      beforeOccupant.x + 2,
    );
    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles[0]!.position).toEqual(beforeParticle);
  });

  it("samples a time-dependent field at frozen laboratory time on every step", () => {
    const field = new RecordingTimeField();
    const population = new VisualAirflowPopulation(
      field,
      new EulerIntegrator(),
      {
        count: 1,
        maxAge: 1000,
        jitterSeed: 1,
        volume: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: 100, y: 100, z: 100 },
        },
      },
    );
    field.times.length = 0;
    const frozen = 7.25;
    stepVisualAirflowOnFrozenField(population, 0.1, frozen);
    stepVisualAirflowOnFrozenField(population, 0.1, frozen);
    expect(field.times.every((time) => time === frozen)).toBe(true);
    expect(field.times.length).toBeGreaterThan(0);
  });

  it("does not step the scientific clock", () => {
    expect(stepSrc).not.toMatch(/simulation\.step/);
    expect(stepSrc).not.toMatch(/new Simulation/);
  });
});
