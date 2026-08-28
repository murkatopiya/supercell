import { EscAnalysisError } from "./EscAnalysisError.js";
import { ESC_HR_TIME_MAX_GAP_S } from "./constants.js";
import type { EscHrTimeAnalysisInputSample } from "./types.js";

export interface UniformTimeSample {
  time: number;
  height: number;
  eastward: number;
  northward: number;
  interpolated: boolean;
}

export interface UniformTimeGrid {
  uniform: UniformTimeSample[];
  interpolatedCount: number;
  uniformN: number;
  interpolationFraction: number;
  maxGapS: number;
}

function interpolateAtTime(
  left: EscHrTimeAnalysisInputSample,
  right: EscHrTimeAnalysisInputSample,
  time: number,
): UniformTimeSample {
  const weight = (time - left.time) / (right.time - left.time);
  return {
    time,
    height: left.height + weight * (right.height - left.height),
    eastward: left.eastward + weight * (right.eastward - left.eastward),
    northward: left.northward + weight * (right.northward - left.northward),
    interpolated: true,
  };
}

export function reconstructUniformTimeGrid(
  samples: readonly EscHrTimeAnalysisInputSample[],
): UniformTimeGrid {
  const firstTime = samples[0]!.time;
  const lastTime = samples[samples.length - 1]!.time;
  const observed = new Map<number, EscHrTimeAnalysisInputSample>();
  for (const sample of samples) {
    observed.set(sample.time, sample);
  }

  let interpolatedCount = 0;
  let maxGapS = 0;
  for (let i = 1; i < samples.length; i++) {
    const gap = samples[i]!.time - samples[i - 1]!.time;
    if (gap > maxGapS) {
      maxGapS = gap;
    }
    if (gap > ESC_HR_TIME_MAX_GAP_S) {
      throw new EscAnalysisError(
        `QC time gap ${gap} s exceeds maximum reconstructable ${ESC_HR_TIME_MAX_GAP_S} s`,
      );
    }
  }

  const uniform: UniformTimeSample[] = [];
  let leftIndex = 0;
  for (let time = firstTime; time <= lastTime; time += 1) {
    const observedSample = observed.get(time);
    if (observedSample) {
      uniform.push({
        time: observedSample.time,
        height: observedSample.height,
        eastward: observedSample.eastward,
        northward: observedSample.northward,
        interpolated: false,
      });
      while (
        leftIndex + 1 < samples.length &&
        samples[leftIndex + 1]!.time <= time
      ) {
        leftIndex += 1;
      }
      continue;
    }

    while (
      leftIndex + 1 < samples.length &&
      samples[leftIndex + 1]!.time < time
    ) {
      leftIndex += 1;
    }
    const left = samples[leftIndex]!;
    const right = samples[leftIndex + 1]!;
    uniform.push(interpolateAtTime(left, right, time));
    interpolatedCount += 1;
  }

  const uniformN = uniform.length;
  return {
    uniform,
    interpolatedCount,
    uniformN,
    interpolationFraction: interpolatedCount / uniformN,
    maxGapS,
  };
}
