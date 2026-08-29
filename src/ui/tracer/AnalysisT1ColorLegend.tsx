import { ANALYSIS_T1_COLOR_LEGEND_V1 } from "./analysisT1ColorLegendV1.js";

/**
 * Compact viewport legend for Analysis T1 along the recorded path.
 * Value encoding only. Does not describe support quality.
 */
export function AnalysisT1ColorLegend() {
  const legend = ANALYSIS_T1_COLOR_LEGEND_V1;
  return (
    <aside
      className="analysis-t1-color-legend"
      aria-label="Analysis T1 color scale"
    >
      <p className="analysis-t1-color-legend__title">{legend.title}</p>
      <div
        className="analysis-t1-color-legend__ramp"
        style={{ backgroundImage: legend.gradientCss }}
        role="img"
        aria-label="cool negative, neutral zero, warm positive"
      />
      <div className="analysis-t1-color-legend__ticks">
        <span>{legend.negativeLabel}</span>
        <span>{legend.zeroLabel}</span>
        <span>
          {legend.positiveLabel} {legend.units}
        </span>
      </div>
      <p className="analysis-t1-color-legend__note">{legend.supportingCopy}</p>
    </aside>
  );
}
