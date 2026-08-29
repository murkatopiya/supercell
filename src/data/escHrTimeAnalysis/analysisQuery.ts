import type { AtmosphericVelocity } from "../../core/math/AtmosphericVelocity.js";
import type { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import {
  horizontalVorticityFromShear,
  type HorizontalVorticity,
} from "../../physics/environment/horizontalVorticity.js";
import {
  verticalWindShearBetween,
  type HorizontalWindShear,
} from "../../physics/environment/verticalWindShear.js";
import { EscAnalysisError } from "./EscAnalysisError.js";
import type {
  AnalysisSupportState,
  EscHrTimeAnalysisColumn,
  EscHrTimeAnalysisProvenance,
} from "./types.js";

/**
 * Diagnostic / query validity. Distinct from sample-level FILTER support
 * (`AnalysisSupportState` on the column). Architecture 60.
 */
export type AnalysisDiagnosticStatus =
  | "FULL_SUPPORT"
  | "BOUNDARY_CONDITIONED"
  | "OUT_OF_DOMAIN"
  | "COLUMN_UNAVAILABLE";

export const ANALYSIS_QUERY_REPRESENTATION = "Analysis";
export const NATIVE_CONTAINING_SEGMENT_METHOD = "native-containing-segment";

export interface AnalysisNativeContainingSegment {
  readonly hLo: number;
  readonly hHi: number;
}

export type AnalysisColumnUnavailableResult = {
  readonly status: "COLUMN_UNAVAILABLE";
};

export type AnalysisOutOfDomainResult = {
  readonly status: "OUT_OF_DOMAIN";
  readonly representation: typeof ANALYSIS_QUERY_REPRESENTATION;
  readonly provenance: EscHrTimeAnalysisProvenance;
};

export type AnalysisWindQueryResult =
  | {
      readonly status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
      readonly representation: typeof ANALYSIS_QUERY_REPRESENTATION;
      readonly wind: AtmosphericVelocity;
      readonly provenance: EscHrTimeAnalysisProvenance;
    }
  | AnalysisOutOfDomainResult
  | AnalysisColumnUnavailableResult;

export type AnalysisNativeSegmentShearResult =
  | {
      readonly status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
      readonly representation: typeof ANALYSIS_QUERY_REPRESENTATION;
      readonly method: typeof NATIVE_CONTAINING_SEGMENT_METHOD;
      readonly segment: AnalysisNativeContainingSegment;
      readonly shear: HorizontalWindShear;
      readonly provenance: EscHrTimeAnalysisProvenance;
    }
  | AnalysisOutOfDomainResult
  | AnalysisColumnUnavailableResult;

export type AnalysisNativeSegmentVorticityResult =
  | {
      readonly status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
      readonly representation: typeof ANALYSIS_QUERY_REPRESENTATION;
      readonly method: typeof NATIVE_CONTAINING_SEGMENT_METHOD;
      readonly segment: AnalysisNativeContainingSegment;
      readonly vorticity: HorizontalVorticity;
      readonly provenance: EscHrTimeAnalysisProvenance;
    }
  | AnalysisOutOfDomainResult
  | AnalysisColumnUnavailableResult;

function assertFiniteHeight(height: number): void {
  if (!Number.isFinite(height)) {
    throw new EscAnalysisError("height must be finite");
  }
}

function requireColumnInvariants(column: EscHrTimeAnalysisColumn): number[] {
  const heights = column.profile.levelHeights();
  if (column.support.length !== heights.length) {
    throw new EscAnalysisError(
      "Analysis support length must match profile knots",
    );
  }
  return heights;
}

function knotIndexAtExactHeight(
  heights: readonly number[],
  height: number,
): number | null {
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] === height) {
      return i;
    }
  }
  return null;
}

function interpolationKnotIndices(
  heights: readonly number[],
  height: number,
): readonly [number, number] {
  for (let i = 0; i < heights.length - 1; i++) {
    if (heights[i]! < height && height < heights[i + 1]!) {
      return [i, i + 1];
    }
  }
  throw new EscAnalysisError(
    "in-domain height has no interpolation bracket",
  );
}

function diagnosticSupportFromFilterKnots(
  supports: readonly AnalysisSupportState[],
): "FULL_SUPPORT" | "BOUNDARY_CONDITIONED" {
  for (const support of supports) {
    if (support === "BOUNDARY_CONDITIONED") {
      return "BOUNDARY_CONDITIONED";
    }
  }
  return "FULL_SUPPORT";
}

/**
 * Production containing-segment contract (`26` §6.1):
 * half-open [h_i, h_{i+1}) except the last segment [h_{n-1}, h_n].
 * Interior knots select the upper segment. No clamp, no extrapolation.
 *
 * Duplicated here so Analysis queries do not depend on T1 runtime.
 * Equivalence is pinned in tests against soundingSegmentContainingHeight.
 */
function nativeContainingSegment(
  profile: EnvironmentalWindProfile,
  height: number,
): AnalysisNativeContainingSegment | null {
  const heights = profile.levelHeights();
  const minHeight = heights[0]!;
  const maxHeight = heights[heights.length - 1]!;

  if (height < minHeight || height > maxHeight) {
    return null;
  }

  const lastIndex = heights.length - 1;
  for (let i = 0; i < lastIndex - 1; i++) {
    const hLo = heights[i]!;
    const hHi = heights[i + 1]!;
    if (height >= hLo && height < hHi) {
      return { hLo, hHi };
    }
  }

  return {
    hLo: heights[lastIndex - 1]!,
    hHi: heights[lastIndex]!,
  };
}

export function queryAnalysisWindAt(
  column: EscHrTimeAnalysisColumn | null | undefined,
  height: number,
): AnalysisWindQueryResult {
  assertFiniteHeight(height);
  if (column == null) {
    return { status: "COLUMN_UNAVAILABLE" };
  }

  const heights = requireColumnInvariants(column);
  const profile = column.profile;
  if (height < profile.minHeight || height > profile.maxHeight) {
    return {
      status: "OUT_OF_DOMAIN",
      representation: ANALYSIS_QUERY_REPRESENTATION,
      provenance: column.provenance,
    };
  }

  const exactIndex = knotIndexAtExactHeight(heights, height);
  const knotSupports =
    exactIndex === null
      ? interpolationKnotIndices(heights, height).map(
          (index) => column.support[index]!,
        )
      : [column.support[exactIndex]!];

  return {
    status: diagnosticSupportFromFilterKnots(knotSupports),
    representation: ANALYSIS_QUERY_REPRESENTATION,
    wind: profile.sampleAtHeight(height),
    provenance: column.provenance,
  };
}

export function queryAnalysisNativeSegmentShearAt(
  column: EscHrTimeAnalysisColumn | null | undefined,
  height: number,
): AnalysisNativeSegmentShearResult {
  assertFiniteHeight(height);
  if (column == null) {
    return { status: "COLUMN_UNAVAILABLE" };
  }

  const heights = requireColumnInvariants(column);
  const segment = nativeContainingSegment(column.profile, height);
  if (segment === null) {
    return {
      status: "OUT_OF_DOMAIN",
      representation: ANALYSIS_QUERY_REPRESENTATION,
      provenance: column.provenance,
    };
  }

  const iLo = knotIndexAtExactHeight(heights, segment.hLo);
  const iHi = knotIndexAtExactHeight(heights, segment.hHi);
  if (iLo === null || iHi === null) {
    throw new EscAnalysisError(
      "containing-segment endpoints must be Analysis knots",
    );
  }

  return {
    status: diagnosticSupportFromFilterKnots([
      column.support[iLo]!,
      column.support[iHi]!,
    ]),
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    segment,
    shear: verticalWindShearBetween(
      column.profile,
      segment.hLo,
      segment.hHi,
    ),
    provenance: column.provenance,
  };
}

export function queryAnalysisNativeSegmentVorticityAt(
  column: EscHrTimeAnalysisColumn | null | undefined,
  height: number,
): AnalysisNativeSegmentVorticityResult {
  const shearResult = queryAnalysisNativeSegmentShearAt(column, height);
  if (
    shearResult.status === "COLUMN_UNAVAILABLE" ||
    shearResult.status === "OUT_OF_DOMAIN"
  ) {
    return shearResult;
  }

  return {
    status: shearResult.status,
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    segment: shearResult.segment,
    vorticity: horizontalVorticityFromShear(shearResult.shear),
    provenance: shearResult.provenance,
  };
}
