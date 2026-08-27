# Supercell Explorer

> **Perceive the invisible atmosphere.**

## 1. Vision

Supercell Explorer is an interactive 3D scientific experience designed to make
the invisible dynamics of a supercell thunderstorm perceivable.

The goal is not merely to show what a supercell looks like.

The goal is to let a person explore what is happening inside it.

A supercell is normally perceived through its visible manifestations:
clouds, precipitation, lightning, and sometimes a tornado. However, the
physical structure that creates those manifestations — airflow, vertical
motion, rotation, thermodynamic differences, and interactions between
different air masses — is largely invisible to human senses.

Supercell Explorer gives those processes a visual, spatial, and eventually
auditory representation.

The user should be able to move through the storm, stop time, change scale,
hide the visible cloud, reveal individual physical layers, follow air parcels,
and observe the storm from perspectives that are impossible in reality.

The project treats the atmosphere not as scenery, but as a dynamic system
that can be explored.

---

## 2. Core Idea

The central principle of Supercell Explorer is:

> **Do not merely visualize the storm. Visualize the processes that make it a storm.**

A traditional storm visualization often begins with the visible cloud.

Supercell Explorer begins with the atmosphere.

Air moves.

Air rises and descends.

Flows converge and diverge.

Vorticity exists, changes orientation, and becomes organized.

Temperature and moisture vary throughout the system.

Hydrometeors form and move.

The visible cloud is only one representation of this underlying state.

Therefore, the project should make it possible to progressively move between:

**visible storm → transparent storm → physical structure**

and back again.

---

## 3. The Storm as an Explorable Object

The supercell should behave as a spatial object that the user can investigate
from arbitrary positions and scales.

The user may:

- observe the entire storm from tens of kilometers away;
- approach the storm near the surface;
- move underneath the storm base;
- enter the inflow region;
- move through the updraft;
- inspect the mesocyclone;
- observe downdrafts and outflow;
- move to upper levels of the storm;
- view the system from above;
- freeze the simulation and move freely through it;
- change the visibility of individual atmospheric layers;
- follow selected air parcels through the flow.

Distance and scale are important parts of the experience.

The storm must not feel like an abstract object floating in a 3D editor.
The user should retain an intuitive sense that the system spans kilometers
vertically and tens of kilometers horizontally.

---

## 4. Artificial Senses

Human senses cannot directly perceive most atmospheric fields.

Supercell Explorer therefore creates artificial ways to perceive them.

Different physical quantities should use representations appropriate to their
meaning rather than simply being assigned arbitrary colors.

Possible perceptual layers include:

### Airflow

Moving tracer particles, trajectories, streamlines, ribbons, or other
directional representations show where air is moving and how fast.

### Vertical Motion

Updrafts and downdrafts can be isolated to reveal the vertical structure of
the storm.

### Vorticity

Rotation should be represented in a way that makes its orientation, magnitude,
scale, and spatial organization understandable.

### Temperature

Temperature or temperature perturbation can be represented as a volumetric
field together with a numerical scale and local probes.

### Moisture

Moisture can be displayed as a volumetric atmospheric layer and combined with
airflow to show how moisture is transported into the storm.

### Precipitation

Rain, hail, ice, and other hydrometeors can eventually form their own physical
layer.

### Cloud

The cloud is a layer, not the entire storm.

Its opacity can be reduced or disabled so that the invisible dynamics beneath
it become visible.

### Sound

Sound may eventually provide another artificial sense.

Physical ambience may represent an approximate audible storm environment,
while data sonification may translate normally inaudible atmospheric
quantities into safe audible representations.

The purpose is not simply:

> **See the invisible atmosphere.**

It is:

> **Perceive the invisible atmosphere.**

---

## 5. Layer Composition

Physical layers should be independently controllable whenever scientifically
and visually meaningful.

Examples:

- Cloud
- Airflow
- Vertical velocity
- Vorticity
- Temperature
- Moisture
- Precipitation

Layers may be combined.

For example:

- Cloud + airflow
- Airflow + vorticity
- Airflow + temperature perturbation
- Moisture + airflow
- Transparent cloud + internal flow

This allows the user to investigate relationships between processes rather
than viewing isolated diagrams.

---

## 6. Time

Time is an explorable dimension of the model.

The user should eventually be able to:

- play the simulation;
- pause it;
- slow it down;
- accelerate it;
- move between available timesteps;
- freeze the atmospheric state while continuing to move the camera.

Freezing time is conceptually important.

A frozen storm can be inspected as a three-dimensional physical structure:
particles remain suspended, fields remain visible, and the user may move
through the system without losing the current state.

---

## 7. Following the Air

One of the central interactions is the ability to follow the atmosphere itself.

A user may select or release tracer particles into the flow and observe their
motion.

A **Follow** mode can attach the camera to a selected tracer or conceptual air
parcel.

Instead of watching airflow from outside, the user travels with it.

This provides a Lagrangian perspective complementary to the normal Eulerian
view of atmospheric fields.

The journey of an air parcel may eventually expose local values such as:

- altitude;
- air velocity;
- vertical velocity;
- temperature;
- pressure;
- relative humidity;
- vorticity.

The purpose is to turn abstract atmospheric quantities into a spatial journey.

---

## 8. Exploration and Guided Experience

Supercell Explorer is envisioned as having two complementary modes.

### Explore Mode

The user controls the investigation.

They may move the camera, manipulate time, enable or disable layers, release
tracers, inspect values, create streamlines, and explore relationships between
fields.

This mode behaves like an intuitive atmospheric laboratory.

### Journey Mode

The system guides the user through a carefully designed sequence.

The interface becomes minimal.

Camera movement, narration, physical layers, scale, time, and eventually sound
can be coordinated to create an educational and immersive journey through the
storm.

A Journey may, for example:

1. approach the storm through the inflow;
2. enter the updraft;
3. observe rotation;
4. move through different altitude levels;
5. return toward the lower storm;
6. freeze time;
7. remove the visible cloud;
8. progressively reveal velocity, moisture, temperature, and vorticity;
9. finally reveal the storm as a complete dynamic system.

Journey Mode is not intended to replace scientific exploration.

It provides an intuitive first encounter with the system that can motivate
deeper investigation in Explore Mode.

---

## 9. Scientific Integrity

Scientific integrity is a fundamental requirement of the project.

Visual beauty must never silently override physical meaning.

Every physical representation should clearly belong to one of the following
categories:

### Physically simulated

Derived from numerical atmospheric simulation data: complete or
native output of a forward model, not an inverse estimate of that
model.

### Conceptual / synthetic

Created mathematically to demonstrate a physical mechanism while intentionally
simplifying the real atmosphere.

### Observed or inferred

Derived from observations, analyses, reanalyses, or retrieval /
inference methods rather than from a prescribed formula or from
complete forward-model output.

Observed quantities and inferred quantities must remain
distinguishable whenever the source makes that distinction
available.

A retrieved or analyzed field must not be labeled “physically
simulated” merely because values exist on a grid.

### Visual encoding

A perceptual representation of a physical quantity that is not itself directly
visible, such as particles representing airflow or sound representing
vorticity.

These categories must never be confused.

A synthetic conceptual model must be identified as such.

A visualization must never imply greater physical accuracy,
completeness, or certainty than its underlying data and method
support.

Long-term source classes, reconstruction ownership, and the
boundary between consuming a field and inferring one are defined
in `docs/architecture/44-long-term-source-and-reconstruction-boundary.md`.

---

## 10. Development as Investigation

Supercell Explorer is not only a software project.

Its development process is also intended to become a structured investigation
of supercell dynamics.

The storm should be constructed progressively.

Individual mechanisms are studied, described, implemented, visualized, tested,
and understood before they are combined into more complex behavior.

The intended development loop is:

**understand → describe → model → implement → visualize → test → explain**

Each physical mechanism should be independently inspectable whenever possible.

The project should prefer a simple mechanism that is understood and validated
over a complex result that merely looks convincing.

A feature is not considered complete only because the visualization works.

Its physical meaning and limitations must also be understood.

---

## 11. Progressive Physical Model

The first versions of Supercell Explorer do not need to reproduce a complete
supercell.

Development begins with simple, controlled vector fields and tracer particles.

Individual atmospheric mechanisms are added progressively and validated in
isolation before they are combined.

Explorer is a consumer of atmospheric velocity and related state.

Later sources may include data-driven environmental profiles,
observed-storm context, numerical atmospheric-model output, and —
if independently produced — externally supplied estimated or
reconstructed fields. Those are engineering / integration stages
for Explorer.

They are not the same work as reconstructing a storm-scale 3D
wind field `V(x,y,z)` from incomplete observations. That
reconstruction is an inverse / retrieval research problem, not
the next visualization milestone, and Explorer does not own it.

The rendering and interaction systems should therefore remain
conceptually independent from the source of the atmospheric data.

A tracer asks only:

> **What is the atmospheric velocity at this position and time?**

It does not ask how that velocity was prescribed, simulated,
observed, or inferred. Honesty about origin belongs to source
identity, provenance, and — when the source is inferred — to a
future uncertainty / quality capability. It does not belong
inside the tracer.

This separation lets Explorer consume a more realistic source
without rebuilding the visualization system. It does not promise
that a trustworthy full-field reconstruction of a real storm
will exist.

See `docs/architecture/44-long-term-source-and-reconstruction-boundary.md`.

---

## 12. What Supercell Explorer Is Not

Supercell Explorer is not intended to be:

- a weather forecasting system;
- an operational meteorological tool;
- a replacement for professional scientific visualization software;
- a complete numerical atmospheric solver;
- a storm-scale wind retrieval, dual-Doppler synthesis, or
  variational data-assimilation system;
- a reconstruction engine whose job is to infer complete 3D `V`
  from incomplete observations;
- a tornado game;
- a storm-chasing simulator;
- a photorealistic graphics demo;
- a collection of decorative particle effects;
- a visualization that sacrifices physical meaning for spectacle.

Photorealism is explicitly not a primary objective.

A simplified visualization that clearly communicates atmospheric dynamics is
more valuable than a beautiful visualization that hides or misrepresents them.

---

## 13. Design Principles

### Physics before spectacle

Visual behavior should originate from a defined physical or conceptual model.

### Understanding before complexity

Do not add a new atmospheric mechanism until the current mechanism can be
explained and validated.

### One mechanism at a time

Complex storm behavior should emerge from independently understandable parts.

### Rendering does not define physics

Rendering visualizes simulation state. It must not secretly alter or invent
physical behavior.

### Scale matters

The visualization must preserve an intuitive understanding of the enormous
physical dimensions involved.

### Invisible does not mean abstract

Atmospheric quantities that cannot normally be seen should be given intuitive
spatial representations.

### Uncertainty and simplification must be visible

Conceptual models and approximations should be explicitly identified.

For inferred, analyzed, or reconstructed data, uncertainty,
quality, and provenance should be representable as a first-class
capability. That capability is not a scalar `confidence` bolted
onto current `VelocityField.sample()`, and its shape is not
chosen in V1.

### Interaction should create understanding

Controls exist because they help the user investigate the system, not merely
because they are technically possible.

### The user should be able to ask "why?"

Whenever possible, the visualization should help connect visible behavior to
the physical mechanism responsible for it.

In the prescribed laboratory that means: explain every motion
from inspectable field contributions.

For inferred or reconstructed state the long-term extension is:
explain every inference — provenance, observed versus inferred
distinction, method identity, available uncertainty or quality
information, and limits of interpretation. This does not require
decomposing a reconstructed velocity into the current seven
prescribed laboratory operands.

If more than one environmental source is later available, their
disagreement may be shown as a sensitivity signal. It is not
automatically a complete uncertainty, and it is not a scalar
`confidence`.

Storm motion, when no longer a single prescribed constant, must
keep its method identity: a derived estimator and an observed
storm track can share a vector type without sharing meaning.

---

## 14. Long-Term Vision

The long-term goal is an explorable digital supercell whose visible and
invisible structures can be investigated as one coherent atmospheric system.

A mature version may combine:

- numerical supercell simulation datasets consumed as
  already-complete fields;
- data-driven environmental profiles;
- observed-storm context;
- three-dimensional atmospheric vector fields from a source
  that actually provides them;
- volumetric cloud and hydrometeor data;
- interactive tracer particles;
- streamlines and trajectories;
- vorticity visualization;
- thermodynamic fields;
- local atmospheric probes;
- multiple temporal resolutions;
- data sonification;
- guided scientific journeys;
- educational explanations;
- comparisons between different storm environments and structures.

A reconstructed storm-scale 3D wind field from incomplete
observations is not an ordinary item on that list. It is a
separate research-producer problem with substantially higher
scientific risk, unknown timeline, and no promise of success.
Explorer remains useful without it.

However, the project must grow toward this vision progressively.

The existence of the long-term vision must never justify implementing future
complexity prematurely.

The existence of that vision must never be read as a roadmap in
which reconstructed 3D storm is the next engineering stage after
the prescribed laboratory.

See `docs/architecture/44-long-term-source-and-reconstruction-boundary.md`.

---

## 15. Success

Supercell Explorer succeeds if a user can look at a supercell not only as a
cloud, but as a dynamic atmospheric system.

A successful experience should create moments such as:

> "Now I can see where the air is going."

> "Now I understand why that part is rising."

> "I can see the rotation."

> "I understand how these flows interact."

> "The cloud is only the visible part."

The ultimate goal is not simply to provide more information about a supercell.

It is to create a new way of perceiving one.