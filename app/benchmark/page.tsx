import Link from "next/link";
import { PageIntro, ButtonLink } from "@/components/ui";
import accuracy from "@/public/data/current-results.json";
import resources from "@/public/data/current-efficiency.json";
import { DatasetProfiles } from "@/components/dataset-profiles";
import systems from "@/data/benchmark-systems.json";

export const metadata = {
  title: "VIOverse benchmark",
  description: "A cross-domain benchmark of 11 open-source visual–inertial odometry systems on 98 selected sequences from five public datasets, with desktop and embedded computational profiling.",
};

const datasetScope: Record<string, { domain: string; resourceName: string; stereo: boolean }> = {
  euroc: { domain: "Indoor micro-aerial flight", resourceName: "EuRoC MAV", stereo: true },
  "uzh-fpv": { domain: "Aggressive flight", resourceName: "UZH-FPV", stereo: true },
  aqualoc: { domain: "Underwater navigation", resourceName: "AQUALOC", stereo: false },
  lamaria: { domain: "Egocentric wearable sensing", resourceName: "LaMAria", stereo: false },
  grandtour: { domain: "Legged field robotics", resourceName: "GrandTour", stereo: true },
};
const platforms = [
  { name: "Desktop", cpu: "Xeon Gold 6230R", architecture: "x86-64", cores: "26 / 52" },
  { name: "Jetson AGX Orin", cpu: "Cortex-A78AE", architecture: "ARM64", cores: "12 / 12" },
  { name: "Jetson Nano", cpu: "Cortex-A57", architecture: "ARM64", cores: "4 / 4" },
];

export default function Benchmark() {
  return (
    <div className="benchmark-design-page">
      <PageIntro
        title="VIOverse benchmark"
        description="We compare 11 open-source VIO systems on 98 selected sequences from five public datasets. All reported results come from our own experiments and evaluations. Trajectory error is reported together with valid-path coverage, complemented by computational profiling on desktop and embedded platforms."
      >
        <div className="button-row">
          <ButtonLink href="/results/">Explore results</ButtonLink>
          <ButtonLink href="/results/#calculation" secondary>Evaluation rules</ButtonLink>
        </div>
      </PageIntro>

      <div className="container page-content benchmark-design-content">
        <section aria-labelledby="benchmark-systems">
          <h2 id="benchmark-systems">Evaluated systems</h2>
          <p>
            We select 11 open-source VIO systems spanning a decade of development,
            from 2015 to 2025. The suite combines direct, KLT-based,
            descriptor-based, and learned visual processing with filtering- and
            optimization-based state estimation. The table summarizes the design
            characteristics reported in the paper and the camera modes evaluated
            in this benchmark.
          </p>
          <p>
            Monocular and stereo configurations are evaluated separately when
            available. Loop closure and global map optimization are disabled to
            focus on local visual–inertial estimation.
          </p>
          <div className="table-scroll benchmark-scope-table">
            <table className="system-design-table">
              <caption className="sr-only">Design characteristics from Table I of the paper, with the camera modes included in VIOverse. Systems are ordered by year.</caption>
              <thead><tr><th scope="col">System</th><th scope="col">Year</th><th scope="col">Visual frontend</th><th scope="col">State estimator</th><th scope="col">Evaluated modes</th></tr></thead>
              <tbody>{systems.map(system => {
                const modes = ["mono", "stereo"].filter(mode => accuracy.configurations.some(c => c.system === system.id && c.mode === mode));
                return <tr key={system.id}>
                  <th scope="row"><a href={system.github} target="_blank" rel="noopener noreferrer" aria-label={`${system.name} on GitHub`}>{system.name} <span aria-hidden="true">↗</span></a></th>
                  <td>{system.year}</td>
                  <td>{system.frontend}</td>
                  <td>{system.estimator}</td>
                  <td className="system-camera-modes">{modes.map(m => m === "mono" ? "Mono" : "Stereo").join(" / ")}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
          <p className="benchmark-detail-note benchmark-repository-note">System names link to their upstream GitHub repositories.</p>
          <p className="benchmark-detail-note system-terminology">KLT: Kanade–Lucas–Tomasi tracking; EKF: extended Kalman filter; MSCKF: multi-state constraint Kalman filter.</p>
        </section>

        <section aria-labelledby="benchmark-datasets">
          <h2 id="benchmark-datasets">Datasets and operating domains</h2>
          <p>
            Five datasets cover aerial, underwater, wearable, and legged operation.
            Only camera and IMU measurements are estimator inputs; reference
            trajectories are used for evaluation.
          </p>
          <DatasetProfiles />
          <p className="benchmark-detail-note hardware-scope-note">Input rates and camera modes follow the benchmark settings in the paper. Other sensors visible on the recording platforms are not VIO inputs.</p>
        </section>

        <section aria-labelledby="benchmark-platforms">
          <h2 id="benchmark-platforms">Computing platforms</h2>
          <p>
            Computational profiling uses Desktop, NVIDIA Jetson AGX Orin, and
            NVIDIA Jetson Nano. Source changes are limited to build portability
            and compiler compatibility. AirSLAM is evaluated only on Desktop.
          </p>
          <div className="table-scroll benchmark-scope-table">
            <table>
              <caption className="sr-only">CPU specifications of the three profiling platforms, as reported in the paper.</caption>
              <thead><tr><th scope="col">Platform</th><th scope="col">CPU</th><th scope="col">Architecture</th><th scope="col">Cores / threads</th></tr></thead>
              <tbody>{platforms.map(platform => <tr key={platform.name}>
                <th scope="row">{platform.name}</th><td>{platform.cpu}</td><td>{platform.architecture}</td><td>{platform.cores}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <p>
            Profiling uses one fixed sequence from each dataset. These
            measurements describe the selected inputs, rather than dataset-wide
            average resource requirements.
          </p>
          <details className="benchmark-inputs">
            <summary>Five profiling inputs</summary>
            <dl>{accuracy.datasets.map(dataset => {
              const input = resources.inputs.find(i => i.dataset === datasetScope[dataset.id].resourceName);
              return input ? <div key={dataset.id}><dt>{dataset.label}</dt><dd><Link href={`/results/efficiency/?input=${input.id}&platform=Desktop&mode=mono`}>{input.sequence}{dataset.id === "grandtour" ? " (standard input)" : ""}</Link></dd></div> : null;
            })}</dl>
          </details>
        </section>

        <section aria-labelledby="benchmark-measures">
          <h2 id="benchmark-measures">Reported measurements</h2>
          <dl className="benchmark-measures">
            <div><dt><Link href="/results/tables/">Trajectory error</Link></dt><dd>Position and orientation ATE, and translational and rotational RPE over specified segment lengths. Errors use SE(3) alignment without scale fitting and retained valid trajectory portions.</dd></div>
            <div><dt><Link href="/results/current/">Valid-path coverage (SR)</Link></dt><dd>The percentage of the complete reference path covered by valid estimates. SR is averaged over three expected runs per sequence. Only runs with SR ≥ 75% contribute to ATE and RPE.</dd></div>
            <div><dt><Link href="/results/efficiency/">Runtime and resources</Link></dt><dd>Reported native processing time, CPU utilization, and process memory for each profiling input and platform. Native timings retain implementation-specific measurement boundaries.</dd></div>
          </dl>
          <p className="benchmark-detail-note"><Link href="/results/#calculation">Metric definitions and aggregation</Link> are provided alongside the results.</p>
        </section>

      </div>
    </div>
  );
}
