# Independent Project Audit — 2026-08-18

**Authority:** external review / decision input. **NOT** project
source of truth.

**Status:** preserved independent architectural audit, with
repository verification against current `main`. Recommendations
in this file are the author's, not project decisions.

**Source material:** `audit.md` supplied as input to the
2026-08-18 whole-product direction checkpoint.

**Repository verified against:**

```text
eff2cad7954ec76f57416dda811be33e6be4599d
```

**Project decision SoT for what follows from this review:**

```text
docs/architecture/21-whole-product-direction-checkpoint.md
```

This file may be structured for repository readability. It must
not be read as silently strengthening claims, converting the
author's roadmap into a schedule, or replacing `CONCEPT.md`,
`ARCHITECTURE.md`, physics SoT, or architecture checkpoints.

For every substantial contested thesis below, four labels are
kept distinct:

```text
External finding
External recommendation
Repository verification
Project decision status
```

`Project decision status` here only records what §21 decided.
This review does not decide it.

---

## 0. How to read this document

The original audit had two movements:

1. an independent whole-system assessment and first roadmap;
2. a reconstituted roadmap after the author treated “full
   `CONCEPT.md`” plus a divergence-free / streamfunction path
   as the chosen finish line.

Both movements are preserved. Movement 2 is still the author's
follow-up recommendation, not a project lock-in.

Citation hygiene in the source:

- `docs/architecture/21` in the original text refers to the
  **physics** primitive
  `docs/physics/21-near-ground-radial-outflow.md`, which existed
  when the audit was written.
- This repository later added
  `docs/architecture/21-whole-product-direction-checkpoint.md`.
  That architecture checkpoint is **not** the document the
  auditor cited.
- Source line “环environmental profile” is preserved as an
  export artifact of “environmental profile.”

---

## 1. Provenance

The author reported reading `CONCEPT.md`, `ARCHITECTURE.md`, all
22 `docs/physics/` files, 21 `docs/architecture/` files, 16
`docs/rendering/` files, 6 `docs/ui/` files, the `src/` tree,
and a green test/typecheck run.

The original opening claim:

> Фактическое состояние: 809 тестов в 88 файлах — зелёные,
> `tsc --noEmit` чист, явных TODO/FIXME в коде нет, Three.js
> изолирован в `rendering/`, направление зависимостей не
> нарушено, `u`/`v`/`w` как world-компоненты не используются.

**Repository verification:** HEAD
`eff2cad7954ec76f57416dda811be33e6be4599d` is the Guided Slice 3
commit named by the checkpoint prompt. This review does not
re-run that suite. Layer isolation and the seven-operand live
stack are confirmed in current production composition
(`composeDemoTracerFields`,
`IntegrationFrame.StormRelativeLaboratory`).

---

## 2. Original assessment (preserved)

### 2.1 Stage of readiness — external finding

The system is a mature, disciplined implementation of exactly
one model class: a prescribed kinematic laboratory. Live
composition is seven additive operands in a storm-relative
frame:

```text
StormRelativeEnvironmentalAdvectionField (V_env − C)
+ VerticalEnvelopeUpdraftField
+ VerticalEnvelopeRotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
+ VerticalEnvelopeDowndraftField
+ NearGroundRadialOutflowField
```

Readiness by layer is uneven. The author's table:

| Layer | Readiness | Comment |
| --- | --- | --- |
| `core` (Vec3, fields, integrators) | mature | closed; nothing to change |
| `physics/environment` (profile, shear, ω_h, SRH, hodograph) | mature | 9 modules, all tested |
| `physics/storm` (7 fields + 3 legacy) | mature inside the model class | the docs themselves say “enough operands” |
| `simulation` | mature | fixed-step, domain policy, path history |
| `rendering` | minimal | spheres + lines + grid, and that is all |
| `ui` | v1 | hodograph overlays, inspector, controls |
| product shell (Explore/Guided) | temporary scaffold | `16` names it “not final shell” |
| CONCEPT perceptual layers (cloud, temperature, moisture, precipitation, sound) | 0% | not started |

Relative to `CONCEPT.md`, the author estimated about a quarter
of the path: §§3 (partial), 7 (partial), 10, 11 — airflow as
the only artificial sense. Relative to the current model class,
about 90%, with `15` §1 verdict **D: stop adding physics
temporarily**.

The author's diagnosis of why the project is “standing”:

> Именно поэтому проект сейчас стоит: он завершил этап, но
> следующий этап не выбран.

**Repository verification:** the seven-operand inventory, the
`15` D pause, Explore/Guided/Inspector/Guided v1, and the
absence of cloud/thermo/precipitation/sound layers are true of
current `main`. Percentage-complete language is the author's
metric, not a project measurement. “The project is standing
because the next stage is unchosen” is an interpretation; STOP
checkpoints are the project's existing decision discipline.

**Project decision status:** inventory accepted as useful.
Percentage-complete and “standing because no ROADMAP.md” are
not adopted. See §21.

### 2.2 Strengths to keep — external finding

Documentation discipline is the project's main asset. Each
physical mechanism has equations, units, domain limits, and a
register of forbidden claims. Example: `docs/physics/20` §15.3
forbids selling the downdraft as “return of the same air.”
Audits `02`, `07`, `10`, `13`, `15` expose weaknesses instead
of hiding them.

**Repository verification:** confirmed as a real project
practice. Anti-claim registers exist in the cited physics and
architecture SoTs.

**Project decision status:** keep. Not a change request.

### 2.3 Weaknesses, in the author's descending order

#### W1. No definition of “finish”

**External finding:** `ARCHITECTURE.md` §30 asks for
`docs/PHYSICS.md`, `docs/ROADMAP.md`, `docs/decisions/ADR-*`,
and `docs/validation/`. None exist. There are many local SoTs,
and every checkpoint ends “stop and wait for a command.”

**External recommendation:** write `docs/ROADMAP.md` first,
with retrospective ADRs, because the absence of a top-level
plan is why the project is blocked.

**Repository verification:** those files are still absent.
`ARCHITECTURE.md` §30 lists a *future* documentation layout,
not a current-false claim that they already exist. STOP
checkpoints (`15`, `16`, `17`, `18`, `19`, `20`) are intentional
and did produce Explore, Inspector, and Guided v1 after physics
was paused.

**Project decision status:** **not accepted** as the reason
progress stopped. A high-level capability map is accepted as
now-useful debt. `ROADMAP.md` is **not** created by §21.

#### W2. Continuity is structural physics debt

**External finding:** residual divergence is the same order as
the mechanisms. `10` §5 axis residual about `+0.0084 s⁻¹`;
after the seventh operand up to `+0.022 s⁻¹` (`15` §6). The
model is not mass-consistent by construction.
`docs/physics/15` §11.3 shows that with `A ≠ 0`, `∇ · V`
cannot be zeroed at all radii.

**External recommendation:** treat this as the central physical
fork; later, prefer a divergence-free / Stokes-streamfunction
redesign.

**Repository verification:** continuity remains **YELLOW** in
`10` / `13` / `15`. The seventh operand's NG-core source
`+2A ≈ +0.022 s⁻¹` is in `15` §6. Current composition is still
additive prescribed fields. No production `divergence()` API.

**Project decision status:** continuity YELLOW is **accepted**
as real physics debt. That does **not** authorize an immediate
model rewrite. Streamfunction redesign remains an open future
synthetic-model candidate, not the next approved physics
branch.

#### W3. CONCEPT promises what the model structurally forbids

**External finding:** `CONCEPT.md` §8 describes Journey Mode as
a connected journey “inflow → updraft → rotation → return to
lower levels.” `17` §14 forbids concatenating the three
experiments; `10` §10 forbids calling the sum a circulation.
The advertised product is therefore unreachable on the current
model class.

**External recommendation:** either stay a kinematic cartoon
and officially drop Journey, or move to a mass-consistent
construction so a circulation narrative becomes allowed.

**Repository verification:** `17` §14 isolation and `10`
anti-circulation claims are current SoT. `CONCEPT.md` §8
Journey is a guided presentation sequence over storm structure
and layers (camera, narration, freeze, strip cloud, reveal
fields). It is **not** written as one parcel's same-air-mass
biography. `16` §1 already split CONCEPT Journey from
concatenated pathlines.

**Project decision status:** **not accepted** as a binary
“mass-consistent model or forever cartoon,” and **not
accepted** that Journey must be same-air-mass circulation.
See §21.

#### W4. Diagnostic layer is unlinked from 3D

**External finding:** `App.tsx` passes `selectedHeight = 0`;
vorticity overlay is hardcoded `[0, 1000]` in
`demoHodographFixture.ts` while the storm column lives to
12000 m. `stormRelativeHelicity.ts` is implemented and tested
but unused in the UI.

**External recommendation:** bind hodograph height/layer to the
3D scene; surface SRH in the UI.

**Repository verification:** `DEMO_SELECTED_HEIGHT = 0` and
`createDemoVorticityLayer()` uses `[0, 1000]`.
`stormRelativeHelicityBetween` is imported from physics tests
and wiring tests, not from UI panels. Current Inspector does
not show a local SRH card.

**Project decision status:** accepted as a real perceptual /
understanding gap and as documentation/product debt. Not
scheduled. No local SRH card is authorized as a fake 3D
diagnostic.

#### W5. Production integrator chosen by inertia, not validation

**External finding:** live composition uses `new EulerIntegrator()`;
`RK2Integrator` exists and is test-only. `docs/physics/03` §8–9
explains Euler radius growth; `ARCHITECTURE.md` §14 requires
validation. `03` §13 says no project-wide default timestep,
while `DEMO_SCENARIO.simulation.timestep = 0.1` is de facto that
default. Numerical harm is small (~0.16% radius growth per
revolution at `Ω · dt = 5·10⁻⁴`); this is decision/docs debt,
not an active physics bug.

**External recommendation:** ADR to switch production to RK2 or
to lock measured Euler drift as sufficient; later fold RK2 into
a model revalidation.

**Repository verification:**
`composeDemoTracersWithObservation` still constructs
`EulerIntegrator`. `DEMO_SCENARIO.simulation.timestep` is
`0.1`. RK2 remains in tests. No production `DEFAULT_DT`
constant beyond the DEMO fixture.

**Project decision status:** accepted as an **unresolved
decision**, not as a command to switch integrators.

#### W6. Documentation debt: current-looking false sentences

**External finding:** audits listed false leftovers and did not
patch them. Most dangerous:
`docs/architecture/11` §9 `Vy_total ≥ 0 everywhere`. Also:
`02` still describes an older live stack; `03` banner “story
tracers not authorized”; physics `21` says pedagogy remains
deferred.

**External recommendation:** patch with banners, do not rewrite
history.

**Repository verification:** those leftovers still exist as
historical or current-looking text. Some product headers
(`16`–`20`) were later updated for Explore/Guided/Inspector.
`11` still contains the five-operand `Vy_total ≥ 0` sentence.
Physics `21` header still said pedagogy was deferred until the
minimal metadata correction accompanying §21.

**Project decision status:** documentation debt is **accepted
as real**. This checkpoint registers it and applies only
minimal current-status metadata. No mass rewrite.

#### W7. Perceptual layer is almost absent

**External finding:** `CONCEPT.md` §4 is about artificial
senses; only particles are implemented. No volumes, flow
glyphs, streamlines, cloud, or scale cues beyond a 10 km grid
without labels.

**External recommendation:** treat perceptual encoding of flow
and rotation as first-class later work.

**Repository verification:** live 3D is tracer spheres, optional
`THREE.Line` trails, `GridHelper`, `AxesHelper`, OrbitControls,
Inspector, Guided teaching copy, and a hodograph panel. No
streamline, ribbon, volume, cloud, or precipitation layer.

**Project decision status:** accepted as a first-class product
concern. Point release is a probe mechanism, not the intended
sole final representation of supercell airflow. Population /
airflow visualization remains an open candidate, not an
implementation architecture.

#### W8. Follow mode is absent

**External finding:** `CONCEPT.md` §7 names Follow as a central
interaction. `19` §11 defers it.

**External recommendation:** implement Follow in a
model-agnostic UX phase.

**Repository verification:** no Follow camera exists.
`ARCHITECTURE.md` §24 lists `FollowTracer` as a possible mode.
`17` and `20` keep Follow later, user-initiated, not default.

**Project decision status:** accepted as a missing CONCEPT
capability. **Not** assigned as the next slice. Future camera
work must not needlessly block Follow.

#### W9. Time as an explorable dimension is minimal

**External finding:** pause / timeScale / reset exist. No
scrubbing, no step back, fields are Eulerian-steady.

**External recommendation:** later dataset time makes this
almost free; do not build a timeline engine on steady fields
as if the storm were unsteady.

**Repository verification:** `TracerRuntimeControls` expose
Pause, `1/5/10/20×`, Reset. Fields are steady. No scrub/replay
API.

**Project decision status:** accepted as immature relative to
`CONCEPT` §6. No timeline engine in this checkpoint.

#### W10. Explore is thin

**External finding:** only point release on the ground-reference
plane plus an altitude slider. No line/grid seeding, no
delete-one, no probe without a tracer.

**External recommendation:** Explore v2 (rake/grid, delete-one,
field probe).

**Repository verification:** `18` Slices 1–4 are live: arbitrary
point release, altitude + XZ pick, late birth, Reset/Clear,
unlabeled tracers. Line/plane/volume are explicitly future.
Shared Inspector picking exists (`19`).

**Project decision status:** accepted as current Explore
maturity, not as a defect in the earned point-release slice.

#### W11. Repository hygiene

**External finding:** `tmp/` is not in `.gitignore`; a Chrome
profile directory `tmp-guided-slice3-chrome` appeared in the
working tree.

**External recommendation:** add `tmp/` to `.gitignore`.

**Repository verification:** `.gitignore` still has no `tmp/`.
`tmp-guided-slice3-chrome/` exists on disk as untracked local
debris, not as tracked source.

**Project decision status:** accepted as hygiene debt. Not
fixed in this docs-only checkpoint.

### 2.4 Contradiction table — preserved

| Contradiction (author) | Where (author) |
| --- | --- |
| CONCEPT promises Journey-circulation; catalog forbids joining experiments | `CONCEPT.md` §8 vs `17` §14, `10` §10 |
| ARCHITECTURE requires ROADMAP/PHYSICS/ADR/validation; they are missing | `ARCHITECTURE.md` §30–31 vs `docs/` |
| `Vy_total ≥ 0 everywhere` while a live downdraft exists | `11` §9 |
| RK2 is shown more accurate; production is Euler | `physics/03` §9 vs `composeDemoTracerSimulation.ts:161` |
| “Timestep not chosen” vs actual `dt = 0.1` | `physics/03` §13 vs `DEMO_SCENARIO.ts:113` |
| Four-mode selector recommended then withdrawn | `15` §11 superseded by `16` §15 |
| Continuity audit measured on 5 operands; 7 are live | `10` header |
| `02` describes an obsolete live stack as current | `02` §2 |

**Repository verification:** the file addresses exist. The
Journey-circulation row over-reads `CONCEPT` §8 (see W3). The
four-mode selector supersession is real and already locked by
`16`. Euler/`dt = 0.1`/`11` leftover/`02` snapshot/`10`
five-operand maps are real documentation or decision leftovers.

**Project decision status:** treat as a debt/contradiction
register input. Do not “fix” repository reality to match the
author's CONCEPT-circulation reading.

### 2.5 Original roadmap — external recommendation only

The author's first plan:

```text
Stage 0  docs-only foundation: ROADMAP.md, ADRs, docs-debt
         patches, tmp/ gitignore
Stage 1  binary continuity fork (stay cartoon OR
         Stokes streamfunction)
Stage 2  model-agnostic UX in parallel (hodograph↔3D, SRH UI,
         Inspector L3, Follow, Explore v2, scale cues, shell)
Stage 3  implement the chosen physics path; then
         tilting/stretching as diagnostics
Stage 4  numerical hygiene (RK2 ADR, convergence, perf budget)
Beyond   thermo/cold pool, CM1/WRF, volume, sound, unsteady
```

The author called Stage 1 binary:

- remain a kinematic cartoon forever, continuity YELLOW,
  Journey removed; or
- divergence-free construction, after which circulation claims
  become allowed and the three experiments can be merged.

**Project decision status:** this roadmap is **not** adopted.
§21 creates a capability map and decision matrix instead of
`ROADMAP.md`, and rejects the binary fork.

---

## 3. Reconstituted roadmap (preserved)

After treating full `CONCEPT.md` as the finish line and
divergence-free construction as the physics path, the author
rewrote the plan. This remains **external recommendation**.

### 3.1 “Full CONCEPT forces datasets”

**External finding:** `CONCEPT` §4 wants temperature, moisture,
precipitation, and cloud as mutually consistent layers.
`CONCEPT` §12 says the project is not a complete numerical
atmospheric solver. Synthesizing those layers consistently
with velocity would be writing a cloud model.

**External recommendation:** thermodynamic layers should come
from a numerical-model dataset (`CONCEPT` §11, §14;
`ARCHITECTURE` §12, §36). Split the finish line:

```text
synthetic half     airflow, rotation, mechanisms
dataset half       thermo, cloud, precipitation, time
```

Divergence-free work belongs to the synthetic half and
completes it. Keep the synthetic laboratory as a mechanism
isolation mode after datasets exist.

**Repository verification:** `CONCEPT` §§9, 11, 12, 14 do allow
evolution from synthetic fields to numerical datasets, and do
forbid becoming a full atmospheric solver. Interfaces
(`VelocityField.sample`, probes, rendering observes physics)
are already source-agnostic in architecture. No dataset adapter
exists in production.

**Project decision status:** the synthetic-versus-dataset
boundary is **accepted as an important evolutionary fork**.
The current synthetic laboratory is **not** declared a throwaway
step. Dataset work is an exploration candidate, not an
implementation branch. Full CONCEPT does **not** automatically
schedule CM1/WRF.

### 3.2 Technical form of a divergence-free transition

**External recommendation:** divergence is linear, so a sum of
divergence-free blocks is divergence-free. Rebuild as:

| Block | Contents | How `∇ · V = 0` |
| --- | --- | --- |
| Primary cell | updraft + lower inflow + upper outflow | one Stokes streamfunction about the storm axis |
| Downward cell | downdraft + near-ground outflow | its own streamfunction about its own axis |
| Rotation | azimuthal field | already divergence-free |
| Background | environmental profile | horizontally homogeneous, already divergence-free |

The author stated that the side effect matters more than the
main effect: downdraft and near-ground outflow become two
branches of **one cell**, which is currently forbidden
(`docs/physics/20` §15.3; physics `21` §19.4) and which would
structurally unlock Journey from `CONCEPT` §8.

The author also stated the cost: `DEMO_SCENARIO` peak `W0`,
inflow strain, and outflow strain cease to be independent
numbers (`06` froze them); acceptance tests of isolated fields
change meaning. This would be a breaking model-class change.

**Repository verification:** current SoT forbids treating D1 as
the source of NG1, forbids combining those exhibits, and
forbids claiming NG closes `∇ · V_down`. Rotation and the
horizontally homogeneous environment are divergence-free in
the current identities (`15` §4). Additive chimney/inflow/
outflow/downdraft/NG terms are not. No streamfunction type
exists.

**Project decision status:**

```text
OPEN FUTURE SYNTHETIC-MODEL CANDIDATE
not NEXT APPROVED PHYSICS BRANCH
```

D1 → NG1 causal continuation is **not** accepted, even as a
future automatic consequence of continuity redesign. `∇ · V = 0`
does **not** by itself prove a realistic parcel trajectory or
supercell circulation.

### 3.3 Reconstituted stages — external recommendation only

```text
Stage 0  ROADMAP.md with full CONCEPT as goal; ADRs; docs
         patches; tmp/ gitignore
Stage 1  physics SoT for divergence-free construction
Stage 2  implement streamfunctions; revalidate; drop
         anti-claims; switch production to RK2 while
         revalidating
Stage 3  finish synthetic half: tilting/stretching as
         diagnostics, 3D curl, merge three experiments into
         one circulation, Follow, hodograph↔3D, SRH UI,
         glyphs/streamlines/ribbons
Stage 4  dataset boundary: DatasetVelocityField, coordinate
         transform, interpolation, chunking; keep synthetic
         lab as a mode
Stage 5  scalar/volume layers from the dataset; GPU
Stage 6  Journey Mode and sound last
```

Critical “do not” list from the author:

- do not polish product on current frozen DEMO numbers before
  Stage 2;
- do not add an eighth additive operand;
- do not name near-ground outflow a cold pool;
- do not synthesize thermodynamics.

**Project decision status:** not adopted as a schedule.
Individual items may reappear in §21 as open candidates with
separate status.

---

## 4. Contested theses — compact register

| Thesis | External finding | External recommendation | Repository verification | Project decision status |
| --- | --- | --- | --- | --- |
| Missing `ROADMAP.md` is why the project is stuck | Local SoTs without a top-level finish line | Write `ROADMAP.md` immediately | STOP checkpoints are intentional; Explore/Inspector/Guided v1 shipped after `15` D | **Not accepted.** Capability map is now useful debt; no `ROADMAP.md` in this task |
| Need a high-level capability map | Same as above, weaker form | Map capabilities, not only next slices | True: after Guided v1, the next *family* is unchosen | **Accepted** as useful; not a rigid multi-year roadmap |
| Documentation debt / current-looking stale docs | Named leftovers in `11`, `02`, `03`, physics `21`, `10` | Banner patches, not history rewrite | Leftovers exist; some product headers were later updated | **Accepted.** Register + minimal metadata only |
| Continuity YELLOW / not mass-consistent | Residual O(mechanism strain) | Central fork; later streamfunction | Confirmed YELLOW in `10`/`15`; additive sum still live | **Accepted as YELLOW.** Not an automatic rewrite |
| Divergence-free / Stokes redesign | Additive class cannot zero `∇ · V` at all r | Next physics SoT, then implementation | No such model exists; identities match the finding | **Open future synthetic-model candidate.** Not next approved physics branch |
| Binary: mass-consistent or forever cartoon | Current class cannot host circulation claims | Choose one | False dichotomy relative to `CONCEPT` §9–§14 | **Not accepted** |
| `∇ · V = 0` unlocks realistic Journey | Continuity is the structural block to CONCEPT §8 | Merge exhibits after streamfunction | Continuity ≠ realistic parcel; Journey ≠ one air mass | **Not accepted** |
| D1 → NG1 as one circulation cell | Offset independent operands | Second streamfunction cell would make them one branch | Current occupancy/isolation forbid the causal claim | **Not accepted**, including as an automatic future claim |
| Journey = same-air-mass circulation | Reads CONCEPT §8 as one parcel life | Unlock that narrative via mass-consistent flow | CONCEPT §8 is a user/camera/layer journey through structure | **Not accepted** |
| Synthetic lab vs datasets | CONCEPT wants thermo layers and forbids being a solver | Dataset-backed thermo/cloud; keep synthetic mode | Interfaces are generic; no dataset code | **Accepted as an evolutionary boundary.** Synthetic lab remains a valuable mode |
| Perceptual layer is first-class | Only sparse particles encode airflow | Glyphs/streamlines/volumes later | Confirmed sparse 3D encoding | **Accepted** as a first-class product concern |
| Tilting/stretching next physics | `15` named it leading future modeling SoT | After or beside continuity, as diagnostics | `15`/`16` still name it leading **when physics resumes**; still docs-only; not an eighth operand | **Remains the leading modeling branch from existing SoT when physics resumes.** Not selected as next implementation |
| Switch production to RK2 | Euler in live composition; RK2 better in tests | ADR / fold into revalidation | Euler live; RK2 test-only; DEMO `dt = 0.1` | **Unresolved decision.** Not commanded |
| Surface SRH in the UI | Computed, not shown | Show it | Confirmed unused in UI | **Open understanding candidate.** No fake local SRH card |
| Follow is overdue | CONCEPT §7; deferred in `19` | Implement in UX phase | Absent | **Future interaction candidate.** Not next |
| Dataset implementation now | Full CONCEPT needs thermo from data | Stage 4 adapter | No adapter | **Exploration candidate only** |

---

## 5. What this file does not decide

This review does not:

- select the next implementation branch;
- authorize a streamfunction or solver;
- merge Guided experiments;
- switch Euler to RK2;
- add Follow, pan, population particles, or a timeline;
- create `ROADMAP.md`;
- change production code.

Those questions belong to
`docs/architecture/21-whole-product-direction-checkpoint.md`,
and several of them remain explicitly unchosen there.
