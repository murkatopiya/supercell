import { CURRENT_RELEASE_CANDIDATE } from "./releaseHistory.js";

/**
 * Public product framing follows the current release candidate in source.
 * Version is not a scientific-validity claim.
 */

export const PUBLIC_VERSION = CURRENT_RELEASE_CANDIDATE.version;

export const PUBLIC_VERSION_STATUS = "Research prototype";

export const PUBLIC_VERSION_BADGE = `${PUBLIC_VERSION} · ${PUBLIC_VERSION_STATUS}`;
