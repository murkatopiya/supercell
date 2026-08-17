import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../core/integrators/RK2Integrator.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { NearGroundRadialOutflowField } from "../physics/storm/NearGroundRadialOutflowField.js";
import { Simulation } from "./Simulation.js";
import type { TracerAdvectionState } from "./TracerParticle.js";

const centerX = 1000;
const centerZ = -500;
const outflowStrainRate = 0.05;
const sigma = 2000;
const baseHeight = 500;
const topHeight = 4500;
const heightSpan = topHeight - baseHeight;
const yPlateau = baseHeight - 80;
const yTaper = (baseHeight + topHeight) / 2;
const dx0 = 1600;
const dz0 = 1200;
const r0 = Math.hypot(dx0, dz0);
const duration = 20;
const referenceDt = 0.001;
const floatTol = 1e-9;

function verticalEnvelope(y: number): number {
  if (y >= topHeight) {
    return 0;
  }
  if (y <= baseHeight) {
    return 1;
  }
  return Math.cos((Math.PI * (y - baseHeight)) / (2 * heightSpan));
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
  return new NearGroundRadialOutflowField({
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
    y: yPlateau,
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

function radiusError(integrator: Integrator, dt: number): {
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

describe("near-ground radial outflow field tracer acceptance", () => {
  it("keeps an on-axis tracer at rest for Euler and RK2", () => {
    const start = { x: centerX, y: yPlateau, z: centerZ };
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
      expect(Math.abs(particle.position.y - yPlateau)).toBeLessThan(floatTol);
      expect(Math.abs(particle.position.z - centerZ)).toBeLessThan(floatTol);
    }
  });

  it("keeps a tracer at rest at and above topHeight", () => {
    const starts = [
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

  it("preserves the horizontal ray and height on the plateau and in the taper", () => {
    const starts = [
      { x: centerX + dx0, y: yPlateau, z: centerZ + dz0 },
      { x: centerX + dx0, y: yTaper, z: centerZ + dz0 },
    ];

    for (const start of starts) {
      for (const dt of [1.0, 0.1, 0.01]) {
        for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
          const { particle } = runTracer(integrator, dt, duration, start);
          expect(Math.abs(particle.position.y - start.y)).toBeLessThan(floatTol);
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
    }
  });

  it("increases radius on the plateau while staying finite", () => {
    for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
      const { particle } = runTracer(integrator, 0.1);
      const radius = horizontalRadius(
        particle.position.x,
        particle.position.z,
      );
      expect(radius).toBeGreaterThan(r0);
      expect(Number.isFinite(radius)).toBe(true);
      expect(particle.position.y).toBe(yPlateau);
      expect(particle.active).toBe(true);
    }
  });

  it("increases radius in the taper while staying finite", () => {
    const start = { x: centerX + dx0, y: yTaper, z: centerZ + dz0 };
    for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
      const { particle } = runTracer(integrator, 0.1, duration, start);
      const radius = horizontalRadius(
        particle.position.x,
        particle.position.z,
      );
      expect(radius).toBeGreaterThan(r0);
      expect(Number.isFinite(radius)).toBe(true);
      expect(particle.position.y).toBe(yTaper);
      expect(particle.active).toBe(true);
    }
  });

  it("spreads at y = 0 when G(0) > 0 and stays active at y = 0", () => {
    const start = { x: centerX + dx0, y: 0, z: centerZ + dz0 };
    expect(verticalEnvelope(0)).toBe(1);

    for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
      const { particle } = runTracer(integrator, 0.1, duration, start);
      const radius = horizontalRadius(
        particle.position.x,
        particle.position.z,
      );
      expect(particle.position.y).toBe(0);
      expect(particle.active).toBe(true);
      expect(radius).toBeGreaterThan(r0);
      expect(radius).toBeLessThan(
        r0 * Math.exp(outflowStrainRate * duration),
      );
    }
  });

  it("keeps high-resolution RK2 radius inside continuous bounds, not the linear exponential", () => {
    const g0 = verticalEnvelope(yPlateau);
    expect(g0).toBe(1);
    const exponential = r0 * Math.exp(outflowStrainRate * g0 * duration);
    expect(reference.radius).toBeGreaterThan(r0);
    expect(reference.radius).toBeLessThan(exponential);
    expect(Math.abs(reference.radius - exponential)).toBeGreaterThan(1e-3);
  });

  it("keeps taper RK2 radius inside A_eff bounds", () => {
    const g0 = verticalEnvelope(yTaper);
    expect(g0).toBeGreaterThan(0);
    expect(g0).toBeLessThan(1);
    const { particle } = runTracer(new RK2Integrator(), referenceDt, duration, {
      x: centerX + dx0,
      y: yTaper,
      z: centerZ + dz0,
    });
    const radius = horizontalRadius(particle.position.x, particle.position.z);
    const exponential = r0 * Math.exp(outflowStrainRate * g0 * duration);
    expect(radius).toBeGreaterThan(r0);
    expect(radius).toBeLessThan(exponential);
    expect(particle.position.y).toBe(yTaper);
  });

  it("matches radius growth at two plateau heights with the same r0", () => {
    const a = runTracer(new RK2Integrator(), 0.01, duration, {
      x: centerX + dx0,
      y: yPlateau,
      z: centerZ + dz0,
    });
    const b = runTracer(new RK2Integrator(), 0.01, duration, {
      x: centerX + dx0,
      y: 0,
      z: centerZ + dz0,
    });
    const rA = horizontalRadius(a.particle.position.x, a.particle.position.z);
    const rB = horizontalRadius(b.particle.position.x, b.particle.position.z);

    expect(a.particle.position.y).toBe(yPlateau);
    expect(b.particle.position.y).toBe(0);
    expect(rA).toBeCloseTo(rB, 10);
    expect(rA).toBeGreaterThan(r0);
  });

  it("grows radius slower in the taper than on the plateau for the same r0", () => {
    const gPlateau = verticalEnvelope(yPlateau);
    const gTaper = verticalEnvelope(yTaper);
    expect(gPlateau).toBeGreaterThan(gTaper);
    expect(gTaper).toBeGreaterThan(0);

    const plateau = runTracer(new RK2Integrator(), 0.01, duration, {
      x: centerX + dx0,
      y: yPlateau,
      z: centerZ + dz0,
    });
    const taper = runTracer(new RK2Integrator(), 0.01, duration, {
      x: centerX + dx0,
      y: yTaper,
      z: centerZ + dz0,
    });
    const rPlateau = horizontalRadius(
      plateau.particle.position.x,
      plateau.particle.position.z,
    );
    const rTaper = horizontalRadius(
      taper.particle.position.x,
      taper.particle.position.z,
    );

    expect(plateau.particle.position.y).toBe(yPlateau);
    expect(taper.particle.position.y).toBe(yTaper);
    expect(rPlateau).toBeGreaterThan(rTaper);
    expect(rTaper).toBeGreaterThan(r0);
    expect(rPlateau).toBeLessThan(
      r0 * Math.exp(outflowStrainRate * gPlateau * duration),
    );
    expect(rTaper).toBeLessThan(
      r0 * Math.exp(outflowStrainRate * gTaper * duration),
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
