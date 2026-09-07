import Link from "next/link";
import lessons from "@/data/tutorials.json";
import accuracy from "@/public/data/accuracy.json";
import { ProjectAuthors } from "@/components/project-authors";

export default function Home() {
  return (
    <div className="container research-home">
      <header className="project-heading">
        <h1>VIOVERSE</h1>
        <p className="project-subtitle">Visual–Inertial Odometry: Methods, Tutorials, and Benchmark Evaluation</p>
        <ProjectAuthors />
        <p className="project-abstract">
          VIOVERSE is a project for studying, implementing, and evaluating
          visual–inertial odometry (VIO). The site includes a tutorial series
          in preparation, implementation documentation, and experimental
          results. Trajectory evaluation is presented
          with EPICA, while VIOBench organizes reported accuracy and resource
          measurements across five datasets and three computing platforms.
        </p>
        <nav className="project-links" aria-label="Project resources">
          <Link href="/learn/">Tutorials</Link>
          <Link href="/evaluation/">Evaluation</Link>
          <Link href="/results/">Benchmark results</Link>
          <a href="https://github.com/vio-bench">GitHub</a>
        </nav>
      </header>
      <section className="research-section" aria-labelledby="tutorials-heading">
        <div className="research-section-heading">
          <h2 id="tutorials-heading">Tutorials</h2>
          <Link href="/learn/">Tutorial overview</Link>
        </div>
        <p>
          A tutorial series by the VIOVERSE authors, from sensor models and
          calibration to estimation and evaluation. Chapter text is in
          preparation; references are collected separately for each topic.
        </p>
        <ol className="research-contents">
          {lessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link href={"/learn/" + lesson.slug + "/"}>{lesson.title}</Link>
            </li>
          ))}
        </ol>
      </section>
      <section className="research-section" aria-labelledby="software-heading">
        <h2 id="software-heading">System implementations</h2>
        <p>
          The <Link href="/systems/">system catalog</Link> documents 11 public
          implementations, including their estimation approach, supported input
          configurations, and upstream code. The <Link href="/run/openvins/">OpenVINS
          implementation guide</Link> covers installation, EuRoC configuration,
          trajectory export, and evaluation. Dataset and calibration references
          are collected in <Link href="/resources/">Resources</Link>.
        </p>
      </section>
      <section className="research-section" aria-labelledby="evaluation-heading">
        <h2 id="evaluation-heading">Trajectory evaluation</h2>
        <p>
          Evaluation requires a stated pose convention, time association policy,
          alignment model, and evaluated interval. The <Link href="/evaluation/">Evaluation
          guide</Link> explains ATE, RPE, and the distinction between full-trajectory
          and drift-valid measurements. It also documents a trajectory-pair
          workflow using EPICA, our trajectory alignment
          and evaluation toolkit.
        </p>
        <p>
          The <Link href="/benchmark/protocol/">VIOBench protocol notes</Link> specify
          how the published result tables are selected and aggregated, including
          source annotations, missing values, and measurement limitations.
        </p>
      </section>
      <section className="research-section" aria-labelledby="results-heading">
        <div className="research-section-heading">
          <h2 id="results-heading">Benchmark results</h2>
          <Link href="/benchmark/">Benchmark design</Link>
        </div>
        <p>
          The current report contains 98 sequence headers, 18 accuracy
          configurations, and 164 resource records. Accuracy results are
          organized by dataset, camera mode, and metric. Resource measurements
          retain the profiling input and platform for each record.
        </p>
        <div className="table-scroll home-dataset-table">
          <table>
            <caption>Table 1. Dataset inventory in the published accuracy report.</caption>
            <thead>
              <tr><th scope="col">Dataset</th><th scope="col">Report sequences</th><th scope="col">Accuracy results</th></tr>
            </thead>
            <tbody>
              {accuracy.datasets.map((dataset) => (
                <tr key={dataset.id}>
                  <th scope="row">{dataset.name}</th>
                  <td>{dataset.N_report}</td>
                  <td><Link href={`/results/accuracy/?dataset=${dataset.id}&mode=mono&metric=position&sequence=all`}>Sequence and dataset results</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Sequence counts describe the report inventory. The number of finite
          contributors is reported separately for each result; these counts do
          not establish the number of planned or successful runs.
        </p>
        <nav className="project-links" aria-label="Benchmark result views">
          <Link href="/results/">Results overview</Link>
          <Link href="/results/accuracy/">Accuracy leaderboard</Link>
          <Link href="/results/efficiency/">Runtime and resources</Link>
          <Link href="/results/tables/">Original result tables</Link>
        </nav>
      </section>
      <section className="research-section research-maintenance" aria-labelledby="source-heading">
        <h2 id="source-heading">Source and corrections</h2>
        <p>
          Website source and technical corrections are maintained in the{" "}
          <a href="https://github.com/vio-bench/vio-bench.github.io">website repository</a>.
          Results are published as versioned snapshots with downloadable data
          and source metadata. Software and datasets linked from this site
          retain their respective licenses.
        </p>
      </section>
    </div>
  );
}
