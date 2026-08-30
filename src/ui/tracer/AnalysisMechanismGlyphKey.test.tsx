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
} from "../../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { createTrajectoryTiltingGlyphModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import { createTrajectoryTiltingWhatIfModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import type { AnalysisTiltingExplanationResult } from "../../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import type { EscHrTimeAnalysisProvenance } from "../../data/escHrTimeAnalysis/types.js";
import {
  ANALYSIS_T1_GLYPH_APPEARANCE_V1,
  ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1,
} from "../../rendering/analysisT1GlyphAppearanceV1.js";
import { AnalysisMechanismGlyphKey } from "./AnalysisMechanismGlyphKey.js";
import {
  ANALYSIS_MECHANISM_GLYPH_KEY_V1,
  cssHexFromGlyphColor,
  shouldShowAnalysisMechanismGlyphKey,
  shouldShowHypotheticalGlyphKeyRow,
} from "./analysisMechanismGlyphKeyV1.js";
import keySrc from "./AnalysisMechanismGlyphKey.tsx?raw";
import keyV1Src from "./analysisMechanismGlyphKeyV1.ts?raw";
import viewportSrc from "./TracerViewport.tsx?raw";
import appSrc from "../../app/App.tsx?raw";
import glyphSrc from "../../rendering/trajectoryTiltingGlyph.ts?raw";
import whatIfGlyphSrc from "../../rendering/trajectoryTiltingWhatIfGlyph.ts?raw";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "glyph-key-test",
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

const ANCHOR = { x: 10, y: 20, z: 30 };

function supportedExplanation(): AnalysisTiltingExplanationResult {
  return {
    status: "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency: 0.0008,
    worldHorizontalVorticity: { omegaX: 0.02, omegaZ: 0 },
    updraftHorizontalGradient: { dVyDx: 0, dVyDz: 0.04 },
    omegaHMagnitude: 0.02,
    gradientMagnitude: 0.04,
    alignment: {
      state: "ALIGNMENT_DEFINED",
      cosTheta: 0,
      theta: Math.PI / 2,
    },
    provenance: STUB_PROVENANCE,
  };
}

function degenerateExplanation(): AnalysisTiltingExplanationResult {
  return {
    status: "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency: 0,
    worldHorizontalVorticity: { omegaX: 0.02, omegaZ: 0 },
    updraftHorizontalGradient: { dVyDx: 0, dVyDz: 0 },
    omegaHMagnitude: 0.02,
    gradientMagnitude: 0,
    alignment: { state: "GRADIENT_DEGENERATE" },
    provenance: STUB_PROVENANCE,
  };
}

describe("ANALYSIS_MECHANISM_GLYPH_KEY_V1", () => {
  it("reuses glyph appearance hex and dash grammar, not independent colors", () => {
    expect(ANALYSIS_MECHANISM_GLYPH_KEY_V1.omegaColorCss).toBe(
      cssHexFromGlyphColor(ANALYSIS_T1_GLYPH_APPEARANCE_V1.omegaColor),
    );
    expect(ANALYSIS_MECHANISM_GLYPH_KEY_V1.actualGradientColorCss).toBe(
      cssHexFromGlyphColor(ANALYSIS_T1_GLYPH_APPEARANCE_V1.gradientColor),
    );
    expect(ANALYSIS_MECHANISM_GLYPH_KEY_V1.hypotheticalGradientColorCss).toBe(
      cssHexFromGlyphColor(
        ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.hypotheticalGradientColor,
      ),
    );
    expect(ANALYSIS_MECHANISM_GLYPH_KEY_V1.dashSize).toBe(
      ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.dashSize,
    );
    expect(ANALYSIS_MECHANISM_GLYPH_KEY_V1.gapSize).toBe(
      ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.gapSize,
    );
    expect(ANALYSIS_MECHANISM_GLYPH_KEY_V1.hypotheticalOpacity).toBe(
      ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1.opacity,
    );
    expect(keyV1Src).toMatch(/ANALYSIS_T1_GLYPH_APPEARANCE_V1/);
    expect(keyV1Src).toMatch(/ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1/);
    expect(keySrc).not.toMatch(/0x00aacc|0xccaa00|0xf2c14e|#00aacc|#ccaa00/);
  });

  it("does not name colors in user-visible copy", () => {
    expect(ANALYSIS_MECHANISM_GLYPH_KEY_V1.omegaLabel).toBe(
      "Environmental ωₕ · fixed",
    );
    expect(ANALYSIS_MECHANISM_GLYPH_KEY_V1.actualGradientLabel).toBe(
      "∇ₕVᵧ · actual",
    );
    expect(ANALYSIS_MECHANISM_GLYPH_KEY_V1.hypotheticalGradientLabel).toBe(
      "∇ₕVᵧ · hypothetical",
    );
    const copy = [
      ANALYSIS_MECHANISM_GLYPH_KEY_V1.omegaLabel,
      ANALYSIS_MECHANISM_GLYPH_KEY_V1.actualGradientLabel,
      ANALYSIS_MECHANISM_GLYPH_KEY_V1.hypotheticalGradientLabel,
      keySrc,
    ].join("\n");
    expect(copy).not.toMatch(/cyan|yellow|teal|gold|blue/i);
    expect(copy).not.toMatch(/parcel vorticity|generated vorticity|force|acceleration/i);
  });
});

describe("mechanism glyph key visibility", () => {
  it("appears only for a supported mechanism glyph", () => {
    const supported = createTrajectoryTiltingGlyphModel(
      ANCHOR,
      supportedExplanation(),
    );
    const ood = createTrajectoryTiltingGlyphModel(ANCHOR, {
      status: "OUT_OF_DOMAIN",
      representation: ANALYSIS_QUERY_REPRESENTATION,
      provenance: STUB_PROVENANCE,
    });
    const missing = createTrajectoryTiltingGlyphModel(ANCHOR, {
      status: "COLUMN_UNAVAILABLE",
    });
    expect(shouldShowAnalysisMechanismGlyphKey(supported)).toBe(true);
    expect(shouldShowAnalysisMechanismGlyphKey(ood)).toBe(false);
    expect(shouldShowAnalysisMechanismGlyphKey(missing)).toBe(false);
    expect(shouldShowAnalysisMechanismGlyphKey(null)).toBe(false);
    expect(shouldShowAnalysisMechanismGlyphKey(undefined)).toBe(false);
  });

  it("includes the hypothetical row only when the what-if glyph is drawable", () => {
    const available = createTrajectoryTiltingWhatIfModel(
      supportedExplanation(),
      Math.PI / 2,
      ANCHOR,
    );
    const unavailable = createTrajectoryTiltingWhatIfModel(
      { status: "COLUMN_UNAVAILABLE" },
      0,
      ANCHOR,
    );
    const degenerate = createTrajectoryTiltingWhatIfModel(
      degenerateExplanation(),
      0,
      ANCHOR,
    );
    expect(shouldShowHypotheticalGlyphKeyRow(available)).toBe(true);
    expect(shouldShowHypotheticalGlyphKeyRow(unavailable)).toBe(false);
    expect(shouldShowHypotheticalGlyphKeyRow(degenerate)).toBe(false);
    expect(shouldShowHypotheticalGlyphKeyRow(null)).toBe(false);
  });
});

describe("AnalysisMechanismGlyphKey", () => {
  it("renders three semantic labels and solid vs dashed samples when what-if is available", () => {
    const whatIf = createTrajectoryTiltingWhatIfModel(
      supportedExplanation(),
      Math.PI / 2,
      ANCHOR,
    );
    const html = renderToStaticMarkup(
      <AnalysisMechanismGlyphKey whatIfModel={whatIf} />,
    );
    expect(html).toContain("Environmental ωₕ · fixed");
    expect(html).toContain("∇ₕVᵧ · actual");
    expect(html).toContain("∇ₕVᵧ · hypothetical");
    expect(html).toContain(ANALYSIS_MECHANISM_GLYPH_KEY_V1.omegaColorCss);
    expect(html).toContain(ANALYSIS_MECHANISM_GLYPH_KEY_V1.actualGradientColorCss);
    expect(html).toContain(
      ANALYSIS_MECHANISM_GLYPH_KEY_V1.hypotheticalGradientColorCss,
    );
    expect(html).toContain(
      `stroke-dasharray="${ANALYSIS_MECHANISM_GLYPH_KEY_V1.dashSize} ${ANALYSIS_MECHANISM_GLYPH_KEY_V1.gapSize}"`,
    );
    expect(html.match(/<line /g)?.length).toBe(3);
    expect(html.match(/stroke-dasharray=/g)?.length).toBe(1);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Mechanism glyph key");
  });

  it("omits the hypothetical row when the dashed glyph cannot appear", () => {
    const html = renderToStaticMarkup(
      <AnalysisMechanismGlyphKey
        whatIfModel={createTrajectoryTiltingWhatIfModel(
          { status: "OUT_OF_DOMAIN", representation: ANALYSIS_QUERY_REPRESENTATION, provenance: STUB_PROVENANCE },
          0,
          ANCHOR,
        )}
      />,
    );
    expect(html).toContain("Environmental ωₕ · fixed");
    expect(html).toContain("∇ₕVᵧ · actual");
    expect(html).not.toContain("∇ₕVᵧ · hypothetical");
    expect(html).not.toMatch(/stroke-dasharray=/);
  });

  it("is presentational and does not query Analysis or mutate glyph physics", () => {
    expect(keySrc).not.toMatch(/queryAnalysisTilting/);
    expect(keySrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(keySrc).not.toMatch(/createTrajectoryTiltingGlyph/);
    expect(keySrc).not.toMatch(/Goshen|Prospect|Dumas|Moore|Demo/);
    expect(glyphSrc).not.toMatch(/AnalysisMechanismGlyphKey/);
    expect(whatIfGlyphSrc).not.toMatch(/AnalysisMechanismGlyphKey/);
    expect(appSrc).not.toMatch(/AnalysisMechanismGlyphKey/);
  });

  it("mounts from the supported glyph model in the viewport, not environment names", () => {
    expect(viewportSrc).toMatch(/shouldShowAnalysisMechanismGlyphKey/);
    expect(viewportSrc).toMatch(/AnalysisMechanismGlyphKey/);
    expect(viewportSrc).toMatch(/tracer-viewport__scene-keys/);
    expect(viewportSrc).not.toMatch(/Goshen|Prospect|Dumas|Moore|Demo/);
    expect(viewportSrc).toMatch(
      /analysisColumn !== null \? <AnalysisT1ColorLegend \/>/,
    );
  });
});
