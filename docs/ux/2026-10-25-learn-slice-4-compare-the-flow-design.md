# Learn Slice 4 — Compare the Flow

## Status

| Field | Value |
| --- | --- |
| Document type | DESIGN |
| Approval state | APPROVED as architectural basis with the bounded human-review refinements below; preliminary choices remain provisional |
| Authority status | ACTIVE for architectural constraints only; no implementation authorization |
| Freeze mode | MUTABLE |
| Authority scope | Bounded Learn presentation and static point-observation architecture, split into independently authorizable stages; no scientific authority |
| Parent authority | [Human-review Decision](../2026-10-25-learn-slice-4-human-review-decision.md); initial [documentation-only Decision](../2026-10-25-learn-slice-4-design-documentation-decision.md); inherited contracts in §3 |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## 1. Purpose, accepted constraints and review boundary

The primary learning goal is to recognize that local velocity depends on spatial
position in one stationary prescribed Demo field at one model time. Passing through
zero vertical velocity while total speed remains nonzero is an optional discovery,
not a required destination, test or completion gate.

The owner accepted this Design as an architectural basis with refinements in the
[human-review Decision](../2026-10-25-learn-slice-4-human-review-decision.md).
That bounded acceptance does not authorize implementation or finally approve
preliminary scale, camera or interaction choices. This document is not a new
scientific source of truth and does not supersede existing lessons or contracts.

### Human-review disposition and stage applicability — 2026-10-25

The following stage boundary controls the full-lesson material in §§2–9. Those
sections describe the combined lesson; their movement, placement, invalid-ray,
coordinate-input, Reset probes and discoverability provisions apply only to
Stage 2. Stage 1 must not ship their controls, learner prompts or placeholders.

| Stage | Accepted boundary | Authorization |
| --- | --- | --- |
| 1 — Static Compare | One unchanged Demo composition in StormRelativeLaboratory at t=0; fixed A=(0,1000,4000), B=(2400,1000,0); two independent true 3D arrows on one scale; simultaneous Speed/Vertical and disclosed Eastward/Northward; static viewport, camera, Reset View and accessible explanations | [Plan](2026-10-25-learn-slice-4-stage-1-implementation-plan.md) approved and implementation/developer verification separately authorized by the [Stage 1 Decision](../2026-10-25-learn-slice-4-stage-1-implementation-decision.md); human acceptance remains separate |
| 2 — Explore the Field | Move B by click/touch at y=1000, keyboard alternative, provisional rectangle, Reset probes, invalid-placement handling and camera/mobile/discoverability checks | Independently gated; NOT authorized by Stage 1 approval or completion |

Both stages exclude Simulation, integration, trajectories, history and field-time
evolution. Arrow scale 40 remains preliminary pending visual verification.
Disabling OrbitControls in Move B remains preliminary pending UX verification.
Keyboard step 100 m is provisionally accepted for Stage 2; exact numeric input
is not required. A vertical-zero discovery remains optional and is never a
completion gate. The rectangle remains preliminary, not a model boundary.
Stage 1-specific copy and acceptance scope are in its proposed plan; detailed
English copy and camera presets still require implementation-stage human review.

Accepted pedagogical constraints:

- A starts at world `(0,1000,4000)` m; B starts at `(2400,1000,0)` m, the familiar
  Follow Motion B2 location. Display the probe as B, not as an advected B2 tracer.
- Both are stationary probes. A remains fixed; user placement changes B's sampling
  location at fixed height 1000 m, without advecting either probe.
- One unchanged Demo composition, explicit `StormRelativeLaboratory`, fixed `t=0`.
- Two independent 3D arrows with a shared linear scale; Speed and Vertical remain
  visible for A/B. Eastward and Northward may use a disclosure for readability.
- Prefer explicit Move B placement by click, with a keyboard alternative.
- No Simulation, stepping, integrator, trajectory history or field-time evolution.
- Do not disclose the sign-change location or require finding it.

**Preliminary decisions, subject to review and later visual verification:** B's
interaction rectangle is `x=1500…5500 m`, `z=−1000…1000 m`, `y=1000 m`; arrow scale
is 40 display metres per m/s. This is a UI exploration area, not a model-domain
claim. Other detailed interaction, camera and responsive choices below are
proposals; none grants implementation permission.

## 2. Teaching sequence and proposed exact English copy

The lesson is independently understandable; prior lessons are optional. A future
working lesson may join the shared navigation as `04 Compare the Flow`. Do not
add a placeholder route or navigation entry during documentation work.

On entry, show both probes, measurements and arrows immediately. There is no Start
flight, playback control, countdown, timeline or completion state.

| Surface | Proposed text |
| --- | --- |
| Lesson title | `Compare the Flow` |
| Main question | `Does the airflow move the same way everywhere?` |
| Introduction | `A and B begin at the familiar positions from Follow Motion. Here they are probes held in place, not particles carried by the air.` |
| Shared context | `Both probes sample the same model field at 0 s and a height of 1000 m.` |
| Arrow explanation | `Each arrow shows the local 3D velocity. Both arrows use the same length scale: a longer arrow means a greater speed.` |
| Exploration prompt | `Move B around the plane. What changes?` |
| Probe clarification | `Moving B changes where we measure. It does not move air or advance model time.` |
| Stationary-field explanation | `Different readings at different places show spatial variation in this prescribed field. The field is not changing with time.` |
| Measurement labels | `Probe A`, `Probe B`, `Speed`, `Vertical`, `Eastward`, `Northward` |
| Units / sign help | `Velocities are in m/s. Positive vertical velocity is upward; negative is downward.` |
| Component disclosure | `Show horizontal components` |
| Optional interpretation, always available in Details | `A vertical reading of zero means no upward or downward component at that point. Horizontal motion can still give a nonzero speed.` |
| Scientific boundary | `These are local velocities in a prescribed model field. They do not by themselves establish forces, vorticity, convergence or the dynamics of a real storm.` |

Retain the shared in-flow About this model footer and its existing reconstruction /
forecast limitation. Do not mark a target area, hint at a direction to reach a sign
change, display a success badge, or automatically open the optional explanation
when a sign change occurs. Show signs and units consistently; rounding is display
only and must not turn a tiny signed measurement into a claimed exact zero.

## 3. Scientific and coordinate invariants

Inherited authorities: [velocity-field basics](../physics/02-velocity-field-basics.md),
[composite velocity](../physics/12-composite-velocity-field.md) and
[3D frame semantics](../architecture/03-wind-tunnel-storm-relative-3d-semantics.md).
This proposal only observes the existing composition under those contracts.

### INTRODUCED

Presentation of simultaneous local samples at two user-visible spatial points;
no new scientific/model semantics. Proposed static probe state and UI only.

### NOT INTRODUCED

New physics, data, seeds for integration, integrators, trajectories, numerical
time evolution, diagnostics, continuity enforcement, force inference, model-domain
extension, qualification or subsequent Learn stages. No T1 glyph or T1 scaling.

### NOT CLAIMED

Scientific qualification, observational validation, historical reconstruction,
forecast, causal mechanism attribution or complete storm dynamics. A difference
of local vectors is not a measured force, convergence or vorticity diagnostic.

World metres: +X east, +Y up, +Z south. Atmospheric components are eastward=vx,
northward=−vz, vertical=vy, in m/s, through the existing
[conversion](../../src/core/math/AtmosphericVelocity.ts). Input labelled Northward
position must convert `z=−northward`, rather than reuse the velocity conversion
as a position API. Both samples use exactly the same fixed time and field instance.
The composition already accounts for prescribed C in StormRelativeLaboratory;
neither inspector nor renderer subtracts C again. No wall-clock time enters samples.

For each valid sample, speed is `hypot(vx,vy,vz)` and arrow tip is `P + scale*V`.
Normalization is allowed only to orient geometry, never to equalize arrow length.
Arrow and card consume the same measured snapshot. No finite differences,
screen-space tangents, time extrapolation or independently reconstructed physics.

## 4. Interface states, placement and camera

Proposed states:

| State | Interaction / output |
| --- | --- |
| Inspect | Initial A/B samples visible; camera orbit/zoom available; button `Move B` |
| Place B | Move B button has `aria-pressed=true`; status `Choose a position for B on the highlighted plane, or use the coordinate controls.`; primary click/tap places B; camera orbit gestures suspended; `Done moving B` or Escape returns to Inspect |
| Rejected placement | Keep prior position and measurements; announce the relevant reason; remain in Place B |
| Measurement unavailable | Position remains identified; unavailable card and hidden arrow only for the affected probe; controls remain usable |
| View unavailable | Inline `The 3D view is unavailable. You can still compare measurements using the coordinate controls.`; no fabricated view or measurement; proposed `Retry 3D view` preserves coordinates |

Place B is persistent so users can compare several locations without repeatedly
arming it. Normal hover changes no sample. Valid click/tap updates B atomically;
A's measured values remain unchanged. Show `B position updated.` in a polite
status region. No animated travel between placements and no trail.

Use existing client-rectangle → NDC → world-ray helpers. Intersect the actual plane
`y=1000`, not the ground followed by a height offset. Reject nonfinite, backward,
parallel or nearly parallel intersections before region checks. The numerical
near-parallel threshold is an implementation detail requiring focused tests, not
a new physics tolerance. No snapping an invalid ray to a boundary.

Reject outside-rectangle placement without silently clamping it. Text:
`Choose a point inside the highlighted comparison area.` Invalid ray text:
`That view does not give a usable point on the plane. Change the view or use the coordinate controls.`
The last valid sample survives rejection. An optional plane target outline must
depict only a prospective valid location, never an interpolated velocity.

Proposed camera behavior: one stable oblique initial view containing A, the full
B rectangle and complete arrows with margin. Use the established coordinate
reference, neutral bounded plane outline and unambiguous A/B labels. No automatic
chasing of B, camera tween on placement, or per-arrow scale adjustment. Reset View
changes only the camera. `Reset probes` restores initial A/B positions and samples,
leaving camera unchanged and ending Place B. Selecting the same lesson preserves
state; leaving/unmounting disposes it; re-entry begins at the initial positions.
No trajectory-loss warning is warranted inside this static lesson. Existing
warnings when leaving other lessons must remain effective.

Preliminary framing basis, not a coverage proof: A↔B is about 4.665 km; A to
`(5000,1000,0)` is about 6.403 km. At scale 40, previously sampled arrow lengths
were about 772–1006 m; the latter point's arrow tip was about 497 m above ground.
Fit full tails and tips, not just probe positions. Full-rectangle camera coverage,
occlusion and mobile readability require later authorized visual verification.
If a full view makes arrows too small, review framing/area before changing the
common scale; do not normalize each arrow. User orbit can foreshorten vectors,
so numerical Speed remains visible. No camera-facing replacement for the 3D arrow.

## 5. Static session and reuse boundaries

Proposed modules/names below are conceptual, not existing implementations.

`CompareFlowSession` owns one `composeDemoTracerFields(StormRelativeLaboratory)`
result and `demoInspectableVelocityOperands` of those same instances from
[Demo composition](../../src/app/composeDemoTracerSimulation.ts). It does not call
the factory that constructs a Simulation. It holds A/B positions, fixed time zero
and immutable per-probe measurement snapshots. Initial entry, valid B placement
and Reset probes are the only measurement triggers; rendering does not resample.

Use [inspectWorldPoint](../../src/interaction/TracerInspection.ts), adapting its
tracer metadata to a small point-measurement DTO rather than inventing particle
age or history. Pass the existing total observation; field-contribution displays
are outside scope. A measurement is tagged available/unavailable. Consumers must
not mutate its copied position/vector. B changes do not mutate A's snapshot.

`CompareFlowViewport` follows the static lifecycle of
[LearnOrientationViewport](../../src/app/learn/LearnOrientationViewport.tsx), not
TracerViewport's fixed-step runtime. Reuse [TracerScene](../../src/rendering/TracerScene.ts)
for two presentation marker slots with trails off and no history. Any required
`TracerAdvectionState` objects are rendering adapters only, not simulated particles.

Reuse [velocityArrow](../../src/rendering/velocityArrow.ts) twice. TracerScene's
current single `syncVelocityArrow` cannot manage both. Preferred proposed extension:
an opt-in multiple-arrow interface with explicit scene ownership, retaining the
existing single-arrow API for Slice 3. Alternative caller-owned group attachment
must explicitly dispose both arrows; `attachVisualAirflow` only attaches/detaches
and its workbench-specific purpose makes it a less suitable default.

Reuse existing Learn styling, cards, details and measurement formatting patterns.
The [Slice 3 investigation](../../src/app/learn/ReadMotionInvestigation.tsx) and
[inspection controller](../../src/app/learn/ReadMotionInspection.ts) are history-bound;
do not import timeline, Reference/Current or save-comparison state. A later small
generic measurement-card extraction is preferable to a fake recorded moment.
Any extraction must preserve Slice 3 behavior and be separately implemented only
after authorization. No new UI framework, general lesson engine or persistence.

## 6. Ownership and cleanup contract

- One mounted viewport owns one renderer/scene, one RAF render loop and one
  ResizeObserver. The loop updates camera/rendering only. Never start another loop
  on placement, reset, details toggle or help close.
- Scene owns both arrow objects, each with its own geometry/material ownership;
  dispose each once. Shared scale does not imply shared mutable arrow state.
  Scene also owns marker slots, annotations, plane geometry and OrbitControls.
  If an alternative caller-owned group is chosen, document that ownership instead
  and prevent scene and caller from both disposing it.
- Viewport owns pointer/keyboard/context listeners and camera-mode arbitration.
  Register/remove using stable references. Placement mode disables conflicting
  OrbitControls gestures before they consume the event; restore on Done, Escape,
  help opening, cancellation and teardown. Direct dragging/pointer capture is not
  required for this click-placement proposal.
- On unmount: invalidate stale callbacks, cancel RAF, disconnect ResizeObserver,
  remove listeners, restore/dispose controls, dispose scene resources, release
  references to the static session. Partial initialization failure follows the
  same ownership unwind. StrictMode mount/unmount/remount must remain safe.
- Help is a modal interaction boundary: stop placement while open, preserve
  coordinates, return focus to its trigger; closing does not sample or reset.
  Context loss cancels rendering safely; recovery must not leave old handlers or
  loops alive. Recreated renderer reads the retained static snapshots.

## 7. Availability, input and accessible responsive UX

Validate finite coordinates and fixed y/time before sampling; validate all output
components and speed, catching observation failures. Display `Unavailable` and
`Velocity could not be measured at this point.` for the affected probe; no zero
fallback and no stale arrow presented as current. Retain the other probe's valid
measurement. A later valid placement may recover B. A genuine zero vector is a
valid Speed 0 measurement with no direction; hide its zero-length arrow without
marking it unavailable. Profile endpoint clamping and zero-valued individual
operands are not generic out-of-domain signals. The comparison rectangle is not
the physical support/domain of the prescribed field.

Proposed keyboard alternative: two labelled bounded range controls for B,
`East position of B (m)` and `North position of B (m)`, with visible values and
explicit limits. East range 1500…5500; North range −1000…1000 (world z has opposite
sign). A preliminary 100 m step makes standard arrow keys useful; Home/End use
range endpoints. It is input granularity, not snapping of mouse placements or a
field-resolution claim. Pointer placements may retain finer coordinates.
Keyboard controls work without entering Move B and without manipulating canvas.
Proposed boundary help: `B stays 1000 m above ground. These limits define the comparison area, not the edge of the model.`

All actions use native buttons/ranges/details with visible focus. No global arrow
key interception outside focused coordinate controls. Escape ends placement;
focus remains on its toggle. Group A/B cards semantically; expose full units to
assistive technology. Avoid live-announcing the whole inspector on every range
tick; use a concise polite status on committed changes. Do not rely on color alone
for point identity, component sign, active mode or region limits.

Desktop: substantial scene alongside A/B measurement cards and placement controls.
Mobile: scene first, then controls and stacked A/B cards; keep Speed and Vertical
visible, horizontal components in native disclosure. No horizontal scrolling to
reach measurements. Bound canvas/container width, wrap controls and labels, provide
touch targets of at least 44 CSS px for placement mode/reset actions. A click mode
must work by tap without hover, while scrolling outside the scene remains normal.
Respect reduced-motion preferences; no instructional animation is required.

## 8. Proposed verification and technical acceptance criteria

These are future developer-verification requirements, not permission to execute
them now and not scientific qualification criteria.

1. Session: initial coordinates/frame/time exact; one field composition shared by
   A/B; repeated direct selections deterministic; no Simulation/integrator creation,
   step/history/clock calls. Verify with throwing guards or mocks, not advection.
2. Measurement: inspector/arrow share sampled P,t,V; East/North/Vertical signs;
   no extra C subtraction; failures/NaN/Infinity explicit unavailable; valid zero
   distinct from failure; A unchanged by B placement; reset/re-entry correct.
3. Geometry: independent arrows and disposal; tip=P+40V under provisional scale;
   length proportional to speed, direction true 3D; no T1 or screen tangent.
4. Placement: correct client-rect/NDC conversions at resize/DPR; actual y=1000
   intersection; inside/edge/outside rectangle; backward, parallel, near-parallel
   and nonfinite rays; rejection preserves prior values; North input sign correct.
5. Lifecycle: one RAF/listener set across updates and StrictMode; cleanup on lesson
   change, partial initialization, retry/context loss and unmount; no stale updates,
   duplicate loops or surviving owned Three.js resources. Longer profiling remains
   a separate activity unless explicitly included in later authorization.
6. Interaction: camera/placement arbitration, Done/Escape, keyboard/touch input,
   help focus return, Reset View camera-only, Reset probes state-only; warnings and
   cancellation when arriving from trajectory lessons remain unchanged.
7. Real-WebGL desktop and 390/320 CSS px mobile checks: full arrows at initial,
   reviewed representative and edge positions; no obscured inspector/controls or
   horizontal overflow; keyboard and component disclosure; no unsupported success
   or mandatory sign-search behavior. Review stable framing after resize/orbit.
8. Relevant regression tests for all three existing lessons/navigation, full
   typecheck and production build. Record any bundle warning or unavailable browser
   verification honestly. No qualification campaign or baseline update.

Human acceptance should separately review scientific wording and visual usability.
An exploratory usability check should ask a visitor to compare freely without
revealing the sign-change location; assess whether movement and component changes
are discoverable. Failure to find that optional phenomenon is not lesson failure.
Numerical audit alone does not prove discoverability or camera readability.

## 9. Basis, limitations and open review questions

The owner accepted the earlier bounded read-only audit as a design basis. No new
sampling or evidence collection accompanies this document. Prior direct samples
along z=0 showed B's Vertical decreasing from +1.93 m/s at x=2400 to −12.56 m/s at
x=5000, with Speed increasing from 21.13 to 25.15 m/s. Samples bracketed a vertical
zero between x=2690 and 2700 while Speed was about 21.41 m/s. These are rounded
design-context observations, not a replayable evidence package, baseline or
certification. Keep this location out of learner-facing copy and target styling.
The full proposed rectangle has not been sampled or visually qualified.

Remaining detailed questions for human review (the stage split and provisional
100 m keyboard step are already disposed above):

- Retain the provisional rectangle and 40 scale, or require revision after a
  separately authorized prototype verifies full-region framing?
- Accept persistent click-placement mode with orbit suspended, while keyboard
  coordinate controls remain directly usable? Confirm touch/zoom expectations.
- Confirm shared horizontal-component disclosure and Stage 2 Reset probes behavior.
  Keyboard increments are provisionally 100 m; numeric entry is not required.
- Accept proposed English copy, including always-available optional zero-component
  explanation, without location hints or completion requirements?
- Choose the precise oblique camera preset and whether the bounded plane needs
  subtle height supports; preserve clear distinction from trails and airflow.
- Confirm the small scene-owned multi-arrow API versus another ownership design
  before implementation; preserve existing Slice 3's single-arrow behavior.

Stop boundary: the separate Stage 1 Decision opens only its bounded implementation
and developer verification. Stop afterward for human technical/visual acceptance.
Stage 2 requires its own authorization. Architectural acceptance alone does not
permit implementation, experiments, evidence collection or later Learn stages.
