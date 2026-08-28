# Leise Filter and Analysis Operator Comparison — 2026-08-28

**Status:** RESEARCH EVIDENCE / NOT A PRODUCTION FILTER
**Not:** Analysis implementation, Source mutation, hodograph
production change, physics change, BL-037 closure
**Object:** reconstruct the 5-step Leise operator named in
Markowski et al. (2012) Part I Fig. 2b, characterize its
response, and compare it with a 100 m baseline and one
reference low-pass. No operator is production-authorized.

Sampler:

```text
docs/research/sample-leise-filter-response.mjs
docs/research/artifacts/leise-filter-and-analysis-operator-summary.json
docs/research/artifacts/leise-transfer-function.svg
docs/research/artifacts/leise-goshen-sr-hodograph-0-6km.svg
docs/research/artifacts/leise-goshen-u-residual-periodogram.svg
```

Predecessor evidence:

```text
docs/research/2026-08-27-goshen-2155-hodograph-reproduction.md
docs/research/2026-08-28-esc-flight-phase-and-high-frequency-wind-audit.md
docs/research/2026-08-28-esc-wind-processing-pipeline-audit.md
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/architecture/54-storm-scale-analysis-wind-profile.md
docs/architecture/55-analysis-profile-generalization-gate.md
```

---

## 1. Questions

```text
Q1  What algorithm is the Leise filter cited by Markowski?
Q2  What does "5-step" mean mathematically?
Q3  Can the transfer function be reconstructed?
Q4  Where does it substantially attenuate?
Q5  Where does the ESC ~17–19 s / ~90–110 m signature sit?
Q6  How does it differ from a 100 m bin-mean / boxcar / FIR?
Q7  What storm-scale structure does each candidate keep?
```

No operator is selected for production.

---

## 2. Citation chain

| Link | What it is |
| --- | --- |
| Markowski et al. (2012) *MWR* **140** 2887–2915, Fig. 2b caption | “The black (gray) hodograph is smoothed (unsmoothed); the smoothing was accomplished with a **5-step Leise filter**.” Printed 0–1 / 0–3 SRH and 0–6 shear are for the **smooth** curve. `C = (10.5, −1.3)` m s⁻¹ |
| Same paper, methods (radar *W* field, not the sounding) | “Scales smaller than 2 km were filtered using a **three-step Leise (1982) filter, which suppresses wavelengths ≤ 8Δ**” |
| Bibliography | Leise, J. A., 1982: *A multidimensional scale-telescoped filter and data extension package.* NOAA Tech. Memo. **ERL WPL-82**, 19 pp. NOAA IR records the same memo as **1981** (series date). NTIS PB82-164104 |
| CEDRIC User Manual, September 2009, FILTER | NSTEP=1,2,3,… first zeros at **2Δ, 4Δ, 8Δ,…**. Analogous to two-way Hanning at dyadic strides. Method `L1D` is 1-D Leise |
| CEDRIC source `T5FLTR.f` | Header: **“JIM LEISE 8/80”**. This is the FORTRAN package described by WPL-82, not a later rewrite |
| Cai (2005) *MWR* | cutoff wavelength `2^m Δ`; wavelength `2^{m+1} Δ` damped **~24%** |

Primary NOAA PDF (repository.library.noaa.gov/view/noaa/30189) was **not** retrieved here (download 403). Reconstruction uses the FORTRAN that WPL-82 shipped, plus CEDRIC’s documented NSTEP semantics, plus Markowski’s own 3-step = 8Δ statement.

Markowski most likely means **this** Leise / CEDRIC NSTEP operator, not a generic 1-2-1, and not a later RS41/Vaisala wind filter. Confidence: **high** for the algorithm family; **medium** for the sounding’s input grid (see §4).

A previous Explorer sampler
(`sample-goshen-2155-hodograph-reproduction.ts`) used **two-way 1-2-1
with frozen ends**. That is **not** T5FLTR. Do not reuse it as the
Markowski operator.

---

## 3. Exact recovered algorithm (T5FLTR)

Central stencil, one pass, uniform index spacing, stride `s`:

```text
y'[i] = -1/16 y[i-2s] + 1/4 y[i-s] + 5/8 y[i] + 1/4 y[i+s] - 1/16 y[i+2s]
```

Analytic one-pass response (`θ = 2π s / λ`):

```text
H_5(θ) = 5/8 + (1/2) cos θ − (1/8) cos 2θ
       = (1/4) [ 4 − (1 − cos θ)² ]  ≥ 0 on ℝ
```

`H_5(π) = 0` (first zero at `λ = 2s`). `H_5(π/2) = 0.75` (Cai’s 24%
at `λ = 4s` for NSTEP=1). Symmetric → **zero phase**. No negative
sidelobes in a single pass. Negative taps exist; the trigonometric
identity still keeps `H_5 ≥ 0`.

**“N-step” / “5-step”** is Leise’s `NSTEP` parameter, **not** five
identical 1-2-1 passes and **not** a 100 m cutoff.

T5FLTR applies `2·NSTEP − 1` five-point passes. Strides climb then
descend. For **NSTEP = 5**:

```text
strides = 1, 2, 4, 8, 16, 8, 4, 2, 1
```

Coarsest stride once; finer strides twice. Restriction:

```text
n ≥ 5 · 2^(NSTEP−1)   →   NSTEP=5 needs n ≥ 80
```

Leise’s own comments (T5FLTR header):

```text
STOPBAND  ≥  2^NSTEP     points/cycle
PASSBAND  ≤  2^(NSTEP+2) points/cycle
```

CEDRIC first-zero table and Markowski’s “3-step suppresses ≤ 8Δ”
agree: stopband onset **`λ = 2^NSTEP Δ`**. For 5-step: **32 samples**.

Boundary: **half-sample mirror** (repeat endpoint), `y[−1]=y[0]`,
`y[−2]=y[1]`. The filter **does smooth the ends**. Frozen-end
implementations are wrong.

U and V are filtered **independently** (scalar 1-D operator). Time is
**not** hard-wired: the independent variable is whatever uniform
index the caller supplies.

Total 5-step gain (product over the nine strides) was checked against
mid-record sinusoids of length 2048. Analytic vs empirical `|H|`
agreed to printed precision at λ = 4, 8, 16, 18, 19, 32, 64, 100, 128.

```text
|H_5step|(18 samples) = 0.00232
|H_5step|(19 samples) = 0.00931
|H_5step|(32 samples) = 0
|H_5step|(64 samples) = 0.716     (Cai 24% at 2^{N+1})
|H_5step|(128 samples)= 0.976
```

---

## 4. Markowski application semantics

**Documented**

- Input: 2155 UTC NSSL1 sounding (same launch as the Explorer Goshen source).
- Filter: 5-step Leise, applied to the hodograph wind (U/V).
- Gray = unsmoothed, black = smoothed; inset numbers from black.
- Same paper’s radar usage: N-step Leise, cutoff `2^N Δ`.

**Not documented** (still)

```text
time vs height vs sample-index as Δ
whether winds were interpolated to a uniform height/pressure grid
endpoint / data-extension (but T5FLTR’s own boundary is now known)
whether t = 0 was dropped before filtering
NSHARP vs Explorer Form B for printed SRH
```

Do **not** equate “5-step Leise” with a vertical 100 m cutoff. That
equality is false unless `32 Δ = 100 m`, i.e. `Δ ≈ 3.1 m`, which is
not stated.

**Inferable, labeled as such**

1. Fig. 2b gray is a ~1 s polyline. Native-index Δ ≈ 1 s is the
   simplest grid consistent with the unsmoothed curve.
2. T5FLTR **must** smooth endpoints. The launch transient is mixed
   into the first knots. That is a different 0–1 km SRH policy from
   I1 keep-t=0 on the **source**.
3. Native-index NSTEP=5 stopband is **32 s** ≈ **182 m** at Goshen’s
   median ascent 5.7 m s⁻¹ — not 100 m.
4. Research 0–1 km SRH (Form B, `C` published, layer `[h_min, 1000]`):

| Operator | Goshen 0–1 SRH |
| --- | ---: |
| raw source | 132.7 |
| T5FLTR-5 native index | **85.9** |
| T5FLTR-5 on 5 m height | 88.4 |
| FIR Hamming-41, 100 m cutoff on 5 m | 90.1 |
| 100 m AGL bin-mean | 60.0 |
| published Fig. 2b (external) | **88** |

Proximity of several *different* smoothers to 88 is **not** a unique
fingerprint of Leise. The previous source-qualification already
showed that **skipping the first knot** yields ≈87. The 0–1 km number
is dominated by launch-transient dilution. 0–3 km remains off
(T5FLTR-5 index **153.8** vs published **167**). **Do not tune. Do
not treat 88 as recovered Markowski output.**

---

## 5. Domain: time vs height vs index

The ESC artifact candidate is **temporal** (`T ≈ 17–19 s`). Vertical
equivalent depends on ascent:

| Case | median ascent | 17 / 18 / 19 s → m | 5-step stopband if Δ=1 s | 5-step stopband if Δz=5 m |
| --- | ---: | --- | ---: | ---: |
| Prospect | 4.8 m s⁻¹ | 81.6 / 86.4 / 91.2 | 154 m | 160 m (≡ 33.3 s) |
| Dumas | 5.2 | 88.4 / 93.6 / 98.8 | 166 m | 160 m (≡ 30.8 s) |
| Goshen | 5.7 | 96.9 / 102.6 / 108.3 | 182 m | 160 m (≡ 28.1 s) |

A **fixed-time** 5-step Leise (native 1 s) puts all three signatures
in the stopband, but maps them to **different** vertical wavelengths.

A **fixed-height** 5-step Leise on a 5 m grid has a 160 m stopband
for all three, which is **different periods** in time.

A **sample-index** filter on irregular Δz (Moore) is a third thing:
32 native levels × median 174 m ≈ **5.6 km**. That is not a 100 m
operator.

Historical Fig. 2b most likely used **sample-index on the ~1 s
series** (gray curve). That is an inference, not a caption fact.

This distinction is central to BL-037: an Analysis contract can
declare a **reliability scale** without forcing one numerical stencil
in one domain onto every source class.

---

## 6. 100 m baseline

**A. 100 m AGL bin-mean** (`54` candidate): arithmetic mean of source
knots in `[lo, hi)`; empty bins skipped; knot at mean member height.
Not a linear filter on a uniform grid. No sinc identity. Bin phase
and occupancy matter. On ESC it emits ~123–161 knots. On Moore it
emits **144 / 307** possible 100 m bins — the output spacing remains
O(174 m).

**B. Sliding 21-point boxcar on a 5 m grid** (105 m, nearest odd
length to 100 m). Response `sinc(W/λ)`:

- first zero at λ = W (here 105 m / 21 samples);
- sidelobes pass shorter wavelengths;
- **not** an ideal low-pass.

A boxcar whose width equals a periodic wavelength notches that
wavelength and still leaks energy through higher sidelobes. That is
why it remains a **transparency baseline**, not a rejected toy.

On Goshen’s 1 s series, 100 m / 5.7 m s⁻¹ ≈ **17.5 s** — the boxcar
width sits **on** the independently observed 17–19 s scale. That is
coincidence of ascent × 100 m, not a Leise property.

---

## 7. Reference low-pass

One offline operator, not a replacement candidate:

```text
symmetric Hamming-windowed sinc FIR
taps            41 (odd)
grid            regular 5 m height (research linear resample)
fc              0.05 cycles/sample  ≡  100 m wavelength
unity DC gain
linear phase; zero after centering
half-sample mirror convolution at ends
```

Purpose: controllable transition, explicit `|H|`, predictable phase.
The 90–110 m band sits **in the transition**, not in a hard stopband
(`|H|` remaining ~0.24–0.30 of raw residual power). That is
intentional: a 100 m cutoff does **not** equal Leise-5’s 32-sample
zero.

---

## 8. Empirical operator comparison

Research-only. Source goldens unread-mutated. Height-grid operators
use piecewise-linear resample onto 5 m; that resample is **not**
written back. Storm motion for **all** SRH numbers in this file:

```text
C = (10.5, −1.3) m s⁻¹
```

This is published Goshen motion. It is **not** observed C for
Prospect, Dumas, or Moore. It exists so operator-to-operator SRH is
comparable. Published 88 / 167 / 29 remain **external**.

### 8.1 Suppression of ~17–19 s / ~90–110 m

Native-index residual power 16–20 s, T5FLTR-5 / raw:

| Case | U ratio | V ratio |
| --- | ---: | ---: |
| Goshen | 5.8e-5 | 1.4e-4 |
| Prospect | 6.8e-5 | (same order) |
| Dumas | 1.3e-4 | (same order) |

Height-grid 90–110 m residual power / raw on the 5 m series:

| Case | Leise-5 | boxcar-21 | FIR-41 |
| --- | ---: | ---: | ---: |
| Goshen | 0.0013 | 0.0029 | 0.277 |
| Prospect | 0.0018 | 0.0020 | 0.303 |
| Dumas | 0.0007 | 0.0057 | 0.238 |

If 5-step Leise is applied in the same domain as the 1 s series, the
17–19 s line is **strongly attenuated**. A 100 m-cutoff FIR only
partly attenuates the equivalent vertical band. Bin-mean has no
single `|H|(f)` but empirically kills adjacent-knot hair and the
launch spike.

### 8.2 Shear, SRH, derivatives, endpoints (Goshen)

Layer = `[h_min, h1]` with `h_min = 2.4 m`. Form B SRH.

| Operator | 0–1 SRH | 0–3 SRH | 0–1 \|ΔV\| | 0–3 \|ΔV\| | 0–6 \|ΔV\| | 0–6 arc | \|ω\|_max | \|ω\|_med | first knot (u, v) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| raw | 132.7 | 197.9 | 9.95 | 11.71 | 30.06 | 121.1 | 1.055 | 0.019 | (−1.2, 0.2) |
| T5FLTR-5 index | 85.9 | 153.8 | 5.51 | 10.67 | 30.59 | 58.8 | 0.222 | 0.008 | (−2.17, 4.36) |
| T5FLTR-5 @ 5 m | 88.4 | 156.4 | 5.77 | 10.85 | 30.51 | 64.9 | 0.165 | 0.010 | (−2.09, 4.25) |
| boxcar 105 m | 76.4 | 144.5 | 4.96 | 11.00 | 30.34 | 78.3 | 0.090 | 0.011 | (−2.29, 5.32) |
| FIR-41 | 90.1 | 156.9 | 6.17 | 10.77 | 29.73 | 99.1 | 0.102 | 0.014 | (−1.72, 4.02) |
| bin-mean 100 m | 60.0 | 128.5 | 3.97 | 11.30 | 31.36 | 66.1 | 0.050 | 0.010 | (−3.08, 6.82) |
| Fig. 2b external | 88 | 167 | — | — | 29 | — | — | — | — |

0–6 km bulk shear is **stable** (~29–31) across operators. 0–1 km
bulk shear and SRH are **not**: they move with how the launch
transient and the low-level turn are averaged. Local `|ω_h|` max
collapses from the 3.7 m launch jump; median `|ω_h|` halves.
Hodograph arc length 0–6 km is a curvature proxy: raw 121 m s⁻¹ of
polyline length vs ~59–99 after smoothing. Bin-mean and Leise remove
more small loops than the 100 m FIR.

Prospect / Dumas: same qualitative pattern (HF power gone under
T5FLTR-5 index; 0–6 \|ΔV\| comparatively stable; 0–1 SRH drops).
Absolute SRH is not comparable to Goshen’s published inset.

### 8.3 Endpoints

T5FLTR’s mirror **rewrites** the first knot. Source t=0 remains in
the golden. An analysis column that used this operator would **not**
preserve the raw launch wind. That is a policy choice, not I1.

---

## 9. Moore / source class

Moore: 165 IGRA levels, median Δz **174 m**.

| Question | Result |
| --- | --- |
| Is NSTEP=5 mathematically defined? | Yes (`n=165 ≥ 80`) |
| Is it a 100 m filter? | **No.** Stopband ≈ 32 native levels ≈ **5.6 km** at median Δz |
| 100 m bin-mean? | Emits 144 knots, skips **163** empty 100 m bins. Output scale stays the native RAOB scale |
| 5 m resample then Leise-5? | **Fake precision.** ~20 invented knots per native gap. Not used as a metric source |

Coarse RAOB Analysis does **not** need an extra ESC-scale high-frequency
filter. The source *is* already coarser than 100 m. A single Analysis
**contract** (source vs analysis split, named scale, provenance) does
**not** require a single identical numerical operator.

---

## 10. Universal-operator question

Evidence against “apply one 100 m smoother to everything”:

1. ESC 1 s: 100 m is a *candidate* reliability scale (quantization +
   ~90–110 m HF line), not a unique stencil.
2. The historical 5-step Leise, if native-index, is a **32 s**
   operator (~150–180 m vertically), not 100 m.
3. Time-domain vs height-domain 5-step Leise are **not equivalent**
   across Prospect / Dumas / Goshen ascent rates.
4. Moore: 100 m is finer than the observations. Applying it (or
   Leise-5) as if the grid were ESC 1 s is fake precision.
5. 0–6 km bulk shear is robust; 0–1 km SRH and local `ω_h` are
   operator-sensitive. A universal number of metres does not freeze
   those diagnostics.

---

## 11. Verdicts

**LEISE RECONSTRUCTION:** PARTIALLY RECOVERED

- T5FLTR NSTEP=5 (stencil, pyramid, mirror boundary, `|H|`) :
  **exactly recovered** from CEDRIC FORTRAN + CEDRIC manual +
  Markowski’s own 3-step = 8Δ statement.
- Markowski Fig. 2b **input grid / domain**: still **not stated**.
  Native 1 s index is the strongest remaining hypothesis, not a
  caption fact.

**LEISE vs 17–19 s SCALE:** STRONGLY ATTENUATES

when the 5-step operator is applied in the **same domain** as the
1 s (or 5 m) series (`|H|(18 samples)=0.002`). If Markowski used a
much coarser Δ, this statement would not apply; that coarser Δ is
not supported by the unsmoothed gray curve.

**100 M BOXCAR:** SUITABLE BASELINE ONLY

Useful sinc pedagogy and a transparent occupancy-mean (`54`). Not
competitive as a spectral operator: first-zero notch plus sidelobes;
Goshen 0–1 SRH 60 vs Leise/FIR ~86–90; stronger low-level shear
erasure.

**UNIVERSAL OPERATOR:** NOT SUPPORTED

**PENDULATION:** POSSIBLE BUT UNRESOLVED
(unchanged; this slice does not identify the 17–19 s source).

**PROCESSING:** PROCESSING MAY SHAPE THE SIGNAL BUT DOES NOT
EXPLAIN ITS ORIGIN (unchanged from the pipeline audit).

Compatible reading: a platform/GPS scale can exist **and** T5FLTR-5
would remove it from a published 1 s hodograph **and** Aspen may
already have reshaped it.

---

## 12. What BL-037 must know next

```text
Source 1-s ESC columns contain a repeatable ~17–19 s scale.
A reconstructed 5-step Leise (T5FLTR) strongly attenuates that
scale if applied in sample/time (or 5 m height) domain.
A 100 m bin-mean is a coarser, different operator, not Leise,
and is not meaningful on Moore’s native grid.

Therefore Analysis must declare:
  (1) the reliability / resolvable scale for each source class;
  (2) the independent variable (height, not silent time);
  (3) endpoint / launch-transient policy;
and must not assume one numerical stencil is the contract.

Do not assume published 1-s points are independent atmospheric
samples. Do not clone Fig. 2b Leise as production. Do not treat
88 as a tuning oracle. Do not authorize implementation here.
```

**Architecture recommendation for the next gate (not a lock):**

```text
AnalysisProfile = source-class-aware normalization to a declared
analysis resolution / reliability scale

NOT
AnalysisProfile = apply one universal 100 m smoother to everything
```

`54` remains a **candidate construction** for high-rate ESC, still
qualified by `55`. It is not withdrawn and not production policy.

---

## 13. Anti-claims

```text
This file does not select a production filter.
This file does not implement Analysis.
This file does not mutate Source goldens.
This file does not prove pendulation.
This file does not prove that Markowski used native-index T5FLTR.
This file does not treat 85.9 or 88.4 as a recovered 88.
The 1-2-1 frozen-end proxy is not Leise.
```

---

## 14. Unresolved

- Fig. 2b exact grid (time / height / pressure / Δ).
- Whether Markowski’s sounding path used CEDRIC `L1D` or a standalone
  T5FLTR / NSHARP helper.
- 0–3 km 154 vs 167: Form B vs NSHARP, layer bounds, extra QC.
- Historical Aspen `WindSmoothWL` (still unknown).
- Physical identity of the 17–19 s line.
- Bin-mean phase / origin sensitivity (named in `55`, not run here).
