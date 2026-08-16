import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../core/integrators/RK2Integrator.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { RotationField } from "../physics/storm/RotationField.js";
import { Simulation } from "./Simulation.js";
import type { TracerParticle } from "./TracerParticle.js";

const centerX = 1000;
const centerZ = -500;
const angularVelocity = 0.05;
const sigma = 2000;
const dx0 = 2000;
const dz0 = 0;
const y0 = 1500;
const r0 = Math.hypot(dx0, dz0);
const omegaEff =
  angularVelocity * Math.exp(-(r0 * r0) / (2 * sigma * sigma));
const duration = 20;
const floatTol = 1e-9;

function analyticPosition(t: number): { x: number; z: number } {
  const c = Math.cos(omegaEff * t);
  const s = Math.sin(omegaEff * t);
  return {
    x: centerX + dx0 * c + dz0 * s,
    z: centerZ - dx0 * s + dz0 * c,
  };
}

function horizontalRadius(x: number, z: number): number {
  return Math.hypot(x - centerX, z - centerZ);
}

function runTracer(
  integrator: Integrator,
  dt: number,
  runDuration = duration,
  omega = angularVelocity,
  start: { x: number; y: number; z: number } = {
    x: centerX + dx0,
    y: y0,
    z: centerZ + dz0,
  },
) {
  const field = new RotationField({
    centerX,
    centerZ,
    angularVelocity: omega,
    sigma,
  });
  const particle: TracerParticle = {
    position: { ...start },
    age: 0,
    active: true,
  };
  const simulation = new Simulation(field, integrator, [particle]);

  const steps = Math.round(runDuration / dt);
  for (let i = 0; i < steps; i++) {
    simulation.step(dt);
  }

  return { particle, simulation, steps };
}

function errors(integrator: Integrator, dt: number) {
  const { particle } = runTracer(integrator, dt);
  const analytic = analyticPosition(duration);
  const positionError = Math.hypot(
    particle.position.x - analytic.x,
    particle.position.z - analytic.z,
  );
  const radiusError = Math.abs(
    horizontalRadius(particle.position.x, particle.position.z) - r0,
  );
  return { particle, positionError, radiusError };
}

describe("rotation field tracer acceptance", () => {
  it("keeps an on-axis tracer at rest for Euler and RK2", () => {
    const start = { x: centerX, y: y0, z: centerZ };
    const dt = 0.1;

    for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
      const { particle, simulation } = runTracer(
        integrator,
        dt,
        duration,
        angularVelocity,
        start,
      );

      expect(Math.abs(simulation.clock.time - duration)).toBeLessThan(floatTol);
      expect(Math.abs(particle.position.x - centerX)).toBeLessThan(floatTol);
      expect(Math.abs(particle.position.y - y0)).toBeLessThan(floatTol);
      expect(Math.abs(particle.position.z - centerZ)).toBeLessThan(floatTol);
    }
  });

  it("keeps Y unchanged off-axis for Euler and RK2", () => {
    for (const dt of [1.0, 0.1, 0.01]) {
      const euler = errors(new EulerIntegrator(), dt);
      const rk2 = errors(new RK2Integrator(), dt);
      expect(Math.abs(euler.particle.position.y - y0)).toBeLessThan(floatTol);
      expect(Math.abs(rk2.particle.position.y - y0)).toBeLessThan(floatTol);
    }
  });

  it("does not treat Euler as the continuous circle at moderate dt", () => {
    const euler = errors(new EulerIntegrator(), 1.0);
    const analytic = analyticPosition(duration);

    expect(euler.radiusError).toBeGreaterThan(1e-6);
    expect(
      horizontalRadius(
        euler.particle.position.x,
        euler.particle.position.z,
      ),
    ).toBeGreaterThan(r0);

    const positionGap = Math.hypot(
      euler.particle.position.x - analytic.x,
      euler.particle.position.z - analytic.z,
    );
    expect(positionGap).toBeGreaterThan(1e-6);
  });

  it("approaches the continuous circular solution as dt decreases", () => {
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

  it("has smaller position and radius error with RK2 than Euler at each dt", () => {
    for (const dt of [1.0, 0.1, 0.01]) {
      const euler = errors(new EulerIntegrator(), dt);
      const rk2 = errors(new RK2Integrator(), dt);

      expect(rk2.positionError).toBeLessThan(euler.positionError);
      expect(rk2.radiusError).toBeLessThan(euler.radiusError);
    }
  });

  it("places RK2 near the continuous oracle at small dt without claiming exactness", () => {
    const rk2 = errors(new RK2Integrator(), 0.01);
    const euler = errors(new EulerIntegrator(), 0.01);

    expect(rk2.positionError).toBeLessThan(0.01);
    expect(rk2.radiusError).toBeLessThan(0.01);
    expect(rk2.positionError).toBeGreaterThan(0);
    expect(euler.positionError).toBeGreaterThan(rk2.positionError);
  });

  it("reverses the off-axis sense when angularVelocity is negated", () => {
    const dt = 0.1;
    const positive = runTracer(new RK2Integrator(), dt);
    const negative = runTracer(
      new RK2Integrator(),
      dt,
      duration,
      -angularVelocity,
    );

    expect(positive.particle.position.z).toBeLessThan(centerZ);
    expect(negative.particle.position.z).toBeGreaterThan(centerZ);
  });
});
