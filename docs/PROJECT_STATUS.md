# PROJECT_STATUS

**Role:** current-project status and navigation point. Use this file to quickly understand the active phase, completed milestones, open gates, and next action.

**Not:** a physics or architecture source of truth, a roadmap, a backlog, a schedule, or implementation authorization.

This file is a navigation/status bookmark only. It points to the documents that own decisions and evidence. If this file conflicts with an owning physics, architecture, research, rendering, UI, or review document, the owning document wins.

**Maintenance rule:** update this file whenever a meaningful project step closes, the active phase changes, or `NEXT ACTION` changes. Do not update it for every commit or minor edit.

**Last status update:** 2026-09-12

---

## 1. Current phase

**Storm-Motion Sensitivity & V1 Validation**

Current status:

```text
STORM-MOTION SENSITIVITY CAMPAIGN / OBSERVED E1 IMPLEMENTATION DESIGN/REVIEW GATE
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
E1 ARITHMETIC INPUTS FROZEN PENDING IMPLEMENTATION REVIEW
E1 IMPLEMENTATION DECISIONS STILL OPEN
E1 EXECUTION NOT AUTHORIZED
LAGRANGIAN STAGE NOT AUTHORIZED / MUST FOLLOW E1 CLOSURE
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

- [`research/2026-09-12-observed-c-matrix-protocol-design.md`](research/2026-09-12-observed-c-matrix-protocol-design.md) — §13 owns the frozen arithmetic inputs; §§10 and 13.6 identify still-open decisions. This is not E1 execution authorization.

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
37. E1 full-precision arithmetic specification reviewed and approved: all 20 C vectors and endpoint-derived DeltaSRH predictions frozen pending implementation review. Conditioning audit found no zero reference flow. No E1 implementation or execution has occurred.

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

H3/H4 classifications remain unchanged. H5 CLOSED · PASS: clean same-segment geometric T1 reversal demonstrated within the frozen synthetic control, with no oracle discrepancy. The active step is observed E1 test-only implementation design/review, following approval of the arithmetic specification. This status synchronization does not implement E1 or authorize execution.

**OBSERVED C-MATRIX PROTOCOL DESIGN — reviewed/frozen arithmetic inputs:**

- Scientific design **REVIEWED**.
- Primary layer `L=[500,3000] m` **ACCEPTED**.
- Prescribed baseline `C0=(10,0) m/s` east/north **ACCEPTED**.
- Five-member case-relative C geometry **ACCEPTED**.
- Endpoint-arithmetic-mean reference flow **ACCEPTED**.
- `alpha=1/2` **ACCEPTED**.
- E1 full-precision arithmetic specification **REVIEWED AND APPROVED**.
- E1 arithmetic inputs **FROZEN PENDING IMPLEMENTATION REVIEW**; all 20 C vectors and endpoint-derived DeltaSRH predictions frozen.
- Full-precision conditioning audit found **no zero reference flow**. Minimum: **5.8202943903637792 m/s, Moore / right_minus**.
- Deeper L2 **DEFERRED**. Moore remains **Source-only with respect to Analysis T1**.

**Still-open E1 implementation decisions:** Eulerian spatial/query grid, local decomposition probe heights, independently justified numerical tolerances, exact executable assertions, support/applicability handling and evidence implementation. The proposed **1 m/s decomposition conditioning threshold remains NOT FROZEN**; it must not alter C or introduce a fallback basis. These open decisions are distinct from the approved arithmetic inputs.

**Execution authorization:** E1 execution **NOT AUTHORIZED**. Lagrangian stage **NOT AUTHORIZED** and must follow E1 closure; its geometry, seeds, timestep/duration, T1 material threshold and execution criteria remain unfrozen. Production/harness/UI changes and test/campaign execution are not authorized by this status update.

The implemented test-only harness is:

`src/validation/stormMotionSensitivity.validation.test.ts`

It imports existing production backend classes directly and keeps campaign-specific helpers local. Production physics, UI, and DEMO composition remain unchanged.

---

## 6. NEXT ACTION

**E1 test-only implementation design/review, using the reviewed and approved frozen arithmetic specification.**

Next gate:

```text
E1 test-only implementation design/review
-> implementation review closure
-> separately authorized E1 execution
```

This task stops after status synchronization. It does not implement E1, close implementation review or authorize execution. E1 must close before any Lagrangian stage. The overall campaign remains active; parent protocol §12 Conclusions remains EMPTY. No tests, campaigns, prior-stage reruns, commit or push are authorized.

Do not alter production physics, DEMO composition, UI, ScenarioConfig, analytical expectations, synthetic inputs, or frozen tolerances to make the harness pass.

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
→ E1 arithmetic inputs FROZEN PENDING IMPLEMENTATION REVIEW
→ E1 test-only implementation design/review
→ implementation review closure
→ separately authorized E1 execution (NOT AUTHORIZED now)
→ E1 closure before any Lagrangian stage (NOT AUTHORIZED now)
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
2. [`research/2026-09-12-observed-c-matrix-protocol-design.md`](research/2026-09-12-observed-c-matrix-protocol-design.md) — reviewed scientific design, approved frozen E1 arithmetic inputs (§13), open implementation decisions and execution gate.
3. [`research/2026-09-12-storm-motion-validation-harness-design.md`](research/2026-09-12-storm-motion-validation-harness-design.md) — existing frozen synthetic implementation/output contract; not an E1 implementation specification.
4. [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md) — frozen synthetic scientific protocol, expectations and closure records.
5. [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md) — closed implementation-fact audit.
6. [`bugs/README.md`](bugs/README.md) — product defects found while auditing.
7. [`PROJECT_BACKLOG.md`](PROJECT_BACKLOG.md) — broader deferred/unresolved work.
8. [`README.md`](README.md) and [`ARCHITECTURE.md`](ARCHITECTURE.md) — global documentation/architecture map.

The [formal correction record](research/2026-09-12-storm-motion-srh-sign-correction.md) documents the closed pre-run specification issue. H1/H2/H3 evidence and classifications are owned by [protocol §10](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md#10-results); H4 specification is owned by §13 and remains unchanged. H5 frozen scientific design is owned by §14; execution evidence and human CLOSED · PASS classification are owned by §15. The current gate is E1 test-only implementation design/review; arithmetic approval does not authorize execution.
