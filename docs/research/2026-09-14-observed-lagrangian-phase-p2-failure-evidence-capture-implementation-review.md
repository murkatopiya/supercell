# P2 failure-evidence capture — implementation review

**P2 FAILURE-EVIDENCE CAPTURE — IMPLEMENTED · AWAITING HUMAN REVIEW**

Implemented the [approved observability design](2026-09-14-observed-lagrangian-phase-p2-failure-evidence-capture-design.md) using an opaque optional capture context, private append-only journal and thin operation facade. Scientific results remain separate. This is not “Slice 7”, a qualification runner, a persisted artifact contract implementation, or an execution grant.

## Authority and baseline

Branch `main`; HEAD remains `52a9fcce7554504efc8bf540910c2529f18c770f`. Human design review is CLOSED · APPROVED by the current instruction. The frozen authority remains `observed-lagrangian-phase-p2-qualification/v1`. SHA-256 of the exact working-file bytes of [the frozen specification](2026-09-13-observed-lagrangian-phase-p2-qualification-specification.md) was verified as `fe5a33f8753b7538e5c3abdd2fe9f5766a2bdcefd08bfab07e6ced34bcfae59b`; the new authority test verifies it too. No scientific/specification conflict was identified.

The existing untracked design document and six historical files (`e1-first-d158482.evidence.json`, `.execution.json`, `.stderr.txt`, `.stdout.txt`, `h4-output.txt`, `h5-output.txt`) were present before implementation. They remain untouched and are excluded from the implementation line counts. No historical result was used to choose an expectation or tune an algorithm. The index is unchanged; no commit or push was performed. This is not an execution clean-tree attestation.

## Exact implementation diff

Counts are Git added/deleted physical lines relative to the reviewed checkpoint for tracked files, and full physical lines for additions. Replacing a line with a capture-wrapped expression counts as both deletion and addition; it does not mean the scientific expression was removed. All paths below are repository-relative.

| File | Added | Deleted | Scope |
|---|---:|---:|---|
| `src/validation/lagrangianEstimator/arithmetic.ts` | 234 | 148 | Arithmetic sites, nested finite failures, accumulator context and commit evidence |
| `src/validation/lagrangianEstimator/comparison.ts` | 284 | 183 | Comparison/refinement input, intermediate and completed-prefix sites |
| `src/validation/lagrangianEstimator/comparison.validation.test.ts` | 1 | 1 | Add only `./capture.js` to the exact import allowlist |
| `src/validation/lagrangianEstimator/exposure.ts` | 73 | 61 | Local contributions, named signed/absolute streams, rejection propagation |
| `src/validation/lagrangianEstimator/history.ts` | 148 | 113 | Native/common prefixes, endpoint work, named residual/reference/duration streams |
| `src/validation/lagrangianEstimator/partition.ts` | 74 | 60 | Ordered candidates, generated versus accepted nodes, support/evaluation/coverage sites |
| `src/validation/lagrangianEstimator/path.ts` | 43 | 29 | Input validation, lookup and computed interpolation sites |
| `src/validation/lagrangianEstimator/providers.ts` | 85 | 57 | Factory checks and adapter ordinary/explicit/evaluator/oracle evidence |
| `src/validation/lagrangianEstimator/types.ts` | 3 | 2 | Type-only context import and optional ordinary/explicit context parameters |
| `src/validation/observedLagrangianPhaseP2Controller.ts` | 359 | 269 | Preparation/planning/evaluation/assessment/selection prefixes and context forwarding |
| ADD `src/validation/lagrangianEstimator/capture.ts` | 104 | 0 | Opaque scopes, private journal, contained failure injection, immutable snapshots |
| ADD `src/validation/lagrangianEstimator/capture.validation.test.ts` | 189 | 0 | 30 generated-prefix and recorder-safety developer tests |
| ADD `src/validation/p2Qualification/failureCapture.ts` | 82 | 0 | Operation facade, lossless original-input capture and pure failure-data projection |
| ADD `src/validation/p2Qualification/failureCapture.validation.test.ts` | 256 | 0 | 23 baseline-projection, facade/controller and dependency developer tests |

Source/test diff: **14 files; 1,935 added lines, 923 deleted lines**. Of these, 10 are edits to reviewed files and four are new files. This review document adds **153 lines**, for a total implementation deliverable of **15 files; 2,088 added lines, 923 deleted lines**. The earlier design document is not a new implementation addition.

The other five existing estimator regression files, controller regression file, evidence-foundation files, registry, independent rational-reference helper, P2Spec/E1 literals, package scripts, lockfile and configuration were not edited. Production/core/UI/data/physics files and frozen specifications have no diff. `git diff --check` is clean.

## Implemented boundary and generated-prefix representation

`createCapture` returns an opaque context with no caller methods or sink. Module-private WeakMaps bind scopes and accumulator owners to journal state. The accumulator has no new enumerable property: its existing `s`, `c`, `failure` instance shape remains unchanged. `enterCapture` creates invocation-local parent/call IDs. `captureValue` is an identity function on the scientific value while snapshotting evidence into private storage. `closeCapture` returns a detached frozen journal and closes every scope sharing that journal.

Each event retains sequential order, invocation/parent identity, source site and copied value. Site suffixes distinguish inputs, local values, callback results, assignments, calls, returns, catches and throws. Stable site labels are observational identifiers; they never dispatch numerical work. Full branch predicates and successful-result schema construction remain the existing code. Named accumulator scopes distinguish signed/absolute exposure and residual/reference/duration history work. Last completed instrumented sites and pending child calls are inspectable from this ordered journal; no wall-clock or VM-instruction claim is made.

The journal records original ordered boundary indices after downward reversal, loop boundary identity, actual lambda/time/position, previous node, generated push operands and accepted node counts recorded after push. A first collapsed crossing retains only the accepted start node and first generated candidate. A later collapse retains its earlier accepted internal node. No endpoint node or unvisited candidate value is generated to improve evidence. A scaled-product exponent overflow retains the computed exponent/mantissa state, without inventing a final Infinity that the algorithm never formed.

History common-event entries are retained before the final sorted `nodes` array exists. Map/flatMap result instrumentation retains completed elements when a later element throws, including comparison rows and controller grouping/requirement prefixes. Existing full success traces remain unchanged. Parent and child events retain the original failure even when an outer return uses a different operation, such as partition duration-bound or controller estimator-incomplete mapping.

Snapshot storage reuses detached copies only for recursively immutable data, avoiding repeated copying of frozen paths/results. Mutable arrays/records are copied at the observation point. Functions, accessors, cycles and nonplain instances are represented as explicitly unavailable in the diagnostic journal; their callbacks or internals are never executed to obtain evidence. This journal policy does not broaden the stricter original-input codec. The external declared recipe is still needed to describe an evaluator reproducibly.

`captureFailure` dispatches only a named existing operation, once, with optional context. It returns `{ result, capture }`; `result` is the actual existing return, preserving controller seals and provider objects. Original declared data is tagged before invocation/normalization. An unencodable declaration records incomplete input without suppressing the scientific call. A thrown scientific exception passes through unchanged; the journal is closed in `finally`, with no retry or fabricated typed return.

`failureCaptureData` provides pure data, not files: tagged original/result/journal data, capture completeness/reasons, exact authority denial, and explicit null affected exposure/history estimates. Partial forensic values remain inside the tagged journal. Implementation and runtime identity are explicitly NOT_BOUND. This data is not a completed persisted envelope, certificate, manifest or reconstruction attestation.

## Projection-invariance audit

The new test extracts the exact reviewed Git sources into `tmp/p2-reviewed-baseline` using a local Git archive. Only the isolated estimator/controller modules needed by artificial tests are imported. There is no copied numerical algorithm in the recorder or assertion code, and no campaign module is imported or executed by the baseline test. Development editing helpers and isolated sources remain ignored scratch files under `tmp`, not runtime dependencies or deliverables.

Eight whole-module AST projection tests cover every edited runtime algorithm file. Their eraser removes only capture imports, context parameters/forwarding, recorder statements/wrappers, and the recorder-only accumulator constructor. It compares the remaining syntax structure against checkpoint `52a9fcc`, retaining binary operator nesting, unary operators, statement/call order, variable declaration kind, conditions and object fields. Thus it checks more than a list of selected numeric outcomes. This is a source-level proof aid, not a proof of arbitrary JavaScript engines or impure callbacks.

Runtime tests additionally compare losslessly tagged results against those isolated reviewed modules, with capture both disabled and enabled. Cases include upward/downward success, 33 internal boundaries, both collapse failures, nonfinite evaluator output, exposure/allowance accumulation overflow, history, ordinary evaluation, comparisons and opposite-sign local integration. Tagged comparison preserves all binary64 bits exposed by the runtime, including negative zero, rather than relying on JSON's numeric normalization.

Controller runtime comparison builds artificial accepted samples through real preparation/planning/evaluation/assessment APIs. It compares results and actual evaluator/ordinary call sequences against the isolated controller, including propagated ordinary rejection and late planning/assessment failures. Separate late-selection tests use real sealed assessments from artificial initial-invalid runs and demonstrate retained grouping progress before a late ledger rejection. Existing controller tests still cover all frozen selection and incompleteness precedence decisions.

No scientific result union/schema gained capture fields. Optional context arguments and private storage are the added API plumbing; scientific operands retain their original order. Support/ownership, eligibility, short-circuiting, candidate/duration/dt literals, tolerance expressions and successful scientific output structure are unchanged. The result of the eight projection tests and runtime comparisons supports the unchanged-semantics claim within the reviewed plain-data/pure-provider and binary64 contract.

## Provider-call and arithmetic-order audits

Provider evidence records actual call sites and adapter entry/return/exception sites. These are distinct layers, so a caller attempt and nested adapter entry must not be counted twice as a single method call. Evaluator and ordinary oracle have separate begin/return sites. No calls are made solely to obtain evidence.

- Partition start rejection still suppresses the end call.
- Controller pointwise evaluation still computes coarse and fine ordinary results before checking coarse status. The isolated-baseline test verifies both calls on each rejected row.
- Controller exposure still eagerly maps selected steps into partitions before integrating and checking input rejection.
- History still performs native partitions before its common-node own-path evaluations, with the same role/endpoint ordering and foreign-node geometry.
- Ordinary oracle remains conditional on explicit success. Actual nonfinite, throw and conformance-mismatch tests verify that it is not called when explicit evaluation fails.
- Provider evaluators/ordinary-oracle closures do not retain a construction-time recorder. `segmentValue` and its scientific closure bodies remain unchanged; query-time capture occurs at the existing adapter boundary. Imported physics functions were not edited or sampled again.

Arithmetic capture wraps already-evaluated operands/results at their existing sites. It does not expand or reassociate formulas. Nonfinite arguments are captured on entry to the existing finite guard, before that guard returns a typed failure. Scaled mantissa multiplication, exponent handling, subnormal/ties-even rounding and signed-zero normalization are unchanged.

Neumaier pre-s/pre-c/x, local t/difference/r/correction, actual assignment sites and post-commit s/c are separately retained. Tests demonstrate that a failed second add never appears as a committed update and sticky failures return unchanged. `add`, `total`, allowances and geometry helpers are never invoked for diagnostics. Existing eager computations, including partition total and bound, remain eager. All 56 reviewed arithmetic regressions still pass.

## Recorder failure containment and immutability

All recorder operations invoked by scientific code contain their own exceptions. Snapshot/append failure sets private failed state and disables subsequent recording; it never enters a provider/arithmetic scientific catch. The existing scientific value is returned from `captureValue` even when recording fails. Scope creation and accumulator binding are also contained; journal closure returns explicit incomplete evidence on recoverable failure.

`injectCaptureFault` is deterministic test plumbing affecting only private recorder state. It accepts an event count, not a callback. Tests inject failure at multiple event positions and compare the exact result and provider-call sequence; they also exercise an injected failure inside ordinary adapter work and during controller preparation. An escaped custom provider exception remains the identical exception object, with exactly one call and no retry/retyping. The facade likewise leaves an escaped profile exception escaped.

Mutation tests show detached/frozen returned snapshots, unchanged negative-zero and sparse-array evidence, no accessor/function invocation, independent nested/root contexts and no appends after closure. The private journal is not exposed to scientific code; no supplied object is frozen or mutated by capture. Existing algorithm-owned freezes/clones remain the reviewed ones.

## Failure-taxonomy coverage and developer tests

| Approved failure class | New evidence/tests and retained baseline checks |
|---|---|
| Path construction/lookup/interpolation | Rejected original vertices, indices/operands, actual theta/nonfinite position; parameterized nonfinite input and overflow tests |
| Provider creation/evaluation | Duplicate topology input; explicit nonfinite/throw; ordinary conformance; support/domain and no-oracle guards; existing artificial Source/Analysis regressions |
| Partition/crossing construction | First collapse, second internal collapse, descending boundary order, accepted count, generated support-rejected geometry and no premature provider calls |
| Local arithmetic/allowance | Product exponent overflow, nonfinite guard operand, allowance division overflow, prior computed allowance; all existing binary64 tests retained |
| Exposure accumulation | Contribution prefix, named streams, pre/committed s/c, sticky failure; propagation into comparison without final estimates |
| History | Partial common-event map/native partitions, foreign-node failure, actual endpoint contexts, child causes and arithmetic prefix |
| Comparison/refinement | Earlier geometry residual before overflow, nested exposure rejection; full-module projection and existing refined-budget/typing tests |
| Controller preparation/planning | Original inputs, prefix state before late termination error, ordered match progress before duplicate run failure |
| Controller evaluation/assessment | Exact eager ordinary calls, real estimator propagation, completed entries before late invalid schema/context rejection |
| Controller selection | Real sealed initial-invalid assessment ledger, late duplicate/missing grouping failure with retained earlier matches; existing candidate precedence tests |
| Cross-cutting evidence/safety | Five-repeat tagged-byte determinism, equivalent key order, holes/undefined/absent/-0 distinction, frozen snapshots, no callback/replay, injected recorder failures, escaped exceptions, dependency checks |

Authorized full regression command:

```text
npm test -- src/validation/lagrangianEstimator src/validation/p2Qualification/evidence.validation.test.ts src/validation/p2Qualification/failureCapture.validation.test.ts src/validation/observedLagrangianPhaseP2Controller.validation.test.ts
PASS — 9 files, 387 tests

npm run typecheck
PASS
```

Breakdown: 56 arithmetic + 35 partition/path/provider + 38 exposure + 42 history + 52 comparison + 41 controller = **264 reviewed Slice 1–6 tests**; **70 evidence-foundation tests**; **53 new capture tests** (30 + 23). Runtime was Node `v22.14.0`, V8 `12.4.254.21-node.22`; Vitest reported `3.2.7`. The final full run took 37.24 seconds. After the final metadata-only stream-label clarification, both capture files were rerun: **53/53 PASS**, including all eight projection tests and both isolated-runtime comparisons. No scientific expression changed after the full pass.

During development, a static case-hardcoding check initially matched numeric site labels; the labels were changed without weakening that check. Only its exact new import allowlist was extended. Adding completed map-element evidence required the test eraser to recognize recorder-only comma sequences; runtime comparisons already passed, and the corrected structural checks pass. A late-selection test exposed missing callback-result capture, which was added observationally. These were instrumentation/test-development corrections, not adjusted scientific expectations.

## Tagged malformed-input behavior and dependency audit

`encodeRejectedInput`/`decodeRejectedInput` and canonical encoding are reused unchanged. Original declarations are encoded before invocation, preserving NaN/Infinity/-Infinity/-0 bits, sparse holes, own undefined versus absent properties, null and order. Ordinary canonical JSON is never used to normalize rejected scientific inputs. Explicit tags carry raw nonfinite result/intermediate data; null affected estimates are a separate typed output statement.

Unsupported original declarations (functions/accessors/cycles/nonplain objects, etc.) retain the foundation's rejection policy and produce input incompleteness. An accessor test proves the getter is not called. Arbitrary proxies and callback internals are not a supported lossless input channel. The journal's unavailable markers do not pretend to serialize an evaluator; callers must supply its original artificial data/recipe.

The generic `capture.ts` has **no imports**, I/O, clock, randomness, environment flags, provider logic, campaign names or controller dependency. Estimators import only this new generic observational module; none imports `p2Qualification`. The thin facade imports the reviewed estimator/controller operations and existing pure evidence codec. Existing provider production-diagnostic imports are unchanged; no new observed loader or profile processing route was introduced.

Static tests reject filesystem/campaign/Simulation/environment dispatch in the new runtime boundary. The only new filesystem use is developer-test read/extraction of repository baseline sources into ignored `tmp`, not a qualification artifact writer. No observed profile, Simulation campaign, E1/H/P execution, synthetic qualification/certification, stage selector or reconstruction verifier was run or added.

## Deviations, limitations and remaining gates

The journal uses generic typed site/value events rather than a new field on each scientific rejection. Completed map elements and explicit post-commit/node-acceptance records supplement existing traces. This is the approved separate observational channel; result shapes remain unchanged. Snapshot sharing of recursively frozen data is a storage optimization only.

Capture completeness means the enabled journal retained the generated instrumented prefix without recorder failure. It does not validate a caller's declared provider recipe, prove that arbitrary declarations match executable closures, bind a runtime implementation, or certify a fixture. `failureCaptureData` deliberately leaves implementation/runtime identity NOT_BOUND; later reviewed envelope assembly must require those identities, recipe/input bindings, inventory and exact-byte artifacts before claiming complete persisted evidence. The foundation envelope schema/registry remain unchanged.

Custom evaluator internals, arbitrary proxy behavior and nondeterministic thrown-object internals are unavailable. Exceptions outside the reviewed scientific result contracts remain exceptions; the thin facade closes but does not return `{result,capture}` on a throw. Callers needing that prefix can use the explicit context with the existing operation and close it in their own invocation boundary; no fake result or automatic recovery is supplied.

There is no event truncation or fixed crossing cap. Retaining full traces uses memory and adds allocation/runtime overhead. Frozen snapshot reuse reduces repeated deep copying; exported tagged data may still repeat shared evidence. No claim of zero timing/GC overhead, cross-engine equivalence, hostile-intrinsic robustness, or complete survival after fatal OOM/process termination is made. Recoverable recorder failure is explicitly incomplete and has been fault-tested.

No scientific/numerical semantic change was identified by source projection, runtime comparison or the reviewed regression suite. **SPECIFICATION_IMPLEMENTATION_CONFLICT — NONE IDENTIFIED.** Implementation review remains a human gate; it does not authorize a runner, writer, verifier, observed collector/loading, campaigns, main L1, material-response thresholds, production/core/UI changes, commit or push.

P2 FAILURE-EVIDENCE CAPTURE — IMPLEMENTED · AWAITING HUMAN REVIEW

PHASE P2 SYNTHETIC QUALIFICATION — NOT YET CERTIFIED

PHASE P2 SCIENTIFIC EXECUTION — NOT AUTHORIZED

MAIN L1 — NOT AUTHORIZED / NOT TESTED

MATERIAL RESPONSE THRESHOLDS — STILL OPEN

PRODUCTION/UI — UNCHANGED

**STOP FOR HUMAN REVIEW.**
