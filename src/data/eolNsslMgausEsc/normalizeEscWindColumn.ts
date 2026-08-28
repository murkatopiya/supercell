import type { EscObservedSoundingSpec } from "./escObservedSoundingSpec.js";
import {
  retainEscWindMeasurements,
  sourceLevelsFromRetainedSamples,
} from "./retainEscWindMeasurements.js";
import type {
  EnvironmentalWindProfileCoverage,
  EscSoundingBlock,
  NormalizedWindLevel,
} from "./types.js";

export {
  isUsableWindRecord,
  retainEscWindMeasurements,
  roundToTenth,
} from "./retainEscWindMeasurements.js";

export function normalizeEscWindColumn(
  block: EscSoundingBlock,
  spec: EscObservedSoundingSpec,
): {
  levels: NormalizedWindLevel[];
  coverage: EnvironmentalWindProfileCoverage;
} {
  const { samples, coverage } = retainEscWindMeasurements(block, spec);
  return {
    levels: sourceLevelsFromRetainedSamples(samples),
    coverage,
  };
}
