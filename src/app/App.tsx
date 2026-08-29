import { useEffect, useRef, useState, type RefObject } from "react";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { HowItWorksAffordance } from "./HowItWorksAffordance.js";
import { HowItWorksSurface } from "./HowItWorksSurface.js";
import type { HowItWorksContext } from "./howItWorksContent.js";
import { LandingPage } from "./LandingPage.js";
import { ModeIdentity } from "./ModeIdentity.js";
import { EnvironmentAffordance } from "../ui/hodograph/EnvironmentAffordance.js";
import { EnvironmentSurface } from "../ui/hodograph/EnvironmentSurface.js";
import { DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY } from "../ui/hodograph/hodographOverlayVisibility.js";
import { INITIAL_HODOGRAPH_PANEL_GEOMETRY } from "../ui/hodograph/hodographPanelGeometry.js";
import { DEFAULT_HODOGRAPH_PLOT_VIEW } from "../ui/hodograph/hodographPlotView.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  exploreEnvironmentLabel,
  type ExploreEnvironmentIdentity,
} from "../explore/exploreEnvironmentIdentity.js";
import { ExploreClearTracersControl } from "../ui/tracer/ExploreClearTracersControl.js";
import { ExploreAuthoringHistoryControls } from "../ui/tracer/ExploreAuthoringHistoryControls.js";
import { ExplorePointReleaseControls } from "../ui/tracer/ExplorePointReleaseControls.js";
import { matchExploreAuthoringHistoryShortcut } from "../ui/tracer/exploreAuthoringHistoryShortcut.js";
import { GuidedExperimentPanel } from "../ui/tracer/GuidedExperimentPanel.js";
import { GuidedExperimentSelector } from "../ui/tracer/GuidedExperimentSelector.js";
import { PointDiagnosticsPanel } from "../ui/tracer/PointDiagnosticsPanel.js";
import { TracerInspectorPanel } from "../ui/tracer/TracerInspectorPanel.js";
import { TrajectoryTiltingVerificationPanel } from "../ui/tracer/TrajectoryTiltingVerificationPanel.js";
import { TrajectoryTiltingWhatIfPanel } from "../ui/tracer/TrajectoryTiltingWhatIfPanel.js";
import {
  TracerRuntimeControls,
  DEFAULT_TRACER_TIME_SCALE,
  type TracerTimeScale,
} from "../ui/tracer/TracerRuntimeControls.js";
import { VisualAirflowWorkbenchControls } from "../ui/tracer/VisualAirflowWorkbenchControls.js";
import { SceneToolbar } from "../ui/tracer/SceneToolbar.js";
import { CoordinateReferenceControl } from "../ui/tracer/CoordinateReferenceControl.js";
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
import { exploreEnvironmentalWindProfile } from "./goshenObservedEnvironment.js";
import { DEFAULT_EXPLORE_POINT_ALTITUDE_M } from "../explore/ExplorePointReleaseTool.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";
import {
  inspectPointDiagnosticsAt,
  inspectSelectedPointDiagnostics,
  type PointDiagnosticObservation,
} from "../interaction/PointDiagnosticObservation.js";
import {
  inspectSelectedTracer,
  inspectWorldPoint,
  type TracerInspection,
} from "../interaction/TracerInspection.js";
import {
  resolveHistoricalPathSample,
  type HistoricalPathProbe,
  type InspectionSampleMode,
} from "../interaction/HistoricalPathProbe.js";
import { tracerIdForSlot } from "../ui/tracer/resolveTracerPointerUp.js";
import {
  TracerSelection,
  resolveSelectedTracer,
} from "../interaction/TracerSelection.js";
import {
  createExploreHistoricalAnalysisTiltingView,
  exploreAnalysisTiltingExplorerActive,
  exploreHistoricalAnalysisTiltingRecordedIdentity,
  initialExploreWhatIfTheta,
  resolveExploreHistoricalAnalysisTiltingExplanation,
} from "../explore/resolveExploreHistoricalAnalysisTilting.js";
import { ExploreFollowControl } from "../ui/tracer/ExploreFollowControl.js";
import { ExploreFocusSampleControl } from "../ui/tracer/ExploreFocusSampleControl.js";
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
type AppSurface = "landing" | "laboratory";

function createSceneSlots(
  sceneHandleRef: RefObject<TracerViewportHandle | null>,
): ExploreSceneSlots {
  return {
    addTracerSlot() {
      sceneHandleRef.current?.addTracerSlot();
    },
    removeLastTracerSlot() {
      sceneHandleRef.current?.removeLastTracerSlot();
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
   * Guided default-open; Explore closed. Applied on mode entry.
   * docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md §10.3
   * docs/ui/07-app-navigation-and-mode-entry.md
   */
  const [environmentOpen, setEnvironmentOpen] = useState(true);
  const [hodographPanelGeometry, setHodographPanelGeometry] = useState(
    INITIAL_HODOGRAPH_PANEL_GEOMETRY,
  );
  const [hodographPlotView, setHodographPlotView] = useState(
    DEFAULT_HODOGRAPH_PLOT_VIEW,
  );
  const hodographHostRef = useRef<HTMLDivElement | null>(null);
  const [appSurface, setAppSurface] = useState<AppSurface>("landing");
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const howItWorksTriggerRef = useRef<HTMLButtonElement | null>(null);
  const howItWorksOpenRef = useRef(false);
  howItWorksOpenRef.current = howItWorksOpen;
  const sceneHandleRef = useRef<TracerViewportHandle | null>(null);
  const sceneSlotsRef = useRef<ExploreSceneSlots | null>(null);
  if (sceneSlotsRef.current === null) {
    sceneSlotsRef.current = createSceneSlots(sceneHandleRef);
  }
  const [guidedExperimentId, setGuidedExperimentId] = useState<GuidedExperimentId>(
    DEFAULT_GUIDED_EXPERIMENT_ID,
  );
  const [lab, setLab] = useState<Lab | null>(null);
  const [paused, setPaused] = useState(false);
  const [timeScale, setTimeScale] = useState<TracerTimeScale>(
    DEFAULT_TRACER_TIME_SCALE,
  );
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
  const [coordinateReferenceVisible, setCoordinateReferenceVisible] =
    useState(true);
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
  const [historicalProbe, setHistoricalProbe] =
    useState<HistoricalPathProbe | null>(null);
  const historicalProbeRef = useRef<HistoricalPathProbe | null>(null);
  const [thetaWhatIf, setThetaWhatIf] = useState<number | undefined>(
    undefined,
  );
  const [thetaWhatIfIdentity, setThetaWhatIfIdentity] = useState("");
  const followEnabledRef = useRef(false);
  const [followEnabled, setFollowEnabledState] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const setFollowEnabled = (next: boolean) => {
    followEnabledRef.current = next;
    setFollowEnabledState(next);
  };

  const syncAuthoringHistoryButtons = (next: {
    canUndo: boolean;
    canRedo: boolean;
  } | null) => {
    setCanUndo(next?.canUndo === true);
    setCanRedo(next?.canRedo === true);
  };

  const mirrorSelection = () => {
    setSelectedTracerId(selection.selectedId);
  };

  const setHistoricalPathProbe = (next: HistoricalPathProbe | null) => {
    historicalProbeRef.current = next;
    setHistoricalProbe(next);
  };

  const refreshInspection = () => {
    if (lab === null) {
      return;
    }
    const pathHistory = lab.pathHistory ?? null;
    const probe = historicalProbeRef.current;
    const resolved =
      probe !== null && pathHistory !== null
        ? resolveHistoricalPathSample(
            lab.simulation.particles,
            pathHistory,
            probe,
          )
        : undefined;
    if (probe !== null && resolved === undefined) {
      setHistoricalPathProbe(null);
    }
    if (resolved !== undefined) {
      setInspection(
        inspectWorldPoint(
          resolved.tracerId,
          resolved.position,
          resolved.simulationTime,
          resolved.age,
          resolved.active,
          lab.velocityObservation,
        ),
      );
      setPointDiagnostics(
        lab.kind === "explore"
          ? inspectPointDiagnosticsAt(
              resolved.tracerId,
              resolved.position,
              resolved.simulationTime,
              {
                tiltingTendency: lab.tiltingTendency,
                currentVerticalVorticity: lab.currentVerticalVorticity,
              },
            )
          : undefined,
      );
      return;
    }
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
    setHistoricalPathProbe(null);
    selection.clear();
    mirrorSelection();
    setInspection(undefined);
    setPointDiagnostics(undefined);
  };

  const handleReset = () => {
    if (lab === null) {
      return;
    }
    setFollowEnabled(false);
    setHistoricalPathProbe(null);
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

  const handleFocusSample = () => {
    const probe = historicalProbeRef.current;
    const currentLab = lab;
    if (
      probe === null ||
      currentLab === null ||
      currentLab.pathHistory == null
    ) {
      return;
    }
    const sample = resolveHistoricalPathSample(
      currentLab.simulation.particles,
      currentLab.pathHistory,
      probe,
    );
    if (sample === undefined) {
      return;
    }
    setFollowEnabled(false);
    sceneHandleRef.current?.focusPoint(sample.position);
  };

  /**
   * Explore occupancy emptying. Clock continues. The placement
   * gate is unchanged. Selection / Follow follow the existing
   * clearSelectionAndInspection contract.
   * docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md §8
   */
  const handleClearTracers = () => {
    if (lab === null || lab.kind !== "explore") {
      return;
    }
    lab.orchestration.clear();
    clearSelectionAndInspection();
    setPendingSeed(null);
    syncAuthoringHistoryButtons(lab.orchestration);
  };

  const handleExploreUndo = (): boolean => {
    if (lab === null || lab.kind !== "explore") {
      return false;
    }
    const removed = lab.orchestration.undoLastAdd();
    if (removed === null) {
      return false;
    }
    if (selection.selectedId === removed.tracerId) {
      clearSelectionAndInspection();
    } else {
      refreshInspection();
    }
    syncAuthoringHistoryButtons(lab.orchestration);
    return true;
  };

  const handleExploreRedo = (): boolean => {
    if (lab === null || lab.kind !== "explore") {
      return false;
    }
    if (!lab.orchestration.redoLastAdd()) {
      return false;
    }
    syncAuthoringHistoryButtons(lab.orchestration);
    return true;
  };

  const authoringUndoRef = useRef(handleExploreUndo);
  const authoringRedoRef = useRef(handleExploreRedo);
  authoringUndoRef.current = handleExploreUndo;
  authoringRedoRef.current = handleExploreRedo;

  useEffect(() => {
    if (lab === null || lab.kind !== "explore") {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (howItWorksOpenRef.current) {
        return;
      }
      const action = matchExploreAuthoringHistoryShortcut(event);
      if (action === null) {
        return;
      }
      const performed =
        action === "undo"
          ? authoringUndoRef.current()
          : authoringRedoRef.current();
      if (performed) {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lab]);

  const enterExplore = () => {
    if (lab !== null && lab.kind === "explore") {
      return;
    }
    clearSelectionAndInspection();
    setLab(
      createExploreLab(
        sceneSlotsRef.current!,
        exploreEnvironmentIdentity,
      ),
    );
    syncAuthoringHistoryButtons(null);
    setAltitudeM(DEFAULT_EXPLORE_POINT_ALTITUDE_M);
    setPlacementEnabled(false);
    setPendingSeed(null);
    setWorkbenchMode(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE);
    setPauseVisualization(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION);
    setHighlightMode(DEFAULT_OPERAND_HIGHLIGHT_MODE);
    setDepthCueEnabled(false);
    setCoordinateReferenceVisible(true);
    setEnvironmentOpen(false);
    setHodographPlotView(DEFAULT_HODOGRAPH_PLOT_VIEW);
    setTimeScale(DEFAULT_TRACER_TIME_SCALE);
    setAppSurface("laboratory");
    setResetEpoch((epoch) => epoch + 1);
  };

  const enterGuided = () => {
    if (lab !== null && lab.kind === "guided") {
      return;
    }
    clearSelectionAndInspection();
    setLab(createGuidedLab(guidedExperimentId));
    syncAuthoringHistoryButtons(null);
    setPendingSeed(null);
    setPlacementEnabled(false);
    setWorkbenchMode(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE);
    setPauseVisualization(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION);
    setHighlightMode(DEFAULT_OPERAND_HIGHLIGHT_MODE);
    setDepthCueEnabled(false);
    setCoordinateReferenceVisible(true);
    setEnvironmentOpen(true);
    setHodographPlotView(DEFAULT_HODOGRAPH_PLOT_VIEW);
    setTimeScale(DEFAULT_TRACER_TIME_SCALE);
    setAppSurface("laboratory");
    setResetEpoch((epoch) => epoch + 1);
  };

  const selectGuidedExperiment = (nextId: GuidedExperimentId) => {
    if (lab === null || lab.kind !== "guided") {
      return;
    }
    const nextLab = switchGuidedExperiment(lab, nextId, selection);
    if (nextLab === lab) {
      return;
    }
    setGuidedExperimentId(nextId);
    setFollowEnabled(false);
    setHistoricalPathProbe(null);
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
    setHodographPlotView(DEFAULT_HODOGRAPH_PLOT_VIEW);
    if (lab === null || lab.kind !== "explore") {
      return;
    }
    clearSelectionAndInspection();
    setLab(
      createExploreLab(
        sceneSlotsRef.current!,
        next,
      ),
    );
    setPlacementEnabled(false);
    setPendingSeed(null);
    setResetEpoch((epoch) => epoch + 1);
    syncAuthoringHistoryButtons(null);
  };

  const openHowItWorks = (trigger: HTMLButtonElement) => {
    howItWorksTriggerRef.current = trigger;
    setHowItWorksOpen(true);
  };

  const closeHowItWorks = () => {
    setHowItWorksOpen(false);
  };

  const howItWorksContext: HowItWorksContext =
    appSurface === "landing" || lab === null
      ? "landing"
      : lab.kind === "explore"
        ? "explore"
        : "guided";

  const howItWorksSurface = (
    <HowItWorksSurface
      open={howItWorksOpen}
      context={howItWorksContext}
      onClose={closeHowItWorks}
      returnFocusRef={howItWorksTriggerRef}
    />
  );

  const returnToLanding = () => {
    clearSelectionAndInspection();
    setPendingSeed(null);
    setPlacementEnabled(false);
    setLab(null);
    syncAuthoringHistoryButtons(null);
    setAppSurface("landing");
  };

  if (appSurface === "landing" || lab === null) {
    return (
      <>
        <LandingPage
          onEnterGuided={enterGuided}
          onEnterExplore={enterExplore}
          onOpenHowItWorks={openHowItWorks}
          howItWorksOpen={howItWorksOpen}
        />
        {howItWorksSurface}
      </>
    );
  }

  const explore = lab.kind === "explore" ? lab : null;
  const observedProfile =
    explore !== null
      ? exploreEnvironmentalWindProfile(exploreEnvironmentIdentity)
      : undefined;
  const observedExploreActive = observedProfile !== undefined;
  const activeProfile =
    observedProfile ?? createDemoEnvironmentalWindProfile();
  const points = hodographPoints(activeProfile);
  const guidedExperiment =
    lab.kind === "guided"
      ? guidedExperimentById(guidedExperimentId)
      : null;
  const followTargetResolves =
    resolveSelectedTracer(lab.simulation.particles, selection) !==
    undefined;
  const historicalSample =
    historicalProbe !== null && lab.pathHistory != null
      ? resolveHistoricalPathSample(
          lab.simulation.particles,
          lab.pathHistory,
          historicalProbe,
        )
      : undefined;
  const inspectionMode: InspectionSampleMode =
    historicalSample !== undefined ? "historical" : "current";

  const analysisTiltingExplorerOn =
    explore !== null &&
    exploreAnalysisTiltingExplorerActive(
      exploreEnvironmentIdentity,
      historicalSample !== undefined,
    );
  const analysisTiltingExplanation =
    analysisTiltingExplorerOn &&
    explore !== null &&
    historicalSample !== undefined
      ? resolveExploreHistoricalAnalysisTiltingExplanation(
          explore.analysisColumn,
          explore.tiltingTendency.updraft,
          historicalSample.position,
          historicalSample.simulationTime,
        )
      : undefined;
  const analysisTiltingRecordedIdentity =
    analysisTiltingExplorerOn && historicalSample !== undefined
      ? exploreHistoricalAnalysisTiltingRecordedIdentity(
          exploreEnvironmentIdentity,
          historicalSample.tracerId,
          historicalSample.historyIndex,
          historicalSample.position,
          historicalSample.simulationTime,
        )
      : "";
  const pendingThetaWhatIf =
    analysisTiltingRecordedIdentity !== thetaWhatIfIdentity
      ? initialExploreWhatIfTheta(analysisTiltingExplanation)
      : thetaWhatIf;
  if (analysisTiltingRecordedIdentity !== thetaWhatIfIdentity) {
    setThetaWhatIfIdentity(analysisTiltingRecordedIdentity);
    setThetaWhatIf(pendingThetaWhatIf);
  }
  const analysisTiltingView =
    analysisTiltingExplanation !== undefined &&
    historicalSample !== undefined
      ? createExploreHistoricalAnalysisTiltingView(
          analysisTiltingExplanation,
          {
            position: historicalSample.position,
            simulationTime: historicalSample.simulationTime,
          },
          pendingThetaWhatIf,
        )
      : undefined;

  const environmentSurface = (
    <EnvironmentSurface
      open={environmentOpen}
      points={points}
      stormMotion={DEMO_SCENARIO.stormMotion}
      selectedHeight={
        observedExploreActive ? undefined : DEMO_SELECTED_HEIGHT
      }
      vorticityLayer={
        observedExploreActive ? undefined : createDemoVorticityLayer()
      }
      streamwiseCrosswiseOverlay={
        observedExploreActive
          ? undefined
          : createDemoStreamwiseCrosswiseOverlay()
      }
      overlayVisibility={overlayVisibility}
      onOverlayVisibilityChange={setOverlayVisibility}
      onClose={() => setEnvironmentOpen(false)}
      panelGeometry={hodographPanelGeometry}
      onPanelGeometryChange={setHodographPanelGeometry}
      plotView={hodographPlotView}
      onPlotViewChange={setHodographPlotView}
      boundsElementRef={hodographHostRef}
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
      analysisColumn={explore?.analysisColumn ?? null}
      analysisUpdraft={
        explore !== null ? explore.tiltingTendency.updraft : null
      }
      analysisTiltingGlyphModel={
        analysisTiltingView?.glyphModel.kind === "SUPPORTED"
          ? analysisTiltingView.glyphModel
          : null
      }
      analysisTiltingWhatIfModel={
        analysisTiltingView?.whatIfModel.kind === "AVAILABLE"
          ? analysisTiltingView.whatIfModel
          : null
      }
      timestep={DEMO_SCENARIO.simulation.timestep}
      paused={paused || howItWorksOpen}
      timeScale={timeScale}
      resetEpoch={resetEpoch}
      pendingReleasePreview={lab.kind === "explore" ? pendingSeed : null}
      selectedTracerId={selectedTracerId}
      historicalProbePosition={historicalSample?.position ?? null}
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
      coordinateReferenceVisible={coordinateReferenceVisible}
      onTracerSelect={(tracerId) => {
        setHistoricalPathProbe(null);
        selection.select(tracerId);
        mirrorSelection();
        refreshInspection();
      }}
      onPathSampleSelect={(slotIndex, historyIndex) => {
        const tracerId = tracerIdForSlot(
          lab.simulation.particles,
          slotIndex,
        );
        if (tracerId === undefined) {
          return;
        }
        setHistoricalPathProbe({ tracerId, historyIndex });
        refreshInspection();
      }}
      onSimulationAdvanced={refreshInspection}
      followEnabledRef={followEnabledRef}
      onFollowUnavailable={() => setFollowEnabled(false)}
      overlay={
        <CoordinateReferenceControl
          visible={coordinateReferenceVisible}
          onVisibleChange={setCoordinateReferenceVisible}
        />
      }
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
    <>
    <main className={explore !== null ? "app app--explore" : "app app--guided"}>
      <header className="app__header">
        <ModeIdentity
          mode={explore !== null ? "Explore" : "Guided"}
          onReturnToLanding={returnToLanding}
        />
        <div className="app__header-tools">
          <EnvironmentAffordance
            expanded={environmentOpen}
            onToggle={() => setEnvironmentOpen((open) => !open)}
          />
          <HowItWorksAffordance
            expanded={howItWorksOpen}
            onOpen={openHowItWorks}
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
            <p className="workbench__column-note">
              {exploreEnvironmentLabel(exploreEnvironmentIdentity)}
            </p>
            {explore.analysisColumn !== null ? (
              <p className="workbench__column-note">
                Analysis T1 along recorded path
              </p>
            ) : null}
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
                    syncAuthoringHistoryButtons(explore.orchestration);
                  }}
                  onCancel={() => {
                    explore.orchestration.cancelPending();
                    explore.tool.placementEnabled = false;
                    setPlacementEnabled(false);
                    setPendingSeed(null);
                  }}
                />
                <ExploreAuthoringHistoryControls
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={() => {
                    handleExploreUndo();
                  }}
                  onRedo={() => {
                    handleExploreRedo();
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
                  <ExploreClearTracersControl
                    tracerCount={explore.simulation.particles.length}
                    onClear={handleClearTracers}
                  />
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
                  <ExploreFocusSampleControl
                    canFocus={historicalSample !== undefined}
                    onFocusSample={handleFocusSample}
                  />
                  <ExploreResetViewControl onResetView={handleResetView} />
                </div>
              </div>
            </div>
          </div>

          <div className="workbench__column workbench__column--viewport">
            <SceneToolbar>
              <VisualAirflowWorkbenchControls
                mode={workbenchMode}
                highlightMode={highlightMode}
                depthCueEnabled={depthCueEnabled}
                onModeChange={setWorkbenchMode}
                onHighlightModeChange={setHighlightMode}
                onDepthCueChange={setDepthCueEnabled}
              />
            </SceneToolbar>
            <div className="workbench__hodograph-host" ref={hodographHostRef}>
              {tracerViewport}
              {environmentSurface}
            </div>
          </div>

          <div className="workbench__column workbench__column--observation">
            <TracerInspectorPanel
              inspection={inspection}
              mode={inspectionMode}
            />
            <PointDiagnosticsPanel
              observation={pointDiagnostics}
              mode={inspectionMode}
            />
            {analysisTiltingExplorerOn ? (
              <>
                <TrajectoryTiltingVerificationPanel
                  model={analysisTiltingView?.verificationModel}
                />
                <TrajectoryTiltingWhatIfPanel
                  result={analysisTiltingView?.whatIfModel}
                  onThetaWhatIfChange={setThetaWhatIf}
                  onReset={() =>
                    setThetaWhatIf(
                      initialExploreWhatIfTheta(analysisTiltingExplanation),
                    )
                  }
                />
              </>
            ) : null}
          </div>
        </section>
      ) : (
        <section
          className="workbench workbench--guided workbench--guided-environment-closed"
          aria-label="Guided laboratory"
        >
          <div className="workbench__column workbench__column--laboratory">
            <h2 className="app__panel-title">Storm-relative laboratory</h2>
            <div className="laboratory-toolbar laboratory-toolbar--guided">
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
            <div className="workbench__hodograph-host" ref={hodographHostRef}>
              {tracerViewport}
              {environmentSurface}
            </div>
          </div>

          <div className="workbench__column workbench__column--inspector">
            <TracerInspectorPanel
              inspection={inspection}
              mode={inspectionMode}
            />
          </div>
        </section>
      )}
    </main>
    {howItWorksSurface}
    </>
  );
}

