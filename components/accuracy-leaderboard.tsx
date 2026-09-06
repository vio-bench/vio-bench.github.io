"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import source from "@/public/data/accuracy.json";
import type {
  AccuracyData,
  AccuracyMetric,
  CameraMode,
} from "@/lib/results-types";
import { accuracyRows, csvText } from "@/lib/leaderboards";
import { downloadText, formatResult, updateQuery } from "./results-shared";
const data = source as unknown as AccuracyData;
export function AccuracyLeaderboard() {
  const [dataset, setDataset] = useState(data.datasets[0].id),
    [mode, setMode] = useState<CameraMode>("mono"),
    [metric, setMetric] = useState<AccuracyMetric>("position"),
    [sequence, setSequence] = useState("all"),
    [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d =
      data.datasets.find((d) => d.id === q.get("dataset"))?.id ??
      data.datasets[0].id;
    setDataset(d);
    if (q.get("mode") === "stereo") setMode("stereo");
    if (q.get("metric") === "orientation") setMetric("orientation");
    const s = q.get("sequence");
    if (s && data.sequences.some((x) => x.id === s && x.datasetId === d))
      setSequence(s);
  }, []);
  function change(
    changes: Partial<{
      dataset: string;
      mode: CameraMode;
      metric: AccuracyMetric;
      sequence: string;
    }>,
  ) {
    const next = { dataset, mode, metric, sequence, ...changes };
    if (changes.dataset) next.sequence = "all";
    setDataset(next.dataset);
    setMode(next.mode);
    setMetric(next.metric);
    setSequence(next.sequence);
    setExpanded(null);
    updateQuery(next);
  }
  const rows = accuracyRows(data, dataset, mode, metric, sequence);
  const selectedDataset = data.datasets.find((d) => d.id === dataset)!;
  const sequences = data.sequences.filter((s) => s.datasetId === dataset);
  const metricLabel =
    metric === "position" ? "Position ATE (m)" : "Orientation ATE (deg)";
  function download() {
    downloadText(
      csvText(
        [
          "source_revision",
          "protocol",
          "dataset",
          "display_camera_mode",
          "source_camera_mode",
          "system",
          "sequence_scope",
          "metric",
          "value",
          "unit",
          "contributing_sequences",
          "report_sequences",
          "state",
          "mode_review_required",
        ],
        rows.map((r) => [
          data.source.revision,
          "epa-drift valid",
          selectedDataset.name,
          r.configuration.displayMode,
          r.configuration.mode,
          r.configuration.system,
          sequence === "all"
            ? "dataset_available_sequence_mean"
            : (sequences.find((s) => s.id === sequence)?.label ?? sequence),
          metric,
          r.value,
          metric === "position" ? "m" : "deg",
          r.n,
          r.N,
          r.state,
          String(r.configuration.modeReviewRequired),
        ]),
      ),
      `vioverse-accuracy-${dataset}-${mode}-${metric}-${sequence}.csv`,
    );
  }
  return (
    <>
      <div className="filters results-filters">
        <label className="field">
          Dataset
          <select
            value={dataset}
            onChange={(e) => change({ dataset: e.target.value })}
          >
            {data.datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Camera mode
          <select
            value={mode}
            onChange={(e) => change({ mode: e.target.value as CameraMode })}
          >
            <option value="mono">Monocular</option>
            <option value="stereo">Stereo</option>
          </select>
        </label>
        <label className="field">
          Metric
          <select
            value={metric}
            onChange={(e) =>
              change({ metric: e.target.value as AccuracyMetric })
            }
          >
            <option value="position">Position ATE (m)</option>
            <option value="orientation">Orientation ATE (deg)</option>
          </select>
        </label>
        <label className="field sequence-field">
          Sequence / aggregation
          <select
            value={sequence}
            onChange={(e) => change({ sequence: e.target.value })}
          >
            <option value="all">Dataset mean · available sequences</option>
            {sequences.map((s) => (
              <option key={s.id} value={s.id}>
                {s.group} / {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="result-context">
        <span className="tag">epa-drift valid · verification candidate</span>
        <span role="status">
          {rows.filter((r) => r.value !== null).length} of {rows.length}{" "}
          configurations have a value
        </span>
        <button className="button secondary" onClick={download}>
          <Download size={14} /> Export selected results
        </button>
      </div>
      <p className="result-reading-note">
        {sequence === "all"
          ? "Sorted by reported means; contributing sequence sets may differ. Select a single sequence for a narrower comparison."
          : "Sorted by reported error for this sequence. A finite value does not prove a complete or successful run."}{" "}
        Sequence counts describe available report values, not temporal coverage
        or successful runs.
      </p>
      <div className="table-scroll">
        <table className="leaderboard">
          <caption className="sr-only">
            {selectedDataset.name}, {mode}, {metricLabel},{" "}
            {sequence === "all"
              ? "dataset summary"
              : sequences.find((s) => s.id === sequence)?.label}
          </caption>
          <thead>
            <tr>
              <th scope="col">ORDER</th>
              <th scope="col">SYSTEM</th>
              <th scope="col">{metricLabel.toUpperCase()} ↓</th>
              <th scope="col">SEQUENCES WITH VALUE</th>
              <th scope="col">SOURCE ANNOTATIONS</th>
              <th scope="col">DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Fragment key={r.configuration.id}>
                <tr>
                  <td className="rank">{r.rank ?? "—"}</td>
                  <th scope="row">
                    {r.configuration.label}
                    {r.configuration.modeReviewRequired && (
                      <span title="Mode inferred from code; original run mode needs confirmation">
                        {" "}
                        †
                      </span>
                    )}
                  </th>
                  <td className="score">
                    {r.value === null
                      ? "—"
                      : sequence === "all"
                        ? formatResult(r.value)
                        : r.display}
                  </td>
                  <td>
                    {r.n} / {r.N}
                  </td>
                  <td>
                    <span
                      className={
                        "result-state " + (r.value === null ? "missing" : "")
                      }
                    >
                      {r.value === null
                        ? r.state.includes("absent") ||
                          r.state.includes("no_configuration")
                          ? "No record"
                          : "Not reported"
                        : r.starred
                          ? `${r.starred} finite sequence${r.starred === 1 ? "" : "s"} marked *`
                          : "No finite-value failure mark"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="details-toggle"
                      aria-expanded={expanded === r.configuration.id}
                      aria-controls={"detail-" + r.configuration.id}
                      onClick={() =>
                        setExpanded(
                          expanded === r.configuration.id
                            ? null
                            : r.configuration.id,
                        )
                      }
                    >
                      {expanded === r.configuration.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}{" "}
                      Inspect
                    </button>
                  </td>
                </tr>
                {expanded === r.configuration.id && (
                  <tr
                    id={"detail-" + r.configuration.id}
                    className="expanded-result"
                  >
                    <td colSpan={6}>
                      <div className="record-metadata">
                        <strong>
                          {r.configuration.label} · source context
                        </strong>
                        <p>
                          Recorded camera mode: {r.configuration.mode}.
                          Platform: {r.configuration.platform}. Input variant:{" "}
                          {r.configuration.inputVariant}.
                          {r.configuration.modeReviewRequired
                            ? " The displayed mode still requires confirmation against the original run."
                            : ""}
                        </p>
                        <p>
                          * / ** / *** retain source mid-run failure annotations
                          (one / two / all). They do not supply an attempt
                          denominator. Finite starred values contribute to the
                          reported mean.
                        </p>
                        <p>
                          Source revision:{" "}
                          <code>{data.source.revision.slice(0, 12)}</code> ·
                          Protocol: epa-drift valid · No refitting or
                          re-evaluation is performed by this website.
                        </p>
                      </div>
                      <div className="table-scroll detail-table">
                        <table>
                          <thead>
                            <tr>
                              <th>SEQUENCE</th>
                              <th>{metricLabel.toUpperCase()}</th>
                              <th>SOURCE STATE</th>
                              <th>FAILURE MARK</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.records.map((rec) => (
                              <tr key={rec.id}>
                                <td>
                                  {sequences.find(
                                    (s) => s.id === rec.sequenceId,
                                  )?.label ?? rec.sequenceId}
                                </td>
                                <td>
                                  {rec[metric].value === null
                                    ? "—"
                                    : rec[metric].rawValue}
                                </td>
                                <td>
                                  {rec[metric].state.replaceAll("_", " ")}
                                </td>
                                <td>
                                  {rec.starCount
                                    ? "*".repeat(rec.starCount)
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note-line">
        Sorting uses unrounded values. † marks a camera-mode assignment under
        review. An unmarked record is not evidence that all attempts succeeded.{" "}
        <Link href="/benchmark/protocol/">
          Read the metric and aggregation definitions →
        </Link>
      </p>
      <div className="data-links">
        <a href="/data/accuracy.json" download>
          All accuracy records + metadata (JSON)
        </a>
        <Link href="/results/tables/">
          Browse every original result table →
        </Link>
      </div>
    </>
  );
}
