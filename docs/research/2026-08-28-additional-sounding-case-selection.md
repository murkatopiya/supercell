# Additional Sounding Cases — Selection Research

**Status:** RESEARCH CHECKPOINT / CASE SELECTION ONLY
**Date:** 2026-08-28
**Not:** data import, adapter implementation, Analysis-profile
implementation, smoothing/binning operator choice, golden rewrite,
production-dataset decision, I1/I2 reopen
**Object:** independent observed environmental columns that can later
serve as **BL-037 validation inputs**, not as reconstructed storms
**Implementation authorization:** **NO**

Architecture context (unchanged by this file):

```text
53   source vs analysis split                 ACCEPTED
54   AGL bin-mean, Δz = 100 m                 first candidate only
55   generalization gate; implementation      BLOCKED
BL-037  cross-case validation                 still RESEARCH NEEDED
BL-045  additional sounding candidates        reconciled here
```

This file names future **validation inputs**. It does not run
BL-037. It does not accept, qualify, or replace the `54` candidate.
It does not authorize BL-010.

Native identity for #1 and #3 was later confirmed in:

```text
docs/research/2026-08-28-vortex2-source-qualification.md
```

Native identity and source-column facts for #2 (Moore / OUN IGRA)
were later confirmed in:

```text
docs/research/2026-08-28-moore-oun-igra-source-qualification.md
```

---

## 1. Why this selection exists

Goshen County 5 June 2009, NSSL1 21:55:22 UTC, proved that a
provider-neutral `EnvironmentalWindProfile` pipeline can ingest a
real high-resolution mobile sounding. The same column also showed
that scientific / Analysis decisions must not be made from one
1-s ESC launch.

BL-037 needs independent columns with **deliberate diversity**:

```text
A  second high-res mobile case, different day/storm
B  different sampling / operational-like profile
C  contrasting environmental wind / hodograph structure
```

One profile may cover more than one letter. Three additional
profiles are the target, not three look-alikes of Goshen.

---

## 2. Guardrails

Observed sounding = environmental / source evidence.

Do **not** read this shortlist as claiming:

```text
a sounding represents the whole storm
a sounding = reconstructed storm
a tracer trajectory with this profile = observed parcel trajectory
tornado / non-tornado outcome validates the prescribed storm model
one Analysis transform must fit every source class
100 m AGL is the correct scale
Markowski Fig. 2b 88 / 167 must be reproduced on a new case
Murdzek Table 2 40.3 / 70.0 is an Explorer oracle
```

Storm-local Explorer operands remain prescribed unless a later
architecture SoT decides otherwise.

Published SRH / shear numbers quoted below are **external
literature values**, usually from smoothed analysis of the same
launch. They are selection context, not source golden numbers.

---

## 3. Source policy used here

Preferred: NSF NCAR EOL / VORTEX2 native ESC with DOI, documented
platform, exact launch identity, and a live order path.

Primary literature is used for **case identity and scientific
context**. Sounding bytes, when later obtained, must come from the
authoritative archive, not from published plots or secondary
mirrors.

Operational RAOB (slot B) is **not** available as a coarse
mandatory/significant product inside VORTEX2 ESC. EOL `114.116` is
a highest-resolution composite (NWS native 1-s / 6-s, ARM 2-s).
That is still a high-resolution sampling class. Slot B therefore
uses NOAA NCEI IGRA v2 as source of record, with the University of
Wyoming TEXT:LIST as an independent view of the same observed
column. That does not break the provider-neutral consumer: the
profile object stays `EnvironmentalWindProfile`; only a later
adapter / normalization layer would differ.

No sounding bytes were downloaded or imported by this slice.

---

## 4. Selection criteria (not “pretty hodograph”)

| Criterion | Weight in this ranking |
| --- | --- |
| Archive authority + DOI / station identity | required |
| Reproducible download path | required |
| Exact launch identity recoverable before or at header inspect | high |
| Low-level wind likely present (literature or prior inspect) | high |
| Sampling diversity vs Goshen 1-s ESC | high for the set |
| Hodograph / environment diversity vs Goshen | high for the set |
| Usefulness for BL-037 | high |
| Deterministic normalization (no undocumented processing) | high |
| Named inflow sounding in peer-reviewed literature | preferred |
| Tornado fame / visual drama | **not** a criterion |

---

## 5. Baseline already in Explorer (not an additional case)

| Field | Goshen NSSL1 2155 |
| --- | --- |
| Case | VORTEX2 Goshen County, WY tornadic supercell, 5 June 2009 |
| Archive | NSF NCAR EOL `114.114`, DOI `10.5065/D6CC0Z0Q` |
| Launch | Bushnell/NSSL1, `UTC Release Time` `2009, 06, 05, 21:55:22` |
| Native file | concatenated `NSSL_MGAUS_20090605.cls` (9 blocks) |
| Sampling | ESC 1-s, Aspen `upsonde-1s`, Vaisala RS92-SGP |
| Kept source knots | 2029 GOOD U/V after I1 drop |
| Role | I1/I2 source fixture; BL-037 **reference**, not algorithm owner |

Sibling blocks in the same 5 June file are **not** additional cases
(§11).

---

## 6. How many candidates were investigated

**Eighteen** identities were checked against archives and
literature. They are not eighteen future fixtures.

| # | Identity | Slot it could serve | Disposition |
| --- | --- | --- | --- |
| 1 | Goshen NSSL1 2155 | baseline | already selected |
| 2 | Other 5 June 2009 NSSL blocks in `NSSL_MGAUS_20090605.cls` | false A | rejected |
| 3 | 10 May 2010 VORTEX2 Mission 02 | false A | rejected for BL-045 |
| 4 | 18 May 2010 Dumas / Stinnett ~2152 UTC | A | **#3 shortlist** |
| 5 | 26 May 2010 Prospect Valley NSSL1 2223:46 | A+C | **#1 shortlist** |
| 6 | 20 May 2013 OUN afternoon special | B | **#2 shortlist** |
| 7 | 12 May 2010 Weatherford / western OK | A backup | **#4 backup** |
| 8 | 11 June 2009 SE Colorado nontornadic | C backup | not ranked; named launch weak |
| 9 | 6 June 2009 central Nebraska nontornadic | C | not ranked; weaker identity |
| 10 | 17 May 2010 SE New Mexico nontornadic | C | not ranked |
| 11 | 19 May 2010 OK Wade pairs | A/C | not ranked; mixed tornadic flag |
| 12 | 25 May 2010 western KS | A | not ranked; 8 Parker soundings |
| 13 | 3 May 1999 OUN | B | rejected |
| 14 | 24 May 2011 OUN 18Z | B | rejected (Moore duplicate class) |
| 15 | TORUS 8 June 2019 | A later | rejected for this set |
| 16 | EOL `114.116` NWS 1-s / ARM 2-s | false B | rejected as slot B |
| 17 | KAMA 00Z 19 May 2010 | B | rejected as Dumas substitute |
| 18 | MPEX / MiniMPEX (Wade 2018 table) | A later | not ranked; different campaigns |

Parker (2014) Table 1 supplied the VORTEX2 case calendar. Wade et
al. (2018) Table 1 supplied named near–far time pairs. Murdzek et
al. (2020) supplied the Prospect Valley NSSL1 identity. R1 (`49`)
supplied the Moore / IGRA / Wyoming inspect already performed.

---

## 7. Ranked shortlist

### #1 — Prospect Valley, 26 May 2010, NSSL1 22:23:46 UTC

**Slots A+C.** Same ESC / 1-s / NSSL1 adapter class as Goshen, but
a different day, storm, and documented low-level wind regime
(high LCL, modest 0–500 m / 0–1 km shear in the published
smoothed analysis). Launch identity is already named at
Goshen-like precision. Best single column for asking whether
Goshen 1-s hairiness is special **and** whether a candidate
Analysis transform is stable on a weaker near-ground shear
hodograph.

### #2 — OUN / Moore afternoon special, 20 May 2013

**Slot B.** The only recommended column that is **not** 1-s mobile
ESC. Coarse operational RAOB (mandatory + significant / IGRA
levels). Native header **CONFIRMED**: `USM00072357` 2013-05-20
HOUR 17 / RELTIME 1651 / NUMLEV 165. This is the sampling-class
stress test: Explorer must not silently assume high-resolution
mobile input. Hodograph *type* is still a strongly veering
tornadic-supercell environment; that is acceptable because slot C
is carried by #1.

### #3 — Dumas / Stinnett, 18 May 2010, ~2152 UTC mobile pair

**Slot A (tornadic).** Identity later **locked** by source
qualification: NSSL2 `2010, 05, 18, 21:52:18`, ~19 km south of
Dumas (see
[`2026-08-28-vortex2-source-qualification.md`](2026-08-28-vortex2-source-qualification.md)).
Second high-res mobile tornadic intercept, Texas Panhandle.

### #4 backup — 12 May 2010 Weatherford / western OK VORTEX2

Parker-included tornadic case, 14 quality soundings, 2230–0139
UTC. Weaker named-column status than #1 or #3. Use only if #3
cannot be recovered from `114.114` / `114.115` headers.

---

## 8. Why this set is useful diversity

```text
Goshen 2155     1-s mobile ESC, tornadic inflow, strongly curved
                (already in Explorer)

#1 Prospect V.  1-s mobile ESC, different storm, weaker documented
                0–500 m / 0–1 km shear, high LCL
                → A + C without changing sampling class

#2 Moore OUN    operational RAOB, 165 usable IGRA levels
                (native confirmed), Δz hundreds of metres not 1-s
                → B; sampling-class contrast

#3 Dumas 2152   1-s mobile ESC, tornadic, different geography
                → second A; hairiness among tornadic 1-s columns
```

Sampling is **not** diversified by picking three VORTEX2 mobile
launches. That is why #2 is required even though #1 already
covers A+C.

---

## 9. Sampling / provenance comparison with Goshen NSSL1 2155

| | Goshen 2155 | #1 Prospect Valley 2223 | #2 Moore special | #3 Dumas ~2152 |
| --- | --- | --- | --- | --- |
| Archive | EOL `114.114` | EOL `114.114` | NCEI IGRA v2 (`USM00072357`); Wyoming view | EOL `114.114` and/or `114.115` |
| DOI | `10.5065/D6CC0Z0Q` | same | `10.7289/V5X63K0Q` (IGRA) | `10.5065/D6CC0Z0Q` and/or `10.5065/D6H41PRG` |
| Platform | NSSL1 mobile GAUS | NSSL1 mobile GAUS | NWS Norman OUN / WMO 72357 | NSSL2 mobile GAUS (locked) |
| Native sampling | 1-s ESC | 1-s ESC (same product class) | mandatory + significant / IGRA levels | 1-s ESC |
| Approx. vertical Δz | ~5 m typical; Goshen kept dY 3.3–31.9 m | same class; exact Δz after download | median ~174 m after named GPH-order diagnostic; 165 usable knots | same class as Goshen |
| Raw vs processed | ESC after Aspen `upsonde-1s` + EOL QC | same class | IGRA merged / QC’d operational RAOB; **not** native 1-s BUFR | same class as Goshen |
| Wind variables | ESC U, V (m/s) + speed/dir + Qu/Qv | same | direction + speed; adapter must form eastward/northward | same as Goshen if ESC |
| QC flags | ESC Qu/Qv present | expected same | IGRA level flags | expected same |
| Launch identity before download | header-locked | **named to the second** (Murdzek); native header confirmed | **native header CONFIRMED** IGRA 17 UTC / RELTIME 1651; Wyoming labeled 18 UTC | **NSSL2 21:52:18 locked** (qualification research) |
| Adapter class vs I1 | I1 | reuse ESC adapter, new header identity | **new** operational-RAOB adapter; same `EnvironmentalWindProfile` consumer | reuse ESC adapter if recovered |

---

## 10. Candidate tables

### 10.1 #1 Prospect Valley / 26 May 2010 / NSSL1 2223:46

#### CASE

| | |
| --- | --- |
| Human-readable name | VORTEX2 Prospect Valley, CO supercell |
| Date | 26 May 2010 |
| Meteorological context | High-based supercell intercepted by VORTEX2 near Prospect Valley, Colorado. Parker (2014) places the case in the **nontornadic** composite for the sampling window (first near-storm sounding 2217 UTC): mission notes describe a high-based storm that failed to have significant cloud-base rotation during data collection. A brief earlier tornado report (~2110 UTC) exists; Parker’s classification is for the sampled mature period. Murdzek et al. (2020) analyze a nearly tornadic vortex (SCV 5) that did not become a significant tornado. |

Do not treat “nontornadic” as Explorer model validation.

#### SOURCE IDENTITY

| | |
| --- | --- |
| Archive / provider | NSF NCAR Earth Observing Laboratory Field Data Archive |
| Dataset title | VORTEX2: NOAA/NSSL MGAUS Radiosonde Data — EOL Sounding Composite Format, Version 1.0 |
| Dataset ID | `114.114` |
| DOI | `https://doi.org/10.5065/D6CC0Z0Q` |
| Authoritative page | `https://data.eol.ucar.edu/dataset/114.114` |
| Order form | `https://data.eol.ucar.edu/cgi-bin/codiac/fgr_form/id=114.114` |
| Primary literature | Murdzek, Markowski, Richardson, Tanamachi, 2020, *MWR*, DOI `10.1175/MWR-D-19-0288.1`; Parker, 2014, *MWR*, DOI `10.1175/MWR-D-13-00167.1` |

#### SOUNDING IDENTITY

| | |
| --- | --- |
| Platform / station | NSSL1 mobile GAUS (Murdzek: “NSSL1 MGAUS”) |
| Exact launch UTC | **2010-05-26 22:23:46** (Murdzek). Paper figures round to 2223 UTC. Confirm `UTC Release Time` in the ESC header; do not select by file ordinal. |
| Launch lat/lon/elev | Inflow, **southeast** of the Prospect Valley storm (Murdzek Fig. 2). Numeric lat/lon/elev are in the ESC header; **not copied from a map here**. |
| Sounding type | Special research mobile proximity / inflow |
| File identity before download | Expected concatenated day file by Goshen analogy: `NSSL_MGAUS_20100526.cls` (**VERIFY** after order). Target block: Site ID contains `NSSL1` **and** `UTC Release Time` `2010, 05, 26, 22:23:46`. |

#### SAMPLING

| | |
| --- | --- |
| Native temporal sampling | Campaign product: 1-s ESC after Aspen `upsonde-1s` (same class as Goshen; confirm header `Post Processing Comments`) |
| Vertical spacing | 1-s GPS; exact dY after download |
| Raw vs processed | EOL ESC QC (Loehrer-class). Murdzek additionally Barnes-interpolated winds to 50 m for **their** SRH table. Explorer source must remain native ESC after I1-class drop, not that Barnes field. |
| Wind variables | ESC U, V (m/s), speed, direction, QC |
| QC / metadata | ESC 15-line header + per-level QC expected |
| Known preprocessing | Aspen 1-s + EOL QC. Parker subjective discard applies to **his** composite membership, not to whether the native file exists. |

#### WHY USEFUL

Different storm and day from Goshen, same native sampling class.
Published Fig. 1 is a skew-T **and** hodograph of **this** launch.
Murdzek Table 2 (smoothed, **not** source): 0–500 m SRH 40.3, 0–1 km
SRH 70.0, 0–1 km bulk wind difference 6.5 m s⁻¹, 0–6 km bulk wind
difference 21.0 m s⁻¹, mixed-layer LCL 1499 m, mixed-layer CAPE
1092 J kg⁻¹. Those numbers are **not** an Explorer test oracle.
They are why the environment is a useful contrast: weaker
documented near-ground shear / higher LCL than the Goshen
inflow narrative, while still a real VORTEX2 1-s column.

Assumptions this column can break:

```text
every useful 1-s mobile sounding looks like Goshen 2155 hairiness
a 100 m bin is “obvious” because Goshen needed it
low-level SRH / ω_h recipes tuned on Goshen transfer silently
```

#### RISKS / OPEN QUESTIONS

| Risk | Note |
| --- | --- |
| Native wind QC unknown until download | Murdzek used the sounding, so usable winds are likely; G3-class inspect still required |
| Representativeness | Inflow southeast of *this* storm at 2223 UTC, not “Colorado supercells” |
| Published SRH is smoothed | Same source-vs-analysis trap as Goshen / Markowski Fig. 2b |
| Parker nontornadic label | Sampling-window classification; not a storm-lifetime binary and not a model score |
| Licensing | Dataset legal/access constraints **none**; G4 EULA-at-order remains OPEN for in-repo freeze (`49` G4). Citation + EOL acknowledgement required |
| Same adapter class as Goshen | Does **not** test operational sampling; that is #2’s job |

---

### 10.2 #2 OUN afternoon special / 20 May 2013 Moore–Newcastle

#### CASE

| | |
| --- | --- |
| Human-readable name | OUN afternoon special, 20 May 2013 (Moore / Newcastle event day) |
| Date | 20 May 2013 |
| Meteorological context | Newcastle–Moore–south Oklahoma City EF5 tornado. NWS Norman: touchdown 1456 CDT (1956 UTC) west of Newcastle; on the ground ~40 min. The recommended column is the **afternoon special RAOB**, ~3.1 h before touchdown, from a fixed NWS site ~15–20 km south of Moore. It is a local operational sounding, **not** a designed 30–40 km inflow launch. |

Do not call this “the Moore environment” without that caveat.
Do not let the EF5 outcome validate Explorer physics.

#### SOURCE IDENTITY

| | |
| --- | --- |
| Archive / provider (source of record) | NOAA NCEI Integrated Global Radiosonde Archive (IGRA) v2.2 |
| Dataset title | Integrated Global Radiosonde Archive (IGRA), Version 2 |
| Dataset ID | station `USM00072357` (Norman / Max Westheimer / OUN / WMO 72357) |
| DOI | `https://doi.org/10.7289/V5X63K0Q` |
| Authoritative page | `https://www.ncei.noaa.gov/products/weather-balloon/integrated-global-radiosonde-archive` |
| Independent view | University of Wyoming `/wsgi/sounding` TEXT:LIST, WMO 72357, labeled 18 UTC 20 May 2013 |
| Not source of record for this special | Iowa Environmental Mesonet `KOUN` CSV — R1 found **12Z 20 May and 00Z 21 May only**; afternoon special **absent** |
| Primary literature / event context | NWS Norman 20 May 2013 event page; R1 inspect in `49` §4.2. No Markowski-class published U/V hodograph of this column was found. |

This is **not** an EOL order. Slot B cannot be filled from
VORTEX2 mobile ESC without destroying the sampling contrast.

#### SOUNDING IDENTITY

| | |
| --- | --- |
| Platform / station | NWS Norman / Max Westheimer Airport (OUN). Native header lat/lon **35.1808, −97.4378**. IGRA station-list elevation **344.9 m**; sounding surface GPH **345 m** (0.1 m discrepancy). Wyoming inspect used 345 m. |
| Exact launch UTC | **CONFIRMED native header:** `#USM00072357 2013 05 20 17 1651  165 ncdc6301 ncdc6301  351808  -974378`. Wyoming labels the same afternoon column **18 UTC**. Record both labels. |
| Sounding type | Operational RAOB afternoon **special** (not the 12Z routine, not 00Z 21 May) |
| File identity | IGRA POR file `USM00072357-data.txt` (inside `.zip` / `.gz`). Select the header `2013 05 20` + nominal hour 17 / release 1651 — not by ordinal. Same-day neighbor: 12 UTC RELTIME 1108 NUMLEV 155. Next-day 00Z 21 May RELTIME 2304 is a different sounding. |

Routine 12Z 20 May is too early. 00Z 21 May is after the tornado.
Neither is this candidate.

#### SAMPLING

| | |
| --- | --- |
| Native temporal sampling | Not 1-s. IGRA stores standard + significant (+ wind) levels; IGRA v2.2 documents that native high-res BUFR, when used, is **down-sampled** to that historical resolution. |
| Vertical spacing | Native NUMLEV **165**; all **165** have usable WDIR+WSPD+GPH on this IGRA copy. Sorted-GPH diagnostic: Δz median 174 m; 144 gaps > 50 m; 2 knots in 0–200 m; 38 in 0–6 km. Envelope 0–30700 m AGL if `worldY = GPH − 345`. File order is **not** height-monotone (one −30338 m inversion). |
| Raw vs processed | Operational coded / IGRA merged product (`P_SRC`/`NP_SRC` = `ncdc6301`). Cleaner than 1-s ESC, still irregular (14 standard-p + 56 other-p + 94 non-pressure + 1 surface). R1 Wyoming “last level missing wind” does **not** hold for this IGRA copy — do not mix copies. |
| Wind variables | Direction (deg, meteorological from) and speed. Wyoming new TEXT:LIST: speed in **m/s**. MetEd copy of the same sounding: **knots**. Do not mix copies. |
| QC / metadata | IGRA level flags; 1000 hPa empty on some OUN tables (R1) |
| Known preprocessing | NWS coding + IGRA merge/QC. Not Aspen 1-s. |

#### WHY USEFUL

This is the sampling-class test. If a candidate Analysis transform
is a 100 m AGL bin-mean motivated by 1-s pendulum/quantization on
Goshen, an operational RAOB with O(10²) levels asks whether that
operator is general or a high-res-mobile treatment.

Assumptions it can break:

```text
EnvironmentalWindProfile ingest silently assumes ~1-s density
QC-drop / launch-transient logic from ESC is universal
a 100 m bin is a no-op on already-coarse RAOB
```

Hodograph *shape* is still a strongly veered tornadic-supercell
environment (high CAPE / shear indices on Wyoming/MetEd pages).
Slot C is **not** this column’s job.

#### RISKS / OPEN QUESTIONS

| Risk | Note |
| --- | --- |
| 17Z vs 18Z label split | Same afternoon special; provenance must record both |
| Not designed inflow | Local RAOB, ~3 h early, ~15–20 km south of Moore |
| Missing top wind (Wyoming) | R1 Wyoming copy; **not** present on this IGRA sounding (165/165 wind+GPH). Do not mix copies. |
| IEM is the wrong freeze source | Special absent from the R1 IEM pull |
| New adapter required | I1 ESC parser cannot read IGRA/Wyoming. Consumer object can. Adapter is **not designed** here and is **not** BL-015 product provider #2 |
| Redistribution | IGRA: NOAA/WMO free exchange; NOAA does not claim copyright (R1). Still cite DOI. Wyoming is a university redistribution of the same observed RAOB |
| Wyoming page not re-fetched this slice | R1 inspect stands; live URL **VERIFY** if used |

---

### 10.3 #3 Dumas / Stinnett / 18 May 2010 ~2152 UTC

#### CASE

| | |
| --- | --- |
| Human-readable name | VORTEX2 Dumas / Stinnett, TX Panhandle supercell |
| Date | 18 May 2010 (Parker window continues to 0147 UTC 19 May) |
| Meteorological context | VORTEX2 2010 Mission 08. Classic-to-HP tornadic supercell, Texas Panhandle. Catalog: good coordinated data collection. Parker (2014): 18 quality soundings 2152–0147 UTC (largest tornadic count in that table). Skinner et al. (2014) document a later low-level mesocyclone cycle with tornadogenesis failure during a 15-min dual-Doppler window; the storm is still Parker-tornadic. |

Tornadogenesis failure in one cycle does not validate Explorer.

#### SOURCE IDENTITY

| | |
| --- | --- |
| Archive / provider | NSF NCAR EOL |
| Datasets | **`114.114`** NSSL MGAUS ESC (117 + 186 soundings, 112 MB entire set) **and** **`114.115`** NCAR/EOL Mobile GAUS ESC (105 + 174 soundings, 96 MB entire set) |
| DOIs | `10.5065/D6CC0Z0Q` (`114.114`); `10.5065/D6H41PRG` (`114.115`) |
| Pages | `https://data.eol.ucar.edu/dataset/114.114` ; `https://data.eol.ucar.edu/dataset/114.115` |
| Order forms | `https://data.eol.ucar.edu/cgi-bin/codiac/fgr_form/id=114.114` and `.../id=114.115` |
| Primary literature | Parker 2014 Table 1; Wade, Coniglio, Ziegler 2018 *MWR* Table 1 (pairs **2152–2159** and **2255–2257** UTC, tornadic); Skinner et al. 2012 SLS manuscript (2152 UTC launch ~20 km south of Dumas — used there for **θ/q**, not as the model wind profile) |

#### SOUNDING IDENTITY

| | |
| --- | --- |
| Platform / station | VORTEX2 mobile GAUS. **NSSL1 / NSSL2 / NCAR unit unknown until ESC header.** That is why both `114.114` and `114.115` must be ordered. |
| Launch UTC | Literature pair **2152 and 2159 UTC** 18 May 2010. Exact seconds unknown. Prefer the launch whose header time is nearest 2152 UTC and whose location is inflow south of Dumas (~20 km in Skinner). The 2159 member is the pair partner, not a substitute without header/map placement. Fallback pair: 2255–2257 UTC (Wade). |
| Launch lat/lon/elev | Mobile, TX Panhandle. Header is authoritative. |
| Sounding type | Special research mobile; Wade classifies the 2152–2159 pair as tornadic near–far inflow |
| File identity before download | Expected `NSSL_MGAUS_20100518.cls` and/or NCAR day file (**VERIFY names**). Select by `UTC Release Time` ≈ 2152 UTC, not by ordinal. |

#### SAMPLING

Same ESC 1-s class as Goshen / #1. Wind U/V m/s + QC expected.
Exact low-level coverage **unknown until download**.

Skinner et al. initialized model **winds** from KAMA 0000 UTC, not
from the 2152 mobile winds. That is a caution, not proof that 2152
winds are bad. Native Qu/Qv and 0–1 km completeness are a required
inspect before this column becomes a validation fixture.

#### WHY USEFUL

Second **tornadic** 1-s mobile case, different geography and day
from Goshen and from #1. Directly addresses: “is Goshen 2155
hairiness / launch transient a one-off among VORTEX2 tornadic
inflow soundings?”

#### RISKS / OPEN QUESTIONS

| Risk | Note |
| --- | --- |
| Platform unknown | Must order NSSL **and** NCAR datasets |
| Seconds unknown | Match nearest 2152 UTC header; confirm inflow vs RFD |
| Wind quality uninspected | Skinner used KAMA for winds |
| Near vs far member | 20 km south of Dumas is near-inflow, closer than Goshen’s ~50 km SSE |
| EOL form cannot isolate one launch | Concatenated day (or window) file, as with Goshen |
| Same sampling as Goshen and #1 | Does not replace #2 |

---

### 10.4 #4 backup — 12 May 2010 Weatherford / western OK

Parker (2014) Table 1: tornadic, 14 soundings, 2230–0139 UTC.
EOL `114.114` / `114.115`, same ESC class. R1 already noted a
weaker single-sounding published identity than Goshen 2155.

**Not recommended as a primary.** Promote only if #3 cannot be
identified in delivered headers.

Launch identity: **no** Markowski/Murdzek-class named UTC+platform
was found this slice. Selection would require reading every ESC
header for 2010-05-12 / 2010-05-13 and placing launches relative
to the Weatherford storm. That is the same class of work R1
refused to skip for 10 May 2010.

---

## 11. Rejected candidates (checked, not auto-selected)

### 5 June 2009 sibling blocks in `NSSL_MGAUS_20090605.cls`

Eight other launches the same UTC day, including Bushnell/NSSL1
**22:40:06** (already rejected as not Fig. 2) and WY/NSSL2 21:43:37
(start of Parker’s Goshen window). Same storm / same environment
family. They cannot supply slot A “different day/storm” or slot B
sampling diversity. They could later test *intra-case* hairiness.
**NOT PROMOTED** as BL-045 fixtures.

### 10 May 2010 VORTEX2 (BL-042)

Parker (2014) **explicitly excluded** the day (insufficient
sounding density / coordination). No peer-reviewed named inflow
launch. Mission notes: limited data collection. Remains a later
**product** campaign pointer (BL-042), not a BL-045 validation
input.

Do not substitute OUN 18Z 10 May 2010 as “the VORTEX2 environment.”

### EOL `114.116` NWS 1-s / ARM 2-s

Authoritative, but **highest-resolution** native sampling. It does
not fill slot B (operational-like coarse RAOB). Using it would
pretend sampling diversity that is not there. **NOT PROMOTED.**

### TORUS 8 June 2019

EOL `577.020` / `577.021` exist (R1). Native NSSL CSV is a second
format; `48` deferred that until provider #2. Weaker named-column
status than Goshen / Prospect Valley. **NOT PROMOTED** for this
validation set.

### 3 May 1999 OUN; 24 May 2011 OUN 18Z

Famous operational RAOBs. 3 May 1999 00Z 4 May is during/after the
event. 24 May 2011 is the same engineering class as Moore with
less unique documentation as a companion to the already-inspected
2013 special. Moore wins slot B.

### KAMA 00Z 19 May 2010

Operational RAOB Skinner used for Dumas **model winds**. Wrong
object for #3 (not the 2152 mobile column) and a poor slot-B
pick versus the already-inspected Moore special (00Z is
during/after the Dumas event).

### 11 June 2009 SE CO; 6 June 2009 central NE; 17 May 2010 SE NM

Parker nontornadic cases. Useful in principle for slot C, but no
launch was named to NSSL1-plus-seconds precision the way Murdzek
names 2223:46. #1 already covers C with a named column.
**NOT PROMOTED** while #1 is available.

### MPEX / MiniMPEX

Wade (2018) documents many named pairs. Different campaigns and
sonde systems (InterMet vs Vaisala). Valuable later, not needed
to fill A/B/C now, and would widen adapter/provenance work.

---

## 12. Can `EnvironmentalWindProfile` accept these sources?

Research question only. **No adapter is designed here.**

```text
#1 and #3 (VORTEX2 ESC)
  Yes, after the existing I1-class ESC adapter, selecting a
  different header identity. Physics consumer unchanged.

#2 (IGRA / Wyoming operational RAOB)
  Yes, after a *separate* adapter/normalization layer:
  direction/speed → eastward/northward; height datum
  (geopotential − station elevation) named in provenance;
  drop missing winds. The consumer type does not need a new
  semantic wind-profile object.
  This is not product provider #2 (BL-015) and not a
  multi-provider UI.
```

Silent repair, mixing knots vs m/s copies, or treating IGRA as
ESC, would violate `48`.

---

## 13. Exact EOL dataset identities (recommended VORTEX2 orders)

| ID | Title | DOI | Entire-set size | Native format |
| --- | --- | --- | --- | --- |
| `114.114` | NOAA/NSSL MGAUS Radiosonde Data — ESC v1.0 | `10.5065/D6CC0Z0Q` | 112 MB | ESC ASCII only |
| `114.115` | NCAR/EOL Mobile GAUS Radiosonde Data — ESC v1.0 | `10.5065/D6H41PRG` | 96 MB | ESC ASCII only |

Live order UI confirmed 2026-08-28 for both IDs:

```text
https://data.eol.ucar.edu/cgi-bin/codiac/fgr_form/id=114.114
https://data.eol.ucar.edu/cgi-bin/codiac/fgr_form/id=114.115
```

Form fields actually present (same on both pages):

```text
Temporal Search Criteria
  Begin Date    Begin Time     format yyyymmdd hh:mm:ss
  End Date      End Time

Output File Format
  EOL Sounding Composite Format (ASCII)     ONLY choice

Output Archive/Compression Method
  None
  GNU Zip (.gz)
  Unix Tar + GNU Zip (.tar.gz)
  Unix Tar only (.tar)
  Info-ZIP (Windows-style .zip)

Email Address
Affiliation   dropdown:
  NCAR/UCAR
  US University
  US Government Agency
  US Commercial Company
  Non-US University
  Non-US Government Agency
  Non-US Commercial Company
  Other
```

**Not present** on the fetched forms:

```text
platform / station picker          none
individual-launch picker           none
variable selection                 none
grouping / aggregation options     none
```

Default criteria retrieve the **entire** dataset. The form text
asks for a small time window.

EOL emails a **status report** when the order is processed and
makes the subset available for download. G1 for Goshen delivered a
**concatenated** native `.cls` for the calendar-day subset, plus
README / citation material. Individual launches are selected
**after** download by ESC header, not in the form.

EULA / click-through: **VERIFY IN FORM** at submit. G1 recorded
that an EULA click occurs; the order-form HTML fetched this slice
does not show the EULA text before submit. Dataset metadata:
legal constraints none, access constraints none. That is not a
substitute for the click-through text (`49` G4 still OPEN).

---

## 14. DOWNLOAD THIS

### 14.1 EOL order for #1 Prospect Valley (required)

**Order dataset `114.114` only** (paper identity is NSSL1).

1. Open `https://data.eol.ucar.edu/dataset/114.114`.
2. Open **Order / download** → live form
   `https://data.eol.ucar.edu/cgi-bin/codiac/fgr_form/id=114.114`.
3. **Date range** (format `yyyymmdd hh:mm:ss`):

   ```text
   Begin Date   20100526
   Begin Time   00:00:00
   End Date     20100526
   End Time     23:59:59
   ```

   22:23:46 UTC is still 26 May. Do not order the whole campaign.

4. **Platform / sounding selection:** none in the form. Ignore.
5. **File type / data format:** leave the only option,
   **EOL Sounding Composite Format (ASCII)**.
6. **Output format:** same (there is no second format).
7. **Compression:** **Info-ZIP (Windows-style .zip)** unless you
   prefer `.gz`. Do not choose “None” for a day file unless the
   form requires it to preview size — zip is the practical default.
8. **Grouping/aggregation:** not offered.
9. **Variables:** not offered; ESC includes the full 21 fields.
10. **All files vs platform:** not offered. Temporal subset only.
11. **Checkboxes:** affiliation + email required. EULA **VERIFY IN
    FORM** at submit. No other options were listed on the form.
12. **Expected size:** entire `114.114` is 112 MB. One UTC day is
    **UNKNOWN**; Goshen’s 9-block day file was a small ASCII
    extract. Expect a few MB, not 112 MB.
13. **What arrives:** EOL status email + download package
    containing concatenated ESC (expected name
    `NSSL_MGAUS_20100526.cls` — **VERIFY**) and a README with
    the dataset citation.
14. **What Explorer needs later:** the `.cls` (or uncompressed
    ESC) **and** the README. From the concatenated stream, keep
    the block whose header has `NSSL1` and
    `UTC Release Time` `2010, 05, 26, 22:23:46`.
    Do not pick “the NSSL1 sounding” if another NSSL1 block exists
    that day.

If that header is missing, **do not guess**. Then order `114.115`
with the same date window (unlikely if Murdzek’s NSSL1 label is
right) or stop.

### 14.2 EOL order for #3 Dumas ~2152 (required)

**Order `114.114` and `114.115` with identical time windows.**
Platform is unknown.

1. Repeat §14.1 steps on **both** forms:
   `.../id=114.114` and `.../id=114.115`.
2. **Date range:**

   ```text
   Begin Date   20100518
   Begin Time   00:00:00
   End Date     20100518
   End Time     23:59:59
   ```

   2152 UTC is on the 18th. Parker’s window runs past 0000 UTC
   19 May; that is **not** required to recover the 2152–2159 pair.
   If those headers are absent, extend:

   ```text
   End Date     20100519
   End Time     03:00:00
   ```

   and look for 2255–2257 as Wade fallback. **VERIFY** whether
   EOL inclusive windows need the extra day; do not invent other
   form fields.
3. Format / compression / email / affiliation: same as §14.1.
4. Expected day-file names: `NSSL_MGAUS_20100518.cls` and an NCAR
   analogue (**VERIFY**).
5. After download: list every `UTC Release Time` in both files.
   Keep the block nearest **2152 UTC** whose location is inflow
   (south of Dumas if consistent with Skinner). Record platform
   from `Release Site Type/Site ID`.

### 14.3 EOL order for #4 backup (only if #3 fails)

Same two datasets, window:

```text
Begin   20100512 00:00:00
End     20100513 03:00:00
```

No named header. This order is **not** requested unless #3
identity fails.

### 14.4 IGRA / Wyoming for #2 Moore (not an EOL form)

EOL cannot supply this coarse RAOB.

**Source of record — IGRA v2.2**

1. Read
   `https://www.ncei.noaa.gov/data/integrated-global-radiosonde-archive/doc/igra2-readme.txt`.
2. Confirm station id `USM00072357` in `igra2-station-list.txt`.
3. Download the period-of-record sounding file from the
   web-access tree:

   ```text
   https://www.ncei.noaa.gov/data/integrated-global-radiosonde-archive/access/data-por/
   ```

   Filename pattern: `USM00072357-data.txt.zip` (or `.gz` on the
   FTP mirror `https://www.ncei.noaa.gov/pub/data/igra/` →
   `data/data-por/`). **VERIFY** the exact suffix on the live
   index; do not invent a third name.
4. Uncompress. There is **no** date filter on NCEI’s side; the
   file is the whole station POR.
5. Inside the text, select the sounding whose header is
   **2013-05-20**, nominal hour **17**, release **1651**.
6. Also keep `doc/igra2-data-format.txt` from the same archive
   tree.

**Independent view — Wyoming** (optional cross-check, not a
second freeze if IGRA is kept):

```text
https://weather.uwyo.edu/wsgi/sounding?datetime=2013-05-20%2018:00:00&id=72357&src=FM35&type=TEXT:LIST
```

R1 used this URL. **VERIFY** it still returns the afternoon
special. Speed on the new TEXT:LIST is m/s. Do not use the MetEd
knots copy as source of record.

**Do not use IEM `KOUN` CSV** for this special.

---

## 15. What to send after download (do not import into git yet)

Do **not** commit native campaign bytes until G4 / license is
settled. This slice does not import anything.

Send (or keep outside the repo) **only**:

| Case | Files |
| --- | --- |
| #1 Prospect Valley | EOL `114.114` day package for 2010-05-26: concatenated ESC + README/citation. Identity note: header `NSSL1` + `2010, 05, 26, 22:23:46`. |
| #3 Dumas | EOL `114.114` **and** `114.115` day packages for 2010-05-18: both concatenated ESC files + READMEs. Plus a short list of all `UTC Release Time` / Site ID rows found. |
| #2 Moore | Uncompressed `USM00072357-data.txt` **or** the POR zip plus the extracted 2013-05-20 17 / 1651 block; plus `igra2-data-format.txt`. Optional: Wyoming TEXT:LIST save of the 18 UTC table. |
| All EOL orders | The status email and any EULA text accepted at click-through (needed for G4). |

Not needed: entire 112 MB / 96 MB campaign extracts; `114.116`;
IEM CSV; published PNG hodographs as data.

---

## 16. NOT PROMOTED (DURING protocol)

Recorded here so they are not only in chat:

| Idea | Why not a new BL |
| --- | --- |
| Dedicated “IGRA adapter” backlog item | Need is real for #2, but it is future ingest work, not a new research question. BL-015 remains product provider #2. Designing the adapter now would be implementation. Named in §12 and BL-045. |
| `114.116` as a third sampling class | Authoritative but still high-res; would fake slot B. |
| Same-day Goshen siblings as BL-045 cases | Intra-case only; wrong diversity. |
| Using Murdzek/Markowski smoothed SRH as validation oracles | Repeats the Goshen mistake `53` already forbade. |
| Analysis implementation / 100 m lock | Forbidden by `55`; this file does not reopen it. |

---

## 17. Backlog reconciliation

```text
BL-037   still RESEARCH NEEDED
         this file only names future validation inputs
         it does not accept/qualify/replace the 54 candidate
         it does not authorize BL-010

BL-045   candidates are now named (this file)
         #1/#2/#3 native identity later confirmed in
         source-qualification research
         still not imported, not production fixtures
         still not I1/I2 work; IGRA adapter still NOT authorized

BL-021   Moore remains a later PRODUCT case pointer
         dual role with BL-045 #2 is allowed and must stay
         distinct (product curated case ≠ validation input)

BL-042   10 May 2010 remains later PRODUCT campaign pointer
         REJECTED as BL-045 validation input

BL-010 / 55 / 54 / 53   unchanged
```

---

## 18. Compact lock-in

```text
ADDITIONAL VALIDATION INPUTS (NAMED, NOT IMPORTED)

#1  Prospect Valley 2010-05-26 NSSL1 22:23:46
    EOL 114.114   slots A+C

#2  OUN afternoon special 2013-05-20
    IGRA USM00072357 HOUR 17 / RELTIME 1651 (Wyoming 18 UTC label)
    slot B; native identity + source column CONFIRMED

#3  Dumas/Stinnett 2010-05-18 NSSL2 21:52:18
    EOL 114.114   slot A (tornadic)
    identity LOCKED in source-qualification research

#4  12 May 2010 Weatherford   backup only

IMPLEMENTATION          NO
IMPORT / GOLDEN         NO
ANALYSIS PROFILE        NOT AUTHORIZED
OPERATOR CHOICE         none
BL-037                  still open
```

---

## 19. Implementation

This document does not include implementation.
Production `src/**` remains unchanged.
No sounding bytes are added to the repository.
No Analysis profile, no Δz default, no adapter, no golden edit.
)
