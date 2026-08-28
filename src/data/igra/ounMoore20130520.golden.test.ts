import { describe, expect, it } from "vitest";
import { soundingSegmentContainingHeight } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import { hodographPoints } from "../../physics/environment/hodograph.js";
import { verticalWindShearBetween } from "../../physics/environment/verticalWindShear.js";
import { igraWindFromDirectionSpeed } from "./convertIgraWind.js";
import goldenJson from "./fixtures/ounMoore20130520.normalized.json";
import { OUN_MOORE_20130520_SPEC } from "./igraObservedSoundingSpec.js";
import { ounMoore20130520Record } from "./ingestOunMoore20130520Igra.js";
import type {
  EnvironmentalWindProfileCoverage,
  NormalizedWindLevel,
} from "../environmentalWindProfileRecord/types.js";

interface IgraNormalizedGolden {
  levels: NormalizedWindLevel[];
  coverage: EnvironmentalWindProfileCoverage;
}

function countUpTo(
  levels: readonly NormalizedWindLevel[],
  maxHeight: number,
): number {
  return levels.filter((level) => level.height >= 0 && level.height <= maxHeight)
    .length;
}

describe("OUN Moore 2013-05-20 IGRA normalized golden", () => {
  const golden = goldenJson as IgraNormalizedGolden;
  const record = ounMoore20130520Record(golden.levels, golden.coverage, {
    latitude: 35.1808,
    longitude: -97.4378,
  });
  const { profile } = record;
  const surfaceWind = igraWindFromDirectionSpeed(185, 51);

  it("matches production coverage, count, and endpoints", () => {
    expect(golden.levels).toHaveLength(165);
    expect(golden.coverage.minHeight).toBe(0);
    expect(golden.coverage.maxHeight).toBe(30700);
    expect(golden.coverage.nativeDataRecordCount).toBe(165);
    expect(golden.coverage.keptLevelCount).toBe(165);
    expect(golden.coverage.droppedLevelCount).toBe(0);
    expect(golden.coverage.gapSpansOver50m).toHaveLength(144);
    expect(golden.levels[0]).toEqual({
      height: 0,
      eastward: surfaceWind.eastward,
      northward: surfaceWind.northward,
    });
    expect(golden.levels[golden.levels.length - 1]).toEqual({
      height: 30700,
      eastward: 2.7577599952283207,
      northward: 2.314035394871542,
    });
    expect(profile.minHeight).toBe(0);
    expect(profile.maxHeight).toBe(30700);
    expect(profile.levelHeights()).toHaveLength(165);
  });

  it("keeps the qualification low-level and 0–6 km counts", () => {
    expect(countUpTo(golden.levels, 200)).toBe(2);
    expect(countUpTo(golden.levels, 500)).toBe(5);
    expect(countUpTo(golden.levels, 1000)).toBe(7);
    expect(countUpTo(golden.levels, 3000)).toBe(24);
    expect(countUpTo(golden.levels, 6000)).toBe(38);
  });

  it("keeps normalized heights strictly increasing after the named sort", () => {
    for (let i = 1; i < golden.levels.length; i++) {
      expect(golden.levels[i]!.height).toBeGreaterThan(
        golden.levels[i - 1]!.height,
      );
    }
  });

  it("builds an EnvironmentalWindProfile and hodograph from golden knots", () => {
    const points = hodographPoints(profile);
    expect(points).toHaveLength(165);
    expect(points[0]).toEqual(golden.levels[0]);
    expect(points[points.length - 1]!.height).toBe(30700);
    expect(
      Number.isFinite(
        verticalWindShearBetween(profile, 0, 1000).shearEastward,
      ),
    ).toBe(true);
    expect(soundingSegmentContainingHeight(profile, 0)).toEqual({
      hLo: 0,
      hHi: golden.levels[1]!.height,
    });
  });

  it("records locked Moore provenance without reconstructing the storm", () => {
    expect(record.provenance.sourceClass).toBe("observed-raob");
    expect(record.provenance.sourceIdentity).toBe(
      OUN_MOORE_20130520_SPEC.sourceIdentity,
    );
    expect(record.provenance.validTime).toBe(OUN_MOORE_20130520_SPEC.validTime);
    expect(record.provenance.validTime).toContain("16:51");
    expect(record.provenance.validTime).toContain("HOUR 17");
    expect(record.provenance.validTime.includes("18 UTC")).toBe(false);
    expect(record.provenance.location).toEqual({
      latitude: 35.1808,
      longitude: -97.4378,
    });
    expect(record.provenance.heightDatum).toBe(
      OUN_MOORE_20130520_SPEC.heightDatum,
    );
    expect(record.provenance.nativeUnitsNote).toBe(
      OUN_MOORE_20130520_SPEC.nativeUnitsNote,
    );
    expect(record.provenance.sourceIdentity).not.toMatch(/tornado|supercell/i);
  });
});
