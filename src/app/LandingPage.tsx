import {
  LANDING_CAPABILITIES,
  LANDING_CTA_LABEL,
  LANDING_DISCLAIMER,
  LANDING_ENVIRONMENTS_ANALYSIS_NOTE,
  LANDING_ENVIRONMENTS_LEAD,
  LANDING_GUIDED_LATER_NOTE,
  LANDING_LEDE,
  LANDING_OBSERVED_ENVIRONMENT_LINKS,
} from "./landingContent.js";
import { PUBLIC_VERSION_BADGE } from "./publicVersion.js";

export interface LandingPageProps {
  onEnterExplore: () => void;
  onOpenHowItWorks: (trigger: HTMLButtonElement) => void;
  howItWorksOpen?: boolean;
}

/**
 * First-run public entry. Does not construct a laboratory.
 * docs/ui/07-app-navigation-and-mode-entry.md
 * Visual treatment: docs/ui/14-visual-design-foundation.md
 */
export function LandingPage({
  onEnterExplore,
  onOpenHowItWorks,
  howItWorksOpen = false,
}: LandingPageProps) {
  return (
    <main className="app app--landing">
      <header className="landing__header">
        <p className="landing__badge">{PUBLIC_VERSION_BADGE}</p>
        <h1 className="app__title ui-type-app-title">Supercell Explorer</h1>
        <p className="landing__lede">{LANDING_LEDE}</p>
      </header>

      <div className="landing__actions">
        <button
          type="button"
          className="ui-button ui-button--primary landing__cta"
          onClick={onEnterExplore}
        >
          {LANDING_CTA_LABEL}
        </button>
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
      </div>

      <section className="landing__capabilities" aria-labelledby="landing-capabilities-title">
        <h2 id="landing-capabilities-title" className="landing__section-title">
          What you can do
        </h2>
        <div className="landing__capability-grid">
          {LANDING_CAPABILITIES.map((capability) => (
            <article
              key={capability.title}
              className="ui-panel landing-capability"
            >
              <h3 className="landing-capability__title">{capability.title}</h3>
              <p className="landing-capability__copy">{capability.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="ui-panel ui-panel--info landing__disclaimer"
        aria-labelledby="landing-disclaimer-title"
      >
        <h2 id="landing-disclaimer-title" className="landing__section-title">
          Scientific boundary
        </h2>
        <p>{LANDING_DISCLAIMER}</p>
      </section>

      <p className="landing__note">
        {LANDING_ENVIRONMENTS_LEAD}{" "}
        {LANDING_OBSERVED_ENVIRONMENT_LINKS.map((environment, index) => {
          const last = index === LANDING_OBSERVED_ENVIRONMENT_LINKS.length - 1;
          const separator =
            index === 0 ? null : last ? ", and " : ", ";
          return (
            <span key={environment.identity}>
              {separator}
              <a
                className="landing-environment-link"
                href={environment.eventContextUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={environment.accessibleName}
              >
                {environment.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            </span>
          );
        })}
        . {LANDING_ENVIRONMENTS_ANALYSIS_NOTE}
      </p>
      <p className="landing__note landing__note--quiet">
        {LANDING_GUIDED_LATER_NOTE}
      </p>
    </main>
  );
}
