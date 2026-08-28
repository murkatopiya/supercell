import type { IgraObservedSoundingSpec } from "./igraObservedSoundingSpec.js";
import { IgraAdapterError, type IgraSoundingBlock } from "./types.js";

export function matchesIgraObservedSounding(
  block: IgraSoundingBlock,
  spec: IgraObservedSoundingSpec,
): boolean {
  const { header } = block;
  return (
    header.stationId === spec.stationId &&
    header.year === spec.year &&
    header.month === spec.month &&
    header.day === spec.day &&
    header.hour === spec.nominalHourUtc &&
    header.reltime === spec.reltime
  );
}

export function selectIgraSounding(
  blocks: readonly IgraSoundingBlock[],
  spec: IgraObservedSoundingSpec,
): IgraSoundingBlock {
  const matches = blocks.filter((block) =>
    matchesIgraObservedSounding(block, spec),
  );
  if (matches.length === 0) {
    throw new IgraAdapterError(
      `IGRA source has no sounding ${spec.stationId} ${spec.year}-${spec.month}-${spec.day} HOUR ${spec.nominalHourUtc} RELTIME ${spec.reltime}`,
    );
  }
  if (matches.length > 1) {
    throw new IgraAdapterError(
      `IGRA source has more than one ${spec.stationId} HOUR ${spec.nominalHourUtc} RELTIME ${spec.reltime} sounding`,
    );
  }
  return matches[0]!;
}
