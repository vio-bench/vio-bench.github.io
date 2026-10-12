import source from "@/public/data/current-paper-alignment.json";

/** The paper's all-associated-pose comparison is a separate result family. */
export function PaperAlignmentResults() {
  const panels = source.panels;
  return (
    <section id="paper-alignment" className="paper-results-section" aria-labelledby="paper-alignment-title">
      <h2 id="paper-alignment-title">Trajectory alignment — Fig. 5 and Table V</h2>
      <div className="paper-alignment-cases">
        {source.cases.map(item => (
          <p key={item.id}>
            <strong>({item.panels.join(", ")}) {item.system} · Mono</strong><br />
            {item.dataset} · <code>{item.sequence}</code> · Run 1<br />
            <span className="small">{item.associatedPoseCount} associated poses</span>
          </p>
        ))}
      </div>
      <figure className="paper-alignment-figure">
        <a href={`/${source.figure.path}`} target="_blank" rel="noopener noreferrer" aria-label="Open the full-size paper alignment figure">
          <img
            src={`/${source.figure.path}`}
            width={1008}
            height={249.448818}
            alt="Four X–Y trajectory panels: DM-VIO with orientation-first SE(3)-R and position-fitted SE(3), followed by VINS-Fusion mono with SE(3)-R and position-fitted Sim(3). Numerical errors are in the table below."
            loading="lazy"
            decoding="async"
          />
        </a>
        <figcaption>X–Y trajectories in meters.</figcaption>
      </figure>
      <div className="table-scroll">
        <table className="paper-alignment-table">
          <caption className="sr-only">Table V: ATE RMSE over all associated poses and fitted scale, in paper panel order.</caption>
          <thead>
            <tr>
              <th scope="col" rowSpan={2}>Measurement</th>
              {source.cases.map(item => <th scope="colgroup" colSpan={item.panels.length} key={item.id}>{item.system} · Mono</th>)}
            </tr>
            <tr>{panels.map(panel => <th scope="col" key={panel.id}>({panel.id}) {panel.alignment}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Position ATE (m)</th>
              {panels.map(panel => <td key={panel.id} className="score" title={`Source RMSE: ${panel.positionATE.valueText} m`}>{panel.positionATE.displayText}</td>)}
            </tr>
            <tr>
              <th scope="row">Orientation ATE (deg)</th>
              {panels.map(panel => <td key={panel.id} className="score" title={`Source RMSE: ${panel.orientationATE.valueText} deg`}>{panel.orientationATE.displayText}</td>)}
            </tr>
            <tr>
              <th scope="row">Scale</th>
              {panels.map(panel => <td key={panel.id} className="score" title={panel.scale.fitted ? `Fitted scale: ${panel.scale.valueText}` : panel.scale.value === null ? "Scale not fitted; source omits a scale value" : `Scale not fitted; fixed source scale: ${panel.scale.valueText}`}>{panel.scale.displayText}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <details className="result-notes">
        <summary>Notes</summary>
        <p>ATE is RMSE over all associated poses without trimming, separate from the main drift-valid ATE/RPE results.</p>
        <p>
          SE(3)-R fits orientations first; SE(3) and Sim(3) fit positions with
          fixed and fitted scale, respectively. A dash means scale was not fitted;
          (c) records fixed scale 1. The comparison in (c,d) changes both rotation
          fitting and scale fitting.
        </p>
        <p>
          All panels preserve equal X/Y spatial scaling. Panels (a,b) share
          viewing limits; (c,d) use different ranges. Circles/crosses mark starts/ends.
        </p>
      </details>
    </section>
  );
}
