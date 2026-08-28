import { describe, expect, it } from "vitest";
import { TracerSelection } from "../../interaction/TracerSelection.js";
import {
  canvasCursorForTracerHover,
  resolveTracerHover,
} from "./resolveTracerHover.js";
import hoverSrc from "./resolveTracerHover.ts?raw";
import pointerUpSrc from "./resolveTracerPointerUp.ts?raw";

describe("resolveTracerHover", () => {
  it("maps a glyph hit to that tracer slot", () => {
    expect(
      resolveTracerHover({
        hitSlotIndex: 2,
        hitPathSample: { slotIndex: 0 },
      }),
    ).toEqual({ slotIndex: 2 });
  });

  it("maps a tail/path hit to the same tracer slot when no glyph wins", () => {
    expect(
      resolveTracerHover({
        hitSlotIndex: null,
        hitPathSample: { slotIndex: 1 },
      }),
    ).toEqual({ slotIndex: 1 });
  });

  it("clears hover when neither glyph nor tail hits", () => {
    expect(
      resolveTracerHover({
        hitSlotIndex: null,
        hitPathSample: null,
      }),
    ).toBeNull();
  });

  it("does not write TracerSelection", () => {
    const selection = new TracerSelection();
    resolveTracerHover({ hitSlotIndex: 0, hitPathSample: null });
    expect(selection.selectedId).toBeNull();
    expect(hoverSrc).not.toMatch(/TracerSelection/);
    expect(hoverSrc).not.toMatch(/selectedId/);
    expect(pointerUpSrc).toMatch(/hitSlotIndex !== null/);
    expect(hoverSrc).toMatch(/hitSlotIndex !== null/);
  });

  it("uses pointer cursor only while a selectable tracer is under the pointer", () => {
    expect(canvasCursorForTracerHover(true)).toBe("pointer");
    expect(canvasCursorForTracerHover(false)).toBe("");
  });
});
