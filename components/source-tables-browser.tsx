"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import source from "@/public/data/source-tables.json";
import type { SourceTablesData } from "@/lib/results-types";
import { csvText } from "@/lib/leaderboards";
import { downloadText, updateQuery } from "./results-shared";
const data = source as SourceTablesData;
export function SourceTablesBrowser() {
  const [dataset, setDataset] = useState(data.datasets[0].id),
    [metric, setMetric] = useState("ATE (epa-drift valid)"),
    [group, setGroup] = useState("all"),
    [query, setQuery] = useState("");
  const metrics = Array.from(
    new Set(
      data.tables.filter((t) => t.datasetId === dataset).map((t) => t.metric),
    ),
  );
  const groups = Array.from(
    new Set(
      data.tables.filter((t) => t.datasetId === dataset).map((t) => t.group),
    ),
  );
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d =
      data.datasets.find((d) => d.id === q.get("dataset"))?.id ??
      data.datasets[0].id;
    setDataset(d);
    if (
      data.tables.some((t) => t.datasetId === d && t.metric === q.get("metric"))
    )
      setMetric(q.get("metric")!);
    if (
      data.tables.some((t) => t.datasetId === d && t.group === q.get("group"))
    )
      setGroup(q.get("group")!);
    setQuery(q.get("query") ?? "");
  }, []);
  function change(
    changes: Partial<{
      dataset: string;
      metric: string;
      group: string;
      query: string;
    }>,
  ) {
    const next = { dataset, metric, group, query, ...changes };
    if (changes.dataset) {
      next.group = "all";
      if (
        !data.tables.some(
          (t) => t.datasetId === next.dataset && t.metric === next.metric,
        )
      )
        next.metric = data.tables.find(
          (t) => t.datasetId === next.dataset,
        )!.metric;
    }
    setDataset(next.dataset);
    setMetric(next.metric);
    setGroup(next.group);
    setQuery(next.query);
    updateQuery(next);
  }
  const tables = data.tables
    .filter(
      (t) =>
        t.datasetId === dataset &&
        t.metric === metric &&
        (group === "all" || t.group === group),
    )
    .map((t) => ({
      ...t,
      rows: t.rows.filter((r) =>
        r.method.toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((t) => t.rows.length);
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
        <label className="field sequence-field">
          Original metric heading
          <select
            value={metric}
            onChange={(e) => change({ metric: e.target.value })}
          >
            {metrics.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Sequence group
          <select
            value={group}
            onChange={(e) => change({ group: e.target.value })}
          >
            <option value="all">All groups</option>
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Method label
          <input
            type="search"
            placeholder="Filter source method labels…"
            value={query}
            onChange={(e) => change({ query: e.target.value })}
          />
        </label>
      </div>
      <p className="result-reading-note">
        These tables retain the source report’s original protocols, method
        labels, numeric strings, missing states, and failure marks. The source
        “Average” is transcribed, not recomputed or used to build the main
        leaderboard. SR remains the source label; no success denominator or RPE
        unit is inferred here.
      </p>
      <p className="small" role="status">
        {tables.length} matching tables ·{" "}
        {tables.reduce((s, t) => s + t.rows.length, 0)} method rows
      </p>
      {tables.map((t) => (
        <section className="source-table-section" key={t.id}>
          <div className="source-table-heading">
            <div>
              <span className="eyebrow">
                {data.datasets.find((d) => d.id === t.datasetId)?.name}
              </span>
              <h2>{t.group}</h2>
              <p>{t.metric}</p>
            </div>
            <button
              className="button secondary"
              onClick={() =>
                downloadText(
                  csvText(
                    ["Method", ...t.columns],
                    t.rows.map((r) => [r.method, ...r.cells]),
                  ),
                  `vioverse-${t.id}.csv`,
                )
              }
            >
              <Download size={14} /> Export table
            </button>
          </div>
          <div className="table-scroll">
            <table className="source-table">
              <caption className="sr-only">
                {t.group}, {t.metric}; original source order
              </caption>
              <thead>
                <tr>
                  <th scope="col">METHOD (SOURCE)</th>
                  {t.columns.map((c) => (
                    <th key={c} scope="col">
                      {c === "Average" ? "AVERAGE (SOURCE)" : c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r) => (
                  <tr key={r.method}>
                    <th scope="row">{r.method}</th>
                    {r.cells.map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {!tables.length && (
        <div className="empty">
          <h2>No matching source rows.</h2>
          <p>Try another metric, group, or method label.</p>
          <button
            className="button secondary"
            onClick={() => change({ query: "", group: "all" })}
          >
            Clear method and group filters
          </button>
        </div>
      )}
      <div className="data-links">
        <a href="/data/source-tables.json" download>
          Download all 157 source tables (JSON)
        </a>
      </div>
      <p className="note-line">
        Transcribed from committed Results revision{" "}
        {data.source.revision.slice(0, 12)}. Displaying a value under its
        original heading does not independently validate the underlying run or
        metric implementation.
      </p>
    </>
  );
}
