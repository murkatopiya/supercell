# Learn Slice 4 — Stage 2 Implementation Plan: Explore the Field

## Status

| Field | Value |
| --- | --- |
| Document type | DESIGN |
| Approval state | APPROVED with the bounded human-review refinements below |
| Authority status | ACTIVE for plan constraints; bounded implementation/developer verification separately authorized by the implementation Decision |
| Freeze mode | MUTABLE |
| Authority scope | Approved bounded Stage 2 implementation, interaction and future developer-verification constraints; no implementation or execution permission |
| Parent authority | [Stage 2 implementation Decision](../2026-10-25-learn-slice-4-stage-2-implementation-decision.md), [human plan-review Decision](../2026-10-25-learn-slice-4-stage-2-plan-review-decision.md), [architectural-basis and documentation Decision](../2026-10-25-learn-slice-4-stage-2-planning-decision.md), [Slice 4 Design](2026-10-25-learn-slice-4-compare-the-flow-design.md) and [Stage 1 technical acceptance](../2026-10-25-learn-slice-4-stage-1-technical-acceptance-decision.md) |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## 1. Accepted basis, proposed details and stop gate

The owner completed human review and approved this plan WITH REFINEMENTS in the
[plan-review Decision](../2026-10-25-learn-slice-4-stage-2-plan-review-decision.md).
Architecture, file boundaries, API directions, atomic B snapshots, modes, probe
control, independent resets, ownership, cleanup and test matrix are accepted plan
constraints. This approval does not authorize implementation or developer
verification. The earlier architectural-basis Decision retains its historical
documentation-only meaning. Earlier full-lesson Design proposals for range inputs
and scale 40 do not override the newer four-button and scale-80 decisions.

Human-review refinements — 2026-10-25:

- Accept `abs(D.y)<=1e-8` as a preliminary numerical UI policy for normalized D;
  test parallel/near-parallel, nonfinite and backward rays. It is not physics.
- Accept `pan-y pinch-zoom` and 5 CSS px maximum excursion as implementation
  candidates, not verified touch behavior. Physical-mobile checking is mandatory
  when a device is available under later verification authorization; otherwise
  report NOT VERIFIED.
- Accept focus-preserving `aria-disabled` boundary buttons with guarded no-op and
  accessible, non-repeating status messages.
- Keep 2500 display metres camera margin provisional. No confirmed whole-area
  framing/readability claim before real-WebGL visual review.
- Verify plane transparency, depth/order rendering and visibility of arrows,
  probes and guides across views; the plane is a UX limit only.
- Retain strict boundaries without epsilon-clamp, check edge/corner clicks
  visually and stop for separate numerical-policy review if UX is unsatisfactory.

Accepted Stage 2 scope: Inspect / Place B; single click/tap placement with no drag;
four relative East/North buttons with 100 m steps and shorter final boundary steps;
vertical page scrolling in Place B with gesture cancellation; a secondary
translucent placement area visible only in Place B at y=1000; direct ray-plane
picking; one unchanged Demo composition at t=0, original A snapshot, atomic B
snapshots; common arrow scale 80; independent camera/probe resets; explicit invalid,
unavailable and genuine-zero behavior; no sign-change location hint or completion gate.

Interaction rectangle remains the inherited preliminary candidate:
world x=1500…5500 m, z=−1000…1000 m, y=1000 m. It constrains only B placement,
not A and not the model's physical domain. A=(0,1000,4000), initial B=(2400,1000,0).

INTRODUCED: proposed user relocation of a stationary sampling probe and observation
of existing local velocities at new positions. NOT INTRODUCED: physical advection,
Simulation, integration, clock advancement, trajectory/history, field evolution,
new Demo/data/physics, diagnostics, field-contribution displays, numeric coordinate
entry, persistence or new UI framework. NOT CLAIMED: forces, vorticity, convergence,
model qualification, forecast/reconstruction or usability already demonstrated.

**STOP GATE disposition — 2026-10-25:** the owner's separate [implementation
Decision](../2026-10-25-learn-slice-4-stage-2-implementation-decision.md) opens only
bounded Stage 2 implementation and planned developer verification. This plan's
approval alone grants no action permission. No Simulation, campaigns or scientific
evidence collection is authorized. Stop after implementation/developer checks for
separate human technical/visual acceptance; tests do not close that gate.

## 2. Proposed files and APIs

All source names below are planned changes, not work performed during drafting.

| File | Proposed minimal change |
| --- | --- |
| `src/app/learn/createCompareFlowSession.ts` | Keep one composition and same-instance observation; retain original immutable A and initial B snapshots; expose `observeB(position)` returning one immutable measurement+arrow snapshot at t=0. No step/clock/history API |
| `src/app/learn/CompareFlowMeasurement.ts` | Reuse finite/exception handling and atmospheric conversion; define shared probe snapshot construction so cards and arrow never sample independently |
| New `src/app/learn/CompareFlowPlacement.ts` | Pure constants/policies: normalized-ray intersection at y=1000, rectangle boundary validation, `offsetB(position, axis, delta)` and typed accepted/invalid results; no sampling or renderer dependency |
| `src/app/learn/LearnCompareFlow.tsx` | Own stable session, current B snapshot, Inspect/Place B and concise placement status; four native axis buttons, reset actions and scientific copy |
| `src/app/learn/CompareFlowViewport.tsx` | Keep renderer effect independent of B revision; stable pointer/touch/scroll handlers and latest-snapshot refs; synchronize existing marker/arrow/guide objects on committed B changes |
| `src/app/learn/compareFlowView.ts` | Candidate stable whole-area home framing at scale 80, separate from measurement updates; human visual review required |
| `src/rendering/TracerScene.ts` | Opt-in `setComparisonPlacementMode(enabled)` controlling own OrbitControls and canvas touch policy; `setComparisonPlacementAreaVisible(visible)` or combined mode API; delegate dynamic probe-guide updates. Existing pair/single arrow APIs retained |
| `src/rendering/tracerAnnotations.ts` | Opt-in current-probe height-reference synchronization; update B guide endpoints, dash distances and ground ring in place; default Follow Motion start references remain fixed |
| New optional `src/rendering/compareFlowPlacementArea.ts` | Owned secondary translucent plane rectangle and outline with explicit dispose, if extracting geometry keeps TracerScene small |
| `src/app/app.css` and scoped Learn/scene/helper tests | Minimal responsive controls/status styles and focused tests from §8; existing lesson/navigation regressions preserved |

No general scene/lab engine, control-disposal framework or broad Slice 3 refactor.
Reuse `pointerNdcFromClientRect`, `TracerScene.worldRayFromNdc`,
`measureCompareFlow`, pair-arrow geometry and established Learn patterns.

## 3. Model observation and atomic state

Keep the session object stable for the mounted lesson. A/B share its original
StormRelativeLaboratory Demo total field; sample only B at the requested new P
and t=0. Never compose a new field per movement or pass a newly created session
to the viewport as the means of publishing B.

Proposed B snapshot: readonly `{ measurement, arrow, revision }`, with arrow
derived from that exact measurement's P,V and scale 80, or null for unavailable /
zero as appropriate. Retain immutable original snapshots for Reset Probes. Publish
marker, label, guide, card and arrow from the same B revision; do not show an old
arrow beside a new card. A's snapshot identity and values do not change.

World metres: X east, Y up, Z south. Position UI North=-z; velocity components
Eastward=vx, Northward=−vz, Vertical=vy in m/s. No second C subtraction. Arrow
tip=P+80V; no per-point normalization, ground clipping or screen tangent. Display
arrow endpoints are not physical travel endpoints and may lie below ground.

Sampling occurs only on committed valid location changes, never on hover, RAF,
camera movement, resize, help or disclosure changes. Prepare the result before
publishing one B snapshot; avoid sampling side effects inside React render or a
state updater that StrictMode can invoke twice. Rapid repeated buttons/pointer
actions use the latest committed B, not a stale closure. A no-op outward action
at a boundary must not resample. Reset Probes reuses the initial snapshot rather
than recomposing or integrating. Model time remains literal zero throughout.

## 4. State transitions, resets and user text

| Event / condition | Transition and effect |
| --- | --- |
| Entry / re-entry | Inspect; original A/B, collapsed horizontal disclosures, reviewed home camera |
| Move B | Enter Place B before a new gesture begins; show region, suspend camera input, set touch policy; no measurement change |
| Valid click/tap in Place B | Publish new B snapshot; remain Place B; no flight, trail or interpolation |
| Invalid ray / external placement | Keep last position, values, arrow and guides; announce reason; remain Place B |
| Valid point / unavailable sample | Publish B at new point with unavailable measurement and hidden arrow; guide/marker identify that point; A retained |
| Axis button in either mode | Move relative to latest B with boundary policy; publish once, retain current mode |
| Done moving B / Escape | Inspect; cancel pending candidate, hide region, restore camera policy; focus Move B |
| Reset View | Camera only; cancel candidate tied to old camera, keep mode, B snapshot and disclosures |
| Reset Probes | Original B snapshot, Inspect, hidden region; camera unchanged; focus stays on Reset Probes |
| Help opening | Cancel candidate, leave Place B; preserve camera/snapshots; existing modal focus behavior wins |
| Help closing | Inspect, return focus to help trigger; no automatic placement resumption |
| WebGL failure / context loss | Cancel gestures, Inspect; keep last snapshots and axis controls available; Move B unavailable until rendering recovers; retry creates only rendering and reads latest snapshots |
| Lesson departure | Dispose local UI/rendering resources; preserve existing guards when arriving from trajectory lessons; no new loss-of-history warning here |

Use a native Move B / Done moving B toggle with `aria-pressed`. Proposed copy:

| Surface | Exact candidate English text |
| --- | --- |
| Exploration | `Move B around the plane. What changes?` |
| Placement status | `Choose a position for B on the highlighted plane, or use the direction buttons.` |
| Probe meaning | `Moving B changes where we measure. Model time stays at 0 s.` |
| Area meaning | `The highlighted area limits where you can place B. It is not the edge of the model.` |
| Height | `B stays 1000 m above model ground.` |
| Out of area | `Choose a point inside the highlighted comparison area.` |
| Invalid intersection | `That view does not give a usable point on the plane. Change the view or use the direction buttons.` |
| Placement committed | `B position updated.` |
| Boundary | `B has reached the edge of the comparison area.` |
| Unavailable | `Velocity could not be measured at this point.` |

Keep Speed/Vertical primary, horizontal components in native disclosure, sign/unit
help and the existing scientific footer. No target zone, sign-change coordinate,
success animation, required discovery or numerical inference of convergence.

## 5. Pointer, touch and numerical placement policy

At mode transition, the scene sets its own OrbitControls enabled state and
touch-action policy before the next pointerdown. Do not connect/disconnect or
dispose controls to toggle modes. Inspect restores the prior camera/touch policy;
other scenes retain their defaults. No placement accepts a pointerdown from an
earlier mode/renderer generation. Do not interfere with OrbitControls releasing
its own existing capture/listeners at pointerup.

Place B candidate lifecycle:

1. Accept only one primary pointer and primary button; record pointer id,
   start client position, maximum excursion and current mode/renderer epoch.
2. Pointer movement never moves B. Reuse the existing 5 CSS px stationary-click
   threshold as a candidate policy; track maximum excursion even if the pointer
   returns to its start. Exceeding it cancels that candidate permanently.
3. Scroll (including page/ancestor scroll), wheel gesture, pointercancel,
   second pointer/multitouch, blur, pointer leaving the canvas, mode exit, reset,
   context loss or unmount cancels it. A subsequent synthetic click cannot commit
   an already cancelled pointer gesture. Use one commit path, not pointerup plus
   a separate click handler.
4. A matching stationary pointerup inside canvas in the same generation may
   commit; clear candidate before callbacks. No application pointer capture is
   needed for click placement; release outside never places. Observe cancellation
   with owned stable listeners rather than taking capture from OrbitControls.
5. Use the current canvas CSS rect, current camera ray and exact y=1000 plane at
   commit. Reject zero-size rect and pointer outside the canvas. Resize while a
   candidate is pending cancels it. Do not use device-pixel buffer dimensions.

Human-reviewed Place B implementation candidate: `pan-y pinch-zoom`, with OrbitControls input disabled.
Vertical page scroll is allowed; browser cancellation and explicit scroll/multitouch
tracking prevent accidental placement. Native pinch, if supported, never counts
as a tap. Inspect restores the camera's original touch policy. The exact policy
and gesture threshold remain candidates requiring mobile UX verification;
desktop mouse emulation is not physical-device proof.

Intersection: normalize a finite nonzero direction D, then compute
`lambda=(1000−O.y)/D.y`, `P=O+lambda*D`, and explicitly set P.y=1000. Reject
nonfinite results, lambda<0 and nearly parallel rays. Coplanar parallel rays have
no unique placement. The accepted preliminary dimensionless numerical UI cutoff
is `abs(D.y)<=1e-8`, including equality in rejection. Verify values on both sides
of the cutoff as well as exactly parallel, nonfinite and backward rays.
Use direct intersection, not ground picking followed by lifting.

Numerical boundary policy: apply strict closed-interval comparisons to the finite
computed X/Z, including exact edges and corners. Any computed value below a minimum
or above a maximum is invalid, even a tiny floating-point overshoot. Do not add
an epsilon acceptance band, clamp external values or round valid interior values.
Display rounding never determines validity or button availability. Test exact
edges and perturbations on both sides (e.g. 1e-6 m offsets are test inputs, not an
acceptance tolerance). A mathematically edge-aligned ray can be rejected if its
computed value overshoots through roundoff; assess this UX risk later and request
review before introducing any tolerance-based boundary reconciliation. The
near-parallel ray cutoff remains a preliminary numerical UI choice, not a physical
constant. This strict boundary definition preserves the accepted no-external-clamp
constraint; only relative button steps use boundary clipping as specified below.

## 6. Relative buttons, availability and accessibility

Provide four native buttons grouped as B position controls: `Move B east`,
`Move B west`, `Move B north`, `Move B south`, with visible 100 m step help and
signed current East/North positions. Tab plus Enter/Space is sufficient; no global
arrow-key interception or exact numeric entry. Buttons remain usable in Inspect
and without WebGL. World updates: east x+100, west x−100, north z−100, south z+100.

Keyboard/button displacement clamps only the requested axis to the closed UI
interval, so the final step can be shorter than 100 m. The other axis and fractional
part are preserved; do not round click positions onto a 100 m grid. This differs
deliberately from pointer placement, where external points are rejected. At an
edge the outward action is unavailable and never samples. Accepted focus policy:
`aria-disabled=true` with guarded no-op on the outward button retains keyboard
focus after the last step. Announce reaching the boundary once; repeated guarded
no-ops, key autorepeat and rerenders must not repeat a noisy live announcement.
Movement away from the edge reenables that direction; a later return can announce
the boundary again. Do not substitute native disabled behavior without separate
focus-policy review.

Maintain three distinct outcomes:

- Invalid placement: reject the action without publishing a new position/snapshot.
- Valid position with unavailable velocity: publish that position and unavailable
  values, hide B arrow, update marker/guide/ring, keep A; later valid sampling can recover.
- Valid zero: w=0 with nonzero speed retains its horizontal arrow; full V=0 is
  available with Speed=0 and no direction/nonzero arrow. Never substitute failure
  with zeros or show an old arrow as current. Tiny signed components must not be
  presented as an exact zero solely through display rounding.

Use polite concise status messages, not live inspector output each frame; use
native details and visible focus. Do not force focus to canvas after placement.
Escape applies only to the active lesson's Place B and must not override a help
modal's Escape behavior. No color-only mode/boundary/sign distinction.

Mobile layout: scene, reachable Move B / Done / Reset controls, direction buttons,
then readable A/B cards with Speed/Vertical visible. Keep controls in normal page
flow, tap targets at least 44 CSS px, no hover dependency or horizontal overflow.
Entering Place B does not scroll-jump the page or require a drag. Preserve vertical
scroll outside and through the placement scene under the chosen touch policy.

## 7. Scene ownership, geometry and camera candidate

The stable session owns field/observations; React owns snapshots and interaction
state; viewport owns one RAF, ResizeObserver and its stable gesture/context/scroll
listeners. Update effects sync B revision into the existing scene; refs expose
latest values without recreating listeners. Renderer lifetime depends only on
mount/retry, not B position or mode. Do not allocate a new arrow/guide per move.

TracerScene remains sole owner of renderer, OrbitControls, both pair arrows,
annotations and optional placement-plane geometry/materials. The plane lies at
y=1000 within the UI rectangle, is double-sided, neutral and low-opacity, with
depthWrite=false and non-pickable presentation geometry; analytical intersection
does the picking. It is hidden outside Place B and disposed exactly once by its
owner. Exact opacity/outline styling is a visual-review candidate, not airflow data.
After later authorization, check transparency sorting, depthTest/depthWrite and
render order across orbit/zoom and both visible faces, including overlapping
arrows, probes and height guides. No opaque plane, misleading scientific boundary
or styling that hides vector direction may be accepted just because tests pass.

Move B's label, height guide and ground ring together in place; recompute line
distances after guide endpoint edits. A remains fixed. Make current-probe guide
behavior opt-in so Follow Motion's start-height references stay fixed. Do not
leave old rings, labels or segments behind. Preserve Slice 3's independent
`syncVelocityArrow` behavior and allocation/disposal path.

Teardown first invalidates mode/renderer epoch and pending gestures, then cancels
RAF, disconnects observer, removes owned listeners and calls scene.dispose once.
No second renderer/controls cleanup owner. Initialization failure unwinds created
resources; StrictMode remounts are safe. Retry uses latest B even if it changed via
buttons while WebGL was down. Stale callbacks after reset, help or retry cannot
commit a point or schedule another loop.

Candidate home framing: retain the accepted oblique direction (1,0.8,0.25) normalized,
fit A, its ground reference, all corners of the B rectangle and a fixed display
margin for arrows/labels. Initial candidate margin: 2500 display metres around the
region/probe bounds, including vertical room below ground. This is a provisional
camera budget, not a computed upper bound on Demo speeds or proof of coverage.
No field sampling or visual evaluation of this candidate is performed here.

The Stage 2 camera candidate must remain stable as B changes: no chase, per-step
zoom or growing history of visited bounds. Reset View restores the reviewed
whole-area home; resize refits aspect while respecting the existing orbit policy.
Full actual arrow tips at representative/edge placements must be checked later.
If a stable full-area view cannot keep scale-80 arrows readable, stop for human
camera/area review rather than silently changing scale, clipping to ground or
normalizing lengths. Arbitrary user orbit/strong zoom retains the documented
perspective/cropping limitation and camera-only recovery through Reset View.

## 8. Future verification matrix and acceptance

No checks below are executed or authorized by writing this plan.

| Area | Required future verification |
| --- | --- |
| Invariants | One shared composition per retained session, no recomposition on B/mode updates, original A identity retained, t=0, exact component signs and no extra C subtraction; Simulation/integrator/history guards; no sampling in render/camera/hover |
| Atomic B | Marker/card/arrow/guide share one revision; latest state under rapid actions; immutable snapshots; no resampling on no-op/reset/help; no renderer recreation on B update |
| Ray / rectangle | CSS rect and DPR/resize cases; y=1000 exact; zero/nonfinite/parallel/near-parallel/backward/coplanar cases; exact edges/corners and tiny interior/exterior perturbations; all external computed points rejected without epsilon band, clamp or snapping |
| Relative buttons | Four directions, North=-Z, fractional positions preserved, 100 m steps, shorter final step, outward action unavailable; keyboard focus/status; buttons usable outside Place B and without WebGL |
| Boundary accessibility | Focus retained on aria-disabled buttons; guarded no-op; repeated presses/autorepeat/rerenders do not cause repeated live announcements; moving away reenables action |
| Placement plane | Visible only in Place B, transparency/depth/order correct across angles; arrows/probes/guides remain readable; analytical picking unaffected by display geometry; scene-owned disposal |
| Gesture lifecycle | Click vs drag/max excursion, mismatched pointer id, release outside, scroll/wheel, pointercancel, multitouch, blur, reset/help/resize/mode change; no ghost synthetic click or old-generation commit |
| Camera coexistence | Controls/touch policy set before gesture, restored on exit; no reconnect/dispose on mode toggle; reset never rearms a cancelled pointer; help modal focus restored correctly |
| Availability | Invalid vs unavailable vs zero; w=0 at nonzero speed; full zero vector; NaN/Infinity/throws; no stale arrow/guide/card and recovery at later valid point |
| Ownership / regression | One RAF/observer/listener set, StrictMode and context loss/retry, init failure, rapid lesson switches and stale callbacks; all owned plane/arrow/guide resources disposed once; Slice 1–3 and single-arrow regressions |
| Frontend checks | Relevant Learn/placement/rendering/navigation tests, full typecheck and production build; report retained bundle warning rather than treating it as scientific failure |

Real-WebGL checks after separate authorization: desktop 1440×1000 and responsive
390×844 / 320×844 CSS px; initial and reviewed edge/interior placements, direct
touch/click and keyboard alternative, orbit/zoom then placement, camera-only reset,
probe-only reset, help, resize, no overflow and readable cards/complete arrows.
Explicitly include clicks directly at edges and corners and immediately on both
sides. If strict-boundary numerical rejection gives unsatisfactory UX, stop for
separate review rather than adding epsilon-clamp or changing the policy silently.
Any developer spot observations must stay within the eventual authorization;
this plan does not permit a grid campaign, new baseline or scientific evidence run.

Physical-mobile testing of page scroll, tap cancellation and multitouch is a
mandatory item when a device is available during later authorized verification.
If unavailable, report NOT VERIFIED rather than equating viewport
emulation with touch-device validation. Context-loss mocks do not prove forced
real-GPU loss recovery; long-duration GPU/heap profiling remains separate. Preserve
Stage 1's retained limitations unless new authorized checks specifically resolve them.

Human technical/visual acceptance is separate from test PASS and implementation
authorization. Review stable framing and region subtlety, placement/camera clarity,
touch behavior, keyboard focus and whether free exploration reveals changing
measurements without hinting at a special location. Finding a zero crossing is
not required for success. No scientific qualification or later-stage permission.

## 9. Open questions, provisional choices and stop conditions

Accepted by the owner: modes, four 100 m relative buttons with shorter boundary
step, no forced coordinate rounding, page scroll/cancellation, secondary plane,
direct y=1000 picking, one field/t=0/A preservation/atomic B, scale 80, independent
resets and availability distinctions. Do not reopen these as implicit options.

The plan-review Decision disposes the former threshold, touch-candidate and
aria-disabled questions as recorded above. Remaining verification dispositions:

- Ray cutoff is a preliminary UI policy; strict edge-roundoff rejection still
  requires edge/corner UX review before any proposed numerical-policy change.
- Touch candidates need physical-mobile verification when possible, otherwise
  NOT VERIFIED; plan approval does not establish successful touch behavior.
- The 2500 m camera margin and exact plane opacity/outline remain provisional;
  whole-area scale-80 framing and depth/order readability need real-WebGL review.
- Detailed user copy and eventual implementation remain subject to technical /
  visual acceptance; no source implementation is accepted by this plan review.

The separate implementation Decision opens the bounded coding/developer-check gate
only. During authorized work, stop for a
new decision if correct behavior requires altered physics/frame/time/scale,
scientific scope expansion or a different accepted interaction boundary. Report
`SPECIFICATION CHANGE REQUIRED` if scientific semantics exceed parent authority. Do not
silently enlarge scope, introduce trajectory history to solve framing, or call
unverified camera/touch choices accepted. Stop again before human acceptance.
