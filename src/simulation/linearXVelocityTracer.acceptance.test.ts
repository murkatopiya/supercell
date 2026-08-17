import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { LinearXVelocityField } from "../physics/synthetic/LinearXVelocityField.js";
import { Simulation } from "./Simulation.js";
import type { TracerAdvectionState } from "./TracerParticle.js";

function runLinearXTracer(dt: number, duration: number, k: number, x0: number) {
  const field = new LinearXVelocityField(k);
  const particle: TracerAdvectionState = {
    position: { x: x0, y: 1000, z: 0 },
    age: 0,
    active: true,
  };
  const simulation = new Simulation(field, new EulerIntegrator(), [particle]);

  const steps = Math.round(duration / dt);
  for (let i = 0; i < steps; i++) {
    simulation.step(dt);
  }

  return { particle, simulation, steps };
}

describe("linear X velocity tracer acceptance (mathematical learning field)", () => {
  const k = 0.1;
  const x0 = 100;
  const duration = 10;
  const tolerance = 1e-9;

  it("matches closed-form Euler and stays near x0*exp(k*T) at dt=0.1", () => {
    const dt = 0.1;
    const { particle, simulation, steps } = runLinearXTracer(
      dt,
      duration,
      k,
      x0,
    );

    const xEulerExact = x0 * (1 + k * dt) ** steps;
    const xAnalytic = x0 * Math.exp(k * duration);

    expect(Math.abs(simulation.clock.time - duration)).toBeLessThan(tolerance);
    expect(Math.abs(particle.age - duration)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.y - 1000)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.z - 0)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.x - xEulerExact)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.x - xAnalytic)).toBeLessThan(2);
  });

  it("reduces absolute error against the analytic solution as dt decreases", () => {
    const xAnalytic = x0 * Math.exp(k * duration);

    const error = (dt: number) => {
      const { particle } = runLinearXTracer(dt, duration, k, x0);
      return Math.abs(particle.position.x - xAnalytic);
    };

    const errorCoarse = error(1.0);
    const errorMedium = error(0.1);
    const errorFine = error(0.01);

    expect(errorFine).toBeLessThan(errorMedium);
    expect(errorMedium).toBeLessThan(errorCoarse);
  });
});
