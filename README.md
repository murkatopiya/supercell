# Supercell Explorer

An idealized storm-relative flow laboratory: release a parcel,
see where the prescribed flow takes it, and read why.

V1 is a prescribed kinematic laboratory: an idealized
storm-relative flow superposed on one fixed environmental
wind profile. Every velocity is prescribed. Diagnostics
observe the flow; they never feed it. V1 is not a
realistic supercell simulator, forecast model, numerical
solver, or reconstructed observed storm.

Nothing in V1 evolves, generates, or responds.

## What you can do

- **Guided** (default first screen): three prescribed pathline
  exhibits, with on-screen honesty copy.
- **Explore:** release a passive air parcel at a chosen ground
  point and altitude, watch where the prescribed flow takes it,
  follow it, recover the storm view, and inspect local motion.
- Read **`V_total`** and the seven named prescribed velocity
  contributions at a selected parcel.
- In Explore, read two point diagnostics at that parcel:
  **`T_tilt,y`** and **`ω_y,current`**.

Motion is inspectable: the local velocity is explained by the
prescribed decomposition. The seven named contributions are a
V1 laboratory ontology, not a universal storm decomposition.
See [`docs/physics/12-composite-velocity-field.md`](docs/physics/12-composite-velocity-field.md)
and [`docs/architecture/19-shared-tracer-inspector.md`](docs/architecture/19-shared-tracer-inspector.md).

## Guided vs Explore

The app boots in **Guided**. Parcel release, Follow, Reset View,
Airflow view, and Point diagnostics are **Explore-only**.

## Environment and storm motion

V1 uses one fixed environmental wind profile
(`DEMO_SCENARIO`). The hodograph is that ground-relative
profile. It is not selectable or editable.

Storm motion **`C`** is a prescribed constant
`(10, 0)` m/s (eastward, northward). It is value-only: not a
Bunkers-class estimator and not an observed storm track.
See [`docs/physics/07-storm-relative-wind.md`](docs/physics/07-storm-relative-wind.md)
and [`docs/architecture/44-long-term-source-and-reconstruction-boundary.md`](docs/architecture/44-long-term-source-and-reconstruction-boundary.md)
§8.2.

## Seven prescribed contributions

Inspector **Why this motion?** lists:

1. Environmental advection
2. Updraft
3. Rotation
4. Lower inflow
5. Upper outflow
6. Downdraft
7. Near-ground outflow

## Point diagnostics

At a selected Explore parcel:

- **`T_tilt,y`** — tilting tendency (s⁻²)
- **`ω_y,current`** — current world-vertical vorticity (s⁻¹)

These are different quantities. `T_tilt,y` does not generate
`ω_y,current`. Same sign at a point is not causation.

See [`docs/physics/22-diagnostic-tilting-tendency.md`](docs/physics/22-diagnostic-tilting-tendency.md)
and [`docs/physics/23-diagnostic-vertical-vorticity.md`](docs/physics/23-diagnostic-vertical-vorticity.md).

## What V1 does not model

- a realistic or self-evolving supercell
- forecast / nowcast
- continuity / mass-consistency solver
- thermodynamics, buoyancy, pressure, moisture, microphysics
- live observations, soundings, or reconstructed storms

The full list is in
[`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md).

## Validation status

V1 is closed as a finite validation prototype with limited
human validation. Recorded evidence is the 2026-08-27
M5-AUTHOR semantic/scientific-comprehension session.
Independent 2/3 target-user testing is not available.
38 §11.3 PASS is not claimed. Discoverability is not
independently validated.

See [`docs/reviews/2026-08-27-v1-closed.md`](docs/reviews/2026-08-27-v1-closed.md),
[`docs/architecture/45-m5-human-acceptance-playtest-protocol.md`](docs/architecture/45-m5-human-acceptance-playtest-protocol.md),
[`docs/architecture/46-m5-author-semantic-evidence-classification.md`](docs/architecture/46-m5-author-semantic-evidence-classification.md),
and [`docs/reviews/2026-08-27-m5-author-semantic-comprehension.md`](docs/reviews/2026-08-27-m5-author-semantic-comprehension.md).

## Run locally

```text
npm install
npm run dev
```

## Test, typecheck, build

```text
npm test
npm run typecheck
npm run build
```

The package is private and unpublished. The `package.json`
version is not a scientific-validity or product-maturity claim.

## Documentation

| Document | Role |
| --- | --- |
| [`docs/CONCEPT.md`](docs/CONCEPT.md) | Long-term vision; not the shipped V1 |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Consumer boundary |
| [`docs/architecture/38-v1-scope-checkpoint.md`](docs/architecture/38-v1-scope-checkpoint.md) | V1 promise |
| [`docs/architecture/30-model-class-decision.md`](docs/architecture/30-model-class-decision.md) | Model class A |
| [`docs/architecture/44-long-term-source-and-reconstruction-boundary.md`](docs/architecture/44-long-term-source-and-reconstruction-boundary.md) | Reconstruction boundary |
| [`docs/architecture/48-provider-neutral-environmental-profile-contract.md`](docs/architecture/48-provider-neutral-environmental-profile-contract.md) | Post-V1 environmental-profile contract |
| [`docs/architecture/47-m4-v1-closure-audit-and-plan.md`](docs/architecture/47-m4-v1-closure-audit-and-plan.md) | M4 closure audit / plan |
| [`docs/reviews/2026-08-27-v1-closed.md`](docs/reviews/2026-08-27-v1-closed.md) | V1 CLOSED record |
| [`docs/physics/`](docs/physics/) | Physics source of truth |
| [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md) | Known limitations of current V1 |
| [`docs/PROJECT_BACKLOG.md`](docs/PROJECT_BACKLOG.md) | Index of deferred / open work; not implementation authorization |

## Future direction

`docs/CONCEPT.md` is long-term vision, not a V1 backlog.
Deferred work is indexed in
[`docs/PROJECT_BACKLOG.md`](docs/PROJECT_BACKLOG.md)
(not authorization).
If later engineering continues, the Explorer consume track
starts at data-driven environmental profiles, not at
reconstructing a storm-scale 3D wind field from incomplete
observations. Reconstruction is a separate producer /
research problem; Explorer does not own it.
See [`docs/architecture/44-long-term-source-and-reconstruction-boundary.md`](docs/architecture/44-long-term-source-and-reconstruction-boundary.md)
and [`docs/architecture/48-provider-neutral-environmental-profile-contract.md`](docs/architecture/48-provider-neutral-environmental-profile-contract.md).
