/** @vitest-environment happy-dom */
import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingPage } from "./LandingPage.js";
import {
  LANDING_CTA_LABEL,
  LANDING_DESKTOP_RECOMMENDED,
  LANDING_DISCLAIMER,
  LANDING_ENVIRONMENTS_ANALYSIS_NOTE,
  LANDING_ENVIRONMENTS_LEAD,
  LANDING_FOOTER_CREATED_BY,
  LANDING_FOOTER_PORTFOLIO_ACCESSIBLE_NAME,
  LANDING_FOOTER_PORTFOLIO_LABEL,
  LANDING_FOOTER_PORTFOLIO_URL,
  LANDING_FOOTER_PRODUCT,
  LANDING_FOOTER_PROJECT,
  LANDING_ATTRIBUTION_ESC_CASES,
  LANDING_ATTRIBUTION_MOORE_CASE,
  LANDING_LEDE,
  LANDING_OBSERVED_ENVIRONMENT_LINKS,
  LANDING_WHATS_NEXT_PRINCIPLE_CLOSE,
  LANDING_WHATS_NEXT_PRINCIPLE_LEAD,
  LANDING_WHATS_NEXT_TITLE,
} from "./landingContent.js";
import landingContentSrc from "./landingContent.ts?raw";
import {
  PUBLIC_VERSION,
  PUBLIC_VERSION_BADGE,
  PUBLIC_VERSION_STATUS,
} from "./publicVersion.js";
import {
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
} from "../explore/exploreEnvironmentIdentity.js";
import landingSrc from "./LandingPage.tsx?raw";
import identitySrc from "../explore/exploreEnvironmentIdentity.ts?raw";
import { readFileSync } from "node:fs";
const appCss = readFileSync("src/app/landing.css", "utf8");

function landingMarkup() {
  return renderToStaticMarkup(
    <LandingPage
      onEnterLearn={() => {}}
      onEnterExplore={() => {}}
      onOpenUserGuide={() => {}}
      onOpenHowItWorks={() => {}}
      onOpenGlossary={() => {}}
    />,
  );
}



describe("LandingPage", () => {
  it("uses single native entry surfaces and routes every Home CTA through existing callbacks", () => {
    const host = document.createElement("div"); document.body.append(host);
    const root = createRoot(host), learn = vi.fn(), explore = vi.fn();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    try {
      act(() => root.render(<LandingPage onEnterLearn={learn} onEnterExplore={explore} onOpenUserGuide={() => {}} onOpenHowItWorks={() => {}} onOpenGlossary={() => {}} />));
      const cards = host.querySelectorAll<HTMLButtonElement>("button.landing-pathway");
      expect(cards).toHaveLength(2);
      expect(cards[0].querySelector(".landing-pathway__title")?.textContent).toBe("Explore");
      expect(cards[1].querySelector(".landing-pathway__title")?.textContent).toBe("Learn");
      cards.forEach((card, i) => {
        expect(card.type).toBe("button");
        expect(card.querySelector("button, a, [tabindex]")).toBeNull();
        expect(card.hasAttribute("target")).toBe(false);
        expect(card.getAttribute("aria-labelledby")?.split(" ").every(id => host.querySelector(`#${id}`))).toBe(true);
        expect(host.querySelector(`#${card.getAttribute("aria-describedby")}`)).not.toBeNull();
        card.focus(); expect(document.activeElement).toBe(card);
        act(() => card.click());
        expect(i === 0 ? explore : learn).toHaveBeenCalledTimes(1);
      });
      const groups = host.querySelectorAll(".landing__mode-actions");
      expect(groups).toHaveLength(2);
      expect(host.querySelector(".landing__capabilities")?.nextElementSibling).toBe(groups[0]);
      expect(host.querySelector("main")?.lastElementChild?.lastElementChild).toBe(groups[1]);
      groups.forEach(group => {
        const buttons = group.querySelectorAll<HTMLButtonElement>("button");
        expect([...buttons].map(b => b.textContent)).toEqual(["Open Explore", "Start with Learn"]);
        buttons.forEach(button => { button.focus(); expect(document.activeElement).toBe(button); act(() => button.click()); });
      });
      expect(learn).toHaveBeenCalledTimes(3); expect(explore).toHaveBeenCalledTimes(3);
      expect(appCss).toContain("button.landing-pathway:hover");
      expect(appCss).toContain("button:focus-visible");
      expect(appCss).toContain("prefers-reduced-motion: reduce");
      expect(appCss).toContain("transition: none; animation: none");
      expect(appCss).toContain("flex: 1 1 100%");
    } finally { act(() => root.unmount()); host.remove(); }
  });

  it("opens repository resources in a new tab with decorative GitHub icons", () => {
    const html = landingMarkup();
    const links = html.match(/<a [^>]*href="https:\/\/github\.com[^>]*>[\s\S]*?<\/a>/g) ?? [];
    expect(links).toHaveLength(5);
    for (const link of links) {
      expect(link).toContain('target="_blank"');
      expect(link).toContain('rel="noopener noreferrer"');
      expect(link).toContain('aria-hidden="true"');
      expect(link).toContain('focusable="false"');
    }
  });
  it("introduces T1 through a physical question while retaining diagnostic boundaries", () => {
    const html = landingMarkup();
    const section = html.slice(html.indexOf('class="landing__advanced"'), html.indexOf('class="landing__whats-next"'));
    expect(section).toContain("Advanced analysis");
    expect(section).toContain("How can airflow contribute to rotation?");
    expect(section).toContain("rotation around a horizontal axis");
    expect(section).toContain("tilt some of that horizontal rotation toward the vertical");
    expect(section).toContain("one contribution to the local rate of change of vertical vorticity");
    expect(section).toContain("does not calculate the complete development of a rotating storm");
    expect(section).toContain("#comparison-scopes-and-advanced-availability");
    expect(section).toContain("supported recorded points in Goshen, Prospect Valley and Dumas");
    expect(section).toContain("Moore and Demo have no Analysis T1; unavailable does not mean zero");
    expect(section).toContain("#comparison-scopes-and-advanced-availability");
  });
  it("keeps mode choices explicit and bounds the comparison exercise", () => {
    const html = landingMarkup();
    expect(html).toContain('id="landing-learn-title"');
    expect(html).toContain('id="landing-explore-title"');
    expect(html).toContain("inspect numerical velocity measurements");
    expect(html).not.toContain("Explore has no arbitrary stationary A/B probes");

    expect(html).toContain("selected observed weather-balloon wind profiles");
    expect(html).toContain("#first-exercise-compare-motion-at-fixed-height-and-time");
    expect(html).toContain("Scientific methods and evidence");
    expect(html).not.toContain("explore-inspector.webp");
  });

  it("explains the current laboratory and marks it as a V1.1 research prototype", () => {
    const html = landingMarkup();
    expect(html).toContain("Supercell Explorer");
    expect(html).toContain(LANDING_LEDE);
    expect(html).toContain("kinematic laboratory");
    expect(html).toContain(PUBLIC_VERSION);
    expect(html).toContain("Research prototype");
    expect(html).toContain(PUBLIC_VERSION_BADGE);
    expect(landingSrc).toContain("GlobalFooter");
  });

  it("uses Explore as the primary CTA and does not offer Guided as a peer choice", () => {
    const html = landingMarkup();
    expect(html).toContain(LANDING_CTA_LABEL);
    expect(html).toContain("landing-pathway");
    expect(html).toContain("ui-button--primary");
    expect(html).not.toContain("landing-mode-card");
    expect(html).not.toContain("onEnterGuided");
    expect(landingSrc).not.toContain("onEnterGuided");
    expect(landingSrc).toContain("onEnterExplore");
    expect(html).not.toContain("A guided walkthrough is planned");
    expect(html).not.toContain("prepared supercell scenario");
  });

  it("states the scientific boundary independently of the version badge", () => {
    const html = landingMarkup();
    expect(html).toContain("Scientific boundary");
    expect(html).toContain(LANDING_DISCLAIMER);
    expect(html).toContain("not a weather forecast");
    expect(html).toContain("full atmospheric simulation");
    expect(html).toContain(LANDING_ENVIRONMENTS_LEAD);
    expect(html).toContain(LANDING_ENVIRONMENTS_ANALYSIS_NOTE);
    expect(html).toContain("an Analysis representation");
  });

  it("links observed environment names to authoritative case resources", () => {
    const html = landingMarkup();
    expect(LANDING_OBSERVED_ENVIRONMENT_LINKS).toHaveLength(4);
    expect(LANDING_OBSERVED_ENVIRONMENT_LINKS.map((item) => item.identity)).toEqual(
      [
        EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
        EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
        EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
        EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
      ],
    );
    expect(
      LANDING_OBSERVED_ENVIRONMENT_LINKS.map((item) => item.eventContextUrl),
    ).toEqual([
      "https://www.weather.gov/cys/GoshenCountyTornado",
      "https://journals.ametsoc.org/view/journals/mwre/148/5/mwr-d-19-0288.1.xml",
      "https://www.weather.gov/media/ama/may2010.pdf",
      "https://www.weather.gov/oun/events-20130520",
    ]);
    for (const environment of LANDING_OBSERVED_ENVIRONMENT_LINKS) {
      expect(html).toContain(`href="${environment.eventContextUrl}"`);
      expect(html).toContain(`aria-label="${environment.accessibleName}"`);
      expect(html).toContain(`>${environment.label}<span`);
    }
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html.match(/class="landing-environment-link"/g)).toHaveLength(4);
    expect(html).not.toContain("Prospect Valley tornado");
    expect(html).not.toContain("historical storm reconstruction");
    expect(html).not.toContain("Simulate the");
    expect(landingSrc).not.toContain("weather.gov");
    expect(identitySrc).not.toContain("eventContextUrl");
    expect(identitySrc).not.toContain("weather.gov");
  });

  it("summarizes capabilities without claiming scientific qualification", () => {
    const html = landingMarkup();
    for (const copy of ["Inspect local motion", "Understand prescribed velocity contributions", "Follow calculated tracer paths", "Compare observations", "not independently observed physical causes", "Moore and Demo have no Analysis T1", "unavailable does not mean zero"]) expect(html).toContain(copy);
    expect(html.indexOf("landing__advanced")).toBeGreaterThan(html.indexOf("landing__capabilities"));
    expect(html).toContain("does not calculate the complete development of a rotating storm");
    expect(html).not.toMatch(/scientifically validated|production ready/i);
  });

  it("exposes User Guide, How It Works, and Glossary as active help entries, not a third mode", () => {
    const html = landingMarkup();
    expect(html).toContain("User Guide");
    expect(html).toContain("How It Works");
    expect(html).toContain(">User Guide</button>");
    expect(html).toContain(">How It Works</button>");
    expect(html).toContain(">Glossary</button>");
    expect(html).toContain("aria-haspopup=\"dialog\"");
    expect(html).not.toContain("disabled");
    expect(html).not.toContain("aria-pressed");
    expect(landingSrc).toContain("onOpenUserGuide");
    expect(landingSrc).toContain("onOpenHowItWorks");
    expect(landingSrc).toContain("onOpenGlossary");
    expect(landingSrc).not.toContain("HOW_IT_WORKS_UNAVAILABLE_REASON");
  });

  it("recommends desktop without blocking narrow viewports", () => {
    const html = landingMarkup();
    expect(html).toContain(LANDING_DESKTOP_RECOMMENDED);
    expect(html).toContain("landing__note--quiet");
    expect(html).not.toContain("unsupported");
    expect(html).not.toContain("mobile is not");
  });

  it("describes the four available interactive lessons and makes both entry points primary", () => {
    const html = landingMarkup();
    expect(html).toContain("Explore airflow. Examine the motion.");
    expect(html).toContain("Independent laboratory investigation");
    expect(html).toContain("Guided discovery");
    expect(html).not.toContain("Velocity-vector instruction is planned.");
    expect(html).toContain("Start with four guided lessons introducing 3D orientation, passive tracers, velocity vectors, and spatial comparison.");
    expect(html.match(/class="landing-pathway(?: landing-pathway--explore)?"/g)).toHaveLength(2);
    expect(html).not.toContain("landing__cta--learn");
    for (const label of ["Goshen · 2009", "Prospect Valley · 2010", "Dumas · 2010", "Moore · 2013"]) expect(html).toContain(label);
  });

  it("keeps the scientific boundary after capabilities and research direction", () => {
    const html = landingMarkup();
    expect(html.indexOf("landing__whats-next")).toBeGreaterThan(html.indexOf("landing__capabilities"));
    expect(html.indexOf("landing__disclaimer")).toBeGreaterThan(html.indexOf("landing__whats-next"));
  });

  it("separates current kinematics from future research without implying certification", () => {
    const html = landingMarkup();
    expect(html).toContain(LANDING_WHATS_NEXT_TITLE.replace("&", "&amp;"));
    for (const text of ["Current", "Planned Research", "Long-term Vision", "Interactive Atmospheric Research", "not a fully validated atmospheric simulation", "remain unimplemented", "independently of thermodynamics", "independently solving atmospheric equations", "subject to separate scientific design and validation", "compatible user-provided meteorological datasets", "reproducible research workflows"]) expect(html).toContain(text);
    expect(html.match(/class="landing-roadmap__stage landing-roadmap__stage--/g)).toHaveLength(3);
    expect(html).toContain(LANDING_WHATS_NEXT_PRINCIPLE_LEAD);
    expect(html).toContain("Research directions are not rigid technical dependencies.");
  });

  it("offers equal Learn and Explore CTAs and does not wire the roadmap into the laboratory", () => {
    const html = landingMarkup();
    expect(html).toContain(LANDING_CTA_LABEL);
    expect(html.match(/ui-button--primary/g)).toHaveLength(2);
    expect(html).toContain("Learn");
    expect(html).toContain("landing-pathway");
    expect(landingSrc).not.toContain("createExploreLab");
    expect(landingSrc).not.toContain("createGuidedLab");
    expect(landingSrc).not.toContain("onEnterExplore()");
    expect(landingContentSrc).not.toContain("createExploreLab");
    expect(landingContentSrc).not.toMatch(/from ["'].*physics/);
    expect(landingSrc).not.toMatch(/from ["'].*createExploreLab/);
    expect(landingSrc).not.toMatch(/from ["'].*physics/);
    expect(landingSrc).toContain("Does not construct a laboratory");
  });

  it("ends with a quiet project footer and a portfolio link", () => {
    const html = landingMarkup();
    expect(html).toContain('class="global-footer global-footer--full"');
    expect(html).toContain(
      `${LANDING_FOOTER_PRODUCT} · ${PUBLIC_VERSION} · ${PUBLIC_VERSION_STATUS}`,
    );
    expect(html).toContain(LANDING_FOOTER_CREATED_BY);
    expect(html).toContain("Independent research &amp; software project · 2026");
    expect(LANDING_FOOTER_PROJECT).toBe(
      "Independent research & software project · 2026",
    );
    expect(html).toContain(`href="${LANDING_FOOTER_PORTFOLIO_URL}"`);
    expect(html).toContain(
      `aria-label="${LANDING_FOOTER_PORTFOLIO_ACCESSIBLE_NAME}"`,
    );
    expect(html).toContain(`>${LANDING_FOOTER_PORTFOLIO_LABEL}<span`);
    expect(html.indexOf("global-footer")).toBeGreaterThan(
      html.indexOf(LANDING_DESKTOP_RECOMMENDED),
    );
    expect(landingSrc).toContain("GlobalFooter");
    expect(landingSrc).not.toContain("iryna.online");
    expect(landingContentSrc).toContain(LANDING_FOOTER_PORTFOLIO_URL);
    expect(html).toContain("Data &amp; attribution");
    expect(html).toContain(LANDING_ATTRIBUTION_ESC_CASES);
    expect(html).toContain(LANDING_ATTRIBUTION_MOORE_CASE);
    expect(html).toContain("114.114");
    expect(html).toContain("10.5065/D6CC0Z0Q");
    expect(html).toContain("USM00072357");
    expect(html).toContain("DSI-6301");
    expect(html).toContain("https://doi.org/10.5065/D6CC0Z0Q");
    expect(html).toContain("https://data.eol.ucar.edu/dataset/114.114");
  });

  it("uses the original linked logo in the shared header", () => {
    const html = landingMarkup();
    expect(html).toContain('class="global-header__brand"');
    expect(html).toContain('href="/" aria-label="Supercell Explorer — Home"');
    expect(html).toContain("supercell-explorer-logo-dark.png");
    expect(html).not.toContain("landing__brand-name");
    expect(html.indexOf("global-header")).toBeLessThan(html.indexOf("landing__hero"));
  });
});
