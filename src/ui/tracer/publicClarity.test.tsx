// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExplorePointReleaseControls } from "./ExplorePointReleaseControls.js";
import { ExploreEnvironmentSelector } from "../hodograph/ExploreEnvironmentSelector.js";
import { EXPLORE_ENVIRONMENT_IDENTITIES, EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED } from "../../explore/exploreEnvironmentIdentity.js";
import { exploreAnalysisColumn } from "../../app/exploreEnvironmentRepresentations.js";

describe("public clarity release and availability", () => {
  beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
  afterEach(() => vi.unstubAllGlobals());
  it("announces availability from the actual Analysis representation for every environment", () => {
    for (const identity of EXPLORE_ENVIRONMENT_IDENTITIES) {
      const available = exploreAnalysisColumn(identity) !== null;
      const html = renderToStaticMarkup(<ExploreEnvironmentSelector value={identity} onChange={() => {}} analysisAvailable={available} />);
      expect(html.includes("Unavailable does not mean zero")).toBe(!available);
      expect(html.includes("Observed:")).toBe(identity !== EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED);
      expect(html).toContain("Prescribed: storm-local flow and storm motion");
      expect(html).toContain("Not a reconstruction");
      expect(html).not.toContain("suitable");
      expect(html).not.toContain("COLUMN_UNAVAILABLE");
    }
  });

  it("announces only successful releases, gives a next step, and clears stale copy when no tracers remain", () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    const confirm = vi.fn(() => false);
    const render = (hasTracers: boolean, analysisAvailable = true, placementEnabled = true) => act(() => root.render(
      <ExplorePointReleaseControls altitudeM={1000} hasPending placementEnabled={placementEnabled}
        hasTracers={hasTracers} analysisAvailable={analysisAvailable}
        onAltitudeChange={() => {}} onPlacementEnabledChange={() => {}}
        onConfirm={confirm} onCancel={() => {}} />,
    ));
    try {
      render(true);
      act(() => container.querySelector<HTMLButtonElement>('[aria-label="Confirm release"]')!.click());
      expect(container.textContent).not.toContain("Tracer released.");
      confirm.mockReturnValue(true);
      act(() => container.querySelector<HTMLButtonElement>('[aria-label="Confirm release"]')!.click());
      expect(container.textContent).toContain("recorded trajectory point on its trail to inspect T1");
      render(true, true, false);
      expect(container.textContent).not.toContain("Placement stays enabled");
      render(true, false);
      expect(container.textContent).toContain("T1 and what-if are unavailable");
      render(false);
      expect(container.textContent).not.toContain("Tracer released.");
    } finally { act(() => root.unmount()); }
  });
});
