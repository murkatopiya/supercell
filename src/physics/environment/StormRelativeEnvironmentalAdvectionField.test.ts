import { describe, expect, it } from "vitest";
import {
  atmosphericVelocityToWorld,
  worldVelocityToAtmospheric,
} from "../../core/math/AtmosphericVelocity.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import { EnvironmentalWindField } from "./EnvironmentalWindField.js";
import { EnvironmentalWindProfile } from "./EnvironmentalWindProfile.js";
import { hodographPoints } from "./hodograph.js";
import {
  StormRelativeEnvironmentalAdvectionField,
  StormRelativeEnvironmentalAdvectionFieldError,
} from "./StormRelativeEnvironmentalAdvectionField.js";
import {
  type StormMotion,
  stormRelativeWind,
} from "./stormRelativeWind.js";

/** Current DEMO environmental knots (fixture numbers, not live composition). */
const DEMO_PROFILE_LEVELS = [
  { height: 0, velocity: { eastward: 15, northward: 5, vertical: 0 } },
  { height: 1000, velocity: { eastward: 5, northward: 15, vertical: 0 } },
  { height: 2000, velocity: { eastward: 10, northward: 25, vertical: 0 } },
  { height: 6000, velocity: { eastward: 30, northward: 20, vertical: 0 } },
  { height: 12000, velocity: { eastward: 40, northward: 10, vertical: 0 } },
] as const;

const DEMO_STORM_MOTION: StormMotion = { eastward: 10, northward: 0 };

const KNOT_HEIGHTS = [0, 1000, 2000, 6000, 12000] as const;
const INTERPOLATED_HEIGHTS = [500, 1500, 4000, 9000] as const;

class RecordingEnvironmentalWindField extends EnvironmentalWindField {
  readonly calls: { position: Vec3; time: number }[] = [];
  readonly returned: Vec3[] = [];

  override sample(position: Vec3, time: number): Vec3 {
    this.calls.push({ position, time });
    const value = super.sample(position, time);
    this.returned.push(value);
    return value;
  }
}

class EnvironmentalWindFieldWithVertical extends EnvironmentalWindField {
  constructor(
    profile: EnvironmentalWindProfile,
    private readonly vertical: number,
  ) {
    super(profile);
  }

  override sample(position: Vec3, time: number): Vec3 {
    const ground = super.sample(position, time);
    return { x: ground.x, y: this.vertical, z: ground.z };
  }
}

function expectedWorld(
  field: EnvironmentalWindField,
  position: Vec3,
  time: number,
  stormMotion: StormMotion,
): Vec3 {
  return atmosphericVelocityToWorld(
    stormRelativeWind(
      worldVelocityToAtmospheric(field.sample(position, time)),
      stormMotion,
    ),
  );
}

function positionAt(height: number): Vec3 {
  return { x: 42, y: height, z: -17 };
}

describe("StormRelativeEnvironmentalAdvectionField", () => {
  const profile = new EnvironmentalWindProfile([...DEMO_PROFILE_LEVELS]);
  const environmentalField = new EnvironmentalWindField(profile);
  const adapter = new StormRelativeEnvironmentalAdvectionField(
    environmentalField,
    DEMO_STORM_MOTION,
  );

  describe("V_sr = V_ground - C on the current environmental profile", () => {
    it.each([...KNOT_HEIGHTS])(
      "matches stormRelativeWind world mapping at knot y=%s",
      (height) => {
        const position = positionAt(height);
        expect(adapter.sample(position, 0)).toEqual(
          expectedWorld(
            environmentalField,
            position,
            0,
            DEMO_STORM_MOTION,
          ),
        );
      },
    );

    it.each([...INTERPOLATED_HEIGHTS])(
      "matches stormRelativeWind world mapping at interpolated y=%s",
      (height) => {
        const position = positionAt(height);
        expect(adapter.sample(position, 0)).toEqual(
          expectedWorld(
            environmentalField,
            position,
            0,
            DEMO_STORM_MOTION,
          ),
        );
      },
    );

    it("locks hand expectations at representative DEMO heights for C = (10, 0)", () => {
      expect(adapter.sample(positionAt(0), 0)).toEqual({
        x: 5,
        y: 0,
        z: -5,
      });
      expect(adapter.sample(positionAt(500), 0)).toEqual({
        x: 0,
        y: 0,
        z: -10,
      });
      expect(adapter.sample(positionAt(1000), 0)).toEqual({
        x: -5,
        y: 0,
        z: -15,
      });
      expect(adapter.sample(positionAt(2000), 0)).toEqual({
        x: 0,
        y: 0,
        z: -25,
      });
      expect(adapter.sample(positionAt(4000), 0)).toEqual({
        x: 10,
        y: 0,
        z: -22.5,
      });
    });

    it("subtracts mixed horizontal C, including northward", () => {
      const stormMotion = { eastward: 4, northward: 3 };
      const mixed = new StormRelativeEnvironmentalAdvectionField(
        environmentalField,
        stormMotion,
      );
      const position = positionAt(1000);

      expect(mixed.sample(position, 0)).toEqual(
        expectedWorld(environmentalField, position, 0, stormMotion),
      );
      expect(mixed.sample(position, 0)).toEqual({
        x: 1,
        y: 0,
        z: -12,
      });
    });
  });

  it("is identity with the wrapped field when C = 0", () => {
    const identity = new StormRelativeEnvironmentalAdvectionField(
      environmentalField,
      { eastward: 0, northward: 0 },
    );
    const position = positionAt(1000);

    expect(identity.sample(position, 0)).toEqual(
      environmentalField.sample(position, 0),
    );
  });

  it("changes only horizontal components for nonzero C", () => {
    const stormMotion = { eastward: 4, northward: 3 };
    const relativeField = new StormRelativeEnvironmentalAdvectionField(
      environmentalField,
      stormMotion,
    );
    const position = positionAt(1000);
    const ground = environmentalField.sample(position, 0);
    const relative = relativeField.sample(position, 0);

    expect(relative.x).toBe(ground.x - stormMotion.eastward);
    expect(relative.z).toBe(ground.z + stormMotion.northward);
    expect(relative.y).toBe(ground.y);
  });

  it("does not subtract a vertical storm-motion component", () => {
    const verticalEnv = new EnvironmentalWindFieldWithVertical(profile, 2);
    const relative = new StormRelativeEnvironmentalAdvectionField(
      verticalEnv,
      { eastward: 10, northward: 5 },
    );
    const position = positionAt(1000);
    const ground = verticalEnv.sample(position, 0);
    const sampled = relative.sample(position, 0);

    expect(ground.y).toBe(2);
    expect(sampled.y).toBe(2);
    expect(sampled.x).toBe(ground.x - 10);
    expect(sampled.z).toBe(ground.z + 5);
  });

  it("forwards time unchanged to the wrapped field", () => {
    const recording = new RecordingEnvironmentalWindField(profile);
    const relative = new StormRelativeEnvironmentalAdvectionField(
      recording,
      DEMO_STORM_MOTION,
    );
    const position = positionAt(1500);

    relative.sample(position, 7.5);

    expect(recording.calls).toHaveLength(1);
    expect(recording.calls[0]!.position).toBe(position);
    expect(recording.calls[0]!.time).toBe(7.5);
  });

  it("stays steady when the wrapped field is steady", () => {
    const position = positionAt(1500);
    expect(adapter.sample(position, 0)).toEqual(adapter.sample(position, 99));
  });

  it("does not mutate position or the wrapped return; returns a fresh Vec3", () => {
    const recording = new RecordingEnvironmentalWindField(profile);
    const relative = new StormRelativeEnvironmentalAdvectionField(
      recording,
      DEMO_STORM_MOTION,
    );
    const position = { x: 10, y: 1000, z: 30 };

    const sampled = relative.sample(position, 1);
    sampled.x = 999;
    sampled.y = 999;
    sampled.z = 999;

    expect(position).toEqual({ x: 10, y: 1000, z: 30 });
    expect(recording.returned[0]).toEqual({ x: 5, y: 0, z: -15 });
    expect(sampled).not.toBe(recording.returned[0]);
    expect(relative.sample(position, 1)).toEqual({ x: -5, y: 0, z: -15 });
  });

  it("copies storm motion so later caller mutation does not change samples", () => {
    const stormMotion = { eastward: 10, northward: 0 };
    const relative = new StormRelativeEnvironmentalAdvectionField(
      environmentalField,
      stormMotion,
    );
    const position = positionAt(1000);
    const before = relative.sample(position, 0);

    stormMotion.eastward = 99;
    stormMotion.northward = 99;

    expect(relative.sample(position, 0)).toEqual(before);
  });

  it("does not change the wrapped field, profile, or hodograph data", () => {
    const position = positionAt(1000);
    const groundBefore = environmentalField.sample(position, 0);
    const profileBefore = profile.sampleAtHeight(1000);
    const hodographBefore = hodographPoints(profile);

    adapter.sample(position, 0);
    adapter.sample(positionAt(6000), 4);

    expect(environmentalField.sample(position, 0)).toEqual(groundBefore);
    expect(profile.sampleAtHeight(1000)).toEqual(profileBefore);
    expect(hodographPoints(profile)).toEqual(hodographBefore);
    expect(hodographBefore[1]).toEqual({
      height: 1000,
      eastward: 5,
      northward: 15,
    });
  });

  it("subtracts C once: adapter sample equals one diagnostic map, not two", () => {
    const position = positionAt(1000);
    const once = expectedWorld(
      environmentalField,
      position,
      0,
      DEMO_STORM_MOTION,
    );
    const twiceAtmospheric = stormRelativeWind(
      worldVelocityToAtmospheric(once),
      DEMO_STORM_MOTION,
    );

    expect(adapter.sample(position, 0)).toEqual(once);
    expect(atmosphericVelocityToWorld(twiceAtmospheric)).not.toEqual(once);
  });

  it("rejects non-finite storm motion", () => {
    expect(
      () =>
        new StormRelativeEnvironmentalAdvectionField(environmentalField, {
          eastward: Number.NaN,
          northward: 0,
        }),
    ).toThrow(StormRelativeEnvironmentalAdvectionFieldError);
    expect(
      () =>
        new StormRelativeEnvironmentalAdvectionField(environmentalField, {
          eastward: 0,
          northward: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(StormRelativeEnvironmentalAdvectionFieldError);
  });
});
