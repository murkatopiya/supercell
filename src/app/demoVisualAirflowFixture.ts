import type { VisualAirflowPopulationConfig } from "../visualization/VisualAirflowPopulation.js";

/**
 * First Explore perceptual-airflow fixture.
 *
 * Visualization policy, not physics and not ScenarioConfig.
 * Count / volume / maxAge / jitterSeed do not mean density, mass,
 * moisture, or cloud.
 *
 * Volume reasoning (DEMO storm scales, not a lock-in):
 * - shared chimney σ = 4000 m at (0, 0); 1.5σ ≈ 6000 m west/north
 * - offset downdraft at x = 5000 m, σ = 2000 m → east to 8000 m
 * - NG at z = 4000 m, σ = 1500 m, plus inflow seeds at z = 6000 m
 *   → south to 7000 m
 * - vertical: ground to upper-outflow top (9000 m)
 * - grid pad is 10 km; this box is the laboratory column, not the
 *   whole 12 km environmental profile
 *
 * count = 256: conservative hundreds, ~2 km mean spacing.
 * maxAge = 80 s: enough local motion without long env-only drift.
 */
export const DEMO_VISUAL_AIRFLOW_POPULATION: VisualAirflowPopulationConfig = {
  count: 256,
  maxAge: 80,
  jitterSeed: 1,
  volume: {
    min: { x: -6000, y: 0, z: -6000 },
    max: { x: 8000, y: 9000, z: 7000 },
  },
};
