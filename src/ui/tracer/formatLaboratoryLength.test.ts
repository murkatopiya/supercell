import { describe, expect, it } from "vitest";
import { formatSignedLaboratoryLength } from "./formatLaboratoryLength.js";

describe("formatSignedLaboratoryLength", () => {
  it("does not display signed zero", () => {
    expect(formatSignedLaboratoryLength(0)).toBe("0 m");
    expect(formatSignedLaboratoryLength(-0)).toBe("0 m");
  });

  it("formats sub-kilometre values in metres with a sign", () => {
    expect(formatSignedLaboratoryLength(512)).toBe("+512 m");
    expect(formatSignedLaboratoryLength(-984)).toBe("-984 m");
    expect(formatSignedLaboratoryLength(999)).toBe("+999 m");
  });

  it("formats kilometre-scale values in km", () => {
    expect(formatSignedLaboratoryLength(1000)).toBe("+1.00 km");
    expect(formatSignedLaboratoryLength(1250)).toBe("+1.25 km");
    expect(formatSignedLaboratoryLength(-2000)).toBe("-2.00 km");
  });
});
