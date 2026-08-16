import { LowerRadialInflowField } from "../physics/storm/LowerRadialInflowField.js";
import type { ScenarioConfig } from "./ScenarioConfig.js";

/**
 * Map scenario storm.lowerRadialInflow → LowerRadialInflowField.
 * Physical validation is delegated to LowerRadialInflowField.
 * Does not copy center, sigma, or bounds from other storm blocks.
 */
export function createLowerRadialInflowField(
  config: ScenarioConfig,
): LowerRadialInflowField {
  const { lowerRadialInflow } = config.storm;
  return new LowerRadialInflowField({
    centerX: lowerRadialInflow.centerX,
    centerZ: lowerRadialInflow.centerZ,
    radialStrainRate: lowerRadialInflow.radialStrainRate,
    sigma: lowerRadialInflow.sigma,
    baseHeight: lowerRadialInflow.baseHeight,
    topHeight: lowerRadialInflow.topHeight,
  });
}
