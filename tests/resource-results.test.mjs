import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  allResources, resourceRows, resourceCsv, resourceStatusLabel, resourceMetricDisplay,
} from "../lib/resource-results.ts";

const data = JSON.parse(readFileSync(new URL("../public/data/current-efficiency.json", import.meta.url), "utf8"));

test("resource view uses the current source and preserves selected-run counts", () => {
  assert.equal(data.release.sourceRevision, "29a1fa93804899fac8bf17799b5bd101ae02d9a4");
  assert.ok(data.rows.every(row => row.sourceRevision === data.release.sourceRevision));
  assert.ok(data.rows.every(row => row.sourceSelectedRuns === 5 && !row.selectedRunException));
});

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (c === "," || c === "\n")) {
      row.push(value); value = "";
      if (c === "\n") { rows.push(row); row = []; }
    } else value += c;
  }
  return rows;
}

test("the complete resource view retains every source row and never assigns a cross-condition rank", () => {
  const rows = resourceRows(data, allResources);
  assert.equal(rows.length, 166);
  assert.deepEqual(rows.map(r => r.sourceRecordId), data.rows.map(r => r.sourceRecordId));
  assert.ok(rows.every(r => r.rank === null));
  for (const selection of [
    { input: data.inputs[0].id }, { platform: "Desktop" }, { mode: "mono" },
    { input: data.inputs[0].id, platform: "Desktop" },
    { input: data.inputs[0].id, mode: "stereo" }, { platform: "Desktop", mode: "mono" },
  ]) assert.ok(resourceRows(data, { ...allResources, ...selection }).every(r => r.rank === null));
});

test("all focused conditions partition the resource inventory without computing rankings", () => {
  const seen = [];
  for (const input of data.inputs) for (const platform of ["Desktop", "Jetson Orin", "Jetson Nano"]) for (const mode of ["mono", "stereo"]) {
    const rows = resourceRows(data, { ...allResources, input: input.id, platform, mode });
    seen.push(...rows.map(r => r.sourceRecordId));
    assert.ok(rows.every(r => r.inputId === input.id && r.platform === platform && r.mode === mode));
    assert.ok(rows.every(r => r.rank === null));
    assert.deepEqual(rows.map(r => r.sourceRecordId), data.rows.filter(r => r.inputId === input.id && r.platform === platform && r.mode === mode).map(r => r.sourceRecordId));
  }
  assert.equal(seen.length, 166);
  assert.deepEqual(new Set(seen), new Set(data.rows.map(r => r.sourceRecordId)));
});

test("complete CSV preserves every metric, source state, unit, and definition for each selected record", () => {
  const [headers, ...rows] = parseCsv(resourceCsv(data, data.rows));
  const index = Object.fromEntries(headers.map((h, i) => [h, i]));
  assert.equal(rows.length, 166);
  assert.equal(Object.keys(data.metricDefinitions).length, 23);
  assert.ok(rows.every(row => row.length === headers.length));
  for (const row of rows) {
    const source = data.rows.find(r => r.sourceRecordId === row[index.source_record_id]);
    assert.ok(source);
    assert.equal(row[index.source_revision], source.sourceRevision);
    assert.equal(row[index.timing_definition], source.timingDefinition);
    assert.equal(row[index.per_metric_contributing_runs], "");
    assert.equal(row[index.total_attempts], "");
    for (const [key, definition] of Object.entries(data.metricDefinitions)) {
      const value = Object.hasOwn(source, key) ? source[key] : source.extendedMetrics[key];
      assert.equal(row[index[key]], value === null ? "" : String(value));
      assert.equal(row[index[`${key}_status`]], source.metricStatus[key] ?? source.extendedMetricStatus[key]);
      assert.equal(row[index[`${key}_unit`]], definition.unit);
      assert.equal(row[index[`${key}_statistic`]], definition.statistic);
      assert.equal(row[index[`${key}_scope`]], definition.scope);
      assert.equal(row[index[`${key}_source_token`]], source.sourceValues[key]?.rawToken ?? "");
      assert.equal(row[index[`${key}_source_status`]], source.sourceValues[key]?.sourceStatus ?? "");
      assert.equal(resourceMetricDisplay(source, key), value === null ? "—" : source.sourceValues[key].valueText);
    }
  }
  assert.notEqual(resourceStatusLabel("source_dash"), resourceStatusLabel("column_absent"));
  const focused = resourceRows(data, { ...allResources, input: "lamaria-r-02-easy-unspecified", platform: "Desktop", mode: "mono" });
  assert.equal(parseCsv(resourceCsv(data, focused)).length - 1, 8);
});
