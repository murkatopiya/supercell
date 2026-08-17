import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { createTracersFromSeeds } from "../simulation/createTracersFromSeeds.js";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";
import { Simulation } from "../simulation/Simulation.js";
import type { TracerAdvectionState } from "../simulation/TracerParticle.js";
import { ExploreTracerSession } from "../explore/ExploreTracerSession.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { composeExploreTracerSimulation } from "../app/createExploreLab.js";
import { composeDemoTracerSimulation as composeGuided } from "../app/composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../app/IntegrationFrame.js";
import { TracerPedagogy } from "../app/TracerPedagogy.js";
import {
  TracerSelection,
  findTracerById,
  resolveSelectedTracer,
} from "./TracerSelection.js";
import tracerSelectionSrc from "./TracerSelection.ts?raw";
import exploreTracerSessionSrc from "../explore/ExploreTracerSession.ts?raw";
import simulationSrc from "../simulation/Simulation.ts?raw";

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

describe("TracerSelection", () => {
  it("defaults to null and select/clear mutate only selectedId", () => {
    const selection = new TracerSelection();
    expect(selection.selectedId).toBeNull();
    selection.select(3);
    expect(selection.selectedId).toBe(3);
    selection.clear();
    expect(selection.selectedId).toBeNull();
  });

  it("does not import rendering, React, physics, ScenarioConfig, pedagogy, or Explore", () => {
    expect(tracerSelectionSrc).not.toMatch(/from ["']three["']/);
    expect(tracerSelectionSrc).not.toMatch(/from ["']react["']/);
    expect(tracerSelectionSrc).not.toMatch(/from ["'].*physics\//);
    expect(tracerSelectionSrc).not.toMatch(/ScenarioConfig/);
    expect(tracerSelectionSrc).not.toMatch(/TracerPedagogy/);
    expect(tracerSelectionSrc).not.toMatch(/ExploreTracerSession/);
    expect(tracerSelectionSrc).not.toMatch(/TracerScene/);
    expect(simulationSrc).not.toMatch(/TracerSelection/);
    expect(exploreTracerSessionSrc).not.toMatch(/TracerSelection/);
  });

  it("append does not steal selection; lookup is by id not index", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [draft(0, 0, 0), draft(1, 0, 0)],
    );
    const selected = simulation.particles[1]!;
    const selection = new TracerSelection();
    selection.select(selected.tracerId);

    expect(selection.selectedId).toBe(2);
    expect(simulation.particles.indexOf(selected)).toBe(1);
    expect(selection.selectedId).not.toBe(simulation.particles.indexOf(selected));

    simulation.addParticle(draft(2, 0, 0));
    expect(selection.selectedId).toBe(2);
    expect(findTracerById(simulation.particles, 2)).toBe(selected);
    expect(resolveSelectedTracer(simulation.particles, selection)).toBe(
      selected,
    );
    expect(simulation.particles[2]!.tracerId).toBe(3);
  });

  it("Reset preserves selection when the id still exists", () => {
    const seeds = [
      { x: 0, y: 10, z: 0 },
      { x: 4, y: 10, z: 0 },
    ];
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      createTracersFromSeeds(seeds),
    );
    const selection = new TracerSelection();
    selection.select(simulation.particles[1]!.tracerId);
    simulation.step(0.1);
    resetTracersFromSeeds(simulation, seeds);

    expect(selection.selectedId).toBe(2);
    expect(resolveSelectedTracer(simulation.particles, selection)).toBe(
      simulation.particles[1],
    );
    expect(simulation.particles[1]!.tracerId).toBe(2);
  });

  it("Clear occupancy requires the selection owner to clear; resolve then fails until cleared", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      new EulerIntegrator(),
      [draft(0, 0, 0)],
    );
    const selection = new TracerSelection();
    selection.select(simulation.particles[0]!.tracerId);
    simulation.clearParticles();

    expect(resolveSelectedTracer(simulation.particles, selection)).toBeUndefined();
    selection.clear();
    expect(selection.selectedId).toBeNull();
    expect(resolveSelectedTracer(simulation.particles, selection)).toBeUndefined();
  });

  it("new Guided/Explore Simulation is a new identity scope; orchestration clears selection", () => {
    const guided = composeGuided(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    const selection = new TracerSelection();
    selection.select(guided.particles[0]!.tracerId);
    expect(selection.selectedId).toBe(1);

    const nextGuided = composeGuided(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.NearGroundOutflowPathline,
    );
    selection.clear();
    expect(selection.selectedId).toBeNull();
    expect(nextGuided.particles[0]!.tracerId).toBe(1);
    expect(nextGuided.particles[0]).not.toBe(guided.particles[0]);

    selection.select(nextGuided.particles[0]!.tracerId);
    const explore = composeExploreTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
    );
    selection.clear();
    expect(selection.selectedId).toBeNull();
    expect(explore.particles).toHaveLength(0);
  });

  it("inactive tracer keeps its id and can remain selected", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: -10, z: 0 }),
      new EulerIntegrator(),
      [draft(0, 0, 0)],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const selection = new TracerSelection();
    selection.select(simulation.particles[0]!.tracerId);
    simulation.step(0.1);

    expect(simulation.particles[0]!.active).toBe(false);
    expect(simulation.particles[0]!.tracerId).toBe(1);
    expect(selection.selectedId).toBe(1);
    expect(resolveSelectedTracer(simulation.particles, selection)).toBe(
      simulation.particles[0],
    );
  });

  it("Explore release assigns ids; Reset keeps selection; Clear clears it", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      new EulerIntegrator(),
      [],
    );
    const pathHistory = new TracerPathHistory(0);
    const session = new ExploreTracerSession(simulation, pathHistory);
    const selection = new TracerSelection();

    session.releasePoint({ x: 0, y: 100, z: 0 });
    session.releasePoint({ x: 10, y: 100, z: 0 });
    expect(simulation.particles.map((p) => p.tracerId)).toEqual([1, 2]);
    selection.select(2);
    expect(resolveSelectedTracer(simulation.particles, selection)?.position).toEqual(
      { x: 10, y: 100, z: 0 },
    );

    simulation.step(0.1);
    session.reset();
    expect(simulation.particles.map((p) => p.tracerId)).toEqual([1, 2]);
    expect(selection.selectedId).toBe(2);
    expect(resolveSelectedTracer(simulation.particles, selection)).toBe(
      simulation.particles[1],
    );

    session.clear();
    selection.clear();
    expect(simulation.particles).toHaveLength(0);
    expect(selection.selectedId).toBeNull();

    session.releasePoint({ x: 1, y: 2, z: 3 });
    expect(simulation.particles[0]!.tracerId).toBe(1);
  });
});
