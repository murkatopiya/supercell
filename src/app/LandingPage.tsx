import {
  LANDING_CAPABILITIES,
  LANDING_CTA_LABEL,
  LANDING_DESKTOP_RECOMMENDED,
  LANDING_DISCLAIMER,
  LANDING_ENVIRONMENTS_ANALYSIS_NOTE,
  LANDING_ENVIRONMENTS_LEAD,
  LANDING_LEDE,
  LANDING_OBSERVED_ENVIRONMENT_LINKS,
  LANDING_WHATS_NEXT_PRINCIPLE_LEAD,
  LANDING_README_URL,
  LANDING_SCIENCE_URL,
  LANDING_WHATS_NEXT_TITLE,
  LANDING_WHATS_NEXT_STAGES,
} from "./landingContent.js";
import "./landing.css";
import stormPhotoUrl from "./assets/north-texas-supercell.webp";

import { GlobalHeader } from "./GlobalHeader.js";
import { GlobalFooter } from "./GlobalFooter.js";
import type { OpenResource } from "./shellResources.js";

function GitHubIcon() {
  return <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: "text-bottom", marginInlineStart: ".3em" }}><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.64 0c2.15-1.45 3.1-1.15 3.1-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.15 5.55.4.35.76 1.04.76 2.1v3.1c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" /></svg>;
}

export interface LandingPageProps {
  onEnterLearn: () => void;
  onEnterExplore: () => void;
  onOpenUserGuide: (trigger: HTMLButtonElement) => void;
  onOpenHowItWorks: (trigger: HTMLButtonElement) => void;
  onOpenGlossary: (trigger: HTMLButtonElement) => void;
  onOpenWhatsNew?: (trigger: HTMLButtonElement) => void;
  userGuideOpen?: boolean;
  howItWorksOpen?: boolean;
  glossaryOpen?: boolean;
  whatsNewOpen?: boolean;
}

/**
 * First-run public entry. Does not construct a laboratory.
 * docs/ui/07-app-navigation-and-mode-entry.md
 * Visual treatment: docs/ui/14-visual-design-foundation.md
 */
export function LandingPage({
  onEnterLearn,
  onEnterExplore,
  onOpenUserGuide,
  onOpenHowItWorks,
  onOpenGlossary,
  onOpenWhatsNew,
  userGuideOpen = false,
  howItWorksOpen = false,
  glossaryOpen = false,
  whatsNewOpen = false,
}: LandingPageProps) {
  const openResource: OpenResource = (resource, trigger) => {
    const actions = { "user-guide": onOpenUserGuide, "how-it-works": onOpenHowItWorks, glossary: onOpenGlossary, "whats-new": onOpenWhatsNew };
    actions[resource]?.(trigger);
  };
  return (
    <>
    <GlobalHeader section="home" onHome={() => {}} onExplore={onEnterExplore} onLearn={onEnterLearn} onOpenResource={openResource} />
    <main className="app app--landing">
      <div className="landing__dark">
        <section className="landing__hero" aria-labelledby="landing-title">
          <div className="landing__intro">
            <p className="landing__eyebrow">An interactive computational environment</p>
            <h1 id="landing-title">Explore airflow. Examine the motion.</h1>
            <p className="landing__lede">{LANDING_LEDE}</p>
            <p className="landing__lede">Release virtual tracers, inspect velocity vectors, and discover how different flow components shape calculated motion.</p>
            <p className="landing__audience">The laboratory combines selected observed weather-balloon wind profiles with prescribed storm airflow. It is an exploratory kinematic model, not a reconstruction, forecast, or full atmospheric simulation.</p>
          </div>
          <figure className="landing__storm-photo">
            <img src={stormPhotoUrl} width={1200} height={800} fetchPriority="high"
              alt="A layered supercell thunderstorm with lightning illuminating its upper clouds near Granbury, North Texas." />
            <figcaption>
              Real storm photograph · Granbury, Texas, 18 May 2025. Not a model visualization.<br />
              Photo: <a href="https://commons.wikimedia.org/wiki/File:Mesocyclone_and_Associated_Updraft_in_North_Texas.jpg" target="_blank" rel="noopener noreferrer">Rollingskyphoto / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. Resized, WebP; display crop.
            </figcaption>
          </figure>
        </section>
        <section className="landing__pathways" aria-labelledby="landing-pathways-title">
          <h2 id="landing-pathways-title" className="landing__eyebrow">Two ways to explore</h2>
          <div className="landing__pathway-grid">
            <button type="button" className="landing-pathway landing-pathway--explore" aria-labelledby="landing-explore-title landing-explore-subtitle" aria-describedby="landing-explore-description" onClick={onEnterExplore}>
              <span className="landing-pathway__body"><span id="landing-explore-title" className="landing-pathway__title">{LANDING_CTA_LABEL}</span><span id="landing-explore-subtitle" className="landing-pathway__subtitle">Independent laboratory investigation</span><span id="landing-explore-description" className="landing-pathway__description">Investigate available environments, release tracers, inspect numerical velocity measurements, and explore prescribed airflow independently.</span></span>
              <span className="landing-pathway__action" aria-hidden="true">Open laboratory →</span>
            </button>
            <button type="button" className="landing-pathway" aria-labelledby="landing-learn-title landing-learn-subtitle" aria-describedby="landing-learn-description" onClick={onEnterLearn}>
              <span className="landing-pathway__body"><span id="landing-learn-title" className="landing-pathway__title">Learn</span><span id="landing-learn-subtitle" className="landing-pathway__subtitle">Guided discovery</span><span id="landing-learn-description" className="landing-pathway__description">Start with four guided lessons introducing 3D orientation, passive tracers, velocity vectors, and spatial comparison.</span></span>
              <span className="landing-pathway__action" aria-hidden="true">Start learning →</span>
            </button>
          </div>
        </section>
      </div>
      <div className="landing__content">
        <section className="landing__capabilities" aria-labelledby="landing-capabilities-title">
          <p className="landing__eyebrow">Inside the laboratory</p>
          <h2 id="landing-capabilities-title" className="landing__section-title">What can you investigate?</h2>
          <div className="landing__capability-grid">
            {LANDING_CAPABILITIES.map((capability, index) => (
              <article key={capability.title} className="landing-capability">
                <span className="landing-capability__number" aria-hidden="true">0{index + 1}</span>
                <h3 className="landing-capability__title">{capability.title}</h3>
                <p className="landing-capability__copy">{capability.copy}</p>
              </article>
            ))}
          </div>
        </section>

      <nav className="landing__mode-actions" aria-label="Start investigating">
        <button type="button" className="ui-button ui-button--primary" onClick={onEnterExplore}>Open Explore</button>
        <button type="button" className="ui-button" onClick={onEnterLearn}>Start with Learn</button>
      </nav>
      <section className="landing__exercise" aria-labelledby="landing-exercise-title">
        <h2 id="landing-exercise-title" className="landing__section-title">Try a first comparison</h2>
        <p>Open <strong>Learn → Compare the Flow</strong>.</p>
        <p>Move probe B and compare its velocity with fixed probe A. Height and model time stay fixed, so the differences describe spatial variation in the prescribed field.</p>
        <a href={`${LANDING_README_URL}#first-exercise-compare-motion-at-fixed-height-and-time`} target="_blank" rel="noopener noreferrer">Repeatable exercise in README →<GitHubIcon /></a>
      </section>
      <section className="landing__advanced" aria-labelledby="landing-advanced-title">
        <p className="landing__eyebrow">Advanced analysis</p>
        <h2 id="landing-advanced-title" className="landing__section-title">How can airflow contribute to rotation?</h2>
        <p>Airflow can carry rotation around a horizontal axis. When an updraft changes across space, it can tilt some of that horizontal rotation toward the vertical.</p>
        <p>Explore this mechanism through a simplified diagnostic called T1. Inspect the relevant vectors, their alignment, and how the calculated tilting contribution changes when their relative orientation changes.</p>
        <p>T1 describes one contribution to the local rate of change of vertical vorticity in the prescribed model. It does not calculate the complete development of a rotating storm.</p>
        <p className="landing__note">Analysis T1 is available at supported recorded points in Goshen, Prospect Valley and Dumas. Moore and Demo have no Analysis T1; unavailable does not mean zero. <a href={`${LANDING_README_URL}#comparison-scopes-and-advanced-availability`} target="_blank" rel="noopener noreferrer">Support and interpretation →<GitHubIcon /></a></p>
      </section>
      <section className="landing__whats-next" aria-labelledby="landing-whats-next-title">
        <h2 id="landing-whats-next-title" className="landing__section-title">{LANDING_WHATS_NEXT_TITLE}</h2>
        <p className="landing__whats-next-principle">{LANDING_WHATS_NEXT_PRINCIPLE_LEAD}</p>
        <div className="landing-roadmap">
          {LANDING_WHATS_NEXT_STAGES.map(stage => (
            <article key={stage.id} className={`landing-roadmap__stage landing-roadmap__stage--${stage.kind}`}>
              <p className="landing__eyebrow">{stage.status}</p>
              <h3 className="landing-roadmap__label">{stage.topic}</h3>
              <p className="landing-roadmap__detail">{stage.copy}</p>
              <p className="landing-roadmap__detail">{stage.qualification}</p>
            </article>
          ))}
        </div>
        <p className="landing__note">Research directions are not rigid technical dependencies. Dataset interoperability may develop independently of thermodynamics.</p>
        <p className="landing__note">Importing and analyzing externally generated data is distinct from independently solving atmospheric equations. Planned and long-term capabilities remain unimplemented and require scientific validation.</p>
        <p className="landing__note"><a href={`${LANDING_README_URL}#research-direction`} target="_blank" rel="noopener noreferrer">Fuller research roadmap →<GitHubIcon /></a></p>
      </section>
      <section
        className="ui-panel ui-panel--info landing__disclaimer"
        aria-labelledby="landing-disclaimer-title"
      >
        <h2 id="landing-disclaimer-title" className="landing__section-title">
          Scientific boundary
        </h2>
        <p>{LANDING_DISCLAIMER}</p>
        <p>Observed soundings supply environmental wind profiles, not observed 3D storm fields. Storm-local flow is prescribed. <a href={`${LANDING_README_URL}#what-the-model-actually-represents`} target="_blank" rel="noopener noreferrer">Model and limitations<GitHubIcon /></a> · <a href={LANDING_SCIENCE_URL} target="_blank" rel="noopener noreferrer">Scientific methods and evidence<GitHubIcon /></a></p>
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
        {LANDING_DESKTOP_RECOMMENDED}
      </p>

      <nav className="landing__mode-actions landing__mode-actions--final" aria-label="Choose your next investigation">
        <p>Ready to investigate?</p>
        <button type="button" className="ui-button ui-button--primary" onClick={onEnterExplore}>Open Explore</button>
        <button type="button" className="ui-button" onClick={onEnterLearn}>Start with Learn</button>
      </nav>
      </div>
    </main>
    <GlobalFooter onOpenResource={openResource} revealAttributionOnOpen />
    </>
  );
}
