# Goshen 2155 Source versus Analysis Profile

**Status:** RESEARCH CHECKPOINT / SOURCE-VS-ANALYSIS ACCEPTED /
ANALYSIS PROFILE NOT IMPLEMENTED
**Scope:** the architectural split between the imported
NSSL1 2155 UTC **source** wind column and a possible
later **analysis** representation of that column.
Not a V1 reopen. Not I3. Not Bunkers. Not observed
sandbox `C`. Not a golden rewrite. Not radar. Not
thermodynamics. Not reconstruction.
**Physics:** unchanged. `EnvironmentalWindProfile`,
shear, SRH, `ω_h`, and `T_tilt` APIs are not modified
by this file. I1 keep-t=0 and the 2029-knot golden
remain the source column.
**Implementation:** this file does not include an
analysis-profile implementation, a Leise operator in
`src/**`, or a sandbox `C` change.

Predecessor:

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
docs/architecture/49-r1-first-historical-reference-storm.md
docs/architecture/50-i2-goshen-sandbox-integration.md
docs/architecture/51-dense-observed-hodograph-display.md
```

Evidence record:

```text
docs/research/2026-08-27-goshen-2155-hodograph-reproduction.md
docs/research/sample-goshen-2155-hodograph-reproduction.ts
```

Operator construction (not this file; candidate, not
production policy):

```text
docs/architecture/54-storm-scale-analysis-wind-profile.md
```

Successor (epistemic status of that construction):

```text
docs/architecture/55-analysis-profile-generalization-gate.md
```

Analysis contract after source-class research (not an
implementation; not a filter selection):

```text
docs/architecture/58-source-class-aware-analysis-profile-contract.md
```

Related (additional ESC **source** columns; not analysis):

```text
docs/architecture/56-esc-multi-sounding-observed-profile-ingest.md
```

Keep these roles distinct:

```text
CURRENT FACT
NEW PROJECT DECISION
ANTI-CLAIM
```

---

## 1. Why this split exists

**CURRENT FACT.** The committed Goshen golden is the
native ESC column after I1 QC drop, not after
Markowski Fig. 2b plotting. Markowski et al. (2012)
Part I Fig. 2b draws **two** hodographs from the same
2155 UTC NSSL1 sounding:

```text
gray   unsmoothed ~1-s winds
black  5-step Leise; printed 0–1 / 0–3 SRH and
       0–6 km |ΔV| belong to this curve
C      observed (10.5, −1.3) m/s, subtracted for
       the storm-relative plot only
```

Explorer currently has only the source column. I2/`51`
plot every imported knot as the scientific polyline.
That polyline is the gray-class object.

The research comparison (`docs/research/2026-08-27-goshen-2155-hodograph-reproduction.md`)
showed:

```text
0–6 km |ΔV|     raw 30.06 vs published 29     agree
large-scale shape                               agree
U/V sign, m/s, AGL datum                        agree
0–1 km SRH      raw 133 vs published 88       disagree
local native-segment |ω_h|                      unusable
```

The 0–1 km SRH gap is the first 3.7 m launch
transient (`49` §7.1): Form B helicity 45.33 m² s⁻².
Excluding that segment yields 87.3 versus published
88. A 5-step Leise on native 1-s samples with frozen
endpoints does **not** recover 88, because it leaves
that endpoint in place.

---

## 2. Two representations, one sounding

**NEW PROJECT DECISION.**

For this historical column the project distinguishes:

```text
SOURCE PROFILE
  I1 golden / Explore V_env
  2029 knots
  keep t=0
  provenance = observed ESC
  scientific hodograph polyline

ANALYSIS PROFILE
  not present
  a later derived view of the same sounding
  would exist only to support smooth-hodograph
  comparison, published-comparable low-level SRH,
  or local ω_h / T_tilt at storm-relevant scales
```

The analysis profile, if introduced later, is not a
second archive, not a replacement golden, and not a
silent resample inside `EnvironmentalWindProfile`.

---

## 3. What the source profile is for

**CURRENT FACT / lock.**

```text
provenance and adapter tests
Explore V_env
scientific polyline (every imported knot)
0–6 km bulk wind difference
SRH as the Explorer integral of THIS column
  (133 / 198 m² s⁻² for 0–1 / 0–3 km at
   published C, including t=0)
```

I1 does not drop t=0. This file does not reopen that
drop policy.

---

## 4. What an analysis profile would be for

**NEW PROJECT DECISION.** Warranted later only if the
product needs one of:

```text
a Fig. 2b-black analogue
0–1 km SRH comparable to the published 88
local ω_h or T_tilt that is not native-segment noise
```

It is not warranted merely to make the Explore
hodograph look smoother. `51` already thins markers
and keeps the scientific path.

Any later transform must state exactly:

```text
input = source golden (preserved separately)
operator (grid, boundary, filter or layer)
output provenance as derived-from-source
comparison to Fig. 2b inset numbers as a labeled
  check, not as an oracle for the source adapter
```

Inventing a production smoothing length is out of
scope for **this** SoT. The Fig. 2b caption names a
5-step Leise filter but does not specify the input
grid or endpoint treatment.

The operator construction from diagnostic scale, not from
that caption, is recorded in:

```text
docs/architecture/54-storm-scale-analysis-wind-profile.md
```

Epistemic status of that construction (candidate pending
generalization; not implementation authorization):

```text
docs/architecture/55-analysis-profile-generalization-gate.md
```

---

## 5. Storm motion remains split

**CURRENT FACT.**

```text
sandbox / DEMO C     prescribed (10, 0) m/s     50 §6
published observed C (10.5, −1.3) m/s           sibling evidence
```

Fig. 2b `C` is used in the research reproduction.
It is not the Explore laboratory storm motion.
Goshen sandbox parcels are not observed Goshen
parcels (`50` §2, `48` §9.3).

---

## 6. Diagnostic suitability (source column)

**CURRENT FACT.**

| Diagnostic | Source 2029-knot column |
| --- | --- |
| Hodograph visualization of the observed column | suitable as the scientific polyline |
| 0–6 km bulk \|ΔV\| | suitable |
| Layer SRH of this column | suitable, with the named launch transient |
| Layer SRH as a Fig. 2b inset match | not without an analysis-profile policy |
| Native-segment `ω_h` | not suitable as environmental vorticity |
| `T_tilt` on native segments | not suitable as an environmental tilting diagnostic |

`T_tilt` still observes whatever profile is injected
(`22`). Injecting the raw golden does not authorize
reading native-segment `ω_h` as Goshen environmental
vorticity.

---

## 7. Anti-claims

```text
raw 1-s disagreement with 0–1 km SRH = 88
  is not an ingestion sign/unit failure
published 88 is not an oracle that the golden is wrong
skip-first matching 88 is not an I1 drop-t=0 decision
5-step Leise in the caption is not a fully specified
  production operator
visual smoothness is not by itself a filter proof
sandbox tracers are not observed Goshen parcels
published C is not sandbox C
Parker (2014) Barnes composite smoothing is not the
  Fig. 2b recipe
```

---

## 8. Compact lock-in

```text
IDENTITY:          NSSL1 2155 UTC = Fig. 2 sounding
SOURCE:            2029-knot golden; keep t=0
FIG 2b:            SR; C=(10.5,−1.3); black=Leise-5;
                   gray=unsmoothed; numbers on black
0–6 km |ΔV|:       source agrees with published 29
0–1 km SRH:        source 133; published 88; gap =
                   3.7 m launch transient
ANALYSIS PROFILE:  construction recorded in `54`;
                   contract in `58`; not implemented
SANDBOX C:         still DEMO (10, 0)
PHYSICS:           unchanged
IMPLEMENTATION:    not included
EPISTEMIC STATUS:  `55` — candidate pending
                   generalization; `58` — source-class
                   contract; neither authorizes
                   implementation
LEISE:             T5FLTR reconstructed in later
                   research; Fig. 2b grid still unknown;
                   not a production operator (`58`)
```
