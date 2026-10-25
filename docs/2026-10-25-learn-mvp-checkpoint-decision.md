# Learn MVP — bounded positive human review and checkpoint authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED for the explicit bounded human review and conditional checkpoint action |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Record satisfactory Back/Next, measurement feedback and Move B UX; permit a consistent, verified Learn-only checkpoint commit, no publication |
| Parent authority | Human owner instruction below; [final integration Decision](2026-10-25-learn-final-integration-decision.md), [terminology plan](ux/2026-10-25-learn-mvp-terminology-visual-literacy-plan.md), [Learn navigation contract](ux/2026-10-25-learn-sequential-navigation-design.md), [Governance v1](DOCUMENTATION_GOVERNANCE.md) under [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Pending human review of Back/Next visual/behavioral UX and measurement/Move B UX only; no unrelated acceptance gate |
| Superseded by | None |

## Decision authority, date and reviewed basis

Human project owner reporting manual review and conditionally authorizing a scoped
checkpoint after dependency/staged-diff verification. Recorded by Agent, 2026-10-25.
Baseline HEAD c3769f8af0cd662afcda6242cf952b7791e6065a; pre-existing dirty/untracked
work includes both Learn and unrelated Landing/research material. No authority is
derived from that material's existence or from developer-test PASS.

## Decision and bounded human-review result

Record **positive human review**: Back/Next across all four Learn lessons looks good
and behaves as expected; previously reviewed Compare the Flow measurement feedback
and Move B workspace scrolling are satisfactory. These three named UX results are
accepted as reviewed. NOT CLAIMED: whole-MVP acceptance, formal Stage 2 technical
closure, original initial-entry no-scroll success, physical-device touch, forced real
context loss, prolonged profiling, scientific qualification or any unverified criterion.

## Conditional checkpoint scope and authorization consequence

Permit a descriptive checkpoint commit only after explicit file/hunk selection,
dependency inspection, staged-diff review and appropriate checks of the selected
snapshot. Include the Learn implementation/tests, opt-in shared rendering dependencies,
Learn entry wiring/assets and owning Learn documentation. Exclude Landing redesign,
photo/CSS/license/README rewrite, unrelated research/provenance fixes, Explore UI/doc
cleanup, scientific execution outputs and unfinished unrelated work. Partial staging
is permitted to separate minimal Learn entry wiring from mixed Landing files without
overwriting the working tree. Verify the exact index snapshot, not only the larger
working tree; stop if a consistent scoped snapshot requires broader changes.

Existing README → PROJECT_STATUS navigation is retained. No new frozen artifact
identity is created or changed. Do not rewrite historical source instructions.
The commit's actual tree and file list identify the checkpoint; this record does
not self-pin its eventual commit hash. Actual current disposition belongs in
PROJECT_STATUS, with the resulting commit hash reported externally after creation.

## Explicit exclusions and stop gate

No push/deploy/publication, global shell work, unrelated or scientific changes,
blanket staging/commit of dirty files, reset/clean, automatic model qualification or
unrelated acceptance. Stop and explain if clean scoped checkpointing is not possible.
After the permitted commit and verification, report hash, included/excluded files
and final checks; stop without beginning the global UI shell.

## Subsequent human disposition — bounded regression-test amendment

The owner separately approves adding only `src/rendering/pickPathHistorySample.test.ts`
to the checkpoint write allowlist for formatting-independent structural assertions.
Keep the original shared-picker/selection regression intent and all behavioral
oracle comparisons. No production behavior or unrelated test changes are authorized.
Reproduce the two remaining copy-test failures against unchanged baseline, keep
them unchanged/documented, and rerun expanded tests/typecheck/build/frozen checks
against the exact staged snapshot. If no additional regressions appear, the scoped
checkpoint commit is authorized; no push/deploy. This resolves the earlier test-write
gate only, not model qualification or unrelated acceptance.

### Source instruction — original (allowlist amendment; English)

Human disposition — Learn MVP checkpoint blocker.

Approve a narrowly scoped amendment to the Learn checkpoint write allowlist for `src/rendering/pickPathHistorySample.test.ts` only.

Replace the indentation-sensitive assertion with a formatting-independent assertion that preserves the original regression intent. Do not weaken or remove the behavior being checked.

Before committing:

1. Inspect and explain the exact assertion change.
2. Confirm the corrected test passes against the staged Learn snapshot.
3. Confirm that the two remaining failures (`formatTrajectoryTiltingVerification.test.ts` and `publicClarity.test.tsx`) still reproduce against the unchanged baseline.
4. Keep those two baseline failures unchanged and explicitly documented.
5. Re-run the expanded regression suite, typecheck, production build and frozen-identity checks against the exact staged snapshot.
6. Review the staged diff and file allowlist for accidental inclusion of unrelated work.

If no additional regressions appear, the scoped Learn MVP checkpoint commit is authorized, provided existing governance requirements are satisfied.

Do not use `git add -A`. Do not modify unrelated production code or shared test files beyond the explicitly approved assertion.

Do not push or deploy.

Report the commit hash, exact verification results and any remaining limitations.

### Documentation permission clarification

The owner additionally confirmed the bounded Decision/PROJECT_STATUS update after
the initial tool rejection. Original English reply: “Allow the bounded documentation update”.
No broader implementation, unrelated test changes or acceptance was supplied.

## Source language

English (en); no translation required.

## Source instruction — original

Human review update:

I have manually verified the new Back/Next navigation across the four Learn lessons. The navigation looks good and behaves as expected.

The previously reviewed Compare the Flow measurement feedback and Move B scrolling are also satisfactory.

Please record these specific positive human-review results in the applicable Decision and PROJECT_STATUS. Do not mark unrelated or unverified criteria as accepted.

Next, prepare a scoped Learn MVP checkpoint commit.

1. Inspect the current Git working tree.
2. Identify the exact Learn-related implementation, tests and documentation required for a consistent checkpoint.
3. Explicitly exclude unrelated or unfinished work.
4. Check dependencies between the selected files.
5. Stage only the reviewed and verified Learn-related changes using an explicit file allowlist.
6. Review the staged diff and run appropriate final checks.
7. Create a descriptive checkpoint commit if the scoped changes are consistent and governance allows it.

Do not push or deploy yet.

Report the commit hash, included files, excluded changes and final verification results.

If a clean scoped checkpoint is not possible, stop and explain why rather than broadening the commit.
