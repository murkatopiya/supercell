import { PerspectiveCamera, Vector3 } from "three";
import type { CompareFlowSession } from "./createCompareFlowSession.js";
import { velocityArrowTip } from "../../rendering/velocityArrow.js";

/** Stable initial-measurement view; independent of later B placement. */
export function compareFlowView(session: CompareFlowSession) {
  const points = [session.a.position, session.b.position,
    { ...session.a.position, y: 0 }, { ...session.b.position, y: 0 },
    ...Object.values(session.arrows).flatMap(arrow => arrow ? [velocityArrowTip(arrow)] : [])];
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  for (const point of points) { min.min(point); max.max(point); }
  min.addScalar(-250); max.addScalar(250); min.y = Math.min(min.y, 0);
  const target = min.clone().add(max).multiplyScalar(0.5);
  // Look across the predominantly northward arrows, rather than along them.
  const direction = new Vector3(1, 0.8, 0.25).normalize();
  return (aspect: number) => {
    const camera = new PerspectiveCamera(50, Math.max(0.1, aspect));
    camera.position.copy(target).add(direction); camera.lookAt(target); camera.updateMatrixWorld();
    const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const tan = Math.tan(25 * Math.PI / 180) * 0.78;
    let distance = 0;
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
      const p = new Vector3(x, y, z).sub(target);
      distance = Math.max(distance, p.dot(direction) + Math.abs(p.dot(right)) / (tan * camera.aspect),
        p.dot(direction) + Math.abs(p.dot(up)) / tan);
    }
    return { cameraPosition: target.clone().addScaledVector(direction, distance), target: target.clone() };
  };
}
