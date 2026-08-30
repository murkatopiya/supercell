import {
  LANDING_CAPABILITIES,
  LANDING_CTA_LABEL,
  LANDING_DESKTOP_RECOMMENDED,
  LANDING_DISCLAIMER,
  LANDING_ENVIRONMENTS_ANALYSIS_NOTE,
  LANDING_ENVIRONMENTS_LEAD,
  LANDING_GUIDED_LATER_NOTE,
  LANDING_LEDE,
  LANDING_OBSERVED_ENVIRONMENT_LINKS,
  LANDING_WHATS_NEXT_DIRECTION,
  LANDING_WHATS_NEXT_LEAD,
  LANDING_WHATS_NEXT_PRINCIPLE_CLOSE,
  LANDING_WHATS_NEXT_PRINCIPLE_LEAD,
  LANDING_WHATS_NEXT_STAGES,
  LANDING_WHATS_NEXT_TITLE,
  LANDING_WHY_EXISTS_CONNECTS,
  LANDING_WHY_EXISTS_LEAD,
  LANDING_WHY_EXISTS_TITLE,
} from "./landingContent.js";
import { PUBLIC_VERSION_BADGE } from "./publicVersion.js";
import logoUrl from "./assets/supercell-explorer-logo.webp";

export interface LandingPageProps {
  onEnterExplore: () => void;
  onOpenHowItWorks: (trigger: HTMLButtonElement) => void;
  onOpenGlossary: (trigger: HTMLButtonElement) => void;
  howItWorksOpen?: boolean;
  glossaryOpen?: boolean;
}

/**
 * First-run public entry. Does not construct a laboratory.
 * docs/ui/07-app-navigation-and-mode-entry.md
 * Visual treatment: docs/ui/14-visual-design-foundation.md
 */
export function LandingPage({
  onEnterExplore,
  onOpenHowItWorks,
  onOpenGlossary,
  howItWorksOpen = false,
  glossaryOpen = false,
}: LandingPageProps) {
  return (
    <main className="app app--landing">
      <div className="landing__hero">
        <div className="landing__intro">
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
            <button
              type="button"
              className="ui-button ui-button--subtle landing__how-it-works"
              aria-label="Glossary"
              aria-haspopup="dialog"
              aria-expanded={glossaryOpen}
              onClick={(event) => onOpenGlossary(event.currentTarget)}
            >
              Glossary
            </button>
          </div>
        </div>
        <img
          className="landing__logo"
          src={logoUrl}
          width={2048}
          height={768}
          alt=""
        />
      </div>

      <div className="landing__purpose-row">
        <section
          className="landing__purpose"
          aria-labelledby="landing-purpose-title"
        >
          <h2 id="landing-purpose-title" className="landing__section-title">
            {LANDING_WHY_EXISTS_TITLE}
          </h2>
          <p className="landing__purpose-copy">{LANDING_WHY_EXISTS_LEAD}</p>
          <p className="landing__purpose-copy">{LANDING_WHY_EXISTS_CONNECTS}</p>
        </section>

        <section
          className="landing__capabilities"
          aria-labelledby="landing-capabilities-title"
        >
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
      </div>

      <section
        className="landing__whats-next"
        aria-labelledby="landing-whats-next-title"
      >
        <h2 id="landing-whats-next-title" className="landing__section-title">
          {LANDING_WHATS_NEXT_TITLE}
        </h2>
        <p className="landing__whats-next-copy">{LANDING_WHATS_NEXT_LEAD}</p>
        <p className="landing__whats-next-copy">{LANDING_WHATS_NEXT_DIRECTION}</p>
        <div className="landing-roadmap">
          {LANDING_WHATS_NEXT_STAGES.flatMap((stage, index) => {
            const card = (
              <article
                key={stage.id}
                className={`ui-panel landing-roadmap__stage landing-roadmap__stage--${stage.kind}`}
              >
                <h3 className="landing-roadmap__label">
                  {stage.status} · {stage.topic}
                </h3>
                {"copy" in stage ? (
                  <p className="landing-roadmap__detail">{stage.copy}</p>
                ) : (
                  <p className="landing-roadmap__detail">
                    {"tokens" in stage
                      ? stage.tokens.map((token) => (
                          <span
                            key={token}
                            className="landing-roadmap__token"
                          >
                            {token}
                          </span>
                        ))
                      : null}
                    {stage.items.map((item, itemIndex) => (
                      <span key={item}>
                        {"tokens" in stage || itemIndex > 0 ? (
                          <span aria-hidden="true"> · </span>
                        ) : null}
                        {item}
                      </span>
                    ))}
                  </p>
                )}
              </article>
            );
            if (index === 0) {
              return [card];
            }
            return [
              <span
                key={`${stage.id}-connector`}
                className="landing-roadmap__connector"
                aria-hidden="true"
              />,
              card,
            ];
          })}
        </div>
        <p className="landing__whats-next-principle">
          {LANDING_WHATS_NEXT_PRINCIPLE_LEAD} {LANDING_WHATS_NEXT_PRINCIPLE_CLOSE}
        </p>
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
      <p className="landing__note landing__note--quiet">
        {LANDING_DESKTOP_RECOMMENDED}
      </p>
    </main>
  );
}
