import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import data from "@/public/data/current-source-tables.json";

export const metadata = { title: "Result tables", description: "Trajectory error, reference-path coverage, runtime and resource tables." };

export default function Results() {
  return <>
    <PageIntro title="Result tables" description="Trajectory errors, reference-path coverage, and resource measurements from the benchmark reports." />
    <div className="container page-content">
      <ResultsNavigation />
      <section className="result-document-sections">
        <h2>Trajectory errors</h2>
        <p>Absolute trajectory error (ATE) and relative pose error (RPE) under drift-valid selection, with RPE intervals of 10, 20, 50, and 100 m where reported. Tables preserve the reported sequence values, annotations, and group averages.</p>
        <div className="table-scroll"><table className="leaderboard"><thead><tr><th scope="col">Dataset</th><th scope="col">Tables</th></tr></thead><tbody>{data.datasets.map(d => <tr key={d.id}><th scope="row">{d.name}</th><td><Link href={`/results/tables/?dataset=${d.id}`}>View trajectory tables →</Link></td></tr>)}</tbody></table></div>
        <div className="data-links"><Link href="/results/tables/">All trajectory tables →</Link><a href="/data/current-source-tables.json" download>Download tables (JSON)</a></div>
        <h2>Reference-path coverage</h2>
        <p>Valid reference-path fraction (SR), with separate dataset, sequence, and run tables. The mean uses three expected runs per sequence.</p>
        <div className="data-links"><Link href="/results/current/">View SR tables →</Link><a href="/data/current-results.json" download>Download trajectory and SR records (JSON)</a></div>
        <h2>Runtime and resource use</h2>
        <p>Reported processing time, CPU, memory, and available GPU measurements for Desktop, Jetson Orin, and Jetson Nano.</p>
        <div className="data-links"><Link href="/results/efficiency/">View resource tables →</Link><a href="/data/current-efficiency.json" download>Download resource tables (JSON)</a></div>
      </section>
      <section className="result-document-sections prose" id="calculation">
        <h2>How values are calculated</h2>
        <p><strong>Trajectory errors.</strong> Estimated and reference trajectories are associated in time and aligned in SE(3) without scale fitting. ATE and RPE use drift-valid trajectory portions; only runs with SR ≥ 75% contribute. Retained error samples are pooled within each sequence to compute RMSE. Dataset summaries equally average the finite sequence RMSEs. Translation is in meters and rotation in degrees. RPE uses the stated segment length and is not divided by that length.</p>
        <p><strong>Path coverage.</strong> SR is the percentage of the complete reference-path distance covered by valid estimates in the tracking segment retained for its longest valid duration. Each sequence mean uses three expected run slots, with missing or invalid run-level SR contributing zero. Dataset SR equally averages the expected sequence means. Unreported configuration/dataset combinations remain unreported.</p>
        <p><strong>Runtime and resources.</strong> Measurements retain the profiling input, camera mode, and platform. Means equally average the available per-run summaries. Native timing has implementation-specific boundaries; SVO total times are source-reported frontend-plus-backend sums. Neither is a common end-to-end latency measure. Each source row lists five selected runs; per-metric contributing counts and total attempts are unavailable.</p>
        <p><strong>Source tables and missing entries.</strong> Original sequence cells and group Average columns retain their reported values and precision; source averages are not recalculated. Asterisks in error tables mark runs excluded for SR &lt; 75%. Sequence contributions, selected runs, and attempts are different counts. Missing entries do not by themselves indicate execution failure. SR retains its designated three-run CSV source, separately from the error and resource reports.</p>
      </section>
    </div>
  </>;
}
