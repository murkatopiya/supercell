# IGRA Observed-Profile Ingest Architecture

**Status:** ARCHITECTURE SoT / GATE ACCEPTED /
MOORE SOURCE INGEST NOT IMPLEMENTED
**Scope:** the minimum architecture for a sibling IGRA v2.2
observed-RAOB adapter that can emit the existing
provider-neutral `EnvironmentalWindProfileRecord`, using
the already-qualified Moore / OUN column as the first
named case:

```text
USM00072357  2013-05-20  HOUR 17  RELTIME 1651  NUMLEV 165
```

Not a production parser. Not a Moore golden. Not Explore
injection. Not Analysis / smoothing. Not pressure→height
reconstruction. Not interpolation. Not Bunkers. Not
observed storm motion. Not Guided. Not BL-015 provider #2.
Not a generic atmospheric provider framework. Not a V1
reopen. Not reconstruction of the 2013 Moore storm.
**Physics:** unchanged. `EnvironmentalWindProfile`
invariants and interpolation stay `04` / `48`. Source vs
analysis stays `53` / `54` / `55`; BL-037 remains out of
this file.
**Implementation:** this file does not include production
code, a committed IGRA golden, or an Explore Moore option.

Predecessor:

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
docs/architecture/56-esc-multi-sounding-observed-profile-ingest.md
```

Qualification evidence (identity + source-column audit,
not ingest authorization):

```text
docs/research/2026-08-28-moore-oun-igra-source-qualification.md
docs/research/artifacts/moore-oun-igra-source-qualification-summary.json
```

ESC sibling (same downstream record; different native
family):

```text
docs/architecture/56-esc-multi-sounding-observed-profile-ingest.md
src/data/eolNsslMgausEsc/
```

Related, not replaced:

```text
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/architecture/54-storm-scale-analysis-wind-profile.md
docs/architecture/55-analysis-profile-generalization-gate.md
docs/physics/04-environmental-wind-profile.md
docs/physics/00-coordinate-system.md
```

Keep these roles distinct:

```text
CURRENT FACT
NEW PROJECT DECISION
STILL-BINDING
ANTI-CLAIM
```

---

## 1. Why this file exists

**CURRENT FACT.** ESC ingest (`56`) is a working adapter
family. Moore / OUN is a different native class: IGRA v2.2
POR sounding data, meteorological FROM direction and speed,
GPH MSL, mixed pressure / non-pressure packing, sentinels
`−8888` / `−9999`.

**CURRENT FACT.** Research confirmed the Moore header and
column, and documented that native file order is **not** a
height column. `48` §7 already forbids silent sort inside
physics and allows a **named, tested adapter step** that
documents sort as format repair before construction.

This file is that named policy. It does not implement it.

Scientific framing for any later Moore consumer:

```text
observed environmental wind profile
+
prescribed storm-local laboratory
```

Not a reconstruction of the 2013 Moore tornado or supercell.
Published storm motion is not wired. Nothing is tuned to
tornado outcome.

---

## 2. Downstream height-order invariant

**Kind:** CURRENT FACT, live `EnvironmentalWindProfile`
(`04` §5, `48` §7, constructor tests).

The consumer object is

```text
V_env = V_env(h)
```

Constructor requirements:

```text
≥ 2 levels
every height and wind component finite
vertical === 0
h[i+1] > h[i]     strictly increasing
```

Duplicate heights are invalid (`h[i+1] === h[i]` throws).
Non-monotonic input throws
`EnvironmentalWindProfileError`
(`heights must be strictly increasing at index i`).
The constructor does **not** sort, reverse, or repair.

Negative finite height is legal. Profiles need not start
at `0` or reach `12000 m`.

`sampleAtHeight` and hodograph polyline both assume the
stored knots are already height-ordered. Call sites
(DEMO scenario factory, ESC
`environmentalWindProfileFromNormalizedLevels`, Explore
injection) present increasing levels; they do not sort.

**NEW PROJECT DECISION.** The strictly-increasing invariant
is established at the physics constructor. IGRA native
record order is **not** that invariant. Ordering repair,
if any, belongs in the IGRA adapter **before**
`new EnvironmentalWindProfile`. Physics is not extended
to accept packing order.

---

## 3. Sibling relationship to ESC

**NEW PROJECT DECISION.**

```text
ESC adapter and IGRA adapter are siblings.
```

Shared downstream:

```text
EnvironmentalWindProfile
EnvironmentalWindProfileRecord
sourceClass observed-raob
Explore environment mechanism (later product work, not this file)
```

Not shared:

```text
parser
native record types
QC / sentinel tables
selection keys
ordering semantics
height-datum semantics
unit conversion
```

Do not reuse `parseEscConcatenated`, `EscObservedSoundingSpec`,
or `normalizeEscWindColumn` because both emit a wind profile.

This is **not** `AtmosphericProfileSource`, not a provider
registry, and not BL-015. Both adapters are observed-RAOB
fixtures behind `48`. A second native format here is a
sibling ingest family, not a multi-provider platform.
`48` Q5 remains binding: no provider interface.

---

## 4. Normalization stages

**NEW PROJECT DECISION.** Conceptual pipeline:

```text
native IGRA v2.2 POR text
  → parse headers + data records
  → selectIgraSounding(blocks, spec)     exact identity
  → verify header metadata (NUMLEV, P_SRC, NP_SRC)
  → filter usable wind+GPH levels
  → convert WDIR/WSPD → eastward/northward; vertical = 0
  → worldY = GPH − spec.surfaceDatumGphM
  → named stable sort by worldY
  → fail on duplicate worldY
  → coverage from the sorted column
  → EnvironmentalWindProfileRecord
```

No pressure→height. No interpolation. No invented `Y = 0`
by rewriting the first retained knot.

---

## 5. Native source identity (Moore)

**CURRENT FACT** from the qualification inspect.

Exact native header:

```text
#USM00072357 2013 05 20 17 1651  165 ncdc6301 ncdc6301  351808  -974378
```

| Field | Locked value |
| --- | --- |
| Station ID | `USM00072357` (exact) |
| Date | 2013-05-20 |
| HOUR | 17 UTC **nominal** |
| RELTIME | 1651 (release **16:51** UTC) |
| NUMLEV | 165 (validation, not identity) |
| P_SRC / NP_SRC | `ncdc6301` / `ncdc6301` (validation) |
| LAT / LON | 35.1808 / −97.4378 (header × 10⁻⁴) |

Do not conflate nominal HOUR 17 with RELTIME 16:51.
Wyoming’s 18 UTC stamp is a **view label**, not the IGRA
header, and is not an identity key.

Same-day neighbor **not** selected: HOUR 12 / RELTIME 1108.

---

## 6. Case spec and selection

**NEW PROJECT DECISION.** Minimal conceptual spec
(SoT shape, not `src/**` in this file):

```ts
type IgraObservedSoundingSpec = {
  stationId: string;          // exact, e.g. "USM00072357"
  year: number;
  month: number;
  day: number;
  nominalHourUtc: number;     // header HOUR; 17 for Moore
  reltime: number;            // native RELTIME HHMM; 1651

  expectedNumlev: number;     // validation; 165 for Moore
  expectedPSrc: string;       // validation; "ncdc6301"
  expectedNpSrc: string;      // validation; "ncdc6301"
  surfaceDatumGphM: number;   // Moore: 345

  sourceIdentity: string;
  validTime: string;
  heightDatum: string;
  nativeUnitsNote: string;
};
```

**Identity keys** (all must match; fail if 0 or >1):

```text
stationId     exact string equality (not includes)
year, month, day
nominalHourUtc
reltime
```

RELTIME **is** part of identity. Same calendar day can
carry more than one launch. Selection is never by file
ordinal and never by “afternoon-ish” or Wyoming 18 UTC.

**Validation after identity, not identity keys:**

```text
parsed data-record count === header NUMLEV
header NUMLEV === spec.expectedNumlev
header P_SRC === spec.expectedPSrc
header NP_SRC === spec.expectedNpSrc
exactly one LVLTYP2 = surface (1)
that surface GPH === spec.surfaceDatumGphM
```

Mismatch fails. P_SRC / NP_SRC name product lineage for
this locked case; they are not a third runtime identity
key and are not ignored.

Latitude / longitude are **not** identity keys. Copy them
from the selected header (`× 10⁻⁴` degrees) into
`provenance.location`. For this fixed station they equal
the IGRA station list; the adapter still uses the header.

---

## 7. Usable IGRA wind level

**NEW PROJECT DECISION.** A native data record becomes a
candidate wind level if and only if:

```text
GPH  present (not −8888, not −9999) and finite
WDIR present (not −8888, not −9999) and finite
WSPD present (not −8888, not −9999) and finite
```

PRESS does **not** gate usability. ETIME does **not** gate
usability.

On the qualified Moore column this keeps **165 / 165**.
The 94 non-pressure levels have PRESS = −9999 and valid
GPH + wind; they are kept **because GPH is present**.

### Sentinels

| Native | Meaning | Adapter |
| --- | --- | --- |
| `−8888` | QA removed | treat the field as absent |
| `−9999` | missing | treat the field as absent |

A level with absent GPH, WDIR, or WSPD is **dropped**.
Do not invent a wind. Do not recover height from PRESS
or a standard atmosphere.

PFLAG / ZFLAG / TFLAG are **not** drop criteria for this
adapter. Qualification kept the column on sentinels, not
climatology-tier flags.

### After sentinel checks

```text
WDIR must satisfy 0 ≤ WDIR ≤ 360
WSPD must satisfy WSPD ≥ 0
GPH, WDIR, WSPD must be finite numbers
```

A finite value outside those ranges that is **not** a
sentinel is corrupt native data → **fail the sounding**,
not silent drop.

WSPD native unit is **tenths of m/s** (51 → 5.1 m/s).

Zero wind: `WSPD === 0` with a present in-range WDIR is
legal calm; converted vector is `(0, 0, 0)` horizontal.
Missing direction with zero speed is **not** given a
special keep rule. That case is absent from the qualified
column and is not documented here as legal. It follows the
ordinary “WDIR absent → drop” rule.

---

## 8. Direction / speed conversion

**NEW PROJECT DECISION.** IGRA WDIR is meteorological
**FROM** direction: degrees from north, 90 = east
(qualification §2; IGRA v2.2 format).

Converted consumer fields are atmospheric
(`00` / `04` / `48`):

```text
eastward    m/s
northward   m/s
vertical    0
```

They are **not** world `Vec3`. World mapping remains the
existing helpers: `world.x = eastward`,
`world.z = −northward`.

Exact map:

```text
speed   = WSPD / 10
dir_rad = WDIR * π / 180
eastward  = −speed * sin(dir_rad)
northward = −speed * cos(dir_rad)
vertical  = 0
```

`dir_rad` is the FROM azimuth clockwise from north, in
radians. `sin` / `cos` are the ordinary trigonometric
functions of that angle.

Sign checks (validation of the map, not new physics):

```text
FROM 270° (west)  → eastward  = +speed
FROM 180° (south) → northward = +speed
FROM  90° (east)  → eastward  = −speed
FROM   0° (north) → northward = −speed
```

Qualification surface check: WDIR 185, WSPD 51 →
eastward ≈ +0.44, northward ≈ +5.08.

Do not mix Wyoming knots copies with this IGRA tenths-of-m/s
column.

---

## 9. Height datum (Moore)

**NEW PROJECT DECISION.** Moore locked datum:

```text
worldY = GPH − 345
```

345 m is this sounding’s **own surface GPH**
(LVLTYP2 = surface, ETIME 0, PRESS 96638 Pa).
It is **not** the station-list elevation 344.9 m.

Why not 344.9:

```text
The Explorer source column is this sounding’s GPH field.
Subtracting the sounding’s own surface GPH makes the
surface knot worldY = 0 by arithmetic, not by inventing
a ground node.
Catalog 344.9 would place that same surface at +0.1 m
and mix two slightly different vertical references.
```

345 m is a **Moore case-spec constant**
(`surfaceDatumGphM`). Production **must** verify that the
identified sounding contains the expected surface GPH.
Do **not** silently substitute 344.9 on mismatch.

No rounding on this datum: IGRA GPH is integer metres;
345 is integer; `worldY` is an integer metre difference.

Do not invent `Y = 0` by rewriting the first retained
level if a later IGRA case lacks a matching surface GPH
— that case fails verification instead.

Negative `worldY` remains legal for the physics object
(Prospect / Dumas ESC already emit small negatives). A
later IGRA case that produces negatives after a verified
datum is not blocked by this Moore lock. Moore with 345
has min worldY = 0 after the named sort.

---

## 10. Ordering policy (major gate)

**CURRENT FACT.** Native IGRA file order on Moore is not
strictly increasing in GPH. One inversion:

```text
GPH 31045 m  (worldY 30700, ETIME 95:16, other-pressure)
→
GPH   707 m  (worldY   362, ETIME  1:00, non-pressure)
Δ = −30338 m
```

Research: this is mixed-level packing (a late-ascent
pressure level followed by an early-ascent significant-wind
height-only level), **not** balloon descent. After a
diagnostic sort-by-GPH: 0 equal heights, 0 remaining
inversions, envelope 0 … 30700 m.

### Options

```text
A  fail on native non-monotonic order
B  stable sort retained levels by worldY
C  another explicit transform (e.g. sort by ETIME)
```

**A rejected.** Failing would treat IGRA packing order as
if it were the vertical column. The consumer object is
`V_env(h)`, not `V_env(file index)`. Rejecting Moore on
that basis would block the operational-RAOB class for a
format artifact that the qualification already named.

**C (ETIME primary sort) rejected as production key.**
ETIME is present on all 165 Moore levels and independently
shows the inverted pair is not chronological descent.
That is **evidence** for packing, not a second vertical
coordinate. `EnvironmentalWindProfile` is not an ascent
trajectory. ETIME may be missing on other IGRA soundings.
Sorting by time and then hoping height increases would
still fail the constructor on any true height non-monotone
ascent.

**B selected.**

### Why B is scientifically legitimate

The downstream object is a function of height. Hodograph,
shear, SRH, and `sampleAtHeight` all consume height order.
IGRA v2.2 stores mixed level types (standard-pressure,
other-pressure, non-pressure) whose **file order is a
packing order**, not the ordered vertical profile.

A named adapter sort by the vertical coordinate the profile
is a function of is format repair: it presents the sampled
column as `V_env(h)`. It is not smoothing, not interpolation,
and not an Analysis transform (`53` / `54`).

This is the `48` §7 allowed case: a **named, tested
adapter step**, not a silent physics constructor sort.

### Production sort semantics

```text
stable sort retained converted levels by worldY ascending
(worldY = GPH − surfaceDatumGphM; equivalent to sort by GPH
 for a constant datum)
native file index is the stable-sort tie-breaker only
ETIME is not a sort key
```

After the sort, the adapter still hands the array to
`EnvironmentalWindProfile`, which re-checks
strictly increasing heights.

Coverage gap spans are computed on the **sorted** column.
File-order Δz (contaminated by the inversion) is not
coverage.

Native sequence and ETIME are not fields of
`EnvironmentalWindProfile`. They may exist only inside
adapter diagnostics / tests, not as a second consumer
profile.

---

## 11. Duplicate-height policy

**NEW PROJECT DECISION.** After conversion and the named
sort:

```text
equal worldY → fail the sounding
do not average
do not drop one of the pair
do not keep duplicates for the constructor to reject as
  an unstated second policy
```

This matches `04` §5 and `48` §7. Qualification found
**0** equal GPH on Moore, before and after diagnostic sort.

---

## 12. Provenance ownership

**STILL-BINDING** from `48` §4.2. The record remains:

```text
profile:     EnvironmentalWindProfile
provenance:  sourceClass, sourceIdentity, validTime,
             location, heightDatum, coverage,
             nativeUnitsNote
```

| Field | Owner |
| --- | --- |
| `sourceClass` | `observed-raob` |
| `sourceIdentity` | spec; copied, not synthesized from a Wyoming label |
| `validTime` | spec display string; must name IGRA nominal 17 UTC **and** RELTIME 16:51; must not replace them with Wyoming 18 UTC |
| `location` | selected header lat/lon after identity |
| `heightDatum` | spec; names `GPH − 345 m` (Moore surface GPH), not 344.9 |
| `nativeUnitsNote` | spec; IGRA WDIR degrees FROM, WSPD tenths m/s |
| `coverage` | generic counts/gaps of the **sorted** kept column |

Moore locked copies (later implementation must keep these
meanings):

```text
sourceIdentity  IGRA v2.2 USM00072357 / NCDC DSI-6301 (ncdc6301) /
                2013-05-20 nominal 17 UTC / RELTIME 1651 /
                native POR USM00072357-data.txt
validTime       2013-05-20 16:51 UTC (IGRA RELTIME; nominal HOUR 17)
heightDatum     IGRA GPH minus sounding surface GPH 345 m → world Y,
                implied flat ground; station-list 344.9 m is not the
                subtracted datum
nativeUnitsNote IGRA WDIR meteorological FROM degrees; WSPD tenths of m/s
```

### Coverage and 50 m gaps

The live coverage shape

```text
minHeight, maxHeight
nativeDataRecordCount, keptLevelCount, droppedLevelCount
gapSpansOver50m: { fromHeight, toHeight, delta }[]
```

is **sufficient**. Do not raise the 50 m threshold to make
Moore look like ESC. After the named sort, Moore has
**144** adjacent gaps > 50 m (median Δz 174 m, max 362 m).
That list is verbose and honest. Large gaps remain
interpolation across known endpoints, not extra observation
(`48` §7).

The TypeScript coverage type currently lives next to the
ESC adapter. That is an implementation-module fact, not a
reason to import ESC parse types into IGRA. A later code
slice may reuse the *shape* or extract it; this file does
not redesign coverage.

---

## 13. First named wrapper

When implemented (not in this file):

```text
ingestOunMoore20130520Igra
```

binds one frozen `IgraObservedSoundingSpec`. Callers do not
construct the spec. Native POR bytes remain gitignored.
`npm test` must use synthetic IGRA text plus a committed
normalized golden, same pattern as ESC I1 / `56`.

Explore identity for Moore is **out of this SoT** (BL-021
product case; BL-045 validation pointer). This file does
not add `moore-2013-observed` to Explore.

---

## 14. Implementation slices

```text
1. This architecture (ordering, datum, identity, conversion)
   DONE in this file; no src/**
2. IGRA parser + Moore named wrapper + tests/golden
   NOT STARTED; not included here
3. Explore Moore environment identity
   out of this SoT (BL-021); Guided remains DEMO
4. Analysis / BL-037 / BL-010
   not authorized; 100 m bin-mean is not universal on
   IGRA spacing (qualification §6)
```

Native IGRA bytes are not an `npm test` input.

---

## 15. Gate

**GATE ACCEPTED.**

Moore IGRA can be normalized into the provider-neutral
`EnvironmentalWindProfileRecord` with an explicit
production ordering policy.

The blocking scientific question was native non-monotonic
order. It is resolved as IGRA mixed-level **packing**, not
as atmospheric structure, with a named stable sort by
`worldY` before physics construction. Datum, sentinels,
FROM-direction conversion, and identity keys are locked
from the qualification inspect.

Acceptance is an architecture decision. It is not a parser,
not a golden, not Explore wiring, and not Analysis.

---

## 16. Anti-claims

```text
this file does not include production implementation
this file does not add src/**
this file does not commit native IGRA bytes
this file does not create a Moore golden
this file does not add an Explore Moore option
this file does not retarget Guided
this file does not wire published storm motion
this file does not reconstruct the 2013 Moore storm
this file does not recover height from pressure
this file does not interpolate missing GPH or wind
this file does not invent Y=0
this file does not subtract station-list 344.9 m
this file does not sort inside EnvironmentalWindProfile
this file does not treat 50 m gaps as a defect to hide
this file does not authorize Analysis / BL-037 / BL-010
this file does not create AtmosphericProfileSource
this file is not BL-015 provider #2
this file does not reuse the ESC parser
```

---

## 17. Compact lock-in

```text
FAMILY:          IGRA v2.2 POR sounding data
SIBLING OF:      ESC adapter (56); shared record, not parser
IDENTITY:        exact stationId + date + HOUR + RELTIME
                 fail 0 or >1; never ordinal
RELTIME:         identity key (Moore 1651)
NUMLEV:          validation (Moore 165)
P_SRC / NP_SRC:  validation (ncdc6301); not identity
LOCATION:        selected header × 10⁻⁴
USABLE LEVEL:    present GPH + WDIR + WSPD
PRESS:           optional; must not gate
ETIME:           optional; not a sort key
SENTINELS:       −8888 QA-removed; −9999 missing → drop field
DIR/SPEED:       speed=WSPD/10;
                 eastward=−speed*sin(WDIR*π/180);
                 northward=−speed*cos(WDIR*π/180)
DATUM:           worldY = GPH − 345 (surface GPH, not 344.9)
                 verify surface GPH; no rounding
ORDERING:        B; named stable sort by worldY
DUPLICATES:      fail; do not average
COVERAGE:        48 shape; 50 m gaps remain; Moore will be verbose
C / STORM:       prescribed laboratory; not observed Moore C
EXPLORE:         not in this file
GOLDEN / SRC:    not in this file
V1:              CLOSED; not reopened
```

---

## 18. Unresolved risks (do not reopen the gate)

```text
U1  A later IGRA sounding whose inversion is a true balloon
    descent rather than mixed-level packing. Policy B still
    emits V_env(h). That is the consumer object. It is not
    an ascent reconstruction.
U2  Calm with missing WDIR (not seen on Moore). Current rule:
    drop. Not a special keep.
U3  Coverage TypeScript currently lives beside ESC. Shape
    reuse vs extract is an implementation detail.
U4  Native POR freeze / license (analogous to ESC G4) is
    not decided here. npm test must not require those bytes.
```

Not unresolved:

```text
ordering policy                         B, named adapter sort
Moore surface datum                     345 m GPH, verified
344.9 substitution                      rejected
pressure gating wind usability          rejected
physics constructor sort                rejected
provider interface                      rejected
Explore / Analysis in this file         excluded
```

---

## 19. Implementation

This document does not include implementation.
Production `src/**` remains unchanged.
Moore Explore identity, IGRA goldens, and Analysis remain
out of this SoT.
