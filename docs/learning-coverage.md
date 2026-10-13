# Tutorial publication scope

`data/tutorials.json` retains the eight-chapter directory. Chapters 1–4
contain 13 sections. Chapters 5–8 retain their titles and routes, but have
no chapter text, readings or related links and display “To be added.”
The withdrawn drafts are preserved locally outside the published source.
Do not restore them without an author request.

## Published chapters

1. Notation — VIO state, frames and coordinate transformations (2 sections).
2. Camera and IMU measurement models — projection and inertial readings (2).
3. Camera–IMU calibration and synchronization — intrinsics, IMU calibration,
   extrinsics, temporal offset and exposure timing (5).
4. VIO initialization — initial quantities, stationary and dynamic startup,
   and checking initialization (4).

The current text uses Chen–Huang–Patrick/RPNG frame notation and scalar-last
JPL quaternions. It includes corrected IMU readings and noise covariances,
white-noise and bias-random-walk sampling models, and visual–inertial startup
constraints with the metric camera–IMU lever arm. Keep frame, unit, motion
and sampling assumptions attached to the equations.

## Pending chapters

5. State Estimation Algorithms — To be added.
6. Trajectory evaluation — To be added.
7. Runtime and platform measurements — To be added.
8. Working with your own sensor data — To be added.

Homepage, contents and chapter navigation share the directory in
`data/tutorials.json`. Keep Notation first. Collapsible section navigation
supports Chapters 3–4. Existing coordinate, projection and distortion
figures and the bundled KaTeX math fonts are retained.

## References and illustrations

Use primary papers or official documentation to check technical content.
Keep only references supporting key definitions or method-specific claims,
without repeating a paper in every paragraph. The retained chapters contain
13 inline reference occurrences and no OpenVINS documentation links.
The separate References page remains a preparation notice.

The clock-and-host timing schematic in Section 3.4 is an original explanatory
figure, not a benchmark measurement. Regenerate it with:

```sh
python3 scripts/draw_clock_timing.py --output-dir public/images/tutorials
```

The retained-state and reference-path coverage draft figures are not published.
Tutorial revisions do not alter benchmark result values or aggregation rules.

## Validation

Build, check types, run the existing result-data tests and validate the export.
Inspect desktop and mobile equations, figures, navigation and pending pages.
Rendering checks do not replace mathematical and source review.

```sh
npm test
npm run build
npm run check
npm run validate
```
