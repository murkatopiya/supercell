import { describe, expect, it } from "vitest";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "../app/composeDemoTracerSimulation.js";
import {
  createExploreLab,
  resetExploreLab,
} from "../app/createExploreLab.js";
import { createGuidedLab, resetGuidedLab } from "../app/createGuidedLab.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { TracerSelection } from "./TracerSelection.js";
import {
  inspectPointDiagnosticsAt,
  inspectSelectedPointDiagnostics,
  type PointDiagnosticSampleSource,
  type PointDiagnosticSources,
} from "./PointDiagnosticObservation.js";
import pointDiagnosticSrc from "./PointDiagnosticObservation.ts?raw";
import tracerInspectionSrc from "./TracerInspection.ts?raw";
import inspectorPanelSrc from "../ui/tracer/TracerInspectorPanel.tsx?raw";
import guidedExperimentSrc from "../guided/GuidedExperiment.ts?raw";

const SEED: Vec3 = { x: 0, y: 1000, z: 4000 };
const DT = DEMO_SCENARIO.simulation.timestep;

function fakeSlots(): ExploreSceneSlots {
  return {
    tracerSlotCount: 0,
    addTracerSlot() {},
    clearTracerSlots() {},
    syncReleasePreview() {},
  };
}

class RecordingSampler implements PointDiagnosticSampleSource {
  readonly calls: { position: Vec3; time: number }[] = [];

  constructor(
    private readonly inner?: PointDiagnosticSampleSource,
  ) {}

  sample(position: Vec3, time: number): number {
    this.calls.push({ position, time });
    return this.inner === undefined ? 0 : this.inner.sample(position, time);
  }
}

function refusingSampler(): PointDiagnosticSampleSource {
  return {
    sample() {
      throw new Error(
        "diagnostics must not be sampled without a resolved tracer",
      );
    },
  };
}

function labSources(
  lab: {
    tiltingTendency: PointDiagnosticSampleSource;
    currentVerticalVorticity: PointDiagnosticSampleSource;
  },
  tilting = new RecordingSampler(lab.tiltingTendency),
  vorticity = new RecordingSampler(lab.currentVerticalVorticity),
): {
  sources: PointDiagnosticSources;
  tilting: RecordingSampler;
  vorticity: RecordingSampler;
} {
  return {
    sources: {
      tiltingTendency: tilting,
      currentVerticalVorticity: vorticity,
    },
    tilting,
    vorticity,
  };
}

describe("inspectSelectedPointDiagnostics", () => {
  it("does not import rendering, React, pedagogy, or TracerInspection", () => {
    expect(pointDiagnosticSrc).not.toMatch(/from ["']three["']/);
    expect(pointDiagnosticSrc).not.toMatch(/from ["']react["']/);
    expect(pointDiagnosticSrc).not.toMatch(/TracerPedagogy/);
    expect(pointDiagnosticSrc).not.toMatch(/ExploreTracerSession/);
    expect(pointDiagnosticSrc).not.toMatch(/ScenarioConfig/);
    expect(pointDiagnosticSrc).not.toMatch(/from ["'].*TracerInspection/);
    expect(pointDiagnosticSrc).not.toMatch(/velocityObservation/);
    expect(pointDiagnosticSrc).not.toMatch(/InspectableVelocityOperands/);
  });

  it("returns undefined for no selection and does not sample diagnostics", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const selection = new TracerSelection();
    const recorded = labSources(lab, new RecordingSampler(), new RecordingSampler());

    expect(
      inspectSelectedPointDiagnostics(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        {
          tiltingTendency: refusingSampler(),
          currentVerticalVorticity: refusingSampler(),
        },
      ),
    ).toBeUndefined();
    expect(
      inspectSelectedPointDiagnostics(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        recorded.sources,
      ),
    ).toBeUndefined();
    expect(recorded.tilting.calls).toEqual([]);
    expect(recorded.vorticity.calls).toEqual([]);
  });

  it("returns undefined for a missing selected id without sampling", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const selection = new TracerSelection();
    selection.select(99);
    const recorded = labSources(lab, new RecordingSampler(), new RecordingSampler());

    expect(
      inspectSelectedPointDiagnostics(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        {
          tiltingTendency: refusingSampler(),
          currentVerticalVorticity: refusingSampler(),
        },
      ),
    ).toBeUndefined();
    expect(selection.selectedId).toBe(99);
    expect(
      inspectSelectedPointDiagnostics(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        recorded.sources,
      ),
    ).toBeUndefined();
    expect(recorded.tilting.calls).toEqual([]);
    expect(recorded.vorticity.calls).toEqual([]);
  });

  it("samples both lab owners at the selected tracer's current position, not the seed", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const particle = lab.simulation.particles[0]!;
    const selection = new TracerSelection();
    selection.select(particle.tracerId);
    lab.simulation.step(DT);
    const time = lab.simulation.clock.time;
    expect(time).toBe(DT);
    expect(particle.position).not.toEqual(SEED);

    const recorded = labSources(lab);
    const observation = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      time,
      recorded.sources,
    );

    expect(observation).toBeDefined();
    expect(observation!.tracerId).toBe(particle.tracerId);
    expect(observation!.position).toEqual(particle.position);
    expect(observation!.position).not.toEqual(SEED);
    expect(observation!.position).not.toBe(particle.position);
    expect(recorded.tilting.calls).toHaveLength(1);
    expect(recorded.vorticity.calls).toHaveLength(1);
    expect(recorded.tilting.calls[0]!.position).toBe(particle.position);
    expect(recorded.vorticity.calls[0]!.position).toBe(particle.position);
    expect(recorded.tilting.calls[0]!.position).not.toEqual(SEED);
    expect(observation!.tiltingTendency).toBe(
      lab.tiltingTendency.sample(particle.position, time),
    );
    expect(observation!.currentVerticalVorticity).toBe(
      lab.currentVerticalVorticity.sample(particle.position, time),
    );
  });

  it("forwards the current laboratory clock.time, not t = 0", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const particle = lab.simulation.particles[0]!;
    const selection = new TracerSelection();
    selection.select(particle.tracerId);
    lab.simulation.step(DT);
    lab.simulation.step(DT);
    const time = lab.simulation.clock.time;
    expect(time).toBe(2 * DT);
    expect(time).not.toBe(0);

    const recorded = labSources(lab);
    const observation = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      time,
      recorded.sources,
    );

    expect(observation!.time).toBe(time);
    expect(recorded.tilting.calls[0]!.time).toBe(time);
    expect(recorded.vorticity.calls[0]!.time).toBe(time);
    expect(recorded.tilting.calls[0]!.time).not.toBe(0);
  });

  it("returns values from the lab's existing diagnostic instances", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const particle = lab.simulation.particles[0]!;
    const selection = new TracerSelection();
    selection.select(particle.tracerId);
    const time = lab.simulation.clock.time;
    const recorded = labSources(lab);

    const observation = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      time,
      recorded.sources,
    )!;

    expect(recorded.tilting.calls[0]!.position).toBe(particle.position);
    expect(recorded.vorticity.calls[0]!.position).toBe(particle.position);
    expect(observation.tiltingTendency).toBe(
      lab.tiltingTendency.sample(particle.position, time),
    );
    expect(observation.currentVerticalVorticity).toBe(
      lab.currentVerticalVorticity.sample(particle.position, time),
    );
  });

  it("resamples live (P, t) after the selected tracer moves; no cached observation", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const particle = lab.simulation.particles[0]!;
    const selection = new TracerSelection();
    selection.select(particle.tracerId);
    const first = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      labSources(lab).sources,
    )!;
    const firstPosition = { ...particle.position };

    lab.simulation.step(DT);
    expect(particle.position).not.toEqual(firstPosition);

    const recorded = labSources(lab);
    const second = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      recorded.sources,
    )!;

    expect(second.position).toEqual(particle.position);
    expect(second.position).not.toEqual(first.position);
    expect(second.time).toBe(DT);
    expect(second.time).not.toBe(first.time);
    expect(recorded.tilting.calls[0]!.position).toBe(particle.position);
    expect(recorded.tilting.calls[0]!.time).toBe(DT);
    expect(second.tiltingTendency).toBe(
      lab.tiltingTendency.sample(particle.position, DT),
    );
    expect(second.currentVerticalVorticity).toBe(
      lab.currentVerticalVorticity.sample(particle.position, DT),
    );
  });

  it("after Explore Reset, samples restored P and t with selectedId preserved", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const particle = lab.simulation.particles[0]!;
    const selection = new TracerSelection();
    selection.select(particle.tracerId);
    lab.simulation.step(DT);
    expect(particle.position).not.toEqual(SEED);
    expect(lab.simulation.clock.time).toBe(DT);

    resetExploreLab(lab);

    expect(selection.selectedId).toBe(particle.tracerId);
    expect(lab.simulation.clock.time).toBe(0);
    expect(particle.position).toEqual(SEED);

    const recorded = labSources(lab);
    const observation = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      recorded.sources,
    )!;

    expect(observation.tracerId).toBe(particle.tracerId);
    expect(observation.time).toBe(0);
    expect(observation.position).toEqual(SEED);
    expect(recorded.tilting.calls[0]!.position).toBe(particle.position);
    expect(recorded.tilting.calls[0]!.time).toBe(0);
    expect(observation.tiltingTendency).toBe(
      lab.tiltingTendency.sample(particle.position, 0),
    );
    expect(observation.currentVerticalVorticity).toBe(
      lab.currentVerticalVorticity.sample(particle.position, 0),
    );
  });

  it("samples an inactive existing tracer at its marker", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const particle = lab.simulation.particles[0]!;
    particle.active = false;
    const selection = new TracerSelection();
    selection.select(particle.tracerId);
    const time = lab.simulation.clock.time;
    const recorded = labSources(lab);

    const observation = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      time,
      recorded.sources,
    );

    expect(particle.active).toBe(false);
    expect(observation).toBeDefined();
    expect(observation!.position).toEqual(particle.position);
    expect(recorded.tilting.calls).toHaveLength(1);
    expect(recorded.vorticity.calls).toHaveLength(1);
    expect(recorded.tilting.calls[0]!.position).toBe(particle.position);
    expect(observation!.tiltingTendency).toBe(
      lab.tiltingTendency.sample(particle.position, time),
    );
    expect(observation!.currentVerticalVorticity).toBe(
      lab.currentVerticalVorticity.sample(particle.position, time),
    );
  });

  it("does not mutate particle, diagnostics, clock, or selection", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const particle = lab.simulation.particles[0]!;
    const selection = new TracerSelection();
    selection.select(particle.tracerId);
    const beforePosition = { ...particle.position };
    const beforeActive = particle.active;
    const t1Before = lab.tiltingTendency.sample(particle.position, 0);
    const omegaBefore = lab.currentVerticalVorticity.sample(
      particle.position,
      0,
    );

    const observation = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      {
        tiltingTendency: lab.tiltingTendency,
        currentVerticalVorticity: lab.currentVerticalVorticity,
      },
    )!;
    observation.position.x = 999;

    expect(particle.position).toEqual(beforePosition);
    expect(particle.active).toBe(beforeActive);
    expect(lab.simulation.clock.time).toBe(0);
    expect(selection.selectedId).toBe(particle.tracerId);
    expect(lab.tiltingTendency.sample(particle.position, 0)).toBe(t1Before);
    expect(lab.currentVerticalVorticity.sample(particle.position, 0)).toBe(
      omegaBefore,
    );
  });

  it("works against GuidedLab owners without changing catalog or parts", () => {
    const lab = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    const particle = lab.simulation.particles[0]!;
    const selection = new TracerSelection();
    selection.select(particle.tracerId);
    lab.simulation.step(DT);
    const time = lab.simulation.clock.time;
    const recorded = labSources(lab);

    const observation = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      time,
      recorded.sources,
    )!;

    expect(observation.tracerId).toBe(particle.tracerId);
    expect(observation.time).toBe(time);
    expect(recorded.tilting.calls[0]!.position).toBe(particle.position);
    expect(observation.tiltingTendency).toBe(
      lab.tiltingTendency.sample(particle.position, time),
    );
    expect(observation.currentVerticalVorticity).toBe(
      lab.currentVerticalVorticity.sample(particle.position, time),
    );
    expect(lab.velocityObservation.parts).toHaveLength(7);
    expect(lab.velocityObservation.parts!.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);

    resetGuidedLab(lab);
    const restored = inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      labSources(lab).sources,
    )!;
    expect(selection.selectedId).toBe(particle.tracerId);
    expect(restored.time).toBe(0);
    expect(restored.position).toEqual(particle.position);
  });
});

describe("point-diagnostic sibling boundary", () => {
  it("does not add T1 or Candidate A to velocityObservation.parts", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    inspectSelectedPointDiagnostics(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      {
        tiltingTendency: lab.tiltingTendency,
        currentVerticalVorticity: lab.currentVerticalVorticity,
      },
    );

    const keys = lab.velocityObservation.parts!.map((part) => part.key);
    expect(lab.velocityObservation.parts).toHaveLength(7);
    expect(keys).toEqual([...DEMO_VELOCITY_CONTRIBUTION_KEYS]);
    expect(keys).not.toContain("tiltingTendency");
    expect(keys).not.toContain("currentVerticalVorticity");
  });

  it("inspectPointDiagnosticsAt samples recorded (P, t) without moving the live tracer", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint(SEED);
    lab.simulation.step(DT);
    const live = lab.simulation.particles[0]!;
    const livePosition = { ...live.position };
    const recorded = labSources(lab);
    const historical = { x: 10, y: 20, z: 30 };
    const recordedTime = 7.5;
    const observation = inspectPointDiagnosticsAt(
      live.tracerId,
      historical,
      recordedTime,
      recorded.sources,
    );

    expect(observation.position).toEqual(historical);
    expect(observation.time).toBe(recordedTime);
    expect(recorded.tilting.calls).toEqual([
      { position: historical, time: recordedTime },
    ]);
    expect(recorded.vorticity.calls).toEqual([
      { position: historical, time: recordedTime },
    ]);
    expect(live.position).toEqual(livePosition);
    expect(lab.simulation.clock.time).toBe(DT);
  });

  it("leaves TracerInspection, Inspector UI, and Guided catalog unwired", () => {
    expect(tracerInspectionSrc).not.toMatch(/tiltingTendency/);
    expect(tracerInspectionSrc).not.toMatch(/currentVerticalVorticity/);
    expect(tracerInspectionSrc).not.toMatch(/PointDiagnosticObservation/);
    expect(inspectorPanelSrc).not.toMatch(/PointDiagnostic/);
    expect(inspectorPanelSrc).not.toMatch(/tiltingTendency/);
    expect(guidedExperimentSrc).not.toMatch(/tiltingTendency/);
    expect(guidedExperimentSrc).not.toMatch(/currentVerticalVorticity/);
    expect(guidedExperimentSrc).not.toMatch(/PointDiagnostic/);
  });
});
