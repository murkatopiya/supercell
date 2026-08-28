import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App.js";
import appSrc from "./App.tsx?raw";
import {
  HOW_IT_WORKS_UNAVAILABLE_REASON,
} from "./LandingPage.js";

/**
 * Slice 1 — landing / mode identity / Environment hierarchy.
 * docs/ui/07-app-navigation-and-mode-entry.md
 */
describe("App navigation Slice 1", () => {
  it("boots on landing without constructing a laboratory", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("app--landing");
    expect(html).toContain("Supercell Explorer");
    expect(html).toContain("Guided");
    expect(html).toContain("Explore");
    expect(html).toContain("prepared supercell scenario");
    expect(html).toContain("release tracers yourself");
    expect(html).toContain("How It Works");
    expect(html).toContain(HOW_IT_WORKS_UNAVAILABLE_REASON);
    expect(html).not.toContain("Storm-relative laboratory");
    expect(html).not.toContain("aria-label=\"Explore laboratory\"");
    expect(html).not.toContain("aria-label=\"Guided laboratory\"");
    expect(appSrc).toMatch(/useState<AppSurface>\("landing"\)/);
    expect(appSrc).toMatch(/useState<Lab \| null>\(null\)/);
    expect(appSrc).not.toMatch(
      /useState<Lab>\(\(\) =>\s*createGuidedLab\(DEFAULT_GUIDED_EXPERIMENT_ID\)/,
    );
  });

  it("enters Guided and Explore through existing lab factories", () => {
    expect(appSrc).toMatch(/<LandingPage/);
    expect(appSrc).toMatch(/onEnterGuided=\{enterGuided\}/);
    expect(appSrc).toMatch(/onEnterExplore=\{enterExplore\}/);
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*createGuidedLab\(guidedExperimentId\)/s,
    );
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*createExploreLab/s,
    );
    expect(appSrc).toMatch(/enterGuided[\s\S]*setAppSurface\("laboratory"\)/s);
    expect(appSrc).toMatch(/enterExplore[\s\S]*setAppSurface\("laboratory"\)/s);
  });

  it("shows in-mode identity and returns to landing via Supercell", () => {
    const laboratoryHeader = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(laboratoryHeader).toMatch(/ModeIdentity/);
    expect(laboratoryHeader).toMatch(/mode=\{explore !== null \? "Explore" : "Guided"\}/);
    expect(laboratoryHeader).toMatch(/onReturnToLanding=\{returnToLanding\}/);
    expect(laboratoryHeader).not.toMatch(/app__mode-switch/);
    expect(laboratoryHeader).not.toMatch(/lab-experience-switch/);
    expect(laboratoryHeader).not.toMatch(/aria-pressed=\{lab\.kind/);
    expect(appSrc).toMatch(/const returnToLanding/);
    expect(appSrc).toMatch(/returnToLanding[\s\S]*setLab\(null\)/s);
    expect(appSrc).toMatch(/returnToLanding[\s\S]*setAppSurface\("landing"\)/s);
  });

  it("keeps Environment as in-mode chrome, not a peer of Guided / Explore", () => {
    const laboratoryHeader = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(laboratoryHeader).toMatch(/EnvironmentAffordance/);
    expect(laboratoryHeader).toMatch(/ModeIdentity/);
    expect(appSrc).not.toMatch(/app__mode-switch/);
    const landingSrc = appSrc.slice(
      appSrc.indexOf("<LandingPage"),
      appSrc.indexOf("const explore = lab.kind"),
    );
    expect(landingSrc).not.toMatch(/EnvironmentAffordance/);
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).not.toMatch(/EnvironmentAffordance/);
  });
});
