# Perceptual Airflow Workbench

**Status:** architecture exploration / decision checkpoint
**Scope:** representation comparison after Slice A browser playtest
**Physics:** PAUSED
**Implementation:** Workbench Slice A COMPLETE. Prototype
comparison slice IMPLEMENTED. Background highlight is a
REJECTED BRANCH (historical record in §25.1; not live).
Comet contribution tint VALIDATED. Hue A/B/C comparison
COMPLETE; exact product palette DEFERRED. Live highlight
is Off / one of six storm operands, single prototype hue
(§31). Multi-operand simultaneous visualization NOT
STARTED. Environmental advection visualization DEFERRED.
Six-operand browser playtest WAITING FOR USER. Product
encoding not chosen.
**Decision:** product representation STILL UNDER EVALUATION.
R1 is the strongest current main-layer candidate. R2 is an
earned diagnostic-layer candidate. Neither is a product default.
Comets are the strongest current perceptual-airflow candidate.
Comet contribution tint is VALIDATED. Representation winner
is not declared.

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

- first browser playtest evidence (P3 / Points);
- Slice A workbench architecture and implementation record;
- Slice A R0/R1/R2 comparison playtest;
- prototype decision state;
- prototype comparison slice implementation record (§30);
- single-operand diagnostic selector implementation record
  (§31);
- comet / Pause viz / Hue A/B/C playtest COMPLETE as a
  mechanism and palette-research pass;
- six storm-operand comet-tint playtest WAITING FOR USER;
- Background highlight REJECTED as a live workbench branch
  without deleting the historical hypothesis.

**Naming:** `22` §10 used `R1`–`R4` for *runtime*
architectures (Simulation particles vs separate population
vs renderer integration vs streamlines). This document
reuses `R0`–`R3` for *visual encodings*. They are not the
same letters. Live runtime remains `22`'s separate
visualization population. Do not read `23` R2 (Eulerian
samples) as `22` runtime R2.

Keep these roles distinct:

```text
scientific tracer
  != visual airflow occupant
  != Eulerian sample
  != Guided cohort
  != operand contribution overlay
```

Physics remains paused. Operands, constants, envelopes,
seeds, integrator, Guided catalog, Inspector, and camera
pan are unchanged by this document.

Verified against live Slice A:

```text
f1d858e5d6352d99f2f90c8f168f6c530a792d0a
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

**Status:** ORTHOGONAL TOGGLE IMPLEMENTED / not a product encoding

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

**Status:** IMPLEMENTED BASELINE / not preferred main candidate

Live encoding. Default Explore workbench mode (`points`).
Needed for A/B. Slice A browser playtest did **not** prefer
it as the main perceptual airflow layer.

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

**Status:** IMPLEMENTED PROTOTYPE / strongest current
main-layer candidate / product NOT CHOSEN

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

**Status:** IMPLEMENTED PROTOTYPE / earned diagnostic-layer
candidate / not the main product representation

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

**Implemented (Slice A):**

Explore-only `VisualAirflowWorkbenchControls` in the
laboratory toolbar. Labels are technical:

```text
Points
Advected marks
Eulerian marks
Depth cue
```

Copy states this is a dev workbench, not product modes.
React state in `App` (`workbenchMode`, `depthCueEnabled`).
Not URL, not localStorage, not ScenarioConfig. No query
flag in v1 — the control is mounted whenever Explore is
active, still clearly marked internal.

Default remains R0 Points. Explore↔Guided round-trip
resets workbench state to Points / depth OFF. Explore
Reset/Clear keep the current workbench mode.

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

## 20. Slice A implementation record

**Status:** COMPLETE. Product representation not chosen.

### Live modules

```text
src/visualization/orientedAirflowMark.ts
src/visualization/observeAdvectedOrientedAirflow.ts
src/visualization/EulerianAirflowSamples.ts
src/app/demoEulerianAirflowFixture.ts
src/rendering/visualAirflowWorkbenchMode.ts
src/rendering/OrientedAirflowMarkScene.ts
src/rendering/VisualAirflowWorkbenchScene.ts
src/ui/tracer/VisualAirflowWorkbenchControls.tsx
```

`ExploreLab` owns `visualAirflowPopulation` and
`eulerianAirflowSamples`, both constructed on
`velocityObservation.total`. Workbench mode and depth-cue
flags live in `App` React state.

### Encodings

```text
R0  VisualAirflowScene          THREE.Points
R1  OrientedAirflowMarkScene    THREE.LineSegments
    positions from VisualAirflowPopulation
    direction from writeAdvectedOrientedAirflow
R2  OrientedAirflowMarkScene    THREE.LineSegments
    positions from EulerianAirflowSamples
```

Switch is visibility inside `VisualAirflowWorkbenchScene`.
It does not recreate `TracerScene`, Simulation, clock,
scientific tracers, selection, Inspector, or `V_total`.

### Observation / zero-speed / length

```text
direction = normalize(V_total(P, t))
|V| <= 1e-6 m/s  →  unit direction (0,0,0), collapsed mark
mark length      =  500 m fixture, not |V|
```

Head–tail sign is static vertex color (faded tail →
stronger head). Not speed, density, age, or moisture.
No pulse / running texture.

### Hidden-mode stepping

The advected population **keeps stepping** with laboratory
time while R2 is shown, so returning to R0/R1 stays on the
same session. Eulerian positions never move.

### Depth cue

`TracerScene.setDepthCueEnabled` sets `THREE.Fog` on the
scene (camera distance, clear-color tint). UI/docs name is
**Depth cue**, not meteorological fog. Scientific glyphs,
trails, preview, grid, and axes use `fog: false`. Cue
changes salience only.

### Slice A did not include

R3, micro-trails, LIC, speed encoding, public selector,
Guided population, camera pan/reset, Follow, physics.

### Decision checkpoint (Slice A playtest recorded)

Browser comparison of live R0/R1/R2 is recorded in §21.
Product representation is still not chosen.

R3 remains deferred. New evidence did not earn streamlines.

Proposed next experiments (§22–§25) are now a live
prototype comparison slice (§31). Browser playtest (§26 D)
has not decided a product encoding.

Encoding contracts that Slice A can already state:

- R0 Pause still has no instantaneous direction cue.
- R1/R2 Pause keep a head–tail mark at the paused laboratory
  time.
- `V_total` at named DEMO loci is a **superposition**. A
  sample near a named occupant is not an isolated-mechanism
  glyph. Storm-relative environment often adds a large
  northward (world −Z) component.
- Local marks still cannot show path curvature.
- Lagrangian R0/R1 can still show apparent concentration;
  R2 sampling density does not follow `∇ · V`.
- Live Pause is currently a **full visual freeze**:
  `clock.time` stops, scientific tracers stop, the visual
  population does not `step`. Frozen-field animation is a
  later hypothesis (§23), not the live contract.

Those are technical observations, not a product verdict.

---

## 21. Slice A browser playtest — R0 / R1 / R2

**Kind:** OBSERVATION (browser comparison after Slice A)

Not a product-representation decision.

Live encodings compared (`f1d858e`):

```text
R0  VisualAirflowScene          THREE.Points
R1  OrientedAirflowMarkScene    THREE.LineSegments
    fixed 500 m; vertex-color head–tail
R2  OrientedAirflowMarkScene    THREE.LineSegments
    EulerianAirflowSamples
```

Default Explore mode remains R0 Points. Workbench switch
does not promote R1/R2 to a product default.

### 21.1 R0 — Advected Points

Observation:

- fulfilled the baseline role;
- during motion, creates a sense of a moving medium;
- on Pause, position-only encoding nearly loses direction;
- reads as cloud / dust / random pixels;
- **not** the preferred candidate for the main perceptual
  airflow representation.

Decision (narrow): keep R0 as baseline/reference. Do not
delete it in this checkpoint. Do not ship it as the intended
main layer on the strength of this playtest.

### 21.2 R1 — Oriented Advected Marks

Observation:

- substantially stronger than R0;
- combines temporal motion cue with instantaneous
  orientation cue;
- better “living airflow” percept;
- even a single frame contains local direction;
- Lagrangian convergence/divergence still risks
  apparent-density reading;
- current simple LineSegments geometry is **not** final art.

Assessment:

```text
R1 = strongest current candidate for MAIN perceptual layer
representation remains UNDER EVALUATION
```

This is not a product lock-in. Current mark geometry may
still lose to a comet refinement (§22).

### 21.3 R2 — Eulerian Oriented Samples

Observation:

- very good at instantaneous field structure;
- especially strong on Pause;
- spacing stays regular; no Lagrangian concentration
  pattern;
- perceptually closer to a measurement / vector-field
  instrument than to a living moving medium.

Assessment:

```text
R2 = earned candidate for a future Eulerian diagnostic /
     field layer
not declared a loser
not declared the main product representation
not deleted
```

### 21.4 R3

```text
R3 Sparse Instantaneous Streamlines = DEFERRED
```

Slice A evidence did not earn implementation. Local marks
still cannot show path curvature; that limitation is
recorded, not treated as an order to build streamlines.

---

## 22. R1 comet-mark refinement

**Kind:** IMPLEMENTED PROTOTYPE / UNDER EVALUATION
(historical hypothesis below; live API in §31)

**Decision:** none. Compare against current R1 LineSegments
before choosing.

Instead of the current simple oriented segment, try a
Windy-inspired perceptual **comet / streak**:

- readable head region;
- short fading tail;
- smooth fade-in / fade-out;
- soft recycle / disappearance;
- low opacity / subordinate hierarchy;
- scientific tracers remain explicit foreground.

### 22.1 Semantics

The tail is a **perceptual motion cue**.

It is **not**:

- a scientific tracer trail;
- stored pathline history;
- a material trajectory;
- same-air-mass history;
- parcel history.

Do **not** use `TracerPathHistory` because a tail is
visible. That object remains scientific-probe history
(`rendering/14`, `22` §4 / §14).

This is also **not** the deferred micro-trail family
(§10.1). Micro-trails were rejected as a first-line
prototype because they share scientific-trail language
and imply material history. A comet is shorter, fades,
and must stay visually distinct from tracer trails.

Do not make long trails. Do not turn the comet into a
pseudo-streamline.

First prototype: **fixed perceptual length** / short
temporal visual cue. Do not encode speed by tail length
without a separate decision.

### 22.2 Live R1 that this would replace in the experiment

Current R1 (`OrientedAirflowMarkScene`): two-vertex
`LineSegments`, static vertex-color tail→head, length
500 m, no history, no shader fade, recycle is the
population policy (hard reseed), not a visual dissolve.

The experiment is current mark vs comet-like mark, same
`VisualAirflowPopulation`, same `V_total`.

---

## 23. Pause: scientific time vs perceptual animation

**Kind:** IMPLEMENTED PROTOTYPE / UNDER EVALUATION
(historical hypothesis below; live API in §31)

**Live contract today:** scientific Pause is a **full visual
freeze**. `simulationElapsedFromWall(..., paused: true)`
yields zero elapsed time, so `advanceLaboratoryFixedStep`
does not run. `clock.time` stays put, scientific tracers
stay put, the visual population does not `step`, R1/R2
orientations stay at `t_pause` because sync still samples
`V_total(P, clock.time)` but positions do not advect.

Hypothesis: “Pause laboratory” need not mean “freeze every
visual animation.”

Distinguish:

```text
A. scientific / laboratory time
B. perceptual animation phase
```

On scientific Pause:

- `Simulation.clock.time` frozen (`t_pause`);
- scientific tracers frozen;
- Guided cohort frozen;
- scientific trails do not extend physical history;
- Inspector stays on frozen `P, t`;
- physics state does not evolve.

Perceptual airflow animation **may** continue, using the
frozen canonical field snapshot:

```text
V_total(P, t_pause)
```

Visual occupants / future comets may keep moving on that
frozen-in-time velocity field **without advancing the
laboratory clock**.

Semantics:

> Simulation time is paused; animation continues to reveal
> the flow field at that frozen laboratory time.

This is **not** time evolution of the model.

### 23.1 Unsteady compatibility

If the field later depends on time, Pause must **not**
sample at advancing wall-clock as if laboratory time were
running. Every sample uses `t_pause`.

Wall-clock may drive a perceptual phase only. It must not
be treated as `clock.time`.

### 23.2 Workbench comparison (future)

When commanded, compare:

```text
full visual freeze          (current live Pause)
frozen-field animated flow  (this hypothesis)
```

Do not silently replace the current Pause contract.

`CONCEPT` already wants freeze-and-look and camera motion
during freeze. This hypothesis extends revelation of the
frozen field. It does not authorize physics stepping.

---

## 24. Operand contribution highlight

**Kind:** IMPLEMENTED PROTOTYPE / UNDER EVALUATION
(historical hypothesis below; live API in §31)

A visualization/understanding candidate, not Inspector
payload and not a new physics operand.

The user may select **one** named velocity operand and see
where that operand contributes to the velocity field. The
first prototype used **updraft** only. The live diagnostic
selector now includes the six storm operands (§31).
Environmental advection visualization is deferred.

### 24.1 Source of truth

The same named observable operand instance already used by
canonical decomposition / Inspector path:

```text
lab.velocityObservation.parts[i].field
```

Live DEMO keys (`DEMO_VELOCITY_CONTRIBUTION_KEYS`,
`19` / compose path):

```text
environmentAdvection
updraft
rotation
lowerInflow
upperOutflow
downdraft
nearGroundOutflow
```

These seven tokens are the **current-model** observable set.
Do not promote them into a permanent generic visualization
anatomy. A later model may have different named parts
(`19` §17).

### 24.2 What highlight is

Observation only.

```text
where / how strongly the selected operand contributes
to velocity at (P, t)
```

Does **not** mean:

- this volume contains updraft air;
- this is a separate air mass;
- this is the physical boundary of the updraft;
- this is cloud;
- this is density.

Forbidden:

- rebuild the field;
- visually tuned duplicate;
- change `V_total`;
- disable the other operands.

`V_total` remains the motion/orientation source for
perceptual occupants.

### 24.3 Not Inspector

Inspector remains the **local tracer** answer:

> Why is this tracer moving this way right now?

Highlight answers a **spatial** question:

> Where in space does this mechanism/contribution act?

Compatible named observation semantics. Highlight state
must **not** live in `TracerInspection` only for UI
convenience. Inspector does not own global visualization
mode.

---

## 25. Highlight encoding experiment — Off / A / B

**Kind:** HISTORICAL HYPOTHESIS. Hue A/B/C comparison
COMPLETE. Exact product palette DEFERRED. Live API in §31.

Do not pick a product winner in this section.

The first comparison was three states, fair:

```text
OFF
A. Background highlight     REJECTED BRANCH (not live)
B. Comet highlight          KEPT as the live encoding
```

Live workbench comparison after that rejection was three
prototype hues on the kept comet-tint encoding:

```text
OFF
Hue A / Hue B / Hue C     comet tint; prototype hues
```

That hue comparison completed its research task. Exact
product palette is deferred. Live selector is one operand
plus one prototype hue (§31).

Shared invariants (still binding for the live hues):

- one selected operand (first: updraft);
- same canonical field instances;
- same laboratory time;
- same camera;
- same perceptual occupants;
- same scientific foreground tracers.

### 25.1 A — Background highlight

**Status:** REJECTED BRANCH. Not constructed by the live
workbench. Text below is the historical hypothesis. Do not
delete it.

Comets / marks stay neutral (e.g. white/grey) and still
encode `V_total` motion and orientation.

A weak spatial background/underlay shows selected operand
contribution.

```text
neutral comet motion/orientation  →  V_total
colored spatial highlight         →  selected operand contribution
```

Potential advantage: clean split between total motion and
mechanism geography.

Risks:

- 3D transparency / depth legibility;
- may read as physical cloud / air volume;
- may hide scientific tracers;
- volume representation is **unsolved**.

Do **not** automatically choose volume rendering.
Background geometry is an open prototype question
(slice / samples / weak volume-like support / other).

### 25.2 B — Comet highlight

No extra background geometry.

The perceptual comets change color/intensity from the
selected operand’s contribution at current position and
laboratory time.

Still:

- trajectory / advection = `V_total`;
- orientation = `V_total`;
- highlight does **not** mean the comet “belongs to
  updraft”;
- it is the same visual occupant, sitting where the
  selected operand currently contributes.

Potential advantage: less clutter; spatial structure rides
on the flow.

Risk: colored comets read as a separate air sort / separate
population.

### 25.3 Comparison questions

1. Where is the selected operand’s spatial geometry clearer?
2. Where does `V_total` direction remain readable?
3. Where is scientific-tracer foreground hierarchy better?
4. Which works better on PLAY?
5. Which works better on PAUSE?
6. Which less invites a separate-air-mass reading?
7. Which less invites cloud/density reading?
8. Which survives camera orbit / depth overlap better?
9. Is legend/copy required for the semantics to be honest?

### 25.4 Color

No meteorological fixed palette in this prototype.

The first A/B used one fixed hue. Live comparison is three
fixed high-chroma **prototype** hues (Hue A / B / C) on the
kept comet-tint encoding. These are workbench candidates,
not a product palette.

A future product **may** let the user pick highlight color;
a color picker is **not** this experiment and must not be
implemented here.

If intensity is opacity or saturation, name it as visual
mapping of **selected-operand contribution magnitude**,
not density.

No multi-operand rainbow overlay.

v1 hypothesis: at most **one** operand selected at a time.

---

## 26. Next workbench experiments

**Kind:** A/B/C IMPLEMENTED; hue comparison COMPLETE;
single-operand selector IMPLEMENTED (§31); six-operand
browser playtest WAITING FOR USER

Sequence as commanded:

### A. R1 mark refinement     IMPLEMENTED PROTOTYPE

Current oriented `LineSegments` vs comet-like oriented
mark. Same population, same `V_total`. Live in §30.

### B. Pause semantics     IMPLEMENTED PROTOTYPE

Full visual freeze vs frozen-field continuing perceptual
animation. Samples at `t_pause` only. Live in §30.

### C. Operand highlight     IMPLEMENTED PROTOTYPE

Comet tint VALIDATED as the contribution-encoding
mechanism. Background overlay is a rejected branch
(historical §25.1). Hue A/B/C comparison COMPLETE; exact
palette DEFERRED. Live diagnostic selector is Off plus one
of six storm operands, one prototype hue (§31).

### D. Browser playtest / decision checkpoint     WAITING FOR USER

Six storm-operand comet-tint playtest is the next evidence.
Do not declare a representation winner from this document.

Only after evidence decide:

- whether comet-R1 becomes the main perceptual layer;
- whether R2 is kept as a separate diagnostic layer;
- whether a product highlight palette is earned;
- whether Pause should animate a frozen field in product UI.

Do not implement R3, LIC, slices, micro-trails, speed
encoding, public selectors, Guided population, camera
pan/reset, Follow, or physics because these hypotheses
exist.

---

## 27. Physics honesty (still binding)

Continuity remains YELLOW.

New visual layers do **not** license:

- mass-consistent circulation;
- same-air-mass circulation;
- realistic parcel;
- mesocyclone capture;
- full supercell circulation;
- D1 → NG1 causal continuation;
- RFD / FFD;
- cold pool;
- gust front;
- density current;
- cloud / precipitation.

```text
comet spacing / count     != density / mass
operand highlight         != physical air-mass boundary
```

---

## 28. Camera

P1 pan/reset (`21` §3) remains a known separate issue.
This checkpoint does not implement it.

If playtest again shows that projection/depth hides known
structures **regardless of encoding**, camera/navigation
may become a prerequisite later.

Do not smuggle Follow into that contingency.

---

## 29. Compact lock-in

```text
product representation:   UNDER EVALUATION

R0 Advected Points:       IMPLEMENTED BASELINE
                          default Explore mode
                          not preferred main candidate

R1 Oriented Advected:     IMPLEMENTED PROTOTYPE
                          strongest current main-layer
                          candidate; geometry not final

R1 comet refinement:      IMPLEMENTED PROTOTYPE
                          same VisualAirflowPopulation
                          perceptual cue, not path history
                          not a product winner

R2 Eulerian Oriented:     IMPLEMENTED PROTOTYPE
                          earned diagnostic-layer candidate
                          not main product representation

R3 Sparse Streamlines:    DEFERRED

frozen-field animation
during scientific Pause:  IMPLEMENTED PROTOTYPE
                          default Pause viz = full freeze
                          optional animate at t_pause

operand contribution
highlight:                IMPLEMENTED PROTOTYPE
                          comet tint VALIDATED
                          Background = REJECTED
                          Hue A/B/C comparison COMPLETE
                          exact product palette DEFERRED
                          live: Off / one of six storm
                          operands, one prototype hue
                          environmental advection DEFERRED
                          multi-operand display NOT STARTED
                          not Inspector-owned
                          six-operand playtest WAITING

depth cue:                ORTHOGONAL TOGGLE LIVE

workbench:                dev/research only
                          modes != public product modes

field:                    same canonical V_total
length:                   fixed; speed encoding later
curvature:                local mark cannot show it
continuity:               YELLOW
camera P1:                contingency, not implemented

Slice A:                  COMPLETE
prototype comparison:     IMPLEMENTED
single-operand selector:  IMPLEMENTED; playtest pending
physics:                  PAUSED
```

---

## 30. Prototype comparison slice — implementation record

**Status:** IMPLEMENTED for browser playtest. No product
winner. Physics PAUSED.

### Live modules

```text
src/visualization/cometAirflowMark.ts
src/visualization/cometOccupancyFade.ts
src/visualization/operandContributionDisplay.ts
src/visualization/writeContributionDisplayStrengths.ts
src/visualization/stepVisualAirflowOnFrozenField.ts
src/visualization/visualAirflowElapsedFromWall.ts
src/rendering/CometAirflowMarkScene.ts
src/rendering/OperandHighlightBackgroundScene.ts
  (rejected branch; not constructed by live workbench)
src/rendering/vertexColorSpace.ts
src/rendering/visualAirflowWorkbenchMode.ts
src/ui/tracer/VisualAirflowWorkbenchControls.tsx
```

Existing `VisualAirflowPopulation` is reused. No second
physical population. No `TracerPathHistory` on occupants.

### Encodings (independent of Pause viz and highlight)

```text
R0  VisualAirflowScene             THREE.Points
R1  OrientedAirflowMarkScene       THREE.LineSegments
R1c CometAirflowMarkScene          THREE.LineSegments
    4 segments / occupant
    head at occupant P
    tail at P − L d̂
    L = 500 m fixture, not |V|
    occupancy fade from visualization age
R2  OrientedAirflowMarkScene       THREE.LineSegments
    name eulerianAirflowMarks
```

Default Explore encoding remains **R0 Points**.

### Comet fade

Renderer-local only. `age` is time since last visual
reseed, not parcel history.

```text
fadeIn  = clamp(age / 3 s, 0, 1)
fadeOut = clamp((maxAge − age) / 8 s, 0, 1)
fade    = min(fadeIn, fadeOut)
```

`maxAge` is the visualization retirement age (DEMO fixture
80 s). Fade does not mutate Simulation, Inspector, or
scientific trails.

Fade scales **vertex alpha**, not RGB. Scaling RGB darkens a
mark toward black over the clear color instead of removing
it, so a faded comet stayed visible as a grey streak.

### Vertex color space and alpha channel

Three.js decodes sRGB only for `THREE.Color` inputs such as
`material.color`. A `BufferAttribute` named `color` is
uploaded as is and assumed to be in the renderer working
color space (linear-sRGB), then encoded to sRGB on output.
Palette constants are authored as sRGB hex, so every value
that reaches a color attribute passes through
`linearRgbFromSrgbHex`.

Writing raw sRGB channel fractions lifted the dark end of
each ramp (comet tail `0x2a` rendered near `0x71`), which
flattened tail→head asymmetry, halved the perceived
occupancy fade, and washed the highlight hue toward white.

Alpha lives in the color attribute, not in
`material.opacity`. `itemSize = 4` on the color attribute is
what makes Three.js compile `USE_COLOR_ALPHA`.

```text
R1 / R2 alpha    tail 0.10 → head 0.85     direction sign
R1c alpha        headOpacity × t × fade    t = headward
highlight alpha  peakOpacity × displayStrength
```

A uniform `material.opacity` cannot express head–tail
asymmetry, so the sign cue relied on luminance alone.

Encoding only. Alpha does not mean density, mass, moisture,
cloud, probability, or velocity magnitude.

### Depth cue range

From the `DEEP_STORM_TRACER_VIEW` pose the DEMO airflow
volume spans about 6.4 km (near corner) to 26.2 km (far
corner). A far plane at the far corner drives the whole back
half of the volume to the clear color instead of ordering
it, so `far` sits beyond the volume.

```text
nearM 12000
farM  38000
```

Still camera distance, still not meteorological fog.

### Pause visualization (independent of scientific Pause)

Scientific Pause is unchanged: `simulationElapsedFromWall`
with `paused: true` yields 0, so `Simulation.step` does not
run. Inspector stays at current `P, t`.

Workbench choice:

```text
full-freeze                 default; no visual step
frozen-field-animation      VisualAirflowPopulation.step(dt, t_pause)
```

`t_pause = simulation.clock.time` on every visual step.
Wall-clock is not field time. Visual dt comes from
`visualAirflowElapsedFromWall` (clamp 0.25 s) into a
**view-runtime** `visualAccumulator` in `TracerViewport`.
It does not call `Simulation.step` and does not fire
`onSimulationAdvanced`.

R2 Eulerian samples stay at their fixed lattice. Sync still
observes `V_total(P, t_pause)`.

### Canonical V_total

Unchanged from Slice A:

```text
ExploreLab.velocityObservation.total
  == Simulation field
  == VisualAirflowPopulation field
  == EulerianAirflowSamples field
  == TracerViewport visualAirflowField
```

R1/comet advection and orientation use that instance via
`samplesField` + `writeAdvectedOrientedAirflow`.

### Canonical operand resolution

Previous live path resolved only updraft. Current path:

```text
resolveStormOperandHighlightField(observation.parts, key)
  = observation.parts.find(part.key === key).field
```

`key` is one of `STORM_OPERAND_HIGHLIGHT_KEYS`. Same named
instance Inspector decomposition already holds. No
`createUpdraftField` / `createRotationField` / other
factory, no second physics field. `V_total` is not replaced.

### Highlight modes (independent of encoding)

**Superseded by §31.** Hue A/B/C were the previous live
comparison. They completed their research task and are no
longer mounted.

Live:

```text
Off          no overlay, no tint
one storm    comet tint of R1 / comet / R2 marks at P,t
operand      one prototype hue, not a product palette
             advection/orientation still V_total
             Points stay uniform (documented no-op)
```

Rejected, not constructed:

```text
Background   OperandHighlightBackgroundScene
             historical §25.1; live workbench does not
             instantiate it
```

Color means “this visual sample is where the selected
operand currently contributes this much”, not “this is
updraft air” / rotation air / a separate mass. Head–tail
comet alpha is unchanged by tint.

### Display mapping (visualization fixture)

**Superseded by §31.** The previous updraft-only mapping
used `R = 30 m/s` and three prototype hues. Live mapping
is per selected storm operand, one hue.

### Combinations

Independent rows:

```text
encoding:     Points | Advected marks | Comets | Eulerian marks
Pause viz:    Full freeze | Animate frozen field
highlight:    Off | one of six storm operands
depth cue:    orthogonal checkbox
```

No hidden coupling. Comet encoding does not turn highlight
on. Operand selector does not change encoding. Pause viz
does not change scientific Pause.

Meaningless-but-legal: an operand + Points leaves Points
uniform. Use Comets (or Advected / Eulerian marks) to see
operand geography.

Explore-only. Guided has no workbench. Explore↔Guided
resets encoding, Pause viz, highlight, and depth cue.

### Foreground / picking

Scientific tracers remain pickable, selectable, Inspector-
owned, with scientific trails. Comet marks, oriented marks,
and points set `raycast = () => {}` and carry no `tracerId`.

### What this slice did not decide

Browser playtest has not yet chosen:

- comet-R1 vs oriented R1 as the main perceptual layer;
- whether R2 stays a diagnostic layer;
- a product highlight palette;
- whether Pause should animate a frozen field in product UI.

Background highlight is rejected as a live workbench branch.
Hue A/B/C comparison is complete. That is not a product
palette decision.

### What this slice did not implement

R3, LIC, slices, GPU particles, volume/cloud renderer,
multi-operand simultaneous colors, color picker, legend,
camera pan/reset, Follow, Inspector Level, Guided
population, RK2, continuity solver, new physics.

---

## 31. Single-operand diagnostic selector — implementation record

**Status:** IMPLEMENTED for browser playtest. No product
winner. Physics PAUSED.

Decision state:

```text
Background highlight                  REJECTED
comet contribution tint               VALIDATED
Hue A/B/C comparison                  COMPLETE
exact product palette                 DEFERRED
single-operand diagnostic selector    IMPLEMENTED
multi-operand simultaneous display    NOT STARTED
Environmental advection visualization DEFERRED
                                      (separate semantics)
six-operand browser perceptual result WAITING FOR USER PLAYTEST
```

### Live UI

Explore-only `VisualAirflowWorkbenchControls`:

```text
Highlight:  [ Off ]  [ Updraft ▼ ]
```

Options: Off, Updraft, Rotation, Lower inflow, Upper
outflow, Downdraft, Near-ground outflow.

Not mounted in Guided. No color picker. No Hue A/B/C.
One prototype hue for all six: `OPERAND_HIGHLIGHT_PROTOTYPE_HUE`
= 0xff2ec8 (former Hue A).

### Canonical resolution

```text
App highlightMode
  → resolveStormOperandHighlightField(
      lab.velocityObservation.parts,
      highlightMode,
    )
  → SAME named VelocityField as Inspector parts[key]
```

Comets still advect and orient on
`velocityObservation.total`. Selected operand affects only
display tint/salience.

```text
motion / orientation = V_total(P, t)
highlight strength   = |V_selected(P, t)| → display mapping
```

### Display normalization (visualization policy)

Unified `R = 30 m/s` is not equally useful. DEMO occupant
volume at t=0, 256 occupants:

```text
updraft            occupant max ≈ 28.9; locus 30
rotation           occupant max ≈ 12.1; locus ≈ 12.1
lowerInflow        occupant max ≈ 3.03; locus ≈ 3.03
upperOutflow       occupant max ≈ 6.04; locus ≈ 6.07
downdraft          occupant max ≈ 14.5; locus 20
nearGroundOutflow  occupant max ≈ 7.83; locus ≈ 9.81
```

At R = 30, lowerInflow has zero occupants ≥ 0.15 display
strength; near-ground outflow has one. That is a display
limit, not absence of the operand.

Live per-operand references
(`STORM_OPERAND_HIGHLIGHT_DISPLAY_REFERENCE_MPS`):

```text
updraft            30
rotation           12
lowerInflow         3
upperOutflow        6
downdraft          20
nearGroundOutflow  10
```

Each R sits near the configured/locus peak, not the
undersampled occupant-volume max. They are **not** imported
from `ScenarioConfig`, not physics constants, and not
existence thresholds. Color is not a quantitative
comparison across operands. Inspector remains the local
magnitude answer.

```text
displayStrength = clamp(|V_operand| / R_operand, 0, 1)
```

Sampled at `simulation.clock.time` (laboratory time /
`t_pause` on scientific Pause).

### Unchanged contracts

Pause viz (full freeze / frozen-field animation), comet
geometry, scientific foreground/picking, and Points no-op
are unchanged. Advected/Eulerian marks keep the cheap tint
path. Background overlay is still not constructed.

### What this slice did not implement

Multi-operand simultaneous colors, seven-color palette,
color picker, Background highlight, volume/cloud, R3, LIC,
slices, new particles, GPU rewrite, camera pan/reset,
Follow, Inspector/Guided redesign, scientific tracer P2,
RK2, continuity, tilting/stretching, datasets,
thermo/cloud/precip, physics parameter tuning,
Environmental advection visualization.

---

## 32. STOP

```text
PHYSICS PAUSED
PRODUCT REPRESENTATION              UNDER EVALUATION
R0 POINTS                           BASELINE / NOT PREFERRED MAIN
R1 ORIENTED ADVECTED                STRONGEST MAIN-LAYER CANDIDATE
R1 COMET REFINEMENT                 IMPLEMENTED PROTOTYPE
                                    strongest current candidate
R2 EULERIAN                         DIAGNOSTIC-LAYER CANDIDATE
R3                                  DEFERRED
FROZEN-FIELD PAUSE ANIMATION        IMPLEMENTED PROTOTYPE
COMET CONTRIBUTION TINT             VALIDATED
BACKGROUND HIGHLIGHT                REJECTED
HUE A/B/C COMPARISON                COMPLETE
EXACT PRODUCT PALETTE               DEFERRED
SINGLE-OPERAND SELECTOR             IMPLEMENTED
MULTI-OPERAND DISPLAY               NOT STARTED
ENVIRONMENTAL ADVECTION VIZ         DEFERRED
SIX-OPERAND PLAYTEST                WAITING FOR USER
WORKBENCH SLICE A                   COMPLETE
PROTOTYPE COMPARISON SLICE          COMPLETE
CAMERA PAN / RESET                  NOT STARTED
FOLLOW                              NOT STARTED
GUIDED POPULATION                   NOT STARTED
```

Do not pick a product representation because these
prototypes exist.

Do not implement R3, LIC, slices, shaders-as-framework,
public selectors, Guided population, camera pan, Follow,
or physics because this document exists.

Next evidence is the user browser playtest of six storm
operands on the same comet population.
