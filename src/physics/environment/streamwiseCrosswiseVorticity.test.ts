import { describe, expect, it } from "vitest";
import type { HorizontalVorticity } from "./horizontalVorticity.js";
import type { StormRelativeWind } from "./stormRelativeWind.js";
import {
  decomposeHorizontalVorticity,
  StreamwiseCrosswiseVorticityError,
  type StreamwiseCrosswiseVorticity,
} from "./streamwiseCrosswiseVorticity.js";

const TOLERANCE = 1e-12;

function expectNormAndReconstruction(
  stormRelativeWind: StormRelativeWind,
  horizontalVorticity: HorizontalVorticity,
  result: StreamwiseCrosswiseVorticity,
): void {
  const u = stormRelativeWind.eastward;
  const v = stormRelativeWind.northward;
  const speed = Math.hypot(u, v);
  const sEast = u / speed;
  const sNorth = v / speed;
  const cEast = -v / speed;
  const cNorth = u / speed;

  const omegaMagSq =
    horizontalVorticity.omegaEastward * horizontalVorticity.omegaEastward +
    horizontalVorticity.omegaNorthward * horizontalVorticity.omegaNorthward;
  const partitionMagSq =
    result.omegaStreamwise * result.omegaStreamwise +
    result.omegaCrosswise * result.omegaCrosswise;
  expect(Math.abs(partitionMagSq - omegaMagSq)).toBeLessThanOrEqual(TOLERANCE);

  const reconstructedEast =
    result.omegaStreamwise * sEast + result.omegaCrosswise * cEast;
  const reconstructedNorth =
    result.omegaStreamwise * sNorth + result.omegaCrosswise * cNorth;
  expect(
    Math.abs(reconstructedEast - horizontalVorticity.omegaEastward),
  ).toBeLessThanOrEqual(TOLERANCE);
  expect(
    Math.abs(reconstructedNorth - horizontalVorticity.omegaNorthward),
  ).toBeLessThanOrEqual(TOLERANCE);
}

describe("decomposeHorizontalVorticity", () => {
  it("maps parallel flow and vorticity", () => {
    const wind = { eastward: 2, northward: 0, vertical: 0 };
    const vorticity = { omegaEastward: 3, omegaNorthward: 0 };
    const result = decomposeHorizontalVorticity(wind, vorticity);

    expect(result).toEqual({
      omegaStreamwise: 3,
      omegaCrosswise: 0,
    });
    expectNormAndReconstruction(wind, vorticity, result);
  });

  it("maps anti-parallel flow and vorticity", () => {
    const wind = { eastward: 2, northward: 0, vertical: 0 };
    const vorticity = { omegaEastward: -3, omegaNorthward: 0 };
    const result = decomposeHorizontalVorticity(wind, vorticity);

    expect(result).toEqual({
      omegaStreamwise: -3,
      omegaCrosswise: 0,
    });
    expectNormAndReconstruction(wind, vorticity, result);
  });

  it("maps perpendicular positive crosswise", () => {
    const wind = { eastward: 1, northward: 0, vertical: 0 };
    const vorticity = { omegaEastward: 0, omegaNorthward: 1 };
    const result = decomposeHorizontalVorticity(wind, vorticity);

    expect(result).toEqual({
      omegaStreamwise: 0,
      omegaCrosswise: 1,
    });
    expectNormAndReconstruction(wind, vorticity, result);
  });

  it("maps perpendicular negative crosswise", () => {
    const wind = { eastward: 1, northward: 0, vertical: 0 };
    const vorticity = { omegaEastward: 0, omegaNorthward: -1 };
    const result = decomposeHorizontalVorticity(wind, vorticity);

    expect(result).toEqual({
      omegaStreamwise: 0,
      omegaCrosswise: -1,
    });
    expectNormAndReconstruction(wind, vorticity, result);
  });

  it("maps the fixed oblique case with invariants", () => {
    const wind = { eastward: 3, northward: 4, vertical: 0 };
    const vorticity = { omegaEastward: 4, omegaNorthward: 3 };
    const result = decomposeHorizontalVorticity(wind, vorticity);

    expect(result.omegaStreamwise).toBeCloseTo(4.8, 12);
    expect(result.omegaCrosswise).toBeCloseTo(-1.4, 12);
    expectNormAndReconstruction(wind, vorticity, result);
  });

  it("maps zero vorticity to zero components", () => {
    const wind = { eastward: 5, northward: 1, vertical: 0 };
    const vorticity = { omegaEastward: 0, omegaNorthward: 0 };
    const result = decomposeHorizontalVorticity(wind, vorticity);

    expect(result).toEqual({
      omegaStreamwise: 0,
      omegaCrosswise: 0,
    });
    expectNormAndReconstruction(wind, vorticity, result);
  });

  it("throws when horizontal storm-relative flow is exactly zero", () => {
    expect(() =>
      decomposeHorizontalVorticity(
        { eastward: 0, northward: 0, vertical: 0 },
        { omegaEastward: 1, omegaNorthward: -2 },
      ),
    ).toThrow(StreamwiseCrosswiseVorticityError);
  });

  it("throws for zero horizontal flow even when vertical is large", () => {
    expect(() =>
      decomposeHorizontalVorticity(
        { eastward: 0, northward: 0, vertical: 100500 },
        { omegaEastward: 2, omegaNorthward: 3 },
      ),
    ).toThrow(StreamwiseCrosswiseVorticityError);
  });

  it("treats signed zero horizontal components as zero flow", () => {
    expect(() =>
      decomposeHorizontalVorticity(
        { eastward: -0, northward: 0, vertical: 1 },
        { omegaEastward: 1, omegaNorthward: 0 },
      ),
    ).toThrow(StreamwiseCrosswiseVorticityError);

    expect(() =>
      decomposeHorizontalVorticity(
        { eastward: 0, northward: -0, vertical: 1 },
        { omegaEastward: 1, omegaNorthward: 0 },
      ),
    ).toThrow(StreamwiseCrosswiseVorticityError);
  });

  it("ignores vertical wind on the happy path", () => {
    const vorticity = { omegaEastward: 4, omegaNorthward: 3 };
    const withZeroVertical = decomposeHorizontalVorticity(
      { eastward: 3, northward: 4, vertical: 0 },
      vorticity,
    );
    const withLargeVertical = decomposeHorizontalVorticity(
      { eastward: 3, northward: 4, vertical: 100500 },
      vorticity,
    );

    expect(withLargeVertical).toEqual(withZeroVertical);
  });
});
