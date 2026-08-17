import { describe, expect, it } from "vitest";
import {
  ATMOSPHERIC_GROUND_HEIGHT,
  applyAtmosphericTracerDomain,
} from "./AtmosphericTracerDomain.js";
import assertAtmosphericTracerSeedSrc from "./assertAtmosphericTracerSeed.ts?raw";
import createTracersFromSeedsSrc from "./createTracersFromSeeds.ts?raw";
import {
  AtmosphericTracerSeedError,
  assertAtmosphericTracerSeed,
  copyAtmosphericTracerSeed,
} from "./assertAtmosphericTracerSeed.js";
import { createTracersFromSeeds } from "./createTracersFromSeeds.js";

describe("assertAtmosphericTracerSeed", () => {
  it("accepts finite coordinates when y > 0", () => {
    expect(() =>
      assertAtmosphericTracerSeed({ x: 3000, y: 100, z: 4750 }),
    ).not.toThrow();
  });

  it("accepts y = 0", () => {
    expect(() =>
      assertAtmosphericTracerSeed({ x: 1, y: 0, z: -2 }),
    ).not.toThrow();
  });

  it("treats signed -0 as ground and writes canonical +0", () => {
    const input = { x: -0, y: -0, z: -0 };
    expect(input.y < ATMOSPHERIC_GROUND_HEIGHT).toBe(false);
    expect(() => assertAtmosphericTracerSeed(input)).not.toThrow();

    const owned = copyAtmosphericTracerSeed(input);
    expect(Object.is(owned.x, 0)).toBe(true);
    expect(Object.is(owned.y, 0)).toBe(true);
    expect(Object.is(owned.z, 0)).toBe(true);
    expect(Object.is(owned.y, -0)).toBe(false);
  });

  it("rejects y < 0", () => {
    expect(() =>
      assertAtmosphericTracerSeed({ x: 0, y: -1, z: 0 }),
    ).toThrow(AtmosphericTracerSeedError);
    expect(() =>
      assertAtmosphericTracerSeed({ x: 0, y: -1, z: 0 }),
    ).toThrow(/seed\.y must be >= 0/);
  });

  it("rejects ±Infinity and NaN on each component", () => {
    const finite = { x: 1, y: 2, z: 3 };
    expect(() =>
      assertAtmosphericTracerSeed({ ...finite, x: Number.POSITIVE_INFINITY }),
    ).toThrow(/seed\.x must be finite/);
    expect(() =>
      assertAtmosphericTracerSeed({ ...finite, y: Number.NEGATIVE_INFINITY }),
    ).toThrow(/seed\.y must be finite/);
    expect(() =>
      assertAtmosphericTracerSeed({ ...finite, z: Number.NaN }),
    ).toThrow(/seed\.z must be finite/);
  });

  it("accepts very large finite x/z", () => {
    expect(() =>
      assertAtmosphericTracerSeed({ x: 1e12, y: 0, z: -1e12 }),
    ).not.toThrow();
  });

  it("copy is independent of later caller mutation", () => {
    const input = { x: 10, y: 20, z: 30 };
    const owned = copyAtmosphericTracerSeed(input);
    input.x = 999;
    input.y = -4;
    expect(owned).toEqual({ x: 10, y: 20, z: 30 });
  });

  it("does not change AtmosphericTracerDomain crossing semantics", () => {
    const from = { x: 0, y: 1, z: 0 };
    const proposed = { x: 0, y: -1, z: 0 };
    const result = applyAtmosphericTracerDomain(from, proposed);
    expect(result.active).toBe(false);
    expect(result.position.y).toBe(ATMOSPHERIC_GROUND_HEIGHT);
  });

  it("is independent of Explore, ScenarioConfig, pedagogy, and renderer", () => {
    expect(assertAtmosphericTracerSeedSrc).not.toMatch(/ExploreTracerSession/);
    expect(assertAtmosphericTracerSeedSrc).not.toMatch(/DEMO_SCENARIO/);
    expect(assertAtmosphericTracerSeedSrc).not.toMatch(/ScenarioConfig/);
    expect(assertAtmosphericTracerSeedSrc).not.toMatch(/TracerPedagogy/);
    expect(assertAtmosphericTracerSeedSrc).not.toMatch(/TracerScene/);
    expect(assertAtmosphericTracerSeedSrc).not.toMatch(/from ["']three["']/);
    expect(assertAtmosphericTracerSeedSrc).not.toMatch(/from ["'].*ui\//);
    expect(createTracersFromSeedsSrc).not.toMatch(/assertAtmosphericTracerSeed/);
  });

  it("does not make createTracersFromSeeds reject y < 0", () => {
    const particles = createTracersFromSeeds([{ x: 0, y: -5, z: 0 }]);
    expect(particles[0]!.position.y).toBe(-5);
  });
});
