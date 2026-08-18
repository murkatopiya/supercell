/**
 * Guided lab factory. Product id chooses existing composition policy.
 * docs/architecture/20-guided-runtime-architecture.md
 */
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";
import type { InspectableVelocityOperands } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import type { Simulation } from "../simulation/Simulation.js";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import { guidedExperimentCompositionFor } from "./guidedExperimentComposition.js";
import {
  composeDemoTracerLab,
  createDemoPathHistory,
} from "./composeDemoTracerSimulation.js";
import { IntegrationFrame } from "./IntegrationFrame.js";

export const DEFAULT_GUIDED_EXPERIMENT_ID =
  GuidedExperimentId.InflowToUpperOutflow;

export interface GuidedLab {
  readonly kind: "guided";
  readonly experimentId: GuidedExperimentId;
  readonly simulation: Simulation;
  readonly pathHistory: TracerPathHistory | null;
  readonly velocityObservation: InspectableVelocityOperands;
  readonly keepInactiveGlyphs: boolean;
}

export function createGuidedLab(id: GuidedExperimentId): GuidedLab {
  const policy = guidedExperimentCompositionFor(id);
  const { simulation, velocityObservation } = composeDemoTracerLab(
    IntegrationFrame.StormRelativeLaboratory,
    policy.pedagogy,
  );
  return {
    kind: "guided",
    experimentId: id,
    simulation,
    pathHistory: createDemoPathHistory(
      policy.pedagogy,
      simulation.particles,
    ),
    velocityObservation,
    keepInactiveGlyphs: policy.keepInactiveGlyphs,
  };
}

/**
 * In-place Reset of the current experiment. Same Simulation, same
 * tracer identities. Canonical seeds come from the lab's product id.
 */
export function resetGuidedLab(lab: GuidedLab): void {
  const policy = guidedExperimentCompositionFor(lab.experimentId);
  resetTracersFromSeeds(lab.simulation, policy.seeds);
  lab.pathHistory?.clear();
  lab.pathHistory?.captureInitial(lab.simulation.particles);
}

/**
 * Experiment switch. Same id is a no-op (same lab, selection kept).
 * Different id: clear selection and return a fresh lab.
 */
export function switchGuidedExperiment(
  lab: GuidedLab,
  nextId: GuidedExperimentId,
  selection: TracerSelection,
): GuidedLab {
  if (nextId === lab.experimentId) {
    return lab;
  }
  selection.clear();
  return createGuidedLab(nextId);
}
