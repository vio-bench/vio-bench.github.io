"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import source from "@/public/data/current-efficiency.json";
import type {
  EfficiencyData,
  EfficiencyMetric,
} from "@/lib/results-types";
import {
  allResources, resourceCsv, resourceMetricStatus,
  resourceMetricDisplay, resourceRows, resourceStatusLabel,
  type ResourceSelection,
} from "@/lib/resource-results";
import { downloadText, updateQuery } from "./results-shared";
const data = source as unknown as EfficiencyData;
const metrics: { id: EfficiencyMetric; label: string; unit: string }[] = [
  { id: "nativeTotalMs", label: "Reported time", unit: "ms" },
  { id: "reportedCpuPercent", label: "Reported CPU", unit: "%" },
  { id: "reportedProcessMemoryMiB", label: "Process memory", unit: "MiB" },
];
const extraLabels: Record<string, string> = {
  nativeTrackingMeanMs: "Tracking time · mean",
  nativeTrackingMeanWithinRunPopulationSdMs:
    "Tracking time · mean within-run SD",
  nativeEstimationMeanMs: "Estimation time · mean",
  nativeEstimationMeanWithinRunPopulationSdMs:
    "Estimation time · mean within-run SD",
  nativeTotalMeanWithinRunPopulationSdMs:
    "Native total time · mean within-run SD",
  reportedCpuMeanWithinRunPopulationSdPercent: "Host CPU · mean within-run SD",
  reportedCpuMeanRunP95Percent: "Host CPU · mean per-run p95",
  reportedCpuMeanRunPeakPercent: "Host CPU · mean per-run peak",
  reportedProcessMemoryMeanWithinRunPopulationSdMiB:
    "Process memory · mean within-run SD",
  reportedProcessMemoryMeanRunP95MiB: "Process memory · mean per-run p95",
  reportedProcessMemoryMeanRunPeakMiB: "Process memory · mean per-run peak",
  reportedGpuMeanPercent: "GPU · mean",
  reportedGpuMeanWithinRunPopulationSdPercent: "GPU · mean within-run SD",
  reportedGpuMeanRunP95Percent: "GPU · mean per-run p95",
  reportedGpuMeanRunPeakPercent: "GPU · mean per-run peak",
  reportedGpuMemoryMeanRunBaselineMiB: "GPU memory · mean per-run baseline",
  reportedGpuMemoryDeltaMeanMiB: "GPU memory change · mean",
  reportedGpuMemoryDeltaMeanWithinRunPopulationSdMiB:
    "GPU memory change · mean within-run SD",
  reportedGpuMemoryDeltaMeanRunP95MiB: "GPU memory change · mean per-run p95",
  reportedGpuMemoryDeltaMeanRunPeakMiB: "GPU memory change · mean per-run peak",
};
export function EfficiencyLeaderboard() {
  const [input, setInput] = useState(allResources.input),
    [platform, setPlatform] = useState(allResources.platform),
    [mode, setMode] = useState<ResourceSelection["mode"]>(allResources.mode),
    [metric, setMetric] = useState<EfficiencyMetric>(allResources.metric),
    [expanded, setExpanded] = useState<string | null>(null);
  const platforms = ["Desktop", "Jetson Orin", "Jetson Nano"];
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (data.inputs.some((i) => i.id === q.get("input")))
      setInput(q.get("input")!);
    if (platforms.includes(q.get("platform")!)) setPlatform(q.get("platform")!);
    if (q.get("mode") === "mono" || q.get("mode") === "stereo")
      setMode(q.get("mode") as ResourceSelection["mode"]);
    if (metrics.some((m) => m.id === q.get("metric")))
      setMetric(q.get("metric") as EfficiencyMetric);
  }, []);
  function change(
    changes: Partial<ResourceSelection>,
  ) {
    const next = { input, platform, mode, metric, ...changes };
    setInput(next.input);
    setPlatform(next.platform);
    setMode(next.mode);
    setMetric(next.metric);
    setExpanded(null);
    updateQuery(next);
  }
  const selected = data.inputs.find((i) => i.id === input);
  const metricInfo = metrics.find((m) => m.id === metric)!;
  const selection = { input, platform, mode, metric };
  const records = resourceRows(data, selection);
  function download() {
    downloadText(
      resourceCsv(data, records),
      `vioverse-resources-${input}-${platform.toLowerCase().replaceAll(" ", "-")}-${mode}.csv`,
    );
  }
  return (
    <>
      <div className="filters results-filters">
        <label className="field sequence-field">
          Dataset / profiling sequence
          <select
            value={input}
            onChange={(e) => change({ input: e.target.value })}
          >
            <option value="all">All inputs</option>
            {data.inputs.map((i) => (
              <option key={i.id} value={i.id}>
                {i.dataset} · {i.sequence}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Platform
          <select
            value={platform}
            onChange={(e) => change({ platform: e.target.value })}
          >
            <option value="all">All platforms</option>
            {platforms.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Camera mode
          <select
            value={mode}
            onChange={(e) => change({ mode: e.target.value as ResourceSelection["mode"] })}
          >
            <option value="all">All camera modes</option>
            <option value="mono">Monocular</option>
            <option value="stereo">Stereo</option>
          </select>
        </label>
        <label className="field">
          Primary displayed metric
          <select
            value={metric}
            onChange={(e) =>
              change({ metric: e.target.value as EfficiencyMetric })
            }
          >
            {metrics.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.unit})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="result-context">
        <span role="status">
          {records.length} of {data.rows.length} source rows ·{" "}
          {records.filter((r) => r.value !== null).length} with{" "}
          {metricInfo.label.toLowerCase()}
        </span>
        <button className="button secondary" onClick={download}>
          <Download size={14} /> Export selected rows · all metrics
        </button>
        <button className="button secondary" onClick={() => change(allResources)}>
          Show all resources
        </button>
      </div>
      <p className="result-reading-note">
        Rows follow the report order. Each record describes a fixed profiling input. Timing boundaries are listed
        for each row. CPU normalization and process-memory definitions may differ
        across platforms.
      </p>
      <p className="small">
        Expand a row to see all reported timing, CPU, memory, and GPU statistics.
        Downloads include all available metrics for the selected rows.
      </p>
      {records.length ? (
        <div className="table-scroll">
          <table className="leaderboard">
            <caption className="sr-only">
              {selected ? `${selected.dataset} ${selected.sequence}` : "All profiling inputs"}, {platform}, {mode}.
              Report order.
            </caption>
            <thead>
              <tr>
                <th scope="col">SYSTEM</th>
                <th scope="col">INPUT</th>
                <th scope="col">PLATFORM</th>
                <th scope="col">CAMERA MODE</th>
                <th scope="col">TIMING BOUNDARY</th>
                <th scope="col">
                  {metricInfo.label.toUpperCase()} ({metricInfo.unit})
                </th>
                {metrics
                  .filter((m) => m.id !== metric)
                  .map((m) => (
                    <th scope="col" key={m.id}>
                      {m.label.toUpperCase()} ({m.unit})
                    </th>
                  ))}
                <th scope="col">SELECTED RUNS</th>
                <th scope="col">DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <Fragment key={r.sourceRecordId}>
                  <tr>
                    <th scope="row">{r.system}</th>
                    <td>
                      {r.dataset}<br />{r.sequence}<br />
                      <span className="small">Variant: {r.inputVariant}</span>
                    </td>
                    <td>{r.platform}</td>
                    <td>{r.mode === "mono" ? "Monocular" : "Stereo"}</td>
                    <td>{r.timingDefinition === "frontend_plus_backend" ? "Frontend + backend" : r.nativeTotalMs === null ? "Not reported" : "Reported native total"}</td>
                    <td className="score resource-score">
                      {resourceMetricDisplay(r, metric)}
                    </td>
                    {metrics
                      .filter((m) => m.id !== metric)
                      .map((m) => (
                        <td key={m.id}>{resourceMetricDisplay(r, m.id)}</td>
                      ))}
                    <td>
                      {r.sourceSelectedRuns}
                      {r.selectedRunException ? " †" : ""}
                    </td>
                    <td>
                      <button
                        className="details-toggle"
                        aria-expanded={expanded === r.sourceRecordId}
                        aria-controls={"detail-" + r.sourceRecordId}
                        onClick={() =>
                          setExpanded(
                            expanded === r.sourceRecordId
                              ? null
                              : r.sourceRecordId,
                          )
                        }
                      >
                        {expanded === r.sourceRecordId ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}{" "}
                        Inspect
                      </button>
                    </td>
                  </tr>
                  {expanded === r.sourceRecordId && (
                    <tr
                      id={"detail-" + r.sourceRecordId}
                      className="expanded-result"
                    >
                      <td colSpan={10}>
                        <div className="record-metadata">
                          <strong>
                            {r.system} · {r.platform} · {r.sequence}
                          </strong>
                          <p>
                            Input variant: {r.inputVariant}. Source row:{" "}
                            {r.sourceSelectedRuns} selected run
                            {r.sourceSelectedRuns === 1 ? "" : "s"}. The
                            contributing run count for each metric and the total
                            number of attempts are unreported.
                          </p>
                          <p>
                            Extended statistics are averages of per-run
                            summaries. Within-run SD does not measure
                            between-run variability; p95 and peaks are not
                            computed from pooled samples. GPU data are sparse
                            and do not support a general GPU comparison.
                          </p>
                          <p>
                            Record ID: <code>{r.sourceRecordId}</code> · Results
                            revision:{" "}
                            <code>
                              {data.release.sourceRevision.slice(0, 12)}
                            </code>
                          </p>
                        </div>
                        <div className="table-scroll detail-table">
                          <table>
                            <thead>
                              <tr>
                                <th scope="col">REPORTED STATISTIC</th>
                                <th scope="col">VALUE</th>
                                <th scope="col">SOURCE STATE</th>
                                <th scope="col">UNIT</th>
                                <th scope="col">DEFINITION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(data.metricDefinitions).map(
                                ([key, definition]) => (
                                  <tr key={key}>
                                    <th scope="row" style={{ position: "static", whiteSpace: "normal", minWidth: 180 }}>
                                      {key === "nativeTotalMs" && r.timingDefinition === "frontend_plus_backend" ? "Frontend + backend time" : definition.label ?? extraLabels[key] ?? key}
                                    </th>
                                    <td>{resourceMetricDisplay(r, key)}</td>
                                    <td>{resourceStatusLabel(resourceMetricStatus(r, key))}</td>
                                    <td>{definition.unit}</td>
                                    <td style={{ whiteSpace: "normal", minWidth: 300 }}>
                                      {key === "nativeTotalMs" && r.timingDefinition === "frontend_plus_backend" ? "Sum of the reported frontend and backend means." : <>{definition.statistic}. {definition.scope}</>}
                                    </td>
                                  </tr>
                                ),
                              )}
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
      ) : (
        <div className="empty">
          <h2>No source rows for this selection.</h2>
          <p>
            The report has no matching input, platform, and camera-mode records.
            This does not establish an execution failure or unsupported
            operation.
          </p>
          <button
            className="button secondary"
            onClick={() => change(allResources)}
          >
            Show all resources
          </button>
        </div>
      )}
      <p className="note-line">
        Missing measurements remain blank. A frontend + backend total is labeled
        separately from an implementation-reported native total.{" "}
        <Link href="/results/#calculation">Read measurement definitions →</Link>
      </p>
      <div className="data-links">
        <a href="/data/current-efficiency.json" download>
          All {data.rows.length} resource records (JSON)
        </a>
      </div>
    </>
  );
}
