import { ANALYSIS_UNAVAILABLE_COPY } from "../../app/publicDiagnosticCopy.js";
import type { RefObject } from "react";
import type { TrajectoryTiltingWhatIfModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import { CollapsibleObservationSection } from "./CollapsibleObservationSection.js";
import { alignmentAbsenceCopy } from "./formatTrajectoryTiltingVerification.js";
import {
  formatVerificationScientific,
  formatVerificationThetaDegrees,
  radiansToDisplayDegrees,
  VERIFICATION_T1_UNITS,
  VERIFICATION_THETA_DISPLAY_UNITS,
} from "./formatTrajectoryTiltingVerification.js";
import type { AnalysisTiltingAlignment } from "../../data/escHrTimeAnalysis/analysisTiltingQuery.js";

export const WHAT_IF_THETA_MIN_DEGREES = 0;
export const WHAT_IF_THETA_MAX_DEGREES = 180;

export interface TrajectoryTiltingWhatIfPanelProps {
  result: TrajectoryTiltingWhatIfModel | undefined;
  onThetaWhatIfChange?: (thetaRadians: number) => void;
  onReset?: () => void;
  expandRequestNonce?: number;
  sectionRef?: RefObject<HTMLElement | null>;
  onExpandedForReveal?: () => void;
}

/**
 * Read-only laboratory, ephemeral θ-only what-if control.
 * Does not query Analysis. Does not mutate fields.
 * Architecture 62 Slice F.
 */
export function TrajectoryTiltingWhatIfPanel({
  result,
  onThetaWhatIfChange,
  onReset,
  expandRequestNonce,
  sectionRef,
  onExpandedForReveal,
}: TrajectoryTiltingWhatIfPanelProps) {
  return (
    <CollapsibleObservationSection
      sectionClassName="trajectory-tilting-whatif"
      ariaLabel="Analysis tilting what-if alignment"
      title="What-if geometry"
      titleClassName="trajectory-tilting-whatif__title"
      bodyClassName="trajectory-tilting-whatif__body"
      expandRequestNonce={expandRequestNonce}
      sectionRef={sectionRef}
      onExpandedForReveal={onExpandedForReveal}
    >
      {result === undefined ? (
        <p className="trajectory-tilting-whatif__placeholder">
          Select a recorded trajectory point to explore a hypothetical alignment.
        </p>
      ) : (
        <WhatIfBody
          result={result}
          onThetaWhatIfChange={onThetaWhatIfChange}
          onReset={onReset}
        />
      )}
    </CollapsibleObservationSection>
  );
}

function WhatIfBody({
  result,
  onThetaWhatIfChange,
  onReset,
}: {
  result: TrajectoryTiltingWhatIfModel;
  onThetaWhatIfChange?: (thetaRadians: number) => void;
  onReset?: () => void;
}) {
  if (result.kind === "UNAVAILABLE") {
    return <UnavailableBody result={result} />;
  }
  const degrees = radiansToDisplayDegrees(result.thetaWhatIf);
  return (
    <>
      <p className="trajectory-tilting-whatif__hint">
        Laboratory state unchanged. Hypothetical T1 for the same vector
        magnitudes at a different alignment angle.
      </p>
      <p className="trajectory-tilting-whatif__hint">
        Environmental ω_h stays fixed. A hypothetical copy of prescribed ∇_h Vy
        rotates in the world x-z plane. This is a visualization convention, not
        a field change.
      </p>
      <div className="trajectory-tilting-whatif__quantity">
        <p className="trajectory-tilting-whatif__label">Actual T1</p>
        <p className="trajectory-tilting-whatif__reading">
          <span className="trajectory-tilting-whatif__value">
            {formatVerificationScientific(result.actualTiltingTendency)}
          </span>{" "}
          <span className="trajectory-tilting-whatif__units">
            {VERIFICATION_T1_UNITS}
          </span>
        </p>
      </div>
      <div className="trajectory-tilting-whatif__quantity trajectory-tilting-whatif__quantity--hypothetical">
        <p className="trajectory-tilting-whatif__label">Hypothetical T1</p>
        <p className="trajectory-tilting-whatif__reading">
          <span className="trajectory-tilting-whatif__value">
            {formatVerificationScientific(result.whatIfTiltingTendency)}
          </span>{" "}
          <span className="trajectory-tilting-whatif__units">
            {VERIFICATION_T1_UNITS}
          </span>
        </p>
      </div>
      <p className="trajectory-tilting-whatif__hint">
        Actual θ {formatVerificationThetaDegrees(result.actualTheta)}
        {VERIFICATION_THETA_DISPLAY_UNITS}
        {" · "}
        What-if θ {formatVerificationThetaDegrees(result.thetaWhatIf)}
        {VERIFICATION_THETA_DISPLAY_UNITS}
      </p>
      <label className="trajectory-tilting-whatif__control">
        Hypothetical alignment angle (°)
        <input
          type="range"
          min={WHAT_IF_THETA_MIN_DEGREES}
          max={WHAT_IF_THETA_MAX_DEGREES}
          step={0.1}
          value={degrees}
          aria-valuemin={WHAT_IF_THETA_MIN_DEGREES}
          aria-valuemax={WHAT_IF_THETA_MAX_DEGREES}
          onChange={(event) => {
            if (onThetaWhatIfChange === undefined) {
              return;
            }
            onThetaWhatIfChange(
              (Number(event.target.value) * Math.PI) / 180,
            );
          }}
        />
      </label>
      <p className="trajectory-tilting-whatif__hint">
        0°: maximum positive T1 for fixed vector magnitudes. 90°: T1 = 0 for
        fixed vector magnitudes. 180°: maximum negative T1 for fixed vector
        magnitudes.
      </p>
      <button
        type="button"
        className="trajectory-tilting-whatif__reset"
        onClick={onReset}
      >
        Reset to actual angle
      </button>
    </>
  );
}

function UnavailableBody({
  result,
}: {
  result: Extract<TrajectoryTiltingWhatIfModel, { kind: "UNAVAILABLE" }>;
}) {
  return (
    <>
      <p className="trajectory-tilting-whatif__status">What-if unavailable</p>
      <details><summary>Technical details</summary><p>{result.reason}</p><p>Source T1 is not a fallback.</p></details>
      <p className="trajectory-tilting-whatif__hint">{unavailableCopy(result.reason)}</p>
      <p className="trajectory-tilting-whatif__hint">Laboratory state unchanged.</p>
    </>
  );
}

function unavailableCopy(
  reason: Extract<TrajectoryTiltingWhatIfModel, { kind: "UNAVAILABLE" }>["reason"],
): string {
  if (reason === "COLUMN_UNAVAILABLE") {
    return ANALYSIS_UNAVAILABLE_COPY;
  }
  if (reason === "OUT_OF_DOMAIN") {
    return "Out of Analysis domain. What-if alignment is unavailable.";
  }
  const alignment: AnalysisTiltingAlignment = { state: reason };
  return (
    alignmentAbsenceCopy(alignment) ??
    "Alignment angle is undefined because a vector magnitude is zero."
  );
}
