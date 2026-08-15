import { describe, expect, it } from "vitest";
import { ConstantVelocityField } from "../../physics/synthetic/ConstantVelocityField.js";
import { LinearXVelocityField } from "../../physics/synthetic/LinearXVelocityField.js";
import { RK2Integrator } from "./RK2Integrator.js";

describe("RK2Integrator (explicit midpoint)", () => {
  it("matches the exact step on a constant velocity field", () => {
    const dt = 0.1;
    const position = { x: 0, y: 0, z: 0 };
    const velocity = { x: 10, y: 0, z: 0 };
    const field = new ConstantVelocityField(velocity);
    const integrator = new RK2Integrator();

    const next = integrator.step(position, 0, dt, field);

    expect(next).toEqual({ x: 1, y: 0, z: 0 });
    expect(position).toEqual({ x: 0, y: 0, z: 0 });
    expect(velocity).toEqual({ x: 10, y: 0, z: 0 });
  });

  it("matches the hand-computed midpoint step on Vx = k*x", () => {
    // x0=100, k=0.1, dt=0.2
    // v1 = 10; midpoint x = 100 + 10*0.1 = 101; v2 = 10.1; x1 = 100 + 10.1*0.2 = 102.02
    const k = 0.1;
    const dt = 0.2;
    const position = { x: 100, y: 1000, z: 0 };
    const field = new LinearXVelocityField(k);
    const next = new RK2Integrator().step(position, 0, dt, field);

    expect(next.x).toBeCloseTo(102.02, 12);
    expect(next.y).toBe(1000);
    expect(next.z).toBe(0);
    expect(position).toEqual({ x: 100, y: 1000, z: 0 });
  });
});
