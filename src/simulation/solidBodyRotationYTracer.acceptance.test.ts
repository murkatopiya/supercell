import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { SolidBodyRotationYField } from "../physics/synthetic/SolidBodyRotationYField.js";
import { Simulation } from "./Simulation.js";
import type { TracerAdvectionState } from "./TracerParticle.js";

function horizontalRadius(x: number, z: number): number {
  return Math.hypot(x, z);
}

/** Closed-form Euler radius after N steps: r_N = r_0 * (1 + a^2)^(N/2), a = omega*dt. */
function eulerRadiusClosedForm(
  r0: number,
  omega: number,
  dt: number,
  steps: number,
): number {
  const a = omega * dt;
  return r0 * (1 + a * a) ** (steps / 2);
}

/** Exact one-step Euler map iterated N times (test oracle only). */
function eulerPositionClosedForm(
  x0: number,
  z0: number,
  omega: number,
  dt: number,
  steps: number,
): { x: number; z: number } {
  const a = omega * dt;
  let x = x0;
  let z = z0;
  for (let i = 0; i < steps; i++) {
    const nextX = x + a * z;
    const nextZ = z - a * x;
    x = nextX;
    z = nextZ;
  }
  return { x, z };
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

function runRotationTracer(
  dt: number,
  duration: number,
  omega: number,
  x0: number,
  y0: number,
  z0: number,
) {
  const field = new SolidBodyRotationYField(omega);
  const particle: TracerAdvectionState = {
    position: { x: x0, y: y0, z: z0 },
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

describe("solid-body rotation about +Y acceptance (mathematical learning field)", () => {
  const omega = (2 * Math.PI) / 10;
  const x0 = 1000;
  const y0 = 1000;
  const z0 = 0;
  const r0 = horizontalRadius(x0, z0);
  const duration = 10;
  const floatTol = 1e-9;

  it("keeps Y fixed and matches Euler closed-form position and radius at dt=0.1", () => {
    const dt = 0.1;
    const { particle, simulation, steps } = runRotationTracer(
      dt,
      duration,
      omega,
      x0,
      y0,
      z0,
    );

    const expectedEuler = eulerPositionClosedForm(x0, z0, omega, dt, steps);
    const expectedRadius = eulerRadiusClosedForm(r0, omega, dt, steps);
    const analytic = analyticPosition(x0, z0, omega, duration);

    expect(Math.abs(simulation.clock.time - duration)).toBeLessThan(floatTol);
    expect(Math.abs(particle.age - duration)).toBeLessThan(floatTol);
    expect(Math.abs(particle.position.y - y0)).toBeLessThan(floatTol);

    expect(Math.abs(particle.position.x - expectedEuler.x)).toBeLessThan(
      floatTol,
    );
    expect(Math.abs(particle.position.z - expectedEuler.z)).toBeLessThan(
      floatTol,
    );

    const rNum = horizontalRadius(particle.position.x, particle.position.z);
    expect(Math.abs(rNum - expectedRadius)).toBeLessThan(floatTol);

    // Euler radius drift is exactly predicted; it is not the analytic circle radius.
    expect(Math.abs(expectedRadius - r0)).toBeGreaterThan(floatTol);
    expect(Math.abs(rNum - r0)).toBeGreaterThan(floatTol);

    // Position differs from true circular motion by the known Euler–analytic gap.
    const expectedPositionError = Math.hypot(
      expectedEuler.x - analytic.x,
      expectedEuler.z - analytic.z,
    );
    const positionError = Math.hypot(
      particle.position.x - analytic.x,
      particle.position.z - analytic.z,
    );
    expect(Math.abs(positionError - expectedPositionError)).toBeLessThan(
      floatTol,
    );
  });

  it("moves from +X toward -Z over the first quarter period (curved CCW path)", () => {
    const dt = 0.1;
    const quarterPeriod = duration / 4;
    const { particle, steps } = runRotationTracer(
      dt,
      quarterPeriod,
      omega,
      x0,
      y0,
      z0,
    );

    const expectedEuler = eulerPositionClosedForm(x0, z0, omega, dt, steps);
    const analytic = analyticPosition(x0, z0, omega, quarterPeriod);

    expect(Math.abs(particle.position.y - y0)).toBeLessThan(floatTol);
    expect(Math.abs(particle.position.x - expectedEuler.x)).toBeLessThan(
      floatTol,
    );
    expect(Math.abs(particle.position.z - expectedEuler.z)).toBeLessThan(
      floatTol,
    );

    // Analytic quarter turn: (1000, 1000, 0) → (0, 1000, -1000).
    expect(Math.abs(analytic.x - 0)).toBeLessThan(floatTol);
    expect(Math.abs(analytic.z - -1000)).toBeLessThan(floatTol);
    expect(particle.position.z).toBeLessThan(0);
    expect(particle.position.x).toBeLessThan(x0);
  });

  it("reduces radius and position error vs analytic motion as dt decreases", () => {
    const radiusError = (dt: number) => {
      const { particle } = runRotationTracer(dt, duration, omega, x0, y0, z0);
      const rNum = horizontalRadius(particle.position.x, particle.position.z);
      return Math.abs(rNum - r0);
    };

    const positionError = (dt: number) => {
      const { particle } = runRotationTracer(dt, duration, omega, x0, y0, z0);
      const analytic = analyticPosition(x0, z0, omega, duration);
      return Math.hypot(
        particle.position.x - analytic.x,
        particle.position.z - analytic.z,
      );
    };

    expect(radiusError(0.01)).toBeLessThan(radiusError(0.1));
    expect(radiusError(0.1)).toBeLessThan(radiusError(1.0));

    expect(positionError(0.01)).toBeLessThan(positionError(0.1));
    expect(positionError(0.1)).toBeLessThan(positionError(1.0));
  });
});
