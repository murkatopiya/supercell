import { queryAnalysisTiltingExplanationAt } from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import type { AnalysisTiltingExplanationResult } from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { createTrajectoryTiltingGlyphModel } from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import type { TrajectoryTiltingGlyphModel } from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import { createTrajectoryTiltingVerificationModel } from "../data/escHrTimeAnalysis/trajectoryTiltingVerification.js";
import type { TrajectoryTiltingVerificationModel } from "../data/escHrTimeAnalysis/trajectoryTiltingVerification.js";
import type { TrajectoryTiltingRecordedSampleContext } from "../data/escHrTimeAnalysis/trajectoryTiltingVerification.js";
import {
  createTrajectoryTiltingWhatIfModel,
  initialThetaWhatIfFromActual,
} from "../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import type { TrajectoryTiltingWhatIfModel } from "../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import type { EscHrTimeAnalysisColumn } from "../data/escHrTimeAnalysis/types.js";
import type { VerticalEnvelopeUpdraftField } from "../physics/storm/VerticalEnvelopeUpdraftField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import {
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  type ExploreEnvironmentIdentity,
} from "./exploreEnvironmentIdentity.js";

/**
 * Demo has no Analysis explanation surface.
 * Moore still shows typed COLUMN_UNAVAILABLE when a sample is selected.
 */
export function exploreAnalysisTiltingExplorerActive(
  identity: ExploreEnvironmentIdentity,
  hasHistoricalSample: boolean,
): boolean {
  return (
    hasHistoricalSample && identity !== EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED
  );
}

/**
 * Slice A at the exact recorded (P, t). Does not resample history.
 * Does not persist T1. Does not fall back to Source T1.
 */
export function resolveExploreHistoricalAnalysisTiltingExplanation(
  analysisColumn: EscHrTimeAnalysisColumn | null | undefined,
  updraft: VerticalEnvelopeUpdraftField,
  position: Vec3,
  simulationTime: number,
): AnalysisTiltingExplanationResult {
  return queryAnalysisTiltingExplanationAt(
    analysisColumn,
    updraft,
    position,
    simulationTime,
  );
}

export interface ExploreHistoricalAnalysisTiltingView {
  readonly explanation: AnalysisTiltingExplanationResult;
  readonly glyphModel: TrajectoryTiltingGlyphModel;
  readonly verificationModel: TrajectoryTiltingVerificationModel;
  readonly whatIfModel: TrajectoryTiltingWhatIfModel;
}

/**
 * Package Slice D/E/F models from one atomic explanation.
 * Does not recompute T1, ω_h, ∇_h Vy, or θ.
 */
export function createExploreHistoricalAnalysisTiltingView(
  explanation: AnalysisTiltingExplanationResult,
  recordedSample: TrajectoryTiltingRecordedSampleContext,
  thetaWhatIf: number | undefined,
): ExploreHistoricalAnalysisTiltingView {
  const glyphModel = createTrajectoryTiltingGlyphModel(
    recordedSample.position,
    explanation,
  );
  const verificationModel = createTrajectoryTiltingVerificationModel(
    explanation,
    recordedSample,
  );
  const theta = thetaWhatIf ?? initialThetaWhatIfFromActual(explanation) ?? 0;
  const whatIfModel = createTrajectoryTiltingWhatIfModel(
    explanation,
    theta,
    recordedSample.position,
  );
  return {
    explanation,
    glyphModel,
    verificationModel,
    whatIfModel,
  };
}

export function exploreHistoricalAnalysisTiltingRecordedIdentity(
  identity: ExploreEnvironmentIdentity,
  tracerId: number,
  historyIndex: number,
  position: Vec3,
  simulationTime: number,
): string {
  return [
    identity,
    String(tracerId),
    String(historyIndex),
    String(position.x),
    String(position.y),
    String(position.z),
    String(simulationTime),
  ].join("|");
}

export function initialExploreWhatIfTheta(
  explanation: AnalysisTiltingExplanationResult | undefined,
): number | undefined {
  if (explanation === undefined) {
    return undefined;
  }
  return initialThetaWhatIfFromActual(explanation);
}
