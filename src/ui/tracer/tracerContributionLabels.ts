/**
 * UI-owned English labels for current DEMO contribution tokens.
 * Not physics-class names and not a localization framework.
 * docs/architecture/19-shared-tracer-inspector.md
 */
const CONTRIBUTION_LABELS: Readonly<Record<string, string>> = {
  environmentAdvection: "Environmental advection",
  updraft: "Updraft",
  rotation: "Rotation",
  lowerInflow: "Lower inflow",
  upperOutflow: "Upper outflow",
  downdraft: "Downdraft",
  nearGroundOutflow: "Near-ground outflow",
};

/**
 * Known token → human label. Unknown future tokens fall back to the key.
 */
export function labelForContribution(key: string): string {
  return CONTRIBUTION_LABELS[key] ?? key;
}
