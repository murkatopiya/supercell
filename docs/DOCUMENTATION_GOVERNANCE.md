# Documentation Governance v1

## Status

| Field | Value |
| --- | --- |
| Document type | SPECIFICATION / CONTRACT |
| Approval state | PROPOSED |
| Authority status | INACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Repository documentation governance for future documentation work after adoption; no scientific requirements or action authorization |
| Parent authority | Human-designed Documentation Governance v1 model supplied for Slice G1; this proposed artifact records that model without asserting adoption |
| Current project state | [PROJECT_STATUS.md](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## 1. Purpose and cold-start invariant

Documentation is part of the research apparatus of Supercell Explorer.
Repository documentation must let a cold-start agent or external reviewer
recover active scientific/numerical authority, current project state, decision
provenance, the current gate, permitted and prohibited next actions, the
evidence basis, model-scope boundaries and inference boundaries without chat
history, agent memory or unstored human instructions.

> A cold-start agent or external reviewer MUST be able to reconstruct the current project state, active authorities, current gate and applicable prohibitions from the repository alone.

The canonical navigation route is:

`README → PROJECT_STATUS → active owning authority → decision/evidence/review records`

If interpreting permanent repository state requires conversation history,
documentation integrity is violated.

## 2. Fundamental principles

- **Authority is explicit.** Files, commits, implementations, tests and agent
  reports do not create authority merely by existing.
- **Current state has one owner.** `docs/PROJECT_STATUS.md` is the sole owner of
  mutable project-wide current state. Other documents may contain date-scoped
  historical state or point to PROJECT_STATUS; they must not independently
  maintain competing project-wide CURRENT state.
- **Conversation is not authority.** Permanent documentation must not depend
  on chat history, agent memory, bare `current instruction` wording or unstored
  human messages. Record the decision, not the dialogue that produced it.
- **Approval is not authorization.** Approval accepts an artifact;
  authorization permits an action. Approval does not imply authorization.
- **Closure is not verdict.** `CLOSED ≠ PASS`. Closure concerns a named
  process, gate, review or execution state. Scientific/numerical classification
  is a separate dimension.
- **Freeze is not certification.** `FROZEN ≠ CERTIFIED`. Freeze determines
  mutability/identity; certification determines qualification state.
- **Agents detect; humans authorize.** Agents must detect documentation
  consequences. Agents do not independently create human-governed authority
  transitions.

## 3. Document types

There are exactly seven semantic document types:

| Type | Function and boundary |
| --- | --- |
| SPECIFICATION / CONTRACT | May normatively define definitions, requirements, invariants, algorithms, acceptance criteria and forbidden interpretations. Does not grant action authorization. |
| DESIGN | Defines architecture or experimental design within parent authority and may constrain implementation. Cannot expand the parent's scientific scope. |
| EVIDENCE RECORD | Records what was executed/measured, execution identity, inputs/outputs, observed results and completeness/missing evidence. Does not change requirements retrospectively. |
| REVIEW RECORD | Records examination of an artifact/evidence against existing authority. May establish verification findings; does not itself create human approval, authorization or classification where these are human-governed. |
| DECISION RECORD | Records a bounded human decision: approval where a separate record is required, authorization, classification, supersession and pinned identity where applicable. |
| STATUS | Records current project state and navigation. PROJECT_STATUS is the sole project-wide CURRENT owner. Reports decisions, authorizations and classifications; must not invent them. |
| NOTES / BACKLOG | Non-authoritative ideas, questions, candidate hypotheses, future work and roadmap items. `Authority: NONE`. |

Terms such as readiness, capture, fixture and thermodynamics describe a subject,
not a document type.

## 4. Independent state dimensions

Document state must not be modeled as one overloaded scale such as
`CLOSED · APPROVED · FROZEN`. Use independent dimensions:

| Dimension | Values | Question |
| --- | --- | --- |
| Approval state | PROPOSED / APPROVED | Was this artifact accepted? |
| Freeze mode | MUTABLE / SEMANTICALLY_FROZEN / EXACT_BYTE_FROZEN | Can this artifact be changed? |
| Authority status | ACTIVE / SUPERSEDED / INACTIVE | Is this artifact currently authoritative in its declared scope? |
| Gate/execution state, where applicable | OPEN / CLOSED | Is the named gate/execution open or closed? |
| Scientific/numerical classification, where applicable | PASS / FAIL / INVALID CONTROL / NOT CERTIFIED / CERTIFIED | What classification is established? |

New authority-bearing documents default to PROPOSED unless explicit prior
human authority establishes otherwise. Freeze and supersession are independent.
Do not infer one dimension from another.

## 5. Status block

Every NEW authority-bearing scientific/technical document MUST begin with one
Status block. It must have only one lifecycle/status banner, with these fields:

- Document type
- Approval state
- Authority status
- Freeze mode
- Authority scope
- Parent authority
- Current project state
- Supersedes
- Superseded by

Current project state must point to `docs/PROJECT_STATUS.md`. Additional
type-specific metadata is allowed only when needed. Do not repeat the lifecycle
banner in the middle or at the end of the document.

## 6. Scientific scope firewalls

Every new authority document introducing or extending scientific/model
semantics MUST explicitly include `INTRODUCED` and `NOT INTRODUCED`.
`NOT INTRODUCED` is a scope firewall: downstream DESIGN or implementation
cannot silently add those physics/model semantics.

If child work requires a concept outside parent scientific scope, report
`SPECIFICATION CHANGE REQUIRED`. Child authority may refine implementation of
parent authority but cannot expand its scientific scope.

EVIDENCE / REVIEW / qualification records SHOULD use `NOT CLAIMED` where there
is a material risk of over-interpretation. `NOT INTRODUCED` protects model scope;
`NOT CLAIMED` protects inference scope.

## 7. Human decisions

An explicit decision marker is sufficient for a formal human decision, for
example:

`HUMAN DECISION — approve T1 specification only. No implementation authorization.`

A marker is not mandatory. An explicit human instruction to record/apply a
decision also constitutes a decision, for example:

- `Approve this specification and record the approval.`
- `Authorize implementation T1 and record the decision.`

Conversational agreement alone does not create authority. Statements such as
`I like this.`, `Looks correct.`, `We can probably continue.`,
`I would call this PASS.` and `Let's move on.` must not automatically become
repository authority.

If authority intent is ambiguous, the agent MUST NOT infer authority. Existing
authority state is preserved. The agent reports the decision apparently needed
and, if the next action is gated, requests explicit human disposition.
The agent MUST NOT expand the scope of even an unambiguous human decision.

## 8. Decision Records

A separate DECISION RECORD is REQUIRED if a decision:

1. Permits or prohibits a transition/action.
2. Has cross-document scope.
3. Must pin an immutable identity/hash/version that the target artifact cannot
   correctly self-record.

Otherwise, artifact approval may be stored in the owning artifact's Status
metadata. The minimum semantic structure of a Decision Record is:

- Decision
- Scope
- Authority target(s)
- Reviewed identity
- Authorization consequence
- Explicitly NOT authorized
- Date

A Decision Record must be bounded. It records the decision, not a conversation
transcript.

## 9. Human-governed authority transitions

The five transition classes are:

1. Human approval.
2. Human authorization.
3. Freeze / pinning.
4. Human classification when the protocol requires human disposition.
5. Supersession.

An agent does not independently create a human-governed transition. File
creation, a commit, implementation completion, test PASS or an agent report
does not itself create any of these transitions.

## 10. Canonical research workflow

```text
NOTES / QUESTION
→ SPECIFICATION — PROPOSED
→ human approval
→ SPECIFICATION — APPROVED
→ DESIGN — PROPOSED
→ human approval
→ DESIGN — APPROVED
→ explicit authorization
→ IMPLEMENTATION
→ REVIEW RECORD
→ explicit authorization where required
→ EXECUTION
→ EVIDENCE RECORD
→ REVIEW / CLASSIFICATION
→ human decision where required
→ DECISION RECORD
→ PROJECT_STATUS
```

Not every slice must contain every node. Omitting a node does not permit mixing
the semantic functions of adjacent nodes. Implementation and execution are
actions, not document types.

## 11. Developer verification vs scientific qualification

Developer verification and scientific qualification are distinct evidence
classes. Unit-test PASS, typecheck PASS and regression-suite PASS do not mean
scientific qualification PASS or certification. Review records must explicitly
identify the class of verification performed.

## 12. Frozen artifacts

For SEMANTICALLY_FROZEN artifacts, incidental cleanup does not change the
normative body. Any allowed mutable metadata must be explicitly defined.

For EXACT_BYTE_FROZEN artifacts, no byte of the artifact changes. New approval
information, supersession information, current-state pointers and corrections
live in an external Decision Record, STATUS or successor/amendment authority.

A substantive correction to frozen authority requires a successor/amendment,
not rewriting history. Historical tense/draft wording within a frozen artifact
is allowed and is read in that artifact's temporal context.

## 13. Milestones

> A milestone is a closed, evidence-backed transition that changes what the project is permitted to claim or execute.

Document creation, document approval, implementation completion, a commit or
developer-test PASS is not necessarily a milestone by itself. A Documentation
Integrity Check is required after every milestone.

## 14. Documentation consequence detection

This is an agent duty and a protection against human-factor forgetting.
The agent MUST assess documentation consequences:

- After implementation completion.
- After review.
- After a human decision.
- After execution.
- After classification.
- After a change of active authority.
- Before opening the next research stage.

If a detected consequence is within authorized scope, the agent may perform
the permitted documentation update. If it is outside authorized scope, the
agent MUST report it and recommend a bounded documentation action, without
performing it unilaterally.

Use the semantic warning `DOCUMENTATION CONSEQUENCE DETECTED` with fields:

- Affected state
- Required documentation action
- Owning document/record
- Authority required
- Blocking next stage: YES/NO

## 15. Documentation debt detection

If actual code/research state has moved ahead of documentation, the agent MUST
report `DOCUMENTATION DEBT DETECTED` and identify:

- Actual state
- Documented state
- Required reconciliation
- Presumed owner
- Blocking/non-blocking character

The agent must not silently rewrite history retrospectively.

## 16. Documentation Integrity Check

After a milestone, check at least:

1. PROJECT_STATUS reflects the applicable state.
2. Active authorities are unambiguous.
3. New frozen/pinned identity is represented correctly.
4. Old CURRENT/NEXT/AWAITING/NOT STARTED/STOP claims do not look current after
   closure.
5. Navigation pointers are current.
6. Human decisions have repository representation.
7. There are no competing authority claims.
8. Routine execution bookkeeping has not entered permanent scientific authority
   without an evidence/provenance function.
9. Developer verification is not presented as scientific qualification.
10. NOT INTRODUCED / NOT CLAIMED boundaries are preserved.
11. The README → PROJECT_STATUS → owning authority route remains correct.
12. Recovering current state does not require chat history, agent memory or
    unstored human instructions.

An Integrity Check may identify a defect and propose bounded remediation.
It does not itself authorize modification of frozen authority.

## 17. Agent prohibitions

Agents MUST NOT:

- Originate human approval.
- Originate authorization.
- Expand human decision scope.
- Infer authorization from approval.
- Infer PASS from CLOSED.
- Infer certification from freeze.
- Infer scientific qualification from developer tests.
- Modify an EXACT_BYTE_FROZEN artifact.
- Enlarge scientific scope in child design/implementation.
- Present historical handoff as current state.
- Depend on chat/memory as unstored permanent authority.
- Add routine workspace/git/agent bookkeeping to scientific authority without
  an evidence/provenance function.

## 18. Agent recommendation duty

> Documentation discipline is not solely a human memory obligation.

If an agent notices that a human decision, implementation, execution,
classification or stage transition creates a documentation consequence, it
MUST surface that consequence even if the human did not ask about documentation.
This is a recommendation/detection duty.

> Recommendation is not authorization.

The agent reminds and recommends. Human-controlled authority transitions remain
human-controlled.

## 19. Scope of Governance v1

Governance v1 applies to NEW documentation work after adoption. It does not
automatically migrate existing documents. Existing frozen/hash-bound artifacts
retain their existing authority identity.

Existing documentation may be migrated only through separate bounded reviewed
slices. Existing documents must not be declared invalid merely because they
predate Governance v1.
