# Perceptual Airflow / Flow-as-Structure Architecture

**Status:** architecture SoT. Slice 1 COMPLETE. Slice 2
(first Explore browser exposure) COMPLETE. Workbench Slice A
COMPLETE in `23`. Current perceptual-loop decision lives in
`24`. Product representation is not locked by this file.
Guided population NOT STARTED. Camera pan NOT STARTED.
**Scope:** perceptual airflow / flow-as-structure
**Physics:** pause lifted for design in `24`. This file does
not resume physics implementation. Direction revalidation:
`docs/architecture/25-tilting-stretching-direction-revalidation.md`.
**Implementation:** Slice 1 COMPLETE; Slice 2 COMPLETE;
Workbench Slice A COMPLETE in `23`; prototype comparison
COMPLETE in `23`; exploration-loop decision in `24`; product
encoding not chosen here
**Decision:** earned for a narrow first perceptual direction;
other representation/runtime alternatives remain recorded.
Successor `24` closes the current exploration loop without
declaring a final product visualization.

Predecessor whole-product checkpoint:
`docs/architecture/21-whole-product-direction-checkpoint.md`.

First playtest and representation-comparison successor:
`docs/architecture/23-perceptual-airflow-workbench.md`.
That document does not replace this one.

Exploration-loop decision and physics resumption:
`docs/architecture/24-perceptual-exploration-checkpoint.md`.

This document answers Candidate 1 from `21` §13:

> What perceptual representation of the existing prescribed
> velocity field should a person see, so that storm airflow is
> legible as a spatial structure, without the picture making
> stronger physical claims than the model allows?

The original architecture exploration did **not** implement
particles, streamlines, shaders, GPU code, camera pan, Follow,
or a dataset adapter.

Current implementation:

```text
Slice 1  headless VisualAirflowPopulation   COMPLETE
Slice 2  Explore browser exposure           COMPLETE
Workbench Slice A (R0/R1/R2 + depth cue)    COMPLETE in `23`
prototype comparison slice                  COMPLETE in `23`
exploration-loop decision                   `24`
product representation                      NOT LOCKED HERE
Guided population                           NOT STARTED
camera pan                                  NOT STARTED
```

Verified against current `main` after `21`:

```text
daab0f8b2cc5a3ccc308761398d23b4ce7756a73
```

Authoritative:

- `docs/CONCEPT.md` §1–§5, §9, §11, §13
- `docs/ARCHITECTURE.md` §2, §9–§13, §16–§20, §24–§25, §36
- `docs/physics/01-parcel-basics.md` §8–§10, §14–§15
- `docs/physics/02-velocity-field-basics.md` §2, §22–§23, §32
- `docs/physics/12-composite-velocity-field.md`
- `docs/architecture/15-post-near-ground-outflow-checkpoint.md`
- `docs/architecture/16-explore-guided-interaction-architecture.md`
- `docs/architecture/18-explore-arbitrary-seeding.md`
- `docs/architecture/19-shared-tracer-inspector.md`
- `docs/architecture/20-guided-runtime-architecture.md`
- `docs/rendering/01-tracer-scene.md`
- `docs/rendering/11-deep-storm-tracer-view.md`
- `docs/rendering/14-tracer-path-history.md`

Current modeling status: `24`; direction revalidation `25`.

---

## 1. Motivation

`CONCEPT` opens with:

```text
Perceive the invisible atmosphere.
```

§4 names airflow as the first artificial sense: moving tracers,
trajectories, streamlines, ribbons, or other directional
encodings of where air is moving and how fast.

After Explore, Inspector, and Guided v1, a person can **probe**
and **explain** individual pathlines. They still cannot open
the laboratory and **see the flow as a structure**.

`21` locked the product requirement:

> Point release is an inquiry / probe mechanism, not the
> intended sole final representation of supercell airflow.

This exploration specifies the missing perceptual layer for
**current** `V_total`. It does not resume physics.

---

## 2. Current perceptual gap

Live 3D encoding, verified in production:

```text
tracer glyphs          SphereGeometry, radius 150 m
trails                 THREE.Line from TracerPathHistory
                       when the experience enables them
ground reference       GridHelper 10 km / 10 divisions
axes                   AxesHelper
hodograph              separate panel, layer fixture [0, 1000] m
Inspector              selected scientific tracer
Guided copy            Observe / Demonstrates / Does not mean
camera                 OrbitControls around (0, 4000, 0)
```

Typical occupancy:

```text
Guided inflow-to-upper-outflow    2 curated tracers
Guided downdraft-path-to-ground   1
Guided near-ground-outflow        1
Explore scientific default        0 until the user releases
Explore visual airflow            256 ephemeral markers (Slice 2)
```

Before Slice 2 the empty Explore lab was an honest empty
probe session and a perceptual failure. Slice 2 shows a
background picture of `V_total`; scientific occupancy can
still be zero. Guided still has no population.

The gap is **not** missing operands. The seven-operand sum
already exists. Slice 2 is the first Explore picture of that
sum as a spatial structure; it is not yet a claim that every
mechanism region is readable from the default camera.

---

## 3. Physics honesty boundary

The live model is unchanged:

```text
IntegrationFrame = StormRelativeLaboratory
seven prescribed additive operands
continuity       = YELLOW
not CFD
not mass-consistent circulation
no thermodynamics / cold pool / density current
no prognostic storm evolution
fields           = Eulerian-steady (sample ignores time)
```

A new picture of **the same** `V_total` must not automatically
claim:

```text
same-air-mass circulation
realistic parcel
closed circulation
mass flux
conserved air mass
mesocyclone capture
full supercell circulation
D1 → NG1 causal continuation
downdraft → cold pool
RFD / FFD
gust front / density current
realistic cloud motion
```

### 3.1 The dense-picture risk

This is the central honesty problem.

Sparse scientific tracers are already easy to over-read. A
**dense moving population** is easier to over-read, even if
every occupant is integrated through the identical field.

YELLOW `∇ · V` makes this worse: occupants will appear to
crowd in sinks and thin in sources (`02` physics §21). That
pattern looks like concentration, mass flux, or even cloud.

**Contract:**

```text
visual occupancy ≠ air density
visual occupancy ≠ mass
visual occupancy ≠ probability
visual occupancy ≠ precipitation
visual occupancy ≠ cloud water
```

Copy, glyph language, and seeding policy must all carry this.
A prettier soup cannot unsay `10` / `15` / `17`.

### 3.2 Not a cloud proxy

Hard forbid, from `CONCEPT` §9 and `21` §12:

```text
airflow visualization
  != cloud
  != condensate
  != moisture
  != precipitation
```

Opacity, volume, or particle density must not be used as a
stand-in cloud. Cloud layers require a corresponding
thermodynamic / hydrometeor source.

---

## 4. Product roles

`21` §11, kept distinct:

```text
scientific / product tracer
  = inquiry probe (Explore) or curated teaching occupant (Guided)
  has tracerId, selection, Inspector, domain lifecycle

population airflow visualization
  = perceptual representation of the flow
  does not inherit probe or Guided claims

Guided cohort
  = curated teaching observation

selected tracer + Inspector
  = local explanation of one scientific occupant
```

v1 must make the first two visually distinguishable in the
same scene:

```text
background flow structure
+ user or Guided probe
+ selected probe highlight
+ Inspector of that probe
```

A person should be able to say:

> that dim moving field is the background picture of `V_total`;
> this larger tracer is the one I am investigating.

---

## 5. Perceptual requirements

Independent of implementation. v1 should let the eye notice
**composite** structure, not seven labeled mechanisms.

Desired discriminations, as *regions of composite motion*:

- environmental through-flow (far from storm occupants);
- lower-level inward approach;
- ascent in the updraft region;
- azimuthal turning where rotation is strong;
- upper-level outward transport;
- descent in the offset downdraft region;
- near-ground outward spreading in the NG occupant;
- that these regions live at different heights;
- that influence falls off away from occupant cores.

v1 does **not** require:

- a separate color or particle system per operand;
- that every viewer name all seven types;
- that inflow and NG be readable as mass-conserving partners.

Composite question, owned by this layer:

> Where does the current model say the flow is going?

Mechanism question, already owned by Inspector Level 2:

> Which prescribed operand contributes at this probe?

Do not merge those questions into seven colored swarms.

---

## 6. Representation candidates

### 6.1 A. Animated advected particles

Many short-lived visual occupants integrated through `V_total`.

**Shows well:** living direction; relative speed if advection is
literal; 3D occupancy of fast vs quiet regions; time intuition
(pause freezes the soup).

**Hides:** instantaneous field geometry that a streamline would
draw in one glance; anything the seeding volume does not cover.

**False-claim risk:** **highest** for mass / density / cloud,
especially under YELLOW divergence and if trails are long.

**Seeding/lifetime:** must be visualization policy (spawn,
age, recycle). Otherwise this collapses into scientific
tracers and recreates P2 at hundreds of occupants.

### 6.2 B. Streamlines

Instantaneous integral curves of `V(x, t_fixed)`.

In the current Eulerian-steady laboratory (`01` parcel §15,
`ARCHITECTURE` §20):

```text
pathline geometry ≈ streamline geometry
```

Product semantics still differ. A streamline is a picture of
the field **now**. A pathline is one marker’s history. Identity,
age, birth, selection, and Inspector attach only to the latter.

**Shows well:** whole-field geometry in one static drawing;
vertical structure if seeds span height.

**Hides:** temporal “this is moving”; unsteady future history.

**False-claim risk:** **high** for circulation / flux tubes.
A dense set of curves through inflow, updraft, and outflow
looks like “the air’s life through the storm” — the claim
`17` §14 forbids as a Guided concatenation, now drawn as
geometry. Sources/sinks from YELLOW `∇ · V` make curves begin
and end, which can look like mass creation.

**Steady-field trap:** because geometry coincides with
pathlines today, shipping streamlines-only would overfit DEMO
steadiness (`§21` of this document).

### 6.3 C. Pathline populations

Many **actual** integrated trajectories kept as history.

If these are scientific `TracerParticle`s, they are role A
implemented on the probe runtime — identity, history, P2, and
Inspector pollution.

If they are ephemeral occupants with long trails, they are A
plus unbounded polylines. `18` §14 already flags full-history
lines as the scaling cliff at hundreds–thousands.

Geometrically, while the field is steady, C ≈ A with long
memory ≈ B. Architecturally C is the most expensive and the
easiest to confuse with Guided/Explore tracers.

### 6.4 D. Vector glyph / arrow field

Sparse local `V` on planes or a lattice.

**Shows well:** honest local direction and, with length,
magnitude; altitude slices; future hodograph linkage.

**Hides:** continuous spatial structure; temporal motion.

**False-claim risk:** **low** for mass. **Medium** if arrows
are so dense they read as a texture of “wind everywhere”
including quiet exterior.

Useful as a **supporting** layer, not as the primary
“perceive the invisible airflow” sense. `CONCEPT` §4 leads
with moving tracers / trajectories / streamlines.

### 6.5 E. Hybrids

Possible later:

- ephemeral particles + selected scientific probe (this is
  actually the **product composition**, not a hybrid encoding);
- particles + short motion streaks;
- particles + sparse streamlines;
- altitude slice glyphs + particles.

Do not ship “everything” as v1. The product already composes
background + probe + Inspector. That is the hybrid that
matters. Extra encodings wait.

---

## 7. Steady-field semantics

Live storm fields ignore `time` in `sample` (underscore `_time`
in production types). The interface is still
`sample(position, time)` (`ARCHITECTURE` §9, `CONCEPT` §11).

Therefore:

```text
steady V
  → streamline at any t is the same curve
  → a pathline from x0 traces that same curve
```

Geometry coincidence is **not** role coincidence:

| Object | Geometry today | Product role |
| --- | --- | --- |
| Streamline | curve of `V_total` | field picture at an instant |
| Visual occupant path | same curve, short segment | perceptual marker, no identity |
| Explore tracer pathline | same curve from user IC | unlabeled scientific probe |
| Guided S1 pathline | researched curve | teaching claim `08` §6 |

Do not collapse these because DEMO is steady. Unsteady datasets
will split streamline vs pathline (`01` parcel §15). Identity
already splits them.

---

## 8. Composite vs mechanism perception

v1 perceptual airflow is a picture of **`V_total`**.

Operand decomposition stays on the Inspector for a **selected
scientific tracer**. It is not a second particle system.

Rejected as v1:

```text
seven colored swarms, one per DEMO operand
```

Reasons:

- DEMO tokens are synthetic-only (`21` §8 E);
- a future dataset may expose only `V_total`;
- color-as-mechanism is a fake layer legend unless the user
  asked for debug (`ARCHITECTURE` §28);
- Guided isolation would be visually undone if updraft-colored
  and downdraft-colored soups occupy one scene as “the storm.”

A later **debug** toggle to show one operand’s isolated field
as its own visualization is compatible with §28. It is not
the product airflow layer.

---

## 9. Population identity semantics

Question: must visual occupants be selectable, inspectable,
carry `tracerId`, persist, show age, have trails, or enter
Guided semantics?

**v1 answers: no.**

```text
scientific / product tracer  !=  ephemeral visualization occupant
```

Existing `TracerParticle.tracerId` exists because `19` needed
selection that survives occupancy layout. Visual occupants do
not answer “why is **this** marker moving?” — the background
answers “what does the field look like?”

Giving them `tracerId` would:

- pollute picking (`TracerScene.pickVisibleTracer`);
- invite Inspector rows for anonymous markers;
- force Reset/Clear policy as if they were Explore seeds;
- make Guided isolation a particle-list problem again.

**Trade-off of a separate occupant type:** some duplicated
advection loop. **Trade-off of reuse:** identity, history,
Guided, Explore, and Inspector all become wrong by default.

The preview marker (`18` §15) already proved a third visual
that is not a particle. Visual airflow is a fourth **role**,
not a fourth physics object.

---

## 10. Runtime architecture candidates

Analyzed **after** the semantic split in §4–§9.

### R1 — reuse existing `Simulation` particles

Population lives in `Simulation.particles` beside probes.

**Reuse:** integrator, domain hook, `addParticle`, viewport
step loop.

**Breaks:**

- identity: `tracerId` minted for every visual occupant;
- picking / selection / Inspector;
- `TracerPathHistory` one lane per occupant, stride 1, no cap
  (P2 at N ≫ Guided);
- Guided Reset restores **canonical ICs**, not a soup;
- Explore Clear would wipe the background with the probes, or
  Reset would rewind visual occupants as if they were seeds;
- `keepInactiveGlyphs` and 150 m spheres apply to the soup;
- Guided teaching occupants drown in their own list.

This is not “reuse.” It is role collapse. **Rejected for v1.**

### R2 — separate visualization population

A headless runtime layer beside `Simulation`:

- samples the **same** `VelocityField` instance the laboratory
  integrates (`velocityObservation.total`);
- integrates ephemeral occupants with the shared integrator
  **type** and the **same** `clock` / `dt` / pause / timeScale;
- owns spawn / age / recycle / budget as visualization policy;
- does not assign `tracerId`;
- does not write scientific `TracerPathHistory`;
- is Three-free and unit-testable;
- `TracerScene` observes a distinct glyph set (not pickable).

**Duplication:** a second step loop. Acceptable if it is a
thin occupant list + `Integrator.step` + `field.sample`, not
a second physics model.

**Consistency:** canonical field instance, same numerical
clock. Trajectories of a visual occupant and a scientific
tracer born at the same point at the same time must match
within ordinary integrator error.

**Ownership:** interaction / session layer, like
`ExploreTracerSession`. Not `CompositeVelocityField`. Not
`TracerScene`. Not `ScenarioConfig`.

### R3 — renderer-owned integration

`TracerScene` or a shader creates and advects visual particles.

`ARCHITECTURE` §17: rendering observes; it must not invent or
correct physical behavior. Putting advection inside Three.js
makes integration semantics untestable without WebGL and ties
airflow to a renderer.

A GPU particle system may become necessary at much larger N
(`ARCHITECTURE` §19). It is not justified for v1 hundreds.
**Rejected as v1.** A later GPU path must still sample the
canonical field and keep a CPU reference if practical.

### R4 — static / instantaneous streamline geometry

Headless integration of curves through `V_total` at `t_fixed`,
then observe-only lines.

Valid **supporting** encoding. Weaker as the sole v1 sense:
DEMO steadiness makes it a static drawing of pathline geometry,
easy to read as “the storm’s circulation,” with little temporal
intuition. Future unsteady fields change its meaning (`§21`).

**Not v1 primary.** Eligible later as an optional overlay.

---

## 11. Canonical field invariant

Locked:

> Perceptual airflow observes the same canonical total
> velocity field that defines the current laboratory model.

```text
lab.velocityObservation.total
  = CompositeVelocityField instance Simulation integrates
```

No visually tuned duplicate field. No rebuilt seven-operand
stack inside the renderer. No “prettier” `W0`.

If a sampling adapter exists (for example a visualization
volume test), it is a **policy wrapper around sample**, not a
second atmosphere. Ownership: visualization runtime, not
physics.

---

## 12. Seeding semantics

Visual spawn is **where markers are placed to reveal `V`**.
It is not a concentration field.

### 12.1 Compared families

| Family | Whole-flow | False-mass risk | v1 |
| --- | --- | --- | --- |
| Uniform / jittered volume lattice | Honest coverage of a declared box | Lowest if spacing is even | **Canonical v1** |
| Stratified altitude bands | Helps vertical structure | Low if band counts are equal, not |V|-weighted | Allowed v1 variant of the lattice |
| Horizontal planes | Slice teaching | Plane can look like a sheet of mass | Later supporting |
| Domain boundaries / inflow face | Looks like flux through a gate | **High** | Rejected v1 |
| Lower-level inflow region only | Mechanism exhibit, not whole flow | High (“this is the inflow mass”) | Rejected v1 |
| Adaptive to \|V\| or divergence | Puts markers where the field is loud | Reads as density/speed encoding | Rejected v1 |
| Structured continuous emitter | Looks like a source | Highest with YELLOW `∇ · V` | Rejected v1 |
| Guided-IC neighborhood emitter | Turns S1 into a fan | Forbidden by `14` §7 / `17` | Forbidden |

### 12.2 v1 spawn contract

```text
declared visualization volume
  (laboratory pad × storm-column height, y ≥ 0)
deterministic jittered lattice
  (reproducible from a documented seed)
equal occupancy intent across the volume
  (not concentrated in occupant cores)
```

Exact spacing, N, and box numbers are DEMO **view fixtures**,
not physics and not this document’s lock-in. They must be
named as visualization parameters.

**User-facing meaning:**

> Markers are sprinkled through the laboratory so you can see
> how the prescribed field would carry a massless point.
> Crowding is not more air.

---

## 13. Lifecycle / recycling

P2 (`21` §4): a scientific tracer may remain advection-active
forever under environmental advection; history may grow without
cap. That policy stays.

Visual occupants **must not** inherit it.

```text
scientific tracer lifecycle
  = AtmosphericTracerDomain (y ≥ 0 crossing)
    + user Reset/Clear / Guided replace-cohort

visual occupant lifecycle
  = visualization policy:
      finite visual age
      recycle / respawn
      retire if it leaves the visualization volume
      population budget N
      no scientific trail cap required because v1 has no
      full-history visual trails
```

Respawn is **not** physical deactivation. It does not use

```text
local storm contributions = 0  →  dead
```

Environmental advection is a real operand. Quiet exterior
markers still tell the truth about through-flow.

Visual spawn stays at `y ≥ 0`. Field sampling remains
unbounded. Do not turn the inflow plateau underground into a
visual exhibit (`11`, `17` physics).

Pause / timeScale / Reset:

- Pause freezes visual occupants (same clock).
- timeScale advects them with the laboratory.
- Guided/Explore Reset **replaces or respawns** the visual
  population as a visualization reset, not as
  `resetTracersFromSeeds`.
- Explore Clear of **scientific** tracers must not imply Clear
  of the background unless a separate control says so.

---

## 14. Speed and visual encoding

### 14.1 Speed

v1 advection speed is **literal model `V_total`**.

Existing `timeScale` (`1/5/10/20×`) is session playback, already
honest as “faster laboratory clock,” not a per-particle lie.

Rejected v1: normalize all occupants to one display speed.
That would erase the difference between a 30 m/s chimney and
weak exterior flow — the main magnitude cue the eye has.

### 14.2 Color, opacity, size, trails

v1 constraints:

| Channel | v1 meaning | Must not mean |
| --- | --- | --- |
| Color | purely perceptual contrast vs scientific tracers (one muted family) | density, moisture, cloud, vorticity, operand identity |
| Opacity | readability / subordination to probes | condensate, probability |
| Size | smaller than scientific glyphs; not a physical radius | parcel volume |
| Count / spacing | visualization budget | concentration |
| Trail | **off** for v1 visual occupants (scientific trails stay on probes/cohorts) | streamtube, mass flux |

Height-based color is deferred: useful for vertical structure,
easy to misread as temperature. If added later, it needs an
explicit legend and still must not claim thermo.

---

## 15. Explore integration

Explore point release remains the probe mechanism (`18`).

Intended scene:

```text
background visual population   (always-on in Explore v1)
+ user-released unlabeled tracers
+ selected highlight
+ Inspector of the selected tracer
```

Empty Explore stops being an empty world: the field becomes
visible; a click still creates **the user’s** tracer, visually
larger, trails on, pickable.

Placement preview stays a non-particle marker (`18` §15).

---

## 16. Guided integration

Guided cohorts remain the teaching occupants (`17`, `20`).

Population must not:

- drown S1/S2 / D1 / NG1;
- hide the teaching trail;
- turn an isolated experiment into a storm-soup cartoon.

Policy candidates:

| Policy | Verdict |
| --- | --- |
| Full Explore-density soup in Guided | Rejected. Breaks isolation visually. |
| Population absent by default | Too weak: Guided still cannot show “flow around this path.” |
| **On, visually subordinate, lower N; toggle to hide** | **Canonical v1.** |
| Guided-specific emphasis of the cohort (larger glyphs, trails) | Required companion: existing Guided glyph/trail policy already does this if the background is smaller/dimmer. |

Toggle is product chrome, not physics. Default **on but
quiet**. Isolation copy in GuidedExperimentPanel still applies:
the soup is `V_total`, not “here comes the cold pool.”

---

## 17. Inspector boundary

Inspector remains a scientific-tracer tool (`19`).

```text
background visual occupants are not pickable
they have no tracerId
they do not produce TracerInspection
```

Picking continues to test **visible scientific glyphs only**.
Visual occupants must be distinct enough (size / brightness /
lack of trail) that the user does not try to click them as
probes.

If a later debug mode inspects a visual occupant, that is a
new question. It is not earned by reuse.

---

## 18. Camera requirements

P1 (`21` §3): orbit/zoom around a fixed DEMO target. Pan /
target translation is a candidate, not implemented here.

Perceptual airflow **creates** a stronger desire to frame
sub-regions (inflow south, NG patch, upper outflow). It does
**not** make the default overview pose useless.
`DEEP_STORM_TRACER_VIEW` already frames the laboratory column
from tens of kilometers (`11` rendering).

Minimum camera **needs** of this layer:

```text
orbit     already live; keep
zoom      already live; keep
overview  current default pose is the canonical v1 overview
pan       desirable for close inspection; not required to
          perceive structure from the default pose
reset     desirable with pan; not required for v1 overview
Follow    do not design; do not block
clipping  far plane 50 km already covers the pad; revisit if
          the visualization volume grows
```

### 18.1 Camera before perceptual implementation?

```text
Camera pan/reset before perceptual implementation:
CAN BE PARALLEL
```

Argument: v1 success is “see structure from the existing
overview.” That does not require pan. P1 will get louder once
the soup exists and the user leans in; pan should follow soon
and may be developed in parallel. Do not serialize perceptual
work behind a camera slice. Do not smuggle Follow into pan.

---

## 19. Performance envelope

No production benchmark. Orders of magnitude only, using
`18` §14 as the nearest measured discussion.

| N visual occupants | Reading |
| --- | --- |
| tens | Too sparse for structure; we already have this as Guided |
| hundreds | **v1 product envelope.** CPU `sample` × Euler at DEMO `dt` should be in the same class `18` called “fine” at ~100 |
| thousands | Possible later; history-less occupants avoid the polyline cliff; glyph instancing may become a rendering concern |
| tens of thousands | Premature GPU (`ARCHITECTURE` §19). Not a v1 requirement |

**Product requirement:** hundreds of **history-less** visual
occupants, CPU, same field instance.

**Premature optimization:** InstancedMesh, workers, GPU
advection, shaders. Do not promise them. Current one-mesh-per
scientific glyph is a known boundary; visual occupants may
need a cheaper observe primitive **when measured**, not in
this SoT.

Do not put visual `N` on `ScenarioConfig` (`01`, `18`).

---

## 20. Dataset compatibility

Background airflow must depend on a generic
`VelocityField.sample(position, time)`, not on DEMO operand
keys.

Survives a later `DatasetVelocityField` (`ARCHITECTURE` §12,
`CONCEPT` §11):

- R2 population;
- `V_total` encoding;
- visualization-volume spawn;
- non-pickable glyphs.

Would not survive:

- seven colored operand swarms;
- spawn rules named after `LowerRadialInflowField`;
- Inspector-like decomposition baked into particle color.

No dataset adapter is designed here.

---

## 21. Unsteady-field compatibility

Current DEMO is steady. `CONCEPT` §6 and §14 want time as a
real dimension later.

| Encoding | Unsteady future |
| --- | --- |
| Ephemeral particles | Remain valid: short advected markers of **current** `V(x,t)` |
| Scientific pathlines | Become true histories through changing `V` |
| Streamlines | Become instantaneous snapshots; no longer coincide with pathlines |

Choosing streamlines as the **only** v1 encoding because DEMO
is steady would be a dead end for `CONCEPT`. Choosing
ephemeral particles now stays valid when `V` gains time.

Do not build an unsteady engine here.

---

## 22. Rejected / deferred

**Rejected now:**

- reuse `Simulation.particles` as the soup (R1);
- renderer-owned advection as v1 (R3);
- seven operand-colored particle systems;
- cloud / opacity / volume as airflow;
- inflow-face or continuous emitters as v1 spawn;
- \|V\|-adaptive seeding;
- `local storm = 0` → visual death;
- magnitude normalization;
- pickable background occupants;
- `ROADMAP.md` / GPU / dataset implementation.

**Deferred, not rejected:**

- streamline overlay (R4);
- vector glyphs / altitude slices (hodograph linkage branch);
- short visual motion streaks;
- height-colored occupants with a legend;
- Guided-specific density presets beyond “quiet vs off”;
- camera pan/reset (`21` P1);
- Follow;
- instancing / GPU after measurement;
- visual inspection debug mode.

---

## 23. Decision matrix

### 23.1 Representation

| | Particles (A) | Streamlines (B) | Pathline pop (C) | Glyphs (D) |
| --- | --- | --- | --- | --- |
| Whole-flow readability | High if N is hundreds | High, static | High, expensive | Low–medium |
| Vertical structure | High with volume spawn | High | High | High on slices |
| Direction | High (motion) | High (tangent) | High | High locally |
| Magnitude honesty | High if literal `V` | Weak unless encoded | High | High if length maps to speed |
| Temporal intuition | High | Low on steady DEMO | Medium | None |
| False-mass risk | High unless policy/copy | High as flux tubes / circulation | Highest with trails | Low |
| Clutter | Medium (no trails) | Medium | High | Medium on a 3D lattice |
| Guided compatibility | Good if subordinate | Risk: draws the forbidden cell | Poor | Good as overlay |
| Explore compatibility | Good as background | Good overlay | Collides with probes | Supporting |
| Unsteady future | Good | Semantics change | Good, costly | Good |
| Complexity | Medium | Medium | High (history) | Low–medium |

**v1 primary:** A, history-less, `V_total`.
**Not v1 primary:** B, C, D.
**Product hybrid:** A as background + existing scientific
probes/cohorts + Inspector — not a pile of encodings.

### 23.2 Runtime

| | R1 Simulation list | R2 separate population | R3 renderer integration | R4 streamline geometry |
| --- | --- | --- | --- | --- |
| Semantic cleanliness | Poor | **Good** | Poor (observe vs integrate) | Good for curves |
| Reuse | High, wrong layer | Integrator + field + clock | Three.js only | Field only |
| Canonical-field consistency | Yes | Yes if same instance | Easy to drift | Yes |
| Lifecycle ownership | Pollutes scientific | Visualization policy | Hidden in GPU/scene | None (static) |
| Identity pollution | Severe | None | None | None |
| Inspector coupling | Forced | None | None | None |
| Scaling | History cliff | Occupant budget | High N, untestable | Line count |
| Testability | Existing, wrong tests | Headless new tests | Weak | Headless |
| Dataset compatibility | Accidental | Natural | Renderer-shaped | Natural |
| Premature-architecture risk | High (role collapse) | Low if kept thin | High | Low as overlay |

**v1 runtime:** R2, thin, not a framework.

---

## 24. Recommended first implementation architecture

Earned. Narrow.

```text
representation   ephemeral animated visual occupants of V_total
runtime          separate visualization population (R2)
field            same VelocityField instance as Simulation
identity         none (not pickable, no tracerId, no Inspector)
seeding          deterministic jittered volume lattice, y ≥ 0
lifecycle        visual age + volume retirement + recycle
trails           off for visual occupants
speed            literal V_total; session timeScale unchanged
first surface    Explore background (empty lab currently shows
                 almost no field)
Guided           same layer, subordinate N, hide toggle
camera           current overview pose; pan parallel, not blocking
physics          PAUSED
```

Indicative (not a type mandate): a small
`AirflowVisualizationPopulation` owned at app/session
composition, stepped from the existing fixed-timestep loop,
observed by a distinct `TracerScene` glyph set.

This is **not** a particle engine, not GPU, not a layer CMS,
not seven systems.

First implementation slice, when commanded, should prove:

1. headless occupants follow the canonical `V_total`;
2. they do not enter `Simulation.particles` or Inspector;
3. Explore shows a background soup plus a distinct user probe;
4. scientific tracer lifecycle is unchanged.

Items 1, 2, and 4 are proven headlessly in Slice 1 (§29).
Item 3 is Slice 2 (browser wiring). This document is not that
command.

---

## 25. v1 visual truth

```text
A visual occupant is an ephemeral, non-selectable marker
advected by the same V_total the laboratory integrates.

Its presence, spacing, and count do not represent air density,
mass, moisture, cloud, precipitation, or probability.

Its birth, death, and recycling are visualization policy,
not AtmosphericTracerDomain physics and not Guided completion.

A scientific tracer remains a probe or a curated teaching
occupant. The two roles must stay visually distinct.
```

---

## 26. Open questions

Not blockers for the direction in §24. Needed before or during
the first implementation SoT:

- exact visualization volume and N (DEMO view fixtures);
- glyph radius / brightness relative to 150 m scientific
  spheres;
- whether Guided default N is a fraction of Explore N or a
  fixed quiet budget;
- lattice vs stratified bands as the first spawn variant;
- whether a one-line honesty caption is required in Explore
  (Guided already has a laboratory honesty line);
- cheaper observe primitive if hundreds of spheres hitch —
  measure first.

Hodograph ↔ 3D altitude linkage remains a **separate** branch
(`21` C). Perceptual airflow does not have to solve it.

---

## 27. Compact lock-in

```text
perceptual gap:           probes/cohorts visible; V_total as
                          structure almost not

v1 visual truth:          ephemeral V_total marker
                          occupancy ≠ mass/cloud

roles:                    scientific tracer ≠ visual occupant
                          Inspector stays on scientific only

representation v1:        animated ephemeral particles
                          streamlines/glyphs deferred overlay
                          pathline-population rejected as v1

runtime v1:               separate visualization population
                          same canonical VelocityField
                          renderer-owned integrate rejected
                          Simulation.particles reuse rejected

seeding v1:               jittered volume lattice
                          not emitters / not |V|-adaptive

lifecycle v1:             visual recycle policy
                          scientific domain policy unchanged
                          do not kill on local-storm-zero

Explore:                  background + probes
Guided:                   subordinate soup + toggle
Inspector:                scientific only
camera:                   CAN BE PARALLEL
performance:              hundreds CPU; no GPU promise
dataset:                  depend on VelocityField only
unsteady:                 particles remain valid
physics:                  pause lifted for design in `24`
                          implementation not started
implementation:           Slice 1 COMPLETE
                          Slice 2 Explore browser COMPLETE
                          Workbench Slice A COMPLETE in `23`
                          prototype comparison COMPLETE in `23`
                          exploration-loop decision in `24`
                          Guided population NOT STARTED
                          camera pan NOT STARTED
```

---

## 28. STOP (architecture exploration)

Slice 2 Explore browser COMPLETE.
Workbench Slice A is recorded in `23`. This file does not
pick a product encoding.

```text
PHYSICS STATUS                  SEE `24` (RESUMED FOR DESIGN)
SLICE 1 HEADLESS POPULATION     COMPLETE
SLICE 2 EXPLORE BROWSER         COMPLETE
WORKBENCH SLICE A               COMPLETE (see `23`)
PROTOTYPE COMPARISON SLICE      COMPLETE IN `23`
EXPLORATION-LOOP DECISION       `24`
PRODUCT REPRESENTATION          NOT LOCKED HERE
GUIDED POPULATION               NOT STARTED
POPULATION UI / TOGGLE          NOT STARTED
CAMERA PAN / RESET              NOT STARTED
FOLLOW                          NOT STARTED
SCIENTIFIC TRACER P2            NOT STARTED
```

Do not start Guided population, streamlines, shaders, GPU
code, camera pan, Follow, a dataset adapter, or R3 because
this file exists. Encoding contracts remain in `22` / `23`.
The current perceptual loop and physics-resumption decision
live in
`docs/architecture/24-perceptual-exploration-checkpoint.md`.
Tilting / stretching direction revalidation:
`docs/architecture/25-tilting-stretching-direction-revalidation.md`.

---

## 29. Slice 1 — headless visual population lifecycle     COMPLETE

Runtime owner:

```text
src/visualization/VisualAirflowPopulation.ts
  VisualAirflowPopulation
  VisualAirflowPopulationConfig
  VisualAirflowVolume
  VisualAirflowOccupant
```

Ownership: visualization runtime beside `Simulation`, not
inside `simulation/`, `rendering/`, `interaction/`, Explore,
or Guided. Depends on `core` (`VelocityField`, `Integrator`,
`Vec3`) only.

Public occupant shape:

```text
VisualAirflowOccupant { position: Vec3, age: number }
```

`age` is time since last (re)seed, in the same seconds as
laboratory `dt`. It is not a back-advected parcel history.
Internal slot `generation` exists only to change jitter on
recycle; it is not a product identity and is not on the
public occupant.

Config:

```text
count       integer >= 0     visualization budget, not density
maxAge      finite > 0       visualization lifetime (s)
volume      { min, max }     seed volume = retirement volume
jitterSeed  finite number    deterministic cell jitter
```

Seed volume is an axis-aligned box. `volume.min.y < 0` throws;
it is not silently clamped. `volume.max` must be `>= min` on
each axis.

Seeding: each slot owns one cell of a 3D lattice over the
box, with bounded deterministic jitter (width 0.8 of the cell,
hash of `jitterSeed`, slot index, generation, axis). No
`Math.random()`. Count / spacing / jitter do not mean mass or
density. v1 does not seed by `|V|`, inflow, Guided seeds, or
operand magnitude.

Canonical field: constructor takes a caller-supplied
`VelocityField`. Population samples that instance. It does
not compose DEMO physics, rebuild a field, or own the seven
operands. Slice 2 should pass the same `V_total` instance
`Simulation` uses (`velocityObservation.total` at composition).

Integration: constructor takes a caller-supplied `Integrator`.
Live scientific tracers use `EulerIntegrator`. Slice 2 should
inject the same production integrator type. Population does
not wrap `Simulation` and does not switch production
scientific integration to RK2.

Time: `step(dt, time)`. No internal clock. `time` is the
laboratory time at the start of the step, matching
`Simulation.step` sampling `clock.time` before `clock.advance`.
Fields may be time-dependent.

Step order:

```text
sample/integrate at current position and supplied time
age += dt
if age >= maxAge or y < 0 or outside volume:
  reseed slot (new jitter, age = 0)
else:
  keep proposed position
```

A retired proposed position is discarded in the same step
(no one-frame underground occupant). Recycle keeps the slot;
budget and storage length stay constant. Recycled slots have
no `tracerId`.

Initial ages are staggered: `age = (slotIndex / count) * maxAge`
when `count > 1`. Positions stay on the lattice; history is
not fabricated.

Ground: `proposed.y < 0` recycles as visualization policy.
This is not `AtmosphericTracerDomain` and not `active = false`.

No trails, no selection, no Inspector, no `Particle` reuse.

Not in Slice 1:

```text
TracerScene / TracerViewport / React / App
ExploreLab / GuidedLab
population toggle, camera pan, Follow
scientific tracer P2
physics operands / constants / envelopes
```

Slice 2 browser exposure is recorded in §30.

---

## 30. Slice 2 — Explore background rendering     COMPLETE

First live Explore exposure of the headless population.

Ownership:

```text
ExploreLab.visualAirflowPopulation
  created with the lab
  destroyed with the lab
  not inside Simulation / ExploreTracerSession /
    TracerSelection / TracerScene
```

Canonical field (one composition pass):

```text
composeDemoTracersWithObservation
  velocityObservation.total  →  Simulation
  same instance              →  VisualAirflowPopulation
  same EulerIntegrator instance
```

GuidedLab has no visual population. App passes
`lab.visualAirflowPopulation` only when `lab.kind === "explore"`.

DEMO visualization fixture
(`src/app/demoVisualAirflowFixture.ts`), not physics:

```text
count      256
maxAge     80 s
jitterSeed 1
volume     min (-6000, 0, -6000)
           max ( 8000, 9000,  7000) m
```

Renderer:

```text
VisualAirflowScene
  THREE.Points + fixed BufferGeometry
  observe-only syncFromPopulation
  not a TracerScene slot
  raycast disabled; pickVisibleTracer uses scientific slots only
```

Marker styling (`src/rendering/visualAirflowAppearance.ts`)
is perceptual encoding only (muted slate, smaller than the
150 m scientific sphere, no trail, no selected highlight).

Stepping: `advanceLaboratoryFixedStep` captures
`t0 = simulation.clock.time`, then `Simulation.step(dt)`,
then `visualAirflowPopulation.step(dt, t0)`. Pause and
timeScale go through the existing fixed-step accumulator.
No second visual timeScale.

Reset (`resetExploreLab`): scientific cohort replay as
today, plus `VisualAirflowPopulation.reset()` to the
deterministic fixture. Same lab, same `V_total`.

Clear: scientific tracers / selection / Inspector empty;
background population unchanged.

Explore ↔ Guided: fresh labs; population is not carried.

Narrow observation API: `writePositionsTo(Float32Array)`
avoids copying occupant snapshots every frame. `occupants()`
still returns copies. Internal slots stay encapsulated.

First Explore browser notes (implementation observation,
not physics SoT): empty Explore is no longer a blank
laboratory; markers read as a faint volumetric dusting,
not a mass/cloud; a released scientific glyph stays larger
and distinct; Guided still shows only curated tracers.
From the default overview pose, occupancy and height fill
are obvious; named mechanism regions (inflow, rotation,
upper outflow, downdraft, NG) are not yet clearly separable
by eye. Camera pan remains P1 / not this slice.

Fuller first-playtest finding (Pause ≈ unoriented grey
cloud; direction is temporal-only): playtest P3 in
`docs/architecture/23-perceptual-airflow-workbench.md`.
That document owns representation comparison. This section
does not choose a successor encoding.

Not in Slice 2:

```text
Guided population / hide toggle
background trails / speed or operand color
camera pan / Follow / scientific P2
RK2 / new physics
```

