import type { EscObservedSoundingSpec } from "./escObservedSoundingSpec.js";
import { EscAdapterError, type EscSoundingBlock } from "./types.js";

export function matchesEscObservedSounding(
  block: EscSoundingBlock,
  spec: EscObservedSoundingSpec,
): boolean {
  return (
    block.header.siteId.includes(spec.siteIdIncludes) &&
    block.header.utcReleaseTime === spec.utcReleaseTime
  );
}

export function selectEscSounding(
  blocks: readonly EscSoundingBlock[],
  spec: EscObservedSoundingSpec,
): EscSoundingBlock {
  const matches = blocks.filter((block) =>
    matchesEscObservedSounding(block, spec),
  );
  if (matches.length === 0) {
    throw new EscAdapterError(
      `ESC source has no sounding with ${spec.siteIdIncludes} and UTC ${spec.utcReleaseTime}`,
    );
  }
  if (matches.length > 1) {
    throw new EscAdapterError(
      `ESC source has more than one ${spec.siteIdIncludes} ${spec.utcReleaseTime} sounding`,
    );
  }
  return matches[0]!;
}
