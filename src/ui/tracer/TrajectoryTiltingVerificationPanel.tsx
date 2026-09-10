import type { TrajectoryTiltingVerificationModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingVerification.js";
import { T1_EXPLANATION, ANALYSIS_UNAVAILABLE_COPY, ANALYSIS_FULL_COPY, ANALYSIS_BOUNDARY_COPY } from "../../app/publicDiagnosticCopy.js";
import type { TrajectoryTiltingRecordedSampleContext } from "../../data/escHrTimeAnalysis/trajectoryTiltingVerification.js";
import { CollapsibleObservationSection } from "./CollapsibleObservationSection.js";
import {
  alignmentAbsenceCopy,
  formatVerificationCosTheta,
  formatVerificationScientific,
  formatVerificationSegmentHeight,
  formatVerificationThetaDegrees,
  GRADIENT_MAGNITUDE_LABEL,
  NATIVE_SEGMENT_LABEL,
  OMEGA_MAGNITUDE_LABEL,
  T1_ALIGNMENT_EQUATION,
  T1_PRODUCT_EQUATION,
  T1_VERIFY_LABEL,
  VERIFICATION_MAGNITUDE_UNITS,
  VERIFICATION_T1_UNITS,
  VERIFICATION_THETA_DISPLAY_UNITS,
} from "./formatTrajectoryTiltingVerification.js";

export interface TrajectoryTiltingVerificationPanelProps {
  model: TrajectoryTiltingVerificationModel | undefined;
}

/**
 * Read-only Analysis T1 numeric verification / provenance readout.
 * Consumes a packaged verification model. Does not query Analysis.
 * Architecture 62 Slice E. Public T1 authority; not Point diagnostics.
 */
export function TrajectoryTiltingVerificationPanel({
  model,
}: TrajectoryTiltingVerificationPanelProps) {
  return (
    <CollapsibleObservationSection
      sectionClassName="trajectory-tilting-verify"
      ariaLabel="Analysis tilting verification"
      title="T1 calculation"
      titleClassName="trajectory-tilting-verify__title"
      bodyClassName="trajectory-tilting-verify__body"
    >
      {model === undefined ? (
        <p className="trajectory-tilting-verify__placeholder">
          Select a recorded trajectory point to inspect the T1 calculation.
        </p>
      ) : (
        <VerificationBody model={model} />
      )}
    </CollapsibleObservationSection>
  );
}

function VerificationBody({
  model,
}: {
  model: TrajectoryTiltingVerificationModel;
}) {
  if (model.kind === "UNSUPPORTED") {
    return <UnsupportedBody model={model} />;
  }
  return <SupportedBody model={model} />;
}

function UnsupportedBody({
  model,
}: {
  model: Extract<TrajectoryTiltingVerificationModel, { kind: "UNSUPPORTED" }>;
}) {
  const column = model.status === "COLUMN_UNAVAILABLE";
  return (
    <>
      <p
        className={
          column
            ? "trajectory-tilting-verify__status trajectory-tilting-verify__status--column"
            : "trajectory-tilting-verify__status trajectory-tilting-verify__status--ood"
        }
      >
        {column ? "Analysis unavailable" : "Outside the Analysis height domain"}
      </p>
      <p className="trajectory-tilting-verify__hint">
        {column
          ? ANALYSIS_UNAVAILABLE_COPY
          : "Out of Analysis domain. No Analysis T1. This is not a numeric zero."}
      </p>
      <p className="trajectory-tilting-verify__hint">Recorded trajectory point. The live tracer has not been rewound.</p>
      <details><summary>Technical details</summary>
        <p>{model.status}</p>
        <p>Source T1 is not a fallback.</p>
        <RecordedSampleBlock sample={model.recordedSample} />
      {model.status === "OUT_OF_DOMAIN" ? (
        <ProvenanceBlock
          representation={model.representation}
          sourceIdentity={model.provenance.sourceIdentity}
          transformId={model.provenance.transformId}
          transformVersion={model.provenance.transformVersion}
        />
      ) : null}
      </details>
    </>
  );
}

function SupportedBody({
  model,
}: {
  model: Extract<TrajectoryTiltingVerificationModel, { kind: "SUPPORTED" }>;
}) {
  const boundary = model.support === "BOUNDARY_CONDITIONED";
  const defined = model.alignment.state === "ALIGNMENT_DEFINED";
  const absence = alignmentAbsenceCopy(model.alignment);
  return (
    <>
      <p
        className={
          boundary
            ? "trajectory-tilting-verify__status trajectory-tilting-verify__status--boundary"
            : "trajectory-tilting-verify__status"
        }
      >
        {boundary ? "Available with boundary-dependent filtering" : "Available with full filter support"}
      </p>
      <p className="trajectory-tilting-verify__hint">{boundary ? ANALYSIS_BOUNDARY_COPY : ANALYSIS_FULL_COPY}</p>
      <p className="trajectory-tilting-verify__hint">
        Recorded trajectory point. The live tracer has not been rewound.
        These are the two factors and their alignment used in the same diagnostic, not an independent validation.
      </p>
      <details><summary>What this diagnostic means</summary><p>{T1_EXPLANATION}</p></details>
      <p className="trajectory-tilting-verify__equation">{T1_PRODUCT_EQUATION}</p>
      {defined ? (
        <p className="trajectory-tilting-verify__equation">
          {T1_ALIGNMENT_EQUATION}
        </p>
      ) : null}
      <Quantity
        label={T1_VERIFY_LABEL}
        symbol="T1"
        units={VERIFICATION_T1_UNITS}
        value={formatVerificationScientific(model.tiltingTendency)}
      />
      <Quantity
        label={OMEGA_MAGNITUDE_LABEL}
        symbol="|ω_h,env|"
        units={VERIFICATION_MAGNITUDE_UNITS}
        value={formatVerificationScientific(model.omegaHMagnitude)}
      />
      <Quantity
        label={GRADIENT_MAGNITUDE_LABEL}
        symbol="|∇_h Vy,updraft|"
        units={VERIFICATION_MAGNITUDE_UNITS}
        value={formatVerificationScientific(model.gradientMagnitude)}
      />
      {defined && model.alignment.state === "ALIGNMENT_DEFINED" ? (
        <>
          <Quantity
            label="Alignment angle θ"
            symbol="θ"
            units={VERIFICATION_THETA_DISPLAY_UNITS}
            value={formatVerificationThetaDegrees(model.alignment.theta)}
          />
          <Quantity
            label="cosθ"
            symbol="cosθ"
            units=""
            value={formatVerificationCosTheta(model.alignment.cosTheta)}
          />
        </>
      ) : (
        <p className="trajectory-tilting-verify__absence">{absence}</p>
      )}
      <details><summary>Technical details</summary>
      <p>{model.support}</p>
      <RecordedSampleBlock sample={model.recordedSample} />
      <dl className="trajectory-tilting-verify__rows">
        <Row label="Representation" value={model.representation} />
        <Row label="Method" value={model.method} />
        <Row label="Physical identity" value={model.physicalIdentity} />
        <Row
          label="Environmental operand"
          value={model.environmentalOperand}
        />
        <Row label="Storm-local operand" value={model.stormLocalOperand} />
        <Row
          label={NATIVE_SEGMENT_LABEL}
          value={`${formatVerificationSegmentHeight(model.segment.hLo)} – ${formatVerificationSegmentHeight(model.segment.hHi)}`}
        />
      </dl>
      <ProvenanceBlock
        representation={model.representation}
        sourceIdentity={model.provenance.sourceIdentity}
        transformId={model.provenance.transformId}
        transformVersion={model.provenance.transformVersion}
        samplingClass={model.provenance.samplingClass}
        domain={model.provenance.domain}
        cutoffWavelengthS={model.provenance.cutoffWavelengthS}
      />
      </details>
    </>
  );
}

function RecordedSampleBlock({
  sample,
}: {
  sample: TrajectoryTiltingRecordedSampleContext | undefined;
}) {
  if (sample === undefined) {
    return null;
  }
  return (
    <dl className="trajectory-tilting-verify__rows">
      <Row
        label="Recorded trajectory sample position (m)"
        value={`${sample.position.x}, ${sample.position.y}, ${sample.position.z}`}
      />
      <Row
        label="Recorded simulation time (s)"
        value={String(sample.simulationTime)}
      />
    </dl>
  );
}

function Quantity({
  label,
  symbol,
  units,
  value,
}: {
  label: string;
  symbol: string;
  units: string;
  value: string;
}) {
  return (
    <div className="trajectory-tilting-verify__quantity">
      <p className="trajectory-tilting-verify__label">{label}</p>
      <p className="trajectory-tilting-verify__symbol">{symbol}</p>
      <p className="trajectory-tilting-verify__reading">
        <span className="trajectory-tilting-verify__value">{value}</span>
        {units === "" ? null : (
          <>
            {" "}
            <span className="trajectory-tilting-verify__units">{units}</span>
          </>
        )}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="trajectory-tilting-verify__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ProvenanceBlock({
  representation,
  sourceIdentity,
  transformId,
  transformVersion,
  samplingClass,
  domain,
  cutoffWavelengthS,
}: {
  representation: string;
  sourceIdentity: string;
  transformId: string;
  transformVersion: string;
  samplingClass?: string;
  domain?: string;
  cutoffWavelengthS?: number;
}) {
  return (
    <details className="trajectory-tilting-verify__provenance">
      <summary>Provenance</summary>
      <dl className="trajectory-tilting-verify__rows">
        <Row label="Representation" value={representation} />
        <Row label="Source identity" value={sourceIdentity} />
        <Row label="Transform" value={`${transformId} ${transformVersion}`} />
        {samplingClass === undefined ? null : (
          <Row label="Sampling class" value={samplingClass} />
        )}
        {domain === undefined ? null : <Row label="Domain" value={domain} />}
        {cutoffWavelengthS === undefined ? null : (
          <Row label="Cutoff wavelength (s)" value={String(cutoffWavelengthS)} />
        )}
      </dl>
    </details>
  );
}
