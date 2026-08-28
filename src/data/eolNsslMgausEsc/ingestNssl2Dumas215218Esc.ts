import { NSSL2_DUMAS_215218_SPEC } from "./escObservedSoundingSpec.js";
import type { EnvironmentalWindProfileRecord } from "./EnvironmentalWindProfileRecord.js";
import { ingestObservedEsc } from "./ingestObservedEsc.js";

export function ingestNssl2Dumas215218Esc(
  text: string,
): EnvironmentalWindProfileRecord {
  return ingestObservedEsc(text, NSSL2_DUMAS_215218_SPEC);
}
