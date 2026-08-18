import { describe, expect, it } from "vitest";
import {
  GUIDED_EXPERIMENTS,
  GuidedExperimentId,
  guidedExperimentById,
  type GuidedExperimentDefinition,
} from "./GuidedExperiment.js";
import catalogSrc from "./GuidedExperiment.ts?raw";
import pedagogySrc from "../app/TracerPedagogy.ts?raw";
import appSrc from "../app/App.tsx?raw";

const CANONICAL_IDS = [
  GuidedExperimentId.InflowToUpperOutflow,
  GuidedExperimentId.DowndraftPathToGround,
  GuidedExperimentId.NearGroundOutflow,
] as const;

const RESEARCH_IDENTITY = /\bS1\b|\bS2\b|\bD1\b|\bNG1\b/;
const PEDAGOGY_IDENTITY =
  /StoryPathlines|DownwardPathline|NearGroundOutflowPathline|DiagnosticProbes/;

describe("GuidedExperiment catalog", () => {
  it("exposes exactly three public ids in canonical order", () => {
    expect(GUIDED_EXPERIMENTS.map((entry) => entry.id)).toEqual([
      "inflow-to-upper-outflow",
      "downdraft-path-to-ground",
      "near-ground-outflow",
    ]);
    expect(GUIDED_EXPERIMENTS).toHaveLength(3);
    expect(new Set(GUIDED_EXPERIMENTS.map((entry) => entry.id)).size).toBe(3);
  });

  it("stores kebab-case URL-safe ids, not indexes or pedagogy values", () => {
    expect(GuidedExperimentId.InflowToUpperOutflow).toBe(
      "inflow-to-upper-outflow",
    );
    expect(GuidedExperimentId.DowndraftPathToGround).toBe(
      "downdraft-path-to-ground",
    );
    expect(GuidedExperimentId.NearGroundOutflow).toBe("near-ground-outflow");
    for (const id of CANONICAL_IDS) {
      expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(id).not.toMatch(/^\d+$/);
    }
    expect(Object.values(GuidedExperimentId)).not.toContain(
      "DiagnosticProbes",
    );
    expect(Object.values(GuidedExperimentId)).not.toContain(
      "StoryPathlines",
    );
  });

  it("returns the matching definition for each public id", () => {
    for (const [index, id] of CANONICAL_IDS.entries()) {
      expect(guidedExperimentById(id)).toBe(GUIDED_EXPERIMENTS[index]);
      expect(guidedExperimentById(id).id).toBe(id);
    }
  });

  it("requires non-empty title, observe, demonstrates, and doesNotMean", () => {
    for (const definition of GUIDED_EXPERIMENTS) {
      expect(definition.title.trim().length).toBeGreaterThan(0);
      expect(definition.observe.trim().length).toBeGreaterThan(0);
      expect(definition.demonstrates.trim().length).toBeGreaterThan(0);
      expect(definition.doesNotMean.trim().length).toBeGreaterThan(0);
    }
    expect(guidedExperimentById(GuidedExperimentId.InflowToUpperOutflow).title).toBe(
      "Inflow to upper outflow",
    );
    expect(
      guidedExperimentById(GuidedExperimentId.DowndraftPathToGround).title,
    ).toBe("Downdraft path to the ground");
    expect(guidedExperimentById(GuidedExperimentId.NearGroundOutflow).title).toBe(
      "Near-ground outflow",
    );
  });

  it("does not leak research ICs or TracerPedagogy into public identity or copy", () => {
    expect(catalogSrc).not.toMatch(/TracerPedagogy/);
    expect(catalogSrc).not.toMatch(PEDAGOGY_IDENTITY);
    expect(catalogSrc).not.toMatch(RESEARCH_IDENTITY);
    for (const definition of GUIDED_EXPERIMENTS) {
      const surface = [
        definition.id,
        definition.title,
        definition.observe,
        definition.demonstrates,
        definition.doesNotMean,
      ].join("\n");
      expect(surface).not.toMatch(RESEARCH_IDENTITY);
      expect(surface).not.toMatch(PEDAGOGY_IDENTITY);
    }
  });

  it("does not carry pedagogy, seeds, completion, or physics on the public record", () => {
    for (const definition of GUIDED_EXPERIMENTS) {
      const record: GuidedExperimentDefinition = definition;
      expect(record).toEqual({
        id: definition.id,
        title: definition.title,
        observe: definition.observe,
        demonstrates: definition.demonstrates,
        doesNotMean: definition.doesNotMean,
      });
      expect(definition).not.toHaveProperty("pedagogy");
      expect(definition).not.toHaveProperty("seeds");
      expect(definition).not.toHaveProperty("completion");
      expect(definition).not.toHaveProperty("field");
      expect(definition).not.toHaveProperty("velocityField");
    }
  });

  it("is importable without TracerPedagogy and is not wired into live App yet", () => {
    expect(catalogSrc).not.toMatch(/from ["'].*TracerPedagogy/);
    expect(pedagogySrc).not.toMatch(/GuidedExperiment/);
    expect(appSrc).not.toMatch(/GuidedExperimentId/);
    expect(appSrc).not.toMatch(/GUIDED_EXPERIMENTS/);
    expect(appSrc).not.toMatch(/guidedExperimentById/);
    expect(appSrc).toMatch(/LIVE_DEMO_TRACER_PEDAGOGY/);
  });
});
