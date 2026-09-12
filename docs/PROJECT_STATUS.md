# PROJECT_STATUS

**Role:** current-project status and navigation point. Use this file to quickly understand the active phase, completed milestones, open gates, and next action.

**Not:** a physics or architecture source of truth, a roadmap, a backlog, a schedule, or implementation authorization.

This file is a navigation/status bookmark only. It points to the documents that own decisions and evidence. If this file conflicts with an owning physics, architecture, research, rendering, UI, or review document, the owning document wins.

**Maintenance rule:** update this file whenever a meaningful project step closes, the active phase changes, or `NEXT ACTION` changes. Do not update it for every commit or minor edit. Keep it compact enough that the current project state can be recovered in a few minutes.

**Last status update:** 2026-09-12

---

## 1. Current phase

**Storm-Motion Sensitivity & V1 Validation**

Current status:

```text
PRE-EXPERIMENT PROTOCOL FREEZE
ARCHITECTURE AUDIT CLOSED
NO PRODUCTION CHANGES AUTHORIZED BY THIS STATUS FILE
VALIDATION HARNESS NOT YET STARTED
BACKEND EXPERIMENTS NOT YET RUN
```

V1 itself remains **CLOSED** as the finite validation prototype recorded in:

- [`reviews/2026-08-27-v1-closed.md`](reviews/2026-08-27-v1-closed.md)
- [`architecture/38-v1-scope-checkpoint.md`](architecture/38-v1-scope-checkpoint.md)

The current campaign validates and probes the released V1 model before deciding whether storm-motion sensitivity should become later user-facing work. It does not silently reopen V1 or authorize production feature work.

---

## 2. Current scientific question

The active research asks what changes when the environmental sounding is held fixed and only prescribed storm motion `C` changes.

The working causal separation is:

```text
C changes directly
→ storm-relative wind / hodograph position / SRH /
  streamwise-crosswise decomposition / environmental advection

C does not directly change
→ ground-relative environmental wind q(z)
→ vertical shear
→ environmental horizontal vorticity ω_h
→ prescribed updraft geometry
→ local Eulerian T1 = ω_h · ∇_h w_updraft

C can change indirectly
→ full tracer trajectory X(t)
→ which Eulerian locations the tracer samples
→ sampled w(X(t)) and sampled T1(X(t))
```

Authoritative working protocol:

- [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md)

Closed implementation-fact companion audit:

- [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md)

---

## 3. Completed path to the current point

### V1 baseline

- V1 closed as a kinematic laboratory / finite validation prototype.
- The project does **not** claim to simulate or reconstruct a real supercell.
- Observed/source environmental wind, prescribed storm-local flow, passive tracer advection, and diagnostic Analysis remain semantically distinct.

### Storm-motion research preparation

Completed and frozen before backend execution:

1. C-dependence reasoning and invariance classes established.
2. H1 translation-invariance synthetic control defined.
3. H2 direct C-response / SRH-degeneracy synthetic control defined.
4. H3 path-mediated-response hypothesis and geometry defined.
5. Numerical comparison rules/status vocabulary defined before runs.
6. Existing V1 architecture audited for storm-motion data flow, integration, environmental interpolation, local T1 C-dependence, and SRH implementation.
7. H3 mapped to the real V1 `VerticalEnvelopeUpdraftField` without changing production physics.
8. H3 seed frozen at `X0 = (-3000, 500, 0) m`; it must not be retuned after results to improve contrast.
9. H3 uses the V1 vertical half-sine support `[0, 8000] m`, synthetic horizontal `sigma = 1000 m`, `W0 = 20 m/s`, and no rotation/inflow/outflow/downdraft fields.
10. Path-history / diagnostic sampling semantics frozen: initial sample at `t=0`, then accepted post-step position/time every fixed step (`dt=0.1 s`, stride 1); no FPS sampling/interpolation for primary H3 metrics.
11. Streamwise/crosswise implementation frozen: horizontal-only basis; left-normal crosswise convention; exact horizontal zero is undefined and errors; no epsilon threshold.
12. Exact `y=0` disappearance mechanism confirmed: downdraft tail + below-ground Euler proposal + atmospheric-domain deactivation.
13. Analysis support semantics frozen: height support is profile-relative and inclusive at `[minHeight,maxHeight]`; `OUT_OF_DOMAIN` / `COLUMN_UNAVAILABLE` contain no numeric Analysis T1; legacy `DiagnosticTiltingTendency` remains a distinct API and must not be mistaken for support-aware Analysis evidence.
14. H3 sign-reversal semantics frozen: `1e-6 s^-2` is a material-sign guard, not physical zero; PASS requires opposite material signs across the same near-core passage within the same containing sounding segment; a sampled near-zero point is not required.
15. Synthetic C injection seam frozen: construct `StormRelativeEnvironmentalAdvectionField(environmentField, C_test)` directly; production DEMO composition stays unchanged. H3 uses only storm-relative environmental advection + frozen updraft.
16. **Pre-experiment architecture audit CLOSED.**

Detailed definitions, equations, expected values, PASS/FAIL rules, and caveats live in the two research documents above and must not be reconstructed from this summary alone.

---

## 4. Architecture findings discovered during preparation

### A1 — ground-level tracer / updraft lower lid

The production vertical-envelope updraft is zero at its lower lid (`y=0`). A manually released Explore tracer at exactly `y=0` disappears immediately; `y=1 m` survives. A5 confirmed this as a composite downdraft-tail + atmospheric-domain interaction.

### A2 — unsupported Analysis trajectory can visually resemble T1

Unsupported low-altitude Analysis samples receive no T1 value overlay, so the ordinary first-tracer red identity trail becomes visible underneath. Because red also appears in the T1 value scale, this can be misread as a signed T1 value.

Tracked as a semantic UX bug:

- [`bugs/2026-09-11-analysis-unsupported-segment-looks-like-t1.md`](bugs/2026-09-11-analysis-unsupported-segment-looks-like-t1.md)
- [`bugs/README.md`](bugs/README.md)

### A3 — path-history / diagnostic sampling

**CLOSED / FROZEN.** Production history records post-step accepted positions with post-step laboratory time.

### A4 — streamwise/crosswise implementation

**CLOSED / FROZEN.** Core decomposition uses the horizontal storm-relative direction only, with a left-normal crosswise basis. Exact horizontal `|V_sr|=0` is undefined and explicitly errors.

### A5 — exact `y=0` disappearance mechanism

**CLOSED / CONFIRMED.** Production downdraft support includes `y=0`; its negative Gaussian tail can push a ground-level seed below the atmospheric floor on the first Euler proposal, where the domain policy deactivates it.

### A6 — Analysis support boundary

**CLOSED / FROZEN.** Analysis validity follows each profile's own `[minHeight,maxHeight]`, not a universal laboratory ground threshold. FULL and BOUNDARY are numeric; OOD/COLUMN_UNAVAILABLE are not. Synthetic H3 must explicitly choose its diagnostic path and may not treat legacy out-of-profile zero as Analysis evidence.

### A7 — H3 sign reversal

**CLOSED / FROZEN.** `epsilon_T1 = 1e-6 s^-2` is an experiment-level material-sign threshold. PASS uses opposite material signs on opposite flanks of the same core passage within one containing sounding segment; no sampled zero is required.

### A8 — synthetic C injection seam

**CLOSED / FROZEN.** The harness injects C directly into `StormRelativeEnvironmentalAdvectionField`. No production composer, ScenarioConfig, UI, or physics change is required.

---

## 5. Current step

**Synchronize the now-closed architecture audit into the parent pre-experiment protocol and freeze the minimal validation-harness procedure/outputs.**

The architecture audit itself is complete. The remaining gate is procedural, not architectural.

---

## 6. NEXT ACTION

**Update `research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md` with the frozen A6/A7/A8 consequences, replace the provisional H3 sign-reversal language, record the production-compatible H3 seed/updraft mapping, and freeze the minimal H1/H2/H3 harness procedure before any backend execution.**

No H1/H2/H3 run should occur before that protocol synchronization is committed.

---

## 7. Still open before backend experiments

Architecture blockers: **none**.

Pre-experiment protocol work still required:

- synchronize H3 production-compatible vertical-envelope mapping and seed into the parent protocol;
- freeze the material-sign / same-sounding-segment sign-reversal rule there;
- freeze the chosen synthetic H3 T1 diagnostic-path validity semantics;
- freeze the direct `StormRelativeEnvironmentalAdvectionField(..., C_test)` injection seam;
- define the minimal harness observables/output record and exact execution order.

After those are committed, the intended sequence is:

```text
minimal validation harness
→ H1 backend controls
→ H2 backend controls
→ H3 backend controls
→ observed C-sensitivity matrix
→ compare predictions vs observations
→ classify PASS / FAIL / UNEXPLAINED / INVALID CONTROL
→ validation report
→ only then decide whether production/V1.1 changes are warranted
```

---

## 8. Important guardrails

Do not tune synthetic controls after seeing results merely to make the expected effect stronger.

Do not interpret local Eulerian T1 changes as a direct consequence of `C` unless a new audited implementation path demonstrates one.

Do not use unsupported Analysis samples as numeric zero and do not infer T1 from trajectory color.

Do not conflate legacy `DiagnosticTiltingTendency` out-of-profile zero with support-aware Analysis `OUT_OF_DOMAIN`.

Do not treat exact `|V_sr,h|=0` as zero streamwise/crosswise vorticity; the basis is undefined there.

Do not require a sampled T1 zero for the H3 sign-reversal PASS check; use the frozen material-sign / same-segment rule.

Do not change the production DEMO composer merely to inject synthetic storm motion for validation.

Do not attribute the `y=0` disappearance to the updraft alone; it is a composite downdraft-tail + atmospheric-domain interaction.

Do not treat `PROJECT_BACKLOG.md` as the current roadmap. It is a memory/index of deferred and unresolved work, not an execution order.

Do not treat this file itself as authorization. The owning SoT/research protocol remains authoritative.

---

## 9. Current-state reading order

For a fast orientation to the current project state, read in this order:

1. **This file** — current phase and `NEXT ACTION`.
2. [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md) — parent protocol to synchronize/freeze next.
3. [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md) — closed implementation-fact audit.
4. [`bugs/README.md`](bugs/README.md) — product defects found while auditing.
5. [`PROJECT_BACKLOG.md`](PROJECT_BACKLOG.md) — broader deferred/unresolved work, when relevant.
6. [`README.md`](README.md) and [`ARCHITECTURE.md`](ARCHITECTURE.md) — documentation map and global architectural rules when wider context is needed.

Once the current `NEXT ACTION` closes, update this file in the same project step that selects its successor.