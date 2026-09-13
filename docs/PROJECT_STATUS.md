# PROJECT_STATUS

**Current gate — 2026-09-13: PHASE P2 SPECIFICATION — FROZEN · HUMAN REVIEW APPROVED.**

Authoritative [Phase P2 qualification specification](research/2026-09-13-observed-lagrangian-phase-p2-qualification-specification.md). Specification ID: `observed-lagrangian-phase-p2-qualification/v1`. Frozen exact-file SHA-256: `fe5a33f8753b7538e5c3abdd2fe9f5766a2bdcefd08bfab07e6ced34bcfae59b`. Human specification review: CLOSED · APPROVED. This specification-only freeze supersedes the older current/next-action bookmarks below; historical Phase P narratives remain unchanged. No implementation design or execution is authorized by this freeze.

```text
PHASE P — CLOSED · INVALID CONTROL
PHASE P2 SPECIFICATION — FROZEN · HUMAN REVIEW APPROVED
PHASE P2 IMPLEMENTATION — NOT AUTHORIZED
PHASE P2 EXECUTION — NOT AUTHORIZED
MAIN L1 — NOT AUTHORIZED / NOT TESTED
MATERIAL RESPONSE THRESHOLDS — STILL OPEN
PRODUCTION/UI — UNCHANGED
```


**Current gate — 2026-09-13: PHASE P SCIENTIFIC EXECUTION — CLOSED · INVALID CONTROL.**

Authoritative [Phase P qualification specification](research/2026-09-13-observed-lagrangian-phase-p-qualification-specification.md) remains byte-for-byte frozen. This bookmark records the human-classified qualification/control result and execution provenance in [Phase P execution and human closure](#phase-p-execution-and-human-closure). Cause: NUMERICAL CONVERGENCE. No main L1 conclusion or production-physics failure is established.

```text
PHASE P SPECIFICATION — FROZEN
PHASE P IMPLEMENTATION DESIGN — CLOSED · APPROVED
PHASE P IMPLEMENTATION — COMPLETE
PHASE P IMPLEMENTATION REVIEW — CLOSED · APPROVED
REVIEWED IMPLEMENTATION SHA — 285e623
PHASE P SCIENTIFIC EXECUTION — CLOSED · INVALID CONTROL
INVALID CONTROL CAUSE — NUMERICAL CONVERGENCE
PHASE P SCIENTIFIC ATTEMPTS — 2
ATTEMPT 1 — INCOMPLETE · ENOSPC
ATTEMPT 2 — COMPLETE · INVALID CONTROL
SELECTED T/h — NONE
ALL-EIGHT-SEED ADMISSION — NOT ACHIEVED
ENSEMBLE — REJECTED
UNEXPLAINED — 0
PHYSICS FAILURE — NOT ESTABLISHED
FURTHER PHASE P EXECUTION — NOT AUTHORIZED
MAIN L1 — NOT AUTHORIZED
MAIN L1 — NOT FROZEN
MATERIAL-RESPONSE THRESHOLDS — STILL OPEN
PRODUCTION/UI — UNCHANGED
```

Specification baseline: `5c0d13a`. Human-reviewed implementation: `285e623` (full SHA `285e6230667cb47b9bbdce920b94089309c7d823`). Both execution attempts used runtime HEAD `07d2932a1933d47cc19b3829daad52b276c5d491`, a docs-only descendant of the reviewed implementation. These are distinct specification, implementation and runtime provenance identities.

Earlier human implementation review verified validation-only scope, unchanged production/UI, frozen constants and E1 C-matrix/storm inheritance, guard/preflight and GLOBAL READY boundary, explicit-C routing and seven-operand composition, lifecycle/support/crossing semantics, numerical qualification machinery, first-step oracle, outcome-blind controller and artifact contract. Final infrastructure verification at that gate: 28 passed, 1 scientific test skipped; typecheck and diff/whitespace checks passed. Observed scientific runs at that earlier gate: 0.

The narrow event-width implementation corrigendum was reviewed and approved before closure: fine bracket width had initially been compared against coarse h; coarse now requires `b_c - a_c <= h_c`, and fine requires `b_f - a_f <= h_f`. A regression test was added. Event-time tolerance `max(1 s, 2h)` is unchanged. This corrects implementation of the frozen rule; it does not change the scientific specification.

The E1 closure and earlier gate narratives below retain their historical provenance. The current Phase P bookmark and NEXT ACTION supersede older references to the next Lagrangian protocol-design gate; they change no E1 or H1–H5 input, result or classification.

**Role:** current-project status and navigation point. Use this file to quickly understand the active phase, completed milestones, open gates, and next action.

**Not:** a physics or architecture source of truth, a roadmap, a backlog, a schedule, or implementation authorization.

This file is a navigation/status bookmark only. It points to the documents that own decisions and evidence. If this file conflicts with an owning physics, architecture, research, rendering, UI, or review document, the owning document wins.

**Maintenance rule:** update this file whenever a meaningful project step closes, the active phase changes, or `NEXT ACTION` changes. Do not update it for every commit or minor edit.

**Last status update:** 2026-09-13

---

## 1. Current phase

**Storm-Motion Sensitivity & V1 Validation**

Current status:

```text
STORM-MOTION SENSITIVITY CAMPAIGN / OBSERVED E1 SCIENTIFIC CLOSURE / NEXT LAGRANGIAN DESIGN GATE
ARCHITECTURE AUDIT CLOSED
PARENT RESEARCH PROTOCOL ARCHITECTURE-SYNCHRONIZED
VALIDATION HARNESS DESIGN FROZEN
HARNESS IMPLEMENTATION REVIEW COMPLETE
PRE-RUN SRH SIGN CORRECTION CLOSED
H1 EXECUTED · CLASSIFIED PASS
H2 EXECUTED · CLASSIFIED PASS
H3 EULERIAN EXECUTED · CLASSIFIED PASS
H3 TRAJECTORIES EXECUTED · CLASSIFIED INVALID CONTROL
NO UNEXPLAINED DEVIATIONS
NO H3 PHYSICS FAILURE ESTABLISHED
H3 DOCUMENTATION / CLASSIFICATION CLOSURE COMPLETE
H4 CLOSED · INVALID CONTROL
H5 PRE-RUN SCIENTIFIC DESIGN REVIEWED / APPROVED · H5 EXPECTATIONS FROZEN
H5 TEST-ONLY IMPLEMENTATION COMPLETE · H5 IMPLEMENTATION REVIEW COMPLETE / CLOSED
H5 CLOSED · PASS / HUMAN SCIENTIFIC CLASSIFICATION
OBSERVED C-MATRIX SCIENTIFIC DESIGN REVIEWED
E1 FULL-PRECISION ARITHMETIC SPECIFICATION REVIEWED AND APPROVED
E1 ARITHMETIC INPUTS FROZEN
E1 IMPLEMENTATION DESIGN REVIEW CLOSED · APPROVED
E1 IMPLEMENTATION CONTRACT FROZEN
E1 IMPLEMENTATION COMPLETE
E1 IMPLEMENTATION REVIEW CLOSED · APPROVED
E1 IMPLEMENTATION REVIEWED SHA c54f885
E1 SCIENTIFIC EXECUTION CLOSED · PASS
E1 VALID CONTROL YES
E1 UNEXPLAINED DEVIATIONS NONE
E1 PHYSICS FAILURE ESTABLISHED NO
LAGRANGIAN STAGE NOT AUTHORIZED / NEXT DESIGN GATE
PRODUCTION IMPLEMENTATION / UI NOT AUTHORIZED
PRODUCTION PHYSICS UNCHANGED
NO PRODUCTION PHYSICS CHANGES AUTHORIZED
```

V1 itself remains **CLOSED** as the finite validation prototype recorded in:

- [`reviews/2026-08-27-v1-closed.md`](reviews/2026-08-27-v1-closed.md)
- [`architecture/38-v1-scope-checkpoint.md`](architecture/38-v1-scope-checkpoint.md)

The current campaign validates and probes the released V1 model before deciding whether storm-motion sensitivity should become later user-facing work. It does not silently reopen V1 or authorize production feature work.

---

## 2. Authoritative current documents

Scientific protocol and recorded H1/H2/H3 evidence and classifications (§10):

- [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md)

H4 is CLOSED · INVALID CONTROL; its frozen specification remains in parent protocol §13. H5 scientific design is reviewed/approved and frozen in [parent protocol §14](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md#14-h5--pre-run-scientific-design-for-a-shifted-boundary-crossing). H5 executed once and is CLOSED · PASS by human scientific classification; evidence is owned by parent protocol §15. H5 closure documentation review is complete; its records remain unchanged.

Reviewed observed C-matrix scientific design and approved E1 full-precision arithmetic specification:

- [`research/2026-09-12-observed-c-matrix-protocol-design.md`](research/2026-09-12-observed-c-matrix-protocol-design.md) — §13 owns the frozen arithmetic inputs; earlier open-decision lists are superseded for E1 by the approved implementation contract. §14 owns the exactly-once E1 execution provenance, artifact hashes and human CLOSED · PASS classification.

E1 implementation design review CLOSED · APPROVED; implementation contract FROZEN:

- [`research/2026-09-12-observed-c-matrix-e1-implementation-design.md`](research/2026-09-12-observed-c-matrix-e1-implementation-design.md) — frozen three-file layout, explicit 36-parameter storm-only snapshot (§4.1), P1/P2 probes, E1-A–F assertions, independent oracles, numerical tolerances, evidence and stop rules. Implementation COMPLETE; implementation review CLOSED · APPROVED at c54f885. E1 scientific execution CLOSED · PASS; see observed protocol §14.

Closed implementation-fact architecture audit:

- [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md)

Frozen minimal harness design:

- [`research/2026-09-12-storm-motion-validation-harness-design.md`](research/2026-09-12-storm-motion-validation-harness-design.md)

Closed pre-run SRH sign correction:

- [`research/2026-09-12-storm-motion-srh-sign-correction.md`](research/2026-09-12-storm-motion-srh-sign-correction.md)

---

## 3. Completed path to the current point

Pre-run freezes and completed campaign steps:

1. C-dependence/invariance reasoning established.
2. H1 translation-invariance control frozen.
3. H2 direct C-response / iso-SRH control frozen.
4. H3 path-mediated hypothesis and geometry frozen.
5. H3 mapped to production `VerticalEnvelopeUpdraftField` with `sigma=1000 m`, `W0=20 m/s`, vertical support `[0,8000] m`, and no rotation/inflow/outflow/downdraft.
6. H3 seed frozen at `X0=(-3000,500,0) m`; no post-hoc retuning.
7. Explicit Euler and `dt=0.1 s` frozen.
8. Path-history sampling frozen: initial point plus accepted post-step position/time every fixed step; no FPS sampling/interpolation for primary metrics.
9. Streamwise/crosswise basis/sign convention and exact-zero domain frozen.
10. Exact `y=0` tracer disappearance mechanism confirmed.
11. Analysis support semantics frozen; synthetic core T1 and support-aware Analysis remain distinct APIs.
12. Synthetic H3 T1 path frozen to core `DiagnosticTiltingTendency`, with explicit containing-segment validity gating; out-of-profile legacy zero is excluded from T1 evidence.
13. H3 sign-reversal semantics frozen: `epsilon_T1=1e-6 s^-2` is a material-sign guard, not physical zero.
14. Synthetic C injection seam frozen: construct `StormRelativeEnvironmentalAdvectionField(environmentField, C_test)` directly; production DEMO composition remains unchanged.
15. H3 minimal total field frozen as storm-relative environmental advection + synthetic updraft only.
16. H3 geometry radius uses world horizontal `(x,z)`.
17. H3 same-point control heights are `y=500,1500,2500 m`.
18. Architecture audit **CLOSED**.
19. Parent protocol synchronized with the closed audit and obsolete H3 assumptions removed.
20. Minimal validation harness design **FROZEN**.
21. H1/H2 are direct algebraic/Eulerian Vitest controls; no tracer simulation or UI is required.
22. H3 harness construction frozen to fresh independent simulations, `ATMOSPHERIC_TRACER_DOMAIN`, `TracerPathHistory(stride=1)`, 6000 fixed steps maximum, and discrete post-step diagnostics.
23. H3 result schema frozen: geometry, sampled-w, valid sampled T1, support counts, lifecycle, same-point invariants, and explicit status records.
24. Clean H3 sign reversal is local to the maximal contiguous `r <= 1500 m` core-passage window around global `r_min`, with opposite material signs on opposite sides of the core and one unchanged sounding segment across the evidence interval.
25. First execution order frozen as H1 → classify → H2 → classify → H3 same-point controls → H3 trajectories.
26. Test-only harness implemented; implementation review **COMPLETE**.
27. Pre-run SRH sign correction **CLOSED**: research integral/H2 oracle aligned with canonical physics doc 09 and unchanged production Form B; H2 expectations are `0,-300,-300 m^2/s^2`.
28. First separately authorized backend campaign stage H1 executed on 2026-09-12 and classified **CLOSED · PASS**, with no FAIL, UNEXPLAINED, or INVALID CONTROL checks; see [protocol §10](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md#10-results).
29. H2 separately authorized after H1 documentation was committed/pushed, executed on 2026-09-12, and classified **CLOSED · PASS**, with no unexplained deviations, invalid control, or physics failure; see [protocol §10](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md#10-results).
30. H3 Eulerian separately executed and classified **CLOSED · PASS** before separately authorized H3 trajectories.
31. H3 trajectories executed and classified **CLOSED · INVALID CONTROL**: opposite material-sign evidence crossed a sounding-segment boundary and did not satisfy the frozen clean sign-reversal requirement. Trajectory/sample integrity, A/B geometry, and sampled-w contrast passed; see [protocol §10](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md#10-results).
32. No H3 physics failure established; production physics unchanged. The additional Vitest `snapshotSaved` timeout is a technical execution/reporting issue, separate from scientific classification.
33. H3 documentation/classification closure complete; its INVALID CONTROL and partial valid evidence remain unchanged.
34. H4 design/implementation/review committed and pushed; subsequently separately authorized and executed once. H4 CLOSED · INVALID CONTROL.
35. H5 pre-run scientific design reviewed/approved and expectations frozen. Only seed z changes to +225 m; test-only implementation and review complete; subsequently executed once and human-classified CLOSED · PASS; see protocol §15.
36. Observed C-matrix scientific design reviewed; primary layer, baseline C0, five-member case-relative geometry, endpoint-arithmetic-mean reference flow and alpha=1/2 accepted.
37. E1 full-precision arithmetic specification reviewed and approved: all 20 C vectors and endpoint-derived DeltaSRH predictions frozen pending implementation review. Conditioning audit found no zero reference flow. At that arithmetic-review gate, no E1 implementation or execution had occurred.
38. E1 test-only implementation design was documented at audited HEAD `9f3dfbca2e87b7755bcc2bdc7c93433161f839f5`, with static support/error-scale arithmetic only.
39. Human scientific implementation-design review **CLOSED · APPROVED**; implementation contract **FROZEN** on 2026-09-13, including the explicit immutable storm-only literal snapshot and field-level preflight. At that gate implementation was NOT STARTED; E1/Lagrangian execution remains NOT AUTHORIZED.
40. The human-reviewed freeze was committed/pushed at `636deb316fdb50ff73b61c66524fbc829dec3f23`; the subsequent user instruction authorized test-only implementation and infrastructure verification. The three E1 files are now implemented; infrastructure fixtures and typecheck pass. At the implementation handoff, actual code review was still required. No observed scientific collection ran.
41. Human E1 implementation review CLOSED · APPROVED for the exact committed/pushed three-file implementation at `c54f885` (`c54f8857a808de0aae316556306af2069c7b5aa3`). Infrastructure fixtures and typecheck passed before closure. E1/Lagrangian execution remains NOT AUTHORIZED.

---

## 4. Important architecture/product findings

### A1 — ground-level tracer / updraft lower lid

The production updraft is zero at `y=0`; a live ground-level tracer may immediately deactivate because the production downdraft contributes a negative tail there and the atmospheric-domain policy clips a below-ground first Euler proposal.

### A2 — unsupported Analysis trajectory can visually resemble T1

Unsupported Analysis trajectory segments can expose the first tracer's red identity trail, which can be mistaken for a T1 value. Tracked in:

- [`bugs/2026-09-11-analysis-unsupported-segment-looks-like-t1.md`](bugs/2026-09-11-analysis-unsupported-segment-looks-like-t1.md)
- [`bugs/README.md`](bugs/README.md)

### A3–A8

**CLOSED / FROZEN:** sampling semantics, streamwise/crosswise convention, `y=0` mechanism, Analysis support semantics, H3 material-sign/same-segment reversal rule, and minimal synthetic C injection seam.

---

## 5. Current step

**H1, H2, and H3 Eulerian CLOSED · PASS. H3 trajectories CLOSED · INVALID CONTROL, with partial valid evidence preserved.**

H3/H4 classifications remain unchanged. H5 CLOSED · PASS: clean same-segment geometric T1 reversal demonstrated within the frozen synthetic control, with no oracle discrepancy. The implementation design review is CLOSED · APPROVED and the implementation contract is FROZEN. E1 implementation is COMPLETE; implementation review is CLOSED · APPROVED at c54f885. The first separately authorized scientific execution ran exactly once and was subsequently human-classified CLOSED · PASS; valid control YES, unexplained deviations NONE, physics failure established NO.

**OBSERVED C-MATRIX PROTOCOL DESIGN — reviewed/frozen arithmetic inputs:**

- Scientific design **REVIEWED**.
- Primary layer `L=[500,3000] m` **ACCEPTED**.
- Prescribed baseline `C0=(10,0) m/s` east/north **ACCEPTED**.
- Five-member case-relative C geometry **ACCEPTED**.
- Endpoint-arithmetic-mean reference flow **ACCEPTED**.
- `alpha=1/2` **ACCEPTED**.
- E1 full-precision arithmetic specification **REVIEWED AND APPROVED**.
- E1 arithmetic inputs **FROZEN**; all 20 C vectors and endpoint-derived DeltaSRH predictions frozen.
- Full-precision conditioning audit found **no zero reference flow**. Minimum: **5.8202943903637792 m/s, Moore / right_minus**.
- Deeper L2 **DEFERRED**. Moore remains **Source-only with respect to Analysis T1**.

**Frozen E1 implementation contract:** three E1-only files; one literal Spec transcription plus independent endpoint reconstruction; guarded/lazy collection; option B with the six unchanged DEMO storm operands and an explicit immutable snapshot of all 36 consumed parameters; P1=(2000,1750,4000), P2=(-4000,1750,2000) m at t=0 s; E1-A–F assertions, independent oracles, numerical tolerances, evidence and stop/classification rules. **EXACT-ZERO-ONLY DOMAIN POLICY** is frozen for decomposition. The prior **1 m/s threshold remains NOT FROZEN and NOT USED by E1**. No extra grid/local decomposition probes are authorized. Implementation is COMPLETE; actual code review is CLOSED · APPROVED at c54f885.

**Scientific closure and authorization:** E1 is **CLOSED · PASS by human scientific review**, not by runner success alone. Lagrangian stage **NOT AUTHORIZED / NEXT DESIGN GATE**. Its geometry, seeds, timestep/duration, T1 material threshold and execution criteria remain unfrozen. E1 closure authorizes no rerun, Lagrangian implementation/execution or production/UI change. Execution provenance and local immutable artifact hashes are owned by [observed protocol §14.1](research/2026-09-12-observed-c-matrix-protocol-design.md#141-execution-provenance-and-local-immutable-evidence).

The existing synthetic test-only harness is:

`src/validation/stormMotionSensitivity.validation.test.ts`

It imports existing production backend classes directly and keeps campaign-specific helpers local. Production physics, UI, and DEMO composition remain unchanged.

**Observed E1 implementation handoff (2026-09-13):**

- [`observedCMatrixE1Spec.ts`](../src/validation/observedCMatrixE1Spec.ts): recursively immutable literal transcription, one 20-member matrix, storm-only snapshot, provenance and tolerance manifest.
- [`observedCMatrixE1.ts`](../src/validation/observedCMatrixE1.ts): science-inert imports; independent raw/coordinate/gradient/basis references; guarded preflight and explicit-C collector; deterministic evidence, applicability and bounded stop handling. The implementation-reviewed SHA is `c54f8857a808de0aae316556306af2069c7b5aa3` (`c54f885`); it is explicit provenance for any later separately authorized execution (`OBSERVED_C_MATRIX_REVIEWED_SHA` in the entry), never execution authorization.
- [`observedCMatrixE1.validation.test.ts`](../src/validation/observedCMatrixE1.validation.test.ts): isolated infrastructure fixtures and a default-skipped scientific entry.

Verification commands: `npx vitest run src/validation/observedCMatrixE1.validation.test.ts -t 'E1 infrastructure'` ran twice (first 10 PASS, then 11 PASS; scientific entry SKIPPED both times), with explicit PowerShell checks that both stage environment variables were absent. `npm run typecheck` (`tsc --noEmit`) ran three times: the first found the SRH API object/number mismatch, corrected to destructure `{ srh }`; both subsequent runs PASS. Typechecking executes no application/test code. No build or whole-suite command ran. Read-only Node text/JSON/TypeScript-AST inspection matched all 20 member rows, 36 consumed storm fields, probes and tolerances against their authorities; it imported no production module.

At the earlier implementation handoff, no scientific E1 execution had occurred. Its infrastructure verification did not change the frozen inputs/contract, H1–H5 records or parent §12 Conclusions (EMPTY). The later exactly-once execution and human scientific closure are now recorded in observed protocol §14.

---

**Earlier implementation-review closure (2026-09-13):** at that gate no observed E1 scientific collection had run; no H1–H5 rerun or Simulation/trajectory execution occurred. Production physics/UI/ScenarioConfig/DEMO composition remain unchanged. This docs-only closure ran no tests/build/typecheck/simulation/campaigns, did not set `OBSERVED_C_MATRIX_STAGE=E1`, and performed no commit or push. Frozen arithmetic/implementation requirements and H1–H5 evidence/classifications remain unchanged; parent §12 Conclusions remains EMPTY.

**E1 human scientific closure (2026-09-13):** CLOSED · PASS; valid control YES; unexplained deviations NONE; physics failure established NO; production physics UNCHANGED. Exactly one execution: runner exit 0, emitted COMPLETE, Vitest 1 passed / 11 skipped, preflight 336 checks / 0 blocks, members 20/20, uncollected 0, faults 0. Applicable assertions: PASS 1054 / INVALID CONTROL 0 / UNEXPLAINED 0 / FAIL 0; N_A 22 (12 BASELINE_REFERENCE, 10 COLUMN_UNAVAILABLE); independent assertions 480. The group summary, representation-specific Dumas/Moore controls, scientific findings and explicit scope exclusions are recorded in [observed protocol §14](research/2026-09-12-observed-c-matrix-protocol-design.md#14-e1-execution-results-and-human-scientific-closure).

### Phase P execution and human closure

**Human classification: PHASE P SCIENTIFIC EXECUTION — CLOSED · INVALID CONTROL. Cause: NUMERICAL CONVERGENCE.** Phase P completed the registered collection and qualification machinery, but the registered ensemble did not satisfy frozen numerical-convergence qualification at any allowed T/h pair. The current frozen Phase P numerical qualification configuration is insufficient to admit the ensemble for main L1.

This qualification/control result does not establish failure of the main L1 hypothesis, absence of C-dependent path or sampled T1 response, a scientific null response, production-physics failure, incorrect C routing, incorrect observed environmental data or incorrect prescribed storm fields. It does not establish a need to loosen tolerances, use a particular smaller dt or change integrator. Those require separate analysis/design decisions. UNEXPLAINED — 0. PHYSICS FAILURE — NOT ESTABLISHED.

Both attempts used specification baseline `5c0d13a`, reviewed implementation `285e6230667cb47b9bbdce920b94089309c7d823` and runtime HEAD `07d2932a1933d47cc19b3829daad52b276c5d491` on `main`.

#### Attempt 1 — INCOMPLETE · EXTERNAL STORAGE FAILURE

Collection started: YES. Expected units: 640; emitted completed units: 339. Machine state: `QUALIFICATION_INCOMPLETE`; selected: `null`. Cause: `ENOSPC: no space left on device, write`. The qualification controller was not reached. No Phase P qualification result was established by Attempt 1; it is not classified INVALID CONTROL. Partial evidence was preserved without editing. No resume was used.

#### Attempt 2 — COMPLETE · INVALID CONTROL

After storage remediation and separate human authorization, Attempt 2 was a fresh execution from unit zero with output relocated to E:. Runner exit: 0; scientific test: 1 passed; infrastructure tests: 28 skipped; invocation duration: 1463.27 s. Raw units: 640/640; trajectory records: 640; diagnostic records: 640; trajectory samples: 2,592,640; malformed JSON records: 0. All 640 units terminated at `MAX_TIME`; mandatory Source/ground early stops: 0; faults: 0.

Exact machine result:

```json
{"faults":[],"humanReview":"REQUIRED","selected":null,"state":"QUALIFICATION_COMPLETE","unitsCollected":640}
```

The saved machine request for human review remains unchanged in evidence; the subsequent human classification is recorded here. Machine summary: `control: INVALID CONTROL`, `ensemble: REJECTED`, selected T/h: NONE. All eight seeds (S1-L, S2-L, S3-L, S4-L, S1-H, S2-H, S3-H, S4-H) are REJECTED. ALL-EIGHT-SEED ADMISSION — NOT ACHIEVED. This is not partial admission; the frozen protocol requires all eight seeds.

Registered candidates, in frozen assessment order:

| T (s) | h (s) | COMPLETE | VIABLE | CONTROLS | NUMERICAL | Reason |
|---:|---:|---|---|---|---|---|
| 540 | 0.5 | YES | YES | YES | NO | NUMERICAL |
| 540 | 0.25 | YES | YES | YES | NO | NUMERICAL |
| 360 | 0.5 | YES | YES | YES | NO | NUMERICAL |
| 360 | 0.25 | YES | YES | YES | NO | NUMERICAL |
| 180 | 0.5 | YES | YES | YES | NO | NUMERICAL |
| 180 | 0.25 | YES | YES | YES | NO | NUMERICAL |

No registered candidate passed numerical qualification. Aggregate saved check counts across all six candidates, including repeated checks:

| Saved status/category | Count |
|---|---:|
| completed check | 29,948 |
| INVALID CONTROL | 3,186 |
| UNEXPLAINED | 0 |
| N_A (total) | 1,570 |
| N_A / NO_SEGMENT_MATCHED_SAMPLES | 1,090 |
| N_A / COLUMN_UNAVAILABLE | 480 |

N_A denotes inapplicability, not failure.

The following rounded values are maximum saved residuals for their respective criteria. Each tolerance belongs to the same check record as the residual shown; these are qualification evidence only.

| Criterion | Residual | Tolerance | Units |
|---|---:|---:|---|
| Position | 42.4604 | 10 | m |
| Vertical | 10.5911 | 3 | m |
| Path response | 39.8126 | 10 | m |
| Vertical response | 10.7283 | 3 | m |
| Source history | 1.98508e-5 | 1.47581e-6 | s^-2 |
| Source Eabs | 1.05918e-3 | 1.54675e-4 | s^-1 |
| Source Esigned | 6.97766e-4 | 2.26271e-5 | s^-1 |
| Analysis Esigned | 3.76232e-5 | 3.33595e-5 | s^-1 |

These maxima do not establish refinement order, asymptotic convergence, localization of failures, adequacy/inadequacy of tolerances or a required next dt. Those questions belong to a separate read-only numerical post-mortem.

#### Attempt 2 evidence provenance

Preserved local directory outside Git: `E:\phase-p-retry-07d2932-attempt-2`. All seven files are finalized; no `.partial` artifacts exist in Attempt 2. SHA-256 values were verified against preserved bytes and matched execution metadata for the six referenced artifacts; execution.json has its own independently computed hash, without a self-hash cycle.

| File | Bytes | SHA-256 |
|---|---:|---|
| manifest.json | 17,962 | `cd43c7ae1fede86ae5183ca8f6dcfa6a993322cb23e7d9408138ae3e0295ef07` |
| trajectory.ndjson | 2,229,555,241 | `fdadf5a9e3509d43e962d2609e9fd323aa7a5161a912838c53e89312c4555421` |
| diagnostic.ndjson | 1,570,714,917 | `fb074530dfbcccc70f996a4b6646053a75be8225c9a8ca4e7de5253dbf540cac` |
| summary.json | 10,728,090 | `dfd164614eea8efd27587899e307759987f3a47914597d593161951dd6f0e361` |
| execution.json | 856 | `9ec363cb044175140196d0619fe4f59b12297b64eeaabe0223ba8577f3008f1b` |
| stdout.txt | 109 | `6f6c75811035efab4965816d5cc3863c34ead4b51c6f698c0ec9dcab6a76937f` |
| stderr.txt | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

No evidence was regenerated or modified during this docs-only closure. No tests, Simulation, observed collection or numerical post-mortem ran; no commit/push occurred. Further execution and main L1 remain unauthorized.

## 6. NEXT ACTION

**READ-ONLY PHASE P NUMERICAL CONVERGENCE POST-MORTEM**

The next gate uses existing Attempt 2 qualification evidence only to determine where and how frozen numerical qualification failed. It should examine refinement trends by case, member, seed, candidate duration, resolution pair and criterion, especially 0.5 ↔ 0.25, 0.25 ↔ 0.125 and 0.125 ↔ 0.0625 s. That analysis is not part of this closure. No deeper dt ladder, changed tolerances, different integrator, seed/duration changes or another execution are prescribed or authorized here. Main L1 remains NOT AUTHORIZED and NOT FROZEN; material-response thresholds remain STILL OPEN.

The approved exact E1 C matrix and 36-parameter storm snapshot are explicitly inherited. E1 stays CLOSED · PASS; no E1/H1–H5 rerun is authorized. No observed scientific collection, commit or push occurred during Phase P implementation.

---

## 7. Synthetic closure and observed-protocol design gates

Architecture blockers: **none**.

Scientific classification: **H3 clean sign-reversal INVALID CONTROL**, with no UNEXPLAINED scientific deviations or established H3 physics failure. Frozen expectations remain unchanged.

Harness-design blockers: **none**.

Completed scientific review and remaining implementation/execution gates:

```text
H4 CLOSED · INVALID CONTROL
→ H5 scientific design APPROVED / EXPECTATIONS FROZEN
→ H5 test-only implementation COMPLETE / implementation review COMPLETE / CLOSED
→ H5 executed once / human classification CLOSED · PASS
→ H5 closure documentation reviewed
→ observed C-matrix scientific design REVIEWED
→ E1 full-precision arithmetic specification REVIEWED AND APPROVED
→ E1 arithmetic inputs FROZEN
→ E1 implementation design review CLOSED · APPROVED / contract FROZEN
→ freeze reviewed/committed
→ E1 test-only implementation COMPLETE
→ implementation review CLOSED · APPROVED / reviewed SHA c54f885
→ separately authorized E1 execution: exactly once
→ human scientific review: E1 CLOSED · PASS
→ observed Lagrangian protocol design/review/freeze (NEXT DESIGN GATE)
→ Lagrangian implementation/execution NOT AUTHORIZED
```

Deferred campaign path, not authorized by this slice or automatically unlocked by the partial H3 evidence:

```text
observed C-sensitivity matrix
→ compare predictions vs observations
→ validation report
→ only then decide whether production/V1.1 changes are warranted
```

---

## 8. Important guardrails

Do not tune synthetic controls after seeing results merely to make expected effects stronger.

Do not reinterpret local Eulerian T1 changes as direct C-response without a new audited implementation path.

Do not use unsupported Analysis samples as numeric zero or infer T1 from trajectory color.

Do not conflate legacy `DiagnosticTiltingTendency` out-of-profile zero with Analysis `OUT_OF_DOMAIN`.

Do not treat exact `|V_sr,h|=0` as zero streamwise/crosswise vorticity; the basis is undefined.

Do not require a sampled T1 zero for H3 sign-reversal PASS.

Do not count a sign change spanning different sounding segments as the clean same-segment reversal control.

Do not search the whole 600 s H3 path for unrelated opposite signs; use the frozen local core-passage window.

Do not change production DEMO composition merely to inject synthetic storm motion.

Do not add product/UI architecture solely for the validation campaign.

Do not attribute the `y=0` disappearance to the updraft alone.

Do not treat `PROJECT_BACKLOG.md` as the current roadmap.

Do not treat this file itself as physics authority.

---

## 9. Current-state reading order

1. **This file** — current phase and `NEXT ACTION`.
2. [`research/2026-09-12-observed-c-matrix-protocol-design.md`](research/2026-09-12-observed-c-matrix-protocol-design.md) — reviewed scientific design, approved frozen E1 arithmetic inputs (§13); its historical open E1 decisions are resolved by the frozen implementation contract.
   Read alongside the [approved frozen E1 implementation contract](research/2026-09-12-observed-c-matrix-e1-implementation-design.md); implementation is complete and code review is CLOSED · APPROVED at c54f885; scientific execution is CLOSED · PASS by human review in observed protocol §14.
3. [`research/2026-09-12-storm-motion-validation-harness-design.md`](research/2026-09-12-storm-motion-validation-harness-design.md) — existing frozen synthetic implementation/output contract; not an E1 implementation specification.
4. [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md) — frozen synthetic scientific protocol, expectations and closure records.
5. [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md) — closed implementation-fact audit.
6. [`bugs/README.md`](bugs/README.md) — product defects found while auditing.
7. [`PROJECT_BACKLOG.md`](PROJECT_BACKLOG.md) — broader deferred/unresolved work.
8. [`README.md`](README.md) and [`ARCHITECTURE.md`](ARCHITECTURE.md) — global documentation/architecture map.

The [formal correction record](research/2026-09-12-storm-motion-srh-sign-correction.md) documents the closed pre-run specification issue. H1/H2/H3 evidence and classifications are owned by [protocol §10](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md#10-results); H4 specification is owned by §13 and remains unchanged. H5 frozen scientific design is owned by §14; execution evidence and human CLOSED · PASS classification are owned by §15. The current next gate is READ-ONLY PHASE P NUMERICAL CONVERGENCE POST-MORTEM. Further Phase P execution remains unauthorized.
