# Storm-Relative Environmental Advection

## 1. Purpose

This document owns the first **D2** environmental advection adapter in
Supercell Explorer: `StormRelativeEnvironmentalAdvectionField`.

It answers:

    Given a ground-relative EnvironmentalWindField and prescribed
    horizontal storm motion C, what world-space velocity should a
    tracer sample for storm-relative particle integration?

The definition is:

    V_env_sr(P, t) = V_env_ground(P, t) − C    (horizontal only)

Architecture:

    docs/architecture/03-wind-tunnel-storm-relative-3d-semantics.md

Diagnostic subtract (D1, not this type):

    docs/physics/07-storm-relative-wind.md

This document does **not** own live DEMO selection. Default composition
API remains `GroundRelativeWindTunnel`. Live `App.tsx` (slice 3) uses
`StormRelativeEnvironmentalAdvectionField` under
`IntegrationFrame.StormRelativeLaboratory`
(`docs/architecture/03-wind-tunnel-storm-relative-3d-semantics.md` §21).

---

## 2. Why this type exists

`07` maps ground-relative environmental wind to storm-relative wind
as a diagnostic:

    V_sr = V_env − C

`04` / `07` §9 forbid injecting that map into
`EnvironmentalWindField` or `EnvironmentalWindProfile`.

`03` requires an explicit composition-time adapter so that:

- D1 diagnostics stay on the profile + `stormRelativeWind`;
- D2 particle integration can use `V_env − C` without rewriting storm
  fields;
- the live wind-tunnel mode is not destroyed.

`StormRelativeEnvironmentalAdvectionField` is that adapter.

---

## 3. Three contracts (do not mix)

| ID | Contract | Owner |
| --- | --- | --- |
| D1 | Storm-relative **wind diagnostic** | `stormRelativeWind` (`07`) |
| D2 | Storm-relative **particle integration** | this type |
| D3 | Translating storm center in ground-relative world | not this document |

This type is D2 applied to the **environmental operand only**.

It is not:

- a hodograph rewrite;
- a translating-storm field;
- a composite-frame wrapper;
- Bunkers;
- a story-tracer seed policy.

---

## 4. Mathematical definition

Let:

    V_env_ground = EnvironmentalWindField.sample(P, t)
                 = world Vec3 (Vx, Vy, Vz)

    C = StormMotion = (eastward_c, northward_c)

`C` has no vertical member. Horizontal-only storm motion means:

    C_y = 0

in world components.

Convert the sampled ground-relative world velocity to atmospheric
components, apply the `07` map, and convert back:

    V_atm = worldVelocityToAtmospheric(V_env_ground)
    V_sr_atm = stormRelativeWind(V_atm, C)
    V_env_sr = atmosphericVelocityToWorld(V_sr_atm)

Component-wise:

    V_env_sr.eastward  = V_env.eastward  − C.eastward
    V_env_sr.northward = V_env.northward − C.northward
    V_env_sr.vertical  = V_env.vertical

World:

    Vx_sr = Vx_ground − C.eastward
    Vy_sr = Vy_ground
    Vz_sr = Vz_ground − (−C.northward) = Vz_ground + C.northward

The last line is the `00` mapping `world.z = −northward`, not a
vertical subtract.

Subtract `C` once. Do not subtract it from storm mechanisms.

---

## 5. API

    src/physics/environment/StormRelativeEnvironmentalAdvectionField.ts

    new StormRelativeEnvironmentalAdvectionField(
      environmentalField: EnvironmentalWindField,
      stormMotion: StormMotion,
    )

    implements VelocityField
    sample(position: Vec3, time: number): Vec3

Construction copies `stormMotion` components. Mutating the caller
object after construction must not change the field.

The wrapped field remains ground-relative. This adapter does not
mutate it and does not sample `EnvironmentalWindProfile` itself.

`time` is forwarded unchanged to the wrapped field. When the wrapped
field is steady and `C` is constant, this adapter is steady.

Return a fresh world `Vec3`. Do not mutate `position`. Do not mutate
the wrapped field's returned vector.

---

## 6. Naming

Canonical name:

    StormRelativeEnvironmentalAdvectionField

Not `StormRelativeEnvironmentalWindField`: that name would read as a
replacement env field for diagnostics / hodograph. This type is only
the D2 advection operand.

Not a generic Galilean wrapper: it wraps `EnvironmentalWindField`
specifically so `CompositeVelocityField` and storm fields cannot be
passed without a type lie. That is the double-subtraction guard.

---

## 7. Validation

Owning boundary: this constructor.

Reject non-finite `stormMotion.eastward` or `stormMotion.northward`.

Do not re-validate the profile. Do not accept a vertical `C` member.

---

## 8. Out of scope

- `ScenarioConfig` / `DEMO_SCENARIO` fields;
- live DEMO default composition API (stays `GroundRelativeWindTunnel`);
- `IntegrationFrame` (app composition owns that type);
- wrapping `CompositeVelocityField`;
- subtracting `C` inside updraft / rotation / inflow / outflow;
- translating centers;
- `sample(position, time)` interface change;
- hodograph, SRH, or other D1 formula changes;
- story tracers.

---

## 9. Tests

Focused unit tests must lock:

- numeric `V_sr = V_ground − C` on DEMO-profile knots and interpolated
  heights, via `stormRelativeWind` + `atmosphericVelocityToWorld`;
- `C = 0` identity with the wrapped field;
- nonzero `C` changes only horizontal components;
- environmental vertical is not subtracted (`C_y = 0`);
- time is forwarded; a steady wrap stays steady;
- no mutation of `position` or wrapped return; fresh output;
- copied `C`; hodograph / profile samples unchanged;
- single subtract (type cannot wrap itself as `EnvironmentalWindField`).
