import { describe, expect, it } from "vitest";
import appSrc from "./App.tsx?raw";
import composeDemoTracerSimulationSrc from "./composeDemoTracerSimulation.ts?raw";
import createExploreLabSrc from "./createExploreLab.ts?raw";
import createGuidedLabSrc from "./createGuidedLab.ts?raw";
import simulationSrc from "../simulation/Simulation.ts?raw";
import {
  composeDemoTracerFields,
  composeDemoTracersWithObservation,
  DEMO_VELOCITY_CONTRIBUTION_KEYS,
} from "./composeDemoTracerSimulation.js";
import { createExploreLab } from "./createExploreLab.js";
import { createGuidedLab } from "./createGuidedLab.js";
import {
  DUMAS_2010_ANALYSIS_COLUMN,
  GOSHEN_2009_ANALYSIS_COLUMN,
  PROSPECT_VALLEY_2010_ANALYSIS_COLUMN,
  exploreAnalysisColumn,
  exploreEnvironmentRepresentations,
} from "./exploreEnvironmentRepresentations.js";
import {
  DUMAS_2010_OBSERVED_RECORD,
  GOSHEN_2009_OBSERVED_RECORD,
  MOORE_2013_OBSERVED_RECORD,
  PROSPECT_VALLEY_2010_OBSERVED_RECORD,
  exploreEnvironmentalWindProfile,
} from "./goshenObservedEnvironment.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_IDENTITIES,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
} from "../explore/exploreEnvironmentIdentity.js";
import {
  NSSL1_GOSHEN_2155_SPEC,
  NSSL1_PROSPECT_VALLEY_222346_SPEC,
  NSSL2_DUMAS_215218_SPEC,
} from "../data/eolNsslMgausEsc/escObservedSoundingSpec.js";
import { queryAnalysisTiltingTendencyAt } from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { createUpdraftField } from "../scenario/createUpdraftField.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import type { TracerAdvectionState } from "../simulation/TracerParticle.js";

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

const INTERIOR: Vec3 = { x: -2000, y: 2000, z: 0 };
const DT = DEMO_SCENARIO.simulation.timestep;
const SEED: TracerAdvectionState = {
  position: { x: -2000, y: 2000, z: 0 },
  age: 0,
  active: true,
};

const ESC_CASES = [
  {
    identity: EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    source: GOSHEN_2009_OBSERVED_RECORD,
    analysis: GOSHEN_2009_ANALYSIS_COLUMN,
    spec: NSSL1_GOSHEN_2155_SPEC,
    firstAnalysis: { eastward: -2.5138, northward: 5.6671 },
    sourceFirst: { eastward: -1.2, northward: 0.2 },
    levelCount: 2029,
  },
  {
    identity: EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    source: PROSPECT_VALLEY_2010_OBSERVED_RECORD,
    analysis: PROSPECT_VALLEY_2010_ANALYSIS_COLUMN,
    spec: NSSL1_PROSPECT_VALLEY_222346_SPEC,
    firstAnalysis: { eastward: -4.5505, northward: 6.9042 },
    sourceFirst: { eastward: -0.2, northward: 2 },
    levelCount: 2733,
  },
  {
    identity: EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
    source: DUMAS_2010_OBSERVED_RECORD,
    analysis: DUMAS_2010_ANALYSIS_COLUMN,
    spec: NSSL2_DUMAS_215218_SPEC,
    firstAnalysis: { eastward: -3.1235, northward: 4.0624 },
    sourceFirst: { eastward: 0.1, northward: -1.1 },
    levelCount: 2917,
  },
] as const;

function partKeys(lab: ReturnType<typeof createExploreLab>): string[] {
  return lab.velocityObservation.parts!.map((part) => part.key);
}

function advect(
  simulation: {
    addParticle: (particle: TracerAdvectionState) => void;
    step: (dt: number) => void;
    particles: readonly { position: Vec3 }[];
  },
  seed: TracerAdvectionState,
): Vec3 {
  simulation.addParticle({
    position: { ...seed.position },
    age: seed.age,
    active: seed.active,
  });
  for (let i = 0; i < 8; i++) {
    simulation.step(DT);
  }
  return { ...simulation.particles[0]!.position };
}

describe("Explore Analysis sibling beside Source EWP", () => {
  it("pairs each ESC observed identity with its matching Analysis column", () => {
    for (const spec of ESC_CASES) {
      const representations = exploreEnvironmentRepresentations(spec.identity);
      const lab = createExploreLab(fakeSlots(), spec.identity);

      expect(representations.identity).toBe(spec.identity);
      expect(representations.sourceRecord).toBe(spec.source);
      expect(representations.sourceProfile).toBe(spec.source.profile);
      expect(representations.analysisColumn).toBe(spec.analysis);
      expect(exploreAnalysisColumn(spec.identity)).toBe(spec.analysis);

      expect(lab.environmentIdentity).toBe(spec.identity);
      expect(lab.tiltingTendency.profile).toBe(spec.source.profile);
      expect(lab.analysisColumn).toBe(spec.analysis);
      expect(lab.analysisColumn).not.toBeNull();
      expect(lab.analysisColumn!.profile).not.toBe(spec.source.profile);
      expect(lab.analysisColumn!.provenance.sourceIdentity).toBe(
        spec.spec.sourceIdentity,
      );
      expect(lab.analysisColumn!.provenance.sourceIdentity).toBe(
        spec.source.provenance.sourceIdentity,
      );
      expect(lab.analysisColumn!.profile.levelHeights()).toEqual(
        spec.source.profile.levelHeights(),
      );
      expect(lab.analysisColumn!.profile.levelHeights()).toHaveLength(
        spec.levelCount,
      );

      const sourceFirst = spec.source.profile.sampleAtHeight(
        spec.source.profile.minHeight,
      );
      expect(sourceFirst.eastward).toBeCloseTo(spec.sourceFirst.eastward, 1);
      expect(sourceFirst.northward).toBeCloseTo(spec.sourceFirst.northward, 1);

      const analysisFirst = spec.analysis.profile.sampleAtHeight(
        spec.source.profile.minHeight,
      );
      expect(analysisFirst.eastward).toBeCloseTo(spec.firstAnalysis.eastward, 4);
      expect(analysisFirst.northward).toBeCloseTo(
        spec.firstAnalysis.northward,
        4,
      );
      expect(analysisFirst.eastward).not.toBeCloseTo(sourceFirst.eastward, 3);
    }
  });

  it("keeps Moore Source working and Analysis sibling null (COLUMN_UNAVAILABLE)", () => {
    const representations = exploreEnvironmentRepresentations(
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );

    expect(representations.sourceRecord).toBe(MOORE_2013_OBSERVED_RECORD);
    expect(representations.sourceProfile).toBe(
      MOORE_2013_OBSERVED_RECORD.profile,
    );
    expect(representations.analysisColumn).toBeNull();
    expect(exploreAnalysisColumn(EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED)).toBeNull();

    expect(lab.environmentIdentity).toBe(
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    expect(lab.tiltingTendency.profile).toBe(MOORE_2013_OBSERVED_RECORD.profile);
    expect(lab.tiltingTendency.profile.levelHeights()).toHaveLength(165);
    expect(lab.analysisColumn).toBeNull();

    const updraft = createUpdraftField(DEMO_SCENARIO);
    expect(
      queryAnalysisTiltingTendencyAt(lab.analysisColumn, updraft, INTERIOR, 0)
        .status,
    ).toBe("COLUMN_UNAVAILABLE");
  });

  it("keeps Demo prescribed Source path and Analysis sibling null", () => {
    const representations = exploreEnvironmentRepresentations(
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    );
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    );
    const demoFields = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );

    expect(DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY).toBe(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    expect(representations.sourceRecord).toBeUndefined();
    expect(representations.sourceProfile).toBeUndefined();
    expect(representations.analysisColumn).toBeNull();
    expect(
      exploreEnvironmentalWindProfile(EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED),
    ).toBeUndefined();

    expect(lab.environmentIdentity).toBe(EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED);
    expect(lab.analysisColumn).toBeNull();
    expect(lab.tiltingTendency.profile.minHeight).toBe(0);
    expect(lab.tiltingTendency.profile.levelHeights()).toHaveLength(5);
    expect(lab.velocityObservation.total.sample(INTERIOR, 0)).toEqual(
      demoFields.field.sample(INTERIOR, 0),
    );
  });

  it("does not leave a stale Analysis column when switching identities", () => {
    const goshen = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const prospect = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    );
    const moore = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    const demo = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    );

    expect(goshen.analysisColumn).toBe(GOSHEN_2009_ANALYSIS_COLUMN);
    expect(prospect.analysisColumn).toBe(PROSPECT_VALLEY_2010_ANALYSIS_COLUMN);
    expect(prospect.analysisColumn).not.toBe(goshen.analysisColumn);
    expect(prospect.tiltingTendency.profile).toBe(
      PROSPECT_VALLEY_2010_OBSERVED_RECORD.profile,
    );
    expect(prospect.tiltingTendency.profile).not.toBe(
      goshen.tiltingTendency.profile,
    );

    expect(moore.analysisColumn).toBeNull();
    expect(moore.tiltingTendency.profile).toBe(
      MOORE_2013_OBSERVED_RECORD.profile,
    );
    expect(moore.analysisColumn).not.toBe(goshen.analysisColumn);

    expect(demo.analysisColumn).toBeNull();
    expect(demo.tiltingTendency.profile.levelHeights()).toHaveLength(5);
    expect(demo.tiltingTendency.profile).not.toBe(
      goshen.tiltingTendency.profile,
    );
  });

  it("forbids cross-environment Source/Analysis mismatch on the lookup and lab", () => {
    const byIdentity = new Map(
      EXPLORE_ENVIRONMENT_IDENTITIES.map((identity) => [
        identity,
        exploreEnvironmentRepresentations(identity),
      ]),
    );

    for (const identity of EXPLORE_ENVIRONMENT_IDENTITIES) {
      const current = byIdentity.get(identity)!;
      const lab = createExploreLab(fakeSlots(), identity);
      expect(lab.environmentIdentity).toBe(identity);
      expect(lab.analysisColumn).toBe(current.analysisColumn);
      expect(lab.tiltingTendency.profile).toBe(
        current.sourceProfile ?? lab.tiltingTendency.profile,
      );

      for (const other of EXPLORE_ENVIRONMENT_IDENTITIES) {
        if (other === identity) {
          continue;
        }
        const otherRep = byIdentity.get(other)!;
        if (otherRep.analysisColumn !== null) {
          expect(current.analysisColumn).not.toBe(otherRep.analysisColumn);
          expect(lab.analysisColumn).not.toBe(otherRep.analysisColumn);
        }
      }
    }

    expect(
      exploreEnvironmentRepresentations(
        EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
      ).analysisColumn,
    ).not.toBe(PROSPECT_VALLEY_2010_ANALYSIS_COLUMN);
    expect(
      exploreEnvironmentRepresentations(
        EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
      ).analysisColumn,
    ).not.toBe(GOSHEN_2009_ANALYSIS_COLUMN);
  });

  it("keeps Source EWP identity and seven-operand Source V_env composition", () => {
    for (const spec of ESC_CASES) {
      const lab = createExploreLab(fakeSlots(), spec.identity);
      const sourceOnly = composeDemoTracerFields(
        IntegrationFrame.StormRelativeLaboratory,
        spec.source.profile,
      );

      expect(lab.tiltingTendency.profile).toBe(spec.source.profile);
      expect(partKeys(lab)).toEqual([...DEMO_VELOCITY_CONTRIBUTION_KEYS]);
      expect(lab.velocityObservation.parts).toHaveLength(7);
      expect(lab.velocityObservation.total.sample(INTERIOR, 0)).toEqual(
        sourceOnly.field.sample(INTERIOR, 0),
      );
      expect(lab.velocityObservation.parts![0]!.field.sample(INTERIOR, 0)).toEqual(
        sourceOnly.environmentField.sample(INTERIOR, 0),
      );
    }

    const mooreLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    const mooreSource = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
      MOORE_2013_OBSERVED_RECORD.profile,
    );
    expect(mooreLab.velocityObservation.total.sample(INTERIOR, 0)).toEqual(
      mooreSource.field.sample(INTERIOR, 0),
    );

    expect(composeDemoTracerSimulationSrc).toMatch(
      /new CompositeVelocityField\(\[\s*environmentField,\s*updraftField,\s*rotationField,\s*lowerRadialInflowField,\s*upperRadialOutflowField,\s*downdraftField,\s*nearGroundOutflowField,\s*\]/,
    );
    expect(composeDemoTracerSimulationSrc).not.toMatch(/analysisColumn/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(
      /createEscHrTimeAnalysis/,
    );
    expect(composeDemoTracerSimulationSrc).not.toMatch(/escHrTimeAnalysis/);
  });

  it("does not give Simulation an Analysis dependency", () => {
    expect(simulationSrc).not.toMatch(/analysisColumn/);
    expect(simulationSrc).not.toMatch(/EscHrTimeAnalysis/);
    expect(simulationSrc).not.toMatch(/createEscHrTimeAnalysis/);
    expect(simulationSrc).not.toMatch(/escHrTimeAnalysis/);

    expect(createExploreLabSrc).toMatch(
      /composeDemoTracersWithObservation\(\s*IntegrationFrame\.StormRelativeLaboratory,\s*\[\],\s*environment\.sourceProfile,\s*\)/,
    );
    expect(createExploreLabSrc).not.toMatch(
      /composeDemoTracersWithObservation\([^)]*analysisColumn/,
    );

    expect(createGuidedLabSrc).not.toMatch(/analysisColumn/);
    expect(createGuidedLabSrc).not.toMatch(/createEscHrTimeAnalysis/);
    expect(
      createGuidedLab(GuidedExperimentId.InflowToUpperOutflow),
    ).not.toHaveProperty("analysisColumn");
  });

  it("does not change deterministic tracer advection when an Analysis sibling is present", () => {
    const identities: Array<{
      identity:
        | typeof EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED
        | typeof EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED
        | typeof EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED;
      sourceProfile: ReturnType<typeof exploreEnvironmentalWindProfile>;
    }> = [
      {
        identity: EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
        sourceProfile: undefined,
      },
      {
        identity: EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
        sourceProfile: GOSHEN_2009_OBSERVED_RECORD.profile,
      },
      {
        identity: EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
        sourceProfile: MOORE_2013_OBSERVED_RECORD.profile,
      },
    ];

    for (const spec of identities) {
      const lab = createExploreLab(fakeSlots(), spec.identity);
      const control = composeDemoTracersWithObservation(
        IntegrationFrame.StormRelativeLaboratory,
        [],
        spec.sourceProfile,
      );
      if (spec.identity === EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED) {
        expect(lab.analysisColumn).toBe(GOSHEN_2009_ANALYSIS_COLUMN);
      } else {
        expect(lab.analysisColumn).toBeNull();
      }
      expect(advect(lab.simulation, SEED)).toEqual(
        advect(control.simulation, SEED),
      );
    }
  });

  it("does not keep a second Analysis selector; I3 consumes the I1 sibling", () => {
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*createExploreLab\(\s*sceneSlotsRef\.current!,\s*exploreEnvironmentIdentity/s,
    );
    expect(appSrc).toMatch(
      /selectExploreEnvironment[\s\S]*createExploreLab\(\s*sceneSlotsRef\.current!,\s*next/s,
    );
    expect(appSrc).not.toMatch(/setAnalysisColumn/);
    expect(appSrc).not.toMatch(/projectAnalysisTiltingAlongRecordedPath/);
    expect(appSrc).not.toMatch(/trajectoryTiltingOverlay/);
    expect(appSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(appSrc).toMatch(/TrajectoryTiltingVerificationPanel/);
    expect(appSrc).toMatch(/TrajectoryTiltingWhatIfPanel/);
    expect(createExploreLabSrc).not.toMatch(
      /projectAnalysisTiltingAlongRecordedPath/,
    );
    expect(createExploreLabSrc).not.toMatch(/trajectoryTiltingOverlay/);
  });
});

describe("ExploreEnvironmentRepresentations public lookup", () => {
  it("is a pure function of one identity, not a second environment selector", () => {
    const a = exploreEnvironmentRepresentations(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const b = exploreEnvironmentRepresentations(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    expect(a).toEqual(b);
    expect(a.analysisColumn).toBe(b.analysisColumn);
    expect(a.sourceProfile).toBe(b.sourceProfile);
  });
});
