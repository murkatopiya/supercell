import type { EnvironmentalWindProfileRecord } from "../environmentalWindProfileRecord/EnvironmentalWindProfileRecord.js";
import type { IgraObservedSoundingSpec } from "./igraObservedSoundingSpec.js";
import { normalizeIgraWindColumn } from "./normalizeIgraWindColumn.js";
import { parseIgraPor } from "./parseIgraPor.js";
import { selectIgraSounding } from "./selectIgraSounding.js";
import { observedIgraRecord } from "./toEnvironmentalWindProfileRecord.js";
import { validateIgraSoundingHeader } from "./validateIgraSoundingHeader.js";

export function ingestObservedIgra(
  text: string,
  spec: IgraObservedSoundingSpec,
): EnvironmentalWindProfileRecord {
  const block = selectIgraSounding(parseIgraPor(text), spec);
  validateIgraSoundingHeader(block, spec);
  const { levels, coverage } = normalizeIgraWindColumn(block, spec);
  return observedIgraRecord(spec, levels, coverage, block.header);
}
