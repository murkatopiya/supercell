import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  linearRgbFromSrgbHex,
  srgbChannelToLinear,
} from "./vertexColorSpace.js";

describe("srgbChannelToLinear", () => {
  it("keeps the endpoints and stays monotonic", () => {
    expect(srgbChannelToLinear(0)).toBe(0);
    expect(srgbChannelToLinear(1)).toBeCloseTo(1, 12);
    let previous = -1;
    for (let i = 0; i <= 32; i++) {
      const value = srgbChannelToLinear(i / 32);
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("compresses the dark end, which is why raw hex flattens a tail ramp", () => {
    // sRGB 0x2a (the former comet tail) is much darker in working space than
    // its raw fraction suggests.
    const raw = 0x2a / 255;
    expect(srgbChannelToLinear(raw)).toBeLessThan(raw / 3);
  });
});

describe("linearRgbFromSrgbHex", () => {
  it("matches the conversion Three.js applies to a sRGB Color", () => {
    for (const hex of [0x000000, 0x2a3540, 0x5b7180, 0x4fd2c2, 0xf0f7ff, 0xffffff]) {
      const reference = new THREE.Color().setHex(hex, THREE.SRGBColorSpace);
      const converted = linearRgbFromSrgbHex(hex);
      expect(converted.r).toBeCloseTo(reference.r, 6);
      expect(converted.g).toBeCloseTo(reference.g, 6);
      expect(converted.b).toBeCloseTo(reference.b, 6);
    }
  });

  it("splits channels independently", () => {
    const converted = linearRgbFromSrgbHex(0xff0000);
    expect(converted.r).toBeCloseTo(1, 12);
    expect(converted.g).toBe(0);
    expect(converted.b).toBe(0);
  });
});
