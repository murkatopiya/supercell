import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_OPTIONS,
  GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
} from "../../explore/exploreEnvironmentIdentity.js";
import { ExploreEnvironmentSelector } from "./ExploreEnvironmentSelector.js";
import selectorSrc from "./ExploreEnvironmentSelector.tsx?raw";
import appSrc from "../../app/App.tsx?raw";

describe("ExploreEnvironmentSelector", () => {
  it("renders Environment label, Goshen default, and each identity once", () => {
    const html = renderToStaticMarkup(
      <ExploreEnvironmentSelector
        value={DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY}
        onChange={() => {}}
      />,
    );
    expect(html).toContain("Environment");
    expect(html).toContain('id="explore-environment-selector"');
    expect(html).toContain('for="explore-environment-selector"');
    expect(html).toContain(
      `value="${EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED}"`,
    );
    expect(html).toContain(GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL);
    expect(html.match(/<option /g)).toHaveLength(
      EXPLORE_ENVIRONMENT_OPTIONS.length,
    );
    for (const option of EXPLORE_ENVIRONMENT_OPTIONS) {
      expect(html).toContain(`value="${option.identity}"`);
      expect(html).toContain(option.label);
      expect(
        html.match(new RegExp(`<option[^>]*value="${option.identity}"`, "g")),
      ).toHaveLength(1);
    }
  });

  it("is an Explore header control wired to the existing environment switch", () => {
    expect(selectorSrc).toMatch(/EXPLORE_ENVIRONMENT_OPTIONS\.map/);
    expect(selectorSrc).toMatch(/isExploreEnvironmentIdentity/);
    expect(selectorSrc).not.toMatch(/type="radio"/);
    const header = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(header).toMatch(/ExploreEnvironmentSelector/);
    expect(header).toMatch(/onChange=\{selectExploreEnvironment\}/);
    expect(header).toMatch(/value=\{exploreEnvironmentIdentity\}/);
    expect(appSrc).toMatch(
      /selectExploreEnvironment[\s\S]*createExploreLab\(\s*sceneSlotsRef\.current!,\s*next/s,
    );
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/ExploreEnvironmentSelector/);
  });
});
