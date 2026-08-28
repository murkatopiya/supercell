import { NSSL1_PROSPECT_VALLEY_222346_SPEC } from "./escObservedSoundingSpec.js";
import type { EnvironmentalWindProfileRecord } from "./EnvironmentalWindProfileRecord.js";
import { ingestObservedEsc } from "./ingestObservedEsc.js";

export function ingestNssl1ProspectValley222346Esc(
  text: string,
): EnvironmentalWindProfileRecord {
  return ingestObservedEsc(text, NSSL1_PROSPECT_VALLEY_222346_SPEC);
}
