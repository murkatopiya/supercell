# Compare the Flow — measurement feedback UX proposal

## Status

| Field | Value |
| --- | --- |
| Document type | DESIGN |
| Approval state | APPROVED WITH REFINEMENT |
| Authority status | ACTIVE for implementation/acceptance constraints; bounded implementation separately authorized |
| Freeze mode | MUTABLE |
| Authority scope | Presentation-only relocation of existing A/B measurements; no runtime or scientific change |
| Parent authority | [Documentation-only Decision](../2026-10-25-compare-flow-measurement-feedback-planning-decision.md), [Slice 4 Design](2026-10-25-learn-slice-4-compare-the-flow-design.md), [Stage 2 plan](2026-10-25-learn-slice-4-stage-2-implementation-plan.md), [terminology plan](2026-10-25-learn-mvp-terminology-visual-literacy-plan.md) and inherited Learn Decisions |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None; acceptance refinement is recorded by the external implementation Decision |
| Superseded by | None |

## 1. Problem, audit and smallest safe candidate

Human approval and separate bounded execution permission are recorded in the
[implementation Decision](../2026-10-25-compare-flow-measurement-feedback-implementation-decision.md).
This supersedes earlier proposal-only stop wording below only for the authorized
implementation/checks. Human acceptance remains separate. Binding refinement:
at 1366×768 and 1440×900 desktop, Move B controls, scene and updated A/B values must
be visible together without scrolling. If achieving this requires significant
viewport reduction or readability compromise, stop layout changes and report the
conflict with a minimal alternative for review. Do not silently resize the scientific
viewport or change global shell behavior.

The owner reports that B can be moved without users noticing changed numerical
velocities because cards are low in the explanatory column. Source inspection
confirms that placement; this documentation work does not independently measure
user behavior or claim a new real-WebGL check.

Audited working-tree context: HEAD c3769f8af0cd662afcda6242cf952b7791e6065a,
21 modified / 39 untracked entries before this documentation action. Targets are
not frozen line identities; re-resolve before implementation. Do not clean/reset
unrelated dirty or untracked work.

| Existing target | Fact and consequence |
| --- | --- |
| [LearnCompareFlow.tsx:7](../../src/app/learn/LearnCompareFlow.tsx#L7) | Local ProbeValues already receives a measurement, formats numbers without sampling and renders Speed/Vertical plus expandable Eastward/Northward. Reuse this function; no new measurement controller. |
| [LearnCompareFlow.tsx:30](../../src/app/learn/LearnCompareFlow.tsx#L30) | Parent owns a stable session and current B snapshot. A is session.a; B is snapshot.measurement. Neither should move into the viewport effect. |
| [LearnCompareFlow.tsx:105](../../src/app/learn/LearnCompareFlow.tsx#L105) | Both cards currently occur after B controls inside the left explanatory panel. Remove that group from the left, do not duplicate it. |
| [CompareFlowViewport.tsx:24](../../src/app/learn/CompareFlowViewport.tsx#L24) | Existing layout effect syncs the same B snapshot into scene arrows/markers. Keep its dependencies and logic unchanged. |
| [CompareFlowViewport.tsx:34](../../src/app/learn/CompareFlowViewport.tsx#L34) | Initialization effect depends on session/attempt, not measurement-card markup. Do not add a ReactNode/card dependency. |
| [CompareFlowViewport.tsx:128](../../src/app/learn/CompareFlowViewport.tsx#L128) | One stable scene section contains canvas, toolbar, viewing instructions, scientific scale note and legend. A presentation slot can insert cards after toolbar, outside canvas and canvas-host inert region. |
| [app.css:110](../../src/app/app.css#L110), :134–138 | Desktop scene is sticky; mobile moves scene before the left copy and fixes canvas height. Additional cards increase scene-section height; verify sticky behavior and mobile access to lower controls. |
| [app.css:183](../../src/app/app.css#L183) | Existing values already use tabular digits. Retain formatter and add stable card/row sizing only in Compare-scoped styles. |

Preferred candidate: an optional `measurements?: ReactNode` presentation slot on
CompareFlowViewport, created by LearnCompareFlow from the existing card group.
Render it after the viewport toolbar and before camera/grid/scale prose and Reading
the scene. Parent remains sole owner of measurement data, ProbeValues rendering and
existing formatter. No extraction/new shared component is required. Do not key the
viewport, slot or cards by B position/revision; retain stable A/B identities and
disclosure state. Do not wrap the viewport in a new keyed component.

Alternative: a new outer scene-column wrapper with cards as siblings avoids a slot,
but changes sticky/mobile grid selectors and ownership layout more broadly. Prefer
the slot unless review identifies a concrete problem; stop before broad restructuring.

## 2. Proposed layout and exact presentation copy

Normal-flow order: canvas → existing scene toolbar/Reset View → compact A/B comparison
→ existing frame/units/sign explanation → camera/grid/scale prose → Reading the scene.
The canvas remains unchanged. No essential measurement is overlaid on it.

Two adjacent cards on sufficiently wide scene columns, A first then B. Stack at a
narrow breakpoint determined by readable labels/values (candidate below 480 CSS px).
No horizontal scrolling. Candidate card headings/copy:

- **Probe A** — Fixed reference point.
- **Probe B** — Movable measurement point; stationary while measured.
- Primary metric labels: **Speed** and **Vertical velocity**, values retain **m/s**.
- Existing **Show horizontal components** disclosures retain **Eastward** and
  **Northward**, current formatting and initially collapsed state.

Keep full existing storm-relative/frame/units/sign paragraph with the group, without
changing numerical/scientific meaning. Keep left instructions, Move B / Done moving B,
axis controls, B coordinates/status, Reset B and scientific conclusions in the left
panel. Do not move controls into the card group. Preserve the existing legend.

Use existing probe red #e74c3c and blue #3498db accents; labels A/B and role text must
convey identity without colour. Prefer importing existing TRACER_COLORS for presentation
or an equivalent directly verified colour mapping; do not edit rendering constants.
No pulse, transient animation, delta, extra velocity glyph or new numerical quantity.

Preserve current two-decimal, sign, sub-0.005 and Unavailable formatting exactly.
Zero vertical and complete zero vector remain valid values. Reserve row/card space
for signed values and “Unavailable”; preserve DOM nodes and equal card alignment.
Reserve space for the unavailable status rather than inserting text that shifts the
canvas/cards/legend. Details expansion is an intentional user layout change, distinct
from prohibited shifts caused merely by measurement updates.

## 3. Visibility and accessibility

Accessible group name remains “Probe measurements”; distinct named Probe A/B sections,
headings and semantic dt/dd values remain. Native details/summary supports keyboard
and retains open state across B updates. Tabular digits, adequate contrast, visible
focus, no automatic focus/scroll movement and no new per-value live-region chatter.
Use the existing B update status without new repeated announcements. Help/modal
behavior and keyboard axis controls must remain unchanged.

Below-viewport placement improves proximity, but is not a guarantee that the canvas,
both cards and left controls fit simultaneously in every browser viewport. At
390×844 and 320×844 the stacked cards and scene-first ordering can lengthen travel
to axis buttons. Review actual above/below-fold feedback with click and keyboard
movement, including 200% text zoom. Do not silently shrink/reframe the scene, move
controls, add a sticky overlay or alter camera to solve visibility: those require
separate review/permission. If the proposed placement still hides changes in typical
use, stop and return the observed UX limitation instead of claiming the goal achieved.

## 4. Prospective implementation boundary and regressions

Only after separate approval/authorization, minimal write candidates:
`src/app/learn/LearnCompareFlow.tsx` (move existing group, role copy/labels),
`src/app/learn/CompareFlowViewport.tsx` (optional presentation slot only),
`src/app/app.css` (Compare-scoped card layout/reserved sizing),
`src/app/learn/LearnCompareFlow.test.tsx` (semantic/behavior/layout-boundary assertions).
No new production component is necessary. No renderer, camera, placement helper,
session, sampling, measurement formatter logic, scientific fixture or navigation
edit is authorized by this proposal. Existing tests outside that write set are run-only.

| Future regression / review | Expected result |
| --- | --- |
| DOM placement / duplicate removal | Exactly one A/B group, after canvas/toolbar and before legend, outside canvas host; absent from left explanatory panel; controls remain left. |
| Numerical parity | Same A and B snapshot objects and rendered numbers, signs, units, sub-0.005 handling; A unchanged while B moves. Reuse existing formatting logic; no new formatter/controller. |
| No resampling / reconstruction | Spies confirm parent/presentation rerender, disclosure toggles, focus, resize and slot rendering add no field samples/session constructions; same scene/canvas, one RAF; dependencies unchanged. |
| Atomic update | Valid movement updates B card/marker/arrow from one existing snapshot; invalid placement and boundary no-op retain all old values; unavailable clears stale arrow and reports unavailable, never zero. |
| Valid zero | Zero vertical with nonzero speed and full zero vector keep correct numeric values, separate from unavailable. |
| Reset / recovery | Reset B restores original snapshot, ends placement and preserves camera/focus; Reset View changes only camera; WebGL failure/retry retains real measurement cards and keyboard movement. |
| Lifecycle | Existing StrictMode, context-loss mocks, unmount/re-entry, observers/listeners/dispose and Slice 3 single-arrow regression remain passing; no new resource owner. |
| Disclosures / keyboard | Horizontal details default collapsed, stay open across movement, labelled per card context; accessible metric labels and tab order; no focus jumps or noisy announcements. |
| Responsive / stability | Real-WebGL at 1440×1000, 390×844, 320×844 if authorized/available; side-by-side/stacking, colour/shape correspondence, no horizontal overflow/overlap, stable bounding boxes during rapid B updates and unavailable transitions. |
| Feedback visibility | Observe actual feedback while pointer-placing and keyboard-stepping B; verify sticky scene height/mobile scroll burden does not defeat purpose. Report incomplete visibility honestly. |

Run the existing relevant Learn/rendering/navigation regression suite, targeted card
tests, full typecheck/build only under later developer-verification permission.
Physical touch, forced real context loss and prolonged GPU profiling remain NOT
VERIFIED unless performed. Planning/static inspection is not developer verification.

## 5. Invariants, coordination and stop gate

INTRODUCED: proposed placement/presentation of existing measurements only.
NOT INTRODUCED: sampling, frame/coordinates/calculation changes, altered A/B snapshot
semantics, time evolution, Simulation/history, scale changes, new physics/data.
Retain one Demo composition in StormRelativeLaboratory at t=0, fixed A and immutable
atomic B snapshots, arrow scale 80, current movement/reset/ownership behavior.
NOT CLAIMED: implementation, acceptance, scientific qualification or new user evidence.

This proposal is independent of deferred sequential navigation. If both are later
authorized, avoid conflicting slot names and preserve navigation at the bottom of
the explanatory panel; do not move it with measurement cards. Neither proposal
automatically authorizes the other, shared Glossary, Explore or a navigation redesign.

Review questions: approve slot relocation and role/Vertical velocity copy; accept the
side-by-side-to-stack candidate and stable unavailable layout; evaluate visibility
given the current canvas/sticky sizes; then separately authorize bounded implementation
and developer checks. Preserve existing dirty/untracked files via bounded backup and
own-hunk rollback, no reset/clean. Relevant pending human acceptance remains separate.
STOP after documentation: proposed UX refinement requires human review and explicit
implementation authorization; no code/test/CSS changes in this work.

## 6. Developer-check disposition after separately authorized implementation

The implementation Decision above supersedes the documentation-only execution gate
for the bounded relocation. Actual implementation/developer findings are owned by
PROJECT_STATUS. The added desktop acceptance criterion is NOT MET at initial scroll
position: at 1366×768 the unchanged canvas spans y=264–686 and cards y=742–994;
at 1440×900 canvas spans y=264–759 and cards y=815–1066. Controls extend below
the fold too. These are CSS-pixel DOM observations, not scientific/model evidence.
Cards are side-by-side/stacked as proposed, but proximity alone does not meet the
stronger simultaneous-visibility requirement. No viewport or shell workaround was
introduced; stop further layout changes pending human disposition.

Smallest alternative for review: a Compare-only workspace entry/focus anchor that
brings the scene and adjacent controls to the top of the visible content, preserving
canvas dimensions and the global shell. This could be an explicit user action or
separately approved entry-scroll behavior; neither is implemented/authorized here.
It requires keyboard/focus, full controls and both-card-fit verification at both
desktop sizes. If “without scrolling” excludes even such an entry adjustment, this
alternative does not satisfy the criterion: the owner must instead authorize a
lesson-local compact layout exploration or revise the criterion. No fit guarantee
or silent reduction of the scientific viewport is justified by this proposal.

## 7. Subsequent bounded Move B reveal

The owner separately requested a page scroll on Move B in the
[Move B scroll Decision](../2026-10-25-compare-flow-move-b-scroll-decision.md).
This permits an on-action reveal only, not generic lesson-entry scrolling or new
layout/camera changes. Reveal the existing measurement group when enabling Place B,
instantaneously, keeping focus and data. No repeated scroll during movement or on
Done/Escape/reset. Preserve the existing scroll/pointer cancellation policy.
Desktop should show both cards after activation; mobile must reveal the stacked
cards even if that means scrolling upward from the lower control panel. Expanded
details larger than the screen remain naturally scrollable; do not promise that
arbitrary expanded content and the entire canvas always fit. Original initial-entry
no-scroll findings in §6 remain historical facts, not a newly passed acceptance.
