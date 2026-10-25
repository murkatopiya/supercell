import { ConeGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from "three";
import type { Vec3 } from "../core/math/Vec3.js";

/** Presentation snapshot, already in world coordinates. No field or frame conversion. */
export interface VelocityArrowObservation {
  readonly position: Vec3;
  readonly velocity: Vec3;
  readonly displayMetresPerMps: number;
}

export function velocityArrowTip(sample: VelocityArrowObservation): Vec3 {
  return {
    x: sample.position.x + sample.velocity.x * sample.displayMetresPerMps,
    y: sample.position.y + sample.velocity.y * sample.displayMetresPerMps,
    z: sample.position.z + sample.velocity.z * sample.displayMetresPerMps,
  };
}

/** Owned geometry/materials; the full tail-to-tip length is linear in |V|. */
export function createVelocityArrow() {
  const object = new Group();
  object.name = "velocityArrow";
  const material = new MeshBasicMaterial({ color: 0xffdc75 });
  const shaft = new Mesh(new CylinderGeometry(14, 14, 1, 12), material);
  const head = new Mesh(new ConeGeometry(52, 1, 16), material);
  shaft.raycast = head.raycast = () => {};
  object.add(shaft, head);
  object.visible = false;
  const direction = new Vector3();
  const up = new Vector3(0, 1, 0);
  return {
    object,
    sync(sample: VelocityArrowObservation | null) {
      if (!sample) { object.visible = false; return; }
      direction.set(sample.velocity.x, sample.velocity.y, sample.velocity.z);
      const length = direction.length() * sample.displayMetresPerMps;
      object.visible = Number.isFinite(length) && length > 0;
      if (!object.visible) return;
      object.position.copy(sample.position);
      object.quaternion.setFromUnitVectors(up, direction.normalize());
      const headLength = length * 0.18;
      shaft.scale.y = length - headLength;
      shaft.position.y = (length - headLength) / 2;
      head.scale.y = headLength;
      head.position.y = length - headLength / 2;
    },
    dispose() { shaft.geometry.dispose(); head.geometry.dispose(); material.dispose(); },
  };
}
