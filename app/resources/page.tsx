import { PageIntro, SourceList, Callout } from "@/components/ui";
import datasets from "@/data/datasets.json";
import epica from "@/data/epica.json";
export const metadata = { title: "Datasets and resources" };
export default function Resources() {
  return (
    <>
      <PageIntro
        eyebrow="RESOURCES / DATASETS AND SOFTWARE"
        title="Datasets, software, and references"
        description="Dataset documentation, calibration software, trajectory evaluation tools, and technical references."
      />
      <div className="container page-content">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DATASETS</span>
            <h2>Dataset descriptions</h2>
          </div>
          <p>{datasets.intro}</p>
        </div>
        <div className="resource-grid">
          {datasets.datasets.map((d) => (
            <article className="resource-card" key={d.id}>
              <span className="tag">{d.domain}</span>
              <h3>{d.name}</h3>
              <p>{d.description}</p>
              <p className="small">
                <strong>Sensors:</strong> {d.sensors}
              </p>
              <p>
                <strong>Tutorial relevance.</strong> {d.learnFocus}
              </p>
              <p className="small">{d.referenceNote}</p>
              <SourceList
                sources={[
                  { title: "Official dataset & downloads", url: d.url },
                  { title: "Dataset paper", url: d.paperUrl },
                ]}
              />
            </article>
          ))}
        </div>
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">TOOLS & TECHNICAL REFERENCES</span>
              <h2>Software and technical references</h2>
            </div>
          </div>
          <div className="tool-list">
            {[
              {
                title: "VIO notation and primary references",
                body: "Frame and quaternion conventions, IMU state definitions, and the papers supporting these tutorials.",
                url: "/references/",
              },
              {
                title: "EPICA trajectory evaluation toolkit",
                body: "Public documentation for trajectory synchronization, alignment, error metrics, and batch evaluation.",
                url: epica.docs,
              },
              {
                title: "OpenVINS documentation",
                body: "Estimator derivations, state representations, calibration, simulation, and evaluation.",
                url: "https://docs.openvins.com/",
              },
              {
                title: "Robotics & State Estimation (RiSE) tutorials",
                body: "Yulin Yang, Chuchu Chen, and Xingxing Zuo’s course materials on state estimation. See the repository for available lectures and notes.",
                url: "https://github.com/yangyulin/rise-tutorial",
              },
              {
                title: "Kalibr",
                body: "Camera and camera–IMU calibration, time offset conventions, and IMU noise models.",
                url: "https://github.com/ethz-asl/kalibr/wiki",
              },
              {
                title: "evo",
                body: "Trajectory conversion, temporal association, spatial alignment, and error analysis.",
                url: "https://github.com/MichaelGrupp/evo",
              },
              {
                title: "ROS coordinate conventions",
                body: "Units and coordinate conventions in REP 103; dataset and estimator conventions require separate verification.",
                url: "https://www.ros.org/reps/rep-0103.html",
              },
              {
                title: "Trajectory evaluation tutorial",
                body: "Zhang and Scaramuzza’s tutorial connects alignment choices to odometry evaluation.",
                url: "https://rpg.ifi.uzh.ch/docs/IROS18_Zhang.pdf",
              },
              {
                title: "VIOVERSE on GitHub",
                body: "Website source code, proposed additions, and technical issue reports.",
                url: "https://github.com/vio-bench/vio-bench.github.io",
              },
            ].map((t) => (
              <a key={t.title} href={t.url}>
                <strong>{t.title} ↗</strong>
                <p>{t.body}</p>
              </a>
            ))}
          </div>
        </section>
        <Callout title="Sensor selection and evaluation scope">
          <p>
            A multimodal dataset may include LiDAR, pressure, events, GNSS, or
            other measurements. Their presence does not mean a camera–IMU
            estimator uses them. Read sequence-specific calibration and
            ground-truth notes before evaluation.
          </p>
        </Callout>
        <p className="small">
          Dataset sources checked {datasets.checkedAt}. Learning-focus
          descriptions are editorial guidance. Each dataset and upstream project
          retains its own license and usage terms.
        </p>
      </div>
    </>
  );
}
