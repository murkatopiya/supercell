export interface ExploreAuthoringHistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const UNDO_EMPTY_REASON = "Nothing to undo";
export const REDO_EMPTY_REASON = "Nothing to redo";

/**
 * Explore Add-tracer authoring history. Not simulation rewind.
 * docs/ui/13-explore-tracer-authoring-history.md
 */
export function ExploreAuthoringHistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ExploreAuthoringHistoryControlsProps) {
  return (
    <div className="control-band__row">
      <button
        type="button"
      className="ui-button ui-button--subtle tracer-runtime-controls__button"
        aria-label="Undo last tracer release"
        disabled={!canUndo}
        title={canUndo ? "Undo last tracer release" : UNDO_EMPTY_REASON}
        onClick={onUndo}
      >
        Undo
      </button>
      <button
        type="button"
        className="ui-button ui-button--subtle tracer-runtime-controls__button"
        aria-label="Redo tracer release"
        disabled={!canRedo}
        title={canRedo ? "Redo tracer release" : REDO_EMPTY_REASON}
        onClick={onRedo}
      >
        Redo
      </button>
    </div>
  );
}
