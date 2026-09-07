# Learning coverage and source policy

The learning section is an original tutorial series by the VIOVERSE authors.
Its subject coverage is informed by the project manuscript, *Visual-Inertial
Odometry: A Survey, Evaluation, and Benchmark*. Chapter text, rather than a list
of external readings, is the main content.

## Chapter outline and writing status

`data/tutorials.json` contains nine planned chapter outlines. Their `sections`
arrays are currently empty, awaiting author-provided text. Existing `readings`
are retained as collapsed supplementary references after the body:

1. Notation
2. Camera and IMU measurement models
3. Coordinate frames and pose conventions
4. Camera–IMU calibration and synchronization
5. VIO initialization
6. Filtering and optimization
7. Trajectory evaluation
8. Runtime and platform measurements
9. Working with your own sensor data

The outline does not establish that the chapters have been written or that VIO
is fully covered. The separate References page collects further reading on VIO
formulation, visual geometry, preintegration, and observability.

The "Learning methods in VIO" reading row is intentionally empty at the user's
request. Retain the topic and leave its sources blank until the user asks to add
readings; do not fill this gap automatically.

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
