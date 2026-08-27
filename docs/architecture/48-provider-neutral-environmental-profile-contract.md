# Provider-Neutral Environmental-Profile Contract

**Status:** POST-V1 ENVIRONMENT CONTRACT SoT /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** the minimum provider-neutral environmental-wind
profile boundary needed so the existing Explorer can later
load **one** real historical atmospheric wind profile and
use it as the laboratory environment. Not live weather.
Not observed-storm reconstruction. Not radar. Not
thermodynamics. Not a scenario marketplace. Not a
multi-provider platform. Not `ROADMAP.md`. Not a V1 reopen.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). Exactly
seven `V_total` operands. Prescribed Ω semantics unchanged.
`VelocityField.sample(position, time) → Vec3` unchanged.
`EnvironmentalWindProfile.sampleAtHeight(height)` unchanged
as the kinematic sampler. V1 DEMO knots and DEMO `C` are
not modified by this file.
**Implementation:** none. Docs-only. Production `src/**`
MUST remain unchanged. This file does not authorize a
provider, a download, Bunkers, a DEMO_SCENARIO change, a
Guided retarget, or thermodynamics.

Predecessor source / reconstruction boundary:

```text
docs/architecture/44-long-term-source-and-reconstruction-boundary.md
```

Successor R1 selection (closes this file's research
gate R1; still no implementation):

```text
docs/architecture/49-r1-first-historical-reference-storm.md
```

V1 CLOSED record (do not reopen):

```text
docs/reviews/2026-08-27-v1-closed.md
```

Related still-binding SoTs (not replaced):

```text
docs/physics/04-environmental-wind-profile.md
docs/physics/05-vertical-wind-shear.md
docs/physics/06-horizontal-vorticity.md
docs/physics/07-storm-relative-wind.md
docs/physics/08-streamwise-crosswise-vorticity.md
docs/physics/09-storm-relative-helicity.md
docs/physics/10-hodograph-basics.md
docs/physics/19-storm-relative-environmental-advection.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/architecture/01-scenario-config.md
docs/architecture/03-wind-tunnel-storm-relative-3d-semantics.md
docs/architecture/08-story-seeds.md
docs/architecture/12-downward-ground-impact-pedagogy.md
docs/architecture/14-near-ground-outflow-pedagogy.md
docs/architecture/17-guided-experiment-catalog.md
docs/architecture/30-model-class-decision.md
docs/architecture/38-v1-scope-checkpoint.md
docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md
docs/rendering/09-deep-environmental-profile-demo.md
docs/CONCEPT.md
docs/ARCHITECTURE.md
```

Verified against live `src/**` at:

```text
2334e2329db114e5421d01f48df09d530284ded3
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
NEW PROJECT DECISION
ANTI-CLAIM
OPEN QUESTION
RESEARCH GATE
```

This document did **not** change production code.

---

## 1. Why this contract exists

`44` placed data-driven environmental profiles on the
Explorer **engineering / consume** track, immediately after
the prescribed kinematic laboratory, and required a
provider-neutral contract **before** choosing RAOB, RAP,
HRRR, or any other provider.

The next concrete milestone is narrower than `44` §3.1
step 2 in the large:

```text
LOAD ONE REAL HISTORICAL ATMOSPHERIC WIND PROFILE
AND USE IT AS THE ENVIRONMENT OF THE EXISTING EXPLORER.
```

That milestone is **not**:

```text
live weather
observed-storm reconstruction
radar integration
thermodynamic feedback
a scenario marketplace
support for many providers
a general atmospheric data platform
```

This file is that contract. It is the smallest scientifically
honest boundary that lets the existing fixed DEMO
environmental wind profile eventually be replaced, in an
opt-in sandbox, by one externally sourced historical
profile.

`38` §13 ENVIRONMENT / SCENARIOS (curated hodograph
scenarios, editable hodograph, scenario editor) remains
POST-V1 **product parking**. It is not this contract.

Reconstruction remains behind `44`. This file does not
reopen dual-Doppler, GBVTD, variational retrieval,
reconstruction uncertainty, or `VelocityField` confidence.

---

## 2. Current-state evidence

**Kind:** CURRENT FACT, verified against live docs and
`src/**` at `2334e23`.

### 2.1 Where the environmental wind profile lives

Kinematic object:

```text
src/physics/environment/EnvironmentalWindProfile.ts
docs/physics/04-environmental-wind-profile.md
```

Each level is `{ height, velocity: AtmosphericVelocity }`.
`vertical` must be `0`. Heights are strictly increasing and
finite. At least two levels. Invalid input is rejected, not
silently repaired (`04` §20).

Sampler:

```text
sampleAtHeight(height) → AtmosphericVelocity
```

Horizontally homogeneous and steady. Ignores world X/Z,
simulation time, tracers, and storm motion.

World adapter (not the profile):

```text
src/physics/environment/EnvironmentalWindField.ts
sample(position, time) → Vec3
  height = position.y
  → sampleAtHeight
  → atmosphericVelocityToWorld
```

Canonical mapping (`00`, live `AtmosphericVelocity.ts`):

```text
world.x = eastward
world.y = vertical
world.z = −northward
```

### 2.2 Where DEMO wind levels are defined

Authoritative DEMO knots:

```text
src/scenario/DEMO_SCENARIO.ts
docs/rendering/09-deep-environmental-profile-demo.md
```

```text
height m | eastward m/s | northward m/s
       0 |           15 |             5
    1000 |            5 |            15
    2000 |           10 |            25
    6000 |           30 |            20
   12000 |           40 |            10
```

Scenario DTO (`ScenarioConfig.environment.windLevels`)
stores `{ height, eastward, northward }` only. Vertical is
inserted as `0` by `createEnvironmentalWindProfile`
(`src/scenario/createEnvironmentalWindProfile.ts`).

Physics does not own DEMO knots. `04` §4 is explicit:
laboratory knots belong to rendering DEMO documents.

### 2.3 Interpolation and clamp

Live `sampleAtHeight`:

- exact knot → that knot's wind;
- between knots → linear interpolation in atmospheric
  `eastward` / `northward`; `vertical` remains `0`;
- `h < minHeight` or `h > maxHeight` → clamp to the nearest
  endpoint wind.

Shear, vorticity, and SRH **reject** layers that use
clamped continuation (`05` §8, live
`verticalWindShearBetween`, `stormRelativeHelicityBetween`).
Clamp is an advection convenience, not extra observation.

Irregular spacing is already legal. The constructor does
not require uniform `Δh`.

### 2.4 Hodograph

```text
src/physics/environment/hodograph.ts
docs/physics/10-hodograph-basics.md
src/app/demoHodographFixture.ts
src/app/App.tsx          // createDemoHodographPoints()
```

The hodograph is a derived read-only view of
`EnvironmentalWindProfile`. Live App plots DEMO points.
DEMO layer overlays `[0, 1000]` and streamwise/crosswise
basis `V_sr_avg` of those endpoints are **DEMO composition**,
not profile primitives (`demoHodographFixture.ts`).

SRH exists as physics (`09`,
`stormRelativeHelicityBetween`) and is **not** a live UI
quantity (`38` U6 unresolved). It is still an
environment-derived diagnostic of the current stack.

### 2.5 Storm-relative wind and StormMotion C

Value-only type:

```text
src/physics/environment/stormRelativeWind.ts
docs/physics/07-storm-relative-wind.md
```

```text
StormMotion = { eastward, northward }   // m/s, no vertical
V_sr.eastward  = V_env.eastward  − C.eastward
V_sr.northward = V_env.northward − C.northward
V_sr.vertical  = V_env.vertical
```

DEMO C (`DEMO_SCENARIO.stormMotion`, `KNOWN_LIMITATIONS`):

```text
C = (eastward=10, northward=0) m/s
```

Prescribed laboratory constant. Not Bunkers. Not an
observed track. `ScenarioConfig` keeps `stormMotion`
**top-level**, not nested under `environment` or `storm`
(`01`).

Live particle integration (D2) subtracts that same C from
the **environmental operand only**:

```text
src/physics/environment/StormRelativeEnvironmentalAdvectionField.ts
docs/physics/19-storm-relative-environmental-advection.md
src/app/composeDemoTracerSimulation.ts
  IntegrationFrame.StormRelativeLaboratory  // live App
```

Hodograph / D1 diagnostics stay on the ground-relative
profile plus `stormRelativeWind`. The profile never
silently subtracts C (`04` §16, `07` §9).

### 2.6 Diagnostics that consume the profile

| Diagnostic | Direct inputs | Live? |
| --- | --- | --- |
| Hodograph points/segments | profile | yes (DEMO) |
| `verticalWindShearBetween` | profile, `[h0,h1]` | hodograph overlay via DEMO fixture |
| `horizontalVorticityFromShear` | shear | same |
| `stormRelativeWind` | sampled `V_env`, C | hodograph overlays |
| `decomposeHorizontalVorticity` | `V_sr`, `ω_h` | DEMO `[0,1000]` overlay |
| `stormRelativeHelicityBetween` | profile, C, `[h0,h1]` | physics only |
| `DiagnosticTiltingTendency` `T_tilt,y` | profile + updraft | Explore point diagnostics |
| `DiagnosticVerticalVorticity` `ω_y,current` | **rotation only** | Explore point diagnostics |

Chain (`04` §18, live code):

```text
EnvironmentalWindProfile
  → EnvironmentalWindField / StormRelativeEnvironmentalAdvectionField
  → hodograph
  → vertical wind shear → horizontal vorticity
  → storm-relative wind (with sibling C)
  → streamwise / crosswise
  → SRH
  → T_tilt,y  (ω_h from profile × updraft ∇_h Vy)
```

`ω_y,current` does **not** read the profile
(`DiagnosticVerticalVorticity.ts`; `23`).

### 2.7 Seven V1 velocity operands

Live order (`DEMO_VELOCITY_CONTRIBUTION_KEYS`,
`composeDemoTracerFields`):

| # | Key | Depends on environmental profile? |
| --- | --- | --- |
| 1 | `environmentAdvection` | **YES** |
| 2 | `updraft` | no |
| 3 | `rotation` | no |
| 4 | `lowerInflow` | no |
| 5 | `upperOutflow` | no |
| 6 | `downdraft` | no |
| 7 | `nearGroundOutflow` | no |

Operand 1 is `EnvironmentalWindField` or
`StormRelativeEnvironmentalAdvectionField(env, DEMO C)`.
The other six are prescribed storm fields from
`DEMO_SCENARIO.storm`.

`V_total` is the unweighted sum. Changing operand 1 changes
`V_total` and therefore tracer trajectories, even when the
six storm operands are frozen.

### 2.8 Guided dependence on the DEMO environment

Guided is the same seven-operand Model with curated seeds
(`17`, `20`). Factory:

```text
createGuidedLab → composeDemoTracerLab(StormRelativeLaboratory, pedagogy)
```

Seeds are DEMO arrays (`08`, `12`, `14`,
`DEMO_SCENARIO.simulation`):

```text
S1  (0, 1000, 4000)
S2  (0, 1000, 6000)
D1  (5000, 1000, 0)
NG1 (3000, 100, 4750)
```

Public catalog copy is qualitative (`GuidedExperiment.ts`):
pathlines **can** occupy named regions. It does not quote
DEMO knot values.

The **exhibits themselves** are DEMO-tuned. `12` §5.4 is
explicit: live storm-relative environmental advection is
why D1 hits or misses. `V_sr(1000 m) ≈ (−5, +15)` for the
DEMO profile and DEMO C. `08` occupancy times and outflow
entry radii are measured on that same field. `38` §5.5
requires Guided pinning before any second environment.

**CURRENT FACT:** replacing only the profile, while keeping
those seeds, would silently change Guided path geometry.
Catalog sentences could still read as true while the
validated exhibit became a different path, a miss, or a
different landing.

### 2.9 What is absent

```text
no sounding / RAOB / RAP / HRRR provider
no AtmosphericProfileSource interface
no provenance type on EnvironmentalWindProfile
no DatasetVelocityField
no retrieval / dual-Doppler / DA
no thermodynamics on the profile
no Bunkers
no live SRH panel
```

---

## 3. Ownership map

```text
kinematic wind vs height
  EnvironmentalWindProfile          physics/04; live class
  DEMO knots                        DEMO_SCENARIO; rendering/09

world advection of that wind
  EnvironmentalWindField            physics/04 §11
  StormRelativeEnvironmentalAdvectionField   physics/19 (D2)

storm motion value
  StormMotion                       physics/07; value-only
  DEMO C                            DEMO_SCENARIO.stormMotion
                                    sibling of environment, not inside it

derived environment diagnostics
  hodograph, shear, ω_h, V_sr,
  streamwise/crosswise, SRH         physics/05–10
  T_tilt,y                          physics/22; profile + updraft

prescribed storm operands
  updraft, rotation, in/outflow,
  downdraft, near-ground outflow    physics/15–21; DEMO_SCENARIO.storm

composition
  composeDemoTracerFields           hardcodes DEMO_SCENARIO
  App.tsx                           DEMO hodograph + DEMO C
  createGuidedLab                   DEMO composition + DEMO seeds

this contract (conceptual; not implemented)
  normalized wind record            kinematic profile + provenance
  provider adapter                  outside physics
  storm-motion provenance           sibling of the profile
```

---

## 4. What “environmental profile” means here

**NEW PROJECT DECISION.**

Explorer currently consumes a **ground-relative horizontal
wind as a function of height**. That remains the core
scientific object.

### 4.1 Required kinematic fields (now)

```text
height      meters, same vertical axis/datum as world Y
eastward    m/s
northward   m/s
vertical    0  (first environmental model; 04 §3)
```

At least two levels. Strictly increasing finite heights.
Finite winds. Duplicate heights invalid.

This is exactly the live `EnvironmentalWindProfile`
invariant. The normalized consumer object **is** that
object, not a parallel sampler.

### 4.2 Required record metadata (now)

The kinematic sampler must stay
`sampleAtHeight(height)`. Time and location do **not**
become sampling axes in this milestone: the imported
column remains horizontally homogeneous and steady, like
V1.

They **are** required on a sibling **record** so the column
is scientifically named:

```text
sourceClass     laboratory-prescribed
                | observed-raob
                | model-analysis
                | reanalysis
                | other-named

sourceIdentity  archive / product / station / run id
                enough to freeze a fixture

validTime       the time the column claims to represent
location        lat/lon or equivalent station identity
heightDatum     how reported height became world Y
                (see §4.4)
coverage        minHeight, maxHeight, dropped levels,
                large gaps after drop
nativeUnitsNote original wind units / direction convention
                before normalization
```

Uncertainty stays **only** where the source actually
provides it (QC flags, missing codes). It is not a scalar
`confidence` on `V_env` (`44` §6). Inter-source
disagreement is out of scope until provider #2 (`44` §6.5).

### 4.3 Fields not required now

Do **not** add merely because real soundings contain them:

```text
temperature
dew point
pressure as a consumed Explorer coordinate
humidity / mixing ratio
CAPE / CIN / other parcel indices
wind speed/direction as stored consumer fields
  (adapter may decode them; the profile stores components)
```

Pressure may be used **inside** an adapter to obtain
height. It is not a required field of the Explorer
profile.

### 4.4 Vertical reference

V1: `profile height = world position.y`. No AGL / MSL /
terrain conversion (`04` §2).

First imported profile must **emit** heights already in
that same world-Y meter axis. Conversion is adapter work.

The record must name the assumption, for example:

```text
reported geopotential height minus station elevation
  → treated as world Y (implied flat ground)
```

or:

```text
reported height used as world Y without station correction
```

Either is an adapter policy and must be visible in
provenance. This file does not add an AGL/MSL solver to
physics.

### 4.5 Conceptual record (not implemented)

```text
EnvironmentalWindProfileRecord
  profile:     EnvironmentalWindProfile   // existing class
  provenance:  the metadata in §4.2
```

This is a naming / ownership lock, not a TypeScript DTO
in `src/**`.

Storm motion is **not** a field of this record (§8).

---

## 5. Profile data vs provider

**NEW PROJECT DECISION.**

Separate:

```text
A. normalized profile Explorer consumes
     EnvironmentalWindProfile
     + EnvironmentalWindProfileRecord provenance

B. external provider / adapter
     obtains source bytes, decodes, converts, drops,
     and emits A
```

Physics must not know whether A came from RAOB, a model
column, a local fixture, or a future provider.

### 5.1 What is required now

```text
one adapter for provider #1
normalization inside that adapter
provenance on the record, including sourceClass
existing EnvironmentalWindProfile as the kinematic sink
```

### 5.2 What waits until provider #2

```text
AtmosphericProfileSource / provider interface
a provider registry
inter-source disagreement / comparison API
shared download client
a second native format
generic QC enum unification across agencies
```

**Q5: an `AtmosphericProfileSource`-style interface is
not justified now.** One adapter plus one frozen fixture
is the whole provider surface. A second implementor would
earn an interface. Speculative abstraction is rejected.

### 5.3 Where normalization belongs

In the adapter, **before** `new EnvironmentalWindProfile`.

The profile constructor remains strict (`04` §20): no
sort, no dedupe, no forcing `vertical` to 0, no filling
missing winds. The adapter must present a legal level
list or fail explicitly.

### 5.4 Where provider-specific metadata belongs

On the adapter / record provenance, not on
`EnvironmentalWindProfile`, not on `VelocityField`, and
not inside Inspector `parts`.

Examples that stay provider-specific:

```text
BUFR / text / GRIB native layout
pressure-level ids
RAOB QC flag tables
model grid I / J / member
download URL, API key, rate limits
thermodynamic columns in the native file
```

---

## 6. Coordinate, unit, and sign enforcement

**NEW PROJECT DECISION.**

The consumer contract is the project atmospheric
convention (`00`, `04`):

```text
height     m, world Y datum after adapter conversion
eastward   m/s
northward  m/s
vertical   0
```

Adapter responsibilities:

```text
native speed/direction or u/v
  → eastward / northward (meteorological components)
native knots / mph / other
  → m/s with a documented conversion constant
native pressure coordinate
  → height m (adapter method named in provenance)
native vertical velocity, if present
  → dropped / ignored; Explorer profile vertical is 0
```

World conversion remains the existing helpers. Diagnostics
stay in atmospheric components until a world boundary is
required.

Deterministic tests (later implementation, not this file)
must lock at least:

```text
pure eastward wind → world.x > 0, world.z = 0
pure northward wind → world.x = 0, world.z < 0
known native unit sample → exact SI components
```

---

## 7. Irregular and missing vertical levels

**NEW PROJECT DECISION.**

Real columns are dirty. The kinematic profile is not.

Adapter policy:

```text
missing / null / QC-failed wind at a level
  → drop that level; do not invent a wind

duplicate height after conversion
  → fail; do not average

non-finite height or wind after conversion
  → fail

fewer than two remaining wind levels
  → fail

remaining heights not strictly increasing
  → fail (adapter must not silently sort unless a
    named, tested adapter step documents that sort
    as format repair before physics construction)
```

After a legal drop, **existing** piecewise-linear
interpolation applies across the remaining knots. A large
gap is interpolation across known endpoints, not extra
observation. `coverage` must record dropped levels and
gap spans so diagnostics do not treat a 4 km interpolated
hole as densely observed.

Clamp above/below support remains the V1 advection policy.
Shear / SRH / T1 segment lookup continue to refuse
clamped continuation (`05`, `09`,
`soundingSegmentContainingHeight` returns null outside
`[minHeight, maxHeight]`, and T1 then returns `0`).

Imported profiles that do not start at `0` or do not reach
`12000 m` are legal. DEMO overlay layer `[0, 1000]` is
**not** part of the contract. Layer diagnostics in a
sandbox must choose `[h0, h1]` inside that profile's
support.

---

## 8. Storm-motion provenance

**NEW PROJECT DECISION.** Authoritative context: `44` §8.2.

### 8.1 Profile vs C

Storm motion is a **sibling environmental input**, not a
field of `EnvironmentalWindProfile` and not a field of
`EnvironmentalWindProfileRecord`.

This matches live ownership: `environment.windLevels` vs
top-level `stormMotion` (`01`).

### 8.2 Conceptual contract for C

Whenever C can come from more than one epistemic class,
the laboratory must be able to state:

```text
value            horizontal vector (eastward, northward) m/s
source-or-method how C was obtained
validity         time / location / applicability
provenance class prescribed | derived | observed
```

Those classes are not interchangeable because they share
a vector shape (`44` §8.2).

```text
prescribed  authored constant (current V1 DEMO C)
derived     named estimator from a profile (e.g. a
            future Bunkers-type method — not selected)
observed    measured storm motion (e.g. cell tracking)
```

The live `StormMotion` type stays **value-only**. This
file does not add fields to that type, does not design a
TypeScript DTO, and does not change the subtraction map.

### 8.3 First historical sandbox

```text
C remains prescribed.
DEMO C = (10, 0) m/s remains scientifically interpretable
  as the V1 laboratory constant.
Bunkers is not selected and not the post-V1 default.
38 U5 (rule vs per-scenario constant for a later curated
  scenario product) is not reopened.
```

A later sandbox-authoring SoT may choose a **different
prescribed** C for a named case. That would still be
prescribed, with provenance class `prescribed`. It would
not be a derived or observed C.

Keeping DEMO C beside a real hodograph will look “wrong”
to a meteorologist (`38` §5.3). That mismatch is a labeled
honesty cost of the first sandbox, not a reason to sneak
in an estimator.

---

## 9. What changes if only the profile is replaced

**Kind:** CURRENT FACT from live composition, plus
**NEW PROJECT DECISION** that the first sandbox must
teach this table rather than hide it.

Assume: six storm operands frozen; Ω frozen; C frozen as
prescribed DEMO `(10, 0)`; integration frame remains
`StormRelativeLaboratory`.

### 9.1 CHANGES

| Quantity | Why |
| --- | --- |
| `EnvironmentalWindProfile` | the replaced object |
| Hodograph | derived from the profile |
| Ground-relative `V_env(h)` | sampler output |
| Storm-relative `V_sr(h)` | `V_env − C` with C fixed |
| Operand 1 `environmentAdvection` | D2 uses `V_env − C` |
| `V_total` | sum includes operand 1 |
| Tracer trajectories | integrate `V_total` |
| Finite-layer shear | profile endpoints |
| Horizontal vorticity `ω_h` | from shear |
| Streamwise / crosswise | `ω_h` and `V_sr` basis both change |
| SRH | profile + same C |
| `T_tilt,y` | env `ω_h` × unchanged updraft `∇_h Vy` |
| Inspector environmental contribution | operand 1 samples |
| DEMO `[0,1000]` overlay numbers | DEMO-specific; may be undefined if support ≠ DEMO |

### 9.2 UNCHANGED

| Quantity | Why |
| --- | --- |
| StormMotion **value** (if kept) | sibling prescribed input |
| Ω / rotation field | prescribed storm |
| Updraft field | prescribed storm |
| Lower inflow, upper outflow | prescribed storm |
| Downdraft, near-ground outflow | prescribed storm |
| Operand keys 2–7 | not functions of the profile |
| `ω_y,current` | Candidate A observes rotation only |
| `VelocityField.sample → Vec3` | consumer port |
| Seven-operand ontology | laboratory ontology, not retrieval |
| Guided catalog **copy** strings | product identity; exhibits still DEMO-tuned |

### 9.3 Anti-claim the future UI/docs must carry

```text
A real environmental profile does NOT make the whole
storm “real”.
```

Expanded, still binding:

```text
MAY infer
  the hodograph, V_env, V_sr (relative to this prescribed C),
    ω_h, streamwise/crosswise, SRH, and T_tilt,y are those
    of the imported column (plus this C)
  parcels move differently because environmental transport
    changed

MAY NOT infer
  the prescribed storm responded to the sounding
  Ω, updraft, inflow, outflow, downdraft, or near-ground
    outflow were inferred from the profile
  ω_y,current is the mesocyclone of that historical storm
  tracers are observed parcels of that storm
  this is a reconstruction, forecast, or realistic supercell
  C is the motion of the historical storm
```

This is the same hazard `38` §5.4 recorded for a second
environment, now applied to a **real** column. A
severe-weather-literate user will expect “this sounding →
this supercell.” V1 construction violates that expectation
on purpose. The sandbox must say so.

---

## 10. Guided and DEMO scientific claims

**NEW PROJECT DECISION.**

Qualitative catalog claims (`17`, `GuidedExperiment.ts`)
do not quote DEMO knots. They still describe exhibits
whose seeds and path geometry were validated on DEMO
`V_sr` (`08`, `12` §5.4, `14`, `38` §5.5).

Silently driving Guided from an imported profile would
invalidate those exhibits as validated objects, even if
the sentences still sound plausible.

```text
First historical sandbox does not retarget Guided.
createGuidedLab remains on DEMO_SCENARIO.
DEMO_SCENARIO knots and DEMO C are not edited “to prepare”
  for import.
```

Any later Guided-on-imported-profile work needs its own
pinning SoT (seeds, hit/miss, honesty copy). That work is
not this contract and is not the first sandbox.

---

## 11. First historical sandbox contract

**NEW PROJECT DECISION.**

### 11.1 What it is

```text
One frozen real historical atmospheric wind column
  → one adapter
  → EnvironmentalWindProfileRecord
  → existing EnvironmentalWindProfile
  → hodograph + existing environment-derived diagnostics
  → later opt-in Explore / laboratory environmental operand
     while six storm operands and prescribed C stay DEMO
```

### 11.2 It SHOULD test

```text
dirty / nonuniform vertical levels
normalization (units, components, height datum)
existing interpolation and clamp
coordinate / sign conventions
provenance fields
hodograph generation from imported knots
shear, ω_h, V_sr, streamwise/crosswise, SRH on support
T_tilt,y changing because ω_h changed
operand 1 / V_total / tracers changing with the profile
```

### 11.3 It must NOT imply

```text
the prescribed storm dynamically responds to the environment
observed-storm reconstruction
forecast skill
Ω or the six non-environmental operands are inferred
  from the sounding
a historical storm is being simulated
C is derived or observed
Guided exhibits remain valid under the new column
thermodynamic sounding capability
live weather
```

### 11.4 Success (Q15)

Success is a **named frozen fixture** that:

1. normalizes through the adapter without silent repair
   inside physics;
2. constructs a legal `EnvironmentalWindProfile`;
3. carries provenance (`§4.2`) including `sourceClass` and
   height-datum assumption;
4. produces a hodograph from its own knots;
5. exercises existing diagnostics inside its support;
6. (later slice) can be injected as Explore's environmental
   operand without editing DEMO knots or Guided;
7. is labeled with the §9.3 anti-claim.

### 11.5 Non-claims (Q16)

The sandbox does not claim realism of the storm, identity
with a historical event's mesocyclone, correctness of DEMO
C for that column, or any operational severe-weather
threshold.

---

## 12. Validation / reference strategy

**NEW PROJECT DECISION.** Be strict.

Distinguish:

| Kind | Role in this project |
| --- | --- |
| Exact regression / golden fixture | **Required.** Frozen native file → frozen normalized levels → frozen hodograph knots / selected diagnostic numbers |
| Unit / sign / coordinate checks | **Required.** Native → SI; eastward/northward → world |
| Existing physics invariants | **Reuse.** Interpolation midpoint, clamp, shear/SRH reject clamp, Form B SRH on linear segments |
| Adapter QC plausibility ranges | **Optional warnings** (e.g. `|V|` beyond a documented insane bound as likely unit error). Not scientific pass/fail |
| Climatological severe-weather thresholds | **Not an oracle.** Typical tornadic 0–6 km shear, 0–1 km SRH, etc. must not decide whether the adapter or laboratory is correct |
| Historical published outbreak examples | **Labeled case studies later.** Identity of a famous sounding is provenance, not proof that Explorer is that storm |

Claude's suggestion to use climatological thresholds or
known outbreak environments as sanity checks is useful
only as **human literacy / smoke**, never as a
deterministic test oracle. A non-tornadic observed column
must be allowed to import. A column that happens to sit
in “supercell parameter space” does not validate Ω,
updraft, or Guided.

`09` already refuses operational layer recipes (0–1 km,
0–3 km) as special-cased physics. This contract keeps
that: sandbox tests may **choose** a layer that lies in
the fixture's support; they must not encode SPC thresholds
as expected values.

---

## 13. First provider / data source

**NEW PROJECT DECISION** for **source class**.
**RESEARCH GATE** for **exact archive / product**.

### 13.1 Comparison (conceptual)

| Criterion | Observed radiosonde / RAOB | Model analysis / reanalysis column |
| --- | --- | --- |
| Scientific meaning | A real historical observed wind column at a station/time | An analyzed or reanalyzed state; already a model product |
| Match to milestone language | Strong: “real historical atmospheric wind profile” | Weaker: historically dated, not observed as a sounding |
| Dirty / irregular vertical data | Native. Missing winds, uneven spacing, mixed QC | Often regular and complete; weaker dirty-data test |
| Vertical coverage | Variable; may not reach tropopause or ground | Usually complete on the native grid |
| Provenance | `observed-raob` is an honest `sourceClass` | `model-analysis` / `reanalysis`; different epistemic claim |
| Height | Often pressure + geopotential; adapter must convert | Native geometric / geopotential height still needs datum policy |
| Accessibility | Public archives exist | Public archives exist |
| Reproducibility | One sounding can be frozen in-repo | One column can be frozen in-repo |
| Suitability for adapter #1 | High: forces normalization, drop, coverage | High engineering, weaker scientific first proof |

### 13.2 Recommendation (Q18)

Choose **observed radiosonde / RAOB as the first source
class**, because the first sandbox is supposed to prove
dirty vertical data, observed provenance, and
normalization — not a clean model column that already
looks like DEMO knots.

Model analysis / reanalysis remains a **provider #2
candidate**, and a later inter-source disagreement
literacy signal (`44` §6.5), not the first adapter.

### 13.3 Exact provider is a research gate

This file does **not** itself select University of
Wyoming, IEM, IGRA, NCEI, or a native format.

R1 is closed in the successor:

```text
docs/architecture/49-r1-first-historical-reference-storm.md
```

Selected first column (`49`):

```text
VORTEX2 Goshen County 5 June 2009
NSSL1 mobile GAUS  2155 UTC inflow
EOL dataset 114.114
DOI 10.5065/D6CC0Z0Q
native format ESC ASCII
sourceClass observed-raob
```

In-repo freeze versus gitignored hash remains an I1
recording step (`49` G4 / this file U5). Adapter
implementation remains I1, NOT STARTED.

---

## 14. Thermodynamics boundary

**NEW PROJECT DECISION.** Narrow on purpose.

Today's object is an **environmental wind profile**, not a
sounding.

```text
KEEP the name EnvironmentalWindProfile
DO NOT rename it Sounding, AtmosphericProfile, or
  AtmosphericSounding
DO NOT add T / Td / p / q fields to it now
```

Future thermodynamic state, if ever added, is a **sibling
capability** (conceptual name not locked as an API):

```text
EnvironmentalWindProfile          wind vs height (this contract)
future thermodynamic profile      not designed here
optional later composite          may group siblings; not now
```

This avoids a rewrite in which “the profile” silently
becomes a thermodynamic sounding and forces CAPE, parcels,
or buoyancy into `VelocityField`.

Thermodynamics remains:

```text
not designed
not part of the first sandbox
not a reason to consume pressure as an Explorer coordinate
```

---

## 15. Relation to reconstruction

**STILL-BINDING:** `44`.

Environmental-profile ingestion is Explorer consumer /
engineering work. It is not storm reconstruction.

Do not reopen:

```text
dual-Doppler
GBVTD
variational retrieval
reconstruction uncertainty architecture
VelocityField confidence
DatasetVelocityField as a retrieval method
```

A later complete 3D `V` from a numerical model, if
consumed, is still a different engineering item
(`ARCHITECTURE` §12 consumer sketch). It is not this
profile contract.

---

## 16. Required decisions (Q1–Q22)

**Q1. Normalized profile object Explorer should consume?**

`EnvironmentalWindProfile` (existing kinematic class)
plus a sibling `EnvironmentalWindProfileRecord` for
provenance/coverage. Not a new sampler. Not a sounding.

**Q2. Fields required now?**

`height` m (world-Y datum after adapter), `eastward` m/s,
`northward` m/s, `vertical = 0`. ≥2 strictly increasing
finite levels.

**Q3. Metadata/provenance required now?**

`sourceClass`, `sourceIdentity`, `validTime`, `location`,
`heightDatum`, `coverage`, native-unit note. No scalar
confidence.

**Q4. What remains provider-specific?**

Native format, native coordinates, QC tables, download
mechanics, unused native columns (including
thermodynamics), product-specific identifiers.

**Q5. Provider interface before provider #1?**

No.

**Q6. Where does normalization happen?**

Adapter, before physics construction.

**Q7. Coordinate/sign/unit enforcement?**

Adapter emits project atmospheric components and SI
height. Existing world helpers stay at the field
boundary. Golden unit/sign tests later.

**Q8. Irregular/missing vertical levels?**

Drop missing/failed winds; fail on duplicates/non-finite/
fewer than two levels; interpolate only remaining knots; record
gaps in `coverage`; do not treat clamp as observation.

**Q9. Current interpolation vs imported data?**

Reuse live piecewise-linear interpolation and clamp.
Do not add a second interpolator. Do not reuse DEMO
`[0, 1000]` overlays unless that layer is inside support.

**Q10. Is storm motion part of the profile?**

No. Sibling input.

**Q11. Storm-motion provenance conceptually?**

Value, source-or-method, validity, class
`prescribed | derived | observed`. First sandbox:
prescribed. Live type stays value-only. Bunkers not
selected.

**Q12. Which V1 quantities change when the profile changes?**

§9.1.

**Q13. Which remain prescribed?**

§9.2, including C if kept prescribed, Ω, and operands 2–7.

**Q14. Which Guided claims become invalid or scenario-specific?**

Validated path geometry / hit-miss / occupancy for S1, S2,
D1, NG1 become DEMO-specific the moment the environment
operand changes. Catalog copy is qualitative but the
exhibits are DEMO-pinned. First sandbox does not retarget
Guided.

**Q15. Success for the first historical sandbox?**

§11.4.

**Q16. What the sandbox does not claim?**

§11.3 and §11.5.

**Q17. Required validation/reference fixtures?**

§12: frozen golden native→normalized file; unit/sign
tests; existing physics invariants. Climatology is not an
oracle.

**Q18. Provider #1 class?**

Observed RAOB. Exact archive / sounding: `49`
(EOL `114.114`, Goshen NSSL1 2155 UTC, ESC).

**Q19. What waits for provider #2?**

Interface, registry, comparison/disagreement, second
format, generic multi-agency QC unification.

**Q20. Naming that keeps thermodynamics possible?**

Keep `EnvironmentalWindProfile` as wind-only. Do not call
it a sounding. Thermodynamics is a future sibling.

**Q21. Must any current production interface change before
provider #1 can be implemented?**

Physics interfaces **no**:

```text
EnvironmentalWindProfile constructor / sampleAtHeight
EnvironmentalWindField
StormMotion value type / stormRelativeWind
hodographPoints
shear / vorticity / SRH / streamwise maps
VelocityField.sample → Vec3
DiagnosticTiltingTendency(profile, updraft)
```

App composition **yes, later, as opt-in injection**, not
as an edit of `DEMO_SCENARIO`:

```text
composeDemoTracerFields currently hardcodes DEMO_SCENARIO
App.tsx currently calls createDemoHodographPoints()
createGuidedLab must keep DEMO
```

The first adapter can target tests without a live App
change. Using the profile **as the environment of the
existing Explorer** requires a subsequent composition
injection that must not silently swap Guided.

**Q22. Smallest implementation slice after this SoT?**

```text
R1 is closed in 49.

Smallest code slice (I1), NOT STARTED:
  one ESC adapter + frozen NSSL1 2155 UTC fixture
  → EnvironmentalWindProfileRecord
  → existing EnvironmentalWindProfile
  → tests for normalize / interpolate / hodograph /
    env diagnostics / provenance

Out of that slice:
  live App injection, Guided, DEMO_SCENARIO edits,
  Bunkers, thermodynamics, provider interface,
  downloads of additional soundings
```

---

## 17. Implementation slices

Implementation is out of scope for this SoT. Recorded
order for later work:

```text
R1  RESEARCH GATE
    exact observed-RAOB archive, one sounding, format,
    license, in-repo freeze
    CLOSED in 49
    remaining I1 obtainability: order/inspect/freeze
    the named NSSL1 2155 UTC ESC file (49 G1–G5)

I1  Adapter + frozen fixture + tests
    no live App, no DEMO edit, no Guided, no Bunkers
    NOT STARTED
    blocked on 49 G1–G5 obtain/inspect/freeze, not on
    sounding identity

I2  Opt-in Explore / laboratory environmental injection
    six storm operands remain DEMO
    C remains prescribed and labeled
    honesty copy from §9.3
    Guided remains DEMO
    NOT STARTED
    blocked on I1

I3+ Curated scenarios, editable hodograph, case-specific
    prescribed C, provider #2, thermodynamics, Guided
    re-pinning
    out of this contract; some remain 38 §13 parking
```

Do not modify V1 physics merely to prepare for these
slices.

---

## 18. Unresolved questions

```text
U1  Exact RAOB archive / product / sounding for R1
      CLOSED in 49 (Goshen NSSL1 2155 UTC, EOL 114.114)
U2  Height conversion method when native data are
    pressure-only (adapter policy, named in provenance)
      first fixture is not pressure-only; 49 uses ESC
      altitude minus launch elevation → world Y
U3  Whether I2 uses DEMO C or a different prescribed C
    for that one case (still prescribed; 38 U5 not used
    as an estimator decision)
U4  Whether SRH is displayed in the sandbox UI (38 U6
    still unresolved; physics may be tested headless)
U5  Whether the frozen native file is committed to the
    repo or gitignored with a documented hash
      narrowed in 49 G4; decided when the EOL EULA
      accepted at order time is recorded
```

Not unresolved:

```text
provider interface before #1          no
Bunkers as default                    no
thermodynamics in this milestone      no
reconstruction                        no
Guided retarget in first sandbox      no
VelocityField.sample shape            unchanged
V1 reopen                             no
```

---

## 19. Anti-claims

```text
this file does not include production implementation
this file does not modify src/**
this file does not download atmospheric data
this file does not implement a provider
this file does not implement Bunkers
this file does not change DEMO_SCENARIO
this file does not change Guided
this file does not reopen V1
this file does not begin thermodynamics
this file does not design CAPE/CIN or parcel physics
this file does not alter VelocityField
this file does not design DatasetVelocityField
this file does not reopen retrieval
AtmosphericProfileSource is not justified now
a real profile does not make the storm real
climatological thresholds are not a test oracle
DEMO C is still prescribed under an imported profile
38 §13 scenario editor is not this contract
inter-source disagreement waits for provider #2
```

---

## 20. Documentation authority

```text
this file:     provider-neutral environmental-wind
               profile contract; first historical
               sandbox contract; RAOB class
49:            R1 selection; Goshen NSSL1 2155 UTC
44:            long-term source / reconstruction
               boundary; still authoritative for that
               split
physics/04:    current kinematic profile; import still
               not a feature of that primitive
physics/07:    value-only StormMotion subtraction map
38 §5 / §13:   V1 one fixed environment; curated
               scenarios remain product parking
17 / 08 / 12 / 14: Guided exhibits remain DEMO-pinned
```

---

## 21. Compact lock-in

```text
CONSUMER OBJECT:     EnvironmentalWindProfile
                     + provenance record
PROVIDER:            one adapter later; no interface now
NORMALIZATION:       adapter, before physics
C:                   sibling; prescribed in first sandbox
                     value / method / validity / class
                     conceptually required; DTO not in src
THERMODYNAMICS:      future sibling; not a sounding rename
RECONSTRUCTION:      still 44; not this track
SANDBOX PROVES:      dirty column → normalize → hodograph
                     + env diagnostics
SANDBOX DOES NOT:    make the storm real; derive Ω or C;
                     retarget Guided
PROVIDER CLASS:      observed RAOB
EXACT ARCHIVE:       49  EOL 114.114  Goshen NSSL1 2155 UTC
PHYSICS APIs:        no change required for I1
LIVE INJECTION:      I2 opt-in; not DEMO/Guided overwrite
IMPLEMENTATION:      NONE
V1:                  CLOSED; not reopened
```

---

## 22. Implementation

This document does not include implementation.
Production `src/**` remains unchanged.
No provider, download, Bunkers, DEMO, Guided, or
thermodynamic work is in scope.
