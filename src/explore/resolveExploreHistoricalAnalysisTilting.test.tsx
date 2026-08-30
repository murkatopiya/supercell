import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import { createExploreLab } from "../app/createExploreLab.js";
import { createGuidedLab } from "../app/createGuidedLab.js";
import type { ExploreSceneSlots } from "./ExplorePointReleaseOrchestration.js";
import {
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
} from "./exploreEnvironmentIdentity.js";
import {
  createExploreHistoricalAnalysisTiltingView,
  exploreAnalysisTiltingExplorerActive,
  resolveExploreHistoricalAnalysisTiltingExplanation,
} from "./resolveExploreHistoricalAnalysisTilting.js";
import resolverSrc from "./resolveExploreHistoricalAnalysisTilting.ts?raw";
import { queryAnalysisTiltingExplanationAt } from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import type {
  AnalysisTiltingAlignment,
  AnalysisTiltingExplanationResult,
} from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";

type SupportedExplanation = Extract<
  AnalysisTiltingExplanationResult,
  { status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED" }
>;
import {
  ANALYSIS_QUERY_REPRESENTATION,
  NATIVE_CONTAINING_SEGMENT_METHOD,
} from "../data/escHrTimeAnalysis/analysisQuery.js";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
} from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { projectAnalysisTiltingAlongRecordedPath } from "../data/escHrTimeAnalysis/trajectoryTiltingProjection.js";
import { encodeExploreAnalysisTiltingAlongHistory } from "./encodeExploreAnalysisTilting.js";
import {
  createTrajectoryTiltingWhatIfModel,
  counterfactualTiltingTendency,
} from "../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import type { EscHrTimeAnalysisProvenance } from "../data/escHrTimeAnalysis/types.js";
import type { PathHistorySample } from "../simulation/TracerPathHistory.js";
import { resolveHistoricalPathSample } from "../interaction/HistoricalPathProbe.js";
import { TrajectoryTiltingVerificationPanel } from "../ui/tracer/TrajectoryTiltingVerificationPanel.js";
import { formatVerificationScientific } from "../ui/tracer/formatTrajectoryTiltingVerification.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import {
  createTrajectoryTiltingGlyph,
  disposeTrajectoryTiltingGlyph,
} from "../rendering/trajectoryTiltingGlyph.js";
import {
  createTrajectoryTiltingWhatIfGlyph,
  disposeTrajectoryTiltingWhatIfGlyph,
} from "../rendering/trajectoryTiltingWhatIfGlyph.js";
import appSrc from "../app/App.tsx?raw";
import viewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import pickSrc from "../rendering/pickPathHistorySample.ts?raw";
import createExploreLabSrc from "../app/createExploreLab.ts?raw";
import createGuidedLabSrc from "../app/createGuidedLab.ts?raw";
import simulationSrc from "../simulation/Simulation.ts?raw";
import compositeSrc from "../core/fields/CompositeVelocityField.ts?raw";
import pointDiagnosticsPanelSrc from "../ui/tracer/PointDiagnosticsPanel.tsx?raw";
import pointDiagnosticsSrc from "../interaction/PointDiagnosticObservation.ts?raw";

const INTERIOR: PathHistorySample = {
  position: { x: -2000, y: 2000, z: 0 },
  simulationTime: 0,
};

const NEAR_SURFACE: PathHistorySample = {
  position: { x: 0, y: 2.4, z: 0 },
  simulationTime: 0,
};

const OOD: PathHistorySample = {
  position: { x: 0, y: -50, z: 0 },
  simulationTime: 0,
};

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "i3-test",
  samplingClass: "high-resolution-mobile-esc",
  transformId: "esc-hr-time-hamming-sinc-lowpass",
  transformVersion: "v1",
  domain: "TIME",
  cutoffWavelengthS: 40,
  sampleIntervalS: 1,
  tapCount: 81,
  window: "Hamming",
  phase: "zero",
  gapPolicy: "integer-linear-uvh-max-5s",
  interpolatedCount: 0,
  uniformN: 121,
  interpolationFraction: 0,
  maxGapS: 0,
  boundaryPolicy: "half-sample-mirror",
  supportSemantics: "sample-level FULL_SUPPORT | BOUNDARY_CONDITIONED",
  outputCoordinate: "Source heights",
  researchPredecessor: "v0.1-research",
};

function fakeSlots(): ExploreSceneSlots {
  let tracerSlotCount = 0;
  return {
    addTracerSlot() {
      tracerSlotCount += 1;
    },
    removeLastTracerSlot() {
      if (tracerSlotCount > 0) {
        tracerSlotCount -= 1;
      }
    },
    get tracerSlotCount() {
      return tracerSlotCount;
    },
    clearTracerSlots() {
      tracerSlotCount = 0;
    },
    syncReleasePreview() {},
  };
}

function constructedExplanation(
  overrides: {
    status?: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
    tiltingTendency?: number;
    omegaX?: number;
    omegaZ?: number;
    omegaHMagnitude?: number;
    dVyDx?: number;
    dVyDz?: number;
    gradientMagnitude?: number;
    alignment?: AnalysisTiltingAlignment;
  } = {},
): SupportedExplanation {
  return {
    status: overrides.status ?? "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency: overrides.tiltingTendency ?? 0.0008,
    worldHorizontalVorticity: {
      omegaX: overrides.omegaX ?? 0.02,
      omegaZ: overrides.omegaZ ?? 0,
    },
    updraftHorizontalGradient: {
      dVyDx: overrides.dVyDx ?? 0,
      dVyDz: overrides.dVyDz ?? 0.04,
    },
    omegaHMagnitude: overrides.omegaHMagnitude ?? 0.02,
    gradientMagnitude: overrides.gradientMagnitude ?? 0.04,
    alignment: overrides.alignment ?? {
      state: "ALIGNMENT_DEFINED",
      cosTheta: 1,
      theta: 0,
    },
    provenance: STUB_PROVENANCE,
  };
}

describe("resolveExploreHistoricalAnalysisTiltingExplanation", () => {
  it("A–C resolve matching Analysis explanations at recorded Goshen / Prospect / Dumas samples", () => {
    const cases = [
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
      EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
    ] as const;
    for (const identity of cases) {
      const lab = createExploreLab(fakeSlots(), identity);
      const explanation = resolveExploreHistoricalAnalysisTiltingExplanation(
        lab.analysisColumn,
        lab.tiltingTendency.updraft,
        INTERIOR.position,
        INTERIOR.simulationTime,
      );
      const direct = queryAnalysisTiltingExplanationAt(
        lab.analysisColumn,
        lab.tiltingTendency.updraft,
        INTERIOR.position,
        INTERIOR.simulationTime,
      );
      expect(explanation).toEqual(direct);
      expect(explanation.status === "FULL_SUPPORT" || explanation.status === "BOUNDARY_CONDITIONED").toBe(
        true,
      );
      if (
        explanation.status === "FULL_SUPPORT" ||
        explanation.status === "BOUNDARY_CONDITIONED"
      ) {
        expect(explanation.provenance.sourceIdentity).toBe(
          lab.analysisColumn!.provenance.sourceIdentity,
        );
      }
    }
  });

  it("D–E keep Moore COLUMN_UNAVAILABLE and hide Demo Analysis explorer UX", () => {
    const moore = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    const demo = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    );
    expect(
      resolveExploreHistoricalAnalysisTiltingExplanation(
        moore.analysisColumn,
        moore.tiltingTendency.updraft,
        INTERIOR.position,
        INTERIOR.simulationTime,
      ).status,
    ).toBe("COLUMN_UNAVAILABLE");
    expect(
      exploreAnalysisTiltingExplorerActive(
        EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
        true,
      ),
    ).toBe(true);
    expect(
      exploreAnalysisTiltingExplorerActive(
        EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
        true,
      ),
    ).toBe(false);
    expect(demo.analysisColumn).toBeNull();
    expect(createGuidedLabSrc).not.toMatch(
      /resolveExploreHistoricalAnalysisTilting/,
    );
  });

  it("F–G pass exact recorded P/t to Slice A and do not interpolate", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const recorded = {
      position: { x: -1500, y: 1800, z: 40 },
      simulationTime: 12.4,
    };
    const explanation = resolveExploreHistoricalAnalysisTiltingExplanation(
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
      recorded.position,
      recorded.simulationTime,
    );
    expect(explanation).toEqual(
      queryAnalysisTiltingExplanationAt(
        lab.analysisColumn,
        lab.tiltingTendency.updraft,
        recorded.position,
        recorded.simulationTime,
      ),
    );
    expect(resolverSrc).not.toMatch(/historyIndex \+ 0\./);
    expect(resolverSrc).not.toMatch(/\bmidpoint\b/);
    expect(resolverSrc).toMatch(/queryAnalysisTiltingExplanationAt/);
  });
});

describe("createExploreHistoricalAnalysisTiltingView", () => {
  it("H–J glyph vectors and verification T1 equal the atomic explanation", () => {
    const explanation = constructedExplanation();
    const view = createExploreHistoricalAnalysisTiltingView(
      explanation,
      INTERIOR,
      undefined,
    );
    expect(view.glyphModel.kind).toBe("SUPPORTED");
    if (view.glyphModel.kind !== "SUPPORTED") {
      return;
    }
    expect(view.glyphModel.omega.vectorWorld).toEqual({
      x: explanation.worldHorizontalVorticity.omegaX,
      y: 0,
      z: explanation.worldHorizontalVorticity.omegaZ,
    });
    expect(view.glyphModel.gradient.vectorWorld).toEqual({
      x: explanation.updraftHorizontalGradient.dVyDx,
      y: 0,
      z: explanation.updraftHorizontalGradient.dVyDz,
    });
    expect(view.glyphModel.omega.magnitude).toBe(explanation.omegaHMagnitude);
    expect(view.verificationModel.kind).toBe("SUPPORTED");
    if (view.verificationModel.kind !== "SUPPORTED") {
      return;
    }
    expect(view.verificationModel.tiltingTendency).toBe(
      explanation.tiltingTendency,
    );
    expect(view.glyphModel.anchor).toEqual(INTERIOR.position);
  });

  it("K trail owner-i raw T1 equals probe explanation T1", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const samples: PathHistorySample[] = [
      INTERIOR,
      { position: { x: -1990, y: 2010, z: 10 }, simulationTime: 0.1 },
      { position: { x: -1980, y: 2020, z: 20 }, simulationTime: 0.2 },
    ];
    const projection = projectAnalysisTiltingAlongRecordedPath(
      samples,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    const encoding = encodeExploreAnalysisTiltingAlongHistory(
      samples,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    const owner = encoding.valueSegments.find(
      (segment) => segment.ownerHistoryIndex === 0,
    );
    expect(owner).toBeDefined();
    const explanation = resolveExploreHistoricalAnalysisTiltingExplanation(
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
      samples[0]!.position,
      samples[0]!.simulationTime,
    );
    const projected = projection[0]!;
    expect(
      projected.analysis.status === "FULL_SUPPORT" ||
        projected.analysis.status === "BOUNDARY_CONDITIONED",
    ).toBe(true);
    if (
      projected.analysis.status === "FULL_SUPPORT" ||
      projected.analysis.status === "BOUNDARY_CONDITIONED"
    ) {
      expect(explanation.status).toBe(projected.analysis.status);
      if (
        explanation.status === "FULL_SUPPORT" ||
        explanation.status === "BOUNDARY_CONDITIONED"
      ) {
        expect(explanation.tiltingTendency).toBe(
          projected.analysis.tiltingTendency,
        );
      }
    }
  });

  it("L probe remains available when sample i has no drawable segment", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const samples: PathHistorySample[] = [
      { position: { x: -2000, y: 2000, z: 0 }, simulationTime: 0 },
      { position: { x: 0, y: -50, z: 0 }, simulationTime: 0.1 },
    ];
    const encoding = encodeExploreAnalysisTiltingAlongHistory(
      samples,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    expect(
      encoding.valueSegments.some(
        (segment) => segment.ownerHistoryIndex === 0,
      ),
    ).toBe(false);
    const explanation = resolveExploreHistoricalAnalysisTiltingExplanation(
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
      samples[0]!.position,
      samples[0]!.simulationTime,
    );
    expect(
      explanation.status === "FULL_SUPPORT" ||
        explanation.status === "BOUNDARY_CONDITIONED",
    ).toBe(true);
  });

  it("M–P FULL / BOUNDARY / OOD / COLUMN packaged without zero fallback", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const full = resolveExploreHistoricalAnalysisTiltingExplanation(
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
      INTERIOR.position,
      INTERIOR.simulationTime,
    );
    const boundary = resolveExploreHistoricalAnalysisTiltingExplanation(
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
      NEAR_SURFACE.position,
      NEAR_SURFACE.simulationTime,
    );
    const ood = resolveExploreHistoricalAnalysisTiltingExplanation(
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
      OOD.position,
      OOD.simulationTime,
    );
    const column = resolveExploreHistoricalAnalysisTiltingExplanation(
      null,
      lab.tiltingTendency.updraft,
      INTERIOR.position,
      INTERIOR.simulationTime,
    );
    expect(full.status === "FULL_SUPPORT" || full.status === "BOUNDARY_CONDITIONED").toBe(
      true,
    );
    expect(boundary.status).toBe("BOUNDARY_CONDITIONED");
    expect(ood.status).toBe("OUT_OF_DOMAIN");
    expect(column.status).toBe("COLUMN_UNAVAILABLE");
    const boundaryView = createExploreHistoricalAnalysisTiltingView(
      boundary,
      NEAR_SURFACE,
      undefined,
    );
    const oodView = createExploreHistoricalAnalysisTiltingView(
      ood,
      OOD,
      undefined,
    );
    const columnView = createExploreHistoricalAnalysisTiltingView(
      column,
      INTERIOR,
      undefined,
    );
    expect(boundaryView.verificationModel.kind).toBe("SUPPORTED");
    if (boundaryView.verificationModel.kind === "SUPPORTED") {
      expect(boundaryView.verificationModel.support).toBe("BOUNDARY_CONDITIONED");
    }
    expect(oodView.glyphModel.kind).toBe("UNSUPPORTED");
    expect(oodView.verificationModel.kind).toBe("UNSUPPORTED");
    if (oodView.verificationModel.kind === "UNSUPPORTED") {
      expect(oodView.verificationModel.status).toBe("OUT_OF_DOMAIN");
      expect(oodView.verificationModel).not.toHaveProperty("tiltingTendency");
    }
    expect(columnView.verificationModel.kind).toBe("UNSUPPORTED");
    if (columnView.verificationModel.kind === "UNSUPPORTED") {
      expect(columnView.verificationModel.status).toBe("COLUMN_UNAVAILABLE");
    }
    const html = renderToStaticMarkup(
      <TrajectoryTiltingVerificationPanel model={boundaryView.verificationModel} />,
    );
    expect(html).toContain("BOUNDARY_CONDITIONED");
    expect(html).toContain("not FULL_SUPPORT");
  });

  it("Q–U preserve alignment defined / degenerate / orthogonal T1=0", () => {
    const defined = createExploreHistoricalAnalysisTiltingView(
      constructedExplanation({
        alignment: { state: "ALIGNMENT_DEFINED", cosTheta: 0, theta: Math.PI / 2 },
        tiltingTendency: 0,
      }),
      INTERIOR,
      undefined,
    );
    expect(defined.glyphModel.kind).toBe("SUPPORTED");
    if (defined.glyphModel.kind === "SUPPORTED") {
      expect(defined.glyphModel.alignment.state).toBe("ALIGNMENT_DEFINED");
      if (defined.glyphModel.alignment.state === "ALIGNMENT_DEFINED") {
        expect(defined.glyphModel.alignment.theta).toBe(Math.PI / 2);
      }
    }
    expect(defined.whatIfModel.kind).toBe("AVAILABLE");

    for (const state of [
      "GRADIENT_DEGENERATE",
      "OMEGA_DEGENERATE",
      "BOTH_DEGENERATE",
    ] as const) {
      const view = createExploreHistoricalAnalysisTiltingView(
        constructedExplanation({
          alignment: { state },
          omegaHMagnitude: state === "GRADIENT_DEGENERATE" ? 0.02 : 0,
          gradientMagnitude: state === "OMEGA_DEGENERATE" ? 0.04 : 0,
        }),
        INTERIOR,
        undefined,
      );
      expect(view.glyphModel.kind).toBe("SUPPORTED");
      if (view.glyphModel.kind === "SUPPORTED") {
        expect(view.glyphModel.alignment.state).toBe(state);
      }
      expect(view.whatIfModel.kind).toBe("UNAVAILABLE");
      if (view.whatIfModel.kind === "UNAVAILABLE") {
        expect(view.whatIfModel.reason).toBe(state);
      }
    }
  });

  it("V tiny nonzero survives the verification formatter", () => {
    const view = createExploreHistoricalAnalysisTiltingView(
      constructedExplanation({ tiltingTendency: 1e-12 }),
      INTERIOR,
      undefined,
    );
    expect(view.verificationModel.kind).toBe("SUPPORTED");
    if (view.verificationModel.kind !== "SUPPORTED") {
      return;
    }
    expect(view.verificationModel.tiltingTendency).toBe(1e-12);
    expect(formatVerificationScientific(1e-12)).not.toBe("0");
    expect(formatVerificationScientific(0)).toBe("0");
  });

  it("W–AA what-if copies actual T1, follows Slice F exact semantics, and disables when degenerate", () => {
    const explanation = constructedExplanation({
      tiltingTendency: 0.0008,
      omegaHMagnitude: 0.02,
      gradientMagnitude: 0.04,
      alignment: { state: "ALIGNMENT_DEFINED", cosTheta: 1, theta: 0 },
    });
    const actual = createExploreHistoricalAnalysisTiltingView(
      explanation,
      INTERIOR,
      0,
    );
    expect(actual.whatIfModel.kind).toBe("AVAILABLE");
    if (actual.whatIfModel.kind !== "AVAILABLE") {
      return;
    }
    expect(actual.whatIfModel.actualTiltingTendency).toBe(0.0008);
    expect(actual.whatIfModel.whatIfTiltingTendency).toBe(
      counterfactualTiltingTendency(0.02, 0.04, 0),
    );

    const orthogonal = createTrajectoryTiltingWhatIfModel(
      explanation,
      Math.PI / 2,
      INTERIOR.position,
    );
    expect(orthogonal.kind).toBe("AVAILABLE");
    if (orthogonal.kind === "AVAILABLE") {
      expect(orthogonal.whatIfTiltingTendency).toBe(0);
      expect(Object.is(orthogonal.whatIfTiltingTendency, -0)).toBe(false);
    }

    const opposed = createTrajectoryTiltingWhatIfModel(explanation, Math.PI);
    expect(opposed.kind).toBe("AVAILABLE");
    if (opposed.kind === "AVAILABLE") {
      expect(opposed.whatIfTiltingTendency).toBeLessThan(0);
    }

    const degenerate = createExploreHistoricalAnalysisTiltingView(
      constructedExplanation({
        alignment: { state: "OMEGA_DEGENERATE" },
        omegaHMagnitude: 0,
      }),
      INTERIOR,
      0.3,
    );
    expect(degenerate.whatIfModel.kind).toBe("UNAVAILABLE");
  });

  it("AB–AC what-if does not mutate laboratory, Simulation, or Source advection", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    lab.session.releasePoint({ x: -2000, y: 2000, z: 0 });
    const before = {
      time: lab.simulation.clock.time,
      position: { ...lab.simulation.particles[0]!.position },
      column: lab.analysisColumn,
      sourceProfile: lab.tiltingTendency.profile,
    };
    const explanation = resolveExploreHistoricalAnalysisTiltingExplanation(
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
      lab.pathHistory.samplesFor(0)[0]!.position,
      lab.pathHistory.samplesFor(0)[0]!.simulationTime,
    );
    createExploreHistoricalAnalysisTiltingView(
      explanation,
      lab.pathHistory.samplesFor(0)[0]!,
      Math.PI / 3,
    );
    expect(lab.simulation.clock.time).toBe(before.time);
    expect(lab.simulation.particles[0]!.position).toEqual(before.position);
    expect(lab.analysisColumn).toBe(before.column);
    expect(lab.tiltingTendency.profile).toBe(before.sourceProfile);
    expect(simulationSrc).not.toMatch(/createTrajectoryTiltingWhatIfModel/);
    expect(compositeSrc).not.toMatch(/createTrajectoryTiltingWhatIfModel/);
  });

  it("AD–AF environment switch and history revision re-resolve or drop context", () => {
    const goshen = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const prospect = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    );
    const goshenView = createExploreHistoricalAnalysisTiltingView(
      resolveExploreHistoricalAnalysisTiltingExplanation(
        goshen.analysisColumn,
        goshen.tiltingTendency.updraft,
        INTERIOR.position,
        INTERIOR.simulationTime,
      ),
      INTERIOR,
      undefined,
    );
    const prospectView = createExploreHistoricalAnalysisTiltingView(
      resolveExploreHistoricalAnalysisTiltingExplanation(
        prospect.analysisColumn,
        prospect.tiltingTendency.updraft,
        INTERIOR.position,
        INTERIOR.simulationTime,
      ),
      INTERIOR,
      undefined,
    );
    expect(goshenView.verificationModel.kind).toBe("SUPPORTED");
    expect(prospectView.verificationModel.kind).toBe("SUPPORTED");
    if (
      goshenView.verificationModel.kind === "SUPPORTED" &&
      prospectView.verificationModel.kind === "SUPPORTED"
    ) {
      expect(goshenView.verificationModel.provenance.sourceIdentity).not.toBe(
        prospectView.verificationModel.provenance.sourceIdentity,
      );
    }

    const mooreView = createExploreHistoricalAnalysisTiltingView(
      resolveExploreHistoricalAnalysisTiltingExplanation(
        null,
        goshen.tiltingTendency.updraft,
        INTERIOR.position,
        INTERIOR.simulationTime,
      ),
      INTERIOR,
      undefined,
    );
    expect(mooreView.glyphModel.kind).toBe("UNSUPPORTED");
    expect(mooreView.whatIfModel.kind).toBe("UNAVAILABLE");

    goshen.session.releasePoint({ x: -2000, y: 2000, z: 0 });
    const probe = { tracerId: goshen.simulation.particles[0]!.tracerId, historyIndex: 0 };
    expect(
      resolveHistoricalPathSample(
        goshen.simulation.particles,
        goshen.pathHistory,
        probe,
      ),
    ).toBeDefined();
    goshen.session.reset();
    const afterReset = resolveHistoricalPathSample(
      goshen.simulation.particles,
      goshen.pathHistory,
      probe,
    );
    expect(afterReset?.historyIndex).toBe(0);
    goshen.session.clear();
    expect(
      resolveHistoricalPathSample(
        goshen.simulation.particles,
        goshen.pathHistory,
        probe,
      ),
    ).toBeUndefined();
  });
});

describe("I3 wiring: glyphs, picking, Source diagnostics, no Slice G", () => {
  it("AG–AI glyphs dispose/hide, raycast disabled, picking unchanged", () => {
    const glyph = createTrajectoryTiltingGlyph();
    const whatIf = createTrajectoryTiltingWhatIfGlyph();
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(glyph, true)).toEqual([]);
    expect(raycaster.intersectObject(whatIf, true)).toEqual([]);
    disposeTrajectoryTiltingGlyph(glyph);
    disposeTrajectoryTiltingWhatIfGlyph(whatIf);
    expect(appSrc).toMatch(/kind === "SUPPORTED"/);
    expect(appSrc).toMatch(/kind === "AVAILABLE"/);
    expect(tracerSceneSrc).toMatch(/syncAnalysisTiltingGlyph/);
    expect(tracerSceneSrc).toMatch(/disposeTrajectoryTiltingGlyph/);
    expect(tracerSceneSrc).toMatch(/disposeTrajectoryTiltingWhatIfGlyph/);
    expect(pickSrc).not.toMatch(/trajectoryTiltingGlyph/);
    expect(pickSrc).not.toMatch(/analysisTiltingGlyph/);
    expect(viewportSrc).toMatch(/pickPathHistorySampleAtClientPoint/);
  });

  it("AJ Point diagnostics is not a public T1 readout; Source T1 remains internal", () => {
    expect(appSrc).toMatch(/PointDiagnosticsPanel/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/T_tilt,y/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(
      /Vertical-vorticity tilting tendency/,
    );
    expect(pointDiagnosticsSrc).toMatch(/tiltingTendency\.sample/);
    expect(pointDiagnosticsSrc).not.toMatch(/queryAnalysisTiltingExplanationAt/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(
      /TrajectoryTiltingVerificationPanel/,
    );
  });

  it("AK React UI calls approved factories and does not reconstruct physics", () => {
    expect(appSrc).toMatch(/resolveExploreHistoricalAnalysisTiltingExplanation/);
    expect(appSrc).toMatch(/createExploreHistoricalAnalysisTiltingView/);
    expect(appSrc).toMatch(/TrajectoryTiltingVerificationPanel/);
    expect(appSrc).toMatch(/TrajectoryTiltingWhatIfPanel/);
    expect(appSrc).not.toMatch(/queryAnalysisTiltingExplanationAt/);
    expect(appSrc).not.toMatch(/worldHorizontalVorticityFromAtmospheric/);
    expect(appSrc).not.toMatch(/horizontalGradientOfVerticalVelocity/);
    expect(appSrc).not.toMatch(/Math\.acos/);
    expect(appSrc).not.toMatch(/omegaX \* .*dVyDx/);
    expect(viewportSrc).not.toMatch(/queryAnalysisTilting/);
    expect(tracerSceneSrc).not.toMatch(/queryAnalysisTilting/);
    expect(createExploreLabSrc).not.toMatch(
      /queryAnalysisTiltingExplanationAt/,
    );
    expect(createGuidedLab(GuidedExperimentId.InflowToUpperOutflow).kind).toBe("guided");
  });

  it("does not wire Slice G omega_y,current comparison", () => {
    expect(resolverSrc).not.toMatch(/omega_y,current|omegaYCurrent|ω_y,current/);
    expect(appSrc).not.toMatch(/omega_y,current comparison/);
    expect(appSrc).not.toMatch(/lead\/lag/);
    expect(appSrc).not.toMatch(/integrated T1|I_tilt/);
  });
});
