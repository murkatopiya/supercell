# ESC Multi-Sounding Observed-Profile Ingest Architecture

**Status:** ARCHITECTURE SoT / GATE ACCEPTED /
PROSPECT AND DUMAS INGEST NOT STARTED
**Scope:** the minimum generalization of the existing EOL
NSSL/MGAUS ESC adapter so three already-qualified observed
columns can share one ingest family:

```text
Goshen NSSL1     2009-06-05 21:55:22
Prospect Valley  NSSL1 2010-05-26 22:23:46
Dumas/Stinnett   NSSL2 2010-05-18 21:52:18
```

Not a provider interface. Not IGRA. Not Moore. Not
Explore injection. Not Analysis / smoothing. Not new
production goldens in this file. Not a V1 reopen. Not
reconstruction. Not Bunkers. Not Guided.
**Physics:** unchanged. `EnvironmentalWindProfile`
invariants and interpolation stay `04` / `48`. I1
normalization semantics stay `49` §8. Source vs analysis
split stays `53`; `54`/`55`/BL-037 remain out of this
file.
**Implementation:** this file does not include `src/**`
changes. Goshen I1 remains the live adapter. Prospect
and Dumas ingest are NOT STARTED.

Predecessor:

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
docs/architecture/49-r1-first-historical-reference-storm.md
```

Live adapter being generalized (not rewritten here):

```text
src/data/eolNsslMgausEsc/
```

Qualification evidence (identity + source-column audit,
not ingest authorization):

```text
docs/research/2026-08-28-additional-sounding-case-selection.md
docs/research/2026-08-28-vortex2-source-qualification.md
docs/research/artifacts/vortex2-source-qualification-summary.json
```

Related, not replaced:

```text
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/architecture/54-storm-scale-analysis-wind-profile.md
docs/architecture/55-analysis-profile-generalization-gate.md
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

**CURRENT FACT.** I1 is a working ESC adapter that emits
a legal `EnvironmentalWindProfileRecord`. Several of its
seams are Goshen-named even when the mechanics are
format-generic.

**CURRENT FACT.** Prospect Valley and Dumas/Stinnett are
the same native family: concatenated ESC ASCII, 15-line
header, 21×130-char records, meteorological U/V, Alt MSL,
header launch elevation, I1 QC drop rules. Research
applied those rules without inventing a new drop policy.
Heights after drop are strictly increasing. No 50 m
coverage hole. Native order is already usable.

The scientific need is **additional source columns** for
later BL-037 validation inputs, not a second provider
and not an Analysis transform.

This file extracts the Goshen-specific seams so later
named wrappers can reuse the same mechanics. It does
not authorize those wrappers in `src/**`.

---

## 2. Current ESC ownership audit

**Kind:** CURRENT FACT, live `src/data/eolNsslMgausEsc/`.

| Element | Class |
| --- | --- |
| `parseEscConcatenated` / 15-line header / 21-field records | FORMAT-GENERIC |
| `EscHeader`, `EscDataRecord`, `EscSoundingBlock` | FORMAT-GENERIC |
| `EscAdapterError` | FORMAT-GENERIC |
| ESC missing U/V `9999`, missing Alt `99999` | ESC-FAMILY-GENERIC |
| QC MISSING `9` / BAD `3` (`isUsableWindRecord`) | ESC-FAMILY-GENERIC |
| `roundToTenth` | ESC-FAMILY-GENERIC |
| `COVERAGE_GAP_THRESHOLD_M = 50` / `gapSpansOver50m` | ESC-FAMILY-GENERIC |
| `NormalizedWindLevel` / coverage record | ESC-FAMILY-GENERIC |
| `environmentalWindProfileFromNormalizedLevels` (`vertical = 0`) | ESC-FAMILY-GENERIC |
| `EnvironmentalWindProfileRecord` + `sourceClass: "observed-raob"` | PRODUCT/PROVENANCE (contract `48`) |
| `selectTargetSounding` / `isNssl1Goshen2155Header` | GOSHEN-SPECIFIC |
| `NSSL1_GOSHEN_2155_UTC` | GOSHEN-SPECIFIC |
| `NSSL1_GOSHEN_2155_LAUNCH_ELEVATION_M` and its use in `normalizeEscWindColumn` | GOSHEN-SPECIFIC |
| `nssl1Goshen2155Record` identity / validTime / heightDatum strings | GOSHEN-SPECIFIC / PRODUCT/PROVENANCE |
| `NSSL1_GOSHEN_2155_NATIVE_UNITS_NOTE` | ESC-FAMILY-GENERIC string, currently stored as a Goshen constant |
| `ingestNssl1Goshen2155Esc` | GOSHEN-SPECIFIC named wrapper |
| `GoshenNormalizedGolden` | GOSHEN-SPECIFIC |
| committed `nssl1Goshen2155.normalized.json` | GOSHEN-SPECIFIC |

`parseEscConcatenated` does **not** encode Goshen, NSSL1,
or a date. It splits on `Data Type:`, reads site id, UTC
release time, and `Release Location` lon/lat/elev.

`selectTargetSounding` **is** Goshen-specific: `siteId`
contains `NSSL1` and UTC equals `2009, 06, 05, 21:55:22`.
Zero matches or more than one match fails.

`normalizeEscWindColumn` already performs option B for
Goshen: it requires `header.launchElevation === 1557.9`
and subtracts that locked datum. It does not silently
trust an unmatched header elevation.

Location on the record is header launch lat/lon, not a
later GPS (`eolNsslMgausEsc.test.ts`).

---

## 3. Selected minimal generalization

**NEW PROJECT DECISION.**

```text
small explicit sounding spec
+ generic ESC mechanics
+ named case wrappers
```

Not selected:

```text
AtmosphericProfileSource / provider registry
a predicate-function API as the public surface
an “all soundings” adapter
IGRA / Moore inside this family
silent “header elevation is always correct”
```

`48` Q5 remains binding: one ESC adapter is still
provider #1. Additional ESC cases are **more fixtures
of that adapter**, not provider #2.

Architectural type (SoT shape, not `src/**` in this
file):

```ts
type EscObservedSoundingSpec = {
  siteIdIncludes: string;
  utcReleaseTime: string;
  expectedLaunchElevationM: number;

  sourceIdentity: string;
  validTime: string;
  heightDatum: string;
  nativeUnitsNote: string;
};
```

Pipeline:

```text
parseEscConcatenated(text)
  → selectEscSounding(blocks, spec)
  → normalizeEscWindColumn(block, spec)
  → environmentalWindProfileFromNormalizedLevels
  → EnvironmentalWindProfileRecord
      provenance from spec
      location from selected header
      coverage from normalization
```

Named public wrappers remain the product surface:

```text
ingestNssl1Goshen2155Esc          EXISTS; stays
ingestNssl1ProspectValley222346Esc  NOT STARTED
ingestNssl2Dumas215218Esc           NOT STARTED
```

Each wrapper binds one frozen spec. Callers of Goshen
do not have to construct the spec.

---

## 4. Selection identity

**NEW PROJECT DECISION.** Preserve I1 (`49` §8.3).

Match a block if and only if:

```text
header.siteId.includes(spec.siteIdIncludes)
header.utcReleaseTime === spec.utcReleaseTime
```

`utcReleaseTime` is the **exact native** ESC header
string, not a parsed Date and not the display
`validTime`.

```text
Goshen     siteIdIncludes "NSSL1"   UTC "2009, 06, 05, 21:55:22"
Prospect   siteIdIncludes "NSSL1"   UTC "2010, 05, 26, 22:23:46"
Dumas      siteIdIncludes "NSSL2"   UTC "2010, 05, 18, 21:52:18"
```

Zero matches → fail. More than one match → fail.
Selection is never by file ordinal.

Exact full site-id equality is **not** the selector.
I1 locked `contains NSSL1` because prefixes vary
(`Bushnell/NSSL1`, `Mobile System/NSSL1`,
`Mobile System/NSSL2`). UTC is the unique key inside
each qualified day file. The includes token is the
platform check (NSSL1 vs NSSL2) that keeps Dumas from
the forward-flank NSSL1 22:04:18 block.

Qualified native site strings remain provenance facts
inside `sourceIdentity`. They are not a third runtime
key.

Latitude and longitude are **not** identity keys.
They are copied from the selected header into
`provenance.location` after identity succeeds.

---

## 5. Launch-elevation verification and height datum

**NEW PROJECT DECISION.** Option B.

```text
A  trust the selected header elevation alone     REJECTED
B  spec carries expectedLaunchElevationM;
   header must match exactly; then convert       SELECTED
C  other (tolerance band, GPS Alt, invented Y=0) REJECTED
```

Comparison is exact (`!==`). ESC prints launch
elevation to 0.1 m. I1 already uses exact equality
for 1557.9 m.

Qualified expected values:

```text
Goshen     1557.9 m
Prospect   1358.9 m
Dumas      1122.1 m
```

After equality holds:

```text
worldY = roundToTenth(Alt − expectedLaunchElevationM)
```

That is numerically identical to subtracting the
verified header elevation. Live Goshen subtracts the
locked constant after the check. Later mechanics may
use either operand only because they are required to
be equal.

Do not invent `Y = 0`. Do not snap the first kept
level. Do not skip `Time = −1` as a universal rule.
I1 dropped Goshen `t = −1` because those winds were
missing, not because pre-release rows are illegal.
Prospect and Dumas research kept `t = −1` with GOOD
U/V, producing first heights **−0.1 m** and **−0.5 m**.
`EnvironmentalWindProfile` already allows a finite
negative height. That is I1 semantics applied to
another block, not a new datum policy.

---

## 6. Provenance ownership

**NEW PROJECT DECISION.**

| Field | Owner |
| --- | --- |
| `sourceClass` | contract: `observed-raob` |
| `sourceIdentity` | spec; copied, not synthesized from header |
| `validTime` | spec; locked display string, not parsed from native UTC commas |
| `location.latitude` / `longitude` | selected header after identity match |
| `heightDatum` | spec; names the locked elevation and round-to-tenth rule |
| `nativeUnitsNote` | spec; ESC-family string may be shared across cases |
| `coverage` | generic normalization of the selected block |

Generic conversion of normalized levels →
`EnvironmentalWindProfile` is
`environmentalWindProfileFromNormalizedLevels`.
It must not own case identity strings.

Case wrappers own the spec. The record factory copies
spec provenance and header location. Do not collapse
identity into anonymous “observed ESC” strings.

Goshen locked copies (must remain bit-identical after
a later refactor):

```text
sourceIdentity  EOL 114.114 / DOI 10.5065/D6CC0Z0Q / Bushnell/NSSL1 /
                UTC 2009-06-05 21:55:22 / native concatenated
                NSSL_MGAUS_20090605.cls
validTime       2009-06-05 21:55:22 UTC
heightDatum     ESC Alt minus header launch elevation 1557.9 m,
                rounded to 0.1 m → world Y, implied flat ground
nativeUnitsNote ESC U/V m/s meteorological (eastward / northward)
```

Prospect and Dumas provenance strings are written when
those wrappers are implemented. They are not invented
here beyond the identity lock already recorded in the
VORTEX2 qualification research.

---

## 7. Preserved I1 normalization

**STILL-BINDING** from `48` §6–§7 and `49` §8.4.

```text
keep usable altitude + usable U/V only
ESC U = eastward
ESC V = northward
worldY = Alt MSL − verified launch elevation
round worldY to 0.1 m
preserve source order
strictly increasing normalized heights required
no interpolation in the adapter
no smoothing
no invented Y=0
coverage metadata preserved
profile vertical = 0 downstream
drop U/V 9999, Qu/Qv MISSING(9) or BAD(3), Alt 99999
fail on duplicate / non-increasing height after conversion
fail if fewer than two kept levels
50 m coverage-gap recording unchanged
EnvironmentalWindProfile interpolation / clamp unchanged
```

Do not sort. Do not deduplicate by averaging. Do not
drop the first usable point. Do not change QC. Do not
tune to published SRH.

Prospect/Dumas research showing the same family
characteristics is **validation evidence**, not
permission to alter I1.

The committed Goshen golden remains the bit-for-bit /
semantic oracle for that case after any later refactor
of seams into spec-driven mechanics.

---

## 8. Named roles

```text
FORMAT-GENERIC
  parseEscConcatenated

ESC-FAMILY-GENERIC
  isUsableWindRecord
  roundToTenth
  coverage / 50 m gaps
  normalizeEscWindColumn(block, spec)   after this SoT
  selectEscSounding(blocks, spec)       after this SoT
  environmentalWindProfileFromNormalizedLevels

CASE SPEC
  EscObservedSoundingSpec for one qualified launch

NAMED WRAPPER
  ingestNssl1Goshen2155Esc
  later Prospect / Dumas ingest functions
```

Renaming `selectTargetSounding` without passing a spec
would leave a Goshen-specific function behind a generic
name. That is rejected.

---

## 9. Moore / IGRA exclusion

**ANTI-CLAIM.** Moore / OUN IGRA is not part of this
abstraction.

IGRA differs materially from ESC:

```text
direction / speed instead of ESC U/V
GPH MSL instead of ESC Alt
IGRA sentinel / QA flags
coarse operational sampling
non-monotonic native file order
94 valid wind+GPH non-pressure levels on the qualified
  2013-05-20 17 UTC / RELTIME 1651 column
```

Its ingest, if later designed, is a **sibling adapter**
behind the same provider-neutral
`EnvironmentalWindProfileRecord` boundary (`48`).
This ESC family must not be distorted to anticipate
IGRA sorting, pressure reconstruction, or
direction/speed mapping.

BL-045 candidate #2 remains a validation-input pointer
and a later product case (BL-021). Neither is this
adapter.

---

## 10. Intended next implementation slices

These slices are **not** included in this document.

```text
1. Refactor live ESC mechanics to take EscObservedSoundingSpec
   without changing Goshen golden or I1 semantics
2. Prospect Valley named wrapper + tests/golden
3. Dumas/Stinnett named wrapper + tests/golden
```

Native EOL bytes remain gitignored (`data/`). `npm test`
must not require them. Explore environment registry,
Analysis profile, and BL-037 remain separate.

---

## 11. Gate

**GATE ACCEPTED.**

Existing ESC parser and I1 normalization can be
generalized by extracting case identity, datum
verification, and provenance into a small explicit
spec, while preserving I1 semantics.

Prospect and Dumas did not reveal a semantic
incompatibility. Negative first heights and NSSL2 vs
NSSL1 are spec/data facts, not a new drop policy.

This acceptance is an architecture decision. It is not
implementation of Prospect, Dumas, Moore, Explore, or
Analysis.

---

## 12. Compact lock-in

```text
FAMILY:          EOL NSSL/MGAUS ESC only
SPEC:            siteIdIncludes + exact native UTC
                 + exact expectedLaunchElevationM
                 + copied provenance strings
LOCATION:        selected header lat/lon
DATUM:           option B; exact 0.1 m match; then
                 round(Alt − locked elevation, 1)
SELECTOR:        spec-driven; fail 0 or >1; never ordinal
GOSHEN WRAPPER:  kept
I1 SEMANTICS:    unchanged; golden remains oracle
MOORE/IGRA:      excluded; sibling adapter later
PROVIDER API:    still rejected (48 Q5)
ANALYSIS:        still 53/54/55; BL-037 not this file
PROSPECT/DUMAS:  NOT STARTED
V1:              CLOSED; not reopened
```

---

## 13. Implementation

This document does not include implementation.
Production `src/**` remains unchanged by this SoT.
No new goldens, no native bytes, no Explore registry,
no IGRA adapter, no Analysis profile.
