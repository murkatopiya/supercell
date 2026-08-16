# Wind-Tunnel / Storm-Relative 3D Semantics

**Status:** architecture SoT. Migration slices 1–3 are implemented.
Live browser 3D DEMO is `StormRelativeLaboratory`. Default composition
API remains `GroundRelativeWindTunnel`. Wind-tunnel remains a supported
explicit mode. Story tracers are **not** authorized.

This document is the Y15 revisit required after the deep prescribed
storm stack (`docs/rendering/10-deep-storm-envelope-scaling.md`,
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`).
`10` §11 correctly **reaffirmed** the wind-tunnel for envelope
scaling. Wind-tunnel remains a supported explicit
`GroundRelativeWindTunnel` mode. Live browser 3D after slice 3 is
`StormRelativeLaboratory`. This document asks a different question:

    After the deep prescribed stack exists, what spatial / frame
    contract should the *next generation* of 3D advection use?

It does **not** authorize:

- production code;
- story tracers;
- downdraft;
- continuity solver;
- tilting / stretching;
- mesocyclone;
- Bunkers;
- renderer polish;
- retuning `C`, `sigma`, `W0`, or seeds for a prettier path.

Existing physics, diagnostic, and rendering SoT remain in force unless
this document explicitly supersedes a frame sentence. Hodograph / SRH
formulas are not rewritten here.

---

## 1. Purpose

Answer:

    Which spatial/frame contract does Supercell Explorer need so that
    future deep story tracers, lower→mid→upper trajectories, a future
    prescribed downdraft, and eventual circulation-oriented teaching
    can be honest, without collapsing

        ground-relative wind
        storm-relative wind
        storm motion C
        world coordinates
        storm-centered spatial coordinates

    into one number called "C"?

Mandatory candidates: A (keep wind-tunnel), B (subtract C in 3D
velocity), C (translate storm fields in ground-relative world),
D (separate storm-relative laboratory mode), E (if cleaner).

---

## 2. Three contracts that must never be mixed

These three ideas can share the same vector `C`. They are still
different contracts.

| ID | Contract | What it is | What it is not |
| --- | --- | --- | --- |
| **D1** | Storm-relative **wind diagnostic** | `V_sr = V_env − C` on horizontal atmospheric components (`docs/physics/07-storm-relative-wind.md`) | Not particle integration. Not a position-frame transform. Not a 3D field rewrite. |
| **D2** | Storm-relative **particle integration** | Advect tracers with a velocity that is relative to storm motion, so pathlines are trajectories *in the storm's rest frame* | Not the hodograph overlay. Not proof that particles stay in the core. |
| **D3** | Moving storm center in **ground-relative world** | `center(t) = center0 + C t`, environment stays ground-relative, field is unsteady | Not the same as rewriting diagnostic formulas. Not required in order to have D2. |

`docs/physics/00-coordinate-system.md` §10 already distinguishes
**world coordinates** from **storm-relative position coordinates**.
`07` §3 already distinguishes storm-relative **wind** from storm-relative
**coordinates**. This document adds the third split: diagnostic wind
versus 3D advection frame versus translating geometry.

Silent mixing that this SoT forbids:

```text
"subtract C in 3D"           ≠  automatically D2 done correctly
"V_sr overlay on hodograph"  ≠  3D tracers already storm-relative
"C = (10, 0)"                ≠  the storm structure translates
"origin is (0,0)"            ≠  origin is the mesocyclone
"particles stay in the core" ≠  the frame choice succeeded
```

Galilean fact, kept in one place:

    For constant horizontal C, D2 with fixed storm geometry
    is equivalent to D3 with translating geometry via

        x_sr = x_ground − C t
        V_sr = V_ground − C     (horizontal)

    They are the same physics in different coordinates.
    They are not the same software contract.

---

## 3. Current laboratory (verified)

Live DEMO composition (`src/app/composeDemoTracerSimulation.ts`,
`DEMO_SCENARIO`):

```text
EnvironmentalWindField
+ VerticalEnvelopeUpdraftField
+ VerticalEnvelopeRotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
→ CompositeVelocityField
```

| Quantity | Live value | Role |
| --- | --- | --- |
| World axes | +X east, +Y up, +Z south | Canonical (`00`) |
| World origin | `(0,0,0)`; `y = 0` is reference ground | Must not automatically mean storm center (`00` §9) |
| Env knots | `0, 1000, 2000, 6000, 12000` m | Ground-relative; `vertical ≡ 0`; clamp outside |
| Storm motion `C` | `(eastward 10, northward 0)` m/s | Diagnostic only |
| Storm centers | all `(centerX, centerZ) = (0, 0)` | DEMO fixture, not `storm.center` API |
| `sigma` | all `4000` m | DEMO equality, not `storm.sigma` (`06`) |
| Updraft | `[0, 8000]`, `W0 = 30` m/s | Prescribed |
| Rotation | `[0, 6500]`, `Ω = 0.005` rad/s | Localized envelope (`12`); peak `|v_θ|` frozen |
| Lower inflow | plateau `y ≤ 1500`, taper to `4500`, `A_in = 0.00125` s⁻¹ | Prescribed; peak `|v_r|` frozen |
| Upper outflow | `[5000, 9000]`, `A_out = 0.0025` s⁻¹ | Prescribed; peak `|v_r|` frozen |
| Seeds | `(0,1000,0)`, `(2400,1000,0)`, `(0,1000,−2400)` | Diagnostic probes, `r = 0.6σ`; not story tracers |
| Integrator | Euler, `dt = 0.1` s | DEMO choice; `time` passed, fields ignore it |
| `VelocityField.sample` | `(position, time) → Vec3` | Interface already has `time`; every live field is steady |
| Renderer | observes `particle.position`; default frame `0–10000` m (`11`) | Grid `10000` m; camera looks at `(0, 4000, 0)` |
| Hodograph | ground-relative polyline | `C` marker and `V_sr` overlay are diagnostics |

Wind-tunnel sentences already in force:

- `04` §16 / `07` §9: neither profile nor `EnvironmentalWindField`
  silently subtracts `C`.
- Audit G8 / `10` §11 / `11` §17 / `12` §14: storm fields are fixed
  in world; `C` is not subtracted in 3D; this is **not a bug**.

Operational meaning:

```text
environment blows through a stationary prescribed storm
tracers sample V_total = V_env(y) + V_storm(x − center)
center does not move
C does not enter the 3D sum
```

This is a **wind-tunnel**: a fixed obstacle/structure in a
height-dependent free stream. It is not a translating supercell.
It is not a storm-relative textbook diagram.

---

## 4. Current velocity magnitudes (do not retune)

At seed height `y = 1000 m`:

```text
V_env          = (eastward 5, northward 15)     |V_env| ≈ 15.81 m/s
C              = (eastward 10, northward 0)
V_sr,env       = (eastward −5, northward 15)    |V_sr|  ≈ 15.81 m/s
peak |v_r|_in  ≈ A_in σ / √e                    ≈  3.03 m/s
peak |v_θ|     ≈ |Ω| σ / √e                     ≈ 12.13 m/s
W0             = 30 m/s
```

`C` was chosen for the locked `[0, 1000]` hodograph overlay identity
(`G9`, `09`), not as a 3D steering velocity that cancels the free
stream at the chimney.

Column `|V_sr,env|` versus current `C`:

| Height m | `V_env` (east, north) | `V_sr = V_env − C` | `|V_sr|` m/s |
| --- | --- | --- | --- |
| 0 | (15, 5) | (5, 5) | 7.07 |
| 500 | (10, 10) | (0, 10) | 10.00 |
| 1000 | (5, 15) | (−5, 15) | 15.81 |
| 2000 | (10, 25) | (0, 25) | 25.00 |
| 6000 | (30, 20) | (20, 20) | 28.28 |
| 12000 | (40, 10) | (30, 10) | 31.62 |

Minimum `|V_sr|` on the explicit knots is at the ground, still
`≈ 7 m/s`, more than twice peak lower inflow. At the seed layer,
subtracting `C` **does not reduce speed**; it only turns the
eastward component around (`+5 → −5`).

Residence estimate already in `10` §11.1 still holds in the
wind-tunnel: `|V_env| ≈ 16 m/s` crosses `σ = 1000 m` in tens of
seconds; isolated half-sine climb of the deep column is hundreds of
seconds. The same order of magnitude remains after a Galilean boost
by the current `C`.

Therefore:

```text
Frame choice and core-residence are different problems.
Current C does not buy residence.
Do not retune C / sigma / W0 / seeds inside a frame SoT
in order to make a trajectory look like a supercell.
```

---

## 5. What current seeds and 3D motion actually mean

Current three tracers are **diagnostic probes of the lower chimney**
(`10` §17, `11` §17, audit Y10).

In the live wind-tunnel their trajectory means:

    ground-relative pathline through a stationary prescribed structure
    in a height-dependent free stream.

It does **not** mean:

- storm-relative inflow;
- a lower→upper circulation;
- the same air that will later leave in outflow;
- a parcel that "belongs" to the storm.

Teaching inconsistency already visible if one compares panels:

```text
hodograph V_sr overlay at 1000 m :  C → wind  =  (−5, +15) east/north
3D particle horizontal env       :              (+5, +15) east/north
```

The overlay answers D1. The 3D tracers currently answer neither D2
nor D3. They answer the wind-tunnel. That is honest only if copy
says so. It becomes dishonest the moment copy implies that 3D motion
is the storm-relative arrow on the hodograph.

---

## 6. Candidate A — keep current wind-tunnel canonical

### 6.1 Contract

```text
V_3D = V_env(y) + V_storm(x − center_fixed)
C diagnostic-only
sample(position, time) unused in time
world origin = domain reference; DEMO coincident with storm axis
renderer shows ground-relative world in which the storm does not move
```

Nothing changes spatially. This is the live system.

### 6.2 How far can the project go?

Honestly quite far, as a **mechanism laboratory**:

- isolated field tests stay meaningful;
- additive prescribed operands stay meaningful;
- hodograph / shear / vorticity / SRH stay meaningful;
- a future prescribed downdraft can still be added as another
  storm-centered operand;
- camera, grid, Reset, and DEMO tests stay cheap.

Hard ceiling — A **cannot** honestly support:

- story tracers sold as lower→mid→upper paths of storm air;
- teaching that 3D trajectories match hodograph `V_sr`;
- a circulation diagram in which inflow, updraft, outflow, and a
  future downdraft are the same-air circuit relative to the storm;
- interpreting sweep-out as storm-relative inflow physics
  (`10` §11.3).

Story tracers under A have two honest options only:

1. remain local probes (current seeds);
2. be seeded and described as wind-tunnel pathlines that will leave
   the chimney, with **no** claim of complete ascent.

### 6.3 Verdict

Keep A as a **first-class laboratory mode**. Do not delete it. Do not
treat it as a bug.

Do **not** keep A as the only 3D advection contract if the next
teaching generation needs D2.

---

## 7. Candidate B — `V_sr = V_ground − C` for 3D integration

### 7.1 The idea, not accepted automatically

```text
V_integration = V_ground − C
```

This sentence is incomplete until operands, geometry, and coordinate
meaning are named.

### 7.2 From which operands is C subtracted?

Live sum:

```text
V_ground = V_env + V_updraft + V_rotation + V_inflow + V_outflow
```

Storm operands are prescribed **anomalies** about a fixed center.
They contain no mean translation and no copy of `C`.

Therefore, for the *current* stack:

```text
V_ground − C  =  (V_env − C) + V_storm_anomalies
```

Subtracting `C` from the composite is numerically equal to subtracting
`C` from the environmental operand only.

Semantically, only the environmental subtraction is the D1 map
(`07`). Subtracting `C` from an updraft / rotation / radial field
would describe those mechanisms as if they carried storm motion.
They do not.

**Rule:** if a 3D Galilean boost is introduced, apply it to the
**environmental advection operand**, not to storm-field internals,
and not as a hidden rewrite of `CompositeVelocityField`.

### 7.3 Is C a translation of the storm frame, or only diagnostic storm motion?

Today `C` is **diagnostic storm motion** (D1). The 3D storm does not
translate (not D3).

Using that same `C` as a 3D boost **reinterprets** it as the
translation velocity of the storm structure (the Galilean partner of
D3). That reinterpretation is allowed only if the project says so
explicitly. It is not implied by SRH.

Two different `C` values (diagnostic vs advection) are forbidden
unless a later SoT introduces them. One prescribed `C` is enough
for architecture. See §12.

### 7.4 What happens to storm-centered prescribed fields?

If centers stay fixed and only velocity is boosted:

- storm Gaussians remain functions of `(x − center_fixed)`;
- they still ignore `time`;
- they still do not know `C`.

That is D2, not D3.

If someone *also* translates centers by `C t` *and* subtracts `C`
from velocity, that is **double-counting**. The storm would recede
in the boosted frame. Forbidden.

### 7.5 Double-counting checklist

| Combination | Result |
| --- | --- |
| Fixed centers, subtract `C` from env only | D2 laboratory (candidate D) |
| Fixed centers, subtract `C` from total | Same numbers as above for current anomalies |
| Translating centers, env ground-relative, no velocity subtract | D3 (candidate C) |
| Translating centers **and** subtract `C` | **Wrong** — double Galilean transform |
| Subtract `C` inside each storm field | **Wrong** — storms do not carry `C` |
| Subtract `C` inside `EnvironmentalWindProfile` | **Wrong** — breaks D1 source of truth |
| Subtract `C` inside `EnvironmentalWindField` silently | **Wrong** — `07` §9 forbids it |

### 7.6 World coordinates and renderer under naive B

If positions keep the same numbers and the renderer does not change,
the scene still *looks* like a storm glued to the origin. The honest
reading of those coordinates has changed: they are now storm-relative
laboratory coordinates (or a ground-relative world in which a
stationary storm is being viewed after a velocity boost, which is
the same picture).

Naive B without renaming the frame is the main pedagogical hazard:
code subtracts `C`, UI still says "world", hodograph still says
"ground-relative", and nobody can answer which pathline is on screen.

### 7.7 Verdict on B

Do **not** adopt "subtract `C` from 3D velocity" as a standalone
contract. It is either:

- an incomplete name for D (if geometry stays fixed and only env
  is boosted), or
- a footgun (if combined with translating centers or silent profile
  mutation).

The useful physics inside B is recovered as candidate D / E.

Also: even a correct env-only subtract with current `C` does **not**
keep tracers in the chimney (§4). B must not be sold as a residence
fix.

---

## 8. Candidate C — translating storm fields in ground-relative world

### 8.1 Contract

```text
center(t) = center0 + C t          // horizontal only
V_env remains ground-relative
V_storm sampled at (x − center(t))
V_3D(x,t) = V_env(y) + V_storm(x − C t)
world coordinates remain ground-relative
```

This is D3. Pathlines are ground-relative. Streamlines at a frozen
`t` are not the same as pathlines (`ARCHITECTURE.md` §20): the field
is unsteady.

### 8.2 Does this require `sample(position, time)`?

The **interface already has `time`**. Every live field ignores it.

C would be the first production reason to *use* `time`:

```text
sample(position, time)  with  center = center0 + C * time
```

That can be done by a **wrapper** around existing storm fields
(shift the query point by `−C t`, or shift stored centers). Storm
formulas themselves stay steady in their rest frame.

Do **not** add `time` into `VerticalEnvelopeUpdraftField` et al.
Do **not** widen `VelocityField` further (`sample(position)` is not
the live interface anyway).

`ScenarioConfig` would need either:

- a composition-time policy "centers translate with `stormMotion`", or
- time-dependent centers, which the DTO currently does not have.

Seeds in ground-relative world: if seeds stay at world `(0, 1000, 0)`
and the storm walks away, Reset still restores a probe that the storm
has left. Seeds would need to be storm-relative and converted at
`t = 0`, or re-attached each Reset. Tests that assume fixed centers
become time-indexed. The renderer grid is `10000` m; at `C = 10` m/s
the axis leaves that pad in `1000` s, and in a few hundred seconds
of deep ascent it has already moved several kilometers. Default
camera looks at `(0, 4000, 0)` (`11`). Without a follow-storm camera,
the storm walks out of the teaching frame.

### 8.3 Verdict on C

Correct ground-relative picture of a translating storm. Heavy
software cost: unsteady sampling, seed/Reset policy, test rewrite,
camera/grid follow, and pathline ≠ streamline.

Not needed to obtain D2. Galilean-equivalent teaching is cheaper in
the storm's rest frame (D).

Defer C until a slice explicitly wants to *see the storm move across
the ground*. That is a visualization / later-dataset problem, not a
prerequisite for story tracers.

---

## 9. Candidate D — separate storm-relative laboratory mode

### 9.1 Contract

```text
Storm geometry fixed in storm-relative coordinates
  (DEMO: centers remain (0, 0); formulas unchanged)

Environmental advection for integration:
  V_env_sr(y) = V_env(y) − C     // horizontal; vertical unchanged
  implemented as a composition-time adapter, not a profile mutation

V_3D = V_env_sr(y) + V_storm(x − center_fixed)

Field remains steady for constant C
sample(position, time) stays; time still unused by operands

Renderer can keep current camera/grid: the storm stays on the pad
Positions on screen are storm-relative laboratory coordinates
```

This is D2 with explicit coordinate meaning. It is the rest-frame
partner of C. It does **not** require time-dependent fields.

### 9.2 Why this is a cleaner teaching contract than mutating the current world

Textbook supercell diagrams, hodograph `V_sr` arrows, SRH, and
inflow/outflow relative to the updraft are almost always drawn in
the storm's rest frame.

Under D:

- 3D pathlines **are** storm-relative trajectories;
- for a steady field they coincide with streamlines;
- hodograph can remain ground-relative with a `C` marker (D1), while
  3D shows the frame in which those `V_sr` arrows are the free stream;
- camera, grid, and Reset stay as they are;
- storm fields still do not know `C`;
- `EnvironmentalWindProfile` remains ground-relative.

The current wind-tunnel (A) is the cleaner contract for *mechanism
isolation* ("what does this Gaussian do in a free stream?"). D is
the cleaner contract for *storm-relative process teaching*.

They should coexist. D should not silently overwrite A.

### 9.3 What D does *not* do

- It does not keep current seeds in the core (§4).
- It does not make continuity residuals vanish.
- It does not make the chimney a supercell.
- It does not change SRH formulas.
- It does not implement Bunkers.
- It does not move the ground under the storm (the grid is
  storm-relative ground, like a laboratory floor glued to the storm).

If copy says "the ground is Kansas," D is the wrong picture and C
is required. If copy says "coordinates are relative to the storm
axis," D is the right picture.

---

## 10. Candidate E — recommended: dual integration frame at composition

### 10.1 Why not replace A with D

A already has a large, useful test surface and honest isolated
semantics. Destroying it would mix a frame change with every
existing acceptance test.

Storm fields must not learn `C`. Profile must not learn `C`.
`CompositeVelocityField` must not learn `C`. Those are the
backward-compatibility constraints.

### 10.2 Recommended object

An **integration-frame policy at the composition boundary**:

```text
IntegrationFrame.GroundRelativeWindTunnel     // current A; default until a DEMO slice switches
IntegrationFrame.StormRelativeLaboratory      // D; env adapter minus C; storm operands unchanged
```

Minimal physics object for the second mode:

```text
profile  →  EnvironmentalWindField            // still ground-relative internally
         →  StormRelativeEnvironmentalAdvectionField(envField, C)
         →  CompositeVelocityField([env_sr, ...storm])
```

The adapter:

- converts `C` through the existing atmospheric→world helper;
- subtracts **horizontal** storm motion only (`07` §4: vertical
  unchanged);
- does not sample the profile itself if it wraps `EnvironmentalWindField`;
- does not mutate caller objects;
- ignores `time` while `C` is constant.

Forbidden alternatives:

- silent subtract inside `EnvironmentalWindField`;
- silent subtract inside `EnvironmentalWindProfile`;
- `CompositeVelocityField` growing a `stormMotion` parameter;
- each storm class growing a `stormMotion` parameter;
- a second `C_advection` beside `C_diagnostic`;
- renderer recentering / follow-camera as a fake D2 (`11` §17).

Renderer-follow while physics stays A is rejected: particles still
leave the storm; the camera only hides the wind-tunnel.

Translating-storm mode (C) is a **later third frame**, implemented
as a time-dependent query-point shift around storm operands, not as
a rewrite of D. It is not part of the next slice.

### 10.3 Why E is better than A, B, C, or D-alone

| Need | A | B naive | C | D-alone | **E** |
| --- | --- | --- | --- | --- | --- |
| Preserve wind-tunnel tests | yes | no, if it replaces live 3D | no | no | **yes** |
| Honest D2 pathlines | no | only if renamed and env-only | via Galilean map | yes | **yes, as a mode** |
| Storm fields ignorant of `C` | yes | easy to violate | wrapper can | yes | **yes** |
| Steady `VelocityField`s | yes | yes | no | yes | **yes** |
| `sample(position,time)` already enough | yes | yes | uses `time` | yes | **yes for next slice** |
| Match hodograph `V_sr` direction in 3D | no | coincidental if done right | no (ground paths) | yes | **yes in SR mode** |
| See storm walk across Kansas | no | no | yes | no | later third mode |
| No double-count | n/a | footgun | ok if no subtract | ok | **checklist in SoT** |
| Story-tracer *meaning* | wind-tunnel probe | ambiguous | ground-relative path | storm-relative path | **explicit per mode** |
| Story-tracer *residence* | no | no with current C | no with current C | no with current C | **not claimed** |

E is D without burning A, and B without the naming trap.

---

## 11. Comparative table (architecture)

| | A Wind-tunnel | B Subtract C in 3D | C Translate centers | D SR laboratory | E Dual frame (recommended) |
| --- | --- | --- | --- | --- | --- |
| Env operand | ground-relative | unclear unless specified | ground-relative | `V_env − C` for advection | A or D by mode |
| Storm operands | fixed world centers | fixed, unless also moved | `center(t)=C t` | fixed in SR coordinates | unchanged primitives |
| `C` meaning in 3D | unused | mixed diagnostic/boost | actual translation | translation of the *frame* | diagnostic + optional boost |
| Positions mean | ground-rel. world; storm glued | ambiguous unless renamed | ground-rel. world | storm-rel. lab | named per mode |
| Time dependence | none | none if geometry fixed | yes | none for constant C | none for A/D |
| Renderer | current | current numbers, new meaning | needs follow | current pose still valid | current pose for A/D |
| Tests | keep | rewrite live DEMO | rewrite many | rewrite live DEMO if it replaces | add SR-mode tests; keep A |
| Double-count risk | none | high | if combined with B | low | low if adapter is env-only |
| Teaching 3D vs hodograph | mismatch | mismatch unless D | mismatch (intentional: ground) | match `V_sr` free stream | match in SR mode |
| Lower→upper *meaning* | cannot claim | cannot claim until D | ground path of translating storm | can claim as SR pathline | can claim in SR mode |
| Lower→upper *residence* | no | no | no | no | no (separate fixture) |

---

## 12. What happens to `C`

### 12.1 Current `C = (10, 0)` is enough for the architecture slice

It is a prescribed horizontal `StormMotion`. Architecture needs an
external constant translation, not an estimator.

Keep:

```text
C remains an independent prescribed input
DEMO C = (eastward 10, northward 0)
overlay layer [0, 1000] identity unchanged (G9)
full-column SRH stays the already-published number for this C
```

### 12.2 Bunkers is not a prerequisite

Bunkers estimates a *value* of `C` from the profile. The frame
contract consumes a `StormMotion`. Any finite `C` exercises D2/D3.

Audit Y19 remains: do not implement Bunkers because a deep hodograph
exists, and do not implement it to "make 3D look right."

Revisit Bunkers only in an explicit storm-motion-estimator slice,
after the frame modes exist.

### 12.3 Do not split diagnostic C and advection C

One `ScenarioConfig.stormMotion`. Both D1 diagnostics and D2
advection, when enabled, read that same object.

A second `C` would make SRH, the overlay, and 3D disagree by
construction. Forbidden in this architecture.

If a later teaching slice wants particles to stay in the chimney, it
may propose a **new prescribed `C`** (or new seeds / strengths) as a
DEMO-fixture SoT. That is not this document. It is also not Bunkers.

### 12.4 Using current C in D2 is honest

It will **not** trap tracers. That is a feature of this sounding plus
this overlay-locked `C`, not a bug in D. DEMO copy must say:

    storm-relative free stream at 1 km is still ≈ 16 m/s
    because C is the overlay identity, not a 1 km mean wind.

---

## 13. `VelocityField` abstraction

Live interface (`docs/physics/02-velocity-field-basics.md`,
`src/core/fields/VelocityField.ts`):

```text
sample(position: Vec3, time: number): Vec3
```

Conceptual docs already allow `V(x,y,z,t)`. Implementation fields
are steady (`_time` unused). Integrators already pass
`clock.time`.

**Decision:**

```text
Do not change the VelocityField interface.
Do not drop time (future C / datasets need it).
Do not start requiring operands to depend on time for D2.
Storm-relative laboratory mode does not need time-dependent fields
when C is constant.
```

Translating-storm mode (C), if ever built, uses the existing `time`
argument in a wrapper, not a new method.

---

## 14. World / storm coordinates / rendering

Do not change the renderer in the frame-architecture slice.

| Concept | Wind-tunnel (A) | Storm-relative lab (D) | Translating (C, later) |
| --- | --- | --- | --- |
| World origin | domain reference; DEMO coincident with axis | **storm-relative origin**; DEMO axis at `(0,0)` by frame choice, still not a `storm.center` type | ground-relative origin; storm axis leaves it |
| Storm axis | fixed in world | fixed in SR coordinates | moves: `C t` |
| Ground / grid | laboratory floor under a fixed structure | laboratory floor glued to the storm (not Kansas) | Kansas-like pad; storm walks |
| Camera | looks at column (`11`) | same pose still frames the column | must follow or lose the storm |
| Particle `position` | ground-rel. world meters | SR laboratory meters | ground-rel. world meters |
| Coordinates UI | may show world `(x,y,z)` | must eventually label **storm-relative** if numbers are shown | ground-relative; axis position is extra UI |
| `00` §9 | origin ≠ automatic updraft center | origin *is* the SR origin **because the mode says so**, not because types collapsed | origin ≠ storm |

`00` §9–§10 stay: conversion between world and storm-relative
positions must be explicit. D does not invent a second Three.js
axis convention. It changes the **meaning of the existing meters**.

A future coordinates UI may expose both:

```text
ground-relative  (requires D3 or an extra C t reconstruction)
storm-relative   (native in D; reconstructible in C)
```

Not required to choose the architecture. Required before showing
raw `(x,z)` as "east of the mesocyclone" versus "east of domain
origin" without a label.

Reset (`02` tracer controls): restore seed copies and `time = 0`.
Under D this remains correct (steady field, fixed geometry). Under
C, Reset must also restore centers to `center0`.

---

## 15. Diagnostics — formulas unchanged

Frame choice for **3D advection** must not rewrite diagnostic
formulas.

| Diagnostic | Input | Uses `C` today? | After E |
| --- | --- | --- | --- |
| Hodograph path | `EnvironmentalWindProfile` | no | unchanged, ground-relative |
| Storm-motion marker | `StormMotion` | is `C` | unchanged |
| `V_sr` overlay | `V_env(h)`, `C` | yes (D1) | unchanged |
| Vertical shear | profile layer | no | unchanged |
| Horizontal vorticity | shear | no | unchanged |
| Streamwise / crosswise | `V_sr`, `ω_h` | yes, via D1 | unchanged |
| SRH | profile + `C` + layer | yes | unchanged |
| 3D `EnvironmentalWindField` | profile → world | **no** | still no internally; SR mode wraps it |
| Composite 3D sum | world `VelocityField`s | no | SR mode changes only the env operand fed into the sum |

`04` §16 remains: the profile is ground-relative and does not know
`C`. `07` remains the only subtract for D1. D2 reuses the same
subtract at the **advection adapter**, not by feeding
`StormRelativeWind` into hodograph code paths.

Do not start computing SRH from tracer trajectories.

---

## 16. Story tracers (not implemented here)

For each candidate: can a tracer stay near the core; what does the
path mean; can copy say lower→upper; are current seeds still useful?

| | Stay near core with current C/σ/W0/seeds? | Trajectory meaning | Honest lower→upper? | Current seeds useful? |
| --- | --- | --- | --- | --- |
| **A** | no | wind-tunnel pathline | no | yes, as lower probes |
| **B** | no | ambiguous until renamed | only if it is actually D | yes as probes |
| **C** | no (same relative flow) | ground-relative path of air while storm translates | as a ground track, not a storm-core life | only if converted with the storm at `t=0` |
| **D / E-SR** | no | storm-relative pathline / streamline | **meaning yes, residence no** | yes as lower SR probes; still not a deep life cycle |

"Meaning yes, residence no" is the important split.

A future story-tracer SoT may discuss **seed placement** (inflow
sector, multiple heights) without retuning physics. It must not
treat frame E as having already solved ascent. It must not pick `C`
or `sigma` to paint a helix.

Current diagnostic seeds remain the correct regression probes for
the lower chimney in **both** A and D: same positions, different
horizontal free stream.

---

## 17. Future prescribed downdraft (not implemented)

A prescribed downdraft should be another storm-centered operand:

```text
V_downdraft = V_downdraft(x − center, y; envelope)
```

It should **not** know `C`.

Frame dependence:

- **Definition** of the downdraft (Gaussian, envelope, sign of `Vy`)
  is independent of A vs D. Same primitive in both modes.
- **Teaching** of RFD / circulation relative to the updraft wants
  the downdraft to stay next to the updraft on screen → D/E.
- **Teaching** of a downdraft footprint moving over the ground wants
  C (later).
- Wind-tunnel A still allows building and testing the operand in
  isolation.

So: choose E **before** selling a circulation-oriented downdraft.
Do not block *defining* a downdraft primitive on E. Block *story
copy* that the downdraft is the return branch of the same air
(audit Y13 / continuity) regardless of frame.

---

## 18. Numerical implications

| Question | Answer |
| --- | --- |
| Does frame choice invalidate Euler `dt = 0.1`? | No by itself. `Ω dt = 0.002` unchanged. |
| Does velocity magnitude change? | D2 changes the **environmental horizontal** vector. At `y=1000`, `|V_h|` coincidentally stays `≈ 15.8` m/s; direction changes. Elsewhere `|V_h|` changes (e.g. `7` vs `16` m/s at the ground). Storm operand magnitudes unchanged. |
| Time dependence? | A/D: no. C: yes. |
| New acceptance invariants? | Yes for the adapter: `V_env_sr = world(stormRelativeWind(profile.sampleAtHeight(y), C))`; storm operands bit-identical; A-mode composite regression frozen. Galilean: D pathline equals C pathline minus `C t` for the same seeds, if C is ever built. |
| Is RK2 a prerequisite? | **No.** Integrator is independent of frame (`03`, Y11). |
| When does Y11 get louder? | If a later fixture actually increases residence inside rotation, Euler spiral becomes more visible. That is a later integrator decision, not a reason to switch RK2 in the frame slice. |

Do not change DEMO integrator "because we subtracted C."

---

## 19. Backward compatibility

Preserve:

- all isolated storm-field primitives and tests;
- `EnvironmentalWindProfile` / `EnvironmentalWindField` ground-relative
  contract;
- `CompositeVelocityField` as ignorant world-space sum;
- hodograph / shear / vorticity / SRH tests;
- wind-tunnel DEMO as a runnable, tested mode;
- `ScenarioConfig.stormMotion` as diagnostic input (already validated
  at profile factory).

Add, later:

- one env advection adapter;
- composition switch;
- tests for the adapter and for "storm fields unchanged when C
  changes in SR mode."

Do not:

- delete A;
- put `C` into storm classes;
- treat existing wind-tunnel acceptance failures after a silent
  DEMO switch as physics regressions of updraft/rotation types.

---

## 20. Recommended architecture contract

```text
1. Mechanisms stay prescribed, storm-centered, C-ignorant.
2. Environment profile stays ground-relative (D1 source of truth).
3. C stays one prescribed StormMotion; not Bunkers.
4. 3D advection gains an explicit IntegrationFrame at composition:
     GroundRelativeWindTunnel | StormRelativeLaboratory
5. StormRelativeLaboratory = env adapter (V_env − C) + unchanged
   storm operands + fixed centers. Steady. No sample() change.
6. Wind-tunnel remains a first-class mode and the current live DEMO
   until a commanded DEMO-frame slice switches the default.
7. Translating-storm world (D3) is a later third mode, not the next
   slice, and must not be combined with the env boost.
8. Renderer stays observe-only; SR mode reuses the current pose;
   copy must name the coordinates.
9. Diagnostics stay as they are.
10. Story tracers, downdraft, continuity, tilting, Bunkers, RK2
    DEMO switch are out of scope for the frame slice.
```

**Why this and not the others**

- A alone cannot support the next teaching generation's *meaning*.
- B as a slogan invites double-counting and silent frame rename.
- C is the right *ground-relative movie* and the wrong *next
  laboratory*: unsteady, camera, seeds, tests, for a Galilean
  duplicate of D.
- D-alone is the right teaching physics but would smash the
  wind-tunnel corpus if it replaced A in place.
- E keeps the corpus, puts the Galilean transform at the only
  boundary that already knows both env and `C` (composition), and
  leaves storm physics documents untouched.

---

## 21. Live DEMO after slice 3

Live browser 3D (`App.tsx`) is:

```text
IntegrationFrame.StormRelativeLaboratory
```

Default composition API remains:

```text
DEFAULT_DEMO_INTEGRATION_FRAME = GroundRelativeWindTunnel
```

These are different call sites. Omitting the frame argument still
builds a wind-tunnel composite. The live App passes
`StormRelativeLaboratory` explicitly. There is no UI frame selector.

D1 diagnostics (hodograph, shear, vorticity, SRH) are unchanged.
D2 3D integration uses the same prescribed `C`. They are different
software paths.

Residence is still not claimed. Current `C` / `sigma` / seeds were not
retuned.

---

## 21.1 Implemented composition API (slice 2)

Canonical type:

```text
src/app/IntegrationFrame.ts

IntegrationFrame.GroundRelativeWindTunnel
IntegrationFrame.StormRelativeLaboratory
DEFAULT_DEMO_INTEGRATION_FRAME = GroundRelativeWindTunnel
```

This is a semantic union at the **app composition** boundary, not a
boolean feature flag and not a `ScenarioConfig` field. Translating-storm
is not a member.

Selection:

```text
composeDemoTracerFields(integrationFrame?)
composeDemoTracerSimulation(integrationFrame?)
```

Default argument uses `GroundRelativeWindTunnel`. Live `App.tsx`
passes `StormRelativeLaboratory` explicitly. `App` does not expose a
UI switch.

Operand choice (only the environmental slot changes):

```text
GroundRelativeWindTunnel:
  EnvironmentalWindField
  + VerticalEnvelopeUpdraftField
  + VerticalEnvelopeRotationField
  + LowerRadialInflowField
  + UpperRadialOutflowField

StormRelativeLaboratory:
  StormRelativeEnvironmentalAdvectionField(EnvironmentalWindField, C)
  + VerticalEnvelopeUpdraftField
  + VerticalEnvelopeRotationField
  + LowerRadialInflowField
  + UpperRadialOutflowField
```

`C` is `DEMO_SCENARIO.stormMotion` — the same prescribed object
diagnostics already use. `CompositeVelocityField` and storm fields do
not know the frame.

---

## 22. Migration plan

**Slice 0 — this document.** Research SoT.

**Slice 1 — Storm-relative environmental advection adapter (physics).**
**Done.** `StormRelativeEnvironmentalAdvectionField`
(`docs/physics/19-storm-relative-environmental-advection.md`).

**Slice 2 — Composition wiring / IntegrationFrame.**
**Done.** Explicit frame on the composition path, not inside storm
DTOs. Default API remains A. SR composite = A env minus world(`C`) plus
identical storm samples.

**Slice 3 — Live DEMO switch.**
**Done.** `App.tsx` uses `StormRelativeLaboratory`. Default composition
API remains `GroundRelativeWindTunnel`. Copy names the storm-relative
laboratory frame. Seeds / `C` / strengths unchanged.

**Slice 4 — Teaching copy / coordinates label (UI, later).**
If 3D is SR, label it. Hodograph stays ground-relative.

**Slice 5 — Story tracers / seed strategy.**
**Research done.** `docs/architecture/04-story-tracers-seed-strategy.md`.
Verdict **C**: current prescribed composite does not admit a full
lower→upper story. No story seeds. Diagnostic seeds kept.

**Slice 5b — Chimney residence / scale-and-strength.**
**Research done.** `docs/architecture/05-chimney-residence-scale-and-strength.md`.
Verdict **D**: mixed regime. Deep residence is possible inside the
current field family; not via `A_in`-only, `W0`-only, or silent
frozen-rate `σ` growth.

**Slice 5c — Deep chimney scaling / DEMO retune.**
**Implemented.** `docs/architecture/06-deep-chimney-scaling-demo-retune.md`.
Live `DEMO_SCENARIO`: `σ = 4000 m`, `W0 = 30 m/s`, frozen peak
speeds, diagnostic seeds `r = 0.6σ`. Story tracers still not added.

**Slice 5d — Deep chimney rendering scaling.**
**Implemented as policy.** `docs/rendering/13-deep-chimney-rendering-scaling.md`.
`11` pose/grid/glyph numbers kept. “1 cell = `σ`” retired.

**Slice 6 — Translating storm (optional, late).**
Wrapper using `sample(..., time)`. Follow camera. Galilean test
against slice 1–2. Never enable together with env boost.

**Not in this sequence:** Bunkers, RK2 DEMO default, downdraft,
continuity, tilting, renderer polish.

---

## 23. New / revised SoT needed

| Document | Role |
| --- | --- |
| **This file** | Frame-architecture SoT (Y15 revisit); slice 2 API in §21.1 |
| `docs/physics/19-storm-relative-environmental-advection.md` | Owns D2 subtract at the `VelocityField` boundary |
| Pointer updates (later hygiene, not this research) | `10` §11.3 "later document" → this file; audit Y15 "revisit when" → done as research, implementation still later; `07` §9 "future boundary" → adapter doc when written; `00` §10 may cite D vs D3 |
| Story-tracer SoT | `docs/architecture/04-story-tracers-seed-strategy.md` (verdict C) |
| Chimney residence / scale-and-strength SoT | `docs/architecture/05-chimney-residence-scale-and-strength.md` (verdict D) |
| Deep chimney scaling / DEMO retune SoT | `docs/architecture/06-deep-chimney-scaling-demo-retune.md` (verdict A; **live**) |
| Deep chimney rendering scaling SoT | `docs/rendering/13-deep-chimney-rendering-scaling.md` (keep `11` numbers; **live policy**) |
| Translating-storm SoT | Only if D3 is wanted |
| Bunkers SoT | Independent; not required |

Do not rewrite `07`, `09`, hodograph UI docs, or storm-field physics
docs as part of choosing the frame. They already separate D1 from
3D.

Optional one-line pointers are docs hygiene, not a production slice.

---

## 24. Blocking decisions (need explicit user command before code)

The following are **not** assumed implemented by this SoT:

1. **Accept E** (dual IntegrationFrame; next physics object = env
   adapter) as the architecture to implement.
2. **Keep live DEMO on A** until a separate DEMO-frame command
   (recommended) versus switch DEMO 3D to D in the same
   implementation slice.
3. **One prescribed `C`** for diagnostics and D2 (recommended) versus
   a later fixture retune of `C` (own SoT, not Bunkers).
4. **No `sample()` interface change** (recommended).
5. **No translating-storm mode** in the next implementation
   (recommended).

Non-blocking (already decided here, do not re-litigate in slice 1):

- wind-tunnel is not a bug;
- Bunkers is not a prerequisite;
- RK2 is not a prerequisite;
- current seeds stay probes;
- do not retune `sigma` / `W0` / seeds for residence;
- storm fields remain C-ignorant;
- diagnostics formulas unchanged.

---

## 25. Compact lock-in

```text
current 3D live:         StormRelativeLaboratory (D2); wind-tunnel
                         remains explicit GR mode
D1 diagnostic:           V_sr = V_env − C; hodograph / SRH; unchanged
D2 integration:          live 3D via env adapter; same prescribed C
D3 translating geometry: not live; not next; Galilean dual of D2
recommended contract:    E — keep A as default API, live DEMO on D
C:                       keep prescribed (10, 0); no Bunkers
VelocityField:           sample(position, time) unchanged; time unused
world vs storm coords:   live 3D is storm-relative laboratory meters
diagnostics:             unchanged inputs; D1 already uses C
story tracers:           not designed here; SR mode gives meaning,
                         not residence, with current C
downdraft:               C-ignorant storm operand; circulation
                         teaching wants E first
next code:              story tracers only when commanded; not started
```

---

## 26. Relationship to prior SoT

- `docs/architecture/02-current-model-assumptions-audit.md` G8 / Y15:
  wind-tunnel is deliberate; revisit when 3D should become
  storm-relative. This is that research revisit. Slices 1–2 are
  implemented; live 3D is StormRelativeLaboratory; default API
  remains GroundRelativeWindTunnel.
- `docs/rendering/10-deep-storm-envelope-scaling.md` §11: correctly
  kept A for envelope scaling. Not contradicted. §11.3 trigger
  (story / lower-to-upper / moving axis) is now specified rather
  than left open.
- `docs/physics/07-storm-relative-wind.md` §9: still forbids silent
  injection into `EnvironmentalWindField`. The adapter is the
  explicit boundary that document reserved.
- `docs/physics/00-coordinate-system.md` §9–§10: origin is not
  automatically the storm; world vs storm-relative positions must
  not mix. E makes the mix explicit at composition, not inside
  field formulas.
- `docs/physics/02-velocity-field-basics.md` §13–§14, §34: prefer
  steady fields; preserve ground vs storm-relative distinction.
  E uses a steady D2 mode and leaves time-dependent D3 for later.

Live browser 3D is `StormRelativeLaboratory`. Default composition API
remains `GroundRelativeWindTunnel`.
