# Learn MVP — bounded Demo seed verification design

## Status

| Field | Value |
| --- | --- |
| Document type | DESIGN |
| Approval state | PROPOSED |
| Authority status | INACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Proposed opt-in collection and recorded-path viewing for a bounded set of Learn candidate starts in unchanged Demo Explore; no scientific qualification |
| Parent authority | [Documentation authorization Decision](../2026-10-21-learn-mvp-demo-seed-verification-documentation-decision.md); scientific/runtime owners in §11 |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## 1. Purpose, authority and evidence classes

Determine whether a small, fixed set of candidate starting positions is suitable
for a later introductory tracer lesson. The accepted architecture approach is a
documentation basis only. This newly authored design is not approved, activated,
implemented or permission to execute. Candidate coordinates are not accepted
teaching fixtures; no trajectory shape, visibility or comprehension result is known.

The [Learn MVP Design](2026-10-21-learn-mvp-design.md) remains a separate proposed
UI design. This instrument neither implements Learn nor its replacement of B.
Every verification case begins with a fresh lab. The earlier roadmap is background,
not an execution contract. Scientific gates are resolved only by PROJECT_STATUS.

Keep two evidence classes distinct:

- **Computational behavior record:** actual inputs, completed steps, state and
  recorder output from the existing Demo implementation. Not an independent
  solution, convergence study, analytical oracle or qualification of Euler.
- **Visual/UX observation record:** human observations of those saved paths using
  a developer-only viewer. Screenshots do not replace computational data; recorded
  positions do not establish beginner understanding or an effective Learn lesson.

### INTRODUCED

No scientific/model semantics. Proposed bounded instrumentation, result structure,
provenance, recording and display rules only. No new physical threshold or tolerance.

### NOT INTRODUCED / NOT CLAIMED

No modified fields, data, interpolation, integrator, timestep, tracer domain, solver,
thermodynamics, continuity closure, diagnostic, T1/C teaching UI or canonical fixture
change. No historical reconstruction, generated storm evolution, forecast or
scientific PASS/FAIL classification. No Phase P/P2 infrastructure, execution or P2
certification; Main L1 remains unauthorized. No universal runner, visualization
platform, lesson engine, result database or implementation of B replacement.

## 2. Existing mechanisms and minimum additional tooling

Static source findings are not execution results:

| Existing mechanism | Proposed use / limitation |
| --- | --- |
| [createExploreLab](../../src/app/createExploreLab.ts) | Same factory as Explore, explicit Demo identity and C; internally explicit StormRelativeLaboratory |
| [composeDemoTracersWithObservation](../../src/app/composeDemoTracerSimulation.ts) | Existing seven-operand composite, Euler and atmospheric domain; do not rebuild manually |
| [ExploreTracerSession](../../src/explore/ExploreTracerSession.ts) | releasePoint accepts exact coordinates and records the birth at current clock time; no scene object |
| [advanceLaboratoryFixedStep](../../src/ui/tracer/advanceLaboratoryFixedStep.ts) | Same completed-step body as live viewport: Simulation step, history record, then optional visual-population step |
| [TracerPathHistory](../../src/simulation/TracerPathHistory.ts) | Actual copied positions/time, stride 1 in this factory; distinct from full particle states |
| [TracerScene](../../src/rendering/TracerScene.ts) | Observe saved particle states and history; no physical computation |
| [Factory tests](../../src/app/createExploreLab.test.ts) | Existing pattern for a headless ExploreSceneSlots adapter, not proof of real scene synchronization |
| [Fixed-step tests](../../src/ui/tracer/advanceLaboratoryFixedStep.test.ts) | Existing developer examples; not reused as an implicit observation runner |
| [Vitest config](../../vitest.config.ts) | Existing runner; ordinary discovery is src/**/*.test.ts and src/**/*.test.tsx |

The inspected mechanisms suffice for exact initialization and stepping. There is
no ready entry that exports these cases and displays their record. Add only a thin
collector, explicit opt-in wrapper/config and a saved-record viewer. Do not edit
old tests or borrow scientific campaign selectors or capture/certificate machinery.

Alternatives: ordinary Explore has no exact numeric x/z entry or fixed-step stop;
standalone field assembly risks defaults and divergence; a live-browser runner adds
scheduler/export/lifecycle responsibilities. Recording once and viewing that same
record minimizes physical divergence, at the cost of not testing live viewport runtime.

## 3. Proposed future paths and isolation

Paths below are proposals, not existing deliverables or authorization to create them.

| Future path | Role |
| --- | --- |
| tools/learn-demo-seed-verification/collector.ts | Bounded collection, case list, metadata and serialization; no work at import time |
| tools/learn-demo-seed-verification/collector.run.test.ts | Explicit runner entry invoking the collector only after opt-in validation |
| tools/learn-demo-seed-verification/vitest.config.ts | Separate exact include for that entry; no ordinary src suite or campaign entry |
| tools/learn-demo-seed-verification/viewer/index.html | Standalone local developer viewer, not application navigation |
| tools/learn-demo-seed-verification/viewer/viewer.ts | Load, validate and display saved data; no Simulation or factory execution |
| tools/learn-demo-seed-verification/viewer/vite.config.ts | Isolated local viewer root; minimal reviewed access to existing rendering modules |
| artifacts/learn-demo-seed-verification/<run-id>/result.json | Collector output for five cases and completeness/errors |
| artifacts/learn-demo-seed-verification/<run-id>/provenance.json | Source/runtime/dependency identity and source-material references |
| artifacts/learn-demo-seed-verification/<run-id>/source-snapshot/ | Exact relevant source/config/tool bytes and dependency manifests needed for reproduction |
| artifacts/learn-demo-seed-verification/<run-id>/checksums.json | External raw-byte digests of result and provenance material, no self-hash |
| artifacts/learn-demo-seed-verification/<run-id>/ux/<observation-id>/ | Separate observation JSON/notes and screenshots, referring to the result digest |
| docs/reviews/<date>-learn-demo-seed-verification-review.md | Later bounded evidence/review navigation and conclusions, only after authorization |

No changes to package scripts, root test/build configuration, src, canonical fixtures
or production API are proposed. Ordinary npm test discovers only src tests and must
neither import this tools entry nor collect/write evidence. Dedicated Vitest config
must select only the exact tools entry, in run mode, without watch/retry/repeat.
Proposed additional opt-in: exact LEARN_DEMO_SEED_VERIFICATION=collect plus explicit
new output directory. Missing/unknown opt-in or an existing output target aborts
before lab creation. The environment variable is a mechanical gate, never human
authorization. No dependency on STORM_MOTION_VALIDATION_STAGE or src/validation.

Viewer uses its separate local Vite entry, no link/import from App or public build.
No uploads, server-side persistence or arbitrary replay of source code from a record.
Runtime module imports and filesystem serving boundaries require implementation review.
Evidence paths are outside src/data and outside public assets; artifacts/ is already
ignored. Ignored evidence is not durable merely because it exists locally (§7).

## 4. Inputs and case order

World coordinates are metres, x east, y up, z south, per the
[coordinate authority](../physics/00-coordinate-system.md).

| Role | x | y | z | Source of candidate coordinates |
| --- | ---: | ---: | ---: | --- |
| A | 0 | 1000 | 4000 | Existing Demo story seed S1 |
| B1 | 0 | 1000 | 6000 | Existing Demo story seed S2 |
| B2 | 2400 | 1000 | 0 | Existing Demo diagnostic seed |
| B3, reserve | 0 | 1000 | -2400 | Existing Demo diagnostic seed |

Copy values into per-run input; do not mutate or concatenate canonical pedagogy
arrays. Reusing coordinates does not inherit Guided identity or its mechanism claim.
These are candidates only. No input search or physics retuning to obtain a desired
shape. Same height for every role.

Execute the proposed main batch in this order: A; B1; B2; [A,B1]; [A,B2]. In each
pair A is released first, then B, with no intervening step. Both are born at t=0.
B3 is excluded from automatic fallback. A separate human decision is required to
collect B3 and [A,B3]; preserve the reason and the original B2 record.

| Configuration | Required input / source |
| --- | --- |
| Environment | Explicit EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED, never factory default |
| Frame | StormRelativeLaboratory as explicitly wired by createExploreLab |
| C | eastward 10, northward 0 m/s, explicitly passed, not an override from a prior visit |
| Field | Existing seven operands and Demo environmental knots, unchanged [DEMO_SCENARIO](../../src/scenario/DEMO_SCENARIO.ts) |
| Integrator / domain | Existing Euler / ATMOSPHERIC_TRACER_DOMAIN |
| dt / recorder | 0.1 s / factory TracerPathHistory, stride 1 |
| Horizon | Exactly 1200 completed steps; step 0 before advancement |
| Checkpoints | 0, 300, 600, 900, 1200 |

Record actual configuration, not just this table. Verify public lab environment/C,
empty particles/lanes/seeds, zero clock and supported dt before release. Tie frame,
Euler, domain and recorder construction to exact reviewed source/build wiring and
its relevant configuration bytes. The current public factory does not expose all
private integrator/domain/frame internals for runtime introspection: a manifest
label alone is not such a check. Do not access private fields, create a substitute
factory or claim those internals were observed at runtime. Record source-wiring
verification separately from runtime-observed fields. Whether additional proof is
needed is an open review item; any production API change needs a separate decision.
Mismatch or insufficient configuration identity stops preparation, not silent repair.

## 5. Collector execution contract (future, not yet authorized)

1. Check explicit authorization scope, opt-in, output target and provenance readiness.
   Freeze the run's source material for identification, without declaring a Governance
   freeze/pin or changing user files. Do not install/upgrade dependencies implicitly.
2. For each case call existing createExploreLab with explicit Demo and C and a fresh
   headless ExploreSceneSlots adapter. The adapter satisfies a factory dependency;
   it is not evidence that GPU slots or App orchestration worked.
3. Validate empty initial state and make all exact releasePoint calls at clock 0.
   The session copies seeds and appends each initial history sample. Do not call
   captureInitial again. Record role -> tracerId -> lane order, position, age, active.
4. Copy full step-0 state. For integer steps 1 through 1200 call only
   advanceLaboratoryFixedStep with that lab, dt, lab.pathHistory and the factory's
   visualAirflowPopulation, matching the ordinary Explore completed-step body.
   Never additionally invoke Simulation.step, Euler or recordAfterStep.
5. After each returned helper call copy clock and particle values, record history
   sample-count changes and observe active transitions. Keep the collector's step
   counter external to the model. Do not round or overwrite SimulationClock.time.
6. Continue counting through step 1200 even if a tracer becomes inactive; preserve
   unchanged terminal states while the global clock advances. No early shortening
   of the shared interval to improve presentation.
7. Copy the actual full recorder samples independently, construct checkpoint refs,
   perform record-integrity checks and finish that case. Discard the live lab/adapter
   before the next case. No Reset, reused cohort, seed replacement or mutation of B.

Visual population is stepped to retain the existing Explore ordering, not displayed
as scientific tracer evidence. Internal diagnostics may be constructed by the factory
but are neither sampled for this lesson nor interpreted as trajectory causes.

All copy operations are deep value copies of vectors/state: no mutable aliases.
Control runs do not depend on requestAnimationFrame, wall-clock duration or playback
speed. Test runner timeout/exit is infrastructure metadata, not the model horizon.
No conditional assertion on rise, curvature, rotation, divergence or scientific outcome.

## 6. Structured result and integrity contract

Use one versioned, bounded JSON result; full-state volume is small enough to avoid
streaming databases, compression frameworks or a general campaign writer. Proposed
sections are semantic fields, not a finalized TypeScript API.

| Section | Required information |
| --- | --- |
| Identity | Record/schema version; run id; collector identity; source/provenance reference |
| Runtime | Exact invocation, Node/Vitest versions, OS/runtime, dependency/lockfile identity; browser identity belongs in UX record |
| Configuration | Factory names, actual inputs and serialized Demo config, verified frame/C/Euler/domain/dt/stride; verification basis distinguished from observation |
| Batch | Planned ordered cases, reserve excluded, attempted/completed/not-run cases |
| Case mapping | Ordered role/seed/tracerId/lane mapping; creation clock; start validation |
| Per-step states | Step 0 and each completed step through 1200: integer step, nominal step*dt, raw clock.time, copied position/age/active for each role |
| Checkpoints | Explicit references to states at 0/300/600/900/1200; unavailable checkpoints marked missing on interrupted runs |
| Recorder output | Independent full samplesFor lane copies, each raw position and simulationTime; stride, birth capture, sample count and sample-to-step association |
| Termination | First observed active->inactive transition per role, or none observed within the collected interval; details below |
| Integrity/completeness | Steps requested/completed, errors and case status, finite-value checks, mappings/counts and missing evidence |

Per-step state and recorder output are distinct witnesses. Do not manufacture recorder
evidence by deriving it from exported states. Track the integer step on which samples
were actually appended; keep raw samples separately. This avoids guessing sample
steps from approximate clock arithmetic and makes display-prefix selection explicit.

### Clock and termination

Nominal times are 0/30/60/90/120 s at checkpoints. The actual clock accumulates dt
by floating-point addition; retain its full serialized value, not a nominal replacement.
Use integer steps for loop/checkpoint identity, not clock equality or while(time<120).
No new numerical tolerance is introduced to force clocks to equal decimal targets.

For first active->inactive at step k preserve step k-1 and k clock values, detection
time at end of step k, terminal position and terminal recorder sample/step. The domain
policy interpolates the accepted segment to y=0 but does not export exact within-step
crossing time. Do not infer it from the end timestamp or recompute an integrator step
to create it. No transition means 'not observed through completed step N', not 'never'.
After termination, full state snapshots continue but recorder points stop appending.

### Integrity and interruption

Check exact role/order/count consistency; initial t=0 before any advancement; expected
step sequence; finite raw numeric values; particle/seed/lane alignment; recorded samples
against the corresponding completed-step positions and append associations; terminal
sample and transition agreement; no duplicate initial capture or extra recording.
These are serialization/orchestration invariants, not physics thresholds or scientific
PASS/FAIL. Do not regenerate missing samples or repair discrepant data automatically.

Use independent technical descriptors such as complete/interrupted/not-run and
consistent/inconsistent/not-checked, not scientific classification vocabulary.
An unexpected exception stops the batch: retain completed cases and any available
partial states/history, mark current case incomplete and later cases not-run. Never
present shortened evidence as the planned complete batch. If final write/storage
fails, report storage failure and which evidence is unavailable; do not claim saved
evidence. A simple explicit finalization per case/error is enough; no new qualification
or recovery infrastructure is required. Reserve never starts because another case failed.

## 7. Provenance, storage and preservation

Before and after collection identify the actual checkout: full HEAD, relevant tracked
diff, untracked dependencies, exact raw-byte hashes and preserved bytes for imported
source/configuration, collector and its dedicated configuration. A clean HEAD is not
required; a bare HEAD is insufficient. Do not reset, stash, stage, overwrite or commit
user files to make identity simpler. Do not silently consume changes during a batch.
If relevant bytes change, mark provenance inconsistent and stop further collection.

Preserve relevant source material plus package/lockfile and runtime/tool versions.
Hashes alone cannot reconstruct dirty files. Do not archive unrelated user artifacts,
credentials, local environment files or node_modules wholesale. State the dependency
scope covered and any reconstruction limitation. Recheck the actual consumed source
identity, not just a mutable working-tree manifest. Exact import-graph capture and
proof that those bytes were loaded is an implementation review item.

Each authorized invocation writes only a new explicit run directory. Never overwrite
an old result, resume a partial case or run again automatically. Keep computational
result immutable as evidence of that invocation; later UX observations are separate
identified records. Hash result/provenance files externally in checksums.json, without
self-hash cycles. A viewer observation records the actual result path/id and raw-byte
digest and viewer identity; the collector need not predict that future digest or UX.

artifacts/ is ignored, so local storage alone is not durable repository provenance.
Before relying on results in permanent documentation, agree a preserved evidence
location and retention/backup responsibility and link it from a bounded evidence/review
record. Do not move/archive/delete any user evidence in this documentation slice.

Temporary tool removal requires a bounded decision and must preserve the evidence,
viewer/collector/config bytes needed for reproduction and relevant dependencies.
No production imports means removal should not alter Explore/Guided; verify this
dependency boundary before removing. Retention is not a new persistence feature
of the public product.

## 8. Developer-only recorded-path viewer

The viewer loads one explicit collector result and provenance/checksum reference.
Validate schema, completeness, finite values, mappings and sample-step associations;
reject a mismatched digest or inconsistent selected case rather than rendering a
plausible substitute. Incomplete cases cannot be labelled the planned full interval;
whether inspection of a clearly marked partial record is needed remains open.

No Simulation construction/step, field sampling, integrator invocation, factory call,
collector import or live TracerViewport scheduler in the viewer. Load data as inert
JSON. Prefer existing TracerScene syncFromParticles and syncFromPathHistory, existing
glyphs/trails and resetView. Use actual state snapshots at integer steps and only the
actual recorder prefix appended by the displayed step, including terminal samples.
No interpolated positions, future trail, smoothing, decimation or guessed timestamps.

The current scene takes a concrete TracerPathHistory, not arbitrary exported JSON.
A narrow local loading/display adapter is needed. One candidate is reconstructing
a display-only recorder from saved state transitions with existing recorder methods,
then comparing its values exactly to saved actual recorder samples before displaying.
This reconstruction is not evidence of original recording. Saved recorder output
remains the authority for the shown prefix; it cannot be silently replaced by states.
If exact prefix loading cannot be implemented through existing public methods, stop
and seek a separate decision on any production API change. Final adapter choice is open.

At load/switch create or rebuild only the needed display slots and clear old particles,
history, hover/selection/probe/preview/follow, playback cursor and accumulator. Assert
equal case role count, particle-state count, lane count and scene-slot count before sync;
do not rely on TracerScene's Math.min truncation. On disposal cancel animation callbacks,
release scene resources/listeners and prevent old case data from appearing again.

Playback 1x/5x advances the display cursor through recorded integer steps, never the
model. Pause freezes that cursor. Frame-rate stalls may skip intermediate displayed
states, but keep the entire eligible trail prefix. Record scheduling/stall limitations;
wall-clock duration never changes evidence/model time. Reset View changes camera only;
restarting playback sets the cursor to step 0 and resets display history without any
claim of simulation rewind. No general timeline editor or visualization platform.

Baseline from [deepStormTracerView](../../src/rendering/deepStormTracerView.ts): camera
(12000,6000,12000), target (0,4000,0), FOV 50 degrees, near/far 10/50000 m, world 1:1,
10000 m grid/10 divisions, glyph radius 150 m. Fix viewport dimensions and page zoom;
keep Follow off and the grid on for the first comparison. Existing inactive-glyph
policy for Demo Explore is hide; retain that baseline and log termination separately.
Any optional alternative rendering is explicitly labelled, not mixed into baseline.
No decorative airflow or Analysis overlay in the recorded-tracer view.

This viewer does NOT test runtime/performance/lifecycle of live TracerViewport,
public release placement, Learn state transitions, B replacement, accessible Learn
controls or visitor comprehension. Rendering a saved result does not establish those.

## 9. UX observations and suitability decisions

Review the five cases in the collection order; replay the same result at 1x and 5x.
Record visibility of start/current/trail, A/B attribution, occlusion, offscreen events,
termination, camera recovery and ability to follow motion without orbit/Follow.
Separate factual event/step references from subjective reviewer judgments. Store
viewer identity, exact result digest, settings, browser/viewport/device pixel ratio,
playback rate and screenshot-to-case/step mapping with limitations.

Candidate suitability means a readable marker and growing past path, distinguishable
pair and a manageable view with honest explanation. Defer/reject for teaching when
loss of visibility, overlap, constant camera work or unexplained disappearance dominates.
No mandatory rise, spiral, divergence, height ordering or visual drama. Distinguish
candidate problems from rendering problems. Preserve unfavorable observations.
No new physical cutoff, convergence tolerance, scientific PASS/FAIL or P2 certificate.
No user-understanding claim from a reviewer screenshot; later beginner study is separate.

## 10. Open implementation decisions and authorization gates

- Review/approve this proposed design separately from acceptance of its approach.
- Finalize exact invocation/configuration and opt-in enforcement outside ordinary tests.
- Specify configuration-proof coverage for source-bound private frame/integrator/domain
  construction versus public runtime checks, without unapproved API changes.
- Finalize schema/error finalization and exact source/dependency capture scope.
- Resolve actual recorder-prefix loading through existing scene APIs; any production
  API extension requires separate disposition before proceeding with that extension.
- Review viewer scheduling, digest validation, case cleanup and incomplete-record policy.
- Agree output location, preservation responsibility and reproduction material.
- Separately authorize bounded instrument implementation, its developer checks,
  five-case collection and browser observation; approval alone authorizes none of them.
- Separately decide any reserve B3 use, seed acceptance or future tool removal.

Do not implement Learn or B replacement as incidental harness work. No campaign,
build, test execution or browser launch is implied by documenting this plan.

## 11. Owning contracts and documentation integrity

| Owner | Inherited boundary |
| --- | --- |
| [Coordinates](../physics/00-coordinate-system.md), [parcel](../physics/01-parcel-basics.md), [integration](../physics/03-numerical-integration-basics.md) | Coordinates, passive markers and numerical meaning unchanged |
| [Model class](../architecture/30-model-class-decision.md) | Prescribed kinematics; no dynamical or qualification claim |
| [Seeding](../architecture/18-explore-arbitrary-seeding.md), [domain](../architecture/11-ground-atmospheric-domain-policy.md) | Exact runtime seeds, existing birth/ground policy; no replacement contract |
| [History](../rendering/14-tracer-path-history.md), [runtime controls](../rendering/02-tracer-runtime-controls.md) | Observe after steps; playback is distinct from physical velocity |
| [Camera](../rendering/11-deep-storm-tracer-view.md), [Reset View](../architecture/37-reset-view-camera-recovery-architecture.md) | Rendering fixture and view recovery, not simulation Reset |
| [Navigation](../ui/07-app-navigation-and-mode-entry.md), [Guided runtime](../architecture/20-guided-runtime-architecture.md) | No public entry/Guided change; standalone developer tool only |

No owning document is edited/superseded and no frozen artifact is changed by this
slice. New Design and Decision are mutable and not pinned. PROJECT_STATUS is the
only mutable project-wide state owner. Source links document static dependencies,
not execution or qualification evidence. A future scope conflict must be resolved
through the owning authority; it cannot be bypassed by a developer-only label.

Cold-start route: README -> PROJECT_STATUS -> documentation Decision -> this proposal
-> owning contracts. Accepted human scope is preserved in the Decision's original
instruction and translation. Future outputs/review must link back to an approved
version and separate execution authority before becoming the basis of teaching claims.
