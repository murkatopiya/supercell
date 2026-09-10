import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ANALYSIS_QUERY_REPRESENTATION,
  NATIVE_CONTAINING_SEGMENT_METHOD,
} from "../../data/escHrTimeAnalysis/analysisQuery.js";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
  type AnalysisTiltingAlignment,
  type AnalysisTiltingExplanationResult,
} from "../../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { createTrajectoryTiltingWhatIfModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import type { EscHrTimeAnalysisProvenance } from "../../data/escHrTimeAnalysis/types.js";
import { formatVerificationScientific } from "./formatTrajectoryTiltingVerification.js";
import {
  TrajectoryTiltingWhatIfPanel,
  WHAT_IF_THETA_MAX_DEGREES,
  WHAT_IF_THETA_MIN_DEGREES,
} from "./TrajectoryTiltingWhatIfPanel.js";
import panelSrc from "./TrajectoryTiltingWhatIfPanel.tsx?raw";
import appSrc from "../../app/App.tsx?raw";
import createExploreLabSrc from "../../app/createExploreLab.ts?raw";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "whatif-panel-test",
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

function supportedExplanation(
  overrides: {
    alignment?: AnalysisTiltingAlignment;
    tiltingTendency?: number;
    omegaHMagnitude?: number;
    gradientMagnitude?: number;
    omegaX?: number;
    omegaZ?: number;
    dVyDx?: number;
    dVyDz?: number;
  } = {},
): AnalysisTiltingExplanationResult {
  return {
    status: "FULL_SUPPORT",
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
      cosTheta: 0,
      theta: Math.PI / 2,
    },
    provenance: STUB_PROVENANCE,
  };
}

function renderResult(
  explanation: AnalysisTiltingExplanationResult,
  thetaWhatIf: number,
): string {
  return renderToStaticMarkup(
    <TrajectoryTiltingWhatIfPanel
      result={createTrajectoryTiltingWhatIfModel(explanation, thetaWhatIf)}
    />,
  );
}

describe("TrajectoryTiltingWhatIfPanel", () => {
  it("U slider range is 0..180°", () => {
    const html = renderResult(supportedExplanation(), Math.PI / 2);
    expect(html).toMatch(/type="range"/);
    expect(html).toContain(`min="${WHAT_IF_THETA_MIN_DEGREES}"`);
    expect(html).toContain(`max="${WHAT_IF_THETA_MAX_DEGREES}"`);
    expect(WHAT_IF_THETA_MIN_DEGREES).toBe(0);
    expect(WHAT_IF_THETA_MAX_DEGREES).toBe(180);
  });

  it("V actual theta and T1 remain visible", () => {
    const html = renderResult(supportedExplanation({ tiltingTendency: 0.0008 }), 0);
    expect(html).toContain("Actual T1");
    expect(html).toContain(formatVerificationScientific(0.0008));
    expect(html).toContain("Actual θ");
    expect(html).toContain("90");
  });

  it("W what-if theta and T1 are visibly distinct", () => {
    const html = renderResult(supportedExplanation(), 0);
    expect(html).toContain("Hypothetical T1");
    expect(html).toContain("What-if θ");
    expect(html).toContain("trajectory-tilting-whatif__quantity--hypothetical");
    expect(html).toContain(formatVerificationScientific(0.02 * 0.04));
  });

  it("X reset control restores actual angle without laboratory verbs", () => {
    const html = renderResult(supportedExplanation(), 0);
    expect(html).toContain("Reset to actual angle");
    expect(html).not.toContain("Reset simulation");
    expect(html).not.toContain("Reset tracer");
  });

  it("Y degenerate state disables control with reason", () => {
    const html = renderResult(
      supportedExplanation({
        alignment: { state: "GRADIENT_DEGENERATE" },
        gradientMagnitude: 0,
        dVyDx: 0,
        dVyDz: 0,
      }),
      0,
    );
    expect(html).not.toMatch(/type="range"/);
    expect(html).toContain("GRADIENT_DEGENERATE");
    expect(html).toContain("Alignment angle undefined");
    expect(html).toContain("Laboratory state unchanged");
  });

  it("Z OOD and COLUMN have no control and no Source fallback numbers", () => {
    const ood = renderToStaticMarkup(
      <TrajectoryTiltingWhatIfPanel
        result={createTrajectoryTiltingWhatIfModel(
          {
            status: "OUT_OF_DOMAIN",
            representation: ANALYSIS_QUERY_REPRESENTATION,
            provenance: STUB_PROVENANCE,
          },
          1,
        )}
      />,
    );
    const column = renderToStaticMarkup(
      <TrajectoryTiltingWhatIfPanel
        result={createTrajectoryTiltingWhatIfModel(
          { status: "COLUMN_UNAVAILABLE" },
          1,
        )}
      />,
    );
    expect(ood).not.toMatch(/type="range"/);
    expect(column).not.toMatch(/type="range"/);
    expect(column).toContain("Source T1 is not a fallback");
    expect(ood).not.toContain("Hypothetical T1");
    expect(column).not.toContain("Hypothetical T1");
  });

  it("AA slider is θ-only; source converts degrees to radians and does not edit magnitudes", () => {
    expect(panelSrc).toMatch(/Number\(event\.target\.value\) \* Math\.PI\) \/ 180/);
    expect(panelSrc).not.toMatch(/omegaHMagnitude\s*=/);
    expect(panelSrc).not.toMatch(/gradientMagnitude\s*=/);
    expect(panelSrc).not.toMatch(/peakVerticalVelocity/);
  });

  it("AB has no magnitude controls", () => {
    const html = renderResult(supportedExplanation(), 1);
    expect(html).not.toContain("Edit magnitude");
    expect(html).not.toMatch(/name="omegaHMagnitude"/);
    expect(html).not.toMatch(/name="gradientMagnitude"/);
  });

  it("AC AD AE AF copy, no Source fallback, no ω_y, no Analysis query", () => {
    const html = renderResult(supportedExplanation(), 1);
    expect(html).toContain("Laboratory state unchanged");
    expect(html).toContain("What-if geometry");
    expect(html).toContain(
      "Hypothetical T1 for the same vector magnitudes at a different alignment angle.",
    );
    expect(html).not.toContain("ω_y,current");
    expect(html).not.toContain("spin-up");
    expect(panelSrc).not.toMatch(/queryAnalysisTilting/);
    expect(panelSrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(appSrc).toMatch(/TrajectoryTiltingWhatIfPanel/);
    expect(createExploreLabSrc).not.toMatch(/TrajectoryTiltingWhatIfPanel/);
  });
});
