import type { GuidedExperimentDefinition } from "../../guided/GuidedExperiment.js";

export interface GuidedExperimentPanelProps {
  experiment: GuidedExperimentDefinition;
}

/**
 * Shared Guided shell honesty. docs/architecture/20-guided-runtime-architecture.md §4.3
 * Common to Guided; not per-catalog-entry copy.
 */
export const GUIDED_LABORATORY_HONESTY =
  "This is a prescribed storm-relative laboratory, not a real supercell simulation.";

/**
 * Presentational Guided teaching surface.
 * Catalog definition in; exact catalog strings out. No runtime state.
 */
export function GuidedExperimentPanel({
  experiment,
}: GuidedExperimentPanelProps) {
  return (
    <section className="guided-experiment-panel" aria-label="Guided experiment">
      <h3 className="guided-experiment-panel__title">{experiment.title}</h3>
      <p className="guided-experiment-panel__honesty">
        {GUIDED_LABORATORY_HONESTY}
      </p>
      <dl className="guided-experiment-panel__blocks">
        <TeachingBlock label="Observe" copy={experiment.observe} />
        <TeachingBlock label="Demonstrates" copy={experiment.demonstrates} />
        <TeachingBlock label="Does not mean" copy={experiment.doesNotMean} />
      </dl>
    </section>
  );
}

function TeachingBlock({ label, copy }: { label: string; copy: string }) {
  return (
    <div className="guided-experiment-panel__block">
      <dt className="guided-experiment-panel__label">{label}</dt>
      <dd className="guided-experiment-panel__copy">{copy}</dd>
    </div>
  );
}
