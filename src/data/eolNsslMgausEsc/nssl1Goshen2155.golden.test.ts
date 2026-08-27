import { describe, expect, it } from "vitest";
import { soundingSegmentContainingHeight } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import { hodographPoints } from "../../physics/environment/hodograph.js";
import { stormRelativeHelicityBetween } from "../../physics/environment/stormRelativeHelicity.js";
import { verticalWindShearBetween } from "../../physics/environment/verticalWindShear.js";
import goldenJson from "./fixtures/nssl1Goshen2155.normalized.json";
import { nssl1Goshen2155Record } from "./toEnvironmentalWindProfileRecord.js";
import type { GoshenNormalizedGolden } from "./types.js";

function nearestLevel(
  levels: readonly { height: number; eastward: number; northward: number }[],
  height: number,
) {
  return levels.reduce((best, level) =>
    Math.abs(level.height - height) < Math.abs(best.height - height)
      ? level
      : best,
  );
}

describe("NSSL1 Goshen 2155 UTC normalized golden", () => {
  const golden = goldenJson as GoshenNormalizedGolden;
  const record = nssl1Goshen2155Record(golden.levels, golden.coverage, {
    latitude: 41.278,
    longitude: -103.893,
  });
  const { profile } = record;

  it("matches forensic coverage and endpoints", () => {
    expect(golden.coverage).toEqual({
      minHeight: 2.4,
      maxHeight: 12261.8,
      nativeDataRecordCount: 2082,
      keptLevelCount: 2029,
      droppedLevelCount: 53,
      gapSpansOver50m: [],
    });
    expect(golden.levels).toHaveLength(2029);
    expect(golden.levels[0]).toEqual({
      height: 2.4,
      eastward: -1.2,
      northward: 0.2,
    });
    expect(golden.levels[golden.levels.length - 1]).toEqual({
      height: 12261.8,
      eastward: 26.8,
      northward: 5.7,
    });
    expect(profile.minHeight).toBe(2.4);
    expect(profile.maxHeight).toBe(12261.8);
    expect(profile.levelHeights()).toHaveLength(2029);
  });

  it("does not start at Y=0 and is not truncated at 6 km or 12 km", () => {
    expect(profile.minHeight).toBeGreaterThan(0);
    expect(profile.maxHeight).toBeGreaterThan(12000);
    expect(nearestLevel(golden.levels, 6000).eastward).toBe(27.7);
    expect(nearestLevel(golden.levels, 12000).eastward).toBe(36.5);
  });

  it("samples selected heights from the golden knots", () => {
    expect(nearestLevel(golden.levels, 1000)).toEqual({
      height: 998.6,
      eastward: -0.2,
      northward: 10.1,
    });
    expect(nearestLevel(golden.levels, 6000)).toEqual({
      height: 6002.0,
      eastward: 27.7,
      northward: 8.6,
    });
    expect(nearestLevel(golden.levels, 12000)).toEqual({
      height: 12005.2,
      eastward: 36.5,
      northward: 0.7,
    });
  });

  it("builds hodograph points from golden knots, not DEMO", () => {
    const points = hodographPoints(profile);
    expect(points).toHaveLength(2029);
    expect(points[0]).toEqual({
      height: 2.4,
      eastward: -1.2,
      northward: 0.2,
    });
    expect(points[points.length - 1]).toEqual({
      height: 12261.8,
      eastward: 26.8,
      northward: 5.7,
    });
  });

  it("clamps below minHeight and interpolates inside support", () => {
    expect(profile.sampleAtHeight(0)).toEqual({
      eastward: -1.2,
      northward: 0.2,
      vertical: 0,
    });
    expect(profile.sampleAtHeight(13000)).toEqual({
      eastward: 26.8,
      northward: 5.7,
      vertical: 0,
    });

    const lower = golden.levels[0]!;
    const upper = golden.levels[1]!;
    const mid = (lower.height + upper.height) / 2;
    const sampled = profile.sampleAtHeight(mid);
    expect(sampled.eastward).toBeCloseTo(
      (lower.eastward + upper.eastward) / 2,
      12,
    );
    expect(sampled.northward).toBeCloseTo(
      (lower.northward + upper.northward) / 2,
      12,
    );
    expect(sampled.vertical).toBe(0);
  });

  it("refuses shear, SRH, and sounding-segment lookup on clamped continuation", () => {
    expect(() => verticalWindShearBetween(profile, 0, 1000)).toThrow(
      /minHeight/,
    );
    expect(() =>
      stormRelativeHelicityBetween(
        profile,
        { eastward: 10, northward: 0 },
        0,
        1000,
      ),
    ).toThrow(/minHeight/);
    expect(soundingSegmentContainingHeight(profile, 0)).toBeNull();
    expect(soundingSegmentContainingHeight(profile, 13000)).toBeNull();
    expect(soundingSegmentContainingHeight(profile, 2.4)).toEqual({
      hLo: 2.4,
      hHi: golden.levels[1]!.height,
    });
  });

  it("records locked Goshen provenance without treating balloon drift as a sampling axis", () => {
    expect(record.provenance.sourceClass).toBe("observed-raob");
    expect(record.provenance.location).toEqual({
      latitude: 41.278,
      longitude: -103.893,
    });
    expect(record.provenance.heightDatum).toContain("1557.9");
    expect(record.provenance.coverage.gapSpansOver50m).toEqual([]);
  });
});
