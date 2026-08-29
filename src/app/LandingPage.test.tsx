import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingPage } from "./LandingPage.js";
import {
  LANDING_CTA_LABEL,
  LANDING_DESKTOP_RECOMMENDED,
  LANDING_DISCLAIMER,
  LANDING_ENVIRONMENTS_ANALYSIS_NOTE,
  LANDING_ENVIRONMENTS_LEAD,
  LANDING_GUIDED_LATER_NOTE,
  LANDING_LEDE,
  LANDING_OBSERVED_ENVIRONMENT_LINKS,
} from "./landingContent.js";
import { PUBLIC_VERSION, PUBLIC_VERSION_BADGE } from "./publicVersion.js";
import {
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
} from "../explore/exploreEnvironmentIdentity.js";
import landingSrc from "./LandingPage.tsx?raw";
import identitySrc from "../explore/exploreEnvironmentIdentity.ts?raw";

function landingMarkup() {
  return renderToStaticMarkup(
    <LandingPage
      onEnterExplore={() => {}}
      onOpenHowItWorks={() => {}}
      onOpenGlossary={() => {}}
    />,
  );
}

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
    expect(html).toContain("suitable Analysis representation");
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

  it("exposes How It Works and Glossary as active help entries, not a third mode", () => {
    const html = landingMarkup();
    expect(html).toContain("How It Works");
    expect(html).toContain("aria-label=\"How It Works\"");
    expect(html).toContain("aria-label=\"Glossary\"");
    expect(html).toContain("aria-haspopup=\"dialog\"");
    expect(html).not.toContain("disabled");
    expect(html).not.toContain("aria-pressed");
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
});
