import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { ExplorePointReleaseOrchestration } from "../explore/ExplorePointReleaseOrchestration.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { ExplorePointReleaseTool } from "../explore/ExplorePointReleaseTool.js";
import { ExploreTracerSession } from "../explore/ExploreTracerSession.js";
import type { InspectableVelocityOperands } from "../interaction/TracerInspection.js";
import { composeDemoTracersWithObservation } from "./composeDemoTracerSimulation.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import type { Simulation } from "../simulation/Simulation.js";

export interface ExploreLab {
  readonly kind: "explore";
  readonly simulation: Simulation;
  readonly pathHistory: TracerPathHistory;
  readonly session: ExploreTracerSession;
  readonly tool: ExplorePointReleaseTool;
  readonly orchestration: ExplorePointReleaseOrchestration;
  readonly velocityObservation: InspectableVelocityOperands;
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
 */
export function createExploreLab(sceneSlots: ExploreSceneSlots): ExploreLab {
  const { simulation, velocityObservation } = composeDemoTracersWithObservation(
    IntegrationFrame.StormRelativeLaboratory,
    [],
  );
  const pathHistory = new TracerPathHistory(0);
  const session = new ExploreTracerSession(simulation, pathHistory);
  const tool = new ExplorePointReleaseTool();
  const orchestration = new ExplorePointReleaseOrchestration(
    session,
    tool,
    sceneSlots,
  );
  return {
    kind: "explore",
    simulation,
    pathHistory,
    session,
    tool,
    orchestration,
    velocityObservation,
  };
}
