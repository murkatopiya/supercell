import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { RK2Integrator } from "../core/integrators/RK2Integrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { LowerRadialInflowField } from "../physics/storm/LowerRadialInflowField.js";
import { VerticalEnvelopeDowndraftField } from "../physics/storm/VerticalEnvelopeDowndraftField.js";
import verticalEnvelopeDowndraftSrc from "../physics/storm/VerticalEnvelopeDowndraftField.ts?raw";
import verticalEnvelopeDowndraftTestSrc from "../physics/storm/VerticalEnvelopeDowndraftField.test.ts?raw";
import verticalEnvelopeDowndraftAcceptanceSrc from "./verticalEnvelopeDowndraftFieldTracer.acceptance.test.ts?raw";
import eulerIntegratorSrc from "../core/integrators/EulerIntegrator.ts?raw";
import rk2IntegratorSrc from "../core/integrators/RK2Integrator.ts?raw";
import {
  composeDemoTracerFields,
  composeDemoTracerSimulation,
} from "../app/composeDemoTracerSimulation.js";
import composeDemoTracerSimulationSrc from "../app/composeDemoTracerSimulation.ts?raw";
import { IntegrationFrame } from "../app/IntegrationFrame.js";
import { TracerPedagogy } from "../app/TracerPedagogy.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import {
  ATMOSPHERIC_GROUND_HEIGHT,
  ATMOSPHERIC_TRACER_DOMAIN,
  applyAtmosphericTracerDomain,
} from "./AtmosphericTracerDomain.js";
import atmosphericTracerDomainSrc from "./AtmosphericTracerDomain.ts?raw";
import simulationSrc from "./Simulation.ts?raw";
import { createTracersFromSeeds } from "./createTracersFromSeeds.js";
import { resetTracersFromSeeds } from "./resetTracersFromSeeds.js";
import { Simulation } from "./Simulation.js";
import type { TracerAdvectionState } from "./TracerParticle.js";

function particle(
  x: number,
  y: number,
  z: number,
  active = true,
): TracerAdvectionState {
  return { position: { x, y, z }, age: 0, active };
}

function atmosphericSimulation(
  velocity: { x: number; y: number; z: number },
  particles: TracerAdvectionState[],
) {
  return new Simulation(
    new ConstantVelocityField(velocity),
    new EulerIntegrator(),
    particles,
    { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
  );
}

describe("AtmosphericTracerDomain helper", () => {
  it("accepts a step that stays at or above y = 0", () => {
    const from = { x: 1, y: 10, z: 2 };
    const above = applyAtmosphericTracerDomain(from, { x: 2, y: 9, z: 3 });
    expect(above.active).toBe(true);
    expect(above.position).toEqual({ x: 2, y: 9, z: 3 });

    const ontoFloor = applyAtmosphericTracerDomain(from, { x: 4, y: 0, z: 5 });
    expect(ontoFloor.active).toBe(true);
    expect(ontoFloor.position).toEqual({ x: 4, y: 0, z: 5 });
  });

  it("interpolates the accepted segment onto y = 0 with exact floor height", () => {
    const from = { x: 10, y: 4, z: 30 };
    const proposed = { x: 15, y: -6, z: 22 };
    const result = applyAtmosphericTracerDomain(from, proposed);

    expect(result.active).toBe(false);
    expect(result.position.y).toBe(ATMOSPHERIC_GROUND_HEIGHT);
    expect(result.position.x).toBeCloseTo(12, 12);
    expect(result.position.z).toBeCloseTo(26.8, 12);
    expect(proposed).toEqual({ x: 15, y: -6, z: 22 });
    expect(from).toEqual({ x: 10, y: 4, z: 30 });
  });

  it("treats start y = 0 with a downward proposal as a crossing at α = 0", () => {
    const from = { x: 7, y: 0, z: -3 };
    const proposed = { x: 8, y: -2, z: -1 };
    const result = applyAtmosphericTracerDomain(from, proposed);

    expect(result.active).toBe(false);
    expect(result.position).toEqual({ x: 7, y: 0, z: -3 });
  });

  it("keeps a horizontal step along y = 0 active", () => {
    const from = { x: 0, y: 0, z: 0 };
    const proposed = { x: 5, y: 0, z: -2 };
    const result = applyAtmosphericTracerDomain(from, proposed);

    expect(result.active).toBe(true);
    expect(result.position).toEqual(proposed);
  });

  it("does not treat signed zero as below the floor", () => {
    const from = { x: 0, y: -0, z: 0 };
    const proposed = { x: 1, y: -0, z: 0 };
    const result = applyAtmosphericTracerDomain(from, proposed);

    expect(proposed.y < 0).toBe(false);
    expect(result.active).toBe(true);
    expect(result.position).toBe(proposed);
  });
});

describe("AtmosphericTracerDomain on Simulation", () => {
  it("leaves ordinary above-ground integration numerically unchanged", () => {
    const velocity = { x: 10, y: 5, z: -2 };
    const start = { x: 0, y: 1000, z: 0 };
    const dt = 0.1;
    const unbounded = new Simulation(
      new ConstantVelocityField(velocity),
      new EulerIntegrator(),
      [particle(start.x, start.y, start.z)],
    );
    const atmospheric = atmosphericSimulation(velocity, [
      particle(start.x, start.y, start.z),
    ]);

    for (let i = 0; i < 50; i++) {
      unbounded.step(dt);
      atmospheric.step(dt);
    }

    expect(atmospheric.particles[0]!.position).toEqual(
      unbounded.particles[0]!.position,
    );
    expect(atmospheric.particles[0]!.active).toBe(true);
    expect(atmospheric.particles[0]!.position.y).toBeGreaterThan(0);
  });

  it("places a crossing tracer on the interpolated point and deactivates it", () => {
    const dt = 1;
    const simulation = atmosphericSimulation({ x: 5, y: -10, z: -8 }, [
      particle(10, 4, 30),
    ]);

    simulation.step(dt);

    const tracer = simulation.particles[0]!;
    expect(tracer.active).toBe(false);
    expect(tracer.position.y).toBe(0);
    expect(tracer.position.x).toBeCloseTo(12, 12);
    expect(tracer.position.z).toBeCloseTo(26.8, 12);
    expect(tracer.age).toBe(dt);
  });

  it("does not integrate an inactive tracer further", () => {
    const simulation = atmosphericSimulation({ x: 5, y: -10, z: -8 }, [
      particle(10, 4, 30),
    ]);
    simulation.step(1);
    const frozen = { ...simulation.particles[0]!.position };

    simulation.step(1);
    simulation.step(1);

    expect(simulation.particles[0]!.active).toBe(false);
    expect(simulation.particles[0]!.position).toEqual(frozen);
    expect(simulation.particles[0]!.age).toBe(1);
    expect(simulation.clock.time).toBe(3);
  });

  it("does not move an already inactive tracer", () => {
    const inactive = particle(3, 8, 9, false);
    const simulation = atmosphericSimulation({ x: 0, y: -100, z: 0 }, [
      inactive,
    ]);

    simulation.step(0.1);

    expect(inactive.active).toBe(false);
    expect(inactive.position).toEqual({ x: 3, y: 8, z: 9 });
    expect(inactive.age).toBe(0);
  });

  it("keeps a tracer that lands exactly on y = 0 active", () => {
    const simulation = atmosphericSimulation({ x: 1, y: -5, z: 0 }, [
      particle(0, 5, 0),
    ]);

    simulation.step(1);

    expect(simulation.particles[0]!.active).toBe(true);
    expect(simulation.particles[0]!.position).toEqual({ x: 1, y: 0, z: 0 });
  });

  it("skates horizontally along y = 0 when Vy = 0", () => {
    const simulation = atmosphericSimulation({ x: 10, y: 0, z: -4 }, [
      particle(0, 0, 0),
    ]);

    simulation.step(0.1);

    expect(simulation.particles[0]!.active).toBe(true);
    expect(simulation.particles[0]!.position).toEqual({ x: 1, y: 0, z: -0.4 });
  });

  it("applies the domain per tracer without affecting neighbors", () => {
    const crossing = particle(0, 2, 0);
    const above = particle(100, 50, -20);
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: -10, z: 0 }),
      new EulerIntegrator(),
      [crossing, above],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );

    simulation.step(1);

    expect(crossing.active).toBe(false);
    expect(crossing.position.y).toBe(0);
    expect(crossing.position.x).toBe(0);
    expect(above.active).toBe(true);
    expect(above.position).toEqual({ x: 100, y: 40, z: -20 });
  });

  it("applies interpolation to the accepted RK2 segment, not the midpoint sample", () => {
    const particles = [particle(0, 1, 0)];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: -20, z: 0 }),
      new RK2Integrator(),
      particles,
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );

    simulation.step(0.1);

    expect(particles[0]!.active).toBe(false);
    expect(particles[0]!.position.y).toBe(0);
    expect(particles[0]!.position.x).toBe(0);
    expect(particles[0]!.position.z).toBe(0);
  });

  it("does not apply the floor when Simulation has no tracer domain", () => {
    const particles = [particle(0, 1, 0)];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: -20, z: 0 }),
      new EulerIntegrator(),
      particles,
    );

    simulation.step(0.1);

    expect(particles[0]!.active).toBe(true);
    expect(particles[0]!.position.y).toBe(-1);
  });
});

describe("AtmosphericTracerDomain vs current DEMO pathlines", () => {
  it("does not change S1/S2 while they remain above ground", () => {
    const { field } = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const seeds = DEMO_SCENARIO.simulation.storySeeds;
    const dt = DEMO_SCENARIO.simulation.timestep;
    const unbounded = new Simulation(
      field,
      new EulerIntegrator(),
      createTracersFromSeeds(seeds),
    );
    const atmospheric = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );

    for (let i = 0; i < 2000; i++) {
      unbounded.step(dt);
      atmospheric.step(dt);
    }

    expect(atmospheric.particles).toHaveLength(2);
    for (let i = 0; i < 2; i++) {
      expect(atmospheric.particles[i]!.active).toBe(true);
      expect(atmospheric.particles[i]!.position.y).toBeGreaterThan(0);
      expect(atmospheric.particles[i]!.position).toEqual(
        unbounded.particles[i]!.position,
      );
    }
  });

  it("does not change diagnostic tracers while they remain above ground", () => {
    const { field } = composeDemoTracerFields(
      IntegrationFrame.GroundRelativeWindTunnel,
    );
    const seeds = DEMO_SCENARIO.simulation.diagnosticSeeds;
    const dt = DEMO_SCENARIO.simulation.timestep;
    const unbounded = new Simulation(
      field,
      new EulerIntegrator(),
      createTracersFromSeeds(seeds),
    );
    const atmospheric = composeDemoTracerSimulation();

    for (let i = 0; i < 200; i++) {
      unbounded.step(dt);
      atmospheric.step(dt);
    }

    expect(atmospheric.particles).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(atmospheric.particles[i]!.active).toBe(true);
      expect(atmospheric.particles[i]!.position.y).toBeGreaterThan(0);
      expect(atmospheric.particles[i]!.position).toEqual(
        unbounded.particles[i]!.position,
      );
    }
  });

  it("restores seed position and active after a domain exit", () => {
    const seeds = [{ x: 0, y: 4, z: 0 }];
    const simulation = atmosphericSimulation({ x: 0, y: -10, z: 0 }, [
      particle(0, 4, 0),
    ]);

    simulation.step(1);
    expect(simulation.particles[0]!.active).toBe(false);
    expect(simulation.particles[0]!.position.y).toBe(0);

    resetTracersFromSeeds(simulation, seeds);

    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles[0]).toMatchObject({
      tracerId: 1,
      position: { x: 0, y: 4, z: 0 },
      age: 0,
      active: true,
    });
  });
});

describe("AtmosphericTracerDomain layering", () => {
  it("leaves field sampling at y < 0 unchanged", () => {
    const inflow = new LowerRadialInflowField({
      centerX: 0,
      centerZ: 0,
      radialStrainRate: 0.00125,
      sigma: 4000,
      baseHeight: 1500,
      topHeight: 4500,
    });
    const below = inflow.sample({ x: 4000, y: -500, z: 0 }, 0);
    const plateau = inflow.sample({ x: 4000, y: 0, z: 0 }, 0);

    expect(below.y).toBe(0);
    expect(below.x).toBeLessThan(0);
    expect(below).toEqual(plateau);

    const downdraft = new VerticalEnvelopeDowndraftField({
      centerX: 0,
      centerZ: 0,
      peakDownwardVelocity: 20,
      sigma: 2000,
      baseHeight: -200,
      topHeight: 1800,
    });
    const atNegative = downdraft.sample({ x: 0, y: -100, z: 0 }, 0);
    expect(atNegative.y).toBeLessThan(0);
  });

  it("does not put ground semantics into the isolated downdraft primitive or its tests", () => {
    expect(verticalEnvelopeDowndraftSrc).not.toMatch(/AtmosphericTracerDomain/);
    expect(verticalEnvelopeDowndraftSrc).not.toMatch(/ATMOSPHERIC_GROUND/);
    expect(verticalEnvelopeDowndraftTestSrc).not.toMatch(
      /AtmosphericTracerDomain/,
    );
    expect(verticalEnvelopeDowndraftAcceptanceSrc).not.toMatch(
      /AtmosphericTracerDomain/,
    );
  });

  it("does not live in VelocityField, integrators, or ScenarioConfig", () => {
    expect(eulerIntegratorSrc).not.toMatch(/AtmosphericTracerDomain/);
    expect(rk2IntegratorSrc).not.toMatch(/AtmosphericTracerDomain/);
    expect(atmosphericTracerDomainSrc).not.toMatch(/from ["']three["']/);
    expect(atmosphericTracerDomainSrc).not.toMatch(/ScenarioConfig/);
    expect(simulationSrc).toMatch(/tracerDomain/);
    expect(composeDemoTracerSimulationSrc).toMatch(/ATMOSPHERIC_TRACER_DOMAIN/);
    expect(composeDemoTracerSimulationSrc).toMatch(/createDowndraftField/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(
      /from ["']\.\.\/physics\/storm\/VerticalEnvelopeDowndraftField/,
    );
  });
});
