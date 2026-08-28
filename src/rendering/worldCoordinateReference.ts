import * as THREE from "three";

export const WORLD_COORDINATE_REFERENCE_NAME = "worldCoordinateReference";

export type WorldCardinal = "N" | "E" | "S" | "W";

/**
 * World-space cardinals. Labels sit on the ground-reference plane.
 * E = +X, W = −X, S = +Z, N = −Z.
 * docs/ui/09-world-coordinate-reference.md
 */
export const WORLD_CARDINAL_DIRECTIONS: Readonly<
  Record<WorldCardinal, { x: number; z: number }>
> = {
  E: { x: 1, z: 0 },
  W: { x: -1, z: 0 },
  S: { x: 0, z: 1 },
  N: { x: 0, z: -1 },
};

const LABEL_HEIGHT_M = 40;
const ORIGIN_CROSS_LIFT_M = 0.5;
const ORIGIN_DISC_RADIUS_M = 90;
const DISTANCE_LABEL_OFFSET_M = 280;

export function cardinalWorldPosition(
  cardinal: WorldCardinal,
  halfExtentM: number,
): { x: number; y: number; z: number } {
  const direction = WORLD_CARDINAL_DIRECTIONS[cardinal];
  return {
    x: direction.x * halfExtentM,
    y: LABEL_HEIGHT_M,
    z: direction.z * halfExtentM,
  };
}

export function createWorldCoordinateReference(
  gridSizeM: number,
  gridDivisions: number,
): THREE.Group {
  const group = new THREE.Group();
  group.name = WORLD_COORDINATE_REFERENCE_NAME;

  const grid = new THREE.GridHelper(gridSizeM, gridDivisions, 0x8a9bb0, 0x3d4a5a);
  disableRaycast(grid);
  group.add(grid);

  const halfExtentM = gridSizeM / 2;
  const cellM = gridSizeM / gridDivisions;
  group.add(createOriginCross(halfExtentM));
  group.add(createOriginDisc());
  group.add(createWorldLabelSprite("0", 0.18, 0.12, {
    x: 180,
    y: LABEL_HEIGHT_M,
    z: 180,
  }));

  (Object.keys(WORLD_CARDINAL_DIRECTIONS) as WorldCardinal[]).forEach(
    (cardinal) => {
      group.add(
        createWorldLabelSprite(
          cardinal,
          0.55,
          0.32,
          cardinalWorldPosition(cardinal, halfExtentM),
        ),
      );
    },
  );

  const lastLabeledCell = Math.floor(gridDivisions / 2) - 1;
  for (let i = 1; i <= lastLabeledCell; i++) {
    const metres = i * cellM;
    group.add(
      createWorldLabelSprite(distanceMarkCopy("E", metres), 0.42, 0.2, {
        x: metres,
        y: LABEL_HEIGHT_M,
        z: DISTANCE_LABEL_OFFSET_M,
      }),
    );
    group.add(
      createWorldLabelSprite(distanceMarkCopy("N", metres), 0.42, 0.2, {
        x: DISTANCE_LABEL_OFFSET_M,
        y: LABEL_HEIGHT_M,
        z: -metres,
      }),
    );
  }

  group.traverse((child) => {
    disableRaycast(child);
    disableFogOnMaterial(child);
  });
  return group;
}

export function disposeWorldCoordinateReference(group: THREE.Group): void {
  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry !== undefined) {
      mesh.geometry.dispose();
    }
    const material = mesh.material;
    if (material === undefined) {
      return;
    }
    if (Array.isArray(material)) {
      for (const item of material) {
        disposeMaterial(item);
      }
      return;
    }
    disposeMaterial(material);
  });
}

function distanceMarkCopy(axis: "E" | "N", metres: number): string {
  return `${axis} +${metres / 1000} km`;
}

function createOriginCross(halfExtentM: number): THREE.LineSegments {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-halfExtentM, ORIGIN_CROSS_LIFT_M, 0),
    new THREE.Vector3(halfExtentM, ORIGIN_CROSS_LIFT_M, 0),
    new THREE.Vector3(0, ORIGIN_CROSS_LIFT_M, -halfExtentM),
    new THREE.Vector3(0, ORIGIN_CROSS_LIFT_M, halfExtentM),
  ]);
  const material = new THREE.LineBasicMaterial({
    color: 0xc5d4e4,
    fog: false,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.name = "worldCoordinateOriginCross";
  disableRaycast(lines);
  return lines;
}

function createOriginDisc(): THREE.Mesh {
  const geometry = new THREE.RingGeometry(
    ORIGIN_DISC_RADIUS_M * 0.55,
    ORIGIN_DISC_RADIUS_M,
    32,
  );
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0xd7e3f0,
    side: THREE.DoubleSide,
    fog: false,
    transparent: true,
    opacity: 0.85,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = ORIGIN_CROSS_LIFT_M;
  mesh.name = "worldCoordinateOrigin";
  disableRaycast(mesh);
  return mesh;
}

function createWorldLabelSprite(
  text: string,
  scaleXKm: number,
  scaleYKm: number,
  position: { x: number; y: number; z: number },
): THREE.Sprite {
  const texture = createLabelTexture(text);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    fog: false,
    sizeAttenuation: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(position.x, position.y, position.z);
  sprite.scale.set(scaleXKm * 1000, scaleYKm * 1000, 1);
  sprite.name = `worldCoordinateLabel:${text}`;
  disableRaycast(sprite);
  return sprite;
}

function createLabelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new Error("2D canvas context is required for coordinate labels");
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "700 56px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineWidth = 10;
  context.strokeStyle = "rgba(16, 22, 32, 0.9)";
  context.strokeText(text, 128, 64);
  context.fillStyle = "#f2f6fa";
  context.fillText(text, 128, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function disableRaycast(object: THREE.Object3D): void {
  object.raycast = () => {};
}

function disableFogOnMaterial(object: THREE.Object3D): void {
  const material = (object as THREE.Mesh).material;
  if (material === undefined) {
    return;
  }
  if (Array.isArray(material)) {
    for (const item of material) {
      setMaterialFog(item, false);
    }
    return;
  }
  setMaterialFog(material, false);
}

function setMaterialFog(material: THREE.Material, fog: boolean): void {
  if ("fog" in material) {
    (material as THREE.Material & { fog: boolean }).fog = fog;
  }
}

function disposeMaterial(material: THREE.Material): void {
  const mapped = material as THREE.Material & { map?: THREE.Texture | null };
  mapped.map?.dispose();
  material.dispose();
}
