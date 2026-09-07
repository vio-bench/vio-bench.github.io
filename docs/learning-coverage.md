# Learning coverage and source policy

The learning section is a structured guide to original material. Its subject
coverage is informed by the project manuscript, *Visual-Inertial Odometry: A
Survey, Evaluation, and Benchmark*. It is not a replacement for the manuscript,
the linked courses, or system documentation.

## Current reading guides

`data/tutorials.json` contains eight guides with ordered readings, source
attribution, section locators, prerequisites, and related material:

1. Camera and IMU measurement models
2. Coordinate frames and pose conventions
3. Camera–IMU calibration and synchronization
4. VIO initialization
5. Filtering and optimization
6. Trajectory evaluation
7. Runtime and platform measurements
8. Working with your own sensor data

These guides do not establish complete coverage of VIO. The learning overview
also links original material for VIO formulation, visual geometry,
preintegration, observability, and the relationship between
odometry and SLAM.

The "Learning methods in VIO" reading row is intentionally empty at the user's
request. Retain the topic and leave its sources blank until the user asks to add
readings; do not fill this gap automatically.

## Areas for further source organization

The manuscript identifies several areas that need deeper reading sequences:

- Mathematical prerequisites: probability, linear algebra, and 3D geometry.
- Observability and consistency, including error coordinates and consistency
  evaluation.
- Inertial propagation and preintegration, including their model assumptions.
- Inertial-only odometry and its limitations.
- Visual front ends, feature representations, and state maintenance.
- Learning in visual–inertial estimation.
- Persistent mapping, loop closure, and visual–inertial SLAM.
- Application domains, deployment, and current research questions.

An additional paper link is an entry point, not a complete treatment of an area.
Add a dedicated guide only after its sources and reading locations are checked.
Original project teaching text must come from the project authors and retain
its attribution and technical conventions. Follow
[`technical-conventions.md`](technical-conventions.md) when editing.

Third-party recordings and notes stay at their original locations. Only describe
lectures as available when the source provides the material. Optional courses
are supplementary resources; they do not determine the site's learning sequence.
Benchmark claims remain governed by the published result snapshot and protocol.
