import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { createLearnSession, LEARN_STARTS } from "./createLearnSession.js";
import { composeDemoTracersWithObservation } from "../composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../IntegrationFrame.js";
import { DEMO_SCENARIO } from "../../scenario/DEMO_SCENARIO.js";
import { createTracersFromSeeds } from "../../simulation/createTracersFromSeeds.js";
import { advanceLaboratoryFixedStep } from "../../ui/tracer/advanceLaboratoryFixedStep.js";

describe("Learn Demo cohort", () => {
  it("births exact approved starts at t=0 in two independent lanes", () => {
    const lab = createLearnSession();
    expect(lab.timestep).toBe(0.1);
    expect(DEMO_SCENARIO.stormMotion).toEqual({ eastward: 10, northward: 0 });
    expect(lab.simulation.clock.time).toBe(0);
    expect(lab.simulation.particles.map(p => p.position)).toEqual([
      { x: 0, y: 1000, z: 4000 }, { x: 2400, y: 1000, z: 0 },
    ]);
    expect(lab.pathHistory.tracerCount).toBe(2);
    lab.mapping.forEach(({ label, lane, slot, tracerId }, i) => {
      expect(label).toBe(i === 0 ? "A" : "B");
      expect(lane).toBe(i); expect(slot).toBe(i);
      expect(tracerId).toBe(lab.simulation.particles[i]!.tracerId);
      expect(lab.pathHistory.samplesFor(i)).toEqual([{ position: LEARN_STARTS[i]!.start, simulationTime: 0 }]);
    });
    expect(new Set(lab.mapping.map(m => m.tracerId)).size).toBe(2);
  });

  it("matches existing Demo composition and replays without new IDs or lanes", () => {
    const before = JSON.stringify(DEMO_SCENARIO);
    const lab = createLearnSession();
    const reference = composeDemoTracersWithObservation(IntegrationFrame.StormRelativeLaboratory,
      createTracersFromSeeds(LEARN_STARTS.map(s => s.start)), undefined, DEMO_SCENARIO.stormMotion).simulation;
    const ids = lab.simulation.particles.map(p => p.tracerId);
    for (let replay = 0; replay < 3; replay++) {
      for (let step = 0; step < 5; step++) {
        advanceLaboratoryFixedStep(lab.simulation, lab.timestep, { pathHistory: lab.pathHistory });
        if (replay === 0) reference.step(lab.timestep);
      }
      expect(lab.simulation.particles.map(p => p.position)).toEqual(reference.particles.map(p => p.position));
      expect(lab.pathHistory.sampleCountFor(0)).toBe(6);
      lab.replay();
      expect(lab.simulation.clock.time).toBe(0);
      expect(lab.simulation.particles.map(p => p.tracerId)).toEqual(ids);
      expect(lab.pathHistory.tracerCount).toBe(2);
      expect(lab.pathHistory.sampleCountFor(0)).toBe(1);
      expect(lab.pathHistory.sampleCountFor(1)).toBe(1);
    }
    expect(JSON.stringify(DEMO_SCENARIO)).toBe(before);
  });

  it.each([0.4, 1, 2.4])("fits recorded geometry at aspect %s without changing data", aspect => {
    const lab = createLearnSession();
    const pose = lab.sceneOptions.viewPose!(aspect);
    const camera = new PerspectiveCamera(50, aspect, 1, 100000);
    camera.position.copy(pose.cameraPosition); camera.lookAt(new Vector3().copy(pose.target));
    camera.updateMatrixWorld();
    for (const { start } of LEARN_STARTS) {
      const p = new Vector3().copy(start).project(camera);
      expect(Math.abs(p.x)).toBeLessThan(0.8); expect(Math.abs(p.y)).toBeLessThan(0.8);
    }
    expect(lab.simulation.clock.time).toBe(0);
  });
});
