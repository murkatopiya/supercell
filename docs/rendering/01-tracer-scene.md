# Tracer Scene (v1)

## 1. Purpose

This document defines the first world-space 3D tracer visualization slice in
Supercell Explorer: fixed-step simulation, observe-only Three.js scene, and
shared `DEMO_SCENARIO` layout beside the hodograph.

**Status:** the original env-only DEMO field and vertical-column seeds in
this document are **historical**. The later env+updraft DEMO field and
far-east seed in `docs/rendering/03-composite-updraft-demo.md` are also
**historical**. Current DEMO tracer wiring is:

    EnvironmentalWindField + VerticalEnvelopeUpdraftField
    + VerticalEnvelopeRotationField + LowerRadialInflowField
    + UpperRadialOutflowField
    → CompositeVelocityField

as specified in
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`
(current rotation occupant) and
`docs/rendering/08-composite-lower-radial-inflow-demo.md`
(five-operand introduction; seeds). Environmental knots:
`docs/rendering/09-deep-environmental-profile-demo.md`.
Live storm-envelope geometry:
`docs/rendering/10-deep-storm-envelope-scaling.md`.
DEMO default tracer-view fixture (camera, grid, axes, glyph size):
`docs/rendering/11-deep-storm-tracer-view.md`.
Chimney-retune view policy (constants unchanged):
`docs/rendering/13-deep-chimney-rendering-scaling.md`.

This document remains the source of truth for:

- fixed-step vs render-frame separation;
- observe-only rendering (`particle.position`);
- plain Three.js scene contents (spheres, axes, grid, OrbitControls);
- app layout of hodograph + tracer panels.

Construction `tracerCount` is initial occupancy, including zero, not a
permanent ceiling (`18` Slice 1). `addTracerSlot` / `addTracerSlots`
grow glyphs (and trail lines when `trails: true`) without recreating
camera, OrbitControls, grid, or the renderer. `clearTracerSlots`
disposes tracer glyph/trail resources only.

Pending-release preview (`18` Slice 3) is `syncReleasePreview` /
`createReleasePreviewMarker`. It is not a tracer slot, not a trail,
and not `keepInactiveGlyphs`. Guided App does not enable placement.

It answers (historically):

    How does one ScenarioConfig drive tracer advection into a plain Three.js
    scene, with fixed simulation steps decoupled from render frames?

The **current** composition chain for DEMO tracers is documented in
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`
(rotation occupant),
`docs/rendering/08-composite-lower-radial-inflow-demo.md` (seed layout),
`docs/rendering/09-deep-environmental-profile-demo.md` (knots), and
`docs/rendering/10-deep-storm-envelope-scaling.md` (envelope bounds).
The DEMO default camera/grid/glyph numbers are
`docs/rendering/11-deep-storm-tracer-view.md`; they are not universal
constants of this architecture document.

The historical env-only chain
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

Originally that field was `EnvironmentalWindField` only. Current DEMO
composition is owned by
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`
(rotation occupant),
`docs/rendering/08-composite-lower-radial-inflow-demo.md` (seed layout),
`docs/rendering/09-deep-environmental-profile-demo.md` (knots), and
`docs/rendering/10-deep-storm-envelope-scaling.md` (envelope geometry)
and
does not change the observe-only rendering contract here.

Still out of scope for the tracer-scene rendering contract:

- storm-relative subtraction inside the 3D velocity field
  (storm motion `C` remains hodograph / diagnostic only);
- clouds, volumetrics, turbulence;
- trails / path ribbons (path-history architecture:
  `docs/rendering/14-tracer-path-history.md`; trail primitive exists,
  live DEMO does not enable it);
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
  composition: DEMO_SCENARIO → profile / enveloped updraft / rotation /
  lower radial inflow / upper radial outflow
  → composite field
  → particles → Simulation (see docs/rendering/08-composite-lower-radial-inflow-demo.md)
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

Under the **current composite DEMO**
(`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`
occupant;
`docs/rendering/10-deep-storm-envelope-scaling.md` envelope geometry),
`VerticalEnvelopeUpdraftField` contributes height-dependent `Vy`,
`VerticalEnvelopeRotationField` contributes height-localized horizontal
tangent, `LowerRadialInflowField` contributes height-localized
horizontal inward flow, and `UpperRadialOutflowField` contributes
height-localized outward flow, so tracer height and horizontal path both
change. Environment, the updraft envelope, the rotation envelope, the
lower-inflow envelope, and the outflow envelope are re-sampled along the
trajectory. Do not assume
constant height, circular orbits, linear-y lift, isolated half-sine `y(t)`,
or `r = r0 e^{±At}` for that DEMO.

Storm motion `C` from `ScenarioConfig` is **not** applied to the 3D field.
The hodograph path continues to use `C` for diagnostics/overlays only.

---

## 5. Scenario inputs used by this slice

From `docs/architecture/01-scenario-config.md`:

| Field | Role in tracer scene |
| --- | --- |
| `environment.windLevels` | build profile → `EnvironmentalWindField` |
| `storm.updraft` | build `VerticalEnvelopeUpdraftField` (current DEMO; wiring `08`, bounds `10`) |
| `storm.rotation` | build `VerticalEnvelopeRotationField` (current DEMO; occupant `12`, primitive `13`) |
| `storm.lowerRadialInflow` | build `LowerRadialInflowField` (current DEMO; wiring `08`, bounds `10`) |
| `storm.upperRadialOutflow` | build `UpperRadialOutflowField` (current DEMO; wiring `08`, bounds `10`) |
| `simulation.timestep` | fixed numerical `dt` for every `Simulation.step` |
| `simulation.diagnosticSeeds` | DiagnosticProbes initial positions; default composition API |
| `simulation.storySeeds` | StoryPathlines initial positions; explicit mode (`docs/architecture/08-story-seeds.md`) |
| `simulation.downwardPathlineSeeds` | explicit DownwardPathline occupant D1 (`docs/architecture/12-downward-ground-impact-pedagogy.md`); not live App |
| `simulation.nearGroundOutflowPathlineSeeds` | live App NearGroundOutflowPathline occupant NG1 (`docs/architecture/14-near-ground-outflow-pedagogy.md`) |
| `stormMotion` | unused by 3D field; still used by hodograph composition |

### DEMO_SCENARIO seeds

**Current DEMO lock-in** (composite upper-outflow demo; seeds unchanged from `04`/`05`/`06`):

```text
(0,    1000,  0)
(600,  1000,  0)
(0,    1000, -600)
```

See `docs/rendering/08-composite-lower-radial-inflow-demo.md` for
five-operand wiring, rotation/inflow/updraft params, and anti-oracle
rules. See `docs/rendering/10-deep-storm-envelope-scaling.md` for
live envelope bounds. See `docs/rendering/09-deep-environmental-profile-demo.md`
for environmental knots.

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
`docs/rendering/08-composite-lower-radial-inflow-demo.md` (operand list)
and `docs/rendering/10-deep-storm-envelope-scaling.md` (envelope numbers):

1. `createEnvironmentalWindProfile(DEMO_SCENARIO)`;
2. `new EnvironmentalWindField(profile)`;
3. `createUpdraftField(DEMO_SCENARIO)`;
4. `createRotationField(DEMO_SCENARIO)`;
5. `createLowerRadialInflowField(DEMO_SCENARIO)`;
6. `createUpperRadialOutflowField(DEMO_SCENARIO)`;
7. `new CompositeVelocityField([environmentField, updraftField, rotationField, lowerRadialInflowField, upperRadialOutflowField])`;
8. map each seed to a `TracerParticle`:
   `{ position: copy of seed, age: 0, active: true }`;
9. `new Simulation(field, new EulerIntegrator(), particles)`.

**Integrator lock-in:** `EulerIntegrator` at composition level only.
Do not add integrator choice to `ScenarioConfig`.

Under environment-only advection, velocity depends only on height and
vertical motion is zero, so each tracer sees constant world velocity along
its path and Euler matches the exact discrete map. That property does **not**
hold for the composite DEMO (height and radius both change). Do not use a
general linear-y or circular oracle for DEMO tracers under nonzero
environmental wind.

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

- small `THREE.Mesh` spheres (one mesh per tracer slot);
- simple `MeshBasicMaterial` (no fancy lighting / PBR required);
- each render sync: copy `particle.position` → `mesh.position`;
- rendering must not write back into `TracerParticle` or `Simulation`.
- slot count may grow or drop to zero without reconstructing the scene
  (`addTracerSlot` / `clearTracerSlots`; `18` Slice 1).

### Debug spatial helpers (v1)

- `AxesHelper` for canonical `+X` / `+Y` / `+Z` (East / Up / South);
- `GridHelper` in the XZ plane (ground-level debug framing only).

These helpers are visualization/debug aids. They do **not** define a physical
simulation domain or boundary policy.

### Camera

- one `PerspectiveCamera`;
- world units remain physical meters (`1:1` on X/Y/Z; no exaggerated Y);
- DEMO default pose, FOV, near/far, grid, axes, and glyph radius are the
  view fixture in `docs/rendering/11-deep-storm-tracer-view.md`, not
  physics-domain bounds and not `ScenarioConfig`;
- the historical first-slice pose framed short-time seed trajectories
  in a `0–2 km` laboratory; that pose is not a project-wide constant.

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
                    + updraft + rotation → CompositeVelocityField
                    → seeds → Simulation → TracerScene observe
```

There must not be a second editable copy of environment winds, updraft
parameters, rotation parameters, or seeds for the 3D panel.

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
     `docs/rendering/08-composite-lower-radial-inflow-demo.md` (structural
     five-field sum, envelope `Vy = W0 E_r F(y)`, `G_in(1000) = √2/2` at
     seeds, outflow `G_out(1000) = 0`, orthogonal rotation/inflow signs,
     reset, hodograph isolation).
     Do **not** assert `y(t) = y0 + W0·t`, the isolated half-sine closed
     form, circular `r(t) = r0`, or `r(t) = r0 e^{±At}` under nonzero
     environmental wind.

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
- Composite env + updraft DEMO wiring (superseded for current DEMO
  field/seeds):
  `docs/rendering/03-composite-updraft-demo.md`
- Composite env + updraft + rotation DEMO wiring (superseded for current
  DEMO field; seeds kept):
  `docs/rendering/04-composite-rotation-demo.md`
- Composite env + updraft + rotation + radial-inflow DEMO wiring
  (superseded for current DEMO field; seeds kept):
  `docs/rendering/05-composite-radial-inflow-demo.md`
- Composite env + vertical-envelope updraft + rotation + radial-inflow
  DEMO wiring (superseded for current DEMO field; seeds kept):
  `docs/rendering/06-composite-vertical-envelope-updraft-demo.md`
- Composite env + enveloped updraft + rotation + height-independent
  inflow + upper outflow DEMO wiring (superseded for the inflow occupant):
  `docs/rendering/07-composite-upper-radial-outflow-demo.md`
- Composite env + enveloped updraft + rotation + lower radial inflow +
  upper outflow DEMO wiring (current DEMO operands/seeds):
  `docs/rendering/08-composite-lower-radial-inflow-demo.md`
- Deep environmental profile DEMO (current DEMO knots `0–12000 m`):
  `docs/rendering/09-deep-environmental-profile-demo.md`
- Deep storm envelope scaling (current DEMO envelope bounds):
  `docs/rendering/10-deep-storm-envelope-scaling.md`
- Deep storm tracer view (DEMO default camera/grid/glyph fixture):
  `docs/rendering/11-deep-storm-tracer-view.md`

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
5. Current DEMO seeds: `(0,1000,0)`, `(600,1000,0)`, `(0,1000,-600)` — see
   `08-composite-lower-radial-inflow-demo.md`. Envelope bounds: `10`.
6. `EulerIntegrator` chosen in composition, not in ScenarioConfig.
7. Spheres + `AxesHelper` + XZ `GridHelper`; OrbitControls inspection-only.
   DEMO pose/grid/glyph numbers: `11-deep-storm-tracer-view.md`.
8. One `DEMO_SCENARIO` feeds hodograph and 3D.
9. Current DEMO 3D field is
   `CompositeVelocityField([env, verticalEnvelopeUpdraft, rotation,
   lowerRadialInflow, upperRadialOutflow])`;
   hodograph stays profile-only.
10. Required tests: seed mapping, trajectory contracts appropriate to the
    active DEMO field, pure accumulator. No heavy WebGL test harness for
    sync trivia.

---

## 13. Historical first implementation slice

The original env-only tracer-scene implementation slice is complete.

The env+updraft DEMO extension is complete
(`docs/rendering/03-composite-updraft-demo.md`).

The env+updraft+rotation DEMO extension is complete
(`docs/rendering/04-composite-rotation-demo.md`).

The env+updraft+rotation+radial-inflow DEMO extension is complete
(`docs/rendering/05-composite-radial-inflow-demo.md`).

Further DEMO changes that replace height-independent `UpdraftField` with
`VerticalEnvelopeUpdraftField` are complete
(`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`).

Adding `UpperRadialOutflowField` as a fifth operand is complete
(`docs/rendering/07-composite-upper-radial-outflow-demo.md`).

Replacing the DEMO `RadialInflowField` occupant with
`LowerRadialInflowField` is complete
(`docs/rendering/08-composite-lower-radial-inflow-demo.md`).

The deep environmental profile (knots to `12000 m`) is complete
(`docs/rendering/09-deep-environmental-profile-demo.md`).

Deep storm-envelope scaling is complete
(`docs/rendering/10-deep-storm-envelope-scaling.md`).

The deep-storm tracer-view fixture is live
(`docs/rendering/11-deep-storm-tracer-view.md`).
