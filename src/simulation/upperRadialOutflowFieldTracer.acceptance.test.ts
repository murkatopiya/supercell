import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../core/integrators/RK2Integrator.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { UpperRadialOutflowField } from "../physics/storm/UpperRadialOutflowField.js";
import { Simulation } from "./Simulation.js";
import type { TracerAdvectionState } from "./TracerParticle.js";

const centerX = 1000;
const centerZ = -500;
const outflowStrainRate = 0.05;
const sigma = 2000;
const baseHeight = 500;
const topHeight = 4500;
const heightSpan = topHeight - baseHeight;
const yMid = (baseHeight + topHeight) / 2;
const dx0 = 1600;
const dz0 = 1200;
const r0 = Math.hypot(dx0, dz0);
const duration = 20;
const referenceDt = 0.001;
const floatTol = 1e-9;

function verticalEnvelope(y: number): number {
  if (y < baseHeight || y > topHeight) {
    return 0;
  }
  return Math.sin((Math.PI * (y - baseHeight)) / heightSpan);
}

function horizontalRadius(x: number, z: number): number {
  return Math.hypot(x - centerX, z - centerZ);
}

function rayCross(x: number, z: number): number {
  const dx = x - centerX;
  const dz = z - centerZ;
  return dx0 * dz - dz0 * dx;
}

function createField() {
  return new UpperRadialOutflowField({
    centerX,
    centerZ,
    outflowStrainRate,
    sigma,
    baseHeight,
    topHeight,
  });
}

function runTracer(
  integrator: Integrator,
  dt: number,
  runDuration = duration,
  start: { x: number; y: number; z: number } = {
    x: centerX + dx0,
    y: yMid,
    z: centerZ + dz0,
  },
) {
  const particle: TracerAdvectionState = {
    position: { ...start },
    age: 0,
    active: true,
  };
  const simulation = new Simulation(createField(), integrator, [particle]);

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

function radiusError(
  integrator: Integrator,
  dt: number,
): {
  particle: TracerAdvectionState;
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

describe("upper radial outflow field tracer acceptance", () => {
  it("keeps an on-axis tracer at rest for Euler and RK2", () => {
    const start = { x: centerX, y: yMid, z: centerZ };
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
      expect(Math.abs(particle.position.y - yMid)).toBeLessThan(floatTol);
      expect(Math.abs(particle.position.z - centerZ)).toBeLessThan(floatTol);
    }
  });

  it("keeps a tracer at rest at the lids and outside the layer", () => {
    const starts = [
      { x: centerX + dx0, y: baseHeight - 200, z: centerZ + dz0 },
      { x: centerX + dx0, y: baseHeight, z: centerZ + dz0 },
      { x: centerX + dx0, y: topHeight, z: centerZ + dz0 },
      { x: centerX + 400, y: topHeight + 300, z: centerZ - 80 },
    ];
    const dt = 0.1;

    for (const start of starts) {
      for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
        const { particle } = runTracer(integrator, dt, duration, start);
        expect(Math.abs(particle.position.x - start.x)).toBeLessThan(floatTol);
        expect(Math.abs(particle.position.y - start.y)).toBeLessThan(floatTol);
        expect(Math.abs(particle.position.z - start.z)).toBeLessThan(floatTol);
      }
    }
  });

  it("preserves the horizontal ray and height for Euler and RK2", () => {
    for (const dt of [1.0, 0.1, 0.01]) {
      for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
        const { particle } = runTracer(integrator, dt);
        expect(Math.abs(particle.position.y - yMid)).toBeLessThan(floatTol);
        const radius = horizontalRadius(
          particle.position.x,
          particle.position.z,
        );
        expect(
          Math.abs(rayCross(particle.position.x, particle.position.z)) /
            (r0 * radius),
        ).toBeLessThan(1e-12);
      }
    }
  });

  it("increases radius while staying finite", () => {
    for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
      const { particle } = runTracer(integrator, 0.1);
      const radius = horizontalRadius(
        particle.position.x,
        particle.position.z,
      );
      expect(radius).toBeGreaterThan(r0);
      expect(Number.isFinite(radius)).toBe(true);
    }
  });

  it("keeps high-resolution RK2 radius inside continuous bounds, not the linear exponential", () => {
    const g0 = verticalEnvelope(yMid);
    const exponential = r0 * Math.exp(outflowStrainRate * g0 * duration);
    expect(reference.radius).toBeGreaterThan(r0);
    expect(reference.radius).toBeLessThan(exponential);
    expect(Math.abs(reference.radius - exponential)).toBeGreaterThan(1e-3);
  });

  it("grows radius faster at larger G for the same r0", () => {
    const lowerY = yMid - 800;
    const gMid = verticalEnvelope(yMid);
    const gLower = verticalEnvelope(lowerY);
    expect(gMid).toBeGreaterThan(gLower);
    expect(gLower).toBeGreaterThan(0);

    const mid = runTracer(new RK2Integrator(), 0.01, duration, {
      x: centerX + dx0,
      y: yMid,
      z: centerZ + dz0,
    });
    const lower = runTracer(new RK2Integrator(), 0.01, duration, {
      x: centerX + dx0,
      y: lowerY,
      z: centerZ + dz0,
    });
    const rMid = horizontalRadius(mid.particle.position.x, mid.particle.position.z);
    const rLower = horizontalRadius(
      lower.particle.position.x,
      lower.particle.position.z,
    );

    expect(mid.particle.position.y).toBe(yMid);
    expect(lower.particle.position.y).toBe(lowerY);
    expect(rMid).toBeGreaterThan(rLower);
    expect(rLower).toBeGreaterThan(r0);
    expect(rMid).toBeLessThan(r0 * Math.exp(outflowStrainRate * gMid * duration));
    expect(rLower).toBeLessThan(
      r0 * Math.exp(outflowStrainRate * gLower * duration),
    );
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
      expect(rk2.rayError / (r0 * rk2.radius)).toBeLessThan(1e-12);
      expect(euler.rayError / (r0 * euler.radius)).toBeLessThan(1e-12);
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
