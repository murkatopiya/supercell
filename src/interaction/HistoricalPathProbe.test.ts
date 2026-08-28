import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { Simulation } from "../simulation/Simulation.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import {
  resolveHistoricalPathSample,
} from "./HistoricalPathProbe.js";
import historicalSrc from "./HistoricalPathProbe.ts?raw";

describe("resolveHistoricalPathSample", () => {
  it("resolves copied position and recorded time without mutating simulation", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      [{ position: { x: 0, y: 1, z: 0 }, age: 0, active: true }],
    );
    const history = new TracerPathHistory(1);
    history.captureInitial(simulation.particles, simulation.clock.time);
    simulation.step(0.1);
    history.recordAfterStep(simulation.particles, simulation.clock.time);
    const livePosition = {
      x: simulation.particles[0]!.position.x,
      y: simulation.particles[0]!.position.y,
      z: simulation.particles[0]!.position.z,
    };
    const clock = simulation.clock.time;
    const field = simulation.particles[0]!;

    const resolved = resolveHistoricalPathSample(
      simulation.particles,
      history,
      { tracerId: 1, historyIndex: 0 },
    );
    expect(resolved).toEqual({
      tracerId: 1,
      historyIndex: 0,
      position: { x: 0, y: 1, z: 0 },
      simulationTime: 0,
      age: 0,
      active: true,
    });
    expect(resolved!.position).not.toBe(simulation.particles[0]!.position);
    expect(simulation.particles[0]!.position).toEqual(livePosition);
    expect(simulation.clock.time).toBe(clock);
    expect(simulation.particles[0]!.age).toBe(field.age);

    const later = resolveHistoricalPathSample(
      simulation.particles,
      history,
      { tracerId: 1, historyIndex: 1 },
    );
    expect(later?.simulationTime).toBe(0.1);
    expect(later?.age).toBe(0.1);
    expect(later?.position).toEqual(livePosition);
  });

  it("yields undefined for a missing tracer or out-of-range index", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [{ position: { x: 1, y: 2, z: 3 }, age: 0, active: true }],
    );
    const history = new TracerPathHistory(1);
    history.captureInitial(simulation.particles, 0);
    expect(
      resolveHistoricalPathSample(simulation.particles, history, null),
    ).toBeUndefined();
    expect(
      resolveHistoricalPathSample(simulation.particles, history, {
        tracerId: 99,
        historyIndex: 0,
      }),
    ).toBeUndefined();
    expect(
      resolveHistoricalPathSample(simulation.particles, history, {
        tracerId: 1,
        historyIndex: 4,
      }),
    ).toBeUndefined();
  });

  it("does not import rendering or UI", () => {
    expect(historicalSrc).not.toMatch(/from ["'].*rendering/);
    expect(historicalSrc).not.toMatch(/from ["'].*ui\//);
    expect(historicalSrc).not.toMatch(/three/);
  });
});
