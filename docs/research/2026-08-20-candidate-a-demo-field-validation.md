# Candidate A DEMO Field Validation — 2026-08-20

**Status:** SCIENTIFIC VALIDATION / CURRENT DEMO EVIDENCE
**Not:** physics SoT, architecture SoT, product UI, visualization
**Quantity:** `ω_y,current` from `DiagnosticVerticalVorticity`
**Physics SoT:** `docs/physics/23-diagnostic-vertical-vorticity.md`
**Architecture SoT:** `docs/architecture/28-diagnostic-vertical-vorticity-architecture.md`
**Production `V_total`:** UNCHANGED
**Prescribed `Ω`:** UNCHANGED
**T1:** remains a different quantity (`T_tilt,y`, s⁻²)

This file records a headless scientific inspection of Candidate A
on the live `DEMO_SCENARIO` atmosphere. It does not retune
parameters, does not add an overlay, and does not itself select
the next physics branch. Stretching, T2, and `ω → V` remain
unstarted.

Sampler (research-only, not a production API):

```text
docs/research/sample-candidate-a-demo-field.ts
docs/research/artifacts/candidate-a-demo-field-summary.json
docs/research/artifacts/candidate-a-slice-ymid.svg
docs/research/artifacts/candidate-a-radial-ymid.svg
docs/research/artifacts/candidate-a-vertical-axis.svg
```

Evaluator: canonical `DiagnosticVerticalVorticity.sample`
from `composeDemoTracersWithObservation`
(`IntegrationFrame.StormRelativeLaboratory`). Independent
analytic expectations are used only as a check, never as a
second production path. If observed values had disagreed with
physics `23`, this validation would STOP.

---

## 1. Method

Canonical live instances from one composition pass:

- `VerticalEnvelopeRotationField` = `velocityObservation.parts.rotation`
- `DiagnosticVerticalVorticity({ rotation })` on that same instance
- `DiagnosticTiltingTendency` from the same pass (contrast only)

No second DTO copy. No finite-difference curl of `V_total`.
No generic curl API.

Independent expected (research check only):

```text
G(y) = sin(π (y − y_b) / H)   on the open layer
     = 0                      on and outside closed lids

ω_y^expected
  = 2 Ω G E (1 − r² / (2 σ²))
  E = exp(−r² / (2 σ²))
```

Every listed contract point was required to match that
formula **and** to satisfy

```text
DiagnosticVerticalVorticity.sample(P, t)
  === rotation.worldVerticalVorticity(P, t)
```

That equality is the CURRENT STACK IDENTITY, not a universal
model law.

DEMO rotation axis is the actual `(centerX, centerZ)` of the
live occupant. On CURRENT DEMO those coordinates happen to
be the world origin. That is a DEMO fact, not an API
assumption.

---

## 2. DEMO parameters

Live `DEMO_SCENARIO.storm.rotation`:

```text
Ω      = 0.005 s⁻¹   (> 0)
σ      = 4000 m
[y_b, y_t] = [0, 6500] m
y_mid  = 3250 m
center = (centerX, centerZ) = (0, 0)   // DEMO fact
```

Physics `23` §22 used these numbers as a dimensional
illustration. This survey samples the live diagnostic, not
that table as an evaluator.

Horizontal survey grid (heatmap only):

```text
n = 41 × 41
half-extent = 3 σ = 12 000 m
spacing = 600 m
+X East, +Z South, +Y Up
laboratory time t = 0
```

Contract radii are constructed exactly (`r = σ`;
`dx = σ`, `dz = σ` ⇒ `r² = 2 σ²`), not from the 600 m grid.

---

## 3. Axis

On the rotation axis, physics `23` requires `ω_y = 2 Ω G(y)`.
At `y_mid`, `G = 1` ⇒ `ω_y = 2 Ω = 0.010 s⁻¹`.

T1 on the same axis is identically 0 (`∇_h Vy = 0` there).
That is a contrast, not a comparison of like units.

| y (m) | G | ω_y,current (s⁻¹) | expected | T1 (s⁻²) |
| --- | --- | --- | --- | --- |
| −200 | 0 | 0 | 0 | 0 |
| 0 lid | 0 | 0 | 0 | 0 |
| 1000 | 0.4647 | 4.647×10⁻³ | 4.647×10⁻³ | 0 |
| 3250 mid | 1 | **0.010000** | 0.010000 | 0 |
| 4000 | 0.9350 | 9.350×10⁻³ | 9.350×10⁻³ | 0 |
| 5000 | 0.6631 | 6.631×10⁻³ | 6.631×10⁻³ | 0 |
| 6500 lid | 0 | 0 | 0 | 0 |
| 8000 | 0 | 0 | 0 | 0 |
| 9000 | 0 | 0 | 0 | 0 |

Lids and exterior are exact `+0` (closed-interval policy;
`sin(π)` is not evaluated). Matches physics `23` §14 and §22.

**No STOP.**

---

## 4. Radial profile at `y_mid` (`G = 1`)

| r | construction | ω_y (s⁻¹) | expected | sign vs core |
| --- | --- | --- | --- | --- |
| 0 | axis | **+0.010000** | 2Ω | core |
| σ = 4000 m | east of center | +3.033×10⁻³ | Ω exp(−1/2) | same as core |
| σ√2 | `dx=σ`, `dz=σ` (`r²=2σ²`) | **0** | 0 | zero ring |
| 2σ = 8000 m | east of center | **−1.353×10⁻³** | formula | **opposite** |
| 3σ = 12000 m | east of center | −3.888×10⁻⁴ | formula | opposite |
| 8σ = 32000 m | east of center | −3.926×10⁻¹⁵ | formula | → 0 |

The outer opposite-sign annulus is required by the shielded
Gaussian vortex (physics `23` §13). It is **not** hidden as
an artifact, **not** a rear-flank couple, and **not** T1's
dipole.

Tangential velocity does not reverse for `Ω > 0`. Only the
curl does, where `v_θ` decays faster than a `1/r` potential
vortex.

Far-field `|ω_y|` at `8σ` is ~10⁻¹⁵ s⁻¹: numerically a
Gaussian tail, not a second vortex.

**No STOP.**

---

## 5. Horizontal symmetry

At `r = σ`, `y = y_mid`, about the **actual** center
`(centerX, centerZ)`:

| location | (dx, dz) | ω_y (s⁻¹) |
| --- | --- | --- |
| East (+X) | (+σ, 0) | 3.033×10⁻³ |
| West (−X) | (−σ, 0) | 3.033×10⁻³ |
| South (+Z) | (0, +σ) | 3.033×10⁻³ |
| North (−Z) | (0, −σ) | 3.033×10⁻³ |

Axisymmetric to machine precision. DEMO center coinciding
with the world origin was **not** used as the definition of
the axis.

Heatmap at `y_mid` (`candidate-a-slice-ymid.svg`): positive
core, dashed circle at `r = σ√2`, negative ring, decay
outward. Grid extrema: max `+0.010` on axis; min
`−1.353×10⁻³` (cell-limited; analytic `r = 2σ` is the
amplitude truth for that radius).

---

## 6. Vertical envelope

On the axis, `ω_y(y) = 2 Ω G(y)`:

- below `y_b` and at the lower lid: exact 0
- interior: follows the half-sine
- peak on axis at `y_mid`: `2Ω = 0.010 s⁻¹`
- at the upper lid and above: exact 0

`y = 8000 m` is still inside the DEMO **updraft**
(`[0, 8000]`), but Candidate A is already 0 because the
rotation lids are `[0, 6500]`. Vertical vorticity of this
diagnostic is the rotation window, not the updraft window.

---

## 7. Time

CURRENT field is Eulerian-steady. At

```text
P = (4000, 3050, −200) m
```

```text
t = 0, 12, 99, 3600 s
ω_y = 1.998×10⁻³ s⁻¹   identical
```

This is a CURRENT field property, not a promise that every
future `VelocityField` is steady.

---

## 8. CURRENT STACK IDENTITY

On every contract point, heatmap node used for plots, radial
line, and vertical line:

```text
DiagnosticVerticalVorticity.sample(P, t)
  === rotation.worldVerticalVorticity(P, t)
```

On the CURRENT seven-operand DEMO stack, physics `23` proved
the other six occupants contribute `ω_y = 0`. Therefore

```text
ω_y(V_total) = ω_y(V_rotation)     CURRENT IDENTITY
```

That is bookkeeping of this prescribed stack. It is **not**
a supercell theorem and must not be hardcoded as an API law.

Constant storm motion `C = (10, 0)` m s⁻¹:

```text
ω_y ground-relative     =  3.033×10⁻³ s⁻¹
ω_y storm-relative      =  3.033×10⁻³ s⁻¹   identical
V_total,x ground        =  14.404 m s⁻¹
V_total,x storm-relative=   4.404 m s⁻¹
ΔVx                     = −10 m s⁻¹ = −C_east
```

`C` changes horizontal velocity. It does not change `ω_y,current`.

---

## 9. Relation to T1

These are **different quantities**. They must not be summed,
plotted as one field, or narrated as cause and effect.

| | T1 | Candidate A |
| --- | --- | --- |
| symbol | `T_tilt,y` | `ω_y,current` |
| units | s⁻² | s⁻¹ |
| kind | generation *tendency* | existing Eulerian curl of `V` |
| DEMO spatial object | signed vortex **couple**, offset along env `ω_h` | on-axis shielded **core** + opposite-sign ring |
| DEMO peak (this survey) | ~2.3×10⁻⁵ s⁻² at T1's `y=4000` couple | **0.010 s⁻¹** on the rotation axis at `y_mid` |
| on rotation axis | 0 | `2 Ω G(y)` |
| depends on `Ω` | no | yes |
| depends on sounding / `W0` | yes | no |

Representative co-located samples (not a unit conversion):

```text
rotation axis, y_mid = 3250 m
  ω_y,current = 0.010 s⁻¹
  T_tilt,y    = 0

T1 couple location from T1 validation, y = 4000 m
  P = (−1200, 4000, 3600) m
  r ≈ 3795 m ≈ 0.95 σ   (still inside the positive core)
  ω_y,current = 3.279×10⁻³ s⁻¹
  T_tilt,y    = 2.331×10⁻⁵ s⁻²

updraft/rotation axis, y = 4000 m
  ω_y,current = 9.350×10⁻³ s⁻¹
  T_tilt,y    = 0
```

The T1 couple lives off-axis near `r ≈ σ`, where prescribed
`ω_y` is still **positive** for `Ω > 0`. T1's dipole is not
the outer negative ring of Candidate A.

Semantic sentence:

```text
T1 says where current prescribed shear + updraft create
a tilting tendency.

Candidate A says where vertical vorticity already exists
in current prescribed V_total.

There is no evolution bridge between them.
T1 did not generate this ω_y.
Prescribed Ω is not the integral of tilting.
```

---

## 10. Magnitude

Units: s⁻¹. Not a mesocyclone intensity. No external
observational comparison in this slice.

```text
axis peak at y_mid          1.000×10⁻²
axis at y = 1000 m          4.647×10⁻³
r = σ, y_mid                3.033×10⁻³
outer ring r = 2σ, y_mid   −1.353×10⁻³   (~14% of core, opposite)
r = 3σ, y_mid              −3.888×10⁻⁴
r = 8σ                     ~10⁻¹⁵        (Gaussian tail)
lids / exterior             0
```

Core `ω_y` is the same unit family as DEMO environmental
`|ω_h|` (~10⁻² … 10⁻³ s⁻¹ from T1 validation). They are not
interchangeable: one is vertical curl of painted spin, the
other is horizontal vorticity of the sounding.

T1 is s⁻². Do not compare `T_tilt,y` to `ω_y` without a
timescale, and do not integrate T1.

---

## 11. Sign language

DEMO `Ω > 0`:

```text
central ω_y > 0
outer annulus after r = σ√2 < 0
```

Canonical names: **positive / negative world-vertical
vorticity**. Cyclonic / anticyclonic are not locked: the
laboratory does not fix a hemisphere.

Viewed from above looking down, positive `+Y` rotation is
counterclockwise (`00` §13). That matches this core sign.

---

## 12. Plots

Offline research SVGs, not product UI. `+X` East right,
`+Z` South down (north is up). Warm: `ω_y > 0`. Cool:
`ω_y < 0`.

```text
docs/research/artifacts/candidate-a-slice-ymid.svg
  XZ heatmap at y_mid; dashed circle = r = σ√2

docs/research/artifacts/candidate-a-radial-ymid.svg
  ω_y(r) at y_mid; zero crossing then negative ring

docs/research/artifacts/candidate-a-vertical-axis.svg
  ω_y(y) on the rotation axis; compact lids
```

Heatmaps must not be read as living-air encoding or as an
Inspector overlay.

---

## 13. Interpretation

CURRENT DEMO Candidate A is a **height-windowed shielded
vortex** of prescribed `Ω`:

- positive core about the rotation axis;
- exact zero ring at `r = σ√2`;
- opposite-sign outer annulus from the Gaussian envelope;
- compact vertical support on `[0, 6500]` m;
- Eulerian-steady on the current field.

It is **not**:

- accumulated tilting;
- T1's vortex couple;
- a mesocyclone;
- prognostic `ω_y`;
- a reason `V_total` currently moves as it does beyond the
  already-prescribed `V_rotation`;
- a mass-consistent vortex (continuity remains YELLOW).

---

## 14. Limitations

- Research 600 m heatmap cells do not hit `r = σ√2` exactly.
  Contract radii were constructed exactly; those are the
  amplitude/zero truth.
- CURRENT STACK IDENTITY is stack-specific.
- No time integration. No tracer-owned vorticity.
- Heatmaps are research artifacts, not a product overlay.
- Magnitude is not an observational claim.

---

## 15. Verdict

**A. Axis `ω_y = 2 Ω G`, including `2Ω` at `y_mid`?**

**YES.** DEMO `2Ω = 0.010 s⁻¹`.

**B. Radial shielded-vortex structure (core / zero ring /
opposite-sign annulus / far-field decay)?**

**YES.** Outer ring shown, not hidden.

**C. Axisymmetry about the actual rotation center?**

**YES.** DEMO origin-centered axis is a DEMO fact.

**D. Vertical envelope / exact lid zeros?**

**YES.** Closed interval. `y = 8000 m` (updraft still on)
is Candidate A zero.

**E. Time-independence of the CURRENT field?**

**YES**, at sampled finite `t`.

**F. CURRENT STACK IDENTITY on live instances?**

**YES**, as a CURRENT identity, not a law.

**G. Distinct from T1?**

**YES.** Different units, different spatial object, no
evolution bridge.

**H. Magnitudes consistent with physics `23` (~10⁻² s⁻¹
on axis at `G = 1`)?**

**YES.** No retune indicated.

**I. Is Candidate A sufficiently validated to close the
current headless DEMO inspection?**

**YES**, as a headless diagnostic of current prescribed `V`.
UI / Inspector / overlay remain unstarted and are **not**
required to close Candidate A v1.

**J. Next physics question?**

**Not selected here.** Evidence from this survey:

```text
Candidate A is the painted shielded vortex of Ω.
T1 is an independent couple.
There is still no prognostic ω_y.
Stretching of this ω_y would be L1 bookkeeping of
  prescribed-vortex strain, not supercell intensification.
ω → V remains a different model class.
```

Do not treat “Candidate A looks like a vortex” as
authorization for stretching, T2, or closure.

---

## 16. Compact lock-in

```text
DEMO Candidate A:   shielded vortex of prescribed Ω
core:               positive ω_y (Ω > 0); 2Ω = 0.010 s⁻¹ at y_mid
zero ring:          r = σ√2, exact 0
outer ring:         opposite sign; Gaussian-envelope shape
vertical:           G(y) on [0, 6500] m; lids exact 0
time:               CURRENT field Eulerian-steady
CURRENT STACK:      sample === rotation.worldVerticalVorticity
                    identity, not a law
T1:                 different quantity; no arrow
|ω_y|:              ∼ 10⁻² s⁻¹ core; matches 23
C / W0:             ω_y independent
V_total:            unchanged
capability:         headless Candidate A VALIDATED / DEMO
UI:                 NOT STARTED
next physics:       NOT SELECTED
```
