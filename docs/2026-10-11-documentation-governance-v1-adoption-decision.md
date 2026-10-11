# Documentation Governance v1 Adoption Decision

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | EXACT_BYTE_FROZEN |
| Authority scope | Adoption, activation and freeze/pinning of Documentation Governance v1 |
| Parent authority | Explicit human decision supplied for Slice G2, recorded below |
| Current project state | [PROJECT_STATUS.md](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Decision

APPROVE and ACTIVATE Documentation Governance v1 as repository documentation
authority for NEW documentation work. Freeze and externally pin the reviewed
Governance v1 identity identified below.

## Scope

Repository documentation governance.

## Authority target

[docs/DOCUMENTATION_GOVERNANCE.md](DOCUMENTATION_GOVERNANCE.md).

## Reviewed identity

- Exact SHA-256 of the reviewed G1 artifact:
  `8bbcd46aeb55cb5272af46b2779c99373dcb5f7fc1c2297daa2cc66c3e6d4359`.
- Repository checkpoint at adoption:
  `cc0cd44bf2030e554a80b0f5a6f433f5e22c7b32`.
- The reviewed G1 artifact is an untracked working-tree addition at this
  checkpoint, not a file committed in that checkpoint. Its identity is the
  exact-byte SHA-256 above; the commit identifies repository context.

## Freeze/pinning consequence

The reviewed Governance v1 identity is APPROVED, ACTIVE and EXACT_BYTE_FROZEN.
Its reviewed bytes remain unchanged. The PROPOSED / INACTIVE / MUTABLE metadata
inside those bytes records the G1 proposal state; this decision establishes
the subsequent adoption state externally under Governance v1 §12. No second
Governance version or self-hash is created.

## Authorization consequence

Governance v1 becomes active for NEW documentation work. This does not grant
authorization for scientific, implementation, execution or qualification work.

## Explicitly NOT authorized

- Retroactive migration of existing documentation.
- Invalidation of pre-Governance documentation.
- Scientific work.
- Implementation work.
- Execution.
- Qualification.

## Date

2026-10-11.
