# Long-Term Source and Reconstruction Boundary

**Status:** LONG-TERM SOURCE / RECONSTRUCTION BOUNDARY SoT /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** separate the Explorer engineering / consume track
from the storm-reconstruction research track; lock ownership,
scientific-risk language, `VelocityField` non-change, and the
next data-driven-environment artifact. Not a retrieval design.
Not a `DatasetVelocityField` design. Not a provider-neutral
environment contract. Not `ROADMAP.md`. Not a V1 or M5
document.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). Exactly seven
`V_total` operands. Prescribed Ω semantics unchanged.
`VelocityField.sample(position, time) → Vec3` unchanged.
**Implementation:** none. Docs-only. Production `src/**`
MUST remain unchanged. V1 FEATURE FREEZE remains ACTIVE.
M5 remains the next V1 step (`43`).

Predecessor whole-product and model-class source language:

```text
docs/architecture/21-whole-product-direction-checkpoint.md
docs/architecture/30-model-class-decision.md
docs/CONCEPT.md
docs/ARCHITECTURE.md
```

External review (decision input, **not** SoT):

```text
docs/reviews/2026-08-27-independent-source-and-reconstruction-review.md
```

Related still-binding SoTs (not replaced):

```text
docs/architecture/38-v1-scope-checkpoint.md
docs/architecture/43-post-42-1-v1-sufficiency-and-scope-cut.md
docs/architecture/19-shared-tracer-inspector.md
docs/physics/02-velocity-field-basics.md
docs/physics/04-environmental-wind-profile.md
docs/physics/12-composite-velocity-field.md
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
EXTERNAL FINDING
NEW PROJECT DECISION
OPEN QUESTION
ANTI-CLAIM
```

This document did **not** change production code.
It does **not** create `ROADMAP.md`.
It does **not** start dataset, sounding-import, or retrieval
work.
It does **not** reopen V1 FEATURE FREEZE or the M5 path.

---

## 1. Why this boundary exists

Live CONCEPT / architecture language already says a tracer
asks only `V(position, time)` and that a later source may
replace synthetic fields. That consumer-port is still
correct.

The risk is a **single-arrow reading**:

```text
prescribed laboratory
  → data-driven environment
  → observed storm
  → reconstructed 3D storm
```

as if the last step were ordinary sequential engineering
on the current prescribed architecture.

It is not.

Data-driven environmental profiles and observed-storm
context can be engineering / data-integration stages.

Obtaining a full storm-scale 3D wind field `V(x,y,z)` from
incomplete observations is an **inverse / retrieval**
problem. Single-Doppler radar does not directly provide
that field.

This file exists so that reconstructed 3D storm cannot be
read as the next Explorer milestone, a neighboring
timeline item, or a promised “final boss.”

---

## 2. Current wording diagnosis

**Kind:** CURRENT FACT, verified against live docs and
`src/**` at `8a646c7`.

The repository does **not** contain the four-step phrase
above. It contains an equivalent **two-stage / single-arrow**
story that can be read the same way.

| Location | What it currently says | How it can mislead |
| --- | --- | --- |
| `CONCEPT` §11 | Evolve from synthetic fields toward numerical atmospheric model fields. Tracer does not care whether `V` is synthetic or from a numerical supercell simulation. | Collapses consume-adapter work with “having the real storm.” Names only two sources. |
| `CONCEPT` §9 | Integrity categories: physically simulated / conceptual / visual encoding. | No observed-vs-inferred category. A retrieved grid can be mislabeled “physically simulated.” |
| `CONCEPT` §12 | Not a forecast system, not a complete numerical solver. | Does not say: not a retrieval / reconstruction engine. |
| `CONCEPT` §14 | Mature version may combine numerical datasets and 3D vector fields. | Lists reconstructed-looking capabilities as ordinary long-term vision items. |
| `ARCHITECTURE` §1 | Laboratory → interactive visualization of numerical simulation data. Two stages: synthetic vs model datasets. | Two stages only. Reconstruction is invisible, therefore absorbable into “stage 2.” |
| `ARCHITECTURE` §2 | Data sources: synthetic fields / future model datasets. | Same collapse. |
| `ARCHITECTURE` §12 | `DatasetVelocityField` interpolates numerical model data; particle still asks “velocity here, now?” | True as a **consumer** sketch. Reads as if interpolation *is* the later storm. |
| `ARCHITECTURE` §36 | `SyntheticVelocityField` → `CM1 / WRF / other dataset` without rewriting the renderer. | The success criterion is right (swap source). The arrow looks like the product roadmap. |
| `21` §7 / §9.E | Prescribed lab → perception → optional physically simulated datasets. Capability E = dataset-backed storm state. | Honest as a source-class fork vs in-house CFD. Still one “dataset” bucket. |
| `30` class D | Dual-source: synthetic lab + later dataset `V`. Dataset `V` is externally prognostic. | Correct that Explorer would diagnose, not evolve, that atmosphere. Does not split complete model output from observational retrieval. |
| `38` §13 | POST-V1 parking lot: dataset-backed velocity source adapter; dual-source product mode. | Queued as ordinary post-V1 engineering. Fine for a consume adapter. Dangerous if read as reconstruction. |
| `physics/02` §40 | Model grid → interpolation → `V(position, time)`. | Sampling an already-gridded field, not inferring one. |
| `physics/04` §21 | Observational sounding import and NWP datasets absent from the first profile. | Correct current-scope exclusion. Can be read as “later, import the storm.” |

### 2.1 What is already honest

```text
VelocityField is a consumer port, not a producer method
InspectableVelocityOperands.parts is optional
  (`19`, live TracerInspection.ts)
seven prescribed operands are a laboratory ontology,
  not a universal storm ontology (`12`, `19`, `30`)
CONCEPT §9 forbids implying more accuracy than the data
CONCEPT §13 requires visible uncertainty / simplification
CONCEPT §12 already rejects becoming a numerical solver
30 already: CONCEPT long-term vision is not an
  implementation order; dataset V is not in-house T2
38 / 43 already: CONCEPT long-term vision is not a V1 backlog
```

The defect is **missing research-boundary language**, not a
V1 physics error.

### 2.2 What live code confirms

```text
src/core/fields/VelocityField.ts
  sample(position: Vec3, time: number): Vec3

src/interaction/TracerInspection.ts
  InspectableVelocityOperands { total, parts? }
  TracerInspection.vTotal: Vec3
  contributions?: { key, velocity: Vec3 }[]

No confidence / ensemble / residual / provenance type
No DatasetVelocityField
No sounding-import provider
No retrieval / dual-Doppler / DA code
```

`parts?` already allows a source that cannot name the
current seven laboratory summands. That is the correct
V1 hook for a later non-prescribed field. It is **not** a
retrieval API.

---

## 3. Two tracks

**NEW PROJECT DECISION.**

Long-term source work is two tracks. They must not be
drawn as one ladder.

### 3.1 Engineering / Explorer track (consumer)

Explorer-owned integration, in conceptual order — **not**
a dated schedule:

```text
1. prescribed kinematic laboratory
     current V1; class A (`30`)

2. data-driven environmental profile(s)
     replace or feed EnvironmentalWindProfile from
     observations / analyses / reanalyses / NWP profiles
     while storm kinematics may remain prescribed

3. observed-storm context / observational data integration
     storm identity, time, location, available observations,
     and related context around an Explorer session
     without claiming a complete 3D wind field

4. consume an externally supplied estimated or reconstructed
   field, if such a field becomes available
     same VelocityField consumer port
     source identity and honesty labels required
```

A separate engineering consumer, **not** a later step of
(1)–(4) and **not** reconstruction:

```text
numerical atmospheric-model output
  (CM1 / WRF / other already-complete 3D V)
  = consume a forward-model product
```

CM1 / WRF-class datasets belong on the Explorer consume
track because the producer is already a numerical model.
They are not observational retrieval.

### 3.2 Storm reconstruction research track (producer)

Conceptual research boundary, **not** a selected algorithm:

```text
observations
  → retrieval / inference methodology
  → physical / statistical constraints
  → validation
  → uncertainty characterization
  → estimated 3D storm state / velocity field
```

This sequence is the **class of work**. It is not a future
Explorer slice list.

Named methods (dual-Doppler synthesis, GBVTD-like
retrieval, variational storm-scale retrieval / data
assimilation, and relatives) are **evidence of scale and
class**. None is selected.

### 3.3 The boundary

```text
ENGINEERING TRACK answers:
  Can Explorer investigate a V it is given,
  honestly labeled, through existing ports?

RESEARCH TRACK answers:
  Can a trustworthy storm-scale 3D V be inferred
  from incomplete observations at all?

Those are different questions.
The second is not a rendering, Inspector, or
adapter milestone.
```

---

## 4. Ownership

Options compared:

| Option | Meaning | Honesty | Cost to Explorer identity | V1 reuse |
| --- | --- | --- | --- | --- |
| **A. Explorer owns reconstruction** | Retrieval / DA lives in this product as a core subsystem | LOW. CONCEPT §12 already rejects being a solver. Reconstruction is larger than in-house CFD already rejected by `30` class C. | Product becomes an atmospheric inference engine that also visualizes | Ports reuse; method/validation budget dominates |
| **B. Reconstruction is a separate producer / research subsystem; Explorer consumes results if they exist** | Explorer remains a scientific investigation surface. A later producer may supply estimated fields plus provenance | HIGH. Matches live `VelocityField` port, optional `parts`, CONCEPT §9 / §11 consumer split, `30` class D “diagnose, not evolve” | Explorer stays useful if reconstruction never succeeds | HIGH for observation stack |
| **C. Hybrid in-repo retrieval module “just for import”** | Retrieval code lives here but is called an adapter | LOW. Ownership follows the hardest scientific problem in the tree | Quietly reopens class C under a dataset name | False reuse: Inspector cannot explain a method it does not own |

**NEW PROJECT DECISION: B.**

```text
Supercell Explorer does not own the reconstruction problem.

Reconstruction is a separate producer / research subsystem.

Explorer’s architectural ceiling on this subject is the
ability to consume an externally supplied estimated or
reconstructed field, when and if one exists, without
pretending it is a prescribed seven-operand laboratory
or a complete observation of V(x,y,z).

Explorer remains a valuable prescribed kinematic
laboratory, and a potential consumer of data-driven
profiles, observed-storm context, and numerical-model
output, even if no trustworthy full-field reconstruction
is ever available for some or all observations.
```

`30` class D (synthetic lab + later dataset `V`) remains
valid for **already-complete or already-estimated** fields.
It does not authorize building the estimator.

`30` U1 (“when, if ever, to open a dataset-source adapter
SoT”) is a consume-adapter question. It is not a retrieval
authorization.

---

## 5. Scientific-risk classification

**NEW PROJECT DECISION.**

Reconstructed 3D storm is **not** a neighboring milestone
with an implied timeline.

```text
scientific risk:     SUBSTANTIALLY HIGHER than prescribed
                     laboratory work, data-driven profiles,
                     observed-storm context, or consuming
                     complete numerical-model output
timeline:            UNKNOWN
method dependence:   the feasible product, if any, depends
                     on observations and retrieval method
data dependence:     some storms / scans will not support
                     a trustworthy full-field V
validation burden:   first-class; not “interpolation tests
                     of DatasetVelocityField”
possibility of none: a sufficiently trustworthy full-field
                     reconstruction may never exist for
                     some observations
Explorer without it: REQUIRED. The product must remain
                     useful if this research track does
                     not yield a usable field
promise:             NONE that the reconstructed storm
                     will be solved
```

Risk language for the engineering track stays ordinary
integration risk (coordinates, units, interpolation, QC,
labeling). That is not this classification.

---

## 6. Uncertainty / provenance

### 6.1 Must VelocityField.sample() change now?

**No.**

Live architecture already separates:

```text
narrow velocity sample     VelocityField.sample → Vec3
named laboratory parts     optional InspectableVelocityOperands.parts
source identity            CONCEPT §9 categories (amended)
diagnostics                T1 / Candidate A observe V; they are
                           not VelocityField implementors
visualization              observe-only rendering
```

A reconstructed or analyzed field, if consumed later, still
needs a deterministic advection velocity at a point. That is
what tracers and integrators ask (`physics/01`, `physics/02`,
`ARCHITECTURE` §9). Widening `sample()` now would force
every current synthetic occupant to invent unused
uncertainty payload and would lock a shape before any
retrieval method exists.

**STILL-BINDING CONTRACT:**

```text
VelocityField.sample(position, time) → Vec3
```

This file does not change that contract.

### 6.2 Must a scalar `confidence` be added now?

**No. It is the wrong lock-in.**

A single `confidence: number` would:

- pretend one comparable quality axis exists across methods;
- hide coverage vs residual vs ensemble spread vs flags;
- invite UI to color “trust” without method meaning;
- be un-auditable against a retrieval that has not been chosen.

CONCEPT §13 already requires visible uncertainty and
simplification. That requirement is **not** a number on
`Vec3`.

### 6.3 Where uncertainty / provenance may live later

**OPEN QUESTION** as to shape. Conceptual homes, none
selected:

| Home | Fits | Risk if locked now |
| --- | --- | --- |
| Inside `VelocityField.sample` return | Couples advection to quality at every call | Forces every field, including prescribed V1, to return a richer object |
| Sibling observation / metadata interface | Matches `InspectableVelocityOperands` beside `total` | Easy to invent a generic DTO that no retrieval uses |
| Field-level provenance | Source, method identity, valid time/location, observed vs inferred | Necessary but not sufficient for spatially varying quality |
| Retrieval-result object (producer side) | Owns method, residual, ensemble, flags, coverage | Correct producer boundary; Explorer would consume a projection of it |
| Ensemble of `VelocityField`s | Spread is first-class; `sample()` stays `Vec3` | Assumes ensemble retrieval; not universal |
| Separate quality / coverage / residual fields | Sampled like other atmospheric fields | Method-specific; good only when those fields exist |

**NEW PROJECT DECISION:** future uncertainty / provenance
is a **first-class capability** at a boundary chosen after
a real retrieval / data source exists. Its shape is **not**
designed here.

Preferred working hypothesis, confirmed against live
architecture and therefore accepted as a **non-design
constraint**:

```text
VelocityField.sample(): Vec3 remains the narrow
deterministic velocity contract.

Uncertainty / quality / provenance must not be smuggled
into that Vec3, and must not be reduced in advance to
confidence: number.
```

### 6.4 Assumptions this project does not have the right to lock in

Until a real retrieval method and data source are chosen,
do **not** lock:

```text
scalar confidence or any other single quality metric
Gaussian component variance as the uncertainty type
a covariance tensor layout
ensemble size or spread definition
dual-Doppler vs GBVTD-like vs variational vs other method
radar-only vs multi-sensor retrieval
that a full-domain V always exists
that missing observations are filled by the laboratory
  seven-operand ontology
that reconstructed V decomposes into current V_i
QC flag enumerations
observation-operator details
assimilation window / cost function
that DatasetVelocityField is the uncertainty owner
```

---

## 7. Explain every motion → explain every inference

Current V1 strength, independently confirmed:

```text
explain every motion
```

In the prescribed laboratory this means: `V_total` is the
unweighted sum of seven named `VelocityField` operands,
and Inspector L2 can show those contributions
(`ARCHITECTURE` §36, `19`, live `InspectableVelocityOperands`).

**NEW PROJECT DECISION.** For inferred / reconstructed /
analyzed data, the honest long-term extension is:

```text
explain every motion
  → also, where the state is inferred,
explain every inference
```

This is a **scientific-honesty principle**, not a slogan, not
UI copy, and not a V1 requirement.

“Explain every inference” means: future data- or
retrieval-derived state should, as far as the source
allows, preserve:

```text
provenance
observed vs inferred distinction
method identity
uncertainty / quality information that the method actually has
limits of interpretation
```

It does **not** mean:

```text
decompose reconstructed V into the current seven
prescribed operands
```

That would be a physically false transfer of the V1
laboratory ontology onto a different object. Live
`parts?` being optional is the existing architectural
recognition of that fact.

Prescribed-laboratory motion remains explained by
prescribed operands. Inferred motion is explained by
inference provenance, not by pretending the estimator
emitted `V_updraft`, `V_rotation`, and friends.

---

## 8. Data-driven environment — next artifact

**NEW PROJECT DECISION.**

Post-V1 environment work does **not** start by choosing
RAOB, RAP, HRRR, or any other provider.

The next SoT for that work is a **provider-neutral
environmental-profile contract**.

```text
that contract:     NOT STARTED
this file:         does not include it
providers:         candidates, not core physics, until a
                   later evidence review selects otherwise
implementation:    not authorized
```

The future contract SoT must answer at least:

```text
required vertical variables
height vs pressure coordinate
interpolation in the vertical
missing levels
QC
time / location validity
storm-motion source
observed vs modeled / reanalysis provenance
which quantities are stored vs derived
units and meteorological conventions
uncertainty where the source actually provides it
```

`physics/04` remains the SoT for the current prescribed
profile. Observational sounding import and NWP datasets
stay out of that current-profile scope.

`38` §13 ENVIRONMENT / SCENARIOS (curated hodograph
scenarios, editable hodograph, scenario editor) remains
POST-V1 product parking. It is not this contract, and it
is not reconstruction.

---

## 9. V1 impact

**NEW PROJECT DECISION: NONE.**

No finding in the external review, and no decision in this
file, requires a change to current V1.

Unchanged:

```text
seven operands
prescribed Ω
T1 / Candidate A
fixed V1 hodograph
Guided experiments
Inspector
Point diagnostics
V_total
VelocityField API
current renderer
M5 plan (`43`: current state → M5 → freeze-legal fixes
  → M4 → V1 CLOSED)
FEATURE FREEZE
```

If a later claim appears that V1 must grow a confidence
channel, a retrieval operand, or a real-storm mode in
order to stay honest — that claim is **false**. V1 honesty
is the prescribed-laboratory label it already has.

---

## 10. Long-term map

Read **down** only inside a track. Do **not** read across
the research boundary as “next.”

```text
ENGINEERING / EXPLORER TRACK          (consumer)
────────────────────────────────────────────────
prescribed kinematic laboratory
        current V1
        │
        │  engineering / data integration
        ▼
data-driven environmental profile(s)
        │
        │  observational context; not full 3D V
        ▼
observed-storm context /
observational data integration
        │
        │  only if an external producer supplies a field
        ▼
consume externally supplied estimated
or reconstructed fields

also on this track, not a later “real storm” step:
consume already-complete numerical-model output
(CM1 / WRF / equivalent forward-model V)


════════════════════════════════════════════════
RESEARCH BOUNDARY
not an Explorer milestone
unknown timeline
substantially higher scientific risk
may yield no trustworthy full-field V
════════════════════════════════════════════════

STORM RECONSTRUCTION RESEARCH TRACK   (producer)
────────────────────────────────────────────────
observations
        → retrieval / inference methodology
        → physical / statistical constraints
        → validation
        → uncertainty characterization
        → estimated 3D storm state / velocity field

Explorer does not own this track.
Explorer remains useful if this track never
delivers a field it can consume.
```

---

## 11. Existing SoT amendments

This file is the decision SoT. Companion documents receive
only the surgical wording needed so the single-arrow
reading cannot survive.

```text
CONCEPT §9     add observed-or-inferred integrity category
CONCEPT §11    replace synthetic→numerical-model as the
               only progression; keep consumer-port
CONCEPT §12    Explorer is not a retrieval / reconstruction
               engine
CONCEPT §13    long-term “explain every inference”;
               uncertainty is not a V1 API change
CONCEPT §14    reconstructed 3D storm is not an ordinary
               vision bullet
ARCHITECTURE §1  Explorer is a consumer of atmospheric
               state; reconstruction is not stage 2
ARCHITECTURE §2  data sources are not only synthetic vs
               model datasets
ARCHITECTURE §12 DatasetVelocityField sketch is a consumer
               adapter, not a retrieval method; sample()
               stays Vec3
ARCHITECTURE §36 keep source-swap success; remove
               single-arrow roadmap reading; record
               explain-every-inference
physics/02 §40 interpolation of an already-gridded field
               is not observational retrieval
physics/04 §21 next environment SoT is the provider-neutral
               contract; providers not chosen
21 header      successor pointer to this file for the
               dataset-arrow reading of §7 / §9.E
30 header      this file refines source-class D / U1;
               class A unchanged
38 §13 DATA    consume-adapter parking; not reconstruction
43 §19         this file does not affect the V1 / M5 path
```

Historical checkpoint bodies are not rewritten as if they
had always contained this boundary.

---

## 12. Anti-claims

```text
this file does not include production implementation
this file does not create ROADMAP.md
this file does not reopen V1 FEATURE FREEZE
this file does not reopen or reschedule M5
this file does not change VelocityField
this file does not add confidence: number
this file does not design DatasetVelocityField
this file does not design retrieval
this file does not choose RAOB / RAP / HRRR / other providers
this file does not include the provider-neutral environment
  contract
reconstructed 3D storm is not the next engineering milestone
CM1 / WRF consume-adapter is not observational retrieval
data-driven environment is not a 3D storm reconstruction
seven V1 operands are not a retrieval ontology
optional Inspector parts are not an uncertainty API
30 class D is consume, not estimate
CONCEPT long-term vision is not a reconstruction promise
Explorer remains useful without reconstruction
named retrieval methods in the review are not selected
```

---

## 13. Documentation authority

```text
this file:     long-term source / reconstruction boundary
2026-08-27 review: evidence only; not SoT
CONCEPT:       product identity; amended for this boundary
ARCHITECTURE:  consumer-port architecture; amended for
               this boundary
21:            whole-product capability map; dataset-arrow
               reading superseded by this file
30:            model class A held; class D refined as
               consume, not reconstruct
38 / 43:       V1 freeze, M5, V1 CLOSED path — unchanged
19:            Inspector / optional parts — unchanged
physics/02:    VelocityField meaning; dataset interpolation
               is consume, not retrieval
physics/04:    current prescribed profile; import remains
               out of current scope
```

---

## 14. Compact lock-in

```text
ENGINEERING TRACK:      prescribed lab → data-driven
                        environment → observed-storm
                        context → consume external
                        estimated fields if available
                        (+ consume complete model output)

RESEARCH TRACK:         observations → retrieval →
                        constraints → validation →
                        uncertainty → estimated 3D V

OWNERSHIP:              Explorer consumes
                        reconstruction is a separate
                        producer / research subsystem

SCIENTIFIC RISK:        reconstructed 3D storm is
                        substantially higher risk,
                        unknown timeline, method/data
                        dependent, possibly unavailable

VELOCITYFIELD:          sample() → Vec3 UNCHANGED
CONFIDENCE SCALAR:      NOT ADDED; not the future shape
UNCERTAINTY:            future first-class capability;
                        shape not designed here

EXPLAIN EVERY INFERENCE: long-term honesty for inferred
                        state; not seven-operand reuse

NEXT ENV ARTIFACT:      provider-neutral environmental-
                        profile contract; NOT STARTED

V1 / M5 / FREEZE:       UNCHANGED
IMPLEMENTATION:         NONE
```

---

## 15. Implementation

This document does not include implementation.
Production `src/**` remains unchanged.
No retrieval, dataset adapter, sounding import, or
`VelocityField` API work is in scope.
