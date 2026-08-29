import { describe, expect, it } from "vitest";
import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import { soundingSegmentContainingHeight } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import { horizontalVorticityFromShear } from "../../physics/environment/horizontalVorticity.js";
import { verticalWindShearBetween } from "../../physics/environment/verticalWindShear.js";
import { OUN_MOORE_20130520_SPEC } from "../igra/igraObservedSoundingSpec.js";
import analysisQuerySrc from "./analysisQuery.ts?raw";
import {
  ANALYSIS_QUERY_REPRESENTATION,
  NATIVE_CONTAINING_SEGMENT_METHOD,
  queryAnalysisNativeSegmentShearAt,
  queryAnalysisNativeSegmentVorticityAt,
  queryAnalysisWindAt,
} from "./analysisQuery.js";
import { EscAnalysisError } from "./EscAnalysisError.js";
import { COARSE_OPERATIONAL_RAOB, ESC_HR_TIME_SAMPLING_CLASS } from "./constants.js";
import { createEscHrTimeAnalysis } from "./createEscHrTimeAnalysis.js";
import type { EscHrTimeAnalysisColumn, EscHrTimeAnalysisInputSample } from "./types.js";

function rampSamples(
  firstTime: number,
  lastTime: number,
): EscHrTimeAnalysisInputSample[] {
  const samples: EscHrTimeAnalysisInputSample[] = [];
  for (let time = firstTime; time <= lastTime; time += 1) {
    samples.push({
      time,
      height: 10 + time * 5,
      eastward: time * 0.1,
      northward: 2 + time * 0.02,
    });
  }
  return samples;
}

function syntheticColumn(): EscHrTimeAnalysisColumn {
  return createEscHrTimeAnalysis({
    samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
    sourceIdentity: "synthetic-ramp",
    samples: rampSamples(0, 120),
  });
}

function heightAtTime(time: number): number {
  return 10 + time * 5;
}

describe("queryAnalysisWindAt", () => {
  it("returns COLUMN_UNAVAILABLE without inventing Analysis wind", () => {
    const missing = queryAnalysisWindAt(null, 100);
    expect(missing).toEqual({ status: "COLUMN_UNAVAILABLE" });
    expect("wind" in missing).toBe(false);
    expect("provenance" in missing).toBe(false);

    const undef = queryAnalysisWindAt(undefined, 100);
    expect(undef.status).toBe("COLUMN_UNAVAILABLE");
  });

  it("rejects non-finite height as a broken invariant", () => {
    expect(() => queryAnalysisWindAt(syntheticColumn(), Number.NaN)).toThrow(
      EscAnalysisError,
    );
    expect(() =>
      queryAnalysisWindAt(syntheticColumn(), Number.POSITIVE_INFINITY),
    ).toThrow(/height must be finite/);
  });

  it("returns OUT_OF_DOMAIN below minHeight without clamp-as-FULL", () => {
    const column = syntheticColumn();
    const below = column.profile.minHeight - 1;
    const result = queryAnalysisWindAt(column, below);
    expect(result.status).toBe("OUT_OF_DOMAIN");
    if (result.status !== "OUT_OF_DOMAIN") {
      throw new Error("expected OUT_OF_DOMAIN");
    }
    expect(result.representation).toBe(ANALYSIS_QUERY_REPRESENTATION);
    expect(result.provenance).toBe(column.provenance);
    expect("wind" in result).toBe(false);
    const clamped = column.profile.sampleAtHeight(below);
    const first = column.profile.sampleAtHeight(column.profile.minHeight);
    expect(clamped).toEqual(first);
  });

  it("returns OUT_OF_DOMAIN above maxHeight without clamp-as-FULL", () => {
    const column = syntheticColumn();
    const above = column.profile.maxHeight + 1;
    const result = queryAnalysisWindAt(column, above);
    expect(result.status).toBe("OUT_OF_DOMAIN");
    expect("wind" in result).toBe(false);
  });

  it("treats first and last knots as in-domain exact knots, not clamp", () => {
    const column = syntheticColumn();
    const firstH = column.profile.minHeight;
    const lastH = column.profile.maxHeight;
    const first = queryAnalysisWindAt(column, firstH);
    const last = queryAnalysisWindAt(column, lastH);
    expect(first.status).toBe("BOUNDARY_CONDITIONED");
    expect(last.status).toBe("BOUNDARY_CONDITIONED");
    if (first.status === "COLUMN_UNAVAILABLE" || first.status === "OUT_OF_DOMAIN") {
      throw new Error("expected in-domain wind");
    }
    if (last.status === "COLUMN_UNAVAILABLE" || last.status === "OUT_OF_DOMAIN") {
      throw new Error("expected in-domain wind");
    }
    expect(first.wind).toEqual(column.profile.sampleAtHeight(firstH));
    expect(last.wind).toEqual(column.profile.sampleAtHeight(lastH));
  });

  it("returns FULL wind at an exact FILTER FULL_SUPPORT knot", () => {
    const column = syntheticColumn();
    const height = heightAtTime(40);
    const result = queryAnalysisWindAt(column, height);
    expect(column.support[40]).toBe("FULL_SUPPORT");
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL_SUPPORT");
    }
    expect(result.wind).toEqual(column.profile.sampleAtHeight(height));
    expect(result.representation).toBe("Analysis");
    expect(result.provenance).toBe(column.provenance);
  });

  it("returns BOUNDARY wind at an exact FILTER BOUNDARY_CONDITIONED knot", () => {
    const column = syntheticColumn();
    const height = heightAtTime(0);
    expect(queryAnalysisWindAt(column, height).status).toBe(
      "BOUNDARY_CONDITIONED",
    );
  });

  it("interpolates FULL between two FULL knots", () => {
    const column = syntheticColumn();
    const h0 = heightAtTime(50);
    const h1 = heightAtTime(51);
    const mid = (h0 + h1) / 2;
    expect(column.support[50]).toBe("FULL_SUPPORT");
    expect(column.support[51]).toBe("FULL_SUPPORT");
    const result = queryAnalysisWindAt(column, mid);
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL_SUPPORT");
    }
    expect(result.wind).toEqual(column.profile.sampleAtHeight(mid));
  });

  it("interpolates BOUNDARY between FULL and BOUNDARY knots", () => {
    const column = syntheticColumn();
    const hFull = heightAtTime(40);
    const hBoundary = heightAtTime(39);
    expect(column.support[40]).toBe("FULL_SUPPORT");
    expect(column.support[39]).toBe("BOUNDARY_CONDITIONED");
    const mid = (hFull + hBoundary) / 2;
    expect(queryAnalysisWindAt(column, mid).status).toBe(
      "BOUNDARY_CONDITIONED",
    );
  });

  it("interpolates BOUNDARY between two BOUNDARY knots", () => {
    const column = syntheticColumn();
    const mid = (heightAtTime(0) + heightAtTime(1)) / 2;
    expect(column.support[0]).toBe("BOUNDARY_CONDITIONED");
    expect(column.support[1]).toBe("BOUNDARY_CONDITIONED");
    expect(queryAnalysisWindAt(column, mid).status).toBe(
      "BOUNDARY_CONDITIONED",
    );
  });

  it("does not treat a nearby non-identical height as an exact knot", () => {
    const column = syntheticColumn();
    const knot = heightAtTime(50);
    const nearby = knot + 0.25;
    expect(nearby === knot).toBe(false);
    const result = queryAnalysisWindAt(column, nearby);
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL_SUPPORT");
    }
    expect(result.wind).toEqual(column.profile.sampleAtHeight(nearby));
    expect(result.wind).not.toEqual(column.profile.sampleAtHeight(knot));
  });
});

describe("queryAnalysisNativeSegmentShearAt / vorticity", () => {
  it("returns COLUMN_UNAVAILABLE without a zero vorticity substitute", () => {
    const shear = queryAnalysisNativeSegmentShearAt(null, 200);
    const vorticity = queryAnalysisNativeSegmentVorticityAt(null, 200);
    expect(shear).toEqual({ status: "COLUMN_UNAVAILABLE" });
    expect(vorticity).toEqual({ status: "COLUMN_UNAVAILABLE" });
    expect("shear" in shear).toBe(false);
    expect("vorticity" in vorticity).toBe(false);
  });

  it("returns OUT_OF_DOMAIN outside the sounding, not ω_h = 0", () => {
    const column = syntheticColumn();
    const below = queryAnalysisNativeSegmentVorticityAt(
      column,
      column.profile.minHeight - 10,
    );
    const above = queryAnalysisNativeSegmentVorticityAt(
      column,
      column.profile.maxHeight + 10,
    );
    expect(below.status).toBe("OUT_OF_DOMAIN");
    expect(above.status).toBe("OUT_OF_DOMAIN");
    expect("vorticity" in below).toBe(false);
    expect("vorticity" in above).toBe(false);
  });

  it("matches production containing-segment lookup including interior-knot upper segment", () => {
    const column = syntheticColumn();
    const heights = column.profile.levelHeights();
    const samples = [
      heights[0]!,
      heights[1]!,
      (heights[40]! + heights[41]!) / 2,
      heights[40]!,
      heights[heights.length - 2]!,
      heights[heights.length - 1]!,
    ];
    for (const height of samples) {
      const expected = soundingSegmentContainingHeight(column.profile, height);
      const shear = queryAnalysisNativeSegmentShearAt(column, height);
      expect(expected).not.toBeNull();
      if (shear.status === "COLUMN_UNAVAILABLE" || shear.status === "OUT_OF_DOMAIN") {
        throw new Error(`expected in-domain segment at ${height}`);
      }
      expect(shear.segment).toEqual(expected);
      expect(shear.method).toBe(NATIVE_CONTAINING_SEGMENT_METHOD);
    }
    expect(soundingSegmentContainingHeight(column.profile, heights[0]! - 1)).toBeNull();
  });

  it("uses the existing two-point shear identity and vorticity map", () => {
    const column = syntheticColumn();
    const height = (heightAtTime(50) + heightAtTime(51)) / 2;
    const shear = queryAnalysisNativeSegmentShearAt(column, height);
    const vorticity = queryAnalysisNativeSegmentVorticityAt(column, height);
    if (shear.status === "COLUMN_UNAVAILABLE" || shear.status === "OUT_OF_DOMAIN") {
      throw new Error("expected in-domain shear");
    }
    if (
      vorticity.status === "COLUMN_UNAVAILABLE" ||
      vorticity.status === "OUT_OF_DOMAIN"
    ) {
      throw new Error("expected in-domain vorticity");
    }
    const expectedShear = verticalWindShearBetween(
      column.profile,
      shear.segment.hLo,
      shear.segment.hHi,
    );
    expect(shear.shear).toEqual(expectedShear);
    expect(vorticity.vorticity).toEqual(horizontalVorticityFromShear(expectedShear));
    expect(vorticity.status).toBe(shear.status);
  });

  it("FULL–FULL native segment is FULL shear and FULL ω_h", () => {
    const column = syntheticColumn();
    const height = (heightAtTime(50) + heightAtTime(51)) / 2;
    expect(queryAnalysisNativeSegmentShearAt(column, height).status).toBe(
      "FULL_SUPPORT",
    );
    expect(queryAnalysisNativeSegmentVorticityAt(column, height).status).toBe(
      "FULL_SUPPORT",
    );
  });

  it("BOUNDARY–BOUNDARY native segment is BOUNDARY shear and ω_h", () => {
    const column = syntheticColumn();
    const height = (heightAtTime(0) + heightAtTime(1)) / 2;
    expect(queryAnalysisNativeSegmentShearAt(column, height).status).toBe(
      "BOUNDARY_CONDITIONED",
    );
    expect(queryAnalysisNativeSegmentVorticityAt(column, height).status).toBe(
      "BOUNDARY_CONDITIONED",
    );
  });

  it("BOUNDARY–FULL mixed segment is BOUNDARY shear and ω_h", () => {
    const column = syntheticColumn();
    const height = (heightAtTime(39) + heightAtTime(40)) / 2;
    expect(column.support[39]).toBe("BOUNDARY_CONDITIONED");
    expect(column.support[40]).toBe("FULL_SUPPORT");
    expect(queryAnalysisNativeSegmentShearAt(column, height).status).toBe(
      "BOUNDARY_CONDITIONED",
    );
  });

  it("FULL–BOUNDARY mixed segment is BOUNDARY shear and ω_h", () => {
    const column = syntheticColumn();
    const height = (heightAtTime(80) + heightAtTime(81)) / 2;
    expect(column.support[80]).toBe("FULL_SUPPORT");
    expect(column.support[81]).toBe("BOUNDARY_CONDITIONED");
    expect(queryAnalysisNativeSegmentShearAt(column, height).status).toBe(
      "BOUNDARY_CONDITIONED",
    );
  });

  it("FIR FULL_SUPPORT at a knot does not imply derivative FULL_SUPPORT", () => {
    const column = syntheticColumn();
    const lastFullTime = 80;
    const height = heightAtTime(lastFullTime);
    expect(column.support[80]).toBe("FULL_SUPPORT");
    expect(column.support[81]).toBe("BOUNDARY_CONDITIONED");

    const wind = queryAnalysisWindAt(column, height);
    const shear = queryAnalysisNativeSegmentShearAt(column, height);
    const vorticity = queryAnalysisNativeSegmentVorticityAt(column, height);

    expect(wind.status).toBe("FULL_SUPPORT");
    expect(shear.status).toBe("BOUNDARY_CONDITIONED");
    expect(vorticity.status).toBe("BOUNDARY_CONDITIONED");
    if (shear.status !== "BOUNDARY_CONDITIONED") {
      throw new Error("expected BOUNDARY derivative");
    }
    expect(shear.segment).toEqual({
      hLo: heightAtTime(80),
      hHi: heightAtTime(81),
    });
    expect(soundingSegmentContainingHeight(column.profile, height)).toEqual(
      shear.segment,
    );
  });

  it("first FULL knot uses the upper segment (Architecture 26)", () => {
    const column = syntheticColumn();
    const height = heightAtTime(40);
    const shear = queryAnalysisNativeSegmentShearAt(column, height);
    if (shear.status === "COLUMN_UNAVAILABLE" || shear.status === "OUT_OF_DOMAIN") {
      throw new Error("expected in-domain shear");
    }
    expect(shear.segment).toEqual({
      hLo: heightAtTime(40),
      hHi: heightAtTime(41),
    });
    expect(shear.status).toBe("FULL_SUPPORT");
    expect(queryAnalysisWindAt(column, height).status).toBe("FULL_SUPPORT");
  });

  it("last knot uses the last segment (upper endpoint policy)", () => {
    const column = syntheticColumn();
    const heights = column.profile.levelHeights();
    const last = heights[heights.length - 1]!;
    const prev = heights[heights.length - 2]!;
    const shear = queryAnalysisNativeSegmentShearAt(column, last);
    if (shear.status === "COLUMN_UNAVAILABLE" || shear.status === "OUT_OF_DOMAIN") {
      throw new Error("expected in-domain last knot");
    }
    expect(shear.segment).toEqual({ hLo: prev, hHi: last });
    expect(shear.status).toBe("BOUNDARY_CONDITIONED");
  });

  it("does not import a Source profile or T1 sample path", () => {
    expect(analysisQuerySrc).not.toMatch(/goshenObservedEnvironment/);
    expect(analysisQuerySrc).not.toMatch(/DiagnosticTiltingTendency[^.]/);
    expect(analysisQuerySrc).not.toMatch(/stormRelativeHelicity/);
    expect(analysisQuerySrc).not.toMatch(/hodograph/);
  });
});

describe("Moore / coarse-operational-raob is not an Analysis column", () => {
  it("does not invent TIME, transform, Source fallback, or Analysis ω_h", () => {
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: COARSE_OPERATIONAL_RAOB,
        sourceIdentity: OUN_MOORE_20130520_SPEC.sourceIdentity,
        samples: rampSamples(0, 120),
      }),
    ).toThrow(EscAnalysisError);

    const source = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 5, northward: 10, vertical: 0 },
      },
      {
        height: 3000,
        velocity: { eastward: 15, northward: 20, vertical: 0 },
      },
    ]);
    const result = queryAnalysisNativeSegmentVorticityAt(null, 1500);
    expect(result.status).toBe("COLUMN_UNAVAILABLE");
    expect("vorticity" in result).toBe(false);
    const sourceShear = verticalWindShearBetween(source, 0, 3000);
    expect(sourceShear.shearEastward).not.toBe(0);
  });
});
