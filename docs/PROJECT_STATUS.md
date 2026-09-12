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
PRE-EXPERIMENT CORRECTION REVIEW / H1 AUTHORIZATION GATE
ARCHITECTURE AUDIT CLOSED
PARENT RESEARCH PROTOCOL ARCHITECTURE-SYNCHRONIZED
VALIDATION HARNESS DESIGN FROZEN
HARNESS IMPLEMENTATION REVIEW COMPLETE
PRE-RUN SRH SIGN CORRECTION CLOSED
PRODUCTION PHYSICS UNCHANGED
NO PRODUCTION PHYSICS CHANGES AUTHORIZED
BACKEND EXPERIMENTS NOT YET RUN
```

V1 itself remains **CLOSED** as the finite validation prototype recorded in:

- [`reviews/2026-08-27-v1-closed.md`](reviews/2026-08-27-v1-closed.md)
- [`architecture/38-v1-scope-checkpoint.md`](architecture/38-v1-scope-checkpoint.md)

The current campaign validates and probes the released V1 model before deciding whether storm-motion sensitivity should become later user-facing work. It does not silently reopen V1 or authorize production feature work.

---

## 2. Authoritative current documents

Scientific pre-experiment protocol:

- [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md)

Closed implementation-fact architecture audit:

- [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md)

Frozen minimal harness design:

- [`research/2026-09-12-storm-motion-validation-harness-design.md`](research/2026-09-12-storm-motion-validation-harness-design.md)

Closed pre-run SRH sign correction:

- [`research/2026-09-12-storm-motion-srh-sign-correction.md`](research/2026-09-12-storm-motion-srh-sign-correction.md)

---

## 3. Completed path to the current point

Frozen before backend execution:

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
28. Production physics unchanged; backend scientific H1/H2/H3 experiments still **NOT RUN**.

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

**Harness implementation review is complete; formal pre-run SRH sign correction is closed.**

The remaining pre-run gate is review of the correction diff/commit, followed by separate authorization of H1 only. No campaign stage is authorized by this correction slice.

The implemented test-only harness is:

`src/validation/stormMotionSensitivity.validation.test.ts`

It imports existing production backend classes directly and keeps campaign-specific helpers local. Production physics, UI, and DEMO composition remain unchanged.

---

## 6. NEXT ACTION

**Review the correction diff/commit, then separately authorize H1 only.**

Show the completed diff/report before commit or push. H2/H3 are not authorized; H1 must be executed and classified under a separate authorization before considering later stages.

Do not alter production physics, DEMO composition, UI, ScenarioConfig, analytical expectations, synthetic inputs, or frozen tolerances to make the harness pass.

---

## 7. Still open before scientific backend results

Architecture blockers: **none**.

Scientific expectation blockers: **none currently identified**.

Harness-design blockers: **none**.

Remaining gate:

```text
review pre-run SRH correction diff/commit
→ separately authorize H1 only
→ execute H1
→ classify H1 before continuing
→ consider separate authorization of H2
→ execute H2
→ classify H2 before continuing
→ consider separate authorization of H3
→ execute H3 same-point controls + trajectories
→ record frozen metrics
```

After synthetic validation:

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
2. [`research/2026-09-12-storm-motion-validation-harness-design.md`](research/2026-09-12-storm-motion-validation-harness-design.md) — frozen implementation/output contract for the next step.
3. [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md) — frozen scientific protocol and expectations.
4. [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md) — closed implementation-fact audit.
5. [`bugs/README.md`](bugs/README.md) — product defects found while auditing.
6. [`PROJECT_BACKLOG.md`](PROJECT_BACKLOG.md) — broader deferred/unresolved work.
7. [`README.md`](README.md) and [`ARCHITECTURE.md`](ARCHITECTURE.md) — global documentation/architecture map.

The [formal correction record](research/2026-09-12-storm-motion-srh-sign-correction.md) documents the closed pre-run specification issue. Update this status again when the first H1 execution is separately authorized; implementation review and correction closure do not authorize execution.
