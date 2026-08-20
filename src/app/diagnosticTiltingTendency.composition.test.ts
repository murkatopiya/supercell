import { describe, expect, it } from "vitest";
import composeDemoTracerSimulationSrc from "./composeDemoTracerSimulation.ts?raw";
import {
  composeDemoTracerFields,
  composeDemoTracersWithObservation,
  DEMO_VELOCITY_CONTRIBUTION_KEYS,
} from "./composeDemoTracerSimulation.js";
import { createExploreLab, resetExploreLab } from "./createExploreLab.js";
import {
  createGuidedLab,
  resetGuidedLab,
  switchGuidedExperiment,
} from "./createGuidedLab.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import inspectSrc from "../interaction/TracerInspection.ts?raw";
import inspectorPanelSrc from "../ui/tracer/TracerInspectorPanel.tsx?raw";
import { DiagnosticTiltingTendency } from "../physics/diagnostics/DiagnosticTiltingTendency.js";
import { CompositeVelocityField } from "../core/fields/CompositeVelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { createDowndraftField } from "../scenario/createDowndraftField.js";
import { createLowerRadialInflowField } from "../scenario/createLowerRadialInflowField.js";
import { createNearGroundRadialOutflowField } from "../scenario/createNearGroundRadialOutflowField.js";
import { createRotationField } from "../scenario/createRotationField.js";
import { createUpperRadialOutflowField } from "../scenario/createUpperRadialOutflowField.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import visualAirflowPopulationSrc from "../visualization/VisualAirflowPopulation.ts?raw";

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

const SAMPLE_POINTS: Vec3[] = [
  { x: 0, y: 1000, z: 0 },
  { x: 2400, y: 1000, z: 0 },
  { x: 0, y: 1000, z: -2400 },
  { x: -2000, y: 2000, z: 0 },
  { x: 400, y: 4000, z: -200 },
];

const COUPLE_POINT = { x: -2000, y: 2000, z: 0 };

function partField(
  observation: ReturnType<
    typeof composeDemoTracersWithObservation
  >["velocityObservation"],
  key: string,
) {
  return observation.parts!.find((part) => part.key === key)!.field;
}

describe("DiagnosticTiltingTendency composition wiring", () => {
  it("constructs T1 from the same profile and updraftField instances as the composite", () => {
    expect(composeDemoTracerSimulationSrc).toMatch(
      /new DiagnosticTiltingTendency\(\{\s*profile: composed\.profile,\s*updraft: composed\.updraftField,/,
    );

    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    expect(observed.tiltingTendency).toBeInstanceOf(DiagnosticTiltingTendency);
    expect(observed.tiltingTendency.updraft).toBe(
      partField(observed.velocityObservation, "updraft"),
    );

    const isolated = new DiagnosticTiltingTendency({
      profile: observed.tiltingTendency.profile,
      updraft: observed.tiltingTendency.updraft,
    });
    expect(isolated.sample(COUPLE_POINT, 0)).toBe(
      observed.tiltingTendency.sample(COUPLE_POINT, 0),
    );
  });

  it("keeps T1 as a sibling, not a velocityObservation.parts row", () => {
    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    const keys = observed.velocityObservation.parts!.map((part) => part.key);
    expect(observed.velocityObservation.parts).toHaveLength(7);
    expect(keys).toEqual([...DEMO_VELOCITY_CONTRIBUTION_KEYS]);
    expect(keys).not.toContain("tilting");
    expect(keys).not.toContain("tiltingTendency");
    expect(keys).not.toContain("omega");
    expect(keys).not.toContain("rotationalDynamics");
  });

  it("does not change the seven-operand V_total sum", () => {
    const composed = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    expect(composed.operands).toHaveLength(7);
    expect(observed.velocityObservation.parts).toHaveLength(7);

    for (const point of SAMPLE_POINTS) {
      const total = observed.velocityObservation.total.sample(point, 0);
      expect(total).toEqual(composed.field.sample(point, 0));
      const summed = observed.velocityObservation.parts!.reduce(
        (acc, part) => {
          const v = part.field.sample(point, 0);
          return { x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z };
        },
        { x: 0, y: 0, z: 0 },
      );
      expect(total).toEqual(summed);
    }
  });

  it("is invariant under IntegrationFrame / constant storm motion C", () => {
    const ground = composeDemoTracersWithObservation(
      IntegrationFrame.GroundRelativeWindTunnel,
      [],
    );
    const stormRelative = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    expect(ground.velocityObservation.total.sample(COUPLE_POINT, 0)).not.toEqual(
      stormRelative.velocityObservation.total.sample(COUPLE_POINT, 0),
    );
    for (const point of SAMPLE_POINTS) {
      expect(ground.tiltingTendency.sample(point, 0)).toBe(
        stormRelative.tiltingTendency.sample(point, 0),
      );
    }
  });

  it("is unchanged when prescribed Ω changes", () => {
    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    const t1 = observed.tiltingTendency;
    const before = t1.sample(COUPLE_POINT, 0);
    expect(before).not.toBe(0);

    const rotDemo = createRotationField(DEMO_SCENARIO);
    const otherScenario = structuredClone(DEMO_SCENARIO);
    otherScenario.storm.rotation.angularVelocity = 0.02;
    const rotOther = createRotationField(otherScenario);
    expect(rotDemo.sample(COUPLE_POINT, 0)).not.toEqual(
      rotOther.sample(COUPLE_POINT, 0),
    );

    const withDemoRotation = new CompositeVelocityField([
      t1.updraft,
      rotDemo,
    ]);
    const withOtherRotation = new CompositeVelocityField([
      t1.updraft,
      rotOther,
    ]);
    expect(withDemoRotation.sample(COUPLE_POINT, 0)).not.toEqual(
      withOtherRotation.sample(COUPLE_POINT, 0),
    );
    expect(t1.sample(COUPLE_POINT, 0)).toBe(before);
  });

  it("is unchanged when the other storm operands change", () => {
    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    const t1 = observed.tiltingTendency;
    const before = t1.sample(COUPLE_POINT, 0);

    const other = structuredClone(DEMO_SCENARIO);
    other.storm.lowerRadialInflow.radialStrainRate = 0.004;
    other.storm.upperRadialOutflow.outflowStrainRate = 0.008;
    other.storm.downdraft.peakDownwardVelocity = 5;
    other.storm.nearGroundOutflow.outflowStrainRate = 0.02;

    const demoInflow = createLowerRadialInflowField(DEMO_SCENARIO);
    const otherInflow = createLowerRadialInflowField(other);
    const inflowPoint = { x: 500, y: 2500, z: 0 };
    expect(demoInflow.sample(inflowPoint, 0)).not.toEqual(
      otherInflow.sample(inflowPoint, 0),
    );
    expect(
      createUpperRadialOutflowField(DEMO_SCENARIO).sample(
        { x: 500, y: 7000, z: 0 },
        0,
      ),
    ).not.toEqual(
      createUpperRadialOutflowField(other).sample({ x: 500, y: 7000, z: 0 }, 0),
    );
    expect(
      createDowndraftField(DEMO_SCENARIO).sample({ x: 5000, y: 1000, z: 0 }, 0),
    ).not.toEqual(
      createDowndraftField(other).sample({ x: 5000, y: 1000, z: 0 }, 0),
    );
    expect(
      createNearGroundRadialOutflowField(DEMO_SCENARIO).sample(
        { x: 3500, y: 200, z: 4000 },
        0,
      ),
    ).not.toEqual(
      createNearGroundRadialOutflowField(other).sample(
        { x: 3500, y: 200, z: 4000 },
        0,
      ),
    );

    expect(t1.sample(COUPLE_POINT, 0)).toBe(before);
  });

  it("does not pass T1 into Simulation", () => {
    expect(composeDemoTracerSimulationSrc).toMatch(
      /new Simulation\(\s*velocityObservation\.total,\s*integrator/,
    );
    expect(composeDemoTracerSimulationSrc).not.toMatch(
      /new Simulation\(\s*tiltingTendency/,
    );
  });
});

describe("ExploreLab / GuidedLab T1 exposure", () => {
  it("exposes the same headless diagnostic on Explore and Guided at the same P,t", () => {
    const explore = createExploreLab(fakeSlots());
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    expect(explore.tiltingTendency).toBeInstanceOf(DiagnosticTiltingTendency);
    expect(guided.tiltingTendency).toBeInstanceOf(DiagnosticTiltingTendency);
    expect(explore.tiltingTendency.updraft).toBe(
      partField(explore.velocityObservation, "updraft"),
    );
    expect(guided.tiltingTendency.updraft).toBe(
      partField(guided.velocityObservation, "updraft"),
    );
    for (const point of SAMPLE_POINTS) {
      expect(explore.tiltingTendency.sample(point, 0)).toBe(
        guided.tiltingTendency.sample(point, 0),
      );
    }
    expect(explore.velocityObservation.parts).toHaveLength(7);
    expect(guided.velocityObservation.parts).toHaveLength(7);
  });

  it("creates a new T1 instance when Guided experiment switches", () => {
    const from = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    const selection = new TracerSelection();
    const to = switchGuidedExperiment(
      from,
      GuidedExperimentId.DowndraftPathToGround,
      selection,
    );
    expect(to).not.toBe(from);
    expect(to.tiltingTendency).not.toBe(from.tiltingTendency);
    expect(to.tiltingTendency.sample(COUPLE_POINT, 0)).toBe(
      from.tiltingTendency.sample(COUPLE_POINT, 0),
    );
  });

  it("does not reset T1 on Explore or Guided Reset because there is no diagnostic state", () => {
    const explore = createExploreLab(fakeSlots());
    const guided = createGuidedLab(GuidedExperimentId.NearGroundOutflow);
    const exploreDiagnostic = explore.tiltingTendency;
    const guidedDiagnostic = guided.tiltingTendency;
    const exploreValue = exploreDiagnostic.sample(COUPLE_POINT, 3);
    const guidedValue = guidedDiagnostic.sample(COUPLE_POINT, 3);

    explore.simulation.step(DEMO_SCENARIO.simulation.timestep);
    guided.simulation.step(DEMO_SCENARIO.simulation.timestep);
    resetExploreLab(explore);
    resetGuidedLab(guided);

    expect(explore.tiltingTendency).toBe(exploreDiagnostic);
    expect(guided.tiltingTendency).toBe(guidedDiagnostic);
    expect(explore.tiltingTendency.sample(COUPLE_POINT, 3)).toBe(exploreValue);
    expect(guided.tiltingTendency.sample(COUPLE_POINT, 3)).toBe(guidedValue);
  });
});

describe("T1 does not enter Inspector or visualization", () => {
  it("does not appear in Inspector or visual-airflow sources", () => {
    expect(inspectSrc).not.toMatch(/tiltingTendency/);
    expect(inspectSrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(inspectorPanelSrc).not.toMatch(/tiltingTendency/);
    expect(inspectorPanelSrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(visualAirflowPopulationSrc).not.toMatch(/tiltingTendency/);
    expect(visualAirflowPopulationSrc).not.toMatch(/DiagnosticTiltingTendency/);
  });
});
