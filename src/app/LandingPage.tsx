import {
  LANDING_CAPABILITIES,
  LANDING_CTA_LABEL,
  LANDING_DESKTOP_RECOMMENDED,
  LANDING_DISCLAIMER,
  LANDING_ENVIRONMENTS_ANALYSIS_NOTE,
  LANDING_ENVIRONMENTS_LEAD,
  LANDING_LEDE,
  LANDING_OBSERVED_ENVIRONMENT_LINKS,
  LANDING_WHATS_NEXT_PRINCIPLE_CLOSE,
  LANDING_WHATS_NEXT_PRINCIPLE_LEAD,
  LANDING_WHATS_NEXT_STAGES,
  LANDING_WHATS_NEXT_TITLE,
} from "./landingContent.js";
import "./landing.css";
import stormPhotoUrl from "./assets/north-texas-supercell.webp";

import { GlobalHeader } from "./GlobalHeader.js";
import { GlobalFooter } from "./GlobalFooter.js";
import type { OpenResource } from "./shellResources.js";

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
            <h1 id="landing-title">Explore the physics of atmospheric motion.</h1>
            <p className="landing__lede">{LANDING_LEDE}</p>
            <p className="landing__audience">For curious learners, students, and researchers investigating how air moves.</p>
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
            <article className="landing-pathway landing-pathway--explore">
              <div><h3>Independent investigation</h3><p>Investigate available datasets, follow calculated trajectories, and inspect vector quantities within explicit scientific assumptions.</p></div>
              <button type="button" className="ui-button ui-button--primary landing__cta" onClick={onEnterExplore}>{LANDING_CTA_LABEL}</button>
            </article>
            <article className="landing-pathway">
              <div><h3>Guided discovery</h3><p>Explore four interactive lessons on 3D orientation, passive tracer motion, velocity vectors, and spatial comparisons.</p></div>
              <button type="button" className="ui-button ui-button--primary landing__cta" onClick={onEnterLearn}>Learn</button>
            </article>
          </div>
        </section>
      </div>
      <div className="landing__content">
        <section className="landing__capabilities" aria-labelledby="landing-capabilities-title">
          <p className="landing__eyebrow">Inside the laboratory</p>
          <h2 id="landing-capabilities-title" className="landing__section-title">More than a visualization</h2>
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

      <section className="landing__whats-next" aria-labelledby="landing-whats-next-title">
        <h2 id="landing-whats-next-title" className="landing__section-title">{LANDING_WHATS_NEXT_TITLE}</h2>
        <p className="landing__whats-next-copy">The current laboratory starts with motion. The next questions reach into what drives it.</p>
        <div className="landing-roadmap">
          {LANDING_WHATS_NEXT_STAGES.map(stage => (
            <article key={stage.id} className={`ui-panel landing-roadmap__stage landing-roadmap__stage--${stage.kind}`}>
              <h3 className="landing-roadmap__label">{stage.status} · {stage.topic}</h3>
              <p className="landing-roadmap__detail">{stage.copy}</p>
            </article>
          ))}
        </div>
        <p className="landing__whats-next-principle">{LANDING_WHATS_NEXT_PRINCIPLE_LEAD} {LANDING_WHATS_NEXT_PRINCIPLE_CLOSE}</p>
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
        {LANDING_DESKTOP_RECOMMENDED}
      </p>

      </div>
    </main>
    <GlobalFooter onOpenResource={openResource} />
    </>
  );
}
