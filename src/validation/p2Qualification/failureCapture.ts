/** Pure operation facade. No fixture iteration, replay, writer or execution gate. */
import { createCapture, closeCapture, type CaptureSnapshot } from "../lagrangianEstimator/capture.js";
import { createAcceptedPath, locateAcceptedStep, positionOnStep } from "../lagrangianEstimator/path.js";
import { createDiagnosticProvider, createSourceProvider, createAnalysisProvider } from "../lagrangianEstimator/providers.js";
import { partitionAcceptedStep } from "../lagrangianEstimator/partition.js";
import { decomposeBinary64, scaledProduct3, localLinearIntegrals, gamma, durationAllowance,
  exposureAllowance, syntheticReferenceAllowance } from "../lagrangianEstimator/arithmetic.js";
import { integrateStepExposure, integratePathExposure } from "../lagrangianEstimator/exposure.js";
import { comparePathHistory } from "../lagrangianEstimator/history.js";
import { compareGeometry, compareHistory, compareExposures, comparePointwise, compareEvents,
  compareSuccessiveRefinement } from "../lagrangianEstimator/comparison.js";
import { prepareRun, planGroup, comparisonRequirements, evaluateGroup, assessGroup, selectCandidate } from "../observedLagrangianPhaseP2Controller.js";
import { AUTHORITY, encodeRejectedInput, type RejectedInput } from "./evidence.js";

function freezeData<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(freezeData); Object.freeze(value);
  }
  return value;
}

const operations = { createAcceptedPath, locateAcceptedStep, positionOnStep, createDiagnosticProvider,
  createSourceProvider, createAnalysisProvider, partitionAcceptedStep, decomposeBinary64, scaledProduct3,
  localLinearIntegrals, gamma, durationAllowance, exposureAllowance, syntheticReferenceAllowance,
  integrateStepExposure, integratePathExposure, comparePathHistory, compareGeometry, compareHistory,
  compareExposures, comparePointwise, compareEvents, compareSuccessiveRefinement,
  prepareRun, planGroup, comparisonRequirements, evaluateGroup, assessGroup, selectCandidate };
const arities: Record<keyof typeof operations, number> = {
  createAcceptedPath: 1, locateAcceptedStep: 2, positionOnStep: 3, createDiagnosticProvider: 1,
  createSourceProvider: 3, createAnalysisProvider: 3, partitionAcceptedStep: 4, decomposeBinary64: 1,
  scaledProduct3: 3, localLinearIntegrals: 4, gamma: 1, durationAllowance: 2, exposureAllowance: 1,
  syntheticReferenceAllowance: 3, integrateStepExposure: 2, integratePathExposure: 2, comparePathHistory: 3,
  compareGeometry: 2, compareHistory: 2, compareExposures: 3, comparePointwise: 2, compareEvents: 2,
  compareSuccessiveRefinement: 2, prepareRun: 1, planGroup: 2, comparisonRequirements: 1,
  evaluateGroup: 2, assessGroup: 2, selectCandidate: 1,
};
export type FailureCapture = Readonly<{ schema: "p2-qualification-failure-capture/v1";
  authority: typeof AUTHORITY; executionAuthority: "NOT_AUTHORIZED"; operation: keyof typeof operations;
  originalInput: RejectedInput | null; inputState: "CAPTURED" | "INCOMPLETE";
  journal: CaptureSnapshot }>;

/** declaredInput is the original data/recipe, never a function-containing closure snapshot.
 * Input encoding failure cannot suppress or retype the actual scientific invocation.
 */
export function captureFailure<K extends keyof typeof operations>(operation: K,
  args: Parameters<(typeof operations)[K]>, declaredInput: unknown): Readonly<{
    result: ReturnType<(typeof operations)[K]>; capture: FailureCapture }> {
  let originalInput: RejectedInput | null = null;
  try { originalInput = freezeData(encodeRejectedInput(declaredInput)); } catch { /* Explicit incomplete input below. */ }
  const context = createCapture();
  const actual = args.slice(0, arities[operation]) as unknown[];
  while (actual.length < arities[operation]) actual.push(undefined);
  actual.push(context);
  let journal: CaptureSnapshot;
  let result: ReturnType<(typeof operations)[K]>;
  try {
    result = (operations[operation] as (...input: unknown[]) => ReturnType<(typeof operations)[K]>)(...actual);
  } finally { journal = closeCapture(context); }
  return { result, capture: Object.freeze({ schema: "p2-qualification-failure-capture/v1", authority: AUTHORITY,
    executionAuthority: "NOT_AUTHORIZED", operation, originalInput,
    inputState: originalInput === null ? "INCOMPLETE" : "CAPTURED", journal }) };
}

/** Pure data projection. Identity/runtime/artifact binding remains a later gate.
 * Raw result and generated intermediates use the approved lossless tagged tree;
 * affected final estimate fields are explicitly null, never partial sums.
 */
export function failureCaptureData(capture: FailureCapture, result: unknown) {
  const status = result !== null && typeof result === "object" && "status" in result ? result.status : undefined;
  const incomplete = capture.inputState === "INCOMPLETE" || capture.journal.state === "INCOMPLETE";
  return freezeData({ schema: "p2-failure-data/v1", authority: capture.authority,
    executionAuthority: capture.executionAuthority, operation: capture.operation,
    state: incomplete ? "INCOMPLETE" : "COMPLETE",
    reasons: [...(capture.inputState === "INCOMPLETE" ? ["ORIGINAL_INPUT_UNAVAILABLE"] : []), ...capture.journal.reasons],
    originalInput: capture.originalInput, result: encodeRejectedInput(result),
    generatedPrefix: encodeRejectedInput(capture.journal),
    affectedScientificOutputs: status === "COMPLETE" ? {} :
      capture.operation.includes("Exposure") ? { Esigned: null, Eabs: null } :
      capture.operation === "comparePathHistory" ? { residualArea: null, referenceArea: null, R1: null, Aref: null } : {},
    implementationIdentity: { state: "NOT_BOUND" }, runtimeIdentity: { state: "NOT_BOUND" },
  });
}
