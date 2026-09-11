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

- `2026-09-11-analysis-unsupported-segment-looks-like-t1.md` — unsupported Analysis path segment exposes tracer identity red beneath the T1 overlay, which can be misread as a strong signed T1 value.
