# Visual Design Foundation

**Status:** UI SoT / Slice V1 COMPLETE
**Scope:** application visual vocabulary — design tokens,
typography, and a small set of CSS primitives — plus a Landing
proof of concept. Not a laboratory redesign. Not a rendering
or diagnostic-color change. Not a component library.
**Physics:** unchanged. This file does not modify
`src/physics/**`, sounding semantics, storm fields, or
simulation runtime.
**Implementation:** Slice V1 COMPLETE (tokens, primitives,
Landing proof of concept). Laboratory chrome application is
Slice V2 (`docs/ui/15-laboratory-visual-chrome.md`).

Predecessors (still binding; not rewritten):

```text
docs/ui/07-app-navigation-and-mode-entry.md
docs/ui/08-scene-toolbar-and-control-states.md
docs/ui/11-floating-hodograph-workspace.md
docs/ui/12-how-it-works-and-onboarding.md
```

`07`–`13` remain the functional UI SoT. This file is the
visual vocabulary those surfaces may adopt later. It does
not replace their interaction contracts.

---

## 1. Purpose

Supercell Explorer needs a restrained visual system so
chrome is readable and hierarchical without competing with
the 3D scene or diagnostic encodings.

Direction:

```text
scientific instrument × modern data application
```

Rejected directions:

```text
sci-fi HUD
gaming UI
weather-radar rainbow
dark dashboard everywhere
generic corporate SaaS
decorative meteorology theme
```

---

## 2. Visual principles

### Scene is the focal surface

The live 3D viewport (`#1a2332`) stays the strong visual
center. V1 does not lighten the scene and does not change the
rendering palette.

### Application surfaces

Chrome around the scene is light, slightly cool, and calm.
Surfaces are distinguished by background and elevation, not
by a heavy frame on every box.

### Color semantics

UI accent is a restrained cool blue used for chrome
interaction. It is not a diagnostic color.

Hodograph / scene diagnostic colors may encode physical or
analytical meaning. They are not UI action colors.

### Information density

This is a research instrument. Controls stay compact, with
readable type and usable hit areas. V1 does not introduce
oversized consumer headings.

---

## 3. Styling architecture

V1 stays in the existing CSS architecture:

```text
src/app/app.css     tokens + primitives + legacy laboratory CSS
src/app/main.tsx    imports app.css
```

There is no Tailwind, CSS-in-JS, theme provider, icon
library, or new React primitive package.

Primitives are CSS classes. They do not change component
behavior.

Tokens are the shared vocabulary for Landing and laboratory
chrome. Scientific / rendering colors stay hardcoded at their
owning selectors.

---

## 4. Token vocabulary

Declared on `:root` in `src/app/app.css`.

### Color

| Token | Value | Role |
| --- | --- | --- |
| `--color-bg-app` | `#eef2f6` | cool page background |
| `--color-bg-surface` | `#ffffff` | standard surface |
| `--color-bg-surface-subtle` | `#f4f6f9` | grouped / inset surface |
| `--color-bg-surface-raised` | `#ffffff` | raised / floating fill |
| `--color-bg-scene` | `#1a2332` | live scene background (record) |
| `--color-bg-scene-chrome` | `#243044` | reserved scene-toolbar evaluation |
| `--color-text-primary` | `#1b2430` | titles and body |
| `--color-text-secondary` | `#4a5a6a` | help / lede |
| `--color-text-muted` | `#6a7686` | quiet labels |
| `--color-text-on-dark` | `#e8eef5` | text on scene / HUD |
| `--color-text-on-dark-muted` | `#a8b6c6` | helper copy on scene chrome |
| `--color-border-subtle` | `#d4dde6` | default edge |
| `--color-border-strong` | `#9aa8b6` | hover / emphasis edge |
| `--color-border-on-dark` | `rgba(232, 238, 245, 0.16)` | control edges on scene chrome |
| `--color-accent` | `#2a628c` | UI action blue |
| `--color-accent-hover` | `#1f4e70` | accent hover |
| `--color-accent-soft` | `#e6f0f6` | accent wash |
| `--color-accent-contrast` | `#ffffff` | text on accent fill |
| `--color-interactive-hover` | `#eef3f7` | hover wash |
| `--color-selected` | `#e4edf4` | selected / pressed wash |
| `--color-disabled` | `#8a96a4` | disabled text |
| `--color-focus` | `#2a628c` | focus-visible ring |
| `--color-focus-on-dark` | `#8ec4e8` | focus-visible on scene chrome |
| `--color-interactive-hover-on-dark` | `rgba(232, 238, 245, 0.08)` | hover wash on scene chrome |
| `--color-selected-on-dark` | `rgba(232, 238, 245, 0.16)` | selected toggle on scene chrome |

`--color-bg-scene` records the live viewport color. V2 does
not rebind `.tracer-viewport` to this token.

`--color-bg-scene-chrome` is the V2 SceneToolbar treatment
(dark / intermediate). Evaluation and contract live in
`docs/ui/15-laboratory-visual-chrome.md`.

### Radius, shadow, space

| Token | Value |
| --- | --- |
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--shadow-raised` | `0 1px 2px rgba(27, 36, 48, 0.08), 0 4px 12px rgba(27, 36, 48, 0.07)` |
| `--shadow-floating` | `0 10px 28px rgba(27, 36, 48, 0.14), 0 2px 8px rgba(27, 36, 48, 0.08)` |
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-5` | `1.5rem` |

Spacing tokens are a small landing-facing scale, not a
full layout system.

No gradients in this foundation.

---

## 5. Typography

Desired family: Inter, then IBM Plex Sans.

The project has no webfont dependency and does not request
fonts from a CDN. The live stack prefers those families when
installed and falls back to system UI sans:

```text
Inter, "IBM Plex Sans", "Segoe UI", system-ui,
-apple-system, BlinkMacSystemFont, sans-serif
```

`--font-sans` holds that stack. `--font-mono` is
`ui-monospace, "IBM Plex Mono", "Cascadia Code", Consolas, monospace`
for diagnostic readouts.

Loading Inter or IBM Plex Sans as a real webfont is a later
decision. V1 does not add a runtime font package.

Laboratory `:root` uses `--font-sans`. Landing also sets
`font-family: var(--font-sans)`.

Hierarchy (not display advertising sizes):

| Role | Token / class | Size |
| --- | --- | --- |
| app title | `--text-app-title` / `.ui-type-app-title` | `1.75rem` / 650 |
| page / mode title | `--text-page-title` / `.ui-type-page-title` | `1.2rem` / 650 |
| section heading | `--text-section` / `.ui-type-section` `.ui-section-heading` | `0.95rem` / 650 |
| body | `--text-body` / `.ui-type-body` | `0.9375rem` / 1.45 |
| secondary / help | `--text-secondary` / `.ui-type-secondary` | `0.875rem` |
| control label | `--text-label` / `.ui-type-label` | `0.8125rem` |
| diagnostic readout | `--text-readout` / `.ui-type-readout` | `0.75rem` tabular / mono |

The stack must remain usable for `ω_h`, `V_sr`, `m/s`,
`+4.37 km`, `12000 m`, and `E` / `N`.

---

## 6. Surface hierarchy

| Surface | Primitive | Use |
| --- | --- | --- |
| Standard | `.ui-panel` | Runtime / Inspector / informational content |
| Subtle / group | `.ui-panel--subtle` | inner control groups |
| Info | `.ui-panel--info` | honesty / experiment copy |
| Card | `.ui-card` | clickable choice surface (Landing) |
| Floating | `.ui-floating-panel` | Hodograph-class elevation |
| Scene chrome | `.ui-scene-chrome` | dark SceneToolbar (V2) |

Floating elevation is stronger: raised fill, `--shadow-floating`,
border, `--radius-lg`. V1 does not restyle
`.hodograph-workspace` with this primitive.

---

## 7. Interaction states

Primitives support:

```text
default
hover
active
selected   (aria-pressed on .ui-button--toggle)
disabled
focus-visible
```

Focus is `:focus-visible`, not mouse-only hover.

Disabled remains visually obvious (`--color-disabled` on a
subtle surface). Hover does not restyle a disabled control as
active.

Primary / accent fill (`.ui-button--primary`) is for a true
local workflow action. Landing How It Works is secondary /
subtle. Explore Release tracer is the laboratory primary.

Buttons leave browser-default appearance. Height stays
compact (`min-height: 2rem`) with readable padding.

Form controls keep native semantics. `.ui-select` /
`.ui-input` / `.ui-check` only share border, radius, type,
and `accent-color`. There is no fake select or custom radio.

---

## 8. Scientific color boundary

V1 does not change these encodings:

```text
hodograph curve / markers          #0b57d0
storm motion                     #9a6700
storm-relative wind V_sr         #0f7b6c
horizontal vorticity ω_h        #8250df
streamwise / crosswise ω_s / ω_c #bf3989 / #9a6700
origin / selected-height marker   #b42318
hodograph selection stroke       #0842a0
tracer identities                TRACER_COLORS
                                 (0xe74c3c, 0x3498db, 0x2ecc71)
selection / hover / preview      rendering marker colors
airflow marks / flow comets      rendering palette
world coordinate reference        white / #c8d4e0
3D scene background              #1a2332
HUD on-dark text                  #e8eef5
```

UI accent `#2a628c` is intentionally not hodograph `#0b57d0`
and not diagnostic magenta / gold / cyan / tracer red.

---

## 9. Proof of concept

V1 applies the new system only to Landing:

```text
landing page background
title typography
intro copy
Guided card
Explore card
How It Works secondary action
```

Landing semantics are unchanged (`07`): title, description,
two mode buttons, How It Works help entry. No illustrations,
no storm imagery, no decorative icons.

Cards are `<button>` elements and look interactive at rest
(raised surface, radius, border). Hover / focus-visible are
additional, not the only affordance.

How It Works uses `.ui-button.ui-button--subtle`, not a
third mode card.

Layout architecture is unchanged: stacked cards below
`640px`, two columns at `640px` and above.

Guided and Explore laboratory chrome application is V2
(`15`). This file stays the vocabulary; `15` is the
laboratory visual contract.

---

## 10. Implementation status

```text
tokens in :root                         COMPLETE
CSS primitives                          COMPLETE
Landing proof of concept                COMPLETE
webfont package / CDN                  NOT STARTED
laboratory chrome restyle              COMPLETE (`15`)
SceneToolbar light vs dark evaluation  COMPLETE (`15`: dark chrome)
hodograph floating-panel restyle        COMPLETE (`15`)
scientific / rendering palette change    NOT STARTED
```

---

## 11. Anti-claims

```text
This SoT is not a functional navigation rewrite.
This SoT does not change 3D rendering or hodograph diagnostics.
This SoT is not a Tailwind / component-library introduction.
UI accent is not a diagnostic color.
Laboratory chrome application lives in docs/ui/15.
```
