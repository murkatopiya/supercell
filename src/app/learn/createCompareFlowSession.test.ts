import { describe, expect, it, vi } from "vitest";
import { createCompareFlowSession, COMPARE_FLOW_POINTS } from "./createCompareFlowSession.js";
import { measureCompareFlow } from "./CompareFlowMeasurement.js";
import { compareFlowView } from "./compareFlowView.js";
import { velocityArrowTip } from "../../rendering/velocityArrow.js";
import { PerspectiveCamera, Vector3 } from "three";

vi.mock("../../simulation/Simulation.js", () => ({ Simulation: class { constructor() { throw new Error("Simulation forbidden"); } } }));
vi.mock("../../core/integrators/EulerIntegrator.js", () => ({ EulerIntegrator: class { constructor() { throw new Error("Integration forbidden"); } } }));

describe("Static Compare measurements", () => {
  it("samples one unchanged storm-relative Demo field at exact fixed P,t without Simulation", () => {
    const session = createCompareFlowSession();
    expect(session.integrationFrame).toBe("StormRelativeLaboratory"); expect(session.modelTime).toBe(0);
    for (const key of ["a", "b"] as const) {
      const measured = session[key];
      expect(measured.position).toEqual(COMPARE_FLOW_POINTS[key]);
      expect(measured.kind).toBe("available");
      if (measured.kind !== "available") throw new Error("Missing measurement");
      const actual = session.velocityObservation.total.sample(COMPARE_FLOW_POINTS[key], 0);
      expect(measured.velocity).toEqual(actual); // No second C subtraction.
      expect(measured.eastward).toBe(actual.x); expect(measured.northward).toBe(-actual.z);
      expect(measured.vertical).toBe(actual.y); expect(measured.speed).toBe(Math.hypot(actual.x, actual.y, actual.z));
      expect(session.arrows[key]?.velocity).toBe(measured.velocity);
      expect(session.arrows[key]?.position).toBe(measured.position);
      expect(Object.isFrozen(measured.velocity)).toBe(true);
    }
    expect(session.arrows.a?.displayMetresPerMps).toBe(80); expect(session.arrows.b?.displayMetresPerMps).toBe(80);
    expect(session).not.toHaveProperty("simulation"); expect(session).not.toHaveProperty("pathHistory");
  });
  it("uses exact P,t and only total observation, copying immutable values", () => {
    const v = { x: 3, y: -4, z: 12 }; const sample = vi.fn(() => v);
    const p = { x: 2400, y: 1000, z: 0 };
    const part = vi.fn(() => v);
    const m = measureCompareFlow(p, { total: { sample }, parts: [{ key: "test", field: { sample: part } }] });
    expect(sample).toHaveBeenCalledExactlyOnceWith(p, 0); expect(part).not.toHaveBeenCalled();
    expect(m).toMatchObject({ speed: 13, eastward: 3, northward: -12, vertical: -4 });
    v.y = 50; p.x = 0; expect(m.position.x).toBe(2400); expect(m.kind === "available" && m.vertical).toBe(-4);
  });
  it("updates only B using the retained composition, atomic snapshots and fixed scale/time", () => {
    const session = createCompareFlowSession(), a = session.a, initial = session.initialB;
    const sample = vi.spyOn(session.velocityObservation.total, "sample");
    const b = session.observeB({ x: 3300.125, y: 1000, z: -450.5 });
    expect(sample).toHaveBeenCalledExactlyOnceWith({ x: 3300.125, y: 1000, z: -450.5 }, 0);
    expect(session.a).toBe(a); expect(session.initialB).toBe(initial); expect(session.modelTime).toBe(0);
    if (b.measurement.kind !== "available") throw new Error("Missing B");
    expect(b.arrow?.velocity).toBe(b.measurement.velocity); expect(b.arrow?.position).toBe(b.measurement.position);
    expect(b.arrow?.displayMetresPerMps).toBe(80); expect(b.revision).toBe(1); expect(Object.isFrozen(b)).toBe(true);
    expect(() => session.observeB({ x: 5500 + 1e-9, y: 1000, z: 0 })).toThrow(RangeError);
    expect(sample).toHaveBeenCalledTimes(1);
    sample.mockImplementation(() => { throw new Error("Unavailable"); });
    const unavailable = session.observeB({ x: 3400, y: 1000, z: 0 });
    expect(unavailable.measurement).toMatchObject({ kind: "unavailable", position: { x: 3400, y: 1000, z: 0 } }); expect(unavailable.arrow).toBeNull();
    sample.mockReturnValue({ x: 3, y: 0, z: -4 });
    expect(session.observeB({ x: 3400, y: 1000, z: 0 }).measurement).toMatchObject({ kind: "available", speed: 5, vertical: 0 });
    sample.mockReturnValue({ x: 0, y: 0, z: 0 });
    expect(session.observeB({ x: 3500, y: 1000, z: 0 }).measurement).toMatchObject({ kind: "available", speed: 0 });
    sample.mockRestore();
  });
  it.each([NaN, Infinity, -Infinity])("does not substitute zero for invalid velocity %s", bad => {
    expect(measureCompareFlow(COMPARE_FLOW_POINTS.a, { total: { sample: () => ({ x: bad, y: 0, z: 0 }) } }).kind).toBe("unavailable");
  });
  it("rejects invalid positions before sampling, handles throws, and accepts real zero", () => {
    const sample = vi.fn(() => ({ x: 0, y: 0, z: 0 }));
    expect(measureCompareFlow({ x: NaN, y: 1000, z: 0 }, { total: { sample } }).kind).toBe("unavailable");
    expect(sample).not.toHaveBeenCalled();
    expect(measureCompareFlow(COMPARE_FLOW_POINTS.a, { total: { sample: () => { throw new Error("missing"); } } }).kind).toBe("unavailable");
    expect(measureCompareFlow(COMPARE_FLOW_POINTS.b, { total: { sample } })).toMatchObject({ kind: "available", speed: 0 });
  });
  it.each([0.45, 1, 1.8])("frames both probes and full tips at aspect %s without resampling", aspect => {
    const session = createCompareFlowSession(); const sample = vi.spyOn(session.velocityObservation.total, "sample");
    const home = compareFlowView(session)(aspect);
    const camera = new PerspectiveCamera(50, aspect, 10, 50000);
    camera.position.copy(home.cameraPosition); camera.lookAt(home.target); camera.updateMatrixWorld();
    for (const point of [session.a.position, session.b.position, ...Object.values(session.arrows).map(a => velocityArrowTip(a!))]) {
      const ndc = new Vector3().copy(point).project(camera);
      expect(Math.abs(ndc.x)).toBeLessThan(0.9); expect(Math.abs(ndc.y)).toBeLessThan(0.9);
      expect(ndc.z).toBeGreaterThan(-1); expect(ndc.z).toBeLessThan(1);
    }
    expect(sample).not.toHaveBeenCalled(); sample.mockRestore();
  });
  it("keeps the initial camera independent of B snapshots and closer than the old whole-area candidate", () => {
    const session = createCompareFlowSession(); const view = compareFlowView(session);
    const home = view(1.8);
    session.observeB({ x: 5500, y: 1000, z: 1000 });
    expect(view(1.8)).toEqual(home);
    expect(home.cameraPosition.distanceTo(home.target)).toBeLessThan(10000);
  });
});
