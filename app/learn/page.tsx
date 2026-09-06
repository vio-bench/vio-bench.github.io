import Link from "next/link";
import { ArrowRight } from "lucide-react";
import lessons from "@/data/tutorials.json";
import { PageIntro, Callout } from "@/components/ui";
export const metadata = { title: "Learn VIO" };
export default function Learn() {
  return (
    <>
      <PageIntro
        eyebrow="LEARN / THE FOUNDATIONS"
        title="A connected path through VIO."
        description="Start with what the sensors measure. Build toward estimation, evaluation, and your own camera–IMU recording."
      />
      <div className="container page-content">
        <Callout title="Start where you are">
          <p>
            New to VIO? Take these lessons in order. Already working with a
            system? Jump to the concept you need. Reading times are estimates;
            use the worked examples to check your understanding.
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
            <h2>Continue with a real implementation.</h2>
            <p>
              Follow the OpenVINS guide from environment setup and EuRoC
              configuration to saved trajectories and evaluation.
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
