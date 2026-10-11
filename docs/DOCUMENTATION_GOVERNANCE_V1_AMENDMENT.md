# Documentation Governance v1 — Bounded Amendment Proposal

## Status

| Field | Value |
| --- | --- |
| Document type | SPECIFICATION / CONTRACT |
| Approval state | PROPOSED |
| Authority status | INACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Bounded amendment to Documentation Governance v1 covering effective frozen authority identity and independently anchored verification, multilingual Decision Record provenance and authority/Scope separation |
| Parent authority | Active [Documentation Governance v1](DOCUMENTATION_GOVERNANCE.md), externally adopted by its [Decision Record](2026-10-11-documentation-governance-v1-adoption-decision.md), and the human-authorized proposal drafting scope following G5 |
| Current project state | [PROJECT_STATUS.md](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## 1. Relationship and prospective application

This proposal has no active precedence. It does not approve, activate, freeze or
pin itself. Separate human adoption is required before its proposed rules apply.

[Governance v1](DOCUMENTATION_GOVERNANCE.md) remains APPROVED, ACTIVE and
EXACT_BYTE_FROZEN under its existing adoption Decision Record. Its bytes and
historical identity remain intact.

If separately adopted, this amendment would control only where it explicitly
extends Governance v1 §8 (Decision Records) or §12 (Frozen artifacts).
Governance v1 continues to control all unchanged topics.

The effective-identity rules apply only to authority artifacts pinned after
amendment adoption. The provenance requirements apply only to Decision Records
created after amendment adoption. Existing historical pins remain valid under
the identity semantics governing their adoption. Existing Decision Records
remain valid historical records even if they lack the proposed fields.

Adoption MUST NOT retroactively invalidate, reinterpret, repin, relocate or
migrate existing frozen artifacts, or rewrite existing Decision Records merely
to satisfy these new requirements.

## 2. INTRODUCED / NOT INTRODUCED

### INTRODUCED

- Prospective effective identity for every EXACT_BYTE_FROZEN authority artifact:
  canonical repository-relative path + SHA-256 of exact raw bytes.
- Independently recoverable expected identities through a repository identity
  index anchored to an explicitly designated accepted Git snapshot.
- Distinct artifact identity, human pinning authority/provenance and verification
  anchoring. The index, Git snapshot and verification tooling do not themselves
  create human authority.
- Prospective multilingual Decision Record provenance: verbatim original source,
  source language and conditional faithful English translation; Decision authority
  identifies the role separately from the existing Scope field. The existing
  Decision field remains, with optional Recorded by attribution.

### NOT INTRODUCED

This proposal changes no scientific/model semantics and introduces no action
authorization. It does not change:

- The seven document types or the Approval, Authority, Freeze, gate/execution or
  scientific/numerical classification vocabularies.
- Recognition of explicit human decisions or the boundaries between approval and
  authorization, CLOSED and PASS, or FROZEN and CERTIFIED.
- Scientific/model scope firewalls, NOT INTRODUCED / NOT CLAIMED semantics, or
  developer verification versus scientific qualification.
- Consequence/debt detection, PROJECT_STATUS ownership, the legacy
  no-automatic-migration rule or fail-safe handling of insufficient authority inputs.

REJECTED is not added to Approval state. Signature infrastructure is not
introduced. No `.gitattributes`, manifest or checker implementation is specified.
No implementation, execution or qualification authority is created.

## 3. Proposed extension to §12 — Effective frozen identity

### Uniform identity and human authority

For every EXACT_BYTE_FROZEN authority artifact pinned after amendment adoption,
effective frozen identity MUST consist of its canonical repository-relative path
and SHA-256 of its exact raw bytes. This applies regardless of document type or
whether the artifact pins anything else, including specifications/contracts,
authorization-only, classification, supersession and adoption Decision Records,
and other frozen authority artifacts.

Human-governed decisions establish whether freeze/pinning or another transition
is authorized. Applicable human decision/provenance establishes that a particular
identity was intentionally accepted as frozen where Governance requires such a
transition. Pinning provenance is distinct from artifact identity. A hash, Git
object, identity index or checker MUST NOT create human authority.

PROJECT_STATUS remains the sole mutable project-wide CURRENT owner/navigation
resolver, not the owner or source of immutable authority identity.

SHA-256 remains a hash of raw exact bytes. Verification MUST NOT normalize EOL,
whitespace, Unicode, BOM or any other artifact content before hashing.

### Independently recoverable expected identity

Verification MUST use an expected identity independent of the current bytes being
checked. Computing SHA-256 of current bytes without an independently recoverable
expected identity is not sufficient to verify a frozen pin.

Expected frozen identities MUST be represented in a repository identity index
suitable for machine verification. Each indexed identity MUST associate at least:

- Canonical repository-relative artifact path.
- Expected exact-byte SHA-256.
- Applicable pinning provenance / Decision reference where required.

The index represents accepted identities and supports verification. It MUST NOT
create approval, authorization, freeze authority, scientific classification or
any other human authority. It MUST NOT silently rewrite a historical accepted
identity to match changed bytes. Supersession, relocation or a newly accepted
identity MUST preserve historical meaning rather than retrospectively changing
an old accepted pin.

### Designated accepted Git snapshot and finite trust boundary

The accepted index state MUST be anchored by an explicitly designated accepted
Git snapshot/object identity. Ordinary existence in Git history or arbitrary
current HEAD is not automatically an accepted anchor. A retargetable tag name
alone MUST NOT be treated as sufficient immutable identity.

The repository process MUST identify the accepted Git object/state sufficiently
for a cold-start verifier to recover the accepted index bytes. Changed current
index bytes MUST NOT silently redefine that accepted state. A mismatch MUST NOT
be automatically repaired; if the accepted Git object is unavailable,
verification cannot be completed.

The verification chain terminates at the designated accepted repository snapshot
and repository publication trust boundary. It does not require self-hashes,
recursive identity Decision Records or another Decision Record merely because
a Decision Record itself is frozen. No cryptographic-signature or PKI requirement
is introduced.

This repository-level mechanism detects relevant inconsistency relative to the
accepted anchor. It does not cryptographically prove speaker identity or defend
against complete replacement of repository history together with all anchors
not independently retained and available.

Index format/path, checker implementation, Git command/tag/commit workflow and
checkout-byte infrastructure belong to later separately authorized infrastructure
work; this proposal specifies only the mechanism's existence and semantic role.

### Relocation and historical identities

The path is part of effective authority identity because relocation can change
relative-link resolution and authority/navigation context even when bytes are
unchanged. Rename/move of a frozen authority is not a transparent filesystem
operation: it requires a bounded human-governed decision.

Before relocation is accepted, relative-link interpretation and inbound
authority/navigation pointers MUST be reviewed. Unchanged bytes alone do not
authorize relocation or establish an accepted identity at the new path.

Infrastructure may detect path or digest mismatch. It MUST NOT itself authorize
relocation or create a new pin. These rules do not replace Governance v1's
EXACT_BYTE_FROZEN prohibition on byte changes or its external
Decision/Status/successor mechanisms.

## 4. Proposed extension to §8 — Decision Record provenance

For Decision Records created after adoption, the existing minimum semantic
structure in Governance v1 §8 is retained and extended as follows.

### Decision authority — REQUIRED

Record WHO / IN WHAT AUTHORITY-BEARING ROLE issued the decision: the declared
authority-bearing role is required. A personal name may be included but is not
sufficient by itself. This field MUST NOT duplicate or replace Scope. It records
repository-declared authority metadata, not cryptographic authentication.

### Scope — existing REQUIRED field

Scope continues to record WHAT bounded subject/effect this specific Decision
covers. No second authority-scope field is introduced.

### Source instruction — original — REQUIRED

Record a bounded verbatim excerpt of the authority-bearing human instruction
in the language in which the decision was actually issued.
It MUST:

- Preserve exact decision-bearing wording.
- Include all clauses needed to preserve target/action, restrictions, exclusions,
  identity constraints and temporal conditions.
- Omit unrelated conversation.
- Mark omissions explicitly when multiple separated excerpts are needed.
- Not be replaced by an agent paraphrase or translation.
- Not use an arbitrary character/word limit that can truncate exclusions.

The source scope is the bounded decision and its necessary qualifying clauses,
not the surrounding conversation. The original is the authority-bearing source
representation.

### Source language — REQUIRED

Record the original source instruction's language in an explicit structured field.

### Source instruction — English translation — CONDITIONAL

If the original instruction is not English, a faithful English translation is
required for public readability. It MUST preserve target/action, restrictions,
exclusions, identity constraints and temporal conditions, and MUST NOT broaden
or narrow the original. It MUST be distinguishable from the verbatim original
and is not the original authority-bearing source. An English original requires
no duplicate translation.

### Decision — REQUIRED, retained

Keep the existing normalized bounded Decision field. Do not introduce a second
normalized-decision field. The Decision may be written in English. Normalization
MUST NOT broaden the original instruction, discard its restrictions, exclusions,
identity constraints or temporal scope, or derive authority absent from the source.

The provenance chain MUST be reconstructable as original human instruction
→ faithful English translation where needed → normalized repository Decision.
In a discrepancy, the translation MUST NOT silently override the original source.

### Recorded by — OPTIONAL

This field may identify the recorder/normalizer, for example Agent. It does not
itself establish decision authority.

Repository provenance does not cryptographically prove speaker identity or that
a human issued the quoted instruction. Decision Records remain bounded records
of decisions, not chat transcripts. If authority inputs remain ambiguous or
insufficient, Governance v1's existing fail-safe behavior continues to apply:
do not infer permission, preserve existing authority and request explicit human
disposition for a gated next action.
