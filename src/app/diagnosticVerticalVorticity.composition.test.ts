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
import { DiagnosticVerticalVorticity } from "../physics/diagnostics/DiagnosticVerticalVorticity.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { createRotationField } from "../scenario/createRotationField.js";
import { createUpdraftField } from "../scenario/createUpdraftField.js";
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

const SAMPLE_POINTS: Vec3[] = [
  { x: 0, y: 3250, z: 0 },
  { x: 4000, y: 3250, z: 0 },
  { x: 4000, y: 3250, z: 4000 },
  { x: 8000, y: 3250, z: 0 },
  { x: 0, y: 1000, z: 0 },
  { x: 2400, y: 1000, z: 0 },
  { x: -2000, y: 2000, z: 0 },
];

const AXIS_MID = { x: 0, y: 3250, z: 0 };
const COUPLE_POINT = { x: -2000, y: 2000, z: 0 };

function partField(
  observation: ReturnType<
    typeof composeDemoTracersWithObservation
  >["velocityObservation"],
  key: string,
) {
  return observation.parts!.find((part) => part.key === key)!.field;
}

describe("DiagnosticVerticalVorticity composition wiring", () => {
  it("constructs Candidate A from the same live rotationField as V_total", () => {
    expect(composeDemoTracerSimulationSrc).toMatch(
      /new DiagnosticVerticalVorticity\(\{\s*rotation: composed\.rotationField,/,
    );
    expect(
      composeDemoTracerSimulationSrc.match(
        /createRotationField\(DEMO_SCENARIO\)/g,
      ),
    ).toEqual(["createRotationField(DEMO_SCENARIO)"]);

    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    expect(observed.currentVerticalVorticity).toBeInstanceOf(
      DiagnosticVerticalVorticity,
    );
    expect(observed.currentVerticalVorticity.rotation).toBe(
      partField(observed.velocityObservation, "rotation"),
    );

    const shadow = createRotationField(DEMO_SCENARIO);
    expect(observed.currentVerticalVorticity.rotation).not.toBe(shadow);
    expect(observed.currentVerticalVorticity.sample(AXIS_MID, 0)).toBe(
      observed.currentVerticalVorticity.rotation.worldVerticalVorticity(
        AXIS_MID,
        0,
      ),
    );
  });

  it("keeps Candidate A as a sibling, not a velocityObservation.parts row", () => {
    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    const keys = observed.velocityObservation.parts!.map((part) => part.key);
    expect(observed.velocityObservation.parts).toHaveLength(7);
    expect(keys).toEqual([...DEMO_VELOCITY_CONTRIBUTION_KEYS]);
    expect(keys).not.toContain("currentVerticalVorticity");
    expect(keys).not.toContain("vorticity");
    expect(keys).not.toContain("omega");
    expect(keys).not.toContain("verticalVorticity");
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

  it("CURRENT stack: sample equals live rotation ω_y (identity, not a universal law)", () => {
    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    const rotation = observed.currentVerticalVorticity.rotation;
    for (const point of SAMPLE_POINTS) {
      expect(observed.currentVerticalVorticity.sample(point, 0)).toBe(
        rotation.worldVerticalVorticity(point, 0),
      );
    }
    expect(observed.currentVerticalVorticity.sample(AXIS_MID, 0)).toBeCloseTo(
      2 * DEMO_SCENARIO.storm.rotation.angularVelocity,
      12,
    );
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
    expect(ground.velocityObservation.total.sample(AXIS_MID, 0)).not.toEqual(
      stormRelative.velocityObservation.total.sample(AXIS_MID, 0),
    );
    for (const point of SAMPLE_POINTS) {
      expect(ground.currentVerticalVorticity.sample(point, 0)).toBe(
        stormRelative.currentVerticalVorticity.sample(point, 0),
      );
    }
  });

  it("changes when prescribed Ω is reversed on a SAME-source occupant", () => {
    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    const live = observed.currentVerticalVorticity;
    const before = live.sample(AXIS_MID, 0);
    expect(before).toBeGreaterThan(0);

    const reversedScenario = structuredClone(DEMO_SCENARIO);
    reversedScenario.storm.rotation.angularVelocity =
      -DEMO_SCENARIO.storm.rotation.angularVelocity;
    const reversed = new DiagnosticVerticalVorticity({
      rotation: createRotationField(reversedScenario),
    });
    expect(reversed.sample(AXIS_MID, 0)).toBeCloseTo(-before, 12);
    expect(live.sample(AXIS_MID, 0)).toBe(before);
  });

  it("is independent of T1 / updraft W0 (labeled CURRENT-stack)", () => {
    const observed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    const omegaY = observed.currentVerticalVorticity.sample(AXIS_MID, 0);
    const t1Before = observed.tiltingTendency.sample(COUPLE_POINT, 0);
    expect(t1Before).not.toBe(0);
    expect(omegaY).not.toBe(t1Before);

    const other = structuredClone(DEMO_SCENARIO);
    other.storm.updraft.peakVerticalVelocity = 99;
    const otherUpdraft = createUpdraftField(other);
    expect(
      otherUpdraft.sample({ x: 0, y: 4000, z: 0 }, 0),
    ).not.toEqual(
      observed.tiltingTendency.updraft.sample({ x: 0, y: 4000, z: 0 }, 0),
    );
    const otherT1 = new DiagnosticTiltingTendency({
      profile: observed.tiltingTendency.profile,
      updraft: otherUpdraft,
    });
    expect(otherT1.sample(COUPLE_POINT, 0)).not.toBe(t1Before);
    expect(observed.currentVerticalVorticity.sample(AXIS_MID, 0)).toBe(omegaY);
    expect(observed.tiltingTendency.sample(COUPLE_POINT, 0)).toBe(t1Before);
  });

  it("does not pass Candidate A into Simulation", () => {
    expect(composeDemoTracerSimulationSrc).toMatch(
      /new Simulation\(\s*velocityObservation\.total,\s*integrator/,
    );
    expect(composeDemoTracerSimulationSrc).not.toMatch(
      /new Simulation\(\s*currentVerticalVorticity/,
    );
  });
});

describe("ExploreLab / GuidedLab Candidate A exposure", () => {
  it("exposes the same headless diagnostic on Explore and Guided at the same P,t", () => {
    const explore = createExploreLab(fakeSlots());
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    expect(explore.currentVerticalVorticity).toBeInstanceOf(
      DiagnosticVerticalVorticity,
    );
    expect(guided.currentVerticalVorticity).toBeInstanceOf(
      DiagnosticVerticalVorticity,
    );
    expect(explore.currentVerticalVorticity.rotation).toBe(
      partField(explore.velocityObservation, "rotation"),
    );
    expect(guided.currentVerticalVorticity.rotation).toBe(
      partField(guided.velocityObservation, "rotation"),
    );
    for (const point of SAMPLE_POINTS) {
      expect(explore.currentVerticalVorticity.sample(point, 0)).toBe(
        guided.currentVerticalVorticity.sample(point, 0),
      );
    }
    expect(explore.velocityObservation.parts).toHaveLength(7);
    expect(guided.velocityObservation.parts).toHaveLength(7);
  });

  it("creates a new Candidate A instance when Guided experiment switches", () => {
    const from = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    const selection = new TracerSelection();
    const to = switchGuidedExperiment(
      from,
      GuidedExperimentId.DowndraftPathToGround,
      selection,
    );
    expect(to).not.toBe(from);
    expect(to.currentVerticalVorticity).not.toBe(from.currentVerticalVorticity);
    expect(to.currentVerticalVorticity.sample(AXIS_MID, 0)).toBe(
      from.currentVerticalVorticity.sample(AXIS_MID, 0),
    );
  });

  it("does not reset Candidate A on Explore or Guided Reset because there is no diagnostic state", () => {
    const explore = createExploreLab(fakeSlots());
    const guided = createGuidedLab(GuidedExperimentId.NearGroundOutflow);
    const exploreDiagnostic = explore.currentVerticalVorticity;
    const guidedDiagnostic = guided.currentVerticalVorticity;
    const exploreValue = exploreDiagnostic.sample(AXIS_MID, 3);
    const guidedValue = guidedDiagnostic.sample(AXIS_MID, 3);

    explore.simulation.step(DEMO_SCENARIO.simulation.timestep);
    guided.simulation.step(DEMO_SCENARIO.simulation.timestep);
    resetExploreLab(explore);
    resetGuidedLab(guided);

    expect(explore.currentVerticalVorticity).toBe(exploreDiagnostic);
    expect(guided.currentVerticalVorticity).toBe(guidedDiagnostic);
    expect(explore.currentVerticalVorticity.sample(AXIS_MID, 3)).toBe(
      exploreValue,
    );
    expect(guided.currentVerticalVorticity.sample(AXIS_MID, 3)).toBe(
      guidedValue,
    );
  });
});

describe("Candidate A does not enter Inspector or visualization", () => {
  it("does not appear in Inspector or visual-airflow sources", () => {
    expect(inspectSrc).not.toMatch(/currentVerticalVorticity/);
    expect(inspectSrc).not.toMatch(/DiagnosticVerticalVorticity/);
    expect(inspectorPanelSrc).not.toMatch(/currentVerticalVorticity/);
    expect(inspectorPanelSrc).not.toMatch(/DiagnosticVerticalVorticity/);
    expect(visualAirflowPopulationSrc).not.toMatch(/currentVerticalVorticity/);
    expect(visualAirflowPopulationSrc).not.toMatch(
      /DiagnosticVerticalVorticity/,
    );
  });
});
