import type { Vec3 } from "../../core/math/Vec3.js";
import { worldVelocityToAtmospheric } from "../../core/math/AtmosphericVelocity.js";
import { inspectWorldPoint, type InspectableVelocityOperands } from "../../interaction/TracerInspection.js";

type Location = { readonly position: Readonly<Vec3> };
export type CompareFlowMeasurement = Location & (
  | { readonly kind: "available"; readonly velocity: Readonly<Vec3>; readonly speed: number;
      readonly eastward: number; readonly northward: number; readonly vertical: number }
  | { readonly kind: "unavailable" }
);

/** Static probe adapter: no particle age/history escapes the inspection API. */
export function measureCompareFlow(position: Readonly<Vec3>, observation: InspectableVelocityOperands): CompareFlowMeasurement {
  const point = Object.freeze({ ...position });
  try {
    if (![point.x, point.y, point.z].every(Number.isFinite)) throw new Error("Invalid point");
    const measured = inspectWorldPoint(0, point, 0, 0, false, { total: observation.total });
    const v = measured.vTotal;
    if (![v.x, v.y, v.z, measured.speed].every(Number.isFinite)) throw new Error("Invalid velocity");
    return Object.freeze({ kind: "available", position: point, velocity: Object.freeze({ ...v }),
      speed: measured.speed, ...worldVelocityToAtmospheric(v) });
  } catch {
    return Object.freeze({ kind: "unavailable", position: point });
  }
}
