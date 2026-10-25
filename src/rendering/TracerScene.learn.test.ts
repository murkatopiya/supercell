/** @vitest-environment happy-dom */
import * as THREE from "three";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TracerScene } from "./TracerScene.js";
import { createTracerAnnotations } from "./tracerAnnotations.js";
import { createLearnSession } from "../app/learn/createLearnSession.js";

const mocks = vi.hoisted(() => ({ renderers: [] as any[], controls: [] as any[] }));
vi.mock("three", async original => {
  const actual = await original<typeof import("three")>();
  return { ...actual, WebGLRenderer: class {
    setPixelRatio = vi.fn(); setClearColor = vi.fn(); setSize = vi.fn(); render = vi.fn(); dispose = vi.fn();
    constructor() { mocks.renderers.push(this); }
  } };
});
vi.mock("three/addons/controls/OrbitControls.js", async () => {
  const { Vector3 } = await import("three");
  return { OrbitControls: class {
    target = new Vector3(); enablePan = true; enabled = true;
    constructor(private camera: THREE.PerspectiveCamera, public domElement: HTMLCanvasElement) { mocks.controls.push(this); }
    update = vi.fn(() => { this.camera.lookAt(this.target); this.camera.updateMatrixWorld(); });
    dispose = vi.fn();
  } };
});
beforeEach(() => {
  mocks.renderers.length = 0; mocks.controls.length = 0;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    clearRect: vi.fn(), strokeText: vi.fn(), fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});
afterEach(() => vi.restoreAllMocks());

it("keeps starting rings fixed, follows live labels and disposes owned resources", () => {
  const starts = [{ label: "A", start: { x: 0, y: 1000, z: 4000 } }, { label: "B", start: { x: 2400, y: 1000, z: 0 } }];
  const annotation = createTracerAnnotations(starts);
  const children = annotation.object.children;
  expect(children.some(child => child.name.startsWith("startHeight:"))).toBe(false);
  annotation.sync([{ x: 10, y: 2000, z: 30 }, { x: 40, y: 3000, z: 60 }]);
  expect(children[0]!.position.toArray()).toEqual([0, 1000, 4000]);
  expect(children[3]!.position.toArray()).toEqual([2400, 1000, 0]);
  expect(children[2]!.position.toArray()).toEqual([10, 2300, 30]);
  expect(children[5]!.position.toArray()).toEqual([40, 3300, 60]);
  const materials = children.map(child => (child as THREE.Mesh).material as THREE.Material & { map?: THREE.Texture });
  const dispose = materials.map(material => vi.spyOn(material, "dispose"));
  const textures = materials.flatMap(material => material.map ? [vi.spyOn(material.map, "dispose")] : []);
  annotation.dispose();
  expect(dispose.every(spy => spy.mock.calls.length === 1)).toBe(true);
  expect(textures).toHaveLength(4); expect(textures.every(spy => spy.mock.calls.length === 1)).toBe(true);
});

it("anchors opt-in dashed guides and projections to exact starts, and disposes their resources", () => {
  const lab = createLearnSession();
  const annotation = createTracerAnnotations(lab.sceneOptions.tracerAnnotations!);
  const guides = lab.sceneOptions.tracerAnnotations!.map(({ label, start }) => {
    const guide = annotation.object.getObjectByName(`startHeight:${label}`) as THREE.Line<THREE.BufferGeometry, THREE.LineDashedMaterial>;
    const projection = annotation.object.getObjectByName(`startProjection:${label}`) as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
    expect(guide.material).toBeInstanceOf(THREE.LineDashedMaterial);
    expect(Array.from(guide.geometry.getAttribute("position").array)).toEqual([start.x, 0, start.z, start.x, start.y, start.z]);
    expect(Array.from(guide.geometry.getAttribute("lineDistance").array)).toEqual([0, 1000]);
    expect(projection.position.toArray()).toEqual([start.x, 0, start.z]);
    expect(projection.rotation.x).toBe(-Math.PI / 2);
    expect(guide.material.depthWrite).toBe(false);
    const original = guide.geometry.getAttribute("position").array.slice();
    return { guide, projection, original, position: projection.position.clone() };
  });
  for (let i = 0; i < 3; i++) annotation.sync([{ x: 999, y: 5000, z: -20 }, { x: -400, y: 7000, z: 50 }]);
  for (const { guide, projection, original, position } of guides) {
    expect(guide.geometry.getAttribute("position").array).toEqual(original);
    expect(projection.position).toEqual(position);
  }
  const dispose = guides.flatMap(({ guide, projection }) => [
    vi.spyOn(guide.geometry, "dispose"), vi.spyOn(guide.material, "dispose"),
    vi.spyOn(projection.geometry, "dispose"), vi.spyOn(projection.material, "dispose"),
  ]);
  annotation.dispose(); expect(dispose.every(spy => spy.mock.calls.length === 1)).toBe(true);
});

it("frames growing recorded bounds, preserves relative camera control and resets without stepping", () => {
  const lab = createLearnSession();
  const scene = new TracerScene(document.createElement("canvas"), 2, { ...lab.sceneOptions, trails: true });
  scene.setSize(960, 480); scene.syncFromParticles(lab.simulation.particles); scene.render();
  const renderer = mocks.renderers[0]!;
  const camera = renderer.render.mock.calls[0][1] as THREE.PerspectiveCamera;
  const controls = mocks.controls[0]!;
  const direction = new THREE.Vector3(-1, 1, 2).normalize();
  const oldPose = lab.sceneOptions.viewPose!(2);
  const oldDistance = new THREE.Vector3().copy(oldPose.cameraPosition).distanceTo(oldPose.target);
  controls.target.add(new THREE.Vector3(300, 200, 100));
  camera.position.copy(direction).multiplyScalar(oldDistance * 0.6).add(controls.target);
  // Synthetic display sample only: exercise bounds, not a new numerical experiment.
  const particles = lab.simulation.particles.map(p => ({ ...p, position: { x: p.position.x, y: 8000, z: p.position.z + 2000 } }));
  lab.pathHistory.recordAfterStep(particles, 1);
  scene.render();
  const pose = lab.sceneOptions.viewPose!(2);
  expect(controls.target.clone().sub(pose.target).toArray()).toEqual([300, 200, 100]);
  const offset = camera.position.clone().sub(controls.target);
  expect(offset.clone().normalize().distanceTo(direction)).toBeLessThan(1e-12);
  expect(offset.length() / new THREE.Vector3().copy(pose.cameraPosition).distanceTo(pose.target)).toBeCloseTo(0.6);
  scene.resetView(); scene.setSize(320, 600); scene.render();
  for (let lane = 0; lane < 2; lane++) for (const sample of lab.pathHistory.pointsFor(lane)) {
    const projected = new THREE.Vector3().copy(sample).project(camera);
    expect(Math.abs(projected.x)).toBeLessThan(0.8); expect(Math.abs(projected.y)).toBeLessThan(0.8);
  }
  const renderedScene = renderer.render.mock.calls[0][0] as THREE.Scene;
  for (const { label, start } of lab.sceneOptions.tracerAnnotations!) {
    const projection = renderedScene.getObjectByName(`startProjection:${label}`)!;
    expect(projection.position.toArray()).toEqual([start.x, 0, start.z]);
    const ndc = projection.position.clone().project(camera);
    expect(Math.abs(ndc.x)).toBeLessThan(1); expect(Math.abs(ndc.y)).toBeLessThan(1);
  }
  expect(lab.simulation.clock.time).toBe(0);
  scene.dispose(); expect(renderer.dispose).toHaveBeenCalledOnce(); expect(controls.dispose).toHaveBeenCalledOnce();
});

it.each([1, 7])("releases renderer/controls and allocated geometry when label initialization fails at %s", failure => {
  let count = 0;
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(() => {
    if (++count === failure) return null;
    return { clearRect: vi.fn(), strokeText: vi.fn(), fillText: vi.fn() } as unknown as CanvasRenderingContext2D;
  });
  const geometryDispose = vi.spyOn(THREE.BufferGeometry.prototype, "dispose");
  const lab = createLearnSession();
  expect(() => new TracerScene(document.createElement("canvas"), 2, lab.sceneOptions)).toThrow(/context/);
  expect(mocks.renderers[0]!.dispose).toHaveBeenCalledOnce();
  expect(mocks.controls[0]!.dispose).toHaveBeenCalledOnce();
  expect(geometryDispose).toHaveBeenCalled();
});

it("owns and releases a velocity arrow without adding resources to ordinary scenes", () => {
  const scene = new TracerScene(document.createElement("canvas"), 0);
  scene.render();
  const rendered = mocks.renderers[0]!.render.mock.calls[0][0] as THREE.Scene;
  expect(rendered.getObjectByName("velocityArrow")).toBeUndefined();
  scene.syncVelocityArrow({ position: { x: 1, y: 2, z: 3 }, velocity: { x: 3, y: 4, z: -12 }, displayMetresPerMps: 40 });
  const arrow = rendered.getObjectByName("velocityArrow")!;
  const mesh = arrow.children[0] as THREE.Mesh;
  const geometry = vi.spyOn(mesh.geometry, "dispose");
  const material = vi.spyOn(mesh.material as THREE.Material, "dispose");
  scene.syncVelocityArrow(null); expect(arrow.visible).toBe(false);
  scene.dispose();
  expect(geometry).toHaveBeenCalledOnce(); expect(material).toHaveBeenCalledOnce();
  expect(rendered.getObjectByName("velocityArrow")).toBeUndefined();
});

it("keeps opt-in pair arrows independent of the single-arrow API and releases each resource once", () => {
  const scene = new TracerScene(document.createElement("canvas"), 0);
  scene.render();
  const rendered = mocks.renderers[0]!.render.mock.calls[0][0] as THREE.Scene;
  expect(rendered.children.some(c => c.name.startsWith("comparisonVelocityArrow:"))).toBe(false);
  const a = { position: { x: 0, y: 1000, z: 4000 }, velocity: { x: 3, y: 4, z: 0 }, displayMetresPerMps: 40 };
  const b = { position: { x: 2400, y: 1000, z: 0 }, velocity: { x: -6, y: -8, z: 0 }, displayMetresPerMps: 40 };
  scene.syncVelocityArrow(a);
  const single = rendered.getObjectByName("velocityArrow")!;
  scene.syncComparisonVelocityArrows({ a, b });
  const pair = ["a", "b"].map(k => rendered.getObjectByName(`comparisonVelocityArrow:${k}`)!);
  expect(pair[0]).not.toBe(pair[1]); expect(single.visible).toBe(true);
  const disposals = pair.flatMap(arrow => arrow.children.map(c => vi.spyOn((c as THREE.Mesh).geometry, "dispose")));
  const materials = pair.map(arrow => vi.spyOn((arrow.children[0] as THREE.Mesh).material as THREE.Material, "dispose"));
  const tip = (arrow: THREE.Object3D) => {
    const head = arrow.children[1] as THREE.Mesh;
    arrow.updateMatrixWorld(true);
    return head.localToWorld(new THREE.Vector3(0, 0.5, 0));
  };
  expect(tip(pair[0]!).distanceTo(new THREE.Vector3(120, 1160, 4000))).toBeLessThan(1e-6);
  expect(tip(pair[1]!).distanceTo(new THREE.Vector3(2160, 680, 0))).toBeLessThan(1e-6);
  scene.syncComparisonVelocityArrows({ a: null, b }); expect(pair[0]!.visible).toBe(false); expect(pair[1]!.visible).toBe(true);
  scene.syncVelocityArrow(null); expect(pair[1]!.visible).toBe(true);
  scene.syncComparisonVelocityArrows({ a, b }); expect(rendered.getObjectByName("comparisonVelocityArrow:b")).toBe(pair[1]);
  scene.dispose();
  expect([...disposals, ...materials].every(spy => spy.mock.calls.length === 1)).toBe(true);
  expect(mocks.renderers[0]!.dispose).toHaveBeenCalledOnce(); expect(mocks.controls[0]!.dispose).toHaveBeenCalledOnce();
});

it("uses labels without particle-start decorations for opt-in fixed probes", () => {
  const annotation = createTracerAnnotations([{ label: "A", start: { x: 0, y: 1000, z: 4000 }, fixedProbe: true }]);
  expect(annotation.object.children).toHaveLength(1);
  expect(annotation.object.children[0]).toBeInstanceOf(THREE.Sprite);
  annotation.dispose();
});

it("owns fixed-probe height guides anchored to ground without start decorations or motion", () => {
  const starts = [{ label: "A", start: { x: 0, y: 1000, z: 4000 }, fixedProbe: true, showStartHeight: true },
    { label: "B", start: { x: 2400, y: 1000, z: 0 }, fixedProbe: true, showStartHeight: true }];
  const scene = new TracerScene(document.createElement("canvas"), 2, { tracerAnnotations: starts });
  scene.syncFromParticles(starts.map(({ start }) => ({ position: start, active: true, age: 0 })));
  scene.render();
  const rendered = mocks.renderers[0]!.render.mock.calls[0][0] as THREE.Scene;
  const disposals = starts.flatMap(({ label, start }) => {
    const guide = rendered.getObjectByName(`startHeight:${label}`) as THREE.Line<THREE.BufferGeometry, THREE.LineDashedMaterial>;
    const projection = rendered.getObjectByName(`startProjection:${label}`) as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
    expect(guide.material).toBeInstanceOf(THREE.LineDashedMaterial);
    expect(guide.material.opacity).toBeLessThan(1);
    expect(Array.from(guide.geometry.getAttribute("position").array)).toEqual([start.x, 0, start.z, start.x, 1000, start.z]);
    expect(projection.position.toArray()).toEqual([start.x, 0, start.z]);
    return [vi.spyOn(guide.geometry, "dispose"), vi.spyOn(guide.material, "dispose"),
      vi.spyOn(projection.geometry, "dispose"), vi.spyOn(projection.material, "dispose")];
  });
  expect(rendered.children.filter(child => child instanceof THREE.Line && !(child instanceof THREE.LineSegments))).toHaveLength(0); // No trails.
  scene.dispose(); expect(disposals.every(spy => spy.mock.calls.length === 1)).toBe(true);
  expect(mocks.renderers[0]!.dispose).toHaveBeenCalledOnce(); expect(mocks.controls[0]!.dispose).toHaveBeenCalledOnce();
});

it("opts into placement plane and camera/touch policy without reconnecting controls or affecting single arrows", () => {
  const canvas = document.createElement("canvas"); canvas.style.touchAction = "none";
  const scene = new TracerScene(canvas, 0, { comparisonPlacementArea: { minX: 1500, maxX: 5500, minZ: -1000, maxZ: 1000, height: 1000 } });
  scene.render(); const rendered = mocks.renderers[0]!.render.mock.calls[0][0] as THREE.Scene;
  const area = rendered.getObjectByName("compareFlowPlacementArea")!;
  expect(area.visible).toBe(false);
  const resources = area.children.flatMap(child => [vi.spyOn((child as THREE.Mesh).geometry, "dispose"), vi.spyOn((child as THREE.Mesh).material as THREE.Material, "dispose")]);
  const mesh = area.children[0] as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  expect(mesh.position.y).toBe(1000); expect(mesh.material.transparent).toBe(true); expect(mesh.material.depthWrite).toBe(false); expect(mesh.material.opacity).toBeLessThan(.2);
  expect(mesh.material.depthTest).toBe(true);
  const outline = area.children[1] as THREE.LineLoop<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  expect(outline.material.color.getHex()).toBe(0xb8e5f5);
  expect(outline.material.opacity).toBe(.9); expect(outline.material.depthWrite).toBe(false);
  expect(outline.material.depthTest).toBe(true);
  scene.setComparisonPlacementMode(true); scene.setComparisonPlacementMode(true);
  expect(area.visible).toBe(true); expect(mocks.controls[0].enabled).toBe(false); expect(canvas.style.touchAction).toBe("pan-y pinch-zoom");
  scene.resetView(); expect(mocks.controls[0].enabled).toBe(false);
  scene.setComparisonPlacementMode(false); expect(area.visible).toBe(false); expect(mocks.controls[0].enabled).toBe(true); expect(canvas.style.touchAction).toBe("none");
  scene.setComparisonPlacementMode(true); scene.dispose();
  expect(resources.every(spy => spy.mock.calls.length === 1)).toBe(true); expect(mocks.controls[0].dispose).toHaveBeenCalledOnce();
});

it("moves only opt-in probe guides/rings in place, preserving ordinary fixed references", () => {
  const annotation = createTracerAnnotations([
    { label: "A", start: { x: 0, y: 1000, z: 4000 }, showStartHeight: true },
    { label: "B", start: { x: 2400, y: 1000, z: 0 }, fixedProbe: true, showStartHeight: true, followProbeHeight: true },
  ]);
  const line = annotation.object.getObjectByName("startHeight:B") as THREE.Line<THREE.BufferGeometry>;
  const geometry = line.geometry;
  annotation.sync([{ x: 50, y: 2000, z: 50 }, { x: 3123.5, y: 1000, z: -222.25 }]);
  expect(annotation.object.getObjectByName("startHeight:B")).toBe(line); expect(line.geometry).toBe(geometry);
  expect(Array.from(geometry.getAttribute("position").array)).toEqual([3123.5, 0, -222.25, 3123.5, 1000, -222.25]);
  expect(annotation.object.getObjectByName("startProjection:B")!.position.toArray()).toEqual([3123.5, 0, -222.25]);
  expect(Array.from((annotation.object.getObjectByName("startHeight:A") as THREE.Line).geometry.getAttribute("position").array)).toEqual([0, 0, 4000, 0, 1000, 4000]);
  expect(Array.from(geometry.getAttribute("lineDistance").array)).toEqual([0, 1000]); annotation.dispose();
});
