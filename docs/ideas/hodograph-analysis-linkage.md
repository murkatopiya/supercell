# Idea: Link a recorded trajectory point and Analysis interval to the hodograph

Status: IDEA / DEFERRED

## Motivation

When a recorded trajectory point is selected, Supercell Explorer can show the local T1 diagnostic and the Analysis-derived environmental horizontal vorticity used in that calculation. The user can also inspect the environmental wind profile in the hodograph, but today these views are connected mostly through text.

A useful future interaction would make the provenance of the diagnostic visually traceable: selected recorded trajectory point → its altitude/time → the Analysis interval used for the environmental-wind derivative → horizontal vorticity → alignment with the prescribed-updraft horizontal gradient → T1.

## Possible interaction

With a recorded trajectory point selected and the hodograph open:

- mark the selected point's altitude on the hodograph;
- visually identify the Analysis interval/support associated with the derivative used for that point;
- optionally label the selected altitude and Analysis interval;
- make the relationship between the hodograph/profile and the environmental horizontal-vorticity factor in T1 easier to inspect.

The goal is not another decorative overlay. It is to let a user see where a diagnostic quantity comes from rather than only reading its numerical value.

## Scientific / semantic guardrails

Do not implement this as a simple highlight on the current hodograph until the representation semantics are explicit.

Before implementation, determine and document:

- which wind-profile representation the visible hodograph shows;
- which Analysis representation and derivative interval/support are actually used for the selected T1 calculation;
- whether highlighting an Analysis interval on the displayed hodograph could falsely imply that the derivative is computed directly from the displayed curve;
- the exact meaning and visualization of support states such as `FULL_SUPPORT` and `BOUNDARY_CONDITIONED`;
- behavior when Analysis is unavailable;
- coordinate/height semantics needed to link the recorded trajectory point to the profile correctly.

Do not imply that the highlighted interval is an observed parcel path, that T1 is the full tilting term of `V_total`, or that the diagnostic represents accumulated/generated tracer vorticity.

## Why deferred

This is potentially valuable research UX, but it introduces new cross-view behavior rather than merely clarifying existing copy. It should therefore be treated as a separate research/UX slice after the public-clarity/outreach preparation, with the representation semantics verified before any UI implementation.
