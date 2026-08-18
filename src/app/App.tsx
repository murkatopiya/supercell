import { useRef, useState, type RefObject } from "react";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";
import { HodographOverlayControls } from "../ui/hodograph/HodographOverlayControls.js";
import { HodographPanel } from "../ui/hodograph/HodographPanel.js";
import { DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY } from "../ui/hodograph/hodographOverlayVisibility.js";
import { ExplorePointReleaseControls } from "../ui/tracer/ExplorePointReleaseControls.js";
import { TracerInspectorPanel } from "../ui/tracer/TracerInspectorPanel.js";
import {
  TracerRuntimeControls,
  type TracerTimeScale,
} from "../ui/tracer/TracerRuntimeControls.js";
import {
  TracerViewport,
  type TracerViewportHandle,
} from "../ui/tracer/TracerViewport.js";
import {
  composeDemoTracerLab,
  createDemoPathHistory,
  demoKeepInactiveGlyphs,
  demoSeedsForPedagogy,
} from "./composeDemoTracerSimulation.js";
import { createExploreLab, type ExploreLab } from "./createExploreLab.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { LIVE_DEMO_TRACER_PEDAGOGY } from "./TracerPedagogy.js";
import {
  DEMO_SELECTED_HEIGHT,
  createDemoHodographPoints,
  createDemoStreamwiseCrosswiseOverlay,
  createDemoVorticityLayer,
} from "./demoHodographFixture.js";
import { DEFAULT_EXPLORE_POINT_ALTITUDE_M } from "../explore/ExplorePointReleaseTool.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";
import {
  inspectSelectedTracer,
  type InspectableVelocityOperands,
  type TracerInspection,
} from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import type { Simulation } from "../simulation/Simulation.js";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";

type GuidedLab = {
  kind: "guided";
  simulation: Simulation;
  pathHistory: TracerPathHistory | null;
  velocityObservation: InspectableVelocityOperands;
};

type Lab = GuidedLab | ExploreLab;

function createGuidedLab(): GuidedLab {
  const { simulation, velocityObservation } = composeDemoTracerLab(
    IntegrationFrame.StormRelativeLaboratory,
    LIVE_DEMO_TRACER_PEDAGOGY,
  );
  return {
    kind: "guided",
    simulation,
    pathHistory: createDemoPathHistory(
      LIVE_DEMO_TRACER_PEDAGOGY,
      simulation.particles,
    ),
    velocityObservation,
  };
}

function createSceneSlots(
  sceneHandleRef: RefObject<TracerViewportHandle | null>,
): ExploreSceneSlots {
  return {
    addTracerSlot() {
      sceneHandleRef.current?.addTracerSlot();
    },
    clearTracerSlots() {
      sceneHandleRef.current?.clearTracerSlots();
    },
    syncReleasePreview(pendingSeed) {
      sceneHandleRef.current?.syncReleasePreview(pendingSeed);
    },
    get tracerSlotCount() {
      return sceneHandleRef.current?.tracerSlotCount ?? 0;
    },
  };
}

export function App() {
  const points = createDemoHodographPoints();
  const vorticityLayer = createDemoVorticityLayer();
  const streamwiseCrosswiseOverlay = createDemoStreamwiseCrosswiseOverlay();
  const [overlayVisibility, setOverlayVisibility] = useState(
    DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY,
  );
  const sceneHandleRef = useRef<TracerViewportHandle | null>(null);
  const sceneSlotsRef = useRef<ExploreSceneSlots | null>(null);
  if (sceneSlotsRef.current === null) {
    sceneSlotsRef.current = createSceneSlots(sceneHandleRef);
  }
  const [lab, setLab] = useState<Lab>(() => createGuidedLab());
  const [paused, setPaused] = useState(false);
  const [timeScale, setTimeScale] = useState<TracerTimeScale>(1);
  const [resetEpoch, setResetEpoch] = useState(0);
  const [altitudeM, setAltitudeM] = useState(DEFAULT_EXPLORE_POINT_ALTITUDE_M);
  const [placementEnabled, setPlacementEnabled] = useState(false);
  const [pendingSeed, setPendingSeed] = useState<TracerSeedPosition | null>(
    null,
  );
  const selectionRef = useRef<TracerSelection | null>(null);
  if (selectionRef.current === null) {
    selectionRef.current = new TracerSelection();
  }
  const selection = selectionRef.current;
  const [selectedTracerId, setSelectedTracerId] = useState<number | null>(
    null,
  );
  const [inspection, setInspection] = useState<
    TracerInspection | undefined
  >(undefined);

  const mirrorSelection = () => {
    setSelectedTracerId(selection.selectedId);
  };

  const refreshInspection = () => {
    setInspection(
      inspectSelectedTracer(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        lab.velocityObservation,
      ),
    );
  };

  const clearSelectionAndInspection = () => {
    selection.clear();
    mirrorSelection();
    setInspection(undefined);
  };

  const handleReset = () => {
    if (lab.kind === "explore") {
      lab.orchestration.reset();
      setPendingSeed(null);
    } else {
      resetTracersFromSeeds(
        lab.simulation,
        demoSeedsForPedagogy(LIVE_DEMO_TRACER_PEDAGOGY),
      );
      lab.pathHistory?.clear();
      lab.pathHistory?.captureInitial(lab.simulation.particles);
    }
    setResetEpoch((epoch) => epoch + 1);
    refreshInspection();
  };

  const enterExplore = () => {
    if (lab.kind === "explore") {
      return;
    }
    clearSelectionAndInspection();
    setLab(createExploreLab(sceneSlotsRef.current!));
    setAltitudeM(DEFAULT_EXPLORE_POINT_ALTITUDE_M);
    setPlacementEnabled(false);
    setPendingSeed(null);
    setResetEpoch((epoch) => epoch + 1);
  };

  const enterGuided = () => {
    if (lab.kind === "guided") {
      return;
    }
    clearSelectionAndInspection();
    setLab(createGuidedLab());
    setPendingSeed(null);
    setPlacementEnabled(false);
    setResetEpoch((epoch) => epoch + 1);
  };

  const explore = lab.kind === "explore" ? lab : null;

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Supercell Explorer</h1>
        <div className="app__mode-switch lab-experience-switch">
          <button
            type="button"
            className="tracer-runtime-controls__button"
            aria-pressed={lab.kind === "guided"}
            onClick={enterGuided}
          >
            Guided
          </button>
          <button
            type="button"
            className="tracer-runtime-controls__button"
            aria-pressed={lab.kind === "explore"}
            onClick={enterExplore}
          >
            Explore
          </button>
        </div>
      </header>
      <p className="app__subtitle">
        Ground-relative hodograph. 3D tracers use a storm-relative
        laboratory frame (environmental advection relative to
        prescribed storm motion).
      </p>

      <section className="workbench">
        <div className="workbench__column workbench__column--hodograph">
          <h2 className="app__panel-title">Hodograph</h2>
          <HodographPanel
            points={points}
            stormMotion={DEMO_SCENARIO.stormMotion}
            selectedHeight={DEMO_SELECTED_HEIGHT}
            vorticityLayer={vorticityLayer}
            streamwiseCrosswiseOverlay={streamwiseCrosswiseOverlay}
            overlayVisibility={overlayVisibility}
          />
          <HodographOverlayControls
            value={overlayVisibility}
            onChange={setOverlayVisibility}
          />
        </div>

        <div className="workbench__column workbench__column--laboratory">
          <h2 className="app__panel-title">Storm-relative laboratory</h2>
          {lab.kind === "guided" ? (
            <p className="workbench__column-note">
              prescribed storm-relative near-ground pathline advected through a divergent horizontal outflow region
            </p>
          ) : null}
          <div className="laboratory-toolbar">
            <TracerRuntimeControls
              paused={paused}
              timeScale={timeScale}
              onPausedChange={setPaused}
              onTimeScaleChange={setTimeScale}
              onReset={handleReset}
            />
            {explore !== null && (
              <ExplorePointReleaseControls
                altitudeM={altitudeM}
                placementEnabled={placementEnabled}
                hasPending={pendingSeed !== null}
                onAltitudeChange={(next) => {
                  explore.tool.setAltitude(next);
                  setAltitudeM(explore.tool.altitudeM);
                  setPendingSeed(explore.tool.pendingSeed);
                }}
                onPlacementEnabledChange={(enabled) => {
                  explore.tool.placementEnabled = enabled;
                  setPlacementEnabled(enabled);
                }}
                onConfirm={() => {
                  explore.orchestration.confirmRelease();
                  setPendingSeed(null);
                }}
                onCancel={() => {
                  explore.orchestration.cancelPending();
                  setPendingSeed(null);
                }}
                onClear={() => {
                  explore.orchestration.clear();
                  clearSelectionAndInspection();
                  setPendingSeed(null);
                }}
              />
            )}
          </div>
          <TracerViewport
            simulation={lab.simulation}
            pathHistory={lab.pathHistory}
            keepInactiveGlyphs={
              lab.kind === "explore"
                ? false
                : demoKeepInactiveGlyphs(LIVE_DEMO_TRACER_PEDAGOGY)
            }
            timestep={DEMO_SCENARIO.simulation.timestep}
            paused={paused}
            timeScale={timeScale}
            resetEpoch={resetEpoch}
            pendingReleasePreview={
              lab.kind === "explore" ? pendingSeed : null
            }
            selectedTracerId={selectedTracerId}
            onTracerSelect={(tracerId) => {
              selection.select(tracerId);
              mirrorSelection();
              setInspection(
                inspectSelectedTracer(
                  lab.simulation.particles,
                  selection,
                  lab.simulation.clock.time,
                  lab.velocityObservation,
                ),
              );
            }}
            onSimulationAdvanced={refreshInspection}
            onPlacementAttempt={
              explore === null
                ? undefined
                : (origin, direction, pointerMovementPx) => {
                    explore.orchestration.handlePlacementAttempt(
                      origin,
                      direction,
                      pointerMovementPx,
                    );
                    setPendingSeed(explore.tool.pendingSeed);
                  }
            }
            sceneHandleRef={sceneHandleRef}
          />
        </div>

        <div className="workbench__column workbench__column--inspector">
          <TracerInspectorPanel inspection={inspection} />
        </div>
      </section>
    </main>
  );
}
