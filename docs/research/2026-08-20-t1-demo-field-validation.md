# T1 DEMO Field Validation — 2026-08-20

**Status:** SCIENTIFIC VALIDATION / CURRENT DEMO EVIDENCE
**Not:** physics SoT, architecture SoT, product UI, visualization
**Quantity:** `T_tilt,y` from `DiagnosticTiltingTendency`
**Physics SoT:** `docs/physics/22-diagnostic-tilting-tendency.md`
**Architecture SoT:** `docs/architecture/26-diagnostic-tilting-tendency-architecture.md`
**Production `V_total`:** UNCHANGED
**Prescribed `Ω`:** UNCHANGED

This file records a headless scientific inspection of T1 on the
live `DEMO_SCENARIO` atmosphere. It does not retune parameters,
does not add an overlay, and does not itself select the next
physics branch. Post-T1 direction lives in
`docs/architecture/27-post-t1-physics-direction-checkpoint.md`.

Sampler (research-only, not a production API):

```text
docs/research/sample-t1-demo-field.ts
docs/research/artifacts/t1-demo-field-summary.json
docs/research/artifacts/t1-slice-y*.svg
```

---

## 1. Method

Canonical live instances from `composeDemoTracerFields`
(`IntegrationFrame.StormRelativeLaboratory`):

- `EnvironmentalWindProfile` from `DEMO_SCENARIO`
- `VerticalEnvelopeUpdraftField` from `DEMO_SCENARIO`
- `DiagnosticTiltingTendency({ profile, updraft })` on those
  same instances

No second DTO copy. No curl of `V_total`. No prescribed
rotation input.

At each height `y`, T1's locked segment picker selects the
piecewise-linear sounding interval containing `y`
(interior knot → **upper** segment). Environmental `ω_h` is
`horizontalVorticityFromShear(verticalWindShearBetween(...))`,
mapped to world `(ω_x, ω_z) = (omegaEastward, −omegaNorthward)`.

Horizontal sampling: regular XZ grid

```text
n = 41 × 41
half-extent = 3 σ = 12 000 m
spacing = 600 m
center = updraft axis (0, 0)
+X East, +Z South, +Y Up
laboratory time t = 0
```

Peak `|∇_h Vy|` of the current envelope occurs at `r = σ`
(`22` §11.5). `3σ` is wide enough to see far-field decay.

Along-axis checks use the **actual** world `ω_h` of that
segment, not the geographic East/West axes:

```text
parallel:      P = center ± σ ω̂
perpendicular: P = center ± σ n̂ ,  n̂ ⊥ ω̂ in XZ
```

Analytic dipole geometry (`22` §12–§13), for `W0 F > 0`:

```text
T_tilt,y ∝ − ω_h^{world} · r_h
T > 0 on the flank opposite ω_h
T < 0 on the flank of ω_h
T = 0 on the axis and on the diameter ⊥ ω_h
```

If sampled extrema disagreed with that prediction, this
validation would STOP.

---

## 2. Why these heights

DEMO updraft (`15` / `DEMO_SCENARIO.storm.updraft`):

```text
W0 = 30 m s⁻¹
σ  = 4000 m
[y_b, y_t] = [0, 8000] m
y_mid = 4000 m
F(y) = sin(π y / 8000)  on (0, 8000), else 0
```

DEMO sounding knots (`04` / `DEMO_SCENARIO.environment`):

```text
0, 1000, 2000, 6000, 12000 m
```

Segments used by T1:

```text
[0, 1000)      first
[1000, 2000)   after knot 1000
[2000, 6000)   after knot 2000
[6000, 12000]  last, includes maxHeight
```

| y (m) | Why |
| --- | --- |
| −200 | below sounding and below updraft (double zero) |
| 0 | lower lid `F = 0`; sounding `minHeight` |
| 500 | lower active updraft; first segment |
| 999 / 1000 / 1001 | interior-knot convention at 1000 m |
| 1500 | lower–mid updraft; interior of `[1000, 2000)` |
| 1999 / 2000 / 2001 | interior-knot convention at 2000 m |
| 4000 | `y_mid`, `F = 1`; segment `[2000, 6000)` |
| 5000 | upper–mid; same segment as 4000 (isolates `F(y)`) |
| 5999 / 6000 / 6001 | interior-knot convention at 6000 m |
| 7000 | upper active updraft; last segment |
| 8000 | upper lid `F = 0` |
| 9000 | above updraft, still inside sounding |
| 13000 | above `maxHeight` |

---

## 3. Environmental `ω_h` by sounding segment

From the live profile, not the hodograph overlay's fixed
`[0, 1000]` layer.

| Segment | shear E, N (s⁻¹) | ω_e, ω_n (s⁻¹) | ω_x, ω_z (s⁻¹) | \|ω_h\| (s⁻¹) | world ω_h |
| --- | --- | --- | --- | --- | --- |
| `[0, 1000)` | −0.010, +0.010 | −0.010, −0.010 | −0.010, +0.010 | 1.414×10⁻² | southwest |
| `[1000, 2000)` | +0.005, +0.010 | −0.010, +0.005 | −0.010, −0.005 | 1.118×10⁻² | west-northwest |
| `[2000, 6000)` | +0.005, −0.00125 | +0.00125, +0.005 | +0.00125, −0.005 | 5.154×10⁻³ | north-northeast |
| `[6000, 12000]` | +1.667×10⁻³, −1.667×10⁻³ | +1.667×10⁻³, +1.667×10⁻³ | +1.667×10⁻³, −1.667×10⁻³ | 2.357×10⁻³ | northeast |

Hodograph DEMO overlay still uses `[0, 1000]`. T1 does **not**.
A point at `y = 4000` lives on `[2000, 6000]`.

Physics `22` §21 illustrated `y = 1000` with the hodograph
layer `[0, 1000]`. T1's locked knot rule assigns **exactly**
`y = 1000` to the **upper** segment `[1000, 2000]`. That is
not a formula error. It is the difference between a
dimensional illustration and the segment picker. This
validation uses the picker.

---

## 4. Horizontal structure (grid extrema)

Signed couple on every active slice. Center `T = 0` exactly.
`min T = − max T` on the grid (odd symmetry of the Gaussian
updraft × uniform `ω_h`).

| y (m) | F | T_max (s⁻²) | at (x, z) m | T_min (s⁻²) | at (x, z) m | predicted T>0 |
| --- | --- | --- | --- | --- | --- | --- |
| 500 | 0.195 | +1.251×10⁻⁵ | (3000, −3000) NE | −1.251×10⁻⁵ | (−3000, 3000) SW | NE |
| 999 | 0.382 | +2.451×10⁻⁵ | (3000, −3000) NE | −2.451×10⁻⁵ | (−3000, 3000) SW | NE |
| 1000 | 0.383 | +1.946×10⁻⁵ | (3600, 1800) ESE | −1.946×10⁻⁵ | (−3600, −1800) WNW | ESE |
| 1500 | 0.556 | +2.825×10⁻⁵ | (3600, 1800) ESE | −2.825×10⁻⁵ | (−3600, −1800) WNW | ESE |
| 1999 | 0.707 | +3.595×10⁻⁵ | (3600, 1800) ESE | −3.595×10⁻⁵ | (−3600, −1800) WNW | ESE |
| 2000 | 0.707 | +1.648×10⁻⁵ | (−1200, 3600) SSW | −1.648×10⁻⁵ | (1200, −3600) NNE | SW |
| 4000 | 1.000 | +2.331×10⁻⁵ | (−1200, 3600) SSW | −2.331×10⁻⁵ | (1200, −3600) NNE | SW |
| 5000 | 0.924 | +2.154×10⁻⁵ | (−1200, 3600) SSW | −2.154×10⁻⁵ | (1200, −3600) NNE | SW |
| 6000 | 0.707 | +7.554×10⁻⁶ | (−3000, 3000) SW | −7.554×10⁻⁶ | (3000, −3000) NE | SW |
| 7000 | 0.383 | +4.088×10⁻⁶ | (−3000, 3000) SW | −4.088×10⁻⁶ | (3000, −3000) NE | SW |

Grid extrema sit at `r ≈ 4000–4240 m ≈ σ`, as expected for
the radial peak of `|∇_h Vy|`. Discrete 600 m cells do not
hit `r = σ` exactly, so grid `|T|_max` is a slight
underestimate of the analytic aligned peak (next section).

Zero-line orientation is perpendicular to `ω_h` on every
active slice (sampled `⊥` values are exact `0` at `r = σ`).

The couple is **not** East/West. It rotates with the sounding.

---

## 5. Vortex-couple check vs predicted `ω_h`

For each active height:

1. compute segment `ω_h`;
2. predict T>0 toward `−ω_h^{world}`;
3. compare to grid argmax.

**All active slices match.** No STOP.

Worked lower-layer case (`y = 500`, segment `[0, 1000)`):

```text
ω_h^{world} = (−0.01, +0.01)  →  southwest
predicted T > 0: northeast
sampled T_max: (3000, −3000)  →  east and north
sampled T_min: (−3000, 3000)  →  west and south
```

Worked mid-updraft case (`y = 4000`, segment `[2000, 6000)`):

```text
ω_h^{world} = (+0.00125, −0.005)  →  north-northeast
predicted T > 0: south-southwest
sampled T_max: (−1200, 3600)
```

This is the isolated-updraft vortex couple of `22` §13, not a
single cyclonic core. DEMO environmental `ω_h` is uniform in
`x, z` on each segment, and the updraft is axisymmetric.

---

## 6. Parallel / perpendicular symmetry

Samples at `r = σ` along `±ω̂` and `±n̂`.

| y (m) | T(+σ ω̂) | T(−σ ω̂) | T(+σ n̂) | T(−σ n̂) |
| --- | --- | --- | --- | --- |
| 500 | −1.255×10⁻⁵ | +1.255×10⁻⁵ | 0 | 0 |
| 1000 | −1.946×10⁻⁵ | +1.946×10⁻⁵ | 0 | 0 |
| 4000 | −2.344×10⁻⁵ | +2.344×10⁻⁵ | 0 | 0 |
| 7000 | −4.103×10⁻⁶ | +4.103×10⁻⁶ | 0 | 0 |

On the current envelope:

- center is exactly zero;
- mirrors along `ω_h` have opposite sign and equal magnitude;
- the perpendicular diameter is exactly zero at these points
  (`ω_h · r_h = 0` and `∇_h Vy ∥ −r_h`);
- far field along `+ω̂` at `r = 3σ` is ~5.5% of the `r = σ`
  aligned value (`3 e^{-4}` from the Gaussian radial factor),
  e.g. `y = 4000`: `T(3σ ω̂) = −1.288×10⁻⁶` vs
  `T(σ ω̂) = −2.344×10⁻⁵`.

---

## 7. Height dependence: `F(y)` vs sounding segment

Two mechanisms, separable on this model.

**A. Vertical envelope `F(y)`** — continuous inside a segment.

On `[2000, 6000)`, `ω_h` is constant, so `|T|_max` must track
`F(y)`:

```text
y = 4000  F = 1.000  |T|_max = 2.331×10⁻⁵
y = 5000  F = 0.924  |T|_max = 2.154×10⁻⁵
ratio T = 0.924 = ratio F
```

On `[6000, 12000]`:

```text
y = 6000  F = 0.707  |T|_max = 7.554×10⁻⁶
y = 7000  F = 0.383  |T|_max = 4.088×10⁻⁶
ratio T = 0.541 = ratio F
```

**B. Sounding segment `ω_h`** — piecewise constant; jumps at
knots.

`|ω_h|` decreases with height through the DEMO profile
(1.4×10⁻² → 1.1×10⁻² → 5.2×10⁻³ → 2.4×10⁻³ s⁻¹). Orientation
rotates from southwest through west-northwest to northeast.

Therefore `|T|` does **not** simply peak at `y_mid` where
`F = 1`. The grid maximum on this survey is at `y = 1999 m`
(`|T| = 3.595×10⁻⁵ s⁻²`), just below the 2000 m knot, where
`F` is already 0.707 **and** `|ω_h|` is still the larger
`[1000, 2000)` value. Immediately above the knot, `F` is
almost unchanged but `|ω_h|` drops and the dipole rotates,
so `|T|_max` falls to `1.648×10⁻⁵`.

That is `F(y) × ω_h(y)`, not a bug.

---

## 8. Interior sounding knots

Locked rule: at an interior knot, T1 uses the **upper**
segment. Jumps are consequences of piecewise-linear wind, not
observed atmospheric discontinuities.

### Knot 1000 m

| y | segment | \|ω_h\| | T_max | T>0 flank |
| --- | --- | --- | --- | --- |
| 999 | `[0, 1000)` | 1.414×10⁻² | 2.451×10⁻⁵ | NE |
| 1000 | `[1000, 2000]` | 1.118×10⁻² | 1.946×10⁻⁵ | ESE |
| 1001 | `[1000, 2000]` | 1.118×10⁻² | 1.948×10⁻⁵ | ESE |

`y = 1000` matches `y = 1001`, not `y = 999`. Orientation
rotates. `F` barely changes (`0.382 → 0.383`).

### Knot 2000 m

The largest orientation/magnitude jump in the DEMO chimney:

| y | segment | world ω_h | T_max | T>0 flank |
| --- | --- | --- | --- | --- |
| 1999 | `[1000, 2000)` | WNW | 3.595×10⁻⁵ | ESE |
| 2000 | `[2000, 6000]` | NNE | 1.648×10⁻⁵ | SW |
| 2001 | `[2000, 6000]` | NNE | 1.649×10⁻⁵ | SW |

### Knot 6000 m

Same NE family, smaller `|ω_h|`:

| y | segment | \|ω_h\| | T_max |
| --- | --- | --- | --- |
| 5999 | `[2000, 6000)` | 5.154×10⁻³ | 1.649×10⁻⁵ |
| 6000 | `[6000, 12000]` | 2.357×10⁻³ | 7.554×10⁻⁶ |
| 6001 | `[6000, 12000]` | 2.357×10⁻³ | 7.551×10⁻⁶ |

If T1 is later mapped, these kinks must remain visible or be
named as sounding-representation artifacts. Do not smooth them
into a continuous vortex.

---

## 9. Zero controls

| Location | expected | sampled grid T |
| --- | --- | --- |
| `y = −200` (below sounding and updraft) | 0 | 0 |
| `y = 0` lower lid | 0 (`F = 0`) | 0 |
| updraft axis, all heights | 0 | 0 |
| `y = 8000` upper lid | 0 (`F = 0`) | 0 |
| `y = 9000` above updraft, inside sounding | 0 (`F = 0`) | 0 |
| `y = 13000` above sounding | 0 (`ω_h` convention) | 0 |
| far along `ω̂` at `3σ`, active layer | → 0 (Gaussian) | ~5% of peak |

`y = 9000` still has nonzero environmental `ω_h` on
`[6000, 12000]`. T1 is nevertheless zero because the updraft
gradient is zero. That is the product, not a missing shear call.

---

## 10. Magnitude vs physics `22` §21

Order-of-magnitude expectation in `22`:

```text
|ω_h|      ∼ 10⁻² s⁻¹
|∇_h Vy|   ∼ 10⁻³ s⁻¹
|T_tilt,y| ∼ 10⁻⁵ s⁻²
```

Sampled on CURRENT DEMO:

| Quantity | Sampled |
| --- | --- |
| \|ω_h\| by segment | 1.41×10⁻², 1.12×10⁻², 5.15×10⁻³, 2.36×10⁻³ s⁻¹ |
| \|∇_h Vy\|_max at `y = 4000` | 4.549×10⁻³ s⁻¹ (analytic 4.549×10⁻³) |
| \|∇_h Vy\|_max at `y = 500` | 8.874×10⁻⁴ s⁻¹ |
| grid \|T\|_max (this survey) | 3.595×10⁻⁵ s⁻² at `y = 1999` |
| \|T\|_max at `y_mid = 4000` | 2.331×10⁻⁵ s⁻² |
| \|T\|_max at `y = 7000` | 4.088×10⁻⁶ s⁻² |

Aligned analytic bound `|ω_h| |∇_h Vy|_max` matches the
`r = σ` parallel samples to all reported digits (e.g. `y = 4000`:
`2.344×10⁻⁵`). Grid extrema are slightly smaller because the
600 m lattice misses the exact `σ` radius.

This is the same 10⁻⁵ s⁻² family as `22`. Lower-upper
variation of a factor of a few is `F(y)` times the decreasing
DEMO `|ω_h|(y)`, not a retune signal.

Characteristic time `1 / |T|_max ∼ 8 h` at the strongest
sampled lobe. That is **not** a mesocyclone formation time.
T1 is not integrated.

---

## 11. `Ω` independence — numeric DEMO check

Test-only modified rotation. DEMO config not written.

Point `P = (−4000, 4000, 0)` (west of axis, `y_mid`):

```text
T_tilt,y (DEMO Ω = 0.005)     =  5.686×10⁻⁶ s⁻²
T_tilt,y (test Ω = 0.020)     =  5.686×10⁻⁶ s⁻²   identical
V_rotation,z (DEMO Ω)         =  11.34 m s⁻¹
V_rotation,z (test Ω)         =  45.37 m s⁻¹      changed
```

Prescribed rotation is visible in `V_total` and is not the
source of T1.

---

## 12. Storm-motion independence — numeric check

Same `P`. Ground-relative vs storm-relative composition:

```text
T_tilt,y ground-relative     =  5.686×10⁻⁶ s⁻²
T_tilt,y storm-relative      =  5.686×10⁻⁶ s⁻²   identical
V_total,x ground             =  20.785 m s⁻¹
V_total,x storm-relative     =  10.785 m s⁻¹
ΔVx                          = −10 m s⁻¹ = −C_east
Vy, Vz unchanged
```

Constant `C` changes storm-relative velocity. It does not
change environmental `ω_h` or T1.

---

## 13. Plots

Offline signed SVG heatmaps, not product UI. `+X` East right,
`+Z` South down (north is up). Black arrow: world `ω_h`.
Warm: `T > 0`. Cool: `T < 0`.

```text
docs/research/artifacts/t1-slice-y500.svg
docs/research/artifacts/t1-slice-y999.svg
docs/research/artifacts/t1-slice-y1000.svg
docs/research/artifacts/t1-slice-y1500.svg
docs/research/artifacts/t1-slice-y2000.svg
docs/research/artifacts/t1-slice-y4000.svg
docs/research/artifacts/t1-slice-y6000.svg
docs/research/artifacts/t1-slice-y7000.svg
```

`y999` vs `y1000` shows the knot rotation. `y2000` vs `y1500`
shows the larger 2000 m jump. `y4000` is the `F = 1` SW couple.
Each panel uses its own `|T|` scale so structure stays visible
in the weaker upper chimney.

---

## 14. Interpretation

CURRENT DEMO T1 is a **height-dependent signed vortex couple**
whose:

- horizontal pattern is `−ω_h(y) · r_h` times the Gaussian
  updraft gradient;
- amplitude follows `F(y)` inside a sounding segment;
- orientation and `|ω_h|` jump at profile knots.

It is **not**:

- a single cyclonic mesocyclone;
- an explanation of prescribed `Ω`;
- `Dω_y / Dt`;
- SRH;
- a reason `V_total` currently moves as it does.

The couple axis follows the DEMO shear profile, not a fixed
east–west laboratory stamp.

---

## 15. Limitations

- Research grid is 600 m. Extrema locations are cell-limited;
  analytic `r = σ` samples are the amplitude truth.
- T1 v1 uses **updraft** `Vy` only. Offset DEMO downdraft is
  excluded by `22`.
- Continuity remains YELLOW. T1 is a kinematic product, not
  incompressible vorticity dynamics.
- Piecewise-linear sounding makes `ω_h` a step in height.
  That is the current representation, not a claim that real
  shear is discontinuous.
- No time integration. No tracer-owned vorticity.
- Heatmaps are research artifacts. They are not a product
  overlay and must not be read as living-air encoding.

---

## 16. Verdict

**A. Coherent signed vortex-couple structure?**

**YES.**

**B. Orientation matches actual environmental `ω_h`?**

**YES**, on every sampled active slice, including after knot
rotations. Not a fixed East/West couple.

**C. Vertical behavior = updraft envelope × sounding shear?**

**YES.** Inside a segment, `|T| ∝ F(y)`. At knots, magnitude
and orientation follow the upper-segment `ω_h`.

**D. Magnitudes consistent with physics `22` (~10⁻⁵ s⁻²)?**

**YES.** Sampled `|T|_max` is `4×10⁻⁶` to `4×10⁻⁵` s⁻².
No retune indicated.

**E. Artifacts from knots / boundaries important later?**

**YES, for any future map.** Interior knots jump. Lids and
out-of-sounding zeros are exact. Do not hide the kinks.

**F. Is T1 sufficiently validated to close the current
headless capability?**

**YES**, as a headless diagnostic of the current ingredients.
UI / Inspector / overlay remain unstarted and are **not**
required to close T1 v1.

**G. Next physics question?**

**Not selected here.** Evidence from this survey:

```text
T1 is a couple, not generated rotation.
Prescribed Ω is independent of T1 and still paints V_rotation.
There is still no prognostic ω_y, so stretching is not a
  tendency of an evolved vortex.
Closing vorticity → velocity is a different model class.
```

Candidates, none chosen:

- diagnostic stretching **only if** a later document names an
  `ω_y` source that is not `curl(Ω)`;
- T1-curl bookkeeping of prescribed rotation, to keep
  `Ω ≠ tilting` visible;
- prognostic T2 (`ω_y` ODE on prescribed `V`) — high state
  cost, still no tracer effect without a bridge;
- composite / downdraft `Vy` as a different honesty question;
- product Inspector L3 / overlay of **this** T1 — product,
  not a new physics capability.

Do not treat “T1 looks like a couple” as authorization for T2.

---

## 17. Compact lock-in

```text
DEMO T1:            signed vortex couple
orientation:        follows segment ω_h, not E–W
vertical:           F(y) × piecewise ω_h(y)
knots:              upper-segment jumps; representation artifact
|T|:                ∼ 10⁻⁵ s⁻² ; matches 22
Ω / C:              numerically independent
V_total:            unchanged
capability:         headless T1 CLOSED as diagnostic
UI:                 NOT STARTED
next physics:       NOT SELECTED
```
