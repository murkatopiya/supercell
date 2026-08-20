export interface ExploreFollowControlProps {
  followEnabled: boolean;
  canFollow: boolean;
  onFollowEnabledChange: (enabled: boolean) => void;
}

export const FOLLOW_REQUIRES_SELECTION_REASON =
  "Select a tracer to follow.";

/**
 * Explore-only Follow toggle. Navigation/framing, not selection.
 * docs/architecture/34-selected-tracer-follow-camera-architecture.md
 * Disabled reason: docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md F8
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
          aria-label={
            canFollow
              ? "Follow selected tracer"
              : `Follow selected tracer — ${FOLLOW_REQUIRES_SELECTION_REASON}`
          }
          aria-pressed={pressed}
          disabled={!canFollow}
          title={!canFollow ? FOLLOW_REQUIRES_SELECTION_REASON : undefined}
          onClick={() => {
            if (!canFollow) {
              return;
            }
            onFollowEnabledChange(!followEnabled);
          }}
        >
          Follow
        </button>
        {!canFollow ? (
          <span className="control-disabled-reason">
            {FOLLOW_REQUIRES_SELECTION_REASON}
          </span>
        ) : null}
      </div>
    </div>
  );
}
