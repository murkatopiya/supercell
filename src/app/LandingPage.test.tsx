import { describe, expect, it } from "vitest";
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

const appCss = readFileSync(new URL("./landing.css", import.meta.url), "utf8");

describe("LandingPage", () => {
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
    expect(html).toContain("landing__cta");
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
    expect(html).not.toContain("reconstruction");
    expect(html).not.toContain("Simulate the");
    expect(landingSrc).not.toContain("weather.gov");
    expect(identitySrc).not.toContain("eventContextUrl");
    expect(identitySrc).not.toContain("weather.gov");
  });

  it("summarizes capabilities without claiming scientific qualification", () => {
    const html = landingMarkup();
    for (const copy of ["Scientific data", "Motion &amp; vectors", "Controlled experiments", "project-specific, constrained vertical-tilting diagnostic", "prescribed updraft vertical velocity", "Source uses retained observed winds; Analysis is separately filtered"]) expect(html).toContain(copy);
    expect(html).not.toMatch(/scientifically validated|production ready|parcel spin-up/i);
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
    expect(html).toContain("Explore the physics of atmospheric motion.");
    expect(html).toContain("Independent investigation");
    expect(html).toContain("Guided discovery");
    expect(html).not.toContain("Velocity-vector instruction is planned.");
    expect(html).toContain("Explore four interactive lessons on 3D orientation, passive tracer motion, velocity vectors, and spatial comparisons.");
    expect(html.match(/ui-button--primary landing__cta/g)).toHaveLength(2);
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
    expect(html).toContain(LANDING_WHATS_NEXT_TITLE);
    expect(html).toContain("V1 · Kinematics");
    expect(html).toContain("Available today:");
    expect(html).toContain("Next · Thermodynamics");
    expect(html).toContain("Not implemented.");
    expect(html).toContain("convective available potential energy (CAPE)");
    expect(html).toContain("convective inhibition (CIN)");
    expect(html).toContain("user-defined scenarios");
    expect(html).toContain("not available today");
    expect(html).toContain(LANDING_WHATS_NEXT_PRINCIPLE_LEAD);
    expect(html).toContain(LANDING_WHATS_NEXT_PRINCIPLE_CLOSE);
  });

  it("offers equal Learn and Explore CTAs and does not wire the roadmap into the laboratory", () => {
    const html = landingMarkup();
    expect(html).toContain(LANDING_CTA_LABEL);
    expect(html.match(/ui-button--primary/g)).toHaveLength(2);
    expect(html).toContain("Learn");
    expect(html).toContain("landing__cta");
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
