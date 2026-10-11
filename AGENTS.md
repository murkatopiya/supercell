# Documentation execution entry point

This file is the repository-level execution entry point for documentation governance.
It is not a second governance authority.
If this file conflicts with Documentation Governance v1, Documentation Governance v1 controls.

The documentation consequence/debt duties in this file apply repository-wide when
work may affect documented project state, authority, scientific/model scope,
implementation state, evidence, qualification or research-stage progression.

The documentation pre-edit protocol applies before modifying any file under `docs/**`.
Owning authority: [Documentation Governance v1](docs/DOCUMENTATION_GOVERNANCE.md).
Its adoption and externally pinned identity are recorded in the
[adoption Decision Record](docs/2026-10-11-documentation-governance-v1-adoption-decision.md).
Mutable project-wide current state belongs only to [PROJECT_STATUS](docs/PROJECT_STATUS.md).

## Before editing documentation

Before modifying any file under `docs/**`, the agent MUST:

1. Read `docs/DOCUMENTATION_GOVERNANCE.md`.
2. Read `docs/2026-10-11-documentation-governance-v1-adoption-decision.md`.
3. Read `docs/PROJECT_STATUS.md`.
4. Classify every intended target by Governance's semantic document types.
5. Determine each target's authority scope.
6. Determine its freeze mode and immutable identity constraints.
7. Identify the owning authority relevant to the requested change.
8. Identify required human-governed transitions: approval, authorization,
   freeze/pinning, classification or supersession.
9. Confirm that no required transition is inferred from conversational agreement,
   file existence, commit state, tests or agent judgment.

For an EXACT_BYTE_FROZEN target, STOP modification of that artifact.
Use the external Decision/Status/successor mechanisms defined by Governance.

## Scope and human decisions

Stay within explicit task scope. Preserve scientific/model scope, `NOT INTRODUCED`
model boundaries and `NOT CLAIMED` inference boundaries.
Distinguish developer verification from scientific qualification, approval from
authorization, CLOSED from PASS, and freeze from certification.
A child DESIGN/review/implementation-related document MUST NOT silently enlarge
parent scientific authority. If work requires semantics outside parent scope,
report `SPECIFICATION CHANGE REQUIRED`; do not introduce those semantics silently.

An explicit `HUMAN DECISION — ...` marker is sufficient to record a bounded decision.
The marker is not mandatory: an explicit human instruction to record/apply a
specific decision is also sufficient. Conversational agreement alone is not.
The agent MUST NOT originate or expand a human decision, infer authorization
from approval, infer scientific classification from developer evidence, or infer
permission because the next step seems logically obvious.
If authority intent is ambiguous and the next action is gated, STOP and request
explicit human disposition.

## Documentation consequences and debt

Documentation maintenance is NOT solely a human memory obligation.
The agent MUST NOT rely on the human to remember documentation updates.
After implementation completion, review, human decision, execution,
classification or authority change, and before opening the next research stage,
assess documentation consequences.
If a consequence is within authorized scope, perform the permitted update.
If outside scope, report `DOCUMENTATION CONSEQUENCE DETECTED` with:

- Affected state
- Required documentation action
- Owning document/record
- Authority required
- Blocking next stage: YES/NO

Do not perform an unauthorized authority transition.
If actual code/research state is ahead of documentation, report
`DOCUMENTATION DEBT DETECTED` with actual state, documented state, required
reconciliation, presumed owner and blocking/non-blocking character.
Do not silently rewrite history.

## Permanent-document hygiene and completion

Permanent scientific/governance authority MUST NOT accumulate routine workspace
chatter without an evidence/provenance function. Do not add agent-environment
discovery chatter, local machine paths, routine git status/diff narration,
generic "no commit/push" reports or temporary workspace inventories unless
needed for identity, evidence, provenance or an explicit review contract.
Do not cosmetically rewrite frozen historical artifacts to make wording current.

Before completing documentation work, check whether a cold-start agent can
reconstruct the relevant state through:

`README → PROJECT_STATUS → active owning authority → decision/evidence/review records`

without chat history, agent memory or unstored human instructions.
If not, report the documentation integrity problem.
