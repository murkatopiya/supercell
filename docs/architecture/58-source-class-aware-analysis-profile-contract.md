# Source-Class-Aware Analysis Profile Contract

**Status:** ARCHITECTURE ACCEPTED / ANALYSIS CONTRACT DEFINED /
PRODUCTION TRANSFORM SELECTION NOT YET AUTHORIZED /
IMPLEMENTATION BLOCKED
**Scope:** the Source → Analysis contract after BL-037
source-class research. Not a production filter. Not an
Analysis implementation. Not a Source rewrite. Not a
hodograph production change. Not Bunkers. Not observed
sandbox `C`. Not a V1 reopen. Not a provider interface.
**Physics:** unchanged. `EnvironmentalWindProfile` and
diagnostic APIs remain profile-agnostic consumers.
**Implementation:** none. Production `src/**` MUST remain
unchanged.

Predecessor (split and qualification, not replaced):

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/architecture/54-storm-scale-analysis-wind-profile.md
docs/architecture/55-analysis-profile-generalization-gate.md
```

Ingest (Source columns; not Analysis):

```text
docs/architecture/56-esc-multi-sounding-observed-profile-ingest.md
docs/architecture/57-igra-observed-profile-ingest.md
```

Evidence (conclusions only; reports are not copied):

```text
docs/research/2026-08-27-goshen-2155-hodograph-reproduction.md
docs/research/2026-08-28-additional-sounding-case-selection.md
docs/research/2026-08-28-vortex2-source-qualification.md
docs/research/2026-08-28-moore-oun-igra-source-qualification.md
docs/research/2026-08-28-esc-flight-phase-and-high-frequency-wind-audit.md
docs/research/2026-08-28-esc-wind-processing-pipeline-audit.md
docs/research/2026-08-28-leise-filter-and-analysis-operator-comparison.md
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

## 1. Why this contract exists

**CURRENT FACT.** `53` accepted two representations of one
sounding: Source vs a later Analysis profile. `54`
recorded a first concrete candidate (100 m AGL bin-mean)
from Goshen. `55` qualified that candidate: not a
validated universal production transform; implementation
blocked pending generalization research (BL-037).

**CURRENT FACT.** That research now exists. It does not
select a production filter. It does answer the
generalization question that `55` asked:

```text
A single identical numerical operator applied to every
EnvironmentalWindProfile is NOT a scientifically honest
Analysis policy.
```

This file records the contract that follows from that
answer. It does not implement Analysis. It does not
choose Leise, bin-mean, or any other operator as
production.

```text
AnalysisProfile
  ≠  apply one universal 100 m smoother to everything

AnalysisProfile
  =  a declared, provenance-preserving transformation
     from Source into a representation with an explicit
     scientifically justified resolvable / reliability
     scale appropriate to that source sampling class
```

---

## 2. Evidence chain (WHY)

These are recorded conclusions, not a re-run of the
research. Full methods and numbers stay in the cited
reports.

1. The Goshen NSSL1 2155 UTC **source** column is a dense
   observed ESC product. Its hodograph contains
   high-frequency structure that is unsuitable as
   native-segment environmental `ω_h` (`53`; Goshen
   reproduction research).

2. `54` proposed 100 m AGL bin-mean as a **first
   candidate** from Goshen diagnostic-scale arguments.
   `55` forbade reading that as a production default.

3. Prospect Valley and Dumas, independent high-resolution
   ESC columns, show similar small-scale wind structure
   at different storm-scale winds (VORTEX2 source
   qualification; ESC family ingest `56`).

4. Moore / OUN IGRA is a **different sampling class**:
   operational RAOB, 165 levels, median Δz ≈ 174 m
   (Moore qualification; `57`).

5. Flight-phase audit: Goshen, Prospect, and Dumas are
   **CLEAN ASCENT**. The retained high-frequency
   structure is not leftover post-burst descent.

6. Spectral audit: all three ESC columns share a
   repeatable local **~17–19 s** signature in U and V.

7. Typical ascent maps that period to roughly
   **90–110 m** vertically. That equivalent is a
   **source-process scale**, not an Analysis target
   scale, and it is **not** the same metres across
   soundings.

8. Processing audit: published Aspen `upsonde-1s` winds
   are processed products, not independent raw
   atmospheric samples.
   **PROCESSING MAY SHAPE THE SIGNAL BUT DOES NOT
   EXPLAIN ITS ORIGIN.**
   **PENDULATION: POSSIBLE BUT UNRESOLVED.**

9. Leise research: CEDRIC `T5FLTR` NSTEP=5 is
   reconstructed (5-pt stencil; stride pyramid
   `1,2,4,8,16,8,4,2,1`). It **strongly attenuates**
   ~17–19 s on a comparable 1-s / ~5 m grid.
   Markowski Fig. 2b **input grid / domain remains
   unknown**. Leise is historical evidence, not a
   production specification.

10. A 100 m boxcar / bin-mean has sinc or occupancy
    aggregation behavior. It is a **baseline**, not a
    selected operator (`54` remains that baseline’s
    construction record).

11. Applying the **same numerical operator** to ESC and
    Moore does **not** represent the same physical
    Analysis scale. NSTEP=5 on Moore’s native index is
    ~32 levels × ~174 m ≈ 5.6 km, not 100 m. Resampling
    Moore to 5 m to run an ESC filter is fake precision.

12. Therefore: **UNIVERSAL OPERATOR = NOT SUPPORTED.**

A future maintainer does not need to re-run those slices
to know why this file exists. The reports remain the
evidence.

---

## 3. Relationship to existing SoTs

**STILL-BINDING**

```text
48   provider-neutral EnvironmentalWindProfileRecord
     sourceClass is epistemic origin, not sampling class
53   Source vs Analysis split                 ACCEPTED
54   100 m AGL bin-mean                       FIRST CANDIDATE
     construction record; not withdrawn as history
55   54 is not a validated universal default
     implementation was already BLOCKED
56   ESC Source ingest                        GATE ACCEPTED
57   IGRA Source ingest                       GATE ACCEPTED
```

**NEW PROJECT DECISION.** This file is the Analysis
**contract**. It does not rewrite `54`’s construction
text. It does change what that construction is allowed
to mean as policy:

```text
54 100 m bin-mean is NOT a universal Analysis default.
54 remains the historical first-candidate record and a
   transparency/baseline construction for high-rate ESC.
55’s generalization gate is now informed by empirical
   source-class research; successor is this file.
Implementation remains BLOCKED. 55’s block is preserved.
This file does not lift it.
```

If a later document conflicts about **whether a universal
100 m operator is Analysis policy**, this file wins for
that policy question. `54` still owns the bin-mean recipe
as a candidate construction. `53` still owns the split.
`48` still owns the Source record and `sourceClass`.

---

## 4. Source versus Analysis

**NEW PROJECT DECISION.**

### Source

The Source profile is the closest normalized
representation of the **published source product** that
Explorer is willing to consume.

```text
preserves source sampling semantics
does not invent Explorer atmospheric smoothing
may contain measurement / platform / processing-scale
  structure
remains provenance-bearing
must remain available for inspection and Source
  hodograph display
```

I1 / `56` / `57` goldens are Source. QC drop that the
archive already declared (missing/BAD winds) is adapter
normalization, not Analysis.

### Analysis

The Analysis profile is a **derived** sibling of Source.

```text
produced by an explicit named transform
transform has a documented scientific purpose
transform declares domain and assumptions
transform declares an effective resolution /
  reliability / attenuation scale
transform never rewrites Source
Analysis provenance points back to the Source record
  and to the transform specification
```

Both objects, if they exist, are still
`EnvironmentalWindProfile` samples versus world Y (`04`).
The distinction is **semantic and provenance**, not a new
physics type.

### What Analysis is not

**ANTI-CLAIM.**

```text
Analysis is not cleaned truth
Analysis is not the atmosphere with noise removed
Analysis is not a silent resample of Source
Analysis is not a second archive
Analysis is not Markowski Fig. 2b
Analysis is not observed storm motion
Analysis does not own C
Analysis is not authorized by this file as a runtime object
```

It is a derived interpretation **suitable for declared
diagnostics**, with an explicit scale and an explicit
lie-to-children boundary: finer wiggles were attenuated
or aggregated **on purpose**.

---

## 5. Sampling class

**NEW PROJECT DECISION.** Sampling class is the minimum
source-class concept this contract needs. It is **not**
a provider framework. It is **not** `48` `sourceClass`.

```text
48 sourceClass     epistemic origin of the winds
                   laboratory-prescribed | observed-raob |
                   model-analysis | reanalysis | other-named

samplingClass      scientifically relevant sampling /
                   provenance semantics of the column
                   (resolution, regularity, instrument
                   footprint) — not a UI identity
```

Goshen, Prospect, Dumas, and Moore are all honest
`observed-raob`. They are **not** the same sampling class.

The open set currently needed:

```text
high-resolution-mobile-esc
  examples (not algorithm keys):
    Goshen NSSL1 2009-06-05 21:55:22
    Prospect Valley NSSL1 2010-05-26 22:23:46
    Dumas/Stinnett NSSL2 2010-05-18 21:52:18
  ~1 s retained timing
  median Δz ~5 m
  thousands of levels
  upstream instrument + processing footprint
    observable at small scales

coarse-operational-raob
  example (not an algorithm key):
    Moore OUN IGRA 2013-05-20
  sparse irregular vertical sampling
  median Δz ~174 m
  165 levels
  ESC-scale high-frequency filtering is not
    physically meaningful on the native grid
```

These are **not** the only classes forever. Case names
must **not** be hardcoded into Analysis algorithms.
DEMO / Guided prescribed columns have no Analysis
profile (`54` / `55`); their native spacing already
is the laboratory scale.

---

## 6. Four scales that must not be conflated

**NEW PROJECT DECISION.**

| Name | Meaning | Example |
| --- | --- | --- |
| Source sampling spacing | distance / time between retained Source knots | ESC median Δz ~5 m, median Δt ~1 s; Moore median Δz ~174 m |
| Instrument / processing reliability scale | scales at which the published product is not an independent atmospheric sample | ESC ~17–19 s / ~90–110 m candidate; Aspen/GAUS footprint |
| Analysis operator scale | declared attenuation / aggregation scale of a named transform | T5FLTR-5 stopband 32 samples; 100 m bin width |
| Physical atmospheric scale | storm-layer structure the diagnostic cares about | 0–1 km turn; 0–6 km shear |

```text
ESC median Δz ~5 m does NOT imply independent reliable
atmospheric information at 5 m vertical wavelength.

Moore median Δz ~174 m does NOT authorize interpolation
to 5 m and then claiming 5 m Analysis resolution.

18 s time-domain ≠ 100 m height-domain ≠ 20-sample index
unless the mapping is demonstrated on that profile.

λz ≈ w_ascent × T
A fixed temporal source process maps to different
vertical wavelengths across soundings.
```

Prefer, in transform documentation:

```text
effective analysis scale
resolvable scale
reliability scale
attenuation scale
```

Do **not** claim a single number is “the true atmospheric
resolution.”

---

## 7. No-fake-resolution rule

**NEW PROJECT DECISION. Normative.**

A derived Analysis profile **MUST NOT** create apparent
information at scales finer than justified by the source
sampling class.

```text
Interpolation may exist inside a mathematically defined
transform. Interpolation does not create observational
resolution.

Any resampled grid retains provenance of the original
sampling.

Coarse RAOB MUST NOT be resampled onto a dense ~5 m
grid merely to run an ESC filter and then exposed as
if that dense output were observed or resolved.
```

This is a hard architecture rule, not a style preference.

---

## 8. Domain must be declared

**NEW PROJECT DECISION.**

The same nominal number in different domains is not
equivalent. Every Analysis transform declares its
independent variable:

```text
height
time
source index
other, only if explicitly defined
```

**No hidden source-index filtering.** If the operator
runs on sample index, that is the declared domain, and
the implied physical scale must be stated from the
actual Δt / Δz of that column.

Height is the diagnostic independent variable (`04`,
`05`, `06`, `09`, `22`). A time-domain or index-domain
transform that later feeds those APIs must say so, and
must say what vertical scale it induced.

---

## 9. Analysis transform contract

**NEW PROJECT DECISION.** Any future Analysis transform,
before it can be production-authorized, **MUST** declare
at least:

```text
transform id / stable name
transform version
sampling-class compatibility
input domain (height / time / source index / other)
whether uniform spacing is required
any resampling step
resampling method
interpolation policy
gap policy
boundary behavior
operator family
operator parameters
phase behavior
effective resolution / reliability / attenuation scale
units of that scale
Source record identity
known scientific purpose
known limitations
```

This is an architecture contract, not a runtime DTO.
Do not invent `AnalysisProfile.ts` from this list.

---

## 10. High-resolution ESC policy

**NEW PROJECT DECISION.**

The high-resolution mobile ESC sampling class **may
justify** a later transform whose purpose is to reduce
source / instrument / processing-scale structure below a
**declared** reliability scale while preserving
storm-scale wind structure (0–1 km curvature, 0–6 km
shear, named kinks that survive a low-pass).

This file authorizes that **category of future research /
selection**. It does **not** select the operator.

Research candidates, none selected:

```text
Leise / T5FLTR-style low-pass
a transparent height-domain low-pass
another explicitly characterized offline operator
100 m bin-mean (`54`) as baseline only
```

100 m bin-mean is **not** rejected as a Goshen-derived
baseline construction. It is **rejected as a universal
default**. Production selection is a subsequent bounded
decision (backlog BL-046), not this gate.

---

## 11. Coarse operational RAOB / Moore policy

**NEW PROJECT DECISION.**

```text
Same Analysis contract
  ≠  same numerical filter
```

Do **not** force an ESC transform onto
`coarse-operational-raob`.

Valid outcomes for this class:

```text
Source is already the highest scientifically defensible
representation for some diagnostics; no additional
high-frequency Analysis filtering.

A later coarse-source Analysis transform may be justified
for a different purpose (not ESC-scale hair removal).
```

Moore-class data must be checked for **compatibility or
explicit non-applicability** of any proposed ESC operator.
Non-applicability is a legal result.

---

## 12. Diagnostic consumption

**NEW PROJECT DECISION.**

Every diagnostic that will eventually see both
representations must **declare** its operand:

```text
Source
Analysis
either, with explicit mode and provenance
```

Do **not** silently switch live diagnostics to Analysis.
This file does not rewire anything.

Consumption roles, as policy not implementation:

```text
A. Source visualization / provenance inspection
     Source hodograph; coverage; launch transient;
     “what did the product actually publish?”

B. Storm-scale / layer diagnostics
     may later consume Analysis for SRH, layer shear,
     when an Analysis column exists and is named

C. Local derivative-sensitive diagnostics
     native-segment ω_h, streamwise/crosswise overlay,
     T_tilt on the containing segment
     are the reason Analysis exists for ESC (`53`, `54`)
     they must not silently keep using Source 1-s
     segments as environmental vorticity
```

Potential principle, not a live rewiring:

```text
derivative-sensitive diagnostics may eventually require
Analysis on high-resolution ESC;

bulk / source-insensitive diagnostics (e.g. 0–6 km |ΔV|)
may remain valid on Source.
```

Every inference still names its operand
(“explain every motion / explain every inference”).

DEMO / Guided: no Analysis profile; Source **is** the
laboratory scale.

---

## 13. Hodograph policy

**NEW PROJECT DECISION.** Production hodograph is
**unchanged** by this file.

Future semantic options, if a display SoT is written:

```text
Source hodograph
  published normalized Source structure
  current scientific polyline (`51`)

Analysis hodograph
  derived representation
  MUST be visibly identifiable as Analysis
  not raw observation
```

Do **not** silently replace the observed Source
hodograph with a smoothed curve. If both are shown,
provenance is explicit. No UI in this slice.

---

## 14. Storm motion and SRH honesty

**STILL-BINDING** from `48` §8.

Analysis does **not** own storm motion. `C` remains a
sibling with its own provenance (prescribed / derived /
observed).

SRH is:

```text
wind-profile representation  +  storm motion
```

Future Analysis diagnostics preserve **both** chains.
Do **not** bake published Goshen `C = (10.5, −1.3)` into
an Analysis profile. Do **not** use published 88 / 167
as a transform tuning target (`48` §12, `53` §7, `54`
§10).

---

## 15. Transform validation requirements

**NEW PROJECT DECISION.** Before any Analysis transform
is production-authorized, a validation package is
required.

High-resolution ESC, at least:

```text
Goshen
Prospect Valley
Dumas
```

Inspect, with scientific metrics not prettiness:

```text
transfer / attenuation behavior
bulk shear preservation (0–1 / 0–3 / 0–6)
hodograph curvature at storm-relevant scales
SRH sensitivity under an explicitly fixed C
  (comparison C, not a hidden observed motion)
derivative / ω_h stability
boundary / launch-transient behavior
sensitivity to source sampling differences
cross-sounding consistency
```

Coarse class: Moore is checked for compatibility or
documented non-applicability.

```text
Validation is NOT visual smoothness.
Validation is NOT matching one published SRH number.
```

Fig. 2b 88 / 167 / 29 remain **external labeled
checks**, not pass/fail of the operator (`55`, BL-031).

---

## 16. Leise status

**CURRENT FACT.**

KNOWN:

```text
T5FLTR central stencil
  [-1/16, 1/4, 5/8, 1/4, -1/16]
NSTEP=5 stride pyramid
  1, 2, 4, 8, 16, 8, 4, 2, 1
mirror / half-sample endpoint treatment in T5FLTR
zero-phase 5-pt passes
strong attenuation around 18 samples on a comparable
  uniform grid  (|H|(18) ≈ 0.002)
stopband onset 2^NSTEP samples  (32 for NSTEP=5)
```

UNKNOWN / PARTIAL:

```text
exact domain / grid of Markowski Fig. 2b
whether the sounding path was CEDRIC L1D or standalone
  T5FLTR
Markowski workflow endpoint / extra QC details
```

`54` §6 rejected cloning an **unspecified** 5-step Leise
as production. That rejection **stands**. Reconstruction
of T5FLTR does not make Fig. 2b a production recipe.

```text
Leise is scientifically informative historical evidence.
Leise is NOT a production transform specification.
```

The earlier frozen-end 1-2-1 proxy is **not** T5FLTR
and is not this contract.

---

## 17. Decisions

**NEW PROJECT DECISION.**

```text
D1  Source and Analysis are separate provenance-bearing
    representations.

D2  Analysis is sampling-class-aware.

D3  A universal numerical Analysis operator is rejected.

D4  Every Analysis transform declares domain, assumptions,
    and effective scale.

D5  Interpolation / resampling never upgrades
    observational resolution.

D6  High-resolution ESC may receive an additional
    small-scale reliability transform once separately
    selected and validated.

D7  Coarse IGRA/RAOB is not subjected automatically to
    ESC-scale filtering.

D8  Diagnostics must eventually declare whether Source
    or Analysis is consumed.

D9  Source visualization remains available and must not
    be silently replaced by Analysis.

D10 No production Analysis transform is selected by this
    architecture gate.
```

---

## 18. Gate status

```text
ARCHITECTURE ACCEPTED
ANALYSIS CONTRACT DEFINED
PRODUCTION TRANSFORM SELECTION NOT YET AUTHORIZED
IMPLEMENTATION BLOCKED
```

This file does **not** authorize BL-010. Writing the
contract is not implementation.

---

## 19. Compact lock-in

```text
SPLIT:             53 ACCEPTED
CONTRACT:          this file
SAMPLING CLASS:    high-resolution-mobile-esc
                   | coarse-operational-raob
                   | (open set)
48 sourceClass:    distinct; not replaced
UNIVERSAL 100 m:   NOT a default
54:                first-candidate construction /
                   ESC baseline record; not policy
55:                still blocks implementation;
                   generalization now informed
LEISE:             T5FLTR known; Fig. 2b grid unknown;
                   not production
ESC:               category of later reliability
                   transform allowed; operator not chosen
RAOB:              no automatic ESC filter
NO FAKE RESOLUTION: normative
C / SRH:           Analysis does not own C;
                   88 is not a tuning target
HODOGRAPH:         Source polyline stays; Analysis
                   overlay if/when labeled
IMPLEMENTATION:    NOT AUTHORIZED; BLOCKED
SELECTION GATE:    BL-046
V1:                CLOSED; not reopened
```

---

## 20. Implementation

This document does not include implementation.
No `AnalysisProfile` type, no filters, no adapters, no
hodograph change, no diagnostic rewiring, no UI.
Production `src/**` remains unchanged.
