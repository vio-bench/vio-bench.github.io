import Link from "next/link";
import { PageIntro, ButtonLink, Callout } from "@/components/ui";
import { Terminal, BookOpen, FolderOpen, ArrowRight } from "lucide-react";
export const metadata = { title: "Run VIO systems" };
export default function Run() {
  return (
    <>
      <PageIntro
        eyebrow="RUN / IMPLEMENTATION GUIDES"
        title="Run VIO on real sensor data."
        description="Follow installation, dataset configuration, trajectory recording, and evaluation steps for a public implementation."
      />
      <div className="container page-content">
        <div className="run-guide-feature">
          <div>
            <span className="eyebrow">
              DOCUMENTED WORKFLOW / OPENVINS + EUROC
            </span>
            <h2>From source code to an evaluated trajectory.</h2>
            <p>
              Build OpenVINS, select the supplied EuRoC calibration, process
              stereo images and IMU measurements, then save and evaluate the
              estimated trajectory.
            </p>
            <p className="small">
              Ubuntu 20.04 · ROS 1 Noetic · upstream documented environment.
              Commands reviewed against source; not executed as part of this
              website release.
            </p>
            <ButtonLink href="/run/openvins/">
              Read the OpenVINS run guide
            </ButtonLink>
          </div>
          <ol className="workflow-list">
            <li>
              <span>01</span>Install dependencies and build
            </li>
            <li>
              <span>02</span>Inspect the dataset and calibration
            </li>
            <li>
              <span>03</span>Run the estimator and record output
            </li>
            <li>
              <span>04</span>Check overlap, alignment, and error
            </li>
          </ol>
        </div>
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PREPARE YOUR OWN WORKFLOW</span>
              <h2>Keep the inputs and settings traceable.</h2>
            </div>
          </div>
          <div className="path-grid">
            {[
              {
                icon: FolderOpen,
                title: "Prepare the data",
                body: "Choose a sequence and read its sensor streams, calibration, timestamps, and ground-truth definitions.",
                href: "/resources/",
                cta: "Dataset resources",
              },
              {
                icon: Terminal,
                title: "Choose an implementation",
                body: "Compare estimator approaches and documented input modes, then follow the public upstream instructions.",
                href: "/systems/",
                cta: "Explore the systems",
              },
              {
                icon: BookOpen,
                title: "Evaluate the output",
                body: "Learn the evaluation workflow, then use EPICA to align a reference–estimate pair and inspect its error and evaluated extent.",
                href: "/evaluation/",
                cta: "Evaluation with EPICA",
              },
            ].map((c) => (
              <Link className="path-card" key={c.href} href={c.href}>
                <div className="card-top">
                  <c.icon size={26} />
                </div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <span className="text-link">
                  {c.cta}
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <Callout title="Record enough information to reproduce the run">
          <p>
            Keep the data sequence, sensor mode, calibration, source revision,
            build settings, machine, launch command, and evaluation settings
            with each result. Preserve repeated runs in separate output files.
          </p>
        </Callout>
      </div>
    </>
  );
}
