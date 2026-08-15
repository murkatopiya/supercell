import { describe, expect, it } from "vitest";
import { EnvironmentalWindField } from "../../physics/environment/EnvironmentalWindField.js";
import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import { ConstantVelocityField } from "../../physics/synthetic/ConstantVelocityField.js";
import { UpdraftField } from "../../physics/storm/UpdraftField.js";
import type { Vec3 } from "../math/Vec3.js";
import type { VelocityField } from "./VelocityField.js";
import {
  CompositeVelocityField,
  CompositeVelocityFieldError,
} from "./CompositeVelocityField.js";

class RecordingField implements VelocityField {
  readonly calls: { position: Vec3; time: number }[] = [];
  readonly returned: Vec3[] = [];

  constructor(private readonly velocity: Vec3) {}

  sample(position: Vec3, time: number): Vec3 {
    this.calls.push({ position, time });
    const value = {
      x: this.velocity.x,
      y: this.velocity.y,
      z: this.velocity.z,
    };
    this.returned.push(value);
    return value;
  }
}

describe("CompositeVelocityField", () => {
  it("sums two constant fields exactly", () => {
    const a = new ConstantVelocityField({ x: 10, y: 2, z: -3 });
    const b = new ConstantVelocityField({ x: -4, y: 5, z: 7 });
    const composite = new CompositeVelocityField([a, b]);

    expect(composite.sample({ x: 1, y: 2, z: 3 }, 0)).toEqual({
      x: 6,
      y: 7,
      z: 4,
    });
  });

  it("preserves environment horizontal and vertical contribution at a point", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 1000,
        velocity: { eastward: 10, northward: 4, vertical: 0 },
      },
      {
        height: 2000,
        velocity: { eastward: 20, northward: 8, vertical: 0 },
      },
    ]);
    const env = new EnvironmentalWindField(profile);
    const vertical = new ConstantVelocityField({ x: 0, y: 12, z: 0 });
    const composite = new CompositeVelocityField([env, vertical]);
    const position = { x: 50, y: 1500, z: -20 };

    const envV = env.sample(position, 0);
    const total = composite.sample(position, 0);

    expect(total.x).toBe(envV.x);
    expect(total.z).toBe(envV.z);
    expect(total.y).toBe(12);
  });

  it("is order-independent for simple finite operands", () => {
    const a = new ConstantVelocityField({ x: 1, y: 2, z: 3 });
    const b = new ConstantVelocityField({ x: 4, y: 5, z: 6 });

    const ab = new CompositeVelocityField([a, b]).sample(
      { x: 0, y: 0, z: 0 },
      1,
    );
    const ba = new CompositeVelocityField([b, a]).sample(
      { x: 0, y: 0, z: 0 },
      1,
    );

    expect(ab).toEqual(ba);
  });

  it("matches the single operand values when n = 1", () => {
    const only = new ConstantVelocityField({ x: 3, y: -1, z: 8 });
    const composite = new CompositeVelocityField([only]);
    const position = { x: 9, y: 8, z: 7 };

    expect(composite.sample(position, 2)).toEqual(only.sample(position, 2));
  });

  it("rejects an empty field list", () => {
    expect(() => new CompositeVelocityField([])).toThrow(
      CompositeVelocityFieldError,
    );
  });

  it("samples every child at the same position and time", () => {
    const a = new RecordingField({ x: 1, y: 0, z: 0 });
    const b = new RecordingField({ x: 0, y: 2, z: 0 });
    const composite = new CompositeVelocityField([a, b]);
    const position = { x: 11, y: 22, z: 33 };
    const time = 7.5;

    composite.sample(position, time);

    expect(a.calls).toHaveLength(1);
    expect(b.calls).toHaveLength(1);
    expect(a.calls[0]!.position).toBe(position);
    expect(b.calls[0]!.position).toBe(position);
    expect(a.calls[0]!.time).toBe(time);
    expect(b.calls[0]!.time).toBe(time);
  });

  it("does not mutate input position or child return vectors", () => {
    const a = new RecordingField({ x: 1, y: 2, z: 3 });
    const b = new RecordingField({ x: 4, y: 5, z: 6 });
    const composite = new CompositeVelocityField([a, b]);
    const position = { x: 10, y: 20, z: 30 };

    const total = composite.sample(position, 0);

    expect(position).toEqual({ x: 10, y: 20, z: 30 });
    expect(a.returned[0]).toEqual({ x: 1, y: 2, z: 3 });
    expect(b.returned[0]).toEqual({ x: 4, y: 5, z: 6 });
    expect(total).toEqual({ x: 5, y: 7, z: 9 });
    expect(total).not.toBe(a.returned[0]);
    expect(total).not.toBe(b.returned[0]);
  });

  it("uses a shallow copy of the operand list", () => {
    const a = new ConstantVelocityField({ x: 1, y: 0, z: 0 });
    const b = new ConstantVelocityField({ x: 0, y: 1, z: 0 });
    const fields: VelocityField[] = [a];
    const composite = new CompositeVelocityField(fields);

    fields.push(b);

    expect(composite.sample({ x: 0, y: 0, z: 0 }, 0)).toEqual({
      x: 1,
      y: 0,
      z: 0,
    });
  });

  it("structurally sums EnvironmentalWindField and UpdraftField", () => {
    const profile = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 8, northward: -2, vertical: 0 },
      },
      {
        height: 3000,
        velocity: { eastward: 18, northward: 6, vertical: 0 },
      },
    ]);
    const env = new EnvironmentalWindField(profile);
    const updraft = new UpdraftField({
      centerX: 1000,
      centerZ: -500,
      peakVerticalVelocity: 20,
      sigma: 2000,
    });
    const composite = new CompositeVelocityField([env, updraft]);

    const points = [
      { x: 1000, y: 1500, z: -500 },
      { x: 2500, y: 800, z: -200 },
    ];

    for (const position of points) {
      const envV = env.sample(position, 0);
      const upV = updraft.sample(position, 0);
      const total = composite.sample(position, 0);

      expect(total.x).toBeCloseTo(envV.x + upV.x, 12);
      expect(total.y).toBeCloseTo(envV.y + upV.y, 12);
      expect(total.z).toBeCloseTo(envV.z + upV.z, 12);
    }
  });
});
