# Story Seeds

**Status:** research SoT. Production code was not changed.
Live frame: `StormRelativeLaboratory`.
Live integrator: Euler, `dt = 0.1` s.
Live fixture: `DEMO_SCENARIO` after `06` + `13`.

Predecessor:
`docs/architecture/07-story-reachability-audit-v2.md` — verdict **A**:
a robust lower→upper basin exists. Diagnostic probes stay diagnostic.
Candidates S1–S3 were recorded there, not installed.

This document answers:

    Which minimal canonical story-seed set should a later implementation
    install, how is it separated from the diagnostic trio, and what must
    be true of config, runtime, copy, integrator, and renderer before
    those seeds are shown?

It does **not** retune physics, add seeds to `DEMO_SCENARIO`, add UI,
add trails, or switch the live integrator.

Story threshold: `04` §2, unchanged.

---

## 1. Verdict

**Two complementary story seeds. Not one. Not three.**

Canonical set (not installed):

```text
S1  (0, 1000, 4000)    r/σ = 1.0    azimuth 90° south    y0 = 1000
S2  (0, 1000, 6000)    r/σ = 1.5    azimuth 90° south    y0 = 1000
```

S1 is the canonical interior pathline. S2 is the same south bearing at
larger radius, so the only controlled difference is `r/σ`. Together they
show that the story is a **radial-approach family**, not a single lucky
point.

S3 `(0, 750, 3000)` is a valid interior IC and is **not** in the
canonical set. It is the same class as S1 with a lower start. That is
not a new pedagogical representative.

Diagnostic seeds **axis / east / north** keep their current coordinates
and remain a separate group. They are not replaced, not merged into an
unlabeled `tracerSeeds` list, and not shown as a six-point cloud with
the story pair.

Live DEMO, until a later rendering/mode slice: **diagnostic only**.

---

## 2. Candidate record (Euler `dt = 0.1`, live composite)

Azimuth convention as `06`/`07`: `0° = +X` east, `90° = +Z` south.
All three start upstream of `V_sr` at the seed layer.

| | S1 | S2 | S3 |
| --- | --- | --- | --- |
| IC m | `(0, 1000, 4000)` | `(0, 1000, 6000)` | `(0, 750, 3000)` |
| `r0/σ` | 1.00 | 1.50 | 0.75 |
| azimuth | 90° south | 90° south | 90° south |
| `y0` m | 1000 | 1000 | 750 |
| `max y` m | 7044 | 7000 | 7001 |
| `min r` m | 917 | 1621 | 310 |
| `t` in `r<σ` s | 275 | 224 | 283 |
| `t` in `r<2σ` s | 397 | 444 | 409 |
| deep core entry | `t=129 s`, then 146 s occupancy | `t=176 s`, then 146 s | `t=142 s`, then 141 s |
| `r` at `y=4000` | 1004 | 1621 | 1063 |
| outflow entry | `t=200 s`, then 197 s occupancy | `t=251 s`, then 193 s | `t=214 s`, then 195 s |
| `r` at `y=5000` | 1732 (`0.43σ`) | 2019 (`0.50σ`) | 1984 (`0.50σ`) |
| `04` story | yes | yes | yes |
| `07` neighbourhood `Δ=0.05σ` | 25/25 | same south sector as 25/25 SSE | 25/25 |

Selection is **not** by spiral appearance. All three letter-pass. The
question is which *roles* are distinct.

---

## 3. How many seeds

### One — rejected as the canonical *set*

S1 alone is enough to *exhibit* the `04` path. It is the right
single IC if a later slice is forced to one particle.

It is the wrong canonical **set**. A lone south `r=σ` seed will be
read as “the” parcel. `07` showed a connected basin in `r/σ` and
azimuth. The second pedagogical fact is that an upstream approach
from farther out still completes the same ordered stages.

### Two — accepted

S1 + S2 isolate **one** variable: normalized start radius, same
height, same upstream bearing.

| Seed | Role |
| --- | --- |
| S1 | Canonical interior story. Starts on the inflow Gaussian peak radius (`r=σ`). Radius falls into the core, then outflow at `r≈0.43σ`. |
| S2 | Complementary farther-upstream approach. Starts at `r=1.5σ`. Longer inflow-layer approach (`coreDeep` 47 s later than S1); still interior outflow entry at `r≈0.50σ`. |

That is new information relative to the diagnostic trio:

- axis already stories, but inflow/rotation are zero on `r=0`;
- east is a basin-edge graze;
- north is the downstream failure.

S1 is the first seed whose *job* is the lower→core→outflow sequence
with inflow actually reducing radius. S2 shows the sequence is not
tied to starting already at `r=σ`.

Two points are not a particle cloud.

### Three — rejected

S3 changes `y0` and `r/σ` together. `07` ranked `y0` in `[500, 1500]`
as the weakest sensitivity. Occupancy times and outflow entry radius
are the same order as S1. Visually it is another south glyph, 1 km
closer than S1 at Reset.

A third south seed would pad the scene without a third *class*.
Do not install it. Keep it as a recorded interior spare, not as a
DEMO occupant.

Do not add a downstream “story control.” North already is that
control, as a diagnostic.

---

## 4. Diagnostic vs story separation

Two groups, two jobs:

| Group | Occupants | Job | Must not |
| --- | --- | --- | --- |
| Diagnostic | axis, east, north at `y=1000`, `r=0` / `0.6σ` | Mechanism contrast at the seed layer: axis = `V_sr`+updraft; east = cyclonic flank; north = downstream | Be sold as a life cycle; have coordinates moved to pass `04` |
| Story | S1, S2 | Prescribed SR pathline through lower inflow, deep updraft region, upper outflow | Sit on the basin edge; replace diagnostics; coincide with a diagnostic |

Live diagnostic coordinates stay:

```text
(0, 1000, 0)          axis
(2400, 1000, 0)       east,  r = 0.6σ
(0, 1000, −2400)      north, r = 0.6σ
```

Axis letter-passing `04` does **not** make it a story seed. Its
inflow is identically zero. East’s 2.9 s outflow graze does **not**
make it a story seed.

### Config contract (future implementation)

Do **not** concatenate both groups into one unlabeled
`simulation.tracerSeeds`. After that, a seed has no role except
array index and a recycled color.

Proposed `ScenarioConfig.simulation` shape:

```text
timestep: number
diagnosticSeeds: ScenarioTracerSeed[]   // pedagogical probes
storySeeds: ScenarioTracerSeed[]        // lower→upper pathlines
```

`ScenarioTracerSeed` stays `{ x, y, z }` in world metres. Role is
**which array**, not a per-seed tag soup.

Rejected alternatives:

| Option | Why not |
| --- | --- |
| Keep one `tracerSeeds`, append S1/S2 | Roles collapse; Reset, colors, and tests cannot name a group |
| Tagged `{ x, y, z, role }` in one array | Still one particle list; live-both becomes the default accident; filtering is a hidden runtime |
| Story-only fixture file outside ScenarioConfig | Second parameter source. `01` already forbids a parallel seed owner |
| `particleCount` / preset registry | Out of `01` v1 scope |

`createTracersFromSeeds` stays role-agnostic: it copies positions.
App / composition chooses **which array** to pass, the same way
`IntegrationFrame` chooses the environmental operand.

Migration of the current field: `tracerSeeds` **becomes**
`diagnosticSeeds` with the same three coordinates. Empty
`storySeeds` is allowed. Empty `diagnosticSeeds` is allowed only
where empty `tracerSeeds` is already allowed (hodograph-only).
DEMO must populate both arrays once story seeds are installed;
live *display* is a separate choice (§5).

Validation stays at the scenario boundary: each coordinate finite.
No story-threshold check in the DTO factory. Reachability is a
research fact about this DEMO, not a config invariant.

Integrator id stays out of ScenarioConfig (`01` §8).

---

## 5. Runtime / UI policy

No UI in the future seed-install slice. No mode toggle, no checkbox,
no second tracer panel.

Future DEMO display policy:

**Default live view remains diagnostic-only.**

Reason: the current three colors (red / blue / green by index) and
glyph-only renderer cannot carry two groups at once. Five or six
moving spheres without path history will be read as “more particles,”
not as “probes vs pathlines.”

| Presentation | Decision |
| --- | --- |
| Diagnostic only | **Live default.** Current DEMO contract. |
| Story only | Allowed later as an app-composition choice, analogous to `IntegrationFrame`. Not the default. |
| Both simultaneously | **Deferred.** Needs group-visual language (palette / labels) and preferably trails. |
| UI to switch | Later. Until then, a composition constant in `App.tsx` is enough if a story view is ever commanded. |

Proposed future composition enum (not ScenarioConfig, not a feature
flag on physics):

```text
TracerPedagogy.DiagnosticProbes     // default; current live
TracerPedagogy.StoryPathlines       // S1+S2
```

Not a third `Both` value until rendering can tell the groups apart.

Reset continues to restore whatever seed list the active pedagogy
passed into `Simulation`. It must not write story coordinates into
the diagnostic array or the reverse.

`timeScale` / `paused` stay session UI (`02`). They apply to whichever
set is live. They are not a substitute for trails.

---

## 6. Story claim

Allowed, and no broader:

```text
prescribed storm-relative pathline through lower inflow,
deep updraft region, and upper outflow region
```

That is a statement about one tracer in this laboratory field.
It is the `04` sequence, not a storm.

Forbidden in UI copy, panel titles, comments, and docs that ship
with the seeds:

- same-air mass circulation
- mesocyclone capture
- realistic parcel path
- full supercell circulation
- “the air that went up came out here” (continuity is not closed)
- life cycle / cell cycle / recycling

Panel subtitle, if a story view is later shown, should name the
frame and the sequence, not a supercell.

---

## 7. Integrator robustness

Selection used live Euler `dt = 0.1`. Diagnostic comparison, same
ICs, same live field, no production switch:

| Seed | Integrator | story | `max y` | `min r` | coreDeep `t` | outflow `t` |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Euler 0.1 | yes | 7043.5 | 917.0 | 129.0 | 200.4 |
| S1 | Euler 0.01 | yes | 7042.8 | 917.5 | 128.9 | 200.3 |
| S1 | RK2 0.1 | yes | 7042.7 | 917.6 | 128.9 | 200.4 |
| S1 | RK2 0.05 | yes | 7042.7 | 917.6 | 128.9 | 200.4 |
| S2 | Euler 0.1 | yes | 6999.5 | 1621.3 | 175.7 | 251.2 |
| S2 | Euler 0.01 | yes | 6998.7 | 1622.0 | 175.6 | 251.1 |
| S2 | RK2 0.1 | yes | 6998.6 | 1622.1 | 175.6 | 251.1 |
| S3 | Euler 0.1 | yes | 7000.9 | 310.0 | 141.9 | 213.5 |
| S3 | RK2 0.1 | yes | 7000.1 | 310.3 | 141.8 | 213.4 |

Qualitative success does not depend on Euler `dt = 0.1`.
`max y` and `min r` move by `< 1 m`. Occupancy times agree to
`0.2 s`. The path is not an integrator artifact.

**Do not** switch the live DEMO to RK2 or shrink `dt` in the
implementation slice. Euler `0.1` remains the laboratory integrator
(`01`, `02`, `03` numerical contract).

---

## 8. Renderer implications

Trails are **not** added here and must not be added “while installing
seeds.”

Glyph-only, current contract (`11` / `13`):

```text
sphere radius = 150 m
colors = [red, blue, green] cycling by particle index
no path history
camera (12000, 6000, 12000) → (0, 4000, 0)
```

At Reset, S1 and S2 are 2000 m apart on +Z (`~13` glyph diameters).
That start contrast is readable. After ~200 s both are in the column
and then leave with `V_sr`; without history the ordered stages are
not reconstructable. Diagnostic probes can teach at `t ≈ 0` (axis vs
east vs north). Story teaching is a **200–400 s sequence**.

**Trails (or equivalent path history) are a rendering prerequisite
before story seeds become the live teaching view.**

Until that slice:

- storing S1/S2 in config is allowed;
- showing them as the default DEMO is not;
- a composition-switched story view would still be a weak exhibit
  (two rising dots) unless copy tells the viewer to watch from Reset.

A follow-camera is a different, still-forbidden story (`07` §10).
Glyph radius does not need to change for two extra seeds. Color
cycling by index is **not** a group language: if both groups are
ever shown together, diagnostic and story need separate palettes or
labels. That is rendering work, not a seed-install extra.

---

## 9. Future implementation slice (not this slice)

When commanded, a vertical slice should:

1. Split `ScenarioConfig.simulation` as in §4. Migrate DEMO diagnostic
   coordinates off `tracerSeeds`. Install S1 and S2 as `storySeeds`.
2. Keep Euler `dt = 0.1`, `StormRelativeLaboratory`, physics numbers,
   diagnostic coordinates, camera/grid/glyph numbers.
3. Compose particles from `diagnosticSeeds` by default.
4. Optionally add `TracerPedagogy` at the app composition boundary,
   default `DiagnosticProbes`. Do not add UI.
5. Freeze S1/S2 coordinates and the diagnostic trio in tests.
6. Update `01` (config shape), `02` (Reset source), `08` rendering
   seed-layout notes, and DEMO comments. New rendering doc only if
   a story view is actually shown.
7. Use the §6 claim. Do not add trails, follow-camera, downdraft,
   continuity, Bunkers, or a particle cloud.

Likely files (implementation, later):

```text
docs/architecture/01-scenario-config.md
docs/architecture/08-story-seeds.md          // this file; mark implemented
docs/rendering/02-tracer-runtime-controls.md
docs/rendering/08-composite-lower-radial-inflow-demo.md
src/scenario/ScenarioConfig.ts
src/scenario/DEMO_SCENARIO.ts
src/scenario/DEMO_SCENARIO.test.ts
src/scenario/createEnvironmentalWindProfile.ts   // finite-seed checks
src/app/composeDemoTracerSimulation.ts
src/app/App.tsx                                  // which array; default diagnostic
src/simulation/resetTracersFromSeeds.ts          // active list only
tests that snapshot tracerSeeds
```

Not in that slice: `TracerScene` trails, new colors-as-physics, UI
mode controls, RK2 as live integrator, S3.

---

## 10. Compact lock-in

```text
verdict:                 two story seeds (S1+S2); not 1, not 3
S1:                      (0, 1000, 4000)  r/σ=1.0  south  y=1000
                         canonical interior pathline
S2:                      (0, 1000, 6000)  r/σ=1.5  south  y=1000
                         complementary farther-upstream approach
S3:                      valid interior spare; not canonical
                         (same class as S1, lower y0)
diagnostic trio:         unchanged coordinates; separate group
config contract:         diagnosticSeeds + storySeeds
                         (replace unlabeled tracerSeeds)
                         role = which array
live display:            diagnostic only (default)
both-at-once:            deferred (no group language, no trails)
story claim:             prescribed SR pathline through lower inflow,
                         deep updraft region, and upper outflow region
integrator:              Euler 0.1 live; RK2 / smaller dt agree
                         (Δmax y, Δmin r < 1 m); do not switch
trails:                  rendering prerequisite before story is
                         the live teaching view; not this install
production this slice:   none
```

Production code was not changed.
