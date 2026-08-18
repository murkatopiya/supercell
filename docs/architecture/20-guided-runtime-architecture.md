# Guided Runtime Architecture

**Status:** architecture / product SoT. Guided Slice 1 is
implemented. Guided Slice 2 is implemented. Guided Slice 3 is
**COMPLETE**.

**Current product status:** Explore arbitrary point release is
live (`18` Slices 1–4). Shared Tracer Inspector Slices 1–4 are
live (`19`). Desktop workbench layout is live. Physics remains
paused (`15` D). Headless Guided product identity exists, live
Guided runtime selection is wired, and the Guided teaching
surface is live:

```text
src/guided/GuidedExperiment.ts
  GuidedExperimentId
  GuidedExperimentDefinition
  GUIDED_EXPERIMENTS
  guidedExperimentById(id)

src/app/guidedExperimentComposition.ts
  pedagogyForGuidedExperiment(id)
  guidedExperimentCompositionFor(id)

src/app/createGuidedLab.ts
  DEFAULT_GUIDED_EXPERIMENT_ID = inflow-to-upper-outflow
  createGuidedLab(id)
  resetGuidedLab(lab)
  switchGuidedExperiment(lab, nextId, selection)

App
  session-local guidedExperimentId
  definition = guidedExperimentById(guidedExperimentId)
  GuidedExperimentSelector (Guided-only; catalog titles)
  GuidedExperimentPanel (Guided-only; laboratory column)
```

Live Guided no longer uses `LIVE_DEMO_TRACER_PEDAGOGY`. That
constant was removed. `TracerPedagogy` remains internal
composition. Explore | Guided remains top-level nav, not
catalog cards. Teaching copy lives in `GuidedExperimentPanel`.
This document is the implementation SoT that turns `17`'s
catalog into runtime product state without a second physics
architecture.

**Guided v1 catalog/runtime/teaching surface is implemented.**
The next product or physics fork remains a separate decision.
Follow is not assigned. Physics remains paused.
Current whole-product direction checkpoint:
`docs/architecture/21-whole-product-direction-checkpoint.md`.
Perceptual airflow exploration:
`docs/architecture/22-perceptual-airflow-architecture.md`.
This document remains how the three experiments run. It does
not start perceptual implementation.

Predecessors (not rewritten):

- `docs/architecture/16-explore-guided-interaction-architecture.md`
- `docs/architecture/17-guided-experiment-catalog.md`
- `docs/architecture/18-explore-arbitrary-seeding.md`
- `docs/architecture/19-shared-tracer-inspector.md`

This document answers:

    What is the minimal public runtime notion of a selected Guided
    Experiment, how does it map onto existing composition, and what
    is the exact lab / selection / Reset lifecycle now that Explore
    and the shared Inspector exist?

It does **not** implement a catalog UI, a router, Follow, a
completion engine, or physics.

Authoritative:

- `docs/CONCEPT.md` §7–§8, §13
- `docs/ARCHITECTURE.md` §2, §23–§24, §28, §36
- `docs/architecture/08-story-seeds.md`
- `docs/architecture/12-downward-ground-impact-pedagogy.md`
- `docs/architecture/14-near-ground-outflow-pedagogy.md`
- `docs/architecture/15-post-near-ground-outflow-checkpoint.md`
- `docs/rendering/02-tracer-runtime-controls.md`

Live Model (unchanged):

```text
IntegrationFrame = StormRelativeLaboratory
stack            = seven prescribed operands
                   StormRelativeEnvironmentalAdvectionField
                   VerticalEnvelopeUpdraftField
                   VerticalEnvelopeRotationField
                   LowerRadialInflowField
                   UpperRadialOutflowField
                   VerticalEnvelopeDowndraftField
                   NearGroundRadialOutflowField
```

Prescribed storm-relative kinematic laboratory. Not CFD. Not
mass-consistent circulation. Continuity remains YELLOW.
Experience ≠ physics (`16` §3).

---

## 1. Verdict

**A selected Guided Experiment is session-local product identity
(`GuidedExperimentId`) plus a thin catalog definition of
user-facing copy. It maps, at the application composition
boundary, onto existing `TracerPedagogy` and ScenarioConfig
seed arrays. Switching experiment creates a fresh Guided lab
(new `Simulation`, new tracer identity scope, cleared
selection / inspection). Reset of the current experiment does
not.**

The `16` §9 trigger that was false when `17` was written is now
true:

```text
1. a Guided shell must list experiences without talking in
   TracerPedagogy enum values
```

A **minimal** public identity is therefore earned. A generic
lesson engine, CMS, beat graph, or `GuidedPhase[]` is still
rejected. There are exactly three earned experiments (`17`).

Confirmed:

```text
public identity     ≠ TracerPedagogy
public identity     ≠ S1 / S2 / D1 / NG1
public identity     ≠ physics / Model
catalog copy        ≠ TracerInspection payload
experiment switch   ≠ Guided Reset
DiagnosticProbes    ≠ Guided catalog entry
canonical ICs       stay ScenarioConfig fixture arrays
```

---

## 2. Audit of current contracts and code

### 2.1 What is already live

| Concern | Live owner |
| --- | --- |
| Model / seven operands | `composeDemoTracerFields` |
| Guided lab | `createGuidedLab(id)` via `guidedExperimentCompositionFor` |
| Explore empty lab + point release | `createExploreLab` / `ExploreTracerSession` |
| Selected experiment | App session-local `guidedExperimentId` |
| Top-level nav | App `enterExplore` / `enterGuided` |
| Selection | `TracerSelection` in App; cleared on Explore ↔ Guided and on experiment switch |
| Inspector | `inspectSelectedTracer` + presentational `TracerInspectorPanel` |
| Guided Reset | `resetGuidedLab(lab)` in place; mapped seeds; `tracerId` kept; inspection refreshed |
| Explore Reset | `ExploreTracerSession.reset()`; in-place; ids kept |
| Glyph pick | Guided has picking, no placement |
| Placement | Explore-only |
| Desktop layout | workbench: hodograph / laboratory / inspector |

### 2.2 What `17` already locked (not reopened)

```text
public catalog          Inflow to upper outflow (S1+S2 together)
                        Downdraft path to the ground (D1)
                        Near-ground outflow (NG1)

interaction model       B: instructor in the same laboratory

isolation               one public experiment on screen
                        no Both / concatenated pathlines

completion              S1/S2: none
                        D1: domain exit is the pathline climax
                        NG1: outward path; ground exit incidental

seeds                   ScenarioConfig arrays remain fixtures
```

### 2.3 The hole this SoT fills

`17` defined **what** a Guided Experiment is. It deferred the
production type because Explore and Inspector did not exist yet
(`17` §16–§17). They exist now. The remaining hole is
**runtime product state**:

```text
which of the three experiments is selected
how that selection becomes a lab
what happens to tracerId / selection / inspection
what copy the shell may show beside the Inspector
```

Live Guided still answers “which experiment?” with a developer
constant. That is scaffold, not catalog.

---

## 3. Public runtime identity

### 3.1 Candidates

| Candidate | Meaning | Verdict |
| --- | --- | --- |
| A. `selectedPedagogy: TracerPedagogy` as App state | Product nav = composition enum | **Rejected.** `16` §1 / §4. DiagnosticProbes would leak onto the shelf. UI would `switch` on StoryPathlines. |
| B. Research IC names as product ids (`S1`, `NG1`) | Users and URLs speak internals | **Rejected.** `17` §4: internal ICs stay research names. S1 and S2 are occupants of one experiment, not two ids. |
| C. Untyped strings / card index | Convenient, unstable | **Rejected.** Index is occupancy thinking (`19` already forbade that for tracers). |
| **D. Small string-literal product union** | Stable Guided identity, mapped internally | **Canonical.** |
| E. Generic `GuidedLesson` / plugin catalog | Future CMS | **Rejected.** Three entries. `01` / `08` anti-framework. |

### 3.2 Canonical form

Conceptual TypeScript (Slice 1 shipped these names):

```text
GuidedExperimentId
  "inflow-to-upper-outflow"
  "downdraft-path-to-ground"
  "near-ground-outflow"
```

Properties:

```text
kind:          string-literal union (three values)
shape:         kebab-case, URL-safe
why URL-safe:  identity that could later be a deep link
               without designing a router now
not:           TracerPedagogy value
               S1 / S2 / D1 / NG1
               integer index
               UUID
               localized title
```

This is **product identity**, not physics identity. Switching it
must not add, remove, or retune operands. It selects a curated
experience over the same Model.

A const-object plus union, in the same style as
`TracerPedagogy` / `IntegrationFrame`, is acceptable at
implementation time. The **stored values** must remain the
kebab-case product strings above, so a Guided `switch` cannot
be written against `TracerPedagogy.StoryPathlines`.

Catalog order (unchanged from `17` §4):

```text
1. inflow-to-upper-outflow
2. downdraft-path-to-ground
3. near-ground-outflow
```

### 3.3 Where the selected id lives

```text
session-local App / Guided lab session state
beside paused, timeScale, TracerSelection
not ScenarioConfig
not Simulation
not TracerScene
not localStorage
not a backend
```

Reload starts a new session. No persistence SoT.

---

## 4. Catalog definition contract

### 4.1 Do not dump `17` into a DTO

`17` §11 split two layers. That split is now an implementation
boundary.

**User-facing runtime data** (the shell may show):

| Field | Role |
| --- | --- |
| `id` | `GuidedExperimentId` |
| `title` | Working product name from `17` §4 |
| `observe` | Short learning objective |
| `demonstrates` | Allowed claim in plain language |
| `doesNotMean` | One scientific-honesty caveat |

**Not runtime strings in v1:**

```text
full forbidden-interpretation lists
isolation tables
research digits (t ≈ 119 s, max y ≈ 7000 m, …)
expected-sequence state machines
anti-claim compatibility matrix
IC coordinates
TracerPedagogy member names
S1 / S2 / D1 / NG1 as user labels
```

Those remain SoT + tests (`08`, `12`, `14`, `17`). A future
catalog type must reference them, not replace them (`17` §11.2).

### 4.2 Why this is enough for v1

The App already states the storm-relative laboratory frame in
shell copy. Repeating a per-card “prescribed laboratory”
paragraph is redundant. Per-experiment copy answers three
questions the Inspector does not:

```text
title          which exhibit is this?
observe        what should I watch?
demonstrates   what claim is justified?
doesNotMean    what must I not conclude?
```

Do not ship a wall of text. One caveat per experiment, not the
entire anti-claim appendix.

### 4.3 v1 caveats (the ones that belong on screen)

Shared shell (already approximately live; not per-card):

```text
This is a prescribed storm-relative laboratory, not a real
supercell simulation.
```

Per experiment, `doesNotMean` carries the exhibit-specific trap:

| Id | Caveat intent (not final English) |
| --- | --- |
| `inflow-to-upper-outflow` | Not a realistic parcel, not mesocyclone capture, not a closed circulation, not the air that later becomes the downdraft or near-ground exhibits. |
| `downdraft-path-to-ground` | Domain exit is pathline termination, not a cold pool, gust front, RFD/FFD, or the source of the near-ground outflow experiment. |
| `near-ground-outflow` | Outward motion relative to this occupant’s axis; not cold-pool spreading, density current, or the same air that descended in the downdraft exhibit. |

Exact sentences are copy, written at implementation. The
architecture lock is: **one honesty caveat each**, plus the
shared synthetic-laboratory line. The long forbidden lists stay
in docs/tests.

### 4.4 Conceptual record

```text
GuidedExperimentDefinition
  id            GuidedExperimentId
  title         string
  observe       string
  demonstrates  string
  doesNotMean   string
```

No camera policy. No completion flag. No seed coordinates. No
pedagogy enum field on the **public** record.

Internal mapping is a **function**, not a field the UI reads
(`§5`).

---

## 5. Product → composition mapping

```text
GuidedExperimentId
        ↓
application / composition mapping
        ↓
TracerPedagogy
        ↓
existing helpers
  demoSeedsForPedagogy
  demoTrailsEnabled
  demoKeepInactiveGlyphs
  createDemoPathHistory
  composeDemoTracerLab
        ↓
ScenarioConfig seed array + trail / glyph policy
```

Locked table:

| Product id | Internal pedagogy | Canonical array | Trails | `keepInactiveGlyphs` |
| --- | --- | --- | --- | --- |
| `inflow-to-upper-outflow` | `StoryPathlines` | `storySeeds` (S1+S2) | on | false |
| `downdraft-path-to-ground` | `DownwardPathline` | `downwardPathlineSeeds` (D1) | on | true |
| `near-ground-outflow` | `NearGroundOutflowPathline` | `nearGroundOutflowPathlineSeeds` (NG1) | on | false |

`DiagnosticProbes` has **no** product id.

### 5.1 Where the mapping lives

**Application composition boundary.** Same layer as
`createGuidedLab` / `composeDemoTracerLab` / `TracerPedagogy`
today.

Not in:

```text
Simulation
TracerScene
TracerInspectorPanel
TracerInspection
physics field classes
ScenarioConfig
ExploreTracerSession
```

UI may know `GuidedExperimentId` and `GuidedExperimentDefinition`.
UI must not import `TracerPedagogy` to decide which card is
selected.

### 5.2 No second compositor

`composeDemoTracerFields` remains the Model compositor.
Experience selection does not enable or disable operands
(`15` §2: presence ≠ exhibit). Mapping chooses seeds, trail
policy, and terminal-glyph policy only.

Do not copy S1/S2/D1/NG1 coordinates into the catalog.

---

## 6. Experiment-switch lifecycle

Switching Guided experiment is **not** Reset.

`resetTracersFromSeeds` requires equal particle counts. S1+S2
is two tracers; D1 and NG1 are one. In-place mutation cannot be
the switch contract. Even if counts matched, `tracerId = 1` in
a new cohort must not keep the previous selection (`19` §13:
Guided experiment replacement clears selection; ids are scoped
to one `Simulation`).

**Canonical switch:**

```text
select another GuidedExperimentId
  → create a fresh Guided lab
      new Simulation
      canonical curated cohort for that id
      trail / glyph policy from the mapping
      velocityObservation from the same composition pass
  → new tracer identity scope (ids start at 1 again)
  → TracerSelection.clear()
  → inspection = undefined
  → bump resetEpoch so the observe scene follows the new occupancy
  → do not carry Explore pending placement
```

Preserve as session controls (already live across Explore ↔
Guided):

```text
paused
timeScale
hodograph overlay visibility
```

Camera: the live viewport already recreates `TracerScene` when
`simulation` identity changes (Explore ↔ Guided today). A
Guided experiment switch is the same class of event. Default
shared orbit pose is restored. Do not add camera persistence.

Do not keep `selectedId` because both labs happened to mint
`tracerId = 1`. Those are different runtime identities (`19`
§5).

---

## 7. Explore ↔ Guided

Top-level nav remains:

```text
Explore | Guided
```

It does **not** change the seven-operand stack or
`IntegrationFrame`. It changes experience-owned presentation:

```text
tracer cohort
copy
trail policy
terminal-glyph policy
placement tool presence
```

### 7.1 Enter Explore from Guided

**v1 = current live behavior.**

```text
new Explore lab
  zero tracers
  empty ExploreTracerSession
  placement disabled, default altitude
  no pending seed
clear selection and inspection
do not carry Guided particles
do not carry Guided claims
```

`17` §13’s “leave carrying positions, claims stripped” remains
a **useful later** option. It is not v1. Default if that later
slice is commanded: treat transferred particles as new Explore
identities; clear selection; never keep a Guided claim on the
id (`19` §13).

### 7.2 Enter Guided from Explore

```text
new Guided lab for the session’s selected GuidedExperimentId
canonical ICs, t = 0, that experiment’s trail / glyph policy
overwrite exploratory tracers (Guided owns the particle list)
clear selection and inspection
clear Explore pending / placement
```

An Explore parcel that happens to sit near NG1 is not NG1
(`16` §7, `18` §2). Explore state cannot be converted into a
catalog experiment (`17` §13).

### 7.3 Which experiment is selected?

| Moment | Selected id |
| --- | --- |
| First Guided lab this session (including first App paint, which is Guided today) | **Deterministic default:** `inflow-to-upper-outflow` |
| User picks another catalog entry | That id; session-local |
| Leave Guided → Explore → return to Guided | **Remember** the last selected id this session |
| Reload | Default again (no persistence) |

Default is **not** NG1. `17` already said the live NG1 scaffold
does not rank NG1 above the others. Catalog order starts with
the inflow family.

`paused` / `timeScale` remain session controls, not
per-experiment preferences.

---

## 8. Guided Reset vs experiment switch

Two different events.

### 8.1 Reset current experiment

Live contract, kept (`02`, `19` §13, `resetTracersFromSeeds`):

```text
same Simulation
same particle objects
same tracerId values
clock.time → 0
positions / age / active restored from that experiment’s
  canonical ScenarioConfig array
path history clear + captureInitial
selection preserved if selectedId still exists
inspection refreshed immediately
resetEpoch bumped (accumulator / scene follow occupancy)
paused and timeScale preserved
```

Slice 2 closed the scaffold bug: Reset uses **the currently
selected experiment’s** seeds via `resetGuidedLab` /
`guidedExperimentCompositionFor`, not a global pedagogy
constant.

Explore Reset stays Explore-owned (`ExploreTracerSession.reset`
replays user seeds; empty list → empty occupancy, `t = 0`).

### 8.2 Switch experiment

`§6`. New lab. New ids. Selection cleared.

Do not implement switch by Reset. Do not implement Reset by
replacing `Simulation`.

---

## 9. Shared Inspector vs Guided teaching copy

Same infrastructure (`19`):

```text
TracerSelection
inspectSelectedTracer / TracerInspection
TracerInspectorPanel
```

Do **not** create `GuidedTracerInspector` or a Guided-only
payload.

```text
Inspector
  What is this tracer doing now, and which model operands
  contribute?
  Level 1 motion + Level 2 contributions
  no S1 / D1 / NG1 / experiment title
  no allowed claim

Guided teaching layer
  What should I notice in this experiment, and what claim
  is justified?
  title / observe / demonstrates / doesNotMean
  beside the Inspector, not inside the scientific rows
```

Selecting S1 vs S2 in “Inflow to upper outflow” is glyph pick
on two unlabeled curated tracers. The teaching layer may say
the experiment contains two members of one approach family. The
Inspector still reports `Tracer #n` and `V_i`. It does not
rename the particle S1.

Inactive D1 remains inspectable while the particle exists
(`19` §13). That is Inspector honesty, not a completion
checkbox.

---

## 10. Guided v1 interaction contract

Already live, remains required (`17` §7; current App):

```text
orbit / zoom
Pause / Resume
Reset
timeScale 1× / 5× / 10× / 20×
glyph selection
shared Inspector
exit to Explore
```

Explore-only, **not** Guided v1:

```text
arbitrary point release
altitude control
placement enable
pending preview
Confirm / Cancel
Clear occupancy
```

Do not add user tracers inside a curated Guided experiment
without a later SoT. That collapses NG1 into a fan, D1 into a
landing patch, and S1/S2 into a cloud (`17` §7, `08` / `12` /
`14`).

Follow, scripted camera, scrub, layer strip-down, and
click-empty-to-deselect remain later. Auto-follow is still
undesirable (`19` §11). Auto-stop at D1 exit is still
undesirable (`17` §7): Pause stays user-owned.

---

## 11. Completion and events

**No generic completion engine in the first implementation.**

`17` §8–§9 already forbade promoting research thresholds into
runtime detectors. Re-checked against live code:

| Experiment | Discrete climax in the runtime? | Guided API needed? |
| --- | --- | --- |
| Inflow to upper outflow | No. Tracers stay active. | **No.** |
| Downdraft path to the ground | Yes: `active = false` at `y = 0` | **No new API.** Lifecycle already exists. Teaching copy already says the hit is the climax. Inspector already shows inactive. |
| Near-ground outflow | Ground exit is incidental | **No.** An inactivity detector would **lie**. |

A unified `completed: boolean` would be correct only for D1 and
false for the other two. Do not add `onOutflowEntered`, occupancy
bars, or a Guided event bus so a checkbox can tick.

v1 is static copy plus observable simulation.

---

## 12. DiagnosticProbes

```text
DiagnosticProbes
  ≠ GuidedExperimentId
  ≠ public catalog entry
  = internal composition default
    + developer / scientific diagnostic preset
```

`DEFAULT_DEMO_TRACER_PEDAGOGY` may remain `DiagnosticProbes` for
composition tests. The Guided product path must not use that
default.

Do not add a fourth catalog card for enum symmetry (`16` §5.1,
`17` §6). If it surfaces later, it is ARCHITECTURE §28 debug or
an unlabeled Explore starting set, never a Guided claim.

---

## 13. Canonical seeds / ScenarioConfig

Unchanged from `16` §6:

```text
storySeeds                      fixture for inflow-to-upper-outflow
downwardPathlineSeeds           fixture for downdraft-path-to-ground
nearGroundOutflowPathlineSeeds  fixture for near-ground-outflow
diagnosticSeeds                 fixture for DiagnosticProbes only
```

Guided definitions do **not** own coordinates. The mapping
chooses which existing array `demoSeedsForPedagogy` already
returns.

Do not migrate arrays into a Guided DTO. Do not write Explore
releases into them (`18`).

---

## 14. Catalog UI — architecture shape only

Not a mockup. Not a router. Not a modal. Not a carousel.

When Slice 3 is commanded, the product surface is:

```text
three experiment choices
selected experiment teaching copy
laboratory (runtime controls + 3D viewport)
shared Inspector
```

Workaround ownership stays as now: App orchestrates; teaching
copy is presentational; Inspector is presentational; composition
creates the lab.

Deep links / URL sync of `GuidedExperimentId` are **not** in
v1. The id is URL-safe so a later slice can add that without
renaming.

---

## 15. Explicit non-goals (first Guided implementation cycle)

```text
new physics
tilting / stretching
continuity retune
cold pool / thermodynamics

Follow
scripted Journey camera
camera automation
auto progression
beat engine
completion / event engine
router / deep links
persistence / backend / localStorage
achievements / progress
generic lesson framework
localization framework
free-space probes
Explore arbitrary seeding inside Guided
Level 3 diagnostics on the Inspector
four-mode TracerPedagogy selector
DiagnosticProbes as a catalog card
carrying Guided particles into Explore
Both / DownwardThenOutflow / circulation Journey
```

Physics remains paused. When modeling resumes: tilting /
stretching interaction architecture SoT (`15`, `16`, `17`).

---

## 16. Implementation slices

Derived from the live layering (`19` headless identity before
browser UI; `18` headless session before App wiring). Follow is
not in this sequence.

### Slice 1 — headless Guided catalog / product identity     COMPLETE

```text
src/guided/GuidedExperiment.ts
  GuidedExperimentId
    "inflow-to-upper-outflow"
    "downdraft-path-to-ground"
    "near-ground-outflow"
  GuidedExperimentDefinition { id, title, observe, demonstrates, doesNotMean }
  GUIDED_EXPERIMENTS            canonical order
  guidedExperimentById(id)      total lookup

src/app/guidedExperimentComposition.ts
  pedagogyForGuidedExperiment(id) → TracerPedagogy
  guidedExperimentCompositionFor(id)
    pedagogy, seeds, trailsEnabled, keepInactiveGlyphs
    seeds = demoSeedsForPedagogy(pedagogy)  (ScenarioConfig reference)

no App.tsx change
no browser catalog
LIVE_DEMO_TRACER_PEDAGOGY remains the live Guided scaffold
```

### Slice 2 — Guided experiment selection wiring              COMPLETE

```text
src/app/createGuidedLab.ts
  createGuidedLab(id)
    guidedExperimentCompositionFor(id)
    composeDemoTracerLab(StormRelativeLaboratory, pedagogy)
    createDemoPathHistory / keepInactiveGlyphs from mapping
  resetGuidedLab(lab)           mapped seeds, same Simulation
  switchGuidedExperiment(...)   same id = no-op; else fresh lab
                                and TracerSelection.clear()

App owns session-local guidedExperimentId
default = inflow-to-upper-outflow
Explore → Guided restores last selected id this session
paused / timeScale survive experiment switch
GuidedExperimentSelector is Guided-only runtime wiring
  options = GUIDED_EXPERIMENTS titles
  not Slice 3 teaching copy
LIVE_DEMO_TRACER_PEDAGOGY removed
no Follow
```

### Slice 3 — minimal browser catalog + teaching copy         COMPLETE

```text
src/ui/tracer/GuidedExperimentPanel.tsx
  GuidedExperimentPanel({ experiment: GuidedExperimentDefinition })
  presentational; exact catalog title / observe / demonstrates /
    doesNotMean
  shared Guided honesty line (§4.3), not per-card copy
  labels: Observe / Demonstrates / Does not mean

App
  selected definition = guidedExperimentById(guidedExperimentId)
  no independent selectedExperimentDefinition state
  panel in laboratory column:
    toolbar / selector / teaching panel / 3D viewport
  Guided-only; Explore has no teaching panel
  Inspector remains TracerInspectorPanel; contract unchanged
  teaching independent of selectedTracerId
  still no placement in Guided
  still no completion engine
  no Follow
```

Do not merge Slice 1 into 2: identity and mapping must be
testable without App orchestration. Do not merge 2 into 3:
lifecycle must not wait on copy layout.

Guided v1 catalog/runtime/teaching surface is implemented.
The next product or physics fork remains a separate decision.

---

## 17. Required verdicts

```text
public runtime identity:          GuidedExperimentId
                                  kebab-case string union
                                  session-local
                                  not TracerPedagogy

catalog definition v1:            id, title, observe,
                                  demonstrates, doesNotMean
                                  no IC coordinates
                                  no full anti-claim dump
                                  no completion flag

mapping owner:                    application composition
                                  id → TracerPedagogy
                                  → existing seed / trail / glyph
                                    helpers
                                  not Simulation / scene /
                                    Inspector / physics /
                                    ScenarioConfig

default experiment:               inflow-to-upper-outflow
                                  not NG1 scaffold

Explore ↔ Guided memory:          remember last Guided id
                                  this session only
                                  no persistence

experiment switch:                fresh Guided lab
                                  new Simulation / new ids
                                  clear selection and inspection

Guided Reset:                     in-place, same Simulation
                                  tracerId kept
                                  selection kept if id exists
                                  inspection refreshed
                                  mapped canonical ICs, t = 0

Explore enter v1:                 empty Explore lab
                                  do not carry Guided particles
                                  carry-positions = later

Inspector:                        shared, unchanged
                                  no Guided claim inside payload

teaching copy:                    GuidedExperimentPanel
                                  laboratory column, Guided-only
                                  derived from guidedExperimentId
                                  beside Inspector, not inside it
                                  static; no event engine

completion engine:                none in v1

DiagnosticProbes:                 not a catalog entry

canonical seeds:                  remain ScenarioConfig arrays

next implementation:              separate product/physics decision
                                  not Follow
                                  not physics
                                  not assigned by this slice
```

---

## 18. Compact lock-in

```text
purpose:              turn 17’s earned catalog into runtime
                      product state without a second Model

identity:             GuidedExperimentId
                      inflow-to-upper-outflow
                      downdraft-path-to-ground
                      near-ground-outflow

mapping:              app composition → TracerPedagogy
                      UI never switches on pedagogy

lab lifecycle:        switch experiment = new lab
                      Reset experiment = same lab

nav:                  Explore | Guided unchanged as top level
                      physics stack unchanged

copy vs Inspector:    claim beside observation
                      never inside V_i rows

slices:               1 identity COMPLETE
                      2 wiring COMPLETE
                      3 catalog UI COMPLETE

physics:              paused
```

---

## 19. STOP

This document's Slice 1 (identity), Slice 2 (runtime wiring),
and Slice 3 (catalog teaching copy) are implemented.

**Guided v1 catalog/runtime/teaching surface is implemented.**

This document does not start a router, Follow, a completion
engine, persistence, or physics. The next product or physics
fork remains a separate decision. Follow is not assigned.
Physics remains paused.

Do not put `TracerPedagogy` in product App state.
Do not keep selection across a new `Simulation` because both
minted `tracerId = 1`.
Do not treat Guided Reset as experiment switch.
Do not put allowed claims in `TracerInspection`.
Do not add DiagnosticProbes as a fourth experiment.
Do not invent a completion bus so NG1’s incidental ground exit
can tick a box.

`17` remains the catalog of *what* the three experiments are.
This document is the catalog of *how they run*.

Next work starts only when commanded.
