# VORTEX2 Source Qualification — Prospect Valley and Dumas

**Status:** RESEARCH CHECKPOINT / SOURCE IDENTITY + COLUMN AUDIT
**Date:** 2026-08-28
**Not:** data import into `src/`, golden rewrite, Analysis-profile
implementation, adapter implementation, Δz / operator choice
**Native bytes:** remain in gitignored `data/`; not committed
**Implementation authorization:** **NO**

Predecessor (case selection, not this inspect):

```text
docs/research/2026-08-28-additional-sounding-case-selection.md
```

Sampler (research-only; reads local `data/`):

```text
docs/research/sample-vortex2-source-qualification.mjs
docs/research/artifacts/vortex2-source-qualification-summary.json
```

Drop rules used here are the existing I1 ESC wind rules
(`isUsableWindRecord`): drop missing U or V (9999), Qu/Qv MISSING
(9) or BAD (3), missing Alt (99999). Height AGL =
round-to-tenth(`Alt` − header launch elevation). That is a
**source audit**, not a new production adapter.

---

## 1. What was opened

| File | Dataset | Blocks |
| --- | --- | --- |
| `data/114.114 2010-05-26/NSSL_MGAUS_20100526.cls` | EOL `114.114` | 9 |
| `data/114.114 2010-05-18/NSSL_MGAUS_20100518.cls` | EOL `114.114` | (full day; 21:30–22:30 listed below) |
| `data/114.115 2010-05-18/NCAR_MGAUS_20100518.cls` | EOL `114.115` | (full day; 21:30–22:30 listed below) |
| `data/114.114 Goshen/NSSL_MGAUS_20090605.cls` | EOL `114.114` | 9; NSSL1 21:55:22 re-audited as baseline |

Delivered `README-info-114_114.txt` / `README-info-114_115.txt` are
EOL SPA HTML shells, not dataset documentation. The real READMEs
are `Readme_VORTEX2_NSSL_MGAUS_soundings.html` and
`Readme_VORTEX2_NCAR_MGAUS_soundings.html` (ESC 15-line header,
21×130-char records, QC codes).

Goshen re-audit of the local day file matches I1: 2082 records,
2029 kept, 53 dropped, minHeight 2.4 m, maxHeight 12261.8 m.

---

## 2. Prospect Valley — identity CONFIRMED

Expected: NSSL1, 2010-05-26 **22:23:46** UTC (Murdzek et al. 2020).

Found as **ordinal 7** in `NSSL_MGAUS_20100526.cls`. Do not select
by ordinal. Header lock:

```text
Release Site Type/Site ID:         Mobile System/NSSL1
UTC Release Time (y,m,d,h,m,s):    2010, 05, 26, 22:23:46
Release Location:                  103 35.62'W, 40 00.09'N,
                                   -103.594, 40.002, 1358.9
Sonde Id/Sonde Type:               101364451/Vaisala RS92-SGP (ccGPS)
Reference Launch Data Source/Time: Manual Entry/22:19:58.36
System Operator/Comments:          G Bryan/Good sounding.  Woodrow,
                                   Good Sounding
Post Processing Comments:          Aspen Version 2.8.1.8,
                                   Configuration upsonde-1s
Data Type:                         NSSL1  MGAUS/Ascending
Nominal Release Time:              2010, 05, 26, 22:23:46
```

Other NSSL1 blocks that day (00:32:24, 19:58:01, 21:09:45,
23:20:45) are **different launches**. NSSL2 22:19:19 is closer to
Prospect Valley longitude but is **not** Murdzek’s named column.

Murdzek: inflow sounding, southeast of the Prospect Valley storm,
immediately before the 2225–2245 UTC dual-Doppler window. Operator
site name is Woodrow. Header lat/lon/elev are the launch location
of record.

### Wind column (I1 drop rules)

| | |
| --- | --- |
| Native records | 2824; Time −1 … 2822 s; exact 1 s; all 130 characters |
| Last pressure | 120.0 mb |
| Qu/Qv | GOOD/GOOD 2733; MISSING/MISSING 91; no one-sided U/V; no BAD |
| Missing Alt | 9 |
| Kept / dropped | **2733 / 91** |
| Height AGL | **−0.1 … 14017.9 m** |
| Δz (kept) | min 0.7; p10 3.8; median 4.8; p90 6.5; max 26.1 m |
| Gaps > 50 m | **none** |
| Height monotone | no decrease, no duplicate consecutive Alt after drop |

`Time = −1` has GOOD U/V (`U=−0.2`, `V=+2.0`) and is **kept**.
I1 Goshen dropped `t=−1` because those winds were missing, not
because of a universal skip-pre-release rule. Result: first kept
height **−0.1 m** (`Alt` 1358.8 − elev 1358.9).
`EnvironmentalWindProfile` allows a negative finite height
(strictly increasing only). Later ingest may still want a named
datum policy for this row. That policy is **not** chosen here.

`Time = 1` is **not** kept (among the 91 MISSING U/V). Several
other early seconds are missing. 0–200 m AGL still has 34 kept
knots; 0–500 m has 88. No 50 m coverage hole.

Launch transient: largest consecutive `|ΔV|` in 0–200 m is
**4.5 m/s** from `t=−1` → `t=0` (`dU=−2.7`, `dV=+3.6`). After
`t=0`, consecutive changes are ≤ 1.5 m/s. This is the same *class*
of launch jump as Goshen’s 3.9 m/s `t=0` → `t=1`, not a unique
Goshen defect.

Low-level winds after `t=0` are present and usable (first kept
`t≥0`: height 0.6 m, `U=−2.9`, `V=+5.6`).

---

## 3. Dumas / Stinnett — launches 21:30–22:30 UTC, then identity lock

Not chosen by nearest clock time alone. All launches in that window
from **both** day files:

| UTC | File / Site ID | lat, lon, elev m | vs Dumas TX (~35.862°N, 101.973°W) | Comments |
| --- | --- | --- | --- | --- |
| **21:52:18** | `114.114` **NSSL2** `Mobile System/NSSL2` | 35.691, −101.973, 1122.1 | **19.0 km due south** (same longitude) | Matt M./none, Good Sounding |
| 21:59:46 | `114.115` NCAR1 `Mobile System/NCAR1` | 35.716, −102.323, 1180.8 | 35.5 km SSW | Adam French/**Burst at 550 mb**, Good Sounding; 828 records only |
| 22:04:18 | `114.114` NSSL1 `… mi E Hartley/NSSL1` | 35.867, −102.213, 1159.0 | 21.6 km west | **G Bryan/Forward flank launch, none** |
| 22:16:06 | `114.115` NCAR2 `… E of Forward Flank @ 2220 UTC/NCAR2` | 35.866, −101.811, 1074.2 | 14.6 km east | casey L/good sounding; site string is forward flank |

### Literature lock

| Source | What it names |
| --- | --- |
| Skinner et al. (2012 SLS / 2014 *MWR* context) | VORTEX2 mobile sounding **2152 UTC**, **~20 km south of Dumas**; used there for θ/q, not as the model wind profile |
| Wade, Coniglio, Ziegler (2018) Table 1 | tornadic near–far pair **2152–2159 UTC**, TX Panhandle |
| This inspect | **NSSL2 21:52:18** is 19 km due south of Dumas. **NCAR1 21:59:46** is the 2159 partner, farther and **burst at 550 mb** |

**LOCKED identity:**

```text
NSSL2  2010, 05, 18, 21:52:18
header Site ID     Mobile System/NSSL2
location           101 58.35'W, 35 41.43'N, -101.973, 35.691, 1122.1
sonde              101364478/Vaisala RS92-SGP (ccGPS)
processing         Aspen 2.8.1.8 upsonde-1s
comments           Matt M./none, Good Sounding
file               data/114.114 2010-05-18/NSSL_MGAUS_20100518.cls
```

**Role:** near-inflow member of Wade’s tornadic 2152–2159 pair;
launch ~19 km south of Dumas (Skinner’s “20 km south”). Not the
forward-flank NSSL1 22:04:18. Not NCAR1 21:59:46 (pair partner,
incomplete).

NSSL2 21:52:18 is no longer a “strong candidate”. It is the
header-locked column.

### Wind column (I1 drop rules)

| | |
| --- | --- |
| Native records | 3022; Time −1 … 3020 s; exact 1 s; all 130 characters |
| Last pressure | 89.2 mb |
| Qu/Qv | GOOD/GOOD 2917; MISSING/MISSING 104; UNCHECKED/UNCHECKED 1; no one-sided U/V |
| Missing Alt | 20 |
| Kept / dropped | **2917 / 105** |
| Height AGL | **−0.5 … 16025.6 m** |
| Δz (kept) | min 2.5; p10 4.0; median 5.2; p90 6.8; max 36.5 m |
| Gaps > 50 m | **none** |
| Height monotone | no decrease, no duplicate consecutive Alt after drop |

`Time = −1` kept (GOOD U/V `U=+0.1`, `V=−1.1`); minHeight **−0.5 m**.
`Time = 0` **not** kept. First `t≥0` kept is `t=1`, height 2.0 m,
`U=−2.5`, `V=+2.5`.

Launch transient: **4.4 m/s** from `t=−1` → `t=1` (`dU=−2.6`,
`dV=+3.6`). 0–200 m has 29 kept knots; 0–500 m has 83. Low-level
winds after `t=1` are present and usable.

Skinner’s choice of KAMA 00Z for **model winds** is not evidence
that this ESC wind column is unusable. Native Qu/Qv are GOOD on
2917 levels, including the low troposphere after the first second.

---

## 4. Cross-profile SOURCE comparison

Same product class: VORTEX2 mobile GAUS, Vaisala RS92-SGP, Aspen
`upsonde-1s`, ESC 1-s, U/V printed to 0.1 m/s, EOL QC.

| Source property | Goshen NSSL1 21:55:22 | Prospect NSSL1 22:23:46 | Dumas NSSL2 21:52:18 |
| --- | --- | --- | --- |
| Cadence | 1 s exact | 1 s exact | 1 s exact |
| Kept knots | 2029 | 2733 | 2917 |
| Δz median (m) | 5.7 | 4.8 | 5.2 |
| Δz min / max | 3.3 / 31.9 | 0.7 / 26.1 | 2.5 / 36.5 |
| Gaps > 50 m | none | none | none |
| minHeight AGL | 2.4 | **−0.1** | **−0.5** |
| maxHeight AGL | 12261.8 | 14017.9 | 16025.6 |
| Dropped | 53 | 91 | 105 |
| 0–200 m kept | 36 | 34 | 29 |
| 0–500 m kept | 98 | 88 | 83 |
| Launch jump | 3.9 m/s, `t=0`→`t=1` (both kept) | 4.5 m/s, `t=−1`→`t=0` (`t=1` missing) | 4.4 m/s, `t=−1`→`t=1` (`t=0` missing) |
| U quantization | 0.1 m/s steps dominate | same | same |

Nearest **source knot** (not interpolated, not SRH, not Fig. 2b):

| | Goshen | Prospect | Dumas |
| --- | --- | --- | --- |
| ~0 km `(U,V)` | (−1.2, 0.2) at 2.4 m | (−0.2, 2.0) at −0.1 m | (0.1, −1.1) at −0.5 m |
| ~1 km | (−0.2, 10.1) | (−6.5, 12.6) | (3.0, 12.2) |
| ~6 km | (27.7, 8.6) spd 29.0 | (13.3, 9.8) spd 16.5 | (23.6, 11.3) spd 26.2 |
| 0–6 km bulk `‖ΔV‖` from first kept | **30.1** | **15.6** | **26.6** |
| 0–6 km bulk from first `t≥0` kept | 30.1 | **16.7** | **27.5** |
| 0–1 km bulk from first `t≥0` kept | 10.0 | 7.9 | 11.2 |

0–1 km source bulk magnitudes are the **same order**. The clear
structural contrast is **deep-layer**: Prospect’s 0–6 km source
shear is about half of Goshen’s; 6 km wind speed 16.5 vs 29.0 vs
26.2 m/s. Direction at first kept knot also differs (Goshen ~100°,
Prospect ~174°, Dumas `t=−1` ~355° then `t=1` already SE).

These bulk numbers are **source-knot differences**, not Analysis,
not Murdzek Table 2, not Markowski 88/167.

---

## 5. Different wind structures? Enough for BL-037 mobile branch?

**Same sampling / source class:** yes. Three 1-s ESC mobile GAUS
columns cannot test operational-RAOB sampling. That remains Moore
(#2).

**Different environmental wind structure:** yes, as **source**
hodograph / shear shape, not as tornado outcome:

```text
Goshen     stronger 0–6 km source shear (~30 m/s); classic veering
Prospect   weaker 0–6 km source shear (~16 m/s); high-based case
           context in Murdzek/Parker; not a second Goshen clone
Dumas      tornadic-inflow 0–6 km ~27 m/s; different low-level
           orientation than Goshen; different storm/day
```

**Goshen launch hairiness is not unique.** All three have ~4 m/s
jumps in the first 1–2 s. Prospect and Dumas also keep a `t=−1`
wind that Goshen did not have. A candidate Analysis transform
cannot be justified as “the Goshen pendulum special.” It can be
tested for **stability across three dirty 1-s columns with
different large-scale shear**.

**Enough for the high-resolution-mobile branch of BL-037:** yes,
once these columns are later ingested as validation inputs.
**Not enough to close BL-037:** slot B (Moore operational RAOB)
and scale / bin-phase checks remain. This audit does not accept,
qualify, or replace the `54` 100 m candidate.

Moore / OUN IGRA source qualification (later, separate inspect):

```text
docs/research/2026-08-28-moore-oun-igra-source-qualification.md
```

---

## 6. NOT PROMOTED

| Idea | Why not a new BL |
| --- | --- |
| Change I1 to always drop `t=−1` | Goshen drop was missing U/V, not a general pre-release law. Prospect/Dumas `t=−1` is a source fact for a later named ingest policy. |
| Treat negative minHeight as illegal | Physics profile allows it. Datum policy is later adapter work. |
| Use NCAR1 21:59:46 as Dumas winds | Pair partner; burst at 550 mb. |
| Pick NSSL2 22:19:19 as Prospect Valley | Closer to Prospect Valley longitude; **not** Murdzek 22:23:46. |
| Compute best Δz / SRH / ω_h | Forbidden this slice. |

---

## 7. Compact lock-in

```text
PROSPECT VALLEY     CONFIRMED
                    NSSL1  2010, 05, 26, 22:23:46
                    2733 usable U/V+Alt levels
                    minHeight −0.1 m (t=−1 kept)

DUMAS / STINNETT    LOCKED
                    NSSL2  2010, 05, 18, 21:52:18
                    ~19 km south of Dumas; near-inflow
                    2917 usable U/V+Alt levels
                    minHeight −0.5 m (t=−1 kept)

SAMPLING CLASS      same 1-s ESC as Goshen
WIND STRUCTURE      different 0–6 km source shear / orientation
HAIRINESS           shared (~4 m/s launch jump); not Goshen-only
MOBILE BRANCH BL-037  these three are sufficient INPUTS
BL-037 CLOSURE        NO (Moore inspect later; scale/bin-phase remain)
ANALYSIS / Δz         not chosen
IMPORT / GOLDEN       NO
IMPLEMENTATION        NO
```
