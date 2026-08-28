import { describe, expect, it } from "vitest";
import type { Vec3 } from "../core/math/Vec3.js";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { ATMOSPHERIC_GROUND_HEIGHT, ATMOSPHERIC_TRACER_DOMAIN } from "./AtmosphericTracerDomain.js";
import { resetTracersFromSeeds } from "./resetTracersFromSeeds.js";
import { Simulation } from "./Simulation.js";
import type { TracerAdvectionState } from "./TracerParticle.js";
import tracerPathHistorySrc from "./TracerPathHistory.ts?raw";
import { TracerPathHistory } from "./TracerPathHistory.js";

function particle(
  x: number,
  y: number,
  z: number,
  active = true,
): TracerAdvectionState {
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
    history.captureInitial(particles, 0);

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
    history.captureInitial(simulation.particles, simulation.clock.time);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles, simulation.clock.time);

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
    history.captureInitial(particles, 0);

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
    history.captureInitial(particles, 0);

    particles[0]!.position = { x: 1, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);
    particles[0]!.position = { x: 2, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);

    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
    ]);
  });

  it("does not append when recordAfterStep is not called", () => {
    const particles = [particle(0, 0, 0)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles, 0);

    particles[0]!.position = { x: 50, y: 0, z: 0 };

    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 0, z: 0 }]);
  });

  it("clear then captureInitial restores length 1 at the new seed", () => {
    const particles = [particle(0, 0, 0), particle(10, 0, 0)];
    const history = new TracerPathHistory(2);
    history.captureInitial(particles, 0);
    particles[0]!.position = { x: 1, y: 0, z: 0 };
    particles[1]!.position = { x: 11, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);

    particles[0]!.position = { x: 0, y: 1000, z: 4000 };
    particles[1]!.position = { x: 0, y: 1000, z: 6000 };
    history.clear();
    expect(history.pointsFor(0)).toEqual([]);
    expect(history.pointsFor(1)).toEqual([]);

    history.captureInitial(particles, 0);
    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 1000, z: 4000 }]);
    expect(history.pointsFor(1)).toEqual([{ x: 0, y: 1000, z: 6000 }]);
  });

  it("keeps independent histories for multiple tracers", () => {
    const particles = [particle(0, 0, 0), particle(100, 0, 0)];
    const history = new TracerPathHistory(2);
    history.captureInitial(particles, 0);

    particles[0]!.position = { x: 5, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);

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
    history.captureInitial(particles, 0);

    particles[0]!.position = { x: 1, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);
    expect(history.pointsFor(0)).toHaveLength(1);

    particles[0]!.position = { x: 2, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);
    expect(history.pointsFor(0)).toHaveLength(1);

    particles[0]!.position = { x: 3, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);
    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 3, y: 0, z: 0 },
    ]);
  });

  it("defaults to stride 1", () => {
    const particles = [particle(0, 0, 0)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles, 0);
    particles[0]!.position = { x: 1, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);
    expect(history.pointsFor(0)).toHaveLength(2);
  });

  it("does not append for inactive particles", () => {
    const particles = [
      particle(0, 0, 0, true),
      particle(10, 0, 0, false),
    ];
    const history = new TracerPathHistory(2);
    history.captureInitial(particles, 0);

    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 0, z: 0 }]);
    expect(history.pointsFor(1)).toEqual([]);

    particles[0]!.position = { x: 1, y: 0, z: 0 };
    particles[1]!.position = { x: 11, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);

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
    history.captureInitial(simulation.particles, simulation.clock.time);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles, simulation.clock.time);

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
    history.captureInitial(simulation.particles, simulation.clock.time);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles, simulation.clock.time);
    const terminal = history.pointsFor(0);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles, simulation.clock.time);
    simulation.step(0.1);
    history.recordAfterStep(simulation.particles, simulation.clock.time);

    expect(simulation.particles[0]!.active).toBe(false);
    expect(history.pointsFor(0)).toEqual(terminal);
    expect(history.pointsFor(0)).toHaveLength(2);
  });

  it("does not treat y = 0 as the deactivation signal", () => {
    const particles = [particle(3, 1000, -4)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles, 0);

    particles[0]!.active = false;
    history.recordAfterStep(particles, 0);

    expect(history.pointsFor(0)).toEqual([
      { x: 3, y: 1000, z: -4 },
      { x: 3, y: 1000, z: -4 },
    ]);
  });

  it("appends a terminal sample even when deactivation falls off stride", () => {
    const particles = [particle(0, 0, 0)];
    const history = new TracerPathHistory(1, 3);
    history.captureInitial(particles, 0);

    particles[0]!.position = { x: 1, y: 0, z: 0 };
    particles[0]!.active = false;
    history.recordAfterStep(particles, 0);

    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
    ]);

    history.recordAfterStep(particles, 0);
    history.recordAfterStep(particles, 0);
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
    history.captureInitial(simulation.particles, simulation.clock.time);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles, simulation.clock.time);

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
    history.captureInitial(simulation.particles, simulation.clock.time);

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles, simulation.clock.time);
    expect(history.pointsFor(0)).toHaveLength(2);
    expect(simulation.particles[0]!.active).toBe(false);

    resetTracersFromSeeds(simulation, seeds);
    history.clear();
    history.captureInitial(simulation.particles, simulation.clock.time);

    expect(simulation.particles[0]!.active).toBe(true);
    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 1, z: 0 }]);
  });

  it("does not mutate particles", () => {
    const particles = [particle(4, 5, 6)];
    const position = particles[0]!.position;
    const history = new TracerPathHistory(1);
    history.captureInitial(particles, 0);
    history.recordAfterStep(particles, 0);

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
    history.captureInitial(particles, 0);
    const before = history.pointsFor(0);

    particles[0]!.position = { x: 8, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);

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
    expect(tracerPathHistorySrc).not.toMatch(/nearGroundOutflowPathlineSeeds/);
    expect(tracerPathHistorySrc).not.toMatch(/from ["'].*ui\//);
  });

  it("is ground-unaware: no domain, floor, or y=0 branch", () => {
    expect(tracerPathHistorySrc).not.toMatch(/AtmosphericTracerDomain/);
    expect(tracerPathHistorySrc).not.toMatch(/ATMOSPHERIC_GROUND/);
    expect(tracerPathHistorySrc).not.toMatch(/groundHeight/);
    expect(tracerPathHistorySrc).not.toMatch(/y\s*===?\s*0/);
  });

  it("allows zero lanes and later append", () => {
    const history = new TracerPathHistory(0);
    expect(history.tracerCount).toBe(0);
    history.captureInitial([], 0);
    history.recordAfterStep([], 0);
    history.clear();

    const born = particle(3, 4, 5);
    history.appendParticle(born, 0);
    expect(history.tracerCount).toBe(1);
    expect(history.pointsFor(0)).toEqual([{ x: 3, y: 4, z: 5 }]);
    expect(history.pointsFor(0)[0]).not.toBe(born.position);
  });

  it("appendParticle captures birth independently of stride and does not recapture existing lanes", () => {
    const first = particle(0, 0, 0);
    const history = new TracerPathHistory(1, 3);
    history.captureInitial([first], 0);

    first.position = { x: 1, y: 0, z: 0 };
    history.recordAfterStep([first], 0);
    first.position = { x: 2, y: 0, z: 0 };
    history.recordAfterStep([first], 0);
    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 0, z: 0 }]);

    const second = particle(50, 10, -4);
    history.appendParticle(second, 0);
    expect(history.tracerCount).toBe(2);
    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 0, z: 0 }]);
    expect(history.pointsFor(1)).toEqual([{ x: 50, y: 10, z: -4 }]);

    first.position = { x: 3, y: 0, z: 0 };
    second.position = { x: 51, y: 10, z: -4 };
    history.recordAfterStep([first, second], 0);
    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 3, y: 0, z: 0 },
    ]);
    expect(history.pointsFor(1)).toEqual([
      { x: 50, y: 10, z: -4 },
      { x: 51, y: 10, z: -4 },
    ]);
  });

  it("appendParticles preserves order and treats an empty batch as a no-op", () => {
    const history = new TracerPathHistory(0);
    history.appendParticles([], 0);
    expect(history.tracerCount).toBe(0);

    history.appendParticles([particle(1, 0, 0), particle(2, 0, 0)], 0);
    expect(history.tracerCount).toBe(2);
    expect(history.pointsFor(0)).toEqual([{ x: 1, y: 0, z: 0 }]);
    expect(history.pointsFor(1)).toEqual([{ x: 2, y: 0, z: 0 }]);
  });

  it("does not invent a terminal sample for a tracer that was inactive at append", () => {
    const history = new TracerPathHistory(0);
    const bornInactive = particle(1, 2, 3, false);
    history.appendParticle(bornInactive, 0);
    expect(history.pointsFor(0)).toEqual([{ x: 1, y: 2, z: 3 }]);

    bornInactive.position = { x: 9, y: 9, z: 9 };
    history.recordAfterStep([bornInactive], 0);
    history.recordAfterStep([bornInactive], 0);
    expect(history.pointsFor(0)).toEqual([{ x: 1, y: 2, z: 3 }]);
  });

  it("clear keeps lane count; removeAllLanes drops every lane", () => {
    const particles = [particle(0, 0, 0), particle(10, 0, 0)];
    const history = new TracerPathHistory(2);
    history.captureInitial(particles, 0);
    particles[0]!.position = { x: 1, y: 0, z: 0 };
    history.recordAfterStep(particles, 0);

    history.clear();
    expect(history.tracerCount).toBe(2);
    expect(history.pointsFor(0)).toEqual([]);
    expect(history.pointsFor(1)).toEqual([]);

    history.captureInitial(particles, 0);
    expect(history.pointsFor(0)).toEqual([{ x: 1, y: 0, z: 0 }]);
    expect(history.pointsFor(1)).toEqual([{ x: 10, y: 0, z: 0 }]);

    history.removeAllLanes();
    expect(history.tracerCount).toBe(0);
    expect(() => history.pointsFor(0)).toThrow(/out of range/);

    history.appendParticle(particle(7, 8, 9), 0);
    expect(history.tracerCount).toBe(1);
    expect(history.pointsFor(0)).toEqual([{ x: 7, y: 8, z: 9 }]);
  });

  it("stores copied position and recorded simulationTime on each sample", () => {
    const particles = [particle(0, 0, 0)];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      particles,
    );
    const history = new TracerPathHistory(1);
    history.captureInitial(simulation.particles, simulation.clock.time);
    expect(history.samplesFor(0)).toEqual([
      { position: { x: 0, y: 0, z: 0 }, simulationTime: 0 },
    ]);
    expect(history.samplesFor(0)[0]!.position).not.toBe(
      simulation.particles[0]!.position,
    );

    simulation.step(0.1);
    history.recordAfterStep(simulation.particles, simulation.clock.time);
    expect(history.samplesFor(0)[1]).toEqual({
      position: { x: 1, y: 0, z: 0 },
      simulationTime: 0.1,
    });
    expect(history.samplesFor(0)[1]!.position).not.toBe(
      simulation.particles[0]!.position,
    );

    const snapshot = history.samplesFor(0);
    snapshot[0]!.position.x = 99;
    expect(history.samplesFor(0)[0]!.position).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("records appendParticle time as the clock at birth, not a reconstructed index", () => {
    const history = new TracerPathHistory(0);
    const born = particle(3, 4, 5);
    history.appendParticle(born, 2.4);
    expect(history.samplesFor(0)).toEqual([
      { position: { x: 3, y: 4, z: 5 }, simulationTime: 2.4 },
    ]);
  });

  it("rejects non-finite simulationTime", () => {
    const history = new TracerPathHistory(1);
    const particles = [particle(0, 0, 0)];
    expect(() => history.captureInitial(particles, Number.NaN)).toThrow(
      /simulationTime must be finite/,
    );
    expect(() =>
      history.recordAfterStep(particles, Number.POSITIVE_INFINITY),
    ).toThrow(/simulationTime must be finite/);
    expect(() => history.appendParticle(particle(1, 2, 3), Number.NaN)).toThrow(
      /simulationTime must be finite/,
    );
  });
});
