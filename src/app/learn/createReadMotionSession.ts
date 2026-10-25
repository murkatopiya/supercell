import { inspectWorldPoint } from "../../interaction/TracerInspection.js";
import { velocityArrowTip, type VelocityArrowObservation } from "../../rendering/velocityArrow.js";
import { createLearnSession, LEARN_STARTS } from "./createLearnSession.js";

/** Fixed display conversion: A's ~19–38 m/s maps to ~770–1500 world metres. */
export const READ_MOTION_ARROW_SCALE = 40;

export function createReadMotionSession() {
  const lab = createLearnSession([LEARN_STARTS[0]!], () => {
    try { return [velocityArrowTip(observeVelocity())]; }
    catch { return []; } // Missing observation must not break camera-only Reset View.
  });
  function observeVelocity(): VelocityArrowObservation {
    const particle = lab.simulation.particles[0]!;
    const inspected = inspectWorldPoint(particle.tracerId, particle.position,
      lab.simulation.clock.time, particle.age, particle.active,
      { total: lab.velocityObservation.total });
    return { position: inspected.position, velocity: inspected.vTotal, displayMetresPerMps: READ_MOTION_ARROW_SCALE };
  }
  return { ...lab, observeVelocity };
}
