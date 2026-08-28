import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HowItWorksAffordance } from "./HowItWorksAffordance.js";
import { HowItWorksSurface } from "./HowItWorksSurface.js";
import {
  HOW_IT_WORKS_AIRFLOW_MARKS,
  HOW_IT_WORKS_ENVIRONMENT_NOT_MODE,
  HOW_IT_WORKS_EXPERIMENT_HEADING,
  HOW_IT_WORKS_EXPLORE_WORKFLOW,
  HOW_IT_WORKS_GUIDED_RELEASES,
  HOW_IT_WORKS_OVERLAYS,
  HOW_IT_WORKS_PASSIVE,
  HOW_IT_WORKS_SPEED,
  HOW_IT_WORKS_TAIL,
  HOW_IT_WORKS_VISUALIZATION_HEADING,
} from "./howItWorksContent.js";
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
    expect(html).toContain("Guided and Explore");
    expect(html).toContain("The 3D scene");
    expect(html).toContain("Hodograph");
    expect(html).toContain("Tracers");
    expect(html).toContain("Experiment vs visualization");
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

  it("states that tracers are passive and distinguishes experiment from visualization", () => {
    const html = helpMarkup("landing");
    expect(html).toContain(HOW_IT_WORKS_PASSIVE);
    expect(html).toContain(HOW_IT_WORKS_AIRFLOW_MARKS);
    expect(html).toContain(HOW_IT_WORKS_OVERLAYS);
    expect(html).toContain(HOW_IT_WORKS_EXPERIMENT_HEADING);
    expect(html).toContain(HOW_IT_WORKS_VISUALIZATION_HEADING);
    expect(html).toContain(HOW_IT_WORKS_SPEED);
    expect(html).toContain(HOW_IT_WORKS_TAIL);
    expect(html).toContain(HOW_IT_WORKS_ENVIRONMENT_NOT_MODE);
    expect(html).toContain("not an airflow streamline");
    expect(html).not.toContain("the tail is an airflow streamline");
  });

  it("adapts tracer-release copy to landing, Guided, and Explore", () => {
    const landing = helpMarkup("landing");
    const guided = helpMarkup("guided");
    const explore = helpMarkup("explore");
    expect(landing).toContain(HOW_IT_WORKS_GUIDED_RELEASES);
    expect(landing).toContain(HOW_IT_WORKS_EXPLORE_WORKFLOW);
    expect(guided).toContain(HOW_IT_WORKS_GUIDED_RELEASES);
    expect(guided).not.toContain(HOW_IT_WORKS_EXPLORE_WORKFLOW);
    expect(explore).toContain(HOW_IT_WORKS_EXPLORE_WORKFLOW);
    expect(explore).not.toContain(HOW_IT_WORKS_GUIDED_RELEASES);
    expect(guided).not.toContain("Clear tracers removes the current group.");
    expect(explore).toContain("Clear tracers removes the current group.");
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
