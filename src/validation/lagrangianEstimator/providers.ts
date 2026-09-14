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
}>): EstimatorResult<VerticalDiagnosticProvider> {
  const hs = options.heights;
  if (!options.identity || !options.version || hs.length < 2)
    return { status: "FAILED", code: "MALFORMED_PROFILE", operation: "provider/identity-topology" };
  for (let i = 0; i < hs.length; i++) {
    if (!Number.isFinite(hs[i]) || (i > 0 && !(hs[i] > hs[i - 1])))
      return { status: "FAILED", code: "MALFORMED_PROFILE", operation: "provider/height-order" };
  }
  if (options.knotSupport && (options.knotSupport.length !== hs.length ||
    Array.from(options.knotSupport).some(s => s !== "FULL_SUPPORT" && s !== "BOUNDARY_CONDITIONED")))
    return { status: "FAILED", code: "MALFORMED_PROFILE", operation: "provider/support" };
  const heights = Object.freeze(hs.map(h => h === 0 ? 0 : h));
  const support = Object.freeze(heights.slice(1).map((_, i): DiagnosticSupport =>
    !options.knotSupport || (options.knotSupport[i] === "FULL_SUPPORT" && options.knotSupport[i + 1] === "FULL_SUPPORT")
      ? "FULL_SUPPORT" : "BOUNDARY_CONDITIONED"));
  const fingerprint = createHash("sha256").update(JSON.stringify([options.version, options.identity, heights, support]), "utf8").digest("hex");
  const topology: ProviderTopology = Object.freeze({ fingerprint, version: options.version, heights, support,
    segments: Object.freeze(support.map((_, index) => Object.freeze({ providerFingerprint: fingerprint, index }))),
    boundaries: Object.freeze(heights.map((_, index) => Object.freeze({ providerFingerprint: fingerprint, index }))),
  });
  // Capture functions, not the mutable options container.
  const evaluate = options.evaluate, oracle = options.ordinaryOracle;
  function explicit(p: Position, t: number, context: EndpointContext): EstimatorResult<EndpointOperand> {
    const id = context.segment, i = id.index;
    if (id.providerFingerprint !== fingerprint)
      return { status: "FAILED", code: "PROVIDER_MISMATCH", operation: "provider/segment-identity" };
    if (!Number.isInteger(i) || i < 0 || i >= support.length ||
      !["ORDINARY", "TEMPORAL_MINUS", "TEMPORAL_PLUS", "DWELL"].includes(context.side))
      return { status: "FAILED", code: "INVALID_CONTEXT", operation: "provider/context" };
    if (!finitePosition(p) || !Number.isFinite(t))
      return { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "provider/input" };
    if (p.y < heights[0] || p.y > heights[heights.length - 1])
      return { status: "UNSUPPORTED", reason: "OUT_OF_DOMAIN", value: null };
    if (p.y < heights[i] || p.y > heights[i + 1])
      return { status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "provider/segment-closure" };
    try {
      const value = evaluate(i, p, t);
      if (!Number.isFinite(value.T1) || (value.omega && !value.omega.every(Number.isFinite)) ||
        (value.gradient && !value.gradient.every(Number.isFinite)))
        return { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "provider/operands" };
      const tuple = (x: readonly [number, number] | null): readonly [number, number] | null =>
        x ? Object.freeze([x[0], x[1]]) : null;
      return { status: "COMPLETE", value: Object.freeze({ T1: value.T1 === 0 ? 0 : value.T1,
        omega: tuple(value.omega), gradient: tuple(value.gradient), position: Object.freeze({ ...p }), time: t,
        context: Object.freeze({ segment: topology.segments[i], side: context.side }), support: support[i] }) };
    } catch { return { status: "FAILED", code: "PROVIDER_FAILURE", operation: "provider/evaluate" }; }
  }
  function ordinary(p: Position, t: number): EstimatorResult<EndpointOperand> {
    if (!finitePosition(p) || !Number.isFinite(t))
      return { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "provider/ordinary-input" };
    const i = ordinarySegment(topology, p.y);
    if (i === null) return { status: "UNSUPPORTED", reason: "OUT_OF_DOMAIN", value: null };
    const result = explicit(p, t, { segment: topology.segments[i], side: "ORDINARY" });
    if (result.status !== "COMPLETE" || !oracle) return result;
    try {
      // Legacy numeric ordinary query is called only after domain/support classification.
      const actual = oracle(p, t);
      if (!Number.isFinite(actual.T1) || actual.T1 !== result.value.T1)
        return { status: "FAILED", code: "PROVIDER_FAILURE", operation: "provider/ordinary-conformance" };
    } catch { return { status: "FAILED", code: "PROVIDER_FAILURE", operation: "provider/ordinary-oracle" }; }
    return result;
  }
  return { status: "COMPLETE", value: Object.freeze({ fingerprint, topology, ordinary, explicit }) };
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
function profileIdentity(profile: EnvironmentalWindProfile): readonly unknown[] {
  return profile.levelHeights().map(h => { const w = profile.sampleAtHeight(h); return [h, w.eastward, w.northward, w.vertical]; });
}
export function createSourceProvider(profile: EnvironmentalWindProfile, updraft: VerticalEnvelopeUpdraftField,
  gradientFingerprint: string): EstimatorResult<VerticalDiagnosticProvider> {
  if (!gradientFingerprint) return { status: "FAILED", code: "INVALID_CONTEXT", operation: "provider/gradient-identity" };
  const heights = profile.levelHeights(), legacy = new DiagnosticTiltingTendency({ profile, updraft });
  return createDiagnosticProvider({ identity: JSON.stringify([profileIdentity(profile), gradientFingerprint]),
    version: "source-segment-provider/v1", heights,
    evaluate: (i, p, t) => segmentValue(profile, heights, updraft, i, p, t),
    ordinaryOracle: (p, t) => ({ T1: legacy.sample(p, t), omega: null, gradient: null }) });
}
export function createAnalysisProvider(column: EscHrTimeAnalysisColumn | null, updraft: VerticalEnvelopeUpdraftField,
  gradientFingerprint: string): EstimatorResult<VerticalDiagnosticProvider> {
  if (!column) {
    const unavailable = (): EstimatorResult<EndpointOperand> => ({ status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null });
    return { status: "COMPLETE", value: Object.freeze({ fingerprint: "unavailable-column/v1", topology: null,
      ordinary: unavailable, explicit: unavailable }) };
  }
  if (!gradientFingerprint) return { status: "FAILED", code: "INVALID_CONTEXT", operation: "provider/gradient-identity" };
  const profile = column.profile, heights = profile.levelHeights();
  const snapshot = Object.freeze({ profile, support: Object.freeze([...column.support]), provenance: Object.freeze({ ...column.provenance }) });
  return createDiagnosticProvider({ identity: JSON.stringify([profileIdentity(profile), gradientFingerprint, snapshot.provenance]),
    version: "analysis-segment-provider/v1", heights, knotSupport: snapshot.support,
    evaluate: (i, p, t) => segmentValue(profile, heights, updraft, i, p, t),
    ordinaryOracle: (p, t) => {
      const value = queryAnalysisTiltingExplanationAt(snapshot, updraft, p, t);
      if (value.status === "COLUMN_UNAVAILABLE" || value.status === "OUT_OF_DOMAIN") throw new Error("Unavailable ordinary value");
      return { T1: value.tiltingTendency, omega: null, gradient: null };
    } });
}
