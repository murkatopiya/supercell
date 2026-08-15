import { describe, expect, it } from "vitest";
import {
  EnvironmentalWindProfile,
  EnvironmentalWindProfileError,
  type EnvironmentalWindLevel,
} from "./EnvironmentalWindProfile.js";

function level(
  height: number,
  eastward: number,
  northward: number,
  vertical = 0,
): EnvironmentalWindLevel {
  return {
    height,
    velocity: { eastward, northward, vertical },
  };
}

describe("EnvironmentalWindProfile", () => {
  const twoLevels: EnvironmentalWindLevel[] = [
    level(1000, 10, 0),
    level(2000, 20, 10),
  ];

  describe("height bounds", () => {
    it("exposes minHeight and maxHeight without changing sampling", () => {
      const profile = new EnvironmentalWindProfile(twoLevels);

      expect(profile.minHeight).toBe(1000);
      expect(profile.maxHeight).toBe(2000);
      expect(profile.sampleAtHeight(0)).toEqual({
        eastward: 10,
        northward: 0,
        vertical: 0,
      });
      expect(profile.sampleAtHeight(3000)).toEqual({
        eastward: 20,
        northward: 10,
        vertical: 0,
      });
    });
  });

  describe("valid sampling", () => {
    it("returns exact velocity at each level height", () => {
      const profile = new EnvironmentalWindProfile([
        level(0, 5, 0),
        level(1000, 10, 5),
        level(2000, 15, 10),
      ]);

      expect(profile.sampleAtHeight(0)).toEqual({
        eastward: 5,
        northward: 0,
        vertical: 0,
      });
      expect(profile.sampleAtHeight(1000)).toEqual({
        eastward: 10,
        northward: 5,
        vertical: 0,
      });
      expect(profile.sampleAtHeight(2000)).toEqual({
        eastward: 15,
        northward: 10,
        vertical: 0,
      });
    });

    it("linearly interpolates at the midpoint", () => {
      const profile = new EnvironmentalWindProfile(twoLevels);

      expect(profile.sampleAtHeight(1500)).toEqual({
        eastward: 15,
        northward: 5,
        vertical: 0,
      });
    });

    it("linearly interpolates at a non-mid fraction", () => {
      const profile = new EnvironmentalWindProfile(twoLevels);

      expect(profile.sampleAtHeight(1250)).toEqual({
        eastward: 12.5,
        northward: 2.5,
        vertical: 0,
      });
    });

    it("interpolates inside a middle segment of a 3-level profile", () => {
      const profile = new EnvironmentalWindProfile([
        level(0, 0, 0),
        level(1000, 10, 0),
        level(2000, 10, 20),
      ]);

      expect(profile.sampleAtHeight(1500)).toEqual({
        eastward: 10,
        northward: 10,
        vertical: 0,
      });
      expect(profile.sampleAtHeight(1000)).toEqual({
        eastward: 10,
        northward: 0,
        vertical: 0,
      });
    });

    it("clamps below the lowest level", () => {
      const profile = new EnvironmentalWindProfile(twoLevels);
      const atMin = profile.sampleAtHeight(1000);

      expect(profile.sampleAtHeight(0)).toEqual(atMin);
      expect(profile.sampleAtHeight(-100)).toEqual(atMin);
    });

    it("clamps above the highest level", () => {
      const profile = new EnvironmentalWindProfile(twoLevels);
      const atMax = profile.sampleAtHeight(2000);

      expect(profile.sampleAtHeight(2500)).toEqual(atMax);
      expect(profile.sampleAtHeight(1e6)).toEqual(atMax);
    });

    it("allows a profile that does not start at height 0", () => {
      const profile = new EnvironmentalWindProfile([
        level(500, 4, 1),
        level(1500, 8, 3),
      ]);

      expect(profile.sampleAtHeight(100)).toEqual({
        eastward: 4,
        northward: 1,
        vertical: 0,
      });
      expect(profile.sampleAtHeight(1000)).toEqual({
        eastward: 6,
        northward: 2,
        vertical: 0,
      });
    });

    it("accepts vertical -0 as zero at construction", () => {
      const profile = new EnvironmentalWindProfile([
        { height: 0, velocity: { eastward: 1, northward: 0, vertical: -0 } },
        { height: 100, velocity: { eastward: 2, northward: 0, vertical: 0 } },
      ]);

      expect(profile.sampleAtHeight(0).vertical).toBe(0);
    });

    it("is unaffected by mutating the input levels after construction", () => {
      const input: EnvironmentalWindLevel[] = [
        level(0, 1, 0),
        level(1000, 2, 0),
      ];
      const profile = new EnvironmentalWindProfile(input);

      input[0]!.height = 999;
      input[0]!.velocity.eastward = 99;
      input.push(level(2000, 3, 0));

      expect(profile.sampleAtHeight(0)).toEqual({
        eastward: 1,
        northward: 0,
        vertical: 0,
      });
      expect(profile.sampleAtHeight(500)).toEqual({
        eastward: 1.5,
        northward: 0,
        vertical: 0,
      });
    });

    it("returns an independent AtmosphericVelocity each call", () => {
      const profile = new EnvironmentalWindProfile(twoLevels);
      const first = profile.sampleAtHeight(1500);
      first.eastward = 999;
      first.northward = 999;
      first.vertical = 999;

      expect(profile.sampleAtHeight(1500)).toEqual({
        eastward: 15,
        northward: 5,
        vertical: 0,
      });
    });
  });

  describe("levelHeights", () => {
    it("returns all knot heights ascending", () => {
      const profile = new EnvironmentalWindProfile([
        level(0, 0, 0),
        level(1000, 10, 0),
        level(2000, 10, 20),
        level(3000, 5, 20),
      ]);

      expect(profile.levelHeights()).toEqual([0, 1000, 2000, 3000]);
    });

    it("returns a defensive snapshot that does not alias internal state", () => {
      const profile = new EnvironmentalWindProfile(twoLevels);
      const heights = profile.levelHeights();
      heights.push(9999);
      heights[0] = -1;

      expect(profile.levelHeights()).toEqual([1000, 2000]);
      expect(profile.minHeight).toBe(1000);
      expect(profile.maxHeight).toBe(2000);
    });

    it("does not expose velocities — only heights", () => {
      const profile = new EnvironmentalWindProfile(twoLevels);
      const heights = profile.levelHeights();

      expect(heights.every((h) => typeof h === "number")).toBe(true);
      expect(Object.keys(heights)).toEqual(["0", "1"]);
    });
  });

  describe("interiorLevelHeightsBetween", () => {
    const multi = new EnvironmentalWindProfile([
      level(0, 0, 0),
      level(1000, 10, 0),
      level(2000, 10, 20),
      level(3000, 5, 20),
    ]);

    it("returns ascending knot heights strictly inside the open interval", () => {
      expect(multi.interiorLevelHeightsBetween(0, 3000)).toEqual([
        1000, 2000,
      ]);
      expect(multi.interiorLevelHeightsBetween(500, 2500)).toEqual([
        1000, 2000,
      ]);
      expect(multi.interiorLevelHeightsBetween(1000, 2000)).toEqual([]);
    });

    it("does not include the interval endpoints even when they are knots", () => {
      expect(multi.interiorLevelHeightsBetween(1000, 3000)).toEqual([2000]);
      expect(multi.interiorLevelHeightsBetween(0, 2000)).toEqual([1000]);
    });

    it("returns an empty array when no knots lie strictly inside", () => {
      expect(multi.interiorLevelHeightsBetween(100, 900)).toEqual([]);
      expect(multi.interiorLevelHeightsBetween(0, 1000)).toEqual([]);
    });

    it("returns a new array that does not alias internal state", () => {
      const heights = multi.interiorLevelHeightsBetween(0, 3000);
      heights.push(9999);
      heights[0] = -1;

      expect(multi.interiorLevelHeightsBetween(0, 3000)).toEqual([
        1000, 2000,
      ]);
    });

    it("rejects non-finite bounds and non-increasing intervals", () => {
      expect(() => multi.interiorLevelHeightsBetween(Number.NaN, 1000)).toThrow(
        EnvironmentalWindProfileError,
      );
      expect(() =>
        multi.interiorLevelHeightsBetween(0, Number.POSITIVE_INFINITY),
      ).toThrow(EnvironmentalWindProfileError);
      expect(() => multi.interiorLevelHeightsBetween(1000, 1000)).toThrow(
        EnvironmentalWindProfileError,
      );
      expect(() => multi.interiorLevelHeightsBetween(2000, 1000)).toThrow(
        EnvironmentalWindProfileError,
      );
    });
  });

  describe("invalid construction", () => {
    it("rejects fewer than two levels", () => {
      expect(() => new EnvironmentalWindProfile([])).toThrow(
        EnvironmentalWindProfileError,
      );
      expect(() => new EnvironmentalWindProfile([level(0, 1, 0)])).toThrow(
        EnvironmentalWindProfileError,
      );
    });

    it("rejects duplicate heights", () => {
      expect(
        () =>
          new EnvironmentalWindProfile([level(1000, 1, 0), level(1000, 2, 0)]),
      ).toThrow(EnvironmentalWindProfileError);
    });

    it("rejects non-increasing heights", () => {
      expect(
        () =>
          new EnvironmentalWindProfile([level(2000, 1, 0), level(1000, 2, 0)]),
      ).toThrow(EnvironmentalWindProfileError);
    });

    it("rejects non-finite heights", () => {
      expect(
        () =>
          new EnvironmentalWindProfile([
            level(Number.NaN, 1, 0),
            level(1000, 2, 0),
          ]),
      ).toThrow(EnvironmentalWindProfileError);
      expect(
        () =>
          new EnvironmentalWindProfile([
            level(0, 1, 0),
            level(Number.POSITIVE_INFINITY, 2, 0),
          ]),
      ).toThrow(EnvironmentalWindProfileError);
    });

    it("rejects non-finite velocity components", () => {
      expect(
        () =>
          new EnvironmentalWindProfile([
            level(0, Number.NaN, 0),
            level(1000, 2, 0),
          ]),
      ).toThrow(EnvironmentalWindProfileError);
      expect(
        () =>
          new EnvironmentalWindProfile([
            level(0, 1, Number.NEGATIVE_INFINITY),
            level(1000, 2, 0),
          ]),
      ).toThrow(EnvironmentalWindProfileError);
    });

    it("rejects nonzero vertical velocity", () => {
      expect(
        () =>
          new EnvironmentalWindProfile([
            level(0, 1, 0, 1),
            level(1000, 2, 0),
          ]),
      ).toThrow(EnvironmentalWindProfileError);
    });
  });

  describe("invalid sample height", () => {
    const profile = new EnvironmentalWindProfile(twoLevels);

    it("rejects NaN, Infinity, and -Infinity", () => {
      expect(() => profile.sampleAtHeight(Number.NaN)).toThrow(
        EnvironmentalWindProfileError,
      );
      expect(() => profile.sampleAtHeight(Number.POSITIVE_INFINITY)).toThrow(
        EnvironmentalWindProfileError,
      );
      expect(() => profile.sampleAtHeight(Number.NEGATIVE_INFINITY)).toThrow(
        EnvironmentalWindProfileError,
      );
    });
  });
});
