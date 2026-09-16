# P2 Synthetic Fixture Execution and Qualification Evidence Contract

**CONTRACT FROZEN · CLOSED · HUMAN REVIEW APPROVED**

**P2 SYNTHETIC FIXTURE EXECUTION AND QUALIFICATION EVIDENCE CONTRACT — CLOSED · HUMAN REVIEW APPROVED.** The complete resolved design, including D1 and D2, received explicit human approval. This status/freeze closure preserves the reviewed semantics exactly. Fixture-layer implementation and all qualification execution remain unauthorized. **STOP FOR HUMAN REVIEW.**

## 1. Status, authority and inspection

**Human review/freeze closure — 2026-09-16.** The explicit “HUMAN REVIEW DECISION” approves this complete document at repository checkpoint `main @ 401d59b8e1618cb264bafbc6f9d8188ae63e7ab5`. Exact reviewed document bytes before this status-only closure have SHA-256 `a9f1e373cdfb0e672616fdbd66d0a25f6bff561aba825cd1901b1a29c38a15a5`. The reviewed document is a working-tree addition, not a file committed in that checkpoint; no new commit or execution SHA is claimed. The hash identifies the approved pre-closure version, not a self-hash of this updated file.

The complete contract is now FROZEN. Draft/proposed/awaiting-review wording retained in the unchanged semantic body records its drafting provenance and is superseded as status by this explicit full-document approval. Existing recipe/version literals are preserved exactly; approval does not bind an implementation or runtime. The earlier D1/D2-only decision (HD below) remains its own historical authority; this subsequent full review closes the whole contract gate. No additional semantic blocker was identified.

Inspected on 2026-09-15: `main @ 401d59b8e1618cb264bafbc6f9d8188ae63e7ab5`, parent `bf83c3650f9c38ac42ba4e1ab50a8bb43fd9637c`. These match the requested checkpoint. Failure Capture is **CLOSED · APPROVED @ bf83c36**, per the explicit human decision and current [PROJECT_STATUS](../PROJECT_STATUS.md). Historical pending-review statements do not reopen that gate. This task explicitly authorizes this design document only.

Authority order: frozen specification → owning approved designs/reviews → implementation facts → PROJECT_STATUS as navigation/status → historical handoffs as provenance. Source labels used throughout:

**HD:** the subsequent user instruction, “HUMAN DECISION — resolve D1 and D2 only, then return the resolved design for human review,” supplies the F22 graph/reset and three-stream equality decisions transcribed in §14. HD resolves these two gaps only; it grants no approval of the whole design, implementation, tests or execution. This revision changes only this existing document. HEAD remains the inspected checkpoint above.

| Label | Owning source and inspected scope |
|---|---|
| S | [Frozen P2 specification](2026-09-13-observed-lagrangian-phase-p2-qualification-specification.md), especially §§3–15 and inherited comparison/controller §§16–17 |
| RD | [Qualification readiness](2026-09-14-observed-lagrangian-phase-p2-qualification-readiness-design.md), synthetic matrix and independent-suite obligations |
| EF | [Evidence foundation review](2026-09-14-observed-lagrangian-phase-p2-evidence-contract-implementation-review.md), codec, immutable registry and independent references |
| CD | [Approved capture design](2026-09-14-observed-lagrangian-phase-p2-failure-evidence-capture-design.md), §§C–F: observational invariance, generated-prefix coverage, tagged inputs |
| CR | [Capture implementation review](2026-09-14-observed-lagrangian-phase-p2-failure-evidence-capture-implementation-review.md), facade behavior, call order, limitations |
| R | [syntheticRegistry.ts](../../src/validation/p2Qualification/syntheticRegistry.ts), complete `SYNTHETIC_REGISTRY`, declaration validators |
| REF | [syntheticReferences.ts](../../src/validation/lagrangianEstimator/syntheticReferences.ts), independent exact rational algebra and rounding |
| CODEC | [evidence.ts](../../src/validation/p2Qualification/evidence.ts), canonical bytes, tagged input, authority and hash kinds |
| CAP | [failureCapture.ts](../../src/validation/p2Qualification/failureCapture.ts) and [capture.ts](../../src/validation/lagrangianEstimator/capture.ts) |
| TYPES | [types.ts](../../src/validation/lagrangianEstimator/types.ts), native result, endpoint, partition, exposure, history and comparison types |
| PATH / PROVIDER / PART | [path.ts](../../src/validation/lagrangianEstimator/path.ts), [providers.ts](../../src/validation/lagrangianEstimator/providers.ts), [partition.ts](../../src/validation/lagrangianEstimator/partition.ts) |
| AR / EXP / HIST | [arithmetic.ts](../../src/validation/lagrangianEstimator/arithmetic.ts), [exposure.ts](../../src/validation/lagrangianEstimator/exposure.ts), [history.ts](../../src/validation/lagrangianEstimator/history.ts) |
| CMP / CTRL | [comparison.ts](../../src/validation/lagrangianEstimator/comparison.ts), [observedLagrangianPhaseP2Controller.ts](../../src/validation/observedLagrangianPhaseP2Controller.ts), [P2 literals](../../src/validation/observedLagrangianPhaseP2Spec.ts) |
| AT / PT / ET / HT / CT / QT | Reviewed artificial [arithmetic](../../src/validation/lagrangianEstimator/arithmetic.validation.test.ts), [partition/provider](../../src/validation/lagrangianEstimator/partition.validation.test.ts), [exposure](../../src/validation/lagrangianEstimator/exposure.validation.test.ts), [history](../../src/validation/lagrangianEstimator/history.validation.test.ts), [comparison](../../src/validation/lagrangianEstimator/comparison.validation.test.ts), [controller](../../src/validation/observedLagrangianPhaseP2Controller.validation.test.ts) test sources |
| FT | Approved [capture tests](../../src/validation/lagrangianEstimator/capture.validation.test.ts) and [facade/projection tests](../../src/validation/p2Qualification/failureCapture.validation.test.ts) |

S ID is `observed-lagrangian-phase-p2-qualification/v1`. Exact working-file SHA-256 was checked: `fe5a33f8753b7538e5c3abdd2fe9f5766a2bdcefd08bfab07e6ced34bcfae59b`; it agrees with CODEC and the P2 literals. This is inspection provenance, not execution-time verification or a bound qualification implementation.

R's supplemental recipes point to `f4e25128f19397bc98bbb9e19db899e6bb4a62cc`. A source diff against HEAD confirms their four referenced test files retain the recipes; the sole change is CT's capture-import allowlist. Current APIs include the approved capture instrumentation. No applicable AGENTS.md was found in the workspace search or at checked ancestors `D:/`, `D:/AI/`, and the repository root.

Initial tracked tree/index were unchanged. Six pre-existing untracked historical files were inventoried without reading their results: `e1-first-d158482.evidence.json`, `e1-first-d158482.execution.json`, `e1-first-d158482.stderr.txt`, `e1-first-d158482.stdout.txt`, `h4-output.txt`, `h5-output.txt`. They remain untouched. This is not clean-tree execution preflight. No tests, synthetic qualification, observed collection, simulation or historical campaign ran.

No confirmed scientific semantic conflict was identified. In particular, R's old prerequisite prose saying capture is unimplemented is historical status, superseded by the approved implementation; its prerequisite identities/requirements stay unchanged. If review identifies a real conflict with S or an owning approved contract, stop; do not resolve it by changing either expectations or algorithms.

## 2. Problem statement

The foundation declares inputs and expectations; the real APIs compute results; capture preserves generated state. None binds an exact declaration to constructed objects, ordered real invocations, independently owned assertions and a fixture verdict. The proposed unit is:

```text
exact registry declaration + reviewed executable recipe
  → declared artificial data → actual factories and API operations
  → native result / native evidence + original capture
  → assertions against independent references
  → one fixture/repetition record and an explicitly scoped verdict
```

Expected answers never come from the estimator under test. Actual scientific values never come from reference machinery. The harness may compare values, count existing evidence and bind identities; it may not interpolate a replacement actual path, integrate a replacement actual total, rebuild missing traces or implement a competing controller. [S §§3,9–15; RD independent-suite obligations; CD §C]

## 3. Non-goals

This is an in-memory semantic contract, not executable code, a runtime/artifact schema, filesystem layout, writer, verifier, runner, CLI, campaign scheduler, certificate or attestation. It establishes no implementation SHA, execution lineage or observed authority. Numerical formulas, frozen fixtures, independent references, scientific budgets, production and UI are unchanged. Detailed exclusions and future gate limits are in §§22–23.

## 4. Terminology and scope of claims

| Term | Meaning |
|---|---|
| Declaration | Exact R item, including recipe, expected quantities/status, assertions, traces and repetition count |
| Executable recipe | Proposed versioned binding of that declaration to constructors, arguments, API roles, operations and evidence selectors |
| Operation | One actual public API invocation, or an explicitly declared accumulator method sequence; nested calls remain owned by that API |
| Expected reference | Independently declared rational, analytic relation, typed rejection or structural criterion; never a copy of actual |
| Actual | The returned value/evidence or original approved capture from the operation being tested |
| Supplemental | One of R's 11 `prerequisiteRecipes`; retains its exact string ID and baseline source binding |
| Prerequisite inventory | One of R's four `prerequisites`; an evidence obligation group, not a fabricated estimator run |
| Repetition | One execution of the approved operation graph for an item; F22 requires fresh, non-aliasing coarse/fine paths and providers and the seven-step graph in §14 |
| Complete generated prefix | Capture retained what instrumented execution generated before return/failure; not a complete estimate or fixture PASS |
| Qualified fixture | All applicable frozen obligations satisfied with required evidence, within the record's declared claim scope |

There are two legitimate test scopes. **Estimator fixtures** derive every actual integral/history from EXP/HIST. **Prepared-input supplemental probes** feed frozen hand-declared comparison/controller inputs into CMP/CTRL and qualify the returned comparison/decision only. Their stub history/exposure numbers are declared input, never actual estimator evidence. This distinction is required by R, EF and CT/QT, and prevents manufactured estimates from passing as end-to-end wiring.

## 5. Common semantic model and identities

The following are proposed binding decisions for human review, not additions to frozen R identities. Their constraints come from S §§12–15, R, EF and CD §D.

* Identity is the tuple `(registry schema/version, declaration category, exact item ID, item version where present, repetition ordinal)`. F/V records keep `P2-F01` through `P2-V16`; `frozenFixture` remains the declared number or null. Do not rename V09 to an F12 replacement.
* A base F/V item has no extra variant ID unless R declares one. Preserve the V identity and describe its semantic relationship separately. Supplemental identity is its existing ID; parameterized source cases need an additional source-case key, without replacing the supplemental ID. Inventories preserve their existing IDs and each required string as an obligation key.
* Bind the complete immutable declaration and whole-registry definition, not only an ID or required-trace subset. CODEC canonical equality and R's validators own declaration equality. A declaration hash may later index retained content but cannot replace it. No computed registry hash is asserted here.
* Recipe identity is separate from registry identity: proposal `fixture-binding-draft/2026-09-15`, class and item-specific parameters, API symbols, role map, evaluation convention, ordered operations and assertion bindings. It remains DRAFT and unimplemented. The eventual reviewed implementation must demonstrate that actual constructor arguments match it.
* Scientific path/provider fingerprints are recorded only if the real constructors return them. A rejected factory has `NOT_CREATED`, not a fingerprint derived by the harness. Fixture/repetition IDs must not become numeric estimator dispatch inputs.
* Provider construction must bind evaluator semantics, not merely repeat a generic identity label. Proposed custom-provider `identity` is CODEC's canonical text of `{providerIdentity, evaluator, fields}` from the recipe; `version` is the reviewed executable evaluator version, proposed `p2-synthetic-evaluator/v1`. Heights/support remain explicit factory arguments and are already included by PROVIDER in its fingerprint. This adds a construction binding without changing R's `providerIdentity` field. No runtime claim is made for the proposed version.
* Path/repetition labels do not enter that provider identity. Coarse and fine with identical provider declarations therefore have equal fingerprints; different functions/coefficients cannot silently share a declared scientific identity. The complete recipe is retained even when a fingerprint exists. [S §§5,12–14; PROVIDER `createDiagnosticProvider`; EF]

## 6. Executable recipe contract

### 6.1 Artificial construction and declared inputs

For every F/V row, the entire `coarse`, optional `fine`, `interval`, `reference`, `requiredTraces`, `requiredAssertions` and `repetitions` in R are binding. The matrices below give explicit parameters as a cross-check, not a substitute for exact declaration matching.

Map vertex `{t,x,y,z}` to `{time:t, position:{x,y,z}}` without numerical transformation. Convert only the declared Scalar tokens `NaN`, `+Infinity`, `-Infinity` to their binary64 values; retain both original tokens and tagged constructed data before calling a factory. No sorting, deduplication, endpoint repair, coercion of arbitrary strings or discarded malformed value is allowed. [R recipeConvention; PATH; CODEC; CD §E]

For ordinary artificial providers call `createDiagnosticProvider` with exact heights, segment fields, explicit evaluator identity/version and knot support. `FULL_SUPPORT` expands to one `FULL_SUPPORT` per declared knot; support arrays are knot support, not segment support. The real factory owns conversion to segment support. Pure evaluator returns `{T1, omega:null, gradient:null}`:

* `SEGMENT_AFFINE`: the selected declared segment's `c + tCoefficient*t + xCoefficient*x + yCoefficient*y`. Proposed evaluator operation order is `(((c + (tCoefficient*t)) + (xCoefficient*x)) + (yCoefficient*y))`, separate binary64 operations. This only constructs the artificial field; it is not quadrature. All finite numerical reference cases here use dyadic data with the declared exact algebra; no production T1 algorithm is copied.
* `NONLINEAR_TIME_SQUARE`: `t*t`; unused affine fields remain retained as declared data. This is the authorized local-interpolant wiring probe, not an exact integral of physical t².
* `NONFINITE_AT_HALF`: `NaN` at exactly `t === 0.5`, otherwise the declared affine field (1 for V11). The real PROVIDER finite guard owns the failure; the harness cannot return the desired error itself.

No ordinary oracle is installed for these custom scalar fixtures: R declares the artificial scalar itself. Supplemental Source/Analysis adapters exercise their existing ordinary-oracle machinery independently (§18). [R; PT/HT; PROVIDER]

`UNAVAILABLE` is a separate construction route: `createAnalysisProvider(null, updraft, "gradient-test")`. Use PT's artificial `VerticalEnvelopeUpdraftField` with `centerX=0`, `centerZ=0`, `peakVerticalVelocity=2`, `sigma=1`, `baseHeight=-1`, `topHeight=2`. PROVIDER returns a COMPLETE unavailable provider with topology null and fingerprint `unavailable-column/v1`; its methods return N_A. Empty heights/fields in F20 must not be passed to `createDiagnosticProvider`, which would instead reject malformed topology. The updraft is declared construction data and is not evaluated by the null-column branch. [PT fixture 20; PROVIDER `createAnalysisProvider`; CR]

### 6.2 Recipe classes and exact API graph templates

Each arrow below is a success dependency unless specified. Inputs are snapshotted before construction. Factories return their actual objects; no cloned provider or deserialized controller seal substitutes for them. All operations have capture or the equivalent approved explicit-context boundary (§11).

| Class | Operations and roles | Stop/ownership rule |
|---|---|---|
| E: native exposure | `createAcceptedPath(coarse vertices)` → `createDiagnosticProvider(coarse)` → `partitionAcceptedStep(path,i,provider,{eligibility:"ELIGIBLE",support:"FULL_SUPPORT"})` in increasing step index → `integratePathExposure(all successful partitions,{role:"PRIMARY"})` | Stop outer graph on first unexpected rejection; expected partition-rejection rows terminate at PART. Do not sum per-step estimates |
| H: common history | Create coarse path/provider, then fine path/provider; call `comparePathHistory({status:"COMPLETE",value:{path,provider,eligibility:"ELIGIBLE"}}, …, {interval:{a,b},role:"PRIMARY"})` | HIST owns both native partitions, union, own-path evaluations, areas and normalization; no separate harness-native prepartition pass |
| O: endpoint ownership | E, followed by `provider.ordinary(stored final position,stored final time,context)` | Independent ordinary probe is explicitly required by F13; incoming operand comes from the earlier real partition, not another ordinary call |
| H+Ef: history and native fine | H succeeds → select already returned successful FINE native partition results in `history.trace.partitions` → `integratePathExposure(fine partitions,{role:"PRIMARY"})` | Selection preserves step order and exact evidence; do not add union nodes, repartition, or synthesize a fine integral from Aref |
| RP: rejected provider | Retain declared factory data → `createDiagnosticProvider` | Expected topology rejection terminates before PATH/PART; original vertices remain declaration data, no constructed path is claimed |
| RX: rejected path | Retain constructed vertex data → `createAcceptedPath` | Expected trajectory rejection terminates before provider/PART |
| RK: rejected partition | PATH → PROVIDER → PART for the declared step | Retain generated prefix; no EXP or next step after expected rejection |
| RU: unavailable | PATH → `createAnalysisProvider(null,…)` → PART | PART returns N_A before enumeration/evaluation; stop there. Method semantics are owned by the null-column API, not an injected N_A object |
| RE: rejected exposure | E construction and successful PART → EXP | V08 reaches real local scaled-product overflow; retain parent and nested capture |
| RH: rejected history | H construction → HIST | V11 reaches coarse foreign-node evaluation after native partitions; stop after HIST returns its real failure |
| A: arithmetic supplemental | Named real AR operation or `new NeumaierAccumulator(context)` and declared ordered `add` calls followed by `total` | Fresh accumulator, one actual total; no introspective extra arithmetic |
| P: adapter supplemental | Declared artificial wind/updraft/column → real Source/Analysis factory → exact ordinary/explicit queries | Legacy diagnostic/query is an independently bound conformance comparator, not the P2 estimator output |
| C: prepared comparison supplemental | Declared immutable prepared input → real `compareHistory` / `compareExposures` → `compareSuccessiveRefinement` where required | Prepared values remain input. Actual checks, budgets, refinement outcomes come solely from CMP |
| Q: controller supplemental | Declared artificial RunInput → `prepareRun` → `planGroup`; then `evaluateGroup` for actual wiring, or declared prepared entries → `assessGroup`; sealed ledger → `selectCandidate` where required | Prefix, oracle, requirements, role, refinement, ledger validation and selection remain CTRL-owned |
| D: repeated exposure/history | Fresh coarse PATH→coarse PROVIDER→fine PATH→fine PROVIDER→coarse PART in chronological order→coarse EXP→HIST; repeat exactly five times | No coarse/fine live-object aliasing or cross-repetition reuse; SCIENTIFIC, OBSERVATION and QUALIFICATION equality streams as §14; no separate fine EXP obligation [HD] |

For items other than F22, objects are constructed for that item from its recipe; equal coarse/fine provider descriptions may share the same immutable provider within the H invocation, and F15 supplies identical path/provider/evaluation inputs to both roles. F22 explicitly forbids that aliasing and all reuse of live scientific objects across repetitions (§14, HD). Equal F22 fingerprints describe equal declared science, not shared live-object identity. Distinct geometry encodings require their own PATH result. Cross-item reuse is not evidence that an item's construction occurred. This is binding discipline under S §§4–5,14–15 and HD, not permission for extra numerical work.

## 7. Operation/dependency semantics

The semantic graph is acyclic. Each node declares `operationId`, API symbol, input object/data references, role, order, dependencies, expected terminal disposition and capture ownership. Only declared independent branches can run independently; the proposed default is deterministic serial order. Graph order is separate from each API's internal journal/event order. [S §§12–14; CD §C; CR call-order audit]

A node's execution state is `NOT_STARTED`, `RETURNED`, `THREW`, or `INTERRUPTED`; a planned node may instead have a disposition `NOT_APPLICABLE_AFTER_EXPECTED_STOP` or `BLOCKED_BY_DEPENDENCY`. These states are accounting, not scientific status. Executed records contain only actual invocations. The planned inventory separately explains why other nodes did not execute. An expected stop satisfies downstream non-applicability only if the exact required rejection and failure site/path are demonstrated. An unrelated earlier error is not a successful early stop.

Assertions may have multiple dependencies: F13 binds ordinary and incoming results; V10 binds HIST Aref and EXP fine Eabs; controller assertions bind actual plans, requirements, entries and decisions. An assertion cannot point to a detached similarly shaped value without the operation/input relation.

The graph controls only calls that it owns. Once CTRL/HIST is invoked, do not interrupt or change its internal behavior. CTRL currently evaluates both ordinary operands before checking the coarse status and eagerly partitions selected exposure steps before checking rejection. It may retain successful siblings after an internal failed result. These are executed evidence, not prohibited harness downstream recovery. Expected early-stop rules apply at the declared operation boundary; no new outer operation is launched to improve a record. [CD §C.4; CR; CTRL `evaluateGroup`; HIST]

`prepareRun`, `planGroup`, `comparisonRequirements`, `evaluateGroup`, `assessGroup`, `selectCandidate` retain their current responsibilities and seals. Q must not independently compute eligible prefixes, regenerate requirements, select a candidate, or replace finer-pair budgets. A prepared supplemental may construct frozen input criteria, but its returned assessment must still be issued by the real controller. [S §§8,16–17; CTRL; QT]

## 8. Expected-reference ownership and arithmetic

Every assertion names its reference owner, exact declaration and quantity/relation, units, rational numerator/positive denominator when applicable, rounding point and allowance owner. The expected channel has no incoming dependency from an actual scientific result. A structure extracted from actual trace can be checked against declared geometry, but cannot become the expected analytic partition or endpoint scale. [S §§12,15; REF; R; EF]

For a rational declaration `[n,d]`, retain the strings and form `REF.rational(BigInt(n),BigInt(d))`. Use `roundReference` once at the final comparison conversion. For derived analytic values use `exactNumber` on declared finite dyadics, then REF's `add/subtract/multiply/divide` in exact rational algebra. Sum exact areas before final rounding; do not sum individually rounded `referenceLinear` outputs when claiming an exact total. `referenceLinear` is suitable for a single declared local interval, and `referenceSum` sums the supplied binary64 numbers, not hidden unrounded rationals. [REF implementation]

Reference geometry is analytic from declared affine paths/topology: E uses native boundaries; H uses both declared grids/crossing times. This constructs independent expectations only, not replacement actual results. In these cases the declared cut times are exact dyadics. F05 uses `j²/1024`; F06 uses `.5+j/4096`; F17 uses `[0,.5,.75,1.5,2]`; F16 uses `[0,.25,.75,1]`; V07/V10 use `[0,.5,1]`. No estimate-derived cut time or operand is allowed into the expected calculation.

| Assertion class | Expected owner and comparison |
|---|---|
| AE: analytic exposure | R rational Esigned/Eabs, S §§10,12; compare actual native totals against final rounded reference with S §12 synthetic allowance |
| AH: analytic history | R residualArea/referenceArea/R1/Aref where declared; S §§11–12; same independent rational derivation and applicable normalization allowance |
| AX: exact | Typed status/reason, topology/event identity relations, declared exact scalar ownership operands, F14 positive-zero signed result, F15 identity-input zero history, underflow bits and deterministic equality; no tolerance |
| ST: structural | S §§4–8,13 and explicit R assertion strings: complete adjacency/order/counts, segment/side/support, no extra zero event, no fabricated zero; inspect native evidence and captured calls |
| RJ: rejection | R's exact status/code or reason, plus the reachable source operation/path identified by the recipe and capture; not a manufactured failure literal |
| CP: criterion/controller | S §§16–17 and frozen CT/QT declared scenarios; compare the real returned checks/assessment/decision to independent declared outcomes; do not reimplement acceptance logic as actual |
| EV: evidence/accounting | S §§12–15, R/EF/CD: input binding, required original trace and executed inventory; not a numerical estimate |

Allowance computation is owned by reviewed AR, not by new harness formulas. For AE call `syntheticReferenceAllowance` on independently declared analytic native endpoint intervals. For AH residual checks supply coarse analytic intervals and `otherPath=fine`; referenceArea/Aref use fine analytic intervals as in HT's `analyticCheck` and HIST's separate reference bound. For normalized checks pass the independently declared duration and rounded reference, not actual R1/Aref. This uses S §12's k/scale/bound and final `e*abs(reference)` division term. Record inputs and real returned allowance. A nonfinite/failed allowance cannot admit a mismatch; evidence is incomplete. Exact requirements remain exact even if an allowance would admit them.

Native `ExposureEvidence.allowance/invariants`, partition `durationSum/durationBound`, history `durationSum/durationAllowance` and `arithmetic` are actual audit evidence. Their scales originate inside the estimator; they do not replace the independent analytic-reference allowance. Duration adjacency is checked exactly and separately from the duration residual/bound. Do not recalculate an actual duration total or Eabs in the harness. [AR; EXP; HIST; S §12]

V10's exact references are to declared endpoint interpolants, not `integral(t²)`. Common values `[0,1/4,1]` give two trapezoids `1/16+5/16=3/8`; fine native endpoints `[0,1]` give `1/2`; identical own-path values give zero history. Use the local-interpolant arithmetic allowance for the explicitly declared polynomial endpoint algebra; this grants no general nonlinear-provider accuracy bound. Also assert inequality of the two returned quantities at T=1. [R V10; EF nonlinear probe; S §§9–12]

Source/Analysis conformance expects the unchanged legacy diagnostic/query on artificial data, as frozen by PT. It is independent of the P2 adapter under test but shares underlying physics, so this is conformance, not an independent scientific proof of that physics. Prepared comparison values and expected controller outcomes likewise have narrower scope than primitive analytic qualification. [RD; PT; CT; QT]

## 9. Actual-evidence ownership

| Quantity/evidence | Only admissible actual source |
|---|---|
| Path vertices, steps, path fingerprint | Actual successful PATH return; original rejected vertices remain tagged input on failure |
| Topology, segment support, provider fingerprint | Actual successful PROVIDER result; factory failure retains declaration and capture instead |
| Crossing/contact identities, sides, interval adjacency, duration total/bound | Actual PART result, also reachable through EXP inputs or HIST native partitions |
| Esigned, Eabs, exposure invariants, local zeros, contributions | Actual `integratePathExposure`/`integrateStepExposure` return and trace |
| residualArea, referenceArea, R1, Aref, union nodes, common operands | Actual `comparePathHistory` return and trace; `Aref` is not recomputed from fine exposure |
| F13 ordinaryEnd | Real `provider.ordinary` result at stored final endpoint |
| F13 incomingEnd | Actual partition's final subinterval `end.T1`, with segment 0 and TEMPORAL_MINUS context |
| V10 fineNativeEabs | EXP over the real fine native partitions; not T*Aref or integration of common history nodes |
| Typed rejection and exact offending work | Native return plus original CAP generated prefix; nested cause and outer status both retained |
| Comparison residual/tolerance/refinement | Actual CMP result, preserving raw inputs and native trace references where inputs were real estimates |
| Eligibility, oracle, requirements, ledger and selection | Actual CTRL returns and capture; original objects retain seals for subsequent calls |
| Supplemental arithmetic result | Actual AR return or actual accumulator total |

Evidence selectors identify operation, native type/schema, role, step/subinterval or controller requirement and field path. They may project fields, resolve references and count recorded events. They may not reevaluate a provider, solve crossings or integrate/sum scientific streams. Retain full native evidence, not only selected scalar fields. [TYPES; S §§13–15; CAP]

## 10. Assertions and applicability

An assertion contains: stable local ID under its item/repetition; frozen obligation key; source citation; expected binding; actual selector(s); units; comparator and allowance binding; applicability predicate and its evidence; status; rejection match/mismatch where relevant; reason and provenance references. IDs for expansion of a required string remain children of that string, so an implementer cannot silently replace the obligation with a weaker check.

Applicability is `APPLICABLE`, `NOT_APPLICABLE` with an authoritative reason, or `UNRESOLVED`. The latter is incomplete. Numerical assertions are conditional on a successful estimate only when the declared fixture expects rejection. Unexpected rejection of a success fixture is a rejection mismatch, not a way to turn its obligations into successful non-applicability.

| Situation | Assertion disposition |
|---|---|
| Required actual and reference exist; comparator satisfied | PASS |
| Complete trustworthy actual contradicts a frozen numerical/structural/typed expectation | FAIL, classified as numerical mismatch, structural mismatch or rejection mismatch |
| Required rejection matches status/code/reason and required reachable operation | PASS with `EXPECTED_REJECTION_MATCH`; downstream numerical obligations NOT_APPLICABLE |
| Expected rejection replaced by success, another status, or the right code at an unrelated earlier stage | FAIL with `EXPECTED_REJECTION_MISMATCH` |
| Required input binding, capture, reference, evidence selector or operation record is missing/untrusted | INCOMPLETE with explicit missing dependency; never numerical zero |
| Authorized operation is not applicable by declared support/early-stop semantics | NOT_APPLICABLE, with source and actual cause; contributes no fabricated PASS assertion |
| Ordinary controller INVALID CONTROL or QUALIFICATION_INCOMPLETE matches a prepared probe's frozen expected decision | PASS for that controller-behavior assertion; retain the returned state unchanged |

Expected status text is split according to the actual native union: FAILED carries `code`/`operation`; UNSUPPORTED and N_A carry `reason` and `value:null`. A native failure without a `value` property stays without it; normalized affected estimate slots may be null but must not rewrite the return. `capture.COMPLETE` or `definitionComplete` alone cannot satisfy any scientific assertion. [S §14; TYPES; R; EF; CR]

## 11. Early failure and capture retention

Before an operation, retain the plain data declaration and constructed arguments as CODEC tagged input. Function-valued options are represented by declared recipe plus data, not by claiming to serialize a closure. Use `captureFailure` for its supported operations, returning the actual `.result` unchanged and a separate `.capture`. Provider methods and accumulator sequences use `createCapture`/`closeCapture` around the existing method(s), with original input encoded before invocation. These are already approved capture APIs, not a new recorder. [CAP; CD §§C–E]

Retain all executed parent/child journals with separate root IDs; their invocation-local call counters may restart. Full success traces and any already successful sibling result remain linked. No second invocation fills missing evidence. Stop after an expected top-level rejection; expected failing graphs do not call EXP merely to propagate a PART failure. Inside a real API preserve its reviewed eager calls and short circuits (§7).

R's generic failure trace names are stage-dependent obligations. `candidate-boundaries` means preserve enumerated candidates **if enumeration occurred**. A pre-partition rejection records `NOT_GENERATED_BEFORE_REJECTION`, the actual factory/path failure and original inputs. It cannot require fabricated empty partition evidence as though partition ran. Likewise `generated-failing-step-or-subinterval-trace` means the complete generated prefix at the reached stage. This transcribes S §14 and CD/CR, without changing any required-trace string in R.

* F07: retain ordered candidate indices `[1,2]`, generated lambda `1/4`, represented time `2^53`, accepted start only, zero provider queries. The second candidate has identity but no computed time/position; final endpoint was not pushed.
* V14: retain both lambdas `1/4,5/16`, both represented times `2^53+2`, the earlier accepted internal node and offending second candidate; no successful merged partition.
* F21/V01/V02: actual `provider/height-order` rejection with original topology and offending index; provider/path fingerprint NOT_CREATED under RP, no PART/candidate/evaluator trace expected.
* V03/V04/V05/V15: actual PATH rejection before provider/partition; no guessed path fingerprint.
* F19/V12/V16: preserve geometry already generated before support/domain rejection; no supported-fraction integral. F20 rejects at missing topology before enumeration.
* V11: preserve native partitions and union already generated, plus attempted coarse `t=1/2` explicit evaluation, raw nonfinite operand and native `provider/operands` failure. No later fine common endpoint is generated merely for symmetry.
* V08: preserve completed PART and actual exponent/product state at overflow. A final Infinity must not be invented if the algorithm rejected before forming it. Raw prior state is forensic, never accepted Esigned/Eabs.

The facade closes its journal in `finally` but does not return the pair if the scientific operation throws. If a future fixture boundary needs the surviving prefix on that path, use the approved explicit context and close it at that boundary, retaining the original exception as infrastructure failure. Do not claim the facade returned unavailable capture. No retry or fake typed scientific return is permitted. Recorder/export failure produces evidence INCOMPLETE even if an actual result survived. [CR limitations; FT escaped-exception tests]

## 12. In-memory fixture/repetition record

This is a semantic field inventory, not a TypeScript implementation or filesystem schema. It complements the exact foundation envelope; it does not change that envelope's fields. [S §§12–15; EF; CD §D]

| Field group | Required meaning |
|---|---|
| Identity | Exact item/category/version, frozenFixture relation, optional supplemental source-case key, repetition ordinal and expected count |
| Registry | Full declaration and whole-definition reference/content, schema/version, reviewedRecipeBaseline when applicable, declaration verification state |
| Authority | Frozen ID/hash and separately recorded verification evidence; inspected HEAD is provenance, not execution identity |
| Recipe | Draft/reviewed recipe identity, class, exact constructors/arguments, evaluator formula/version, role and alias map, ordered operation plan |
| Declared input | Original R tokens and tagged executable plain data, artificial profile/gradient/column recipes, support, interval, coefficients; no observed input |
| Operations | Actual call IDs, symbol, dependency inputs, order, result/throw/interruption, nested capture links and native result object for live API use |
| Actual evidence | Retained immutable native traces/data, actual fingerprints where created, selector references, original generated-prefix captures and availability |
| Expected references | Owner/source, rational strings/derivation, expected typed outcome, final rounded value, independently declared allowance inputs and actual allowance result |
| Assertions | Required obligation inventory and explicit per-assertion applicability, comparison, result, reasons and provenance |
| Typed failures | Original status/code/reason/operation and parent mapping, failing operation/capture IDs, affected final quantities null/not produced |
| Completeness | Construction/input binding, operations, native evidence, capture, references and applicable obligations independently COMPLETE/INCOMPLETE; reasons retained |
| Accounting | Planned operations not reached, expected-stop cause, blocked dependencies, repeated-group links; never inserted as executed records |
| Verdict | PASS/FAIL/INCOMPLETE with claim scope, failed IDs, missing IDs and expected-rejection disposition |
| Future binding | Implementation, runtime closure, persisted artifact and reconstruction states explicitly NOT_BOUND/NOT_PERFORMED until real bindings exist |
| F22 reconstruction/equality | Per-repetition construction and non-aliasing evidence; fresh capture-instance existence/uniqueness and semantic link mapping; three separately ordered stream payloads/digests; independent bit comparisons and repetition-group comparison results (§14) |

Live controller/provider objects may be referenced inside this in-memory unit; data snapshots are separate. A snapshot cannot substitute for a sealed controller input. Missing profile internals do not disappear behind a fingerprint; the reproducible artificial constructor recipe must exist. Native history's Node/V8 strings are actual fields, not a verified runtime/dependency closure. No artifact path, byte hash or reconstruction result is asserted before that later work exists.

For F22 retain immutable/native evidence before ending a repetition; retained references do not permit reusing its live scientific objects for the next repetition. Keep ordinal, fresh opaque capture identities and future process/path/binding bookkeeping in the enclosing record outside equality payloads. Preserve their existence, uniqueness and linkage in completeness evidence; exclusion from equality does not mean omission from the record. [HD]

## 13. Fixture verdict semantics

Proposed total precedence: **INCOMPLETE → FAIL → PASS**. Retain known failed assertions even when a missing required dependency makes the aggregate INCOMPLETE; this precedence avoids implying full evaluation of an incomplete unit. [S §14 separation of failed checks and incomplete evidence; EF/CD]

1. INCOMPLETE if any applicable required binding, original evidence, reference, execution record or assertion is unavailable/unresolved, or execution was interrupted/escaped its contract. A merely planned fixture is INCOMPLETE/NOT_EXECUTED, never PASS.
2. Otherwise FAIL if any applicable required assertion fails. An unexpected typed rejection is a FAIL when its full bound evidence proves mismatch. This is fixture qualification failure; it is not automatically production physics failure or observed INVALID CONTROL.
3. Otherwise PASS only if every applicable frozen obligation passes, all non-applicable obligations have justified applicability records, and all required evidence for that scope exists. An expected malformed/support/unavailable outcome can therefore yield a fixture PASS.

One complete record is not registry certification. A fixture's semantic verdict and global prerequisites are separate: missing later persistence/runtime/reconstruction obligations keep whole-suite qualification incomplete even when its in-memory numerical unit could pass. F22 itself cannot pass until all five fresh repetitions independently satisfy the analytic obligations and all three streams and required bits agree (§14). Per-repetition local outcomes do not assert that group-level determinism has passed. No verdict is produced by this design task.

## 14. F22 determinism and repetition boundary

Settled by S §§12–15 and R: exactly **five** qualification repetitions; exact same declared artificial data; Esigned=2, Eabs=2, R1=0, Aref=2; full traces for every repetition; bit-identical values; exact event identities and ordering; exact-byte stream digest equality. Repetition ordinal is bookkeeping, never a changed scientific input or a reason to alter a provider/path fingerprint.

Compare numerical bits separately from CODEC canonical bytes: canonical encoding normalizes -0, so digest equality alone cannot prove bit identity. Preserve native ordered arrays, endpoint-side contexts, contact IDs, contributions and available bounds/status. Reference repetition one is a determinism comparator only; its numerical answers must independently satisfy the frozen rational references, just like repetitions two through five. Five equally wrong runs cannot pass. [S §12; R F22; ET/HT repetition checks]

### 14.1 D1 resolved by HD: fresh reconstruction and exact graph

F22 consists of exactly five qualification repetitions total, reconstructed from the same immutable R declaration and the same executable recipe (which must be reviewed before any future execution). Execute the following order in each repetition; the arrows are success dependencies under §§7,11:

1. Construct a fresh coarse accepted path using `createAcceptedPath`.
2. Construct a fresh coarse diagnostic provider using `createDiagnosticProvider` and §6.1's exact declaration binding.
3. Construct a fresh fine accepted path using `createAcceptedPath`.
4. Construct a fresh fine diagnostic provider using `createDiagnosticProvider`.
5. Obtain real coarse native partitions through `partitionAcceptedStep` in chronological step order, using ELIGIBLE/FULL_SUPPORT.
6. Call `integratePathExposure` on those real coarse partitions with PRIMARY role. This result owns F22 Esigned/Eabs.
7. Call `comparePathHistory` on the fresh coarse/fine path-provider pairs, ELIGIBLE, PRIMARY, interval [0,1]. This result owns F22 R1/Aref and all its native history evidence.

Coarse and fine live scientific objects MUST NOT alias, even though the declarations and resulting scientific fingerprints are identical. Across repetitions, declared vertex/time/coefficient/support inputs, evaluator identity/version, role and interval arguments must be identical, with binary64 inputs bit-identical; fresh objects do not permit changed scientific data. Each captured top-level invocation has a fresh capture context/root; nested calls retain the owning API's context structure. After the repetition retains its required immutable/native evidence, no live scientific object from it may be reused by the next repetition. Record construction, role bindings, non-aliasing and capture freshness separately from fingerprint equality. [HD D1; CD; CAP]

HIST still performs its own native coarse/fine partition and evaluation work. Retain it in addition to the earlier coarse exposure partitions; do not inject cached partitions into HIST, replace its work or short-circuit it. **No separate fine-exposure obligation is added to F22**; V10 owns fineNativeEabs. An unexpected failure follows §§7,11,13: retain only executed evidence, mark dependent steps blocked, and do not repair/replay the repetition to obtain full traces. Five successes cannot be assembled by discarding failed attempts.

ET/HT's reused-object tests remain historical developer evidence, not F22's qualification graph. Their baseline plus five-loop pattern does not authorize a sixth repetition. HD defines the stronger claim: deterministic fresh construction/execution from identical declared inputs.

### 14.2 D2 resolved by HD: three ordered equality streams

Define exactly three separate equality streams per repetition: **SCIENTIFIC**, **OBSERVATION**, **QUALIFICATION**. The ordering below makes HD's semantic content explicit; it is not a filesystem format or a new codec schema. An operation's semantic key is its step in §14.1, API symbol and role, plus chronological step index for repeated PART calls. That key excludes the repetition ordinal. Preserve native arrays in their emitted order and CODEC's canonical object-key order. Never filter a scientific, observational or qualification field because it differs.

| Stream | Explicit record order and required content |
|---|---|
| SCIENTIFIC | First the coarse path result, coarse provider's scientific data, fine path result and fine provider's scientific data, in construction order; next one complete native coarse PART result per chronological step; then the complete coarse EXP result; then the complete HIST result. Each record includes its semantic operation key/status and all deterministic scientific data emitted for it. Provider scientific data includes fingerprint/topology/version/support/segment/boundary identities; executable methods are bound by retained recipes, not falsely encoded as data. Preserve all returned path data, partition nodes/intervals/contact order and ownership, full exposure evidence/trace, contributions/zeros/invariants/allowances, and full history evidence/trace including its coarse/fine native partitions, common nodes/evaluations/operands/contributions and endpoint contexts. Preserve native history runtime fields as emitted scientific evidence; they are not the separate NOT_BOUND runtime bookkeeping. Keep exact binary64 representations linked to their field positions as required below. No flattening or deduplication removes repeated native evidence |
| OBSERVATION | Capture blocks follow §14.1's top-level operation order, with PART blocks in chronological step order. Within a block retain capture coverage/reasons and every generated-prefix event in its actual sequence order: site/event type, complete retained value/operands/results, provider queries and nested call/return relationships. Include captures for qualification allowance invocations after graph blocks, in the QUALIFICATION allowance order below. Express nested links by semantic operation key and the existing within-root call/parent and event-sequence order; preserve the ordered tree rather than sorting by regenerated object identity. CAP's event type is conveyed by its site (including enter/begin/return/caught labels); do not invent VM events or missing private evaluator internals |
| QUALIFICATION | First the exact independent reference declaration/derivation and rounded expected value for Esigned, Eabs, R1, Aref, in that order; then their applicable independent allowance input/returned-evidence records in the same quantity order (exact comparators retain explicit non-applicability instead of a fabricated allowance); then per-repetition assertion records in the order specified below; finally the deterministic local completeness and verdict-relevant summary for that repetition. Include sources, expected bindings, applicability, actual semantic selectors, comparator outcomes and expected-rejection disposition (F22 expects success). This stream characterizes qualification of the repetition, without substituting computed reference values for actual science |

Per-repetition assertions have this deterministic grouping: (1) declaration/recipe binding, seven-step graph order, fresh/non-aliasing object and capture checks; (2) R's `requiredTraces` in declaration order; (3) R's `requiredAssertions` in declaration order for their per-repetition obligations; (4) quantity-reference comparisons Esigned, Eabs, R1, Aref. Within an obligation, expanded child assertions use their stable local IDs in UTF-16 code-unit order, with chronological native arrays unchanged inside each record. Repetition ordinal and fresh opaque IDs are absent from equality assertion IDs/selectors; their enclosing-record bindings remain retained. The cross-repetition obligations of R's bit/value/event/digest assertions are resolved at group scope below, not falsely marked locally satisfied before comparisons exist. [HD D2; R; CODEC; §§5,10]

Only intentionally regenerated live-instance linking identities are excluded from the observational equality projection. For current CAP, the numeric `call`, `parent` and `sequence` fields describe deterministic invocation-local order, so retain them scoped by the semantic operation key; they are not discarded merely for being local. Fresh root/context/token object identities stay outside equality with their existence, uniqueness and full link mapping retained in the repetition record. This preserves parent/order semantics without demanding equality of different live tokens. [HD D2; CAP `CaptureEvent`; CD]

All three equality payloads exclude intentionally differing repetition bookkeeping: repetition ordinal, fresh opaque capture root/context/token IDs, future wall-clock/process IDs, future artifact paths, and implementation/runtime/persistence NOT_BOUND/NOT_PERFORMED bookkeeping that is not scientific output. Keep these outside the projection in the enclosing record and completeness evidence. These exclusions never apply to a native scientific field simply because its value differs. A missing required field/capture is INCOMPLETE; a complete differing required payload is a determinism mismatch, not permission to prune it.

Use approved CODEC encoding for each ordered stream independently: UTF-8 canonical records, exactly one LF after every record, SHA-256 via `reconstructedStreamDigest`, hash kind `RECONSTRUCTED_STREAM_SHA256`. Retain stream identity and payload references with each digest. Noncanonical forensic values use CODEC's existing lossless tagged data channel. No opaque combined digest or digest of only four scalars is sufficient. These are in-memory stream digests; neither `ARTIFACT_BYTES_SHA256` nor successful fresh-process reconstruction is claimed. No digest is computed by this design task. [HD; S §13; CODEC]

### 14.3 Bit equality, group comparison and acyclic verdict evidence

Compare exact binary64 bits independently in addition to the three digests: all numeric scientific fields of the retained F22 results/traces, including Esigned/Eabs/R1/Aref, are matched at the same semantic operation/field/array position. Retain the bit representations using the approved tagged binary64 representation; do not depend on canonical number serialization, which normalizes signed zero. Compare original ordered scientific/event structures as required by R, not only their scalar summaries. [HD; S §12; CODEC]

Each repetition independently satisfies its four frozen rational references and applicable structural/evidence obligations. Repetition 1 is only the determinism baseline. Compare repetitions 2,3,4,5 to repetition 1 in ordinal order; for each pair retain scientific-bit/structure comparison outcomes and separate SCIENTIFIC, OBSERVATION, QUALIFICATION digest comparisons in that order. Equality of five incorrect calculations never yields PASS.

Per-repetition QUALIFICATION payloads contain local comparison outcomes and local verdict-relevant data, not their own digest or the group verdict that depends on that digest. Group comparison records and final F22 verdict are retained in the enclosing repeated-fixture record after stream digests exist. This is the existing no-self-hash/acyclic dependency rule applied to HD's streams, not omission of a differing comparator result. Group records include baseline/other repetition links, each stream's two digest values and equality outcome, bit/structure outcomes, missing evidence and final verdict. They are not an additional equality stream. [CODEC/EF acyclic evidence; §§7,13; HD]

F22 PASS requires five complete fresh repetitions, all independent per-repetition obligations satisfied, exact required bit/structure agreement and all three stream digests equal for every comparison pair. Complete disagreement is FAIL; missing required evidence/comparison is INCOMPLETE under §13. The record retains both failed checks and missing dependencies. Future persistence and reconstruction remain separate prerequisites and are not established by these in-memory checks.

## 15. Future whole-registry accounting obligations

Retain R's exact declared order and category. Inventory all 22 F items, 16 V items, 11 supplementals and four prerequisite inventories, including each prerequisite's required strings. Validate whole-definition equality, not just IDs. An executor must account for duplicates, omissions, foreign items, altered expectations, missing source-case parameters and wrong repetition counts explicitly. [R validators; EF; RD; S §15]

F/V repetition slots total **42**: 37 single repetitions plus five F22 repetitions. This is an accounting expectation, not a count of API calls or executed tests. Eleven supplemental declarations are additional semantic units, with their frozen internal source scenarios; the four inventories are not four numerical fixture executions. Their child obligations cannot be silently replaced by those eleven units alone.

For F22, account for the seven-step graph in each of its five slots, three stream payloads/digests per repetition (15 total), and four baseline-to-repetition comparison records containing three separate digest comparisons each (12 total), alongside independent bit/structure comparisons. Missing stream evidence is not an empty successful stream; no prior repetition's scientific objects or payloads may stand in for a fresh execution. These counts describe §14's human-resolved obligations, not an executed qualification result.

Each expected unit records NOT_EXECUTED, EXECUTED or BLOCKED with cause, required/applicable status, evidence references and verdict. A prerequisite may be outside this design's execution scope and still mandatory for eventual certification. It must remain visibly unsatisfied/NOT_PERFORMED, never omitted or marked not applicable merely because its implementation is deferred. Failed construction can legitimately make downstream operation traces non-applicable; it cannot make the entire registry item vanish.

A reusable prerequisite observation may be referenced by several items only with explicit exact recipe/runtime/source binding and claim scope. Do not import a historical developer-test PASS count as a current qualification record. Global certification must fail closed on missing required units, repetitions, traces or prerequisite evidence. This defines obligations, not executor code, scheduling, CLI or future architecture order.

## 16. Full F01–F22 coverage matrix

Notation: `Y` is ordered vertex heights, `t` ordered vertex times, `X=Z=0` unless stated; `K` is provider heights; listed fields are segment-local T1 formulas; `FULL` abbreviates `FULL_SUPPORT` in support lists. Unless overridden: `Y=t=[0,1]`, `K=[0,1]`, field `2`, identity label `artificial-registry/v1`, FULL_SUPPORT, SEGMENT_AFFINE, interval from first to last time. All unspecified coefficients are zero. E/H/R* classes, AE/AH/AX/ST/RJ/EV classes and evidence ownership are defined above. Each row is bound to **its exact R entry** and S §15's same-numbered fixture; PT/ET/HT corroborate behavior, not differing test inputs. “None” in the last column means no additional item-specific semantic question; all rows still await this design's review.

| Frozen item and exact recipe parameters | Class / real operations | Independent expected/reference and assertion class | Actual evidence / expected outcome | Order / stop / unresolved |
|---|---|---|---|---|
| P2-F01: Y=[0,1], t=[0,4], field -3 | E: PATH→PROVIDER→PART→EXP | R: Esigned=-12/1, Eabs=12/1; AE, ST zero interior knots | EXP totals; PART crossingCount=0; COMPLETE | Native single step; none |
| P2-F02: t=[0,2], field 1+2t | E | R integral 2+4: Esigned=Eabs=6/1; AE | EXP and explicit endpoints; COMPLETE | Preserve endpoint field evaluation; none |
| P2-F03: K=[0,1/4,1], fields [1,3] | E | R weighted areas: Esigned=Eabs=5/2; AE, ST | PART has separate temporal limits at 1/4; EXP COMPLETE | Split before EXP; no unsplit jump average; none |
| P2-F04: K=[0,1/2,1], fields [t,t+2] | E | R areas 1/8+11/8=3/2 for both; AE, ST | PART limits [0,1/2] and [5/2,3]; EXP COMPLETE | No cross-jump interpolation; none |
| P2-F05: K[j]=j²/1024, j=0..32; field i+1 for i=0..31 | E | R sum j(2j-1)/1024=1397/64 both totals; AE, ST | PART/EXP: 32 positive ordered intervals, every internal boundary; COMPLETE | All declared intervals retained; no cap; none |
| P2-F06: K=[0, .5+j/4096 for j=0..32, 1]; 34 fields all 2 | E | R Esigned=Eabs=2/1; AE, ST; no-cap source prerequisite | PART 33 crossings/34 positive intervals; EXP COMPLETE | No threshold on crossing count; none |
| P2-F07: t=[2^53,2^53+2], K=[0,1/4,1/2,1], fields all 2 | RK: PATH→PROVIDER→PART | R FAILED/NUMERICAL_AMBIGUITY; RJ, EV; FT first collapse | Actual partition/crossing-order failure and capture; expected typed rejection | Stop PART; first time collapses to start, zero queries; none |
| P2-F08: K=[0,1/2,1], fields [1,3] | E | R Esigned=Eabs=2; AE; ST segments 0→1, incoming 1/outgoing 3 | PART temporal sides and EXP COMPLETE | Increasing time/upward height; none |
| P2-F09: Y=[1,0], K=[0,1/2,1], fields [1,3] | E | R both totals 2; AE; ST segments 1→0, incoming 3/outgoing 1 | PART reverse height ordering, EXP COMPLETE | Stationary scalar reversal only; none |
| P2-F10: Y=[0,1/2,1], t=[0,1,2], K=[0,1/2,1], fields [1,3] | E, two PART calls | R both totals 4; AE; ST one shared vertex identity, no double-count | Two actual partitions and EXP COMPLETE | Step 0 then 1, same shared contact ID; none |
| P2-F11: Y=[1/2,1/2], X=[0,2], t=[0,1], K=[0,1/2,1], fields [t+x,1+t+x] | E | R owned 1+3t area=5/2; AE, ST dwell/zero crossings | PART segment 1, DWELL, VALID_DEGENERATE, endpoint T1 values [1,4]; EXP COMPLETE | Positive duration/time-horizontal evaluation; none |
| P2-F12: Y=[0,1/2,0], t=[0,1,2], K=[0,1/2,1], fields [1,3] | E, two PART calls | R both totals 2; AE; ST shared contact/no opposite-side visit | PART segment 0 on both steps; EXP COMPLETE | No residence in upper side; none |
| P2-F13: Y=[0,1/2], K=[0,1/2,1], fields [1,9] | O: E→ordinary(final) | R Esigned=Eabs=1; ordinaryEnd=9, incomingEnd=1; AE, AX/ST ownership | EXP totals; PART final end.T1/context; real ordinary value/context; COMPLETE | Ordinary upper segment 1 versus incoming segment 0; keep both calls/results; none |
| P2-F14: t=[0,4], field 3-(3/2)t | E | R Esigned=0 exactly positive zero; Eabs=6 by two triangles; AX, AE, ST | EXP total bits and zeroFraction=1/2 contribution metadata; COMPLETE | Local zero adds no provider event; none |
| P2-F15: coarse=fine K=[0,1/2,1], fields [1,3], identical Y/t | H | R R1=0 exactly, Aref=2; AX identity-zero, AH | HIST native/common operands, residual and reference; COMPLETE | Both roles use identical evaluation inputs; none |
| P2-F16: field 1+2y; coarse Y=t=[0,1]; fine Y=t=[0,1/4,3/4,1] | H | R R1=0, Aref=2, alternate-encoding allowance; AH, ST | HIST own coarse step 0 and fine steps 0/1/2; COMPLETE | Union includes redundant fine vertices; not exact-zero waiver; none |
| P2-F17: K=[0,1/4,1], fields [2,-6]; coarse Y=[0,1], t=[0,2]; fine Y=[0,1/2,1], t=[0,3/2,2] | H | R residualArea=2, R1=1, referenceArea=9, Aref=9/2; AH | HIST two crossing times 1/2 and 3/4; COMPLETE | Retain both jumps and fine step 3/2; no area from exposure difference; none |
| P2-F18: coarse field 3-4t, identity coarse-affine/v1; fine field 1, identity fine-constant/v1; same Y/t | H | R residualArea=R1=Aref=1; two triangles for 2-4t; AH/ST | HIST signed endpoint differences/local zero metadata; COMPLETE | Distinct provider bindings; zero not union node; none |
| P2-F19: K=[0,1/2,1], fields [2,2], knot support [FULL,FULL,BOUNDARY_CONDITIONED] | RK | R UNSUPPORTED/BOUNDARY_CONDITIONED; RJ/EV | PART support failure after geometry; no complete exposure | Primary whole step rejected; no fraction recovery; none |
| P2-F20: K=[], fields=[], support UNAVAILABLE | RU | R N_A/COLUMN_UNAVAILABLE; RJ/EV | Actual null Analysis factory COMPLETE then PART N_A/null | No enumeration, PART stop; never generic empty-topology factory; none |
| P2-F21: K=[0,1/2,1/2,1], fields [2,2,2] | RP | R FAILED/MALFORMED_PROFILE; RJ/EV | PROVIDER height-order return and original tagged topology | Before path/partition; no candidate trace; none |
| P2-F22: identical coarse/fine declarations K=[0,1/2,1], fields [1,3], Y=t=[0,1]; repetitions=5, distinct fresh live objects | D: coarse PATH/provider→fine PATH/provider→coarse PART→coarse EXP→HIST | R Esigned=Eabs=Aref=2, R1=0 independently each repetition; AE/AH/AX/EV plus exact repetition relations | Full native results/traces, exact scientific bits and separate SCIENTIFIC/OBSERVATION/QUALIFICATION streams; COMPLETE expected | HD D1/D2 resolved: seven-step order, no alias/reuse, no separate fine EXP; all five repetitions and three streams required |

## 17. Full V01–V16 coverage matrix

Defaults and exact-declaration binding are identical to §16. Each row is separately required by R and the additional prerequisites of S §15.

| Frozen variant and exact parameters | Class / real operations | Independent expected/reference and assertions | Actual evidence / expected outcome | Order / stop / unresolved |
|---|---|---|---|---|
| P2-V01: K=[0,NaN token], field 2 | RP: PROVIDER | R FAILED/MALFORMED_PROFILE; RJ/EV | provider/height-order, original NaN bits and token | Factory stop; none |
| P2-V02: K=[0,1,1/2], fields [2,2] | RP | R FAILED/MALFORMED_PROFILE; RJ/EV | provider/height-order with original descending order | No sorting, factory stop; none |
| P2-V03: t=[0,0], Y=[0,1] | RX: PATH | R FAILED/INVALID_TRAJECTORY; RJ/EV | path/time-order; original zero duration | No provider/partition; none |
| P2-V04: t=[1,0], Y=[0,1] | RX | R FAILED/INVALID_TRAJECTORY; RJ/EV | path/time-order; original reversed time | No provider/partition; none |
| P2-V05: t=[0,+Infinity token], Y=[0,1] | RX | R FAILED/INVALID_TRAJECTORY; RJ/EV | path/finite; tagged Infinity, not null | Before time-difference/partition; none |
| P2-V06: Y=[0,1/2-2^-54], K=[0,1/2,1], fields [1,3] | E | R Esigned=Eabs=1; AE, ST zero crossings/no endpoint contact | PART represented endpoint and null contact; EXP COMPLETE | No snapping; none |
| P2-V07: coarse identity recipe; fine K=[0,1/2,1], fields [1,3], Y=t=[0,1/2,1] | H | R R1=0, Aref=2; AH/ST simultaneous metadata | HIST one time node at 1/2, all role/step/contact events; COMPLETE | Coarse before fine; native eventOrder preserved; none |
| P2-V08: t=[0,2], field Number.MAX_VALUE | RE: PATH→PROVIDER→PART→EXP | R FAILED/NONFINITE_ARITHMETIC, scaledProduct3/overflow; RJ/EV | Complete partition endpoints, EXP and arithmetic capture | Stop EXP; no manufactured final overflow number; none |
| P2-V09: Y=[1,1/2,1], t=[0,1,2], K=[0,1/2,1], fields [1,3] | E | R Esigned=Eabs=6; AE/ST no opposite-side visit | PART upper segment on both steps, EXP COMPLETE | Touch-return from above remains its own V identity; none |
| P2-V10: coarse Y=t=[0,1/2,1]; fine Y=t=[0,1]; both K=[0,1], fields [0], evaluator t² | H+Ef | R R1=0, Aref=3/8, fineNativeEabs=1/2; AH/AE/ST; independent interpolant derivation §8 | HIST R1/Aref and fine native partitions→EXP Eabs; COMPLETE | HIST then fine EXP; never use common nodes for native EXP; none |
| P2-V11: coarse Y=t=[0,1], field 1, NONFINITE_AT_HALF; fine Y=t=[0,1/2,1], field 1, SEGMENT_AFFINE | RH: HIST after both constructions | R FAILED/NONFINITE_ARITHMETIC at provider/operands; RJ/EV/ST foreign-node path | HIST failing COARSE evaluation at 1/2 and raw NaN in capture | Native coarse endpoints 0/1 succeed, fine native steps succeed, then common coarse endpoint fails; none |
| P2-V12: F19 support/topology/fields, Y=[0,1/2] | RK | R UNSUPPORTED/BOUNDARY_CONDITIONED; RJ/EV | PART rejects owned upper contact despite supported incoming closure | Stop before exposure; no fraction recovery; none |
| P2-V13: Y=[1/4,1/4], field 2 | E | R Esigned=Eabs=2; AE/ST VALID_DEGENERATE, zero crossings | PART one positive-duration interval and EXP COMPLETE | No height division; none |
| P2-V14: t=[2^53,2^53+8], K=[0,1/4,5/16,1], fields all 2 | RK | R FAILED/NUMERICAL_AMBIGUITY; RJ/EV | PART crossing-order, two distinct lambdas/equal represented times | Keep first accepted interior node, reject second; none |
| P2-V15: first vertex (t,x,y,z)=(0,0,0,0), second=(1,NaN token,1,0) | RX | R FAILED/INVALID_TRAJECTORY; RJ/EV | path/finite and exact tagged coordinate | Before provider/partition; none |
| P2-V16: Y=[1/2,2], K=[0,1], field 2 | RK | R UNSUPPORTED/OUT_OF_DOMAIN; RJ/EV | PART generated boundary at y=1 then domain rejection | Retain geometry, no extrapolation or numeric zero; none |

V11 must not share the coarse failing evaluator with fine, directly query 1/2 before HIST, inject an error input into HIST, or use native exposure failure as a substitute. Those graphs would not test the declared foreign-node route. F20 and F21 similarly require actual distinct construction paths. [R; PROVIDER; HIST; HT foreign-grid failure; FT]

## 18. All 11 supplemental declarations

The exact baseline source/test named by R, including helper definitions and source-case parameters, is part of each recipe. The details here make that binding reviewable; source-bound prepared inputs are not relabeled as native estimates. All rows also require original inputs, actual operation evidence, assertions and completeness (EV). No test module is imported or executed by this document.

### 18.1 Shared exact source recipes

**Adapter data (PT):** `EnvironmentalWindProfile` levels at `[0,.5,1]`, level i velocity `{eastward:i,northward:i*i,vertical:0}`; updraft parameters as §6.1. Source/Analysis gradient fingerprint `fixed-gradient/v1`. Query positions `(x,y,z)=(.25,y,0)`, time 0. Analysis support `[FULL_SUPPORT,FULL_SUPPORT,BOUNDARY_CONDITIONED]`; retain PT `analysis()`'s complete artificial provenance object verbatim (including transform/version, TIME domain, cutoff 40, interval 1, 81 taps, Hamming/zero-phase and support metadata). No filter/parser or observed column is invoked.

**Comparison data (CT):** `context(level,b=4)` has interval `[0,4]`, channel `synthetic-diagnostic`, PRIMARY, run/path labels `run-level`/`path-level` and next level; timesteps `2/2^level` and `1/2^level`. CT `history`/`exposure` and shared `allowance` define all prepared fields verbatim, including empty input traces explicitly marked as stub data. Arithmetic bounds carried by those stubs are not permission to widen scientific criteria.

**Controller data (QT):** `syntheticProvider()` uses heights `[0,2000,3000,4000]`, identity `artificial-controller-field`, version v1, T1=1, omega=[1,0], gradient=[1,0]. QT `input(m,r,options)` supplies hand-authored coordinates, ticks, initial velocity, metadata and termination using exact P2 literal identities. Its velocity is `(-(C_E-10),0,C_N)` and samples use the frozen helper expression. Default end=1 with final height 5000/SOURCE_EXIT; full=true gives 540/MAX_TIME. These are artificial accepted inputs, not Euler/observed collection. `group` covers five members × four resolutions. `preparedEntries`, `changeResult`, `withIncomplete` and the global-ledger `beforeAll` recipes remain source-bound data preparation, not alternate controller decisions.

| Supplemental ID | Executable recipe and real APIs | Independent expected/reference and assertion class | Actual evidence / expected outcome | Ordering / scope / unresolved |
|---|---|---|---|---|
| arithmetic-underflow | A: `scaledProduct3(Number.MIN_VALUE,.5,1)` | R bits `0000000000000000`, COMPLETE; REF referenceScaledProduct; AX | AR actual result bits and capture | One real call; ties-even zero, no dropped interval claim; none |
| arithmetic-cancellation | A: fresh accumulator, add `[2^53,1,-2^53]`, total | R rational 1/1, COMPLETE; REF referenceSum; AX | Actual add statuses/total and chronological capture | Preserve add order; never sum naïvely as actual; none |
| provider-source | P: PT named Source test; real `createSourceProvider`; ordinary y=[0,.25,.5,.75,1], explicit same context; lower segment explicit at .5; outside y=-1 | PT `DiagnosticTiltingTendency.sample` exact conformance; ordinary/explicit equality; lower differs; domain typed unsupported; AX/ST | Actual P2 operands/support, separate legacy comparator results | Fresh artificial profile/field; query sequence from named test, no duplicate diagnostic calls for capture; none |
| provider-analysis | P: PT named Analysis test; `createAnalysisProvider(column,…)`; ordinary y=[.25,.5,.75,1]; lower explicit at .5; ordinary .5 and outside y=2 | PT independent `queryAnalysisTiltingExplanationAt`; exact T1/support; explicit lower FULL, ordinary upper BOUNDARY_CONDITIONED; AX/ST | Actual adapter operands and typed OUT_OF_DOMAIN | Supplied column/provenance unfiltered; explicit lower query does not change primary eligibility; none |
| comparison-finer-history | C: context levels 0/1; prepared histories `(R1,Aref)=(0,100),(1e-6,0)` → two `compareHistory` → `compareSuccessiveRefinement` | CT named test/S §16: ordinary PASS, finer tolerance 1e-6, allowance .1*1e-6, non-worsening INVALID CONTROL; CP | Actual ComparisonBundle and RefinementEvidence; outer COMPLETE | Coarser then finer then refinement; frozen prepared inputs qualify CMP only; none |
| comparison-signed-scale | C: level-0 context; prepared coarse Eabs=1000, Esigned=2e-5; fine Eabs=1000, Esigned=0 → `compareExposures` | CT/S §16: ABS PASS tolerance 10; SIGNED INVALID CONTROL scale 1e-3/tolerance 1e-5; CP | Real separate checks and overall INVALID CONTROL in COMPLETE result | Never use Eabs for signed scale; this expected invalid control is fixture behavior PASS when matched; none |
| controller-actual-wiring | Q: default group() → `planGroup(candidate 0)` → `evaluateGroup` twice with Source/Analysis provider | QT named test: identical results, QUALIFICATION_COMPLETE but admission REJECTED, 90 entries, 29 refinements; history residual 0; CP/ST | Actual estimator traces retained in history/exposure details, Source SECONDARY_DESCRIPTIVE, real assessment | Two evaluations of same plan are frozen source probe, not F22 repetitions; no prepared estimate substitution; none |
| controller-irreversibility | Q: Analysis K=[0,2050,2100,2200,2300,4000], knot support [FULL,FULL,BOUNDARY_CONDITIONED,FULL,FULL,FULL]; input(0,0,end=2), heights [2000,2400,2000,2000,5000] → `prepareRun` | QT/S §8: primaryPrefix=0, sourcePrefix=1.5, primaryAtSample=[true,false,false,false,false], one analysis-loss; CP/ST | Actual RunEvidence prefixes/events | No external prefix calculator, no later reopen; stop at preparation as declared probe endpoint; none |
| controller-fourth-resolution | Q: full group then replace C0 h=.0625 with default short input(0,3) through `prepareRun`; `planGroup(lost,{T:180,h:.5})` | QT: interval [0,180], viable=false, only replaced run non-FULL_DURATION; CP | Real plan/run summaries | Fourth resolution outside comparison triple still required; do not invent evaluate/select step; none |
| controller-precedence-win | Q: exact QT global-ledger setup, restore first candidate's failed case0/seed7 group, replace case0/seed0 candidate1 with sealed incomplete assessment → `selectCandidate` | QT/S §17: QUALIFICATION_COMPLETE, selected candidate0=(540,.5), control completed check, NOT_AUTHORIZED; CP | Real sealed assessments and returned complete ordered decision | 4×8 groups×6 candidates=192 assessments per ledger; actual assessGroup seals; prepared metric inputs only; none |
| controller-precedence-block | Q: exact QT `all` ledger (candidate0 has case0/seed7 rejection), replace case0/seed0 candidate1 with sealed incomplete assessment → `selectCandidate` | QT: candidate2 groups ADMITTED yet QUALIFICATION_INCOMPLETE/selected null; CP | Actual assessed ledger/decision/reasons | Candidate0 rejected then candidate1 blocks; no selecting candidate2 in harness; none |

For both precedence rows, QT's complete baseline setup creates 640 artificial run identities, plans all six candidates for each case/seed, forms good/rejected/incomplete assessments through real `assessGroup`, and supplies the exact replacement ledger. The rejection changes the first geometry check to residual 11/INVALID CONTROL; incomplete input is declared FAILED/NONFINITE_ARITHMETIC at `artificial/overflow` for the selected geometry entry. This injected prepared input tests controller handling only and is explicitly **not** evidence that an estimator overflow occurred. Preserve original source helper values and all actual assessment calls; do not fabricate serialized seals. [R; QT global admission describe block; CTRL]

## 19. All four prerequisite inventories and their children

Each inventory is a required accounting object with source-backed child obligations below. Where a child refers to a parameterized source test/table, its entire frozen parameter list is required. The proposed binding uses the baseline source plus current approved capture boundary; later implementation review must verify this transcription. Deferred evidence requirements remain outstanding and block full certification. [R prerequisites; RD; EF; S §§3,12–17]

| Inventory ID / executable class / API and actual source | Required children and independent expectation | Expected outcome / ordering / unresolved or deferred |
|---|---|---|
| binary64-arithmetic / A and source-contract checks / AR actual returns, runtime expressions and FT capture | `separate-rounding-no-FMA`: AT “Number operations retain separate rounding…”; `subnormal-gradual-underflow`: complete relevant `bitCases`; `scaled-product-ties-even`: all `bitCases` plus rounded mantissa test against REF; `Neumaier-chronological-order`: AT ordered cancellation/correction tests against REF/reference constants; `finite-allowances`: AT gamma, duration/exposure/synthetic scale and invalid/unrepresentable allowance tests. AX/CP/EV; all exact bit cases and typed failure expectations stay source-owned | Required child assertions match; no scientific tolerance widened. Chronological accumulator operations preserved. Runtime execution/closure verification is future evidence; no current PASS |
| provider-adapter-conformance / P and identity checks / real factories, ordinary/explicit results and topology | `artificial-profiles-only`: PT wind/analysis/updraft declarations and source dependency audit; `ordinary-and-explicit-operands`: provider-source/analysis supplementals; `support-ownership`: PT boundary-conditioned primary, secondary, contact and domain cases; `immutable-fingerprints`: PT “provider snapshot and identities are immutable and scoped” plus PATH copy/fingerprint test. AX/ST/EV; exact original inputs and typed failures | All declared adapter claims satisfied; no observed parser. Queries/mutation checks follow frozen tests, never mutate a live scientific result for harness convenience. None additionally OPEN |
| controller-and-comparison / Q/C / actual CTRL plans, oracles, requirements, assessments/decisions and CMP bundles | `all-eight-all-four-resolutions`: QT complete admission and fourth-resolution tests; `whole-step-irreversible-prefix`: QT source-exit, Analysis interval and owned-contact tests; `oracle-and-lifecycle`: QT oracle discrepancy/immediate clipping, ground co-events and CT event/prefix tests; `both-pairs-finer-budgets`: CT successive-refinement describe block plus QT real wiring; `complete-ledger`: QT missing/duplicate/foreign/unvalidated run/entry/group scenarios; `ordered-incomplete-precedence`: both named supplements plus QT later-incomplete and exhaustion cases; `real-estimator-wiring`: controller-actual-wiring with full native traces. CP/ST/EV | Expected PASS/INVALID CONTROL/N_A/incomplete states are those declared in their artificial scenarios, not global scientific conclusions. Real seals/order/prerequisites mandatory; source-recipe counts cannot substitute for executed children. None additionally OPEN |
| qualification-evidence / reference, capture, binding and future evidence checks / REF, CAP, CODEC and future verifier evidence | `independent-rational-references`: REF no tested imports, AT dependency assertion and per-fixture references; `full-traces-every-fixture-and-repeat`: native traces plus approved failure prefix/applicability, including F22; `runtime-and-implementation-binding`: separately verified future closure; `canonical-artifact-hashes`: future saved-byte/stream evidence with CODEC kinds; `fresh-process-reconstruction-without-reintegration`: future real reconstruction evidence; `no-observed-dependencies`: transitive source/import audit. EV/AX; missing proof cannot become complete | In-memory reference/capture bindings are designed here; F22 D1–D2 resolved by HD, with five fresh repetitions and three separate equality streams (§14). Runtime closure, saved artifacts and fresh-process verification NOT_BOUND/NOT_PERFORMED in this gate. Their architecture/execution is deferred, not waived or automatically next |

The prerequisite inventories are broader than their eleven supplemental anchors. For example the two arithmetic supplemental calls alone do not prove all rounding cases; the two precedence supplements alone do not cover malformed ledger validation; a full original capture alone does not prove reconstruction. The executor must expand every required child and its exact frozen source scenarios before claiming inventory completeness. This is a semantic accounting obligation, not authorization to execute those tests now.

## 20. Difficult-case audit

| Boundary | Binding decision / evidence check |
|---|---|
| F13 ordinary/incoming | Two actual sources with explicit operation links; ordinary segment 1 gives 9, incoming segment 0 gives 1, integral 1; no ordinary-query substitution for incoming |
| V10 Aref/native Eabs | One real HIST result plus EXP of retained FINE native partitions, 3/8 versus 1/2; separate independent references; no scalar reconstruction from history |
| V11 foreign-node path | Failing evaluator only on coarse; coarse native t=0,1 finite; fine native grid introduces 1/2; real common coarse reevaluation fails before further common work |
| F20 unavailable provider | Null-column Analysis construction returns COMPLETE unavailable object; PART yields N_A, no generic malformed empty topology |
| F21 before partition | RP factory failure owns evidence; no partition/candidate/path fingerprint demanded or fabricated |
| F22 repetitions | Exactly five fresh seven-step executions; distinct coarse/fine objects and no reuse; coarse exposure then real history; three ordered equality streams plus independent bit checks; D1/D2 resolved by HD |
| Partial failure state | Generated candidates/contributions/accumulator state retained only in original forensic channel; no replay, no promoted partial estimate |
| Prepared supplementals | Stub numeric inputs visibly declared; actual CMP/CTRL output supplies the qualified behavior; real-wiring supplemental separately requires native estimator traces |
| Controller eager work | Outer graph stops without altering internal existing calls; returned sibling evidence retained in true order |
| Authority/status | Current approval supersedes historical capture-open prose; frozen identities/expectations remain exact; no automatic writer/verifier ordering |

## 21. Resolved human decisions and review closure

**D1 — RESOLVED BY HUMAN DECISION.** Section 14.1 transcribes exactly five fresh executions, non-aliasing coarse/fine scientific objects, fresh capture roots, coarse native partitions/exposure followed by real history, and no cross-repetition live-object reuse. F22 adds no separate fine exposure; V10 is unchanged.

**D2 — RESOLVED BY HUMAN DECISION.** Sections 14.2–14.3 specify separate SCIENTIFIC, OBSERVATION and QUALIFICATION streams with explicit deterministic ordering, narrow bookkeeping exclusions, preserved semantic capture relationships, independent binary64 equality and independent analytic checks for every repetition. Enclosing records retain excluded linking identities and the group comparisons/final verdict; no self-hash cycle or persistence/reconstruction claim is introduced.

Contradiction audit across the complete document: the general H sharing permission now explicitly excludes F22; D has its own seven-step graph; HIST retains its internal native work; record, verdict, accounting, F22 matrix, prerequisite inventory and difficult-case audit use the resolved repetition/stream semantics. The 42 F/V slots and four F22 numerical expectations are unchanged. V10 retains its distinct fineNativeEabs obligation. Expected early rejection and capture incompleteness elsewhere retain §§7,10–13 semantics. No further real authority gap or semantic conflict was identified.

The subsequent explicit HUMAN REVIEW DECISION approves the complete resolved design, including construction identity/version binding, evidence selectors, assertion precedence and D1/D2 as incorporated. The contract is CLOSED · HUMAN REVIEW APPROVED and FROZEN. Implementation/runtime identity, artifact schemas and reconstruction remain deliberately unassigned later-gate work. This closure authorizes no implementation, tests or execution.

## 22. Explicit exclusions and verification boundary

No fixture executor, runner, writer, fresh-process verifier, certificate, attestation, CLI or campaign orchestration was implemented. No numerical P2 algorithm, frozen registry identity/expectation, reference helper, tolerance, threshold, controller logic, Source/Analysis policy, production/UI, package script or configuration changed. No synthetic/observed qualification, Main L1, E1/H1–H5/Phase P rerun or scientific result inspection occurred. No commit or push.

Historical design verification: only this document was added. Static verification consisted of source/authority inspection, complete F/V/supplemental/prerequisite coverage accounting, frozen-file SHA check, Markdown/source-link checks, `git diff --check`, and `git status`. Test/typecheck execution was not performed. Existing developer-test results in owning reviews remain historical evidence.

Historical completed static checks: 23 numbered sections; F01–F22 and V01–V16 rows each present exactly once in order; all 11 supplemental and four inventory rows present; all 22 prerequisite child labels present; no unresolved local Markdown links. `git diff --check` and a separate `git diff --no-index --check` against the untracked document reported no whitespace errors. At that handoff, tracked diff was empty and status contained this new document and the six pre-existing untracked files listed in §1.

This status/freeze closure changes only status/provenance passages in this document and the active bookmark in `docs/PROJECT_STATUS.md`. Sections 2–20 are preserved without textual changes. Static documentation consistency, semantic-body preservation, whitespace and Git status are the only closure checks; no tests, qualification execution or scientific result inspection is performed. HEAD remains unchanged; no commit or push is authorized.

## 23. Proposed next gate and outcome

**P2 SYNTHETIC FIXTURE EXECUTION AND QUALIFICATION EVIDENCE CONTRACT — CLOSED · HUMAN REVIEW APPROVED. CONTRACT FROZEN.** D1 and D2 are accepted as incorporated; no additional semantic blocker was identified.

Coverage accounted: **22/22 F items, 16/16 V items, 11/11 supplemental declarations, 4/4 prerequisite inventories with all required child labels; 42 expected F/V repetition slots.** This is design accounting, not execution completeness or qualification PASS.

**PROPOSED NEXT BOUNDARY — bounded implementation design/planning for the minimal fixture-level qualification layer using this approved contract — SEPARATE HUMAN AUTHORIZATION REQUIRED.** No slice is chosen or implemented by this closure. Historical “writer/verifier → runner” is not an approved ordering and is not reinstated here.

```text
P2 SYNTHETIC QUALIFICATION — NOT YET CERTIFIED
FIXTURE QUALIFICATION LAYER IMPLEMENTATION — NOT YET AUTHORIZED
SYNTHETIC QUALIFICATION EXECUTION — NOT AUTHORIZED
P2 OBSERVED / SCIENTIFIC EXECUTION — NOT AUTHORIZED
MAIN L1 — NOT AUTHORIZED / NOT TESTED
MATERIAL-RESPONSE THRESHOLDS — OPEN
PRODUCTION/UI — UNCHANGED
```

**STOP FOR HUMAN REVIEW.**
