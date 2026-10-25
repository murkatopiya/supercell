# Learn MVP — final integration authorization and bounded human UX verification

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED for explicit bounded UX verification and integration action |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Record satisfactory measurement-feedback/Move B UX; authorize remaining Learn presentation integration and sequential navigation/developer checks only |
| Parent authority | Human owner instruction below; [terminology plan](ux/2026-10-25-learn-mvp-terminology-visual-literacy-plan.md), [plan review](2026-10-25-learn-mvp-terminology-plan-review-decision.md), [sequential navigation contract](ux/2026-10-25-learn-sequential-navigation-design.md), [measurement-feedback Decision](2026-10-25-compare-flow-measurement-feedback-implementation-decision.md), [Move B Decision](2026-10-25-compare-flow-move-b-scroll-decision.md), [Governance v1](DOCUMENTATION_GOVERNANCE.md) under [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Navigation contract §5 / terminology-plan §9 wait for separate implementation permission, only for the explicit integration Step 3; no general acceptance gate is closed |
| Superseded by | None |

## Decision authority, date and reviewed identity

Human project owner reports completed visual verification of Compare the Flow
measurement feedback and Move B scrolling as satisfactory, and requests bounded
final Learn integration. Recorded by Agent, 2026-10-25. Working-tree HEAD context
c3769f8af0cd662afcda6242cf952b7791e6065a, 21 modified / 43 untracked entries before
this pass. No new immutable pin, scientific classification or global acceptance.

## Decision and scope

Record **human UX verification satisfactory** for measurement feedback and Move B
workspace scrolling only. Do not infer acceptance of the original initial-entry
no-scroll condition, other unverified behavior, physical touch, forced context loss,
profiling, Stage 2 as a whole or Learn MVP as a whole.

The explicit Step 3 supplies the separate navigation implementation permission
required by navigation contract §5 and terminology plan §9. It permits integration
while other acceptance remains pending; it does not falsely close those gates.
Audit the approved terminology plan, preserve completed conforming work, implement
only remaining authorized presentation gaps. Implement the documented six Back/Next
actions through LearnPage.selectLesson and existing guard/cleanup/session semantics,
with a reusable pure component/slots. No duplicate guards, state or automatic advance.

Use the prospective navigation write allowlist in plan §9: new step-navigation
component; LearnPage, LearnFollowMotion, LearnReadMotion, ReadMotionInvestigation,
LearnCompareFlow; scoped app.css; permitted Learn tests/new step-navigation tests.
No renderer/computation changes. Existing completed terminology is not redone.
Run relevant regression/typecheck/build/frozen checks and bounded browser checks;
report actual scope/limitations and checkpoint readiness without making acceptance.

## Exclusions and stop gate

No global Header/Footer or shell implementation, new lesson, Analysis T1 education,
thermodynamics/scientific functionality, dataset/sampling/integration/measurement/
scene-calculation changes, shared Glossary or frozen modifications. No scientific
qualification/campaign, commit, push or deploy in this pass. Checkpoint readiness
is a recommendation, not permission to commit a dirty working tree wholesale.
Stop for human review after implementation/developer verification.

INTRODUCED: lesson-action presentation integration only.
NOT INTRODUCED: scientific/model semantics or new computation.
NOT CLAIMED: human acceptance beyond the explicitly verified measurement/scroll UX.

## Source language

English (en); no translation required.

## Source instruction — original

## Learn MVP — Final Integration Pass

The owner has visually verified the Compare the Flow measurement feedback and Move B workspace scrolling. The reported UX behavior is satisfactory.

First, record this human UX verification in the applicable documentation. Do not treat it as automatic acceptance of any other unverified criteria.

We are now preparing to complete the four-lesson Learn MVP before proceeding to the global UI shell.

### Step 1 — Establish current baseline

Review `PROJECT_STATUS.md`, relevant Learn Decisions and the existing approved terminology/visual-literacy and sequential-navigation plans.

Identify what is already implemented and verified, what remains pending, and which implementation gates are active.

Do not repeat completed work.

If separate authorization is required under existing governance, identify the exact gate before changing code.

### Step 2 — Terminology and visual literacy

Audit all four lessons against the existing approved plan.

Preserve implemented explanations and "Reading the scene" legends that already satisfy the requirements.

Implement only remaining authorized gaps. Do not expand the scientific scope or change model semantics.

### Step 3 — Sequential navigation

Implement the documented Back / Next navigation contract:

- Look Around → Follow Motion
- Follow Motion ↔ Read the Motion
- Read the Motion ↔ Compare the Flow

The final lesson has Back only.

Reuse `LearnPage.selectLesson` and existing transition/guard semantics. Avoid double-guarding, duplicate navigation state and unintended session resets.

Keep navigation controls accessible and consistently placed.

### Step 4 — Verification

Run relevant unit/regression tests, typecheck, production build and frozen-identity checks.

Verify lesson switching, guarded cancellation, session lifecycle, keyboard access, responsive layout and preservation of scientific invariants.

Report any browser/WebGL checks that remain unverified.

### Scope boundaries

Do not implement the global Header/Footer yet.

Do not add new lessons, Analysis T1 education, thermodynamics or new scientific functionality.

Do not alter dataset handling, velocity sampling, integration, measurements or scene calculations.

### Deliverable

Provide a concise report with:

1. Already completed work.
2. Changes made in this pass.
3. Test and build results.
4. Remaining human acceptance requirements.
5. Whether Learn MVP is ready for a checkpoint commit.

Do not push or deploy yet. Stop for human review.
