# V1 Scope Checkpoint

**Status:** V1 SCOPE CHECKPOINT / PRODUCT SoT /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** define the V1 product promise, inventory current
capability against live `src/**`, classify every known open
item into MUST / CONDITIONAL / POST-V1 / REJECTED, decide the
hodograph-environment question, decide the perception question,
decide the Guided question, define the feature-freeze rule, and
produce a finite ordered roadmap to `V1.0 READY`.
Not a feature-discovery checkpoint. Not a rendering redesign.
Not a physics reopen. Not a Guided catalog expansion. Not
`ROADMAP.md`.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). Exactly seven
`V_total` operands. Prescribed Ω semantics unchanged. This file
does not reopen `17`, `22`, `23`, `24`, `26`, `28`, `30`–`37`.
**Implementation:** none. Docs-only. Production `src/**`
MUST remain unchanged by this file.

Predecessor Reset View / camera recovery architecture:

```text
docs/architecture/37-reset-view-camera-recovery-architecture.md
```

Accepted implementation head this checkpoint is written
against:

```text
2b2a39e5becd3d7f62f497df918156dbe19879a7
```

Related product / model / teaching / perception SoTs
(not replaced):

```text
docs/CONCEPT.md
docs/ARCHITECTURE.md
docs/architecture/11-ground-atmospheric-domain-policy.md
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/17-guided-experiment-catalog.md
docs/architecture/18-explore-arbitrary-seeding.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/20-guided-runtime-architecture.md
docs/architecture/21-whole-product-direction-checkpoint.md
docs/architecture/22-perceptual-airflow-architecture.md
docs/architecture/23-perceptual-airflow-workbench.md
docs/architecture/24-perceptual-exploration-checkpoint.md
docs/architecture/30-model-class-decision.md
docs/architecture/31-post-model-class-product-direction-checkpoint.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/architecture/33-post-point-diagnostics-product-direction-checkpoint.md
docs/architecture/34-selected-tracer-follow-camera-architecture.md
docs/architecture/35-post-follow-live-playtest-product-direction-checkpoint.md
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/physics/23-diagnostic-vertical-vorticity.md
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
NEW PROJECT DECISION
V1 SCOPE CLASSIFICATION
REJECTED ALTERNATIVE
ANTI-CLAIM
```

This document did **not** change production code.
It does **not** create `ROADMAP.md`.
It does **not** start a selected branch.

---

## 1. Why this checkpoint exists

Every prior checkpoint (`21`, `24`, `29`, `31`, `33`, `35`)
answered the same shape of question:

```text
what is the next most valuable thing to build?
```

That question has no terminal state. It has produced a
coherent product, but it cannot say when the product is
finished.

This checkpoint asks a different question:

```text
what is the smallest honest definition of V1,
and what finite work remains to reach it?
```

The risk this file exists to prevent:

```text
not:  treat every deferred idea as eventual V1 work
not:  let "interesting physics" enter V1
not:  let "would look better" enter V1
not:  let CONCEPT's long-term vision act as a V1 backlog
not:  add a fourth Guided experiment because a topic exists
not:  add environments / overlays / operands to feel complete
not:  ship a v1.0 whose own UI says "Dev workbench"
not:  redefine V1 upward every time a playtest is comfortable
```

This checkpoint is intentionally **scope-reducing**. A feature
belongs in V1 only if removing it makes the stated V1 product
promise materially false, or causes a demonstrated failure of a
numbered acceptance task.

---

## 2. The V1 product promise

**NEW PROJECT DECISION.**

### 2.1 Exact wording

```text
Supercell Explorer V1 is an interactive, storm-relative
kinematic laboratory in which a prescribed idealized storm
flow is superposed on one fixed environmental wind profile.

The user releases passive air parcels into that flow, watches
where they go, decomposes the local velocity into the exact
seven prescribed components that produced it, and reads two
named local rotation diagnostics at a selected parcel.

Every velocity in V1 is prescribed. Nothing in V1 evolves,
generates, or responds. The diagnostics observe the flow;
they never feed it.
```

Short product line (release copy source):

```text
An idealized storm-relative flow laboratory: release a parcel,
see where the prescribed flow takes it, and read why.
```

### 2.2 What V1 is explicitly NOT

**ANTI-CLAIM.** These must never appear in V1 copy, docs,
release notes, or demo narration:

```text
a realistic supercell simulator
a forecast or nowcast model
CFD / a numerical atmospheric solver
a prognostic storm model
a model that generates its own mesocyclone
a thermodynamic / buoyancy / cold-pool simulation
a mass-consistent circulation
a same-air-mass storm life cycle
a dataset-backed physically simulated storm
```

V1 also does **not** promise whole-storm visual legibility
(§6). Its promise is interrogation, not perception of the
entire structure at a glance.

### 2.3 Why this wording and not the starting hypothesis

The starting hypothesis said "environmental flow **and**
idealized storm-flow components shape parcel trajectories."
That is accurate, but it invites the reading that the user can
vary the environment. V1 has exactly one environment
(`DEMO_SCENARIO`, §4.2, §5). The wording above says
"one fixed environmental wind profile" so the promise cannot
be read as an environment-sensitivity laboratory.

The hypothesis also said "selected vorticity diagnostics."
V1 has exactly two, with different units and different owners.
The wording says "two named local rotation diagnostics" so the
promise does not imply a diagnostic suite.

### 2.4 V1 acceptance questions

A user who knows basic severe-weather meteorology, and who has
never worked on this codebase, must be able to answer these
five questions using V1 without developer explanation.

```text
A1  Where does a parcel released at this point and altitude
    go through this idealized storm?

A2  Why is it moving this way here — which of the seven
    prescribed velocity components contribute at this point,
    and how large is each?

A3  What environment is this laboratory built on — what does
    the hodograph show, what is the prescribed storm motion,
    and what is the storm-relative wind?

A4  What are T_tilt,y and ω_y,current at this selected parcel,
    right now?

A5  Why is a tilting tendency not the same thing as existing
    vertical vorticity, and why does this product not claim
    that one produced the other?
```

A1–A5 are the **V1 acceptance frame**. §11 turns them into a
human playtest. §9 makes them the only ground on which frozen
scope may reopen.

---

## 3. Capability inventory

**Kind:** CURRENT FACT, verified against live `src/**` at
`2b2a39e`, not inferred from older docs.

Marks: `DONE` / `PARTIAL` / `MISSING` / `DEFERRED` /
`REJECTED` / `POST-V1`.

### 3.1 Product shell

| Capability | Mark | Evidence |
| --- | --- | --- |
| Explore mode | DONE | `App.tsx` `createExploreLab`; Explore-only controls gated on `lab.kind === "explore"` |
| Guided mode | DONE | `createGuidedLab`; `GuidedExperimentSelector` + `GuidedExperimentPanel` |
| Mode switching | DONE | header buttons `Guided` / `Explore`, `aria-pressed`; switch clears selection, Follow OFF, remounts scene |
| Default landing mode | DONE (fact) | `useState(() => createGuidedLab(DEFAULT_GUIDED_EXPERIMENT_ID))` — the product opens in **Guided** |
| Mode purpose signposting | **MISSING** | nothing tells a new user that release / Follow / diagnostics live only in Explore |
| Persistent model-class honesty in Explore | **PARTIAL** | subtitle names the frame, not the class; the "prescribed laboratory, not a real supercell" sentence exists only in `GuidedExperimentPanel` and in the point-diagnostics disclaimer after a tracer is selected |
| Third shell / diagnostics mode | REJECTED | `32` §18 option C |

### 3.2 Environment

| Capability | Mark | Evidence |
| --- | --- | --- |
| Hodograph panel | DONE | `HodographPanel`, SVG, `aria-label="Ground-relative hodograph"`, axes eastward/northward, height labels at knots |
| Storm motion `C` overlay | DONE | `HodographOverlayControls` checkbox; `DEMO_SCENARIO.stormMotion = (10, 0)` m/s |
| Storm-relative wind `V_sr` overlay | DONE | gated on `C` overlay |
| Horizontal vorticity `ω_h` overlay | DONE | layer fixture `[0, 1000]` m |
| Streamwise / crosswise overlay | DONE | gated on `ω_h` overlay |
| SRH | **PARTIAL** | `stormRelativeHelicityBetween` implemented and tested in `src/physics/environment/`; **not displayed anywhere in `src/ui/**`** |
| Environment fixed, not selectable | DONE (fact) | single `DEMO_SCENARIO`; five wind levels 0/1000/2000/6000/12000 m |
| Hodograph selected height | PARTIAL | `DEMO_SELECTED_HEIGHT = 0`, hard-coded; not bound to tracer altitude |
| Multiple / editable environments | MISSING → POST-V1 | §5 decision |

### 3.3 Storm flow

| Capability | Mark | Evidence |
| --- | --- | --- |
| Exactly seven operands | DONE | `composeDemoTracerFields`: environment advection, updraft, rotation, lower inflow, upper outflow, downdraft, near-ground outflow |
| `V_total` = unweighted world sum | DONE | `CompositeVelocityField` |
| Storm-relative environmental advection | DONE | `StormRelativeEnvironmentalAdvectionField`, `IntegrationFrame.StormRelativeLaboratory` |
| Vertical-envelope updraft / rotation / downdraft | DONE | `VerticalEnvelope*Field` |
| Lower inflow / upper outflow / near-ground outflow | DONE | radial fields with vertical envelopes |
| Prescribed Ω | DONE (locked) | `angularVelocity = 0.005` rad/s; `Ω1`/`Ω2` only (`30` §5.5) |
| Integrator | DONE | `EulerIntegrator`, `dt = 0.1` s external; `RK2Integrator` exists but is test-only |
| Ground domain `y ≥ 0` | DONE | `AtmosphericTracerDomain`; clip + deactivate |
| Horizontal / far-field domain | MISSING by design | no X/Z bound; `11`, `35` §10 |
| Prognostic state, ω→V, continuity, thermo, pressure, microphysics | ABSENT by class | `30`; confirmed by absence of modules |

### 3.4 Parcel interaction

| Capability | Mark | Evidence |
| --- | --- | --- |
| Point release (ground pick → preview → Confirm) | DONE | `ExplorePointReleaseControls`, `ExplorePointReleaseTool` |
| Altitude input | DONE | default `1000` m, step 100, min 0 |
| Cancel pending / Clear all | DONE | buttons; Clear removes all tracers and lanes |
| Pause / Resume | DONE | `TracerRuntimeControls` |
| Simulation Reset (cohort replay) | DONE | camera unchanged by contract (`34`) |
| Time scale 1× / 5× / 10× / 20× | DONE | `TRACER_TIME_SCALES` |
| Pathlines / trails | DONE | `TracerPathHistory`; unbounded until Reset/Clear |
| Picking | DONE | screen-space, `PICK_TOLERANCE_PX = 16` (`36` Slice 1) |
| Selection identity | DONE | stable `tracerId`; occupancy colors preserved (`36` Slice 2) |
| Selection halo | DONE | `SELECTION_HALO_COLOR = 0xffcc66`, radius × 1.6 |
| Follow | DONE (Explore) | `ExploreFollowControl`; offset-preserving orbit center (`34`) |
| Reset View | DONE (Explore) | `ExploreResetViewControl`; Follow OFF then `TracerScene.resetView()` (`37`) |
| Remove last tracer | MISSING → POST-V1 | append-only + clear-all by design (`18`, `35` §8) |
| Keyboard path to release / select | MISSING | both are pointer-only on the canvas |

### 3.5 Observation

| Capability | Mark | Evidence |
| --- | --- | --- |
| Inspector L1 (motion) | DONE | id, position, altitude, sim time, age, state, `V_total`, speed; both modes |
| Inspector L2 (why this motion) | DONE | exactly seven labelled operand rows with `V_i` and `\|V_i\|` |
| Point diagnostics `T_tilt,y` | DONE (Explore) | `PointDiagnosticsPanel`, s⁻², sign word |
| Point diagnostics `ω_y,current` | DONE (Explore) | s⁻¹, sign word |
| Tendency ≠ existence disclaimer | DONE | four-paragraph block including "T1 does not generate ω_y,current" |
| Field-at-marker anti-claim | DONE | "Sampled from the laboratory field at this marker. Not stored on the tracer." |
| Inspector L3 (env / column) | MISSING (reserved) | `19`, `32` §5.2 — v1 does not start it |
| Free 3D probe | REJECTED for v1 | `32` §4 option B |
| Two-tracer comparison | MISSING | `32` |
| Diagnostic overlay / slice / heatmap | DEFERRED | `31` §5.3, `33` §6, `35` §11 |

### 3.6 Guided

| Capability | Mark | Evidence |
| --- | --- | --- |
| Exactly three experiments | DONE | `inflow-to-upper-outflow`, `downdraft-path-to-ground`, `near-ground-outflow` |
| Curated seeds per experiment | DONE | S1+S2 / D1 / NG1 with per-experiment trail and glyph policy |
| Teaching copy | DONE | title, honesty line, `Observe`, `Demonstrates`, `Does not mean` |
| Honesty line | DONE | "This is a prescribed storm-relative laboratory, not a real supercell simulation." |
| Inspector in Guided | DONE | L1 + L2 available |
| Pause / Reset / speed / orbit in Guided | DONE | `17` §7 required controls |
| Guided Point diagnostics | MISSING → POST-V1 | `32`, `35` H |
| Guided Follow | MISSING → POST-V1 | `34`, `35` I |
| Guided Reset View | MISSING → POST-V1 | `37` §8.1 option C |
| Guided visual airflow population | MISSING → POST-V1 | Guided renders curated tracers + grid only |
| Fourth experiment | not earned | `17` §15 |

**What Guided teaches today:** three prescribed pathline
stories with explicit allowed claims and forbidden readings,
plus the model-class honesty line.

**What Guided does not teach:** how to release a parcel, how to
select one, Follow, Reset View, how to read L2, that point
diagnostics exist, and what the hodograph is for.

### 3.7 Perception / visualization

| Capability | Mark | Evidence |
| --- | --- | --- |
| Default Explore encoding | DONE (provisional) | `points` — uniform grey; `24` §2.1 notes no direction cue and pause collapse |
| Advected oriented marks | DONE (prototype) | `24` §2.2 |
| Comets | DONE (provisional) | `24` §2.3 strongest current representation, explicitly not a product lock-in |
| Eulerian oriented marks | DONE (diagnostic) | `24` §2.4 |
| Operand tint / highlight (six storm operands) | DONE (diagnostic) | `24` §2.6–§2.7; `environmentAdvection` intentionally absent |
| Depth cue | DONE | checkbox |
| Pause-viz mode | DONE | full freeze vs animate frozen field; final Pause UX NOT DECIDED (`24` §3) |
| Background operand highlight | **REJECTED** | `24` §2.5; `OperandHighlightBackgroundScene` exists but is never constructed |
| Product visualization surface | **MISSING** | the live control group's own user-visible copy reads "Dev workbench — … Not product visualization modes"; the component doc reads "Temporary Explore-only research control" |
| Multi-operand display, palette, streamlines, LIC, volumes, cloud | NOT STARTED → POST-V1 | `24` §3 |

### 3.8 Recovery / UX

| Capability | Mark | Evidence |
| --- | --- | --- |
| Camera recovery after Follow | DONE | Reset View (`37`) |
| Selection acquisition | DONE | screen-space pick (`36`) |
| Identity continuity through Follow A→B | DONE | occupancy color + halo (`36`) |
| Responsive layout | PARTIAL | breakpoints at 520 / 840 / 1240 px in `app.css`; three-column workbench above 1240 |
| Accessibility primitives | PARTIAL | `aria-label`, `aria-pressed`, `fieldset`/`legend`, label association present; canvas actions unreachable by keyboard |
| Scene-to-controls priority | **PARTIAL / suspect** | `.tracer-viewport` is a fixed `height: 420px` beneath a vertically stacked four-group toolbar; the inspector column is far taller |
| Point diagnostics fold position | **PARTIAL / suspect** | panel sits below L1 + seven L2 rows; only `.tracer-inspector` is sticky, not `.point-diagnostics` (`33` §3.3) |
| Explore empty state | **MISSING** | Explore opens with zero tracers, two placeholders, and no instruction to enable placement |
| Disabled-state reasons | MISSING | Follow / Confirm / Cancel disable silently |
| Terminology consistency | **PARTIAL** | `Reset` (simulation) vs `Reset View` (camera) vs `Clear`; `tracer` vs `marker` vs `parcel`; `Speed` = time scale |
| README / release docs | **MISSING** | no `README.md`; `package.json` version `0.0.1` |

### 3.9 Inventory summary

```text
model / physics for the V1 class:     essentially complete
core interaction loop:                complete
observation of V_total and T1/A:      complete for a selected
                                      Explore parcel
Guided teaching of three pathlines:   complete
product surface honesty:              incomplete
onboarding / empty states:            incomplete
release artifacts:                    absent
```

The remaining V1 gap is **not** capability. It is product
surface, honesty placement, and release readiness.

---

## 4. Classification of all known open work

**V1 SCOPE CLASSIFICATION.** Every item is in exactly one
bucket.

```text
A  V1 MUST         removing it makes the §2 promise materially
                   false, or blocks an §11 acceptance task
B  V1 CONDITIONAL  enters V1 only on a named validation failure
C  POST-V1         useful; V1 is coherent without it
D  REJECTED / OUT  conflicts with the V1 class or architecture
   OF MODEL CLASS
```

### 4.1 A — V1 MUST

Exactly five items. Nothing else is V1 MUST.

```text
M1  Persistent model-class honesty on the product surface
    Both modes state, without requiring a selection or a
    Guided panel, that the storm flow is prescribed and
    idealized and that nothing is simulated or generated.
    Why MUST: acceptance question A5 and task T10; CONCEPT §9
    requires the synthetic category to be identified as such.
    Scope: copy + placement. No new component families.

M2  Resolve the Explore visual-airflow surface into a product
    state
    Name one product default encoding; demote or remove the
    remaining encodings behind an explicit advanced/diagnostic
    label; delete user-visible "Dev workbench / Not product
    visualization modes" copy.
    Why MUST: a v1.0 whose own UI declares itself non-product
    cannot be released, and A1/A2 are read against whatever
    field is on screen.
    Scope: decision + presentation. NO new rendering geometry,
    NO new encodings, NO multi-operand display, NO overlay.

M3  Whole-product UX/UI consolidation — functional items only
    Information hierarchy, scene-vs-controls priority,
    Explore/Guided signposting, empty states, disabled-state
    reasons, terminology, recovery-path discoverability,
    Inspector + Point diagnostics density, teaching-copy
    consolidation pass.
    Why MUST: §3.8 lists live gaps that gate tasks T1, T3, T5,
    T8. Cosmetic polish is explicitly NOT in this item (§8).

M4  Release audit and documentation
    README; a "what this is / what it is not / known limits"
    surface; docs↔code status reconciliation; agent-control
    sediment sweep; accessibility basics audit; physics /
    regression audit; `npm test` + `npm run typecheck` green.
    Why MUST: v1.0 is a release, not a branch state.

M5  Recorded human acceptance playtest (§11) with blocking
    failures fixed
    Why MUST: the promise in §2 is a claim about a user, and
    only a user can falsify it.
```

Note: M1 and M3 both touch copy. M1 is listed separately
because it is an honesty contract, not a layout preference; it
must survive any later UX rework.

### 4.2 B — V1 CONDITIONAL

Each item names the validation whose failure admits it.

| Item | Admitted only if |
| --- | --- |
| Larger / resizable 3D viewport; scene-first layout | Task T5 or T6 fails for ≥2 of 3 testers **because** the 420 px canvas makes selecting or following impractical, and layout reordering inside M3 does not fix it |
| Point diagnostics repositioning or stickiness beyond M3 | Task T8 fails because the user cannot read `T_tilt,y` / `ω_y,current` while the parcel is visible |
| Explore starting cohort (pre-released tracers) | Task T3 fails because the user cannot discover release from empty-state copy alone |
| Responsive/layout work beyond existing breakpoints | The playtest is run on a target device where an acceptance task fails for layout reasons |
| Guided → Explore handoff control (beyond copy) | Task T1 fails because the user cannot reach the mode where release and diagnostics live |
| RK2 or integrator change | The Phase 5 physics audit measures an Euler `dt = 0.1` error that materially changes a displayed path or a displayed diagnostic value |
| SRH numeric readout on the hodograph | Task T2 fails specifically because storm-relative environmental information is unreadable without it |

Nothing else may become CONDITIONAL retroactively.

### 4.3 C — POST-V1

Coherent V1 exists without every item here. Unranked.

```text
INTERACTION
  Remove last tracer / delete selected / release management
  tracer roster / table / G1 G2 G3 naming
  region or layer classification of tracers
  Align camera with tracer motion
  designed product pan control
    (unlabeled OrbitControls pan already exists)
  free 3D diagnostic probe (rejected for v1 in `32`)
  click-empty deselect
  line / plane / volume seeding
  keyboard / AT parity for canvas release and selection
  time scrub / timestep navigation

VISUALIZATION
  final perception decision beyond the M2 product default
  visual-airflow representation polish
  comet revisit and final comet geometry
  selection halo polish
  multi-operand simultaneous display
  final product palette / color picker
  final Pause-viz UX
  diagnostic overlays / slices / heatmaps / contours / LIC
  streamlines, volumes, cloud layer, layer composition
  Guided visual airflow population
  purely cosmetic visual polish

TEACHING
  Guided Point diagnostics mount
  Guided Follow control
  Guided Reset View control
  Inspector L3 (environment / column)
  Ω = 0 teaching exhibit
  a fourth or later Guided experiment
  cinematic Journey genre / first-person ride
  sound / sonification
  hodograph selected height bound to tracer altitude
  in-product physics-derivation reading surface

ENVIRONMENT / SCENARIOS
  2–3 curated environmental / hodograph scenarios (§5)
  editable hodograph
  arbitrary scenario editor
  named storm-region vs lifecycle-domain semantics
  far-field / domain policy checkpoint

PHYSICS / DYNAMICS (post-V1 only inside a named later SoT)
  stretching diagnostic as honest bookkeeping
  further T1 siblings / optional L1 literacy

DATA / DATASETS
  dataset-backed velocity source adapter
  dual-source product mode

PLATFORM / RELEASE
  persistence / deep-link / shareable state
  a `GuidedExperiment` catalog data type / CMS shape
  performance budget work beyond audit findings
```

### 4.4 D — REJECTED / out of V1 model class

Not merely postponed. These conflict with the V1 class in `30`
or with an accepted architecture decision.

```text
an eighth prescribed velocity operand
T2 / any prognostic tendency integrated into state
prognostic ω
ω → V inversion
continuity / mass-consistency solver
thermodynamics, temperature, moisture
pressure / density / buoyancy
precipitation / microphysics
translating-storm integration frame (D3)
auto-deactivation of tracers "far from the storm"
  (inactive := far is rejected; `35` §10)
background operand highlight (`24` §2.5)
auto-select newest released tracer (`32`)
auto-recenter camera on Follow OFF / Clear / sim Reset
  (`35`, `37`)
occupancy / mark count as a contribution or density encoding
  (`22`, `24` §2.10)
Guided cards combining two or three experiments (`17` §14)
free 3D probe as a v1 observation origin (`32` §4)
```

Rejection here is scoped to V1. `30` still allows a later
named source-class or dynamics-class SoT; that SoT would be a
different product class, not a V1 amendment.

---

## 5. The hodograph / environment question

**Explicit analysis. NEW PROJECT DECISION at §5.5.**

### 5.1 The concern, stated precisely

One fixed `DEMO_SCENARIO` means the hodograph and the 3D storm
are linked but not comparable. The user cannot run:

```text
what changes if the environmental shear / hodograph changes?
```

### 5.2 What would actually change in the model

**CURRENT FACT.** If only `environment.windLevels` changed:

| Quantity | Changes? |
| --- | --- |
| Operand 1, `StormRelativeEnvironmentalAdvectionField` | **Yes** |
| Parcel trajectories | **Yes**, via operand 1 |
| Hodograph, `ω_h`, streamwise/crosswise, SRH | **Yes** |
| `T_tilt,y` (uses env `ω_h` × updraft gradient) | **Yes** |
| Updraft, rotation, lower inflow, upper outflow, downdraft, near-ground outflow | **No** |
| `ω_y,current` (Candidate A = rotation-only evaluator) | **No** |
| Prescribed Ω, envelope geometry, storm scale | **No** |

Storm motion `C` is a separate scenario field. A second
environment would force a choice: keep `C = (10, 0)`, which a
meteorologist will read as wrong for a different hodograph, or
compute a deviant motion — which would require a Bunkers-class
rule this project does not have and would be a **new physics
claim** requiring its own SoT and validation.

### 5.3 Option assessment

| Criterion | A. one fixed environment | B. 2–3 curated scenarios | C. editable hodograph |
| --- | --- | --- | --- |
| Educational value for A1–A5 | Sufficient — A1–A5 never ask an environment-sensitivity question | Adds one genuine controlled comparison (advection + T1) | Highest breadth; lowest control |
| Causal claim implied by the UI | None beyond what the model contains | **Hazardous** — a changed hodograph beside an unchanged mesocyclone implies either "the storm responded" (false) or "shear does not matter" (false) | Same hazard, continuously and unlabelled |
| Consistency with prescribed operands | Exact | Requires copy stating that six of seven operands and Ω are literally identical | Very hard to state continuously |
| Would storm components need to change? | No | **Scientifically, yes** — and doing so is out of class A; not doing so is the hazard above | Same |
| Storm motion policy | Settled | **Unsettled** — needs a new decision or a new rule | Unsettled per edit |
| Architecture cost | Zero | LOW–MEDIUM — `ScenarioConfig` is already parameterized, `DEMO_SCENARIO` is one constant | MEDIUM — validation, live re-derivation, undo |
| Validation cost | Zero | **HIGH** — the three Guided claims (`08`, `12`, `14`), the T1 DEMO field validation research, the Candidate A geometry, the visual-airflow volume, the rest-pose framing, and the seven-operand acceptance tests are all DEMO-tuned | VERY HIGH — nothing can be pre-validated |
| Risk of implying absent physics | LOW | **HIGH** | **HIGH** |

Option D considered and rejected as a V1 answer: exposing
`DEMO_SCENARIO` read-only as a "current environment" data panel
adds numbers but no comparison, and adds surface during a
consolidation phase.

### 5.4 What a user could and could not legitimately infer under B

Recorded now so a later B implementation does not have to
rediscover it.

```text
MAY infer
  parcel trajectories differ because environmental transport
    differs
  T_tilt,y differs because environmental ω_h differs while the
    updraft gradient is identical
  the hodograph, ω_h, streamwise/crosswise and SRH are
    properties of the sounding, independent of the storm here

MAY NOT infer
  the storm's rotation changed
  the updraft strengthened or weakened
  the storm structure responded to the environment
  a mesocyclone is more or less likely
  streamwise vorticity produced this rotating updraft
```

The hazard is not that a controlled environmental perturbation
is illegitimate — it is legitimate as a laboratory perturbation
of advection and tilting tendency. The hazard is that a
severe-weather-literate user arrives with the expectation
"more streamwise vorticity → stronger, more persistent
mesocyclone," and V1 would show that expectation being
violated by construction, silently.

### 5.5 Decision

```text
V1 uses OPTION A: one canonical fixed environment
(DEMO_SCENARIO), not selectable and not editable.

2–3 curated environmental scenarios are POST-V1 and require
their own SoT that first settles:
  storm-motion policy per scenario
  Guided experiment pinning (the three claims are DEMO-validated)
  the explicit may/may-not-infer copy in §5.4
  re-validation of T1 field research and Candidate A geometry

Editable hodograph and an arbitrary scenario editor are POST-V1
and are not implied by the curated-scenario SoT.
```

The §2 promise is written so that A is not a shortfall: V1
never promises environment sensitivity. The controlled
comparisons V1 does support — release point, altitude, and
position within one environment — are consistent with the
promise and with A1–A5.

---

## 6. The perception / visualization question

### 6.1 The honest answer to the posed test

Can a new target user visually understand environmental
transport, inflow, ascent, rotation, upper outflow, downdraft,
near-ground outflow, and a parcel's path relative to those
structures, using the current product?

```text
NO — not from the visual field alone.
```

Evidence, not aesthetics:

```text
Explore default encoding is uniform grey points; `24` §2.1
  records that they carry no instantaneous direction cue and
  collapse to a pixel cloud on Pause
`24` §2.7 records that even with per-operand tint, structural
  role in the whole storm "takes active visual search and does
  not by itself yield a sufficient picture of entire-storm
  structure"
Guided renders no airflow population at all — only curated
  tracers and the grid
comets, the strongest current representation, are opt-in,
  behind controls whose own copy calls them non-product
```

### 6.2 Why this does not make perception a V1 MUST program

The V1 promise (§2) does not claim whole-storm visual
legibility. It claims that a user can **interrogate** the flow:
follow a parcel, decompose its velocity into seven named
components with magnitudes, read the environment on the
hodograph, and read two diagnostics at a point.

Mapped to the acceptance questions:

| Question | Answered by |
| --- | --- |
| A1 | parcel glyph + pathline + Follow + Reset View |
| A2 | Inspector L2, seven rows, numeric |
| A3 | hodograph panel + overlays |
| A4 | Point diagnostics panel |
| A5 | Point diagnostics disclaimer + Guided honesty copy |

None of A1–A5 requires the seven operands to be visually
separable in the 3D scene. The structure is legible
**numerically and by trajectory**, which is exactly what a
prescribed kinematic laboratory can honestly offer. `24`
already decided that further `V_total` visual grammar should
wait for richer model structure — and `30` decided that richer
model structure is not coming in this class.

Promoting whole-storm perception to V1 MUST would therefore
schedule a rendering program that `24` deferred for reasons
that are still true.

### 6.3 The smallest V1 MUST perception task

```text
M2 — resolve the Explore visual-airflow surface into a
     product state.

Required outcome:
  one named product default encoding
  remaining encodings either removed from the product surface
    or grouped under an explicit advanced / diagnostic label
  no user-visible copy describing the product as a dev
    workbench or as "not product visualization modes"
  the chosen default must not degrade selected-glyph or halo
    visibility (`36` contracts stay intact)

Candidate defaults, to be decided in the successor SoT:
  keep `points`     — cheapest, currently shipped, weakest
  promote `comets`  — `24` §2.3 strongest provisional; `33`
                      §3.3 warns comets + tint can compete
                      with the selected glyph

Explicitly NOT in M2:
  new rendering geometry
  new encodings
  multi-operand display
  final palette
  Guided airflow population
  any diagnostic overlay
```

### 6.4 Diagnostic overlays are not perception

**ANTI-CLAIM.** T1 / Candidate A spatial overlays, slices, and
heatmaps must not enter V1 through the perception door. They
remain POST-V1 with their own unchanged objections: unit
mismatch (s⁻² vs s⁻¹), DEMO overfitting, prescribed-Ω
bookkeeping, and false-causality reading (`31` §5.3, `33` §6,
`35` §11).

---

## 7. The Guided question

### 7.1 Assessment

Are exactly three experiments enough to onboard a user into
A1–A5?

| Acceptance question | Guided coverage today |
| --- | --- |
| A1 where does a parcel go | **Strong** — all three experiments are exactly this |
| A2 which components contribute | **Partial** — Inspector L2 is mounted in Guided, but no Guided copy tells the user to select a tracer and read it |
| A3 what is the environment | **Weak** — the hodograph is on screen in both modes; no Guided experiment refers to it |
| A4 read T1 / ω_y | **None** — Point diagnostics are Explore-only |
| A5 tendency ≠ existence | **Indirect** — the honesty line and `Does not mean` blocks carry model-class honesty, not this specific distinction |

### 7.2 Decisions

```text
The three-experiment catalog is PRESERVED for V1.
No fourth experiment. No Ω = 0 exhibit. No experiment merge
or split. `17` remains the catalog SoT.

Guided does NOT mount Point diagnostics for V1.
  Reason: the diagnostics carry an Explore-scoped anti-claim
  block; mounting them inside curated exhibits risks exhibit
  contamination (`32`, `35` H). A4 is an Explore task.

Guided does NOT mount Follow or Reset View for V1.
  Reason: the three exhibits are framed for the shared rest
  pose (`17` §10); experiment switch already remounts to it;
  Follow in Guided is "desirable later" (`17` §7).

Teaching copy DOES receive one final consolidation pass,
inside M3.
  Scope: terminology alignment across Guided copy, Explore
  copy, Inspector labels and diagnostics copy; a short
  "what this mode is for" line per mode; the M1 honesty
  placement. NOT rewriting the three allowed claims, which
  are validated in `08`, `12`, `14`.
```

### 7.3 What Explore must teach by discovery

Since Guided is not being extended, Explore must make these
discoverable through empty states, labels and copy — this is
M3 work, not new features:

```text
that this is where parcels are released
that placement must be enabled before a ground click
that selecting a parcel is what fills Inspector and Point
  diagnostics
that Follow needs a selection, and Reset View undoes it
that `Reset` is the simulation and `Reset View` is the camera
```

---

## 8. UX/UI consolidation

Treated as one whole-product question. **This section does not
authorize implementation.**

### 8.1 Functional UX blockers (candidates for M3)

Each is a live fact from §3.8, and each maps to an acceptance
task.

```text
F1  Explore empty state gives no path to the primary action
    (release). Blocks T3.
F2  Model-class honesty is not persistent in Explore; it
    appears only after selecting a tracer. Blocks T10. (= M1)
F3  A user-visible control group calls itself a dev workbench
    and "not product visualization modes". Blocks release
    credibility; contaminates T7. (= M2 surface)
F4  Scene-to-controls priority: fixed 420 px canvas beneath a
    stacked four-group toolbar, while selection, Follow and
    Reset View all happen inside that canvas. Risks T5, T6.
F5  Point diagnostics sit below L1 + seven L2 rows and are not
    sticky, so the anti-claim and the numbers can be below the
    fold while the parcel moves. Risks T8, T9.
F6  Mode discoverability: the product opens in Guided; nothing
    says Explore is where release and diagnostics live.
    Risks T1.
F7  Terminology collisions: Reset / Reset View / Clear;
    tracer / marker / parcel; Speed as time scale.
    Risks T4, T6.
F8  Disabled controls give no reason (Follow without a
    selection; Confirm/Cancel without a pending seed).
    Risks T5.
F9  No README and no in-product "what this is / what it is
    not / known limits" surface. Blocks T10 and release. (= M4)
```

F4 and F5 are listed as **risks**, and their remedies beyond
reordering are V1 CONDITIONAL (§4.2). F1, F2, F3, F6, F7, F8
are M3/M1/M2 work.

### 8.2 Cosmetic polish — POST-V1

```text
palette and color system
typography and spacing refinement
iconography
selection halo styling
comet art
animation and transitions
dark theme
hover / micro-interaction states beyond legibility
```

Distinguishing rule:

```text
FUNCTIONAL   the user cannot complete, find, or correctly
             interpret a V1 acceptance task
COSMETIC     the user completes the task and misreads nothing;
             it simply looks unrefined
```

### 8.3 Accessibility basics

Audit-level only, inside M4:

```text
every control reachable and operable by keyboard
visible focus
label / aria association verified (largely present already)
disabled states announced with reasons (overlaps F8)
colour is never the only carrier of meaning in the panels
```

**Known V1 limitation, to be documented rather than solved:**
parcel release and parcel selection are pointer-only canvas
interactions. A keyboard/AT path for them is POST-V1.

---

## 9. V1 feature freeze rule

**NEW PROJECT DECISION. Final wording.**

```text
FREEZE TAKES EFFECT
  when M2 is merged (end of Phase 1).
  M1, M3, M4 and M5 are already inside V1 scope and are not
  blocked by the freeze; the freeze closes the V1 scope list
  to new entries, it does not pause remaining V1 MUST work.

AFTER FREEZE, a new user-visible capability, control, encoding,
diagnostic, scenario, experiment, operand, or physics term may
enter V1 only if ALL FOUR hold:

  1. a recorded acceptance playtest (§11) was run with a target
     user who has not worked on this codebase;
  2. it shows a reproducible failure of a numbered acceptance
     question A1–A5 or acceptance task T1–T10, failing for at
     least two of three testers;
  3. the failure cannot be fixed by copy, labelling, layout,
     ordering, or default values;
  4. the smallest sufficient change is chosen, and is recorded
     as a dated amendment to this checkpoint carrying the
     failure evidence.

INSUFFICIENT GROUNDS, individually or combined:
  "would be useful"
  "looks better"
  "interesting physics"
  "could teach more"
  "it is cheap"
  "the architecture already supports it"
  "a reviewer suggested it"
  "CONCEPT mentions it"
  "we deferred it three checkpoints ago"
  developer intuition without a recorded playtest

NOT FEATURES, therefore never frozen:
  defect fixes
  correctness fixes in existing displayed quantities
  tests
  documentation
  accessibility fixes from the M4 audit
  copy and layout changes inside M3
```

---

## 10. Finite V1 roadmap

Ordered. Derived from §3 evidence and §4 classification.
Terminal state exists.

### Phase 1 — Close the remaining functional V1 blocker

```text
goal            resolve the Explore visual-airflow surface into
                a product surface (M2)
entry           this checkpoint merged
exit            one named product default encoding is live;
                no user-visible copy describes the product as a
                dev workbench or as non-product modes;
                `36` selection / halo contracts still pass
architecture    YES — one successor SoT (§12 next artifact)
SoT needed
production      YES, after that SoT
work
```

### Phase 2 — Feature freeze

```text
goal            close the V1 scope list
entry           Phase 1 exit
exit            freeze declared in this file's status line;
                remaining V1 scope is exactly M1, M3, M4, M5
architecture    NO
SoT needed
production      NO
work
```

### Phase 3 — Whole-product UX/UI consolidation

```text
goal            M1 + M3: honesty placement, information
                hierarchy, signposting, empty states, disabled
                reasons, terminology, teaching-copy pass
entry           Phase 2 exit
exit            F1, F2, F3-copy, F6, F7, F8 closed;
                F4 and F5 either closed by reordering or
                explicitly deferred to the Phase 4 verdict
architecture    YES — one consolidation SoT listing the exact
SoT needed      functional items and their contracts
production      YES
work
```

### Phase 4 — Integrated human acceptance playtest

```text
goal            run §11 with 2–3 target users; record verdicts
entry           Phase 3 exit
exit            a dated report under docs/reviews/ recording
                per-task outcomes; all blocking failures either
                fixed or admitted through §9 as CONDITIONAL
                items with evidence
architecture    NO (unless a CONDITIONAL item is admitted, in
SoT needed      which case that item gets a scoped SoT)
production      ONLY blocking fixes
work
```

### Phase 5 — Physics, regression, accessibility and docs audit

```text
goal            M4 audit half: verify every displayed quantity
                against its physics SoT; verify docs status
                claims against live code; accessibility basics;
                agent-control sediment sweep;
                `npm test` and `npm run typecheck` green
entry           Phase 4 exit
exit            a dated audit report; no open discrepancy
                between a displayed quantity and its SoT; no
                doc claiming an implementation status the code
                contradicts
architecture    NO
SoT needed
production      ONLY fixes found by the audit
work
```

### Phase 6 — Release cleanup and v1.0

```text
goal            M4 release half: README; "what this is / what
                it is not / known limits" surface; version;
                successor pointers and statuses finalised
entry           Phase 5 exit
exit            V1.0 READY
architecture    NO
SoT needed
production      docs, copy and version only
work
```

### Terminal state

```text
V1.0 READY
  = §2 promise is true of the shipped product
  + M1–M5 complete
  + §11 acceptance test passed or its failures admitted and
    resolved under §9
  + Phase 5 audit clean
  + Phase 6 release artifacts exist
```

There is no Phase 7. Post-V1 work starts from §13, not from
this roadmap.

---

## 11. V1 human acceptance test

A human playtest, not only automated tests.

### 11.1 Setup

```text
target user     knows basic severe-weather meteorology and can
                read a hodograph; has never worked on this
                codebase; has not read these docs
testers         2–3 independent users
facilitation    none — no developer explanation, no hints, no
                answering questions during the run
                the observer records only
input           the running product and nothing else
recording       per-task pass / fail / partial, with the
                observed cause of each failure
```

### 11.2 Tasks

```text
T1   Enter the mode where parcels can be released and
     diagnostics read (Explore), unaided.
T2   Say what the hodograph represents — that it is the
     ground-relative environmental wind profile of this
     laboratory. Naming storm motion C is a pass; deriving SRH
     is not required.
T3   Release a parcel intentionally at a chosen ground point
     and a chosen altitude.
T4   Run, pause, change speed, and reset the laboratory, and
     say what Reset restored.
T5   Select the intended parcel — the one they meant, not
     whichever one got picked.
T6   Follow that parcel, then recover the storm view, and
     state that Reset View moved the camera and not the
     simulation.
T7   Read V_total and its seven contributions, and name which
     contribution dominates at the parcel's current position.
T8   Find and read T_tilt,y and ω_y,current for the selected
     parcel, with their units.
T9   Explain, in their own words, that a tilting tendency is
     not the same thing as vertical vorticity that already
     exists, and that this product does not claim one produced
     the other.
T10  State that the storm here is idealized and prescribed —
     not a simulated, forecast, or self-generating storm.
```

### 11.3 Success criteria

```text
PASS            every task completed unaided by at least two of
                three testers
BLOCKING FAIL   T9 or T10 fails for any tester
                (an honesty failure is always blocking)
TASK FAIL       a task fails for two or more testers
PARTIAL         completed only after re-reading on-screen copy;
                recorded, not blocking
```

### 11.4 What failures may reopen V1 scope

```text
An honesty failure (T9, T10) reopens copy and placement work
  immediately; it never reopens features or physics.

A task failure reopens scope only through §9: it must be
  irreducible to copy, labelling, layout, ordering or defaults,
  and it admits only the smallest sufficient change, drawn
  first from the §4.2 CONDITIONAL list.

A task failure never authorises:
  a new Guided experiment
  a new prescribed operand
  a diagnostic overlay
  an additional environment
  a rendering redesign
unless §9's four conditions are all satisfied and recorded.
```

---

## 12. Final decision

1. **What exactly is V1?**
   An interactive storm-relative kinematic laboratory in which
   a prescribed idealized storm flow is superposed on one fixed
   environmental wind profile; the user releases passive
   parcels, decomposes their local velocity into exactly seven
   prescribed components, and reads `T_tilt,y` and
   `ω_y,current` at a selected parcel. Full wording in §2.1.

2. **What remaining work is MUST before V1?**
   Exactly five items: M1 persistent model-class honesty;
   M2 product state for the visual-airflow surface;
   M3 functional UX/UI consolidation; M4 release audit and
   documentation; M5 recorded human acceptance playtest with
   blocking failures fixed. No new capability is MUST.

3. **Is a single fixed hodograph / environment acceptable for
   V1?**
   **Yes.** Option A. Curated scenarios and an editable
   hodograph are POST-V1 with a named SoT prerequisite (§5.5).

4. **Is another physics feature required before V1?**
   **No.** T1 and Candidate A remain closed; seven operands
   remain locked; Ω remains prescribed. Nothing in §4.4 enters
   V1.

5. **Is another Guided experiment required?**
   **No.** The three-experiment catalog is preserved. Only a
   copy consolidation pass inside M3.

6. **Is a diagnostic overlay required?**
   **No.** POST-V1, with its objections unchanged.

7. **Is whole-product UX/UI consolidation required?**
   **Yes**, as a bounded phase covering functional items only
   (§8.1). Cosmetic polish is POST-V1.

8. **When does feature freeze happen?**
   When M2 merges, at the end of Phase 1. The freeze closes the
   scope list; it does not pause M1, M3, M4, M5.

9. **What reopens scope after freeze?**
   Only a recorded acceptance-playtest failure meeting all four
   conditions in §9. Usefulness, aesthetics, interest, and
   teaching ambition do not.

10. **What exact artifact/task comes NEXT after this
    checkpoint?**

```text
docs/architecture/39-v1-visual-airflow-product-state-architecture.md

docs-only SoT that decides the M2 product default encoding,
the fate of the remaining research encodings, the operand
highlight's product status, and the copy contract that removes
the dev-workbench language.

NOT a rendering redesign.
NOT the UX consolidation SoT.
NOT an overlay.
NOT Guided airflow.
NOT implementation.
```

11. **Does this checkpoint authorize implementation?**

```text
NO.
```

12. **Approximate V1 readiness** (planning estimates, not
    scientific metrics):

```text
core architecture      90%   ports, ownership and contracts are
                             settled; no framework gap remains
physics / model        95%   complete for class A; only the
                             Phase 5 audit remains
interaction            85%   release, select, Follow, Reset View
                             complete; remove-last and keyboard
                             parity are out of scope
teaching               70%   Guided catalog complete; Explore
                             onboarding and honesty placement
                             missing
UX / UI                55%   functional consolidation not
                             started; dev-labelled controls on
                             the product surface
validation / release   25%   no README, no acceptance playtest,
                             no release audit, version 0.0.1
overall                ~70%
```

---

## 13. POST-V1 parking lot

Compact and structured, so V1 work does not keep
reconsidering these. Grouped, deliberately **unranked**.

```text
INTERACTION
  remove last / delete selected / release management
  tracer roster, table, G1 G2 G3 naming
  region or layer classification of tracers
  align camera with tracer motion
  designed product pan control
  free 3D diagnostic probe
  click-empty deselect
  line / plane / volume seeding
  keyboard and AT parity for canvas actions
  time scrub / timestep navigation

VISUALIZATION
  final perception decision beyond the M2 default
  comet revisit and final geometry
  halo polish
  multi-operand simultaneous display
  final palette and Pause-viz UX
  diagnostic overlays, slices, heatmaps, contours, LIC
  streamlines, volumes, cloud, layer composition
  Guided visual airflow population

TEACHING
  Guided Point diagnostics
  Guided Follow
  Guided Reset View
  Inspector L3 (environment / column)
  Ω = 0 exhibit
  additional Guided experiments
  cinematic Journey genre, first-person ride
  sound and sonification
  hodograph height bound to tracer altitude

ENVIRONMENT / SCENARIOS
  2–3 curated environmental / hodograph scenarios
  editable hodograph
  arbitrary scenario editor
  far-field / storm-region semantics checkpoint

PHYSICS / DYNAMICS
  stretching diagnostic as honest bookkeeping
  further T1 siblings as optional literacy
  any named later class SoT (hybrid, dynamics) per `30`

DATA / DATASETS
  dataset-backed velocity source adapter
  dual-source product mode
```

Items in §4.4 are **not** in this parking lot. They are out of
class, not queued.

---

## 14. Unresolved questions

Not a backlog commitment.

```text
U1  Whether the M2 product default is `points` or `comets` —
    owned by the successor SoT, not by this file
U2  Whether F4 (viewport priority) and F5 (diagnostics fold)
    are closed by reordering inside M3 or admitted as
    CONDITIONAL after Phase 4
U3  Whether the "what it is not / known limits" surface is a
    README section, an in-product panel, or both
U4  How many testers the Phase 4 playtest ultimately uses if
    only two are available
U5  Whether the post-V1 curated-scenario SoT chooses a
    storm-motion rule or a per-scenario constant
U6  Whether SRH ever becomes a displayed quantity
```

---

## 15. Anti-claims

```text
this file does not implement anything in src/**
this file does not create ROADMAP.md
this file is not a rendering SoT
this file is not a UX implementation SoT
this file does not reopen the model class (`30`)
this file does not reopen T1 or Candidate A
this file does not change the seven V_total operands
this file does not change prescribed Ω semantics
this file does not add or remove a Guided experiment
this file does not change any Guided allowed claim
V1 is not a realistic supercell simulator
V1 is not a forecast model, CFD, or a prognostic storm model
V1 does not generate its own mesocyclone
V1 does not promise whole-storm visual legibility
V1 does not promise environment-sensitivity experiments
a single fixed environment is a scope decision, not a defect
perception work in V1 is a product-state decision, not a
  rendering redesign
diagnostic overlays are not perception work
Guided mounts of Follow / Reset View / Point diagnostics are
  not V1
deferred is not the same as rejected; §4.3 and §4.4 are
  different buckets
readiness percentages are planning estimates, not measurements
```

---

## 16. Documentation / authority

```text
this file:     V1 scope checkpoint — promise, inventory,
               classification, freeze rule, finite roadmap,
               acceptance test
37:            Reset View / camera recovery — IMPLEMENTED;
               scope successor is this file
36:            selection acquisition / identity — IMPLEMENTED
35:            post-Follow playtest ranking — historical
34:            Follow camera contract — IMPLEMENTED
33 / 31 / 29:  historical product and physics rankings
32:            point-first diagnostic observation UI
30:            model class — binding, not reopened
24:            perceptual loop closed; comets provisional
23 / 22:       perceptual airflow architecture and workbench
21:            whole-product capability map
20 / 17:       Guided runtime and catalog — catalog preserved
19 / 18 / 16:  inspector, seeding, shell
11:            tracer domain y ≥ 0
CONCEPT:       long-term vision; explicitly not a V1 backlog
```

Successor of `37`: this file.
Successor architecture SoT required by this file:

```text
docs/architecture/39-v1-visual-airflow-product-state-architecture.md
```

Closed physics docs are not rewritten. Historical rankings in
`21`, `24`, `31`, `33`, `35` are not silently modernized beyond
this successor relationship.

---

## 17. Compact lock-in

```text
V1 PROMISE          interactive storm-relative kinematic
                    laboratory; prescribed idealized storm flow
                    over ONE fixed environment; release parcels,
                    decompose V_total into exactly seven
                    prescribed components, read T_tilt,y and
                    ω_y,current at a selected parcel

ACCEPTANCE FRAME    A1 where does the parcel go
                    A2 which of the seven components act here
                    A3 what environment is this built on
                    A4 what are T_tilt,y and ω_y,current here
                    A5 why tendency ≠ existing vorticity

V1 MUST             M1 persistent model-class honesty
                    M2 visual-airflow product state
                    M3 functional UX/UI consolidation
                    M4 release audit + documentation
                    M5 recorded human acceptance playtest

V1 CONDITIONAL      viewport priority, diagnostics fold,
                    Explore starting cohort, responsive work,
                    Guided→Explore handoff, integrator change,
                    SRH readout — each with a named validation

POST-V1             §4.3 and §13 — interaction, visualization,
                    teaching, environment, physics literacy,
                    datasets, platform

REJECTED / OUT      §4.4 — eighth operand, T2, prognostic ω,
                    ω→V, continuity solver, thermo, pressure,
                    microphysics, D3, far-field deactivation,
                    background highlight, auto-select,
                    auto-recenter, occupancy-as-density,
                    merged Guided cards, free probe

HODOGRAPH           OPTION A — one canonical fixed environment
                    curated scenarios and editable hodograph
                    are POST-V1 behind their own SoT

PERCEPTION          current representation is insufficient for
                    whole-storm legibility, and that is NOT a
                    V1 promise; minimum V1 task is M2 only

GUIDED              three experiments preserved; no fourth;
                    no Guided diagnostics / Follow / Reset View;
                    one copy consolidation pass inside M3

UX / UI             required as a bounded phase; functional
                    items only; cosmetic polish POST-V1

FEATURE FREEZE      at M2 merge; reopened only by a recorded
                    acceptance failure meeting four conditions

ROADMAP             1 close M2 blocker
                    2 freeze
                    3 UX/UI consolidation (+ M1)
                    4 human acceptance playtest
                    5 physics / regression / a11y / docs audit
                    6 release cleanup → V1.0 READY

NEXT ARTIFACT       docs/architecture/
                    39-v1-visual-airflow-product-state-architecture.md

IMPLEMENTATION
FROM THIS FILE      NONE

READINESS           architecture 90 / physics 95 / interaction 85
                    teaching 70 / UX 55 / release 25
                    overall ~70

CONFIDENCE          HIGH on the promise wording, on one fixed
                    environment, on preserving three Guided
                    experiments, and on no new physics
                    MEDIUM on the exact M2 default encoding
                    (successor SoT owns it) and on whether F4/F5
                    survive Phase 3
```

---

## 18. STOP

```text
V1 SCOPE
  DEFINED

V1 MUST
  FIVE ITEMS — M1..M5

FEATURE FREEZE
  RULE WRITTEN; TAKES EFFECT AT M2 MERGE

HODOGRAPH
  ONE FIXED ENVIRONMENT

PERCEPTION
  PRODUCT-STATE DECISION ONLY

GUIDED
  THREE EXPERIMENTS PRESERVED

PHYSICS
  UNCHANGED / CLOSED

IMPLEMENTATION
  NOT AUTHORIZED
```

New features, new operands, new experiments, new environments,
new overlays, new physics, and rendering redesigns are out of
scope for this SoT.
