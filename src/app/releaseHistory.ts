export interface ProductRelease {
  readonly version: string;
  readonly status: "published" | "prepared";
  readonly date?: string;
  readonly title: string;
  readonly changes: readonly string[];
}

/** Newest first. Dates are omitted until a public release date is confirmed. */
export const RELEASE_HISTORY: readonly ProductRelease[] = [
  {
    version: "V1.1",
    status: "published",
    date: "2026-09-16",
    title: "Interactive storm motion",
    changes: [
      "Explore: change the prescribed storm-motion vector C for each observed wind profile and examine how the storm-relative hodograph and tracer trajectories respond. The wind profiles remain observed data; C is a laboratory choice, not a measured motion of those storms.",
    ],
  },
  {
    version: "V1",
    status: "published",
    title: "Research prototype",
    changes: [
      "Explore observed environmental wind profiles from Goshen, Prospect Valley, Dumas, and Moore in a prescribed storm-relative laboratory.",
      "Release passive tracers, follow their paths, and inspect the flow and available trajectory diagnostics.",
      "Use the hodograph and How It Works to examine the model and its limits.",
    ],
  },
];

export const PUBLISHED_RELEASES = RELEASE_HISTORY.filter(release => release.status === "published");
export const LATEST_PUBLISHED_RELEASE = PUBLISHED_RELEASES[0]!;
