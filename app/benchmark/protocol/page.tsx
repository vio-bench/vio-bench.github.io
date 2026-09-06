import Link from "next/link";
import { PageIntro } from "@/components/ui";
import accuracy from "@/public/data/accuracy.json";
export const metadata = { title: "Results protocol, metrics and provenance" };
export default function Protocol() {
  return (
    <>
      <PageIntro
        eyebrow="BENCHMARK / PROTOCOL & PROVENANCE"
        title="Definitions that travel with the results."
        description="How the published result views select, aggregate, and display values from the committed Results report."
      />
      <div className="container page-content article-layout">
        <aside className="sidebar">
          <strong>Measurement notes</strong>
          <Link href="/evaluation/">Evaluation guide & EPICA</Link>
          <a href="#source">Source and version</a>
          <a href="#accuracy">Accuracy</a>
          <a href="#missing">Missing values and annotations</a>
          <a href="#resources">Runtime and resources</a>
          <a href="#tables">Complete source tables</a>
          <a href="#reproduction">Reproduction</a>
        </aside>
        <article className="prose">
          <div className="callout">
            <strong>Learn the evaluation workflow</strong>
            <p>
              Start with the <Link href="/evaluation/">Evaluation guide</Link> for
              frames, synchronization, alignment, ATE, RPE, and EPICA. The notes
              below document the specific published Results snapshot.
            </p>
          </div>
          <section id="source">
            <h2>Source and publication version</h2>
            <p>
              This release uses Results revision{" "}
              <code>{accuracy.source.revision}</code>, checked on 6 September
              2026. The website does not rerun an estimator or re-evaluate a
              trajectory. Each public JSON export carries the source revision
              and its applicable definitions.
            </p>
            <p>
              The accuracy data were regenerated through the canonical figure
              workflow. All 180 dataset/configuration/metric cells were checked
              against their sequence-level contribution ledger. The three
              current resource tables are byte-identical to the previously
              reviewed resource evidence; every exported resource value was
              checked against the current committed source rows.
            </p>
            <p>
              Original per-run trajectories, logs, complete build
              configurations, and private source documents are not bundled here.
              The published normalized records retain opaque source identifiers
              and verification hashes where available.
            </p>
          </section>
          <section id="accuracy">
            <h2>Accuracy: one protocol at a time</h2>
            <p>
              The main leaderboard uses{" "}
              <strong>ATE under epa-drift valid</strong>, with protocol status{" "}
              <strong>verification candidate</strong>. “Drift valid” is part of
              the evaluation selection name; the displayed metric is ATE, not
              RPE. The author-confirmed source pair stores orientation RMSE in
              degrees first and position RMSE in meters second. The website
              offers them as separate metrics.
            </p>
            <p>
              A dataset cell is an equal arithmetic mean of finite per-sequence
              reported RMSEs. Source group Average columns are excluded. The
              website does not pool trajectory samples, average group averages,
              select each system’s best protocol, or recompute the run-level
              aggregation inside a reported sequence value.
            </p>
            <p>
              Sorting uses the unrounded reported values. A dataset mean can use
              a different set of available sequences for each configuration. The
              sequence selector narrows the comparison to one recording; it does
              not establish equal evaluated trajectory intervals across
              implementations.
            </p>
            <p>
              <strong>n</strong> counts finite contributing sequence values.{" "}
              <strong>N_report</strong> counts sequence headers present in the
              selected-protocol report. Neither is a successful-run count, a
              total-attempt count, nor temporal/path coverage. Planned
              evaluation denominators remain unestablished.
            </p>
            <p>
              Historical platform and input-variant fields are unspecified in
              the trajectory tables. ROVIO, DM-VIO, and AirSLAM camera-mode
              groupings carry a dagger: the display assignment is supported by
              implementation review, while linkage to the original historical
              runs remains pending.
            </p>
          </section>
          <section id="missing">
            <h2>Missing states and source failure marks</h2>
            <p>
              True zero, dash, NaN, other nonfinite values, and absent records
              remain distinct in the downloadable ledger. A missing
              configuration record is shown as NR in the overview; missing
              metric values do not become zero. Absence does not prove
              unsupported operation or execution failure.
            </p>
            <p>
              Source annotations are preserved: * means one mid-run failure, **
              means two, and *** means all runs failed mid-run. Three asterisks
              do not establish that there were three attempts. Finite starred
              values still contribute to the canonical ATE mean; their error
              time intervals are not inferred. An unmarked record does not
              establish that all attempts succeeded.
            </p>
          </section>
          <section id="resources">
            <h2>Runtime and resource measurements</h2>
            <p>
              The resource export contains all 164 actual source rows for five
              fixed inputs and three platform labels: Desktop, Jetson Orin, and
              Jetson Nano. It contains monocular and stereo configurations with
              asymmetric platform/input availability. The rows are not a
              complete Cartesian product of every system and condition.
            </p>
            <p>
              <strong>Native total time (ms)</strong> retains
              implementation-specific instrumentation boundaries. It is not
              harmonized end-to-end latency or a real-time guarantee. Tracking
              and estimation stages are not summed to manufacture a missing
              total.
            </p>
            <p>
              <strong>Reported host CPU (%)</strong> retains the source
              collector’s values, including percentages above 100. Equivalent
              normalization across platforms has not been established.{" "}
              <strong>Reported process memory (MiB)</strong> retains the source
              VINS/process field; it is not relabeled as verified RSS or PSS.
              Exact processor, power mode, clocks, and build settings are not
              linked to these normalized rows.
            </p>
            <p>
              Means are unweighted averages of selected per-run summaries,
              excluding missing metrics. Source rows normally list five selected
              runs. The EuRoC V1_01_easy monocular and stereo √VINS rows on
              Jetson Orin each list one. Per-metric contributing run counts and
              total attempts are unavailable.
            </p>
            <p>
              Extended standard deviations are means of within-run population
              standard deviations, not estimates of across-run variability.
              Extended p95 and peak values average per-run summaries; they are
              not computed from pooled samples. GPU values are present only in
              three Desktop rows; the Jetson source tables have no GPU columns.
            </p>
            <p>
              GrandTour is the source-reported standard input. Other profiling
              input variants are unspecified. The report mentions seven omitted
              combinations without identifying them in these retained tables. No
              failure rate, energy, or overall deployment conclusion is inferred
              from those omissions or resource values.
            </p>
          </section>
          <section id="tables">
            <h2>Complete source tables</h2>
            <p>
              The archive preserves all 157 tables from the five Final dataset
              sections: each group, original metric heading, method label,
              sequence column, source Average, and cell string. ATE evaluator
              variants remain separate. SR stays <code>SR (epa)</code>; this
              website does not expand it into a success-rate definition or
              invent its denominator. RPE intervals are retained in their
              headings, while pair ordering and units are not newly assigned
              here.
            </p>
            <p>
              The source Average column is transcribed as reported and excluded
              from canonical leaderboard aggregation. The archive provides
              access to complete reported content; it does not turn legacy or
              differently defined metrics into a combined ranking.
            </p>
          </section>
          <section id="reproduction">
            <h2>Reproduction and downloads</h2>
            <p>
              For a reproducible estimator run, retain the input files and
              conversion, calibration, camera mode, exact code/build, hardware
              settings, output span, timestamp association, alignment method and
              fit interval, relative-error interval, attempted-run list, and
              incomplete-run handling.
            </p>
            <p>
              The website’s OpenVINS guide documents one public upstream
              workflow. The Results package contains reported values and
              provenance, not a complete execution environment for every
              historical benchmark run.
            </p>
            <ul>
              <li>
                <a href="/data/results-bac8b9f.zip" download>
                  Complete Results package
                </a>
              </li>
              <li>
                <a href="/data/accuracy.json" download>
                  Accuracy summary and sequence ledger
                </a>
              </li>
              <li>
                <a href="/data/efficiency.json" download>
                  Resource and extended metric records
                </a>
              </li>
              <li>
                <a href="/data/source-tables.json" download>
                  All original dataset result tables
                </a>
              </li>
            </ul>
          </section>
          <div className="lesson-nav">
            <Link href="/results/">← Results overview</Link>
            <Link href="/run/openvins/">Run OpenVINS →</Link>
          </div>
        </article>
      </div>
    </>
  );
}
