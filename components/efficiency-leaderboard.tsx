"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import source from "@/public/data/efficiency.json";
import type {
  EfficiencyData,
  EfficiencyMetric,
  CameraMode,
} from "@/lib/results-types";
import { rankValues, csvText } from "@/lib/leaderboards";
import { downloadText, formatReported, updateQuery } from "./results-shared";
const data = source as unknown as EfficiencyData;
const metrics: { id: EfficiencyMetric; label: string; unit: string }[] = [
  { id: "nativeTotalMs", label: "Native total time", unit: "ms" },
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
  const initial = data.inputs.find((x) => x.dataset === "LaMAria")!.id;
  const [input, setInput] = useState(initial),
    [platform, setPlatform] = useState("Desktop"),
    [mode, setMode] = useState<CameraMode>("mono"),
    [metric, setMetric] = useState<EfficiencyMetric>("nativeTotalMs"),
    [expanded, setExpanded] = useState<string | null>(null);
  const platforms = ["Desktop", "Jetson Orin", "Jetson Nano"];
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (data.inputs.some((i) => i.id === q.get("input")))
      setInput(q.get("input")!);
    if (platforms.includes(q.get("platform")!)) setPlatform(q.get("platform")!);
    if (q.get("mode") === "stereo") setMode("stereo");
    if (metrics.some((m) => m.id === q.get("metric")))
      setMetric(q.get("metric") as EfficiencyMetric);
  }, []);
  function change(
    changes: Partial<{
      input: string;
      platform: string;
      mode: CameraMode;
      metric: EfficiencyMetric;
    }>,
  ) {
    const next = { input, platform, mode, metric, ...changes };
    setInput(next.input);
    setPlatform(next.platform);
    setMode(next.mode);
    setMetric(next.metric);
    setExpanded(null);
    updateQuery(next);
  }
  const selected = data.inputs.find((i) => i.id === input)!;
  const metricInfo = metrics.find((m) => m.id === metric)!;
  const records = rankValues(
    data.rows
      .filter(
        (r) =>
          r.inputId === input && r.platform === platform && r.mode === mode,
      )
      .map((row) => ({ ...row, value: row[metric] })),
  );
  const max = Math.max(
    ...records.filter((r) => r.value !== null).map((r) => r.value as number),
    1,
  );
  function download() {
    downloadText(
      csvText(
        [
          "source_revision",
          "system",
          "mode",
          "platform",
          "dataset",
          "sequence",
          "input_variant",
          "native_total_ms",
          "reported_cpu_percent",
          "reported_process_memory_mib",
          "source_selected_runs",
          "per_metric_contributing_runs",
        ],
        records.map((r) => [
          data.release.sourceRevision,
          r.system,
          r.mode,
          r.platform,
          r.dataset,
          r.sequence,
          r.inputVariant,
          r.nativeTotalMs,
          r.reportedCpuPercent,
          r.reportedProcessMemoryMiB,
          r.sourceSelectedRuns,
          null,
        ]),
      ),
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
            {platforms.map((p) => (
              <option key={p}>{p}</option>
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
          Sort by reported mean
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
        <span className="tag">Input variant: {selected.inputVariant}</span>
        <span role="status">
          {records.length} actual source rows ·{" "}
          {records.filter((r) => r.value !== null).length} with{" "}
          {metricInfo.label.toLowerCase()}
        </span>
        <button className="button secondary" onClick={download}>
          <Download size={14} /> Export selected results
        </button>
      </div>
      <p className="result-reading-note">
        These measurements describe one fixed profiling sequence. Native timing
        boundaries differ between implementations. CPU normalization and the
        process-memory collector definition are not verified as equivalent
        across platforms.
      </p>
      {records.length ? (
        <div className="table-scroll">
          <table className="leaderboard">
            <caption className="sr-only">
              {selected.dataset} {selected.sequence}, {platform}, {mode}.
              Ordered by {metricInfo.label}.
            </caption>
            <thead>
              <tr>
                <th scope="col">ORDER</th>
                <th scope="col">SYSTEM</th>
                <th scope="col">
                  {metricInfo.label.toUpperCase()} ({metricInfo.unit}) ↓
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
                    <td className="rank">{r.rank ?? "—"}</td>
                    <th scope="row">{r.system}</th>
                    <td className="score resource-score">
                      {r.value !== null && (
                        <span
                          className="runtime-bar"
                          aria-hidden="true"
                          style={{ width: (90 * r.value) / max }}
                        />
                      )}
                      {formatReported(r.value)}
                    </td>
                    {metrics
                      .filter((m) => m.id !== metric)
                      .map((m) => (
                        <td key={m.id}>{formatReported(r[m.id])}</td>
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
                      <td colSpan={7}>
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
                                <th>EXTENDED REPORTED STATISTIC</th>
                                <th>VALUE</th>
                                <th>UNIT</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(r.extendedMetrics ?? {}).map(
                                ([key, value]) => (
                                  <tr key={key}>
                                    <td>{extraLabels[key] ?? key}</td>
                                    <td>{formatReported(value)}</td>
                                    <td>{data.metricDefinitions[key]?.unit}</td>
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
            onClick={() => change({ mode: "mono" })}
          >
            View monocular records
          </button>
        </div>
      )}
      <p className="note-line">
        Missing native totals stay blank; tracking and estimation stages are
        never added to fill them. † One selected source run, instead of the
        usual five. Bar lengths rescale within the current selection.{" "}
        <Link href="/benchmark/protocol/">Read measurement definitions →</Link>
      </p>
      <div className="data-links">
        <a href="/data/efficiency.json" download>
          All 164 resource records + metadata (JSON)
        </a>
      </div>
    </>
  );
}
