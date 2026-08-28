import { describe, expect, it } from "vitest";
import { GUIDED_EXPERIMENTS, GuidedExperimentId } from "../guided/GuidedExperiment.js";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import {
  composeDemoTracerFields,
  DEMO_VELOCITY_CONTRIBUTION_KEYS,
} from "./composeDemoTracerSimulation.js";
import { createExploreLab } from "./createExploreLab.js";
import {
  createGuidedLab,
  DEFAULT_GUIDED_EXPERIMENT_ID,
  resetGuidedLab,
  switchGuidedExperiment,
} from "./createGuidedLab.js";
import { guidedExperimentCompositionFor } from "./guidedExperimentComposition.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { TracerPedagogy } from "./TracerPedagogy.js";
import createGuidedLabSrc from "./createGuidedLab.ts?raw";
import appSrc from "./App.tsx?raw";

function fakeSlots(): ExploreSceneSlots {
  let tracerSlotCount = 0;
  return {
    get tracerSlotCount() {
      return tracerSlotCount;
    },
    addTracerSlot() {
      tracerSlotCount += 1;
    },
    clearTracerSlots() {
      tracerSlotCount = 0;
    },
    syncReleasePreview() {},
  };
}

const PRODUCT_IDS = [
  GuidedExperimentId.InflowToUpperOutflow,
  GuidedExperimentId.DowndraftPathToGround,
  GuidedExperimentId.NearGroundOutflow,
] as const;

describe("createGuidedLab", () => {
  it("uses the locked default product id", () => {
    expect(DEFAULT_GUIDED_EXPERIMENT_ID).toBe(
      GuidedExperimentId.InflowToUpperOutflow,
    );
    expect(DEFAULT_GUIDED_EXPERIMENT_ID).toBe("inflow-to-upper-outflow");
  });

  it("creates a fresh StormRelativeLaboratory for each public id", () => {
    const sampleAt = { x: 3000, y: 100, z: 4750 };
    const reference = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );

    for (const id of PRODUCT_IDS) {
      const policy = guidedExperimentCompositionFor(id);
      const lab = createGuidedLab(id);
      expect(lab.kind).toBe("guided");
      expect(lab.experimentId).toBe(id);
      expect(lab.simulation).not.toBe(createGuidedLab(id).simulation);
      expect(lab.simulation.clock.time).toBe(0);
      expect(lab.simulation.particles.map((particle) => particle.position)).toEqual(
        [...policy.seeds],
      );
      expect(lab.simulation.particles.map((particle) => particle.tracerId)).toEqual(
        policy.seeds.map((_, index) => index + 1),
      );
      expect(policy.trailsEnabled).toBe(true);
      expect(lab.pathHistory).not.toBeNull();
      expect(lab.pathHistory!.tracerCount).toBe(policy.seeds.length);
      expect(lab.keepInactiveGlyphs).toBe(policy.keepInactiveGlyphs);
      expect(lab.velocityObservation.parts?.map((part) => part.key)).toEqual([
        ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
      ]);
      expect(lab.velocityObservation.total.sample(sampleAt, 0)).toEqual(
        reference.field.sample(sampleAt, 0),
      );
    }

    expect(createGuidedLab(GuidedExperimentId.InflowToUpperOutflow).keepInactiveGlyphs).toBe(
      false,
    );
    expect(createGuidedLab(GuidedExperimentId.DowndraftPathToGround).keepInactiveGlyphs).toBe(
      true,
    );
    expect(createGuidedLab(GuidedExperimentId.NearGroundOutflow).keepInactiveGlyphs).toBe(
      false,
    );
  });

  it("reuses ScenarioConfig seed arrays through the Slice 1 mapping", () => {
    expect(
      createGuidedLab(GuidedExperimentId.InflowToUpperOutflow).simulation.particles.map(
        (particle) => particle.position,
      ),
    ).toEqual([...DEMO_SCENARIO.simulation.storySeeds]);
    expect(
      createGuidedLab(GuidedExperimentId.DowndraftPathToGround).simulation.particles.map(
        (particle) => particle.position,
      ),
    ).toEqual([...DEMO_SCENARIO.simulation.downwardPathlineSeeds]);
    expect(
      createGuidedLab(GuidedExperimentId.NearGroundOutflow).simulation.particles.map(
        (particle) => particle.position,
      ),
    ).toEqual([...DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds]);
    expect(createGuidedLabSrc).toMatch(/guidedExperimentCompositionFor/);
    expect(createGuidedLabSrc).toMatch(/composeDemoTracerLab/);
    expect(createGuidedLabSrc).toMatch(/createDemoPathHistory/);
    expect(createGuidedLabSrc).not.toMatch(/storySeeds/);
    expect(createGuidedLabSrc).not.toMatch(/downwardPathlineSeeds/);
    expect(createGuidedLabSrc).not.toMatch(/nearGroundOutflowPathlineSeeds/);
    expect(createGuidedLabSrc).not.toMatch(/LIVE_DEMO_TRACER_PEDAGOGY/);
  });

  it("does not compose an experiment-specific velocity-field stack", () => {
    expect(createGuidedLabSrc).toMatch(/StormRelativeLaboratory/);
    expect(createGuidedLabSrc).not.toMatch(/GroundRelativeWindTunnel/);
    expect(createGuidedLabSrc).not.toMatch(/composeDemoTracerFields/);
    expect(createGuidedLabSrc).not.toMatch(/if \(id ===/);
    expect(createGuidedLabSrc).not.toMatch(/disable/);
    for (const id of PRODUCT_IDS) {
      expect(guidedExperimentCompositionFor(id).pedagogy).not.toBe(
        TracerPedagogy.DiagnosticProbes,
      );
    }
  });
});

describe("switchGuidedExperiment", () => {
  it("replaces the Simulation and clears selection when the id changes", () => {
    const from = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    const selection = new TracerSelection();
    selection.select(from.simulation.particles[0]!.tracerId);
    const inspectionBefore = inspectSelectedTracer(
      from.simulation.particles,
      selection,
      from.simulation.clock.time,
      from.velocityObservation,
    );
    expect(inspectionBefore).toBeDefined();

    const to = switchGuidedExperiment(
      from,
      GuidedExperimentId.DowndraftPathToGround,
      selection,
    );

    expect(to).not.toBe(from);
    expect(to.simulation).not.toBe(from.simulation);
    expect(to.experimentId).toBe(GuidedExperimentId.DowndraftPathToGround);
    expect(to.simulation.particles).toHaveLength(1);
    expect(to.simulation.particles[0]!.tracerId).toBe(1);
    expect(from.simulation.particles[0]!.tracerId).toBe(1);
    expect(to.simulation.particles[0]!).not.toBe(from.simulation.particles[0]!);
    expect(selection.selectedId).toBeNull();
    expect(
      inspectSelectedTracer(
        to.simulation.particles,
        selection,
        to.simulation.clock.time,
        to.velocityObservation,
      ),
    ).toBeUndefined();
    expect(to.keepInactiveGlyphs).toBe(true);
    expect(from.keepInactiveGlyphs).toBe(false);
  });

  it("is a no-op when the same id is selected again", () => {
    const lab = createGuidedLab(GuidedExperimentId.NearGroundOutflow);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    const same = switchGuidedExperiment(
      lab,
      GuidedExperimentId.NearGroundOutflow,
      selection,
    );
    expect(same).toBe(lab);
    expect(same.simulation).toBe(lab.simulation);
    expect(selection.selectedId).toBe(1);
  });

  it("switches presentation policy with the product id", () => {
    const inflow = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    const downdraft = switchGuidedExperiment(
      inflow,
      GuidedExperimentId.DowndraftPathToGround,
      new TracerSelection(),
    );
    const nearGround = switchGuidedExperiment(
      downdraft,
      GuidedExperimentId.NearGroundOutflow,
      new TracerSelection(),
    );
    expect(inflow.pathHistory).not.toBeNull();
    expect(downdraft.pathHistory).not.toBeNull();
    expect(nearGround.pathHistory).not.toBeNull();
    expect(inflow.pathHistory).not.toBe(downdraft.pathHistory);
    expect(inflow.keepInactiveGlyphs).toBe(false);
    expect(downdraft.keepInactiveGlyphs).toBe(true);
    expect(nearGround.keepInactiveGlyphs).toBe(false);
  });
});

describe("resetGuidedLab", () => {
  it("resets in place with the current experiment's canonical seeds", () => {
    for (const id of PRODUCT_IDS) {
      const lab = createGuidedLab(id);
      const selection = new TracerSelection();
      const simulation = lab.simulation;
      const tracerIds = lab.simulation.particles.map((particle) => particle.tracerId);
      selection.select(tracerIds[0]!);
      lab.simulation.step(DEMO_SCENARIO.simulation.timestep);
      lab.pathHistory?.recordAfterStep(lab.simulation.particles, lab.simulation.clock.time);
      expect(lab.simulation.clock.time).toBeGreaterThan(0);

      resetGuidedLab(lab);

      const policy = guidedExperimentCompositionFor(id);
      expect(lab.simulation).toBe(simulation);
      expect(lab.simulation.clock.time).toBe(0);
      expect(lab.simulation.particles.map((particle) => particle.tracerId)).toEqual(
        tracerIds,
      );
      expect(lab.simulation.particles.map((particle) => particle.position)).toEqual(
        [...policy.seeds],
      );
      expect(selection.selectedId).toBe(tracerIds[0]);
      const inspection = inspectSelectedTracer(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        lab.velocityObservation,
      );
      expect(inspection).toBeDefined();
      expect(inspection!.time).toBe(0);
      expect(inspection!.position).toEqual(policy.seeds[0]);
      expect(lab.pathHistory!.pointsFor(0)).toEqual([policy.seeds[0]]);
    }
  });

  it("does not use a global default pedagogy for Reset", () => {
    expect(createGuidedLabSrc).toMatch(/lab\.experimentId/);
    expect(createGuidedLabSrc).not.toMatch(/DEFAULT_DEMO_TRACER_PEDAGOGY/);
    expect(appSrc).toMatch(/resetGuidedLab\(lab\)/);
    expect(appSrc).not.toMatch(/demoSeedsForPedagogy/);
  });
});

describe("Guided Explore isolation", () => {
  it("does not carry Explore tracers into Guided or Guided cohort into Explore", () => {
    const slots = fakeSlots();
    const explore = createExploreLab(slots);
    explore.session.releasePoint({ x: 1, y: 2, z: 3 });
    expect(explore.simulation.particles).toHaveLength(1);

    const guided = createGuidedLab(GuidedExperimentId.DowndraftPathToGround);
    expect(guided.simulation.particles).toHaveLength(1);
    expect(guided.simulation.particles[0]!.position).toEqual(
      DEMO_SCENARIO.simulation.downwardPathlineSeeds[0],
    );
    expect(guided.simulation).not.toBe(explore.simulation);
    expect("visualAirflowPopulation" in guided).toBe(false);
    expect(explore.visualAirflowPopulation.occupantCount).toBeGreaterThan(0);
    expect(explore.simulation.particles[0]!.position).toEqual({
      x: 1,
      y: 2,
      z: 3,
    });

    const emptyExplore = createExploreLab(fakeSlots());
    expect(emptyExplore.simulation.particles).toHaveLength(0);
    expect(guided.simulation.particles).toHaveLength(1);
  });
});

describe("App Guided experiment wiring", () => {
  it("owns session-local GuidedExperimentId and defaults to inflow-to-upper-outflow", () => {
    expect(appSrc).toMatch(/DEFAULT_GUIDED_EXPERIMENT_ID/);
    expect(appSrc).toMatch(
      /useState<GuidedExperimentId>\(\s*DEFAULT_GUIDED_EXPERIMENT_ID/,
    );
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*createGuidedLab\(guidedExperimentId\)/s,
    );
    expect(appSrc).toMatch(/guidedExperimentId/);
    expect(appSrc).not.toMatch(/selectedPedagogy/);
    expect(appSrc).not.toMatch(/LIVE_DEMO_TRACER_PEDAGOGY/);
    expect(appSrc).not.toMatch(/TracerPedagogy/);
  });

  it("returns to the last selected experiment after Explore", () => {
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*createGuidedLab\(guidedExperimentId\)/s,
    );
    const enterExplore = appSrc.slice(
      appSrc.indexOf("const enterExplore"),
      appSrc.indexOf("const enterGuided"),
    );
    expect(enterExplore).not.toMatch(/setGuidedExperimentId/);
    expect(enterExplore).toMatch(/createExploreLab/);
  });

  it("clears selection and inspection on experiment switch, not on Reset", () => {
    expect(appSrc).toMatch(/selectGuidedExperiment/);
    expect(appSrc).toMatch(/switchGuidedExperiment\(lab, nextId, selection\)/);
    expect(appSrc).toMatch(
      /if \(nextLab === lab\) \{\s*return;/s,
    );
    const switchBlock = appSrc.slice(
      appSrc.indexOf("const selectGuidedExperiment"),
      appSrc.indexOf("const explore ="),
    );
    expect(switchBlock).toMatch(/setInspection\(undefined\)/);
    expect(switchBlock).toMatch(/mirrorSelection\(\)/);
    expect(switchBlock).not.toMatch(/setPaused/);
    expect(switchBlock).not.toMatch(/setTimeScale/);
    const resetBlock = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const enterExplore"),
    );
    expect(resetBlock).not.toMatch(/selection\.clear/);
    expect(resetBlock).toMatch(/resetGuidedLab/);
    expect(resetBlock).toMatch(/refreshInspection/);
  });

  it("renders the experiment selector only in Guided from catalog titles", () => {
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).toMatch(/<GuidedExperimentSelector/);
    expect(guidedShell).toMatch(/value=\{guidedExperimentId\}/);
    expect(guidedShell).toMatch(/onChange=\{selectGuidedExperiment\}/);
    const exploreShell = appSrc.slice(
      appSrc.indexOf("workbench--explore"),
      appSrc.indexOf("workbench--guided"),
    );
    expect(exploreShell).not.toMatch(/GuidedExperimentSelector/);
    expect(GUIDED_EXPERIMENTS).toHaveLength(3);
  });
});
