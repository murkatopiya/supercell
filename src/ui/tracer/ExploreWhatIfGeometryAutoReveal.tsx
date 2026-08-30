import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { TrajectoryTiltingGlyphModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import type { TrajectoryTiltingWhatIfModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import {
  scrollObservationChildIntoView,
  shouldAutoRevealWhatIfGeometry,
} from "./whatIfGeometryAutoRevealV1.js";

export interface WhatIfGeometryAutoRevealApi {
  readonly columnRef: RefObject<HTMLDivElement | null>;
  readonly whatIfSectionRef: RefObject<HTMLElement | null>;
  readonly expandRequestNonce: number;
  readonly onExpandedForReveal: () => void;
}

export interface ExploreWhatIfGeometryAutoRevealProps {
  glyphModel: TrajectoryTiltingGlyphModel | null | undefined;
  whatIfModel: TrajectoryTiltingWhatIfModel | null | undefined;
  children: (api: WhatIfGeometryAutoRevealApi) => ReactNode;
}

/**
 * Once-per-Explore-mount onboarding: first SUPPORTED glyph + AVAILABLE
 * What-if issues a single expand/scroll request. Collapse state stays
 * owned by CollapsibleObservationSection.
 */
export function ExploreWhatIfGeometryAutoReveal({
  glyphModel,
  whatIfModel,
  children,
}: ExploreWhatIfGeometryAutoRevealProps) {
  const columnRef = useRef<HTMLDivElement | null>(null);
  const whatIfSectionRef = useRef<HTMLElement | null>(null);
  const hasAutoRevealedWhatIfRef = useRef(false);
  const [expandRequestNonce, setExpandRequestNonce] = useState(0);

  useLayoutEffect(() => {
    if (hasAutoRevealedWhatIfRef.current) {
      return;
    }
    if (!shouldAutoRevealWhatIfGeometry(glyphModel, whatIfModel)) {
      return;
    }
    hasAutoRevealedWhatIfRef.current = true;
    setExpandRequestNonce((nonce) => nonce + 1);
  }, [glyphModel, whatIfModel]);

  const onExpandedForReveal = useCallback(() => {
    const container = columnRef.current;
    const target = whatIfSectionRef.current;
    if (container !== null && target !== null) {
      scrollObservationChildIntoView(container, target);
    }
    // Retract the one-shot request so a later What-if remount
    // (cleared sample / explorer off) does not treat nonce 1 as a
    // new onboarding reveal.
    setExpandRequestNonce(0);
  }, []);

  return children({
    columnRef,
    whatIfSectionRef,
    expandRequestNonce,
    onExpandedForReveal,
  });
}
