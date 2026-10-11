# Documentation Governance v1 Amendment — Adoption and Conditional Bootstrap Decision

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE for the bounded adoption/pinning and bootstrap authorization; amendment activation is conditional as specified below |
| Freeze mode | EXACT_BYTE_FROZEN |
| Parent authority | [Governance v1](DOCUMENTATION_GOVERNANCE.md) and its [adoption Decision](2026-10-11-documentation-governance-v1-adoption-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |

## Decision authority

Human repository governance decision-maker issuing the explicit adoption, pinning,
bootstrap and publication instruction recorded below. Recorded by: Agent.

## Scope

Adoption and exact-byte pinning of the reviewed amendment; acceptance of the
reviewed bootstrap infrastructure; bounded bootstrap content snapshot and pure
anchor designation; conditional activation after successful designation,
verification and publication; subsequent separate mutable documentation consequences.

## Decision

Adopt and pin the [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) at the
reviewed canonical path and raw SHA-256 below. Its original proposal metadata is
preserved as historical drafting state; this external Decision records adoption
and pinning. Amendment activation remains incomplete until all stated bootstrap
conditions succeed. This record is the bounded immutable receipt of the human
decision; its final exact-byte identity is recorded in the accepted identity index,
not in a self-hash or a recursively required Decision Record.

## Authority targets and reviewed identity

| Target | Reviewed raw SHA-256 |
| --- | --- |
| `docs/DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md` | `ce91a33d7d37d3a81ea299ef180d0496a7635e3b495defa4cc80690668bc32ca` |
| `.gitattributes` | `a819675cdad941f1579bf0d81df3337cd713adb3c6766de3baf00cd8ff8ddb4b` |
| `docs/governance/frozen-identities.json` — reviewed empty preparation state | `7060c267c912e3156b87c646e3bc970eac1ac8bdd964cf0a794b83e6f1250614` |
| `docs/governance/accepted-snapshots.json` — reviewed empty preparation state | `c9aa3eccf6c2284f550d7b010070c9582a6ea10b2624f3f036bb02f28ce6c1d2` |
| `scripts/check-frozen-identities.mjs` | `0f32bf84fce92e868a9459cbd5beb93452cffcc427a1ea9f74b83d3a6a201ffe` |

The authorized population of the index and designation registry changes their
preparation bytes. Those reviewed empty hashes are provenance, not expected
post-bootstrap registry hashes. Infrastructure is not an authority document.
The new accepted index contains only the amendment and this bootstrap Decision.
Existing Governance foundations retain their prior identities and semantics;
publication of their unchanged bytes does not migrate or repin them.
Governance v1 retains SHA-256
`8bbcd46aeb55cb5272af46b2779c99373dcb5f7fc1c2297daa2cc66c3e6d4359`.

## Anchor designation

C1 is the content snapshot containing the populated index and its authority
artifacts, reviewed infrastructure and necessary unchanged Governance foundations.
C2 must be a separate direct child of C1 changing only
`docs/governance/accepted-snapshots.json`, designating the actual full Git commit
object ID of C1. No placeholder, branch, tag or HEAD substitution is accepted.
The registry entry refers to this Decision as provenance. The expected index is
recovered from C1, never redefined from the mutable working-tree index.

## Authorization consequence and activation condition

Explicit path allowlists apply to every bootstrap commit. Unrelated pre-existing
dirty/untracked artifacts are excluded. Verify exact bytes and the designation,
then publish the bootstrap. Amendment activation completes only after successful
C2 designation, verification and publication. Until then it is conditional/incomplete.
The checker establishes mechanical consistency, not human authority or publication.

After successful activation, a separate ordinary C3 may record only amendment
consequences in PROJECT_STATUS, AGENTS and README/navigation. C2 contains none of
those updates. C3 is not an anchor for C2, is outside the verification chain and
creates no additional recursion level. PROJECT_STATUS remains the sole mutable
project-wide current-state owner.

## Explicit NOT authorized

No retroactive migration/repinning of historical frozen artifacts, Governance v1
byte changes, scientific/model semantic changes, scientific execution/qualification,
or implementation/execution authority outside this documentation-governance
bootstrap. Infrastructure, Git snapshots, checker and publication do not themselves
create human authority. Approval, freeze and developer verification are not
scientific certification or research-stage authorization.

## Date

2026-10-11.

## Source language

Russian (ru).

## Source instruction — original

**Я принимаю Documentation Governance v1 Amendment в точной проверенной версии `docs/DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md`, SHA-256 `ce91a33d7d37d3a81ea299ef180d0496a7635e3b495defa4cc80690668bc32ca`, и разрешаю его adoption и EXACT_BYTE_FROZEN pinning.**
**Я принимаю проверенную identity-verification infrastructure как bootstrap infrastructure:** `.gitattributes` SHA-256 `a819675cdad941f1579bf0d81df3337cd713adb3c6766de3baf00cd8ff8ddb4b`; `docs/governance/frozen-identities.json` SHA-256 `7060c267c912e3156b87c646e3bc970eac1ac8bdd964cf0a794b83e6f1250614`; `docs/governance/accepted-snapshots.json` SHA-256 `c9aa3eccf6c2284f550d7b010070c9582a6ea10b2624f3f036bb02f28ce6c1d2`; `scripts/check-frozen-identities.mjs` SHA-256 `0f32bf84fce92e868a9459cbd5beb93452cffcc427a1ea9f74b83d3a6a201ffe`.
**Я разрешаю создать bounded bootstrap/adoption Decision Record, подготовить populated frozen-identity index для принятых bootstrap authority artifacts и выполнить bootstrap через explicit staging allowlist: C1 content snapshot, затем отдельный C2, который меняет только `docs/governance/accepted-snapshots.json` и механически обозначает фактический полный Git commit object ID C1 как accepted snapshot.**
**Я разрешаю verification и publication этого bootstrap. Amendment становится ACTIVE только после успешного C2 designation, verification и publication; до этого activation остаётся conditional/incomplete. После успешной activation я разрешаю отдельный C3 с необходимыми mutable documentation consequences в PROJECT_STATUS, AGENTS и README/navigation только в пределах последствий принятого amendment. C3 не является частью anchor chain и не anchors C2.**
**Все bootstrap commits должны использовать explicit path allowlists. Pre-existing unrelated dirty/untracked artifacts не должны случайно попадать в C1/C2/C3. Existing Governance foundations, необходимые для reconstructable published authority chain, должны включаться только осознанно и с сохранением уже проверенных identities/semantics.**
**Это решение не разрешает retroactive migration/repinning historical frozen artifacts, изменение Governance v1, scientific/model semantic changes, scientific execution/qualification, либо какую-либо implementation/execution authority вне описанного documentation-governance bootstrap. Infrastructure, Git snapshot, checker и publication сами по себе не создают human authority.**

## Source instruction — English translation

I accept the Documentation Governance v1 Amendment in the exact verified version
`docs/DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md`, SHA-256
`ce91a33d7d37d3a81ea299ef180d0496a7635e3b495defa4cc80690668bc32ca`,
and authorize its adoption and EXACT_BYTE_FROZEN pinning.

I accept the verified identity-verification infrastructure as bootstrap
infrastructure: `.gitattributes` SHA-256
`a819675cdad941f1579bf0d81df3337cd713adb3c6766de3baf00cd8ff8ddb4b`;
`docs/governance/frozen-identities.json` SHA-256
`7060c267c912e3156b87c646e3bc970eac1ac8bdd964cf0a794b83e6f1250614`;
`docs/governance/accepted-snapshots.json` SHA-256
`c9aa3eccf6c2284f550d7b010070c9582a6ea10b2624f3f036bb02f28ce6c1d2`;
`scripts/check-frozen-identities.mjs` SHA-256
`0f32bf84fce92e868a9459cbd5beb93452cffcc427a1ea9f74b83d3a6a201ffe`.

I authorize creating a bounded bootstrap/adoption Decision Record, preparing a
populated frozen-identity index for the accepted bootstrap authority artifacts,
and performing bootstrap through an explicit staging allowlist: C1 content
snapshot, then a separate C2 changing only
`docs/governance/accepted-snapshots.json` and mechanically designating the actual
full Git commit object ID of C1 as the accepted snapshot.

I authorize verification and publication of this bootstrap. The amendment becomes
ACTIVE only after successful C2 designation, verification and publication; until
then activation remains conditional/incomplete. After successful activation I
authorize a separate C3 with necessary mutable documentation consequences in
PROJECT_STATUS, AGENTS and README/navigation only within the consequences of the
adopted amendment. C3 is not part of the anchor chain and does not anchor C2.

All bootstrap commits must use explicit path allowlists. Pre-existing unrelated
dirty/untracked artifacts must not accidentally enter C1/C2/C3. Existing Governance
foundations necessary for a reconstructable published authority chain must be
included only deliberately and with their already verified identities/semantics
preserved.

This decision does not authorize retroactive migration/repinning of historical
frozen artifacts, Governance v1 changes, scientific/model semantic changes,
scientific execution/qualification, or implementation/execution authority outside
the described documentation-governance bootstrap. Infrastructure, Git snapshot,
checker and publication do not themselves create human authority.
