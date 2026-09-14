/** Generic validation-local contracts. No campaign identities or admission policy. */
import type { CaptureContext } from "./capture.js";
export type ArithmeticFailure = Readonly<{
  status: "FAILED";
  code: "INVALID_INPUT" | "NONFINITE_ARITHMETIC";
  operation: string;
}>;
export type ArithmeticResult<T> =
  | Readonly<{ status: "COMPLETE"; value: T }>
  | ArithmeticFailure;
export type Interval = Readonly<{ a: number; b: number }>;
export type LinearInterval = Interval & Readonly<{ u: number; v: number }>;
export type Binary64Parts = Readonly<{ mantissa: number; exponent: number }>;
export type LinearIntegrals = Readonly<{
  signed: number;
  abs: number;
  zeroFraction: number | null;
}>;
export type ArithmeticAllowance = Readonly<{ k: number; scale: number; bound: number }>;

export type Position = Readonly<{ x: number; y: number; z: number }>;
export type PathVertex = Readonly<{ time: number; position: Position }>;
export type AcceptedStep = Readonly<{
  pathFingerprint: string; index: number; from: PathVertex; to: PathVertex;
}>;
export type AcceptedPath = Readonly<{
  fingerprint: string; vertices: readonly PathVertex[]; steps: readonly AcceptedStep[];
}>;
export type EstimatorFailure = Readonly<{
  status: "FAILED";
  code: "INVALID_TRAJECTORY" | "MALFORMED_PROFILE" | "PROVIDER_MISMATCH"
    | "NUMERICAL_AMBIGUITY" | "NONFINITE_ARITHMETIC" | "INVALID_CONTEXT" | "PROVIDER_FAILURE";
  operation: string;
}>;
export type EstimatorResult<T> = Readonly<{ status: "COMPLETE"; value: T }>
  | EstimatorFailure
  | Readonly<{ status: "N_A"; reason: "COLUMN_UNAVAILABLE"; value: null }>
  | Readonly<{ status: "UNSUPPORTED"; reason: "OUT_OF_DOMAIN" | "INELIGIBLE_INTERVAL" | "BOUNDARY_CONDITIONED"; value: null }>;
export type SegmentId = Readonly<{ providerFingerprint: string; index: number }>;
export type BoundaryId = Readonly<{ providerFingerprint: string; index: number }>;
export type DiagnosticSupport = "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
export type ProviderTopology = Readonly<{
  fingerprint: string; version: string; heights: readonly number[];
  segments: readonly SegmentId[]; boundaries: readonly BoundaryId[];
  support: readonly DiagnosticSupport[];
}>;
export type TemporalSide = "ORDINARY" | "TEMPORAL_MINUS" | "TEMPORAL_PLUS" | "DWELL";
export type EndpointContext = Readonly<{ segment: SegmentId; side: TemporalSide }>;
export type DiagnosticValue = Readonly<{
  T1: number; omega: readonly [number, number] | null; gradient: readonly [number, number] | null;
}>;
export type EndpointOperand = DiagnosticValue & Readonly<{
  position: Position; time: number; context: EndpointContext; support: DiagnosticSupport;
}>;
export interface VerticalDiagnosticProvider {
  readonly fingerprint: string;
  readonly topology: ProviderTopology | null;
  ordinary(position: Position, time: number, capture?: CaptureContext): EstimatorResult<EndpointOperand>;
  explicit(position: Position, time: number, context: EndpointContext, capture?: CaptureContext): EstimatorResult<EndpointOperand>;
}
export type BoundaryContact = Readonly<{
  pathFingerprint: string; boundary: BoundaryId;
  location: Readonly<{ kind: "VERTEX"; index: number }> | Readonly<{ kind: "STEP_INTERIOR"; index: number }>;
}>;
export type PartitionNode = Readonly<{
  time: number; lambda: number; position: Position; contact: BoundaryContact | null;
}>;
export type SegmentSubinterval = Readonly<{
  left: PartitionNode; right: PartitionNode; segment: SegmentId;
  geometry: "REGULAR" | "VALID_DEGENERATE";
  start: EndpointOperand; end: EndpointOperand;
}>;
export type StepPartition = Readonly<{
  step: AcceptedStep; nodes: readonly PartitionNode[]; intervals: readonly SegmentSubinterval[];
  crossingCount: number; durationSum: number; durationBound: number;
}>;
/** Caller authority only: this does not compute a campaign's eligible prefix. */
export type PartitionRequest = Readonly<{
  eligibility: "ELIGIBLE" | "INELIGIBLE";
  support: "FULL_SUPPORT" | "ALLOW_BOUNDARY_CONDITIONED";
}>;

/** Caller attests the already-authorized evidence role; no eligibility decision here. */
export type ExposureRequest = Readonly<{ role: "PRIMARY" | "SECONDARY_DESCRIPTIVE" }>;
export type ExposureContribution = LinearIntegrals & Readonly<{
  order: number; stepIndex: number; subintervalIndex: number;
  pathFingerprint: string; interval: SegmentSubinterval;
}>;
export type ExposureTrace = Readonly<{
  inputs: readonly EstimatorResult<StepPartition>[];
  contributions: readonly ExposureContribution[];
}>;
export type ExposureEvidence = Readonly<{
  schema: "p2-exposure/v1"; units: "s^-1";
  role: ExposureRequest["role"]; support: DiagnosticSupport;
  pathFingerprint: string; providerFingerprint: string;
  interval: Interval; stepCount: number; subintervalCount: number; crossingCount: number;
  Esigned: number; Eabs: number; allowance: ArithmeticAllowance;
  invariants: Readonly<{ absoluteNonnegative: boolean; signedBounded: boolean }>;
  trace: ExposureTrace;
}>;
export type ExposureResult = Readonly<{ status: "COMPLETE"; value: ExposureEvidence }>
  | ((Exclude<EstimatorResult<never>, { status: "COMPLETE" }> | ArithmeticFailure)
    & Readonly<{ trace: ExposureTrace }>);

/** Applicability is supplied by the caller, never inferred by history. */
export type HistoryPath = Readonly<{
  path: AcceptedPath; provider: VerticalDiagnosticProvider;
  eligibility: PartitionRequest["eligibility"];
}>;
export type HistoryRequest = Readonly<{
  interval: Interval; role: "PRIMARY" | "SECONDARY_DESCRIPTIVE";
}>;
export type HistoryRole = "COARSE" | "FINE";
export type HistoryPathEvidence = Readonly<{
  path: AcceptedPath; providerFingerprint: string; topology: ProviderTopology | null;
  eligibility: PartitionRequest["eligibility"];
}>;
export type HistoryNodeEvent = Readonly<{
  role: HistoryRole | null;
  kind: "INTERVAL_START" | "INTERVAL_END" | "STEP_VERTEX" | "DIAGNOSTIC_CONTACT";
  pathFingerprint: string | null; providerFingerprint: string | null;
  vertexIndex: number | null; contact: BoundaryContact | null;
}>;
export type HistoryNode = Readonly<{ time: number; events: readonly HistoryNodeEvent[] }>;
export type HistoryOperands = Readonly<{
  pathFingerprint: string; providerFingerprint: string; stepIndex: number;
  segment: SegmentId; start: EndpointOperand; end: EndpointOperand;
}>;
export type HistoryContribution = Interval & Readonly<{
  order: number; coarse: HistoryOperands; fine: HistoryOperands;
  d0: number; d1: number; residualArea: number; referenceArea: number;
  residualZeroFraction: number | null; referenceZeroFraction: number | null;
}>;
export type HistoryTrace = Readonly<{
  request: HistoryRequest;
  inputs: readonly EstimatorResult<HistoryPathEvidence>[]; // coarse, then fine
  partitions: readonly Readonly<{ role: HistoryRole; stepIndex: number; result: EstimatorResult<StepPartition> }>[];
  nodes: readonly HistoryNode[];
  evaluations: readonly Readonly<{
    role: HistoryRole; stepIndex: number; time: number; context: EndpointContext;
    result: EstimatorResult<EndpointOperand>;
  }>[];
  contributions: readonly HistoryContribution[];
}>;
export type HistoryEvidence = Readonly<{
  schema: "p2-history/v1"; units: "s^-2"; areaUnits: "s^-1";
  runtime: Readonly<{ node: string; v8: string }>;
  interval: Interval; duration: number; role: HistoryRequest["role"]; support: DiagnosticSupport;
  coarsePathFingerprint: string; finePathFingerprint: string;
  coarseProviderFingerprint: string; fineProviderFingerprint: string;
  residualArea: number; referenceArea: number; R1: number; Aref: number;
  durationSum: number; durationAllowance: ArithmeticAllowance;
  arithmetic: Readonly<{
    scope: "LOCAL_INTERPOLANT_ARITHMETIC_ONLY";
    residualArea: ArithmeticAllowance; referenceArea: ArithmeticAllowance;
    R1: ArithmeticAllowance; Aref: ArithmeticAllowance;
  }>;
  trace: HistoryTrace;
}>;
export type HistoryResult = Readonly<{ status: "COMPLETE"; value: HistoryEvidence }>
  | ((Exclude<EstimatorResult<never>, { status: "COMPLETE" }> | ArithmeticFailure)
    & Readonly<{ trace: HistoryTrace }>);

export type ComparisonRun = Readonly<{ id: string; pathFingerprint: string; h: number }>;
export type ComparisonContext = Readonly<{
  coarse: ComparisonRun; fine: ComparisonRun; interval: Interval;
  channel: string; role: "PRIMARY" | "SECONDARY_DESCRIPTIVE";
}>;
export type ComparisonMetric = "POSITION" | "VERTICAL" | "RESPONSE" | "VERTICAL_RESPONSE"
  | "HISTORY" | "EXPOSURE_ABS" | "EXPOSURE_SIGNED" | "POINTWISE"
  | "EVENT_WIDTH" | "EVENT_TIME" | "EVENT_TYPES" | "EVENT_COUNT" | "PREFIX_TIME";
export type ComparisonOutcome = "PASS" | "INVALID CONTROL";
export type ComparisonCheck = Readonly<{
  key: string; metric: ComparisonMetric; units: "m" | "s" | "s^-1" | "s^-2" | "1";
  residual: number; tolerance: number; scale: number | null;
  absoluteTerm: number | null; relativeTerm: number | null;
  outcome: ComparisonOutcome; reason: "WITHIN_TOLERANCE" | "TOLERANCE_EXCEEDED";
  arithmetic: readonly ArithmeticAllowance[];
  details: Readonly<Record<string, unknown>>;
}>;
export type ComparisonBundle = Readonly<{
  schema: "p2-comparison/v1"; context: ComparisonContext;
  checks: readonly ComparisonCheck[]; outcome: ComparisonOutcome;
  details: Readonly<Record<string, unknown>>;
}>;
export type ComparisonRejection = Exclude<EstimatorResult<never>, { status: "COMPLETE" }> | ArithmeticFailure
  | Readonly<{ status: "N_A"; reason: "NO_SEGMENT_MATCHED_SAMPLES" | "BASELINE_SELF_RESPONSE"; value: null }>;
export type PreparedComparison<T> = Readonly<{ status: "COMPLETE"; value: T }> | ComparisonRejection;
export type ComparisonResult<T = ComparisonBundle> = Readonly<{ status: "COMPLETE"; value: T }>
  | (ComparisonRejection & Readonly<{ evidence: Readonly<{ context: ComparisonContext; input: unknown }> }>);
/** Rows are complete, already-matched stored common coarse-grid samples. No interpolation. */
export type PreparedGeometry = Readonly<{
  basis: "STORED_COMMON_COARSE_TIMES"; kind: "POSITION" | "MEMBER_RESPONSE" | "BASELINE_SELF_RESPONSE";
  baselineIds: Readonly<{ coarse: string; fine: string }> | null;
  samples: readonly Readonly<{ coarse: PathVertex; fine: PathVertex;
    coarseBaseline: PathVertex | null; fineBaseline: PathVertex | null }>[];
}>;
export type PreparedCrossingBracket = Interval & Readonly<{ representation: string }>;
export type PreparedPointwise = Readonly<{
  basis: "STORED_COMMON_COARSE_TIMES";
  samples: readonly Readonly<{ coarse: EndpointOperand; fine: EndpointOperand }>[];
  coarseCrossings: readonly PreparedCrossingBracket[]; fineCrossings: readonly PreparedCrossingBracket[];
}>;
export type PreparedLifecycleEvent = Interval & Readonly<{
  kind: string; representation: string | null; category: "LIFECYCLE" | "DIAGNOSTIC_CROSSING";
}>;
export type PreparedEvents = Readonly<{
  coarseEvents: readonly PreparedLifecycleEvent[]; fineEvents: readonly PreparedLifecycleEvent[];
  coarsePrefixTime: number; finePrefixTime: number;
}>;
export type RefinementEvidence = Readonly<{
  schema: "p2-refinement/v1"; coarser: ComparisonBundle; finer: ComparisonBundle;
  nonWorsening: readonly Readonly<{
    key: string; metric: ComparisonMetric; units: ComparisonCheck["units"];
    coarserResidual: number; finerResidual: number; finerTolerance: number;
    increase: number; allowance: number; outcome: ComparisonOutcome;
  }>[];
  excluded: readonly Readonly<{ key: string; reason: "NOT_AN_AGGREGATE_REFINEMENT_METRIC" }>[];
  ordinaryOutcome: ComparisonOutcome; outcome: ComparisonOutcome;
}>;
