export interface CoordinateReferenceControlProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
}

/**
 * Scene presentation toggle for the world coordinate-reference layer.
 * Does not own the flag. docs/ui/09-world-coordinate-reference.md
 */
export function CoordinateReferenceControl({
  visible,
  onVisibleChange,
}: CoordinateReferenceControlProps) {
  return (
    <button
      type="button"
      className="tracer-runtime-controls__button"
      aria-pressed={visible}
      aria-label="World coordinate grid"
      onClick={() => onVisibleChange(!visible)}
    >
      Grid
    </button>
  );
}
