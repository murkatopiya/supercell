# Analysis-Consuming Diagnostic Support Contract

**Status:** ARCHITECTURE ACCEPTED /
DIAGNOSTIC SUPPORT CONTRACT SPECIFIED /
HEADLESS NATIVE-SEGMENT QUERY IMPLEMENTED /
LIVE CONSUMER REWIRING NOT STARTED / NOT AUTHORIZED
**Scope:** how diagnostics may consume Source versus Analysis,
and how FIR filter support propagates through interpolation,
native-segment shear, and layer queries. Not a Source rewrite.
Not a new FIR. Not a change to `EnvironmentalWindProfile`.
Not diagnostic rewiring of live Explore / Guided / T1.
Not hodograph UI. Not Moore. Not a V1 reopen.
**Physics:** existing shear / vorticity / SRH / T1 identities
are not reopened. This file records how Analysis *support*
applies to those already-defined computations.
**Implementation:** headless support-aware native-segment
Analysis wind / shear / `ω_h` query lives in
`src/data/escHrTimeAnalysis/analysisQuery.ts`. Live
Explore / Guided / T1 / SRH / hodograph rewiring is not
included.

Predecessor (not replaced):

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/architecture/55-analysis-profile-generalization-gate.md
docs/architecture/58-source-class-aware-analysis-profile-contract.md
docs/architecture/59-high-resolution-esc-time-domain-analysis-integration.md
```

Physics / architecture of existing diagnostics:

```text
docs/physics/04-environmental-wind-profile.md
docs/physics/05-vertical-wind-shear.md
docs/physics/06-horizontal-vorticity.md
docs/physics/08-streamwise-crosswise-vorticity.md
docs/physics/09-storm-relative-helicity.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
```

Index (not SoT):

```text
docs/PROJECT_BACKLOG.md   BL-010, BL-011, BL-012
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

**CURRENT FACT.** Architecture `59` specified the ESC
Analysis transform and authorized a headless column:

```text
native ESC
  → ESC measurement TIME carrier
  → internal 1 s QC-gap reconstruction
  → esc-hr-time-hamming-sinc-lowpass / v1
  → Analysis EnvironmentalWindProfile at Source heights
  → sample-level FILTER support:
       FULL_SUPPORT | BOUNDARY_CONDITIONED
```

Consumers are not wired. Live Explore remains Source.
Guided remains DEMO. Hodograph remains Source.

**CURRENT FACT.** Architecture `59` defines *filter*
support on Analysis samples in TIME:

```text
FULL_SUPPORT iff  t_first + 40  ≤  t  ≤  t_last − 40
else BOUNDARY_CONDITIONED
```

**The problem this file owns:** a diagnostic at height `h`
is not in general a function of a single Analysis sample
`V(h)`. Interpolation, native-segment shear, and layer
integrals use multiple knots. Therefore:

```text
Analysis sample FULL_SUPPORT
  ≠
diagnostic evaluated at that location has FULL
observational / filter support
```

That distinction is the central gate question. Architecture
`59` remains authority for the transform. This file
governs diagnostic consumption and support propagation.

---

## 2. Authority split

**STILL-BINDING.**

| Authority | Owns |
| --- | --- |
| `48` | provider-neutral `EnvironmentalWindProfile`; interpolation / clamp as advection convenience |
| `58` | Source → Analysis contract; diagnostics must declare operand |
| `59` | ESC TIME-domain FIR, sample-level FILTER support, 0–1 km Analysis SRH BOUNDARY_CONDITIONED, no silent splice |
| `04` / `05` / `06` / `09` / `22` / `26` | interpolation, shear, vorticity, SRH Form B, T1 native-segment `ω_h` |
| **this file (`60`)** | diagnostic support vs filter support; query ownership; consumer declaration; first consumer slice |

Do **not** reopen BL-046 / FIR-40 unless a later document
finds a contradiction with this contract. None is found
here.

---

## 3. Production semantics discovered (not redesigned)

This section is **CURRENT FACT** from live `src/**` and
the owning physics / architecture SoT. Architecture `60`
does **not** authorize changing these algorithms.

### 3.1 Interpolation (`EnvironmentalWindProfile.sampleAtHeight`)

```text
exact knot          → that knot's wind
between knots       → linear eastward / northward;
                      vertical remains 0
h < minHeight or
h > maxHeight       → clamp to nearest endpoint wind
```

Exact-knot matching uses IEEE identity with stored knot
heights (`===`). The constructor forbids duplicate or
non-strictly-increasing heights. There is no epsilon
knot snap.

`height === minHeight` and `height === maxHeight` are
in-domain exact knots, not clamp.

### 3.2 Clamp

Clamp is an **advection convenience**, not observation
(`04`, `48` §2.3, `05` §8).

`verticalWindShearBetween` and
`stormRelativeHelicityBetween` **reject** any layer that
needs clamp (`h0 < minHeight` or `h1 > maxHeight`) with an
error. They do not invent zero shear / zero SRH there.

This file does **not** change global advection clamp.

### 3.3 Vertical derivative / horizontal vorticity

There is **no** production pointwise analytic `dV/dz`.
There is **no** production fixed-`Δh` central, forward,
or backward finite-difference API.

Production shear is a **finite-layer two-point difference**
(`05`):

```text
verticalWindShearBetween(profile, h0, h1)
  V0 = sampleAtHeight(h0)
  V1 = sampleAtHeight(h1)
  shear = (V1 − V0) / (h1 − h0)
```

On one piecewise-linear segment that difference **is** the
constant segment gradient. Across kinks it is the
layer-average change over the requested interval.

Horizontal vorticity is the map (`06`):

```text
omegaEastward  = −shearNorthward
omegaNorthward =  shearEastward
```

T1 and native-segment overlays do **not** pick an
independent `δh`. They use the **containing piecewise-linear
segment** (`26` §6.1,
`soundingSegmentContainingHeight`):

```text
y ∈ [h_i, h_{i+1})  →  layer [h_i, h_{i+1}]
y ∈ [h_{n-1}, h_n]  →  layer [h_{n-1}, h_n]
```

Interior knots take the **upper** segment (one-sided from
above). That is the locked **kink** convention, not a
FIR-boundary workaround.

T1 outside `[minHeight, maxHeight]` does not call shear.
It returns `T_tilt,y = 0` (`26` §6.2). That 0 is the
defined Source / DEMO scalar-field continuation (curl of
height-clamped homogeneous wind). It is **not** an
Analysis provenance token and is **not** reused as the
Analysis unavailable state (§17).

### 3.4 SRH

Form B on every linear hodograph sub-segment of `[h0, h1]`
(`09`, `stormRelativeHelicityBetween`). Interior knots
inside the layer contribute. Clamp is rejected.

### 3.5 Bulk shear

There is **no** named production `BulkShear` type. Callers
use `verticalWindShearBetween` and/or endpoint `|ΔV|`.
This file treats that family as **endpoint / layer
queries**, not as native-segment derivatives.

### 3.6 Analysis column shape

`EscHrTimeAnalysisColumn`:

```text
profile     EnvironmentalWindProfile at Source retained heights
support[]   1:1 with those knots; FULL_SUPPORT | BOUNDARY_CONDITIONED
provenance  transform id / version / TIME FIR metadata
```

Support is classified from each **retained sample TIME**,
not from a universal metre cutoff. Uniform 1 s QC seconds
that are not retained Source times are not Analysis knots.

---

## 4. D1 — Filter support vs diagnostic support

**NEW PROJECT DECISION.**

Two distinct properties. They MUST NOT be collapsed to one
boolean.

### 4.1 Transform / filter support

Property of an **Analysis sample** (knot):

```text
Was this FIR output computed without synthetic
pre-launch / post-flight extension in its 81-tap
window?
```

Owned by Architecture `59`. Values:

```text
FULL_SUPPORT
BOUNDARY_CONDITIONED
```

QC-filled interior seconds remain in-flight support, not
boundary extension (`59`). Unchanged here.

### 4.2 Diagnostic support / query validity

Property of a **diagnostic result or query**:

```text
Did every Analysis contribution required by this
computation itself have filter support that the
declared consumer policy accepts?
```

This file uses:

```text
FULL_SUPPORT
BOUNDARY_CONDITIONED
OUT_OF_DOMAIN
COLUMN_UNAVAILABLE
```

`FULL_SUPPORT` on a knot never automatically upgrades a
query that also used a `BOUNDARY_CONDITIONED` knot.

---

## 5. D3 — TIME → HEIGHT mapping

**NEW PROJECT DECISION.**

Filter support is defined in TIME (`59`). Diagnostics
query HEIGHT.

Because Analysis knots are 1:1 with Source retained
heights/times:

```text
support[i] belongs to profile.levelHeights()[i]
```

There is **no** universal metre cutoff. Do **not**
translate `±40 s` into a magic `200 m` band.

A sounding-specific valid HEIGHT domain is **derived** from
which knots are `FULL_SUPPORT`. That domain may differ
between Goshen, Prospect, and Dumas because ascent rate
differs. That variation is the TIME-domain contract, not a
defect.

---

## 6. D5 — Exact-knot wind query

**NEW PROJECT DECISION.**

If the query height equals a stored Analysis knot height
(IEEE identity):

```text
wind-query validity = that knot's filter support
```

Neighbors are **not** mixed into the wind value.

**Consequence (central honesty):** wind FULL at a knot
does **not** imply native-segment `ω_h` FULL at that same
height. Interior knots use the **upper** segment (`26`
§6.1). If the knot above is `BOUNDARY_CONDITIONED`,
derivative validity is `BOUNDARY_CONDITIONED` even though
the knot wind is `FULL_SUPPORT`.

---

## 7. D4 — Interpolation support

**NEW PROJECT DECISION.**

For `h` strictly between adjacent Analysis knots `h_i` and
`h_{i+1}`:

```text
interpolated V(h) is FULL_SUPPORT
  iff both contributing knots are FULL_SUPPORT
otherwise BOUNDARY_CONDITIONED
```

Edge cases:

| Query | Validity |
| --- | --- |
| exact FULL knot | FULL_SUPPORT |
| exact BOUNDARY knot | BOUNDARY_CONDITIONED |
| between two FULL knots | FULL_SUPPORT |
| between FULL and BOUNDARY | BOUNDARY_CONDITIONED |
| between two BOUNDARY knots | BOUNDARY_CONDITIONED |
| `h < minHeight` or `h > maxHeight` | OUT_OF_DOMAIN (§8) |

Clamp must **not** convert boundary-conditioned or
out-of-domain data into apparently full-supported
atmospheric information.

---

## 8. D6 / D7 — Derivative stencil and boundary policy

**NEW PROJECT DECISION.**

The production derivative stencil for native-segment
environmental vorticity **is** the two knots of the
containing segment (`26` §6.1). Architecture `60` does
**not** replace that with a new central `±δh` scheme.

```text
native-segment diagnostic FULL_SUPPORT
  iff BOTH segment endpoint knots are FULL_SUPPORT
```

If either endpoint is `BOUNDARY_CONDITIONED`, the
diagnostic is `BOUNDARY_CONDITIONED` and is **not
eligible** as Analysis environmental vorticity for a
FULL-support-required consumer (`59` §18).

Effective valid diagnostic HEIGHT domain is therefore
**narrower** than the raw FIR `FULL_SUPPORT` TIME interval:
only **FULL–FULL segments** qualify. That shrinkage is
expected. Do **not** widen it artificially.

**Boundary policy (normative):**

```text
do not silently change the stencil to a one-sided
  derivative to keep a result near the FIR boundary
do not mix Source on one end of a stencil with
  Analysis on the other
do not average adjacent segments at a kink to
  manufacture support
```

The existing interior-knot “upper segment” rule stays. It
is kink policy, not a boundary fallback. FIR-boundary
segments that mix FULL and BOUNDARY remain ineligible for
FULL-required Analysis `ω_h`.

Production T1 already uses one-sided-from-above at kinks.
That is documented and **not** extended into a
FIR-boundary one-sided salvage.

**Lower boundary:** launch-side BOUNDARY–BOUNDARY segments
and the mixed BOUNDARY–FULL segment are ineligible. The
first eligible native-segment `ω_h` is the first FULL–FULL
segment.

**Upper boundary:** symmetric in TIME (`59` §19). The last
eligible native-segment `ω_h` is the last FULL–FULL
segment. Mixed FULL–BOUNDARY and BOUNDARY–BOUNDARY
segments are ineligible.

A mask / unavailable region near both ends is the honest
result. A continuous pretty plot of boundary-conditioned
derivatives is rejected.

---

## 9. D8 — Clamp policy for Analysis diagnostics

**NEW PROJECT DECISION.**

Global `sampleAtHeight` clamp stays for advection.

The **support-aware Analysis diagnostic path** is stricter:

```text
h < minHeight  or  h > maxHeight
  → OUT_OF_DOMAIN
  → not FULL_SUPPORT
  → clamped wind is not Analysis diagnostic evidence
```

Do not classify a clamped query using the endpoint knot’s
filter support. That would launder clamp into observation.

Shear / SRH already reject clamp with errors on the
numeric APIs. Analysis query wrappers should treat those
requests as `OUT_OF_DOMAIN` (typed), not as Analysis
`ω_h = 0`.

---

## 10. D2 — Support-aware query ownership

**NEW PROJECT DECISION.**

Do **not** add Analysis support fields to provider-neutral
`EnvironmentalWindProfile`. That would make every
Source / DEMO / Moore profile depend on ESC FIR semantics
and would violate `48` / `59` (EWP remains `V(h)` only).

Physics functions remain numeric and support-unaware:

```text
sampleAtHeight
verticalWindShearBetween
horizontalVorticityFromShear
stormRelativeHelicityBetween
```

Support-aware queries are a **sibling** of
`EscHrTimeAnalysisColumn`: they read `profile` + `support[]`
+ `provenance`, call the existing physics functions for
numbers, and attach query validity.

Conceptual shape (not a runtime DTO lock; names may
change in implementation):

```text
queryAnalysisWindAt(column, h)
  → representation = Analysis
    validity = FULL_SUPPORT | BOUNDARY_CONDITIONED | OUT_OF_DOMAIN
    wind present iff not OUT_OF_DOMAIN

queryAnalysisNativeSegmentShearAt(column, h)
queryAnalysisNativeSegmentVorticityAt(column, h)
  → representation = Analysis
    method = native-containing-segment
    segment { hLo, hHi } or none
    numeric shear / ω_h present iff a containing segment exists
    validity = FULL_SUPPORT | BOUNDARY_CONDITIONED | OUT_OF_DOMAIN
```

A FULL-support-required consumer then:

```text
COLUMN_UNAVAILABLE        → do not evaluate
OUT_OF_DOMAIN             → unavailable
BOUNDARY_CONDITIONED     → unavailable as Analysis inference
FULL_SUPPORT             → use the number
```

The numeric BOUNDARY value MAY be retained for tests and
labeled inspection. It MUST NOT be the production Analysis
`ω_h` inference.

No generic diagnostic framework is introduced.

---

## 11. D9 / D10 — Source / Analysis consumer declaration

**NEW PROJECT DECISION.** Concrete policy for the next
slices. Not a plugin registry.

A diagnostic (or a named mode of a diagnostic) declares one
of:

```text
SOURCE_ONLY
  Source profile only. Analysis is irrelevant.

ANALYSIS_FULL_SUPPORT_REQUIRED
  Analysis column required.
  Result is available only at FULL diagnostic support.
  BOUNDARY_CONDITIONED / OUT_OF_DOMAIN / missing column
  → unavailable, not a substitute number.

ANALYSIS_LABELED_LAYER
  Analysis column required to compute the Analysis sibling.
  The number MAY be BOUNDARY_CONDITIONED and MUST be
  labeled. It does not replace Source.

SOURCE_OR_ANALYSIS_EXPLICIT_MODE
  Caller selects Source or Analysis.
  Provenance records the choice.
  No silent default switch.
```

**Normative prohibitions:**

```text
NO silent Source → Analysis
NO silent Analysis → Source fallback
NO hybrid Source/Analysis stencil or layer
unavailable Analysis ≠ Source pretending to be Analysis
```

Consumer provenance MUST know which representation was
used.

`58` §12 remains the contract that diagnostics declare an
operand. This file supplies the support rules that
declaration must obey.

---

## 12. Existing diagnostics classification

**NEW PROJECT DECISION.** Policy only. No rewiring except
the authorized first target in §21.

### A. Horizontal environmental vorticity / native-segment `dV_env/dz`

| Question | Answer |
| --- | --- |
| Source-safe? | Yes. Current production. |
| Analysis candidate? | Yes. Primary reason Analysis exists (`53`, `58`, `59`). |
| Analysis-required? | For ESC *storm-scale local* `ω_h` inference, Analysis FULL-support is the intended operand. Live Explore / T1 are **not** switched by this file. |
| Derivative-sensitive? | Yes. |
| Layer-integrated? | No. Native containing segment. |
| Support policy | `ANALYSIS_FULL_SUPPORT_REQUIRED`. Stencil = both segment knots. |
| Current production representation | Whatever `EnvironmentalWindProfile` is injected (Explore = Source; Guided = DEMO). |
| Rewiring after `60` | Headless Analysis query **authorized** (§21). Live UI / Explore / T1 **not** authorized. |

### B. Tilting tendency `T_tilt,y`

Production path:

```text
EnvironmentalWindProfile
  → containing segment
  → verticalWindShearBetween
  → horizontalVorticityFromShear
  → world (ω_x, ω_z)
  × updraft ∇_h Vy
  → T_tilt,y
```

Only the **environmental `ω_h` operand** depends on the
profile representation. The updraft gradient is a
prescribed laboratory field, not Analysis.

Do **not** treat the whole diagnostic as automatically
Analysis. Analysis mode, if later introduced, applies to
the `ω_h` operand only.

| Question | Answer |
| --- | --- |
| Source-safe? | Yes. Current T1. |
| Analysis candidate? | Yes, via Analysis `ω_h`. |
| Analysis-required? | Not yet. |
| Derivative-sensitive? | Yes, via `ω_h`. |
| Support policy | Validity cannot exceed upstream `ω_h` validity (§14). |
| Rewiring after `60` | **Not authorized.** Separate slice after the `ω_h` query exists. |

### C. 0–1 km SRH

**STILL-BINDING from `59` §17.** This file does not change
it.

```text
Source 0–1 km SRH remains Source-honest.
Analysis 0–1 km SRH is BOUNDARY_CONDITIONED by construction
  on this sampling class.
It is not “more correct.”
Published Goshen 88 is not a target.
```

SRH uses the **layer-integrated** contract (§15), not the
native-segment FULL-required contract. Same support algebra
(every contributing knot / interpolation), different consumer
policy (`ANALYSIS_LABELED_LAYER`).

Rewiring: **not authorized.**

### D. 0–3 km SRH

Includes the launch boundary at observed ESC ascent rates.
Named 0–3 km Analysis SRH is **BOUNDARY_CONDITIONED** by
the layer rule. It may be computed and labeled. It is not
automatically more correct.

A later **launch-independent** Analysis layer (for
example first FULL knot–3 km, if 3 km remains in domain)
could be FULL_SUPPORT if every contribution is FULL. That
would be a **different named layer**, not a silent rename
of 0–3 km.

Rewiring: **not authorized.**

### E. Bulk shear / endpoint layer shear

Mathematically computable whenever both endpoints are
in-domain. Support / provenance validity is separate.

```text
Analysis endpoint query is FULL_SUPPORT iff both
endpoint wind queries are FULL_SUPPORT.
Otherwise BOUNDARY_CONDITIONED (or OUT_OF_DOMAIN).
```

0–6 km from `h_min` is BOUNDARY_CONDITIONED because `h_min`
is always in the launch FIR boundary (`59` §16). A
launch-independent bulk on FULL knots may be FULL.

Rewiring: **not authorized.**

Streamwise / crosswise (`08`) is a projection of `ω_h`.
Its Analysis validity cannot exceed the Analysis `ω_h` it
consumes. Not the first slice.

---

## 13. D11 — Horizontal vorticity policy

**NEW PROJECT DECISION.**

Analysis native-segment environmental horizontal vorticity
is available as an Analysis inference **only** where the
containing-segment stencil has FULL diagnostic support.

Boundary / mixed-support derivatives MUST NOT be issued as
full Analysis `ω_h`.

Unavailable form for the FULL-required consumer: **typed
query status**, not `NaN`, not `0`, not an exception for
ordinary boundary unavailability.

The numeric two-point shear on a mixed segment remains
mathematically defined. Eligibility as Analysis inference
is a separate validity bit.

---

## 14. D12 — Tilting validity propagation

**NEW PROJECT DECISION.** Policy for a later slice. T1 is
not rewired here.

If tilting consumes Analysis-derived `ω_h`:

```text
validity(T_tilt,y)  ≤  validity(ω_h Analysis)
```

Unsupported / unavailable upstream `ω_h` MUST propagate.
Do not fill with `NaN`. Do not fill with `0` as a
substitute for unavailable Analysis physics.

Existing T1 `0` outside the sounding (`26` §6.2) remains
the Source / DEMO scalar-field rule. An Analysis T1 path
MUST NOT reuse that 0 to mean “FIR boundary” or “column
missing.”

The updraft operand does not become Analysis.

---

## 15. D13 — SRH relation to this contract

**STILL-BINDING.** Architecture `59` §17 is unchanged.

SRH is **not** the native-segment FULL-required diagnostic.
It is a **layer-integrated** consumer of the same knot /
interpolation support algebra:

```text
layer FULL_SUPPORT iff every Analysis knot and every
interpolation used in Form B on [h0, h1] is
FULL_SUPPORT;
otherwise BOUNDARY_CONDITIONED
(or OUT_OF_DOMAIN if the layer needs clamp).
```

0–1 km Analysis SRH remains always BOUNDARY_CONDITIONED
on this class. Presentation / UI of that sibling is a
later SoT. This file does not design it.

---

## 16. D14 — Bulk shear relation

**NEW PROJECT DECISION.**

Separate:

```text
mathematical computability
support / provenance validity
```

An Analysis bulk / endpoint shear MAY be computed while
labeled `BOUNDARY_CONDITIONED` if an endpoint depends on
synthetic FIR support. Do not mask that fact.

Launch-independent bulk on FULL-supported endpoints may be
FULL_SUPPORT.

---

## 17. D15 — Unavailable-state representation

**NEW PROJECT DECISION.**

| Situation | Representation |
| --- | --- |
| No Analysis column (Moore / non-applicable / not built) | `COLUMN_UNAVAILABLE` |
| Knot / interpolation exists but FIR used extension | `BOUNDARY_CONDITIONED` |
| Knot / interpolation used only FULL FIR samples | `FULL_SUPPORT` |
| Height outside `[minHeight, maxHeight]` | `OUT_OF_DOMAIN` |
| FULL-required diagnostic cannot meet stencil policy | unavailable (do not use the number) |

```text
NaN is not a provenance mechanism
0 is not a substitute for unavailable Analysis physics
exceptions are for broken invariants, not ordinary
  boundary unavailability
```

`VerticalWindShearError` on inverted / non-finite heights
remains an invariant failure of the numeric API.

---

## 18. D16 — Diagnostic provenance

**NEW PROJECT DECISION.**

An Analysis-mode diagnostic result must be traceable to
at least:

```text
Source identity          (column.provenance.sourceIdentity)
transform id / version   esc-hr-time-hamming-sinc-lowpass / v1
representation           Analysis
query validity           FULL_SUPPORT | BOUNDARY_CONDITIONED |
                         OUT_OF_DOMAIN | COLUMN_UNAVAILABLE
method                   native-containing-segment
                         (when that method affects validity)
```

Ownership: **reference** the column provenance object. Do
not clone a giant provenance DTO onto every scalar.

Source-mode results remain Source; they do not pretend to
carry FIR support.

---

## 19. Guided / Explore / hodograph

**STILL-BINDING.**

```text
Guided remains DEMO.
Explore currently Source.
This file does not switch Explore V_env Source → Analysis.
No global silent replacement.
```

The next implementation slice is **headless consumer-first**.
UI Source-versus-Analysis toggle is a separate task.

Hodograph: not implemented here. Source polyline stays
Source. A future Analysis hodograph is an explicit labeled
sibling (`58`, BL-012). Support-aware display of boundary
segments may cite `59` / `60`; the UI design itself is a
separate SoT.

---

## 20. Scientific honesty

**Does filtering create a profile that is scientifically
valid for derivatives everywhere?**

**No.**

The FIR produces an Analysis wind at every Source height,
including BOUNDARY_CONDITIONED knots. Those knots are
mathematical outputs of a mirrored convolution, not
fully supported observations. Native-segment `ω_h` is the
slope between two knots. A slope that uses a
boundary-conditioned endpoint is not a fully supported
derivative of the observed atmosphere.

**Does FULL_SUPPORT of a FIR sample automatically imply
FULL_SUPPORT of a derivative diagnostic at that height?**

**No. This is the central gate answer.**

Filter support is per sample. Diagnostic support is per
stencil / interpolation / layer. A FULL knot adjacent to
a BOUNDARY knot yields a mixed segment. Wind-at-knot FULL
does not imply `ω_h` FULL.

---

## 21. D17 — First implementation target

**NEW PROJECT DECISION.** First consumer slice **IMPLEMENTED**
headless:

```text
src/data/escHrTimeAnalysis/analysisQuery.ts
  queryAnalysisWindAt
  queryAnalysisNativeSegmentShearAt
  queryAnalysisNativeSegmentVorticityAt
```

Authorized object of that slice:

```text
headless support-aware Analysis native-segment
environmental horizontal vorticity query
(and its parent native-segment shear)
over EscHrTimeAnalysisColumn
```

Why this target:

```text
it is the derivative-sensitive diagnostic Analysis exists for
the production stencil is already defined (26 §6.1)
it proves support propagation before tilting / UI / Explore
tilting can stay unwired and still inherit the rule later
```

**Authorized in that slice:**

```text
query module sibling to the Analysis column
typed validity on wind / native-segment shear / ω_h
tests listed in §22
Goshen / Prospect / Dumas columns
Moore / coarse-operational-raob remains NON-APPLICABLE
  (no column → COLUMN_UNAVAILABLE)
```

**Not authorized in that slice:**

```text
UI
Explore Source → Analysis switch
Guided
T1 rewiring
streamwise / crosswise rewiring
SRH Analysis consumer
hodograph Analysis overlay
changing EnvironmentalWindProfile
changing verticalWindShearBetween globally
changing T1 0-outside-sounding
new central ±δh derivative
```

---

## 22. Test matrix

The authorized consumer slice includes at least:

```text
exact FULL knot wind
exact BOUNDARY knot wind
interpolation FULL+FULL
interpolation FULL+BOUNDARY
native-segment stencil both FULL
center / knot FULL but upper or lower segment touches BOUNDARY
  (especially last FULL knot with BOUNDARY above;
   first FULL knot uses upper segment — document the 26 rule)
lower / launch boundary segments ineligible
upper / end-of-product boundary
clamp / out-of-domain → OUT_OF_DOMAIN, not FULL
Source/Analysis non-mixing
unavailable Analysis column
Goshen
Prospect
Dumas
Moore non-applicable
no NaN / 0 as unavailable Analysis ω_h
```

Downstream T1 validity propagation is **not** required in
the first consumer slice because T1 is not authorized
there. When a later T1 Analysis slice is authorized, it
MUST test that unavailable `ω_h` does not become `T = 0`
by silent substitution.

---

## 23. D18 — Gate

```text
ARCHITECTURE ACCEPTED
DIAGNOSTIC SUPPORT CONTRACT SPECIFIED
HEADLESS NATIVE-SEGMENT QUERY IMPLEMENTED
LIVE CONSUMER REWIRING NOT STARTED / NOT AUTHORIZED
```

Implemented object: the narrow headless support-aware
Analysis native-segment shear / horizontal-vorticity
query named in §21.

Not authorized: live diagnostic rewiring, UI, Explore
switch, tilting, SRH consumers, hodograph overlay.

No research blocker was found that prevents specifying
this contract. The production derivative **is** the
native containing-segment two-point difference. Inventing
a different derivative would be a separate physics
authorization; this file does not do that.

---

## 24. Anti-claims

```text
FILTER FULL_SUPPORT is not diagnostic FULL_SUPPORT
Analysis V(h) everywhere is not ω_h valid everywhere
clamp is not observation
T1 0 outside sounding is not Analysis unavailability
NaN / 0 are not support states
Source hair must not backfill Analysis FIR boundaries
0–1 km Analysis SRH is not more correct than Source 0–1
Fig. 2b 88 / 167 is not a target
±40 s is not a universal 200 m cutoff
support does not belong on provider-neutral EWP
this file does not rewire Explore / Guided / T1
```

---

## 25. Compact lock-in

```text
59:                transform / FILTER support authority
THIS FILE:         diagnostic consumption / query support
FILTER ≠ DIAGNOSTIC SUPPORT
TIME→HEIGHT:       1:1 knot mapping; no metre magic
INTERP:            FULL iff every contributing knot FULL
EXACT KNOT WIND:   that sample's filter support
DERIVATIVE:        production = containing-segment
                   two-point shear; both knots FULL
NO one-sided FIR salvage
NO hybrid Source/Analysis stencil
NO silent fallback
CLAMP:             OUT_OF_DOMAIN for Analysis diagnostics
QUERY OWNER:       sibling of EscHrTimeAnalysisColumn
EWP:               remains V(h); no support fields
ω_h Analysis:      FULL-required; mask mixed/boundary
T1:                validity ≤ ω_h; not rewired here
0–1 SRH:           59 unchanged; layer contract
0–3 SRH:           launch-inclusive → BOUNDARY
BULK:              computable ≠ FULL
UNAVAILABLE:       typed; not NaN/0
FIRST SLICE:       headless Analysis native-segment ω_h
                   IMPLEMENTED
BL-010:            column core IMPLEMENTED;
                   support-aware native-segment Analysis
                   ω_h query IMPLEMENTED;
                   live consumer rewiring NOT STARTED /
                   NOT AUTHORIZED
```
