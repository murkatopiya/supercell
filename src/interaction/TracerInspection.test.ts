import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import { StormRelativeEnvironmentalAdvectionField } from "../physics/environment/StormRelativeEnvironmentalAdvectionField.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { createTracersFromSeeds } from "../simulation/createTracersFromSeeds.js";
import { Simulation } from "../simulation/Simulation.js";
import type { TracerAdvectionState } from "../simulation/TracerParticle.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import {
  DEMO_VELOCITY_CONTRIBUTION_KEYS,
  composeDemoTracerFields,
  composeDemoTracerLab,
  demoInspectableVelocityOperands,
} from "../app/composeDemoTracerSimulation.js";
import { createExploreLab } from "../app/createExploreLab.js";
import { IntegrationFrame } from "../app/IntegrationFrame.js";
import { TracerPedagogy } from "../app/TracerPedagogy.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import {
  inspectSelectedTracer,
  inspectTracer,
  inspectWorldPoint,
  type InspectableVelocityOperands,
} from "./TracerInspection.js";
import tracerInspectionSrc from "./TracerInspection.ts?raw";
import compositeVelocityFieldSrc from "../core/fields/CompositeVelocityField.ts?raw";
import simulationSrc from "../simulation/Simulation.ts?raw";
import {
  TracerSelection,
  resolveSelectedTracer,
} from "./TracerSelection.js";

class RecordingField implements VelocityField {
  readonly calls: { position: Vec3; time: number }[] = [];

  constructor(private readonly velocity: Vec3) {}

  sample(position: Vec3, time: number): Vec3 {
    this.calls.push({ position, time });
    return { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z };
  }
}

function draft(
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

function expectVec3Close(actual: Vec3, expected: Vec3, digits = 12): void {
  expect(actual.x).toBeCloseTo(expected.x, digits);
  expect(actual.y).toBeCloseTo(expected.y, digits);
  expect(actual.z).toBeCloseTo(expected.z, digits);
}

function sumVelocities(velocities: readonly Vec3[]): Vec3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const velocity of velocities) {
    x += velocity.x;
    y += velocity.y;
    z += velocity.z;
  }
  return { x, y, z };
}

function fakeSlots(): ExploreSceneSlots {
  return {
    tracerSlotCount: 0,
    addTracerSlot() {},
    clearTracerSlots() {},
    syncReleasePreview() {},
  };
}

describe("TracerInspection adapter", () => {
  it("does not import rendering, React, pedagogy, Explore, or physics classes", () => {
    expect(tracerInspectionSrc).not.toMatch(/from ["']three["']/);
    expect(tracerInspectionSrc).not.toMatch(/from ["']react["']/);
    expect(tracerInspectionSrc).not.toMatch(/from ["'].*physics\//);
    expect(tracerInspectionSrc).not.toMatch(/TracerPedagogy/);
    expect(tracerInspectionSrc).not.toMatch(/ExploreTracerSession/);
    expect(tracerInspectionSrc).not.toMatch(/ScenarioConfig/);
    expect(tracerInspectionSrc).not.toMatch(/S1|S2|D1|NG1/);
    expect(simulationSrc).not.toMatch(/environmentAdvection/);
    expect(simulationSrc).not.toMatch(/TracerInspection/);
    expect(compositeVelocityFieldSrc).not.toMatch(/environmentAdvection/);
    expect(compositeVelocityFieldSrc).not.toMatch(/updraft/);
    expect(compositeVelocityFieldSrc).not.toMatch(/lowerInflow/);
  });

  it("publishes Level 1 kinematics from the live particle and clock", () => {
    const total = new ConstantVelocityField({ x: 3, y: 4, z: 12 });
    const simulation = new Simulation(total, new EulerIntegrator(), [
      draft(10, 20, 30),
    ]);
    simulation.particles[0]!.age = 1.5;
    const inspection = inspectTracer(
      simulation.particles[0]!,
      simulation.clock.time,
      { total },
    );

    expect(inspection.tracerId).toBe(1);
    expect(inspection.time).toBe(0);
    expect(inspection.position).toEqual({ x: 10, y: 20, z: 30 });
    expect(inspection.altitude).toBe(20);
    expect(inspection.altitude).toBe(inspection.position.y);
    expect(inspection.age).toBe(1.5);
    expect(inspection.active).toBe(true);
    expect(inspection.vTotal).toEqual({ x: 3, y: 4, z: 12 });
    expect(inspection.speed).toBe(13);
    expect(inspection.contributions).toBeUndefined();
  });

  it("omits contributions when model-specific parts are absent or empty", () => {
    const total = new ConstantVelocityField({ x: 1, y: 0, z: 0 });
    const particle = new Simulation(total, new EulerIntegrator(), [
      draft(0, 1, 0),
    ]).particles[0]!;

    expect(
      inspectTracer(particle, 0, { total }).contributions,
    ).toBeUndefined();
    expect(
      inspectTracer(particle, 0, { total, parts: [] }).contributions,
    ).toBeUndefined();
  });

  it("samples the same particle.position and clock.time for total and every part", () => {
    const total = new RecordingField({ x: 1, y: 2, z: 3 });
    const a = new RecordingField({ x: 1, y: 0, z: 0 });
    const b = new RecordingField({ x: 0, y: 2, z: 3 });
    const observation: InspectableVelocityOperands = {
      total,
      parts: [
        { key: "a", field: a },
        { key: "b", field: b },
      ],
    };
    const simulation = new Simulation(total, new EulerIntegrator(), [
      draft(11, 22, 33),
    ]);
    simulation.step(0.25);
    const particle = simulation.particles[0]!;
    const time = simulation.clock.time;

    inspectTracer(particle, time, observation);

    expect(a.calls).toHaveLength(1);
    expect(b.calls).toHaveLength(1);
    expect(total.calls.at(-1)!.position).toBe(particle.position);
    expect(total.calls.at(-1)!.time).toBe(time);
    expect(a.calls[0]!.position).toBe(particle.position);
    expect(b.calls[0]!.position).toBe(particle.position);
    expect(a.calls[0]!.time).toBe(time);
    expect(b.calls[0]!.time).toBe(time);
    expect(time).toBe(0.25);
  });

  it("inspects an inactive existing tracer as field-at-point", () => {
    const total = new ConstantVelocityField({ x: 0, y: -10, z: 0 });
    const simulation = new Simulation(
      total,
      new EulerIntegrator(),
      [draft(0, 0, 0)],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    simulation.step(0.1);
    const particle = simulation.particles[0]!;
    expect(particle.active).toBe(false);

    const inspection = inspectTracer(
      particle,
      simulation.clock.time,
      { total },
    );
    expect(inspection.active).toBe(false);
    expect(inspection.tracerId).toBe(1);
    expect(inspection.vTotal).toEqual(total.sample(particle.position, simulation.clock.time));
    expect(inspection.position).toEqual(particle.position);
  });

  it("does not mutate particle, position, clock, fields, or selection", () => {
    const stored = { x: 1, y: 2, z: 3 };
    const total = new ConstantVelocityField(stored);
    const partField = new ConstantVelocityField({ x: 4, y: 5, z: 6 });
    const simulation = new Simulation(total, new EulerIntegrator(), [
      draft(7, 8, 9),
    ]);
    const particle = simulation.particles[0]!;
    const selection = new TracerSelection();
    selection.select(particle.tracerId);
    const observation: InspectableVelocityOperands = {
      total,
      parts: [{ key: "part", field: partField }],
    };

    const inspection = inspectSelectedTracer(
      simulation.particles,
      selection,
      simulation.clock.time,
      observation,
    )!;

    inspection.position.x = 999;
    inspection.vTotal.x = 888;
    inspection.contributions![0]!.velocity.x = 777;

    expect(particle.position).toEqual({ x: 7, y: 8, z: 9 });
    expect(simulation.clock.time).toBe(0);
    expect(particle.age).toBe(0);
    expect(particle.active).toBe(true);
    expect(selection.selectedId).toBe(1);
    expect(stored).toEqual({ x: 1, y: 2, z: 3 });
    expect(total.sample(particle.position, 0)).toEqual({ x: 1, y: 2, z: 3 });
    expect(partField.sample(particle.position, 0)).toEqual({ x: 4, y: 5, z: 6 });
    expect(resolveSelectedTracer(simulation.particles, selection)).toBe(
      particle,
    );
  });

  it("inspectWorldPoint samples recorded (P, t) and does not use the live glyph or clock", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [draft(9, 9, 9)],
    );
    simulation.step(0.1);
    const live = simulation.particles[0]!;
    const total = new RecordingField({ x: 3, y: 0, z: 0 });
    const part = new RecordingField({ x: 1, y: 0, z: 0 });
    const historical = { x: 100, y: 200, z: 300 };
    const recordedTime = 4.2;
    const inspection = inspectWorldPoint(
      live.tracerId,
      historical,
      recordedTime,
      1.5,
      live.active,
      { total, parts: [{ key: "part", field: part }] },
    );

    expect(inspection.position).toEqual(historical);
    expect(inspection.time).toBe(recordedTime);
    expect(inspection.age).toBe(1.5);
    expect(inspection.altitude).toBe(200);
    expect(total.calls).toEqual([{ position: historical, time: recordedTime }]);
    expect(part.calls).toEqual([{ position: historical, time: recordedTime }]);
    expect(live.position).not.toEqual(historical);
    expect(simulation.clock.time).toBe(0.1);
  });

  it("returns undefined for no selection or a missing selected id", () => {
    const total = new ConstantVelocityField({ x: 0, y: 0, z: 0 });
    const simulation = new Simulation(total, new EulerIntegrator(), [
      draft(0, 1, 0),
    ]);
    const observation = { total };
    const selection = new TracerSelection();

    expect(
      inspectSelectedTracer(
        simulation.particles,
        selection,
        simulation.clock.time,
        observation,
      ),
    ).toBeUndefined();

    selection.select(99);
    expect(
      inspectSelectedTracer(
        simulation.particles,
        selection,
        simulation.clock.time,
        observation,
      ),
    ).toBeUndefined();
    expect(selection.selectedId).toBe(99);
    expect(
      resolveSelectedTracer(simulation.particles, selection),
    ).toBeUndefined();

    simulation.clearParticles();
    selection.select(1);
    expect(
      inspectSelectedTracer(
        simulation.particles,
        selection,
        0,
        observation,
      ),
    ).toBeUndefined();
  });
});

describe("DEMO velocity observation", () => {
  it("keeps the same operand instances as composeDemoTracerFields and Simulation", () => {
    const composed = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const velocityObservation = demoInspectableVelocityOperands(composed);
    const particles = createTracersFromSeeds(
      DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds,
    );
    const simulation = new Simulation(
      velocityObservation.total,
      new EulerIntegrator(),
      particles,
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );

    expect(velocityObservation.total).toBe(composed.field);
    expect(velocityObservation.parts).toHaveLength(7);
    expect(velocityObservation.parts!.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    for (let i = 0; i < 7; i++) {
      expect(velocityObservation.parts![i]!.field).toBe(composed.operands[i]);
    }
    expect(velocityObservation.parts![0]!.field).toBe(composed.environmentField);
    expect(velocityObservation.parts![0]!.field).not.toBe(
      composed.groundRelativeEnvironmentField,
    );
    expect(simulation.particles).toHaveLength(1);
  });

  it("sums seven DEMO contributions to vTotal at the same (P, t)", () => {
    const { simulation, velocityObservation } = composeDemoTracerLab(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.NearGroundOutflowPathline,
    );
    simulation.step(DEMO_SCENARIO.simulation.timestep);
    const particle = simulation.particles[0]!;
    const time = simulation.clock.time;
    const inspection = inspectTracer(particle, time, velocityObservation);

    expect(inspection.contributions).toHaveLength(7);
    expect(inspection.contributions!.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    expect(inspection.time).toBe(time);
    expect(inspection.position).toEqual(particle.position);
    expect(inspection.altitude).toBe(particle.position.y);

    const sampledTotal = velocityObservation.total.sample(
      particle.position,
      time,
    );
    expect(inspection.vTotal).toEqual(sampledTotal);
    expectVec3Close(
      sumVelocities(inspection.contributions!.map((part) => part.velocity)),
      inspection.vTotal,
    );

    const replayed = velocityObservation.parts!.map((part) =>
      part.field.sample(particle.position, time),
    );
    expectVec3Close(sumVelocities(replayed), sampledTotal);
  });

  it("samples environmentAdvection from the SR integration operand, not ground-relative wind", () => {
    const composed = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const velocityObservation = demoInspectableVelocityOperands(composed);
    const simulation = new Simulation(
      velocityObservation.total,
      new EulerIntegrator(),
      createTracersFromSeeds(
        DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds,
      ),
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const particle = simulation.particles[0]!;
    const time = simulation.clock.time;
    const inspection = inspectTracer(particle, time, velocityObservation);
    const env = inspection.contributions!.find(
      (part) => part.key === "environmentAdvection",
    )!;
    const srOperand = velocityObservation.parts![0]!;

    expect(srOperand.key).toBe("environmentAdvection");
    expect(srOperand.field).toBe(composed.environmentField);
    expect(srOperand.field).toBeInstanceOf(
      StormRelativeEnvironmentalAdvectionField,
    );
    expect(composed.groundRelativeEnvironmentField).toBeInstanceOf(
      EnvironmentalWindField,
    );
    expect(env.velocity).toEqual(
      composed.environmentField.sample(particle.position, time),
    );
    expect(env.velocity).not.toEqual(
      composed.groundRelativeEnvironmentField.sample(particle.position, time),
    );
  });

  it("reuses the same adapter for Explore and Guided without pedagogy in the payload", () => {
    const explore = createExploreLab(fakeSlots());
    explore.session.releasePoint({ x: 3000, y: 100, z: 4750 });
    const guided = composeDemoTracerLab(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.NearGroundOutflowPathline,
    );
    const exploreInspection = inspectTracer(
      explore.simulation.particles[0]!,
      explore.simulation.clock.time,
      explore.velocityObservation,
    );
    const guidedInspection = inspectTracer(
      guided.simulation.particles[0]!,
      guided.simulation.clock.time,
      guided.velocityObservation,
    );

    expect(explore.velocityObservation.parts!.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    expect(guided.velocityObservation.parts!.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    expect(explore.velocityObservation.parts![0]!.field).toBeInstanceOf(
      StormRelativeEnvironmentalAdvectionField,
    );
    expect(guided.velocityObservation.parts![0]!.field).toBeInstanceOf(
      StormRelativeEnvironmentalAdvectionField,
    );
    expect(exploreInspection).not.toHaveProperty("pedagogy");
    expect(guidedInspection).not.toHaveProperty("experiment");
    expect(Object.keys(exploreInspection).sort()).toEqual(
      Object.keys(guidedInspection).sort(),
    );
  });
});
