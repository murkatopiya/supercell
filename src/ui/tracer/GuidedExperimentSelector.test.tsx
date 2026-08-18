import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  GUIDED_EXPERIMENTS,
  GuidedExperimentId,
} from "../../guided/GuidedExperiment.js";
import { GuidedExperimentSelector } from "./GuidedExperimentSelector.js";
import selectorSrc from "./GuidedExperimentSelector.tsx?raw";
import appSrc from "../../app/App.tsx?raw";

describe("GuidedExperimentSelector", () => {
  it("renders exactly the three public catalog titles and selected id", () => {
    const markup = renderToStaticMarkup(
      <GuidedExperimentSelector
        value={GuidedExperimentId.DowndraftPathToGround}
        onChange={() => {}}
      />,
    );
    expect(markup).toContain("Experiment");
    expect(markup).toContain(`value="${GuidedExperimentId.DowndraftPathToGround}"`);
    for (const entry of GUIDED_EXPERIMENTS) {
      expect(markup).toContain(`value="${entry.id}"`);
      expect(markup).toContain(entry.title);
    }
    expect(markup).not.toContain("StoryPathlines");
    expect(markup).not.toContain("DownwardPathline");
    expect(markup).not.toContain("NearGroundOutflowPathline");
    expect(markup).not.toContain("DiagnosticProbes");
    expect(markup).not.toContain("S1");
    expect(markup).not.toContain("NG1");
    expect(markup.match(/<option /g)).toHaveLength(3);
  });

  it("is a Guided-only runtime control wired to experiment switch", () => {
    expect(selectorSrc).toMatch(/GUIDED_EXPERIMENTS\.map/);
    expect(selectorSrc).not.toMatch(/TracerPedagogy/);
    expect(selectorSrc).not.toMatch(/observe/);
    expect(selectorSrc).not.toMatch(/demonstrates/);
    expect(selectorSrc).not.toMatch(/doesNotMean/);
    expect(appSrc).toMatch(/lab\.kind === "guided" && \(\s*<GuidedExperimentSelector/s);
    expect(appSrc).toMatch(/onChange=\{selectGuidedExperiment\}/);
    expect(appSrc).not.toMatch(/observe/);
    expect(appSrc).not.toMatch(/doesNotMean/);
  });
});
