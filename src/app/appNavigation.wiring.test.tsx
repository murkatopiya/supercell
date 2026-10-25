import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App.js";
import appSrc from "./App.tsx?raw";

/**
 * Slice 1 — landing / mode identity / Environment hierarchy.
 * docs/ui/07-app-navigation-and-mode-entry.md
 */
describe("App navigation Slice 1", () => {
  it("boots on landing without constructing a laboratory", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("app--landing");
    expect(html).toContain("Supercell Explorer");
    expect(html).toContain("V1.1");
    expect(html).toContain("Research prototype");
    expect(html).toContain("Explore");
    expect(html).toContain("Learn");
    expect(html).toContain("kinematic laboratory");
    expect(html).toContain("How It Works");
    expect(html).not.toContain("A guided walkthrough is planned for a later version.");
    expect(html).not.toContain("prepared supercell scenario");
    expect(html).not.toContain("landing-mode-card");
    expect(html).not.toContain("disabled");
    expect(html).not.toContain("role=\"dialog\"");
    expect(html).not.toContain("Storm-relative laboratory");
    expect(html).not.toContain("aria-label=\"Explore laboratory\"");
    expect(html).not.toContain("aria-label=\"Guided laboratory\"");
    expect(appSrc).toMatch(/useState<AppSurface>\("landing"\)/);
    expect(appSrc).toMatch(/useState<Lab \| null>\(null\)/);
    expect(appSrc).not.toMatch(
      /useState<Lab>\(\(\) =>\s*createGuidedLab\(DEFAULT_GUIDED_EXPERIMENT_ID\)/,
    );
  });

  it("enters Explore from landing and keeps Guided factories without a landing peer choice", () => {
    expect(appSrc).toMatch(/<LandingPage/);
    expect(appSrc).toMatch(/onEnterExplore=\{enterExplore\}/);
    expect(appSrc).not.toMatch(/onEnterGuided=\{enterGuided\}/);
    expect(appSrc).toMatch(/onOpenHowItWorks=\{openHowItWorks\}/);
    expect(appSrc).toMatch(/const enterGuided/);
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*createGuidedLab\(guidedExperimentId\)/s,
    );
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*createExploreLab/s,
    );
    expect(appSrc).toMatch(/enterGuided[\s\S]*setAppSurface\("laboratory"\)/s);
    expect(appSrc).toMatch(/enterExplore[\s\S]*setAppSurface\("laboratory"\)/s);
  });

  it("uses the shared Explore header and retains Guided identity", () => {
    const laboratoryHeader = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(laboratoryHeader).toMatch(/ModeIdentity/);
    expect(laboratoryHeader).toMatch(/mode="Guided"/);
    expect(laboratoryHeader).toMatch(/<h1 className="explore-shell__title">Explore/);
    expect(appSrc).toMatch(/<GlobalHeader section="explore" onHome=\{returnToLanding\}/);
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
    expect(laboratoryHeader).not.toMatch(/ExploreEnvironmentSelector/);
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
