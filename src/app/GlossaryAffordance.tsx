export interface GlossaryAffordanceProps {
  expanded: boolean;
  onOpen: (trigger: HTMLButtonElement) => void;
}

/**
 * Public laboratory vocabulary. Not a mode, not Environment, not How It Works.
 */
export function GlossaryAffordance({
  expanded,
  onOpen,
}: GlossaryAffordanceProps) {
  return (
    <button
      type="button"
      className="ui-button ui-button--subtle tracer-runtime-controls__button how-it-works-affordance"
      aria-label="Glossary"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={(event) => onOpen(event.currentTarget)}
    >
      Glossary
    </button>
  );
}
