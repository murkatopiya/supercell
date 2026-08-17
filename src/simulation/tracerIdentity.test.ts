import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "./AtmosphericTracerDomain.js";
import { createTracersFromSeeds } from "./createTracersFromSeeds.js";
import { resetTracersFromSeeds } from "./resetTracersFromSeeds.js";
import { Simulation } from "./Simulation.js";
import type { TracerAdvectionState } from "./TracerParticle.js";
import createTracersFromSeedsSrc from "./createTracersFromSeeds.ts?raw";
import resetTracersFromSeedsSrc from "./resetTracersFromSeeds.ts?raw";
import simulationSrc from "./Simulation.ts?raw";
import tracerParticleSrc from "./TracerParticle.ts?raw";
import {
  composeDemoTracerSimulation,
  demoSeedsForPedagogy,
} from "../app/composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../app/IntegrationFrame.js";
import { TracerPedagogy } from "../app/TracerPedagogy.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";

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

function idsOf(simulation: Simulation): number[] {
  return simulation.particles.map((particle) => particle.tracerId);
}

describe("Simulation tracer identity", () => {
  it("assigns unique monotonic ids to the initial cohort, starting at 1", () => {
    const first = draft(0, 0, 0);
    const second = draft(1, 0, 0);
    const third = draft(2, 0, 0);
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [first, second, third],
    );

    expect(idsOf(simulation)).toEqual([1, 2, 3]);
    expect(simulation.particles[0]).toBe(first);
    expect(simulation.particles[1]).toBe(second);
    expect(simulation.particles[2]).toBe(third);
    expect(new Set(idsOf(simulation)).size).toBe(3);
  });

  it("allows a zero cohort, then births start at 1", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [],
    );
    expect(simulation.particles).toHaveLength(0);

    const born = draft(4, 5, 6);
    simulation.addParticle(born);
    expect(simulation.particles[0]!.tracerId).toBe(1);
    expect(simulation.particles[0]).toBe(born);
  });

  it("continues the sequence for addParticle and addParticles without changing existing ids", () => {
    const existing = draft(0, 0, 0);
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [existing],
    );
    expect(simulation.particles[0]!.tracerId).toBe(1);
    expect(simulation.particles[0]).toBe(existing);

    const one = draft(1, 0, 0);
    simulation.addParticle(one);
    expect(simulation.particles[0]!.tracerId).toBe(1);
    expect(simulation.particles[1]!.tracerId).toBe(2);
    expect(simulation.particles[1]).toBe(one);

    const batchA = draft(2, 0, 0);
    const batchB = draft(3, 0, 0);
    simulation.addParticles([batchA, batchB]);
    expect(idsOf(simulation)).toEqual([1, 2, 3, 4]);
    expect(simulation.particles[0]).toBe(existing);
    expect(simulation.particles[2]).toBe(batchA);
    expect(simulation.particles[3]).toBe(batchB);
  });

  it("treats an empty addParticles batch as a no-op for identity", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [draft(0, 0, 0)],
    );
    simulation.addParticles([]);
    expect(idsOf(simulation)).toEqual([1]);
  });

  it("Reset mutates in place and keeps tracerId", () => {
    const seeds = [
      { x: 0, y: 10, z: 0 },
      { x: 5, y: 10, z: -2 },
    ];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      createTracersFromSeeds(seeds),
    );
    const first = simulation.particles[0]!;
    const second = simulation.particles[1]!;
    const ids = idsOf(simulation);
    simulation.step(0.1);
    expect(first.position.x).not.toBe(0);

    resetTracersFromSeeds(simulation, seeds);

    expect(simulation.particles[0]).toBe(first);
    expect(simulation.particles[1]).toBe(second);
    expect(idsOf(simulation)).toEqual(ids);
    expect(first.tracerId).toBe(1);
    expect(second.tracerId).toBe(2);
    expect(first.position).toEqual({ x: 0, y: 10, z: 0 });
    expect(first.age).toBe(0);
    expect(first.active).toBe(true);
  });

  it("keeps tracerId when a particle becomes inactive", () => {
    const particle = draft(0, 0, 0);
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: -10, z: 0 }),
      new EulerIntegrator(),
      [particle],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    expect(simulation.particles[0]!.tracerId).toBe(1);
    simulation.step(0.1);
    expect(particle.active).toBe(false);
    expect(simulation.particles[0]!.tracerId).toBe(1);
    expect(simulation.particles[0]).toBe(particle);
  });

  it("Clear then new births restart this Simulation's identity scope", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [draft(0, 0, 0), draft(1, 0, 0)],
    );
    expect(idsOf(simulation)).toEqual([1, 2]);
    simulation.clearParticles();
    expect(simulation.particles).toHaveLength(0);

    const born = draft(9, 9, 9);
    simulation.addParticle(born);
    expect(simulation.particles[0]!.tracerId).toBe(1);
    expect(idsOf(simulation)).toEqual([1]);
  });

  it("a new Simulation has its own identity scope starting at 1", () => {
    const first = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [draft(0, 0, 0)],
    );
    const second = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [draft(1, 0, 0), draft(2, 0, 0)],
    );
    expect(first.particles[0]!.tracerId).toBe(1);
    expect(idsOf(second)).toEqual([1, 2]);
    expect(first.particles[0]!.tracerId).toBe(second.particles[0]!.tracerId);
    expect(first.particles[0]).not.toBe(second.particles[0]);
  });

  it("does not write tracerId into seeds or use UUID / pedagogy roles", () => {
    const seeds = [{ x: 1, y: 2, z: 3 }];
    const created = createTracersFromSeeds(seeds);
    expect(created[0]).toEqual({
      position: { x: 1, y: 2, z: 3 },
      age: 0,
      active: true,
    });
    expect("tracerId" in created[0]!).toBe(false);

    expect(createTracersFromSeedsSrc).not.toMatch(/tracerId/);
    expect(resetTracersFromSeedsSrc).not.toMatch(/tracerId\s*=/);
    expect(simulationSrc).not.toMatch(/randomUUID/);
    expect(simulationSrc).not.toMatch(/crypto/);
    expect(simulationSrc).not.toMatch(/uuid/i);
    expect(simulationSrc).not.toMatch(/TracerPedagogy/);
    expect(simulationSrc).not.toMatch(/TracerSelection/);
    expect(tracerParticleSrc).not.toMatch(/S1|NG1|pedagogy/);
  });
});

describe("Guided composition tracer identity", () => {
  const pedagogies = [
    TracerPedagogy.DiagnosticProbes,
    TracerPedagogy.StoryPathlines,
    TracerPedagogy.DownwardPathline,
    TracerPedagogy.NearGroundOutflowPathline,
  ] as const;

  it.each(pedagogies)(
    "%s cohort gets monotonic ids and Reset keeps them",
    (pedagogy) => {
      const seeds = demoSeedsForPedagogy(pedagogy);
      const simulation = composeDemoTracerSimulation(
        IntegrationFrame.StormRelativeLaboratory,
        pedagogy,
      );
      const expected = seeds.map((_, index) => index + 1);
      expect(idsOf(simulation)).toEqual(expected);
      expect(simulation.particles).toHaveLength(seeds.length);

      const refs = simulation.particles.slice();
      const dt = DEMO_SCENARIO.simulation.timestep;
      simulation.step(dt);
      resetTracersFromSeeds(simulation, seeds);

      expect(simulation.particles).toHaveLength(seeds.length);
      for (let i = 0; i < refs.length; i++) {
        expect(simulation.particles[i]).toBe(refs[i]);
        expect(simulation.particles[i]!.tracerId).toBe(expected[i]);
        expect(simulation.particles[i]!.position).toEqual(seeds[i]);
        expect(simulation.particles[i]!.age).toBe(0);
        expect(simulation.particles[i]!.active).toBe(true);
      }
    },
  );
});
