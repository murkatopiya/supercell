export type LaboratoryModeLabel = "Guided" | "Explore";

export interface ModeIdentityProps {
  mode: LaboratoryModeLabel;
  onReturnToLanding: () => void;
}

/**
 * In-mode identity chrome. Supercell returns to landing.
 * docs/ui/07-app-navigation-and-mode-entry.md
 */
export function ModeIdentity({ mode, onReturnToLanding }: ModeIdentityProps) {
  return (
    <nav className="app__identity" aria-label="Application">
      <button
        type="button"
        className="app__identity-home"
        onClick={onReturnToLanding}
      >
        Supercell
      </button>
      <span className="app__identity-sep" aria-hidden="true">
        /
      </span>
      <span className="app__identity-mode">{mode}</span>
    </nav>
  );
}
