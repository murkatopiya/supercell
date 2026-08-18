import {
  GUIDED_EXPERIMENTS,
  type GuidedExperimentId,
} from "../../guided/GuidedExperiment.js";

export interface GuidedExperimentSelectorProps {
  value: GuidedExperimentId;
  onChange: (id: GuidedExperimentId) => void;
}

function isGuidedExperimentId(value: string): value is GuidedExperimentId {
  return GUIDED_EXPERIMENTS.some((entry) => entry.id === value);
}

/**
 * Runtime wiring surface for the selected Guided experiment.
 * Titles come from GUIDED_EXPERIMENTS. Teaching copy is GuidedExperimentPanel.
 */
export function GuidedExperimentSelector({
  value,
  onChange,
}: GuidedExperimentSelectorProps) {
  return (
    <label className="guided-experiment-selector">
      Experiment
      <select
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (isGuidedExperimentId(next)) {
            onChange(next);
          }
        }}
      >
        {GUIDED_EXPERIMENTS.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.title}
          </option>
        ))}
      </select>
    </label>
  );
}
