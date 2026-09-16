/** @vitest-environment happy-dom */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot } from "react-dom/client";
import { act, useState } from "react";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_OPTIONS,
  GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
  type ExploreEnvironmentIdentity,
} from "../../explore/exploreEnvironmentIdentity.js";
import { ExploreEnvironmentSelector, ExploreLaboratoryAbout, parseStormMotionDraft } from "./ExploreEnvironmentSelector.js";
import selectorSrc from "./ExploreEnvironmentSelector.tsx?raw";
import appSrc from "../../app/App.tsx?raw";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("ExploreEnvironmentSelector", () => {
  it("applies a signed C only on Apply and restores the prescribed C", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const applied: Array<{ eastward: number; northward: number }> = [];
    function Harness() {
      const [motion, setMotion] = useState({ eastward: 10, northward: 0 });
      return <ExploreEnvironmentSelector value={EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED}
        onChange={() => {}} stormMotion={motion}
        onApplyStormMotion={next => { applied.push(next); setMotion(next); }}
        onRestoreStormMotion={() => { const next = { eastward: 10, northward: 0 }; applied.push(next); setMotion(next); }} />;
    }
    try {
      act(() => root.render(<Harness />));
      const disclosure = host.querySelector<HTMLDetailsElement>("details")!;
      act(() => disclosure.querySelector("summary")!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
      const fields = host.querySelectorAll<HTMLInputElement>('input[type="number"]');
      const setField = (field: HTMLInputElement, value: string) => act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value);
        field.dispatchEvent(new Event("input", { bubbles: true }));
      });
      setField(fields[0]!, "-18");
      setField(fields[1]!, "6");
      expect(applied).toEqual([]);
      expect(disclosure.querySelector("summary")?.textContent).toContain("C (10, 0) m/s");
      act(() => Array.from(host.querySelectorAll("button")).find(button => button.textContent === "Apply C")!.click());
      expect(applied).toEqual([{ eastward: -18, northward: 6 }]);
      expect(disclosure.querySelector("summary")?.textContent).toContain("C (-18, 6) m/s");
      act(() => Array.from(host.querySelectorAll("button")).find(button => button.textContent === "Restore prescribed C")!.click());
      expect(applied.at(-1)).toEqual({ eastward: 10, northward: 0 });
      expect(disclosure.querySelector("summary")?.textContent).toContain("C (10, 0) m/s");
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });
  it("starts collapsed and keeps disclosure open while applied C and sounding change", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const render = (value: ExploreEnvironmentIdentity, eastward: number, northward: number) =>
      act(() => root.render(<ExploreEnvironmentSelector value={value} onChange={() => {}}
        stormMotion={{ eastward, northward }} onApplyStormMotion={() => {}} onRestoreStormMotion={() => {}} />));
    try {
      render(EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED, 10, 0);
      const disclosure = host.querySelector<HTMLDetailsElement>(".explore-environment-disclosure")!;
      expect(disclosure.open).toBe(false);
      expect(disclosure.querySelector("summary")?.textContent).toContain("Goshen · 2009 · C (10, 0) m/s");
      act(() => disclosure.querySelector("summary")!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
      expect(disclosure.open).toBe(true);
      render(EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED, 18, 6);
      expect(disclosure.open).toBe(true);
      expect(disclosure.querySelector("summary")?.textContent).toContain("C (18, 6) m/s");
      render(EXPLORE_ENVIRONMENT_OPTIONS[3]!.identity, -5, 2);
      expect(disclosure.open).toBe(true);
      expect(disclosure.querySelector("summary")?.textContent).toContain("Dumas · 2010 · C (-5, 2) m/s");
      expect(host.querySelector<HTMLInputElement>('input[type="number"]')?.value).toBe("-5");
      act(() => disclosure.querySelector("summary")!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
      expect(disclosure.open).toBe(false);
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });

  it("keeps laboratory caveats in a separate collapsed disclosure", () => {
    const html = renderToStaticMarkup(<ExploreLaboratoryAbout value={EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED} analysisAvailable />);
    expect(html).toContain("About this laboratory");
    expect(html).toContain("Not a reconstruction of a storm.");
    expect(html).toContain("tilting diagnostic (T1) available");
    expect(html).not.toContain("<details open");
  });
  it("rejects blank and nonfinite C drafts and labels applied laboratory C", () => {
    for (const pair of [["", "0"], [" ", "0"], ["NaN", "0"], ["Infinity", "0"], ["1e309", "0"], ["abc", "0"], ["0x10", "0"]])
      expect(parseStormMotionDraft(pair[0], pair[1])).toBeNull();
    expect(parseStormMotionDraft("13", "-4")).toEqual({ eastward: 13, northward: -4 });
    expect(parseStormMotionDraft("-7.5", "-2")).toEqual({ eastward: -7.5, northward: -2 });
    const html = renderToStaticMarkup(<ExploreEnvironmentSelector
      value={EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED} onChange={() => {}}
      stormMotion={{ eastward: 13, northward: -4 }} onApplyStormMotion={() => {}} onRestoreStormMotion={() => {}} />);
    expect(html).toContain("Storm motion C");
    expect(html).toContain("Apply C");
    expect(html).toContain("Restore prescribed C");
    expect(html).toContain("clears current tracers");
    expect(html).toContain('value="13"');
    expect(html).toContain('value="-4"');
    expect(html).toContain('class="storm-motion-control"');
    expect(html).toContain('class="ui-input"');
    expect(html).toContain('class="ui-button ui-button--primary"');
    expect(html).toContain('class="ui-button ui-button--subtle"');
    const prescribed = renderToStaticMarkup(<ExploreEnvironmentSelector
      value={EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED} onChange={() => {}}
      stormMotion={{ eastward: 10, northward: 0 }} onApplyStormMotion={() => {}} onRestoreStormMotion={() => {}} />);
    expect(prescribed.match(/disabled=""/g)).toHaveLength(2);
  });
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

  it("is an Explore left-column control wired to the existing environment switch", () => {
    expect(selectorSrc).toMatch(/EXPLORE_ENVIRONMENT_OPTIONS\.map/);
    expect(selectorSrc).toMatch(/isExploreEnvironmentIdentity/);
    expect(selectorSrc).not.toMatch(/type="radio"/);
    const header = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(header).not.toMatch(/ExploreEnvironmentSelector/);
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).toMatch(/Storm-relative laboratory/);
    expect(controls).toMatch(/ExploreEnvironmentSelector/);
    expect(controls).toMatch(/onChange=\{selectExploreEnvironment\}/);
    expect(controls).toMatch(/value=\{exploreEnvironmentIdentity\}/);
    expect(controls.indexOf("<ExploreEnvironmentSelector")).toBeLessThan(controls.indexOf('aria-label="Release"'));
    expect(controls.indexOf('aria-label="Release"')).toBeLessThan(controls.indexOf('aria-label="Runtime"'));
    expect(controls.indexOf('aria-label="Runtime"')).toBeLessThan(controls.indexOf("<ExploreLaboratoryAbout"));
    expect(appSrc).toMatch(
      /selectExploreEnvironment[\s\S]*createExploreLab\(\s*sceneSlotsRef\.current!,\s*next/s,
    );
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/ExploreEnvironmentSelector/);
  });
});
