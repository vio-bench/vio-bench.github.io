import Link from "next/link";

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
        <p className="project-abstract">
          VIOverse is a cross-domain benchmark of 11 open-source
          visual–inertial odometry (VIO) systems on 98 selected sequences from
          five public datasets. We rerun the implementations and evaluate their
          trajectories under common rules, with separate computational profiling
          on desktop and embedded platforms.
        </p>
      </header>
      <section className="research-section" aria-labelledby="results-heading">
        <h2 id="results-heading">Complete results</h2>
        <nav className="home-result-links" aria-label="Complete benchmark results">
          <Link href="/results/tables/">
            <h3>Trajectory errors</h3>
            <p>Position and orientation ATE; translational and rotational RPE.</p>
          </Link>
          <Link href="/results/current/">
            <h3>Valid-path coverage (SR)</h3>
            <p>Dataset means, sequence means, and individual runs.</p>
          </Link>
          <Link href="/results/efficiency/">
            <h3>Runtime &amp; resources</h3>
            <p>Reported native time, CPU, and process memory on fixed profiling inputs.</p>
          </Link>
        </nav>
      </section>
      <div className="home-support-links">
        <section aria-labelledby="benchmark-heading">
          <h2 id="benchmark-heading"><Link href="/benchmark/">Benchmark</Link></h2>
          <p>Evaluated systems, datasets, sensor inputs, and computing platforms.</p>
        </section>
        <section aria-labelledby="tutorials-heading">
          <h2 id="tutorials-heading"><Link href="/learn/">Tutorials</Link></h2>
          <p>VIO models, estimation, and implementation. Chapter text is in preparation.</p>
        </section>
      </div>
    </div>
  );
}
