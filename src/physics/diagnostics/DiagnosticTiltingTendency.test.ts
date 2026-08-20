import { describe, expect, it } from "vitest";
import type { VelocityField } from "../../core/fields/VelocityField.js";
import { CompositeVelocityField } from "../../core/fields/CompositeVelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import {
  EnvironmentalWindProfile,
  type EnvironmentalWindLevel,
} from "../environment/EnvironmentalWindProfile.js";
import { horizontalVorticityFromShear } from "../environment/horizontalVorticity.js";
import { verticalWindShearBetween } from "../environment/verticalWindShear.js";
import { VerticalEnvelopeUpdraftField } from "../storm/VerticalEnvelopeUpdraftField.js";
import diagnosticTiltingTendencySrc from "./DiagnosticTiltingTendency.ts?raw";
import {
  DiagnosticTiltingTendency,
  DiagnosticTiltingTendencyError,
  soundingSegmentContainingHeight,
  worldHorizontalVorticityFromAtmospheric,
} from "./DiagnosticTiltingTendency.js";

function level(
  height: number,
  eastward: number,
  northward: number,
): EnvironmentalWindLevel {
  return {
    height,
    velocity: { eastward, northward, vertical: 0 },
  };
}

function createUpdraft(overrides: {
  centerX?: number;
  centerZ?: number;
  peakVerticalVelocity?: number;
  sigma?: number;
  baseHeight?: number;
  topHeight?: number;
} = {}) {
  return new VerticalEnvelopeUpdraftField({
    centerX: overrides.centerX ?? 0,
    centerZ: overrides.centerZ ?? 0,
    peakVerticalVelocity: overrides.peakVerticalVelocity ?? 20,
    sigma: overrides.sigma ?? 2000,
    baseHeight: overrides.baseHeight ?? 0,
    topHeight: overrides.topHeight ?? 4000,
  });
}

/** Constant eastward wind: zero shear. */
function noShearProfile() {
  return new EnvironmentalWindProfile([
    level(0, 8, 3),
    level(3000, 8, 3),
  ]);
}

/**
 * Pure world +X environmental vorticity: constant u, northward wind
 * decreasing with height ⇒ omegaEastward > 0, omegaNorthward = 0.
 */
function eastwardOmegaProfile() {
  return new EnvironmentalWindProfile([
    level(0, 5, 20),
    level(4000, 5, 0),
  ]);
}

function reversedEastwardOmegaProfile() {
  return new EnvironmentalWindProfile([
    level(0, 5, 0),
    level(4000, 5, 20),
  ]);
}

/**
 * Irregular knots with distinct segment ω_h.
 * [100, 400):  pure +X omega
 * [400, 900):  omegaNorthward only → world omegaZ = −omegaNorthward
 * [900, 2000]: mixed
 */
function irregularProfile() {
  return new EnvironmentalWindProfile([
    level(100, 0, 0),
    level(400, 0, -30),
    level(900, 50, -30),
    level(2000, 50, 80),
  ]);
}

function expectedTilting(
  profile: EnvironmentalWindProfile,
  updraft: VerticalEnvelopeUpdraftField,
  position: Vec3,
  time: number,
): number {
  const segment = soundingSegmentContainingHeight(profile, position.y);
  const gradient = updraft.horizontalGradientOfVerticalVelocity(
    position,
    time,
  );
  if (segment === null) {
    return 0;
  }
  const world = worldHorizontalVorticityFromAtmospheric(
    horizontalVorticityFromShear(
      verticalWindShearBetween(profile, segment.hLo, segment.hHi),
    ),
  );
  const t = world.omegaX * gradient.dVyDx + world.omegaZ * gradient.dVyDz;
  return t === 0 ? 0 : t;
}

describe("worldHorizontalVorticityFromAtmospheric", () => {
  it("maps (east=+a, north=+b) to (omegaX=+a, omegaZ=-b)", () => {
    expect(
      worldHorizontalVorticityFromAtmospheric({
        omegaEastward: 0.02,
        omegaNorthward: 0.05,
      }),
    ).toEqual({ omegaX: 0.02, omegaZ: -0.05 });
  });

  it("preserves negative eastward and northward signs", () => {
    expect(
      worldHorizontalVorticityFromAtmospheric({
        omegaEastward: -0.01,
        omegaNorthward: -0.03,
      }),
    ).toEqual({ omegaX: -0.01, omegaZ: 0.03 });
  });

  it("maps mixed signs", () => {
    expect(
      worldHorizontalVorticityFromAtmospheric({
        omegaEastward: 0.04,
        omegaNorthward: -0.02,
      }),
    ).toEqual({ omegaX: 0.04, omegaZ: 0.02 });
  });

  it("maps zeros without IEEE signed zero on omegaZ", () => {
    const world = worldHorizontalVorticityFromAtmospheric({
      omegaEastward: 0,
      omegaNorthward: 0,
    });
    expect(world.omegaX).toBe(0);
    expect(world.omegaZ).toBe(0);
    expect(Object.is(world.omegaZ, -0)).toBe(false);
  });
});

describe("soundingSegmentContainingHeight", () => {
  const profile = irregularProfile();

  it("returns null below minHeight without requiring a DEMO sounding", () => {
    expect(soundingSegmentContainingHeight(profile, 99.999)).toBeNull();
    expect(soundingSegmentContainingHeight(profile, -50)).toBeNull();
  });

  it("returns null above maxHeight", () => {
    expect(soundingSegmentContainingHeight(profile, 2000.001)).toBeNull();
    expect(soundingSegmentContainingHeight(profile, 9000)).toBeNull();
  });

  it("selects the first segment at minHeight", () => {
    expect(soundingSegmentContainingHeight(profile, 100)).toEqual({
      hLo: 100,
      hHi: 400,
    });
  });

  it("selects the containing interior segment between knots", () => {
    expect(soundingSegmentContainingHeight(profile, 250)).toEqual({
      hLo: 100,
      hHi: 400,
    });
    expect(soundingSegmentContainingHeight(profile, 700)).toEqual({
      hLo: 400,
      hHi: 900,
    });
    expect(soundingSegmentContainingHeight(profile, 1400)).toEqual({
      hLo: 900,
      hHi: 2000,
    });
  });

  it("selects the UPPER segment at an interior knot", () => {
    expect(soundingSegmentContainingHeight(profile, 400)).toEqual({
      hLo: 400,
      hHi: 900,
    });
    expect(soundingSegmentContainingHeight(profile, 900)).toEqual({
      hLo: 900,
      hHi: 2000,
    });
  });

  it("selects the lower segment just below an interior knot", () => {
    expect(soundingSegmentContainingHeight(profile, 399.999)).toEqual({
      hLo: 100,
      hHi: 400,
    });
    expect(soundingSegmentContainingHeight(profile, 899.999)).toEqual({
      hLo: 400,
      hHi: 900,
    });
  });

  it("selects the last segment at maxHeight", () => {
    expect(soundingSegmentContainingHeight(profile, 2000)).toEqual({
      hLo: 900,
      hHi: 2000,
    });
  });

  it("uses the single interval of a minimum two-level profile", () => {
    const minimal = new EnvironmentalWindProfile([
      level(12, 1, 0),
      level(47, 4, 2),
    ]);
    expect(soundingSegmentContainingHeight(minimal, 12)).toEqual({
      hLo: 12,
      hHi: 47,
    });
    expect(soundingSegmentContainingHeight(minimal, 30)).toEqual({
      hLo: 12,
      hHi: 47,
    });
    expect(soundingSegmentContainingHeight(minimal, 47)).toEqual({
      hLo: 12,
      hHi: 47,
    });
    expect(soundingSegmentContainingHeight(minimal, 11.9)).toBeNull();
    expect(soundingSegmentContainingHeight(minimal, 47.1)).toBeNull();
  });

  it("throws on non-finite height", () => {
    expect(() =>
      soundingSegmentContainingHeight(profile, Number.NaN),
    ).toThrow(DiagnosticTiltingTendencyError);
    expect(() =>
      soundingSegmentContainingHeight(profile, Number.POSITIVE_INFINITY),
    ).toThrow(DiagnosticTiltingTendencyError);
  });
});

describe("DiagnosticTiltingTendency", () => {
  const updraft = createUpdraft();
  const interiorOffAxis = { x: 800, y: 2000, z: 0 };

  it("returns 0 when the containing segment has no shear", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: noShearProfile(),
      updraft,
    });
    expect(t1.sample(interiorOffAxis, 0)).toBe(0);
  });

  it("returns 0 on the updraft axis where ∇_h Vy = 0", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft,
    });
    expect(t1.sample({ x: 0, y: 2000, z: 0 }, 0)).toBe(0);
  });

  it("returns 0 outside the updraft vertical layer", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft,
    });
    expect(t1.sample({ x: 800, y: -100, z: 0 }, 0)).toBe(0);
    expect(t1.sample({ x: 800, y: 5000, z: 0 }, 0)).toBe(0);
    expect(t1.sample({ x: 800, y: 0, z: 0 }, 0)).toBe(0);
    expect(t1.sample({ x: 800, y: 4000, z: 0 }, 0)).toBe(0);
  });

  it("returns 0 outside the sounding even when the updraft gradient is nonzero", () => {
    const profile = irregularProfile();
    const tallUpdraft = createUpdraft({ baseHeight: 0, topHeight: 5000 });
    const t1 = new DiagnosticTiltingTendency({
      profile,
      updraft: tallUpdraft,
    });
    const below = { x: 500, y: 50, z: 300 };
    const above = { x: 500, y: 2500, z: 300 };
    expect(
      tallUpdraft.horizontalGradientOfVerticalVelocity(below, 0).dVyDx,
    ).not.toBe(0);
    expect(
      tallUpdraft.horizontalGradientOfVerticalVelocity(above, 0).dVyDx,
    ).not.toBe(0);
    expect(t1.sample(below, 0)).toBe(0);
    expect(t1.sample(above, 0)).toBe(0);
  });

  it("does not call verticalWindShearBetween outside the sounding", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: irregularProfile(),
      updraft: createUpdraft({ baseHeight: 0, topHeight: 5000 }),
    });
    expect(() => t1.sample({ x: 500, y: 50, z: 300 }, 0)).not.toThrow();
    expect(() => t1.sample({ x: 500, y: 2500, z: 300 }, 0)).not.toThrow();
  });

  it("reverses T sign when environmental shear reverses", () => {
    const forward = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft,
    });
    const reversed = new DiagnosticTiltingTendency({
      profile: reversedEastwardOmegaProfile(),
      updraft,
    });
    const tForward = forward.sample(interiorOffAxis, 0);
    const tReversed = reversed.sample(interiorOffAxis, 0);
    expect(tForward).not.toBe(0);
    expect(tReversed).toBe(-tForward);
  });

  it("mirrors sign across the updraft axis along the omega direction", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft,
    });
    const west = t1.sample({ x: -800, y: 2000, z: 0 }, 0);
    const east = t1.sample({ x: 800, y: 2000, z: 0 }, 0);
    expect(west).toBeGreaterThan(0);
    expect(east).toBe(-west);
  });

  it("is zero when omega_h is perpendicular to ∇_h Vy", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft,
    });
    const north = { x: 0, y: 2000, z: -700 };
    const south = { x: 0, y: 2000, z: 700 };
    expect(
      updraft.horizontalGradientOfVerticalVelocity(north, 0).dVyDz,
    ).not.toBe(0);
    expect(t1.sample(north, 0)).toBe(0);
    expect(t1.sample(south, 0)).toBe(0);
  });

  it("matches the independent world product omegaX dVyDx + omegaZ dVyDz", () => {
    const profile = irregularProfile();
    const field = createUpdraft({ baseHeight: 0, topHeight: 5000 });
    const t1 = new DiagnosticTiltingTendency({ profile, updraft: field });
    const points: Vec3[] = [
      { x: 500, y: 250, z: 300 },
      { x: 500, y: 400, z: 300 },
      { x: -200, y: 700, z: 100 },
      { x: 900, y: 1400, z: -400 },
      { x: 0, y: 2000, z: 0 },
    ];
    for (const point of points) {
      expect(t1.sample(point, 17)).toBe(
        expectedTilting(profile, field, point, 17),
      );
    }
  });

  it("uses the upper-segment vorticity at an interior knot", () => {
    const profile = irregularProfile();
    const field = createUpdraft({ baseHeight: 0, topHeight: 5000 });
    const t1 = new DiagnosticTiltingTendency({ profile, updraft: field });
    const atKnot = { x: 500, y: 400, z: 300 };
    const justBelow = { x: 500, y: 399.5, z: 300 };
    expect(t1.sample(atKnot, 0)).toBe(
      expectedTilting(profile, field, atKnot, 0),
    );
    expect(t1.sample(justBelow, 0)).toBe(
      expectedTilting(profile, field, justBelow, 0),
    );
    expect(t1.sample(atKnot, 0)).not.toBe(t1.sample(justBelow, 0));
  });

  describe("expected vortex couple for world omega_h along +X", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft,
    });
    const y = 2000;

    it("is cyclonic west of the axis, anticyclonic east, and zero on the axis", () => {
      expect(t1.sample({ x: -600, y, z: 0 }, 0)).toBeGreaterThan(0);
      expect(t1.sample({ x: 600, y, z: 0 }, 0)).toBeLessThan(0);
      expect(t1.sample({ x: 0, y, z: 0 }, 0)).toBe(0);
    });

    it("is zero on the north-south diameter where the gradient is perpendicular", () => {
      expect(t1.sample({ x: 0, y, z: -900 }, 0)).toBe(0);
      expect(t1.sample({ x: 0, y, z: 900 }, 0)).toBe(0);
    });
  });

  it("returns a signed scalar, not an absolute value", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft,
    });
    const east = t1.sample({ x: 600, y: 2000, z: 0 }, 0);
    expect(east).toBeLessThan(0);
    expect(east).not.toBe(Math.abs(east));
  });

  it("throws DiagnosticTiltingTendencyError for non-finite P or t", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft,
    });
    const ok = { x: 800, y: 2000, z: 0 };
    expect(() => t1.sample({ x: Number.NaN, y: 2000, z: 0 }, 0)).toThrow(
      DiagnosticTiltingTendencyError,
    );
    expect(() => t1.sample({ x: 800, y: Number.POSITIVE_INFINITY, z: 0 }, 0)).toThrow(
      DiagnosticTiltingTendencyError,
    );
    expect(() => t1.sample({ x: 800, y: 2000, z: Number.NEGATIVE_INFINITY }, 0)).toThrow(
      DiagnosticTiltingTendencyError,
    );
    expect(() => t1.sample(ok, Number.NaN)).toThrow(
      DiagnosticTiltingTendencyError,
    );
    expect(() => t1.sample(ok, Number.POSITIVE_INFINITY)).toThrow(
      DiagnosticTiltingTendencyError,
    );
  });

  it("does not use NaN as a valid diagnostic result in physical zero regions", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: noShearProfile(),
      updraft,
    });
    const zeros = [
      t1.sample({ x: 0, y: 2000, z: 0 }, 0),
      t1.sample({ x: 800, y: -50, z: 0 }, 0),
      t1.sample(interiorOffAxis, 0),
    ];
    for (const value of zeros) {
      expect(Number.isNaN(value)).toBe(false);
      expect(value).toBe(0);
    }
  });

  it("forwards laboratory time to the updraft gradient and is steady for the current fields", () => {
    class RecordingUpdraft extends VerticalEnvelopeUpdraftField {
      lastTime: number | undefined;

      override horizontalGradientOfVerticalVelocity(
        position: Vec3,
        time: number,
      ) {
        this.lastTime = time;
        return super.horizontalGradientOfVerticalVelocity(position, time);
      }
    }

    const recording = new RecordingUpdraft({
      centerX: 0,
      centerZ: 0,
      peakVerticalVelocity: 20,
      sigma: 2000,
      baseHeight: 0,
      topHeight: 4000,
    });
    const t1 = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft: recording,
    });
    const atT1 = t1.sample(interiorOffAxis, 12);
    expect(recording.lastTime).toBe(12);
    const atT2 = t1.sample(interiorOffAxis, 99);
    expect(recording.lastTime).toBe(99);
    expect(atT1).toBe(atT2);
  });

  it("does not mutate profile, updraft, position, or time", () => {
    const profile = eastwardOmegaProfile();
    const field = createUpdraft();
    const t1 = new DiagnosticTiltingTendency({ profile, updraft: field });
    const position = { x: 800, y: 2000, z: 100 };
    const positionBefore = { ...position };
    const heightsBefore = profile.levelHeights();
    const time = 4;
    t1.sample(position, time);
    expect(position).toEqual(positionBefore);
    expect(profile.levelHeights()).toEqual(heightsBefore);
    expect(t1.profile).toBe(profile);
    expect(t1.updraft).toBe(field);
    expect(t1.sample(position, time)).toBe(t1.sample(position, time));
  });

  it("sample returns a number, not a Vec3, so it is not a VelocityField", () => {
    const t1 = new DiagnosticTiltingTendency({
      profile: eastwardOmegaProfile(),
      updraft,
    });
    const value = t1.sample(interiorOffAxis, 0);
    expect(typeof value).toBe("number");
    expect(value).not.toEqual(expect.objectContaining({ x: expect.anything() }));

    const asField: VelocityField = updraft;
    expect(typeof asField.sample(interiorOffAxis, 0)).toBe("object");

    // @ts-expect-error DiagnosticTiltingTendency.sample returns number, not Vec3
    const _rejected: VelocityField = t1;
    void _rejected;

    // @ts-expect-error T1 cannot be a CompositeVelocityField operand
    new CompositeVelocityField([t1]);
  });

  it("does not import rotation, composite, Inspector, or visualization", () => {
    expect(diagnosticTiltingTendencySrc).not.toMatch(/RotationField/);
    expect(diagnosticTiltingTendencySrc).not.toMatch(
      /VerticalEnvelopeRotationField/,
    );
    expect(diagnosticTiltingTendencySrc).not.toMatch(/CompositeVelocityField/);
    expect(diagnosticTiltingTendencySrc).not.toMatch(/IntegrationFrame/);
    expect(diagnosticTiltingTendencySrc).not.toMatch(/StormMotion/);
    expect(diagnosticTiltingTendencySrc).not.toMatch(/DEMO_SCENARIO/);
    expect(diagnosticTiltingTendencySrc).not.toMatch(
      /createEnvironmentalWindProfile/,
    );
    expect(diagnosticTiltingTendencySrc).not.toMatch(/createUpdraftField/);
    expect(diagnosticTiltingTendencySrc).not.toMatch(/TracerInspection/);
    expect(diagnosticTiltingTendencySrc).not.toMatch(/VisualAirflow/);
    expect(diagnosticTiltingTendencySrc).not.toMatch(/from "three"/);
  });
});
