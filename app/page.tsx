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
import { TrajectoryPlot } from "@/components/trajectory-plot";
import { simulate } from "@/lib/trajectory";
import lessons from "@/data/tutorials.json";
export default function Home() {
  const demo = simulate({ bias: 0.006, offset: 0.12 });
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> THE VISUAL–INERTIAL ODOMETRY
            LEARNING HUB
          </span>
          <h1>
            Understand motion.
            <br />
            <span>Build your intuition.</span>
          </h1>
          <p className="hero-description">
            Learn how cameras and IMUs work together. Go from the first
            principles of VIO to running systems and interpreting real
            experiments.
          </p>
          <div className="button-row">
            <ButtonLink href="/learn/">Start learning</ButtonLink>
            <ButtonLink href="/run/" secondary>
              Run your first experiment
            </ButtonLink>
          </div>
          <div className="hero-note">
            <span>Open resources</span>
            <i /> <span>From fundamentals to research</span>
          </div>
        </div>
        <div className="hero-lab">
          <div className="panel-heading">
            <span>
              <span className="status-dot" /> THE MOTION LAB
            </span>
            <span className="small">01 / TRAJECTORIES</span>
          </div>
          <div className="panel-copy">
            <h2>Small errors. Different paths.</h2>
            <p>See how timing and bias change a trajectory.</p>
          </div>
          <TrajectoryPlot reference={demo.ref} estimate={demo.estimate} />
          <div className="lab-summary">
            <div>
              <span>Position RMSE</span>
              <strong>
                {demo.rmse.toFixed(2)} <small>m</small>
              </strong>
            </div>
            <Link href="/run/lab/">
              Try the interactive lab <ArrowRight size={17} />
            </Link>
          </div>
          <p className="plot-footnote">
            Synthetic teaching example · no estimator is running
          </p>
        </div>
      </section>
      <div className="scope-strip">
        <div className="container scope-inner">
          <span>A complete path through VIO</span>
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
            <span className="eyebrow">CHOOSE YOUR STARTING POINT</span>
            <h2>One field. Many ways in.</h2>
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
              title: "I want to understand VIO",
              body: "Build a connected understanding of sensors, geometry, calibration, and estimation.",
              href: "/learn/",
              cta: "Follow the learning path",
            },
            {
              icon: Terminal,
              n: "02",
              title: "I want to run a system",
              body: "Start with a browser experiment, then run OpenVINS on a real visual–inertial sequence.",
              href: "/run/",
              cta: "Open the run guides",
            },
            {
              icon: ChartNoAxesCombined,
              n: "03",
              title: "I want to compare results",
              body: "Explore a measured runtime snapshot and learn what makes a comparison meaningful.",
              href: "/benchmark/",
              cta: "Explore VIOBench",
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
              worked explanation, a small exercise, and links to the original
              sources.
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
              Found an unclear explanation, a missing resource, or a useful
              experiment? Help improve the next person’s starting point.
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
