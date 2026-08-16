import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../core/integrators/RK2Integrator.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { VerticalEnvelopeRotationField } from "../physics/storm/VerticalEnvelopeRotationField.js";
import { Simulation } from "./Simulation.js";
import type { TracerParticle } from "./TracerParticle.js";

const centerX = 1000;
const centerZ = -500;
const angularVelocity = 0.05;
const sigma = 2000;
const baseHeight = 500;
const topHeight = 4500;
const heightSpan = topHeight - baseHeight;
const yMid = (baseHeight + topHeight) / 2;
const dx0 = 2000;
const dz0 = 0;
const r0 = Math.hypot(dx0, dz0);
const duration = 20;
const floatTol = 1e-9;

function verticalEnvelope(y: number): number {
  if (y < baseHeight || y > topHeight) {
    return 0;
  }
  return Math.sin((Math.PI * (y - baseHeight)) / heightSpan);
}

function omegaEffAtHeight(y: number): number {
  return (
    angularVelocity *
    verticalEnvelope(y) *
    Math.exp(-(r0 * r0) / (2 * sigma * sigma))
  );
}

function analyticPosition(
  t: number,
  y0: number,
): { x: number; z: number } {
  const omegaEff = omegaEffAtHeight(y0);
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

function createField(omega = angularVelocity) {
  return new VerticalEnvelopeRotationField({
    centerX,
    centerZ,
    angularVelocity: omega,
    sigma,
    baseHeight,
    topHeight,
  });
}

function runTracer(
  integrator: Integrator,
  dt: number,
  runDuration = duration,
  omega = angularVelocity,
  start: { x: number; y: number; z: number } = {
    x: centerX + dx0,
    y: yMid,
    z: centerZ + dz0,
  },
) {
  const particle: TracerParticle = {
    position: { ...start },
    age: 0,
    active: true,
  };
  const simulation = new Simulation(createField(omega), integrator, [particle]);

  const steps = Math.round(runDuration / dt);
  for (let i = 0; i < steps; i++) {
    simulation.step(dt);
  }

  return { particle, simulation, steps };
}

function errors(integrator: Integrator, dt: number, y0 = yMid) {
  const start = {
    x: centerX + dx0,
    y: y0,
    z: centerZ + dz0,
  };
  const { particle } = runTracer(integrator, dt, duration, angularVelocity, start);
  const analytic = analyticPosition(duration, y0);
  const positionError = Math.hypot(
    particle.position.x - analytic.x,
    particle.position.z - analytic.z,
  );
  const radiusError = Math.abs(
    horizontalRadius(particle.position.x, particle.position.z) - r0,
  );
  return { particle, positionError, radiusError };
}

describe("vertical envelope rotation field tracer acceptance", () => {
  it("keeps an on-axis tracer at rest inside and outside the layer", () => {
    const dt = 0.1;
    const starts = [
      { x: centerX, y: yMid, z: centerZ },
      { x: centerX, y: baseHeight - 200, z: centerZ },
      { x: centerX, y: topHeight + 200, z: centerZ },
    ];

    for (const start of starts) {
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
        expect(Math.abs(particle.position.y - start.y)).toBeLessThan(floatTol);
        expect(Math.abs(particle.position.z - centerZ)).toBeLessThan(floatTol);
      }
    }
  });

  it("keeps an off-axis tracer at rest below baseHeight and above topHeight", () => {
    const dt = 0.1;
    const starts = [
      {
        x: centerX + dx0,
        y: baseHeight - 100,
        z: centerZ + dz0,
      },
      {
        x: centerX + dx0,
        y: topHeight + 100,
        z: centerZ + dz0,
      },
    ];

    for (const start of starts) {
      for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
        const { particle } = runTracer(
          integrator,
          dt,
          duration,
          angularVelocity,
          start,
        );
        expect(Math.abs(particle.position.x - start.x)).toBeLessThan(floatTol);
        expect(Math.abs(particle.position.y - start.y)).toBeLessThan(floatTol);
        expect(Math.abs(particle.position.z - start.z)).toBeLessThan(floatTol);
      }
    }
  });

  it("keeps Y unchanged off-axis at active height for Euler and RK2", () => {
    const interiorY = yMid - 600;
    for (const dt of [1.0, 0.1, 0.01]) {
      const euler = errors(new EulerIntegrator(), dt, interiorY);
      const rk2 = errors(new RK2Integrator(), dt, interiorY);
      expect(Math.abs(euler.particle.position.y - interiorY)).toBeLessThan(
        floatTol,
      );
      expect(Math.abs(rk2.particle.position.y - interiorY)).toBeLessThan(
        floatTol,
      );
    }
  });

  it("does not treat Euler as the continuous circle at moderate dt", () => {
    const euler = errors(new EulerIntegrator(), 1.0);
    const analytic = analyticPosition(duration, yMid);

    expect(euler.radiusError).toBeGreaterThan(1e-6);
    expect(
      horizontalRadius(euler.particle.position.x, euler.particle.position.z),
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

  it("follows the G(y0)-scaled circular oracle at a non-mid interior height", () => {
    const y0 = yMid - 800;
    expect(verticalEnvelope(y0)).toBeGreaterThan(0);
    expect(verticalEnvelope(y0)).toBeLessThan(1);

    const rk2 = errors(new RK2Integrator(), 0.01, y0);
    expect(Math.abs(rk2.particle.position.y - y0)).toBeLessThan(floatTol);
    expect(rk2.positionError).toBeLessThan(0.01);
    expect(rk2.radiusError).toBeLessThan(0.01);
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
