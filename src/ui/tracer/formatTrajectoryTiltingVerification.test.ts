import { describe, expect, it } from "vitest";
import formatterSrc from "./formatTrajectoryTiltingVerification.ts?raw";
import {
  alignmentAbsenceCopy,
  formatVerificationCosTheta,
  formatVerificationScientific,
  formatVerificationSegmentHeight,
  formatVerificationThetaDegrees,
  radiansToDisplayDegrees,
  VERIFICATION_MAGNITUDE_UNITS,
  VERIFICATION_SEGMENT_HEIGHT_UNITS,
  VERIFICATION_T1_UNITS,
  VERIFICATION_THETA_DISPLAY_UNITS,
  VERIFICATION_THETA_DOMAIN_UNITS,
} from "./formatTrajectoryTiltingVerification.js";

describe("formatTrajectoryTiltingVerification", () => {
  it("M radians → degrees display conversion is presentation-only", () => {
    expect(radiansToDisplayDegrees(0)).toBe(0);
    expect(radiansToDisplayDegrees(Math.PI / 2)).toBe(90);
    expect(radiansToDisplayDegrees(Math.PI)).toBe(180);
    expect(formatVerificationThetaDegrees(0)).toBe("0");
    expect(formatVerificationThetaDegrees(Math.PI / 2)).toBe("90");
    expect(formatVerificationThetaDegrees(Math.PI)).toBe("180");
  });

  it("N domain radians are not rewritten by the formatter module", () => {
    const theta = Math.PI / 2;
    expect(theta).toBe(Math.PI / 2);
    expect(radiansToDisplayDegrees(theta)).toBe(90);
    expect(VERIFICATION_THETA_DOMAIN_UNITS).toBe("rad");
    expect(VERIFICATION_THETA_DISPLAY_UNITS).toBe("°");
    expect(formatterSrc).not.toMatch(/theta\s*=\s*radiansToDisplayDegrees/);
  });

  it("O exact zero formatting does not require an epsilon", () => {
    expect(formatVerificationScientific(0)).toBe("0");
    expect(formatVerificationScientific(-0)).toBe("0");
    expect(formatVerificationThetaDegrees(0)).toBe("0");
    expect(formatVerificationCosTheta(0)).toBe("0");
    expect(formatterSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(formatterSrc).not.toMatch(/\|T1\|_ε|T1_EPS|nearZero/);
  });

  it("P a small nonzero value remains scientifically nonzero", () => {
    expect(formatVerificationScientific(2.33e-20)).toBe("2.33×10⁻²⁰");
    expect(formatVerificationScientific(2.33e-20)).not.toBe("0");
    expect(formatVerificationThetaDegrees(1e-20)).not.toBe("0");
    expect(formatVerificationThetaDegrees(1e-20)).toMatch(/×10/);
  });

  it("Q undefined alignment produces no numeric theta/cos string", () => {
    expect(alignmentAbsenceCopy({ state: "GRADIENT_DEGENERATE" })).toBe(
      "Alignment angle undefined: prescribed-updraft gradient magnitude is zero.",
    );
    expect(alignmentAbsenceCopy({ state: "OMEGA_DEGENERATE" })).toBe(
      "Alignment angle undefined: environmental horizontal vorticity magnitude is zero.",
    );
    expect(alignmentAbsenceCopy({ state: "BOTH_DEGENERATE" })).toBe(
      "Alignment angle undefined: both operand magnitudes are zero.",
    );
    expect(
      alignmentAbsenceCopy({
        state: "ALIGNMENT_DEFINED",
        cosTheta: 0,
        theta: Math.PI / 2,
      }),
    ).toBeNull();
    const copy = alignmentAbsenceCopy({ state: "GRADIENT_DEGENERATE" })!;
    expect(copy).not.toMatch(/90/);
    expect(copy).not.toMatch(/cosθ = 0|cosTheta = 0/);
    expect(copy).not.toMatch(/N\/A = 0/);
    expect(copy).not.toMatch(/NaN/);
  });

  it("R units are T1 s⁻², magnitudes s⁻¹, θ display degrees / domain radians", () => {
    expect(VERIFICATION_T1_UNITS).toBe("s⁻²");
    expect(VERIFICATION_MAGNITUDE_UNITS).toBe("s⁻¹");
    expect(VERIFICATION_THETA_DISPLAY_UNITS).toBe("°");
    expect(VERIFICATION_THETA_DOMAIN_UNITS).toBe("rad");
  });

  it("S segment heights use laboratory metres", () => {
    expect(VERIFICATION_SEGMENT_HEIGHT_UNITS).toBe("m");
    expect(formatVerificationSegmentHeight(10)).toBe("10.0 m");
    expect(formatVerificationSegmentHeight(250)).toBe("250.0 m");
    expect(formatVerificationSegmentHeight(0)).toBe("0.0 m");
    expect(formatVerificationSegmentHeight(1e-20)).not.toBe("0.0 m");
  });
});
