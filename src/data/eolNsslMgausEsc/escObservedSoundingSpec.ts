export interface EscObservedSoundingSpec {
  siteIdIncludes: string;
  utcReleaseTime: string;
  expectedLaunchElevationM: number;
  sourceIdentity: string;
  validTime: string;
  heightDatum: string;
  nativeUnitsNote: string;
}

export const ESC_NATIVE_UNITS_NOTE =
  "ESC U/V m/s meteorological (eastward / northward)";

export const NSSL1_GOSHEN_2155_SPEC: EscObservedSoundingSpec = {
  siteIdIncludes: "NSSL1",
  utcReleaseTime: "2009, 06, 05, 21:55:22",
  expectedLaunchElevationM: 1557.9,
  sourceIdentity:
    "EOL 114.114 / DOI 10.5065/D6CC0Z0Q / Bushnell/NSSL1 / UTC 2009-06-05 21:55:22 / native concatenated NSSL_MGAUS_20090605.cls",
  validTime: "2009-06-05 21:55:22 UTC",
  heightDatum:
    "ESC Alt minus header launch elevation 1557.9 m, rounded to 0.1 m → world Y, implied flat ground",
  nativeUnitsNote: ESC_NATIVE_UNITS_NOTE,
};

export const NSSL1_PROSPECT_VALLEY_222346_SPEC: EscObservedSoundingSpec = {
  siteIdIncludes: "NSSL1",
  utcReleaseTime: "2010, 05, 26, 22:23:46",
  expectedLaunchElevationM: 1358.9,
  sourceIdentity:
    "EOL 114.114 / DOI 10.5065/D6CC0Z0Q / Mobile System/NSSL1 / UTC 2010-05-26 22:23:46 / native concatenated NSSL_MGAUS_20100526.cls",
  validTime: "2010-05-26 22:23:46 UTC",
  heightDatum:
    "ESC Alt minus header launch elevation 1358.9 m, rounded to 0.1 m → world Y, implied flat ground",
  nativeUnitsNote: ESC_NATIVE_UNITS_NOTE,
};

export const NSSL1_GOSHEN_2155_UTC = NSSL1_GOSHEN_2155_SPEC.utcReleaseTime;
export const NSSL1_GOSHEN_2155_LAUNCH_ELEVATION_M =
  NSSL1_GOSHEN_2155_SPEC.expectedLaunchElevationM;
