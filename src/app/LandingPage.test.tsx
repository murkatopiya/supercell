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
  LANDING_GUIDED_LATER_NOTE,
  LANDING_LEDE,
  LANDING_OBSERVED_ENVIRONMENT_LINKS,
  LANDING_WHATS_NEXT_DIRECTION,
  LANDING_WHATS_NEXT_LEAD,
  LANDING_WHATS_NEXT_PRINCIPLE_CLOSE,
  LANDING_WHATS_NEXT_PRINCIPLE_LEAD,
  LANDING_WHATS_NEXT_TITLE,
  LANDING_WHY_EXISTS_CONNECTS,
  LANDING_WHY_EXISTS_LEAD,
  LANDING_WHY_EXISTS_TITLE,
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
      onEnterExplore={() => {}}
      onOpenUserGuide={() => {}}
      onOpenHowItWorks={() => {}}
      onOpenGlossary={() => {}}
    />,
  );
}

const appCss = readFileSync(new URL("./app.css", import.meta.url), "utf8");

describe("LandingPage", () => {
  it("explains the current laboratory and marks it as a v0.1 research prototype", () => {
    const html = landingMarkup();
    expect(html).toContain("Supercell Explorer");
    expect(html).toContain(LANDING_LEDE);
    expect(html).toContain("kinematic laboratory");
    expect(html).toContain(PUBLIC_VERSION);
    expect(html).toContain("Research prototype");
    expect(html).toContain(PUBLIC_VERSION_BADGE);
    expect(landingSrc).toContain("PUBLIC_VERSION_BADGE");
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
    expect(html).toContain(LANDING_GUIDED_LATER_NOTE);
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

  it("lists current laboratory capabilities without dumping documentation", () => {
    const html = landingMarkup();
    expect(html).toContain("Explore observed environments");
    expect(html).toContain("Follow trajectories");
    expect(html).toContain("Read Analysis T1 along the path");
    expect(html).toContain("Explain a historical sample");
    expect(html).toContain("vertical-tilting diagnostic");
    expect(html).toContain("what-if alignment");
    expect(html).not.toContain("parcel spin-up");
    expect(html).not.toContain("production ready");
  });

  it("exposes User Guide, How It Works, and Glossary as active help entries, not a third mode", () => {
    const html = landingMarkup();
    expect(html).toContain("User Guide");
    expect(html).toContain("How It Works");
    expect(html).toContain("aria-label=\"User Guide\"");
    expect(html).toContain("aria-label=\"How It Works\"");
    expect(html).toContain("aria-label=\"Glossary\"");
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

  it("states why the laboratory exists and that it connects environment views to trajectory analysis", () => {
    const html = landingMarkup();
    expect(html).toContain(LANDING_WHY_EXISTS_TITLE);
    expect(html).toContain("Why this exists");
    expect(html).toContain(LANDING_WHY_EXISTS_LEAD);
    expect(html).toContain(LANDING_WHY_EXISTS_CONNECTS);
    expect(html).toContain("do not by themselves show");
    expect(html).toContain("prescribed storm-local flow geometry");
    expect(html).toContain("connects these views");
    expect(html).toContain("passive tracer");
    expect(html).toContain("Analysis T1");
    expect(html).toContain("recorded trajectory");
    expect(html).toContain("vector geometry");
    expect(html).toContain("recorded trajectory point with available diagnostics");
    expect(html).toContain("sampled vertical-tilting diagnostic");
    const whyCopy = `${LANDING_WHY_EXISTS_LEAD} ${LANDING_WHY_EXISTS_CONNECTS}`;
    expect(whyCopy).not.toMatch(/forecast/i);
    expect(whyCopy).not.toMatch(/predict/i);
    expect(whyCopy).not.toMatch(/reconstruct/i);
    expect(whyCopy).not.toMatch(/replay/i);
    expect(whyCopy).not.toMatch(/parcel spin-up/i);
    expect(whyCopy).not.toMatch(/tornadogenesis/i);
    expect(whyCopy).not.toMatch(/real storm simulation/i);
  });

  it("places purpose beside capabilities on wide desktop without turning Why into a card", () => {
    const html = landingMarkup();
    const purposeStart = html.indexOf("landing__purpose-row");
    const capabilitiesStart = html.indexOf("landing__capabilities");
    const whatsNextStart = html.indexOf("landing__whats-next");
    const disclaimerStart = html.indexOf("landing__disclaimer");
    expect(purposeStart).toBeGreaterThan(-1);
    expect(capabilitiesStart).toBeGreaterThan(purposeStart);
    expect(whatsNextStart).toBeGreaterThan(capabilitiesStart);
    expect(disclaimerStart).toBeGreaterThan(whatsNextStart);
    expect(html).toContain('class="landing__purpose"');
    expect(html).not.toMatch(/class="[^"]*landing__purpose[^"]*ui-panel/);
    expect(html).not.toMatch(/class="[^"]*ui-panel[^"]*landing__purpose/);
    expect(appCss).toMatch(
      /\.landing__purpose-row\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    expect(appCss).toMatch(
      /@media \(min-width: 64rem\)[\s\S]*?\.landing__purpose-row[\s\S]*?grid-template-columns:/,
    );
    expect(appCss).toMatch(/\.app--landing\s*\{[^}]*max-width:\s*72rem/);
    expect(landingSrc).toContain("landing__purpose-row");
    expect(landingSrc).toContain("landing__disclaimer");
  });

  it("places a kinematics-complete thermodynamics roadmap after capabilities and before the scientific boundary", () => {
    const html = landingMarkup();
    expect(html).toContain("What&#x27;s next");
    expect(LANDING_WHATS_NEXT_TITLE).toBe("What's next");
    expect(html).toContain("V1 · Kinematics");
    expect(html).toContain("Next · Thermodynamics");
    expect(html).toContain("Later · Coupled mechanisms");
    expect(html).toContain(LANDING_WHATS_NEXT_LEAD);
    expect(html).toContain(LANDING_WHATS_NEXT_DIRECTION);
    expect(html).toContain("next research direction is thermodynamics");
    expect(html).toContain("Observed wind");
    expect(html).toContain("Analysis T1");
    expect(html).toContain("mechanism geometry");
    expect(html).toContain("parcel ascent");
    expect(html).toContain("CAPE / CIN");
    expect(html).toContain(
      "Only where a scientifically defensible coupling is established.",
    );
    expect(html).toContain(LANDING_WHATS_NEXT_PRINCIPLE_LEAD);
    expect(html).toContain(LANDING_WHATS_NEXT_PRINCIPLE_CLOSE);
    expect(html).toContain("Coupling only when the physics earns it.");

    const capabilitiesEnd = html.indexOf("landing__capabilities");
    const whatsNextStart = html.indexOf("landing__whats-next");
    const principleStart = html.indexOf(LANDING_WHATS_NEXT_PRINCIPLE_CLOSE);
    const disclaimerStart = html.indexOf("Scientific boundary");
    expect(whatsNextStart).toBeGreaterThan(capabilitiesEnd);
    expect(principleStart).toBeGreaterThan(whatsNextStart);
    expect(disclaimerStart).toBeGreaterThan(principleStart);

    expect(html.match(/class="landing-roadmap__connector"/g)).toHaveLength(2);
    expect(html).toMatch(
      /class="landing-roadmap__connector" aria-hidden="true"/,
    );
    expect(html).toContain('class="landing-roadmap__token"');
    expect(html).toContain(">T</span>");
    expect(html).toContain(">Td</span>");
    expect(html).toContain(">p</span>");
    expect(html).not.toContain("tabindex");
    expect(html).not.toMatch(/coming soon/i);
    expect(html).not.toMatch(/physically generated updraft/i);
    expect(html).not.toMatch(/full supercell simulation/i);
    expect(html).not.toMatch(/storm prediction/i);
    expect(html).not.toMatch(/forecast capability/i);
    expect(html).not.toMatch(/prognostic parcel-vorticity/i);
    expect(html).not.toMatch(/fully coupled atmospheric model/i);
    expect(LANDING_WHATS_NEXT_LEAD + LANDING_WHATS_NEXT_DIRECTION).not.toMatch(
      /already (includes|implements|provides) thermodynamics/i,
    );
  });

  it("keeps Open Laboratory as the only primary CTA and does not wire the roadmap into the laboratory", () => {
    const html = landingMarkup();
    expect(html).toContain(LANDING_CTA_LABEL);
    expect(html.match(/ui-button--primary/g)).toHaveLength(1);
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
    expect(html).toContain('class="landing__footer"');
    expect(html).toContain(
      `${LANDING_FOOTER_PRODUCT} · ${PUBLIC_VERSION} ${PUBLIC_VERSION_STATUS}`,
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
    expect(html.indexOf("landing__footer")).toBeGreaterThan(
      html.indexOf(LANDING_DESKTOP_RECOMMENDED),
    );
    expect(landingSrc).toContain("PUBLIC_VERSION");
    expect(landingSrc).toContain("PUBLIC_VERSION_STATUS");
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

  it("places the brand logo beside the hero copy on landing", () => {
    const html = landingMarkup();
    expect(html).toContain("landing__hero");
    expect(html).toContain("landing__logo");
    expect(html).toContain("supercell-explorer-logo");
    expect(html).toMatch(/<img class="landing__logo"[^>]*alt=""/);
    expect(landingSrc).toContain("landing__hero");
    expect(landingSrc).toContain("landing__logo");
    expect(appCss).toMatch(
      /@media \(min-width: 64rem\)[\s\S]*?\.landing__hero[\s\S]*?grid-template-columns:/,
    );
  });
});
