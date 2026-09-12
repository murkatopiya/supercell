# Storm-motion validation harness

Test-only implementation of the frozen [harness design](../../docs/research/2026-09-12-storm-motion-validation-harness-design.md)
and [parent protocol](../../docs/research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md).
Implementation verification is not campaign execution or scientific classification.

Ordinary `npm test` runs infrastructure fixtures only; all four campaign entry points
are skipped unless `STORM_MOTION_VALIDATION_STAGE` selects exactly one stage.
Unknown values fail immediately. No production entry point imports this module.

After implementation review/commit and separate authorization, select one stage
in PowerShell (example for the first H1 run; do not run as part of implementation):

```powershell
$env:STORM_MOTION_VALIDATION_STAGE = 'H1'
try {
  npm test -- src/validation/stormMotionSensitivity.validation.test.ts
} finally {
  Remove-Item Env:STORM_MOTION_VALIDATION_STAGE
}
```

Allowed stages, in required order:

1. `H1`: inspect and classify every discrepancy before selecting H2.
2. `H2`: inspect and classify every discrepancy before selecting H3.
3. `H3-Eulerian`: compare the frozen twelve-point grid.
4. `H3-trajectories`: repeats the same-point gate, then constructs independent A/B
   simulations and collects the frozen discrete metrics.

The selector is an execution guard, not an automated approval/classification system.
Never select a later stage while a preceding blocker is unresolved. The test runner
does not remember human review decisions across invocations. No "all stages" option exists.

Each selected stage emits deterministic JSON before asserting check statuses.
H3 includes the full recorded sample arrays, lifecycle summaries, extrema with sample
provenance, validity counts, core windows, material-sign evidence, discrete transitions,
and same-segment qualification. Output can be large; preserve the stdout as a run artifact
when campaign execution is authorized. Tests never write the scientific Results sections.

Discrepancies with an unisolated cause remain `UNEXPLAINED`; unrealized geometry or
a candidate crossing a segment/support boundary is `INVALID CONTROL`. These statuses
fail the execution gate without asserting a V1 physics failure. `FAIL` is reserved by the
schema for a violated criterion with no known setup issue after classification. Missing
sign evidence alone does not establish the conditional opposite-flank/projection geometry.
Every check preserves its id, expected rule/value, observed evidence, and status.

Contract mapping:

| Frozen requirement | Local implementation |
| --- | --- |
| Profiles, updraft, direct C injection | `profileFor`, `fields` |
| H1/H2 algebraic/Eulerian data and tolerances | `collectEulerianRun`, `invariantChecks`, `runH1`, `runH2` |
| Fixed twelve-point grid | `grid`, `runH3Eulerian` |
| Production Euler, domain, initial + post-step history | `runH3Trajectory`, `recordPath` |
| Core T1 containing-segment gate, null outside profile | `sampleDiagnostics`, `T1Evidence` |
| Discrete extrema, provenance, counts | `extrema`, `runH3Trajectory` |
| Maximal contiguous core window and whole-interval segment check | `corePassage` |
| Material signs, opposite temporal sides, no interpolated zero | `materialSign`, `signReversalCheck` |
| Explicit deterministic check records | `Check`, `reportAndAssert` |

Primary metrics never interpolate. The atmospheric domain's own accepted-position
clipping remains production behavior; terminal time is the recorded post-step clock,
not an interpolated physical crossing time. Tied extrema retain the first sample.
No ordering is asserted for A/B maximum absolute T1.

Implementation fixtures use hand-authored sample records, mocked diagnostic values,
and short constant/time-dependent velocity paths. They do not execute H1/H2 controls
or the frozen H3 trajectories and do not supply scientific campaign evidence.

Resolved pre-run SRH sign correction: canonical [physics doc 09](../../docs/physics/09-storm-relative-helicity.md)
and production `ub*va - ua*vb` agree. The research protocol oracle had the wrong sign;
H2 expectations were corrected from `0,+300,+300` to `0,-300,-300` before any campaign
execution. No production physics was modified. See the [formal correction record](../../docs/research/2026-09-12-storm-motion-srh-sign-correction.md).
Harness implementation review is complete; this correction does not authorize campaign
execution. The stage guard and all other frozen inputs, tolerances, and checks remain intact.

## Implementation verification — 2026-09-12

The following full-suite results belong to the preceding harness implementation slice,
before the formal SRH correction. They are retained as implementation history.

- `npm run typecheck`: passed.
- Dedicated module: 11 infrastructure tests passed; 4 campaign tests skipped.
- Ordinary full suite: 1846 passed, 4 failed, 4 skipped (208 passing files, 4 failing files).
- The same four failures reproduced with only the existing failing modules selected,
  without loading the validation module: 42 passed, 4 failed.
- No tracked production, UI, composition, or protocol file changed. No scientific
  H1/H2/H3 stage was selected, and no campaign Results section was populated.

Existing failures outside this slice:

| Existing test | Mismatch |
| --- | --- |
| `app/exploreObservedEnvironments.wiring.test.tsx:366` | Expects `workbench__column-note` in controls |
| `explore/encodeExploreAnalysisTilting.test.ts:661` | Expects `Analysis T1 along recorded path` copy |
| `explore/resolveExploreHistoricalAnalysisTilting.test.tsx:452` | Expects `not FULL_SUPPORT` copy |
| `ui/tracer/formatTrajectoryTiltingVerification.test.ts:59` | Expects `operand magnitudes`, receives `vector magnitudes` |

Infrastructure numbers are fixture evidence only: two completed 0.1 s steps record
times `[0,0.1,0.2]` and x positions `[0,1,2.01]`; the floor-crossing fixture records its
terminal accepted point `(0.5,0,0)` at post-step `t=0.1`. Mocked diagnostic values
`7`, `123`, and `456` test routing; hand-authored `±2e-6` / `-3e-6` T1 values test
classification and extrema. None is an observed H1/H2/H3 campaign metric. The ordinary
suite also evaluates existing production controls; its outputs are not campaign results.

Formal SRH correction verification: `npm run typecheck` passed; the validation module
with no stage selected passed 11 infrastructure tests and skipped all 4 campaign tests.
No scientific campaign metrics were generated by the correction slice.

Next gate: review the correction diff/report before commit or push, then separately
authorize H1 only. The SRH sign specification issue is closed. H2/H3 remain unauthorized;
inspect and classify H1 before considering a later stage.
