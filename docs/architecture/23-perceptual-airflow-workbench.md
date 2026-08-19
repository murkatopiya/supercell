# Perceptual Airflow Workbench

**Status:** architecture exploration / decision checkpoint
**Scope:** representation comparison after Slice 2 playtest
**Physics:** PAUSED
**Implementation:** NOT STARTED
**Decision:** workbench prototypes R1/R2 APPROVED as
unimplemented experiments; product representation NOT chosen

Predecessor:

```text
docs/architecture/22-perceptual-airflow-architecture.md
```

`22` remains SoT for:

- why perceptual airflow is needed;
- scientific tracer ≠ visual occupant;
- separate visualization runtime;
- SAME canonical `V_total`;
- honesty constraints (occupancy ≠ mass/cloud);
- live R0 Points implementation (Slices 1–2).

This document owns:

- first browser playtest evidence;
- representation comparison;
- temporary workbench architecture;
- prototype decision state.

**Naming:** `22` §10 used `R1`–`R4` for *runtime*
architectures (Simulation particles vs separate population
vs renderer integration vs streamlines). This document
reuses `R0`–`R3` for *visual encodings*. They are not the
same letters. Live runtime remains `22`'s separate
visualization population. Do not read `23` R2 (Eulerian
samples) as `22` runtime R2.

Physics remains paused. Operands, constants, envelopes,
seeds, integrator, Guided catalog, Inspector, and camera
pan are unchanged by this document.

Verified against current `main`:

```text
be43bf1c04fbb834f3c5bec59273bec0bd21c797
```

External review (decision input, **not** SoT):

```text
docs/reviews/2026-08-19-independent-perceptual-airflow-review.md
```

If that review conflicts with repository or current SoT,
repository / current SoT wins.

---

## 1. Why this checkpoint exists

Slice 2 put a live Explore background on screen:

```text
VisualAirflowPopulation
  → VisualAirflowScene (THREE.Points)
  → same V_total as Simulation
```

The first browser playtest, plus an independent perceptual
review, showed that **the encoding is the limiter**, not
merely count, opacity, or maxAge.

The next product representation is **not** chosen here.

The earned next instrument is a temporary **Perceptual
Airflow Workbench**: one live laboratory in which several
encodings of the **same** canonical `VelocityField` can be
compared, including in the paused state.

The workbench is a developer/research instrument.

```text
workbench modes  !=  public product modes
```

It is not Guided, not physics, not a dataset adapter, and
not a permanent visualization framework.

---

## 2. First playtest finding — P3 encoding limit

**Status:** PLAYTEST FINDING / representation evaluation

### 2.1 During motion

The user can see that a volume is moving. There is a general
sense of a living medium.

Named structures of current `V_total` remain weakly
readable from the default overview pose.

### 2.2 On Pause

The population reads almost as a random cloud of grey
pixels. Direction and spatial field structure nearly vanish.

### 2.3 What this is not

This is **not** first diagnosed as:

```text
bad opacity
too few points
too many points
wrong maxAge
```

Those may still be tuned later. They do not explain the
paused blank.

### 2.4 Encoding fact

```text
R0 position-only point
  contains no instantaneous direction cue
```

Live renderer (`src/rendering/VisualAirflowScene.ts`)
observes only occupant xyz. Public occupant shape is
`{ position, age }`. There is no orientation attribute.

Direction in R0 arises only as a **temporal percept**:
change of position between frames. Pause removes that
channel. A static frame of unoriented points cannot show
`+V` versus `−V`, vertical versus horizontal, or local
alignment.

That is why retuning Points cannot, by itself, solve Pause
direction.

---

## 3. Apparent-density tension

**Status:** COMPARISON CRITERION, not a delete-population order

Lagrangian / advected occupants can crowd in sinks and thin
in sources. Visual spacing then looks like amount of air.

Current model:

```text
continuity = YELLOW
```

Visual occupant contract (`22` §3.1, §25):

```text
count / spacing / presence
  != air density / mass / moisture / cloud
     / precipitation / probability
```

Repository-verified loud residual (`15`): NG-axis
`∇ · V ≈ +0.022 s⁻¹`. Live visual `maxAge = 80 s`. A
lifetime integral in a loud source/sink can be O(1). That
order-of-magnitude estimate is comparison input, not a new
physics measurement.

Tension to keep explicit:

> Lagrangian visual occupants may unintentionally display
> apparent concentration — a semantics the model does not
> allow to be read as density or mass.

This does **not** automatically mean “remove population.”
It is a decision criterion when comparing representations.

Eulerian fixed samples cannot produce that concentration
cue, because sampling density does not follow `∇ · V`.

Do not ship a production `divergence()` diagnostic in this
branch (`10` forbids selling FD divergence as mass budget).
Neighboring Eulerian orientations may *look* convergent or
divergent. That must not be labeled `∇ · V`.

---

## 4. Depth legibility — orthogonal problem

**Status:** ORTHOGONAL PROTOTYPE / NOT IMPLEMENTED

Current population occupies a large 3D volume. Live
appearance is one color, one opacity, `depthWrite: false`,
and only `sizeAttenuation` as a near/far cue.

From the default camera (tens of kilometers,
`DEEP_STORM_TRACER_VIEW`) a paused cloud can perceptually
collapse toward a flat texture.

Lock:

```text
DEPTH LEGIBILITY
```

as an orthogonal representation problem.

Do **not** mix in one experiment:

```text
representation family
depth cue
```

Do not use world altitude as a proxy for depth.
`higher = more transparent` is not this cue. The cue must
depend on view/camera distance or another explicit
perceptual criterion.

It is perceptual encoding, not:

```text
density
humidity
fog physics
cloud
extinction model
```

Do not name it meteorological fog.

---

## 5. Workbench purpose

Question the workbench must answer:

> Which visual encoding lets a person most honestly and
> quickly perceive the structure of current `V_total`,
> including in the paused state, while scientific tracers
> remain foreground inquiry objects?

Do not declare a winner in advance among:

```text
oriented occupants
Eulerian glyphs
streamlines
current Points
hybrid
```

Evidence must be comparative and in-browser.

Pause is a first-class acceptance state, not an edge case.
`CONCEPT` already wants freeze-and-look. Every candidate is
judged in both:

```text
PLAY
PAUSE
```

---

## 6. R0 — Advected Points     IMPLEMENTED BASELINE

Live encoding. Not a candidate winner. Needed for A/B.

```text
family            Lagrangian / advected
positions         VisualAirflowPopulation
primitive         THREE.Points
direction cue     temporal only
Pause direction   none
apparent density  possible (advection + YELLOW ∇ · V)
identity          none (not pickable, no tracerId)
```

Keep R0 intact. Do not destroy `VisualAirflowPopulation` to
make room for later encodings.

---

## 7. R1 — Oriented Advected Marks

**Status:** PROTOTYPE APPROVED / NOT IMPLEMENTED

Same advected visual occupants. Replace the point with a
spatially extended oriented mark.

```text
family            Lagrangian / advected
positions         existing VisualAirflowPopulation
orientation       local V_total at occupant position
Pause direction   yes (spatial head–tail)
length            fixed perceptual length (first prototype)
```

### 7.1 Head–tail grammar

The mark must show **sign**, not only an axis.

A static frame must distinguish `+V` from `−V`.

Allowed:

```text
faded tail → stronger head
```

or a geometrically equivalent asymmetry. A literal
arrowhead is not required.

This is **not** a scientific trail and not
`TracerPathHistory`.

Final art style is not locked here.

### 7.2 First-prototype length

First R1 uses **fixed perceptual length**.

Do not introduce in the same experiment:

```text
length = speed
```

Direction encoding is isolated from speed encoding.
Magnitude may be a later experiment.

Optional later investigations, not first prototype:

- velocity-scaled length;
- short locally integrated mark (k steps) for curvature.

A single local oriented mark:

```text
direction  yes
curvature  no
```

If R1/R2 give good local direction and poor large-scale
structure, that may earn R3. Do not lengthen marks into
pseudo-streamlines without a separate decision.

### 7.3 Ownership

R1 may be an observation adapter over the existing
population:

```text
occupant.position
  + VelocityField.sample(position, laboratoryTime)
  → unit direction for drawing
```

Population keeps integration, age, recycle. It does not
become a renderer. Direction is visualization observation,
not a new physics object.

---

## 8. R2 — Eulerian Oriented Samples

**Status:** PROTOTYPE APPROVED / NOT IMPLEMENTED

Semantically different from R1, not a restyle of R1.

```text
family            Eulerian / fixed samples
positions         fixed in laboratory space
orientation       V_total(P, t) at each sample
no advection      no age, no recycle, no integration
Pause direction   yes
apparent density  sampling density does not follow ∇ · V
motion percept    none in the baseline (hypothesis)
```

Hypothesis to test, not a conclusion: Pause carries a full
local-direction cue; divergence/convergence may appear as
geometry of neighboring orientations; the “air is moving”
percept disappears.

### 8.1 Ownership

R2 must **not** be a fake `VisualAirflowPopulation`.

If it has no integration, age, or recycle, do not shove it
into the Lagrangian runtime for reuse.

A separate lightweight Eulerian sample set / observation
owner is the boundary:

```text
declared sample positions (same visualization volume)
  + VelocityField.sample(P, laboratoryTime)
  → unit direction for drawing
```

Comparable count and region to R0/R1 for fairness. Same
canonical field instance. No second atmosphere.

---

## 9. R3 — Sparse Instantaneous Streamlines

**Status:** DEFERRED UNTIL R1/R2 EVIDENCE

Not in the first implementation slice.

Purpose: test whether large-scale topology/curvature needs
spatially extended curves, and local marks are not enough.

```text
streamline at laboratory time t
  != tracer path history
  != material parcel trajectory
  != Guided continuation
  != same-air-mass circulation
```

DEMO fields are Eulerian-steady today. Architecture must
not depend on eternal steadiness. For a future unsteady
field:

```text
streamline  !=  pathline
```

must remain explicit (`ARCHITECTURE` §20, `22` §7 / §21).

Do not implement R3 because this document exists.

---

## 10. Other families

### 10.1 Micro-trails     NOT FIRST-LINE PROTOTYPE

Not forbidden forever. Not in the first workbench.

Reasons:

- background would share scientific-trail language;
- strong material-history percept;
- false parcel reading;
- blurs `visual occupant ≠ scientific tracer` (`22` §4, §14).

### 10.2 LIC / slices     LATER FAMILY

Pause-friendly 2D field structure. A slice answers a 2D
question inside a 3D field, needs explicit plane semantics,
and is a heavier shader/texture pipeline. Not the first
cheap experiment. Natural later if hodograph height linkage
(`21` C) is opened.

### 10.3 Tubes / material surfaces     REJECTED FOR CURRENT MODEL

Under YELLOW continuity, stretching/shrinking of a tube or
surface is too easily read as physical mass/volume
evolution. Not a v1 perceptual solution.

---

## 11. Canonical field invariant

Every representation observes:

```text
THE SAME canonical V_total
```

that scientific `Simulation` integrates
(`lab.velocityObservation.total`).

Forbidden:

- rebuild the field;
- visually tuned duplicate field;
- disable operands per representation;
- normalize physics velocity before sampling.

Drawing may normalize **direction for glyph geometry**.
The field stays unchanged.

---

## 12. Fair-comparison invariant

R0 / R1 / R2 should be compared, as far as practical, with:

```text
same camera
same laboratory time
same spatial region
comparable sample count
comparable visual salience
same scientific foreground
same V_total
```

Internal runtimes need not be identical.

Prefer one live scene and a fast switch:

```text
R0 Points
R1 Oriented Advected
R2 Eulerian Oriented
```

without restarting the app and without git branches.
Visual comparison by memory across sessions is unreliable.

R3 may be added later by a separate decision.

---

## 13. Observation boundary

Renderer must not become the physics owner
(`ARCHITECTURE`: physics defines state; rendering observes).

Minimal conceptual chain, not a framework:

```text
canonical VelocityField
        ↓
visualization observation / runtime
        ↓
render data (positions, optional unit directions)
        ↓
Three.js renderer
```

| Encoding | Observation owner | Render data |
| --- | --- | --- |
| R0 | existing `VisualAirflowPopulation` | positions |
| R1 | population + sample of the same `V_total` | position + unit direction |
| R2 | separate Eulerian sample set | fixed P + unit direction |

Do not sample inside a shader as the v1 path (`22` rejected
renderer-owned advection). CPU observation of the canonical
field remains the testable boundary.

Moving texture / pulse along a fixed Eulerian mark is
**not** in the first baseline. R2 must first prove static
legibility. If it later loses only because it is “not
alive,” a laboratory-time animation along the mark can be a
separate experiment. Do not mix it now. Do not use
wall-clock animation for the baseline.

---

## 14. Time semantics

**R1**

- Positions follow the existing fixed-step visual
  population (`advanceLaboratoryFixedStep`).
- Direction must match current laboratory state: sample
  `V_total` at the occupant position and the same
  laboratory time context scientific integration uses.

**R2**

- Positions stay fixed.
- Velocity is sampled at current laboratory time.
- Pause keeps that exact current sample.
- A future unsteady field must change orientation with
  laboratory time, not with wall clock.

No second visual `timeScale`.

---

## 15. Workbench state and visibility

Representation selection is **dev/workbench state**.

Do not put it in:

```text
ScenarioConfig
physics
Simulation
GuidedExperimentId
ExploreTracerSession
Inspector
```

No persistence.

**Architecture recommendation (not implemented here):**

An Explore-only, clearly internal control that switches
R0/R1/R2 in the current laboratory without reload. Optional
query/dev flag may gate whether that control is mounted.
The control is not a fourth product mode beside Guided /
Explore.

After a decision, the workbench should be easy to remove.
Shipping three encodings as a public selector is not implied.

---

## 16. Browser evaluation checklist

Based on the **current DEMO laboratory**, not a wished-for
realistic supercell.

Where the live field actually contains the tendency, can a
person perceptually find or distinguish:

| Region | DEMO geometry to look toward |
| --- | --- |
| lower-level inward tendency | `LowerRadialInflowField`, ~1500–4500 m, σ = 4000 m about (0, 0) |
| deep ascent / updraft | `VerticalEnvelopeUpdraftField`, 0–8000 m, peak 30 m/s at (0, 0) |
| rotational / azimuthal tendency | `VerticalEnvelopeRotationField`, 0–6500 m, Ω = 0.005 s⁻¹ |
| upper-level outward transport | `UpperRadialOutflowField`, 5000–9000 m |
| offset downdraft | east 5000 m, σ = 2000 m, 20 m/s down, envelope to 3600 m |
| near-ground outward | (3000, 4000) m, σ = 1500 m, 0–800 m |
| environmental translation | storm-relative env advection away from local occupants |

Judge each candidate on PLAY and PAUSE for:

- local direction;
- sign of direction;
- vertical vs horizontal motion;
- curvature;
- coherent regions;
- depth;
- foreground separation.

One overview camera is **not** required to show every
region perfectly.

If the feature exists in the field but is indistinguishable
because of projection or occlusion:

```text
CAMERA/DEPTH LIMIT
```

not automatically a representation failure.

---

## 17. Physics-honesty checklist

Equal in weight to beauty/readability. For each candidate:

- Does spacing read as density/mass?
- Does the mark read as a material parcel?
- Does a curve read as a same-air-mass path?
- Does a false closed circulation appear?
- Can the background be mistaken for cloud/precipitation?
- Can the background be mistaken for scientific tracers?

YELLOW `∇ · V` is not a license to exhibit mass spreading.

---

## 18. Foreground hierarchy checklist

Scientific tracer remains:

- larger / more salient;
- pickable;
- selected / highlightable;
- trail-capable;
- Inspector-owned.

Background remains:

- non-pickable;
- non-selectable;
- no `tracerId`;
- no Inspector;
- subordinate.

A workbench candidate **cannot win** if it makes the field
pretty by swallowing the scientific probe.

---

## 19. Camera contingency

P1 pan/reset (`21` §3) stays a known separate issue. This
checkpoint does not implement it.

If **no** representation lets a person distinguish known
DEMO regions from the current overview because of
projection / depth overlap, camera/navigation may become a
**prerequisite** for further perceptual evaluation.

Do not smuggle Follow into that contingency.

---

## 20. Recommended implementation slicing

Not started by this document.

### Workbench Slice A

When commanded:

- temporary dev representation switch;
- preserve R0;
- R1 oriented advected marks (fixed length, head–tail);
- R2 Eulerian oriented samples (fixed length, same region);
- optional independent depth-cue toggle;
- browser comparison on the checklists above.

### Decision checkpoint

User playtest. Keep / reject encodings. Record evidence.

### Only if earned

R3 sparse instantaneous streamlines prototype.

Do not start Slice A because this file exists.

---

## 21. Compact lock-in

```text
playtest P3:              R0 Points = temporal direction only
                          Pause ≈ grey pixel cloud
                          not an opacity/count diagnosis

apparent density:         Lagrangian spacing may look like
                          mass; YELLOW ∇ · V; comparison
                          criterion, not delete-population

depth:                    ORTHOGONAL; camera-distance cue;
                          not altitude; not fog physics

product representation:   UNDER EVALUATION
                          no winner

R0 Advected Points:       IMPLEMENTED BASELINE

R1 Oriented Advected:     PROTOTYPE APPROVED
                          NOT IMPLEMENTED
                          same population; fixed length;
                          head–tail sign; not a trail

R2 Eulerian Oriented:     PROTOTYPE APPROVED
                          NOT IMPLEMENTED
                          not a fake VisualAirflowPopulation

R3 Sparse Streamlines:    DEFERRED UNTIL R1/R2 EVIDENCE

micro-trails:             NOT FIRST-LINE
LIC / slices:             LATER FAMILY
tubes / surfaces:         REJECTED FOR CURRENT MODEL

workbench:                dev/research only
                          modes != public product modes
                          one live switch; same V_total

field:                    same canonical V_total
                          no rebuilt / prettier duplicate

length:                   fixed; speed encoding later
curvature:                local mark cannot show it
divergence API:           not this branch

Pause:                    first-class
camera P1:                contingency, not implemented

Slice A:                  proposed, not started
physics:                  PAUSED
```

---

## 22. STOP

```text
PHYSICS PAUSED
PRODUCT REPRESENTATION     UNDER EVALUATION
R0 POINTS                  LIVE BASELINE
R1 / R2                    APPROVED PROTOTYPES
                           NOT IMPLEMENTED
R3                         DEFERRED
DEPTH CUE                  ORTHOGONAL / NOT IMPLEMENTED
WORKBENCH SLICE A          NOT STARTED
CAMERA PAN / RESET         NOT STARTED
FOLLOW                     NOT STARTED
GUIDED POPULATION          NOT STARTED
```

Do not implement oriented marks, Eulerian samples,
streamlines, micro-trails, depth attenuation, shaders,
camera pan, Follow, public selectors, or physics because
this document exists.

Next work starts only when commanded.
