/** @vitest-environment happy-dom */

import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
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
import { createTrajectoryTiltingGlyphModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import { createTrajectoryTiltingVerificationModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingVerification.js";
import { createTrajectoryTiltingWhatIfModel } from "../../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import type { EscHrTimeAnalysisProvenance } from "../../data/escHrTimeAnalysis/types.js";
import type { TracerInspection } from "../../interaction/TracerInspection.js";
import type { PointDiagnosticObservation } from "../../interaction/PointDiagnosticObservation.js";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "../../app/composeDemoTracerSimulation.js";
import { CollapsibleObservationSection } from "./CollapsibleObservationSection.js";
import { ExploreWhatIfGeometryAutoReveal } from "./ExploreWhatIfGeometryAutoReveal.js";
import { PointDiagnosticsPanel } from "./PointDiagnosticsPanel.js";
import { TracerInspectorPanel } from "./TracerInspectorPanel.js";
import { TrajectoryTiltingVerificationPanel } from "./TrajectoryTiltingVerificationPanel.js";
import { TrajectoryTiltingWhatIfPanel } from "./TrajectoryTiltingWhatIfPanel.js";
import {
  scrollObservationChildIntoView,
  shouldAutoRevealWhatIfGeometry,
} from "./whatIfGeometryAutoRevealV1.js";
import appSrc from "../../app/App.tsx?raw";
import autoRevealSrc from "./ExploreWhatIfGeometryAutoReveal.tsx?raw";
import collapseSrc from "./CollapsibleObservationSection.tsx?raw";
import inspectorSrc from "./TracerInspectorPanel.tsx?raw";
import pointSrc from "./PointDiagnosticsPanel.tsx?raw";
import verifySrc from "./TrajectoryTiltingVerificationPanel.tsx?raw";
import v1Src from "./whatIfGeometryAutoRevealV1.ts?raw";
import whatIfSrc from "./TrajectoryTiltingWhatIfPanel.tsx?raw";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "whatif-auto-reveal-test",
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

const ANCHOR = { x: 10, y: 20, z: 30 };

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

function degenerateExplanation(): AnalysisTiltingExplanationResult {
  return {
    status: "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency: 0,
    worldHorizontalVorticity: { omegaX: 0.02, omegaZ: 0 },
    updraftHorizontalGradient: { dVyDx: 0, dVyDz: 0 },
    omegaHMagnitude: 0.02,
    gradientMagnitude: 0,
    alignment: { state: "GRADIENT_DEGENERATE" },
    provenance: STUB_PROVENANCE,
  };
}

function supportedPair() {
  const explanation = supportedExplanation();
  return {
    glyphModel: createTrajectoryTiltingGlyphModel(ANCHOR, explanation),
    whatIfModel: createTrajectoryTiltingWhatIfModel(
      explanation,
      Math.PI / 2,
      ANCHOR,
    ),
    verificationModel: createTrajectoryTiltingVerificationModel(explanation),
  };
}

function otherSupportedPair() {
  const explanation = {
    ...supportedExplanation(),
    tiltingTendency: 0.0004,
    worldHorizontalVorticity: { omegaX: 0.01, omegaZ: 0 },
    omegaHMagnitude: 0.01,
  };
  return {
    glyphModel: createTrajectoryTiltingGlyphModel(ANCHOR, explanation),
    whatIfModel: createTrajectoryTiltingWhatIfModel(explanation, 0, ANCHOR),
    verificationModel: createTrajectoryTiltingVerificationModel(explanation),
  };
}

function oodPair() {
  const explanation: AnalysisTiltingExplanationResult = {
    status: "OUT_OF_DOMAIN",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    provenance: STUB_PROVENANCE,
  };
  return {
    glyphModel: createTrajectoryTiltingGlyphModel(ANCHOR, explanation),
    whatIfModel: createTrajectoryTiltingWhatIfModel(explanation, 0, ANCHOR),
    verificationModel: createTrajectoryTiltingVerificationModel(explanation),
  };
}

function columnUnavailablePair() {
  const explanation: AnalysisTiltingExplanationResult = {
    status: "COLUMN_UNAVAILABLE",
  };
  return {
    glyphModel: createTrajectoryTiltingGlyphModel(ANCHOR, explanation),
    whatIfModel: createTrajectoryTiltingWhatIfModel(explanation, 0, ANCHOR),
    verificationModel: createTrajectoryTiltingVerificationModel(explanation),
  };
}

function degeneratePair() {
  const explanation = degenerateExplanation();
  return {
    glyphModel: createTrajectoryTiltingGlyphModel(ANCHOR, explanation),
    whatIfModel: createTrajectoryTiltingWhatIfModel(explanation, 0, ANCHOR),
    verificationModel: createTrajectoryTiltingVerificationModel(explanation),
  };
}

function inspectionFixture(): TracerInspection {
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

function rect(top: number, bottom: number): DOMRect {
  return {
    x: 0,
    y: top,
    width: 280,
    height: bottom - top,
    top,
    right: 280,
    bottom,
    left: 0,
    toJSON() {
      return {};
    },
  };
}

function mockObservationOverflow() {
  const original = HTMLElement.prototype.getBoundingClientRect;
  const scrollTo = vi
    .spyOn(HTMLElement.prototype, "scrollTo")
    .mockImplementation(() => {});
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      if (this.classList.contains("workbench__column--observation")) {
        return rect(0, 100);
      }
      if (this.classList.contains("trajectory-tilting-whatif")) {
        return rect(40, 260);
      }
      return original.call(this);
    },
  );
  return scrollTo;
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

function expandedFor(container: HTMLElement, title: string): boolean {
  const button = [...container.querySelectorAll("button.observation-section__toggle")].find(
    (el) => el.textContent?.includes(title),
  );
  return button?.getAttribute("aria-expanded") === "true";
}

type SampleState = {
  glyphModel?: ReturnType<typeof createTrajectoryTiltingGlyphModel>;
  whatIfModel?: ReturnType<typeof createTrajectoryTiltingWhatIfModel>;
  verificationModel?: ReturnType<typeof createTrajectoryTiltingVerificationModel>;
  showAnalysis: boolean;
};

function ObservationColumn({ sample }: { sample: SampleState }) {
  return (
    <ExploreWhatIfGeometryAutoReveal
      glyphModel={sample.glyphModel}
      whatIfModel={sample.whatIfModel}
    >
      {(autoReveal) => (
        <div
          className="workbench__column workbench__column--observation"
          ref={autoReveal.columnRef}
        >
          <button type="button" data-focus-trap="true">
            focus-trap
          </button>
          <TracerInspectorPanel
            inspection={inspectionFixture()}
            mode="historical"
          />
          <PointDiagnosticsPanel
            observation={observationFixture()}
            mode="historical"
          />
          {sample.showAnalysis ? (
            <>
              <TrajectoryTiltingVerificationPanel
                model={sample.verificationModel}
              />
              <TrajectoryTiltingWhatIfPanel
                result={sample.whatIfModel}
                expandRequestNonce={autoReveal.expandRequestNonce}
                sectionRef={autoReveal.whatIfSectionRef}
                onExpandedForReveal={autoReveal.onExpandedForReveal}
              />
            </>
          ) : null}
        </div>
      )}
    </ExploreWhatIfGeometryAutoReveal>
  );
}

function SwitchableColumn({
  initial,
}: {
  initial: SampleState;
}) {
  const [sample, setSample] = useState(initial);
  return (
    <div>
      <button
        type="button"
        data-set-sample="supported"
        onClick={() => setSample({ ...supportedPair(), showAnalysis: true })}
      >
        supported
      </button>
      <button
        type="button"
        data-set-sample="other-supported"
        onClick={() => setSample({ ...otherSupportedPair(), showAnalysis: true })}
      >
        other-supported
      </button>
      <button
        type="button"
        data-set-sample="ood"
        onClick={() => setSample({ ...oodPair(), showAnalysis: true })}
      >
        ood
      </button>
      <button
        type="button"
        data-set-sample="cleared"
        onClick={() =>
          setSample({
            glyphModel: undefined,
            whatIfModel: undefined,
            verificationModel: undefined,
            showAnalysis: false,
          })
        }
      >
        cleared
      </button>
      <ObservationColumn sample={sample} />
    </div>
  );
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
    rerender(next: React.ReactElement) {
      act(() => {
        root.render(next);
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function clickSample(container: HTMLElement, name: string) {
  const button = container.querySelector(`[data-set-sample="${name}"]`);
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`missing sample button ${name}`);
  }
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("shouldAutoRevealWhatIfGeometry", () => {
  it("uses typed glyph + what-if kinds, not environment names", () => {
    const supported = supportedPair();
    expect(
      shouldAutoRevealWhatIfGeometry(supported.glyphModel, supported.whatIfModel),
    ).toBe(true);
    expect(
      shouldAutoRevealWhatIfGeometry(oodPair().glyphModel, oodPair().whatIfModel),
    ).toBe(false);
    expect(
      shouldAutoRevealWhatIfGeometry(
        columnUnavailablePair().glyphModel,
        columnUnavailablePair().whatIfModel,
      ),
    ).toBe(false);
    expect(
      shouldAutoRevealWhatIfGeometry(
        degeneratePair().glyphModel,
        degeneratePair().whatIfModel,
      ),
    ).toBe(false);
    expect(shouldAutoRevealWhatIfGeometry(undefined, undefined)).toBe(false);
    expect(v1Src).not.toMatch(/Goshen|Prospect|Dumas|Moore|Demo/);
    expect(v1Src).not.toMatch(/localStorage|sessionStorage|cookie/i);
  });
});

describe("scrollObservationChildIntoView", () => {
  it("scrolls only the supplied container with nearest semantics", () => {
    const scrollTo = vi.fn();
    const tallContainer = {
      getBoundingClientRect: () => rect(0, 100),
      scrollTop: 10,
      scrollTo,
    } as unknown as HTMLElement;
    const tallTarget = {
      getBoundingClientRect: () => rect(80, 220),
    } as unknown as HTMLElement;
    scrollObservationChildIntoView(tallContainer, tallTarget);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 90, behavior: "smooth" });

    scrollTo.mockClear();
    const clipped = {
      getBoundingClientRect: () => rect(0, 100),
      scrollTop: 0,
      scrollTo,
    } as unknown as HTMLElement;
    const clippedTarget = {
      getBoundingClientRect: () => rect(60, 140),
    } as unknown as HTMLElement;
    scrollObservationChildIntoView(clipped, clippedTarget);
    expect(scrollTo).toHaveBeenCalledWith({ top: 40, behavior: "smooth" });
    expect(v1Src).not.toMatch(/\.scrollIntoView\(/);
    expect(v1Src).not.toMatch(/window\.scroll|document\.documentElement/);
  });
});

describe("What-if geometry auto-reveal V1", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("A opens a closed What-if on the first supported + available glyph", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <SwitchableColumn initial={{ ...oodPair(), showAnalysis: true }} />,
    );
    toggleNamed(container, "What-if geometry");
    expect(expandedFor(container, "What-if geometry")).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
    clickSample(container, "supported");
    expect(expandedFor(container, "What-if geometry")).toBe(true);
    expect(bodyFor(container, "What-if geometry").hidden).toBe(false);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("B leaves an already-open What-if open on first reveal", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <ObservationColumn sample={{ ...supportedPair(), showAnalysis: true }} />,
    );
    expect(expandedFor(container, "What-if geometry")).toBe(true);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("C issues one observation-local scroll request on first reveal", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <ObservationColumn sample={{ ...supportedPair(), showAnalysis: true }} />,
    );
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo.mock.calls[0]?.[0]).toEqual({
      top: expect.any(Number),
      behavior: "smooth",
    });
    unmount();
  });

  it("D does not auto-scroll the next supported sample", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <SwitchableColumn
        initial={{ ...supportedPair(), showAnalysis: true }}
      />,
    );
    expect(scrollTo).toHaveBeenCalledTimes(1);
    clickSample(container, "other-supported");
    expect(expandedFor(container, "What-if geometry")).toBe(true);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("E keeps a user-closed What-if closed on the next supported sample", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <SwitchableColumn
        initial={{ ...supportedPair(), showAnalysis: true }}
      />,
    );
    toggleNamed(container, "What-if geometry");
    expect(expandedFor(container, "What-if geometry")).toBe(false);
    clickSample(container, "other-supported");
    expect(expandedFor(container, "What-if geometry")).toBe(false);
    expect(bodyFor(container, "What-if geometry").hidden).toBe(true);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("F does not reveal for OUT_OF_DOMAIN", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <SwitchableColumn initial={{ ...oodPair(), showAnalysis: true }} />,
    );
    expect(scrollTo).not.toHaveBeenCalled();
    toggleNamed(container, "What-if geometry");
    expect(expandedFor(container, "What-if geometry")).toBe(false);
    clickSample(container, "ood");
    expect(expandedFor(container, "What-if geometry")).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
    unmount();
  });

  it("G does not reveal for COLUMN_UNAVAILABLE", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <ObservationColumn
        sample={{ ...columnUnavailablePair(), showAnalysis: true }}
      />,
    );
    expect(container.textContent).toContain("COLUMN_UNAVAILABLE");
    expect(scrollTo).not.toHaveBeenCalled();
    toggleNamed(container, "What-if geometry");
    expect(expandedFor(container, "What-if geometry")).toBe(false);
    unmount();
  });

  it("H does not reveal in Demo / no Analysis explorer", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <ObservationColumn
        sample={{
          glyphModel: undefined,
          whatIfModel: undefined,
          showAnalysis: false,
        }}
      />,
    );
    expect(container.textContent).not.toContain("What-if geometry");
    expect(scrollTo).not.toHaveBeenCalled();
    unmount();
  });

  it("I does not reveal when what-if is unavailable/degenerate", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <ObservationColumn
        sample={{ ...degeneratePair(), showAnalysis: true }}
      />,
    );
    expect(degeneratePair().glyphModel.kind).toBe("SUPPORTED");
    expect(degeneratePair().whatIfModel.kind).toBe("UNAVAILABLE");
    expect(scrollTo).not.toHaveBeenCalled();
    toggleNamed(container, "What-if geometry");
    expect(expandedFor(container, "What-if geometry")).toBe(false);
    unmount();
  });

  it("J does not steal keyboard focus", () => {
    mockObservationOverflow();
    const { container, unmount } = mount(
      <SwitchableColumn initial={{ ...oodPair(), showAnalysis: true }} />,
    );
    const trap = container.querySelector("[data-focus-trap]");
    if (!(trap instanceof HTMLButtonElement)) {
      throw new Error("missing focus trap");
    }
    act(() => {
      trap.focus();
    });
    expect(document.activeElement).toBe(trap);
    clickSample(container, "supported");
    expect(document.activeElement).toBe(trap);
    expect(autoRevealSrc).not.toMatch(/\.focus\(/);
    expect(collapseSrc).not.toMatch(/\.focus\(/);
    expect(whatIfSrc).not.toMatch(/\.focus\(/);
    unmount();
  });

  it("K leaves other collapsible sections untouched", () => {
    mockObservationOverflow();
    const { container, unmount } = mount(
      <SwitchableColumn initial={{ ...oodPair(), showAnalysis: true }} />,
    );
    toggleNamed(container, "Inspector");
    toggleNamed(container, "Point diagnostics");
    toggleNamed(container, "T1 calculation");
    toggleNamed(container, "What-if geometry");
    expect(expandedFor(container, "Inspector")).toBe(false);
    expect(expandedFor(container, "Point diagnostics")).toBe(false);
    expect(expandedFor(container, "T1 calculation")).toBe(false);
    clickSample(container, "supported");
    expect(expandedFor(container, "What-if geometry")).toBe(true);
    expect(expandedFor(container, "Inspector")).toBe(false);
    expect(expandedFor(container, "Point diagnostics")).toBe(false);
    expect(expandedFor(container, "T1 calculation")).toBe(false);
    expect(inspectorSrc).not.toMatch(/expandRequestNonce/);
    expect(pointSrc).not.toMatch(/expandRequestNonce/);
    expect(verifySrc).not.toMatch(/expandRequestNonce/);
    unmount();
  });

  it("L does not onboard again after environment-style clear within the same mount", () => {
    const scrollTo = mockObservationOverflow();
    const { container, unmount } = mount(
      <SwitchableColumn
        initial={{ ...supportedPair(), showAnalysis: true }}
      />,
    );
    expect(scrollTo).toHaveBeenCalledTimes(1);
    clickSample(container, "cleared");
    expect(container.textContent).not.toContain("What-if geometry");
    clickSample(container, "supported");
    expect(expandedFor(container, "What-if geometry")).toBe(true);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("wires the Explore observation column without persistence or science queries", () => {
    expect(appSrc).toMatch(/ExploreWhatIfGeometryAutoReveal/);
    expect(appSrc).toMatch(/expandRequestNonce=\{autoReveal\.expandRequestNonce\}/);
    expect(autoRevealSrc).toMatch(/hasAutoRevealedWhatIfRef/);
    expect(autoRevealSrc).toMatch(/shouldAutoRevealWhatIfGeometry/);
    expect(autoRevealSrc).not.toMatch(/localStorage|sessionStorage|cookie/i);
    expect(autoRevealSrc).not.toMatch(/queryAnalysisTilting|DiagnosticTiltingTendency/);
    expect(autoRevealSrc).not.toMatch(/Goshen|Prospect|Dumas|Moore|Demo/);
    expect(collapseSrc).toMatch(/expandRequestNonce/);
    expect(collapseSrc).toMatch(/hidden=\{!expanded\}/);
    expect(`${autoRevealSrc}\n${collapseSrc}`).not.toMatch(/setTimeout/);
  });
});

describe("CollapsibleObservationSection expand request", () => {
  it("opens on nonce without taking over later user collapse", () => {
    function Harness() {
      const [nonce, setNonce] = useState(0);
      return (
        <div>
          <button type="button" onClick={() => setNonce((n) => n + 1)}>
            reveal
          </button>
          <CollapsibleObservationSection
            sectionClassName="trajectory-tilting-whatif"
            ariaLabel="Analysis tilting what-if alignment"
            title="What-if geometry"
            titleClassName="trajectory-tilting-whatif__title"
            bodyClassName="trajectory-tilting-whatif__body"
            expandRequestNonce={nonce}
          >
            <p>controls</p>
          </CollapsibleObservationSection>
        </div>
      );
    }
    const { container, unmount } = mount(<Harness />);
    toggleNamed(container, "What-if geometry");
    expect(expandedFor(container, "What-if geometry")).toBe(false);
    const reveal = [...container.querySelectorAll("button")].find(
      (el) => el.textContent === "reveal",
    );
    act(() => {
      reveal?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(expandedFor(container, "What-if geometry")).toBe(true);
    toggleNamed(container, "What-if geometry");
    expect(expandedFor(container, "What-if geometry")).toBe(false);
    unmount();
  });
});
