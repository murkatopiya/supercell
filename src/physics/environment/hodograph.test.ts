import { describe, expect, it } from "vitest";
import {
  EnvironmentalWindProfile,
  EnvironmentalWindProfileError,
} from "./EnvironmentalWindProfile.js";
import {
  hodographPointAtHeight,
  hodographPoints,
  hodographSegments,
  type HodographPoint,
} from "./hodograph.js";

function profileOf(
  levels: Array<{
    height: number;
    eastward: number;
    northward: number;
  }>,
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

describe("hodograph", () => {
  const profile = profileOf([
    { height: 0, eastward: 5, northward: 0 },
    { height: 1000, eastward: 10, northward: 5 },
    { height: 2000, eastward: 15, northward: 10 },
  ]);

  describe("hodographPoints", () => {
    it("returns points strictly ascending by height", () => {
      const points = hodographPoints(profile);
      for (let i = 1; i < points.length; i++) {
        expect(points[i]!.height).toBeGreaterThan(points[i - 1]!.height);
      }
    });

    it("matches profile knots exactly via levelHeights and sampleAtHeight", () => {
      const heights = profile.levelHeights();
      const points = hodographPoints(profile);

      expect(points).toHaveLength(heights.length);
      for (let i = 0; i < heights.length; i++) {
        const h = heights[i]!;
        const sampled = profile.sampleAtHeight(h);
        expect(points[i]).toEqual({
          height: h,
          eastward: sampled.eastward,
          northward: sampled.northward,
        });
      }
    });

    it("returns a defensive snapshot", () => {
      const first = hodographPoints(profile);
      first.push({ height: 9999, eastward: 0, northward: 0 });
      first[0]!.eastward = -999;

      expect(hodographPoints(profile)).toEqual([
        { height: 0, eastward: 5, northward: 0 },
        { height: 1000, eastward: 10, northward: 5 },
        { height: 2000, eastward: 15, northward: 10 },
      ]);
    });

    it("exposes only height, eastward, and northward fields", () => {
      for (const point of hodographPoints(profile)) {
        expect(Object.keys(point).sort()).toEqual([
          "eastward",
          "height",
          "northward",
        ]);
      }
    });
  });

  describe("hodographSegments", () => {
    it("connects adjacent knot points by structural equality", () => {
      const points = hodographPoints(profile);
      const segments = hodographSegments(profile);

      expect(segments).toHaveLength(points.length - 1);

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]!;
        expect(segment.lower).toEqual(points[i]);
        expect(segment.upper).toEqual(points[i + 1]);
        expect(segment.upper.height).toBeGreaterThan(segment.lower.height);
      }
    });

    it("does not require object identity with hodographPoints entries", () => {
      const points = hodographPoints(profile);
      const segments = hodographSegments(profile);

      expect(segments[0]!.lower).toEqual(points[0]);
      expect(segments[0]!.lower).not.toBe(points[0]);
    });

    it("returns a defensive snapshot", () => {
      const segments = hodographSegments(profile);
      segments.push({
        lower: { height: 0, eastward: 0, northward: 0 },
        upper: { height: 1, eastward: 1, northward: 1 },
      });
      segments[0]!.lower.eastward = -999;

      expect(hodographSegments(profile)).toHaveLength(2);
      expect(hodographSegments(profile)[0]!.lower.eastward).toBe(5);
    });

    it("exposes only lower and upper point fields", () => {
      for (const segment of hodographSegments(profile)) {
        expect(Object.keys(segment).sort()).toEqual(["lower", "upper"]);
        expect(Object.keys(segment.lower).sort()).toEqual([
          "eastward",
          "height",
          "northward",
        ]);
        expect(Object.keys(segment.upper).sort()).toEqual([
          "eastward",
          "height",
          "northward",
        ]);
      }
    });
  });

  describe("hodographPointAtHeight", () => {
    it("preserves requested height and matches sampleAtHeight velocity", () => {
      const h = 1500;
      const sampled = profile.sampleAtHeight(h);
      const point = hodographPointAtHeight(profile, h);

      expect(point).toEqual({
        height: h,
        eastward: sampled.eastward,
        northward: sampled.northward,
      });
      expect(point.height).toBe(h);
    });

    it("keeps requested height below min while clamping velocity", () => {
      const h = -100;
      const sampled = profile.sampleAtHeight(h);
      const point = hodographPointAtHeight(profile, h);

      expect(point.height).toBe(h);
      expect(point.eastward).toBe(sampled.eastward);
      expect(point.northward).toBe(sampled.northward);
      expect(point).toEqual({
        height: h,
        eastward: 5,
        northward: 0,
      });
    });

    it("keeps requested height above max while clamping velocity", () => {
      const h = 5000;
      const sampled = profile.sampleAtHeight(h);
      const point = hodographPointAtHeight(profile, h);

      expect(point.height).toBe(h);
      expect(point.eastward).toBe(sampled.eastward);
      expect(point.northward).toBe(sampled.northward);
      expect(point).toEqual({
        height: h,
        eastward: 15,
        northward: 10,
      });
    });

    it("rejects non-finite height as EnvironmentalWindProfileError", () => {
      expect(() => hodographPointAtHeight(profile, Number.NaN)).toThrow(
        EnvironmentalWindProfileError,
      );
      expect(() =>
        hodographPointAtHeight(profile, Number.POSITIVE_INFINITY),
      ).toThrow(EnvironmentalWindProfileError);
      expect(() =>
        hodographPointAtHeight(profile, Number.NEGATIVE_INFINITY),
      ).toThrow(EnvironmentalWindProfileError);
    });
  });

  it("does not include storm-relative or diagnostic fields on points", () => {
    const point: HodographPoint = hodographPoints(profile)[0]!;
    const keys = Object.keys(point);

    expect(keys).not.toContain("stormMotion");
    expect(keys).not.toContain("eastwardStormRelative");
    expect(keys).not.toContain("northwardStormRelative");
    expect(keys).not.toContain("shearEastward");
    expect(keys).not.toContain("shearNorthward");
    expect(keys).not.toContain("srh");
    expect(keys).not.toContain("x");
    expect(keys).not.toContain("z");
  });
});
