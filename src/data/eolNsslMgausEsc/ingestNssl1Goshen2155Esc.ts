import { NSSL1_GOSHEN_2155_SPEC } from "./escObservedSoundingSpec.js";
import type { EnvironmentalWindProfileRecord } from "./EnvironmentalWindProfileRecord.js";
import { ingestObservedEsc } from "./ingestObservedEsc.js";

export function ingestNssl1Goshen2155Esc(
  text: string,
): EnvironmentalWindProfileRecord {
  return ingestObservedEsc(text, NSSL1_GOSHEN_2155_SPEC);
}
