import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import { EscAnalysisError } from "./EscAnalysisError.js";
import { classifyAnalysisSupport } from "./classifyAnalysisSupport.js";
import { convolveHalfSampleMirror } from "./convolveHalfSampleMirror.js";
import {
  ESC_HR_TIME_BOUNDARY_POLICY,
  ESC_HR_TIME_CUTOFF_WAVELENGTH_S,
  ESC_HR_TIME_DOMAIN,
  ESC_HR_TIME_GAP_POLICY,
  ESC_HR_TIME_HALF_WIDTH_S,
  ESC_HR_TIME_OUTPUT_COORDINATE,
  ESC_HR_TIME_PHASE,
  ESC_HR_TIME_RESEARCH_PREDECESSOR,
  ESC_HR_TIME_SAMPLE_INTERVAL_S,
  ESC_HR_TIME_SAMPLING_CLASS,
  ESC_HR_TIME_SUPPORT_SEMANTICS,
  ESC_HR_TIME_TAP_COUNT,
  ESC_HR_TIME_TRANSFORM_ID,
  ESC_HR_TIME_TRANSFORM_VERSION,
  ESC_HR_TIME_WINDOW,
} from "./constants.js";
import { escHrTimeHammingSincKernel } from "./hammingSincKernel.js";
import { reconstructUniformTimeGrid } from "./reconstructUniformTimeGrid.js";
import type {
  AnalysisSupportState,
  EscHrTimeAnalysisColumn,
  EscHrTimeAnalysisInput,
  EscHrTimeAnalysisInputSample,
} from "./types.js";

function requireIntegerSecond(time: number, index: number): void {
  if (!Number.isFinite(time)) {
    throw new EscAnalysisError(`TIME[${index}] must be finite`);
  }
  if (!Number.isInteger(time)) {
    throw new EscAnalysisError(
      `TIME[${index}] must be an integer second, got ${time}`,
    );
  }
}

function validateTimeInvariants(
  samples: readonly EscHrTimeAnalysisInputSample[],
): void {
  if (samples.length === 0) {
    throw new EscAnalysisError("Analysis input has no retained samples");
  }
  for (let i = 0; i < samples.length; i++) {
    requireIntegerSecond(samples[i]!.time, i);
  }
  for (let i = 1; i < samples.length; i++) {
    if (!(samples[i]!.time > samples[i - 1]!.time)) {
      throw new EscAnalysisError(
        `TIME must be strictly increasing at index ${i}`,
      );
    }
  }
}

export function createEscHrTimeAnalysis(
  input: EscHrTimeAnalysisInput,
): EscHrTimeAnalysisColumn {
  if (input.samplingClass !== ESC_HR_TIME_SAMPLING_CLASS) {
    throw new EscAnalysisError(
      `esc-hr-time-hamming-sinc-lowpass/v1 requires sampling class ${ESC_HR_TIME_SAMPLING_CLASS}, got ${input.samplingClass}`,
    );
  }
  if (input.sourceIdentity.length === 0) {
    throw new EscAnalysisError("Analysis Source identity is missing");
  }

  validateTimeInvariants(input.samples);

  const firstTime = input.samples[0]!.time;
  const lastTime = input.samples[input.samples.length - 1]!.time;
  const durationS = lastTime - firstTime;
  if (durationS < ESC_HR_TIME_HALF_WIDTH_S * 2) {
    throw new EscAnalysisError(
      `sounding duration ${durationS} s is too short for ${ESC_HR_TIME_TAP_COUNT}-tap FULL_SUPPORT`,
    );
  }

  const grid = reconstructUniformTimeGrid(input.samples);
  if (grid.uniformN < ESC_HR_TIME_TAP_COUNT) {
    throw new EscAnalysisError(
      `uniform 1 s grid length ${grid.uniformN} is too short for ${ESC_HR_TIME_TAP_COUNT} taps`,
    );
  }

  const kernel = escHrTimeHammingSincKernel();
  const eastward = convolveHalfSampleMirror(
    grid.uniform.map((sample) => sample.eastward),
    kernel,
  );
  const northward = convolveHalfSampleMirror(
    grid.uniform.map((sample) => sample.northward),
    kernel,
  );
  const filteredByTime = new Map<number, { eastward: number; northward: number }>();
  for (let i = 0; i < grid.uniform.length; i++) {
    filteredByTime.set(grid.uniform[i]!.time, {
      eastward: eastward[i]!,
      northward: northward[i]!,
    });
  }

  const support: AnalysisSupportState[] = [];
  const levels = input.samples.map((sample) => {
    const filtered = filteredByTime.get(sample.time);
    if (!filtered) {
      throw new EscAnalysisError(
        `filtered series missing retained TIME ${sample.time}`,
      );
    }
    support.push(classifyAnalysisSupport(sample.time, firstTime, lastTime));
    return {
      height: sample.height,
      velocity: {
        eastward: filtered.eastward,
        northward: filtered.northward,
        vertical: 0,
      },
    };
  });

  return {
    profile: new EnvironmentalWindProfile(levels),
    support,
    provenance: {
      sourceIdentity: input.sourceIdentity,
      samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
      transformId: ESC_HR_TIME_TRANSFORM_ID,
      transformVersion: ESC_HR_TIME_TRANSFORM_VERSION,
      domain: ESC_HR_TIME_DOMAIN,
      cutoffWavelengthS: ESC_HR_TIME_CUTOFF_WAVELENGTH_S,
      sampleIntervalS: ESC_HR_TIME_SAMPLE_INTERVAL_S,
      tapCount: ESC_HR_TIME_TAP_COUNT,
      window: ESC_HR_TIME_WINDOW,
      phase: ESC_HR_TIME_PHASE,
      gapPolicy: ESC_HR_TIME_GAP_POLICY,
      interpolatedCount: grid.interpolatedCount,
      uniformN: grid.uniformN,
      interpolationFraction: grid.interpolationFraction,
      maxGapS: grid.maxGapS,
      boundaryPolicy: ESC_HR_TIME_BOUNDARY_POLICY,
      supportSemantics: ESC_HR_TIME_SUPPORT_SEMANTICS,
      outputCoordinate: ESC_HR_TIME_OUTPUT_COORDINATE,
      researchPredecessor: ESC_HR_TIME_RESEARCH_PREDECESSOR,
    },
  };
}
