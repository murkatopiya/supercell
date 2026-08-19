# Whole-Product Direction Checkpoint

**Status:** whole-product capability map after Guided v1.
Current perceptual-loop and physics-resumption decision:
`docs/architecture/24-perceptual-exploration-checkpoint.md`.
**Scope:** post-Guided-v1 whole-product assessment
**Physics:** pause lifted for design in `24`. This file does
not resume physics implementation.
**Implementation:** perceptual airflow Slice 1–2 COMPLETE
in `22`. Workbench COMPLETE in `23`. Exploration-loop
decision in `24`: comets provisional; tint diagnostic;
Background REJECTED; further visual optimization deferred.
Guided population NOT STARTED. Other §13 candidates remain
unchosen as implementation except that Candidate 1's current
question is closed in `24`.

This document remains the whole-product capability map. It did
not pick a winner among §13 candidates. Candidate 1 (perceptual
airflow) is specified as architecture exploration
`docs/architecture/22-perceptual-airflow-architecture.md`.
Headless visual population (Slice 1) and first Explore
browser exposure (Slice 2) now exist there. Slice A
workbench comparison and the prototype comparison slice live
in `docs/architecture/23-perceptual-airflow-workbench.md`.
The current perceptual-loop decision and physics resumption
live in
`docs/architecture/24-perceptual-exploration-checkpoint.md`.
Product encoding is not locked. Guided population has not
started. Other §13 candidates remain unchosen as the next
implementation branch.

This document did **not** change production code when written.
It does **not** create `ROADMAP.md`.

Verified against:

```text
eff2cad7954ec76f57416dda811be33e6be4599d
```

Authoritative product / architecture going in:

- `docs/CONCEPT.md`
- `docs/ARCHITECTURE.md`
- `docs/architecture/15-post-near-ground-outflow-checkpoint.md`
- `docs/architecture/16-explore-guided-interaction-architecture.md`
- `docs/architecture/17-guided-experiment-catalog.md`
- `docs/architecture/18-explore-arbitrary-seeding.md`
- `docs/architecture/19-shared-tracer-inspector.md`
- `docs/architecture/20-guided-runtime-architecture.md`

External review (decision input, **not** SoT):

```text
docs/reviews/2026-08-18-independent-project-audit.md
docs/reviews/2026-08-19-independent-perceptual-airflow-review.md
```

Physics pause of `15` D is lifted for design in `24`. When
modeling proceeds, the leading physics-architecture
*direction* from existing SoT is still tilting / stretching
interaction architecture — unless the docs-first revalidation
in `24` replaces that. This checkpoint does **not** replace
that design and does **not** command implementation.

---

## 1. Why this checkpoint exists

The project finished a large product cycle:

```text
prescribed seven-operand storm-relative laboratory
  → earned exhibits
  → Explore
  → arbitrary point release
  → stable tracer identity
  → selection / picking
  → shared Inspector
  → Guided experiment identity / runtime
  → Guided teaching surface
```

The next step must not be the nearest convenient feature.

The question is:

> What now most limits movement toward Supercell Explorer:
> the model's ability,
> the user's ability to see the system,
> the user's ability to investigate it,
> or the user's ability to understand what they see?

This document answers that as an assessment, then maps
capability families and a decision matrix. It does **not**
pick a winner.

---

## 2. Current system inventory

Inventory of what the live product actually does. Not a wish
list.

### 2.1 Physics / model

```text
IntegrationFrame     = StormRelativeLaboratory
model class          = prescribed storm-relative kinematic laboratory
not                  = CFD
not                  = mass-consistent circulation
not                  = thermodynamics / cold pool
continuity           = YELLOW
physics              = PAUSED
integrator           = Euler
DEMO timestep        = 0.1 s   (DEMO fixture, not a production DEFAULT_DT)
AtmosphericTracerDomain = y ≥ 0  (atmospheric tracers only)
field sampling       = unbounded
```

Seven current operands, independently prescribed, summed by
`CompositeVelocityField`:

1. `StormRelativeEnvironmentalAdvectionField`
2. `VerticalEnvelopeUpdraftField`
3. `VerticalEnvelopeRotationField`
4. `LowerRadialInflowField`
5. `UpperRadialOutflowField`
6. `VerticalEnvelopeDowndraftField`
7. `NearGroundRadialOutflowField`

Presence ≠ exhibit (`15` §2). Explore and Guided use the same
stack. Switching experience does not add or remove operands.

The additive cartoon for this laboratory class is complete
enough to stop adding sibling `VelocityField`s (`15` §1, §7).
That completeness is **not** completeness of a supercell.

### 2.2 Explore

Live (`18` Slices 1–4):

- arbitrary point release;
- user-selected altitude + XZ placement on the ground-reference
  plane;
- late birth at current simulation time (running or paused);
- multiple releases;
- Reset (cohort replay from Explore runtime seeds at `t = 0`);
- Clear (drop tracers; clock unchanged);
- unlabeled passive tracers;
- empty session is legal.

Not live: line / plane / volume seeding, delete-one,
continuous emitter, persistence, carrying Guided particles into
Explore.

### 2.3 Shared tracer interaction

Live (`19` Slices 1–4):

- stable `tracerId` assigned by `Simulation` at birth;
- visible-glyph picking (slot index → `tracerId`);
- `TracerSelection` owned by App / interaction, not by
  `Simulation`;
- selected highlight observed by `TracerScene`;
- shared Explore / Guided Inspector;
- Level 1 motion (id, position, altitude, time, age, active,
  `V_total`, speed);
- Level 2 current-model decomposition (`V_i` then `V_total`);
- same operand instances the integrator samples;
- inactive tracer remains selected and inspectable while the
  particle exists;
- hidden inactive glyph is not newly pickable.

Not live: Follow, Level 3 diagnostics, delete-one, persistence.

### 2.4 Guided v1

Exactly three public experiments (`17`, `20`):

| Public id | Title | Canonical ICs |
| --- | --- | --- |
| `inflow-to-upper-outflow` | Inflow to upper outflow | S1 + S2 together |
| `downdraft-path-to-ground` | Downdraft path to the ground | D1 |
| `near-ground-outflow` | Near-ground outflow | NG1 |

Live:

- public `GuidedExperimentId`;
- runtime switching (`switchGuidedExperiment` → fresh lab);
- in-place Guided Reset;
- canonical mapped cohorts via internal `TracerPedagogy`;
- teaching surface: Observe / Demonstrates / Does not mean;
- shared laboratory honesty line;
- same physics model as Explore;
- shared Inspector;
- session-local memory of last Guided id;
- default open: `inflow-to-upper-outflow`.

`TracerPedagogy` remains internal composition.
`DiagnosticProbes` is not a public catalog entry.
Isolation remains mandatory: no `Both`, no concatenated
pathlines, no D1-as-NG-source card.

### 2.5 Current perceptual / rendering surface

What is actually on screen:

- 3D tracer glyphs (spheres);
- trails where the experience enables them (`THREE.Line` from
  `TracerPathHistory`);
- ground / reference grid (`GridHelper`, 10 km / 10 divisions)
  and axes helper;
- hodograph panel with overlay toggles (storm motion,
  storm-relative wind, horizontal vorticity, streamwise /
  crosswise), layer fixture `[0, 1000] m`, selected height `0`;
- workbench layout: hodograph | laboratory | inspector;
- camera: `OrbitControls` around DEMO target
  `(0, 4000, 0)`, camera `(12000, 6000, 12000)`, FOV 50°,
  damping off;
- Pause / timeScale `1/5/10/20×` / Reset;
- Inspector panel;
- Guided teaching annotations;
- Explore placement controls and a pending-release preview
  marker (not a particle);
- Explore background visual airflow (Slice 2): hundreds of
  non-pickable `THREE.Points` markers advected by the same
  `V_total` as scientific tracers. Guided has no population.

Not present, and not to be attributed:

- streamlines, ribbons, vector-field glyphs, volumetric
  scalars;
- cloud, precipitation, thermodynamic rendering;
- labeled distance ticks on the grid;
- Follow camera;
- product pan / target translation / reset-view control;
- timeline scrubber;
- local SRH card;
- Guided population / population hide toggle.

`CONCEPT` §4's other artificial senses are not started.

### 2.6 What this inventory implies

The laboratory can host prescribed pathlines, release probes,
select one tracer, and explain that tracer from the same field
sum the integrator uses.

Explore can show a moving background occupancy of `V_total`
(Slice 2 Points). That occupancy is not yet a coherent
readable field structure, especially on Pause (P3 / `23`).
That is a product fact, not a rendering complaint.

---

## 3. Playtest finding P1 — camera navigation / fixed orbit target

**Status:** PLAYTEST FINDING / candidate interaction work

Observed:

The user can orbit and zoom, but the scene stays bound to a
fixed target / center. On approach, the natural desire is to
translate the interesting region inside the viewport — for
example raise the ground / storm region in the frame. Drag
instead rotates around the DEMO target.

Live code:

```text
DEEP_STORM_TRACER_VIEW.target = (0, 4000, 0)
OrbitControls constructed; enableDamping = false
no product reset-view
no Follow
enablePan is not a designed/labeled product control
```

Product implication: future spatial navigation at the level of

```text
orbit
zoom
pan / target translation
```

with a reasonable canonical reset view.

Do **not** implement here.
Do **not** design Follow inside P1.
Future camera architecture must not needlessly block Follow
(`CONCEPT` §7, `ARCHITECTURE` §24).

---

## 4. Playtest finding P2 — tracer relevance / lifetime / unbounded trails

**Status:** PLAYTEST FINDING / future lifecycle + visualization
policy question

Observed:

A Guided S1/S2 tracer can leave the support of all local storm
operands and continue indefinitely under
`environmentAdvection` alone. Inspector honestly shows:

```text
environmentAdvection != 0
all local storm contributions ≈ 0
```

The Inspector is not broken.

Current lifecycle, verified in production:

```text
ground-crossing y < 0  →  deactivate (AtmosphericTracerDomain)
horizontal / upper / max-age relevance boundary  →  absent
active tracer  →  continues to integrate
path history  →  appends every stride-1 step while active;
                 no retention cap
storm-contributions-zero  →  does not kill the tracer
```

Conceptual distinction, which must not be collapsed:

```text
physically / advection-active
  != currently relevant to an experiment
  != must keep unlimited visual trail / history
```

Do **not** introduce an arbitrary cutoff here.
Especially do **not** adopt:

```text
all storm contributions zero → kill tracer
```

Environmental advection is a real operand of the current
model. Killing on “local storm ≈ 0” would falsify the
laboratory.

This is a future lifecycle **and** visualization policy
question, not a current bug.

---

## 4.1 Playtest finding P3 — paused Points have no direction

**Status:** PLAYTEST FINDING / representation evaluation in `23`

Observed after Slice 2:

During motion the background volume feels like a living
medium, but named `V_total` regions stay weakly readable.
On Pause the population reads as a random grey cloud.

Encoding fact, not an opacity/count diagnosis:

```text
position-only point
  = no instantaneous direction cue
```

Direction in live `THREE.Points` is only a temporal percept.
Workbench comparison of encodings is specified in
`docs/architecture/23-perceptual-airflow-workbench.md`.

Do **not** implement oriented marks, Eulerian samples, or
streamlines here.

---

## 5. Independent audit — authority

The 2026-08-18 independent audit is stored at
`docs/reviews/2026-08-18-independent-project-audit.md`.

```text
authority     external review / decision input
not           project SoT
not           a schedule
not           a physics rewrite authorization
```

Factual claims about the live stack, Euler, `dt = 0.1`,
hodograph fixture, missing Follow, YELLOW continuity, and
sparse rendering were checked against current `main`. Where
the audit over-reads `CONCEPT` §8, invents a binary model
fork, or treats STOP discipline as the absence of a plan,
§6–§7 record the rejection.

Author-proposed roadmap, streamfunction redesign, merging
downdraft + near-ground outflow into one circulation cell,
automatic RK2 switch, dataset sequence, and Journey-as-one-air
remain **external recommendations / open candidates** until an
explicit later decision says otherwise. This checkpoint does
not say otherwise.

---

## 6. What we accept from the external audit

### A. A high-level capability map is needed

Not a rigid multi-year implementation roadmap.

`CONCEPT` §14 already requires progressive development and
forbids using long-term vision as an excuse for premature
complexity.

### B. Documentation debt is real

Current-looking stale documents are dangerous. This checkpoint
registers the debt and applies only minimal metadata where a
document would otherwise contradict this SoT. It does not
rewrite historical reasoning.

### C. Continuity is real physics debt

The current additive prescribed model is not a mass-consistent
circulation. Continuity remains:

```text
YELLOW
```

That does **not** mean “rewrite the model now.”

### D. Divergence-free / streamfunction redesign

```text
OPEN FUTURE SYNTHETIC-MODEL CANDIDATE
not NEXT APPROVED PHYSICS BRANCH
```

Needs a separate physics investigation / checkpoint if ever
opened.

### E. Synthetic laboratory vs physically simulated datasets

This is an important architectural fork / evolutionary
boundary.

`CONCEPT` §§9, 11, 14 already allow growth from synthetic
fields toward numerical atmospheric model datasets.

The current synthetic laboratory must not be treated as a
worthless temporary rung. It can remain a mechanism laboratory
even if dataset-backed exploration appears later.

### F. Perceptual layer is now a first-class product concern

`CONCEPT` begins:

```text
Perceive the invisible atmosphere.
```

The current product can investigate pathlines. It still shows
storm airflow very poorly as a whole structure.

---

## 7. What we do not accept without a separate decision

### Not accepted: “the project is stuck because ROADMAP.md is missing”

STOP checkpoints are intentional decision discipline. They are
why Explore, Inspector, and Guided v1 exist after physics was
paused.

Absence of a capability map has **now** become debt. It was
not the cause of missing progress.

This checkpoint therefore writes a capability map and a
decision matrix. It still does **not** create `ROADMAP.md`.

### Not accepted: the binary

```text
mass-consistent synthetic model
OR
forever cartoon
```

That is a false dichotomy.

At least this path remains allowed:

```text
prescribed mechanism laboratory
  → richer interaction / perception
  → optional future physically simulated datasets
```

while keeping the synthetic laboratory as a distinct mode /
instrument.

### Not accepted: divergence-free automatically unlocks a realistic Journey

`∇ · V = 0` by itself does not prove a realistic parcel
trajectory or a supercell circulation.

### Not accepted: D1 → NG1 causal continuation

The current model does not support it (`14`, `15`, `17`).

Even a future continuity redesign must not automatically
authorize that claim without a separate physical check.

### Not accepted: Journey = necessarily same-air-mass circulation

`CONCEPT` §8 Journey Mode is a guided user/camera/layer
sequence through storm structure:

```text
approach inflow
enter updraft
observe rotation
move through altitudes
return toward the lower storm
freeze
remove visible cloud
reveal fields
```

That is a presentation journey, not a concatenated parcel
biography. `16` §1 already forbade using Journey as a license
to concatenate S1/S2 + D1 + NG1.

---

## 8. Capability map

Not a dated roadmap. Not an implementation sequence.

Qualitative leverage uses:

```text
HIGH     unlocks a CONCEPT-visible user ability on the current
         laboratory class, or unblocks several other families
MEDIUM   real product gain, narrower or more easily postponed
LOW      valuable later, or dependent on a model-class change
```

“Depends on physics?” means: does this family *require* a new
physical model class / new operand / new dataset, or can it be
pursued on the current seven-operand laboratory?

### A. Perceive

How a person **sees** invisible airflow / storm structure.

**Current:** sparse tracers and pathlines; curated Guided
cohorts; manually released Explore probes.

**Missing / candidates:** population or continuous seeding;
richer airflow visualization; streamlines / pathlines /
particles as appropriate; later scalar / vector layers; later
cloud / precipitation / thermodynamic rendering **if** the
model or data supports them.

**Product requirement, locked here:**

> Point release is an inquiry / probe mechanism, not the
> intended sole final representation of supercell airflow.

Do **not** design a mass-particle implementation architecture
in this checkpoint.

Do **not** decide in advance:

```text
same Simulation particles
vs
separate visualization population layer
```

That is a future exploration.

### B. Navigate / interact

**Current:** orbit / zoom; Guided / Explore; placement;
picking / selection; selected highlight.

**Candidates:** pan / target translation; reset view; Follow
selected tracer; selected-trail emphasis / dim others;
deselection ergonomics; later richer spatial navigation.

Do **not** assign Follow automatically as next.

### C. Understand

**Current:** hodograph overlays; Guided teaching copy;
Inspector Level 1; Inspector Level 2 decomposition.

**Candidates:** derived diagnostics / Level 3; stronger
hodograph ↔ 3D linkage; later vorticity / deformation /
convergence diagnostics; layer explanations.

Honesty preserved:

- no local SRH card as if it were 3D storm structure;
- prescribed rotation velocity ≠ diagnosed vertical vorticity;
- no fake diagnostics.

### D. Model

**Current:** prescribed seven-operand kinematic laboratory.

**Earned / open candidates, not one mandatory sequence:**

- tilting / stretching interaction architecture — current
  leading modeling branch from existing SoT **when physics
  resumes**;
- continuity / mass-consistency investigation;
- divergence-free / streamfunction synthetic redesign
  candidate;
- integration-method decision (Euler / RK2);
- later thermodynamics / cold pool only via an explicit
  model-class transition.

### E. Data / model-source evolution

Boundary:

```text
synthetic mechanism laboratory
vs
physically simulated atmospheric dataset
```

Already generic enough to reuse later, in principle:

- `VelocityField.sample(position, time)`;
- `Simulation` / integrator / tracer lifecycle;
- observe-only rendering;
- probes / Inspector as consumers of the same fields.

Synthetic-only semantics that must not silently travel:

- seven named prescribed operands as “the anatomy of a
  supercell”;
- Guided anti-claims tied to this additive cartoon;
- DEMO occupancy numbers;
- Eulerian-steady fields.

Capabilities that need a richer source: thermodynamic /
cloud / precipitation layers, unsteady storm evolution,
honest time-scrubbing of atmospheric state.

Do **not** start dataset implementation here.

### F. Time

**Current:** simulation clock, pause, speed, reset.

**Missing / candidates relative to `CONCEPT` §6:** meaningful
time exploration; scrubbing / freeze / replay only if
architecture and data permit; later temporal dataset
navigation.

Do **not** design a timeline engine here. Current fields are
Eulerian-steady; a scrubber must not imply an unsteady storm.

---

## 9. Capability assessment

| Capability | Current state | Missing user ability | Depends on physics? | Product leverage | Open questions |
| --- | --- | --- | --- | --- | --- |
| A. Perceive | Sparse glyphs/pathlines; curated cohorts; manual probes | See storm airflow as a structure without placing every probe by hand | No for a visualization of **current** `V`. Yes for cloud / thermo / precip | **HIGH** vs CONCEPT “perceive the invisible atmosphere” | Simulation particles vs a visualization population? Streamlines vs pathlines vs particles? How to avoid a false mass reading under YELLOW `∇ · V`? |
| B. Navigate / interact | Orbit/zoom; Explore/Guided; pick/select | Frame a region (pan / target translation); reset view; later Follow | No | **HIGH** for P1 (framing). **MEDIUM** for Follow (investigation, not perception of the whole) | Pan without breaking placement picking; Follow without hiding laboratory scale; deselection |
| C. Understand | Guided copy; Inspector L1/L2; hodograph overlays at a fixture layer | Deeper local questions; hodograph that talks to 3D; later honest diagnostics | Mostly no for L3 of the **current** sum. Yes for tilting as evolved `ω` | **MEDIUM** now (L2 already answers “why this tracer”). **HIGH** later if diagnostics stay honest | What is Level 3 without fake SRH/vorticity cards? How strongly to bind hodograph height to 3D? |
| D. Model | Seven-operand prescribed laboratory; physics paused | New model abilities (derived rotation, mass-consistent circulation, thermo) | **Yes** | **HIGH** for future model class; **LOW** as an *immediate* user-facing gain on the current cartoon | Tilting SoT vs continuity investigation vs streamfunction candidate — not one sequence |
| E. Data / source | Synthetic only | Dataset-backed storm state; later thermo/cloud layers | **Yes** (source class) | **HIGH** for CONCEPT breadth; not required to finish the current laboratory | Which interfaces stay; which Guided claims are synthetic-only; keep synthetic lab as a mode? |
| F. Time | Pause / speed / reset on a steady field | Explore time as a dimension; later dataset time | No for freeze-while-orbiting (already possible). Yes for true atmospheric time | **LOW–MEDIUM** on the current steady lab. **HIGH** after an unsteady source | Do not fake unsteadiness; replay vs re-integration |

### 9.1 What currently most limits movement toward CONCEPT

After Guided v1, the user can **investigate** a probe and
**understand** why that probe moves, inside a paused
prescribed model.

The larger gap versus `CONCEPT` is **perception of the storm
as a system**, with **navigation/framing** (P1) as a concrete
interaction limit on that perception.

The model is not the present bottleneck *of the current class*:
`15` already stopped adding siblings, and physics is paused on
purpose. Continuity YELLOW and missing tilting are real model
debts, but they are not why the live scene is a handful of
spheres rather than airflow.

This assessment does **not** select the next branch.

---

## 10. Distance to `CONCEPT`

Not a percentage.

| Dimension | Distance |
| --- | --- |
| Kinematic mechanism laboratory maturity | **High for this class.** Seven honest operands, isolation, anti-claims, earned exhibits. Not a supercell. Physics paused. |
| Interaction / exploration maturity | **Moderate.** Point release, pick, select, Inspect, Guided/Explore exist. Pan/reset/Follow/population tools do not. Shell is still temporary. |
| Explanation / teaching maturity | **Moderate for three mechanisms.** Guided Observe / Demonstrates / Does not mean plus Inspector L2. Weak hodograph ↔ 3D. No Level 3. |
| Perceptual storm-representation maturity | **Low.** Airflow is sparse probes and curated pathlines. No structural flow visualization. |
| Physical model breadth | **Narrow by design.** Prescribed kinematics only. No coupling, no buoyancy, no moisture. |
| Thermodynamic / cloud / precipitation maturity | **None.** Explicitly later; requires a model-class or dataset transition. |
| Time-exploration maturity | **Minimal.** Play/pause/speed/reset on an Eulerian-steady field. |
| Dataset / model-source maturity | **None in production.** Architecture anticipates `DatasetVelocityField`; no adapter. |

---

## 11. Key product distinction

Four different product roles. They must not be collapsed.

```text
single / arbitrary tracer release
  = scientific inquiry / probe mechanism

mass / population airflow visualization
  = perceptual representation of the flow

Guided cohort
  = curated teaching observation

selected tracer + Inspector
  = local explanation
```

Do **not** decide yet whether all four roles must share one
runtime particle implementation.

---

## 12. Physics honesty boundary

Automatic claims remain forbidden until a future model actually
supports them:

```text
same-air-mass circulation
realistic parcel
mesocyclone capture
full supercell circulation
downdraft → cold pool
D1 → NG1 causal continuation
RFD / FFD
cold pool / gust front / density current
```

Guided isolation (`17` §14) remains in force. Explore may show
many unlabeled tracers at once; it still must not attribute
those catalog stories to them (`16` §12.2).

Prescribed `VerticalEnvelopeRotationField` is not diagnosed
vertical vorticity and not a mesocyclone.

YELLOW `∇ · V` is not mass spreading, not mass conservation,
and not a reason to hide environmental advection.

---

## 13. Decision matrix — next large cycle

No winner. Comparison only.

Leverage here is toward `CONCEPT`, not toward local elegance.

### Candidate 1 — Perceptual airflow / population visualization

**User ability gained:** open the laboratory and see the
structure of a living flow without releasing every probe by
hand.

**Toward CONCEPT:** directly serves “perceive the invisible
atmosphere” and §4 airflow.

**Depends on new physics?** No, for visualizing current `V`.

**Premature-architecture risk:** **HIGH** if this checkpoint
chose Simulation particles vs a visualization layer, GPU, or
a continuous emitter that reads as a mass source under YELLOW
`∇ · V`.

**Reuses:** `VelocityField`, domain, observe-only rendering,
path-history owner, Inspector (for sampled members), Guided
honesty.

**What we would learn:** whether the storm becomes legible as
a structure; where false mass/circulation readings appear;
what density is enough; whether probes and population can
share a runtime.

**Does its absence block others?** It blocks the *feeling* of
a storm. It does not block pan, Follow, Inspector L3, or a
physics SoT.

### Candidate 2 — Camera / navigation work

**User ability gained:** freely frame and investigate a region
of space (orbit + zoom + pan / target translation, plus reset
view).

**Toward CONCEPT:** §3 “move through the storm” at laboratory
scale.

**Depends on new physics?** No.

**Premature-architecture risk:** **LOW–MEDIUM** if pan is
specified as product camera contract and coexistence with
placement picking is designed. **HIGH** if it becomes a
generic camera engine.

**Reuses:** current `OrbitControls` pose fixture,
`DEEP_STORM_TRACER_VIEW`, picking gates.

**What we would learn:** whether framing, not physics, was the
playtest limiter (P1); how reset-view should be canonical.

**Does its absence block others?** It frustrates looking
closely. It does not block population visualization, but
population without framing will still be hard to read.
Must not block Follow.

### Candidate 3 — Follow / selected-tracer interaction

**User ability gained:** not lose the selected tracer; travel
with its path.

**Toward CONCEPT:** §7 Lagrangian complement to Eulerian view.

**Depends on new physics?** No.

**Premature-architecture risk:** **MEDIUM.** Follow needs a
camera contract and cancellable user initiation (`17` §7).
Auto-follow would hide scale.

**Reuses:** `tracerId`, selection, Inspector, path history.

**What we would learn:** whether Lagrangian travel is teachable
on this model without implying a realistic parcel.

**Does its absence block others?** P2 (lost S1/S2 far
downstream) is partly a Follow/relevance problem. Follow does
not by itself create storm-scale perception.

Not automatically next. P1 must not be used as a smuggled
Follow design.

### Candidate 4 — Diagnostics / understanding expansion

**User ability gained:** answer deeper questions about local
field structure.

**Toward CONCEPT:** §13 “why?”; `ARCHITECTURE` §28 / §36.

**Depends on new physics?** No for richer observation of the
current sum. Yes for evolved vorticity / tilting.

**Premature-architecture risk:** **HIGH** if Level 3 invents
local SRH, curl-as-mesocyclone, or `divergence()` as a teaching
quantity (`10` forbids a production divergence API sold as
mass budget).

**Reuses:** Inspector observation adapter, operand instances,
hodograph diagnostics (`06`/`08`/`09` physics).

**What we would learn:** which “why” questions the current
model can honestly answer, and which need a new model class.

**Does its absence block others?** Local explanation of a
selected tracer is already possible at L2. The gap is weaker
than perception of the whole.

### Candidate 5 — Resume physics: tilting / stretching interaction architecture

**User / model ability gained:** a new ability of the synthetic
model — rotation as an interaction, not an independent
prescribed spin — **if** that SoT later earns an
implementation.

**Toward CONCEPT:** “I can see the rotation” as a process, not
a painted vortex.

**Depends on new physics?** **Yes.** `02` Y12: not an eighth
operand; `CompositeVelocityField` cannot host it as independent
addition.

**Premature-architecture risk:** **HIGH** if implementation
starts before the architecture SoT, or if prescribed `Ω` is
relabeled “tilting.”

**Reuses:** env `ω_h` diagnostics, updraft gradients as
*conceptual ingredients only* (`15` §9).

**What we would learn:** whether derived rotation is even
expressible in this laboratory without a new model class;
whether teaching “capture” ever becomes honest.

**Does its absence block others?** It blocks honest mesocyclone
process claims. It does not block perception, pan, or Inspector
of the current sum.

**Status:** leading modeling *direction* from existing SoT
**when physics resumes**. Docs-only first. **Not selected** as
the next implementation branch by this checkpoint. Physics
pause later lifted for design in `24`; that is still not an
implementation order. Existing direction requires
revalidation before any architecture SoT is treated as
current.

### Candidate 6 — Continuity / mass-consistency investigation

**User / model ability potentially gained:** decide whether a
next synthetic circulation class is needed, and what it would
be.

This is an **investigation candidate**, not a promise to
rewrite.

**Toward CONCEPT:** only if the teaching goal becomes
mass-consistent circulation (`10` C). Not required to perceive
or probe the current laboratory.

**Depends on new physics?** The investigation is docs/analysis.
A subsequent redesign would be a model-class change.

**Premature-architecture risk:** **HIGH** if investigation is
treated as authorization to implement streamfunctions, merge
D1/NG1, or drop anti-claims.

**Reuses:** `10`, `13` §6, `15` §6 identities; no new
`divergence()` API required to reason.

**What we would learn:** whether YELLOW is acceptable for a
mechanism lab; whether a divergence-free candidate is worth a
later SoT; what claims would still be forbidden even if
`∇ · V = 0`.

**Does its absence block others?** It blocks *circulation*
claims. It does not block perceptual or interaction work on
the current sum.

**Status:** open investigation candidate. Streamfunction
redesign, if ever, remains a nested candidate inside this
family — not approved.

### Candidate 7 — Dataset / model-source architecture exploration

**User / model ability potentially gained:** a path toward
richer physically simulated storm state and future
thermodynamic / cloud / precipitation layers.

Not necessarily implementation.

**Toward CONCEPT:** §§11, 14 long-term; thermo layers that
`CONCEPT` §12 forbids synthesizing as a full solver.

**Depends on new physics?** Depends on a new **source class**,
not on another prescribed operand.

**Premature-architecture risk:** **HIGH** if a dataset adapter
is built before the synthetic laboratory's product roles are
stable, or if synthetic-only claims are copied onto data.

**Reuses:** `VelocityField`, probes, Simulation, observe-only
rendering.

**What we would learn:** which contracts are already generic;
what is DEMO-only; whether the synthetic lab should remain a
mode.

**Does its absence block others?** It blocks cloud/thermo
maturity. It does not block finishing perception/interaction
on the synthetic lab.

---

## 14. Documentation debt register

Not a bureaucracy. A compact list. Types are not interchangeable.

| Item | Type | Notes |
| --- | --- | --- |
| Current-looking stale docs (`02` live-stack snapshot; `03` “story tracers not authorized”; `10` five-operand maps; `11` §9 `Vy_total ≥ 0`; physics `21` pedagogy-deferred leftover; rendering `01` operand list lag; rendering `02` “trails not live”) | **debt** | Historical bodies stay. Minimal metadata only where they would contradict this checkpoint. |
| Euler vs RK2 in production | **open design question** | Euler is live; RK2 is tested and unused in composition. Numerical harm is believed small; decision is undocumented. |
| Continuity YELLOW | **debt** (physics) | Residual O(mechanism strain). Not a production bug. Not RED unless forbidden claims are sold. |
| Rendering / perceptual gap | **future capability** | Sparse glyphs vs CONCEPT airflow. |
| Follow absent | **future capability** | CONCEPT §7 / ARCHITECTURE §24. Deferred on purpose in `19`/`20`. |
| Hodograph ↔ 3D weak linkage | **debt** / **future capability** | `selectedHeight = 0`, vorticity layer `[0, 1000]`. Not a physics bug. |
| Time exploration immature | **future capability** | Pause/speed/reset only; fields steady. |
| Repository hygiene (`tmp/`, `tmp-guided-slice3-chrome`) | **debt** | `tmp/` not in `.gitignore`. Untracked local debris. Not a product bug. |
| `ARCHITECTURE.md` §30 lists `ROADMAP.md` / ADR / `PHYSICS.md` | **open design question** | Future docs layout. This checkpoint explicitly does not create `ROADMAP.md`. |
| P2 unbounded trail / relevance policy | **open design question** | Not a bug. Do not kill on local-storm-zero. |
| Four-mode selector in `15` §11 | **debt** (docs pointer) | Superseded by `16`. Leave `15` historical. |
| Inspector Level 3 | **future capability** | Not missing because L2 is broken. |
| `LIVE_DEMO_TRACER_PEDAGOGY` | closed in `20` | Mentioned only so older docs are not misread as live. |

---

## 15. Compact lock-in

```text
current product:              seven-operand SR kinematic laboratory
                              Explore point release
                              shared Inspector L1/L2
                              Guided v1 three experiments
                              physics PAUSED

continuity:                   YELLOW
                              not mass-consistent circulation

perceptual surface:           glyphs, trails, grid, hodograph,
                              Inspector, Guided copy
                              Explore background Points (Slice 2)
                              Guided population not live
                              representation UNDER EVALUATION
                              (`23`; P3 Pause encoding limit)

P1:                           playtest finding
                              orbit/zoom around fixed target
                              pan/target translation candidate
                              no Follow design in P1

P2:                           playtest finding
                              env-only advection can continue
                              Inspector honest
                              no max-age / horizontal kill
                              do not kill on local-storm-zero

capability families:          Perceive
                              Navigate / interact
                              Understand
                              Model
                              Data / model-source
                              Time

product roles:                probe
                              population visualization
                              Guided cohort
                              selected + Inspector
                              runtime sharing undecided

audit authority:              external review, not SoT

accepted from audit:          capability map needed
                              docs debt real
                              continuity YELLOW
                              streamfunction = open candidate
                              synthetic vs dataset boundary
                              perceptual layer first-class

not accepted:                 stuck because no ROADMAP.md
                              mass-consistent OR cartoon
                              ∇·V=0 ⇒ realistic Journey
                              D1 → NG1 automatic
                              Journey = one air mass

streamfunction / DF:          OPEN FUTURE SYNTHETIC-MODEL
                              CANDIDATE
                              not next approved physics branch

tilting / stretching:         leading modeling direction
                              when physics proceeds
                              existing sketch in `15` §9
                              dedicated SoT not written
                              revalidation required (`24`)
                              not an implementation order

dataset evolution:            important boundary
                              exploration candidate
                              synthetic lab remains valuable

next implementation branch:   Candidate 1 current loop CLOSED
                              in `24` (comets provisional;
                              tint diagnostic; Background
                              REJECTED)
                              Guided population / camera pan
                              NOT STARTED
                              other §13 candidates still open
physics:                      RESUMED FOR DESIGN (`24`)
                              implementation NOT STARTED
ROADMAP.md:                   not created
```

---

## 16. STOP

```text
PHYSICS STATUS                        SEE `24` (RESUMED FOR DESIGN)
```

Candidate 1 architecture lives in `22`. Workbench and
encoding records live in `23`. The current perceptual-loop
decision and physics resumption live in `24`.
Product representation is not locked. Guided
population, camera pan, and other §13 candidates are not
started as the next implementation branch.

Do not treat opening `22`, `23`, or `24` as selecting
Candidates 2–7, nor as authorizing tilting / stretching
code.
Do not write a Cursor implementation prompt.
Do not implement pan, Follow, Guided population, trail
caps, RK2 switch, streamfunctions, datasets, R3, LIC, or
a public visualization-settings architecture because this
document exists.

Next work starts only when commanded.
