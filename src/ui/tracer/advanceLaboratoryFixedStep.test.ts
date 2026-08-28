import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../../core/integrators/RK2Integrator.js";
import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import { ConstantVelocityField } from "../../physics/synthetic/ConstantVelocityField.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../../simulation/AtmosphericTracerDomain.js";
import { consumeFixedTimesteps } from "../../simulation/consumeFixedTimesteps.js";
import { simulationElapsedFromWall } from "../../simulation/simulationElapsedFromWall.js";
import { Simulation } from "../../simulation/Simulation.js";
import { TracerPathHistory } from "../../simulation/TracerPathHistory.js";
import { VisualAirflowPopulation } from "../../visualization/VisualAirflowPopulation.js";
import { advanceLaboratoryFixedStep } from "./advanceLaboratoryFixedStep.js";
import advanceLaboratoryFixedStepSrc from "./advanceLaboratoryFixedStep.ts?raw";
import tracerViewportSrc from "./TracerViewport.tsx?raw";

class RecordingField implements VelocityField {
  readonly samples: { position: Vec3; time: number }[] = [];
  constructor(private readonly velocity: Vec3) {}
  sample(position: Vec3, time: number): Vec3 {
    this.samples.push({
      position: { x: position.x, y: position.y, z: position.z },
      time,
    });
    return this.velocity;
  }
}

function cubePopulation(
  field: VelocityField,
  integrator = new EulerIntegrator(),
) {
  return new VisualAirflowPopulation(field, integrator, {
    count: 1,
    maxAge: 1000,
    jitterSeed: 1,
    volume: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 1000, y: 1000, z: 1000 },
    },
  });
}

describe("advanceLaboratoryFixedStep", () => {
  it("captures pre-step laboratory time for both scientific and visual paths", () => {
    const field = new RecordingField({ x: 0, y: 0, z: 0 });
    const integrator = new EulerIntegrator();
    const simulation = new Simulation(
      field,
      integrator,
      [{ position: { x: 1, y: 2, z: 3 }, age: 0, active: true }],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const population = cubePopulation(field, integrator);
    const dt = 0.1;

    advanceLaboratoryFixedStep(simulation, dt, {
      visualAirflowPopulation: population,
    });
    expect(simulation.clock.time).toBe(dt);
    expect(field.samples.map((sample) => sample.time)).toEqual([0, 0]);

    advanceLaboratoryFixedStep(simulation, dt, {
      visualAirflowPopulation: population,
    });
    advanceLaboratoryFixedStep(simulation, dt, {
      visualAirflowPopulation: population,
    });
    expect(field.samples.map((sample) => sample.time)).toEqual([
      0, 0, dt, dt, 2 * dt, 2 * dt,
    ]);
  });

  it("runs one visual step per scientific fixed step, including inner batches", () => {
    const field = new RecordingField({ x: 4, y: 0, z: 0 });
    const integrator = new EulerIntegrator();
    const simulation = new Simulation(field, integrator, [
      { position: { x: 0, y: 10, z: 0 }, age: 0, active: true },
    ]);
    const population = cubePopulation(field, integrator);
    const before = population.occupants()[0]!.position;

    for (let i = 0; i < 5; i++) {
      advanceLaboratoryFixedStep(simulation, 0.2, {
        visualAirflowPopulation: population,
      });
    }

    expect(simulation.clock.time).toBeCloseTo(1);
    expect(field.samples).toHaveLength(10);
    expect(population.occupants()[0]!.position.x).toBeCloseTo(before.x + 4);
    expect(simulation.particles[0]!.position.x).toBeCloseTo(4);
  });

  it("does not move the population when consumed.steps is 0", () => {
    const field = new ConstantVelocityField({ x: 50, y: 0, z: 0 });
    const integrator = new EulerIntegrator();
    const simulation = new Simulation(field, integrator, [
      { position: { x: 0, y: 1, z: 0 }, age: 0, active: true },
    ]);
    const population = cubePopulation(field, integrator);
    const before = population.occupants();
    const particleBefore = { ...simulation.particles[0]!.position };

    const pausedElapsed = simulationElapsedFromWall(1 / 60, {
      paused: true,
      timeScale: 10,
    });
    const consumed = consumeFixedTimesteps(0, pausedElapsed, 0.1);
    expect(consumed.steps).toBe(0);
    for (let i = 0; i < consumed.steps; i++) {
      advanceLaboratoryFixedStep(simulation, 0.1, {
        visualAirflowPopulation: population,
      });
    }

    expect(population.occupants()).toEqual(before);
    expect(simulation.particles[0]!.position).toEqual(particleBefore);
    expect(simulation.clock.time).toBe(0);
  });

  it("follows timeScale through the fixed-step accumulator, not a second visual scale", () => {
    const field = new ConstantVelocityField({ x: 10, y: 0, z: 0 });
    const makePair = () => {
      const integrator = new EulerIntegrator();
      const simulation = new Simulation(field, integrator, [
        { position: { x: 0, y: 5, z: 0 }, age: 0, active: true },
      ]);
      return {
        simulation,
        population: cubePopulation(field, integrator),
      };
    };

    const slow = makePair();
    const fast = makePair();
    const timestep = 0.1;
    const wallDt = 0.1;
    const startX = slow.population.occupants()[0]!.position.x;
    expect(fast.population.occupants()[0]!.position.x).toBe(startX);

    const slowElapsed = simulationElapsedFromWall(wallDt, {
      paused: false,
      timeScale: 1,
    });
    const fastElapsed = simulationElapsedFromWall(wallDt, {
      paused: false,
      timeScale: 10,
    });
    const slowConsumed = consumeFixedTimesteps(0, slowElapsed, timestep);
    const fastConsumed = consumeFixedTimesteps(0, fastElapsed, timestep);
    expect(fastConsumed.steps).toBe(slowConsumed.steps * 10);

    for (let i = 0; i < slowConsumed.steps; i++) {
      advanceLaboratoryFixedStep(slow.simulation, timestep, {
        visualAirflowPopulation: slow.population,
      });
    }
    for (let i = 0; i < fastConsumed.steps; i++) {
      advanceLaboratoryFixedStep(fast.simulation, timestep, {
        visualAirflowPopulation: fast.population,
      });
    }

    expect(fast.simulation.clock.time).toBeCloseTo(
      slow.simulation.clock.time * 10,
    );
    expect(
      fast.population.occupants()[0]!.position.x - startX,
    ).toBeCloseTo(10 * (slow.population.occupants()[0]!.position.x - startX));
  });

  it("records scientific path history and skips visual stepping when omitted", () => {
    const field = new ConstantVelocityField({ x: 3, y: 0, z: 0 });
    const simulation = new Simulation(field, new EulerIntegrator(), [
      { position: { x: 0, y: 1, z: 0 }, age: 0, active: true },
    ]);
    const history = new TracerPathHistory(1);
    history.captureInitial(simulation.particles, simulation.clock.time);
    advanceLaboratoryFixedStep(simulation, 0.5, { pathHistory: history });
    expect(history.pointsFor(0)).toHaveLength(2);
    expect(history.pointsFor(0)[1]).toEqual(simulation.particles[0]!.position);
    expect(history.samplesFor(0)[0]!.simulationTime).toBe(0);
    expect(history.samplesFor(0)[1]!.simulationTime).toBe(0.5);
  });

  it("does not switch the live path to RK2", () => {
    expect(advanceLaboratoryFixedStepSrc).not.toMatch(/RK2Integrator/);
    expect(tracerViewportSrc).not.toMatch(/RK2Integrator/);
    const rk2 = new RK2Integrator();
    expect(rk2).toBeInstanceOf(RK2Integrator);
  });

  it("is the TracerViewport consumed-step body", () => {
    expect(tracerViewportSrc).toMatch(/advanceLaboratoryFixedStep/);
    expect(tracerViewportSrc).not.toMatch(/simulation\.step\(timestep\)/);
    expect(advanceLaboratoryFixedStepSrc).toMatch(
      /const t0 = simulation\.clock\.time/,
    );
    expect(advanceLaboratoryFixedStepSrc).toMatch(/simulation\.step\(dt\)/);
    expect(advanceLaboratoryFixedStepSrc).toMatch(
      /visualAirflowPopulation\?\.step\(dt, t0\)/,
    );
    expect(advanceLaboratoryFixedStepSrc).toMatch(
      /pathHistory\?\.recordAfterStep/,
    );
    expect(advanceLaboratoryFixedStepSrc).toMatch(
      /recordAfterStep\(\s*simulation\.particles,\s*simulation\.clock\.time/,
    );
  });
});
