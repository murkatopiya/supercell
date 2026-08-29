# Dense Observed Hodograph Display

**Status:** IMPLEMENTATION COMPLETE
**Scope:** post-I2 panel presentation for dense imported
hodograph columns. Markers and height labels use one
sparse display subset. The scientific path stays
full-resolution. Not I3. Not Bunkers. Not observed C.
Not thermodynamics. Not radar. Not reconstruction. Not
provider #2. Not an Environment redesign.
**Physics:** unchanged. `EnvironmentalWindProfile`,
`hodographPoints`, interpolation, and diagnostics are
not this problem.
**UI:** `docs/ui/01-hodograph-panel.md` owns panel
drawing rules. This document owns the dense-column
display-index contract and its boundary vs I2.

Predecessor:

```text
docs/architecture/50-i2-goshen-sandbox-integration.md
docs/ui/01-hodograph-panel.md
```

Successor (path-history diagnostics, not hodograph):

```text
docs/architecture/52-historical-path-probe-architecture.md
```

Related research checkpoint (source vs analysis profile
for the Goshen 2155 column; not a display change):

```text
docs/architecture/53-goshen-2155-source-versus-analysis-profile.md
docs/research/2026-08-27-goshen-2155-hodograph-reproduction.md
```

Keep these roles distinct:

```text
CURRENT FACT
NEW PROJECT DECISION
ANTI-CLAIM
```

---

## 1. Why this exists

**CURRENT FACT.** I2 injects the Goshen 2009 observed
column (2029 knots) into Explore. `hodographPoints`
emits every imported knot. That is the scientific path
and remains required.

I2 thinned **height labels** on dense columns. It did
not thin **markers**. `HodographPanel` still drew a
circle on every knot. The I2 wiring test locked 2029
markers. The visible clutter is overlapping `r = 4`
circles, not a resampled profile.

I2 decision that still holds (`50` §8):

```text
I2 data: all 2029 imported knots. No scientific
  resampling of the profile.
I2 display: keep the polyline of imported points.
```

This document completes the display side: sparse
markers use the same subset as height labels.

---

## 2. What stays full-resolution

**NEW PROJECT DECISION.**

```text
EnvironmentalWindProfile     all imported knots
hodographPoints              all imported knots
autoscale / equal aspect     all points (+ overlay C)
SVG polyline vertices        all points, input order
physics / diagnostics        unchanged
```

Sparse markers are presentation only. They are not a
second profile, not a downsampled `HodographPoint[]`,
and not a physics input.

---

## 3. Short columns (DEMO / Guided)

**NEW PROJECT DECISION.**

If `points.length <= 12`:

```text
marker at every knot
height label at every knot
```

DEMO has five knots (`0 / 1000 / 2000 / 6000 / 12000` m).
Guided uses the same DEMO column. Short-column drawing
is unchanged.

---

## 4. Dense display set

**NEW PROJECT DECISION.**

Dense columns (`points.length > 12`) use **one** index
set for markers and for height labels.

Pedagogical target heights (m):

```text
0, 1000, 2000, 3000, 4000, 6000, 8000, 10000, 12000
```

Selection rules:

1. Always include the first knot.
2. Always include the last knot.
3. For each target height inside `[minHeight, maxHeight]`,
   choose the nearest existing knot.
4. Equal distance → smaller index (ascending height).
5. Do not interpolate.
6. Do not create a synthetic knot.
7. Do not change the scientific polyline.
8. Target outside support → skip.
9. Duplicate chosen indices collapse to one.
10. If `selectedHeight` matches an exact knot, include
    that index.
11. Height label is `formatHeightMeters(point.height)` of
    the chosen knot. Not the rounded target string.

Ownership: the display-index helper lives in
`hodographViewTransform.ts`. Physics and App do not
own pedagogical targets.

### 4.1 Goshen

```text
minHeight 2.4 m → target 0 skipped
first endpoint 2.4 m still shown
last endpoint 12261.8 m shown
targets in support: 1 / 2 / 3 / 4 / 6 / 8 / 10 / 12 km
display markers: endpoints + those nearest knots
not 2029 markers
```

---

## 5. Labels

**NEW PROJECT DECISION.**

Labels remain meters. They remain source-knot heights.
`998.6 m` next to the knot nearest 1000 m is correct.
Writing `1000 m` on that wind would be a different
honesty policy and is out of scope.

ANTI-CLAIM:

```text
display markers are not a resampled sounding
a label is not a claim that a knot exists at the
  pedagogical target
km labels are not this slice
```

---

## 6. Out of scope

```text
collision layout
km labels
rounded pedagogical label strings
hover / tooltip system
profile smoothing
polyline downsample
max-distance association cutoff
I3
Bunkers
observed storm motion
thermodynamics
radar
reconstruction
provider #2
Environment chrome redesign
```

---

## 7. Tests

Prefer the display-index helper over pixel snapshots.

```text
short DEMO-like column: every index; marker count =
  label count = points.length
dense synthetic: polyline / source length = N;
  marker count << N; marker count = label count;
  first + last present
nearest knot: missing exact target selects the nearest
  existing knot; label is actual source height
out-of-support target 0: no fake 0 m knot; first
  endpoint remains
dedup: two targets → one knot → one index
Goshen wiring: hodographPoints = 2029; polyline
  vertices = 2029; markers << 2029 and > 2;
  labels = markers; "2.4 m" and "12261.8 m" present
```

Do not duplicate I1 parser / QC / physics tests.
The former I2 assert of 2029 markers is withdrawn.

---

## 8. Compact lock-in

```text
SCIENTIFIC PATH:   full imported knots; full polyline
SHORT COLUMN:      marker + label on every knot
DENSE DISPLAY:     one index set; pedagogical targets;
                   nearest existing knot; actual height
GOSHEN 0 m:        target skipped; endpoint 2.4 m remains
PHYSICS:           unchanged
I2:                still owns sandbox identity; this
                   document owns dense marker thinning
IMPLEMENTATION:    COMPLETE
```
