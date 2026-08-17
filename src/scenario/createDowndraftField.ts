import { VerticalEnvelopeDowndraftField } from "../physics/storm/VerticalEnvelopeDowndraftField.js";
import type { ScenarioConfig } from "./ScenarioConfig.js";

/**
 * Map scenario storm.downdraft → VerticalEnvelopeDowndraftField.
 * Physical validation is delegated to VerticalEnvelopeDowndraftField.
 * Does not copy center, sigma, or vertical bounds from other storm blocks.
 */
export function createDowndraftField(
  config: ScenarioConfig,
): VerticalEnvelopeDowndraftField {
  const { downdraft } = config.storm;
  return new VerticalEnvelopeDowndraftField({
    centerX: downdraft.centerX,
    centerZ: downdraft.centerZ,
    peakDownwardVelocity: downdraft.peakDownwardVelocity,
    sigma: downdraft.sigma,
    baseHeight: downdraft.baseHeight,
    topHeight: downdraft.topHeight,
  });
}
