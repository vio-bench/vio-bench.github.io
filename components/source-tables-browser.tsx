"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import source from "@/public/data/current-source-tables.json";
import configurations from "@/public/data/current-results.json";
import type { SourceTablesData } from "@/lib/results-types";
import { trajectoryCell, trajectoryIdentity, type MotionComponent } from "@/lib/trajectory-display";
import { updateQuery } from "./results-shared";
const data = source as SourceTablesData;
const configs = configurations.configurations;
const defaults = { dataset: "euroc", mode: "mono", family: "ATE", component: "translation", length: "10", group: "all", system: "all", sequence: "", view: "sequences" };
const systemName = (s: string) => s === "sqrtVINS" ? "√VINS" : s === "Basalt" ? "BASALT" : s;

export function SourceTablesBrowser() {
  const q = useSearchParams();
  const dataset = data.datasets.some(d => d.id === q.get("dataset")) || q.get("dataset") === "all" ? q.get("dataset")! : defaults.dataset;
  const mode = ["mono", "stereo", "all"].includes(q.get("mode") ?? "") ? q.get("mode")! : defaults.mode;
  const family = q.get("family") === "RPE" || q.get("metric")?.startsWith("RPE") ? "RPE" : "ATE";
  const component: MotionComponent = q.get("component") === "rotation" ? "rotation" : "translation";
  const available = data.tables.filter(t => dataset === "all" || t.datasetId === dataset);
  const groups = [...new Set(available.map(t => t.group))];
  const group = groups.includes(q.get("group") ?? "") ? q.get("group")! : "all";
  const lengths = [...new Set(available.filter(t => (group === "all" || t.group === group) && trajectoryIdentity(t).family === "RPE").map(t => trajectoryIdentity(t).length))].sort((a, b) => a - b);
  const requested = Number(q.get("length") ?? q.get("metric")?.match(/,\s*(\d+)\s*m/)?.[1] ?? 10);
  const length = lengths.includes(requested) ? requested : lengths[0] ?? 10;
  const system = configs.some(c => c.system === q.get("system")) ? q.get("system")! : "all";
  const sequence = q.get("sequence") ?? "";
  const summaryAvailable = family === "ATE" || length === 10;
  const summary = q.get("view") === "summary" && summaryAvailable;
  const legacyQuery = (q.get("query") ?? "").toLowerCase().trim();
  const filters = { dataset, mode, family, component, length: String(length), group, system, sequence, view: summary ? "summary" : "sequences" };
  function change(changes: Partial<typeof defaults>) { updateQuery({ ...filters, ...changes }); }
  const tables = available.filter(t => {
    const id = trajectoryIdentity(t);
    return id.family === family && (family === "ATE" || id.length === length) && (group === "all" || t.group === group)
      && (!sequence || t.columns.some(c => c !== "Average" && c.toLowerCase().includes(sequence.toLowerCase())));
  }).map(t => {
    const indices = t.columns.flatMap((c, i) => !sequence || c === "Average" || c.toLowerCase().includes(sequence.toLowerCase()) ? [i] : []);
    return { ...t, columns: indices.map(i => t.columns[i]), rows: t.rows.filter(r => {
      const c = configs.find(c => c.id === r.method);
      return (mode === "all" || c?.mode === mode) && (system === "all" || c?.system === system) && (!legacyQuery || (r.method + " " + (c?.system ?? "")).toLowerCase().includes(legacyQuery));
    }).sort((a, b) => configs.findIndex(c => c.id === a.method) - configs.findIndex(c => c.id === b.method)).map(r => ({ ...r, cells: indices.map(i => r.cells[i]) })) };
  }).filter(t => t.rows.length);
  const label = family === "ATE" ? component === "translation" ? "Position" : "Orientation" : component === "translation" ? "Translation" : "Rotation";
  const unit = component === "translation" ? "m" : "deg";
  const meanRows = family === "ATE" ? configurations.accuracy.aggregates : configurations.rpe10.aggregates;
  const meanMetric = family === "ATE" ? component === "translation" ? "position_ate" : "orientation_ate" : component === "translation" ? "translation_rpe" : "rotation_rpe";
  const meanDatasets = data.datasets.filter(d => dataset === "all" || d.id === dataset);
  const meanConfigs = configs.filter(c => (mode === "all" || c.mode === mode) && (system === "all" || c.system === system));
  return <>
    <div className="result-view-switch" role="group" aria-label="Trajectory result view">
      <button aria-pressed={!summary} onClick={() => change({ view: "sequences" })}>Sequence tables</button>
      <button aria-pressed={summary} disabled={!summaryAvailable} title={!summaryAvailable ? "Dataset means are supplied for ATE and 10 m RPE. Other lengths remain available in sequence tables." : undefined} onClick={() => change({ view: "summary", dataset: "all", group: "all", sequence: "" })}>Dataset means</button>
    </div>
    <div className="filters results-filters compact-results-filters">
      <label className="field">Dataset<select value={dataset} onChange={e => change({ dataset: e.target.value, group: "all", sequence: "" })}><option value="all">All datasets</option>{data.datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
      <label className="field">Mode<select value={mode} onChange={e => change({ mode: e.target.value })}><option value="mono">Mono</option><option value="stereo">Stereo</option><option value="all">Both</option></select></label>
      <label className="field">Metric<select value={family} onChange={e => change({ family: e.target.value })}><option>ATE</option><option>RPE</option></select></label>
      <label className="field">Component<select value={component} onChange={e => change({ component: e.target.value })}><option value="translation">{family === "ATE" ? "Position" : "Translation"} (m)</option><option value="rotation">{family === "ATE" ? "Orientation" : "Rotation"} (deg)</option></select></label>
      {family === "RPE" && <label className="field">Segment length<select value={length} onChange={e => change({ length: e.target.value })}>{lengths.map(n => <option key={n} value={n}>{n} m</option>)}</select></label>}
    </div>
    {!summary && <div className="results-secondary-filters">
      <label className="field">Group<select value={group} onChange={e => change({ group: e.target.value, sequence: "" })}><option value="all">All groups</option>{groups.map(g => <option key={g}>{g}</option>)}</select></label>
      <label className="field">System<select value={system} onChange={e => change({ system: e.target.value })}><option value="all">All systems</option>{[...new Set(configs.map(c => c.system))].map(s => <option key={s} value={s}>{systemName(s)}</option>)}</select></label>
      <label className="field">Sequence<input type="search" placeholder="Find a sequence" value={sequence} onChange={e => change({ sequence: e.target.value })} /></label>
      <button className="button secondary" onClick={() => updateQuery(defaults)}>Reset</button>
    </div>}
    <div className="result-context"><span role="status">{summary ? meanConfigs.length + " configurations · dataset means" : tables.length + " groups · " + tables.reduce((n, t) => n + t.rows.length, 0) + " configuration rows"} · {label} {family} ({unit}){family === "RPE" ? " · " + length + " m segments" : ""}</span></div>
    {summary && <div className="table-scroll"><table className="source-table trajectory-values-table dataset-means-table">
      <caption className="sr-only">Dataset means of finite sequence RMSEs. Select a mean to inspect its sequence results.</caption>
      <thead><tr><th scope="col">System</th><th scope="col">Mode</th>{meanDatasets.map(d => <th scope="col" key={d.id}>{d.name}</th>)}</tr></thead>
      <tbody>{meanConfigs.map(c => <tr key={c.id}><th scope="row">{systemName(c.system)}</th><td className="mode-label">{c.mode === "mono" ? "Mono" : "Stereo"}</td>{meanDatasets.map(d => {
        const r = meanRows.find(r => r.datasetId === d.id && r.configurationId === c.id && r.metric === meanMetric);
        const absent = r?.missingStatus === "no_configuration_records" || r?.missingStatus === "absent_configuration";
        return <td key={d.id} title={r ? "Exact mean: " + (r.valueText ?? "—") + "; finite sequence contributions: " + r.n + "/" + r.sequenceCount + "; " + r.missingStatus : "No source record"}>{absent || !r ? <span className="missing-mean" aria-label="No source configuration">—</span> : <Link href={"/results/tables/?" + new URLSearchParams({ dataset: d.id, mode: c.mode, system: c.system, family, component, length: String(length), view: "sequences" }).toString()}>{r.value === null ? "—" : Number(r.value.toPrecision(4)).toString()}{typeof r.n === "number" && r.n < r.sequenceCount && <small className="result-contribution">({r.n}/{r.sequenceCount})</small>}</Link>}</td>;
      })}</tr>)}</tbody>
    </table></div>}
    {!summary && tables.map(t => <section className="trajectory-result-group" key={t.id}>
      <h2>{data.datasets.find(d => d.id === t.datasetId)?.name} <span> / {t.group}</span></h2>
      <div className="table-scroll"><table className="source-table trajectory-values-table">
        <caption className="sr-only">{t.group}: {label} {family} in {unit}. Reported group mean stays unchanged when sequence columns are filtered.</caption>
        <thead><tr><th scope="col">System</th><th scope="col">Mode</th>{t.columns.map(c => <th scope="col" key={c} className={c === "Average" ? "reported-mean" : "sequence-column"}>{c === "Average" ? <>Reported<br />group mean</> : c}</th>)}</tr></thead>
        <tbody>{t.rows.map(r => {
          const c = configs.find(c => c.id === r.method);
          return <tr key={r.method}><th scope="row" title={r.method}>{systemName(c?.system ?? r.method)}</th><td className="mode-label">{c?.mode === "mono" ? "Mono" : "Stereo"}</td>{r.cells.map((raw, i) => {
            const cell = trajectoryCell(raw, component);
            return <td key={i} className={t.columns[i] === "Average" ? "reported-mean" : ""} title={cell.title}>{cell.value}{cell.stars && <sup className="result-annotation">{cell.stars}</sup>}{cell.contribution && <small className="result-contribution">({cell.contribution})</small>}</td>;
          })}</tr>;
        })}</tbody>
      </table></div>
    </section>)}
    {!summary && !tables.length && <p className="empty">No reported configurations match this selection.</p>}
    <details className="result-notes" id="calculation"><summary>Notes — metrics and aggregation</summary>
      <p>ATE and RPE use drift-valid portions after temporal association and SE(3) alignment without scale fitting. Only runs with SR ≥ 75% contribute. Retained error samples are pooled within each sequence to compute RMSE; dataset means equally weight finite sequence RMSEs. RPE is not divided by segment length.</p>
      <p>Sequence values retain source precision. Dataset means are displayed to four significant digits; their exact supplied values and finite-sequence counts are available on hover. Dataset summaries are supplied for ATE and 10 m RPE. Select a mean to inspect its sequence results.</p>
      <p>Each asterisk marks one run excluded for SR &lt; 75%. Parentheses retain contribution counts, not successful attempts. A dash means no finite reported value; it does not by itself identify execution failure. Gray entries in dataset means have no source configuration.</p>
      <p>The reported group mean comes directly from the source and does not change when sequence columns are filtered. <Link href="/results/current/">SR results</Link> use a separate three-expected-run aggregation.</p>
    </details>
  </>;
}
