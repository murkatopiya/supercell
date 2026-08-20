import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { Simulation } from "../simulation/Simulation.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { inspectSelectedPointDiagnostics } from "../interaction/PointDiagnosticObservation.js";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { viewportFollowSync } from "../ui/tracer/viewportFollowSync.js";
import { DEEP_STORM_TRACER_VIEW } from "../rendering/deepStormTracerView.js";
import {
  copyFollowPoint,
  translateCameraFollowTarget,
} from "../rendering/translateCameraFollowTarget.js";
import { createExploreLab, resetExploreLab } from "./createExploreLab.js";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "./composeDemoTracerSimulation.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import appSrc from "./App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import simulationSrc from "../simulation/Simulation.ts?raw";
import inspectorPanelSrc from "../ui/tracer/TracerInspectorPanel.tsx?raw";
import pointDiagnosticsPanelSrc from "../ui/tracer/PointDiagnosticsPanel.tsx?raw";

const SEED_A = { x: -2000, y: 2000, z: 0 };
const SEED_B = { x: 500, y: 1500, z: -400 };
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

function createFollowOrbit() {
  const cameraPosition = { ...DEEP_STORM_TRACER_VIEW.cameraPosition };
  const target = { ...DEEP_STORM_TRACER_VIEW.target };
  return {
    cameraPosition,
    target,
    enablePan: true,
    followPoint: null as { x: number; y: number; z: number } | null,
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
    apply(command: ReturnType<typeof viewportFollowSync>) {
      if (command.kind === "set") {
        this.setFollowPoint(command.position);
        return;
      }
      this.clearFollowPoint();
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

describe("Explore Follow App wiring", () => {
  it("owns followEnabled on App, default false, not on scene/selection/simulation", () => {
    expect(appSrc).toMatch(
      /const \[followEnabled, setFollowEnabledState\] = useState\(false\)/,
    );
    expect(appSrc).toMatch(/followEnabledRef = useRef\(false\)/);
    expect(appSrc).toMatch(/followEnabledRef=\{followEnabledRef\}/);
    expect(appSrc).toMatch(/onFollowUnavailable=\{\(\) => setFollowEnabled\(false\)\}/);
    expect(appSrc).toMatch(/resolveSelectedTracer\(/);
    expect(tracerSceneSrc).not.toMatch(/followEnabled/);
    expect(tracerSceneSrc).not.toMatch(/TracerSelection/);
    expect(tracerViewportSrc).not.toMatch(/TracerSelection/);
    expect(tracerViewportSrc).not.toMatch(/resolveSelectedTracer/);
    expect(simulationSrc).not.toMatch(/followEnabled/);
    expect(simulationSrc).not.toMatch(/setFollowPoint/);
  });

  it("applies Follow after glyph sync from live selected P, not from a copied Vec3 prop", () => {
    expect(tracerViewportSrc).toMatch(/syncFromParticles\(simulation\.particles\)/);
    expect(tracerViewportSrc).toMatch(/viewportFollowSync/);
    expect(tracerViewportSrc).toMatch(/scene\.setFollowPoint\(follow\.position\)/);
    expect(tracerViewportSrc).toMatch(/scene\.clearFollowPoint\(\)/);
    expect(tracerViewportSrc).toMatch(/follow\.kind === "unavailable"/);
    expect(tracerViewportSrc).not.toMatch(/followPoint\?:/);
    expect(tracerViewportSrc).not.toMatch(
      /simulation,\s*timestep,\s*pathHistory,\s*keepInactiveGlyphs,\s*visualAirflowPopulation,\s*followEnabled/,
    );
    const sync = tracerViewportSrc.slice(
      tracerViewportSrc.indexOf("const sync = () => {"),
      tracerViewportSrc.indexOf("resize();"),
    );
    expect(sync.indexOf("syncFromParticles")).toBeLessThan(
      sync.indexOf("viewportFollowSync"),
    );
    expect(sync.indexOf("viewportFollowSync")).toBeGreaterThan(
      sync.indexOf("syncSelectedSlot"),
    );
  });

  it("does not auto-enable Follow or move the camera on glyph select", () => {
    const selectBlock = appSrc.slice(
      appSrc.indexOf("onTracerSelect="),
      appSrc.indexOf("onSimulationAdvanced"),
    );
    expect(selectBlock).toMatch(/selection\.select\(tracerId\)/);
    expect(selectBlock).toMatch(/mirrorSelection/);
    expect(selectBlock).toMatch(/refreshInspection/);
    expect(selectBlock).not.toMatch(/setFollowEnabled/);
    expect(selectBlock).not.toMatch(/setFollowPoint/);

    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const orbit = createFollowOrbit();
    const restCamera = { ...orbit.cameraPosition };
    const restTarget = { ...orbit.target };
    orbit.apply(
      viewportFollowSync({
        followEnabled: false,
        particles: lab.simulation.particles,
        selectedTracerId: lab.simulation.particles[0]!.tracerId,
      }),
    );
    expect(orbit.followPoint).toBeNull();
    expect(orbit.cameraPosition).toEqual(restCamera);
    expect(orbit.target).toEqual(restTarget);
    expect(orbit.enablePan).toBe(true);
  });

  it("explicit Follow ON frames the current selected tracer", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const particle = lab.simulation.particles[0]!;
    const orbit = createFollowOrbit();
    const restOffset = {
      x: orbit.cameraPosition.x - orbit.target.x,
      y: orbit.cameraPosition.y - orbit.target.y,
      z: orbit.cameraPosition.z - orbit.target.z,
    };
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: lab.simulation.particles,
        selectedTracerId: particle.tracerId,
      }),
    );
    expect(orbit.followPoint).toEqual(particle.position);
    expect(orbit.target).toEqual(particle.position);
    expect(orbit.cameraPosition).toEqual({
      x: particle.position.x + restOffset.x,
      y: particle.position.y + restOffset.y,
      z: particle.position.z + restOffset.z,
    });
    expect(orbit.enablePan).toBe(false);
  });

  it("manual Follow OFF clears the follow point and leaves pose, selection, and diagnostics", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    const before = observeExplore(lab, selection)!;
    const inspection = inspectSelectedTracer(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      lab.velocityObservation,
    )!;
    const orbit = createFollowOrbit();
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: lab.simulation.particles,
        selectedTracerId: selection.selectedId,
      }),
    );
    const camera = { ...orbit.cameraPosition };
    const target = { ...orbit.target };
    orbit.apply(
      viewportFollowSync({
        followEnabled: false,
        particles: lab.simulation.particles,
        selectedTracerId: selection.selectedId,
      }),
    );
    expect(orbit.followPoint).toBeNull();
    expect(orbit.enablePan).toBe(true);
    expect(orbit.cameraPosition).toEqual(camera);
    expect(orbit.target).toEqual(target);
    expect(selection.selectedId).toBe(1);
    expect(observeExplore(lab, selection)).toEqual(before);
    expect(
      inspectSelectedTracer(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        lab.velocityObservation,
      ),
    ).toEqual(inspection);
    expect(appSrc).toMatch(/onFollowEnabledChange=\{setFollowEnabled\}/);
  });
});

describe("Explore Follow lifecycle", () => {
  it("Follow ON uses the new current P after the selected tracer moves", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const particle = lab.simulation.particles[0]!;
    const orbit = createFollowOrbit();
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: lab.simulation.particles,
        selectedTracerId: particle.tracerId,
      }),
    );
    const kept = {
      x: orbit.cameraPosition.x - orbit.target.x,
      y: orbit.cameraPosition.y - orbit.target.y,
      z: orbit.cameraPosition.z - orbit.target.z,
    };
    lab.simulation.step(DT);
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: lab.simulation.particles,
        selectedTracerId: particle.tracerId,
      }),
    );
    expect(orbit.target).toEqual(particle.position);
    expect(orbit.followPoint).toEqual(particle.position);
    expect({
      x: orbit.cameraPosition.x - orbit.target.x,
      y: orbit.cameraPosition.y - orbit.target.y,
      z: orbit.cameraPosition.z - orbit.target.z,
    }).toEqual(kept);
  });

  it("Follow ON + A→B retargets to B and stays ON", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    lab.session.releasePoint(SEED_B);
    const a = lab.simulation.particles[0]!;
    const b = lab.simulation.particles[1]!;
    const followEnabled = true;
    const orbit = createFollowOrbit();
    orbit.apply(
      viewportFollowSync({
        followEnabled,
        particles: lab.simulation.particles,
        selectedTracerId: a.tracerId,
      }),
    );
    const kept = {
      x: orbit.cameraPosition.x - orbit.target.x,
      y: orbit.cameraPosition.y - orbit.target.y,
      z: orbit.cameraPosition.z - orbit.target.z,
    };
    orbit.apply(
      viewportFollowSync({
        followEnabled,
        particles: lab.simulation.particles,
        selectedTracerId: b.tracerId,
      }),
    );
    expect(followEnabled).toBe(true);
    expect(orbit.target).toEqual(b.position);
    expect(orbit.followPoint).toEqual(b.position);
    expect(orbit.target).not.toEqual(a.position);
    expect({
      x: orbit.cameraPosition.x - orbit.target.x,
      y: orbit.cameraPosition.y - orbit.target.y,
      z: orbit.cameraPosition.z - orbit.target.z,
    }).toEqual(kept);
  });

  it("inactive selected tracer keeps Follow ON at the frozen marker", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: -10, z: 0 }),
      new EulerIntegrator(),
      [{ position: { x: 0, y: 0, z: 0 }, age: 0, active: true }],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const particle = simulation.particles[0]!;
    simulation.step(0.1);
    expect(particle.active).toBe(false);
    const frozen = { ...particle.position };
    const orbit = createFollowOrbit();
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: simulation.particles,
        selectedTracerId: particle.tracerId,
      }),
    );
    expect(orbit.followPoint).toEqual(frozen);
    simulation.step(0.1);
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: simulation.particles,
        selectedTracerId: particle.tracerId,
      }),
    );
    expect(particle.active).toBe(false);
    expect(orbit.followPoint).toEqual(frozen);
    expect(orbit.target).toEqual(frozen);
  });

  it("missing selected tracer turns Follow OFF and leaves no stale follow point", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const orbit = createFollowOrbit();
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: lab.simulation.particles,
        selectedTracerId: 1,
      }),
    );
    const camera = { ...orbit.cameraPosition };
    const command = viewportFollowSync({
      followEnabled: true,
      particles: lab.simulation.particles,
      selectedTracerId: 99,
    });
    expect(command).toEqual({ kind: "unavailable" });
    orbit.apply(command);
    expect(orbit.followPoint).toBeNull();
    expect(orbit.enablePan).toBe(true);
    expect(orbit.cameraPosition).toEqual(camera);
    expect(appSrc).toMatch(
      /onFollowUnavailable=\{\(\) => setFollowEnabled\(false\)\}/,
    );
  });

  it("Reset turns Follow OFF, keeps selection, and does not resume Follow", () => {
    const resetBlock = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const enterExplore"),
    );
    expect(resetBlock).toMatch(/setFollowEnabled\(false\)/);
    expect(resetBlock).not.toMatch(/selection\.clear/);
    expect(resetBlock).toMatch(/refreshInspection/);
    expect(resetBlock).not.toMatch(/DEEP_STORM_TRACER_VIEW/);

    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    lab.simulation.step(DT);
    const orbit = createFollowOrbit();
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: lab.simulation.particles,
        selectedTracerId: selection.selectedId,
      }),
    );
    const camera = { ...orbit.cameraPosition };
    const followEnabled = false;
    resetExploreLab(lab);
    orbit.apply(
      viewportFollowSync({
        followEnabled,
        particles: lab.simulation.particles,
        selectedTracerId: selection.selectedId,
      }),
    );
    expect(selection.selectedId).toBe(1);
    expect(orbit.followPoint).toBeNull();
    expect(orbit.cameraPosition).toEqual(camera);
    expect(observeExplore(lab, selection)?.time).toBe(0);
    expect(observeExplore(lab, selection)?.position).toEqual(
      lab.simulation.particles[0]!.position,
    );
  });

  it("Clear turns Follow OFF, clears selection, and leaves no stale follow point", () => {
    expect(appSrc).toMatch(
      /const clearSelectionAndInspection = \(\) => \{\s*setFollowEnabled\(false\)/s,
    );
    expect(appSrc).toMatch(
      /orchestration\.clear\(\);\s*clearSelectionAndInspection\(\)/s,
    );

    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED_A);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    const orbit = createFollowOrbit();
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: lab.simulation.particles,
        selectedTracerId: selection.selectedId,
      }),
    );
    const camera = { ...orbit.cameraPosition };
    lab.orchestration.clear();
    selection.clear();
    orbit.apply(
      viewportFollowSync({
        followEnabled: false,
        particles: lab.simulation.particles,
        selectedTracerId: selection.selectedId,
      }),
    );
    expect(selection.selectedId).toBeNull();
    expect(lab.simulation.particles).toHaveLength(0);
    expect(orbit.followPoint).toBeNull();
    expect(orbit.cameraPosition).toEqual(camera);
    expect(observeExplore(lab, selection)).toBeUndefined();
  });

  it("Explore ↔ Guided and Guided experiment switch turn Follow OFF", () => {
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*clearSelectionAndInspection\(\)[\s\S]*createExploreLab/s,
    );
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*clearSelectionAndInspection\(\)[\s\S]*createGuidedLab/s,
    );
    const switchBlock = appSrc.slice(
      appSrc.indexOf("const selectGuidedExperiment"),
      appSrc.indexOf("const explore"),
    );
    expect(switchBlock).toMatch(/setFollowEnabled\(false\)/);
    expect(appSrc).toMatch(
      /const clearSelectionAndInspection = \(\) => \{\s*setFollowEnabled\(false\)/s,
    );
  });
});

describe("Explore Follow mutable-position regression", () => {
  it("uses new coordinates when the same particle and position object mutate in place", () => {
    const position = { x: 100, y: 200, z: 300 };
    const particles = [
      { tracerId: 1, position, active: true },
    ];
    const selected = particles[0]!;
    const orbit = createFollowOrbit();
    const first = viewportFollowSync({
      followEnabled: true,
      particles,
      selectedTracerId: 1,
    });
    orbit.apply(first);
    expect(first.kind === "set" && first.position).toBe(position);
    expect(orbit.target).toEqual({ x: 100, y: 200, z: 300 });

    position.x = 111;
    position.y = 222;
    position.z = 333;
    expect(particles[0]).toBe(selected);
    expect(selected.position).toBe(position);

    const second = viewportFollowSync({
      followEnabled: true,
      particles,
      selectedTracerId: 1,
    });
    orbit.apply(second);
    expect(second.kind === "set" && second.position).toBe(position);
    expect(orbit.followPoint).toEqual({ x: 111, y: 222, z: 333 });
    expect(orbit.target).toEqual({ x: 111, y: 222, z: 333 });
    expect(orbit.followPoint).not.toEqual({ x: 100, y: 200, z: 300 });
  });
});

describe("Explore Follow scientific independence", () => {
  it("Follow ON/OFF does not change advection, clock, T1, Candidate A, or seven operands", () => {
    const followed = createExploreLab(fakeSlots());
    const control = createExploreLab(fakeSlots());
    followed.session.releasePoint(SEED_A);
    control.session.releasePoint(SEED_A);
    const followedSelection = new TracerSelection();
    const controlSelection = new TracerSelection();
    followedSelection.select(followed.simulation.particles[0]!.tracerId);
    controlSelection.select(control.simulation.particles[0]!.tracerId);

    const beforeFollowed = observeExplore(followed, followedSelection)!;
    const beforeControl = observeExplore(control, controlSelection)!;
    expect(beforeFollowed).toEqual(beforeControl);

    const orbit = createFollowOrbit();
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: followed.simulation.particles,
        selectedTracerId: followedSelection.selectedId,
      }),
    );
    expect(observeExplore(followed, followedSelection)).toEqual(beforeFollowed);

    followed.simulation.step(DT);
    control.simulation.step(DT);
    orbit.apply(
      viewportFollowSync({
        followEnabled: true,
        particles: followed.simulation.particles,
        selectedTracerId: followedSelection.selectedId,
      }),
    );
    orbit.apply(
      viewportFollowSync({
        followEnabled: false,
        particles: followed.simulation.particles,
        selectedTracerId: followedSelection.selectedId,
      }),
    );

    const afterFollowed = observeExplore(followed, followedSelection)!;
    const afterControl = observeExplore(control, controlSelection)!;
    expect(followed.simulation.clock.time).toBe(control.simulation.clock.time);
    expect(followed.simulation.clock.time).toBe(DT);
    expect(followed.simulation.particles[0]!.position).toEqual(
      control.simulation.particles[0]!.position,
    );
    expect(afterFollowed.position).toEqual(afterControl.position);
    expect(afterFollowed.time).toBe(afterControl.time);
    expect(afterFollowed.tiltingTendency).toBe(afterControl.tiltingTendency);
    expect(afterFollowed.currentVerticalVorticity).toBe(
      afterControl.currentVerticalVorticity,
    );
    expect(followed.velocityObservation.parts).toHaveLength(7);
    expect(followed.velocityObservation.parts!.map((part) => part.key)).toEqual(
      [...DEMO_VELOCITY_CONTRIBUTION_KEYS],
    );
    const inspection = inspectSelectedTracer(
      followed.simulation.particles,
      followedSelection,
      followed.simulation.clock.time,
      followed.velocityObservation,
    )!;
    expect(inspection.contributions?.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    expect(inspectorPanelSrc).not.toMatch(/followEnabled/);
    expect(inspectorPanelSrc).not.toMatch(/Follow selected tracer/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/followEnabled/);
    const refresh = appSrc.slice(
      appSrc.indexOf("const refreshInspection"),
      appSrc.indexOf("const clearSelectionAndInspection"),
    );
    expect(refresh).not.toMatch(/followEnabled/);
    expect(refresh).toMatch(/inspectSelectedPointDiagnostics/);
  });
});
