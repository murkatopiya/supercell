import { describe, expect, it } from "vitest";
import { consumeFixedTimesteps } from "../simulation/consumeFixedTimesteps.js";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";
import { simulationElapsedFromWall } from "../simulation/simulationElapsedFromWall.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { createTracersFromSeeds } from "../simulation/createTracersFromSeeds.js";
import { Simulation } from "../simulation/Simulation.js";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import scenarioConfigSrc from "../scenario/ScenarioConfig.ts?raw";
import createTracersFromSeedsSrc from "../simulation/createTracersFromSeeds.ts?raw";
import tracerPathHistorySrc from "../simulation/TracerPathHistory.ts?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import trailGeometrySrc from "../rendering/trailGeometry.ts?raw";
import appSrc from "./App.tsx?raw";
import composeDemoTracerSimulationSrc from "./composeDemoTracerSimulation.ts?raw";
import {
  composeDemoTracerFields,
  composeDemoTracerSimulation,
  createDemoPathHistory,
  demoKeepInactiveGlyphs,
  demoSeedsForPedagogy,
  demoTrailsEnabled,
} from "./composeDemoTracerSimulation.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import {
  DEFAULT_DEMO_TRACER_PEDAGOGY,
  LIVE_DEMO_TRACER_PEDAGOGY,
  TracerPedagogy,
} from "./TracerPedagogy.js";

function advanceRecordedSteps(
  simulation: ReturnType<typeof composeDemoTracerSimulation>,
  pathHistory: ReturnType<typeof createDemoPathHistory>,
  wallFrameDt: number,
  options: { paused: boolean; timeScale: number },
  accumulator = 0,
) {
  const elapsed = simulationElapsedFromWall(wallFrameDt, options);
  const consumed = consumeFixedTimesteps(
    accumulator,
    elapsed,
    DEMO_SCENARIO.simulation.timestep,
  );
  for (let i = 0; i < consumed.steps; i++) {
    simulation.step(DEMO_SCENARIO.simulation.timestep);
    pathHistory?.recordAfterStep(simulation.particles);
  }
  return consumed;
}

describe("TracerPedagogy", () => {
  it("exposes DiagnosticProbes, StoryPathlines, and DownwardPathline, not Both", () => {
    expect(TracerPedagogy.DiagnosticProbes).toBe("DiagnosticProbes");
    expect(TracerPedagogy.StoryPathlines).toBe("StoryPathlines");
    expect(TracerPedagogy.DownwardPathline).toBe("DownwardPathline");
    expect(Object.keys(TracerPedagogy).sort()).toEqual([
      "DiagnosticProbes",
      "DownwardPathline",
      "StoryPathlines",
    ]);
    expect(Object.values(TracerPedagogy)).not.toContain("Both");
    expect(DEFAULT_DEMO_TRACER_PEDAGOGY).toBe(TracerPedagogy.DiagnosticProbes);
    expect(LIVE_DEMO_TRACER_PEDAGOGY).toBe(TracerPedagogy.DownwardPathline);
    expect(scenarioConfigSrc).not.toMatch(/TracerPedagogy/);
  });

  it("maps DiagnosticProbes to three diagnostic seeds with trails off", () => {
    const seeds = demoSeedsForPedagogy(TracerPedagogy.DiagnosticProbes);
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.DiagnosticProbes,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.DiagnosticProbes,
      simulation.particles,
    );

    expect(demoTrailsEnabled(TracerPedagogy.DiagnosticProbes)).toBe(false);
    expect(seeds).toBe(DEMO_SCENARIO.simulation.diagnosticSeeds);
    expect(seeds).toHaveLength(3);
    expect(simulation.particles).toHaveLength(3);
    expect(simulation.particles.map((particle) => particle.position)).toEqual(
      DEMO_SCENARIO.simulation.diagnosticSeeds,
    );
    expect(history).toBeNull();
  });

  it("maps StoryPathlines to S1/S2 with a stride-1 recorder", () => {
    const seeds = demoSeedsForPedagogy(TracerPedagogy.StoryPathlines);
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.StoryPathlines,
      simulation.particles,
    );

    expect(demoTrailsEnabled(TracerPedagogy.StoryPathlines)).toBe(true);
    expect(seeds).toBe(DEMO_SCENARIO.simulation.storySeeds);
    expect(seeds).toEqual([
      { x: 0, y: 1000, z: 4000 },
      { x: 0, y: 1000, z: 6000 },
    ]);
    expect(simulation.particles).toHaveLength(2);
    expect(simulation.particles.map((particle) => particle.position)).toEqual(
      DEMO_SCENARIO.simulation.storySeeds,
    );
    expect(history).not.toBeNull();
    expect(history!.tracerCount).toBe(2);
    expect(history!.pointsFor(0)).toHaveLength(1);
    expect(history!.pointsFor(1)).toHaveLength(1);
    expect(history!.pointsFor(0)[0]).toEqual({ x: 0, y: 1000, z: 4000 });
    expect(history!.pointsFor(1)[0]).toEqual({ x: 0, y: 1000, z: 6000 });
  });

  it("keeps the live App on explicit DownwardPathline and StormRelativeLaboratory", () => {
    const seeds = demoSeedsForPedagogy(LIVE_DEMO_TRACER_PEDAGOGY);
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      LIVE_DEMO_TRACER_PEDAGOGY,
    );
    const history = createDemoPathHistory(
      LIVE_DEMO_TRACER_PEDAGOGY,
      simulation.particles,
    );

    expect(LIVE_DEMO_TRACER_PEDAGOGY).toBe(TracerPedagogy.DownwardPathline);
    expect(demoTrailsEnabled(LIVE_DEMO_TRACER_PEDAGOGY)).toBe(true);
    expect(demoKeepInactiveGlyphs(LIVE_DEMO_TRACER_PEDAGOGY)).toBe(true);
    expect(seeds).toBe(DEMO_SCENARIO.simulation.downwardPathlineSeeds);
    expect(seeds).toEqual([{ x: 5000, y: 1000, z: 0 }]);
    expect(simulation.particles).toHaveLength(1);
    expect(simulation.particles[0]!.position).toEqual({
      x: 5000,
      y: 1000,
      z: 0,
    });
    expect(history).not.toBeNull();
    expect(history!.tracerCount).toBe(1);
    expect(DEMO_SCENARIO.simulation.storySeeds).toEqual([
      { x: 0, y: 1000, z: 4000 },
      { x: 0, y: 1000, z: 6000 },
    ]);
    expect(demoSeedsForPedagogy(TracerPedagogy.StoryPathlines)).toBe(
      DEMO_SCENARIO.simulation.storySeeds,
    );
    expect(demoSeedsForPedagogy(TracerPedagogy.DiagnosticProbes)).toBe(
      DEMO_SCENARIO.simulation.diagnosticSeeds,
    );

    expect(appSrc).toMatch(/LIVE_DEMO_TRACER_PEDAGOGY/);
    expect(appSrc).toMatch(/TracerPedagogy/);
    expect(appSrc).toMatch(/IntegrationFrame\.StormRelativeLaboratory/);
    expect(appSrc).not.toMatch(/GroundRelativeWindTunnel/);
    expect(appSrc).toMatch(
      /prescribed storm-relative\s+pathline descending through the downdraft region/,
    );
    expect(appSrc).not.toMatch(/lower inflow/);
    expect(appSrc).not.toMatch(/realistic parcel path/i);
    expect(appSrc).not.toMatch(/full supercell circulation/i);
    expect(appSrc).not.toMatch(/mesocyclone capture/i);
    expect(appSrc).not.toMatch(/same-air mass circulation/i);
    expect(appSrc).not.toMatch(/air returns to the surface/i);
    expect(appSrc).not.toMatch(/RFD/i);
    expect(appSrc).not.toMatch(/cold pool/i);
  });

  it("keeps default composition on DiagnosticProbes", () => {
    const simulation = composeDemoTracerSimulation();
    expect(DEFAULT_DEMO_TRACER_PEDAGOGY).toBe(TracerPedagogy.DiagnosticProbes);
    expect(simulation.particles).toHaveLength(3);
    expect(simulation.particles.map((particle) => particle.position)).toEqual(
      DEMO_SCENARIO.simulation.diagnosticSeeds,
    );
    expect(createDemoPathHistory(DEFAULT_DEMO_TRACER_PEDAGOGY, simulation.particles)).toBeNull();
  });

  it("never concatenates diagnostic, story, and downward seed arrays", () => {
    const diagnostic = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.DiagnosticProbes,
    );
    const story = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    const downward = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.DownwardPathline,
    );
    const merged = [
      ...DEMO_SCENARIO.simulation.diagnosticSeeds,
      ...DEMO_SCENARIO.simulation.storySeeds,
      ...DEMO_SCENARIO.simulation.downwardPathlineSeeds,
    ];

    expect(diagnostic.particles).toHaveLength(3);
    expect(story.particles).toHaveLength(2);
    expect(downward.particles).toHaveLength(1);
    expect(story.particles.map((particle) => particle.position)).not.toEqual(
      merged,
    );
    expect(diagnostic.particles.map((particle) => particle.position)).not.toEqual(
      merged,
    );
    expect(downward.particles.map((particle) => particle.position)).not.toEqual(
      merged,
    );
    expect(demoSeedsForPedagogy(TracerPedagogy.DiagnosticProbes)).not.toBe(
      demoSeedsForPedagogy(TracerPedagogy.StoryPathlines),
    );
    expect(demoSeedsForPedagogy(TracerPedagogy.DownwardPathline)).not.toBe(
      demoSeedsForPedagogy(TracerPedagogy.StoryPathlines),
    );
    expect(demoSeedsForPedagogy(TracerPedagogy.DownwardPathline)).not.toBe(
      demoSeedsForPedagogy(TracerPedagogy.DiagnosticProbes),
    );
    expect(composeDemoTracerSimulationSrc).not.toMatch(/\.\.\.DEMO_SCENARIO/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(/\.concat\(/);
  });

  it("appends one history point after one completed step", () => {
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.StoryPathlines,
      simulation.particles,
    )!;

    simulation.step(DEMO_SCENARIO.simulation.timestep);
    history.recordAfterStep(simulation.particles);

    expect(history.pointsFor(0)).toHaveLength(2);
    expect(history.pointsFor(1)).toHaveLength(2);
    expect(history.pointsFor(0)[1]).toEqual(simulation.particles[0]!.position);
    expect(history.pointsFor(0)[1]).not.toBe(simulation.particles[0]!.position);
  });

  it("does not terminate live S1/S2 pathlines", () => {
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.StoryPathlines,
      simulation.particles,
    )!;

    for (let i = 0; i < 50; i++) {
      simulation.step(DEMO_SCENARIO.simulation.timestep);
      history.recordAfterStep(simulation.particles);
    }

    expect(simulation.particles[0]!.active).toBe(true);
    expect(simulation.particles[1]!.active).toBe(true);
    expect(history.pointsFor(0)).toHaveLength(51);
    expect(history.pointsFor(1)).toHaveLength(51);
    expect(history.pointsFor(0).every((point) => point.y > 0)).toBe(true);
    expect(history.pointsFor(1).every((point) => point.y > 0)).toBe(true);
  });

  it("does not append on a paused frame", () => {
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.StoryPathlines,
      simulation.particles,
    )!;

    const consumed = advanceRecordedSteps(simulation, history, 0.25, {
      paused: true,
      timeScale: 20,
    });

    expect(consumed.steps).toBe(0);
    expect(history.pointsFor(0)).toHaveLength(1);
    expect(history.pointsFor(1)).toHaveLength(1);
    expect(simulation.clock.time).toBe(0);
  });

  it("appends one point per completed step under timeScale", () => {
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.StoryPathlines,
      simulation.particles,
    )!;

    const consumed = advanceRecordedSteps(simulation, history, 0.1, {
      paused: false,
      timeScale: 10,
    });

    expect(consumed.steps).toBe(10);
    expect(history.pointsFor(0)).toHaveLength(11);
    expect(history.pointsFor(1)).toHaveLength(11);
  });

  it("resets story history to length 1 at S1/S2", () => {
    const seeds = DEMO_SCENARIO.simulation.storySeeds;
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.StoryPathlines,
      simulation.particles,
    )!;

    for (let i = 0; i < 20; i++) {
      simulation.step(DEMO_SCENARIO.simulation.timestep);
      history.recordAfterStep(simulation.particles);
    }
    expect(history.pointsFor(0).length).toBeGreaterThan(1);

    resetTracersFromSeeds(simulation, seeds);
    history.clear();
    history.captureInitial(simulation.particles);

    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles.map((particle) => particle.position)).toEqual(
      seeds,
    );
    expect(history.pointsFor(0)).toEqual([{ x: 0, y: 1000, z: 4000 }]);
    expect(history.pointsFor(1)).toEqual([{ x: 0, y: 1000, z: 6000 }]);
  });

  it("leaves diagnostic Reset on the diagnostic trio without a recorder", () => {
    const seeds = DEMO_SCENARIO.simulation.diagnosticSeeds;
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.DiagnosticProbes,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.DiagnosticProbes,
      simulation.particles,
    );

    for (let i = 0; i < 20; i++) {
      simulation.step(DEMO_SCENARIO.simulation.timestep);
    }
    resetTracersFromSeeds(simulation, seeds);

    expect(history).toBeNull();
    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles).toHaveLength(3);
    expect(simulation.particles.map((particle) => particle.position)).toEqual(
      seeds,
    );
  });

  it("keeps live StormRelativeLaboratory and seven physics operands", () => {
    const live = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    expect(live.operands).toHaveLength(7);
    expect(live.integrationFrame).toBe(
      IntegrationFrame.StormRelativeLaboratory,
    );
    expect(appSrc).toMatch(/IntegrationFrame\.StormRelativeLaboratory/);
  });

  it("keeps pedagogy out of recorder, scene, seeds factory, and ScenarioConfig", () => {
    expect(createTracersFromSeedsSrc).not.toMatch(/TracerPedagogy/);
    expect(tracerPathHistorySrc).not.toMatch(/TracerPedagogy/);
    expect(tracerSceneSrc).not.toMatch(/TracerPedagogy/);
    expect(trailGeometrySrc).not.toMatch(/TracerPedagogy/);
    expect(createTracersFromSeedsSrc).not.toMatch(/downwardPathlineSeeds/);
    expect(tracerPathHistorySrc).not.toMatch(/downwardPathlineSeeds/);
    expect(tracerSceneSrc).not.toMatch(/downwardPathlineSeeds/);
    expect(composeDemoTracerSimulationSrc).toMatch(/demoSeedsForPedagogy/);
    expect(composeDemoTracerSimulationSrc).toMatch(/createTracersFromSeeds\(/);
  });

  it("maps DownwardPathline to sole D1 with trails on", () => {
    const seeds = demoSeedsForPedagogy(TracerPedagogy.DownwardPathline);
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.DownwardPathline,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.DownwardPathline,
      simulation.particles,
    );

    expect(demoTrailsEnabled(TracerPedagogy.DownwardPathline)).toBe(true);
    expect(demoTrailsEnabled(TracerPedagogy.DiagnosticProbes)).toBe(false);
    expect(demoKeepInactiveGlyphs(TracerPedagogy.DownwardPathline)).toBe(true);
    expect(demoKeepInactiveGlyphs(TracerPedagogy.DiagnosticProbes)).toBe(false);
    expect(demoKeepInactiveGlyphs(TracerPedagogy.StoryPathlines)).toBe(false);
    expect(seeds).toBe(DEMO_SCENARIO.simulation.downwardPathlineSeeds);
    expect(seeds).not.toBe(DEMO_SCENARIO.simulation.storySeeds);
    expect(seeds).toEqual([{ x: 5000, y: 1000, z: 0 }]);
    expect(seeds).toHaveLength(1);
    expect(simulation.particles).toHaveLength(1);
    expect(simulation.particles[0]!.position).toEqual({
      x: 5000,
      y: 1000,
      z: 0,
    });
    expect(simulation.particles[0]!.active).toBe(true);
    expect(history).not.toBeNull();
    expect(history!.tracerCount).toBe(1);
    expect(history!.pointsFor(0)).toEqual([{ x: 5000, y: 1000, z: 0 }]);
  });

  it("grounds live D1 at y = 0 with one terminal trail sample", () => {
    const dt = DEMO_SCENARIO.simulation.timestep;
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      LIVE_DEMO_TRACER_PEDAGOGY,
    );
    const history = createDemoPathHistory(
      LIVE_DEMO_TRACER_PEDAGOGY,
      simulation.particles,
    )!;
    const particle = simulation.particles[0]!;
    const maxTime = 800;
    let t = 0;

    while (particle.active && t < maxTime - 1e-12) {
      simulation.step(dt);
      history.recordAfterStep(simulation.particles);
      t += dt;
    }

    expect(particle.active).toBe(false);
    expect(particle.position.y).toBe(0);
    expect(t).toBeGreaterThan(110);
    expect(t).toBeLessThan(130);
    expect(
      Math.hypot(particle.position.x - 4723, particle.position.z + 1308),
    ).toBeLessThan(25);

    const terminalLength = history.pointsFor(0).length;
    const terminal = history.pointsFor(0)[terminalLength - 1]!;
    expect(terminal).toEqual(particle.position);
    expect(terminal).not.toBe(particle.position);
    expect(terminal.y).toBe(0);

    for (let i = 0; i < 20; i++) {
      simulation.step(dt);
      history.recordAfterStep(simulation.particles);
    }
    expect(history.pointsFor(0)).toHaveLength(terminalLength);
    expect(particle.active).toBe(false);
    expect(particle.position.y).toBe(0);
  });

  it("resets live DownwardPathline to D1 with active true and trail length 1", () => {
    const seeds = demoSeedsForPedagogy(LIVE_DEMO_TRACER_PEDAGOGY);
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      LIVE_DEMO_TRACER_PEDAGOGY,
    );
    const history = createDemoPathHistory(
      LIVE_DEMO_TRACER_PEDAGOGY,
      simulation.particles,
    )!;
    const dt = DEMO_SCENARIO.simulation.timestep;

    while (simulation.particles[0]!.active) {
      simulation.step(dt);
      history.recordAfterStep(simulation.particles);
    }
    expect(simulation.particles[0]!.active).toBe(false);
    expect(history.pointsFor(0).length).toBeGreaterThan(1);

    resetTracersFromSeeds(simulation, seeds);
    history.clear();
    history.captureInitial(simulation.particles);

    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles).toHaveLength(1);
    expect(simulation.particles[0]).toEqual({
      position: { x: 5000, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(history.pointsFor(0)).toEqual([{ x: 5000, y: 1000, z: 0 }]);
  });

  it("still grounds D1 at Euler dt = 0.01", () => {
    const { field } = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const particles = createTracersFromSeeds(
      DEMO_SCENARIO.simulation.downwardPathlineSeeds,
    );
    const simulation = new Simulation(field, new EulerIntegrator(), particles, {
      tracerDomain: ATMOSPHERIC_TRACER_DOMAIN,
    });
    const dt = 0.01;
    const particle = particles[0]!;
    let t = 0;

    while (particle.active && t < 800 - 1e-12) {
      simulation.step(dt);
      t += dt;
    }

    expect(particle.active).toBe(false);
    expect(particle.position.y).toBe(0);
    expect(t).toBeGreaterThan(110);
    expect(t).toBeLessThan(130);
    expect(
      Math.hypot(particle.position.x - 4723, particle.position.z + 1308),
    ).toBeLessThan(25);
  });
});
