import Link from "next/link";
import { ArrowRight } from "lucide-react";
import lessons from "@/data/tutorials.json";
import { PageIntro, Callout } from "@/components/ui";
export const metadata = { title: "Learn VIO" };
export default function Learn() {
  return (
    <>
      <PageIntro
        eyebrow="TUTORIALS / FOUNDATIONS"
        title="Visual–inertial odometry tutorials"
        description="Tutorials on camera and IMU measurements, coordinate frames, calibration, initialization, state estimation, trajectory evaluation, and experimental practice."
      />
      <div className="container page-content">
        <Callout title="Tutorial sequence and prerequisites">
          <p>
            The lessons follow a suggested sequence from sensor models to
            estimation and evaluation. Each lesson lists its prerequisites and
            includes a worked example. Reading times are estimates.
          </p>
          <p>
            The <Link href="/references/">notation and primary references</Link>{" "}
            define the frame, quaternion, state, and measurement conventions
            used throughout the tutorials.
          </p>
        </Callout>
        <div className="curriculum">
          {lessons.map((l, i) => (
            <Link
              className="lesson-card"
              href={"/learn/" + l.slug + "/"}
              key={l.slug}
            >
              <span className="lesson-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="lesson-meta">
                  <span>{l.level}</span>
                  <span>{l.duration}</span>
                </div>
                <h2>{l.title}</h2>
                <p>{l.summary}</p>
                <span className="text-link">
                  Open lesson <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div
          className="community-banner"
          style={{ marginTop: 40, marginBottom: 0 }}
        >
          <div>
            <h2>OpenVINS implementation guide</h2>
            <p>
              The OpenVINS guide covers environment setup, EuRoC configuration,
              trajectory recording, and evaluation.
            </p>
          </div>
          <Link className="button primary" href="/run/openvins/">
            Run OpenVINS on EuRoC <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </>
  );
}
