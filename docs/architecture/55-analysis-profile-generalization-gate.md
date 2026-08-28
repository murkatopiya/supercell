# Analysis Profile Generalization Gate

**Status:** QUALIFICATION CHECKPOINT / DOCS-ONLY /
ANALYSIS PROFILE IMPLEMENTATION BLOCKED
**Scope:** qualify the epistemic status of `54` after the
generalization question. Not a new operator. Not a
rejection of 100 m AGL bin-mean. Not an analysis-profile
implementation. Not a V1 reopen. Not Bunkers. Not
observed sandbox `C`. Not a golden rewrite.
**Physics:** unchanged. Source vs analysis split (`53`)
unchanged. `EnvironmentalWindProfile` and diagnostic APIs
unchanged.
**Implementation:** none. Production `src/**` MUST remain
unchanged.

Predecessor (construction being qualified, not replaced):

```text
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/architecture/54-storm-scale-analysis-wind-profile.md
```

Index (not SoT):

```text
docs/PROJECT_BACKLOG.md   BL-010, BL-037
```

Evidence that motivated `54`, still evidence not oracle:

```text
docs/research/2026-08-27-goshen-2155-hodograph-reproduction.md
```

Related (ESC source-column family ingest; not this gate):

```text
docs/architecture/56-esc-multi-sounding-observed-profile-ingest.md
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING
NEW PROJECT DECISION
ANTI-CLAIM
```

This file does **not** rewrite `54`. It changes the
epistemic reading of `54` from selected production
construction to candidate pending generalization
validation.

---

## 1. Why this qualification exists

**CURRENT FACT.** `53` accepted two representations of one
sounding: source profile vs a later analysis profile.
`54` then recorded a concrete construction:

```text
AGL bin-mean
Δz = 100 m
knot = (mean height, mean eastward, mean northward)
```

That construction was derived from diagnostic-scale
arguments on the first validation case, Goshen NSSL1
2155 UTC. `54` states it as a NEW PROJECT DECISION and
does not include implementation.

**CURRENT FACT.** One sounding / one sampling regime is
not enough to raise that construction to a
general-purpose production transform policy for Explorer.

This file records that gap as a **gate**, without
inventing a replacement operator.

---

## 2. What remains accepted

**STILL-BINDING** from `53`:

```text
SOURCE vs ANALYSIS split     ACCEPTED
source column                I1 golden; 2029 knots; keep t=0
                             Explore V_env; scientific polyline
analysis column              a derived sibling, if/when it exists
                             not a silent resample of the source
                             not a second archive
```

**STILL-BINDING** from `54` as **first concrete candidate**,
not withdrawn:

```text
CANDIDATE OPERATOR           AGL bin-mean, Δz = 100 m
WHY IT WAS WRITTEN           quantization + pendulum floor
                             vs 0–1 km still resolved, on Goshen
FIG 2b 88 / 167 / 29         labeled check, not a tuning oracle
DEMO / Guided                no analysis profile
sandbox C                    still prescribed DEMO (10, 0)
source golden                not mutated
```

`54` is not declared wrong. Its compact lock-in remains
the construction record. This file qualifies **what that
record is allowed to mean**.

---

## 3. Epistemic status of `54`

**NEW PROJECT DECISION.**

| Reading | Status |
| --- | --- |
| `53` source vs analysis split | **ACCEPTED** |
| `54` AGL bin-mean, Δz = 100 m | **CANDIDATE** operator from Goshen 2155 research |
| `54` as validated universal / default production transform | **NOT** |
| `54` as implementation authorization | **NOT** |
| Analysis-profile implementation | **BLOCKED** |
| Gate | generalization / validation research (backlog **BL-037**) |

```text
selected production construction
        ↓  this file
candidate pending generalization validation
```

Do not implement 100 m bin-mean solely because `54`
contains that construction.

---

## 4. The generalization gate (BL-037)

**NEW PROJECT DECISION.** The gate is whether a candidate
Analysis transform can be a **general-purpose policy**,
not a Goshen-specific treatment.

Goshen is a **validation / reference case**. It is not
the owner of the algorithm.

Criterion, if a method is later chosen:

```text
cross-case scientific stability and defensibility
NOT closeness to one published benchmark
```

BL-037 must check, as one research program:

```text
independent sounding cases
different sampling regimes / profile classes
high-resolution mobile sounding
a more ordinary operational sounding, if available
sensitivity to analysis vertical scale
for binned operators: bin / grid phase / origin sensitivity
preservation of large-scale hodograph structure
stability of local ω_h
stability of SRH
no tuning to published Goshen 88 / 167
```

Markowski Fig. 2b 88 / 167 / 29 remain **external
validation benchmarks**, not a tuning oracle (`48` §12,
`53` §7, `54` §10).

This file does not run that research. A later research
record may **accept, qualify, or replace** the `54`
candidate. Until then, implementation stays blocked.

---

## 5. What this file does not choose

**ANTI-CLAIM.** No alternative is selected here:

```text
Leise
SHARPpy / MetPy / NSHARP as a production method
fixed 100 / 150 / 200 m as a settled default
adaptive scale
binning vs smoothing
any other filter
```

Those remain future research (BL-036 / BL-037). `54` §6
already rejected cloning an unspecified 5-step Leise;
that rejection stands and is not a selection of bin-mean
as production policy.

---

## 6. Authority chain

```text
53   source vs analysis distinction     ACCEPTED
54   first concrete candidate
     (AGL bin-mean, Δz = 100 m)         CONSTRUCTION RECORD
55   this file                          QUALIFIES 54
                                        candidate, not production
                                        policy; implementation blocked
BL-037
     generalization / validation        RESEARCH GATE
BL-010
     analysis-profile implementation    NOT STARTED / BLOCKED
                                        on 55 + BL-037
```

If a later document conflicts with this qualification
about **whether `54` authorizes implementation**, this
file wins for that epistemic question. `54` remains the
construction record of the candidate. `53` remains the
split.

Backlog items point here. They do not create this
status.

---

## 7. Compact lock-in

```text
SPLIT:             53 ACCEPTED
CANDIDATE:         54 AGL bin-mean, Δz = 100 m
                   (Goshen-derived; not withdrawn)
PRODUCTION POLICY: NOT YET VALIDATED
IMPLEMENTATION:    NOT AUTHORIZED; BLOCKED
GATE:              BL-037
BENCHMARKS:        Fig. 2b 88 / 167 / 29 external;
                   not a tuning oracle
NO NEW OPERATOR:   none selected
54 REWRITE:        none
V1:                CLOSED; not reopened
```

---

## 8. Implementation

This document does not include implementation.
Production `src/**` remains unchanged.
No analysis profile, no Δz default ship, no overlay
retarget, no DEMO / Guided / sandbox `C` change.
