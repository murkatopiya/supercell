import { useRef, useState, type RefObject } from "react";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { HodographOverlayControls } from "../ui/hodograph/HodographOverlayControls.js";
import { HodographPanel } from "../ui/hodograph/HodographPanel.js";
import { DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY } from "../ui/hodograph/hodographOverlayVisibility.js";
import { ExplorePointReleaseControls } from "../ui/tracer/ExplorePointReleaseControls.js";
import { GuidedExperimentPanel } from "../ui/tracer/GuidedExperimentPanel.js";
import { GuidedExperimentSelector } from "../ui/tracer/GuidedExperimentSelector.js";
import { PointDiagnosticsPanel } from "../ui/tracer/PointDiagnosticsPanel.js";
import { TracerInspectorPanel } from "../ui/tracer/TracerInspectorPanel.js";
import {
  TracerRuntimeControls,
  type TracerTimeScale,
} from "../ui/tracer/TracerRuntimeControls.js";
import { VisualAirflowWorkbenchControls } from "../ui/tracer/VisualAirflowWorkbenchControls.js";
import {
  TracerViewport,
  type TracerViewportHandle,
} from "../ui/tracer/TracerViewport.js";
import {
  createExploreLab,
  resetExploreLab,
  type ExploreLab,
} from "./createExploreLab.js";
import {
  createGuidedLab,
  DEFAULT_GUIDED_EXPERIMENT_ID,
  resetGuidedLab,
  switchGuidedExperiment,
  type GuidedLab,
} from "./createGuidedLab.js";
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
  inspectSelectedPointDiagnostics,
  type PointDiagnosticObservation,
} from "../interaction/PointDiagnosticObservation.js";
import {
  inspectSelectedTracer,
  type TracerInspection,
} from "../interaction/TracerInspection.js";
import {
  TracerSelection,
  resolveSelectedTracer,
} from "../interaction/TracerSelection.js";
import { ExploreFollowControl } from "../ui/tracer/ExploreFollowControl.js";
import { ExploreResetViewControl } from "../ui/tracer/ExploreResetViewControl.js";
import {
  guidedExperimentById,
  type GuidedExperimentId,
} from "../guided/GuidedExperiment.js";
import {
  DEFAULT_OPERAND_HIGHLIGHT_MODE,
  DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION,
  DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE,
  type OperandHighlightMode,
  type VisualAirflowPauseVisualization,
  type VisualAirflowWorkbenchMode,
} from "../rendering/visualAirflowWorkbenchMode.js";
import {
  resolveStormOperandHighlightField,
} from "../visualization/operandContributionDisplay.js";

type Lab = GuidedLab | ExploreLab;

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
  const [guidedExperimentId, setGuidedExperimentId] = useState<GuidedExperimentId>(
    DEFAULT_GUIDED_EXPERIMENT_ID,
  );
  const [lab, setLab] = useState<Lab>(() =>
    createGuidedLab(DEFAULT_GUIDED_EXPERIMENT_ID),
  );
  const [paused, setPaused] = useState(false);
  const [timeScale, setTimeScale] = useState<TracerTimeScale>(1);
  const [resetEpoch, setResetEpoch] = useState(0);
  const [altitudeM, setAltitudeM] = useState(DEFAULT_EXPLORE_POINT_ALTITUDE_M);
  const [placementEnabled, setPlacementEnabled] = useState(false);
  const [pendingSeed, setPendingSeed] = useState<TracerSeedPosition | null>(
    null,
  );
  const [workbenchMode, setWorkbenchMode] =
    useState<VisualAirflowWorkbenchMode>(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE);
  const [pauseVisualization, setPauseVisualization] =
    useState<VisualAirflowPauseVisualization>(
      DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION,
    );
  const [highlightMode, setHighlightMode] = useState<OperandHighlightMode>(
    DEFAULT_OPERAND_HIGHLIGHT_MODE,
  );
  const [depthCueEnabled, setDepthCueEnabled] = useState(false);
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
  const [pointDiagnostics, setPointDiagnostics] = useState<
    PointDiagnosticObservation | undefined
  >(undefined);
  const followEnabledRef = useRef(false);
  const [followEnabled, setFollowEnabledState] = useState(false);

  const setFollowEnabled = (next: boolean) => {
    followEnabledRef.current = next;
    setFollowEnabledState(next);
  };

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
    setPointDiagnostics(
      lab.kind === "explore"
        ? inspectSelectedPointDiagnostics(
            lab.simulation.particles,
            selection,
            lab.simulation.clock.time,
            {
              tiltingTendency: lab.tiltingTendency,
              currentVerticalVorticity: lab.currentVerticalVorticity,
            },
          )
        : undefined,
    );
  };

  const clearSelectionAndInspection = () => {
    setFollowEnabled(false);
    selection.clear();
    mirrorSelection();
    setInspection(undefined);
    setPointDiagnostics(undefined);
  };

  const handleReset = () => {
    setFollowEnabled(false);
    if (lab.kind === "explore") {
      resetExploreLab(lab);
      setPendingSeed(null);
    } else {
      resetGuidedLab(lab);
    }
    setResetEpoch((epoch) => epoch + 1);
    refreshInspection();
  };

  /**
   * Camera recovery only. Follow OFF first (ref + state), then scene pose.
   * docs/architecture/37-reset-view-camera-recovery-architecture.md
   */
  const handleResetView = () => {
    setFollowEnabled(false);
    sceneHandleRef.current?.resetView();
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
    setWorkbenchMode(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE);
    setPauseVisualization(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION);
    setHighlightMode(DEFAULT_OPERAND_HIGHLIGHT_MODE);
    setDepthCueEnabled(false);
    setResetEpoch((epoch) => epoch + 1);
  };

  const enterGuided = () => {
    if (lab.kind === "guided") {
      return;
    }
    clearSelectionAndInspection();
    setLab(createGuidedLab(guidedExperimentId));
    setPendingSeed(null);
    setPlacementEnabled(false);
    setWorkbenchMode(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE);
    setPauseVisualization(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION);
    setHighlightMode(DEFAULT_OPERAND_HIGHLIGHT_MODE);
    setDepthCueEnabled(false);
    setResetEpoch((epoch) => epoch + 1);
  };

  const selectGuidedExperiment = (nextId: GuidedExperimentId) => {
    if (lab.kind !== "guided") {
      return;
    }
    const nextLab = switchGuidedExperiment(lab, nextId, selection);
    if (nextLab === lab) {
      return;
    }
    setGuidedExperimentId(nextId);
    setFollowEnabled(false);
    mirrorSelection();
    setInspection(undefined);
    setPointDiagnostics(undefined);
    setLab(nextLab);
    setResetEpoch((epoch) => epoch + 1);
  };

  const explore = lab.kind === "explore" ? lab : null;
  const guidedExperiment =
    lab.kind === "guided"
      ? guidedExperimentById(guidedExperimentId)
      : null;
  const followTargetResolves =
    resolveSelectedTracer(lab.simulation.particles, selection) !==
    undefined;

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
          <div className="laboratory-toolbar">
            <TracerRuntimeControls
              paused={paused}
              timeScale={timeScale}
              onPausedChange={setPaused}
              onTimeScaleChange={setTimeScale}
              onReset={handleReset}
            />
            {explore !== null && (
              <ExploreFollowControl
                followEnabled={followEnabled}
                canFollow={followTargetResolves}
                onFollowEnabledChange={setFollowEnabled}
              />
            )}
            {explore !== null && (
              <ExploreResetViewControl onResetView={handleResetView} />
            )}
            {lab.kind === "guided" && (
              <GuidedExperimentSelector
                value={guidedExperimentId}
                onChange={selectGuidedExperiment}
              />
            )}
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
            {explore !== null && (
              <VisualAirflowWorkbenchControls
                mode={workbenchMode}
                highlightMode={highlightMode}
                depthCueEnabled={depthCueEnabled}
                onModeChange={setWorkbenchMode}
                onHighlightModeChange={setHighlightMode}
                onDepthCueChange={setDepthCueEnabled}
              />
            )}
          </div>
          {guidedExperiment !== null && (
            <GuidedExperimentPanel experiment={guidedExperiment} />
          )}
          <TracerViewport
            simulation={lab.simulation}
            pathHistory={lab.pathHistory}
            keepInactiveGlyphs={
              lab.kind === "explore" ? false : lab.keepInactiveGlyphs
            }
            timestep={DEMO_SCENARIO.simulation.timestep}
            paused={paused}
            timeScale={timeScale}
            resetEpoch={resetEpoch}
            pendingReleasePreview={
              lab.kind === "explore" ? pendingSeed : null
            }
            selectedTracerId={selectedTracerId}
            visualAirflowPopulation={
              lab.kind === "explore" ? lab.visualAirflowPopulation : null
            }
            eulerianAirflowSamples={
              lab.kind === "explore" ? lab.eulerianAirflowSamples : null
            }
            visualAirflowField={
              lab.kind === "explore" ? lab.velocityObservation.total : null
            }
            workbenchMode={workbenchMode}
            pauseVisualization={pauseVisualization}
            highlightMode={highlightMode}
            highlightOperand={
              lab.kind === "explore" && highlightMode !== "off"
                ? resolveStormOperandHighlightField(
                    lab.velocityObservation.parts,
                    highlightMode,
                  )
                : null
            }
            depthCueEnabled={depthCueEnabled}
            onTracerSelect={(tracerId) => {
              selection.select(tracerId);
              mirrorSelection();
              refreshInspection();
            }}
            onSimulationAdvanced={refreshInspection}
            followEnabledRef={followEnabledRef}
            onFollowUnavailable={() => setFollowEnabled(false)}
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
          {lab.kind === "explore" && (
            <PointDiagnosticsPanel observation={pointDiagnostics} />
          )}
        </div>
      </section>
    </main>
  );
}

