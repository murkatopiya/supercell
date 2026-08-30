# Telemetry Lab — exploratory observational-data workbench

**Status:** IDEA / INTERESTING POSSIBILITY
**Not:** roadmap, architecture SoT, implementation authorization, scientific method selection

## Origin

The idea emerged while investigating high-resolution ESC sounding data for the Supercell project. A repeatable ~17–19 s structure became visible only after examining the same telemetry through several analytical representations. This echoed an earlier telemetry-debugging experience: patterns that are hard to notice in raw records can become obvious once the data are visualized from several complementary angles.

## Product idea

Build a general exploratory workbench for meteorological telemetry / observational profiles.

The user loads raw or normalized observational data and inspects the **same observation through multiple linked analytical views** rather than through one canonical plot.

Possible views:

- raw time series;
- vertical profile by height / pressure;
- hodograph;
- ascent rate / platform-motion proxies;
- local increments and gradients (`ΔV/Δt`, `ΔV/Δz`);
- residuals after an explicitly declared transform;
- periodogram / power spectral density;
- spectrogram / time-frequency view;
- autocorrelation;
- QC flags, gaps and sampling cadence;
- Source vs transformed Analysis comparison.

## Key interaction

Selections are linked across representations.

Example:

1. A spectral peak around 18 s is selected.
2. The tool highlights where that feature occurs in time.
3. The same interval is highlighted in height, U/V, ascent-rate and hodograph views.
4. The user can compare the same feature across independent soundings.

The goal is not “more charts”, but:

> **Show me the same observation through different analytical lenses.**

## Compare mode

Allow several profiles / launches to be aligned and compared in different domains:

- time;
- height;
- pressure;
- source index where scientifically meaningful.

This should make it easier to distinguish structures that repeat in **time** from those that repeat in **space**, and to test whether a feature follows the atmosphere, the platform, the sensor or the processing chain.

## Epistemic rule

The tool must not automatically label a detected feature as an artifact or physical anomaly.

Prefer neutral terms such as:

- candidate feature;
- recurring structure;
- spectral feature;
- flagged region.

Detection and interpretation are separate steps. A recurring pattern may be observable before its physical origin is known.

## Transform transparency

A future transform-comparison view should show not only the transformed signal, but what the operator removes or retains.

For example:

- Source vs Analysis overlay;
- transfer response;
- attenuation near a selected timescale / wavelength;
- retained larger-scale signal;
- declared transform domain and reliability scale.

Avoid a magic generic **SMOOTH** control. Every transform should expose its meaning and domain.

## Relationship to Supercell Explorer

Do **not** assume this belongs inside the current Explorer UI.

A cleaner boundary may be:

```text
Telemetry Lab
  raw / normalized observations
  → inspection
  → feature discovery
  → source qualification
  → transform evaluation
  → qualified AnalysisProfile / evidence

Supercell Explorer
  consumes qualified Source / Analysis representations
  for visualization and diagnostics
```

Telemetry Lab would answer a different question from Explorer:

> **Why should this Source → Analysis transformation be trusted for this source class and diagnostic?**

It could share normalized observational-profile formats and research utilities with Supercell Explorer without becoming part of its runtime product.

## Motivating case

High-resolution mobile ESC soundings (Goshen, Prospect Valley, Dumas) showed a repeatable ~17–19 s structure whose physical origin remains unresolved. Its temporal consistency across soundings, despite different ascent rates and therefore different vertical equivalents, helped motivate a source-class-aware, time-domain reliability policy.

This is a good prototype case for the workbench because it demonstrates the intended workflow:

```text
raw telemetry
→ visual pattern
→ recurring signature
→ cross-case comparison
→ domain question
→ transform experiment
→ reliability decision
```

## Return when

Revisit only after current Supercell Explorer priorities allow a separate exploratory-data-tooling track, or when repeated manual telemetry investigations make the cost of not having such a workbench obvious.

**BACKLOG / IDEA ONLY. No implementation is authorized by this note.**
