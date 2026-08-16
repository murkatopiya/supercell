/**
 * DEMO deep-storm tracer view fixture.
 *
 * Rendering-only numbers in physical meters. World scale is 1:1
 * (no exaggerated Y, no stretched X/Z). Not ScenarioConfig.
 *
 * docs/rendering/11-deep-storm-tracer-view.md
 */
export const DEEP_STORM_TRACER_VIEW = {
  fovDeg: 50,
  nearM: 10,
  farM: 50000,
  cameraPosition: { x: 12000, y: 6000, z: 12000 },
  target: { x: 0, y: 4000, z: 0 },
  gridSizeM: 10000,
  gridDivisions: 10,
  axisSizeM: 2000,
  sphereRadiusM: 150,
} as const;
