import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import type { EnvironmentalWindProfileRecord } from "./EnvironmentalWindProfileRecord.js";
import type {
  EnvironmentalWindProfileCoverage,
  EscHeader,
  NormalizedWindLevel,
} from "./types.js";

export const NSSL1_GOSHEN_2155_SOURCE_IDENTITY =
  "EOL 114.114 / DOI 10.5065/D6CC0Z0Q / Bushnell/NSSL1 / UTC 2009-06-05 21:55:22 / native concatenated NSSL_MGAUS_20090605.cls";

export const NSSL1_GOSHEN_2155_HEIGHT_DATUM =
  "ESC Alt minus header launch elevation 1557.9 m, rounded to 0.1 m → world Y, implied flat ground";

export const NSSL1_GOSHEN_2155_NATIVE_UNITS_NOTE =
  "ESC U/V m/s meteorological (eastward / northward)";

export function environmentalWindProfileFromNormalizedLevels(
  levels: readonly NormalizedWindLevel[],
): EnvironmentalWindProfile {
  return new EnvironmentalWindProfile(
    levels.map((level) => ({
      height: level.height,
      velocity: {
        eastward: level.eastward,
        northward: level.northward,
        vertical: 0,
      },
    })),
  );
}

export function nssl1Goshen2155Record(
  levels: readonly NormalizedWindLevel[],
  coverage: EnvironmentalWindProfileCoverage,
  location: Pick<EscHeader, "latitude" | "longitude">,
): EnvironmentalWindProfileRecord {
  return {
    profile: environmentalWindProfileFromNormalizedLevels(levels),
    provenance: {
      sourceClass: "observed-raob",
      sourceIdentity: NSSL1_GOSHEN_2155_SOURCE_IDENTITY,
      validTime: "2009-06-05 21:55:22 UTC",
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      heightDatum: NSSL1_GOSHEN_2155_HEIGHT_DATUM,
      coverage,
      nativeUnitsNote: NSSL1_GOSHEN_2155_NATIVE_UNITS_NOTE,
    },
  };
}
