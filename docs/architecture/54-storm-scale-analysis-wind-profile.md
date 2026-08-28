# Storm-Scale Analysis Wind Profile

**Status:** CONSTRUCTION SoT / NOT IMPLEMENTED /
epistemic status qualified in `55`
**Scope:** how a storm-scale **analysis** wind profile
is derived from a high-frequency observed mobile
sounding, so that smoothing is a named vertical-scale
choice, provenance-preserving, and suitable for SRH,
`ω_h`, streamwise/crosswise, and `T_tilt`.
Not a golden rewrite. Not I1 drop-t=0. Not a Fig. 2b
Leise clone. Not sandbox observed `C`. Not radar. Not
thermodynamics. Not reconstruction. Not a DEMO change.
**Physics:** `EnvironmentalWindProfile`,
`verticalWindShearBetween`, `horizontalVorticityFromShear`,
`stormRelativeHelicityBetween`, streamwise/crosswise,
and `T_tilt` APIs are unchanged. They consume whichever
profile is injected. This file chooses **which column**
those APIs see for storm-scale environment diagnosis.
**Implementation:** this file does not include adapter
code, a second runtime profile in Explore, or UI.

Predecessor:

```text
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/architecture/48-provider-neutral-environmental-profile-contract.md
docs/architecture/49-r1-first-historical-reference-storm.md
docs/physics/04-environmental-wind-profile.md
docs/physics/05-vertical-wind-shear.md
docs/physics/06-horizontal-vorticity.md
docs/physics/08-streamwise-crosswise-vorticity.md
docs/physics/09-storm-relative-helicity.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
```

Evidence:

```text
docs/research/2026-08-27-goshen-2155-hodograph-reproduction.md
```

Successor (epistemic qualification; not a rewrite of this
construction):

```text
docs/architecture/55-analysis-profile-generalization-gate.md
```

Keep these roles distinct:

```text
CURRENT FACT
NEW PROJECT DECISION
ANTI-CLAIM
```

---

## 1. Why a second column exists

**CURRENT FACT.** `ω_h`, streamwise/crosswise, and
`T_tilt` are **finite-layer** diagnostics. Live T1
takes `ω_h` from the piecewise-linear **segment that
contains** `y` (`26` §6). The streamwise overlay
requires **adjacent hodograph knots** (`06` UI §4).
SRH is the exact sum of Form B on those same segments
(`09` §8).

On a 1-s mobile column the native segment is ~5 m
(`49` §7.1: dY 3.3–31.9 m). That interval is
instrument sampling, not an environmental layer:

```text
ESC U/V quantization     0.1 m/s
native |ω_h| step        ~0.02 s⁻¹ per one count
observed max |ω_h|       1.05 s⁻¹  (3.7 m launch jump)
many interior segments   |ω_h| = 0  (tied 0.1 m/s)
0–1 km layer-mean |ω_h|  ~0.01 s⁻¹
```

Injecting the source golden into T1 therefore diagnoses
balloon/quantization vorticity, not storm-scale
environmental vorticity. `53` recorded that fact and
left the operator unlocked so it would not be a
Fig. 2b clone.

This file locks the operator from **diagnostic scale**,
not from Markowski’s unspecified 5-step Leise.

---

## 2. What is being built

**NEW PROJECT DECISION.**

```text
SOURCE PROFILE      I1 golden; 2029 knots; keep t=0
                    Explore V_env; scientific polyline

ANALYSIS PROFILE    derived EnvironmentalWindProfile
                    same sounding, AGL bin-mean, Δz = 100 m
                    the column that storm-scale ω_h, SRH,
                    streamwise/crosswise, and T_tilt consume
```

The analysis profile is still piecewise-linear
horizontal wind versus world Y (`04`). It is not a new
physics type. It is not a resample hidden inside
`sampleAtHeight`.

DEMO / Guided columns whose native median segment is
already ≥ Δz do **not** get an analysis profile. Their
source *is* the analysis scale.

---

## 3. What “smoothing” means here

**NEW PROJECT DECISION.**

Smoothing is **vertical averaging of observed winds
onto a storm-scale height grid**. It is not:

```text
a 5-step Leise filter
time-domain smoothing of the 1-s series
pressure-level interpolation
gap filling
a synthetic Y = 0 node
a fit to Fig. 2b inset 88 / 167 / 29
visual beautification of the scientific polyline
```

Height, not time, is the diagnostic independent
variable (`04`, `05`, `06`, `09`, `22`). After QC drops,
1 s ≠ constant Δz. The operator is therefore in AGL.

---

## 4. Locked operator

**NEW PROJECT DECISION.**

Input: the source `EnvironmentalWindProfile` (or the
equivalent golden knots). Source bytes are not mutated.

```text
Δz = 100 m

h_min = source.minHeight
h_max = source.maxHeight

for k = 0, 1, 2, … :
  lo = h_min + k Δz
  hi = min(lo + Δz, h_max)
  if lo >= h_max: stop
  members = source knots with height in [lo, hi)
    last bin, if hi == h_max, is [lo, h_max]
  if members is empty: skip the bin
    (do not interpolate a ghost knot)
  emit {
    height    = arithmetic mean of member heights
    eastward  = arithmetic mean of member eastward
    northward = arithmetic mean of member northward
    vertical  = 0
  }
```

Then construct the existing `EnvironmentalWindProfile`
from the emitted knots. Fail on the live invariants:
fewer than two knots, non-finite values, heights not
strictly increasing.

If two consecutive emitted heights would be equal
(IEEE / rounding), fail rather than silently merge.
Goshen source has no gap > 50 m, so empty bins below
~7 km are not expected. Empty bins above a dropout
are skipped; that is coverage, not repair.

Do **not**:

```text
drop source t = 0
replace the first analysis knot with a “surface” guess
interpolate across skipped bins
smooth the emitted knots further
Leise / 1-2-1 / B-spline as a second pass
retune Δz after comparing SRH to 88
```

The launch transient remains in the **source**. In the
analysis column it is **diluted** because it occupies
one of ~20 members of the first 100 m bin. That is the
transient policy. It is not an I1 drop.

---

## 5. Why Δz = 100 m

**NEW PROJECT DECISION**, derived from three
inequalities. Not from Fig. 2b. Not from SPC
thresholds.

Let `δV = 0.1 m/s` be the ESC reported precision.
Finite-difference noise floor:

```text
|ω_h|_noise ~ δV / Δz
```

Typical 0–1 km environmental `|ω_h|` on this column is
O(10⁻²) s⁻¹ (layer `|ΔV|/Δh` ≈ 0.01 s⁻¹).

```text
(1) quantization
    require |ω_h|_noise ≤ 0.001 s⁻¹
    ⇒ Δz ≥ 100 m

(2) balloon / GPS pendulum
    O(10 s) period × ~5 m/s ascent
    ⇒ O(50–100 m) vertical wavelength
    native adjacent knots resolve that as ω_h
    ⇒ Δz ≥ 100 m so adjacent analysis knots do not

(3) storm-layer structure
    0–1 km is the thinnest layer this project
    actually diagnoses
    ⇒ Δz ≤ 250 m so that layer still contains
      several analysis segments
```

Intersection: `100 m ≤ Δz ≤ 250 m`.

Lock **100 m**: the smallest scale that satisfies
(1) and (2). Larger Δz (250 m) starts to erase the
0–1 km hodograph turn that *is* environmental.
Smaller Δz (50 m) leaves quantization and pendulum
inside adjacent-knot `ω_h`.

Research bin-100 m on this sounding does **not**
recover published 0–1 km SRH = 88. That is expected
and accepted. Δz is not a knob for 88.

---

## 6. Why this operator, not the rejected ones

| Candidate | Verdict | Why |
| --- | --- | --- |
| 5-step Leise on 1-s / 5 m | **Rejected** | Caption names it; grid and endpoints unknown. Native-index Leise with frozen ends does not even recover 88 (`53`). Cloning it is not a scientific scale choice |
| Skip source t=0 | **Rejected** | Matches 88 numerically; reopens I1; deletes a GOOD observation from the source |
| Diagnostic window on the source (T1 uses `[y−Δz/2, y+Δz/2]`) | **Rejected for this slice** | Would change `26` §6 and the adjacent-knot overlay contract. A second profile reuses live APIs: the analysis knot spacing *is* the T1 segment and the overlay layer |
| Interpolate to 100, 200, … m then subsample | **Rejected** | Reads the wiggly source at isolated heights; does not average pendulum out of `ω_h` |
| Time smoother, then keep 1-s knots | **Rejected** | Independent variable of the diagnostics is height |
| Pressure-level interpolation | **Rejected** | Pressure is not an Explorer consumer coordinate (`48` §4.3) |
| Parker (2014) Barnes 3D | **Rejected** | Composite of 134 soundings, not a 1D column operator |
| Fit Δz to 88 / 167 | **Rejected** | `48` §12 / `53`: published inset is a labeled check, not an oracle |

Bin-mean at bin-mean height invents neither a wind nor
a height that was not measured in that bin.

---

## 7. Provenance

**NEW PROJECT DECISION.**

The analysis record is a sibling of the source record
(`48` §4.5), not a mutation of it.

```text
sourceClass      observed-raob
                 (still observed winds, after a named
                  vertical average — the same honesty
                  class as post-Aspen 1-s ESC)
sourceIdentity   <source sourceIdentity>
                 + " ; storm-scale analysis: 100 m AGL bin-mean"
validTime        same as source
location         same as source (launch lat/lon)
heightDatum      same as source
coverage         analysis minHeight / maxHeight,
                 emitted knot count,
                 skipped empty bins
nativeUnitsNote  same as source
derivedFrom      source sourceIdentity
processing       "AGL bin-mean; Δz=100 m; knot height =
                  mean member height; empty bins skipped;
                  no gap fill; no Y=0; source t=0 kept
                  in source only"
```

`derivedFrom` and `processing` are **analysis-record**
fields. They are not required on the I1 source record.
They do not add a fifth `sourceClass`.

ANTI-CLAIM: the analysis column is not “more observed”
than the source, and not “the Markowski sounding.”

---

## 8. Which object feeds which consumer

**NEW PROJECT DECISION.** Goshen / any dense observed
column (native median segment < Δz):

| Consumer | Column |
| --- | --- |
| Explore `V_env`, tracers, scientific hodograph polyline | **SOURCE** (`50`, `51`) |
| 0–6 km bulk \|ΔV\| literacy | **SOURCE** (already agrees with Fig. 2b) |
| Layer SRH as integral of the imported column | **SOURCE**, labeled as such |
| Layer SRH as storm-scale environment diagnosis | **ANALYSIS** |
| Local `ω_h`, streamwise/crosswise overlay | **ANALYSIS** |
| `T_tilt` | **ANALYSIS** |

DEMO / Guided: source only.

Sandbox `C` remains prescribed DEMO `(10, 0)`.
Published `(10.5, −1.3)` remains sibling evidence.
Storm-scale SRH still requires an injected `C`; this
file does not change which `C` the sandbox uses.

Tracers therefore follow the observed 1-s `V_env`.
Tilting / local vorticity diagnose the storm-scale
column. That split is intentional: advection should
not be pre-smoothed merely because derivatives need a
scale.

---

## 9. Suitability after this transform

| Diagnostic | On analysis profile |
| --- | --- |
| SRH | Form B on ~100 m segments. Launch transient diluted, not deleted. Number will differ from source 133 and from published 88; report both |
| `ω_h` | Finite-layer on analysis segments. Quantization floor 0.001 s⁻¹. No 1.05 s⁻¹ spike as a 3.7 m layer |
| Streamwise / crosswise | Adjacent analysis knots satisfy the overlay’s single-segment contract at storm scale |
| `T_tilt` | `26` §6 segment picker sees ~100 m layers. Same `ω_h` as the overlays |

The scientific polyline stays the source. Analysis may
later be an optional labeled hodograph overlay. That UI
is not this file.

---

## 10. Fig. 2b relationship

**CURRENT FACT.** Fig. 2b remains independent evidence
that the **source** identity, signs, and 0–6 km `|ΔV|`
are right.

**NEW PROJECT DECISION.** After an implementation exists,
compute analysis 0–1 / 0–3 SRH and 0–6 `|ΔV|` at
published `C` and record them next to 88 / 167 / 29 as
a **labeled discrepancy**, not a pass/fail of Δz.

Agreement would be interesting. Disagreement does not
authorize retuning. The analysis profile’s job is
honest storm-scale derivatives, not a facsimile of the
black curve.

---

## 11. Anti-claims

```text
this operator is not Markowski’s 5-step Leise
Δz = 100 m is not a cloned Fig. 2b length
published 88 is not a calibration target
bin-mean is not a claim that the balloon measured
  a 100 m-average air parcel
analysis minHeight > 2.4 m is not a new I1 drop
Explore V_env is not silently replaced
sandbox C is not observed C
Goshen tracers are not observed Goshen parcels
```

---

## 12. Compact lock-in

```text
SOURCE:            unchanged 2029-knot golden; keep t=0
OPERATOR:          AGL bin-mean; Δz = 100 m;
                   knot = (mean h, mean u, mean v)
WHY 100 m:         quantization + pendulum floor,
                   0–1 km still resolved
TRANSIENT:         diluted in first bin; not deleted
PROVENANCE:        derivedFrom + processing; still
                   observed-raob
V_env / polyline:  SOURCE
SRH / ω_h / ŝĉ / T_tilt (storm-scale): ANALYSIS
FIG 2b NUMBERS:    labeled check, not oracle
DEMO:              no analysis profile
IMPLEMENTATION:    not included
EPISTEMIC STATUS:  qualified in `55` — candidate
                   pending generalization; this file
                   does not authorize implementation
```
