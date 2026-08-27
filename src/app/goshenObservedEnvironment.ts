import type { EnvironmentalWindProfile } from "../physics/environment/EnvironmentalWindProfile.js";
import type { EnvironmentalWindProfileRecord } from "../data/eolNsslMgausEsc/EnvironmentalWindProfileRecord.js";
import goldenJson from "../data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json";
import { nssl1Goshen2155Record } from "../data/eolNsslMgausEsc/toEnvironmentalWindProfileRecord.js";
import type { GoshenNormalizedGolden } from "../data/eolNsslMgausEsc/types.js";
import {
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  type ExploreEnvironmentIdentity,
} from "../explore/exploreEnvironmentIdentity.js";

const golden = goldenJson as GoshenNormalizedGolden;

/**
 * I2 boots the observed Goshen column from the committed golden.
 * Native ESC campaign bytes are not a runtime input.
 */
export const GOSHEN_2009_OBSERVED_RECORD: EnvironmentalWindProfileRecord =
  nssl1Goshen2155Record(golden.levels, golden.coverage, {
    latitude: 41.278,
    longitude: -103.893,
  });

export function exploreEnvironmentalWindProfile(
  identity: ExploreEnvironmentIdentity,
): EnvironmentalWindProfile | undefined {
  return identity === EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED
    ? GOSHEN_2009_OBSERVED_RECORD.profile
    : undefined;
}
