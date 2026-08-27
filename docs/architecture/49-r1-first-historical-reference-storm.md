# R1 First Historical Reference Storm

**Status:** POST-V1 RESEARCH / SELECTION SoT /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** close `48` research gate R1 by selecting the
first observed-RAOB historical wind column for the
Explorer historical sandbox. Not an adapter. Not a
frozen production fixture. Not radar. Not
thermodynamics. Not Bunkers. Not Guided. Not a V1
reopen. Not observed-storm reconstruction.
**Physics:** `48` remains the provider-neutral contract.
`EnvironmentalWindProfile` remains the kinematic sink.
Model class remains prescribed kinematic laboratory
(`30`). Exactly seven `V_total` operands. Prescribed Ω
unchanged. DEMO knots and DEMO `C` are not modified by
this file.
**Implementation:** none. Docs-only. Production `src/**`
MUST remain unchanged. This file does not authorize an
adapter, an in-repo fixture commit, a DEMO_SCENARIO
change, a Guided retarget, Bunkers, or thermodynamics.

Predecessor contract:

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
```

Related still-binding SoTs (not replaced):

```text
docs/architecture/44-long-term-source-and-reconstruction-boundary.md
docs/physics/04-environmental-wind-profile.md
docs/physics/07-storm-relative-wind.md
docs/architecture/30-model-class-decision.md
docs/architecture/38-v1-scope-checkpoint.md
```

Keep these roles distinct:

```text
CURRENT FACT
NEW PROJECT DECISION
RESEARCH GATE
ANTI-CLAIM
```

This document did **not** change production code.
It does **not** add a sounding file to `src/**` or test
directories.

---

## 1. Why this selection exists

`48` locked provider class **observed radiosonde / RAOB**
and left the exact archive, sounding identity, native
format, license, and in-repo freeze policy as research
gate R1.

The immediate engineering object after this file is one
frozen observed wind column that can be normalized into
the existing `EnvironmentalWindProfile` and used as the
laboratory environment of a later sandbox.

This file answers: **which historical case and which
sounding** should be that first column.

Selection priority, inherited from `48` and this task:

```text
clean first real-data pipeline
scientifically defensible observed provenance
independent validation evidence for unit/sign errors
reproducible archive identity
future reference-storm longevity is secondary
meteorological spectacle is not a criterion
```

---

## 2. Sources searched

External research was performed against primary archives
and case literature. Search-result snippets were not
treated as data evidence. Where a file could be fetched
during research, it was inspected. Where an archive
required an interactive order / EULA, that barrier is
recorded rather than guessed away.

### 2.1 Archives and catalogs actually opened

| Source | What was verified |
| --- | --- |
| NSF NCAR EOL dataset `114.114` | NSSL MGAUS VORTEX2 ESC dataset exists; DOI `10.5065/D6CC0Z0Q`; legal/access constraints listed as none; order form is live |
| NSF NCAR EOL dataset `114.115` | NCAR MGAUS companion ESC dataset; DOI `10.5065/D6H41PRG` |
| NSF NCAR EOL dataset `114.116` | Multi-network highest-resolution composite, 4697 soundings |
| EOL VORTEX2 2009 / 2010 field catalogs | Catalogs are live; 10 May 2010 is Mission 02 (Seminole); research-product date pages do not list individual sounding files |
| EOL VORTEX2 dataset order form | `https://data.eol.ucar.edu/cgi-bin/codiac/fgr_form/id=114.114` requires email + affiliation; native format is ESC ASCII only |
| EOL data policy | Open sharing after QC; citation + acknowledgement required |
| University of Wyoming new sounding server | Legacy `cgi-bin/sounding` returns 404; replacement is `/wsgi/sounding` |
| Wyoming `/wsgi/sounding` | **OUN 20 May 2013 18 UTC profile downloaded and inspected** |
| Iowa Environmental Mesonet RAOB | Public-domain terms; KOUN CSV for 20 May 2013 downloaded |
| NOAA NCEI IGRA v2 | Station `USM00072357` period-of-record zip downloaded; headers for 20 May 2013 inspected |
| NWS Norman event page for 20 May 2013 | Tornado timeline and radar/survey pointers |
| MetEd copy of Wyoming OUN 18Z 20 May 2013 | Independent published TEXT:LIST table (knots) |
| TORUS_2019 EOL datasets `577.020` / `577.021` | NSSL CSV and multi-network ESC composites exist; legal/access constraints none |

EOL REST (`data.eol.ucar.edu/zinc/rest/dataset/114.114`)
returned `401 Missing API Key`. Direct file listing of
individual VORTEX2 ESC launches was **not** possible
without completing the interactive order. That is a
remaining I1 obtainability step, not an identity vacuum
for the selected sounding.

### 2.2 Case literature used as identity / validation
evidence

| Work | Role |
| --- | --- |
| Parker (2014), *MWR* | VORTEX2 composite cases; **explicitly excludes 10 May 2010** for insufficient sounding density |
| Markowski et al. (2012), *MWR* | Goshen pretornadic kinematics; **published skew-T and storm-relative hodograph of NSSL1 2155 UTC** |
| Dawson / Marquis / Potvin EnKF papers | Same 2155 UTC NSSL1 sounding used as homogeneous base state, ~50 km SSE of the updraft |
| Wurman et al. (2012), *BAMS* | VORTEX2 campaign overview; 10 May listed as outbreak of interest with fast motion |
| NSSL VORTEX2 news, 10 May 2010 | Pre-storm / in-storm / post-storm balloons; coordinated sampling was difficult |
| VORTEX2 2010 field catalog Mission 02 | East-central OK / Seminole; limited data collection |
| Coffer / Parker follow-ons | Parker composite environments, not a substitute for one raw sounding |
| NWS Norman 20 May 2013 event page | Moore/Newcastle tornado 1956–2035 CDT (UTC+5 in May) |
| Waugh (2020) TORUS_2019 NSSL radiosonde DOI | Confirms CSV mobile soundings exist for TORUS 2019 |

Published sounding plots and hodographs are **not**
golden truth for Explorer diagnostics. They are
independent evidence that an ingestion / sign / unit
error would be visible. `48` §12 still forbids
climatological thresholds as a test oracle.

---

## 3. Candidate pool

Five candidates were investigated. Two were required by
the task. Three were added because they could beat the
required pair for a **first adapter**.

| ID | Case | Why it is in the pool |
| --- | --- | --- |
| A | 10 May 2010 Oklahoma / VORTEX2 | Required. Cyclic tornadic supercell; mobile soundings; rich later datasets |
| B | 20 May 2013 Moore / Newcastle, OK | Required. Well-documented conventional archival comparison |
| C | 5 June 2009 Goshen County, WY / VORTEX2 | Best-sampled VORTEX2 tornadic supercell with a published named inflow sounding |
| D | 18 May 2010 Dumas / Stinnett, TX / VORTEX2 | Parker (2014) maximum sounding count (18) among tornadic cases |
| E | 8 June 2019 northwest KS / TORUS | Newer proximity-sounding campaign; UAS + radar future value |

Considered and not promoted to the scored five:

```text
3 May 1999 OUN
  famous operational sounding; 00Z 4 May is during/after
  the event; weaker first-adapter proximity than Moore 18Z

24 May 2011 OUN 18Z
  similar operational-RAOB pattern to Moore; less
  uniquely documented as a first fixture

12 May 2010 VORTEX2 (Weatherford / western OK)
  Parker-included (14 soundings); weaker single-sounding
  published identity than Goshen 2155 UTC
```

---

## 4. Candidate evidence

### 4.1 Candidate A — 10 May 2010 Oklahoma / VORTEX2

1. **Event:** VORTEX2 2010 Mission 02. Fast-moving cyclic
   tornadic supercells, east-central Oklahoma (Seminole
   intercept). A dominant cell tracked roughly Norman →
   I-40 toward Fort Smith. NWS Norman later records a
   35-tornado local total that day, including two EF4s
   in the Oklahoma City metro.
2. **Sounding platform:** VORTEX2 mobile GAUS (NSSL1/2
   and NCAR MGAUS). Operational OUN RAOB also exists that
   day and is a different object.
3. **Launch time:** NSSL news states balloons were
   launched in the pre-storm, in-storm, and post-storm
   environment. **No peer-reviewed table identifies one
   inflow launch as the environmental column for this
   storm.** Exact UTC times are in ESC headers, which
   were not downloadable without the EOL order form.
4. **Launch location:** mobile; not a fixed station.
   Exact lat/lon would come from the ESC header.
5. **Temporal proximity:** launches spanned the event.
   Fast storm motion (50–60 mph) compressed the useful
   window.
6. **Spatial / representativeness:** Parker (2014) needed
   ≥8 near-storm soundings and a mappable base state.
   **10 May 2010 was explicitly eliminated** (footnote 2)
   together with 9 June 2009 and 13 June 2010. Mission
   notes: “limited data collection”; “difficult to obtain
   coordinated observations.” Closest-to-tornado is
   therefore a bad selection rule here.
7. **Type:** special research mobile proximity soundings,
   plus separate operational RAOB.
8. **Availability today:** dataset `114.114` / `114.115`
   / `114.116` landing pages are live and orderable.
   Individual files were **not** inspected in R1 because
   EOL requires an interactive order.
9. **Archive:** NSF NCAR EOL Field Data Archive.
10. **Landing:** `https://data.eol.ucar.edu/dataset/114.114`
    DOI `10.5065/D6CC0Z0Q`.
11. **Format:** ESC ASCII, 15-line header + 1-s data
    records with QC flags.
12. **Variables:** time, pressure, T, Td, RH, U, V
    (m/s), speed, direction, ascent, lat/lon, altitude,
    QC. Thermodynamics present (bonus only).
13. **Wind coverage:** campaign-typical tropopause
    reach; not verified for a specific 10 May file.
14. **Vertical sampling:** native ~1 s (~5 m).
15. **QC:** NCAR/EOL GAUS QC (Loehrer-class gross-limit
    and rate checks). Subjective discard of storm-hit /
    erratic profiles is documented by Parker for the
    composite, which **did not include this day**.
16. **Wind units:** U/V already m/s in ESC; meteorological
    eastward / northward.
17. **Height:** ESC altitude in meters; launch elevation
    in the header. Adapter would subtract launch
    elevation for world Y (implied flat ground).
18. **Normalization difficulty:** moderate–high (ESC +
    QC drop + 1-s density), same adapter class as C/D.
19. **Redistribution:** dataset metadata Legal
    Constraints **none**, Access Constraints **none**.
    Download still requires EOL order / EULA click.
    In-repo freeze status is **not fully settled** until
    the EULA accepted at order time is recorded. Open
    NSF/EOL sharing + citation is the durable policy.
20. **Provenance:** DOI + header launch time/location
    are reproducible **after** the file is obtained.

**Independent validation:** Burgess et al. conference
manuscripts and NWS radar papers describe the outbreak
environment in bulk (CAPE 3000–4000 J kg⁻¹, 0–6 km
shear 30–40 m s⁻¹). Those numbers are **storm-environment
summaries**, not a sounding-specific hodograph of one
launch. No Markowski-class published skew-T/hodograph
of a named 10 May mobile sounding was found.

**Future value:** high in the large (NOXP / OU-PRIME /
WSR-88D / photogrammetry). Low as a **first** fixture
because the environmental column itself is not already
scientifically named.

**10 May special check — most appropriate sounding if
this case were chosen later:**

```text
Prefer a pre-convective or distant-inflow launch
east of the dryline, not an in-storm or rear-flank
launch, and not “closest to a tornado.”

R1 cannot name that launch. The remaining gate is:
order 114.114 + 114.115 for 2010-05-10, read every
ESC header, place launches relative to KTLX/KOUN
reflectivity, and keep only a documented inflow
column. Parker’s exclusion means that work has not
already been done for a composite.
```

Do not silently substitute OUN 18Z 10 May 2010 as
“the VORTEX2 environment.” That would be a different
source class and a different location.

---

### 4.2 Candidate B — 20 May 2013 Moore / Newcastle, OK

1. **Event:** Newcastle–Moore–south Oklahoma City EF5
   tornado. NWS Norman: touchdown 1456 CDT
   (1956 UTC) west of Newcastle; on the ground ~40 min
   until ~1535 CDT (2035 UTC); path ~14 mi.
2. **Sounding platform:** NWS Norman / Max Westheimer
   (OUN / WMO 72357 / IEM `KOUN`). Not a mobile
   proximity sounding.
3. **Launch time:** three observed columns exist that
   day; they are **not** interchangeable.

| Source | Identity found in R1 |
| --- | --- |
| IGRA `USM00072357` | `2013 05 20 12` (routine); **`2013 05 20 17` nominal, release 16:51 UTC, 165 levels**; `2013 05 21 00` |
| Wyoming `/wsgi/sounding` | **18 UTC 20 May 2013** profile downloaded; station elev 345 m, 35.18°N, 97.44°W |
| IEM `KOUN` CSV | **12Z 20 May and 00Z 21 May only.** The afternoon special is **absent** from this pull |
| MetEd Wyoming copy | labeled `18Z 20 May 2013`, winds in knots |

The Wyoming “18Z” table and the IGRA 17 UTC /
16:51 UTC special are the same afternoon column
under different cycle labels. IEM currently cannot
be treated as a source of that special.

4. **Launch location:** OUN 35.18°N, 97.44°W, elev
   345 m MSL.
5. **Temporal proximity:** 16:51 UTC launch is ~3.1 h
   before touchdown. Better than 12Z; still a morning-
   to-early-afternoon operational column, not a
   storm-following inflow launch.
6. **Spatial proximity:** OUN is ~15–20 km south of
   Moore. The storm initiated near Chickasha and
   became tornadic west of Newcastle, then crossed
   Moore. OUN is local, **not** a designed 30–40 km
   inflow sounding. Do not call this “the Moore
   environment” without that caveat.
7. **Type:** operational RAOB, including one afternoon
   special. No VORTEX-style mobile proximity network.
   RAP/RUC analysis columns exist in the literature
   and are **not** observed RAOB.
8. **Availability today:** **yes**, independently from
   Wyoming (inspected) and IGRA (header inspected).
   IEM is the wrong freeze source for the special.
9. **Archive:** Wyoming Atmospheric Science Radiosonde
   Archive; NOAA NCEI IGRA v2 DOI `10.7289/V5X63K0Q`.
10. **Landing:**
    `https://weather.uwyo.edu/wsgi/sounding?datetime=2013-05-20%2018:00:00&id=72357&src=FM35&type=TEXT:LIST`
    and IGRA `USM00072357` POR file.
11. **Format:** Wyoming TEXT:LIST (new server uses
    `SPED` in **m/s**, not knots); IGRA native text;
    IEM CSV for the routine 12Z/00Z only.
12. **Variables:** p, geopotential height, T, Td, RH,
    mixing ratio, direction, speed. Thermodynamics
    present (bonus).
13. **Wind coverage:** surface 966 hPa / 345 m through
    ~10 hPa / 31 km; **last Wyoming level has missing
    wind**. Adapter must drop that level (`48` §7).
14. **Vertical sampling:** mandatory + significant
    levels; tens of wind knots, not 1-s.
15. **QC:** 1000 hPa empty; mixed mandatory/significant
    / wind-only levels in IEM 12Z. Afternoon Wyoming
    table is cleaner but still irregular.
16. **Wind units:** Wyoming new TEXT:LIST is
    direction deg / speed m/s. MetEd copy of the same
    sounding is knots. Adapter must not mix those
    copies. Meteorological direction (from).
17. **Height:** geopotential height MSL. Station
    elevation 345 m. Adapter policy:
    `world Y = HGHT − 345 m` (implied flat ground),
    named in provenance.
18. **Normalization difficulty:** **low.** Direction/speed
    → eastward/northward; drop missing winds; already
    meter heights.
19. **Redistribution:** IEM materials are public domain
    (IEM disclaimer). IGRA is NOAA/WMO free exchange;
    NOAA does not claim copyright. Wyoming is a
    university redistribution of the same observed
    RAOB; freeze the IGRA or Wyoming bytes with
    citation. This is the **clearest** legal freeze
    among the five.
20. **Provenance:** WMO 72357 + IGRA header (nominal
    17 UTC, release 1651) + Wyoming 18 UTC URL are
    citable. Record both labels.

**Independent validation:** Wyoming/MetEd skew-T and
indices (Showalter −5.2, Totals 54.6, MUCAPE ~3316 J
kg⁻¹ on the new Wyoming page; MetEd CAPE 3135 J kg⁻¹
on the knots copy — **same sounding, different index
package, not a wind-profile oracle**). NWS event page
and published radar papers describe the storm, not
this column’s U/V. Bulk Richardson 27.19 on the MetEd
copy is an index, not an Explorer diagnostic.

**Future value:** KTLX / KOUN / PX-1000 radar papers,
NWS damage survey, NIST/FEMA reports. No mobile
mesonet / dual-Doppler research armada comparable to
VORTEX2. Strong as a **later operational-RAOB
companion**, weak as the only long-term reference storm.

**Moore special check:**

```text
Routine 12Z 20 May 2013     too early; do not use as
                            the Moore environment
Afternoon special           IGRA 17 UTC / 16:51 release;
                            Wyoming labeled 18 UTC
00Z 21 May                  after the tornado
Mobile proximity sounding   none found
Model/RAP column            not observed RAOB; not
                            provider #1
```

---

### 4.3 Candidate C — 5 June 2009 Goshen County, WY / VORTEX2

1. **Event:** VORTEX2 2009 Goshen County, Wyoming
   tornadic supercell. The campaign’s most completely
   analyzed tornadic intercept (Markowski, Wurman,
   Kosiba, Atkins, EnKF papers).
2. **Sounding platform:** NSSL1 mobile GAUS,
   Vaisala RS92-SGP. One of four contemporaneous
   VORTEX2 sounding units.
3. **Launch time:** **2155 UTC 5 June 2009.** Repeated
   in Markowski et al. (2012) Fig. 2 and in multiple
   EnKF papers as “NSSL1 2155 UTC.” Parker Table 1
   lists quality mature-storm soundings for this case
   from 2143–0105 UTC; 2155 sits inside that window.
4. **Launch location:** southeast of the storm, about
   **50 km south-southeast of the updraft** (EnKF
   papers; Markowski Figs. 1 and 4 mark the point).
   Exact lat/lon/elev are in the ESC header, not
   inspected in R1.
5. **Temporal proximity:** near tornadogenesis, not
   pre-convective. That is intentional: the published
   environmental column is the **inflow at maturity**,
   which is what later modeling used.
6. **Spatial / representativeness:** Parker near-inflow
   is ~30–40 km; far-inflow ~70–100 km. 50 km SSE is
   inflow, not rear-flank or “next to the tornado.”
   Near-storm modification of low-level shear is
   documented in VORTEX2 composites; this sounding
   may already include some of that. It is still the
   column the literature treats as **the** Goshen
   environment. That caveat belongs in provenance,
   not as a reason to pick a closer tornado sounding.
7. **Type:** special research mobile proximity sounding.
8. **Availability today:** same EOL NSSL MGAUS dataset
   as A (`114.114`). Identity is known from papers;
   **bytes were not downloaded** (order form).
9. **Archive:** NSF NCAR EOL; DOI `10.5065/D6CC0Z0Q`.
10. **Landing:** `https://data.eol.ucar.edu/dataset/114.114`
    order form with temporal subset 20090605.
11. **Format:** ESC ASCII.
12. **Variables:** same as §4.1 item 12. Wind +
    thermodynamics in one file (thermo unused by `48`).
13. **Wind coverage:** published hodograph is labeled
    to 6 km AGL and beyond on the plot; tropopause
    reach is expected for a successful GAUS flight.
    Confirm at I1 file inspection.
14. **Vertical sampling:** ~1 s after Aspen processing
    (`upsonde-1s` in the ESC sample header).
15. **QC:** EOL GAUS QC; Parker performed additional
    subjective review for the 16 soundings kept from
    this case. EnKF papers used this launch as a model
    base state after a **documented thermodynamic
    boundary-layer modification** — Explorer I1 must
    ingest the **raw observed wind**, not the modified
    model sounding.
16. **Wind units:** ESC U/V in m/s; U = eastward,
    V = northward. Adapter can take U/V directly
    after QC. Speed/direction are also present.
17. **Height:** ESC altitude meters; launch elevation
    in header. Proposed I1 `heightDatum`:
    `reported altitude minus launch elevation,
    treated as world Y (implied flat ground)`.
18. **Normalization difficulty:** moderate. ESC parse +
    QC drop + 1-s density. Units are already SI
    atmospheric components — **easier than Wyoming
    knots copies, dirtier vertically than Moore.**
    That is the `48` dirty-column test.
19. **Redistribution:** same as A. Open dataset;
    order/EULA at download; citation required.
    In-repo versus hash-gitignore is an I1 recording
    step, not a reason to reject the scientific
    selection.
20. **Provenance:** DOI + NSSL1 + 2155 UTC + header
    lat/lon is a complete `48` §4.2 record.

**Independent validation (use carefully):**

| Evidence | What it can check | What it cannot |
| --- | --- | --- |
| Markowski et al. (2012) Fig. 2a skew-T | gross T/Td/wind-barb shape | Explorer does not consume T/Td |
| Fig. 2b storm-relative hodograph | **ground-relative shape after adding back C**; heights labeled km AGL | they subtracted **observed** C = (10.5, −1.3) m s⁻¹ and smoothed with a 5-step Leise filter |
| Fig. 2b 0–1 km SRH, 0–3 km SRH, 0–6 km shear | order-of-magnitude / sign literacy | **not** a golden Explorer test; different C, smoothing, and layer recipe |
| EnKF papers using the same launch | confirms identity and inflow geometry | they modified the thermodynamic BL; wind profile is the raw sounding |

I1 golden tests should freeze **native ESC → normalized
eastward/northward vs height**, plus project unit/sign
maps. Published SRH/shear numbers are labeled
cross-checks, not oracles (`48` §12).

**Future value:** unmatched among the five. Dual-Doppler
(DOW6/7, NOXP, XPOL, KCYS), mobile mesonet, StickNet,
photogrammetry, EnKF analyses, Parker 16-sounding
near/far inflow set. This is a long-term reference
storm without requiring the first adapter to consume
any of those datasets.

**VORTEX2 special check:** the actual archive is EOL
`114.114` (NSSL) / `114.115` (NCAR), ESC, 15-line
headers identifying each launch by UTC time and
lat/lon. Files remain orderable in 2026. Individual
launch identity is therefore recoverable. R1 selects
NSSL1 2155 UTC from the literature rather than
“whatever file is closest to the tornado.”

---

### 4.4 Candidate D — 18 May 2010 Dumas / Stinnett, TX / VORTEX2

1. **Event:** VORTEX2 2010 Mission 08. Classic-to-HP
   tornadic supercell, Texas Panhandle. Catalog:
   “good coordinated data collection.”
2. **Platform:** VORTEX2 mobile GAUS (NSSL + NCAR).
3. **Launch times:** Parker Table 1: 18 quality
   soundings **2152–0147 UTC**. Nowotarski/Coffer-type
   near/far pairs include 2152–2159 and 2255–2257 UTC.
4. **Location:** mobile, TX Panhandle.
5. **Temporal / spatial:** designed near/far inflow
   pairs exist in later radiosonde-comparison papers.
6. **Type:** special research mobile.
7. **Availability:** same EOL datasets as A/C.
8–20. **Format / units / height / license:** same ESC
   adapter class as C.

**Why it does not beat Goshen for I1:** more soundings,
but **no single launch is the published environmental
hodograph** the way NSSL1 2155 UTC is. First-adapter
identity would still require choosing among 18 files.
Goshen already has that choice made in the literature.

**Future value:** high, slightly behind Goshen in
canonical papers.

---

### 4.5 Candidate E — 8 June 2019 northwest Kansas / TORUS

1. **Event:** TORUS 2019. Two nearby supercells; one
   dissipated, the second became cyclic tornadic
   (published 2024 *MWR* analysis).
2. **Platform:** NSSL mobile RS41-SGP (Waugh).
3. **Launch times:** exist in EOL; the 2024 paper uses
   mobile soundings but does not replace Goshen 2155
   as a community-standard named column.
4. **Availability:** DOI `10.26023/MDEM-SG4J-5P10`
   (CSV) and composite `10.26023/FTM8-3XNM-KH0F` (ESC).
   Legal/access constraints none. Same EOL order
   pattern.
5. **Format:** NSSL native CSV **or** ESC composite —
   a second native format, which `48` §5.2 deferred
   until provider #2.
6. **Future value:** UAS, P-3 tail Doppler, mobile
   mesonet. Strong later campaign, **not** the smallest
   first adapter.

---

## 5. Comparison matrix

| Case | Sounding type | Spatial / temporal proximity | Raw data accessible? | Wind profile quality | Normalization difficulty | Independent validation | Future dataset richness | Fixture / reproducibility | Major caveat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A 10 May 2010 VORTEX2 | mobile research | mixed; poorly coordinated | dataset yes; **individual file not inspected** | unknown until order | moderate (ESC) | bulk outbreak summaries only | high radar | DOI yes; launch unspecified | Parker **excluded** the case; no named inflow file |
| B 20 May 2013 Moore | operational RAOB + afternoon special | ~15–20 km, ~3 h before tornado | **Wyoming inspected; IGRA header inspected; IEM missing the special** | good mandatory/significant; missing top wind | low | skew-T / indices; not a published hodograph of U/V | radar/survey, little in-situ armada | IGRA + Wyoming identity | not a designed inflow sounding; 17Z vs 18Z label split |
| C 5 Jun 2009 Goshen | mobile research inflow | ~50 km SSE, near tornadogenesis | dataset orderable; **bytes not downloaded** | expected high-res QC’d GAUS | moderate (ESC, 1-s, QC drop) | **published skew-T + hodograph of this launch** | **highest** | DOI + NSSL1 + 2155 UTC | EOL order/EULA; near-storm modification possible |
| D 18 May 2010 TX Panhandle | mobile research | designed near/far | same EOL as C | high (18 Parker soundings) | moderate (ESC) | composite / pair papers, not one famous plot | high | DOI yes; which launch? | first file not pre-named |
| E 8 Jun 2019 TORUS | mobile research | designed proximity | EOL CSV/ESC orderable | high | extra CSV format | 2024 case paper | UAS + P-3 | DOI yes | newer; second format; weaker named-column status |

### Scores (not collapsed)

| Case | A. First-adapter suitability | B. Scientific defensibility | C. Future reference-storm value |
| --- | --- | --- | --- |
| A 10 May 2010 | Low | Low–medium | High |
| B Moore 2013 | **High** (engineering) | Medium | Medium |
| C Goshen 2009 | **High** (once ordered) | **High** | **High** |
| D 18 May 2010 | Medium | High | High |
| E TORUS 2019 | Medium | Medium | High |

Moore wins **engineering access today**. Goshen wins
**scientific identity + dirty-column test + longevity**.
`48` asked the first sandbox to prove dirty observed
RAOB, not a convenient operational table. That selects
C over B for provider #1.

---

## 6. Winner

**NEW PROJECT DECISION.**

Primary case / profile for provider #1:

```text
VORTEX2 Goshen County, Wyoming supercell
5 June 2009
NSSL1 mobile GAUS
launch 2155 UTC
inflow ~50 km south-southeast of the updraft
native dataset: EOL 114.114
DOI: 10.5065/D6CC0Z0Q
format: ESC ASCII
sourceClass: observed-raob
```

This is the best **engineering + scientific** first
fixture, not because the tornado was famous, but
because:

1. The launch is already named in multiple
   peer-reviewed papers.
2. A published hodograph exists for **this** column.
3. It is an inflow environment, not a tornado-proximal
   contamination sample.
4. ESC forces the dirty vertical / QC-drop path `48`
   wanted from observed RAOB.
5. The same case later supports radar, mesonet, and
   thermodynamic-column work without changing I1.
6. Parker included the case (16 soundings). 10 May 2010
   was excluded.

### Runner-up

**OUN afternoon special 20 May 2013** (IGRA nominal
17 UTC / release 16:51 UTC; Wyoming labeled 18 UTC).

Why it lost:

```text
it is a local operational RAOB, not a designed
proximity inflow sounding
IEM currently omits the special, so the “easy”
archive is the wrong one
no published ground-relative hodograph of this
column comparable to Markowski Fig. 2
weaker dirty-data test (mandatory/significant
levels, already SI speed on the new Wyoming page)
```

Moore **should remain a later curated operational-RAOB
case.** It is the correct comparison object for
“what a conventional archive sounding looks like,”
and the legal freeze path is cleaner. It is not the
first adapter.

10 May 2010 should remain a **later VORTEX2 campaign
case**, after a dedicated launch-selection pass. It is
not the first fixture.

18 May 2010 is the best VORTEX2 alternate if Goshen
NSSL1 2155 UTC fails QC at I1 inspection.

---

## 7. Exact first file

Defensible identity **now**:

| Field | Value |
| --- | --- |
| Archive | NSF NCAR Earth Observing Laboratory Field Data Archive |
| Dataset | VORTEX2: NOAA/NSSL MGAUS Radiosonde Data — EOL Sounding Composite Format, Version 1.0 |
| DOI | `https://doi.org/10.5065/D6CC0Z0Q` |
| Alternate ID | `114.114` |
| Case | Goshen County, WY tornadic supercell, 5 June 2009 |
| Platform | NSSL1 mobile GAUS |
| Launch timestamp | 2155 UTC 5 June 2009 (confirm `UTC Release Time` in the ESC header; seconds may differ from the rounded paper time) |
| Location | inflow, ~50 km SSE of the updraft; header lat/lon/alt are authoritative |
| File / record identifier | **not known until order.** Match header `Release Site Type/Site ID` containing `NSSL1` and `UTC Release Time` on 2009-06-05 ~21:55 |
| Format | ESC ASCII (15 header lines + data records) |
| Citation | NSF NCAR Earth Observing Laboratory. 2010. VORTEX2: NOAA/NSSL MGAUS Radiosonde Data - EOL Sounding Composite Format. Version 1.0. NSF NCAR Earth Observing Laboratory. https://doi.org/10.5065/D6CC0Z0Q. Accessed *I1 date*. |
| Acknowledgement | NCAR EOL / NSF, per EOL data policy |

Why **this** sounding is appropriate:

```text
designed inflow, not tornado-adjacent
named and plotted in Markowski et al. (2012)
used as the homogeneous observed wind base state
  in later EnKF work (raw wind, not the modified T/q)
inside Parker’s quality window for the case
forces ESC QC-drop + irregular 1-s levels into
  the existing EnvironmentalWindProfile
```

**Remaining research gate (I1 obtainability, not
identity):**

```text
G1  Complete the EOL order for 114.114, temporal
    subset 2009-06-05 (optionally 2009-06-06 UTC
    continuation).
G2  Identify the NSSL1 file whose header release
    time is 2155 UTC ± clock seconds.
G3  Inspect wind QC flags, vertical coverage, and
    missing U/V before freeze.
G4  Record the EULA text accepted at order time
    and decide in-repo commit vs gitignored hash
    (48 U5). Dataset metadata says legal/access
    constraints none; that is not a substitute for
    the click-through text.
G5  If G3 fails (unusable winds), fall back inside
    the same case to another Parker-window inflow
    sounding, not to a tornado-proximal launch.
    Next case-level fallback is Moore IGRA
    2013-05-20 17 UTC.
```

R1 does **not** leave “pick a VORTEX2 sounding later.”
It leaves “download the already-named NSSL1 2155 UTC
file.”

---

## 8. Implementation handoff (I1)

I1 is **NOT STARTED**. This file does not include it.

Smallest next slice:

```text
EOL order → freeze one native ESC file (or hash)
  → NSSL/MGAUS ESC adapter
  → EnvironmentalWindProfileRecord provenance
  → existing EnvironmentalWindProfile
  → tests
```

Adapter responsibilities (`48`):

```text
parse 15-line ESC header (time, lat, lon, launch elev)
drop levels with missing / QC-failed U or V
do not invent winds; do not sort unless a named
  tested format-repair step is required
eastward = U, northward = V, already m/s
vertical = 0
height = altitude − launch elevation  (world Y)
fail on duplicate / non-finite / <2 remaining levels
record coverage (dropped levels, gap spans)
ignore T, Td, RH, pressure as consumed fields
```

Provenance (`48` §4.2):

```text
sourceClass      observed-raob
sourceIdentity   EOL 114.114 / DOI 10.5065/D6CC0Z0Q /
                 NSSL1 / ESC filename
validTime        2009-06-05 2155 UTC
location         header lat/lon
heightDatum      altitude minus launch elevation
                 → world Y, implied flat ground
coverage         min/max height, drops, gaps
nativeUnitsNote  ESC U/V m/s meteorological
```

Tests:

```text
golden: native ESC subset → frozen normalized levels
unit/sign: pure eastward → world.x > 0, world.z = 0
existing interpolation / clamp / shear-SRH reject clamp
hodograph points from imported knots
optional literacy: Markowski Fig. 2b shape after
  reconstructing ground-relative wind; not SRH oracle
```

Out of I1:

```text
App UI / Explore injection (I2)
DEMO_SCENARIO edits
Guided
Bunkers
observed or case-specific C
  Markowski C = (10.5, −1.3) m/s is documented
  observed motion for later sibling provenance;
  first sandbox C remains prescribed (48 §8.3)
thermodynamics
radar
provider interface
additional soundings
V1 reopen
```

---

## 9. Scientific anti-claims

`48` is preserved. Selecting Goshen NSSL1 2155 UTC
does **not** mean:

```text
Explorer simulates the 5 June 2009 Goshen storm
prescribed Ω came from observations
the six storm-local V_total operands came from
  observations
DEMO C is the Goshen observed storm motion
the imported profile is a reconstructed storm
agreement with 5 June 2009 validates the prescribed
  kinematic laboratory
Parker composites are this sounding
EnKF / dual-Doppler winds are this sounding
Markowski SRH is an Explorer pass/fail
a real environmental profile makes the storm real
```

Explorer is importing a **real environmental wind
profile** into a **prescribed kinematic laboratory**.

---

## 10. Unresolved after R1

Closed:

```text
U1 from 48   exact RAOB archive / sounding identity
first source class remains observed-raob
Moore is a later curated operational case, not I1
10 May 2010 is not the first fixture
```

Narrowed, still open:

```text
48 U2   first fixture is not pressure-only; height
        is ESC altitude minus launch elevation.
        Pressure-only conversion waits for another
        source.
48 U3   I2 C still prescribed; Goshen observed
        C = (10.5, −1.3) m/s is recorded only as
        future sibling evidence
48 U4   SRH UI still unresolved
48 U5   in-repo vs hash  → I1 G4 (EULA text)
I1 G1–G5  obtain and inspect the named ESC file
```

---

## 11. Compact lock-in

```text
WINNER:          VORTEX2 Goshen 5 June 2009
                 NSSL1 2155 UTC inflow sounding
ARCHIVE:         EOL 114.114  DOI 10.5065/D6CC0Z0Q
FORMAT:          ESC ASCII
SOURCE CLASS:    observed-raob
RUNNER-UP:       OUN 20 May 2013 afternoon special
                 (IGRA 17 UTC / Wyoming 18 UTC)
MOORE LATER:     yes, curated operational-RAOB case
10 MAY 2010:     later campaign case; not first file
I1:              NOT STARTED; blocked only on G1–G5
                 obtain/inspect/freeze
IMPLEMENTATION:  NONE in this file
V1:              CLOSED; not reopened
```
