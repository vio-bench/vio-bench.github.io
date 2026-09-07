import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, Callout, SourceList } from "@/components/ui";
import { CodeBlock } from "@/components/code-block";
import { MathBlock } from "@/components/math-block";
import epica from "@/data/epica.json";

export const metadata = {
  title: "Evaluation with EPICA",
  description:
    "Learn how to prepare, align, and evaluate VIO trajectories with EPICA, then interpret ATE, RPE, coverage, and the VIOBench results.",
};

export default function Evaluation() {
  return (
    <>
      <PageIntro
        eyebrow="EVALUATION / METHODS AND SOFTWARE"
        title="Trajectory evaluation"
        description="Definitions and procedures for temporal association, spatial alignment, trajectory error, and evaluated extent, followed by an EPICA workflow for recorded trajectories."
      >
        <div className="button-row">
          <a className="button primary" href={epica.docs}>
            Open EPICA documentation <ArrowUpRight size={17} />
          </a>
          <a className="button secondary" href="#run-epica">
            Evaluate a trajectory pair ↓
          </a>
        </div>
      </PageIntro>
      <div className="container page-content article-layout evaluation-layout">
        <aside className="sidebar">
          <strong>Evaluation guide</strong>
          <a href="#workflow">The evaluation workflow</a>
          <a href="#prepare">Frames, time, and reference data</a>
          <a href="#alignment">Choose the alignment</a>
          <a href="#metrics">ATE and RPE</a>
          <a href="#coverage">Full and drift-valid results</a>
          <a href="#run-epica">Run EPICA</a>
          <a href="#compare">Connect to VIOBench results</a>
          <Link href="/references/">Primary references</Link>
          <a href={epica.docs}>EPICA documentation ↗</a>
        </aside>
        <article className="prose">
          <section id="workflow">
            <h2>EPICA evaluation workflow</h2>
            <p>
              EPICA provides trajectory loading, time synchronization, sensor-frame
              calibration, world-frame alignment, and error analysis. Its package
              is named <code>epica</code>; the main <code>epa</code> and{" "}
              <code>epica</code> commands are equivalent entry points. Use the
              public documentation for installation, command options, and batch
              evaluation.
            </p>
            <ol className="evaluation-steps">
              <li><span>01</span><div><strong>Trajectory preparation</strong><p>Keep the reference, estimate, timestamps, and pose conventions together.</p></div></li>
              <li><span>02</span><div><strong>Temporal and spatial alignment</strong><p>Inspect the temporal offset, sensor-frame relationship, and permitted world transform.</p></div></li>
              <li><span>03</span><div><strong>Error metrics and evaluated extent</strong><p>Compute absolute and relative errors on explicitly identified poses and segments.</p></div></li>
              <li><span>04</span><div><strong>Diagnostics and reproducibility records</strong><p>Save metrics, plots, configuration, output status, and the exact input and software versions.</p></div></li>
            </ol>
          </section>
          <section id="prepare">
            <h2>Frames, timestamps, and reference data</h2>
            <p>
              Estimated camera poses and reference IMU or marker poses describe different physical frames. Establish the pose direction, axes, position units, quaternion ordering and rotation convention, and sensor-to-reference transform before computing an error. Also identify whether the saved poses were produced online, retrospectively smoothed, or corrected by loop closure. A common text format does not make these outputs equivalent.
            </p>
            <p>
              Check timestamp units, valid reference intervals, and output gaps.
              State whether correspondence uses nearest-time matching or
              interpolation, its tolerance, and any resampling. EPICA can estimate
              a time offset from rotational motion; inspect the synchronization
              diagnostics, especially when the recording has little rotation.
            </p>
            <p><Link href="/learn/coordinate-frames/">Review coordinate frames</Link> · <Link href="/learn/calibration-and-time/">Review calibration and timing</Link></p>
            <SourceList sources={[
              { title: "OpenVINS: recording and evaluating estimator outputs", url: "https://docs.openvins.com/eval-error.html" },
              { title: "Zhang and Scaramuzza: quantitative trajectory evaluation", url: "https://rpg.ifi.uzh.ch/docs/IROS18_Zhang.pdf" },
            ]} />
          </section>
          <section id="alignment">
            <h2>Alignment transformations</h2>
            <div className="table-scroll evaluation-table">
              <table>
                <thead><tr><th scope="col">MODE</th><th scope="col">PERMITTED TRANSFORM</th><th scope="col">WHEN TO USE IT</th></tr></thead>
                <tbody>
                  <tr><th scope="row"><code>se3</code></th><td>Rotation and translation; fixed scale.</td><td>Metric-scale VIO or odometry under a stated rigid alignment policy.</td></tr>
                  <tr><th scope="row"><code>posyaw</code></th><td>Yaw and translation; fixed scale.</td><td>Metric-scale VIO in a common gravity frame; leaves roll, pitch, and scale errors visible.</td></tr>
                  <tr><th scope="row"><code>sim3</code></th><td>Rotation, translation, and scale.</td><td>Scale-ambiguous visual odometry or SLAM; report the fitted scale.</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              These mode names describe the permitted world-alignment model, not the complete evaluation procedure. EPICA uses reference trajectories to fit temporal offset and sensor-frame calibration. The reviewed public release also uses reference-dependent scores to select alignment candidates and fitting subsets. Record the fitted quantities, selection settings, and fitting intervals. This ground-truth-assisted procedure should be identified separately from a conventional evaluation using fixed calibration and a prescribed alignment fit.
            </p>
            <p>
              For a comparison, choose the same policy before evaluating methods.
              When comparing evaluation procedures, retain a fixed standard
              alignment baseline. Do not select a different alignment or fitting
              interval for each method simply because it gives a lower error.
            </p>
            <p><a href={epica.cli + "#epa-alignment-modes"}>EPICA alignment modes and options ↗</a></p>
            <SourceList sources={[
              { title: "EPICA: alignment pipeline", url: epica.architecture },
              { title: "EPICA 0.1.17: reviewed public release", url: "https://pypi.org/project/epica/0.1.17/" },
              { title: "Zhang and Scaramuzza: alignment assumptions", url: "https://rpg.ifi.uzh.ch/docs/IROS18_Zhang.pdf" },
            ]} />
          </section>
          <section id="metrics">
            <h2>Absolute and relative trajectory error</h2>
            <h3>Absolute trajectory error (ATE)</h3>
            <p>
              For one run, compare each aligned estimated pose with its associated reference pose. Position RMSE is the square root of the mean squared Euclidean position error. Orientation RMSE can be formed from relative-rotation angles under a declared rotation convention. Report position and orientation separately, with meters and the chosen angular unit; state the statistic instead of using ATE to imply a universal aggregation.
            </p>
            <MathBlock latex={String.raw`e_{\mathrm{pos}}=\sqrt{\frac{1}{N}\sum_{i=1}^{N}\left\|\hat{\mathbf p}_i-\mathbf p_i\right\|_2^2}`} />
            <p className="small">
              Here p̂ᵢ is an aligned estimate, pᵢ its reference, and N the number
              of evaluated pose correspondences. This N is different from the
              sequence counts in the leaderboard.
            </p>
            <p>
              Keep the levels of averaging separate. A mean of repeated-run
              trajectory RMSEs differs from a time-indexed RMSE across runs and
              from pooling every squared pose error before taking a square root.
              A mean of sequence RMSEs is another aggregation. State its weights,
              contributing counts, and missing-value rule; do not use one count
              for poses, pose pairs, runs, and sequences.
            </p>
            <h3>Relative pose error (RPE)</h3>
            <p>
              Compare the estimated motion between two poses with the reference
              motion over the same pair. Specify how pairs are selected: a time
              interval, traveled distance, or frame separation. State the
              interval, translation and rotation units, and aggregation statistic.
              Different segment lengths answer different questions.
            </p>
            <p>
              Distance-normalized translation drift divides a segment’s
              translation error by its length. An error in meters and a drift
              percentage are different metrics. Likewise, an angular error in
              degrees is different from degrees per meter.
            </p>
            <SourceList sources={[
              { title: "EPICA error metrics", url: epica.metrics },
              { title: "OpenVINS trajectory evaluation definitions", url: "https://docs.openvins.com/eval-metrics.html" },
            ]} />
          </section>
          <section id="coverage">
            <h2>Evaluated trajectory extent</h2>
            <p>
              Full-trajectory metrics evaluate the associated trajectory under
              the chosen processing settings. Missing estimates and unavailable
              reference poses still need separate accounting: “full” does not
              establish that output covered the entire recording.
            </p>
            <p>
              Drift-valid metrics retain local segments that pass the evaluator’s
              drift rules. They describe performance on that retained portion.
              Report them beside full-trajectory error and the amount of path
              retained. A small error on a short surviving portion cannot stand
              in for performance over the complete run.
            </p>
            <p>
              EPICA reports a drift-valid path fraction: retained reference path length divided by the reference path length supplied to that evaluation stage after its association and preprocessing. This differs from recording-wide time coverage, matched-sample coverage, and the fraction of attempted runs that finish. Preserve the evaluator version, local rules and thresholds, global-failure status, and the information needed to identify retained segments. Public release 0.1.17 and the live documentation differ in global-gate behavior, so check the installed implementation before interpreting that status.
            </p>
            <Callout title="Missing data and execution outcomes">
              <p>
                A missing file, failed initialization, interrupted run, unmatched
                reference, and unavailable metric are different outcomes. Keep
                the attempt list and failure reason. Missing values stay missing;
                an error of zero means a measured zero.
              </p>
            </Callout>
            <SourceList sources={[
              { title: "EPICA: metric definitions", url: epica.metrics },
              { title: "EPICA 0.1.17: reviewed public release", url: "https://pypi.org/project/epica/0.1.17/" },
            ]} />
          </section>
          <section id="run-epica">
            <h2>EPICA installation and command-line evaluation</h2>
            <p>
              Start with one reference and one estimate from the same recording.
              EPICA requires Python 3.10 or newer. The commands below use Python
              3.10 and the reviewed public release 0.1.17. Evaluate saved files in
              a separate environment: Ubuntu 20.04’s default Python 3.8 in the
              OpenVINS run guide is too old for EPICA.
            </p>
            <CodeBlock label="INSTALL AND CHECK THE VERSION" code={'python3.10 -m venv .venv-epica\nsource .venv-epica/bin/activate\npython -m pip install epica==0.1.17\npython -m pip show epica\nepa --help'} />
            <p>
              For two TUM-format files, each row is{" "}
              <code>t tx ty tz qx qy qz qw</code>, with time in seconds and position
              in meters. Replace the example filenames with your own files.
            </p>
            <CodeBlock label="ONE TRAJECTORY PAIR · METRIC-SCALE VIO" code={'epa reference.tum estimate.tum \\\n  --gt-format tum --est-format tum \\\n  --mode se3'} />
            <p>
              Inspect the run directory under <code>outputs/</code>. Start with
              the alignment diagnostics and <code>metrics.json</code>; use the
              available reports and plots to check temporal overlap, fitted
              transforms, error distributions, and retained segments before
              copying a summary value. Save the command and package version
              alongside the original input files.
            </p>
            <p className="small">
              Commands follow the public EPICA interface; this website release
              does not execute the evaluation. The public package and latest
              documentation can differ, so check installed command options and
              output fields. These commands do not reconstruct the historical
              VIOBench evaluation settings.
            </p>
            <div className="evaluation-doc-links">
              <a href={epica.quickstart}><strong>Quick start ↗</strong><span>Installation, input formats, and outputs.</span></a>
              <a href={epica.cli}><strong>CLI reference ↗</strong><span>Alignment, time handling, and metric options.</span></a>
              <a href={epica.benchmark}><strong>Batch evaluation ↗</strong><span>Prepare many cases and collect summaries.</span></a>
              <a href={epica.architecture}><strong>EPICA architecture ↗</strong><span>Synchronization, calibration, and metric computation.</span></a>
            </div>
          </section>
          <section id="compare">
            <h2>Interpretation of VIOBench results</h2>
            <p>
              VIOBench’s current accuracy snapshot uses the report’s{" "}
              <code>epa-drift valid</code> selection, labeled a verification
              candidate. Each dataset mean averages finite reported sequence
              RMSEs; the displayed n counts contributing sequences. Neither n
              nor N_report measures valid path length or successful runs.
            </p>
            <p>
              The archived <code>SR (epa)</code> and RPE headings retain their
              historical source labels. Current EPICA documentation does not
              retroactively establish the version, threshold, denominator, or
              pair conventions used for those historical values. Use the
              release-specific protocol notes beside the source tables.
            </p>
            <p>
              Runtime, CPU, and memory are measured while running the estimator.
              They are separate from trajectory scoring; their instrumentation
              and platform conditions are documented with the resource results.
            </p>
            <div className="button-row">
              <Link className="button primary" href="/results/accuracy/">Accuracy leaderboard →</Link>
              <Link className="button secondary" href="/benchmark/protocol/">Results protocol and provenance →</Link>
            </div>
          </section>
          <p className="small evaluation-reviewed">EPICA public documentation and package availability checked {epica.checkedOn}. <a href={epica.package}>Public package ↗</a></p>
        </article>
      </div>
    </>
  );
}
