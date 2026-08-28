# ESC Flight-Phase and High-Frequency Wind Audit

**Status:** RESEARCH CHECKPOINT / FLIGHT-PHASE + SPECTRAL AUDIT
**Date:** 2026-08-28
**Not:** production physics change, Source-profile rewrite, Analysis
profile, production filtering, hodograph change, BL-037 closure,
BL-010 authorization
**Native bytes:** remain in gitignored `data/`; not committed
**Implementation authorization:** **NO**

Predecessor:

```text
docs/research/2026-08-28-vortex2-source-qualification.md
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/architecture/54-storm-scale-analysis-wind-profile.md
docs/architecture/55-analysis-profile-generalization-gate.md
```

Sampler (research-only; reads local `data/`):

```text
docs/research/sample-esc-flight-phase-and-high-frequency-wind-audit.mjs
docs/research/artifacts/esc-flight-phase-and-high-frequency-wind-audit-summary.json
docs/research/artifacts/esc-*-altitude-time.svg
docs/research/artifacts/esc-*-uv-residual-30s.svg
docs/research/artifacts/esc-*-welch-periodogram.svg
docs/research/artifacts/esc-three-sounding-welch-u-overlay.svg
```

Drop rules used here are the existing I1 ESC wind rules
(`isUsableWindRecord`). Native record order is preserved. ESC data
are **not** sorted by height. Production goldens are compared as
read-only JSON; they are not rewritten.

This file answers two source/QC hypotheses independently:

```text
A. flight-phase contamination / descent after balloon burst
B. radiosonde pendulation / other platform-related periodic motion
```

It does **not** begin from the assumption that hodograph hair is
pendulation.

---

## 1. Soundings

| | Goshen | Prospect Valley | Dumas / Stinnett |
| --- | --- | --- | --- |
| Site | Bushnell/NSSL1 | Mobile System/NSSL1 | Mobile System/NSSL2 |
| UTC | 2009-06-05 21:55:22 | 2010-05-26 22:23:46 | 2010-05-18 21:52:18 |
| Native file | `data/114.114 Goshen/NSSL_MGAUS_20090605.cls` | `data/114.114 2010-05-26/NSSL_MGAUS_20100526.cls` | `data/114.114 2010-05-18/NSSL_MGAUS_20100518.cls` |
| Dataset | EOL 114.114 | same | same |
| Sonde | Vaisala RS92-SGP (ccGPS) | same | same |
| Aspen | 2.8.1.8 `upsonde-1s` | same | same |
| `Data Type` | NCAR GAUS/Ascending | NSSL1 MGAUS/Ascending | NSSL2 MGAUS/Ascending |

Moore OUN IGRA 2013-05-20 is a **coarse control only**. IGRA
semantics are not ESC semantics.

---

## 2. Direct answers (Q1–Q9)

**Q1. Do the native ESC files contain records after maximum altitude
consistent with balloon burst / descent?**
**No.** For all three soundings the native maximum `Alt` is the
**last native record**. `postMaxNativeCount = 0`.

**Q2. Can any descent/post-burst records survive current I1 usability
rules?**
**Not applicable as a surviving-contamination path.** There are no
post-max native records to test. I1 cannot retain what the native
product does not contain.

**Q3. Are production normalized Goshen / Prospect / Dumas profiles
demonstrably ascent-only in practice?**
**Yes.** I1-retained columns match the committed goldens exactly
(count and every `height` / `eastward` / `northward`). Heights are
strictly increasing. Last golden knot = last I1-kept knot = native
maximum altitude (as AGL). No descent entered production.

**Q4. Actual sampling intervals in TIME and ALT for retained records?**
Native TIME cadence is 1 s. After I1 drops, retained consecutive
`Δt` is exactly 1 s for ~97.5–97.8% of pairs (median `Δt` = 1 s;
p10 = p90 = 1 s). Remaining steps are 2–4 s gaps at dropped seconds.
Retained median `ΔAlt` is 5.7 / 4.8 / 5.2 m (Goshen / Prospect /
Dumas).

**Q5. Do U(t) and/or V(t) contain repeatable narrow-band
high-frequency structure?**
**Yes, as a local maximum in the 6–20 s band**, in both U and V, in
all three soundings, in both flight halves. Characteristic period
**~17–19 s**. This is **not** the largest peak in a 4–40 s band
(see §6).

**Q6. Is that period compatible with known radiosonde pendulation /
platform motion?**
**Compatible with the platform-motion family, not uniquely identified
as a simple RS92 pendulum.** Simple-gravity periods: 30 m ≈ 11.0 s
(Dirksen et al. 2014 RS92 unwinder example); 40 m ≈ 12.7 s; RS41
55 m ≈ 14.9 s (do **not** transfer to RS92). Observed 17–19 s is
longer than a 30 m simple pendulum. Literature also places balloon
self-induced motion near ~100 m vertical scale (Faber et al. 2023),
which maps to ~18 s at ~5.5 m s⁻¹. VORTEX2 string length is
**unknown**.

**Q7. Does a temporal periodicity map into the vertical scales of
visible hodograph hair?**
**Yes as a diagnostic mapping.** `λz ≈ ascent_rate × T` for T ≈ 18 s
gives ~90–110 m (p10–p90 roughly 70–140 m). Native adjacent knots
are ~5 m, so that oscillation is many knots long and is the right
order for visible 1-s hair. This mapping does **not** select an
Analysis smoothing scale.

**Q8. Is similar periodic structure present across Goshen, Prospect
and Dumas?**
**Yes in the 6–20 s local-maximum sense**, despite different
large-scale wind structures. All three are independent RS92-SGP /
Aspen `upsonde-1s` launches.

**Q9. What can and cannot scientifically be inferred?**
See §11. In short: descent contamination is ruled out for these
ESC products; a repeatable ~18 s source-level oscillation is
supported; unique identification as sonde pendulation is **not**.

---

## 3. Flight-phase audit

Native sequence inspected in file order using TIME, Alt, U, V
(plus reported `Wcmp` and pressure as auxiliaries). Maximum altitude
is the first native record that attains the highest valid `Alt`
(not 99999).

| | Goshen | Prospect | Dumas |
| --- | --- | --- | --- |
| Native records | 2082 | 2824 | 3022 |
| First native TIME / Alt | −1 s / 1558.8 m | −1 s / 1358.8 m | −1 s / 1121.6 m |
| Last native TIME / Alt | 2080 s / 13819.7 m | 2822 s / 15376.8 m | 3020 s / 17147.7 m |
| Max-Alt index / TIME / Alt | last / 2080 s / 13819.7 m | last / 2822 s / 15376.8 m | last / 3020 s / 17147.7 m |
| Pressure at max Alt | 151.3 mb | 120.0 mb | 89.2 mb |
| Records after max Alt | **0** | **0** | **0** |
| Persistently decreasing Alt | no | no | no |
| Post-max I1-usable U/V | 0 | 0 | 0 |
| Would break I1 strictly increasing? | no | no | no |
| **Verdict** | **CLEAN ASCENT** | **CLEAN ASCENT** | **CLEAN ASCENT** |

These are **not** full-atmosphere burst profiles. Last pressure is
still 89–151 mb (ceiling ~12.3–17.1 km MSL) while `ΔAlt` remains
positive through the last native step. The delivered ESC product
ends during ascent. Whether raw telemetry after last ESC record
existed is **unknown**; it is not in this product.

Header `Data Type` contains `Ascending`. That is a product label,
not independent proof. The altitude sequence is the proof.

**Hypothesis A is not supported** for these three native ESC
soundings. There is no descent/post-burst contamination to leak
into I1 or into production goldens.

If usable descent records had existed and production had accepted
them, that would have been a source-QC blocker. That condition
did not occur.

---

## 4. Native vs I1-retained vs production

I1 drops missing U or V (9999), Qu/Qv MISSING (9) or BAD (3),
missing Alt (99999). No sort. No skip-`t=−1` rule: pre-release
rows survive only if U/V/Alt are usable (Goshen `t=−1` is dropped
because winds are missing; Prospect/Dumas `t=−1` can be kept).

| | Goshen | Prospect | Dumas |
| --- | --- | --- | --- |
| Native | 2082 | 2824 | 3022 |
| I1 dropped | 53 | 91 | 105 |
| I1 kept | 2029 | 2733 | 2917 |
| Production golden | 2029 | 2733 | 2917 |
| Exact golden match | **yes** | **yes** | **yes** |
| First kept height AGL | 2.4 m (`t=0`) | −0.1 m (`t=−1`) | −0.5 m (`t=−1`) |
| Last kept height AGL | 12261.8 m | 14017.9 m | 16025.6 m |
| Post-max native | 0 | 0 | 0 |
| Post-max I1-usable | 0 | 0 | 0 |

Production is the I1-retained ascent column. It is not a
height-sorted or descent-filtered rewrite of a longer native
flight.

---

## 5. Sampling and ascent rate (I1-retained; research-only)

| | Goshen | Prospect | Dumas |
| --- | --- | --- | --- |
| Median `Δt` | 1 s | 1 s | 1 s |
| p10 / p90 `Δt` | 1 / 1 s | 1 / 1 s | 1 / 1 s |
| Exact 1 s share | 97.83% | 97.47% | 97.46% |
| `Δt` unique | 1, 2, 3, 4 s | same class | same class |
| Median `ΔAlt` | 5.7 m | 4.8 m | 5.2 m |
| Median ascent rate | **5.7 m s⁻¹** | **4.8 m s⁻¹** | **5.2 m s⁻¹** |
| p10 / p90 ascent rate | 4.7 / 7.3 | 3.8 / 6.4 | 3.95 / 6.6 |
| Reported ESC `Wcmp` median | 5.7 | 4.8 | 5.2 |
| Gaps (`Δt>2` s or `Δh>20` m) | 6 | 19 | 21 |

Gaps are I1-dropped seconds, not flight-phase reversals. Largest
retained `Δh` examples are 20–32 m over 3–4 s near the upper
troposphere (still ≪ 50 m coverage hole). Production coverage
semantics are unchanged.

---

## 6. High-frequency method

Pendulation, if present, is a **time-domain** process. Analysis is
therefore on U(t), V(t), not on a height-sorted hodograph.

Retained sampling is regular enough for FFT: ~97.5% exact 1 s.
For spectral diagnostics only, U/V were linearly interpolated onto
the integer-second grid from first to last kept TIME. Filled
fraction 2.5–3.5%. **Interpolated values are never written back
into Source data.**

First differences `ΔU`/`ΔV` use **only** consecutive retained pairs
with `Δt` exactly 1 s (no interpolation).

Background separations (all research-only; none is an Analysis
operator):

```text
ΔU / ΔV first differences
linear detrend of interpolated U/V
residual after centered 31-s moving average
residual after centered 61-s moving average
```

Spectra: Hann-windowed periodogram; Welch (256 s, 50% overlap) on
the 31-s residual; 256 s windowed peak tracking in the 6–20 s band;
flight split into two time halves.

The 6–20 s band is inspected **because** that is where a simple
pendulum / short platform oscillation would sit, not because it
was the largest FFT bin. In the broader 4–40 s band, larger power
often sits near **25–38 s**. Part of that may be leftover
mesoscale shear that a 30 s smoother does not remove, and/or
response near the moving-average scale. Those longer peaks are
**not** treated as the candidate high-frequency line.

Welch 256 s windows have coarse period resolution (bins at
256/`k` seconds). A reported windowed median of exactly 16.0 s is
an FFT-bin effect (`256/16`), not a physical lock. Full-flight
periodograms (`N` ~ 2000–3000) resolve ~17–19 s more finely.

---

## 7. Periodicity results

### 7.1 6–20 s local maxima (full-flight, background-removed)

Dominant local maximum in this band, U and V, several backgrounds:

| Sounding | U residual/detrend | V residual/detrend | Both halves? |
| --- | --- | --- | --- |
| Goshen | 18.5–19.5 s | 16–19 s | yes (~19 s U; ~16–19 s V) |
| Prospect | 17.6–18.8 s | 16–19 s | yes |
| Dumas | 18.2–18.9 s | 15.4–17.0 s | yes |

Windowed 256 s tracking (6–20 s top peak within 20% of the windowed
median): Goshen 80% of windows (U and V); Prospect 90–95%; Dumas
82–86%. Median windowed period sits on the 16 s FFT bin; the
physical clustering is **mid-teens seconds**, not a proof of 16.000.

Amplitude of the 31-s residual (research-only): median
`|(u′,v′)|` ≈ 0.30–0.32 m s⁻¹; p90 ≈ 0.66–0.88 m s⁻¹. That is
several ESC 0.1 m s⁻¹ counts, so the oscillation is not only
quantization flicker.

### 7.2 What is not claimed

- The 17–19 s line is **not** the largest 4–40 s peak.
- First-difference spectra are more broadband; 18 s is present but
  often not the top of 4–40 s.
- Autocorrelation of residuals did **not** yield a clean lag-18
  confirmation (Goshen first weak positive peak ~28 s; Prospect/Dumas
  `ΔU` lag-2 is adjacent-sample smoothness).
- A secondary ~11 s feature appears in some Welch bins (Goshen /
  Prospect U). That is the 30 m simple-pendulum number, but it is
  weaker than the 17–19 s local maximum in the full-flight 6–20 s
  residual/detrend spectra.

### 7.3 Cross-sounding similarity

**Yes.** Three independent RS92-SGP / Aspen `upsonde-1s` columns
with different storm-scale hodographs share a mid-teens-second
local spectral maximum in background-removed U and V that persists
through substantial fractions of each flight. That is the signature
of a **common source/platform/processing** process, not of one
Goshen atmospheric wiggle.

---

## 8. Time period → vertical scale

Diagnostic mapping only: `λz ≈ w_asc × T`. Median ascent rates
from §5.

| Sounding | T (s) | `λz` median (m) | `λz` p10–p90 (m) |
| --- | --- | --- | --- |
| Goshen | 18.5–19.5 | ~106–111 | ~87–142 |
| Prospect | 17.7–19.7 | ~85–95 | ~68–126 |
| Dumas | 17.0–18.3 | ~88–95 | ~67–121 |

Native knot spacing ~5 m, so one 18 s cycle is ~15–20 retained
knots. That is the vertical grain of the hairy polyline. It is
**not** an Analysis `Δz` choice. `54`'s candidate 100 m sits on
the same order of magnitude; this audit neither confirms nor
replaces that candidate.

---

## 9. RS92 / Aspen processing evidence

Separated by epistemic class.

### KNOWN

- These ESC headers: Vaisala RS92-SGP (ccGPS); Aspen 2.8.1.8;
  configuration `upsonde-1s`; EOL Loehrer-class QC flags
  (EOL 114.114 README).
- RS92 transmits 1 s data; GPS winds are derived from the sonde
  GPS (Dirksen et al. 2014, *Atmos. Meas. Tech.*, **7**, 4463–4490).
- Raw RS92 GPS `u,v` are noisy because of pendulum motion plus GPS
  noise. GRUAN processing of RS92 applies a low-pass filter that
  **reduces wind temporal resolution to 40 s** (Dirksen et al. 2014,
  §9). That is GRUAN, **not** this ESC product.
- Aspen applies QC that mostly **removes** points; B-spline
  smoothing with `WindSmoothWL` can **modify** remaining values.
  If `WindSmoothWL = 0`, that smoother is not applied (AspenDocs
  `algo_smooth`, `man_qc`).
- EOL QC flags decreasing altitude as questionable for P/T/RH, not
  as an automatic wind drop. In these files the question does not
  arise: there is no decreasing-altitude tail.
- NCAR GAUS processing descriptions (other campaigns) state that
  raw soundings are run through Aspen, which analyzes, smooths, and
  removes suspect points. That is the processing **class**, not a
  recovered 2010 `upsonde-1s` number.

### LIKELY / PLAUSIBLE

- A radiosonde under a balloon behaves as a pendulum with a moving
  pivot (planar or conical). Period `T ≈ 2π √(L/g)` for the simple
  case (Faber et al. 2023, *Atmos. Meas. Tech.*, **16**, 4183–4193;
  Ingleby et al. 2022, *Atmos. Meas. Tech.*, **15**, 165–183).
- Dirksen et al. 2014 use **~30 m** as an RS92 unwinder length in a
  ventilation estimate → simple T ≈ 11.0 s. That is **not** a
  measured VORTEX2 train length.
- Unfiltered modern Vaisala winds show (i) a **narrow** pendulum
  peak near the string period and (ii) a **broader** balloon
  self-induced peak near ~100 m in supercritical Re (Faber et al.
  2023). Mapping ~100 m through ~5.5 m s⁻¹ gives ~18 s — the same
  order as the 6–20 s local maximum found here.
- Ingleby et al. 2022 / Faber et al. 2023 state that standard
  Vaisala RS92/RS41 processing is **similar** to a ~40 s low-pass
  (and damps vertical scales below ~300 m at 5 m s⁻¹). If that
  filter had been applied to these ESC winds, an 18 s pendulum
  should be strongly damped. Survival of a mid-teens-second local
  maximum in the Aspen `upsonde-1s` product is therefore evidence
  that **this product is not a Vaisala 40 s wind product**, or that
  `WindSmoothWL` was short/zero, or that the remaining peak is a
  different (e.g. balloon-motion / filter-response) process.

### UNKNOWN

- VORTEX2 NSSL/MGAUS string / unwinder / parachute length.
- Aspen 2.8.1.8 `upsonde-1s` `WindSmoothWL` actually used in 2010.
- Whether GAUS ground software applied an additional GPS-wind
  filter before Aspen.
- Whether any of the three flights burst after the last ESC record.
- Relative mix of simple pendulation vs conical pendulation vs
  balloon self-induced motion vs residual GPS noise vs Aspen
  B-spline sidelobes in the 17–19 s peak.
- RS41 55 m / 14.9 s numbers **must not** be copied onto RS92.

---

## 10. Moore control (qualitative)

IGRA OUN 2013-05-20 production golden: 165 knots; median adjacent
`Δz` 174 m; p10 45 m; p90 336 m. Consecutive `|ΔU|` median 0.83 m s⁻¹
on those coarse steps. There is **no** 1 s TIME series.

Moore cannot test 10–20 s periodicity. A smoother hodograph on
Moore is expected from sampling/processing resolution. It is **not**
evidence that Moore “has no pendulation.”

Do not apply ESC flight-phase or RS92-pendulum assumptions to Moore.

---

## 11. What the data can and cannot establish

**Can:**

- These three ESC products are ascent-only through the last native
  record.
- Production goldens are exactly the I1-retained ascent columns.
- Retained sampling is 1 s with a few percent dropped seconds.
- A mid-teens-second local spectral maximum in background-removed
  U and V recurs across three independent RS92-SGP soundings and
  through substantial fractions of each flight.
- That period maps to ~90–110 m vertically at the measured ascent
  rates, which is the grain of the 1-s hodograph hair.

**Cannot:**

- Prove balloon burst / descent occurred or did not occur after
  the last ESC record.
- Identify the 17–19 s peak as specifically sonde pendulation.
- Recover the VORTEX2 string length or Aspen `WindSmoothWL`.
- Separate atmospheric gravity-wave / shear structure from
  platform motion at 25–40 s.
- Authorize an Analysis operator, a production smoother, or `Δz`.
- Claim Moore is pendulum-free.

---

## 12. Required verdicts

**FLIGHT PHASE:** CLEAN ASCENT
(all three: Goshen, Prospect, Dumas)

**HIGH-FREQUENCY PERIODICITY:** REPEATABLE PERIODIC SIGNAL FOUND
(6–20 s local maximum ~17–19 s in U and V; not the largest 4–40 s
bin; persistent across flight and across three soundings)

**PENDULATION:** POSSIBLE BUT UNRESOLVED
(platform-related periodicity is consistent with the evidence;
simple RS92 30 m pendulum at 11 s is not a unique match; balloon
self-induced motion and processing residuals remain live)

**ANALYSIS CONSEQUENCE:** BL-037 must next ask which
source/instrument time scales (here a candidate ~17–19 s →
~90–110 m) are non-atmospheric or unreliable, and what Analysis
operator preserves scientifically meaningful storm-scale structure —
not which arbitrary smoother makes the hodograph pretty.

No production filtering decision.

---

## 13. Backlog consequence

This record is evidence **for** BL-037. It does not close BL-037.
It does not accept, qualify, or replace the `54` 100 m candidate.
It does not authorize BL-010.

It does change the research question away from “pick a smoothing
length” toward “which observed scales are instrument/platform, and
what operator keeps storm-scale structure.”

---

## 14. Reproducibility

```text
node docs/research/sample-esc-flight-phase-and-high-frequency-wind-audit.mjs
```

Requires gitignored native ESC under `data/`. The sampler compares
I1-retained columns to committed goldens and throws if they differ.
It does not import production physics modules and does not write
into `src/`.
