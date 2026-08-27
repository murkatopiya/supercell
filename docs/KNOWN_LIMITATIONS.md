# V1 Known Limitations

Material facts about current Supercell Explorer V1.
These are limitations, not a promise that each item will be
fixed next. POST-V1 ideas are not listed here; see
[`docs/architecture/38-v1-scope-checkpoint.md`](architecture/38-v1-scope-checkpoint.md)
§13 and
[`docs/architecture/44-long-term-source-and-reconstruction-boundary.md`](architecture/44-long-term-source-and-reconstruction-boundary.md).

## A. Scientific / model

- V1 is a **prescribed kinematic laboratory**. Velocities are
  authored, not evolved.
- There is **no prognostic / self-evolving storm**.
- There is **no feedback from vorticity into velocity**.
  Diagnostics observe the flow; they never feed it.
- There is **no continuity / mass-consistency solver**.
  Composite divergence residual is YELLOW in
  [`docs/architecture/10-composite-continuity-mass-budget-audit.md`](architecture/10-composite-continuity-mass-budget-audit.md)
  and is not sold as closed.
- There is **no thermodynamics, buoyancy, pressure, moisture,
  or microphysics**.
- There is **one fixed environmental wind profile**
  (`DEMO_SCENARIO`). The hodograph is not editable.
- Storm motion **`C` is a prescribed constant**
  `(10, 0)` m/s, value-only: not an estimator and not an
  observed track.
- The **seven V1 operands** (Environmental advection, Updraft,
  Rotation, Lower inflow, Upper outflow, Downdraft,
  Near-ground outflow) are a **prescribed V1 laboratory
  ontology**, not a universal physical decomposition.
- **`T_tilt,y` does not generate `ω_y,current`.** Same sign
  at a point is not causation.
- A later reconstructed, model, or dataset field **need not
  expose these seven operands**.
- **Whole-storm visual legibility is not a V1 promise.**
- **Ω** remains prescribed (`0.005` rad/s in DEMO).
- The production integrator is **Euler**; timestep is external.
  RK2 exists as a test-only integrator.

## B. Data

- No live observed atmosphere.
- No sounding provider.
- No RAOB / RAP / HRRR integration.
- No observed-storm reconstruction.
- No retrieval / dual-Doppler / data-assimilation system.
- No uncertainty / confidence channel on `VelocityField`.

## C. Validation

- M5-AUTHOR semantic / scientific comprehension: **COMPLETE**
  ([`docs/architecture/46-m5-author-semantic-evidence-classification.md`](architecture/46-m5-author-semantic-evidence-classification.md),
  [`docs/reviews/2026-08-27-m5-author-semantic-comprehension.md`](reviews/2026-08-27-m5-author-semantic-comprehension.md)).
- M5-AUTHOR discoverability: **NOT CLAIMED**.
- Independent 2/3 human criterion
  ([`docs/architecture/38-v1-scope-checkpoint.md`](architecture/38-v1-scope-checkpoint.md)
  §11.3): **NOT MET**. **`38` §11.3 PASS is not claimed.**
- M5-INDEPENDENT: **NOT YET AVAILABLE**.
- **V1 CLOSED** as a finite validation prototype with limited
  human validation. Authorized wording
  ([`docs/architecture/47-m4-v1-closure-audit-and-plan.md`](architecture/47-m4-v1-closure-audit-and-plan.md)
  §10.4;
  [`docs/reviews/2026-08-27-v1-closed.md`](reviews/2026-08-27-v1-closed.md)):

```text
V1 is closed as a finite validation prototype with limited
human validation. Recorded evidence is the 2026-08-27
M5-AUTHOR semantic/scientific-comprehension session.
Independent 2/3 target-user testing is not available.
38 §11.3 PASS is not claimed. Discoverability is not
independently validated.
```

## D. UX / accessibility / interpretation

- Explore has no dedicated persistent “not a simulation”
  sentence before selection (Guided does).
- Observation empty state points at selection, not Release.
- No mode purpose lines (“Guided vs Explore is for…”).
- Environment sits visually with Guided/Explore and is not a
  mode; Guided column vs Explore overlay are not unified.
- Airflow / Highlight / Depth cue remain on the Explore left
  rail.
- Compact Highlight copy omits “orientation / motion =
  `V_total`” (full claim is in title/details; default Off).
- Highlight magenta-on-navy can be hard at distance.
- Research-prototype chrome, not production-quality UX.
- One fixed environment; hodograph height is not bound to
  tracer altitude.
- Guided does not mount Explore-only tools (release, Follow,
  Airflow, Point diagnostics) — by contract.
- `V_total` as the sum of the seven rows is implicit under
  “Why this motion?”; there is no on-screen `V_total = Σ V_i`
  sentence.
- Physical roles of all seven operands are not taught from
  first principles. V1 assumes basic severe-weather literacy.
- `Ω` is undefined jargon on the Point diagnostics surface.
- Canvas parcel **release** and **selection** are pointer-only.
  There is no keyboard / assistive-technology parity for those
  actions.
- The scene axes helper has **no N / E / S / W labels**. It is
  not a compass.
- Desktop-first. Existing breakpoints are not a mobile product.
