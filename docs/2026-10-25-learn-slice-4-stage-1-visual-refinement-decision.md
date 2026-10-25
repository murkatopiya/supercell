# Learn Slice 4 — bounded Stage 1 visual refinement

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Limited Stage 1 presentation refinement and developer verification; acceptance remains pending |
| Parent authority | Human owner instruction below; [Stage 1 authorization](2026-10-25-learn-slice-4-stage-1-implementation-decision.md); [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), and [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Prior provisional scale 40 only as a presentation candidate; no acceptance or scope transition |
| Superseded by | None |

## Decision authority

Human project owner communicating preliminary human visual review and authorizing
bounded presentation changes. Recorded by Agent.

## Scope and Decision

Authorize testing a common arrow display scale approximately 1.5–2 times the prior
40, retaining true directions and linear speed proportionality, with full-arrow
home framing. Add thin secondary dashed height guides from fixed A/B to ground,
following Follow Motion presentation. Speed and Vertical are primary; horizontal
components are collapsed on initial entry. Check initial camera, Reset View,
orbit, zoom and resize. This does not close technical or visual acceptance.

INTRODUCED: presentation changes only. NOT INTRODUCED: physics, measurement,
frame, time, position, Stage 2 or scientific authority changes.
NOT CLAIMED: scientific qualification or human technical/visual acceptance.

## Authority targets and reviewed identity

Mutable Learn Stage 1 scale/viewport and relevant tests, reuse of existing
TracerScene-owned annotation resources, this Decision and PROJECT_STATUS.
No exact-byte identity or freeze was requested; no frozen record is modified.
The accepted amendment index is anchored at snapshot
`8d916037058a919560b6c2d01ae65823589e96bb`; verification uses that snapshot rather
than deriving expected pins from current bytes. This Decision owns the permission;
PROJECT_STATUS owns current implementation/verification consequences. Earlier
plan/design scale 40 wording retains its historical provisional meaning; this
bounded permission permits a revised candidate without declaring it accepted.

## Authorization consequence

Refine Stage 1 only; run corresponding regressions, typecheck, build and available
real-WebGL visual checks; return chosen scale and desktop/mobile screenshots.
Stop before human acceptance. Preserve TracerScene's single resource owner and
existing Slice 3 single-arrow behavior.

## Explicitly NOT authorized

Changes to Demo, fields, C, measurements, A/B coordinates or t=0; Move B or other
Stage 2 functions; unrelated marker/glyph enlargement, competing cleanup or double
dispose; scientific campaigns, commit, push or deploy. No scientific contracts,
data or baselines are changed.

## Date

2026-10-25.

## Source language

Russian (ru), with English UI/API names.

## Source instruction — original

Bounded verbatim excerpt; greeting omitted.

> консилиум провёл предварительный human visual review Learn Slice 4 — Stage 1 Static Compare.
>
> **Решение владельца: разрешаю ограниченную визуальную доработку Stage 1. Техническая и визуальная приёмка пока не закрыта.**
>
> Необходимо:
>
> 1. **Увеличить читаемость двух векторов скорости.** Проверить единый масштаб примерно в 1.5–2 раза больше текущего. Сохранить истинные 3D-направления, линейную пропорциональность длины модулю скорости и одинаковый коэффициент для A/B. Обеспечить кадрирование полных стрелок.
> 2. **Добавить тонкие пунктирные направляющие высоты** от A/B до плоскости земли по образцу Follow Motion. Направляющие должны быть визуально второстепенными, не обозначать траектории и не менять координаты пробников.
> 3. **Сделать Speed и Vertical первичными показателями.** Eastward/Northward скрывать в свёрнутом disclosure при первоначальном открытии урока.
> 4. Проверить композицию сцены при исходной камере, Reset View, вращении, масштабировании и изменении размеров окна. Не увеличивать маркеры и стрелки исключительно ради заполнения пространства ценой научной корректности.
>
> Ограничения:
>
> - Не изменять Demo, поля скорости, C, измерения, координаты A/B или время t=0.
> - Не добавлять Move B и другие функции Stage 2.
> - Не менять single-arrow поведение Slice 3.
> - Сохранить правильное владение и освобождение ресурсов новых направляющих и стрелок.
> - Выполнить соответствующие regression tests, typecheck, build и real-WebGL визуальную проверку, если доступна.
> - Без научных кампаний, commit, push и deploy.
>
> Верни перечень изменений, результаты проверок, фактически выбранный масштаб стрелок и скриншоты desktop/mobile для human review.
>
> Остановись до человеческой приёмки.

## Source instruction — English translation

The consilium conducted preliminary human visual review of Learn Slice 4 — Stage 1
Static Compare. Owner decision: authorize limited Stage 1 visual refinement.
Technical and visual acceptance are not yet closed.

1. Improve readability of both velocity vectors. Test a common scale approximately
   1.5–2 times the current one. Preserve true 3D directions, linear length-to-speed
   proportionality and the same coefficient for A/B. Frame complete arrows.
2. Add thin dashed height guides from A/B to ground following Follow Motion. Guides
   must be secondary, not signify trajectories and not change probe coordinates.
3. Make Speed and Vertical primary. Keep Eastward/Northward in a collapsed
   disclosure on initial lesson entry.
4. Check composition at the initial camera, Reset View, orbit, zoom and window
   resizing. Do not enlarge markers/arrows just to fill space at the expense of
   scientific correctness.

Do not change Demo, velocity fields, C, measurements, A/B coordinates or t=0.
Do not add Move B or other Stage 2 functions. Preserve Slice 3 single-arrow
behavior and correct ownership/disposal of guides and arrows. Run corresponding
regression tests, typecheck, build and real-WebGL visual verification if available.
No scientific campaigns, commit, push or deploy.

Return changes, verification results, the actual chosen arrow scale and
desktop/mobile screenshots for human review. Stop before human acceptance.
