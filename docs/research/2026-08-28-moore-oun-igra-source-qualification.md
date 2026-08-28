# Moore / OUN IGRA Source Qualification

**Status:** RESEARCH CHECKPOINT / SOURCE IDENTITY + COLUMN AUDIT
**Date:** 2026-08-28
**Not:** IGRA adapter, production golden, Explore/UI wiring,
Analysis-profile implementation, smoothing / Δz / operator choice,
change to Goshen / Prospect / Dumas source normalization
**Native bytes:** remain in gitignored `data/`; not committed
**Implementation authorization:** **NO**

Predecessor (case selection):

```text
docs/research/2026-08-28-additional-sounding-case-selection.md
```

Mobile-branch inspect (different source class; not this file):

```text
docs/research/2026-08-28-vortex2-source-qualification.md
```

Sampler (research-only; reads local `data/Moore`):

```text
docs/research/sample-moore-oun-igra-source-qualification.mjs
docs/research/artifacts/moore-oun-igra-source-qualification-summary.json
```

Format source of record for this inspect:

```text
data/Moore/igra2-data-format.txt
IGRA v2.2 Format Description: Sounding Data
Last updated: 19 January 2023
```

This audit does **not** implement an adapter. Mapping and drop rules
below are a **documented candidate** for later ingest, not production
code.

---

## 1. Identity lock

Expected: station `USM00072357`, date 2013-05-20, nominal HOUR = 17
UTC, RELTIME = 1651 UTC.

Found by **exact header match**, not by ordinal position in the POR
file. Native header line:

```text
#USM00072357 2013 05 20 17 1651  165 ncdc6301 ncdc6301  351808  -974378
```

| Field | Native value |
| --- | --- |
| Station ID | `USM00072357` |
| Date | 2013-05-20 |
| HOUR (nominal UTC) | **17** |
| RELTIME | **1651** (16:51 UTC) |
| NUMLEV | **165** (165 data records parsed; match) |
| P_SRC | `ncdc6301` — NCDC U.S. Rawindsonde Data (NCDC DSI-6301) |
| NP_SRC | `ncdc6301` — same code, non-pressure / height-only levels |
| Header LAT | 351808 → **35.1808** °N |
| Header LON | −974378 → **−97.4378** °E |
| Format / version | IGRA v2.2 sounding-data POR (`USM00072357-data.txt`) |
| HEADREC | `#` |

Wyoming’s 18 UTC label for the same afternoon special remains a
**view label**, not the IGRA header. Provenance must keep both:
IGRA nominal 17 UTC / release 1651, Wyoming 18 UTC.

### Same-day neighbors (listed, not selected)

Headers on calendar date **2013-05-20**:

| HOUR | RELTIME | NUMLEV | Role |
| --- | --- | --- | --- |
| 12 | 1108 | 155 | routine 12 UTC; **not** this candidate |
| **17** | **1651** | **165** | afternoon special; **selected** |

Adjacent POR headers on **2013-05-21** (different `YEAR/MONTH/DAY`;
not selected):

| HOUR | RELTIME | NUMLEV | Note |
| --- | --- | --- | --- |
| 00 | 2304 | 167 | R1 after-tornado 00Z; release 23:04 UTC |
| 12 | 1200 | 191 | next-day 12 UTC |

Selection is the 17 / 1651 header. Do not pick by “afternoon-ish”
or by Wyoming’s 18 UTC stamp.

---

## 2. IGRA format / semantics

Authoritative text: `igra2-data-format.txt` (v2.2). Compact lock for
this column:

### Header

| Field | Meaning |
| --- | --- |
| HOUR | nominal / observation hour UTC on the header date; 99 = missing. Relationship to RELTIME varies by provider |
| RELTIME | release time UTC as HHMM; 9999 = missing |
| NUMLEV | number of following data records |
| P_SRC / NP_SRC | pressure-level vs non-pressure-level source codes |
| LAT / LON | integers × 10⁻⁴ degrees. For **fixed** stations this is the station-list location, **not** a reconstructed per-sounding GPS history |

`USM00072357` is a fixed station. Header lat/lon **equal** the
station list (see §4). Using the fixed-station location for this
sounding is appropriate.

### Level type

| Field | Values used here |
| --- | --- |
| LVLTYP1 | 1 = standard pressure (1000, 925, … 1 hPa); 2 = other pressure; 3 = non-pressure |
| LVLTYP2 | 1 = surface; 2 = tropopause; 0 = other |

This sounding: 1 surface (other-pressure, not 1000 hPa), 14
standard-pressure, 56 other-pressure, **94 non-pressure**. Surface
pressure is 96638 Pa ≈ 966.4 hPa, so the surface is correctly
*other-pressure*, not the 1000 hPa standard level.

### Coordinates, wind, sentinels

| Quantity | Semantics |
| --- | --- |
| PRESS | Pa (mb × 100). −9999 = missing |
| GPH | geopotential height, **meters above sea level**. −8888 = QA-removed; −9999 = missing. Format notes GPH is often absent on variable-pressure levels |
| ETIME | elapsed since launch, MMMSS. −8888 / −9999 as above |
| WDIR | integer degrees **from north, 90 = east**. This is meteorological direction **FROM which the wind blows** |
| WSPD | m/s to tenths (11 = 1.1 m/s). −8888 / −9999 as above |
| PFLAG / ZFLAG / TFLAG | climatology QA tier: blank / A / B. Blank + value ≠ missing means other applicable checks passed |

No −8888 appears anywhere on this sounding (ETIME, PRESS, GPH,
WDIR, WSPD). All 94 −9999 hits are **PRESS missing on non-pressure
levels**, not missing wind or GPH.

### Conversion into Explorer environmental convention

**Documented only. Not implemented.**

IGRA stores meteorological FROM direction and speed. Existing
environmental convention is atmospheric eastward / northward
(`04` / `48`):

```text
speed     = WSPD / 10          (m/s)
dir_rad   = WDIR * π / 180     (clockwise from north)
eastward  = -speed * sin(dir_rad)
northward = -speed * cos(dir_rad)
vertical  = 0
```

Check at 90° / 10 m/s (FROM east → westward): eastward = −10.
Check at surface of this sounding (WDIR 185, WSPD 51 → 5.1 m/s):
eastward ≈ +0.44, northward ≈ +5.08 (FROM SSW → NNE). Mapping
matches the meteorological FROM convention.

Do not mix Wyoming knots copies with this IGRA m/s-to-tenths
column.

---

## 3. Usable wind column (no interpolation)

Question: which native levels can become a provider-neutral
`(height, eastward, northward)` profile **without** interpolating,
inventing values, or recovering height from pressure / standard
atmosphere?

### Per-level inventory (all 165)

| Class | Count | Wind+GPH usable? |
| --- | --- | --- |
| A. valid GPH | **165** | yes, all also have WDIR+WSPD |
| B. no GPH but pressure present | **0** | n/a |
| C. non-pressure (LVLTYP1=3) | **94** | yes: PRESS=−9999, GPH and wind present |
| D. surface (LVLTYP2=1) | **1** | yes: GPH 345, ETIME 0, PRESS 96638 Pa, WDIR 185, WSPD 5.1 m/s |
| E. any −8888 | **0** | n/a |
| F. any −9999 | **94** | PRESS only, on class C |

Kept under the no-interpolation rule (present WDIR, WSPD, **and**
GPH): **165 / 165**. Dropped: **0**.

R1’s Wyoming “last level missing wind” does **not** hold for this
IGRA copy. Do not mix Wyoming and IGRA at the top. This inspect
uses IGRA as source of record.

Class C is kept **because GPH is present**, not because pressure
was reconstructed. Class B is empty, so the “do not recover height
from pressure” rule is not tested by a drop on this sounding; it
remains a standing constraint for any later adapter.

### File order is not a height column

Native record order is **not** strictly increasing in GPH.
One inversion in file order:

| | From | To |
| --- | --- | --- |
| GPH (m MSL) | 31045 | 707 |
| worldY if −345 | 30700 | 362 |
| ETIME | 95:16 | 1:00 |
| Type | other-pressure / other | non-pressure / other |
| Δ | **−30338 m** | |

A late-ascent pressure level is immediately followed by a
significant-wind (height-only) level from early ascent. That is
IGRA mixed-level packing, not a balloon descent.

`EnvironmentalWindProfile` requires strictly increasing height
(`48` §7). Silent sort is forbidden unless a **named, tested
adapter step** documents the sort as format repair. This slice
does not choose or implement that step.

Diagnostic **sort-by-GPH** (not an accepted adapter step): 0 equal
heights, 0 remaining inversions, envelope 0 … 30700 m after the
§4 datum. ETIME is present on all 165 levels and would also place
1:00 before 95:16.

File-order `maxWorldY` of the last record (30589 m) is **not** the
column maximum. True max GPH is 31045 m (worldY 30700).

### Minimal deterministic source-normalization candidate

Named candidate only; **not implemented**:

```text
1. Keep native levels where WDIR, WSPD, and GPH are present
   (not −8888 and not −9999).
2. speed = WSPD/10; convert FROM direction → eastward/northward
   as in §2; vertical = 0.
3. worldY = GPH − 345 m   (see §4; 345 vs 344.9 is named).
4. Do not interpolate missing GPH.
5. Do not recover height from pressure or a standard atmosphere.
6. Do not invent a surface at Y=0 apart from arithmetic on the
   sounding’s own surface GPH.
7. Native file order is not monotone. A legal profile therefore
   requires either fail-if-not-monotone or a later *named*
   sort-by-GPH (ETIME is an alternative key). Neither is
   authorized here.
```

That is the smallest rule that yields honest
`(worldY, eastward, northward)` knots from **this** file without
invented heights. It is not a production adapter.

---

## 4. Height datum

IGRA GPH = meters **above sea level**. Explorer source profiles
need a world-Y / AGL-like height.

### Station metadata

NCEI IGRA v2.2 station list
(`https://www.ncei.noaa.gov/pub/data/igra/igra2-station-list.txt`):

```text
USM00072357  35.1808  -97.4378  344.9
OK NORMAN/MAX WESTHEIMER A; OK.   1974 2026  28199
```

Header lat/lon **match** the list. Fixed-station location is
appropriate for this sounding (format: no per-sounding location
history for fixed stations).

### Surface record (independent of the catalog)

| | |
| --- | --- |
| LVLTYP | other-pressure / surface |
| ETIME | 0 |
| PRESS | 96638 Pa |
| GPH | **345** m MSL |
| WDIR / WSPD | 185 / 5.1 m/s |

Catalog elevation **344.9 m** vs sounding surface GPH **345 m** =
**0.1 m discrepancy**. R1 Wyoming station elevation was 345 m.

### Candidate (not applied silently)

```text
worldY = GPH − 345
```

345 is this sounding’s **own surface GPH**, so the surface knot
has worldY = 0 as arithmetic `GPH_sfc − GPH_sfc`, not as an
invented ground. Using catalog 344.9 instead would put the
surface at +0.1 m.

Do not invent Y=0 if a later sounding lacks a surface GPH.
Do not subtract 344.9 without recording the 0.1 m split.

---

## 5. Source-profile metrics

Datum for counts below: `worldY = GPH − 345`. Band counts are
value-based (identical before/after a named GPH sort). Spacing
statistics are reported **twice**: native file order, and
diagnostic sort-by-GPH.

| | |
| --- | --- |
| Native NUMLEV | 165 |
| Usable wind+height | **165** |
| Dropped | **0** |
| min / max worldY (set) | **0 / 30700** m |
| ETIME | present on **all 165**; none −8888 / −9999 |
| WDIR resolution | integer degrees (84 distinct values kept) |
| WSPD resolution | 0.1 m/s (124 distinct tenths kept) |
| Duplicate / equal GPH | **0** native; **0** after sort |
| File-order monotone? | **NO** (1 inversion, −30338 m) |

Levels with `0 ≤ worldY ≤ H`:

| Band | Count |
| --- | --- |
| 0–200 m | **2** |
| 0–500 m | **5** |
| 0–1 km | **7** |
| 0–3 km | **24** |
| 0–6 km | **38** |

Low-level kept knots (file order, so 362 m appears after 493 m):

| worldY m | GPH | ETIME | Type | WDIR | speed m/s |
| --- | --- | --- | --- | --- | --- |
| 0 | 345 | 0:00 | other-p / surface | 185 | 5.1 |
| 81 | 426 | 0:16 | other-p / other | 186 | 7.5 |
| 385 | 730 | 1:04 | standard-p / other | 186 | 8.2 |
| 493 | 838 | 1:23 | other-p / other | 194 | 8.5 |
| 362 | 707 | 1:00 | non-pressure / other | 186 | 8.2 |

### Adjacent Δz

**File order** (contaminated by the inversion; not a physical
ascent spacing):

| | m |
| --- | --- |
| min / p10 / median / p90 / max | −30338 / 108.3 / 329.5 / 618.9 / 1710 |
| gaps > 50 / 100 / 250 m | **157 / 148 / 134** of 164 pairs |

**Diagnostic sort-by-GPH** (not authorized; the honest spacing of
the usable set):

| | m |
| --- | --- |
| min / p10 / median / p90 / max | 5 / 44.9 / **174** / 336.1 / 362 |
| gaps > 50 / 100 / 250 m | **144 / 119 / 54** of 164 pairs |

Inserting the 94 height-only wind levels into GPH order shrinks
the largest gap from 1710 m (file-order pressure packing) to
362 m. The column is still operational-RAOB coarse: 144/164
adjacent intervals exceed 50 m.

---

## 6. Compare source regimes

Comparison is **source-layer** only. No Analysis, no SRH, no
tornado outcome, no “which profile is better.”

Goshen / Prospect / Dumas numbers from
`2026-08-28-vortex2-source-qualification.md`.

| Source property | Goshen NSSL1 21:55:22 | Prospect NSSL1 22:23:46 | Dumas NSSL2 21:52:18 | **Moore OUN 17/1651** |
| --- | --- | --- | --- | --- |
| Class | 1-s ESC RS92 Aspen | same | same | **IGRA v2.2 operational RAOB** |
| Native cadence | 1 s | 1 s | 1 s | mandatory + significant + wind levels |
| Wind native | U/V m/s + Qu/Qv | same | same | WDIR deg + WSPD tenths m/s |
| Vertical native | geometric Alt | same | same | GPH m MSL |
| Kept knots | 2029 | 2733 | 2917 | **165** |
| Dropped | 53 | 91 | 105 | **0** |
| Δz median | 5.7 m | 4.8 m | 5.2 m | **174 m** (sorted diagnostic) |
| Gaps > 50 m | none | none | none | **144** (sorted) |
| 0–200 m | 36 | 34 | 29 | **2** |
| 0–500 m | 98 | 88 | 83 | **5** |
| 0–6 km | ~10³ 1-s knots | same order | same order | **38** |
| Height monotone in file? | yes after I1 drop | yes | yes | **no** (1 inversion) |
| minHeight | 2.4 | −0.1 | −0.5 | **0** (if −345) |

### Direct answers

**1. Is Moore actually coarse/sparse versus 1-s ESC?**
Yes. Kept knots ~15× fewer than Goshen, ~17× fewer than Prospect,
~18× fewer than Dumas. Near-ground: 2 knots in 0–200 m vs ~30.
Median adjacent Δz ~174 m vs ~5 m. 144 gaps > 50 m vs zero.
This is a different sampling class, not a slightly thinner ESC.

**2. Is “operational RAOB ≈ 165 coarse levels” still correct after
usable filtering?**
For **this** sounding, yes as a **count**: NUMLEV = 165 and all
165 survive wind+GPH filtering. It is **not** “165 native but only
a handful usable.” It remains coarse in **spacing**: 165 knots
with median Δz 174 m is not a dense column that happens to have
165 points.

**3. Which current-pipeline assumptions were ESC-specific?**

```text
130-char ESC records; concatenated day files; header site ID
U/V already in m/s; Qu/Qv 9/3 drop; Alt 99999 drop
launch elevation from ESC header (not a station-list GPH datum)
1-s Time field; typically height-monotone after drop
t=−1 launch-transient policy
I1 normalizeEscWindColumn identity lock
```

**4. What of provider-neutral `EnvironmentalWindProfile` survives
Moore without change?**

```text
knots of (height m, eastward, northward, vertical=0)
finite values
strictly increasing height (after a legal adapter repair)
sampleAtHeight piecewise linear across remaining knots
large gaps = interpolation across known endpoints, not extra
  observations; coverage must record them (48 §7)
profiles that do not start at 0 or reach 12 km remain legal
```

The consumer type does not care whether there are 165 or 2000
knots. The **adapter** does.

**5. Does Moore require a separate adapter? Why? (not designed)**
Yes. Different native format, dir/speed vs U/V, GPH MSL vs
geometric Alt, station/surface datum vs ESC launch elevation,
file order not height-monotone, different sentinels
(−8888/−9999 vs 9999/9/3), POR-of-years vs day-concatenated ESC.
Reusing `normalizeEscWindColumn` would be a lie. This file does
not design that adapter. Naming the need is not implementation
authorization.

**6. Can the current source representation express Moore faithfully
after normalization?**
Yes, **if** a later adapter emits strictly increasing
`(worldY, eastward, northward)` knots under the §3 candidate.
The physics object does not need a new shape. The ingest does.

**7. Is there a source-level reason to treat one Analysis scale as
automatically universal for ESC and IGRA?**
**NO.** `54` AGL bin-mean Δz = 100 m was motivated by 1-s
pendulum / quantization at ~5 m spacing. On this IGRA column the
median adjacent Δz is already 174 m; many 100 m bins would be
empty or single-point, so the same operator would **mean
something different**. That is a source-level reason not to treat
100 m as a universal production transform. `55` / BL-037 remain
open. `54` stays candidate only.

---

## 7. BL-037 implication

BL-037 is **not closed**.

### SUPPORTED (now empirically visible from four profiles)

```text
Four named source columns exist:
  Goshen NSSL1 2009-06-05 21:55:22     1-s ESC
  Prospect Valley NSSL1 2010-05-26 22:23:46  1-s ESC
  Dumas NSSL2 2010-05-18 21:52:18      1-s ESC
  Moore OUN USM00072357 2013-05-20 17/1651   IGRA RAOB

Sampling-class diversity is no longer hypothetical.
Moore is a genuine operational/coarse source class vs 1-s ESC.
“~165 levels” is true for this IGRA copy after wind+GPH filter.
Near-ground availability is qualitatively different (2 vs ~30
  knots in 0–200 m).
IGRA file order is not a height column; ESC after I1 drop is.
Provider-neutral EnvironmentalWindProfile can still *express*
  Moore after a named normalization; the adapter is the new work.
54 100 m is still only a Goshen-derived candidate (55).
Launch hairiness / 1-s quantization are ESC-class facts, not
  Moore facts.
```

### NOT YET SUPPORTED

```text
scale sensitivity of any Analysis operator
bin phase / origin sensitivity
choice among operators (bin-mean vs anything else)
whether 100 m bin-mean is even meaningful on IGRA Δz
SRH / ω_h stability across the four columns
ingest of Moore (or the mobile three) into src/
Explore / UI / golden
closure of BL-037
authorization of BL-010
```

An operational RAOB is now a **qualified validation input**, not a
validated transform and not a product case (BL-021 stays distinct).

---

## 8. Backlog

**BEFORE:** BL-037 RESEARCH NEEDED; BL-045 named, #1/#3 ESC
confirmed; BL-010 blocked on `55` + BL-037; `54` candidate only
under `55`.

**DURING / NOT PROMOTED**

| Idea | Why not a new BL |
| --- | --- |
| Dedicated IGRA-adapter implementation item | Need is real; it is future ingest, not a new research question. Named in BL-045. Designing it here would be implementation. Not BL-015 product provider #2. |
| Named sort-by-GPH as production policy | Required for a *legal* profile from this file, but choosing the key (GPH vs ETIME) and shipping it is adapter work. |
| Change I1 ESC drop / Goshen golden | Out of scope; Moore must not mutate mobile normalization. |
| Treat 100 m as rejected | `55` already forbids treating it as production. This inspect adds a source-level *reason it is not automatically universal*. That does not close BL-037. |

**AFTER:** BL-045 #2 identity + source column **CONFIRMED** from
native IGRA bytes. Still not imported, still not an adapter
authorization, still not BL-037 closure. BL-010 / `55` / `54`
unchanged.

---

## 9. Compact lock-in

```text
MOORE / OUN         CONFIRMED
                    USM00072357  2013-05-20
                    HOUR 17  RELTIME 1651  NUMLEV 165
                    P_SRC=NP_SRC=ncdc6301
                    lat/lon 35.1808, −97.4378

USABLE              165 / 165 wind+GPH; dropped 0
DATUM CANDIDATE     worldY = GPH − 345
                    catalog elev 344.9; surface GPH 345
                    discrepancy 0.1 m
FILE ORDER          not monotone (1 inversion)
SPACING (sorted Δz) median 174 m; 144 gaps > 50 m
0–200 / 0–6 km      2 / 38 knots

VS 1-s ESC          genuinely coarse; wording “165 levels”
                    is correct for this copy after filtering

ADAPTER             required; NOT designed; NOT authorized
ANALYSIS / Δz       not chosen; 100 m not universal
BL-037              still RESEARCH NEEDED
IMPORT / GOLDEN     NO
IMPLEMENTATION      NO
NATIVE BYTES        not tracked
```

---

## 10. Implementation

This document does not include implementation.
Production `src/**` remains unchanged.
Analysis-profile implementation remains **NOT AUTHORIZED**.
