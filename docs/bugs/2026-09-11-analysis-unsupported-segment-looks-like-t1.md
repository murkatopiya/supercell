# Unsupported Analysis segment can look like a T1 value

**Status:** OPEN

**Class:** SEMANTIC UX BUG

**Discovered:** 2026-09-11 during manual Explore playtest while auditing low-altitude tracer behavior.

## Summary

When a recorded trajectory segment lies outside the Analysis height domain, the Analysis T1 overlay correctly omits a scientific value and the diagnostic panels report that Analysis T1 is unavailable.

However, the ordinary tracer occupancy/history trail remains visible underneath. For tracer slot 1 that identity trail is red (`0xe74c3c`). Because the T1 legend is simultaneously visible and also uses warm/red colors for signed T1, the unsupported segment can be misread as a strong T1 value.

This is especially misleading because human attention is drawn to the red trajectory before the textual `OUTSIDE THE ANALYSIS HEIGHT DOMAIN` message is read.

## Reproduction

1. Open Explore.
2. Release the first tracer at a very low altitude (manual playtest used `Altitude = 1 m`).
3. Let the tracer move long enough to create a recorded path.
4. Click a low-altitude red section of the path.
5. Observe:
   - the right-side T1 panel reports `OUTSIDE THE ANALYSIS HEIGHT DOMAIN`;
   - What-if geometry is unavailable;
   - diagnostic vectors are absent;
   - the trajectory section is nevertheless visibly red.
6. Click a supported higher-altitude section of the same path and compare: Analysis vectors and T1 diagnostics appear there.

## Expected behavior

A trajectory region with no Analysis T1 value must not visually resemble a valid scientific T1 encoding.

Unsupported / out-of-domain state should be visually distinguishable from every signed T1 value.

## Actual behavior

The T1 overlay correctly creates no value segment for unsupported samples, but the underlying occupancy trail remains visible in the tracer identity color.

For the first tracer that identity color is red, which is semantically confusable with the warm/red end of the Analysis T1 scale.

## Why this matters

This can cause a direct scientific interpretation error: a user may conclude that the low-altitude path has a large positive/negative T1 when the correct state is `no Analysis value`.

The bug is therefore not merely palette polish. It is a semantic conflict between identity encoding and scientific value encoding.

## Confirmed mechanism

Current architecture intentionally omits Analysis value color and overlay primitives for `OUT_OF_DOMAIN` / `COLUMN_UNAVAILABLE` samples.

The ordinary trajectory/occupancy trail is still present underneath and uses `TRACER_COLORS`. Slot 1 uses red (`0xe74c3c`).

Thus the visible red unsupported segment is tracer identity, not T1.

## Fix candidates

Decision not yet made. Valid directions include:

1. Render unsupported Analysis path sections in a neutral, non-diagnostic color while Analysis mode is active.
2. Use an explicit unsupported style (for example muted/dashed/faded) that cannot be confused with the signed T1 scale.
3. Mask or otherwise suppress identity colors beneath the Analysis representation where no Analysis value exists, while preserving a clear indication that the path continues.
4. Add stronger visual/textual unavailable-state cues, but do not rely on text alone if the path itself still looks scientifically encoded.

Any solution should preserve the distinction between tracer identity and Analysis value semantics.

## Non-solution

Do not assign a fake zero T1 to unsupported segments. `OUT_OF_DOMAIN` is not numeric zero.

## Verification

After the fix:

- an unsupported trajectory segment must remain identifiable as part of the path;
- it must not use a color/style that can plausibly be read from the T1 signed-value legend;
- clicking it must continue to report unavailable/out-of-domain Analysis state;
- supported neighboring segments must retain normal T1 encoding and diagnostics.

## Related documents

- `docs/research/2026-09-11-storm-motion-sensitivity-architecture-audit.md` — finding A2 / low-altitude manual probe context.
- `docs/architecture/62-trajectory-tilting-explorer-v1.md` — Analysis rendering/support semantics.
