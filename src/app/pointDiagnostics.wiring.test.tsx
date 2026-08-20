import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "./composeDemoTracerSimulation.js";
import { createExploreLab, resetExploreLab } from "./createExploreLab.js";
import { createGuidedLab } from "./createGuidedLab.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { inspectSelectedPointDiagnostics } from "../interaction/PointDiagnosticObservation.js";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { PointDiagnosticsPanel } from "../ui/tracer/PointDiagnosticsPanel.js";
import { TracerInspectorPanel } from "../ui/tracer/TracerInspectorPanel.js";
import appSrc from "./App.tsx?raw";
import inspectorPanelSrc from "../ui/tracer/TracerInspectorPanel.tsx?raw";
import pointDiagnosticsPanelSrc from "../ui/tracer/PointDiagnosticsPanel.tsx?raw";
import guidedExperimentSrc from "../guided/GuidedExperiment.ts?raw";
import tracerInspectionSrc from "../interaction/TracerInspection.ts?raw";

const SEED = { x: -2000, y: 2000, z: 0 };
const DT = DEMO_SCENARIO.simulation.timestep;

function fakeSlots(): ExploreSceneSlots {
  let tracerSlotCount = 0;
  return {
    get tracerSlotCount() {
      return tracerSlotCount;
    },
    addTracerSlot() {
      tracerSlotCount += 1;
    },
    clearTracerSlots() {
      tracerSlotCount = 0;
    },
    syncReleasePreview() {},
  };
}

function observeExplore(
  lab: ReturnType<typeof createExploreLab>,
  selection: TracerSelection,
) {
  return inspectSelectedPointDiagnostics(
    lab.simulation.particles,
    selection,
    lab.simulation.clock.time,
    {
      tiltingTendency: lab.tiltingTendency,
      currentVerticalVorticity: lab.currentVerticalVorticity,
    },
  );
}

describe("Explore point-diagnostics App wiring", () => {
  it("calls canonical inspectSelectedPointDiagnostics from the Inspector cadence", () => {
    expect(appSrc).toMatch(/inspectSelectedPointDiagnostics/);
    expect(appSrc).toMatch(/PointDiagnosticsPanel/);
    expect(appSrc).toMatch(
      /tiltingTendency: lab\.tiltingTendency/,
    );
    expect(appSrc).toMatch(
      /currentVerticalVorticity: lab\.currentVerticalVorticity/,
    );
    expect(appSrc).toMatch(
      /onSimulationAdvanced=\{refreshInspection\}/,
    );
    const refresh = appSrc.slice(
      appSrc.indexOf("const refreshInspection"),
      appSrc.indexOf("const clearSelectionAndInspection"),
    );
    expect(refresh).toMatch(/inspectSelectedTracer/);
    expect(refresh).toMatch(/inspectSelectedPointDiagnostics/);
    expect(refresh).toMatch(/lab\.simulation\.clock\.time/);
    expect(appSrc).not.toMatch(/setInterval/);
    expect(appSrc).not.toMatch(/setTimeout/);
  });

  it("mounts the panel only in Explore, below Inspector, not in Guided", () => {
    const inspectorColumn = appSrc.slice(
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(inspectorColumn).toMatch(/TracerInspectorPanel/);
    expect(inspectorColumn).toMatch(
      /lab\.kind === "explore" && \(\s*<PointDiagnosticsPanel observation=\{pointDiagnostics\} \/>/s,
    );
    expect(inspectorColumn.indexOf("TracerInspectorPanel")).toBeLessThan(
      inspectorColumn.indexOf("PointDiagnosticsPanel"),
    );

    const laboratory = appSrc.slice(
      appSrc.indexOf("workbench__column--laboratory"),
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(laboratory).not.toMatch(/PointDiagnosticsPanel/);
    expect(appSrc).not.toMatch(/GuidedPointDiagnostics/);
    expect(guidedExperimentSrc).not.toMatch(/PointDiagnostic/);
    expect(guidedExperimentSrc).not.toMatch(/tiltingTendency/);
    expect(guidedExperimentSrc).not.toMatch(/currentVerticalVorticity/);
  });

  it("selected Explore tracer yields the current SAME-source observation in the panel", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const selection = new TracerSelection();
    const particle = lab.simulation.particles[0]!;
    selection.select(particle.tracerId);
    const observation = observeExplore(lab, selection)!;
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel observation={observation} />,
    );

    expect(observation.tracerId).toBe(particle.tracerId);
    expect(observation.position).toEqual(particle.position);
    expect(observation.time).toBe(lab.simulation.clock.time);
    expect(observation.tiltingTendency).toBe(
      lab.tiltingTendency.sample(particle.position, lab.simulation.clock.time),
    );
    expect(observation.currentVerticalVorticity).toBe(
      lab.currentVerticalVorticity.sample(
        particle.position,
        lab.simulation.clock.time,
      ),
    );
    expect(html).toContain("T_tilt,y");
    expect(html).toContain("ω_y,current");
    expect(html).not.toContain(
      "Select a tracer to sample diagnostics at its current position.",
    );
  });

  it("refreshes displayed values after a completed step through the existing cadence", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    const before = observeExplore(lab, selection)!;
    lab.simulation.step(DT);
    const after = observeExplore(lab, selection)!;
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel observation={after} />,
    );

    expect(after.tracerId).toBe(before.tracerId);
    expect(after.time).toBe(before.time + DT);
    expect(after.position).not.toEqual(before.position);
    expect(after.tiltingTendency).toBe(
      lab.tiltingTendency.sample(
        lab.simulation.particles[0]!.position,
        lab.simulation.clock.time,
      ),
    );
    expect(html).not.toContain(
      "Select a tracer to sample diagnostics at its current position.",
    );
  });

  it("Reset refreshes to the restored observation without clearing selection", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    lab.simulation.step(DT);
    resetExploreLab(lab);
    const restored = observeExplore(lab, selection)!;

    expect(selection.selectedId).toBe(1);
    expect(restored.tracerId).toBe(1);
    expect(restored.time).toBe(0);
    expect(restored.position).toEqual(lab.simulation.particles[0]!.position);
    expect(restored.tiltingTendency).toBe(
      lab.tiltingTendency.sample(lab.simulation.particles[0]!.position, 0),
    );

    const resetBlock = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const enterExplore"),
    );
    expect(resetBlock).toMatch(/refreshInspection/);
    expect(resetBlock).not.toMatch(/selection\.clear/);
  });

  it("clears to the placeholder with no stale values", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    expect(observeExplore(lab, selection)).toBeDefined();
    lab.orchestration.clear();
    selection.clear();
    const observation = observeExplore(lab, selection);
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel observation={observation} />,
    );

    expect(observation).toBeUndefined();
    expect(html).toContain(
      "Select a tracer to sample diagnostics at its current position.",
    );
    expect(html).not.toContain("T_tilt,y");
    expect(appSrc).toMatch(
      /orchestration\.clear\(\);\s*clearSelectionAndInspection\(\)/s,
    );
    expect(appSrc).toMatch(
      /setInspection\(undefined\);\s*setPointDiagnostics\(undefined\)/s,
    );
  });

  it("does not sample point diagnostics while the Guided panel is unmounted", () => {
    expect(appSrc).toMatch(
      /lab\.kind === "explore"\s*\?[\s\S]*inspectSelectedPointDiagnostics/s,
    );
    const inspectorColumn = appSrc.slice(
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(inspectorColumn).toMatch(/lab\.kind === "explore"/);
    expect(inspectorColumn).not.toMatch(/lab\.kind === "guided"/);
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    expect(guided.kind).toBe("guided");
  });

  it("keeps Inspector L2 at exactly seven velocity operands", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    const inspection = inspectSelectedTracer(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      lab.velocityObservation,
    )!;
    const html = renderToStaticMarkup(
      <TracerInspectorPanel inspection={inspection} />,
    );

    expect(lab.velocityObservation.parts).toHaveLength(7);
    expect(lab.velocityObservation.parts!.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    expect(inspection.contributions?.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    expect(html).toContain("Why this motion?");
    expect(html).not.toContain("tiltingTendency");
    expect(html).not.toContain("currentVerticalVorticity");
    expect(html).not.toContain("T_tilt,y");
    expect(html).not.toContain("Point diagnostics");
    expect(inspectorPanelSrc).not.toMatch(/tiltingTendency/);
    expect(inspectorPanelSrc).not.toMatch(/currentVerticalVorticity/);
    expect(inspectorPanelSrc).not.toMatch(/PointDiagnostic/);
    expect(tracerInspectionSrc).not.toMatch(/tiltingTendency/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/Why this motion\?/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/velocityObservation\.parts/);
  });
});
