# Compare the Flow measurement feedback — bounded implementation disposition

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED WITH REFINEMENT |
| Authority status | ACTIVE for bounded implementation/developer verification and desktop acceptance constraint |
| Freeze mode | MUTABLE |
| Authority scope | Presentation-slot relocation of existing A/B measurements; preserve runtime/science and stop for desktop visibility conflict |
| Parent authority | Human owner instruction below; [measurement-feedback design](ux/2026-10-25-compare-flow-measurement-feedback-design.md), [planning receipt](2026-10-25-compare-flow-measurement-feedback-planning-decision.md), [Governance v1](DOCUMENTATION_GOVERNANCE.md) under [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md) and [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Prior proposal-only implementation prohibition for this bounded change; no acceptance gate is closed |
| Superseded by | None |

## Decision authority, date and reviewed identity

Human project owner approving the design WITH REFINEMENT and explicitly permitting
minimum presentation implementation and relevant developer checks. Recorded by Agent,
2026-10-25. Reviewed working-tree basis: linked design, HEAD context
c3769f8af0cd662afcda6242cf952b7791e6065a, 21 modified / 41 untracked entries before
implementation. No new frozen identity or scientific classification is established.

## Decision, scope and targets

Reuse ProbeValues, move existing measurement group through an optional presentation
slot below viewport toolbar and above legend, keep measurement sources/formatting,
scientific/snapshot/session invariants, movement/reset, horizontal details,
accessibility and unavailable states. Adjacent desktop / stacked narrow cards.
Permitted source targets: LearnCompareFlow.tsx, CompareFlowViewport.tsx,
Compare-scoped app.css and LearnCompareFlow.test.tsx. Other tests are run-only.
Update applicable mutable design/Decision/status consequences; developer verification
and human acceptance remain distinct.

Additional binding acceptance criterion: at typical desktop sizes including
1366×768 and 1440×900, Move B controls, 3D scene and updated A/B measurements must
be visible together without scrolling. If this cannot be achieved without significant
scientific-viewport reduction or readability compromise, report conflict and propose
the smallest alternative for human review rather than silently forcing layout.

## Authorization consequence and exclusions

Bounded implementation and automated checks are permitted, with browser/WebGL checks
reported only when performed. No sequential navigation, global shell change,
unrelated Learn/science change, sampling/coordinates/calculation/snapshot/scale/session
change, renderer reconstruction, physics/data/frozen change, commit/push/deploy or
scientific qualification is authorized. Keep viewport dimensions/camera unless a
separate decision permits their revision. Stop after checks, and before any conflict
workaround outside this scope. Human acceptance: NOT CLAIMED. Stage 2 remains PENDING.

INTRODUCED: presentation of existing measurements only.
NOT INTRODUCED: scientific/model/computational semantics.

## Source language

English (en); no translation required.

## Source instruction — original

Human review: APPROVED WITH REFINEMENT.

The proposed Compare the Flow Measurement Feedback UX design is approved for bounded implementation, subject to the existing project governance requirements.

Additional acceptance criterion:

On a typical desktop viewport (including 1366×768 and 1440×900), the user should be able to see the Move B controls, 3D scene, and updated A/B measurements together without scrolling.

If this cannot be achieved without significantly reducing the scientific viewport or compromising readability, do not silently force the layout. Report the conflict and propose the smallest alternative for human review.

Proceed with the minimum presentation-layer implementation:

- Reuse the existing `ProbeValues` component.
- Move the A/B measurement group under the viewport toolbar and above the legend through the proposed presentation-slot.
- Retain the existing measurement sources and formatting.
- Preserve all scientific, sampling, snapshot and session invariants.
- Keep A/B cards side by side on desktop and stacked on narrow screens.
- Preserve accessible labels, horizontal component details and unavailable states.
- Add bounded regression tests.

Do not include sequential navigation, global shell changes, unrelated Learn improvements or scientific modifications.

Run relevant automated checks and report their results. Where browser-based or real-WebGL visual verification is unavailable, explicitly identify it as pending human acceptance.

Update the applicable Decision and PROJECT_STATUS according to existing governance rules, distinguishing developer verification from human acceptance.

Stop after implementation and verification. Do not declare human acceptance on my behalf.
