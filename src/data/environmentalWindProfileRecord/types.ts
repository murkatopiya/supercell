export const COVERAGE_GAP_THRESHOLD_M = 50;

export interface NormalizedWindLevel {
  height: number;
  eastward: number;
  northward: number;
}

export interface HeightGapSpan {
  fromHeight: number;
  toHeight: number;
  delta: number;
}

export interface EnvironmentalWindProfileCoverage {
  minHeight: number;
  maxHeight: number;
  nativeDataRecordCount: number;
  keptLevelCount: number;
  droppedLevelCount: number;
  gapSpansOver50m: HeightGapSpan[];
}

export interface EnvironmentalWindProfileProvenance {
  sourceClass: "observed-raob";
  sourceIdentity: string;
  validTime: string;
  location: {
    latitude: number;
    longitude: number;
  };
  heightDatum: string;
  coverage: EnvironmentalWindProfileCoverage;
  nativeUnitsNote: string;
}
