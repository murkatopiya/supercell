# Interactive C — Prospective Production Acceptance

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED under the explicit human acceptance and instruction to record it below |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE; no freeze/pinning requested |
| Authority scope | Prospective acceptance of the existing interactive prescribed C production capability and bounded documentation reconciliation; no release or scientific authorization |
| Parent authority | Explicit human decision reproduced below; record governed by active Documentation Governance v1 and its bounded amendment |
| Current project state | [PROJECT_STATUS.md](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Decision authority

Human repository decision-maker accepting the existing production capability and
setting its separate release disposition. Recorded by: Agent.

## Decision

Accept the existing interactive prescribed storm-motion C implementation as a
completed current production capability, prospectively on 2026-10-11. This is
not evidence of historical V1.1 approval, release authorization or publication
on 2026-09-16 or earlier. V1 remains the latest published release according to
repository release metadata; V1.1 remains the prepared release candidate.
Publication/release of V1.1 requires a separate future human decision.

## Scope and authority targets

The interactive C capability in Explore for the four observed environmental
profiles: finite component input, Apply/Restore, per-environment session
overrides, and new-experiment composition on Apply. C remains prescribed;
observed profiles and prescribed storm-local fields retain their meanings.

Documentation consequences are limited to this record,
[PROJECT_STATUS.md](PROJECT_STATUS.md) and
[KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md). Check
[releaseHistory.ts](../src/app/releaseHistory.ts) without changing its already
correct prepared/published distinction. Root README rewrite is a separate slice.

## Reviewed identity

The human reviewed reconstructed provenance and accepted the existing capability,
not a historical release. Repository implementation checkpoint at recording:
`130a32fd14fb540470a6082b383241add84d13e9`. The following production paths match
that checkpoint with no working-tree diff:

- [App.tsx](../src/app/App.tsx) — control wiring and new-experiment reset.
- [createExploreLab.ts](../src/app/createExploreLab.ts) — per-environment C and laboratory composition.
- [composeDemoTracerSimulation.ts](../src/app/composeDemoTracerSimulation.ts) — environmental operand C routing.
- [ExploreEnvironmentSelector.tsx](../src/ui/hodograph/ExploreEnvironmentSelector.tsx) — finite component editor and Apply/Restore.

Introduction provenance is `cb4bf903e3a147e94536bc3ca5deb8c0ba173445`
(2026-09-16). Its commit title is implementation provenance, not release
authority. This checkpoint reference identifies the accepted existing
implementation; it does not freeze/pin these files or certify scientific work.

## Authorization consequence

Perform the minimum documentation reconciliation described above and relevant
documentation/integrity checks. Historical validation/P2 unchanged-production
statements retain their slice scope. Acceptance does not supply a missing
historical developer-verification result or establish historical approval.

## Explicitly NOT authorized

- Publication/release of V1.1 or retroactive approval/authorization/publication.
- Observed Lagrangian C-response certification, changing Phase P from INVALID
  CONTROL, P2 certification or Main L1 authorization.
- Scientific evidence, historical campaign records, frozen artifacts,
  scientific claims or qualification-state changes.
- Root README rewrite, new governance infrastructure or production code changes.

## Date

2026-10-11.

## Source language

English (en). No translation required.

## Source instruction — original

```text
HUMAN DECISION

I have reviewed the reconstructed provenance of the existing interactive prescribed
storm-motion C implementation.

I explicitly ACCEPT the current interactive C implementation as a completed current
production capability of Supercell Explorer.

This is a prospective acceptance of the implementation that currently exists in the
repository. It MUST NOT be represented as evidence that V1.1 was historically approved,
authorized for release, or published on 16 September 2026 or at any earlier time.

Release disposition remains separate:

- V1 remains the latest published release according to repository release metadata.
- V1.1 remains the prepared release candidate.
- I am NOT authorizing publication/release of V1.1 in this decision.
- A future V1.1 release requires a separate human decision.

Scientific boundary:

Acceptance of the interactive C production capability does NOT certify the observed
Lagrangian C-response campaign, does NOT change Phase P from INVALID CONTROL, does NOT
certify P2, and does NOT authorize Main L1.

Proceed with a MINIMUM DOCUMENTATION RECONCILIATION for this decision and the stale
documentation identified in the V1.1 archaeology.

Scope:

1. Record this human decision in the minimum form required by the active repository
   documentation governance.

2. Reconcile `docs/PROJECT_STATUS.md` so that:
   - historical statements that validation/P2 slices left production/UI unchanged remain
     historically true in their proper scope;
   - current repository state acknowledges interactive C as an accepted production
     capability;
   - V1.1 remains a prepared candidate, not a published release;
   - no scientific qualification or authorization is implied.

3. Reconcile `docs/KNOWN_LIMITATIONS.md` minimally:
   - preserve its historical V1 meaning;
   - prevent stale fixed-profile/fixed-C statements from being read as current project
     capabilities;
   - preserve still-valid limitations such as prescribed C, non-estimator semantics,
     and Demo-specific constraints where applicable.
   Prefer scope clarification over rewriting historical facts.

4. Check whether `src/app/releaseHistory.ts` requires any change.
   Expected answer is NO if its current `prepared` / published distinction already
   represents the decision correctly. Do not change it merely for consistency theater.

5. Do NOT rewrite root `/README.md` yet.
   README rewrite is the next separate slice.

6. Do NOT modify scientific evidence, historical campaign records, frozen artifacts,
   P2 qualification state, Main L1 state, or scientific claims.

7. Do NOT introduce new governance infrastructure.
```

[Omitted: pre-edit/check/report instructions; no additional acceptance or release authority.]

```text
Commit/push only if repository rules and the established workflow authorize it;
otherwise stop with the prepared diff for human review.
```
