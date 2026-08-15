import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../core/integrators/RK2Integrator.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { SolidBodyRotationYField } from "../physics/synthetic/SolidBodyRotationYField.js";
import { Simulation } from "./Simulation.js";
import type { TracerParticle } from "./TracerParticle.js";

function horizontalRadius(x: number, z: number): number {
  return Math.hypot(x, z);
}

function analyticPosition(
  x0: number,
  z0: number,
  omega: number,
  t: number,
): { x: number; z: number } {
  const c = Math.cos(omega * t);
  const s = Math.sin(omega * t);
  return {
    x: x0 * c + z0 * s,
    z: -x0 * s + z0 * c,
  };
}

function runRotation(
  integrator: Integrator,
  dt: number,
  duration: number,
  omega: number,
  x0: number,
  y0: number,
  z0: number,
) {
  const field = new SolidBodyRotationYField(omega);
  const particle: TracerParticle = {
    position: { x: x0, y: y0, z: z0 },
    age: 0,
    active: true,
  };
  const simulation = new Simulation(field, integrator, [particle]);

  const steps = Math.round(duration / dt);
  for (let i = 0; i < steps; i++) {
    simulation.step(dt);
  }

  return particle;
}

describe("Euler vs RK2 on solid-body rotation about +Y", () => {
  const omega = (2 * Math.PI) / 10;
  const x0 = 1000;
  const y0 = 1000;
  const z0 = 0;
  const r0 = horizontalRadius(x0, z0);
  const duration = 10;
  const dts = [1.0, 0.1, 0.01] as const;
  const floatTol = 1e-9;

  function errors(integrator: Integrator, dt: number) {
    const particle = runRotation(integrator, dt, duration, omega, x0, y0, z0);
    const analytic = analyticPosition(x0, z0, omega, duration);
    const positionError = Math.hypot(
      particle.position.x - analytic.x,
      particle.position.z - analytic.z,
    );
    const radiusError = Math.abs(
      horizontalRadius(particle.position.x, particle.position.z) - r0,
    );
    return { particle, positionError, radiusError };
  }

  it("keeps Y unchanged for both integrators", () => {
    for (const dt of dts) {
      const euler = errors(new EulerIntegrator(), dt);
      const rk2 = errors(new RK2Integrator(), dt);
      expect(Math.abs(euler.particle.position.y - y0)).toBeLessThan(floatTol);
      expect(Math.abs(rk2.particle.position.y - y0)).toBeLessThan(floatTol);
    }
  });

  it("has smaller position and radius error than Euler at each dt", () => {
    for (const dt of dts) {
      const euler = errors(new EulerIntegrator(), dt);
      const rk2 = errors(new RK2Integrator(), dt);

      expect(rk2.positionError).toBeLessThan(euler.positionError);
      expect(rk2.radiusError).toBeLessThan(euler.radiusError);
    }
  });

  it("reduces position and radius error for both methods as dt decreases", () => {
    for (const IntegratorType of [EulerIntegrator, RK2Integrator]) {
      const e1 = errors(new IntegratorType(), 1.0);
      const e01 = errors(new IntegratorType(), 0.1);
      const e001 = errors(new IntegratorType(), 0.01);

      expect(e001.positionError).toBeLessThan(e01.positionError);
      expect(e01.positionError).toBeLessThan(e1.positionError);

      expect(e001.radiusError).toBeLessThan(e01.radiusError);
      expect(e01.radiusError).toBeLessThan(e1.radiusError);
    }
  });
});
