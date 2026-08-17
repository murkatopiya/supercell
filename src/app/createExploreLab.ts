import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { Simulation } from "../simulation/Simulation.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { ExplorePointReleaseOrchestration } from "../explore/ExplorePointReleaseOrchestration.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { ExplorePointReleaseTool } from "../explore/ExplorePointReleaseTool.js";
import { ExploreTracerSession } from "../explore/ExploreTracerSession.js";
import { composeDemoTracerFields } from "./composeDemoTracerSimulation.js";
import { IntegrationFrame } from "./IntegrationFrame.js";

export interface ExploreLab {
  readonly kind: "explore";
  readonly simulation: Simulation;
  readonly pathHistory: TracerPathHistory;
  readonly session: ExploreTracerSession;
  readonly tool: ExplorePointReleaseTool;
  readonly orchestration: ExplorePointReleaseOrchestration;
}

/**
 * Empty seven-operand storm-relative laboratory. No Guided seeds.
 * Trails on (history object present). keepInactiveGlyphs is a renderer flag.
 */
export function composeExploreTracerSimulation(
  integrationFrame: IntegrationFrame = IntegrationFrame.StormRelativeLaboratory,
): Simulation {
  const { field } = composeDemoTracerFields(integrationFrame);
  return new Simulation(field, new EulerIntegrator(), [], {
    tracerDomain: ATMOSPHERIC_TRACER_DOMAIN,
  });
}

/**
 * Enter Explore: zero particles, zero history lanes, empty session.
 * Scene slots start at 0 when TracerViewport mounts with this cohort.
 */
export function createExploreLab(sceneSlots: ExploreSceneSlots): ExploreLab {
  const simulation = composeExploreTracerSimulation(
    IntegrationFrame.StormRelativeLaboratory,
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
  };
}
