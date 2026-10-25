import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { GlossaryAffordance } from "./GlossaryAffordance.js";
import { GlossarySurface } from "./GlossarySurface.js";
import {
  EOL_SOUNDING_DATASET_DOI,
  EOL_SOUNDING_DATASET_ID,
  GLOSSARY_ANALYSIS,
  GLOSSARY_ANALYSIS_OVERLAY,
  GLOSSARY_ANALYSIS_T1,
  GLOSSARY_ANALYSIS_UNAVAILABLE,
  GLOSSARY_ATTRIBUTION_LEAD,
  GLOSSARY_BOUNDARY,
  GLOSSARY_COLUMN_UNAVAILABLE,
  GLOSSARY_EOL_ATTRIBUTION,
  GLOSSARY_FULL,
  GLOSSARY_HISTORICAL_SAMPLE,
  GLOSSARY_IGRA_ATTRIBUTION,
  GLOSSARY_OCCUPANCY_TRAIL,
  GLOSSARY_OCCUPANCY_COLOR_CALLOUT,
  GLOSSARY_NAV,
  GLOSSARY_OOD,
  GLOSSARY_PASSIVE_TRACER,
  GLOSSARY_SOURCE,
  GLOSSARY_SOURCE_ADVECTS_ANALYSIS_EXPLAINS,
  GLOSSARY_T1_EQUATION,
  GLOSSARY_T1_EQUATION_COS,
  GLOSSARY_TITLE,
  GLOSSARY_V_TOTAL,
  GLOSSARY_V_TOTAL_EQUATION,
  GLOSSARY_VELOCITY_CONTRIBUTIONS,
  GLOSSARY_VELOCITY_WARNING,
  GLOSSARY_WHAT_IF,
  glossaryTermDefinition,
  IGRA_DSI,
  IGRA_STATION_ID,
} from "./glossaryContent.js";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "./composeDemoTracerSimulation.js";
import { labelForContribution } from "../ui/tracer/tracerContributionLabels.js";
import surfaceSrc from "./GlossarySurface.tsx?raw";
import glossarySrc from "./glossaryContent.ts?raw";

const returnFocusRef = { current: null };

function glossaryMarkup() {
  return renderToStaticMarkup(
    <GlossarySurface
      open
      onClose={() => {}}
      returnFocusRef={returnFocusRef}
    />,
  );
}

describe("GlossarySurface", () => {
  it("uses dialog semantics, Close, Escape, and isolates pointer events", () => {
    const html = glossaryMarkup();
    expect(html).toContain("role=\"dialog\"");
    expect(html).toContain("aria-modal=\"true\"");
    expect(html).toContain("aria-labelledby=\"glossary-title\"");
    expect(html).toContain(GLOSSARY_TITLE);
    expect(html).toContain("Close");
    expect(surfaceSrc).toContain("useResourceDialog(open, onClose, returnFocusRef, closeButtonRef)");
    expect(
      renderToStaticMarkup(
        <GlossarySurface
          open={false}
          onClose={() => {}}
          returnFocusRef={returnFocusRef}
        />,
      ),
    ).toBe("");
  });

  it("lists exactly the production V_total contributions in operand order", () => {
    expect(GLOSSARY_VELOCITY_CONTRIBUTIONS.map((item) => item.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    const html = glossaryMarkup();
    expect(html).toContain(GLOSSARY_V_TOTAL);
    expect(GLOSSARY_V_TOTAL_EQUATION).toBe(
      "V_total = V_environment + V_updraft + V_rotation + V_lower-inflow + V_upper-outflow + V_downdraft + V_near-ground-outflow",
    );
    expect(html).toContain("V_total =");
    expect(html).toContain("V_environment");
    expect(html).toContain("V_updraft");
    expect(html).toContain("V_rotation");
    expect(html).toContain("V_lower-inflow");
    expect(html).toContain("V_upper-outflow");
    expect(html).toContain("V_downdraft");
    expect(html).toContain("V_near-ground-outflow");
    expect(html).toContain(GLOSSARY_VELOCITY_WARNING);
    expect(html).toContain("glossary-callout");
    expect(html).toContain("<dl");
    for (const contribution of GLOSSARY_VELOCITY_CONTRIBUTIONS) {
      expect(contribution.term).toBe(labelForContribution(contribution.key));
      expect(html).toContain(contribution.term);
      expect(html).toContain(contribution.definition);
    }
    expect(GLOSSARY_VELOCITY_WARNING).toContain("not seven independently observed");
  });

  it("distinguishes Source from Analysis and does not treat unavailable as zero", () => {
    const html = glossaryMarkup();
    expect(html).toContain(GLOSSARY_SOURCE);
    expect(html).toContain(GLOSSARY_ANALYSIS);
    expect(html).toContain(GLOSSARY_SOURCE_ADVECTS_ANALYSIS_EXPLAINS);
    expect(html).toContain("does not advect tracers");
    expect(html).toContain("not a broken Source environment");
    expect(html).not.toContain("Moore is broken");
  });

  it("defines trajectory diagnostics without vorticity acquisition or spin-up", () => {
    const html = glossaryMarkup();
    expect(html).toContain(GLOSSARY_PASSIVE_TRACER);
    expect(html).toContain("does not acquire or generate vorticity");
    expect(html).toContain(GLOSSARY_HISTORICAL_SAMPLE);
    expect(html).toContain("exact recorded trajectory sample");
    expect(html).toContain("not an interpolated point");
    expect(html).toContain(GLOSSARY_ANALYSIS_T1);
    expect(html).toContain(GLOSSARY_T1_EQUATION);
    expect(html).toContain(GLOSSARY_T1_EQUATION_COS);
    expect(html).toContain("not parcel spin-up");
    expect(html).not.toContain("acquires vorticity");
  });

  it("defines visible support states without mapping OOD to zero", () => {
    const html = glossaryMarkup();
    for (const entry of [
      GLOSSARY_FULL,
      GLOSSARY_BOUNDARY,
      GLOSSARY_OOD,
      GLOSSARY_COLUMN_UNAVAILABLE,
    ]) {
      const { term, definition } = glossaryTermDefinition(entry);
      expect(html).toContain(term);
      expect(html).toContain(definition);
    }
    expect(html).toContain("FULL_SUPPORT");
    expect(html).toContain("BOUNDARY_CONDITIONED");
    expect(html).toContain("OUT_OF_DOMAIN");
    expect(html).toContain("not treated as zero");
    expect(html).toContain("COLUMN_UNAVAILABLE");
    expect(html).toContain("glossary-support");
  });

  it("separates occupancy color from Analysis T1 overlay", () => {
    const html = glossaryMarkup();
    expect(html).toContain(GLOSSARY_OCCUPANCY_TRAIL);
    expect(html).toContain(GLOSSARY_OCCUPANCY_COLOR_CALLOUT);
    expect(html).toContain("does not encode Analysis T1");
    expect(html).toContain("Occupancy red does not mean positive T1");
    expect(html).toContain(GLOSSARY_ANALYSIS_OVERLAY);
  });

  it("keeps what-if from mutating the laboratory or observed environment", () => {
    const html = glossaryMarkup();
    expect(html).toContain(GLOSSARY_WHAT_IF);
    expect(html).toContain("Laboratory state remains unchanged");
    expect(html).toContain("keeps environmental ω_h");
  });

  it("attributes sounding datasets separately from event/case links", () => {
    const html = glossaryMarkup();
    expect(html).toContain(GLOSSARY_ATTRIBUTION_LEAD);
    expect(html).toContain("not sounding-data citations");
    expect(html).toContain(GLOSSARY_EOL_ATTRIBUTION);
    expect(html).toContain(EOL_SOUNDING_DATASET_ID);
    expect(html).toContain(EOL_SOUNDING_DATASET_DOI);
    expect(html).toContain(GLOSSARY_IGRA_ATTRIBUTION);
    expect(html).toContain(IGRA_STATION_ID);
    expect(html).toContain(IGRA_DSI);
    expect(glossarySrc).not.toMatch(/weather\.gov/);
  });

  it("does not invent forecast, reconstruction, or Analysis-advection claims", () => {
    const html = glossaryMarkup();
    expect(html).not.toMatch(/forecast/i);
    expect(html).not.toMatch(/predict/i);
    expect(html).not.toMatch(/reconstruct/i);
    expect(html).not.toMatch(/replay/i);
    expect(html).not.toContain("Analysis advects");
    expect(html).not.toContain("T1 causes");
  });

  it("exposes in-dialog section navigation without search, tabs, or accordions", () => {
    const html = glossaryMarkup();
    expect(html).toContain("aria-label=\"Glossary sections\"");
    expect(html).toContain("Laboratory velocity");
    expect(html).toContain("Source and Analysis");
    expect(html).toContain("Trajectory diagnostics");
    expect(html).toContain("Support states");
    expect(html).toContain("Occupancy trail and Analysis T1 overlay");
    expect(html).toContain("Dataset attribution");
    expect(html).toContain("Source advects. Analysis explains.");
    for (const item of GLOSSARY_NAV) {
      expect(html).toContain(`href="#${item.id}"`);
      expect(html).toContain(`id="${item.id}"`);
      expect(html).toContain(item.label.replaceAll("&", "&amp;"));
    }
    expect(html).not.toMatch(/type="search"/);
    expect(html).not.toMatch(/<input/);
    expect(html).not.toContain("role=\"tablist\"");
    expect(html).not.toContain("accordion");
    expect(surfaceSrc).toMatch(/<dl/);
    expect(surfaceSrc).toMatch(/scrollGlossarySection/);
    expect(surfaceSrc).toMatch(/how-it-works__dialog--glossary/);
  });
});

describe("GlossaryAffordance", () => {
  it("is a help control, not a mode toggle", () => {
    const html = renderToStaticMarkup(
      <GlossaryAffordance expanded={false} onOpen={() => {}} />,
    );
    expect(html).toContain("Glossary");
    expect(html).toContain("aria-haspopup=\"dialog\"");
    expect(html).toContain("aria-expanded=\"false\"");
    expect(html).not.toContain("aria-pressed");
  });
});
