import { PUBLIC_VERSION } from "./publicVersion.js";

export const RESOURCE_ITEMS = [
  { id: "user-guide", label: "User Guide" },
  { id: "how-it-works", label: "How It Works" },
  { id: "glossary", label: "Glossary" },
  { id: "whats-new", label: `What's New · ${PUBLIC_VERSION}` },
] as const;
export type ResourceId = typeof RESOURCE_ITEMS[number]["id"];
export type OpenResource = (resource: ResourceId, trigger: HTMLButtonElement) => void;
