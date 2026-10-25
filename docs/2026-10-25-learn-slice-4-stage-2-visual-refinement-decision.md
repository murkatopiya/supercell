# Learn Slice 4 — Stage 2 bounded visual refinement

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Bounded presentation refinement and scoped developer verification only; no human acceptance |
| Parent authority | Human owner instruction below; [Stage 2 implementation Decision](2026-10-25-learn-slice-4-stage-2-implementation-decision.md), [approved plan](ux/2026-10-25-learn-slice-4-stage-2-implementation-plan.md), [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md) and [bounded amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Prior whole-area / 2500 display-metre camera candidate only; interaction and scientific constraints remain |
| Superseded by | None |

## Decision authority, scope and Decision

Human project owner explicitly authorizing bounded visual refinement implementation
and scoped developer verification. Recorded by Agent, 2026-10-25.

Authorize a permanently visible, accessible scene legend, closer stable initial
camera, a more distinguishable placement outline, corrected stationary-measurement
caption and corresponding tests. Initial A/B and full arrows take priority over
whole-area home framing. Reset View remains camera-only; Reset Probes independent.
Necessary mutable status consequences record this work, not human acceptance.

Authority targets: CompareFlowViewport/Legend, compareFlowView, placement-area
presentation, scoped CSS and corresponding tests. Reviewed identity: the implemented
Stage 2 with reported 140 passing tests and pending human acceptance; no immutable
code identity or new frozen pin is claimed. Accepted governance snapshot identities
are resolved independently through the existing accepted-snapshot mechanism.

NOT INTRODUCED: model/field/frame/time/sampling changes, scale or vector geometry
changes, new interaction bounds or picking/gesture policies, Simulation/history,
scientific data or scientific qualification. NOT CLAIMED: human technical/visual
acceptance or verified physical touch merely from developer browser checks.
No shared navigation/top-bar/footer architecture changes, frozen-record changes,
campaigns, scientific evidence collection, commit, push or deploy are authorized.
Stop after refinement and developer verification for separate human acceptance.

## Source language

Russian (ru), with the original English decision marker retained.

## Source instruction — English translation

Begin bounded visual refinement of Learn Slice 4 Stage 2 Explore the Field.
Stage 2 is implemented and developer verification completed (previous report:
140/140 tests PASS, typecheck/build PASS); human acceptance remains PENDING.
Human decision: authorize bounded visual refinement implementation plus scoped
developer verification. Improve scene readability and novice understanding without
changing physics, measurements or approved B-movement mechanics.

Add a compact permanently visible “Reading the scene” legend directly below the
scene: A is the fixed reference; B a stationary repositionable measurement point;
velocity arrow means local airflow direction/speed, not a path; height guide is a
vertical model-ground reference, not a trajectory; placement area limits B placement,
not the model. Match actual rendering colours and geometry. Show the area legend
also in Inspect, explaining that the area appears only when Move B is on. Make it
accessible without colour alone or Details, compact on desktop/mobile; minimally
shorten duplicate scene explanations while retaining scientific caveats.

Replace the preliminary 2500-margin whole-area home framing with a closer informative
view of initial A/B and full true arrows. Preserve scale 80, initial positions,
stable non-following camera, camera-only Reset View, independent Reset Probes and
OrbitControls access to the entire area. Whole-area initial fit is not required.
Stop for a separate decision if bounds, physical scale or accepted semantics must
change. Improve area-outline contrast against the ground grid, keeping its surface
very transparent and secondary. Check depth/order and overlap with probes, arrows
and guides. Show it only in Place B, without implying a physical surface or an
atmospheric boundary. Do not change coordinate bounds, strict picking, touch/click
lifecycle or axis-button behaviour.

Replace “Fixed probes · 0 s” with “Stationary measurements · Model time: 0 s”.
If necessary clarify minimally that B is repositioned between measurements rather
than carried by air. Allow only necessary Learn presentation, scoped CSS, framing,
area-presentation and test changes. Do not change Demo composition,
StormRelativeLaboratory, t=0, sampling/values, scale 80, vector geometry, component
signs/C subtraction, Simulation/integrator/history/data, approved bounds/numerical
and gesture policies, single-arrow/other-lesson contracts, navigation/top bars/
footers/shared architecture or frozen records. No campaigns, evidence collection,
commit, push or deploy.

Run relevant unit/regression tests, typecheck/build. If real WebGL is available,
check 1440×1000, 390×844 and 320×844: initial readability, reset after orbit/zoom,
placement and boundary access, area transparency/outline at several angles, legend
fidelity/readability/no overflow, retained measurements/resets/interactions and no
console warnings/errors. Mark physical touch, forced real context loss and prolonged
GPU/heap profiling NOT VERIFIED if untested. Report changed files, exact visual
changes, checks, Inspect/Place B desktop/mobile screenshots where possible, risks
and invariant preservation. Do not declare Stage 2 accepted; stop for the owner.

## Source instruction — original

Огонёчка, приступаем к ограниченной визуальной доводке Learn Slice 4 — Stage 2 Explore the Field.

Stage 2 реализован, developer verification завершена (по предыдущему отчёту: 140/140 tests PASS, typecheck/build PASS). Human technical/visual acceptance остаётся PENDING.

**Human decision: разрешаю bounded visual refinement implementation + scoped developer verification.**

Цель — улучшить читаемость 3D-сцены и сделать её обозначения понятными новичку, не меняя физику, измерения или утверждённую механику перемещения B.

## 1. Постоянно видимая легенда

Добавь компактную легенду непосредственно под 3D-сценой в уроке Compare the Flow.

Рабочий заголовок: `Reading the scene`.

Легенда должна объяснять:

- Probe A — fixed reference point.
- Probe B — stationary measurement point that the user can reposition.
- Velocity arrow — local airflow direction and speed; NOT the probe's path.
- Height guide — vertical reference to model ground; NOT a trajectory.
- Placement area — where B can be placed, NOT the boundary of the model.

Используй визуальные образцы, соответствующие фактическим цветам и геометрии сцены. Не придумывай цвета, которые отличаются от rendering implementation.

Placement area отображается в легенде даже вне Place B, но с пояснением, что сама область появляется в сцене только при включённом Move B.

Легенда должна быть видимой без раскрытия Details, компактной на desktop и mobile, семантически доступной и не полагаться исключительно на цвет.

Не дублируй дословно длинные существующие пояснения. Если легенда позволяет убрать повторяющийся текст под сценой, разрешаю минимальное сокращение именно этого текста при сохранении научных оговорок.

## 2. Начальная камера и Reset View

Текущий whole-area home framing с предварительным запасом 2500 display м делает пробники и стрелки слишком мелкими.

Подбери более близкий, информативный начальный ракурс, при котором A, исходный B и обе истинные стрелки хорошо читаются.

Сохрани:

- неизменный масштаб стрелок 80 display м/(м/с);
- исходные позиции A/B;
- стабильную камеру без автоматического преследования B;
- Reset View как camera-only действие;
- независимость Reset Probes;
- возможность пользователю исследовать всю область B посредством OrbitControls.

Не требуется любой ценой вмещать всю область перемещения B в первоначальный кадр. Приоритет — понятная исходная сцена с хорошо различимыми измерениями.

Если изменение камеры требует пересмотра утверждённых interaction bounds, физического масштаба или другой принятой семантики, остановись и запроси отдельное решение.

## 3. Область размещения B

Улучши различимость границы placement area относительно наземной координатной сетки.

Поверхность должна оставаться очень прозрачной и визуально второстепенной, но её контур — различимым при типичных ракурсах.

Проверь depth/order rendering, перекрытие пробников, стрелок и высотных направляющих.

Область видна только в Place B и не должна выглядеть как физическая поверхность или граница атмосферы.

Не меняй координатные границы, строгую численную политику picking, touch/click lifecycle или поведение осевых кнопок.

## 4. Текстовая точность

Замени вводящую в заблуждение подпись `Fixed probes · 0 s` на:

`Stationary measurements · Model time: 0 s`

При необходимости минимально уточни окружающий текст, чтобы пользователь понимал: B можно переставлять между измерениями, но он не перемещается вместе с воздухом.

## 5. Границы изменений

Разрешены только минимально необходимые Learn presentation, scoped CSS, camera framing, placement-area presentation и соответствующие тесты.

Не изменяй:
- Demo composition, StormRelativeLaboratory, t=0, field sampling и measured values;
- scale 80, vector geometry, component signs или C subtraction;
- Simulation, integrator, history или научные данные;
- утверждённые placement bounds, numerical picking и gesture policies;
- существующие single-arrow и другие Learn lesson contracts;
- общую навигацию Landing / Learn / Explore, top bars, footers и shared navigation architecture;
- frozen records.

Не выполняй научные кампании, evidence collection, commit, push или deploy.

## 6. Developer verification

Выполни релевантные unit/regression tests, typecheck и build.

Если доступна real-WebGL browser environment, проверь desktop 1440×1000 и mobile 390×844 / 320×844:

- начальную читаемость A/B и обеих стрелок;
- Reset View после orbit/zoom;
- размещение B в Place B и доступность границ;
- прозрачность и контур области при нескольких ракурсах;
- соответствие легенды реальным объектам сцены;
- читаемость легенды и отсутствие horizontal overflow;
- сохранение измерений, reset и interaction behavior;
- отсутствие console errors/warnings.

Отдельно укажи NOT VERIFIED для физического touch, forced real WebGL context loss и длительного GPU/heap profiling, если они не проверялись.

## 7. Отчёт и остановка

Верни:
1. Изменённые файлы и точное описание визуальных изменений.
2. Результаты тестов/typecheck/build.
3. Результаты real-WebGL и responsive проверок.
4. Скриншоты начального Inspect и Place B на desktop и mobile, если доступны.
5. Оставшиеся UX-риски и ограничения.
6. Подтверждение неизменности научных и архитектурных инвариантов.

Не объявляй Stage 2 технически или визуально принятым. Human acceptance остаётся отдельным решением владельца.

**Остановись после bounded visual refinement и developer verification.**
