import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import {
  createTracerObserveSlot,
  disposeTracerObserveSlot,
} from "../rendering/tracerObserveSlot.js";
import * as THREE from "three";
import { Simulation } from "./Simulation.js";
import { TracerPathHistory } from "./TracerPathHistory.js";
import type { TracerAdvectionState } from "./TracerParticle.js";
import { resetTracersFromSeeds } from "./resetTracersFromSeeds.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import composeDemoTracerSimulationSrc from "../app/composeDemoTracerSimulation.ts?raw";
import {
  composeDemoTracerSimulation,
  createDemoPathHistory,
  demoSeedsForPedagogy,
  demoTrailsEnabled,
} from "../app/composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../app/IntegrationFrame.js";
import appSrc from "../app/App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import {
  TracerPedagogy,
} from "../app/TracerPedagogy.js";

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

describe("dynamic tracer lifecycle acceptance", () => {
  it("allows late birth after the clock has advanced, then empty-cohort clear", () => {
    const field = new ConstantVelocityField({ x: 10, y: 0, z: 0 });
    const dt = 0.1;
    const simulation = new Simulation(field, new EulerIntegrator(), []);
    const history = new TracerPathHistory(0);
    const sharedGeometry = new THREE.SphereGeometry(1, 8, 6);
    const slots: ReturnType<typeof createTracerObserveSlot>[] = [];

    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles).toHaveLength(0);
    expect(history.tracerCount).toBe(0);

    for (let i = 0; i < 10; i++) {
      simulation.step(dt);
      history.recordAfterStep(simulation.particles, simulation.clock.time);
    }

    const timeAtBirth = simulation.clock.time;
    expect(timeAtBirth).toBeCloseTo(1, 12);

    const p1 = particle(0, 100, 0);
    simulation.addParticle(p1);
    history.appendParticle(p1, timeAtBirth);
    slots.push(createTracerObserveSlot(slots.length, sharedGeometry, { trails: true }));

    expect(simulation.clock.time).toBe(timeAtBirth);
    expect(p1.age).toBe(0);
    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 100, z: 0 }]);
    expect(history.pointsFor(0)[0]).not.toBe(p1.position);
    expect(simulation.particles).toHaveLength(1);
    expect(history.tracerCount).toBe(1);
    expect(slots).toHaveLength(1);

    simulation.step(dt);
    history.recordAfterStep(simulation.particles, simulation.clock.time);

    expect(p1.position).toEqual({ x: 1, y: 100, z: 0 });
    expect(p1.age).toBeCloseTo(dt, 12);
    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 100, z: 0 },
      { x: 1, y: 100, z: 0 },
    ]);
    expect(simulation.clock.time).toBeCloseTo(timeAtBirth + dt, 12);

    const p1HistoryAfterFirstStep = history.pointsFor(0);
    const timeAtP2 = simulation.clock.time;
    const p2 = particle(50, 200, 0);
    simulation.addParticle(p2);
    history.appendParticle(p2, timeAtP2);
    slots.push(createTracerObserveSlot(slots.length, sharedGeometry, { trails: true }));

    expect(simulation.clock.time).toBe(timeAtP2);
    expect(history.pointsFor(0)).toEqual(p1HistoryAfterFirstStep);
    expect(history.pointsFor(1)).toEqual([{ x: 50, y: 200, z: 0 }]);
    expect(p2.age).toBe(0);
    expect(simulation.particles).toHaveLength(2);
    expect(history.tracerCount).toBe(2);
    expect(slots).toHaveLength(2);

    simulation.step(dt);
    history.recordAfterStep(simulation.particles, simulation.clock.time);

    expect(p1.position).toEqual({ x: 2, y: 100, z: 0 });
    expect(p2.position).toEqual({ x: 51, y: 200, z: 0 });
    expect(p1.age).toBeCloseTo(2 * dt, 12);
    expect(p2.age).toBeCloseTo(dt, 12);
    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 100, z: 0 },
      { x: 1, y: 100, z: 0 },
      { x: 2, y: 100, z: 0 },
    ]);
    expect(history.pointsFor(1)).toEqual([
      { x: 50, y: 200, z: 0 },
      { x: 51, y: 200, z: 0 },
    ]);

    const timeBeforeClear = simulation.clock.time;
    simulation.clearParticles();
    history.removeAllLanes();
    for (const slot of slots) {
      disposeTracerObserveSlot(slot);
    }
    slots.length = 0;

    expect(simulation.particles).toHaveLength(0);
    expect(history.tracerCount).toBe(0);
    expect(slots).toHaveLength(0);
    expect(simulation.clock.time).toBe(timeBeforeClear);

    simulation.step(dt);
    history.recordAfterStep(simulation.particles, simulation.clock.time);
    expect(simulation.clock.time).toBeCloseTo(timeBeforeClear + dt, 12);
    expect(simulation.particles).toHaveLength(0);
    expect(history.tracerCount).toBe(0);

    sharedGeometry.dispose();
  });

  it("does not wire lifecycle APIs into Guided composition; Explore viewport exposes slots", () => {
    expect(composeDemoTracerSimulationSrc).not.toMatch(/\baddParticle\b/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(/\baddParticles\b/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(/\bclearParticles\b/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(/\bappendParticle\b/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(/\bremoveAllLanes\b/);
    expect(appSrc).not.toMatch(/\baddParticle\b/);
    expect(appSrc).toMatch(/\baddTracerSlot\b/);
    expect(tracerViewportSrc).not.toMatch(/\baddParticle\b/);
    expect(tracerViewportSrc).toMatch(/\baddTracerSlot\b/);
    expect(tracerViewportSrc).toMatch(/\bclearTracerSlots\b/);
  });

  it("keeps Guided compose/reset on a fixed cohort for every pedagogy", () => {
    const dt = DEMO_SCENARIO.simulation.timestep;
    const pedagogies = [
      TracerPedagogy.DiagnosticProbes,
      TracerPedagogy.StoryPathlines,
      TracerPedagogy.DownwardPathline,
      TracerPedagogy.NearGroundOutflowPathline,
    ];

    for (const pedagogy of pedagogies) {
      const seeds = demoSeedsForPedagogy(pedagogy);
      const simulation = composeDemoTracerSimulation(
        IntegrationFrame.StormRelativeLaboratory,
        pedagogy,
      );
      const history = createDemoPathHistory(pedagogy, simulation.particles);
      const count = seeds.length;

      expect(simulation.particles).toHaveLength(count);
      expect(demoTrailsEnabled(pedagogy)).toBe(history !== null);
      if (history) {
        expect(history.tracerCount).toBe(count);
      }

      simulation.step(dt);
      history?.recordAfterStep(simulation.particles, simulation.clock.time);
      resetTracersFromSeeds(simulation, seeds);
      history?.clear();
      history?.captureInitial(simulation.particles, simulation.clock.time);

      expect(simulation.clock.time).toBe(0);
      expect(simulation.particles).toHaveLength(count);
      expect(simulation.particles.map((item) => item.age)).toEqual(
        Array.from({ length: count }, () => 0),
      );
      expect(simulation.particles.every((item) => item.active)).toBe(true);
      if (history) {
        expect(history.tracerCount).toBe(count);
        for (let i = 0; i < count; i++) {
          expect(history.pointsFor(i)).toEqual([seeds[i]]);
        }
      }
    }

    expect(demoSeedsForPedagogy(TracerPedagogy.NearGroundOutflowPathline)).toBe(
      DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds,
    );
  });
});
