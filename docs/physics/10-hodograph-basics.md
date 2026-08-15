# Hodograph Basics

## 1. Purpose

This document defines the first hodograph data foundation in Supercell
Explorer.

A hodograph is a representation of an existing ground-relative
`EnvironmentalWindProfile` in horizontal velocity space. It is not a
separate atmospheric model and not a storm-relative rewrite of the
profile.

Source of environmental wind:

    EnvironmentalWindProfile

from:

    docs/physics/04-environmental-wind-profile.md

This foundation answers:

    What is the piecewise-linear path of ground-relative horizontal wind
    in (eastward, northward) velocity space as height increases?

It does not define:

- storm motion `C` as part of the base hodograph model;
- storm-relative rewriting of source profile points;
- SRH signed-area overlay as a production field on points or segments;
- finite-layer shear, horizontal vorticity, or streamwise/crosswise
  diagnostics embedded in hodograph types;
- layer path queries over an arbitrary `[h0, h1]` window;
- Bunkers or other storm-motion estimators;
- operational sounding conventions;
- frontend rendering (axes, ticks, colors, SVG/Canvas/Three.js);
- interactive editing or dragging of `C`;
- world-space `Vec3` conversion.

---

## 2. Relationship to EnvironmentalWindProfile

`docs/physics/04-environmental-wind-profile.md` §14 establishes:

- a hodograph is another representation of the same environmental wind
  profile;
- each height maps to a point `(eastward, northward)` in velocity space;
- connecting those points in height order produces the hodograph;
- the hodograph derives from `EnvironmentalWindProfile`, not from tracer
  trajectories or world-space geometry;
- the hodograph is not a separate atmospheric model.

Architectural dependency:

    EnvironmentalWindProfile
            ↓
    Hodograph representation

The profile remains the atmospheric source of truth.

The hodograph must not become a second hidden mutable copy of the
environmental wind model. It is a derived, read-only velocity-space view
of the same piecewise-linear ground-relative profile.

---

## 3. What a hodograph point is

### 3.1 Velocity-space coordinates

In atmospheric east–north velocity space, a hodograph point is:

    (eastward, northward)

Units:

    m/s

These two components are the coordinates of the point in the 2D hodograph
plane.

They are ground-relative horizontal environmental wind components from the
profile.

They are not world-space `(x, z)` and must not be obtained by converting
through `Vec3`.

### 3.2 Height is metadata, not a hodograph axis

Each point also carries:

    height

Units:

    m

`height` is a metadata / order parameter:

- it identifies the atmospheric level associated with the velocity point;
- it defines ascending order along the path;
- it links the velocity-space geometry back to the profile and to later
  layer diagnostics.

`height` is not a third geometric axis of the hodograph.

The hodograph plane remains 2D:

    eastward  → horizontal axis of the velocity plane
    northward → vertical axis of the velocity plane (in the usual plan view)

Do not treat `(eastward, northward, height)` as a 3D geometric vector in
hodograph space.

### 3.3 Minimal point type

Conceptual type:

    interface HodographPoint {
      height: number;
      eastward: number;
      northward: number;
    }

Required fields:

| Field       | Role                                      |
|-------------|-------------------------------------------|
| `eastward`  | velocity-space coordinate (m/s)           |
| `northward` | velocity-space coordinate (m/s)           |
| `height`    | level metadata / path order parameter (m) |

Not part of the v1 point type:

- `vertical` (profile vertical wind is already constrained to `0`; the
  hodograph plane is horizontal-only);
- wind speed / direction convenience fields;
- storm-relative components;
- shear, vorticity, or SRH;
- world-space components;
- segment index as a physical field.

---

## 4. Ground-relative base model

The base hodograph is ground-relative.

It represents:

    V_env(h) = (eastward(h), northward(h))

from `EnvironmentalWindProfile`.

It does not know storm motion.

Let:

    C = (C_u, C_v) = storm motion

as defined in:

    docs/physics/07-storm-relative-wind.md

Then storm-relative wind remains a separate operation:

    V_sr(h) = V_env(h) - C

Neither base `HodographPoint` nor base `HodographSegment` may embed:

- `C`;
- `V_sr`;
- signed area relative to `C`;
- any storm-relative rewriting of the source path.

`C` and storm-relative overlays belong to later derived/view layers, not to
the base hodograph model.

---

## 5. Piecewise-linear path and segments

`EnvironmentalWindProfile` is piecewise linear in height
(`docs/physics/04-environmental-wind-profile.md`).

Therefore the ground-relative hodograph path is a polyline in
`(eastward, northward)` whose vertices are the profile knots, connected in
ascending height order.

### 5.1 First-class segment type

Conceptual type:

    interface HodographSegment {
      lower: HodographPoint;
      upper: HodographPoint;
    }

Constraints:

    upper.height > lower.height

For the full-profile knot polyline, each segment connects two adjacent
profile knots.

No additional fields in v1:

- no embedded `ΔV` / shear;
- no embedded horizontal vorticity;
- no embedded SRH triangle contribution;
- no storm-relative endpoint components.

Those quantities may be derived later from segment endpoints plus external
diagnostics or `StormMotion`, without mutating the base segment type.

### 5.2 Exact match to profile PL geometry

Full-profile hodograph segments must correspond exactly to the
piecewise-linear segments of `EnvironmentalWindProfile`.

That is required so that later geometric identities for SRH
(`docs/physics/09-storm-relative-helicity.md` §6–§8) can use the same path:

- on one linear segment, Form B / triangle area relative to `C` matches the
  exact segment helicity contribution;
- across the full profile, the polyline vertices are the same knots that
  define segment boundaries for SRH decomposition.

This document does not re-implement SRH. It only requires that the base
hodograph geometry be the same PL path the SRH diagnostic already assumes.

---

## 6. Profile encapsulation and `levelHeights()`

`docs/physics/05-vertical-wind-shear.md` established that
`EnvironmentalWindProfile` exposes read-only bounds:

    minHeight
    maxHeight

but does not expose the internal level array.

SRH already uses a narrow height query:

    interiorLevelHeightsBetween(h0, h1)

without exposing level velocities.

### 6.1 New profile query

To construct the full-profile hodograph without breaking encapsulation,
`EnvironmentalWindProfile` gains:

    levelHeights() -> number[]

Contract:

- returns every profile knot height in ascending order;
- returns a defensive snapshot (caller mutation must not affect the
  profile);
- returns heights only;
- does not expose level velocities;
- does not expose `EnvironmentalWindLevel` objects;
- does not expose the private `levels` array by reference.

### 6.2 How hodograph points are obtained

Full-profile knot points are constructed as:

    heights = profile.levelHeights()
    for each h in heights:
      V = profile.sampleAtHeight(h)
      point = { height: h, eastward: V.eastward, northward: V.northward }

Because `h` is an exact knot height, `sampleAtHeight(h)` returns that
level's ground-relative horizontal wind.

Do not bypass sampling by reading private level storage from outside the
profile class.

### 6.3 Rejected encapsulation alternatives

Not accepted for v1:

- exposing `levels` / `getLevels()` with velocities;
- making the hodograph own an independent editable sounding copy;
- requiring callers to pass raw level arrays into hodograph constructors;
- speculative iterator frameworks beyond the small query API below.

---

## 7. API surface (conceptual)

Production module:

    src/physics/environment/hodograph.ts

That single module exports:

- interfaces: `HodographPoint`, `HodographSegment`;
- functions: `hodographPoints`, `hodographSegments`, `hodographPointAtHeight`.

`EnvironmentalWindProfile.levelHeights()` remains on the profile class in
its existing module; it is profile encapsulation support, not a second
hodograph module.

Dependency direction:

    EnvironmentalWindProfile
            ↓
    hodograph.ts

No imports from rendering, UI, React, Three.js, or world `Vec3` helpers
into this layer.

### 7.1 Profile support

    profile.levelHeights() -> number[]

See §6.1.

### 7.2 Hodograph queries

Conceptual functions:

    hodographPoints(profile) -> HodographPoint[]

        All profile knot points in ascending height order.
        Snapshot result. No caching.

    hodographSegments(profile) -> HodographSegment[]

        Adjacent knot segments for the full profile.
        Segment i connects points[i] to points[i + 1].
        Snapshot result. No caching.

    hodographPointAtHeight(profile, height) -> HodographPoint

        Thin velocity-space view of profile sampling at an arbitrary height.
        Uses profile.sampleAtHeight(height).

        For every finite requested height `h`:

            point.height    === h
            point.eastward  === profile.sampleAtHeight(h).eastward
            point.northward === profile.sampleAtHeight(h).northward

        `point.height` always preserves the requested finite height, even
        when `h` lies outside `[minHeight, maxHeight]`.

        Velocity components inherit clamp from `sampleAtHeight(h)`.
        Outside the explicit profile range, velocity matches the nearest
        endpoint knot, while `point.height` remains the requested `h`.

### 7.3 Errors

v1 does not introduce `HodographError`.

Sampling failures, including non-finite height, propagate as
`EnvironmentalWindProfileError` from `profile.sampleAtHeight`.

The hodograph functions do not wrap or replace that error type.

### 7.4 Ownership and mutability

- Returned arrays and point/segment objects are snapshots.
- No production caching of hodograph geometry inside the profile or
  hodograph module.
- Caller mutation of returned snapshots must not mutate profile internals.
- The hodograph API must not mutate the input profile.

Structural / value equality is the contract for comparing points and
segments in tests and callers. Object identity of returned point or
segment instances is not part of the contract: `hodographSegments` may
allocate fresh point objects even when their field values match
`hodographPoints` entries.

### 7.5 Deferred: layer path `[h0, h1]`

A query that returns the polyline over an arbitrary diagnostic layer:

    endpoints sampled at h0 and h1
    plus interior profile knots strictly inside (h0, h1)

is intentionally deferred to a later slice.

That decomposition already exists conceptually in
`docs/physics/09-storm-relative-helicity.md` §8.1. When added, it must
match SRH breakpoints exactly. It is not part of this foundation.

---

## 8. Domain and boundary policy

### 8.1 Full-profile points and segments

`hodographPoints` and `hodographSegments` operate on the explicitly
specified profile knots.

They do not invent points outside `[minHeight, maxHeight]`.

They do not apply advection clamp continuation as additional hodograph
vertices.

### 8.2 `hodographPointAtHeight`: requested height + clamped velocity

`hodographPointAtHeight(profile, h)` requires finite `h` via
`profile.sampleAtHeight(h)`.

Invariant for every successful call:

    point.height === requestedHeight

even when `requestedHeight` is outside `[minHeight, maxHeight]`.

Velocity policy inherits `sampleAtHeight` clamp:

- below `minHeight`, eastward/northward match the lowest knot;
- above `maxHeight`, eastward/northward match the highest knot;
- non-finite height fails as `EnvironmentalWindProfileError`.

Rationale:

- this function is a thin representation wrapper around existing sampling;
- it must not invent a second velocity boundary policy that diverges from
  the profile;
- preserving requested `height` keeps the caller's query height visible
  even when velocity is clamped.

Important distinction:

    sampleAtHeight / hodographPointAtHeight velocity
        -> may clamp for continuity with advection sampling

    hodographPointAtHeight height field
        -> always the requested finite height

    shear / SRH / future layer-path diagnostics
        -> require endpoints inside the explicit profile range

Clamped continuation outside the sounding is not additional atmospheric
observation. Full-profile hodograph knots remain only the explicit levels.

---

## 9. Coordinate and representation discipline

Canonical atmospheric horizontal components:

    eastward
    northward

Hodograph plane:

    +eastward  (right in the usual plan view)
    +northward (up in the usual plan view)

Forbidden in this layer:

- storing or returning world `Vec3`;
- using world `+X/+Z` as hodograph axes;
- converting through `atmosphericVelocityToWorld` to build points;
- naming velocity-space components `u` / `v` / `w` as world-space fields;
- mixing atmospheric semantic vectors with world positions.

World conversion, if ever needed for a renderer, belongs at a rendering
boundary outside this document's API.

---

## 10. Future derived overlays (non-goals for base types)

Later layers may overlay or derive:

| Quantity                         | Representation intent                         | Source                         |
|----------------------------------|-----------------------------------------------|--------------------------------|
| Storm motion point `C`           | external marker / view input                  | `StormMotion` (doc 07)         |
| `V_sr` vector from `C` to wind   | overlay segment `C → point(h)`                | storm-relative wind            |
| Shear segment `ΔV`               | derived from segment endpoints                | doc 05                         |
| Horizontal vorticity for a layer | diagnostic result, not a point field          | docs 05 → 06                   |
| SRH signed area                  | closed contour relative to `C`                | doc 09                         |

These must not be embedded into base `HodographPoint` or
`HodographSegment` fields.

The base path stays ground-relative even when overlays are drawn relative
to `C`.

---

## 11. Separation of concerns

Keep these layers distinct:

1. Atmospheric source data

       EnvironmentalWindProfile

2. Hodograph geometry / data representation

       HodographPoint
       HodographSegment
       hodographPoints / hodographSegments / hodographPointAtHeight

3. Derived atmospheric diagnostics

       vertical wind shear
       horizontal vorticity
       storm-relative wind
       streamwise / crosswise vorticity
       storm-relative helicity

4. Future frontend rendering

       axes, ticks, colors, interaction, SVG/Canvas/Three.js

Physics/simulation code must not depend on layer 4.

Layer 2 may depend on layer 1 only.

Layer 3 may consume layers 1 and 2, but layer 2 must not depend on layer 3.

---

## 12. Validation cases

Tests should protect the representation contract, not renderer trivia.

### 12.1 Ordering

`hodographPoints(profile)` returns points strictly ascending in `height`.

### 12.2 Exact knot match

For every knot height `h` from `profile.levelHeights()`:

    point.eastward  === profile.sampleAtHeight(h).eastward
    point.northward === profile.sampleAtHeight(h).northward
    point.height    === h

### 12.3 Segment endpoints (structural / value equality)

For `segments = hodographSegments(profile)` and `points = hodographPoints(profile)`:

    segments.length === points.length - 1

    segments[i].lower.height    === points[i].height
    segments[i].lower.eastward  === points[i].eastward
    segments[i].lower.northward === points[i].northward

    segments[i].upper.height    === points[i + 1].height
    segments[i].upper.eastward  === points[i + 1].eastward
    segments[i].upper.northward === points[i + 1].northward

    segments[i].upper.height > segments[i].lower.height

Compare by structural / value equality of fields.

Object identity is not part of the contract: segment endpoint objects need
not be `===` to the corresponding `hodographPoints` entries.

### 12.4 No world conversion

Construction uses atmospheric eastward/northward only. No world-space
adapter participates.

### 12.5 Arbitrary-height wrapper

For every finite requested height `h`, including values outside
`[minHeight, maxHeight]`:

    const point = hodographPointAtHeight(profile, h)

must satisfy:

    point.height === h
    point.eastward  === profile.sampleAtHeight(h).eastward
    point.northward === profile.sampleAtHeight(h).northward

Including the case where velocity is clamped but `point.height` remains
the requested `h`.

Non-finite `h` must fail with `EnvironmentalWindProfileError`.

### 12.6 PL path identity relevant to SRH

The full-profile knot polyline is the same piecewise-linear path assumed by
document 09:

- adjacent hodograph segments are the profile's linear pieces;
- those pieces are the geometric objects for which SRH Form B is exact on
  each segment when combined with an external `StormMotion`.

An optional later cross-check may compare, on a single isolated segment and
chosen `C`, the triangle/area Form B value implied by segment endpoints
with `stormRelativeHelicityBetween` over that same height interval.

That cross-check is not required for the first hodograph implementation
slice. It does not move SRH into the hodograph API.

### 12.7 Snapshot isolation

Mutating a returned `levelHeights()`, `hodographPoints()`, or
`hodographSegments()` array must not change later queries on the same
profile.

### 12.8 No storm motion in base results

Base points and segments contain no `StormMotion`, no `V_sr`, and no SRH
fields.

### 12.9 What not to re-test here

Do not duplicate full constructor validation of
`EnvironmentalWindProfile` in every hodograph test. That ownership remains
with the profile tests.

Do not require an SRH cross-check test in the first implementation slice.

---

## 13. Out of scope for this slice

This document's implementation slice includes:

- `EnvironmentalWindProfile.levelHeights()`;
- `HodographPoint`;
- `HodographSegment`;
- `hodographPoints`;
- `hodographSegments`;
- `hodographPointAtHeight`;
- contract tests above.

It excludes:

- React / UI;
- Three.js / SVG / Canvas;
- axes, ticks, colors, labels layout;
- dragging or editing `C`;
- Bunkers;
- operational sounding import features;
- storm-relative rewriting of the source profile;
- layer path `[h0, h1]` query;
- caching;
- `HodographError` or other hodograph-specific error type;
- mandatory SRH cross-check tests in the first slice;
- convenience wrappers beyond the API in §7;
- barrel-export churn unrelated to this foundation.

---

## 14. Implementation note

After this document is accepted as source of truth for the hodograph data
foundation, implementation should follow a small vertical slice:

- add `levelHeights()` on `EnvironmentalWindProfile`;
- create `src/physics/environment/hodograph.ts` with the two interfaces and
  three functions from §7;
- add contract tests from §12, without a required SRH cross-check.

and must pass:

    npm test
    npm run typecheck

No rendering integration belongs in that slice.

---

## 15. Core lesson

The hodograph answers:

    "What is the ground-relative environmental wind path in
     (eastward, northward) velocity space?"

`EnvironmentalWindProfile` remains the atmospheric source of truth.

`(eastward, northward)` are the hodograph plane coordinates.

`height` orders and identifies points; it is not a third hodograph axis.

`StormMotion C` and later diagnostics may be drawn or computed relative to
that path, but they do not rewrite the base representation.
