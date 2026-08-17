import { describe, expect, it } from "vitest";
import type { Vec3 } from "../core/math/Vec3.js";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { ATMOSPHERIC_GROUND_HEIGHT, ATMOSPHERIC_TRACER_DOMAIN } from "./AtmosphericTracerDomain.js";
import { resetTracersFromSeeds } from "./resetTracersFromSeeds.js";
import { Simulation } from "./Simulation.js";
import type { TracerParticle } from "./TracerParticle.js";
import tracerPathHistorySrc from "./TracerPathHistory.ts?raw";
import { TracerPathHistory } from "./TracerPathHistory.js";

function particle(
  x: number,
  y: number,
  z: number,
  active = true,
): TracerParticle {
  return {
    position: { x, y, z },
    age: 0,
    active,
  };
}

describe("TracerPathHistory", () => {
  it("captures one copied initial point per active tracer", () => {
    const particles = [particle(0, 1000, 4000), particle(0, 1000, 6000)];
    const history = new TracerPathHistory(2);
    history.captureInitial(particles);

    expect(history.tracerCount).toBe(2);
    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 1000, z: 4000 }]);
    expect(history.pointsFor(1)).toEqual([{ x: 0, y: 1000, z: 6000 }]);
    expect(history.pointsFor(0)[0]).not.toBe(particles[0]!.position);
    expect(history.pointsFor(1)[0]).not.toBe(particles[1]!.position);
  });

  it("appends the particle position after one completed Simulation.step", () => {
    const particles = [particle(0, 0, 0)];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      particles,
    );
    const history = new TracerPathHistory(1);
    history.captureInitial(simulation.particles);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles);

    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
    ]);
    expect(history.pointsFor(0)[1]).toEqual(simulation.particles[0]!.position);
    expect(history.pointsFor(0)[1]).not.toBe(simulation.particles[0]!.position);
  });

  it("stores copies, not aliases of particle.position or returned snapshots", () => {
    const particles = [particle(1, 2, 3)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles);

    particles[0]!.position.x = 999;
    expect(history.pointsFor(0)[0]).toEqual({ x: 1, y: 2, z: 3 });

    const snapshot = history.pointsFor(0);
    snapshot[0]!.x = 7;
    (snapshot as Vec3[]).push({ x: 0, y: 0, z: 0 });
    expect(history.pointsFor(0)).toEqual([{ x: 1, y: 2, z: 3 }]);
  });

  it("keeps chronological order with index 0 as the initial capture", () => {
    const particles = [particle(0, 0, 0)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles);

    particles[0]!.position = { x: 1, y: 0, z: 0 };
    history.recordAfterStep(particles);
    particles[0]!.position = { x: 2, y: 0, z: 0 };
    history.recordAfterStep(particles);

    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
    ]);
  });

  it("does not append when recordAfterStep is not called", () => {
    const particles = [particle(0, 0, 0)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles);

    particles[0]!.position = { x: 50, y: 0, z: 0 };

    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 0, z: 0 }]);
  });

  it("clear then captureInitial restores length 1 at the new seed", () => {
    const particles = [particle(0, 0, 0), particle(10, 0, 0)];
    const history = new TracerPathHistory(2);
    history.captureInitial(particles);
    particles[0]!.position = { x: 1, y: 0, z: 0 };
    particles[1]!.position = { x: 11, y: 0, z: 0 };
    history.recordAfterStep(particles);

    particles[0]!.position = { x: 0, y: 1000, z: 4000 };
    particles[1]!.position = { x: 0, y: 1000, z: 6000 };
    history.clear();
    expect(history.pointsFor(0)).toEqual([]);
    expect(history.pointsFor(1)).toEqual([]);

    history.captureInitial(particles);
    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 1000, z: 4000 }]);
    expect(history.pointsFor(1)).toEqual([{ x: 0, y: 1000, z: 6000 }]);
  });

  it("keeps independent histories for multiple tracers", () => {
    const particles = [particle(0, 0, 0), particle(100, 0, 0)];
    const history = new TracerPathHistory(2);
    history.captureInitial(particles);

    particles[0]!.position = { x: 5, y: 0, z: 0 };
    history.recordAfterStep(particles);

    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 0, z: 0 },
    ]);
    expect(history.pointsFor(1)).toEqual([
      { x: 100, y: 0, z: 0 },
      { x: 100, y: 0, z: 0 },
    ]);
  });

  it("appends on the k-th recordAfterStep when stride is k", () => {
    const particles = [particle(0, 0, 0)];
    const history = new TracerPathHistory(1, 3);
    history.captureInitial(particles);

    particles[0]!.position = { x: 1, y: 0, z: 0 };
    history.recordAfterStep(particles);
    expect(history.pointsFor(0)).toHaveLength(1);

    particles[0]!.position = { x: 2, y: 0, z: 0 };
    history.recordAfterStep(particles);
    expect(history.pointsFor(0)).toHaveLength(1);

    particles[0]!.position = { x: 3, y: 0, z: 0 };
    history.recordAfterStep(particles);
    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 3, y: 0, z: 0 },
    ]);
  });

  it("defaults to stride 1", () => {
    const particles = [particle(0, 0, 0)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles);
    particles[0]!.position = { x: 1, y: 0, z: 0 };
    history.recordAfterStep(particles);
    expect(history.pointsFor(0)).toHaveLength(2);
  });

  it("does not append for inactive particles", () => {
    const particles = [
      particle(0, 0, 0, true),
      particle(10, 0, 0, false),
    ];
    const history = new TracerPathHistory(2);
    history.captureInitial(particles);

    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 0, z: 0 }]);
    expect(history.pointsFor(1)).toEqual([]);

    particles[0]!.position = { x: 1, y: 0, z: 0 };
    particles[1]!.position = { x: 11, y: 0, z: 0 };
    history.recordAfterStep(particles);

    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
    ]);
    expect(history.pointsFor(1)).toEqual([]);
  });

  it("appends one terminal sample when a particle becomes inactive on this step", () => {
    const particles = [particle(0, 1, 0)];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: -20, z: 8 }),
      new EulerIntegrator(),
      particles,
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const history = new TracerPathHistory(1);
    history.captureInitial(simulation.particles);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles);

    const tracer = simulation.particles[0]!;
    expect(tracer.active).toBe(false);
    expect(tracer.position.y).toBe(ATMOSPHERIC_GROUND_HEIGHT);
    expect(Object.is(tracer.position.y, 0)).toBe(true);
    expect(history.pointsFor(0)).toHaveLength(2);
    expect(history.pointsFor(0)[1]).toEqual(tracer.position);
    expect(history.pointsFor(0)[1]).not.toBe(tracer.position);
    expect(history.pointsFor(0)[1]!.y).toBe(0);
    expect(history.pointsFor(0)[1]!.x).toBeCloseTo(0.5, 12);
    expect(history.pointsFor(0)[1]!.z).toBeCloseTo(0.4, 12);
  });

  it("does not append a duplicate after the deactivating step", () => {
    const particles = [particle(0, 1, 0)];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: -20, z: 8 }),
      new EulerIntegrator(),
      particles,
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const history = new TracerPathHistory(1);
    history.captureInitial(simulation.particles);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles);
    const terminal = history.pointsFor(0);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles);
    simulation.step(0.1);
    history.recordAfterStep(simulation.particles);

    expect(simulation.particles[0]!.active).toBe(false);
    expect(history.pointsFor(0)).toEqual(terminal);
    expect(history.pointsFor(0)).toHaveLength(2);
  });

  it("does not treat y = 0 as the deactivation signal", () => {
    const particles = [particle(3, 1000, -4)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles);

    particles[0]!.active = false;
    history.recordAfterStep(particles);

    expect(history.pointsFor(0)).toEqual([
      { x: 3, y: 1000, z: -4 },
      { x: 3, y: 1000, z: -4 },
    ]);
  });

  it("appends a terminal sample even when deactivation falls off stride", () => {
    const particles = [particle(0, 0, 0)];
    const history = new TracerPathHistory(1, 3);
    history.captureInitial(particles);

    particles[0]!.position = { x: 1, y: 0, z: 0 };
    particles[0]!.active = false;
    history.recordAfterStep(particles);

    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
    ]);

    history.recordAfterStep(particles);
    history.recordAfterStep(particles);
    expect(history.pointsFor(0)).toHaveLength(2);
  });

  it("keeps an already-inactive neighbor silent while another tracer terminates", () => {
    const particles = [
      particle(0, 1, 0, true),
      particle(10, 4, 0, false),
    ];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: -20, z: 0 }),
      new EulerIntegrator(),
      particles,
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const history = new TracerPathHistory(2);
    history.captureInitial(simulation.particles);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles);

    expect(history.pointsFor(0)).toHaveLength(2);
    expect(history.pointsFor(0)[1]!.y).toBe(0);
    expect(history.pointsFor(1)).toEqual([]);
  });

  it("clears a terminal history and recaptures the seed after Reset", () => {
    const seeds = [{ x: 0, y: 1, z: 0 }];
    const particles = [particle(0, 1, 0)];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: -20, z: 0 }),
      new EulerIntegrator(),
      particles,
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const history = new TracerPathHistory(1);
    history.captureInitial(simulation.particles);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles);
    expect(history.pointsFor(0)).toHaveLength(2);
    expect(simulation.particles[0]!.active).toBe(false);

    resetTracersFromSeeds(simulation, seeds);
    history.clear();
    history.captureInitial(simulation.particles);

    expect(simulation.particles[0]!.active).toBe(true);
    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 1, z: 0 }]);
  });

  it("does not mutate particles", () => {
    const particles = [particle(4, 5, 6)];
    const position = particles[0]!.position;
    const history = new TracerPathHistory(1);
    history.captureInitial(particles);
    history.recordAfterStep(particles);

    expect(particles[0]).toEqual({
      position: { x: 4, y: 5, z: 6 },
      age: 0,
      active: true,
    });
    expect(particles[0]!.position).toBe(position);
  });

  it("returns a fresh snapshot that later appends do not mutate", () => {
    const particles = [particle(0, 0, 0)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles);
    const before = history.pointsFor(0);

    particles[0]!.position = { x: 8, y: 0, z: 0 };
    history.recordAfterStep(particles);

    expect(before).toEqual([{ x: 0, y: 0, z: 0 }]);
    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 8, y: 0, z: 0 },
    ]);
  });

  it("does not import renderer, UI, integrator, frame, or pedagogy types", () => {
    expect(tracerPathHistorySrc).not.toMatch(/from ["']three["']/);
    expect(tracerPathHistorySrc).not.toMatch(/TracerScene/);
    expect(tracerPathHistorySrc).not.toMatch(/requestAnimationFrame/);
    expect(tracerPathHistorySrc).not.toMatch(/\brAF\b/);
    expect(tracerPathHistorySrc).not.toMatch(/IntegrationFrame/);
    expect(tracerPathHistorySrc).not.toMatch(/TracerPedagogy/);
    expect(tracerPathHistorySrc).not.toMatch(/EulerIntegrator/);
    expect(tracerPathHistorySrc).not.toMatch(/RK2Integrator/);
    expect(tracerPathHistorySrc).not.toMatch(/\bsigma\b/);
    expect(tracerPathHistorySrc).not.toMatch(/\bbasin\b/);
    expect(tracerPathHistorySrc).not.toMatch(/diagnosticSeeds/);
    expect(tracerPathHistorySrc).not.toMatch(/storySeeds/);
    expect(tracerPathHistorySrc).not.toMatch(/downwardPathlineSeeds/);
    expect(tracerPathHistorySrc).not.toMatch(/from ["'].*ui\//);
  });

  it("is ground-unaware: no domain, floor, or y=0 branch", () => {
    expect(tracerPathHistorySrc).not.toMatch(/AtmosphericTracerDomain/);
    expect(tracerPathHistorySrc).not.toMatch(/ATMOSPHERIC_GROUND/);
    expect(tracerPathHistorySrc).not.toMatch(/groundHeight/);
    expect(tracerPathHistorySrc).not.toMatch(/y\s*===?\s*0/);
  });
});
