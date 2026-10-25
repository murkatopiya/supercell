# Learn sequential navigation — requirement and documentation-only disposition

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED for explicit owner requirement and deferred documentation action |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Record sequential Learn navigation requirements, audit and planning only; no implementation/developer execution permission |
| Parent authority | Human owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), [bounded amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None; does not expand the earlier terminology implementation authorization |
| Superseded by | None |

## Decision authority, scope and date

Human project owner requesting an additional sequential navigation requirement in
the Learn design contract and implementation plan, explicitly deferring implementation.
Recorded by Agent, 2026-10-25.

## Decision and authority targets

Record explicit previous/next mapping, bottom-of-explanatory-content placement,
Back secondary / Next primary, destination labels, retained four tabs, endpoint
omission, responsive/keyboard support, reused presentation and existing transition
mechanism. Audit existing actions and add behavior/regression checks to the plan.
Create a bounded [Learn navigation DESIGN addendum](ux/2026-10-25-learn-sequential-navigation-design.md)
and [plan §9](ux/2026-10-25-learn-mvp-terminology-visual-literacy-plan.md#9-deferred-sequential-navigation-addendum).
Exact API/layout/label punctuation remain implementation candidates; owner requirements
are constraints, not inferred acceptance of new code.

Reviewed identity: current working-tree navigation sources at HEAD context
c3769f8af0cd662afcda6242cf952b7791e6065a (21 modified / 37 untracked entries before
this documentation action). No new frozen pin. Targets are mutable DESIGN documents,
this DECISION RECORD and PROJECT_STATUS navigation. Legacy navigation SoT/historical
Decisions are inherited, not edited or reclassified.

## Authorization consequence, exclusions and stop

Documentation only. Do not implement until relevant Learn acceptance and UI
implementation gates permit the change. Existing terminology permission excluded
navigation; this record does not silently enlarge it. Preserve guards/cleanup/
session/replay/scientific invariants; no second state machine or automatic advance.
No code/CSS/test/rendering/science changes, developer runtime checks, frozen edits,
commit/push/deploy or acceptance closure. Separate owner authorization is required.

INTRODUCED: deferred navigation requirements/planning only.
NOT INTRODUCED: new scientific/model semantics or runtime behavior.
NOT CLAIMED: human technical/visual acceptance or completed implementation.

## Source language

English (en); no translation required.

## Source instruction — original

## Additional requirement — Sequential Learn Navigation

Add a consistent previous/next lesson navigation pattern to all four Learn lessons.

Navigation mapping:

- **Look Around:** Next: Follow Motion
- **Follow Motion:** Back: Look Around | Next: Read the Motion
- **Read the Motion:** Back: Follow Motion | Next: Compare the Flow
- **Compare the Flow:** Back: Read the Motion

### UI requirements

- Place the navigation actions consistently at the bottom of the lesson's explanatory content area.
- Use a secondary/outlined style for Back and a primary style for Next.
- Use concise, descriptive labels that identify the destination lesson.
- Keep the existing four-tab lesson navigation at the top.
- Do not introduce a disabled Back button on the first lesson or a disabled Next button on the last lesson.
- Keep the controls responsive, keyboard-accessible, and clearly visible.
- Prefer a reusable lesson-navigation component or shared presentation pattern rather than duplicating navigation markup four times.

### Behavioral constraints

- Both Back and Next must use the existing lesson-transition mechanism.
- Preserve all existing departure guards, cleanup rules, session lifecycle behavior, replay semantics, and scientific state invariants.
- Do not bypass existing transition rules or create a second navigation state machine.
- A Next action must not automatically advance the lesson unless explicitly activated by the user.
- Do not automatically advance based on animation completion.

### Coordination

Include this requirement in the Learn UI/navigation design contract, but do not implement it until the relevant Learn acceptance and UI implementation gates permit the change.

Audit existing lesson navigation actions first and identify which can be reused or replaced without changing their behavior.

Add navigation behavior and regression checks to the implementation plan.
