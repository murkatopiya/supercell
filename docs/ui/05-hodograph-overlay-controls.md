# Hodograph Overlay Controls (v1)

## 1. Purpose

This document defines the first visibility controls for hodograph overlays.

It adds a simple checkbox group next to the hodograph panel so each existing
overlay can be shown or hidden independently for teaching and inspection.

Related UI:

    docs/ui/01-hodograph-panel.md
    docs/ui/02-storm-motion-overlay.md
    docs/ui/03-storm-relative-wind-overlay.md
    docs/ui/04-horizontal-vorticity-overlay.md

The controls answer:

    Which hodograph overlays are currently drawn?

They do not change physics values, recompute diagnostics, or alter the base
ground-relative hodograph path.

---

## 2. Scope

In v1:

- UI/app owns overlay visibility state;
- a checkbox group titled **Hodograph overlays**;
- independent toggles for:
  - Storm motion `C`
  - Storm-relative wind `V_sr`
  - Horizontal vorticity `ω_h`
  - later: Streamwise / crosswise vorticity
    (see `docs/ui/06-streamwise-crosswise-vorticity-overlay.md`)
- the base ground-relative hodograph (axes, polyline, knot markers, height
  labels) is **always visible** and is not part of visibility state;
- physics data payloads remain present regardless of visibility;
- viewport / domain / transform stay stable while toggling visibility.

Out of scope for v1:

- new physics diagnostics;
- streamwise / crosswise overlays as defined in this controls document's
  first slice (see instead
  `docs/ui/06-streamwise-crosswise-vorticity-overlay.md` for that overlay);
- SRH area;
- persistence / `localStorage`;
- keyboard shortcuts;
- presets;
- design-system / UI-framework dependencies;
- putting visibility inside physics modules.

---

## 3. Ownership of state

Visibility state belongs to **UI / app composition**, not to physics.

Preferred placement:

    App (or a thin controls sibling with state lifted to App)
        ├── HodographOverlayControls   // checkboxes only
        └── HodographPanel             // draws according to visibility

`HodographPanel` must not be the source of truth for visibility chrome, though
it may receive the visibility object as a prop and apply draw gates.

Physics modules must not import or store visibility flags.

---

## 4. Visibility state type

Minimal type — only currently implemented overlays:

    interface HodographOverlayVisibility {
      stormMotion: boolean;
      stormRelativeWind: boolean;
      horizontalVorticity: boolean;
    }

Demo default:

    {
      stormMotion: true,
      stormRelativeWind: true,
      horizontalVorticity: true,
    }

Do not add placeholder fields for SRH, streamwise, or other future overlays.

The base hodograph is intentionally absent from this type: it is always on.

---

## 5. Presence of data vs visibility

Keep these distinct.

Composition always prepares overlay **data** when the demo/scenario has them:

    points
    stormMotion
    selectedHeight
    vorticityLayer

Visibility decides whether those layers are **drawn**.

Do not implement hiding solely by omitting props such as:

    stormMotion={visibility.stormMotion ? C : undefined}

That conflates “no physics input” with “hidden overlay” and would fight the
stable-viewport rule in §8.

Panel API intent:

    <HodographPanel
      points={points}
      stormMotion={stormMotion}
      selectedHeight={selectedHeight}
      vorticityLayer={vorticityLayer}
      overlayVisibility={visibility}
    />

Data props stay populated; `overlayVisibility` gates drawing.

---

## 6. Effective draw rules

### 6.1 Storm motion `C`

Drawn when:

    overlayVisibility.stormMotion === true
    AND stormMotion data is provided

### 6.2 Storm-relative wind `V_sr`

`V_sr` is pedagogically a vector **from visible `C`** to the selected wind
knot.

**Stored state** (`overlayVisibility.stormRelativeWind`) and **effective
draw** are distinct.

Contract (v1 lock-in — preserve stored intent):

1. The `V_sr` checkbox is **enabled** only when
   `overlayVisibility.stormMotion === true`.
2. When `stormMotion` is hidden, the `V_sr` checkbox is **disabled**.
3. Disabling / hiding `C` does **not** force-reset stored
   `stormRelativeWind` to `false`. If it was `true`, it remains `true` while
   disabled.
4. Effective draw for `V_sr` requires all of:
   - stored `stormRelativeWind === true`;
   - `stormMotion` visibility `true` (visible `C`);
   - existing geometry prerequisites from document 03
     (`stormMotion` data, exact selected knot, etc.).
5. When `C` is shown again, the previous stored `stormRelativeWind` value
   applies immediately (no need to re-check the box if it was left `true`).

Do not use the alternate force-reset contract in v1.

Rationale: temporary hiding of `C` should not destroy the user’s intent to
show `V_sr`; the dependency is expressed by disable + effective draw, not by
mutating stored preference.

### 6.3 Horizontal vorticity `ω_h`

Fully independent of `C` and `V_sr`.

Drawn (segment / arrow according to document 04) when:

    overlayVisibility.horizontalVorticity === true
    AND vorticityLayer resolves as in document 04

Zero vorticity still follows document 04: segment highlight may appear without
an arrow when the layer is valid and this visibility flag is on.

---

## 7. Controls UI

Group title / legend:

    Hodograph overlays

Native controls only:

    <fieldset>
      <legend>Hodograph overlays</legend>
      <label><input type="checkbox" /> Storm motion C</label>
      <label><input type="checkbox" /> Storm-relative wind V_sr</label>
      <label><input type="checkbox" /> Horizontal vorticity ω_h</label>
    </fieldset>

Place the group next to (beside or below) the hodograph panel in the app
layout. Product-shell placement of that pair is the on-demand
Environment surface (42-1 COMPLETE), not the persistent left
action rail:

    docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md

Remaining V1 path after 42-1 is M5, not a further Environment
chrome pass:

    docs/architecture/43-post-42-1-v1-sufficiency-and-scope-cut.md

No design-system components.

The `V_sr` checkbox uses the native `disabled` attribute when `C` is not
visible, matching §6.2.

---

## 8. Stable viewport (mandatory)

Visibility must **not** affect domain or view transform.

Autoscale continues to use the full physics-relevant inputs already defined
for the panel:

    (0, 0) ∪ points ∪ stormMotion data (when stormMotion prop is provided)

even if the `C` marker is currently hidden.

Consequences:

- toggling overlays must not zoom/pan the hodograph;
- comparing “with C drawn” vs “without C drawn” happens on one stable scale;
- omitting `stormMotion` from transform inputs as a hide mechanism is
  forbidden under this contract.

`ω_h` remains outside velocity-domain expansion (schematic px arrow), as in
document 04.

---

## 9. Testing

Prefer pure visibility / draw-gate helpers over DOM cosmetics.

Required checks:

- each stored flag can be toggled independently, subject to the `V_sr`
  enablement rule;
- hiding `C` disables effective `V_sr` draw but preserves stored
  `stormRelativeWind === true` when it was true;
- re-showing `C` restores effective `V_sr` draw without changing stored
  preference;
- `ω_h` visibility is independent of `C` / `V_sr`;
- toggling visibility does not mutate `points`, `stormMotion`, or
  `vorticityLayer` objects;
- domain / `buildViewTransform` result is unchanged when only visibility
  flags change (stable viewport);
- base path remains drawn regardless of overlay visibility.

---

## 10. Implementation slice contents

This document's implementation slice includes:

- `HodographOverlayVisibility` type and App-owned state;
- `HodographOverlayControls` (or equivalent) checkbox fieldset;
- `overlayVisibility` prop + draw gates on `HodographPanel`;
- preserve-stored-`V_sr` / disable-without-`C` contract;
- stable transform inputs independent of visibility;
- focused tests above;
- micro-pointers from prior UI docs.

It excludes physics API changes and all v1 out-of-scope items in §2.

---

## 11. Core lesson

Overlay visibility is UI state.

Physics data stay present; drawing is gated.

The base hodograph is always visible.

`V_sr` effectively requires a visible `C`, but temporarily hiding `C` does not
erase the stored `V_sr` preference.

`ω_h` toggles independently.

The viewport stays put while overlays appear and disappear.

Streamwise / crosswise vorticity visibility is specified with that overlay in:

    docs/ui/06-streamwise-crosswise-vorticity-overlay.md
