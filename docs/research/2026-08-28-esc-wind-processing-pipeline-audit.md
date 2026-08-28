# ESC Wind Processing Pipeline Audit

**Status:** RESEARCH CHECKPOINT / PROCESSING-ORIGIN AUDIT
**Date:** 2026-08-28
**Not:** production physics change, Source rewrite, Analysis profile,
production filter, hodograph change, BL-037 closure, BL-010
authorization
**Native bytes:** remain in gitignored `data/`; not committed
**Implementation authorization:** **NO**

Predecessor:

```text
docs/research/2026-08-28-esc-flight-phase-and-high-frequency-wind-audit.md
```

Sampler:

```text
docs/research/sample-esc-wind-processing-pipeline-audit.mjs
docs/research/artifacts/esc-wind-processing-pipeline-audit-summary.json
docs/research/artifacts/esc-processing-*.svg
```

Primary question: could a characteristic processing window /
differentiation / filter response **produce or reshape** the
repeatable ~17–19 s signature in published EOL Aspen `upsonde-1s`
ESC U/V?

Pendulation is **not** assumed.

Current Aspen documentation (AspenDocs, accessed 2026-08-28) is
distinguished from historical **Aspen 2.8.1.8**. Algorithm *family*
is treated as KNOWN for modern Aspen; numerical defaults of 2009/2010
`upsonde-1s` are **not** inferred from current defaults.

---

## 1. Pipeline stages

```text
physical sonde / balloon motion
  → RS92 GPS observation
  → ground-system / commercial-card wind derivation
     (possible pendulum filter)
  → input product received by Aspen
  → Aspen QC (mostly point removal)
  → Aspen wind modification (B-spline smooth; maybe dynamic adj.)
  → exported CLASS/ESC upsonde-1s product
  → EOL Loehrer-class QC flags (replace native QC codes)
```

| Stage | KNOWN | PLAUSIBLE | UNKNOWN |
| --- | --- | --- | --- |
| Physical sonde/balloon motion | GPS winds sample payload motion; pendulum and balloon self-induced motions exist as a class (Dirksen et al. 2014; Faber et al. 2023) | VORTEX2 train length ~30 m class (Dirksen RS92 example), T≈11 s simple; balloon-motion scale ~100 m ≈ 18 s at ~5.5 m s⁻¹ | Actual VORTEX2 string/parachute length |
| RS92 GPS | RS92-SGP ccGPS, 1 s telemetry, code-correlating GPS; velocity uncertainty specified for the sonde (Vaisala RS92-SGP datasheet; Jaatinen & Elms 2004 AMS) | Ground system, not the sonde firmware, typically applies pendulum smoothing | Exact 2009 GAUS card filter cutoff |
| Ground-system wind derivation | NCAR GAUS: winds computed from GPS at 1 s by a **commercial processing card**; that stream is described as digitally filtered for payload pendulum (NCAR GAUS dataset DOI `10.5065/d6k072gz`; ISPA 2010 GAUS README, same Aspen 2.8.1.8 `upsonde-1s`) | NSSL MGAUS is the same GAUS/RS92 hardware family | Whether NSSL VORTEX2 used an identical card/filter as the NCAR GAUS write-up |
| Aspen input | Aspen ingests GAUS-class files with winds already present (`man_input`: GAUS upsonde files). Aspen does **not** re-derive winds from lat/lon for this class as a required step. Position may be observed GPS or integrated from winds (`algo_position`) | VORTEX2 input to Aspen 2.8.1.8 was GAUS 1 s winds | Bit-identical input file; whether winds were already pendulum-filtered |
| Aspen QC | Time is the independent variable. Most QC **removes** points from a QC copy of raw. Wind U and V are tested separately but **both** are dropped if either fails (`man_qc`, `man_intro`) | Filter-check wavelength on the order of tens of seconds | `WindQCWL`, `WindQCDev`, `WindDisableQCFilter` for VORTEX2 |
| Aspen modify | Final smoothing **replaces** remaining values with a B-spline of wavelength `WindSmoothWL`; skipped if 0. Dynamic wind adjustment **modifies** winds using a B-spline derivative × `dz/g`; algorithm page says **dropsonde only**, while the QC table lists it for upward too (`algo_dynwindadj` vs `man_qc`) | For these upsondes, `WindDynCor` was off | `WindSmoothWL`, `WindDynCor`, `WindDynCorWL`, `BlendLength` |
| ESC export | Header: Aspen 2.8.1.8, configuration `upsonde-1s`. CLASS/ESC **cannot** carry processing-config metadata; CSV/netCDF can (`man_output`) | Exported product is Aspen **QC** data (smoothed if `WindSmoothWL≠0`), then EOL flags | Whether `WindSmoothWL` was 0 |
| EOL flags | Loehrer-class gross-limit / rate-of-change flags replace original QC (EOL 114.114 README). I1 drops MISSING/BAD winds | Flags do not rewrite U/V values | — |

Aspen GPS-velocity discriminator: `man_qc` states GPS-measured velocity is used as a discriminator for horizontal winds. The documented **Wind Error Check** (`algo_winderrcheck`) discards winds whose GPS wind-error exceeds height-dependent thresholds (`WindErrorHigh` / `WindErrorLow`). That **removes** points. It does not impose a 17–19 s wavelength.

`BlendLength` near-surface blending is documented as **dropsonde only**.

---

## 2. What deletes vs what modifies winds

**A. REMOVE points (do not rewrite U/V):**

```text
CRC/ID discard (if enabled)
limit / satellite / wind-error / buddy / outlier checks
filter check (point vs B-spline curve; WindQCWL + WindQCDev)
(wind: fail one component → drop U, V, speed, direction)
```

**B. MODIFY remaining wind values:**

```text
Final smoothing: B-spline, wavelength WindSmoothWL (no-op if 0)
Winds dynamic adjustment: w_adj = w − (dw/dt × dz / g)
  using B-spline derivative at WindDynCorWL
  documented dropsonde-only on the algorithm page
```

**C. Filters/smoothers with a temporal wavelength:**

```text
WindQCWL     — comparison smoother for removal, not the output series
WindSmoothWL — output B-spline smoother; independent variable = TIME
WindDynCorWL — smoother used only to estimate dw/dt
BlendLength  — dropsonde near-surface blend
```

**D. Ringing / sidelobes / preferred scales:**

A B-spline / MA-class **low-pass** can have a transition band and weak
sidelobes. It can **reshape** a spectrum and leave correlated residual
structure. It cannot, as a linear smoother, invent a narrow
deterministic ~18 s line from featureless white noise.

A **high-pass** (dynamic adjustment, which adds a term in `dw/dt`)
boosts short periods and can make the series noisier than raw
(`man_qc` warning). Combined with a later low-pass it is a band-pass.
Whether that pair ran on these **upsondes** is UNKNOWN (dropsonde-only
algorithm page vs upward checkmark in the QC table).

**E. Time is explicitly the independent variable** (`man_intro`).
Wavelengths are in seconds, not metres.

Do **not** treat current Aspen `upsonde-1s` GUI defaults as the 2010
VORTEX2 numbers.

---

## 3. VORTEX2 / Aspen product provenance

| Item | Recovered? |
| --- | --- |
| Aspen version | **YES** — header `Aspen Version 2.8.1.8` on all three |
| Config set name | **YES** — `Configuration upsonde-1s` |
| `WindSmoothWL` | **NO** |
| `WindQCWL` / `WindQCDev` | **NO** |
| `WindDynCor` / `WindDynCorWL` | **NO** |
| Raw vs QC vs smoothed QC | **NOT FULLY.** CLASS/ESC cannot store that metadata (`man_output`). Product is post-Aspen and post-EOL flags. Values may be raw-kept or B-spline-replaced. |
| CSV/netCDF with config | **NOT in local `data/` and not in EOL 114.114 as delivered** (ESC `.cls` only) |

Searched:

- Local `data/114.114*` and `114.115*` — concatenated ESC + READMEs only
- EOL 114.114 dataset record (DOI `10.5065/D6CC0Z0Q`) — ESC product
- 114.116 hi-res composite — remix of the same ESC-class columns, **not** a different processing of the same flight
- README links to 114.111 `readme.VORTEX20{09,10}.GAUS.radiosondes.doc` — QC notes for the GAUS program, not archived NSSL D-files / CSV in this tree

Same-flight alternative product (raw GPS / Aspen CSV / netCDF / unfiltered card winds): **not available here**. That is the strongest missing test.

Contemporaneous analog, not a VORTEX2 proof: ISPA 2010 NCAR GAUS used **Aspen 2.8.1.8, `upsonde-1s`** and states raw GPS winds are pendulum-filtered when run through Aspen (ISPA README). That documents the *processing class*, not the numeric `WindSmoothWL`.

---

## 4. RS92 upstream wind processing

**KNOWN**

- RS92-SGP transmits 1 s PTU + GPS (Vaisala datasheet; Dirksen et al. 2014 *AMT* 7, 4463–4490).
- DigiCORA retrieves `u,v` from GPS. GRUAN processing of **raw** DigiCORA `u,v` applies a low-pass and reduces wind temporal resolution to **40 s** because raw GPS winds are noisy from pendulum + GPS (Dirksen §9). GRUAN ≠ this ESC product.
- Standard Vaisala RS92/RS41 processing is **similar** to that ~40 s low-pass (Ingleby et al. 2022, cited by Faber et al. 2023). That damps vertical scales below ~300 m at 5 m s⁻¹.
- NCAR GAUS (same sonde family): 1 s winds from a **commercial processing card**, then a digital filter “to remove low frequency oscillations due to payload pendulum effects” (GAUS dataset write-up). Aspen is a later QC/smooth step.

**PLAUSIBLE**

- NSSL MGAUS VORTEX2 used the same GAUS/RS92 chain, so **some** pendulum attenuation likely happened **before or inside** Aspen, not only as an Explorer display issue.
- Published 1 s ESC U/V is a **processed estimate**, not an unfiltered GPS derivative.

**UNKNOWN / do not transfer**

- DigiCORA MW41 internals ≠ GAUS commercial card.
- RS41 55 m / 14.9 s and MW41 filter numbers are **analogy only**.
- Whether the card filter cutoff sat near 15 s, 40 s, or something else.

If a Vaisala-like **40 s** low-pass had fully been applied, an 18 s physical oscillation should be **strongly attenuated**. Survival of a 6–20 s local maximum in this ESC product is evidence that **this product is not a fully applied 40 s Vaisala wind product**, or that the peak is a residual in a shallow transition band.

---

## 5. Can filtering create 17–19 s?

Distinction (required):

```text
A linear smoother cannot invent arbitrary deterministic
periodicity from featureless noise.

Its transfer function CAN reshape spectra, pass or attenuate
an existing oscillation, and leave correlated residuals /
transition-band shoulders.
```

Illustrative **boxcar/MA** `|sinc(W/T)|` (explicitly **not** an Aspen
B-spline clone):

| W (s) | \|H\| at 18 s | \|H\| at 11 s | \|H\| at 40 s |
| --- | --- | --- | --- |
| 0 | 1 | 1 | 1 |
| 10 | 0.56 | 0.10 | 0.90 |
| 20 | 0.10 | 0.10 | 0.64 |
| 40 | 0.09 | 0.08 | 0 |

So:

| Hypothesis | Assessment |
| --- | --- |
| (a) passed physical oscillation | **PLAUSIBLE** if `WindSmoothWL` is 0 or ≪ 18 s, and/or upstream filter is weak at 18 s |
| (b) attenuated residual | **PLAUSIBLE** if a ~15–40 s pendulum filter was applied incompletely |
| (c) enhanced vs neighbours (transition band) | **POSSIBLE** as relative shaping, not as a proof |
| (d) generated as a processing artifact / ringing at 18 s | **NOT SUPPORTED** as the origin of a repeatable narrow line in three independent flights. Filter check *removes* outliers; B-spline low-pass does not resonantly mint 18 s from white noise |

Aspen 2.8.1.8 B-spline exact node spacing / frequency response:
**UNKNOWN** (AspenDocs B-spline page is a stub linking `NCAR/bspline`).

---

## 6. Empirical signature vs processing hypothesis

Same three native ESC products; I1-retained U/V; 31 s MA residual
for diagnostics only; interpolation to 1 s **not** written back.

Welch U–V coherence: 256 s windows, 50% overlap. A **single-FFT**
coherence is identically 1 and was not used.

| | Goshen | Prospect | Dumas |
| --- | --- | --- | --- |
| U 6–20 s local max | 18.58 s | 19.75 s | 16.98 s |
| V 6–20 s local max | 19.45 s | 17.87 s | 18.32 s |
| Half-power width | ~1 full-flight FFT bin | same | same |
| Welch coh at U-peak | **0.06** | **0.04** | **0.05** |
| Mean Welch coh 16–20 s | 0.08 | 0.19 | 0.10 |
| Phase at U-peak | −106° | −58° | +157° |
| Residual xcorr peak | lag −9 s, r=0.16 | −15 s, r=0.12 | −6 s, r=0.07 |
| 256 s windows near ~18 s | 80% | 86% | 82% |
| T/2 harmonic | ≪ peak | ≪ peak | ≪ peak |

**Same central period:** yes, mid-teens to ~20 s, not identical to 0.1 s.

**Bandwidth:** unresolved beyond full-flight Δf (width ≈ one bin).
Not a processing-notch fingerprint we can match to a known W.

**U/V phase / coherence:** **not** a stable whole-flight rotator.
Low Welch coherence and non-repeatable phase mean we **must not**
claim conical pendulation from quadrature. A wandering planar
oscillation remains possible. A scalar identical filter on U and V
**preserves** input coherence; it does not explain a *new* common
period with low coherence unless each component already had power
near 18 s.

**Harmonics:** no strong T/2 line.

**25–40 s:** still often comparable or larger (Goshen 32 s / 18 s
power ratio ~3.9 on the full-flight residual). Mixed across cases.
That longer band is a candidate leftover mesoscale / MA-scale
response (previous audit), not a unique Aspen ID.

**Stability:** period recurs in most 256 s windows; residual RMS
varies with height (launch and upper-level larger than mid-flight).
Not a constant-amplitude clock.

**Amplitude vs wind/ascent:** not a clean monotonic lock; not used
as a processing proof.

ESC lon/lat print step ≈ 0.001° ≈ 80–90 m. **Cannot** rebuild 1 s
winds from archived position as a same-file raw control.

---

## 7. Same-flight alternative products

**Unavailable** in the local archive and in EOL 114.114 as held
here. No raw D-file, no Aspen CSV/netCDF with `WindSmoothWL`, no
unfiltered GPS-velocity sibling for these three launches.

114.116 is not a processing variant of the same bytes.

This missing comparison is the strongest unresolved test.

---

## 8. Moore

Moore / IGRA is **not** a control for this question.

Different source class; 165 levels; median Δz ~174 m; 10–20 s
structure is not observable. Smoothness ≠ “no pendulation” and ≠
“no Aspen artifact.”

---

## 9. Verdicts

**PROCESSING ORIGIN:** PROCESSING MAY SHAPE THE SIGNAL BUT DOES NOT EXPLAIN ITS ORIGIN

Upstream GAUS/RS92 filtering and Aspen B-spline QC **can** pass,
attenuate, or relatively reshape a ~17–19 s band. They are **not**
shown to *generate* that repeatable line. VORTEX2 `WindSmoothWL`
was **not** recovered. A strong 40 s Vaisala-style wind filter is
**unlikely to have been fully applied** to this ESC product, given
survival of the 6–20 s local maximum.

**PENDULATION:** POSSIBLE BUT UNRESOLVED

The common period remains. Whole-flight U–V rotator structure is
**not** supported by Welch coherence. Intermittent / planar /
wandering platform motion is still open. Processing residual of an
incompletely filtered pendulum is still open.

The two verdicts are compatible: a platform oscillation may exist
**and** Aspen/GAUS filtering may have reshaped its observed spectrum.

---

## 10. Analysis consequence (BL-037)

Source 1 s points are **not** independent atmospheric samples.
They are post-GAUS-card and post-Aspen (and post-EOL flags).
Analysis must not treat native knot spacing (~5 m) as an
environmental layer, and must not assume the published series is
either raw GPS or a fully pendulum-killed 40 s product.

BL-037 still needs: which scales are non-atmospheric or unreliable,
and which operator keeps storm-scale structure.

No filter is chosen. No implementation is authorized.

---

## 11. Sources (selected)

- AspenDocs (current): `man_intro`, `man_qc`, `man_input`, `man_output`,
  `algo_smooth`, `algo_filtercheck`, `algo_dynwindadj`, `algo_dynadj`,
  `algo_winderrcheck`, `algo_position`, `algo_bspline` (stub → NCAR/bspline).
  Accessed 2026-08-28. Not a substitute for Aspen 2.8.1.8 defaults.
- EOL 114.114 README; dataset DOI `10.5065/D6CC0Z0Q`
- Dirksen et al. 2014, *Atmos. Meas. Tech.*, 7, 4463–4490
- Faber et al. 2023, *Atmos. Meas. Tech.*, 16, 4183–4193
- Ingleby et al. 2022, *Atmos. Meas. Tech.*, 15, 165–183 (RS41; RS92
  analogy only where they state similarity of Vaisala processing)
- NCAR GAUS dataset write-up, DOI `10.5065/d6k072gz`
- ISPA 2010 GAUS radiosonde README (Aspen 2.8.1.8 `upsonde-1s`)
- Vaisala RS92-SGP datasheet B210358EN-F; Jaatinen & Elms 2004 AMS
  “RS92 GPS windfinding”

---

## 12. Uncertainties

- Actual VORTEX2 `WindSmoothWL` / `WindQCWL` / `WindDynCor`
- Exact GAUS commercial-card pendulum filter
- Whether dynamic wind adjustment ran on these upsondes
- Same-flight raw vs QC spectral comparison
- Physical mix: pendulum vs balloon self-induced vs residual GPS
- Exact Aspen 2.8.1.8 B-spline frequency response

---

## 13. Reproducibility

```text
node docs/research/sample-esc-wind-processing-pipeline-audit.mjs
```

Requires gitignored native ESC under `data/`. Does not import
production physics. Does not write `src/`.
