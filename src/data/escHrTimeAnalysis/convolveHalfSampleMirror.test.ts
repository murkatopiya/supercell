import { describe, expect, it } from "vitest";
import {
  convolveHalfSampleMirror,
  halfSampleMirrorAt,
} from "./convolveHalfSampleMirror.js";
import { escHrTimeHammingSincKernel } from "./hammingSincKernel.js";

describe("half-sample mirror convolution", () => {
  it("reflects across the half-sample outside each end", () => {
    const values = [10, 20, 30, 40];
    expect(halfSampleMirrorAt(values, 0)).toBe(10);
    expect(halfSampleMirrorAt(values, -1)).toBe(10);
    expect(halfSampleMirrorAt(values, -2)).toBe(20);
    expect(halfSampleMirrorAt(values, -3)).toBe(30);
    expect(halfSampleMirrorAt(values, 4)).toBe(40);
    expect(halfSampleMirrorAt(values, 5)).toBe(30);
    expect(halfSampleMirrorAt(values, 6)).toBe(20);
  });

  it("preserves a constant series (unity DC)", () => {
    const values = Array.from({ length: 120 }, () => 7.5);
    const out = convolveHalfSampleMirror(values, escHrTimeHammingSincKernel());
    for (const value of out) {
      expect(value).toBeCloseTo(7.5, 12);
    }
  });
});
