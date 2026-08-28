import { describe, expect, it } from "vitest";
import appSrc from "./App.tsx?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import hoverResolveSrc from "../ui/tracer/resolveTracerHover.ts?raw";
import pointerUpSrc from "../ui/tracer/resolveTracerPointerUp.ts?raw";
import hoverHaloSrc from "../rendering/hoverHaloMarker.ts?raw";
import pickVisibleSrc from "../rendering/pickVisibleTracerSlot.ts?raw";

/**
 * Slice 4 — tracer hover affordance.
 * docs/ui/10-tracer-interaction-affordance.md
 */
describe("Slice 4 tracer hover wiring", () => {
  it("reuses the click pick pipeline for hover identity", () => {
    expect(hoverResolveSrc).toMatch(/hitSlotIndex !== null/);
    expect(pointerUpSrc).toMatch(/hitSlotIndex !== null/);
    expect(hoverResolveSrc).toMatch(/hitPathSample/);
    expect(tracerViewportSrc).toMatch(/resolveTracerHover/);
    expect(tracerViewportSrc).toMatch(/pickVisibleTracerAtClientPoint/);
    expect(tracerViewportSrc).toMatch(/pickPathHistorySampleAtClientPoint/);
    expect(tracerViewportSrc).toMatch(/pickTracerHits/);
    expect(tracerSceneSrc).toMatch(
      /pickVisibleTracerSlotAtClientPoint\(\s*this\.slots/,
    );
  });

  it("keeps hover out of TracerSelection, App lab state, and click handlers", () => {
    expect(appSrc).not.toMatch(/hoveredSlotIndex/);
    expect(appSrc).not.toMatch(/hoveredTracerId/);
    expect(appSrc).not.toMatch(/syncHoveredSlot/);
    expect(appSrc).not.toMatch(/resolveTracerHover/);
    expect(tracerViewportSrc).not.toMatch(/TracerSelection/);
    expect(tracerSceneSrc).not.toMatch(/TracerSelection/);
    expect(tracerSceneSrc).not.toMatch(/selectedId/);
    expect(hoverResolveSrc).not.toMatch(/TracerSelection/);
    expect(hoverResolveSrc).not.toMatch(/selectedId/);

    const pipelineStart = tracerViewportSrc.indexOf("const pickTracerHits");
    const downStart = tracerViewportSrc.indexOf("const onPointerDown");
    expect(pipelineStart).toBeGreaterThanOrEqual(0);
    expect(downStart).toBeGreaterThan(pipelineStart);
    const hoverPipeline = tracerViewportSrc.slice(pipelineStart, downStart);
    expect(hoverPipeline).toMatch(/writeGroundCursorHud/);
    expect(hoverPipeline).toMatch(/resolveTracerHover/);
    expect(hoverPipeline).not.toMatch(/resolveTracerPointerUp/);
    expect(hoverPipeline).not.toMatch(/onTracerSelect/);
    expect(hoverPipeline).not.toMatch(/onPathSampleSelect/);
    expect(hoverPipeline).not.toMatch(/onPlacementAttempt/);
  });

  it("clears hover on leave, no hit, Clear tracers, and hidden glyphs", () => {
    const leaveStart = tracerViewportSrc.indexOf("const onPointerLeave");
    const downStart = tracerViewportSrc.indexOf("const onPointerDown");
    const leaveBody = tracerViewportSrc.slice(leaveStart, downStart);
    expect(leaveBody).toMatch(/clearGroundCursorHud/);
    expect(leaveBody).toMatch(/syncHoveredSlot\(null\)/);
    expect(leaveBody).toMatch(/canvasCursorForTracerHover\(false\)/);

    expect(tracerSceneSrc).toMatch(/this\.hoveredOccupancyIndex = null/);
    expect(tracerSceneSrc).toMatch(/persistHoveredSlotIndex/);
    expect(tracerViewportSrc).toMatch(/clearTracerSlots\(\) \{/);
    expect(tracerViewportSrc).toMatch(/sceneRef\.current\?\.clearTracerSlots\(\)/);
  });

  it("shows pointer only for a selectable glyph or tail and keeps selected stronger", () => {
    expect(tracerViewportSrc).toMatch(/canvasCursorForTracerHover/);
    expect(tracerViewportSrc).toMatch(/syncHoveredSlot/);
    expect(tracerSceneSrc).toMatch(/createHoverHaloMarker/);
    expect(tracerSceneSrc).toMatch(/observeHoverHalo/);
    expect(tracerSceneSrc).toMatch(/resolveHoverHaloObservation/);
    expect(hoverHaloSrc).toMatch(
      /hoveredSlotIndex === input\.selectedSlotIndex/,
    );
  });

  it("does not treat airflow marks as tracer hover targets", () => {
    expect(pickVisibleSrc).not.toMatch(/visualAirflow/);
    expect(pickVisibleSrc).not.toMatch(/CometAirflow/);
    expect(tracerSceneSrc).not.toMatch(
      /pickVisibleTracerSlotAtClientPoint\([^\)]*visualAirflow/,
    );
    expect(tracerViewportSrc).not.toMatch(/pickVisibleAirflow/);
  });

  it("keeps the ground-cursor HUD on the same pointermove listener", () => {
    expect(tracerViewportSrc).toMatch(/groundCursorHudFromClientPoint/);
    expect(tracerViewportSrc).toMatch(/pointerEvents: "none"/);
    expect(tracerViewportSrc).toMatch(/aria-label="Ground cursor"/);
    const moveStart = tracerViewportSrc.indexOf("const onPointerMove");
    const leaveStart = tracerViewportSrc.indexOf("const onPointerLeave");
    const moveBody = tracerViewportSrc.slice(moveStart, leaveStart);
    expect(moveBody).toMatch(/writeGroundCursorHud/);
    expect(moveBody).toMatch(/applyHoverFromClientPoint|pointerDown/);
  });
});
