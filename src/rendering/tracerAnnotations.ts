import * as THREE from "three";
import { TRACER_COLORS } from "./tracerObserveSlot.js";
import type { Vec3 } from "../core/math/Vec3.js";

export interface TracerAnnotation {
  readonly label: string;
  readonly start: Vec3;
  /** Fixed sampling probe: label only, without particle-start decoration. */
  readonly fixedProbe?: boolean;
  /** Opt-in movable sampling probe; ordinary particle-start guides remain fixed. */
  readonly followProbeHeight?: boolean;
  /** Presentation-only reference to model ground; omitted by default. */
  readonly showStartHeight?: boolean;
}

/** Static open rings and start labels, plus labels following the live glyphs. */
export function createTracerAnnotations(annotations: readonly TracerAnnotation[]) {
  const object = new THREE.Group();
  const currentLabels: THREE.Sprite[] = [];
  const movingGuides = new Map<number, { guide: THREE.Line<THREE.BufferGeometry, THREE.LineDashedMaterial>; projection: THREE.Mesh }>();
  const dispose = () => object.traverse(child => {
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material as THREE.Material & { map?: THREE.Texture };
    material?.map?.dispose(); material?.dispose();
  });
  try {
    annotations.forEach(({ label, start, showStartHeight, fixedProbe, followProbeHeight }, index) => {
      const color = TRACER_COLORS[index % TRACER_COLORS.length]!;
      if (!fixedProbe) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(220, 255, 48),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, depthTest: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.copy(start); object.add(ring);
      const origin = textSprite(`${label} start`, color);
      origin.position.copy(start); origin.position.y -= 300; object.add(origin);
      }
      const current = textSprite(label, color);
      object.add(current); currentLabels.push(current);
      if (showStartHeight) {
        // Neutral dashes distinguish a fixed height reference from colored paths.
        const guide = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(start.x, 0, start.z), new THREE.Vector3().copy(start),
        ]), new THREE.LineDashedMaterial({
          color: 0xb9c7d6, dashSize: 80, gapSize: 60,
          transparent: true, opacity: 0.7, depthTest: false, depthWrite: false,
        }));
        guide.name = `startHeight:${label}`;
        guide.computeLineDistances(); guide.raycast = () => {}; object.add(guide);
        const projection = new THREE.Mesh(new THREE.RingGeometry(65, 90, 32),
          new THREE.MeshBasicMaterial({ color: 0xb9c7d6, side: THREE.DoubleSide,
            depthTest: false, depthWrite: false }));
        projection.name = `startProjection:${label}`;
        projection.rotation.x = -Math.PI / 2;
        projection.position.set(start.x, 0, start.z);
        projection.raycast = () => {}; object.add(projection);
        if (followProbeHeight) movingGuides.set(index, { guide, projection });
      }
    });
  } catch (error) { dispose(); throw error; }
  return {
    object, dispose,
    sync(positions: readonly Vec3[]) {
      currentLabels.forEach((sprite, index) => {
        const position = positions[index]; sprite.visible = position !== undefined;
        if (position) { sprite.position.copy(position); sprite.position.y += 300; }
        const moving = movingGuides.get(index);
        if (position && moving) {
          const endpoints = moving.guide.geometry.getAttribute("position") as THREE.BufferAttribute;
          endpoints.setXYZ(0, position.x, 0, position.z); endpoints.setXYZ(1, position.x, position.y, position.z);
          endpoints.needsUpdate = true; moving.guide.geometry.computeBoundingSphere(); moving.guide.computeLineDistances();
          moving.projection.position.set(position.x, 0, position.z);
        }
      });
    },
  };
}

function textSprite(text: string, color: number) {
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D context unavailable for marker labels");
  context.font = "bold 72px sans-serif"; context.textAlign = "center"; context.textBaseline = "middle";
  context.lineWidth = 12; context.strokeStyle = "#101823"; context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  context.strokeText(text, 256, 64); context.fillText(text, 256, 64);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas), depthTest: false, depthWrite: false, sizeAttenuation: false,
  }));
  sprite.scale.set(0.14, 0.035, 1); sprite.renderOrder = 5;
  return sprite;
}
