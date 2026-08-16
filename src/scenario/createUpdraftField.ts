import { VerticalEnvelopeUpdraftField } from "../physics/storm/VerticalEnvelopeUpdraftField.js";
import type { ScenarioConfig } from "./ScenarioConfig.js";

/**
 * Map scenario storm.updraft → VerticalEnvelopeUpdraftField.
 * Physical validation is delegated to VerticalEnvelopeUpdraftField.
 */
export function createUpdraftField(
  config: ScenarioConfig,
): VerticalEnvelopeUpdraftField {
  const { updraft } = config.storm;
  return new VerticalEnvelopeUpdraftField({
    centerX: updraft.centerX,
    centerZ: updraft.centerZ,
    peakVerticalVelocity: updraft.peakVerticalVelocity,
    sigma: updraft.sigma,
    baseHeight: updraft.baseHeight,
    topHeight: updraft.topHeight,
  });
}
