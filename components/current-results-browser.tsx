"use client";
import { Fragment } from "react";
import { useSearchParams } from "next/navigation";
import source from "@/public/data/current-results.json";
import { updateQuery } from "./results-shared";

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
type View = "summary" | "sequence" | "run";
const data = source;
const pageSize = 50;
const configurations = new Map(data.configurations.map(c => [c.id, c]));
const datasets = new Map(data.datasets.map(d => [d.id, d.label]));
const systems = Array.from(new Set(data.configurations.map(c => c.system)));
const systemLabel = (system?: string) => system === "sqrtVINS" ? "√VINS" : system === "Basalt" ? "BASALT" : system;
const modeLabel = (mode?: string) => mode === "mono" ? "Mono" : mode === "stereo" ? "Stereo" : mode ?? "—";
const rowKey = (row: CoverageRow) => [row.datasetId, row.configurationId, row.group, row.sequence].join("|");
const exactValue = (row: CoverageRow) => row.valueText ?? row.effectiveValueText ?? (row.value === null ? "—" : String(row.value));
const formatSR = (value: number | null) => value === null ? "—" : value.toFixed(2);
const rawValue = (row: CoverageRow) => row.rawValueText || (row.rawValue === null || row.rawValue === undefined ? "—" : String(row.rawValue));
const rawDisplay = (row: CoverageRow) => typeof row.rawValue === "number" && Number.isFinite(row.rawValue) ? formatSR(row.rawValue) : rawValue(row);
const statusLabel = (row: CoverageRow) => row.status === "valid" ? "Finite" : row.status === "missing" ? "Missing" : row.status === "invalid" ? "Invalid" : row.status ?? "—";
const groupNames: Record<string, string> = {
  aqualoc__archaeo__archaeo1: "Archaeo-1", aqualoc__archaeo__archaeo2: "Archaeo-2", aqualoc__harbor: "Harbor",
  euroc_mav__machine_hall: "Machine Hall", euroc_mav__vicon_room: "Vicon Room",
  lamaria__add: "Additional", lamaria__cp: "CP", lamaria__easy: "Easy", lamaria__hard: "Hard", lamaria__medium: "Medium",
  uzhfpv__uzhfpv_indoor: "Indoor", uzhfpv__uzhfpv_indoor_45: "Indoor45", uzhfpv__uzhfpv_outdoor: "Outdoor", uzhfpv__uzhfpv_outdoor_45: "Outdoor45",
};
for (let group = 1; group <= 7; group++) groupNames[`grand_tour__group${group}`] = `Group ${group}`;
const groupLabel = (group?: string) => group ? groupNames[group] ?? group : "";
const sequenceRuns = new Map<string, CoverageRow[]>();
for (const row of data.coverage.runs) {
  const key = rowKey(row);
  const runs = sequenceRuns.get(key) ?? [];
  runs.push(row);
  sequenceRuns.set(key, runs);
}

function RunTable({ runs, sequence }: { runs: CoverageRow[]; sequence?: string }) {
  return <div className="sr-run-detail">
    <table className="sr-runs-table">
      <caption className="sr-only">Individual SR values for {sequence}</caption>
      <thead><tr><th scope="col">Run</th><th scope="col">Effective SR (%)</th><th scope="col">Raw SR (%)</th><th scope="col">State</th></tr></thead>
      <tbody>{runs.map(run => <tr key={String(run.run)}>
        <th scope="row">{run.run}</th>
        <td className="score" title={`Exact effective SR: ${exactValue(run)}`}>{formatSR(run.value)}</td>
        <td className="score" title={`Exact raw SR: ${rawValue(run)}`}>{rawDisplay(run)}</td>
        <td title={`Source status: ${run.status ?? "unreported"}`}>{statusLabel(run)}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}

export function CurrentResultsBrowser() {
  const params = useSearchParams();
  const viewParam = params.get("view");
  const view: View = viewParam === "sequence" || viewParam === "run" ? viewParam : "summary";
  const datasetParam = params.get("dataset");
  const dataset = datasetParam === "all" || data.datasets.some(d => d.id === datasetParam) ? datasetParam! : "euroc";
  const modeParam = params.get("mode");
  const mode = modeParam === "all" || modeParam === "stereo" || modeParam === "mono" ? modeParam : "mono";
  const systemParam = params.get("system");
  const system = systemParam && systems.includes(systemParam) ? systemParam : "all";
  const query = params.get("query") ?? "";
  const expanded = params.get("detail") ?? "";
  const pageParam = Number(params.get("page") ?? 0);
  const page = Number.isInteger(pageParam) && pageParam >= 0 ? pageParam : 0;
  const datasetName = (row: CoverageRow) => datasets.get(row.datasetId) ?? row.datasetId;
  const configuration = (row: CoverageRow) => configurations.get(row.configurationId);

  function change(changes: Partial<Record<"view" | "dataset" | "mode" | "system" | "query" | "page" | "detail", string>>, retainPage = false) {
    updateQuery({ view, dataset, mode, system, query, page: retainPage ? String(page) : "0", detail: "", ...changes });
  }

  const allRows: CoverageRow[] = view === "summary" ? data.coverage.aggregates : view === "sequence" ? data.coverage.sequences : data.coverage.runs;
  const rows = allRows.filter(row => {
    const config = configuration(row);
    const searchable = `${row.group ?? ""} ${groupLabel(row.group)} ${row.sequence ?? ""}`.toLowerCase();
    return (dataset === "all" || row.datasetId === dataset)
      && (mode === "all" || config?.mode === mode)
      && (system === "all" || config?.system === system)
      && (view === "summary" || !query || searchable.includes(query.toLowerCase()));
  }).sort((a, b) => data.datasets.findIndex(d => d.id === a.datasetId) - data.datasets.findIndex(d => d.id === b.datasetId)
    || data.configurations.findIndex(c => c.id === a.configurationId) - data.configurations.findIndex(c => c.id === b.configurationId));
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const showDataset = dataset === "all";
  const columns = (showDataset ? 1 : 0) + (view === "summary" ? 4 : view === "sequence" ? 5 : 7);

  return <div className="sr-results">
    <div className="filters results-filters">
      <label className="field">View<select value={view} onChange={e => change({ view: e.target.value })}>
        <option value="summary">Dataset means</option><option value="sequence">Sequence means</option><option value="run">Individual runs</option>
      </select></label>
      <label className="field">Dataset<select value={dataset} onChange={e => change({ dataset: e.target.value })}>
        {data.datasets.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}<option value="all">All datasets</option>
      </select></label>
      <label className="field">Mode<select value={mode} onChange={e => change({ mode: e.target.value })}>
        <option value="mono">Mono</option><option value="stereo">Stereo</option><option value="all">All modes</option>
      </select></label>
      <label className="field">System<select value={system} onChange={e => change({ system: e.target.value })}>
        <option value="all">All systems</option>{systems.map(s => <option key={s} value={s}>{systemLabel(s)}</option>)}
      </select></label>
      {view !== "summary" && <label className="field">Sequence<input type="search" value={query} placeholder="Sequence or group" onChange={e => change({ query: e.target.value })} /></label>}
    </div>
    <div className="result-context">
      <span role="status">{rows.length.toLocaleString()} record{rows.length === 1 ? "" : "s"}{pageCount > 1 ? ` · ${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, rows.length)}` : ""}</span>
      <button className="button secondary" onClick={() => change({ view: "summary", dataset: "euroc", mode: "mono", system: "all", query: "" })}>Reset</button>
    </div>
    <details className="result-reading-note" id="definitions">
      <summary>Notes</summary>
      <p>{data.protocols.coverage.definition}</p>
      <p>Each sequence averages three expected run slots; missing or invalid SR contributes zero. Dataset means equally weight sequences. Unreported configurations remain unreported.</p>
      <p>“Finite” includes zero and values below 75%. Effective SR enters the mean; raw SR and its state are retained separately. Hover for exact precision.</p>
    </details>
    <div className="table-scroll"><table className="leaderboard current-results-table">
      <caption className="sr-only">SR reference-path coverage: {view === "summary" ? "dataset means" : view === "sequence" ? "sequence means" : "individual runs"}</caption>
      <thead><tr>
        {showDataset && <th scope="col">Dataset</th>}
        {view !== "summary" && <th scope="col">Sequence</th>}
        <th scope="col">System</th><th scope="col">Mode</th><th scope="col">{view === "run" ? "Effective SR (%)" : "Mean SR (%)"}</th>
        {view === "summary" ? <th scope="col">Seq.</th> : view === "sequence" ? <th scope="col">Runs</th> : <><th scope="col">Run</th><th scope="col">Raw SR (%)</th><th scope="col">State</th></>}
      </tr></thead>
      <tbody>{visible.map(row => {
        const id = rowKey(row);
        const runs = sequenceRuns.get(id) ?? [];
        return <Fragment key={`${id}|${row.run ?? "summary"}`}>
          <tr>
            {showDataset && <td>{datasetName(row)}</td>}
            {view !== "summary" && <th scope="row"><span>{row.sequence}</span><br /><span className="small" title={row.group}>{groupLabel(row.group)}</span></th>}
            {view === "summary" ? <th scope="row">{systemLabel(configuration(row)?.system) ?? row.configurationId}</th> : <td>{systemLabel(configuration(row)?.system) ?? row.configurationId}</td>}
            <td>{modeLabel(configuration(row)?.mode)}</td>
            <td className="score" title={`Exact ${view === "run" ? "effective" : "mean"} SR: ${exactValue(row)}`}>{formatSR(row.value)}</td>
            {view === "summary" ? <td>{row.sequenceCount ?? "—"}</td> : view === "sequence" ? <td><button className="details-toggle" aria-expanded={expanded === id} aria-label={`${expanded === id ? "Hide" : "Show"} runs for ${row.sequence}, ${systemLabel(configuration(row)?.system)} ${modeLabel(configuration(row)?.mode)}`} onClick={() => change({ detail: expanded === id ? "" : id, page: String(currentPage) }, true)}>{expanded === id ? "Hide runs" : `${runs.length} runs`}</button></td> : <><td>{row.run}</td><td className="score" title={`Exact raw SR: ${rawValue(row)}`}>{rawDisplay(row)}</td><td title={`Source status: ${row.status}`}>{statusLabel(row)}</td></>}
          </tr>
          {view === "sequence" && expanded === id && <tr className="sr-detail-row"><td colSpan={columns}><RunTable runs={runs} sequence={row.sequence} /></td></tr>}
        </Fragment>;
      })}</tbody>
    </table></div>
    {!rows.length && <p className="empty">No reported SR records match these filters.</p>}
    {pageCount > 1 && <nav className="result-context" aria-label="SR table pages">
      <button className="button secondary" disabled={currentPage === 0} onClick={() => change({ page: String(currentPage - 1) }, true)}>Previous</button>
      <span>Page {currentPage + 1} of {pageCount}</span>
      <button className="button secondary" disabled={currentPage + 1 >= pageCount} onClick={() => change({ page: String(currentPage + 1) }, true)}>Next</button>
    </nav>}
  </div>;
}
