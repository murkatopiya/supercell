# PROJECT_BACKLOG

**Role:** memory / index of deferred, open, and unresolved work.
**Not:** a roadmap, a schedule, a priority ranking, or implementation
authorization.

```text
BACKLOG ≠ AUTHORIZATION.
```

Presence of an item here:

- does **not** authorize implementation;
- does **not** change physics or architecture SoT;
- does **not** reopen CLOSED / FROZEN / V1 work;
- does **not** promote an idea to an accepted decision;
- does **not** mean the item will ever be implemented.

If this file conflicts with a domain SoT, **the domain SoT wins**.

This file **points at** authoritative documents. It does not copy
them as a second source of truth.

V1 remains CLOSED
([`docs/reviews/2026-08-27-v1-closed.md`](reviews/2026-08-27-v1-closed.md)).
This index does not reopen it and does not invent `38` §11.3 PASS.

---

## How to read this index

Items are grouped by **obligation class**, not by imagined
priority. The four classes are not equally binding:

| Class | Meaning |
| --- | --- |
| **1. Known obligation / unresolved gate** | A recorded gate or unmet evidence claim. Still not an implementation order. |
| **2. Deferred planned capability** | Named in a later SoT as later / not-this-slice work. A construction sketch is not a production lock. |
| **3. Research question** | An open scientific or product question. Answering it is not the same as shipping a feature. |
| **4. Interesting possibility** | Recorded so it is not forgotten. Not a plan. |

Status values used here are a small index vocabulary, not a new
workflow system:

```text
OPEN
DEFERRED
RESEARCH NEEDED
NOT STARTED
BLOCKED
```

Where the owning SoT has a more precise status (LATER, NOT YET
AVAILABLE, NOT CLAIMED, CONSTRUCTION SoT / NOT IMPLEMENTED), that
wording is preserved in the item.

**Return when** is a recorded condition from the owning SoT, not a
date.

IDs are **stable**. `BL-010` remains `BL-010` after closure. Gaps in
numbering are allowed. Do not renumber to close holes.

Closed items keep ID + final status + authoritative evidence. They
move to [Closed / superseded BL index](#closed--superseded-bl-index)
rather than being deleted. Do not delete a historically useful item
only to keep the active list short.

Working discipline for this file lives in
[`docs/ARCHITECTURE.md`](ARCHITECTURE.md) §30 (Backlog maintenance
protocol). This index is not that protocol’s second copy.

---

## Standing constraints (guardrails, not a second SoT)

Short reminders plus pointers. The owning SoT is the definition.

| Guardrail | Authoritative refs |
| --- | --- |
| V1 is CLOSED / FEATURE FREEZE. This index does not reopen it and does not invent `38` §11.3 PASS. | `reviews/2026-08-27-v1-closed.md`; `38`; `47` |
| Goshen sandbox storm motion stays prescribed DEMO `C = (10, 0)` until a named SoT decides otherwise. | `50` §6; `48` §8.3 |
| Published Markowski `C` is research / sibling evidence, not a silent runtime replacement. | `53` §5; research §3 |
| Fig. 2b 88 / 167 / 29 are external benchmarks, not a tuning oracle. | `48` §12; `53` §7; `54` §10 |
| DEMO `[0, 1000]` overlay semantics must not be applied silently to a dense observed profile. | `50` §5; `48` §7 |
| Source golden is not mutated to produce an analysis profile; analysis, if any, is a sibling column. | `53` §2–§3; `54` §2 / §8; `59` |
| Analysis contract is `58`. High-resolution ESC production transform is specified in `59`; Analysis-column implementation is authorized there. The `54` 100 m bin-mean remains a baseline construction, not the production operator. Do not silently replace Explore Source. | `58`; `59`; `55`; `54` |
| Native EOL `.cls` bytes are not an `npm test` input while G4 is OPEN. | `49` §8.6; `50` §1 |
| `VelocityField.sample(position, time) → Vec3` stays; do not smuggle confidence into that `Vec3`. | `44` §6 |
| Reconstruction of storm-scale 3D `V` is a separate producer problem, not the next Explorer milestone. | `44` |

---

## Superseded status notes (do not revive)

These historical NOT STARTED / OPEN lines are **closed by successors**.
They are listed so they are not re-queued from old compact lock-ins.

| Old claim | Successor fact |
| --- | --- |
| `48` §17 / `49` compact: I2 NOT STARTED | `50`: I2 DONE; Explore later also binds Prospect and Dumas on the same identity |
| `22` / `21`: camera pan / Follow / Reset View NOT STARTED | `34` Follow, `37` Reset View implemented; unlabeled OrbitControls pan already exists. Remaining item is only a **designed product pan control** in `38` §13 |
| `22` / `26` / `28` / physics `22`–`23`: diagnostic UI NOT STARTED | Explore Point diagnostics implemented (`32`). Guided mount remains POST-V1 (`38` §13) |
| `48` U1 / R1 archive identity | CLOSED in `49` |
| `48` U3 I2 storm-motion value | CLOSED for I2 in `50`: DEMO prescribed `C` |
| `49` G1–G3 | CLOSED |
| `38` U1 M2 product default | CLOSED in `39` |
| `38` U3 README / known limits | CLOSED in `47` (root README + `KNOWN_LIMITATIONS.md`) |
| `25` prescribed-Ω options 2–4 OPEN | `30` locked Ω1/Ω2; T1 / Candidate A CLOSED. Do not reopen |
| `51` dense markers | IMPLEMENTATION COMPLETE. I2 2029-marker assert withdrawn |

---

## 1. Known obligation / unresolved gate

### BL-001 — G4 native ESC redistribution / EULA

Category: SOURCE-HYGIENE
Status: OPEN / BLOCKED
Origin: `49` G4; `48` U5
Why retained: the only remaining obtain/inspect gate after G1–G3.
Native campaign bytes exist locally and are gitignored. Dataset
metadata “legal/access constraints none” is not a substitute for the
click-through EULA accepted at order time. I1/I2 do not wait on this
gate; `npm test` does not require those bytes.
Return when: the accepted EOL EULA text is recorded and a
redistribution decision is made (in-repo freeze vs documented hash).
Authoritative refs:
[`docs/architecture/49-r1-first-historical-reference-storm.md`](architecture/49-r1-first-historical-reference-storm.md)
§7 G4 / §8.6 / §10 U5;
[`docs/architecture/48-provider-neutral-environmental-profile-contract.md`](architecture/48-provider-neutral-environmental-profile-contract.md)
U5;
[`docs/architecture/50-i2-goshen-sandbox-integration.md`](architecture/50-i2-goshen-sandbox-integration.md)
§1 / §11.

### BL-002 — Independent target-user validation (M5-INDEPENDENT)

Category: VALIDATION
Status: OPEN
Origin: `38` §11.3; `45`; `46`; `47` §10.4; V1 CLOSED record
Why retained: V1 closed as a **finite validation prototype with limited
human validation**. Recorded evidence is M5-AUTHOR semantic /
scientific comprehension only. Independent 2/3 testing is not
available. Discoverability is not independently validated.
`38` §11.3 PASS is **not claimed**.
Return when: independent target users are actually available **and**
a later decision treats that evidence as a product claim. This item
does **not** reopen V1 FEATURE FREEZE, does not schedule a V1 MUST
slice, and does not invent PASS wording.
Authoritative refs:
[`docs/reviews/2026-08-27-v1-closed.md`](reviews/2026-08-27-v1-closed.md);
[`docs/KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md) §C;
[`docs/architecture/46-m5-author-semantic-evidence-classification.md`](architecture/46-m5-author-semantic-evidence-classification.md);
[`docs/architecture/38-v1-scope-checkpoint.md`](architecture/38-v1-scope-checkpoint.md)
§11.3.

### BL-003 — Pressure-only height conversion (future source)

Category: DATA
Status: OPEN
Origin: `48` U2; narrowed in `49` §10
Why retained: the Goshen fixture is not pressure-only. Adapter policy
for a pressure-only native product remains unnamed. It waits for
**another** source; it is not an I1/I2 defect.
Return when: a later adapter actually receives pressure-only native
heights and must name the conversion in provenance (`48` §4.4).
Authoritative refs: `48` U2; `49` §10.

---

## 2. Deferred planned capability

### BL-010 — Storm-scale analysis wind profile (implementation)

Category: PHYSICS
Status: NOT STARTED / IMPLEMENTATION AUTHORIZED
Origin: `53` (source vs analysis distinction **ACCEPTED**);
`54` (first concrete candidate construction);
`55` (qualifies `54`: candidate, not implementation
authorization);
`58` (source-class-aware Analysis **contract**);
`59` (ESC-class production transform **specified**;
Analysis-column implementation **authorized**);
research `2026-08-28-high-resolution-esc-analysis-transform-decision.md`
(ESC-class transform **research-selected**; not itself
authorization)
Why retained: source 1-s ESC segments are unsuitable for
local `ω_h` / `T_tilt` as environmental diagnostics (`53`).
An analysis column remains a deferred capability until
implemented. `54` records AGL bin-mean, Δz = 100 m as the
first Goshen-derived **candidate**. `58` rejects a universal
numerical operator and requires a declared sampling-class
transform. Research BL-046 **names** a high-resolution ESC
candidate (`esc-hr-time-hamming-sinc-lowpass` v0.1-research,
time-domain Hamming-sinc FIR, λ_c = 40 s). Architecture `59`
**accepts** that scientific selection as production
`esc-hr-time-hamming-sinc-lowpass / v1`, freezes TIME / gap /
boundary / provenance semantics, and **authorizes** the
Analysis-column implementation. This backlog line does **not**
implement. Diagnostic rewiring, hodograph overlay, and Explore
Source replacement remain outside this item (`59` §27).
Return when: the authorized Analysis-column slice is
implemented. Do not implement the `54` candidate as
production. Do not treat `58` or BL-046 as the operator
specification. Do not retune to Fig. 2b 88 / 167. Do not
mutate the source golden winds/heights. Do not silently
replace Explore `V_env`.
Authoritative refs:
[`docs/architecture/53-goshen-2155-source-versus-analysis-profile.md`](architecture/53-goshen-2155-source-versus-analysis-profile.md);
[`docs/architecture/54-storm-scale-analysis-wind-profile.md`](architecture/54-storm-scale-analysis-wind-profile.md)
(candidate construction);
[`docs/architecture/55-analysis-profile-generalization-gate.md`](architecture/55-analysis-profile-generalization-gate.md)
(epistemic status of `54`);
[`docs/architecture/58-source-class-aware-analysis-profile-contract.md`](architecture/58-source-class-aware-analysis-profile-contract.md)
(contract);
[`docs/architecture/59-high-resolution-esc-time-domain-analysis-integration.md`](architecture/59-high-resolution-esc-time-domain-analysis-integration.md)
(production transform; column authorization);
[`docs/research/2026-08-28-high-resolution-esc-analysis-transform-decision.md`](research/2026-08-28-high-resolution-esc-analysis-transform-decision.md)
(research-selected ESC candidate);
this index BL-037 (CLOSED), BL-046.

### BL-011 — Dense-column storm-scale overlays consume analysis

Category: UX
Status: NOT STARTED / BLOCKED
Origin: `50` §5 (DEMO overlays omitted on Goshen); `54` §8 (intended
consumer split **if** a validated analysis column exists)
Why retained: I2 correctly omitted DEMO `[0, 1000]` vorticity /
streamwise recipes on Goshen. Restoring overlays by silently reusing
DEMO layer semantics is forbidden. `54` sketches that local `ω_h`,
streamwise/crosswise, and `T_tilt` would consume an **analysis**
column while Explore `V_env` / scientific polyline stay on the
**source**. That sketch does not authorize overlay implementation.
Architecture `59` authorizes the Analysis **column** (BL-010), not
this overlay. Overlay consumption must follow `59` FULL_SUPPORT
policy for derivative-sensitive diagnostics.
Return when: a validated analysis column exists (BL-010 implemented)
**and** a UI slice is authorized to point overlays at it, with
labeled provenance.
Authoritative refs: `50` §5 / §11; `54` §8–§9; `55`; `58`; `48` §7;
BL-010; BL-046.

### BL-012 — Optional labeled analysis hodograph overlay

Category: UX
Status: DEFERRED
Origin: `54` §9
Why retained: scientific polyline stays the source. Analysis may later
be an optional labeled hodograph overlay. That UI is explicitly not
`54`.
Return when: a validated analysis column exists (BL-010 implemented)
**and** a display SoT for a second labeled curve is written. Visual
smoothness alone is not a warrant (`53` §4). Not authorization to
ship the `54` candidate.
Authoritative refs: `54` §9; `51` (source polyline / sparse markers
COMPLETE; not this overlay).

### BL-013 — Storm-motion provenance (prescribed / derived / observed)

Category: ARCHITECTURE
Status: DEFERRED
Origin: `44` §8.2; `48` §8; `physics/07`
Why retained: live `StormMotion` is value-only, honest for DEMO `C`.
A data-driven contract must distinguish value, source-or-method,
validity, and provenance class. Derived ≠ observed ≠ prescribed.
DTO / factory / UI are **not designed**. Bunkers is **not selected**.
Return when: a sandbox-authoring or multi-C SoT actually needs more
than one epistemic class of `C` at once.
Authoritative refs: `44` §8.2; `48` §8; `physics/07` §5;
`38` U5 (related, not the same: see BL-032).

### BL-014 — Observed Goshen C as sibling (not sandbox default)

Category: DATA
Status: DEFERRED (LATER in `50`)
Origin: `50` §11 “Observed Goshen C | LATER”; `48` §8.3; `53` §5
Why retained: published Fig. 2b `C = (10.5, −1.3)` m/s is recorded
sibling evidence. I2 closed `48` U3 as DEMO prescribed `(10, 0)`.
A later sandbox-authoring SoT may choose a **different prescribed**
C for a named case; that would still be class `prescribed`. Using
observed C silently as sandbox C would falsify SRH and
storm-relative wind.
Return when: a named sandbox-authoring SoT decides C class for that
case. Not authorized by I2, `53`, or this index.
Authoritative refs: `50` §6 / §11; `48` §8.3; `53` §5;
[`docs/research/2026-08-27-goshen-2155-hodograph-reproduction.md`](research/2026-08-27-goshen-2155-hodograph-reproduction.md)
§3.

### BL-015 — Provider #2

Category: DATA
Status: DEFERRED (LATER)
Origin: `48` Q19 / I3+; `50` §11; `44` §8.1
Why retained: first source class is observed RAOB; first fixture is
Goshen. Interface, registry, second format, comparison, and generic
multi-agency QC unification wait for provider #2. Not a platform
redesign now.
Return when: a later SoT chooses a second provider class after the
first sandbox contract is actually in use.
Authoritative refs: `48` Q19 / §17 I3+; `50` §11; `04` §21.

### BL-016 — Inter-source disagreement / sensitivity

Category: RESEARCH
Status: DEFERRED
Origin: `44` §6.5; `48` §4.2 / anti-claims
Why retained: if more than one provider is later in scope, disagreement
may be a first-class literacy / sensitivity signal. It is not a
complete uncertainty budget and not `confidence: number`. Out of
scope until provider #2.
Return when: BL-015 is in scope. UI/API remain undesigned.
Authoritative refs: `44` §6.5; `48` §4.2; `CONCEPT` §13.

### BL-017 — Thermodynamic sibling profile

Category: PHYSICS
Status: DEFERRED
Origin: `48` §14 / Q20
Why retained: keep `EnvironmentalWindProfile` wind-only. Do not rename
it a sounding. Future T / Td / p / q / CAPE is a **sibling**
capability, not designed, not part of the first sandbox, and not a
reason to consume pressure as an Explorer coordinate.
Return when: a named thermodynamics SoT exists. Mixing thermo into the
current wind contract is an anti-claim, not a later convenience.
Authoritative refs: `48` §4.3 / §14 / Q20; `38` §4.4 (thermo out of
V1 class); `KNOWN_LIMITATIONS.md` §A.

### BL-018 — DatasetVelocityField consume adapter

Category: ARCHITECTURE
Status: DEFERRED
Origin: `ARCHITECTURE` §12; `38` §13 DATA / DATASETS; `44`
Why retained: Explorer may later interpolate an **already-complete
or already-estimated** field. That is a consumer adapter, not
retrieval, dual-Doppler, or variational DA. The sketch does not
design the adapter and does not authorize implementation.
Return when: an external complete or independently produced field
actually exists to consume, and a consume-adapter SoT is written.
Authoritative refs: `ARCHITECTURE` §12 / §36; `44` engineering
track; `38` §13.

### BL-019 — Observed-storm context (engineering track)

Category: LONG-TERM
Status: DEFERRED
Origin: `44` §10 engineering track
Why retained: observational context (not full 3D `V`) is the step
after data-driven environment on the Explorer consume track. It is
not reconstruction and not the next milestone implied by a single
arrow.
Return when: the environment contract is actually hosting real
profiles and a later SoT defines what “observed-storm context” means
without claiming a retrieved 3D wind.
Authoritative refs: `44` §1 / §10; `CONCEPT` (amended consume
language).

### BL-020 — Consume external estimated 3D fields + explain every inference

Category: LONG-TERM
Status: DEFERRED
Origin: `44` §7 / §10; `ARCHITECTURE` §36
Why retained: if an independently produced estimated / reconstructed
field exists, Explorer may consume it. Honesty there is explain
every inference (provenance, observed vs inferred, method identity,
available uncertainty, limits) — **not** reuse of the seven V1
operands. Uncertainty shape is not designed (see BL-034).
Return when: such a field actually exists to consume. The producer /
retrieval track remains a separate research problem (BL-044).
Authoritative refs: `44` §7 / §10; `ARCHITECTURE` §36.

### BL-021 — Moore curated operational-RAOB case

Category: DATA
Status: PARTIAL (Explore source identity DONE; not a reconstructed
Moore storm; C remains prescribed DEMO)
Origin: `49` runner-up / compact lock-in; `50` §11
Why retained: OUN 20 May 2013 afternoon special is the recorded
runner-up operational-RAOB case. Source ingest is `57` /
`src/data/igra/`. Explore identity `moore-2013-observed`
consumes that observed environmental wind profile on the
existing I2 mechanism. Storm-local operands and storm
motion `C` remain prescribed DEMO. This is not a
reconstruction of the Moore supercell and is not Analysis.
The same column remains BL-045 validation candidate #2.
Return when: a later curated-case SoT that would change
storm-motion policy, Guided pinning, or Analysis — not
because Explore identity is missing.
Authoritative refs: `49` §11; `50` §11; BL-045; `57`; research
`2026-08-28-additional-sounding-case-selection.md`;
`2026-08-28-moore-oun-igra-source-qualification.md`

### BL-022 — I3+ curated scenarios / editable hodograph / Guided re-pinning

Category: ARCHITECTURE
Status: DEFERRED
Origin: `48` §17 I3+; `38` §5.5 / §13 ENVIRONMENT
Why retained: V1 used one fixed `DEMO_SCENARIO`. Curated
environmental scenarios are POST-V1 and require their own SoT that
first settles storm-motion policy per scenario, Guided pinning
(`17` / `08` / `12` / `14` are DEMO-validated), may/may-not-infer
copy (`38` §5.4), and re-validation of T1 / Candidate A geometry.
Editable hodograph is not implied by the curated-scenario SoT.
Return when: that named SoT exists. Not a silent second identity in
Explore beyond the already-shipped Goshen opt-in (`50`).
Authoritative refs: `38` §5.5 / §13; `48` §17 I3+; `50` §11
(editable profile LATER).

### BL-023 — Path-history unbounded-run safety cap

Category: ARCHITECTURE
Status: DEFERRED
Origin: `rendering/14` §4; `52` §11
Why retained: full history until Reset is canonical. Ring buffer as
pedagogy is rejected. An unbounded-run safety cap (hours at `1×`) is
explicitly deferred. `52` did not add it (index must stay stable while
appending).
Return when: live occupancy / duration makes DEMO-scale “cheap”
false, and a SoT can add a cap without clipping teaching pathlines.
Authoritative refs:
[`docs/rendering/14-tracer-path-history.md`](rendering/14-tracer-path-history.md)
§4;
[`docs/architecture/52-historical-path-probe-architecture.md`](architecture/52-historical-path-probe-architecture.md)
§11.

### BL-024 — Historical path probe: remaining LATER interactions

Category: UX
Status: DEFERRED (LATER in `52`)
Origin: `52` §11 after first slice IMPLEMENTED
Why retained: first slice (record `simulationTime`, path click,
recompute Inspector / Point diagnostics, CURRENT vs HISTORICAL
label, presentation marker) is implemented. Remaining items **named
LATER** in that SoT, and not rejected:

- side-by-side two historical points
- timeline scrubber
- breadcrumb annotations
- exporting trajectory data

Rejected in `52` (do not queue): simulation rewind, free 3D probe,
diagnostic snapshot cache.
Return when: a later interaction SoT, after the first slice is actually
used. These are not implementation requirements of `52`.
Authoritative refs: `52` §11 / §13.

---

## 3. Research question

### BL-030 — Fig. 2b unpublished operator details

Category: RESEARCH
Status: RESEARCH NEEDED
Origin: research `2026-08-27-goshen-2155-hodograph-reproduction.md` §7
Why retained: the published caption names a 5-step Leise filter but
does not specify input grid, endpoint treatment, whether t=0 was
dropped, 2010-era Aspen `WindSmoothWL`, height vs pressure
interpolation before Leise, or NSHARP vs Explorer Form B. Native-index
Leise with frozen ends does not recover 88. Cloning that unspecified
operator was **rejected** as a production recipe (`54` §6). The
unknowns remain about the **paper figure**, not a method to finish
and ship.
Return when: independent documentary evidence of Markowski’s actual
preprocess exists, or the comparison is explicitly abandoned as
under-specified. Not a reason to reopen I1 keep-t=0, and not a
reason to treat `54` as production-ready.
Authoritative refs: research §6–§7 / §13; `53` §4 / §7; `54` §6.

### BL-031 — Analysis vs Fig. 2b labeled discrepancy (after implementation)

Category: VALIDATION
Status: RESEARCH NEEDED (blocked on BL-010)
Origin: `54` §10
Why retained: after an analysis profile exists, compute analysis
0–1 / 0–3 SRH and 0–6 `|ΔV|` at published `C` and record them next to
88 / 167 / 29 as a **labeled discrepancy**, not a pass/fail of Δz.
Research already showed source 0–6 km `|ΔV|` agrees (~30 vs 29) and
source 0–1 km SRH does not (133 vs 88) because of the launch
transient.
Return when: an analysis column actually exists to compare. This is
a **labeled check against one published figure**, not the
generalization gate (that is BL-037). Disagreement does not
authorize retuning.
Authoritative refs: `54` §10; `53` §1; research §8–§11; BL-037.

### BL-032 — Curated-scenario storm-motion rule vs per-scenario constant

Category: RESEARCH
Status: OPEN
Origin: `38` U5
Why retained: `38` explicitly lists this as an unresolved question,
not a backlog commitment. `48` §8.3 does not reopen it. I2 used DEMO
prescribed C and did not settle the post-V1 curated-scenario rule.
Return when: BL-022’s required SoT is actually written.
Authoritative refs: `38` §14 U5; `48` §8.3; `38` §5.5.

### BL-033 — Whether SRH is displayed in the UI

Category: UX
Status: OPEN
Origin: `38` U6; `48` U4; `49` §10
Why retained: physics `stormRelativeHelicityBetween` exists and is
tested. There is no live SRH panel. `38` U6 is an unresolved question,
not a commitment. V1 CONDITIONAL SRH readout was tied to playtest
task T2, which did not admit it. Headless physics may remain enough.
Return when: a later product SoT decides to display SRH. Do not
treat overlay sketches in `ui/01` / `physics/10` “future overlays” as
authorization.
Authoritative refs: `38` §3.2 / §14 U6; `48` U4 / §2.9; `49` §10;
`50` (Goshen surface shows imported hodograph and prescribed C, not
SRH).

### BL-034 — Uncertainty / provenance shape for inferred fields

Category: ARCHITECTURE
Status: OPEN (shape)
Origin: `44` §6.3
Why retained: future uncertainty / provenance is a first-class
capability **after** a real retrieval or data source exists. Conceptual
homes are listed; none selected. Scalar `confidence` is rejected as
the lock-in. `VelocityField.sample() → Vec3` stays.
Return when: a real retrieval / data source is chosen. Do not design
the DTO in advance.
Authoritative refs: `44` §6.

### BL-035 — Continuity YELLOW and later named model-class SoT

Category: PHYSICS
Status: DEFERRED
Origin: `10` YELLOW; `21` Candidate D; `30`; `38` §4.4 / §13
Why retained: composite divergence residual is YELLOW, a recorded
limitation, not a production bug. A continuity / mass-consistency
solver is **out of V1 class**. `21` still records divergence-free /
streamfunction redesign as an **open future synthetic-model
candidate**, not an accepted next step. Any later hybrid / dynamics
class requires a named SoT (`30`).
Return when: a named later model-class SoT. Treating YELLOW as an
automatic streamfunction branch is the anti-claim in `21` / `25`.
Authoritative refs: `10`; `21` §9.D; `30`; `38` §4.4; `27` §13.

### BL-036 — Community sounding-analysis tooling research

Category: RESEARCH
Status: RESEARCH NEEDED
Origin: CHAT/KNOWLEDGE GAP, sanctioned 2026-08-28
Why retained: established / community tooling and documented practice
for sounding wind-profile preprocessing and severe-weather diagnostics
were not surveyed before recording the `54` candidate. Candidates for
investigation may include SHARPpy, MetPy, NSHARP, and other
authoritative or open implementations if found.
Goal: understand whether they use preprocessing / smoothing /
resampling; at which stage; for which diagnostics; how they document
vertical scale, interpolation, and derivatives; and what can be
reused or cited as external evidence. Not: copy a tool by reputation.
Not: find a path to Markowski 88. Not: choose a production method in
this item.
Return when: a research record exists. That record is evidence for
sampling-class Analysis policy (`58` / BL-046), not a method lock.
Authoritative refs: this index; research
`2026-08-27-goshen-2155-hodograph-reproduction.md` §7 (NSHARP vs
Form B as a **paper** unknown, not this survey); `48` §12; `54` §6
(Leise clone already rejected).

---

## 4. Interesting possibility

### BL-025 — Dense hodograph zoom / pan / reset

Category: UX
Status: DEFERRED
Origin: CHAT/KNOWLEDGE GAP, sanctioned 2026-08-28; not a `51` LATER
Why retained: dense observed polylines (Goshen-scale knot counts) may
need viewport navigation that the current autoscale panel does not
provide. `51` completed sparse markers / labels only. Overlay toggles
must not move the viewport (`ui/05`); this item is a separate
capability and must not be wired to those toggles. Not an
implementation spec. Does not change current hodograph semantics.
Return when: a later hodograph-interaction SoT. Not implied by `51`
out-of-scope notes.
Authoritative refs: `51` (display-index COMPLETE; navigation absent);
`ui/01`; `ui/05` (toggle must not zoom/pan).

### BL-026 — Interactive hodograph height probe

Category: UX
Status: DEFERRED
Origin: CHAT/KNOWLEDGE GAP, sanctioned 2026-08-28
Why retained: click / hover / select on a dense hodograph → nearest
**actual** profile knot → explicit selected height and wind. Future
motivation: give height semantics for `ω_h` / streamwise-crosswise
overlays instead of silently restoring DEMO-only `[0, 1000]`. `51`
nearest-knot is a **display-index** rule for markers/labels, not this
probe. Hover/tooltip was slice-out-of-scope in `51`, not a LATER
spec. This item is an idea / deferred UX capability, not an
implementation spec.
Return when: a later hodograph-interaction SoT. Overlay data still
must not use DEMO `[0, 1000]` on a dense observed column (`50` §5).
Authoritative refs: `51` §4 / §6; `50` §5; `ui/01` (`selectedHeight`
exists as a panel input, not this probe).

### BL-040 — Goshen / Markowski reproduction as a packaged case study

Category: RESEARCH
Status: DEFERRED
Origin: research evidence record `2026-08-27-goshen-2155-hodograph-reproduction.md`;
architecture split in `53`
Why retained: a headless source-vs-published-figure comparison already
exists. `53` preserves the distinction between raw source reproduction
and published smoothed analysis. **No SoT requires** a user-facing
case-study product, tutorial, or Guided exhibit.
Return when: a later documentation / teaching SoT wants that packaging.
Not an implementation requirement.
Authoritative refs: research file; `53`; `49` §8.6 (literacy-only
Fig. 2b shape check, not SRH oracle).

### BL-041 — Bunkers-type (or other) derived storm motion

Category: PHYSICS
Status: DEFERRED
Origin: `44` §8.2 (example of derived class); `48` §8.2
Why retained: derived C is a named **epistemic class**, used as an
example. Bunkers is **not selected**, **not authorized**, and **not**
the post-V1 default (`48` §8.3). Listed so “add Bunkers” is not
reinvented as if it were undecided in the other direction.
Return when: a later estimator SoT. I2 explicitly rejected Bunkers.
Authoritative refs: `44` §8.2; `48` §8.2–§8.3; `50` §11
(Bunkers C REJECTED FOR I2); `physics/07`.

### BL-042 — 10 May 2010 later campaign case

Category: DATA
Status: DEFERRED
Origin: `49` compact lock-in
Why retained: recorded as a later campaign case, not the first
fixture.
The 2026-08-28 sounding-selection research **rejected** this day as
a BL-045 validation input (Parker excluded it; no named inflow
launch). It remains a later **product** campaign pointer only.
Return when: after Moore / Goshen lessons, if a campaign-RAOB SoT
wants a second VORTEX2-class column.
Authoritative refs: `49` §11; research
`2026-08-28-additional-sounding-case-selection.md` §11.

### BL-043 — POST-V1 product parking remainder (`38` §13)

Category: LONG-TERM
Status: DEFERRED
Origin: `38` §4.3 / §13
Why retained: V1 parked a large unranked set so V1 work would stop
reconsidering it. Those items remain parked. They are **not**
reopened by V1 CLOSED and are **not** individually promoted here.

Compact pointer (unranked, as in `38`):

```text
INTERACTION     remove last / roster / G1–G3 naming / region class;
                align camera; designed product pan; free 3D probe;
                click-empty deselect; line/plane/volume seeding;
                keyboard/AT parity for canvas; time scrub

VISUALIZATION   perception beyond M2; comet revisit; halo polish;
                multi-operand display; palette / Pause-viz UX;
                diagnostic overlays / slices / heatmaps / LIC;
                streamlines, volumes, cloud; Guided airflow population

TEACHING        Guided Point diagnostics / Follow / Reset View;
                Inspector L3; Ω=0 exhibit; more Guided experiments;
                Journey / first-person; sonification;
                hodograph height bound to tracer altitude

PHYSICS         stretching diagnostic as honest bookkeeping;
                further T1 siblings as optional literacy;
                named later class SoT (hybrid, dynamics) per `30`

PLATFORM        persistence / deep-link; catalog CMS shape;
                performance budget beyond audit
```

Items already given their own BL numbers above (environment /
datasets / storm motion / thermo) should be read **there**, not
re-queued from this list.
`38` §4.4 REJECTED items are **not** in this parking lot.

Return when: a later product SoT picks a specific parked item.
Authoritative refs: `38` §4.3 / §13 / §4.4.

### BL-044 — Reconstruction producer / retrieval track (not Explorer work)

Category: LONG-TERM
Status: DEFERRED
Origin: `44`
Why retained: so the research boundary is not lost. Obtaining
storm-scale 3D `V(x,y,z)` from incomplete observations is a separate
producer / research subsystem: observations → retrieval → constraints
→ validation → uncertainty → estimated 3D `V`. Timeline unknown;
a trustworthy field may never exist. Explorer must remain useful
without it.
Return when: that research program exists **outside** Explorer
consumer work. This line is a boundary reminder, not a milestone.
Authoritative refs: `44` entire; `ARCHITECTURE` §1 / §36.

### BL-045 — Additional soundings as independent validation candidates

Category: DATA
Status: DEFERRED (candidates named; #1/#3 ESC goldens DONE;
#2 IGRA architecture 57 ACCEPTED; Moore adapter + golden
DONE; Explore identity `moore-2013-observed` DONE; bytes not
imported)
Origin: CHAT/KNOWLEDGE GAP, sanctioned 2026-08-28; `49` later-case
mentions; concatenated ESC sibling blocks (`49` §7.1); selection
research 2026-08-28
Why retained: generalization (BL-037) needs independent columns, not
only Goshen 2155. Named **validation candidates** (research
`2026-08-28-additional-sounding-case-selection.md`):

```text
#1  Prospect Valley 2010-05-26 NSSL1 22:23:46
    EOL 114.114     slots A+C
    identity + source column CONFIRMED
    ESC named wrapper + normalized golden DONE
    native bytes not committed
#2  OUN afternoon special 2013-05-20
    IGRA USM00072357 17 UTC / release 1651
    (Wyoming 18 UTC label)   slot B
    identity + source column CONFIRMED (IGRA native)
    ingest architecture 57 GATE ACCEPTED
    named wrapper + normalized golden DONE
    Explore identity `moore-2013-observed` DONE
    native bytes not committed
#3  Dumas/Stinnett 2010-05-18 NSSL2 21:52:18
    EOL 114.114     slot A (tornadic near-inflow)
    identity LOCKED; source column audited
    ESC named wrapper + normalized golden DONE
    native bytes not committed
    not a forward-flank sounding
#4  12 May 2010 Weatherford  backup only
```

Native ESC and IGRA bytes stay in gitignored `data/`. They are not
production fixtures and are not committed.
Source qualification:
[`docs/research/2026-08-28-vortex2-source-qualification.md`](research/2026-08-28-vortex2-source-qualification.md)
(#1/#3);
[`docs/research/2026-08-28-moore-oun-igra-source-qualification.md`](research/2026-08-28-moore-oun-igra-source-qualification.md)
(#2).

Naming a case as a validation candidate is not a
production-dataset decision, not I1/I2 work, not adapter
authorization, and not BL-037 closure. Do not import, commit, or
require the bytes now.

BL-021 (Moore) remains a later **product** case pointer. Dual role
with candidate #2 is allowed; the roles stay distinct.
BL-042 (10 May 2010) remains a later **product** campaign pointer
and is **not** a validation input (Parker exclusion; no named
inflow launch). Other blocks in `NSSL_MGAUS_20090605.cls` remain
source facts, not fixtures.

A later operational-RAOB adapter for #2 is designed as
architecture in `57` (sibling of `56`; named worldY sort).
Moore named wrapper and normalized golden are DONE in
`src/data/igra/`. Native bytes stay gitignored. Explore
identity `moore-2013-observed` consumes that source record
on the I2 mechanism. That product wiring does not close
BL-037 and is not BL-015 product provider #2.

ESC family ingest for #1/#3 is designed in `56`
(spec + generic mechanics + named wrappers).
Prospect (#1) and Dumas (#3) source ingest and
normalized goldens are DONE. Those same source records
are selectable Explore observed environments on the
I2 identity mechanism (`goshen-2009-observed`,
`prospect-valley-2010-observed`, `dumas-2010-observed`).
That product wiring does not close this item.
Moore/IGRA ingest architecture is `57` (GATE ACCEPTED).
Moore named wrapper, golden, and Explore identity
`moore-2013-observed` are DONE. `56` / `57` do not close
BL-037 and do not authorize Analysis.

Return when: BL-046 / later Analysis validation re-uses these
named columns. Obtaining files is not implementation of
Analysis.
Authoritative refs: `56`; `57`; research
`2026-08-28-additional-sounding-case-selection.md`;
`2026-08-28-vortex2-source-qualification.md`;
`2026-08-28-moore-oun-igra-source-qualification.md`; `49` §7.1 / §11;
`50` §11; BL-021; BL-042; BL-037; BL-046.

### BL-046 — High-resolution ESC Analysis transform selection / validation

Category: RESEARCH
Status: RESEARCH DECISION COMPLETE
Origin: `58` after BL-037 source-class research
Why retained: Architecture `58` defines the Analysis contract and
rejects a universal numerical operator. Research
`2026-08-28-high-resolution-esc-analysis-transform-decision.md`
**selects** a high-resolution-mobile-esc candidate:

```text
esc-hr-time-hamming-sinc-lowpass v0.1-research
domain: TIME
operator: Hamming-sinc FIR, λ_c = 40 s, 81 taps
output: filtered winds on original Source heights
Moore: NON-APPLICABLE
```

That research decision does **not** itself implement Analysis.
Architecture `59` is the authorization / integration gate: it
accepts the scientific selection as production
`esc-hr-time-hamming-sinc-lowpass / v1` and authorizes the
Analysis-column slice (BL-010). This research item stays a
completed decision record.
Return when: not applicable as research; implementation is BL-010.
Do not implement from this backlog line or from the research report.
Authoritative refs: `58`; `59`; `55`; `54`; research
`2026-08-28-high-resolution-esc-analysis-transform-decision.md`;
`2026-08-28-leise-filter-and-analysis-operator-comparison.md`;
BL-037 (CLOSED: universal-operator question answered);
BL-010 (implementation authorized / not started).

---

## Index by the requested known themes

| Theme | Backlog | Notes |
| --- | --- | --- |
| A. G4 license | BL-001 | OPEN / BLOCKED |
| B. Dense hodograph zoom / pan / reset | BL-025 | sanctioned gap; not a `51` spec |
| B. Explicit height probe / nearest actual knot | BL-026 | sanctioned gap; not `51` display-index |
| B. ω_h / streamwise overlays on dense observed | BL-011 | blocked on validated analysis column; not DEMO `[0,1000]` |
| B. Silent DEMO `[0,1000]` | standing constraint | already decided against |
| C. Analysis profile | BL-010 | NOT STARTED / IMPLEMENTATION AUTHORIZED by `59`; not implemented |
| C. Source vs analysis distinction | `53` | ACCEPTED |
| C. Analysis contract | `58` | ACCEPTED; ESC production transform specified in `59` |
| C. `54` 100 m bin-mean | `54` + `55` + `58` | first candidate / ESC baseline; not universal default |
| C. ESC transform research selection | BL-046 | RESEARCH DECISION COMPLETE; time-domain FIR 40 s named |
| C. ESC time-domain integration | `59` | ARCHITECTURE ACCEPTED; production transform specified; column implementation authorized |
| C. Fig. 2b labeled discrepancy | BL-031 | after an Analysis column exists |
| C. Markowski 88/167 not oracle | standing constraint | |
| D. Community sounding-analysis tooling | BL-036 | RESEARCH NEEDED; not a method choice |
| D. Generalization / universal operator | BL-037 | CLOSED; universal operator NOT SUPPORTED; contract is `58` |
| D. Extra soundings as validation candidates | BL-045 | named; #1/#3 ESC goldens DONE; #2 Moore IGRA adapter + golden + Explore identity DONE; bytes not imported |
| E. Reproduction as case study | BL-040 | interesting possibility; no product requirement |
| F. Storm-motion provenance | BL-013, BL-014, BL-032, BL-041 | prescribed vs derived vs observed kept distinct |
| G. Provider #2 / disagreement | BL-015, BL-016 | |
| H. Thermodynamics sibling | BL-017 | |
| I. Reconstruction long-term track | BL-018–BL-020, BL-034, BL-044 | consume vs producer split preserved |
| J. V1 validation debt | BL-002 | does not reopen V1 |
| K. Historical path probe remainder | BL-023, BL-024 | first slice complete; only named LATER / deferred cap |

Later **product** cases Moore / 10 May 2010 remain BL-021 / BL-042.
Moore is also BL-045 candidate #2 (validation input). Those roles
are not merged. 10 May 2010 is not a BL-045 validation input.

---

## Closed / superseded BL index

### BL-037 — Analysis-transform generalization / validation

Category: RESEARCH
Status: CLOSED
Origin: `55`; sanctioned 2026-08-28
Closed because: the generalization question `55` asked is
answered. A single identical numerical operator applied to every
`EnvironmentalWindProfile` is **NOT SUPPORTED**. Architecture `58`
is the contract. Remaining ESC-class operator **selection** was
owned by BL-046 and is now a research decision (time-domain
Hamming-sinc FIR, λ_c = 40 s). Production specification and
Analysis-column authorization live in `59`. This item does **not**
implement Analysis.
Evidence: `58`; research
`2026-08-28-esc-flight-phase-and-high-frequency-wind-audit.md`;
`2026-08-28-esc-wind-processing-pipeline-audit.md`;
`2026-08-28-leise-filter-and-analysis-operator-comparison.md`;
`2026-08-28-high-resolution-esc-analysis-transform-decision.md`;
BL-046; BL-045 validation columns.

The [superseded status notes](#superseded-status-notes-do-not-revive)
above are historical SoT claims, not retired backlog items.

When a BL item is implemented, answered, rejected, or superseded:
keep the ID, record final status and evidence, and move the compact
entry here. Do not reuse the ID.

---

## Documentation authority

```text
this file:     deferred-work index only; BACKLOG ≠ AUTHORIZATION
ARCHITECTURE §30:
               backlog maintenance protocol (BEFORE / DURING / AFTER)
38 / 47 / reviews/2026-08-27-v1-closed.md:
               V1 CLOSED; §11.3 PASS not claimed
44:            consume vs reconstruction boundary
48 / 49 / 50:  environment contract; R1; I2 DONE; G4 OPEN;
               Explore identities DEMO + Goshen + Prospect
               + Dumas + Moore; Guided remains DEMO
51:            dense hodograph display COMPLETE
52:            historical path probe first slice IMPLEMENTED
53:            source vs analysis distinction ACCEPTED
54:            first candidate construction (AGL bin-mean,
               Δz = 100 m); NOT IMPLEMENTED; not a
               universal default (`58`)
55:            qualifies 54 — candidate, not production
               policy; implementation NOT AUTHORIZED
58:            source-class-aware Analysis contract
               ACCEPTED; ESC production transform
               specified in 59
59:            ESC time-domain Analysis integration;
               PRODUCTION TRANSFORM SPECIFIED;
               Analysis-column IMPLEMENTATION AUTHORIZED;
               not itself the implementation
research 2026-08-28-high-resolution-esc-analysis-transform-decision.md:
               ESC-class transform RESEARCH-SELECTED
               (time-domain Hamming-sinc FIR, λ_c = 40 s);
               not itself implementation authorization
research 2026-08-28-additional-sounding-case-selection.md:
               BL-045 validation inputs named; not imported
research 2026-08-28-vortex2-source-qualification.md:
               #1/#3 ESC identity + source column audited;
               Analysis implementation still NO
research 2026-08-28-moore-oun-igra-source-qualification.md:
               #2 IGRA identity + source column audited;
               57 GATE ACCEPTED; Moore wrapper + golden
               DONE; Explore identity moore-2013-observed
               DONE; Analysis still NO
research 2026-08-28-esc-flight-phase-and-high-frequency-wind-audit.md:
               ESC CLEAN ASCENT; ~17–19 s signature
research 2026-08-28-esc-wind-processing-pipeline-audit.md:
               processing may shape; does not explain origin
research 2026-08-28-leise-filter-and-analysis-operator-comparison.md:
               T5FLTR reconstructed; not production
56:            ESC multi-sounding source ingest
               architecture; GATE ACCEPTED;
               Prospect and Dumas goldens DONE;
               Moore excluded from this family;
               Explore identities consume those source
               records separately
57:            IGRA observed-profile ingest
               architecture; GATE ACCEPTED;
               Moore wrapper + golden DONE in
               src/data/igra/; Explore identity
               moore-2013-observed on I2; not BL-015;
               not Analysis
BL-010:
               NOT STARTED / IMPLEMENTATION AUTHORIZED
               by 59; not implemented
BL-037:
               CLOSED; universal operator NOT SUPPORTED;
               contract is 58; ESC operator named in BL-046;
               production spec in 59
BL-046:
               RESEARCH DECISION COMPLETE;
               time-domain FIR 40 s named;
               production spec / column authorization in 59
physics/04, 07:
               wind profile; value-only StormMotion
KNOWN_LIMITATIONS.md:
               V1 limitations, not a POST-V1 promise list
```

This document does not include implementation.
