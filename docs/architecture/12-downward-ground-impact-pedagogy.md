# Downward Story / Ground-Impact Pedagogy

**Status:** architecture SoT. Slices 1–3 implemented. Live App
now selects `TracerPedagogy.NearGroundOutflowPathline` (NG1; `14`).
`DownwardPathline` (D1, trails on, `keepInactiveGlyphs`) remains an
explicit composition mode. DiagnosticProbes and StoryPathlines remain
explicit. No `Both`. STOP.

Occupant numbers:
`docs/rendering/15-composite-downdraft-demo.md`.
Seventh operand (later; not this pedagogy slice):
`docs/rendering/16-composite-near-ground-outflow-demo.md`.

Primitive:
`docs/physics/20-vertical-downdraft-envelope.md`.

Tracer floor:
`docs/architecture/11-ground-atmospheric-domain-policy.md`.

Upward story seeds:
`docs/architecture/08-story-seeds.md`.

Trails / pedagogy wiring:
`docs/rendering/14-tracer-path-history.md`.

View fixture (audit only; not changed):
`docs/rendering/11-deep-storm-tracer-view.md`,
`docs/rendering/13-deep-chimney-rendering-scaling.md`.

Continuity anti-claims:
`docs/architecture/10-composite-continuity-mass-budget-audit.md`.

---

## 1. Purpose

This document designs a **separate downward teaching exhibit**:

```text
prescribed downward pathline
  → descent through the downdraft region
  → atmospheric-domain exit at y = 0
```

It answers:

    Which initial condition, how many seeds, which pedagogy mode,
    whether S1/S2 may share the scene, what the terminal glyph does,
    and what the pathline is allowed to claim.

It is **not**:

- a return branch of S1/S2;
- same-air-mass circulation;
- a cold pool, gust front, or surface spreading;
- RFD / FFD;
- realistic precipitation-driven downdraft;
- continuity closure;
- a retune of the live sixth occupant;
- a camera / grid / trail-sampling change;
- a UI toggle.

Live at the time of this SoT (before slice 3):

```text
frame              StormRelativeLaboratory
pedagogy           TracerPedagogy.StoryPathlines
live seeds         S1 / S2
trails             on
tracer domain      AtmosphericTracerDomain   // y ≥ 0
integrator         Euler, dt = 0.1 s
stack              Environmental advection
                   + VerticalEnvelopeUpdraftField
                   + VerticalEnvelopeRotationField
                   + LowerRadialInflowField
                   + UpperRadialOutflowField
                   + VerticalEnvelopeDowndraftField
occupant           center (5000, 0) m
                   σ_down = 2000 m
                   D0 = 20 m/s
                   [baseHeight, topHeight] = [−400, 3600] m
                   y_mid = 1600 m
```

Current live (slice 3):

```text
frame              StormRelativeLaboratory
pedagogy           TracerPedagogy.DownwardPathline
live seeds         D1 = (5000, 1000, 0)
trails             on
keepInactiveGlyphs true
```

S1/S2 remain the upward story. They almost do not sample the
downdraft (`15` §9). That is why a **new** exhibit is required.
They are not retuned here.

---

## 2. Verdict

**A and D together.**

A clean downward exhibit exists. It must be a **separate pedagogy
mode**. Simultaneous display with S1/S2 is forbidden at the current
model class.

```text
verdict:                 A + D
                         A = robust prescribed descent to y = 0 exists
                         D = must not share the scene with S1/S2
canonical seed:          D1 = (5000, 1000, 0)
how many:                one
pedagogy:                TracerPedagogy.DownwardPathline
simultaneous with S1/S2: no
terminal glyph:          keep visible at the terminal (x, 0, z)
trail:                   already honest; no sampling-policy change
ground plane:            current 10 km / 10 grid is enough
camera:                  current 11/13 pose is enough
story claim:             §11
config:                  downwardPathlineSeeds  (not storySeeds)
live App:                TracerPedagogy.DownwardPathline (slice 3)
occupant retune:         none
```

Not B: trails already store the terminal `y = 0` sample; the grid
marks the datum; the locked path stays in the default frustum. The
only renderer gap is inactive-glyph hiding, and that is a specified
policy (`§8`), not a blocking redesign.

Not C: the live occupant already has a stable lower-level basin.
Do not retune `D0`, `σ_down`, center, or envelopes to “improve” a
path that already teaches.

---

## 3. Method

Research only. Temporary scripts. Not tests. Not production.

```text
frame            StormRelativeLaboratory
integrator       Euler dt = 0.1 s  (live); Euler 0.02 / 0.01;
                 RK2 0.1 / 0.02 on the representative
duration         800 s
tracer domain    AtmosphericTracerDomain
field            live six-operand composite from
                 composeDemoTracerFields
occupant         unchanged from 15
live S1/S2       regression only; never rewritten
```

Sweep:

| Probe | Grid |
| --- | --- |
| On-axis `y0` | 200, 400, 600, 800, 1000, 1200, 1400, 1600, 2000, 2500, 3000 m |
| `y = 1000` planform | `r/σ_down ∈ {0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5}` × azimuth 0°/45°/…/315° (`0° = +X` east) |
| Coarse other heights | `y = 600` and `y = 1600` × `r/σ ∈ {0, 0.5, 1.0, 1.5}` × cardinals |
| Neighbourhood | 3×3 and 5×5 at `Δ = 200 m`, `y = 1000`; `Δy` on axis 800–1200 m |
| Advection | live SR; GroundRelativeWindTunnel; storm operands only; isolated downdraft |

Per trajectory: time to ground, min/max `y`, time in `r < σ_down`
and `r < 2σ_down`, landing `(x, z)`, peak sampled downward `Vy`,
path length, horizontal drift, pad membership, camera `θ`.

Not every seed is required to reach ground. Misses map the basin.

---

## 4. What the exhibit is allowed to be

A passive tracer in the live six-operand **storm-relative**
laboratory field, started near the prescribed downdraft, integrated
until `AtmosphericTracerDomain` interpolates it onto `y = 0` and
sets `active = false`.

The path is a **composite** pathline. Isolated
`VerticalEnvelopeDowndraftField` would drop on a vertical line
(`20` §19.1). The teaching object is the occupant **inside the live
sum**, including storm-relative environmental advection.

The exhibit is not a second S1, not a recycled parcel, and not a
surface process.

---

## 5. Seed research

`15` already measured the representative IC `(5000, 1000, 0)` as a
ground-reaching research point. This SoT does **not** install it
just because it was the occupancy probe. It is installed because
the sweep shows it sits **inside** a connected lower-level basin
and because one path of that class is the whole teaching object.

### 5.1 S1/S2 still do not descend

Live six-operand, 800 s:

| | S1 | S2 |
| --- | --- | --- |
| IC | `(0, 1000, 4000)` | `(0, 1000, 6000)` |
| max y | 7029 m | 6989 m |
| min y | 1000 m | 1000 m |
| ground | no | no |
| peak sampled `Vy` | `≥ 0` | `≥ 0` |

Unchanged pedagogical fact from `15` §9: the upward story does not
visit this occupant. Do not wait for S1/S2 to become downward seeds.

### 5.2 On-axis height

Axis of the occupant, live composite, Euler `0.1`:

| `y0` m | ground | `t` s | landing `(x, z)` m | `t` in `r<σ` s | peak `Vy` m/s | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 200 | yes | 28 | `(5033, −182)` | 28 | −8.00 | too short; landing `x` just off pad |
| 400 | yes | 52 | `(5013, −398)` | 52 | −9.61 | short |
| 600 | yes | 72 | `(4954, −648)` | 72 | −10.94 | readable but thin |
| 800 | yes | 94 | `(4859, −942)` | 94 | −11.94 | |
| **1000** | **yes** | **119** | **`(4723, −1308)`** | **119** | **−12.56** | **lock-in** |
| 1200 | yes | 156 | `(4555, −1812)` | 156 | −12.79 | |
| 1400 | yes | 245 | `(4345, −2734)` | 111 | −12.60 | last on-axis hit; leaking |
| 1600 | no | — | — | 87 | −12.08 | `y_mid`; min y 561 m then lost north |
| 2000 | no | — | — | 66 | −9.77 | min y 1377 m |
| 2500 | no | — | — | 59 | −4.11 | brief dip, then up |
| 3000 | no | — | — | 59 | 0.00 | net `Vy > 0` at start; never descends |

Vertical basin on this axis: **`y0 ≤ 1400 m` hits; `y0 ≥ 1600 m`
misses.** Mid-envelope is not a teaching start. Upper envelope on
this offset axis is still updraft-dominated (`E_up(5000 m) ≈ 0.46`).
That is expected. It is not a reason to raise `D0`.

`y0 = 1000 m` is the same height as S1/S2, well below the on-axis
ceiling, and already the occupancy representative. Lower starts
(`200–600 m`) reach ground but teach almost no descent.

### 5.3 Planform at `y = 1000`

Hit map, time to ground in seconds, `·` = miss in 800 s.
Azimuth: `0° = +X` east; `90° = +Z` south; `270° = −Z` north.

```text
r/σ     0   315  270  225  180  135   90   45
        E    NE    N   NW    W   SW    S   SE
0.00   119  119  119  119  119  119  119  119
0.25   114  128  147  156  142  122  109  107
0.50   120  156  254    ·   249  137  109  107
0.75   139  242    ·    ·     ·   175  116  114
1.00   177    ·    ·    ·     ·   443  128  127
1.25   264    ·    ·    ·     ·     ·   146  148
1.50     ·    ·    ·    ·     ·     ·   168  176
```

30/49 of this grid hit. The robust disk is the **near-axis core**
and the **south–east sector** (upstream / cross-stream relative to
low-level `V_sr`). The leak sector is **west–north** at
`r ≳ 0.5 σ_down`: residual updraft toward the chimney plus
northward SR advection pull the parcel out of `E_r` before `y = 0`.

South `r = σ_down` still hits (`t = 128 s`, landing `(4735, 329)`,
on pad). That is a recorded spare, not a second canonical class
(`§6`).

East `r ≥ σ_down` landings leave the `±5000 m` pad and can leave
the default vFOV. They are not the locked exhibit (`15` §11).

### 5.4 Storm-relative advection is why the exhibit is lower-level

Same ICs, four fields:

| IC | live SR | no env (storm only) | isolated downdraft |
| --- | --- | --- | --- |
| axis `y=1000` | hit 119 s, land `(4723, −1308)` | hit 106 s, land `(4686, −245)` | hit 86 s, land `(5000, 0)` |
| south `0.5σ` | hit 109 s | hit 116 s | hit 98 s, `z` frozen |
| north `0.5σ` | hit 254 s | hit 130 s | hit 98 s, `z` frozen |
| north `1.0σ` | **miss** | hit 239 s | hit 142 s, `z` frozen |
| axis `y_mid` | **miss** | hit 161 s | hit 117 s, `(5000, 0)` |

Isolated `Vx ≡ Vz ≡ 0`: every interior start reaches the floor
on a vertical line (`20` §19). Storm-only (no environmental
operand) still hits at `y_mid`. **Live SR is the leak.**
`V_sr(1000 m) ≈ (−5, +15)` eastward/northward → world
`(Vx, Vz) ≈ (−5, −15)`. Parcels are blown north and slightly west
while they descend.

Ground-relative frame (not live) keeps the same hit/miss pattern
but lands east of the pad, because `C` is not subtracted. The
exhibit is defined in `StormRelativeLaboratory`, like S1/S2.

Do not remove environmental advection to make `y_mid` “work.”
The honest laboratory path includes that drift.

### 5.5 Qualitative path of D1

```text
IC                 (5000, 1000, 0)
r0 / σ_down        0
entire descent     r < σ_down   (119 s / 119 s)
peak sampled Vy    −12.56 m/s     // composite; isolated would be −17.82
max y              1000 m         // monotonic descent
min y              0              // domain floor, not envelope lid
t_ground           118.9 s
landing            (4723, 0, −1308)
r_land from axis   1337 m
path length        1696 m
drift              Δx = −277 m, Δz = −1308 m   // west, north
pad                inside ±5000 m
camera θ seed      19.4°   IN  (half vFOV 25°)
camera θ landing   21.7°   IN
```

Horizontal drift is SR + lower inflow + rotation, not spreading at
the surface. `Vx_down ≡ Vz_down ≡ 0`. The landing offset is
advection **during descent**, not a cold-pool footprint.

---

## 6. How many downward story seeds

### A — one canonical seed

**Accepted.**

The exhibit is one mechanism and one path class:

```text
lower-level start in the downdraft core
  → occupy r < σ_down while descending
  → domain exit at y = 0
```

D1 is that class. A second nearby descent does not add a new
ordered sequence the way S2 adds a farther-upstream **inflow**
approach to the chimney (`08` §3).

### B — two complementary seeds

**Rejected as the canonical set.**

Measured candidates that still hit:

| Candidate | Why it is not a second class |
| --- | --- |
| south `0.5σ` / `1.0σ` at `y=1000` | Same height, same descent, same occupant. Upstream-of-SR approach is a basin fact, not a second story. |
| axis `y=600` | Same class, shorter column. S3-like. |
| south `0.5σ` at `y_mid` | Hits because it starts against SR. Teaches basin geometry (diagnostic), not a second life-cycle stage. |

Two ground hits in one scene are worse than redundant: they draw a
**landing patch**. A patch is the visual language of a footprint /
cold-pool source. One terminal point is a pathline end.

Recorded spare, not installed: south `r = σ_down`,
`(5000, 1000, 2000)`, `t = 128 s`, landing `(4735, 329)`. Same
status as S3 in `08`.

### C — more than two

**Rejected.** A particle cloud of falling markers would be read as
mass, precipitation, or outflow. `08` already forbids unlabeled
clouds. Stronger here, because several `y = 0` points look like
accumulation.

---

## 7. Basin robustness

A lucky ground hit is not enough. D1 must sit inside a stable
neighbourhood.

### 7.1 Horizontal, `y = 1000`

`Δx, Δz ∈ {−200, 0, +200}` m: **9/9** hit. Times 111–134 s.
Landings `x ≈ 4480–4950 m`, `z ≈ −1040 … −1630 m`, all on the pad.

`5×5` at the same `Δ = 200 m` (`±400 m`): **25/25** hit. Times
107–166 s. Landing bbox

```text
x ∈ [4220, 5171] m
z ∈ [−2075, −818] m
```

20/25 landings are inside the pad. The five misses-of-pad are the
east column `Δx = +400 m` (`x_land ≈ 5124–5171 m`), not failed
descents. The basin is larger than the pad’s east margin. That is
a pad-tightness note from `15` §11, not a seed problem.

D1 is the **center** of this disk, not a graze.

### 7.2 Vertical

On-axis `y0 ∈ {800, 900, 1000, 1100, 1200}`: **5/5** hit.
`y0 = 1000` is 400 m below the last on-axis success (`1400 m`) and
600 m below the `y_mid` leak. Small `Δy` does not destroy descent.

### 7.3 What robustness does not mean

It does not mean “every tracer in the downdraft column reaches the
floor.” Mid-envelope axis leak (`15` §8.3, this §5.2) stands.
The locked exhibit is the **lower-level** neighbourhood.

---

## 8. Pedagogy mode

Current production:

```text
TracerPedagogy.DiagnosticProbes     // default composition API; no trails
TracerPedagogy.StoryPathlines       // explicit mode; S1+S2; trails on
TracerPedagogy.DownwardPathline     // live App; D1; trails on; keepInactiveGlyphs
```

No `Both` (`08` §5, `14` §8, `09` §6).

### 8.1 Options

| Option | Meaning | Verdict |
| --- | --- | --- |
| **A. New mode** `TracerPedagogy.DownwardPathline` | Own seed array, trails on, terminal glyph policy | **Canonical** |
| B. Extend `StoryPathlines` | S1/S2 + D1 in one mode | **Rejected** (`§9`) |
| C. Exhibition concept outside `TracerPedagogy` | New type beside the enum | **Rejected.** Same composition layer as `IntegrationFrame`: which seeds, whether trails. A third enum value is the right owner. |

Canonical name: **`DownwardPathline`** (singular). Parallel to
`StoryPathlines`, but one seed. Do not rename `StoryPathlines` to
`UpwardPathlines` in this slice.

Rejected names:

| Name | Why not |
| --- | --- |
| `GroundImpact` alone | Omits that the path is a downdraft pathline, not a bounce. |
| `DowndraftPathline` | Sounds like the field type, or like “the downdraft’s air.” |
| `ReturnPathline` / `Circulation` | Forbidden claim. |
| `Both` / `AllStories` | `§9`. |

Composition mapping, same pattern as `14` §8:

```text
DownwardPathline
  → DEMO_SCENARIO.simulation.downwardPathlineSeeds
  → trailEnabled = true
  → keepInactiveGlyphs = true
```

The recorder still does not import the enum. `createTracersFromSeeds`
stays role-agnostic.

DiagnosticProbes remains trails-off and does not gain D1.
StoryPathlines remains S1/S2 only.

UI toggle remains later (`09` §6). A composition constant is
enough, analogous to `LIVE_DEMO_TRACER_PEDAGOGY`.

**Live App is `DownwardPathline` (slice 3).** DiagnosticProbes
and StoryPathlines remain explicit composition options. Same
split as `08`: storing a mode ≠ concatenating groups.

---

## 9. Upward vs downward separation

**Mandatory. D is not optional.**

```text
StoryPathlines     = S1 / S2 only
DownwardPathline   = D1 only
```

The user must never see, in one session, the visual chain

```text
rose along S1/S2  →  left aloft  →  descended nearby
```

and complete it as “the same air came back.”

`10` already made that sentence RED. The sixth operand’s
**existence** is YELLOW. Putting both pathlines on screen at once
is the RED reading, even with a caption that denies it. Motion
writes the circulation. Copy cannot unsay it.

Why “different colors / labels” is not enough:

- S1/S2 already occupy ~200–400 s of trail through the column and
  outflow;
- D1 is a ~120 s descent to the same ground plane the camera
  already treats as the laboratory floor;
- spatial proximity of an east occupant to anvil-exit drift is
  exactly the cartoon of compensating subsidence.

`08` deferred Both because five glyphs collapse into “more
particles.” Here the failure mode is worse: two pedagogical
objects become one false storm.

Do **not** add `TracerPedagogy.Both`.
Do **not** concatenate `storySeeds` and `downwardPathlineSeeds`
at runtime.

If a future Both-mode SoT ever exists, it needs a group language
**and** a model class that may claim related air. This kinematic
stack does not.

---

## 10. Terminal glyph

Current renderer (`TracerScene.syncFromParticles`):

```text
mesh.visible = particle.active
```

Inactive meshes hide. Trails already keep the terminal sample
(`14` §3, `11` §6, `15` §13). After D1 impacts, today: line ends
on `y = 0`, sphere vanishes.

### Options

| | Policy | Pedagogy | Verdict |
| --- | --- | --- | --- |
| **A** | Hide glyph after impact | Trail ends on the grid; climax is easy to miss | Rejected for this exhibit |
| **B** | Keep terminal glyph visible at `(x, 0, z)` | Pathline finished; marker names the exit point | **Canonical** |
| C | Other animated state (fade, splash, bounce, cold-pool stamp) | Invents surface physics | Rejected |

Canonical: **B.**

The ground hit **is** the teaching climax. A disappearing sphere
at that instant hides the exhibit. A resting sphere on the plane
says: the pathline ended here.

This is **renderer state**, not physics (`11` §6, `01` parcel
§27–28):

```text
visible terminal glyph  ≠  air accumulated at the ground
                        ≠  density
                        ≠  a stuck parcel that still has mass
                        ≠  conversion of Vy into outflow
```

The particle stays `active = false`. `Simulation.step` does not
integrate it. The glyph is copied from the frozen terminal
position. It must not skate.

Scope of B: **`DownwardPathline` only.** Do not globally show
inactive meshes. DiagnosticProbes and StoryPathlines have no
domain-exit occupants today; they must not change appearance.

Forbidden visuals: explosion, splash, fade, bounce, expanding
ring, cold-pool outline, “X marks the gust front.”

Implementation: a `TracerScene` observe option `keepInactiveGlyphs`,
mapped by composition from `DownwardPathline`. Do not special-case
`y = 0` inside the scene. The scene already observes `active`; it
observes a composition flag, not domain policy.

---

## 11. Trail semantics

No change to sampling policy (`14`):

```text
stride = 1
record every completed Simulation.step
captureInitial at seed
became-inactive appends the accepted position once
already-inactive skips
full history until Reset
THREE.Line, not a tube
```

Checked against D1:

| Contract | Status |
| --- | --- |
| Terminal sample is the interpolated `(x, 0, z)` | Already true: domain writes the point, then `recordAfterStep` sees `active` flip |
| Line ends at `y = 0` exactly | `min y = 0` under Euler 0.1 / 0.01 / RK2 0.1 |
| No points after deactivation | Recorder contract; `Simulation` skips inactive particles |
| Reset clears trail and restores D1, `active = true` | Same orchestration as StoryPathlines (`14` §9) |
| Pause / `timeScale` | Unchanged: no step → no append; more steps → more points |
| Not a streamtube | One polyline, one glyph; no radius |

Do not add distance-based sampling, fade, or a second trail style
for “impact.” One line from seed to floor is the pathline.

Memory: ~119 s / 0.1 s ≈ 1200 points. Cheaper than S1/S2’s
4000-point story window (`14` §6).

---

## 12. Ground reference plane

Current grid (`11` / `13`):

```text
GridHelper  10000 m / 10 divisions
            XZ, y = 0
            pad ±5000 m, 1000 m cells
```

This is already allowed to be called the **ground reference plane**
(`11` §11). It is still a ruler, not terrain, not a collision mesh,
not a `VelocityField` domain.

D1 landing `(4723, 0, −1308)` is **inside** the pad, ~1.3 cells
north-west of the east-edge seed. The hit is on the ruled plane.
No new ground mesh.

Seed `x = 5000` sits on the east pad edge (occupant placement from
`15`). Acceptable. Do not widen the pad in this SoT. Optional 12 km
margin remains the polish `15` already deferred.

Do not add a landing marker distinct from the terminal glyph.

---

## 13. Camera / framing

Audit only. Pose **not** changed.

```text
camera     (12000, 6000, 12000) → (0, 4000, 0)
FOV        50°   (half vFOV = 25°)
```

| Point | World m | `θ` | vFOV | pad |
| --- | --- | --- | --- | --- |
| D1 seed | `(5000, 1000, 0)` | 19.4° | IN | east edge |
| D1 landing | `(4723, 0, −1308)` | 21.7° | IN | in |
| occupant axis at `y=0` | `(5000, 0, 0)` | 21.9° | IN | east edge |
| S1 seed (not this mode) | `(0, 1000, 4000)` | 16.6° | IN | in |

The ~1.7 km descent stays in the default frustum. The trail does
not exit it. D1 is **better** framed than live S2 (S2 seed is
already pad-out at `z = 6000`).

No separate downward view. No follow camera (`07` / `08`).

A later rendering sibling is **not** required for honesty. Reopen
camera only if a future occupant moves the landing off-frustum.

---

## 14. Story claim

Allowed, and no broader:

```text
prescribed storm-relative pathline descending through the
downdraft region until it exits the atmospheric domain at y = 0
```

Natural wording of the same fact. Not a wider physical claim.

Also allowed as a short label: **downward pathline to the
atmospheric ground boundary.**

Forbidden in UI copy, panel titles, comments, and docs that ship
with this exhibit:

- air returns to the surface;
- same parcel returns / same-air-mass circulation;
- S1/S2 came down here;
- RFD descends / FFD descends;
- precipitation-cooled air;
- cold-pool generation;
- gust-front formation;
- mass-conserving return flow;
- compensating subsidence;
- the missing half of the storm.

Panel subtitle, if this mode is later shown, should name the
frame and the sequence (descent → domain exit), not a supercell
flank.

---

## 15. Ground-impact semantics

Restatement of `11`, now with a live occupant that can actually
cross:

```text
ground hit  =  atmospheric pathline termination
```

Canonical crossing (`11` §6): interpolate the accepted segment
onto `y = 0`, write that position, `active = false`.

This **is**:

- the marker leaving the atmospheric tracer domain at the datum;
- a pathline end on the ground reference plane.

This **is not**:

- vertical momentum converted into horizontal outflow;
- a parcel sticking to the ground as density;
- air vanishing;
- a no-flux / wall / bounce condition on the field;
- `Vy_down(0) = 0` (here `F(0) = 0.309`, isolated axis
  `Vy(0) ≈ −6.18 m/s`; the floor is interior to the envelope);
- evidence that `∇ · V = 0`.

Marker visibility is renderer state (`§10`). Field sampling at
`y < 0` remains legal (G17). Live tracers do not occupy it.

---

## 16. Relation to a future cold pool

Hook only. **Do not design the mechanism here.**

If the project later adds near-ground divergent outflow / cold
pool / gust front while remaining in the **kinematic prescribed
class**, that operand is a **new independent field**, not a
`Vx`/`Vz` bolted onto `VerticalEnvelopeDowndraftField` (`20` §7.2,
`15` §12).

What this exhibit **may** later hand over as teaching context:

| Datum | Role later | Role now |
| --- | --- | --- |
| D1 terminal `(x, 0, z)` | A place a downward pathline ended | Pathline end only |
| `t_ground` | Timing of that exit | Integration fact |
| `V_h` sampled at the terminal point | Whatever the live sum has there (inflow plateau + SR) | **Not** outflow |
| 5×5 landing bbox (`§7.1`) | Research envelope of this basin | **Not** a source region |

What it must **not** hand over:

```text
landing position  ↛  cold-pool source automatically
D1                ↛  RFD generator
several landings  ↛  pool boundary
Vy at impact      ↛  prescribed spreading
```

A future cold-pool SoT chooses its own center, envelope, and
seeds. Coincidence with D1’s landing would be a DEMO fixture to
justify, not an inheritance.

---

## 17. Numerical robustness

D1, live composite, atmospheric floor:

| Integrator | `dt` s | `t_ground` s | landing `(x, z)` m |
| --- | --- | --- | --- |
| Euler | 0.1 | 118.900 | `(4723.46, −1308.39)` |
| Euler | 0.02 | 118.940 | `(4723.80, −1308.08)` |
| Euler | 0.01 | 118.930 | `(4723.84, −1308.04)` |
| RK2 | 0.1 | 119.000 | `(4723.88, −1308.00)` |
| RK2 | 0.02 | 118.940 | `(4723.88, −1308.00)` |

`min y = 0` exactly in all five (domain interpolation). Landing
moves `< 0.5 m`. Time agrees to `0.1 s`. Peak sampled `Vy` is
identical at the reported precision (`−12.564 m/s`).

3×3 neighbourhood at Euler `0.01`: still **9/9**.

This is **not** Euler overshoot through an envelope lid. If
`baseHeight` were `0`, continuous trajectories would not reach
the lid in finite time (`20` §19.3, `15` §6.1). Here `y = 0` is
interior (`F(0) > 0`). The last Euler chord may penetrate a
fraction of a metre; `AtmosphericTracerDomain` puts the accepted
point on the plane. That is the `11` contract, and it is
dt-stable for this seed.

Do **not** switch the live integrator or shrink `dt` in the
implementation slice. Euler `0.1` remains the laboratory step.

Forbidden oracle: `y(t) = y0 − D0 t`. Composite `Vy` is not
`−D0`, and `F(y)` is not 1 along the path.

---

## 18. Config ownership

Current (`01`, `08`):

```text
simulation.diagnosticSeeds    // probes
simulation.storySeeds         // S1/S2 lower→upper pathlines
role = which array, not a tag
```

D1 does **not** belong in `storySeeds`. That array’s meaning is
locked: prescribed SR pathline through lower inflow, deep
updraft, upper outflow (`08` §6). Mixing D1 into it would make
`StoryPathlines` show a false circulation the moment the mode
is selected.

Rejected:

| Option | Why not |
| --- | --- |
| Append D1 to `storySeeds` | Roles collapse; Both by accident |
| Per-seed `{ role: "downward" }` tag soup | `08` already rejected tags |
| Generic `pedagogicalGroups[]` | Speculative framework |
| Fixture file outside `ScenarioConfig` | Second parameter source; `08` §4 rejected this for story seeds |
| Leave D1 only in app constants forever | Parallel owner the first time the mode is implemented |

Canonical, implemented:

```text
simulation.downwardPathlineSeeds: ScenarioTracerSeed[]
```

DEMO contents:

```text
D1  (5000, 1000, 0)
```

Empty array remains legal, as empty `storySeeds` is legal. DEMO
populates one seed. Role is **which array**.

Do not add `downwardStorySeeds` as a second name. One field.
`downwardPathlineSeeds` matches `DownwardPathline` and does not
reuse `08`’s word “story” for a different sequence.

---

## 19. Tests / implementation contract

When commanded, test the **exhibit contract**, not the full
research grid.

Required:

- D1 is the sole DEMO occupant of `downwardPathlineSeeds`;
- `demoSeedsForPedagogy(DownwardPathline)` returns that array,
  not `storySeeds`;
- trails on; DiagnosticProbes still trails-off;
- live Euler `0.1`, atmospheric domain: D1 deactivates with
  `y = 0` exactly; landing within a few metres of
  `(4723, −1308)`; `t` near 119 s (loose tolerance; do not
  freeze research digits as physics);
- already-inactive steps do not append trail points; terminal
  sample exists once;
- Reset restores D1 and `active = true`, trail length 1;
- StoryPathlines regression: S1/S2 still do not deactivate;
- Euler `0.01` (or RK2 `0.1`) still grounds D1 — qualitative,
  not a live switch;
- no `Both` value on the enum.

Do not require 25/25 neighbourhood in production tests. That
fact lives here.

Do not screenshot the glyph. If `keepInactiveGlyphs` is a scene
option, a unit test that an inactive particle remains
`mesh.visible === true` under that option is enough.

---

## 20. Implementation slices

1. **Config + mode, not live.** **Done.**
   `downwardPathlineSeeds` on `ScenarioConfig` / `DEMO_SCENARIO`;
   `TracerPedagogy.DownwardPathline`; composition maps seeds +
   trails; tests in `§19`.

2. **Terminal glyph.** **Done.**
   `TracerScene` observe option `keepInactiveGlyphs`;
   composition enables it only for `DownwardPathline`. No splash.

3. **Live switch.** **Done.**
   `LIVE_DEMO_TRACER_PEDAGOGY = TracerPedagogy.DownwardPathline`.
   DiagnosticProbes and StoryPathlines remain explicit.

Do **not** start: cold pool, gust front, near-ground `V_h`,
RFD/FFD, precipitation, continuity solver, pressure/buoyancy,
UI toggle, camera polish, pad widen, occupant retune.

---

## 21. Stale-assumption pointers

This SoT does not mass-edit predecessors. Read them through A+D:

| Document | After this SoT |
| --- | --- |
| `08` | S1/S2 unchanged. `storySeeds` still means the upward sequence only. |
| `14` | Trails architecture unchanged. Third pedagogy value is composition, not a recorder change. Terminal-glyph visibility is `keepInactiveGlyphs` on `TracerScene`, mapped only for DownwardPathline. |
| `15` | Occupant numbers unchanged. Representative IC is the canonical **D1** and is the live pedagogy. |
| `11` | Crossing policy unchanged. Live consumer of that policy is D1. |
| `10` | Residual stays YELLOW. D1 must not be sold as the return of S1/S2. Separation of modes is how that anti-claim stays visually enforceable. |
| `20` | Primitive unchanged. Isolated vertical-line oracle is not the DEMO path. |
| `09` | “No downdraft” is stale as an operand fact (`15` wired it). Downward **teaching view** is live. Both-groups remains forbidden; this SoT strengthens that for upward+downward. |

---

## 22. Compact lock-in

```text
verdict:                 A + D
                         clean downward exhibit exists
                         simultaneous with S1/S2 is forbidden

canonical seed:          D1 = (5000, 1000, 0)
                         occupant axis, story height
how many:                one; south r=σ spare recorded, not installed
basin:                   3×3 Δ=200 m → 9/9
                         5×5 Δ=200 m → 25/25
                         Δy 800–1200 m on axis → 5/5
                         on-axis ceiling between 1400 and 1600 m
                         west–north r≳0.5σ leaks (SR + residual updraft)

pedagogy:                TracerPedagogy.DownwardPathline
StoryPathlines:          S1/S2 only
simultaneous:            no; no Both
terminal glyph:          keep visible at (x, 0, z)
                         renderer state; not accumulation
trail:                   existing recorder; terminal y=0 once;
                         no sampling change
ground plane:            current 10 km / 10 grid sufficient
camera:                  11/13 sufficient; no sibling view
story claim:             prescribed SR pathline descending through
                         the downdraft region until it exits the
                         atmospheric domain at y = 0
ground impact:           pathline termination, not outflow,
                         not density, not disappearance of air
config:                  downwardPathlineSeeds (implemented);
                         not storySeeds; not tags
numerical:               Euler 0.1 ≈ Euler 0.01 ≈ RK2 0.1
                         (Δt ~ 0.1 s, Δland < 0.5 m);
                         domain interpolation dt-stable;
                         not lid overshoot
cold pool:               independent future operand;
                         D1 landing is not a source
occupant:                unchanged
live App:                DownwardPathline (D1); StormRelativeLaboratory
production this slice:   LIVE_DEMO_TRACER_PEDAGOGY = DownwardPathline;
                         DiagnosticProbes and StoryPathlines still explicit
```

---

## 23. STOP

Slice 3 is implemented.
Live App is `DownwardPathline` (D1).
STOP.
No cold pool, gust front, near-ground outflow, RFD/FFD,
precipitation, solver, UI, splash, or camera polish.
