# I2 Goshen Explore Sandbox Integration

**Status:** POST-I1 CHECKPOINT SoT / I2 DONE
**Scope:** the minimum path from completed Goshen ingestion
(I1) to one honest Explore sandbox whose environmental
wind is the observed NSSL1 2155 UTC column. Not a V1
reopen. Not Guided retarget. Not Bunkers. Not observed
C. Not radar. Not thermodynamics. Not G4. Not a provider
platform.
**Physics:** `48` remains the provider-neutral contract.
Seven `V_total` operands. Prescribed Ω and DEMO storm
operands unchanged. DEMO `C` remains prescribed in I2.
`EnvironmentalWindProfile.sampleAtHeight` unchanged.
**Implementation:** Explore-only DEMO|Goshen identity.
Runtime profile is the committed golden via
`nssl1Goshen2155Record`. Native `.cls` is not a runtime
input. Guided and `DEMO_SCENARIO` are unchanged.

Predecessor:

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
docs/architecture/49-r1-first-historical-reference-storm.md
```

Successor:

```text
docs/architecture/51-dense-observed-hodograph-display.md
```

I2 thinned dense height labels and kept every imported
knot on the scientific polyline. Per-knot markers and
the shared display-index contract are `51`.

Keep these roles distinct:

```text
CURRENT FACT
NEW PROJECT DECISION
ANTI-CLAIM
```

---

## 1. Native replay

**CURRENT FACT.** Local native
`NSSL_MGAUS_20090605.cls` was passed through the live I1
adapter `ingestNssl1Goshen2155Esc` and compared to the
committed 2029-level golden.

```text
NATIVE REPLAY PASS
levels              2029
minHeight           2.4
maxHeight           12261.8
dropped             53
first               height 2.4, eastward -1.2, northward 0.2
last                height 12261.8, eastward 26.8, northward 5.7
location            41.278 N, 103.893 W
```

Every kept level matched the golden exactly. This check
is not part of `npm test`. G4 remains OPEN.

**NEW PROJECT DECISION.** Verdict **B**:
recommended, not blocking.

```text
A separate I1-R slice is not required before I2.
Synthetic fixtures do not prove the 2.6 MB file;
that proof was obtained locally in this checkpoint.
I2 must not add native .cls to npm test.
I2 boots from the committed normalized golden, not
from gitignored EOL bytes.
```

Replay remains a local explicit check. It is not a new
subsystem.

---

## 2. What I2 is

**NEW PROJECT DECISION.**

I2 is Explore-only injection of the I1 Goshen
`EnvironmentalWindProfileRecord` into the existing
storm-relative laboratory.

User-visible outcome:

```text
In Explore, a person can deliberately choose
“Goshen 2009 observed environment” instead of the
default DEMO prescribed environment, then see and
trace in a laboratory whose V_env / hodograph come
from that observed column, while storm-local
operands and C stay the prescribed DEMO laboratory.
```

It is **not** a Goshen storm simulation.

---

## 3. Sandbox identity

**NEW PROJECT DECISION.**

Smallest honest surface: an Explore-only environment
identity with two values:

```text
demo-prescribed     default Explore; current DEMO profile
goshen-2009-observed
                    I1 record; NSSL1 2009-06-05 21:55:22
```

Not a global app mode. Not a scenario marketplace.
Guided has no such control.

App still boots Guided / DEMO. Entering Explore without
choosing Goshen remains DEMO. Switching identity rebuilds
the Explore lab so the field and hodograph are the same
column.

The control lives with the existing Environment surface
(Explore overlay), not a new product chrome.

---

## 4. Ownership / wiring seam

Live hard-wires (`CURRENT FACT`):

```text
composeDemoTracerFields
  always createEnvironmentalWindProfile(DEMO_SCENARIO)
createExploreLab / createGuidedLab
  both call that DEMO compose
App.tsx
  hodograph via createDemoHodographPoints()
  C via DEMO_SCENARIO.stormMotion
  overlays via createDemoVorticityLayer [0, 1000]
```

I2 seam:

```text
profile  → physics (EnvironmentalWindProfile only)
record   → Explore session / Environment surface identity

composeDemoTracerFields accepts an optional
  EnvironmentalWindProfile; default remains DEMO
storm factories and DEMO_SCENARIO.stormMotion unchanged
createExploreLab accepts the optional profile/record
createGuidedLab does not take a profile override
App Explore branch owns environment identity and
  passes hodographPoints(activeProfile)
I2 loads Goshen from the committed normalized golden
  + nssl1Goshen2155Record, not native ESC parse
```

Physics does not import provenance. App/Explore does not
drop the record.

---

## 5. What changes when Goshen is active

Derived from the imported profile by existing machinery:

```text
hodograph          hodographPoints(goshenProfile)
V_env              EnvironmentalWindField(profile)
V_sr               StormRelativeEnvironmentalAdvectionField
                   + prescribed DEMO C
environmental operand / V_total / tracers
shear, ω_h, streamwise/crosswise, SRH
  (on support; existing reject-clamp)
T_tilt,y           DiagnosticTiltingTendency(profile, DEMO updraft)
```

Do not recompute these in `src/data/**`.

DEMO-specific UI that **must not** run on Goshen:

```text
createDemoHodographPoints
createDemoVorticityLayer          h0 = 0 throws on Goshen
createDemoStreamwiseCrosswiseOverlay
DEMO_SELECTED_HEIGHT = 0         no Goshen knot at 0
```

I2 omits those DEMO overlay recipes for Goshen. The
Goshen Environment surface shows the imported hodograph
and prescribed C. It does not reuse the DEMO `[0, 1000]`
overlay.

---

## 6. What must not change

```text
DEMO_SCENARIO knots and DEMO C
Guided catalog, seeds, createGuidedLab
Ω / rotation, updraft, lower inflow, upper outflow,
  downdraft, near-ground outflow
ω_y,current Candidate A (rotation-only)
seven-operand keys
VelocityField.sample shape
```

C in I2 is **DEMO prescribed** `(10, 0)` m/s. That closes
`48` U3 for this slice. Markowski observed
`(10.5, −1.3)` remains sibling evidence only.

---

## 7. Honesty surface

Minimum copy, on the Explore Environment surface when
Goshen is active:

```text
Observed: environmental wind, NSSL1 / Bushnell,
  2009-06-05 21:55:22 UTC (EOL 114.114).
Prescribed: storm-local kinematic model and storm
  motion C in this laboratory.
```

`48` §9.3 anti-claim remains binding. I2 does not rewrite
tutorials or Guided copy.

Must not imply simulation, reconstruction, observed Ω,
observed storm operands, observed C, or historical
parcels.

Provenance fields from the I1 record (sourceClass,
sourceIdentity, validTime, location, heightDatum,
coverage) stay on the record and are the identity the
surface names. They do not enter physics.

---

## 8. Hodograph

`hodographPoints(profile)` already emits every knot.
Goshen has 2029. That is the scientific path.

`HodographPanel` currently draws a polyline **and** a
circle + height label for every point. 2029 labels are a
display problem, not a physics problem.

**NEW PROJECT DECISION.**

```text
I2 data: all 2029 imported knots. No scientific
  resampling of the profile.
I2 display: keep the polyline of imported points;
  do not require per-knot height labels at 2029
  density. Sparse labels are a panel display detail.
```

I2 did **not** thin knot markers. Dense marker thinning
is `51`, using the same display subset as labels.

Do not downsample the `EnvironmentalWindProfile` to five
DEMO heights.

---

## 9. Coverage / blockers

Goshen support: **2.4 m … 12261.8 m**.

Existing semantics stay:

```text
sampleAtHeight          clamp outside support
shear / SRH             reject clamped continuation
T_tilt,y                0 outside sounding segment
default Explore altitude 1000 m   inside support
visual airflow y 0–9000          y=0 clamps; not a blocker
```

Not an I2 physics blocker. The real I2 trap is DEMO
overlay `verticalWindShearBetween(profile, 0, 1000)`,
which throws on Goshen. I2 must not call it.

---

## 10. Tests (I2)

Do not duplicate I1 parser tests.

```text
Guided remains DEMO profile and DEMO C
Explore default remains DEMO
Goshen Explore uses the golden Goshen profile
  (2029 levels, minHeight 2.4, maxHeight 12261.8)
hodograph points come from that profile, not DEMO knots
environment operand / T_tilt,y differ from DEMO at a
  named interior height
storm operands 2–7 remain DEMO factories
C remains DEMO prescribed (10, 0)
Goshen surface names observed RAOB vs prescribed storm/C
no string claims this is a Goshen storm reconstruction
DEMO [0,1000] overlay is not applied to Goshen
switching identity rebuilds Explore lab
```

---

## 11. Scope

| Item | Class |
| --- | --- |
| Native source replay | DONE in this checkpoint as local check; not npm test |
| Explore environment identity DEMO / Goshen | **I2** |
| Observed Goshen profile in Explore | **I2** |
| Honesty / provenance on Environment surface | **I2** |
| Hodograph from imported knots + display-label thinning | **I2** |
| Dense display markers (same subset as labels) | **51** |
| Optional profile arg on DEMO compose / Explore lab | **I2** |
| Observed Goshen C | LATER |
| Bunkers C | REJECTED FOR I2 |
| Second provider | LATER |
| Moore curated case | LATER |
| Thermodynamics | REJECTED FOR I2 |
| Radar | REJECTED FOR I2 |
| Reconstruction | REJECTED FOR I2 |
| Inter-source uncertainty | REJECTED FOR I2 |
| Editable profile | LATER |
| Live feed | REJECTED FOR I2 |
| Changing Guided | REJECTED FOR I2 |
| G4 redistribution | OPEN; out of I2 |
| Native `.cls` in npm test | REJECTED FOR I2 |

---

## 12. Production files likely to change in I2

```text
src/app/composeDemoTracerSimulation.ts
src/app/createExploreLab.ts
src/app/App.tsx
src/ui/hodograph/HodographPanel.tsx
src/ui/hodograph/EnvironmentSurface.tsx
Explore wiring tests next to those files
```

Unchanged in I2:

```text
src/scenario/DEMO_SCENARIO.ts
src/app/createGuidedLab.ts
src/physics/environment/EnvironmentalWindProfile.ts
src/data/eolNsslMgausEsc/ parser (I1)
native EOL bytes
```

I2 may import the committed golden JSON and
`nssl1Goshen2155Record`. It does not parse the campaign
`.cls` at runtime.

---

## 13. Compact lock-in

```text
NATIVE REPLAY:   B; ran locally; exact golden match
I2:              Explore-only DEMO|Goshen identity
PROFILE PATH:    committed golden → record.profile
C:               DEMO prescribed
STORM OPERANDS:  DEMO prescribed
GUIDED:          DEMO, unchanged
HODOGRAPH:       2029 imported knots; sparse labels
DISPLAY MARKERS: 51 (same subset as labels)
OVERLAY [0,1000]: DEMO-only; omit on Goshen
G4:              OPEN
IMPLEMENTATION:  Explore-only DEMO|Goshen identity;
                 committed golden, not native .cls
V1:              CLOSED
```
