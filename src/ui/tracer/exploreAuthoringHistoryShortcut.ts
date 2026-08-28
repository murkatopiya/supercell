/**
 * Browser/native text editing owns Undo/Redo while focus is in a field.
 * docs/ui/13-explore-tracer-authoring-history.md
 */
export function isTextEditingShortcutTarget(
  target: EventTarget | null,
): boolean {
  if (target === null || typeof target !== "object") {
    return false;
  }
  const el = target as {
    tagName?: string;
    isContentEditable?: boolean;
  };
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  return el.isContentEditable === true;
}

export type ExploreAuthoringHistoryShortcut = "undo" | "redo";

/**
 * Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo.
 * Returns null when the event is not ours or a text field owns it.
 */
export function matchExploreAuthoringHistoryShortcut(
  event: KeyboardEvent,
): ExploreAuthoringHistoryShortcut | null {
  if (!(event.ctrlKey || event.metaKey)) {
    return null;
  }
  if (isTextEditingShortcutTarget(event.target)) {
    return null;
  }
  const key = event.key;
  if (key === "z" || key === "Z") {
    return event.shiftKey ? "redo" : "undo";
  }
  if ((key === "y" || key === "Y") && !event.shiftKey) {
    return "redo";
  }
  return null;
}
