# Tracer Interaction Affordance

**Status:** UI SoT / NOT STARTED
**Scope:** pointer and hover presentation that tells the user
a tracer glyph or trail is selectable. Not a new selection
architecture.
**Physics:** unchanged. Tracer identity, occupancy, and
picking policy stay in existing interaction/rendering SoTs.
**Implementation:** NOT STARTED. This document does not include
that implementation.

Predecessors:

```text
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
docs/architecture/52-historical-path-probe-architecture.md
docs/rendering/14-tracer-path-history.md
src/ui/tracer/resolveTracerPointerUp.ts
docs/ui/08-scene-toolbar-and-control-states.md
```

---

## 1. Purpose

If a tracer or its tail can be clicked, the interface must
look clickable.

Today acquisition works (`36`, `52`) but the canvas gives no
hover cursor and no hover highlight. First-time users cannot
tell that glyphs and pathlines are targets.

---

## 2. Current fact (live App)

Verified against `TracerViewport`, `resolveTracerPointerUp`,
`pickVisibleTracerSlot`, `pickPathHistorySample`, and
`selectionHaloMarker`:

```text
Acquisition              screen-space pick, PICK_TOLERANCE_PX = 16
Stationary click         DEFAULT_STATIONARY_CLICK_MOVEMENT_PX = 5
Priority                 glyph hit > path sample > Explore placement
Selection indication     occupancy color preserved; yellow
                         wireframe halo (SELECTION_HALO_COLOR)
Trail color              same occupancy color as glyph
Hover                    none (no pointermove pick, no CSS cursor
                         on .tracer-viewport__canvas)
Buttons elsewhere        cursor: pointer; canvas uses default
```

Selection identity (`tracerId`, halo, Inspector refresh) is
COMPLETE and stays closed.

---

## 3. Scope

In this SoT:

- `cursor: pointer` (or equivalent) while the pointer is over
  a pickable glyph or pickable path sample;
- optional light hover highlight;
- selected appearance remains stronger than hover;
- glyph and tail share the same interaction language.

Out of scope:

- changing `TracerSelection`, `tracerId`, or occupancy mapping;
- changing pick tolerance, stationary-click threshold, or
  hit priority;
- making visual-airflow comets, Eulerian marks, selection
  halo, release preview, or grid lines selectable;
- new selection modes;
- Guided-only vs Explore-only split (both already pick).

---

## 4. Interaction semantics

Hover is **presentation of the existing pick pipeline**.

On pointer move over the canvas, run the same hit tests click
already uses:

```text
pickVisibleTracerAtClientPoint
pickPathHistorySampleAtClientPoint   (when path history exists)
```

Then:

| Hit | Cursor | Hover draw |
| --- | --- | --- |
| visible glyph in tolerance | pointer | optional glyph hover |
| path sample in tolerance (no glyph win) | pointer | optional path hover |
| neither | default (orbit/canvas) | none |

Do not treat hover as selection. Leaving the target clears
hover. Click still goes through `resolveTracerPointerUp`.

Orbit drag (movement above the stationary threshold) is not
hover. Implementation may ignore hover during an active
pointer capture used for OrbitControls.

---

## 5. Hover vs selected

```text
hover     weaker than selected
selected  existing halo; occupancy color unchanged (36 Slice 2)
```

Allowed hover:

- slight emissive / brightness / outline weaker than the
  selection halo;
- cursor change alone (minimum contract).

Forbidden hover:

- recoloring the glyph to the retired yellow override
  (`SELECTED_TRACER_GLYPH_COLOR`);
- stealing occupancy/path color;
- a second halo as large as or larger than the selection halo;
- hovering one tracer while drawing selected styling on
  another.

If both hover and selected apply to the same tracer, show
**selected** only (no stacked hover+selected that looks like a
new identity).

---

## 6. Glyph and tail consistency

Click policy is already consistent: glyph wins, else tail
sample (`resolveTracerPointerUp`). Hover must follow that
priority so the cursor does not promise a path inspect when a
click would select the glyph.

Tail hover must not suggest that airflow comets are history.
Comets are not pickable (`36` tests already keep pick on
tracer slots only).

Historical path probe marker (`52`) is a result of a path
click, not a hover target of its own in this slice.

---

## 7. Ownership

| Concern | Owner | UI/rendering role |
| --- | --- | --- |
| Selected tracer id | `TracerSelection` | unchanged |
| Pick tests | `TracerScene` helpers | reused for hover |
| Hover id / slot (ephemeral) | viewport presentation | not App laboratory state |
| Halo | `selectionHaloMarker` | selected only |
| Inspector | existing click path | not opened on hover |

Do not lift hover into `lab` or into physics. A ref inside
`TracerViewport` / `TracerScene` is enough.

---

## 8. Testing expectations

- cursor/hover uses the same pick helpers as click;
- glyph hit suppresses path hover;
- comets / preview / halo are still not pick targets;
- selection halo tests remain the selected-state contract;
- no change to `TracerSelection` API required.

---

## 9. Implementation slice boundary

This document’s implementation slice is **Slice 4**:

```text
pointer cursor on pickable glyph/tail
optional weak hover highlight
selected still wins visually
no selection-architecture changes
```

Slice 4 is NOT STARTED.

---

## 10. Anti-claims

```text
This SoT does not change who is selected.
This SoT does not make hover open the Inspector.
This SoT does not pick airflow marks.
This SoT does not restore yellow selected glyphs.
```
