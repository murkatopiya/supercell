import { LATEST_PUBLISHED_RELEASE } from "./releaseHistory.js";

/**
 * Public product framing follows the latest published release.
 * Version is not a scientific-validity claim.
 */

export const PUBLIC_VERSION = LATEST_PUBLISHED_RELEASE.version;

export const PUBLIC_VERSION_STATUS = "Research prototype";

export const PUBLIC_VERSION_BADGE = `${PUBLIC_VERSION} · ${PUBLIC_VERSION_STATUS}`;
