# Observed C-Matrix E1 — Test-Only Implementation Design

**Current scientific status: E1 CLOSED · PASS by human review; executed exactly once.**
See [owning observed protocol §14](2026-09-12-observed-c-matrix-protocol-design.md#14-e1-execution-results-and-human-scientific-closure)
for provenance, findings and scope. The next gate is a separately reviewed/frozen
Lagrangian stage design; Lagrangian implementation/execution remain unauthorized.
The earlier execution-authorization bookmarks below are historical. This pointer
changes no frozen implementation-contract requirement.


**E1 IMPLEMENTATION DESIGN REVIEW — CLOSED · APPROVED.**

**E1 IMPLEMENTATION REVIEW — CLOSED · APPROVED (2026-09-13).**

The reviewed code is exactly the committed/pushed three-file E1 implementation
at **c54f885** (full SHA: `c54f8857a808de0aae316556306af2069c7b5aa3`):
`src/validation/observedCMatrixE1Spec.ts`,
`src/validation/observedCMatrixE1.ts`, and
`src/validation/observedCMatrixE1.validation.test.ts`.
Human implementation review is now closed and approved. Infrastructure fixtures
(11 passed; scientific entry skipped) and typecheck passed before review closure;
these checks were not rerun for this docs-only closure.

No observed E1 scientific collection has run. No H1–H5 rerun or
Simulation/trajectory execution occurred. Production physics, UI, ScenarioConfig
and DEMO composition remain unchanged. Arithmetic inputs and the implementation
contract remain FROZEN. Implementation review approval does not authorize execution.

Current next action: **Separately authorize the first E1 scientific execution
against reviewed implementation SHA c54f885.** E1 execution and the Lagrangian
stage remain NOT AUTHORIZED. **STOP FOR REVIEW-CLOSURE CHECK.**

The design-freeze narrative and gate sequence below are historical records of
the earlier slice; this closure supersedes their implementation-status bookmarks,
without changing any frozen contract requirement.

**Implementation contract version: `observed-c-matrix-e1-implementation/v1` — FROZEN.**
Human scientific review closure recorded 2026-09-13. This docs-only closure adds the
explicit storm-only literal snapshot in §4.1 and freezes the reviewed contract.
It does not start implementation or authorize scientific execution.

```text
E1 ARITHMETIC INPUTS — FROZEN
E1 IMPLEMENTATION DESIGN REVIEW — CLOSED · APPROVED
E1 IMPLEMENTATION CONTRACT — FROZEN
E1 IMPLEMENTATION — COMPLETE
E1 IMPLEMENTATION REVIEW — CLOSED · APPROVED
E1 IMPLEMENTATION REVIEWED SHA — c54f885
E1 EXECUTION — NOT AUTHORIZED
LAGRANGIAN STAGE — NOT AUTHORIZED
```

Design audit HEAD: **`9f3dfbca2e87b7755bcc2bdc7c93433161f839f5`**
(`docs: freeze observed C-matrix E1 protocol`). Local upstream resolves to the
same SHA; no fetch or remote mutation was performed. The user identifies this
as the pushed baseline. The earlier arithmetic-input baseline
`f3451a197228f0ac7901f98c2e926d11883f65ba` remains unchanged in the owning
[observed protocol §13](2026-09-12-observed-c-matrix-protocol-design.md#13-e1-full-precision-frozen-arithmetic-specification).
These are distinct provenance fields, not interchangeable HEAD requirements.

Primary authority: [observed protocol](2026-09-12-observed-c-matrix-protocol-design.md),
especially §§5–7, 9 and 13. This document now freezes the human-reviewed
implementation organization, probes, independent checks, tolerances, reporting
and stop rules. It changes no frozen arithmetic value. Design-review closure
is distinct from review of the future implemented code and from E1 execution
authorization.
The only new computations here were static JSON/metadata inspection, probe
support/geometry arithmetic and conservative floating-point error estimates.
No production module, Analysis transform, SRH evaluator, test, typecheck,
build, simulation or campaign was executed. No implementation code was written.

## 1. Scope and existing validation audit

Minimal E1 is four observed Source profiles times five frozen C members: 20
Eulerian member records. It distinguishes environmental/prescribed invariants,
direct C response, Analysis availability/support and independent references.
There are no particles, integration steps, trajectories, sampled-path extrema,
sign-reversal searches or Lagrangian quantities. It is not storm reconstruction,
storm-motion estimation, Bunkers validation, thermodynamic validation or a UI
feature. No tornado/outcome label enters the model or oracle.

The existing synthetic campaign lives entirely in
`src/validation/stormMotionSensitivity.validation.test.ts`, documented by
`src/validation/README.md`. All scientific helpers are local to that module;
it also registers Vitest tests and imports Simulation/path-history machinery.
Importing it to obtain a helper would couple E1 to frozen stage registration.
**Do not import, extend, extract from or modify that module for E1.**

| Existing convention | Evidence in current harness | E1 treatment |
| --- | --- | --- |
| Frozen inputs | H1_C/H2_C/H3_C, synthetic profileFor/fields, geometry constants local to the module | New observed-only spec; preserve all H1–H5 constants and records |
| Stage guard | STORM_MOTION_VALIDATION_STAGE accepts exactly H1, H2, H3-Eulerian, H3-trajectories, H4 or H5; unknown values throw; entry points use skipIf | Separate E1 selector and isolated file; no new synthetic selector value |
| Evidence | Check carries id, expected, observed, status; nested run/sample objects retain inputs | Retain explicit identity/rule/value records, add typed units/residual/tolerance/applicability and run provenance |
| Oracle | H1 straight-profile literals; H2 frozen SRH expectations; H4 independent Gaussian/geometry reasoning | Reuse the independence discipline, not synthetic values, sign expectations or analytical geometry |
| Equality | equal/numericCheck use one 1e-9 absolute-plus-relative rule; srhCheck uses 1e-6 | Do not reuse these helpers or adopt their tolerances without a new error analysis |
| Output | reportAndAssert emits deterministic JSON before asserting statuses | Same output-before-runner-failure convention, with E1-owned formatter and no automatic document writes |
| Classification | PASS/FAIL/UNEXPLAINED/INVALID CONTROL; unresolved discrepancies default to UNEXPLAINED; h4ReviewStatus distinguishes missing geometry | Preserve categories; no geometric/material-sign classification helper belongs in E1 |

The current README contains historical “observed deferred” and H5 review
bookmarks; it is evidence of the synthetic organization, not authority to
override the subsequently reviewed observed protocol. It is not edited here.
`vitest.config.ts` includes `src/**/*.test.ts` and `src/**/*.test.tsx`; a new
`.validation.test.ts` sibling is discovered without config/package changes.
No shared validation framework is necessary.

Safe reuse consists of the audited production APIs below, copied organizational
patterns for deterministic evidence, and existing Source/Analysis data plumbing.
Synthetic `collectEulerianRun`, `invariantChecks`, `decompositionPair`, grid,
`srhCheck`, H3/H4/H5 material/geometry/path helpers and `reportAndAssert` are not
callable shared APIs and will not be imported. A second SRH wrapper, T1 alias
or duplicated production polygon accumulator would make an oracle circular.

## 2. Frozen minimum file set and single arithmetic authority

The three-file layout is **FROZEN; none of these files is created by this task**.

| Frozen file | Responsibility and owned data | Production calls / independent work / forbidden imports |
| --- | --- | --- |
| `src/validation/observedCMatrixE1Spec.ts` | Only executable transcription of protocol §13: stable case/member IDs, exact source identities, normalized fixture paths/hashes, frozen endpoint brackets/q0/q1/Q/q_ref, C0/alpha, 20 literal C vectors and endpoint-derived expected responses; frozen probe/tolerance manifest and immutable literal storm-only snapshot (§4.1) under the implementation-contract version | No production API calls or imports, no Vitest, app, simulation or harness imports. Plain readonly data; no sampling at import |
| `src/validation/observedCMatrixE1.ts` | E1 evidence types, pure endpoint/coordinate/operand reference arithmetic, guard/preflight, explicit-C composition, group collection, classification and deterministic serialization | Built-in file/hash/Git reads for provenance; approved production APIs only after execution guard and raw-input preflight. Reference helpers must not call the API being checked. No synthetic validation module, Simulation, integrator, tracer/history, UI, rendering, high-level lab/composer or what-if imports |
| `src/validation/observedCMatrixE1.validation.test.ts` | Separate stage entry, default-skipped observed collection, isolated infrastructure fixtures for guards/schema/classification/reference wiring | Vitest plus E1 spec/pure helpers; collector invoked only for the explicitly selected and separately authorized stage. No literal duplicate matrix, synthetic stage import or independent production sweep |

The scientific authority stays protocol §13. Freeze **literal frozen values
plus independent reconstruction**: copy all 20 C vectors once into Spec, use
those exact literals as adapter inputs, and reconstruct them from the frozen
q0/q1 and raw endpoint brackets as a preflight cross-check. Never construct the
execution C inputs from production profile samples. Runtime measured q0/q1 are
actual values to check, not replacements for the frozen oracle inputs.

The one Spec transcription also owns the frozen expected DeltaSRH values and
normalized expectations. Pure endpoint arithmetic recomputes p/r and Q/2 to
check that transcription, not to overwrite it. Preserve the protocol's direct
Q=Delta_u²+Delta_v² evaluation, unsimplified q_ref and reference-wind operation
order, and the documented recovered-C rounding residual. Do not use S*S or
unit-vector reconstruction to silently change the frozen numbers.

No second set of 20 vectors in the test entry, runner, JSON fixture or design
document. Infrastructure verification may compare the Spec with the owning
§13 tables using a read-only parser; Markdown is never sampled as a production
profile or used to generate expected values from measured diagnostics. Review
the transcription against the approved document before any scientific run.

Frozen matrix ID: `observed-c-matrix-e1/source-L500-3000-C0e10n0-alpha0p5/v1`.
Keep separate arithmetic-spec, implementation-contract and evidence-schema
versions; a future change to probes or tolerances is not permission to revise
the arithmetic matrix. Hash the ordered numeric manifest and record the hash.

## 3. Guard, preflight and case/member context

Freeze the isolated selector `OBSERVED_C_MATRIX_STAGE` with only absent or exact `E1`
accepted. Absent means the observed entry is skipped; empty/unknown/all values
are errors. E1 selection must reject any present `STORM_MOTION_VALIDATION_STAGE`.
No automatic selector setting, stage chaining or H-stage invocation exists.
Future authorized execution must select only the E1 test file, with the
synthetic selector absent. An E1-local guard cannot suppress a separately
discovered synthetic test file in a whole-suite run: do not claim otherwise.
The environment selector is an execution guard, not evidence of human approval.

No observed collection, field construction, Analysis filtering or diagnostic
evaluation at module top level. Production value imports are lazy inside the
guarded collector after raw-input preflight; pure helper imports and readonly
constants are safe for infrastructure tests. This matters because
`app/exploreEnvironmentRepresentations.ts` constructs all three ESC Analysis
columns eagerly when imported. Keep that import behind the guard and preflight.
No module-global mutable state, caches shared between runs or env mutation.

Before loading production data factories, check all four raw normalized blobs,
three TIME siblings, Spec literal integrity, coverage and probe brackets, and
the reviewed production/config revision. Use committed-byte SHA-256 (the §13
hash convention), and also require the parsed working fixtures to match the
committed blobs; never silently accept a dirty fixture. Record current runtime
HEAD separately from arithmetic baseline and implementation-reviewed SHA.
The later implementation commit necessarily differs from this design HEAD;
its reviewed SHA is an explicit future gate, not an invented value here.

Case IDs are exactly `goshen-2009-observed`, `prospect-valley-2010-observed`,
`dumas-2010-observed`, `moore-2013-observed`. Member IDs, in fixed order, are
`C0`, `parallel_plus`, `parallel_minus`, `right_plus`, `right_minus`.
The case context retains the full sourceIdentity string, datum, coverage,
Source record/profile and matching Analysis column or null, never just a
display label. Pin the exact identities from protocol §2 in Spec and compare
them to the production record; do not infer identity from a filename alone.

After preflight, reuse the existing Source EnvironmentalWindProfile and Analysis
sibling through the allowlisted data-only
`app/exploreEnvironmentRepresentations.ts` / `app/goshenObservedEnvironment.ts`.
These are deliberate exceptions to the ban on high-level app composition; they
select committed columns and do not create simulations. Import no `createExploreLab`
or `composeDemoTracerSimulation` module. Require non-undefined Source for every
case, matching Analysis source identity for ESC and null for Moore. Recheck
production objects against raw inputs before collecting scientific groups.

Each per-member context retains case/source ID, member ID, frozen C, copied
constructor argument C, C0, layer, reference to the unchanged Source and shared
storm operands, probe IDs/coordinates/time, Analysis availability and oracle
inputs. Snapshot the exact argument actually passed when constructing the
adapter; do not fill the evidence C later from a separate expected label.
The adapter copies C privately, so independent velocity checks—not private
field introspection—test the numerical effect of that constructor argument.

## 4. Composition choice and explicit C seam

Freeze **option B: the same six fixed prescribed DEMO storm operands as
observed Explore**, plus the explicit-C environmental adapter. This requires
only existing factories and `CompositeVelocityField`, with no integrator or
Simulation. It directly checks the actual multi-operand seam; updraft-only
option A would show translation algebra but cover less of Explore's wiring.
This does not adopt the full DEMO storm as any future Lagrangian control.

Construct the six storm operands once per guarded invocation through the
existing scenario factories with the unchanged `DEMO_SCENARIO`. Before constructing any storm field, compare every consumed storm-only
parameter with the immutable literal snapshot in §4.1 and record expected
versus actual values, in addition to revision provenance.
Share those exact six instances across all case/member composites. Each member
gets a new `StormRelativeEnvironmentalAdvectionField` wrapping that case's
`EnvironmentalWindField(profile)` and receiving its explicit frozen C.

Preserve this ordered seven-operand list from production:

1. Explicit-C environmental advection.
2. `createUpdraftField(DEMO_SCENARIO)`.
3. `createRotationField(DEMO_SCENARIO)`.
4. `createLowerRadialInflowField(DEMO_SCENARIO)`.
5. `createUpperRadialOutflowField(DEMO_SCENARIO)`.
6. `createDowndraftField(DEMO_SCENARIO)`.
7. `createNearGroundRadialOutflowField(DEMO_SCENARIO)`.

Production's convenience composer hides DEMO C and imports simulation code;
do not call it. Do not read `DEMO_SCENARIO.stormMotion` as a fallback, add an
override to ScenarioConfig, mutate the scenario, subtract C from a storm-local
field, or subtract C again from the total. Factory use does not imply using
scenario simulation/seeds settings; those are outside E1.

Keep a named operand list in test-only evidence because CompositeVelocityField
does not expose its private array. Construction review checks that the exact
listed instances are passed. Independently compare the sampled total with the
ordered sum of separately sampled operands, and then apply the C-response
identity. The sum check is composition self-consistency, explicitly not an
independent validation of each storm model. Repeated storm samples/identity
checks detect routing or mutation; they are not five new physical experiments.

### 4.1 Frozen immutable storm-only literal snapshot

**FROZEN.** The six scenario factories each read exactly six fields from their
own `DEMO_SCENARIO.storm` block: 36 consumed scalar parameters in total.
The audited mappings contain no indirect scenario dependency. Constructor
height spans are derived from the recorded base/top values; they are not
additional scenario inputs. Neither stormMotion nor any environment,
simulation, seed, timestep or lifecycle field is consumed by these factories.

The future `observedCMatrixE1Spec.ts` must contain one immutable literal
`FROZEN_E1_STORM_ONLY` whose value has the following canonical shape, matching
`DEMO_SCENARIO.storm`. This JSON is documentation of that later transcription;
no executable file or second storm implementation is created here.

```json
{
  "updraft": {
    "centerX": 0,
    "centerZ": 0,
    "peakVerticalVelocity": 30,
    "sigma": 4000,
    "baseHeight": 0,
    "topHeight": 8000
  },
  "rotation": {
    "centerX": 0,
    "centerZ": 0,
    "angularVelocity": 0.005,
    "sigma": 4000,
    "baseHeight": 0,
    "topHeight": 6500
  },
  "lowerRadialInflow": {
    "centerX": 0,
    "centerZ": 0,
    "radialStrainRate": 0.00125,
    "sigma": 4000,
    "baseHeight": 1500,
    "topHeight": 4500
  },
  "upperRadialOutflow": {
    "centerX": 0,
    "centerZ": 0,
    "outflowStrainRate": 0.0025,
    "sigma": 4000,
    "baseHeight": 5000,
    "topHeight": 9000
  },
  "downdraft": {
    "centerX": 5000,
    "centerZ": 0,
    "peakDownwardVelocity": 20,
    "sigma": 2000,
    "baseHeight": -400,
    "topHeight": 3600
  },
  "nearGroundOutflow": {
    "centerX": 3000,
    "centerZ": 4000,
    "outflowStrainRate": 0.010991,
    "sigma": 1500,
    "baseHeight": 0,
    "topHeight": 800
  }
}
```

Every row below identifies all six fields consumed by its factory. All center,
sigma and height values are in metres: centerX is world east, centerZ is world
south, and baseHeight/topHeight are world up. Strength units are stated separately.

| Snapshot block / consumer | centerX / centerZ (m) | sigma (m) | baseHeight / topHeight (m) | Exact strength field, value and units |
| --- | --- | --- | --- | --- |
| updraft / createUpdraftField | 0 / 0 | 4000 | 0 / 8000 | peakVerticalVelocity = 30 m/s |
| rotation / createRotationField | 0 / 0 | 4000 | 0 / 6500 | angularVelocity = 0.005 rad/s |
| lowerRadialInflow / createLowerRadialInflowField | 0 / 0 | 4000 | 1500 / 4500 | radialStrainRate = 0.00125 s^-1 |
| upperRadialOutflow / createUpperRadialOutflowField | 0 / 0 | 4000 | 5000 / 9000 | outflowStrainRate = 0.0025 s^-1 |
| downdraft / createDowndraftField | 5000 / 0 | 2000 | -400 / 3600 | peakDownwardVelocity = 20 m/s (positive downward magnitude) |
| nearGroundOutflow / createNearGroundRadialOutflowField | 3000 / 4000 | 1500 | 0 / 800 | outflowStrainRate = 0.010991 s^-1 |

The future executable snapshot is recursively readonly and immutable; it must
not alias or be generated from the runtime scenario. Immutability applies to
the test-owned literal, never by freezing or otherwise mutating DEMO_SCENARIO.
Preflight enumerates the six named blocks and their exact consumed key sets,
compares each actual finite scalar with the literal expected value using exact
equality, and records path, consumer, units, expected, actual and match state.
Missing/changed consumed values or changed factory dependencies are
PREFLIGHT_BLOCKED, with no scientific classification. Revision checks remain
additional provenance, not a substitute for this field-level comparison.

After preflight, construct the actual fields with the existing six production
factories and unchanged DEMO_SCENARIO. The literal is an expected-parameter
authority, not a replacement scenario passed to a second set of fields. Record
both expected and actual parameter snapshots in the run header, along with
the shared operand identities. No unrelated scenario parameters enter this
snapshot. A future factory dependency change requires review before collection.

## 5. Frozen fixed-point probe set

Updraft contract: center=(0,0) in world x/z, sigma=4000 m, W0=30 m/s,
base=0 m, top=8000 m. Inside its envelope,
w=W0 exp(-r²/(2 sigma²)) sin(pi*(y-base)/(top-base)) and
grad_h(w)=-(w/sigma²)*(dx,dz). The gradient is exactly zero on/outside the
lids and at the center; do not choose these as the only probes.

**Two frozen probes**, shared by all four cases and all five members, at
time t=0 s. Height y=(h0+h1)/2=1750 m is the midpoint of the accepted layer,
not the height of a depth-mean or endpoint-mean wind.

| Probe ID | Definition relative to updraft center/sigma | World position (x,y,z), m |
| --- | --- | --- |
| P1 | dx=+sigma/2, dz=+sigma | (2000,1750,4000) |
| P2 | dx=-sigma, dz=+sigma/2 | (-4000,1750,2000) |

Both have r²/sigma²=5/4, hence radial factor exp(-5/8)>0; vertical factor
sin(7*pi/32)>0. Both gradient components are nonzero. The radial direction
vectors (1/2,1) and (-1,1/2) are orthogonal, so their gradients are independent
projections of omega. A single point can hide a component swap or an error
orthogonal to its gradient; these two resolve that specific failure mode
without a Cartesian grid. Geometry-only arithmetic gives w approximately
10.1869876657286 m/s at either point; this is not a production field evaluation.
Gradients are proportional to (-1/2,-1) and (+1,-1/2), respectively. Do not
infer any T1 sign without the representation-specific omega.

The same height serves E1-E and E1-F only. E1-B also uses the two already-frozen
endpoint heights 500/3000 m to exercise two distinct interpolation brackets;
E1-D uses only endpoint-mean flow and finite-layer omega, with no local-height
decomposition probes. This separates height-specific q(1750) from q_ref.

### Static support audit at y=1750 m

Both spatial probes use the following native segment for each representation;
ESC Analysis retains Source heights. Indices are zero-based normalized/TIME
fixture indices; actual filtered winds have not been computed here.

| Case | Source indices | Segment heights (m) | Source endpoint winds (east,north), m/s | Retained TIME endpoints / full-support interval (s) | Expected Analysis |
| --- | --- | --- | --- | --- | --- |
| Goshen | 314,315 | [1745.1,1751.8] | (3.7,9.1) -> (3.7,9.2) | [314,315] / [40,2040] | FULL_SUPPORT; nearest support-boundary margin 274 s |
| Prospect Valley | 318,319 | [1744.6,1751.2] | (-0.8,14.4) -> (-0.7,14.3) | [329,330] / [39,2782] | FULL_SUPPORT; margin 290 s |
| Dumas | 321,322 | [1748.2,1752.5] | (9.2,13.2) -> (9.2,13.2) | [331,332] / [39,2980] | FULL_SUPPORT; margin 292 s |
| Moore | 17,18 | [1744,1840] | (16.531755057978962,12.457570979247398) -> (15.212156993678740,14.185565889299978) | No ESC TIME column | COLUMN_UNAVAILABLE / numeric Analysis N/A |

Thus every Source segment exists without clamping, and each ESC segment's
two endpoint filter supports are comfortably full by the existing +/-40 s
rule. Production's half-open containing-segment rule is compatible; no probe
is on a knot. Do not treat API fallback zero as support evidence.

**Dumas Source local shear is exactly zero at this chosen segment.** Its Source
numerical T1 is therefore zero despite nonzero grad(w). This is a supported
zero, not INVALID CONTROL or an excuse to tune the probe height. It does not
predict zero Analysis T1: filtered endpoint values are separate. Other Source
segments supply nonzero environmental operands. No material/sign requirement
belongs in E1. Analysis amplitude or sign is not a prerequisite of probe validity.

At y=1750 upper outflow and near-ground outflow are outside their envelopes
and sample zero; updraft, rotation, inflow and downdraft remain meaningful.
Record all six operands and their presence, including legitimate zeros. The
minimal set tests C placement and total composition, not every storm operand
throughout its vertical envelope. Do not add heights solely to activate every
field or claim full vertical validation from these two probes. This probe set and its support/geometry rationale are **FROZEN** by the human
scientific review. No extra grid or probe is authorized merely to activate
every storm operand.

## 6. E1 assertion matrix and independence

Every check has an explicit reference class: frozen literal (FL), independent
endpoint/raw-data arithmetic (EA), coordinate identity (CI), operand
reconstruction (OR), support/identity equality (SI), or explicitly limited
production-vs-production consistency (PP). No PP-only check supplies the
independent physics oracle for a group.

### E1-A — Source/environmental invariants

Once per case, record the exact Source record identity/coverage, fixture hash,
full ordered knot height/wind snapshot, q0/q1, Delta q, layer shear and omega,
and ground-relative hodograph points. Compare production knot samples and
hodograph geometry to the raw committed knots (FL/EA/SI); this exercises the
data-to-profile path. At supported endpoints compare to frozen interpolation
values, and compare production finite-layer shear/omega to
(Delta_u,Delta_v)/2500 and (-Delta_v,Delta_u)/2500 (EA).

For each member, check that the context holds the intended case Source and
storm operands, and re-read endpoint q and finite-layer diagnostics after its
advection calls against the independent case references. Compare a newly
obtained full knot/hodograph snapshot after each member to the immutable raw
case snapshot; store one snapshot plus per-member equality/digest evidence,
not five copies of thousands of knots. This detects mutation/C contamination.
Never compare a cached object to the same cached object or count repeated
case-level calculations as separate independent validations. Include an
after-sweep integrity check so a final member cannot leave silent mutation.

### E1-B — Storm-relative wind translation

For q_ref, q0 and q1, check `stormRelativeWind` against frozen q-C (FL/EA),
including unchanged zero vertical component. At the two endpoint heights
also sample the **actual environmental adapter** at (0,h,0), t=0, checking
world components directly as (q_e-C_e,0,-q_n+C_n), then separately check the
production world/atmospheric conversion against manual mapping (CI).

For each non-baseline member compare the adapter's endpoint difference from
C0 with (-deltaC_e,0,+deltaC_n); compare reference-flow differences likewise
in atmospheric coordinates. DeltaC is the stored C minus stored C0, not a
rounded table displacement. Its relation to the frozen p/r is independently
checked in preflight with the documented binary64 distinction. The reference
mean is a vector input, not a new synthetic profile or a claim that q(h_mid)
equals q_ref. Endpoint samples add real interpolation/adapter wiring coverage;
no other translation height grid is required.

### E1-C — Source SRH response

Call `stormRelativeHelicityBetween(profile,C,500,3000)` once for each of the
20 members during a future authorized collection. Record absolute SRH(C0)
once per case and its immutable link/value on every row, plus absolute SRH(C),
measured difference, frozen expected difference, residual and both normalized
responses using frozen Q. Absolute SRH is evidence only, not a preregistered
absolute prediction.

The oracle is exclusively frozen endpoint arithmetic:
F(deltaC)=deltaC_e*Delta_v-deltaC_n*Delta_u, algebraically 0,0,0,+Q/2,-Q/2
for the five intended members. Compare the measured response with the frozen
expected value (FL/EA), not a determinant recomputed from measured endpoints.
Retain the small recovered-C rounding residual as input evidence, never use
it to recenter the frozen expected value. Do not call production SRH from the
oracle, integrate the hodograph, reproduce its segment accumulator, or derive
an expectation from an absolute measured SRH.

C0 minus itself is an algebraic reference row, **not an independent PASS test**;
mark that difference assertion N/A `BASELINE_REFERENCE`, while retaining its
zero response and other applicable checks. There are 16 nontrivial SRH-difference
assertions. Right-pair/parallel-pair symmetry may be reported as dependent
corroboration, not additional independent evidence or a substitute for the
four member residuals. No sign of absolute SRH is prescribed.

### E1-D — finite-layer flow-relative decomposition

Use the production finite-layer omega already checked in E1-A and the actual
member-specific reference wind already checked in E1-B. For each member
independently form s=(u_sr,v_sr)/speed and c=(-v_sr,u_sr)/speed from frozen
reference inputs (EA). Check orientation, orthonormality and equality of the
basis recorded by the member pipeline to this basis. The production decomposition
API returns only two projections, not a basis, so the recorded basis is an
explicit test-only quantity, not an invented production return field.

Check each projection against the independent dot products of the fixed
finite-layer omega with s/c, and reconstruct omega as omega_s*s+omega_c*c
from the **production projections** and the independent basis (OR). Check its
components and squared magnitude against the original omega. This would catch
an accidentally reused baseline wind/basis even when a stale basis and stale
projections reconstruct one another. Simply reconstructing from the same
incorrect basis would not suffice. No per-component sign or monotonic ordering
is required; basis changes are tested by their explicit C-dependent formula.

Freeze **EXACT-ZERO-ONLY DOMAIN POLICY for this E1 matrix**: no nonzero
conditioning cutoff. The frozen minimum
speed is 5.8202943903637792 m/s and roundoff direction sensitivity is small
(wind error scale divided by this speed). Exact-zero alone is mathematically
undefined. Record speed and 1/speed as conditioning evidence; no 1 m/s flag
is needed for this fixed matrix. The owning protocol's proposed 1 m/s threshold
remains **NOT FROZEN and NOT USED by E1**. No epsilon replacement or matrix
retuning is permitted. If speed is exactly zero, record its reciprocal as null
with an undefined-domain reason rather than numeric Infinity.
If exact zero unexpectedly occurs, stop the affected basis checks, mark them
INVALID CONTROL, retain numeric-null evidence, and investigate the disagreement
with frozen reference flow. No fallback direction and no matrix alteration.

### E1-E — actual fixed-point composition

At P1/P2 and t=0 for each member, retain every named operand's sampled vector,
the actual composite sample, independent ordered operand sum, point/context
identity and actual constructor C. Confirm storm operands/parameters/point/time
are identical and their samples agree with the retained C0 context (SI/PP).
This equality is a prerequisite, not the oracle for the total C response.

For non-baseline members, compare total world differences with
(-deltaC_e,0,+deltaC_n), and atmospheric differences with
(-deltaC_e,-deltaC_n,0) (CI). Use manual component mapping as the reference;
do not validate a coordinate transform by running its own inverse. C0 retains
absolute composition/sum checks; C0 self-difference is N/A `BASELINE_REFERENCE`.
The frozen non-baseline vectors all differ from C0, so a hidden DEMO-C fallback
produces zero measured response where the independent oracle is nonzero.

### E1-F — useful same-point T1 evidence

An isolated C-independent T1 function is not retested five times as five new
physical invariants. Instead validate the **member record's actual context**:
same P/t, Source or matching Analysis column, containing segment and support,
same updraft instance/geometry, and unchanged independently obtained omega
and grad(w). Retrieve a fresh actual diagnostic in that context and verify
its local operand identity. Cache only immutable independent case/probe
references; do not populate all actual member results by copying C0's T1.

For Source, calculate local slope directly from the raw bracket winds/heights
in §5, independently of `verticalWindShearBetween` and
`soundingSegmentContainingHeight`. Map it manually to world
omegaX=-Delta_v_segment/Delta_h_segment,
omegaZ=-Delta_u_segment/Delta_h_segment. Compute grad(w) independently from
the pinned Gaussian/envelope parameters and P, without calling production
T1 or its gradient method (EA/CI/OR). Compare the production gradient to that
gradient and `DiagnosticTiltingTendency.sample` to the independent dot product.
Compare its selected segment to the raw bracket, not only to another wrapper
of its own segment selector.

For ESC Analysis, retrieve the two **filtered column.profile endpoint winds**
separately at the independently established segment heights. Form local omega
by endpoint subtraction/division and manual world mapping; do not obtain the
oracle omega from `queryAnalysisTiltingExplanationAt` or the same native-vorticity
query it calls. Use the independent prescribed-gradient formula, then compare
the actual Analysis explanation's omega, gradient, segment, support and T1
against those references. Independent TIME support arithmetic supplies the
FULL_SUPPORT expectation. Calling the scalar Analysis T1 alias in addition to
the explanation adds no independent evidence and is unnecessary.

This validates T1 arithmetic/routing on the existing Analysis representation,
**not the filter's observational accuracy or independently reconstructed
filtered winds**. The filter output is a deliberately shared input; it is not
silently presented as a second independent wind dataset. Source/Analysis T1
have separate labels and are not expected to agree.

For Moore, require the actual Analysis query with null column to return
COLUMN_UNAVAILABLE, record N/A/null numerical Analysis evidence and never
substitute Source T1. Correct unavailability is an applicable SI check; numeric
Analysis T1 assertions themselves are N/A, not manufactured PASS results.
With two probes there are 40 Source T1 evidence records, 30 applicable ESC
Analysis records and **10 Moore numeric-Analysis N/A records**. No sign reversal,
material threshold or trajectory diagnostic enters these checks.

## 7. Frozen independently justified numerical tolerances

All values/rules in this section are **FROZEN** by human scientific review.
They are numerical-comparison tolerances, not observational uncertainty,
physical thresholds or material-sign thresholds. They are not inherited from
H1–H5 and must not be adjusted to fit measured residuals. Every numeric assertion first rejects
nonfinite values; NaN/Infinity must never serialize as a misleading numeric null.

Use unit roundoff u=2^-53=1.1102230246251565e-16, distinct from
Number.EPSILON=2^-52. Define gamma_n=n*u/(1-n*u). Componentwise absolute bounds
avoid relative-error instability near legitimate zero values. Metadata, IDs,
support, member order and copied frozen C values require exact equality, not
a tolerance. Canonical signed zero may be normalized as specified in the
arithmetic protocol; no other change to a frozen value is allowed.

| Category | Frozen rule | Independent scale/rationale |
| --- | --- | --- |
| A: frozen-input reconstruction | Exact binary64 equality for hashes/IDs, raw knots, q0/q1, Delta q, Q, q_ref, C and literal response transcription using §13 operation order; for derived hypot audit only, <=8u*max(1 m/s, expected speed) | Basic arithmetic order is fixed; hypot is not used to construct C or Q. A last-bit hypot difference is not license to alter C. Expected/actual reconstruction fields remain distinct |
| B: wind/velocity identities | Absolute <=1e-11 m/s per component, including speed evidence | At used heights Source+C scales are <55 m/s and total per-component scale <100 m/s; 128u*100 is 1.43e-12. Seven-term composition plus differencing and mapping stays below the frozen rounded-up allowance |
| C: finite-layer shear/omega | Absolute <=1e-14 s^-1 per component | Endpoint subtraction/division spans 2500 m, winds <20 m/s; 128u*(40/2500) is <2.3e-16 s^-1 |
| D: basis / decomposition | Basis unit/orientation/orthogonality residual <=1e-12 dimensionless; projection and reconstructed omega components <=1e-13 s^-1; squared-magnitude residual <=1e-15 s^-2 | Minimum reference speed >5.8 m/s, finite-layer omega norm <0.0061 s^-1. Normalization/dot/reconstruction use short operations; allowances exceed their roundoff and propagated finite-layer/input scales, while remaining far below component scales |
| E: local T1 operands | Local Source/Analysis omega <=1e-12 s^-1; gradient <=1e-15 s^-1; T1 dot residual <=1e-12 s^-2 | Segment width >=4.3 m; filtered component bound <51 m/s (below); independent gradient magnitude <0.0046 s^-1 per component. Operand-error propagation, not material/sign significance, sets the T1 bound |
| F: SRH difference | Absolute <=1e-6 m²/s²; normalized check uses the same bound divided by frozen Q | Conservative independent forward-error estimate below is <8.10e-8 m²/s² for every case/member pair; threshold is >12 times this bound and <1.5e-8 of the smallest perpendicular signal |

For category B, |r exp(-r²/(2 sigma²))| <=sigma*exp(-1/2).
DEMO rotation therefore contributes at most about 12.14 m/s horizontally,
lower inflow at most 3.04 m/s, and upper/near-ground outflow vanish at P1/P2.
Updraft and downdraft absolute vertical sum is <=50 m/s. These static parameter
bounds, together with the audited Source and frozen C magnitudes, justify the
100 m/s envelope; no total field was sampled to select it. Exact repeated
state identity and numerical velocity equality are different assertions.

The static kernel L1 norm is 1.1368764528541946. Full Source component maxima
for Goshen/Prospect/Dumas are 44.7, 23.6 and 39.4 m/s, yielding conservative
Analysis component bounds 50.8184, 26.8303 and 44.7930 m/s. TIME interpolation
is convex and mirror padding copies samples; coefficient absolute sum bounds
the filter without applying it. Allow 51 m/s in the local slope error estimate.
Slope endpoint subtraction/division roundoff with width >=4.3 m is below
1e-12 s^-1 by a generous short-operation bound. The resulting deliberately
loose local omega magnitude envelope is 2*51/4.3 <24 s^-1 per component;
it is a bound, not an inferred environmental vorticity.

Propagating tau_omega=1e-12 and tau_gradient=1e-15 through a two-term dot gives
at most sum(|g_i|*tau_omega+|omega_i|*tau_gradient), plus small product/sum
roundoff, below 1e-12 s^-2 even with those conservative magnitude envelopes.
The gradient allowance covers short arithmetic and ordinary binary64 sin/exp
library errors at the fixed benign arguments; it is an engineering numerical
allowance, not a theorem that JavaScript transcendental functions are exactly
rounded. Runtime/version is recorded, and unexplained excess stops review
rather than loosening the rule. This is separate from filter correctness and
from any observational uncertainty. No T1 material threshold is introduced.

### SRH accumulation audit without SRH evaluation

The production routine creates [h0, interior knots, h1] and adds one
`ub*va-ua*vb` term per interval, after subtracting C at both ends. There is no
compensated summation. To estimate error **without computing a single signed
segment contribution or accumulating an SRH**, bound the products instead.

For each case use maxima over the layer's raw knots plus independently
interpolated endpoints, and all five frozen C vectors:

```text
N = interior-knot count + 1
U = max_layer |u| + max_members |C_e|
V = max_layer |v| + max_members |C_n|
A = 2*N*U*V
```

Each absolute term is <=2UV; therefore sum of absolute contributions <=A,
even if the signed sum cancels. This is conservative but avoids using either
the production SRH result or a duplicate full-hodograph integral as a tolerance
oracle. Component interpolation is linear, so extrema over the layer occur
at its included vertices. There are 406/506/530/20 intervals, not 20 times that
many terms in a single SRH accumulation.

The reviewed independent pre-run residual-error estimate for one member minus C0:

```text
K = 64*u*(Q + 10*(|Delta_u|+|Delta_v|) + 1)
B = 2*gamma_(N+16)*A + gamma_3*(2*A) + K
```

In K, 10 has units m/s and 1 has units m²/s². The two gamma_(N+16) terms bound
the two independent SRH evaluations, including accumulation and a conservative
16-operation allowance for endpoint interpolation, C subtraction and term
arithmetic. Denominator/height subtractions are well-conditioned here; endpoint
brackets and the production order are pinned. The gamma_3 term covers final
differencing/rounding with |SRH|<=A. K covers endpoint-oracle and stored-C
rounding at the frozen endpoint scales, including the known Moore right_plus
1.42e-14 discrepancy between intended and recovered displacement. All inputs
are finite, normal binary64 values with no overflow/underflow concern at these
scales. This is a deliberately conservative numerical estimate, not a fit to
observed residuals or an observational error bound.

| Case | N | U (m/s) | V (m/s) | A (m²/s²) | B rounded upward (m²/s²) | Frozen perpendicular signal magnitude (m²/s²) |
| --- | --- | --- | --- | --- | --- | --- |
| Goshen | 406 | 24.700000000000003 | 16 | 320902.4 | 3.03e-8 | 71.240000000000009 |
| Prospect Valley | 506 | 26.25 | 23.65 | 628262.25 | 7.33e-8 | 113.16624543738661 |
| Dumas | 530 | 26.145833333333336 | 23.945833333333333 | 663648.7934027779 | 8.10e-8 | 89.776736111111106 |
| Moore | 20 | 34.00066329929094 | 22.373516896696216 | 30428.576593022593 | 2.67e-10 | 108.04130791631081 |

The unrounded largest B is 8.090302826689316e-8, leaving a factor 12.3604 to
the frozen 1e-6 absolute tolerance. The smallest nonzero expected signal is
71.24 m²/s². Thus 1e-6 is independently defensible here, although it happens
to equal the earlier candidate. Do not claim it was accepted merely because
H1/H2 used it. The full-input maxima, counts and estimates are pre-run design
arithmetic; no actual SRH(C), measured DeltaSRH or observed residual was evaluated.

If a future code/fixture/geometry revision breaks these assumptions, stop
preflight and review a new bound before execution. Do not expand a tolerance
from measured errors. Normalized residual is residual/Q with tolerance 1e-6/Q,
not a separate opportunity to weaken the test. Mathematical zero, binary64
zero and tolerance-based agreement must be labeled separately.

## 8. Evidence schema and deterministic output

Freeze one deterministic versioned JSON evidence organization, emitted as an object emitted before any runner
assertion, including a blocked/partial object when collection stops. Use fixed
case/member/probe/group/check order, explicit field names (no Object.values
coordinate inference), stable numeric serialization and explicit units. Record
the runtime and Git provenance; exclude wall-clock timing from scientific
comparison. No automatic writes to research Results or Conclusions. Future
stdout artifact capture requires the separately authorized execution workflow.

| Record | Required content |
| --- | --- |
| Run header | Stage E1; run state (PREFLIGHT_BLOCKED/PARTIAL/COMPLETE); runtime HEAD, implementation-reviewed SHA and input baseline SHA; protocol/spec/schema versions and matrix ID/digest; four Source hashes; three TIME hashes and transform/kernel identity/hash; layer/C0/alpha; all tolerance IDs/values/units; exact probe definitions and storm-only parameter snapshot; guard state and assertion applicability manifest |
| Case header | Stable case ID, full Source record identity/datum/coverage; normalized fixture path/hash; ordered-knot/hodograph snapshot or lossless artifact reference; Source and Analysis availability/identity; frozen versus actual q0/q1/Delta q/Q/q_ref/shear/finite-layer omega; exact source/Analysis segment/support expectations at P1/P2 |
| Member | Case/source/member IDs, immutable case-context ID, exact frozen and passed C, baseline C, layer, Analysis applicability; frozen/actual reference V_sr and speed; SRH baseline/current/difference/expected/residual/normalized values; decomposition basis/projections/reconstruction/magnitude evidence; both fixed-point operand/total vectors; separate Source and Analysis T1 operands/results/support; checks |
| Assertion | Stable id such as E1/case/member/group/probe/quantity; source/case/member provenance or explicit case-level scope; applicability APPLICABLE/N_A and reason; reference class FL/EA/CI/OR/SI/PP; expected rule/value, actual, signed residual, tolerance ID/value/units, provisional scientific status and review reason |
| Summary | Counts by assertion/group/case/member for PASS/INVALID CONTROL/UNEXPLAINED/FAIL; separate N/A counts/reasons; case-level checks counted once; completeness and blocked/uncollected counts; no single aggregate PASS erasing mixed statuses; human-review status distinct from runner outcome |

Every member row includes the required Source identity, C0, layer and Analysis
applicability even when full immutable case data is referenced. Numeric unavailable
values are null with a typed reason; nonfinite numeric faults are explicit
errors, not coerced null. The applicability manifest identifies dependent
baseline self-differences and the 10 Moore numeric-Analysis records separately.
Counts distinguish unique case/probe operand references from per-member context
checks; repeated invariant output does not inflate independent evidence.

The freeze's four Source hashes still match current committed inputs. Additional
design-audited committed-byte hashes for Analysis provenance are:

| Input | SHA-256 |
| --- | --- |
| `nssl1Goshen2155.retained-time.json` | `4101174b90769e6c53e0d9a987746e3a1aee6877b35494f4a0eeab9981637ace` |
| `nssl1ProspectValley222346.retained-time.json` | `d48e944d1886b04551ff543c4e64a00e7b4452ea1e63c692d6ba41a68abf96e5` |
| `nssl2Dumas215218.retained-time.json` | `43aa8dfe626a91ebe9ae4c96386cdd85b9f76e309c7626f978a05a6630134aba` |
| `escHrTimeHammingSincKernel.v1.json` | `8658c3069dadb45ef63793a2b08ede15ebea73de26bcab9cfafcbcd648f3cdcc` |

Hash equality is a provenance condition; it is not evidence of scientific
accuracy. Include the production transform/version and its implementation
revision, not just the kernel hash. No new smoothing/binning or IGRA transform
is proposed. An implementation fixture can exercise the serializer/summary
with hand-authored records; it must not populate these records by running
observed diagnostics during an ordinary test invocation.

## 9. Classification and stop rules

Keep run/preflight state separate from scientific assertion categories.
**Any frozen-input/provenance mismatch aborts E1 before scientific classification.**
Emit a PREFLIGHT_BLOCKED record with expected/actual identity and zero evaluated
scientific checks. Do not call it a physics FAIL or continue with corrected
inputs in the same run. Runtime guard violations similarly collect no science.

| Event | Required treatment |
| --- | --- |
| Fixture/hash/source ID, Spec C or passed C differs from frozen input; reviewed revision/config differs | Global preflight abort. No altered-input campaign or fallback. If detected later, preserve partial output as invalidated run and stop remaining collection |
| Raw Source layer/probe is unsupported | Preflight blocked before production science; absent required support is a setup/control problem. If production reports unsupported despite matching valid raw inputs, record E1-A UNEXPLAINED and halt dependent checks |
| Reference basis exact zero | Basis INVALID CONTROL with null projections; since frozen flow is nonzero, also retain the independent reference/wiring discrepancy as UNEXPLAINED. Stop that member's dependent decomposition checks; no fallback |
| ESC Analysis unexpectedly unavailable/out of domain/boundary conditioned | Mark required FULL_SUPPORT control INVALID CONTROL and status mismatch UNEXPLAINED; preserve actual status, halt numeric Analysis assertions for that member/probe. Do not relabel a conditioned value as full or silently substitute Source |
| Moore Analysis unavailable as expected | Availability SI check may PASS; numeric Analysis records remain N/A, not invalid Source/SRH controls |
| SRH residual exceeds frozen tolerance | E1-C UNEXPLAINED pending cause/oracle/input review; preserve absolute values and residual. No tolerance relaxation, repair run or downstream-stage authorization |
| T1 dot reconstruction or fixed-point velocity response disagrees | Respective assertion UNEXPLAINED with operand/context evidence; do not attribute it immediately to atmospheric physics or suppress it because other groups pass |
| Nonfinite result or exception | Technical/control error plus applicable UNEXPLAINED record; stop dependent computation. Emit partial evidence before failing the runner |

PASS means an applicable assertion meets its reviewed rule with valid inputs,
support and provenance. INVALID CONTROL means a prerequisite is unavailable;
it does not erase a separate discrepancy. UNEXPLAINED is the initial outcome
for an unexplained structural/algebraic mismatch. FAIL requires human review
establishing a valid control and isolated violated identity with no unresolved
setup/oracle explanation. Preserve initial records and attach the reviewed
classification; never overwrite the evidence to make a runner pass.

Freeze the bounded partial-evidence policy: collect other independent, valid E1 observations after a numeric
discrepancy so the 20-member review remains interpretable; skip only dependent
invalid calculations and retain uncollected/applicability reasons. This bounded
evidence collection is not permission to retune, rerun, repair or advance stages.
Global provenance/argument mismatch is the hard immediate stop described above.
After emitting the evidence, any unresolved/invalid required assertion fails
the runner gate. The test runner's success alone never closes scientific E1.
Human E1 closure must precede any separately authorized Lagrangian work.

## 10. Design-review gate history

**E1 IMPLEMENTATION DESIGN REVIEW — CLOSED · APPROVED.**
The three-file layout, arithmetic authority/cross-check, isolated selector,
lazy imports, option B composition, explicit literal storm-only snapshot,
P1/P2 probes, E1-A–F groups, exact-zero-only decomposition, numerical tolerances,
independent oracles, evidence organization and stop/partial-evidence rules are
all **FROZEN**. None remains a scientific design option to choose during coding.

Implementation contract ID: `observed-c-matrix-e1-implementation/v1`.
Evidence schema ID: `observed-c-matrix-e1-evidence/v1`.
The arithmetic matrix ID in §2 remains separate. These identify the frozen
document contract; no executable Spec/schema file has been created. The actual
future implementation-review SHA cannot exist until implementation and review;
record it at that later gate, never substitute design approval for code review.

1. Review and commit this documentation freeze before starting implementation.
   This task neither commits nor begins implementation.
2. After that condition is satisfied, implement the frozen E1 test-only contract
   and infrastructure fixtures in the three approved files, then **STOP FOR
   IMPLEMENTATION REVIEW**. Do not run observed E1 collection as infrastructure
   verification or as part of that next action.
3. Actual implementation review must examine the unique literal transcription,
   all 36 expected-versus-actual storm parameters, constructor C arguments,
   lazy imports/no-stage behavior, immutable contexts, probe/tolerance values,
   independent oracle dependencies, N/A counts and bounded stop rules.
4. Implementation review closure must precede **separately authorized E1
   execution**. E1 and Lagrangian execution remain NOT AUTHORIZED. E1 scientific
   closure must precede any Lagrangian stage.
5. This docs-only task authorizes no tests, typecheck, build or campaign run.
   Later infrastructure verification must stay within its authorized scope and
   cannot invoke E1 or H1–H5. No tolerance/input/control retuning is permitted.

Future infrastructure fixtures should use small hand-authored inputs to check
unknown/conflicting selectors, changed hashes/C, independent sign/coordinate
oracle, stale-baseline basis, missing/mislabeled Analysis, mixed-status summaries
and output-before-runner-failure behavior. They must not call the observed
collector or build filtered observed columns on ordinary import. Reusing a
frozen H-stage just to verify E1 infrastructure is not permitted.

## 11. Exact files inspected in this design slice

Source files were read, not imported/executed. Harness inspection covered its
guard, input, Eulerian, oracle, formatting and classification sections plus
test/helper declarations; no H1–H5 result artifact was opened or modified.

- `docs/PROJECT_STATUS.md`
- `docs/research/2026-09-12-observed-c-matrix-protocol-design.md`
- `src/validation/README.md`
- `src/validation/stormMotionSensitivity.validation.test.ts`
- `vitest.config.ts`
- `package.json`
- `src/app/goshenObservedEnvironment.ts`
- `src/app/exploreEnvironmentRepresentations.ts`
- `src/app/composeDemoTracerSimulation.ts` (field-composition section)
- `src/scenario/DEMO_SCENARIO.ts` (environment/storm parameter sections)
- `src/scenario/createUpdraftField.ts`
- `src/scenario/createRotationField.ts`
- `src/scenario/createLowerRadialInflowField.ts`
- `src/scenario/createUpperRadialOutflowField.ts`
- `src/scenario/createDowndraftField.ts`
- `src/scenario/createNearGroundRadialOutflowField.ts`
- `src/core/fields/CompositeVelocityField.ts`
- `src/core/math/AtmosphericVelocity.ts`
- `src/physics/environment/EnvironmentalWindProfile.ts`
- `src/physics/environment/EnvironmentalWindField.ts`
- `src/physics/environment/StormRelativeEnvironmentalAdvectionField.ts`
- `src/physics/environment/stormRelativeWind.ts`
- `src/physics/environment/stormRelativeHelicity.ts`
- `src/physics/environment/verticalWindShear.ts`
- `src/physics/environment/horizontalVorticity.ts`
- `src/physics/environment/streamwiseCrosswiseVorticity.ts`
- `src/physics/environment/hodograph.ts`
- `src/physics/diagnostics/DiagnosticTiltingTendency.ts`
- `src/physics/storm/VerticalEnvelopeUpdraftField.ts`
- `src/physics/storm/VerticalEnvelopeRotationField.ts`
- `src/physics/storm/LowerRadialInflowField.ts`
- `src/physics/storm/UpperRadialOutflowField.ts`
- `src/physics/storm/NearGroundRadialOutflowField.ts`
- `src/physics/storm/VerticalEnvelopeDowndraftField.ts` (sampling section)
- `src/data/escHrTimeAnalysis/analysisQuery.ts`
- `src/data/escHrTimeAnalysis/analysisTiltingQuery.ts` (explanation/scalar query sections)
- `src/data/escHrTimeAnalysis/constants.ts`
- `src/data/escHrTimeAnalysis/classifyAnalysisSupport.ts`
- `src/data/escHrTimeAnalysis/createEscHrTimeAnalysis.ts`
- `src/data/escHrTimeAnalysis/reconstructUniformTimeGrid.ts`
- `src/data/escHrTimeAnalysis/convolveHalfSampleMirror.ts`
- `src/data/escHrTimeAnalysis/escHrTimeHammingSincKernel.v1.json`
- `src/data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json`
- `src/data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.retained-time.json`
- `src/data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.normalized.json`
- `src/data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.retained-time.json`
- `src/data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.normalized.json`
- `src/data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.retained-time.json`
- `src/data/igra/fixtures/ounMoore20130520.normalized.json`

Static arithmetic read committed blobs at the design HEAD and the frozen
§13 C literals. It counted intervals, bounded layer wind/C maxima, read native
probe brackets/TIME supports, summed absolute kernel coefficients and applied
the gamma_n estimate. It did not compute signed SRH contributions, a full
hodograph integral, production T1, Analysis filtered winds or composite samples.
No helper script or implementation/test file was saved.

## 12. Design handoff and authorization gate

| Required handoff item | Frozen contract / reference |
| --- | --- |
| A. Minimal file set | Three E1-only siblings, Spec/collector/guarded validation entry (§2) |
| B. Probe set | P1=(2000,1750,4000), P2=(-4000,1750,2000), t=0; geometry-relative, independently supported (§5) |
| C. Assertion matrix | E1-A through E1-F; case-level immutable evidence versus member-level routing and direct response explicitly separated (§6) |
| D. C seam | Existing Source EWP -> EnvironmentalWindField -> explicit frozen-C adapter -> same six fixed DEMO operands; no simulation/composer override (§4) |
| E. Independent oracles | Frozen endpoint arithmetic for SRH; manual coordinate mapping; independent raw/filtered-endpoint slopes and analytic gradient for T1; independent reference basis for decomposition (§6) |
| F. Tolerances | Separate dimensional categories; SRH tolerance 1e-6 accepted from the independent <8.10e-8 conservative error estimate; all numerical categories frozen (§7) |
| G. Evidence | Versioned deterministic JSON with complete case/member/probe provenance, raw/expected/residual/tolerance/status and separate N/A counts (§8) |
| H. Stop/classification | Preflight abort on provenance/input mismatch, typed invalid support, provisional UNEXPLAINED for discrepancies, human-reviewed FAIL and closure (§9) |
| I. Remaining gates | Implementation review CLOSED · APPROVED at c54f885; separately authorize the first E1 scientific execution |

Implementation is COMPLETE; implementation review is CLOSED · APPROVED for
c54f885. The next gate is **separate authorization of the first E1 scientific
execution against reviewed implementation SHA c54f885**. Execution remains
NOT AUTHORIZED. E1 must close before any Lagrangian stage.

```text
E1 ARITHMETIC INPUTS — FROZEN
E1 IMPLEMENTATION DESIGN REVIEW — CLOSED · APPROVED
E1 IMPLEMENTATION CONTRACT — FROZEN
E1 IMPLEMENTATION — COMPLETE
E1 IMPLEMENTATION REVIEW — CLOSED · APPROVED
E1 IMPLEMENTATION REVIEWED SHA — c54f885
E1 EXECUTION — NOT AUTHORIZED
LAGRANGIAN STAGE — NOT AUTHORIZED
```

The earlier design-freeze closure changed only this design document, `docs/PROJECT_STATUS.md` and
review-status/navigation text outside §13 in the owning observed protocol.
The arithmetic protocol §13, all 20 C vectors, production code, tests/harness,
UI/ScenarioConfig, H1–H5 records and parent §12 Conclusions are untouched. No tests, typecheck, build, simulation or
campaign ran; no commit or push occurred. Existing untracked `h4-output.txt`
and `h5-output.txt` are untouched. The current closure changes only this document and `docs/PROJECT_STATUS.md`;
no tests/build/typecheck/simulation/campaigns, commit or push were performed.
**STOP FOR REVIEW-CLOSURE CHECK.**
