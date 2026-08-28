import type { EnvironmentalWindProfileRecord } from "../environmentalWindProfileRecord/EnvironmentalWindProfileRecord.js";
import { OUN_MOORE_20130520_SPEC } from "./igraObservedSoundingSpec.js";
import { ingestObservedIgra } from "./ingestObservedIgra.js";
import { observedIgraRecord } from "./toEnvironmentalWindProfileRecord.js";
import type {
  EnvironmentalWindProfileCoverage,
  NormalizedWindLevel,
} from "../environmentalWindProfileRecord/types.js";

export function ingestOunMoore20130520Igra(
  text: string,
): EnvironmentalWindProfileRecord {
  return ingestObservedIgra(text, OUN_MOORE_20130520_SPEC);
}

export function ounMoore20130520Record(
  levels: readonly NormalizedWindLevel[],
  coverage: EnvironmentalWindProfileCoverage,
  location: { latitude: number; longitude: number },
): EnvironmentalWindProfileRecord {
  return observedIgraRecord(OUN_MOORE_20130520_SPEC, levels, coverage, location);
}
