# Documentation Index

**Role:** entry map for `docs/**`. Where to start reading, what each
directory is authoritative for, and how to resolve a conflict between
two documents.

**Not:** a source of truth for physics, architecture, or product
scope. This file does not restate physical definitions, does not
record decisions, and does not authorize implementation. When this
index disagrees with an owning document, the owning document wins.

> **Returning to the project after a break?** Start with
> [`PROJECT_STATUS.md`](PROJECT_STATUS.md). It records the current phase,
> the active step, the next action, and the shortest reading path back
> into the authoritative documents. It is a status/navigation bookmark,
> not a source of truth or implementation authorization.

---

## 1. Start here

| Question | Read |
| --- | --- |
| I am returning after a break. Where is the project now and what is next? | `PROJECT_STATUS.md` |
| What is this product, and what does it refuse to claim? | `../README.md`, then `KNOWN_LIMITATIONS.md` |
| What are the layers and the consumer boundary? | `ARCHITECTURE.md` |
| What are the coordinates, units, and signs? | `physics/00-coordinate-system.md` |
| What did V1 actually promise and close? | `architecture/38-v1-scope-checkpoint.md`, then `reviews/2026-08-27-v1-closed.md` |
| What model class is this, and what is it not? | `architecture/30-model-class-decision.md` |
| What is deferred or unresolved? | `PROJECT_BACKLOG.md` |
| What is the long-term vision? | `CONCEPT.md` (vision, not shipped scope) |

The single architectural principle behind the layering is stated in
`ARCHITECTURE.md` §1: physics defines the atmospheric state,
rendering observes it.

---

## 2. Directory map and authority

| Directory | Authoritative for | Not authoritative for |
| --- | --- | --- |
| `physics/` | Physical definitions, units, coordinate frames, signs, equations, domain/boundary policy, diagnostic identity | Runtime ownership, wiring, presentation, DEMO numbers |
| `architecture/` | Layer ownership, feature architecture, contracts, slice boundaries, scope checkpoints | Physical definitions |
| `rendering/` | Rendering contracts, DEMO occupancy and wiring, view fixtures | Physical formulas |
| `ui/` | UX structure, surfaces, control states, visual foundation | Physics, runtime contracts |
| `research/` | Dated evidence, data audits, measured validation | Implementation authorization |
| `reviews/` | Dated review records, preserved findings | Anything — reviews are explicitly not SoT |
| `ideas/` | Unadopted sketches | Anything adopted |

Numbered documents inside a directory are independent sequences.
`physics/NN` and `architecture/NN` with the same `NN` are unrelated
documents; cite the directory, never a bare `§NN`.

---

## 3. Per-document status

Status is declared by each document, not by this index. Most
documents open with a `**Status:**` block that records what is
implemented, what is historical, what is superseded, and which
document succeeds it. A document may be complete, historical, or
superseded as a plan while remaining the owner of a formula or a
fixture; the `**Status:**` block is the place that distinguishes
those cases.

Consequences worth knowing before reading:

- Historical documents are often written in the present tense about a
  stack that has since changed. The `**Status:**` block, not the body,
  states whether the body is live.
- A document that owns a formula does not necessarily own the DEMO
  numbers that instantiate it. Physics documents state this
  explicitly and point at the owning `rendering/` document.
- Anti-claims are load-bearing. A physics document listing
  `NOT INTRODUCED` items is stating the boundary of the model, not a
  todo list.

---

## 4. Resolving conflicts

1. Physical meaning, units, signs, frames: `physics/**` wins.
2. Ownership, wiring, sampling, slice boundaries: the owning
   `architecture/**` document wins.
3. DEMO occupancy and view constants: the owning `rendering/**`
   document wins.
4. Evidence: `research/**` records measurements; it does not decide.
5. `reviews/**` records outside findings; it decides nothing.
6. `CONCEPT.md` is vision and never establishes shipped scope.
7. `PROJECT_BACKLOG.md` is memory and never authorizes work.
8. `PROJECT_STATUS.md` is the current return-point/navigation bookmark; it never overrides an owning document or authorizes work.

If code, an owning document, and this index disagree in a way the
rules above do not settle, the disagreement is a defect in the
documents and is resolved by correcting them, not by inferring intent
from the code.

---

## 5. Documentation hazards currently present

- `ARCHITECTURE.md` §30 previously listed an aspirational file tree
  (`PHYSICS.md`, `ROADMAP.md`, `decisions/`, `validation/`,
  `physics/06-tilting.md`, `physics/07-stretching.md`). Those files
  are not part of the layout and are not planned. Several documents
  still spend paragraphs contradicting that earlier plan.
- Validation status is stated in more than one place
  (`KNOWN_LIMITATIONS.md`, `reviews/2026-08-27-v1-closed.md`,
  `architecture/46`, `architecture/47`). The closure record in
  `reviews/2026-08-27-v1-closed.md` is the one that records what is
  and is not claimed.
- Test and file counts quoted inside dated records are accurate as of
  that date only.
