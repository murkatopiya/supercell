# High-Resolution ESC Time-Domain Analysis Integration

**Status:** ARCHITECTURE ACCEPTED /
PRODUCTION TRANSFORM SPECIFIED /
IMPLEMENTATION AUTHORIZED /
COLUMN CORE IMPLEMENTED
**Scope:** the production integration / authorization gate
for the BL-046 high-resolution ESC Analysis transform.
Not a Source rewrite. Not a provider framework. Not
Leise. Not a height-domain ~200 m filter. Not diagnostic
rewiring. Not hodograph UI. Not Guided. Not Explore
replacement of Source. Not Moore. Not a V1 reopen.
**Physics:** `EnvironmentalWindProfile` remains
provider-neutral wind versus height (`04`, `48`). This
file does not add measurement TIME to that kinematic
object.
**Implementation:** Analysis-column core is implemented
headless in `src/data/escHrTimeAnalysis/` with the ESC
TIME carrier in `src/data/eolNsslMgausEsc/`. Diagnostic
rewiring, hodograph overlay, and Explore/Guided
consumption remain out of that authorized slice.

Predecessor (contract; not replaced):

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/architecture/54-storm-scale-analysis-wind-profile.md
docs/architecture/55-analysis-profile-generalization-gate.md
docs/architecture/56-esc-multi-sounding-observed-profile-ingest.md
docs/architecture/57-igra-observed-profile-ingest.md
docs/architecture/58-source-class-aware-analysis-profile-contract.md
```

Frozen scientific selection (not reopened here):

```text
docs/research/2026-08-28-high-resolution-esc-analysis-transform-decision.md
```

Evidence (conclusions only):

```text
docs/research/2026-08-28-esc-flight-phase-and-high-frequency-wind-audit.md
docs/research/2026-08-28-esc-wind-processing-pipeline-audit.md
docs/research/2026-08-28-leise-filter-and-analysis-operator-comparison.md
docs/research/sample-high-resolution-esc-analysis-transform-decision.mjs
```

Index (not SoT):

```text
docs/PROJECT_BACKLOG.md   BL-010, BL-037, BL-046
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

**CURRENT FACT.** Architecture `58` is the Source →
Analysis contract. It rejected a universal numerical
operator, required sampling-class-aware transforms, and
left production selection unauthorized.

**CURRENT FACT.** BL-046 research selected a
high-resolution-mobile-esc candidate:

```text
esc-hr-time-hamming-sinc-lowpass
version: v0.1-research
domain: TIME
operator: zero-phase Hamming-windowed sinc FIR
λ_c = 40 s
Δt = 1 s
taps = 81
boundary used in research: half-sample mirror
output: winds evaluated at Source sample heights
```

Research selection is **not** implementation
authorization (`58`; BL-046). This file is the missing
integration gate. It must decide whether that candidate
can be given an exact production architecture without
violating Source semantics, the provider-neutral
profile contract, `58` provenance, the no-fake-resolution
rule, ESC ingest, or diagnostic honesty.

Four questions are central:

```text
1. Where does measurement TIME live?
2. How are QC-created time gaps represented and reconstructed?
3. What is the semantic status of FIR boundary-conditioned samples?
4. What exact provenance does Analysis carry?
```

Only after those are resolved may BL-010 be authorized.

---

## 2. Frozen scientific decision

**STILL-BINDING** from BL-046. This file does **not**
reopen that selection.

```text
sampling class:     high-resolution-mobile-esc
domain:             TIME
operator:           Hamming-windowed sinc FIR
λ_c:                40 s
taps:               81
grid:               Δt = 1 s
phase:              zero after centering
output coordinate: Source heights
```

Why TIME, not height: the repeatable questionable
structure is a measurement / platform / processing
timescale (~17–19 s), not one universal atmospheric
vertical wavelength. Equivalent metres differ because
ascent rate differs.

**ANTI-CLAIM.**

```text
Do not convert this policy into a universal ~200 m
  vertical filter.
Do not replace it with Leise / T5FLTR.
Do not retune λ_c against SRH or Fig. 2b 88 / 167.
Do not treat 54 100 m bin-mean as the production operator.
Do not treat research v0.1 as silently identical to
  production v1; §21 records the transition.
```

`54` remains the historical first-candidate
construction / ESC baseline. `55` still qualifies that
construction as not a universal default. `58` still
owns the Analysis contract. This file specifies the
ESC-class operator inside that contract.

---

## 3. Current TIME facts

**CURRENT FACT.** Production parser already reads native
ESC TIME:

```text
src/data/eolNsslMgausEsc/parseEscConcatenated.ts
EscDataRecord.time = field 0 of the 21-field record
```

**CURRENT FACT.** I1 normalization discards it.
`normalizeEscWindColumn` emits only
`{ height, eastward, northward }`. Shared
`NormalizedWindLevel` and committed Source goldens
have no TIME. `EnvironmentalWindProfile` is V(h) only
(`04`, `48`).

**CURRENT FACT.** BL-046 reconstructed I1-retained TIME
from gitignored native ESC bytes. That research path is
not a production TIME carrier.

Parser preservation of TIME on `EscDataRecord` is
sufficient native capture. The production gap is
**retention after I1**, not a missing parse.

---

## 4. Where measurement TIME lives (D1, D2)

**NEW PROJECT DECISION.**

ESC measurement TIME is **source-measurement provenance**,
not a property of atmospheric wind versus height.

Preferred structure:

```text
ESC observed measurement record
  retained I1 samples (t, h, U, V)
  + Source identity / QC / sampling-class provenance

    SOURCE PROJECTION
      EnvironmentalWindProfile V(h)
      drop TIME
      existing I1 winds and heights, unchanged

    ANALYSIS PROJECTION
      time-domain transform of the measurement record
      → EnvironmentalWindProfile V_analysis(h)
      same Source heights
```

`EnvironmentalWindProfile` **remains V(h)-only**.
Do **not** add measurement TIME to that kinematic class.
Do **not** add TIME to shared provider-neutral
`NormalizedWindLevel` (IGRA / Moore must not grow a fake
1 s clock).

Sounding identity `validTime` (`48` §4.2) is the launch
/ column timestamp. It is **not** sample TIME.

The measurement record is **ESC-family specific**. It is
not a provider platform.

**ANTI-CLAIM.** This file does not introduce:

```text
ObservedDataProvider
SoundingProvider
UniversalMeasurementSeries
AtmosphericObservationPlatform
generic telemetry framework
AtmosphericProfileSource
```

`48` Q5 remains binding.

---

## 5. ESC measurement record (narrow)

**NEW PROJECT DECISION.** Conceptual type, not a
TypeScript DTO in this file:

```text
EscRetainedWindSample
  time       native ESC TIME, seconds (see §7)
  height     world Y after I1 datum / round-to-tenth
  eastward   m/s
  northward  m/s

EscObservedWindMeasurementRecord
  samples     I1-retained samples, 1:1 with Source levels
  provenance  Source identity + samplingClass
              high-resolution-mobile-esc
              + native TIME semantics
```

Rules:

```text
sample i of the measurement record
  ↔  Source EnvironmentalWindProfile level i
  ↔  Analysis EnvironmentalWindProfile level i

heights are exactly the I1 Source heights
U/V of the measurement record are exactly the I1
  Source winds
TIME is additional retained provenance, not a rewrite
```

The 1 s reconstruction grid is an Analysis-transform
**intermediate**. It is not Source. It is not an
Analysis output knot list.

---

## 6. Source immutability

**STILL-BINDING** from `53` / `58`.

Analysis creation MUST NOT:

```text
rewrite Source
change Source heights
change Source U/V
drop Source points
insert Source points
replace the Source hodograph
mutate Source provenance identity
```

Adding retained TIME to an ESC measurement record, while
leaving Source V(h) winds and heights bit-identical, is
**not** a Source rewrite.

Committed Source wind goldens remain the V(h) oracle.
Implementation may add a TIME-bearing sibling golden, or
extend JSON with a `time` field, only if existing
`height` / `eastward` / `northward` values are unchanged.
`npm test` MUST NOT require gitignored native EOL bytes
(G4 still OPEN).

---

## 7. Native ESC TIME invariants (D1)

**CURRENT FACT** from production parser + `49` §7.1 /
`56` §5, stronger than research-script inference.

| Property | Production fact |
| --- | --- |
| Native field | ESC data-record field 0 (`Time`) |
| Units | seconds |
| Origin | elapsed from release / launch, not Unix time and not `validTime` |
| Native printed form | decimal seconds (e.g. `-1.0`, `0.0`); Goshen native rows are an exact 1 s step |
| Parser contract | finite `Number`; integer / uniqueness / monotonicity **not** enforced at parse |
| Negative TIME | legal in native data. `Time = −1` is a pre-release row. I1 does **not** drop it because it is negative (`56` §5) |
| Relation to launch | `Time = 0` is the release epoch of the product. Header `UTC Release Time` identifies the sounding |
| Relation to I1 | a native row is retained iff usable Alt + U/V (`56` §7). Dropped rows remove those seconds from the retained TIME sequence |
| QC and gaps | I1 drops create the retained-time holes; the adapter does not interpolate |
| Duplicate TIME | not an I1 Source invariant today; Analysis **fails** if retained TIME is not strictly increasing |
| Fractional cadence | not observed on the three qualified columns; Analysis **fails** if any retained TIME is not an integer second |
| Current goldens | omit TIME; parser already had enough information |

Goshen (`49` §7.1): native `Time −1.0 … 2080.0` s, exact
1 s before QC. First kept TIME `0.0` because `t = −1`
had missing U/V. Holes after drop begin near 1312 s.

BL-046 retained-TIME facts (native replay, I1-aligned):

```text
Goshen     t0 = 0     t1 = 2080   n = 2029
Prospect   t0 = −1    t1 = 2822   n = 2733
Dumas      t0 = −1    t1 = 3020   n = 2917
```

Adjacent retained Δt histograms (seconds):

```text
Goshen     1: 1984   2: 38   3: 4   4: 2
Prospect   1: 2663   2: 50   3: 17  4: 1   5: 1
Dumas      1: 2842   2: 53   3: 14  4: 4   5: 3
```

Exact 1 s share ≈ 97.5–97.8%. Interpolation fractions on
the uniform 1 s grid: Goshen 2.50%, Prospect 3.22%,
Dumas 3.47%. Maximum observed adjacent retained gap:
**5 s**.

---

## 8. TIME identity and Source alignment

**NEW PROJECT DECISION.**

For every retained Source sample i:

```text
measurement / Source:  (t_i, h_i, U_i, V_i)
Analysis:              (h_i, U'_i, V'_i)
```

Index `i` is the mapping. Analysis heights MUST equal
Source heights exactly (same count, same values).

The uniform 1 s grid MUST NOT be exposed as observed
atmospheric samples, Source knots, or Analysis knots.

Analysis `EnvironmentalWindProfile` does not carry TIME.
Support classification (§15) is keyed by the same index
`i` (or equivalently by retained `t_i` plus the frozen
kernel radius). A join table is not required if those
invariants hold.

---

## 9. QC-gap reconstruction policy (D3)

**NEW PROJECT DECISION.**

QC interpolation reconstructs **filter support** between
retained integer seconds. It is not observational
resolution (`58` §7). Interpolated 1 s values MUST NOT
appear as Source points and MUST NOT appear as Analysis
output knots.

### Reconstructable gap

On the retained strictly increasing integer TIME
sequence, an adjacent pair `(t_a, t_b)` with

```text
2 ≤ t_b − t_a ≤ 5
```

is a reconstructable QC gap. Missing integer seconds
`t_a + 1, …, t_b − 1` are filled for the FIR only.

Δt = 1 needs no fill. The bound **5 s** is the observed
maximum on all three qualified columns. It is production
policy, not a convenience margin.

### Method

```text
domain:     TIME
method:     linear interpolation
operands:   eastward, northward, and height
            independently vs TIME
interval:   only between adjacent retained samples
            inside [t_first, t_last]
```

Height on the uniform grid is internal support for the
convolution. It is discarded when mapping winds back to
Source heights.

### Forbidden

```text
extrapolation before t_first or after t_last
rounding fractional TIME to integers
filling a gap larger than 5 s
treating interpolated seconds as Source or Analysis knots
silent algorithm change when the gap policy cannot be met
```

### Unexpected larger gaps

If any adjacent retained Δt > 5 s: **Analysis
unavailable**. Source remains usable.

### Metadata (transform provenance, not Source)

```text
interpolatedCount
uniformN
interpolationFraction
dt histogram / maxGap
policy id: integer-linear-uvh-max-5s
```

QC interpolation ≠ boundary extension (§11–§14).

---

## 10. FIR production specification (D4)

**NEW PROJECT DECISION.** Exact operator. Implementation
must not reinterpret “a Hamming filter.”

Predecessor research construction:
`docs/research/sample-high-resolution-esc-analysis-transform-decision.mjs`
(`hammingSincLowpass`, `convolveMirror`,
`resampleUniformTime`, `filterUniformTime`).

### Identity

```text
transform id:       esc-hr-time-hamming-sinc-lowpass
production version: v1
research predecessor: v0.1-research
compatible class:   high-resolution-mobile-esc
domain:             TIME
Δt:                 1 s
λ_c:                40 s
fc:                 1/40 cycles per sample
taps:               81  (= 2 λ_c + 1)
window:             Hamming
normalization:      unity DC gain
phase:              linear FIR; zero after centering
components:         eastward and northward independently
                    (height is not filtered)
```

### Kernel (float64)

```text
N = 81
m = 40
fc = 1/40

for n = 0, 1, …, 80:
  k = n − m
  sinc = 2 fc                 if k = 0
       = sin(2 π fc k) / (π k)  otherwise
  w    = 0.54 − 0.46 cos(2 π n / (N − 1))
  h[n] = sinc · w

h ← h / Σ h[n]
```

Coefficients `0.54` and `0.46` are frozen (research
Hamming). Do not substitute other Hamming α values.

### Convolution

Centered, zero-phase:

```text
out[i] = Σ_{k=0}^{80} h[k] · at(i + k − m)
```

`at(i)` reads the uniform 1 s series, with boundary
extension defined in §13. Interior indices use observed
or QC-interpolated in-flight values only.

### Pipeline

```text
1. require samplingClass = high-resolution-mobile-esc
2. require TIME invariants (§22)
3. build uniform integer-second series on [t_first, t_last]
   with §9 gap fill
4. convolve eastward and northward with h
5. map filtered winds back to retained Source times
6. emit Analysis EnvironmentalWindProfile at Source heights
7. classify support for each retained sample (§15)
8. attach Analysis provenance (§20)
```

### Numerical expectation

IEEE-754 float64. Kernel coefficients are the exact
values of the formula above. Implementation validation
must lock the kernel and reproduce BL-046 selected
metrics within a documented float64 tolerance derived
from the research artifact, not from visual smoothness.

Declared effective scale (unchanged from BL-046):

```text
temporal reliability / attenuation: λ_c = 40 s
  |H|(18 s) ≈ 0.001
  |H|(40 s) ≈ 0.5
  |H|(80 s) ≈ 0.92
  |H|(180 s) ≈ 0.99
induced vertical scale: λz ≈ w_ascent × 40 s
  (median ~192 / 208 / 228 m on Prospect / Dumas / Goshen)
  that variation is part of the TIME-domain contract
```

---

## 11. Boundary support — semantic status (D5, D7)

**NEW PROJECT DECISION.** An 81-tap centered FIR needs
40 s before, the sample, and 40 s after for interior
support.

At launch, pre-launch observations do not exist. At
end-of-product, post-flight future observations do not
exist. ESC columns here end during CLEAN ASCENT.

Mirrored values are **not** observed data.

Mandatory distinction:

```text
FULL_SUPPORT
  the 81-tap window lies entirely inside the observed
  flight interval [t_first, t_last] of the uniform 1 s
  series (QC-interpolated interior seconds count as
  in-flight support, not as boundary extension)

BOUNDARY_CONDITIONED
  the 81-tap window includes at least one synthetically
  extended sample outside [t_first, t_last]
```

Naming is secondary. The distinction is mandatory.

QC interpolation and boundary extension remain distinct:

```text
QC interpolation     reconstruction between retained
                    in-flight times
boundary extension   synthetic support outside the
                    observed flight interval
```

A FULL_SUPPORT output sample MAY depend on QC-filled
interior seconds. That does not make it
BOUNDARY_CONDITIONED.

---

## 12. Boundary region extent

**NEW PROJECT DECISION.** The boundary region is defined
in TIME, not metres.

Let the uniform grid be `t_first, t_first+1, …, t_last`
and `m = 40`.

```text
FULL_SUPPORT times:
  t_first + 40  ≤  t  ≤  t_last − 40

BOUNDARY_CONDITIONED times:
  t < t_first + 40     lower / launch side
  t > t_last − 40      upper / end-of-product side
```

A retained Source/Analysis sample inherits the class of
its retained `t_i`.

Explanatory height mapping **only** (not a definition):
median ascent × 40 s is roughly 190–230 m on the three
qualified cases, so the launch boundary is about the
first ~200 m and varies with ascent. Do **not** define
the boundary region as a fixed metre band.

---

## 13. Half-sample mirror decision (D5)

**NEW PROJECT DECISION.** Option **C**.

```text
Half-sample mirror is the declared mathematical boundary
condition for producing Analysis values at every Source
height.

Those values whose support includes extension are
BOUNDARY_CONDITIONED.

Diagnostics consume them only under §16–§19.
They are not fully supported Analysis.
```

Not A: unmarked production boundary would violate
no-fake-support and would present launch rewrite as
ordinary Analysis.

Not B: Analysis MUST preserve Source heights (§8). A
FULL_SUPPORT-only knot list would change heights and
break that alignment. Interior-only validity is
expressed by support class, not by dropping knots.

Not D: zero-padding, constant-end hold, or a different
undocumented extension is rejected here. Research used
half-sample mirror; production keeps that **math** and
refuses its **epistemic laundering**.

### Half-sample (even) extension, frozen

Match research `convolveMirror`:

```text
n = length of the uniform 1 s series

at(i) =
  values[−i − 1]           if i < 0
                           (clamped into [0, n − 1])
  values[2 n − 1 − i]      if i ≥ n
                           (clamped into [0, n − 1])
  values[i]                otherwise
```

Examples: `at(−1) = values[0]`, `at(−2) = values[1]`.
This **does** rewrite the first and last output samples.
That rewrite is expected operator support, not QC.

### Why this is acceptable as math, not as observation

```text
zero-phase:     preserved for FULL_SUPPORT samples;
                not a claim about boundary samples
launch curvature: mixed into the first ~40 s; documented
first-sample rewrite: required consequence; Source first
                knot is unchanged
SRH:            0–1 km Analysis SRH is launch-sensitive;
                §17 forbids calling it more correct
physical meaning: no pre-launch / post-flight atmosphere
                was observed
Source:         immutable; only Analysis knots at the
                ends are boundary-conditioned
```

---

## 14. No-fake-support rule (D6)

**NEW PROJECT DECISION. Normative.** Analogous to `58`
no-fake-resolution.

```text
NO-FAKE-SUPPORT RULE

Synthetic boundary extension may provide mathematical
convolution support. It MUST NOT be represented as
observed pre-launch or post-flight information.

BOUNDARY_CONDITIONED Analysis samples must be
distinguishable in provenance or validity semantics
whenever they are exposed to diagnostics or display.

Forbidden:
  mirror → filtered value → indistinguishable
  “fully supported Analysis”
```

Interpolation inside `[t_first, t_last]` is still
subject to no-fake-**resolution**: it does not create
observed 1 s samples. It is not this rule’s object.
This rule’s object is **support outside the flight**.

---

## 15. Analysis validity / support model (D7)

**NEW PROJECT DECISION.** Sample-level support state,
minimally.

```text
A. profile-level only     REJECTED as insufficient
B. sample-level support    SELECTED
C. query-level stored     not stored; derived from B
```

Every Analysis output sample is classifiable as
`FULL_SUPPORT` or `BOUNDARY_CONDITIONED` by §12.

Representation may be a parallel array, a derived
function of retained TIME plus `m = 40`, or equivalent.
This file does not invent a runtime DTO. Downstream
MUST be able to answer:

```text
Was this Analysis value computed entirely from
observed / QC-interpolated in-flight support, or did
it depend on boundary extension?
```

Layer / query support is derived:

```text
a layer diagnostic is FULL_SUPPORT iff every Analysis
sample (and every interpolation between Analysis knots)
used in that query is FULL_SUPPORT;

otherwise the result is BOUNDARY_CONDITIONED.
```

---

## 16. Diagnostic policy (D8)

**NEW PROJECT DECISION.** Policy only. This file does
not rewire diagnostics.

`58` §12 still requires every diagnostic to declare
Source / Analysis / either. This file adds support
interaction.

| Diagnostic family | Policy |
| --- | --- |
| 0–6 km bulk shear from `V(h_min)` | Analysis result is BOUNDARY_CONDITIONED because `h_min` is always in the launch boundary region. Launch-independent bulk on FULL_SUPPORT (e.g. first FULL_SUPPORT height–6 km, or 1–6 km as research used) may be FULL_SUPPORT. Do not sell first-knot-contaminated 0–6 as storm-scale change. |
| 0–1 km SRH | §17 |
| 0–3 km SRH | includes launch boundary; result is BOUNDARY_CONDITIONED; may be computed and labeled; not automatically “more correct” |
| derivative-sensitive `ω_h`, streamwise/crosswise, `T_tilt` on native segments | §18 |

**P1** (consume boundary-conditioned Analysis, but expose
the fact) applies to layer integrals that cannot avoid
the launch knot if they insist on `h_min`.

**P2** (require FULL_SUPPORT) applies to
derivative-sensitive native-segment diagnostics.

**P4** (fallback to Source near boundaries) is **rejected**
for derivative-sensitive diagnostics: Source native
segments are why Analysis exists. Silent Source/Analysis
splice is forbidden unless a later SoT explicitly
architects a labeled splice. This file does not.

Do not introduce scientifically misleading discontinuities
by splicing unmarked Source hair onto Analysis interior.

---

## 17. 0–1 km SRH (D9)

**NEW PROJECT DECISION.**

0–1 km Analysis SRH is **BOUNDARY_CONDITIONED by
construction** on this sampling class: the lower 40 s
always lie inside 0–1 km at observed ascent rates.

Production MUST NOT claim that filtered 0–1 km SRH is
automatically more correct. Published Goshen 88 remains
**external evidence only**. Do not tune the boundary
condition toward 88.

```text
Source 0–1 km SRH
  the Source-honest integral of the published column
  (plus whatever declared C is used)

Analysis 0–1 km SRH
  allowed to be computed from the Analysis column
  MUST be labeled BOUNDARY_CONDITIONED
  MUST NOT replace Source 0–1 as silent truth
  MUST NOT be advertised as recovered Markowski 88
```

Preferred product stance, until a later SoT defines a
full-support launch strategy:

```text
Source 0–1 km SRH remains the Source-honest number.
Analysis 0–1 km SRH is an optional labeled sibling,
not the preferred environmental truth.
```

Making 0–1 km Analysis SRH unavailable is a legal UI
choice. It is not required of the Analysis column, which
still carries launch samples at Source heights.

---

## 18. Derivative-sensitive diagnostics (D10)

**NEW PROJECT DECISION.**

These diagnostics are a primary reason Analysis exists
(`53`, `58`).

```text
native-segment ω_h
streamwise / crosswise overlay on those segments
T_tilt on the containing segment
```

Policy: **require FULL_SUPPORT**.

```text
FULL_SUPPORT Analysis segments: eligible
BOUNDARY_CONDITIONED segments: not eligible as
  reliable environmental vorticity
mask / omit the lower and upper TIME boundary regions
do not fall back to Source 1-s segments in the mask
do not present unsupported precision as fully reliable
```

A gap / mask near launch (and near end-of-product) is
preferable to a continuous pretty plot of
boundary-conditioned derivatives.

This file does not implement the mask.

---

## 19. End-of-flight boundary

**NEW PROJECT DECISION.** Support classification is
**symmetric** in TIME.

```text
lower 40 s  BOUNDARY_CONDITIONED
upper 40 s  BOUNDARY_CONDITIONED
```

Physical justification for symmetry: both ends lack
observed samples outside the flight interval. Launch
has a known transient; the product top is CLEAN ASCENT
that simply ends. Neither fact supplies observed FIR
support.

Diagnostic *importance* is asymmetric (launch matters
more for 0–1 km SRH). That does not change support
class. It changes consumption (§16–§18).

---

## 20. Analysis provenance (D11)

**NEW PROJECT DECISION.** Semantic contract, not one
giant runtime object.

Analysis MUST identify at least:

```text
Source record identity
samplingClass = high-resolution-mobile-esc
transform id = esc-hr-time-hamming-sinc-lowpass
transform version = v1
domain = TIME
λ_c = 40 s
Δt = 1 s
taps = 81
window = Hamming
convolution phase = zero (centered)
QC gap reconstruction policy = integer-linear-uvh-max-5s
  plus interpolation counts / fraction / maxGap
boundary policy = half-sample-mirror
support / validity = sample-level FULL_SUPPORT |
  BOUNDARY_CONDITIONED (§12, §15)
output coordinate = Source heights
research predecessor = v0.1-research
```

Storm motion is **not** Analysis provenance (`48` §8,
`58` §14). `C` remains a sibling.

---

## 21. Versioning (D12)

**NEW PROJECT DECISION.**

```text
research:    esc-hr-time-hamming-sinc-lowpass / v0.1-research
production:  esc-hr-time-hamming-sinc-lowpass / v1
```

`v1` is not a silent rename of research `v0.1`. It is
the first production identity of the same kernel with
frozen integration policy:

```text
same:     λ_c, Δt, taps, Hamming, sinc formula, unity DC,
          zero-phase centering, half-sample mirror math,
          linear TIME interpolation of U/V/height,
          remap to Source heights
added:    TIME carrier, integer/monotonic TIME invariants,
          max-gap 5 s fail-closed, sample-level support
          class, no-fake-support, provenance contract
```

A change to cutoff, tap count, window, gap policy, or
boundary **math** is a new transform version. Support
labeling that does not change numbers is part of `v1`,
not a reason to keep calling the operator `v0.1-research`
in production.

---

## 22. Failure policy (D13)

**NEW PROJECT DECISION.** Prefer explicit fail /
Analysis unavailable over a silent algorithm change.

Source ingest MUST remain usable when Analysis cannot be
constructed, unless an existing Source invariant itself
fails.

Analysis is **unavailable** when any of:

```text
samplingClass ≠ high-resolution-mobile-esc
missing TIME on retained samples
any retained TIME not a finite integer second
retained TIME not strictly increasing
  (includes duplicates)
adjacent retained Δt > 5 s
uniform grid length < 81
(t_last − t_first) < 80
  (no FULL_SUPPORT sample would exist)
malformed / missing required Source provenance
I1 measurement record not 1:1 with Source levels
heights would not match Source exactly
```

Do not round TIME. Do not drop interior samples to
rescue the filter. Do not switch to height-domain or
Leise. Do not apply the operator to Moore by inventing
TIME.

---

## 23. Validation requirements

**NEW PROJECT DECISION.** Implementation validation must
cover all three qualified high-resolution-mobile-esc
cases with **one** specification. No case-name branches.

```text
Goshen NSSL1 2009-06-05 21:55:22
Prospect Valley NSSL1 2010-05-26 22:23:46
Dumas/Stinnett NSSL2 2010-05-18 21:52:18
```

Goldens / references must cover at least:

```text
exact transform id / v1
deterministic kernel coefficients
interpolation fraction and count
  (Goshen 52 / 0.02499, Prospect 91 / 0.03222,
   Dumas 105 / 0.03475 on the research uniform grids)
boundary support classification at launch and top
Source winds and heights unchanged
Analysis output heights exactly equal Source heights
selected BL-046 C3-40 s metrics reproduced within the
  documented numerical tolerance
  (transfer, 1–6 km bulk, median |ω_h|, 16–20 s residual)
```

Published 88 / 167 / 29 are not pass/fail.

Moore remains a **negative** compatibility check: the
transform must refuse `coarse-operational-raob`.

---

## 24. Moore non-applicability (D14)

**STILL-BINDING** from `58` §11 and BL-046 §15.

```text
coarse-operational-raob  ≠  high-resolution-mobile-esc
```

Moore / IGRA has no required 1 s measurement-TIME
semantics for this transform. Do **not** add fake TIME.
Do **not** select this transform merely because the
downstream object is an `EnvironmentalWindProfile`.

Compatibility is **declared sampling-class provenance**,
not knot count, median Δz, or “looks dense.”

---

## 25. Guided / Explore

**NEW PROJECT DECISION.** Product boundaries unchanged
by this file.

```text
Guided remains DEMO. It must not silently consume
  observed Analysis.

Explore observed environments currently expose Source
  profiles. That remains the environment input until a
  later composition SoT says otherwise.

This file may make an Analysis column available as a
  derived sibling. It does not replace Explore V_env.
```

No UI in this slice. No runtime change in this slice.

---

## 26. Hodograph

**NEW PROJECT DECISION.** No hodograph implementation here.

```text
Source hodograph remains Source (`51`).

If a future Analysis hodograph exists, it is an
explicitly derived Analysis curve, labeled as Analysis.

BOUNDARY_CONDITIONED segments, if shown, must remain
distinguishable (no-fake-support).

Do not silently render Analysis as “the observed
hodograph.”
```

---

## 27. What implementation is authorized

**NEW PROJECT DECISION.** Authorized later slice
(BL-010), not this documentation slice:

```text
ESC measurement-record TIME retention (I1 1:1, Source
  V(h) winds/heights unchanged; TIME-bearing test
  fixtures that do not need native EOL bytes)
production transform v1 as specified
Analysis EnvironmentalWindProfile at Source heights
sample-level support classification
Analysis provenance
headless validation on Goshen, Prospect, Dumas
Moore refusal
```

**Not** authorized by this file:

```text
diagnostic rewiring
hodograph overlay
Explore Source replacement
Guided consumption
Leise production operator
54 100 m bin-mean as production
provider framework
```

Writing this architecture is not that implementation.

---

## 28. Decisions

**NEW PROJECT DECISION.**

```text
D1   ESC measurement TIME lives on an ESC-family
     retained measurement record, not on atmospheric
     wind-versus-height.

D2   EnvironmentalWindProfile remains V(h)-only.

D3   QC gaps: linear TIME interpolation of U/V/height
     for integer-second holes with adjacent Δt in
     [2, 5]; filter support only; fail if Δt > 5 s.

D4   Production FIR: Hamming-sinc, λ_c = 40 s, 81 taps,
     Δt = 1 s, unity DC, zero-phase, component-wise U/V,
     remap to Source heights (§10).

D5   Boundary math: half-sample mirror.
     Boundary epistemology: BOUNDARY_CONDITIONED.

D6   No-fake-support rule is normative.

D7   Sample-level FULL_SUPPORT | BOUNDARY_CONDITIONED.
     Query support is derived.

D8   Layer diagnostics that include launch samples are
     BOUNDARY_CONDITIONED and must say so.
     No silent Source/Analysis splice.

D9   0–1 km Analysis SRH is BOUNDARY_CONDITIONED; not
     more correct; must not replace Source 0–1.

D10  Derivative-sensitive diagnostics require
     FULL_SUPPORT; mask both TIME boundary regions.

D11  Analysis provenance as §20.

D12  Production id: esc-hr-time-hamming-sinc-lowpass / v1
     (not a silent v0.1 rename).

D13  Fail closed: Analysis unavailable; Source remains.

D14  Moore / coarse-operational-raob: NON-APPLICABLE.

D15  Implementation of the Analysis column is
     AUTHORIZED as BL-010. This file is not that
     implementation. Diagnostics / UI remain later.
```

---

## 29. Gate verdict

```text
ARCHITECTURE ACCEPTED
PRODUCTION TRANSFORM SPECIFIED
IMPLEMENTATION AUTHORIZED
```

Authorized object: the high-resolution-mobile-esc
Analysis column and its TIME / gap / FIR / support /
provenance contract.

Not authorized by the BL-046 research report alone.
Not authorized: diagnostic rewiring, hodograph overlay,
Explore/Guided consumption.

---

## 30. Compact lock-in

```text
CONTRACT:          58 remains authoritative
THIS FILE:         ESC-class integration / authorization
TIME:              ESC measurement record; not EWP
EWP:               still V(h)
TRANSFORM:         esc-hr-time-hamming-sinc-lowpass / v1
DOMAIN:            TIME
λ_c / taps / Δt:   40 s / 81 / 1 s
KERNEL:            Hamming-sinc, unity DC, zero-phase
GAPS:              linear U/V/h; max adjacent Δt = 5 s
BOUNDARY MATH:     half-sample mirror
SUPPORT:           FULL_SUPPORT | BOUNDARY_CONDITIONED
NO FAKE SUPPORT:   normative
0–1 SRH:           Analysis BOUNDARY_CONDITIONED;
                   Source remains Source-honest
DERIVATIVES:       FULL_SUPPORT only; mask ends
MOORE:             NON-APPLICABLE
GUIDED / EXPLORE:  Source environment unchanged
HODOGRAPH:         Source polyline stays
54 / LEISE:        not this operator
BL-046:            research decision complete
BL-037:            CLOSED
BL-010:            COLUMN CORE IMPLEMENTED (headless);
                   consumers not wired
V1:                CLOSED; not reopened
```

---

## 31. Implementation

Analysis-column core is implemented headless:

```text
src/data/eolNsslMgausEsc/     TIME-bearing measurement record
src/data/escHrTimeAnalysis/    v1 transform, support, provenance
```

Source V(h) goldens and `EnvironmentalWindProfile` remain
unchanged. Diagnostic rewiring, hodograph overlay, and
Explore/Guided consumption are outside this column core.
