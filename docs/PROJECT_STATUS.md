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
PRE-EXPERIMENT HARNESS DESIGN
ARCHITECTURE AUDIT CLOSED
PARENT RESEARCH PROTOCOL ARCHITECTURE-SYNCHRONIZED
NO PRODUCTION CHANGES AUTHORIZED BY THIS STATUS FILE
VALIDATION HARNESS NOT YET IMPLEMENTED
BACKEND EXPERIMENTS NOT YET RUN
```

V1 itself remains **CLOSED** as the finite validation prototype recorded in:

- [`reviews/2026-08-27-v1-closed.md`](reviews/2026-08-27-v1-closed.md)
- [`architecture/38-v1-scope-checkpoint.md`](architecture/38-v1-scope-checkpoint.md)

The current campaign validates and probes the released V1 model before deciding whether storm-motion sensitivity should become later user-facing work. It does not silently reopen V1 or authorize production feature work.

---

## 2. Current scientific question

The active research asks what changes when the environmental sounding is held fixed and only prescribed storm motion `C` changes.

Working causal separation:

```text
C changes directly
→ storm-relative wind / hodograph position / SRH /
  streamwise-crosswise decomposition / environmental advection

C does not directly change
→ ground-relative environmental wind q(h)
→ vertical shear
→ environmental horizontal vorticity ω_h
→ prescribed updraft geometry
→ local Eulerian T1 = ω_h · ∇_h w_updraft

C can change indirectly
→ full tracer trajectory X(t)
→ which Eulerian locations the tracer samples
→ sampled w(X(t)) and sampled T1(X(t))
```

Authoritative research protocol:

- [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md)

Closed implementation-fact companion audit:

- [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md)

---

## 3. Completed path to the current point

Frozen before backend execution:

1. C-dependence/invariance reasoning established.
2. H1 translation-invariance control frozen.
3. H2 direct C-response / iso-SRH control frozen.
4. H3 path-mediated hypothesis and geometry frozen.
5. H3 mapped to production `VerticalEnvelopeUpdraftField` with `sigma=1000 m`, `W0=20 m/s`, vertical support `[0,8000] m`, and no rotation/inflow/outflow/downdraft.
6. H3 seed frozen at `X0=(-3000,500,0) m`; no post-hoc retuning.
7. At the actual 500 m initial height, H3 uses `q=(19,9) m/s`, hence `r_A=(14,+1)` and `r_B=(14,-4)` for the two frozen storm motions.
8. Explicit Euler and `dt=0.1 s` frozen.
9. Path-history sampling frozen: initial point plus accepted post-step position/time every fixed step; no FPS sampling/interpolation for primary metrics.
10. Streamwise/crosswise basis/sign convention and exact-zero domain frozen.
11. Exact `y=0` tracer disappearance mechanism confirmed.
12. Analysis support semantics frozen; synthetic core T1 and support-aware Analysis remain distinct APIs.
13. Synthetic H3 T1 path frozen to core `DiagnosticTiltingTendency`, with explicit containing-segment validity gating; out-of-profile legacy zero is excluded from T1 evidence.
14. H3 sign-reversal semantics frozen: `epsilon_T1=1e-6 s^-2` is a material-sign guard, not physical zero; PASS requires opposite material signs across the same near-core passage within one containing sounding segment; no sampled zero is required.
15. Synthetic C injection seam frozen: construct `StormRelativeEnvironmentalAdvectionField(environmentField, C_test)` directly; production DEMO composition remains unchanged.
16. H3 minimal total field frozen as storm-relative environmental advection + synthetic updraft only.
17. H3 geometry radius uses world horizontal `(x,z)`, not vertical `y`.
18. H3 same-point control heights are `y=500,1500,2500 m`.
19. Architecture audit **CLOSED**.
20. Parent pre-experiment protocol updated to incorporate all closed-audit consequences and obsolete H3 assumptions removed.

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

**Design and freeze the minimal validation harness procedure and output contract.**

The scientific expectations, architecture mapping, numerical tolerances, diagnostic-path semantics, and C injection seam are now synchronized in the parent protocol.

The remaining pre-run gate is procedural: specify exactly what the harness constructs, executes, records, and emits for H1/H2/H3 without adding production feature work.

---

## 6. NEXT ACTION

**Define the minimal H1/H2/H3 validation-harness structure and exact result schema/observables, then commit that procedure to the parent protocol before implementing or executing the harness.**

No H1/H2/H3 backend run should occur before that harness contract is frozen.

---

## 7. Still open before backend experiments

Architecture blockers: **none**.

Scientific expectation blockers: **none currently identified**.

Remaining pre-run work:

- freeze harness construction for H1/H2/H3;
- freeze exact observables/result record per run;
- freeze how PASS / FAIL / UNEXPLAINED / INVALID CONTROL are emitted and aggregated;
- freeze execution order and output persistence/location;
- only then implement the smallest harness and execute H1 → H2 → H3.

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

Do not change production DEMO composition merely to inject synthetic storm motion.

Do not attribute the `y=0` disappearance to the updraft alone.

Do not treat `PROJECT_BACKLOG.md` as the current roadmap.

Do not treat this file itself as implementation authorization.

---

## 9. Current-state reading order

1. **This file** — current phase and `NEXT ACTION`.
2. [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md) — frozen pre-experiment scientific protocol and next harness-design gate.
3. [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md) — closed implementation-fact audit.
4. [`bugs/README.md`](bugs/README.md) — product defects found while auditing.
5. [`PROJECT_BACKLOG.md`](PROJECT_BACKLOG.md) — broader deferred/unresolved work.
6. [`README.md`](README.md) and [`ARCHITECTURE.md`](ARCHITECTURE.md) — global documentation/architecture map.

When the harness contract is frozen, update this file in the same project step that selects the first implementation action.