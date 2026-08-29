import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { T1_COLOR_SCALE_V1_SATURATION } from "../../data/escHrTimeAnalysis/t1ColorScaleV1.js";
import { formatPointDiagnosticScientific } from "./formatPointDiagnosticDisplay.js";
import { AnalysisT1ColorLegend } from "./AnalysisT1ColorLegend.js";
import { ANALYSIS_T1_COLOR_LEGEND_V1 } from "./analysisT1ColorLegendV1.js";
import panelSrc from "./AnalysisT1ColorLegend.tsx?raw";
import viewportSrc from "./TracerViewport.tsx?raw";
import appSrc from "../../app/App.tsx?raw";
import createGuidedLabSrc from "../../app/createGuidedLab.ts?raw";

describe("AnalysisT1ColorLegend", () => {
  it("renders the V1 title, exact zero, saturation labels, and units", () => {
    const html = renderToStaticMarkup(<AnalysisT1ColorLegend />);
    expect(html).toContain("Analysis T1");
    expect(html).toContain(">0<");
    expect(html).not.toContain("≈ 0");
    expect(html).toContain(
      formatPointDiagnosticScientific(-T1_COLOR_SCALE_V1_SATURATION),
    );
    expect(html).toContain(
      `+${formatPointDiagnosticScientific(T1_COLOR_SCALE_V1_SATURATION)}`,
    );
    expect(html).toContain("s⁻²");
    expect(html).toContain("Fixed symmetric scale");
    expect(html).toContain(ANALYSIS_T1_COLOR_LEGEND_V1.gradientCss);
    expect(html).toContain("cool negative, neutral zero, warm positive");
  });

  it("appears in the viewport from analysisColumn availability, not environment names", () => {
    expect(viewportSrc).toMatch(
      /analysisColumn !== null \? <AnalysisT1ColorLegend \/>/,
    );
    expect(viewportSrc).not.toMatch(/Goshen|Prospect|Dumas|Moore|Demo/);
    expect(appSrc).not.toMatch(/AnalysisT1ColorLegend/);
    expect(createGuidedLabSrc).not.toMatch(/AnalysisT1ColorLegend/);
    expect(createGuidedLabSrc).not.toMatch(/analysisColumn/);
    expect(panelSrc).not.toMatch(/Goshen|Prospect|Dumas|Moore/);
  });
});
