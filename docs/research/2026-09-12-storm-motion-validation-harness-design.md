# Storm-Motion Sensitivity — Minimal Validation Harness Design

**Status:** FROZEN · IMPLEMENTED · IMPLEMENTATION REVIEW COMPLETE · H1 CLOSED / PASS · H2 CLOSED / PASS · H3 EULERIAN CLOSED / PASS · H3 TRAJECTORIES CLOSED / INVALID CONTROL

**Pre-run SRH sign correction:** H2 expectations were corrected to `0,-300,-300` before campaign execution, following canonical physics doc 09. See the [formal correction record](2026-09-12-storm-motion-srh-sign-correction.md). This slice does not authorize campaign execution.

**Parent protocol:** `docs/research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`

**Closed architecture audit:** `docs/research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`

## 1. Purpose

This document freezes the smallest test-only harness required to execute the already-defined H1/H2/H3 storm-motion controls against the existing V1 backend.

The harness is not a production feature, not a new simulation mode, not UI work, and not authorization to modify V1 physics. Its job is to construct existing physics objects with frozen synthetic inputs, collect deterministic observables, compare them with pre-run expectations, and preserve enough evidence for a later validation report.

No analytical expectation may be changed after backend output is seen merely to obtain PASS.

---

## 2. Implementation boundary

The first harness implementation is one dedicated Vitest module under a validation-only path:

`src/validation/stormMotionSensitivity.validation.test.ts`

Local helper functions may remain inside that test module while the campaign is small. Do not create a production service, application mode, React surface, global store, or scenario abstraction merely for validation.

The harness may import existing production physics/simulation classes directly. It must not change their behavior.

The repository already uses `vitest run`, strict TypeScript, and source-local `*.test.ts` tests. The dedicated validation file can therefore be executed independently with Vitest without adding a production runtime entry point.

---

## 3. Frozen shared construction rules

### 3.1 Environmental profiles

Construct synthetic soundings directly with `EnvironmentalWindProfile`.

H1/H2 straight profile:

| height (m) | eastward (m/s) | northward (m/s) |
|---:|---:|---:|
| 0 | 0 | 0 |
| 1000 | 10 | 0 |
| 2000 | 20 | 0 |
| 3000 | 30 | 0 |

H3 curved profile:

| height (m) | eastward (m/s) | northward (m/s) |
|---:|---:|---:|
| 0 | 15 | 8 |
| 1000 | 23 | 10 |
| 2000 | 29 | 16 |
| 3000 | 31 | 24 |

All environmental vertical wind components remain exactly zero, as required by `EnvironmentalWindProfile`.

### 3.2 Frozen synthetic updraft

Where the campaign requires the prescribed updraft, construct the existing `VerticalEnvelopeUpdraftField` directly with:

- center `(x,z) = (0,0) m`;
- `peakVerticalVelocity = 20 m/s`;
- `sigma = 1000 m`;
- `baseHeight = 0 m`;
- `topHeight = 8000 m`.

Do not add rotation, lower inflow, upper outflow, near-ground outflow, or downdraft to H3.

### 3.3 Storm-motion injection

For every synthetic `C_test` requiring advection, use the audited seam:

`EnvironmentalWindProfile`
`-> EnvironmentalWindField(profile)`
`-> StormRelativeEnvironmentalAdvectionField(environmentField, C_test)`.

Do not add a storm-motion override to the production DEMO composer.

### 3.4 Numerical equality

Use the parent protocol's strict same-point equality rule:

`|a-b| <= 1e-9 + 1e-9 * max(|a|,|b|)`.

Use the parent protocol's SRH absolute tolerances:

- expected zero: `|SRH| <= 1e-6 m^2/s^2`;
- expected `-300`: `|SRH - (-300)| <= 1e-6 m^2/s^2`, equivalently `|SRH + 300| <= 1e-6 m^2/s^2`.

Do not relax these tolerances after execution.

---

## 4. H1 harness

H1 is primarily algebraic/Eulerian and does not require a tracer simulation.

For each frozen H1 storm motion, collect:

- storm-relative wind at every synthetic profile knot and at `1500 m`;
- translated-hodograph segment differences;
- environmental shear and horizontal vorticity on the relevant straight-profile segment;
- SRH over `0–3000 m`;
- streamwise/crosswise decomposition at `1500 m` where defined;
- prescribed `w`, horizontal updraft gradient, and local `T1` at fixed control points.

Required checks:

1. ground-relative `q(z)` remains the frozen source profile;
2. every storm-relative hodograph segment difference equals the corresponding ground-relative segment difference;
3. shear and environmental horizontal vorticity are invariant under `C`;
4. prescribed updraft values/gradients and local Eulerian T1 are invariant under `C` at identical points;
5. Sweep A SRH is zero for all `C=(0,0),(10,0),(20,0),(30,0)`;
6. at `1500 m`, `C=(10,0)` and `C=(20,0)` preserve zero streamwise magnitude while signed crosswise reverses according to the frozen left-normal convention;
7. any exact horizontal `V_sr=(0,0)` case is recorded as undefined decomposition / expected error, never coerced to `(0,0)`.

No renderer, hodograph UI, or DEMO overlay averaging may participate in H1.

---

## 5. H2 harness

H2 also requires no tracer simulation.

Use:

- `C1=(10,0) m/s`;
- `C2=(10,10) m/s`;
- `C3=(20,10) m/s`.

Collect at minimum:

- storm-relative wind at each knot and at `1500 m`;
- `SRH_0-3`;
- streamwise/crosswise decomposition at `1500 m`;
- the same C-invariant Eulerian controls used by H1.

Frozen analytical checks:

- `SRH(C1)=0`;
- `SRH(C2)=-300 m^2/s^2`;
- `SRH(C3)=-300 m^2/s^2`;
- `C2` and `C3` have different storm-relative winds despite identical layer SRH;
- at `1500 m`, C2/C3 streamwise components are equal, crosswise magnitudes are equal, and signed crosswise components are opposite under the production left-normal basis;
- all H1 C-invariants remain unchanged.

---

## 6. H3 simulation construction

For each H3 run construct fresh, independent instances. Do not reuse mutable simulation state between Run A and Run B.

Shared inputs:

- curved H3 `EnvironmentalWindProfile`;
- frozen synthetic `VerticalEnvelopeUpdraftField`;
- seed `X0=(-3000,500,0) m`;
- `EulerIntegrator`;
- `dt=0.1 s`;
- requested duration `600 s` / `6000` fixed steps;
- `ATMOSPHERIC_TRACER_DOMAIN` as the tracer lifecycle policy;
- `TracerPathHistory(tracerCount=1, stride=1)`;
- initial capture at `t=0`;
- post-step `recordAfterStep(...)` after every completed `Simulation.step(dt)`.

Only storm motion differs:

- Run A: `C_A=(5,8) m/s`;
- Run B: `C_B=(5,13) m/s`.

The total H3 velocity field is exactly:

`CompositeVelocityField([stormRelativeEnvironmentalAdvection, updraft])`.

No DEMO storm-local operand is permitted.

If the tracer becomes inactive before 600 s, stop advancing that run after the terminal accepted sample is recorded. Do not fabricate later samples.

---

## 7. H3 diagnostic sampling

Use the existing `DiagnosticTiltingTendency(profile, updraft)` for synthetic H3, but explicitly guard its profile domain with `soundingSegmentContainingHeight(profile, y)` before accepting T1 as evidence.

For every recorded path sample `(P,t)`:

1. sample prescribed updraft vertical velocity from `updraft.sample(P,t).y`;
2. compute horizontal radius to the updraft axis:
   `r = sqrt(P.x^2 + P.z^2)`;
3. query `soundingSegmentContainingHeight(profile,P.y)`;
4. if no containing segment exists, record T1 validity as outside synthetic profile and do **not** use the numeric legacy zero as T1 evidence;
5. if a containing segment exists, evaluate `DiagnosticTiltingTendency.sample(P,t)` and preserve the segment `{hLo,hHi}` with the value.

Primary H3 metrics use only the recorded discrete path samples. No interpolation, resampling, smoothing, or render-frame sampling is allowed.

---

## 8. Frozen H3 metrics

Each run must produce a deterministic summary containing at least:

- run id and storm motion;
- requested step count;
- executed step count;
- path sample count;
- final simulation time;
- final tracer active state;
- terminal time if deactivated, otherwise `null`;
- minimum horizontal radius `r_min` and its sample index/time/position;
- maximum sampled updraft `w_max` and its sample index/time/position;
- maximum valid sampled `|T1|` and its signed T1/sample index/time/position/containing segment;
- count of valid synthetic-profile T1 samples;
- count of outside-profile path samples excluded from T1 evidence.

For a fully active 600 s run, the expected structural count is `6001` path samples including the initial seed.

The pair-level H3 result must additionally record explicit PASS/FAIL/UNEXPLAINED/INVALID CONTROL checks for:

- Run A near-core geometry: `r_min,A <= 500 m`;
- Run B flank geometry: `750 m <= r_min,B <= 1500 m`;
- material sampled-w contrast: `max w_A >= max w_B + 2 m/s`;
- same-point Eulerian invariance grid;
- clean Run A T1 sign-reversal control when the realized geometry qualifies.

There is no PASS ordering requirement for `max |T1|` between Run A and Run B.

---

## 9. Frozen core-passage / sign-reversal algorithm

The sign-reversal check must be local to one realized near-core passage rather than searching the full 600 s run for an unrelated positive and negative sample.

For Run A:

1. find the recorded index `i_core` of global minimum horizontal radius `r`;
2. define the **core-passage window** as the maximal contiguous recorded interval containing `i_core` for which `r <= 1.5*sigma = 1500 m`;
3. only valid in-profile T1 samples inside that window may supply sign evidence;
4. material sign uses the frozen experiment-level guard `epsilon_T1=1e-6 s^-2`:
   - `T1 > +epsilon_T1`: positive evidence;
   - `T1 < -epsilon_T1`: negative evidence;
   - otherwise neutral for classification;
5. a clean reversal requires material-sign evidence on opposite temporal sides of `i_core`;
6. the selected left/right evidence and the recorded interval between them must remain within the same containing sounding segment, so environmental segment `omega_h` does not change across the claimed reversal;
7. sign order is not prescribed;
8. a sampled neutral/zero point is not required;
9. if adjacent valid samples change material sign directly, record a discrete sign transition; do not interpolate a zero-crossing time.

If Run A does not realize the required near-core geometry or the candidate reversal crosses a sounding-segment boundary, do not force a FAIL of V1 physics. Classify the control according to the parent protocol's geometry/validity rules and preserve the observed evidence.

Run B has no required sign reversal.

---

## 10. Same-point H3 Eulerian invariance grid

Before interpreting trajectory divergence, compare Run A and Run B at the frozen fixed grid using identical laboratory points:

Horizontal locations:

- core `(x,z)=(0,0)`;
- east ring `(+1000,0)`;
- west ring `(-1000,0)`;
- south/world-z ring `(0,+1000)`.

Heights:

- `y=500 m`;
- `y=1500 m`;
- `y=2500 m`.

At every grid point compare:

- prescribed updraft `w`;
- horizontal updraft gradient components;
- local valid T1.

The two C runs must agree under the strict equality tolerance. This control is evaluated independently of the tracer path.

---

## 11. Result-record discipline

The harness should represent observations as plain deterministic data, not screenshots or renderer state.

Each assertion/check must retain:

- check id;
- expected value/rule;
- observed value(s);
- resulting classification: `PASS`, `FAIL`, `UNEXPLAINED`, or `INVALID CONTROL` where applicable.

Do not use snapshot tests as the primary scientific oracle. Prefer explicit numeric/vector assertions and explicit structured summaries so a later report can quote the actual observed values.

A failing assertion must not trigger automatic retuning of the synthetic inputs or tolerances.

The first backend execution results are to be copied into the research Results/deviation record only after the harness implementation itself has been reviewed and committed.

---

## 12. Execution order

The first campaign execution order is frozen as:

1. typecheck the harness;
2. run H1 only;
3. inspect and classify all H1 discrepancies;
4. only if no unresolved H1 blocker exists, run H2;
5. inspect and classify all H2 discrepancies;
6. only if no unresolved H2 blocker exists, run H3 same-point Eulerian controls;
7. then run H3 trajectories A and B;
8. compute frozen H3 discrete metrics and sign-reversal evidence;
9. record observed results without editing pre-run expectations;
10. only after synthetic H1/H2/H3 are classified, proceed to the observed-environment C-sensitivity matrix.

Do not run all controls blindly past an unexplained earlier-layer failure.

---

## 13. Explicit non-goals

The minimal harness does not:

- add UI;
- alter DEMO storm motion;
- expose user-configurable C;
- change `ScenarioConfig`;
- modify integrator semantics;
- modify Analysis support semantics;
- add a new T1 formula;
- add thermodynamics;
- claim real-supercell prediction;
- tune H3 after viewing backend output.

---

## 14. Freeze / implementation gate

**Harness design status: FROZEN.**

The test-only harness is implemented using the existing production backend classes, and implementation review is complete. The pre-run SRH sign correction is closed. H1 and H2 are CLOSED · PASS; H2 was separately authorized only after H1 evidence/status documentation was committed/pushed. H3 Eulerian was separately executed and classified CLOSED · PASS. Subsequently, H3 trajectories was separately authorized, executed, and classified CLOSED · INVALID CONTROL; see [parent protocol §10](2026-09-11-storm-motion-sensitivity-and-v1-validation.md#10-results).

The trajectory INVALID CONTROL arose specifically because opposite material-sign evidence did not satisfy the frozen same-containing-sounding-segment requirement (`sameSoundingSegment=false`, `sameSegmentEvidence=null`). Trajectory/sample integrity, A/B geometry, and sampled-w contrast passed and remain valid partial evidence. This is not an established H3 physics failure or validation of clean same-segment sign reversal.

Execution/reporting note: the trajectory campaign test failed at the non-PASS report/assert gate for `H3/A/sign-reversal = INVALID CONTROL`; infrastructure tests passed and H1/H2/H3 Eulerian campaign stages were skipped in that run. The additional unhandled `[vitest-worker]: Timeout calling "snapshotSaved"` error is a technical reporting issue, not scientific evidence or the cause of INVALID CONTROL.

H3 documentation/classification closure is complete. The separate H4 pre-run design in [parent protocol §13](2026-09-11-storm-motion-sensitivity-and-v1-validation.md#13-h4--new-pre-run-geometric-sign-reversal-experiment) was approved and test-only implementation separately authorized. Implementation and implementation review were completed and committed/pushed, followed by separately authorized H4 execution. H4 is CLOSED · INVALID CONTROL. H5 scientific design review is approved and expectations frozen; test-only implementation is complete, implementation review complete/closed and execution not authorized. No campaign reruns or production implementation are authorized.

The frozen harness contract is unchanged. This documentation slice does not authorize or execute any campaign stage; later-stage results require their corresponding authorized backend execution.

## 15. H4 closed; H5 scientific design review gate

**H4 CLOSED · INVALID CONTROL.** Its approved frozen design and implementation are unchanged. The sole authoritative H4 scientific/input/evidence/classification contract is [parent protocol §13](2026-09-11-storm-motion-sensitivity-and-v1-validation.md#13-h4--new-pre-run-geometric-sign-reversal-experiment); this section does not duplicate or amend it. Sections 1–14 retain the H1/H2/H3 harness contract and historical classifications.

H4 is a separate synthetic experiment following H3, not a repair of H3 or permission to retune it. The frozen H4 test-only implementation contract requires preserving the existing H1/H2/H3 entry points and frozen records, using production primitives, and implementing the H4-specific boundary/evidence semantics from the parent specification. Do not silently reuse H3's opposite-temporal-sides-of-i_core condition as an extra H4 requirement: H4 selects chronological opposite-boundary-side evidence within its own local passage.

The existing validation-only module now has an explicit H4 selector and separate construction/oracle/evidence helpers; existing H1/H2/H3 behavior is unchanged. Typecheck and no-stage infrastructure verification passed (24 infrastructure tests, 5 campaign stages skipped). Implementation review was closed before the committed/pushed baseline and separately authorized H4 execution. H4 is CLOSED · INVALID CONTROL; no rerun or retuning is authorized. Observed C-matrix remains deferred; production/UI work is not authorized.

**H5 PRE-RUN SCIENTIFIC DESIGN REVIEWED / APPROVED · H5 EXPECTATIONS FROZEN · H5 TEST-ONLY IMPLEMENTATION COMPLETE · H5 IMPLEMENTATION REVIEW COMPLETE / CLOSED · H5 EXECUTION NOT AUTHORIZED.** The sole H5 scientific specification is [parent protocol §14](2026-09-11-storm-motion-sensitivity-and-v1-validation.md#14-h5--pre-run-scientific-design-for-a-shifted-boundary-crossing). H5 changes only seed z from 0 to +225 m; all other H4 inputs and frozen evidence/classification semantics remain unchanged. The separately authorized implementation shares H4 evidence/classification helpers, adds the H5 seed and conditional analytical prediction, and includes nine H5 hand-authored infrastructure fixtures. The frozen scientific contract is unchanged. Typecheck and no-stage validation passed: 33 infrastructure tests, all 6 campaign stages skipped. Implementation review is complete/closed; commit/push of the reviewed H5 slice is authorized after clean verification; no campaign execution is authorized.
