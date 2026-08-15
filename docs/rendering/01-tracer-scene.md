# Tracer Scene (v1)

## 1. Purpose

This document defines the first world-space 3D tracer visualization slice in
Supercell Explorer: fixed-step simulation, observe-only Three.js scene, and
shared `DEMO_SCENARIO` layout beside the hodograph.

**Status:** the original env-only DEMO field and vertical-column seeds in
this document are **historical**. Current DEMO tracer wiring is:

    EnvironmentalWindField + UpdraftField → CompositeVelocityField

as specified in `docs/rendering/03-composite-updraft-demo.md`.

This document remains the source of truth for:

- fixed-step vs render-frame separation;
- observe-only rendering (`particle.position`);
- plain Three.js scene contents (spheres, axes, grid, OrbitControls);
- app layout of hodograph + tracer panels.

It answers (historically):

    How does one ScenarioConfig drive tracer advection into a plain Three.js
    scene, with fixed simulation steps decoupled from render frames?

The **current** composition chain for DEMO tracers is documented in
`docs/rendering/03-composite-updraft-demo.md`. The historical env-only chain
was:

```text
ScenarioConfig
  → EnvironmentalWindProfile
  → EnvironmentalWindField
  → tracer seeds → TracerParticle[]
  → Simulation (fixed timestep + Euler)
  → last completed fixed-step particle positions
  → Three.js scene (observe only)
```

Physics defines atmospheric state. Simulation advances tracers. Rendering
observes the latest simulation state. Rendering must never create, modify, or
correct physical behavior.

---

## 2. Scope

The first tracer-scene slice showed:

- a Three.js world-space scene whose axes match the canonical project frame;
- a small number of tracer spheres advected by a world-space `VelocityField`
  supplied by app composition;
- fixed-step simulation driven by `scenario.simulation.timestep`;
- a thin React canvas host beside the existing hodograph panel;
- both panels fed by the same `DEMO_SCENARIO`.

Originally that field was `EnvironmentalWindField` only. The composite
updraft DEMO extension is owned by
`docs/rendering/03-composite-updraft-demo.md` and does not change the
observe-only rendering contract here.

Still out of scope for the tracer-scene rendering contract:

- storm-relative subtraction inside the 3D velocity field
  (storm motion `C` remains hodograph / diagnostic only);
- clouds, volumetrics, turbulence;
- trails / path ribbons;
- GPU particles;
- React Three Fiber / drei;
- state interpolation between previous and current simulation steps;
- `timeScale` / `paused` as ScenarioConfig fields;
- physical domain boundary semantics or particle clamping;
- camera polish / follow modes / full interaction framework;
- scenario edit forms;
- complex Three / WebGL unit-test harnesses for read-only sync trivia;
- updraft mesh / plume rendering.

---

## 3. Placement and dependency rules

Placement intent:

```text
src/simulation/
  Simulation, TracerParticle, SimulationClock (existing)
  pure fixed-step accumulator helper (new)

src/rendering/
  TracerScene (or equivalent): scene, camera, renderer,
  axes/grid helpers, tracer meshes, sync from particles

src/ui/tracer/
  thin React canvas host (mount / dispose / resize hookup only)

src/app/
  composition: DEMO_SCENARIO → profile / updraft → composite field
  → particles → Simulation (see docs/rendering/03-composite-updraft-demo.md)
  layout: hodograph panel + tracer viewport
  requestAnimationFrame loop wiring
```

Documentation:

```text
docs/rendering/01-tracer-scene.md
```

Dependency direction:

```text
physics      → core
simulation    → core, physics
rendering     → core math shapes as needed; observes simulation particle
                positions; may import three
ui/tracer     → rendering host + app-provided simulation handle / particles
app           → scenario + physics + simulation + rendering + ui
physics       ↛ rendering, ui, three
simulation    ↛ rendering, ui, three
```

**Lock-in:** plain Three.js. Do not introduce React Three Fiber for v1.

React owns canvas lifecycle only. The scene graph and per-frame mesh updates
are imperative Three.js code inside `src/rendering/`.

---

## 4. Coordinate and field semantics

Canonical world coordinates (`docs/physics/00-coordinate-system.md`):

```text
+X = East
+Y = Up
+Z = South
```

Three.js scene coordinates must correspond directly to this frame. Do not
reinterpret axes in the renderer.

`EnvironmentalWindField` samples ground-relative environmental wind from
height `position.y` and returns world velocity via
`atmosphericVelocityToWorld`:

```text
(x, y, z) = (eastward, vertical, -northward)
```

For environment profile v1, `vertical = 0`. Under an **environment-only**
field, tracers therefore stay at constant height and drift horizontally.

Under the **current composite DEMO** (`docs/rendering/03-composite-updraft-demo.md`),
`UpdraftField` contributes nonzero `Vy`, so tracer height changes and
environment is re-sampled along the trajectory. Do not assume constant
height for that DEMO.

Storm motion `C` from `ScenarioConfig` is **not** applied to the 3D field.
The hodograph path continues to use `C` for diagnostics/overlays only.

---

## 5. Scenario inputs used by this slice

From `docs/architecture/01-scenario-config.md`:

| Field | Role in tracer scene |
| --- | --- |
| `environment.windLevels` | build profile → `EnvironmentalWindField` |
| `storm.updraft` | build `UpdraftField` (current DEMO; see `03`) |
| `simulation.timestep` | fixed numerical `dt` for every `Simulation.step` |
| `simulation.tracerSeeds` | initial world positions for tracers |
| `stormMotion` | unused by 3D field; still used by hodograph composition |

### DEMO_SCENARIO seeds

**Current DEMO lock-in** (composite updraft demo):

```text
(0,    1000, 0)
(600,  1000, 0)
(1800, 1000, 0)
```

See `docs/rendering/03-composite-updraft-demo.md` for updraft params and
anti-oracle rules.

**Historical env-only lock-in** (first tracer slice; superseded for DEMO):

```text
(0, 0, 0)
(0, 1000, 0)
(0, 2000, 0)
```

Under env-only advection those seeds stayed at constant height with world
velocities from the demo profile knots. That contract must not be mixed with
the current composite DEMO expectations.

`simulation.timestep` remains the demo value `0.1` s unless a later doc
explicitly changes it. This is scenario data, not a project-wide
`DEFAULT_DT` inside core.

---

## 6. Building tracers and simulation (composition)

App / composition responsibilities for the **current DEMO** are defined in
`docs/rendering/03-composite-updraft-demo.md`:

1. `createEnvironmentalWindProfile(DEMO_SCENARIO)`;
2. `new EnvironmentalWindField(profile)`;
3. `createUpdraftField(DEMO_SCENARIO)`;
4. `new CompositeVelocityField([environmentField, updraftField])`;
5. map each seed to a `TracerParticle`:
   `{ position: copy of seed, age: 0, active: true }`;
6. `new Simulation(field, new EulerIntegrator(), particles)`.

**Integrator lock-in:** `EulerIntegrator` at composition level only.
Do not add integrator choice to `ScenarioConfig`.

Under environment-only advection, velocity depends only on height and
vertical motion is zero, so each tracer sees constant world velocity along
its path and Euler matches the exact discrete map. That property does **not**
hold for the composite DEMO (height and radius both change). Do not use a
general linear-y oracle for DEMO tracers under nonzero environmental wind.

Seed → particle mapping must copy coordinates so later config mutation does
not silently move live particles without an explicit rebuild.

---

## 7. Fixed-step loop (render time ≠ simulation time)

Policy from `docs/ARCHITECTURE.md` and
`docs/physics/03-numerical-integration-basics.md`:

- simulation uses a **fixed** timestep from the scenario;
- render frame duration is variable;
- **one rendered frame must not imply one simulation step**;
- a long frame may advance multiple simulation steps before rendering.

Conceptual loop (baseline without session runtime controls):

```text
onAnimationFrame(wallFrameDt):
  clampedDt = min(wallFrameDt, maxFrameDelta)   // spiral guard only
  accumulator += clampedDt
  while accumulator >= timestep:
    simulation.step(timestep)
    accumulator -= timestep
  rendering.syncFromParticles(simulation.particles)  // read-only
  rendering.render()
```

Baseline scene wiring maps wall time to simulation time at **1:1** and does
not put `timeScale` / `paused` into `ScenarioConfig`.

Pause / Resume, playback `timeScale` (`1×`/`5×`/`10×`/`20×`), Reset, and the
split between wall clamp / scale orchestration vs pure simulation-elapsed
accumulation are defined in:

    docs/rendering/02-tracer-runtime-controls.md

### No state interpolation (v1 lock-in)

v1 does **not** interpolate between previous and current simulation states.

After zero or more fixed steps in a frame, rendering displays the **last
completed fixed-step particle positions**. Visual motion may look stepped
relative to display refresh; that is acceptable. Correct fixed-step
numerics outrank visual smoothing.

### Accumulator helper

The accumulator / multi-step consumption logic must live as a **pure**
helper under `src/simulation/` (no DOM, no Three.js) so it can be unit-tested
independently of rendering.

Contract refinement (runtime-controls slice): `consumeFixedTimesteps` accepts
**simulation elapsed** seconds and returns fixed-step counts — it must not
own wall-time clamping. Wall clamp, pause gating, and `timeScale` belong to
runtime orchestration; see `docs/rendering/02-tracer-runtime-controls.md`.

---

## 8. Rendering contents

### Tracers

- small `THREE.Mesh` spheres (one mesh per active tracer);
- simple `MeshBasicMaterial` (no fancy lighting / PBR required);
- each render sync: copy `particle.position` → `mesh.position`;
- rendering must not write back into `TracerParticle` or `Simulation`.

### Debug spatial helpers (v1)

- `AxesHelper` for canonical `+X` / `+Y` / `+Z` (East / Up / South);
- `GridHelper` in the XZ plane (ground-level debug framing only).

These helpers are visualization/debug aids. They do **not** define a physical
simulation domain or boundary policy.

### Camera

- one `PerspectiveCamera`;
- fixed initial pose looking toward the seed column / origin region;
- framing is purely rendering/debug around expected short-time trajectories
  (no invented physics domain bounds).

### OrbitControls (inspection-only)

`OrbitControls` from the official Three.js examples/addons path is allowed
**only** as an inspection aid so a human can verify axes and motion.

It is not an interaction architecture, camera mode system, or follow
controller. Do not build an abstraction layer around it in v1.

---

## 9. App layout

The Vite/React app shows both:

1. existing hodograph panel composition from `DEMO_SCENARIO`;
2. tracer 3D viewport composition from the **same** `DEMO_SCENARIO`.

```text
DEMO_SCENARIO
├─ hodograph path → profile → points / diagnostics → HodographPanel
└─ tracer path    → profile → EnvironmentalWindField
                    + updraft → CompositeVelocityField
                    → seeds → Simulation → TracerScene observe
```

There must not be a second editable copy of environment winds, updraft
parameters, or seeds for the 3D panel.

Overlay visibility and other hodograph UI state remain UI-only and are not
part of `ScenarioConfig`.

---

## 10. Testing policy

### Required

1. **Seeds → initial particles**  
   scenario tracer seeds produce exact initial `TracerParticle.position`
   values (copied).

2. **Trajectory contracts**  
   - Historical env-only vertical-column DEMO: after `N` steps, positions
     matched analytically expected horizontal drift at each seed height.
   - Current composite DEMO: use the integration tests in
     `docs/rendering/03-composite-updraft-demo.md` (structural sum, lift,
     radial decay, reset, hodograph isolation). Do **not** assert
     `y(t) = y0 + W0·t` under nonzero environmental wind.

3. **Pure accumulator**  
   given simulation-elapsed seconds and a fixed timestep, the helper reports
   the correct number of steps consumed and the leftover accumulator —
   without Three.js or DOM.

### Rendering tests

Do **not** build a complex Three/WebGL unit-test harness to prove read-only
sync.

Rendering tests are allowed only where they stay simple and do not assert
implementation trivia (for example, avoid pixel buffers, WebGL context
mock jungles, or OrbitControls behavior). Prefer trusting the architectural
rule plus simulation-level contracts unless a tiny pure sync helper is
trivial to test without Three.

### Explicitly out of test scope for v1

- GPU / canvas pixel snapshots;
- OrbitControls gesture behavior;
- material / color cosmetics;
- frame-time smoothness.

---

## 11. Relationship to existing docs

- Architecture / sim vs render time:
  `docs/ARCHITECTURE.md`
- Coordinates / Three.js axis alignment:
  `docs/physics/00-coordinate-system.md`
- Environmental profile and `vertical = 0`:
  `docs/physics/04-environmental-wind-profile.md`
- Numerical timestep philosophy:
  `docs/physics/03-numerical-integration-basics.md`
- Scenario DTO and shared demo config:
  `docs/architecture/01-scenario-config.md`
- Hodograph UI (same scenario, velocity space):
  `docs/ui/01-hodograph-panel.md`
- Tracer Pause / timeScale / Reset (runtime UI, fixed dt):
  `docs/rendering/02-tracer-runtime-controls.md`
- Composite env + updraft DEMO wiring (current DEMO field/seeds):
  `docs/rendering/03-composite-updraft-demo.md`

If this document and implementation disagree, stop and resolve the
contradiction before extending the 3D slice.

---

## 12. v1 lock-in summary

1. Live rendering code in `src/rendering/`; thin React canvas host in
   `src/ui/tracer/`; composition and rAF wiring in `src/app/`.
2. Plain Three.js only — no React Three Fiber.
3. Fixed `scenario.simulation.timestep` + accumulator; never
   1 frame = 1 simulation step.
4. Rendering shows the **last completed fixed-step state** — no
   previous/current interpolation.
5. Current DEMO seeds: `(0,1000,0)`, `(600,1000,0)`, `(1800,1000,0)` — see
   `03-composite-updraft-demo.md`.
6. `EulerIntegrator` chosen in composition, not in ScenarioConfig.
7. Spheres + `AxesHelper` + XZ `GridHelper`; OrbitControls inspection-only.
8. One `DEMO_SCENARIO` feeds hodograph and 3D.
9. Current DEMO 3D field is `CompositeVelocityField([env, updraft])`;
   hodograph stays profile-only.
10. Required tests: seed mapping, trajectory contracts appropriate to the
    active DEMO field, pure accumulator. No heavy WebGL test harness for
    sync trivia.

---

## 13. Historical first implementation slice

The original env-only tracer-scene implementation slice is complete.

Further DEMO changes that wire `storm.updraft` and
`CompositeVelocityField` follow
`docs/rendering/03-composite-updraft-demo.md` under a separate
implementation command.
