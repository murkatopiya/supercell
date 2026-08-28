export const HIGH_RESOLUTION_MOBILE_ESC = "high-resolution-mobile-esc";

export type HighResolutionMobileEscSamplingClass =
  typeof HIGH_RESOLUTION_MOBILE_ESC;

export interface EscRetainedWindSample {
  time: number;
  height: number;
  eastward: number;
  northward: number;
}

export interface EscObservedWindMeasurementProvenance {
  sourceIdentity: string;
  samplingClass: HighResolutionMobileEscSamplingClass;
  validTime: string;
}

export interface EscObservedWindMeasurementRecord {
  samples: readonly EscRetainedWindSample[];
  provenance: EscObservedWindMeasurementProvenance;
}
