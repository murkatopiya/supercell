import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";
import type { TracerParticle } from "../simulation/TracerParticle.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import {
  composeDemoTracerSimulation,
  createDemoPathHistory,
  demoKeepInactiveGlyphs,
} from "../app/composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../app/IntegrationFrame.js";
import {
  LIVE_DEMO_TRACER_PEDAGOGY,
  TracerPedagogy,
} from "../app/TracerPedagogy.js";
import appSrc from "../app/App.tsx?raw";
import composeDemoTracerSimulationSrc from "../app/composeDemoTracerSimulation.ts?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";
import { syncObservedTracerGlyph } from "./TracerScene.js";

function particle(
  x: number,
  y: number,
  z: number,
  active = true,
): TracerParticle {
  return { position: { x, y, z }, age: 0, active };
}

function meshAt(x: number, y: number, z: number, visible: boolean) {
  const mesh = new THREE.Object3D();
  mesh.position.set(x, y, z);
  mesh.visible = visible;
  return mesh;
}

describe("keepInactiveGlyphs observe policy", () => {
  it("hides an inactive glyph by default", () => {
    const mesh = meshAt(1, 2, 3, true);
    const p = particle(10, 0, -4, false);
    syncObservedTracerGlyph(mesh, p, false);
    expect(mesh.visible).toBe(false);
    expect(mesh.position.x).toBe(10);
    expect(mesh.position.y).toBe(0);
    expect(mesh.position.z).toBe(-4);
  });

  it("keeps an inactive glyph visible when keepInactiveGlyphs is true", () => {
    const mesh = meshAt(0, 0, 0, false);
    const p = particle(4723, 0, -1308, false);
    syncObservedTracerGlyph(mesh, p, true);
    expect(mesh.visible).toBe(true);
    expect(mesh.position.x).toBe(p.position.x);
    expect(mesh.position.y).toBe(p.position.y);
    expect(mesh.position.z).toBe(p.position.z);
  });

  it("keeps an active glyph visible in both modes", () => {
    const p = particle(5000, 1000, 0, true);
    const hidden = meshAt(0, 0, 0, false);
    const shown = meshAt(0, 0, 0, false);
    syncObservedTracerGlyph(hidden, p, false);
    syncObservedTracerGlyph(shown, p, true);
    expect(hidden.visible).toBe(true);
    expect(shown.visible).toBe(true);
    expect(hidden.position.toArray()).toEqual([5000, 1000, 0]);
    expect(shown.position.toArray()).toEqual([5000, 1000, 0]);
  });

  it("does not mutate the particle", () => {
    const p = particle(5, 6, 7, false);
    const before = structuredClone(p);
    syncObservedTracerGlyph(meshAt(0, 0, 0, true), p, true);
    expect(p).toEqual(before);
  });

  it("maps keepInactiveGlyphs only for DownwardPathline; live App uses that mapping", () => {
    expect(demoKeepInactiveGlyphs(TracerPedagogy.DiagnosticProbes)).toBe(false);
    expect(demoKeepInactiveGlyphs(TracerPedagogy.StoryPathlines)).toBe(false);
    expect(demoKeepInactiveGlyphs(TracerPedagogy.DownwardPathline)).toBe(true);
    expect(LIVE_DEMO_TRACER_PEDAGOGY).toBe(TracerPedagogy.DownwardPathline);
    expect(demoKeepInactiveGlyphs(LIVE_DEMO_TRACER_PEDAGOGY)).toBe(true);
    expect(appSrc).toMatch(/demoKeepInactiveGlyphs\(LIVE_DEMO_TRACER_PEDAGOGY\)/);
    expect(tracerViewportSrc).toMatch(/keepInactiveGlyphs/);
    expect(tracerViewportSrc).not.toMatch(/TracerPedagogy/);
    expect(composeDemoTracerSimulationSrc).toMatch(/demoKeepInactiveGlyphs/);
  });

  it("does not put pedagogy, domain, or y = 0 into TracerScene", () => {
    expect(tracerSceneSrc).not.toMatch(/TracerPedagogy/);
    expect(tracerSceneSrc).not.toMatch(/AtmosphericTracerDomain/);
    expect(tracerSceneSrc).not.toMatch(/y\s*===?\s*0/);
    expect(tracerSceneSrc).toMatch(/keepInactiveGlyphs/);
    expect(tracerSceneSrc).toMatch(/syncObservedTracerGlyph/);
  });

  it("leaves D1 glyph visible at the frozen terminal after domain exit", () => {
    const dt = DEMO_SCENARIO.simulation.timestep;
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      LIVE_DEMO_TRACER_PEDAGOGY,
    );
    const history = createDemoPathHistory(
      LIVE_DEMO_TRACER_PEDAGOGY,
      simulation.particles,
    )!;
    const p = simulation.particles[0]!;
    const mesh = meshAt(0, 0, 0, true);

    while (p.active) {
      simulation.step(dt);
      history.recordAfterStep(simulation.particles);
    }

    const keep = demoKeepInactiveGlyphs(LIVE_DEMO_TRACER_PEDAGOGY);
    syncObservedTracerGlyph(mesh, p, keep);

    expect(p.active).toBe(false);
    expect(p.position.y).toBe(0);
    expect(mesh.visible).toBe(true);
    expect(mesh.position.x).toBe(p.position.x);
    expect(mesh.position.y).toBe(0);
    expect(mesh.position.z).toBe(p.position.z);
    const terminal = {
      x: p.position.x,
      y: p.position.y,
      z: p.position.z,
    };
    const terminalTrail = history.pointsFor(0).at(-1)!;
    expect(terminalTrail).toEqual(terminal);

    for (let i = 0; i < 20; i++) {
      simulation.step(dt);
      history.recordAfterStep(simulation.particles);
      syncObservedTracerGlyph(mesh, p, keep);
    }
    expect(p.active).toBe(false);
    expect(p.position).toEqual(terminal);
    expect(mesh.visible).toBe(true);
    expect(mesh.position.toArray()).toEqual([terminal.x, terminal.y, terminal.z]);
    expect(history.pointsFor(0).at(-1)).toEqual(terminal);

    resetTracersFromSeeds(
      simulation,
      DEMO_SCENARIO.simulation.downwardPathlineSeeds,
    );
    history.clear();
    history.captureInitial(simulation.particles);
    syncObservedTracerGlyph(mesh, p, keep);

    expect(p.active).toBe(true);
    expect(p.position).toEqual({ x: 5000, y: 1000, z: 0 });
    expect(mesh.visible).toBe(true);
    expect(mesh.position.toArray()).toEqual([5000, 1000, 0]);
    expect(history.pointsFor(0)).toHaveLength(1);
  });
});
