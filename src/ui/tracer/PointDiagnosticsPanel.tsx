import type { PointDiagnosticObservation } from "../../interaction/PointDiagnosticObservation.js";
import {
  classifyPointDiagnosticSign,
  formatPointDiagnosticScientific,
} from "./formatPointDiagnosticDisplay.js";

export interface PointDiagnosticsPanelProps {
  observation: PointDiagnosticObservation | undefined;
}

const TILTING_LABEL = "Vertical-vorticity tilting tendency";
const TILTING_SYMBOL = "T_tilt,y";
const TILTING_UNITS = "s⁻²";
const VORTICITY_LABEL = "Current world-vertical vorticity";
const VORTICITY_SYMBOL = "ω_y,current";
const VORTICITY_UNITS = "s⁻¹";

/**
 * Explore-only presentational readout for T1 and Candidate A.
 * Observation in, DOM out. Does not sample fields.
 * docs/architecture/32-diagnostic-observation-ui-architecture.md
 */
export function PointDiagnosticsPanel({
  observation,
}: PointDiagnosticsPanelProps) {
  return (
    <section className="point-diagnostics" aria-label="Point diagnostics">
      <h3 className="point-diagnostics__title">Point diagnostics</h3>
      <div className="point-diagnostics__body">
        {observation === undefined ? (
          <p className="point-diagnostics__placeholder">
            Select a tracer to sample diagnostics at its current position.
          </p>
        ) : (
          <PointDiagnosticsBody observation={observation} />
        )}
      </div>
    </section>
  );
}

function PointDiagnosticsBody({
  observation,
}: {
  observation: PointDiagnosticObservation;
}) {
  return (
    <>
      <p className="point-diagnostics__hint">
        Sampled from the laboratory field at this marker. Not stored on the
        tracer.
      </p>
      <DiagnosticQuantity
        label={TILTING_LABEL}
        symbol={TILTING_SYMBOL}
        units={TILTING_UNITS}
        value={observation.tiltingTendency}
      />
      <DiagnosticQuantity
        label={VORTICITY_LABEL}
        symbol={VORTICITY_SYMBOL}
        units={VORTICITY_UNITS}
        value={observation.currentVerticalVorticity}
      />
      <div className="point-diagnostics__disclaimer">
        <p>These are different quantities.</p>
        <p>
          T_tilt,y is a tilting tendency (s⁻²): where environmental horizontal
          vorticity and the updraft gradient would tend to produce
          world-vertical vorticity.
        </p>
        <p>
          ω_y,current is world-vertical vorticity that already exists in current
          V_total (s⁻¹). In this laboratory it is prescribed through Ω.
        </p>
        <p>
          T1 does not generate ω_y,current. Same sign at this point is not
          causation.
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
