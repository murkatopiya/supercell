import { describe, expect, it } from "vitest";
import { EnvironmentalWindProfile } from "./EnvironmentalWindProfile.js";
import { horizontalVorticityFromShear } from "./horizontalVorticity.js";
import { decomposeHorizontalVorticity } from "./streamwiseCrosswiseVorticity.js";
import { stormRelativeHelicityBetween } from "./stormRelativeHelicity.js";
import { stormRelativeWind } from "./stormRelativeWind.js";
import { verticalWindShearBetween } from "./verticalWindShear.js";

describe("environment diagnostics stack acceptance", () => {
  it("chains shear → vorticity → storm-relative → streamwise/crosswise → SRH on a toy profile", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 10, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 20, northward: 10, vertical: 0 },
      },
      {
        height: 2000,
        velocity: { eastward: 20, northward: 20, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 10, northward: -5 };

    // --- Segment 0–1000 m ---
    const shear1 = verticalWindShearBetween(profile, 0, 1000);
    expect(shear1).toEqual({
      shearEastward: 0.01,
      shearNorthward: 0.01,
    });

    const omega1 = horizontalVorticityFromShear(shear1);
    expect(omega1).toEqual({
      omegaEastward: -0.01,
      omegaNorthward: 0.01,
    });

    const vsr0 = stormRelativeWind(profile.sampleAtHeight(0), stormMotion);
    expect(vsr0).toEqual({
      eastward: 0,
      northward: 5,
      vertical: 0,
    });

    const vsr1000 = stormRelativeWind(
      profile.sampleAtHeight(1000),
      stormMotion,
    );
    expect(vsr1000).toEqual({
      eastward: 10,
      northward: 15,
      vertical: 0,
    });

    expect(decomposeHorizontalVorticity(vsr0, omega1)).toEqual({
      omegaStreamwise: 0.01,
      omegaCrosswise: 0.01,
    });

    const srh1 = stormRelativeHelicityBetween(profile, stormMotion, 0, 1000);
    expect(srh1).toEqual({ srh: 50 });

    // --- Segment 1000–2000 m ---
    const shear2 = verticalWindShearBetween(profile, 1000, 2000);
    expect(shear2).toEqual({
      shearEastward: 0,
      shearNorthward: 0.01,
    });

    const omega2 = horizontalVorticityFromShear(shear2);
    expect(omega2).toEqual({
      omegaEastward: -0.01,
      omegaNorthward: 0,
    });

    const vsr2000 = stormRelativeWind(
      profile.sampleAtHeight(2000),
      stormMotion,
    );
    expect(vsr2000).toEqual({
      eastward: 10,
      northward: 25,
      vertical: 0,
    });

    // Decomposition at h=1000 with segment-2 vorticity (hand geometry).
    const speed1000 = Math.hypot(10, 15);
    expect(decomposeHorizontalVorticity(vsr1000, omega2)).toEqual({
      omegaStreamwise: -0.1 / speed1000,
      omegaCrosswise: 0.15 / speed1000,
    });

    const srh2 = stormRelativeHelicityBetween(
      profile,
      stormMotion,
      1000,
      2000,
    );
    expect(srh2).toEqual({ srh: -100 });

    // --- Full layer + signed cancellation ---
    const srhFull = stormRelativeHelicityBetween(
      profile,
      stormMotion,
      0,
      2000,
    );
    expect(srhFull).toEqual({ srh: -50 });
    expect(srh1.srh + srh2.srh).toBe(-50);
    expect(srhFull.srh).toBe(srh1.srh + srh2.srh);
  });

  it("chains the same stack on a second toy profile with negative SRH on both segments", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 12, northward: 2, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 18, northward: 10, vertical: 0 },
      },
      {
        height: 2000,
        velocity: { eastward: 14, northward: 18, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 8, northward: 4 };

    // --- Segment 0–1000 m ---
    const shear1 = verticalWindShearBetween(profile, 0, 1000);
    expect(shear1).toEqual({
      shearEastward: 0.006,
      shearNorthward: 0.008,
    });

    const omega1 = horizontalVorticityFromShear(shear1);
    expect(omega1).toEqual({
      omegaEastward: -0.008,
      omegaNorthward: 0.006,
    });

    const vsr0 = stormRelativeWind(profile.sampleAtHeight(0), stormMotion);
    expect(vsr0).toEqual({
      eastward: 4,
      northward: -2,
      vertical: 0,
    });

    expect(decomposeHorizontalVorticity(vsr0, omega1).omegaStreamwise).toBeLessThan(
      0,
    );

    const srh1 = stormRelativeHelicityBetween(profile, stormMotion, 0, 1000);
    expect(srh1).toEqual({ srh: -44 });
    expect(srh1.srh).toBeLessThan(0);

    // --- Segment 1000–2000 m ---
    const shear2 = verticalWindShearBetween(profile, 1000, 2000);
    expect(shear2).toEqual({
      shearEastward: -0.004,
      shearNorthward: 0.008,
    });

    const omega2 = horizontalVorticityFromShear(shear2);
    expect(omega2).toEqual({
      omegaEastward: -0.008,
      omegaNorthward: -0.004,
    });

    const vsr1000 = stormRelativeWind(
      profile.sampleAtHeight(1000),
      stormMotion,
    );
    expect(vsr1000).toEqual({
      eastward: 10,
      northward: 6,
      vertical: 0,
    });

    expect(
      decomposeHorizontalVorticity(vsr1000, omega2).omegaStreamwise,
    ).toBeLessThan(0);

    const srh2 = stormRelativeHelicityBetween(
      profile,
      stormMotion,
      1000,
      2000,
    );
    expect(srh2).toEqual({ srh: -104 });
    expect(srh2.srh).toBeLessThan(0);

    // --- Full layer additivity ---
    const srhFull = stormRelativeHelicityBetween(
      profile,
      stormMotion,
      0,
      2000,
    );
    expect(srhFull).toEqual({ srh: -148 });
    expect(srhFull.srh).toBeLessThan(0);
    expect(srhFull.srh).toBe(srh1.srh + srh2.srh);
  });
});
