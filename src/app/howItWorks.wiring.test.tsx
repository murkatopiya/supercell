import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App.js";
import appSrc from "./App.tsx?raw";
import landingSrc from "./LandingPage.tsx?raw";
import surfaceSrc from "./HowItWorksSurface.tsx?raw";

/**
 * Slice 6 — How It Works / onboarding.
 * docs/ui/12-how-it-works-and-onboarding.md
 */
describe("How It Works Slice 6 wiring", () => {
  it("activates How It Works on landing without choosing a mode", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("app--landing");
    expect(html).toContain("How It Works");
    expect(html).not.toContain("disabled");
    expect(html).not.toContain("role=\"dialog\"");
    expect(html).not.toContain("aria-label=\"Explore laboratory\"");
    expect(html).not.toContain("aria-label=\"Guided laboratory\"");
    expect(landingSrc).toMatch(/onOpenHowItWorks/);
    expect(landingSrc).not.toContain("disabled");
    expect(appSrc).toMatch(/onOpenHowItWorks=\{openHowItWorks\}/);
    expect(appSrc).toMatch(
      /const \[howItWorksOpen, setHowItWorksOpen\] = useState\(false\)/,
    );
  });

  it("opens from landing and laboratory chrome without constructing a new lab", () => {
    const openFn = appSrc.slice(
      appSrc.indexOf("const openHowItWorks"),
      appSrc.indexOf("const closeHowItWorks"),
    );
    expect(openFn).toMatch(/setHowItWorksOpen\(true\)/);
    expect(openFn).not.toMatch(/setLab/);
    expect(openFn).not.toMatch(/setAppSurface/);
    expect(openFn).not.toMatch(/enterGuided/);
    expect(openFn).not.toMatch(/enterExplore/);
    expect(openFn).not.toMatch(/createGuidedLab/);
    expect(openFn).not.toMatch(/createExploreLab/);
    expect(openFn).not.toMatch(/setPaused/);
    expect(openFn).not.toMatch(/setExploreEnvironmentIdentity/);
    expect(openFn).not.toMatch(/selection\.clear/);
    expect(openFn).not.toMatch(/setSelectedTracerId/);
    expect(openFn).not.toMatch(/setHodographPanelGeometry/);
    expect(openFn).not.toMatch(/resetView/);

    const closeFn = appSrc.slice(
      appSrc.indexOf("const closeHowItWorks"),
      appSrc.indexOf("const howItWorksContext"),
    );
    expect(closeFn).toMatch(/setHowItWorksOpen\(false\)/);
    expect(closeFn).not.toMatch(/setLab/);
    expect(closeFn).not.toMatch(/setAppSurface/);
    expect(closeFn).not.toMatch(/returnToLanding/);
    expect(closeFn).not.toMatch(/setPaused/);
    expect(closeFn).not.toMatch(/selection\.clear/);
    expect(closeFn).not.toMatch(/setExploreEnvironmentIdentity/);
  });

  it("places laboratory help in global chrome, not Runtime / Environment / SceneToolbar / Inspector", () => {
    const header = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(header).toMatch(/HowItWorksAffordance/);
    expect(header).toMatch(/EnvironmentAffordance/);
    expect(header).toMatch(/ModeIdentity/);
    expect(header).not.toMatch(/aria-pressed=\{lab\.kind/);

    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).not.toMatch(/HowItWorksAffordance/);
    expect(controls).not.toMatch(/HowItWorksSurface/);

    const sceneToolbarExplore = appSrc.slice(
      appSrc.indexOf("<SceneToolbar>"),
      appSrc.indexOf("workbench__hodograph-host"),
    );
    expect(sceneToolbarExplore).not.toMatch(/HowItWorksAffordance/);

    const inspector = appSrc.slice(
      appSrc.indexOf("workbench__column--observation"),
      appSrc.indexOf("workbench--guided"),
    );
    expect(inspector).not.toMatch(/HowItWorksAffordance/);
  });

  it("keeps How It Works outside the laboratory viewport and above the hodograph", () => {
    expect(appSrc).toMatch(/\{howItWorksSurface\}/);
    expect(appSrc).toMatch(/<\/main>\s*\{howItWorksSurface\}/s);
    expect(surfaceSrc).toMatch(/className="how-it-works"/);
    expect(surfaceSrc).toMatch(/position:fixed; inset:0; z-index:80/);
    expect(surfaceSrc).toMatch(/onPointerDown=\{\(event\) => event\.stopPropagation\(\)\}/);
  });

  it("temporarily suspends viewport advancement without writing user paused", () => {
    expect(appSrc).toMatch(/paused=\{paused \|\| howItWorksOpen\}/);
    expect(appSrc).toMatch(/<TracerRuntimeControls[\s\S]*paused=\{paused\}/s);
    expect(appSrc).not.toMatch(/setPaused\(true\)/);
    expect(appSrc).not.toMatch(/setPaused\(howItWorksOpen/);
    expect(appSrc).toMatch(/onPausedChange=\{setPaused\}/);
    const openFn = appSrc.slice(
      appSrc.indexOf("const openHowItWorks"),
      appSrc.indexOf("const closeHowItWorks"),
    );
    const closeFn = appSrc.slice(
      appSrc.indexOf("const closeHowItWorks"),
      appSrc.indexOf("const howItWorksContext"),
    );
    expect(openFn).not.toMatch(/setPaused/);
    expect(closeFn).not.toMatch(/setPaused/);
  });
});
