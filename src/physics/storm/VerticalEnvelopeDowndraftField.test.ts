import { describe, expect, it } from "vitest";
import {
  VerticalEnvelopeDowndraftField,
  VerticalEnvelopeDowndraftFieldError,
} from "./VerticalEnvelopeDowndraftField.js";

describe("VerticalEnvelopeDowndraftField", () => {
  const centerX = 1000;
  const centerZ = -500;
  const peakDownwardVelocity = 20;
  const sigma = 2000;
  const baseHeight = 500;
  const topHeight = 4500;
  const heightSpan = topHeight - baseHeight;
  const yMid = (baseHeight + topHeight) / 2;

  function createField() {
    return new VerticalEnvelopeDowndraftField({
      centerX,
      centerZ,
      peakDownwardVelocity,
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

  function expectedVy(dx: number, dz: number, y: number): number {
    return (
      -peakDownwardVelocity *
      radialEnvelope(dx * dx + dz * dz) *
      verticalEnvelope(y)
    );
  }

  function interiorDVyDy(dx: number, dz: number, y: number): number {
    const xi = (y - baseHeight) / heightSpan;
    return (
      -peakDownwardVelocity *
      radialEnvelope(dx * dx + dz * dz) *
      (Math.PI / heightSpan) *
      Math.cos(Math.PI * xi)
    );
  }

  it("samples peak downward velocity on the axis at y_mid", () => {
    const field = createField();
    const v = field.sample({ x: centerX, y: yMid, z: centerZ }, 0);

    expect(v.x).toBe(0);
    expect(v.y).toBe(-peakDownwardVelocity);
    expect(v.z).toBe(0);
  });

  it("matches -D0 E_r off-axis at y_mid", () => {
    const field = createField();
    const dx = 800;
    const dz = -300;
    const v = field.sample({ x: centerX + dx, y: yMid, z: centerZ + dz }, 0);

    expect(v.x).toBe(0);
    expect(v.z).toBe(0);
    expect(v.y).toBeCloseTo(expectedVy(dx, dz, yMid), 12);
    expect(v.y).toBeLessThan(0);
    expect(v.y).toBeGreaterThan(-peakDownwardVelocity);
  });

  it("is zero on the axis at both lids", () => {
    const field = createField();
    const atBase = field.sample({ x: centerX, y: baseHeight, z: centerZ }, 0);
    const atTop = field.sample({ x: centerX, y: topHeight, z: centerZ }, 0);

    expect(atBase.x).toBe(0);
    expect(atBase.z).toBe(0);
    expect(atBase.y).toBeCloseTo(0, 12);
    expect(atTop.x).toBe(0);
    expect(atTop.z).toBe(0);
    expect(atTop.y).toBeCloseTo(0, 12);
  });

  it("is zero below and above the active layer", () => {
    const field = createField();
    const points = [
      { x: centerX, y: baseHeight - 1, z: centerZ },
      { x: centerX + 400, y: -200, z: centerZ - 100 },
      { x: centerX, y: topHeight + 1, z: centerZ },
      { x: centerX - 900, y: 12000, z: centerZ + 50 },
    ];

    for (const p of points) {
      const v = field.sample(p, 0);
      expect(v).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("matches the separable formula off-axis and off-midpoint", () => {
    const field = createField();
    const dx = 500;
    const dz = 400;
    const y = yMid - 900;
    const v = field.sample({ x: centerX + dx, y, z: centerZ + dz }, 0);

    expect(v.x).toBe(0);
    expect(v.z).toBe(0);
    expect(v.y).toBeCloseTo(expectedVy(dx, dz, y), 12);
    expect(v.y).toBeLessThan(0);
    expect(v.y).toBeGreaterThan(-peakDownwardVelocity);
  });

  it("has |Vy| symmetric about y_mid", () => {
    const field = createField();
    const delta = 700;
    const x = centerX + 250;
    const z = centerZ - 80;
    const above = field.sample({ x, y: yMid + delta, z }, 0);
    const below = field.sample({ x, y: yMid - delta, z }, 0);

    expect(above.y).toBeCloseTo(below.y, 12);
  });

  it("is axisymmetric at fixed height: equal r yields equal Vy", () => {
    const field = createField();
    const r = 1500;
    const y = yMid - 400;
    const a = field.sample({ x: centerX + r, y, z: centerZ }, 0);
    const b = field.sample({ x: centerX, y, z: centerZ + r }, 0);
    const c = field.sample(
      { x: centerX - r / Math.SQRT2, y, z: centerZ + r / Math.SQRT2 },
      0,
    );

    expect(a.y).toBeCloseTo(b.y, 12);
    expect(a.y).toBeCloseTo(c.y, 12);
    expect(a.y).toBeCloseTo(expectedVy(r, 0, y), 12);
  });

  it("depends on height inside the open layer except at symmetric pairs", () => {
    const field = createField();
    const atMid = field.sample({ x: centerX, y: yMid, z: centerZ }, 0);
    const below = field.sample({ x: centerX, y: yMid - 800, z: centerZ }, 0);
    const above = field.sample({ x: centerX, y: yMid + 800, z: centerZ }, 0);

    expect(below.y).not.toBe(atMid.y);
    expect(above.y).not.toBe(atMid.y);
    expect(below.y).toBeCloseTo(above.y, 12);
    expect(below.y).toBeLessThan(0);
    expect(below.y).toBeGreaterThan(-peakDownwardVelocity);
  });

  it("has Vy <= 0 at sampled points", () => {
    const field = createField();
    const points = [
      { x: centerX, y: yMid, z: centerZ },
      { x: centerX + 3000, y: yMid - 200, z: centerZ - 1000 },
      { x: centerX - 50, y: baseHeight, z: centerZ + 50 },
      { x: centerX, y: topHeight, z: centerZ },
      { x: centerX, y: baseHeight - 40, z: centerZ },
      { x: centerX, y: topHeight + 40, z: centerZ },
      { x: 0, y: 0, z: 0 },
    ];

    for (const p of points) {
      const v = field.sample(p, 0);
      expect(v.y).toBeLessThanOrEqual(0);
    }
  });

  it("returns Vx = Vz = 0 at sampled points", () => {
    const field = createField();
    const points = [
      { x: centerX, y: yMid, z: centerZ },
      { x: centerX + 3000, y: yMid - 200, z: centerZ - 1000 },
      { x: centerX - 50, y: baseHeight, z: centerZ + 50 },
      { x: centerX, y: topHeight + 40, z: centerZ },
    ];

    for (const p of points) {
      const v = field.sample(p, 0);
      expect(v.x).toBe(0);
      expect(v.z).toBe(0);
    }
  });

  it("is steady, returns a fresh Vec3, and does not mutate the sampled position", () => {
    const field = createField();
    const position = { x: centerX + 100, y: yMid - 50, z: centerZ - 20 };

    const v0 = field.sample(position, 0);
    const v1 = field.sample(position, 99);
    expect(v0).toEqual(v1);
    expect(v0).not.toBe(v1);

    field.sample(position, 0);
    expect(position).toEqual({ x: centerX + 100, y: yMid - 50, z: centerZ - 20 });
  });

  it("has interior ∂Vy/∂y < 0 below y_mid, = 0 at y_mid, > 0 above", () => {
    const field = createField();
    const h = 1;
    const lowerY = yMid - 1000;
    const upperY = yMid + 1000;

    const lowerAnalytic = interiorDVyDy(0, 0, lowerY);
    const midAnalytic = interiorDVyDy(0, 0, yMid);
    const upperAnalytic = interiorDVyDy(0, 0, upperY);

    expect(lowerAnalytic).toBeLessThan(0);
    expect(midAnalytic).toBeCloseTo(0, 12);
    expect(upperAnalytic).toBeGreaterThan(0);

    const lowerFd =
      (field.sample({ x: centerX, y: lowerY + h, z: centerZ }, 0).y -
        field.sample({ x: centerX, y: lowerY - h, z: centerZ }, 0).y) /
      (2 * h);
    const midFd =
      (field.sample({ x: centerX, y: yMid + h, z: centerZ }, 0).y -
        field.sample({ x: centerX, y: yMid - h, z: centerZ }, 0).y) /
      (2 * h);
    const upperFd =
      (field.sample({ x: centerX, y: upperY + h, z: centerZ }, 0).y -
        field.sample({ x: centerX, y: upperY - h, z: centerZ }, 0).y) /
      (2 * h);

    expect(lowerFd).toBeLessThan(0);
    expect(lowerFd).toBeCloseTo(lowerAnalytic, 6);
    expect(midFd).toBeCloseTo(0, 6);
    expect(upperFd).toBeGreaterThan(0);
    expect(upperFd).toBeCloseTo(upperAnalytic, 6);
  });

  it("does not treat classical ∂Vy/∂y as defined at the lids", () => {
    const field = createField();
    const h = 1;
    const interiorBase =
      (field.sample({ x: centerX, y: baseHeight + h, z: centerZ }, 0).y -
        field.sample({ x: centerX, y: baseHeight, z: centerZ }, 0).y) /
      h;
    const exteriorBase =
      (field.sample({ x: centerX, y: baseHeight, z: centerZ }, 0).y -
        field.sample({ x: centerX, y: baseHeight - h, z: centerZ }, 0).y) /
      h;
    const interiorTop =
      (field.sample({ x: centerX, y: topHeight, z: centerZ }, 0).y -
        field.sample({ x: centerX, y: topHeight - h, z: centerZ }, 0).y) /
      h;
    const exteriorTop =
      (field.sample({ x: centerX, y: topHeight + h, z: centerZ }, 0).y -
        field.sample({ x: centerX, y: topHeight, z: centerZ }, 0).y) /
      h;

    expect(interiorBase).toBeCloseTo(
      (-peakDownwardVelocity * Math.PI) / heightSpan,
      6,
    );
    expect(exteriorBase).toBeCloseTo(0, 12);
    expect(interiorBase).not.toBeCloseTo(exteriorBase, 6);

    expect(interiorTop).toBeCloseTo(
      (peakDownwardVelocity * Math.PI) / heightSpan,
      6,
    );
    expect(exteriorTop).toBeCloseTo(0, 12);
    expect(interiorTop).not.toBeCloseTo(exteriorTop, 6);
  });

  it("accepts negative baseHeight", () => {
    const field = new VerticalEnvelopeDowndraftField({
      centerX,
      centerZ,
      peakDownwardVelocity,
      sigma,
      baseHeight: -200,
      topHeight: 1800,
    });
    const mid = (-200 + 1800) / 2;
    const v = field.sample({ x: centerX, y: mid, z: centerZ }, 0);
    expect(v.y).toBe(-peakDownwardVelocity);
  });

  it("samples y = 0 as ordinary envelope math, not a ground branch", () => {
    const exterior = new VerticalEnvelopeDowndraftField({
      centerX,
      centerZ,
      peakDownwardVelocity,
      sigma,
      baseHeight: 500,
      topHeight: 2500,
    });
    expect(exterior.sample({ x: centerX, y: 0, z: centerZ }, 0)).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });

    const interiorBase = -200;
    const interiorTop = 1800;
    const interior = new VerticalEnvelopeDowndraftField({
      centerX,
      centerZ,
      peakDownwardVelocity,
      sigma,
      baseHeight: interiorBase,
      topHeight: interiorTop,
    });
    const atZero = interior.sample({ x: centerX, y: 0, z: centerZ }, 0);
    const fZero = Math.sin(
      (Math.PI * (0 - interiorBase)) / (interiorTop - interiorBase),
    );
    expect(atZero.x).toBe(0);
    expect(atZero.z).toBe(0);
    expect(atZero.y).toBeCloseTo(-peakDownwardVelocity * fZero, 12);
    expect(atZero.y).toBeLessThan(0);

    const lidAtZero = new VerticalEnvelopeDowndraftField({
      centerX,
      centerZ,
      peakDownwardVelocity,
      sigma,
      baseHeight: 0,
      topHeight: 2000,
    });
    expect(
      lidAtZero.sample({ x: centerX, y: 0, z: centerZ }, 0).y,
    ).toBeCloseTo(0, 12);
  });

  it("rejects non-finite parameters", () => {
    const base = {
      centerX,
      centerZ,
      peakDownwardVelocity,
      sigma,
      baseHeight,
      topHeight,
    };

    expect(
      () =>
        new VerticalEnvelopeDowndraftField({ ...base, centerX: Number.NaN }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () =>
        new VerticalEnvelopeDowndraftField({
          ...base,
          centerZ: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () =>
        new VerticalEnvelopeDowndraftField({
          ...base,
          peakDownwardVelocity: Number.NEGATIVE_INFINITY,
        }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () =>
        new VerticalEnvelopeDowndraftField({ ...base, sigma: Number.NaN }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () =>
        new VerticalEnvelopeDowndraftField({
          ...base,
          baseHeight: Number.NaN,
        }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () =>
        new VerticalEnvelopeDowndraftField({
          ...base,
          topHeight: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
  });

  it("rejects sigma <= 0, peakDownwardVelocity <= 0, and topHeight <= baseHeight", () => {
    const base = {
      centerX,
      centerZ,
      peakDownwardVelocity,
      sigma,
      baseHeight,
      topHeight,
    };

    expect(
      () => new VerticalEnvelopeDowndraftField({ ...base, sigma: 0 }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () => new VerticalEnvelopeDowndraftField({ ...base, sigma: -1 }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () =>
        new VerticalEnvelopeDowndraftField({
          ...base,
          peakDownwardVelocity: 0,
        }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () =>
        new VerticalEnvelopeDowndraftField({
          ...base,
          peakDownwardVelocity: -5,
        }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () =>
        new VerticalEnvelopeDowndraftField({
          ...base,
          topHeight: baseHeight,
        }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
    expect(
      () =>
        new VerticalEnvelopeDowndraftField({
          ...base,
          topHeight: baseHeight - 100,
        }),
    ).toThrow(VerticalEnvelopeDowndraftFieldError);
  });
});
