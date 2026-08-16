import { UpperRadialOutflowField } from "../physics/storm/UpperRadialOutflowField.js";
import type { ScenarioConfig } from "./ScenarioConfig.js";

/**
 * Map scenario storm.upperRadialOutflow → UpperRadialOutflowField.
 * Physical validation is delegated to UpperRadialOutflowField.
 * Does not copy center, sigma, or bounds from other storm blocks.
 */
export function createUpperRadialOutflowField(
  config: ScenarioConfig,
): UpperRadialOutflowField {
  const { upperRadialOutflow } = config.storm;
  return new UpperRadialOutflowField({
    centerX: upperRadialOutflow.centerX,
    centerZ: upperRadialOutflow.centerZ,
    outflowStrainRate: upperRadialOutflow.outflowStrainRate,
    sigma: upperRadialOutflow.sigma,
    baseHeight: upperRadialOutflow.baseHeight,
    topHeight: upperRadialOutflow.topHeight,
  });
}
