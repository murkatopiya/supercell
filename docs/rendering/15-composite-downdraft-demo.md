# Composite Downdraft Demo

**Status:** live DEMO occupant/wiring SoT. Sixth operand is in
`DEMO_SCENARIO.storm.downdraft`, `createDowndraftField`, and both
integration-frame composites. The live stack is now seven operands;
the seventh (near-ground outflow) occupant is
`docs/rendering/16-composite-near-ground-outflow-demo.md`.
Live pedagogy is NearGroundOutflowPathline (NG1; `14`).
DownwardPathline (D1) remains explicit (`12`).
S1/S2 remain StoryPathlines occupants (`08`). Camera, grid,
glyphs, and trail visuals are unchanged.

Physics of the primitive:
`docs/physics/20-vertical-downdraft-envelope.md`.

Continuity anti-claims of the laboratory sum:
`docs/architecture/10-composite-continuity-mass-budget-audit.md`.

Ground / tracer-floor policy:
`docs/architecture/11-ground-atmospheric-domain-policy.md`.

Live story seeds and letter-pass:
`docs/architecture/08-story-seeds.md`.

Live view fixture:
`docs/rendering/11-deep-storm-tracer-view.md`,
`docs/rendering/13-deep-chimney-rendering-scaling.md`.

---

## 1. Purpose

This document chooses **one canonical DEMO occupant** for
`VerticalEnvelopeDowndraftField` as a sixth independent prescribed
operand in the existing StormRelativeLaboratory.

It answers:

    Where, how wide, how tall, and how strong should the first
    prescribed downdraft sit in the live DEMO, so that it is a
    real downward/ground-capable mechanism without destroying
    S1/S2, without becoming a continuity closure, and without
    being named RFD/FFD or cold pool?

It is **not**:

- continuity closure or a return branch of S1/S2;
- RFD or FFD;
- a cold pool, gust front, or near-ground divergent outflow;
- a retune of the other four storm operands;
- a seed rewrite;
- a renderer / camera / trail rewrite;
- a solver, pressure, buoyancy, or precipitation model.

The live App uses this occupant in the six-operand sum. This
document owns the DEMO numbers. It does not add downward seeds.

---

## 2. Verdict

**Offset east occupant. Independent `σ_down`. Negative lower lid.
`D0` not equal to `W0`. S1/S2 kept. Ground exhibit is a separate
research neighbourhood, not the story pair.**

```text
center               (5000, 0) m          // east of updraft (0,0)
offset from updraft  +5000 m east
                     1.25 σ_up
                     2.5  σ_down
sigma_down           2000 m               // not the shared 4000 m
baseHeight           −400 m
topHeight            3600 m
H                    4000 m
y_mid                1600 m
D0                   20 m/s               // peakDownwardVelocity > 0
F(0)                 0.309
Vy_axis(0)           −6.18 m/s            // isolated; y = 0 is interior
```

Not concentric. Not south (story corridor). Not west (RFD azimuth
of this `C`). Not a new formula family.

Not a blocking modeling issue: one candidate preserves the live
story **and** has a stable downward/ground basin.

---

## 3. Method

Research only. Temporary scripts. Not tests. Not production.

```text
frame            StormRelativeLaboratory
integrator       Euler, dt = 0.1 s  (live)
duration         800 s
tracer domain    AtmosphericTracerDomain   // y = 0 floor
base stack       live five operands from composeDemoTracerFields
candidate        + VerticalEnvelopeDowndraftField(params)
live seeds       S1 / S2 unchanged; never rewritten
research ICs     separate grid around the downdraft axis
```

Live five-operand baseline (this run, matches `08`):

| | S1 | S2 |
| --- | --- | --- |
| IC | `(0, 1000, 4000)` | `(0, 1000, 6000)` |
| max y | 7044 m | 7000 m |
| min r | 917 m | 1621 m |
| deep entry / occupancy | 129 s / 146 s | 176 s / 146 s |
| outflow entry | 200 s | 251 s |
| ground | none | none |
| `04` story | yes | yes |

Story letter-pass here is the same operational reading as `08`:
start in the lower layer, occupy the deep updraft (`y ≥ 3000 m`
inside `r < σ_up`) for O(100 s), enter upper outflow (`y ≥ 5000 m`),
remain active. Ground reachability is **not** a story requirement.

Research grid around a candidate axis: `r / σ_down ∈ {0, 0.5, 1.0, 1.5}`
and azimuths east / south / west / north (`0° = +X`). Two start
heights: `y = 1000 m` (same as S1/S2) and `y = y_mid`. Neighbourhood
stability: 3×3 at `Δ = ±200 m`. Timestep check: Euler `0.1` vs
`0.02` / `0.01` on representative cases.

Storm-relative environment of this DEMO, for placement (not a
reason to name flanks):

```text
C                  = (10, 0) eastward
V_sr(1000 m)       ≈ (−5, +15)  eastward, northward
                   → world (Vx, Vz) ≈ (−5, −15)
dominant low-level SR advection: northward, slight west
S1/S2 approach:    south of the origin, then lower inflow → core
```

Peak speeds already in the live stack, for `D0` comparison:

```text
W0                         30 m/s
|V_sr|(1000 m)             15.8 m/s
|V_sr|(2000 m)             25 m/s
rotation peak (Ω σ / √e)   12.1 m/s
outflow peak               6.1 m/s
inflow peak                3.0 m/s
```

---

## 4. Horizontal placement

`20` already made the primitive’s axis independent (`centerX`,
`centerZ`). Concentric vs offset is a DEMO fixture, not a physics
law. Offset is **not** a different type. Do not name the occupant
RFD or FFD because of azimuth (`20` §5, this document §12).

### 4.1 A — concentric `(0, 0)`

Control. Same axis as updraft / rotation / inflow / outflow.

On the updraft axis the vertical operands add:

```text
Vy_net(0, y, 0) = Vy_up(y) + Vy_down(y)
```

With `σ_down = σ_up = 4000 m`, `D0 = 20`, bounds `[0, 4000]`:

```text
Vy_net(y=500)   = −1.80 m/s
Vy_net(y=1000)  = −2.66 m/s
Vy_net(y=1600)  = −1.39 m/s
Vy_net(y=2500)  = +6.47 m/s
```

The lower chimney is a **direct vertical competition**. S1/S2:

| | S1 | S2 |
| --- | --- | --- |
| max y | 1000 m | 1000 m |
| min y | 75 m | 87 m |
| story | no | no |
| ground | no (`F(0) = 0`) | no |

They never enter the deep updraft. They also never cross `y = 0`,
because the lower lid is the floor (`§6`). Concentric + shared `σ`
is therefore both a destroyed story **and** a non-exhibit for
ground.

Narrower concentric `σ_down = 2000 m`, same `[0, 4000]`, `D0 = 20`:
S2 still letters (max y 6548 m, delayed); S1 peaks at 4642 m and
does not enter outflow. Axis research ICs at `y_mid` are **lifted**
by the surviving updraft (`end y ≈ 5900 m`). Still not a downward
exhibit.

Concentric with `baseHeight = −400 m` so that `Vy(0) ≠ 0`:
S1 **hits the ground** at `t = 480 s`, `(−96, 0, −2319)`. S2 still
letters. That is a story intercept, not a second independent
occupant.

**Reject A.** It is the control that shows why an independent axis
is required: same-axis `Vy_up + Vy_down` is not a sixth mechanism,
it is an argument with the chimney. It also invites the forbidden
continuity reading “updraft plus downdraft on one column.”

### 4.2 B — offset, independent `(centerX, centerZ)`

Fixed probe for direction (`σ = 2000 m`, `D0 = 20`,
`[−400, 3600]`), offset `6000 m = 1.5 σ_up = 3 σ_down`:

| Center | S1/S2 story | S1 max y | Notes |
| --- | --- | --- | --- |
| east `(6000, 0)` | both yes | 7040 / 6996 | corridor untouched |
| west `(−6000, 0)` | both yes | 7043 / 6999 | corridor untouched |
| north `(0, −6000)` | both yes | 7043 / 7000 | corridor untouched |
| south `(0, 6000)` | S2 **no** | 6974 / S2 ground at 112 s | S2 seed **is** the axis |

South is the live story basin (`08`). S2 starts at `(0, 1000, 6000)`.
A south occupant is not an independent sixth mechanism; it is an
ambush of the existing exhibit. **Reject south** for that reason,
not because it “looks like FFD.”

West, given `C = (10, 0)` eastward, is the rear-flank azimuth of
this storm-motion vector. Numbers work (S1/S2 intact; `y = 1000`
axis hits ground). **Do not choose west as the canonical occupant.**
The reason is pedagogical, not numerical: a west offset would be
read as RFD even with anti-claims in the docs. `20` forbids baking
that name into placement.

North is downstream of the dominant low-level `V_sr` (northward).
S1/S2 are untouched. The downward basin is actually **more** robust
at mid-envelope than east, because SR blows parcels **away** from
the updraft. Ground intersections, however, run to
`z ≈ −5700 … −7500 m` and beyond — off the `11`/`13` `10 km` pad
(`§8`). North is a valid independent occupant. It is not the
canonical one, because the locked ground exhibit would sit outside
the current metric grid.

East is orthogonal to the south story approach. It is also
cross-stream relative to the dominant northward `V_sr`. That is
why some **mid-envelope** ICs leak north out of the Gaussian
before reaching the floor, and why the locked exhibit is a
**lower-level** neighbourhood (`§5`). East is **not** chosen
because it looks like FFD. Forward-flank naming is as forbidden
as rear-flank naming. East is chosen because:

1. it does not sit on S1/S2;
2. the representative ground hit stays on the existing pad;
3. it is not the RFD azimuth of this `C`.

Closer vs farther east, same envelope / `D0` / `σ_down = 2000 m`:

| Center | `r / σ_up` | S1 max y / min r | `y=1000` axis ground | 3×3 `Δ=200 m` | center vs grid `±5000` |
| --- | --- | --- | --- | --- | --- |
| `(4000, 0)` | 1.00 | 6998 / 829 | `(3653, −1469)` at 135 s | 9/9 | in |
| `(5000, 0)` | 1.25 | 7029 / 888 | `(4723, −1308)` at 119 s | 9/9 | **on east edge** |
| `(6000, 0)` | 1.50 | 7040 / 909 | `(5805, −1167)` at 108 s | 9/9 | **out** |

`(4000, 0)` dents S1 more (`min r` 917 → 829; max y −46 m) and
loses the `y_mid` axis to northward leak. `(6000, 0)` is the
cleanest S1/S2 match but puts both the axis and the representative
ground hit east of the grid. **`(5000, 0)`** is the compromise:
S1/S2 within a few tens of metres of `08`, axis on the pad edge,
representative ground hit **inside** the pad.

### 4.3 C — other controlled placement

ENE `(5000, −3000)` and `(3500, −2000)` were measured. They mix
east’s updraft-side leak with north’s off-pad advection. No
architectural problem that A/B missed, and no pedagogical gain.

No third geometry (line, annulus, tilted axis) is introduced.

---

## 5. `sigma_down`

Do **not** inherit the shared DEMO `σ = 4000 m`. That shared value
is a chimney-retune fixture (`06`), not a law that every new
operand must copy (`20`, `10`).

| `σ_down` | east `(6000, 0)`, `D0 = 20`, `[−400, 3600]` | Result |
| --- | --- | --- |
| 1500 m | `y_mid` axis does **not** reach ground (min y 645 m, then lost) | too narrow vs SR advection |
| 2000 m | `y=1000` axis hits; 3×3 at 1000 m is 9/9; S1/S2 almost live | lock-in |
| 2500 m | more hits; S1 max y 7024, min r 869 | still story-pass, more overlap |
| 4000 m | concentric control in §4.1; not re-used as offset default | would be a mesoscale half-column on this pad |

On the updraft axis, `E_down(r = 5000 m)` for `σ_down = 2000 m`
is `exp(−r²/(2σ²))` with `r²/(2σ²) = 3.125`, so `E ≈ 0.044`.
Isolated `Vy_down` on the chimney axis at `y = 1000 m` is then
`−D0 E F(1000) ≈ −0.78 m/s` against `Vy_up ≈ 11.5 m/s`. The
chimney is not cancelled. Far-field overlap is a tail, not a
second core on `(0, y, 0)`.

`σ_down = 2000 m = 0.5 σ_up`. Independent. The other four storm
operands keep `σ = 4000 m`. No retune.

---

## 6. Vertical bounds

Half-sine (`20` candidate A):

```text
F(y) = sin(π (y − baseHeight) / H)    on [baseHeight, topHeight]
F    = 0                               elsewhere
```

### 6.1 `baseHeight = 0` does not give a ground exhibit

If `baseHeight = 0`, then `y = 0` is the lower lid, `F(0) = 0`,
`Vy_down(0) = 0`. Isolated continuous trajectories **never** reach
the lid in finite time (`20` §19.3). Euler with the live `dt`
does not invent a crossing either: near the floor
`|Vy| ≈ D0 E π y / H`, so

```text
y_{n+1} = y_n (1 − D0 E π dt / H)
```

Crossing would require `D0 E π dt / H > 1`, i.e.
`D0 ≳ H / (π dt) ≈ 1.3×10⁴ m/s` on the axis. That is not a DEMO
knob.

Measured, offset east `(6000, 0)`, `[0, 4000]`, `D0 = 20`:
research grid **0/13** hits at both `y = 1000` and `y = 2000`.
Axis `y = 1000`: min y 139 m after 800 s, still active.
Euler `dt = 0.01` does not change that. This is the envelope lid,
not integrator luck.

`11` does **not** require `Vy(0) = 0`. Using `baseHeight = 0`
because “the ground is the lid” would smuggle domain policy into
the primitive. **Reject `[0, topHeight]` for a ground-reaching
DEMO occupant.**

### 6.2 `baseHeight < 0` so that `y = 0` is interior

Then `F(0) > 0` and `Vy_down(0) ≠ 0`. Atmospheric tracers still
stop at `y = 0` because of `AtmosphericTracerDomain`, not because
the envelope ended. The envelope is **not** a substitute ground
collision (`11`, `20`).

| Bounds | `H` | `F(0)` | isolated `Vy_axis(0)` | east-5 `y=1000` axis |
| --- | --- | --- | --- | --- |
| `[−400, 3600]` | 4000 m | 0.309 | −6.18 m/s | ground at 119 s |
| `[−200, 3000]` | 3200 m | 0.195 | −3.90 m/s | ground at 137 s |

Both work. `[−400, 3600]` is the lock-in:

- `H = 4000 m` is a round laboratory thickness, not a copy of
  `σ_up`;
- `y_mid = 1600 m` sits in the lower-inflow window, not in the
  outflow `[5000, 9000]`;
- `F(0)` is clearly nonzero, so crossing is not a hairline Euler
  event;
- `topHeight = 3600 m` stays below outflow and below updraft mid
  `4000 m`.

A deeper underground lid is unnecessary. `baseHeight = −400 m`
is a bound choice so that the floor is an interior sample, not a
claim that the field exists as terrain.

---

## 7. `D0`

`peakDownwardVelocity = D0 > 0`. Actual `Vy = −D0 E_r F`.

There is no requirement `D0 = W0`. There is no continuity equation
tying `D0` to `A_in` / `A_out` / `W0` (`10`, `20`).

| `D0` | vs `W0 = 30` | east `(6000, 0)`, `σ = 2000`, `[−400, 3600]` |
| --- | --- | --- |
| 15 m/s | 0.50 | `y=1000` axis hits; `y_mid` axis **misses** |
| 20 m/s | 0.67 | `y=1000` basin robust; S1/S2 intact |
| 25 m/s | 0.83 | faster hits; S1/S2 still intact; stronger than needed |

`D0 = 20 m/s` is:

- weaker than the chimney peak, so it is not a second equal column;
- comparable to mid-level `|V_sr|` (16–25 m/s);
- larger than every live **horizontal** storm peak (rotation 12,
  outflow 6, inflow 3), so a tracer that stays in the core can
  actually descend against the residual updraft tail at
  `r = 5000 m`.

Not tuned to shrink `∇ · V`.

Isolated peak on the occupant axis at `y_mid` is `−20 m/s`.
Composite net there is smaller because of the updraft tail
(`E_up(5000 m) ≈ 0.458`, `F_up(1600 m) ≈ 0.588`,
`Vy_up ≈ 8.1 m/s` → net `≈ −11.9 m/s`). That leftover updraft is
accepted. Cancelling it by raising `D0` would be a concentric
instinct applied off-axis.

---

## 8. Ground-reachability audit

Canonical occupant as in §2. Live S1/S2 are **not** the ICs of
this audit.

### 8.1 Representative research IC

```text
IC                 (5000, 1000, 0)     // downdraft axis, story height
Euler dt = 0.1     ground at t = 118.9 s
landing            (4723, 0, −1308) m
r from updraft     4901 m
r from down axis   1337 m
```

Same IC, smaller `dt`:

| dt | t_ground | landing `(x, z)` |
| --- | --- | --- |
| 0.1 s | 118.90 s | `(4723.5, −1308.4)` |
| 0.02 s | 118.94 s | `(4723.8, −1308.1)` |
| 0.01 s | 118.93 s | `(4723.8, −1308.0)` |

Not a timestep artifact.

### 8.2 Neighbourhood, not a lucky trajectory

`y = 1000 m`, 3×3 at `Δx, Δz ∈ {−200, 0, +200} m`: **9/9** hit
ground. Times 111–134 s. Landings stay in a compact patch
`x ≈ 4480–4950 m`, `z ≈ −1040 … −1630 m` (all on the `±5000 m`
pad).

Research grid `y = 1000 m` (13 ICs): **8/13** hit. Misses are the
far west/north/`1.5σ` east side — parcels that SR + residual
updraft pull out of `E_r` before `y` reaches 0. That is a finite
basin, not a single path.

### 8.3 Mid-envelope is leakier

`y = 1600 m` (`y_mid`) axis of the **canonical east-5 occupant
does not hit ground** in 800 s: northward SR carries it out
(`end ≈ (215, 1579, −13188)`). Some south-side ICs at `y_mid`
still hit. This is recorded so the occupant is not sold as
“every tracer in the column reaches the floor.”

The locked exhibit is the **lower-level** neighbourhood, at the
same height as S1/S2 and a different `(x, z)`. Mid-level leakage
is expected for an offset Gaussian sitting in a northward SR
stream. It is not a reason to move the occupant west or to raise
`D0` until the mid-axis is forced down.

### 8.4 Not a requirement on S1/S2

S1/S2 under the canonical occupant remain active, max y ≈ 7 km,
no ground hit (`§9`). Ground reachability of the sixth operand is
a property of research ICs near **its** axis.

---

## 9. S1/S2 impact

Mandatory regression. Canonical occupant added to the research
sum; live seeds untouched.

| | live five-operand | + canonical downdraft |
| --- | --- | --- |
| S1 max y | 7044 | 7029 |
| S1 min r | 917 | 888 |
| S1 deep entry / occ. | 129 / 146 | 133 / 145 |
| S1 outflow entry | 200 | 204 |
| S2 max y | 7000 | 6989 |
| S2 min r | 1621 | 1594 |
| S2 deep entry / occ. | 176 / 146 | 178 / 145 |
| S2 outflow entry | 251 | 254 |
| either ground? | no | no |
| `04` story | yes / yes | yes / yes |

The south inflow → deep updraft → upper outflow letter-pass
survives. Neither pathline is captured by the downdraft.
Neither returns downward after outflow. The visual lie “S1/S2
went up and then came down this new column” is **false** for
these seeds; docs and copy must not tell it anyway (`10`).

If a future occupant **did** destroy this exhibit, the first
response would be to move/scale the downdraft, not to retune
S1/S2. That fork was not needed.

---

## 10. Composite / continuity semantics

For this operand (`20` §14, `10` §3.2 sibling):

```text
Vx_down ≡ 0
Vz_down ≡ 0
Vy_down = −D0 E_r(r) F(y)

∇ · V_down = ∂Vy_down / ∂y
           = −D0 E_r (π / H) cos(π ξ)     open layer
           = 0                              outside / at closed lids
```

`H = 4000 m`, `D0 = 20 m/s`:

```text
|∂Vy_down/∂y|_max on axis = D0 π / H = 0.0157 s⁻¹
```

At `y = 0` (interior, `ξ = 0.1`):

```text
∇ · V_down(axis, 0) ≈ −0.0149 s⁻¹     // sink
```

At `y_mid`: `cos(π/2) = 0`, so `∇ · V_down = 0`.

Lower half of the envelope is a **vertical sink**; upper half is a
**vertical source**. That is the opposite vertical-div pattern of
the updraft. Concentric placement would therefore *look* like a
partial `∂Vy/∂y` cancellation. That is why concentric was rejected
in §4.1 as architecture, and why this offset must not be sold as
the missing mass closure of `10`.

On the **updraft** axis, `E_down(5000 m) ≈ 0.044`, so the extra
div is O(`7×10⁻⁴ s⁻¹`) — a tail, not a rebalance of the chimney
lid value `W0 π / H_up ≈ 0.0118 s⁻¹` from `10`.

The live residual in `10` is YELLOW. Adding this operand keeps it
YELLOW. A pointwise or integrated residual that happens to get
smaller is **not** a success metric and was not optimized.

**Forbidden claim:**

```text
updraft + downdraft = balanced circulation
```

Also forbidden: “this is the air that rose along S1/S2,”
“compensating subsidence,” “mass-conserving return.” Existence of
a sixth independent `∇ · V` is not RED. Those sentences are RED
(`10`).

Hodograph is unchanged: this field has no horizontal wind.

---

## 11. Renderer check

Audit only. View `11` / policy `13`:

```text
camera.position     (12000, 6000, 12000) m     // SE
target              (0, 4000, 0) m
FOV                 50°                        // half vFOV = 25°
grid                10000 m / 10               // pad ±5000 m
glyph radius        150 m
```

Angle below is the angle at the camera between the look vector and
the point. Inside the default vFOV iff `θ < 25°` (horizontal FOV
is wider; this is the stricter vertical cut).

| Point | World | `θ` | vs `±5000` pad |
| --- | --- | --- | --- |
| occupant center at `y_mid` | `(5000, 1600, 0)` | 18.0° | **on east edge** |
| representative IC | `(5000, 1000, 0)` | ~18° | on east edge |
| representative ground | `(4723, 0, −1308)` | 21.7° | **inside** |
| unmoved axis at `y = 0` | `(5000, 0, 0)` | 21.9° | on east edge |

Not blocking. The locked exhibit fits the current SE 3/4 of the
`0–10 km` laboratory cube. Camera, grid, glyphs, and trails are
**not** changed by this SoT.

Peripheral research ICs at `r = σ_down` **east** can land near
`x ≈ 6800 m` with `θ ≈ 28°` (below the default vFOV). Those ICs
are not the locked exhibit.

A later rendering sibling **may** widen the pad (e.g. 12 km) to
give margin around an east-edge occupant. That is optional polish,
not a blocker, and is not opened here.

`TracerScene` default still hides `active === false` meshes.
`keepInactiveGlyphs` is live for DownwardPathline (`12` slice 2–3);
StoryPathlines does not enable it. The trail
keeps the terminal `y = 0` sample.

---

## 12. Future cold-pool boundary

```text
ground intersection = terminal atmospheric pathline
```

The particle is interpolated onto `y = 0` and deactivated (`11`).
Horizontal velocity at that instant is **not** converted into
outflow. The tracer does not skate, spread, or become a gust
front.

v1 of this occupant has `Vx ≡ 0`, `Vz ≡ 0`. Near-ground divergent
outflow, cold pool, and gust front are a **later physics family**
and a later SoT. They are not a `baseHeight` trick, not a floor
bounce, and not a reason to add horizontal components to
`VerticalEnvelopeDowndraftField`.

Do not describe the landing patch `(4723, 0, −1308)` as a cold-pool
boundary. It is where a research pathline exited the atmospheric
domain.

---

## 13. Terminal trail

`TracerPathHistory.recordAfterStep` records a particle that was
active at the previous observation and is inactive after this
completed step, **once**. Already-inactive particles still skip.
The recorder does not know about ground, `y = 0`, or
`AtmosphericTracerDomain`; it only observes `active`.

For a domain crossing, `Simulation.step` writes the interpolated
`(x, 0, z)` and then deactivates. The next `recordAfterStep` stores
that accepted terminal position. Later steps do not duplicate it.

Inactive glyphs stay visible when `keepInactiveGlyphs` is true
(DownwardPathline; not the live App after `14` slice 2).
StoryPathlines and NearGroundOutflowPathline hide them.

---

## 14. Live seeds and pedagogy

Live App is `NearGroundOutflowPathline` = NG1 (`14`). D1 remains the
DownwardPathline occupant (`12`) and is not concatenated with NG1
or S1/S2. This occupancy SoT does **not** merge D1 into `storySeeds` or
`diagnosticSeeds`.

The sixth field is present in the sum. S1/S2 continue to teach
lower inflow → deep updraft → upper outflow when that mode is
selected. The downdraft is a real occupant that those two
pathlines almost do not sample. The downward exhibit is the live
App view. Terminal-glyph visibility is `keepInactiveGlyphs` for
DownwardPathline (`12`).

---

## 15. What this occupant is not

- the return of S1/S2;
- a continuity solver or mass-budget fix;
- RFD / FFD;
- cold pool / gust front / surface outflow;
- a signed `VerticalEnvelopeUpdraftField`;
- a ground-collision engine;
- a reason to retune `W0`, `A_in`, `A_out`, `Ω`, shared `σ`, `C`,
  envelopes, camera, or seeds.

---

## 16. Later implementation order

Occupant wiring is done. Downward pedagogy config + mode are done
(`12` slice 1). Terminal glyph observe option is done (`12` slice 2).
Live switch to DownwardPathline is done (`12` slice 3).

When commanded, and not before:

1. **STOP** before cold pool, gust front, RFD/FFD, or a solver.

---

## 17. Lock-in summary

```text
verdict:                     offset east occupant; not concentric;
                             not south; not west; not blocking
center:                      (5000, 0) m
offset from updraft:         +5000 m east
                             1.25 σ_up ; 2.5 σ_down
sigma_down:                  2000 m   (independent; not shared 4000)
baseHeight:                  −400 m
topHeight:                   3600 m
D0:                          20 m/s   (not W0; not continuity-tuned)
ground-reachability:         yes — lower-level basin around the
                             downdraft axis; representative IC
                             (5000, 1000, 0) hits y = 0 at 119 s
                             at (4723, 0, −1308); 3×3 Δ=200 m is
                             9/9; dt-stable; mid-envelope axis
                             can leak north; not a S1/S2 duty
S1/S2 impact:                story preserved; Δ max y ≈ −15 / −11 m;
                             neither intercepted; neither returns
continuity anti-claim:       ∇ · V_down = ∂Vy_down/∂y;
                             not balanced circulation;
                             residual 10 stays YELLOW
renderer status:             not blocking for the locked exhibit;
                             center on east pad edge; no view change
terminal-trail:              recordAfterStep stores became-inactive
                             once; ground-unaware; keepInactiveGlyphs
                             on TracerScene for DownwardPathline
implementation order:        occupant wiring done;
                             downwardPathlineSeeds + DownwardPathline
                             done (12 slice 1); keepInactiveGlyphs
                             done (12 slice 2); DownwardPathline was
                             live (12 slice 3); live App now
                             NearGroundOutflowPathline (14);
                             STOP before cold pool
```

---

## 18. STOP

Occupant wiring is live.
Live App is NearGroundOutflowPathline (NG1; `14`).
DownwardPathline (D1) remains explicit. Occupant numbers unchanged.
S1/S2 remain StoryPathlines occupants.
No camera / grid / glyph / trail visual change.
No cold pool, gust front, RFD/FFD, solver, or continuity retune.

STOP.
