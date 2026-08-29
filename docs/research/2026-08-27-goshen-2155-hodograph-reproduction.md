# Goshen 2155 Hodograph Reproduction — 2026-08-27

**Status:** SCIENTIFIC VALIDATION / RESEARCH EVIDENCE
**Not:** physics SoT, production physics change, Goshen
sandbox retarget, smoothing of the imported column
**Object:** committed NSSL1 2155 UTC golden
(2029 knots) versus Markowski et al. (2012) Part I
Fig. 2
**Production `V_env` / DEMO `C` / storm operands:**
UNCHANGED
**Implementation:** not included in this file

Architecture consequence:

```text
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
```

Sampler (research-only, not a production API):

```text
docs/research/sample-goshen-2155-hodograph-reproduction.ts
docs/research/artifacts/goshen-2155-hodograph-reproduction-summary.json
docs/research/artifacts/goshen-2155-ground-relative-raw.svg
docs/research/artifacts/goshen-2155-storm-relative-raw.svg
docs/research/artifacts/goshen-2155-storm-relative-raw-vs-leise5.svg
docs/research/artifacts/goshen-2155-storm-relative-0-6km-raw-vs-leise5.svg
```

This file records a headless comparison of the imported
column with the published figure. It does not retune
the golden, does not change Explore `C=(10,0)`, and
does not treat a Goshen sandbox trajectory as observed
parcel motion.

---

## 1. Sounding identity

**Evidence, not inference.**

| Claim | Evidence |
| --- | --- |
| Published Fig. 2 uses the 2155 UTC NSSL1 sounding | Markowski et al. (2012) Part I, Fig. 2 caption: “2155 UTC NSSL1 sounding launched southeast of the Goshen County storm”; location also marked on Figs. 1 and 4 |
| Our native ESC target is that launch | Header `Bushnell/NSSL1`, `UTC Release Time` `2009, 06, 05, 21:55:22`; EOL 114.114 / DOI `10.5065/D6CC0Z0Q` (`49` §7) |
| Same launch in later EnKF work | Marquis / Dawson-class papers use NSSL1 2155 UTC as the homogeneous wind base state, ~50 km SSE of the updraft. They modified boundary-layer *T/q*; winds remain the observed sounding |

Paper time “2155 UTC” is the rounded release time.
The ESC second is 21:55:22. That is the same sounding,
not a different launch. The later Bushnell/NSSL1
22:40:06 block is a different sounding and is not
Fig. 2.

Identity: **confirmed.**

---

## 2. Published hodograph convention

From Fig. 2 caption and the plotted panel, not from
Explorer defaults.

```text
panel (a)  skew-T; wind barbs are GROUND-relative
           half barb = 2.5 m/s; full barb = 5 m/s;
           flag = 25 m/s
panel (b)  STORM-RELATIVE hodograph
           V_sr(z) = V(z) − C
           eastward right, northward up
           origin = storm motion C
           height numerals = km AGL
           black = smoothed; gray = unsmoothed
           ω_h direction at 0.5, 1, 2 km AGL
           environment assumed to have no mean w
           0–1 km SRH, 0–3 km SRH, 0–6 km shear
           magnitude are for the SMOOTH (black) curve
panel (c)  θ_e vs height AGL (thermodynamic; unused here)
```

Explorer’s base hodograph remains ground-relative
(`10`). The Fig. 2b comparison in this file is a
research rewrite `V_sr = V − C_published`. It is not
a live overlay and not a sandbox `C` change.

---

## 3. Published storm motion

```text
C = (10.5, −1.3) m/s
    eastward  10.5
    northward −1.3
```

Source: Fig. 2b caption, explicit.

This is the **observed** cell motion used to draw
Fig. 2b. Explorer Goshen sandbox `C` remains prescribed
DEMO `(10, 0)` m/s (`50` §6). The two values are not
interchangeable.

---

## 4. Our raw ground-relative profile versus the source

Locked conversion (`49` §8.4), unmodified:

```text
height    = round(ESC Alt − 1557.9, 1)   world Y, m AGL
eastward  = ESC U                         m/s
northward = ESC V                         m/s
vertical  = 0
levels    = 2029 kept GOOD U/V
minHeight = 2.4 m
maxHeight = 12261.8 m
```

Sign / orientation check against Fig. 2b (not against
climatology):

| If we had… | Fig. 2b would look… | What we see |
| --- | --- | --- |
| flipped `U` | surface `V_sr` to the **right** of origin | surface `V_sr` = (−11.7, 1.5), **left** of origin |
| flipped `V` | 0 → 0.5 km going **down** | 0.5 km `V_sr` = (−13.5, 9.4), **up and left** |
| m/s treated as knots | speeds ~2× too large vs 10/20/30 rings | 0–6 km `|ΔV|` = 30.06 m/s vs published 29 |
| height as MSL | 12 km label near tropopause would not fit | 12 km knot exists; sounding continues to 12.26 km |

Units, U/V orientation, and AGL datum are consistent
with Fig. 2.

Characteristic raw ground-relative knots:

| Height AGL | eastward | northward |
| --- | --- | --- |
| 2.4 m (first) | −1.2 | 0.2 |
| 6.1 m (second) | −1.4 | 4.1 |
| ~0.5 km | −3.0 | 8.1 |
| ~1 km | −0.2 | 10.1 |
| ~3 km | 8.8 | 6.3 |
| ~6 km | 27.7 | 8.6 |
| ~12 km | 36.5 | 0.7 |
| 12261.8 m (last) | 26.8 | 5.7 |

The 3.9 m/s northward jump from 2.4 m to 6.1 m is the
launch transient already named in `49` §7.1. It is a
GOOD ESC wind pair. It is not environmental shear over
3.7 m.

---

## 5. Storm-relative reproduction versus Fig. 2b

Research-only `C = (10.5, −1.3)`.

Large-scale shape of our 2029-knot storm-relative
polyline agrees with Fig. 2b:

```text
0 km     left of origin, weak northward V_sr
0.5 km   farther left and up
1–2 km   clockwise turn, still left of origin
3–4 km   kink / small loop (survives in the published black curve)
4–7 km   long eastward reach
8–12 km  large clockwise upper loop; wind backs after ~10 km
```

The published **black** curve is visibly smoother than
our 2029-knot curve. The published **gray** curve is
hairy in the same way as our raw polyline. Fine
pendulum / 0.1 m/s quantization wiggle is present in
gray and absent in black.

Storm-relevant features that survive on the published
black curve:

- 0–1 km clockwise curvature
- 3–4 km kink
- 4–6 km acceleration to the east
- upper-level loop above ~7 km

Features that do **not** survive there:

- 1-s hairiness
- the isolated 3.7 m launch-transient spike at the
  first knot (black “0 km” sits with the
  post-transient cluster, not with `v_sr = 1.5`)

Visual smoothness is **not** taken as proof of a
filter. The caption names the filter (section 6).

---

## 6. Preprocessing — documented explicitly (A)

| Step | What is documented | Source |
| --- | --- | --- |
| Fig. 2b black vs gray | “The black (gray) hodograph is smoothed (unsmoothed); the smoothing was accomplished with a 5-step Leise filter.” | Fig. 2b caption |
| Printed 0–1 / 0–3 SRH and 0–6 shear | “indicated for the **smooth** hodograph” | Fig. 2b caption |
| Storm-relative rewrite | subtract `C = (10.5, −1.3)` from the ground-relative wind profile | Fig. 2b caption |
| Height | km AGL | Fig. 2b caption |
| `ω_h` | direction at 0.5, 1, 2 km AGL; env `w = 0` | Fig. 2b caption |
| ESC product | `upsonde-1s` Aspen processing in the sounding header | native ESC header; `49` §7.1 |
| EOL QC | Loehrer-class gross-limit and rate-of-change flags; missing/BAD dropped | EOL 114.114 README class; Loehrer et al. 1996, 1998 |
| Aspen general policy | most QC **removes** points; **final B-spline smoothing** and dynamic adjustments are the steps that **modify** remaining values | AspenDocs (`man_intro`, `algo_smooth`) |
| Parker (2014) extra QC | subjective skew-T / trajectory review of VORTEX2 soundings used in **his composite**, plus Barnes interpolation of 1-s data onto a 3D grid | Parker (2014). That is a different product from Fig. 2b |

Leise (1982) is in the Part I bibliography. CEDRIC-class
documentation of that filter: *N*-step Leise is a
scale-telescoped two-way 1-2-1; first response zero at
wavelength `2^N Δ`. For *N* = 5 that is `32 Δ`.

---

## 7. Preprocessing — unknown (C) versus inferable (B)

**Unknown (C). Do not invent a production length.**

```text
Leise input grid          time (1 s) vs height, and Δ
Leise endpoint / data-extension treatment
whether t = 0 was dropped before the plot
Aspen WindSmoothWL used when this ESC file was made
                          (2010-era upsonde-1s config)
whether winds were interpolated to regular height or
                          pressure before Leise
exact SRH code path (NSHARP vs line-integral Form B)
```

**Strongly inferable (B), labeled as such:**

1. Fig. 2b gray is a ~1-s curve. Hairiness matches our
   2029-knot polyline, not a 25-mb / significant-level
   subset.
2. Printed 0–1 km SRH = 88 m² s⁻² does **not** include
   the 3.7 m launch-transient segment. That segment
   alone is 45.33 m² s⁻² by Explorer Form B
   (`09` §8.2). Raw 0–1 km SRH 132.65 − 45.33 = 87.32,
   versus published 88.
3. A 5-step Leise applied to native 1-s samples **with
   frozen endpoints** (interior-only 1-2-1) does **not**
   produce 88. It leaves the launch transient and yields
   0–1 km SRH ≈ 126. The caption’s “5-step Leise”
   therefore cannot be treated as a fully specified
   transform until the grid and boundary treatment are
   known.
4. 0–6 km bulk wind difference is insensitive to these
   choices (29–30 m s⁻¹ across raw, skip-first, and
   Leise experiments).

Parker (2014) Barnes smoothing of 1-s VORTEX2 winds is
**not** the Fig. 2b recipe. It is a composite-analysis
method for 134 soundings.

---

## 8. Published benchmark diagnostics

All from Markowski et al. (2012) Part I, this sounding.
Storm motion for the hodograph numbers is Fig. 2b
`C = (10.5, −1.3)` m/s. Numbers on Fig. 2b are for the
**smooth** curve.

| Quantity | Value | Units | Layer | Source |
| --- | --- | --- | --- | --- |
| 0–1 km SRH | **88** | m² s⁻² | 0–1 km AGL | Fig. 2b inset |
| 0–3 km SRH | **167** | m² s⁻² | 0–3 km AGL | Fig. 2b inset |
| 0–3 km SRH | ~170 | m² s⁻² | 0–3 km AGL | Introduction, citing Fig. 2b |
| 0–6 km shear (vector wind difference **magnitude**) | **29** | m s⁻¹ | 0–6 km AGL | Fig. 2b inset |
| 0–6 km vector wind difference | ~30 | m s⁻¹ | 0–6 km AGL | Introduction, citing Fig. 2b |

No published 0–1 km bulk shear for this sounding was
found in Part I body text. SPC climatological
thresholds are not used (`48` §12).

---

## 9. Matching raw-profile diagnostics

Explorer definitions, not NSHARP:

- SRH: `stormRelativeHelicityBetween`, Form B (`09`)
- 0–6 km “shear” compared to the paper: **magnitude of
  bulk wind difference** `|V(h1)−V(h0)|` in m s⁻¹,
  **not** `verticalWindShearBetween` in 1/s
- Layer bottom cannot be 0 m: `minHeight = 2.4` m, so
  “0–X km” here is `[2.4, X]` m unless noted

Research `C = (10.5, −1.3)` m/s:

| Layer | SRH (m² s⁻²) | \|ΔV\| (m s⁻¹) |
| --- | --- | --- |
| 2.4–1000 m | 132.65 | 9.95 |
| 2.4–3000 m | 197.93 | 11.71 |
| 2.4–6000 m | 397.33 | **30.06** |

Same layers with sandbox DEMO `C = (10, 0)` (not a
Fig. 2b comparison): 0–1 / 0–3 SRH = 126.4 / 181.9.
Different `C`, different SRH, as required by `09`.

---

## 10. Quantitative discrepancies

Published minus **not** used as a pass/fail of the
adapter. The adapter already matches ESC U/V and the
figure’s large-scale shape.

| Quantity | Published | Raw `[2.4, h1]` | Skip first knot `[6.1, h1]` | 5-step Leise, native index, frozen ends |
| --- | --- | --- | --- | --- |
| 0–1 km SRH | 88 | 132.6 (**+51%**) | **87.3 (−0.8%)** | 126.4 |
| 0–3 km SRH | 167 | 197.9 (**+18%**) | 152.6 (−8.6%) | 195.3 |
| 0–6 km \|ΔV\| | 29 | **30.06 (+3.7%)** | 29.40 (+1.4%) | 30.48 |

The entire 0–1 km SRH gap is the first 3.7 m segment
(45.33 m² s⁻²). That is balloon startup, not a unit
error.

0–3 km remains imperfect after dropping that segment
(152.6 vs 167). That residual is **not** closed by a
5-step Leise on native 1-s samples with frozen
endpoints. It is consistent with remaining unknown
Leise-grid / boundary / 1–3 km smoothing details
(section 7). It is not a sign error: both values are
cyclonic and the same order.

0–6 km bulk shear agrees at the level of the paper’s
own “~30” wording.

Vertical-bin experiments (50 / 100 / 250 m) also move
the first included height upward, so they confound
smoothing with dropping the transient. They are not a
recipe. They were not used to pick a production length.

Local native-segment `|ω_h|`:

```text
median   0.019 s⁻¹
p95      0.049 s⁻¹
max      1.055 s⁻¹     ← first 3.7 m launch jump
```

At several interior knots `|ω_h| = 0` because ESC U/V
are quantized to 0.1 m/s over ~5 m. That is
instrument/processing granularity, not zero
environmental vorticity.

---

## 11. Suitability of raw 1-s data

| Use | Raw 2029-knot column | Why |
| --- | --- | --- |
| Visualization of the **observed** column | **Yes**, as the scientific polyline | Fig. 2b gray is the same kind of curve. I2/`51` already keep every imported knot on the path and thin only markers |
| 0–6 km bulk shear | **Yes** | 30.06 vs 29; stable under Leise and skip-first |
| 0–3 km bulk shear | **Yes** as `|ΔV|` | endpoint difference; not published for this sounding |
| 0–1 / 0–3 km SRH as a **published-figure match** | **Not without an explicit first-knot / analysis policy** | 0–1 km is dominated by 3.7 m of launch transient |
| 0–1 / 0–3 km SRH as an **Explorer integral of this imported column** | **Yes**, on support, with the named transient | Form B is well-defined; the number is 133 / 198, not 88 / 167 |
| Local horizontal-vorticity **derivative** on native segments | **No** | max 1.05 s⁻¹; stair-step zeros from 0.1 m/s quantization; pendulum hairiness |
| `T_tilt` on native segments | **No** as an environmental diagnostic | `T_tilt,y` uses that same segment `ω_h` (`22`). Prescribed DEMO updraft does not make noisy `ω_h` into observed tilting |

---

## 12. Is a separate analysis profile warranted?

**Yes, as a derived view, if and only if the product
needs one of:**

- a Fig. 2b-black analogue (smooth hodograph)
- published-comparable 0–1 km SRH
- local `ω_h` / `T_tilt` at storm-relevant vertical
  scales

**No, as a replacement of the I1 golden or as a silent
resample of Explore `V_env`.** The source column is
already the right object for provenance, bulk 0–6 km
shear, and an honest hairy polyline.

---

## 13. Evidence that would support a later transformation

What is **supported** if an analysis profile is
designed later:

1. Fig. 2b itself is two representations of one
   sounding: unsmoothed 1-s and 5-step Leise.
2. Printed kinematic inset numbers belong to the
   smooth representation.
3. The 3.7 m launch transient is independently
   documented in `49` §7.1 and numerically accounts
   for the 0–1 km SRH mismatch.
4. Local native-segment `ω_h` is not an environmental
   derivative.

What is **not** supported:

- inventing a production smoothing length
- treating skip-first as a new I1 drop rule (I1
  already locked keep-t=0)
- treating Leise-5-on-native-index-with-frozen-ends
  as “the” Fig. 2b operator (it does not recover 88)
- replacing sandbox `C=(10,0)` with `(10.5,−1.3)` as
  a side effect of this comparison
- claiming Explorer tracers in the Goshen sandbox
  reproduce observed Goshen parcels

A later analysis profile would need its own named
transform, its own provenance, and tests against
these published numbers — still not as a golden
oracle for the **source** adapter (`48` §12).

---

## 14. Architecture consequence

Recorded in `53`. Compact form:

```text
SOURCE PROFILE     I1 golden, 2029 knots, keep t=0
                   Explore V_env / scientific polyline
ANALYSIS PROFILE   not present; warranted later only as
                   a derived view for smooth hodograph /
                   published-comparable SRH / local ω_h
PUBLISHED C        sibling evidence; not sandbox C
IMPLEMENTATION     not included
```

---

## 15. Implementation authorization

**No.** This file does not change production physics,
the golden, the Goshen sandbox, or DEMO `C`.
