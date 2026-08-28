import type { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";

export type AnalysisSupportState = "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";

export interface EscHrTimeAnalysisInputSample {
  time: number;
  height: number;
  eastward: number;
  northward: number;
}

export interface EscHrTimeAnalysisInput {
  samplingClass: string;
  sourceIdentity: string;
  samples: readonly EscHrTimeAnalysisInputSample[];
}

export interface EscHrTimeAnalysisProvenance {
  sourceIdentity: string;
  samplingClass: "high-resolution-mobile-esc";
  transformId: "esc-hr-time-hamming-sinc-lowpass";
  transformVersion: "v1";
  domain: "TIME";
  cutoffWavelengthS: 40;
  sampleIntervalS: 1;
  tapCount: 81;
  window: "Hamming";
  phase: "zero";
  gapPolicy: "integer-linear-uvh-max-5s";
  interpolatedCount: number;
  uniformN: number;
  interpolationFraction: number;
  maxGapS: number;
  boundaryPolicy: "half-sample-mirror";
  supportSemantics: "sample-level FULL_SUPPORT | BOUNDARY_CONDITIONED";
  outputCoordinate: "Source heights";
  researchPredecessor: "v0.1-research";
}

export interface EscHrTimeAnalysisColumn {
  profile: EnvironmentalWindProfile;
  support: readonly AnalysisSupportState[];
  provenance: EscHrTimeAnalysisProvenance;
}
