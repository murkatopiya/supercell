/** @vitest-environment happy-dom */

import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ANALYSIS_QUERY_REPRESENTATION,
  NATIVE_CONTAINING_SEGMENT_METHOD,
} from "../../data/escHrTimeAnalysis/analysisQuery.js";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
  type AnalysisTiltingExplanationResult,
} from "../../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { createTrajectoryTiltingVerificationModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingVerification.js";
import { createTrajectoryTiltingWhatIfModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import type { EscHrTimeAnalysisProvenance } from "../../data/escHrTimeAnalysis/types.js";
import type { TracerInspection } from "../../interaction/TracerInspection.js";
import type { PointDiagnosticObservation } from "../../interaction/PointDiagnosticObservation.js";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "../../app/composeDemoTracerSimulation.js";
import {
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
} from "../../explore/exploreEnvironmentIdentity.js";
import { exploreAnalysisTiltingExplorerActive } from "../../explore/resolveExploreHistoricalAnalysisTilting.js";
import { CollapsibleObservationSection } from "./CollapsibleObservationSection.js";
import { PointDiagnosticsPanel } from "./PointDiagnosticsPanel.js";
import { TracerInspectorPanel } from "./TracerInspectorPanel.js";
import { TrajectoryTiltingVerificationPanel } from "./TrajectoryTiltingVerificationPanel.js";
import { TrajectoryTiltingWhatIfPanel } from "./TrajectoryTiltingWhatIfPanel.js";
import collapseSrc from "./CollapsibleObservationSection.tsx?raw";
import appSrc from "../../app/App.tsx?raw";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "collapse-test",
  samplingClass: "high-resolution-mobile-esc",
  transformId: "esc-hr-time-hamming-sinc-lowpass",
  transformVersion: "v1",
  domain: "TIME",
  cutoffWavelengthS: 40,
  sampleIntervalS: 1,
  tapCount: 81,
  window: "Hamming",
  phase: "zero",
  gapPolicy: "integer-linear-uvh-max-5s",
  interpolatedCount: 0,
  uniformN: 121,
  interpolationFraction: 0,
  maxGapS: 0,
  boundaryPolicy: "half-sample-mirror",
  supportSemantics: "sample-level FULL_SUPPORT | BOUNDARY_CONDITIONED",
  outputCoordinate: "Source heights",
  researchPredecessor: "v0.1-research",
};

function inspectionFixture(
  overrides: Partial<TracerInspection> = {},
): TracerInspection {
  return {
    tracerId: 2,
    time: 1.25,
    position: { x: 3000.4, y: 100.2, z: 4750.9 },
    altitude: 100.2,
    age: 1.25,
    active: true,
    vTotal: { x: 3, y: 4, z: 12 },
    speed: 13,
    contributions: DEMO_VELOCITY_CONTRIBUTION_KEYS.map((key, index) => ({
      key,
      velocity: { x: index, y: 0, z: 0 },
    })),
    ...overrides,
  };
}

function observationFixture(): PointDiagnosticObservation {
  return {
    tracerId: 2,
    time: 1.25,
    position: { x: 3000, y: 1000, z: 4000 },
    tiltingTendency: 2.33e-5,
    currentVerticalVorticity: 1e-2,
  };
}

function supportedExplanation(): AnalysisTiltingExplanationResult {
  return {
    status: "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency: 0.0008,
    worldHorizontalVorticity: { omegaX: 0.02, omegaZ: 0 },
    updraftHorizontalGradient: { dVyDx: 0, dVyDz: 0.04 },
    omegaHMagnitude: 0.02,
    gradientMagnitude: 0.04,
    alignment: {
      state: "ALIGNMENT_DEFINED",
      cosTheta: 0,
      theta: Math.PI / 2,
    },
    provenance: STUB_PROVENANCE,
  };
}

function mount(ui: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return {
    container,
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function toggleNamed(container: HTMLElement, title: string): HTMLButtonElement {
  const button = [...container.querySelectorAll("button.observation-section__toggle")].find(
    (el) => el.textContent?.includes(title),
  );
  if (button === undefined) {
    throw new Error(`missing toggle: ${title}`);
  }
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  return button as HTMLButtonElement;
}

function bodyFor(container: HTMLElement, title: string): HTMLElement {
  const button = [...container.querySelectorAll("button.observation-section__toggle")].find(
    (el) => el.textContent?.includes(title),
  );
  const id = button?.getAttribute("aria-controls");
  const body = id === null || id === undefined ? null : document.getElementById(id);
  if (body === null) {
    throw new Error(`missing body: ${title}`);
  }
  return body as HTMLElement;
}

function ColumnFixture({ analysisOn }: { analysisOn: boolean }) {
  return (
    <>
      <TracerInspectorPanel
        inspection={inspectionFixture()}
        mode="historical"
      />
      <PointDiagnosticsPanel
        observation={observationFixture()}
        mode="historical"
      />
      {analysisOn ? (
        <>
          <TrajectoryTiltingVerificationPanel
            model={createTrajectoryTiltingVerificationModel(supportedExplanation())}
          />
          <TrajectoryTiltingWhatIfPanel
            result={createTrajectoryTiltingWhatIfModel(
              supportedExplanation(),
              Math.PI / 2,
            )}
          />
        </>
      ) : null}
    </>
  );
}

function WhatIfThetaHarness() {
  const [theta, setTheta] = useState(Math.PI / 2);
  return (
    <div data-theta={String(theta)}>
      <button type="button" onClick={() => setTheta(0)}>
        set-zero
      </button>
      <TrajectoryTiltingWhatIfPanel
        result={createTrajectoryTiltingWhatIfModel(supportedExplanation(), theta)}
        onThetaWhatIfChange={setTheta}
      />
    </div>
  );
}

describe("Explore inspector collapse V1", () => {
  it("A available sections are expanded by default", () => {
    const html = renderToStaticMarkup(<ColumnFixture analysisOn />);
    expect(html.match(/aria-expanded="true"/g)?.length).toBe(4);
    expect(html).not.toContain('aria-expanded="false"');
    expect(html).not.toContain(" hidden");
    expect(html).toContain("Inspector");
    expect(html).toContain("Point diagnostics");
    expect(html).toContain("Analysis T1 verification");
    expect(html).toContain("What-if geometry");
    expect(html).toContain("HISTORICAL PATH SAMPLE");
    expect(html).toContain("FULL_SUPPORT");
    expect(html).toContain('type="range"');
  });

  it("B click collapse hides the body and keeps the header", () => {
    const { container, unmount } = mount(
      <TracerInspectorPanel inspection={inspectionFixture()} />,
    );
    const button = toggleNamed(container, "Inspector");
    const body = bodyFor(container, "Inspector");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(body.hidden).toBe(true);
    expect(container.textContent).toContain("Inspector");
    expect(body.textContent).toContain("Tracer #2");
    unmount();
  });

  it("C click expand restores the body", () => {
    const { container, unmount } = mount(
      <PointDiagnosticsPanel observation={observationFixture()} />,
    );
    toggleNamed(container, "Point diagnostics");
    const collapsed = bodyFor(container, "Point diagnostics");
    expect(collapsed.hidden).toBe(true);
    const button = toggleNamed(container, "Point diagnostics");
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(collapsed.hidden).toBe(false);
    expect(collapsed.textContent).toContain("T_tilt,y");
    unmount();
  });

  it("D aria-expanded tracks the disclosure", () => {
    const { container, unmount } = mount(
      <CollapsibleObservationSection
        sectionClassName="tracer-inspector"
        ariaLabel="Tracer inspector"
        title="Inspector"
        titleClassName="tracer-inspector__title"
        bodyClassName="tracer-inspector__body"
      >
        <p>payload</p>
      </CollapsibleObservationSection>,
    );
    const button = container.querySelector("button.observation-section__toggle");
    expect(button?.getAttribute("aria-expanded")).toBe("true");
    expect(button?.getAttribute("aria-controls")).toBeTruthy();
    toggleNamed(container, "Inspector");
    expect(button?.getAttribute("aria-expanded")).toBe("false");
    toggleNamed(container, "Inspector");
    expect(button?.getAttribute("aria-expanded")).toBe("true");
    unmount();
  });

  it("E collapsing one section does not collapse another", () => {
    const { container, unmount } = mount(<ColumnFixture analysisOn />);
    toggleNamed(container, "Analysis T1 verification");
    expect(
      container
        .querySelectorAll("button.observation-section__toggle")
        .item(0)
        .getAttribute("aria-expanded"),
    ).toBe("true");
    expect(bodyFor(container, "Inspector").hidden).toBe(false);
    expect(bodyFor(container, "Point diagnostics").hidden).toBe(false);
    expect(bodyFor(container, "Analysis T1 verification").hidden).toBe(true);
    expect(bodyFor(container, "What-if geometry").hidden).toBe(false);
    unmount();
  });

  it("F collapse does not clear historical selection or diagnostic copy", () => {
    const { container, unmount } = mount(
      <>
        <TracerInspectorPanel
          inspection={inspectionFixture()}
          mode="historical"
        />
        <PointDiagnosticsPanel
          observation={observationFixture()}
          mode="historical"
        />
      </>,
    );
    toggleNamed(container, "Inspector");
    toggleNamed(container, "Point diagnostics");
    expect(container.textContent).toContain("HISTORICAL PATH SAMPLE");
    expect(container.textContent).toContain("Tracer #2");
    expect(container.textContent).toContain("The tracer was not rewound");
    expect(container.textContent).toContain("T_tilt,y");
    expect(collapseSrc).not.toMatch(/HistoricalPathProbe/);
    expect(collapseSrc).not.toMatch(/TracerSelection/);
    expect(collapseSrc).not.toMatch(/setInspection/);
    expect(collapseSrc).not.toMatch(/localStorage/);
    unmount();
  });

  it("G what-if theta survives collapse and expand", () => {
    const { container, unmount } = mount(<WhatIfThetaHarness />);
    const setZero = [...container.querySelectorAll("button")].find(
      (el) => el.textContent === "set-zero",
    );
    if (setZero === undefined) {
      throw new Error("missing set-zero");
    }
    act(() => {
      setZero.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("[data-theta]")?.getAttribute("data-theta")).toBe(
      "0",
    );
    const slider = container.querySelector('input[type="range"]');
    if (!(slider instanceof HTMLInputElement)) {
      throw new Error("missing what-if slider");
    }
    expect(slider.value).toBe("0");
    toggleNamed(container, "What-if geometry");
    expect(bodyFor(container, "What-if geometry").hidden).toBe(true);
    expect(container.querySelector("[data-theta]")?.getAttribute("data-theta")).toBe(
      "0",
    );
    toggleNamed(container, "What-if geometry");
    const restored = container.querySelector('input[type="range"]');
    if (!(restored instanceof HTMLInputElement)) {
      throw new Error("slider unmounted");
    }
    expect(bodyFor(container, "What-if geometry").hidden).toBe(false);
    expect(restored.value).toBe("0");
    expect(container.querySelector("[data-theta]")?.getAttribute("data-theta")).toBe(
      "0",
    );
    expect(collapseSrc).toMatch(/hidden=\{!expanded\}/);
    expect(collapseSrc).not.toMatch(/expanded \? children/);
    unmount();
  });

  it("H unavailable Analysis capability does not create an empty accordion", () => {
    expect(exploreAnalysisTiltingExplorerActive(EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED, true)).toBe(
      false,
    );
    expect(
      exploreAnalysisTiltingExplorerActive(EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED, false),
    ).toBe(false);
    const demo = renderToStaticMarkup(<ColumnFixture analysisOn={false} />);
    expect(demo).toContain("Inspector");
    expect(demo).toContain("Point diagnostics");
    expect(demo).not.toContain("Analysis T1 verification");
    expect(demo).not.toContain("What-if geometry");
    const observation = appSrc.slice(
      appSrc.indexOf("workbench__column--observation"),
      appSrc.indexOf("workbench--guided"),
    );
    expect(observation).toMatch(/analysisTiltingExplorerOn \?/);
    expect(observation).toMatch(/TrajectoryTiltingVerificationPanel/);
    expect(observation).toMatch(/TrajectoryTiltingWhatIfPanel/);
    expect(appSrc).not.toMatch(/workbench--guided[\s\S]*TrajectoryTiltingVerificationPanel/);
  });

  it("keeps nested Provenance independent of the section disclosure", () => {
    const { container, unmount } = mount(
      <TrajectoryTiltingVerificationPanel
        model={createTrajectoryTiltingVerificationModel(supportedExplanation())}
      />,
    );
    const provenance = container.querySelector("details.trajectory-tilting-verify__provenance");
    if (!(provenance instanceof HTMLDetailsElement)) {
      throw new Error("missing provenance");
    }
    expect(provenance.open).toBe(false);
    act(() => {
      provenance.open = true;
    });
    toggleNamed(container, "Analysis T1 verification");
    expect(bodyFor(container, "Analysis T1 verification").hidden).toBe(true);
    expect(provenance.open).toBe(true);
    toggleNamed(container, "Analysis T1 verification");
    expect(provenance.open).toBe(true);
    unmount();
  });
});
