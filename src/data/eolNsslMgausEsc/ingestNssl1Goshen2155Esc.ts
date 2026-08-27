import { parseEscConcatenated } from "./parseEscConcatenated.js";
import { selectTargetSounding } from "./selectTargetSounding.js";
import { normalizeEscWindColumn } from "./normalizeEscWindColumn.js";
import { nssl1Goshen2155Record } from "./toEnvironmentalWindProfileRecord.js";
import type { EnvironmentalWindProfileRecord } from "./EnvironmentalWindProfileRecord.js";

export function ingestNssl1Goshen2155Esc(
  text: string,
): EnvironmentalWindProfileRecord {
  const block = selectTargetSounding(parseEscConcatenated(text));
  const { levels, coverage } = normalizeEscWindColumn(block);
  return nssl1Goshen2155Record(levels, coverage, block.header);
}
