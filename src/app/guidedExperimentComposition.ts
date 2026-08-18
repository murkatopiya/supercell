/**
 * Internal Guided product → composition mapping.
 * docs/architecture/20-guided-runtime-architecture.md
 *
 * Knows GuidedExperimentId and TracerPedagogy.
 * Does not own catalog copy, seeds, or physics operands.
 */
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import {
  demoKeepInactiveGlyphs,
  demoSeedsForPedagogy,
  demoTrailsEnabled,
} from "./composeDemoTracerSimulation.js";
import { TracerPedagogy } from "./TracerPedagogy.js";
import type { ScenarioTracerSeed } from "../scenario/ScenarioConfig.js";

export function pedagogyForGuidedExperiment(
  id: GuidedExperimentId,
): TracerPedagogy {
  switch (id) {
    case GuidedExperimentId.InflowToUpperOutflow:
      return TracerPedagogy.StoryPathlines;
    case GuidedExperimentId.DowndraftPathToGround:
      return TracerPedagogy.DownwardPathline;
    case GuidedExperimentId.NearGroundOutflow:
      return TracerPedagogy.NearGroundOutflowPathline;
  }
}

/**
 * Experience-owned composition policy for one public experiment.
 * Seeds remain ScenarioConfig-owned arrays via demoSeedsForPedagogy.
 * Does not compose model operands.
 */
export interface GuidedExperimentCompositionPolicy {
  readonly pedagogy: TracerPedagogy;
  readonly seeds: readonly ScenarioTracerSeed[];
  readonly trailsEnabled: boolean;
  readonly keepInactiveGlyphs: boolean;
}

export function guidedExperimentCompositionFor(
  id: GuidedExperimentId,
): GuidedExperimentCompositionPolicy {
  const pedagogy = pedagogyForGuidedExperiment(id);
  return {
    pedagogy,
    seeds: demoSeedsForPedagogy(pedagogy),
    trailsEnabled: demoTrailsEnabled(pedagogy),
    keepInactiveGlyphs: demoKeepInactiveGlyphs(pedagogy),
  };
}
