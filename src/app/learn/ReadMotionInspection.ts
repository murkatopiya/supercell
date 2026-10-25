import type { Vec3 } from "../../core/math/Vec3.js";
import { worldVelocityToAtmospheric } from "../../core/math/AtmosphericVelocity.js";
import { inspectWorldPoint } from "../../interaction/TracerInspection.js";
import type { createReadMotionSession } from "./createReadMotionSession.js";

type Session = ReturnType<typeof createReadMotionSession>;
interface RecordedLocation {
  readonly historyIndex: number | null;
  readonly position: Readonly<Vec3> | null;
  readonly modelTime: number | null;
  readonly height: number | null;
}
export interface MeasuredMotion extends RecordedLocation {
  readonly kind: "available";
  readonly historyIndex: number;
  readonly position: Readonly<Vec3>;
  readonly modelTime: number;
  readonly height: number;
  readonly velocity: Readonly<Vec3>;
  readonly speed: number;
  readonly eastward: number;
  readonly northward: number;
  readonly vertical: number;
}
export type RecordedMotion = MeasuredMotion | (RecordedLocation & { readonly kind: "unavailable" });

/** Selects actual history vertices. Never steps or writes Simulation or history. */
export function inspectRecordedMotion(lab: Session, index: number): RecordedMotion {
  let location: RecordedLocation = { historyIndex: null, position: null, modelTime: null, height: null };
  try {
    if (!Number.isInteger(index) || index < 0) return { ...location, kind: "unavailable" };
    const sample = lab.pathHistory.sampleAt(0, index);
    if (![sample.position.x, sample.position.y, sample.position.z, sample.simulationTime].every(Number.isFinite)) {
      return { ...location, kind: "unavailable" };
    }
    const position = Object.freeze({ ...sample.position });
    location = { historyIndex: index, position, modelTime: sample.simulationTime, height: position.y };
    const particle = lab.simulation.particles[0];
    if (!particle) return { ...location, kind: "unavailable" };
    const firstTime = lab.pathHistory.sampleAt(0, 0).simulationTime;
    const inspected = inspectWorldPoint(particle.tracerId, position, sample.simulationTime,
      sample.simulationTime - firstTime, particle.active, { total: lab.velocityObservation.total });
    // Only velocity/location are exposed; active-at-sample is not stored or inferred.
    if (![inspected.vTotal.x, inspected.vTotal.y, inspected.vTotal.z, inspected.speed].every(Number.isFinite)) {
      return { ...location, kind: "unavailable" };
    }
    return Object.freeze({ kind: "available", historyIndex: index, position,
      modelTime: sample.simulationTime, height: position.y,
      velocity: Object.freeze({ ...inspected.vTotal }), speed: inspected.speed,
      ...worldVelocityToAtmospheric(inspected.vTotal) });
  } catch {
    return { ...location, kind: "unavailable" };
  }
}

/** UI selection/reference only, invalidated when the owning history prefix disappears. */
export class ReadMotionInspection {
  private index: number | null = null;
  private saved: MeasuredMotion | null = null;
  private prefix: number | null = null;
  private previousCount = 0;

  constructor(private readonly lab: Session) { this.validateHistory(); }

  private validateHistory(): number {
    let count = 0, prefix: number | null = null;
    try {
      count = this.lab.pathHistory.sampleCountFor(0);
      prefix = this.lab.pathHistory.lanePrefixGeneration(0);
    } catch { /* A removed lane is unavailable, never a fabricated sample. */ }
    if (count === 0 || prefix !== this.prefix || count < this.previousCount) {
      this.index = null; this.saved = null;
    }
    this.prefix = prefix; this.previousCount = count;
    return count;
  }

  get selectedIndex(): number | null { this.validateHistory(); return this.index; }
  get reference(): MeasuredMotion | null { this.validateHistory(); return this.saved; }
  current(): RecordedMotion {
    const count = this.validateHistory();
    return inspectRecordedMotion(this.lab, this.index ?? count - 1);
  }
  select(index: number): void {
    const count = this.validateHistory();
    if (Number.isInteger(index) && index >= 0 && index < count) this.index = index;
  }
  saveReference(): void {
    const current = this.current();
    if (current.kind === "available") { this.index = current.historyIndex; this.saved = current; }
  }
  clearReference(): void { this.saved = null; }
}
