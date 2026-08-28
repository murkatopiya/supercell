import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { Simulation } from "../simulation/Simulation.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { ExploreTracerSession } from "./ExploreTracerSession.js";

describe("Explore point-release acceptance", () => {
  it("releases late, resets as a simultaneous cohort, then clears without resetting the clock", () => {
    const dt = 0.1;
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      [],
    );
    const pathHistory = new TracerPathHistory(0);
    const session = new ExploreTracerSession(simulation, pathHistory);

    expect(session.seeds).toEqual([]);
    expect(simulation.particles).toHaveLength(0);
    expect(pathHistory.tracerCount).toBe(0);

    for (let i = 0; i < 10; i++) {
      simulation.step(dt);
      pathHistory.recordAfterStep(simulation.particles, simulation.clock.time);
    }
    const timeAtP1 = simulation.clock.time;
    expect(timeAtP1).toBeCloseTo(1, 12);

    session.releasePoint({ x: 0, y: 100, z: 0 });

    expect(simulation.clock.time).toBe(timeAtP1);
    expect(session.seeds).toEqual([{ x: 0, y: 100, z: 0 }]);
    expect(simulation.particles).toHaveLength(1);
    expect(pathHistory.tracerCount).toBe(1);
    const p1 = simulation.particles[0]!;
    expect(p1.age).toBe(0);
    expect(p1.active).toBe(true);
    expect(p1.position).toEqual({ x: 0, y: 100, z: 0 });
    expect(pathHistory.pointsFor(0)).toEqual([{ x: 0, y: 100, z: 0 }]);

    simulation.step(dt);
    pathHistory.recordAfterStep(simulation.particles, simulation.clock.time);
    simulation.step(dt);
    pathHistory.recordAfterStep(simulation.particles, simulation.clock.time);

    expect(p1.position).toEqual({ x: 2, y: 100, z: 0 });
    expect(p1.age).toBeCloseTo(2 * dt, 12);
    const p1HistoryBeforeP2 = pathHistory.pointsFor(0);
    expect(p1HistoryBeforeP2).toHaveLength(3);

    const timeAtP2 = simulation.clock.time;
    session.releasePoint({ x: 50, y: 200, z: -4 });

    expect(simulation.clock.time).toBe(timeAtP2);
    expect(session.seeds).toEqual([
      { x: 0, y: 100, z: 0 },
      { x: 50, y: 200, z: -4 },
    ]);
    expect(simulation.particles).toHaveLength(2);
    expect(pathHistory.tracerCount).toBe(2);
    expect(pathHistory.pointsFor(0)).toEqual(p1HistoryBeforeP2);
    const p2 = simulation.particles[1]!;
    expect(p2.age).toBe(0);
    expect(p2.active).toBe(true);
    expect(p2.position).toEqual({ x: 50, y: 200, z: -4 });
    expect(pathHistory.pointsFor(1)).toEqual([{ x: 50, y: 200, z: -4 }]);
    expect(p1.position).toEqual({ x: 2, y: 100, z: 0 });

    simulation.step(dt);
    pathHistory.recordAfterStep(simulation.particles, simulation.clock.time);

    expect(p1.position).toEqual({ x: 3, y: 100, z: 0 });
    expect(p2.position).toEqual({ x: 51, y: 200, z: -4 });
    expect(p1.age).toBeCloseTo(3 * dt, 12);
    expect(p2.age).toBeCloseTo(dt, 12);

    session.reset();

    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles).toHaveLength(2);
    expect(pathHistory.tracerCount).toBe(2);
    expect(simulation.particles[0]).toMatchObject({
      tracerId: 1,
      position: { x: 0, y: 100, z: 0 },
      age: 0,
      active: true,
    });
    expect(simulation.particles[1]).toMatchObject({
      tracerId: 2,
      position: { x: 50, y: 200, z: -4 },
      age: 0,
      active: true,
    });
    expect(pathHistory.pointsFor(0)).toEqual([{ x: 0, y: 100, z: 0 }]);
    expect(pathHistory.pointsFor(1)).toEqual([{ x: 50, y: 200, z: -4 }]);
    expect(session.seeds).toEqual([
      { x: 0, y: 100, z: 0 },
      { x: 50, y: 200, z: -4 },
    ]);

    simulation.step(dt);
    pathHistory.recordAfterStep(simulation.particles, simulation.clock.time);
    const timeBeforeClear = simulation.clock.time;
    expect(timeBeforeClear).toBeCloseTo(dt, 12);
    expect(simulation.particles[0]!.position.x).toBeCloseTo(1, 12);

    session.clear();

    expect(session.seeds).toEqual([]);
    expect(simulation.particles).toHaveLength(0);
    expect(pathHistory.tracerCount).toBe(0);
    expect(simulation.clock.time).toBe(timeBeforeClear);
  });
});
