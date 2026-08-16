import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../core/integrators/RK2Integrator.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { VerticalEnvelopeUpdraftField } from "../physics/storm/VerticalEnvelopeUpdraftField.js";
import { Simulation } from "./Simulation.js";
import type { TracerParticle } from "./TracerParticle.js";

const centerX = 2500;
const centerZ = -1000;
const peakVerticalVelocity = 40;
const sigma = 3000;
const baseHeight = 0;
const topHeight = 2000;
const heightSpan = topHeight - baseHeight;
const yMid = (baseHeight + topHeight) / 2;
const y0 = 400;
const dx0 = 1500;
const dz0 = 0;
const radialEnvelope0 = Math.exp(
  -(dx0 * dx0 + dz0 * dz0) / (2 * sigma * sigma),
);
const duration = 20;
const floatTol = 1e-9;

function closedY(yStart: number, weff: number, t: number): number {
  const xi0 = (yStart - baseHeight) / heightSpan;
  const xi =
    ((2 / Math.PI) *
      Math.atan(
        Math.tan((Math.PI * xi0) / 2) * Math.exp((Math.PI * weff * t) / heightSpan),
      ));
  return baseHeight + heightSpan * xi;
}

function createField() {
  return new VerticalEnvelopeUpdraftField({
    centerX,
    centerZ,
    peakVerticalVelocity,
    sigma,
    baseHeight,
    topHeight,
  });
}

function runTracer(
  integrator: Integrator,
  dt: number,
  start: { x: number; y: number; z: number },
  runDuration = duration,
) {
  const particle: TracerParticle = {
    position: { ...start },
    age: 0,
    active: true,
  };
  const simulation = new Simulation(createField(), integrator, [particle]);

  const steps = Math.round(runDuration / dt);
  for (let i = 0; i < steps; i++) {
    simulation.step(dt);
  }

  return { particle, simulation };
}

function yError(
  integrator: Integrator,
  dt: number,
  start: { x: number; y: number; z: number },
  weff: number,
) {
  const { particle } = runTracer(integrator, dt, start);
  return Math.abs(particle.position.y - closedY(start.y, weff, duration));
}

describe("vertical envelope updraft field tracer acceptance", () => {
  it("keeps a tracer at rest below, at, and above the lids", () => {
    const starts = [
      { x: centerX, y: baseHeight - 200, z: centerZ },
      { x: centerX, y: baseHeight, z: centerZ },
      { x: centerX, y: topHeight, z: centerZ },
      { x: centerX + 400, y: topHeight + 300, z: centerZ - 80 },
    ];
    const dt = 0.1;

    for (const start of starts) {
      for (const integrator of [new EulerIntegrator(), new RK2Integrator()]) {
        const { particle } = runTracer(integrator, dt, start);
        expect(Math.abs(particle.position.x - start.x)).toBeLessThan(floatTol);
        expect(Math.abs(particle.position.y - start.y)).toBeLessThan(floatTol);
        expect(Math.abs(particle.position.z - start.z)).toBeLessThan(floatTol);
      }
    }
  });

  it("matches the isolated closed-form y(t) on axis for Euler and RK2", () => {
    const start = { x: centerX, y: y0, z: centerZ };
    const expectedY = closedY(y0, peakVerticalVelocity, duration);
    const euler = runTracer(new EulerIntegrator(), 0.01, start);
    const rk2 = runTracer(new RK2Integrator(), 0.01, start);
    const eulerError = Math.abs(euler.particle.position.y - expectedY);
    const rk2Error = Math.abs(rk2.particle.position.y - expectedY);

    for (const particle of [euler.particle, rk2.particle]) {
      expect(particle.position.x).toBe(centerX);
      expect(particle.position.z).toBe(centerZ);
      expect(particle.position.y).toBeGreaterThan(y0);
      expect(particle.position.y).toBeLessThan(topHeight);
    }

    expect(eulerError).toBeGreaterThan(0);
    expect(rk2Error).toBeGreaterThan(0);
    expect(eulerError).toBeLessThan(1);
    expect(rk2Error).toBeLessThan(0.01);
    expect(rk2Error).toBeLessThan(eulerError);
  });

  it("matches the isolated closed-form y(t) off-axis with W_eff = W0 E_r", () => {
    const start = { x: centerX + dx0, y: y0, z: centerZ + dz0 };
    const weff = peakVerticalVelocity * radialEnvelope0;
    const expectedY = closedY(y0, weff, duration);
    const { particle } = runTracer(new RK2Integrator(), 0.01, start);

    expect(particle.position.x).toBe(start.x);
    expect(particle.position.z).toBe(start.z);
    expect(particle.position.y).toBeLessThan(topHeight);
    expect(Math.abs(particle.position.y - expectedY)).toBeLessThan(1e-3);
  });

  it("does not treat y(t)=y0+W0 t as the interior oracle", () => {
    const start = { x: centerX, y: y0, z: centerZ };
    const { particle } = runTracer(new RK2Integrator(), 0.01, start);
    const linearY = y0 + peakVerticalVelocity * duration;
    const closed = closedY(y0, peakVerticalVelocity, duration);

    expect(Math.abs(particle.position.y - linearY)).toBeGreaterThan(1);
    expect(Math.abs(closed - linearY)).toBeGreaterThan(1);
    expect(Math.abs(particle.position.y - closed)).toBeLessThan(
      Math.abs(particle.position.y - linearY),
    );
  });

  it("approaches the continuous closed form as dt decreases", () => {
    const start = { x: centerX, y: y0, z: centerZ };

    for (const IntegratorType of [EulerIntegrator, RK2Integrator]) {
      const e1 = yError(new IntegratorType(), 1.0, start, peakVerticalVelocity);
      const e01 = yError(new IntegratorType(), 0.1, start, peakVerticalVelocity);
      const e001 = yError(new IntegratorType(), 0.01, start, peakVerticalVelocity);

      expect(e001).toBeLessThan(e01);
      expect(e01).toBeLessThan(e1);
    }
  });

  it("has smaller y error with RK2 than Euler at each dt", () => {
    const start = { x: centerX, y: y0, z: centerZ };

    for (const dt of [1.0, 0.1, 0.01]) {
      const euler = yError(new EulerIntegrator(), dt, start, peakVerticalVelocity);
      const rk2 = yError(new RK2Integrator(), dt, start, peakVerticalVelocity);
      expect(rk2).toBeLessThan(euler);
    }
  });

  it("resamples Vy with height after passing y_mid", () => {
    const start = { x: centerX, y: y0, z: centerZ };
    const field = createField();
    const vyMid = field.sample({ x: centerX, y: yMid, z: centerZ }, 0).y;
    const { particle } = runTracer(new RK2Integrator(), 0.1, start, duration);

    expect(particle.position.y).toBeGreaterThan(yMid);
    expect(particle.position.y).toBeLessThan(topHeight);
    const vyLater = field.sample(particle.position, duration).y;
    expect(vyLater).toBeLessThan(vyMid);
    expect(vyLater).toBeGreaterThan(0);
  });
});
