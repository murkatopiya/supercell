# Phase P2 Slice 6 — controller/protocol design and authorization boundary

Design submitted for human approval. Implementation has not started. This document does not grant observed execution authority.

Baseline: `main @ a911e5c8283b960ce50c4b0bf69e44dbd90ac982`; implementation Slices 1–5 CLOSED · APPROVED per the current reviewed checkpoint. The authoritative [frozen specification](2026-09-13-observed-lagrangian-phase-p2-qualification-specification.md) is `observed-lagrangian-phase-p2-qualification/v1`, SHA-256 `fe5a33f8753b7538e5c3abdd2fe9f5766a2bdcefd08bfab07e6ced34bcfae59b` (verified during this design inspection). This companion document does not amend it.

## Scope

Slice 6 is a validation-local, deterministic, in-memory protocol controller over supplied accepted-path, support, lifecycle, oracle and comparison evidence. It decides what evidence is required, selects conservative comparison intervals, wires the reviewed estimators/comparators, and applies frozen admission order. It does not collect trajectories or launch a campaign. Artificial controller tests may exercise the fixed protocol matrix without loading observed profiles or integrating an observed trajectory.

The current `lagrangianEstimator/comparison.ts` consumes prepared evidence and does not establish campaign completeness or eligibility. Those responsibilities belong here. Historical `observedLagrangianPhaseP.ts` is a read-only semantic reference, especially `primaryAfterStep`, `prefixTime`, `commonTime`, `checkFirstStepOracle`, `evaluateSeed`, and `selectQualifiedCandidate`; do not import its collector or reuse its superseded trapezoidal estimators. The historical spec object also contains replaced estimator policies and P identities, so it must not be relabeled wholesale as P2.

## Required responsibilities

| Responsibility | Contract and authority |
|---|---|
| Protocol identity and fixed plan | Bind the exact P2 ID/hash and explicitly inherited E1 literals, member order, seed ensemble, durations, ladder and representation roles. Validate unique complete case/member/seed/resolution identities; 640 is a protocol count, never an estimator limit. No new numeric dispatch by case inside generic primitives. P2 §§2,3,17. |
| Eligibility and irreversible prefixes | Consume validated stored samples and complete step support/lifecycle metadata, including interior support traversal and owned endpoint contacts. Reject the whole exit, clipped or otherwise ineligible step. First Analysis loss permanently closes ESC primary; Source continuation remains secondary only. No fractional recovery, re-entry restoration, unsupported zero or extrapolation. Moore Analysis remains typed N_A. P2 §§7,8; inherited P §§11,12,19. |
| Interval planning | For each case/seed/candidate take the minimum eligible endpoint across all five members and the three required resolutions, clip to T and align downward to candidate h. Both pairs use exactly this physical interval, with distinct native paths. Empty/nonpositive intervals are ineligible. Separately require full duration T at all four resolutions for admission. Preserve pairwise all-member prefix stability checks. P2 §§8,16,17. |
| Evidence preparation and wiring | Match geometry, baseline response and ordinary pointwise operands only at stored common coarse times; validate ticks, order, identities and complete coverage. Pass the planned interval and typed role to native exposure and common-partition history. Preserve historical crossing brackets separately from interpolated partition events, including closed exclusion windows. Invoke Slice 5 comparisons and non-worsening with complete required metric sets; missing mandatory history/exposure cannot disappear from aggregation. P2 §§10,11,16. |
| Oracle and lifecycle protocol | Apply the inherited first-step oracle to supplied first-step displacements, exact member C values and initial velocities at all four resolutions. Immediate clipping rejects viability; discrepancy is UNEXPLAINED. Prepare lifecycle checks through requested T, retaining all causes and earliest-bracket grouping; diagnostic crossings are not lifecycle residuals. Numerical history uses the common eligible interval, not the lifecycle horizon. P2 §§16,17; inherited P §§10,19 and reviewed `evaluateSeed`. |
| Representation applicability | Require ESC Analysis-primary and applicable Source-secondary checks separately, and Moore Source with Analysis N_A/COLUMN_UNAVAILABLE. Permit only explicit allowed N_A reasons (including baseline self-response and no segment-matched point samples). Secondary success cannot repair primary loss; pointwise N_A cannot waive history/exposure. P2 §§8,16,17. |
| Admission and candidate selection | Require all eight seeds, four cases, five members, all-four-resolution duration viability, both required numerical pairs and their non-worsening checks. Evaluate fixed order (540,0.5), (540,0.25), (360,0.5), (360,0.25), (180,0.5), (180,0.25); first globally qualified candidate wins. No deeper ladder, subset selection or outcome-based tuning. P2 §17. |
| Status and decision evidence | Keep run completeness, support, seed/resolution admission and control outcomes distinct. Complete valid exhaustion yields INVALID CONTROL; malformed/missing/ambiguous/nonfinite evidence yields incomplete qualification; oracle/configuration discrepancy remains UNEXPLAINED; SPECIFICATION_CONFLICT blocks progression for review. Do not skip an unresolved blocker to choose a later candidate. Keep affected numeric values null and partial evidence explicitly partial. Return ordered reasons, requirements, interval/identity references and retained estimator traces; no main-science contrasts or ranking. P2 §§14,17; inherited P §§18,19. |

## Implementation shape and limits

Proposed new files: `src/validation/observedLagrangianPhaseP2Spec.ts`, `src/validation/observedLagrangianPhaseP2Controller.ts`, and `src/validation/observedLagrangianPhaseP2Controller.validation.test.ts`. Keep campaign identities and policy outside `lagrangianEstimator`. Any necessary shared type additions must be narrow and justified; changes to approved numerical semantics require separate review, not incidental refactoring.

Use explicit immutable input/output contracts for supplied run evidence, per-step eligibility, candidate plans, comparison requirements/results and decision reasons. Validate result bindings to the requested run/member/channel/interval and completeness before accepting PASS. Separate pure planning, estimator/comparator dispatch, and final aggregation so each can be tested without simulation. No environment switch, campaign CLI, observed fixture loader, simulation constructor, file-system preflight, artifact writer or execution-enabling entry point is included.

Execution authority, reviewed implementation SHA/runtime lineage, synthetic qualification attestation, clean-tree/input/output preflight, canonical persisted campaign artifact schemas and trace reconstruction/persistence remain future integration gates. Slice 6 may record the P2 authority identity and return in-memory evidence, but cannot claim those execution gates are satisfied. Full trace persistence and the complete independent P2 synthetic prerequisite must be reviewed before any separately authorized observed execution; controller unit tests do not certify them.

## Required artificial verification

- Exact candidate ordering, first globally qualified selection, complete exhaustion, and global rather than per-case selection.
- Missing, duplicate, foreign or mismatched identities/results; a missing mandatory check cannot pass via an empty list. Incomplete evidence cannot become INVALID CONTROL or be bypassed by a later candidate.
- All-eight admission and all-four-resolution duration requirement, including loss at the fourth resolution outside the candidate's comparison triple.
- Whole-step rejection for interior Analysis loss, isolated ineligible knot contact, Source exit and ground clipping; irreversible loss despite later support; no substep recovery.
- Minimum across five members and three resolutions, downward alignment, identical intervals for both pairs, empty interval and distinct lifecycle/requested-T horizon.
- ESC primary/secondary separation; Moore unavailable Analysis; allowed pointwise and baseline N_A; mandatory history and signed/absolute exposures.
- Stored-time matching, response baseline identities, unchanged crossing brackets/exclusions, all-member prefix checks, lifecycle co-events and first-step oracle discrepancy/clipping behavior.
- At least one artificial end-to-end controller path through actual Slice 1–5 functions, alongside prepared-result fixtures for rejection/selection logic. Verify finer-pair budgets and required metric coverage without duplicating numerical algorithms.
- Deterministic in-memory decisions and retained trace references, no input mutation, no observed imports or execution side effects. Run targeted synthetic controller tests, relevant existing estimator regressions and typecheck after implementation; do not run campaign-selected tests.

## Proposed authorization decision

Approve implementation of Slice 6 only as bounded above: pure validation-local controller/protocol wiring and artificial verification. Approval does not close implementation review, certify full synthetic qualification, pin an execution implementation SHA, or authorize observed scientific execution. Implementation review remains a separate gate after the concrete diff and checks are available.

Pending that human decision, Slice 6 implementation is NOT AUTHORIZED by this document. No specification conflict requiring a scientific rule change was identified during this design inspection; any discovered contradiction must stop the affected work for review.

PHASE P — CLOSED · INVALID CONTROL. P2 specification — FROZEN · HUMAN REVIEW APPROVED. Slices 1–5 — CLOSED · APPROVED. P2 observed scientific execution — NOT AUTHORIZED. MAIN L1 — NOT AUTHORIZED / NOT TESTED. Material response thresholds — STILL OPEN. Production/UI — UNCHANGED. E1/H1–H5 and historical Phase P reruns are excluded.
