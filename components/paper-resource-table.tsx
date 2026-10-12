import source from "@/public/data/current-paper-resources.json";

const columns = [
  "desktop_time_ms",
  "orin_time_ratio",
  "nano_time_ratio",
  "desktop_cpu_percent",
  "orin_cpu_percent",
  "nano_cpu_percent",
] as const;

type Cell = {
  displayValue: string;
  valueText: string | null;
  unit: string;
  selectedRuns: number | null;
  contributingRuns: number | null;
  provenance: string;
};

type TableRow = {
  systemId: string;
  system: string;
  cells: Record<(typeof columns)[number], Cell>;
};

function cellDescription(cell: Cell): string {
  if (cell.valueText === null) return "No corresponding selected condition in the table source";
  const contributors = cell.contributingRuns === null
    ? "Metric-contributing run count unavailable"
    : `${cell.contributingRuns} metric-contributing runs`;
  const selected = cell.selectedRuns === null ? "" : `; ${cell.selectedRuns} selected runs`;
  return `Source value: ${cell.valueText} ${cell.unit}; ${contributors}${selected}`;
}

/** Exact installed paper cells, separate from the full resource source browser. */
export function PaperResourceTable() {
  const rows = source.tableII.rows as TableRow[];
  return (
    <section id="paper-resources" className="paper-results-section" aria-labelledby="paper-resources-title">
      <h2 id="paper-resources-title">Cross-platform resources — Table II</h2>
      <p>LaMAria <code>R_02_easy</code> · Mono. Time ratios compare each embedded platform with Desktop.</p>
      <div className="table-scroll">
        <table className="paper-resource-table">
          <caption className="sr-only">The installed paper table: monocular native time, embedded-to-Desktop time ratios, and CPU utilization on LaMAria R_02_easy.</caption>
          <thead>
            <tr>
              <th scope="col" rowSpan={2}>System</th>
              <th scope="col" rowSpan={2}>Desktop<br />time (ms)</th>
              <th scope="colgroup" colSpan={2}>Time ratio (×)</th>
              <th scope="colgroup" colSpan={3}>CPU (%)</th>
            </tr>
            <tr>
              <th scope="col">Orin</th>
              <th scope="col">Nano</th>
              <th scope="col">Desktop</th>
              <th scope="col">Orin</th>
              <th scope="col">Nano</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.systemId}>
                <th scope="row">{row.system}</th>
                {columns.map(column => (
                  <td key={column} className="score" title={cellDescription(row.cells[column])}>
                    {row.cells[column].displayValue}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="paper-resource-notes">
        <summary>Notes</summary>
        <p>
          Ratios use approved unrounded means where available; four ratios differ
          from calculations using two-decimal report means. SVO time is the
          reported frontend-plus-backend sum, and its ratio uses rounded means.
          Native timing does not measure common end-to-end latency.
        </p>
        <p>
          Archived metrics have five contributors except timing for ORB-SLAM3/Orin
          and OKVIS2-X/Nano (four). Kimera timing retains the prior report; its
          contributing counts are unavailable. Updated SVO rows list five selected
          runs, with metric-contributing counts unreported. A dash means an absent
          selected condition, rather than zero or failure.
        </p>
        <p>
          Fig. 3 retains 34 earlier records and five updated SVO records.
          All {source.figure3.summary.values} values match the full tables;
          identical run sets are not established. The archived and current
          sources retain their own input-variant labels.
        </p>
      </details>
    </section>
  );
}
