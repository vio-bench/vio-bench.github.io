# VIOVERSE

An open learning home for visual–inertial odometry: https://vio-bench.github.io/

## What is included

- Eight connected lessons with exercises and primary sources.
- Eleven public upstream system profiles with configuration caveats.
- An OpenVINS / EuRoC local run guide, reviewed against upstream documentation and source.
- A 20-record LaMAria R_02_easy monocular runtime snapshot across three platform labels.
- Five dataset reference cards and links to calibration/evaluation resources.

The OpenVINS guide has not been executed as part of this site release. The runtime snapshot has explicit limitations; its original per-run artifacts are not part of this public repository. See `/benchmark/protocol/` and `public/data/runtime.json`.

## Develop

Node.js 22.18+ and npm. Use a current supported Node LTS for maintenance.

```sh
npm ci
npm run dev
```

The development server uses http://127.0.0.1:3106.

```sh
npm run build
npm run check
npm run validate
```

The static export is generated into `out/`. GitHub Pages serves the `gh-pages` branch at its root. `main` contains the source. Deployment uses a generated-output branch, without requiring a server or a workflow token scope.

## Update content

- `data/tutorials.json`: lessons, prerequisites, exercises, and source links.
- `data/systems.json`: upstream profiles. Capability statements require a primary source.
- `data/run-guide.json`: reviewed commands and their expected outputs; distinguish a documented route from an executed test.
- `data/datasets.json`: official dataset metadata and learning focus.
- `public/data/runtime.json`: measured records, metric definitions, provenance, and missing-data semantics. Regenerate the downloadable CSV with `npm run data:csv` after changing this file.

Keep missing metrics null or absent. Never replace them with zero. A missing record does not prove a failure or unsupported operation. Do not promote this limited timing snapshot into a comprehensive performance ranking.

## Publish an update

Commit and push reviewed source to `main`, then run `npm run deploy`. The script builds and validates locally, clones the existing `gh-pages` branch into a temporary directory, copies the static export, commits, and pushes normally (no force push). The first deployment initializes that branch. GitHub Pages must be configured once to publish from `gh-pages` at `/`.

## Brand and sources

`public/brand/vioverse-logo.jpg` is the supplied official VIOVERSE logo, preserved unchanged. The original remains 1280 × 720. The header frames the wordmark with CSS; no generated approximation is used. The logo is a project brand asset and is not granted a separate reuse license by this repository.

Lessons are original educational summaries with source links. Public upstream code, documentation, datasets, and names retain their respective licenses. This site links to them; it does not redistribute the algorithm repositories or datasets. No third-party dataset photographs are republished.

## Contribute

Open an issue with the affected URL, the proposed correction, and a primary reference or reproducible example. Pull requests should preserve claim boundaries and include the relevant build/validation checks. Do not add private run logs, credentials, local machine paths, or unpublished personal information.
