# Learning coverage and source policy

The learning section is a planned tutorial series. Chapter text, rather than
a list of external readings, will be the main content.

## Chapter outline and writing status

`data/tutorials.json` contains eight chapter outlines. Their `sections` arrays
retain requested and reviewed author text. Chapter 1 contains 1.1 VIO State
and Coordinate Frames, with the reviewed diagram, and 1.2 Coordinate
Transformations. The former standalone coordinate-frame chapter is merged
into Notation. Chapter 2 contains 2.1 Camera Images and Projection, with its
reproducible projection figure, and a single combined 2.2 IMU Measurements
section. The remaining chapters are in preparation. Reading recommendations
and implementation guides are temporarily withdrawn; do not replace them
until the user supplies or requests new material:

1. Notation
2. Camera and IMU measurement models
3. Camera–IMU calibration and synchronization
4. VIO initialization
5. Filtering and optimization
6. Trajectory evaluation
7. Runtime and platform measurements
8. Working with your own sensor data

The outline does not establish that VIO is fully covered. The References page
remains a preparation notice.

Preserve the current author-approved chapter order, with Notation first.
The homepage, contents, sidebar, numbering, and previous/next navigation use
this eight-chapter directory from the same source. Camera 2.1 refers back to
Notation 1.2; calibration and trajectory evaluation depend on Notation rather
than the removed chapter. On mobile, the chapter sidebar is a collapsed
directory so it does not displace the current chapter body.

Other chapter text and reading recommendations remain empty until the user
supplies or requests new material; do not fill these gaps automatically.

## Areas for further source organization

The manuscript identifies several areas that need further chapter planning:

- Mathematical prerequisites: probability, linear algebra, and 3D geometry.
- Observability and consistency, including error coordinates and consistency
  evaluation.
- Inertial propagation and preintegration, including their model assumptions.
- Inertial-only odometry and its limitations.
- Visual front ends, feature representations, and state maintenance.
- Learning in visual–inertial estimation.
- Persistent mapping, loop closure, and visual–inertial SLAM.
- Application domains, deployment, and current research questions.

An additional paper link does not constitute a tutorial. Publish chapter text
from the project authors' manuscript, preserving its attribution and technical
conventions. Explanations, derivations, figures, and examples belong in the body;
citations support the relevant text and supplementary reading follows it. Follow
[`technical-conventions.md`](technical-conventions.md) when editing.

Third-party recordings and notes stay at their original locations. Only describe
lectures as available when the source provides the material. Optional courses
are supplementary resources; they do not determine the site's learning sequence.
Benchmark claims remain governed by the published result snapshot and protocol.
