"use client";
import Link from "next/link";
import { useState } from "react";
import type {
  AccuracyCell,
  AccuracyDataset,
  AccuracyConfiguration,
  AccuracyMetric,
} from "@/lib/results-types";
import { formatResult } from "./results-shared";
export function AccuracyMatrix({
  datasets,
  configurations,
  cells,
}: {
  datasets: AccuracyDataset[];
  configurations: AccuracyConfiguration[];
  cells: AccuracyCell[];
}) {
  const [metric, setMetric] = useState<AccuracyMetric>("position");
  const positives = cells
    .filter((c) => c.metric === metric && c.value !== null && c.value > 0)
    .map((c) => c.value as number);
  const lo = Math.log10(Math.min(...positives)),
    hi = Math.log10(Math.max(...positives));
  function color(value: number | null) {
    if (value === null || value <= 0) return {};
    const f = hi === lo ? 0.5 : (Math.log10(value) - lo) / (hi - lo);
    return {
      backgroundColor: `rgb(${Math.round(241 - f * 212)},${Math.round(247 - f * 171)},${Math.round(255 - f * 97)})`,
      color: f > 0.58 ? "white" : "#203854",
    };
  }
  return (
    <>
      <div className="matrix-heading">
        <div>
          <h2>Accuracy across five datasets</h2>
          <p className="small">
            Dataset means of reported sequence ATEs · [n] = contributing
            sequences
          </p>
        </div>
        <label className="field">
          Metric
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as AccuracyMetric)}
          >
            <option value="position">Position ATE (m)</option>
            <option value="orientation">Orientation ATE (deg)</option>
          </select>
        </label>
      </div>
      <div className="table-scroll">
        <table className="accuracy-matrix">
          <caption className="sr-only">
            {metric} ATE by configuration and dataset. Each cell links to its
            detailed leaderboard.
          </caption>
          <thead>
            <tr>
              <th scope="col">SYSTEM / CAMERA MODE</th>
              {datasets.map((d) => (
                <th scope="col" key={d.id}>
                  {d.label}
                  <small>{d.N_report} report sequences</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configurations.map((c, i) => {
              const newGroup =
                i === 0 || c.displayMode !== configurations[i - 1].displayMode;
              return (
                <tr key={c.id} className={newGroup ? "mode-start" : ""}>
                  <th scope="row">
                    <span>
                      {c.label}
                      {c.modeReviewRequired ? " †" : ""}
                    </span>
                    <small>
                      {c.displayMode === "mono" ? "Monocular" : "Stereo"}
                    </small>
                  </th>
                  {datasets.map((d) => {
                    const cell = cells.find(
                      (x) =>
                        x.configurationId === c.id &&
                        x.datasetId === d.id &&
                        x.metric === metric,
                    );
                    if (!cell) return <td key={d.id}>—</td>;
                    return (
                      <td key={d.id} style={color(cell.value)}>
                        <Link
                          href={`/results/accuracy/?dataset=${d.id}&mode=${c.displayMode}&metric=${metric}&sequence=all`}
                          aria-label={`${c.label}, ${d.name}: ${cell.value === null ? cell.missingStatus : cell.value + " " + cell.unit}, ${cell.n} contributing sequences`}
                        >
                          <strong>
                            {cell.value === null
                              ? cell.missingStatus ===
                                "no_configuration_records"
                                ? "NR"
                                : "—"
                              : cell.displayValue || formatResult(cell.value)}
                          </strong>
                          {cell.value !== null && <small>[{cell.n}]</small>}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="matrix-legend">
        <span>Lower error</span>
        <i aria-hidden="true" />
        <span>Higher error · logarithmic color scale</span>
      </div>
      <p className="note-line">
        The color scale spans all configurations and datasets for the selected
        metric. Sequence sets can differ between cells. † Camera mode is a
        code-supported display assignment awaiting historical run confirmation.
        NR = no configuration record.
      </p>
    </>
  );
}
