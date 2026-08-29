# Vorticity-Budget Honesty and Trajectory-Diagnostic Boundary

**Status:** RESEARCH DECISION COMPLETE / ACCEPTED AFTER ADVERSARIAL
REVIEW / NOT ARCHITECTURE / NOT IMPLEMENTATION AUTHORIZATION
**Date:** 2026-08-29
**Checkpoint:** `2eb7516` (decision); amendment on `c21bafc`
**Final adversarial verdict:** ACCEPT WITH NON-BLOCKING NOTES
**Blocking findings:** none
**Not:** this file is not Architecture N. Not production physics,
diagnostic API, UI, Analysis live wiring, `V_total` change, T1
change, Candidate A change, tracer-integration change.

Successor visualization architecture for class B T1 along a
recorded path (V1 explorer contracts only; this research
file remains the taxonomy / honesty SoT):

```text
docs/architecture/62-trajectory-tilting-explorer-v1.md
```

```text
RESEARCH SoT
  ≠ physics 22 / 23
  ≠ architecture 26 / 27 / 28 / 29 / 30 / 52 / 60 / 61 / 62
  ≠ implementation order
```

This file records the **adjudicated** result of two independent
reviews of the same laboratory:

```text
input A  docs/reviews/2026-08-29-trajectory-history-diagnostics-adversarial-review.md
         adversarial review; NOT project SoT; no decision accepted
         by that file

input B  independent vorticity-budget honesty audit, 2026-08-29,
         against the same checkpoint; replication / correction
         of A; not itself this SoT
```

Adjudication rule used here:

```text
CONFIRMED              accepted
PARTIALLY CONFIRMED    accepted only in the corrected wording below
REJECTED               must not enter this SoT as a claim
OPEN                   remains OPEN; not an architecture decision
```

This document does **not** authorize implementation. Existing
physics and architecture SoT remain in force unless a later
architecture document explicitly amends them.

---

## 1. Why this question was reopened

Physics `22` §21 already states that the laboratory does not
integrate `T_tilt,y`. Architecture `27` §7.1 already names
T1×Δt a fake spin-up. Architecture `30` locks class A:
prescribed kinematic laboratory, no prognostic `ω`, no `ω → V`.

The question was reopened because trajectory-parameterized
rotational diagnostics (`T1(P(t))`, `∫T1 dt`, `ω_y(P(t))`) look
like evolution. That pressure comes from product language, not
from a hole in the T1 definition.

This file answers the scientific boundary. It does not reopen
T1, Candidate A, `V_total`, or class A.

---

## 2. Project class — reaffirmed

**CURRENT FACT**, matching `30`:

```text
Supercell Explorer V1
  = prescribed kinematic storm-relative laboratory
```

It is **not**:

- a dynamic storm simulation;
- a forecast;
- a reconstruction of observed 3D storm wind;
- a parcel-vorticity prognostic model;
- LES / CFD;
- observed storm evolution.

All seven live velocity operands are Eulerian-steady.
Laboratory / runtime time exists for advection and recorded
paths. **Storm evolution time does not exist.**

Sampling a steady field along a recorded path must not be
described as storm evolution.

---

## 3. Standing decisions this file does not reopen

```text
physics 22 / architecture 26     T1 definition and ownership
physics 23 / architecture 28     ω_y,current / Candidate A
architecture 27                  post-T1 direction; fake spin-up
architecture 29                  Dω_y,current/Dt = V·∇ω_y,current
                                 for the frozen field
architecture 30                  class A; tracers are not vortex tubes
architecture 10                  continuity YELLOW
architecture 11                  ground is tracer lifecycle, not a
                                 VelocityField domain
architecture 52                  historical path probe; recompute;
                                 recorded simulationTime
architecture 60 / 61             Analysis support; Analysis T1 sibling;
                                 live rewiring not authorized
physics 06                       environmental ω_h is finite-layer,
                                 horizontally homogeneous sounding
```

---

## 4. Four-class taxonomy

Normative research result. These classes must not be collapsed.

### A. Eulerian field property

Value determined by the field at a point (and laboratory `t`,
which current DEMO operands ignore).

Examples: `V_total(P)`, `T1(P)`, `ω_y,current(P)`.

Seed-independent at a given `(P, t)`.

### B. Eulerian field sampled along a recorded path

Time-parameterized lookup of an existing Eulerian field:

```text
T1(P(t))
ω_y,current(P(t))
```

This is **not** prognostic parcel state. The values at a point
are still class A. The series is class A reparameterized by a
path.

### C. Lagrangian path functional

A number that depends on a path and an interval.

Examples: travel time; sign-residence; min / max exposure;
mathematically also `∫ T1 dt`.

Dependence on seed / `t0` is admissible **for this class**.
The quantity must not be presented as a class A field property
or as class D state.

### D. Prognostic parcel state

Independently evolved parcel `ω_y(t)`.

**Absent** in the current laboratory.

Do not mix B and D.
Do not mix C and D: an accumulated / path-functional quantity
is especially easy to misread as evolved parcel state.

---

## 5. Current T1 — exact status

### 5.1 Definition (unchanged)

```text
T1 = T_tilt,y = ω_h,environmental · ∇_h Vy,updraft
```

- environmental `ω_h`: finite-layer shear of the sounding
  (`06`), mapped to world `(ω_x, ω_z) = (ω_e, −ω_n)`;
- `∇_h Vy`: analytic gradient of
  `VerticalEnvelopeUpdraftField` only;
- Analysis sibling `queryAnalysisTiltingTendencyAt` changes
  provenance / support of the environmental operand, not the
  physical identity (`61`).

T1 is an instantaneous Eulerian diagnostic, units `s⁻²`.
It is not `Dω_y/Dt`, not `ω_y`, not SRH, not prescribed `Ω`.

### 5.2 Adjudicated field membership

T1 is **not** the full-field vertical tilting term of
`V_total`.

Strictly inside a piecewise-linear environmental segment,
**excluding knots**, T1 **is** the exact vertical tilting
term of the reduced two-operand field

```text
V_env + V_updraft
```

or the storm-relative equivalent

```text
V_red = (V_env − C) + V_updraft
```

because:

- constant storm motion `C` does not change curl or gradients;
- self-tilting of the `Vy`-only updraft operand is identically
  zero:

```text
ω_x,up = −∂Vy_up/∂z
ω_z,up =  ∂Vy_up/∂x
ω_h,up · ∇_h Vy_up = 0
```

The exactness claim does **not** extend to sounding knots.
Source T1 outside the profile is a defined field continuation
(`26` §6.2). That continuation is not a reason to expand the
Analysis / interior-PWL claim.

**Correct status:**

T1 is an exact tilting diagnostic of the reduced
environment + prescribed-updraft mechanism, used as an
isolated pedagogical diagnostic inside the richer
seven-operand `V_total` laboratory.

It is not `Dω_y/Dt` and not a full `V_total` budget term.

Do not say “T1 is not a tilting term of any field.”
Do not say “T1 is an arbitrary mixed product.”

One reason a T1 integral along a recorded path is not a
`V_total` budget contribution is trajectory mismatch: the
tracer follows `V_total`, not `V_red`.

That is not the only reason. On `V_red` itself, strictly
inside a PWL environmental segment:

```text
Vx_env = Vx_env(y),   Vz_env = Vz_env(y)
V_updraft = (0, Vy_up, 0)

ω_y,red ≡ 0
```

Therefore

```text
Dω_y,red / Dt ≡ 0
STRETCH_Y,red = 0
ω_y,red (∇ · V_red) = 0
```

and the kinematic identity of §9 gives, pointwise where the
identity is defined:

```text
0 = T1 + R_y,red
R_y,red = −T1
```

Even in the reduced field for which T1 is the exact vertical
tilting term, T1 itself is **not** the material tendency of
vertical vorticity. Integrating T1 does not become a licence
for `Δω_y` after the trajectory mismatch is removed.

This strengthens the already accepted `I_tilt` decision. It
does not open new `R_y` product research.

---

## 6. Full-field `TILT_Y,total`

Research derivation, not a production diagnostic.

```text
TILT_Y,total
  = ω_x,total ∂Vy,total/∂x
  + ω_z,total ∂Vy,total/∂z
```

where

```text
ω_total = curl(V_total)
Vy,total = Vy_updraft + Vy_downdraft     (current stack;
                                         other operands have Vy ≡ 0)
```

Curl is linear, so the product expands into cross-operand
terms. T1 is only the env × updraft component of that
expansion.

Compact operand inventory (current stack):

| `ω_h` source | `∇_h Vy_up` | `∇_h Vy_down` |
| --- | --- | --- |
| environmental (sounding shear) | **= T1** strictly inside a PWL segment, excluding knots | may be nonzero wherever `∇_h Vy_down ≠ 0`; offset is not required |
| updraft | **0** identically | may be nonzero (distinct axes) |
| downdraft | may be nonzero | **0** identically |
| rotation `ω_h` from `G'(y)` | may be nonzero where `G' ≠ 0` | may be nonzero where `G' ≠ 0` |
| radial limbs `ω_h` from `G'(y)` | 0 on inflow plateau (`G' = 0`); may be nonzero in tapers | likewise |

Offset of the DEMO downdraft is **not** the reason env ×
downdraft can be nonzero. Distinct vs coincident axes matter
for the updraft ↔ downdraft **cross** terms, not for
`ω_h,env · ∇_h Vy_down`.

Analytic zeros also include: `∇_h Vy` from any `Vy ≡ 0`
operand; rotation `ω_h` at rotation mid-layer (`G' = 0`) and
outside the rotation envelope; far field.

**Status:** RESEARCH-DERIVED / NOT IMPLEMENTED AS A NAMED
DIAGNOSTIC.

This file does not create a `TILT_Y,total` API.

---

## 7. Opposite-sign evidence

**INDICATIVE / UNREPRODUCED RESEARCH SANITY CHECK.**
Not production validation. Not a universal topology claim.

A disposable DEMO calculation (central finite difference
`h = 5 m`; existing `sample()` APIs) found representative
interior points where T1 and `TILT_Y,total` had opposite
signs. The script was not retained and the numbers are not a
reproducible validation authority. Central FD at `h = 5 m`
must not be used as knot- or lid-boundary validation
evidence.

| Point (world m) | T1 (s⁻²) | `TILT_Y,total` (s⁻²) |
| --- | ---: | ---: |
| updraft flank `(2000, 2500, −1500)` | −1.28×10⁻⁵ | +6.64×10⁻⁷ |
| downdraft flank `(6500, 1500, 500)` | +1.86×10⁻⁵ | −5.70×10⁻⁵ |
| inflow plateau `(2000, 800, 0)` | +1.02×10⁻⁵ | +6.43×10⁻⁵ (same sign; factor ~6) |

The qualitative possibility of a local opposite sign follows
from the multi-term expansion of `TILT_Y,total`. This table
does not establish a universal couple topology.

Spatial / couple-topology comparison remains **OPEN**.

---

## 8. Current `ω_y,current`

### 8.1 CURRENT STACK IDENTITY

```text
ω_y(V_total) = ω_y(V_rotation)
```

on the live seven-operand stack. Not a universal identity.

Reasons, from locked formulas (`23`):

- horizontally homogeneous environment (and constant `C`) →
  `ω_y = 0`;
- `Vy`-only updraft / downdraft → `ω_y = 0`;
- current purely radial limbs → mixed derivatives cancel →
  `ω_y = 0`;
- prescribed rotation supplies the current vertical vorticity:

```text
ω_y^Ω = 2 Ω G E (1 − r² / (2 σ²))
```

The identity fails if a later operand carries azimuthal flow
or the environment is no longer horizontally homogeneous.

**Implementation caution:** `DiagnosticVerticalVorticity`
currently relies on the CURRENT STACK IDENTITY. It evaluates
the rotation analytic identity rather than curling `V_total`
at runtime. If a future operand contributes vertical
vorticity, the diagnostic contract and implementation must
be revisited. This file does not change that code.

Finite-difference checks on DEMO agreed to ~10⁻⁹ as an
indicative sanity check of the same unretained disposable
calculation as §7; not production validation.

### 8.2 Along a recorded path

```text
ω_y,current(P(t))
  = Eulerian prescribed vertical-vorticity field
    sampled along the path
```

This is taxonomy class B, not class D.

If the curve rises when a tracer enters the rotation core,
that is entry into prescribed `Ω`, not evidence that T1
generated the growth.

```text
causal arrow  T1 → ω_y,current     REJECTED
```

---

## 9. Kinematic identity

Two different accelerations must not share one unmarked
symbol.

```text
a_kin  :=  ∂V/∂t + (V·∇)V
           material acceleration implied by V itself
```

`a_kin` is **not** the dynamic / force acceleration of an
atmospheric governing equation (`−∇p/ρ`, viscous stress,
buoyancy, …). Physics `22` §7.1 discusses that dynamic
object. This file uses `a_kin` only.

Vector identity (Cartesian, right-handed project axes):

```text
Dω/Dt = (ω·∇)V − ω(∇·V) + curl(a_kin)
```

Vertical decomposition:

```text
Dω_y/Dt
  = TILT_Y,total
  + STRETCH_Y
  − ω_y (∇·V)
  + R_y
```

with

```text
TILT_Y,total  = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
STRETCH_Y     = ω_y ∂Vy/∂y
R_y           := [curl(a_kin)]_y
```

This is a **kinematic identity / algebraic decomposition**.
`R_y` is not an independent atmospheric source term.
Including `R_y` makes the decomposition identically closed.
That is **not** an independent dynamic closure test.

For the current Eulerian-steady laboratory, the preferred
primary identity along a material path is the chain rule,
already recorded in architecture `29` §2.2:

```text
d/dt [ω_y(P(t))]  =  (V·∇)ω_y
```

A disposable DEMO check (Euler path, trapezoid quadrature;
same unretained script as §7) matched `Δω_y` to
`∫ (V·∇)ω_y dt` with residual `O(dt)`, as expected for
forward Euler. The decomposed form with `R_y` matched the
chain rule to ~10⁻¹² pointwise. That is an indicative sign
check, not production validation. It does not add dynamics.

---

## 10. `R_y` — prevent overclaim

Established:

- `R_y` is computable from prescribed `V_total` without new
  physics;
- `R_y` is generally nonzero on DEMO (same order as tilting /
  stretching at representative interior points).

Admissible reading:

- kinematic remainder;
- remainder between `TILT_Y,total + STRETCH_Y − ω_y(∇·V)`
  and the chain-rule material rate.

Not authorized by this file, and not to be used without
separate research:

- baroclinic source;
- atmospheric closure residual;
- measured missing physics;
- quantitative atmospheric inconsistency metric.

Narrow mathematical fact, not a product claim:
`curl(a_kin) ≠ 0` means `a_kin` is not a gradient /
conservative vector field (on the relevant simply-connected
local domain). That excludes the special idealized class in
which this curl vanishes. It is not an atmospheric
inconsistency score.

---

## 11. Divergence

```text
∇ · V_total  ≠  0
```

on the current stack. Architecture `10` already records this
as **YELLOW**, a known limitation of independently prescribed
operands, not a newly discovered bug.

Therefore `−ω_y (∇·V)` cannot be silently discarded.
The incompressible reduction `Dω/Dt = (ω·∇)V` is **not** a
governing equation of this laboratory.

Isolated rotation has `∇·V_rot = 0`; that does not upgrade
the seven-operand sum.

---

## 12. `∫T1 dt` — adjudicated verdict

Define

```text
I_tilt(t0, t1)  :=  ∫_{t0}^{t1} T1(P(t), t) dt
```

`I_tilt` is mathematically a legitimate **class C**
Lagrangian path functional. Units `s⁻¹` by construction
(`∫ s⁻² dt`), not because it is vorticity.

It is **not**:

- `Δω_y`;
- vorticity gained;
- parcel spin-up;
- a full `V_total` budget contribution;
- evidence of storm evolution.

Reasons (each sufficient against those readings):

1. T1 is not the full `V_total` tilting term.
2. T1 is not `Dω_y/Dt`, including on `V_red` where
   `R_y,red = −T1` (§5.2).
3. The material-rate decomposition contains other nonzero
   terms (`STRETCH_Y`, `−ω_y div V`, `R_y`, and the missing
   cross-operand tilting).
4. The shared `s⁻¹` unit family with `ω_y` is a high
   epistemic-confusion risk (`23` §22 already warns that the
   same unit family is not interchangeability).
5. Source T1 outside the sounding is a defined `0`
   (`26` §6.2). Analysis `OUT_OF_DOMAIN` has **no** numeric
   T1 (`61` §9.2). Accumulation silently converts those
   different semantics into “no tilting.”

Seed / `t0` dependence is **not** a reason to call `I_tilt`
mathematically illegitimate. It is a normal property of a
path functional. It **is** a reason not to present `I_tilt`
as a class A laboratory field property at `(P, t)`.

**Current research / product decision:**

```text
DO NOT IMPLEMENT / DO NOT PRESENT I_tilt.
```

If a later research slice ever reopens a path-functional
object, conditions include all of:

- explicit path-functional semantics;
- no `ω` in the name;
- no causal / evolution language;
- explicit `t0` / interval;
- seed / path identity where relevant;
- Analysis support record for the interval;
- no stitching across OOD.

`DO NOT PRESENT` also covers monotonic transforms, normalized
indices, or renamed exposure scores that keep the same
misleading causal / spin-up interpretation. Honest path
functionals that do not carry that interpretation remain
admissible as class C.

Physics `22` §21 and architecture `27` §7.1 remain in force.

---

## 13. NO FAKE EVOLUTION

**Status:** RESEARCH DECISION / candidate project invariant.

This file does not rewrite architecture documents.

```text
NO FAKE EVOLUTION

1. BUDGET CONSISTENCY
   An integrated tendency may be presented as a contribution
   to the change of Q only if the integrand is a term of the
   budget of that same Q, of the same field, along a material
   path of that same field.
   Membership of the integrand in that budget is necessary,
   not sufficient, for reading an isolated integral as the
   actual change of Q. If an isolated budget contribution is
   shown, the other nonzero terms of the same budget must
   remain explicitly unaccounted / disclosed. This is not a
   requirement to visualize the full budget.
   Consequence: “T1 is an exact term ⇒ ∫T1 = Δω” is false
   even for the reduced field.

2. MATERIALITY
   D/Dt and budget integration require a material path of
   that field.
   A ground-clamped / deactivated terminal segment must not
   silently count as that path.
   Eulerian lookup at a recorded point remains admissible.

3. NO CONVENIENCE CLOSURE
   A missing term may not be zeroed to produce an evolution
   story.
   An initial condition may not be chosen for convenience.
   A named isolated diagnostic product, such as T1, may be a
   legitimate snapshot diagnostic without being a full
   budget. Integrating it does not make it a full budget.

COROLLARY 1
   Sampling a steady Eulerian field along a recorded path is
   not prognostic evolution.

COROLLARY 2
   A path functional must not be presented as an Eulerian
   field property at (P, t).
   Path dependence itself does not invalidate a Lagrangian
   diagnostic.
```

---

## 14. Materiality boundary

**Implementation fact** (`Simulation` + Euler +
`AtmosphericTracerDomain`):

The active tracer lane approximates a material path of
`V_total` by forward Euler at the scenario timestep
(`dt = 0.1 s` in DEMO). `timeScale` changes how many fixed
steps are consumed per frame; it does not change `dt`.

A ground-crossing accepted step may be modified / clamped to
`y = 0`, after which the tracer deactivates. There is no
sliding along the ground.

On that crossing, the proposed Euler endpoint corresponds to
`t_n + dt`, but domain acceptance linearly interpolates
position to the plane crossing:

```text
P_clamp = P(t_n + α dt),    0 < α < 1
active  = false
```

Current `Simulation` still:

- increments `particle.age` by the full `dt`;
- advances the clock by the full `dt`;
- records the terminal `TracerPathHistory` sample with
  `simulationTime = t_n + dt`.

The terminal recorded pair `(position, simulationTime)` is
therefore not a time-consistent trajectory sample: position
corresponds approximately to crossing time `t_n + α dt`,
timestamp to post-step `t_n + dt`.

For **current** Eulerian-steady fields this does not change
sampled diagnostics, because those fields ignore `t`. For a
future time-dependent field it can matter.

```text
pre-impact active path     discrete material-path approximation
terminal clamped sample    not an ordinary Euler endpoint;
                           position/time pair not consistent
post-impact                no material trajectory exists
```

This is a **blocker** for budget integration through impact.
It is **not** a blocker for Eulerian field lookup at the
recorded terminal point (on current steady fields).

Materiality policy for future trajectory diagnostics:
**OPEN** / requires architecture. Not decided here. That
future policy must decide both:

- materiality of the clamped segment;
- terminal timestamp consistency.

Recorded path samples store `{position, simulationTime}`.
Time is not reconstructed from index (`52` §3). Stride-1 is
the live Explore / DEMO case; an off-stride terminal sample
may still be appended.

---

## 15. Time axes

Keep these distinct:

| Axis | Role |
| --- | --- |
| wall / render time | rAF; scaled by `timeScale`; not physical |
| laboratory simulation time | `SimulationClock`; trajectory coordinate |
| elapsed tracer time | derived: sample time − first sample time of that lane |
| sounding `validTime` | column identity metadata (`48`) |
| ESC measurement `TIME` | source-measurement / FIR-support provenance (`59`) |
| storm evolution time | **absent** |

A new time variable is **not** required for class B
trajectory diagnostics. `simulationTime` is already recorded.

ESC TIME is a measurement / filter provenance coordinate.
Laboratory time is the trajectory coordinate.
Analysis support reaches a trajectory by **HEIGHT** query
(`60` §5), not by mixing those times.

---

## 16. Analysis support along a path

Established point statuses (`60`, `61`):

```text
FULL_SUPPORT
BOUNDARY_CONDITIONED
OUT_OF_DOMAIN
COLUMN_UNAVAILABLE
```

Established implications along a recorded path:

- per-point `FULL_SUPPORT` can occur again after a
  `BOUNDARY_CONDITIONED` point (height left a filter edge);
- an interval that contains `BOUNDARY_CONDITIONED` cannot
  automatically be called `FULL_SUPPORT`;
- `OUT_OF_DOMAIN` means numeric Analysis T1 is absent at
  that point; do not use Source T1 `0` as a substitute;
- a time series may contain gaps;
- accumulation must not be silently stitched across an OOD
  gap;
- `COLUMN_UNAVAILABLE` means there is no Analysis series;
  Source is a different object.

**OPEN** (not decided here; `60` / `61` unchanged):

- trajectory-time interval support semantics (not the same
  object as Architecture `60` HEIGHT-layer interval / layer
  support);
- knot-boundary FULL / BOUNDARY flicker policy.

---

## 17. Environmental `ω_h` semantics

Environmental `ω_h` is a sounding-derived finite-layer
horizontal-vorticity diagnostic of a horizontally homogeneous
profile (`06`). It is not local 3D curl of `V_total` and not
parcel state.

Admissible along-path wording:

```text
environmental horizontal vorticity at the altitude currently
occupied by the tracer
```

Forbidden wording:

```text
the tracer's horizontal vorticity
the parcel's horizontal vorticity
```

Parcel prognostic `ω_h` state does not exist.

---

## 18. Visual / product consequences — research only

This section classifies scientific legitimacy. It does not
design UI and does not authorize a visualization slice.

**Safe direction after a later architecture SoT** (class B
lookups and class C statistics that do not claim `ω`):

- `T1(P(t))` history;
- linked path / history cursor;
- trajectory colored by T1 (diverging scale; OOD as a gap,
  not zero);
- sign-residence statistics (seconds);
- decomposition of environmental vs prescribed operands;
- Analysis support gaps / bands.

`T1(P(t))` history and a trajectory colored by T1 show:

```text
the reduced environment × prescribed-updraft T1 diagnostic
sampled along the recorded path
```

They must not be named or framed as:

- “where `V_total` is tilting vorticity”;
- “full-field tilting”;
- “where the parcel gains vertical vorticity”.

T1 and `TILT_Y,total` can differ in magnitude and sign, and
`TILT_Y,total` itself is still not the full material
tendency. Class B T1 history remains scientifically
legitimate as that reduced-field diagnostic.

T1 is a **scalar**. It must not be drawn as a vector.
`∇_h Vy` is a genuine local vector. Environmental `ω_h` is
horizontally homogeneous: a glyph belongs to a height layer,
not to “the parcel’s local tube.”

### Causal-perception risk — `T1(P(t))` beside `ω_y,current(P(t))`

Juxtaposing those two series is **not** automatically safe
because a disclaimer is present.

On DEMO the updraft and rotation are co-centered. Radial
symmetry gives `∇_h Vy,updraft = 0` on the updraft axis, so
T1 → 0 there, while prescribed `ω_y^Ω` is largest near the
rotation axis / core. Incoming trajectories can therefore
show a visual lead-lag: T1 peaks on a flank earlier,
`ω_y,current` peaks later nearer the core.

That lead-lag is **not** causal evidence.

A later architecture SoT must not treat “two curves +
disclaimer” as a complete solution. It needs an explicit
perceptual / causal design treatment. That treatment is not
designed here.

`ω_y,current(P(t))` history remains scientifically
admissible as a class B lookup **with** the anti-causal
claim that growth is prescribed `Ω`, not T1. The risk is
the juxtaposition, not the isolated `ω_y` series.

**Research first** (no API, no UI):

- named `TILT_Y,total`;
- comparison T1 vs `TILT_Y,total`;
- topology / sign maps;
- material-line vs local-`ω` angle experiment.

**Do not present:**

- `∫T1` as `Δω`;
- prognostic parcel `ω_y`;
- T1-driven spin-up;
- a vortex tube tracked by tracers;
- horizontal rollers implied by horizontally homogeneous
  environmental `ω_h`;
- a tornado-like column;
- a storm-evolution timeline.

---

## 19. Material line vs vortex line

A passive material line may be advected by `V_total` and used
to show flow deformation.

It is **not** thereby a vortex line.

Material preservation of vortex lines requires conditions
this laboratory does not satisfy (`∇·V ≠ 0`;
`curl(a_kin)` generally ≠ 0; no barotropic inviscid closure).

Architecture `30` §13 remains valid:

```text
tracers are not vortex tubes
```

A quantitative angle-divergence experiment between an
advected material line initially parallel to `ω` and the
local `ω` is **OPEN RESEARCH**. This file does not implement
it.

---

## 20. Documentation risks (debt; not fixed here)

| Location | Risk | Class |
| --- | --- | --- |
| `CONCEPT.md` §2 “vorticity … changes orientation, and becomes organized” | implies a process class A cannot answer | follow-up documentation debt |
| `CONCEPT.md` §6 “play the simulation” / “move between timesteps” | can be read as storm evolution | follow-up documentation debt |
| physics `22` unmarked `a` | collision between dynamic force acceleration and `a_kin` | follow-up documentation debt |
| T1 “tends to increase `ω_y`” (`22` §8.2) | needs isolated-term scope; not `Dω_y/Dt` | follow-up documentation debt |
| physics `22` T1 field membership | this SoT records T1 exactness for reduced `(V_env − C) + V_updraft` strictly inside PWL segments, excluding knots; physics `22` does not yet contain that fact | follow-up documentation alignment; **not** amended here |
| ground-clamp vs material `D/Dt` | limitation not visible in diagnostic docs | follow-up documentation debt |

`CONCEPT.md` is not rewritten in this slice.

---

## 21. OPEN research questions

Not resolved here. Not architecture decisions.

1. Spatial / topological comparison of T1 vs `TILT_Y,total`.
2. Whether `TILT_Y,total` deserves a named production
   diagnostic.
3. Analysis **trajectory-time** interval support semantics.
   Architecture `60` already has interval / layer support
   semantics for a HEIGHT-layer object. The OPEN item here is
   specifically a trajectory-time interval, which may be
   non-monotone in height, re-enter and leave support
   regions, and cross the same height layer more than once.
   “Trajectory interval support OPEN” does not mean
   “Architecture `60` has no interval semantics.”
4. FULL / BOUNDARY flicker policy along a trajectory.
5. Materiality policy for terminal clamped samples, including
   terminal timestamp consistency (`t_n + dt` vs
   `t_n + α dt`).
6. Material-line vs local-vorticity angle experiment.
7. Whether `R_y` has any useful product or research role
   beyond kinematic remainder. `R_y,red = −T1` on `V_red`
   is already used in §5.2; it does not reopen this item.
8. Exact future visualization architecture for class B
   series, including the causal-perception risk of
   juxtaposing `T1(P(t))` with `ω_y,current(P(t))`.
   V1 explorer contracts for class B T1 coloring, atomic
   explanation, and the default exclusion of `ω_y,current`
   now live in architecture `62`. Remaining OPEN: numeric
   color-scale calibration, flicker policy, terminal-clamp
   recorded flag, and any later `ω_y` comparison treatment
   (`62` §17 / §23). `62` does not close items 1–7.

---

## 22. Rejected / closed interpretations

Rejected as **current-model** readings. Structural
model-boundary decisions, not “not implemented yet.”

```text
∫T1 = Δω_y
T1 × Δt = parcel spin-up
prognostic ω_y from a T1-only ODE
causal T1 → ω_y,current
parcel / tracer owns sounding-derived ω_h
material tracer line = vortex line
storm evolution inferred from runtime trajectory time
seed-dependence as a ban on all Lagrangian quantities
R_y as baroclinic generation or atmospheric inconsistency score
```

---

## 23. What this document does not authorize

```text
Architecture N
production TILT_Y,total API
production R_y diagnostic
∫T1 / I_tilt implementation or UI
prognostic ω_y
ω → V
stretching of prescribed-Ω vorticity called supercell stretching
Analysis live consumer rewiring
Explore / Guided / Inspector visualization of class B series
changes to T1, Candidate A, V_total, tracer integration
amendments to physics 22 / 23 or architecture 26 / 27 / 28 /
  29 / 30 / 52 / 60 / 61
rewrite of CONCEPT.md
```

Class B lookups are scientifically admissible. Shipping them
required a later architecture SoT; that SoT is now
`docs/architecture/62-trajectory-tilting-explorer-v1.md`.
This research file still does not authorize implementation,
`TILT_Y,total`, `I_tilt`, or Analysis `V_env` rewiring.

---

## 24. Compact lock-in

```text
class:                 prescribed kinematic laboratory; V Eulerian-steady
storm evolution time:  absent
taxonomy:              A Eulerian field
                       B Eulerian field along recorded path
                       C Lagrangian path functional
                       D prognostic parcel state — ABSENT
T1:                    exact TILT of V_env+V_updraft strictly
                       inside a PWL segment, excluding knots
                       not TILT of V_total
                       not Dω_y/Dt; on V_red, R_y,red = −T1
TILT_Y,total:          research-derived; not implemented
                       T1 is only the env×updraft component
sign evidence:         INDICATIVE / unreproduced sanity check;
                       opposite sign possible; topology OPEN
ω_y,current:           CURRENT STACK IDENTITY = ω_y(V_rotation)
                       evaluator uses that identity, not runtime
                       curl(V_total); revisit if operands change
                       along path = class B lookup
                       T1 → ω_y,current REJECTED
                       T1 vs ω_y juxtaposition = causal-perception
                       risk; two curves + disclaimer not enough
identity:              dω_y(P(t))/dt = (V·∇)ω_y  (preferred)
                       TILT+STRETCH−ωdiv+R_y is tautological with a_kin
R_y:                   kinematic remainder; curl(a_kin)≠0 ⇒
                       a_kin is not a gradient field locally
div V:                 ≠ 0; YELLOW (10); do not drop dilatation
I_tilt:                class C admissible; DO NOT IMPLEMENT / PRESENT
                       including renamed spin-up-preserving scores
                       seed dependence ≠ mathematical ban
NO FAKE EVOLUTION:     research decision / candidate invariant
                       budget membership necessary, not sufficient
materiality:           active Euler path ≈ material V_total
                       clamped terminal ≠ ordinary Euler endpoint
                       recorded (P, t) not time-consistent at clamp
time:                  no new axis; ESC TIME ≠ laboratory time
support along path:    point statuses exist;
                       trajectory-time interval/flicker OPEN
                       (60 HEIGHT-layer interval semantics exist)
env ω_h:               sounding at occupied altitude; not parcel ω_h
vortex line:           unsupported; material line ≠ vortex line
implementation:        none authorized
adversarial:           ACCEPT WITH NON-BLOCKING NOTES; no blockers
```
