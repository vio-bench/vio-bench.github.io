# Paper result sources

The ordinary ATE/RPE, SR, and resource browsers retain their complete existing
exports. `/results/paper/` adds the exact installed paper comparisons, with
separate source records rather than substituting similarly rounded numbers.

The checked paper revision is `8d6fa5bff03ef903c97cbbf6976cf9c1d9dfb96c`.
Each exporter verifies the hashes of its actual figure/table inputs. It refuses
changed inputs; a new paper snapshot requires reviewing and updating those
contracts. No exporter reruns a benchmark, fits an alignment, or changes an
evaluation protocol.

## Reproduce

Requires Python 3; the alignment exporter also requires NumPy. Supply the local
paper checkout as `PAPER_DIR`.

```sh
python3 scripts/export-paper-accuracy.py --paper-root "$PAPER_DIR"
python3 scripts/export-paper-resources.py --paper-root "$PAPER_DIR" --check
python3 scripts/export-paper-alignment.py --paper-root "$PAPER_DIR" --check
npm test
npm run build
npm run validate
```

Omit `--check` on the resource/alignment exporters to write their checked
exports. Data fields preserve source precision, identities, revision, counts,
and missing states. The UI has no download controls.

## Scope and source distinctions

- Accuracy: 352 Fig. 1 grid entries, 72 Fig. 2 SR means, 28 Fig. 4 values,
  and 16 Table III/IV cells are checked against the ordinary result sources.
- Resources: 48 Table II cells and 117 Fig. 3 values. Four paper timing ratios
  use approved unrounded means. Do not reproduce these ratios from the full
  report's rounded timing values. Fig. 3 retains 34 earlier records and five
  updated SVO records; matching numerical values do not establish identical
  contributing run sets. The ledger retains these source distinctions.
- Alignment: Fig. 5/Table V use all associated poses, 499 or 440 per panel,
  without drift-valid trimming. They are kept separate from ordinary drift-valid
  ATE/RPE. The SVG is copied from the approved figure package; stored arrays,
  transforms, source values, and scale states are retained unchanged.
- The resource report omits seven combinations without their identities or
  measurements. No rows or zeros are fabricated for them. Selected run counts
  are distinct from per-metric contributions and total deployment attempts.

`tests/paper-results.test.mjs` checks these contracts and cross-source values.
