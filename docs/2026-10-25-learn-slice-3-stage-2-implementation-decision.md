# Learn Slice 3 — Stage 2: Inspect & Compare

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE for bounded Stage 2 implementation and developer verification |
| Freeze mode | MUTABLE |
| Authority scope | Post-flight recorded-state inspection and two-moment comparison in Read the Motion |
| Parent authority | Human project owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), extended by the [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | [Stage 1](2026-10-25-learn-slice-3-stage-1-implementation-decision.md) exclusions only for the historical timeline, coordinate inspector, comparison and bounded copy changes authorized below |
| Superseded by | None |

## Decision authority

Human project owner acting as product decision-maker and implementation authorizer.
Recorded by Agent. This receipt does not establish acceptance of the resulting
interface or scientific qualification.

## Scope and Decision

Authorize Stage 2 only: after the completed existing A flight, select actual
recorded states on a timeline; display the selected A and one true velocity
arrow while retaining the full path; show total speed, coordinate components,
height and model time; save, replace and clear one independently measured
Reference for comparison with Current. Inspection must use the same session's
velocityObservation at stored P,t without stepping, interpolation, a second
composition or changing Simulation's clock. Preserve existing controls, constant
arrow scale, model/frame choices, cleanup and departure protection. Replay
creates a fresh observation session and clears historical selection/reference.
Reset View changes only camera state. Apply the requested introductory copy and
remove the temporary next-stage text.

INTRODUCED: read-only historical location/velocity presentation and coordinate
component comparison within the existing prescribed kinematic model.

NOT INTRODUCED: new physics, numerical policies, seeds, fields, datasets or
scientific-contract changes. NOT CLAIMED: temporal change of the steady field,
forces, vorticity, convergence, full storm dynamics, historical reconstruction,
forecast or qualification. Coordinate components are not individual field
contributions. Unavailable velocity must be explicit, with no numeric-zero
substitution or fabricated arrow.

## Authority targets and reviewed identity

Targets: Read the Motion lesson/inspection/comparison UI, optional display-only
particle snapshots in TracerViewport, scoped styles/tests and PROJECT_STATUS.
Inherited Stage 1 Demo composition/integration and shared Learn navigation remain
binding outside these additions. No reviewed implementation SHA or immutable
artifact identity was supplied or accepted. No pinning, freeze or whole-Design
acceptance is inferred.

Documentation targets are this mutable DECISION RECORD and the mutable STATUS
owner. Frozen artifacts are not edit targets. The active amendment identities
were resolved through accepted snapshot
`8d916037058a919560b6c2d01ae65823589e96bb` and checked before documentation edits.

## Authorization consequence

Implement this bounded stage; run relevant developer tests, typecheck and build;
check interactive real WebGL when available, otherwise report the limitation.
Record the minimal documentation consequences and stop for visual acceptance.
This is no authorization for a later lesson/stage or scientific campaign.

## Explicitly NOT authorized

Demo field/integrator/trajectory parameter/dataset changes; frozen or scientific
contract edits; scientific qualification campaigns; velocity from trajectory
finite differences; equal-length normalized arrows; interpreting along-path
variation as time-varying Demo flow; unrelated edits; Slice 1/2 changes beyond
necessary integration; extra documentation beyond governance needs; commit,
push or deploy. No research gate/classification transition.

## Date

2026-10-25.

## Source language

Russian (ru), with supplied English interface copy.

## Source instruction — original

Greeting omitted; the complete task follows.

> # Learn Slice 3 — Stage 2: Inspect & Compare
> 
> **Цель:** завершить учебный сценарий Read the Motion, позволив пользователю исследовать записанную траекторию трассера A, читать скорость и её компоненты и сравнивать два момента.
> 
> Stage 1 уже реализован: вступление, полёт A, настоящий 3D-вектор скорости, Pause/Resume/Replay, записанный путь.
> 
> Перед работой прочитай `AGENTS.md`, необходимые правила governance и текущий статус проекта. Изучи существующую реализацию Slice 3 и используй её как основу. Не проводи повторное широкое исследование архитектуры.
> 
> ## 1. Timeline — просмотр записанного движения
> 
> После завершения первого полёта покажи блок:
> 
> **Now investigate the path**
> 
> “The flight is complete. Choose a recorded moment to inspect how the airflow was moving at that position.”
> 
> Добавь интерактивную временную шкалу от 0 до 120 секунд модельного времени.
> 
> Требования:
> 
> - Шкала выбирает только реально записанные состояния (0,1 с между шагами).
> - Пользователь может перемещать ползунок и выбирать любой записанный шаг.
> - Выбранный момент отображается численно.
> - При выборе момента гаврик A и его золотая стрелка перемещаются к соответствующей записанной позиции в 3D.
> - Записанная траектория остаётся видимой целиком.
> - Скорость для выбранного состояния берётся через существующий `velocityObservation` той же Demo-сессии.
> - Не интегрируй Simulation заново и не создавай отдельную физическую композицию для инспекции.
> - Исторический просмотр не должен изменять текущие часы Simulation.
> - Не интерполируй произвольные состояния между записанными точками.
> - Если инспекция скорости недоступна, явно показывай unavailable, а не подставляй нули.
> 
> При переключении уроков, Replay и уничтожении истории исторический выбор должен корректно сбрасываться.
> 
> ## 2. Velocity inspector
> 
> Для выбранного момента показывай:
> 
> - **Speed** — модуль полного вектора, м/с.
> - **Eastward** — `vx`, м/с.
> - **Northward** — `−vz`, м/с.
> - **Vertical** — `vy`, м/с.
> - **Height** — `position.y`, метры над модельной плоскостью земли.
> - **Model time** — секунды.
> 
> Сохраняй правильную систему отсчёта: StormRelativeLaboratory.
> 
> Не вычитай prescribed storm motion C повторно.
> 
> Сделай интерфейс двухуровневым:
> 
> - По умолчанию выделены Speed и Vertical.
> - Остальные компоненты доступны в раскрываемом блоке `Show components`.
> 
> Поясни знаки компонент: Eastward/Northward могут быть отрицательными; Vertical положительная вверх, отрицательная вниз.
> 
> Не путай координатные компоненты скорости с вкладами отдельных полей.
> 
> ## 3. Compare two moments
> 
> Добавь кнопку **Save for comparison**.
> 
> Сценарий:
> 
> 1. Пользователь выбирает момент на timeline.
> 2. Нажимает Save for comparison — этот момент сохраняется как Reference.
> 3. Выбирает другой момент.
> 4. Панель показывает Reference и Current рядом или друг под другом на узких экранах.
> 
> Показывай для обоих состояний:
> 
> - Model time.
> - Speed.
> - Vertical velocity.
> - Height.
> 
> Дополнительно можно показать разницу Speed и Vertical между Current и Reference, но только если это не усложняет интерфейс.
> 
> Предусмотри замену Reference и её очистку.
> 
> Reference должна сохранять собственные измеренные значения, а не зависеть от текущего положения ползунка.
> 
> Не создавай вторую Simulation и не показывай вторую одновременно движущуюся стрелку в 3D на этом этапе.
> 
> ## 4. Учебный вывод
> 
> После начала исследования пользователь должен получить объяснение:
> 
> **Same flow. Different velocities along the path.**
> 
> “The modeled flow is steady, but it is not uniform. As the marker travels through different locations, it encounters different velocity vectors.”
> 
> “The path tells us where it went. The vectors help explain how it moved.”
> 
> Это наблюдение внутри prescribed kinematic model. Оно не устанавливает силы, вихревость, сходимость или полноценную динамику шторма.
> 
> ## 5. UX и состояния
> 
> - До первого запуска сохраняется существующее вступление.
> - Во время полёта сохраняются Start/Pause/Resume/Replay.
> - Timeline становится интерактивной после завершения полёта.
> - При просмотре истории отображай статус `Inspecting recorded motion`.
> - Replay начинает новую сессию и сбрасывает timeline/reference.
> - Reset View меняет только камеру, не выбранный момент.
> - Переход в другой урок корректно очищает ресурсы.
> - На мобильном экране timeline и инспектор должны оставаться удобными.
> 
> Небольшая правка текста Stage 1:
> 
> Вместо технического объяснения про удвоение длины стрелки во вступлении используй:
> 
> “The arrow points in the direction of the airflow. A longer arrow means faster motion.”
> 
> Численный масштаб оставь в Details.
> 
> Убери временный текст о том, что исследование записанных моментов появится на следующем этапе.
> 
> ## 6. Научные и технические ограничения
> 
> - Не изменять Demo velocity fields, интеграторы, параметры траекторий и датасеты.
> - Не менять научные контракты и замороженные документы.
> - Не запускать scientific qualification campaigns.
> - Не использовать конечные разности траектории вместо настоящей инспекции скорости.
> - Не нормировать стрелки до одинаковой длины.
> - Не интерпретировать изменение скорости вдоль пути как изменение стационарного поля во времени.
> - Не менять Slice 1/2 сверх необходимой интеграции.
> - Не создавать новую документацию сверх минимально необходимой по governance.
> - Без commit, push или deploy.
> 
> ## 7. Проверка и отчёт
> 
> Добавь релевантные тесты на:
> 
> - выбор первого, промежуточного и последнего записанного состояния;
> - соответствие позиции, времени, скорости и 3D-стрелки;
> - преобразование компонент East/North/Vertical;
> - корректность Reference при перемещении timeline;
> - Replay, Reset View и переход между уроками;
> - недоступность инспекции и отсутствие подстановки нулей;
> - отсутствие повторного интегрирования при историческом просмотре.
> 
> Выполни тесты, typecheck и build.
> 
> Если доступна браузерная проверка с WebGL, проверь интерактивное поведение. Если нет — явно укажи это в отчёте.
> 
> После реализации сообщи изменённые файлы, результаты проверок, известные ограничения и остановись до визуальной приёмки.

## Source instruction — English translation

Learn Slice 3 — Stage 2: Inspect & Compare. Complete Read the Motion by letting
users inspect A's recorded trajectory, read velocity/components and compare two
moments. Stage 1 already has introduction, A flight, genuine 3D velocity arrow,
Pause/Resume/Replay and path recording. Before work read AGENTS.md, necessary
governance/current status and the existing Slice 3 implementation. Use it as the
basis; do not repeat broad architecture research.

After the first complete flight show “Now investigate the path” and “The flight
is complete. Choose a recorded moment to inspect how the airflow was moving at
that position.” Add an interactive 0–120 model-second timeline choosing only
actual recorded states at 0.1-second intervals. Users can choose any recorded
step; display selected time numerically. Move A and its gold arrow to the
recorded 3D point, keeping the full path visible. Obtain velocity through the
same Demo session's observation. Do not reintegrate, create a second composition,
change the current clock or interpolate arbitrary states. Explicitly show
unavailable velocity rather than zero. Reset selection on lesson changes,
Replay and history destruction.

Show Speed (full vector magnitude, m/s), Eastward (vx, m/s), Northward (−vz, m/s),
Vertical (vy, m/s), Height (position.y, metres above model ground), and Model time
(seconds), preserving StormRelativeLaboratory and never subtracting C again.
Emphasize Speed and Vertical by default; put other components in “Show components”.
Explain signed Eastward/Northward and positive-up/negative-down Vertical. Do not
confuse coordinate components with contributions of separate fields.

Add “Save for comparison”: choose time, save it as Reference, choose another
time and show Reference and Current side by side or stacked on narrow screens.
For each show model time, speed, vertical velocity and height. Speed/vertical
differences are optional only if they do not complicate the UI. Allow replacing
and clearing Reference. Reference must retain its own measured values independent
of the slider. Do not create a second Simulation or a second simultaneously
moving 3D arrow.

After investigation starts, show “Same flow. Different velocities along the
path.”, “The modeled flow is steady, but it is not uniform. As the marker travels
through different locations, it encounters different velocity vectors.” and
“The path tells us where it went. The vectors help explain how it moved.” This
observation within a prescribed kinematic model does not establish forces,
vorticity, convergence or full storm dynamics.

Keep the existing pre-start introduction and flight controls. Make the timeline
interactive after completion. Show “Inspecting recorded motion” during historical
viewing. Replay starts a new session and resets timeline/reference. Reset View
changes only the camera. Clean resources on lesson changes. Keep timeline and
inspector usable on mobile. Replace the introductory technical doubling
explanation with “The arrow points in the direction of the airflow. A longer
arrow means faster motion.” Keep the numerical scale in Details and remove the
temporary next-stage message.

Do not change Demo fields, integrators, trajectory parameters, datasets,
scientific contracts or frozen documents. Do not run qualification campaigns,
substitute finite differences for velocity inspection, normalize arrow lengths,
or interpret along-path variation as temporal field change. Do not change Slice
1/2 beyond necessary integration or add documentation beyond governance needs.
No commit, push or deploy.

Test first/intermediate/last selection; correspondence of position/time/velocity
and arrow; East/North/Vertical conversion; Reference stability; Replay, Reset
View and lesson changes; unavailable inspection without zero substitution; and
absence of reintegration. Run tests, typecheck and build. Verify interactive
WebGL if available, otherwise explicitly report the limitation. Report changed
files, verification and limitations, then stop for visual acceptance.
