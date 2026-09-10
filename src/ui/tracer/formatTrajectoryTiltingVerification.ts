import type { AnalysisTiltingAlignment } from "../../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { formatPointDiagnosticScientific } from "./formatPointDiagnosticDisplay.js";

/** Display-only unit labels. Domain values keep s⁻² / s⁻¹ / radians. */
export const VERIFICATION_T1_UNITS = "s⁻²";
export const VERIFICATION_MAGNITUDE_UNITS = "s⁻¹";
export const VERIFICATION_THETA_DISPLAY_UNITS = "°";
export const VERIFICATION_THETA_DOMAIN_UNITS = "rad";
export const VERIFICATION_SEGMENT_HEIGHT_UNITS = "m";

export const T1_PRODUCT_EQUATION = "T1 = ω_h,env · ∇_h Vy,updraft";
export const T1_ALIGNMENT_EQUATION =
  "T1 = |ω_h,env| |∇_h Vy,updraft| cosθ";

export const T1_VERIFY_LABEL = "Analysis vertical tilting diagnostic T1";
export const OMEGA_MAGNITUDE_LABEL =
  "environmental horizontal vorticity magnitude at the occupied altitude";
export const GRADIENT_MAGNITUDE_LABEL =
  "prescribed-updraft horizontal gradient of vertical velocity";
export const NATIVE_SEGMENT_LABEL =
  "Native containing segment (environmental Analysis height interval)";

/**
 * Presentation-only conversion. Does not mutate domain radians.
 */
export function radiansToDisplayDegrees(thetaRadians: number): number {
  return thetaRadians * (180 / Math.PI);
}

export function formatVerificationScientific(value: number): string {
  return formatPointDiagnosticScientific(value);
}

/**
 * Display-only θ in degrees. Exact 0 stays "0". A tiny nonzero angle
 * is never classified as zero.
 */
export function formatVerificationThetaDegrees(thetaRadians: number): string {
  const degrees = radiansToDisplayDegrees(thetaRadians);
  if (degrees === 0) {
    return "0";
  }
  const abs = Math.abs(degrees);
  if (abs < 1e-6 || abs >= 1e4) {
    return formatPointDiagnosticScientific(degrees);
  }
  const fixed = degrees.toFixed(6);
  const trimmed = fixed.replace(/\.?0+$/, "");
  if (Number(trimmed) === 0) {
    return formatPointDiagnosticScientific(degrees);
  }
  return trimmed;
}

export function formatVerificationCosTheta(cosTheta: number): string {
  if (cosTheta === 0) {
    return "0";
  }
  if (cosTheta === 1) {
    return "1";
  }
  if (cosTheta === -1) {
    return "-1";
  }
  return formatPointDiagnosticScientific(cosTheta);
}

export function formatVerificationSegmentHeight(meters: number): string {
  if (!Number.isFinite(meters)) {
    return "—";
  }
  const value = meters === 0 ? 0 : meters;
  const text = value.toFixed(1);
  const n = Number(text);
  if (n === 0 && value !== 0) {
    return `${formatPointDiagnosticScientific(value)} ${VERIFICATION_SEGMENT_HEIGHT_UNITS}`;
  }
  return `${text} ${VERIFICATION_SEGMENT_HEIGHT_UNITS}`;
}

export function alignmentAbsenceCopy(
  alignment: AnalysisTiltingAlignment,
): string | null {
  if (alignment.state === "GRADIENT_DEGENERATE") {
    return "Alignment angle undefined: prescribed-updraft gradient magnitude is zero.";
  }
  if (alignment.state === "OMEGA_DEGENERATE") {
    return "Alignment angle undefined: environmental horizontal vorticity magnitude is zero.";
  }
  if (alignment.state === "BOTH_DEGENERATE") {
    return "Alignment angle undefined: both vector magnitudes are zero.";
  }
  return null;
}
