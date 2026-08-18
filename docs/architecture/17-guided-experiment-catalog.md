# Guided Experiment Catalog

**Status:** product-architecture SoT. This document did not
change production code when written. No `GuidedExperiment` type.

**Current product status:** Explore (`18` Slices 1–4) and shared
Inspector (`19` Slices 1–4) are live. Guided runtime wiring
(`20` Slice 2) selects among three public experiments. This
catalog's teaching copy is live in `GuidedExperimentPanel`
(`20` Slice 3). Do not treat the Explore | Guided App entry as
catalog cards. Successor implementation SoT:
`docs/architecture/20-guided-runtime-architecture.md`.
Physics remains paused.

Predecessor:
`docs/architecture/16-explore-guided-interaction-architecture.md`.

This document answers:

    What is a Guided Experiment in the future product, which current
    teaching assets are earned public catalog entries, and what
    isolation / completion / interaction contracts they carry?

It does **not** implement a catalog, a shell, seeding, an inspector,
camera automation, or event detection.

Live code-constant `NearGroundOutflowPathline` is **scaffold**.
It does not make NG1 the product default and does not determine
catalog shape.

Authoritative:

- `docs/CONCEPT.md` §7–§10, §13
- `docs/ARCHITECTURE.md` §23–§24, §28, §36
- `docs/architecture/16-explore-guided-interaction-architecture.md`
- `docs/architecture/08-story-seeds.md`
- `docs/architecture/12-downward-ground-impact-pedagogy.md`
- `docs/architecture/14-near-ground-outflow-pedagogy.md`
- `docs/architecture/15-post-near-ground-outflow-checkpoint.md`

Internal ICs (S1, S2, D1, NG1) remain the research names in this
document. Public working names are separate (`§4`).

---

## 1. Verdict

**B. A Guided Experiment is a guided layer over the same
interactive laboratory:** curated initial conditions plus teaching
structure, while the user keeps meaningful exploration controls.

The hypothesis is **confirmed** for this catalog:

```text
Guided is an instructor / guide inside the same laboratory,
not a prerecorded ride, and not a different simulation.
```

Not A: CONCEPT’s cinematic Journey (minimal UI, coordinated
camera, narration, layer strip-down) is a **future Guided genre**,
not the model of the three earned mechanism experiments. Those
exhibits were designed to be orbited, paused, and reset. Turning
them into videos would hide the teaching.

Not C: a bare scientific preset (seeds, no teaching structure)
is DiagnosticProbes / DEMO composition, not Guided. Guided
carries an objective, an allowed claim, isolation, and copy.

Not D as the lock-in: do not hybridize B and A into one
abstraction. A later cinematic Journey, if ever earned, is
another Guided *genre*. It must not redefine these three
experiments, and it must not concatenate their pathlines
(`16` §1, `§12`).

Public catalog, v1:

```text
1. Inflow to upper outflow          S1 + S2 together
2. Downdraft path to the ground     D1
3. Near-ground outflow              NG1
```

Diagnostic trio: **not** public Guided. Advanced / scientific
diagnostic preset, also the developer composition default.

A generic lesson-engine `GuidedExperiment` type remains
rejected. Minimal public runtime identity is specified in
`docs/architecture/20-guided-runtime-architecture.md`.

Next implementation SoT: **`20` Guided runtime architecture**.
Catalog UI is not started by this document.

Physics remains paused. When resumed: tilting / stretching
interaction architecture SoT (`15`, `16`).

---

## 2. What a Guided Experiment is

### 2.1 Test of A / B / C

| Model | Fits current earned assets? | Fits CONCEPT §8 Journey? |
| --- | --- | --- |
| A. Scripted ride; system owns progression / camera | No. `12` / `14` / `08` kept orbit, Pause, Reset, timeScale. No follow camera required for honesty. | Partial. CONCEPT wants a coordinated first encounter. |
| **B. Instructor in the same lab** | **Yes.** Same Model, curated ICs, claim, isolation; user still investigates. | Yes as the *family*: Journey motivates Explore; it does not replace it. |
| C. Reproducible preset, little narrative | No. Seeds without claim/copy are diagnostics or Explore. | No. |

CONCEPT’s nine-beat example (approach, updraft, rotation,
altitudes, freeze, strip cloud, reveal fields) is **presentation
over one Model**. It is not a concatenated parcel biography, and
it is **not yet an earned catalog entry** (`§13`).

### 2.2 Definition (conceptual, not a type)

A Guided Experiment, for this laboratory, is:

```text
the same seven-operand Model
+ canonical curated tracer(s)
+ trail / terminal-glyph policy
+ user-facing title, objective, allowed claim, caveat
+ internal anti-claims and isolation
+ ordinary laboratory controls (Pause, Reset, timeScale, orbit)
```

It is **not**:

- a second `VelocityField`;
- a silent `IntegrationFrame` change;
- a `TracerPedagogy` value shown as product navigation;
- a non-interactive video;
- a compatibility graph of other experiments;
- Explore with a caption.

Experience ≠ physics (`16` §3). Entering a Guided Experiment
replaces the **presentation** (seeds, copy, glyph policy), not
the storm stack.

---

## 3. Catalog audit of current assets

| Current asset | Public Guided? | Why |
| --- | --- | --- |
| StoryPathlines S1/S2 | **Yes — one experiment** | Earned pathline family (`07` A, `08`). Allowed claim `08` §6. |
| DownwardPathline D1 | **Yes** | Earned descent-to-exit (`12` A+D). Claim `12` §14. |
| NearGroundOutflowPathline NG1 | **Yes** | Earned near-ground divergent path (`14` A). Claim `14` §16. |
| DiagnosticProbes axis/east/north | **No** | Contrast at a seed layer, trails off, not a temporal path story (`08` §4, `16` §5.1). |

Do not force enum symmetry. Four `TracerPedagogy` values are
composition, not a shelf of four cards.

Live NG1 does not rank NG1 above the others in the catalog.

---

## 4. Public catalog (earned)

Internal ICs stay in docs and config. Public names must be
readable to a meteorology student and must **not** name physics
the model does not have (mesocyclone, anvil, RFD, cold pool,
gust front, circulation, capture).

### 4.1 Inflow to upper outflow

```text
working product name:    Inflow to upper outflow
internal composition:    TracerPedagogy.StoryPathlines
canonical ICs:           S1 (0, 1000, 4000)
                         S2 (0, 1000, 6000)
                         both live at once  (§5)
trails:                  on
keepInactiveGlyphs:      false  (neither deactivates)
```

**Learning objective.** See that, in this prescribed
storm-relative laboratory, pathlines starting in the lower
inflow layer can enter the deep updraft region and later the
upper outflow region — and that this is a **connected approach
family**, not one lucky parcel.

**Mechanisms highlighted.** Lower radial inflow, enveloped
updraft, upper radial outflow. Environmental SR advection and
prescribed rotation are present in the sum; they are not the
named teaching object. Near-ground outflow is off at this
height (`G_ng(1000) = 0`). Offset downdraft is almost unsampled.

**Expected observable sequence** (explanatory, not a runtime
state machine):

```text
lower-layer start
  → inward approach (S1 sooner / closer; S2 farther upstream)
  → rise through the deep updraft
  → enter the upper outflow region
  → continue aloft  (no domain exit)
```

Research digits (`max y ≈ 7000 m`, outflow entry `t ≈ 200–251 s`)
stay in `08` / `07`. They are **not** user-visible physics
boundaries.

**Completion.** No hard completion. The teaching claim is
observable once the sequence has happened. Tracers remain
active afterward. The user ends the experiment, Resets, or
leaves for Explore.

**Allowed claim** (`08` §6):

```text
prescribed storm-relative pathline through lower inflow,
deep updraft region, and upper outflow region
```

**Forbidden interpretations.** Same-air-mass circulation;
mesocyclone capture; realistic parcel; full supercell; “the air
that went up came out here”; life cycle; return as the downdraft
experiment; spreading as the near-ground experiment.

---

### 4.2 Downdraft path to the ground

```text
working product name:    Downdraft path to the ground
internal composition:    TracerPedagogy.DownwardPathline
canonical IC:            D1 (5000, 1000, 0)
trails:                  on
keepInactiveGlyphs:      true   (climax is the exit point)
```

**Learning objective.** See a prescribed storm-relative pathline
descend through the downdraft region until it leaves the
atmospheric tracer domain at `y = 0`. The hit is pathline
termination, not outflow, density, or a cold pool.

**Mechanisms highlighted.** Offset enveloped downdraft. Horizontal
drift during descent is SR advection + lower inflow + rotation,
not spreading at the surface (`Vx_down ≡ Vz_down ≡ 0`).

**Expected observable sequence:**

```text
lower-level start in the downdraft core
  → occupy the downdraft region while descending
  → atmospheric-domain exit at y = 0
  → terminal glyph remains; particle inactive
```

**Completion.** The teaching climax **is** domain exit
(`t ≈ 119 s` in current DEMO; do not freeze the digit as
physics). After exit, the experiment is complete as a pathline
story; the user may still orbit the marker. Reset restores D1
active. Clock need not stop automatically.

**Allowed claim** (`12` §14):

```text
prescribed storm-relative pathline descending through the
downdraft region until it exits the atmospheric domain at y = 0
```

Short label allowed: downward pathline to the atmospheric ground
boundary.

**Forbidden interpretations.** Return of the inflow/updraft
pathlines; same parcel coming back; RFD/FFD; precipitation-cooled
air; cold-pool generation; gust front; mass-conserving return;
compensating subsidence; the missing half of the storm; **source
of the near-ground outflow experiment**.

---

### 4.3 Near-ground outflow

```text
working product name:    Near-ground outflow
internal composition:    TracerPedagogy.NearGroundOutflowPathline
canonical IC:            NG1 (3000, 100, 4750)
trails:                  on
keepInactiveGlyphs:      false  (climax is the outward trail)
```

**Learning objective.** See a prescribed storm-relative
near-ground pathline advected through a divergent horizontal
outflow region, with meaningful residence in that layer. Outward
motion relative to **this occupant’s** axis is the exhibit.

**Mechanisms highlighted.** `NearGroundRadialOutflowField` as
leading ng-radial source. Lower inflow opposes and loses along
this path (`14` §10). SR advection bends the path. Isolated NG
would be a south ray that never grounds; the live path is the
composite.

**Expected observable sequence:**

```text
near-ground start south of the outflow axis
  → brief r dip (composite honesty)
  → sustained outward displacement in the near-ground layer
  → optional incidental domain exit later  (not the climax)
```

**Completion.** **No hard completion at ground exit.** Teaching
success is the outward path (already clear by `t ≈ 200 s` on
current DEMO). Domain exit at `t ≈ 276 s` is incidental (`14`
§14). User ends it, Resets, or leaves.

**Allowed claim** (`14` §16):

```text
prescribed storm-relative near-ground pathline advected
through a divergent horizontal outflow region
```

Short label allowed: near-ground outflow pathline.

**Forbidden interpretations.** Cold-pool spreading; gust front;
density current; precipitation-cooled air; air spreading after
the downdraft experiment; the same air that descended; surface
response / skating; mass spreading; RFD/FFD; closing `∇ · V`;
“the air that went up came out here.”

---

## 5. S1 and S2: one experiment, two tracers

**One public experiment containing two simultaneous curated
tracers.**

Not two experiments: both share one claim, one sequence, one
isolation set. A second catalog card would exist only because
two seeds exist.

Not “canonical one + optional comparison”: S2’s job is to show a
**radial-approach family**, not a lucky parcel (`08` §1, §3).
Optional S2 would make that lesson skippable. Both are required
occupants of **Inflow to upper outflow**.

S1 = interior path (`r/σ = 1.0`). S2 = farther-upstream path
(`r/σ = 1.5`), same height, same south bearing. The controlled
difference is start radius.

S3 remains a recorded spare, not a catalog occupant (`08`).

Two glyphs here are **not** a spreading sector. They are two
members of one ascent family, at story height, trails on. That
is a different visual language from two near-ground outflow
seeds (`14` §7 forbade a fan). Do not generalize “two tracers =
family” to NG1.

---

## 6. Diagnostic trio

**Not a public Guided Experiment.**

```text
role:     advanced / scientific diagnostic preset
          + developer composition default
          (combination; not a public catalog card)
seeds:    axis (0, 1000, 0)
          east (2400, 1000, 0)
          north (0, 1000, −2400)
trails:   off
job:      mechanism contrast at the seed layer
```

| Seed | Contrast job (`08` §4) |
| --- | --- |
| Axis | `r = 0`: inflow and rotation identically zero; `V_sr` + updraft |
| East | Cyclonic-flank graze |
| North | Downstream failure of the south-side story basin (honest miss) |

It is not a temporal pathline story. Axis letter-passing the
ascent threshold does **not** make it the inflow-to-outflow
experiment.

Where it may appear later: Explore lab starting set **without**
a Guided claim; ARCHITECTURE §28 debug; tests / default
`composeDemoTracerSimulation`. Where it must not appear: a
fourth Guided card titled “Diagnostic Probes” beside the three
earned experiments.

---

## 7. Guided interaction contract

Same laboratory controls unless a control would break the claim.

| Control | Class | Notes |
| --- | --- | --- |
| Pause / Resume | **Required** | Freeze to inspect. CONCEPT freeze-time. Already live (`02`). |
| Reset | **Required** | Restore that experiment’s canonical ICs, `t = 0`, trails initial. Must not write into other arrays. |
| timeScale | **Required** | Teaching windows are O(100 s). Existing `1/5/10/20×`. Does not change `dt`. |
| Orbit camera | **Required** | Exhibits were framed for the shared orbit pose (`11`/`13` rendering). |
| Zoom | **Required** | With orbit. Scale literacy (CONCEPT §3, §13). |
| Exit to Explore | **Required** (navigation) | CONCEPT: Journey motivates Explore. Semantics `§11`. |
| Select tracer | **Desirable later** | Needed for S1 vs S2 inspect/follow. Not required to *see* the family. |
| Follow tracer | **Desirable later** | CONCEPT §7 / ARCHITECTURE §24. User-initiated. Must be cancellable. Auto-follow would hide laboratory scale; do not make it the default for these three. |
| Inspect values | **Desirable later** | Shared inspector (`§10`). Not blocking current trail teaching. |
| Toggle explanatory layers | **Desirable later** | Almost no 3D layers yet. Hodograph overlay toggles already exist and are harmless. |
| Scrub / replay history | **Desirable later** | Trails already show history. Scrub must not imply an unsteady storm (fields are Eulerian-steady). |
| Extra user-released tracers during Guided | **Potentially harmful** | Turns NG1 into a fan; D1 into a landing patch; S1/S2 into a cloud (`08`/`12`/`14`). Guided owns the particle list. |
| Scripted camera takeover (ARCHITECTURE Journey) | **Potentially harmful** *for these three* | Different abstraction (`§8`). Optional later genre, not required, not default. |
| Auto-stop clock at D1 exit | **Potentially harmful** | Completion is observed; user may still inspect the marker. Pause remains user-owned. |
| Concatenate other catalog ICs | **Harmful** | `§12`. |

A Guided Experiment must not become a non-interactive video.
CONCEPT’s “interface becomes minimal” is a *future cinematic
genre* constraint, not a reason to strip Pause / orbit from
these three.

---

## 8. Progression semantics

Research thresholds stay research:

```text
07 / 08 letter-pass
12 basin hit / t_ground
14 §5 Δr, residence, NG-leads
```

They are **not** user-visible physics lids and not a runtime
event API.

The ordered sequences in `§4` are:

```text
product-facing expected observables
+ explanatory copy
```

They are **not**:

- future `onOutflowEntered` detectors in this slice;
- phases the Model enters;
- completion FSMs, except D1’s domain exit which already exists
  as tracer lifecycle (`active = false`), not as a Guided API.

Do not promote occupancy bars (`Δr > 50 m`, `y ≥ 3000 m` for
O(100 s), etc.) into UI chrome. Copy may say “watch them rise
into the upper outflow region” without displaying a checkbox
tied to `G_out > 0`.

Premature abstraction: a generic `GuidedPhase[]`. Three
experiments do not need it. Revisit if a cinematic genre needs
beats that are *presentation* (camera, layers, copy) rather than
pathline predicates.

---

## 9. Completion semantics

Preserve the three different meanings.

| Experiment | “Finished” means | Hard stop? |
| --- | --- | --- |
| Inflow to upper outflow | Teaching sequence has been observable | **No.** Tracers stay active. User ends / Reset / exit. |
| Downdraft path to the ground | Pathline has exited at `y = 0` | **Lifecycle yes, session no.** Particle inactive; glyph remains; clock keeps user-owned Pause. |
| Near-ground outflow | Outward near-ground path has been observable | **No.** Ground exit is incidental, not success (`14` §14). |

Do not unify these into “tracer inactive ⇒ experiment complete.”
That would be correct for D1 and false for NG1 and S1/S2.

---

## 10. Camera ownership

Current shared pose is sufficient for all three earned exhibits
(`11`/`13` rendering; `12` §13; `14` §15). NG1’s late pad exit
does not block honesty (`15` / `16`).

Future ownership for **this catalog**:

```text
experiment MAY suggest the current default initial pose
user ALWAYS retains orbit / zoom
Follow is optional, later, user-initiated, cancellable
temporary scripted camera = ARCHITECTURE §24 Journey
                           ≠ Guided Experiment
```

Do not assume Guided Experiment and camera Journey are the same
abstraction (`16` §2.5). Do not implement camera automation.
Do not require a per-experiment camera SoT until an exhibit
leaves the default frustum *during the teaching window*.

---

## 11. Explanatory content

Two layers. Public copy may be simpler. Internal anti-claims
**must not** vanish.

### 11.1 User-facing (per experiment)

```text
title
short objective
one-paragraph intro  (prescribed laboratory; storm-relative)
allowed claim in plain language
scientific caveat    (synthetic / conceptual, not a real supercell)
```

Contextual annotations / completion copy: later. Not required to
earn the catalog conceptually.

### 11.2 Internal (must persist)

```text
allowed claim (canonical sentence)
forbidden interpretations
isolation (which experiments must not share a scene)
IC coordinates and seed-array ownership
trail / glyph policy
validation / tests of the exhibit contract
```

These live in pedagogy SoTs (`08`, `12`, `14`) and tests. A
future catalog type, if any, must reference them — not replace
them with friendlier titles.

---

## 12. Inspectability / “Why?”

Prefer **shared inspector infrastructure** (Explore + Guided).
No Guided-specific physics calculations. No inspector
implementation here.

| Quantity | Guided teaching | Class |
| --- | --- | --- |
| Altitude, simulation time | Read the path | Essential later; data already exist |
| Total velocity | “Why this direction/speed?” | Essential later; `VelocityField.sample` |
| Per-operand contributions | Honesty of **composite** paths (D1 and NG1 especially; S1/S2 too) | Essential later; shared observation API, **not** `divergence()` |
| Hodograph / env context | Frame literacy (SR laboratory vs ground-relative panel) | Reusable Explore/environment; already on screen; do not claim the tracer *is* the hodograph |
| Local vorticity diagnostics | Not the teaching object of these three | Advanced / Explore; overlays exist on the hodograph |
| Select-then-inspect | S1 vs S2; single-tracer exhibits still benefit | Desirable later |

Guided copy may *name* the intended mechanism. Inspector is how
the user checks that the live sum matches the sentence (NG leads,
inflow opposes; D1’s `V_h` is not the downdraft operand). That
is CONCEPT §13 and ARCHITECTURE §36, not a new field.

---

## 13. Explore ↔ Guided

Conceptual navigation. No persistence design.

| Question | Answer |
| --- | --- |
| Does Guided start from a clean laboratory state? | **Yes.** Canonical ICs, `t = 0`, that experiment’s trail/glyph policy. Not leftover Explore tracers. |
| Can the user leave Guided and continue exploring the resulting state? | **Useful future: yes**, as Explore, **with claims stripped**. Positions may remain as unlabeled exploratory tracers. |
| Can an arbitrary Explore state be converted into Guided? | **No.** Canonical ICs are research objects. A lucky parcel is not S1. |
| Does entering Guided overwrite exploratory tracers? | **Yes**, conceptually. Guided owns the particle list. Mixing a user cloud with D1/NG1 is the spreading/landing cartoon. |
| Is “Open this experiment in Explore” useful? | **Yes.** Either (a) exit carrying current positions without Guided copy, or (b) spawn Explore at the canonical ICs without the claim. Prefer (a) when leaving mid-run. Neither promotes the parcel to a catalog identity. |

Guided Reset ≠ Explore Reset. Guided Reset restores that
experiment’s ICs. Explore Reset is owned by the seeding SoT.

---

## 14. Anti-claim preservation

Blocking. A catalog is not a license to assemble a supercell
cartoon.

| Combination | If shown together as one Guided experience | Status |
| --- | --- | --- |
| Inflow to upper outflow + Downdraft path | Closed cell / return of this air | **Forbidden** (`10`, `12` §9, `16` §12) |
| Downdraft path + Near-ground outflow | Hit then spread; D1 as NG source; cold pool | **Forbidden** (`13` §10, `14` §12, `15`) |
| All three | Full circulation; one air’s life through the storm | **Forbidden** |

Isolation-**by-experiment** is sufficient for v1. Do not
implement a generic compatibility / dependency framework.

Catalog policy, explicit:

```text
each public experiment is shown alone
no Both
no DownwardThenOutflow
no “Complete supercell circulation” card
no “Journey of one air parcel through the storm” card
no “Downdraft becomes cold pool” card
```

A later cinematic Guided genre may sequence **camera, copy, and
layers** over the same Model (`16` §12.1). That is still not
these three pathlines as one causal chain.

Explore may show many parcels at once; it must not attribute
these catalog claims to them (`16` §12.2).

---

## 15. Future experiments not yet earned

Not in the v1 public catalog. Do not design the models here.

| Candidate | Status | Missing before it is legitimate |
| --- | --- | --- |
| Environmental shear / hodograph as a **3D pathline** experiment | **NOT YET EARNED** | Horizontally homogeneous env does not make a distinct 3D “shear path” story. Hodograph panel already teaches the profile. A dedicated 2D hodograph Guided is a different surface — not designed here. |
| Streamwise vs crosswise vorticity | **NOT YET EARNED** as 3D Guided | Overlay diagnostics exist (`08` physics). No local 3D tilting story. |
| SRH | **NOT YET EARNED** as 3D Guided | Diagnostic exists. Not a pathline exhibit. |
| Tilting of `ω_h` → `ω_z` | **BLOCKED** | Tilting / stretching architecture + rotation not merely prescribed (`15`, `02` Y12). |
| Stretching of vertical vorticity | **BLOCKED** | Same; evolving `ω_z` / coupling, not `VerticalEnvelopeRotationField`. |
| Translating storm | **BLOCKED** | D3 (`03`). Current teaching frame is StormRelativeLaboratory. |
| Cold pool / gust front / density current | **BLOCKED** | Thermodynamic / buoyancy / pressure class (`15` §8). Current NG experiment must not be renamed into this. |
| Full circulation / same-air return | **BLOCKED** | Continuity-aware model (`10` C). Isolation currently **forbids** the presentation even if someone wants the card. |
| CONCEPT cinematic Journey (strip cloud, reveal all fields) | **NOT YET EARNED** | Cloud/thermo/vorticity layers; still must not concatenate the three pathlines. |
| RFD / FFD named flanks | **BLOCKED** | Naming + distinct physics; not a second prescribed patch. |

---

## 16. Catalog scalability and abstraction

v1 public catalog size: **3**.

| Scale | Can docs + existing composition hold it? | Can `TracerPedagogy` hold it as product content? |
| --- | --- | --- |
| 3 | **Yes** (this document + `08`/`12`/`14` + four arrays) | Awkward, but works as internal mapping |
| 10 | Docs catalog + composition mapping, still plausible | Enum as content store becomes a smell |
| 20–50 | Need a catalog data object | **No.** Enum must not grow into the CMS |

**Do not introduce `GuidedExperiment` now.** Three earned
entries do not require a production type (`16` §9, `01` / `08`
anti-framework).

Introduce it later when at least one of `16` §9’s triggers is
true: Guided shell must list experiments without speaking enum;
experience data the enum cannot carry becomes selected product
state; multiple scenarios; persistence / deep-link.

Until then: this document is the catalog; composition remains
the mapping; `LIVE_DEMO_TRACER_PEDAGOGY` remains a developer
constant.

---

## 17. Required verdicts

```text
Guided interaction model:     B
                              instructor in the same laboratory
                              hypothesis confirmed for this catalog

current public catalog:       3 earned
                              Inflow to upper outflow
                              Downdraft path to the ground
                              Near-ground outflow

diagnostic trio:              not public Guided
                              advanced / scientific preset
                              + developer composition default

Guided abstraction:           later, not now

next product slice:           Guided runtime (`20`)
                              catalog content in this document
                              remains authoritative; runtime
                              identity / lab lifecycle are `20`
```

Why not A (catalog implementation): would force a type or DTO
migration the enum can still map. Catalog is locked in docs.

Why not C (inspector SoT) next: “why?” is shared and important,
but current trail teaching does not block on it. Inspector wants
a defined Explore tracer population as well as curated ones.

Why not D (shell architecture) next: `16` already locked
Explore | Guided as top-level nav. Another shell SoT would
overlap until Explore seeding exists; otherwise Guided remains
the only way to have tracers.

Why B: Explore is the other half of the product; seeding
ownership is the hole that would otherwise dump user ICs into
Guided arrays or ScenarioConfig (`16` §6–§7).

---

## 18. Modeling pause

**Physics remains paused** (`15` D, `16` §16).

This catalog does not create a modeling prerequisite. No new
operand, no thermo, no solver, no tilting implementation.

When modeling resumes:

```text
tilting / stretching interaction architecture SoT
```

unchanged.

---

## 19. Compact lock-in

```text
Guided interaction model:        B
                                 same laboratory; curated ICs +
                                 teaching structure; user keeps
                                 Pause / Reset / timeScale / orbit
                                 not a prerecorded ride
                                 not a different simulation

public catalog:                  Inflow to upper outflow (S1+S2)
                                 Downdraft path to the ground (D1)
                                 Near-ground outflow (NG1)

diagnostic trio role:            advanced / scientific preset
                                 + developer default
                                 not a public Guided card

experiment isolation policy:     one public experiment on screen
                                 no Both; no concatenated pathlines
                                 isolation-by-experiment sufficient
                                 no compatibility framework

S1/S2 presentation:              one experiment, two simultaneous
                                 curated tracers; family not luck
                                 not two cards; not optional S2

interaction controls:            required: Pause, Reset, timeScale,
                                 orbit, zoom, exit to Explore
                                 later: select, follow, inspect,
                                 layers, scrub
                                 harmful: extra Guided tracers,
                                 default scripted camera,
                                 auto-stop as substitute for Pause

progression semantics:           explanatory expected sequence
                                 not runtime event API
                                 research thresholds stay research

completion semantics:            S1/S2: no hard completion
                                 D1: domain exit is the climax
                                 NG1: outward path is the climax;
                                      ground exit incidental

camera ownership:                shared default pose sufficient
                                 user retains orbit
                                 Follow later, user-initiated
                                 camera Journey ≠ this catalog

explanatory-content ownership:   public: title, objective, intro,
                                 claim, synthetic caveat
                                 internal anti-claims persist in
                                 pedagogy SoTs / tests

inspector relationship:          shared Explore+Guided later
                                 V_total + per-operand contributions
                                 essential later, not Guided-only
                                 physics; not divergence()

Explore↔Guided relationship:     Guided starts clean / canonical
                                 entering Guided overwrites
                                 exploratory tracers
                                 leave-to-Explore may keep positions
                                 with claims stripped
                                 Explore state cannot become Guided
                                 “Open in Explore” useful

anti-claim policy:               S1/S2+D1, D1+NG1, all three
                                 forbidden as one experience
                                 no circulation / one-air-life /
                                 downdraft-becomes-cold-pool cards

future blocked experiments:      tilting, stretching, D3,
                                 cold pool / gust front,
                                 full circulation, named RFD/FFD
                                 cinematic CONCEPT Journey
                                 not yet earned

GuidedExperiment abstraction
timing:                          generic lesson type still later
                                 minimal public id is `20`
                                 enum must not become a CMS at
                                 20–50

catalog scalability:             3: docs + composition
                                 10: still plausible
                                 20–50: catalog data object then

next product slice:              Guided runtime (`20`)
                                 catalog UI not started here
                                 Explore + Inspector are live
                                 (`18`, `19`); this document
                                 remains the catalog of *what*

next modeling slice:             still paused
                                 then tilting/stretching
                                 interaction architecture SoT

blockers:                        none for the seeding SoT
                                 catalog implementation blocked
                                 by this document (no type yet)
                                 cinematic Journey blocked by
                                 missing layers + anti-claims
                                 inspector blocked by missing
                                 selection + contribution API
                                 (future)

production this slice:           none
```

---

## 20. STOP

This catalog SoT does not start a `GuidedExperiment` type,
catalog implementation, UI, arbitrary seeding, inspector, camera
automation, event detection, physics, tilting/stretching,
thermodynamics, or a continuity solver.

Do not add a fourth public card for DiagnosticProbes.
Do not split S1 and S2 into two experiments.
Do not treat NG1’s ground exit as completion.
Do not assemble a circulation Journey from the three cards.

Next work starts only when commanded.
