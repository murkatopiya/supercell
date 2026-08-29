import type { EnvironmentalWindProfile } from "../physics/environment/EnvironmentalWindProfile.js";
import type { EnvironmentalWindProfileRecord } from "../data/eolNsslMgausEsc/EnvironmentalWindProfileRecord.js";
import {
  NSSL1_GOSHEN_2155_SPEC,
  NSSL1_PROSPECT_VALLEY_222346_SPEC,
  NSSL2_DUMAS_215218_SPEC,
} from "../data/eolNsslMgausEsc/escObservedSoundingSpec.js";
import type { EscNormalizedGolden } from "../data/eolNsslMgausEsc/types.js";
import goshenGoldenJson from "../data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json";
import goshenTimeJson from "../data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.retained-time.json";
import prospectGoldenJson from "../data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.normalized.json";
import prospectTimeJson from "../data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.retained-time.json";
import dumasGoldenJson from "../data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.normalized.json";
import dumasTimeJson from "../data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.retained-time.json";
import { ESC_HR_TIME_SAMPLING_CLASS } from "../data/escHrTimeAnalysis/constants.js";
import { createEscHrTimeAnalysis } from "../data/escHrTimeAnalysis/createEscHrTimeAnalysis.js";
import type {
  EscHrTimeAnalysisColumn,
  EscHrTimeAnalysisInputSample,
} from "../data/escHrTimeAnalysis/types.js";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
  type ExploreEnvironmentIdentity,
} from "../explore/exploreEnvironmentIdentity.js";
import {
  exploreEnvironmentalWindProfile,
  exploreObservedEnvironmentRecord,
} from "./goshenObservedEnvironment.js";

interface RetainedTimeGolden {
  times: number[];
}

/**
 * Explore Source + Analysis sibling for one selected identity.
 *
 * SOURCE ADVECTS. ANALYSIS EXPLAINS.
 * Analysis is not a VelocityField operand and does not replace Source EWP.
 */
export interface ExploreEnvironmentRepresentations {
  readonly identity: ExploreEnvironmentIdentity;
  readonly sourceRecord: EnvironmentalWindProfileRecord | undefined;
  readonly sourceProfile: EnvironmentalWindProfile | undefined;
  readonly analysisColumn: EscHrTimeAnalysisColumn | null;
}

function analysisInputSamples(
  golden: EscNormalizedGolden,
  times: readonly number[],
): EscHrTimeAnalysisInputSample[] {
  if (golden.levels.length !== times.length) {
    throw new Error(
      `retained TIME length ${times.length} does not match Source golden levels ${golden.levels.length}`,
    );
  }
  return golden.levels.map((level, index) => ({
    time: times[index]!,
    height: level.height,
    eastward: level.eastward,
    northward: level.northward,
  }));
}

function analysisColumnFromCommittedEsc(
  sourceIdentity: string,
  golden: EscNormalizedGolden,
  times: readonly number[],
): EscHrTimeAnalysisColumn {
  return createEscHrTimeAnalysis({
    samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
    sourceIdentity,
    samples: analysisInputSamples(golden, times),
  });
}

/**
 * Matching ESC HR Analysis columns boot from the same committed Source
 * goldens plus retained-TIME siblings. Not reconstructed from Source EWP.
 */
export const GOSHEN_2009_ANALYSIS_COLUMN: EscHrTimeAnalysisColumn =
  analysisColumnFromCommittedEsc(
    NSSL1_GOSHEN_2155_SPEC.sourceIdentity,
    goshenGoldenJson as EscNormalizedGolden,
    (goshenTimeJson as RetainedTimeGolden).times,
  );

export const PROSPECT_VALLEY_2010_ANALYSIS_COLUMN: EscHrTimeAnalysisColumn =
  analysisColumnFromCommittedEsc(
    NSSL1_PROSPECT_VALLEY_222346_SPEC.sourceIdentity,
    prospectGoldenJson as EscNormalizedGolden,
    (prospectTimeJson as RetainedTimeGolden).times,
  );

export const DUMAS_2010_ANALYSIS_COLUMN: EscHrTimeAnalysisColumn =
  analysisColumnFromCommittedEsc(
    NSSL2_DUMAS_215218_SPEC.sourceIdentity,
    dumasGoldenJson as EscNormalizedGolden,
    (dumasTimeJson as RetainedTimeGolden).times,
  );

/**
 * Analysis diagnostic sibling for the selected Explore environment.
 * Moore and Demo have no production Analysis column: null.
 * Null means COLUMN_UNAVAILABLE, not a zero column and not Source T1.
 */
export function exploreAnalysisColumn(
  identity: ExploreEnvironmentIdentity,
): EscHrTimeAnalysisColumn | null {
  switch (identity) {
    case EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED:
      return GOSHEN_2009_ANALYSIS_COLUMN;
    case EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED:
      return PROSPECT_VALLEY_2010_ANALYSIS_COLUMN;
    case EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED:
      return DUMAS_2010_ANALYSIS_COLUMN;
    case EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED:
    case EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED:
      return null;
  }
}

export function exploreEnvironmentRepresentations(
  identity: ExploreEnvironmentIdentity = DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
): ExploreEnvironmentRepresentations {
  return {
    identity,
    sourceRecord: exploreObservedEnvironmentRecord(identity),
    sourceProfile: exploreEnvironmentalWindProfile(identity),
    analysisColumn: exploreAnalysisColumn(identity),
  };
}
