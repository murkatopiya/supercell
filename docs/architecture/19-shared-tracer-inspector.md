# Shared Tracer Inspector Architecture

**Status:** architecture / product SoT. Slices 1–4 are
implemented. No Follow. No Level 3 diagnostics.

**Current product status:** Explore point release is live
(`18` Slices 1–4). Guided runtime wiring is live (`20` Slice 2);
catalog teaching copy is live (`20` Slice 3). Live App opens on
Guided `inflow-to-upper-outflow` with a temporary Explore |
Guided entry. Desktop workbench layout is live. Successor
product SoT: `docs/architecture/20-guided-runtime-architecture.md`.
Current whole-product direction checkpoint:
`docs/architecture/21-whole-product-direction-checkpoint.md`.
Current perceptual-loop / physics-resumption status:
`docs/architecture/24-perceptual-exploration-checkpoint.md`.
Tilting / stretching direction revalidation:
`docs/architecture/25-tilting-stretching-direction-revalidation.md`.
Physics pause is lifted for design in `24`; this Inspector
SoT does not start physics implementation.
Slice 1 is headless identity + `TracerSelection`. Slice 2 is a
headless observation adapter (`TracerInspection`) plus
composition-held operand instances. Slice 3 is browser-visible
glyph picking + selected highlight. Slice 4 is the shared
presentational Inspector panel.

This document answers:

    How can a user select a tracer and understand why it is moving
    the way it is, using one read-only inspector shared by Explore
    and Guided, without making rendering own physics or turning
    arbitrary Explore tracers into curated stories?

It does **not** implement Follow, a timeline, delete-one, or
persistence. Slice 1 implemented identity + selection state.
Slice 2 implemented the read-only decomposition observation
adapter. Slice 3 implemented glyph picking and selected
highlight. Slice 4 implemented the shared Inspector UI.

Predecessors:

- `docs/architecture/16-explore-guided-interaction-architecture.md`
- `docs/architecture/17-guided-experiment-catalog.md`
- `docs/architecture/18-explore-arbitrary-seeding.md`

Authoritative:

- `docs/CONCEPT.md` §7–§8, §11, §13
- `docs/ARCHITECTURE.md` §2, §9–§13, §23–§24, §28, §36
- `docs/architecture/01-scenario-config.md`
- `docs/physics/12-composite-velocity-field.md`
- `docs/physics/19-storm-relative-environmental-advection.md`
- `docs/rendering/01-tracer-scene.md`
- `docs/rendering/02-tracer-runtime-controls.md`

Historical docs remain historical. `01-tracer-scene` operand
lists lag the live seven-operand stack; the observe-only
rendering contract remains SoT.

Live snapshot (current default Guided experiment is
`inflow-to-upper-outflow`; NG1 is one catalog experiment, not
product navigation):

```text
IntegrationFrame     = StormRelativeLaboratory
environmental operand = StormRelativeEnvironmentalAdvectionField
stack                = seven prescribed operands
Explore              = empty session + point release
Guided live default  = inflow-to-upper-outflow (`20`)
selection            = TracerSelection (App owner; React mirrors selectedId)
inspector            = TracerInspection in App React state
                       (presentational TracerInspectorPanel)
picking              = visible glyph ray test (slot index → tracerId)
highlight            = TracerScene observes selected occupancy slot
```

---

## 1. Verdict

**The inspector is read-only observation of one live tracer and
the current model state, owned by interaction/session state,
shared by Explore and Guided, answering “why is this tracer
moving this way right now?” from the same field instances the
integrator samples.**

Confirmed hypotheses:

```text
selection is interaction state
renderer visualizes selection
Simulation does not own "selected"
rendering does not own physics
Explore tracers remain unlabeled
Guided claims stay outside the shared inspection contract
seven named operands are the current model's decomposition,
  not the inspector's permanent anatomy
```

Canonical user question (`CONCEPT` §13, `ARCHITECTURE` §28 / §36):

```text
Why is this tracer moving this way right now?
```

The answer is current model state at the displayed tracer
position and current `clock.time`. It is not cached teaching
copy, not a Guided claim, and not a reconstructed environmental
wind that is not the integration operand.

---

## 2. Audit of current contracts and code

### 2.1 Product already required this

| Source | What it already said |
| --- | --- |
| `CONCEPT` §7 | Select or release tracers; later expose local values |
| `CONCEPT` §8 | Explore inspects values; Guided is the same laboratory |
| `CONCEPT` §11 | Tracer asks only `V(position, time)`; source may later be a dataset |
| `CONCEPT` §13 | User should be able to ask “why?” |
| `ARCHITECTURE` §2 | Selection / Follow live in Interaction; probes in UI |
| `ARCHITECTURE` §12 | Dataset-backed `VelocityField` must not leak into particles |
| `ARCHITECTURE` §23 | Probe samples the same fields particles use |
| `ARCHITECTURE` §28 | `V_i` then `V_total` at a selected point |
| `ARCHITECTURE` §36 | Explain every motion from inspectable contributions |
| `16` §13 | Selected tracer missing; contribution API later; not `divergence()` |
| `17` §12 | Shared Explore+Guided inspector; no Guided-only physics |
| `18` §12 | Stable IDs deferred until select / delete / compact |
| `18` §18 | Inspector must not key UI on Guided array names |

`16` ranked this SoT as product slice 3. `17` and `18` named it
as the next product docs slice after Explore seeding. That queue
item is this document.

### 2.2 What exists now

Reusable, role-agnostic:

```text
TracerParticle          { tracerId, position, age, active }
                        tracerId assigned by Simulation at birth
TracerAdvectionState    { position, age, active }  pre-birth
Simulation              owns particles, clock, step
                        assigns monotonic tracerId (starts at 1)
                        restarts the counter on clearParticles
                        velocityField is private
                        addParticle / clearParticles exist
TracerSelection         src/interaction/TracerSelection.ts
                        selectedId: number | null
                        select(id) / clear()
findTracerById
resolveSelectedTracer   lookup against a caller-owned list
                        selection does not own particles
TracerInspection        src/interaction/TracerInspection.ts
                        inspectTracer / inspectSelectedTracer
InspectableVelocityOperands
                        total + optional { key, field }[]
                        same instances Simulation integrates
CompositeVelocityField  generic Σ V_i; fields private
                        sample discards summands
                        still nameless
VelocityField           sample(position, time) → Vec3
composeDemoTracerFields already returns named operand
                        instances + the composite
composeDemoTracersWithObservation
composeDemoTracerLab    keep those instances beside Simulation
ExploreLab / GuidedLab  hold velocityObservation
TracerScene             observe-only Sphere meshes + optional lines
                        addTracerSlot / clearTracerSlots
                        pickVisibleTracer(ray) → slotIndex | null
                        syncSelectedSlot observes highlight
                        no product selectedId
ExploreTracerSession    seeds, late birth, Reset, Clear
                        not a selection owner
AtmosphericTracerDomain y ≥ 0 crossing after integration
TracerPathHistory       index-aligned lanes
```

Composition (Slice 2 closed the former inspector hole):

```text
composeDemoTracerFields(...)
  → { field, environmentField, updraftField, ... }

demoInspectableVelocityOperands(composed)
  → { total: composed.field, parts: same operand instances }

composeDemoTracersWithObservation / composeDemoTracerLab
  → Simulation(velocityObservation.total) + velocityObservation

composeDemoTracerSimulation / composeExploreTracerSimulation
  → Simulation only (existing physics/pedagogy tests)
```

The live operands already exist at composition time. The
inspector consumes **those** instances. It must not call
`composeDemoTracerFields` a second time.

Pointer path already exists for placement (`TracerViewport`
stationary `pointerup` → `worldRayFromNdc` →
`handlePlacementAttempt`). Glyphs are real `THREE.Mesh`
spheres. A selection ray can share that ray; it must not share
the ground-plane hit test.

### 2.3 What the inspector must not do

```text
modify tracer position / age / active
modify velocity fields or scenario parameters
change IntegrationFrame
change TracerPedagogy
assign S1 / S2 / D1 / NG1 or a catalog claim to an Explore tracer
put English labels inside physics classes
call production divergence() or mass-budget language
sample a rebuilt field set
show ground-relative environmental wind as the V_total contribution
  while integration uses storm-relative advection
```

---

## 3. Inspector semantics

Read-only observation of **one** live tracer plus current model
state.

```text
input:   selected tracer identity
         current particle.position
         current simulation.clock.time
         the VelocityField Simulation integrates
         optional model-specific contributions from the same
           operand instances that field was built from

output:  descriptive facts
         not a story
         not a command
```

Paused and running use the same rule. Pause already freezes
integration while the scene keeps rendering (`02`). The
inspector reads the frozen `(x, t)`.

Empty occupancy and “no selection” are legal. The inspector is
then absent or empty. It must not invent a tracer.

---

## 4. Selection ownership

**C. Interaction / product session state above Simulation and
TracerScene.**

The tested hypothesis is **confirmed**:

```text
selection is interaction state
renderer visualizes selection
Simulation does not own "selected"
```

| Candidate | Verdict |
| --- | --- |
| A. `TracerScene` | **Rejected.** Observe-only (`01`). Highlight is a visual of selection, not the owner. |
| B. `Simulation` | **Rejected.** Owns particles, clock, integration. “Selected” is not atmospheric state. |
| **C. Session / interaction above both** | **Canonical.** |
| D. `ExploreTracerSession` as the only owner | **Rejected as the shared owner.** That type owns Explore seeds. Guided has no such session. Do not overload seed ownership with selection. |

### 4.1 Owner map

| Concern | Owner |
| --- | --- |
| Selected tracer identity | Interaction / lab session state |
| Selected highlight | Rendering observes that identity (glyph, later trail) |
| Inspector visibility | UI session; typically visible iff a selection exists |
| Selection clear | Interaction / lab session |
| Live particles | `Simulation` |
| Explore seeds | `ExploreTracerSession` |
| Guided ICs | `ScenarioConfig` arrays + Guided Reset |
| Model `V` | Unchanged composition |

Do not implement a store in this slice. Conceptual shape:

```text
TracerSelection
  selectedId: TracerId | null

Renderer
  highlight the glyph whose particle carries that id
  do not store product selection inside TracerScene as the source of truth

Inspector
  if selectedId is null → empty
  else observe that particle + current model
```

`ExploreTracerSession` stays the seed owner. Guided Reset stays
the cohort helper. Selection sits beside them, shared.

---

## 5. Stable tracer identity — now earned

`18` §12:

```text
C. ID deferred until selection / deletion / compaction
```

Selection is the purpose of this SoT. That trigger has fired.

**Verdict: B. A stable runtime tracer ID is now required
before selection is stored as product state.**

| Candidate | Verdict |
| --- | --- |
| A. Index is still sufficient | **Only as occupancy layout.** History and scene slots remain index-aligned with `particles[]` until delete-one / compact. Index is **not** the selection key. |
| **B. Stable runtime tracer ID now** | **Canonical for selection / inspector / later Follow.** |
| C. Defer ID for first inspector | **Rejected.** That would paint shifting index into UI selection, which `18` §12 recorded specifically to avoid. |

### 5.1 Why index is not the selection key

| Event | Index behavior | Selection need |
| --- | --- | --- |
| Late birth (append) | Existing indices stay | Must not retarget |
| Explore Reset | In-place; count unchanged (`resetTracersFromSeeds`) | Preserve the same tracer |
| Explore Clear | All indices vanish | Clear selection |
| Guided Reset | In-place; count unchanged | Preserve the same tracer |
| Guided cohort replacement / Explore ↔ Guided | New `Simulation`, new array | Clear selection |
| New tracer appended | New last index | Keep previous selection |
| Future delete-one / compact | **Indices shift** | Index-as-identity breaks |

Append-only Explore plus replace-cohort Guided would let a first
panel *happen* to work with `selectedIndex`. That is the trap.
The first inspector that stores selection is exactly the moment
`18` named.

Do **not** invent UUIDs. A monotonic integer is enough.

### 5.2 ID semantics (not implementation)

```text
name:          tracerId
type:          monotonic integer
assigned:      at birth
                 Simulation initial cohort
                 Simulation.addParticle / addParticles
uniqueness:    unique among particles of one Simulation instance
                 for that instance's occupancy lifetime
scope:         one Simulation / lab instance
               not global, not cross-session, not meteorological

Reset:         particles mutated in place → keep tracerId
Clear:         particles gone → selection cleared
               next births may restart the counter
               (no selected id survives Clear)

Guided replace / mode switch:
               new Simulation → new ids → selection cleared

serialization: none
               not ScenarioConfig
               not a user-experiment snapshot in this SoT

not:           UUID
               S1 / S2 / D1 / NG1
               pedagogy role
               Explore vs Guided tag
```

`ARCHITECTURE` §13’s advection state remains `{ position, age,
active }`. `tracerId` is a runtime handle, not atmospheric
behavior. Putting it on the particle is acceptable; a parallel
Simulation map is also acceptable. This SoT does not choose the
field layout.

History and scene stay **index-aligned** until a later
delete-one / compact slice remaps them. Selection and inspector
key by `tracerId`. Lookup is `findTracerById` /
`resolveSelectedTracer` (N is small).

Slice 1 API (implemented):

```text
src/simulation/TracerParticle.ts
  TracerAdvectionState  { position, age, active }
  TracerParticle        extends that with readonly tracerId: number

src/simulation/Simulation.ts
  constructor / addParticle / addParticles assign tracerId
  first id = 1
  clearParticles restarts the counter
  createTracersFromSeeds does not write tracerId
  resetTracersFromSeeds mutates in place (keeps tracerId)

src/interaction/TracerSelection.ts
  TracerSelection.selectedId: number | null
  TracerSelection.select(tracerId)
  TracerSelection.clear()
  findTracerById(particles, tracerId)
  resolveSelectedTracer(particles, selection)
```

---

## 6. Minimum inspector payload

Smallest useful **v1** inspector answers the canonical question.
That requires motion **and** contributions (`§7`, `§15`). The
table below classifies the requested kinematic fields first.

| Quantity | Class | Notes |
| --- | --- | --- |
| Position `x, y, z` | **Required v1** | World meters. Same `particle.position` the renderer copies. |
| Altitude | **Required v1** | World `y`. Display conversion stays outside physics (`ARCHITECTURE` §4). |
| Simulation clock time | **Required v1** | `simulation.clock.time` after the last completed fixed step. |
| Tracer age | **Required v1** | `particle.age`. Birth time is `clock.time - age` until Reset; not a stored field today (`18` §8). |
| Active / inactive | **Required v1** | Lifecycle, not a story. |
| `V_total` vector | **Required v1** | World `Vec3` from the **same** `VelocityField` Simulation integrates, sampled at current `(position, time)`. |
| `\|V_total\|` | **Required v1** | Derived speed. |
| Birth time as its own row | Useful later | Recoverable from `time - age` until Reset. |
| Atmospheric `(eastward, northward, vertical)` of `V_total` | Useful later | Explicit conversion helper; do not name world components `u,v,w`. |
| Named vertical velocity row | Useful later | Already `V_total.y`. |
| S1 / D1 / NG1 / experiment name / pedagogy | **Not appropriate** | Guided may layer copy *above* this contract (`§10`). |
| Temperature, pressure, humidity | **Not appropriate** | Not in the current model. |
| `divergence()`, mass budget, “cold pool” | **Not appropriate** | `10` / `16` §13. |

v1 payload conceptually:

```text
TracerInspection
  tracerId
  time
  position          // world Vec3
  altitude          // = position.y
  age
  active
  vTotal            // world Vec3
  speed             // |vTotal|
  contributions?    // §7; present for the current DEMO model
```

No UI layout in this slice.

---

## 7. Per-operand velocity decomposition

Central architecture question.

Current live sum (`composeDemoTracerFields`, SR laboratory):

```text
V_total
  = V_environmentAdvection     // StormRelativeEnvironmentalAdvectionField
  + V_updraft
  + V_rotation
  + V_lowerInflow
  + V_upperOutflow
  + V_downdraft
  + V_nearGroundOutflow
```

That anatomy is **the current model’s decomposition**, not the
inspector contract (`§17`).

### 7.1 Candidates

| Candidate | Meaning | Verdict |
| --- | --- | --- |
| A. Inspector re-samples seven known classes, possibly by reconstructing them | Inspector owns storm anatomy | **Rejected** as owner. Reconstruction would duplicate composition. Walking seven types couples the inspector to DEMO. |
| B. `CompositeVelocityField` gains a named inspect API (`V_updraft`, …) | Compositor learns product roles | **Rejected.** Physics `12`: generic laboratory sum; no environment / updraft / storm semantics. |
| **C. Composition exposes a named observable field set alongside the composite** | Same instances the composite already holds; names live at composition | **Canonical.** |
| D. Other | — | A nameless generic “operands in order” helper on `CompositeVelocityField` is *compatible* later as an invariant aid. It is not the named decomposition and is not required before C. |

### 7.2 Two layers (keep distinct)

```text
physics composition
  CompositeVelocityField
  V_total = Σ sample(F_i, P, t)
  operands are anonymous VelocityField instances
  no English, no roles, no UI

human-readable model decomposition metadata
  composition-time descriptor
  same instances, in stable published order
  role keys (tokens), not physics-class labels
```

`composeDemoTracerFields` already returns the named instances.
v1 observation keeps that list alive next to `Simulation`
instead of discarding it.

Implemented composition descriptor:

```text
InspectableVelocityOperands
  total: VelocityField          // the instance Simulation steps
  parts?: { key, field }[]      // same instances, same order
                                // as the composite's operand list
                                // omitted / empty → no Level 2
```

The inspector adapter samples `total` and each `parts[i].field`
at the **same** `(position, time)`. It does not rebuild fields.
It does not copy formulas from `UpdraftField` et al.

### 7.3 What CompositeVelocityField may and may not gain

Must **not** gain:

```text
role names
English labels
Explore / Guided knowledge
ScenarioConfig knowledge
divergence()
```

May later gain (optional, not this SoT’s implementation):

```text
nameless operand samples in array order
or a readonly operand list
```

That would still be physics `12` (exposing the summands of an
already-defined sum). Names still come from composition
metadata.

### 7.4 Numerical invariant

```text
sum_i V_i(P, t)  ==  V_total(P, t)
                 ==  velocityField.sample(P, t)
```

component-wise in world `(x, y, z)`, at the inspected
`(position, time)`.

Use a tight floating-point tolerance appropriate to summing the
same analytic samples (`12` §3 / §11). Do not treat visual
smoothness as the test.

If contributions are published from one sample pass, the
internal sum can be exact by construction; still assert that
published `V_total` equals the Simulation field’s `sample`.

---

## 8. Environmental contribution semantics

Live frame is `StormRelativeLaboratory`.

The environmental **contribution to `V_total`** is the actual
environmental operand in that composite:

```text
StormRelativeEnvironmentalAdvectionField.sample(P, t)
  = V_env_ground(P, t) − C     (horizontal only; D2)
```

It is **not**:

- `EnvironmentalWindField.sample` (ground-relative);
- a reconstruction from `EnvironmentalWindProfile` + `C` inside
  the inspector;
- the hodograph panel’s ground-relative wind (`App` subtitle
  already splits those frames).

`composeDemoTracerFields` already distinguishes:

```text
groundRelativeEnvironmentField   // D1-capable env field
environmentField                 // the composite operand
                                 // SR adapter in live App
```

Decomposition must use `environmentField`.

Diagnostics may **separately** expose, in an environment /
hodograph surface, not as summands of `V_total`:

```text
ground-relative environmental wind     D1 / profile
storm motion C
storm-relative wind                    diagnostic 07
```

Do not label the inspected env contribution “environmental
wind” if that phrase is read as ground-relative. Token:
`environmentAdvection` (`§16`).

---

## 9. Inspector and time

Rendering shows the **last completed fixed-step state** only
(`01`, `02`). No interpolation between steps.

`Simulation.step` samples `V` at `clock.time` **before**
`clock.advance`. After a step the displayed particle is at
`x_{n+1}` and the clock is `t_{n+1}`. The displacement just
taken used `V(x_n, t_n)`.

v1 does **not** reconstruct that historical sample.

**Canonical v1 semantic:**

```text
inspect current tracer.position
at current simulation.clock.time
after the last completed fixed step
(or at rest if never stepped / currently paused)
```

This is render-time current state. It answers “right now,”
including for a future unsteady `V(x, t)`.

Do not assume current fields remain Eulerian-steady.

| When | Inspector reads |
| --- | --- |
| After a step | Post-step position, post-advance `clock.time` |
| While paused | Same frozen `(x, t)`; scene still renders (`02`) |
| Mid-frame accumulator | Last completed step only (same as glyphs) |

Inactive particle: the field at `(x, t)` is still defined.
The particle is **not** integrating (`Simulation` skips it).
Displayed `V_total` is model velocity at the marker, not
`dx/dt` of a frozen particle. `active` must be visible so the
UI cannot say “it is moving at V” when it is not stepping.

---

## 10. Guided vs Explore reuse

Same observation infrastructure. Same payload. Same picking /
highlight rules.

| Surface | Explore | Guided |
| --- | --- | --- |
| Shared physics inspector | Descriptive facts only | Same facts |
| Teaching claim | **Forbidden** on the tracer | Catalog copy / allowed claim **beside** the inspector, not inside it |
| S1 / D1 / NG1 / experiment name / pedagogy role | Not in the contract | Not in the shared contract |

Guided may later layer annotations (“this experiment highlights
near-ground outflow”) **above** `TracerInspection`. Those
strings come from the catalog (`17` §11), not from sampling
`V`. NG1 is still a **composite** path (`14` §9); the inspector
is how the user checks the live sum, including opposing lower
inflow.

An Explore tracer that starts near NG1 is not NG1 (`16` §7,
`18` §2).

---

## 11. Selection visual language

Minimum needed to know which tracer the panel describes.

| Treatment | Class |
| --- | --- |
| Selected glyph highlight | **Required for first inspector** |
| Selected trail highlight | Later |
| Dim others | Later; optional. Do not hide others (Explore coexistence is allowed; Guided S1/S2 is a family). |
| Auto Follow on select | **Not desirable** |
| Recreate scene / camera on select | **Forbidden** (`02`, `18`) |

Do not design styling.

Follow remains `ARCHITECTURE` §24: camera observes a tracer; it
does not pull it. **Not this implementation sequence.** User-
initiated and cancellable when later earned (`17` §7, §10).

Preview marker is not a tracer and is not a selection target
(`18` §15).

---

## 12. Picking an existing tracer

**Canonical first selection interaction: pointer ray → tracer
glyph hit.**

Glyphs are actual `THREE.Mesh` spheres (`tracerObserveSlot`).
`TracerScene.worldRayFromNdc` / `TracerViewport` already
produce a world ray for placement. Selection may share that
ray. It must not use `intersectRayWithGroundReferencePlane` as
the tracer test.

| Candidate | First inspector? |
| --- | --- |
| **Ray vs visible tracer glyph** | **Yes. Canonical.** |
| List / index in the panel | Useful companion (S1 vs S2; clustered Explore). Not required to *start* if glyph pick works. Do not key the list by Guided names. |
| Nearest projected tracer | Later fallback; more ambiguous |
| Numeric id entry | Not the laboratory gesture |

Stationary-click gate: `shouldAcceptStationaryClick`, the same
movement threshold as Explore placement
(`DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX`). Orbit drag must not
select.

Hidden glyphs (`keepInactiveGlyphs === false` and
`active === false`) are not pickable. Preview marker is not
pickable.

Implemented picking boundary:

```text
TracerScene.pickVisibleTracer(WorldRay) → slotIndex | null
  ray-test visible slot meshes only
  nearest hit
  preview excluded (not a slot)

TracerViewport
  slotIndex → simulation.particles[slotIndex].tracerId
  onTracerSelect(tracerId)
  selectedTracerId → occupancyIndex → TracerScene.syncSelectedSlot
```

`TracerScene` does not own `tracerId`. `TracerViewport` does not
own `TracerSelection`.

### 12.1 Placement vs selection precedence

Do not conflate:

```text
placement click   ground-reference XZ plane → pending seed
selection click   tracer glyph → selectedId
```

**Glyph intersection wins over ground-plane placement.**

```text
stationary left click:
  if ray hits a visible tracer glyph
    → select that tracer
    → do not update pending placement
  else if Explore placementEnabled
    → existing ground-plane pick path
  else
    → orbit only
```

A pending preview may remain while a live tracer is selected.
They are different objects. Confirm-release stays the explicit
confirm control (`18` Slice 4), not the glyph click.

Guided has no placement tool. Glyph pick is the only 3D
selection gesture there. `onPlacementAttempt` may be undefined;
pointerup still runs picking.

Slice 3 implemented this pointer policy. Slice 4 consumes the
same selection and observation path.

---

## 13. Selection lifecycle

Lock:

| Event | Selection |
| --- | --- |
| Selected tracer becomes inactive | **Remains selected and inspectable** while the particle still exists. D1’s climax is the exit marker (`17` §9). Show `active = false` and field-at-point (`§9`). |
| Explore Reset | **Preserve** `selectedId` if that id still exists (in-place cohort; ids kept). |
| Guided Reset | **Preserve** likewise. |
| Explore Clear | **Clear** selection. Occupancy is 0. |
| Explore ↔ Guided | **Clear.** App creates a new `Simulation` (`createExploreLab` / `createGuidedLab`). |
| Guided experiment replacement | **Clear.** New cohort, new ids. (Not implemented as catalog UI yet; the rule applies when it is.) |
| New tracer appended | **Unchanged.** The previous id remains selected. |
| Leave Guided → Explore carrying positions (`17` §13 A, not implemented) | Later slice: treat as new lab identities unless that transfer SoT says otherwise. Default: **clear**, then user selects again. Do not keep a Guided claim on the id. |
| Zero tracers / never selected | `selectedId = null`. Inspector empty. Safe. |

Click-empty-to-deselect: later, not required for v1.

Cannot newly pick a hidden inactive Explore glyph. An already
selected Explore tracer that then exits may keep the panel on
the terminal state even though the glyph is hidden. That is
honest (numbers remain); a later list would make it re-selectable.

---

## 14. Vorticity / diagnostics — what the inspector can honestly show

Current diagnostics are **environmental-profile** quantities,
not 3D curl of the seven-operand composite.

| Quantity | Class | Why |
| --- | --- | --- |
| `V_total`, `V_i` at tracer `(x,y,z,t)` | **A. Local, inspectable now** | Direct `VelocityField.sample` |
| Local environmental advection operand | **A** | The D2 field at that point (horizontally homogeneous ⇒ depends on `y`) |
| Ground-relative env wind at tracer `y` | **A as env context, not a V_total summand** | `EnvironmentalWindField` / profile. Hodograph already teaches this. |
| Prescribed rotation **velocity** at the point | **A** | Operand `V_rotation`. **Not** vertical vorticity of the flow. |
| Environmental shear, `ω_h` from `dV/dz` | **B. Column / layer** | Derived from the profile, not from the composite 3D field. Hodograph overlays. |
| Streamwise / crosswise `ω_h` | **B** | Env + `C` at a height. Can be evaluated at tracer `y`, still not storm-composite curl. |
| SRH | **B** | Layer integral (`09`). Not a local tracer-card number. |
| Hodograph relation of this parcel | **B** | Parcel `V` is not a hodograph rewrite (`16` §13). |
| 3D curl of `V_total` | **C. Not available** | New diagnostic SoT (`16` §13). |
| Derived `ω_z` from tilting / stretching | **C** | Blocked (`15`, `17` §15). |
| Claiming prescribed rotation **is** `ω_z` | **Forbidden** | `VerticalEnvelopeRotationField` is a prescribed velocity, not diagnosed vorticity. |
| Thermo / pressure / moisture | **C** | Not in the model. |

Do not stuff SRH into the local tracer card.
Do not pretend current rotation is derived vertical vorticity.

Level 3 (`§15`) may later show local env wind at tracer altitude
with explicit D1 vs D2 labels. The hodograph panel remains the
column surface.

---

## 15. “Why?” hierarchy

```text
Level 1 — motion
  position, altitude, time, age, active, V_total, speed

Level 2 — contributions
  model-specific V_i vectors and magnitudes
  sum invariant

Level 3 — environment / diagnostics
  hodograph relation, D1 wind, C, column vorticity, SRH
```

| Level | First implementation? |
| --- | --- |
| 1 | **Yes.** Always. |
| 2 | **Yes.** This is the “why?” of the current additive model. A motion-only card answers “what,” not “why.” |
| 3 | **Later** progressive disclosure. Hodograph already exists. Do not block v1 on it. |

Do not implement panels here.

---

## 16. Contribution naming / metadata

English labels must not be embedded in physics classes.

| Candidate | Verdict |
| --- | --- |
| Physics classes (`UpdraftField.getLabel()`) | **Rejected.** Role-agnostic primitives (`16` §7.1). |
| Generic field registry / plugin system | **Rejected** as premature (`01` / `08` anti-framework). |
| **App composition descriptor** | **Canonical owner of role tokens and instance wiring.** |
| Inspector adapter / UI copy table | **Owner of human-readable strings**, keyed by those tokens. |

Current DEMO tokens (stable, not English, not the inspector’s
permanent schema):

```text
environmentAdvection
updraft
rotation
lowerInflow
upperOutflow
downdraft
nearGroundOutflow
```

`environmentAdvection` is deliberate: live contribution is D2,
not ground-relative “environment.”

Order follows the current `composeDemoTracerFields` operand
array. Future models may publish a different list (`§17`).

---

## 17. Model decomposition beyond seven operands

**“Seven named operands” is the current model’s decomposition,
not the inspector contract.**

Inspector contract:

```text
V_total           always
                  from the VelocityField Simulation integrates

contributions     optional, model-specific
                  zero or more { key, velocity }
                  if present, they must sum to V_total
```

Future sources the architecture already allows:

| Source | Decomposition |
| --- | --- |
| Current DEMO composite | Seven additive parts, tokens above |
| Tilting / stretching | **Not** assumed to be an eighth additive operand (`15` / `02` Y12). Publish whatever that model’s observation SoT defines. |
| Time-dependent fields | Same keys; sample at current `t` (`§9`) |
| Dataset-backed `V` | Often **no** mechanism parts (`§18`) |

Do not overgeneralize into a plugin compositor. Keeping
contributions optional is the survival rule.

---

## 18. Dataset future

`CONCEPT` §11 and `ARCHITECTURE` §12: a tracer must not care
whether `V` is synthetic or interpolated from a dataset.

Degrade:

```text
V_total           always available
component list    omit / empty
Level 1           still honest
Level 2           hidden
Level 3           only if those diagnostics still exist
```

Do not make the final inspector permanently depend on synthetic
operand anatomy. Do not fake seven mechanisms on a dataset
total.

---

## 19. Read-only observation API

Named concepts:

| Name | Timing |
| --- | --- |
| `TracerInspection` | **Useful name for the payload.** Documented here. Not a framework. |
| `VelocityDecomposition` | Optional part of that payload. |
| `ModelObservation` | **Defer.** Too broad (scalars, volumes, probes at arbitrary points). |

**Verdict: implement a narrow adapter first.** Do not wait for a
`ModelObservation` service.

The adapter (implemented):

```text
src/interaction/TracerInspection.ts

inspectTracer(particle, time, observation) → TracerInspection
inspectSelectedTracer(particles, selection, time, observation)
  → TracerInspection | undefined

observation.total           always sampled
observation.parts           optional; empty/absent omits contributions
does not mutate particle, fields, clock, or selection
does not import Three.js, React, or pedagogy
```

`inspectSelectedTracer` uses `resolveSelectedTracer`. No
selection or a missing id returns `undefined`, never a fake
payload.

An arbitrary-point probe (`ARCHITECTURE` §23) is a sibling later
(click empty space, no particle). v1 is **selected tracer**, not
a free probe.

Composition holds the same `total` reference beside
`Simulation` (`composeDemoTracersWithObservation` passes
`velocityObservation.total` to the `Simulation` constructor).
Simulation does not gain contribution names.

---

## 20. Performance

Inspector observes **one** tracer. Seven extra `sample` calls
per update are cheap next to integrating N particles. Do not
optimize in this sequence (`ARCHITECTURE` §35).

Separate:

```text
physics observation sampling
  read live (x, t); no teaching snapshot

React / UI rerender
  may be slower than rAF
```

v1 cadence (Slice 4):

```text
sample when the inspector is visible
  on selection change (immediate inspectSelectedTracer)
  after a completed fixed-step batch in TracerViewport
    (onSimulationAdvanced once per rAF if consumed.steps > 0)
  on Reset (same selectedId; refresh current particle/clock)
  while paused: live (x, t) is frozen; one sample is enough
               until selection or time changes

do not sample every tracer
do not notify when consumed.steps === 0
do not assume fields stay steady when choosing the API
  (the API always passes time)
```

The viewport stores `onSimulationAdvanced` in a ref, same as
placement/select callbacks, so Inspector React state cannot
recreate `TracerScene`.

No optimization implementation.

---

## 21. Testing strategy (future; none written here)

When implementation is commanded, tests should lock:

```text
selected tracer identity (id, not index)
  survives append
  survives Reset
  clears on Clear and mode-switch

decomposition sums to V_total at the same (P, t)
published V_total equals Simulation field.sample(P, t)
environmental contribution equals the actual integration operand
  (SR adapter in StormRelativeLaboratory; not ground-relative env)

same time and position as the live particle / clock
inspector / adapter does not mutate particle or fields
zero-tracer and no-selection are safe
Explore and Guided reuse the same adapter
  Guided copy is not in the payload
inactive tracer remains inspectable while it exists
hidden inactive glyph is not newly pickable
glyph pick does not fire placement
placement miss does not steal selection
dataset / no-decomposition fallback: V_total only
```

Do not duplicate operand validation already owned by physics
fields. Do not treat renderer highlight color as a physics
test.

---

## 22. Required verdicts

```text
selection owner:                      C
                                      interaction / lab session
                                      above Simulation and TracerScene
                                      not ExploreTracerSession-only

stable tracer ID timing:              B
                                      required before stored selection
                                      monotonic integer, not UUID
                                      index remains occupancy layout

first selection interaction:          pointer ray → visible glyph hit
                                      list is a companion, not the first 3D gesture

placement-vs-selection precedence:    glyph hit wins
                                      else Explore placement if enabled
                                      stationary click; orbit drag does not select

inspector minimum v1 payload:         Level 1 kinematics
                                      + Level 2 contributions for current DEMO
                                      world position, altitude, time, age,
                                      active, V_total, speed
                                      contributions optional in the contract,
                                      present for this model

decomposition owner:                  C
                                      composition-held named observable set
                                      same instances as the composite
                                      CompositeVelocityField stays nameless

contribution metadata owner:          composition descriptor (tokens)
                                      inspector adapter / UI (English)
                                      not physics classes
                                      not a plugin registry

environmental contribution
semantics:                            actual composite env operand
                                      live = D2 StormRelativeEnvironmentalAdvectionField
                                      not reconstructed profile+C
                                      not hodograph ground-relative wind
                                      sum(contributions) == V_total

inspection time semantics:            current position at current clock.time
                                      last completed fixed step
                                      same as renderer
                                      do not assume steady V

inactive tracer inspection:           remains inspectable while the
                                      particle exists
                                      V is field-at-point, not dx/dt
                                      hidden glyph: not newly pickable

Reset selection behavior:             preserve selectedId if it still exists
                                      (in-place cohort; ids kept)

Clear / mode-switch
selection behavior:                   Clear → clear selection
                                      Explore ↔ Guided → clear
                                      Guided replace → clear
                                      append → keep previous selection

Guided reuse:                         same inspector infrastructure
                                      claims / S1 / D1 / NG1 stay outside
                                      the shared physics contract

local-vs-column diagnostics:          A: V, V_i, local env operand,
                                        prescribed rotation velocity
                                      B: hodograph, shear, ω_h, SRH,
                                        streamwise/crosswise
                                      C: 3D curl, derived ω_z, thermo
                                      SRH not in the local card
                                      rotation ≠ diagnosed vorticity

selected visual indication:           required: selected glyph highlight
                                      later: trail highlight, optional dim
                                      not: auto-Follow, scene recreate

Follow timing:                        later, user-initiated, cancellable
                                      not this sequence
                                      not auto on select

dataset fallback:                     V_total always
                                      contributions optional / omitted

observation abstraction timing:       narrow adapter first
                                      TracerInspection as payload name
                                      no ModelObservation framework

update cadence:                       sample live (x, t) while visible
                                      on step and selection change
                                      throttle React separately
                                      one tracer only
```

---

## 23. Implementation sequence

Ordered so UI cannot key on index and cannot reconstruct fields.

```text
Slice 1 — stable identity + selection lifecycle     COMPLETE
          tracerId at birth (Simulation cohort + add)
          Reset keeps ids; Clear / new Simulation starts fresh
          TracerSelection: selectedId | null
          findTracerById / resolveSelectedTracer
          lifecycle tests from §21 (identity / Reset / Clear /
            mode-switch / append)
          history and scene stay index-aligned
          not user-facing

Slice 2 — model decomposition observation adapter   COMPLETE
          composeDemoTracersWithObservation /
            composeDemoTracerLab keep operand instances
            beside Simulation
          ExploreLab / GuidedLab hold velocityObservation
          inspectTracer → TracerInspection
          DEMO tokens in operand order; contributions optional
          sum invariant; SR env operand; no mutation
          no-decomposition fallback path
          not user-facing

Slice 3 — glyph picking + selected highlight        COMPLETE
          share world ray; glyph wins over placement
          highlight selected mesh; do not recreate scene
          preview marker not selectable
          inspector panel not required yet

Slice 4 — minimal inspector panel                   COMPLETE
          presentational TracerInspectorPanel
          App holds TracerInspection | undefined
          inspectSelectedTracer on select / step batch / Reset
          Level 1 + optional Level 2 for the live DEMO model
          empty / no-selection placeholder
          no-decomposition: hide Level 2
          inactive: panel remains; field-at-marker copy
          Explore unlabeled; Guided claim stays in catalog copy
          no Follow, no Level 3 dump, no SRH on the card
```

Slice 4 implementation shape:

```text
panel:              TracerInspectorPanel
                    inspection: TracerInspection | undefined
                    presentational; no field sampling

observation owner:  App React state
                    inspectSelectedTracer(particles, selection,
                      clock.time, velocityObservation)

select:             immediate inspect at current (x, t)
                    works while paused

step batch:         TracerViewport onSimulationAdvanced
                    once per rAF if consumed.steps > 0
                    callback in onSimulationAdvancedRef
                    scene effect deps do not include it

Reset:              keep selectedId; refresh immediately

Clear / mode:       selection null; inspection undefined

no-decomposition:   contributions omitted → hide Level 2
                    no fake seven rows

inactive:           panel remains; State: inactive
                    V is field at marker, not motion
```

**First browser-visible slice:** **3** (user can see which
tracer is selected). Slices 1–2 without 3 change nothing on
screen.

**First “why?” slice:** **4**, which consumes 1–3.

Do not implement Follow, delete-one, trail dimming, or a
probe-at-empty-point in this sequence.

---

## 24. Product / modeling status

```text
Explore point release:     remains valid
                           still unlabeled; still append + Clear
Guided catalog:            remains valid
                           still docs-only; still isolated
physics:                   remains paused (`15` D)

this SoT found:            no modeling prerequisite
                           no eighth operand
                           no tilting/stretching blocker
                           no continuity work
```

When modeling resumes, unchanged:

```text
tilting / stretching interaction architecture SoT
```

Inspector research did **not** discover a genuine modeling
prerequisite. Inspectability of the current sum is product /
architecture, as `16` §16 already said.

---

## 25. Compact lock-in

```text
inspector purpose:           read-only observation of one live
                             tracer and current model state
                             “why is it moving this way right now?”
                             not a story, not a control

selection owner:             interaction / lab session
                             renderer highlights
                             Simulation does not own selected

identity strategy:           monotonic tracerId at birth
                             selection keys by id
                             index = occupancy (history/scene)
                             no UUID; no serialization

selection interaction:       ray → visible glyph
                             glyph beats ground placement
                             stationary click

lifecycle:                   inactive: still inspectable if present
                             Reset: keep id
                             Clear / mode-switch / Guided replace:
                               clear selection
                             append: keep selection

minimum payload:             Level 1 + Level 2 for current DEMO
                             world x/y/z, altitude, time, age,
                             active, V_total, speed, V_i

decomposition strategy:      composition-held named operand set
                             same instances as integration
                             Composite stays generic / nameless
                             seven operands = current model, not
                             the inspector contract

metadata strategy:           tokens at composition
                             English at adapter / UI
                             not physics classes

time semantics:              current (position, clock.time)
                             last completed fixed step
                             pass time even if fields are steady

Guided / Explore reuse:      one adapter, one panel contract
                             Guided claims layered above
                             Explore stays descriptive

diagnostic layering:         local V / V_i now
                             column diagnostics stay hodograph
                             no SRH on the tracer card
                             rotation velocity ≠ ω_z

visual selection:            glyph highlight required
                             trail / dim later
                             no auto-Follow
                             no scene recreate

dataset fallback:            V_total always
                             contributions optional

performance / update:        one tracer; sample on step + select
                             React cadence separate
                             no optimization now

implementation sequence:     1 id + selection lifecycle COMPLETE
                             2 observation adapter COMPLETE
                             3 pick + highlight COMPLETE
                             4 Level 1+2 panel COMPLETE

first browser-visible slice: 3

first "why?" slice:          4

next product slice:          Guided runtime (`20`) when commanded
                             Follow only when commanded
                             not Level 3 dump
                             not a four-mode selector

modeling status:             paused
                             next: tilting/stretching SoT

blockers:                    none for this SoT
                             Follow blocked until commanded
                             delete-one blocked until id + history/
                               scene remap
                             3D curl / derived ω_z blocked by
                               missing diagnostic / modeling SoTs

production this slice:       Slice 4
                             shared TracerInspectorPanel
                             App observation + step-batch notify
                             not Follow / Level 3 / new physics
```

---

## 26. STOP

Slices 1–4 are complete: monotonic `tracerId` at birth,
`TracerSelection`, a headless `TracerInspection` adapter,
browser-visible glyph picking with selected highlight, and a
shared presentational Inspector panel driven by
`inspectSelectedTracer`. This SoT does not start Follow, a
timeline scrubber, delete-one, persistence, new physics,
tilting/stretching, thermodynamics, or a continuity solver.

Do not put selection on `Simulation` or `TracerScene`.
Do not key the first inspector on array index.
Do not rebuild fields inside the inspector.
Do not show ground-relative wind as the SR laboratory’s
environmental contribution.
Do not attach Guided claims to Explore tracers.
Do not stuff SRH into a local tracer card.
Do not treat prescribed rotation as diagnosed vertical vorticity.

Explore point release and the Guided catalog remain valid.
Physics remains paused.

Next work starts only when commanded.
