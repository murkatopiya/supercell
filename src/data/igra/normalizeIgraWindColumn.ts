import {
  igraFieldIsPresent,
  igraWindFromDirectionSpeed,
} from "./convertIgraWind.js";
import type { IgraObservedSoundingSpec } from "./igraObservedSoundingSpec.js";
import {
  COVERAGE_GAP_THRESHOLD_M,
  type EnvironmentalWindProfileCoverage,
  type HeightGapSpan,
  type NormalizedWindLevel,
} from "../environmentalWindProfileRecord/types.js";
import { IgraAdapterError, type IgraSoundingBlock } from "./types.js";

function gapSpansOver50m(
  levels: readonly NormalizedWindLevel[],
): HeightGapSpan[] {
  const spans: HeightGapSpan[] = [];
  for (let i = 1; i < levels.length; i++) {
    const fromHeight = levels[i - 1]!.height;
    const toHeight = levels[i]!.height;
    const delta = toHeight - fromHeight;
    if (delta > COVERAGE_GAP_THRESHOLD_M) {
      spans.push({ fromHeight, toHeight, delta });
    }
  }
  return spans;
}

function assertUsableWindRanges(
  gph: number,
  wdir: number,
  wspd: number,
  index: number,
): void {
  if (!Number.isFinite(gph) || !Number.isFinite(wdir) || !Number.isFinite(wspd)) {
    throw new IgraAdapterError(
      `IGRA GPH/WDIR/WSPD at native index ${index} is not finite`,
    );
  }
  if (!(wdir >= 0 && wdir <= 360)) {
    throw new IgraAdapterError(
      `IGRA WDIR at native index ${index} is out of range: ${wdir}`,
    );
  }
  if (!(wspd >= 0)) {
    throw new IgraAdapterError(
      `IGRA WSPD at native index ${index} is negative: ${wspd}`,
    );
  }
}

export function normalizeIgraWindColumn(
  block: IgraSoundingBlock,
  spec: IgraObservedSoundingSpec,
): {
  levels: NormalizedWindLevel[];
  coverage: EnvironmentalWindProfileCoverage;
} {
  const retained: Array<NormalizedWindLevel & { nativeIndex: number }> = [];

  for (let nativeIndex = 0; nativeIndex < block.records.length; nativeIndex++) {
    const record = block.records[nativeIndex]!;
    if (
      !igraFieldIsPresent(record.gph) ||
      !igraFieldIsPresent(record.wdir) ||
      !igraFieldIsPresent(record.wspd)
    ) {
      continue;
    }

    assertUsableWindRanges(record.gph, record.wdir, record.wspd, nativeIndex);

    const wind = igraWindFromDirectionSpeed(record.wdir, record.wspd);
    retained.push({
      height: record.gph - spec.surfaceDatumGphM,
      eastward: wind.eastward,
      northward: wind.northward,
      nativeIndex,
    });
  }

  retained.sort((a, b) => {
    if (a.height !== b.height) {
      return a.height - b.height;
    }
    return a.nativeIndex - b.nativeIndex;
  });

  const levels: NormalizedWindLevel[] = retained.map(
    ({ height, eastward, northward }) => ({
      height,
      eastward,
      northward,
    }),
  );

  if (levels.length < 2) {
    throw new IgraAdapterError(
      "IGRA wind column has fewer than 2 usable GPH/WDIR/WSPD levels",
    );
  }

  for (let i = 1; i < levels.length; i++) {
    if (!(levels[i]!.height > levels[i - 1]!.height)) {
      throw new IgraAdapterError(
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
