import Link from "next/link";
import lessons from "@/data/tutorials.json";
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
        <p className="project-abstract">
          VIOverse is a cross-domain benchmark of 11 open-source
          visual–inertial odometry (VIO) systems on 98 selected sequences from
          five public datasets. We evaluate trajectory error together with
          valid reference-path coverage and profile processing time, CPU
          utilization, and process memory on desktop and embedded platforms.
          All results come from our own experiments and evaluations.
        </p>
        <nav className="project-links" aria-label="Project resources">
          <Link href="/results/">Benchmark results</Link>
          <Link href="/learn/">Tutorials</Link>
        </nav>
      </header>
      <section className="research-section" aria-labelledby="results-heading">
        <div className="research-section-heading">
          <h2 id="results-heading">Benchmark results</h2>
          <Link href="/benchmark/">Benchmark design</Link>
        </div>
        <p>
          Monocular and stereo configurations are evaluated separately, with
          loop closure and global map optimization disabled. Computational
          profiling uses selected inputs on Desktop, Jetson AGX Orin, and
          Jetson Nano.
        </p>
        <nav className="project-links" aria-label="Benchmark result views">
          <Link href="/results/tables/">Trajectory errors</Link>
          <Link href="/results/current/">Path coverage (SR)</Link>
          <Link href="/results/efficiency/">Runtime and resources</Link>
        </nav>
        <DatasetGallery showCounts />
        <p className="dataset-image-note">Example scenes from the official dataset pages; select a dataset to view its results.</p>
      </section>
      <section className="research-section" aria-labelledby="tutorials-heading">
        <div className="research-section-heading">
          <h2 id="tutorials-heading">Tutorials</h2>
          <Link href="/learn/">Tutorial overview</Link>
        </div>
        <p>
          A tutorial series from notation and sensor models to calibration,
          estimation, and evaluation. Chapter text is in preparation.
        </p>
        <ol className="research-contents">
          {lessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link href={"/learn/" + lesson.slug + "/"}>{lesson.title}</Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
