"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import source from "@/public/data/current-results.json";
import { csvText } from "@/lib/leaderboards";
import { downloadText, updateQuery } from "./results-shared";

type CoverageRow = {
  configurationId: string;
  datasetId: string;
  value: number | null;
  valueText?: string;
  effectiveValueText?: string;
  sequenceCount?: number;
  expectedRuns?: number;
  validRuns?: number;
  missingRuns?: number;
  invalidRuns?: number;
  group?: string;
  sequence?: string;
  run?: string | number;
  rawValue?: number | string | null;
  rawValueText?: string;
  status?: string;
};
const data = source;
const pageSize = 50;
const modeLabel = (mode?: string) => mode === "mono" ? "Monocular" : mode === "stereo" ? "Stereo" : mode;
const valueText = (row: CoverageRow) => row.valueText ?? row.effectiveValueText ?? (row.value === null ? "—" : String(row.value));

export function CurrentResultsBrowser() {
  const [view, setView] = useState("summary");
  const [dataset, setDataset] = useState("all");
  const [mode, setMode] = useState("all");
  const [system, setSystem] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (["summary", "sequence", "run"].includes(q.get("view") ?? "")) setView(q.get("view")!);
    if (data.datasets.some(d => d.id === q.get("dataset"))) setDataset(q.get("dataset")!);
    if (data.configurations.some(c => c.mode === q.get("mode"))) setMode(q.get("mode")!);
    if (data.configurations.some(c => c.system === q.get("system"))) setSystem(q.get("system")!);
    setQuery(q.get("query") ?? "");
  }, []);

  function change(changes: Partial<Record<"view" | "dataset" | "mode" | "system" | "query", string>>) {
    const next = { view, dataset, mode, system, query, ...changes };
    setView(next.view); setDataset(next.dataset); setMode(next.mode);
    setSystem(next.system); setQuery(next.query); setPage(0);
    updateQuery(next);
  }

  const allRows: CoverageRow[] = view === "summary" ? data.coverage.aggregates : view === "sequence" ? data.coverage.sequences : data.coverage.runs;
  const configuration = (row: CoverageRow) => data.configurations.find(c => c.id === row.configurationId);
  const datasetName = (row: CoverageRow) => data.datasets.find(d => d.id === row.datasetId)?.label ?? row.datasetId;
  const rows = allRows.filter(row => {
    const config = configuration(row);
    return (dataset === "all" || row.datasetId === dataset)
      && (mode === "all" || config?.mode === mode)
      && (system === "all" || config?.system === system)
      && (view === "summary" || !query || `${row.group ?? ""} ${row.sequence ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  });
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  function exportRows() {
    const fields = ["dataset", "configuration", "system", "camera_mode", "group", "sequence", "run", "SR_percent", "reported_sequences", "expected_runs", "valid_SR_runs", "missing_SR_runs", "invalid_SR_runs", "status", "raw_SR_percent"];
    downloadText(csvText(fields, rows.map(row => [datasetName(row), row.configurationId, configuration(row)?.system, configuration(row)?.mode, row.group, row.sequence, row.run, valueText(row), row.sequenceCount, row.expectedRuns, row.validRuns, row.missingRuns, row.invalidRuns, row.status, row.rawValueText ?? row.rawValue])), `vioverse-sr-${view}.csv`);
  }

  return <>
    <div className="filters results-filters">
      <label className="field">Table<select value={view} onChange={e => change({ view: e.target.value })}><option value="summary">Dataset means</option><option value="sequence">Sequence means</option><option value="run">Individual runs</option></select></label>
      <label className="field">Dataset<select value={dataset} onChange={e => change({ dataset: e.target.value })}><option value="all">All datasets</option>{data.datasets.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
      <label className="field">Camera mode<select value={mode} onChange={e => change({ mode: e.target.value })}><option value="all">All modes</option>{Array.from(new Set(data.configurations.map(c => c.mode))).map(m => <option key={m} value={m}>{modeLabel(m)}</option>)}</select></label>
      <label className="field">System<select value={system} onChange={e => change({ system: e.target.value })}><option value="all">All systems</option>{Array.from(new Set(data.configurations.map(c => c.system))).map(s => <option key={s}>{s}</option>)}</select></label>
      {view !== "summary" && <label className="field">Sequence or group<input type="search" value={query} placeholder="Find a sequence…" onChange={e => change({ query: e.target.value })} /></label>}
    </div>
    <p className="result-reading-note">SR is a percentage of the full reference path. The mean uses three expected runs per sequence, with missing or invalid SR values contributing zero. “Valid” identifies a usable SR measurement. <Link href="/results/current/#definitions">Metric definition</Link>.</p>
    <div className="result-context"><span role="status">{rows.length.toLocaleString()} matching rows</span><button className="button secondary" onClick={exportRows} disabled={!rows.length}>Download matching rows (CSV)</button><button className="button secondary" onClick={() => change({ view: "summary", dataset: "all", mode: "all", system: "all", query: "" })}>Reset filters</button></div>
    <p className="small">Showing {rows.length ? currentPage * pageSize + 1 : 0}–{Math.min((currentPage + 1) * pageSize, rows.length)} of {rows.length.toLocaleString()} rows. Downloads include every matching row. Values retain source precision.</p>
    <div className="table-scroll"><table className="leaderboard current-results-table">
      <caption className="sr-only">Reference-path coverage, {view === "summary" ? "dataset means" : view === "sequence" ? "sequence means" : "individual runs"}</caption>
      <thead><tr><th scope="col">Dataset{view !== "summary" ? " / sequence" : ""}</th><th scope="col">System</th><th scope="col">Camera mode</th><th scope="col">SR (%)</th>{view === "run" ? <><th scope="col">State</th><th scope="col">Raw SR (%)</th></> : <>{view === "summary" && <th scope="col">Sequences</th>}<th scope="col">Expected runs</th><th scope="col">Valid / missing / invalid</th></>}</tr></thead>
      <tbody>{visible.map((row, i) => <tr key={`${currentPage}-${i}`}><th scope="row">{datasetName(row)}{row.sequence && <><br /><span className="small">{row.group} / {row.sequence}{row.run !== undefined ? ` · ${row.run}` : ""}</span></>}</th><td>{configuration(row)?.system ?? row.configurationId}</td><td>{modeLabel(configuration(row)?.mode)}</td><td className="score">{valueText(row)}</td>{view === "run" ? <><td>{row.status}</td><td>{row.rawValueText ?? row.rawValue ?? "—"}</td></> : <>{view === "summary" && <td>{row.sequenceCount ?? "—"}</td>}<td>{row.expectedRuns ?? "—"}</td><td>{row.validRuns ?? "—"} / {row.missingRuns ?? "—"} / {row.invalidRuns ?? "—"}</td></>}</tr>)}</tbody>
    </table></div>
    {!rows.length && <p className="empty">No reported rows match these filters.</p>}
    <nav className="result-context" aria-label="SR table pages"><button className="button secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage + 1} of {pageCount}</span><button className="button secondary" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></nav>
  </>;
}
