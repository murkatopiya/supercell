# Accessible Science — UX Roadmap

> Document type: NOTES / BACKLOG
> Authority: NONE
> State: PROPOSED — discussion draft
> Scope: Visitor comprehension, onboarding, presentation, and interaction clarity only
> Current project state: [PROJECT_STATUS](../PROJECT_STATUS.md)
> This document does not approve, authorize, or modify scientific work or implementation.

## Purpose

Make Supercell Explorer understandable and inviting to a curious visitor with no meteorology background, without reducing the scientific fidelity or changing the existing model. Preserve a clear route from a first visual observation to the full technical laboratory.

## Motivation / external feedback

Independent non-meteorologist feedback converges on: unclear immediate purpose, excessive landing-page text, difficulty connecting tracers to physical meaning, discoverability of controls, and requests for a short visual introduction. These are qualitative observations, not a completed usability study. Keep individual feedback and provenance separately if incorporated as evidence.

## Non-negotiable boundaries

- No changes to governing scientific specifications, model semantics, equations, numerical methods, integration, interpolation, data, diagnostics, or scientific qualification state as part of this roadmap.
- Do not manipulate tracer trajectories, diagnostics, results, or displayed physical quantities to produce a more compelling demonstration.
- Guided experiments may choose existing supported inputs and presets, but must use the same production computation and must disclose what is prescribed.
- Maintain the distinction between sounding-derived environmental wind, prescribed storm-local flow, and prescribed storm motion C.
- Passive tracers are not fully thermodynamic air parcels. T1 is a reduced diagnostic, not a force driving trajectories or a complete vorticity-evolution model.
- No claim of a dynamically evolving storm, historical storm reconstruction, forecast, thermodynamics, buoyancy, moisture, microphysics, or pressure/continuity solver.
- Preserve Source vs Analysis distinctions and all existing uncertainty, limitations, and scope boundaries.
- Never present imagery, schematic arrows, or pedagogical animations as if they were measured or computed model output unless that relationship is explicitly established.
- UX acceptance and developer regression tests do not imply scientific certification. P2 qualification and Main L1 authorization remain governed by their own authorities.

## Principles

1. **Phenomenon → question → experiment → explanation → technical depth.**
2. Prefer progressive disclosure to additional landing-page sections.
3. One computation and scientific model; multiple levels of explanation, not separate physics engines.
4. Separate observation, interpretation, assumption, and model limitation.
5. Every beginner-facing claim must map to an existing supported capability and authoritative source.
6. Preserve access to detailed scientific documentation, provenance, and attribution.

## Proposed slices (planning only; none authorized for implementation)

### A0 — Scope and comprehension contract
- Audit active UI/scientific authorities, current UI, existing help, and technical dependencies.
- Inventory supported interactions and candidate beginner-facing claims.
- Build a traceability table: claim → source of truth → allowed UI phrasing → known limitation.
- Define baseline tasks and acceptance rubric without inventing new scientific criteria.
- Gate: human review of proposed UX boundaries and claims; separate implementation authorization required.

### A1 — Landing and first impression
- Replace the dense first-screen technical description with a short question, plain-language explanation, and one clear path into the laboratory.
- Move detailed methods, roadmap, and citations to discoverable secondary pages/sections; keep concise model-boundary disclosure on the landing.
- Avoid introducing extra content blocks merely to explain existing blocks.
- Treat storm photography as contextual imagery, not a visualization of the application's data. Verify image identity and licensing before use.
- Gate: first-time visitors can describe the purpose and major limitation in their own words; scientific content review and separate implementation authorization required.

### A2 — First experiment / guided discovery
- Draft a short optional path through an already supported scenario and tracer interaction.
- Ask a concrete question before running the experiment; show what was observed afterward without overclaiming causes.
- Define expected UI actions and fallback behavior from verified current capabilities, not hypothetical physics.
- Offer an obvious exit to the unrestricted laboratory.
- Gate: repeatable supported experiment, no altered computation, no scientifically unsupported explanation.

### A3 — Interaction clarity
- Audit tracer placement, coordinate feedback, controls, state transitions, and error/empty states.
- Improve discoverability and wording without silently changing numerical inputs or experiment semantics.
- Pay particular attention to Apply/C lifecycle and Demo restrictions.
- Gate: task completion with existing physics behavior preserved.

### A4 — Layered scientific explanation
- Provide three levels: intuitive description; physical definition and caveats; formulas, provenance, and full documentation.
- Create a terminology/claims review for hodograph, C, updraft, tracer, horizontal vorticity, tilting, and T1.
- Keep Source/Analysis separation visible wherever diagnostics are interpreted.
- Gate: each explanation reviewed against the owning scientific authority.

### A5 — External validation and regression
- Re-test with several visitors who have no meteorology background and, separately, scientifically knowledgeable reviewers.
- Observe whether users can state the purpose, launch and interpret a basic experiment, and recognize prescribed vs observed elements.
- Run existing developer checks and numerical regression checks relevant to modified code; compare outputs using established contracts rather than inventing new tolerances.
- Record qualitative findings, remaining misunderstandings, and limitations. Do not label UX success as scientific qualification.

## Deferred / separate research

- Realistic cloud overlays, inferred storm morphology, physically mapped animations, new teaching simulations, new physical diagnostics, and thermodynamics require separate scoping and scientific review. None are implied or authorized here.
- Photography and attribution selection is an asset/licensing task, not a scientific-model change.

## Proposed working protocol

For each slice: inspect current repository and owning authorities → propose bounded design → independent critique (including a second reviewer when useful) → human decision → separately authorized implementation → code/scientific-language review → developer checks → documentation consequence assessment. A slice cannot self-authorize its successor.

## Open questions

- Which single beginner experiment is most reliably supported by the current UI and data?
- Which limitations must be visible immediately versus linked from the landing?
- What specific tracer-placement behavior confused testers, and can it be reproduced?
- Which existing documentation owns UI copy, navigation, and product release claims?
- What are suitable accessibility and small-screen constraints?
- What evidence will distinguish comprehension gains from merely increased engagement?

## Non-authority notice

This roadmap is a discussion backlog. It grants no implementation, execution, scientific qualification, release, governance transition, or change to existing active authorities. Human decisions and applicable Decision Records govern later actions.
