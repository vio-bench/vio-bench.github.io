import Link from "next/link";
import systems from "@/data/benchmark-systems.json";
import domains from "@/data/benchmark-datasets.json";
import results from "@/public/data/current-results.json";

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
          systems spanning direct, KLT-based, descriptor-based, and learned visual
          processing, with filtering- and optimization-based estimators.
        </p>
        <ul className="home-system-list" aria-label="Evaluated VIO systems">
          {systems.map(system => <li key={system.id}>
            <a href={system.github} target="_blank" rel="noopener noreferrer" aria-label={`${system.name} upstream GitHub repository`}>{system.name}</a>
          </li>)}
        </ul>
        <p>
          The benchmark uses {results.datasets.reduce((count, dataset) => count + dataset.sequenceCount, 0)} selected
          sequences from five public datasets, covering indoor and aggressive
          aerial flight, underwater navigation, wearable sensing, and legged field
          operation.
        </p>
        <ul className="home-domain-list" aria-label="Datasets and operating domains">
          {results.datasets.map(dataset => <li key={dataset.id}>
            <strong>{dataset.label}</strong>
            <span>{domains.find(domain => domain.id === dataset.id)?.domain}</span>
            <small>{dataset.sequenceCount} sequences</small>
          </li>)}
        </ul>
        <Link className="home-section-link" href="/benchmark/">Benchmark design: systems, datasets, and experimental setup →</Link>
      </section>
      <section className="research-section" aria-labelledby="results-heading">
        <h2 id="results-heading">Evaluation and complete results</h2>
        <p>
          All reported results come from our own reruns and evaluations. We use
          common trajectory-alignment, validity, and aggregation rules, keeping
          monocular and stereo configurations separate. We report position and
          orientation ATE, translational and rotational RPE, and valid
          reference-path coverage (SR).
        </p>
        <p>
          Separate computational profiling reports native processing
          time, CPU utilization, and process memory on Desktop, Jetson AGX Orin,
          and Jetson Nano, using one fixed input from each dataset. Metric
          definitions and statistical rules are provided alongside the complete
          result tables.
        </p>
        <nav className="home-result-links" aria-label="Complete benchmark results">
          <Link href="/results/tables/">
            <h3>Trajectory errors</h3>
            <p>ATE and RPE · Monocular and stereo</p>
          </Link>
          <Link href="/results/current/">
            <h3>Valid-path coverage (SR)</h3>
            <p>Dataset means · Sequence means · Runs</p>
          </Link>
          <Link href="/results/efficiency/">
            <h3>Runtime &amp; resources</h3>
            <p>Desktop · Jetson Orin · Jetson Nano</p>
          </Link>
        </nav>
      </section>
      <section className="home-tutorial-entry" aria-labelledby="tutorials-heading">
        <h2 id="tutorials-heading"><Link href="/learn/">Tutorials</Link></h2>
        <p>Background on visual–inertial sensing, calibration, initialization, and estimation. Chapter text is in preparation.</p>
      </section>
    </div>
  );
}
