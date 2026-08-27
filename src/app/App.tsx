import { useRef, useState, type RefObject } from "react";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { EnvironmentAffordance } from "../ui/hodograph/EnvironmentAffordance.js";
import { EnvironmentSurface } from "../ui/hodograph/EnvironmentSurface.js";
import { DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY } from "../ui/hodograph/hodographOverlayVisibility.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  type ExploreEnvironmentIdentity,
} from "../explore/exploreEnvironmentIdentity.js";
import { ExploreClearTracersControl } from "../ui/tracer/ExploreClearTracersControl.js";
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
  createDemoEnvironmentalWindProfile,
  createDemoStreamwiseCrosswiseOverlay,
  createDemoVorticityLayer,
} from "./demoHodographFixture.js";
import {
  GOSHEN_2009_OBSERVED_RECORD,
  exploreEnvironmentalWindProfile,
} from "./goshenObservedEnvironment.js";
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
  const [exploreEnvironmentIdentity, setExploreEnvironmentIdentity] =
    useState<ExploreEnvironmentIdentity>(DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY);
  const [overlayVisibility, setOverlayVisibility] = useState(
    DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY,
  );
  /**
   * Guided default-open; Explore closed. App boots in Guided.
   * docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md §10.3
   */
  const [environmentOpen, setEnvironmentOpen] = useState(true);
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

  /**
   * Explore occupancy emptying. Clock continues. The placement
   * gate is unchanged. Selection / Follow follow the existing
   * clearSelectionAndInspection contract.
   * docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md §8
   */
  const handleClearTracers = () => {
    if (lab.kind !== "explore") {
      return;
    }
    lab.orchestration.clear();
    clearSelectionAndInspection();
    setPendingSeed(null);
  };

  const enterExplore = () => {
    if (lab.kind === "explore") {
      return;
    }
    clearSelectionAndInspection();
    setLab(
      createExploreLab(
        sceneSlotsRef.current!,
        exploreEnvironmentalWindProfile(exploreEnvironmentIdentity),
      ),
    );
    setAltitudeM(DEFAULT_EXPLORE_POINT_ALTITUDE_M);
    setPlacementEnabled(false);
    setPendingSeed(null);
    setWorkbenchMode(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE);
    setPauseVisualization(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION);
    setHighlightMode(DEFAULT_OPERAND_HIGHLIGHT_MODE);
    setDepthCueEnabled(false);
    setEnvironmentOpen(false);
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
    setEnvironmentOpen(true);
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

  const selectExploreEnvironment = (next: ExploreEnvironmentIdentity) => {
    if (next === exploreEnvironmentIdentity) {
      return;
    }
    setExploreEnvironmentIdentity(next);
    if (lab.kind !== "explore") {
      return;
    }
    clearSelectionAndInspection();
    setLab(
      createExploreLab(
        sceneSlotsRef.current!,
        exploreEnvironmentalWindProfile(next),
      ),
    );
    setPendingSeed(null);
    setResetEpoch((epoch) => epoch + 1);
  };

  const explore = lab.kind === "explore" ? lab : null;
  const goshenExploreActive =
    explore !== null &&
    exploreEnvironmentIdentity === EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED;
  const activeProfile = goshenExploreActive
    ? GOSHEN_2009_OBSERVED_RECORD.profile
    : createDemoEnvironmentalWindProfile();
  const points = hodographPoints(activeProfile);
  const guidedExperiment =
    lab.kind === "guided"
      ? guidedExperimentById(guidedExperimentId)
      : null;
  const followTargetResolves =
    resolveSelectedTracer(lab.simulation.particles, selection) !==
    undefined;

  const environmentSurface = (
    <EnvironmentSurface
      open={environmentOpen}
      presentation={explore !== null ? "overlay" : "column"}
      points={points}
      stormMotion={DEMO_SCENARIO.stormMotion}
      selectedHeight={
        goshenExploreActive ? undefined : DEMO_SELECTED_HEIGHT
      }
      vorticityLayer={
        goshenExploreActive ? undefined : createDemoVorticityLayer()
      }
      streamwiseCrosswiseOverlay={
        goshenExploreActive
          ? undefined
          : createDemoStreamwiseCrosswiseOverlay()
      }
      overlayVisibility={overlayVisibility}
      onOverlayVisibilityChange={setOverlayVisibility}
      onClose={() => setEnvironmentOpen(false)}
      environmentIdentity={
        explore !== null ? exploreEnvironmentIdentity : undefined
      }
      onEnvironmentIdentityChange={
        explore !== null ? selectExploreEnvironment : undefined
      }
    />
  );

  const tracerViewport = (
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
      pendingReleasePreview={lab.kind === "explore" ? pendingSeed : null}
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
  );

  return (
    <main className={explore !== null ? "app app--explore" : "app app--guided"}>
      <header className="app__header">
        <h1 className="app__title">Supercell Explorer</h1>
        <div className="app__header-tools">
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
          <EnvironmentAffordance
            expanded={environmentOpen}
            onToggle={() => setEnvironmentOpen((open) => !open)}
          />
        </div>
      </header>
      <p className="app__subtitle">
        Ground-relative hodograph. 3D tracers use a storm-relative
        laboratory frame (environmental advection relative to
        prescribed storm motion).
      </p>

      {explore !== null ? (
        <section
          className="workbench workbench--explore"
          aria-label="Explore laboratory"
        >
          <div className="workbench__column workbench__column--controls">
            <h2 className="app__panel-title">Storm-relative laboratory</h2>
            <div className="laboratory-toolbar laboratory-toolbar--explore">
              <div
                className="control-band control-band--release control-band--primary"
                aria-label="Release"
              >
                <span className="control-band__label">Release</span>
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
                    explore.tool.placementEnabled = false;
                    setPlacementEnabled(false);
                    setPendingSeed(null);
                  }}
                />
              </div>
              <div
                className="control-band control-band--runtime"
                aria-label="Runtime"
              >
                <span className="control-band__label">Runtime</span>
                <div className="control-band__row">
                  <TracerRuntimeControls
                    paused={paused}
                    timeScale={timeScale}
                    onPausedChange={setPaused}
                    onTimeScaleChange={setTimeScale}
                    onReset={handleReset}
                  />
                  <ExploreClearTracersControl onClear={handleClearTracers} />
                </div>
              </div>
              <div
                className="control-band control-band--view"
                aria-label="View"
              >
                <span className="control-band__label">View</span>
                <div className="control-band__row">
                  <ExploreFollowControl
                    followEnabled={followEnabled}
                    canFollow={followTargetResolves}
                    onFollowEnabledChange={setFollowEnabled}
                  />
                  <ExploreResetViewControl onResetView={handleResetView} />
                </div>
              </div>
              <div
                className="control-band control-band--airflow control-band--secondary"
                aria-label="Airflow"
              >
                <span className="control-band__label">Airflow</span>
                <VisualAirflowWorkbenchControls
                  mode={workbenchMode}
                  highlightMode={highlightMode}
                  depthCueEnabled={depthCueEnabled}
                  onModeChange={setWorkbenchMode}
                  onHighlightModeChange={setHighlightMode}
                  onDepthCueChange={setDepthCueEnabled}
                />
              </div>
            </div>
          </div>

          <div className="workbench__column workbench__column--viewport">
            {tracerViewport}
            {environmentSurface}
          </div>

          <div className="workbench__column workbench__column--observation">
            <TracerInspectorPanel inspection={inspection} />
            <PointDiagnosticsPanel observation={pointDiagnostics} />
          </div>
        </section>
      ) : (
        <section
          className={
            environmentOpen
              ? "workbench workbench--guided"
              : "workbench workbench--guided workbench--guided-environment-closed"
          }
          aria-label="Guided laboratory"
        >
          {environmentOpen ? (
            <div className="workbench__column workbench__column--hodograph">
              {environmentSurface}
            </div>
          ) : null}

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
              <GuidedExperimentSelector
                value={guidedExperimentId}
                onChange={selectGuidedExperiment}
              />
            </div>
            {guidedExperiment !== null && (
              <GuidedExperimentPanel experiment={guidedExperiment} />
            )}
            {tracerViewport}
          </div>

          <div className="workbench__column workbench__column--inspector">
            <TracerInspectorPanel inspection={inspection} />
          </div>
        </section>
      )}
    </main>
  );
}

