import * as THREE from "three";
import type { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { VISUAL_AIRFLOW_MARKER } from "./visualAirflowAppearance.js";

/**
 * Observe-only batched points for a VisualAirflowPopulation snapshot.
 * Does not integrate, pick, or assign scientific identity.
 */
export class VisualAirflowScene {
  private readonly geometry: THREE.BufferGeometry;
  private readonly positions: Float32Array;
  private readonly positionAttribute: THREE.BufferAttribute;
  private readonly material: THREE.PointsMaterial;
  private readonly points: THREE.Points;
  private disposed = false;

  constructor(count: number) {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error("count must be an integer >= 0");
    }

    this.positions = new Float32Array(count * 3);
    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.positions, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute("position", this.positionAttribute);

    this.material = new THREE.PointsMaterial({
      color: VISUAL_AIRFLOW_MARKER.color,
      size: VISUAL_AIRFLOW_MARKER.size,
      sizeAttenuation: VISUAL_AIRFLOW_MARKER.sizeAttenuation,
      transparent: true,
      opacity: VISUAL_AIRFLOW_MARKER.opacity,
      depthWrite: false,
      fog: true,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = "visualAirflowPopulation";
    this.points.renderOrder = -1;
    this.points.frustumCulled = false;
    this.points.raycast = () => {};
  }

  get object(): THREE.Points {
    return this.points;
  }

  get vertexCount(): number {
    return this.positions.length / 3;
  }

  /**
   * Copy current occupant positions into the stable buffer.
   * Does not recreate geometry, material, or the Points object.
   */
  syncFromPopulation(population: VisualAirflowPopulation): void {
    if (this.disposed) {
      throw new Error("VisualAirflowScene is disposed");
    }
    if (population.occupantCount !== this.vertexCount) {
      throw new Error("population occupantCount must match vertexCount");
    }
    population.writePositionsTo(this.positions);
    this.positionAttribute.needsUpdate = true;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.geometry.dispose();
    this.material.dispose();
  }
}
