# Storm-motion validation harness

Test-only implementation of the frozen [harness design](../../docs/research/2026-09-12-storm-motion-validation-harness-design.md)
and [parent protocol](../../docs/research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md).
Implementation verification is not campaign execution or scientific classification.

Ordinary `npm test` runs infrastructure fixtures only; all six campaign entry points
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
5. `H4`: separate geometric experiment under parent protocol §13. Selector implemented;
   H4 is CLOSED · INVALID CONTROL; no rerun is authorized. H3 is not rerun by H4.
6. `H5`: new frozen seed control under parent protocol §14; implementation complete,
   implementation review complete/closed; subsequently executed once, human-classified CLOSED · PASS. No rerun authorized.

H4 pre-run design is reviewed/approved and expectations frozen. H4 test-only implementation and implementation review are complete/closed. H4 uses its
own sigma=500 fields, independent analytical Gaussian/B oracle, production world-vorticity
conversion, and local r<=750 passage. Ordered pairs are searched lexicographically;
independent material-oracle crossing prerequisites detect discrepancies even without
opposite observed signs. Discrepancies remain UNEXPLAINED for cause/setup review (FAIL
requires that review); missing valid geometry absent a discrepancy is INVALID CONTROL.
JSON retains all samples, first boundary/independent/qualifying/discrepancy intervals,
whole-interval checks, exact B-zero brackets, adjacent transitions and lifecycle data.
No test runner status is used as a scientific oracle. H4 is CLOSED · INVALID CONTROL; its recorded evidence and frozen inputs remain unchanged.

Initial H4 implementation verification used `npm run typecheck` only. Subsequent review
added 13 H4-specific infrastructure fixtures using hand-authored points and injected T1
readings; no trajectory integration or campaign result is mocked or executed by them.
Cases cover clean reversal, exact B-zero brackets, y=1000 segment ownership, wrong-sign
and neutral-for-material discrepancies, independent prerequisites without observed reversal,
no passage, deterministic first pair, no i_core-straddling requirement, submaterial/zero
endpoints, omega mismatch, tied minima/window boundaries, and discrepancy precedence over
a later clean pair. The unchanged automated classification expression is extracted into
`h4ReviewStatus` so fixtures test the same status path used by `runGeometricStage`.

Dedicated no-stage verification: 24 infrastructure tests passed (13 H4 + 11 existing),
all 5 campaign tests skipped. The stage environment variable was confirmed absent before
invocation. That pre-run verification generated no scientific H4 results. H4 was subsequently separately executed and is CLOSED · INVALID CONTROL. Observed C-matrix remains deferred; production/UI work is not authorized.

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

Current gate: H5 CLOSED · PASS (human scientific classification); manual closure documentation review. See parent protocol §15 for the single frozen execution evidence, separate harness status and runner outcome. H4 CLOSED · INVALID CONTROL; H1/H2/H3 history unchanged. After documentation review/commit, observed C-matrix protocol design may proceed; execution and production/UI work remain unauthorized.

## H5 implementation review handoff

H5 uses `runGeometricStage` with only seed z changed to +225 m. H4 retains its original seed and numerical boundary evaluation. `h5Sample` records S=x+4*z and uses B=-0.002*S with the unchanged independent analytical T1 oracle. `h5Prediction` records S0=-2100, dS/dt=10 and conditional t_B0=210 s; this time is descriptive analytical metadata, never a PASS check. No exact sampled zero, interpolation, B epsilon or new tolerance is introduced.

Passage, lexicographic evidence selection, independent-prerequisite checks and discrepancy precedence share the frozen H4 helpers. H5 check ids are prefixed H5; H4 records/classification remain unchanged. FAIL still requires isolated cause/setup review; automated discrepancies remain UNEXPLAINED.

Nine H5 hand-authored fixtures cover selector isolation, both seeds, S0/conditional crossing, first-segment advection derivative, time-only rejection, lexicographic reversal without sampled zero, support/material/geometry invalid controls, discrepancy without observed reversal, and discrepancy precedence over a later clean pair. These fixtures do not integrate an H5 trajectory.

Verification: `npm run typecheck` passed; dedicated validation with STORM_MOTION_VALIDATION_STAGE absent passed 33 infrastructure tests and skipped all 6 campaign stages. That pre-run verification generated no H5 observed results. After separate authorization, H5 executed once: harness PASS, seven checks PASS; Vitest 34 passed / 5 skipped, no technical runner errors. Human classification is H5 CLOSED · PASS; see parent protocol §15. No rerun is authorized. Observed C-matrix is deferred; production/UI work is not authorized.
