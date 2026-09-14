# P2 evidence-contract foundation — implementation review

**P2 EVIDENCE-CONTRACT FOUNDATION — IMPLEMENTED · AWAITING HUMAN REVIEW**

Human qualification-readiness design review is CLOSED · APPROVED. The current task separately authorized this bounded implementation. This is the **P2 evidence-contract foundation**, a qualification-infrastructure boundary after reviewed Slices 1–6; it is not “Slice 7”. The [approved readiness design](2026-09-14-observed-lagrangian-phase-p2-qualification-readiness-design.md) retains its original historical pending-review text unchanged.

## Authority and unchanged baseline

- Branch: `main`. HEAD: `f4e25128f19397bc98bbb9e19db899e6bb4a62cc`.
- Frozen authority: `observed-lagrangian-phase-p2-qualification/v1`.
- [Frozen specification](2026-09-13-observed-lagrangian-phase-p2-qualification-specification.md) exact-byte SHA-256: `fe5a33f8753b7538e5c3abdd2fe9f5766a2bdcefd08bfab07e6ced34bcfae59b`, verified after implementation, also checked by the new tests.
- `git diff --name-only f4e2512 -- src package.json package-lock.json tsconfig.json vitest.config.ts vite.config.ts` returned no tracked changes. All new code is in the three untracked additions below. No existing Slice 1–6 file, historical P source, E1 literal, production/core/UI file, package script or configuration changed. The index is unchanged.
- The earlier untracked readiness review and six historical E1/H4/H5 files were present on entry and left untouched. They are excluded from this implementation diff. This is not an execution clean-tree attestation.
- No commit or push was performed. No execution SHA or runtime lineage was authorized.

## Exact implementation additions

| Added file | Added lines | Responsibility |
|---|---:|---|
| `src/validation/p2Qualification/evidence.ts` | 166 | Pure canonical codec, envelope/graph validation, distinct hash contracts and lossless rejected-input tree |
| `src/validation/p2Qualification/syntheticRegistry.ts` | 201 | Immutable artificial recipes, analytic/status references and declaration completeness checks |
| `src/validation/p2Qualification/evidence.validation.test.ts` | 208 | 70 artificial codec/registry/authority/dependency checks, including parameterized cases |

Source diff: **3 added files, 575 added lines, 0 deleted lines, no existing source edits**. This implementation-review document adds **90 lines**, making **4 authorized additions, 665 total added lines**. The readiness review is a pre-existing deliverable, not a new implementation change.

## Schema and codec decisions

`canonicalRecord` emits JSON object syntax directly in sorted UTF-16 key order, including integer-like keys `"10"` before `"2"`. It does not rebuild an object and then let ECMAScript enumerate integer keys numerically. String escaping and finite number formatting use ECMAScript JSON.stringify; exact -0 becomes 0, while nonzero subnormals remain represented. No Unicode normalization occurs. Arrays retain their order and must be dense. Cycles, undefined, ordinary nonfinite numbers, symbols, BigInt, functions, nonplain objects, accessors, hidden properties and extra array properties are rejected. Accessors are rejected without invoking them.

`canonicalRecordBytes` produces UTF-8 without BOM, whitespace or a record terminator. `canonicalStreamBytes` adds exactly one LF per record, including the final record; an empty stream has zero bytes. Newlines inside strings remain JSON escapes. The two hash functions return explicit `RECONSTRUCTED_STREAM_SHA256` and `ARTIFACT_BYTES_SHA256` kinds. They can have equal SHA values when their byte inputs are identical, but their meanings remain distinct. Saved artifact bytes are hashed as supplied, including whitespace or CRLF, without recanonicalization.

Artifact-reference validation requires artifact-byte hash identities, unique IDs, resolved unique references and an acyclic graph. Self-reference and reciprocal hash dependencies are rejected. This is an external inventory contract, not a filesystem writer, content-fetching verifier or a claim that referenced files exist. It does not compute or endorse its own hash.

Persisted envelope schemas are `p2-synthetic-envelope/v1` and `p2-observed-envelope/v1`. Validation requires the expected stage, exact authority, explicit `executionAuthority: NOT_AUTHORIZED`, exact envelope fields and a nonempty required-evidence inventory. COMPLETE means only that this envelope lists all its required evidence without incomplete reasons. PARTIAL/INCOMPLETE require reasons. No envelope grants execution, certifies synthetic qualification or substitutes for the later artifact-specific schemas and reconstruction checks. Observed envelope validation is pure data validation; no observed route exists.

Rejected synthetic inputs use a separate tagged tree. Binary64 values retain 16-hex-digit bit representations, preserving negative zero, infinities, NaN payload bits exposed by the runtime, and finite values. Undefined, holes, null, strings, booleans, ordered arrays and object entries have explicit tags. Decoding validates tag fields and sorted unique object keys, safely preserving own `__proto__` data without prototype mutation. Functions, cyclic graphs and unsupported objects are rejected rather than falsely described as lossless data. This encoding does not replace affected numeric results with a fabricated value: ordinary result fields remain finite numbers or typed nulls. Special nonfinite strings in registry recipes are explicitly declared input recipe tokens, not ordinary numerical fields.

## Registry inventory and independent references

Registry identity: `p2-synthetic-registry/v1`, version `v1`. It is recursively frozen, `definitionOnly: true`, `qualificationCertified: false`, and `executionAuthority: NOT_AUTHORIZED`.

- `P2-F01`–`P2-F22`: all 22 frozen fixtures, with literal artificial accepted vertices, topology, segment-affine coefficients (or explicit evaluator recipe), knot-support policy, provider identity, interval, rational analytic quantities or typed expected rejection, required traces/assertions and repetition count. F22 declares five repeated calculations with full traces and exact digest equality.
- `P2-V01`–`P2-V16`: nonfinite/nonordered topology; zero/negative duration; nonfinite accepted time; near-touch; simultaneous role/vertex events; local integral overflow; upper-side touch-return; nonlinear foreign-node reevaluation; nonfinite provider at a foreign node; owned ineligible contact; horizontal degenerate motion; distinct internal time collapse; nonfinite accepted position; and out-of-domain exit.
- Eleven supplemental recipe declarations cover arithmetic underflow/cancellation, artificial Source/Analysis adapter checks, finer-history/signed-scale checks and actual controller wiring, irreversible eligibility, fourth-resolution viability and ordered incompleteness precedence. Existing artificial source recipes are bound by path/test name to reviewed baseline `f4e25128f19397bc98bbb9e19db899e6bb4a62cc`; they are not automatically imported or executed by the registry.
- Four prerequisite inventories cover binary64 arithmetic, adapter conformance, controller/comparison coverage and qualification evidence. The last explicitly retains missing full failure capture and future reconstruction/attestation as open work.

Analytic expectations are declared independently as rational numerator/denominator strings and derivations. Examples: F14 gives signed 0 and absolute 6 for h=4,u=3,v=-3; F17 gives mismatch area 2 and R1=1 for an 8-unit jump shifted by 1/4 over T=2; F05's exact irregular sum is 1397/64. Tests independently confirm these using hand-written constants and the reviewed BigInt rational helper. No expected value comes from an estimator invocation. The nonlinear t² probe declares the two different local-interpolant estimates (3/8 and 1/2), not a claim that either equals the physical integral.

`validateRegistryDeclarations` detects missing, duplicate and foreign fixture IDs, missing required traces, and altered recipes/references/assertions. It reports declaration completeness only. `validateRegistryDefinition` additionally binds the whole registry identity, supplemental recipe/prerequisite inventory and authority denial. Neither function consumes execution results or issues a certificate. All required traces are declarations; no absent private failure state has been manufactured.

## Validation and dependency audit

Final authorized verification:

```text
npm test -- src/validation/p2Qualification/evidence.validation.test.ts src/validation/observedLagrangianPhaseP2Controller.validation.test.ts src/validation/lagrangianEstimator
PASS — 7 files, 334 tests
70 new foundation tests + 264 reviewed estimator/controller regressions

npm run typecheck
PASS
```

The initial targeted pass had 69 cases. Typecheck then exposed an incorrectly wrapped `it.each` artifact-graph table: the callback received an element instead of the full graph. The table was repaired before final verification so the negative cases exercise the intended graph. A supplemental-registry completeness test raised the final new count to 70. These were test-development corrections, not changes to approved numerical/controller behavior.

The complete new runtime import closure is `syntheticRegistry.ts → evidence.ts → node:crypto`. No filesystem, historical Phase P module, observed loader, Simulation, stage/environment selector, dynamic import, production dependency or campaign runner is present. Static tests check this closure. Developer tests use Node's read-only filesystem API, the independent rational-reference helper and the reviewed controller; none loads observed profiles. The serialization-seal regression supplies 192 artificial deserialized objects and confirms Slice 6 rejects them as `INCOMPLETE_OR_UNVALIDATED_CAMPAIGN_LEDGER`. JSON cannot recreate the controller's WeakSet/WeakMap seals.

Codec tests use independent literal expected JSON/UTF-8 bytes; hashing includes the standard SHA-256 `abc` vector. Tests cover UTF-16 and integer keys, nested ordering, array order, escapes, Unicode preservation, -0, UTF-8/LF, sparse/undefined/nonfinite/unsupported rejection, tagged-input round trips, insertion-order determinism, stream/artifact distinctions, cyclic/missing references, registry omission/tampering and stage/authority confusion. The approved regression command excludes historical campaign-selected tests and executes artificial developer verification only. It is not independent synthetic qualification execution or certification.

## Remaining boundary and deviations

No authorized component was omitted. Additive implementation choices are strict rejection of accessors/hidden properties, explicit whole-registry validation and supplementary recipe references to the immutable reviewed artificial tests. No numerical algorithms were duplicated, and no confirmed `SPECIFICATION_IMPLEMENTATION_CONFLICT` was identified.

The failure-capture problem remains unresolved: an early partition failure can return operation/status without generated private nodes and offending intermediate geometry. Provider/exposure/history/controller failure semantics and `partitionAcceptedStep` are unchanged. This foundation neither restores nor fabricates that state. Full failure capture requires a later separately reviewed design/implementation before qualification attestation.

Still excluded: qualification runner or certificate; filesystem artifact writer; fresh-process reconstruction verifier; stage/environment execution selector; reviewed execution SHA authorization; observed construction/trajectory collection; observed fixture loading or campaign execution; main L1; material-response threshold work; frozen scientific tolerance/order/ladder/duration changes; specification changes; reviewed Slice 1–6 semantic changes; production/core/UI changes; commit and push.

**P2 EVIDENCE-CONTRACT FOUNDATION — IMPLEMENTED · AWAITING HUMAN REVIEW**

PHASE P2 SYNTHETIC QUALIFICATION — NOT YET CERTIFIED

PHASE P2 SCIENTIFIC EXECUTION — NOT AUTHORIZED

MAIN L1 — NOT AUTHORIZED / NOT TESTED

MATERIAL RESPONSE THRESHOLDS — STILL OPEN

PRODUCTION/UI — UNCHANGED

**STOP FOR HUMAN REVIEW.**
