import type { EulerianAirflowSamplesConfig } from "../visualization/EulerianAirflowSamples.js";
import { DEMO_VISUAL_AIRFLOW_POPULATION } from "./demoVisualAirflowFixture.js";

/**
 * Eulerian workbench samples for fair comparison with R0/R1.
 * Same visualization volume, count, and jitter lattice as the
 * advected population. Sampling density is not mass or air density.
 */
export const DEMO_EULERIAN_AIRFLOW_SAMPLES: EulerianAirflowSamplesConfig = {
  count: DEMO_VISUAL_AIRFLOW_POPULATION.count,
  jitterSeed: DEMO_VISUAL_AIRFLOW_POPULATION.jitterSeed,
  volume: DEMO_VISUAL_AIRFLOW_POPULATION.volume,
};
