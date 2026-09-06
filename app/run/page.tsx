import { PageIntro, ButtonLink, Callout } from "@/components/ui";
import { SlidersHorizontal, Terminal } from "lucide-react";
export const metadata = { title: "Run and experiment" };
export default function Run() {
  return (
    <>
      <PageIntro
        eyebrow="RUN / LEARN BY DOING"
        title="Turn a concept into an experiment."
        description="Build intuition with a small browser lab, then follow a documented route to running a real estimator on your machine."
      />
      <div className="container page-content">
        <div className="feature-grid">
          <article className="feature-panel">
            <SlidersHorizontal size={29} />
            <span className="eyebrow">IN YOUR BROWSER · NO SETUP</span>
            <h2>Trajectory intuition lab</h2>
            <p>
              Change a time offset, add acceleration bias, and shorten the
              available output. Watch the path and position error update.
            </p>
            <p className="small">
              A deterministic teaching simulation. No image processing or VIO
              estimator runs in this lab.
            </p>
            <ButtonLink href="/run/lab/">Launch the lab</ButtonLink>
          </article>
          <article className="feature-panel">
            <Terminal size={29} />
            <span className="eyebrow">ON YOUR MACHINE · REAL SENSOR DATA</span>
            <h2>OpenVINS on EuRoC</h2>
            <p>
              Prepare the environment, inspect the calibration, launch the
              estimator, save its trajectory, and evaluate the result.
            </p>
            <p className="small">
              Ubuntu 20.04 · ROS 1 Noetic · upstream documented environment.
              Commands reviewed against source; not executed here.
            </p>
            <ButtonLink href="/run/openvins/">
              Follow the local run guide
            </ButtonLink>
          </article>
        </div>
        <Callout title="A useful experiment keeps its context">
          <p>
            Keep the data sequence, sensor mode, calibration, software revision,
            machine, and evaluation settings with every result. A trajectory
            plot alone cannot tell you whether two runs are comparable.
          </p>
        </Callout>
      </div>
    </>
  );
}
