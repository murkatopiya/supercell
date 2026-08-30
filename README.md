# Supercell Explorer

An interactive kinematic laboratory for exploring how
environmental wind and prescribed storm-local flow geometry
shape tracer trajectories and vertical-tilting diagnostics.

**v0.1 · Research prototype.** This is not a weather forecast
or a full atmospheric simulation. It is a prescribed
kinematic laboratory for examining selected mechanisms under
controlled assumptions.

## What you can do

- **Explore:** choose an observed or prescribed environment,
  release a passive tracer, and follow its recorded path.
- Read **Analysis T1** along the trajectory on a fixed
  symmetric color scale when an Analysis representation is
  available.
- Click a historical sample to inspect environmental
  horizontal vorticity, prescribed updraft-gradient geometry,
  numeric verification, and a constrained what-if alignment.
- Observed environments include Goshen, Prospect Valley,
  Dumas, and Moore. Analysis explanation is not identical
  across all four.

The Source environment advects the tracer. Analysis explains
selected diagnostics along the recorded path. Analysis does
not push the tracer. What-if geometry keeps the observed
environment fixed and does not change laboratory state.

**How It Works** is the workflow guide. **Glossary** defines
laboratory terms and quantities. Explore opens on the Goshen
observed environment; Demo, Prospect Valley, Dumas, and Moore
remain selectable.

A guided walkthrough is planned for a later version. Guided
code remains in the repository; it is not a public v0.1
landing peer of Explore.

## Environmental datasets

Observed environmental wind profiles used in the laboratory
come from sounding archives. Landing event/case links are
contextual information about meteorological events. They are
not the source of the sounding data.

- **EOL dataset 114.114**, NSSL Mobile GPS Advanced Upper-Air
  Sounding System, DOI
  [10.5065/D6CC0Z0Q](https://doi.org/10.5065/D6CC0Z0Q).
  Used for Goshen, Prospect Valley, and Dumas Source profiles
  and matching Analysis representations.
- **NOAA/NCEI Integrated Global Radiosonde Archive (IGRA)
  v2.2**, station USM00072357 (Norman / OUN), DSI-6301.
  Used for the Moore Source profile. Moore has no production
  Analysis representation.

Motion is inspectable: the local velocity is explained by the
prescribed decomposition. The seven named contributions are a
laboratory ontology, not a universal storm decomposition.
See [`docs/physics/12-composite-velocity-field.md`](docs/physics/12-composite-velocity-field.md)
and [`docs/architecture/19-shared-tracer-inspector.md`](docs/architecture/19-shared-tracer-inspector.md).

## Environment and storm motion

Explore can use sounding-derived observed environments
(Goshen, Prospect Valley, Dumas, Moore) or a prescribed demo
profile. Storm-local flow geometry remains prescribed.

Storm motion **`C`** is a prescribed laboratory value, not a
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

At a selected Explore parcel, Point diagnostics shows
current world-vertical vorticity `ω_y,current` sampled at
that point. Public T1 is Analysis T1 along the recorded
path, not a Source Point readout.

Trajectory Analysis T1 is a vertical-tilting diagnostic
along the recorded path. It is not parcel spin-up, not
Δω_y, and does not generate current ω_y.

See [`docs/physics/22-diagnostic-tilting-tendency.md`](docs/physics/22-diagnostic-tilting-tendency.md)
and [`docs/physics/23-diagnostic-vertical-vorticity.md`](docs/physics/23-diagnostic-vertical-vorticity.md).

## What this laboratory does not model

- a realistic or self-evolving supercell
- forecast / nowcast
- continuity / mass-consistency solver
- thermodynamics, buoyancy, pressure, moisture, microphysics
- reconstructed storm evolution

Observed environmental wind profiles are used inside a
prescribed kinematic laboratory. They do not make the
product a simulation of those storms.

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

## Deploy on Railway

The app is a static Vite SPA. Railway builds it with the root
`Dockerfile` and serves `dist/` with Caddy on `$PORT`.

No environment variables are required.

1. Push this repository to GitHub (or another Git remote Railway can
   reach).
2. In [Railway](https://railway.app), create a project and deploy from
   that repository. Railway detects `Dockerfile` automatically.
3. After the first successful deploy, open the service **Settings →
   Networking** and click **Generate Domain**.

Health check path: `/health` (served as the SPA `index.html`).

Local production-image check, if Docker is available:

```text
docker build -t supercell-explorer .
docker run --rm -p 3000:3000 -e PORT=3000 supercell-explorer
```

Then open `http://localhost:3000`.

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
