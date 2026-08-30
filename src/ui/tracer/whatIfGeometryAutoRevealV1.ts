import type { TrajectoryTiltingGlyphModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import type { TrajectoryTiltingWhatIfModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";

/**
 * First-glyph What-if onboarding is allowed only when the historical
 * Analysis explanation actually supports a mechanism glyph and What-if
 * geometry is drawable. Not environment-name, column, or T1 heuristics.
 */
export function shouldAutoRevealWhatIfGeometry(
  glyphModel: TrajectoryTiltingGlyphModel | null | undefined,
  whatIfModel: TrajectoryTiltingWhatIfModel | null | undefined,
): boolean {
  return glyphModel?.kind === "SUPPORTED" && whatIfModel?.kind === "AVAILABLE";
}

/**
 * Scroll `target` inside `container` with block:nearest semantics.
 * Never calls Element.scrollIntoView — that can move window/document
 * when Explore observation overflow is visible (narrow viewport).
 */
export function scrollObservationChildIntoView(
  container: HTMLElement,
  target: HTMLElement,
): void {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  let delta = 0;
  if (targetRect.height > containerRect.height) {
    delta = targetRect.top - containerRect.top;
  } else if (targetRect.top < containerRect.top) {
    delta = targetRect.top - containerRect.top;
  } else if (targetRect.bottom > containerRect.bottom) {
    delta = targetRect.bottom - containerRect.bottom;
  }
  if (delta === 0) {
    return;
  }
  const nextTop = container.scrollTop + delta;
  if (typeof container.scrollTo === "function") {
    container.scrollTo({ top: nextTop, behavior: "smooth" });
    return;
  }
  container.scrollTop = nextTop;
}
