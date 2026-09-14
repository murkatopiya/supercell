# Phase P2 qualification readiness / execution gate design

**PHASE P2 QUALIFICATION READINESS DESIGN — AWAITING HUMAN REVIEW**

This is a read-only architecture audit, with this review document as its sole new deliverable. It neither certifies synthetic qualification nor authorizes implementation or observed execution. The smallest next change should establish the P2 evidence contract and its artificial verification, before adding an executable qualification suite or observed collector.

## Authority verification and reviewed checkpoint

Inspection date: 2026-09-14. Branch `main`; HEAD `f4e25128f19397bc98bbb9e19db899e6bb4a62cc` matches the requested reviewed checkpoint. Git history confirms the consecutive checkpoints below. Human approval status comes from the current task's authority statement, not an inference from commit existence.

| Reviewed component | Checkpoint | Status supplied for this audit |
|---|---|---|
| Arithmetic primitives | `3d0c44d` | CLOSED · APPROVED |
| Accepted path, topology, partition | `1094edd` | CLOSED · APPROVED |
| Native exposure | `a6d1edd` | CLOSED · APPROVED |
| Common-partition history | `4269aa0` | CLOSED · APPROVED |
| Comparisons/refinement | `a911e5c` | CLOSED · APPROVED |
| Qualification controller | `f4e2512` | CLOSED · APPROVED |

Authority is [the frozen P2 specification](2026-09-13-observed-lagrangian-phase-p2-qualification-specification.md), ID `observed-lagrangian-phase-p2-qualification/v1`. Exact working-file SHA-256 was verified as `fe5a33f8753b7538e5c3abdd2fe9f5766a2bdcefd08bfab07e6ced34bcfae59b`. Tracked working tree and index were unchanged at inspection. The protocol literal module carries this same ID/hash; storing a literal is not an execution-time verification.

The [Slice 6 design](2026-09-14-observed-lagrangian-phase-p2-slice-6-design.md) and [implementation-review handoff](2026-09-14-observed-lagrangian-phase-p2-slice-6-implementation-review.md) explicitly defer execution authority, reviewed execution SHA/runtime lineage, persisted schemas, reconstruction and full synthetic certification. Their original pending-review language and older baseline SHAs are historical; the current human instruction closes Slices 1–6. The specification's original implementation prohibition likewise predates those separate approvals. None of these approvals extends to execution.

Pre-existing untracked files were `e1-first-d158482.evidence.json`, `e1-first-d158482.execution.json`, `e1-first-d158482.stderr.txt`, `e1-first-d158482.stdout.txt`, `h4-output.txt`, and `h5-output.txt`. They were neither read as scientific results nor changed. This is not a clean-tree/preflight attestation. No applicable AGENTS.md was found in the workspace file search or checked ancestor locations.

No tests, simulations, qualification commands, observed fixture loaders or historical campaigns were run. The handoff records typecheck and 264 passing tests across six files (223 estimator tests and 41 controller tests); this audit inspected their source and treats that count as historical review evidence, not a fresh run or qualification certificate. No source changes, commits or pushes are part of this task.

## Synthetic qualification matrix

References below are repository-relative source locations at the checkpoint, using these abbreviations:

- **A**: `src/validation/lagrangianEstimator/arithmetic.validation.test.ts`, with independent `syntheticReferences.ts`.
- **P**: `src/validation/lagrangianEstimator/partition.validation.test.ts`.
- **E**: `src/validation/lagrangianEstimator/exposure.validation.test.ts`.
- **H**: `src/validation/lagrangianEstimator/history.validation.test.ts`.
- **C**: `src/validation/lagrangianEstimator/comparison.validation.test.ts`.
- **Q**: `src/validation/observedLagrangianPhaseP2Controller.validation.test.ts`.

Classification has two levels. **SATISFIED BY REVIEWED TEST** means the specified behavioral assertion exists in reviewed tests, not that §15 qualification has passed. **PARTIALLY SATISFIED** identifies a narrower assertion or incomplete evidence path. **NOT YET IMPLEMENTED** identifies missing infrastructure. Every fixture also **REQUIRES END-TO-END QUALIFICATION ATTESTATION** under §§12–15: execute a reviewed independent suite with full persisted traces, declared references, runtime identity and verified exact-byte evidence. No row waives that requirement.

| Frozen §15 fixture | Existing reviewed evidence | Behavioral classification / remaining requirement |
|---|---|---|
| 1. One segment, constant | E:53, “1: constant, one segment, no knots”: -3 over 4 s gives signed -12, absolute 12; no crossings | SATISFIED BY REVIEWED TEST; persist declared dyadic reference and full trace |
| 2. One segment, affine | E:58: `1+2t` on [0,2], both integrals 6; A local affine/rational checks | SATISFIED BY REVIEWED TEST; bind exact reference and §12 allowance to fixture record |
| 3. Arbitrary interior jump | P:64; E:63: lambda=1/4, A=1, B=3 gives 5/2; rejects unsplit-trapezoid answer | SATISFIED BY REVIEWED TEST; retain both temporal operands and weighted areas |
| 4. Piecewise affine plus jump | P:71; E:74: `t` / `t+2`, areas 1/8 and 11/8 | SATISFIED BY REVIEWED TEST; no cross-jump averaging |
| 5. Many irregular knots | P:75; E:80: `j*j/1024`, 32 intervals, rational area sum | SATISFIED BY REVIEWED TEST; persist complete ordered coverage; finite fixture size is not a cap |
| 6. Dense cluster exceeding four crossings | P:88; E:90; H “33 clustered crossings from each role”: all 33 crossings / 34 positive intervals | SATISFIED BY REVIEWED TEST; include generic no-cap source/dependency audit |
| 7. Unresolvable cluster | P:95 and “distinct internal crossings collapsing to one time fail”; H “unresolvable native cluster”; E:196 propagates rejection | PARTIALLY SATISFIED: specified NUMERICAL_AMBIGUITY is tested, but complete generated failing-step trace is not exposed/persisted; see failure-evidence gap |
| 8. Upward traversal | P:99; E parameterized “8: upward” after fixture 6 | SATISFIED BY REVIEWED TEST; lower-to-upper temporal limits retained |
| 9. Downward traversal | P:106; E “9: downward”; H parameterized one-sided contexts | SATISFIED BY REVIEWED TEST; reversed height order, increasing time |
| 10. Start/end knot | P:112; E:106; H union crossing/step-coincidence test | SATISFIED BY REVIEWED TEST; shared vertex identity and no zero-duration integral |
| 11. Dwell | P:121; E:113: horizontal/time-varying owned segment; H dwell contexts | SATISFIED BY REVIEWED TEST; full positive-duration evaluation, not a constant shortcut |
| 12. Touch and return | P parameterized fixture 12; E parameterized fixture 12; H touch-return contexts | SATISFIED BY REVIEWED TEST; both height-side approaches, shared contact and no opposite-side visit |
| 13. Ordinary versus incoming | P:138; E:123: upper ordinary value 9 versus incoming value 1 | SATISFIED BY REVIEWED TEST; preserve explicit segment context in evidence |
| 14. Equal opposite endpoints | A:106; E:130: h=4, amplitude 3, signed exact zero, absolute 6 | SATISFIED BY REVIEWED TEST; independent two-triangle reference; no amplitude-independent shortcut |
| 15. Identical paths/provider | H:46, “15: identical paths/provider/evaluation inputs give exact positive zero” and endpoint-difference assertions | SATISFIED BY REVIEWED TEST; R1 exact equality, not an allowance-based zero clamp |
| 16. Redundant trajectory boundary | H “16: redundant step boundary reevaluates the same affine geometry”: distinct fingerprints, union [0,1/4,3/4,1], R1=0, Aref=2 | SATISFIED BY REVIEWED TEST; E:161 is an additional exposure regression, not a substitute for this history fixture |
| 17. Shifted equal jump | H “17: shifted identical jump”: A=2, B=-6, times 1/2 and 3/4, T=2; area 2, R1=1, Aref=9/2, rational reference | SATISFIED BY REVIEWED TEST; persist both mismatch area and normalized residual |
| 18. Sign-changing affine difference | H “18: affine difference changes sign”: coarse 3-4t, fine 1, residual area/R1=1 | SATISFIED BY REVIEWED TEST; local zero stays contribution metadata |
| 19. Unsupported adjacent side | P:144 and adapter support tests; E:196/209; H “never recovers the supported fraction”; Q:121/131 | SATISFIED BY REVIEWED TEST for typed support/whole-step rejection, including owned contact; qualification must exercise actual provider rejection as well as supplied rejection records |
| 20. Unavailable column | P:153 creates actual null Analysis provider; E rejection propagation; H unavailable provider; Q:245 Moore applicability | SATISFIED BY REVIEWED TEST; N_A/COLUMN_UNAVAILABLE, numeric fields null |
| 21. Duplicate knots | P parameterized fixture 21; H constructs duplicate-knot provider; E propagation | SATISFIED BY REVIEWED TEST for MALFORMED_PROFILE; qualification must persist original rejected topology and validation reason, not just injected failure |
| 22. Repetition/serialization | E:167 and H fixture 22 repeatedly hash test-local canonical streams; C:321 and Q:228 repeat immutable evidence | PARTIALLY SATISFIED: value/order/digest repetition exists in memory; no reviewed shared persisted P2 codec, artifact-byte round trip or independent reconstruction verifier |

All 22 named behaviors have source-level coverage; that does not establish completeness of the independent qualification suite. Some exact expectations are literal dyadic results with analytic comments, others use rational reference helpers. A reviewed qualification registry must make every exact coefficient, reference derivation and expected status explicit before qualification implementation review; do not infer reference data from tested estimator output.

| Additional frozen prerequisite | Existing evidence | Classification and remaining work |
|---|---|---|
| Nonfinite/nonordered inputs, nonpositive duration | A invalid durations/operands; P malformed times/topologies; H invalid intervals/nonfinite endpoints; Q malformed matrix | SATISFIED BY REVIEWED TEST; run and retain rejected inputs/status for each declared case |
| Near-touch without snapping | P “near-touch is not snapped”; H close unequal crossings; Q owned contact versus near-touch | SATISFIED BY REVIEWED TEST; retain positive represented mismatch intervals |
| Simultaneous metadata events | H exact simultaneous crossings and step/crossing coincidence; P vertex identity | SATISFIED BY REVIEWED TEST; attest role/provider/boundary/event ordering and no lost identities |
| Traversal reversal restriction | E upward/downward tests use a stationary scalar provider; dwell separately varies with time | SATISFIED BY REVIEWED TEST for stationary reversal. No general equality claim for an unchanged time-dependent field; time-reversed variants, if added, must reverse the field consistently |
| Nonnegative absolute total, signed magnitude bound | E `referenceCheck`; A allowances; exposure implementation checks raw invariants | SATISFIED BY REVIEWED TEST; retain raw values and Bexp, never clip or alter scientific budgets |
| Complete duration and exact adjacency | P coverage tests; E adjacency rejection; H duration/union tests; A duration allowance | SATISFIED BY REVIEWED TEST; record combinatorial checks separately from arithmetic allowance |
| Overflow, underflow, operation/status handling | A scaled-product/subnormal/ties-even/Neumaier tests; E:248; H nonfinite difference/product/accumulation/allowance | PARTIALLY SATISFIED as qualification evidence: typed failures tested, complete operation-local failure capture still needs design and verification |
| Independent rational references and rounding | `syntheticReferences.ts` imports no tested arithmetic, uses BigInt rational algebra and ordered-bit correctly rounded conversion; A:203 dependency test | SATISFIED BY REVIEWED TEST for helper independence; complete fixture reference manifest and certification REQUIRES END-TO-END QUALIFICATION ATTESTATION |
| Binary64/runtime contract | A:70 separate-rounding/no-FMA check; history records Node/V8; A arithmetic tests | PARTIALLY SATISFIED: execution runtime/flags/dependency pinning and attested runtime checks absent |
| Artificial/dataset-independent providers; hard-coding audit | P actual Source/Analysis adapters with artificial profiles; A/P/E/H/C static dependency tests; Q authority tests | SATISFIED BY REVIEWED TEST within inspected scope; suite must retain audit results and avoid observed data imports |
| Full trace for every synthetic fixture/repetition | E/H retain success traces, Q retains actual estimator results; early P failures return short status/operation | PARTIALLY SATISFIED in memory; full persisted fixture evidence NOT YET IMPLEMENTED |
| Canonical P2 streams, artifact hashes, reconstruction | Local E/H test serializers and path/provider fingerprints only | NOT YET IMPLEMENTED as shared reviewed execution infrastructure |
| Controller completeness and actual integration wiring | Q:228 real Slice 1–5 path; Q:253 rejection matrix; Q:317 onward complete artificial identity ledger and selector precedence | SATISFIED BY REVIEWED TEST; prepared comparison fixtures are not estimator certification or actual Euler-construction evidence |
| Independent complete synthetic pass bound to reviewed execution closure | Explicitly deferred by Slice 6 design/handoff | REQUIRES END-TO-END QUALIFICATION ATTESTATION; no certificate identified in reviewed P2 implementation |

### What a complete independent suite must execute and produce

Execute every registry entry above with artificial accepted paths and artificial providers through the relevant real path/provider/partition/exposure/history APIs, then the applicable comparison/controller checks. A failure-propagation test alone cannot stand in for constructing the failing topology or evaluator. Keep independent exact rational reference calculation separate from tested quadrature and allowances; retain reference numerators/denominators and final rounded values. Apply §12 normalization allowance where appropriate; require exact identity zero and exact repeated stream digests.

Exercise the reviewed Source/Analysis adapters on artificial profiles, own-path foreign-node reevaluation (including nonlinear T1 where T*Aref differs from native fine Eabs), support irreversibility, conservative knot contacts, both comparison pairs and finer budgets. Retain the artificial controller selection/completeness regressions, including candidate 0 success despite later incompleteness and an earlier incomplete candidate blocking later selection. The 640-unit artificial identity matrix is controller coverage, not a request to integrate 640 observed trajectories. Production Euler construction/conformance belongs to later harness verification with artificial inputs before observed collection.

Persist for every fixture and repeated calculation: fixture ID/version and exact inputs; declared analytic reference or typed expected rejection; specification, implementation and runtime identities; profile/provider/path fingerprints; interval/support; full event, evaluation and subinterval traces; contributions, zero metadata, totals, bounds and assertions; canonical stream digest and saved-artifact hashes. Include a complete expected/executed registry ledger so omitted, duplicate or unexpected fixtures cannot yield PASS. Record command, exit status, stdout/stderr and verification result. A machine synthetic PASS is evidence for human review, not observed authorization.

The verifier must read the saved bytes in a fresh process, validate schemas and completeness, recreate pure providers from retained descriptions, use retained accepted endpoints without invoking Simulation, rerun diagnostics/estimators, and reproduce stream digests and decisions. Revalidation must rebuild `prepareRun`/`planGroup`/`evaluateGroup`/`selectCandidate` objects; JSON cannot preserve Slice 6 WeakSet/WeakMap seals. Independent analytic checks are distinct from this same-implementation reconstruction check. No trajectory reintegration is permitted for reconstruction.

## Execution-harness gap analysis

The approved source boundary is pure supplied-evidence computation. `P2_SPEC.executionAuthority` and every controller decision remain `NOT_AUTHORIZED`. `designBaseline` identifies the Slice 6 design baseline, not an execution SHA. The following are future requirements, not existing capabilities or authorization granted here.

| Component | Existing state | Minimum future contract |
|---|---|---|
| Stage guard / accidental execution | No P2 selector or collector | Separate synthetic and observed entry points. Absent selector exits before I/O or observed imports; invalid/empty/conflicting P2/P/E1/H selectors block. Synthetic route must have no observed loader or Simulation campaign dependency. Never infer authorization from an environment flag alone |
| Human execution authority | No execution authorization record | Bind approval to reviewed implementation closure, synthetic evidence review, exact manifest/runtime/output plan and observed-only stage. No successful test automatically calls observed entry |
| Reviewed SHA and runtime lineage | Slices reviewed through f4e2512; harness does not exist | Pin a later reviewed harness SHA after review. Verify freeze → reviewed implementation → explicitly allowed runtime HEAD ancestry and exact dependency closure. Ancestor status alone is insufficient; permit only reviewed/document-only differences under an explicit policy |
| Frozen identity/hash | Literal ID/hash in P2Spec; no filesystem check | Verify exact frozen file bytes in working tree and runtime commit, P2 protocol literals and exact inherited E1 matrix/storm inputs; block mismatch without repair |
| Clean tree / preflight | No P2 preflight | Reject tracked/index modifications and dependency/config drift. Inventory untracked files and reject executable/input shadowing and output collisions; do not silently delete them. Current untracked historical files are not new scientific evidence |
| Runtime arithmetic | Unit checks; partial Node/V8 recording | Pin Node/V8, architecture, dependency lock, relevant execution flags and evaluator versions; enforce §12 arithmetic contract, deterministic serial reductions and finite checks |
| Deterministic observed input manifest | P2Spec inherits C/storm but not a complete hashed execution manifest | Explicitly inherit frozen fixture/TIME/kernel hashes and provenance from authoritative P/E1 sources, preserve parser/Analysis processing, exact normalized profiles, supports, 36-field snapshot and operand order, seeds, clock, resolutions, durations, candidates, budgets, roles, birth/domain/recording policy; no recalculation of C literals |
| Construction/trajectory adapter | P2 `prepareRun` accepts data; historical P has collector | New reviewed P2 adapter for unchanged independent one-tracer Euler/Source advection, t0=0, stride 1. Retain initial velocity, every accepted sample/step, clipping, termination, support, historical crossing/lifecycle brackets. Bind actual construction conformance before accepting supplied evidence |
| Output / no overwrite or resume | No P2 writer | Explicit absolute fresh P2 directory, separate from historical P and outside Git by default; verify availability, exclusively create files, refuse every collision, never resume or repair partial output |
| Canonical schemas | In-memory p2-exposure/history/comparison/controller IDs | Reviewed separate persisted P2 schemas, §13 lexical UTF-16 keys, finite JSON numbers, -0 normalization, ordered dense arrays, typed nulls, UTF-8/no BOM/no whitespace and final LF for every canonical record; reject undefined/nonfinite/sparse/unserializable data |
| Trace completeness | Success traces available; some failure returns omit local progress | Persist original inputs before invoking validation. Retain full failing-step/subinterval generated evidence and candidate boundaries/operation. Do not claim serializing an existing failure object closes §14 |
| Controller persistence | Rich in-memory plans, entries, refinements, ledger | Persist run/group bindings, both intervals, oracle/lifecycle evidence, required/actual metrics, typed N_A, all candidate ledger structure, ordered decisions/reasons. Keep numerical completeness, support, admission, control and execution completion distinct |
| Summary/execution/logs | None in P2 | Summary contains qualification residuals/reasons and T/h or null, no main-science ranking; execution record has stage, provenance, counts, completion/failure and process outcome; capture real stdout/stderr as well as structured records |
| Hashes / verification | Tuple fingerprints and test digests | Separate artifact-byte SHA-256 from canonical reconstructed-stream SHA-256; hash exact saved bytes, identify stream composition/order, avoid self-hash cycles, bind every referenced artifact. Reconstruct from retained immutable trajectories/inputs, never reintegrate |
| Interrupted/failed work | Controller incomplete statuses only | Durable incomplete marker and partial evidence; exceptions, I/O/resource failures and missing evidence cannot become completed zero estimates or INVALID CONTROL. Completion publication requires complete verified required artifacts, not filename existence |
| Synthetic attestation gate | No persisted certificate | Complete independent suite on the reviewed closure/runtime; human review of saved evidence; invalidate/reassess certification after relevant code/runtime/schema changes |

### Failure-evidence boundary requiring explicit design

`partitionAcceptedStep` returns `{status, code, operation}` directly at `partition/crossing-order`, without the `nodes` already accumulated or the offending candidate's computed coordinates. Provider validation failures similarly need the caller's rejected inputs preserved. Exposure snapshots its supplied partition results, so it cannot restore a failing partition's discarded local progress. History snapshots inputs and partition results and records common-node evaluations, but cannot recover that discarded partition progress either. Controller failures likewise are not an automatic complete forensic record.

This is an unclosed evidence integration requirement expressly deferred by the reviewed architecture, not a discovered replacement of frozen numerical semantics. A future design must demonstrate complete failure capture. Options requiring human implementation-scope approval include narrowly additive diagnostic trace capture in reviewed primitives, with unchanged operation/evaluation order and outputs, or a demonstrably complete external recorder. A wrapper capturing inputs and provider calls alone does not establish capture of pre-provider geometry failures. Do not duplicate quadrature in a harness to manufacture evidence, omit the failing trace, or silently extend Slices 1–6 during the next bounded foundation change.

Malformed/nonfinite synthetic inputs also cannot be passed directly to a finite-only JSON codec. Define a lossless tagged rejected-input representation (for example raw binary64 bits plus a nonfinite classification, or fixture recipe tokens), separate from nullable result fields. The verifier must recover the original rejected input; converting NaN to null would lose evidence. This encoding and the missing failure capture must be reviewed before claiming full synthetic qualification.

### Proposed persisted artifact families

Names below are design proposals, not frozen schema identities or created files. Review exact fields/version IDs before any execution.

| Artifact | Required payload |
|---|---|
| `manifest.json` | Stage, authority/review/runtime closure, exact inputs and hashes, declared ordered unit/fixture/candidate inventory, schema/evaluator versions, output binding |
| `trajectory.ndjson` | Accepted initial/every-step samples and ticks, run identity/C/seed, initial velocity, topology/support, lifecycle and clipping/termination metadata; synthetic path descriptions for primitive fixtures |
| `diagnostic.ndjson` | Ordinary and explicit operands, applicable units/support, exposure/history/comparison totals and bounds, immutable bindings, counts and reconstructed stream digests |
| `trace.ndjson` and failure records | Full synthetic/repetition traces, full failed-estimate traces, original failing inputs/candidates and operation, partial-state labels; optional omission of successful observed traces only after reconstruction is verified |
| `controller.ndjson` | Plans, requirements, oracle/event checks, both pairs, refinements, group assessments and full candidate ledger with exact decision precedence |
| `summary.json` | Expected/executed completeness ledger, synthetic assertions or observed qualification residuals/reasons, verification result and selected T/h or null; clearly separate synthetic and observed schemas/stages |
| `execution.json`, `stdout.txt`, `stderr.txt` | Runtime/process/authorization provenance, terminal/incomplete state, error and artifact-hash inventory; exact captured log bytes |

Hash non-execution artifacts into execution metadata; place execution-file hash in an external review receipt or other acyclic inventory. Avoid a manifest/execution reciprocal-hash cycle. Final files alone cannot signal completeness: a failed multi-file publication can leave a subset of final names. Require the terminal completion record and full verification; preserve partials on failure.

## Historical Phase P reuse audit

Reference implementation is `src/validation/observedLagrangianPhaseP.ts`, literals in `observedLagrangianPhasePSpec.ts`, and its infrastructure tests. No historical output residuals or member rankings were consulted. Historical Phase P remains CLOSED · INVALID CONTROL and cannot supply a P2 qualification result.

| Potential component | Classification | Rationale / P2 boundary |
|---|---|---|
| `bytesHash` SHA-256 over supplied bytes | REUSE AS-IS, algorithm only | Exact-byte hashing is unchanged. Use the standard crypto operation locally; do not import the monolithic P collector just for it |
| E1 exact C/storm literal source and verified inherited operand order | REUSE AS-IS | Already explicitly inherited by P2Spec; retain original literals, no regeneration |
| P input/TIME/kernel paths, hashes and provenance literals | ADAPT FOR P2 | Transcribe only explicit inherited entries into separate P2 execution manifest, verify against frozen authority; whole P spec includes superseded policies |
| `serializeCanonicalRecord` | ADAPT FOR P2 | Rejects undefined/sparse/nonfinite values, but builds an object then JSON.stringify: integer-like keys are enumerated numerically. For keys `"10"` and `"2"`, P2 requires lexical `"10"` before `"2"`; direct sorted-key serialization is needed. Do not alter historical P bytes |
| `digest`, `manifestData`, `checkPhasePSpecIntegrity` | ADAPT FOR P2 | P identity/hash and serializer cannot be reused as a P2 identity; distinguish canonical stream from saved artifact hashes |
| `selectPhasePStage` and absent-stage tests | ADAPT FOR P2 | Preserve presence/exact-value/conflict fail-closed pattern; use separate synthetic/observed routes and new P2 authority |
| `staticPreflight`, Git/hash/closure guards | ADAPT FOR P2 | Useful blocking pattern. It pins P files/freeze/lineage and ignores untracked files; P2 needs its reviewed closure and execution plan, no inherited P SHA as authorization |
| `loadRuntime`, `constructConformingContexts`, `contextFingerprint`, `orderedSum` | ADAPT FOR P2 | Construction and ordered-field conformance can guide a separately reviewed validation-local adapter; bind P2 providers/manifests and retain exact upstream processing. No observed construction in the synthetic-only route |
| `collectTrajectoryUnit`, clock and initial/every-step recording | ADAPT FOR P2 | Euler/Source advection and lifecycle rules are inherited, but P2 needs new RunInput binding and reconstructible provider/trace evidence. Old diagnostic records alone are insufficient |
| `deriveDiagnosticRecords` | READ-ONLY SEMANTIC REFERENCE | Useful ordinary Source/Analysis/T1 operand provenance. Cannot supply explicit incoming/outgoing limits by sampling the knot ordinarily twice |
| `buildSupportTopology`, `segmentAt`, `supportAt`, `inspectAcceptedSegment`, `primaryAfterStep` | READ-ONLY SEMANTIC REFERENCE | Inherited ownership/support/brackets guide checks; reviewed P2 provider/controller already implement their responsibilities. Do not replace generic P2 partition events with P brackets |
| `assertClock`, `prefixTime`, `commonTime`, `matchCommonSamples` | READ-ONLY SEMANTIC REFERENCE | Retain stored-time matching and conservative aligned prefixes; use approved P2 wiring, not another competing controller |
| Geometry/response, pointwise exclusions, oracle, event/co-event and refinement functions | READ-ONLY SEMANTIC REFERENCE | Scientific rules are explicitly inherited and now implemented in Slices 5–6. Preserve P2 history/reference and signed-scale inputs and required metric completeness |
| `trapezoid`, `integrateExposure`, history portion of `compareT1` | MUST NOT REUSE | Superseded native endpoint trapezoids/coarse-time history; cannot implement P2 event-aware exposure or common-partition R1/Aref |
| `evaluateSeed`, `selectQualifiedCandidate` as P2 runtime controller | MUST NOT REUSE | P evaluation bundles superseded estimators; P2 must use approved `planGroup`/`evaluateGroup`/`selectCandidate`, including repaired ordered incompleteness precedence |
| `QualificationArtifacts` exclusive creation, partials, fsync, hard-link publication, bounded reads/hashes | ADAPT FOR P2 | Useful no-overwrite/no-resume mechanics, but fixed P artifact list and missing P2 trace/verifier schemas need replacement; test partial publication, final collisions, truncation and durable failure |
| `collectPhaseP`, campaign-selected test and P stage variable | MUST NOT REUSE | Would authorize/execute the wrong protocol and emit historical identities. No relabeling of its result as P2 |
| P synthetic infrastructure tests | ADAPT FOR P2 | Port specific negative I/O/guard/conformance cases to artificial P2 tests; do not run/import its campaign-selected test entry as a P2 prerequisite |
| Historical P artifacts, execution runtime `07d2932…`, reviewed SHA `285e623…` | MUST NOT REUSE as P2 evidence/authority | Historical provenance only; do not overwrite, resume, retrofit PASS or tune from their observed residuals |

The serializer incompatibility is a reuse constraint on historical infrastructure, not a P2 scientific specification/implementation contradiction. P2's local digest tests do not use that serializer. No confirmed frozen scientific protocol contradiction was identified by this readiness inspection. Any subsequently confirmed contradiction must be reported as **SPECIFICATION_IMPLEMENTATION_CONFLICT** and progression stopped for human review; never fix the protocol or numerical semantics incidentally.

## Proposed human authorization gates

These gates are sequential evidence/authority boundaries; implementation can be divided into smaller reviewed increments without collapsing them.

| Gate | Human decision / permitted action | Exit evidence and what remains unauthorized |
|---|---|---|
| 1. Readiness/design approval | Review this matrix, gaps, schemas/boundaries and unresolved capture issues | Approved bounded design; no implementation or execution implied |
| 2. Harness implementation authorization | Separately authorize exact foundation, then synthetic harness, then observed harness scopes as needed | Concrete diffs and artificial developer tests only; no independent certification run or observed campaign implied |
| 3. Implementation review | Review code, schemas, dependencies, failure capture, reconstruction and artificial conformance tests; pin reviewed SHA/allowed runtime lineage | Execution-ready implementation may be approved; observed execution still blocked |
| 4. Independent synthetic qualification authorization/execution | Explicitly authorize the artificial suite on pinned closure/runtime/output location | Complete synthetic artifact set, expected fixture ledger, full traces and independent reference/reconstruction checks; no observed loading |
| 5. Synthetic qualification human review | Review completeness, expected failures, exact references, runtime, hashes and reconstruction | Accept or reject synthetic prerequisite; acceptance does not authorize observed execution |
| 6. Observed P2 execution authorization | Separate human approval of reviewed observed harness, accepted synthetic evidence, immutable manifest, runtime lineage, fresh output plan and blocking preflight | Authority only for exact P2 qualification campaign; no main L1 or threshold selection |
| 7. Observed P2 execution | Execute only under Gate 6 and successful actual preflight | 640 registered units at full requested horizon unless terminated under protocol, complete qualification evidence/decision or explicit incomplete outcome; no automatic repair/rerun/adaptive ladder |
| 8. Observed P2 human scientific review | Review reproducibility, support, numerical qualification and selected candidate or failure | P2 scientific disposition only. Main L1 and material-response thresholds require their own future decisions even if P2 qualifies |

If observed harness code is introduced after synthetic certification, repeat the relevant implementation review and synthetic qualification/review on the final execution closure. An old certificate must not silently cover changed runtime, evaluator, schemas or dependencies. Resource exhaustion/incomplete evidence requires review and a newly authorized fresh run, never resume or silent truncation.

## Smallest next implementation scope

Proposed name: **P2 evidence-contract foundation**. Neither the frozen specification nor the inspected Slice 6 design/handoff assigns a “Slice 7”; this proposal deliberately uses a boundary name without inventing a numbered authorization.

This is smaller than a complete qualification runner: establish canonical bytes, typed persisted envelopes and immutable fixture requirements first. It produces reviewable code and artificial developer-test evidence, not qualification artifacts. The following exact proposed files are additions only; names remain subject to human design approval:

| Proposed file | Responsibility |
|---|---|
| `src/validation/p2Qualification/evidence.ts` | P2 persisted envelope types and validators; strict canonical record encoding, LF stream hashing and artifact-byte hash distinction; typed rejected-input encoding; stage-specific identities, complete/partial status separation and acyclic references. No filesystem or campaign invocation |
| `src/validation/p2Qualification/syntheticRegistry.ts` | Immutable declarative inventory of all 22 fixtures and additional prerequisite variants, exact dyadic recipes/rational references or expected typed failures, required trace/assertion inventory and review version; no observed data and no auto-execution |
| `src/validation/p2Qualification/evidence.validation.test.ts` | Artificial canonical-byte, schema, rejected-input round-trip and completeness tests; prove no observed/runtime-collector dependency and no import side effects |
| `docs/research/2026-09-14-observed-lagrangian-phase-p2-evidence-contract-implementation-review.md` | Later implementation handoff: exact diff, checks, codec/reference decisions, unresolved failure-capture boundary and unchanged source/spec proof |

Required developer tests: lexical integer-like keys (`10`/`2`) and UTF-16 ordering; nested objects and array order; JSON escaping, no Unicode normalization, -0, final LF/no BOM; rejection of undefined, sparse arrays, nonfinite numeric fields and unsupported values; lossless tagged malformed inputs; deterministic equivalent-key-order bytes/digests; artifact versus stream hashing and no self-reference; missing/duplicate/foreign fixture IDs and missing required trace declarations cannot appear complete; synthetic/observed schema separation; inability of a serialized controller envelope to act as a validated in-memory controller object. Use independent hand-written expected byte strings and the reviewed independent rational helper, not codec-generated expectations. Run targeted new tests, relevant estimator/controller regressions and typecheck when separately authorized; no campaign-selected command.

Dependencies: frozen §§12–15 and explicit Phase P inheritance; reviewed P2 types and literals (read-only); Node standard crypto; independent `syntheticReferences.ts` for test/reference algebra. Existing source and numerical semantics remain unchanged. Avoid importing the historical P module. Do not edit package scripts or add stage selectors as part of this foundation.

Evidence produced at this next implementation gate: source diff, immutable registry/reference declarations, expected-byte tests, test/typecheck results and implementation-review handoff. No persisted synthetic qualification certificate, raw trajectory output or observed result. Runtime SHA/approval cannot be self-certified by these additions.

Explicit subsequent dependencies before Gate 4: separately reviewed full failure-trace capture design/implementation; exclusive artifact writer and fresh-process reconstruction verifier; synthetic-only runner and complete fixture execution; reviewed runtime/SHA/preflight binding. Before Gate 6 also require observed construction/recording adapter and execution guard, exact hashed manifest, artificial integrator/wiring conformance and observed preflight. These remain real work; the foundation must not claim to close them.

## Unresolved review decisions and hard exclusions

Human review must settle the complete failure-capture mechanism before approving a full qualification harness, including whether a separately scoped observability-only change to reviewed primitives is necessary. The foundation cannot supply private discarded partition state. Review must also approve exact persisted schema versions/stream composition, lossless malformed-input encoding, runtime/dependency closure policy and the final reference registry. Exact execution SHA, runtime, output root and authorization receipt remain intentionally unassigned until their gates; `f4e2512` is the reviewed numerical/controller checkpoint, not a future harness SHA.

The inherited clean-tree requirement explicitly blocks tracked/index changes. A stricter untracked-file policy is an execution design decision, not a retroactive claim that these existing historical files invalidate the reviewed implementation. Record them and resolve output/dependency risk without automatic cleanup. Artifact volume/performance must be bounded through streaming and checked completeness, never by dropping knots, traces required by §14, seeds, resolutions or comparisons.

Not authorized: implementation by this document; observed scientific execution or collection of Goshen/Prospect Valley/Dumas/Moore P2 results; main L1 execution, inspection or ranking; material-response threshold design/selection; numerical tolerance, candidate-order, ladder or duration changes; frozen-specification edits; reviewed Slice 1–6 numerical/controller semantic changes; production/core/UI changes; E1/H1–H5 or historical P reruns; production deployment; commit or push. No qualification artifact was created by this audit.

**PHASE P2 QUALIFICATION READINESS DESIGN — AWAITING HUMAN REVIEW**

**PHASE P2 SCIENTIFIC EXECUTION — NOT AUTHORIZED**

**MAIN L1 — NOT AUTHORIZED / NOT TESTED**

**MATERIAL RESPONSE THRESHOLDS — STILL OPEN**

**PRODUCTION/UI — UNCHANGED**

**STOP FOR HUMAN REVIEW.**
