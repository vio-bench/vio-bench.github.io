import Link from "next/link";
import systems from "@/data/benchmark-systems.json";
import results from "@/public/data/current-results.json";
import { DatasetGallery } from "@/components/dataset-gallery";

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
      </header>
      <section className="research-section home-benchmark" aria-labelledby="benchmark-heading">
        <h2 id="benchmark-heading">The VIOverse benchmark</h2>
        <p>
          We benchmark {systems.length} open-source visual–inertial odometry (VIO)
          systems on {results.datasets.reduce((count, dataset) => count + dataset.sequenceCount, 0)} selected
          sequences from five public datasets.
        </p>
        <DatasetGallery preview />
        <Link className="home-section-link" href="/benchmark/">Benchmark design: systems, datasets, and experimental setup →</Link>
      </section>
      <section className="research-section" aria-labelledby="results-heading">
        <h2 id="results-heading">Evaluation and complete results</h2>
        <p>
          VIOverse provides a unified comparison of trajectory error and valid-path
          coverage across operating domains, complemented by computational profiling
          on desktop and embedded platforms. All reported results come from our
          own reruns and evaluations.
        </p>
        <Link className="home-section-link" href="/results/">Complete results →</Link>
      </section>
      <section className="home-tutorial-entry" aria-labelledby="tutorials-heading">
        <h2 id="tutorials-heading"><Link href="/learn/">Tutorials</Link></h2>
        <p>Background on visual–inertial sensing, calibration, initialization, and estimation. Chapter text is in preparation.</p>
      </section>
    </div>
  );
}
