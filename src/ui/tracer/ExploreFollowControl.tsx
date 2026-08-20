export interface ExploreFollowControlProps {
  followEnabled: boolean;
  canFollow: boolean;
  onFollowEnabledChange: (enabled: boolean) => void;
}

/**
 * Explore-only Follow toggle. Navigation/framing, not selection.
 * docs/architecture/34-selected-tracer-follow-camera-architecture.md
 */
export function ExploreFollowControl({
  followEnabled,
  canFollow,
  onFollowEnabledChange,
}: ExploreFollowControlProps) {
  const pressed = canFollow && followEnabled;
  return (
    <div className="tracer-runtime-controls">
      <div className="tracer-runtime-controls__group tracer-runtime-controls__group--runtime">
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-label="Follow selected tracer"
          aria-pressed={pressed}
          disabled={!canFollow}
          onClick={() => {
            if (!canFollow) {
              return;
            }
            onFollowEnabledChange(!followEnabled);
          }}
        >
          Follow
        </button>
      </div>
    </div>
  );
}
