export const NSSL1_GOSHEN_2155_UTC = "2009, 06, 05, 21:55:22";
export const NSSL1_GOSHEN_2155_LAUNCH_ELEVATION_M = 1557.9;

export const ESC_MISSING_WIND = 9999.0;
export const ESC_MISSING_ALTITUDE = 99999.0;
export const ESC_QC_MISSING = 9.0;
export const ESC_QC_BAD = 3.0;
export const COVERAGE_GAP_THRESHOLD_M = 50;

export class EscAdapterError extends Error {
  readonly name = "EscAdapterError";

  constructor(message: string) {
    super(message);
  }
}

export interface EscHeader {
  siteId: string;
  utcReleaseTime: string;
  longitude: number;
  latitude: number;
  launchElevation: number;
}

export interface EscDataRecord {
  time: number;
  u: number;
  v: number;
  alt: number;
  qu: number;
  qv: number;
}

export interface EscSoundingBlock {
  header: EscHeader;
  records: EscDataRecord[];
}

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

export interface GoshenNormalizedGolden {
  levels: NormalizedWindLevel[];
  coverage: EnvironmentalWindProfileCoverage;
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
