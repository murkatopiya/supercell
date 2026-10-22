# Learn — bounded authorization for five local thematic commits

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | One sequence of five local Learn commits, exact selective staging and bounded pre-commit checks only |
| Parent authority | Explicit human permission and allowlist extension reproduced below; active Governance v1 and amendment via PROJECT_STATUS |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None; adds only the local Git permission excluded by earlier implementation/documentation slices |
| Superseded by | None |

## Decision authority

Human project owner acting as authorizer of bounded local repository recording.
Recorded by Agent. These states record explicit permission, not independent code
review, scientific qualification, publication approval or approval of newly drafted
record wording.

## Scope and Decision

Record the previously issued permission, explicitly reaffirmed and extended to this
Decision: create exactly five ordinary local thematic commits in the order below,
starting from HEAD `456696e3303607320ceeb6ae03c133243a8b3584`. Do not amend or rewrite
existing history, create additional commits, or infer permission to repeat the sequence.

Only the exact new-file allowlists below and their corresponding PROJECT_STATUS
fragments may enter the index. Existing intentional local placement paths in the
preservation Decision may remain as provenance metadata; this permits no inclusion
or distribution of evidence/ZIP/TXT/source snapshots.

The already agreed documentation additions are one minimal reported human visual
EVIDENCE RECORD and its status pointer, the last-status date update to 2026-10-22 in
commit 4, this Decision and its pointer in commit 1. The human record belongs in
commit 5, contains no screenshots, and reports only Chrome inspection of saved A+B1
and A+B2, both paths visible and framing appearing correct. Unknown inspection date,
browser version, viewport and observed build identity remain NOT RECORDED. It does
not establish automated regression, full code review, all-state checks or science.

## Authority targets and reviewed identity

The targets are the audited working-copy files listed below, not new implementation.
Preflight must match the reviewed inventory and empty index before staging. Starting
HEAD identifies repository context; untracked file existence is not approval or
scientific identity. Neither the Designs nor this Decision is frozen/pinned.

All paths below are repository-relative. Every group also includes only its named
PROJECT_STATUS fragments; no directory-wide staging is authorized.

### Commit 1 — docs(learn): record proposed Learn MVP design and boundaries

- docs/2026-10-21-learn-mvp-documentation-decision.md
- docs/ux/2026-10-21-learn-mvp-design.md
- docs/2026-10-22-learn-local-commits-authorization.md
- docs/PROJECT_STATUS.md: Learn MVP documentation and local-commit authorization pointers;
  the already audited last-update change from 2026-10-11 to 2026-10-21.

### Commit 2 — docs(learn): record Demo seed verification design

- docs/2026-10-21-learn-mvp-demo-seed-verification-documentation-decision.md
- docs/ux/2026-10-21-learn-mvp-demo-seed-verification-design.md
- docs/PROJECT_STATUS.md: verification-documentation pointer.

### Commit 3 — tools(learn): add opt-in Demo seed collector

- docs/2026-10-21-learn-demo-collector-slice-1-authorization.md
- tools/learn-demo-seed-verification/collector.ts
- tools/learn-demo-seed-verification/collector.run.test.ts
- tools/learn-demo-seed-verification/collector.infrastructure.test.ts
- tools/learn-demo-seed-verification/vitest.config.ts
- tools/learn-demo-seed-verification/tsconfig.json
- docs/PROJECT_STATUS.md: collector Slice 1 pointer.

### Commit 4 — docs(learn): record controlled collection and preservation

- docs/2026-10-21-learn-demo-collection-slice-2-authorization.md
- docs/2026-10-22-learn-demo-slice2-evidence-preservation-decision.md
- docs/PROJECT_STATUS.md: Slice 2 collection and preservation pointers; last-update
  date 2026-10-22, with preservation as its event description.

### Commit 5 — tools(learn): add saved trajectory viewer

- docs/2026-10-21-learn-demo-viewer-slice-3-authorization.md
- docs/2026-10-21-learn-demo-viewer-framing-cleanup-authorization.md
- docs/ux/2026-10-22-learn-demo-viewer-human-visual-evidence.md
- tools/learn-demo-seed-verification/tsconfig.viewer.json
- tools/learn-demo-seed-verification/viewer/model.ts
- tools/learn-demo-seed-verification/viewer/main.ts
- tools/learn-demo-seed-verification/viewer/index.html
- tools/learn-demo-seed-verification/viewer/style.css
- tools/learn-demo-seed-verification/viewer/README.md
- tools/learn-demo-seed-verification/viewer/framing.ts
- tools/learn-demo-seed-verification/viewer/cleanup.ts
- tools/learn-demo-seed-verification/viewer-server/evidence.ts
- tools/learn-demo-seed-verification/viewer-server/server.ts
- tools/learn-demo-seed-verification/viewer-server/viewer.test.ts
- tools/learn-demo-seed-verification/viewer-server/initialization.test.ts
- tools/learn-demo-seed-verification/viewer-server/vitest.config.ts
- docs/PROJECT_STATUS.md: viewer Slice 3, framing/cleanup and human-observation pointers.

## Authorization consequence and checks

Perform documentation/link checks, scoped collector/viewer typechecks and infrastructure
tests with collection opt-in absent, and static collection-gate checks. No Simulation
or numerical collection may run. Stop on failed checks; do not repair unrelated code.

Before each commit compare staged name-status to its exact allowlist, inspect staged
diff and whitespace, read the full staged PROJECT_STATUS and compare both its full
content and SHA-256 to the planned intermediate version. Selective cached patches
may stage that version without replacing the working-tree file. After each commit
check SHA, parent, message, exact committed files, preserved remaining work and empty
index. Stop on deviation, without automatic amend/reset/history rewriting.

This finite permission is exhausted by the five-commit sequence. Its completion can
be reconstructed from the five descendants of the stated starting HEAD, their exact
messages and file lists; it grants no subsequent commit or publication permission.

## Explicitly NOT authorized

Push, fetch, merge, rebase, publication; git add ., git add -A, git commit -a;
collection, Simulation, P2 qualification or scientific campaigns; new Learn
implementation, physics/runtime/src or dependency/lockfile changes; new evidence;
evidence/archive mutation or Git inclusion; screenshots; unrelated UI/P2 docs,
docs/README.md, docs/research changes and historical root logs. Do not fix, delete,
overwrite or stage other local changes. No freeze/pin, scientific classification,
Phase P/P2 progression or Main L1 permission is introduced. Earlier slice records
retain their historical scope; their scientific restrictions are not superseded.

## Date and source language

2026-10-22. Source language: Russian (ru).

## Source instruction — original

подтверждаю ранее выданное разрешение на пять тематических локальных Learn-коммитов и отдельно разрешаю расширить allowlist.

### 1. Дополнительный Decision Record

Разрешаю создать:

`docs/2026-10-22-learn-local-commits-authorization.md`

Документ должен соответствовать действующему Documentation Governance §8 и фиксировать именно ранее выданное человеком разрешение на:

- пять локальных тематических коммитов Learn;
- строго ограниченный staging;
- уже согласованные документационные дополнения;
- scoped typecheck и инфраструктурные тесты;
- проверки состава каждого коммита.

Укажи `DECISION RECORD / APPROVED / ACTIVE / MUTABLE`, если эти статусы соответствуют Governance.

Не представляй документ как разрешение на новую реализацию Learn, изменение физики, научные эксперименты или публикацию.

### 2. PROJECT_STATUS

Разрешаю добавить краткий указатель на новый Decision Record.

Включи новый документ и соответствующий status-hunk в **коммит 1**.

Сохрани все существующие Learn-записи, включая Human Visual Evidence Record и preservation.

Пересчитай SHA-256 всех пяти промежуточных версий `PROJECT_STATUS.md` после добавления указателя.

### 3. Выполнение ранее утверждённого плана

После успешных документационных проверок разрешаю продолжить выполнение пяти локальных коммитов согласно предыдущему заданию.

Их тематический состав сохраняется:

1. Learn MVP documentation/design + local commits authorization.
2. Demo seed verification documentation/design.
3. Opt-in collector.
4. Controlled collection + preservation.
5. Saved Trajectory Viewer + Human Visual Evidence Record.

Для каждого коммита — только точный allowlist и соответствующие фрагменты `PROJECT_STATUS.md`.

Перед каждым commit проверяй staged diff, staged file list, whitespace и ожидаемый SHA-256 staged-версии `PROJECT_STATUS.md`.

Если новый Decision требует изменения числа коммитов, изменения разрешённого scope или иных файлов за пределами согласованного allowlist — **остановись и запроси отдельное решение**.

### 4. Неизменные запреты

Не выполнять:

- `push`, `fetch`, `merge`, `rebase`;
- `git add .`, `git add -A`, `git commit -a`;
- collection, Simulation, P2 qualification, научные кампании;
- изменение production `src/**`, physics, runtime, dependencies;
- изменение или включение в Git ignored evidence, backup ZIP/TXT;
- staging несвязанных UI/P2-документов и исторических логов.

Не исправлять посторонние изменения рабочего дерева.

[Omission: final-report list.]

**После пяти локальных коммитов остановись. Публикация отдельно не разрешена.**

The following preceding-instruction excerpts preserve the referenced documentation
and stop conditions. Unrelated text is omitted explicitly.

Разрешаю создать один минимальный EVIDENCE RECORD о выполненной владельцем проекта визуальной проверке Saved Trajectory Viewer в Chrome.

Зафиксируй только подтверждённое:

- Проверены сохранённые случаи A+B1 и A+B2.
- На предоставленных скриншотах обе траектории видны.
- Framing визуально выглядел корректным.
- Использован существующий Slice 2 saved result.
- Это ограниченное человеческое наблюдение, не автоматизированный browser regression, не полный code review, не проверка всех состояний и не научная квалификация.

Не придумывай дату, точную версию браузера, viewport, идентичность сборки или дополнительные результаты. Неизвестное обозначай `NOT RECORDED`.

Не включай сами скриншоты без отдельного решения.

Добавь краткий указатель на Evidence Record в `PROJECT_STATUS.md`.

Включи Evidence Record и соответствующий status-hunk в коммит 5.

### Last status update

Разрешаю обновить `Last status update` до `2026-10-22`, сохранив существующую структуру файла.

Сделай это в коммите 4 вместе с preservation Decision, чтобы дата соответствовала последнему зафиксированному событию.

[Omission: intervening previously approved group/staging descriptions, represented above.]

Если проверка не проходит, остановиться и предоставить отчёт. Не исправлять код за пределами явно разрешённого scope.

[Omission: exclusions already restated in the reaffirming instruction above.]

После каждого commit проверь:

- фактический commit SHA;
- точный список committed-файлов;
- отсутствие чужих файлов;
- корректное состояние оставшихся изменений;
- пустой index.

Если возникло отклонение, остановись. Не делай автоматический amend, reset или переписывание истории.

## Source instruction — English translation

I reaffirm the previously granted permission for five thematic local Learn commits
and separately extend the allowlist to docs/2026-10-22-learn-local-commits-authorization.md.
It must comply with Governance §8 and record the human permission for exactly five
local commits, strictly bounded staging, agreed documentation additions, scoped
typechecks/infrastructure tests and per-commit file checks. Use DECISION RECORD /
APPROVED / ACTIVE / MUTABLE if applicable. No new Learn implementation, physics,
scientific experiments or publication permission.

Add this Decision/status pointer to commit 1, preserve earlier Learn/visual/preservation
entries, and recalculate all five intermediate PROJECT_STATUS hashes. After successful
documentation checks continue the previously approved five groups: Learn documents
plus this authority; verification documents; collector; collection/preservation;
viewer plus Human Visual Evidence. Use only exact allowlists/corresponding status
fragments. Check staged diff/list/whitespace and staged status digest before every
commit. Stop for separate authority if count, scope or allowlist would change.

No push/fetch/merge/rebase, broad add/commit -a, collection/Simulation/P2 qualification/
campaigns, production/src/physics/runtime/dependency changes, evidence/ZIP/TXT mutation
or inclusion, unrelated UI/P2 documentation or root logs, or repairs to other local work.
After five commits stop; publication is not authorized.

Referenced preceding permission: create one minimal human EVIDENCE RECORD reporting
only Chrome viewing of saved A+B1/A+B2, both paths visible and framing appearing
correct, using the existing Slice 2 result. This is not automated regression, full
code review, all-state checks or scientific qualification. Do not invent date,
browser version, viewport or build identity; unknowns are NOT RECORDED. No screenshots.
Add its status pointer and include both in commit 5. Update Last status update to
2026-10-22 in commit 4 with preservation, keeping structure. Stop/report failed
checks without out-of-scope repairs. After each commit verify SHA, exact files,
no foreign files, remaining work and empty index; stop on deviation without amend,
reset or rewriting history. Omissions match those explicitly marked above.
