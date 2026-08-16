# Story Tracers / Seed Strategy

**Status:** historical for the `σ = 1000 m`, `W0 = 20 m/s` fixture.
Verdict **C** below is not the live DEMO result.
Live re-audit after the `06`/`13` retune:
`docs/architecture/07-story-reachability-audit-v2.md`.

The story *threshold* in §2 is still the live criterion.
The laboratory numbers in §3 are the old fixture.

Original status: research SoT. Production code was not changed.
Live frame for all measurements: `StormRelativeLaboratory`.
Integrator: Euler, `dt = 0.1` s (then-live DEMO).
Physics / scenario numbers: frozen (`C`, `W0`, `Ω`, `A_in`, `A_out`,
`sigma`, centers, envelopes, environmental knots).

This document answers:

    With the current prescribed composite field unchanged, does any
    reasonable set of initial conditions produce a parcel path

        lower inflow → updraft core → mid/upper levels → upper outflow

    and if not, what honest seed / modeling decision follows?

It does **not** retune parameters, add mechanisms, or choose seeds
because a trajectory looked pretty.

---

## 1. Verdict

**C. The current model does not admit a full lower→upper story.**

Do **not** add story seeds.

Keep the three current seeds as **diagnostic probes**.

A modestly better lower-level *basin* exists (upstream / south of the
axis). Diagnostic seeds miss it. That basin still fails the story
threshold: best climb from `y0 ≤ 1500` is about `2.9 km`, not mid-level
and not outflow.

Reachable paths that start already in mid-levels (`y0 ≳ 3 km`) can
graze the outflow layer. That is not a lower-inflow story. It is a
mid-column intercept of a chimney that the parcel did not climb.

---

## 2. Method

Offline diagnostic sweep against the live composition:

```text
StormRelativeEnvironmentalAdvectionField(EnvironmentalWindField, C)
+ VerticalEnvelopeUpdraftField
+ VerticalEnvelopeRotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
```

Same `EulerIntegrator`, same `dt = 0.1`. No closed-form composite
oracle. Exit when horizontal radius `r > 4σ` (`4000 m`), or `t = 800 s`.

The sweep harness is **not** a production artifact. Numbers below are
the research record.

Story threshold used for classification (fixed *before* looking at
pretty paths):

A tracer is a **story tracer** for the requested lower→upper path only
if all of the following hold:

1. It **starts** in lower-inflow support: `y0 ≤ 1500 m` and in the
   inflow Gaussian (`r` of order `σ`), so the lower-inflow operand can
   actually act.
2. It **occupies the updraft core**: some interval with `r < σ` and
   `y` in the deep updraft (`≳ 3000 m`), where `Vy` is dominated by
   `VerticalEnvelopeUpdraftField`.
3. It **reaches upper-outflow support while still near the storm**:
   `y ∈ [5000, 9000]` and `r < 2σ`, with a nonzero
   `UpperRadialOutflowField` contribution.
4. Those stages occur **in order**, from one initial condition, without
   starting already in stage 2 or 3.

“Looks like it swirls” is not a criterion. `max(y)` at the `4σ` exit
radius is an exit of the storm, not completion of a cell.

---

## 3. Frozen laboratory (reminder)

| Quantity | Value |
| --- | --- |
| Frame | StormRelativeLaboratory |
| `C` | `(eastward 10, northward 0)` m/s |
| `σ` | `1000 m` (all storm operands) |
| `W0` | `20` m/s, updraft `[0, 8000]` |
| `Ω` | `0.02` rad/s, rotation `[0, 6500]` |
| `A_in` | `0.005` s⁻¹, inflow plateau `y ≤ 1500`, zero `≥ 4500` |
| `A_out` | `0.01` s⁻¹, outflow `[5000, 9000]` |
| Diagnostic seeds | `(0,1000,0)`, `(600,1000,0)`, `(0,1000,−600)` |

Peak Gaussian speeds at this `σ`:

```text
|v_r|_in  max = A_in  σ / √e ≈  3.03 m/s
|v_θ|     max = |Ω|   σ / √e ≈ 12.13 m/s
|v_r|_out max = A_out σ / √e ≈  6.07 m/s
```

---

## 4. Storm-relative free stream versus mechanisms

Horizontal storm-relative environmental wind on the live profile
(`V_sr = V_env − C`):

| `y` m | `V_sr` (east, north) | world `(Vx, Vz)` | `|V_sr|` m/s |
| --- | --- | --- | --- |
| 0 | (5, 5) | (5, −5) | 7.07 |
| 500 | (0, 10) | (0, −10) | 10.00 |
| 1000 | (−5, 15) | (−5, −15) | 15.81 |
| 1500 | (−2.5, 20) | (−2.5, −20) | 20.16 |
| 2000 | (0, 25) | (0, −25) | 25.00 |
| 4000 | (10, 22.5) | (10, −22.5) | 24.62 |
| 6000 | (20, 20) | (20, −20) | 28.28 |
| 7000 | (21.7, 18.3) | (21.7, −18.3) | 28.38 |

On-axis updraft (inflow and rotation are **zero on the axis**):

| `y` m | `F(y)` | `Vy` on axis m/s | `Vy` at `r = σ` m/s | `|v_r|_in` at `σ` |
| --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | 3.03 |
| 500 | 0.195 | 3.90 | 2.37 | 3.03 |
| 1000 | 0.383 | 7.65 | 4.64 | 3.03 |
| 1500 | 0.556 | 11.11 | 6.74 | 3.03 |
| 2000 | 0.707 | 14.14 | 8.58 | 2.93 |
| 4000 | 1 | 20.00 | 12.13 | 0.78 |
| 7000 | 0.383 | 7.65 | 4.64 | 0 (outflow `|v_r|≈6.1`) |

Everywhere in the lower chimney:

```text
|V_sr|  >  |v_r|_in max
```

At `y = 1000`, `|V_sr| / |v_r|_in max ≈ 5.2`.
Radial inflow cannot stall the free stream. It can only slightly
bend an already-crossing trajectory.

On the axis, inflow is identically zero. The “axis seed” is a pure
`V_sr + updraft` probe.

---

## 5. Timescale mismatch (why climb fails)

Isolated on-axis half-sine (no horizontal wind), `W0 = 20`, `H = 8000`:

```text
t(y1→y2) = (H / (π W0)) ln | tan(π y2 / 2H) / tan(π y1 / 2H) |

500  → 4000   295 s
1000 → 4000   206 s
1000 → 7000   411 s
500  → 7000   501 s
```

Horizontal crossing time of one `σ` at local `|V_sr|`, if inflow is
ignored:

```text
t_cross ≈ σ / |V_sr|

y =  500    100 s
y = 1000     63 s
y = 1500     50 s
y = 2000     40 s
```

Ascent time is several times the sweep time, and `|V_sr|` **increases**
with height. A parcel that starts climbing meets a faster free stream.

Measured core residence (`r < σ`) for diagnostic seeds: `30–64 s`.
That matches `σ / |V_sr|(1000) ≈ 63 s` for the axis seed.

---

## 6. Diagnostic seeds (not story tracers)

Live Euler, StormRelativeLaboratory:

| Seed | `max y` m | `t` in `r < σ` s | `t` with `Vy > 2` s | Outflow near? |
| --- | --- | --- | --- | --- |
| `(0, 1000, 0)` axis | 1786 | 64 | 117 | no |
| `(600, 1000, 0)` east | 1642 | 56 | 105 | no |
| `(0, 1000, −600)` north | 1426 | 30 | 82 | no |

None reach `4000 m`. None enter outflow support.

The north seed is the worst: at `y = 1000`, `V_sr` is northward
(world `Vz < 0`). That seed is already downstream.

These remain the correct **lower-chimney diagnostic probes**. They
answer “what does the live composite do at the old seed layer?” They
must not be relabeled as a life cycle.

---

## 7. Reachability sweep

Polar grid: `y0 ∈ {0,250,…,4000}`, `r0` up to `3000 m`, 8 azimuths,
plus a cartesian fine grid `y0 ∈ {0,200,…,1000}`, `Δx = Δz = 250 m`
(`2646` lower-level ICs).

### 7.1 Best `max y` versus start height

| `y0` m | Best `max y` m | Notes |
| --- | --- | --- |
| 0 | 0 | Updraft lid `F(0) = 0`; parcel never leaves the plane |
| 250 | 1171 | |
| 500 | 1715 | still in lower inflow layer |
| 750 | 2152 | |
| 1000 | 2556 | best lower-layer basin (fine grid) |
| 1250 | 2709 | |
| 1500 | 2924 | top of inflow plateau |
| 2000 | 3892 | still below updraft mid |
| 2500 | 4643 | first crossings of `4000` |
| 3000 | 5128 | first `r < 2σ` visits to outflow layer |
| 4000 | 5806 | mid-level intercept; starts at updraft mid |
| 5000 | 6363 | starts *in* outflow layer |

From the **entire lower inflow region** (`y0 ≤ 1500`):

```text
y ≥ 4000:     0
y ≥ 5000:     0
outflow-near: 0
```

Fine cartesian `2646` ICs with `y0 ≤ 1000`: same zeros. There is **no**
hidden lower basin that completes the requested path.

### 7.2 Seed sensitivity (lower layer)

Result depends strongly on:

- **Start height.** `F(y0)` sets the initial lift. `y0 = 0` is a hard
  zero. Higher `y0` in `[250, 1500]` climbs more, still not to mid-level.
- **Azimuth versus `V_sr`.** Best lower ICs are **upstream**.
  Below `~1500 m`, `V_sr` is mainly northward, so upstream is **south**
  (`+Z`). At `y = 1000` the fine-grid winners sit near
  `(x, z) ≈ (−500, +2500)`: south, slightly west, `r ≈ 2.5σ`.
- **Radius.** Starting *in* the core at `y = 1000` is worse than
  starting `2–3σ` upstream: the axis seed is immediately swept;
  an upstream seed is still approaching while `F(y)` grows.
- **Not** a capture orbit. Even the best lower IC has `min r ~ 100 m`
  only after it has already risen, then `max y` occurs at the `4σ`
  exit. It is a transit, not a trapped ascent.

Diagnostic seeds sit at `y = 1000` in or near the core. They miss the
south-upstream approach basin (`max y ~ 2.5 km` vs `1.8 km` on the
axis). That miss is real and **does not create a full story**.

---

## 8. Mechanism attribution

No composite closed form. Operand-by-operand:

**Environmental SR advection** sets the horizontal path. It is the
largest horizontal term at every height sampled. It is why parcels
leave.

**Lower inflow** (`|v_r| ≲ 3 m/s`) cannot cancel `7–20 m/s` of `V_sr`
in its own layer. It slightly reduces the radius of an upstream
approach. It does not create a stagnation point.

**Updraft** supplies all of `Vy`. On axis at `y = 1000`, `Vy = 7.65`
while `|V_sr| = 15.8`. Off axis, `E_r` cuts `Vy` further. The half-sine
is **zero at `y = 0`**, so the inflow plateau at the ground cannot
feed lift. That is a prescribed-envelope fact, not an integrator bug.

**Rotation** (`|v_θ|_max ≈ 12 m/s`) deflects paths azimuthally. It does
not confine radius (solid-body core + Gaussian is not a vortex
bottle). It does not produce vertical motion.

**Upper outflow** never acts on lower-started parcels: they have
already left `r < 2σ` before `y = 5000`. Mid-started parcels can
overlap the outflow layer while exiting; that overlap is a coincidence
of `y0 ≳ 3000`, not a completed lower→upper circuit.

**Continuity** is not closed (`10` / audit Y13). There is no
mass-consistent “what went up must go out here” constraint that would
drag a parcel into outflow.

---

## 9. Trajectory classes the model *does* admit

These are real. They are not the requested story.

| Class | What it is | Honest teaching use |
| --- | --- | --- |
| Diagnostic lower probes | Current three seeds | Mechanism check at `y = 1000` |
| Lower transit | Upstream `y0 ∈ [250, 1500]`, `Δy ~ 0.5–1.5 km`, then sweep-out | SR advection through a chimney; inflow too weak to capture |
| Mid-level intercept | `y0 ≳ 3000`, approach from south-west of `V_sr`, brief core, graze outflow while leaving | Only if copy says the parcel *started* in mid-levels |
| Ground lid | `y0 = 0` | `F = 0` at the updraft base; inflow without lift |

None of these should be sold as lower→upper storm-relative flow.

---

## 10. What blocks a full story (combination, ranked)

The blockage is **not** “wrong seeds.”

1. **Primary: timescale mismatch.** Isolated climb needs `~200–500 s`.
   Sweep across `σ` needs `~40–100 s`. Measured core times match the
   sweep, not the climb.
2. **Narrow chimney.** `H_up / σ = 8`. Little radial room
   (`docs/rendering/10` §13, decision A).
3. **Weak prescribed inflow versus this `C` and this profile.**
   `A_in σ / √e ≈ 3 m/s` vs `|V_sr| = 7–20 m/s` in the inflow layer.
4. **`C = (10, 0)` is the hodograph overlay identity, not a 1 km
   steering wind.** Even the *minimum* `|V_sr|` on this sounding is
   `7.07 m/s` at the ground — still more than twice peak inflow.
   Retuning `C` inside the current knots cannot make `|V_sr| < |v_r|_in`.
5. **`|V_sr|` grows with height.** Survival gets harder during ascent.
6. **Updraft base lid.** `F(0) = 0` while inflow is still full-strength.
   The lowest inflow air cannot rise.
7. **No missing operand would silently fix this** (no downdraft, no
   tilting). Those are other stories. A continuity solver is a
   different architecture (audit Y12–Y13), not a seed choice.

---

## 11. Story seeds

**Do not add any.**

Diagnostic seeds stay.

A later *labeled partial-transit* demo (upstream lower seeds, copy
restricted to “chimney crossing”) would be a separate commanded
fixture slice. It is not authorized here. It would still not be a
full story.

---

## 12. Next modeling slice (if the full path is wanted)

**Research done.** Residence:
`docs/architecture/05-chimney-residence-scale-and-strength.md`
(verdict **D**). DEMO numbers:
`docs/architecture/06-deep-chimney-scaling-demo-retune.md`
(verdict **A**). Neither SoT retunes production.

Not: seed search, follow-camera, Bunkers, downdraft, translating
storm, renderer polish inside a physics retune.

The 1 km chimney limitation is addressed as a **future** fixture
change (`σ = 4000 m`, `W0 = 30 m/s`, frozen peaks, diagnostic
`r = 0.6σ`). Story seeds remain forbidden until someone commands
them after implementation.

`C` retune alone is **not** sufficient on this hodograph.

Do not pick seeds to hide the mismatch.

---

## 13. Compact lock-in

```text
verdict:                 C — no full lower→upper story
story seeds:             none
diagnostic seeds:        keep; not a life cycle
missed lower basin:      yes (south / upstream, y~1000, max y~2.5 km);
                         still not a story
first outflow-near ICs:  y0 ≳ 3000 (already mid-level)
blocker:                 t_ascent >> t_sweep; |V_sr| >> |v_r|_in;
                         chimney σ = 1000; F(0) = 0
next slice if wanted:    06 numbers (implementation + rendering);
                         research: 05 D, 06 A
not next:                story seeds, downdraft, Bunkers, moving storm
production this slice:   none
```

Production code was not changed.
