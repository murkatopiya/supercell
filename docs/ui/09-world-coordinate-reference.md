# World Coordinate Reference

**Status:** UI SoT / Slice 3 COMPLETE
**Scope:** a laboratory coordinate-reference layer on the 3D
scene: world grid, cardinals, distance marks, origin, and a
live cursor HUD. Experiment reproducibility, not decoration.
**Physics:** unchanged. Axes, signs, and units come from
`docs/physics/00-coordinate-system.md`. This file does not
add a second world system, does not pick in screen-space
metres, and does not snap seeds to the grid.
**Implementation:** Slice 3 COMPLETE in production `src/**`.
Slice 4 tracer hover is COMPLETE (`10`).

Predecessors:

```text
docs/physics/00-coordinate-system.md
docs/ARCHITECTURE.md §3
docs/rendering/01-tracer-scene.md
docs/rendering/11-deep-storm-tracer-view.md
docs/architecture/18-explore-arbitrary-seeding.md
docs/ui/08-scene-toolbar-and-control-states.md
```

---

## 1. Purpose

The 3D scene must show the **same world coordinates** the
simulation uses, so a user can return to the same place in
different environments.

This layer is a spatial ruler. It is not terrain, not a
physics domain, and not a storm-centered map.

---

## 2. Current fact (live App)

Verified after Slice 3 against `TracerScene`,
`worldCoordinateReference`, and `TracerViewport`:

```text
Ground grid            GridHelper 10000 m / 10 divisions / 1000 m
                       cells, XZ, y = 0, inside one
                       worldCoordinateReference group
RGB AxesHelper         removed from the product scene
Origin                 modest ring + brighter center cross + `0`
                       (not storm center)
Compass widget         none; N/E/S/W are world-space labels
Distance marks         E +1..+4 km along +X; N +1..+4 km along −Z
Cursor HUD             E/N from ray ∩ y = 0; unavailable → —
Grid control           TracerViewport overlay (top-left),
                       App-owned, default on
HUD vs Grid            HUD remains when the grid is hidden
Explore pick datum     unchanged: ray ∩ y = 0 → (x, z)
Inspector position     unchanged: world (x, y, z), altitude = y
```

Conversion lives in `src/core/math/AtmosphericPosition.ts`, not
under `src/physics/**`.

---

## 3. Scope

In this SoT:

- labeled ground/world grid on the existing ground-reference
  plane `y = 0`;
- cardinal markers N / E / S / W;
- distance marks in metres / kilometres;
- marked reference origin;
- live cursor HUD in atmospheric laboratory labels;
- optional visibility toggle on the TracerViewport overlay;
- Guided and Explore share the same layer.

Out of scope for the first implementation slice:

- snap-to-grid of Explore seeds;
- terrain, map tiles, GIS;
- a second grid in screen space;
- changing `DEEP_STORM_TRACER_VIEW` camera numbers;
- changing Explore pick policy (`18`);
- free 3D volume probe (not `52`);
- putting conversion helpers into `src/physics/**`.

---

## 4. World / atmospheric mapping (found, not invented)

Canonical world (`physics/00` §2, `ARCHITECTURE` §3):

```text
+X = East      −X = West
+Y = Up        −Y = Down
+Z = South     −Z = North
```

Meteorological velocity mapping (`physics/00` §5) — **velocity**,
not the HUD:

```text
world.x = eastward
world.y = vertical
world.z = −northward
```

Laboratory **position** (`physics/00` §8
`AtmosphericPosition`):

```text
east      = world.x
north     = −world.z
altitude  = world.y
```

Inverse:

```text
world.x = east
world.y = altitude
world.z = −north
```

Units: metres.

Inspector already treats altitude as `position.y`
(`TracerInspection.altitude`). Rendering already places meshes
with `mesh.position.set(world.x, world.y, world.z)`
(`physics/00` §16). Explore ground pick already returns world
`(x, z)` on `y = 0`
(`intersectRayWithGroundReferencePlane`).

**There is no production `worldPositionToAtmospheric` helper
today** (only velocity helpers in
`src/core/math/AtmosphericVelocity.ts`). A display conversion
may be added in UI or `src/core/math` following `physics/00` §8
exactly. It must not be added under `src/physics/**` in this
pass.

### 4.1 Rejected HUD labels

The sketch `Z: +240 m` as a **height** line is rejected.

In this project `Z` is South. Vertical is `Y` / altitude.
`physics/00` §6 exists specifically to stop that confusion.

Live cursor HUD uses atmospheric position labels, not raw
world `x, y, z` as the primary user-facing triplet, and not
`Z` for height.

---

## 5. Grid layer

### 5.1 Datum

```text
plane     XZ, y = 0     ground-reference, same as 11 and 18
origin    (0, 0, 0)     simulation origin; not storm center
                        (physics/00 §9)
extent    existing DEEP_STORM_TRACER_VIEW.gridSizeM (10000 m)
cells     existing 1000 m divisions unless a later rendering
          SoT retunes the fixture
```

Do not clip the physics domain to the grid. The grid is a
viewing ruler (`11` §13).

### 5.2 Cardinals

Place readable labels in world space:

| Label | World direction |
| --- | --- |
| E | +X |
| W | −X |
| S | +Z |
| N | −Z |

Labels sit on the ground plane (or just above it). They are
not a screen-locked compass widget that ignores camera
azimuth. If the user orbits, E remains +X.

Slice 3.1: cardinal and metric labels are sprites with
`sizeAttenuation: false`, so they keep a readable screen size
at the default overview without enlarging world metres. Grid
cell meaning is unchanged. Cardinals are stronger than metric
marks.

RGB `AxesHelper` is **not** the user-facing legend. Slice 3
removed it from `TracerScene`. Cardinals, distance marks, and
the origin ring are the orientation teaching. `axisSizeM`
remains on `DEEP_STORM_TRACER_VIEW` as a fixture number and is
not drawn.

### 5.3 Distance marks

Mark the 1000 m cells with metre or kilometre labels
(for example `0`, `1 km`, `2 km` along +X / +Z).

Zooming the camera must **not** change the meaning of a cell.
A 1000 m cell stays 1000 m in world space. Labels are world
objects (or world-projected text), not a screen-space scale
bar that lies about metres.

### 5.4 Origin

Mark `(0, 0, 0)` as the **reference origin**.

Copy must not call it mesocyclone center, updraft axis, or
tornado location (`physics/00` §9).

### 5.5 Relation to GridHelper

There is **one** ground grid: `THREE.GridHelper` inside
`worldCoordinateReference`, same plane and same world metres.
The unlabeled standalone `GridHelper` / `AxesHelper` pair in
`TracerScene` is gone.

---

## 6. Live cursor HUD

### 6.1 What it reports

While the pointer is over the canvas, the HUD reports the
**ground-reference pick** of the camera ray, the same datum
Explore uses to choose `(x, z)`:

```text
ray ∩ plane y = 0  →  world (x, 0, z)
east  = x
north = −z
altitude of that intersection = 0
```

User-facing lines (format illustrative):

```text
E: +512 m
N: −984 m
```

Do not show a fake 3D height sampled along the ray. Empty
space has no unique altitude (`18` rejected 3D click-to-seed
for that reason).

### 6.2 Explore release altitude

Explore already has an explicit altitude control
(`DEFAULT_EXPLORE_POINT_ALTITUDE_M`,
`ExplorePointReleaseTool`). Slice 3 does **not** duplicate that
value on the cursor HUD. The HUD remains E/N only so ground
cursor position is not confused with seed altitude.

### 6.3 Misses

If the ray does not hit `y = 0` in front of the camera, the
HUD shows an unavailable state (em dash / “no ground pick”),
not a screen-space guess.

### 6.4 Camera zoom

Orbit / zoom / pan change which world point lies under the
cursor. They do not rescale the HUD. Implementation:

```text
worldRayFromNdc → intersectRayWithGroundReferencePlane
→ physics/00 §8 conversion → format metres
```

Reuse existing `worldRayFromCameraNdc` and
`intersectRayWithGroundReferencePlane`. Do not convert CSS
pixels to metres with a camera-distance heuristic.

### 6.5 Owner

| Piece | Owner |
| --- | --- |
| Pointer NDC / ray | viewport / `TracerScene` (existing) |
| Ground intersection | existing Explore pick helper |
| Display conversion | UI / core math following `physics/00` §8 |
| HUD text | UI overlay on the viewport |
| Release altitude value | `ExplorePointReleaseTool` (Explore only) |

The HUD does not write seeds. Placement still goes through
`ExplorePointReleaseOrchestration`. v1 HUD lines are **E / N
only**. Release altitude stays on `ExplorePointReleaseTool`
and is not duplicated on the cursor HUD.

---

## 7. Visibility toggle

Grid + cardinals + distance marks + origin mark are one
presentation group.

Default: **on**.

The TracerViewport overlay hosts `CoordinateReferenceControl`
(`Grid`) in the top-left corner of the 3D scene. Grid +
cardinals + distance marks + origin hide together. The cursor
HUD stays visible when the grid is hidden: it is a readout
of the pick datum, not a drawing of the pad. HUD remains
bottom-left and non-interactive.

---

## 8. Snap-to-grid

**Out of this slice.**

No existing architecture owns snap (`18` is free `(x, z)` on
the plane). Do not add snap as a convenience.

---

## 9. Ownership summary

| Concern | Owner | UI role |
| --- | --- | --- |
| World axes / units | `physics/00` | observe only |
| Grid extents (fixture) | `DEEP_STORM_TRACER_VIEW` | observe / present |
| Cursor world point | ray ∩ y = 0 | HUD displays |
| Grid visibility | App session state | TracerViewport overlay (top-left) |
| Explore seed y | altitude control | HUD may display |
| Camera | OrbitControls / Follow (`34`/`37`) | does not redefine axes |

Rendering still observes world positions. UI does not
recompute atmospheric diagnostics from the grid.

---

## 10. Testing expectations

Prefer helper tests:

- cardinal placement: E at +X, N at −Z;
- conversion: `east = x`, `north = −z`, `altitude = y`;
- HUD uses ground-plane intersection, not CSS-to-metres;
- no hit → unavailable, not `(0,0)`;
- zoom does not change converted metres for a fixed world
  point;
- no snap tests (feature absent);
- no physics-field tests.

Reuse `intersectRayWithGroundReferencePlane` tests; do not
duplicate them as UI trivia.

---

## 11. Implementation slice boundary

This document’s implementation slice is **Slice 3**:

```text
labeled world grid on y = 0
N/E/S/W and distance marks
origin mark
cursor HUD (E/N from ground pick; optional release altitude)
grid visibility on TracerViewport overlay (top-left)
shared Guided + Explore
```

It excludes snap-to-grid and any physics change.

Slice 3 is COMPLETE.

Evidence:

```text
src/core/math/AtmosphericPosition.ts
src/rendering/worldCoordinateReference.ts
src/ui/tracer/CoordinateReferenceControl.tsx
src/ui/tracer/groundCursorHud.ts
src/ui/tracer/formatLaboratoryLength.ts
src/rendering/TracerScene.ts
  createWorldCoordinateReference; no AxesHelper
src/ui/tracer/TracerViewport.tsx
  HUD overlay, pointer-events: none
  Grid overlay, top-left
src/app/App.tsx
  coordinateReferenceVisible default true
  CoordinateReferenceControl on TracerViewport overlay
```

---

## 12. Anti-claims

```text
This SoT does not make Z the vertical axis.
This SoT does not treat the origin as the storm.
This SoT does not use screen-space metres.
This SoT does not change Explore seed policy.
This SoT does not add snap-to-grid.
This SoT does not put conversion code in src/physics/**.
```
