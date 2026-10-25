# Learn Slice 4 — Stage 1 Implementation Plan: Static Compare

## Status

| Field | Value |
| --- | --- |
| Document type | DESIGN |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Bounded Stage 1 implementation and developer-verification constraints; action permission is external in the implementation Decision |
| Parent authority | [Stage 1 approval and implementation Decision](../2026-10-25-learn-slice-4-stage-1-implementation-decision.md), [Human-review Decision](../2026-10-25-learn-slice-4-human-review-decision.md), [accepted architectural Design](2026-10-25-learn-slice-4-compare-the-flow-design.md) and its inherited contracts |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## 1. Stage boundary and stop gate

Stage 1 presents two fixed probes sampling one unchanged stationary Demo field
at t=0. A=(0,1000,4000) m; B=(2400,1000,0) m. They are probes, not air particles.
Show two independent true 3D velocity arrows at the same scale; show Speed and
Vertical for A/B simultaneously and Eastward/Northward in a disclosure. Include
camera orbit/zoom, Reset View, independent lesson entry and accessible explanations.

INTRODUCED: static presentation of existing local velocity only.
NOT INTRODUCED: scientific/model semantics, new fields, C adjustments, Simulation,
integrators, stepping, trajectories, history, playback or time evolution.
NOT CLAIMED: forces, convergence, vorticity, realistic storm dynamics, scientific
qualification or acceptance of an implementation that does not yet exist.

**Excluded Stage 2:** no Move B, picking/raycast placement, touch placement,
coordinate inputs, keyboard coordinate stepping, interaction rectangle, Reset
probes, placement rejection messages or discovery task. Do not expose disabled
placeholders or prompts suggesting these features exist. No marker-follow camera.
Stage 2 requires separate authorization even after Stage 1 acceptance.

**STOP GATE disposition — 2026-10-25:** the owner's separate [implementation
Decision](../2026-10-25-learn-slice-4-stage-1-implementation-decision.md) approves this
plan and authorizes only Stage 1 and its bounded developer verification. Its
additional WebGL-independent measurement and resource-ownership constraints apply.
Plan approval alone does not grant permission. After implementation, stop for human
technical/visual acceptance; do not proceed automatically to Stage 2. The future-
check wording below defines the verification contract, not completed results.

## 2. Proposed Stage 1 UX and copy

Direct entry creates the initial static session; no Start action. Keep the shared
Learn top bar/footer and freely selectable lessons. Add `04 Compare the Flow`
only with a working implemented lesson. Same-lesson selection preserves state;
exit disposes resources; re-entry creates fresh fixed snapshots. No local loss-of-
trajectory warning is needed; preserve existing departure guards when leaving
other lessons to enter this one.

Proposed exact Stage 1 copy:

| Element | Text |
| --- | --- |
| Heading | `Compare the Flow` |
| Question | `Does the airflow move the same way everywhere?` |
| Introduction | `A and B are probes held at two different places, not particles carried by the air.` |
| Context | `Both probes sample the same model field at 0 s and a height of 1000 m.` |
| Arrow help | `Each arrow shows the local 3D velocity. Both arrows use the same length scale: a longer arrow means a greater speed.` |
| Compare prompt | `Compare Speed and Vertical at A and B. What differs?` |
| Scientific explanation | `Different readings at different places show spatial variation in this prescribed field. The field is not changing with time.` |
| Sign help | `Velocities are in m/s. Positive vertical velocity is upward; negative is downward.` |
| Camera help | `Drag to look around; scroll to zoom. Reset View returns to the starting view.` |
| Labels | `Probe A`, `Probe B`, `Speed`, `Vertical`, `Eastward`, `Northward`, `Show horizontal components`, `Reset View` |
| Scientific boundary | `These are local velocities in a prescribed model field. They do not by themselves establish forces, vorticity, convergence or the dynamics of a real storm.` |

Retain the existing About this model disclosure. No sign-change target, location
hint, completion badge or mandatory answer. Exact copy remains proposed; use
existing component-disclosure and number-formatting conventions, not a new framework.
Reset View changes only the camera; neither samples nor arrow scale change.

On desktop place cards beside a substantial scene. At 390/320 CSS px stack scene
and A/B cards, with Speed/Vertical visible without opening details. Keep labels,
signed units and values readable with no horizontal overflow. Use native controls,
visible focus, semantic A/B groups and native details. All measurements and help
must be usable without canvas interaction. No color-only identity and no live-region
announcements on render frames. Camera movement is optional for understanding.

## 3. Proposed files and minimal APIs

Paths below are planned changes, not files created by this documentation task.
Keep source changes within Learn, its explicit scene extension and scoped tests.

| Proposed file | Minimal responsibility/API |
| --- | --- |
| `src/app/learn/createCompareFlowSession.ts` | `createCompareFlowSession()` composes fields once and obtains same-instance velocityObservation; exposes readonly A/B snapshots and one common display scale. No clock, advance, reset, placement or history API |
| `src/app/learn/CompareFlowMeasurement.ts` | Point-specific tagged available/unavailable DTO and sampling adapter around inspectWorldPoint(P,0); copies P,V; converts atmospheric components; no fictitious particle age/history exposed |
| `src/app/learn/LearnCompareFlow.tsx` | Static lesson copy, grouped A/B cards, native horizontal-components disclosure; owns static session across rerenders |
| `src/app/learn/CompareFlowViewport.tsx` | Two presentation marker slots, two arrows, stable initial camera, Reset View, resize and render lifecycle; follows LearnOrientationViewport pattern, not TracerViewport's stepping runtime |
| `src/app/learn/compareFlowView.ts` | Stage 1 camera preset/framing of both fixed points and full arrow tips; no full Stage 2 rectangle requirement |
| `src/rendering/TracerScene.ts` | Add an opt-in, separately stored pair-arrow interface, retaining existing single-arrow behavior |
| `src/app/learn/LearnPage.tsx`, `LearnLessonNavigation.tsx`, scoped `learn.css` | Register working lesson, retain shared navigation/help/departure behavior, minimal responsive layout |
| Corresponding Learn/session/measurement/viewport tests; scene/arrow and shared-navigation tests | Matrix in §6; existing test naming/style conventions |

Preferred scene API proposal: `syncComparisonVelocityArrows({ a, b })`, each entry
`VelocityArrowObservation | null`. Keys A/B are stable; null hides only that arrow.
Store these arrows separately from the existing private single `velocityArrow`.
Create them lazily; no allocations each frame. Reuse createVelocityArrow rather
than copying geometry or physics. This narrow pair API avoids a general overlay
framework; its exact name can change without expanding scope.

Do not alter `syncVelocityArrow(sample)` semantics or make it delegate to an
incompatible shared selection. Slice 3 remains on its current API, ownership,
scale and rendering path. Generic arrow support must be opt-in and absent from
existing lessons until used. Do not use T1 or misuse attachVisualAirflow ownership.

Reuse composition, observation, AtmosphericVelocity conversion and existing number
formatting where suitable. ReadMotionInspection/RecordedMotion are history-bound:
do not manufacture a history index or import Reference/Current state. Prefer a small
local static card over a broad Slice 3 refactor for this stage. No changes to Demo,
Simulation, datasets, frame definitions or scientific contracts are planned.

## 4. Sampling and checkable invariants

Create exactly one `composeDemoTracerFields(StormRelativeLaboratory)` result and
`demoInspectableVelocityOperands` for those instances. Do not use the convenience
factory that creates Simulation. Call inspectWorldPoint with each exact P and t=0;
adapt its tracer-oriented metadata locally and pass only the required total field.
Both UI and arrow consume the same immutable per-probe measured snapshot. Render,
resize, camera reset, help or details changes do not resample.

World position metres: X east, Y up, Z south. Eastward=vx, Northward=−vz,
Vertical=vy in m/s. Speed=hypot(vx,vy,vz). Storm-relative C has already been applied
at composition; no extra subtraction, coordinate rotation or frame mixing.
Scale is common and constant for a session; arrow tip=P+scale*V, true 3D direction.
No screen tangent, finite difference, extrapolation or equal-length normalization.
The preliminary 40 scale is not a scientific parameter and does not alter V.

Check finite position/time, components and speed; catch sample failures. Use
`Unavailable` and `Velocity could not be measured at this point.` for the affected
card and hide its arrow; preserve the valid other probe. Never use zeros/stale
vectors as failure substitutes. Genuine zero speed is available with no direction
and no nonzero arrow. No new domain/clamping policy is introduced.

Previously audited rounded context (not a new baseline or acceptance tolerance):
A Speed≈19.30, Vertical≈+6.86; B Speed≈21.13, Vertical≈+1.93 m/s. Tests should verify
sample identity and component algebra against the current unchanged composition,
not establish scientific qualification from these rounded numbers.

## 5. Resource ownership and failure behavior

- Lesson owns the static session; no global cache, simulation timer or subscriptions.
- Viewport owns one TracerScene, one RAF, one ResizeObserver, stable context/failure
  handlers and refs. RAF renders camera controls only; it never advances model time.
- TracerScene exclusively owns both comparison arrows, their geometry/materials,
  two marker slots, annotations, OrbitControls and renderer. It removes/disposes
  all comparison resources once on teardown, independently of the single arrow.
- Unmount invalidates callbacks, cancels RAF, disconnects observer, removes listeners
  and disposes scene. Partial initialization unwinds only created resources; cleanup
  is safe if invoked again. StrictMode must not leave a second scene or loop.
- Help preserves snapshots and returns focus; closing it neither resets camera nor
  creates another loop. No placement listeners or pointer capture exist in Stage 1.
- Context loss stops the active render loop; teardown/recovery must remove prior
  handlers and controls before recreating a renderer. Keep measurements available
  independently of WebGL. Initialization failure gives an accessible inline
  `The 3D view is unavailable. You can still compare the measurements below.`
  Any retry reuses static snapshots and does not resample or leak old resources.

## 6. Future verification matrix and technical acceptance

These checks are planned, not executed or authorized by this document.

| Area | Required checks after explicit authorization |
| --- | --- |
| Composition / no evolution | Same total-field instance for both observations; exact starting P,t,frame; guard Simulation construction/step/integrator/history paths; no calls from render/reset/help; no wall-clock model time |
| Components / availability | Correct vx/−vz/vy, hypot and one C application; independent A/B snapshots; finite/throw/NaN/Infinity cases; unavailable distinct from real zero |
| Pair arrows | Two independent objects, shared fixed scale, tip/direction/length correctness; hiding A leaves B; updates do not overwrite the other arrow; no per-frame allocations; dispose once |
| Slice 3 protection | Existing single-arrow sync/hide/disposal tests pass unchanged; comparison API unused creates no pair resources; pair and single lifecycles do not mutate each other |
| Static UI | Both cards/units/details; no movement/playback/history controls or misleading prompts; native keyboard access and focus; camera-only Reset View; unavailable fallback |
| Lifecycle | StrictMode, rerender, resize, help, rapid lesson switches, unmount, initialization failure and context loss; one live RAF/observer/listener set; stale callbacks inert |
| Navigation regression | Look Around, Follow Motion, Read the Motion preserved; cancel departure retains source session, confirm cleans it; returning creates clean static state; same-lesson selection does not reset |
| Frontend checks | Relevant session/rendering/Learn/navigation regressions, `npm run typecheck`, `npm run build`; retain/report bundle warning if present |

Real-WebGL review must cover desktop (e.g. 1440 px), 390 and 320 CSS px mobile:
both full arrows/labels readable at entry and after Reset View/resize; no clipping
by panels, footer or near/far planes; no horizontal overflow; camera orbit/zoom
and touch camera operation; A/B component disclosure; keyboard-only text/control
access; help and departure cancellation; repeat mount/unmount and console errors.
Frame only the two fixed points and full tips with margin; no camera chasing or
per-arrow rescaling. Extreme user orbit may foreshorten vectors; numeric measures
remain visible and Reset View restores the reviewed view.

Technical acceptance requires passing relevant tests/typecheck/build, confirmed
invariants and cleanup, and a human review of real-WebGL readability at the common
provisional scale. If WebGL is unavailable, mark visual verification NOT VERIFIED,
do not claim full visual acceptance. Mocked lifecycle checks are not long-duration
GPU/heap profiling; report that limitation explicitly. No qualification campaigns,
physics baselines or scientific classification. Stage 1 does not require Stage 2
movement/discoverability tests. Record results only within later authorized scope.

## 7. Preliminary choices and owner dispositions

- Scale 40 remains provisional pending visual review; any alternative must remain
  common/linear and must not change Demo. Do not report the visual choice accepted
  merely because tests pass.
- Camera preset, spacing and exact Stage 1 English copy need visual/content review.
- The pair-arrow API above is the recommended minimal implementation proposal,
  not an already approved code change or an existing API.
- Stage 2 rectangle, OrbitControls suspension and 100 m keyboard step remain
  preliminary; numeric entry is not required. None is implemented in Stage 1.
- Vertical-zero crossing is optional, never a completion gate; Stage 1 contains no
  task or hint to seek its location.

The owner's [Stage 1 Decision](../2026-10-25-learn-slice-4-stage-1-implementation-decision.md)
has approved the plan and separately authorized its bounded implementation and
developer verification. Final scale/camera/readability disposition remains for
human technical/visual acceptance. Stage 2 remains a separate future decision;
no Stage 1 result automatically opens that gate.
