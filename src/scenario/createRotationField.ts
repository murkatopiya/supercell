import { VerticalEnvelopeRotationField } from "../physics/storm/VerticalEnvelopeRotationField.js";
import type { ScenarioConfig } from "./ScenarioConfig.js";

/**
 * Map scenario storm.rotation → VerticalEnvelopeRotationField.
 * Physical validation is delegated to VerticalEnvelopeRotationField.
 * Does not copy center, sigma, or vertical bounds from other storm blocks.
 */
export function createRotationField(
  config: ScenarioConfig,
): VerticalEnvelopeRotationField {
  const { rotation } = config.storm;
  return new VerticalEnvelopeRotationField({
    centerX: rotation.centerX,
    centerZ: rotation.centerZ,
    angularVelocity: rotation.angularVelocity,
    sigma: rotation.sigma,
    baseHeight: rotation.baseHeight,
    topHeight: rotation.topHeight,
  });
}
