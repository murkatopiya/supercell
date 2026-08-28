export interface HowItWorksAffordanceProps {
  expanded: boolean;
  onOpen: (trigger: HTMLButtonElement) => void;
}

/**
 * Global laboratory help. Not a mode, not Environment, not a scene tool.
 * docs/ui/12-how-it-works-and-onboarding.md
 */
export function HowItWorksAffordance({
  expanded,
  onOpen,
}: HowItWorksAffordanceProps) {
  return (
    <button
      type="button"
      className="ui-button ui-button--subtle tracer-runtime-controls__button how-it-works-affordance"
      aria-label="How It Works"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={(event) => onOpen(event.currentTarget)}
    >
      How It Works
    </button>
  );
}
