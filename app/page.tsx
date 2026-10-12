import Link from "next/link";
import systems from "@/data/benchmark-systems.json";
import results from "@/public/data/current-results.json";
import abstract from "@/data/project-abstract.json";
import { DatasetInputPreviews } from "@/components/dataset-input-previews";
import { HomeResultsOverview } from "@/components/home-results-overview";

export default function Home() {
  return (
    <div className="container research-home">
      <header className="project-heading">
        <h1 className="project-logo">
          <img
            src="/brand/vioverse-logo.jpg"
            alt="VIOVERSE"
            width="1280"
            height="720"
            fetchPriority="high"
          />
        </h1>
        <p className="project-subtitle">A Cross-Domain Benchmark of Visual–Inertial Odometry</p>
        <ul className="home-benchmark-stats" aria-label="Benchmark scope">
          <li><strong>{systems.length}</strong><span>VIO systems</span></li>
          <li><strong>{results.datasets.length}</strong><span>Public datasets</span></li>
          <li><strong>{results.datasets.reduce((count, dataset) => count + dataset.sequenceCount, 0)}</strong><span>Selected sequences</span></li>
        </ul>
      </header>
      <section className="home-abstract" aria-labelledby="abstract-heading">
        <h2 id="abstract-heading">Abstract</h2>
        <p>{abstract.text}</p>
      </section>
      <section className="research-section home-benchmark" aria-labelledby="benchmark-heading">
        <div className="home-section-heading">
          <h2 id="benchmark-heading">Benchmark</h2>
          <Link className="home-design-link" href="/benchmark/">Benchmark design →</Link>
        </div>
        <DatasetInputPreviews />
      </section>
      <section className="research-section" aria-labelledby="results-heading">
        <div className="home-section-heading">
          <h2 id="results-heading">Evaluation and complete results</h2>
          <Link className="home-results-link" href="/results/">Complete results →</Link>
        </div>
        <p>
          VIOverse provides a unified comparison of trajectory error and valid-path
          coverage across operating domains, complemented by computational profiling
          on desktop and embedded platforms. All reported results come from our
          own reruns and evaluations.
        </p>
        <HomeResultsOverview />
      </section>
      <section className="home-tutorial-entry" aria-labelledby="tutorials-heading">
        <h2 id="tutorials-heading"><Link href="/learn/">Tutorials</Link></h2>
        <p>Background on visual–inertial sensing, calibration, initialization, and estimation. Chapter text is in preparation.</p>
      </section>
    </div>
  );
}
