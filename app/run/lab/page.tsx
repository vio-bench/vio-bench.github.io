import Link from "next/link";
import { PageIntro, Callout } from "@/components/ui";
import { TrajectoryLab } from "@/components/trajectory-lab";
export const metadata = { title: "Interactive trajectory lab" };
export default function Lab() {
  return (
    <>
      <PageIntro
        eyebrow="RUN / THE MOTION LAB"
        title="Make the error visible."
        description="Explore how timing, accumulating bias, and missing output change a trajectory—and the number used to describe it."
      />
      <div className="container page-content">
        <TrajectoryLab />
        <Callout title="Try this: can a smaller error hide a shorter run?">
          <p>
            Set time offset to 0 and acceleration bias to 0.010 m/s². Now lower
            output duration from 100% to 25%. The RMSE decreases because the
            late, larger errors are no longer evaluated. The missing part of the
            run has not become accurate.
          </p>
        </Callout>
        <article className="prose">
          <h2>What this model does</h2>
          <p>
            The reference is an analytic 2D path in meters: x(t) = 8 sin(0.2t) +
            0.1t and y(t) = 5 sin(0.12t), with t in seconds. The estimate
            samples that path at t + δt and adds ½bₓt² to its x coordinate. The
            two paths already share a coordinate frame; no rotation,
            translation, scale, or time alignment is fitted.
          </p>
          <p>
            Position RMSE is the square root of the mean squared Euclidean
            position difference at matching timestamps. Time-span coverage is
            the available output duration divided by the 30 s reference
            duration. Shortened runs are compared only over their available
            prefix. Samples with missing estimates stay blank in the download.
          </p>
          <p>
            This isolates useful effects for teaching. A real VIO system
            estimates orientation, velocity, biases, and other quantities while
            reconciling camera and IMU measurements. This browser experiment
            does not implement that estimator or model all its failure modes.
          </p>
          <div className="lesson-nav">
            <Link href="/learn/trajectory-evaluation/">
              Read about error and coverage ←
            </Link>
            <Link href="/run/openvins/">Run an actual estimator →</Link>
          </div>
        </article>
      </div>
    </>
  );
}
