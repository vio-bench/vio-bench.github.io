import Link from "next/link";
import { PageIntro, SourceList } from "@/components/ui";
import { MathBlock } from "@/components/math-block";
import references from "@/data/technical-references.json";

export const metadata = {
  title: "Notation and primary references",
  description: "Frame, quaternion, IMU state, and measurement conventions used in the VIOVERSE tutorials, with primary technical references.",
};

export default function References() {
  return (
    <>
      <PageIntro
        eyebrow="TUTORIALS / NOTATION AND REFERENCES"
        title="Notation and primary references"
        description="The tutorial formulation follows OpenVINS and the work of Guoquan Huang, Patrick Geneva, Chuchu Chen, and Yulin Yang. Individual sections cite the paper or derivation supporting the explanation."
      />
      <div className="container page-content article-layout">
        <aside className="sidebar">
          <strong>Contents</strong>
          <a href="#frames">Frames and transforms</a>
          <a href="#quaternions">Quaternions and state</a>
          <a href="#measurements">Measurement conventions</a>
          <a href="#assumptions">Estimation and evaluation</a>
          <a href="#papers">Primary references</a>
          <Link href="/learn/">Tutorial contents</Link>
        </aside>
        <article className="prose">
          <section id="frames">
            <h2>Frames and transforms</h2>
            <p>
              G denotes a local global frame, I the IMU frame, and C a camera
              frame. A rotation carries destination–source subscripts: R_AB
              maps vector coordinates from B into A. The corresponding rigid
              transform also contains a translation, the origin of B expressed
              in A. This is equivalent to the superscript
              and subscript notation used in the OpenVINS derivations.
            </p>
            <MathBlock latex={String.raw`\mathbf R_{AB}\equiv{}^{A}_{B}\mathbf R,\qquad {}^A\mathbf p=\mathbf R_{AB}\,{}^B\mathbf p+{}^A\mathbf p_B`} />
            <p>
              R_IG maps G into I; R_CI maps I into C. The IMU position and
              velocity are expressed in G. An estimated IMU pose and a reference
              marker pose require a sensor-frame conversion before comparison.
              The <Link href="/learn/coordinate-frames/">coordinate-frame
              lesson</Link> develops transform inversion and composition.
            </p>
            <SourceList sources={[
              { title: "OpenVINS: state and calibration definitions", url: "https://docs.openvins.com/classov__msckf_1_1State.html" },
              { title: "OpenVINS: camera measurement model", url: "https://docs.openvins.com/update-feat.html" },
            ]} />
          </section>
          <section id="quaternions">
            <h2>Quaternions and the IMU state</h2>
            <p>
              OpenVINS represents R_IG with a unit JPL quaternion: three vector
              components followed by the scalar, with a left-multiplicative
              attitude error. Quaternion algebra, component order, and rotation
              direction must all be specified. An exported file or ROS message
              must be interpreted according to its own interface; four fields
              labeled qx, qy, qz, qw do not specify all these choices.
            </p>
            <MathBlock latex={String.raw`\bar q=\begin{bmatrix}\mathbf q_v^{\mathsf T}&q_4\end{bmatrix}^{\mathsf T},\qquad \bar q=\delta\bar q\otimes\hat{\bar q},\qquad \|\bar q\|=1`} />
            <p>
              Six-degree-of-freedom (6-DoF) pose consists of position and
              orientation. The basic IMU navigation state additionally contains
              velocity and gyroscope and accelerometer biases. It stores 16
              scalars when orientation uses a unit quaternion; its local error
              state has 15 coordinates. Pose clones, landmark states, and
              estimated calibration parameters enlarge the full estimator state.
            </p>
            <SourceList sources={[
              { title: "OpenVINS: JPL quaternion convention", url: "https://docs.openvins.com/classov__type_1_1JPLQuat.html" },
              { title: "OpenVINS: IMU state and error coordinates", url: "https://docs.openvins.com/classov__type_1_1IMU.html" },
            ]} />
          </section>
          <section id="measurements">
            <h2>Measurement and timing conventions</h2>
            <p>
              An accelerometer measures specific force. Following OpenVINS,
              the gravity symbol below is positive along the global upward
              axis; physical gravitational acceleration is its negative. The
              equation assumes corrected IMU scale and axis-misalignment effects.
              Measured acceleration, bias, and measurement noise are expressed
              in I; velocity is expressed in G.
            </p>
            <MathBlock latex={String.raw`\mathbf g_G=\begin{bmatrix}0&0&g\end{bmatrix}^{\mathsf T},\qquad {}^G\dot{\mathbf v}_I=\mathbf R_{IG}^{\mathsf T}(\mathbf a_m-\mathbf b_a-\mathbf n_a)-\mathbf g_G`} />
            <p>
              Here g is approximately 9.81 m/s². The corresponding ideal
              stationary reading is R_IG g_G. Continuous-time noise densities,
              discrete measurement variance, and bias random walk are distinct
              quantities. For camera–IMU timing, OpenVINS and Kalibr use
              t_imu = t_cam + t_off, with times in seconds. The
              <Link href="/learn/calibration-and-time/"> calibration lesson</Link>{" "}
              states the noise scaling and offset sign explicitly.
            </p>
            <SourceList sources={[
              { title: "OpenVINS: IMU propagation", url: "https://docs.openvins.com/propagation.html" },
              { title: "Kalibr: time-offset and transform definitions", url: "https://github.com/ethz-asl/kalibr/wiki/yaml-formats" },
              { title: "Kalibr: IMU noise model", url: "https://github.com/ethz-asl/kalibr/wiki/IMU-Noise-Model" },
            ]} />
          </section>
          <section id="assumptions">
            <h2>Estimation and evaluation assumptions</h2>
            <p>
              Observability statements depend on motion, calibration, and
              available measurements. For ordinary VIO with sufficiently
              informative motion and no absolute reference, the four usual
              unobservable directions are global translation and rotation about
              gravity. Degenerate motion can introduce further ambiguities.
              FEJ and marginalization are discussed with their linearization
              assumptions in the <Link href="/learn/filtering-and-optimization/">estimation lesson</Link>.
            </p>
            <p>
              System-specific descriptions retain the formulation in the
              original paper and implementation. For example, sqrtVINS factors
              the state covariance; a square-root inverse filter factors the
              information matrix. These terms cannot be interchanged.
            </p>
            <SourceList sources={[
              { title: "OpenVINS: observability and FEJ", url: "https://docs.openvins.com/fej.html" },
              { title: "Chen et al.: consistency, marginalization, and FEJ", url: "https://pgeneva.com/downloads/papers/Chen2023IROS.pdf" },
              { title: "Peng et al.: sqrtVINS covariance factor", url: "https://chuchuchen.net/pdf/Peng2025TRO.pdf" },
            ]} />
            <p>
              The <Link href="/evaluation/">Evaluation guide</Link> defines
              trajectory association, alignment, errors, and evaluated extent,
              then introduces EPICA. Benchmark numbers retain the
              <Link href="/benchmark/protocol/"> definitions of the published
              Results snapshot</Link>. Current software documentation does not
              retrospectively establish historical evaluation settings.
            </p>
          </section>
          <section id="papers">
            <h2>Primary references</h2>
            <ol className="reference-list">
              {references.map((reference) => (
                <li id={reference.id} key={reference.id}>
                  <p>{reference.authors}. <a href={reference.url}>{reference.title}</a>. {reference.venue}, {reference.year}.</p>
                  <p className="small">{reference.scope}</p>
                </li>
              ))}
            </ol>
            <p className="small">
              Additional implementation and dataset sources are linked in the
              relevant sections.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
