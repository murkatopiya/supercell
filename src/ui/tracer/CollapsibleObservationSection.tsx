import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

export interface CollapsibleObservationSectionProps {
  sectionClassName: string;
  ariaLabel: string;
  title: string;
  titleClassName: string;
  bodyClassName: string;
  children: ReactNode;
  /**
   * One-shot expand request. Parent may increment this to open the
   * section once; subsequent user collapse is not overridden.
   * Not a second open/closed source of truth.
   */
  expandRequestNonce?: number;
  sectionRef?: RefObject<HTMLElement | null>;
  onExpandedForReveal?: () => void;
}

/**
 * Presentation-only disclosure for Explore observation panels.
 * Default OPEN. Collapse hides the body; children stay mounted.
 * Does not own diagnostic, selection, Analysis, or simulation state.
 */
export function CollapsibleObservationSection({
  sectionClassName,
  ariaLabel,
  title,
  titleClassName,
  bodyClassName,
  children,
  expandRequestNonce,
  sectionRef,
  onExpandedForReveal,
}: CollapsibleObservationSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const bodyId = useId();
  const consumedExpandRequestNonceRef = useRef(0);

  useLayoutEffect(() => {
    if (expandRequestNonce === undefined || expandRequestNonce < 1) {
      return;
    }
    if (consumedExpandRequestNonceRef.current === expandRequestNonce) {
      return;
    }
    if (!expanded) {
      setExpanded(true);
      return;
    }
    consumedExpandRequestNonceRef.current = expandRequestNonce;
    onExpandedForReveal?.();
  }, [expandRequestNonce, expanded, onExpandedForReveal]);

  return (
    <section
      className={sectionClassName}
      aria-label={ariaLabel}
      ref={sectionRef}
    >
      <h3 className={titleClassName}>
        <button
          type="button"
          className="observation-section__toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((open) => !open);
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <span className="observation-section__chevron" aria-hidden="true" />
          {title}
        </button>
      </h3>
      <div id={bodyId} className={bodyClassName} hidden={!expanded}>
        {children}
      </div>
    </section>
  );
}
