import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { accuracyRows, rankValues, csvText } from "../lib/leaderboards.ts";
const json = (name) =>
  JSON.parse(
    readFileSync(new URL("../public/data/" + name, import.meta.url), "utf8"),
  );
const accuracy = json("accuracy.json"),
  efficiency = json("efficiency.json"),
  tables = json("source-tables.json"),
  manifest = json("results-manifest.json");

test("all three public exports refer to one committed Results revision and match released hashes", () => {
  assert.equal(accuracy.source.revision, manifest.sourceRevision);
  assert.equal(efficiency.release.sourceRevision, manifest.sourceRevision);
  assert.equal(tables.source.revision, manifest.sourceRevision);
  for (const [name, hash] of Object.entries(manifest.artifacts))
    assert.equal(
      createHash("sha256")
        .update(
          readFileSync(new URL("../public/data/" + name, import.meta.url)),
        )
        .digest("hex"),
      hash,
    );
});
test("every canonical ATE cell is exactly supported by its own finite sequence contributors", () => {
  assert.equal(accuracy.cells.length, 180);
  for (const cell of accuracy.cells) {
    const records = accuracy.records.filter(
      (r) =>
        r.configurationId === cell.configurationId &&
        r.datasetId === cell.datasetId,
    );
    const included = records.filter((r) => r[cell.metric].included);
    assert.equal(records.length, cell.N_report, cell.id);
    assert.equal(included.length, cell.n, cell.id);
    assert.deepEqual(
      new Set(included.map((r) => r.sequenceId)),
      new Set(cell.contributorSequenceIds),
      cell.id,
    );
    const actual = included.length
      ? included.reduce((s, r) => s + r[cell.metric].value, 0) / included.length
      : null;
    if (actual === null) assert.equal(cell.value, null);
    else assert.ok(Math.abs(actual - cell.value) < 1e-9, cell.id);
    assert.equal(
      cell.failureStarredContributorCount,
      included.filter((r) => r.starCount > 0).length,
    );
  }
});
test("all dataset/mode/metric selections and all sequence selections preserve source values and missing states", () => {
  for (const dataset of accuracy.datasets)
    for (const mode of ["mono", "stereo"])
      for (const metric of ["position", "orientation"]) {
        const rows = accuracyRows(accuracy, dataset.id, mode, metric);
        assert.equal(
          rows.length,
          accuracy.configurations.filter((c) => c.displayMode === mode).length,
        );
        const finite = rows.filter((r) => r.value !== null);
        assert.deepEqual(
          finite.map((r) => r.value),
          finite.map((r) => r.value).sort((a, b) => a - b),
        );
        for (const seq of accuracy.sequences.filter(
          (s) => s.datasetId === dataset.id,
        )) {
          const selected = accuracyRows(
            accuracy,
            dataset.id,
            mode,
            metric,
            seq.id,
          );
          for (const row of selected) {
            assert.equal(row.records.length, 1);
            assert.equal(row.value, row.records[0][metric].value);
            assert.equal(row.N, 1);
            assert.equal(row.n, row.value === null ? 0 : 1);
          }
        }
      }
});
test("latest LaMAria update contributes R08 and R10 while preserving R09 dash", () => {
  const config = accuracy.configurations.find(
    (c) => c.system === "OKVIS2-X" && c.displayMode === "mono",
  );
  const dataset = accuracy.datasets.find((d) => d.name === "LaMAria");
  const cell = accuracy.cells.find(
    (c) =>
      c.configurationId === config.id &&
      c.datasetId === dataset.id &&
      c.metric === "position",
  );
  assert.equal(cell.n, 19);
  for (const [label, value] of [
    ["R_08_hard", 7.33],
    ["R_09_hard", null],
    ["R_10_hard", 8.099],
  ]) {
    const seq = accuracy.sequences.find(
      (s) => s.datasetId === dataset.id && s.label === label,
    );
    const rec = accuracy.records.find(
      (r) => r.configurationId === config.id && r.sequenceId === seq.id,
    );
    assert.equal(rec.position.value, value);
    assert.equal(rec.present, true);
  }
});
test("ranking keeps null values unranked, preserves true zero and assigns equal-value ties", () => {
  const input = [
    { id: "missing", value: null },
    { id: "zero", value: 0 },
    { id: "b", value: 2 },
    { id: "a", value: 2 },
    { id: "last", value: 3 },
  ];
  const result = rankValues(input);
  assert.deepEqual(
    result.map((r) => [r.id, r.rank]),
    [
      ["zero", 1],
      ["b", 2],
      ["a", 2],
      ["last", 4],
      ["missing", null],
    ],
  );
  assert.equal(input[0].id, "missing");
});
test("sequence selector cannot mix a recording from another dataset", () => {
  const first = accuracy.datasets[0],
    other = accuracy.sequences.find((s) => s.datasetId !== first.id);
  assert.throws(
    () => accuracyRows(accuracy, first.id, "mono", "position", other.id),
    /does not belong/,
  );
});
test("all resource source rows are kept, including SVO missing native totals and selected-run exceptions", () => {
  assert.equal(efficiency.rows.length, 164);
  assert.equal(new Set(efficiency.rows.map((r) => r.sourceRecordId)).size, 164);
  for (const [platform, count] of [
    ["Desktop", 65],
    ["Jetson Orin", 59],
    ["Jetson Nano", 40],
  ])
    assert.equal(
      efficiency.rows.filter((r) => r.platform === platform).length,
      count,
    );
  assert.equal(
    efficiency.rows.filter((r) => r.nativeTotalMs === null).length,
    18,
  );
  assert.ok(
    efficiency.rows
      .filter((r) => r.nativeTotalMs === null)
      .every((r) => r.system === "SVO Pro"),
  );
  assert.equal(
    efficiency.rows.filter((r) => r.sourceSelectedRuns === 1).length,
    2,
  );
  assert.ok(
    efficiency.rows
      .filter((r) => r.sourceSelectedRuns === 1)
      .every(
        (r) =>
          r.platform === "Jetson Orin" &&
          r.dataset === "EuRoC MAV" &&
          r.system === "sqrtVINS",
      ),
  );
  for (const r of efficiency.rows) {
    assert.ok(efficiency.inputs.some((i) => i.id === r.inputId));
    for (const key of [
      "nativeTotalMs",
      "reportedCpuPercent",
      "reportedProcessMemoryMiB",
    ])
      assert.ok(r[key] === null || Number.isFinite(r[key]));
  }
});
test("complete source-table archive preserves table widths, protocol separation and source averages", () => {
  assert.equal(tables.tables.length, 157);
  assert.equal(
    tables.tables.reduce((s, t) => s + t.rows.length, 0),
    2293,
  );
  assert.equal(
    tables.tables.reduce(
      (s, t) => s + t.rows.reduce((n, r) => n + r.cells.length, 0),
      0,
    ),
    12852,
  );
  for (const table of tables.tables) {
    assert.ok(tables.datasets.some((d) => d.id === table.datasetId));
    assert.ok(table.columns.includes("Average"));
    for (const row of table.rows)
      assert.equal(row.cells.length, table.columns.length, table.id);
  }
  assert.ok(tables.tables.some((t) => t.metric === "SR (epa)"));
  assert.ok(tables.tables.some((t) => t.metric.includes("100m")));
});
test("public exports contain no private source locations or credential patterns", () => {
  for (const name of Object.keys(manifest.artifacts)) {
    const text = readFileSync(
      new URL("../public/data/" + name, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      text,
      /\/Users\/|\/private\/tmp\/|git\.overleaf\.com|69693ce4ccea6ac41795262e|ghp_[A-Za-z0-9]+|github_pat_/,
    );
  }
});
test("CSV exports retain missing values and correctly quote source text", () => {
  const text = csvText(
    ["value", "source label"],
    [
      [null, "a,b"],
      [0, 'x"y'],
    ],
  );
  assert.equal(text, '"value","source label"\n,"a,b"\n"0","x""y"\n');
});
