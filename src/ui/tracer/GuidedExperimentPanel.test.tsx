import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  GUIDED_EXPERIMENTS,
  GuidedExperimentId,
  guidedExperimentById,
} from "../../guided/GuidedExperiment.js";
import {
  GUIDED_LABORATORY_HONESTY,
  GuidedExperimentPanel,
} from "./GuidedExperimentPanel.js";
import panelSrc from "./GuidedExperimentPanel.tsx?raw";

const RESEARCH_IDENTITY = /\bS1\b|\bS2\b|\bD1\b|\bNG1\b/;
const PEDAGOGY_IDENTITY =
  /TracerPedagogy|StoryPathlines|DownwardPathline|NearGroundOutflowPathline|DiagnosticProbes/;

function renderedCopy(html: string): string {
  return html
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

describe("GuidedExperimentPanel", () => {
  it("renders title, observe, demonstrates, and doesNotMean from the definition", () => {
    const experiment = guidedExperimentById(
      GuidedExperimentId.DowndraftPathToGround,
    );
    const html = renderedCopy(
      renderToStaticMarkup(
        <GuidedExperimentPanel experiment={experiment} />,
      ),
    );
    expect(html).toContain(experiment.title);
    expect(html).toContain(experiment.observe);
    expect(html).toContain(experiment.demonstrates);
    expect(html).toContain(experiment.doesNotMean);
    expect(html).toContain("Observe");
    expect(html).toContain("Demonstrates");
    expect(html).toContain("Does not mean");
    expect(html).toContain(GUIDED_LABORATORY_HONESTY);
  });

  it("uses exact catalog strings for every public experiment", () => {
    for (const experiment of GUIDED_EXPERIMENTS) {
      const html = renderedCopy(
        renderToStaticMarkup(
          <GuidedExperimentPanel experiment={experiment} />,
        ),
      );
      expect(html).toContain(experiment.title);
      expect(html).toContain(experiment.observe);
      expect(html).toContain(experiment.demonstrates);
      expect(html).toContain(experiment.doesNotMean);
    }
    expect(panelSrc).not.toMatch(/if \(.*id ===/);
    expect(panelSrc).not.toMatch(/switch \(.*id/);
  });

  it("does not show internal research or pedagogy names", () => {
    for (const experiment of GUIDED_EXPERIMENTS) {
      const html = renderToStaticMarkup(
        <GuidedExperimentPanel experiment={experiment} />,
      );
      expect(html).not.toMatch(RESEARCH_IDENTITY);
      expect(html).not.toMatch(PEDAGOGY_IDENTITY);
    }
    expect(panelSrc).not.toMatch(PEDAGOGY_IDENTITY);
    expect(panelSrc).not.toMatch(RESEARCH_IDENTITY);
  });

  it("is presentational: definition in, no scientific runtime types", () => {
    expect(panelSrc).toMatch(/experiment: GuidedExperimentDefinition/);
    expect(panelSrc).not.toMatch(/Simulation/);
    expect(panelSrc).not.toMatch(/TracerInspection/);
    expect(panelSrc).not.toMatch(/VelocityField/);
    expect(panelSrc).not.toMatch(/ScenarioConfig/);
    expect(panelSrc).not.toMatch(/guidedExperimentById/);
    expect(panelSrc).not.toMatch(/useState/);
  });

  it("keeps the shared laboratory honesty line out of per-experiment catalog copy", () => {
    for (const experiment of GUIDED_EXPERIMENTS) {
      expect(experiment.observe).not.toContain(GUIDED_LABORATORY_HONESTY);
      expect(experiment.demonstrates).not.toContain(GUIDED_LABORATORY_HONESTY);
      expect(experiment.doesNotMean).not.toContain(GUIDED_LABORATORY_HONESTY);
    }
  });
});
