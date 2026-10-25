# Compare the Flow measurement feedback — documentation-only disposition

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED for audit/documentation action only; proposed UI is not approved |
| Authority status | ACTIVE for bounded documentation permission |
| Freeze mode | MUTABLE |
| Authority scope | Audit existing measurement rendering and document a proposed presentation refinement/regression checks; no implementation permission |
| Parent authority | Human owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), [bounded amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Decision authority, scope and date

Human project owner reporting a usability issue and explicitly requiring audit,
proposal documentation and review before implementation. Recorded by Agent,
2026-10-25. The reported issue is a user observation, not independently collected
research evidence or a new scientific/model conclusion.

## Decision, targets and reviewed identity

Authorize source audit of existing A/B cards and documentation of the smallest safe
presentation-layer change with regression criteria in a
[PROPOSED / INACTIVE / MUTABLE DESIGN](ux/2026-10-25-compare-flow-measurement-feedback-design.md).
Record navigation to it in PROJECT_STATUS. Reviewed source context is working-tree
HEAD c3769f8af0cd662afcda6242cf952b7791e6065a, 21 modified / 39 untracked entries before
this action; no frozen pin or acceptance transition is established.

The proposed direction is two compact A/B Speed/Vertical cards beneath the viewport
and above Reading the scene, preserving red/blue semantics, horizontal components,
left controls and existing snapshot/formatting logic. Exact layout/API details remain
review candidates. Document visibility tradeoffs and regression checks before coding.

## Authorization consequence and stop gate

Audit/documentation only, not implicit permission to modify the implementation.
No production/CSS/test/rendering/scientific data/fixture changes, developer runtime
execution, sampling campaign, commit/push/deploy or frozen modification. No velocity,
coordinate/calculation/snapshot/arrow-scale change; no render-driven resampling or
scene reconstruction; existing movement/reset behavior remains. No human acceptance
or scientific qualification is claimed. Separate review and explicit implementation/
developer-verification authorization required; Stage 2 acceptance remains PENDING.

## Source language

English (en); no translation required.

## Source instruction — original

## Compare the Flow — Measurement Feedback UX

A usability issue has been identified in Learn lesson 4, Compare the Flow.

Currently, moving probe B updates the numerical measurements in the lower part of the left-side content panel, often below the visible viewport. Users can change B's position without noticing that the measured velocities have changed.

This undermines the central learning objective: comparing local airflow velocities at two spatial positions.

### Proposed change

Move the primary A/B numerical measurements into a compact comparison area immediately below the 3D viewport and above the "Reading the scene" legend.

Use two adjacent measurement cards:

- Probe A — fixed reference point, red.
- Probe B — movable measurement point, blue.

Each card should display:

- Speed (m/s).
- Vertical velocity (m/s).

Retain access to the existing horizontal components and explanatory text, using compact expandable details if appropriate.

Preserve the control actions on the left, near the instructions for moving B.

### Required UX properties

- Numerical changes must be visible near the 3D visualization.
- A and B values must be easy to compare at a glance.
- Preserve semantic color associations with the 3D probes.
- Use stable numeric formatting and tabular digits.
- Avoid layout shifts during measurement updates.
- On narrow screens, stack the comparison cards appropriately.
- Do not overlay essential measurements on the interactive 3D canvas.
- Preserve keyboard accessibility and scientific labels.

### Scientific and functional boundaries

- Do not alter velocity sampling, coordinate systems, calculation methods, A/B snapshot semantics, or the fixed velocity-arrow display scale.
- Do not trigger resampling or scene reconstruction due solely to measurement-card rendering.
- Reuse existing measurement data and formatting logic.
- Preserve the existing behavior of probe movement and reset.

### Process

First audit the existing measurement rendering and identify the smallest safe presentation-layer change.

Treat this as a proposed UX refinement requiring review and authorization, not an implicit instruction to modify the current accepted implementation.

Document the proposed change and regression checks before implementation.
