import Link from "next/link";
import { PageIntro } from "@/components/ui";
import trajectory from "@/public/data/current-results.json";
import resources from "@/public/data/current-efficiency.json";
export const metadata = { title: "Result table definitions" };
export default function Protocol() {
  return <>
    <PageIntro eyebrow="BENCHMARK / TABLE DEFINITIONS" title="Reading the result tables" description="Metric definitions, source annotations, and measurement conditions for the published tables." />
    <div className="container page-content article-layout">
      <aside className="sidebar"><strong>Measurement notes</strong><a href="#trajectory">Trajectory errors</a><a href="#coverage">Path coverage</a><a href="#resources">Runtime and resources</a><a href="#source">Sources and downloads</a><Link href="/evaluation/">Evaluation guide</Link></aside>
      <article className="prose">
        <section id="trajectory"><h2>Trajectory errors</h2>
          <p>The <Link href="/results/tables/">trajectory tables</Link> retain the reported sequence columns, source Average columns, and missing-value marks. Drift-valid ATE and the different RPE segment lengths are displayed separately. Source averages are transcribed without recalculation.</p>
          <p>ATE and RPE pairs list orientation or rotation RMSE in degrees first, followed by position or translation RMSE in meters. RPE values are errors over the stated segment length, without division by distance.</p>
          <p>For the reviewed drift-valid results: {trajectory.protocols.accuracy.selectionDescription} Alignment is {trajectory.protocols.accuracy.alignment}. {trajectory.protocols.accuracy.annotationDescription}</p>
          <p>A missing value is not a zero error and does not by itself identify an execution failure. The number of report sequences is distinct from the number of attempted or successful runs.</p>
        </section>
        <section id="coverage"><h2>Valid reference-path coverage (SR)</h2>
          <p>{trajectory.protocols.coverage.definition}</p><p>{trajectory.protocols.coverage.selectionDescription}</p>
          <p>The <Link href="/results/current/">SR tables</Link> use the designated September 10 CSV export. {trajectory.protocols.coverage.validStatusDescription} These denominators differ from the selection used for error metrics.</p>
        </section>
        <section id="resources"><h2>Runtime and resource measurements</h2>
          <p>The <Link href="/results/efficiency/">resource tables</Link> preserve measurements for each profiling input, platform, and camera mode. They report selected-run counts, implementation timing, CPU, memory, and available GPU statistics. A profiling sequence does not establish a dataset-wide resource average.</p>
          <p>Implementation timers have different boundaries and are not end-to-end latency. Where the source defines SVO total time as the sum of frontend and backend means, that sum is identified explicitly. It is not an independently measured native total.</p>
          <p>Reported standard deviations describe source timing or resource summaries, not confidence intervals. Missing source entries and absent metric columns remain distinct. Selected-run counts do not establish total attempts or the contributing count for every metric.</p>
        </section>
        <section id="source"><h2>Sources and downloads</h2>
          <p>Trajectory tables use reviewed batch <code>{trajectory.release.batch}</code>, Results revision <code>{trajectory.release.sourceRevision.slice(0, 12)}</code>. Resource tables use revision <code>{resources.release.sourceRevision.slice(0, 12)}</code>. SR retains separate CSV provenance; no shared Git revision is asserted.</p>
          <p>These are exports of existing result tables. Estimators and trajectory evaluation were not rerun for this website update. Full raw trajectories and execution logs are not included.</p>
          <ul><li><a href="/data/results-20261010.zip" download>Download the result tables and data</a></li><li><a href="/data/current-source-tables.json" download>Trajectory tables (JSON)</a></li><li><a href="/data/current-efficiency.json" download>Resource tables (JSON)</a></li><li><a href="/data/current-results.json" download>Reviewed trajectory and SR records (JSON)</a></li></ul>
        </section>
      </article>
    </div>
  </>;
}
