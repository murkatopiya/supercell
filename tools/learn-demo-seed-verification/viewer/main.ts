import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { trajectoryFrame } from "./framing.ts";
import { CleanupScope } from "./cleanup.ts";
import { EXPECTED_HASHES, RUN_ID, demand, validateResult, frameAt, playbackStep,
  type Role, type SavedCase } from "./model.ts";

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const select = element<HTMLSelectElement>("case"), slider = element<HTMLInputElement>("step");
const play = element<HTMLButtonElement>("play"), restart = element<HTMLButtonElement>("restart");
const speed = element<HTMLSelectElement>("speed"), reset = element<HTMLButtonElement>("reset");
const frameButton = element<HTMLButtonElement>("frame");
const viewport = element("viewport"), labels = element("labels"), cards = element("markers"), status = element("status");
const COLORS: Record<Role, string> = { A: "#ff8b80", B1: "#70bfff", B2: "#8fdfa2" };

async function start() {
  const response = await fetch("/saved-result", { cache: "no-store" });
  demand(response.ok, "server could not verify input");
  const bundle = await response.json() as { resultText: string; resultSha256: string;
    provenanceSha256: string; checksumsSha256: string; verifiedFiles: number; snapshotFiles: number };
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(bundle.resultText)))]
    .map(n => n.toString(16).padStart(2, "0")).join("");
  demand(hash === EXPECTED_HASHES["result.json"] && bundle.resultSha256 === hash
    && bundle.provenanceSha256 === EXPECTED_HASHES["provenance.json"]
    && bundle.checksumsSha256 === EXPECTED_HASHES["checksums.json"], "browser input identity");
  const result = validateResult(JSON.parse(bundle.resultText));
  // All input validation finishes before constructing a renderer or enabling controls.
  const resources = new CleanupScope();
  try {
    const renderer = new THREE.WebGLRenderer({ canvas: element<HTMLCanvasElement>("scene"), antialias: true });
    resources.defer(() => renderer.forceContextLoss());
    resources.own(renderer); // Dispose GPU resources, then release the context, even if dispose throws.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene(); scene.background = new THREE.Color("#131d2c");
    const camera = new THREE.PerspectiveCamera(50, 1, 10, 50000);
    // Connect only after ownership is registered, so a partially failed connect is cleaned.
    const controls = new OrbitControls(camera);
    resources.defer(() => { if (controls.domElement) controls.dispose(); });
    controls.connect(renderer.domElement);
    controls.enableDamping = false;
    let cameraMode: "baseline" | "framed" | "manual" = "baseline";
    function resetView() {
      cameraMode = "baseline";
      camera.near = 10; camera.far = 50000; camera.fov = 50; camera.updateProjectionMatrix();
      camera.position.set(12000, 6000, 12000); controls.target.set(0, 4000, 0); controls.update();
      element("camera-status").textContent = "Камера: исходный фиксированный ракурс";
    }
    resetView();
    const grid = new THREE.GridHelper(10000, 10, 0x66809c, 0x34465e);
    resources.own(grid.geometry);
    for (const material of Array.isArray(grid.material) ? grid.material : [grid.material]) resources.own(material);
    scene.add(grid);
    const axes = new THREE.AxesHelper(2000);
    resources.own(axes.geometry);
    for (const material of Array.isArray(axes.material) ? axes.material : [axes.material]) resources.own(material);
    scene.add(axes);
    const sharedGeometry = resources.own(new THREE.SphereGeometry(150, 20, 14));
    type Slot = { role: Role; mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
      line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>; label: HTMLElement; card: HTMLElement };
    let slots: Slot[] = [], selected: SavedCase = result.cases[0]!, step = 0;
    let playing = false, startStep = 0, startTime = 0, animation = 0, disposed = false;
    const projection = new THREE.Vector3();
    let caseResources = new CleanupScope();
    resources.defer(() => { caseResources.dispose(); });
    resources.defer(() => { disposed = true; cancelAnimationFrame(animation); pause(); });
    function clearSlots() {
      caseResources.dispose(); caseResources = new CleanupScope(); slots = [];
    }
    function frameTrajectories() {
      const { width, height } = viewport.getBoundingClientRect();
      const aspect = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 ? width / height : NaN;
      const frame = trajectoryFrame(selected.states.flatMap(state => state.markers.map(marker => marker.position)),
        camera.fov, aspect);
      if (!frame) {
        resetView(); element("camera-status").textContent = "Кадрирование недоступно: пустые/некорректные границы или размер viewport. Исходный ракурс.";
        return;
      }
      cameraMode = "framed"; camera.aspect = aspect;
      camera.near = frame.near; camera.far = frame.far; camera.updateProjectionMatrix();
      camera.position.set(frame.position.x, frame.position.y, frame.position.z);
      controls.target.set(frame.target.x, frame.target.y, frame.target.z); controls.update();
      element("camera-status").textContent = "Камера: все сохранённые траектории выбранного случая";
    }
    function pause() { playing = false; play.textContent = "Play"; }
    function showStep(value: number) {
      step = value;
      const frame = frameAt(selected, step);
      demand(frame.state.markers.length === slots.length && frame.lanes.length === slots.length, "scene slot mismatch");
      slider.value = String(step); element("step-value").textContent = String(step);
      element("time").textContent = String(frame.state.clockTime);
      slots.forEach((slot, lane) => {
        const marker = frame.state.markers[lane]!;
        demand(marker.role === slot.role, "scene role mismatch");
        slot.mesh.position.set(marker.position.x, marker.position.y, marker.position.z);
        slot.mesh.visible = marker.active; // Existing Demo inactive-glyph policy.
        // GPU buffers use saved sample positions. drawRange excludes every future sample.
        slot.line.geometry.setDrawRange(0, frame.lanes[lane]!.length);
        slot.card.replaceChildren();
        const title = document.createElement("strong"); title.textContent = `${marker.role} · ${marker.active ? "● активна" : "○ неактивна"}`;
        const position = document.createElement("code");
        position.textContent = `x=${marker.position.x} · y=${marker.position.y} · z=${marker.position.z} м`;
        const history = document.createElement("code"); history.textContent = `recorder samples: ${frame.lanes[lane]!.length}`;
        slot.card.append(title, position, history);
      });
    }
    function chooseCase(index: number, fit = true) {
      pause(); clearSlots(); selected = result.cases[index]!;
      selected.roles.forEach((role, lane) => {
        const color = COLORS[role], material = caseResources.own(new THREE.MeshBasicMaterial({ color }));
        const mesh = new THREE.Mesh(sharedGeometry, material);
        caseResources.defer(() => { scene.remove(mesh); });
        const geometry = caseResources.own(new THREE.BufferGeometry());
        // GPU Float32 representation is rendering precision only; source data remains unchanged.
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(selected.history[lane]!.samples
          .flatMap(sample => [sample.position.x, sample.position.y, sample.position.z]), 3));
        const lineMaterial = caseResources.own(new THREE.LineBasicMaterial({ color }));
        const line = new THREE.Line(geometry, lineMaterial);
        caseResources.defer(() => { scene.remove(line); });
        line.frustumCulled = false;
        const label = document.createElement("span"); caseResources.defer(() => label.remove());
        label.className = "marker-label"; label.textContent = role;
        label.style.color = color; labels.append(label);
        const card = document.createElement("div"); caseResources.defer(() => card.remove());
        card.className = "marker-card"; card.style.setProperty("--role", color); cards.append(card);
        slots.push({ role, mesh, line, label, card }); scene.add(mesh, line);
      });
      showStep(0); if (fit) frameTrajectories(); else resetView();
    }
    resources.defer(() => select.replaceChildren());
    result.cases.forEach((c, index) => { const option = document.createElement("option");
      option.value = String(index); option.textContent = c.roles.join(" + "); select.append(option); });
    resources.defer(() => { select.onchange = slider.oninput = play.onclick = restart.onclick = speed.onchange = reset.onclick = frameButton.onclick = null; });
    // The same failure boundary also cleans a partially built case after switching.
    function fail(error: unknown) {
      resources.dispose();
      status.classList.add("error"); status.textContent = String(error);
      [select, slider, play, restart, speed, reset, frameButton].forEach(control => { control.disabled = true; });
    }
    select.onchange = () => { try { chooseCase(Number(select.value)); } catch (error) { fail(error); } };
    slider.oninput = () => { pause(); showStep(Number(slider.value)); };
    play.onclick = () => {
      if (playing) pause();
      else { if (step === 1200) showStep(0); startStep = step; startTime = performance.now(); playing = true; play.textContent = "Pause"; }
    };
    restart.onclick = () => { pause(); showStep(0); };
    speed.onchange = () => { if (playing) { startStep = step; startTime = performance.now(); } };
    reset.onclick = resetView;
    frameButton.onclick = frameTrajectories;
    const onManualCamera = () => { cameraMode = "manual"; element("camera-status").textContent = "Камера: ручной ракурс"; };
    resources.defer(() => controls.removeEventListener("start", onManualCamera));
    controls.addEventListener("start", onManualCamera);
    const resize = new ResizeObserver(() => {
      if (disposed) return;
      try {
        const { width, height } = viewport.getBoundingClientRect();
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
        renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
        if (cameraMode === "framed") frameTrajectories();
      } catch (error) { fail(error); }
    });
    resources.defer(() => resize.disconnect());
    resize.observe(viewport);
    const onVisibility = () => { if (document.hidden) pause(); };
    resources.defer(() => document.removeEventListener("visibilitychange", onVisibility));
    document.addEventListener("visibilitychange", onVisibility);
    function tick(now: number) {
      if (disposed) return;
      try {
        if (playing) {
          const next = playbackStep(startStep, now - startTime, Number(speed.value));
          if (next !== step) showStep(next);
          if (step === 1200) pause();
        }
        controls.update(); renderer.render(scene, camera);
        slots.forEach(slot => {
          projection.copy(slot.mesh.position).project(camera);
          const visible = slot.mesh.visible && Math.abs(projection.x) <= 1 && Math.abs(projection.y) <= 1 && Math.abs(projection.z) <= 1;
          slot.label.style.display = visible ? "block" : "none";
          slot.label.style.left = `${(projection.x + 1) / 2 * viewport.clientWidth + 10}px`;
          slot.label.style.top = `${(1 - projection.y) / 2 * viewport.clientHeight - 10}px`;
        });
        animation = requestAnimationFrame(tick);
      } catch (error) { fail(error); }
    }
    function dispose() { resources.dispose(); }
    resources.defer(() => window.removeEventListener("pagehide", dispose));
    window.addEventListener("pagehide", dispose, { once: true });
    if (import.meta.hot) import.meta.hot.dispose(dispose);
    chooseCase(0, false); [select, slider, play, restart, speed, reset, frameButton].forEach(control => { control.disabled = false; });
    element("identity").textContent = `${RUN_ID} · result SHA-256 ${hash} · ${bundle.verifiedFiles} checksums · ${bundle.snapshotFiles} source files verified by local server`;
    status.textContent = "Проверенный Slice 2 result · дискретные сохранённые шаги · без Simulation / collector";
    animation = requestAnimationFrame(tick);
  } catch (error) {
    resources.dispose(); // Never replace the initialization error with a cleanup error.
    throw error;
  }
}
void start().catch(error => { status.classList.add("error"); status.textContent = String(error);
  [select, slider, play, restart, speed, reset, frameButton].forEach(control => { control.disabled = true; }); });
