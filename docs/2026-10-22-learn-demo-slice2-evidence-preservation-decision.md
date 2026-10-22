# Learn Demo Slice 2 — local evidence preservation record

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Documentation of the executor-reported completed local Slice 2 backup and its preservation limits only |
| Parent authority | Explicit human documentation instruction below; active Governance v1 and amendment via PROJECT_STATUS |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Decision authority

Human project owner acting as authorizer of this bounded documentation action.
Recorded by Agent. APPROVED / ACTIVE records that explicit instruction, not an
independent audit or human approval of newly generated document wording.

## Scope and Decision

Record the already completed local preservation operation and the executor's reported
verification results below. Add a short dated pointer to PROJECT_STATUS without
rewriting earlier Learn entries. This is a documentation-only disposition; it neither
repeats the preservation operation nor retrospectively enlarges execution authority.

All execution and verification facts below are **local results reported by the
preservation executor**, as supplied in the human instruction and accompanying TXT.
They are not independently confirmed by an external audit. This documentation action
does not claim a new archive-verification run.

## Authority targets and reported identities

The original computational execution remains governed by the
[Slice 2 collection Decision](2026-10-21-learn-demo-collection-slice-2-authorization.md),
with [Slice 1 implementation scope](2026-10-21-learn-demo-collector-slice-1-authorization.md)
and [verification Design §7](ux/2026-10-21-learn-mvp-demo-seed-verification-design.md#7-provenance-storage-and-preservation)
as context. Neither that Decision nor the evidence is changed here.

### Original evidence — executor-reported

- Run ID: `2026-10-21-slice2-125957-dc632454`.
- Repository-relative source directory:
  `artifacts/learn-demo-seed-verification/2026-10-21-slice2-125957-dc632454`.
- 103 files: result.json, provenance.json, checksums.json and 100 source snapshots.
- Five completed controlled-collection cases: A, B1, B2, A/B1, A/B2.
- Original evidence remained unchanged; collector was not rerun for preservation.

### Local backup — executor-reported

| Item | Reported value |
| --- | --- |
| ZIP location | `D:\AI\supercell-backups\supercell-learn-slice2-evidence-2026-10-21.zip` |
| ZIP size | 990599 bytes |
| ZIP SHA-256 | `ea4f708dc9339dd27836fa5ce1eb71468b85d7ffce09ec705052a9eac4fb9afb` |
| Operation date | 2026-10-21 |
| Creation timestamp in accompanying TXT | `2026-10-21T14:27:31.800197+00:00` |
| Accompanying TXT | `D:\AI\supercell-backups\supercell-learn-slice2-evidence-2026-10-21.txt` |

The executor reported readable ZIP contents and a successful CRC check, exactly 103
unique files with no extras, preservation of relative structure and the original
run-directory name, and SHA-256 agreement between all 103 archived files and their
originals. The full 102-entry checksum inventory and 100 source snapshots were
reported checked; the three primary digests were reconfirmed from the ZIP:

| File | Reported SHA-256 |
| --- | --- |
| result.json | `7826f9152e7be98bf27b11f859c2755f095f60a3ecce091a4695fbb1691c8678` |
| provenance.json | `01dbe70accf2372db8545a1b487eba7dc8f997e52fc5aabb76bf91547ae1ef8f` |
| checksums.json | `2a4a9db3d2a612eb8b34c5f26b249c6a046b632a2428a700e5180684f975f543` |

The TXT contains archive identity, verification results, source/run provenance,
related local Decision paths, and privacy/license warnings. The ZIP contains the
unchanged evidence set only, not the entire repository or unrelated logs.

These digests identify reported preserved bytes; they are not Governance freeze/pins.

## Preservation limits

**LOCAL BACKUP — NOT PUBLICATION.**

- Both the original directory and ZIP are on the same `D:` volume. Independent
  storage on another device or in the cloud is **not confirmed**.
- Independent long-term archival, off-device disaster recovery and public access
  are **not claimed**.
- The ZIP is intentionally outside Git. Original artifacts are ignored; a fresh
  clone does not automatically contain this evidence or the backup.
- Absolute local paths above identify reported current placement, not portable
  environment requirements. A different checkout need not reproduce these paths.
- Public evidence distribution requires a separate decision and privacy, licensing
  and attribution review. Provenance may contain absolute local paths. Existing
  [project license](../LICENSE.md) and [third-party notices](../THIRD_PARTY_NOTICES.md)
  must be considered; the exact-evidence ZIP does not add those repository files.

The local preservation documentation consequence is recorded here. Independent
retention and public distribution remain separate unresolved dispositions.

## Scientific boundaries and authorization consequence

Preservation concerns reported byte retention and copy-integrity checks, **not
scientific correctness of the computational results**. No scientific classification
is created by a successful ZIP or checksum check.

Phase P2 remains **NOT CERTIFIED** (PROJECT_STATUS: NOT YET CERTIFIED). Main L1
remains **NOT AUTHORIZED**. The Slice 2 collection permission has already been
consumed and is not renewed. Both Learn/verification Designs retain
PROPOSED / INACTIVE / MUTABLE.

NOT INTRODUCED: new model/physics/runtime semantics. NOT CLAIMED: scientific
qualification, teaching-seed suitability, independent audit or durable off-device
archival. No new experiment, physics/runtime change or Learn implementation is
authorized. No new run, backup, publication, staging, commit, push or fetch is
authorized by this record. Frozen SoT and historical records remain untouched.

The only action authorized now is creation of this record, minimal status navigation
and documentation checks, followed by stopping for a separate human instruction.

## Date

- Preservation performed: **2026-10-21**, as reported by the executor.
- Documentation Decision recorded: **2026-10-22**.

The requested filename identifies the documentation date; it does not redate the
historical backup operation.

## Source language

Russian (ru).

## Source instruction — original

разрешаю ограниченное документационное изменение: зафиксировать уже выполненное локальное резервное копирование evidence Slice 2.

**Scope: только документация.** Никаких новых прогонов, архивов, изменений кода, staging, commit или push.

[Omission: calibration instructions; decision-bearing targets, attribution requirements and restrictions follow.]

Не изменяй frozen SoT и исторические документы без предусмотренной governance-процедуры.

Создай отдельный bounded Decision Record о сохранении evidence, с датой фактического выполнения операции и статусами согласно действующим правилам governance.

Предлагаемое имя:

`docs/2026-10-22-learn-demo-slice2-evidence-preservation-decision.md`

Если governance предписывает другое имя или структуру, следуй ему и объясни отклонение.

Зафиксируй следующие факты **как результаты локальной проверки, сообщённые исполнителем**, не как независимо подтверждённые внешним аудитом.

**Исходный набор:**

`artifacts/learn-demo-seed-verification/2026-10-21-slice2-125957-dc632454`

- 103 файла.
- Пять завершённых случаев controlled collection.
- Исходный evidence остался неизменным.
- Повторный collector не запускался.

**Локальная копия:**

`D:\AI\supercell-backups\supercell-learn-slice2-evidence-2026-10-21.zip`

- Размер: `990599` байт.
- SHA-256 ZIP:

`ea4f708dc9339dd27836fa5ce1eb71468b85d7ffce09ec705052a9eac4fb9afb`

- ZIP читается; CRC-проверка пройдена.
- Внутри 103 уникальных файла, без лишних.
- SHA-256 содержимого 103/103 файлов совпали с оригиналами.
- Структура и имя run-каталога сохранены.
- Три основные контрольные суммы подтверждены.

**Сопроводительный файл:**

`D:\AI\supercell-backups\supercell-learn-slice2-evidence-2026-10-21.txt`

Отметь, что TXT содержит сведения о проверке, происхождении набора и предупреждения о приватности и лицензиях.

### 3. Ограничения сохранности

Обязательно явно укажи:

- Архив является **LOCAL BACKUP — NOT PUBLICATION**.
- Исходный каталог и ZIP находятся на одном диске `D:`.
- Независимая копия на другом носителе или в облаке пока **не подтверждена**.
- ZIP намеренно не включён в Git.
- Fresh clone репозитория не содержит этот evidence автоматически.
- Локальные абсолютные пути — сведения о текущем размещении, а не переносимые требования к окружению.
- Публикация evidence потребует отдельного решения с проверкой приватности, лицензий и attribution.

Не утверждай, что выполнено независимое долговременное архивирование.

### 4. Научные границы

Отдельно зафиксируй:

- Preservation подтверждает сохранение байтов и проверку целостности копии, но **не научную корректность результатов**.
- Phase P2 остаётся NOT CERTIFIED.
- Main L1 остаётся NOT AUTHORIZED.
- Разрешение на Slice 2 collection уже использовано и не возобновляется.
- Никаких новых прав на эксперименты, изменение physics/runtime или реализацию Learn эта запись не предоставляет.

### 5. Навигация

Добавь в `docs/PROJECT_STATUS.md` краткий указатель на новую запись.

Сохрани существующие Learn-параграфы и их хронологию. Не переписывай старые статусы задним числом и не затрагивай несвязанные изменения.

[Omission: documentation-check and report-format lists.]

**Не выполнять staging, commit, push или fetch.**

После отчёта остановись и дождись отдельного разрешения.

## Source instruction — English translation

I authorize a bounded documentation change to record the already completed local
backup of Slice 2 evidence. Documentation only: no new runs, archives, code changes,
staging, commit or push. Create a separate bounded Decision Record with the actual
operation date and Governance statuses, preferably at
docs/2026-10-22-learn-demo-slice2-evidence-preservation-decision.md; explain any
Governance-required naming/structure deviation.

Record the facts as local verification results reported by the executor, not as
independently externally audited findings: source run
artifacts/learn-demo-seed-verification/2026-10-21-slice2-125957-dc632454 contains
103 files and five completed controlled cases; original evidence was unchanged
and collector was not rerun. The local ZIP is
D:\AI\supercell-backups\supercell-learn-slice2-evidence-2026-10-21.zip,
990599 bytes, SHA-256
ea4f708dc9339dd27836fa5ce1eb71468b85d7ffce09ec705052a9eac4fb9afb.
It is readable and passed CRC, contains 103 unique files without extras, all 103
content hashes matched originals, preserves structure/run-directory name, and
the three primary digests were confirmed. The accompanying same-basename TXT
contains verification/provenance information and privacy/license warnings.

Explicitly state LOCAL BACKUP — NOT PUBLICATION, same D: volume for source and ZIP,
no confirmed independent copy on another device/cloud, ZIP intentionally outside
Git, no automatic evidence in fresh clones, absolute paths as current local placement
rather than portable requirements, and separate permission/privacy/license/attribution
review before evidence publication. Do not claim independent long-term archival.

Preservation concerns bytes/copy integrity, not scientific correctness. Phase P2
remains NOT CERTIFIED and Main L1 NOT AUTHORIZED. Slice 2 collection permission
is consumed and not renewed; no new experiments, physics/runtime changes or Learn
implementation are permitted. Add only a short PROJECT_STATUS pointer, preserving
earlier Learn paragraphs/chronology and unrelated work. No staging, commit, push
or fetch. After the report stop and await separate authorization.

[Omissions match those marked in the original excerpt.]
