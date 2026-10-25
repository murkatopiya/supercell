# Bugs and Product-Facing Defects

This folder tracks reproducible defects, semantic UX bugs, and product-facing boundary behaviors discovered during development, validation, or manual playtesting.

Use this folder for issues that should not be lost in research notes or architecture discussions.

Suggested fields for each bug record:

- Status
- Severity / class
- Discovered by / context
- Reproduction steps
- Expected behavior
- Actual behavior
- Why it matters
- Root cause / mechanism (if known)
- Fix candidates
- Verification plan
- Related architecture / research documents

## Current bugs

- [Unsupported Analysis segment can look like a T1 value](2026-09-11-analysis-unsupported-segment-looks-like-t1.md) — existing OPEN semantic UX defect: unsupported Analysis path segment exposes tracer identity red beneath the T1 overlay, which can be misread as a strong signed T1 value. Its original report remains the owner.

## Learn / Unified UI Shell pre-push triage — 2026-10-25

- [Bounded Learn/Shell triage](2026-10-25-learn-shell-prepush-triage.md) — one consolidated record for seven baseline assertion failures, bundle debt, sandbox/runner issues, physical-touch/context-loss/profiling/accessibility and local-evidence verification gaps, plus resolved presentation/quote-envelope issues. References existing Decisions/reviews and the T1 bug rather than duplicating it. The [bounded human risk disposition](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md#human-release-risk-disposition--2026-10-25) retains the OPEN defect and non-green suite. [Final product/UI acceptance and exact scoped-commit authorization](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md#final-integrated-visual-acceptance-and-scoped-commit-authorization--2026-10-25) are now recorded; push remains separately unauthorized.
- [Release-readiness audit and exact proposed allowlist](../reviews/2026-10-25-pre-push-readiness-audit.md) — verification results, excluded work and publication stop gates.
