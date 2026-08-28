import { describe, expect, it } from "vitest";
import { soundingSegmentContainingHeight } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import { hodographPoints } from "../../physics/environment/hodograph.js";
import { verticalWindShearBetween } from "../../physics/environment/verticalWindShear.js";
import goldenJson from "./fixtures/nssl1ProspectValley222346.normalized.json";
import { nssl1ProspectValley222346Record } from "./toEnvironmentalWindProfileRecord.js";
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

describe("NSSL1 Prospect Valley 222346 UTC normalized golden", () => {
  const golden = goldenJson as EscNormalizedGolden;
  const record = nssl1ProspectValley222346Record(golden.levels, golden.coverage, {
    latitude: 40.002,
    longitude: -103.594,
  });
  const { profile } = record;

  it("matches production coverage, identity, and endpoints", () => {
    expect(golden.coverage).toEqual({
      minHeight: -0.1,
      maxHeight: 14017.9,
      nativeDataRecordCount: 2824,
      keptLevelCount: 2733,
      droppedLevelCount: 91,
      gapSpansOver50m: [],
    });
    expect(golden.levels).toHaveLength(2733);
    expect(golden.levels[0]).toEqual({
      height: -0.1,
      eastward: -0.2,
      northward: 2,
    });
    expect(golden.levels[golden.levels.length - 1]).toEqual({
      height: 14017.9,
      eastward: 14.7,
      northward: 18.3,
    });
    expect(profile.minHeight).toBe(-0.1);
    expect(profile.maxHeight).toBe(14017.9);
    expect(profile.levelHeights()).toHaveLength(2733);
  });

  it("keeps a negative first usable height and does not invent Y=0", () => {
    expect(profile.minHeight).toBe(-0.1);
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
      height: 1000.2,
      eastward: -6.5,
      northward: 12.6,
    });
    expect(nearestLevel(golden.levels, 6000)).toEqual({
      height: 5999,
      eastward: 13.3,
      northward: 9.8,
    });
    expect(nearestLevel(golden.levels, 12000)).toEqual({
      height: 12000.8,
      eastward: 22.9,
      northward: 13.1,
    });
  });

  it("builds hodograph points from golden knots", () => {
    const points = hodographPoints(profile);
    expect(points).toHaveLength(2733);
    expect(points[0]).toEqual({
      height: -0.1,
      eastward: -0.2,
      northward: 2,
    });
  });

  it("maps profile vertical to 0 and interpolates inside support", () => {
    expect(profile.sampleAtHeight(-0.1)).toEqual({
      eastward: -0.2,
      northward: 2,
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
    expect(soundingSegmentContainingHeight(profile, 15000)).toBeNull();
    expect(soundingSegmentContainingHeight(profile, -0.1)).toEqual({
      hLo: -0.1,
      hHi: golden.levels[1]!.height,
    });
  });

  it("records locked Prospect provenance from the case spec and header location", () => {
    expect(record.provenance.sourceClass).toBe("observed-raob");
    expect(record.provenance.validTime).toBe("2010-05-26 22:23:46 UTC");
    expect(record.provenance.sourceIdentity).toBe(
      "EOL 114.114 / DOI 10.5065/D6CC0Z0Q / Mobile System/NSSL1 / UTC 2010-05-26 22:23:46 / native concatenated NSSL_MGAUS_20100526.cls",
    );
    expect(record.provenance.location).toEqual({
      latitude: 40.002,
      longitude: -103.594,
    });
    expect(record.provenance.heightDatum).toContain("1358.9");
    expect(record.provenance.nativeUnitsNote).toContain("eastward / northward");
    expect(record.provenance.coverage.gapSpansOver50m).toEqual([]);
  });
});
