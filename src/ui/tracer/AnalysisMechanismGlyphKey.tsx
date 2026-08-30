import {
  ANALYSIS_MECHANISM_GLYPH_KEY_V1,
  shouldShowHypotheticalGlyphKeyRow,
} from "./analysisMechanismGlyphKeyV1.js";
import type { TrajectoryTiltingWhatIfModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";

export interface AnalysisMechanismGlyphKeyProps {
  whatIfModel?: TrajectoryTiltingWhatIfModel | null;
}

/**
 * Compact viewport key for the Analysis mechanism glyph.
 * Visual samples reuse glyph appearance tokens. Not a 3D overlay.
 */
export function AnalysisMechanismGlyphKey({
  whatIfModel = null,
}: AnalysisMechanismGlyphKeyProps) {
  const key = ANALYSIS_MECHANISM_GLYPH_KEY_V1;
  const includeHypothetical = shouldShowHypotheticalGlyphKeyRow(whatIfModel);
  return (
    <aside
      className="analysis-mechanism-glyph-key"
      aria-label="Mechanism glyph key"
    >
      <KeyRow
        color={key.omegaColorCss}
        dashed={false}
        opacity={1}
        label={key.omegaLabel}
      />
      <KeyRow
        color={key.actualGradientColorCss}
        dashed={false}
        opacity={1}
        label={key.actualGradientLabel}
      />
      {includeHypothetical ? (
        <KeyRow
          color={key.hypotheticalGradientColorCss}
          dashed
          opacity={key.hypotheticalOpacity}
          dashArray={`${key.dashSize} ${key.gapSize}`}
          label={key.hypotheticalGradientLabel}
        />
      ) : null}
    </aside>
  );
}

function KeyRow({
  color,
  dashed,
  opacity,
  dashArray,
  label,
}: {
  color: string;
  dashed: boolean;
  opacity: number;
  dashArray?: string;
  label: string;
}) {
  return (
    <div className="analysis-mechanism-glyph-key__row">
      <svg
        className="analysis-mechanism-glyph-key__sample"
        viewBox="0 0 40 12"
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1="2"
          y1="6"
          x2="28"
          y2="6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity={opacity}
          strokeDasharray={dashed ? dashArray : undefined}
        />
        <polygon
          points="38,6 28,2.5 28,9.5"
          fill={color}
          fillOpacity={opacity}
        />
      </svg>
      <span className="analysis-mechanism-glyph-key__label">{label}</span>
    </div>
  );
}
