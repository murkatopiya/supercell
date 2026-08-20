# Composite Continuity / Mass-Budget Audit

**Status:** research + architecture SoT for the prescribed
five-operand stack measured here. Live composition is now seven
operands (`docs/rendering/15-composite-downdraft-demo.md`,
`docs/rendering/16-composite-near-ground-outflow-demo.md`); this
audit is not a retune of those later occupants. Production code was
not changed by this document. No solver, density, or pressure is
introduced.

This document measures kinematic `∇ · V` of the current laboratory
sum, states how large the residual is relative to the stack’s own
velocity gradients, and locks what the live story pathlines may and
may not claim.

It does **not** retune `A_in`, `A_out`, `W0`, bounds, `sigma`, `C`,
or seeds. Local near-cancellation is recorded so it cannot be sold
as continuity.

Predecessor: `docs/architecture/09-post-story-view-review.md` §9.

Live at the time of this audit:

```text
stack            = EnvironmentalWindField
                   + VerticalEnvelopeUpdraftField
                   + VerticalEnvelopeRotationField
                   + LowerRadialInflowField
                   + UpperRadialOutflowField
frame            = StormRelativeLaboratory
                   (env operand = V_env − C; storm operands unchanged)
story            = S1 / S2, Euler dt = 0.1 s
canonical DEMO   = σ = 4000 m, W0 = 30 m/s, Ω = 0.005 s⁻¹,
                   A_in = 0.00125 s⁻¹, A_out = 0.0025 s⁻¹
envelopes        = updraft [0, 8000]
                   rotation [0, 6500]
                   lower inflow plateau y ≤ 1500, taper to 4500
                   upper outflow [5000, 9000]
```

Shared centers at the origin and shared `σ` are a DEMO fixture
(`06`, `01`), not a physics invariant. The live residual below uses
that fixture. The impossibility of cancelling `div_h` at all `r`
does **not** depend on it (`15` §11.3).

Related physics:

- `docs/physics/15-vertical-updraft-envelope.md` §9, §11
- `docs/physics/16-upper-radial-outflow-field.md` §18
- `docs/physics/17-lower-radial-inflow-field.md` §19
- `docs/physics/18-vertical-rotation-envelope.md` §18
- `docs/physics/04-environmental-wind-profile.md` §6, §11
- `docs/physics/19-storm-relative-environmental-advection.md` §4
- `docs/physics/01-parcel-basics.md` §27–29, §32
- `docs/architecture/02-current-model-assumptions-audit.md` §6
- future sixth operand occupancy (not a residual fix):
  `docs/rendering/15-composite-downdraft-demo.md`

---

## 1. Verdict

**A. Residual acceptable for current kinematic teaching; a future
prescribed downdraft may be added later only with hard anti-claims.**

Not B: the residual is large compared with the stack’s own strains,
but it is the honest signature of independently prescribed operands.
A corrective rebalance would optimize the DEMO toward a mass-budget
claim this project has forbidden. This audit does not change
parameters.

Not C: full circulation teaching is not the current contract. A
continuity-aware model is required only when the teaching goal
becomes mass-consistent / same-air-mass / closed-cell circulation.

The residual is **YELLOW**, not ε and not RED. It becomes RED if
copy, a downdraft, or a future API is sold as closing it.

---

## 2. What is measured

The quantity is world-space kinematic divergence of the live
composite velocity:

```text
∇ · V = ∂Vx/∂x + ∂Vy/∂y + ∂Vz/∂z
```

Units: `s⁻¹`.

This is **not**:

- a density-weighted mass budget `∇ · (ρ V)`;
- an anelastic / Boussinesq diagnostic;
- a production `divergence()` API;
- a solver residual.

Density and pressure are out of scope. “Mass-budget” in the title
means: how far the prescribed sum is from the kinematic statement
`∇ · V = 0` that a constant-density continuity model would require.
Path-integrated `∫ ∇ · V dt` along S1/S2 is reported only as the
logarithmic stretch a **material volume** would experience if it
followed that pathline. Point tracers do not carry volume
(`01` §29).

At updraft lids, `F` is `C^0` but not classically differentiable
(`15` §9). Maps and tables use `F' = 0` at the closed endpoints
and the interior formula on `(y_b, y_t)`. One-sided lid limits are
stated separately. Do not average them.

---

## 3. Per-operand analytic `∇ · V`

All formulas below are already in the physics docs. They are
collected here as the live-stack identity. `E(r) = exp(−r²/(2σ²))`.
Each operand uses its own center and `σ`; live DEMO sets them equal.

### 3.1 Environmental wind

`EnvironmentalWindField` is horizontally homogeneous and has
`Vy ≡ 0` (`04`). Therefore

```text
∇ · V_env = 0
```

`StormRelativeLaboratory` subtracts constant storm motion `C`
from that operand only (`19`). A constant does not change
divergence:

```text
∇ · V_env_sr = 0
```

The live 3D frame does not create or hide a continuity residual.

### 3.2 Vertical envelope updraft

`Vx ≡ 0`, `Vz ≡ 0`, `Vy = W0 E(r) F(y)`, half-sine `F` (`15`).

```text
∇ · V_up = ∂Vy/∂y = W0 E(r) F'(y)

F'(y) = (π / H_up) cos(π ξ_up)    for y_b_up < y < y_t_up
F'(y) = 0                         outside
```

Live: `H_up = 8000 m`. On the axis, the interior lid limits are

```text
∂Vy/∂y → ± W0 π / H_up = ± 0.01178 s⁻¹
```

At updraft mid-layer `y = 4000 m`, `F' = 0`.

### 3.3 Vertical envelope rotation

Purely azimuthal, `Vy ≡ 0`, `G(y)` independent of `(x, z)` (`18`):

```text
∇ · V_rot = 0
```

identically, including lids and the exterior. Height localization
does not create a residual. Isolated `div = 0` is **not**
mass-consistent storm physics.

### 3.4 Lower radial inflow

`Vy ≡ 0`. Plateau-and-taper `G_in` (`17`):

```text
∇ · V_in = −A_in E(r) G_in(y) (2 − r²/σ²)

G_in = 1                         y ≤ 1500 m
G_in = cos(π ξ_in / 2)           1500 < y < 4500
G_in = 0                         y ≥ 4500
```

On the axis, on the plateau: `∇ · V_in = −2 A_in = −0.0025 s⁻¹`.

Sign of the radial factor flips at `r = σ √2 = 5657 m`:

- `r < σ √2`: local sink (`div_h < 0`) where `G_in > 0`;
- `r > σ √2`: local source in the Gaussian tail, while `v_r` stays
  inward.

### 3.5 Upper radial outflow

`Vy ≡ 0`. Half-sine `G_out` (`16`):

```text
∇ · V_out = +A_out E(r) G_out(y) (2 − r²/σ²)

G_out = sin(π ξ_out)             5000 ≤ y ≤ 9000
G_out = 0                        otherwise
```

On the axis at outflow mid-layer `y = 7000 m`:
`∇ · V_out = +2 A_out = +0.005 s⁻¹`.

The same `r = σ √2` sign flip applies, with opposite horizontal
sense.

---

## 4. Composite identity

Because divergence is linear and rotation plus environment contribute
zero:

```text
∇ · V_total = ∇ · V_up + ∇ · V_in + ∇ · V_out
```

Live DEMO (shared center and `σ`):

```text
∇ · V = E(r) [
          W0 F'(y)
          + (2 − r²/σ²) ( −A_in G_in(y) + A_out G_out(y) )
        ]
```

`15` §11 wrote the two-operand special case
`inflow + enveloped updraft` with height-independent inflow. That
paragraph remains true as an impossibility proof. It is **not** the
live residual. The live sum has three independent vertical windows.

No v1 invariant ties

```text
A_in, A_out, W0, H_up, H_in, H_out, G_in, G_out, F
```

A finite-difference check of `CompositeVelocityField.sample` at
interior points (including S1/S2 seeds, axis, outflow, underground)
matches this identity to `O(10⁻¹⁰) s⁻¹`. That confirms the live
implementation, not a production diagnostic.

---

## 5. Characteristic scales

Live numbers, not targets:

| Scale | Value | Meaning |
| --- | --- | --- |
| `W0 π / H_up` | `0.01178 s⁻¹` | max on-axis `\|∂Vy/∂y\|` (interior lid) |
| `W0 / H_up` | `0.00375 s⁻¹` | mean vertical strain if `W` were linear in `y` |
| `2 A_out` | `0.005 s⁻¹` | on-axis outflow mid-layer source |
| `2 A_in` | `0.0025 s⁻¹` | on-axis inflow-plateau sink |
| `A_in` | `0.00125 s⁻¹` | inflow strain-rate parameter |
| `Ω` | `0.005 s⁻¹` | rotation rate; **not** divergence |
| peak `\|v_r\|` inflow at `r = σ`, `G_in = 1` | `3.03 m/s` | `A_in σ / √e` |
| peak `\|v_r\|` outflow at `r = σ`, `G_out = 1` | `6.07 m/s` | `A_out σ / √e` |

Relative residual on the axis at the story seed height
`y = 1000 m`:

```text
∇ · V = 0.00838 s⁻¹
(∇ · V) / (W0 π / H_up) ≈ 0.71
(∇ · V) / (2 A_in)      ≈ 3.4
e-folding time 1 / |∇ · V| ≈ 119 s
```

The residual is the **same order** as the largest mechanism strain
in the stack. It is not a perturbation on an otherwise
divergence-free laboratory.

---

## 6. Why the strengths are not a mass budget

Three independent kinematic pieces:

**Lower inflow, mass-like convergence.** On-axis plateau
`div_h = −2 A_in = −0.0025 s⁻¹`. That is a shielded horizontal
sink. It cannot supply vertical mass flux: `Vy ≡ 0` on this
operand. Height localization only turns the sink off above
`4500 m`.

**Vertical expansion / compression.** Separable
`Vy = W0 E(r) F(y)` implies `∂Vy/∂y = W0 E F'(y)`. In the lower
half of the chimney this is a **source** (accelerating ascent). In
the upper half it is a **sink** (decelerating ascent). Peak
magnitude `0.01178 s⁻¹` is about **4.7×** `2 A_in` and about
**2.4×** `2 A_out`.

A coincidental axis cancellation of inflow by updraft at the
interior base would require

```text
H_up = W0 π / (2 A_in) = 37 699 m
```

or equivalently `A_in = 0.00589 s⁻¹` at live `H_up`. Live
`H_up = 8000 m` and live `A_in = 0.00125 s⁻¹` satisfy neither.
Even if they did, `15` §11.3 still forbids cancellation at all `r`
at a fixed `y`, because inflow’s radial factor is `(2 − r²/σ²)`
and the updraft term in brackets depends only on `y`.

**Upper radial divergence.** On-axis mid-outflow source
`+0.005 s⁻¹`. In the overlap with the updraft’s decelerating half,
`|∂Vy/∂y|` is larger than `2 A_out G_out` at every height on the
axis. Outflow does not cancel upper-level compression. Above
`8000 m`, updraft is off and outflow is a pure horizontal source
until `9000 m`.

The vertical windows are not a pipe:

```text
y < 0          inflow plateau on, updraft off     → pure sink
0 < y < 1500   inflow plateau + updraft accel     → strong source
1500 < y < 4000  inflow taper + updraft accel     → source, weakening
~3800 m        accidental near-zero on axis       → not a budget
4000 < y < 4500  inflow taper + updraft decel     → sink
4500 < y < 5000  gap: both G_in and G_out = 0     → pure ∂Vy/∂y < 0
5000 < y < 8000  outflow + updraft decel          → sink on axis
8000 < y < 9000  outflow only                     → source on axis
y > 9000       all storm envelopes off            → 0
```

The `500 m` gap `(4500, 5000)` has no horizontal mass-like term at
all. That alone is enough to reject “inflow feeds updraft feeds
outflow” as a continuity statement.

---

## 7. Spatial map (representative chimney)

On-axis `∇ · V` (`s⁻¹`), live fixture. Endpoint convention:
`F'(0) = F'(8000) = 0`. Interior `y → 0⁺` is `+0.00928`;
interior `y → 8000⁻` is `−0.00825`.

| `y` (m) | `∇ · V` | Dominant term | Sign |
| --- | --- | --- | --- |
| −500 | −0.00250 | inflow plateau | sink |
| 0 (endpoint) | −0.00250 | inflow; `F'` taken 0 | sink |
| 500 | +0.00905 | updraft accel | source |
| 1000 | +0.00838 | updraft accel | source |
| 1500 | +0.00730 | updraft accel | source |
| 3000 | +0.00274 | updraft − taper inflow | source |
| 3800 | +0.000028 | accidental near-cancel | ≈ 0 |
| 4000 | −0.00065 | remnant inflow taper | weak sink |
| 4500 | −0.00230 | updraft decel only | sink |
| 5000 (endpoint) | −0.00451 | updraft decel; `G_out = 0` | sink |
| 7000 | −0.00588 | decel > outflow source | sink |
| 7990 | −0.00822 | near-top decel | sink |
| 8000 (endpoint) | +0.00354 | outflow only | source |
| 8500 | +0.00191 | outflow | source |
| 9000 | 0 | all off | 0 |

Off-axis, `E(r)` damps every term. The `(2 − r²/σ²)` factor
weakens horizontal contributions toward `r = σ` and **flips their
sign** beyond `r = σ √2`.

Compact total-`∇ · V` (`s⁻¹`) at selected `r/σ`:

| `y` | 0 | 0.5 | 1.0 | 1.5 | 2.0 |
| --- | --- | --- | --- | --- | --- |
| 1000 | +8.38e-3 | +7.68e-3 | +5.84e-3 | +3.64e-3 | +1.81e-3 |
| 3800 | +2.8e-5 | +1.2e-4 | +2.9e-4 | +3.4e-4 | +2.5e-4 |
| 4000 | −6.5e-4 | −5.0e-4 | −2.0e-4 | +2.6e-5 | +8.8e-5 |
| 7000 | −5.88e-3 | −5.74e-3 | −5.09e-3 | −3.74e-3 | −2.15e-3 |
| 8000 | +3.54e-3 | +2.73e-3 | +1.07e-3 | −1.4e-4 | −4.8e-4 |

S1 starts at `r/σ = 1.0`. S2 starts at `r/σ = 1.5`, **outside**
`σ √2`, so its seed-layer inflow contribution is a weak **source**
(`+1.02e-4 s⁻¹`) while the velocity is still inward. That is the
documented Gaussian-tail identity (`17` §19.1), not outflow.

---

## 8. Accidental near-cancellation

Places where `|∇ · V| < 2×10⁻⁴ s⁻¹` (≲ 2% of `W0 π / H_up`):

1. **Thin sheet near `y ≈ 3800 m`** on the inner chimney, where
   decaying updraft acceleration crosses remnant inflow taper.
   On axis the zero is between `3800` and `3825 m`. Width is a few
   hundred metres. At `y = 3000` the same column is already
   `+0.00274`; at `y = 4500` it is `−0.00230`.
2. **The cylinder `r = σ √2`** in layers where the only nonzero
   term is horizontal (`y ≤ 0`, and outflow above `8000 m`),
   because `2 − r²/σ² = 0` there by construction.
3. **Far Gaussian tail / above `9000 m`**, where all envelopes are
   off or `E → 0`. That is “no storm,” not a balanced storm.

None of these is a continuity closure. (1) is a 1-D coincidence in
`y` at the DEMO numbers. (2) is a radial node of this Gaussian
family, present even in isolated inflow/outflow. (3) is the
exterior.

Do **not** cite the `y ≈ 3800 m` sheet, or S1’s pathline crossing
near there, as evidence that the laboratory is approximately
divergence-free.

---

## 9. Divergence along S1 / S2

Euler `dt = 0.1 s`, `StormRelativeLaboratory`, live composite.
Analytic `∇ · V` sampled on the integrated path. `08` letter-pass
heights match (`S1 max y ≈ 7044 m`, outflow entry `t ≈ 201 s`;
`S2` outflow entry `t ≈ 252 s`).

### S1 `(0, 1000, 4000)`

| `t` (s) | `y` (m) | `r` (m) | `∇ · V` | notes |
| --- | --- | --- | --- | --- |
| 0 | 1000 | 4000 | +5.84e-3 | seed; updraft source dominates |
| 50 | 1469 | 2994 | +6.10e-3 | peak source on this path |
| 100 | 2301 | 1735 | +4.75e-3 | still source |
| 150 | 3589 | 917 | +7.57e-4 | approaching the thin sheet |
| 165 | 4024 | 1014 | −6.86e-4 | sign flip near updraft mid |
| 201 | 5016 | 1747 | −4.11e-3 | outflow entry; still a sink |
| 250 | 6013 | 3174 | −4.33e-3 | overlap: decel > outflow |
| 400 | 6961 | 8093 | −2.07e-3 | beyond `σ √2`; outflow tail sink |
| 800 | 7044 | 19609 | ≈ 0 | far exterior |

```text
min ∇ · V     = −4.37e-3 s⁻¹
max ∇ · V     = +6.13e-3 s⁻¹
time in source (0–800 s) ≈ 158 s
time in sink             ≈ 642 s
∫ ∇ · V dt               ≈ −0.25
exp(∫ ∇ · V dt)          ≈ 0.78
```

A material volume following S1 would expand in the lower chimney
and then compress more, ending ~22% smaller after 800 s. That is
**not** a small residual, and it is **not** visible on a point
tracer.

### S2 `(0, 1000, 6000)`

| `t` (s) | `y` (m) | `r` (m) | `∇ · V` | notes |
| --- | --- | --- | --- | --- |
| 0 | 1000 | 6000 | +3.64e-3 | seed; inflow tail is a weak source |
| 100 | 1671 | 3942 | +4.96e-3 | now inside `σ √2`; inflow a sink |
| 176 | 3008 | 2033 | +2.58e-3 | deep-core entry |
| 214 | 4016 | 1621 | −6.0e-4 | sign flip |
| 252 | 5022 | 2035 | −3.98e-3 | outflow entry |
| 800 | 7000 | 18270 | ≈ 0 | far exterior |

```text
min ∇ · V     = −4.28e-3 s⁻¹
max ∇ · V     = +4.96e-3 s⁻¹
∫ ∇ · V dt               ≈ −0.15
exp(∫ ∇ · V dt)          ≈ 0.86
```

Both pathlines do the `04` kinematic sequence **while** occupying
a source, then a sink, of order the stack’s own strain. Reachability
is not a mass proof.

---

## 10. Answers

**How large is the residual relative to characteristic velocity
gradients?** Same order. On-axis lower chimney
`∇ · V ~ 0.008 s⁻¹` versus max updraft strain `0.012 s⁻¹` and
inflow scale `0.0025 s⁻¹`. Upper overlap `~ −0.005` to `−0.008`
versus outflow scale `0.005`. Pathwise `|∇ · V|` peaks at
`6×10⁻³ s⁻¹` on S1.

**Where is it positive / negative?** Source in the accelerating
updraft layer (especially `0 < y ≲ 3800 m` inside `~2σ`). Sink
from there through the gap and the outflow–updraft overlap. Source
again on the axis in the outflow-only cap `8000 < y < 9000`. Sink
underground (`y < 0`) from uncompensated inflow. Far field → 0.

**Are there approximately divergence-free regions by accident?**
Yes, and only by accident: a thin mid-level sheet, the
`r = σ √2` node of isolated horizontal operands, and the exterior.
They are local. They are not a budget.

**May the current story pathlines continue as a kinematic exhibit?**
Yes. S1/S2 remain integrals of the prescribed storm-relative `V`.
`08` §6 copy remains the allowed sentence. Two point tracers with
trails do not display `∇ · V`.

**Forbidden claims** (reaffirmed, now with numbers):

- mass-consistent / divergence-free laboratory;
- same-air-mass circulation;
- inflow is the source of the updraft mass, outflow is that mass
  leaving;
- the `y ≈ 3800 m` sheet, or S1’s sign flip there, is a continuity
  closure;
- `∇ · V_rot = 0` means the storm is non-divergent;
- pathline reachability is a mass proof;
- a future downdraft is the return of this air.

**What may a future prescribed downdraft do without pretending to
be a mass-return branch?** Exist as a sixth independent kinematic
operand, with its own envelope, own `∇ · V`, and copy that names it
as prescribed downward motion in a chosen window. It may be seeded
or not. It must not be parameter-tied to `W0`, `A_in`, or `A_out`
by a continuity equation. It must not be described as the air that
rose along S1/S2.

**Does adding that downdraft make the continuity debt RED?** Not
by mere existence. It becomes RED if the downdraft is sold as the
return branch of the same mass, if copy claims a closed cell, or if
teaching states that the laboratory sum conserves mass
(`02` §6). Honest prescribed downdraft keeps the debt YELLOW and
makes the visual overclaim cheaper — which is why anti-claims are
mandatory, not optional.

**When is a solver / coupling actually required?** When the
teaching goal is mass-consistent circulation: same air, closed
cell, or a residual that is required to be small compared with the
mechanism strains. That is a different model family (verdict C).
It is not required to keep the current kinematic story.

---

## 11. Policy lock-in

- Do not add a production `divergence()` API.
- Do not retune live strengths to shrink `∇ · V`.
- Do not treat DEMO shared `σ` / centers as a coupling that almost
  conserves mass. The fixture makes the identity in §4 prettier,
  not truer.
- Story pathlines stay authorized as a kinematic exhibit.
- DiagnosticProbes remain a separate job; this audit does not
  change pedagogy.
- Ground/underground remains a separate YELLOW (`y < 0` is a
  quantified uncompensated sink). This audit does not set a ground
  plane.
- Next mechanism is still not a solver.

---

## 12. Compact lock-in

```text
verdict:              A
quantity:             kinematic ∇ · V of the live sum; no ρ, no p
identity:             ∇ · V = ∇ · V_up + ∇ · V_in + ∇ · V_out
env / rotation / C:   contribute 0
residual size:        O(W0 π / H_up), not ε
source:               lower chimney (updraft acceleration)
sink:                 mid/upper chimney + gap + overlap
accidental ≈0:        y ≈ 3800 m sheet; r = σ√2 nodes; exterior
                      — not continuity
S1 ∫div dt:           ≈ −0.25  (material stretch ~0.78)
S2 ∫div dt:           ≈ −0.15  (material stretch ~0.86)
story pathlines:      remain a valid kinematic exhibit
forbidden:            mass circuit, same air, capture, closed cell
downdraft later:      independent operand + anti-claims
                      existence ≠ RED; “return of this air” = RED
solver when:          teaching goal is mass-consistent circulation
retune:               none
production:           none
```

---

## 13. STOP

This audit does not start a downdraft, a solver, density, pressure,
tilting/stretching, or a translating storm.

Do not shrink the residual by changing DEMO numbers.
Do not advertise the mid-level sheet as balance.
Do not read S1/S2 trails as a mass circuit.
