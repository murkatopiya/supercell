export interface UserGuideAffordanceProps {
  expanded: boolean;
  onOpen: (trigger: HTMLButtonElement) => void;
}

/**
 * Public practical Explore manual. Not a mode, not How It Works, not Glossary.
 * docs/ui/16-user-guide.md
 */
export function UserGuideAffordance({
  expanded,
  onOpen,
}: UserGuideAffordanceProps) {
  return (
    <button
      type="button"
      className="ui-button ui-button--subtle tracer-runtime-controls__button how-it-works-affordance"
      aria-label="User Guide"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={(event) => onOpen(event.currentTarget)}
    >
      User Guide
    </button>
  );
}
