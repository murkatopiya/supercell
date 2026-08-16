# Deep Storm Tracer View

**Status:** this document is the live DEMO **rendering/view fixture**
for the deep storm column. `TracerScene` consumes
`DEEP_STORM_TRACER_VIEW` from `src/rendering/deepStormTracerView.ts`.

Chimney-retune view policy:
`docs/rendering/13-deep-chimney-rendering-scaling.md` — keep these
pose/grid/glyph **numbers**; cell = `1000 m` is a metric ruler, not
`σ`. Live fixture stays here.

Physics, `ScenarioConfig`, `DEMO_SCENARIO`, composition, seeds, and
simulation are unchanged by this document.

Five-operand **wiring:**
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`
(current rotation occupant). Seed layout:
`docs/rendering/08-composite-lower-radial-inflow-demo.md`.
Environmental knots:
`docs/rendering/09-deep-environmental-profile-demo.md`.
Storm-envelope **geometry:**
`docs/rendering/10-deep-storm-envelope-scaling.md`.
This view fixture does **not** change with the rotation occupant.
Tracer-scene **architecture:**
`docs/rendering/01-tracer-scene.md`.

## 1. Purpose

This document defines the default Three.js view for the live deep-storm
DEMO, after envelopes scaled to an `8–9 km` laboratory column
(`10`) inside `12 km` environmental support (`09`).

It answers:

    How should the default camera, projection, grid, axes, and tracer
    glyphs frame a 0–9 km storm column in physical meters, without
    exaggerating Y, without changing physics, and without pretending
    that the current three diagnostic seeds climb that column?

Rendering continues to **observe** `particle.position`. The renderer
does not invent atmosphere, follow tracers, or correct wind-tunnel
sweep-out.

This document owns:

- default framed vertical range;
- default camera position and OrbitControls target;
- FOV / near / far;
- grid extent and divisions;
- axes size;
- tracer glyph radius;
- world-scale lock-in (`1:1` meters);
- resize policy;
- simulation Reset vs camera;
- the chimney-aspect decision without non-uniform scaling;
- testing policy for the view fixture;
- the later implementation slice.

It is **not**:

- a physics SoT;
- a visual Y exaggeration;
- a story-tracer / trail slice;
- a follow-camera or storm-relative camera;
- a meteorological altitude UI;
- a volume / cloud / anvil renderer.

---

## 2. Why this document lives under rendering

Camera, grid, axes, and glyph size are view-layer numbers. They do not
belong in `ScenarioConfig` (`docs/architecture/01-scenario-config.md`
already lists camera as rendering/interaction).

`docs/rendering/01-tracer-scene.md` remains the source of truth for:

- observe-only sync;
- fixed-step vs render-frame;
- plain Three.js (no R3F);
- spheres + axes + XZ grid + inspection-only OrbitControls;
- app layout of hodograph + tracer panels.

This document is the DEMO **view fixture**, the same class of ownership
as `03`–`10` for composition/geometry. Pose numbers that used to be
inline in `TracerScene` are specified here.

```text
docs/rendering/01-tracer-scene.md              // architecture
docs/rendering/11-deep-storm-tracer-view.md    // this DEMO view fixture
```

Audit Y14 (`docs/architecture/02-current-model-assumptions-audit.md`)
said to revisit default framing after envelopes scaled. `10` §19
deferred that work. This is that slice.

---

## 3. What was studied

Docs:

- `docs/rendering/01-tracer-scene.md`
- `docs/rendering/02-tracer-runtime-controls.md`
- `docs/rendering/09-deep-environmental-profile-demo.md`
- `docs/rendering/10-deep-storm-envelope-scaling.md`
- `docs/architecture/02-current-model-assumptions-audit.md`
- `docs/physics/00-coordinate-system.md` (camera directions)
- `docs/ARCHITECTURE.md` §5 (future view scale vs explicit visual scale)

Implemented code (authoritative where docs lagged):

- `src/rendering/TracerScene.ts`
- `src/ui/tracer/TracerViewport.tsx`
- `src/ui/tracer/TracerRuntimeControls.tsx`
- `src/app/App.tsx`, `src/app/app.css`
- `src/scenario/DEMO_SCENARIO.ts` (read-only; not changed here)

There are **no** `TracerScene` unit tests today. `01` forbids a heavy
WebGL harness for read-only sync trivia. That policy stays.

---

## 4. Four-way split (must not collapse)

Reaffirmed from `09` / `10` / audit G6:

| Layer | Owner | Bound |
| --- | --- | --- |
| World / math sampling | physics | unbounded finite `y` |
| Environmental explicit support | `09` | knots `0 … 12000 m` |
| Storm envelopes | `10` | updraft `0–8000`, inflow `≤4500`, outflow `5000–9000` |
| Rendering / view | **this document** | default frame `0–10000 m` |

Do **not** introduce `scenario.topHeight` or `domain.topHeight`.

Do **not** frame to `12000 m` because the profile has a knot there.
The renderer shows tracers and debug helpers, not a sounding column.

---

## 5. Historical `0–2 km` pose (pre-implementation snapshot)

Verified against `TracerScene.ts`, `TracerViewport.tsx`, and `app.css`
before this fixture landed. These numbers match `09` §3.D / `10` §19.
They are the **historical `0–2 km` laboratory pose**, not the live
fixture. Live numbers are §23 / `DEEP_STORM_TRACER_VIEW`.

```text
PerspectiveCamera FOV          50°
near / far                     10 / 50000 m
initial aspect                 1, then setSize updates aspect
camera.position                (4500, 3500, 4500) m
camera.lookAt                  (500, 1000, −500) m
OrbitControls.target           (500, 1000, −500) m
OrbitControls.enableDamping    false
min/max distance, polar clamp  Three.js defaults (none)
AxesHelper                     1000 m
GridHelper                     8000 m, 16 divisions, XZ, y = 0
SphereGeometry radius          50 m  (16 × 12 segments)
material                       MeshBasicMaterial (unlit)
colors                         0xe74c3c, 0x3498db, 0x2ecc71
clear color                    0x1a2332
pixel ratio                    min(devicePixelRatio, 2)
setSize                        parent getBoundingClientRect;
                               renderer.setSize(w, h, false);
                               camera.aspect = w/h;
                               updateProjectionMatrix()
resize trigger                 window `resize` only (no ResizeObserver)
canvas host                    .tracer-viewport height 420 px, width 100%
Reset                          restores seeds/time/accumulator;
                               does not recreate TracerScene;
                               does not reset camera
sync                           mesh.position ← particle.position;
                               mesh.visible ← particle.active;
                               no write-back
```

World axes in the scene are canonical (`00`):

```text
+X East    AxesHelper red
+Y Up      AxesHelper green
+Z South   AxesHelper blue
```

`camera.up` is Three.js default `(0, 1, 0)`.

Current pose geometry (vertical plane through camera and target):

```text
horizontal offset   6403 m
distance            6874 m
elevation           21.3° down toward the seed layer
```

Angular placement at FOV `50°` (half-angle `25°`):

```text
y = 0      θ ≈ −7.3°   IN
y = 1000   θ =  0      lookAt (seed height)
y = 4000   θ ≈ +25.8°  OUT  (updraft peak already clipped)
y = 9000   θ ≈ +62°    OUT
```

The live default camera **cannot see** the deep updraft peak or the
upper outflow layer. That is the Y14 defect this fixture closes.

CSS layout that feeds aspect:

```text
.app max-width 1200 px
panels: hodograph minmax(280, 420) + tracer minmax(320, 1fr)
stack below 900 px
tracer viewport height 420 px (fixed)
```

Typical desktop aspect ≈ `1.7`. Narrowest contracted tracer column
≈ `320/420 ≈ 0.76`. Vertical FOV does not depend on aspect.

---

## 6. World scale lock-in

```text
1 world meter in X = 1 world meter in Y = 1 world meter in Z
```

Forbidden:

- exaggerated vertical scale;
- compressed Y;
- stretched X/Z;
- a fake visual `sigma`;
- any second coordinate system for display.

`docs/ARCHITECTURE.md` §5 allows a visual world scale only through a
**single explicit transformation** if technically necessary. It is
**not** necessary here. Physics coordinates are already meters, and
Three.js scene coordinates already match the canonical world frame
(`01` §4, `00`).

Particle positions are not rescaled. Simulation is not touched.

---

## 7. Vertical framing target

The four upper bounds remain different objects.

```text
environment support:     12000 m     // not a view target
storm active geometry:   9000 m      // outflow top; updraft lid 8000 m
default rendering frame: 0–10000 m   // this document
```

### 7.1 Candidates

| Frame | Meaning | Verdict |
| --- | --- | --- |
| `0–9000 m` | tight on outflow top | Rejected: no headroom; lid sits on the frustum edge |
| `0–10000 m` | `1 km` pad above outflow | **Accepted** |
| `0–11000 m` | more sky | Extra empty band; starts looking like env-column framing |
| `0–12000 m` | env `h_max` | Forbidden: renderer would present the sounding support as geometry (`09` §3.D, user constraint 14) |

### 7.2 Decision

```text
default framed vertical range = 0–10000 m
```

Reasons:

1. Contains the whole storm-active stack: ground, seeds `1000`, inflow
   taper `1500–4500`, updraft peak `4000`, outflow `5000–9000`.
2. Leaves `1 km` visual pad above outflow top `9000` (view frame,
   not `σ`).
3. Does **not** claim tropopause, cloud top, or environmental `h_max`.
4. Chosen camera (§11) keeps `y = 12000` **just outside** the default
   frustum, so the split is visible in geometry rather than only in
   prose.

`y = 0` stays in frame. The ground grid remains the lower reference.
The renderer does not add terrain.

---

## 8. Horizontal framing and the chimney

Live DEMO (`06`; `10` §13 was the historical needle):

```text
sigma = 4000 m   for updraft, rotation, inflow, outflow
                 (four equal DEMO values, not storm.sigma)
H_up / σ = 2
```

This is a documented laboratory column at 1:1 world scale. This view
slice **must not** hide that by stretching X/Z.

Visible Gaussian core (not a new physics radius):

```text
σ-core diameter = 8000 m
2σ radius       = 8000 m     E_r(2σ) = e^{-2} ≈ 0.135
seeds at r = 0 and r = 2400 m  (0.6 σ)
```

There is **no** updraft mesh. The column is inferred from helpers,
glyph positions, and empty framed height. The camera/grid were **not**
enlarged to fill the frame with `σ` (`13`).

Allowed tools: camera angle, perspective, distance, FOV, target, grid
extent, optional extra reference helpers.

### 8.1 How a 1:1 chimney stays readable

Pulling back just enough to fit `0–10000 m` in a `50°` FOV, from the
south-east, at a **small** downward elevation:

- the framed column occupies ~`65%` of vertical FOV (not a distant
  speck);
- an `8000 m` σ-core at this distance subtends the same order as
  `H_up = 8000 m` (~`26°`) → on-screen aspect ~`1:1`, honest vs
  world `H_up / σ = 2` (`13` §9);
- a true side-on or bird's-eye view would flatten that into a line or
  a disk.

Readability comes from filling the vertical FOV and keeping a 3/4
azimuth, not from fake scale. The column is no longer a needle.

---

## 9. Perspective / FOV

Current FOV is `50°` vertical. Horizontal FOV follows aspect:

```text
hFOV = 2 atan( tan(25°) · aspect )
aspect ≈ 1.70  →  hFOV ≈ 77°
aspect ≈ 0.76  →  hFOV ≈ 39°
```

### 9.1 Candidates

| FOV | Effect | Verdict |
| --- | --- | --- |
| `35°` | less vertical distortion; needs more distance; smaller glyphs | Rejected: extra variable, more “space shot” |
| `50°` | current; moderate; already known to users | **Accepted — keep** |
| `60°+` | closer camera, bigger glyphs, stronger perspective (base huge, top recedes) | Rejected: misleading height comparison on a tall column |

### 9.2 Decision

```text
FOV = 50°   // preserved
```

`50°` is wide enough to frame `0–10000 m` at a finite distance, and
narrow enough that a `10 km` column is not a fisheye. Changing FOV
and pose together would hide the source of the new look.

---

## 10. Camera candidates

All candidates keep:

- world `+Y` up;
- inspection OrbitControls;
- no follow mode;
- south-east family unless noted (same quadrant as the live pose:
  `+X`, `+Z` → looking west-north).

Angles below are in the vertical plane through camera and target.
`θ` is the angle from the look direction. Half-FOV = `25°`.
`IN` / `OUT` is versus that half-angle.

### C1 — scale the current pose ×5

```text
position (22500, 17500, 22500)
target   (2500, 5000, −2500)
distance ≈ 34 km
```

`0–10000 m` occupies only ~`31%` of vFOV (same fill as the old `2 km`
tower). `2σ` is `3.6°`. Space shot. Rejected.

### C2 — `10` §19 literal: ~12 km horizontal, camera above mid-column

```text
position ≈ (8485, 7000, 8485)
target   (0, 4000, 0)
elevation 14°
```

```text
y = 9000    θ ≈ 23.5°  IN (1.5° margin)
y = 10000   θ ≈ 28.1°  OUT
```

Looking down from `7000 m` throws the top of the frame above the
frustum. Rejected as a default.

### C3 — level camera at peak height

```text
position ≈ (9899, 4000, 9899)
target   (0, 4000, 0)
elevation 0°
distance 14 km
```

```text
y = 0       θ ≈ −16.0°  IN
y = 10000   θ ≈  23.2°  IN (1.8° margin)
```

Almost a side elevation. Ground grid collapses toward an edge-on
line. Weak 3D of the pad. Top margin tight. Rejected.

### C4 — SE 3/4, slight downward look, round coordinates

```text
position (12000, 6000, 12000)
target   (0, 4000, 0)
```

**Accepted.** Geometry in §11.

### C5 — same camera, target at geometric mid `y = 5000`

More balanced empty space, but:

- updraft peak leaves the screen center;
- `y = 12000` falls **inside** the frustum (`θ ≈ 22.8°`).

Rejected: the lookAt should be the pedagogical center of the storm
(updraft peak), and the default view should not swallow environmental
`h_max`.

### C6 — due south `(0, 6000, 17000)`

Cleaner “East = right”. Almost identical vertical angles to C4.
Flatter chimney (less 3/4 volume). Breaks continuity with the current
SE family. Rejected; OrbitControls can still swing there.

### C4b / C4c — closer SE `(11000, 6000, 11000)` / `(10000, 6000, 10000)`

Larger fill, smaller top margin (`3.3°` / `1.2°`). `C4c` is too tight
for a tall column under aspect changes. `C4`’s `5°` top margin is the
minimum comfortable pad.

---

## 11. Chosen default pose

```text
camera.position = (12000, 6000, 12000) m
OrbitControls.target = camera.lookAt = (0, 4000, 0) m
```

Derived:

```text
horizontal offset   12000 √2 = 16971 m
distance to target  17088 m
elevation           atan(2000/16971) = 6.72°  (slightly above lookAt)
azimuth             45° in XZ from +X toward +Z (from the south-east)
```

Vertical angles at FOV `50°`:

```text
height (m)   θ from look (deg)   default frustum   pedagogical band
    0        −12.75              IN  (12.3° margin)  ground / grid
 1000         −9.70              IN                  diagnostic seeds
 4000          0                 lookAt              updraft peak
 5000         +3.35              IN                  outflow starts
 7000        +10.09              IN                  outflow peak
 8000        +13.44              IN                  updraft lid
 9000        +16.75              IN                  outflow top
10000        +19.98              IN  (5.0° margin)   view pad
11000        +23.14              IN  (tight)         not a target
12000        +26.19              OUT                 env h_max stays out
```

Span `y = 0` → `10000` = `32.7°` ≈ **65% of vertical FOV**.

This is closer *relative to column height* than the old lab
(old `0–2000` filled only ~`31%` of vFOV). It is not a random distant
shot.

### 11.1 Why this target

`(0, 4000, 0)` is the storm axis at updraft `y_mid`.

The live target `(500, 1000, −500)` was seed-cluster framing for a
`2 km` tower. At a `10 km` frame, a `500 m` offset is noise and keeps
the camera aimed at the lower diagnostic layer — which is exactly why
`y = 4000` is clipped today.

Seeds at `y = 1000` remain in the **lower third** (`θ ≈ −9.7°`). They
are visible at `t = 0`. They are not the lookAt. That is intentional:
the default view shows the deep column, not a seed close-up.

### 11.2 Why `(12000, 6000, 12000)`

Round SE coordinates, same quadrant as the live pose, `5°` top margin
on `10000 m`, ground well inside, `12000 m` env top out.

The `12000` in **camera X/Z** is a round viewing distance. It is **not**
environmental `h_max` and not a domain bound. Framed height is `10000`.

### 11.3 Default orientation (what the image should read)

From the south-east, slightly above peak height:

- **vertical ascent** is up the screen (column fills most of vFOV);
- **eastward** environmental drift is toward screen-right (`+X`);
- **northward** is toward `-Z` (into the scene);
- **rotation / inflow / outflow** are horizontal deviations around
  the axis, readable in the XZ plane rather than as a pure silhouette.

Not a strict side elevation (C3) and not a plan view. OrbitControls
remain so a user can still “stand the scene up” further if they want.

Canonical meanings do not rotate:

```text
+X East    +Y Up    +Z South
```

No compass widget in this slice. RGB `AxesHelper` + axis-aligned grid
are the orientation legend.

---

## 12. Near / far clipping

```text
near = 10 m     // preserved
far  = 50000 m  // preserved
```

Default distance `17 km` is well inside `50 km`. A `10 km` column plus
orbit around it still fits. `10` §19 already noted that the far plane
admits an `8–12 km` column; this slice does **not** raise `far` merely
because the storm is taller.

`near = 10` remains small relative to glyph radius `150 m` and grid
cells `1000 m`. Orbiting close can still clip, as today
(`minDistance` is still `0`). Do not add polar/distance limits here.

Near/far ratio `5000` is unchanged. A few unlit spheres and a grid do
not justify a depth-buffer retune.

---

## 13. Grid

Keep a **ground-plane** `GridHelper` at `y = 0` in XZ as the primary
spatial reference. No terrain. The grid is not a physics domain.

### 13.1 Candidates

| Size / divisions | Cell | Verdict |
| --- | --- | --- |
| keep `8000 / 16` | `500 m` | Adequate for a `1 km` chimney; under a `10 km` frame the pad is a slightly small rug |
| `16000 / 16` | `1000 m` | Too much empty floor; noisy line count if cell stayed `500 m` |
| `12000 / 12` | `1000 m` | Fine, but the `12 km` extent collides visually with env `h_max` |
| `10000 / 10` | `1000 m` | **Accepted** |

### 13.2 Decision

```text
grid size       = 10000 m     // full width; ±5000 m from origin
grid divisions  = 10          // 1000 m cells
plane           = XZ, y = 0
```

Reasons:

1. Cell size is **1000 m** — a human kilometre ruler, not DEMO `σ`
   (`13`). At live `σ = 4000 m`, one cell is `σ/4`.
2. Pad matches the framed vertical range: a `10 km × 10 km` ground
   square under a `10 km` view, not a mesoscale cloth.
3. **Fewer** lines than the old `0–2 km` pad (`11` vs `17` per
   direction), so extent grew without becoming a dense hatch.
4. `10000` is the **view frame**, not `h_max = 12000`.

At the chosen pose, a `10000 m` pad subtends ~`33°` horizontally —
inside desktop `hFOV ≈ 77°`, and still inside the narrow
`hFOV ≈ 39°` at width `320 px`.

---

## 14. Axes

```text
AxesHelper size = 2000 m
```

Current `1000 m` is half the old `2 km` tower and only `10%` of the
new frame. It would read as a tiny RGB gizmo at the origin — still
useful, but weak.

A `10–12 km` triad would be a distracting cross through the whole
column. Forbidden.

`2000 m` is a **local origin reference**: twice the old helper, `20%`
of the framed height, long enough that `+X/+Y/+Z` remain readable at
`17 km` (~`6.7°` / ~`56 px` at `420 px` height).

### 14.1 Rejected: 10 km vertical scale line

A single line `(0,0,0) → (0, 10000, 0)` was considered as a chimney
spine (allowed by the brief *if* minimal and actually helpful).

Rejected for this slice:

1. It would look like a **storm axis** drawn as an object, amplifying
   audit Y2 (coincident DEMO centers already look like one axis).
2. It would look like a **rotation-tube** visualization. The renderer
   must not invent an envelope for height-independent rotation (`10`
   §10, Y1).
3. Ticks/labels would be altitude UI, which is out of scope. An
   unlabeled pole is still a fake structure.

Empty framed height plus the ground grid plus a local triad is the
honest laboratory. The column has no mesh because the model has no
cloud. That is not a camera bug.

---

## 15. Tracer marker size

Tracer spheres are **visualization glyphs**, not parcel volumes
(`docs/physics/01-parcel-basics.md`). Physics state is unchanged.

### 15.1 Options

| Option | Meaning | Verdict |
| --- | --- | --- |
| A | keep world radius `50 m` | Rejected for the default deep pose |
| B | larger world-space glyph | **Accepted** |
| C | screen-space sprites | Rejected: extra system, not minimal |

At the live distance `6874 m`, radius `50 m` is ~`7 px` diameter in
the `420 px` / `50°` host — small but readable.

At the new distance `17088 m`, radius `50 m` is ~`2.8 px`. Diagnostic
seeds become noise.

### 15.2 Decision

```text
sphere radius = 150 m     // rendering glyph only
geometry      = SphereGeometry(150, 16, 12)  // segments unchanged
```

On-screen at the default pose: ~`8.4 px` diameter — a screen-budget
choice at `17 km`, not a Gaussian fraction.

`150 m` is a visualization glyph (`13`). It is **not** `0.15σ`.
Live off-axis seeds are `2400 m` apart (`0.6σ`); surface gap
`2100 m`. Nobody should read the sphere as an air volume.

Option C is deferred until a later glyph slice, if ever.

---

## 16. Tracer visibility / occlusion

Keep `MeshBasicMaterial` (already unlit). No lights, no emissive, no
outlines, no labels, no trails, no glow, no postprocessing.

`depthTest` stays on. Overlapping glyphs occlude in draw order /
depth as today. With three diagnostic seeds this is not a problem.

Perspective stacking of a future particle cloud is out of scope.

---

## 17. Seeds, story tracers, wind-tunnel, rotation tube

Diagnostic layout (axis / east / north at `y = 1000`) is unchanged.
Live metres follow `06` (`r = 0.6σ`):

```text
(0, 1000, 0)
(2400, 1000, 0)
(0, 1000, −2400)
```

They remain lower-level diagnostic probes, not a story-seed set.
`04` / `06` still forbid adding story tracers because the view
looks climbable. Horizontal storm-relative environmental wind at
`y = 1000` is `|V_sr| ≈ 15.8 m/s`. Residence versus climb is a
model question (`06`), not a camera question.

The default pose shows the empty upper column. This slice must
**not** mask physics with:

- follow camera;
- moving storm;
- recentering tracers;
- moving the storm axis;
- a second storm-motion subtract in the renderer.

Story / flow tracers remain future. This view will look sparse. That
is a rendering limitation **interacting with** current physics, not a
framing defect.

Live rotation is height-localized (`12`). The renderer does not draw an
envelope to hide or advertise rotation, and does not draw a pole.
Trajectories change; the view fixture does not; no vortex tube is drawn.

---

## 18. Camera reset semantics

`docs/rendering/02-tracer-runtime-controls.md`:

- **Reset** restores seed copies, `age`, `active`, `clock.time = 0`,
  accumulator `0`;
- preserves `paused` / `timeScale`;
- does **not** recreate `TracerScene`;
- camera reset is **out of scope**.

This document **reaffirms** that contract. Simulation Reset does not
snap OrbitControls back to the default pose.

A future **Reset View** control is allowed as a later UI item. Do not
bundle it into this slice.

---

## 19. Resize policy

Keep the current pipeline:

```text
window resize
  → parent getBoundingClientRect
  → TracerScene.setSize(w, h)
  → renderer.setSize(w, h, updateStyle=false)
  → camera.aspect = w/h
  → updateProjectionMatrix()
```

Do **not** introduce a responsive camera-position algorithm.

Vertical framing is independent of aspect (vFOV fixed). On the
narrowest expected host (`320 × 420`):

- vFOV still `50°` → `0–10000 m` still fits;
- hFOV ≈ `39°` → the `10 km` grid nearly fills width, with a small
  pad. Acceptable.

Do not change the `420 px` host height in this slice. The column
already uses `65%` of that panel’s vertical FOV.

Pre-existing gap: no `ResizeObserver`. Panel size changes that are
not window resizes will not retarget the backing store. Out of scope.

---

## 20. Renderer ownership

All production changes belong in the rendering/app view layer.

```text
src/rendering/     view constants + TracerScene construction
src/ui/tracer/     canvas host / resize / rAF (no pose numbers)
```

Do **not** put view numbers in:

- `ScenarioConfig`
- `DEMO_SCENARIO`
- physics fields
- `Simulation`

Live constants live in `src/rendering/deepStormTracerView.ts` and are
imported by `TracerScene`. Tests freeze those numbers without
constructing a `WebGLRenderer`.

Recommended name:

```text
src/rendering/deepStormTracerView.ts
```

That is a DEMO view fixture object, not a camera framework.

---

## 21. Testing policy

No WebGL screenshot tests. No OrbitControls gesture tests. No
“looks nice” tests.

### Required

A pure test of the exported view constants against this lock-in:

```text
fovDeg              50
nearM               10
farM                50000
cameraPosition      (12000, 6000, 12000)
target              (0, 4000, 0)
gridSizeM           10000
gridDivisions       10
axisSizeM           2000
sphereRadiusM       150
```

### Not required in this slice

- constructing `TracerScene` / `WebGLRenderer`;
- asserting `setSize` updates `camera.aspect` (existing method,
  contract unchanged: `01` already forbids a harness for that trivia);
- asserting `syncFromParticles` is read-only (architecture + existing
  simulation tests; do not add a Three mock jungle).

If a tiny pure helper is extracted only to hold the numbers, test the
numbers. Do not invent a projection-math library to re-derive `θ(y)`.

---

## 22. Stale rendering docs (pointers)

`01-tracer-scene.md` stays the canonical **architecture**. Pose
numbers that appear in `09` §3.D / §16 and `10` §4 / §19 are the
**historical live `0–2 km` pose** until implementation, then become
historical entirely.

After this SoT:

- `01` points here for the DEMO view fixture;
- `09` / `10` status lines point here and must not be read as “the
  default camera is forever `(4500, 3500, 4500)`”;
- `02` still owns Pause / timeScale / Reset; this document only
  reaffirms that Reset does not move the camera.

Do not rewrite physics docs. Do not mass-edit `03`–`08` camera
sentences that already describe their own historical slices.

---

## 23. Compact lock-in

```text
world scaling:                 1:1 meters; no exaggerated Y
default framed vertical range: 0–10000 m
                               (storm-active to 9000; env 12000 not framed)
default camera position:       (12000, 6000, 12000) m
default lookAt / target:       (0, 4000, 0) m
FOV:                           50° (preserved)
near:                          10 m (preserved)
far:                           50000 m (preserved)
azimuth:                       SE 3/4, +X = +Z, looking west-north
elevation:                     6.72° above lookAt
grid size:                     10000 m
grid divisions:                10          // 1000 m cells; metric, not σ
grid plane:                    XZ, y = 0
axes size:                     2000 m      // local origin triad
storm-axis line / altitude UI: none
tracer marker:                 SphereGeometry radius 150 m
                               MeshBasicMaterial, existing colors
                               (screen glyph; not 0.15σ)
OrbitControls:                 inspection-only; damping off;
                               target as above; no new limits
resize policy:                 aspect + projection only;
                               no responsive pose
simulation Reset → camera:     no effect
Reset View:                    future UI, not this slice
seeds:                         owned by DEMO_SCENARIO / 06
                               (axis / east 2400 / north −2400)
story tracers / trails:        out of scope
follow / storm-relative cam:   forbidden
view config home:              rendering module, not ScenarioConfig
chimney-retune view policy:    13 (constants unchanged)
```

---

## 24. Blocking issues

None.

Chimney aspect, empty upper column, wind-tunnel sweep-out, and the
height-independent rotation tube are documented DEMO facts. They are
not reasons to hold this view fixture or to change physics first.

---

## 25. Explicit non-goals

Do not start:

- physics changes;
- `ScenarioConfig` / `DEMO_SCENARIO` / composition / seeds;
- story tracers;
- trails / path ribbons;
- cloud / anvil / volume rendering;
- wind arrows;
- GPU particles;
- follow camera;
- storm-relative moving camera;
- moving storm;
- subtracting `C`;
- scenario editor;
- altitude labels;
- compass UI;
- postprocessing;
- renderer rewrite;
- React Three Fiber;
- terrain;
- visual Y scale;
- Reset View (unless a later UI slice).

Plain Three.js remains.

---

## 26. Implementation slice

**Done.** The view fixture is live in `DEEP_STORM_TRACER_VIEW` /
`TracerScene`. The recipe below is the completed slice, not a pending
command.

No production change in the research slice that wrote this document.

When commanded, one vertical **rendering** slice:

### 26.1 Add

```text
src/rendering/deepStormTracerView.ts
src/rendering/deepStormTracerView.test.ts
```

Pure frozen numbers from §23. No Three.js in the constants module.

### 26.2 Change

```text
src/rendering/TracerScene.ts
```

- import the view fixture;
- apply camera position, lookAt, OrbitControls target, FOV, near, far;
- rebuild grid/axes/sphere from the fixture;
- keep `MeshBasicMaterial`, colors, clear color, pixel-ratio cap,
  `enableDamping = false`, `syncFromParticles` read-only,
  `setSize` aspect/projection behavior.

`src/ui/tracer/TracerViewport.tsx` should not need pose numbers.
Touch it only if the `TracerScene` constructor signature must change
(prefer: it does not).

### 26.3 Do not change

- physics, factories, `DEMO_SCENARIO`, `ScenarioConfig`;
- `composeDemoTracerSimulation`;
- integrator / `dt` / seeds / particle state;
- `TracerRuntimeControls` Reset semantics;
- hodograph;
- CSS viewport height (unless a later layout slice);
- `01` architecture rules (observe-only, no R3F, no interpolation).

### 26.4 Docs during implementation

- this document: status → live fixture after the code lands;
- `01-tracer-scene.md`: already pointed here in the SoT pass; confirm
  current-tense camera wording does not still describe `(4500, 3500, 4500)`
  as live;
- `09` / `10`: historical pose remains labeled historical.

### 26.5 Verify and stop

```text
npm test
npm run typecheck
STOP
```

---

## 27. Core lesson

A deep laboratory column is shown by **moving the camera in physical
meters**, not by stretching the world. The default view should fit
`0–10000 m` around the updraft peak, keep environmental `12000 m` out
of the default frustum, and leave the chimney’s `H/σ = 8` honest.
The three diagnostic seeds will still sit low and blow out of the
core. That is the current DEMO, finally visible.
