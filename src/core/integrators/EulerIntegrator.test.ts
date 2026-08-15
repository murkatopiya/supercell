import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "./EulerIntegrator.js";
import { ConstantVelocityField } from "../../physics/synthetic/ConstantVelocityField.js";

describe("EulerIntegrator", () => {
  it("advances position by velocity times dt without mutating inputs", () => {
    const dt = 0.1;
    const position = { x: 0, y: 0, z: 0 };
    const velocity = { x: 10, y: 0, z: 0 };
    const field = new ConstantVelocityField(velocity);
    const integrator = new EulerIntegrator();

    const next = integrator.step(position, 0, dt, field);

    expect(next).toEqual({ x: 1, y: 0, z: 0 });
    expect(position).toEqual({ x: 0, y: 0, z: 0 });
    expect(velocity).toEqual({ x: 10, y: 0, z: 0 });
  });
});
