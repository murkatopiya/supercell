# Perceptual Airflow Exploration Checkpoint and Physics Resumption

**Status:** architecture decision checkpoint
**Scope:** close the current perceptual-airflow exploration
loop; lift the physics pause for design / model development
**Physics:** RESUMED FOR DESIGN / MODEL DEVELOPMENT
**Implementation:** none from this file. Docs-only.
Headless T1 was later implemented and validated; that did
not start Y12 / derived rotation. Post-T1 direction is `27`.
Current modeling-direction revalidation:
`docs/architecture/25-tilting-stretching-direction-revalidation.md`.
`25` ranks T1 diagnostic tendency as the next design
target. T1 physics derivation:
`docs/physics/22-diagnostic-tilting-tendency.md`.
T1 architecture:
`docs/architecture/26-diagnostic-tilting-tendency-architecture.md`.
Headless T1 is implemented and validated. Post-T1 direction:
`docs/architecture/27-post-t1-physics-direction-checkpoint.md`.
This file remains the perceptual-loop / pause-lift
checkpoint. It is not the T1 architecture SoT and not the
post-T1 direction checkpoint.
**Decision:** the current perceptual question is answered
enough to proceed. That is not “visualization complete.”
Comets are a provisional `V_total` representation, not a
product lock-in. Operand tint is a validated diagnostic
capability. Background highlight remains REJECTED. Further
visual optimization of the current prescribed laboratory is
deferred. Physics pause is lifted for design, not for
implementation.

Predecessor workbench / playtest record:

```text
docs/architecture/23-perceptual-airflow-workbench.md
```

`23` remains SoT for workbench architecture, encoding
contracts, and implementation records. This document does
not replace `22` or `23`. It records the exploration-loop
decision and the physics-resumption decision.

Predecessor whole-product capability map:

```text
docs/architecture/21-whole-product-direction-checkpoint.md
```

`21` remains the post-Guided-v1 capability map. It selected
Candidate 1 as the next *implementation* branch. This
checkpoint closes that perceptual loop’s current question.
It does not reopen Candidates 2–7 as automatically next, and
it does not make Candidate 5 an implementation order.

Perceptual-airflow runtime SoT:

```text
docs/architecture/22-perceptual-airflow-architecture.md
```

`22` remains SoT for:

- why perceptual airflow is needed;
- scientific tracer ≠ visual occupant;
- separate visualization runtime;
- SAME canonical `V_total`;
- occupancy / count / spacing ≠ density / mass / cloud.

Physics-pause origin and sketched tilting / stretching fork:

```text
docs/architecture/15-post-near-ground-outflow-checkpoint.md
```

`15` remains the continuity / near-ground checkpoint and the
sketched tilting / stretching fork (`15` §9). Verdict D
(“stop adding physics temporarily”) is historical for that
arc. Current modeling status lives here.

This document did **not** change production code.
It does **not** create `ROADMAP.md`.
It does **not** write a tilting / stretching architecture SoT.
It does **not** design implementation slices for that SoT.

Verified against:

```text
da90ed6e444e1d212ffa39880b65b2655f02a910
```

Authoritative going in:

- `docs/CONCEPT.md`
- `docs/ARCHITECTURE.md`
- `docs/architecture/10-composite-continuity-mass-budget-audit.md`
- `docs/architecture/15-post-near-ground-outflow-checkpoint.md`
- `docs/architecture/21-whole-product-direction-checkpoint.md`
- `docs/architecture/22-perceptual-airflow-architecture.md`
- `docs/architecture/23-perceptual-airflow-workbench.md`
- `docs/architecture/02-current-model-assumptions-audit.md` (Y12)

Keep these roles distinct:

```text
scientific tracer
  != visual airflow occupant
  != Eulerian sample
  != Guided cohort
  != operand contribution overlay
  != product lock-in
```

---

## 1. Why this checkpoint exists

`21` chose Candidate 1 (perceptual airflow) as the next
implementation branch while physics stayed paused (`15` D).

`22` specified a separate visualization runtime on the same
canonical `V_total`. `23` built an Explore-only workbench and
ran encoding / Pause / operand-highlight comparisons.

The six-operand comet-tint playtest is now evidence, not a
waiting placeholder.

The earned next act is **not** another week of opacity,
count, palette, or suppression work on the current DEMO
geometry. It is to close this perceptual loop honestly and
resume **model development** — because the current prescribed
kinematic laboratory has become the bottleneck for further
product-visualization decisions.

This checkpoint exists to make that causal order explicit.

```text
not:  visualization is done  →  therefore physics
yes:  perceptual investigation reached diminishing returns
      against the current model class
      → more model structure is the higher-information next step
      → later perceptual decisions re-evaluated against that structure
```

---

## 2. What was learned

**Kind:** PLAYTEST / WORKBENCH EVIDENCE. Not a product
encoding lock-in.

### 2.1 R0 Points

Implemented baseline. Default Explore workbench mode remains
Points unless the user switches.

During PLAY, Points can give a sense of a moving medium.
They carry no instantaneous direction cue. On Pause they
collapse toward a random cloud of pixels.

```text
R0 Points = baseline / not preferred main representation
```

### 2.2 R1 oriented advected marks

Same Lagrangian occupants; head–tail marks add instantaneous
sign and direction. Useful intermediate prototype. Current
LineSegments geometry is not a product lock-in.

### 2.3 Comet refinement

After the corrective rendering pass (vertex color space,
alpha, occupancy fade, rejected Background behavior), comets
became visually viable.

They combine motion with instantaneous direction. Head/tail
is perceptually readable. The tail is **perceptual geometry**.

It is not:

- a scientific tracer trail;
- `TracerPathHistory`;
- parcel history;
- a streamline;
- same-air-mass history.

```text
comets = strongest / provisional V_total representation
         for the current model class
         not a final product winner
         not a promise to keep this geometry forever
```

### 2.4 R2 Eulerian oriented samples

Strong for instantaneous field structure, especially on
Pause. Regular spacing does not follow `∇ · V`. Reads as a
measurement / vector-field instrument more than as living
air.

```text
R2 = earned diagnostic-layer capability
     not the main living-air representation
     not deleted
```

### 2.5 Background operand highlight

Browser playtest found the extra spatial underlay unsuccessful.
The live workbench does not construct it.

```text
Background highlight = REJECTED BRANCH
do not return it as a current candidate
```

### 2.6 Comet operand tint

Technically and conceptually VALIDATED as a **diagnostic**
capability.

The same visual marks still advect and orient on canonical
`V_total`. Selected-operand `|V|` maps only to display
tint/salience. The named field is the SAME Inspector
decomposition instance.

Tint does **not** mean:

- this comet is updraft air / rotation air / a separate mass;
- operands can be compared quantitatively by color;
- this is an envelope isosurface or cloud.

### 2.7 Six-operand selector

Explore-only diagnostic selector. Storm operands:

```text
updraft
rotation
lowerInflow
upperOutflow
downdraft
nearGroundOutflow
```

`environmentAdvection` is intentionally absent. Different
operands are spatially detectable in different regions.
From the default overview, structural *role* in the whole
supercell still takes active visual search and does not by
itself yield a sufficient picture of entire-storm structure.

### 2.8 Per-operand display normalization

Visualization-only references exist because DEMO operand
magnitudes differ. They are not physics constants and not
existence thresholds. Color salience across operands is
**not** a shared quantitative scale. Inspector remains the
local magnitude answer.

### 2.9 Palette and multi-operand display

Hue A/B/C completed their research task. Exact product
palette is DEFERRED. No color picker now.

Multi-operand simultaneous visualization is NOT STARTED and
is not started by this checkpoint.

### 2.10 Density / occupancy / suppression idea

A later playtest idea was to dim other marks, boost the
selected operand, and increase mark count inside that
operand.

```text
PROJECT DECISION: do not implement this now
```

Local increase of visual occupancy as a contribution encoding
is especially refused without a separate future decision.
Count / spacing / presence are already forbidden to be read
as density / mass / amount of air (`22` §3.1 / §25). That
misreading is worse under continuity YELLOW (`10`).

Opacity/salience does not need further polish on this loop.

### 2.11 Camera and Follow

Camera pan/reset (`21` §3 / P1) and Follow remain separate
unresolved capabilities. They must not hitchhike into the
physics-resumption branch.

The Explore workbench remains a temporary research instrument.
It is not promoted to public product visualization settings.

---

## 3. What is decided / not decided

### DECIDED

- The current perceptual-airflow exploration loop is mature
  enough to exit. Future perceptual work is expected after
  richer model structure; it is not cancelled forever.
- Comets may be used as the **provisional** `V_total`
  representation of the current laboratory.
- Operand tint may be kept as a **diagnostic** capability.
- Background highlight remains REJECTED.
- Further visual optimization of the current prescribed
  DEMO (density, opacity, exact palette, multi-operand
  display, suppression, streamlines, volumes) is deferred
  until the model has additional storm structure.
- `PHYSICS PAUSED` is lifted for **design / model
  development**.

### NOT DECIDED

- final product airflow representation;
- final comet geometry;
- final highlight palette;
- multi-operand visualization;
- density / opacity suppression strategy;
- R3 streamlines / LIC / slices;
- volume / cloud rendering;
- final Pause UX (full freeze vs frozen-field animation);
- camera pan/reset;
- Follow;
- dataset visualization strategy;
- public visualization-settings architecture;
- any physics implementation.

Provisional is not product lock-in. Do not freeze comet art,
workbench modes, or diagnostic tint into CONCEPT-level
promises because this checkpoint exists.

---

## 4. Why physics resumes

The six-operand playtest showed that single-operand tint
works as a detector: different operands light up in different
places. It did **not** show that the current encoding, plus
more opacity/count/color work, will make the whole supercell
structure legible from the overview.

That limit is not diagnosed as:

```text
failed comet rendering
failed tint
need another week of visual polish
must now build streamlines / LIC / volumes
```

The current `V_total` is a **prescribed seven-operand
kinematic laboratory**. `15` already judged that cartoon
complete enough to stop adding sibling `VelocityField`s.
Named structures exist, but they are additive occupants, not
an evolved storm.

Trying to finish a product visual grammar against that
geometry risks overfitting DEMO occupancy (offset downdraft,
thin NG layer, prescribed rotation, YELLOW `∇ · V`) and then
throwing the grammar away when the model class changes.

```text
current perceptual question
  = answered enough to proceed

remaining whole-storm legibility gap
  = largely a model-structure gap, not an encoding-tweak gap
```

Physics therefore resumes because **more model structure is
now the higher-information step**, and because later
perceptual decisions should be judged against that structure.

Physics does **not** resume because visualization is finished.

---

## 5. Physics honesty (still binding)

Nothing in `22` / `23` / this checkpoint raises physical
fidelity.

Still forbidden as automatic claims, exhibits, or copy:

- realistic parcel;
- same-air-mass circulation;
- mesocyclone capture;
- full supercell circulation;
- D1 → NG1 causal continuation;
- downdraft → cold pool;
- RFD / FFD;
- cold pool / gust front / density current;
- mass consistency / mass-consistent circulation;
- cloud / precipitation;
- realistic supercell simulation.

```text
comet spacing / count     != density / mass
operand tint              != physical air-mass boundary
provisional V_total viz   != the model became a supercell
physics resumed for design != implementation authorized
```

Continuity remains **YELLOW** (`10`, revisited in `15` §6).
This checkpoint does not retune operands, does not authorize
a continuity solver, and does not sell finite-difference
`divergence()` as a mass budget (`10`).

`CONCEPT` freeze-and-look still wants camera motion during
scientific Pause. That remains a product/camera question, not
a physics-implementation order.

---

## 6. Physics resumption

```text
PHYSICS: RESUMED FOR DESIGN / MODEL DEVELOPMENT
IMPLEMENTATION: NOT STARTED
```

Leading next modeling **direction** from existing SoT:

```text
TILTING / STRETCHING
```

That direction is not an implementation order.

Next allowed task after this checkpoint (answered in `25`):

```text
docs-first revalidation of the existing tilting / stretching
direction against the CURRENT repository architecture and
CURRENT physics state, then a separate design step if the
direction still holds
```

Revalidation result: `25`. CONDITIONAL. Next design target
is T1 diagnostic-tendency architecture, not Y12 / derived
rotation. Dedicated SoT still not written.

Do not port a pre-pause sketch into production.
Do not add an eighth compositor operand that pretends to be
tilting (`15` §9.4, `02` Y12).
Do not relabel prescribed `Ω` as “tilting” (`21` Candidate 5).

---

## 7. Tilting / stretching SoT — what exists, what does not

This checkpoint does **not** write the missing design SoT and
does **not** choose among overlays-only, diagnostic curl,
parameterized source, or prognostic `ω`.

### 7.1 No dedicated design document

There is **no** live file whose job is “tilting / stretching
interaction architecture SoT.”

`ARCHITECTURE.md` §30 lists a *future docs tree* including
`docs/physics/06-tilting.md` and `docs/physics/07-stretching.md`.
Those files **do not exist**. Live physics numbering is
different (`06` is horizontal vorticity, `07` is
storm-relative wind, and so on). Treat that list as a
historical outline, not as missing files to implement.

### 7.2 Authoritative *direction* (existing)

The most detailed existing write-up of the fork is:

```text
docs/architecture/15-post-near-ground-outflow-checkpoint.md
  §9  Tilting / stretching fork
  §14 Modeling item 1
```

It states:

- current rotation is prescribed, not evolved `ω_z`;
- env `ω_h` / streamwise / SRH / updraft gradients are
  diagnostic *ingredients*, not an evolution operator;
- `CompositeVelocityField` cannot host this as an eighth
  independent operand;
- when modeling resumes: open an architecture SoT, docs
  only; do not implement.

Supporting direction, not a substitute design:

| Document | What it is |
| --- | --- |
| `02` Y12 | First **interaction** mechanism (tilting, pressure, continuity solver) — milestone, not equations |
| `21` Candidate 5 | Leading modeling branch **when physics resumes**; explicitly not the next implementation branch of `21` |
| `16`, `17`, `19`, `20` | Pointers: when modeling resumes, that SoT — they do not contain the design |

Diagnostic vorticity docs (`06`, `08`, `09` physics) remain
what they are: hodograph-layer diagnostics. They are not a
tilting operator (`15` §9.2).

### 7.3 Ambiguity to carry into the next docs-first task

Do not collapse these into one “already written SoT”:

```text
15 §9          sketched fork + hosting boundary
02 Y12         interaction-class milestone
21 Candidate 5 product-timing / risk note
ARCHITECTURE   planned filenames that were never created
```

The next docs-first task must say which of these still hold
against today’s repository, and then either write the actual
architecture SoT or record why the leading direction changed.

### 7.4 Why revalidation is required

Between `15` D and the current tree the product grew:

- Explore arbitrary seeding and session ownership (`18`);
- shared Inspector on canonical operand instances (`19`);
- Guided catalog / runtime / teaching surface (`17`, `20`);
- separate visual airflow population (`22`);
- workbench encodings, Pause viz, operand tint (`23`);
- honesty contracts that occupancy ≠ mass and tint ≠ air mass.

A pre-pause tilting sketch cannot assume that Inspector,
Guided copy, and perceptual occupants will automatically
stay honest if rotation becomes derived. Revalidation is
the next task’s job. This checkpoint only names that job.

---

## 8. What this checkpoint does not start

```text
tilting / stretching implementation
new VelocityField / eighth operand
continuity solver or continuity retune
thermodynamics / cold pool / gust front
datasets / adapters
RK2 as production integrator
camera pan / reset
Follow
Guided population
scientific tracer lifecycle P2
R3 / LIC / slices / volumes / cloud
multi-operand visualization
product palette / color picker
occupancy-based contribution encoding
public visualization-settings UI
ROADMAP.md
```

Do not delete the Explore workbench.
Do not promote its controls to product modes.

---

## 9. Compact lock-in

```text
perceptual exploration:   CURRENT LOOP CLOSED
                          future re-evaluation expected
                          after richer model structure

V_total representation:   COMETS — PROVISIONAL
                          not product lock-in
                          not final geometry

R0 Points:                IMPLEMENTED BASELINE
                          not preferred main

R1 oriented advected:     IMPLEMENTED PROTOTYPE
                          intermediate; geometry not final

R2 Eulerian oriented:     EARNED DIAGNOSTIC CAPABILITY
                          not main living-air layer

operand tint:             VALIDATED DIAGNOSTIC CAPABILITY
                          same Inspector field instances
                          not a quantitative cross-operand scale

Background highlight:     REJECTED

exact product palette:    DEFERRED
multi-operand display:    NOT STARTED
occupancy-as-contribution: NOT APPROVED NOW
camera pan / Follow:      UNRESOLVED; not this branch

final product viz:        NOT DECIDED

continuity:               still YELLOW (`10`)
field class:              prescribed seven-operand kinematic
                          laboratory; not dynamics

physics:                  RESUMED FOR DESIGN
implementation:           NOT STARTED
next modeling direction:  tilting / stretching as QUESTION
                          revalidated in `25` as CONDITIONAL
authoritative design SoT: NOT WRITTEN
existing direction:       `15` §9 / §14.1; `02` Y12;
                          `21` Candidate 5
                          ranked by `25`: T1 next, T2–T4 parked
revalidation:             COMPLETE in `25`
next allowed task:        dedicated T1 diagnostic-tendency
                          architecture SoT
                          (`25` §17.4). Not implementation.
```

---

## 10. STOP

```text
PERCEPTUAL AIRFLOW EXPLORATION
  CURRENT LOOP CLOSED / FUTURE RE-EVALUATION EXPECTED

V_total REPRESENTATION
  COMETS — PROVISIONAL, NOT PRODUCT LOCK-IN

OPERAND TINT
  VALIDATED DIAGNOSTIC CAPABILITY

BACKGROUND HIGHLIGHT
  REJECTED

FINAL PRODUCT VISUALIZATION
  NOT DECIDED

PHYSICS
  RESUMED FOR DESIGN

NEXT MODELING DIRECTION
  REVALIDATED IN `25` — CONDITIONAL
  NEXT DESIGN TARGET = T1 DIAGNOSTIC TENDENCY
  DEDICATED ARCHITECTURE SoT NOT WRITTEN

PHYSICS IMPLEMENTATION
  NOT STARTED
```

Do not treat this checkpoint as visualization-complete.
Do not treat provisional comets as a permanent art decision.
Tilting / stretching implementation is out of scope for this
SoT.
Do not start another perceptual-encoding slice because the
workbench still exists.

Modeling-direction revalidation lives in `25`. Next modeling
work is the T1 diagnostic-tendency architecture SoT scoped
there.
