# VIOVERSE

Tutorials, implementation documentation, trajectory evaluation, and benchmark result tables for visual–inertial odometry: https://vio-bench.github.io/

The site uses an academic document layout. Preserve the supplied logo, source metric definitions, missing states, and comparison conditions. Tutorial chapter text is awaiting author material; do not invent it.

## Published result tables

The October 10 update replaces the previous website result release.

- `/results/`: compact index of dataset, SR, and resource tables.
- `/results/tables/`: reviewed September 9 trajectory tables for five datasets, with drift-valid ATE and separate RPE intervals. Source columns, numbers, missing marks, and Average values are retained without recalculation.
- `/results/current/`: SR tables from the separately designated September 10 CSV export. Three expected run slots contribute to each sequence mean; missing or invalid SR has an effective zero. This is not the ATE/RPE selection rule.
- `/results/efficiency/`: resource tables from the latest checked Results revision, preserving each input, platform, camera mode, source statistic, and timing definition. SVO component sums must not be called independent native totals.
- `/benchmark/protocol/`: concise definitions and source information.

The published source-table export excludes the withdrawn ATE protocol and superseded raw SR tables. The designated SR tables remain available separately. Previous website JSON/CSV/ZIP files are removed from the active export; their source history remains in Git.

### Data files

- `public/data/current-source-tables.json`: trajectory table cells and source metadata.
- `public/data/current-results.json`: reviewed trajectory ledgers and designated SR dataset, sequence, and run records.
- `public/data/current-efficiency.json`: resource rows, exact source strings, units, missing states, and source metadata.
- `public/data/results-manifest.json`: export counts and checksums.
- `public/data/results-20261010.zip`: downloadable current data package.

Source exports do not establish complete attempted-run coverage or identical measurement conditions. Keep missing errors null; do not infer failure from absence. Preserve the distinct SR effective-zero rule. Do not combine different inputs, platforms, camera modes, timing boundaries, or evaluator variants into an overall ranking.

The exporters accept an explicit authorized local source path. Public metadata contains source hashes and revisions, not private source URLs, machine paths, credentials, or personal information. The website does not connect to Overleaf in the browser or rerun experiments.

## Development

Node.js 22.18+ and npm.

```sh
npm ci
npm run dev
npm run test
npm run build
npm run check
npm run validate
```

Development runs at http://127.0.0.1:3106. The static export is generated in `out/`. GitHub Pages serves `gh-pages` at `/`; `main` contains source.

## Publishing

Commit and push reviewed source to `main`, then run `npm run deploy`. The script tests, builds, validates, and replaces the contents of `gh-pages` with the static export using a normal push. Verify Pages completion and live response bytes separately.

## Content and anonymity

Read `docs/technical-conventions.md` before editing technical content. Keep tutorials as author-supplied chapters; references support the text rather than replace it. Public implementations and datasets retain their licenses.

`public/brand/vioverse-logo.jpg` is the supplied project mark, retained unchanged. The current review version omits bylines, affiliations, personal links, and project citation blocks. Keep identifying content out of current source documentation, public exports, and downloads. Historical Git commits are outside this website update.
