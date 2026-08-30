import type { PointDiagnosticObservation } from "../../interaction/PointDiagnosticObservation.js";
import type { InspectionSampleMode } from "../../interaction/HistoricalPathProbe.js";
import { CollapsibleObservationSection } from "./CollapsibleObservationSection.js";
import {
  classifyPointDiagnosticSign,
  formatPointDiagnosticScientific,
} from "./formatPointDiagnosticDisplay.js";

export interface PointDiagnosticsPanelProps {
  observation: PointDiagnosticObservation | undefined;
  mode?: InspectionSampleMode;
}

const VORTICITY_LABEL = "Current world-vertical vorticity";
const VORTICITY_SYMBOL = "ω_y,current";
const VORTICITY_UNITS = "s⁻¹";

/**
 * Explore-only presentational readout for Candidate A.
 * Public T1 authority is Architecture 62 Analysis T1, not this panel.
 * Observation in, DOM out. Does not sample fields.
 * docs/architecture/32-diagnostic-observation-ui-architecture.md
 * docs/architecture/62-trajectory-tilting-explorer-v1.md
 */
export function PointDiagnosticsPanel({
  observation,
  mode = "current",
}: PointDiagnosticsPanelProps) {
  return (
    <CollapsibleObservationSection
      sectionClassName="point-diagnostics"
      ariaLabel="Point diagnostics"
      title="Point diagnostics"
      titleClassName="point-diagnostics__title"
      bodyClassName="point-diagnostics__body"
    >
      {observation === undefined ? (
        <p className="point-diagnostics__placeholder">
          Select a tracer to sample diagnostics at its current position.
        </p>
      ) : (
        <PointDiagnosticsBody observation={observation} mode={mode} />
      )}
    </CollapsibleObservationSection>
  );
}

function PointDiagnosticsBody({
  observation,
  mode,
}: {
  observation: PointDiagnosticObservation;
  mode: InspectionSampleMode;
}) {
  const historical = mode === "historical";
  return (
    <>
      <p
        className={
          historical
            ? "point-diagnostics__mode point-diagnostics__mode--historical"
            : "point-diagnostics__mode"
        }
      >
        {historical ? "HISTORICAL PATH SAMPLE" : "CURRENT"}
      </p>
      <p className="point-diagnostics__hint">
        {historical
          ? "Sampled at a past recorded position/time from the laboratory field. The tracer was not rewound."
          : "Sampled from the laboratory field at this marker. Not stored on the tracer."}
      </p>
      <DiagnosticQuantity
        label={VORTICITY_LABEL}
        symbol={VORTICITY_SYMBOL}
        units={VORTICITY_UNITS}
        value={observation.currentVerticalVorticity}
      />
      <div className="point-diagnostics__disclaimer">
        <p>
          This is current world-vertical vorticity already present in the
          prescribed laboratory field. It is not a prognostic parcel-vorticity
          state.
        </p>
      </div>
    </>
  );
}

function DiagnosticQuantity({
  label,
  symbol,
  units,
  value,
}: {
  label: string;
  symbol: string;
  units: string;
  value: number;
}) {
  const formatted = formatPointDiagnosticScientific(value);
  const sign = classifyPointDiagnosticSign(value);
  return (
    <div className="point-diagnostics__quantity">
      <p className="point-diagnostics__label">{label}</p>
      <p className="point-diagnostics__symbol">{symbol}</p>
      <p className="point-diagnostics__reading">
        <span className="point-diagnostics__value">{formatted}</span>{" "}
        <span className="point-diagnostics__units">{units}</span>
      </p>
      <p className="point-diagnostics__sign">{sign}</p>
    </div>
  );
}
