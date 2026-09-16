/** One reviewed artificial fixture binding. No registry iteration or execution authority. */
import { SYNTHETIC_REGISTRY, validateRegistryDefinition, type Fixture } from "./syntheticRegistry.js";
import { canonicalRecord, encodeRejectedInput } from "./evidence.js";
import { captureFailure } from "./failureCapture.js";
import { rational, roundReference } from "../lagrangianEstimator/syntheticReferences.js";
import type { LinearInterval } from "../lagrangianEstimator/types.js";

const EVALUATOR_VERSION = "p2-synthetic-evaluator/v1";
const REQUIRED = ["typed-no-fabricated-zero", "complete-duration-and-adjacency", "explicit-segment-context",
  "arithmetic-only-allowance", "zero-interior-knots"] as const;
type Verdict = "PASS" | "FAIL" | "INCOMPLETE";
type Outcome = "PASS" | "FAIL" | "INCOMPLETE";

export function qualifyF01(registry: unknown = SYNTHETIC_REGISTRY, evaluatorVersion = EVALUATOR_VERSION) {
  validateRegistryDefinition(registry);
  if (evaluatorVersion !== EVALUATOR_VERSION) throw new Error("F01_EVALUATOR_RECIPE_MISMATCH");
  const declaration = (registry as typeof SYNTHETIC_REGISTRY).fixtures.find(f => f.id === "P2-F01")!;
  if (canonicalRecord(declaration) !== canonicalRecord(SYNTHETIC_REGISTRY.fixtures.find(f => f.id === "P2-F01")))
    throw new Error("F01_DECLARATION_MISMATCH");
  if (declaration.frozenFixture !== 1 || declaration.repetitions !== 1 || declaration.fine !== null ||
    canonicalRecord(declaration.requiredAssertions) !== canonicalRecord(REQUIRED)) throw new Error("F01_BINDING_MISMATCH");
  const r = declaration.coarse;
  if (r.evaluator !== "SEGMENT_AFFINE" || r.fields.length !== 1 || r.heights.length !== 2 || r.support !== "FULL_SUPPORT")
    throw new Error("F01_RECIPE_MISMATCH");
  const vertices = r.vertices.map(v => ({ time: v.t as number, position: { x: v.x as number, y: v.y as number, z: v.z as number } }));
  const identity = canonicalRecord({ providerIdentity: r.providerIdentity, evaluator: r.evaluator, fields: r.fields });
  const providerOptions = { identity, version: evaluatorVersion, heights: [...r.heights] as number[],
    knotSupport: r.heights.map(() => "FULL_SUPPORT" as const),
    evaluate: (i: number, p: { x: number; y: number }, t: number) => {
      const f = r.fields[i];
      return { T1: (((f.c + f.tCoefficient * t) + f.xCoefficient * p.x) + f.yCoefficient * p.y),
        omega: null, gradient: null };
    } };
  const construction = { vertices, provider: { identity, version: evaluatorVersion, heights: providerOptions.heights,
    knotSupport: providerOptions.knotSupport, evaluator: r.evaluator, fields: r.fields },
    partitionRequest: { eligibility: "ELIGIBLE", support: "FULL_SUPPORT" }, exposureRequest: { role: "PRIMARY" } } as const;
  const operations: Array<{ symbol: string; args: unknown; result: unknown; capture: unknown }> = [];
  const call = (symbol: string, args: unknown, invoke: () => { result: unknown; capture: unknown }) => {
    const outcome = invoke(); operations.push({ symbol, args, ...outcome }); return outcome.result;
  };
  const path = call("createAcceptedPath", vertices, () => captureFailure("createAcceptedPath", [vertices], { declaration, vertices }));
  if (status(path) === "COMPLETE") {
    const provider = call("createDiagnosticProvider", construction.provider,
      () => captureFailure("createDiagnosticProvider", [providerOptions], { declaration, construction: construction.provider }));
    if (status(provider) === "COMPLETE") {
      const p = (path as { status: "COMPLETE"; value: any }).value;
      const q = (provider as { status: "COMPLETE"; value: any }).value;
      const partition = call("partitionAcceptedStep", { pathFingerprint: p.fingerprint, stepIndex: 0, request: construction.partitionRequest },
        () => captureFailure("partitionAcceptedStep", [p, 0, q, construction.partitionRequest], { declaration, stepIndex: 0, request: construction.partitionRequest }));
      if (status(partition) === "COMPLETE") call("integratePathExposure", { partition: 0, request: construction.exposureRequest },
        () => captureFailure("integratePathExposure", [[partition as any], construction.exposureRequest], { declaration, request: construction.exposureRequest }));
    }
  }
  const referenceFor = (key: "Esigned" | "Eabs") => {
    const [n, d] = declaration.reference.quantities[key];
    return { owner: "syntheticRegistry/P2-F01", rational: [n, d], rounded: roundReference(rational(BigInt(n), BigInt(d))) };
  };
  const refs = { Esigned: referenceFor("Esigned"), Eabs: referenceFor("Eabs") };
  const analyticIntervals: LinearInterval[] = [{ a: vertices[0].time, b: vertices[1].time, u: r.fields[0].c, v: r.fields[0].c }];
  const allowance = captureFailure("syntheticReferenceAllowance", [analyticIntervals], { declaration, analyticIntervals });
  return assessF01({ declaration, construction, operations, references: refs, analyticIntervals, allowance,
    future: { implementationIdentity: "NOT_BOUND", runtimeIdentity: "NOT_BOUND", artifacts: "NOT_PERFORMED", reconstruction: "NOT_PERFORMED" } });
}

function status(value: unknown): string | undefined {
  return value && typeof value === "object" && "status" in value ? String(value.status) : undefined;
}

/** Pure reassessment permits review of contradictory or missing evidence without rerunning science. */
export function assessF01(input: ReturnType<typeof makeShape>) {
  const { declaration, operations, references, allowance } = input;
  const by = (name: string) => operations.find(x => x.symbol === name);
  const path = by("createAcceptedPath")?.result as any;
  const provider = by("createDiagnosticProvider")?.result as any;
  const part = by("partitionAcceptedStep")?.result as any;
  const exp = by("integratePathExposure")?.result as any;
  const assertions: Array<{ id: string; outcome: Outcome; expected: unknown; actual: unknown; reason: string | null }> = [];
  const check = (id: string, available: boolean, ok: boolean, expected: unknown, actual: unknown) =>
    assertions.push({ id, outcome: !available ? "INCOMPLETE" : ok ? "PASS" : "FAIL", expected, actual,
      reason: available ? null : "REQUIRED_EVIDENCE_MISSING" });
  const equalData = (a: unknown, b: unknown) => {
    try { return canonicalRecord(a) === canonicalRecord(b); } catch { return false; }
  };
  const ordered = operations.map(x => x.symbol);
  const frozenF01 = SYNTHETIC_REGISTRY.fixtures.find(f => f.id === "P2-F01")!;
  check("binding/declaration", !!declaration,
    equalData(declaration, frozenF01), frozenF01, declaration);
  check("binding/graph-order", true, canonicalRecord(ordered) === canonicalRecord([
    "createAcceptedPath", "createDiagnosticProvider", "partitionAcceptedStep", "integratePathExposure"]),
  "PATH→PROVIDER→PART→EXP", ordered);
  for (const key of ["Esigned", "Eabs"] as const) {
    const declared = declaration.reference.quantities[key];
    const supplied = references?.[key];
    const expected = declared && { owner: "syntheticRegistry/P2-F01", rational: [declared[0], declared[1]],
      rounded: roundReference(rational(BigInt(declared[0]), BigInt(declared[1]))) };
    check(`binding/reference/${key}`, !!declared && !!supplied?.rational && Number.isFinite(supplied?.rounded),
      equalData(supplied, expected), expected, supplied);
  }
  const vertices = declaration.coarse.vertices;
  const field = declaration.coarse.fields[0];
  const declaredAnalyticIntervals = [{ a: vertices[0].t, b: vertices[1].t, u: field.c, v: field.c }];
  const allowanceCapture = allowance?.capture as any;
  const allowanceReturn = allowanceCapture?.journal?.events?.find((event: any) =>
    event.site === "arithmetic/site-BJE/return")?.value;
  check("binding/allowance", !!input.analyticIntervals && !!allowance?.result &&
    !!allowanceCapture?.originalInput && !!allowanceReturn,
    equalData(input.analyticIntervals, declaredAnalyticIntervals) &&
    equalData(allowanceCapture?.originalInput,
      encodeRejectedInput({ declaration, analyticIntervals: declaredAnalyticIntervals })) &&
    equalData(allowance.result, allowanceReturn),
    { analyticIntervals: declaredAnalyticIntervals, nativeAllowanceReturn: allowanceReturn },
    { analyticIntervals: input.analyticIntervals, result: allowance?.result });
  const pv = part?.value, ev = exp?.value, topology = provider?.value?.topology;
  const interval = pv?.intervals?.[0], contribution = ev?.trace?.contributions?.[0];
  const nodes = pv?.nodes;
  const endpointCalls = (by("partitionAcceptedStep")?.capture as any)?.journal?.events;
  const hasSite = (site: string) => Array.isArray(endpointCalls) && endpointCalls.some((e: any) => e.site === site);
  const endpointReturn = (site: string) => Array.isArray(endpointCalls) ?
    endpointCalls.find((e: any) => e.site === site)?.value : undefined;
  const traceChecks: Record<string, readonly [boolean, boolean, unknown]> = {
    "original-inputs": [!!input.construction?.vertices && !!declaration &&
      operations.every(op => !!(op.capture as any)?.originalInput && (op.capture as any)?.inputState === "CAPTURED"),
      equalData(input.construction?.vertices, declaration.coarse.vertices.map(v =>
        ({ time: v.t, position: { x: v.x, y: v.y, z: v.z } }))) &&
      equalData(input.construction?.provider?.fields, declaration.coarse.fields) &&
      input.construction?.provider?.version === EVALUATOR_VERSION &&
      input.construction?.provider?.identity === canonicalRecord({ providerIdentity: declaration.coarse.providerIdentity,
        evaluator: declaration.coarse.evaluator, fields: declaration.coarse.fields }), input.construction],
    "provider-topology": [!!topology?.heights && !!topology?.segments && !!topology?.support,
      topology?.fingerprint === provider?.value?.fingerprint && topology?.version === EVALUATOR_VERSION &&
      equalData(topology?.heights, declaration.coarse.heights) &&
      topology?.segments?.length === 1 && topology?.segments?.[0]?.providerFingerprint === topology?.fingerprint &&
      topology?.support?.[0] === "FULL_SUPPORT", topology],
    "accepted-path": [!!path?.value?.vertices && !!path?.value?.steps,
      path?.value?.vertices?.length === 2 && path?.value?.steps?.length === 1 &&
      equalData(path?.value?.vertices, input.construction?.vertices) &&
      path?.value?.steps?.[0]?.pathFingerprint === path?.value?.fingerprint &&
      path?.value?.steps?.[0]?.from === path?.value?.vertices?.[0] &&
      path?.value?.steps?.[0]?.to === path?.value?.vertices?.[1], path?.value],
    "events": [Array.isArray(nodes) && nodes.length > 0 && !!pv?.step && Array.isArray(endpointCalls),
      nodes?.length === 2 && nodes?.[0]?.time === 0 && nodes?.[1]?.time === 4 &&
      nodes?.[0]?.contact?.pathFingerprint === path?.value?.fingerprint &&
      nodes?.[1]?.contact?.pathFingerprint === path?.value?.fingerprint &&
      nodes?.[0]?.contact?.boundary?.providerFingerprint === provider?.value?.fingerprint &&
      nodes?.[1]?.contact?.boundary?.providerFingerprint === provider?.value?.fingerprint &&
      nodes?.[0]?.contact?.location?.kind === "VERTEX" && nodes?.[0]?.contact?.location?.index === 0 &&
      nodes?.[1]?.contact?.location?.kind === "VERTEX" && nodes?.[1]?.contact?.location?.index === 1 &&
      pv?.step === path?.value?.steps?.[0] && interval?.left === nodes?.[0] && interval?.right === nodes?.[1], nodes],
    "endpoint-evaluations": [!!interval?.start && !!interval?.end &&
      hasSite("partition/site-IF/provider-explicit/return") && hasSite("partition/site-IH/provider-explicit/return"),
      hasSite("partition/site-IF/provider-explicit/return") && hasSite("partition/site-IH/provider-explicit/return") &&
      equalData(endpointReturn("partition/site-IF/provider-explicit/return")?.value, interval?.start) &&
      equalData(endpointReturn("partition/site-IH/provider-explicit/return")?.value, interval?.end) &&
      interval?.start?.time === nodes?.[0]?.time && interval?.end?.time === nodes?.[1]?.time &&
      equalData(interval?.start?.position, nodes?.[0]?.position) &&
      equalData(interval?.end?.position, nodes?.[1]?.position) &&
      interval?.start?.context?.side === "TEMPORAL_PLUS" && interval?.end?.context?.side === "TEMPORAL_MINUS" &&
      interval?.start?.T1 === -3 && interval?.end?.T1 === -3, { start: interval?.start, end: interval?.end }],
    "subinterval-contributions": [Array.isArray(ev?.trace?.inputs) && Array.isArray(ev?.trace?.contributions) && !!contribution,
      ev?.trace?.inputs?.length === 1 && ev?.trace?.inputs?.[0]?.status === "COMPLETE" &&
      ev?.trace?.inputs?.[0]?.value?.step?.pathFingerprint === path?.value?.fingerprint &&
      ev?.trace?.contributions?.length === 1 && contribution?.order === 0 && contribution?.stepIndex === 0 &&
      contribution?.subintervalIndex === 0 && contribution?.pathFingerprint === path?.value?.fingerprint &&
      contribution?.interval?.left?.time === interval?.left?.time && contribution?.interval?.right?.time === interval?.right?.time &&
      Number.isFinite(contribution?.signed) && Number.isFinite(contribution?.abs), ev?.trace],
    "totals-bounds-status": [!!ev?.allowance && !!ev?.invariants && Number.isFinite(ev?.Esigned) && Number.isFinite(ev?.Eabs) &&
      Number.isFinite(pv?.durationSum) && Number.isFinite(pv?.durationBound),
      exp?.status === "COMPLETE" && part?.status === "COMPLETE" && ev?.schema === "p2-exposure/v1" &&
      ev?.role === "PRIMARY" && ev?.support === "FULL_SUPPORT" && ev?.pathFingerprint === path?.value?.fingerprint &&
      ev?.providerFingerprint === provider?.value?.fingerprint && ev?.stepCount === 1 && ev?.subintervalCount === 1 &&
      ev?.crossingCount === pv?.crossingCount && pv?.durationBound >= 0 && ev?.allowance?.bound >= 0 &&
      ev?.invariants?.absoluteNonnegative === true && ev?.invariants?.signedBounded === true,
      { status: exp?.status, durationSum: pv?.durationSum, durationBound: pv?.durationBound,
        Esigned: ev?.Esigned, Eabs: ev?.Eabs, allowance: ev?.allowance, invariants: ev?.invariants }],
  };
  for (const trace of declaration.requiredTraces) {
    const [available, ok, actual] = traceChecks[trace] ?? [false, false, null];
    check(`trace/${trace}`, available, ok, true, actual);
  }
  for (const op of operations) check(`capture/${op.symbol}`, !!(op.capture as any)?.journal &&
    (op.capture as any).journal.state === "COMPLETE_GENERATED_PREFIX" &&
    (op.capture as any).operation === op.symbol && (op.capture as any).inputState === "CAPTURED", true,
    "COMPLETE_GENERATED_PREFIX", (op.capture as any)?.journal?.state);
  check("capture/syntheticReferenceAllowance", !!(allowance?.capture as any)?.journal &&
    (allowance.capture as any).inputState === "CAPTURED" &&
    (allowance.capture as any).journal.state === "COMPLETE_GENERATED_PREFIX" &&
    (allowance.capture as any).operation === "syntheticReferenceAllowance", true,
    "COMPLETE_GENERATED_PREFIX", (allowance?.capture as any)?.journal?.state);
  check("typed-no-fabricated-zero", !!path && !!provider && !!part && !!exp,
    [path, provider, part, exp].every(x => x?.status === "COMPLETE"), "COMPLETE at all four operations",
    [path, provider, part, exp].map(x => x?.status ?? null));
  check("complete-duration-and-adjacency", !!part?.value && !!exp?.value,
    part?.value?.durationSum === 4 && part?.value?.intervals?.length === 1 &&
    part?.value?.intervals?.[0]?.left?.time === 0 && part?.value?.intervals?.[0]?.right?.time === 4 &&
    exp?.value?.interval?.a === 0 && exp?.value?.interval?.b === 4 && exp?.value?.stepCount === 1,
    "one adjacent [0,4] interval", { duration: part?.value?.durationSum, interval: exp?.value?.interval });
  check("explicit-segment-context", !!part?.value?.intervals?.[0] && !!provider?.value,
    [part?.value?.intervals?.[0]?.start, part?.value?.intervals?.[0]?.end].every(x =>
      x?.context?.segment?.providerFingerprint === provider?.value?.fingerprint && x?.context?.segment?.index === 0 &&
      x?.support === "FULL_SUPPORT" && x?.T1 === -3), "segment 0, full support, T1=-3", part?.value?.intervals?.[0]);
  check("arithmetic-only-allowance", allowance?.result?.status === "COMPLETE" && !!exp?.value?.allowance,
    Number.isFinite((allowance.result as any)?.value?.bound) && (allowance.result as any).value.bound >= 0 &&
    exp.value.invariants?.absoluteNonnegative === true && exp.value.invariants?.signedBounded === true,
    "finite independent allowance and native invariants", allowance.result);
  check("zero-interior-knots", !!part?.value && !!exp?.value,
    part.value.crossingCount === 0 && exp.value.crossingCount === 0 && part.value.nodes?.length === 2,
    0, part.value.crossingCount);
  check("native-contributions-bounds", !!part?.value && !!exp?.value,
    exp.value.trace?.contributions?.length === 1 && exp.value.subintervalCount === 1 &&
    Number.isFinite(part.value.durationBound) && Number.isFinite(exp.value.allowance?.bound),
    "one native contribution and finite bounds", { contributions: exp.value.trace?.contributions?.length,
      durationBound: part.value.durationBound, exposureBound: exp.value.allowance?.bound });
  for (const key of ["Esigned", "Eabs"] as const) {
    const actual = exp?.value?.[key], expected = references?.[key]?.rounded, bound = (allowance?.result as any)?.value?.bound;
    check(`reference/${key}`, Number.isFinite(actual) && Number.isFinite(expected) && Number.isFinite(bound),
      Math.abs(actual - expected) <= bound, { rational: references?.[key]?.rational, rounded: expected, bound }, actual);
  }
  const missingEvidence = assertions.filter(x => x.outcome === "INCOMPLETE").map(x => x.id);
  const failedAssertions = assertions.filter(x => x.outcome === "FAIL").map(x => x.id);
  const verdict: Verdict = missingEvidence.length ? "INCOMPLETE" : failedAssertions.length ? "FAIL" : "PASS";
  return { ...input, assertions, missingEvidence, failedAssertions, verdict,
    claimScope: "P2-F01_LOCAL_IN_MEMORY_ONLY" as const };
}

function makeShape() { return {} as { declaration: Fixture; construction: any;
  operations: Array<{ symbol: string; args: unknown; result: unknown; capture: unknown }>;
  references: Record<"Esigned" | "Eabs", { owner: string; rational: readonly string[]; rounded: number }>;
  analyticIntervals: LinearInterval[]; allowance: { result: any; capture: unknown }; future: Record<string, string> }; }
