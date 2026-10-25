# Compare the Flow — reveal measurements on Move B

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED for the requested bounded interaction change |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | User-activated page scroll to existing A/B cards when enabling Move B; developer checks, no human acceptance |
| Parent authority | Human owner request below; [measurement-feedback implementation Decision](2026-10-25-compare-flow-measurement-feedback-implementation-decision.md), [design](ux/2026-10-25-compare-flow-measurement-feedback-design.md), [Governance v1](DOCUMENTATION_GOVERNANCE.md) under [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Previous stop before a measurement-reveal scroll workaround, only for the explicit Move B action; not initial-entry no-scroll acceptance |
| Superseded by | None |

## Decision authority, date and reviewed identity

Human project owner requesting the specific Move B scroll behavior after the desktop
visibility conflict report. Recorded by Agent, 2026-10-25. Working-tree context:
HEAD c3769f8af0cd662afcda6242cf952b7791e6065a, 21 modified / 42 untracked entries
before this action. No code pin or human technical/visual acceptance is inferred.

## Scope and Decision

Implement page scroll to make Probe A/B cards visible when the user enables Move B.
Keep existing mode, focus and scene behavior. Use a ref on the existing card group
and a layout effect triggered only by placing becoming true; no focus transfer,
auto-scroll on entry, measurement updates, Reset B, Done/Escape or camera changes.
Instant scrolling avoids ongoing animation during picking and respects reduced-
motion needs without new media listeners. A 12 px scroll-target margin prevents
fractional-pixel clipping; it does not change card or canvas layout dimensions.

Bounded source targets: LearnCompareFlow.tsx and LearnCompareFlow.test.tsx only;
checks may run existing authorized regressions/typecheck/build/browser checks.
Normal scroll cancellation of a pending placement gesture remains unchanged.
On mobile, cards precede left controls, so the shortest reveal may scroll upward;
the functional objective is visible cards, not forced downward movement.

## Authorization consequence and exclusions

This explicitly requested action-scoped reveal is permitted; broader entry scrolling,
new navigation, shell/camera/card resizing, sampling/session/measurement/physics/data
changes and unrelated features are not. Existing scientific/scale-80/coordinate/t=0
and resource-ownership invariants remain binding. No frozen changes, campaigns,
commit/push/deploy, scientific qualification or automatic acceptance.

The old initial-entry no-scroll criterion is not reclassified as passed. This is
the owner's requested on-action remedy, independently checked and pending human
visual/technical acceptance. Stop after implementation and bounded verification.

INTRODUCED: user-activated presentation scroll only.
NOT INTRODUCED: new scientific/model/runtime computation.
NOT CLAIMED: human acceptance or completion of the original initial no-scroll criterion.

## Source language

Russian (ru).

## Source instruction — original

А можно сделать так, чтобы при нажатии "**Move B** " страничка доскролилась ниже, чтобы блоки Probe A, Probe B попали в видимую область экрана?

## Source instruction — English translation

Could you make the page scroll down when “Move B” is pressed, so that the Probe A
and Probe B blocks come into the visible area of the screen?
