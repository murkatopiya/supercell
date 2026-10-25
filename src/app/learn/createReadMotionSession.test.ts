import { expect, it, vi } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { createReadMotionSession, READ_MOTION_ARROW_SCALE } from "./createReadMotionSession.js";
import { velocityArrowTip } from "../../rendering/velocityArrow.js";
import { advanceLaboratoryFixedStep } from "../../ui/tracer/advanceLaboratoryFixedStep.js";

it("uses only approved A and samples the same total field at current P,t without advancing", () => {
  const lab = createReadMotionSession();
  const particle = lab.simulation.particles[0]!;
  expect(lab.simulation.particles).toHaveLength(1);
  expect(particle.position).toEqual({ x: 0, y: 1000, z: 4000 });
  expect(lab.pathHistory.tracerCount).toBe(1);
  const sample = vi.spyOn(lab.velocityObservation.total, "sample");
  const initial = lab.observeVelocity();
  expect(sample).toHaveBeenLastCalledWith(particle.position, 0);
  expect(initial.displayMetresPerMps).toBe(READ_MOTION_ARROW_SCALE);
  expect(initial.velocity).toEqual(sample.mock.results[0]!.value);
  expect(lab.simulation.clock.time).toBe(0);
  expect(lab.pathHistory.sampleCountFor(0)).toBe(1);
  advanceLaboratoryFixedStep(lab.simulation, lab.timestep, { pathHistory: lab.pathHistory });
  expect(particle.position.x).toBe(initial.position.x + initial.velocity.x * .1);
  expect(particle.position.y).toBe(initial.position.y + initial.velocity.y * .1);
  expect(particle.position.z).toBe(initial.position.z + initial.velocity.z * .1);
  const current = lab.observeVelocity();
  expect(sample).toHaveBeenLastCalledWith(particle.position, lab.simulation.clock.time);
  expect(current.position).toEqual(particle.position);
  expect(current.position).not.toBe(particle.position);
  lab.replay();
  expect(lab.observeVelocity()).toEqual(initial);
  expect(lab.pathHistory.sampleCountFor(0)).toBe(1);
});

it.each([.4, 1, 2.4])("includes arrow tail/tip in camera framing at aspect %s", aspect => {
  const lab = createReadMotionSession();
  const pose = lab.sceneOptions.viewPose!(aspect);
  const camera = new PerspectiveCamera(50, aspect, 1, 100000);
  camera.position.copy(pose.cameraPosition); camera.lookAt(new Vector3().copy(pose.target));
  camera.updateMatrixWorld();
  for (const point of [lab.observeVelocity().position, velocityArrowTip(lab.observeVelocity())]) {
    const projected = new Vector3().copy(point).project(camera);
    expect(Math.abs(projected.x)).toBeLessThan(.8);
    expect(Math.abs(projected.y)).toBeLessThan(.8);
  }
});
