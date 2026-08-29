import { useId, useState, type ReactNode } from "react";

export interface CollapsibleObservationSectionProps {
  sectionClassName: string;
  ariaLabel: string;
  title: string;
  titleClassName: string;
  bodyClassName: string;
  children: ReactNode;
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
}: CollapsibleObservationSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const bodyId = useId();

  return (
    <section className={sectionClassName} aria-label={ariaLabel}>
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
