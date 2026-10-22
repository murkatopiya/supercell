// @vitest-environment happy-dom
// Real viewer entry, mocked rendering platform: lifecycle checks, NOT WebGL/visual proof.
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { loadEvidence } from "./evidence.ts";
import { resolve } from "node:path";

const platform = vi.hoisted(() => ({ failAt: "", cleanupThrows: false,
  resources: [] as { kind: string; dispose: ReturnType<typeof vi.fn> }[],
  controls: null as null | { target: { x: number; y: number; z: number }; manual(): void },
  camera: null as null | { position: { x: number; y: number; z: number }; aspect: number },
  resize: null as null | (() => void), tick: null as null | ((now: number) => void),
  disconnect: vi.fn(), cancel: vi.fn(), loseContext: vi.fn() }));
vi.mock("three", () => {
  const fail = (stage: string) => { if (platform.failAt === stage) throw new Error(`forced ${stage}`); };
  class Disposable {
    dispose: ReturnType<typeof vi.fn>;
    constructor(public kind: string) {
      fail(`${kind}.create`);
      this.dispose = vi.fn(() => { if (platform.cleanupThrows && kind === "renderer") throw new Error("secondary cleanup error"); });
      platform.resources.push(this);
    }
  }
  class Vector3 {
    x = 0; y = 0; z = 0;
    set(x: number, y: number, z: number) { Object.assign(this, { x, y, z }); return this; }
    copy(p: Vector3) { return this.set(p.x, p.y, p.z); }
    project() { return this; }
  }
  return {
    Vector3, Color: class {},
    WebGLRenderer: class extends Disposable {
      domElement: HTMLCanvasElement;
      constructor(options: { canvas: HTMLCanvasElement }) { super("renderer"); this.domElement = options.canvas; }
      setPixelRatio() { fail("renderer.configure"); } setSize() {} render() { fail("renderer.render"); }
      forceContextLoss = platform.loseContext;
    },
    PerspectiveCamera: class {
      position = new Vector3(); aspect = 1;
      constructor() { fail("camera.create"); platform.camera = this; }
      updateProjectionMatrix() {}
    },
    Scene: class { add(...objects: { kind: string }[]) { if (objects.some(o => o.kind === "mesh")) fail("scene.addSlot"); } remove() {} },
    GridHelper: class {
      geometry: Disposable; material: Disposable;
      constructor() { fail("grid.create"); this.geometry = new Disposable("grid.geometry"); this.material = new Disposable("grid.material"); }
    },
    AxesHelper: class { geometry = new Disposable("axes.geometry"); material = new Disposable("axes.material"); },
    SphereGeometry: class extends Disposable { constructor() { super("sphere"); } },
    MeshBasicMaterial: class extends Disposable { constructor() { super("mesh.material"); } },
    LineBasicMaterial: class extends Disposable { constructor() { super("line.material"); } },
    BufferGeometry: class extends Disposable {
      constructor() { super("buffer"); } setAttribute() { fail("buffer.populate"); } setDrawRange() {}
    },
    Float32BufferAttribute: class {},
    Mesh: class { kind = "mesh"; position = new Vector3(); visible = true; constructor() { fail("mesh.create"); } },
    Line: class { constructor(public geometry: unknown) { fail("line.create"); } },
  };
});
vi.mock("three/addons/controls/OrbitControls.js", () => ({
  OrbitControls: class {
    kind = "controls"; domElement: HTMLElement | null = null;
    target = { x: 0, y: 0, z: 0, set(x: number, y: number, z: number) { Object.assign(this, { x, y, z }); } };
    listener = () => {}; start: (() => void) | null = null;
    dispose = vi.fn(() => { this.domElement?.removeEventListener("pointerdown", this.listener); });
    constructor() { platform.resources.push(this); platform.controls = this; }
    connect(element: HTMLElement) {
      this.domElement = element; element.addEventListener("pointerdown", this.listener);
      if (platform.failAt === "controls.connect") throw new Error("forced controls.connect");
    }
    update() {} addEventListener(_: string, listener: () => void) { this.start = listener; }
    removeEventListener() { this.start = null; } manual() { this.start?.(); }
  },
}));

const bundle = loadEvidence(process.cwd());
beforeEach(() => {
  if (process.env.LEARN_DEMO_SEED_VERIFICATION !== undefined) throw new Error("Opt-in must be absent");
  vi.resetModules(); platform.resources = []; platform.failAt = ""; platform.cleanupThrows = false;
  platform.disconnect.mockClear(); platform.cancel.mockClear(); platform.loseContext.mockClear(); platform.controls = null; platform.resize = null;
  const html = readFileSync(resolve(process.cwd(), "tools/learn-demo-seed-verification/viewer/index.html"), "utf8");
  document.body.innerHTML = html.split("<body>")[1]!.split("</body>")[0]!.replace(/<script[\s\S]*?<\/script>/g, "");
  vi.spyOn(document.getElementById("viewport")!, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 1000, 600));
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => bundle })));
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { platform.resize = callback; }
    observe() { if (platform.failAt === "resize.observe") throw new Error("forced resize.observe"); }
    disconnect = platform.disconnect;
  });
  vi.stubGlobal("requestAnimationFrame", vi.fn((tick: (now: number) => void) => {
    platform.tick = tick;
    if (platform.failAt === "schedule") throw new Error("forced schedule"); return 42;
  }));
  vi.stubGlobal("cancelAnimationFrame", platform.cancel);
});
afterEach(() => { window.dispatchEvent(new Event("pagehide")); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test.each(["renderer.create", "renderer.configure", "camera.create", "controls.connect", "grid.create",
  "sphere.create", "mesh.create", "buffer.populate", "line.create", "scene.addSlot", "resize.observe", "schedule"])(
  "initialization failure at %s releases every acquired resource once", async stage => {
    platform.failAt = stage; platform.cleanupThrows = true;
    await import("../viewer/main.ts");
    await vi.waitFor(() => expect(document.getElementById("status")!.textContent).toContain(`forced ${stage}`));
    window.dispatchEvent(new Event("pagehide"));
    for (const resource of platform.resources) expect(resource.dispose, resource.kind).toHaveBeenCalledTimes(1);
    expect(platform.loseContext).toHaveBeenCalledTimes(stage === "renderer.create" ? 0 : 1);
    if (platform.resize) expect(platform.disconnect).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll(".marker-label,.marker-card,#case option")).toHaveLength(0);
    expect((document.getElementById("frame") as HTMLButtonElement).disabled).toBe(true);
    expect((document.getElementById("case") as HTMLSelectElement).onchange).toBeNull();
  });

test("successful lifecycle: A+B2 framing, case switch, manual camera, resize and baseline reset", async () => {
  await import("../viewer/main.ts");
  await vi.waitFor(() => expect((document.getElementById("frame") as HTMLButtonElement).disabled).toBe(false));
  const select = document.getElementById("case") as HTMLSelectElement;
  select.value = "4"; select.dispatchEvent(new Event("change"));
  expect(document.querySelectorAll(".marker-label")).toHaveLength(2);
  expect(document.getElementById("camera-status")!.textContent).toContain("все сохранённые");
  const target = { ...platform.controls!.target };
  platform.resize!(); expect(platform.controls!.target).toMatchObject(target);
  platform.controls!.manual(); const pose = { ...platform.camera!.position };
  platform.resize!(); expect(platform.camera!.position).toMatchObject(pose);
  (document.getElementById("reset") as HTMLButtonElement).click();
  expect(platform.camera!.position).toMatchObject({ x: 12000, y: 6000, z: 12000 });
  expect(platform.controls!.target).toMatchObject({ x: 0, y: 4000, z: 0 });
  select.value = "1"; select.dispatchEvent(new Event("change"));
  expect(document.querySelectorAll(".marker-label")).toHaveLength(1);
  expect(document.getElementById("camera-status")!.textContent).toContain("все сохранённые");
  window.dispatchEvent(new Event("pagehide")); window.dispatchEvent(new Event("pagehide"));
  for (const resource of platform.resources) expect(resource.dispose, resource.kind).toHaveBeenCalledTimes(1);
  expect(platform.disconnect).toHaveBeenCalledTimes(1); expect(platform.cancel).toHaveBeenCalledWith(42);
  expect(platform.loseContext).toHaveBeenCalledTimes(1);
  expect(document.querySelectorAll(".marker-label,.marker-card,#case option")).toHaveLength(0);
});

test("first render failure also releases the successfully initialized scene", async () => {
  await import("../viewer/main.ts");
  await vi.waitFor(() => expect((document.getElementById("frame") as HTMLButtonElement).disabled).toBe(false));
  platform.failAt = "renderer.render";
  platform.tick!(0);
  expect(document.getElementById("status")!.textContent).toContain("forced renderer.render");
  window.dispatchEvent(new Event("pagehide"));
  for (const resource of platform.resources) expect(resource.dispose, resource.kind).toHaveBeenCalledTimes(1);
  expect(platform.loseContext).toHaveBeenCalledTimes(1);
});
