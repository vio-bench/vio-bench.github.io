import Link from "next/link";
import source from "@/public/data/current-paper-accuracy.json";

type ExampleRecord = {
  configurationId: string;
  system: string;
  mode: string;
  datasetId: string;
  group: string;
  metric: string;
  unit: string;
  value: number | null;
  valueText: string;
  displayValue: string;
  missingStatus: string;
};
type CoverageRecord = ExampleRecord & { sequence: string; displaySequence: string; excludedRunCount: number | null };
const components = source.objects.tableIII.records as ExampleRecord[];
const relative = source.objects.tableIV.records as ExampleRecord[];
const coverage = source.objects.figure4.records as CoverageRecord[];
const systemName = (system: string) => system === "sqrtVINS" ? "√VINS" : system;

function valueCell(record: ExampleRecord | undefined) {
  return <td title={record ? `Exact source value: ${record.valueText} ${record.unit}; ${record.missingStatus}` : "No source value"}>{record?.value === null || !record ? "—" : record.displayValue}</td>;
}

function trajectoryUrl(record: ExampleRecord) {
  const isRpe = record.metric.endsWith("rpe");
  const rotation = record.metric === "orientation_ate" || record.metric === "rotation_rpe";
  const summary = record.group === "All sequences";
  return "/results/tables/?" + new URLSearchParams({ dataset: record.datasetId, mode: record.mode, system: record.system,
    family: isRpe ? "RPE" : "ATE", component: rotation ? "rotation" : "translation", length: "10",
    group: summary ? "all" : record.group, view: summary ? "summary" : "sequences" }).toString();
}

export function PaperAccuracyExamples() {
  const componentSystems = [...new Set(components.map(record => record.configurationId))];
  const relativeCases = [
    { dataset: "lamaria", group: "CP", label: "LaMAria CP", scope: "Mono · 3 sequences" },
    { dataset: "euroc", group: "Machine Hall", label: "EuRoC Machine Hall", scope: "Stereo · 5 sequences" },
  ];
  const sequences = [...new Set(coverage.map(record => record.sequence))];
  const coverageValue = (sequence: string, cid: string, metric: string) => coverage.find(record => record.sequence === sequence && record.configurationId === cid && record.metric === metric);

  return <>
    <section className="paper-results-section" id="paper-table-iii">
      <h2>Position and orientation <span> / Table III · Mono</span></h2>
      <div className="table-scroll"><table className="source-table paper-example-table">
        <caption className="sr-only">Installed Table III values: EuRoC position and orientation ATE; LaMAria Medium translational and rotational RPE over 10 m segments.</caption>
        <thead>
          <tr><th rowSpan={2} scope="col">System</th><th colSpan={2} scope="colgroup">EuRoC ATE</th><th colSpan={2} scope="colgroup">LaMAria Medium RPE · 10 m</th></tr>
          <tr><th scope="col">Position (m)</th><th scope="col">Orientation (deg)</th><th scope="col">Translation (m)</th><th scope="col">Rotation (deg)</th></tr>
        </thead>
        <tbody>{componentSystems.map(cid => {
          const records = components.filter(record => record.configurationId === cid);
          return <tr key={cid}><th scope="row"><Link href={trajectoryUrl(records[0])}>{systemName(records[0].system)}</Link></th>
            {valueCell(records.find(record => record.metric === "position_ate"))}
            {valueCell(records.find(record => record.metric === "orientation_ate"))}
            {valueCell(records.find(record => record.metric === "translation_rpe"))}
            {valueCell(records.find(record => record.metric === "rotation_rpe"))}
          </tr>;
        })}</tbody>
      </table></div>
    </section>

    <section className="paper-results-section" id="paper-table-iv">
      <h2>Absolute and relative error <span> / Table IV</span></h2>
      <div className="table-scroll"><table className="source-table paper-example-table">
        <caption className="sr-only">Installed Table IV values: reported group mean position ATE and translational RPE over 10 m segments, in meters.</caption>
        <thead><tr><th scope="col">Condition</th><th scope="col">System</th><th scope="col">Position ATE (m)</th><th scope="col">Translation RPE · 10 m (m)</th></tr></thead>
        <tbody>{relativeCases.flatMap(condition => {
          const records = relative.filter(record => record.datasetId === condition.dataset && record.group === condition.group);
          const ids = [...new Set(records.map(record => record.configurationId))];
          return ids.map((cid, index) => {
            const own = records.filter(record => record.configurationId === cid);
            return <tr key={cid}>{index === 0 && <th scope="rowgroup" rowSpan={ids.length}>{condition.label}<small>{condition.scope}</small></th>}
              <th scope="row"><Link href={trajectoryUrl(own[0])}>{systemName(own[0].system)}</Link></th>
              {valueCell(own.find(record => record.metric === "position_ate"))}
              {valueCell(own.find(record => record.metric === "translation_rpe"))}
            </tr>;
          });
        })}</tbody>
      </table></div>
    </section>

    <section className="paper-results-section" id="paper-figure-4-values">
      <h2>LaMAria Additional <span> / Fig. 4 · Mono</span></h2>
      <div className="table-scroll"><table className="source-table paper-coverage-table">
        <caption className="sr-only">All 28 values plotted in installed Figure 4, for monocular OpenVINS and square-root VINS on seven LaMAria Additional sequences.</caption>
        <thead>
          <tr><th rowSpan={2} scope="col">Sequence</th><th colSpan={2} scope="colgroup">OpenVINS</th><th colSpan={2} scope="colgroup">√VINS</th></tr>
          <tr><th scope="col">Position ATE (m)</th><th scope="col">SR (%)</th><th scope="col">Position ATE (m)</th><th scope="col">SR (%)</th></tr>
        </thead>
        <tbody>{sequences.map(sequence => <tr key={sequence}>
          <th scope="row" title={sequence}>{coverage.find(record => record.sequence === sequence)?.displaySequence}</th>
          {valueCell(coverageValue(sequence, "open_vins_mono", "position_ate"))}
          {valueCell(coverageValue(sequence, "open_vins_mono", "SR"))}
          {valueCell(coverageValue(sequence, "sqrtvins_mono", "position_ate"))}
          {valueCell(coverageValue(sequence, "sqrtvins_mono", "SR"))}
        </tr>)}</tbody>
      </table></div>
      <p><Link href="/results/tables/?dataset=lamaria&mode=mono&group=Additional+Sequence&family=ATE&component=translation&view=sequences">All ATE values</Link> · <Link href="/results/current/?dataset=lamaria&mode=mono&view=sequence">All SR values</Link></p>
    </section>

    <details className="result-notes"><summary>Notes</summary>
      <p>Table III uses EuRoC means over 11 sequences and LaMAria Medium means over four. Table IV uses group means. Hover for source precision.</p>
      <p>Fig. 4 ATE uses drift-valid samples from runs with SR ≥ 75%. SR averages three expected runs, assigning zero to missing or invalid values. Sequence 4_10 remains in the full results.</p>
    </details>
  </>;
}
