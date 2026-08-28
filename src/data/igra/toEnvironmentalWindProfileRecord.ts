import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import type { EnvironmentalWindProfileRecord } from "../environmentalWindProfileRecord/EnvironmentalWindProfileRecord.js";
import type {
  EnvironmentalWindProfileCoverage,
  NormalizedWindLevel,
} from "../environmentalWindProfileRecord/types.js";
import type { IgraObservedSoundingSpec } from "./igraObservedSoundingSpec.js";
import type { IgraHeader } from "./types.js";

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

export function observedIgraRecord(
  spec: IgraObservedSoundingSpec,
  levels: readonly NormalizedWindLevel[],
  coverage: EnvironmentalWindProfileCoverage,
  location: Pick<IgraHeader, "latitude" | "longitude">,
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
