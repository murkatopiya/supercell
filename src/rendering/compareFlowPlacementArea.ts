import { BufferGeometry, DoubleSide, Group, LineBasicMaterial, LineLoop, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from "three";
import type { Vec3 } from "../core/math/Vec3.js";

/** Scene-owned presentation rectangle; analytical ray-plane picking is separate. */
export function createCompareFlowPlacementArea(bounds: { minX: number; maxX: number; minZ: number; maxZ: number; height: number }) {
  const { minX, maxX, minZ, maxZ, height } = bounds;
  const object = new Group(); object.name = "compareFlowPlacementArea"; object.visible = false;
  const plane = new Mesh(new PlaneGeometry(maxX - minX, maxZ - minZ),
    new MeshBasicMaterial({ color: 0x9bc9df, opacity: 0.10, transparent: true, side: DoubleSide, depthWrite: false }));
  plane.rotation.x = -Math.PI / 2; plane.position.set((minX + maxX) / 2, height, (minZ + maxZ) / 2);
  plane.raycast = () => {};
  const corners: Vec3[] = [{ x: minX, y: height, z: minZ }, { x: maxX, y: height, z: minZ },
    { x: maxX, y: height, z: maxZ }, { x: minX, y: height, z: maxZ }];
  const outline = new LineLoop(new BufferGeometry().setFromPoints(corners.map(p => new Vector3().copy(p))),
    new LineBasicMaterial({ color: 0xb8e5f5, opacity: 0.9, transparent: true, depthWrite: false }));
  outline.raycast = () => {}; object.add(plane, outline);
  return { object, dispose() { plane.geometry.dispose(); plane.material.dispose(); outline.geometry.dispose(); outline.material.dispose(); } };
}
