# Independent Source and Reconstruction Review — 2026-08-27

**Authority:** external review / decision input. **NOT** project
source of truth.

**Status:** preserved independent findings about long-term
source progression and retrieval-scale reconstruction.
Recommendations in this file are the reviewer's, not project
decisions.

**Source material:** independent external review of the
project's long-term vision, supplied as structured evidence
(E1, E2) on 2026-08-27. This file is a provenance note, not
a verbatim transcript.

**Repository verified against:**

```text
8a646c7
```

That commit is the V1 sufficiency / scope-cut (`43`). V1
FEATURE FREEZE remains active. M5 remains the next V1 step.

**Project decision SoT for what follows from this review:**

```text
docs/architecture/44-long-term-source-and-reconstruction-boundary.md
```

This file must not be read as authorizing implementation,
designing retrieval, changing `VelocityField`, starting
data-driven environment work, reopening M5, or replacing
`CONCEPT.md`, `ARCHITECTURE.md`, physics SoT, or V1
checkpoints.

For substantial theses below, four labels stay distinct:

```text
External finding
External recommendation
Repository verification
Project decision status
```

`Project decision status` records only what `44` decided.

---

## 0. How to read this document

The reviewer's claim is not that V1 is wrong.

The claim is that the long-term conceptual progression can
be misread as one engineering roadmap, and that a
reconstructed 3D storm is a different class of problem from
consuming a prescribed, data-driven, or already-complete
field.

Named retrieval methods below are **scale evidence**, not
selected solutions.

---

## 1. E1 — reconstructed 3D storm is not the next engineering step

**External finding.** The conceptual progression

```text
prescribed laboratory
  → data-driven environment
  → observed storm
  → reconstructed 3D storm
```

can be read as a single engineering sequence. Data-driven
environment and observed-storm context may be sequential
engineering / data-integration stages. Obtaining a full
storm-scale 3D wind field `V(x,y,z)` from incomplete
observations is qualitatively different: an inverse /
retrieval problem.

Single-Doppler radar does not directly provide a complete
3D wind vector field. Long-term reconstruction belongs to
the class of problems associated with dual-Doppler
synthesis, GBVTD-like retrieval methods, variational
storm-scale retrieval / data assimilation, and related
inference.

**External recommendation.** Do not treat reconstruction as
an ordinary next milestone of the current prescribed
architecture. Do not adopt those named methods as the
chosen solution.

**Repository verification.** Live SoT does not use that
exact four-step wording. It does use a **single-arrow**
source story:

```text
CONCEPT §11     synthetic fields → numerical atmospheric models
ARCHITECTURE §1 laboratory → visualization of numerical simulation data
ARCHITECTURE §12 DatasetVelocityField interpolates model data
ARCHITECTURE §36 SyntheticVelocityField → CM1 / WRF / other dataset
21 §7           prescribed lab → perception → physically simulated datasets
30              dataset V as one later source class
38 §13          POST-V1 "dataset-backed velocity source adapter"
physics/02 §40  model grid → interpolation → V(position, time)
physics/04 §21  observational sounding import and NWP datasets
                listed as absent current-profile features
```

Those statements are true as **consumer-port** architecture
(a tracer asks `V(P,t)`). They do not distinguish:

- consuming an already-complete or already-estimated field;
- reconstructing storm-scale `V` from incomplete observations.

No retrieval, dual-Doppler, or uncertainty-of-inference
architecture exists. `VelocityField.sample` returns `Vec3`.

**Project decision status:** accepted as a long-term
boundary. See `44`.

---

## 2. E2 — deterministic V is not enough for scientific interpretation of retrieval

**External finding.** If a reconstructed field ever appears,
a deterministic velocity estimate is insufficient for
scientific interpretation. The long-term system should be
able to represent uncertainty / quality / provenance of a
retrieval result. That representation is **not** assumed to
be a scalar `confidence`.

Possible future representations include ensemble spread,
component variance/covariance, retrieval residual,
observation coverage, quality flags, provenance, and
method-specific uncertainty. The concrete shape is unknown
and depends on retrieval method and data.

**External recommendation.** Do not lock a scalar
`confidence` onto `VelocityField` now. Do not pretend
current `sample(): Vec3` already carries interpretive
uncertainty.

**Repository verification.** Live contract:

```text
VelocityField.sample(position, time) → Vec3
InspectableVelocityOperands.total: VelocityField
InspectableVelocityOperands.parts?: named VelocityField summands
TracerInspection.vTotal / contributions?: Vec3
```

CONCEPT §13 already requires visible uncertainty and
simplification for conceptual models. It does not define a
retrieval-uncertainty object. No `confidence` field exists
on `VelocityField`.

**Project decision status:** accepted as a future
first-class capability whose shape is not designed here.
`VelocityField.sample(): Vec3` remains the deterministic
velocity contract. See `44`.

---

## 3. Compact register

| Thesis | External finding | External recommendation | Repository verification | Project decision status |
| --- | --- | --- | --- | --- |
| Four-step source story is one engineering roadmap | Reconstruction is an inverse problem, not the next adapter | Separate engineering consume-track from reconstruction research | Single-arrow synthetic → CM1/WRF/dataset in CONCEPT / ARCHITECTURE / `21` / `30` | **Accepted.** Two tracks. Reconstruction is not a V1 or post-V1 engineering milestone |
| Named retrieval methods | Dual-Doppler, GBVTD-like, variational DA as class evidence | Do not select a method | None of those methods exist in the repo | **Accepted as class evidence only.** No method chosen |
| Explorer should own reconstruction | Implied by treating reconstructed storm as a later product stage | Decide ownership honestly | CONCEPT §12 already rejects being a solver; no producer architecture | **Explorer consumes. Reconstruction is a separate producer / research subsystem** |
| Deterministic `V` insufficient for retrieval interpretation | Uncertainty/quality/provenance required | Do not assume scalar confidence | `sample(): Vec3`; no confidence API | **Accepted.** Future capability; shape not locked |
| Scalar `confidence` | Too thin for the class of representations | Do not add it now | No such field | **Rejected as a lock-in.** Not added |
| Change V1 / `VelocityField` now | Not claimed as a V1 defect | Keep current laboratory honest | V1 freeze; seven operands; `sample(): Vec3` | **No V1 change** |
