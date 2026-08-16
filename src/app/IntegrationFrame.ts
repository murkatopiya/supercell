/**
 * 3D tracer integration frame at the composition boundary
 * (docs/architecture/03-wind-tunnel-storm-relative-3d-semantics.md).
 *
 * Not a feature flag. Not ScenarioConfig. Not a storm-field concern.
 * Translating-storm mode is not part of this type.
 */
export const IntegrationFrame = {
  GroundRelativeWindTunnel: "GroundRelativeWindTunnel",
  StormRelativeLaboratory: "StormRelativeLaboratory",
} as const;

export type IntegrationFrame =
  (typeof IntegrationFrame)[keyof typeof IntegrationFrame];

export const DEFAULT_DEMO_INTEGRATION_FRAME =
  IntegrationFrame.GroundRelativeWindTunnel;
