# Learn — shared lesson navigation, stage 1

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Bounded shared navigation between implemented Learn lessons |
| Parent authority | Human project owner instruction below; [Governance](DOCUMENTATION_GOVERNANCE.md), its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), and [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Earlier Learn navigation arrangements only within this stage; no scientific authority |
| Superseded by | None |

## Decision authority

Human project owner acting as product decision-maker and implementation authorizer.
Recorded by Agent. This records the instruction, not acceptance of the resulting UI.

## Scope and Decision

Authorize stage 1 only: shared, compact horizontal navigation between Look Around
and Follow Motion at the common Learn layout. Preserve lesson content, controls,
session behavior and departure guards. Highlight the current lesson beyond color,
allow direct switching without completion gates, keep names readable on narrow
screens, and make the lesson list extensible. Read the Motion is not an available
route. Use existing UI patterns; verify teardown and fresh playback state on return.

## Authority targets and reviewed identity

Targets: Learn layout/navigation and scoped styles/tests; inherited bounded
[Slice 1](2026-10-22-learn-slice-1-implementation-decision.md) and
[Slice 2](2026-10-22-learn-slice-2-implementation-decision.md) behavior.
No exact implementation identity was supplied or accepted. No freeze, pinning,
scientific classification or approval of the complete Learn Design is inferred.
New documentation targets are this mutable DECISION RECORD and the mutable STATUS
owner. Existing frozen authorities are not edit targets. Amendment identities were
resolved and checked through accepted snapshot
`8d916037058a919560b6c2d01ae65823589e96bb`.

## Authorization consequence

Implement this navigation stage and run relevant frontend tests, typecheck and
build. Record its documentation consequences under Governance §§8/14, then stop
for human interface review. Implementation permission is not human UI acceptance.

## Explicitly NOT authorized

Slice 3, physics/dataset/integrator/scientific-contract changes, lesson scientific
meaning changes, unrelated edits, new scientific campaigns, commit, push or deploy.
No scientific gate changes or scientific qualification claims.

## Date and source language

2026-10-24. Russian (ru).

## Source instruction — original

> Работаем поэтапно. **Сейчас только этап 1: общая навигация Learn.** Slice 3 пока не реализуем.
>
> ### Задача
>
> Добавить в верхнюю часть Learn компактную горизонтальную навигацию между уроками.
>
> Сейчас доступны:
>
> 1. **Look Around**
> 2. **Follow Motion**
>
> Третий урок, **Read the Motion**, пока только проектируется. Не показывай его как доступный маршрут, пока он не реализован.
>
> ### Требования к UX
>
> - Навигация видна в обоих существующих уроках.
> - Текущий урок отчётливо выделен, не только цветом.
> - Можно свободно переключаться между уроками, без обязательного последовательного прохождения.
> - Названия уроков читаемы на узких экранах.
> - При появлении новых уроков навигация должна расширяться без переработки архитектуры.
> - Не добавляй замочки, оценки, обязательный прогресс или состояние «пройдено».
> - Сохрани существующие объяснения, управление и поведение уроков.
> - Навигация не должна перекрывать 3D-сцену или элементы управления.
>
> ### Технические требования
>
> Перед изменениями изучи существующую структуру Learn и найди подходящий общий уровень для навигации.
>
> Не дублируй компонент навигации внутри каждого урока, если его можно разместить на уровне общего Learn layout.
>
> Проверь, что при переключении уроков корректно завершается предыдущая сессия, освобождаются ресурсы сцены и не переносятся состояния воспроизведения.
>
> Используй существующие UI-паттерны и стили проекта. Не вводи новый UI framework.
>
> ### Границы
>
> - Не изменяй физику, датасеты, интеграторы или научные контракты.
> - Не меняй содержание и научный смысл Slice 1/2.
> - Не реализуй Slice 3 в этом этапе.
> - Не трогай unrelated files.
> - Соблюдай AGENTS.md и документационный governance.
> - Не делай commit, push или deploy без моего разрешения.
>
> ### Проверка
>
> Выполни релевантные frontend-тесты, typecheck и build.
>
> Сообщи:
>
> - Какие файлы изменены.
> - Как устроена навигация.
> - Как обрабатывается переключение и очистка состояния.
> - Какие проверки прошли.
> - Есть ли ограничения или риски.
>
> После этого остановись и дождись проверки интерфейса.

## Source instruction — English translation

Work in stages. Now only stage 1: shared Learn navigation. Do not implement Slice 3.
Add compact horizontal lesson navigation at the top of Learn. Available lessons:
Look Around and Follow Motion. Read the Motion is still being designed; do not
show it as an available route until implemented.

Navigation must appear in both lessons. Distinguish the current lesson beyond
color. Allow free switching without mandatory sequential completion. Names must
be readable on narrow screens; new lessons must be addable without architectural
redesign. Do not add locks, grades, mandatory progress or completed state. Preserve
existing explanations, controls and lesson behavior. Do not overlap the 3D scene
or controls.

Before changes, inspect Learn and choose a suitable shared level. Do not duplicate
navigation inside lessons when it can live in the common layout. Verify that
switching ends the previous session, releases scene resources and does not carry
playback state over. Use existing UI patterns/styles, with no new UI framework.

Do not change physics, datasets, integrators, scientific contracts or Slice 1/2
content/scientific meaning. Do not implement Slice 3 or touch unrelated files.
Follow AGENTS.md and documentation governance. Do not commit, push or deploy
without permission.

Run relevant frontend tests, typecheck and build. Report changed files, navigation
structure, switching and cleanup, successful checks, limitations and risks. Then
stop and await interface review.
