import { describe, expect, it } from "vitest";
import {
  composeDemoTracerFields,
  composeDemoTracerSimulation,
  demoSeedsForPedagogy,
} from "./composeDemoTracerSimulation.js";
import {
  composeExploreTracerSimulation,
  createExploreLab,
} from "./createExploreLab.js";
import createExploreLabSrc from "./createExploreLab.ts?raw";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { TracerPedagogy } from "./TracerPedagogy.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";

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
    expect(createExploreLabSrc).not.toMatch(/DEMO_SCENARIO/);
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
