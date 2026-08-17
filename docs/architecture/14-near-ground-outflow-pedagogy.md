# Near-Ground Outflow Pedagogy

**Status:** architecture SoT. Slices 1–2 implemented. Live App
selects `TracerPedagogy.NearGroundOutflowPathline` (NG1, trails on,
inactive glyphs hidden). DiagnosticProbes, StoryPathlines, and
DownwardPathline remain explicit composition modes. Occupant
numbers unchanged. Live switch is done. No `Both`. STOP.

Occupant / seventh-operand wiring:
`docs/rendering/16-composite-near-ground-outflow-demo.md`.

Primitive:
`docs/physics/21-near-ground-radial-outflow.md`.

Downward exhibit (must not share the scene):
`docs/architecture/12-downward-ground-impact-pedagogy.md`.

Independence / no-cold-pool / no-D1-source:
`docs/architecture/13-post-downdraft-checkpoint.md`.

Upward story seeds:
`docs/architecture/08-story-seeds.md`.

Ground / tracer floor:
`docs/architecture/11-ground-atmospheric-domain-policy.md`.

Trails:
`docs/rendering/14-tracer-path-history.md`.

View fixture (audit only; not changed):
`docs/rendering/11-deep-storm-tracer-view.md`,
`docs/rendering/13-deep-chimney-rendering-scaling.md`.

Continuity anti-claims:
`docs/architecture/10-composite-continuity-mass-budget-audit.md`.

---

## 1. Purpose

This document designs a **separate teaching exhibit** for the live
seventh operand:

```text
prescribed storm-relative near-ground pathline
  → advected through a divergent horizontal outflow region
  → meaningful residence inside that near-ground layer
```

It answers:

    Which initial condition, how many seeds, which pedagogy mode,
    whether D1 or S1/S2 may share the scene, what trails and the
    terminal glyph do, and what the pathline is allowed to claim.

It is **not**:

- a continuation of D1;
- a cold pool, gust front, density current, or surface spreading
  after impact;
- a mass-return branch of S1/S2;
- RFD / FFD;
- a retune of the live seventh occupant;
- a camera / grid / trail-sampling change;
- a domain change;
- a UI toggle.

Live at the time of this SoT:

```text
frame              StormRelativeLaboratory
pedagogy           TracerPedagogy.DownwardPathline
live seed          D1 = (5000, 1000, 0)
trails             on
keepInactiveGlyphs true
tracer domain      AtmosphericTracerDomain   // y ≥ 0
integrator         Euler, dt = 0.1 s
stack              Environmental advection
                   + VerticalEnvelopeUpdraftField
                   + VerticalEnvelopeRotationField
                   + LowerRadialInflowField
                   + UpperRadialOutflowField
                   + VerticalEnvelopeDowndraftField
                   + NearGroundRadialOutflowField
occupant           center (3000, 4000) m
                   σ_ng = 1500 m
                   A = 0.010991 s⁻¹
                   [baseHeight, topHeight] = [0, 800] m
                   G(0) = 1, G(1000) = 0
```

S1/S2 remain the upward story. D1 remains the downward pathline.
Diagnostic probes remain at `y = 1000 m`, where this occupant is
identically zero. None of those arrays is retuned here.

---

## 2. Verdict

**A. A clean robust near-ground outflow exhibit exists.**

Current renderer and trail primitive are sufficient. The exhibit
must be a **separate pedagogy mode**. Simultaneous display with D1
is forbidden. Simultaneous display with S1/S2 is forbidden.

```text
verdict:                      A
canonical seed:               NG1 = (3000, 100, 4750)
how many:                     one
basin:                        interior
pedagogy:                     TracerPedagogy.NearGroundOutflowPathline
config array:                 nearGroundOutflowPathlineSeeds
trails:                       on; existing recorder; stride = 1
terminal glyph:               hide when inactive
                              (ground hit is not this climax)
ground behavior:              incidental domain exit at 276 s
                              after the outward story is already visible
simultaneous with D1:         no
simultaneous with S1/S2:      no
lower-inflow interaction:     opposes; NG still leads
camera/grid:                  current 11/13 sufficient
numerical robustness:         Euler 0.1 ≡ RK2
allowed claim:                §14
occupant retune:              none
live App after this SoT:      still DownwardPathline
```

Not B: the locked path stays in the default frustum; trails already
store history; the pad is tight at the *end*, not a blocking
redesign (`16` §13 already treated that as optional polish).

Not C: the live seven-operand sum already has a connected
south–west basin at `y ≈ 100 m`. Do not retune `A`, `σ_ng`,
center, or envelopes to “improve” a path that already teaches.

Not D: false cold-pool / D1 coupling is a **combined-scene**
failure, not a property of this pathline. Mode isolation is how
the current kinematic class stays honest (`12` §9, `13` §10).
Copy is not a substitute for that isolation, and is not required
to carry a combined exhibit that this SoT refuses.

---

## 3. Method

Research only. Temporary scripts. Not tests. Not production.
`DEMO_SCENARIO` was not edited.

```text
frame            StormRelativeLaboratory
integrator       Euler dt = 0.1 s  (live); Euler 0.02 / 0.01;
                 RK2 0.1 / 0.02 on representatives
duration         300 s (polar sweep / neighbourhood);
                 800 s (fate of shortlist)
tracer domain    AtmosphericTracerDomain
field            live seven-operand composite from
                 composeDemoTracerFields
occupant         unchanged from 16
live S1/S2/D1    regression only; never rewritten
research ICs     separate grid around the ng axis
```

Ablation fields, same ICs: isolated `NearGroundRadialOutflowField`;
storm operands only (no environmental advection); live minus NG;
live minus inflow / downdraft / rotation / updraft; environment
plus NG only.

Sweep:

| Probe | Grid |
| --- | --- |
| Polar | `y0 ∈ {50, 100, 150, 200, 300}` × `r/σ_ng ∈ {0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5}` × azimuth `0°/45°/…/315°` (`0° = +X` east) |
| `y = 0` control | axis + cardinals at `r/σ ∈ {0.5, 1.0, 1.5}` |
| South `r = 0.5σ` height | `y0 ∈ {50, 75, 100, 125, 150, 200, 250, 300, 400, 600}` |
| Neighbourhood | 3×3 and 5×5 at `Δ = 150 m` / `300 m`; `Δy`; `Δθ = ±15°`, `Δr = ±150 m` |
| Ablation | isolated / storm-only / no-NG / operand dropouts on the shortlist |

`y = 0` is a stack-fact control, not a candidate IC (`16` §11.1).

Per trajectory, relative to **this occupant’s axis** `(3000, 4000)`,
not the chimney origin:

`Δr`, `r_final/r0`, time with `dr/dt > 0`, time in `r < 2 σ_ng`,
time in `y < topHeight`, horizontal path length, lifetime,
ground exit, pad / camera `θ`, distance to D1 landing and to the
downdraft axis. Along live paths: Eulerian mean `v_r` of NG,
inflow, SR, rotation, and the total, plus chimney-relative `v_r`.

Occupancy’s research bar `Δr > 50 m` is **not** the teaching
threshold. Fifty metres before domain exit is a mapped basin, not
an exhibit.

---

## 4. What the exhibit is allowed to be

A passive tracer in the live seven-operand **storm-relative**
laboratory field, started inside the prescribed near-ground
outflow layer, integrated while its horizontal distance to **that
operand’s** axis increases for a long enough interval that the
motion is a trajectory, not a nudge.

The path is a **composite** pathline. Isolated
`NearGroundRadialOutflowField` would stay at frozen `y` and run
out along a horizontal ray (`21` §26). The teaching object is the
occupant **inside the live sum**, including storm-relative
environmental advection and the competing lower inflow.

The exhibit is not D1, not a recycled parcel, not a surface
process, and not a particle cloud.

---

## 5. Teaching threshold

Locked. A research IC is a near-ground outflow teaching success
if and only if **all** of the following hold on the live SR
composite. Ground exit is neither required nor sufficient.

```text
1. active near-ground start
   y0 ∈ (0, 400] m
   G(y0) ≳ 0.7; not the floor; not the story layer

2. off-axis in this occupant
   r0 / σ_ng ∈ [0.25, 1.0]
   axis r0 = 0 is excluded: isolated NG is rest

3. outward displacement relative to the ng axis
   Δr ≥ 0.5 σ_ng = 750 m
   and, when r0 > 0, r_final / r0 ≥ 1.5

4. outward in time, not a one-step bump
   t(dr/dt > 0 wrt ng axis) ≥ 40 s
   and ≥ 60 % of the trajectory lifetime

5. meaningful residence in the active vertical layer
   t(y < topHeight) ≥ 40 s
   and ≥ 80 % of the trajectory lifetime
   max y must not become a chimney capture

6. NG is the leading ng-radial source
   mean v_r,ng of NearGroundRadialOutflowField > 0
   and ≥ |mean v_r,ng of SR advection|
   and ≥ |mean v_r,ng of LowerRadialInflowField|
   mean total v_r,ng > 0

7. not an SR-only success
   live minus NG must not itself pass (3)–(5)
   (or must pass them only weakly: Δr well below 750 m)
```

Chimney-relative `v_r` is a **diagnostic**, not a success test.
Outward-from-B is not outward-from-origin (`16` §8.2). A seed
whose chimney-relative `v_r` is strongly inward while ng-relative
`v_r` is outward can still pass (1)–(7); it is then judged as a
false “feeding the storm” picture and rejected on pedagogy, not
on the radial algebra.

The occupancy bar `Δr > 50 m` remains a mapped-basin fact of
`16`. It is too weak to install a seed.

---

## 6. Seed research

`16` already mapped a `y = 100 m` research grid and forbade
`y = 0` ICs on the live stack. This SoT does **not** install a
seed just because that grid spread. It installs one IC because
the sweep shows it sits **inside** a connected basin, passes §5
on the live composite, and is not the axis, not D1-ward, and not
an SR-dominated escape into the chimney.

### 6.1 `y = 0` is still not a live IC

Isolated NG has `Vy ≡ 0`. An isolated tracer at `y = 0` stays
active and spreads (`21`).

The live seven-operand stack does not. At the ng axis,
`Vy_tot(0) = −0.507 m/s` (downdraft tail; updraft lid is zero).
`AtmosphericTracerDomain` deactivates on the first proposed
`y < 0`.

Measured control, live, 20 s: **0 / 13** useful. Axis and
cardinals at `r/σ ∈ {0.5, 1.0, 1.5}` all ground at `t = 0.1 s`
with `Δr = 0`. Do not start on the floor. Do not change the
domain to rescue those ICs.

### 6.2 Stack facts at the occupant axis

| `y` m | `G_ng` | `Vy_tot` | `Vy_down` | `Vy_up` | `|Vh_ng|(r=σ)` | `V_sr` world `(Vx, Vz)` |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 1 | −0.507 | −0.507 | 0 | 10.00 | (5.00, −5.00) |
| 50 | 1.00 | −0.299 | −0.568 | 0.270 | 9.95 | (4.50, −5.50) |
| **100** | **0.98** | **−0.089** | **−0.628** | **0.539** | **9.81** | **(4.00, −6.00)** |
| 150 | 0.96 | +0.121 | −0.687 | 0.809 | 9.57 | (3.50, −6.50) |
| 200 | 0.92 | +0.332 | −0.745 | 1.078 | 9.24 | (3.00, −7.00) |
| 300 | 0.83 | +0.757 | −0.858 | 1.614 | 8.31 | (2.00, −8.00) |
| 800 | 0 | +2.92 | −1.33 | 4.24 | 0 | (−3.00, −13.00) |
| 1000 | 0 | +3.79 | −1.46 | 5.26 | 0 | (−5.00, −15.00) |

At `y = 100 m` the occupant is still essentially full strength.
Net `Vy` on this axis is a small residual of updraft versus
downdraft tails. Horizontal motion is the exhibit, not a race
to the floor.

Isolated peak `v_r` at `r = 0.5 σ_ng`, `y = 100 m`:

```text
E(0.5σ) ≈ 0.882
v_r ≈ A r E G ≈ 7.1 m/s
```

### 6.3 Polar map at `y = 100 m`

Live SR composite, Euler `0.1`, 300 s. `Δr` in metres. `·` in
the grounded map means still active.

```text
Δr (m)
r/σ     E     SE      S     SW      W     NW      N     NE
0.00   1648  1648   1648   1648   1648   1648   1648   1648
0.25   1335  1381   1234   1707   1966   1682   1411   1303
0.50   1254  1688   1742   2537   3088   1770   1190   1057
0.75   1180  1960   1267   1845   3082   1812    983    849
1.00   1086  2044    860   1221   2932   1828    796    670
1.25    981  1829    529    716   2712   1863    632    518
1.50    877  1489    218    278   2438   2010    495    395

grounded
r/σ     E   SE    S   SW    W   NW    N   NE
0.00    Y    Y    Y    Y    Y    Y    Y    Y
0.25    Y    Y    Y    Y    Y    Y    Y    Y
0.50    Y    Y    Y    ·    ·    Y    Y    Y
0.75    Y    Y    ·    ·    ·    Y    Y    Y
1.00    Y    Y    ·    ·    ·    Y    Y    Y
```

North / east of B point toward the downdraft / D1 side and hit
the floor in ≲ 90 s. South / west stay in the layer longer and
still increase `r`. One lucky trajectory is not the exhibit; the
sector is.

The same pattern holds at `y0 = 50` and `y0 = 150`. Raising
`y0` to 200–300 m inflates `Δr` on west / north-west ICs because
those pathlines **leave the layer and rise into the chimney**
(`max y` of 1–3 km, `t(y < 800)` dropping). That is not a
near-ground exhibit. Do not chase those numbers.

### 6.4 Axis is not a teaching seed

Axis IC `(3000, 100, 4000)`:

| Field | `t` s | `Δr` m | notes |
| --- | --- | --- | --- |
| isolated NG | 300 | **0** | `V ≡ 0` on the axis (`21`) |
| live SR | 113, ground | 1648 | SR knocks it off-axis, then it spreads and dies |
| live minus NG | 138, ground | 1172 | most of the live `Δr` is already SR |

Along the live axis path, mean `v_r,ng` is `SR = 6.71` versus
`NG = 6.11`. NG does not lead. The axis fails §5.2 and §5.6.
Do not install it. Occupancy’s axis `Δr = +1648 m` was a mapped
fact, not a pedagogy candidate.

### 6.5 D1-ward azimuths are not the exhibit

North `r = 0.5σ` at `y = 100`: grounds at **69 s**, `Δr = 1190 m`,
end `(3204, 0, 2071)`, toward the downdraft. Isolated NG would
have run north for 300 s with `Δr = 2278 m`. Live north is a
brief skate into the sixth operand’s floor. Combined with D1 it
would be the surface analog of `Both`. Rejected as canonical
even in a separate mode: the path itself points at D1’s side of
the laboratory.

East of B grounds in ~90 s and the end sits near the downdraft
easting. Same rejection class.

### 6.6 Shortlist at `y = 100 m`, `r = 0.5σ`

| | S `(3000, 100, 4750)` | SW `(2469.7, 100, 4530.3)` | W `(2250, 100, 4000)` | N1 `(2500, 100, 4500)` |
| --- | --- | --- | --- | --- |
| `r0/σ` | 0.50 | 0.50 | 0.50 | 0.47 |
| azimuth | 90° south | 135° | 180° west | 135° |
| live `Δr` / `t` | **1742 / 276 ground** | 2537 / 300 active | 3088 / 300 active | 2595 / 300 active |
| 800 s fate | grounds 276 s, `max y = 112` | **rises**: `y = 3227` at 800 s | grounds 303 s, `max y = 122` | grounds 476 s, `max y = 173` |
| isolated `Δr` (300 s) | 2278, south ray | 2278, SW ray | 2278, west ray | ~2300, SW ray |
| no-NG `Δr` | **417** | 719 | 958 | 731 |
| `<v_r,ng>` NG / in / SR | **7.95 / −2.13 / 0.43** | 7.16 / +1.76 / −0.20 (300 s); SR wins by 800 s | 6.10 / +2.17 / +2.05 | 4.92 / +1.45 / +1.71 (to ground) |
| chimney `<v_r>` | **+2.63** | −10.9 | −9.14 | −6.57 |
| NG leads | **entire life** | 260 s, then chimney capture | 211 / 300 s | 230 / 476 s |
| 3×3 `Δ=150 m` | **9/9** | 9/9 | 9/9 | — |
| 5×5 `Δ=150/300` | **23/25** | 24/25 | — | **25/25** |
| pad seed / end | in / **end `x = 5400` out** | in / in at 300 s; 800 s off | in / in | in / in |
| `θ` trail | 21.1° … 23.3° IN | 14–20° then off-story | 15–19° IN | 14.5–19.6° IN |

West and exact-SW look “better” on raw `Δr`. They fail as
canonical for reasons that are not taste:

- **West:** chimney-relative `v_r ≈ −9 m/s`. The trail runs
  toward the origin. That is a false “feeding the storm”
  picture. Inflow and SR both *add* to ng-radial outflow.
  NG still leads, but the visual claim is mixed.
- **Exact SW at long integration:** by `t = 600 s` the particle
  is above `topHeight` (`y = 937 m`); by 800 s it is a 3 km
  updraft pathline with SR-dominated `<v_r>`. Live App does not
  stop the clock. A seed that becomes a chimney story is not a
  near-ground exhibit.
- **N1 `(2500, 100, 4500)`:** the most robust disk (25/25) and
  it does ground while still near-ground. Inflow and SR *add*
  rather than oppose. Chimney-relative `v_r` is inward. Same
  class as SW, slightly nicer numbers. Recorded spare, not a
  second pedagogical class.

**South `r = 0.5σ` is the lock-in.** Inflow *opposes* and NG
still leads for the entire life. SR is a small residual
(`0.43 m/s` versus NG `7.95`). Live minus NG fails §5
(`Δr = 417 m`). Isolated NG is a clean south ray. Composite
bends east and eventually grounds, which is the honest
laboratory path. `max y = 112 m`: it never becomes an updraft.
North / D1-ward it is not.

### 6.7 Qualitative path of NG1

Live SR composite, Euler `0.1`:

```text
IC                 (3000, 100, 4750)
r0 / σ_ng          0.50     azimuth 90° south of B
G(y0)              0.98
isolated v_r(t=0)  ≈ 7.1 m/s south

t = 0    (3000, 100, 4750)   r =  750
t = 50   (3191, 107, 4666)   r =  692   // brief SR/inflow dip toward B
t = 100  (3491, 112, 4531)   r =  723
t = 150  (3947, 107, 4309)   r =  996
t = 200  (4541,  85, 3966)   r = 1541   // outward story already clear
t = 250  (5135,  36, 3544)   r = 2183
t = 275.7 (5400, 0, 3330)    r = 2492   // domain exit; not the climax

Δr                 +1742 m
r_final / r0       3.32
t(dr/dt > 0)       208.6 s   (76 % of life)
t in y < 800       275.7 s   (100 %)
t in r < 2σ        275.7 s   (100 %)
horizontal length  2801 m
max y              112 m
min y              0
peak sampled NG v_r along path: mean 7.95 m/s
inflow mean v_r,ng −2.13 m/s   (opposes)
SR mean v_r,ng     +0.43 m/s
total mean v_r,ng  +6.32 m/s
chimney mean v_r   +2.63 m/s   (not a chimney-inward seed)
d(end, D1 landing) 4695 m
d(end, downdraft)  3354 m
pad seed           inside ±5000 m  (z = 4750)
pad end            x = 5400 out by 400 m
camera θ seed      21.1°  IN
camera θ end       23.3°  IN
```

The first ~80 s show a small `r` dip: from south of B, low-level
`V_sr` has a northward world `Vz < 0`, which is toward the ng
axis. That is composite honesty, not a failure. By `t = 200 s`,
`Δr = +791 m` and the trail is a clear outward path. Isolated
NG has no dip: `r` only increases, `y` is frozen, the particle
never grounds.

Horizontal drift after the dip is east of south, because SR is
eastward. It is **not** spreading at D1’s landing. End and D1
remain 4.7 km apart.

### 6.8 Height along the south `r = 0.5σ` ray

| `y0` m | ground | `t` s | `Δr` m | `max y` | §5 | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 50 | yes | 212 | 1113 | 50 | pass | shorter column |
| 75 | yes | 258 | 1578 | 77 | pass | |
| **100** | **yes** | **276** | **1742** | **112** | **pass** | **lock-in** |
| 125 | yes | 279 | 1781 | 149 | pass | |
| 150 | yes | 277 | 1789 | 187 | pass | end closer to downdraft |
| 200 | yes | 274 | 1898 | 266 | pass | still in layer; more SR |
| 300 | yes | 299 | 2585 | 428 | pass | approaching chimney capture |
| 400 | no | 300 | 3072 | 603 | pass* | `t(y<800)` still high; not near-ground start |
| 600 | no | 300 | 4614 | 1585 | **fail** | leaves the layer; not this exhibit |

`y0 = 100 m` is the occupancy research height, the same order as
the story / diagnostic layer but **below** `topHeight`, with
`G ≈ 1`, and 50–200 m of vertical neighbourhood that still
passes. Lower starts (`50 m`) work and teach less residence.
Higher starts (`≳ 300 m`) start leaking into the chimney.

---

## 7. How many seeds

### A — one canonical seed

**Accepted.**

The exhibit is one mechanism and one path class:

```text
near-ground start in this occupant’s south core
  → occupy r ~ O(σ_ng) while moving outward from B
  → remain in y < topHeight for O(100 s)
```

NG1 is that class. A second nearby outward path does not add a
new ordered sequence the way S2 adds a farther-upstream **inflow**
approach to the chimney (`08` §3).

### B — two complementary seeds

**Rejected as the canonical set.**

Measured candidates that still pass §5:

| Candidate | Why it is not a second class |
| --- | --- |
| N1 `(2500, 100, 4500)` | Same height, same `r/σ`, adjacent SW azimuth. More robust disk; inflow/SR add; chimney-inward. Basin spare, not a new story. |
| West `r = 0.5σ` | Same class, larger `Δr`, false chimney-feed visual. |
| South `r = 0.75σ` / `1.0σ` | Same south bearing, weaker `Δr`, seed already pad-out at `z = 5125` / `5500`. S2-like radius step would draw a **fan**. |
| South `y0 = 50` | Same class, shorter. S3 analog. |

Two outward pathlines in one scene are worse than redundant:
they draw a **spreading sector**. A sector is the visual language
of a cold-pool footprint / mass spreading. `16` §14 already
warned that several near-ground tracers become that cartoon.
One pathline is a trajectory. Two are a fan.

Recorded spare, not installed: N1 `(2500, 100, 4500)`, 5×5
**25/25**, grounds at 476 s still in the layer. Same status as
S3 in `08` and south `r = σ_down` in `12`.

### C — more than two

**Rejected.** Several diverging tracers in this layer are almost
immediately readable as mass spreading, a cold-pool footprint,
or a gust-front arc. Stronger prohibition than `08`’s unlabeled
cloud, because the occupant itself is divergent `V_h` at the
named ground plane.

---

## 8. Basin robustness

A lucky outward path is not enough. NG1 must sit inside a stable
neighbourhood.

### 8.1 Horizontal, `y = 100`

`Δx, Δz ∈ {−150, 0, +150}` m: **9/9** pass §5. `Δr` 941–2000 m.
Times 213–300 s.

`5×5` at `Δ ∈ {−300, −150, 0, +150, +300}` m: **23/25** pass.
`Δr` median 1505 m.

The two failures:

```text
Δ = (−300, +150) → (2700, 100, 4900)   Δr = −663 m
Δ = (−300, +300) → (2700, 100, 5050)   Δr = −190 m
```

West-south of NG1, toward the chimney. Lower inflow on that
corner overpowers ng-radial outflow. That is the basin *edge*,
~300 m from the locked seed, not a hole under it.

Azimuth / radius perturbations `Δθ ∈ {−15, 0, +15}°`,
`Δr ∈ {−150, 0, +150}` m: **8/9** pass. The miss is
`Δθ = +15°` (more south) and `Δr = +150 m` (`Δr_path = 183 m`):
the far-south graze, same class as south `r = 1.25σ` on the polar
map.

NG1 is the **interior** of this disk, not a graze. The chimney-
side boundary is documented. It is not a reason to move the seed
west into N1: that would trade inflow-opposition for
chimney-inward appearance.

### 8.2 Vertical

South `r = 0.5σ`, `y0 ∈ {50, 75, 100, 125, 150}`: **5/5** pass.
`Δy ∈ {−50, −25, 0, +25, +50}` m at NG1: **5/5**.

`y0 = 100 m` is 50 m above the floor-control failure and 200 m
below the chimney-leak starts. Small `Δy` does not destroy
outward motion.

### 8.3 Verdict

```text
basin:  interior
        3×3 Δ=150 m → 9/9
        5×5 Δ=300 m → 23/25
        Δy ±50 m → 5/5
        chimney-side graze at ~300 m west-south
        north/east of B is a different, D1-ward leak
```

Not edge/graze. Not “no robust basin.”

---

## 9. Composite versus isolated

NG1, 300 s unless noted:

| Field | `Δr` m | fate | `max y` |
| --- | --- | --- | --- |
| **live SR (seven operands)** | **1742** | ground 276 s | 112 |
| isolated NG | 2278 | active, `y` frozen | 100 |
| storm only (no env) | 1824 | active | 213 |
| live minus NG | **417** | ground 215 s | 105 |
| live minus inflow | 2232 | active | 115 |
| live minus downdraft | 1929 | active | 360 |
| live minus rotation | 1795 | ground 298 s | 114 |
| live minus updraft | 1122 | ground 219 s | 100 |
| env + NG only | 2127 | active, `y` frozen | 100 |

Isolated NG is the ray oracle: south, `r` increasing, never
grounds. Live is slower and bent east, then the downdraft tail
takes it to `y = 0`. That difference **is** the teaching of a
composite pathline, the same relation isolated-vertical-line
versus D1 in `12` §5.4.

Live minus NG does **not** pass §5 (`Δr = 417 m < 750`). The
outward story is not SR carrying a passive tracer past B.
Removing inflow *increases* `Δr`: inflow was the opponent.
Removing rotation barely changes the path. Removing updraft
shortens life (less cancellation of `Vy_down`) but the remaining
path is still outward. Removing downdraft keeps the particle up
and still spreading. Do not disable downdraft, inflow, or SR to
pretty the trail.

The locked exhibit is the **live** path.

---

## 10. Lower-inflow interaction

Both operands are fully on in this layer (`G_in(0) = 1` because
inflow plateau is `y ≤ 1500 m`; `G_ng(100) ≈ 0.98`).
Superposition is the live question (`16` §8, `21` §21).

Along NG1’s live path:

```text
mean v_r relative to ng axis (3000, 4000):

  NearGroundRadialOutflowField    +7.95 m/s
  LowerRadialInflowField          −2.13 m/s
  SR advection                    +0.43 m/s
  rotation                        +0.07 m/s
  total                           +6.32 m/s

  chimney-relative total v_r      +2.63 m/s

  t(NG v_r > 0)                   275.7 s  (entire life)
  t(total v_r,ng > 0)             208.5 s
  t(NG leads vs |SR| and |in|)    275.7 s
```

Net motion relative to **B** is outward. Inflow opposes and
loses. This is not an artificial cancellation ring: the two
Gaussians have different centres (`16` §8.2). NG1 is not on the
inner segment where ng’s west side reinforces chimney inflow.

Do not read chimney-relative `+2.63 m/s` as “also an upper-style
outflow from the origin.” It is the geometric leftover of an
offset patch. The teaching radial coordinate is distance to B.

West / SW seeds were rejected in part because their
chimney-relative `v_r` is strongly **negative** while
ng-relative `v_r` is positive. That pair is easy to sell as
“outflow that feeds the storm.” NG1 does not do that.

---

## 11. Pedagogy mode

Current production:

```text
TracerPedagogy.DiagnosticProbes              // default composition API; no trails
TracerPedagogy.StoryPathlines                // explicit; S1+S2; trails on
TracerPedagogy.DownwardPathline              // explicit; D1; trails on; keepInactiveGlyphs
TracerPedagogy.NearGroundOutflowPathline     // live App; NG1; trails on; keepInactiveGlyphs false
```

No `Both` (`08` §5, `12` §8–§9, `13` §2.4).

### 11.1 Options

| Option | Meaning | Verdict |
| --- | --- | --- |
| **A. New mode** `TracerPedagogy.NearGroundOutflowPathline` | Own seed array, trails on, inactive glyphs hidden | **Canonical** |
| B. `NearGroundOutflow` | Names the field / physical object | **Rejected.** Parallel to `12` rejecting `DowndraftPathline`: the mode is an exhibit, not the operand. |
| C. Extend `DownwardPathline` or `StoryPathlines` | Concatenate arrays | **Rejected** (`§12`) |
| D. `ColdPool` / `SurfaceOutflow` / `Both` | Forbidden claims or combined scene | **Rejected** |

Canonical name: **`NearGroundOutflowPathline`** (singular).
Parallel to `DownwardPathline`. One seed. Do not add `ColdPool`.
Do not add `SurfaceOutflow`. Do not add `Both`.

Rejected names:

| Name | Why not |
| --- | --- |
| `NearGroundOutflow` | Sounds like the field type. |
| `ColdPool` / `ColdPoolPathline` | Thermodynamic claim (`13`, `21`). |
| `SurfaceOutflow` | Terrain / collision / sheet at `y = 0` (`21` §6). |
| `GustFront` | Material front. Forbidden. |
| `OutflowPathlines` (plural) | Implies a fan. |
| `Both` / `DownwardThenOutflow` | `§12`. |

Composition mapping, same pattern as `14` §8 / `12` §8:

```text
NearGroundOutflowPathline
  → DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds
  → trailEnabled = true
  → keepInactiveGlyphs = false
```

The recorder still does not import the enum.
`createTracersFromSeeds` stays role-agnostic.

DiagnosticProbes remains trails-off and does not gain NG1.
StoryPathlines remains S1/S2 only.
DownwardPathline remains D1 only.

UI toggle remains later (`09` §6, `13` §12). A composition
constant is enough.

**Live App is `NearGroundOutflowPathline` (slice 2).**
DiagnosticProbes, StoryPathlines, and DownwardPathline remain
explicit composition options. Presence of the seventh operand in
the always-on composite was already live (`16`);
presence ≠ exhibit.

---

## 12. Separation from D1 and from S1/S2

**Mandatory. Isolation is not optional.**

```text
StoryPathlines                 = S1 / S2 only
DownwardPathline               = D1 only
NearGroundOutflowPathline      = NG1 only
```

### 12.1 Simultaneous with D1: **no**

Hard requirement of this SoT, of `12` §16, and of `13` §10.

```text
D1 descends  →  terminal glyph on y = 0
nearby outward pathline from NG1
```

is the surface analog of `Both`. Motion writes “air hit the
ground and spread.” The locked occupant is 5.6 km from D1
landing; NG1’s end is still 4.7 km from that landing; isolated
`v_r` on the live D1 path is 0.06 m/s (`16` §10). Independence
of *placement* makes a **false** coupling cheaper to imply, not
legal. Copy cannot unsay it.

Do **not** add `TracerPedagogy.DownwardThenOutflow`.
Do **not** concatenate `downwardPathlineSeeds` and
`nearGroundOutflowPathlineSeeds` at runtime.

### 12.2 Simultaneous with S1/S2: **no**

S1 starts at `(0, 1000, 4000)`: same southing as the ng axis,
3 km west, 900 m above. `G(1000) = 0`, so S1 does not sample
this occupant and still letter-passes (`16` §9). Combined
*picture*:

```text
one pathline rises 7 km through the chimney
one pathline spreads at y ≈ 100 m in the SE of the same pad
```

is a false full-circulation / “inflow went up, outflow spread
below” story. Height bands are disjoint. Horizontal regions are
adjacent enough for the cartoon. `10` already made
same-air-mass circulation RED. Mode split is how that anti-claim
stays visually enforceable.

S2 is worse: its seed `(0, 1000, 6000)` is already a south
glyph. Pairing it with NG1 `(3000, 100, 4750)` draws two south
markers at different heights. Not installed together.

DiagnosticProbes cannot replace this mode: axis / east / north
live at `y = 1000 m`, where `G_ng = 0`.

Each pedagogy mode remains isolated. That is the same policy as
`08` / `12` / `13`, now with four arrays, still no generic
group framework.

---

## 13. Trails

Required. The outward story is history. A moving glyph without a
polyline is a wander, not a pathline.

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

Checked against NG1:

| Contract | Status |
| --- | --- |
| Line shows the east-bent outward path | ~2760 points at Euler 0.1 |
| Terminal sample, if any, is the interpolated `(x, 0, z)` | Same recorder contract as D1 |
| No points after deactivation | Recorder contract |
| Reset clears trail and restores NG1, `active = true` | Same orchestration |
| Not a streamtube | One polyline, one glyph; no radius |

Do not add distance-based sampling, fade, or a second trail
style for “spreading.” Do not change the recorder.

Memory: ~276 s / 0.1 s ≈ 2760 points. Between D1’s ~1200 and
S1/S2’s ~4000.

---

## 14. Terminal glyph and ground behavior

NG1 **does** reach `y = 0`, at `t = 275.7 s`, end
`(5400, 0, 3330)`.

That exit is **not** the teaching climax and **not** outflow
physics. It is the sixth operand’s vertical tail plus
`AtmosphericTracerDomain`, the same floor policy D1 uses for a
different exhibit (`11`, `12` §15). Isolated NG never grounds.

| | Policy | Pedagogy | Verdict |
| --- | --- | --- | --- |
| **A** | Hide glyph after inactive | Trail ends on the plane; no resting sphere | **Canonical for this mode** |
| B | Keep terminal glyph visible | Copies D1’s deposition reading onto a spreading path | Rejected here |
| C | Splash / ring / fade | Invents surface physics | Rejected |

Canonical: **A.** `keepInactiveGlyphs = false`.

D1 keeps the sphere because the ground hit *is* that exhibit.
NG1’s exhibit is the outward trail. A second sphere sitting on
the grid — off the pad, east of the downdraft easting — would
read as a footprint. Hiding the mesh leaves the polyline, which
is the pathline.

If a later spare (N1) is ever installed and also grounds, the
same policy applies. Do not special-case `y = 0` inside
`TracerScene`.

Do not change `AtmosphericTracerDomain`. A seed that died in
0.1 s would have been a reason to pick another IC; NG1 lives
276 s. The floor is not the problem.

---

## 15. Camera / grid

Audit only. Pose **not** changed.

```text
camera     (12000, 6000, 12000) → (0, 4000, 0)
FOV        50°   (half vFOV = 25°)
grid       10000 m / 10     pad ±5000 m
```

| Point | World m | `θ` | vFOV | pad |
| --- | --- | --- | --- | --- |
| NG1 seed | `(3000, 100, 4750)` | 21.1° | IN | in (`z = 4750`) |
| NG1 `t = 200 s` | `(4541, 85, 3966)` | 21.7° | IN | in |
| NG1 end | `(5400, 0, 3330)` | 23.3° | IN | **x out by 400 m** |
| occupant axis `y = 0` | `(3000, 0, 4000)` | 20.0° | IN | in |
| D1 landing (not this mode) | `(4726, 0, −1317)` | ~21.7° | IN | in |

The trail remains in the default frustum for the whole life
(sampled `θ` 21.1°–23.3°; 0 samples off-vFOV). Significant
radial displacement is visible. The ground plane still gives
scale for the first ~200 s while the path is on the pad.

The last ~50 s leave the ruled square to the east. That is the
same pad-tightness class `16` §13 already declined to treat as a
blocker, and the same class as live S2’s seed (`z = 6000`).
A later rendering sibling **may** widen the pad; it is not
required for honesty, and it is not this SoT.

No separate near-ground view. No follow camera.

---

## 16. Story claim

Allowed, and no broader:

```text
prescribed storm-relative near-ground pathline advected
through a divergent horizontal outflow region
```

Natural wording of the same fact. Not a wider physical claim.

Also allowed as a short label: **near-ground outflow pathline.**

Forbidden in UI copy, panel titles, comments, and docs that ship
with this exhibit:

- cold-pool spreading;
- gust-front flow;
- density current;
- precipitation-cooled air;
- air spreading after D1 impact;
- the same air that descended;
- surface response / deposition / skating on the ground;
- mass spreading / mass conservation;
- RFD / FFD;
- compensating the chimney or closing `∇ · V`;
- “the air that went up came out here.”

Panel subtitle names the frame and the sequence (near-ground
start → outward path relative to this occupant’s axis), not a
supercell flank. Live copy uses the allowed claim above.

---

## 17. Numerical robustness

NG1, live composite, atmospheric floor:

| Integrator | `dt` s | `t` s | `Δr` m | end `(x, y, z)` m |
| --- | --- | --- | --- | --- |
| Euler | 0.1 | 275.70 | 1742.3 | `(5400.4, 0, 3329.7)` |
| Euler | 0.02 | 275.60 | 1741.6 | `(5399.9, 0, 3330.2)` |
| Euler | 0.01 | 275.58 | 1741.5 | `(5399.8, 0, 3330.2)` |
| RK2 | 0.1 | 275.60 | 1741.4 | `(5399.7, 0, 3330.3)` |
| RK2 | 0.02 | 275.56 | 1741.4 | `(5399.7, 0, 3330.3)` |

`min y = 0` exactly when it grounds (domain interpolation).
End moves `< 1 m`. Time agrees to `0.1 s`. `t(dr/dt > 0)` is
208.5–208.6 s in all five.

This is **not** an Euler artifact. Do **not** switch the live
integrator or shrink `dt` in the implementation slice. Euler
`0.1` remains the laboratory step.

Forbidden oracle: `r(t) = r0 exp(+A t)` (`21` §26). Composite
`v_r` is not isolated `A r E G`, and `y` is not frozen.

---

## 18. Config ownership

Current (`01`, `08`, `12`):

```text
simulation.diagnosticSeeds         // probes
simulation.storySeeds              // S1/S2
simulation.downwardPathlineSeeds   // D1
role = which array, not a tag
```

NG1 does **not** belong in any of those three. Mixing it into
`downwardPathlineSeeds` would show D1+NG1 the moment
DownwardPathline is selected. Mixing it into `storySeeds` would
show S1/S2+NG1. Both are `§12`.

Rejected:

| Option | Why not |
| --- | --- |
| Append NG1 to `downwardPathlineSeeds` | D1+outflow by accident |
| Append NG1 to `storySeeds` | False circulation |
| Append NG1 to `diagnosticSeeds` | Wrong height, wrong job; trails-off |
| Per-seed `{ role: "ng-outflow" }` tags | `08` already rejected tags |
| Generic `pedagogicalGroups[]` | Speculative framework |
| Fixture file outside `ScenarioConfig` | Second parameter source |

Canonical, implemented:

```text
simulation.nearGroundOutflowPathlineSeeds: ScenarioTracerSeed[]
```

DEMO contents:

```text
NG1  (3000, 100, 4750)
```

Empty array remains legal. DEMO populates one seed. Role is
**which array**.

Do not add `nearGroundOutflowSeeds` as a second name. One field.
`nearGroundOutflowPathlineSeeds` matches
`NearGroundOutflowPathline` and does not reuse “story” or
“downward.”

---

## 19. Tests / implementation contract

When commanded, test the **exhibit contract**, not the full
research grid.

Required:

- NG1 is the sole DEMO occupant of
  `nearGroundOutflowPathlineSeeds`;
- `demoSeedsForPedagogy(NearGroundOutflowPathline)` returns that
  array, not `downwardPathlineSeeds` or `storySeeds`;
- trails on; DiagnosticProbes still trails-off;
- `keepInactiveGlyphs` false for this mode; still true only for
  DownwardPathline;
- live Euler `0.1`, atmospheric domain: NG1 increases `r` from B
  by O(1 km) and remains in `y < 800 m` for O(100 s); if it
  deactivates, `y = 0` exactly (loose tolerance on the research
  digits `(5400, 3330)` / `276 s`; do not freeze them as
  physics);
- already-inactive steps do not append trail points;
- Reset restores NG1 and `active = true`, trail length 1;
- DownwardPathline regression: D1 still grounds near 119 s;
- StoryPathlines regression: S1/S2 still do not deactivate and
  still do not sample this occupant (`G(1000) = 0`);
- Euler `0.01` (or RK2 `0.1`) still shows the same qualitative
  outward path — not a live switch;
- no `Both`, no `ColdPool`, no concatenated arrays.

Do not require 23/25 neighbourhood in production tests. That
fact lives here.

Do not screenshot the trail.

---

## 20. Implementation slices

When commanded, and not before:

1. **Config + mode, not live.** **Done.**
   `nearGroundOutflowPathlineSeeds` on `ScenarioConfig` /
   `DEMO_SCENARIO`; `TracerPedagogy.NearGroundOutflowPathline`;
   composition maps seeds + trails on + `keepInactiveGlyphs`
   false; tests in `§19`. Live App stays DownwardPathline.

2. **Live switch.** **Done.**
   `LIVE_DEMO_TRACER_PEDAGOGY = NearGroundOutflowPathline`.
   DiagnosticProbes, StoryPathlines, and DownwardPathline remain
   explicit composition options.

No renderer primitive work is required for honesty. No new trail
sampler. No camera / grid change. No occupant retune.

Do **not** start: cold pool, gust front, RFD/FFD, D1 coupling,
combined-mode, thermodynamics, continuity solver, UI toggle,
domain change, camera polish, pad widen.

---

## 21. Stale-assumption pointers

This SoT does not mass-edit predecessors. Read them through A
plus isolation:

| Document | After this SoT |
| --- | --- |
| `21` | Primitive unchanged. Pedagogy seeds / live mode still the deferred item this document now specifies. |
| `16` | Occupant numbers unchanged. `y = 100` research height is the canonical **NG1** (south `r = 0.5σ`), not the axis IC. Live App is NearGroundOutflowPathline after slice 2. |
| `12` | D1 unchanged. Isolation from D1 is now a second concrete mode pair, not only S1/S2. DownwardPathline remains explicit. |
| `12` | D1 unchanged. Isolation from D1 is now a second concrete mode pair, not only S1/S2. |
| `13` | Combined D1+outflow scene remains forbidden; this document is the dedicated pedagogy SoT that `13` §10 deferred. |
| `08` | S1/S2 unchanged. `storySeeds` still means the upward sequence only. |
| `14` rendering | Trails architecture unchanged. Fourth pedagogy value is composition, not a recorder change. |
| `11` | Crossing policy unchanged. NG1 may consume it; that is not outflow. |
| `10` | Residual stays YELLOW. NG1 must not be sold as mass spreading or as D1’s return. |
| `01` | Fourth seed array implemented; live App is NearGroundOutflowPathline. |

---

## 22. Compact lock-in

```text
verdict:                 A
                         clean robust near-ground outflow exhibit exists
                         renderer sufficient
                         not B, not C, not D

canonical seed:          NG1 = (3000, 100, 4750)
                         r0/σ_ng = 0.50, azimuth 90° south of B,
                         y0 = 100 m
how many:                one
                         spare N1 (2500, 100, 4500) recorded, not installed
basin:                   interior
                         3×3 Δ=150 m → 9/9
                         5×5 Δ=300 m → 23/25
                         Δy ±50 m → 5/5
                         chimney-side graze ~300 m west-south
                         axis / north / east rejected

pedagogy:                TracerPedagogy.NearGroundOutflowPathline
config array:            nearGroundOutflowPathlineSeeds
                         not diagnosticSeeds / storySeeds /
                         downwardPathlineSeeds; not tags

trails:                  existing recorder; stride 1; full history
terminal glyph:          hide when inactive
ground:                  incidental domain exit at 276 s,
                         y = 0 interpolated; not the climax;
                         domain unchanged

simultaneous with D1:    no
simultaneous with S1/S2: no
                         no Both; no concatenated arrays

lower inflow:            opposes (mean v_r,ng −2.13);
                         NG leads (+7.95); total +6.32
                         chimney-relative v_r +2.63
                         noNG Δr = 417 m  (fails threshold)

camera/grid:             11/13 sufficient; trail in vFOV;
                         end x off pad 400 m (not blocking)

numerical:               Euler 0.1 ≈ Euler 0.01 ≈ RK2 0.1
                         (Δt ~ 0.1 s, Δend < 1 m)
                         not an Euler artifact
                         live integrator unchanged

allowed claim:           prescribed storm-relative near-ground
                         pathline advected through a divergent
                         horizontal outflow region
forbidden:               cold pool, gust front, density current,
                         D1 continuation / same air, mass spreading,
                         RFD/FFD, surface response, closed cell

occupant:                unchanged from 16
live App:                NearGroundOutflowPathline (NG1)
implementation:          1. config + mode, not live — **done**
                         2. live switch — **done**
                         no renderer / domain / occupant work
```

---

## 23. STOP

Slices 1–2 are implemented.
Live App is `NearGroundOutflowPathline` (NG1).
DiagnosticProbes, StoryPathlines, and DownwardPathline remain
explicit. Occupant numbers unchanged.
STOP.
No cold pool, gust front, RFD/FFD, D1 coupling,
combined-mode, thermodynamics, solver, UI, occupant retune, domain
change, or camera polish.

Next work starts only when commanded.
