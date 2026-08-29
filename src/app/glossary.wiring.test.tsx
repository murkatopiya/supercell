import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App.js";
import appSrc from "./App.tsx?raw";
import landingSrc from "./LandingPage.tsx?raw";
import surfaceSrc from "./GlossarySurface.tsx?raw";
import readmeSrc from "../../README.md?raw";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
} from "../explore/exploreEnvironmentIdentity.js";
import { createExploreLab } from "./createExploreLab.js";
import {
  GOSHEN_2009_ANALYSIS_COLUMN,
  exploreEnvironmentRepresentations,
} from "./exploreEnvironmentRepresentations.js";
import { GOSHEN_2009_OBSERVED_RECORD } from "./goshenObservedEnvironment.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";

function fakeSlots(): ExploreSceneSlots {
  let tracerSlotCount = 0;
  return {
    get tracerSlotCount() {
      return tracerSlotCount;
    },
    addTracerSlot() {
      tracerSlotCount += 1;
    },
    removeLastTracerSlot() {
      if (tracerSlotCount > 0) {
        tracerSlotCount -= 1;
      }
    },
    clearTracerSlots() {
      tracerSlotCount = 0;
    },
    syncReleasePreview() {},
  };
}

describe("Glossary wiring", () => {
  it("exposes Glossary on landing and in Explore header chrome", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("aria-label=\"Glossary\"");
    expect(landingSrc).toMatch(/onOpenGlossary/);
    expect(appSrc).toMatch(/onOpenGlossary=\{openGlossary\}/);
    const header = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(header).toMatch(/GlossaryAffordance/);
    expect(header).toMatch(/HowItWorksAffordance/);
    expect(header).toMatch(/EnvironmentAffordance/);
    expect(header).not.toMatch(/ExploreEnvironmentSelector/);
  });

  it("opens Glossary without constructing a lab and reuses How It Works overlay chrome", () => {
    const openFn = appSrc.slice(
      appSrc.indexOf("const openGlossary"),
      appSrc.indexOf("const closeGlossary"),
    );
    expect(openFn).toMatch(/setGlossaryOpen\(true\)/);
    expect(openFn).not.toMatch(/setLab/);
    expect(openFn).not.toMatch(/enterExplore/);
    expect(openFn).not.toMatch(/createExploreLab/);
    expect(appSrc).toMatch(/\{glossarySurface\}/);
    expect(surfaceSrc).toMatch(/className="how-it-works"/);
    expect(surfaceSrc).toMatch(/event\.key !== "Escape"/);
  });

  it("suspends the viewport while Glossary is open without writing user paused", () => {
    expect(appSrc).toMatch(
      /paused=\{paused \|\| howItWorksOpen \|\| glossaryOpen\}/,
    );
    expect(appSrc).toMatch(/<TracerRuntimeControls[\s\S]*paused=\{paused\}/s);
    const openFn = appSrc.slice(
      appSrc.indexOf("const openGlossary"),
      appSrc.indexOf("const closeGlossary"),
    );
    expect(openFn).not.toMatch(/setPaused/);
  });
});

describe("Public Explore default environment", () => {
  it("enters Explore from Landing with Goshen Source and Goshen Analysis", () => {
    expect(DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY).toBe(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    expect(appSrc).toMatch(
      /useState<ExploreEnvironmentIdentity>\(\s*DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY/,
    );
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*createExploreLab\(\s*sceneSlotsRef\.current!,\s*exploreEnvironmentIdentity/s,
    );

    const lab = createExploreLab(fakeSlots());
    const representations = exploreEnvironmentRepresentations(
      DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
    );
    expect(lab.environmentIdentity).toBe(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    expect(lab.analysisColumn).toBe(GOSHEN_2009_ANALYSIS_COLUMN);
    expect(representations.sourceProfile).toBe(
      GOSHEN_2009_OBSERVED_RECORD.profile,
    );
    expect(lab.tiltingTendency.profile).toBe(
      GOSHEN_2009_OBSERVED_RECORD.profile,
    );
    expect(lab.analysisColumn?.provenance.sourceIdentity).toBe(
      GOSHEN_2009_OBSERVED_RECORD.provenance.sourceIdentity,
    );
  });

  it("records sounding-dataset attribution in README separately from event links", () => {
    expect(readmeSrc).toContain("10.5065/D6CC0Z0Q");
    expect(readmeSrc).toContain("114.114");
    expect(readmeSrc).toContain("USM00072357");
    expect(readmeSrc).toContain("DSI-6301");
    expect(readmeSrc).toContain("not the source of the sounding data");
  });
});
