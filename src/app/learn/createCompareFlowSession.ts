import { composeDemoTracerFields, demoInspectableVelocityOperands } from "../composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../IntegrationFrame.js";
import { measureCompareFlow } from "./CompareFlowMeasurement.js";
import type { VelocityArrowObservation } from "../../rendering/velocityArrow.js";
import type { CompareFlowMeasurement } from "./CompareFlowMeasurement.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import { isCompareFlowPosition } from "./CompareFlowPlacement.js";

/** Presentation scale, provisional until human visual acceptance. */
export const COMPARE_FLOW_ARROW_SCALE = 80;
export const COMPARE_FLOW_POINTS = Object.freeze({
  a: Object.freeze({ x: 0, y: 1000, z: 4000 }),
  b: Object.freeze({ x: 2400, y: 1000, z: 0 }),
});

/** Pure static observations, independent of renderer initialization. No Simulation. */
export interface CompareFlowProbeSnapshot {
  readonly measurement: CompareFlowMeasurement;
  readonly arrow: VelocityArrowObservation | null;
  readonly revision: number;
}

export function createCompareFlowSession() {
  const composition = composeDemoTracerFields(IntegrationFrame.StormRelativeLaboratory);
  const velocityObservation = demoInspectableVelocityOperands(composition);
  const a = measureCompareFlow(COMPARE_FLOW_POINTS.a, velocityObservation);
  const b = measureCompareFlow(COMPARE_FLOW_POINTS.b, velocityObservation);
  const arrow = (measurement: typeof a): VelocityArrowObservation | null => measurement.kind === "available"
    ? Object.freeze({ position: measurement.position, velocity: measurement.velocity, displayMetresPerMps: COMPARE_FLOW_ARROW_SCALE })
    : null;
  const arrows = Object.freeze({ a: arrow(a), b: arrow(b) });
  const initialB: CompareFlowProbeSnapshot = Object.freeze({ measurement: b, arrow: arrows.b, revision: 0 });
  let revision = 0; // Presentation revision only, never model time.
  return Object.freeze({ a, b, initialB, modelTime: 0, integrationFrame: composition.integrationFrame,
    velocityObservation, arrows,
    observeB(position: Readonly<Vec3>): CompareFlowProbeSnapshot {
      if (!isCompareFlowPosition(position)) throw new RangeError("Outside comparison area");
      const measurement = measureCompareFlow(position, velocityObservation);
      return Object.freeze({ measurement, arrow: arrow(measurement), revision: ++revision });
    },
  });
}
export type CompareFlowSession = ReturnType<typeof createCompareFlowSession>;
