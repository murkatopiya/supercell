import { describe, expect, it } from "vitest";
import { UpdraftField, UpdraftFieldError } from "./UpdraftField.js";

describe("UpdraftField", () => {
  const centerX = 1000;
  const centerZ = -500;
  const peakVerticalVelocity = 20;
  const sigma = 2000;

  function createField() {
    return new UpdraftField({
      centerX,
      centerZ,
      peakVerticalVelocity,
      sigma,
    });
  }

  function expectedW(r2: number): number {
    return peakVerticalVelocity * Math.exp(-r2 / (2 * sigma * sigma));
  }

  it("samples peak upward velocity on the axis", () => {
    const field = createField();
    const v = field.sample({ x: centerX, y: 1500, z: centerZ }, 0);

    expect(v.x).toBe(0);
    expect(v.y).toBe(peakVerticalVelocity);
    expect(v.z).toBe(0);
  });

  it("is axisymmetric: equal r yields equal w", () => {
    const field = createField();
    const r = 1500;
    const a = field.sample({ x: centerX + r, y: 0, z: centerZ }, 0);
    const b = field.sample({ x: centerX, y: 800, z: centerZ + r }, 0);
    const c = field.sample(
      { x: centerX - r / Math.SQRT2, y: 200, z: centerZ + r / Math.SQRT2 },
      0,
    );

    expect(a.y).toBeCloseTo(b.y, 12);
    expect(a.y).toBeCloseTo(c.y, 12);
    expect(a.y).toBeCloseTo(expectedW(r * r), 12);
  });

  it("returns Vx = Vz = 0 at sampled points", () => {
    const field = createField();
    const points = [
      { x: centerX, y: 0, z: centerZ },
      { x: centerX + 3000, y: 1000, z: centerZ - 1000 },
      { x: centerX - 50, y: -200, z: centerZ + 50 },
    ];

    for (const p of points) {
      const v = field.sample(p, 0);
      expect(v.x).toBe(0);
      expect(v.z).toBe(0);
    }
  });

  it("matches the Gaussian formula off-axis and at large r", () => {
    const field = createField();
    const offsets = [
      { dx: 500, dz: 0 },
      { dx: 0, dz: 4000 },
      { dx: 10000, dz: -7000 },
    ];

    for (const { dx, dz } of offsets) {
      const v = field.sample(
        { x: centerX + dx, y: 42, z: centerZ + dz },
        0,
      );
      const r2 = dx * dx + dz * dz;
      expect(v.y).toBeCloseTo(expectedW(r2), 12);
      expect(v.x).toBe(0);
      expect(v.z).toBe(0);
    }
  });

  it("is height-independent", () => {
    const field = createField();
    const x = centerX + 800;
    const z = centerZ - 300;
    const atLow = field.sample({ x, y: 0, z }, 0);
    const atHigh = field.sample({ x, y: 12000, z }, 0);

    expect(atLow).toEqual(atHigh);
  });

  it("is steady and does not mutate the sampled position", () => {
    const field = createField();
    const position = { x: centerX + 100, y: 50, z: centerZ - 20 };

    const v0 = field.sample(position, 0);
    const v1 = field.sample(position, 99);
    expect(v0).toEqual(v1);
    expect(v0).not.toBe(v1);

    field.sample(position, 0);
    expect(position).toEqual({ x: centerX + 100, y: 50, z: centerZ - 20 });
  });

  it("decays monotonically with radius for W0 > 0", () => {
    const field = createField();
    const w0 = field.sample({ x: centerX, y: 0, z: centerZ }, 0).y;
    const w1 = field.sample({ x: centerX + 1000, y: 0, z: centerZ }, 0).y;
    const w2 = field.sample({ x: centerX + 3000, y: 0, z: centerZ }, 0).y;

    expect(w0).toBeGreaterThan(w1);
    expect(w1).toBeGreaterThan(w2);
    expect(w2).toBeGreaterThan(0);
  });

  it("rejects non-finite parameters", () => {
    const base = {
      centerX,
      centerZ,
      peakVerticalVelocity,
      sigma,
    };

    expect(
      () => new UpdraftField({ ...base, centerX: Number.NaN }),
    ).toThrow(UpdraftFieldError);
    expect(
      () => new UpdraftField({ ...base, centerZ: Number.POSITIVE_INFINITY }),
    ).toThrow(UpdraftFieldError);
    expect(
      () =>
        new UpdraftField({
          ...base,
          peakVerticalVelocity: Number.NEGATIVE_INFINITY,
        }),
    ).toThrow(UpdraftFieldError);
    expect(
      () => new UpdraftField({ ...base, sigma: Number.NaN }),
    ).toThrow(UpdraftFieldError);
  });

  it("rejects sigma <= 0 and peakVerticalVelocity <= 0", () => {
    const base = {
      centerX,
      centerZ,
      peakVerticalVelocity,
      sigma,
    };

    expect(() => new UpdraftField({ ...base, sigma: 0 })).toThrow(
      UpdraftFieldError,
    );
    expect(() => new UpdraftField({ ...base, sigma: -1 })).toThrow(
      UpdraftFieldError,
    );
    expect(
      () => new UpdraftField({ ...base, peakVerticalVelocity: 0 }),
    ).toThrow(UpdraftFieldError);
    expect(
      () => new UpdraftField({ ...base, peakVerticalVelocity: -5 }),
    ).toThrow(UpdraftFieldError);
  });
});
