/**
 * 3D tracer pedagogy at the composition boundary
 * (docs/architecture/08-story-seeds.md, docs/rendering/14-tracer-path-history.md,
 * docs/architecture/12-downward-ground-impact-pedagogy.md).
 *
 * Not a feature flag. Not ScenarioConfig. Not a physics concern.
 * Both-groups display is not part of this type.
 */
export const TracerPedagogy = {
  DiagnosticProbes: "DiagnosticProbes",
  StoryPathlines: "StoryPathlines",
  DownwardPathline: "DownwardPathline",
} as const;

export type TracerPedagogy =
  (typeof TracerPedagogy)[keyof typeof TracerPedagogy];

/** Default composition API; existing diagnostic tests keep this. */
export const DEFAULT_DEMO_TRACER_PEDAGOGY = TracerPedagogy.DiagnosticProbes;

/** Live App.tsx selects DownwardPathline explicitly. */
export const LIVE_DEMO_TRACER_PEDAGOGY = TracerPedagogy.DownwardPathline;
