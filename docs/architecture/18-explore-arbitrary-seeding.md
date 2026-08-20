# Explore Arbitrary-Seeding Architecture

**Status:** architecture / product SoT. Implementation Slices 1–4
are complete. Slice 4 is the first browser-visible Explore point
release. This is not the final Explore/Guided product shell.
Shared Inspector is live (`19`). No line/plane/volume tools.
Guided catalog UI is live (`20` Slice 3); this document remains
the Explore seeding SoT. Successor Guided runtime SoT: `20`.
Current whole-product direction checkpoint:
`docs/architecture/21-whole-product-direction-checkpoint.md`.
Perceptual airflow exploration (`22`) must not replace point
release; probes stay unlabeled scientific tracers.
Current perceptual-loop / physics-resumption status:
`docs/architecture/24-perceptual-exploration-checkpoint.md`.
Tilting / stretching direction revalidation:
`docs/architecture/25-tilting-stretching-direction-revalidation.md`.

Slice 2 runtime owner: `ExploreTracerSession`
(`src/explore/ExploreTracerSession.ts`).
Creation-time helper: `assertAtmosphericTracerSeed` /
`copyAtmosphericTracerSeed`
(`src/simulation/assertAtmosphericTracerSeed.ts`).
Slice 3 placement: `ExplorePointReleaseTool`,
`intersectRayWithGroundReferencePlane`,
`shouldAcceptPlacementPick`,
`createReleasePreviewMarker` / `TracerScene.syncReleasePreview`.
Slice 4 browser wiring: temporary App Explore | Guided entry
(not `TracerPedagogy` navigation), `createExploreLab`,
`ExplorePointReleaseOrchestration`, TracerViewport pointer→ray,
`ExplorePointReleaseControls`.

Predecessors:

- `docs/architecture/16-explore-guided-interaction-architecture.md`
- `docs/architecture/17-guided-experiment-catalog.md`

This document answers:

    How does a user create arbitrary exploratory tracers in the same
    laboratory without turning ScenarioConfig into mutable UI state,
    contaminating curated Guided ICs, or making physics/runtime
    primitives aware of Explore?

It does **not** implement seeding, a store, IDs, inspector,
persistence, or performance work.

Live App opens on Guided `inflow-to-upper-outflow` (`20`).
NG1 remains one catalog experiment, not the product default.
Explore is an explicit empty-session entry. The Guided default
does not define Explore seeding.

Authoritative:

- `docs/CONCEPT.md` §3, §7–§8, §13
- `docs/ARCHITECTURE.md` §13–§16, §23–§24, §26, §36
- `docs/architecture/01-scenario-config.md`
- `docs/architecture/08-story-seeds.md`
- `docs/architecture/11-ground-atmospheric-domain-policy.md`
- `docs/rendering/01-tracer-scene.md`
- `docs/rendering/02-tracer-runtime-controls.md`
- `docs/rendering/14-tracer-path-history.md`

---

## 1. Verdict

**B. Dedicated Explore runtime state, above ScenarioConfig and
beside Simulation.**

The tested hypothesis is **confirmed**:

```text
ScenarioConfig describes canonical scenario / fixtures.
Arbitrary user releases are runtime interaction state.
They must not be written back into ScenarioConfig.
```

Minimum first Explore capability: **A. Point release only.**

Canonical first coordinate pick:

```text
(x, z) from picking the ground-reference XZ plane
y from an explicit altitude control
```

Creation-time atmospheric seed policy is now **earned**:

```text
finite coordinates
y ≥ 0     allowed   (closed atmospheric domain)
y < 0     rejected at creation
```

Field sampling stays unbounded. Ground logic stays out of
`VelocityField` and integrators.

Late birth at **current `clock.time`** is required (running or
paused). Reset-to-t=0 is a different operation (cohort replay).

`TracerPathHistory` is **reusable with extension**. Fixed
`tracerCount` is the first real architectural constraint for
Explore. Do not preserve it from sunk cost. Do not replace the
recorder’s owner.

Stable tracer IDs: **deferred** until selection, deletion, or
compaction. First slice is append-only + clear-all.

Physics remains paused.

---

## 2. Exploratory tracer semantics

```text
curated tracer
  canonical / researched IC
  belongs to a Guided teaching contract
  may carry an allowed claim

exploratory tracer
  user-selected IC
  no pre-certified story outcome
  still a passive tracer of the same VelocityField
```

An exploratory tracer **must not** inherit, from resemblance
alone:

```text
inflow path
updraft path
downdraft path
near-ground outflow path
circulation
cold pool
S1 / S2 / D1 / NG1 identity
```

It is the same physical object as a Guided tracer: a massless
point integrated through `V` (`ARCHITECTURE` §13, parcel `01`).
The difference is **ownership and claim**, not a second particle
type.

### 2.1 Reuse of lower layers

Reuse **unchanged in role** (role-agnostic):

| Piece | Explore use |
| --- | --- |
| `TracerParticle` | Same `{ position, age, active }` |
| `Simulation` | Same step / clock / domain hook |
| Integrator | Unchanged |
| `AtmosphericTracerDomain` | Crossing policy after integration, unchanged |
| `createTracersFromSeeds` | Copy helper: `{x,y,z}` → particle |
| `resetTracersFromSeeds` | Cohort restore when counts match |
| `TracerPathHistory` | Same observe-after-step owner; **needs a lane-append extension** (`§10`) |
| `TracerScene` glyphs / lines | Observe-only; **needs a slot-append extension** (`§11`) |

Do **not** add `role: "explore"` on `TracerParticle`.
Do **not** import Explore into physics.

---

## 3. Ownership

### 3.1 Where user-created seeds belong

| Candidate | Verdict |
| --- | --- |
| A. Mutate / copy `ScenarioConfig.simulation` | **Rejected.** Config is a DTO for canonical fixtures (`01`). User clicks are not DEMO occupancy. Guided arrays must not gain NG1-shaped user points. |
| **B. Dedicated Explore runtime state** | **Canonical.** Session / interaction layer above config, beside `Simulation`. |
| C. `Simulation` owns mutable seeding directly | **Rejected as seed owner.** Simulation owns the live particle list and integration. Release specification, altitude tool, and seed-domain checks are interaction. Simulation may later **accept** a new particle (`§11`). |
| D. Other | Not needed. |

Hypothesis confirmed. `01` already deferred `paused`, `timeScale`,
`particleCount`, and camera as not-scenario. Arbitrary releases
join that list.

### 3.2 Ownership map

| Concern | Owner |
| --- | --- |
| Canonical Guided ICs | `ScenarioConfig` arrays (unchanged) |
| Current exploratory **seeds** (release positions) | Explore runtime state |
| Current exploratory **particles** | `Simulation.particles` (live) |
| Histories | `TracerPathHistory` (observer; extended) |
| Selection | Interaction (later; inspector SoT) |
| Release-tool state (altitude, pending pick) | Explore interaction session |
| Preview marker | Rendering / interaction; **not** a particle (`§15`) |
| Model (`V`, frame, domain policy, occupancy) | Unchanged |

Do not implement a store in this slice. Conceptual shape is
enough:

```text
ExploreSession
  seeds: { x, y, z }[]     // release positions, not ScenarioConfig
  // particles live on Simulation
  // tool: pending altitude, etc.
```

Empty Explore (zero tracers) is legal. It is the honest default
when entering Explore without a transfer from Guided.

---

## 4. Seed vs release

```text
seed      one initial tracer position {x, y, z}
release   a user action / specification that may produce one
          or many seeds
```

Not every action is one click → one seed.

| Family (CONCEPT) | Status | Notes |
| --- | --- | --- |
| **Point** | **First-class now** | One seed. Minimum Explore (`§5`). |
| Line | Future specification | Expands to many point seeds. Needs many-parcel + history/scene growth. |
| Plane | Future specification | Same. Strong pedagogical tool later; not the first proof. |
| Volume | Future specification | Same; denser; louder false “mass” reading. |
| Continuous emitter | Future possibility | Time-dependent **birth**, not a static spec. Looks like a source. Dangerous with YELLOW `∇ · V`. Not first-class now. |

Do not design a TypeScript release-union. Point is the only
earned primitive. Line/plane/volume, when earned, should compile
to point seeds and reuse the same birth path.

---

## 5. Minimum first Explore capability

**A. Point release only.**

| Candidate | Why not first |
| --- | --- |
| **A. Point** | One IC, one particle, one history lane, one glyph. Proves ownership, domain, late birth, no-claim. |
| B. Point + line | Line is N points. Pulls many-parcel renderer/history into the first slice. |
| C. Point + plane | Same, denser. Spreading-cartoon risk before inspector exists. |
| D. Other | Numeric-only release is unambiguous but is not the CONCEPT laboratory gesture. Companion later, not the proof. |

Prefer a thin end-to-end point path over generic release
machinery.

---

## 6. Coordinate acquisition

A 2D pointer does not specify a 3D atmospheric point. Do not
fake a click into empty space.

| Method | Unambiguous? | First slice? |
| --- | --- | --- |
| Ray vs empty 3D | **No** | Forbidden |
| **XZ pick on the ground-reference plane + explicit altitude** | **Yes:** `(x, z)` from plane, `y` from control | **Canonical** |
| Horizontal helper plane at selected `y` | Yes | Later equivalent; first slice can pick the existing `y = 0` grid and set `y` separately |
| Vertical slice | Yes in that plane | Later (chimney teaching) |
| Numeric `x, y, z` | Yes | Companion, not the canonical first gesture |
| Ray vs tracer / volume | Depends | Later |

Canonical first interaction:

```text
1. User sets altitude y  (explicit; not inferred from the camera ray)
2. User picks a point on the ground-reference XZ plane
3. Seed = (x_pick, y_altitude, z_pick)
```

The existing `GridHelper` at `y = 0` is already that plane
(`11` §11). The pick is **interaction with a named datum**, not
terrain collision.

Altitude is session tool state. A UI may *default* it to
`1000 m` (diagnostic / story layer) as a convenience. That is
not a physics law and not a ScenarioConfig field.

Numeric entry may duplicate the same triple. It must not be the
only way, and it must obey the same domain policy (`§7`).

---

## 7. Creation-time domain policy

Runtime crossing (`11` §6) governs **integration**. Explore adds
**creation**.

`11` §5 / §6 left “seed already at `y < 0`” as a gap: not a
crossing, no snap. Guided DEMO seeds are all `y > 0`. Explore
is where users can actually type or pick a below-ground point.

**Explore is the point at which a reusable atmospheric
seed-domain contract becomes earned.**

```text
reject if any component is non-finite
reject if y < 0
allow  y = 0     // closed atmospheric domain
allow  y > 0
horizontal x, z: any finite  (no pad / frustum clip as physics)
```

| Seed `y` | Policy | Why |
| --- | --- | --- |
| `y < 0` | **Reject before `Simulation` sees it** | Not atmospheric occupancy (`11` B). Do not start an underground inflow exhibit by accident (`17` plateau). |
| `y = 0` | **Allow** | Closed domain. If `Vy < 0`, the first step deactivates (`11` §6 start-on-floor). Honest laboratory, not a bug. Do not special-case NG1’s research bar. |
| `y > 0` | Allow | Normal. |

Keep:

- field sampling unbounded (G17);
- no ground knowledge in `VelocityField` / integrator;
- crossing policy unchanged for existing particles.

Owner of the check: Explore runtime (and any later shared helper
such as `assertAtmosphericTracerSeed`). Not the compositor. Not
Guided array factories in this slice (DEMO ICs already valid).

Signed zero: treat as `y = 0` (in-domain), write canonical `+0`.

---

## 8. Birth while the laboratory is running

CONCEPT: release into a running investigation. Current stack is
Eulerian-**steady**, but architecture must not assume `V` ignores
`time` forever (`02` G16 revisit: translating / unsteady fields).

```text
a newly released tracer is born at current simulation clock.time
age = 0 at birth
it does not require Reset or t = 0
paused vs running: same birth rule
  paused → glyph sits until the next step
```

For today’s steady `V`, the geometric path from `(x, t_now)`
equals the path from `(x, t = 0)`. Clock labels and trail start
differ. For a future `V(x,t)`, birth at `t_now` is the only
honest rule. Do **not** force Reset in order to make the current
recorder’s fixed count easier.

Implications:

| Concern | Rule |
| --- | --- |
| Particle arrays | Append; do not rebuild the Model | 
| History | New lane; `captureInitial` **that** tracer at birth (`§10`) |
| Birth time | `clock.time` at release. Afterward `birthTime = clock.time - age` while the clock has not been reset since birth |
| Steady fields | Path shape independent of birth time; still label time honestly |
| Unsteady fields later | Same birth API; different path — do not bake “replay from t=0 is the same path” into the release primitive |
| Reset | Separate (`§9`): cohort replay from ICs at `t = 0` |

Adding at `t > 0` is the Explore proof. A “place then Start”
batch is optional sugar, not the architecture.

---

## 9. Reset / Clear lifecycle

Guided Reset (`02`): restore **canonical** seeds, `t = 0`,
`age = 0`, `active = true`, history `clear` + `captureInitial`.
Equal counts. Does not recreate `TracerScene`.

Explore needs **two** session operations, not five buttons:

```text
Reset
  clock.time = 0
  each current exploratory tracer → its stored release seed
  age = 0, active = true
  history clear + captureInitial
  meaning: replay this set as a simultaneous cohort from t = 0

Clear
  remove all exploratory tracers (and their histories / glyphs)
  clock.time unchanged
  meaning: empty the laboratory occupancy; atmosphere continues
```

| Operation | Clock | Tracers |
| --- | --- | --- |
| Reset | `0` | Restore Explore **runtime** seeds (not ScenarioConfig) |
| Clear | unchanged | Count → 0 |
| Pause / timeScale | unchanged | Unchanged (`02`) |

Slice 4 Reset also **clears the pending preview**
(`tool.cancelPending` + hide marker). Altitude and
`placementEnabled` stay. Camera stays. Clear likewise hides
preview. Preview is not a particle, history lane, or tracer slot.

**Reset is not a replay of staggered births.** Late-born tracers
are rewound to their ICs **together** at `t = 0`. For steady `V`
that is the pathline from those ICs. For future unsteady `V` it
is a new experiment; copy can say so later. Do not invent
“Restore staggered schedule” now.

`resetTracersFromSeeds` stays a **cohort helper** (counts must
match). Explore Reset may call it against the runtime seed list.
Clear is **not** that helper (count changes). Guided Reset must
not start reading Explore session seeds.

Do not require a separate “Clear trails” button in v1. Reset and
Clear already drop history. A later trail-only clear is cosmetic.

---

## 10. History strategy

Current `TracerPathHistory`:

```text
construct(tracerCount)
assert particles.length === tracerCount on every capture/record
index-based lanes
full history until clear
global stepsSinceCapture
became-inactive appends once
```

`TracerViewport` records after each `simulation.step`. Adding a
particle without a new lane **throws**.

| Classification | Verdict |
| --- | --- |
| Reusable unchanged | **No.** Fixed count is incompatible with late birth. |
| **Reusable with extension** | **Yes.** Owner (observer after step, Three-free, not on `TracerParticle`) remains right (`14` Option C). |
| Eventually replace | Only if selection/deletion needs an ID map; not required to *start* Explore. |

**Fixed index/count is the first real architectural constraint.**
A first Explore that only rebuilds a whole cohort at `t = 0`
would dodge it and would **fail** `§8`. Do not ship that dodge as
the architecture.

Required extension (specify, do not implement here):

```text
append a lane when a tracer is born
captureInitial for that lane only (seed point at birth)
recordAfterStep continues over the new length
Clear / shrink-to-zero must be allowed
global stride counter may stay  (DEMO stride = 1)
```

Preallocated empty slots (`particleCount = 32` in config) are
**rejected** as architecture: they put Explore capacity on
ScenarioConfig (`01` deferred `particleCount`) and hide birth.

Renderer trails: one `THREE.Line` per lane today. Same append
requirement (`§11`). Sampling policy (stride 1, full history,
terminal inactive once) **unchanged**.

---

## 11. Particle / cohort strategy

`Simulation` already holds a mutable `particles` array and steps
whatever is in it. It does not allocate glyphs or history.
Constructor takes a cohort. `resetTracersFromSeeds` assumes a
**fixed-length** cohort.

Explore should eventually:

```text
addParticle / addParticles     // Explore birth
clearParticles                 // Explore Clear
replace cohort                 // Guided enter / Guided Reset
```

Do not add those methods in this slice.

Boundary:

- **Simulation** owns live tracer state and may accept new
  particles (future API).
- **Explore runtime** owns release positions and tool state;
  it creates `{x,y,z}` then asks Simulation (or today’s array
  push **plus** history/scene append — orchestration).
- **External silent push** without extending history/scene is
  a footgun (`assertParticleCount`, `TracerScene` mesh count).

`TracerScene` is constructed with `tracerCount` and never grows
meshes. `syncFromParticles` can hide extras, not add. Recreating
the scene on every release would reset OrbitControls (`02`:
Reset must not recreate the scene). **Scene needs append/remove
observe slots**, same as history.

Guided stays replace-cohort. Explore stays append + clear.

---

## 12. Identity strategy

Array index is how Guided, history, and scene work today.

| Candidate | Verdict |
| --- | --- |
| A. Index enough for first Explore slice | True **if** append-only + clear-all (no mid-list delete, no compact). |
| B. Stable ID required *before* arbitrary seeding | **No.** Overbuild. |
| **C. ID deferred until selection / deletion / compaction** | **Canonical timing.** |

First Explore slice: append-only indices are stable. Inspector
select, Follow, delete-one, or compacting inactive particles
**earn** a stable runtime id. Do not invent UUIDs now.

When IDs land, history/scene should key by id, not by shifting
index. That is why C is recorded before implementation paints
index into UI selection state.

Inspector compatibility (`§18`): birth time, age, position do
not require IDs. Selection that survives Clear-of-others does.

---

## 13. Explore trail policy

Guided trails carry a **teaching** path. Explore trails are
**observational**.

```text
default:     trails on
scope:       global for v1 (all exploratory tracers)
history:     full, until Reset or Clear
per-tracer:  later
off toggle:  later; wandering glyphs without trails are a weaker lab
```

An exploratory trail shows where **this numerical tracer** has
gone. It does not certify a meteorological story. Copy and
inspector must not treat a rising user trail as “Inflow to upper
outflow.”

`keepInactiveGlyphs`: Explore default **false** (hide when
inactive). D1’s keep-visible is Guided presentation, not a
domain law. A user parcel that exits at `y = 0` leaves a trail
end on the plane; a resting sphere would read as deposition
(`13` checkpoint §3.1).

---

## 14. Many-parcel scaling

No new benchmarks. Order-of-magnitude only.

| N | Physics (CPU sample + Euler) | JS particles | History copies | Mesh + Line |
| --- | --- | --- | --- | --- |
| 1–10 | Trivial | Trivial | Fine (Guided scale) | Fine |
| ~100 | Fine at DEMO `dt` | Fine | Full history can be tens of MB on long runs | Likely OK |
| ~500–1000 | Still likely OK | Fine | Memory + per-frame line uploads: **unknown until measured** | Palette / clutter, not physics |

Likely costs: composite `sample` × N × steps/frame; `Vec3` copies
per stride-1 history; `BufferGeometry` updates per line;
`TRACER_COLORS` length 3 (visual, not a blocker); React churn
**if** each birth rebuilds the React tree / scene.

| Status | Item |
| --- | --- |
| Architectural blocker **now** | None for point release |
| Optimization later | Instancing, trail cap/decimation, GPU |
| Unknown until measurement | Comfortable N for full-history lines |

Do not implement InstancedMesh, GPU particles, workers, ring
buffers, or decimation. Do not put `particleCount` on
ScenarioConfig.

Point release grows N slowly. Plane/volume are when this table
starts to matter.

---

## 15. Release-marker semantics

Three distinct visuals:

```text
preview / pending seed   where a tracer WILL be born
                         not a TracerParticle
                         not domain-crossing
                         not D1 terminal glyph

live glyph               tracer after release
                         observe particle.position

trail                    history of that tracer
```

Selected tracer (later) is a **highlight of a live glyph**, not a
fourth physics object.

Do not reuse `keepInactiveGlyphs` for preview. Preview is
interaction scaffolding; if the user never confirms, no particle
exists.

Do not design styling.

---

## 16. Guided ↔ Explore seeding reuse

Hypothesis **confirmed**:

```text
shared:     {x,y,z} → TracerParticle
            createTracersFromSeeds
            resetTracersFromSeeds (fixed cohort)
            Simulation.step, domain, integrator
            path-history owner (after extension)
            observe-only scene (after extension)

Explore:    release specification
            altitude + XZ pick
            runtime seed list
            late birth

Guided:     catalog / ScenarioConfig ICs
            isolation, claims, glyph policy
```

Guided experiments must **not** call a mouse-release API.
Explore must **not** duplicate particle construction with a
second physics type.

Entering Guided **overwrites** exploratory tracers (`17` §13).
The Explore session seed list is discarded or parked in session
state; it is not merged with `storySeeds`.

---

## 17. Guided → Explore transition

`17` §13 left this open. With ownership locked:

| Option | Meaning | Verdict |
| --- | --- | --- |
| **A. Continue from current Guided runtime state** | Positions (and clock) become unlabeled exploratory tracers; claims stripped | **Canonical leave-Guided** |
| B. Initialize Explore with that experiment’s curated ICs | Fresh unlabeled cohort at canonical ICs, `t = 0` | **Distinct catalog action**, not the same as A |
| C. No such transition | — | Rejected. CONCEPT: Guided motivates Explore. |
| D. Deferred | Implementation | **Code deferred.** Semantics are A / B above. |

Minimum A: copy live positions into Explore runtime seeds;
particles remain (or are reborn at those positions); **strip
copy**; history may `captureInitial` at the transfer instant
(Guided trail is dropped unless a later slice transfers
snapshots). Dropping the old trail is acceptable v1: the parcel
is still there.

B does not require having run the experiment: “open these ICs in
Explore” from the catalog.

Neither promotes a parcel to S1/D1/NG1.

Do not implement navigation or state transfer here.

---

## 18. Inspector compatibility

Arbitrary tracers make selection worth having. Seeding must not
block:

| Future | Seeding implication |
| --- | --- |
| Select / follow | Don’t key UI on Guided array names; index OK until C in `§12` fires |
| Total `V` | `VelocityField.sample` at particle position |
| Per-operand `V_i` | Later observation API; independent of seed owner |
| Local diagnostics | Same |
| Birth time / age | `age` from birth; `clock.time - age` until Reset (`§8`) |

No inspector API in this slice.

---

## 19. Persistence boundary

```text
ScenarioConfig     canonical scenario / DEMO fixtures
                   including Guided IC arrays

user session       exploratory seeds, tool altitude,
                   Pause / timeScale, camera
                   NOT written into ScenarioConfig
```

A future serializable “user experiment” may snapshot Explore
seeds + clock + frame. That is **not** `DEMO_SCENARIO`. Do not
add `exploreSeeds` to `ScenarioConfig` “for later.”

---

## 20. Explicit verdicts

```text
exploratory seed ownership:           Explore runtime session
                                      not ScenarioConfig
                                      not Simulation-as-seed-store

curated vs exploratory
runtime boundary:                     claim + seed source
                                      same TracerParticle / V

minimum first release type:           A  point only

first coordinate-picking model:       XZ pick on ground-reference
                                      plane + explicit altitude

below-ground creation policy:         reject y < 0
                                      allow y = 0
                                      finite only
                                      check before Simulation

running-time release semantics:       born at current clock.time
                                      no Reset required
                                      paused or running

Reset / Clear semantics:              Reset = t=0 + restore
                                      Explore runtime seeds
                                      Clear = drop tracers,
                                      clock unchanged

TracerPathHistory compatibility:      reusable with extension
                                      fixed count is the constraint
                                      owner stays Option C

Simulation fixed-cohort
compatibility:                        Guided Reset stays fixed cohort
                                      Explore needs add + clear
                                      future addParticle on Simulation

stable tracer identity timing:        C  defer until select /
                                      delete / compact
                                      first slice append-only index

Explore trail policy:                 on; full history;
                                      observational not a story
                                      keepInactiveGlyphs false

many-parcel blocker status:           none now
                                      optimize later
                                      measure before 500–1000

Guided / Explore seeding reuse:       share particle creation
                                      Explore owns release spec
                                      Guided owns catalog ICs

Open Guided in Explore:               A leave-mid-run
                                      B separate catalog IC open
                                      implementation deferred

future persistence owner:             session / user experiment
                                      not ScenarioConfig
```

---

## 21. Implementation sequence

Ordered so UI cannot depend on a fixed cohort.

```text
Slice 1 — runtime lifecycle prerequisite   COMPLETE
          Simulation.addParticle / addParticles / clearParticles
          TracerPathHistory.appendParticle / appendParticles
          TracerPathHistory.clear() keeps lanes (Guided Reset)
          TracerPathHistory.removeAllLanes() → lane count 0
          TracerScene.addTracerSlot / addTracerSlots / clearTracerSlots
          constructors accept 0 occupancy
          headless acceptance + observe-slot tests
          not user-facing Explore

Slice 2 — Explore runtime + point-release domain   COMPLETE
          ExploreTracerSession
            releasePoint / reset / clear / seeds
          assertAtmosphericTracerSeed
          copyAtmosphericTracerSeed
          AtmosphericTracerSeedError
          seed shape = TracerSeedPosition {x,y,z}
          birth at current clock.time; age 0; no birthTime field
          Reset = resetTracersFromSeeds(Explore seeds)
                   + history.clear + captureInitial
          Clear = seeds [] + clearParticles + removeAllLanes
                  clock unchanged; renderer slots not owned
          still no UI / picking / scene wiring

Slice 3 — coordinate acquisition + preview marker   COMPLETE
          ExplorePointReleaseTool
            altitudeM / setAltitude / pendingSeed
            pickOnGroundReferencePlane / cancelPending
            placementEnabled (pointer gate; default false)
          DEFAULT_EXPLORE_POINT_ALTITUDE_M = 1000
            UI/session convenience only, not ScenarioConfig
          intersectRayWithGroundReferencePlane (y = 0)
          shouldAcceptPlacementPick
            enabled tool + stationary click; OrbitControls stay on
          createReleasePreviewMarker / syncReleasePreviewMarker
          TracerScene.syncReleasePreview (not a tracer slot)
          pick does not call releasePoint
          Guided App / TracerViewport unwired

Slice 4 — wire into an Explore entry   COMPLETE
          App Guided | Explore entry (temporary product switch;
            not a four-value TracerPedagogy selector)
          createExploreLab: empty seven-operand SR laboratory
          ExplorePointReleaseOrchestration
            pick gated by shouldAcceptPlacementPick
            confirm = releasePoint then addTracerSlot
            Reset clears pending preview; slots unchanged
            Clear = session.clear + clearTracerSlots + cancelPending
            clock unchanged on Clear; scene object not recreated
          TracerViewport: pointer→worldRayFromNdc, preview prop,
            slot handle; does not import the Explore tool
          trails on; keepInactiveGlyphs false
          unlabeled copy
          Guided NG1 composition unchanged
          first unlabeled point tracer visible after confirm
```

Slice 1 late-birth capture is `appendParticle` / `appendParticles`,
not a growth-mode `captureInitial`. `captureInitial` remains
full-cohort recapture after `clear()`.

**First browser-visible / useful slice:** **4**, which consumes
1–3. If 1–3 ship without 4, nothing new appears in the current
Guided App. Do not sneak point-release into
`NearGroundOutflowPathline`.

Do not start at Slice 4 (click-to-birth) before an Explore entry
exists: Slice 3 is pick + preview only. `releasePoint` stays off
the pointer path.

---

## 22. Next product slice / modeling

After this SoT, remaining **architecture** in the `16` queue:

**Shared tracer inspector architecture SoT** (docs). Selection,
`V_total`, per-operand contributions, and the moment stable IDs
become earned (`§12` C). Point-release implementation may
proceed without it if the first slice stays append-only.

Do not treat catalog DTO migration or a four-mode selector as
next.

**Modeling:** still paused (`15`, `16`, `17`). Explore seeding
found **no** physics blocker. When modeling resumes:

```text
tilting / stretching interaction architecture SoT
```

---

## 23. Compact lock-in

```text
Explore tracer semantics:        unlabeled passive tracer of
                                 the same V; no inherited claim

release semantics:               specification → one or more seeds
                                 first primitive = one point

ownership:                       Explore runtime session
                                 ScenarioConfig stays fixtures
                                 Simulation owns live particles

first release primitive:         point

coordinate acquisition:          XZ on ground-reference plane
                                 + explicit altitude
                                 no empty-space click

creation-time domain policy:     finite; y ≥ 0; reject y < 0
                                 reusable seed check earned
                                 sampling still unbounded

runtime birth semantics:         clock.time now; age 0
                                 running or paused; no Reset

Reset / Clear lifecycle:         Reset = t=0 cohort replay
                                 from Explore seeds
                                 Clear = empty; clock continues
                                 resetTracersFromSeeds = cohort helper

history strategy:                extend TracerPathHistory
                                 do not freeze tracerCount
                                 do not change owner

particle / cohort strategy:      Guided = replace cohort
                                 Explore = add + clear
                                 scene must grow without dispose

identity strategy:               index for append-only first slice
                                 stable id later (select/delete)

trail policy:                    on; observational; full history
                                 keepInactiveGlyphs false

many-parcel scaling status:      no blocker for point release
                                 measure before hundreds+

release-marker semantics:        preview ≠ glyph ≠ trail
                                 not D1 terminal policy

Guided reuse boundary:           share create/reset particle
                                 do not share mouse-release
                                 do not merge seed arrays

Guided→Explore transition:       A exit with positions, no claim
                                 B catalog ICs unlabeled
                                 not implemented here

persistence boundary:            session / user experiment
                                 never DEMO_SCENARIO dumping

implementation sequence:         1 lifecycle (done)
                                 2 domain/session (done)
                                 3 pick+preview (done)
                                 4 Explore wire (done)

first browser-visible slice:     4 (point tracer in Explore)

next product slice after
seeding:                         inspector architecture SoT
                                 (docs)
                                 first impl:
                                 sequence 4

modeling status:                 paused
                                 next: tilting/stretching SoT

blockers:                        none for writing inspector SoT
                                 empty-space picking forbidden
                                 ScenarioConfig mutation forbidden
                                 Guided claim inheritance forbidden
                                 final Explore UI not started
                                 inspector SoT is the next product
                                 docs slice

production this slice:           Slices 1–4
                                 first browser-visible Explore
                                 point release
                                 not final Explore UI
```

---

## 24. STOP

Slice 4 is complete: a user can enter Explore, pick an XZ datum,
confirm, and birth an unlabeled tracer at current `clock.time`.
This SoT does not start the final Explore/Guided product shell,
UUIDs, inspector, persistence, optimization, physics, or
tilting/stretching. Slice APIs are recorded in §21.

Do not write user seeds into `storySeeds` or `DEMO_SCENARIO`.
Do not fake a 3D click without a plane + altitude.
Do not require Reset to add a tracer.
Do not treat a user trail as a Guided experiment.
