# Trajectory Tilting Explorer V1

**Status:** ARCHITECTURE ACCEPTED /
CONTRACTS SPECIFIED /
SLICES A–F IMPLEMENTED / ACCEPTED /
CAL COMPLETE / ACCEPTED V1 /
LANDING INTEGRATION SLICES I1–I3 IMPLEMENTED / ACCEPTED /
FEATURE V1 INTEGRATED / COMPLETE except deferred G /
SLICE G NOT STARTED / DEFERRED / NOT AUTHORIZED
**Acceptance:** scientific/semantic review passed.
Alignment-degeneracy, terminal-identifiability, and
color-CAL dependency amendments are incorporated.
Slices A–F (atomic Analysis explanation query;
recorded-path diagnostic projection;
renderer-facing value/support encoding;
historical-probe 3D mechanism glyph;
numeric verification / provenance readout;
ephemeral what-if alignment) are
IMPLEMENTED / ACCEPTED. Landing Integration Slice I1
(Analysis diagnostic sibling beside Source EWP at the
Explore/App data boundary) is IMPLEMENTED / ACCEPTED.
Landing Integration Slice I2 (Analysis T1 overlay along
recorded Explore trajectories) is IMPLEMENTED / ACCEPTED.
Landing Integration Slice I3 (exact historical probe
→ Slice A explanation → Slice D glyph + Slice E
verification + Slice F what-if) is IMPLEMENTED / ACCEPTED.
Feature Architecture 62 V1 is INTEGRATED / COMPLETE
except explicitly deferred Slice G. Slice G remains
NOT STARTED / DEFERRED / NOT AUTHORIZED. Numeric
`T1_COLOR_SCALE_V1` display saturation is
ACCEPTED V1 (`|T1|_sat = 6.100×10⁻⁵ s⁻²`).
`|T1|_ε` is not part of V1. Explore I3 injects
`ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1` as presentation
wiring; the production meters-per-`s⁻¹` freeze remains
OPEN (§23 item 4). BOUNDARY typed support is visible in
the verification UI; trail visual distinction from FULL
remains OPEN (§23 item 5).
**Scope:** scientific UX, diagnostic authority, encoding, and
slice boundaries for Trajectory Tilting Explorer V1.
Not a T1 physics reopen. Not `TILT_Y,total`. Not `I_tilt`.
Not Analysis rewiring into advection. Not a change to
`DiagnosticTiltingTendency.sample`. Not a historical-picking
redesign. Not a V1 product reopen.
**Physics:** T1 identity remains `22`. Analysis T1 validity
remains `61`. Trajectory-diagnostic taxonomy remains research
`2026-08-29-vorticity-budget-honesty-and-trajectory-diagnostic-boundary.md`
(BL-047). This file consumes those records; it does not
replace them.
**Implementation:** Slice A is implemented in
`src/data/escHrTimeAnalysis/analysisTiltingQuery.ts`.
Slice B is implemented in
`src/data/escHrTimeAnalysis/trajectoryTiltingProjection.ts`.
Slice C renderer capability is implemented in
`src/data/escHrTimeAnalysis/trajectoryTiltingRenderEncoding.ts`
and `src/rendering/trajectoryTiltingOverlay.ts`.
Slice D glyph capability is implemented in
`src/data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.ts`
and `src/rendering/trajectoryTiltingGlyph.ts`.
Slice E numeric verification capability is implemented in
`src/data/escHrTimeAnalysis/trajectoryTiltingVerification.ts`,
`src/ui/tracer/formatTrajectoryTiltingVerification.ts`,
and `src/ui/tracer/TrajectoryTiltingVerificationPanel.tsx`.
Slice F what-if capability is implemented in
`src/data/escHrTimeAnalysis/trajectoryTiltingWhatIf.ts`,
`src/rendering/trajectoryTiltingWhatIfGlyph.ts`,
and `src/ui/tracer/TrajectoryTiltingWhatIfPanel.tsx`.
CAL V1 is implemented in
`src/data/escHrTimeAnalysis/t1ColorScaleV1.ts`.
Landing Integration Slice I1 is implemented in
`src/app/exploreEnvironmentRepresentations.ts` and
`src/app/createExploreLab.ts`: one Explore identity
selects Source EWP for advection and the matching
Analysis sibling, or `null` (Moore / Demo). SOURCE
ADVECTS. ANALYSIS EXPLAINS. Landing Integration Slice I2
is implemented in
`src/explore/encodeExploreAnalysisTilting.ts`,
`src/ui/tracer/TracerViewport.tsx`, and
`src/rendering/TracerScene.ts`: recorded history +
Analysis column + prescribed updraft → Slice B →
Slice C encoding with `T1_COLOR_SCALE_V1` → Analysis T1
overlay. Landing Integration Slice I3 is implemented in
`src/explore/resolveExploreHistoricalAnalysisTilting.ts`,
`src/app/App.tsx`, `src/ui/tracer/TracerViewport.tsx`,
and `src/rendering/TracerScene.ts`: selected
`(tracerId, historyIndex)` → recorded `(P, t)` →
`queryAnalysisTiltingExplanationAt` → glyph / verify /
what-if. Slice G remains NOT STARTED / DEFERRED /
NOT AUTHORIZED.

Predecessor (not replaced):

```text
docs/research/2026-08-29-vorticity-budget-honesty-and-trajectory-diagnostic-boundary.md
docs/architecture/52-historical-path-probe-architecture.md
docs/architecture/61-analysis-tilting-validity-propagation.md
docs/architecture/60-analysis-consuming-diagnostic-support-contract.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
docs/architecture/19-shared-tracer-inspector.md
docs/rendering/14-tracer-path-history.md
docs/physics/22-diagnostic-tilting-tendency.md
```

Index (not SoT):

```text
docs/PROJECT_BACKLOG.md   BL-047, BL-048, BL-010
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING
NEW PROJECT DECISION
ANTI-CLAIM
OPEN
REJECTED
```

---

## 1. Status / scope

**NEW PROJECT DECISION.** This file is the architecture SoT
for Trajectory Tilting Explorer V1: a class B (Eulerian field
sampled along a recorded path) scientific UX surface.

It authorizes:

- an atomic Analysis T1 explanation result at the existing
  Analysis T1 authority boundary;
- a derived per-sample Analysis projection of recorded
  history;
- trajectory value/support encoding of that projection;
- a local 3D geometry glyph at a historical recorded sample;
- a numeric verify layer fed by the same atomic result;
- an ephemeral what-if alignment state that does not mutate
  the laboratory;
- production `T1_COLOR_SCALE_V1` display saturation
  (CAL COMPLETE / ACCEPTED V1);
- an Explore Analysis diagnostic sibling beside Source EWP
  (Landing Integration Slice I1 COMPLETE / ACCEPTED);
- an Explore Analysis T1 overlay along recorded trajectories
  (Landing Integration Slice I2 COMPLETE / ACCEPTED);
- an Explore historical-probe Analysis explanation
  (Landing Integration Slice I3 COMPLETE / ACCEPTED):
  exact recorded sample → Slice A → glyph + verification
  + optional what-if.

It does **not** authorize:

- live Analysis `V_env` rewiring (BL-010 remains PARTIAL);
- replacing Source / DEMO `DiagnosticTiltingTendency` in the
  existing Point Diagnostics panel;
- `TILT_Y,total`, `R_y` as a product diagnostic, or `I_tilt`;
- prognostic parcel vorticity;
- simulation rewind;
- interpolated historical tracer state;
- a default `ω_y,current` comparison;
- a first-slice `T1(t)` graph;
- `|T1|_ε` near-zero display band (not part of V1).

---

## 2. Scientific identity

**STILL-BINDING** (`22`, `61`, BL-047).

Primary diagnostic:

```text
T1 = T_tilt,y = ω_h,env · ∇_h Vy,updraft
              = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
```

Equivalent decomposition, used only as explanation of that
same product:

```text
T1 = |ω_h,env| |∇_h Vy| cos θ
```

when both magnitudes are strictly positive. Units: `s⁻²`.

Semantics:

```text
T1 is the exact vertical tilting term of the reduced
environment + prescribed-updraft mechanism
(strictly inside supported PWL segment conditions),
used as an isolated pedagogical diagnostic
inside the richer seven-operand laboratory.
```

Tracer meaning for this explorer:

```text
moving probe through mechanism geometry
NOT parcel acquiring / generated vorticity
```

**STILL-BINDING stronger research result (BL-047):**

For

```text
V_red = (V_env − C) + V_updraft
```

the reduced vertical vorticity identity is

```text
ω_y,red ≡ 0
```

and therefore pointwise

```text
R_y,red = −T1.
```

Exact reduced-field T1 therefore cannot be framed as
“adding spin” or “removing spin.” A displayed positive T1
is alignment of environmental `ω_h` with the prescribed
updraft gradient, not parcel spin-up.

T1 is **not**:

```text
full-field TILT_Y,total
Dω_y/Dt
Δω_y
vorticity gained by the tracer
parcel prognostic state
storm evolution
```

World map remains `22` / `61`:

```text
ω_x = omegaEastward
ω_z = −omegaNorthward
```

---

## 3. User question / UX goal

**NEW PROJECT DECISION.**

Primary question:

```text
Why does T1 at this recorded trajectory point
have this sign and this magnitude?
```

Learning sequence (required order; geometry first):

```text
SELECT TRACER
  → SEE T1 encoded along recorded trajectory
  → NOTICE interesting + / ~0 / − region
  → PROBE a real historical recorded sample
  → SEE local 3D geometry:
       environmental ω_h
       prescribed-updraft ∇_h Vy
       angle θ
  → UNDERSTAND sign / alignment
  → VERIFY exact numbers
  → OPTIONAL what-if alignment experiment
  → OPTIONAL separate comparison to existing prescribed rotation
```

UX principle:

```text
GEOMETRY TEACHES.
NUMBERS VERIFY.
```

This is not a dashboard-first tool. A temporal `T1(t)` graph
is not a V1 core requirement (§16). Existing Inspector
“Why this motion?” (seven-operand `V_total` decomposition)
remains a separate surface (`19`).

---

## 4. Non-goals

Out of this SoT:

```text
TILT_Y,total API or overlay
∫T1 / I_tilt
prognostic ω_y
ω → V
Analysis profile injected into advection / V_total
Source T1 as a peer user-selectable coloring
rewiring Point Diagnostics from DiagnosticTiltingTendency
to Analysis T1
hodograph Analysis overlay (BL-011 / BL-012)
simulation rewind / timeline scrubber
free 3D probe (rejected in 52)
interpolated historical (P, t)
diagnostic snapshots stored on PathHistorySample
per-trajectory or per-sounding color normalization
T1_COLOR_SCALE_V2+ / silent recalibration
|T1|_ε near-zero display band
default ω_y,current juxtaposition
first-slice T1(t) graph
Simulation / domain-clamp physics change
fixing historical Inspector live-active debt
```

---

## 5. Existing code facts from reconnaissance

**CURRENT FACT.** Verified against live `src/**` at the
architecture-authoring commit. Not restated as new physics.

### 5.1 Historical identity

```text
PathHistorySample = { position, simulationTime }
HistoricalPathProbe = { tracerId, historyIndex }
```

Picking: screen-space nearest stored sample
(`pickPathHistorySampleByScreenDistance`). No segment
interpolation. Glyph wins over path (`resolveTracerPointerUp`).
Selected `(P, t)` is the recorded sample
(`resolveHistoricalPathSample`).

Renderer: one `THREE.Line` per occupancy slot; position-only
`BufferGeometry`; single `LineBasicMaterial` color; trail
`raycast` disabled. Probe marker is a separate mesh.

### 5.2 Live diagnostics vs Analysis sibling

```text
advection V_total          Source/DEMO composite
                           (Explore observed = Source EWP;
                            Guided = DEMO EWP)
live Point Diagnostics T1  DiagnosticTiltingTendency.sample
                           → number; OOD sounding → 0
Analysis T1                queryAnalysisTiltingTendencyAt
                           headless; not wired in App / labs
```

`queryAnalysisTiltingTendencyAt` already computes world `ω_h`
and `∇_h Vy` locally, then returns scalar T1 plus
support / segment / provenance. Those two vectors are lost
on the public result.

### 5.3 Uncoordinated Analysis queries

At the same height, `queryAnalysisWindAt` and
`queryAnalysisNativeSegmentVorticityAt` / Analysis T1 can
legitimately differ in support (example: last FULL wind knot
is FULL for wind, BOUNDARY_CONDITIONED for native-segment
vorticity/T1). UI must not assemble an explanation from
independent queries.

### 5.4 Terminal clamp and active-flag debt

Terminal ground-crossing: accepted `P` is interpolated to
`y = 0` at fraction `α`; recorded `simulationTime` and
`particle.age` still advance a full `dt`. History has no
terminal/clamp flag.

`ResolvedHistoricalPathSample.active` is the **live**
particle flag, not recorded-at-sample activity.

---

## 6. Historical selection identity contract

**STILL-BINDING (`52`).** V1 preserves:

```text
click path
  → nearest stored sample within tolerance
  → HistoricalPathProbe { tracerId, historyIndex }
  → resolve recorded (P_i, t_i)
  → inspect / explain that sample
  → live tracer continues
  → no rewind
```

**NEW PROJECT DECISION.** A future click may geometrically
land between rendered polyline vertices. Semantic selection
**must** still resolve to a real recorded sample. The explorer
must not synthesize an interpolated historical tracer state
(`P(α)`, `t(α)`, or a virtual historyIndex).

The selected marker remains a historical probe, not
simulation rewind. Live glyph selection / Follow and the
historical probe stay conceptually distinct (`52`).

This file does not change picking policy, glyph-vs-path
priority, or probe clear rules (Reset / Clear / environment
switch / mode switch / invalid index).

---

## 7. Analysis diagnostic authority boundary

**NEW PROJECT DECISION.** Trajectory Tilting Explorer V1
consumes **Analysis T1**, at the existing `61` sibling
boundary, not live Source `DiagnosticTiltingTendency`.

Natural owner: the same Analysis T1 evaluation that already
forms

```text
world ω_h    ← queryAnalysisNativeSegmentVorticityAt
∇_h Vy       ← updraft.horizontalGradientOfVerticalVelocity
T1           ← ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
```

inside `queryAnalysisTiltingTendencyAt`
(`src/data/escHrTimeAnalysis/analysisTiltingQuery.ts`).

**ANTI-CLAIM.** Independently calling

```text
queryAnalysisWindAt
queryAnalysisNativeSegmentVorticityAt
updraft.horizontalGradientOfVerticalVelocity
```

from UI / React and combining them is not an atomic
explanation. Support/segment decisions can disagree.

The public scalar `queryAnalysisTiltingTendencyAt` contract
from `61` remains. V1 does not silently widen that scalar
result in a way that breaks `61`. The explanation result is
a sibling query at the same module/authority (§8).

Existing Point Diagnostics remain on
`DiagnosticTiltingTendency` until a separate SoT rewires
them. This explorer is a new surface, not that rewiring.

BL-010 remains PARTIAL. Holding an Analysis column as a
**diagnostic sibling** of the Source profile used for
advection is in scope for this explorer and is implemented
by Landing Integration Slice I1. Injecting that
column into `EnvironmentalWindField` / `V_total` / SRH /
hodograph scientific polyline is not. Sibling availability
is an Explore/App data-boundary concern (§22 I1). It is
not owned by the headless projection slice and is not
live `V_env` rewiring.

---

## 8. Atomic explanation contract

**NEW PROJECT DECISION.**

For a selected recorded sample `(P_i, t_i)`, all displayed
geometry and numbers of the explorer come from **one**
Analysis evaluation.

Proposed authority (names indicative; not implemented here):

```text
queryAnalysisTiltingExplanationAt(
  column: EscHrTimeAnalysisColumn | null | undefined,
  updraft: VerticalEnvelopeUpdraftField,
  position: Vec3,
  time: number,
) → AnalysisTiltingExplanationResult
```

Lives beside `queryAnalysisTiltingTendencyAt`. It performs
the same evaluation (same column, same native-containing
segment, same world map, same prescribed gradient). It does
not call uncoordinated public queries and stitch them.

### 8.1 Required ingredients on success

When status is `FULL_SUPPORT` or `BOUNDARY_CONDITIONED`:

```text
echoed identity
  position
  time

scalar
  tiltingTendency                 T1  [s⁻²]

vectors (world horizontal)
  worldHorizontalVorticity        { omegaX, omegaZ }  [s⁻¹]
  updraftHorizontalGradient       { dVyDx, dVyDz }    [s⁻¹]

derived from those same vectors
  omegaHMagnitude                 |ω_h|               [s⁻¹]
  gradientMagnitude               |∇_h Vy|            [s⁻¹]
  alignment                       see §8.3
  cosTheta, theta                 present only when
                                  alignment is DEFINED

support / validity / provenance
  status                          FULL_SUPPORT | BOUNDARY_CONDITIONED
  segment                         { hLo, hHi }
  provenance                      EscHrTimeAnalysisProvenance
  physicalIdentity / operand tokens as in 61
```

Core invariant:

```text
THE GEOMETRY THAT EXPLAINS T1
MUST BE THE SAME GEOMETRY
FROM WHICH THAT EXACT T1 WAS CALCULATED.
```

`tiltingTendency` on this result **must** equal
`queryAnalysisTiltingTendencyAt` at the same
`(column, updraft, position, time)` whenever both succeed.
`status`, `segment`, and `provenance` must match as well.

### 8.2 Failure

```text
COLUMN_UNAVAILABLE  { status }
OUT_OF_DOMAIN       { status, representation, provenance }
```

No `tiltingTendency`. No fake `0`. No vectors. No `θ`.

This is the `61` Analysis contract, not legacy Source T1
outside-sounding `0`.

### 8.3 Alignment validity

The pedagogical identity

```text
T1 = |ω_h| |∇_h Vy| cos θ
```

is defined **only** when both vector norms are non-degenerate.
It is not a universal rewrite of the authoritative product

```text
T1 = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
```

which remains defined (and is physical `0`) when either
vector is the zero vector.

This is not a rare corner. On the axis of the prescribed
radial updraft, `∇_h Vy = 0` by symmetry, so T1 = 0, but
`θ` is **not** 90°. The angle is undefined.

**Invariant:**

```text
T1 ≈ 0  MUST NOT  automatically imply orthogonality.
```

UI must never fabricate

```text
θ = 90°
cos θ = 0
```

when the normalization denominator `|ω_h| |∇_h Vy|` is
zero / degenerate.

#### Alignment states

On a supported (`FULL_SUPPORT` | `BOUNDARY_CONDITIONED`)
result, the atomic explanation carries an alignment state.
Names are indicative:

```text
ALIGNMENT_DEFINED
  both |ω_h| and |∇_h Vy| are non-degenerate
  θ ∈ [0, π] and cos θ are present
  T1 = |ω_h| |∇_h Vy| cos θ
  true orthogonality is this state with cos θ = 0

GRADIENT_DEGENERATE
  |∇_h Vy| degenerate, |ω_h| non-degenerate
  typical prescribed-updraft axis
  T1 is physical 0
  θ and cos θ are absent

OMEGA_DEGENERATE
  |ω_h| degenerate, |∇_h Vy| non-degenerate
  T1 is physical 0
  θ and cos θ are absent

BOTH_DEGENERATE
  both magnitudes degenerate
  T1 is physical 0
  θ and cos θ are absent
```

Absent means **not present** on the result: not `0`, not
`π/2`, not `NaN` displayed as a number. Glyph omits the
angle wedge. Verify layer omits `θ` / `cos θ` (or shows an
explicit undefined/degenerate alignment label). This is
distinct from `OUT_OF_DOMAIN` / `COLUMN_UNAVAILABLE`.

When `ALIGNMENT_DEFINED`:

```text
cos θ = (ω_h · ∇_h Vy) / (|ω_h| |∇_h Vy|)
T1    = |ω_h| |∇_h Vy| cos θ
```

Sign of T1 is the sign of the dot product. `θ` is not a
signed “spin” angle.

#### Magnitude degeneracy test

No ad hoc numerical ε is introduced here.

A vector is degenerate iff its world-horizontal magnitude
is exact `0` after the same signed-zero normalization
already used for T1 (`61`: `T === 0 ? 0 : T`) applied to
the two components, then `hypot`. That is the existing
IEEE / production zero contract, not a new tolerance.

Any future “effectively zero” band for alignment is
**OPEN**. It is not `|T1|_ε` (color scale, §13). A color
near-zero band must not be reused as θ-validity. If an
alignment ε is ever needed, it requires an explicit
calibrated contract. Slice A uses exact IEEE 0 after
signed-zero / hypot and does not invent an ε.

### 8.4 UI prohibition

UI / React / renderer must not independently:

```text
interpolate the environmental profile
calculate shear
calculate ω_h
convert atmospheric ↔ world vorticity
calculate the updraft gradient
calculate the dot product
calculate support
reconstruct provenance
derive θ from separately fetched vectors
fabricate θ or cos θ when alignment is degenerate
```

They may format and draw values supplied by the atomic
result / projection.

---

## 9. Source vs Analysis boundary

**NEW PROJECT DECISION.**

User-facing trajectory coloring **must** use Analysis T1.

Reason (BL-047 / `53` / `58` / `59`): local derivative
diagnostics on raw Source sounding are unstable due to
quantization / noise / native-level differentiation.

**REJECTED** as V1 primary UX:

```text
[ Source ] [ Analysis ]
```

as peer user-selectable coloring layers.

Source T1 is not an equal alternate user layer.

A later, explicitly labeled diagnostic/debug/research
comparison that demonstrates why raw differentiation is
unsafe is out of V1 primary UX. It is not authorized by
this file as a shipped control.

A future legitimate user layer choice may exist only among
multiple scientifically accepted **Analysis** representations.
That set does not exist in V1. V1 has one Analysis T1.

Live Point Diagnostics Source T1 remains a different
surface with a different operand and a different OOD
contract (`0` vs absent). This explorer must not present
those two numbers as interchangeable.

---

## 10. Analysis vs advection boundary

**CURRENT FACT.** Tracer advection uses the Source-based
(or DEMO) environmental operand inside `V_total`. The
Analysis profile is not live-rewired.

**NEW PROJECT DECISION.** UX language must describe:

```text
Analysis tilting diagnostic evaluated
at this recorded trajectory point.
```

The recorded path is the probe path. Analysis is sampled
**along** that path.

Forbidden wording and equivalents:

```text
this Analysis geometry pushed the tracer
this is the exact field that moved the tracer
the tracer gained this vorticity from T1
```

The seven-operand Inspector decomposition remains the
explanation of `V_total` motion (`19`). This explorer
explains Analysis T1 geometry, not advection.

---

## 11. Trajectory value encoding contract

**NEW PROJECT DECISION.**

Primary spatial representation: the recorded occupancy trail
plus an optional derived Analysis T1 overlay from the
projection (§20). Occupancy geometry and occupancy color
remain occupancy. T1 is not written into
`PathHistorySample`.

Semantic mapping (value channel only):

```text
warm     T1 > 0
neutral  T1 ≈ 0
cool     T1 < 0
```

Color encodes T1 value/sign only.

Forbidden labels on this encoding:

```text
spin-up / spin-down
gained rotation / lost rotation
strengthening / weakening ω_y
```

Magnitude **may** use diverging intensity, but only under
the frozen scale contract (§13). Intensity is not a
substitute for a calibrated threshold; that threshold is
OPEN.

Adjacent-sample T1 is **not** interpolated along a strip.
A `THREE.Line` occupancy trail with vertex colors would
blend neighboring T1 values and claim a diagnostic state
between recorded samples. Slice C does not do that.

Accepted overlay primitive:

```text
independent THREE.LineSegments
segment [P_i, P_{i+1}] exists only when both recorded
  samples have numeric Analysis T1 (FULL or BOUNDARY)
both visual vertices use sample i's signed-unit encoding
GPU interpolates identical endpoint colors
that is not interpolated T1 along the interval
```

Scientific meaning of a colored overlay primitive:

```text
The uniform color of a drawn value segment is the Analysis T1
of recorded sample i (the earlier endpoint). It is not T1
along the interval, not a material-step diagnostic, and not
the T1 that caused that displacement.
```

Visual gaps follow unsupported **recorded** samples. The
overlay does not invent a support-boundary intersection
between samples.

Picking remains discrete recorded samples (`52` / §6).
Overlay raycast is disabled. Overlay identity is not a
pick identity.

---

## 12. Support / provenance encoding contract

**NEW PROJECT DECISION.** Support and provenance use an
**orthogonal** visual channel, not a second T1 hue.

```text
color           = diagnostic value (T1)
support channel = support / validity / provenance metadata
```

These statuses are Analysis support semantics (`60` / `61`),
not probabilistic confidence scores.

Statuses remain `60` / `61`:

```text
FULL_SUPPORT
BOUNDARY_CONDITIONED
OUT_OF_DOMAIN
COLUMN_UNAVAILABLE
```

Trajectory-time consumer contract (does not redefine Analysis
derivative support):

| Status | T1 overlay |
| --- | --- |
| FULL_SUPPORT | numeric T1 allowed; value color |
| BOUNDARY_CONDITIONED | numeric T1 allowed; value color **and** visible BOUNDARY status |
| OUT_OF_DOMAIN | **no** numeric Analysis T1; **no** fake zero; path geometry may remain; T1 overlay gaps / disables |
| COLUMN_UNAVAILABLE | no Analysis T1 overlay for that column/context |

Do not silently stitch over OOD. A trajectory may leave and
re-enter support, including the same height layer more than
once. That is trajectory-time behavior, distinct from
Architecture `60` height-layer interval support.

Flicker policy for rapidly alternating FULL/BOUNDARY along
the path is **OPEN** (§23). V1 default is honest per-sample
status with no temporal smoothing of support.

Provenance is a verify-layer affordance (column identity,
transform id/version), not a color.

Exact pattern / opacity / outline styling is not locked here
beyond: value and support must remain separable channels.

---

## 13. Fixed / versioned color-scale requirement

**NEW PROJECT DECISION.**

Named object:

```text
T1_COLOR_SCALE_V1
```

**Status:** CAL COMPLETE / ACCEPTED V1.

Required properties:

```text
zero-centered
symmetric about zero
physical units s⁻²
fixed across trajectories
fixed across supported datasets
independent of selected tracer
independent of runtime path population
robust to isolated derivative outliers
explicitly versioned
documented
never silently recalibrated when adding a sounding
```

Production mapping (`TrajectoryTiltingColorScale`):

```text
version = T1_COLOR_SCALE_V1
|T1|_sat = 6.100×10⁻⁵ s⁻²
display domain = [−6.100×10⁻⁵, +6.100×10⁻⁵] s⁻²

T1 == 0                 → exactly 0
0 < T1 < sat            → T1 / sat
−sat < T1 < 0           → T1 / sat
T1 >= +sat              → +1
T1 <= −sat              → −1
```

V1 has **no** `|T1|_ε` and **no** near-zero classification.
Exact IEEE `0` remains the only special zero (`61`) and is
not orthogonality (§8.3). Tiny nonzero T1 remains nonzero
on the signed-unit map.

This object maps scientific T1 → signedUnit ∈ [−1, +1].
It does not encode RGB. Slice C already separates
signedUnit from artistic appearance.

**Display semantics (not physics):**

```text
saturation is a DISPLAY calibration
it does not clip or replace raw T1
it is not a physical-significance threshold
pale color ≠ physically unimportant
pale means smaller |T1| on this common display scale
it is not a percentile of trajectory samples
it is not empirical proof that spatial T1 is symmetric
```

Symmetry about zero is an intentional visualization
policy. CAL sampling used paired dipole extrema at each
included Analysis level, so signed P5/P95 symmetry is
partly constructive.

**Calibration population (V1):**

```text
INCLUDED
  Goshen ESC HR Analysis
  Prospect Valley ESC HR Analysis
  Dumas ESC HR Analysis

EXCLUDED
  Moore / OUN IGRA     COLUMN_UNAVAILABLE; no Analysis column
  DEMO Source          Source T1 ≠ Analysis T1
```

Sampling (per storm, then one storm-level statistic):

```text
native Analysis segments
evaluate at segment midpoint height
FULL_SUPPORT only
prescribed production updraft from DEMO_SCENARIO
two dipole-extrema positions at r = σ along ±ω_h
characteristic level extrema, not trajectory samples,
  not a fixed horizontal azimuth
no cross-storm pooling of levels
```

Per storm: `Qstorm = max(|P5(T1)|, |P95(T1)|)`.

| storm | P5 (s⁻²) | P95 (s⁻²) | Qstorm (s⁻²) |
| --- | ---: | ---: | ---: |
| Goshen | −5.825×10⁻⁵ | +5.825×10⁻⁵ | 5.825×10⁻⁵ |
| Prospect | −6.100×10⁻⁵ | +6.100×10⁻⁵ | 6.100×10⁻⁵ |
| Dumas | −5.621×10⁻⁵ | +5.621×10⁻⁵ | 5.621×10⁻⁵ |

Q90 sanity (not the production aggregator):

```text
Goshen     4.148×10⁻⁵ s⁻²
Prospect   4.242×10⁻⁵ s⁻²
Dumas      3.612×10⁻⁵ s⁻²
```

```text
max(Q95) / min(Q95) = 1.085
```

No calibration storm currently dominates the common scale.

**V1 cross-storm aggregator:** `max(Qstorm)`.

Chosen because the present calibration population is small
and Qstorm values are tightly clustered. The aggregator is
VERSIONED and REVIEWABLE. Expansion of the calibration
population may justify a different cross-storm aggregator.
V1 does not encode an automatic future switch to median.

Implementation:

```text
src/data/escHrTimeAnalysis/t1ColorScaleV1.ts
```

**REJECTED:**

```text
per-trajectory min/max normalization
per-selected-sounding dynamic normalization
per-storm runtime normalization
runtime auto-rescaling
silent change of color meaning across releases
choosing a percentile by undocumented fiat
|T1|_ε / near-zero zone in V1
automatic future switch to a median aggregator
Source T1 fallback
```

**CAL vs tests vs App:**

```text
renderer / API slices MAY still use an injected
versioned scale contract or test fixture

production display saturation is T1_COLOR_SCALE_V1

user-facing overlay uses T1_COLOR_SCALE_V1
(Landing Integration Slice I2; Explore only)

no developer-chosen temporary production threshold
```

A test fixture is not the production scale.

Sign encoding (warm / cool / exact physical `0`) does not
introduce `|T1|_ε`. A later versioned scale may add a
near-zero visual band; V1 does not.

---

## 14. 3D geometry glyph semantics

**NEW PROJECT DECISION.**

At the selected historical sample, the explorer may draw:

```text
environmental ω_h          world-horizontal vector
prescribed-updraft ∇_h Vy  world-horizontal vector
visible angle θ            only when ALIGNMENT_DEFINED
```

Both vectors may share the probe origin for readability.

Required language:

```text
environmental horizontal vorticity
at the altitude occupied by the tracer
```

**REJECTED** language:

```text
tracer horizontal vorticity
parcel horizontal vorticity
```

`ω_h` is horizontally homogeneous in this laboratory: the
glyph belongs to a height layer, not to a parcel-owned tube
(BL-047).

T1 is a scalar and must not be drawn as a vector.

Both vectors have units `s⁻¹` in the world horizontal plane,
so a common physical scale is meaningful. Display
exaggeration, if used, must be labeled as display scale.
Arrow length must not be presented as a second T1.

The glyph draws the vectors from the atomic explanation
result at that sample. It does not resample.

Shared visual origin at the recorded sample `P_i` is a
visualization convention only. It does not mean the
vectors belong to the tracer.

Slice D implements this as a headless glyph model plus a
Three.js capability. Display length uses an injected
`TrajectoryTiltingGlyphVectorDisplayScale` shared by both
operands. There is no production meters-per-`s⁻¹` freeze
(§23 item 4 remains OPEN). There is no per-vector
normalization. App / TracerScene activation is not included.

---

## 15. What-if alignment state boundary

**NEW PROJECT DECISION.**

V1 reserves a pedagogical what-if: vary `θ` while
`|ω_h|` and `|∇_h Vy|` stay fixed, so `cos θ` moves through
`+1 → 0 → −1` and the user sees the dot-product identity.

This state is **counterfactual**.

It must not mutate:

```text
storm field
sounding / Analysis column
tracer
simulation
recorded history
diagnostic source data
the actual atomic explanation result
```

Required conceptual labels:

```text
What-if geometry
laboratory state unchanged
```

Actual geometry remains visually distinct (ghost / reference).
The what-if scalar is not actual T1 and must not overwrite
or masquerade as it.

Indicative split (Slice F implements this as capability;
Landing Integration Slice I3 wires it in Explore):

```text
actual     = AnalysisTiltingExplanationResult   // frozen query
ephemeral  = { thetaWhatIf, t1WhatIf }
t1WhatIf   = |ω_h|_actual |∇_h Vy|_actual cos(thetaWhatIf)
             only when actual alignment is ALIGNMENT_DEFINED
```

Visualization convention (not physics; Architecture 62
does not freeze which operand rotates):

```text
environmental ω_h direction stays fixed
a hypothetical copy of prescribed ∇_h Vy rotates
  in the world x-z plane
unsigned θ has two planar sides; the branch is the
  sign of û × ĝ along +Y from the ACTUAL gradient
aligned / opposed fallback = +1 (deterministic, not a
  physical handedness of unsigned θ)
what-if gradient magnitude equals actual |∇_h Vy|
equal physical magnitude → equal injected display length
```

Canonical numeric policy for the counterfactual only:

```text
if thetaWhatIf === π/2 exactly, T1_whatif = +0
  (Math.cos(π/2) is an IEEE residual, not a physical
   near-zero band)
nearby angles are not classified as zero
actual T1 is copied from the atomic explanation and
  is never recomputed from A·B·cos(actual θ)
```

What-if keeps **actual** magnitudes fixed. It must not invent
a nonzero magnitude to make the educational interaction
interesting.

When actual alignment is not `ALIGNMENT_DEFINED`:

```text
primary:  disable angle manipulation for that sample
permitted: still draw remaining actual vector(s), if any,
           but T1_whatif stays 0 because a magnitude is 0;
           the UI must state that reason
forbidden: rotating a zero vector, or synthesizing a
           fake |∇_h Vy| or |ω_h|, to demonstrate
           +1 → 0 → −1
```

The `+1 → 0 → −1` demonstration is available only for
`ALIGNMENT_DEFINED` samples. Zero-gradient updraft-axis
samples cannot produce it.

Exact pointer/slider interaction is out of this SoT. The
state boundary is not.

---

## 16. Numeric verify layer

**NEW PROJECT DECISION.**

Secondary readout may show:

```text
T1
|ω_h|
|∇_h Vy|
θ, cos θ          only when ALIGNMENT_DEFINED
alignment state   when not defined
support / validity
provenance affordance
```

Numbers verify; they do not teach first.

If the atomic result already supplies a quantity, the
readout must display that value. It must not recompute it.
It must not print `θ = 90°` or `cos θ = 0` for a
degenerate alignment.

This layer is not a replacement of Inspector L1/L2 motion
decomposition and not a replacement of Point Diagnostics
Source T1. It is the explorer’s Analysis verify surface.

Historical `State: active/inactive` from live particle
(`§19`) must not appear here as a scientific sample property.

---

## 17. ω_y,current causal-perception gate

**NEW PROJECT DECISION.**

`ω_y,current` remains a valid Eulerian prescribed-field
sample along the path (`23`, `32`, class B). Default
Trajectory Tilting Explorer view **must not** include it.

Forbidden as default V1:

```text
second graph
side-by-side T1 and ω_y numbers
default overlay of both series
reuse of the T1 diverging palette as primary ω_y encoding
```

If a later slice includes comparison at all, it requires a
deliberate action such as

```text
Compare to existing rotation
```

framed as:

```text
existing prescribed vertical vorticity sampled along the path,
NOT generated by T1
```

with a distinct visual language from T1.

Lead-lag on DEMO (T1 on the flank, `ω_y^Ω` nearer the core)
is **not** causal evidence (BL-047). Two curves plus a
disclaimer are not a complete treatment.

**V1 choice:** the comparison is **deferred**. Slice G is
named only as a later, separately reviewable surface. It is
not part of the core explorer.

---

## 18. Terminal sample materiality / timestamp boundary

**CURRENT FACT.** Terminal ground-clamped sample:

```text
P_recorded  ≈ P(t_n + α dt) on y = 0
t_recorded  = t_n + dt
```

History stores no terminal/clamp flag. The sample is not a
time-consistent material Euler endpoint.

**NEW PROJECT DECISION.**

This explorer must **not** treat that sample as an ordinary
material diagnostic sample for budget / `D/Dt` /
path-functional interpretations.

For current Eulerian-steady Analysis T1, lookup at the
recorded terminal `(P, t)` is numerically a field sample at
that point. Timestamp / materiality semantics remain
unresolved (BL-047 OPEN).

V1 policy:

```text
Eulerian Analysis T1 lookup at the recorded (P, t)
  remains allowed as a class B sample
  (numerically meaningful for current Eulerian-steady fields)
material / budget / material-endpoint interpretation
  is forbidden; those semantics remain unresolved (BL-047)
authoritative terminal/clamp identity
  does not exist on PathHistorySample
V1 must not infer terminal/clamp identity from
  live particle.active
  y = 0
  last-sample-of-inactive-lane
  or other positional / lifecycle heuristics
explicit marking or exclusion of a terminal sample
  requires a separate history / clamp metadata policy
  (new recorded flag). That policy is out of this SoT.
  This file does not change Simulation or history.
```

Do not invent a clamp-time physics fix here.

---

## 19. Existing historical active-flag debt

**CURRENT FACT.** `resolveHistoricalPathSample.active` is
live `particle.active`. After deactivation, a mid-path
recorded sample can display Inspector `State: inactive`.

**NEW PROJECT DECISION.** This is existing semantic debt
(`52` / Inspector). Trajectory Tilting Explorer V1 does
**not** require active-at-sample and does **not** fix that
flag.

New scientific labels in this explorer must not use that
live `active` bit as “activity at this sample.” V1 simply
omits it from the Analysis verify layer.

---

## 20. Renderer / domain separation

**NEW PROJECT DECISION.**

```text
recorded trajectory history          PathHistorySample[]
  { position, simulationTime }
        +
derived Analysis diagnostic projection
  per historyIndex: explanation or failure
        →
render encoding
  value color + orthogonal support channel
```

`PathHistorySample` does **not** gain stored T1, vectors,
or support. Simulation/history domain stays a path recorder
(`14`, `52`).

The projection is derived at observe time from the atomic
query. It is not a diagnostic snapshot cache of the kind
`52` rejected; it is a pure function of

```text
(history samples, Analysis column, prescribed updraft)
```

Invalidation: environment/column change, history rewrite
(Reset / Clear / append), or updraft identity change.
Not every rAF.

Renderer may add a color attribute / support attribute to
trail geometry. That is rendering. It is not physics.

Picking continues to use domain samples, not GPU line
rasterization.

---

## 21. API / data-flow diagram

```text
user click on historical tail
        │
        ▼
pickPathHistorySample  →  { slotIndex, historyIndex }
        │
        ▼
HistoricalPathProbe { tracerId, historyIndex }
        │
        ▼
resolveHistoricalPathSample
        │
        ▼
recorded (P_i, t_i)     // exact stored sample
        │
        ▼
queryAnalysisTiltingExplanationAt(column, updraft, P_i, t_i)
        │
        ├─ FULL / BOUNDARY ─► atomic explanation
        │                      T1, ω_h, ∇_h Vy, |·|, θ, cos θ,
        │                      status, segment, provenance
        │
        └─ OOD / COLUMN ────► no number; overlay gap / absent
                │
                ▼
        3D glyph  +  numeric verify  +  optional what-if
                │
                │  what-if reads actual magnitudes/vectors;
                │  writes only ephemeral θ / T1_whatif
                ▼
        laboratory state unchanged


parallel, per recorded sample (not on click):

history.samplesFor(lane)
        │
        ▼
queryAnalysisTiltingExplanationAt per (P_j, t_j)
        │
        ▼
TrajectoryTiltingProjection[j]
        │
        ▼
encodeTrajectoryTiltingForRender(projection, injected scale)
        │
        ▼
T1 overlay (LineSegments; Slice I2 Explore wiring)
```

Authority chain:

```text
EscHrTimeAnalysisColumn          59 / 61 column
VerticalEnvelopeUpdraftField     prescribed ∇_h Vy
queryAnalysisTiltingExplanationAt
        └── same evaluation as queryAnalysisTiltingTendencyAt
UI / renderer                    observe only
```

Advection chain (unchanged, not this explorer’s T1):

```text
Source/DEMO EWP → EnvironmentalWindField
  → StormRelativeEnvironmentalAdvectionField
  → CompositeVelocityField = V_total
  → EulerIntegrator
  → TracerPathHistory
```

Those two chains meet only at recorded `(P, t)`: the path
was built by `V_total`; Analysis T1 is evaluated there.

---

## 22. Implementation slice decomposition

Slice A is IMPLEMENTED / ACCEPTED. Slice B is
IMPLEMENTED / ACCEPTED. Slice C renderer capability is
IMPLEMENTED / ACCEPTED. Slice D glyph capability is
IMPLEMENTED / ACCEPTED. Slice E numeric verification
capability is IMPLEMENTED / ACCEPTED. Slice F what-if
capability is IMPLEMENTED / ACCEPTED. Slice G is
NOT STARTED / DEFERRED / NOT AUTHORIZED.
Independent review boundaries.
Color-scale numeric calibration is not embedded in the
renderer slice. `T1_COLOR_SCALE_V1` is a separate CAL V1
object. Overlay wiring is Landing Integration Slice I2.
Glyph / verify / what-if wiring is Landing Integration
Slice I3.

### Slice A — atomic Analysis explanation result

**Status:** IMPLEMENTED / ACCEPTED.

Headless sibling query + tests. Public API:
`queryAnalysisTiltingExplanationAt`. Scalar
`queryAnalysisTiltingTendencyAt` is a projection of
the same evaluation.

```text
same T1 / status / segment / provenance as
  queryAnalysisTiltingTendencyAt
vectors preserved
alignment validity (§8.3); θ/cos θ absent when degenerate
OOD / COLUMN have no number
does not change DiagnosticTiltingTendency
does not wire App
```

### Slice B — trajectory diagnostic projection

**Status:** IMPLEMENTED / ACCEPTED.

Headless map: recorded samples → per-index Analysis
status / T1 (when supported) / failure. Support /
validity semantics. Public API:
`projectAnalysisTiltingAlongRecordedPath`.

Owns only the pure projection of Analysis T1 along
exact recorded path samples. Stores trail-relevant
Analysis subset (status, T1, segment, provenance).
Glyph vectors / θ remain on the atomic explanation
query at a selected sample.

Does **not** own Explore/UI wiring, renderer, live
diagnostic panels, or `V_env` rewiring.

```text
does not persist T1 on PathHistorySample
does not interpolate samples
does not infer terminal/clamp identity
COLUMN_UNAVAILABLE / missing column → no T1 values
does not derive continuous interval support
does not hold an Explore Analysis column beside Source EWP
does not replace Source EWP or advect tracers
```

The original slice note that holding an Explore
diagnostic Analysis column beside Source EWP
“belongs here or as a prerequisite” is resolved as
**prerequisite of the first user-facing consumer**,
not as Slice B work. That is slice ownership, not a
change to the Analysis-beside-Source scientific
split (§7, §10).

### Caller integration prerequisite (not Slice B, not Slice C capability)

Slice C encoding consumes an already-computed
`TrajectoryTiltingProjection`. It does not invent the
operands.

User-facing activation still requires an application/caller
boundary that supplies all three:

```text
recorded Source/DEMO path history
corresponding Analysis column
prescribed updraft
```

The Analysis column exists **beside** Source EWP. It
does not replace Source EWP. It does not advect
tracers. Missing / null column remains
`COLUMN_UNAVAILABLE`; there is no Source T1 fallback.

Landing Integration Slice I1 implements that sibling
availability at the Explore/App data boundary. Overlay
wiring is Landing Integration Slice I2. Glyph / verify /
what-if wiring is Landing Integration Slice I3. That is
not live Analysis `V_env` rewiring. BL-010 remains PARTIAL.

### Landing Integration Slice I1 — Analysis sibling beside Source EWP

**Status:** IMPLEMENTED / ACCEPTED.

```text
SOURCE ADVECTS.
ANALYSIS EXPLAINS.
```

One Explore environment identity atomically selects:

```text
Source environmental profile / Source EWP
EscHrTimeAnalysisColumn | null
```

Mapping:

```text
Goshen     Source Goshen   + matching Goshen Analysis
Prospect   Source Prospect + matching Prospect Analysis
Dumas      Source Dumas    + matching Dumas Analysis
Moore      Source Moore    + analysisColumn = null
Demo       prescribed DEMO + analysisColumn = null
```

Null is `COLUMN_UNAVAILABLE`, not a zero column and not
Source T1. Analysis is not stored in Simulation, tracer,
`CompositeVelocityField`, or `EnvironmentalWindField`.
Live Analysis `V_env` rewiring is not included in this
slice. Trajectory overlay / glyph / verify / what-if are
not included in this slice.

Homes:

```text
src/app/exploreEnvironmentRepresentations.ts
  exploreEnvironmentRepresentations(identity)
  exploreAnalysisColumn(identity)

src/app/createExploreLab.ts
  ExploreLab.analysisColumn sibling of Source advection
```

### Landing Integration Slice I2 — Analysis T1 on recorded trajectory

**Status:** IMPLEMENTED / ACCEPTED.

```text
The trajectory is the graph.
A colored value segment [i, i+1] is Analysis T1
at recorded sample i (the earlier endpoint).
It is not T1 along the interval, not a mean of
endpoints, not the T1 that caused displacement,
and not material parcel vorticity tendency.
```

Explore only. Automatic when `analysisColumn` is present
(Goshen / Prospect / Dumas). Moore and Demo have no
overlay and no Source T1 fallback. Guided is unchanged.

Data flow:

```text
TracerPathHistory.samplesFor(lane)
  + ExploreLab.analysisColumn
  + prescribed updraft
  → ExploreAnalysisTiltingProjectionCache
     append-only continuation: query only new samples
     clear / replacement / column / updraft change:
       full projectAnalysisTiltingAlongRecordedPath
  → encodeTrajectoryTiltingForRender(..., T1_COLOR_SCALE_V1)
     from the cached projection (O(N) encode, no re-query)
  → create/sync TrajectoryTiltingOverlay
```

Projection is derived observe-time state. It is not a
second history store. Incremental cache results are
exactly equivalent to an atomic full recompute.
Overlay invalidation is Analysis
column identity plus `TracerPathHistory.revision` (content
generation). Append vs replacement is distinguished by
`lanePrefixGeneration` plus sample count, not by hashing
positions. Same sample count and last `simulationTime`
with different positions still refresh. Picking remains
`pickPathHistorySample` on occupancy samples. Overlay
raycast is disabled.

Presentation policy: value color is
`ANALYSIS_T1_VALUE_APPEARANCE_V1` (warm / 0 / cool).
BOUNDARY uses that same value color on the Slice C
BOUNDARY LineSegments object. Dash / opacity / outline
remain OPEN (§23 item 5). Occupancy trail remains.
The Analysis T1 trajectory color legend V1 is a fixed
symmetric CAL V1 readout of that value encoding: cool
negative / exact 0 / warm positive. Endpoints are
display saturation, not physical extrema. Support and
OOD are not on the legend. OOD is not zero. The legend
is shown when `analysisColumn` is present (same
availability as the overlay).

Coplanar compositing (presentation polish, not science):
occupancy `THREE.Line` uses `depthTest` and does **not**
write depth. Analysis overlay uses `depthTest` and
`depthWrite` with `renderOrder` greater than occupancy
(d33ae29). Occupancy-depthWrite alone does not explain
camera-dependent disappearance of the **whole** overlay:
`needsUpdate` on a mutated position attribute does not
recompute `geometry.boundingSphere`, and a stale origin
sphere frustum-culls FULL and BOUNDARY `LineSegments`
while occupancy (which recomputes bounds) stays visible.
Both overlay objects keep `frustumCulled = false` and
call `computeBoundingSphere()` after every drawable
rewrite. Overlay geometry is a small selected scientific
presentation layer. Camera orbit/zoom must not toggle
overlay presence or change overlay RGB. OOD gaps still
show occupancy. Native WebGL 1 px line width remains a
later presentation item (not Line2 here).

Homes:

```text
src/explore/encodeExploreAnalysisTilting.ts
src/explore/exploreAnalysisTiltingProjectionCache.ts
src/rendering/analysisT1ValueAppearanceV1.ts
src/rendering/TracerScene.ts
  syncAnalysisTiltingOverlays
src/ui/tracer/TracerViewport.tsx
src/ui/tracer/analysisT1ColorLegendV1.ts
src/ui/tracer/AnalysisT1ColorLegend.tsx
```

Glyph / verify / what-if are not included in this slice.

### Landing Integration Slice I3 — Analysis explanation at a historical sample

**Status:** IMPLEMENTED / ACCEPTED.

```text
THE GEOMETRY THAT EXPLAINS T1
MUST BE THE SAME GEOMETRY
FROM WHICH THAT EXACT T1 WAS CALCULATED.
```

User flow (Explore only):

```text
colored Analysis T1 trail
  → click exact recorded historical sample
  → mechanism glyph
  → numeric verification
  → optional what-if alignment
```

Selection identity remains Architecture `52`:
`(tracerId, historyIndex)` → exact recorded
`(position, simulationTime)`. Selection stores identity.
Diagnostic state resolves from identity + current
Explore lab / environment. No interpolated probe, no
segment fraction, no nearest rendered T1 point, no
overlay picking, and no copied diagnostic payload as
selection authority.

Physics authority is Slice A only:

```text
queryAnalysisTiltingExplanationAt(
  ExploreLab.analysisColumn,
  prescribed updraft,
  recorded position,
  recorded simulationTime
)
```

UI does not reconstruct ω_h, ∇_h Vy, T1, θ, norms,
support, or provenance. Trail encoding is not a
scientific payload. Trail says where to look. Atomic
explanation says why.

Availability:

```text
Explore + exact historical sample
Demo: no Analysis I3 UX
Moore: typed COLUMN_UNAVAILABLE; no Source T1 fallback
Guided: not extended
OOD: typed unavailable; no invented numeric T1 / glyph
BOUNDARY_CONDITIONED: numeric valid; typed support shown
```

Environment switch re-resolves or clears. It does not
leave a stale glyph / panel from the previous identity.

Composition: existing Explore observation column
(Tracer Inspector + Source Point Diagnostics remain).
I3 adds Analysis T1 verification and what-if below them.
Glyphs live in TracerScene beside the I2 overlay.

Trail ↔ probe: for supported historyIndex i, if a
drawable segment owned by i exists, verification T1
equals the raw atomic explanation T1 at i (not RGB).
A probe at i remains valid when `[i, i+1]` is not
drawable because i+1 is unsupported.

Terminal ground-clamped records may still receive the
steady Eulerian Analysis query at recorded P/t because
Slice A supports that lookup. V1 does not call that
an exact parcel endpoint budget, a material terminal
tendency, or an integrated parcel result.

Homes:

```text
src/explore/resolveExploreHistoricalAnalysisTilting.ts
  exploreAnalysisTiltingExplorerActive
  resolveExploreHistoricalAnalysisTiltingExplanation
  createExploreHistoricalAnalysisTiltingView

src/app/App.tsx
  historical probe → Slice A → D/E/F models
  thetaWhatIf ephemeral; reset on recorded identity

src/ui/tracer/TracerViewport.tsx
  passes packaged glyph models; does not query Analysis

src/rendering/TracerScene.ts
  syncAnalysisTiltingGlyph
  syncAnalysisTiltingWhatIfGlyph
  dispose on clear / unmount; raycast disabled

src/rendering/analysisT1GlyphDisplayScaleV1.ts
  presentation meters-per-s⁻¹ injection; §23 item 4 OPEN

src/rendering/analysisT1GlyphAppearanceV1.ts
  artistic actual / hypothetical glyph colors
```

Slice G is not included in this slice.

### Pre-public presentation polish (not a science slice)

Presentation / interaction only. Scientific status of
Architecture 62 V1 is unchanged. Slice G is not included.

```text
occupancy trail: depthTest, depthWrite = false
Analysis overlay: depthTest, depthWrite, later
  renderOrder (d33ae29); frustumCulled = false on
  FULL and BOUNDARY LineSegments; computeBoundingSphere
  after each position rewrite
Focus sample: one-shot OrbitControls target = recorded P
Focus ≠ Follow; not automatic on selection
Reset View still restores DEEP_STORM_TRACER_VIEW
hypothetical glyph: dashed identity, higher opacity/contrast,
  smaller world-space dashes; magnitudes unchanged
native 1px LineBasicMaterial width: later presentation item
Analysis T1 legend V1: fixed symmetric CAL V1 domain;
  cool negative / exact 0 / warm positive;
  display saturation endpoints; value only, not support;
  OOD is not zero; visible when analysisColumn present
Explore observation column: Inspector, Point diagnostics,
  Analysis T1 verification, and What-if geometry are
  user-collapsible. Default OPEN. Presentation only;
  collapse does not change diagnostic, selection, Analysis,
  what-if, renderer, or simulation state
§23 item 4 remains OPEN
§23 item 5 remains OPEN
```

Homes:

```text
src/rendering/trailGeometry.ts
src/rendering/trajectoryTiltingOverlay.ts
src/rendering/TracerScene.ts
  focusPoint
src/ui/tracer/ExploreFocusSampleControl.tsx
src/rendering/analysisT1GlyphAppearanceV1.ts
src/ui/tracer/analysisT1ColorLegendV1.ts
src/ui/tracer/AnalysisT1ColorLegend.tsx
```

### Slice C — renderer value / support encoding

**Status:** IMPLEMENTED / ACCEPTED as renderer capability.
`T1_COLOR_SCALE_V1` display saturation is ACCEPTED V1
(§13). Production overlay wiring is Landing Integration
Slice I2, not this slice record.

Homes:

```text
src/data/escHrTimeAnalysis/trajectoryTiltingRenderEncoding.ts
  encodeTrajectoryTiltingForRender(projection, scale)

src/rendering/trajectoryTiltingOverlay.ts
  create / sync / dispose TrajectoryTiltingOverlay
```

Scale split:

```text
scientific: injected TrajectoryTiltingColorScale
            signedUnitFromTiltingTendency(t1) → [-1, +1]
            exact T1 0 → 0
            production object = T1_COLOR_SCALE_V1
            tests may still use test-fixture-v0
artistic:   injected TrajectoryTiltingValueAppearance
            linearRgbFromSignedUnit(signedUnit)
```

Slice C encoding does not own the production number.
The CAL V1 object lives in `t1ColorScaleV1.ts`.

Support channel is orthogonal to value:

```text
FULL_SUPPORT           numeric; FULL overlay LineSegments
BOUNDARY_CONDITIONED   same numeric map; BOUNDARY LineSegments
OUT_OF_DOMAIN          no value color; no overlay primitive
COLUMN_UNAVAILABLE     no value color; overlay absent
```

Exact artistic BOUNDARY styling remains OPEN (§23 item 5).
Slice C distinguishes FULL vs BOUNDARY as separate overlay
objects without freezing pattern / opacity / outline.

A single numeric sample is encoded; it does not invent a
two-point line.

Consumes a `TrajectoryTiltingProjection`. Does not query
Analysis physics from the renderer. Does not invent caller
operands. Does not fall back to Source T1. Does not inject
Analysis into advection.

```text
does not invent |T1|_sat or |T1|_ε as a production freeze
does not ship a developer-chosen temporary production threshold
does not change PathHistorySample
does not interpolate T1 between recorded samples
does not treat GPU segment interpolation as selection
does not itself wire TracerScene / App / Explore
  (I2 consumes this capability)
```

### Slice D — historical-probe 3D geometry glyph

**Status:** IMPLEMENTED / ACCEPTED as glyph capability.
Production Explore wiring is Landing Integration Slice I3,
not this slice record. Exact production display-scale
exaggeration remains OPEN (§23 item 4). I3 injects
`ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1` as presentation
wiring only.

Homes:

```text
src/data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.ts
  createTrajectoryTiltingGlyphModel(position, explanation)
  injected TrajectoryTiltingGlyphVectorDisplayScale

src/rendering/trajectoryTiltingGlyph.ts
  create / sync / dispose TrajectoryTiltingGlyph
```

Draws `ω_h` and `∇_h Vy` from the atomic result. Draws `θ`
only when `ALIGNMENT_DEFINED`. Environmental language.
Not pickable as a tracer. Shared origin is visual
convention only. Display scale is injected and common to
both operands; no per-vector normalization. Does not
recompute scientific quantities. Does not itself wire
TracerScene / App / Explore (I3 consumes this capability).

### Slice E — numeric verify / provenance readout

**Status:** IMPLEMENTED / ACCEPTED as model / presentation
capability. Production Explore wiring is Landing
Integration Slice I3, not this slice record.

Homes:

```text
src/data/escHrTimeAnalysis/trajectoryTiltingVerification.ts
  createTrajectoryTiltingVerificationModel(explanation, recordedSample?)

src/ui/tracer/formatTrajectoryTiltingVerification.ts
  display-only scientific / degree / segment formatting
  domain θ remains radians

src/ui/tracer/TrajectoryTiltingVerificationPanel.tsx
  read-only Analysis T1 verification panel
```

Presentational. Reads the atomic result. Does not recompute
physics. Does not display live `active` as sample science.
Does not replace Point Diagnostics Source T1.
GEOMETRY TEACHES. NUMBERS VERIFY.
Does not itself wire TracerScene / App / Explore
(I3 consumes this capability).

### Slice F — what-if alignment

**Status:** IMPLEMENTED / ACCEPTED as capability.

Ephemeral educational counterfactual. Ghost vs actual.
What-if T1 cannot masquerade as actual T1. No laboratory
mutation. Angle manipulation disabled unless actual
alignment is `ALIGNMENT_DEFINED` (§15). Does not invent
magnitudes. Does not recompute actual T1. Does not
integrate over time. Does not compare to `ω_y,current`.
Does not itself wire TracerScene / App / Explore
(I3 consumes this capability).

Public API: `createTrajectoryTiltingWhatIfModel`.
Optional UI: `TrajectoryTiltingWhatIfPanel`.
Optional renderer: `createTrajectoryTiltingWhatIfGlyph`.

```text
AVAILABLE only when ALIGNMENT_DEFINED
UNAVAILABLE for GRADIENT_DEGENERATE / OMEGA_DEGENERATE /
  BOTH_DEGENERATE / OUT_OF_DOMAIN / COLUMN_UNAVAILABLE
θ_whatif domain [0, π]; wrapping is rejected
T1_whatif = A·B·cos(θ_whatif); exact π/2 → +0
actual T1 copied from explanation.tiltingTendency
ω_h fixed; hypothetical ∇_h Vy rotates (visual convention)
reset = θ_whatif := actual θ; laboratory unchanged
```

### Slice G — optional existing-rotation comparison

**Status:** NOT STARTED / DEFERRED / NOT AUTHORIZED.

Deferred. Requires a separate causal-perception review
before implementation. Distinct encoding from T1. Explicit
user action. Not default V1. This document does not include
that implementation.

### Calibration V1 (not a renderer slice)

**Status:** CAL COMPLETE / ACCEPTED V1.

```text
T1_COLOR_SCALE_V1 |T1|_sat = 6.100×10⁻⁵ s⁻²
display domain [−sat, +sat]
no |T1|_ε in V1
aggregator = max(Qstorm)
population / sampling / provenance: §13
```

This is display calibration, not a renderer invention and
not a Slice C number. Slices A–C may still use an injected
test fixture. Production signedUnit mapping is
`T1_COLOR_SCALE_V1` in `t1ColorScaleV1.ts`.
Overlay wiring consumes this object in Slice I2.
Glyph / verify / what-if wiring is Slice I3.

### Explicitly not a slice of this SoT

```text
picking redesign
Simulation clamp-time fix
historical active-flag fix
T1(t) graph
Analysis advection rewiring
Source T1 peer coloring
```

---

## 23. OPEN items

Not decided here. Not silently closed by a later slice
without a SoT amendment or a dedicated calibration record.

```text
1. ACCEPTED V1: T1_COLOR_SCALE_V1 |T1|_sat = 6.100×10⁻⁵ s⁻²
   (§13). |T1|_ε is not part of V1; exact IEEE 0 only.
   A later versioned scale may add a near-zero band.
2. Trajectory-time FULL/BOUNDARY flicker policy
   (V1 default = per-sample honesty, no smoothing)
3. Dedicated terminal-clamp recorded flag / timestamp
   consistency (Simulation / history change; out of this SoT)
4. Exact glyph display-scale exaggeration, if any
   (Slice D specified injected common mapping;
    I3 injects ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1
    as presentation wiring; production meters-per-s⁻¹
    freeze remains OPEN)
5. Exact support-channel styling (pattern / opacity / outline).
   I3 shows typed BOUNDARY_CONDITIONED in verification UI.
   Trail visual distinction from FULL remains OPEN.
   The Analysis T1 color legend V1 encodes value only and
   does not close this item.
   Occupancy/overlay coplanar compositing is a separate
   presentation contract (occupancy depthWrite false;
   overlay d33ae29 depthTest/depthWrite, later renderOrder;
   overlay frustumCulled false; bounds refreshed after
   each position rewrite).
6. Slice G causal-perception treatment, if that slice is ever
   authorized
7. BL-047 remaining research: T1 vs TILT_Y,total topology;
   R_y product role; material-line vs local-ω experiment
8. Whether Point Diagnostics Source T1 is later rewired to
   Analysis (separate SoT; not this explorer)
9. Alignment magnitude ε, if exact IEEE 0 is ever insufficient;
   not |T1|_ε; requires an explicit calibrated contract
```

Item 1 saturation is frozen for V1. Tests may still use an
injected fixture; that fixture is not production
`T1_COLOR_SCALE_V1`. Native WebGL 1 px line width for
occupancy, overlay, and glyph shafts remains a later
presentation item; this polish does not introduce Line2.

---

## 24. REJECTED interpretations

```text
T1 → parcel spin-up
T1 → Δω_y
T1 × Δt → gained rotation
causal T1 → ω_y,current
Analysis T1 as the field that advected the tracer
Source T1 as equal user-selectable coloring
silent interpolated historical (P, t)
UI-side reconstruction of diagnostic physics
mixing T1 value encoding with support encoding
dynamic / per-trajectory / per-sounding color normalization
silent OOD → 0 in this Analysis UX
T1 ≈ 0 ⇒ orthogonality / θ = 90° / cos θ = 0
fabricating θ or cos θ when a vector magnitude is degenerate
terminal/clamp identity from live active, y = 0, or last-sample heuristics
developer-chosen temporary production color saturation
terminal ground-clamped sample as ordinary material endpoint
tracer / parcel ownership of sounding-derived ω_h
T1 drawn as a vector
what-if T1 as actual T1
two curves + disclaimer as sufficient T1 vs ω_y causation design
this file as BL-010 completion
this file as live V_env rewiring
this file as TILT_Y,total or I_tilt authorization
```

---

## 25. Compact lock-in

```text
FEATURE:           Trajectory Tilting Explorer V1
STATUS:            ARCHITECTURE ACCEPTED / CONTRACTS SPECIFIED;
                   SLICES A–F IMPLEMENTED / ACCEPTED;
                   CAL COMPLETE / ACCEPTED V1;
                   LANDING INTEGRATION SLICES I1–I3
                     IMPLEMENTED / ACCEPTED;
                   FEATURE V1 INTEGRATED / COMPLETE
                     except deferred G;
                   SLICE G NOT STARTED / DEFERRED /
                     NOT AUTHORIZED
QUESTION:          why this T1 sign/magnitude at this sample?
TRACER:            moving probe through mechanism geometry
T1:                Analysis ω_h · prescribed ∇_h Vy
V_red:             ω_y,red ≡ 0; R_y,red = −T1
IDENTITY:          (tracerId, historyIndex) → recorded (P, t)
NO INTERPOLATION:  of historical tracer state
AUTHORITY:         queryAnalysisTiltingExplanationAt
                   sibling of queryAnalysisTiltingTendencyAt
ATOMIC:            geometry and numbers from one evaluation
ALIGNMENT:         θ/cos θ only when both norms non-degenerate;
                   T1 = 0 is not automatically orthogonality
ADVECTION:         still Source/DEMO V_total
COLOR:             T1 value/sign; support/validity orthogonal;
                   overlay primitive = sample-i T1, not interval T1
OOD:               gap at unsupported recorded samples; no fake 0
SCALE:             T1_COLOR_SCALE_V1 |T1|_sat = 6.100e-5 s⁻²;
                   symmetric [−sat, +sat]; no |T1|_ε;
                   aggregator max(Qstorm); versioned / reviewable;
                   production object t1ColorScaleV1.ts
GLYPH:             actual atomic Analysis operands at recorded P_i;
                   shared origin visual convention only;
                   injected common s⁻¹→m display scale;
                   θ absent when degenerate;
                   I3 Explore wiring COMPLETE / ACCEPTED
VERIFY:            atomic numbers + provenance; θ display degrees only;
                   domain radians unchanged;
                   BOUNDARY_CONDITIONED typed in verification UI;
                   I3 Explore wiring COMPLETE / ACCEPTED
WHAT-IF:           counterfactual only; magnitudes fixed; θ only;
                   actual remains reference; laboratory unchanged;
                   disabled when alignment is degenerate;
                   no mutation; no prognostic ω_y;
                   visualization convention: ω_h fixed, ∇ hypothetical;
                   I3 Explore wiring COMPLETE / ACCEPTED;
                   dashed presentation polish does not rescale vectors
FOCUS SAMPLE:      one-shot OrbitControls target = recorded P;
                   not Follow; not auto on sample select;
                   Follow OFF then focus; pan remains;
                   Reset View restores storm framing
COMPOSITING:       occupancy depthWrite false; overlay
                   d33ae29 depthTest/depthWrite, later
                   renderOrder; frustumCulled false on
                   FULL and BOUNDARY; computeBoundingSphere
                   after each position rewrite;
                   camera must not toggle overlay presence
                   or change overlay RGB;
                   OOD gaps still occupancy
T1 LEGEND:         Analysis T1 trajectory color legend V1;
                   T1_COLOR_SCALE_V1 domain;
                   ANALYSIS_T1_VALUE_APPEARANCE_V1 ramp;
                   display saturation, not physical extrema;
                   value only; OOD is not zero;
                   visible iff analysisColumn present
TRAJECTORY CACHE:  derived per-lane Analysis projection;
                   append queries only new samples;
                   equivalent to full atomic recompute;
                   PathHistory unchanged; T1 not stored there;
                   encode/write from cache may still scan N
ω_y,current:       not default V1; Slice G NOT AUTHORIZED
TERMINAL:          no authoritative identity in V1;
                   Eulerian lookup allowed; material-endpoint unresolved
HISTORY STORE:     still { position, simulationTime } only
PROJECTION INPUT:  structural { position, simulationTime };
                   not a second history store
COLUMN BESIDE:     Analysis diagnostic sibling of Source EWP;
                   Slice I1 COMPLETE / ACCEPTED at Explore/App
                   data boundary; SOURCE ADVECTS;
                   ANALYSIS EXPLAINS; not V_env rewiring
TRAJECTORY GRAPH:  Slice I2; colored [i, i+1] = Analysis T1
                   at recorded sample i
HISTORICAL PROBE:  Slice I3; exact recorded sample → Slice A
                   → glyph + verification + optional what-if
PICKING:           52 unchanged; overlay / glyphs are not pick sources
BL-010:            PARTIAL; caller Analysis-column sibling
                   available; live V_env rewiring not authorized
IMPLEMENTATION:    SLICES A–F COMPLETE / ACCEPTED as capability;
                   CAL COMPLETE / ACCEPTED V1;
                   LANDING INTEGRATION SLICES I1–I3
                     COMPLETE / ACCEPTED;
                   FEATURE V1 INTEGRATED / COMPLETE
                     except deferred G;
                   SLICE G NOT STARTED / DEFERRED /
                     NOT AUTHORIZED
```

---

## 26. Implementation

Slices A–F are implemented:

```text
src/data/escHrTimeAnalysis/analysisTiltingQuery.ts
  queryAnalysisTiltingExplanationAt
  queryAnalysisTiltingTendencyAt
    scalar projection of the same evaluation

src/data/escHrTimeAnalysis/trajectoryTiltingProjection.ts
  projectAnalysisTiltingAlongRecordedPath
    per-recorded-sample Analysis T1 / support
    TrajectoryTiltingRecordedSample =
      structural { position, simulationTime }
      compatibility with PathHistorySample;
      not a second persisted history model;
      canonical recorder remains TracerPathHistory
    no Simulation / renderer / UI dependency

src/data/escHrTimeAnalysis/trajectoryTiltingRenderEncoding.ts
  encodeTrajectoryTiltingForRender
    pure; Three-free; injected scale required
    sample encodings + earlier-endpoint value segments
    no Analysis query; no production scale

src/data/escHrTimeAnalysis/t1ColorScaleV1.ts
  T1_COLOR_SCALE_V1
    |T1|_sat = 6.100×10⁻⁵ s⁻²; signedUnit ∈ [−1, +1]
    no |T1|_ε; no RGB; does not clip raw T1

src/rendering/trajectoryTiltingOverlay.ts
  optional LineSegments overlay
  FULL vs BOUNDARY as separate objects
  identical endpoint colors; raycast disabled
  occupancy trailGeometry unchanged
  imported by TracerScene (Slice I2); not by App

src/explore/encodeExploreAnalysisTilting.ts
  Slice I2: PathHistory + Analysis column + updraft
  → Slice B projection → Slice C encoding with
    T1_COLOR_SCALE_V1
  null column → no encoding (not zero)

src/explore/exploreAnalysisTiltingProjectionCache.ts
  derived per-lane Analysis projection cache
  append-only: query only new samples
  equivalent to full atomic recompute
  encode/write from cache; Analysis query no longer O(N)
  per append

src/rendering/analysisT1ValueAppearanceV1.ts
  Slice I2 presentation: signedUnit → RGB
  warm / 0 / cool; not CAL

src/rendering/TracerScene.ts
  Slice I2: syncAnalysisTiltingOverlays
  Slice I3: syncAnalysisTiltingGlyph / WhatIfGlyph
  dispose on removeLast / clear / dispose

src/ui/tracer/TracerViewport.tsx
  Slice I2: revision fingerprint + cache encode + scene sync
  Slice I2: Analysis T1 color legend V1 when
    analysisColumn present; not environment-name gated
  Slice I3: pass packaged glyph models; no Analysis query
  Guided does not pass Analysis column

src/ui/tracer/analysisT1ColorLegendV1.ts
src/ui/tracer/AnalysisT1ColorLegend.tsx
  Analysis T1 trajectory color legend V1
  T1_COLOR_SCALE_V1 saturation domain
  ANALYSIS_T1_VALUE_APPEARANCE_V1 CSS ramp
  value only; OOD is not zero

src/data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.ts
  createTrajectoryTiltingGlyphModel
    packages atomic explanation + recorded P_i
    no recomputation of ω_h, ∇_h Vy, T1, θ
    shared origin is visualization convention only

src/rendering/trajectoryTiltingGlyph.ts
  optional 3D mechanism glyph
  injected common display scale; no per-vector normalization
  θ arc only when ALIGNMENT_DEFINED
  raycast disabled
  imported by TracerScene (Slice I3); not by App

src/data/escHrTimeAnalysis/trajectoryTiltingVerification.ts
  createTrajectoryTiltingVerificationModel
    packages atomic T1 / magnitudes / alignment / provenance
    no recomputation; domain θ remains radians

src/ui/tracer/formatTrajectoryTiltingVerification.ts
  display-only scientific / degree / segment formatting

src/ui/tracer/TrajectoryTiltingVerificationPanel.tsx
  read-only Analysis T1 verification panel
  degenerate θ absent; orthogonal θ defined
  recorded P/t and BOUNDARY typed support
  imported by App (Slice I3)

src/data/escHrTimeAnalysis/trajectoryTiltingWhatIf.ts
  createTrajectoryTiltingWhatIfModel
    counterfactual T1_whatif = A·B·cos(θ_whatif)
    actual T1 copied, never recomputed
    ω_h fixed; hypothetical ∇ rotates (visual convention)
    UNAVAILABLE when alignment is not ALIGNMENT_DEFINED

src/rendering/trajectoryTiltingWhatIfGlyph.ts
  optional hypothetical gradient + θ arc
  does not mutate Slice D actual glyph
  injected common display scale; raycast disabled
  imported by TracerScene (Slice I3); not by App

src/ui/tracer/TrajectoryTiltingWhatIfPanel.tsx
  θ-only control; actual vs hypothetical T1
  laboratory state unchanged
  imported by App (Slice I3)

src/app/exploreEnvironmentRepresentations.ts
  exploreEnvironmentRepresentations(identity)
  exploreAnalysisColumn(identity)
  Slice I1: Source + Analysis sibling lookup
  committed ESC goldens + retained TIME;
  Moore / Demo → null

src/app/createExploreLab.ts
  ExploreLab.analysisColumn
  identity selects Source advection + Analysis sibling
  Analysis not passed to Simulation

src/explore/resolveExploreHistoricalAnalysisTilting.ts
  Slice I3: historical (P, t) → Slice A explanation
  packages D/E/F models; no T1 recomputation

src/rendering/analysisT1GlyphDisplayScaleV1.ts
  Slice I3 presentation display-length injection
  §23 item 4 remains OPEN

src/rendering/analysisT1GlyphAppearanceV1.ts
  Slice I3 artistic actual / hypothetical glyph colors
```

Landing Integration Slice I1 holds the Analysis column
beside Source EWP at the Explore/App data boundary.
SOURCE ADVECTS. ANALYSIS EXPLAINS. It is not included in
Slice B–F capability and is not live `V_env` rewiring.

Landing Integration Slice I2 wires the Analysis T1 overlay
along recorded Explore trajectories.

Landing Integration Slice I3 wires the historical-probe
Analysis explanation: exact recorded sample → Slice A →
glyph + verification + optional what-if. Overlay, glyph,
and panels observe; they do not advect.

Slice G is NOT STARTED / DEFERRED / NOT AUTHORIZED:

```text
src/data/escHrTimeAnalysis/     Slice A explanation query
                                Slice B recorded-path projection
                                Slice C pure render encoding
                                CAL V1 T1_COLOR_SCALE_V1
                                Slice D pure glyph model
                                Slice E pure verification model
                                Slice F pure what-if model
src/rendering/trajectoryTiltingOverlay.ts
                                Slice C overlay capability
src/rendering/trajectoryTiltingGlyph.ts
                                Slice D glyph capability
src/rendering/trajectoryTiltingWhatIfGlyph.ts
                                Slice F what-if glyph capability
src/ui/tracer/TrajectoryTiltingVerificationPanel.tsx
                                Slice E verification panel
src/ui/tracer/TrajectoryTiltingWhatIfPanel.tsx
                                Slice F what-if panel
src/app/exploreEnvironmentRepresentations.ts
                                Slice I1 Analysis sibling
src/app/createExploreLab.ts
                                Slice I1 Explore pairing
src/explore/encodeExploreAnalysisTilting.ts
                                Slice I2 encoder
src/rendering/analysisT1ValueAppearanceV1.ts
                                Slice I2 appearance
src/rendering/TracerScene.ts
                                Slice I2 overlay lifecycle
                                Slice I3 glyph / what-if lifecycle
src/ui/tracer/TracerViewport.tsx
                                Slice I2 overlay sync
                                Slice I3 glyph model pass-through
src/explore/resolveExploreHistoricalAnalysisTilting.ts
                                Slice I3 historical explanation
src/app/App.tsx
                                Slice I3 Explore inspector wiring
src/rendering/analysisT1GlyphDisplayScaleV1.ts
                                Slice I3 presentation scale
src/rendering/analysisT1GlyphAppearanceV1.ts
                                Slice I3 glyph appearance
optional ω_y,current            Slice G (NOT AUTHORIZED)
```

Existing `queryAnalysisTiltingTendencyAt` scalar contract
stays. Existing `DiagnosticTiltingTendency` stays.
Existing historical picking stays. `PathHistorySample`
remains `{ position, simulationTime }`.
