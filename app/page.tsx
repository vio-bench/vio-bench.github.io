import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Terminal,
  ChartNoAxesCombined,
  MoveUpRight,
  Compass,
  Workflow,
} from "lucide-react";
import { ButtonLink } from "@/components/ui";
import lessons from "@/data/tutorials.json";
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> THE VISUAL–INERTIAL ODOMETRY
            LEARNING HUB
          </span>
          <h1>
            Learn and run
            <br />
            <span>visual–inertial odometry.</span>
          </h1>
          <p className="hero-description">
            Study the estimation methods, follow implementation guides, and
            understand benchmark results in the context of their data and
            settings.
          </p>
          <div className="button-row">
            <ButtonLink href="/learn/">Start learning</ButtonLink>
            <ButtonLink href="/results/" secondary>
              View benchmark results
            </ButtonLink>
          </div>
          <div className="hero-note">
            <span>Open resources</span>
            <i /> <span>From fundamentals to research</span>
          </div>
        </div>
        <aside
          className="system-overview"
          aria-label="Conceptual VIO system overview"
        >
          <div className="panel-heading">
            <span>THE VIO SYSTEM</span>
            <span className="small">A TECHNICAL OVERVIEW</span>
          </div>
          <div className="overview-body">
            <span className="overview-stage">01 / MEASUREMENTS</span>
            <div className="sensor-pair">
              <div>
                <strong>Camera</strong>
                <span>Image sequence</span>
              </div>
              <div>
                <strong>IMU</strong>
                <span>Angular velocity · specific force</span>
              </div>
            </div>
            <Link
              href="/learn/calibration-and-time/"
              className="calibration-note"
            >
              Camera models · sensor extrinsics · timestamps{" "}
              <ArrowRight size={14} />
            </Link>
            <div className="flow-arrow" aria-hidden="true">
              ↓
            </div>
            <Link
              href="/learn/filtering-and-optimization/"
              className="estimation-block"
            >
              <span className="overview-stage">02 / STATE ESTIMATION</span>
              <strong>Visual constraints + inertial propagation</strong>
              <span>Filtering or window optimization</span>
            </Link>
            <div className="flow-arrow" aria-hidden="true">
              ↓
            </div>
            <Link href="/learn/trajectory-evaluation/" className="output-block">
              <span className="overview-stage">03 / OUTPUT & EVALUATION</span>
              <strong>Pose · velocity · sensor biases</strong>
              <span>
                Inspect trajectory error, output coverage, and runtime{" "}
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
          <p className="overview-caption">
            A conceptual view. Implementations differ in their state, frontend,
            and estimation architecture.
          </p>
        </aside>
      </section>
      <div className="scope-strip">
        <div className="container scope-inner">
          <span>Tutorials, implementations, and evaluation</span>
          <span>
            <b>08</b> foundational lessons
          </span>
          <span>
            <b>11</b> system profiles
          </span>
          <span>
            <b>05</b> dataset domains
          </span>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              TUTORIALS · IMPLEMENTATION · EVALUATION
            </span>
            <h2>Learn VIO systematically.</h2>
          </div>
          <p>
            Follow a guided path, get a system running, or examine the evidence
            behind a result.
          </p>
        </div>
        <div className="path-grid">
          {[
            {
              icon: BookOpen,
              n: "01",
              title: "Learn the foundations",
              body: "Build a connected understanding of sensors, geometry, calibration, and estimation.",
              href: "/learn/",
              cta: "Follow the learning path",
            },
            {
              icon: Terminal,
              n: "02",
              title: "Run an implementation",
              body: "Build OpenVINS, configure a real dataset, save a trajectory, and evaluate the output.",
              href: "/run/openvins/",
              cta: "Run OpenVINS on EuRoC",
            },
            {
              icon: ChartNoAxesCombined,
              n: "03",
              title: "Understand the results",
              body: "Compare accuracy and resource measurements, then inspect the complete sequence-level result tables.",
              href: "/results/",
              cta: "Explore the leaderboards",
            },
          ].map((c) => (
            <Link href={c.href} key={c.n} className="path-card">
              <div className="card-top">
                <c.icon size={27} />
                <span>{c.n}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <span className="text-link">
                {c.cta}
                <ArrowRight size={17} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container">
        <div className="results-promo">
          <div>
            <span className="eyebrow">VIOBENCH / REPORTED RESULTS</span>
            <h2>Explore the benchmark evidence.</h2>
            <p>
              Five datasets, 98 report sequences, 18 accuracy configurations,
              and 164 resource records. Compare a selected condition and inspect
              the values behind it.
            </p>
          </div>
          <ButtonLink href="/results/">View all results</ButtonLink>
        </div>
      </section>
      <section className="section tinted">
        <div className="container learning-preview">
          <div>
            <span className="eyebrow">LEARN, THEN PUT IT TO WORK</span>
            <h2>
              Build the foundations
              <br />
              in the right order.
            </h2>
            <p className="section-description">
              Each lesson connects a concept to a practical decision, with a
              worked explanation, explicit assumptions, and links to original
              documentation and papers.
            </p>
            <ButtonLink href="/learn/" secondary>
              Explore all 8 lessons
            </ButtonLink>
          </div>
          <div className="lesson-preview-list">
            {lessons.slice(0, 4).map((l, i) => (
              <Link href={"/learn/" + l.slug + "/"} key={l.slug}>
                <span className="lesson-number">0{i + 1}</span>
                <span>
                  <strong>{l.title}</strong>
                  <small>
                    {l.level} · {l.duration}
                  </small>
                </span>
                <ArrowRight size={19} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FROM EQUATIONS TO IMPLEMENTATIONS</span>
            <h2>Find your way around the ecosystem.</h2>
          </div>
        </div>
        <div className="feature-grid">
          <Link href="/systems/" className="feature-panel">
            <Workflow size={27} />
            <h3>Meet the systems</h3>
            <p>
              Explore filter and optimization approaches, sensor configurations,
              and the code behind them.
            </p>
            <div className="system-names">
              OpenVINS <span>·</span> ORB-SLAM3 <span>·</span> BASALT
              <br />
              VINS-Fusion <span>·</span> Kimera-VIO <span>·</span> and more
            </div>
            <span className="text-link">
              Browse 11 profiles <MoveUpRight size={17} />
            </span>
          </Link>
          <Link href="/resources/" className="feature-panel">
            <Compass size={27} />
            <h3>Choose data with a purpose</h3>
            <p>
              From indoor flight to underwater and egocentric motion: connect a
              dataset to what you want to learn.
            </p>
            <div className="domain-tags">
              <span>Indoor flight</span>
              <span>Underwater</span>
              <span>Wearables</span>
              <span>Legged robots</span>
            </div>
            <span className="text-link">
              Explore the resource library <MoveUpRight size={17} />
            </span>
          </Link>
        </div>
      </section>
      <section className="container">
        <div className="community-banner">
          <div>
            <span className="eyebrow">BUILT TO GROW TOGETHER</span>
            <h2>Make VIO easier to learn.</h2>
            <p>
              Suggest a technical correction, contribute a documented workflow,
              or add a useful reference for the VIO community.
            </p>
          </div>
          <ButtonLink
            href="https://github.com/vio-bench/vio-bench.github.io/issues"
            secondary
          >
            Contribute an idea
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
