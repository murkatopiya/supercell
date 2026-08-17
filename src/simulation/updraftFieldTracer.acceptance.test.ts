import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../core/integrators/RK2Integrator.js";
import { UpdraftField } from "../physics/storm/UpdraftField.js";
import { Simulation } from "./Simulation.js";
import type { TracerAdvectionState } from "./TracerParticle.js";

describe("updraft field on-axis tracer acceptance", () => {
  const centerX = 2500;
  const centerZ = -1000;
  const peakVerticalVelocity = 15;
  const sigma = 3000;
  const y0 = 500;
  const dt = 0.1;
  const duration = 20;
  const tolerance = 1e-9;

  function runOnAxis(integrator: "euler" | "rk2") {
    const field = new UpdraftField({
      centerX,
      centerZ,
      peakVerticalVelocity,
      sigma,
    });
    const particle: TracerAdvectionState = {
      position: { x: centerX, y: y0, z: centerZ },
      age: 0,
      active: true,
    };
    const simulation = new Simulation(
      field,
      integrator === "euler" ? new EulerIntegrator() : new RK2Integrator(),
      [particle],
    );

    const steps = Math.round(duration / dt);
    for (let i = 0; i < steps; i++) {
      simulation.step(dt);
    }

    return { particle, simulation };
  }

  it("matches y(t)=y0+W0*t with Euler (exact on axis)", () => {
    const { particle, simulation } = runOnAxis("euler");
    const expectedY = y0 + peakVerticalVelocity * duration;

    expect(Math.abs(simulation.clock.time - duration)).toBeLessThan(tolerance);
    expect(Math.abs(particle.age - duration)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.x - centerX)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.y - expectedY)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.z - centerZ)).toBeLessThan(tolerance);
  });

  it("matches y(t)=y0+W0*t with RK2 (exact on axis)", () => {
    const { particle } = runOnAxis("rk2");
    const expectedY = y0 + peakVerticalVelocity * duration;

    expect(Math.abs(particle.position.x - centerX)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.y - expectedY)).toBeLessThan(tolerance);
    expect(Math.abs(particle.position.z - centerZ)).toBeLessThan(tolerance);
  });
});
