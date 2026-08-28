import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import type { EnvironmentalWindProfileRecord } from "./EnvironmentalWindProfileRecord.js";
import {
  NSSL1_GOSHEN_2155_SPEC,
  NSSL1_PROSPECT_VALLEY_222346_SPEC,
  type EscObservedSoundingSpec,
} from "./escObservedSoundingSpec.js";
import type {
  EnvironmentalWindProfileCoverage,
  EscHeader,
  NormalizedWindLevel,
} from "./types.js";

export const NSSL1_GOSHEN_2155_SOURCE_IDENTITY =
  NSSL1_GOSHEN_2155_SPEC.sourceIdentity;
export const NSSL1_GOSHEN_2155_HEIGHT_DATUM =
  NSSL1_GOSHEN_2155_SPEC.heightDatum;
export const NSSL1_GOSHEN_2155_NATIVE_UNITS_NOTE =
  NSSL1_GOSHEN_2155_SPEC.nativeUnitsNote;

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

export function observedEscRecord(
  spec: EscObservedSoundingSpec,
  levels: readonly NormalizedWindLevel[],
  coverage: EnvironmentalWindProfileCoverage,
  location: Pick<EscHeader, "latitude" | "longitude">,
): EnvironmentalWindProfileRecord {
  return {
    profile: environmentalWindProfileFromNormalizedLevels(levels),
    provenance: {
      sourceClass: "observed-raob",
      sourceIdentity: spec.sourceIdentity,
      validTime: spec.validTime,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      heightDatum: spec.heightDatum,
      coverage,
      nativeUnitsNote: spec.nativeUnitsNote,
    },
  };
}

export function nssl1Goshen2155Record(
  levels: readonly NormalizedWindLevel[],
  coverage: EnvironmentalWindProfileCoverage,
  location: Pick<EscHeader, "latitude" | "longitude">,
): EnvironmentalWindProfileRecord {
  return observedEscRecord(NSSL1_GOSHEN_2155_SPEC, levels, coverage, location);
}

export function nssl1ProspectValley222346Record(
  levels: readonly NormalizedWindLevel[],
  coverage: EnvironmentalWindProfileCoverage,
  location: Pick<EscHeader, "latitude" | "longitude">,
): EnvironmentalWindProfileRecord {
  return observedEscRecord(
    NSSL1_PROSPECT_VALLEY_222346_SPEC,
    levels,
    coverage,
    location,
  );
}
