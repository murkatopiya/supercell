import { describe, expect, it } from "vitest";
import { inspectSelectedPointDiagnostics } from "../interaction/PointDiagnosticObservation.js";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { applyDeepStormTracerViewPose } from "../rendering/applyDeepStormTracerViewPose.js";
import { DEEP_STORM_TRACER_VIEW } from "../rendering/deepStormTracerView.js";
import {
  copyFollowPoint,
  translateCameraFollowTarget,
} from "../rendering/translateCameraFollowTarget.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { viewportFollowSync } from "../ui/tracer/viewportFollowSync.js";
import {
  createExploreLab,
  resetExploreLab,
} from "./createExploreLab.js";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "./composeDemoTracerSimulation.js";
import appSrc from "./App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import inspectorPanelSrc from "../ui/tracer/TracerInspectorPanel.tsx?raw";
import pointDiagnosticsPanelSrc from "../ui/tracer/PointDiagnosticsPanel.tsx?raw";
import workbenchControlsSrc from "../ui/tracer/VisualAirflowWorkbenchControls.tsx?raw";
import resetViewControlSrc from "../ui/tracer/ExploreResetViewControl.tsx?raw";

const SEED_A = { x: -2000, y: 2000, z: 0 };
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

/**
 * Headless App↔viewport↔scene stand-in for Reset View Follow-OFF ordering.
 */
function createResetViewProduct() {
  const cameraPosition = {
    x: DEEP_STORM_TRACER_VIEW.cameraPosition.x as number,
    y: DEEP_STORM_TRACER_VIEW.cameraPosition.y as number,
    z: DEEP_STORM_TRACER_VIEW.cameraPosition.z as number,
    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
    },
  };
  const target = {
    x: DEEP_STORM_TRACER_VIEW.target.x as number,
    y: DEEP_STORM_TRACER_VIEW.target.y as number,
    z: DEEP_STORM_TRACER_VIEW.target.z as number,
    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
    },
  };
  const followEnabledRef = { current: false };
  let followEnabledState = false;
  return {
    cameraPosition,
    target,
    enablePan: true,
    followPoint: null as { x: number; y: number; z: number } | null,
    followEnabledRef,
    get followEnabled() {
      return followEnabledState;
    },
    setFollowEnabled(next: boolean) {
      followEnabledRef.current = next;
      followEnabledState = next;
    },
    setFollowPoint(position: { x: number; y: number; z: number }) {
      this.followPoint = copyFollowPoint(position);
      translateCameraFollowTarget(
        this.cameraPosition,
        this.target,
        this.followPoint,
      );
      this.enablePan = false;
    },
    clearFollowPoint() {
      this.followPoint = null;
      this.enablePan = true;
    },
    resetView() {
      this.followPoint = null;
      this.enablePan = true;
      applyDeepStormTracerViewPose(this.cameraPosition, this.target);
    },
    /**
     * Same order as App.handleResetView: Follow OFF (ref first), then scene.
     */
    handleResetView() {
      this.setFollowEnabled(false);
      this.resetView();
    },
    /**
     * One rAF sync after glyph sync — mirrors TracerViewport.sync follow block.
     */
    syncFollow(particles: readonly { tracerId: number; position: { x: number; y: number; z: number } }[], selectedTracerId: number | null) {
      const follow = viewportFollowSync({
        followEnabled: this.followEnabledRef.current === true,
        particles,
        selectedTracerId,
      });
      if (follow.kind === "set") {
        this.setFollowPoint(follow.position);
      } else {
        this.clearFollowPoint();
      }
    },
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

describe("Explore Reset View App wiring", () => {
  it("orders Follow OFF before resetView via followEnabledRef and imperative handle", () => {
    const handler = appSrc.slice(
      appSrc.indexOf("const handleResetView"),
      appSrc.indexOf("const enterExplore"),
    );
    expect(handler).toMatch(/setFollowEnabled\(false\)/);
    expect(handler).toMatch(/sceneHandleRef\.current\?\.resetView\(\)/);
    const offAt = handler.indexOf("setFollowEnabled(false)");
    const resetAt = handler.indexOf("sceneHandleRef.current?.resetView()");
    expect(offAt).toBeGreaterThanOrEqual(0);
    expect(resetAt).toBeGreaterThan(offAt);

    expect(tracerViewportSrc).toMatch(/resetView\(\)\s*\{\s*sceneRef\.current\?\.resetView\(\);\s*\}/s);
    expect(tracerSceneSrc).toMatch(/resetView\(\): void/);
    expect(appSrc).not.toMatch(/viewResetEpoch/);
    expect(appSrc).not.toMatch(/CameraState/);
    expect(tracerViewportSrc).not.toMatch(/CameraState/);
  });

  it("restores DEEP_STORM_TRACER_VIEW from an arbitrary displaced pose when Follow is OFF", () => {
    const product = createResetViewProduct();
    product.cameraPosition.set(4000, -100, 8000);
    product.target.set(50, 60, 70);
    product.handleResetView();
    expect(product.followEnabled).toBe(false);
    expect(product.followEnabledRef.current).toBe(false);
    expect({
      x: product.cameraPosition.x,
      y: product.cameraPosition.y,
      z: product.cameraPosition.z,
    }).toEqual(DEEP_STORM_TRACER_VIEW.cameraPosition);
    expect({
      x: product.target.x,
      y: product.target.y,
      z: product.target.z,
    }).toEqual(DEEP_STORM_TRACER_VIEW.target);
  });

  it("turns Follow OFF, clears follow point, and keeps rest pose across a later sync", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    const product = createResetViewProduct();
    product.setFollowEnabled(true);
    product.syncFollow(lab.simulation.particles, selection.selectedId);
    expect(product.followPoint).not.toBeNull();
    expect(product.enablePan).toBe(false);

    product.handleResetView();
    expect(product.followEnabled).toBe(false);
    expect(product.followPoint).toBeNull();
    expect(product.enablePan).toBe(true);
    expect({
      x: product.cameraPosition.x,
      y: product.cameraPosition.y,
      z: product.cameraPosition.z,
    }).toEqual(DEEP_STORM_TRACER_VIEW.cameraPosition);

    lab.simulation.step(DT);
    product.syncFollow(lab.simulation.particles, selection.selectedId);
    expect(product.followPoint).toBeNull();
    expect({
      x: product.cameraPosition.x,
      y: product.cameraPosition.y,
      z: product.cameraPosition.z,
    }).toEqual(DEEP_STORM_TRACER_VIEW.cameraPosition);
    expect({
      x: product.target.x,
      y: product.target.y,
      z: product.target.z,
    }).toEqual(DEEP_STORM_TRACER_VIEW.target);
  });

  it("preserves selection, inspection, diagnostics, and pending preview across Reset View", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    lab.simulation.step(DT);
    const inspectionBefore = inspectSelectedTracer(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      lab.velocityObservation,
    );
    const diagnosticsBefore = observeExplore(lab, selection);
    lab.tool.setAltitude(250);
    lab.tool.pickOnGroundReferencePlane(
      { x: 100, y: 10, z: -50 },
      { x: 0, y: -1, z: 0 },
    );
    const pendingBefore = lab.tool.pendingSeed;
    expect(pendingBefore).toEqual({ x: 100, y: 250, z: -50 });

    const product = createResetViewProduct();
    product.setFollowEnabled(true);
    product.syncFollow(lab.simulation.particles, selection.selectedId);
    const clockBefore = lab.simulation.clock.time;
    const particleBefore = {
      ...lab.simulation.particles[0]!.position,
    };
    const pathCountBefore = lab.pathHistory.pointsFor(0).length;

    product.handleResetView();

    expect(selection.selectedId).toBe(lab.simulation.particles[0]!.tracerId);
    expect(
      inspectSelectedTracer(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        lab.velocityObservation,
      ),
    ).toEqual(inspectionBefore);
    expect(observeExplore(lab, selection)).toEqual(diagnosticsBefore);
    expect(lab.tool.pendingSeed).toEqual(pendingBefore);
    expect(lab.simulation.clock.time).toBe(clockBefore);
    expect(lab.simulation.particles[0]!.position).toEqual(particleBefore);
    expect(lab.pathHistory.pointsFor(0).length).toBe(pathCountBefore);
    expect(lab.velocityObservation.parts!.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);

    expect(appSrc).toMatch(/const handleResetView/);
    const handler = appSrc.slice(
      appSrc.indexOf("const handleResetView"),
      appSrc.indexOf("const enterExplore"),
    );
    expect(handler).not.toMatch(/selection\.clear/);
    expect(handler).not.toMatch(/setInspection/);
    expect(handler).not.toMatch(/setPointDiagnostics/);
    expect(handler).not.toMatch(/setPendingSeed/);
    expect(handler).not.toMatch(/resetExploreLab/);
    expect(handler).not.toMatch(/setResetEpoch/);
    expect(inspectorPanelSrc).not.toMatch(/Reset View/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/Reset View/);
    expect(workbenchControlsSrc).not.toMatch(/Reset View/);
  });

  it("keeps selection halo ownership outside Reset View (syncSelectedSlot unchanged)", () => {
    expect(tracerSceneSrc).toMatch(/syncSelectedSlot/);
    const resetBody = tracerSceneSrc.slice(
      tracerSceneSrc.indexOf("resetView(): void"),
      tracerSceneSrc.indexOf("resetView(): void") + 350,
    );
    expect(resetBody).not.toMatch(/selectedSlotIndex/);
    expect(resetBody).not.toMatch(/observeSelectionHalo/);
    expect(resetBody).not.toMatch(/selectionHalo/);
  });

  it("does not change simulation Reset, Clear, or manual Follow OFF camera semantics", () => {
    const resetBlock = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const handleResetView"),
    );
    expect(resetBlock).toMatch(/setFollowEnabled\(false\)/);
    expect(resetBlock).not.toMatch(/resetView/);
    expect(resetBlock).not.toMatch(/DEEP_STORM_TRACER_VIEW/);

    expect(appSrc).toMatch(
      /orchestration\.clear\(\);\s*clearSelectionAndInspection\(\)/s,
    );
    const clearSelection = appSrc.slice(
      appSrc.indexOf("const clearSelectionAndInspection"),
      appSrc.indexOf("const handleReset"),
    );
    expect(clearSelection).toMatch(/setFollowEnabled\(false\)/);
    expect(clearSelection).not.toMatch(/resetView/);

    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    const product = createResetViewProduct();
    product.setFollowEnabled(true);
    product.syncFollow(lab.simulation.particles, selection.selectedId);
    const followedCamera = {
      x: product.cameraPosition.x,
      y: product.cameraPosition.y,
      z: product.cameraPosition.z,
    };
    const followedTarget = {
      x: product.target.x,
      y: product.target.y,
      z: product.target.z,
    };

    product.setFollowEnabled(false);
    product.syncFollow(lab.simulation.particles, selection.selectedId);
    expect(product.followPoint).toBeNull();
    expect({
      x: product.cameraPosition.x,
      y: product.cameraPosition.y,
      z: product.cameraPosition.z,
    }).toEqual(followedCamera);
    expect({
      x: product.target.x,
      y: product.target.y,
      z: product.target.z,
    }).toEqual(followedTarget);

    product.setFollowEnabled(true);
    product.syncFollow(lab.simulation.particles, selection.selectedId);
    const afterFollow = {
      camera: {
        x: product.cameraPosition.x,
        y: product.cameraPosition.y,
        z: product.cameraPosition.z,
      },
      target: {
        x: product.target.x,
        y: product.target.y,
        z: product.target.z,
      },
    };
    product.setFollowEnabled(false);
    resetExploreLab(lab);
    product.syncFollow(lab.simulation.particles, selection.selectedId);
    expect({
      x: product.cameraPosition.x,
      y: product.cameraPosition.y,
      z: product.cameraPosition.z,
    }).toEqual(afterFollow.camera);
    expect({
      x: product.target.x,
      y: product.target.y,
      z: product.target.z,
    }).toEqual(afterFollow.target);

    lab.session.releasePoint(SEED_A);
    selection.select(lab.simulation.particles[0]!.tracerId);
    product.setFollowEnabled(true);
    product.syncFollow(lab.simulation.particles, selection.selectedId);
    const beforeClear = {
      camera: {
        x: product.cameraPosition.x,
        y: product.cameraPosition.y,
        z: product.cameraPosition.z,
      },
      target: {
        x: product.target.x,
        y: product.target.y,
        z: product.target.z,
      },
    };
    lab.orchestration.clear();
    selection.clear();
    product.setFollowEnabled(false);
    product.syncFollow(lab.simulation.particles, selection.selectedId);
    expect({
      x: product.cameraPosition.x,
      y: product.cameraPosition.y,
      z: product.cameraPosition.z,
    }).toEqual(beforeClear.camera);
    expect({
      x: product.target.x,
      y: product.target.y,
      z: product.target.z,
    }).toEqual(beforeClear.target);
  });

  it("is idempotent when Reset View is invoked repeatedly at rest", () => {
    const product = createResetViewProduct();
    product.cameraPosition.set(1, 2, 3);
    product.target.set(4, 5, 6);
    product.handleResetView();
    const first = {
      camera: {
        x: product.cameraPosition.x,
        y: product.cameraPosition.y,
        z: product.cameraPosition.z,
      },
      target: {
        x: product.target.x,
        y: product.target.y,
        z: product.target.z,
      },
    };
    product.handleResetView();
    product.handleResetView();
    expect({
      x: product.cameraPosition.x,
      y: product.cameraPosition.y,
      z: product.cameraPosition.z,
    }).toEqual(first.camera);
    expect({
      x: product.target.x,
      y: product.target.y,
      z: product.target.z,
    }).toEqual(first.target);
    expect(first.camera).toEqual(DEEP_STORM_TRACER_VIEW.cameraPosition);
    expect(first.target).toEqual(DEEP_STORM_TRACER_VIEW.target);
    expect(product.followEnabled).toBe(false);
  });

  it("keeps Guided free of the Reset View control and documents Explore mount", () => {
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).toMatch(/ExploreResetViewControl/);
    expect(controls).toMatch(/onResetView=\{handleResetView\}/);
    expect(resetViewControlSrc).toContain("Reset View");
    expect(resetViewControlSrc).toContain(
      'aria-label="Reset camera to storm view"',
    );
    expect(resetViewControlSrc).not.toContain("disabled");
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/ExploreResetViewControl/);
  });
});
