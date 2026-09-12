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
RESEARCH / PRE-EXPERIMENT ARCHITECTURE AUDIT
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

Implementation-fact companion audit:

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
10. Path-history / diagnostic sampling semantics frozen for the experimental harness: initial sample at `t=0`, then accepted post-step position/time every production fixed step (`dt=0.1 s`, stride 1); diagnostics are sampled at the stored `(P,t)` point; no FPS sampling/interpolation for primary H3 metrics.

Detailed definitions, equations, expected values, PASS/FAIL rules, and caveats live in the two research documents above and must not be reconstructed from this summary alone.

---

## 4. Architecture findings discovered during preparation

### A1 — ground-level tracer / updraft lower lid

The production vertical-envelope updraft is zero at its lower lid (`y=0`). A manually released Explore tracer at exactly `y=0` disappears immediately; `y=1 m` survives. The exact deactivation mechanism is still open and is separate from the now-frozen H3 adaptation.

### A2 — unsupported Analysis trajectory can visually resemble T1

Unsupported low-altitude Analysis samples receive no T1 value overlay, so the ordinary first-tracer red identity trail becomes visible underneath. Because red also appears in the T1 value scale, this can be misread as a signed T1 value.

This is tracked as a semantic UX bug:

- [`bugs/2026-09-11-analysis-unsupported-segment-looks-like-t1.md`](bugs/2026-09-11-analysis-unsupported-segment-looks-like-t1.md)
- [`bugs/README.md`](bugs/README.md)

Quantitative validation must use diagnostic support/status and values, never apparent trail hue.

### A3 — path-history / diagnostic sampling

**CLOSED / FROZEN.** Production history records post-step accepted positions with post-step laboratory time. The validation harness will preserve this convention rather than invent a second trajectory-sampling semantics.

---

## 5. Current step

**Continue the pre-experiment architecture audit.**

The next item is intentionally narrow:

```text
Audit the exact streamwise/crosswise implementation
and define behavior at |V_sr| = 0.
```

Why this is next: H1/H2 make analytical predictions about the decomposition, so the implementation convention and zero-relative-wind edge case must be known before those controls are executed.

---

## 6. NEXT ACTION

**Inspect and freeze the existing V1 streamwise/crosswise decomposition implementation, including sign/basis convention and the `|V_sr| = 0` case. Record the result in the storm-motion architecture audit.**

Do **not** start the validation harness or production UI work before this audit step is resolved.

---

## 7. Still open before backend experiments

The current audit still needs to resolve/freeze:

- exact streamwise/crosswise implementation and `|V_sr| = 0` behavior — **NEXT**;
- exact `y = 0` tracer disappearance/deactivation mechanism;
- low-altitude Analysis support boundary relevant to user-authored seeds;
- final H3 T1 near-zero / sign-reversal threshold;
- minimal synthetic `C_A` / `C_B` injection seam that preserves production physics semantics.

After these are closed, the intended sequence is:

```text
minimal validation harness
→ H1/H2/H3 backend runs
→ observed C-sensitivity matrix
→ compare predictions vs observations
→ classify PASS / FAIL / UNEXPLAINED / INVALID CONTROL
→ validation report
→ only then decide whether production/V1.1 changes are warranted
```

---

## 8. Important guardrails

Do not infer project state from an old numbered architecture document alone; check this file, then follow its authoritative links.

Do not tune synthetic controls after seeing results merely to make the expected effect stronger.

Do not interpret local Eulerian T1 changes as a direct consequence of `C` unless a new audited implementation path demonstrates one.

Do not use unsupported Analysis samples as numeric zero and do not infer T1 from trajectory color.

Do not treat `PROJECT_BACKLOG.md` as the current roadmap. It is a memory/index of deferred and unresolved work, not an execution order.

Do not treat this file itself as authorization. The owning SoT/research protocol remains authoritative.

---

## 9. Current-state reading order

For a fast orientation to the current project state, read in this order:

1. **This file** — current phase and `NEXT ACTION`.
2. [`research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`](research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md) — frozen hypotheses, controls, expectations, and experiment protocol.
3. [`research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`](research/2026-09-11-storm-motion-sensitivity-architecture-audit.md) — what the released implementation actually does and which audit items remain open.
4. [`bugs/README.md`](bugs/README.md) — product defects found while auditing.
5. [`PROJECT_BACKLOG.md`](PROJECT_BACKLOG.md) — broader deferred/unresolved work, when relevant.
6. [`README.md`](README.md) and [`ARCHITECTURE.md`](ARCHITECTURE.md) — documentation map and global architectural rules when wider context is needed.

Once the current `NEXT ACTION` closes, update this file in the same project step that selects its successor.