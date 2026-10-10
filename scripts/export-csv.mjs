import { readFile, writeFile } from "node:fs/promises";
import { csvText } from "../lib/leaderboards.ts";

const directory = new URL("../public/data/", import.meta.url);
const read = async name => JSON.parse(await readFile(new URL(name, directory), "utf8"));
const write = async (name, headers, rows) => {
  await writeFile(new URL(name, directory), csvText(headers, rows));
  console.log(`${name}: ${rows.length} records`);
};
const tables = await read("current-source-tables.json");
await write("current-source-cells.csv", ["source_revision", "table_id", "dataset_id", "group", "metric", "protocol", "rpe_length_m", "configuration_id", "sequence_or_average", "raw_cell", "source_artifact_id", "source_start_line"],
  tables.tables.flatMap(table => table.rows.flatMap(row => row.cells.map((cell, index) => [tables.source.revision, table.id, table.datasetId, table.group, table.metricFamily, table.protocol, table.rpeLengthM, row.method, table.columns[index], cell, table.sourceArtifactId, table.sourceStartLine]))));
const results = await read("current-results.json");
for (const [layer, filename] of [["aggregates", "current-sr-datasets.csv"], ["sequences", "current-sr-sequences.csv"], ["runs", "current-sr-runs.csv"]]) {
  const rows = results.coverage[layer];
  const headers = [...new Set(rows.flatMap(row => Object.keys(row)))];
  await write(filename, headers, rows.map(row => headers.map(key => row[key])));
}
const resources = await read("current-efficiency.json");
await write("current-resource-cells.csv", ["source_revision", "source_record_id", "platform", "dataset", "profiling_input", "input_variant", "system", "mode", "selected_runs", "timing_definition", "metric", "value_text", "raw_token", "status", "unit", "statistic", "scope"],
  resources.rows.flatMap(row => Object.entries(resources.metricDefinitions).map(([metric, definition]) => [row.sourceRevision, row.sourceRecordId, row.platform, row.dataset, row.sequence, row.inputVariant, row.system, row.mode, row.sourceSelectedRuns, row.timingDefinition ?? "reported_native_total", metric, row.sourceValues[metric]?.valueText ?? "", row.sourceValues[metric]?.rawToken ?? "", row.metricStatus[metric] ?? row.extendedMetricStatus[metric], definition.unit, definition.statistic, definition.scope])));
