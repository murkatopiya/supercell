import { describe, expect, it } from "vitest";
import {
  horizontalVorticityFromShear,
  type HorizontalVorticity,
} from "./horizontalVorticity.js";
import type { HorizontalWindShear } from "./verticalWindShear.js";

const TOLERANCE = 1e-12;

function expectOrthogonalEqualMagnitude(
  shear: HorizontalWindShear,
  vorticity: HorizontalVorticity,
): void {
  const dot =
    shear.shearEastward * vorticity.omegaEastward +
    shear.shearNorthward * vorticity.omegaNorthward;
  expect(Math.abs(dot)).toBeLessThanOrEqual(TOLERANCE);

  const shearMagnitude = Math.hypot(shear.shearEastward, shear.shearNorthward);
  const vorticityMagnitude = Math.hypot(
    vorticity.omegaEastward,
    vorticity.omegaNorthward,
  );
  expect(Math.abs(shearMagnitude - vorticityMagnitude)).toBeLessThanOrEqual(
    TOLERANCE,
  );
}

describe("horizontalVorticityFromShear", () => {
  it("maps pure eastward speed shear", () => {
    const shear = { shearEastward: 0.01, shearNorthward: 0 };
    const vorticity = horizontalVorticityFromShear(shear);

    expect(vorticity).toEqual({
      omegaEastward: 0,
      omegaNorthward: 0.01,
    });
    expectOrthogonalEqualMagnitude(shear, vorticity);
  });

  it("maps pure northward speed shear", () => {
    const shear = { shearEastward: 0, shearNorthward: 0.01 };
    const vorticity = horizontalVorticityFromShear(shear);

    expect(vorticity).toEqual({
      omegaEastward: -0.01,
      omegaNorthward: 0,
    });
    expectOrthogonalEqualMagnitude(shear, vorticity);
  });

  it("maps linear segment shear (0.01, 0.01)", () => {
    const shear = { shearEastward: 0.01, shearNorthward: 0.01 };
    const vorticity = horizontalVorticityFromShear(shear);

    expect(vorticity).toEqual({
      omegaEastward: -0.01,
      omegaNorthward: 0.01,
    });
    expectOrthogonalEqualMagnitude(shear, vorticity);
  });

  // S matches docs/physics/06 §12 constant-speed directional sounding
  // (0→10 m/s eastward, 10→0 m/s northward over 0–1000 m).
  it("maps constant-speed directional shear", () => {
    const shear = { shearEastward: 0.01, shearNorthward: -0.01 };
    const vorticity = horizontalVorticityFromShear(shear);

    expect(vorticity).toEqual({
      omegaEastward: 0.01,
      omegaNorthward: 0.01,
    });
    expectOrthogonalEqualMagnitude(shear, vorticity);
  });

  it("maps zero shear to zero vorticity", () => {
    const shear = { shearEastward: 0, shearNorthward: 0 };
    const vorticity = horizontalVorticityFromShear(shear);

    expect(vorticity).toEqual({
      omegaEastward: 0,
      omegaNorthward: 0,
    });
    expectOrthogonalEqualMagnitude(shear, vorticity);
  });
});
