# Supercell Explorer

**[Open the live laboratory](https://supercell.iryna.online/)** · [Run locally](#run-locally) · [Scientific evidence](#scientific-evidence)

Supercell Explorer is an interactive kinematic laboratory for exploring supercell flow. Release passive tracers into a prescribed velocity field, follow their paths, and inspect the conditions and vector geometry they encounter along the way. Environmental wind comes from selected sounding-derived profiles; the storm-local flow is prescribed by the model.

The research question is simple: **how does following a moving tracer change what we see compared with observing the flow at a fixed point?** A hodograph shows how environmental wind varies with height. A tracer adds a moving perspective through the laboratory's flow, without changing that flow itself.

**Latest published product release: V1.1, released/deployed on 2026-09-16.** V1 was the previous public release. V1.1 adds interactive prescribed storm motion for the observed environments. Product publication is separate from scientific validation.

## Explore the laboratory

- Select Goshen, Prospect Valley, Dumas or Moore sounding-derived wind, or the prescribed Demo. Explore opens with Goshen.
- Change **C**, the prescribed storm-motion vector assigned in the experiment, for an observed environment. It sets the eastward/northward motion used to express environmental wind relative to the storm; it is not a storm-motion estimator or a measured track of these storms.
- Apply changed storm motion to start a new experiment; this clears current tracers and history. Demo keeps its prescribed storm motion.
- Release tracers, follow their paths, and select recorded samples to inspect motion and available diagnostics.
- Explore how horizontal rotation can be tilted into the vertical as a tracer moves through the prescribed updraft. This tilting is described by **T1**, a reduced diagnostic. Where supported, **Analysis T1** explains the tilting geometry along the recorded trajectory.

The application's **User Guide**, **How It Works** and **Glossary** explain the controls and concepts.

## What the model represents

| Component | Meaning |
| --- | --- |
| Environmental wind | Selected sounding-derived observations, or a prescribed Demo profile |
| Storm-local flow | Prescribed updraft, rotation, inflow, outflow and downdraft geometry |
| Storm motion C | A vector assigned in the experiment |
| Tracers | Passive markers transported by the combined velocity field |
| T1 | An explanatory diagnostic; it does not drive tracer motion |

This is a **kinematic prescribed-flow model**. It has no thermodynamic model, buoyancy, moisture, pressure dynamics, microphysics or continuity/mass-consistency solver. The tracers are not full thermodynamic air parcels. The application is not a forecast, a reconstruction of the historical storms or a dynamically evolving supercell simulation.

T1 is diagnostic only: it is not full vorticity evolution or parcel spin-up. The environmental profile used to move tracers (**Source**) and the processed representation used to explain tilting (**Analysis**) are separate.

## Scientific evidence

The September 2026 evidence supports selected analytical expectations within the prescribed model:

- Selected synthetic controls passed their registered analytical checks.
- Observed-profile storm-motion sensitivity identities passed at fixed points in the flow (the Eulerian view).
- These checks test implementation behavior within the model; they do not validate the realism of a complete storm.

Changing prescribed storm motion changes storm-relative wind and can alter a tracer's path. With the environmental profile and prescribed updraft held unchanged, the local tilting diagnostic at a fixed point remains unchanged. A different path can therefore sample different parts of the same diagnostic geometry.

The first attempt to measure how changing prescribed storm motion affects tracer trajectories in the observed environments did not meet the required numerical-convergence criteria, so it cannot support a scientific conclusion about that response. It was classified **INVALID CONTROL**: a measurement/numerical-control qualification failure, not a physics failure, a null result or falsification of the response hypothesis.

The V1 evaluation of usability and scientific comprehension was performed only by the author; that closure did not establish independent target-user validation or a formal usability study.

Methodology, recorded results and exclusions:

- [Synthetic control protocol and results](docs/research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md)
- [Observed fixed-point findings](docs/research/2026-09-12-observed-c-matrix-protocol-design.md#143-scientific-findings-within-the-frozen-controls)
- [Trajectory campaign outcome and evidence](docs/PROJECT_STATUS.md#phase-p-execution-and-human-closure)
- [T1 derivation](docs/physics/22-diagnostic-tilting-tendency.md) and [trajectory diagnostic methodology](docs/architecture/62-trajectory-tilting-explorer-v1.md)
- [V1 human-evaluation closure](docs/reviews/2026-08-27-v1-closed.md)

**For current research gates, permissions and qualification status, use [PROJECT_STATUS](docs/PROJECT_STATUS.md).** The [documentation index](docs/README.md) leads to the owning methodology and evidence records.

## Environmental data

These are selected environmental soundings associated with historical cases, not complete observed storm fields.

| Environment | Sounding identity | Time (UTC) | Archive | T1 diagnostic |
| --- | --- | --- | --- | --- |
| Goshen | NSSL1 | 2009-06-05 21:55:22 | EOL 114.114 | Available within supported region |
| Prospect Valley | NSSL1 | 2010-05-26 22:23:46 | EOL 114.114 | Available within supported region |
| Dumas | NSSL2 | 2010-05-18 21:52:18 | EOL 114.114 | Available within supported region |
| Moore | OUN / USM00072357 | 2013-05-20 16:51 (nominal 17 UTC) | NOAA/NCEI IGRA v2.2 | Not available |
| Demo | Prescribed / synthetic environment | Not an observed launch | Project-authored profile | Not available |

The supported region is the portion of the processed profile where the diagnostic's data and numerical support requirements are met. An unavailable or unsupported diagnostic is not numeric zero.

EOL observations come from NSF NCAR Earth Observing Laboratory's NOAA/NSSL MGAUS Radiosonde Data — EOL Sounding Composite Format, version 1.0, DOI [10.5065/D6CC0Z0Q](https://doi.org/10.5065/D6CC0Z0Q). Moore comes from the Integrated Global Radiosonde Archive, Version 2 (v2.2 files), DOI [10.7289/V5X63K0Q](https://doi.org/10.7289/V5X63K0Q). Its input source code `ncdc6301` identifies NCDC U.S. Rawindsonde Data / DSI-6301, not the IGRA archive's name or license.

Normal runtime uses committed normalized subsets, not native archive files. See [data attribution and source terms](THIRD_PARTY_NOTICES.md), [EOL source qualification](docs/research/2026-08-28-vortex2-source-qualification.md), [additional case selection](docs/research/2026-08-28-additional-sounding-case-selection.md) and [Moore source qualification](docs/research/2026-08-28-moore-oun-igra-source-qualification.md). Event links in the application provide meteorological context; they are not the source of the sounding data.

## Run locally

Requires **Node.js >=20.19.0** and npm. From a repository checkout:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

Developer/software checks and production build:

```sh
npm test
npm run typecheck
npm run build
```

These commands are not scientific qualification or a reproduction of campaign conclusions. Scientific campaign entries are separately gated. The npm package is private and unpublished; its package version is separate from the public product release.

## License, author and citation

**Author / maintainer: Iryna Hnatovska** · [Professional portfolio](https://iryna.online)

Iryna-owned Supercell Explorer code is source publicly available under [PolyForm Noncommercial 1.0.0](LICENSE.md). Commercial use of that code requires separate permission/license from Iryna Hnatovska where not permitted by the public license; use the portfolio above for contact. The license's own permitted purposes and organizational provisions apply without additional restrictions.

Required Notice: Copyright 2026 Iryna Hnatovska.

External observations, dependencies, upstream adaptations and other third-party materials retain their own terms and are excluded from this project-code license. See [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md) for scope and attribution, including the logo's generated provenance.

Use [CITATION.cff](CITATION.cff) to cite Supercell Explorer. Cite the source datasets separately when using their observations; software citation does not replace data attribution.

## Further reading

Start with [PROJECT_STATUS](docs/PROJECT_STATUS.md), the [documentation index](docs/README.md), [physics definitions](docs/physics/) or [software architecture](docs/ARCHITECTURE.md). [Known limitations](docs/KNOWN_LIMITATIONS.md) preserves the historical V1 baseline with scope clarifications. [Long-term vision](docs/CONCEPT.md) describes future concepts, not implemented capabilities.
