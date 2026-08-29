import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingPage } from "./LandingPage.js";
import {
  LANDING_CTA_LABEL,
  LANDING_DISCLAIMER,
  LANDING_ENVIRONMENTS_NOTE,
  LANDING_GUIDED_LATER_NOTE,
  LANDING_LEDE,
} from "./landingContent.js";
import { PUBLIC_VERSION, PUBLIC_VERSION_BADGE } from "./publicVersion.js";
import landingSrc from "./LandingPage.tsx?raw";

function landingMarkup() {
  return renderToStaticMarkup(
    <LandingPage
      onEnterExplore={() => {}}
      onOpenHowItWorks={() => {}}
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
    expect(html).toContain(LANDING_ENVIRONMENTS_NOTE);
    expect(html).toContain("Goshen");
    expect(html).toContain("Prospect Valley");
    expect(html).toContain("Dumas");
    expect(html).toContain("Moore");
    expect(html).toContain("suitable Analysis representation");
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

  it("exposes How It Works as an active help entry, not a third mode", () => {
    const html = landingMarkup();
    expect(html).toContain("How It Works");
    expect(html).toContain("aria-label=\"How It Works\"");
    expect(html).toContain("aria-haspopup=\"dialog\"");
    expect(html).not.toContain("disabled");
    expect(html).not.toContain("aria-pressed");
    expect(landingSrc).toContain("onOpenHowItWorks");
    expect(landingSrc).not.toContain("HOW_IT_WORKS_UNAVAILABLE_REASON");
  });
});
