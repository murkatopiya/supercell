import { describe, expect, it } from "vitest";
import { EnvironmentalWindProfile } from "./EnvironmentalWindProfile.js";
import type { StormMotion } from "./stormRelativeWind.js";
import {
  StormRelativeHelicityError,
  stormRelativeHelicityBetween,
} from "./stormRelativeHelicity.js";

const FORM_A_TOLERANCE = 1e-12;

/** Independent Form A validation only — not used by production SRH. */
function formASrhBetween(
  profile: EnvironmentalWindProfile,
  stormMotion: StormMotion,
  h0: number,
  h1: number,
): number {
  const cEast = stormMotion.eastward;
  const cNorth = stormMotion.northward;
  const interiors = profile.interiorLevelHeightsBetween(h0, h1);
  const bounds = [h0, ...interiors, h1];

  let srh = 0;
  for (let i = 0; i < bounds.length - 1; i++) {
    const ha = bounds[i]!;
    const hb = bounds[i + 1]!;
    const wa = profile.sampleAtHeight(ha);
    const wb = profile.sampleAtHeight(hb);

    const ua = wa.eastward - cEast;
    const va = wa.northward - cNorth;
    const ub = wb.eastward - cEast;
    const vb = wb.northward - cNorth;

    const deltaH = hb - ha;
    const shearEastward = (wb.eastward - wa.eastward) / deltaH;
    const shearNorthward = (wb.northward - wa.northward) / deltaH;
    const omegaEast = 0 - shearNorthward;
    const omegaNorth = shearEastward;
    const avgEast = (ua + ub) / 2;
    const avgNorth = (va + vb) / 2;

    srh += deltaH * (omegaEast * avgEast + omegaNorth * avgNorth);
  }

  return srh + 0;
}

function expectMatchesFormA(
  profile: EnvironmentalWindProfile,
  stormMotion: StormMotion,
  h0: number,
  h1: number,
): void {
  const production = stormRelativeHelicityBetween(
    profile,
    stormMotion,
    h0,
    h1,
  ).srh;
  const formA = formASrhBetween(profile, stormMotion, h0, h1);
  expect(Math.abs(production - formA)).toBeLessThanOrEqual(FORM_A_TOLERANCE);
}

describe("stormRelativeHelicityBetween", () => {
  it("returns zero SRH for a constant-wind (zero shear) layer", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 8, northward: 3, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 8, northward: 3, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 2, northward: 1 };

    const result = stormRelativeHelicityBetween(profile, stormMotion, 0, 1000);

    expect(result).toEqual({ srh: 0 });
    expect(Object.is(result.srh, 0)).toBe(true);
    expectMatchesFormA(profile, stormMotion, 0, 1000);
  });

  it("returns zero SRH for pure crosswise geometry on a linear segment", () => {
    // Shear is eastward-only → ω_h = (0, du/dh). Storm-relative northward
    // wind is zero everywhere → V_sr,h · ω_h = 0 (pure crosswise).
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 0, northward: 5, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 10, northward: 5, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 0, northward: 5 };

    const result = stormRelativeHelicityBetween(profile, stormMotion, 0, 1000);

    expect(result).toEqual({ srh: 0 });
    expectMatchesFormA(profile, stormMotion, 0, 1000);
  });

  it("returns positive SRH when mid-layer V_sr is streamwise with ω_h", () => {
    // Eastward shear → ω = (0, +0.01). Choose C so V_sr_avg = (0, 5) // ω.
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 0, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 10, northward: 0, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 5, northward: -5 };

    const result = stormRelativeHelicityBetween(profile, stormMotion, 0, 1000);

    // Form B: Ub=5, Va=5, Ua=-5, Vb=5 → 5*5 - (-5)*5 = 50
    expect(result).toEqual({ srh: 50 });
    expectMatchesFormA(profile, stormMotion, 0, 1000);
  });

  it("returns negative SRH for anti-streamwise mid-layer V_sr", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 0, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 10, northward: 0, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 5, northward: 5 };

    const result = stormRelativeHelicityBetween(profile, stormMotion, 0, 1000);

    // Form B: Ub=5, Va=-5, Ua=-5, Vb=-5 → 5*(-5) - (-5)*(-5) = -25 - 25 = -50
    expect(result).toEqual({ srh: -50 });
    expectMatchesFormA(profile, stormMotion, 0, 1000);
  });

  it("allows signed cancellation across successive segments", () => {
    // Segment 0–1000: same as positive streamwise case with C=(5,-5) → +50
    // Segment 1000–2000: reverse eastward shear with same C → opposite signed area
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 0, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 10, northward: 0, vertical: 0 },
      },
      {
        height: 2000,
        velocity: { eastward: 0, northward: 0, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 5, northward: -5 };

    const full = stormRelativeHelicityBetween(profile, stormMotion, 0, 2000);
    const lower = stormRelativeHelicityBetween(profile, stormMotion, 0, 1000);
    const upper = stormRelativeHelicityBetween(profile, stormMotion, 1000, 2000);

    expect(lower.srh).toBe(50);
    expect(upper.srh).toBe(-50);
    expect(full.srh).toBe(0);
    expect(full.srh).toBe(lower.srh + upper.srh);
    expect(Math.abs(full.srh)).toBeLessThan(
      Math.abs(lower.srh) + Math.abs(upper.srh),
    );
    expectMatchesFormA(profile, stormMotion, 0, 2000);
  });

  it("matches the hand-exact two-level triangle formula", () => {
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
    const stormMotion = { eastward: 5, northward: 2 };
    const ua = 10 - 5;
    const va = 0 - 2;
    const ub = 20 - 5;
    const vb = 10 - 2;
    const expected = ub * va - ua * vb;

    const result = stormRelativeHelicityBetween(
      profile,
      stormMotion,
      1000,
      2000,
    );

    expect(result.srh).toBe(expected);
    expect(result.srh).toBe(15 * -2 - 5 * 8); // -30 - 40 = -70
    expectMatchesFormA(profile, stormMotion, 1000, 2000);
  });

  it("changes SRH when storm motion changes on the same profile", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 0, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 10, northward: 0, vertical: 0 },
      },
    ]);
    const c1 = { eastward: 5, northward: -5 };
    const c2 = { eastward: 5, northward: 5 };

    const srh1 = stormRelativeHelicityBetween(profile, c1, 0, 1000).srh;
    const srh2 = stormRelativeHelicityBetween(profile, c2, 0, 1000).srh;

    expect(srh1).toBe(50);
    expect(srh2).toBe(-50);
    expect(srh1).not.toBe(srh2);
  });

  it("handles interior layer endpoints inside profile segments", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 0, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 10, northward: 0, vertical: 0 },
      },
      {
        height: 2000,
        velocity: { eastward: 10, northward: 20, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 4, northward: 3 };
    const h0 = 500;
    const h1 = 1500;

    // Subsegment winds via linear interpolation:
    // 500:  (5, 0); 1000: (10, 0); 1500: (10, 10)
    const expected =
      (10 - 4) * (0 - 3) -
      (5 - 4) * (0 - 3) +
      ((10 - 4) * (0 - 3) - (10 - 4) * (10 - 3));

    const result = stormRelativeHelicityBetween(
      profile,
      stormMotion,
      h0,
      h1,
    );

    expect(profile.interiorLevelHeightsBetween(h0, h1)).toEqual([1000]);
    expect(result.srh).toBe(expected);
    expectMatchesFormA(profile, stormMotion, h0, h1);
  });

  it("allows layer endpoints exactly at minHeight and maxHeight", () => {
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
    const stormMotion = { eastward: 0, northward: 0 };

    const result = stormRelativeHelicityBetween(
      profile,
      stormMotion,
      profile.minHeight,
      profile.maxHeight,
    );

    expect(result.srh).toBe(20 * 0 - 10 * 10); // -100
    expectMatchesFormA(
      profile,
      stormMotion,
      profile.minHeight,
      profile.maxHeight,
    );
  });

  it("allows zero horizontal storm-relative wind without error", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 7, northward: 2, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 7, northward: 2, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 7, northward: 2 };

    const result = stormRelativeHelicityBetween(profile, stormMotion, 0, 1000);

    expect(result).toEqual({ srh: 0 });
    expectMatchesFormA(profile, stormMotion, 0, 1000);
  });

  it("allows a layer that passes through a zero-V_sr knot", () => {
    // At h=0, env wind equals C → V_sr = 0; shear still nonzero above.
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 5, northward: 5, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 15, northward: 5, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 5, northward: 5 };

    const result = stormRelativeHelicityBetween(profile, stormMotion, 0, 1000);

    // Ua=0,Va=0,Ub=10,Vb=0 → 0
    expect(result).toEqual({ srh: 0 });
    expectMatchesFormA(profile, stormMotion, 0, 1000);
  });

  it("rejects equal heights", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 1, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 2, northward: 0, vertical: 0 },
      },
    ]);

    expect(() =>
      stormRelativeHelicityBetween(profile, { eastward: 0, northward: 0 }, 500, 500),
    ).toThrow(StormRelativeHelicityError);
  });

  it("rejects reversed heights", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 1, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 2, northward: 0, vertical: 0 },
      },
    ]);

    expect(() =>
      stormRelativeHelicityBetween(
        profile,
        { eastward: 0, northward: 0 },
        1000,
        0,
      ),
    ).toThrow(StormRelativeHelicityError);
  });

  it("rejects non-finite heights", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 1, northward: 0, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 2, northward: 0, vertical: 0 },
      },
    ]);
    const c = { eastward: 0, northward: 0 };

    expect(() =>
      stormRelativeHelicityBetween(profile, c, Number.NaN, 1000),
    ).toThrow(StormRelativeHelicityError);
    expect(() =>
      stormRelativeHelicityBetween(
        profile,
        c,
        0,
        Number.POSITIVE_INFINITY,
      ),
    ).toThrow(StormRelativeHelicityError);
  });

  it("rejects layers below minHeight", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 1000,
        velocity: { eastward: 10, northward: 0, vertical: 0 },
      },
      {
        height: 2000,
        velocity: { eastward: 20, northward: 0, vertical: 0 },
      },
    ]);
    const c = { eastward: 0, northward: 0 };

    expect(() => stormRelativeHelicityBetween(profile, c, 500, 1500)).toThrow(
      StormRelativeHelicityError,
    );
  });

  it("rejects layers above maxHeight", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 1000,
        velocity: { eastward: 10, northward: 0, vertical: 0 },
      },
      {
        height: 2000,
        velocity: { eastward: 20, northward: 0, vertical: 0 },
      },
    ]);
    const c = { eastward: 0, northward: 0 };

    expect(() => stormRelativeHelicityBetween(profile, c, 1500, 2500)).toThrow(
      StormRelativeHelicityError,
    );
  });

  it("matches Form A on a multi-segment layer as an independent check", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 0, northward: 10, vertical: 0 },
      },
      {
        height: 1000,
        velocity: { eastward: 10, northward: 0, vertical: 0 },
      },
      {
        height: 2000,
        velocity: { eastward: 20, northward: 10, vertical: 0 },
      },
    ]);
    const stormMotion = { eastward: 3, northward: 4 };

    expectMatchesFormA(profile, stormMotion, 0, 2000);
    expectMatchesFormA(profile, stormMotion, 250, 1750);
  });
});
