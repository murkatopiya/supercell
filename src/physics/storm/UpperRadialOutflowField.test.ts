import { describe, expect, it } from "vitest";
import {
  UpperRadialOutflowField,
  UpperRadialOutflowFieldError,
} from "./UpperRadialOutflowField.js";

describe("UpperRadialOutflowField", () => {
  const centerX = 1000;
  const centerZ = -500;
  const outflowStrainRate = 0.05;
  const sigma = 2000;
  const baseHeight = 500;
  const topHeight = 4500;
  const heightSpan = topHeight - baseHeight;
  const yMid = (baseHeight + topHeight) / 2;

  function createField() {
    return new UpperRadialOutflowField({
      centerX,
      centerZ,
      outflowStrainRate,
      sigma,
      baseHeight,
      topHeight,
    });
  }

  function radialEnvelope(r2: number): number {
    return Math.exp(-r2 / (2 * sigma * sigma));
  }

  function verticalEnvelope(y: number): number {
    if (y < baseHeight || y > topHeight) {
      return 0;
    }
    return Math.sin((Math.PI * (y - baseHeight)) / heightSpan);
  }

  function expectedVelocity(dx: number, dz: number, y: number) {
    const E = radialEnvelope(dx * dx + dz * dz);
    const G = verticalEnvelope(y);
    return {
      x: outflowStrainRate * E * dx * G,
      y: 0,
      z: outflowStrainRate * E * dz * G,
    };
  }

  function speed(v: { x: number; z: number }): number {
    return Math.hypot(v.x, v.z);
  }

  it("samples zero velocity on the axis at an interior height and at a lid", () => {
    const field = createField();
    const interior = field.sample({ x: centerX, y: yMid, z: centerZ }, 0);
    const atLid = field.sample({ x: centerX, y: baseHeight, z: centerZ }, 0);

    expect(interior).toEqual({ x: 0, y: 0, z: 0 });
    expect(atLid.x).toBe(0);
    expect(atLid.y).toBe(0);
    expect(atLid.z).toBe(0);
    expect(atLid.y).toBeCloseTo(0, 12);
  });

  it("returns Vy = 0 at sampled points", () => {
    const field = createField();
    const points = [
      { x: centerX, y: yMid, z: centerZ },
      { x: centerX + 3000, y: yMid - 200, z: centerZ - 1000 },
      { x: centerX - 50, y: baseHeight, z: centerZ + 50 },
      { x: centerX, y: topHeight + 40, z: centerZ },
    ];

    for (const p of points) {
      expect(field.sample(p, 0).y).toBe(0);
    }
  });

  it("is radially outward for r > 0 inside the open layer", () => {
    const field = createField();
    const offsets = [
      { dx: 500, dz: 0 },
      { dx: 0, dz: -800 },
      { dx: 1200, dz: -400 },
      { dx: -700, dz: 2500 },
    ];

    for (const { dx, dz } of offsets) {
      const v = field.sample(
        { x: centerX + dx, y: yMid - 400, z: centerZ + dz },
        0,
      );
      expect(dx * v.x + dz * v.z).toBeGreaterThan(0);
    }
  });

  it("has no tangential component", () => {
    const field = createField();
    const samples = [
      { dx: 0, dz: 0, y: yMid },
      { dx: 500, dz: 0, y: yMid - 400 },
      { dx: 0, dz: -800, y: yMid },
      { dx: 1200, dz: -400, y: baseHeight },
      { dx: -700, dz: 2500, y: topHeight + 20 },
    ];

    for (const { dx, dz, y } of samples) {
      const v = field.sample({ x: centerX + dx, y, z: centerZ + dz }, 0);
      expect(dx * v.z - dz * v.x).toBeCloseTo(0, 12);
    }
  });

  it("is axisymmetric at fixed height: equal r yields equal speed", () => {
    const field = createField();
    const r = 1500;
    const y = yMid - 400;
    const expectedSpeed =
      outflowStrainRate * r * radialEnvelope(r * r) * verticalEnvelope(y);

    const samples = [
      field.sample({ x: centerX + r, y, z: centerZ }, 0),
      field.sample({ x: centerX, y, z: centerZ + r }, 0),
      field.sample({ x: centerX - r, y, z: centerZ }, 0),
      field.sample(
        {
          x: centerX - r / Math.SQRT2,
          y,
          z: centerZ + r / Math.SQRT2,
        },
        0,
      ),
    ];

    for (const v of samples) {
      expect(speed(v)).toBeCloseTo(expectedSpeed, 12);
      expect(v.y).toBe(0);
    }
  });

  it("matches the separable formula off-axis, at y_mid, and at large r", () => {
    const field = createField();
    const cases = [
      { dx: 500, dz: 0, y: yMid },
      { dx: sigma, dz: 0, y: yMid },
      { dx: 0, dz: 4000, y: yMid - 900 },
      { dx: 10000, dz: -7000, y: yMid },
    ];

    for (const { dx, dz, y } of cases) {
      const v = field.sample({ x: centerX + dx, y, z: centerZ + dz }, 0);
      const expected = expectedVelocity(dx, dz, y);
      expect(v.x).toBeCloseTo(expected.x, 12);
      expect(v.y).toBe(0);
      expect(v.z).toBeCloseTo(expected.z, 12);
    }
  });

  it("points away from the axis at cardinal points at y_mid", () => {
    const field = createField();
    const d = 1000;
    const E = radialEnvelope(d * d);
    const G = verticalEnvelope(yMid);
    expect(G).toBeCloseTo(1, 12);
    const S = outflowStrainRate * E * d * G;

    const east = field.sample({ x: centerX + d, y: yMid, z: centerZ }, 0);
    expect(east.x).toBeCloseTo(S, 12);
    expect(east.y).toBe(0);
    expect(east.z).toBeCloseTo(0, 12);

    const west = field.sample({ x: centerX - d, y: yMid, z: centerZ }, 0);
    expect(west.x).toBeCloseTo(-S, 12);
    expect(west.y).toBe(0);
    expect(west.z).toBeCloseTo(0, 12);

    const north = field.sample({ x: centerX, y: yMid, z: centerZ - d }, 0);
    expect(north.x).toBeCloseTo(0, 12);
    expect(north.y).toBe(0);
    expect(north.z).toBeCloseTo(-S, 12);

    const south = field.sample({ x: centerX, y: yMid, z: centerZ + d }, 0);
    expect(south.x).toBeCloseTo(0, 12);
    expect(south.y).toBe(0);
    expect(south.z).toBeCloseTo(S, 12);
  });

  it("has G = 1 at y_mid and G = 0 at both lids and outside the layer", () => {
    const field = createField();
    const dx = 800;
    const atMid = field.sample(
      { x: centerX + dx, y: yMid, z: centerZ },
      0,
    );
    const atBase = field.sample(
      { x: centerX + dx, y: baseHeight, z: centerZ },
      0,
    );
    const atTop = field.sample(
      { x: centerX + dx, y: topHeight, z: centerZ },
      0,
    );
    const below = field.sample(
      { x: centerX + dx, y: baseHeight - 50, z: centerZ },
      0,
    );
    const above = field.sample(
      { x: centerX + dx, y: topHeight + 50, z: centerZ },
      0,
    );

    expect(speed(atMid)).toBeCloseTo(
      outflowStrainRate * dx * radialEnvelope(dx * dx),
      12,
    );
    expect(atBase.x).toBeCloseTo(0, 12);
    expect(atBase.z).toBeCloseTo(0, 12);
    expect(atTop.x).toBeCloseTo(0, 12);
    expect(atTop.z).toBeCloseTo(0, 12);
    expect(below).toEqual({ x: 0, y: 0, z: 0 });
    expect(above).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("depends on height inside the open layer according to G(y)", () => {
    const field = createField();
    const dx = 600;
    const atMid = field.sample({ x: centerX + dx, y: yMid, z: centerZ }, 0);
    const lower = field.sample(
      { x: centerX + dx, y: yMid - 800, z: centerZ },
      0,
    );
    const expectedLower = expectedVelocity(dx, 0, yMid - 800);

    expect(speed(lower)).not.toBe(speed(atMid));
    expect(speed(lower)).toBeGreaterThan(0);
    expect(speed(lower)).toBeLessThan(speed(atMid));
    expect(lower.x).toBeCloseTo(expectedLower.x, 12);
    expect(lower.z).toBeCloseTo(expectedLower.z, 12);
  });

  it("is symmetric about y_mid", () => {
    const field = createField();
    const delta = 700;
    const x = centerX + 250;
    const z = centerZ - 80;
    const above = field.sample({ x, y: yMid + delta, z }, 0);
    const below = field.sample({ x, y: yMid - delta, z }, 0);

    expect(speed(above)).toBeCloseTo(speed(below), 12);
    expect(above.x).toBeCloseTo(below.x, 12);
    expect(above.z).toBeCloseTo(below.z, 12);
  });

  it("is zero below and above the active layer without treating sampling as an error", () => {
    const field = createField();
    const points = [
      { x: centerX, y: baseHeight - 1, z: centerZ },
      { x: centerX + 400, y: -200, z: centerZ - 100 },
      { x: centerX, y: topHeight + 1, z: centerZ },
      { x: centerX - 900, y: 12000, z: centerZ + 50 },
    ];

    for (const p of points) {
      expect(field.sample(p, 0)).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("has radial speed peak at r = sigma and y_mid", () => {
    const field = createField();
    const peak = field.sample({ x: centerX + sigma, y: yMid, z: centerZ }, 0);
    const inner = field.sample(
      { x: centerX + sigma * 0.5, y: yMid, z: centerZ },
      0,
    );
    const outer = field.sample(
      { x: centerX + sigma * 1.5, y: yMid, z: centerZ },
      0,
    );
    const expectedPeak = (outflowStrainRate * sigma) / Math.sqrt(Math.E);

    expect(speed(peak)).toBeCloseTo(expectedPeak, 12);
    expect(speed(peak)).toBeGreaterThan(speed(inner));
    expect(speed(peak)).toBeGreaterThan(speed(outer));
  });

  it("matches analytic div_h at selected points without requiring div_h > 0 everywhere", () => {
    const field = createField();
    const h = 1e-3;

    function finiteDivH(dx: number, dz: number, y: number): number {
      const dVxDx =
        (field.sample({ x: centerX + dx + h, y, z: centerZ + dz }, 0).x -
          field.sample({ x: centerX + dx - h, y, z: centerZ + dz }, 0).x) /
        (2 * h);
      const dVzDz =
        (field.sample({ x: centerX + dx, y, z: centerZ + dz + h }, 0).z -
          field.sample({ x: centerX + dx, y, z: centerZ + dz - h }, 0).z) /
        (2 * h);
      return dVxDx + dVzDz;
    }

    function analyticDivH(dx: number, dz: number, y: number): number {
      const r2 = dx * dx + dz * dz;
      return (
        outflowStrainRate *
        radialEnvelope(r2) *
        verticalEnvelope(y) *
        (2 - r2 / (sigma * sigma))
      );
    }

    const axis = finiteDivH(0, 0, yMid);
    expect(axis).toBeCloseTo(2 * outflowStrainRate, 6);
    expect(axis).toBeCloseTo(analyticDivH(0, 0, yMid), 6);

    const signChangeR = sigma * Math.SQRT2;
    expect(finiteDivH(signChangeR, 0, yMid)).toBeCloseTo(0, 6);

    const far = finiteDivH(2 * sigma, 0, yMid);
    expect(far).toBeLessThan(0);
    expect(far).toBeCloseTo(analyticDivH(2 * sigma, 0, yMid), 6);
  });

  it("is steady and does not mutate the sampled position", () => {
    const field = createField();
    const position = { x: centerX + 100, y: yMid - 50, z: centerZ - 20 };

    const v0 = field.sample(position, 0);
    const v1 = field.sample(position, 99);
    expect(v0).toEqual(v1);
    expect(v0).not.toBe(v1);

    field.sample(position, 0);
    expect(position).toEqual({
      x: centerX + 100,
      y: yMid - 50,
      z: centerZ - 20,
    });
  });

  it("accepts negative baseHeight", () => {
    const field = new UpperRadialOutflowField({
      centerX,
      centerZ,
      outflowStrainRate,
      sigma,
      baseHeight: -200,
      topHeight: 1800,
    });
    const mid = (-200 + 1800) / 2;
    const d = 400;
    const v = field.sample({ x: centerX + d, y: mid, z: centerZ }, 0);
    const E = Math.exp(-(d * d) / (2 * sigma * sigma));
    expect(v.x).toBeCloseTo(outflowStrainRate * E * d, 12);
    expect(v.y).toBe(0);
    expect(v.z).toBe(0);
  });

  it("rejects non-finite parameters", () => {
    const base = {
      centerX,
      centerZ,
      outflowStrainRate,
      sigma,
      baseHeight,
      topHeight,
    };

    expect(
      () => new UpperRadialOutflowField({ ...base, centerX: Number.NaN }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () =>
        new UpperRadialOutflowField({
          ...base,
          centerZ: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () =>
        new UpperRadialOutflowField({
          ...base,
          outflowStrainRate: Number.NEGATIVE_INFINITY,
        }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () => new UpperRadialOutflowField({ ...base, sigma: Number.NaN }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () =>
        new UpperRadialOutflowField({
          ...base,
          baseHeight: Number.NaN,
        }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () =>
        new UpperRadialOutflowField({
          ...base,
          topHeight: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(UpperRadialOutflowFieldError);
  });

  it("rejects sigma <= 0, outflowStrainRate <= 0, and topHeight <= baseHeight", () => {
    const base = {
      centerX,
      centerZ,
      outflowStrainRate,
      sigma,
      baseHeight,
      topHeight,
    };

    expect(
      () => new UpperRadialOutflowField({ ...base, sigma: 0 }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () => new UpperRadialOutflowField({ ...base, sigma: -1 }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () =>
        new UpperRadialOutflowField({
          ...base,
          outflowStrainRate: 0,
        }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () =>
        new UpperRadialOutflowField({
          ...base,
          outflowStrainRate: -0.02,
        }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () =>
        new UpperRadialOutflowField({
          ...base,
          topHeight: baseHeight,
        }),
    ).toThrow(UpperRadialOutflowFieldError);
    expect(
      () =>
        new UpperRadialOutflowField({
          ...base,
          topHeight: baseHeight - 100,
        }),
    ).toThrow(UpperRadialOutflowFieldError);
  });
});
