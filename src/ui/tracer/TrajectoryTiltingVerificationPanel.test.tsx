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
import { createTrajectoryTiltingVerificationModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingVerification.js";
import type { EscHrTimeAnalysisProvenance } from "../../data/escHrTimeAnalysis/types.js";
import { formatVerificationScientific } from "./formatTrajectoryTiltingVerification.js";
import { TrajectoryTiltingVerificationPanel } from "./TrajectoryTiltingVerificationPanel.js";
import panelSrc from "./TrajectoryTiltingVerificationPanel.tsx?raw";
import appSrc from "../../app/App.tsx?raw";
import createExploreLabSrc from "../../app/createExploreLab.ts?raw";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "verify-panel-test",
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
    status?: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
    tiltingTendency?: number;
    omegaHMagnitude?: number;
    gradientMagnitude?: number;
    alignment?: AnalysisTiltingAlignment;
    segment?: { hLo: number; hHi: number };
  } = {},
): AnalysisTiltingExplanationResult {
  return {
    status: overrides.status ?? "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: overrides.segment ?? { hLo: 10, hHi: 20 },
    tiltingTendency: overrides.tiltingTendency ?? 0.0005,
    worldHorizontalVorticity: { omegaX: 0.02, omegaZ: 0 },
    updraftHorizontalGradient: { dVyDx: 0, dVyDz: 0.04 },
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

function renderModel(
  explanation: AnalysisTiltingExplanationResult,
): string {
  return renderToStaticMarkup(
    <TrajectoryTiltingVerificationPanel
      model={createTrajectoryTiltingVerificationModel(explanation)}
    />,
  );
}

function quantityBlocks(html: string): string[] {
  return html.split('class="trajectory-tilting-verify__quantity"').slice(1);
}

describe("TrajectoryTiltingVerificationPanel", () => {
  it("T FULL shows required values", () => {
    const html = renderModel(
      supportedExplanation({
        tiltingTendency: 0.0005,
        omegaHMagnitude: 0.02,
        gradientMagnitude: 0.04,
        alignment: {
          state: "ALIGNMENT_DEFINED",
          cosTheta: 0.5,
          theta: Math.PI / 3,
        },
      }),
    );
    expect(html).toContain("Analysis vertical tilting diagnostic T1");
    expect(html).toContain("T1");
    expect(html).toContain("s⁻²");
    expect(html).toContain(formatVerificationScientific(0.0005));
    expect(html).toContain("|ω_h,env|");
    expect(html).toContain("|∇_h Vy,updraft|");
    expect(html).toContain("s⁻¹");
    expect(html).toContain("FULL_SUPPORT");
    expect(html).toContain("native-containing-segment");
    expect(html).toContain("T1 = ω_h,env · ∇_h Vy,updraft");
    expect(html).toContain("T1 = |ω_h,env| |∇_h Vy,updraft| cosθ");
    expect(html).toContain("verify-panel-test");
    expect(quantityBlocks(html).length).toBeGreaterThanOrEqual(3);
  });

  it("U BOUNDARY is visibly distinguishable from FULL", () => {
    const html = renderModel(
      supportedExplanation({ status: "BOUNDARY_CONDITIONED" }),
    );
    expect(html).toContain("BOUNDARY_CONDITIONED");
    expect(html).toContain("trajectory-tilting-verify__status--boundary");
    expect(html).not.toContain(">FULL_SUPPORT<");
  });

  it("V OOD does not show zero numeric rows", () => {
    const html = renderModel({
      status: "OUT_OF_DOMAIN",
      representation: ANALYSIS_QUERY_REPRESENTATION,
      provenance: STUB_PROVENANCE,
    });
    expect(html).toContain("OUT_OF_DOMAIN");
    expect(html).toContain("No Analysis T1");
    expect(quantityBlocks(html)).toHaveLength(0);
    expect(html).not.toContain("s⁻²");
    expect(html).not.toContain("|ω_h,env|");
    expect(html).not.toContain("θ");
  });

  it("W COLUMN does not show Source fallback", () => {
    const html = renderModel({ status: "COLUMN_UNAVAILABLE" });
    expect(html).toContain("COLUMN_UNAVAILABLE");
    expect(html).toContain("Source T1 is not a fallback");
    expect(html).not.toContain("DiagnosticTiltingTendency");
    expect(quantityBlocks(html)).toHaveLength(0);
    expect(html).not.toContain("s⁻²");
  });

  it("X degenerate states do not show fake θ", () => {
    const html = renderModel(
      supportedExplanation({
        tiltingTendency: 0,
        omegaHMagnitude: 0.05,
        gradientMagnitude: 0,
        alignment: { state: "GRADIENT_DEGENERATE" },
      }),
    );
    expect(html).toContain(
      "Alignment angle undefined: prescribed-updraft gradient magnitude is zero.",
    );
    expect(html).not.toContain("θ (display degrees");
    expect(html).not.toContain(">90<");
    expect(html).not.toContain("cosθ");
    expect(html).toContain(formatVerificationScientific(0));
    expect(html).not.toContain("T1 = |ω_h,env| |∇_h Vy,updraft| cosθ");
  });

  it("Y orthogonal state shows defined θ, not degeneracy", () => {
    const html = renderModel(
      supportedExplanation({
        tiltingTendency: 0,
        omegaHMagnitude: 0.03,
        gradientMagnitude: 0.04,
        alignment: {
          state: "ALIGNMENT_DEFINED",
          cosTheta: 0,
          theta: Math.PI / 2,
        },
      }),
    );
    expect(html).toContain("90");
    expect(html).toContain("°");
    expect(html).toContain("cosθ");
    expect(html).not.toContain("Alignment angle undefined");
    expect(html).toContain(formatVerificationScientific(0.03));
    expect(html).toContain(formatVerificationScientific(0.04));
  });

  it("Z component does not query Analysis physics", () => {
    expect(panelSrc).not.toMatch(/queryAnalysisTilting/);
    expect(panelSrc).not.toMatch(/queryAnalysisNativeSegmentVorticityAt/);
    expect(panelSrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(appSrc).not.toMatch(/TrajectoryTiltingVerificationPanel/);
    expect(appSrc).not.toMatch(/createTrajectoryTiltingVerificationModel/);
    expect(createExploreLabSrc).not.toMatch(/TrajectoryTiltingVerificationPanel/);
  });

  it("AA component is read-only", () => {
    const html = renderModel(supportedExplanation());
    expect(html).not.toMatch(/<input/);
    expect(html).not.toMatch(/<textarea/);
    expect(html).not.toMatch(/<select/);
    expect(html).not.toMatch(/type="range"/);
    expect(html).not.toMatch(/contenteditable/i);
  });

  it("AB has no ω_y / current / what-if controls", () => {
    const html = renderModel(supportedExplanation());
    expect(html).not.toContain("ω_y,current");
    expect(html).not.toContain("what-if");
    expect(html).not.toContain("What-if");
    expect(panelSrc).not.toMatch(/parcel/);
    expect(panelSrc).not.toMatch(/spin-up|spin-down/);
    expect(panelSrc).not.toMatch(/gained rotation|generated rotation/);
    expect(panelSrc).not.toMatch(/Dω_y|Domega/);
    expect(panelSrc).not.toContain("slider");
  });
});
