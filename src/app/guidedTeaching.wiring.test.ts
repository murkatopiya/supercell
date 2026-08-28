import { describe, expect, it } from "vitest";
import {
  GuidedExperimentId,
  guidedExperimentById,
} from "../guided/GuidedExperiment.js";
import { DEFAULT_GUIDED_EXPERIMENT_ID } from "./createGuidedLab.js";
import appSrc from "./App.tsx?raw";
import panelSrc from "../ui/tracer/GuidedExperimentPanel.tsx?raw";
import inspectorSrc from "../ui/tracer/TracerInspectorPanel.tsx?raw";

describe("App Guided teaching wiring", () => {
  it("shows the default inflow-to-upper-outflow definition from guidedExperimentId", () => {
    expect(DEFAULT_GUIDED_EXPERIMENT_ID).toBe(
      GuidedExperimentId.InflowToUpperOutflow,
    );
    expect(appSrc).toMatch(
      /guidedExperimentById\(guidedExperimentId\)/,
    );
    expect(appSrc).toMatch(
      /<GuidedExperimentPanel experiment=\{guidedExperiment\} \/>/,
    );
    expect(
      guidedExperimentById(DEFAULT_GUIDED_EXPERIMENT_ID).id,
    ).toBe(GuidedExperimentId.InflowToUpperOutflow);
  });

  it("derives teaching copy from guidedExperimentId; lab switch updates the same id", () => {
    expect(appSrc).not.toMatch(/selectedExperimentDefinition/);
    expect(appSrc).not.toMatch(/useState<GuidedExperimentDefinition/);
    expect(appSrc).toMatch(
      /lab\.kind === "guided"\s*\?[\s\S]*guidedExperimentById\(guidedExperimentId\)/s,
    );
    const switchBlock = appSrc.slice(
      appSrc.indexOf("const selectGuidedExperiment"),
      appSrc.indexOf("const explore ="),
    );
    expect(switchBlock).toMatch(/switchGuidedExperiment\(lab, nextId, selection\)/);
    expect(switchBlock).toMatch(/setGuidedExperimentId\(nextId\)/);
    expect(switchBlock).toMatch(/setLab\(nextLab\)/);
    expect(switchBlock).not.toMatch(/guidedExperimentById/);
    expect(appSrc).toMatch(
      /<GuidedExperimentPanel experiment=\{guidedExperiment\} \/>/,
    );
  });

  it("omits the teaching panel in Explore", () => {
    expect(appSrc).toMatch(
      /guidedExperiment !== null && \(\s*<GuidedExperimentPanel/s,
    );
    const enterExplore = appSrc.slice(
      appSrc.indexOf("const enterExplore"),
      appSrc.indexOf("const enterGuided"),
    );
    expect(enterExplore).toMatch(/createExploreLab/);
    expect(enterExplore).not.toMatch(/GuidedExperimentPanel/);
    const exploreShell = appSrc.slice(
      appSrc.indexOf("workbench--explore"),
      appSrc.indexOf("workbench--guided"),
    );
    expect(exploreShell).not.toMatch(/GuidedExperimentSelector/);
    expect(exploreShell).not.toMatch(/GuidedExperimentPanel/);
  });

  it("returns to the last experiment and its teaching copy after Explore", () => {
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*createGuidedLab\(guidedExperimentId\)/s,
    );
    const enterExplore = appSrc.slice(
      appSrc.indexOf("const enterExplore"),
      appSrc.indexOf("const enterGuided"),
    );
    expect(enterExplore).not.toMatch(/setGuidedExperimentId/);
    expect(appSrc).toMatch(/guidedExperimentById\(guidedExperimentId\)/);
  });

  it("keeps teaching copy independent of tracer selection", () => {
    const laboratory = appSrc.slice(
      appSrc.indexOf("workbench__column--laboratory"),
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(laboratory).toMatch(/GuidedExperimentPanel/);
    expect(laboratory).toMatch(/tracerViewport/);
    const panelRender = laboratory.slice(
      laboratory.indexOf("guidedExperiment !== null"),
      laboratory.indexOf("{tracerViewport}"),
    );
    expect(panelRender).not.toMatch(/selectedTracerId/);
    expect(panelRender).not.toMatch(/inspection/);
    expect(appSrc).toMatch(/selectedTracerId=\{selectedTracerId\}/);
  });

  it("leaves the shared Inspector contract unchanged", () => {
    expect(appSrc).toMatch(
      /<TracerInspectorPanel\s+inspection=\{inspection\}\s+mode=\{inspectionMode\}\s+\/>/,
    );
    expect(appSrc).not.toMatch(/GuidedTracerInspector/);
    expect(inspectorSrc).not.toMatch(/GuidedExperimentDefinition/);
    expect(inspectorSrc).not.toMatch(/doesNotMean/);
    expect(inspectorSrc).not.toMatch(/GuidedExperimentPanel/);
    expect(panelSrc).not.toMatch(/TracerInspection/);
    expect(panelSrc).not.toMatch(/inspection/);
  });

  it("places teaching copy in the laboratory column, not the Inspector column", () => {
    const laboratory = appSrc.slice(
      appSrc.indexOf("workbench__column--laboratory"),
      appSrc.indexOf("workbench__column--inspector"),
    );
    const inspector = appSrc.slice(
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(laboratory).toMatch(/GuidedExperimentPanel/);
    expect(laboratory).not.toMatch(/TracerInspectorPanel/);
    expect(inspector).toMatch(/TracerInspectorPanel/);
    expect(inspector).not.toMatch(/GuidedExperimentPanel/);
    expect(laboratory.indexOf("GuidedExperimentPanel")).toBeLessThan(
      laboratory.indexOf("tracerViewport"),
    );
  });
});
