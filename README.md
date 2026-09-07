# VIOVERSE

Tutorials, system implementations, trajectory evaluation, and benchmark results for visual–inertial odometry: https://vio-bench.github.io/

The site uses a document-oriented layout: project overview, tutorial contents, methods, and result tables. Titles state the subject directly. Keep navigation as ordinary links, reserve color for links and scientific figures, and preserve metric definitions and source qualifications when editing prose. The original VIOVERSE logo remains the project mark.

## What is included

- Nine planned tutorial chapters by the project authors, beginning with Notation; chapter text is awaiting the authors' manuscript, with supplementary references available separately.
- Eleven public upstream system profiles with configuration caveats.
- An OpenVINS / EuRoC local run guide, reviewed against upstream documentation and source.
- A dedicated Evaluation guide covering frames, synchronization, alignment, ATE/RPE, evaluated extent, and EPICA commands, with direct links to the public EPICA documentation.
- Accuracy leaderboards and a five-dataset overview: 180 canonical ATE cells, 18 configurations, and 98 report sequences.
- All 164 resource-table rows across five fixed inputs, mono/stereo modes, and three platforms.
- All 157 original Final dataset tables, including separate ATE protocols, SR and RPE, with downloads.
- Five dataset reference cards and links to calibration/evaluation resources.

The OpenVINS guide has not been executed as part of this site release. Results are a versioned export from committed source `bac8b9feb05c93a1d33b5fec08259730517965ee`, not a live connection from the public browser to Overleaf. Original per-run artifacts are not part of this public repository. See `/benchmark/protocol/` and the metadata in each public JSON.

## Develop

Node.js 22.18+ and npm. Use a current supported Node LTS for maintenance.

```sh
npm ci
npm run dev
```

The development server uses http://127.0.0.1:3106.

```sh
npm run test
npm run build
npm run check
npm run validate
```

The static export is generated into `out/`. GitHub Pages serves the `gh-pages` branch at its root. `main` contains the source. Deployment uses a generated-output branch, without requiring a server or a workflow token scope.

## Update content

- `data/tutorials.json`: chapter titles, summaries, related chapters, author-provided `sections`, and supplementary `readings`. Sections contain a heading, paragraphs, optional LaTeX equation, and references supporting that section. Leave sections empty until the authors provide text.
- `data/further-reading.json`: additional original readings organized by subject.
- `data/systems.json`: upstream profiles. Capability statements require a primary source.
- `data/run-guide.json`: reviewed commands and their expected outputs; distinguish a documented route from an executed test.
- `data/epica.json`: verified public EPICA documentation and package links. The Evaluation guide describes the workflow; `/benchmark/protocol/` retains release-specific Results definitions.
- `data/datasets.json`: official dataset metadata and learning focus.
- `public/data/accuracy.json`: canonical dataset cells and complete sequence/configuration ledger. Never mix ATE protocols or source Average columns into the means.
- `public/data/efficiency.json`: all source resource rows and extended metrics, preserving nulls and run-count exceptions.
- `public/data/source-tables.json`: original scientific table contents, grouped by dataset, sequence group, and protocol; no interpretation of unconfirmed SR/RPE semantics.
- `public/data/results-manifest.json`: checksums and counts for this public release.
- `public/data/results-bac8b9f.zip`: immutable downloadable package for the committed source revision.
- `public/data/runtime.json` and `runtime.csv`: original limited runtime release retained for old download URLs; superseded in the active interface by `efficiency.json`.

Keep missing metrics null or absent. Never replace them with zero. A missing record does not prove a failure or unsupported operation. Do not turn unmatched inputs or different metric protocols into a composite performance score.

## Publish an update

Commit and push reviewed source to `main`, then run `npm run deploy`. The script tests, builds, and validates locally, clones the existing `gh-pages` branch into a temporary directory, copies the static export, commits, and pushes normally (no force push). The first deployment initializes that branch. GitHub Pages must be configured once to publish from `gh-pages` at `/`.

## Brand and sources

`public/brand/vioverse-logo.jpg` is the supplied official VIOVERSE logo, preserved unchanged. The original remains 1280 × 720. The header frames the wordmark with CSS; no generated approximation is used. The logo is a project brand asset and is not granted a separate reuse license by this repository.

Tutorials are original chapters written by the project authors. References support the text; they do not replace its explanations, derivations, figures, or examples. Do not invent teaching content on the authors' behalf without a user request; follow `docs/technical-conventions.md`. Public upstream code, documentation, datasets, and names retain their respective licenses. This site links to them; it does not redistribute the algorithm repositories or datasets. No third-party dataset photographs are republished.

## Contribute

Open an issue with the affected URL, the proposed correction, and a primary reference or reproducible example. Pull requests should preserve claim boundaries and include the relevant build/validation checks. Do not add private run logs, credentials, local machine paths, or unpublished personal information.

## Refreshing Results

The deployed website serves a reviewed static snapshot. It does not expose an Overleaf credential or poll private documents. A future refresh should:

1. Read a clean committed Results revision in an authorized local environment. Keep the source worktree unchanged.
2. Regenerate the canonical ATE package using the approved source protocol and configuration identities. Review values, counts, source marks, and contributor changes together.
3. Recheck resource-table values and input identities against the same committed revision. Review metric semantics if the source schema changed.
4. Transcribe the separate original report tables without mixing evaluator variants or promoting source SR/RPE headings into unverified metrics.
5. Export only sanitized public fields. Update artifact checksums, preserve the prior ZIP, generate a new versioned ZIP, and update the release links/date together.
6. Run tests and export validation, review the changed data and scope, then publish. Check live response bytes against the generated export after Pages completes.

The source document itself is not an execution manifest. Complete report contents do not establish complete attempted-run coverage or validated comparison conditions.
