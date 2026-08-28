import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createExploreLab, resetExploreLab } from "./createExploreLab.js";
import { EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED } from "../explore/exploreEnvironmentIdentity.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { inspectWorldPoint } from "../interaction/TracerInspection.js";
import { inspectPointDiagnosticsAt } from "../interaction/PointDiagnosticObservation.js";
import {
  resolveHistoricalPathSample,
  type HistoricalPathProbe,
} from "../interaction/HistoricalPathProbe.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { tracerIdForSlot } from "../ui/tracer/resolveTracerPointerUp.js";
import { TracerInspectorPanel } from "../ui/tracer/TracerInspectorPanel.js";
import { PointDiagnosticsPanel } from "../ui/tracer/PointDiagnosticsPanel.js";
import appSrc from "./App.tsx?raw";
import viewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";

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
    removeLastTracerSlot() {
      if (tracerSlotCount > 0) {
        tracerSlotCount -= 1;
      }
    },
    clearTracerSlots() {
      tracerSlotCount = 0;
    },
    syncReleasePreview() {},
  };
}

describe("historical path probe App wiring", () => {
  it("wires path pick after glyph, inspects recorded (P, t), and keeps Follow on the live glyph", () => {
    expect(appSrc).toMatch(/onPathSampleSelect/);
    expect(appSrc).toMatch(/setHistoricalPathProbe\(null\)/);
    expect(appSrc).toMatch(/historicalProbePosition=\{historicalSample\?\.position/);
    expect(appSrc).toMatch(/inspectWorldPoint/);
    expect(appSrc).toMatch(/inspectPointDiagnosticsAt/);
    expect(appSrc).toMatch(/resolved\.simulationTime/);
    expect(viewportSrc).toMatch(/pickPathHistorySampleAtClientPoint/);
    expect(viewportSrc).toMatch(/syncHistoricalPathProbe/);
    expect(viewportSrc).toMatch(/viewportFollowSync\(\{/);
    expect(viewportSrc).toMatch(
      /selectedTracerId:\s*selectedTracerIdRef\.current/,
    );
    expect(viewportSrc).not.toMatch(
      /viewportFollowSync\([\s\S]*historicalProbe/,
    );
    expect(appSrc).not.toMatch(/clock\.time\s*=/);
  });

  it("Reset, Clear, environment switch, and Explore/Guided entry clear the probe", () => {
    const resetBlock = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const handleResetView"),
    );
    expect(resetBlock).toMatch(/setHistoricalPathProbe\(null\)/);

    const clearBlock = appSrc.slice(
      appSrc.indexOf("const clearSelectionAndInspection"),
      appSrc.indexOf("const handleReset"),
    );
    expect(clearBlock).toMatch(/setHistoricalPathProbe\(null\)/);

    const handleClear = appSrc.slice(
      appSrc.indexOf("const handleClearTracers"),
      appSrc.indexOf("const enterExplore"),
    );
    expect(handleClear).toMatch(/clearSelectionAndInspection/);

    const enterExplore = appSrc.slice(
      appSrc.indexOf("const enterExplore"),
      appSrc.indexOf("const enterGuided"),
    );
    expect(enterExplore).toMatch(/clearSelectionAndInspection/);

    const enterGuided = appSrc.slice(
      appSrc.indexOf("const enterGuided"),
      appSrc.indexOf("const selectGuidedExperiment"),
    );
    expect(enterGuided).toMatch(/clearSelectionAndInspection/);

    const envSwitch = appSrc.slice(
      appSrc.indexOf("const selectExploreEnvironment"),
      appSrc.indexOf("const explore ="),
    );
    expect(envSwitch).toMatch(/clearSelectionAndInspection/);
    expect(envSwitch).toMatch(/createExploreLab/);
    expect(envSwitch).toMatch(/exploreEnvironmentalWindProfile\(next\)/);
  });

  it("glyph select clears the probe; path select does not birth or replace Follow target", () => {
    const glyph = appSrc.slice(
      appSrc.indexOf("onTracerSelect={"),
      appSrc.indexOf("onPathSampleSelect={"),
    );
    expect(glyph).toMatch(/setHistoricalPathProbe\(null\)/);
    expect(glyph).toMatch(/selection\.select\(tracerId\)/);

    const path = appSrc.slice(
      appSrc.indexOf("onPathSampleSelect={"),
      appSrc.indexOf("onSimulationAdvanced="),
    );
    expect(path).toMatch(/setHistoricalPathProbe\(\{ tracerId, historyIndex \}\)/);
    expect(path).not.toMatch(/selection\.select/);
    expect(path).not.toMatch(/orchestration/);
  });

  it("recomputes Inspector and T1/ω at the recorded sample while the live tracer continues", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint({ x: 0, y: 1000, z: 0 });
    lab.simulation.step(DT);
    lab.pathHistory.recordAfterStep(
      lab.simulation.particles,
      lab.simulation.clock.time,
    );
    const tracerId = lab.simulation.particles[0]!.tracerId;
    expect(tracerIdForSlot(lab.simulation.particles, 0)).toBe(tracerId);
    const liveBefore = {
      position: { ...lab.simulation.particles[0]!.position },
      age: lab.simulation.particles[0]!.age,
      time: lab.simulation.clock.time,
    };
    const probe: HistoricalPathProbe = { tracerId, historyIndex: 0 };
    const resolved = resolveHistoricalPathSample(
      lab.simulation.particles,
      lab.pathHistory,
      probe,
    )!;
    expect(resolved.position).toEqual({ x: 0, y: 1000, z: 0 });
    expect(resolved.simulationTime).toBe(0);

    const total = new ConstantVelocityField({ x: 1, y: 2, z: 3 });
    const inspection = inspectWorldPoint(
      resolved.tracerId,
      resolved.position,
      resolved.simulationTime,
      resolved.age,
      resolved.active,
      { total },
    );
    expect(inspection.time).toBe(0);
    expect(inspection.position).toEqual({ x: 0, y: 1000, z: 0 });
    expect(inspection.vTotal).toEqual({ x: 1, y: 2, z: 3 });

    const diagnostics = inspectPointDiagnosticsAt(
      resolved.tracerId,
      resolved.position,
      resolved.simulationTime,
      {
        tiltingTendency: lab.tiltingTendency,
        currentVerticalVorticity: lab.currentVerticalVorticity,
      },
    );
    expect(diagnostics.time).toBe(0);
    expect(diagnostics.position).toEqual({ x: 0, y: 1000, z: 0 });

    lab.simulation.step(DT);
    expect(lab.simulation.clock.time).toBeGreaterThan(liveBefore.time);
    expect(lab.simulation.particles[0]!.age).toBeGreaterThan(liveBefore.age);
    expect(lab.simulation.particles[0]!.position).not.toEqual(
      resolved.position,
    );

    const html = renderToStaticMarkup(
      <>
        <TracerInspectorPanel inspection={inspection} mode="historical" />
        <PointDiagnosticsPanel observation={diagnostics} mode="historical" />
      </>,
    );
    expect(html).toContain("HISTORICAL PATH SAMPLE");
    expect(html).toContain("The tracer was not rewound");

    resetExploreLab(lab);
    expect(
      resolveHistoricalPathSample(lab.simulation.particles, lab.pathHistory, {
        tracerId,
        historyIndex: 1,
      }),
    ).toBeUndefined();

    expect(EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED).toBe(
      "goshen-2009-observed",
    );

    const selection = new TracerSelection();
    selection.select(tracerId);
    expect(selection.selectedId).toBe(tracerId);
  });
});
