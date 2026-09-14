/** Generic validation-local contracts. No campaign identities or admission policy. */
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
  ordinary(position: Position, time: number): EstimatorResult<EndpointOperand>;
  explicit(position: Position, time: number, context: EndpointContext): EstimatorResult<EndpointOperand>;
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
