import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LANDING_EXPLORE_COPY,
  LANDING_GUIDED_COPY,
  LandingPage,
} from "./LandingPage.js";
import landingSrc from "./LandingPage.tsx?raw";

describe("LandingPage", () => {
  it("presents Guided and Explore as alternative mode buttons with How It Works", () => {
    const html = renderToStaticMarkup(
      <LandingPage
        onEnterGuided={() => {}}
        onEnterExplore={() => {}}
        onOpenHowItWorks={() => {}}
      />,
    );
    expect(html).toContain("Supercell Explorer");
    expect(html).toContain("landing-mode-card");
    expect(html).toContain("Guided");
    expect(html).toContain("Explore");
    expect(html).toContain("prepared supercell scenario");
    expect(html).toContain("release tracers yourself");
    expect(landingSrc).toContain(LANDING_GUIDED_COPY);
    expect(landingSrc).toContain(LANDING_EXPLORE_COPY);
    expect(html).toContain("How It Works");
    expect(html).toContain("type=\"button\"");
    expect(html).not.toContain("Environment");
    expect(html).not.toContain("Storm-relative laboratory");
  });

  it("exposes How It Works as an active help entry, not a third mode", () => {
    const html = renderToStaticMarkup(
      <LandingPage
        onEnterGuided={() => {}}
        onEnterExplore={() => {}}
        onOpenHowItWorks={() => {}}
      />,
    );
    expect(html).toContain("aria-label=\"How It Works\"");
    expect(html).toContain("aria-haspopup=\"dialog\"");
    expect(html).not.toContain("disabled");
    expect(html).not.toContain("aria-pressed");
    expect(landingSrc).toContain("onOpenHowItWorks");
    expect(landingSrc).not.toContain("HOW_IT_WORKS_UNAVAILABLE_REASON");
  });
});
