import { UpdraftField } from "../physics/storm/UpdraftField.js";
import type { ScenarioConfig } from "./ScenarioConfig.js";

/**
 * Map scenario storm.updraft → UpdraftField.
 * Physical validation is delegated to UpdraftField.
 */
export function createUpdraftField(config: ScenarioConfig): UpdraftField {
  const { updraft } = config.storm;
  return new UpdraftField({
    centerX: updraft.centerX,
    centerZ: updraft.centerZ,
    peakVerticalVelocity: updraft.peakVerticalVelocity,
    sigma: updraft.sigma,
  });
}
