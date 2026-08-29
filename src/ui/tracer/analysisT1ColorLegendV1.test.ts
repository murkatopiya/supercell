import { describe, expect, it } from "vitest";
import { T1_COLOR_SCALE_V1_SATURATION } from "../../data/escHrTimeAnalysis/t1ColorScaleV1.js";
import { ANALYSIS_T1_VALUE_APPEARANCE_V1 } from "../../rendering/analysisT1ValueAppearanceV1.js";
import { cssSrgbFromLinearRgb } from "../../rendering/vertexColorSpace.js";
import { formatPointDiagnosticScientific } from "./formatPointDiagnosticDisplay.js";
import { VERIFICATION_T1_UNITS } from "./formatTrajectoryTiltingVerification.js";
import {
  ANALYSIS_T1_COLOR_LEGEND_SIGNED_UNITS_V1,
  ANALYSIS_T1_COLOR_LEGEND_STOPS_V1,
  ANALYSIS_T1_COLOR_LEGEND_V1,
  analysisT1ColorLegendStopV1,
} from "./analysisT1ColorLegendV1.js";
import legendSrc from "./analysisT1ColorLegendV1.ts?raw";
import legendUiSrc from "./AnalysisT1ColorLegend.tsx?raw";
import overlaySrc from "../../rendering/trajectoryTiltingOverlay.ts?raw";
import tracerSceneSrc from "../../rendering/TracerScene.ts?raw";
import appearanceSrc from "../../rendering/analysisT1ValueAppearanceV1.ts?raw";
import scaleSrc from "../../data/escHrTimeAnalysis/t1ColorScaleV1.ts?raw";
import simulationSrc from "../../simulation/Simulation.ts?raw";

describe("ANALYSIS_T1_COLOR_LEGEND_V1", () => {
  it("takes numeric endpoints from T1_COLOR_SCALE_V1 saturation", () => {
    expect(ANALYSIS_T1_COLOR_LEGEND_V1.negativeLabel).toBe(
      formatPointDiagnosticScientific(-T1_COLOR_SCALE_V1_SATURATION),
    );
    expect(ANALYSIS_T1_COLOR_LEGEND_V1.positiveLabel).toBe(
      `+${formatPointDiagnosticScientific(T1_COLOR_SCALE_V1_SATURATION)}`,
    );
    expect(legendSrc).toMatch(/T1_COLOR_SCALE_V1_SATURATION/);
    expect(legendSrc).not.toMatch(/6\.100/);
    expect(legendSrc).not.toMatch(/6\.1e-5/i);
    expect(legendSrc).not.toMatch(/0\.000061/);
    expect(legendUiSrc).not.toMatch(/6\.100/);
  });

  it("labels the center as exact 0 with s⁻² units", () => {
    expect(ANALYSIS_T1_COLOR_LEGEND_V1.zeroLabel).toBe("0");
    expect(ANALYSIS_T1_COLOR_LEGEND_V1.zeroLabel).not.toMatch(/≈/);
    expect(ANALYSIS_T1_COLOR_LEGEND_V1.units).toBe(VERIFICATION_T1_UNITS);
    expect(ANALYSIS_T1_COLOR_LEGEND_V1.units).toBe("s⁻²");
  });

  it("samples −1 / 0 / +1 and intermediate signedUnits from appearance SoT", () => {
    for (const signedUnit of [-1, -0.5, 0, 0.5, 1]) {
      const stop = analysisT1ColorLegendStopV1(signedUnit);
      expect(stop.cssColor).toBe(
        cssSrgbFromLinearRgb(
          ANALYSIS_T1_VALUE_APPEARANCE_V1.linearRgbFromSignedUnit(signedUnit),
        ),
      );
    }
    const anchors = Object.fromEntries(
      ANALYSIS_T1_COLOR_LEGEND_STOPS_V1.map((stop) => [
        stop.signedUnit,
        stop.cssColor,
      ]),
    );
    expect(anchors[-1]).toBe(
      cssSrgbFromLinearRgb(
        ANALYSIS_T1_VALUE_APPEARANCE_V1.linearRgbFromSignedUnit(-1),
      ),
    );
    expect(anchors[0]).toBe(
      cssSrgbFromLinearRgb(
        ANALYSIS_T1_VALUE_APPEARANCE_V1.linearRgbFromSignedUnit(0),
      ),
    );
    expect(anchors[1]).toBe(
      cssSrgbFromLinearRgb(
        ANALYSIS_T1_VALUE_APPEARANCE_V1.linearRgbFromSignedUnit(1),
      ),
    );
    expect(ANALYSIS_T1_COLOR_LEGEND_SIGNED_UNITS_V1[0]).toBe(-1);
    expect(ANALYSIS_T1_COLOR_LEGEND_SIGNED_UNITS_V1[4]).toBe(0);
    expect(ANALYSIS_T1_COLOR_LEGEND_SIGNED_UNITS_V1[8]).toBe(1);
  });

  it("is value-only display saturation and does not invent overlay or science", () => {
    expect(ANALYSIS_T1_COLOR_LEGEND_V1.supportingCopy).toBe(
      "Fixed symmetric scale",
    );
    expect(legendSrc).toMatch(/display saturation/);
    expect(legendSrc).toMatch(/OOD is not zero/);
    expect(legendSrc).not.toMatch(/spin-up|spin-down|parcel vorticity/);
    expect(legendSrc).not.toMatch(/FULL_SUPPORT|BOUNDARY_CONDITIONED/);
    expect(legendUiSrc).not.toMatch(/spin-up|FULL_SUPPORT|OUT_OF_DOMAIN/);
    expect(legendSrc).not.toMatch(/trajectoryTiltingOverlay/);
    expect(legendSrc).not.toMatch(/TracerScene/);
    expect(legendSrc).not.toMatch(/queryAnalysisTilting/);
    expect(overlaySrc).not.toMatch(/AnalysisT1ColorLegend/);
    expect(overlaySrc).not.toMatch(/analysisT1ColorLegendV1/);
    expect(tracerSceneSrc).not.toMatch(/AnalysisT1ColorLegend/);
    expect(appearanceSrc).not.toMatch(/analysisT1ColorLegend/);
    expect(scaleSrc).not.toMatch(/analysisT1ColorLegend/);
    expect(simulationSrc).not.toMatch(/analysisT1ColorLegend/);
  });
});
