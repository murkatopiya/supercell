import {
  COVERAGE_GAP_THRESHOLD_M,
  ESC_MISSING_ALTITUDE,
  ESC_MISSING_WIND,
  ESC_QC_BAD,
  ESC_QC_MISSING,
  EscAdapterError,
  NSSL1_GOSHEN_2155_LAUNCH_ELEVATION_M,
  type EnvironmentalWindProfileCoverage,
  type EscDataRecord,
  type EscSoundingBlock,
  type HeightGapSpan,
  type NormalizedWindLevel,
} from "./types.js";

export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

export function isUsableWindRecord(record: EscDataRecord): boolean {
  if (record.u === ESC_MISSING_WIND || record.v === ESC_MISSING_WIND) {
    return false;
  }
  if (
    record.qu === ESC_QC_MISSING ||
    record.qv === ESC_QC_MISSING ||
    record.qu === ESC_QC_BAD ||
    record.qv === ESC_QC_BAD
  ) {
    return false;
  }
  if (record.alt === ESC_MISSING_ALTITUDE) {
    return false;
  }
  return true;
}

function gapSpansOver50m(
  levels: readonly NormalizedWindLevel[],
): HeightGapSpan[] {
  const spans: HeightGapSpan[] = [];
  for (let i = 1; i < levels.length; i++) {
    const fromHeight = levels[i - 1]!.height;
    const toHeight = levels[i]!.height;
    const delta = roundToTenth(toHeight - fromHeight);
    if (delta > COVERAGE_GAP_THRESHOLD_M) {
      spans.push({ fromHeight, toHeight, delta });
    }
  }
  return spans;
}

export function normalizeEscWindColumn(block: EscSoundingBlock): {
  levels: NormalizedWindLevel[];
  coverage: EnvironmentalWindProfileCoverage;
} {
  const launchElevation = block.header.launchElevation;
  if (launchElevation !== NSSL1_GOSHEN_2155_LAUNCH_ELEVATION_M) {
    throw new EscAdapterError(
      `NSSL1 2155 UTC launch elevation must be ${NSSL1_GOSHEN_2155_LAUNCH_ELEVATION_M}, got ${launchElevation}`,
    );
  }

  const levels: NormalizedWindLevel[] = [];
  for (const record of block.records) {
    if (!isUsableWindRecord(record)) {
      continue;
    }

    const height = roundToTenth(
      record.alt - NSSL1_GOSHEN_2155_LAUNCH_ELEVATION_M,
    );
    if (!Number.isFinite(height) || !Number.isFinite(record.u) || !Number.isFinite(record.v)) {
      throw new EscAdapterError("normalized height or wind is not finite");
    }

    levels.push({
      height,
      eastward: record.u,
      northward: record.v,
    });
  }

  if (levels.length < 2) {
    throw new EscAdapterError(
      "ESC wind column has fewer than 2 usable U/V levels",
    );
  }

  for (let i = 1; i < levels.length; i++) {
    if (!(levels[i]!.height > levels[i - 1]!.height)) {
      throw new EscAdapterError(
        `normalized heights must be strictly increasing at index ${i}`,
      );
    }
  }

  const coverage: EnvironmentalWindProfileCoverage = {
    minHeight: levels[0]!.height,
    maxHeight: levels[levels.length - 1]!.height,
    nativeDataRecordCount: block.records.length,
    keptLevelCount: levels.length,
    droppedLevelCount: block.records.length - levels.length,
    gapSpansOver50m: gapSpansOver50m(levels),
  };

  return { levels, coverage };
}
