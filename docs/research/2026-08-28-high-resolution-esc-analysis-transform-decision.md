# High-resolution ESC Analysis Transform Decision — 2026-08-28

**Status:** RESEARCH DECISION / NOT PRODUCTION AUTHORIZATION
**Verdict:** **SELECTED**
**Not:** production implementation, runtime wiring, hodograph UI,
diagnostic rewiring, Source mutation, BL-010 implementation,
Architecture 58 reopen
**Implementation authorization:** **NO**
A later architecture / authorization gate is required before
any production transform code.

Sampler:

```text
docs/research/sample-high-resolution-esc-analysis-transform-decision.mjs
docs/research/artifacts/high-resolution-esc-analysis-transform-decision-summary.json
docs/research/artifacts/esc-analysis-time-domain-transfer.svg
docs/research/artifacts/esc-analysis-height-domain-transfer.svg
docs/research/artifacts/esc-analysis-goshen-sr-hodograph-0-6km.svg
docs/research/artifacts/esc-analysis-goshen-launch-0-500m.svg
```

Contract (unchanged):

```text
docs/architecture/58-source-class-aware-analysis-profile-contract.md
```

Predecessor evidence (reused, not re-argued):

```text
docs/research/2026-08-28-esc-flight-phase-and-high-frequency-wind-audit.md
docs/research/2026-08-28-esc-wind-processing-pipeline-audit.md
docs/research/2026-08-28-leise-filter-and-analysis-operator-comparison.md
```

---

## 1. Decision question

```text
Can we now select a scientifically defensible production
Analysis transform policy for high-resolution-mobile-esc
Source profiles?
```

**Answer: SELECTED.**

The selected production-candidate is a **time-domain**
Hamming-windowed sinc low-pass with cutoff wavelength **40 s**,
applied on a uniform 1 s grid after documented QC-gap interpolation,
with filtered winds remapped onto original Source heights.

This file names that candidate. It does **not** authorize
implementation. Architecture 58 remains:

```text
ARCHITECTURE ACCEPTED
ANALYSIS CONTRACT DEFINED
PRODUCTION TRANSFORM SELECTION NOT YET AUTHORIZED
IMPLEMENTATION BLOCKED
```

---

## 2. What this slice does not reopen

Architecture 58 stands. In particular:

```text
Source remains unchanged
Analysis = derived sibling
universal numerical operator rejected
no-fake-resolution rule frozen
Moore / coarse-operational-raob is not an ESC transform target
transform domain must be declared
interpolation ≠ new observational resolution
production filter was not selected by 58 itself
```

Object of this decision: **high-resolution-mobile-esc** only.

Cases: Goshen, Prospect Valley, Dumas.
Moore is a negative compatibility check only.

---

## 3. Domain decision: time vs height vs index

### What physical quantity is declared unreliable?

The repeatable source-class structure identified by prior research
is a **temporal** local maximum at **~17–19 s** in U and V, present
on all three CLEAN ASCENT ESC columns. Its vertical equivalent is
**not** a common Analysis target:

| Case | median ascent | 17 / 18 / 19 s → m |
| --- | ---: | --- |
| Prospect | 4.8 m s⁻¹ | 81.6 / 86.4 / 91.2 |
| Dumas | 5.2 | 88.4 / 93.6 / 98.8 |
| Goshen | 5.7 | 96.9 / 102.6 / 108.3 |

Suspected contamination family (still not uniquely identified):

```text
sonde / platform motion
GPS-derived wind
GAUS / Aspen processing cadence (time is Aspen's independent variable)
```

**PENDULATION remains POSSIBLE BUT UNRESOLVED.**
**PROCESSING MAY SHAPE THE SIGNAL BUT DOES NOT EXPLAIN ITS ORIGIN.**
Those facts are preserved. Unique identification is **not** required
to declare a reliability policy for derivative diagnostics. Native
~5 m segments are already unsuitable as environmental `ω_h`
(Architecture 53 / 58). The 17–19 s band is the **repeatable extra**
structure a sampling-class transform can target.

### H1 — time-domain reliability policy

The transform declares: wind fluctuations faster than a stated
temporal reliability scale are not treated as independent
atmospheric samples for derivative-sensitive diagnostics.

Induced vertical scale then **varies with ascent rate**. That
variation is a consequence of the measurement process, not a
defect, if H1 is the contract.

### H2 — height-domain analysis-scale policy

The transform declares: wind structure shorter than X metres is
not trusted for `dV/dz`. That is the honest statement **only if**
X is a vertical reliability scale that can be evidenced
independently of the 17–19 s mapping. Architecture 58 already
forbids treating ~90–110 m as an Analysis target merely because
it is the typical `w × 18 s` equivalent.

### Source-index domain

T5FLTR natively runs on uniform sample index. That is **not**
accepted as the production domain merely because the FORTRAN does.

On ESC, index ≈ time only if every retained step is 1 s. It is
not:

| Case | exact 1 s share | interpolated uniform-1s fraction |
| --- | ---: | ---: |
| Goshen | 97.83% | 2.50% |
| Prospect | 97.47% | 3.22% |
| Dumas | 97.46% | 3.47% |

Native-index vs uniform-1 s T5FLTR-5 is **not equivalent** at the
launch on Prospect and Dumas (0–1 SRH 102 vs 107 and 194 vs 209).
Index-domain filtering therefore lacks a stable physical mapping
for this sampling class once QC gaps exist.

### Domain verdict

```text
H1 / TIME DOMAIN is the scientifically more defensible
production framing for high-resolution-mobile-esc.

H2 / HEIGHT DOMAIN is underdetermined as a production default:
no stable metre cutoff treats the 17–19 s band equivalently
across the three ascent rates.

SOURCE-INDEX is rejected as the declared domain.
It is an implementation convenience unless TIME is reconstructed.
```

A time-domain operator that later feeds height-keyed diagnostics
must still declare the **induced** vertical scale per sounding
(`λz ≈ w_ascent × T`). That declaration is required by Architecture 58
§8. It is not a second, independent cutoff.

---

## 4. Dataset and methods

I1-retained production-normalized Source goldens. Source is not
modified.

```text
Goshen     nssl1Goshen2155.normalized.json           n=2029  h0=2.4 m
Prospect   nssl1ProspectValley222346.normalized.json    n=2733  h0=−0.1 m
Dumas      nssl2Dumas215218.normalized.json             n=2917  h0=−0.5 m
Moore      ounMoore20130520.normalized.json            n=165   compatibility only
```

Negative / slightly-above-zero first heights on Prospect and Dumas
are **kept**. Y=0 is not invented. The first point is not dropped.

Storm motion for **all** SRH numbers in this file:

```text
C = (10.5, −1.3) m s⁻¹
```

This is a **fixed research comparison C** (published Goshen Fig. 2b).
It is **not** observed storm motion for Prospect or Dumas.
Published 88 / 167 / 29 remain **external**. No candidate was
tuned to them.

Native ESC files are read **only** to reconstruct I1-retained
TIME for C1-uniform-1s and C3. They are gitignored. Committed
goldens alone suffice for C0, C1-native-index, C2, and the
100 m baseline.

SRH is Form B on `[h_min, h1]` with `h_min` = first retained Source
height. Horizontal vorticity magnitude is the adjacent-knot
vector gradient `|dV/dz|`.

---

## 5. Candidate families

No zoo. Four families plus the Architecture 54 baseline as control.

| ID | Family | Domain | Operator |
| --- | --- | --- | --- |
| C0 | Source / no transform | none | control |
| C1a | T5FLTR NSTEP=5 | source index of retained samples | reconstructed Leise |
| C1b | T5FLTR NSTEP=5 | uniform 1 s time, mapped back | physically mapped Leise |
| C2 | Hamming-sinc FIR | height, 5 m internal grid | λ_c ∈ {75, 100, 125, 150, 200} m |
| C3 | Hamming-sinc FIR | time, uniform 1 s | λ_c ∈ {25, 32, 40, 50} s |
| baseline | 100 m AGL bin-mean | height bins | Architecture 54; not a selection candidate |

**C2 resampling.** Piecewise-linear onto 5 m AGL from Source `hMin`.
The 5 m grid is mathematical convenience, **not** observational
resolution. Filtered winds are remapped onto original Source
heights so the Analysis column does not emit a denser knot list
than Source.

**C3 / C1b gap policy.** Linear interpolate U, V, and height onto
missing integer seconds between first and last retained TIME;
filter; map winds back to retained times/heights. Interpolation
fraction is quantified above. It does not create observational
resolution.

FIR design rule (declared, not optimized):

```text
odd Hamming-windowed sinc
fc = 1 / λ_c          (cycles per sample)
taps = 2 λ_c + 1
unity DC gain
half-sample mirror convolution
zero phase after centering
```

This is the previous Leise-research 41-tap / 100 m FIR generalized.
Scale is the only intended variable.

---

## 6. Transfer / attenuation

### Time-domain |H| on a 1 s grid

| Operator | \|H\|(18) | \|H\|(32) | \|H\|(64) | \|H\|(80) | \|H\|(180) |
| --- | ---: | ---: | ---: | ---: | ---: |
| T5FLTR-5 | 0.0023 | 0 | 0.716 | ~0.88* | 0.993 |
| FIR 25 s | 0.140 | 0.722 | 0.960 | 0.978 | 0.997 |
| FIR 32 s | 0.006 | 0.497 | 0.919 | 0.957 | 0.995 |
| FIR 40 s | 0.001 | 0.246 | 0.848 | 0.919 | 0.991 |
| FIR 50 s | 0.0002 | 0.053 | 0.722 | 0.848 | 0.984 |

\*Leise 80-sample gain is the empirical 80–200 s band ratio
(~0.87–0.90), not a single-bin analytic value.

T5FLTR-5 has a hard 32-sample zero and **more passband distortion**
at 64 s (28% attenuation) than FIR-32 or FIR-40.

FIR 25 s does **not** put 18 s in the stopband (`|H|(18)=0.14`).

### Height-domain |H| on a 5 m grid

| λ_c | \|H\|(90 m) | \|H\|(110 m) | \|H\|(400 m) | \|H\|(1000 m) |
| --- | ---: | ---: | ---: | ---: |
| 75 m | 0.67 | 0.81 | 0.994 | 0.999 |
| 100 m | 0.38 | 0.59 | 0.988 | 0.998 |
| 125 m | 0.14 | 0.35 | 0.978 | 0.997 |
| 150 m | 0.024 | 0.16 | 0.964 | 0.996 |
| 200 m | 0.001 | 0.002 | 0.919 | 0.993 |

A 100 m height cutoff leaves most of the 90–110 m band in the
transition. That is why C2-100 m cannot be sold as “removing the
18 s line.”

### Cross-case mapping (the domain test)

The same **temporal** 18 s structure under a **height** operator
is a different frequency on each sounding. Empirical residual
power 16–20 s / raw, U:

| Operator | Goshen | Prospect | Dumas |
| --- | ---: | ---: | ---: |
| C1 T5FLTR native index | 5.8e-5 | 6.8e-5 | 1.3e-4 |
| C1 T5FLTR uniform 1 s | 0.0015 | 0.0072 | 0.017 |
| C2 FIR 100 m | **0.43** | **0.40** | **0.57** |
| C2 FIR 150 m | 0.16 | 0.12 | **0.28** |
| C2 FIR 200 m | 0.070 | 0.044 | 0.13 |
| C3 FIR 25 s | 0.032 | 0.065 | **0.23** |
| C3 FIR 32 s | 0.004 | 0.015 | 0.088 |
| C3 FIR 40 s | 0.002 | 0.007 | 0.034 |
| C3 FIR 50 s | 0.002 | 0.006 | 0.016 |

Height-domain never applies the same temporal attenuation to all
three cases. Time-domain 40 s does.

Storm-scale time band 80–200 s (roughly 0.4–1 km) remaining
fraction, U:

| Operator | Goshen | Prospect | Dumas |
| --- | ---: | ---: | ---: |
| C3 FIR 32 s | 0.954 | 0.965 | 0.961 |
| C3 FIR 40 s | 0.918 | 0.938 | 0.932 |
| C3 FIR 50 s | 0.852 | 0.889 | 0.882 |
| C2 FIR 100 m | 0.983 | 0.983 | 0.990 |
| C2 FIR 200 m | 0.921 | 0.921 | 0.941 |
| C1 T5FLTR-5 1 s | 0.884 | 0.918 | 0.911 |

C3 50 s begins to eat the 80 s wing (`|H|(80)=0.85`). C3 40 s
keeps it ≥ 0.92.

---

## 7. Metrics

### A. Bulk shear: do not let launch rewrite impersonate storm-scale change

0–6 km `|ΔV|` uses `V(h_min)`. Every low-pass **rewrites the first
knot** via mirror support, so 0–6 km bulk **moves** even when the
6 km wind does not. Prospect Source 0–6 km is 15.6 m s⁻¹ vs
~17–18 after filtering; that is launch-endpoint mixing, not
destruction of the 6 km wind.

Launch-independent bulk is stable:

| | Goshen 1–6 | Prospect 1–6 | Dumas 1–6 | Goshen 0.5–6 | Prospect 0.5–6 | Dumas 0.5–6 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| C0 Source | 27.90 | 20.00 | 20.62 | 30.66 | 21.72 | 25.09 |
| C1 T5FLTR 1 s | 28.38 | 20.11 | 20.57 | 31.02 | 22.26 | 24.66 |
| C2 FIR 150 m | 28.03 | 19.97 | 20.59 | 30.78 | 21.97 | 24.96 |
| C3 FIR 40 s | 28.14 | 20.05 | 20.64 | 30.88 | 22.09 | 24.82 |

Relative change of **1–6 km** bulk vs Source is **< 2%** for every
serious candidate. Storm-scale shear is preserved. Criterion
“materially changes 0–6 km shear for no scientific reason” is
applied to this launch-independent bulk, not to the
first-knot-contaminated 0–6 number.

### B / C. SRH 0–1 and 0–3 (research C; not a tuning target)

| Operator | Goshen 0–1 / 0–3 | Prospect 0–1 / 0–3 | Dumas 0–1 / 0–3 |
| --- | --- | --- | --- |
| C0 Source | 132.7 / 197.9 | 130.8 / 361.8 | 246.8 / 374.0 |
| C1 T5FLTR native | 85.9 / 153.8 | 102.1 / 315.3 | 193.6 / 317.4 |
| C1 T5FLTR 1 s | 85.9 / 153.8 | 107.4 / 322.1 | 209.1 / 333.0 |
| C2 FIR 100 m | 90.1 / 156.9 | 103.5 / 327.3 | 201.3 / 327.0 |
| C2 FIR 150 m | 82.4 / 150.0 | 100.9 / 319.5 | 190.6 / 315.7 |
| C3 FIR 32 s | 79.1 / 147.0 | 102.9 / 320.2 | 200.4 / 325.4 |
| C3 FIR 40 s | 72.8 / 140.6 | 99.7 / 315.4 | 192.6 / 317.2 |
| bin-mean 100 m | 60.0 / 128.5 | 87.0 / 299.7 | 173.1 / 296.9 |
| Fig. 2b external | **88 / 167** | — | — |

0–1 SRH **falls** under every low-pass because the launch
transient is mixed into the first kernel radius. That is
expected. It was **not** used to choose 40 s. Goshen C3-40
(72.8) is **not** closer to 88 than C2-100 (90.1) or Leise
(85.9). If 88 had been the oracle, this candidate would have
lost.

### D / E. Derivative stability (`|ω_h| = |dV/dz|`)

Median `|ω_h|`:

| | Goshen | Prospect | Dumas |
| --- | ---: | ---: | ---: |
| C0 | 0.0192 | 0.0233 | 0.0208 |
| C1 T5FLTR 1 s | 0.0086 | 0.0113 | 0.0125 |
| C2 FIR 100 m | 0.0130 | 0.0175 | 0.0165 |
| C3 FIR 40 s | 0.0101 | 0.0128 | 0.0138 |

p90 `|ω_h|` follows the same pattern. Native-segment vorticity
stops being dominated by sample-to-sample spikes. C2-100 m
reduces less, consistent with its weaker 18 s attenuation.

### F. Hodograph excess path 0–6 km (arc − chord)

| | Goshen | Prospect | Dumas |
| --- | ---: | ---: | ---: |
| C0 | 91.0 | 129.2 | 96.5 |
| C1 T5FLTR 1 s | 28.2 | 51.4 | 47.0 |
| C3 FIR 40 s | 37.7 | 62.5 | 52.3 |
| C2 FIR 150 m | 57.2 | 76.3 | 60.3 |
| C2 FIR 100 m | 69.2 | 95.0 | 70.6 |

Hair is reduced. Large-scale turning remains (excess path is not
driven to ~0).

### G. 17–19 s residual power

See §6 table. C3 40 s is the shortest FIR in the bounded set
that reduces U 16–20 s power to **≤ 3.4%** of Source on all three
cases.

---

## 8. Boundary / launch

All low-pass candidates **rewrite the first knot**. That is
operator support plus half-sample mirror, not ad-hoc QC.

Goshen first knot `(u, v)`:

```text
C0 Source          (−1.20,  0.20)
C1 T5FLTR          (−2.17,  4.36)
C2 FIR 100 m       (−1.72,  4.02)
C3 FIR 40 s        (−2.51,  5.67)
bin-mean 100 m     (−3.08,  6.82)
```

The launch spike is mixed into the first ~kernel-radius samples.
First-200 m excess path **falls** (hair removed); a new loop is
not introduced. Prospect `h0 = −0.1 m` and Dumas `h0 = −0.5 m`
stay in the column.

A candidate that needed “drop t=0 / first point / force Y=0”
to look acceptable would have been rejected. None of the
serious candidates required that. Launch sensitivity of 0–1
SRH is a **documented limitation** of any local low-pass on
these products, not a reason to special-case Goshen.

---

## 9. Selection rule (not SRH, not prettiness)

Among the bounded time-domain FIR set `{25, 32, 40, 50} s`,
select the **shortest** cutoff that satisfies all of:

```text
(a) analytic |H|(18 s) < 0.01
(b) empirical U 16–20 s residual power ratio < 0.05
    on Goshen, Prospect, and Dumas
(c) analytic |H|(80 s) > 0.90
(d) 1–6 km bulk-shear relative change < 3% on all three
```

| Cutoff | (a) | (b) | (c) | (d) |
| --- | --- | --- | --- | --- |
| 25 s | fail (`|H|(18)=0.14`) | fail Dumas 0.23 | pass | pass |
| 32 s | pass | fail Dumas 0.088 | pass | pass |
| **40 s** | **pass** | **pass (max 0.034)** | **pass (`|H|(80)=0.919`)** | **pass** |
| 50 s | pass | pass | fail (`|H|(80)=0.848`) | pass |

40 s is therefore the unique member of the declared set.
The thresholds were fixed from the identified 17–19 s band and
from storm-scale preservation, **before** looking at 88 / 167.
They were not moved to recover a published SRH.

---

## 10. Rejection table

| Candidate | Verdict | Exact reason |
| --- | --- | --- |
| C0 Source | reject as Analysis | Native ~5 m segments remain unsuitable for derivative-sensitive `ω_h` / `T_tilt`. Excess path and median `\|ω_h\|` stay sample-noise dominated. Bulk 1–6 km on Source can remain valid; that is not this transform. |
| C1a T5FLTR native index | reject | Domain is source index. QC gaps make index ≠ time. Prospect/Dumas native vs uniform-1s 0–1 SRH differ by 5–15 m² s⁻². Index is not a defensible physical domain. |
| C1b T5FLTR uniform 1 s | reject as **our** production transform | Historically informative; strong 18 s stopband. NSTEP=5 is CEDRIC / Markowski, not derived from this evidence. `\|H\|(64 s)=0.72` is worse passband behaviour than FIR-40. Inheritance is not scientific justification. Retained as **reference**. |
| C2 FIR 75 m | reject | Does not substantially attenuate 90–110 m (`\|H\|≈0.67–0.81`) nor 16–20 s (residual 0.63–0.75). |
| C2 FIR 100 m | reject | Same class: 16–20 s residual 0.40–0.57. 100 m is the Architecture 54 **baseline**, not a selected reliability scale. Architecture 58 already forbade treating 100 m as the 18 s equivalent. |
| C2 FIR 125 / 150 / 200 m | reject as production default | No stable height interval: 18 s residual still case-dependent; 0–1 SRH and launch rewrite move monotonically with cutoff; a metre cutoff cannot apply one temporal policy across three ascent rates. H2 underdetermined. |
| C3 FIR 25 s | reject | 18 s still in the transition. Dumas 16–20 s residual 0.23. |
| C3 FIR 32 s | reject | Analytic stopband is acceptable; Dumas empirical 16–20 s residual 0.088 fails the cross-case residual rule. |
| C3 FIR 50 s | reject | Stronger than needed. `\|H\|(80 s)=0.85`; more 0–1 destruction than the bounded rule requires. |
| 100 m bin-mean | control only | Occupancy mean, not a linear filter. Strongest first-knot rewrite. Architecture 54 construction; not selected. |

---

## 11. Leise verdict

```text
T5FLTR-5 is a historical / scientific REFERENCE.
It is NOT selected as Explorer's production transform.
```

Advantages (real):

- connection to the published Goshen analysis family;
- strongest 17–19 s suppression on a 1 s series;
- well-characterized zero-phase response.

Disadvantages (decisive for production):

- Fig. 2b input grid remains unknown;
- native-index semantics are not a physical domain once gaps exist;
- NSTEP=5 stopband (32 samples) is a dyadic CEDRIC parameter, not
  an Explorer reliability argument;
- passband distortion at 64 s is larger than a transparent FIR
  with a 40 s cutoff;
- authenticity of recovered FORTRAN is not a production warrant
  (Architecture 58 §16 already: Leise is not a production
  specification).

C1b (uniform 1 s T5FLTR) is the physically mapped variant of that
reference. It is still not selected.

---

## 12. Height-domain verdict

```text
H2 is NOT selected.
No stable vertical reliability interval exists across
Goshen / Prospect / Dumas under current evidence.
```

75–100 m do not kill the known source-class band. 150–200 m
kill more of it, but remaining 16–20 s power is still
ascent-rate dependent, and 0–1 diagnostics remain hypersensitive
to the exact metre number. Using 100 m because “it looks like
the 90–110 m equivalent” would violate Architecture 58’s
separation of source-process scale from Analysis scale.

---

## 13. Time-domain verdict

```text
H1 is accepted as the production framing.
C3 FIR 40 s is selected from the bounded set by the
declared rule in §9.
```

A defensible temporal reliability policy:

```text
For high-resolution-mobile-esc, fluctuations at and faster
than the repeatable ~17–19 s measurement-system band are not
treated as independent atmospheric samples for derivative-
sensitive diagnostics.

The cutoff is a low-pass transition, not a notch at 18 s.
```

Induced vertical attenuation at median ascent, cutoff 40 s:

| Case | median `λz` | p10–p90 `λz` |
| --- | ---: | --- |
| Prospect | 192 m | 152–256 m |
| Dumas | 208 m | 158–264 m |
| Goshen | 228 m | 188–292 m |

That spread is **scientifically acceptable under H1**. The
unreliable process is temporal. The atmosphere is sampled at
different vertical rates. A single metre cutoff would pretend
otherwise.

---

## 14. Cross-sounding robustness

One specification, no per-case branching, no case-name keys.

C3 40 s:

- 16–20 s power down to 0.2–3.4% of Source on all three;
- 80–200 s power retained 92–94%;
- 1–6 km bulk change < 2%;
- median `|ω_h|` roughly halved;
- first negative heights retained;
- gap interpolation 2.5–3.5% of uniform seconds.

Prospect and Dumas are not Goshen clones. Large-scale hodograph
shape remains case-specific. The **policy** is shared.

---

## 15. Moore compatibility

```text
ESC policy applicability: NON-APPLICABLE
```

| Test | Result |
| --- | --- |
| Native-index T5FLTR-5 | Feasible (`n=165≥80`) but stopband ≈ 32 × 174 m ≈ **5.6 km**. Not the ESC 40 s policy. |
| Height-domain ESC FIR on 5 m | Fake precision. Forbidden by Architecture 58. |
| Time-domain FIR 40 s | No 1 s retained TIME on IGRA Source. |

Moore-class Source remains the highest scientifically defensible
representation for this coarse class until a **different** coarse
Analysis purpose is justified. Applying the selected ESC operator
to Moore would be a contract violation, not a compatible default.

---

## 16. Production-candidate specification

This is a research specification for a later authorization gate.
It is **not** implemented.

```text
transform name:        esc-hr-time-hamming-sinc-lowpass
transform version:     0.1-research
compatible class:      high-resolution-mobile-esc
                       (Goshen / Prospect / Dumas as validation cases;
                        case names are not algorithm keys)

input domain:          TIME of I1-retained ESC samples (seconds)
resampling policy:     interpolate U, V, height onto every missing
                       integer second in [t_first, t_last]
interpolation policy:  linear; internal to the transform;
                       not observational resolution
gap policy:            QC-dropped seconds (observed 2–5 s gaps)
                       are the interpolated samples;
                       fraction 2.5–3.5% of the uniform 1 s series
                       on the three validation columns
output grid:           original Source heights (and retained times);
                       no denser knot list than Source
operator family:       zero-phase Hamming-windowed sinc FIR
parameters:
  Δt = 1 s
  cutoff wavelength λ_c = 40 s
  fc = 1/40 cycles per sample
  taps = 81  (= 2 λ_c + 1)
  unity DC gain
boundary:              half-sample mirror
phase:                 linear; zero after centering
U and V:               filtered independently

declared effective scale:
  temporal reliability / attenuation: λ_c = 40 s
    |H|(18 s) ≈ 0.001
    |H|(40 s) ≈ 0.5
    |H|(80 s) ≈ 0.92
    |H|(180 s) ≈ 0.99
  induced vertical scale: λz ≈ w_ascent × 40 s
    (median ~192 / 208 / 228 m on Prospect / Dumas / Goshen)
    this variation is part of the contract, not a bug

scientific purpose:
  attenuate source / instrument / processing-scale temporal
  structure at and below the repeatable ~17–19 s
  high-resolution-mobile-esc band, so derivative-sensitive
  diagnostics are not dominated by sample-to-sample or
  measurement-cadence structure, while preserving storm-scale
  wind (≳80 s; 1–6 km bulk shear).

limitations:
  - 0–1 km SRH remains launch-transient sensitive
  - first knot is rewritten by mirror support
  - 17–19 s is not uniquely proven to be pendulation
  - historical Aspen WindSmoothWL remains unknown;
    this operator may follow an already-processed product
  - production Source goldens currently omit TIME;
    an authorization gate must name the timing carrier
    (sibling metadata or Source schema extension).
    This research used native ESC TIME. It does not alter
    the Source wind golden.
  - not applicable to coarse-operational-raob

validation cases:      Goshen, Prospect Valley, Dumas
Source preservation:    Source record identity unchanged;
                       Analysis is a derived sibling
Moore non-applicability: explicit; see §15
```

---

## 17. Architecture 58 implications

58 is not rewritten. Consequences for a **later** gate:

```text
1. High-resolution ESC Analysis transform is now named as a
   research-selected candidate (this file). 58 still does not
   authorize implementation.

2. Domain for this class: TIME, not height, not source index.

3. Induced vertical scale must be declared per sounding from
   actual ascent. Do not freeze a single metre number.

4. Source visualization / Source golden stay as published
   normalized products.

5. Timing carrier for Analysis input is an architecture
   question. This slice does not change Source schema.

6. Moore remains outside this operator.

7. Diagnostics that later consume Analysis must name the
   operand. This file does not rewire them.
```

Recommended successor (not written here): an architecture /
authorization gate that either accepts this specification as
production policy or rejects it with a scientific reason.
That gate is the only path to BL-010.

---

## 18. BL-046 disposition

```text
BL-046 research decision: COMPLETE
selected candidate:     esc-hr-time-hamming-sinc-lowpass v0.1-research
implementation:         STILL BLOCKED
authorization:         future architecture gate, not this report
```

---

## 19. Unresolved evidence (does not block this selection)

These remain true and are **limitations**, not hidden oracles:

```text
Fig. 2b exact input grid
historical Aspen WindSmoothWL / GAUS card cutoff
unique physical identity of the 17–19 s line
same-flight minimally processed GPS versus published ESC
```

They would refine the cutoff or the contamination model. They
are not required to declare that native 1 s ESC structure below
~40 s is not a reliable independent atmospheric sample for
`dV/dz` on this sampling class. C0 already fails that purpose.

Would those sources still be worth retrieving? **Yes, as
refinement**, not as a blocker for this decision. A bounded
follow-up, if later wanted: recover historical `upsonde-1s`
`WindSmoothWL` / GAUS pendulum-filter documentation for the
VORTEX2 GAUS/MGAUS family. That is one documentary task, not an
open-ended filter zoo.

---

## 20. Anti-claims

```text
This file does not implement Analysis.
This file does not mutate Source goldens.
This file does not authorize BL-010.
This file does not reopen Architecture 58.
This file does not select a universal operator.
This file does not apply the ESC operator to Moore.
This file does not treat 72.8 / 88 as recovered Markowski output.
This file does not claim the 17–19 s line is proven pendulation.
This file does not claim 40 s is the true atmospheric resolution.
Native-index T5FLTR is not the selected production transform.
100 m bin-mean is not the selected production transform.
A prettier hodograph is not the warrant.
```

---

## 21. Reproducibility

```text
node docs/research/sample-high-resolution-esc-analysis-transform-decision.mjs
```

Deterministic. Native restricted EOL `.cls` bytes are **not**
committed. C3 / C1b require those local files. C0 / C1a / C2 /
baseline reproduce from committed goldens alone.
