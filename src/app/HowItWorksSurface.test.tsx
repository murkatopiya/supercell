import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HowItWorksAffordance } from "./HowItWorksAffordance.js";
import { HowItWorksSurface } from "./HowItWorksSurface.js";
import {
  HOW_IT_WORKS_ANALYSIS,
  HOW_IT_WORKS_BOUNDARY,
  HOW_IT_WORKS_COLOR_SCALE,
  HOW_IT_WORKS_EXPLORE_WORKFLOW,
  HOW_IT_WORKS_GUIDED_RELEASES,
  HOW_IT_WORKS_HISTORICAL_SAMPLE,
  HOW_IT_WORKS_PASSIVE,
  HOW_IT_WORKS_SOURCE,
  HOW_IT_WORKS_SOURCE_ADVECTS_ANALYSIS_EXPLAINS,
  HOW_IT_WORKS_STORM_MOTION,
  HOW_IT_WORKS_STORM_MOTION_RESET,
  HOW_IT_WORKS_T1_SATURATION_DISPLAY,
  HOW_IT_WORKS_WHAT_IF,
} from "./howItWorksContent.js";
import { T1_COLOR_SCALE_V1_SATURATION } from "../data/escHrTimeAnalysis/t1ColorScaleV1.js";
import surfaceSrc from "./HowItWorksSurface.tsx?raw";

const returnFocusRef = { current: null };

function helpMarkup(context: "landing" | "guided" | "explore") {
  return renderToStaticMarkup(
    <HowItWorksSurface
      open
      context={context}
      onClose={() => {}}
      returnFocusRef={returnFocusRef}
    />,
  );
}

describe("HowItWorksSurface", () => {
  it("uses dialog semantics, Close, Escape, and isolates pointer events", () => {
    const html = helpMarkup("landing");
    expect(html).toContain("role=\"dialog\"");
    expect(html).toContain("aria-modal=\"true\"");
    expect(html).toContain("aria-labelledby=\"how-it-works-title\"");
    expect(html).toContain("Close");
    expect(html).toContain("What is Supercell Explorer?");
    expect(html).toContain("Choose an environment and storm motion");
    expect(html).toContain("Release a tracer");
    expect(html).toContain("Read the recorded trajectory");
    expect(html).toContain("Understand the color");
    expect(html).toContain("Click a recorded trajectory point");
    expect(html).toContain("Explain T1 geometrically");
    expect(html).toContain("Inspect the calculation");
    expect(html).toContain("Use what-if geometry");
    expect(html).toContain("Source vs Analysis");
    expect(html).toContain("Scientific boundary");
    expect(surfaceSrc).toMatch(/event\.key !== "Escape"/);
    expect(surfaceSrc).toMatch(/event\.stopPropagation\(\)/);
    expect(surfaceSrc).toMatch(/onClick=\{\(\) => onCloseRef\.current\(\)\}/);
    expect(surfaceSrc).toMatch(/onPointerDown=\{\(event\) => event\.stopPropagation\(\)\}/);
    expect(surfaceSrc).toMatch(/closeButtonRef\.current\?\.focus\(\)/);
    expect(surfaceSrc).toMatch(/returnFocusRef\.current\?\.focus\(\)/);
    expect(surfaceSrc).toMatch(/addEventListener\("keydown", onKeyDown, true\)/);
    expect(renderToStaticMarkup(
      <HowItWorksSurface
        open={false}
        context="landing"
        onClose={() => {}}
        returnFocusRef={returnFocusRef}
      />,
    )).toBe("");
  });

  it("explains the current trajectory and Analysis T1 workflow", () => {
    const html = helpMarkup("landing");
    expect(html).toContain("vertical-tilting diagnostic");
    expect(html).toContain("When an Analysis representation is available");
    expect(html).toContain("supported parts of the recorded trajectory");
    expect(html).toContain("Expand Environment &amp; storm motion under Storm-relative laboratory");
    expect(html).toContain(HOW_IT_WORKS_STORM_MOTION);
    expect(html).toContain(HOW_IT_WORKS_STORM_MOTION_RESET);
    expect(html).toContain("not measured motion of the corresponding real storm");
    expect(html).toContain("updates the storm-relative hodograph and environmental advection");
    expect(html).toContain("Reset restarts the current experiment with that C");
    expect(html).toContain("fixed symmetric scale");
    expect(html).toContain(HOW_IT_WORKS_T1_SATURATION_DISPLAY);
    expect(html).toContain(HOW_IT_WORKS_COLOR_SCALE);
    expect(html).toContain("Warm colors mean positive T1");
    expect(html).toContain("not mapped to zero");
    expect(html).toContain(HOW_IT_WORKS_HISTORICAL_SAMPLE);
    expect(html).toContain("exact recorded trajectory sample");
    expect(html).toContain("T1 = ω_h,env · ∇_h V_y,updraft");
    expect(html).toContain("two factors and their alignment");
    expect(T1_COLOR_SCALE_V1_SATURATION).toBeCloseTo(6.1e-5, 12);
  });

  it("keeps Source vs Analysis and what-if wording scientifically honest", () => {
    const html = helpMarkup("landing");
    expect(html).toContain(HOW_IT_WORKS_SOURCE);
    expect(html).toContain(HOW_IT_WORKS_ANALYSIS);
    expect(html).toContain(HOW_IT_WORKS_SOURCE_ADVECTS_ANALYSIS_EXPLAINS);
    expect(html).toContain("does not advect tracers");
    expect(html).toContain(HOW_IT_WORKS_WHAT_IF);
    expect(html).toContain("Laboratory state remains unchanged");
    expect(html).toContain("Analysis-derived environmental ω_h fixed");
    expect(html).toContain(HOW_IT_WORKS_BOUNDARY);
    expect(html).toContain("not a weather forecast");
    expect(html).toContain("not parcel spin-up");
    expect(html).not.toContain("Guided and Explore");
  });

  it("adapts tracer-release copy to landing, Guided, and Explore", () => {
    const landing = helpMarkup("landing");
    const guided = helpMarkup("guided");
    const explore = helpMarkup("explore");
    expect(landing).toContain(HOW_IT_WORKS_EXPLORE_WORKFLOW);
    expect(landing).toContain(HOW_IT_WORKS_HISTORICAL_SAMPLE);
    expect(landing).toContain(HOW_IT_WORKS_WHAT_IF);
    expect(landing).not.toContain(HOW_IT_WORKS_GUIDED_RELEASES);
    expect(explore).toContain(HOW_IT_WORKS_EXPLORE_WORKFLOW);
    expect(explore).not.toContain(HOW_IT_WORKS_GUIDED_RELEASES);
    expect(guided).toContain(HOW_IT_WORKS_GUIDED_RELEASES);
    expect(guided).not.toContain(HOW_IT_WORKS_EXPLORE_WORKFLOW);
    expect(guided).not.toContain(HOW_IT_WORKS_HISTORICAL_SAMPLE);
    expect(guided).not.toContain(HOW_IT_WORKS_STORM_MOTION);
    expect(guided).toContain(HOW_IT_WORKS_SOURCE_ADVECTS_ANALYSIS_EXPLAINS);
    expect(HOW_IT_WORKS_PASSIVE).toContain("does not affect the airflow");
  });
});

describe("HowItWorksAffordance", () => {
  it("is a help control, not a mode toggle", () => {
    const html = renderToStaticMarkup(
      <HowItWorksAffordance expanded={false} onOpen={() => {}} />,
    );
    expect(html).toContain("How It Works");
    expect(html).toContain("aria-haspopup=\"dialog\"");
    expect(html).toContain("aria-expanded=\"false\"");
    expect(html).not.toContain("aria-pressed");
  });
});
