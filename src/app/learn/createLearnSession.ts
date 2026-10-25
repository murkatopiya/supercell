import { composeDemoTracersWithObservation } from "../composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../IntegrationFrame.js";
import { DEMO_SCENARIO } from "../../scenario/DEMO_SCENARIO.js";
import { TracerPathHistory } from "../../simulation/TracerPathHistory.js";
import { ExploreTracerSession } from "../../explore/ExploreTracerSession.js";
import type { TracerSceneOptions } from "../../rendering/TracerScene.js";
import { PerspectiveCamera, Vector3 } from "three";
import type { Vec3 } from "../../core/math/Vec3.js";

export const LEARN_STARTS = Object.freeze([
  Object.freeze({ label: "A", start: Object.freeze({ x: 0, y: 1000, z: 4000 }) }),
  Object.freeze({ label: "B", start: Object.freeze({ x: 2400, y: 1000, z: 0 }) }),
]);
export const LEARN_MAX_STEPS = 1200;
export const LEARN_TIME_SCALE = 10;

/** One disposable cohort, using the same Demo composition as the laboratory. */
export function createLearnSession(
  starts: readonly { readonly label: string; readonly start: Vec3 }[] = LEARN_STARTS,
  additionalViewPoints?: () => readonly Vec3[],
) {
  const { simulation, velocityObservation } = composeDemoTracersWithObservation(
    IntegrationFrame.StormRelativeLaboratory, [], undefined, DEMO_SCENARIO.stormMotion,
  );
  const pathHistory = new TracerPathHistory(0, 1);
  const session = new ExploreTracerSession(simulation, pathHistory);
  for (const { start } of starts) session.releasePoint(start);
  const mapping = starts.map(({ label }, lane) => ({
    label, lane, slot: lane, tracerId: simulation.particles[lane]!.tracerId,
  }));
  const stepBudget = { completedSteps: 0, maxSteps: LEARN_MAX_STEPS };
  let cachedRevision = -1;
  let cachedAspect = -1;
  let cachedPose: ReturnType<NonNullable<TracerSceneOptions["viewPose"]>>;
  const viewPose: NonNullable<TracerSceneOptions["viewPose"]> = aspect => {
    if (cachedRevision === pathHistory.revision && cachedAspect === aspect) return cachedPose;
    // Fit only actual starts/recorded samples, never future trajectory data.
    const points = starts.map(({ start }) => new Vector3().copy(start));
    for (const point of additionalViewPoints?.() ?? []) points.push(new Vector3().copy(point));
    for (let lane = 0; lane < starts.length; lane++) {
      for (const point of pathHistory.pointsFor(lane)) points.push(new Vector3().copy(point));
    }
    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);
    for (const point of points) { min.min(point); max.max(point); }
    min.addScalar(-650); max.addScalar(650);
    min.y = Math.min(0, min.y);
    const target = min.clone().add(max).multiplyScalar(0.5);
    const direction = new Vector3(1, 0.65, 1).normalize();
    const camera = new PerspectiveCamera(50, Math.max(0.1, aspect));
    camera.position.copy(target).add(direction); camera.lookAt(target); camera.updateMatrixWorld();
    const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const tan = Math.tan(25 * Math.PI / 180) * 0.78;
    let distance = 0;
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
      const point = new Vector3(x, y, z).sub(target);
      distance = Math.max(distance,
        point.dot(direction) + Math.abs(point.dot(right)) / (tan * camera.aspect),
        point.dot(direction) + Math.abs(point.dot(up)) / tan);
    }
    cachedRevision = pathHistory.revision; cachedAspect = aspect;
    cachedPose = { cameraPosition: target.clone().addScaledVector(direction, distance), target };
    return cachedPose;
  };
  const sceneOptions: TracerSceneOptions = {
    viewPose, trackViewPose: true, distanceLabelsVisible: false,
    tracerAnnotations: starts.map(annotation => ({ ...annotation, showStartHeight: true })),
  };
  return {
    simulation, velocityObservation, pathHistory, mapping, stepBudget, sceneOptions,
    timestep: DEMO_SCENARIO.simulation.timestep,
    replay() { session.reset(); stepBudget.completedSteps = 0; },
  };
}
