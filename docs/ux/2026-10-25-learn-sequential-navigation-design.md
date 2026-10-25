# Learn — sequential lesson navigation contract

## Status

| Field | Value |
| --- | --- |
| Document type | DESIGN |
| Approval state | APPROVED for explicit owner requirements; API/layout implementation details below are candidates |
| Authority status | ACTIVE for deferred Learn navigation constraints only |
| Freeze mode | MUTABLE |
| Authority scope | Bounded previous/next Learn presentation and transition constraints; no implementation or acceptance permission |
| Parent authority | [Owner requirement / documentation Decision](../2026-10-25-learn-sequential-navigation-planning-decision.md), [existing shared-navigation authority](../2026-10-24-learn-shared-navigation-decision.md), inherited [app-navigation SoT](../ui/07-app-navigation-and-mode-entry.md) and [Learn design](2026-10-21-learn-mvp-design.md) |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None; bounded Learn lesson-action addendum, not a global navigation rewrite |
| Superseded by | None |

## 1. Required behavior and exact proposed labels

Retain the four top lesson tabs and free direct access. Previous/next is a convenience,
not a completion gate, prerequisite chain, progress record or second router.

| Lesson | Back, secondary/outlined | Next, primary |
| --- | --- | --- |
| Look Around | Absent | Next: Follow Motion |
| Follow Motion | Back: Look Around | Next: Read the Motion |
| Read the Motion | Back: Follow Motion | Next: Compare the Flow |
| Compare the Flow | Back: Read the Motion | Absent |

Destination mapping and style hierarchy are explicit owner requirements. Colon-label
wording is the recorder's concise implementation candidate for future UI review.
Do not render disabled placeholders at endpoints. Actions must remain available
before, during and after observation, subject to existing modal interaction rules.
No auto-advance on animation completion, Replay, measurement, save or comparison.

Place the same action group at the bottom of each lesson's explanatory content,
not over the scene or in the global footer. Candidate placement: Look Around
introduction panel; Follow Motion copy panel after Model note; Read the Motion copy
panel in Watch and below the inspector/conclusion in Investigate; Compare the Flow
copy panel after scientific explanation. This is a single rendered group per active
lesson/state, not duplicated Watch/Investigate actions simultaneously in the DOM.

## 2. Existing actions and transition audit (working-tree inspection)

| Current source | Finding | Future treatment |
| --- | --- | --- |
| [LearnPage.tsx:28](../../src/app/learn/LearnPage.tsx#L28) | selectLesson resolves title and calls leave → departure.current.requestLeave when present → setLesson only after authorized action. Top tabs already use it. | Reuse as sole lesson transition entry. No second lesson state. |
| [LearnPage.tsx:56](../../src/app/learn/LearnPage.tsx#L56) | Bottom Look Around “Follow Motion” primary CTA already calls selectLesson. | Replace its markup/label with shared Next action; same destination/behavior. |
| [LearnFollowMotion.tsx:31](../../src/app/learn/LearnFollowMotion.tsx#L31) and :61 | Existing “Back to Look Around” calls local leave then onLookAround; parent callback currently sets lesson directly, guarded by that local wrapper. | Replace the action, preserving destination; new action calls parent selectLesson directly. Do NOT wrap it in local leave as well, which would double-guard. Retain the existing imperative guard for parent transitions. |
| [LearnReadMotion.tsx:38](../../src/app/learn/LearnReadMotion.tsx#L38) | Exposes departure guard; no bottom lesson action. Recorded paths prompt for departure; Replay is separate. | Add Back/Next through same parent selectLesson; do not create new history-loss rules. |
| [ReadMotionInvestigation.tsx:25](../../src/app/learn/ReadMotionInvestigation.tsx#L25) | Completion replaces explanatory copy with timeline/inspector panels. | Pass presentation slot through to bottom of inspector/conclusion; preserve reference/timeline state. |
| [LearnCompareFlow.tsx:76](../../src/app/learn/LearnCompareFlow.tsx#L76) | No bottom lesson action and no trajectory departure guard; owns static B/session and viewport cleanup. | Add Back through parent path; no invented trajectory warning or retained hidden scene. |
| [LearnLessonNavigation.tsx:2](../../src/app/learn/LearnLessonNavigation.tsx#L2) | LEARN_LESSONS lists four implemented routes; order is presentation, not a gate. | Reuse destination ids/titles/order; leave top-tab behavior intact. |

Line numbers identify the audited working tree, not a frozen identity; re-resolve
before later implementation. This audit is source inspection, not fresh runtime proof.

## 3. Minimal architecture candidate

Prefer one new pure `LearnLessonStepNavigation({ current, onSelect })` presentation
component alongside the existing top-tab component. Derive adjacent destinations
from LEARN_LESSONS; callbacks only call onSelect(destination). Reuse ui-button /
ui-button--primary and existing secondary/outlined patterns. Do not import session,
renderer or physics. No effects, RAF, listeners, navigation state or progress state.

LearnPage creates the component using current lesson and selectLesson, then passes
it as an optional ReactNode slot (candidate name `lessonActions`) to the explanatory
panels. Look Around renders it inline. Follow replaces its old action; remove the
obsolete onLookAround wiring only after its guarded usage and tests are migrated.
Read passes the same slot into ReadMotionInvestigation in Investigate. Compare
renders it last in copy. Slot layout must not key/remount a viewport or rebuild a
session when action props change. Do not move the controls into a separate stateful
layout that owns lifecycle or bypasses existing departure handles.

The existing guard is consulted exactly once. Cancelling a dialog retains current
lesson, paused/resume state according to existing guard semantics, history, selected
moment and saved reference; focus returns to the invoking Back/Next button. Confirming
uses existing unmount/cleanup and fresh-entry semantics. Preserve existing help-modal
inert/focus behavior; navigation must not remain interactive through an open modal.

## 4. Responsive and accessibility requirements

Use a labelled nav region, candidate accessible name “Previous and next lessons”.
Native type=button actions support Tab/Enter/Space; accessible names include full
destination titles. No icon-only controls. Back precedes Next in DOM order, focus
and reading order. Normal document flow, wrapping/stacking at narrow widths, full
readable names, visible keyboard focus and suitable touch targets. No horizontal
overflow, fixed overlay, clipped titles or offscreen artificial spacers at endpoints.
Keep button focus restoration and existing destination-heading focus behavior.

## 5. Invariants, exclusions and gates

Subsequent disposition: the [final integration Decision](../2026-10-25-learn-final-integration-decision.md)
explicitly opens the separate navigation implementation/developer-verification gate
below while other acceptance is pending. Its Step 3 authorizes the reusable
component/slot candidate and existing guarded transition path. The earlier deferred
gate wording below records the boundary before that instruction; it no longer
prohibits this bounded integration. Human acceptance and global shell work remain
separately gated; actual results are owned by PROJECT_STATUS.

INTRODUCED: deferred lesson-navigation presentation constraints only.
NOT INTRODUCED: scientific/model/runtime changes, routing library, new state machine,
completion gates, automatic advance, data persistence, hidden running scenes,
physics/measurements/scales/camera/picking changes, Glossary or Explore work.
NOT CLAIMED: implemented UI, developer verification, Learn or Stage 2 acceptance.

The prior terminology implementation authorization excluded navigation and does not
cover this addition retroactively. Before coding: owner must disposition the relevant
pending Learn acceptance/UI gates and separately authorize this navigation slice,
including its expanded file/test allowlist and developer checks. If the owner wants
navigation before acceptance closes, that exception must be explicit. This document
neither closes acceptance nor grants such an exception.

Verification tasks and prospective file boundaries are in
[implementation-plan §9](2026-10-25-learn-mvp-terminology-visual-literacy-plan.md#9-deferred-sequential-navigation-addendum).
Stop after documentation until those gates permit implementation.
