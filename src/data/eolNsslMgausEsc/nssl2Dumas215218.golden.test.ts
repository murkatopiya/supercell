import { describe, expect, it } from "vitest";
import { soundingSegmentContainingHeight } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import { hodographPoints } from "../../physics/environment/hodograph.js";
import { verticalWindShearBetween } from "../../physics/environment/verticalWindShear.js";
import goldenJson from "./fixtures/nssl2Dumas215218.normalized.json";
import { nssl2Dumas215218Record } from "./toEnvironmentalWindProfileRecord.js";
import type { EscNormalizedGolden } from "./types.js";

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

describe("NSSL2 Dumas 215218 UTC normalized golden", () => {
  const golden = goldenJson as EscNormalizedGolden;
  const record = nssl2Dumas215218Record(golden.levels, golden.coverage, {
    latitude: 35.691,
    longitude: -101.973,
  });
  const { profile } = record;

  it("matches production coverage, identity, and endpoints", () => {
    expect(golden.coverage).toEqual({
      minHeight: -0.5,
      maxHeight: 16025.6,
      nativeDataRecordCount: 3022,
      keptLevelCount: 2917,
      droppedLevelCount: 105,
      gapSpansOver50m: [],
    });
    expect(golden.levels).toHaveLength(2917);
    expect(golden.levels[0]).toEqual({
      height: -0.5,
      eastward: 0.1,
      northward: -1.1,
    });
    expect(golden.levels[golden.levels.length - 1]).toEqual({
      height: 16025.6,
      eastward: 10.6,
      northward: -4.5,
    });
    expect(profile.minHeight).toBe(-0.5);
    expect(profile.maxHeight).toBe(16025.6);
    expect(profile.levelHeights()).toHaveLength(2917);
  });

  it("keeps a negative first usable height and does not invent Y=0", () => {
    expect(profile.minHeight).toBe(-0.5);
    expect(golden.levels.some((level) => level.height === 0)).toBe(false);
    expect(profile.levelHeights().includes(0)).toBe(false);
    expect(profile.maxHeight).toBeGreaterThan(12000);
  });

  it("keeps normalized heights strictly increasing in source order", () => {
    for (let i = 1; i < golden.levels.length; i++) {
      expect(golden.levels[i]!.height).toBeGreaterThan(
        golden.levels[i - 1]!.height,
      );
    }
  });

  it("samples selected heights from the golden knots", () => {
    expect(nearestLevel(golden.levels, 1000)).toEqual({
      height: 1000.1,
      eastward: 3,
      northward: 12.2,
    });
    expect(nearestLevel(golden.levels, 6000)).toEqual({
      height: 5998.1,
      eastward: 23.6,
      northward: 11.3,
    });
    expect(nearestLevel(golden.levels, 12000)).toEqual({
      height: 12000.2,
      eastward: 26.5,
      northward: -1.8,
    });
  });

  it("builds hodograph points from golden knots", () => {
    const points = hodographPoints(profile);
    expect(points).toHaveLength(2917);
    expect(points[0]).toEqual({
      height: -0.5,
      eastward: 0.1,
      northward: -1.1,
    });
  });

  it("maps profile vertical to 0 and interpolates inside support", () => {
    expect(profile.sampleAtHeight(-0.5)).toEqual({
      eastward: 0.1,
      northward: -1.1,
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

  it("refuses shear and sounding-segment lookup on clamped continuation", () => {
    expect(() => verticalWindShearBetween(profile, -10, 1000)).toThrow(
      /minHeight/,
    );
    expect(soundingSegmentContainingHeight(profile, -10)).toBeNull();
    expect(soundingSegmentContainingHeight(profile, 17000)).toBeNull();
    expect(soundingSegmentContainingHeight(profile, -0.5)).toEqual({
      hLo: -0.5,
      hHi: golden.levels[1]!.height,
    });
  });

  it("records locked Dumas provenance from the case spec and header location", () => {
    expect(record.provenance.sourceClass).toBe("observed-raob");
    expect(record.provenance.validTime).toBe("2010-05-18 21:52:18 UTC");
    expect(record.provenance.sourceIdentity).toBe(
      "EOL 114.114 / DOI 10.5065/D6CC0Z0Q / Mobile System/NSSL2 / UTC 2010-05-18 21:52:18 / native concatenated NSSL_MGAUS_20100518.cls",
    );
    expect(record.provenance.sourceIdentity).not.toMatch(/forward-flank/i);
    expect(record.provenance.location).toEqual({
      latitude: 35.691,
      longitude: -101.973,
    });
    expect(record.provenance.heightDatum).toContain("1122.1");
    expect(record.provenance.nativeUnitsNote).toContain("eastward / northward");
    expect(record.provenance.coverage.gapSpansOver50m).toEqual([]);
  });
});
