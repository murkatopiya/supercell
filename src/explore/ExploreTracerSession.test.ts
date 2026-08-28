import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { Simulation } from "../simulation/Simulation.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { AtmosphericTracerSeedError } from "../simulation/assertAtmosphericTracerSeed.js";
import appSrc from "../app/App.tsx?raw";
import exploreTracerSessionSrc from "./ExploreTracerSession.ts?raw";
import {
  ExploreTracerSession,
  ExploreTracerSessionError,
} from "./ExploreTracerSession.js";

function emptyLab() {
  const simulation = new Simulation(
    new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
    new EulerIntegrator(),
    [],
  );
  const pathHistory = new TracerPathHistory(0);
  const session = new ExploreTracerSession(simulation, pathHistory);
  return { simulation, pathHistory, session };
}

describe("ExploreTracerSession", () => {
  it("starts with zero seeds and keeps empty Reset honest", () => {
    const { simulation, pathHistory, session } = emptyLab();
    simulation.step(0.4);
    expect(session.seeds).toEqual([]);
    session.reset();
    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles).toHaveLength(0);
    expect(pathHistory.tracerCount).toBe(0);
    expect(session.seeds).toEqual([]);
  });

  it("rejects construction around a non-empty cohort", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [{ position: { x: 1, y: 1, z: 1 }, age: 0, active: true }],
    );
    const pathHistory = new TracerPathHistory(1);
    expect(() => new ExploreTracerSession(simulation, pathHistory)).toThrow(
      ExploreTracerSessionError,
    );
  });

  it("does not step on release; the tracer stays at its seed until the next step", () => {
    const { simulation, session, pathHistory } = emptyLab();
    const t = simulation.clock.time;
    session.releasePoint({ x: 7, y: 8, z: 9 });
    expect(simulation.clock.time).toBe(t);
    expect(simulation.particles[0]!.position).toEqual({ x: 7, y: 8, z: 9 });
    expect(simulation.particles[0]!.age).toBe(0);
    expect(pathHistory.samplesFor(0)[0]!.simulationTime).toBe(t);
    expect(pathHistory.samplesFor(0)[0]!.position).toEqual({
      x: 7,
      y: 8,
      z: 9,
    });
  });

  it("owns seed copies so caller mutation cannot rewrite Reset", () => {
    const { simulation, session } = emptyLab();
    const input = { x: 3, y: 4, z: 5 };
    session.releasePoint(input);
    input.x = 0;
    input.y = 0;
    input.z = 0;
    simulation.step(0.1);
    session.reset();
    expect(simulation.particles[0]!.position).toEqual({ x: 3, y: 4, z: 5 });
    expect(session.seeds[0]).toEqual({ x: 3, y: 4, z: 5 });
  });

  it("Reset does not mutate stored seeds", () => {
    const { simulation, session } = emptyLab();
    session.releasePoint({ x: 8, y: 9, z: 10 });
    simulation.step(0.1);
    const before = session.seeds;
    session.reset();
    expect(session.seeds).toEqual(before);
    expect(session.seeds[0]).not.toBe(before[0]);
  });

  it("leaves stored seeds, particles, lanes, and clock unchanged on invalid release", () => {
    const { simulation, pathHistory, session } = emptyLab();
    session.releasePoint({ x: 1, y: 2, z: 3 });
    simulation.step(0.2);
    const clock = simulation.clock.time;
    const seeds = session.seeds;
    const particle = simulation.particles[0]!;
    const history = pathHistory.pointsFor(0);

    expect(() => session.releasePoint({ x: 0, y: -1, z: 0 })).toThrow(
      AtmosphericTracerSeedError,
    );
    expect(() =>
      session.releasePoint({ x: Number.NaN, y: 1, z: 0 }),
    ).toThrow(AtmosphericTracerSeedError);

    expect(simulation.clock.time).toBe(clock);
    expect(session.seeds).toEqual(seeds);
    expect(simulation.particles).toHaveLength(1);
    expect(simulation.particles[0]).toBe(particle);
    expect(pathHistory.tracerCount).toBe(1);
    expect(pathHistory.pointsFor(0)).toEqual(history);
  });

  it("createTracersFromSeeds after a valid copy cannot throw", () => {
    const { session } = emptyLab();
    expect(() => session.releasePoint({ x: 0, y: 0, z: 0 })).not.toThrow();
    expect(session.seeds).toHaveLength(1);
  });

  it("does not import ScenarioConfig, pedagogy, curated seeds, or TracerScene", () => {
    expect(exploreTracerSessionSrc).not.toMatch(/DEMO_SCENARIO/);
    expect(exploreTracerSessionSrc).not.toMatch(/ScenarioConfig/);
    expect(exploreTracerSessionSrc).not.toMatch(/diagnosticSeeds/);
    expect(exploreTracerSessionSrc).not.toMatch(/storySeeds/);
    expect(exploreTracerSessionSrc).not.toMatch(/downwardPathlineSeeds/);
    expect(exploreTracerSessionSrc).not.toMatch(
      /nearGroundOutflowPathlineSeeds/,
    );
    expect(exploreTracerSessionSrc).not.toMatch(/TracerPedagogy/);
    expect(exploreTracerSessionSrc).not.toMatch(/\bS1\b/);
    expect(exploreTracerSessionSrc).not.toMatch(/\bS2\b/);
    expect(exploreTracerSessionSrc).not.toMatch(/\bD1\b/);
    expect(exploreTracerSessionSrc).not.toMatch(/\bNG1\b/);
    expect(exploreTracerSessionSrc).not.toMatch(/TracerScene/);
    expect(exploreTracerSessionSrc).not.toMatch(/addTracerSlot/);
    expect(exploreTracerSessionSrc).not.toMatch(/clearTracerSlots/);
    expect(exploreTracerSessionSrc).not.toMatch(/from ["']three["']/);
    expect(exploreTracerSessionSrc).not.toMatch(/from ["'].*ui\//);
    expect(exploreTracerSessionSrc).not.toMatch(/from ["'].*scenario\//);
    expect(exploreTracerSessionSrc).not.toMatch(/from ["'].*app\//);
    expect(exploreTracerSessionSrc).not.toMatch(/from ["'].*rendering\//);
  });

  it("keeps Guided Reset on createGuidedLab; Explore is a separate lab factory", () => {
    expect(appSrc).toMatch(/createGuidedLab/);
    expect(appSrc).toMatch(/resetGuidedLab/);
    expect(appSrc).toMatch(/createExploreLab/);
    expect(appSrc).not.toMatch(/LIVE_DEMO_TRACER_PEDAGOGY/);
    expect(appSrc).not.toMatch(/demoSeedsForPedagogy/);
  });
});
