export {
  NSSL1_GOSHEN_2155_LAUNCH_ELEVATION_M,
  NSSL1_GOSHEN_2155_UTC,
} from "./escObservedSoundingSpec.js";
export type { EscObservedSoundingSpec } from "./escObservedSoundingSpec.js";
export { COVERAGE_GAP_THRESHOLD_M } from "../environmentalWindProfileRecord/types.js";
export type {
  EnvironmentalWindProfileCoverage,
  EnvironmentalWindProfileProvenance,
  HeightGapSpan,
  NormalizedWindLevel,
} from "../environmentalWindProfileRecord/types.js";

import type {
  EnvironmentalWindProfileCoverage,
  NormalizedWindLevel,
} from "../environmentalWindProfileRecord/types.js";

export const ESC_MISSING_WIND = 9999.0;
export const ESC_MISSING_ALTITUDE = 99999.0;
export const ESC_QC_MISSING = 9.0;
export const ESC_QC_BAD = 3.0;

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

export interface EscNormalizedGolden {
  levels: NormalizedWindLevel[];
  coverage: EnvironmentalWindProfileCoverage;
}

export type GoshenNormalizedGolden = EscNormalizedGolden;
