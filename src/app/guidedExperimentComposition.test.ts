import { describe, expect, it } from "vitest";
import {
  GUIDED_EXPERIMENTS,
  GuidedExperimentId,
} from "../guided/GuidedExperiment.js";
import {
  guidedExperimentCompositionFor,
  pedagogyForGuidedExperiment,
} from "./guidedExperimentComposition.js";
import mappingSrc from "./guidedExperimentComposition.ts?raw";
import catalogSrc from "../guided/GuidedExperiment.ts?raw";
import composeSrc from "./composeDemoTracerSimulation.ts?raw";
import {
  demoKeepInactiveGlyphs,
  demoSeedsForPedagogy,
  demoTrailsEnabled,
} from "./composeDemoTracerSimulation.js";
import { TracerPedagogy } from "./TracerPedagogy.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import appSrc from "./App.tsx?raw";

const PRODUCT_TO_PEDAGOGY = [
  [
    GuidedExperimentId.InflowToUpperOutflow,
    TracerPedagogy.StoryPathlines,
    DEMO_SCENARIO.simulation.storySeeds,
  ],
  [
    GuidedExperimentId.DowndraftPathToGround,
    TracerPedagogy.DownwardPathline,
    DEMO_SCENARIO.simulation.downwardPathlineSeeds,
  ],
  [
    GuidedExperimentId.NearGroundOutflow,
    TracerPedagogy.NearGroundOutflowPathline,
    DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds,
  ],
] as const;

describe("guidedExperimentComposition", () => {
  it("maps each public id onto the locked TracerPedagogy", () => {
    for (const [id, pedagogy] of PRODUCT_TO_PEDAGOGY) {
      expect(pedagogyForGuidedExperiment(id)).toBe(pedagogy);
    }
    expect(GUIDED_EXPERIMENTS).toHaveLength(3);
    expect(
      GUIDED_EXPERIMENTS.map((entry) => pedagogyForGuidedExperiment(entry.id)),
    ).toEqual([
      TracerPedagogy.StoryPathlines,
      TracerPedagogy.DownwardPathline,
      TracerPedagogy.NearGroundOutflowPathline,
    ]);
  });

  it("does not give DiagnosticProbes a public product id", () => {
    expect(Object.values(GuidedExperimentId)).not.toContain(
      TracerPedagogy.DiagnosticProbes,
    );
    expect(
      GUIDED_EXPERIMENTS.map((entry) => pedagogyForGuidedExperiment(entry.id)),
    ).not.toContain(TracerPedagogy.DiagnosticProbes);
  });

  it("reuses ScenarioConfig seed arrays through demoSeedsForPedagogy", () => {
    for (const [id, pedagogy, canonical] of PRODUCT_TO_PEDAGOGY) {
      const policy = guidedExperimentCompositionFor(id);
      expect(policy.pedagogy).toBe(pedagogy);
      expect(policy.seeds).toBe(demoSeedsForPedagogy(pedagogy));
      expect(policy.seeds).toBe(canonical);
      expect(policy.trailsEnabled).toBe(demoTrailsEnabled(pedagogy));
      expect(policy.keepInactiveGlyphs).toBe(demoKeepInactiveGlyphs(pedagogy));
    }
  });

  it("chooses experience policy and does not compose a VelocityField stack", () => {
    expect(mappingSrc).not.toMatch(/composeDemoTracerFields/);
    expect(mappingSrc).not.toMatch(/from ["'].*VelocityField/);
    expect(mappingSrc).not.toMatch(/CompositeVelocityField/);
    expect(catalogSrc).not.toMatch(/demoSeedsForPedagogy/);
    expect(catalogSrc).not.toMatch(/storySeeds/);
    expect(composeSrc).not.toMatch(/from ["'].*GuidedExperiment/);
  });

  it("leaves live Guided lab creation to createGuidedLab(id)", () => {
    expect(appSrc).toMatch(/createGuidedLab\(guidedExperimentId\)/);
    expect(appSrc).toMatch(/DEFAULT_GUIDED_EXPERIMENT_ID/);
    expect(appSrc).not.toMatch(/LIVE_DEMO_TRACER_PEDAGOGY/);
    expect(appSrc).not.toMatch(/pedagogyForGuidedExperiment/);
    expect(appSrc).not.toMatch(/guidedExperimentCompositionFor/);
  });
});
