import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../core/integrators/RK2Integrator.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { RadialInflowField } from "../physics/storm/RadialInflowField.js";
import { Simulation } from "./Simulation.js";
import type { TracerParticle } from "./TracerParticle.js";

const centerX = 1000;
const centerZ = -500;
const radialStrainRate = 0.05;
const sigma = 2000;
const dx0 = 1600;
const dz0 = 1200;
const y0 = 1500;
const r0 = Math.hypot(dx0, dz0);
const duration = 20;
const referenceDt = 0.001;
const floatTol = 1e-9;

function horizontalRadius(x: number, z: number): number {
  return Math.hypot(x - centerX, z - centerZ);
}

function rayCross(x: number, z: number): number {
  const dx = x - centerX;
  const dz = z - centerZ;
  return dx0 * dz - dz0 * dx;
}

function runTracer(
  integrator: Integrator,
  dt: number,
  runDuration = duration,
  start: { x: number; y: number; z: number } = {
    x: centerX + dx0,
    y: y0,
    z: centerZ + dz0,
  },
) {
  const field = new RadialInflowField({
    centerX,
    centerZ,
    radialStrainRate,
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

function referenceState() {
  const { particle } = runTracer(new RK2Integrator(), referenceDt);
  return {
    radius: horizontalRadius(particle.position.x, particle.position.z),
  };
}

const reference = referenceState();

function radiusError(integrator: Integrator, dt: number): {
  particle: TracerParticle;
  radius: number;
  radiusError: number;
  rayError: number;
} {
  const { particle } = runTracer(integrator, dt);
  const radius = horizontalRadius(particle.position.x, particle.position.z);
  return {
    particle,
    radius,
    radiusError: Math.abs(radius - reference.radius),
    rayError: Math.abs(rayCross(particle.position.x, particle.position.z)),
  };
}

describe("radial inflow field tracer acceptance", () => {
  it("keeps an on-axis tracer at rest for Euler and RK2", () => {
    const start = { x: centerX, y: y0, z: centerZ };
    const dt = 0.1;

    for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
      const { particle, simulation } = runTracer(
        integrator,
        dt,
        duration,
        start,
      );

      expect(Math.abs(simulation.clock.time - duration)).toBeLessThan(floatTol);
      expect(Math.abs(particle.position.x - centerX)).toBeLessThan(floatTol);
      expect(Math.abs(particle.position.y - y0)).toBeLessThan(floatTol);
      expect(Math.abs(particle.position.z - centerZ)).toBeLessThan(floatTol);
    }
  });

  it("preserves the horizontal ray and height for Euler and RK2", () => {
    for (const dt of [1.0, 0.1, 0.01]) {
      for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
        const { particle } = runTracer(integrator, dt);
        expect(Math.abs(particle.position.y - y0)).toBeLessThan(floatTol);
        expect(
          Math.abs(rayCross(particle.position.x, particle.position.z)),
        ).toBeLessThan(1e-8);
      }
    }
  });

  it("decreases radius without reaching the axis", () => {
    for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
      const { particle } = runTracer(integrator, 0.1);
      const radius = horizontalRadius(
        particle.position.x,
        particle.position.z,
      );
      expect(radius).toBeLessThan(r0);
      expect(radius).toBeGreaterThan(0);
    }
  });

  it("keeps high-resolution RK2 radius inside continuous bounds, not the linear exponential", () => {
    const exponential = r0 * Math.exp(-radialStrainRate * duration);
    expect(reference.radius).toBeLessThan(r0);
    expect(reference.radius).toBeGreaterThan(exponential);
    expect(Math.abs(reference.radius - exponential)).toBeGreaterThan(1e-3);
  });

  it("approaches the high-resolution RK2 radius as dt decreases", () => {
    for (const IntegratorType of [EulerIntegrator, RK2Integrator]) {
      const e1 = radiusError(new IntegratorType(), 1.0);
      const e01 = radiusError(new IntegratorType(), 0.1);
      const e001 = radiusError(new IntegratorType(), 0.01);

      expect(e001.radiusError).toBeLessThan(e01.radiusError);
      expect(e01.radiusError).toBeLessThan(e1.radiusError);
    }
  });

  it("has smaller radius error with RK2 than Euler at each dt", () => {
    for (const dt of [1.0, 0.1, 0.01]) {
      const euler = radiusError(new EulerIntegrator(), dt);
      const rk2 = radiusError(new RK2Integrator(), dt);

      expect(rk2.radiusError).toBeLessThan(euler.radiusError);
      expect(rk2.rayError).toBeLessThan(1e-8);
      expect(euler.rayError).toBeLessThan(1e-8);
    }
  });

  it("places RK2 near the high-resolution reference at small dt without claiming exactness", () => {
    const rk2 = radiusError(new RK2Integrator(), 0.01);
    const euler = radiusError(new EulerIntegrator(), 0.01);

    expect(rk2.radiusError).toBeLessThan(0.01);
    expect(rk2.radiusError).toBeGreaterThan(0);
    expect(euler.radiusError).toBeGreaterThan(rk2.radiusError);
  });
});
