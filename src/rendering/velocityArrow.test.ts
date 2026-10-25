import { expect, it, vi } from "vitest";
import { Mesh, Vector3 } from "three";
import { createVelocityArrow, velocityArrowTip } from "./velocityArrow.js";

it("anchors at P, preserves the full 3D direction, and scales length linearly", () => {
  const arrow = createVelocityArrow();
  const sample = { position: { x: 20, y: 1000, z: -30 }, velocity: { x: 3, y: 4, z: -12 }, displayMetresPerMps: 40 };
  arrow.sync(sample); arrow.object.updateMatrixWorld(true);
  const head = arrow.object.children[1]!;
  const tip = head.localToWorld(new Vector3(0, .5, 0));
  expect(tip.distanceTo(new Vector3().copy(velocityArrowTip(sample)))).toBeLessThan(1e-9);
  expect(tip.distanceTo(arrow.object.position)).toBeCloseTo(520);
  arrow.sync({ ...sample, velocity: { x: 6, y: 8, z: -24 } });
  arrow.object.updateMatrixWorld(true);
  expect(head.localToWorld(new Vector3(0, .5, 0)).distanceTo(arrow.object.position)).toBeCloseTo(1040);
  expect(arrow.object.position.toArray()).toEqual([20, 1000, -30]);
  arrow.dispose();
});

it("handles zero/missing velocity and disposes all owned geometry and materials", () => {
  const arrow = createVelocityArrow();
  const meshes = arrow.object.children as Mesh[];
  const geometry = meshes.map(mesh => vi.spyOn(mesh.geometry, "dispose"));
  const material = vi.spyOn(meshes[0]!.material as import("three").Material, "dispose");
  arrow.sync({ position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, displayMetresPerMps: 40 });
  expect(arrow.object.visible).toBe(false);
  arrow.sync(null); expect(arrow.object.visible).toBe(false);
  arrow.dispose();
  geometry.forEach(dispose => expect(dispose).toHaveBeenCalledOnce());
  expect(material).toHaveBeenCalledOnce();
});
