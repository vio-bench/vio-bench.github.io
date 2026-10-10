import type { CameraMode, EfficiencyData, EfficiencyMetric, EfficiencyRow } from "./results-types.ts";
import { csvText } from "./leaderboards.ts";

export interface ResourceSelection {
  input: string;
  platform: string;
  mode: CameraMode | "all";
  metric: EfficiencyMetric;
}

export const allResources: ResourceSelection = {
  input: "all",
  platform: "all",
  mode: "all",
  metric: "nativeTotalMs",
};

export function isSingleResourceCondition(selection: ResourceSelection) {
  return selection.input !== "all" && selection.platform !== "all" && selection.mode !== "all";
}

export function resourceRows(data: EfficiencyData, selection: ResourceSelection) {
  const rows = data.rows
    .filter((row) =>
      (selection.input === "all" || row.inputId === selection.input) &&
      (selection.platform === "all" || row.platform === selection.platform) &&
      (selection.mode === "all" || row.mode === selection.mode),
    )
    .map((row) => ({ ...row, value: row[selection.metric] }));
  // Source-table order is preserved; no ranking is added to reported measurements.
  return rows.map((row) => ({ ...row, rank: null }));
}

export function resourceMetricValue(row: EfficiencyRow, key: string): number | null {
  if (key === "nativeTotalMs" || key === "reportedCpuPercent" || key === "reportedProcessMemoryMiB")
    return row[key];
  return row.extendedMetrics?.[key] ?? null;
}

export function resourceMetricStatus(row: EfficiencyRow, key: string) {
  return row.metricStatus[key] ?? row.extendedMetricStatus?.[key] ?? "unreported";
}

export function resourceMetricDisplay(row: EfficiencyRow, key: string) {
  const value = resourceMetricValue(row, key);
  return value === null ? "—" : row.sourceValues?.[key]?.valueText || String(value);
}

export function resourceStatusLabel(status: string) {
  if (status === "source_dash") return "Source dash";
  if (status === "column_absent") return "Column absent in source";
  if (status === "reported") return "Reported";
  return status.replaceAll("_", " ");
}

export function resourceCsv(data: EfficiencyData, rows: EfficiencyRow[]) {
  const definitions = Object.entries(data.metricDefinitions);
  return csvText(
    [
      "source_revision", "source_record_id", "input_id", "system_id", "system",
      "mode", "platform", "dataset", "sequence", "input_variant",
      "source_selected_runs", "selected_run_exception", "timing_definition", "per_metric_contributing_runs", "total_attempts",
      ...definitions.flatMap(([key]) => [
        key, `${key}_status`, `${key}_unit`, `${key}_statistic`, `${key}_scope`,
        `${key}_source_token`, `${key}_source_status`,
      ]),
    ],
    rows.map((row) => [
      row.sourceRevision, row.sourceRecordId, row.inputId, row.systemId, row.system,
      row.mode, row.platform, row.dataset, row.sequence, row.inputVariant,
      row.sourceSelectedRuns, String(row.selectedRunException), row.timingDefinition, null, null,
      ...definitions.flatMap(([key, definition]) => [
        resourceMetricValue(row, key), resourceMetricStatus(row, key),
        definition.unit, definition.statistic, definition.scope,
        row.sourceValues?.[key]?.rawToken, row.sourceValues?.[key]?.sourceStatus,
      ]),
    ]),
  );
}
