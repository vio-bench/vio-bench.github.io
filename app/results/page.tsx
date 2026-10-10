import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import data from "@/public/data/current-source-tables.json";

export const metadata = { title: "VIOBench result tables", description: "Trajectory error, reference-path coverage, runtime and resource tables." };

export default function Results() {
  return <>
    <PageIntro eyebrow="RESULTS / VIOBENCH" title="Result tables" description="Trajectory errors, reference-path coverage, and resource measurements from the benchmark reports." />
    <div className="container page-content">
      <ResultsNavigation />
      <section className="result-document-sections">
        <h2>Trajectory errors</h2>
        <p>ATE and RPE under drift-valid selection, with RPE intervals of 10, 20, 50, and 100 m where reported. Tables preserve the reported sequence values, annotations, and group averages.</p>
        <div className="table-scroll"><table className="leaderboard"><thead><tr><th scope="col">Dataset</th><th scope="col">Tables</th></tr></thead><tbody>{data.datasets.map(d => <tr key={d.id}><th scope="row">{d.name}</th><td><Link href={`/results/tables/?dataset=${d.id}`}>View trajectory tables →</Link></td></tr>)}</tbody></table></div>
        <div className="data-links"><Link href="/results/tables/">All trajectory tables →</Link><a href="/data/current-source-tables.json" download>Download tables (JSON)</a></div>
        <h2>Reference-path coverage</h2>
        <p>Valid reference-path fraction (SR), with separate dataset, sequence, and run tables. The mean uses three expected runs per sequence.</p>
        <div className="data-links"><Link href="/results/current/">View SR tables →</Link><a href="/data/current-results.json" download>Download trajectory and SR records (JSON)</a></div>
        <h2>Runtime and resource use</h2>
        <p>Reported processing time, CPU, memory, and available GPU measurements for Desktop, Jetson Orin, and Jetson Nano.</p>
        <div className="data-links"><Link href="/results/efficiency/">View resource tables →</Link><a href="/data/current-efficiency.json" download>Download resource tables (JSON)</a></div>
      </section>
    </div>
  </>;
}
