# Tracer Path History

**Status:** live NearGroundOutflowPathline wiring implemented. Recorder + trail
primitive + `TracerPedagogy` are in production. Live App shows NG1
with trails; inactive glyphs hidden. StoryPathlines remains an
explicit mode (S1/S2). DownwardPathline remains an explicit
mode (D1; `keepInactiveGlyphs`). DiagnosticProbes remains the default
composition API.

Lane count is no longer frozen at construction (`18` Slice 1).
`appendParticle` / `appendParticles` add a lane and capture the birth
position independently of stride. `clear()` still wipes points and
keeps lanes (Guided Reset: `clear` then `captureInitial`).
`removeAllLanes()` drops every lane (Explore Clear). `captureInitial`
remains a full-cohort recapture and is not the late-birth path.
Constructors accept `tracerCount = 0`.

Explore Reset/Clear orchestration (`18` Slice 2) lives on
`ExploreTracerSession`, not on this recorder: Reset still
`clear()` + `captureInitial`; Clear still `removeAllLanes()`.
The session does not own renderer slots.

Predecessor:
`docs/architecture/08-story-seeds.md` — trails (or equivalent path
history) are a **rendering prerequisite** before story seeds become
the live teaching view. Config split is already implemented.

Live frame: `StormRelativeLaboratory`.
Live integrator: Euler, `dt = 0.1` s.
Story duration of interest: ~200–400 s (`08` §2 / §8).

This document answers:

    What owns tracer path history, when is a point recorded, how long
    is it kept, how is it drawn, and how does that compose with
    Pause / timeScale / Reset and a future story-only pedagogy?

It does **not** implement trails, switch the live view to story seeds,
add `TracerPedagogy`, add UI, or change physics.

Story claim remains `08` §6. Trails exhibit that pathline. They are
not a streamtube, not continuity, and not a storm.

---

## 1. Verdict

**Option C. A separate path-history recorder.**

Canonical owner: `TracerPathHistory` (name indicative).

It observes particles **after each completed `Simulation.step`**,
stores **copied** world positions outside physics state, and is
Three-free. `TracerScene` later observes those snapshots and draws
a polyline. Neither `TracerParticle` nor `Simulation` nor the
WebGL scene owns the physical sampling.

```text
Simulation.step(dt)                 // integrator writes new positions
  → TracerPathHistory.recordAfterStep(particles)   // copies
  → TracerScene.syncFromParticles + syncFromPathHistory
  → render
```

Why this owner:

| Constraint | How C satisfies it |
| --- | --- |
| Physics particles do not know trails | `TracerParticle` unchanged; no `history` field |
| Renderer does not define physical time | Sampling is the fixed-step boundary, not `rAF` |
| Testable without WebGL | Recorder is a pure module; no `three` |
| Reset clears history unambiguously | Orchestration calls `clear` then `captureInitial` |

Drawing stays observe-only (`01`). History data is not a velocity
field and not a `ScenarioConfig` occupant.

---

## 2. Rejected owners

### A — Renderer-owned sampled position history

`TracerScene.syncFromParticles` / `render` would push
`particle.position` every animation frame.

Rejected:

- sampling follows browser FPS and pause-still-renders (`02`:
  paused frames still `sync` + `render` for OrbitControls);
- Pause would keep appending identical points, or the renderer
  would have to reconstruct “did a step happen?” from wall time;
- `timeScale` would thicken/thin the polyline with frame rate, not
  with `dt`;
- history tests become WebGL- or rAF-shaped;
- rendering would own a physical pathline.

A renderer may **copy history into a `BufferGeometry`**. It must not
**decide** which simulation times exist on the path.

### B — Simulation-owned trajectory history

`Simulation.step` or `TracerParticle` would append to an on-particle
or on-simulation array.

Rejected:

- trails become physics/simulation state;
- `Simulation` currently integrates and advances the clock only;
- Reset helper would have to know about visualization history;
- particles would carry a rendering concern into every consumer
  (hodograph-unrelated tests, integrators, future datasets);
- integrator-agnostic recording does not require living *inside*
  the integrator loop object.

`docs/ARCHITECTURE.md` lists trajectories on the simulation *layer*.
That is the observer’s home, not a license to grow `Simulation` or
`TracerParticle`.

Option C is that layer: a sibling recorder, not a field on the
particle.

---

## 3. Sampling semantics

Trail vertices must be the **discrete simulation pathline**, the
same points the glyph occupies after each fixed step (`01`: no
interpolation between steps).

Canonical policy:

```text
record every completed Simulation.step
stride = 1
```

Not:

| Policy | Why not |
| --- | --- |
| Every render/update | FPS- and Pause-coupled (A) |
| Distance threshold | Undersamples slow inflow/core climb (the story) and oversamples fast outflow + `V_sr` |
| Independent time threshold ≠ `dt` | Just a stride with extra clocks |
| Wall-clock / rAF sampling | `timeScale` and Pause live on simulation elapsed, not frames |

`dt = 0.1` s stays the laboratory step (`08` §7). The recorder does
not know Euler vs RK2. It copies `particle.position` after the step
has already happened.

**Stride.** The recorder may take a positive integer `stride`
(default `1`) so tests can name the contract. DEMO / future story
view must use `stride = 1`. Thinning is not required at this particle
count (§6). Do not introduce adaptive stride.

**Initial point.** History is not empty at `t = 0`. After construct
or Reset, `captureInitial(particles)` copies current positions so
the polyline starts at the seed. Then each `recordAfterStep` appends.
After `N` steps the history length is `N + 1`.

**Call contract.** Orchestration calls `recordAfterStep` once per
`simulation.step`, in the existing `consumeFixedTimesteps` loop
(`02` §5). The recorder does not poll `clock.time` to invent
samples, and does not run on frames with `steps === 0`.

**Inactive particles.** Do not append for a particle that was
already `active === false` at the previous observation
(`captureInitial` or the last `recordAfterStep`). If it was active
then and is inactive now, append the current accepted position
**once**. That is the terminal sample of the deactivating step
(atmospheric-domain exit or any other deactivation). Do not
special-case `y = 0` or `AtmosphericTracerDomain`; the recorder
only observes the `active` flag across calls.

Current live S1/S2 never deactivate (`Vy ≥ 0`). The terminal rule
exists so a future downward-crossing pathline does not stop in
mid-air (`11`, `15`).

---

## 4. Full history vs bounded history

Story teaching needs the ordered sequence from lower inflow through
the deep updraft region into upper outflow (`08` §6, §8). A sliding
window that forgets the approach once the parcel is in the column
destroys that exhibit.

| Policy | Verdict |
| --- | --- |
| Full history until Reset | **Canonical.** |
| Sliding time window | Rejected for story teaching |
| Ring buffer / max point count as pedagogy | Rejected; would clip the inflow leg |
| Decimated full history | Premature. Two tracers do not need it (§6) |

Do not optimize for thousands of particles. The live story set is
two seeds (`08`). Diagnostic live view has no trails (§8).

An unbounded-run safety cap (hours at `1×`) is **deferred**. At DEMO
scale even a long idle session is cheap. Do not add a max-point
invariant to v1 of the recorder.

---

## 5. Geometry representation

Plain Three.js. History marker, not a physical streamtube.

Canonical draw primitive:

```text
THREE.Line + BufferGeometry
```

One `Line` per traced particle, `GL_LINE_STRIP` over the recorded
positions in order. The existing sphere glyph stays at the current
position (the end of the polyline).

Rejected for v1:

| Primitive | Why not |
| --- | --- |
| `LineSegments` | Duplicated vertices; implies disconnected segments |
| Tube / `TubeGeometry` / ribbon | Invents a radius the path does not have; expensive; reads as a vortex core |
| GPU particles / point sprite path | Extra pipeline; still needs ordered history |
| Fat `Line2` / linewidth shaders | Visual-design extra; default `Line` is enough |

`TracerScene` copies recorder positions into the line attribute on
sync. It does not resample, interpolate, or smooth. Growing
~4000 vertices per line and rewriting the used prefix is acceptable.
Do not require GPU capacity doubling as an architecture invariant.

---

## 6. Memory / numerical estimate

Inputs (`08`, live `dt`):

```text
tracers           2          // story set only
dt                0.1 s
story window      200–400 s  // teaching sequence; S2 r<2σ ~ 444 s
steps @ 400 s     4000
points / tracer   4001       // + captureInitial
points total      8002
```

Use 400 s as the design window; 444 s does not change the order of
magnitude.

CPU history as copied `{ x, y, z }` objects (JS number = float64):

```text
~64 B / point  (object + 3 floats + array slot, V8-scale)
8002 × 64  ≈  0.51 MB
```

Packed GPU attribute (`Float32Array`, 3 components):

```text
8002 × 12 B  ≈  0.096 MB
```

`float32` ulp at ~10 km is ~1 mm — far below the 150 m glyph
(`11` / `13`).

Both together **< 1 MB**. That is cheap.

Per-frame cost at `timeScale = 20`, ~60 Hz:

```text
simulationElapsed ≈ (1/60) × 20 ≈ 0.33 s
steps / frame     ≈ 3
new points        ≈ 3 × 2 = 6 copies
GPU rewrite       full used prefix of two lines (~4000 verts) is still trivial
```

At `1×`, most frames have `steps === 0` (accumulator < `dt`); those
frames append **nothing** and only re-render OrbitControls.

**Canonical sampling stays every-step** because the cost is negligible
and the polyline then *is* the laboratory pathline. A stride of 10
would still look continuous next to a 150 m glyph (~5 m of rotation
arc per 1 s at `r ~ 1000 m`, `Ω = 0.005 s⁻¹`), but that is a visual
coincidence, not a reason to drop samples.

---

## 7. Story vs diagnostic

Trails are for **story pathlines**. Diagnostic probes teach by
contrast at `t ≈ 0` (`08` §8). They must not gain trails as a
side effect of installing the recorder.

| Live set | Trails |
| --- | --- |
| `diagnosticSeeds` (default composition API) | **Off.** No recorder wired. |
| `storySeeds` (StoryPathlines; explicit) | **On.** Recorder + one line per story tracer. |
| `downwardPathlineSeeds` (DownwardPathline; explicit) | **On.** Same recorder contract. |
| `nearGroundOutflowPathlineSeeds` (live App NearGroundOutflowPathline) | **On.** Same recorder contract (`14`). |
| Both groups at once | Still **deferred** (`08` §5, `12` §9, `14` §12). Trails do not license a concatenated cloud. |

Do not auto-trail “whatever particles exist.” Five glyphs with five
trails would collapse diagnostic vs story again.

The recorder itself is **generic**: it does not know σ, basin,
`IntegrationFrame`, or seed role. Composition chooses the particle
array **and** whether to construct/feed the recorder.

---

## 8. TracerPedagogy

Implemented at the app composition boundary. Not a `ScenarioConfig`
field (`08` §5, `01`).

```text
TracerPedagogy.DiagnosticProbes              // default composition API; no trails
TracerPedagogy.StoryPathlines                // explicit mode; S1+S2; trails on
TracerPedagogy.DownwardPathline              // explicit; D1; trails on; keepInactiveGlyphs
TracerPedagogy.NearGroundOutflowPathline     // live App; NG1; trails on; keepInactiveGlyphs false
```

No `Both` (`08`, `12`, `14`). DownwardPathline is a separate mode, not
simultaneous display with S1/S2. NearGroundOutflowPathline is a
separate mode, not simultaneous with D1 or S1/S2.

**Trail system must not import this enum.** Composition maps pedagogy
to handles:

```text
which seed array → createTracersFromSeeds(...)
trailEnabled     → construct TracerPathHistory and call it after steps
keepInactiveGlyphs → TracerScene observe option
```

`createTracersFromSeeds` stays role-agnostic (`08`). The recorder
stays role-agnostic. Pedagogy is an app wiring choice, analogous to
`IntegrationFrame`.

UI toggle remains later. A composition constant in `App.tsx` is
enough if a story view is ever commanded.

---

## 9. Reset, Pause, timeScale

Current loop (`02` §5, `TracerViewport`):

```text
simulationElapsed = simulationElapsedFromWall(wallDt, { paused, timeScale })
{ steps, accumulator } = consumeFixedTimesteps(acc, simulationElapsed, dt)
repeat steps times:
  simulation.step(dt)
  pathHistory?.recordAfterStep(particles)   // story mode only
syncFromParticles + optional syncFromPathHistory
render()   // every frame, including paused
```

### Pause

`paused` → `simulationElapsed = 0` → `steps = 0` → no
`recordAfterStep`. Render continues. History is unchanged. Identical
positions must not be appended because the renderer still syncs.

Resume does not catch up paused wall time (`02`). The first active
frame appends only as many points as that frame’s steps.

A leftover accumulator remainder is unfinished simulation time, not
a trail sample.

### timeScale

`1 | 5 | 10 | 20` multiplies **simulation elapsed**, never `dt`.
More steps per wall frame → more `recordAfterStep` calls. The path
does not get a different spatial sampling; it fills faster in wall
time.

### Reset — story mode

Orchestration, same place as today’s `handleReset`:

1. `resetTracersFromSeeds(simulation, storySeeds)` — copies, `age = 0`,
   `active = true`, `clock.time = 0`;
2. loop `accumulator = 0` (existing `resetEpoch`);
3. `pathHistory.clear()`;
4. `pathHistory.captureInitial(simulation.particles)` — first points
   are the reset positions;
5. do **not** recreate `TracerScene`; sync copies new glyph + empty
   polyline-with-seed;
6. preserve `paused` / `timeScale`;
7. do **not** mutate `DEMO_SCENARIO`.

Do **not** put trail `clear` inside `resetTracersFromSeeds`. That
helper stays seed/clock-only.

### Reset — current diagnostic mode

Unchanged (`02` / `08`): restore diagnostic trio, `clock.time = 0`.
Trail history is absent or empty and unused. Story seeds are not a
Reset source.

### Camera

Simulation Reset does not reset OrbitControls (`11`). Trail Reset
is part of simulation/session Reset, not a camera Reset. Future
Reset View stays a separate UI item.

---

## 10. Integrator and coordinates

The recorder sees **already integrated** world positions.

```text
live story frame = StormRelativeLaboratory
stored points    = those world coordinates
```

That laboratory frame *is* the storm-relative 3D path (`03`). Do
not convert post hoc. Do not store atmospheric `(eastward,
northward, vertical)` in the trail buffer. Do not draw a
ground-relative ghost trajectory beside it.

If the live integrator later changed, the architecture would not:
the same `recordAfterStep` copies whatever `Simulation.step` wrote.

---

## 11. Colors / visual language

Not a UX-design slice. Minimal lock-in only:

- each trail uses the **same color as that tracer’s glyph**;
- the sphere marker remains visible at the current end;
- no gradient, glow, fade, or width-along-path;
- diagnostic index cycle `[red, blue, green]` (`TracerScene`) is
  **not** a group language (`08` §8).

For a future **story-only** view of two tracers, reusing the first
two index colors is acceptable as a temporary. It does not decide
a story palette and does not apply those colors to diagnostic
probes. If both groups are ever shown together, diagnostic and
story need separate palettes or labels — that work is still
deferred.

---

## 12. Testing policy

No screenshot / WebGL beauty tests. No FPS tests.

Pure tests on the recorder (future implementation slice):

1. **Initial** — after `captureInitial`, each tracer has length 1
   equal to the copied seed position.
2. **Append after fixed step** — one `Simulation.step` + one
   `recordAfterStep` → length 2; position matches the particle.
3. **Copies, not aliases** — mutating `particle.position` afterwards
   does not change stored points; stored objects are not the
   particle’s position reference.
4. **Deterministic order** — points are chronological; index `0` is
   the initial capture.
5. **Pause** — `steps === 0` (or no `recordAfterStep`) → length
   unchanged.
6. **Reset** — `clear` + `captureInitial` after
   `resetTracersFromSeeds` → length 1 at seed; previous points gone.
7. **Independent tracers** — two histories; appending to one index
   does not affect the other.
8. **Stride** — `stride = k` appends on the k-th `recordAfterStep`
   after initial (DEMO uses `1`).
9. **No renderer FPS** — recorder module does not import `three`,
   `rAF`, or `TracerScene`.
10. **No particle mutation** — recording does not write `position`,
    `age`, or `active`.
11. **Inactive skip** — already `active === false` at the previous
    observation does not append.
12. **Terminal deactivation** — active at the previous observation
    and inactive now → append the accepted position once; later
    steps do not duplicate. Not inferred from `y = 0`.

Do not add a regression oracle of the form “S1 must reach 7044 m
on the trail.” Reachability stays `07` / `08`. Path-history tests
check wiring and copies, not basin membership.

Rendering-focused tests only if they stay fixture-level (e.g. scene
constructs `N` lines when trail-enabled, dispose does not leak
geometry) without a brittle WebGL pixel harness. Prefer none until
a trail primitive actually exists.

---

## 13. Renderer integration

`TracerScene` remains observe-only (`01`):

```text
rendering observes particles and path-history snapshots
rendering does not write Simulation
rendering does not own the sample times
```

Current sync:

```text
syncFromParticles(particles) → sphere positions
render()
```

Future, trail-enabled:

```text
syncFromParticles(particles)
syncFromPathHistory(pathHistory)  // or equivalent read-only view
render()
```

`syncFromPathHistory` copies into `Line` attributes. It must not
call `Simulation.step`, must not append history, and must not
sample `particle.position` as a substitute for the recorder (that
would reintroduce A on frames with `steps === 0`).

When trails are disabled (DiagnosticProbes), do not create
line objects, or create none and skip sync.

### Future files (implementation, later)

```text
src/simulation/TracerPathHistory.ts     // Three-free recorder; C
src/simulation/TracerPathHistory.test.ts
src/rendering/TracerScene.ts            // observe lines; no new owner
src/ui/tracer/TracerViewport.ts         // after each step, record;
                                        // Reset: clear + captureInitial
src/app/App.tsx                         // story wiring later, not now
```

No new `TracerTrailPrimitive` class unless `TracerScene` would
otherwise mix too many concerns. v1 can keep lines inside
`TracerScene`.

No `src/physics/` files. No `ScenarioConfig` fields for trail
length, color, or stride.

Dependency direction unchanged:

```text
simulation  ↛ rendering, ui, three
rendering   → observes particles + path-history snapshots
app / ui    → wires step → record → sync
```

---

## 14. Scope boundary

This SoT does not implement, and a later first implementation
slice still must not sneak in:

- live story mode as the default DEMO;
- `TracerPedagogy` UI;
- follow camera (`07` §10, `08` §8);
- altitude labels, arrows, streamlines;
- cloud / anvil / volume;
- downdraft, continuity, tilting/stretching;
- physics field/formula changes;
- RK2 as live integrator;
- S3;
- both-groups display;
- trail fade / glow / ribbons.

Allowed later, as separate commanded slices, in order §16.

---

## 15. Relationship to existing docs

- Story seeds / live StoryPathlines / trail architecture:
  `docs/architecture/08-story-seeds.md`
- Observe-only scene, fixed-step vs frame, no interpolation:
  `docs/rendering/01-tracer-scene.md`
- Pause / timeScale / Reset / accumulator:
  `docs/rendering/02-tracer-runtime-controls.md`
- Camera vs simulation Reset, glyph, no trails in the view fixture:
  `docs/rendering/11-deep-storm-tracer-view.md`
- Layering (“physics defines; rendering observes”; trajectories on
  the simulation layer):
  `docs/ARCHITECTURE.md`
- Numerical `dt`, no project-wide `DEFAULT_DT`:
  `docs/physics/03-numerical-integration-basics.md`
- Storm-relative laboratory world path:
  `docs/architecture/03-wind-tunnel-storm-relative-3d-semantics.md`

`08` remains the owner of canonical S1/S2 semantics and the story
claim. This document owns path-history architecture only.

---

## 16. Migration plan

Commanded later, one vertical slice at a time. Not this document.

1. **Path-history core/recorder** — done: `TracerPathHistory`, copies,
   stride default `1`, Reset/Pause tests, no Three, no live wiring.
2. **Rendering trail primitive** — done: `TracerScene` observes history
   as `THREE.Line` when `{ trails: true }`; live default still
   diagnostic, no lines constructed.
3. **StoryPathlines runtime wiring** — done: StoryPathlines is an
   explicit mode; default composition API remains
   `DiagnosticProbes`.
4. **UI later** — pedagogy toggle, if ever.
5. **DownwardPathline live switch** — done: live App later moved
   to NearGroundOutflowPathline (`14` slice 2); DownwardPathline
   remains explicit.
6. **NearGroundOutflowPathline live switch** — done: live App selects
   `NearGroundOutflowPathline`; StoryPathlines and DownwardPathline
   remain explicit.

Do not merge (1)+(3) “so there is something to look at” without
(2). Do not turn on story live view without trails (`08` §8).

---

## 17. Compact lock-in

```text
history owner:           TracerPathHistory recorder (option C);
                         not TracerParticle, not Simulation,
                         not TracerScene / rAF
sampling boundary:       after each completed Simulation.step
sampling stride:         1 (every step); DEMO must not thin
history lifetime:        full history until Reset
max points:              none (DEMO scale); no sliding window
reset semantics:         clear + captureInitial at seed positions;
                         diagnostic Reset unchanged / trails unused
lane lifecycle:          constructor sets initial count (0 allowed);
                         appendParticle captures birth, bypasses stride;
                         clear() keeps lanes; removeAllLanes() → 0
pause semantics:         no step → no append; render may continue
timeScale:               more steps → more points; not renderer sampling
representation:          THREE.Line + BufferGeometry; glyph stays
story-only policy:       trails on for StoryPathlines,
                         DownwardPathline, and
                         NearGroundOutflowPathline; DiagnosticProbes has
                         no trails; live App = NearGroundOutflowPathline
renderer ownership:      observe history; do not sample FPS;
                         do not write Simulation
memory estimate:         2 tracers × ~4000 steps ≈ 8k points;
                         ~0.5 MB CPU objects + ~0.1 MB float32 GPU;
                         every-step is cheap
coordinates:             world positions as integrated
                         (StormRelativeLaboratory); no GR ghost
pedagogy integration:    composition maps enum → seed array
                         + trailEnabled + keepInactiveGlyphs;
                         recorder and TracerScene do not
                         import TracerPedagogy; enum not in
                         ScenarioConfig
integrator:              unknown to recorder; copies after step
colors:                  trail = glyph color; no fade/glow;
                         index cycle is not a group language
production this slice:   live NearGroundOutflowPathline + recorder wiring;
                         StoryPathlines, DownwardPathline,
                         and DiagnosticProbes still explicit
```

Live App enables trails via `TracerPedagogy.NearGroundOutflowPathline`.
StoryPathlines and DownwardPathline also enable trails when
selected. Diagnostic composition does not
(`docs/architecture/12-downward-ground-impact-pedagogy.md`,
`docs/architecture/14-near-ground-outflow-pedagogy.md`).
