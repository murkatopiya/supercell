# Vorticity-Budget Honesty and Trajectory-Diagnostic Boundary

**Status:** RESEARCH DECISION / NOT ARCHITECTURE / NOT IMPLEMENTATION
AUTHORIZATION
**Date:** 2026-08-29
**Checkpoint:** `2eb7516`
**Not:** Architecture N, production physics, diagnostic API, UI,
Analysis live wiring, `V_total` change, T1 change, Candidate A
change, tracer-integration change

```text
RESEARCH SoT
  ≠ physics 22 / 23
  ≠ architecture 26 / 27 / 28 / 29 / 30 / 52 / 60 / 61
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

On an interior piecewise-linear environmental segment, T1
**is** the exact vertical tilting term of the reduced
two-operand field

```text
V_env + V_updraft
```

or the storm-relative equivalent

```text
(V_env − C) + V_updraft
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

**Correct status:**

T1 is an exact tilting diagnostic of the reduced
environment + prescribed-updraft mechanism, used as an
isolated pedagogical diagnostic inside the richer
seven-operand `V_total` laboratory.

It is not `Dω_y/Dt` and not a full `V_total` budget term.

Do not say “T1 is not a tilting term of any field.”
Do not say “T1 is an arbitrary mixed product.”

The tracer still follows `V_total`, not the reduced
two-operand field. That trajectory mismatch is why a T1
integral along a recorded path is not a `V_total` budget
contribution even though T1 is exact for the reduced pair.

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
| environmental (sounding shear) | **= T1** on PWL interior | may be nonzero (DEMO downdraft is offset) |
| updraft | **0** identically | may be nonzero (distinct axes) |
| downdraft | may be nonzero | **0** identically |
| rotation `ω_h` from `G'(y)` | may be nonzero where `G' ≠ 0` | may be nonzero where `G' ≠ 0` |
| radial limbs `ω_h` from `G'(y)` | 0 on inflow plateau (`G' = 0`); may be nonzero in tapers | likewise |

Analytic zeros also include: `∇_h Vy` from any `Vy ≡ 0`
operand; rotation `ω_h` at rotation mid-layer (`G' = 0`) and
outside the rotation envelope; far field.

**Status:** RESEARCH-DERIVED / NOT IMPLEMENTED AS A NAMED
DIAGNOSTIC.

This file does not create a `TILT_Y,total` API.

---

## 7. Opposite-sign evidence

**Research evidence, not a universal theorem.**

A disposable DEMO calculation (central finite difference
`h = 5 m`; existing `sample()` APIs; script not retained)
found representative interior points where T1 and
`TILT_Y,total` have opposite signs.

| Point (world m) | T1 (s⁻²) | `TILT_Y,total` (s⁻²) |
| --- | ---: | ---: |
| updraft flank `(2000, 2500, −1500)` | −1.28×10⁻⁵ | +6.64×10⁻⁷ |
| downdraft flank `(6500, 1500, 500)` | +1.86×10⁻⁵ | −5.70×10⁻⁵ |
| inflow plateau `(2000, 800, 0)` | +1.02×10⁻⁵ | +6.43×10⁻⁵ (same sign; factor ~6) |

**Meaning:** T1 and full-field tilting can differ in local
**sign**, not only magnitude.

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

`DiagnosticVerticalVorticity` currently evaluates the rotation
analytic identity. It does not independently curl `V_total` at
runtime. Finite-difference checks on DEMO agree to ~10⁻⁹.

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

A disposable DEMO check (Euler path, trapezoid quadrature)
matched `Δω_y` to `∫ (V·∇)ω_y dt` with residual `O(dt)`,
as expected for forward Euler. The decomposed form with
`R_y` matched the chain rule to ~10⁻¹² pointwise. That
confirms signs; it does not add dynamics.

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
`curl((V·∇)V) ≠ 0` means this prescribed `V` is not a member
of the special idealized class in which that curl vanishes
(e.g. incompressible Euler with conservative body forces).

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
2. T1 is not `Dω_y/Dt`.
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

If the question is ever reopened, only under explicit
path-functional semantics, with no `ω` in the name, and with
no causal / evolution language.

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

```text
pre-impact active path     discrete material-path approximation
terminal clamped sample    not an ordinary Euler endpoint
post-impact                no material trajectory exists
```

This is a **blocker** for budget integration through impact.
It is **not** a blocker for Eulerian field lookup at the
recorded terminal point.

Materiality policy for future trajectory diagnostics:
**OPEN** / requires architecture. Not decided here.

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

- interval-level support semantics;
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
- `ω_y,current(P(t))` history **with** an explicit
  anti-causal claim (growth is prescribed `Ω`, not T1);
- linked path / history cursor;
- trajectory colored by T1 (diverging scale; OOD as a gap,
  not zero);
- sign-residence statistics (seconds);
- decomposition of environmental vs prescribed operands;
- Analysis support gaps / bands.

T1 is a **scalar**. It must not be drawn as a vector.
`∇_h Vy` is a genuine local vector. Environmental `ω_h` is
horizontally homogeneous: a glyph belongs to a height layer,
not to “the parcel’s local tube.”

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
| ground-clamp vs material `D/Dt` | limitation not visible in diagnostic docs | follow-up documentation debt |

`CONCEPT.md` is not rewritten in this slice.

---

## 21. OPEN research questions

Not resolved here. Not architecture decisions.

1. Spatial / topological comparison of T1 vs `TILT_Y,total`.
2. Whether `TILT_Y,total` deserves a named production
   diagnostic.
3. Analysis interval-level support semantics.
4. FULL / BOUNDARY flicker policy along a trajectory.
5. Materiality policy for terminal clamped samples.
6. Material-line vs local-vorticity angle experiment.
7. Whether `R_y` has any useful product or research role
   beyond kinematic remainder.
8. Exact future visualization architecture for class B
   series.

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
still requires a later architecture SoT.

---

## 24. Compact lock-in

```text
class:                 prescribed kinematic laboratory; V Eulerian-steady
storm evolution time:  absent
taxonomy:              A Eulerian field
                       B Eulerian field along recorded path
                       C Lagrangian path functional
                       D prognostic parcel state — ABSENT
T1:                    exact TILT of V_env+V_updraft on PWL interior
                       not TILT of V_total
                       not Dω_y/Dt
TILT_Y,total:          research-derived; not implemented
                       T1 is only the env×updraft component
sign evidence:         DEMO points exist where T1 and TILT_Y,total
                       disagree in sign; topology OPEN
ω_y,current:           CURRENT STACK IDENTITY = ω_y(V_rotation)
                       along path = class B lookup
                       T1 → ω_y,current REJECTED
identity:              dω_y(P(t))/dt = (V·∇)ω_y  (preferred)
                       TILT+STRETCH−ωdiv+R_y is tautological with a_kin
R_y:                   kinematic remainder; not baroclinic
div V:                 ≠ 0; YELLOW (10); do not drop dilatation
I_tilt:                class C admissible; DO NOT IMPLEMENT / PRESENT
                       seed dependence ≠ mathematical ban
NO FAKE EVOLUTION:     research decision / candidate invariant
materiality:           active Euler path ≈ material V_total
                       clamped terminal ≠ ordinary Euler endpoint
time:                  no new axis; ESC TIME ≠ laboratory time
support along path:    point statuses exist; interval/flicker OPEN
env ω_h:               sounding at occupied altitude; not parcel ω_h
vortex line:           unsupported; material line ≠ vortex line
implementation:        none authorized
```
