# Analysis Tilting Validity Propagation

**Status:** ARCHITECTURE ACCEPTED /
ANALYSIS TILTING VALIDITY CONTRACT SPECIFIED /
HEADLESS ANALYSIS T1 SIBLING IMPLEMENTED /
LIVE CONSUMER REWIRING NOT STARTED / NOT AUTHORIZED
**Scope:** how support-aware Analysis environmental horizontal
vorticity may participate in the existing tilting-tendency
diagnostic. Not a T1 physics reopen. Not a change to existing
`DiagnosticTiltingTendency.sample`. Not live Explore / Guided /
Inspector rewiring. Not hodograph, SRH, bulk shear, Moore
Analysis, or a V1 reopen.
**Physics:** `T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z` remains the
locked identity (`22`). This file records validity / support
propagation and operand provenance. It does not change the
product.
**Implementation:** headless support-aware Analysis T1 sibling
`queryAnalysisTiltingTendencyAt` lives in
`src/data/escHrTimeAnalysis/analysisTiltingQuery.ts`. Live T1
runtime consumers remain out of scope.

Predecessor (not replaced):

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
docs/architecture/58-source-class-aware-analysis-profile-contract.md
docs/architecture/59-high-resolution-esc-time-domain-analysis-integration.md
docs/architecture/60-analysis-consuming-diagnostic-support-contract.md
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/physics/06-horizontal-vorticity.md
docs/physics/15-vertical-updraft-envelope.md
```

Index (not SoT):

```text
docs/PROJECT_BACKLOG.md   BL-010, BL-048
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING
NEW PROJECT DECISION
ANTI-CLAIM
```

---

## 1. Why this gate exists

**CURRENT FACT.** Architecture `60` implemented headless
support-aware Analysis native-segment `ω_h`:

```text
queryAnalysisNativeSegmentVorticityAt(...)
  FULL_SUPPORT | BOUNDARY_CONDITIONED | OUT_OF_DOMAIN |
  COLUMN_UNAVAILABLE
```

Live T1 still samples `DiagnosticTiltingTendency.sample → number`
on the injected `EnvironmentalWindProfile` (Explore = Source;
Guided = DEMO). Architecture `60` stated, but did not specify,
the T1 consequence:

```text
validity(T_tilt,y)  ≤  validity(ω_h Analysis)
```

This file owns that consequence. Switching the environmental
wind representation does **not** convert prescribed storm-local
operands into observations.

---

## 2. Authority split

**STILL-BINDING.**

| Authority | Owns |
| --- | --- |
| `22` | T1 identity, world map, vortex-couple geometry, anti-claims |
| `26` | existing numeric T1 owner, segment picker, outside-sounding `0`, analytic `∇_h Vy` |
| `15` | prescribed updraft formula; analytic `∂Vy/∂x`, `∂Vy/∂z` |
| `06` / `05` | atmospheric `ω_h` from finite-layer shear |
| `59` | ESC FIR; sample-level FILTER support; derivative-sensitive inference requires FULL |
| `60` | FILTER ≠ diagnostic support; Analysis `ω_h` query; no silent fallback |
| **this file (`61`)** | Analysis T1 validity, mixed epistemic origin, sibling vs existing T1, first T1 Analysis slice |

Do **not** reopen `22` / `26` physics. Do **not** change
legacy Source / DEMO T1 `0` outside the sounding.

---

## 3. Production T1 audit (CURRENT FACT)

Verified against live `src/**` and `22` / `26`. No material
contradiction was found.

### 3.1 Identity

```text
T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
         = ω_h^{world} · ∇_h Vy
```

World map (`22` §6 / §8.3; live helper):

```text
ω_x = omegaEastward
ω_z = −omegaNorthward
```

Atmospheric map (`06`; live `horizontalVorticityFromShear`):

```text
omegaEastward  = −shearNorthward
omegaNorthward =  shearEastward
```

Atmospheric equivalent (`22` §8.3):

```text
T_tilt,y = ω_e ∂Vy/∂x − ω_n ∂Vy/∂z
```

Units: `s⁻²`. Signed. Existing production normalizes IEEE
signed zero: `T === 0 ? 0 : T`.

This is a **kinematic diagnostic product**, not `Dω_y / Dt`,
not observed storm reconstruction, and not Candidate A
(`ω_y,current` from prescribed rotation; `23`).

### 3.2 Owner and path

```text
src/physics/diagnostics/DiagnosticTiltingTendency.ts
  class DiagnosticTiltingTendency
    constructor({ profile, updraft })
    sample(position: Vec3, time: number) → number

  soundingSegmentContainingHeight(profile, height)
    → { hLo, hHi } | null

  worldHorizontalVorticityFromAtmospheric(ω_h)
    → { omegaX, omegaZ }
```

Composition (`composeDemoTracersWithObservation`):

```text
new DiagnosticTiltingTendency({
  profile: composed.profile,
  updraft: composed.updraftField,
})
```

T1 **owns** (holds) the injected `EnvironmentalWindProfile` and
`VerticalEnvelopeUpdraftField`. It does not own Analysis
support. It does not read `EscHrTimeAnalysisColumn`.

Live consumers sample the number:

```text
ExploreLab.tiltingTendency.sample
GuidedLab.tiltingTendency.sample
PointDiagnosticObservation.tiltingTendency   // number, s⁻²
```

### 3.3 Algorithm (live `sample`)

```text
1. non-finite P or t → DiagnosticTiltingTendencyError
2. segment = soundingSegmentContainingHeight(profile, P.y)
3. ∇_h Vy = updraft.horizontalGradientOfVerticalVelocity(P, t)
4. if segment === null → return 0
5. shear = verticalWindShearBetween(profile, hLo, hHi)
6. ω_h = horizontalVorticityFromShear(shear)
7. (ω_x, ω_z) = worldHorizontalVorticityFromAtmospheric(ω_h)
8. return ω_x * dVyDx + ω_z * dVyDz   (signed-zero → +0)
```

Existing T1 **does** receive / own `EnvironmentalWindProfile`.
It does **not** receive Analysis support state.

### 3.4 Containing segment

Same half-open contract as `26` §6.1 and Analysis `ω_h`
(`60`; `nativeContainingSegment` in `analysisQuery.ts`):

```text
y ∈ [h_i, h_{i+1})  →  layer [h_i, h_{i+1}]
y ∈ [h_{n-1}, h_n]  →  layer [h_{n-1}, h_n]
```

Interior knots take the **upper** segment. `minHeight` uses
the first segment. `maxHeight` uses the last segment. No
epsilon knot snap. No adjacent-segment average at a kink.
No clamp. No one-sided FIR salvage.

### 3.5 Outside the sounding (legacy zero)

```text
P.y < minHeight  or  P.y > maxHeight
  → soundingSegmentContainingHeight = null
  → T_tilt,y = 0
  → verticalWindShearBetween is not called
```

`26` §6.2: this `0` is the defined Source / DEMO scalar-field
continuation (curl of height-clamped homogeneous wind). It is
**not** “no observation token,” **not** FIR-boundary, **not**
missing Analysis column.

Tests lock: updraft `∇_h Vy` may be nonzero below/above the
sounding; T1 is still `0`.

### 3.6 Knots and endpoints

| Query | Existing T1 |
| --- | --- |
| Interior of a segment | that segment’s constant `ω_h` · `∇_h Vy` |
| Interior knot | **upper** segment |
| `y = minHeight` | first segment; numeric T1 (not the outside-sounding `0`) |
| `y = maxHeight` | last segment; numeric T1 |
| Native knots | IEEE identity with stored heights |
| Clamp | **none** on T1; outside range is `0`, not clamped shear |

### 3.7 Updraft gradient (live)

```text
VerticalEnvelopeUpdraftField.horizontalGradientOfVerticalVelocity(P, t)
  → { dVyDx, dVyDz }   // s⁻¹
```

Analytic (`15`, `22` §11, `26` §8):

```text
∂Vy/∂x = W0 F(y) E_r (−dx / σ²)
∂Vy/∂z = W0 F(y) E_r (−dz / σ²)
```

Closed interval: if `y ≤ y_b` or `y ≥ y_t`, both components
are exactly `0` (`F = 0`; lids included). Axis `dx = dz = 0`
→ `0`. Far field → `0` (Gaussian). Non-finite `P` or `t` →
`VerticalEnvelopeUpdraftFieldError`.

T1 computes this **internally** from the held updraft instance.
It does not receive a precomputed gradient from the caller.

The gradient is defined at every finite world point. Zeros are
**physical**, not unavailability.

---

## 4. D1 / D2 — Operands

**NEW PROJECT DECISION.** Exact T1 identity is §3.1. Operand
table:

| Operand | Kind | Source of numbers | Analysis candidate? | Can be Analysis-unavailable? | Provenance owner |
| --- | --- | --- | --- | --- | --- |
| Environmental `ω_h` | vector (atmospheric east/north; world `(ω_x, ω_z)` after T1 map) | native containing-segment two-point shear of the injected profile | **yes** — `queryAnalysisNativeSegmentVorticityAt` | **yes** | environmental profile / Analysis column |
| `∇_h Vy` | vector `(∂Vy/∂x, ∂Vy/∂z)` | analytic prescribed updraft | **no** | **no** (finite `P,t` always yields a number) | `VerticalEnvelopeUpdraftField` (`15`) |
| Evaluation point | geometry | world `P = (x, y, z)` | n/a | non-finite → error, not a support state | caller |
| Laboratory time `t` | clock passthrough | forwarded to the updraft method; current fields ignore it | n/a | non-finite → error | caller |

```text
observed / Source-derived:     current live environmental ω_h
                               (Explore Source; Guided DEMO knots)
Analysis-derived candidate:    environmental ω_h only
prescribed storm-local:        ∇_h Vy of VerticalEnvelopeUpdraftField
geometry / query-derived:      P; height = P.y; containing segment
```

**ANTI-CLAIM.** Replacing Source `V_env(h)` with Analysis
`V_env(h)` does **not** make `∇_h Vy`, Ω, or `T_tilt,y` as a
whole into an observation.

---

## 5. Support validity vs provenance class

**NEW PROJECT DECISION.**

Two different questions. They MUST NOT share one slogan.

### 5.1 Support validity

Property of the **Analysis-derived environmental operand**
(and of any Analysis diagnostic that consumes it):

```text
FULL_SUPPORT
BOUNDARY_CONDITIONED
OUT_OF_DOMAIN
COLUMN_UNAVAILABLE
```

This is Architecture `60` diagnostic / query validity. It
answers whether the Analysis FIR / stencil / domain policy
accepts the environmental contribution.

### 5.2 Provenance class / epistemic origin

Property of **each operand’s origin**:

```text
Analysis-derived environmental ω_h
  observed Source column
    → named ESC TIME-domain transform
    → Analysis V(h)
    → native-segment ω_h

prescribed storm-local ∇_h Vy
  laboratory VerticalEnvelopeUpdraftField
  not observed
  not Analysis
  not Source
```

`FULL_SUPPORT` on Analysis T1 means §14. It does **not** mean
the updraft was measured, the supercell was observed, or T1 is
an observational field.

---

## 6. D3 — Validity cannot exceed upstream Analysis `ω_h`

**NEW PROJECT DECISION.** Confirming `60` §14.

```text
VALIDITY(T1_analysis)  ≤  VALIDITY(ω_h_analysis)
```

Justification from dependency, not from taste:

```text
T_tilt,y is the product of two operands.
Only the environmental ω_h operand carries Analysis
  diagnostic support.
The prescribed ∇_h Vy operand has no Analysis support
  state and is defined at every finite P.
A product cannot be better-supported Analysis evidence
  than the Analysis operand it multiplies.
Prescribed mathematics cannot upgrade FIR / stencil
  support.
Prescribed mathematics also cannot invent environmental
  Analysis evidence where the column is missing or the
  height is out of domain.
```

With the current prescribed updraft, **equality holds**:

```text
VALIDITY(T1_analysis)  =  VALIDITY(ω_h_analysis)
```

The prescribed operand does not introduce additional Analysis
states. Do not build a validity lattice for it.

If a later non-analytic `∇_h Vy` source had its own domain
holes, that would be a new SoT. This file does not invent
observational support for the prescribed field.

**ANTI-CLAIM.** `F = 0` (outside the updraft layer, lids) is
physical T1 zero, not `OUT_OF_DOMAIN` and not weaker validity.

---

## 7. D12 — Prescribed updraft-gradient semantics

**STILL-BINDING** from `15` / `22` / `26`.

```text
identity:     VerticalEnvelopeUpdraftField analytic ∇_h Vy
coordinates:  world; ∂/∂x east, ∂/∂z south; height = P.y
position:     depends on (x − centerX, z − centerZ) and F(y)
domain:       all finite world points
unavailable:  no; zeros are physical
computed:     internally by existing T1; Analysis sibling
              must call the same method on the same type
```

Do **not** call this operand `FULL_SUPPORT`.
Do **not** invent observational support for it.
Do **not** treat Gaussian decay or `F = 0` as Analysis
unavailability.

---

## 8. D13 — Query coordinate mapping

**NEW PROJECT DECISION.** No new transform.

```text
world P = (x, y, z)
  x, z → prescribed ∇_h Vy (radial geometry vs updraft axis)
  y    → height, provider-neutral world Y (`04`, `48`)
       → Analysis containing segment (`26` §6.1 / `60`)
       → Analysis ω_h
T_tilt,y(P, t) = ω_h^{world}(y) · ∇_h Vy(P, t)
```

`t` is forwarded to the updraft method. Analysis `ω_h` does
not depend on `t`.

Height domain for the environmental operand is the Analysis
profile `[minHeight, maxHeight]`, then narrowed by native-
segment FULL / BOUNDARY stencil rules (`60`). Horizontal
`(x, z)` does not change Analysis support.

---

## 9. Result semantics

**NEW PROJECT DECISION.**

Analysis T1 is a **typed query result**, not a total function
to `number`. Existing numeric T1 remains a total function
(`26` §11).

| ω_h Analysis status | Analysis T1 status | Numeric `T_tilt,y` |
| --- | --- | --- |
| `FULL_SUPPORT` | `FULL_SUPPORT` | **yes** — identity §3.1 |
| `BOUNDARY_CONDITIONED` | `BOUNDARY_CONDITIONED` | **yes** — same identity; never FULL |
| `OUT_OF_DOMAIN` | `OUT_OF_DOMAIN` | **no** |
| `COLUMN_UNAVAILABLE` | `COLUMN_UNAVAILABLE` | **no** |

Do **not** use `0`, `NaN`, or Source T1 as unavailable
Analysis T1.

### 9.1 D5 — BOUNDARY_CONDITIONED T1 (policy 1)

**Selected:** computable + explicitly labeled.

Matches the Analysis `ω_h` query (`60` §10): the numeric
two-point product remains mathematically defined; eligibility
as **production Analysis inference** is a separate bit.

```text
Query:     BOUNDARY_CONDITIONED + value
Inference: ANALYSIS_FULL_SUPPORT_REQUIRED
           BOUNDARY T1 is not eligible as fully supported
           Analysis tilting inference (`59` §18)
UI:        out of this slice; labeled “computed but
           boundary-conditioned” is a legal later use of
           the retained number
```

Not policy 2 (erase the number): that would hide a defined
product and break identity tests at mixed/boundary segments.
Not a third consumer framework: tests and a later labeled
inspector may read the number; live Explore is not switched.

`59` D10 “not eligible as reliable environmental vorticity”
is the **inference** rule. It is not a requirement that the
query omit the number. Architecture `60` already made this
split for `ω_h`. T1 inherits it.

### 9.2 D6 — OUT_OF_DOMAIN

If query world `Y` is outside the Analysis profile domain:

```text
Analysis ω_h = OUT_OF_DOMAIN
Analysis T1  = OUT_OF_DOMAIN
no numeric T1
```

Prescribed `∇_h Vy` may still be nonzero there. That does
**not** rescue missing environmental Analysis evidence.
Do not use legacy T1 `0`. Do not clamp.

### 9.3 D7 — COLUMN_UNAVAILABLE

Moore, failed ESC Analysis construction, or missing column:

```text
Analysis T1 = COLUMN_UNAVAILABLE
no numeric Analysis T1
no Source fallback
```

Existing Source / DEMO T1 remains independently usable if the
caller **explicitly** uses `DiagnosticTiltingTendency` on the
Source / DEMO profile.

---

## 10. D8 / D9 — Physical zero vs legacy zero

**NEW PROJECT DECISION.**

A legitimate T1 value can equal `0` (axis, lids, `F = 0`,
`ω_h ⊥ ∇_h Vy`, zero shear on a FULL–FULL segment).

```text
numeric 0 + FULL_SUPPORT
  ≠  OUT_OF_DOMAIN
  ≠  COLUMN_UNAVAILABLE
  ≠  BOUNDARY_CONDITIONED
  ≠  legacy Source/DEMO T1 0 outside sounding
```

Validity is not stored in the number. Do not overload `0`.

Existing T1 `0` outside sounding **remains** on the numeric
path (`26` §6.2). Architecture 61 does **not** reinterpret
that historical zero and does **not** change it.

```text
legacy Source/DEMO T1:  total function; 0 outside sounding
Analysis T1 sibling:    typed; OOD / COLUMN_UNAVAILABLE have
                        no value; physical 0 only with an
                        explicit FULL or BOUNDARY status
```

Future UI, if any, must distinguish numeric physical zero from
unavailable. UI is not this slice.

---

## 11. D10 — Sibling, not a T1 return-type change

**NEW PROJECT DECISION.**

Keep `DiagnosticTiltingTendency.sample(P, t) → number`
unchanged.

Add a support-aware Analysis sibling:

```text
queryAnalysisTiltingTendencyAt(
  column,   // EscHrTimeAnalysisColumn | null | undefined
  updraft,  // VerticalEnvelopeUpdraftField
  position, // world Vec3
  time,     // laboratory t
) → typed Analysis T1 result
```

It consumes:

```text
queryAnalysisNativeSegmentVorticityAt(column, P.y)
  +
updraft.horizontalGradientOfVerticalVelocity(P, t)
  +
existing world map and dot product
```

Why not change existing T1:

```text
live Explore / Guided / PointDiagnosticObservation consume a number
support semantics are required by Analysis, not by DEMO T1
forcing a union onto DiagnosticTiltingTendency would push FIR
  support into all current physics consumers
no generic diagnostic framework is introduced
```

**Forbidden:** constructing `DiagnosticTiltingTendency` on an
Analysis `EnvironmentalWindProfile` and calling `.sample` as
if that were Analysis T1. That path has no support labels and
would reuse legacy `0` for out-of-domain heights.

The Analysis query module must **not** call
`DiagnosticTiltingTendency.sample`. It may reuse or duplicate
`worldHorizontalVorticityFromAtmospheric`. It already
duplicates containing-segment lookup so Analysis queries do
not depend on the T1 class (`60`). Keep that isolation.

Conceptual result (names may change in implementation):

```text
FULL_SUPPORT | BOUNDARY_CONDITIONED
  representation = Analysis
  method = native-containing-segment
  physicalIdentity = T_tilt,y
  value: number
  segment { hLo, hHi }
  provenance: reference column.provenance
  environmentalOperand = Analysis native-segment ω_h
  stormLocalOperand = prescribed-updraft-∇_h Vy

OUT_OF_DOMAIN
  representation = Analysis
  provenance reference
  no value

COLUMN_UNAVAILABLE
  no value
```

Non-finite `P` or `t`: invariant error (same class of failure
as existing T1 / Analysis height asserts). Not a support state.

---

## 12. D11 — Representation declaration

**NEW PROJECT DECISION.** Fits `60` §11.

```text
Diagnostic family T1
  SOURCE_OR_ANALYSIS_EXPLICIT_MODE

Existing DiagnosticTiltingTendency
  support-unaware numeric T1 on the injected profile
  live Explore: Source profile  → Source representation in practice
  live Guided:  DEMO profile
  not Analysis-capable by injection

Analysis sibling query
  representation = Analysis
  production inference = ANALYSIS_FULL_SUPPORT_REQUIRED
  query retains BOUNDARY numbers as labeled computable values
    (same split as Analysis ω_h)
```

```text
caller chooses which API
both may coexist for comparison
no silent Source → Analysis
no silent Analysis → Source
no global V_env replacement
representation selection is owned by the caller, not by T1 physics
```

Existing T1 is **not** silently relabeled Analysis-capable.

---

## 13. D14 — Provenance

**NEW PROJECT DECISION.** Traceable without a giant DTO.

Analysis T1 references `column.provenance` and adds only what
T1 itself owns:

```text
Source record identity          column.provenance.sourceIdentity
transform id / version          esc-hr-time-hamming-sinc-lowpass / v1
representation                  Analysis
environmental ω_h method        native-containing-segment
environmental support status    FULL_SUPPORT | BOUNDARY_CONDITIONED |
                                OUT_OF_DOMAIN | COLUMN_UNAVAILABLE
prescribed storm-local operand  VerticalEnvelopeUpdraftField
                                analytic ∇_h Vy (`15`, `22` §11)
T1 physical identity            T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
                                (`22`)
```

**Mandatory honesty:** mixed epistemic origin is explicit.

```text
observed-derived Analysis environmental ω_h
  +
prescribed storm-local ∇_h Vy
  =
prescribed kinematic tilting diagnostic using an Analysis
environmental operand

NOT an observed T1 field
NOT observed supercell tilting
NOT a reconstruction of a historical mesocyclone
```

Do not clone FIR kernel metadata onto every scalar. Do not
put prescribed-updraft DEMO numbers into Analysis provenance.

---

## 14. D4 — Meaning of FULL_SUPPORT T1

**NEW PROJECT DECISION.**

```text
T1 status = FULL_SUPPORT
  means:
    the Analysis-derived environmental-vorticity operand used
    by this prescribed kinematic tilting diagnostic has full
    Analysis diagnostic support
    (native containing-segment stencil: both knots FULL_SUPPORT).
```

It does **not** mean:

```text
observed supercell
observed updraft
observed storm reconstruction
all T1 operands observationally supported
forecast validity
Dω_y / Dt of a real storm
explanation of prescribed Ω
```

---

## 15. D15 — No fallback, no mixing

**NEW PROJECT DECISION.**

```text
NO silent Analysis → Source T1 when Analysis T1 is unavailable
NO hybrid Source/Analysis environmental stencil
NO feeding Source ω_h into the Analysis T1 query
NO feeding Analysis ω_h into DiagnosticTiltingTendency.sample
   as a substitute Analysis API
NO NaN / 0 as Analysis unavailable
```

Source T1 and Analysis T1 are explicit siblings / modes.

---

## 16. Scientific honesty (Q1–Q5)

**Q1. If Analysis environmental `ω_h` is FULL_SUPPORT, is T1
now an observed tilting tendency?**

**NO.**

FULL_SUPPORT qualifies the Analysis environmental operand.
T1 remains `ω_h · ∇_h Vy` with prescribed `∇_h Vy`. There is
no observed tilting field. `48` §9.3 already forbids reading
an imported column as making the storm real. Analysis does
not weaken that anti-claim.

**Q2. Can prescribed updraft-gradient multiply Analysis-derived
environmental vorticity without violating Source/Analysis
separation?**

**YES.**

Source vs Analysis is a split of the **environmental wind
representation**. Forbidden mixing is a hybrid environmental
stencil or silent fallback (`60`). The updraft is a different
epistemic class: prescribed storm-local laboratory field.
That combination is already T1 v1 (`22`, `48` §9): environment
may change; operands 2–7 stay prescribed. Analysis is a
declared derived representation of that environment, not a
new storm.

Epistemic meaning: a **laboratory kinematic product** of
Analysis-scale environmental vorticity and a prescribed
updraft gradient. Scientifically honest iff both origins stay
named.

**Q3. Can BOUNDARY_CONDITIONED `ω_h` produce a numeric T1?**

**YES**, on the query. Status remains `BOUNDARY_CONDITIONED`.

Allowed claim: mathematically computable T1 whose
environmental operand used FIR boundary extension.

Forbidden claim: fully supported Analysis tilting inference;
observed launch / end-of-flight derivative; FULL_SUPPORT.

**Q4. Can Source T1 be used automatically when Analysis T1 is
unavailable?**

**NO.**

**Q5. Does FULL_SUPPORT T1 mean all operands are
observationally supported?**

**NO.** See §5 and §14.

---

## 17. D16 — First implementation target

**NEW PROJECT DECISION.** Smallest architecture-clean slice:

```text
headless support-aware Analysis tilting-tendency sibling query
queryAnalysisTiltingTendencyAt(...)
using:
  queryAnalysisNativeSegmentVorticityAt
  + existing prescribed updraft-gradient physics
without touching existing T1 runtime consumers
```

Module family: `src/data/escHrTimeAnalysis/analysisTiltingQuery.ts`.
Function name above is the locked capability.

**IMPLEMENTED** headless:

```text
typed Analysis T1 result as §9 / §11
tests in §18
Goshen / Prospect / Dumas columns
Moore / missing column → COLUMN_UNAVAILABLE
physical-zero vs unavailable
numeric identity vs §3.1 on the same Analysis ω_h + ∇_h Vy
```

**Out of scope for that implementation:**

```text
DiagnosticTiltingTendency.sample signature or 0-outside-sounding
live Explore / Guided / Inspector / PointDiagnosticObservation
environment selection
scene / runtime
Analysis transform / Source
hodograph / SRH / bulk
UI Source-versus-Analysis toggle
generic diagnostics framework
new derivative stencil
```

Tests first. Live consumers remain out of scope.

---

## 18. D17 — Test matrix

Required of the sibling implementation:

```text
1.  FULL ω_h → FULL T1 + numeric value
2.  BOUNDARY ω_h → BOUNDARY T1, never FULL
3.  OOD → OOD T1, no numeric value
4.  COLUMN_UNAVAILABLE → same, no Source fallback
5.  exact FULL knot whose native-segment derivative is BOUNDARY
    → T1 BOUNDARY (26 upper-segment / 60 mixed-stencil rule)
6.  numeric FULL T1 equals the existing physical identity
    applied to the same Analysis ω_h + prescribed ∇_h Vy
7.  boundary numeric value, if exposed, equals the same identity
8.  physical zero with FULL support remains distinguishable
    from unavailable
9.  Source / existing DiagnosticTiltingTendency unchanged
    (including 0 outside sounding)
10. no T1 legacy zero used for Analysis unavailable
11. Goshen
12. Prospect
13. Dumas
14. Moore unavailable (COLUMN_UNAVAILABLE)
15. Guided unchanged
16. no UI / Explore rewiring
```

Additional locks implied by the contract:

```text
F = 0 (lids / outside updraft layer) + FULL ω_h → FULL T1 + 0
axis + FULL ω_h → FULL T1 + 0
non-finite P or t → error, not a support state
no DiagnosticTiltingTendency.sample in the Analysis T1 module
no NaN as unavailable
```

---

## 19. Guided / Explore / other diagnostics

**STILL-BINDING.**

```text
Guided remains DEMO. Architecture 61 does not cause Guided
  to require ESC Analysis. No Guided behavior change.

Explore observed environments currently use Source.
Architecture 61 does not switch Explore. No implicit
  Analysis T1 in live Explore.

Hodograph / SRH / bulk / Moore Analysis / filter choice /
  source-class transform selection: out of scope.
```

Candidate A (`DiagnosticVerticalVorticity`) remains rotation-
only and does not consume the environmental profile.

---

## 20. Existing Source / DEMO T1 status

**CURRENT FACT.** Unchanged by this file.

```text
CLOSED headless diagnostic (`26`)
sample → signed number s⁻²
0 outside sounding
wired from composeDemoTracerFields profile + updraft
Explore: injected observed Source profile
Guided: DEMO profile
support-unaware
```

Future Source-versus-Analysis comparison, if authorized later,
must call the two APIs explicitly.

---

## 21. Decisions

```text
D1   T1 identity remains T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
     (`22`). World map ω_x = ω_e, ω_z = −ω_n.

D2   Environmental ω_h is the only Analysis-derived operand.
     ∇_h Vy is prescribed storm-local. P is geometry.
     Switching V_env representation does not observe the updraft.

D3   VALIDITY(T1_analysis) ≤ VALIDITY(ω_h_analysis).
     Currently equality: prescribed ∇_h Vy adds no Analysis state.

D4   FULL_SUPPORT T1 = full Analysis diagnostic support of the
     environmental-vorticity operand of this prescribed kinematic
     tilting diagnostic. Not “T1 is observed.”

D5   BOUNDARY T1: computable + labeled; never FULL.
     Production inference remains FULL-required (`59` §18).

D6   OUT_OF_DOMAIN Analysis T1: no numeric value. No legacy 0.

D7   COLUMN_UNAVAILABLE Analysis T1: no numeric value.
     No Source fallback.

D8   Numeric 0 + FULL_SUPPORT is distinct from every unavailable
     state. Validity is not stored in the number.

D9   Legacy Source/DEMO T1 0 outside sounding remains on that
     path only. Not reinterpreted. Not reused for Analysis.

D10  Sibling query; do not modify DiagnosticTiltingTendency
     return type.

D11  Family = SOURCE_OR_ANALYSIS_EXPLICIT_MODE.
     Existing T1 stays support-unaware numeric (live: Source/DEMO).
     Analysis sibling is explicit Analysis. Caller chooses.
     Both may coexist. No silent switch.

D12  ∇_h Vy = analytic VerticalEnvelopeUpdraftField;
     defined everywhere finite; zeros are physical.

D13  P.y = height = world Y → containing segment → Analysis ω_h.
     No new coordinate transform.

D14  Provenance: reference column.provenance + T1 identity +
     prescribed-updraft operand class + native-segment method +
     support status. Mixed origin must stay explicit.

D15  No Analysis→Source fallback. No hybrid environmental stencil.

D16  First implementation: headless queryAnalysisTiltingTendencyAt.

D17  Test matrix §18.

D18  Headless sibling IMPLEMENTED in analysisTiltingQuery.ts.
     Live rewiring NOT AUTHORIZED.
```

---

## 22. Gate verdict

```text
ARCHITECTURE ACCEPTED
ANALYSIS TILTING VALIDITY CONTRACT SPECIFIED
HEADLESS ANALYSIS T1 SIBLING IMPLEMENTED
LIVE CONSUMER REWIRING NOT STARTED / NOT AUTHORIZED
```

Implemented object: the narrow headless support-aware Analysis
tilting-tendency sibling query named in §17.

Not authorized: live T1 rewiring, Explore Source → Analysis,
Guided consumption, Inspector / UI, SRH, hodograph overlay.

No research blocker. Production T1 identity and operand split
are already in `22` / `26` / `60`. Combining Analysis `ω_h`
with prescribed `∇_h Vy` is the existing laboratory product
with a declared Analysis environmental operand.

---

## 23. Anti-claims

```text
FULL_SUPPORT T1 is not an observed tilting field
prescribed ∇_h Vy is not FULL_SUPPORT observational data
Analysis T1 is not observed supercell reconstruction
legacy T1 0 outside sounding is not Analysis unavailable
physical T1 0 is not unavailable
BOUNDARY T1 is not FULL
prescribed ∇_h Vy does not rescue OOD / COLUMN_UNAVAILABLE ω_h
Source T1 is not a fallback Analysis T1
injecting Analysis EWP into DiagnosticTiltingTendency is not
  Analysis T1
this file does not rewire Explore / Guided / live T1
this file does not reopen 22 / 26 physics
live T1 integration is out of this sibling slice
```

---

## 24. Compact lock-in

```text
IDENTITY:          T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
ENV OPERAND:       Analysis native-segment ω_h (60 query)
STORM OPERAND:     prescribed analytic ∇_h Vy
VALIDITY:          T1_analysis = ω_h_analysis  (≤ in general)
FULL T1:           full Analysis support of environmental ω_h
                   in this prescribed kinematic product
BOUNDARY:          labeled number; never FULL; not inference
OOD / COLUMN:      no number; no 0; no Source fallback
ZERO:              physical 0 ≠ unavailable ≠ legacy OOS 0
EXISTING T1:       unchanged number API; 0 outside sounding
SIBLING:           queryAnalysisTiltingTendencyAt
REPRESENTATION:    explicit Source vs Analysis; caller-owned
PROVENANCE:        mixed origin named; reference column
GUIDED / EXPLORE:  unchanged
FIRST SLICE:       headless sibling IMPLEMENTED
                   (analysisTiltingQuery.ts)
BL-010:            column core IMPLEMENTED;
                   support-aware ω_h IMPLEMENTED;
                   Analysis T1 sibling IMPLEMENTED;
                   live consumer rewiring NOT STARTED /
                   NOT AUTHORIZED
```

---

## 25. Implementation

Headless sibling is implemented:

```text
src/data/escHrTimeAnalysis/analysisTiltingQuery.ts
  queryAnalysisTiltingTendencyAt
```

Existing `DiagnosticTiltingTendency` and live labs are unchanged.
Live Explore / Guided / Inspector rewiring is out of this slice.

Successor (Trajectory Tilting Explorer V1; does not replace
this validity contract and does not complete BL-010 live
`V_env` rewiring):

```text
docs/architecture/62-trajectory-tilting-explorer-v1.md
```
