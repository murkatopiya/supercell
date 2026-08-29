import { T1_COLOR_SCALE_V1_SATURATION } from "../../data/escHrTimeAnalysis/t1ColorScaleV1.js";
import { ANALYSIS_T1_VALUE_APPEARANCE_V1 } from "../../rendering/analysisT1ValueAppearanceV1.js";
import { cssSrgbFromLinearRgb } from "../../rendering/vertexColorSpace.js";
import { formatPointDiagnosticScientific } from "./formatPointDiagnosticDisplay.js";
import { VERIFICATION_T1_UNITS } from "./formatTrajectoryTiltingVerification.js";

/**
 * Analysis T1 trajectory color legend V1.
 *
 * Numeric domain is T1_COLOR_SCALE_V1 display saturation.
 * Colors are ANALYSIS_T1_VALUE_APPEARANCE_V1 samples, converted to
 * CSS sRGB so they match trail vertex colors after renderer encode.
 *
 * Endpoints are display saturation, not physical min/max.
 * Value only: not FULL / BOUNDARY / OOD. OOD is not zero.
 */
export const ANALYSIS_T1_COLOR_LEGEND_SIGNED_UNITS_V1 = [
  -1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1,
] as const;

export interface AnalysisT1ColorLegendStopV1 {
  readonly signedUnit: number;
  readonly cssColor: string;
  readonly positionPercent: number;
}

export function analysisT1ColorLegendStopV1(
  signedUnit: number,
): AnalysisT1ColorLegendStopV1 {
  return {
    signedUnit,
    cssColor: cssSrgbFromLinearRgb(
      ANALYSIS_T1_VALUE_APPEARANCE_V1.linearRgbFromSignedUnit(signedUnit),
    ),
    positionPercent: ((signedUnit + 1) / 2) * 100,
  };
}

export const ANALYSIS_T1_COLOR_LEGEND_STOPS_V1: readonly AnalysisT1ColorLegendStopV1[] =
  ANALYSIS_T1_COLOR_LEGEND_SIGNED_UNITS_V1.map(analysisT1ColorLegendStopV1);

export const ANALYSIS_T1_COLOR_LEGEND_GRADIENT_CSS_V1 = `linear-gradient(to right, ${ANALYSIS_T1_COLOR_LEGEND_STOPS_V1.map(
  (stop) => `${stop.cssColor} ${stop.positionPercent}%`,
).join(", ")})`;

export const ANALYSIS_T1_COLOR_LEGEND_V1 = {
  title: "Analysis T1",
  supportingCopy: "Fixed symmetric scale",
  negativeLabel: formatPointDiagnosticScientific(-T1_COLOR_SCALE_V1_SATURATION),
  zeroLabel: "0",
  positiveLabel: `+${formatPointDiagnosticScientific(T1_COLOR_SCALE_V1_SATURATION)}`,
  units: VERIFICATION_T1_UNITS,
  gradientCss: ANALYSIS_T1_COLOR_LEGEND_GRADIENT_CSS_V1,
} as const;
