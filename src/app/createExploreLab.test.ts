import { describe, expect, it } from "vitest";
import {
  composeDemoTracerFields,
  composeDemoTracerSimulation,
  demoSeedsForPedagogy,
} from "./composeDemoTracerSimulation.js";
import {
  composeExploreTracerSimulation,
  createExploreLab,
  exploreStormMotionFor,
  resetExploreLab,
  sameStormMotion,
  withExploreStormMotionOverride,
} from "./createExploreLab.js";
import createExploreLabSrc from "./createExploreLab.ts?raw";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { TracerPedagogy } from "./TracerPedagogy.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED, EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED, EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED } from "../explore/exploreEnvironmentIdentity.js";
import { exploreEnvironmentalWindProfile } from "./goshenObservedEnvironment.js";

function fakeSlots(): ExploreSceneSlots {
  let tracerSlotCount = 0;
  return {
    get tracerSlotCount() {
      return tracerSlotCount;
    },
    addTracerSlot() {
      tracerSlotCount += 1;
    },
    removeLastTracerSlot() {
      if (tracerSlotCount > 0) {
        tracerSlotCount -= 1;
      }
    },
    clearTracerSlots() {
      tracerSlotCount = 0;
    },
    syncReleasePreview() {},
  };
}

describe("createExploreLab", () => {
  it("enters Explore with zero tracers, lanes, and slots on the seven-operand SR laboratory", () => {
    const slots = fakeSlots();
    const lab = createExploreLab(slots);
    expect(lab.kind).toBe("explore");
    expect(lab.simulation.particles).toHaveLength(0);
    expect(lab.pathHistory.tracerCount).toBe(0);
    expect(lab.session.seeds).toEqual([]);
    expect(lab.simulation.clock.time).toBe(0);
    expect(slots.tracerSlotCount).toBe(0);
    expect(lab.tool.pendingSeed).toBeNull();
    expect(lab.tool.placementEnabled).toBe(false);
    expect(lab.tool.altitudeM).toBe(1000);
    expect(lab.orchestration.canUndo).toBe(false);
    expect(lab.orchestration.canRedo).toBe(false);
    expect(lab.velocityObservation.parts).toHaveLength(7);
    expect(lab.visualAirflowPopulation.occupantCount).toBeGreaterThan(0);
    expect(
      lab.visualAirflowPopulation.samplesField(lab.velocityObservation.total),
    ).toBe(true);
  });

  it("samples the same seven-operand field as Guided StormRelativeLaboratory", () => {
    const exploreFields = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const guidedFields = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    expect(exploreFields.operands).toHaveLength(7);
    expect(guidedFields.operands).toHaveLength(7);
    const p = { x: 3000, y: 100, z: 4750 };
    expect(exploreFields.field.sample(p, 0)).toEqual(
      guidedFields.field.sample(p, 0),
    );

    const explore = composeExploreTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const guided = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.NearGroundOutflowPathline,
    );
    expect(explore.particles).toHaveLength(0);
    expect(guided.particles).toHaveLength(1);
    expect(guided.particles[0]!.position).toEqual(
      DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds[0],
    );
  });

  it("does not import pedagogy seed arrays or mutate ScenarioConfig", () => {
    const story = structuredClone(DEMO_SCENARIO.simulation.storySeeds);
    const downward = structuredClone(
      DEMO_SCENARIO.simulation.downwardPathlineSeeds,
    );
    const ng = structuredClone(
      DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds,
    );
    const diagnostic = structuredClone(
      DEMO_SCENARIO.simulation.diagnosticSeeds,
    );

    createExploreLab(fakeSlots());

    expect(DEMO_SCENARIO.simulation.storySeeds).toEqual(story);
    expect(DEMO_SCENARIO.simulation.downwardPathlineSeeds).toEqual(downward);
    expect(DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds).toEqual(ng);
    expect(DEMO_SCENARIO.simulation.diagnosticSeeds).toEqual(diagnostic);
    expect(createExploreLabSrc).toMatch(/composeDemoTracersWithObservation/);
    expect(createExploreLabSrc).toMatch(/StormRelativeLaboratory/);
    expect(createExploreLabSrc).toMatch(/velocityObservation/);
    expect(createExploreLabSrc).not.toMatch(/demoSeedsForPedagogy/);
    expect(createExploreLabSrc).not.toMatch(/TracerPedagogy/);
    expect(createExploreLabSrc).not.toMatch(/storySeeds/);
    expect(createExploreLabSrc).not.toMatch(/downwardPathlineSeeds/);
    expect(createExploreLabSrc).not.toMatch(/nearGroundOutflowPathlineSeeds/);
    expect(createExploreLabSrc).not.toMatch(/diagnosticSeeds/);
    expect(createExploreLabSrc).toMatch(/DEMO_SCENARIO\.stormMotion/);
  });

  it("keeps four observed C overrides independent and restores the prescribed default", () => {
    expect(sameStormMotion({ eastward: 10, northward: 0 }, DEMO_SCENARIO.stormMotion)).toBe(true);
    expect(sameStormMotion({ eastward: 11, northward: 0 }, DEMO_SCENARIO.stormMotion)).toBe(false);
    const ids = [EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED, EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
      EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED, EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED] as const;
    let overrides = {};
    ids.forEach((id, index) => { overrides = withExploreStormMotionOverride(overrides, id,
      { eastward: index + 1, northward: -(index + 1) }); });
    ids.forEach((id, index) => expect(exploreStormMotionFor(id, overrides)).toEqual(
      { eastward: index + 1, northward: -(index + 1) }));
    overrides = withExploreStormMotionOverride(overrides, ids[1], DEMO_SCENARIO.stormMotion);
    expect(exploreStormMotionFor(ids[1], overrides)).toEqual({ eastward: 10, northward: 0 });
    expect(exploreStormMotionFor(ids[0], overrides)).toEqual({ eastward: 1, northward: -1 });
  });

  it("uses one C for lab and environmental operand without changing source or storm-local fields", () => {
    const id = EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED;
    const source = exploreEnvironmentalWindProfile(id)!;
    const original = createExploreLab(fakeSlots(), id);
    const changed = createExploreLab(fakeSlots(), id, { eastward: 13, northward: -4 });
    expect(changed.simulation).not.toBe(original.simulation);
    expect(changed.pathHistory).not.toBe(original.pathHistory);
    expect(changed.session.seeds).toEqual([]);
    const p = { x: -2000, y: 2000, z: 0 };
    const originalParts = original.velocityObservation.parts!;
    const changedParts = changed.velocityObservation.parts!;
    const before = originalParts[0]!.field.sample(p, 0);
    const after = changedParts[0]!.field.sample(p, 0);
    expect(changed.stormMotion).toEqual({ eastward: 13, northward: -4 });
    expect(after.x - before.x).toBeCloseTo(-3);
    expect(after.z - before.z).toBeCloseTo(-4);
    expect(changedParts.slice(1).map(x => x.field.sample(p, 0))).toEqual(
      originalParts.slice(1).map(x => x.field.sample(p, 0)));
    expect(exploreEnvironmentalWindProfile(id)).toBe(source);
    resetExploreLab(changed);
    expect(changed.stormMotion).toEqual({ eastward: 13, northward: -4 });
    expect(changed.simulation.particles).toHaveLength(0);
    expect(changed.pathHistory.tracerCount).toBe(0);
  });

  it("leaves the three Guided experiments and diagnostic preset as composition options", () => {
    expect(demoSeedsForPedagogy(TracerPedagogy.StoryPathlines)).toEqual(
      DEMO_SCENARIO.simulation.storySeeds,
    );
    expect(demoSeedsForPedagogy(TracerPedagogy.DownwardPathline)).toEqual(
      DEMO_SCENARIO.simulation.downwardPathlineSeeds,
    );
    expect(
      demoSeedsForPedagogy(TracerPedagogy.NearGroundOutflowPathline),
    ).toEqual(DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds);
    expect(demoSeedsForPedagogy(TracerPedagogy.DiagnosticProbes)).toEqual(
      DEMO_SCENARIO.simulation.diagnosticSeeds,
    );
    expect(
      composeDemoTracerSimulation(
        IntegrationFrame.StormRelativeLaboratory,
        TracerPedagogy.StoryPathlines,
      ).particles,
    ).toHaveLength(2);
    expect(
      composeDemoTracerSimulation(
        IntegrationFrame.StormRelativeLaboratory,
        TracerPedagogy.DownwardPathline,
      ).particles,
    ).toHaveLength(1);
    expect(
      composeDemoTracerSimulation(
        IntegrationFrame.StormRelativeLaboratory,
        TracerPedagogy.NearGroundOutflowPathline,
      ).particles,
    ).toHaveLength(1);
    expect(
      composeDemoTracerSimulation(
        IntegrationFrame.StormRelativeLaboratory,
        TracerPedagogy.DiagnosticProbes,
      ).particles,
    ).toHaveLength(3);
  });
});
