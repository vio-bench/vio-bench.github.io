import type {
  AccuracyData,
  AccuracyMetric,
  CameraMode,
} from "./results-types.ts";
export function rankValues<T extends { value: number | null }>(
  rows: T[],
): (T & { rank: number | null })[] {
  const sorted = rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const av = a.row.value,
        bv = b.row.value;
      if (av === null) return bv === null ? a.index - b.index : 1;
      if (bv === null) return -1;
      return av - bv || a.index - b.index;
    });
  let previous: number | null = null,
    rank = 0;
  return sorted.map(({ row: r }, i) => {
    if (r.value !== null && r.value !== previous) rank = i + 1;
    previous = r.value;
    return { ...r, rank: r.value === null ? null : rank };
  });
}
export function accuracyRows(
  data: AccuracyData,
  datasetId: string,
  mode: CameraMode,
  metric: AccuracyMetric,
  sequenceId = "all",
) {
  const dataset = data.datasets.find((d) => d.id === datasetId);
  if (!dataset) throw new Error("Unknown dataset");
  if (
    sequenceId !== "all" &&
    !data.sequences.some(
      (s) => s.id === sequenceId && s.datasetId === datasetId,
    )
  )
    throw new Error("Sequence does not belong to selected dataset");
  return rankValues(
    data.configurations
      .filter((c) => c.displayMode === mode)
      .map((configuration) => {
        const records = data.records.filter(
          (r) =>
            r.configurationId === configuration.id &&
            r.datasetId === datasetId &&
            (sequenceId === "all" || r.sequenceId === sequenceId),
        );
        if (sequenceId === "all") {
          const cell = data.cells.find(
            (c) =>
              c.configurationId === configuration.id &&
              c.datasetId === datasetId &&
              c.metric === metric,
          );
          if (!cell) throw new Error("Missing canonical cell");
          return {
            configuration,
            records,
            value: cell.value,
            n: cell.n,
            N: cell.N_report,
            state: cell.missingStatus,
            display: cell.displayValue,
            starred: records.filter(
              (r) => r[metric].included && r.starCount > 0,
            ).length,
          };
        }
        const record = records[0],
          value = record?.[metric]?.value ?? null;
        return {
          configuration,
          records,
          value,
          n: value === null ? 0 : 1,
          N: 1,
          state: record?.[metric]?.state ?? "absent_row",
          display: record?.[metric]?.rawValue ?? "NR",
          starred:
            record && record[metric].included && record.starCount > 0 ? 1 : 0,
        };
      }),
  );
}
export function csvText(
  headers: string[],
  rows: (string | number | null | undefined)[][],
) {
  const quote = (v: string | number | null | undefined) =>
    v == null ? "" : '"' + String(v).replaceAll('"', '""') + '"';
  return (
    [
      headers.map(quote).join(","),
      ...rows.map((r) => r.map(quote).join(",")),
    ].join("\n") + "\n"
  );
}
