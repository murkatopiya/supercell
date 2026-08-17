import { describe, expect, it } from "vitest";
import { RadialInflowField } from "./RadialInflowField.js";
import {
  NearGroundRadialOutflowField,
  NearGroundRadialOutflowFieldError,
} from "./NearGroundRadialOutflowField.js";
import fieldSrc from "./NearGroundRadialOutflowField.ts?raw";
import acceptanceSrc from "../../simulation/nearGroundRadialOutflowFieldTracer.acceptance.test.ts?raw";

describe("NearGroundRadialOutflowField", () => {
  const centerX = 1000;
  const centerZ = -500;
  const outflowStrainRate = 0.05;
  const sigma = 2000;
  const baseHeight = 500;
  const topHeight = 4500;
  const heightSpan = topHeight - baseHeight;
  const yMidTaper = (baseHeight + topHeight) / 2;

  function createField() {
    return new NearGroundRadialOutflowField({
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
    if (y >= topHeight) {
      return 0;
    }
    if (y <= baseHeight) {
      return 1;
    }
    return Math.cos((Math.PI * (y - baseHeight)) / (2 * heightSpan));
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

  it("samples zero velocity on the axis on the plateau, in the taper, and at topHeight", () => {
    const field = createField();
    const plateau = field.sample({ x: centerX, y: baseHeight - 80, z: centerZ }, 0);
    const taper = field.sample({ x: centerX, y: yMidTaper, z: centerZ }, 0);
    const atTop = field.sample({ x: centerX, y: topHeight, z: centerZ }, 0);

    expect(plateau).toEqual({ x: 0, y: 0, z: 0 });
    expect(taper).toEqual({ x: 0, y: 0, z: 0 });
    expect(atTop).toEqual({ x: 0, y: 0, z: 0 });
    expect(Object.is(plateau.x, 0)).toBe(true);
    expect(Object.is(plateau.y, 0)).toBe(true);
    expect(Object.is(plateau.z, 0)).toBe(true);
  });

  it("returns Vy = 0 at sampled points", () => {
    const field = createField();
    const points = [
      { x: centerX, y: baseHeight, z: centerZ },
      { x: centerX + 3000, y: yMidTaper, z: centerZ - 1000 },
      { x: centerX - 50, y: baseHeight - 200, z: centerZ + 50 },
      { x: centerX, y: topHeight + 40, z: centerZ },
      { x: centerX + 400, y: 0, z: centerZ },
    ];

    for (const p of points) {
      expect(field.sample(p, 0).y).toBe(0);
    }
  });

  it("is radially outward for r > 0 where G > 0", () => {
    const field = createField();
    const offsets = [
      { dx: 500, dz: 0, y: baseHeight },
      { dx: 0, dz: -800, y: baseHeight - 100 },
      { dx: 1200, dz: -400, y: yMidTaper },
      { dx: -700, dz: 2500, y: yMidTaper + 200 },
      { dx: 400, dz: 100, y: 0 },
    ];

    for (const { dx, dz, y } of offsets) {
      const v = field.sample({ x: centerX + dx, y, z: centerZ + dz }, 0);
      expect(dx * v.x + dz * v.z).toBeGreaterThan(0);
    }
  });

  it("has no tangential component", () => {
    const field = createField();
    const samples = [
      { dx: 0, dz: 0, y: baseHeight },
      { dx: 500, dz: 0, y: yMidTaper },
      { dx: 0, dz: -800, y: baseHeight - 50 },
      { dx: 1200, dz: -400, y: topHeight },
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
    const y = yMidTaper;
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

  it("matches the separable formula on the plateau, in the taper, and at large r", () => {
    const field = createField();
    const cases = [
      { dx: 500, dz: 0, y: baseHeight },
      { dx: 500, dz: 0, y: baseHeight - 120 },
      { dx: sigma, dz: 0, y: baseHeight },
      { dx: 0, dz: 4000, y: yMidTaper },
      { dx: 10000, dz: -7000, y: yMidTaper },
      { dx: 800, dz: 0, y: 0 },
    ];

    for (const { dx, dz, y } of cases) {
      const v = field.sample({ x: centerX + dx, y, z: centerZ + dz }, 0);
      const expected = expectedVelocity(dx, dz, y);
      expect(v.x).toBeCloseTo(expected.x, 12);
      expect(v.y).toBe(0);
      expect(v.z).toBeCloseTo(expected.z, 12);
    }
  });

  it("matches sign-reversed RadialInflowField on the entire lower plateau", () => {
    const field = createField();
    const primitive = new RadialInflowField({
      centerX,
      centerZ,
      radialStrainRate: outflowStrainRate,
      sigma,
    });
    const points = [
      { x: centerX + 800, y: baseHeight, z: centerZ - 120 },
      { x: centerX + 800, y: baseHeight - 1, z: centerZ - 120 },
      { x: centerX - 400, y: -200, z: centerZ + 50 },
      { x: centerX + sigma, y: 0, z: centerZ },
    ];

    for (const p of points) {
      const actual = field.sample(p, 0);
      const inflow = primitive.sample(p, 0);
      expect(actual.x).toBeCloseTo(-inflow.x, 12);
      expect(actual.y).toBe(0);
      expect(actual.z).toBeCloseTo(-inflow.z, 12);
    }
  });

  it("points away from the axis at cardinal points on the plateau and in the taper", () => {
    const field = createField();
    const d = 1000;
    const E = radialEnvelope(d * d);

    for (const y of [baseHeight, yMidTaper]) {
      const G = verticalEnvelope(y);
      expect(G).toBeGreaterThan(0);
      const S = outflowStrainRate * E * d * G;

      const east = field.sample({ x: centerX + d, y, z: centerZ }, 0);
      expect(east.x).toBeCloseTo(S, 12);
      expect(east.y).toBe(0);
      expect(east.z).toBeCloseTo(0, 12);
      expect(Object.is(east.z, 0)).toBe(true);

      const west = field.sample({ x: centerX - d, y, z: centerZ }, 0);
      expect(west.x).toBeCloseTo(-S, 12);
      expect(west.y).toBe(0);
      expect(west.z).toBeCloseTo(0, 12);
      expect(Object.is(west.z, 0)).toBe(true);

      const north = field.sample({ x: centerX, y, z: centerZ - d }, 0);
      expect(north.x).toBeCloseTo(0, 12);
      expect(north.y).toBe(0);
      expect(north.z).toBeCloseTo(-S, 12);
      expect(Object.is(north.x, 0)).toBe(true);

      const south = field.sample({ x: centerX, y, z: centerZ + d }, 0);
      expect(south.x).toBeCloseTo(0, 12);
      expect(south.y).toBe(0);
      expect(south.z).toBeCloseTo(S, 12);
      expect(Object.is(south.x, 0)).toBe(true);
    }
  });

  it("has G = 1 at and below baseHeight, including y = 0 and negative y", () => {
    const field = createField();
    const dx = 800;
    const plateauSpeed = outflowStrainRate * dx * radialEnvelope(dx * dx);

    const atBase = field.sample({ x: centerX + dx, y: baseHeight, z: centerZ }, 0);
    const below = field.sample(
      { x: centerX + dx, y: baseHeight - 50, z: centerZ },
      0,
    );
    const atGround = field.sample({ x: centerX + dx, y: 0, z: centerZ }, 0);
    const underground = field.sample(
      { x: centerX + dx, y: -200, z: centerZ },
      0,
    );

    expect(speed(atBase)).toBeCloseTo(plateauSpeed, 12);
    expect(speed(below)).toBeCloseTo(plateauSpeed, 12);
    expect(speed(atGround)).toBeCloseTo(plateauSpeed, 12);
    expect(speed(underground)).toBeCloseTo(plateauSpeed, 12);
    expect(below).toEqual(atBase);
    expect(atGround).toEqual(atBase);
  });

  it("has G = sqrt(2)/2 at taper midpoint, not 1, and matches quarter-cosine interior", () => {
    const field = createField();
    const dx = 800;
    const plateauSpeed = outflowStrainRate * dx * radialEnvelope(dx * dx);
    const quarterY = baseHeight + heightSpan / 4;

    const midTaper = field.sample(
      { x: centerX + dx, y: yMidTaper, z: centerZ },
      0,
    );
    const quarter = field.sample(
      { x: centerX + dx, y: quarterY, z: centerZ },
      0,
    );

    expect(speed(midTaper)).toBeCloseTo(plateauSpeed * Math.SQRT1_2, 12);
    expect(speed(midTaper)).not.toBeCloseTo(plateauSpeed, 12);
    expect(speed(quarter)).toBeCloseTo(
      plateauSpeed * Math.cos(Math.PI / 8),
      12,
    );
  });

  it("has G = 0 exactly at and above topHeight", () => {
    const field = createField();
    const dx = 800;
    const atTop = field.sample({ x: centerX + dx, y: topHeight, z: centerZ }, 0);
    const above = field.sample(
      { x: centerX + dx, y: topHeight + 50, z: centerZ },
      0,
    );

    expect(atTop).toEqual({ x: 0, y: 0, z: 0 });
    expect(above).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("has no velocity jump at baseHeight and C1 join (G' = 0 from both sides)", () => {
    const field = createField();
    const x = centerX + 700;
    const z = centerZ + 40;
    const h = 1e-3;
    const atBase = field.sample({ x, y: baseHeight, z }, 0);
    const justBelow = field.sample({ x, y: baseHeight - h, z }, 0);
    const justAbove = field.sample({ x, y: baseHeight + h, z }, 0);

    expect(speed(atBase)).toBeGreaterThan(0);
    expect(justBelow.x).toBeCloseTo(atBase.x, 12);
    expect(justBelow.z).toBeCloseTo(atBase.z, 12);
    expect(justAbove.x).toBeCloseTo(atBase.x, 10);
    expect(justAbove.z).toBeCloseTo(atBase.z, 10);

    const dVxBelow = (atBase.x - justBelow.x) / h;
    const dVxAbove = (justAbove.x - atBase.x) / h;
    expect(dVxBelow).toBeCloseTo(0, 10);
    expect(dVxAbove).toBeCloseTo(0, 6);
  });

  it("is identical at two plateau heights with the same (x, z)", () => {
    const field = createField();
    const x = centerX + 600;
    const z = centerZ - 80;
    const atBase = field.sample({ x, y: baseHeight, z }, 0);
    const below = field.sample({ x, y: baseHeight - 300, z }, 0);

    expect(below).toEqual(atBase);
  });

  it("is monotonically non-increasing in |V| as y increases", () => {
    const field = createField();
    const x = centerX + 900;
    const z = centerZ - 60;
    const heights = [
      baseHeight - 200,
      baseHeight,
      yMidTaper,
      topHeight - 100,
      topHeight,
      topHeight + 200,
    ];
    const speeds = heights.map((y) => speed(field.sample({ x, y, z }, 0)));

    expect(speeds[0]).toBeCloseTo(speeds[1], 12);
    expect(speeds[1]).toBeGreaterThan(speeds[2]);
    expect(speeds[2]).toBeGreaterThan(speeds[3]);
    expect(speeds[3]).toBeGreaterThan(0);
    expect(speeds[4]).toBe(0);
    expect(speeds[5]).toBe(0);
  });

  it("is zero at and above topHeight without treating sampling as an error", () => {
    const field = createField();
    const points = [
      { x: centerX, y: topHeight, z: centerZ },
      { x: centerX + 400, y: topHeight + 1, z: centerZ - 100 },
      { x: centerX - 900, y: 12000, z: centerZ + 50 },
    ];

    for (const p of points) {
      expect(field.sample(p, 0)).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("has radial speed peak at r = sigma on the plateau", () => {
    const field = createField();
    const y = baseHeight - 40;
    const peak = field.sample({ x: centerX + sigma, y, z: centerZ }, 0);
    const inner = field.sample({ x: centerX + sigma * 0.5, y, z: centerZ }, 0);
    const outer = field.sample({ x: centerX + sigma * 1.5, y, z: centerZ }, 0);
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

    const axis = finiteDivH(0, 0, baseHeight);
    expect(axis).toBeCloseTo(2 * outflowStrainRate, 6);
    expect(axis).toBeCloseTo(analyticDivH(0, 0, baseHeight), 6);
    expect(axis).toBeGreaterThan(0);

    const inner = finiteDivH(0.5 * sigma, 0, baseHeight);
    expect(inner).toBeGreaterThan(0);
    expect(inner).toBeCloseTo(analyticDivH(0.5 * sigma, 0, baseHeight), 6);

    const signChangeR = sigma * Math.SQRT2;
    expect(finiteDivH(signChangeR, 0, baseHeight)).toBeCloseTo(0, 6);

    const farDx = 2 * sigma;
    const far = finiteDivH(farDx, 0, baseHeight);
    expect(far).toBeLessThan(0);
    expect(far).toBeCloseTo(analyticDivH(farDx, 0, baseHeight), 6);

    const farV = field.sample(
      { x: centerX + farDx, y: baseHeight, z: centerZ },
      0,
    );
    expect(farDx * farV.x).toBeGreaterThan(0);
  });

  it("is steady, returns a new Vec3, and does not mutate the sampled position", () => {
    const field = createField();
    const position = { x: centerX + 100, y: yMidTaper, z: centerZ - 20 };

    const v0 = field.sample(position, 0);
    const v1 = field.sample(position, 99);
    expect(v0).toEqual(v1);
    expect(v0).not.toBe(v1);

    field.sample(position, 0);
    expect(position).toEqual({
      x: centerX + 100,
      y: yMidTaper,
      z: centerZ - 20,
    });
  });

  it("accepts negative baseHeight and zero baseHeight", () => {
    const negativeBase = new NearGroundRadialOutflowField({
      centerX,
      centerZ,
      outflowStrainRate,
      sigma,
      baseHeight: -200,
      topHeight: 1800,
    });
    const d = 400;
    const below = negativeBase.sample({ x: centerX + d, y: -400, z: centerZ }, 0);
    const atBase = negativeBase.sample({ x: centerX + d, y: -200, z: centerZ }, 0);
    const E = Math.exp(-(d * d) / (2 * sigma * sigma));
    const expected = outflowStrainRate * E * d;

    expect(below.x).toBeCloseTo(expected, 12);
    expect(atBase.x).toBeCloseTo(expected, 12);
    expect(below).toEqual(atBase);
    expect(below.y).toBe(0);
    expect(below.z).toBe(0);

    const zeroBase = new NearGroundRadialOutflowField({
      centerX,
      centerZ,
      outflowStrainRate,
      sigma,
      baseHeight: 0,
      topHeight: 1800,
    });
    const atGround = zeroBase.sample({ x: centerX + d, y: 0, z: centerZ }, 0);
    expect(atGround.x).toBeCloseTo(expected, 12);
    expect(atGround.y).toBe(0);
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
      () => new NearGroundRadialOutflowField({ ...base, centerX: Number.NaN }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () =>
        new NearGroundRadialOutflowField({
          ...base,
          centerZ: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () =>
        new NearGroundRadialOutflowField({
          ...base,
          outflowStrainRate: Number.NEGATIVE_INFINITY,
        }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () => new NearGroundRadialOutflowField({ ...base, sigma: Number.NaN }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () =>
        new NearGroundRadialOutflowField({
          ...base,
          baseHeight: Number.NaN,
        }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () =>
        new NearGroundRadialOutflowField({
          ...base,
          topHeight: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(NearGroundRadialOutflowFieldError);
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
      () => new NearGroundRadialOutflowField({ ...base, sigma: 0 }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () => new NearGroundRadialOutflowField({ ...base, sigma: -1 }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () => new NearGroundRadialOutflowField({ ...base, outflowStrainRate: 0 }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () =>
        new NearGroundRadialOutflowField({ ...base, outflowStrainRate: -0.02 }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () =>
        new NearGroundRadialOutflowField({
          ...base,
          topHeight: baseHeight,
        }),
    ).toThrow(NearGroundRadialOutflowFieldError);
    expect(
      () =>
        new NearGroundRadialOutflowField({
          ...base,
          topHeight: baseHeight - 100,
        }),
    ).toThrow(NearGroundRadialOutflowFieldError);
  });

  it("does not import DEMO, tracer domain, D1, or pedagogy", () => {
    for (const src of [fieldSrc, acceptanceSrc]) {
      expect(src).not.toMatch(/DEMO_SCENARIO/);
      expect(src).not.toMatch(/AtmosphericTracerDomain/);
      expect(src).not.toMatch(/downwardPathlineSeeds/);
      expect(src).not.toMatch(/nearGroundOutflowPathlineSeeds/);
      expect(src).not.toMatch(/TracerPedagogy/);
      expect(src).not.toMatch(/createDowndraftField/);
      expect(src).not.toMatch(/ScenarioConfig/);
    }
  });
});
