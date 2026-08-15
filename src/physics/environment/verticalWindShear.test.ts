import { describe, expect, it } from "vitest";
import { EnvironmentalWindProfile } from "./EnvironmentalWindProfile.js";
import {
  VerticalWindShearError,
  verticalWindShearBetween,
} from "./verticalWindShear.js";

describe("verticalWindShearBetween", () => {
  const profile = new EnvironmentalWindProfile([
    {
      height: 1000,
      velocity: { eastward: 10, northward: 0, vertical: 0 },
    },
    {
      height: 2000,
      velocity: { eastward: 20, northward: 10, vertical: 0 },
    },
  ]);

  it("computes linear segment shear over the full layer", () => {
    expect(verticalWindShearBetween(profile, 1000, 2000)).toEqual({
      shearEastward: 0.01,
      shearNorthward: 0.01,
    });
  });

  it("returns the same shear for a sub-layer inside one linear piece", () => {
    expect(verticalWindShearBetween(profile, 1000, 1500)).toEqual({
      shearEastward: 0.01,
      shearNorthward: 0.01,
    });
  });

  it("returns zero shear for a constant wind layer", () => {
    const constant = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 8, northward: 3, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 8, northward: 3, vertical: 0 },
      },
    ]);

    expect(verticalWindShearBetween(constant, 0, 1000)).toEqual({
      shearEastward: 0,
      shearNorthward: 0,
    });
  });

  it("allows layer endpoints exactly at minHeight and maxHeight", () => {
    expect(verticalWindShearBetween(profile, profile.minHeight, profile.maxHeight)).toEqual({
      shearEastward: 0.01,
      shearNorthward: 0.01,
    });
  });

  it("rejects equal heights", () => {
    expect(() => verticalWindShearBetween(profile, 1500, 1500)).toThrow(
      VerticalWindShearError,
    );
  });

  it("rejects reversed heights", () => {
    expect(() => verticalWindShearBetween(profile, 2000, 1000)).toThrow(
      VerticalWindShearError,
    );
  });

  it("rejects non-finite heights", () => {
    expect(() => verticalWindShearBetween(profile, Number.NaN, 2000)).toThrow(
      VerticalWindShearError,
    );
    expect(() =>
      verticalWindShearBetween(profile, 1000, Number.POSITIVE_INFINITY),
    ).toThrow(VerticalWindShearError);
  });

  it("rejects layers below minHeight", () => {
    expect(() => verticalWindShearBetween(profile, 500, 1500)).toThrow(
      VerticalWindShearError,
    );
    expect(() => verticalWindShearBetween(profile, 0, 500)).toThrow(
      VerticalWindShearError,
    );
  });

  it("rejects layers above maxHeight", () => {
    expect(() => verticalWindShearBetween(profile, 1500, 2500)).toThrow(
      VerticalWindShearError,
    );
    expect(() => verticalWindShearBetween(profile, 2500, 3000)).toThrow(
      VerticalWindShearError,
    );
  });
});
