import type { EscObservedSoundingSpec } from "./escObservedSoundingSpec.js";
import type { EnvironmentalWindProfileRecord } from "./EnvironmentalWindProfileRecord.js";
import { normalizeEscWindColumn } from "./normalizeEscWindColumn.js";
import { parseEscConcatenated } from "./parseEscConcatenated.js";
import { selectEscSounding } from "./selectEscSounding.js";
import { observedEscRecord } from "./toEnvironmentalWindProfileRecord.js";

export function ingestObservedEsc(
  text: string,
  spec: EscObservedSoundingSpec,
): EnvironmentalWindProfileRecord {
  const block = selectEscSounding(parseEscConcatenated(text), spec);
  const { levels, coverage } = normalizeEscWindColumn(block, spec);
  return observedEscRecord(spec, levels, coverage, block.header);
}
