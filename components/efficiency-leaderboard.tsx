"use client";

import { Fragment, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import source from "@/public/data/current-efficiency.json";
import type { EfficiencyData, EfficiencyMetric } from "@/lib/results-types";
import {
  resourceMetricDisplay,
  resourceMetricStatus,
  resourceStatusLabel,
} from "@/lib/resource-results";
import { updateQuery } from "./results-shared";

const data = source as unknown as EfficiencyData;
const platforms = ["Desktop", "Jetson Orin", "Jetson Nano"];
const defaultInput = data.inputs.find((input) =>
  input.dataset === "EuRoC MAV" && input.sequence === "V1_01_easy",
)!.id;
const defaults = { input: defaultInput, platform: "Desktop", mode: "mono", system: "" };
const metrics: { id: EfficiencyMetric; label: string }[] = [
  { id: "nativeTotalMs", label: "Time (ms)" },
  { id: "reportedCpuPercent", label: "CPU (%)" },
  { id: "reportedProcessMemoryMiB", label: "RAM (MiB)" },
];
const extraLabels: Record<string, string> = {
  nativeTrackingMeanMs: "Tracking time · mean",
  nativeTrackingMeanWithinRunPopulationSdMs: "Tracking time · within-run SD",
  nativeEstimationMeanMs: "Estimation time · mean",
  nativeEstimationMeanWithinRunPopulationSdMs: "Estimation time · within-run SD",
  nativeTotalMeanWithinRunPopulationSdMs: "Total time · within-run SD",
  reportedCpuMeanWithinRunPopulationSdPercent: "Host CPU · within-run SD",
  reportedCpuMeanRunP95Percent: "Host CPU · per-run p95",
  reportedCpuMeanRunPeakPercent: "Host CPU · per-run peak",
  reportedProcessMemoryMeanWithinRunPopulationSdMiB: "Process memory · within-run SD",
  reportedProcessMemoryMeanRunP95MiB: "Process memory · per-run p95",
  reportedProcessMemoryMeanRunPeakMiB: "Process memory · per-run peak",
  reportedGpuMeanPercent: "GPU · mean",
  reportedGpuMeanWithinRunPopulationSdPercent: "GPU · within-run SD",
  reportedGpuMeanRunP95Percent: "GPU · per-run p95",
  reportedGpuMeanRunPeakPercent: "GPU · per-run peak",
  reportedGpuMemoryMeanRunBaselineMiB: "GPU memory · per-run baseline",
  reportedGpuMemoryDeltaMeanMiB: "GPU memory change · mean",
  reportedGpuMemoryDeltaMeanWithinRunPopulationSdMiB: "GPU memory change · within-run SD",
  reportedGpuMemoryDeltaMeanRunP95MiB: "GPU memory change · per-run p95",
  reportedGpuMemoryDeltaMeanRunPeakMiB: "GPU memory change · per-run peak",
};

function systemName(name: string) {
  return name === "sqrtVINS" ? "√VINS" : name;
}

export function EfficiencyLeaderboard() {
  const searchParams = useSearchParams();
  const requestedInput = searchParams.get("input");
  const requestedPlatform = searchParams.get("platform");
  const requestedMode = searchParams.get("mode");
  const input = requestedInput === "all" || data.inputs.some((item) => item.id === requestedInput)
    ? requestedInput! : defaults.input;
  const platform = requestedPlatform === "all" || platforms.includes(requestedPlatform!)
    ? requestedPlatform! : defaults.platform;
  const mode = requestedMode === "all" || requestedMode === "mono" || requestedMode === "stereo"
    ? requestedMode : defaults.mode;
  const system = searchParams.get("system") ?? defaults.system;
  const [expanded, setExpanded] = useState<string | null>(null);
  const selected = data.inputs.find((item) => item.id === input);
  const query = system.trim().toLowerCase();
  const records = data.rows.filter((row) =>
    (input === "all" || row.inputId === input) &&
    (platform === "all" || row.platform === platform) &&
    (mode === "all" || row.mode === mode) &&
    (!query || row.system.toLowerCase().includes(query) ||
      systemName(row.system).toLowerCase().includes(query)),
  );
  const showInput = input === "all";
  const showPlatform = platform === "all";
  const showMode = mode === "all";
  const columnCount = 5 + Number(showInput) + Number(showPlatform) + Number(showMode);

  function change(changes: Partial<typeof defaults>) {
    updateQuery({ input, platform, mode, system, ...changes });
    setExpanded(null);
  }

  return (
    <div className="resource-browser">
      <div className="filters results-filters">
        <label className="field sequence-field">
          Profiling input
          <select value={input} onChange={(event) => change({ input: event.target.value })}>
            <option value="all">All inputs</option>
            {data.inputs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.dataset} · {item.sequence}
                {item.inputVariant !== "unspecified" ? ` · ${item.inputVariant}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Platform
          <select value={platform} onChange={(event) => change({ platform: event.target.value })}>
            <option value="all">All platforms</option>
            {platforms.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="field">
          Mode
          <select value={mode} onChange={(event) => change({ mode: event.target.value })}>
            <option value="all">All modes</option>
            <option value="mono">Mono</option>
            <option value="stereo">Stereo</option>
          </select>
        </label>
        <label className="field">
          System
          <input value={system} placeholder="Search" onChange={(event) => change({ system: event.target.value })} />
        </label>
      </div>

      <div className="result-context">
        <span role="status">{records.length} record{records.length === 1 ? "" : "s"}</span>
        <button className="button secondary" onClick={() => change(defaults)}>Reset</button>
      </div>

      <div className="result-condition resource-condition">
        <h2>{selected ? `${selected.dataset} · ${selected.sequence}` : "All profiling inputs"}</h2>
        <p className="small">
          {platform === "all" ? "All platforms" : platform} · {mode === "all" ? "All modes" : mode === "mono" ? "Mono" : "Stereo"}
          {selected ? ` · Input variant: ${selected.inputVariant}` : ""}
        </p>
      </div>

      <details className="result-reading-note">
        <summary>Notes</summary>
        <div>
          <p>Time, CPU, and RAM are reported means for fixed profiling inputs, not dataset-wide averages. Rows retain source order and precision. A dash is a missing measurement, not zero or an execution failure.</p>
          <p>Time retains each implementation’s native measurement boundary; it is not a common end-to-end latency. SVO totals are source-reported frontend + backend sums. Other missing totals are not reconstructed from stages.</p>
          <p>CPU and process memory retain source accounting. Cross-platform CPU normalization and memory RSS/PSS identity are unverified; GPU readings do not establish total energy use.</p>
          <p>Values average available per-selected-run summaries. Each source row lists five selected runs; per-metric contributing counts and total attempts are unreported. SD averages within-run population deviations, while p95 and peak values average per-run summaries. They are not pooled statistics, between-run variability, or confidence intervals.</p>
          <p>GrandTour uses the reported standard input; other input variants are unspecified. This source is not a complete configuration/input/platform matrix and has no DM-VIO resource rows.</p>
        </div>
      </details>

      {records.length ? (
        <div className="table-scroll">
          <table className="leaderboard resource-table">
            <caption className="sr-only">
              {selected ? `${selected.dataset} ${selected.sequence}, input variant ${selected.inputVariant}` : "All profiling inputs"}; {platform}; {mode}. Source order. Mean reported time, host CPU utilization, and process memory.
            </caption>
            <thead>
              <tr>
                <th scope="col">System</th>
                {showInput && <th scope="col">Input</th>}
                {showPlatform && <th scope="col">Platform</th>}
                {showMode && <th scope="col">Mode</th>}
                {metrics.map((metric) => <th scope="col" key={metric.id}>{metric.label}</th>)}
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <Fragment key={row.sourceRecordId}>
                  <tr>
                    <th scope="row">{systemName(row.system)}</th>
                    {showInput && <td>{row.dataset} · {row.sequence}<br /><span className="small">{row.inputVariant}</span></td>}
                    {showPlatform && <td>{row.platform}</td>}
                    {showMode && <td>{row.mode === "mono" ? "Mono" : "Stereo"}</td>}
                    {metrics.map((metric) => <td className="resource-score" key={metric.id}>{resourceMetricDisplay(row, metric.id)}</td>)}
                    <td>
                      <button
                        className="details-toggle"
                        aria-expanded={expanded === row.sourceRecordId}
                        aria-controls={`detail-${row.sourceRecordId}`}
                        onClick={() => setExpanded(expanded === row.sourceRecordId ? null : row.sourceRecordId)}
                      >
                        {expanded === row.sourceRecordId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        Details
                      </button>
                    </td>
                  </tr>
                  {expanded === row.sourceRecordId && (
                    <tr id={`detail-${row.sourceRecordId}`} className="expanded-result">
                      <td colSpan={columnCount}>
                        <div className="record-metadata">
                          <strong>{systemName(row.system)} · {row.platform} · {row.mode === "mono" ? "Mono" : "Stereo"}</strong>
                          <p>{row.dataset} · {row.sequence} · Input variant: {row.inputVariant}.</p>
                          <p>{row.sourceSelectedRuns} selected runs in the source row{row.selectedRunException ? " (source exception flagged)" : ""}; contributing runs for individual metrics and total attempts are unreported.</p>
                          <p>Timing: {row.timingDefinition === "frontend_plus_backend" ? "source-reported frontend + backend sum" : row.nativeTotalMs === null ? "native total unavailable" : "implementation-reported native total"}. SD, p95, and peak entries average per-run summaries.</p>
                          <p className="small">Source record: <code>{row.sourceRecordId}</code> · Revision: <code>{row.sourceRevision.slice(0, 12)}</code></p>
                        </div>
                        <div className="table-scroll detail-table">
                          <table>
                            <thead>
                              <tr>
                                <th scope="col">Statistic</th>
                                <th scope="col">Value</th>
                                <th scope="col">Unit</th>
                                <th scope="col">Source token</th>
                                <th scope="col">Source state</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(data.metricDefinitions).map(([key, definition]) => {
                                const sourceValue = row.sourceValues?.[key];
                                const status = resourceMetricStatus(row, key);
                                return (
                                  <tr key={key}>
                                    <th scope="row" style={{ position: "static", whiteSpace: "normal" }} title={`${definition.statistic}. ${definition.scope}`}>
                                      {key === "nativeTotalMs" && row.timingDefinition === "frontend_plus_backend" ? "Frontend + backend time · mean" : definition.label ?? extraLabels[key] ?? key}
                                    </th>
                                    <td>{resourceMetricDisplay(row, key)}</td>
                                    <td>{definition.unit}</td>
                                    <td><code>{sourceValue?.rawToken ?? "—"}</code></td>
                                    <td>{resourceStatusLabel(status)}{sourceValue && sourceValue.sourceStatus !== status ? ` · ${resourceStatusLabel(sourceValue.sourceStatus)}` : ""}</td>
                                  </tr>
                                );
                              })}
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
          <p>No source records for this selection. This does not establish failure or unsupported operation.</p>
          <button className="button secondary" onClick={() => change({ input: "all", platform: "all", mode: "all", system: "" })}>Show all records</button>
        </div>
      )}
    </div>
  );
}
