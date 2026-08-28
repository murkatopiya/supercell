import type { EscObservedSoundingSpec } from "./escObservedSoundingSpec.js";
import type { EscObservedWindMeasurementRecord } from "./escRetainedWindSample.js";
import { parseEscConcatenated } from "./parseEscConcatenated.js";
import {
  escObservedWindMeasurementRecord,
  retainEscWindMeasurements,
} from "./retainEscWindMeasurements.js";
import { selectEscSounding } from "./selectEscSounding.js";

export function ingestEscObservedWindMeasurements(
  text: string,
  spec: EscObservedSoundingSpec,
): EscObservedWindMeasurementRecord {
  const block = selectEscSounding(parseEscConcatenated(text), spec);
  const { samples } = retainEscWindMeasurements(block, spec);
  return escObservedWindMeasurementRecord(spec, samples);
}
