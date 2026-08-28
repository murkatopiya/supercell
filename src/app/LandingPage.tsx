export const LANDING_GUIDED_COPY =
  "Follow a prepared supercell scenario and see how the storm's airflow, rotation, and tracer motion are connected.";

export const LANDING_EXPLORE_COPY =
  "Choose an environment, release tracers yourself, and compare how atmospheric setups change their trajectories.";

export const HOW_IT_WORKS_UNAVAILABLE_REASON =
  "How It Works opens in a later slice.";

export interface LandingPageProps {
  onEnterGuided: () => void;
  onEnterExplore: () => void;
}

/**
 * First-run mode choice. Does not construct a laboratory.
 * docs/ui/07-app-navigation-and-mode-entry.md
 */
export function LandingPage({
  onEnterGuided,
  onEnterExplore,
}: LandingPageProps) {
  return (
    <main className="app app--landing">
      <header className="landing__header">
        <h1 className="app__title">Supercell Explorer</h1>
        <p className="landing__lede">
          A storm-relative laboratory for watching prescribed supercell
          airflow with tracers and a ground-relative hodograph.
        </p>
      </header>
      <section className="landing__modes" aria-label="Choose a mode">
        <button
          type="button"
          className="landing-mode-card"
          aria-labelledby="landing-guided-title"
          aria-describedby="landing-guided-copy"
          onClick={onEnterGuided}
        >
          <span id="landing-guided-title" className="landing-mode-card__title">
            Guided
          </span>
          <span id="landing-guided-copy" className="landing-mode-card__copy">
            {LANDING_GUIDED_COPY}
          </span>
        </button>
        <button
          type="button"
          className="landing-mode-card"
          aria-labelledby="landing-explore-title"
          aria-describedby="landing-explore-copy"
          onClick={onEnterExplore}
        >
          <span id="landing-explore-title" className="landing-mode-card__title">
            Explore
          </span>
          <span id="landing-explore-copy" className="landing-mode-card__copy">
            {LANDING_EXPLORE_COPY}
          </span>
        </button>
      </section>
      <button
        type="button"
        className="tracer-runtime-controls__button landing__how-it-works"
        disabled
        title={HOW_IT_WORKS_UNAVAILABLE_REASON}
        aria-label="How It Works"
      >
        How It Works
      </button>
    </main>
  );
}
