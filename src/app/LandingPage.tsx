export const LANDING_GUIDED_COPY =
  "Follow a prepared supercell scenario and see how the storm's airflow, rotation, and tracer motion are connected.";

export const LANDING_EXPLORE_COPY =
  "Choose an environment, release tracers yourself, and compare how atmospheric setups change their trajectories.";

export interface LandingPageProps {
  onEnterGuided: () => void;
  onEnterExplore: () => void;
  onOpenHowItWorks: (trigger: HTMLButtonElement) => void;
  howItWorksOpen?: boolean;
}

/**
 * First-run mode choice. Does not construct a laboratory.
 * docs/ui/07-app-navigation-and-mode-entry.md
 * Visual treatment: docs/ui/14-visual-design-foundation.md
 */
export function LandingPage({
  onEnterGuided,
  onEnterExplore,
  onOpenHowItWorks,
  howItWorksOpen = false,
}: LandingPageProps) {
  return (
    <main className="app app--landing">
      <header className="landing__header">
        <h1 className="app__title ui-type-app-title">Supercell Explorer</h1>
        <p className="landing__lede">
          A storm-relative laboratory for watching prescribed supercell
          airflow with tracers and a ground-relative hodograph.
        </p>
      </header>
      <section className="landing__modes" aria-label="Choose a mode">
        <button
          type="button"
          className="ui-card landing-mode-card"
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
          className="ui-card landing-mode-card"
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
        className="ui-button ui-button--subtle landing__how-it-works"
        aria-label="How It Works"
        aria-haspopup="dialog"
        aria-expanded={howItWorksOpen}
        onClick={(event) => onOpenHowItWorks(event.currentTarget)}
      >
        How It Works
      </button>
    </main>
  );
}
