/** Declarative artificial inputs only. No fixture execution and no qualification certificate. */
import { canonicalRecord } from "./evidence.js";

export type Scalar = number | "NaN" | "+Infinity" | "-Infinity";
export type Vertex = Readonly<{ t: Scalar; x: Scalar; y: Scalar; z: Scalar }>;
/** T1 = c + tCoefficient*t + xCoefficient*x + yCoefficient*y, on each segment closure.
 * NONLINEAR_TIME_SQUARE is a declared wiring probe, not an affine analytic guarantee.
 */
export type Field = Readonly<{ c: number; tCoefficient: number; xCoefficient: number; yCoefficient: number }>;
export type Recipe = Readonly<{
  vertices: readonly Vertex[]; heights: readonly Scalar[]; fields: readonly Field[];
  support: "FULL_SUPPORT" | "UNAVAILABLE" | readonly ("FULL_SUPPORT" | "BOUNDARY_CONDITIONED")[];
  evaluator: "SEGMENT_AFFINE" | "NONLINEAR_TIME_SQUARE" | "NONFINITE_AT_HALF";
  providerIdentity: string;
}>;
export type Reference = Readonly<{
  kind: "EXACT_RATIONAL" | "EXPECTED_REJECTION" | "STRUCTURAL";
  // Numerator/denominator strings describe exact rational quantities, never estimator output.
  quantities: Readonly<Record<string, readonly [string, string]>>;
  status: string; derivation: string;
}>;
export type Fixture = Readonly<{
  id: string; version: "v1"; frozenFixture: number | null; requirement: string;
  coarse: Recipe; fine: Recipe | null; interval: readonly [Scalar, Scalar];
  reference: Reference; requiredTraces: readonly string[]; requiredAssertions: readonly string[];
  repetitions: number;
}>;
function freeze<T>(v: T): T {
  if (v !== null && typeof v === "object") { Object.values(v).forEach(freeze); Object.freeze(v); }
  return v;
}
const f = (c: number, tCoefficient = 0, xCoefficient = 0, yCoefficient = 0): Field => ({ c, tCoefficient, xCoefficient, yCoefficient });
const path = (ys: readonly number[], ts: readonly Scalar[] = ys.map((_, i) => i), xs = ys.map(() => 0)): readonly Vertex[] =>
  ys.map((y, i) => ({ t: ts[i], x: xs[i], y, z: 0 }));
const recipe = (heights: readonly Scalar[] = [0, 1], fields: readonly Field[] = [f(2)],
  vertices = path([0, 1]), extra: Partial<Recipe> = {}): Recipe => ({
  vertices, heights, fields, support: "FULL_SUPPORT", evaluator: "SEGMENT_AFFINE", providerIdentity: "artificial-registry/v1", ...extra });
const exact = (quantities: Reference["quantities"], derivation: string): Reference =>
  ({ kind: "EXACT_RATIONAL", quantities, status: "COMPLETE", derivation });
const rejection = (status: string, derivation: string): Reference => ({ kind: "EXPECTED_REJECTION", quantities: {}, status, derivation });
const structural = (derivation: string): Reference => ({ kind: "STRUCTURAL", quantities: {}, status: "COMPLETE", derivation });
const baseTraces = ["original-inputs", "provider-topology", "accepted-path", "events", "endpoint-evaluations", "subinterval-contributions", "totals-bounds-status"];
const baseAssertions = ["typed-no-fabricated-zero", "complete-duration-and-adjacency", "explicit-segment-context", "arithmetic-only-allowance"];
const fixtures: Fixture[] = [];
function entry(id: string, frozenFixture: number | null, requirement: string, coarse: Recipe, reference: Reference,
  options: Partial<Pick<Fixture, "fine" | "interval" | "requiredAssertions" | "repetitions">> = {}) {
  const failed = reference.kind === "EXPECTED_REJECTION";
  fixtures.push({ id, version: "v1", frozenFixture, requirement, coarse, fine: options.fine ?? null,
    interval: options.interval ?? [coarse.vertices[0].t, coarse.vertices[coarse.vertices.length - 1].t], reference,
    requiredTraces: failed ? ["original-inputs", "candidate-boundaries", "generated-failing-step-or-subinterval-trace", "offending-operation-status"] : baseTraces,
    requiredAssertions: failed ? ["exact-typed-rejection", "affected-values-null", "partial-not-complete", "no-merge-or-fabricated-zero"]
      : [...baseAssertions, ...(options.requiredAssertions ?? [])], repetitions: options.repetitions ?? 1 });
}
entry("P2-F01", 1, "one segment / constant", recipe([0, 1], [f(-3)], path([0, 1], [0, 4])),
  exact({ Esigned: ["-12", "1"], Eabs: ["12", "1"] }, "4*(-3)=-12; 4*abs(-3)=12"), { requiredAssertions: ["zero-interior-knots"] });
entry("P2-F02", 2, "one segment / affine", recipe([0, 1], [f(1, 2)], path([0, 1], [0, 2])),
  exact({ Esigned: ["6", "1"], Eabs: ["6", "1"] }, "integral_0^2 (1+2t) dt = 2+4"));
entry("P2-F03", 3, "arbitrary interior jump", recipe([0, 0.25, 1], [f(1), f(3)]),
  exact({ Esigned: ["5", "2"], Eabs: ["5", "2"] }, "(1/4)*1+(3/4)*3=5/2"));
entry("P2-F04", 4, "piecewise affine with jump", recipe([0, 0.5, 1], [f(0, 1), f(2, 1)]),
  exact({ Esigned: ["3", "2"], Eabs: ["3", "2"] }, "integral_0^(1/2) t + integral_(1/2)^1 (t+2) = 1/8+11/8"));
const irregular = Array.from({ length: 33 }, (_, j) => j * j / 1024);
entry("P2-F05", 5, "many irregular knots", recipe(irregular, Array.from({ length: 32 }, (_, i) => f(i + 1))),
  exact({ Esigned: ["1397", "64"], Eabs: ["1397", "64"] }, "sum j*(j^2-(j-1)^2)/1024, j=1..32 = 22352/1024 = 1397/64"),
  { requiredAssertions: ["32-ordered-positive-intervals", "all-boundaries-retained"] });
const cluster = [0, ...Array.from({ length: 33 }, (_, j) => 0.5 + j / 4096), 1];
entry("P2-F06", 6, "dense representable cluster", recipe(cluster, cluster.slice(1).map(() => f(2))),
  exact({ Esigned: ["2", "1"], Eabs: ["2", "1"] }, "constant 2 over unit duration"), { requiredAssertions: ["33-crossings-34-positive-intervals", "no-fixed-crossing-cap"] });
entry("P2-F07", 7, "unresolvable cluster", recipe([0, 0.25, 0.5, 1], [f(2), f(2), f(2)], path([0, 1], [2 ** 53, 2 ** 53 + 2])),
  rejection("FAILED/NUMERICAL_AMBIGUITY", "first interior time rounds to start; no successful merge"));
entry("P2-F08", 8, "upward temporal sides", recipe([0, 0.5, 1], [f(1), f(3)]),
  exact({ Esigned: ["2", "1"], Eabs: ["2", "1"] }, "stationary field: half duration in each segment"), { requiredAssertions: ["segments-0-then-1", "incoming-1-outgoing-3"] });
entry("P2-F09", 9, "downward temporal sides", recipe([0, 0.5, 1], [f(1), f(3)], path([1, 0])),
  exact({ Esigned: ["2", "1"], Eabs: ["2", "1"] }, "stationary reversal preserves scalar areas"), { requiredAssertions: ["segments-1-then-0", "incoming-3-outgoing-1"] });
entry("P2-F10", 10, "start/end knot", recipe([0, 0.5, 1], [f(1), f(3)], path([0, 0.5, 1])),
  exact({ Esigned: ["4", "1"], Eabs: ["4", "1"] }, "one second at 1 plus one second at 3"), { requiredAssertions: ["one-shared-vertex-contact", "no-zero-duration-double-count"] });
entry("P2-F11", 11, "knot dwell with time/horizontal dependence", recipe([0, 0.5, 1], [f(0, 1, 1), f(1, 1, 1)], path([0.5, 0.5], [0, 1], [0, 2])),
  exact({ Esigned: ["5", "2"], Eabs: ["5", "2"] }, "owned upper segment: 1+x+t=1+3t, area 5/2"), { requiredAssertions: ["owned-segment-dwell", "zero-crossings"] });
entry("P2-F12", 12, "touch-return from below", recipe([0, 0.5, 1], [f(1), f(3)], path([0, 0.5, 0])),
  exact({ Esigned: ["2", "1"], Eabs: ["2", "1"] }, "two seconds entirely in lower open segment"), { requiredAssertions: ["one-shared-contact", "no-opposite-side-visit"] });
entry("P2-F13", 13, "ordinary versus incoming limit", recipe([0, 0.5, 1], [f(1), f(9)], path([0, 0.5])),
  exact({ Esigned: ["1", "1"], Eabs: ["1", "1"], ordinaryEnd: ["9", "1"], incomingEnd: ["1", "1"] }, "lower segment integral 1; knot ordinary ownership is upper"));
entry("P2-F14", 14, "equal opposite endpoints", recipe([0, 1], [f(3, -1.5)], path([0, 1], [0, 4])),
  exact({ Esigned: ["0", "1"], Eabs: ["6", "1"] }, "two triangles: h*abs(u)/2=4*3/2"), { requiredAssertions: ["exact-positive-zero-signed", "local-zero-not-provider-event"] });
const identity = recipe([0, 0.5, 1], [f(1), f(3)]);
entry("P2-F15", 15, "identical paths/providers/inputs", identity,
  exact({ R1: ["0", "1"], Aref: ["2", "1"] }, "identical explicit evaluations subtract exactly to zero"), { fine: identity, requiredAssertions: ["exact-zero-history"] });
entry("P2-F16", 16, "redundant trajectory boundary", recipe([0, 1], [f(1, 0, 0, 2)]),
  exact({ R1: ["0", "1"], Aref: ["2", "1"] }, "same y=t under both encodings; integral (1+2t)=2"),
  { fine: recipe([0, 1], [f(1, 0, 0, 2)], path([0, 0.25, 0.75, 1], [0, 0.25, 0.75, 1])), requiredAssertions: ["own-path-foreign-node-reevaluation", "alternate-encoding-arithmetic-allowance"] });
entry("P2-F17", 17, "shifted identical jump", recipe([0, 0.25, 1], [f(2), f(-6)], path([0, 1], [0, 2])),
  exact({ residualArea: ["2", "1"], R1: ["1", "1"], referenceArea: ["9", "1"], Aref: ["9", "2"] }, "abs(-6-2)*abs(3/4-1/2)=2; normalize by T=2"),
  { fine: recipe([0, 0.25, 1], [f(2), f(-6)], path([0, 0.5, 1], [0, 1.5, 2])) });
entry("P2-F18", 18, "affine history sign change", recipe([0, 1], [f(3, -4)], path([0, 1]), { providerIdentity: "coarse-affine/v1" }),
  exact({ residualArea: ["1", "1"], R1: ["1", "1"], Aref: ["1", "1"] }, "difference 2-4t; two triangles of area 1/2 each"),
  { fine: recipe([0, 1], [f(1)], path([0, 1]), { providerIdentity: "fine-constant/v1" }) });
const conditioned = recipe([0, 0.5, 1], [f(2), f(2)], path([0, 1]), { support: ["FULL_SUPPORT", "FULL_SUPPORT", "BOUNDARY_CONDITIONED"] });
entry("P2-F19", 19, "unsupported adjacent side / primary", conditioned,
  rejection("UNSUPPORTED/BOUNDARY_CONDITIONED", "closed primary step traverses boundary-conditioned upper segment; no fractional recovery"));
entry("P2-F20", 20, "unavailable column", recipe([], [], path([0, 1]), { support: "UNAVAILABLE" }),
  rejection("N_A/COLUMN_UNAVAILABLE", "no numeric fallback for unavailable provider"));
entry("P2-F21", 21, "duplicate knots", recipe([0, 0.5, 0.5, 1], [f(2), f(2), f(2)]),
  rejection("FAILED/MALFORMED_PROFILE", "strictly increasing topology violated; no deduplication"));
entry("P2-F22", 22, "repeat calculation and serialization", identity,
  exact({ Esigned: ["2", "1"], Eabs: ["2", "1"], R1: ["0", "1"], Aref: ["2", "1"] }, "repeat exact same inputs five times; compare full values, identities, ordering and exact-byte stream digest"),
  { fine: identity, repetitions: 5, requiredAssertions: ["bit-identical-values", "exact-event-identities-order", "exact-stream-digest-equality", "full-trace-every-repetition"] });

entry("P2-V01", null, "nonfinite topology", recipe([0, "NaN"], [f(2)]), rejection("FAILED/MALFORMED_PROFILE", "nonfinite knot"));
entry("P2-V02", null, "nonordered topology", recipe([0, 1, 0.5], [f(2), f(2)]), rejection("FAILED/MALFORMED_PROFILE", "descending declared knot order"));
entry("P2-V03", null, "zero duration", recipe([0, 1], [f(2)], path([0, 1], [0, 0])), rejection("FAILED/INVALID_TRAJECTORY", "nonpositive accepted time interval"));
entry("P2-V04", null, "negative duration", recipe([0, 1], [f(2)], path([0, 1], [1, 0])), rejection("FAILED/INVALID_TRAJECTORY", "reversed accepted times"));
entry("P2-V05", null, "nonfinite accepted time", recipe([0, 1], [f(2)], path([0, 1], [0, "+Infinity"])), rejection("FAILED/INVALID_TRAJECTORY", "nonfinite time"));
entry("P2-V06", null, "near-touch", recipe([0, 0.5, 1], [f(1), f(3)], path([0, 0.5 - 2 ** -54])),
  exact({ Esigned: ["1", "1"], Eabs: ["1", "1"] }, "endpoint strictly below knot; no snap"), { requiredAssertions: ["zero-crossings", "no-endpoint-contact"] });
entry("P2-V07", null, "simultaneous role and step metadata", identity,
  exact({ R1: ["0", "1"], Aref: ["2", "1"] }, "identical geometry with fine vertex at shared crossing"),
  { fine: recipe([0, 0.5, 1], [f(1), f(3)], path([0, 0.5, 1], [0, 0.5, 1])), requiredAssertions: ["one-time-node-all-role-events", "coarse-before-fine", "provider-boundary-kind-order"] });
entry("P2-V08", null, "local integral overflow", recipe([0, 1], [f(Number.MAX_VALUE)], path([0, 1], [0, 2])),
  rejection("FAILED/NONFINITE_ARITHMETIC", "scaledProduct3/overflow; finite input but nonfinite integral"));
entry("P2-V09", null, "touch-return from above", recipe([0, 0.5, 1], [f(1), f(3)], path([1, 0.5, 1])),
  exact({ Esigned: ["6", "1"], Eabs: ["6", "1"] }, "two seconds in upper open segment"), { requiredAssertions: ["no-opposite-side-visit"] });
entry("P2-V10", null, "nonlinear foreign-node reevaluation", recipe([0, 1], [f(0)], path([0, 0.5, 1], [0, 0.5, 1]), { evaluator: "NONLINEAR_TIME_SQUARE" }),
  exact({ R1: ["0", "1"], Aref: ["3", "8"], fineNativeEabs: ["1", "2"] }, "declared local endpoint interpolants of t^2: common two trapezoids 3/8 versus native one trapezoid 1/2; not exact physical integral"),
  { fine: recipe([0, 1], [f(0)], path([0, 1]), { evaluator: "NONLINEAR_TIME_SQUARE" }), requiredAssertions: ["own-path-foreign-node-reevaluation", "native-exposure-not-T-times-Aref"] });
entry("P2-V11", null, "provider failure at foreign node", recipe([0, 1], [f(1)], path([0, 1]), { evaluator: "NONFINITE_AT_HALF" }),
  rejection("FAILED/NONFINITE_ARITHMETIC", "provider/operands at t=1/2 introduced solely by fine grid"),
  { fine: recipe([0, 1], [f(1)], path([0, 0.5, 1], [0, 0.5, 1])) });
entry("P2-V12", null, "owned ineligible knot contact", { ...conditioned, vertices: path([0, 0.5]) },
  rejection("UNSUPPORTED/BOUNDARY_CONDITIONED", "owned upper endpoint closes whole primary step despite supported incoming limit"));
entry("P2-V13", null, "horizontal away from knot", recipe([0, 1], [f(2)], path([0.25, 0.25])),
  exact({ Esigned: ["2", "1"], Eabs: ["2", "1"] }, "constant segment over one second without division by height change"), { requiredAssertions: ["VALID_DEGENERATE", "zero-crossings"] });
entry("P2-V14", null, "distinct internal crossing time collapse", recipe([0, 0.25, 0.3125, 1], [f(2), f(2), f(2)], path([0, 1], [2 ** 53, 2 ** 53 + 8])),
  rejection("FAILED/NUMERICAL_AMBIGUITY", "two distinct lambdas round to same interior time; no merge"));
entry("P2-V15", null, "nonfinite accepted position", recipe([0, 1], [f(2)], [{ t: 0, x: 0, y: 0, z: 0 }, { t: 1, x: "NaN", y: 1, z: 0 }]),
  rejection("FAILED/INVALID_TRAJECTORY", "nonfinite path coordinate before partitioning"));
entry("P2-V16", null, "out-of-domain adjacent interval", recipe([0, 1], [f(2)], path([0.5, 2])),
  rejection("UNSUPPORTED/OUT_OF_DOMAIN", "domain exit cannot be extrapolated or replaced by zero"));

export const SYNTHETIC_REGISTRY = freeze({ schema: "p2-synthetic-registry/v1", version: "v1",
  definitionOnly: true, qualificationCertified: false, executionAuthority: "NOT_AUTHORIZED",
  recipeConvention: "Finite numbers are exact binary64/dyadic literals; special Scalar strings are rejected-input recipe tokens. Support arrays are knot support. Affine field coefficients are segment-local. Primary eligibility unless explicitly unavailable.",
  fixtures,
  // These immutable source recipes supplement primitive fixtures; names bind existing artificial
  // developer checks, not observed inputs. A later runner must execute/attest them separately.
  reviewedRecipeBaseline: "f4e25128f19397bc98bbb9e19db899e6bb4a62cc",
  prerequisiteRecipes: [
    { id: "arithmetic-underflow", source: "src/validation/lagrangianEstimator/arithmetic.validation.test.ts",
      inputs: { operation: "scaledProduct3", factors: [Number.MIN_VALUE, 0.5, 1] }, expected: { bits: "0000000000000000", status: "COMPLETE" } },
    { id: "arithmetic-cancellation", source: "src/validation/lagrangianEstimator/arithmetic.validation.test.ts",
      inputs: { operation: "Neumaier", chronologicalTerms: [2 ** 53, 1, -(2 ** 53)] }, expected: { rational: ["1", "1"], status: "COMPLETE" } },
    { id: "provider-source", source: "src/validation/lagrangianEstimator/partition.validation.test.ts",
      test: "Source ordinary agrees with production away from knots and at ordinary boundaries", expected: "exact ordinary conformance; explicit incoming lower limit differs at knot" },
    { id: "provider-analysis", source: "src/validation/lagrangianEstimator/partition.validation.test.ts",
      test: "Analysis uses supplied profile and segment endpoint support without filtering", expected: "unchanged artificial column; typed support and explicit lower limit" },
    { id: "comparison-finer-history", source: "src/validation/lagrangianEstimator/comparison.validation.test.ts",
      test: "finer history uses its own Aref budget", expected: "non-worsening uses finer tolerance without arithmetic allowance added to scientific budget" },
    { id: "comparison-signed-scale", source: "src/validation/lagrangianEstimator/comparison.validation.test.ts",
      test: "signed cancellation uses its own near-zero scale, independently of Eabs", expected: "signed and absolute scales remain separate" },
    { id: "controller-actual-wiring", source: "src/validation/observedLagrangianPhaseP2Controller.validation.test.ts",
      test: "runs real Slice 1–5 on artificial accepted paths and retains history/exposure traces deterministically", expected: "complete actual estimator traces; deterministic decision" },
    { id: "controller-irreversibility", source: "src/validation/observedLagrangianPhaseP2Controller.validation.test.ts",
      test: "does not recover an interior ineligible Analysis interval with supported endpoints", expected: "whole step excluded and primary prefix never reopens" },
    { id: "controller-fourth-resolution", source: "src/validation/observedLagrangianPhaseP2Controller.validation.test.ts",
      test: "requires full duration at the fourth resolution outside the candidate triple", expected: "reject all-four-resolution viability failure" },
    { id: "controller-precedence-win", source: "src/validation/observedLagrangianPhaseP2Controller.validation.test.ts",
      test: "selects qualified candidate 0 despite an incomplete later candidate", expected: "first qualified candidate selected" },
    { id: "controller-precedence-block", source: "src/validation/observedLagrangianPhaseP2Controller.validation.test.ts",
      test: "stops at incomplete candidate 1 after rejecting candidate 0, without selecting qualified candidate 2", expected: "incomplete, no selected candidate" },
  ],
  prerequisites: [
    { id: "binary64-arithmetic", reference: "P2 section 12 and reviewed arithmetic.validation.test.ts", required: ["separate-rounding-no-FMA", "subnormal-gradual-underflow", "scaled-product-ties-even", "Neumaier-chronological-order", "finite-allowances"] },
    { id: "provider-adapter-conformance", reference: "reviewed partition.validation.test.ts artificial Source/Analysis adapters", required: ["artificial-profiles-only", "ordinary-and-explicit-operands", "support-ownership", "immutable-fingerprints"] },
    { id: "controller-and-comparison", reference: "reviewed comparison and P2Controller validation tests", required: ["all-eight-all-four-resolutions", "whole-step-irreversible-prefix", "oracle-and-lifecycle", "both-pairs-finer-budgets", "complete-ledger", "ordered-incomplete-precedence", "real-estimator-wiring"] },
    { id: "qualification-evidence", reference: "P2 sections 12-15; failure capture remains unimplemented", required: ["independent-rational-references", "full-traces-every-fixture-and-repeat", "runtime-and-implementation-binding", "canonical-artifact-hashes", "fresh-process-reconstruction-without-reintegration", "no-observed-dependencies"] },
  ],
});

/** Checks declarations only. Even a complete declaration set cannot certify execution. */
export function validateRegistryDeclarations(supplied: readonly Fixture[]): Readonly<{ definitionComplete: true; qualificationCertified: false }> {
  canonicalRecord(supplied);
  const ids = supplied.map(x => x.id);
  if (new Set(ids).size !== ids.length) throw new Error("DUPLICATE_FIXTURE_ID");
  if (ids.some(id => !SYNTHETIC_REGISTRY.fixtures.some(fixture => fixture.id === id))) throw new Error("FOREIGN_FIXTURE_ID");
  if (ids.length !== fixtures.length) throw new Error("MISSING_FIXTURE_ID");
  for (const required of SYNTHETIC_REGISTRY.fixtures) {
    const actual = supplied.find(x => x.id === required.id)!;
    if (!required.requiredTraces.every(trace => actual.requiredTraces?.includes(trace))) throw new Error("MISSING_REQUIRED_TRACE_DECLARATION");
    if (canonicalRecord(actual) !== canonicalRecord(required)) throw new Error("FIXTURE_DECLARATION_MISMATCH");
  }
  return Object.freeze({ definitionComplete: true, qualificationCertified: false });
}

/** Whole-registry validation includes supplemental recipes/prerequisites and authority denial. */
export function validateRegistryDefinition(supplied: unknown): Readonly<{ definitionComplete: true; qualificationCertified: false }> {
  canonicalRecord(supplied);
  if (!supplied || typeof supplied !== "object" || !Array.isArray((supplied as typeof SYNTHETIC_REGISTRY).fixtures))
    throw new Error("INVALID_REGISTRY_DEFINITION");
  validateRegistryDeclarations((supplied as typeof SYNTHETIC_REGISTRY).fixtures);
  if (canonicalRecord(supplied) !== canonicalRecord(SYNTHETIC_REGISTRY)) throw new Error("REGISTRY_PREREQUISITE_OR_IDENTITY_MISMATCH");
  return Object.freeze({ definitionComplete: true, qualificationCertified: false });
}
