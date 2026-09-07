# VIOVERSE technical conventions

## Learning material

VIOVERSE's tutorials are original chapters written by the project authors,
intended to teach the knowledge needed to understand, implement, and evaluate
VIO. The chapter text is the main content. References support definitions,
assumptions, and technical claims; supplementary reading belongs at the end.
Do not replace the tutorials with a sequence of links to other people's work.

The user's instruction not to invent tutorials means the assistant must not
write teaching text, derivations, examples, or exercises on the authors' behalf
without being asked. It does not prohibit original teaching content by the
project authors. Structure and typeset the supplied manuscript, preserving its
meaning, notation, authorship, and provenance. A reference list appended to
generated prose does not establish that the authors supplied or reviewed it.

Store author-provided chapter sections in `data/tutorials.json`. Until chapter
text is supplied, leave `sections` empty and show the preparation notice.
Existing `readings` are supplementary references, not the chapter body or
evidence that a chapter has been written. Do not assign the paper's complete
author list to individual chapters without chapter-specific attribution.
Use the long project manuscript to inform subject coverage, and do not present
the current outline as a completed course.

Third-party course material is linked at its original location; the website
does not republish recordings or notes. RiSE is an optional Resources entry,
not a featured source, required prerequisite, or organizing framework.

## Primary references

Technical terminology and notation follow the original work of Guoquan Huang, Patrick
Geneva, Chuchu Chen, and Yulin Yang, together with the OpenVINS paper and official
derivations. The public bibliography is maintained in
`data/technical-references.json` and rendered at `/references/`. Cite the particular
paper or documentation section that supports a statement. An author's name or a
general project link alone is not evidence for a technical claim.

Use each system's original paper, documentation, and source for its implementation
details. Use dataset authors' documentation for sensor and reference conventions,
and the evaluated package version for evaluation behavior. The site's notation
does not imply that every external implementation uses the same convention.

## Notation and model

- Write `six-degree-of-freedom (6-DoF)` at first use. Pose has six degrees of
  freedom; the basic IMU error state has 15 coordinates. A nominal state storing a
  unit quaternion has 16 entries with the quaternion unit-norm constraint.
- Use global frame G, IMU frame I, and camera frame C. R_IG maps coordinates
  from G into I, and R_CI maps from I into C. Position p_GI is the IMU origin
  expressed in G. Define both direction and expressed-in frame before equations.
- When using the OpenVINS convention, identify JPL quaternion algebra,
  scalar-last storage, the global-to-IMU rotation, and the left multiplicative
  attitude error. `xyzw` alone is not a quaternion convention. File exports and
  message interfaces must be checked separately from internal state storage.
- Define the gravity sign. OpenVINS uses g_G = [0, 0, g]^T and subtracts it in
  global velocity propagation. Do not silently substitute the physical downward
  gravitational-acceleration vector in this equation.
- Identify ideal or calibrated measurement models and any omitted intrinsics,
  extrinsics, time offset, rolling shutter, or noise terms. Distinguish specific
  force, linear acceleration, bias, white-noise density, and bias random walk.
- State the camera/IMU time-offset equation, units, and sign. Declare the
  perturbation, residual sign, and state ordering whenever deriving Jacobians.

## Claims and conditions

- State motion, sensor, and calibration assumptions for observability claims.
  With informative motion, ordinary VIO without an absolute reference retains
  the four usual gauge freedoms: global translation and rotation about gravity.
  Degenerate motion or additional measurements change the analysis.
- MSCKF pose clones are retained correlated poses, not complete past IMU states.
  Distinguish temporarily triangulated MSCKF features from persistent SLAM states.
- Limit nullspace/Schur equivalence to the same whitened linearized problem with
  the stated rank and prior assumptions. This does not establish unconditional
  equivalence between nonlinear estimators or their implementations.
- FEJ concerns compatible Jacobian linearization and observability. It does not
  mean freezing the estimated trajectory. Distinguish marginalization priors
  from active nonlinear factors that can be relinearized.
- A covariance square-root filter and a square-root inverse/information filter
  factor different matrices. Preserve the specific formulation in the source.
- Use restrained academic language. Explain the measurements, variables,
  operation, assumptions, and consequence. Avoid slogans, invented technical
  labels, broad firstness claims, and unsupported accuracy or robustness claims.

## Evaluation and results

- Declare output type, sensor frame, pose convention, temporal association,
  fitting interval, alignment transformation, metric units, and aggregation.
- Distinguish pose RMSE, means across runs, pooled squared errors, and means
  across sequences. Pose counts, pose-pair counts, run counts, and sequence
  counts are different denominators.
- Keep evaluated extent, drift-valid path fraction, recording coverage, and
  successful-run fraction separate. Missing measurements are not zero errors.
- EPICA is introduced within Evaluation. Its fitting/selection procedure must
  be described separately from a prescribed conventional alignment baseline.
  Retain public-package versus documentation differences that affect results.
- Do not reinterpret historical VIOBench labels, change numerical results, or
  infer historical settings from current evaluator documentation. Trace such
  changes to the actual source records before publication.
- Distinguish native processing timers, output latency, throughput, CPU
  utilization, and memory measurement. State the platform and timing boundary.

## Maintenance

Supplementary references must identify their source and verified reading
location. Cite sources beside the authored explanation they support. Technical
equations must follow the supplied manuscript and its stated conventions;
successful math rendering does not validate a derivation.
When editing, check reference identity and locality, formula conventions,
cross-page consistency, and the source/version behind implementation claims.
The website does not imply review or endorsement by the cited authors.
