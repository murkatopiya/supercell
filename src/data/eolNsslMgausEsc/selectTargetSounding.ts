import { NSSL1_GOSHEN_2155_SPEC } from "./escObservedSoundingSpec.js";
import {
  matchesEscObservedSounding,
  selectEscSounding,
} from "./selectEscSounding.js";
import type { EscSoundingBlock } from "./types.js";

export function isNssl1Goshen2155Header(block: EscSoundingBlock): boolean {
  return matchesEscObservedSounding(block, NSSL1_GOSHEN_2155_SPEC);
}

export function selectTargetSounding(
  blocks: readonly EscSoundingBlock[],
): EscSoundingBlock {
  return selectEscSounding(blocks, NSSL1_GOSHEN_2155_SPEC);
}
