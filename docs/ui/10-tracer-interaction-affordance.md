# Tracer Interaction Affordance

**Status:** UI SoT / Slice 4 COMPLETE
**Scope:** pointer and hover presentation that tells the user
a tracer glyph or trail is selectable. Not a new selection
architecture.
**Physics:** unchanged. Tracer identity, occupancy, and
picking policy stay in existing interaction/rendering SoTs.
**Implementation:** Slice 4 COMPLETE in production `src/**`.
Slice 5 floating hodograph remains NOT STARTED (`11`).

Predecessors:

```text
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
docs/architecture/52-historical-path-probe-architecture.md
docs/rendering/14-tracer-path-history.md
src/ui/tracer/resolveTracerPointerUp.ts
docs/ui/08-scene-toolbar-and-control-states.md
docs/ui/09-world-coordinate-reference.md
```

---

## 1. Purpose

If a tracer or its tail can be clicked, the interface must
look clickable before the click.

Acquisition (`36`, `52`) is closed. Slice 4 adds the missing
hover cursor and a weak hover highlight on the same pick
pipeline.

---

## 2. Current fact (live App)

Verified against `TracerViewport`, `resolveTracerHover`,
`resolveTracerPointerUp`, `pickVisibleTracerSlot`,
`pickPathHistorySample`, `selectionHaloMarker`, and
`hoverHaloMarker`:

```text
Acquisition              screen-space pick, PICK_TOLERANCE_PX = 16
Stationary click         DEFAULT_STATIONARY_CLICK_MOVEMENT_PX = 5
Priority                 glyph hit > path sample > Explore placement
Hover identity           same glyph-then-path hits as click
                         (resolveTracerHover)
Hover owner              TracerScene.hoveredOccupancyIndex,
                         written from TracerViewport pointermove
Selection owner          TracerSelection.selectedId (unchanged)
Selection indication     occupancy color preserved; yellow
                         wireframe halo (SELECTION_HALO_COLOR,
                         radius × 1.6, opacity 0.9)
Hover indication         weaker wireframe halo (HOVER_HALO_COLOR
                         0xd7e3f0, radius × 1.28, opacity 0.4)
Visual precedence        selected > hovered > normal
Trail color              same occupancy color as glyph
Cursor                   canvas.style.cursor = pointer on hover
                         hit; empty string otherwise
Orbit drag               pointerdown + move clears hover; does
                         not run hover pick while captured
Buttons elsewhere        cursor: pointer
HUD                      same pointermove as hover; overlay
                         pointer-events: none
```

Selection identity (`tracerId`, halo, Inspector refresh) stays
closed. Hover does not write `selectedId`.

---

## 3. Scope

In this SoT:

- `cursor: pointer` while the pointer is over a pickable
  glyph or pickable path sample;
- weak hover highlight on the live glyph of that tracer;
- selected appearance remains stronger than hover;
- glyph and tail share the same interaction language.

Out of scope:

- changing `TracerSelection`, `tracerId`, or occupancy mapping;
- changing pick tolerance, stationary-click threshold, or
  hit priority;
- making visual-airflow comets, Eulerian marks, selection
  halo, hover halo, release preview, or grid lines selectable;
- new selection modes;
- Guided-only vs Explore-only split (both already pick);
- hover tooltips, name labels, multi-select, keyboard
  spatial picking.

---

## 4. Interaction semantics

Hover is **presentation of the existing pick pipeline**.

`TracerViewport` uses one `pointermove` listener. That
listener updates the Slice 3 ground-cursor HUD and then
runs the same hit tests click already uses:

```text
pickVisibleTracerAtClientPoint
pickPathHistorySampleAtClientPoint   (when path history exists)
```

`resolveTracerHover` maps those hits to occupancy:

| Hit | Cursor | Hover draw |
| --- | --- | --- |
| visible glyph in tolerance | pointer | hover halo on that glyph |
| path sample in tolerance (no glyph win) | pointer | hover halo on that tracer's live glyph |
| neither | default (orbit/canvas) | none |

Hover identity is tracer occupancy, not a tail segment.
A tail hit highlights the same tracer a later click would
inspect (`inspect-path`) or, if a glyph also hits, the
tracer a click would `select`.

Do not treat hover as selection. Click still goes through
`resolveTracerPointerUp`.

Orbit drag is not hover: while `pointerDown` is set,
`pointermove` clears hover and skips pick. Empty ground in
Explore placement keeps the default canvas cursor; placement
itself is unchanged and does not gain `cursor: pointer`.

---

## 5. Hover vs selected

```text
selected  existing selection halo; occupancy color unchanged
hovered   weaker halo; hidden when the same slot is selected
normal    occupancy color only
```

Precedence:

```text
selected > hovered > normal
```

`resolveHoverHaloObservation` hides the hover shell when
`hoveredSlotIndex === selectedSlotIndex`. The pointer cursor
may still show, because the tracer remains clickable.

Forbidden hover:

- recoloring the glyph to the retired yellow override
  (`SELECTED_TRACER_GLYPH_COLOR`);
- stealing occupancy/path color;
- a halo as large as or larger than the selection halo;
- treating hover as operand / diagnostic tint
  (`HOVER_HALO_COLOR` is not occupancy, not
  `SELECTION_HALO_COLOR`, not
  `OPERAND_HIGHLIGHT_PROTOTYPE_HUE`).

Operand highlight stays on visual-airflow marks. Hover does
not become a diagnostic layer.

---

## 6. Glyph and tail consistency

Click policy is already consistent: glyph wins, else tail
sample (`resolveTracerPointerUp`). Hover follows that
priority so the cursor does not promise a path inspect when a
click would select the glyph.

Tail hover does not suggest that airflow comets are history.
Comets are not pickable (`pickVisibleTracerSlot` scans
`this.slots` only).

Historical path probe marker (`52`) is a result of a path
click, not a hover target of its own.

---

## 7. Ownership

| Concern | Owner | UI/rendering role |
| --- | --- | --- |
| Selected tracer id | `TracerSelection` | unchanged |
| Pick tests | `TracerScene` helpers | reused for hover and click |
| Hover occupancy (ephemeral) | `TracerScene` via viewport pointer | not App laboratory state |
| Selected halo | `selectionHaloMarker` | selected only |
| Hover halo | `hoverHaloMarker` | hidden when selected |
| Inspector | existing click path | not opened on hover |
| Ground E/N HUD | same `pointermove` | `pointer-events: none` |

Hover is cleared when:

- the pointer leaves the canvas;
- neither glyph nor tail hits;
- orbit drag captures the pointer;
- the hovered glyph disappears or `Clear tracers` empties slots;
- the viewport remounts (lab/session change).

Do not lift hover into `lab` or into physics.

---

## 8. Testing expectations

- cursor/hover uses the same pick helpers as click;
- glyph hit suppresses path hover;
- hover does not write `TracerSelection.selectedId`;
- selected appearance wins over hover on the same slot;
- comets / preview / halo are still not pick targets;
- Clear tracers does not leave a stale hovered slot;
- the ground-cursor HUD still updates on `pointermove`;
- selection halo tests remain the selected-state contract;
- no change to `TracerSelection` API.

---

## 9. Implementation slice boundary

This document’s implementation slice is **Slice 4**:

```text
pointer cursor on pickable glyph/tail
weak hover highlight
selected still wins visually
no selection-architecture changes
```

Slice 4 is COMPLETE.

Slice 5 (floating hodograph workspace) is NOT STARTED (`11`).

---

## 10. Anti-claims

```text
This SoT does not change who is selected.
This SoT does not make hover open the Inspector.
This SoT does not pick airflow marks.
This SoT does not restore yellow selected glyphs.
This SoT does not add hover tooltips or name labels.
```
