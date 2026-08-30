import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App.js";
import appSrc from "./App.tsx?raw";
import landingSrc from "./LandingPage.tsx?raw";
import surfaceSrc from "./UserGuideSurface.tsx?raw";

describe("User Guide wiring", () => {
  it("exposes User Guide on landing and in laboratory header chrome", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("aria-label=\"User Guide\"");
    expect(landingSrc).toMatch(/onOpenUserGuide/);
    expect(appSrc).toMatch(/onOpenUserGuide=\{openUserGuide\}/);
    const header = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(header).toMatch(/UserGuideAffordance/);
    expect(header).toMatch(/HowItWorksAffordance/);
    expect(header).toMatch(/GlossaryAffordance/);
    expect(header).toMatch(/EnvironmentAffordance/);
    expect(header.indexOf("UserGuideAffordance")).toBeLessThan(
      header.indexOf("HowItWorksAffordance"),
    );
  });

  it("opens User Guide without constructing a lab and reuses How It Works overlay chrome", () => {
    const openFn = appSrc.slice(
      appSrc.indexOf("const openUserGuide"),
      appSrc.indexOf("const closeUserGuide"),
    );
    expect(openFn).toMatch(/setUserGuideOpen\(true\)/);
    expect(openFn).toMatch(/setHowItWorksOpen\(false\)/);
    expect(openFn).toMatch(/setGlossaryOpen\(false\)/);
    expect(openFn).not.toMatch(/setLab/);
    expect(openFn).not.toMatch(/enterExplore/);
    expect(openFn).not.toMatch(/createExploreLab/);
    expect(openFn).not.toMatch(/setPaused/);
    expect(appSrc).toMatch(/\{userGuideSurface\}/);
    expect(surfaceSrc).toMatch(/className="how-it-works"/);
    expect(surfaceSrc).toMatch(/position:fixed; inset:0; z-index:80/);
    expect(surfaceSrc).toMatch(/event\.key !== "Escape"/);
  });

  it("suspends the viewport while User Guide is open without writing user paused", () => {
    expect(appSrc).toMatch(
      /paused=\{paused \|\| howItWorksOpen \|\| glossaryOpen \|\| userGuideOpen\}/,
    );
    expect(appSrc).toMatch(/<TracerRuntimeControls[\s\S]*paused=\{paused\}/s);
    const openFn = appSrc.slice(
      appSrc.indexOf("const openUserGuide"),
      appSrc.indexOf("const closeUserGuide"),
    );
    expect(openFn).not.toMatch(/setPaused/);
  });

  it("keeps User Guide outside Runtime / Environment / SceneToolbar / Inspector", () => {
    const header = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(header).toMatch(/UserGuideAffordance/);

    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).not.toMatch(/UserGuideAffordance/);
    expect(controls).not.toMatch(/UserGuideSurface/);

    const sceneToolbarExplore = appSrc.slice(
      appSrc.indexOf("<SceneToolbar>"),
      appSrc.indexOf("workbench__hodograph-host"),
    );
    expect(sceneToolbarExplore).not.toMatch(/UserGuideAffordance/);
  });
});
