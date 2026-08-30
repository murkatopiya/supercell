import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createExploreLab } from "./createExploreLab.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import {
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_IDENTITIES,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
} from "../explore/exploreEnvironmentIdentity.js";
import { inspectPointDiagnosticsAt } from "../interaction/PointDiagnosticObservation.js";
import { PointDiagnosticsPanel } from "../ui/tracer/PointDiagnosticsPanel.js";
import { TrajectoryTiltingVerificationPanel } from "../ui/tracer/TrajectoryTiltingVerificationPanel.js";
import { TrajectoryTiltingWhatIfPanel } from "../ui/tracer/TrajectoryTiltingWhatIfPanel.js";
import {
  createExploreHistoricalAnalysisTiltingView,
  exploreAnalysisTiltingExplorerActive,
  resolveExploreHistoricalAnalysisTiltingExplanation,
} from "../explore/resolveExploreHistoricalAnalysisTilting.js";
import pointDiagnosticsPanelSrc from "../ui/tracer/PointDiagnosticsPanel.tsx?raw";
import diagnosticTiltingTendencySrc from "../physics/diagnostics/DiagnosticTiltingTendency.ts?raw";

const SAMPLE = { x: -2000, y: 2000, z: 0 };
const TIME = 0;

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

function pointHtml(
  lab: ReturnType<typeof createExploreLab>,
  mode: "current" | "historical" = "historical",
) {
  const observation = inspectPointDiagnosticsAt(1, SAMPLE, TIME, {
    tiltingTendency: lab.tiltingTendency,
    currentVerticalVorticity: lab.currentVerticalVorticity,
  });
  return {
    observation,
    html: renderToStaticMarkup(
      <PointDiagnosticsPanel observation={observation} mode={mode} />,
    ),
  };
}

describe("public T1 authority = Analysis T1", () => {
  it("does not render Source T_tilt,y in Point diagnostics for any environment", () => {
    for (const identity of EXPLORE_ENVIRONMENT_IDENTITIES) {
      const lab = createExploreLab(fakeSlots(), identity);
      const { observation, html } = pointHtml(lab);
      expect(observation.tiltingTendency).toBe(
        lab.tiltingTendency.sample(SAMPLE, TIME),
      );
      expect(observation.currentVerticalVorticity).toBe(
        lab.currentVerticalVorticity.sample(SAMPLE, TIME),
      );
      expect(html).toContain("ω_y,current");
      expect(html).not.toContain("T_tilt,y");
      expect(html).not.toContain("Vertical-vorticity tilting tendency");
      expect(html).not.toContain("s⁻²");
      expect(html).not.toContain("T1 does not generate");
    }
    expect(pointDiagnosticsPanelSrc).not.toMatch(/T_tilt,y/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(
      /Vertical-vorticity tilting tendency/,
    );
    expect(diagnosticTiltingTendencySrc).toMatch(/T_tilt,y = ω_x/);
  });

  it("keeps historical Point sampling copy without a public T1 number", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const { html } = pointHtml(lab, "historical");
    expect(html).toContain("HISTORICAL PATH SAMPLE");
    expect(html).toContain(
      "Sampled at a past recorded position/time from the laboratory field.",
    );
    expect(html).toContain("The tracer was not rewound.");
    expect(html).toContain("ω_y,current");
    expect(html).not.toContain("T_tilt,y");
  });

  it("Moore historical: Point has no numeric T1; Analysis remains COLUMN_UNAVAILABLE", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    const { html: point } = pointHtml(lab, "historical");
    const explanation = resolveExploreHistoricalAnalysisTiltingExplanation(
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
      SAMPLE,
      TIME,
    );
    expect(explanation.status).toBe("COLUMN_UNAVAILABLE");
    const view = createExploreHistoricalAnalysisTiltingView(explanation, {
      position: SAMPLE,
      simulationTime: TIME,
    }, undefined);
    const analysis = renderToStaticMarkup(
      <TrajectoryTiltingVerificationPanel model={view.verificationModel} />,
    );
    const whatIf = renderToStaticMarkup(
      <TrajectoryTiltingWhatIfPanel
        result={view.whatIfModel}
        onThetaWhatIfChange={() => {}}
        onReset={() => {}}
      />,
    );
    expect(point).not.toContain("T_tilt,y");
    expect(point).toContain("ω_y,current");
    expect(analysis).toContain("COLUMN_UNAVAILABLE");
    expect(analysis).toContain("No Analysis T1.");
    expect(analysis).toContain("Source T1 is not a fallback.");
    expect(whatIf).toContain("COLUMN_UNAVAILABLE");
    expect(whatIf).toContain("Source T1 is not a fallback.");
    expect(exploreAnalysisTiltingExplorerActive(
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
      true,
    )).toBe(true);
  });

  it("Goshen, Prospect Valley, and Dumas show public T1 only through Analysis verification", () => {
    const identities = [
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
      EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
    ] as const;
    for (const identity of identities) {
      const lab = createExploreLab(fakeSlots(), identity);
      const { observation, html: point } = pointHtml(lab, "historical");
      const explanation = resolveExploreHistoricalAnalysisTiltingExplanation(
        lab.analysisColumn,
        lab.tiltingTendency.updraft,
        SAMPLE,
        TIME,
      );
      expect(
        explanation.status === "FULL_SUPPORT" ||
          explanation.status === "BOUNDARY_CONDITIONED",
      ).toBe(true);
      if (
        explanation.status !== "FULL_SUPPORT" &&
        explanation.status !== "BOUNDARY_CONDITIONED"
      ) {
        throw new Error(`${identity}: expected supported Analysis T1`);
      }
      const view = createExploreHistoricalAnalysisTiltingView(explanation, {
        position: SAMPLE,
        simulationTime: TIME,
      }, undefined);
      const analysis = renderToStaticMarkup(
        <TrajectoryTiltingVerificationPanel model={view.verificationModel} />,
      );
      expect(point).not.toContain("T_tilt,y");
      expect(point).not.toContain("Vertical-vorticity tilting tendency");
      expect(analysis).toContain("Analysis vertical tilting diagnostic T1");
      expect(analysis).toContain("T1 = ω_h,env · ∇_h Vy,updraft");
      expect(analysis).not.toContain("COLUMN_UNAVAILABLE");
      expect(observation.tiltingTendency).not.toBe(explanation.tiltingTendency);
    }
  });

  it("does not introduce Demo Analysis T1 or a Source fallback", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    );
    const { html: point } = pointHtml(lab);
    expect(lab.analysisColumn).toBeNull();
    expect(
      exploreAnalysisTiltingExplorerActive(
        EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
        true,
      ),
    ).toBe(false);
    expect(point).not.toContain("T_tilt,y");
    expect(point).toContain("ω_y,current");
    expect(
      resolveExploreHistoricalAnalysisTiltingExplanation(
        lab.analysisColumn,
        lab.tiltingTendency.updraft,
        SAMPLE,
        TIME,
      ).status,
    ).toBe("COLUMN_UNAVAILABLE");
  });
});
