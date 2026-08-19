import type { VelocityField } from "../core/fields/VelocityField.js";
import { writeUnitDirectionsFromField } from "./orientedAirflowMark.js";
import type { VisualAirflowPopulation } from "./VisualAirflowPopulation.js";

/**
 * R1 observation: existing visual-occupant positions plus unit
 * direction from the SAME VelocityField instance the population
 * already samples. Not a renderer. Not a scientific tracer.
 */
export function writeAdvectedOrientedAirflow(
  population: VisualAirflowPopulation,
  field: VelocityField,
  time: number,
  positions: Float32Array,
  unitDirections: Float32Array,
): void {
  if (!population.samplesField(field)) {
    throw new Error(
      "advected oriented airflow must observe the population field instance",
    );
  }
  population.writePositionsTo(positions);
  writeUnitDirectionsFromField(
    field,
    positions,
    population.occupantCount,
    time,
    unitDirections,
  );
}
