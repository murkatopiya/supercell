# Learn Slice 3 — Read the Motion, implementation stage 1

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE for bounded stage 1 implementation and developer verification |
| Freeze mode | MUTABLE |
| Authority scope | Independent Learn lesson observing tracer A and its local velocity arrow; stage 1 only |
| Parent authority | Human project owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), and [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Earlier no-Slice-3 implementation/route statements only for this stage |
| Superseded by | None |

## Decision authority

Human project owner acting as product decision-maker and authorizer of this
bounded implementation. Recorded by Agent. This receipt does not establish
acceptance of the resulting implementation or scientific qualification.

## Scope and Decision

Authorize implementation stage 1 of Read the Motion: independent lesson 03,
user-initiated observation of existing Demo tracer A, a true local 3D velocity
arrow on one constant linear display scale, Start/Pause/Resume/Replay, retained
final path and marker, supplied teaching explanations and inherited scientific
boundary. Use the same Demo field instances, prescribed C, integration frame,
Euler timestep, domain, history and 1200-step/120-second, target-10× playback
semantics as Follow Motion. Preserve existing lesson behavior and departure
guards; release resources on lesson exit and unmount.

INTRODUCED: presentation of existing model velocity at the current tracer point
and laboratory time, through the existing inspection API.

NOT INTRODUCED: new physics, initial conditions, numerical policies, time-varying
Demo fields, historical sampling UI, coordinate-component UI or additional
scientific/model authority. NOT CLAIMED: forces, vorticity, convergence, full
storm dynamics, observation/reconstruction/forecast or scientific certification.

## Authority targets and reviewed identity

Targets: Learn lesson/session/navigation, optional velocity observation plumbing
in TracerViewport, owned velocity-arrow rendering in TracerScene, scoped tests
and the mutable PROJECT_STATUS implementation consequence.
Inherited [Slice 2](2026-10-22-learn-slice-2-implementation-decision.md) model and
runtime choices and [shared layout](2026-10-24-learn-shared-navigation-decision.md)
remain binding outside the explicitly added lesson.

No exact implementation SHA or artifact identity was supplied or accepted.
No freeze/pinning or whole-Design approval is inferred. Documentation targets:
this mutable DECISION RECORD and mutable STATUS owner; no frozen target is
modified. Governance foundation digest matches its adoption; amendment identities
were recovered through accepted snapshot
`8d916037058a919560b6c2d01ae65823589e96bb` and verified before documentation edits.

## Authorization consequence

Implement stage 1 and run relevant developer tests, typecheck, build and, if
available, real-WebGL browser verification. Record the bounded decision and
implementation consequences. Stop after the first stage for human visual and
scientific acceptance. Permission does not extend to later Slice 3 stages.

## Explicitly NOT authorized

Timeline/scrub, selection/comparison of moments, numerical east/north/up displays,
new fields/seeds, physics/Demo/trajectory/integrator/dataset/scientific-contract
changes, unrelated edits, scientific experiments or qualification campaigns,
commit, push or deploy. No prior research gate or classification changes.

## Date

2026-10-25.

## Source language

Russian (ru), with supplied English interface copy.

## Source instruction — original

Bounded excerpts; the greeting and retrospective diagnostic context are omitted.

> **Задача: Learn Slice 3 — Read the Motion, implementation stage 1.**
>
> Это ограниченное разрешение только на первый этап третьего урока.

[Omitted: retrospective context except the coordinate/frame constraints below.]

> - Мировые оси: +X east, +Y up, +Z south.
> - Атмосферные компоненты: eastward = vx, northward = −vz, vertical = vy.
> - Скорость уже задана в StormRelativeLaboratory. Повторно вычитать prescribed C нельзя.
> - Поле Demo стационарно: изменение скорости вдоль пути не означает изменение самого поля во времени.

> Сначала прочитай `AGENTS.md`, актуальные правила governance и статус проекта. Затем используй существующие реализации Learn, Demo-сессии, истории траектории и инспекции скорости. Не проводи повторное широкое исследование архитектуры без необходимости.
>
> ### Что реализовать
>
> **1. Новый урок в Learn**
>
> Добавь `03 Read the Motion` в общую навигацию, только когда маршрут действительно работает.
>
> Урок должен быть независимым: пользователь может открыть его напрямую.
>
> **2. Вступление перед полётом**
>
> Заголовок:
>
> `Where is the airflow going — and how fast?`
>
> Кратко объясни:
>
> - В предыдущем уроке мы наблюдали две разные траектории.
> - Теперь будем следить за одним маркером и его вектором скорости.
> - Направление стрелки показывает направление локальной скорости.
> - Длина стрелки представляет модуль скорости по постоянному масштабу.
> - Пользователь может нажать Pause и Resume.
> - После завершения полёта можно будет исследовать записанные моменты — но эта функция появится на следующем этапе.
>
> Кнопка `Start observation`.
>
> Не запускай движение автоматически до действия пользователя.
>
> **3. Полёт трассера A**
>
> Используй существующую физическую композицию Demo и параметры интегрирования Follow Motion, без их изменения.
>
> В сцене один трассер A, записывается его путь.
>
> Воспроизведение: 120 секунд модельного времени, целевой темп 10×.
>
> Покажи рядом с трассером настоящий вектор скорости, полученный через существующий velocity observation той же сессии.
>
> Стрелка должна:
>
> - соответствовать направлению реального 3D-вектора;
> - менять длину пропорционально модулю скорости;
> - использовать один постоянный масштаб на протяжении всего урока;
> - оставаться читаемой на начальном, среднем и позднем участках;
> - не использовать T1 glyph и его специфическое масштабирование;
> - не подменяться касательной, вычисленной по экранной траектории.
>
> Подбери визуальный масштаб на основании диапазона скоростей A, затем зафиксируй его. Не нормируй каждую стрелку до одинаковой длины.
>
> **4. Управление**
>
> Поддержи Start, Pause, Resume и Replay.
>
> При Pause сохраняй текущую позицию, траекторию и стрелку.
>
> При Resume продолжай ту же сессию.
>
> При Replay начинай наблюдение заново, без накопления старых траекторий.
>
> После завершения показывай весь записанный путь и конечное положение маркера.
>
> **5. Объяснения в интерфейсе**
>
> Во время движения:
>
> `Watch how the arrow changes as the marker travels.`
>
> После завершения:
>
> `The marker encountered different velocities along its path.`
>
> Не утверждай, что стационарное поле изменяется во времени.
>
> Не делай выводов о силах, вихревости или сходимости.
>
> ### Что пока НЕ делать
>
> - Временную шкалу и исторический scrub.
> - Выбор и сравнение двух моментов.
> - Отображение численных компонентов east/north/up.
> - Новые физические модели или начальные условия.
> - Изменение существующих уроков сверх необходимой интеграции.
> - Научные эксперименты или qualification campaigns.
>
> ### Проверки
>
> Добавь релевантные тесты для нового урока, управления и корректного получения скорости.
>
> Проверь typecheck и build.
>
> Особое внимание удели освобождению ресурсов при переключении уроков и размонтировании сцены.
>
> Если возможно, выполни браузерную проверку с реальным WebGL. Если нет — прямо укажи ограничение.
>
> ### Governance
>
> Соблюдай `AGENTS.md`, документационные правила и научные границы проекта.
>
> Оформи минимально необходимую авторизацию этапа согласно действующему governance. Не расширяй её на последующие этапы Slice 3.
>
> Не изменяй unrelated files. Без commit, push и deploy.
>
> ### Результат
>
> Покажи:
>
> - изменённые файлы;
> - архитектуру нового урока;
> - способ получения и визуализации скорости;
> - результаты проверок;
> - известные ограничения.
>
> После первого этапа остановись для визуальной и научной приёмки.

## Source instruction — English translation

Task: Learn Slice 3 — Read the Motion, implementation stage 1. This permission
is limited to the first stage of the third lesson. Read AGENTS.md, current
governance and status; reuse existing Learn, Demo sessions, trajectory history
and velocity inspection without unnecessary broad architectural research.
World axes are +X east, +Y up, +Z south; atmospheric eastward = vx,
northward = −vz, vertical = vy. Velocity is already StormRelativeLaboratory:
do not subtract prescribed C again. Demo is steady; variation along a moving
path does not mean temporal field variation.

Add independent lesson 03 only when its route works. Before flight, use heading
“Where is the airflow going — and how fast?” Briefly explain the previous two
paths, the new single marker and velocity vector, arrow direction as local
velocity direction, length as speed on a constant scale, Pause/Resume, and that
post-flight exploration of recorded moments will arrive in the next stage.
Use “Start observation”; do not start motion automatically.

Use the existing Demo composition and Follow Motion integration parameters
unchanged, only tracer A with its recorded path, 120 model seconds at target 10×.
Show genuine velocity from the same session's velocity observation. The arrow
must follow the true 3D vector, have length proportional to speed on one constant
scale, and remain readable early, midway and late. Do not use T1 glyph scaling
or substitute a tangent computed from the screen path. Choose the visual scale
from A's velocity range and keep it fixed; do not normalize all arrow lengths.

Support Start/Pause/Resume/Replay. Pause retains position, path and arrow; Resume
continues the same session; Replay restarts without accumulated old paths.
Retain the full recorded path and final marker after completion. During motion
show “Watch how the arrow changes as the marker travels.” After completion show
“The marker encountered different velocities along its path.” Do not claim the
steady field changes over time or infer forces, vorticity or convergence.

Do not add timeline/scrub, moment selection/comparison, numerical east/north/up,
new physics/seeds, existing-lesson changes beyond integration, scientific
experiments or qualification campaigns. Add relevant lesson/control/velocity
tests, run typecheck/build, particularly verify resource cleanup on switching
and unmount. If possible check real WebGL; otherwise state the limitation.

Follow repository governance and scientific boundaries; minimally record this
stage's authorization without extending it to later stages. No unrelated edits,
commit, push or deploy. Report changed files, architecture, velocity acquisition
and rendering, verification and limitations. Stop after stage 1 for visual and
scientific acceptance.
