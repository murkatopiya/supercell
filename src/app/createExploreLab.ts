import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { ExplorePointReleaseOrchestration } from "../explore/ExplorePointReleaseOrchestration.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { ExplorePointReleaseTool } from "../explore/ExplorePointReleaseTool.js";
import { ExploreTracerSession } from "../explore/ExploreTracerSession.js";
import type { InspectableVelocityOperands } from "../interaction/TracerInspection.js";
import { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { EulerianAirflowSamples } from "../visualization/EulerianAirflowSamples.js";
import type { EscHrTimeAnalysisColumn } from "../data/escHrTimeAnalysis/types.js";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  type ExploreEnvironmentIdentity,
} from "../explore/exploreEnvironmentIdentity.js";
import { composeDemoTracersWithObservation } from "./composeDemoTracerSimulation.js";
import { DEMO_VISUAL_AIRFLOW_POPULATION } from "./demoVisualAirflowFixture.js";
import { DEMO_EULERIAN_AIRFLOW_SAMPLES } from "./demoEulerianAirflowFixture.js";
import { exploreEnvironmentRepresentations } from "./exploreEnvironmentRepresentations.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import type { DiagnosticTiltingTendency } from "../physics/diagnostics/DiagnosticTiltingTendency.js";
import type { DiagnosticVerticalVorticity } from "../physics/diagnostics/DiagnosticVerticalVorticity.js";
import type { Simulation } from "../simulation/Simulation.js";

export interface ExploreLab {
  readonly kind: "explore";
  readonly environmentIdentity: ExploreEnvironmentIdentity;
  readonly simulation: Simulation;
  readonly pathHistory: TracerPathHistory;
  readonly session: ExploreTracerSession;
  readonly tool: ExplorePointReleaseTool;
  readonly orchestration: ExplorePointReleaseOrchestration;
  readonly velocityObservation: InspectableVelocityOperands;
  readonly visualAirflowPopulation: VisualAirflowPopulation;
  readonly eulerianAirflowSamples: EulerianAirflowSamples;
  readonly tiltingTendency: DiagnosticTiltingTendency;
  readonly currentVerticalVorticity: DiagnosticVerticalVorticity;
  /**
   * Diagnostic Analysis sibling of the Source EWP that advects.
   * Null is COLUMN_UNAVAILABLE (Moore, Demo). Not a velocity operand.
   */
  readonly analysisColumn: EscHrTimeAnalysisColumn | null;
}

/**
 * Empty seven-operand storm-relative laboratory. No Guided seeds.
 * Trails on (history object present). keepInactiveGlyphs is a renderer flag.
 */
export function composeExploreTracerSimulation(
  integrationFrame: IntegrationFrame = IntegrationFrame.StormRelativeLaboratory,
): Simulation {
  return composeDemoTracersWithObservation(integrationFrame, []).simulation;
}

/**
 * Enter Explore: zero particles, zero history lanes, empty session.
 * Scene slots start at 0 when TracerViewport mounts with this cohort.
 * velocityObservation holds the SAME operand instances Simulation integrates.
 * Visual airflow and Eulerian samples observe that same total field.
 * Visual advection uses the same Euler instance.
 *
 * Explore identity selects Source EWP for advection and the matching
 * Analysis diagnostic sibling. Demo and Moore have analysisColumn null.
 * Storm operands and prescribed C remain DEMO. Guided does not use this.
 * Analysis is not passed to Simulation or CompositeVelocityField.
 */
export function createExploreLab(
  sceneSlots: ExploreSceneSlots,
  identity: ExploreEnvironmentIdentity = DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
): ExploreLab {
  const environment = exploreEnvironmentRepresentations(identity);
  const {
    simulation,
    velocityObservation,
    integrator,
    tiltingTendency,
    currentVerticalVorticity,
  } = composeDemoTracersWithObservation(
    IntegrationFrame.StormRelativeLaboratory,
    [],
    environment.sourceProfile,
  );
  const pathHistory = new TracerPathHistory(0);
  const session = new ExploreTracerSession(simulation, pathHistory);
  const tool = new ExplorePointReleaseTool();
  const orchestration = new ExplorePointReleaseOrchestration(
    session,
    tool,
    sceneSlots,
  );
  const visualAirflowPopulation = new VisualAirflowPopulation(
    velocityObservation.total,
    integrator,
    DEMO_VISUAL_AIRFLOW_POPULATION,
  );
  const eulerianAirflowSamples = new EulerianAirflowSamples(
    velocityObservation.total,
    DEMO_EULERIAN_AIRFLOW_SAMPLES,
  );
  return {
    kind: "explore",
    environmentIdentity: environment.identity,
    simulation,
    pathHistory,
    session,
    tool,
    orchestration,
    velocityObservation,
    visualAirflowPopulation,
    eulerianAirflowSamples,
    tiltingTendency,
    currentVerticalVorticity,
    analysisColumn: environment.analysisColumn,
  };
}

/**
 * In-place Explore Reset: scientific cohort replay plus deterministic
 * visual-population reseed. Same lab, same canonical field.
 */
export function resetExploreLab(lab: ExploreLab): void {
  lab.orchestration.reset();
  lab.visualAirflowPopulation.reset();
}
