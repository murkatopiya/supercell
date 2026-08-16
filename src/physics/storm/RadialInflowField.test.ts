import { describe, expect, it } from "vitest";
import {
  RadialInflowField,
  RadialInflowFieldError,
} from "./RadialInflowField.js";

describe("RadialInflowField", () => {
  const centerX = 1000;
  const centerZ = -500;
  const radialStrainRate = 0.05;
  const sigma = 2000;

  function createField() {
    return new RadialInflowField({
      centerX,
      centerZ,
      radialStrainRate,
      sigma,
    });
  }

  function envelope(r2: number): number {
    return Math.exp(-r2 / (2 * sigma * sigma));
  }

  function expectedVelocity(dx: number, dz: number) {
    const E = envelope(dx * dx + dz * dz);
    return {
      x: -radialStrainRate * E * dx,
      y: 0,
      z: -radialStrainRate * E * dz,
    };
  }

  it("samples zero velocity on the axis", () => {
    const field = createField();
    const v = field.sample({ x: centerX, y: 1500, z: centerZ }, 0);

    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
    expect(v.z).toBe(0);
  });

  it("returns Vy = 0 at sampled points", () => {
    const field = createField();
    const points = [
      { x: centerX, y: 0, z: centerZ },
      { x: centerX + 3000, y: 1000, z: centerZ - 1000 },
      { x: centerX - 50, y: -200, z: centerZ + 50 },
    ];

    for (const p of points) {
      expect(field.sample(p, 0).y).toBe(0);
    }
  });

  it("is radially inward for r > 0", () => {
    const field = createField();
    const offsets = [
      { dx: 500, dz: 0 },
      { dx: 0, dz: -800 },
      { dx: 1200, dz: -400 },
      { dx: -700, dz: 2500 },
    ];

    for (const { dx, dz } of offsets) {
      const v = field.sample(
        { x: centerX + dx, y: 42, z: centerZ + dz },
        0,
      );
      expect(dx * v.x + dz * v.z).toBeLessThan(0);
    }
  });

  it("has no tangential component", () => {
    const field = createField();
    const offsets = [
      { dx: 0, dz: 0 },
      { dx: 500, dz: 0 },
      { dx: 0, dz: -800 },
      { dx: 1200, dz: -400 },
      { dx: -700, dz: 2500 },
    ];

    for (const { dx, dz } of offsets) {
      const v = field.sample(
        { x: centerX + dx, y: 42, z: centerZ + dz },
        0,
      );
      expect(dx * v.z - dz * v.x).toBeCloseTo(0, 12);
    }
  });

  it("is axisymmetric: equal r yields equal speed magnitude", () => {
    const field = createField();
    const r = 1500;
    const expectedSpeed = radialStrainRate * r * envelope(r * r);

    const samples = [
      field.sample({ x: centerX + r, y: 0, z: centerZ }, 0),
      field.sample({ x: centerX, y: 800, z: centerZ + r }, 0),
      field.sample({ x: centerX - r, y: 200, z: centerZ }, 0),
      field.sample(
        {
          x: centerX - r / Math.SQRT2,
          y: 50,
          z: centerZ + r / Math.SQRT2,
        },
        0,
      ),
    ];

    for (const v of samples) {
      const speed = Math.hypot(v.x, v.z);
      expect(speed).toBeCloseTo(expectedSpeed, 12);
      expect(v.y).toBe(0);
    }
  });

  it("matches the Gaussian-modulated formula off-axis and at large r", () => {
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
      const expected = expectedVelocity(dx, dz);
      expect(v.x).toBeCloseTo(expected.x, 12);
      expect(v.y).toBe(0);
      expect(v.z).toBeCloseTo(expected.z, 12);
    }
  });

  it("points toward the axis at cardinal points", () => {
    const field = createField();
    const d = 1000;
    const E = envelope(d * d);
    const speed = radialStrainRate * E * d;

    const east = field.sample({ x: centerX + d, y: 300, z: centerZ }, 0);
    expect(east.x).toBeCloseTo(-speed, 12);
    expect(east.y).toBe(0);
    expect(east.z).toBeCloseTo(0, 12);

    const west = field.sample({ x: centerX - d, y: 300, z: centerZ }, 0);
    expect(west.x).toBeCloseTo(speed, 12);
    expect(west.y).toBe(0);
    expect(west.z).toBeCloseTo(0, 12);

    const north = field.sample({ x: centerX, y: 300, z: centerZ - d }, 0);
    expect(north.x).toBeCloseTo(0, 12);
    expect(north.y).toBe(0);
    expect(north.z).toBeCloseTo(speed, 12);

    const south = field.sample({ x: centerX, y: 300, z: centerZ + d }, 0);
    expect(south.x).toBeCloseTo(0, 12);
    expect(south.y).toBe(0);
    expect(south.z).toBeCloseTo(-speed, 12);
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

  it("rejects non-finite parameters", () => {
    const base = {
      centerX,
      centerZ,
      radialStrainRate,
      sigma,
    };

    expect(
      () => new RadialInflowField({ ...base, centerX: Number.NaN }),
    ).toThrow(RadialInflowFieldError);
    expect(
      () =>
        new RadialInflowField({
          ...base,
          centerZ: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(RadialInflowFieldError);
    expect(
      () =>
        new RadialInflowField({
          ...base,
          radialStrainRate: Number.NEGATIVE_INFINITY,
        }),
    ).toThrow(RadialInflowFieldError);
    expect(
      () => new RadialInflowField({ ...base, sigma: Number.NaN }),
    ).toThrow(RadialInflowFieldError);
  });

  it("rejects sigma <= 0 and radialStrainRate <= 0", () => {
    const base = {
      centerX,
      centerZ,
      radialStrainRate,
      sigma,
    };

    expect(() => new RadialInflowField({ ...base, sigma: 0 })).toThrow(
      RadialInflowFieldError,
    );
    expect(() => new RadialInflowField({ ...base, sigma: -1 })).toThrow(
      RadialInflowFieldError,
    );
    expect(
      () => new RadialInflowField({ ...base, radialStrainRate: 0 }),
    ).toThrow(RadialInflowFieldError);
    expect(
      () => new RadialInflowField({ ...base, radialStrainRate: -0.02 }),
    ).toThrow(RadialInflowFieldError);
  });
});
