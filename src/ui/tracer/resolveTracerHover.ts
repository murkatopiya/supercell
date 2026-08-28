/**
 * Hover is presentation of the click pick pipeline.
 * Glyph wins over path sample — same priority as resolveTracerPointerUp.
 * Does not write product selection.
 * docs/ui/10-tracer-interaction-affordance.md
 */
export function resolveTracerHover(input: {
  hitSlotIndex: number | null;
  hitPathSample?: { slotIndex: number } | null;
}): { slotIndex: number } | null {
  if (input.hitSlotIndex !== null) {
    return { slotIndex: input.hitSlotIndex };
  }
  if (input.hitPathSample !== undefined && input.hitPathSample !== null) {
    return { slotIndex: input.hitPathSample.slotIndex };
  }
  return null;
}

export function canvasCursorForTracerHover(hasHover: boolean): string {
  return hasHover ? "pointer" : "";
}
