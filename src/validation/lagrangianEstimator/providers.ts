import { captureValue, enterCapture, type CaptureContext } from "./capture.js";
/** Validation-local adapters. No input parser, filtering, campaign or qualification imports. */
import { createHash } from "node:crypto";
import type { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import { verticalWindShearBetween } from "../../physics/environment/verticalWindShear.js";
import { horizontalVorticityFromShear } from "../../physics/environment/horizontalVorticity.js";
import { DiagnosticTiltingTendency, worldHorizontalVorticityFromAtmospheric } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import type { VerticalEnvelopeUpdraftField } from "../../physics/storm/VerticalEnvelopeUpdraftField.js";
import type { EscHrTimeAnalysisColumn } from "../../data/escHrTimeAnalysis/types.js";
import { queryAnalysisTiltingExplanationAt } from "../../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { finitePosition } from "./path.js";
import type { VerticalDiagnosticProvider, ProviderTopology, DiagnosticSupport, DiagnosticValue,
  Position, EstimatorResult, EndpointOperand, EndpointContext } from "./types.js";

/** Synthetic/custom evaluators must be pure with semantics identified by identity/version. */
export function createDiagnosticProvider(options: Readonly<{
  identity: string; version: string; heights: readonly number[]; knotSupport?: readonly DiagnosticSupport[];
  evaluate: (segmentIndex: number, p: Position, t: number) => DiagnosticValue;
  ordinaryOracle?: (p: Position, t: number) => DiagnosticValue;
}>, capture?: CaptureContext): EstimatorResult<VerticalDiagnosticProvider> {
  capture = enterCapture(capture, "providers/createDiagnosticProvider");
  captureValue(capture, "input/options", options);

  const hs = captureValue(capture, "providers/site-BJ/local/hs", options.heights);
  if (!options.identity || !options.version || hs.length < 2)
    return captureValue(capture, "providers/site-CB/return", { status: "FAILED", code: "MALFORMED_PROFILE", operation: "provider/identity-topology" });
  for (let i = captureValue(capture, "providers/site-CC/local/i", 0); i < hs.length; i++) {
    captureValue(capture, "loop/i", i);
    if (!Number.isFinite(hs[i]) || (i > 0 && !(hs[i] > hs[i - 1])))
      return captureValue(capture, "providers/site-CE/return", { status: "FAILED", code: "MALFORMED_PROFILE", operation: "provider/height-order" });
  }
  if (options.knotSupport && (options.knotSupport.length !== hs.length ||
    Array.from(options.knotSupport).some(s => s !== "FULL_SUPPORT" && s !== "BOUNDARY_CONDITIONED")))
    return captureValue(capture, "providers/site-CI/return", { status: "FAILED", code: "MALFORMED_PROFILE", operation: "provider/support" });
  const heights = captureValue(capture, "providers/site-CJ/local/heights", Object.freeze(hs.map(h => (captureValue(capture, "callback/h", h), captureValue(capture, "map/hs/result", h === 0 ? 0 : h)))));
  const support = captureValue(capture, "providers/site-DA/local/support", Object.freeze(heights.slice(1).map((_, i): DiagnosticSupport =>
    (captureValue(capture, "callback/_", _), captureValue(capture, "callback/i", i), captureValue(capture, "map/heights.slice(1)/result", !options.knotSupport || (options.knotSupport[i] === "FULL_SUPPORT" && options.knotSupport[i + 1] === "FULL_SUPPORT")
      ? "FULL_SUPPORT" : "BOUNDARY_CONDITIONED")))));
  const fingerprint = captureValue(capture, "providers/site-DD/local/fingerprint", createHash("sha256").update(JSON.stringify([options.version, options.identity, heights, support]), "utf8").digest("hex"));
  const topology: ProviderTopology = captureValue(capture, "providers/site-DE/local/topology", Object.freeze({ fingerprint, version: options.version, heights, support,
    segments: Object.freeze(support.map((_, index) => (captureValue(capture, "callback/_", _), captureValue(capture, "callback/index", index), captureValue(capture, "map/support/result", Object.freeze({ providerFingerprint: fingerprint, index }))))),
    boundaries: Object.freeze(heights.map((_, index) => (captureValue(capture, "callback/_", _), captureValue(capture, "callback/index", index), captureValue(capture, "map/heights/result", Object.freeze({ providerFingerprint: fingerprint, index }))))),
  }));
  // Capture functions, not the mutable options container.
  const evaluate = captureValue(capture, "providers/site-DJ/local/evaluate", options.evaluate), oracle = captureValue(capture, "providers/site-DJ/local/oracle", options.ordinaryOracle);
  function explicit(p: Position, t: number, context: EndpointContext, capture?: CaptureContext): EstimatorResult<EndpointOperand> {
  capture = enterCapture(capture, "providers/explicit");
  captureValue(capture, "input/p", p);
  captureValue(capture, "input/t", t);
  captureValue(capture, "input/context", context);

    const id = captureValue(capture, "providers/site-EB/local/id", context.segment), i = captureValue(capture, "providers/site-EB/local/i", id.index);
    if (id.providerFingerprint !== fingerprint)
      return captureValue(capture, "providers/site-ED/return", { status: "FAILED", code: "PROVIDER_MISMATCH", operation: "provider/segment-identity" });
    if (!Number.isInteger(i) || i < 0 || i >= support.length ||
      !["ORDINARY", "TEMPORAL_MINUS", "TEMPORAL_PLUS", "DWELL"].includes(context.side))
      return captureValue(capture, "providers/site-EG/return", { status: "FAILED", code: "INVALID_CONTEXT", operation: "provider/context" });
    if (!finitePosition(p) || !Number.isFinite(t))
      return captureValue(capture, "providers/site-EI/return", { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "provider/input" });
    if (p.y < heights[0] || p.y > heights[heights.length - 1])
      return captureValue(capture, "providers/site-FA/return", { status: "UNSUPPORTED", reason: "OUT_OF_DOMAIN", value: null });
    if (p.y < heights[i] || p.y > heights[i + 1])
      return captureValue(capture, "providers/site-FC/return", { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "provider/segment-closure" });
    try {
      const value = (captureValue(capture, "providers/site-FE/evaluate/begin", undefined), captureValue(capture, "providers/site-FE/local/value", captureValue(capture, "providers/site-FE/evaluate/return", evaluate(i, p, t))));
      if (!Number.isFinite(value.T1) || (value.omega && !value.omega.every(Number.isFinite)) ||
        (value.gradient && !value.gradient.every(Number.isFinite)))
        return captureValue(capture, "providers/site-FH/return", { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "provider/operands" });
      const tuple = captureValue(capture, "providers/site-FI/local/tuple", (x: readonly [number, number] | null): readonly [number, number] | null =>
        x ? Object.freeze([x[0], x[1]]) : null);
      return captureValue(capture, "providers/site-GA/return", { status: "COMPLETE", value: Object.freeze({ T1: value.T1 === 0 ? 0 : value.T1,
        omega: tuple(value.omega), gradient: tuple(value.gradient), position: Object.freeze({ ...p }), time: t,
        context: Object.freeze({ segment: topology.segments[i], side: context.side }), support: support[i] }) });
    } catch { captureValue(capture, "providers/site-GD/caught", undefined);  return captureValue(capture, "providers/site-GD/return", { status: "FAILED", code: "PROVIDER_FAILURE", operation: "provider/evaluate" }); }
  }
  function ordinary(p: Position, t: number, capture?: CaptureContext): EstimatorResult<EndpointOperand> {
  capture = enterCapture(capture, "providers/ordinary");
  captureValue(capture, "input/p", p);
  captureValue(capture, "input/t", t);

    if (!finitePosition(p) || !Number.isFinite(t))
      return captureValue(capture, "providers/site-GH/return", { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "provider/ordinary-input" });
    const i = captureValue(capture, "providers/site-GI/local/i", ordinarySegment(topology, p.y));
    if (i === null) return captureValue(capture, "providers/site-GJ/return", { status: "UNSUPPORTED", reason: "OUT_OF_DOMAIN", value: null });
    const result = captureValue(capture, "providers/site-HA/local/result", explicit(p, t, { segment: topology.segments[i], side: "ORDINARY" }, capture));
    if (result.status !== "COMPLETE" || !oracle) return captureValue(capture, "providers/site-HB/return", result);
    try {
      // Legacy numeric ordinary query is called only after domain/support classification.
      const actual = (captureValue(capture, "providers/site-HE/oracle/begin", undefined), captureValue(capture, "providers/site-HE/local/actual", captureValue(capture, "providers/site-HE/oracle/return", oracle(p, t))));
      if (!Number.isFinite(actual.T1) || actual.T1 !== result.value.T1)
        return captureValue(capture, "providers/site-HG/return", { status: "FAILED", code: "PROVIDER_FAILURE", operation: "provider/ordinary-conformance" });
    } catch { captureValue(capture, "providers/site-HH/caught", undefined);  return captureValue(capture, "providers/site-HH/return", { status: "FAILED", code: "PROVIDER_FAILURE", operation: "provider/ordinary-oracle" }); }
    return captureValue(capture, "providers/site-HI/return", result);
  }
  return captureValue(capture, "providers/site-IA/return", { status: "COMPLETE", value: Object.freeze({ fingerprint, topology, ordinary, explicit }) });
}

export function ordinarySegment(topology: ProviderTopology, y: number): number | null {
  const hs = topology.heights;
  if (!Number.isFinite(y) || y < hs[0] || y > hs[hs.length - 1]) return null;
  let lo = 0, hi = hs.length - 1;
  while (lo + 1 < hi) { const m = (lo + hi) >>> 1; if (y < hs[m]) hi = m; else lo = m; }
  return Math.min(lo, hs.length - 2);
}
function segmentValue(profile: EnvironmentalWindProfile, heights: readonly number[], updraft: VerticalEnvelopeUpdraftField,
  i: number, p: Position, t: number): DiagnosticValue {
  const shear = verticalWindShearBetween(profile, heights[i], heights[i + 1]);
  const omega = worldHorizontalVorticityFromAtmospheric(horizontalVorticityFromShear(shear));
  const gradient = updraft.horizontalGradientOfVerticalVelocity(p, t);
  return { T1: omega.omegaX * gradient.dVyDx + omega.omegaZ * gradient.dVyDz,
    omega: [omega.omegaX, omega.omegaZ], gradient: [gradient.dVyDx, gradient.dVyDz] };
}
function profileIdentity(profile: EnvironmentalWindProfile, capture?: CaptureContext): readonly unknown[] {
  capture = enterCapture(capture, "providers/profileIdentity");
  captureValue(capture, "input/profile", profile);

  return captureValue(capture, "providers/site-JJ/return", profile.levelHeights().map(h => {
    captureValue(capture, "providers/site-JJ/callback/h", h); const w = captureValue(capture, "providers/site-JJ/local/w", profile.sampleAtHeight(h)); return captureValue(capture, "providers/site-JJ/return", [h, w.eastward, w.northward, w.vertical]); }));
}
export function createSourceProvider(profile: EnvironmentalWindProfile, updraft: VerticalEnvelopeUpdraftField,
  gradientFingerprint: string, capture?: CaptureContext): EstimatorResult<VerticalDiagnosticProvider> {
  capture = enterCapture(capture, "providers/createSourceProvider");
  captureValue(capture, "input/profile", profile);
  captureValue(capture, "input/updraft", updraft);
  captureValue(capture, "input/gradientFingerprint", gradientFingerprint);

  if (!gradientFingerprint) return captureValue(capture, "providers/site-BAD/return", { status: "FAILED", code: "INVALID_CONTEXT", operation: "provider/gradient-identity" });
  const heights = captureValue(capture, "providers/site-BAE/local/heights", profile.levelHeights()), legacy = captureValue(capture, "providers/site-BAE/local/legacy", new DiagnosticTiltingTendency({ profile, updraft }));
  return captureValue(capture, "providers/site-BAF/return", createDiagnosticProvider({ identity: JSON.stringify([profileIdentity(profile, capture), gradientFingerprint]),
    version: "source-segment-provider/v1", heights,
    evaluate: (i, p, t) => segmentValue(profile, heights, updraft, i, p, t),
    ordinaryOracle: (p, t) => ({ T1: legacy.sample(p, t), omega: null, gradient: null }) }, capture));
}
export function createAnalysisProvider(column: EscHrTimeAnalysisColumn | null, updraft: VerticalEnvelopeUpdraftField,
  gradientFingerprint: string, capture?: CaptureContext): EstimatorResult<VerticalDiagnosticProvider> {
  capture = enterCapture(capture, "providers/createAnalysisProvider");
  captureValue(capture, "input/column", column);
  captureValue(capture, "input/updraft", updraft);
  captureValue(capture, "input/gradientFingerprint", gradientFingerprint);

  if (!column) {
    const unavailable = captureValue(capture, "providers/site-BBD/local/unavailable", (): EstimatorResult<EndpointOperand> => ({ status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null }));
    return captureValue(capture, "providers/site-BBE/return", { status: "COMPLETE", value: Object.freeze({ fingerprint: "unavailable-column/v1", topology: null,
      ordinary: unavailable, explicit: unavailable }) });
  }
  if (!gradientFingerprint) return captureValue(capture, "providers/site-BBH/return", { status: "FAILED", code: "INVALID_CONTEXT", operation: "provider/gradient-identity" });
  const profile = captureValue(capture, "providers/site-BBI/local/profile", column.profile), heights = captureValue(capture, "providers/site-BBI/local/heights", profile.levelHeights());
  const snapshot = captureValue(capture, "providers/site-BBJ/local/snapshot", Object.freeze({ profile, support: Object.freeze([...column.support]), provenance: Object.freeze({ ...column.provenance }) }));
  return captureValue(capture, "providers/site-BCA/return", createDiagnosticProvider({ identity: JSON.stringify([profileIdentity(profile, capture), gradientFingerprint, snapshot.provenance]),
    version: "analysis-segment-provider/v1", heights, knotSupport: snapshot.support,
    evaluate: (i, p, t) => segmentValue(profile, heights, updraft, i, p, t),
    ordinaryOracle: (p, t) => {
      const value = queryAnalysisTiltingExplanationAt(snapshot, updraft, p, t);
      if (value.status === "COLUMN_UNAVAILABLE" || value.status === "OUT_OF_DOMAIN") throw new Error("Unavailable ordinary value");
      return { T1: value.tiltingTendency, omega: null, gradient: null };
    } }, capture));
}
