import { describe, expect, it } from "vitest";
import {
  isTextEditingShortcutTarget,
  matchExploreAuthoringHistoryShortcut,
} from "./exploreAuthoringHistoryShortcut.js";

function keyEvent(init: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  target?: EventTarget | null;
}): KeyboardEvent {
  return {
    key: init.key,
    ctrlKey: init.ctrlKey === true,
    metaKey: init.metaKey === true,
    shiftKey: init.shiftKey === true,
    target: init.target ?? null,
  } as KeyboardEvent;
}

describe("exploreAuthoringHistoryShortcut", () => {
  it("maps Ctrl/Cmd+Z to undo and Shift+Z / Y to redo", () => {
    expect(
      matchExploreAuthoringHistoryShortcut(keyEvent({ key: "z", ctrlKey: true })),
    ).toBe("undo");
    expect(
      matchExploreAuthoringHistoryShortcut(keyEvent({ key: "z", metaKey: true })),
    ).toBe("undo");
    expect(
      matchExploreAuthoringHistoryShortcut(
        keyEvent({ key: "z", ctrlKey: true, shiftKey: true }),
      ),
    ).toBe("redo");
    expect(
      matchExploreAuthoringHistoryShortcut(keyEvent({ key: "y", ctrlKey: true })),
    ).toBe("redo");
    expect(
      matchExploreAuthoringHistoryShortcut(keyEvent({ key: "a", ctrlKey: true })),
    ).toBeNull();
    expect(matchExploreAuthoringHistoryShortcut(keyEvent({ key: "z" }))).toBeNull();
  });

  it("does not capture shortcuts while a text field is focused", () => {
    const input = {
      tagName: "INPUT",
      isContentEditable: false,
    } as unknown as EventTarget;
    expect(isTextEditingShortcutTarget(input)).toBe(true);
    expect(
      matchExploreAuthoringHistoryShortcut(
        keyEvent({ key: "z", ctrlKey: true, target: input }),
      ),
    ).toBeNull();
    expect(
      isTextEditingShortcutTarget({
        tagName: "DIV",
        isContentEditable: false,
      } as unknown as EventTarget),
    ).toBe(false);
    expect(isTextEditingShortcutTarget(null)).toBe(false);
  });
});
