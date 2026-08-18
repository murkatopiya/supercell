import type { TracerInspection } from "../../interaction/TracerInspection.js";
import {
  formatInspectorMeters,
  formatInspectorSeconds,
  formatInspectorVector,
  formatInspectorVelocity,
} from "./formatInspectorDisplay.js";
import { labelForContribution } from "./tracerContributionLabels.js";

export interface TracerInspectorPanelProps {
  inspection: TracerInspection | undefined;
}

function contributionSpeed(velocity: { x: number; y: number; z: number }): number {
  return Math.hypot(velocity.x, velocity.y, velocity.z);
}

/**
 * Shared Explore/Guided read-only inspector. Presentational only.
 * docs/architecture/19-shared-tracer-inspector.md
 */
export function TracerInspectorPanel({ inspection }: TracerInspectorPanelProps) {
  return (
    <section className="tracer-inspector" aria-label="Tracer inspector">
      <h3 className="tracer-inspector__title">Inspector</h3>
      <div className="tracer-inspector__body">
        {inspection === undefined ? (
          <p className="tracer-inspector__placeholder">
            Select a tracer to inspect its motion.
          </p>
        ) : (
          <InspectionBody inspection={inspection} />
        )}
      </div>
    </section>
  );
}

function InspectionBody({ inspection }: { inspection: TracerInspection }) {
  const contributions = inspection.contributions;
  return (
    <>
      <h4 className="tracer-inspector__section-title">Motion</h4>
      <p className="tracer-inspector__identity">
        Tracer #{inspection.tracerId}
      </p>
      <p className="tracer-inspector__hint">World: X East, Y Up, Z South</p>
      <dl className="tracer-inspector__rows">
        <InspectorRow
          label="Position (m)"
          value={formatInspectorVector(
            inspection.position,
            formatInspectorMeters,
          )}
        />
        <InspectorRow
          label="Altitude (m)"
          value={formatInspectorMeters(inspection.altitude)}
        />
        <InspectorRow
          label="Simulation time (s)"
          value={formatInspectorSeconds(inspection.time)}
        />
        <InspectorRow
          label="Tracer age (s)"
          value={formatInspectorSeconds(inspection.age)}
        />
        <InspectorRow
          label="State"
          value={inspection.active ? "active" : "inactive"}
        />
        <InspectorRow
          label="V_total (m/s)"
          value={formatInspectorVector(
            inspection.vTotal,
            formatInspectorVelocity,
          )}
        />
        <InspectorRow
          label="Speed |V_total| (m/s)"
          value={formatInspectorVelocity(inspection.speed)}
        />
      </dl>
      {!inspection.active ? (
        <p className="tracer-inspector__note">
          Velocity is the field at this marker, not tracer motion.
        </p>
      ) : null}
      {contributions !== undefined && contributions.length > 0 ? (
        <>
          <h4 className="tracer-inspector__section-title">Why this motion?</h4>
          <ul className="tracer-inspector__contributions">
            {contributions.map((contribution) => (
              <li
                key={contribution.key}
                className="tracer-inspector__contribution"
              >
                <span className="tracer-inspector__contrib-label">
                  {labelForContribution(contribution.key)}
                </span>
                <span className="tracer-inspector__value">
                  {formatInspectorVector(
                    contribution.velocity,
                    formatInspectorVelocity,
                  )}{" "}
                  m/s
                </span>
                <span className="tracer-inspector__value">
                  |V_i| {formatInspectorVelocity(
                    contributionSpeed(contribution.velocity),
                  )}{" "}
                  m/s
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

function InspectorRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="tracer-inspector__row">
      <dt>{label}</dt>
      <dd className="tracer-inspector__value">{value}</dd>
    </div>
  );
}
