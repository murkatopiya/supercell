# Storm-Motion Sensitivity — Formal Pre-Run SRH Sign Correction

**Status:** CLOSED · PRE-RUN SPECIFICATION CORRECTION · NO CAMPAIGN EXECUTION

## 1. Discovery and scope

The sign inconsistency was identified during validation-harness implementation review,
before any scientific H1/H2/H3 campaign stage had been executed. Harness implementation
review is complete. This record closes the specification issue; review of the correction
diff/commit and separate authorization of H1 only remain pending.

The research protocol accidentally froze the negative of the project's existing SRH
integrand and propagated that sign into the H2 oracle, harness design, and audit wording.
The original incorrect formula was:

`SRH = integral[(u - C_e) dv/dh - (v - C_n) du/dh] dh`.

This is a pre-run oracle/specification correction derived from canonical physics,
not post-hoc retuning to backend campaign output. No new physics is introduced.

## 2. Canonical definition and Form A → Form B

The authoritative [physics document 09](../physics/09-storm-relative-helicity.md),
§§3–6 and §8.2, defines atmospheric east/north components:

`omega_h = (-dv/dh, du/dh)`

`SRH = integral(V_sr,h · omega_h dh)`

and therefore:

`SRH = integral[(v - C_n) du/dh - (u - C_e) dv/dh] dh`.

For one piecewise-linear segment, let `dh = hb-ha > 0`, with storm-relative
endpoint winds `(Ua,Va)` and `(Ub,Vb)`. Constant storm motion gives
`deltaU = Ub-Ua = ub-ua` and `deltaV = Vb-Va = vb-va`.
The segment vorticity is constant and the wind is linear, so Form A integrates exactly:

```text
SRH_segment = dh * omega_h · V_sr,avg
            = dh * [(-deltaV/dh)*(Ua+Ub)/2 + (deltaU/dh)*(Va+Vb)/2]
            = [(Ub-Ua)*(Va+Vb) - (Vb-Va)*(Ua+Ub)]/2
            = Ub*Va - Ua*Vb
```

The last line is canonical Form B. These are equivalent expressions of the existing
definition; world-coordinate conversion and a new sign convention are not involved.

## 3. Existing implementation and independent validation

[Production `stormRelativeHelicityBetween()`](../../src/physics/environment/stormRelativeHelicity.ts)
already sums `ub*va - ua*vb` over the requested piecewise-linear subsegments.
It agrees with canonical doc 09 and requires no change.

The [existing SRH tests](../../src/physics/environment/stormRelativeHelicity.test.ts)
independently compute Form A in `formASrhBetween()` using segment shear, horizontal
vorticity, and average storm-relative wind. `expectMatchesFormA()` compares this
with production Form B. Existing tests cover positive streamwise and negative
anti-streamwise contributions, signed cancellation, interior endpoints, and
multi-segment layers. These tests already validate the production sign; neither
their expectations nor their tolerance is changed by this correction.

## 4. Exact H2 oracle correction

For the frozen straight profile, `v=0`, `dv/dh=0`, and `u(3000)-u(0)=30 m/s`.
Analytically, canonical SRH is `-C_n * 30`, independent of `C_e` for this control.
These are pre-run analytical expectations, not measured campaign results:

| H2 control | Storm motion (east, north), m/s | Incorrect oracle, m²/s² | Corrected oracle, m²/s² |
| --- | --- | --- | --- |
| C1 | (10, 0) | 0 | 0 |
| C2 | (10, +10) | +300 | -300 |
| C3 | (20, +10) | +300 | -300 |

Thus `0,+300,+300 → 0,-300,-300`. C2/C3 remain an iso-SRH pair with distinct
storm-relative winds. H1 Sweep A remains zero; the transverse response and all
decomposition expectations are unchanged.

The absolute SRH tolerance remains `1e-6 m^2/s^2`:

- expected zero: `|SRH| <= 1e-6`;
- expected -300: `|SRH - (-300)| <= 1e-6`, equivalently `|SRH + 300| <= 1e-6`.

All other frozen hypotheses, storm motions, soundings, prescribed fields, strict
equality tolerances, H3 geometry, seed, timestep, sampling semantics, status logic,
and staged execution rules remain unchanged.

## 5. Correction scope and execution gate

The correction is synchronized into the parent protocol, harness design, the explicit
SRH expectation in audit §2.5, the H2 test-only oracle, validation README, and project
status. Production physics, canonical doc 09, canonical SRH tests, UI, DEMO, and
ScenarioConfig remain unchanged.

Verification is limited to typecheck and the validation module with no selected
campaign stage. This slice does not authorize any campaign execution, including H1,
and does not authorize H2/H3. No scientific metrics or Results sections are generated.

Next action: review the completed correction diff/report before any commit or push;
then separately authorize H1 only. Classify H1 before considering a later stage.

## 6. Implementation verification

- `npm run typecheck`: PASS.
- Validation module with `STORM_MOTION_VALIDATION_STAGE` absent: 11 infrastructure
  tests passed; all 4 campaign tests skipped.
- Comparison against the pre-slice harness confirmed that its only content change
  is `[0, 300, 300] → [0, -300, -300]` in the H2 SRH oracle.
- No production/canonical SRH source or existing SRH test changes; no campaign
  execution, scientific metrics, commit, or push performed in this slice.
