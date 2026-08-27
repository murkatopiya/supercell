import {
  EscAdapterError,
  NSSL1_GOSHEN_2155_UTC,
  type EscSoundingBlock,
} from "./types.js";

export function isNssl1Goshen2155Header(block: EscSoundingBlock): boolean {
  return (
    block.header.siteId.includes("NSSL1") &&
    block.header.utcReleaseTime === NSSL1_GOSHEN_2155_UTC
  );
}

export function selectTargetSounding(
  blocks: readonly EscSoundingBlock[],
): EscSoundingBlock {
  const matches = blocks.filter(isNssl1Goshen2155Header);
  if (matches.length === 0) {
    throw new EscAdapterError(
      "ESC source has no sounding with NSSL1 and UTC 2009, 06, 05, 21:55:22",
    );
  }
  if (matches.length > 1) {
    throw new EscAdapterError(
      "ESC source has more than one NSSL1 2009-06-05 21:55:22 sounding",
    );
  }
  return matches[0]!;
}
