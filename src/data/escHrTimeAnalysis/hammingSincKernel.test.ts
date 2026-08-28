import { describe, expect, it } from "vitest";
import kernelFixture from "./escHrTimeHammingSincKernel.v1.json";
import { escHrTimeHammingSincKernel } from "./hammingSincKernel.js";

describe("esc-hr-time Hamming-sinc kernel v1", () => {
  const kernel = escHrTimeHammingSincKernel();

  it("has 81 taps, is symmetric, and has unity DC gain", () => {
    expect(kernel).toHaveLength(81);
    expect(kernel[0]).toBeCloseTo(kernel[80]!, 15);
    expect(kernel[1]).toBeCloseTo(kernel[79]!, 15);
    expect(kernel.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
  });

  it("matches the frozen coefficient fixture", () => {
    expect(kernelFixture.taps).toBe(81);
    expect(kernelFixture.coefficients).toHaveLength(81);
    for (let i = 0; i < kernel.length; i++) {
      expect(kernel[i]).toBe(kernelFixture.coefficients[i]);
    }
  });

  it("is deterministic", () => {
    expect(escHrTimeHammingSincKernel()).toEqual(kernel);
  });
});
