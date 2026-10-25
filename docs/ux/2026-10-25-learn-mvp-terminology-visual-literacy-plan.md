# Learn MVP — Terminology & Visual Literacy Refinement Plan

## Status

| Field | Value |
| --- | --- |
| Document type | DESIGN |
| Approval state | APPROVED WITH REFINEMENTS |
| Authority status | ACTIVE for implementation constraints; implementation/developer verification NOT YET AUTHORIZED |
| Freeze mode | MUTABLE |
| Authority scope | Bounded Learn presentation implementation constraints; separately gated shared Glossary content direction; no implementation permission |
| Parent authority | [Planning authorization](../2026-10-25-learn-mvp-terminology-planning-decision.md), [Slice 3 acceptance](../2026-10-25-learn-slice-3-technical-acceptance-decision.md), [Slice 4 Design](2026-10-25-learn-slice-4-compare-the-flow-design.md), [Stage 2 plan](2026-10-25-learn-slice-4-stage-2-implementation-plan.md) and [visual-refinement Decision](../2026-10-25-learn-slice-4-stage-2-visual-refinement-decision.md) |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## 1. Boundary and review basis

The human approved this plan WITH REFINEMENTS in the
[human plan-review Decision](../2026-10-25-learn-mvp-terminology-plan-review-decision.md).
Accepted changes are implementation constraints, not implementation permission.
Owner-supplied tracer and local-velocity sentences below are exact accepted copy.
The shortened scale paragraph and technical Model note are recorder-drafted final
wording within accepted constraints, for confirmation in the next owner disposition;
they are not verbatim owner-approved sentences. Glossary has content-direction
approval only. Planning/documentation only is authorized. No planning PASS, code
acceptance or scientific qualification is asserted. Slice 4 Stage 2 and its visual
refinement remain pending separate human technical/visual acceptance.

Reading order: Look Around introduces space; Follow Motion introduces passive
tracers and recorded paths; Read the Motion introduces local velocity; Compare
the Flow introduces stationary measurements and spatial variation.

INTRODUCED by this proposal: presentation terminology and explanations only.
NOT INTRODUCED: new physics, data, computation, sampling, frame transforms, motion,
controls, camera behavior, navigation, qualification or new visual scene objects.
NOT CLAIMED: Learn MVP/Stage 2 acceptance, implementation/developer-verification
authorization, or exact-copy approval beyond the human-reviewed disposition.

Repository checkpoint before planning: HEAD
`c3769f8af0cd662afcda6242cf952b7791e6065a`; 21 modified and 33 untracked Git entries,
including untracked Learn directories. These are working-tree line targets, not
a clean committed identity. Do not clean, stage, reset or mechanically replace
files. Recheck each target against the implementation-time working tree.

## 2. Vocabulary principles and proposed copy

Human-approved input principles: passive tracer/tracer is the virtual advected
object; tracer marker/marker is its visible position symbol; stationary probe/probe
is a sampling point repositionable between measurements. Velocity field names the
mathematical vector field; prescribed velocity field names the Learn Demo source;
model airflow is its novice-facing description. Local airflow velocity is a vector
at a point; storm-relative means relative to prescribed C. Recorded path is history,
not a streamline/forecast. Model time differs from playback duration; height is above
model ground, not MSL/terrain. Contextual synonyms remain allowed; no global rename.

The tables record the approved basis with review refinements; recorder-drafted
wording is identified above. Unlisted copy stays unchanged.

### 2.1 Look Around

| Target in current working tree | Before | Proposed after |
| --- | --- | --- |
| [LearnPage.tsx:53](../../src/app/learn/LearnPage.tsx#L53) | This 3D space already contains a calculated airflow, but you can't see it yet. The grid helps you understand where you are in the model. | We’ll use this 3D space to explore a prescribed model airflow. The grid helps you understand where you are in the model. |
| [LearnPage.tsx:54](../../src/app/learn/LearnPage.tsx#L54) | Imagine smoke drifting in the wind. Its movement reveals where the air is going. We'll use colored markers in a similar way — to make the calculated airflow visible. | Imagine smoke drifting in the wind. Its movement reveals where the air is going. In the next lesson, colored markers will help us see motion through the model airflow. |
| [LearnPage.tsx:55](../../src/app/learn/LearnPage.tsx#L55) | Next, we'll place two markers in this invisible airflow and watch where they go. Will their journeys look alike? | We’ll start two markers at different places and watch where they go. Will their journeys look alike? |
| [LearnOrientationViewport.tsx:63](../../src/app/learn/LearnOrientationViewport.tsx#L63) | The grid marks ground level in the model, not real terrain. Up is height. | The grid marks model ground, not real terrain. N/E/S/W mean north/east/south/west. The 0 marks the coordinate origin. Height increases upward. |

Rendering fact: [worldCoordinateReference.ts:53](../../src/rendering/worldCoordinateReference.ts#L53)
creates a ground grid, origin disc/cross and 0 label, and N/E/S/W. It does not draw
a dedicated vertical Y axis. Do not add a claim that a visible vertical axis exists,
or add an axis in this copy slice. No tracer or arrow legend belongs in Slice 1.

### 2.2 Follow Motion

| Target | Before | Proposed after |
| --- | --- | --- |
| [LearnFollowMotion.tsx:53](../../src/app/learn/LearnFollowMotion.tsx#L53) | Two markers, one airflow. | Two passive tracers, one model airflow. |
| Same introduction, insert after that sentence | No definition | A passive tracer is a virtual object that moves with the model airflow. Its colored marker shows where it is. |
| [LearnFollowMotion.tsx:54](../../src/app/learn/LearnFollowMotion.tsx#L54) | Both markers start at the same height, but in different places. | Both tracers start at the same height, but in different places. |
| [LearnFollowMotion.tsx:51](../../src/app/learn/LearnFollowMotion.tsx#L51) | The markers are following the same calculated airflow, starting from different locations. | The tracers move through the same model airflow, starting from different locations. |
| [LearnFollowMotion.tsx:48](../../src/app/learn/LearnFollowMotion.tsx#L48) | The calculated airflow changes from place to place. Following the markers makes those differences visible. | The model airflow varies from place to place. Following the tracers makes those differences visible. |
| [LearnFollowMotion.tsx:58](../../src/app/learn/LearnFollowMotion.tsx#L58) | Model note: Markers trace a calculated airflow; they don't represent individual air parcels. | Model note: Tracer motion is calculated from the prescribed model velocity field. These passive tracers do not affect the airflow or represent individual real air parcels. |
| [LearnFollowMotion.tsx:83](../../src/app/learn/LearnFollowMotion.tsx#L83) | A — red · B — blue / Open ring = starting point | Replace with the always-visible compact legend below. |
| [LearnFollowMotion.tsx:88](../../src/app/learn/LearnFollowMotion.tsx#L88) | The dashed vertical lines and small ground rings mark the original start positions above model ground, not real terrain. Colored lines show the paths already travelled; solid A/B markers show the current positions. | Remove this duplicated paragraph after the equivalent legend is visible. Retain playback and Reset View paragraphs. |

Proposed legend heading: **Reading the scene**. Entries:

| Symbol | Exact proposed label and description |
| --- | --- |
| Red solid dot + A, blue solid dot + B | **Tracer markers A/B** — Solid markers show the tracer positions. |
| Red/blue solid line | **Recorded path** — Where each tracer has already travelled, not a predicted route. |
| Larger coloured open ring | **Starting ring** — The tracer’s initial position. |
| Neutral dashed vertical line ending at a small ground ring | **Height guide** — Marks the initial height; the small ring is its projection on model ground, not a trajectory. |

Keep the definitions visible before Start, during flight, paused and after completion.
Do not move the height guides with the tracer: they mark starts in this lesson.
Warning copy “Your markers and paths will be discarded” remains unchanged.

### 2.3 Read the Motion

| Target | Before | Proposed after |
| --- | --- | --- |
| [LearnReadMotion.tsx:61](../../src/app/learn/LearnReadMotion.tsx#L61) | In Follow Motion, we watched two different paths. Now follow one marker and its velocity arrow. | In Follow Motion, we watched two tracers take different paths. Now follow one tracer marker and its local velocity arrow. |
| [LearnReadMotion.tsx:62](../../src/app/learn/LearnReadMotion.tsx#L62) | The arrow points in the direction of the airflow. A longer arrow means faster motion. | The arrow shows local airflow velocity at the tracer’s position: its direction and speed. |
| [LearnReadMotion.tsx:103](../../src/app/learn/LearnReadMotion.tsx#L103) | A — red marker and recorded path / Gold arrow — local velocity, constant length scale | Replace with the compact legend below. |
| [LearnReadMotion.tsx:107](../../src/app/learn/LearnReadMotion.tsx#L107) | The arrow shows calculated storm-relative velocity at the displayed position and recorded model time. Its tail is anchored at the marker; it is not a predicted next position. | The arrow shows storm-relative velocity at the displayed position and model time: velocity relative to the prescribed storm motion C. Its tail is anchored at the marker. |
| [LearnReadMotion.tsx:108](../../src/app/learn/LearnReadMotion.tsx#L108) | Arrow scale: 10 m/s is drawn as 400 model metres. Camera orbit, perspective and zoom affect its appearance on screen. | Arrow length represents speed, not distance travelled or predicted displacement. The display scale is fixed within each lesson, but differs between Read the Motion and Compare the Flow. Screen lengths cannot be compared directly across lessons; perspective and zoom also affect apparent length. |
| [LearnReadMotion.tsx:102](../../src/app/learn/LearnReadMotion.tsx#L102) | Flight time: | Model time: |
| Same output aria-label | Flight model time | Flight model time — keep this accessible distinction from the selected historical model time. |
| [ReadMotionInvestigation.tsx:47](../../src/app/learn/ReadMotionInvestigation.tsx#L47) | Reference; aria-label Reference moment | Saved reference; aria-label Saved reference moment |
| [ReadMotionInvestigation.tsx:48](../../src/app/learn/ReadMotionInvestigation.tsx#L48) | Current; aria-label Current moment | Selected moment; aria-label Selected recorded moment |
| [ReadMotionInvestigation.tsx:59](../../src/app/learn/ReadMotionInvestigation.tsx#L59) | Save for comparison | Save for comparison — keep action; add the short helper below. |
| Near comparison action, before first save | No explanation when reference is absent | Save the selected moment to keep its measurements as a reference while you inspect another moment. |
| [ReadMotionInvestigation.tsx:60](../../src/app/learn/ReadMotionInvestigation.tsx#L60) | Clear reference | Clear saved reference |
| [ReadMotionInvestigation.tsx:62](../../src/app/learn/ReadMotionInvestigation.tsx#L62) | Save another moment to replace Reference. | Saving another moment replaces the saved reference. |

No empty placeholder card is proposed: absence of a saved reference remains absence
of the card, with the helper sentence explaining the action. Keep existing unavailable
messages and disabled Save behavior. Do not rename internal `current`, `reference`,
`saveReference` or history APIs. They are not UI strings.

Legend entries, visible before Start and through Investigate:

| Symbol | Exact proposed label and description |
| --- | --- |
| Red solid A + red line | **Tracer marker and recorded path** — A shows the displayed tracer position; the line shows where it travelled. |
| Gold arrow | **Local velocity arrow** — Airflow direction and speed at A, not a path or predicted displacement. |
| Red open start ring | **Starting ring** — A’s initial position. |
| Neutral dashed line and small ground ring | **Height guide** — The initial height above model ground, not a trajectory. |

Preserve Watch/Investigate phase copy, steady-but-nonuniform explanations,
coordinate-component-versus-field-contribution explanation, signs, scientific
anti-claims and the existing recorded-time/flight-clock distinction. Saved reference
is a measured card, not an additional 3D marker, arrow or probe.

### 2.4 Compare the Flow

| Target | Before | Proposed after |
| --- | --- | --- |
| [LearnCompareFlow.tsx:90](../../src/app/learn/LearnCompareFlow.tsx#L90) | Reset Probes | Reset B |
| [LearnCompareFlow.tsx:103](../../src/app/learn/LearnCompareFlow.tsx#L103) | B stays 1000 m above model ground. The highlighted area limits where you can place B. It is not the edge of the model. | B stays 1000 m above model ground. |
| [CompareFlowViewport.tsx:140](../../src/app/learn/CompareFlowViewport.tsx#L140), insert after grid note, before legend | No scale explanation | Arrow lengths use a fixed display scale within this lesson. Other lessons may use a different scale, and perspective changes apparent length. Do not compare screen lengths across lessons. |

Retain the current Reading the scene component verbatim, including area-not-model-
boundary and only-when-Move-B wording, stationary probe distinction and not-a-path
explanation. The removed duplication remains covered visibly by that legend.
Retain the caption Stationary measurements · Model time: 0 s and the unchanged
spatial-variation/scientific-boundary paragraphs. No camera or interaction refinement.
Reset B is an approved UI-label-only change: retain the existing operation, callback,
focus behavior and independence from Reset View exactly unchanged.

## 3. File boundaries, components and ownership

Learn production allowlist (only after separate authorization):
- `src/app/learn/LearnPage.tsx`
- `src/app/learn/LearnOrientationViewport.tsx`
- `src/app/learn/LearnFollowMotion.tsx`
- `src/app/learn/LearnReadMotion.tsx`
- `src/app/learn/ReadMotionInvestigation.tsx`
- `src/app/learn/LearnCompareFlow.tsx`
- `src/app/learn/CompareFlowViewport.tsx`
- `src/app/app.css` (Learn-scoped additions only)

New components only: `FollowMotionLegend.tsx` and `ReadMotionLegend.tsx`, both in
src/app/learn, pure presentational functions without props/state unless required
by exact copy; no effects, RAF, listeners, WebGL objects or scene ownership.

Reuse CompareFlowLegend's semantic pattern (`section`, heading, `dl`, text next to
decorative SVG), not a generic configurable scene-legend framework. Keep the existing
CompareFlowLegend runtime unchanged. Share no new model/session API. Import existing
TRACER_COLORS for symbol colours. Gold #ffdc75, neutral guide #b9c7d6, start-ring
and ground-ring shapes must match existing rendering; test the correspondence without
changing render geometry/materials. New components must not import TracerScene.

Proposed CSS: a Learn-scoped motion-legend class with small heading, grid of entries,
40×24 decorative SVG samples, wrapping descriptions, zero dd indent, responsive
single column on narrow screens. Reuse existing variables and typography. No global
button, top-bar, footer, navigation or CompareFlowLegend restyling. Legend remains
normal-flow directly beneath each scene's toolbar/instruction; no scene overlay.
Follow/Read existing .learn__legend paragraphs are replaced, not duplicated.

Accessibility: meaningful dt text independent of colour; A/B letters; line/ring/dash
differences; SVG aria-hidden; no focusable legend icons or redundant live regions.
Use unique accessible region labels per lesson, e.g. “Follow Motion scene guide”
and “Read the Motion scene guide”, while visible heading stays Reading the scene.
Do not add a visible vertical-axis symbol in Slice 1. No extra completion gate.

## 4. Dependency and documentation impact

Existing targeted tests: Learn.test.tsx:94 (orientation copy),
LearnFollowMotion.test.tsx:159/162 (copy) and :309–326 (comparison card selectors),
LearnCompareFlow.test.tsx:134 and other Reset Probes lookups (Reset B now approved).
Resolve every remaining occurrence of Current moment, Reference moment, Clear
reference, Reset Probes and old copy using rg within Learn before implementation.
Update dependent selectors to the new accessible names; preserve numerical/reference
behavior assertions. Add direct legend semantic tests in existing Learn test files
unless a separate test file materially improves clarity.

Test-write allowlist: `src/app/learn/Learn.test.tsx`,
`src/app/learn/LearnFollowMotion.test.tsx`, `src/app/learn/LearnCompareFlow.test.tsx`;
optional new pure legend test files only under `src/app/learn/`. Rendering, session
and inspection tests listed in the regression command are run-only, not edit targets.
Shared Glossary tests are excluded unless that separate sub-scope is authorized.

Current historical Decisions and acceptance records use Reference/Current; these are
historical receipts, not live copy authorities to rewrite. The mutable Slice 4 Design
and Stage 2 plan also say Reset Probes; a later authorized presentation successor/
status note must map Reset B to the same accepted operation. Do not mechanically
rename historical source quotations or frozen records. Any final implementation
Decision/status must distinguish new UI labels from unchanged internal semantics.
No existing technical documentation is changed by this planning proposal other than
its required authorization receipt and current-state navigation.

## 5. Shared Glossary — content direction approved, implementation separately gated

Target [glossaryContent.ts:77](../../src/app/glossaryContent.ts#L77):

**Before:** “A passive tracer is a moving probe carried by V_total. It does not
affect the airflow and does not acquire or generate vorticity.”

**After, proposed:** “A passive tracer is a virtual object whose motion is calculated
from V_total. Its marker shows its position. It does not affect the airflow and does
not acquire or generate vorticity. A stationary measurement probe samples the field
at a chosen point instead of travelling with the flow.”

Adjacent recorded-trajectory and historical-sample definitions
[glossaryContent.ts:79](../../src/app/glossaryContent.ts#L79) are correct; keep unchanged.
Source, Analysis, their availability and the seven velocity-contribution definitions
stay unchanged. Preserve no-generated-vorticity wording; no new scientific inference.

Consumer [GlossarySurface.tsx:194](../../src/app/GlossarySurface.tsx#L194) renders the
definition. Landing opens it via LandingPage.tsx:204; Explore via App.tsx:914, shared
surface App.tsx:631. LearnPage.tsx:65 opens How It Works, not Glossary; there is no
direct Learn Glossary link. Do not introduce one or change navigation. Shared How It
Works tracer wording is reference context and not part of this implementation slice.

If separately authorized, allow only glossaryContent.ts and relevant definition/
surface tests (GlossarySurface.test.tsx); verify Landing/Explore open/close, focus,
paragraph wrapping and unchanged source/Analysis wording. This sub-scope is NOT
automatically included in approval or later authorization of Learn changes.

## 6. Verification matrix for a later authorized implementation

| Layer | Required checks |
| --- | --- |
| Semantic copy | Proposed replacements present; old live labels absent only in targeted Learn surfaces; no global source-code identifier rename. |
| Legends | Visible before/during/after, no Details needed; correct A/B colours, line/ring/guide/arrow shapes; no invented reference objects; accessible text without colour. |
| Recorded inspection | Selected moment changes with timeline; saved reference unchanged until replace/clear; unavailable stays unavailable; 0/60/120 s behavior and units preserved. |
| Controls | Existing Start/Pause/Resume/Replay, navigation cancellation, Reset View, Place B, boundary no-op and Reset B/Probes callback semantics unchanged. |
| Lifecycle | Pure legends add no resources; retain existing StrictMode/cleanup and single-arrow/pair-arrow regression coverage. |
| Desktop/mobile | Real-WebGL at 1440×1000, 390×844, 320×844 where available; readable legends, no horizontal overflow/overlays; keyboard focus and disclosure/card naming; screenshot each lesson and comparison state. |
| Scope | Diff allowlist: no composition, field, integrator, scenario, camera, picking, session/inspection computation or rendering edits. |

Proposed regression command (do NOT execute during planning):
`npx vitest run src/app/learn src/rendering/TracerScene.learn.test.ts src/rendering/TracerScene.resetView.test.ts src/rendering/velocityArrow.test.ts src/app/appNavigation.wiring.test.tsx`.
Then `npm run typecheck` and `npm run build`. Do not assume the earlier 142-test
count is a future requirement or a fresh result. Retain bundle warning and mark
physical touch, forced real context loss and long-duration GPU/heap profiling
NOT VERIFIED unless actually checked under a later permission. No scientific
execution/evidence campaign is part of developer UI checks.

## 7. Invariants, rollback and exclusions

Preserve Demo composition, StormRelativeLaboratory, C subtraction, model-time and
height semantics, steady-but-nonuniform field, passive/no-air-parcel disclaimer,
component signs and distinction from flow contributions. Preserve actual velocity
sampling, recorded points, immutable saved reference and missing-versus-zero behavior.
Arrow scales stay exactly 40 (Slice 3) and 80 (Slice 4), display-only and constant
within lessons. No mechanical scale unification. Slice 4 A/B, bounds, picking,
camera, geometry, gestures, controls/RAF/resource ownership stay unchanged.

Rollback: before later edits, capture a bounded patch/snapshot of affected dirty and
untracked files outside permanent documentation. Revert only that implementation's
own hunks/new legend files after checking concurrent edits; never git reset/clean or
restore the whole working tree. Restore old copy and tests together, preserving
existing Learn implementation, scientific data and unrelated changes. Rollback
does not silently erase historical authorization/verification records.

Excluded: Explore UI unification, source/Analysis semantics, shared help/navigation,
new scientific/model authority, frozen changes, scientific execution, commit/push/
deploy and acceptance claims. Explore CURRENT, Simulation time and moving glyph
wording remain future reference-context candidates only.

## 8. Human-review disposition and remaining stop gates

The owner approved Look Around, the Follow Motion legend with the simpler exact
tracer definition, the Read the Motion legend and Selected moment / Saved reference
names with unchanged save/replace/clear semantics, Reset B as a label only, the
existing Slice 4 legend/duplication reduction and the brief scale caveat. The two
recorder-drafted paragraphs (technical Model note and shortened detailed scale
copy) implement requested wording constraints for the next owner disposition;
do not represent them as verbatim owner-approved copy. Other accepted before/after
rows and legend entries remain the approved basis. Actual responsive density and
visual readability require later authorized developer checks and human review.

The Glossary distinction has CONTENT DIRECTION APPROVED, not exact-definition
approval or implementation authorization. Do not include glossaryContent.ts,
GlossarySurface or Glossary tests in a Learn implementation permission by inference.

Remaining gates:
1. Confirm recorder-drafted final wording in the next owner disposition if needed.
2. Obtain explicit bounded Learn implementation AND developer-verification permission.
3. Obtain a separate Glossary approval/authorization if that sub-scope is selected.
4. Keep human technical/visual acceptance separate; Stage 2 remains PENDING.

Stop after documentation. This approved plan constrains possible implementation;
it authorizes neither implementation nor developer verification. All allowlists,
accessibility/responsive checks, regression matrix, rollback and exclusions above
remain binding constraints. No scientific or frozen-record transition is made.

## 9. Deferred sequential navigation addendum

Subsequent disposition: [final integration authorization](../2026-10-25-learn-final-integration-decision.md)
opens this bounded navigation implementation/developer-verification gate explicitly,
without claiming pending human acceptance. The component/slot candidate and file
boundaries below are its implementation basis. Earlier deferred wording is historical
for that gate; current results and remaining acceptance are in PROJECT_STATUS.

The owner added the requirement in a separate
[documentation-only Decision](../2026-10-25-learn-sequential-navigation-planning-decision.md).
The bounded [Learn navigation design contract](2026-10-25-learn-sequential-navigation-design.md)
owns its mapping, action audit, UI/transition/ownership constraints and acceptance
gates. This addendum is not part of the already executed terminology slice and
does not retroactively expand its file allowlist or implementation authorization.

Required mapping: Look Around → Next Follow Motion; Follow Motion → Back Look Around
and Next Read the Motion; Read the Motion → Back Follow Motion and Next Compare the
Flow; Compare the Flow → Back Read the Motion. Keep top tabs, omit endpoint actions,
place one shared group at the bottom of explanatory content, Back secondary/outlined,
Next primary. No auto-advance, progress gate or second navigation state machine.

Implementation candidate: pure `src/app/learn/LearnLessonStepNavigation.tsx` takes
current lesson and onSelect; LEARN_LESSONS provides order/destination titles.
LearnPage supplies selectLesson through a presentation slot to explanatory panels.
Replace Look Around CTA and Follow Motion local Back markup, avoiding a local guard
wrapper around parent selectLesson. Add Read/Compare actions. In Read Investigate,
pass the same slot into the inspector/conclusion, rendering only one navigation group.
Use existing button styles; only scoped wrapping/stacking CSS if needed. Do not
change renderer/session/inspection computation, physics or shared global navigation.

Prospective write allowlist, valid only after separate authorization:
- `src/app/learn/LearnLessonStepNavigation.tsx` (new pure component)
- `src/app/learn/LearnPage.tsx`
- `src/app/learn/LearnFollowMotion.tsx`
- `src/app/learn/LearnReadMotion.tsx`
- `src/app/learn/ReadMotionInvestigation.tsx`
- `src/app/learn/LearnCompareFlow.tsx`
- `src/app/app.css` (step-action group layout only, if necessary)
- `src/app/learn/Learn.test.tsx`, `LearnFollowMotion.test.tsx`,
  `LearnCompareFlow.test.tsx` and optional `LearnLessonStepNavigation.test.tsx`
  (all four test paths under `src/app/learn/`)

Existing `LearnLessonNavigation.tsx`/LEARN_LESSONS are reuse/read-only candidates:
no separate lesson list, route state or new top-tab behavior is needed. Existing
onLookAround prop/wiring may be removed only as the old guarded action is replaced
with the parent-routed slot and isolated tests are migrated. All transitions still
pass through the existing departure handle once, not zero or twice.

| Required future check | Expected result |
| --- | --- |
| Mapping and endpoints | Exact six actions, correct destination names/styles; no disabled endpoint placeholders; four top tabs unchanged. |
| Placement | Bottom of explanatory panel before/during/after each lesson, including Read Investigate; no duplicate groups or scene overlays. |
| Guard equivalence | Back and Next from Follow/Read with recorded paths each open the same existing dialog once; cancellation preserves history, reference and session, returning focus to invoking action. Confirmation selects the destination and disposes once. |
| Unguarded entry | Zero-step Follow/Read departures match existing tab behavior; Compare Back does not invent a trajectory-loss warning; Look Next retains current target. |
| No automatic advance | Completing either flight, changing timeline, saving/clearing reference, Replay and Reset B never select another lesson. |
| State retention / fresh entry | Same-lesson tab remains no-op; replay unchanged; cancelled transition retains selection/reference/B as applicable; confirmed departure/re-entry uses existing fresh-session rules. |
| Cleanup | Existing StrictMode, RAF/listener/observer/renderer disposal and single-arrow/pair-arrow regression tests remain run-only; no extra loop or hidden mounted scene. |
| Keyboard / focus | Tab/Enter/Space work; destination heading focus and dialog focus restoration preserved; help/dialog do not expose background navigation. |
| Responsive WebGL | 1440×1000, 390×844, 320×844 CSS px; titles readable, Back before Next, no horizontal overflow/clipping/overlap; scenes and controls remain usable. Physical touch NOT VERIFIED if no device. |

After future authorization, run the regression command in §6, targeted step-action
tests, full typecheck/build and bounded browser checks; report actual results only.
Before coding, preserve pre-edit dirty/untracked files using the bounded rollback
strategy in §7. Revert only navigation-owned hunks/files, not the earlier terminology
work. If changes outside this prospective allowlist or altered guard semantics are
needed, stop for separate review. Current scientific/runtime invariants remain binding.

STOP: relevant pending Learn acceptance/UI gates must be dispositioned by the owner,
then separate navigation implementation/developer-verification permission obtained.
No navigation implementation or acceptance is authorized by this documentation.
