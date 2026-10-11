# V1.1 — Release-Disposition Correction

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED under the explicit human correction and recording authorization below |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE; no freeze/pinning requested |
| Authority scope | Human-supplied V1.1 deployment fact, partial release-disposition supersession and bounded metadata/documentation correction; no scientific change |
| Parent authority | Human project-owner correction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) and its active [bounded amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) govern recording |
| Current project state | [PROJECT_STATUS.md](PROJECT_STATUS.md) |
| Supersedes | ONLY the incorrect release-disposition scope of [prospective acceptance](2026-10-11-interactive-c-production-acceptance-decision.md) |
| Superseded by | None |

## Decision authority

Human project owner confirming product deployment history and authorizing this
bounded correction. Recorded by: Agent.

## Decision

Record the owner-confirmed fact: Supercell Explorer V1.1, defined by interactive
prescribed storm-motion C for observed environments, was released/deployed to
public production on **2026-09-16**. The correction is issued/recorded on
**2026-10-11**. V1.1 is the latest published product release; V1 is the previous
published release. A V1 release date is not established here.

Partially supersede ONLY the earlier Decision's incorrect disposition that V1
was latest published, V1.1 remained prepared/unreleased, and its first release
required a future decision. Preserve the earlier prospective capability
acceptance on 2026-10-11 and every scientific exclusion. Preserve its normalized
decision and original instruction as historical provenance from incomplete
information; its new metadata pointer resolves the partial correction.
Later UI polishing does not negate the 2026-09-16 release.

## Scope and authority targets

- This correction record and the earlier Decision's partial-supersession pointer.
- [PROJECT_STATUS.md](PROJECT_STATUS.md): current product release disposition,
  distinct deployment/acceptance dates and unchanged scientific boundaries.
- [releaseHistory.ts](../src/app/releaseHistory.ts): V1.1 published and dated;
  no invented V1 date.
- [publicVersion.ts](../src/app/publicVersion.ts) and directly affected
  [What's new tests](../src/app/WhatsNewSurface.test.tsx): latest published
  semantics, metadata and date. Remove the unused candidate alias only after
  its consumers are switched.
- [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md): navigation pointer only;
  historical limitations and scope clarification remain intact.

## Reviewed identity and provenance

The corrected historical record was introduced in
`ff2ea95dedb93bacc341423cb415848223746182`, the repository checkpoint before
this correction. That commit remains real history; no history rewrite occurs.
The deployment fact comes from the human project owner, not from deployment
logs recovered by repository archaeology. An exact deployed SHA and historical
verification/approval evidence are **not established** by this correction.
The implementation introduction commit is not substituted for a deployed SHA.

## Authorization consequence

Apply only the bounded corrections above, run relevant release/version tests
and documentation integrity checks, and, if consistent and all required checks
pass, commit/push only correction files with an explicit allowlist and verify
origin/main. This records an already completed deployment; it performs none.

## Explicitly NOT authorized / NOT CLAIMED

- New deployment, root README rewrite, broad audit, governance changes or
  infrastructure, unrelated cleanup or history rewrite.
- Invented exact deployed SHA, historical verification or approval evidence.
- Observed Lagrangian C-response qualification; Phase P remains CLOSED · INVALID
  CONTROL / NUMERICAL CONVERGENCE, P2 remains NOT YET CERTIFIED, Main L1 remains
  NOT AUTHORIZED / NOT TESTED.
- Scientific evidence, frozen scientific artifacts, campaign classifications,
  hypotheses or scientific authorization changes; V1 scientific closure is not
  reopened.

## Date

Correction: 2026-10-11. Deployment fact: 2026-09-16.

## Source language

English (en); no translation required.

## Source instruction — original

```text
HUMAN DECISION — V1.1 RELEASE-DISPOSITION CORRECTION

I confirm the factual correction already supplied:

Supercell Explorer V1.1, defined by the interactive prescribed storm-motion C
capability for the observed environments, was released/deployed to public production
on 2026-09-16.

Authorize the bounded correction identified in the read-only assessment.

Required correction:

1. Create the minimum bounded correction Decision Record required by the active
   governance.

   It must:
   - record the human-supplied V1.1 deployment fact;
   - distinguish the 2026-09-16 deployment date from the 2026-10-11 correction date;
   - partially supersede ONLY the incorrect release-disposition scope of
     `docs/2026-10-11-interactive-c-production-acceptance-decision.md`;
   - preserve that earlier Decision and commit `ff2ea95...` as historical provenance
     of a decision made from incomplete information;
   - preserve the prospective production-capability acceptance from that Decision;
   - preserve all scientific exclusions.

2. Update `src/app/releaseHistory.ts` so that V1.1 is:
   - status: `published`
   - date: `2026-09-16`

   V1 remains the previous published release. Do not invent a V1 release date.

3. Reconcile `src/app/publicVersion.ts` with the corrected release semantics so the
   public version derives from `LATEST_PUBLISHED_RELEASE`.

4. Update the directly affected `WhatsNewSurface` tests to reflect the corrected
   published V1.1 metadata and date.

5. Reconcile only the necessary current-state passages in
   `docs/PROJECT_STATUS.md`:
   - V1.1 is the latest published product release;
   - public deployment occurred 2026-09-16;
   - prospective implementation acceptance occurred 2026-10-11;
   - scientific state remains unchanged.

6. In the earlier acceptance Decision, add only the minimum external correction /
   partial-supersession pointer permitted by governance.
   Preserve its historical normalized decision and verbatim source instruction.

7. `docs/KNOWN_LIMITATIONS.md` requires no substantive release-history rewrite.
   Change it only if a minimal pointer update is necessary to avoid a misleading
   current-state navigation path.

8. Remove `CURRENT_RELEASE_CANDIDATE` only if repository inspection confirms it has
   no remaining semantic need after consumers are switched. Do not perform unrelated
   cleanup.

Scientific firewall:

- Phase P remains CLOSED · INVALID CONTROL / NUMERICAL CONVERGENCE.
- P2 remains NOT YET CERTIFIED.
- Main L1 remains NOT AUTHORIZED / NOT TESTED.
- V1.1 publication does not qualify observed Lagrangian C-response.
- Do not modify scientific evidence, frozen scientific artifacts, campaign
  classifications, hypotheses or scientific authorization.

Scope firewall:

- No broad documentation audit.
- No governance changes or new governance infrastructure.
- No README rewrite in this step.
- No deployment action: this records the already completed 2026-09-16 deployment.
- Do not reconstruct or invent an exact deployed SHA or historical verification
  evidence that is not established.

Run the minimum relevant tests/checks required by the touched release/version surfaces
and documentation integrity rules.

If the bounded correction is internally consistent and all required checks pass,
commit and push ONLY the correction files using an explicit allowlist, preserving all
unrelated working-tree changes.
```

[Omitted: post-push reporting instructions and final-verdict labels; no additional authority.]
