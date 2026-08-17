import { NearGroundRadialOutflowField } from "../physics/storm/NearGroundRadialOutflowField.js";
import type { ScenarioConfig } from "./ScenarioConfig.js";

/**
 * Map scenario storm.nearGroundOutflow → NearGroundRadialOutflowField.
 * Physical validation is delegated to NearGroundRadialOutflowField.
 * Does not copy center, sigma, strength, or bounds from other storm blocks.
 */
export function createNearGroundRadialOutflowField(
  config: ScenarioConfig,
): NearGroundRadialOutflowField {
  const { nearGroundOutflow } = config.storm;
  return new NearGroundRadialOutflowField({
    centerX: nearGroundOutflow.centerX,
    centerZ: nearGroundOutflow.centerZ,
    outflowStrainRate: nearGroundOutflow.outflowStrainRate,
    sigma: nearGroundOutflow.sigma,
    baseHeight: nearGroundOutflow.baseHeight,
    topHeight: nearGroundOutflow.topHeight,
  });
}
