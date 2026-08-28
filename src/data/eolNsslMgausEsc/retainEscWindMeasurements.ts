import type { EscObservedSoundingSpec } from "./escObservedSoundingSpec.js";
import {
  HIGH_RESOLUTION_MOBILE_ESC,
  type EscObservedWindMeasurementRecord,
  type EscRetainedWindSample,
} from "./escRetainedWindSample.js";
import {
  COVERAGE_GAP_THRESHOLD_M,
  ESC_MISSING_ALTITUDE,
  ESC_MISSING_WIND,
  ESC_QC_BAD,
  ESC_QC_MISSING,
  EscAdapterError,
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
  samples: readonly EscRetainedWindSample[],
): HeightGapSpan[] {
  const spans: HeightGapSpan[] = [];
  for (let i = 1; i < samples.length; i++) {
    const fromHeight = samples[i - 1]!.height;
    const toHeight = samples[i]!.height;
    const delta = roundToTenth(toHeight - fromHeight);
    if (delta > COVERAGE_GAP_THRESHOLD_M) {
      spans.push({ fromHeight, toHeight, delta });
    }
  }
  return spans;
}

export function retainEscWindMeasurements(
  block: EscSoundingBlock,
  spec: EscObservedSoundingSpec,
): {
  samples: EscRetainedWindSample[];
  coverage: EnvironmentalWindProfileCoverage;
} {
  const launchElevation = block.header.launchElevation;
  if (launchElevation !== spec.expectedLaunchElevationM) {
    throw new EscAdapterError(
      `${spec.utcReleaseTime} launch elevation must be ${spec.expectedLaunchElevationM}, got ${launchElevation}`,
    );
  }

  const samples: EscRetainedWindSample[] = [];
  for (const record of block.records) {
    if (!isUsableWindRecord(record)) {
      continue;
    }

    const height = roundToTenth(record.alt - spec.expectedLaunchElevationM);
    if (
      !Number.isFinite(height) ||
      !Number.isFinite(record.u) ||
      !Number.isFinite(record.v)
    ) {
      throw new EscAdapterError("normalized height or wind is not finite");
    }

    samples.push({
      time: record.time,
      height,
      eastward: record.u,
      northward: record.v,
    });
  }

  if (samples.length < 2) {
    throw new EscAdapterError(
      "ESC wind column has fewer than 2 usable U/V levels",
    );
  }

  for (let i = 1; i < samples.length; i++) {
    if (!(samples[i]!.height > samples[i - 1]!.height)) {
      throw new EscAdapterError(
        `normalized heights must be strictly increasing at index ${i}`,
      );
    }
  }

  const coverage: EnvironmentalWindProfileCoverage = {
    minHeight: samples[0]!.height,
    maxHeight: samples[samples.length - 1]!.height,
    nativeDataRecordCount: block.records.length,
    keptLevelCount: samples.length,
    droppedLevelCount: block.records.length - samples.length,
    gapSpansOver50m: gapSpansOver50m(samples),
  };

  return { samples, coverage };
}

export function sourceLevelsFromRetainedSamples(
  samples: readonly EscRetainedWindSample[],
): NormalizedWindLevel[] {
  return samples.map((sample) => ({
    height: sample.height,
    eastward: sample.eastward,
    northward: sample.northward,
  }));
}

export function escObservedWindMeasurementRecord(
  spec: EscObservedSoundingSpec,
  samples: readonly EscRetainedWindSample[],
): EscObservedWindMeasurementRecord {
  return {
    samples,
    provenance: {
      sourceIdentity: spec.sourceIdentity,
      samplingClass: HIGH_RESOLUTION_MOBILE_ESC,
      validTime: spec.validTime,
    },
  };
}
