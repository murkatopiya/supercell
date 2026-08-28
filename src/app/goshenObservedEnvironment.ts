import type { EnvironmentalWindProfile } from "../physics/environment/EnvironmentalWindProfile.js";
import type { EnvironmentalWindProfileRecord } from "../data/eolNsslMgausEsc/EnvironmentalWindProfileRecord.js";
import goshenGoldenJson from "../data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json";
import prospectGoldenJson from "../data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.normalized.json";
import dumasGoldenJson from "../data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.normalized.json";
import {
  nssl1Goshen2155Record,
  nssl1ProspectValley222346Record,
  nssl2Dumas215218Record,
} from "../data/eolNsslMgausEsc/toEnvironmentalWindProfileRecord.js";
import type { EscNormalizedGolden } from "../data/eolNsslMgausEsc/types.js";
import mooreGoldenJson from "../data/igra/fixtures/ounMoore20130520.normalized.json";
import { ounMoore20130520Record } from "../data/igra/ingestOunMoore20130520Igra.js";
import {
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
  type ExploreEnvironmentIdentity,
} from "../explore/exploreEnvironmentIdentity.js";

const goshenGolden = goshenGoldenJson as EscNormalizedGolden;
const prospectGolden = prospectGoldenJson as EscNormalizedGolden;
const dumasGolden = dumasGoldenJson as EscNormalizedGolden;
const mooreGolden = mooreGoldenJson as EscNormalizedGolden;

/**
 * Explore observed columns boot from committed goldens.
 * Native ESC / IGRA bytes are not a runtime input.
 */
export const GOSHEN_2009_OBSERVED_RECORD: EnvironmentalWindProfileRecord =
  nssl1Goshen2155Record(goshenGolden.levels, goshenGolden.coverage, {
    latitude: 41.278,
    longitude: -103.893,
  });

export const PROSPECT_VALLEY_2010_OBSERVED_RECORD: EnvironmentalWindProfileRecord =
  nssl1ProspectValley222346Record(
    prospectGolden.levels,
    prospectGolden.coverage,
    {
      latitude: 40.002,
      longitude: -103.594,
    },
  );

export const DUMAS_2010_OBSERVED_RECORD: EnvironmentalWindProfileRecord =
  nssl2Dumas215218Record(dumasGolden.levels, dumasGolden.coverage, {
    latitude: 35.691,
    longitude: -101.973,
  });

export const MOORE_2013_OBSERVED_RECORD: EnvironmentalWindProfileRecord =
  ounMoore20130520Record(mooreGolden.levels, mooreGolden.coverage, {
    latitude: 35.1808,
    longitude: -97.4378,
  });

const OBSERVED_RECORDS = {
  [EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED]: GOSHEN_2009_OBSERVED_RECORD,
  [EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED]:
    PROSPECT_VALLEY_2010_OBSERVED_RECORD,
  [EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED]: DUMAS_2010_OBSERVED_RECORD,
  [EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED]: MOORE_2013_OBSERVED_RECORD,
} as const;

export function exploreObservedEnvironmentRecord(
  identity: ExploreEnvironmentIdentity,
): EnvironmentalWindProfileRecord | undefined {
  if (identity === EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED) {
    return undefined;
  }
  return OBSERVED_RECORDS[identity];
}

export function exploreEnvironmentalWindProfile(
  identity: ExploreEnvironmentIdentity,
): EnvironmentalWindProfile | undefined {
  return exploreObservedEnvironmentRecord(identity)?.profile;
}
