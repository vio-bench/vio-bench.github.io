import Link from "next/link";
import { PageIntro } from "@/components/ui";
import references from "@/data/technical-references.json";

export const metadata = {
  title: "Notation and primary references",
  description: "Original definitions of VIO frames, states, measurements, and estimation conventions, with primary references.",
};

export default function References() {
  return (
    <>
      <PageIntro
        eyebrow="TUTORIALS / NOTATION AND REFERENCES"
        title="Notation and primary references"
        description="Read notation and assumptions in the original source. These links locate the OpenVINS definitions and the papers used in the study guides."
      />
      <div className="container page-content article-layout">
        <aside className="sidebar">
          <strong>Contents</strong>
          <a href="#frames">Frames and transforms</a>
          <a href="#quaternions">Quaternions and state</a>
          <a href="#measurements">Measurement conventions</a>
          <a href="#assumptions">Estimation and evaluation</a>
          <a href="#papers">Primary references</a>
          <Link href="/learn/">Study overview</Link>
        </aside>
        <article className="prose">
          <section id="frames">
            <h2>Frames and transforms</h2>
            <p>
              Begin with <a href="https://docs.openvins.com/propagation.html#ins_state">Inertial State Vector</a> in
              the OpenVINS propagation derivation, then read <a href="https://docs.openvins.com/update-feat.html#relative">Euclidean Transformation</a> in
              the camera measurement update. These sections define the state
              frames and camera–IMU geometry used in those derivations.
            </p>
            <p>
              Reading order: <Link href="/learn/coordinate-frames/">Coordinate frames and pose conventions</Link>.
            </p>
          </section>
          <section id="quaternions">
            <h2>Quaternions and the IMU state</h2>
            <p>
              Read <a href="https://docs.openvins.com/classov__type_1_1JPLQuat.html#jplquat_define">JPL Quaternion Definition</a> and
              <a href="https://docs.openvins.com/classov__type_1_1JPLQuat.html#jplquat_errorstate"> Error State Definition</a> together.
              The <a href="https://docs.openvins.com/classov__type_1_1IMU.html">IMU class reference</a> gives
              the corresponding state definition and update operation. For
              exported trajectories, consult <a href="https://docs.openvins.com/eval-error.html">Filter Error Evaluation Methods</a>,
              under Collection and Transformation.
            </p>
          </section>
          <section id="measurements">
            <h2>Measurement and timing conventions</h2>
            <p>
              The OpenVINS <a href="https://docs.openvins.com/propagation.html#imu_measurements">IMU Measurements</a> section
              defines the measurement model and noise terms. Read its IMU
              Kinematic Equations alongside the <a href="https://docs.openvins.com/gs-calibration.html#gs-calib-imu-static">IMU Noise Calibration</a> parameter
              table. The <a href="https://docs.openvins.com/classov__msckf_1_1State.html#a0ef68be4e06e4b4947c86852d1005893">State time-offset parameter</a> documents
              the camera–IMU offset sign.
            </p>
            <p>
              Reading order: <Link href="/learn/calibration-and-time/">Camera–IMU calibration and synchronization</Link>.
            </p>
          </section>
          <section id="assumptions">
            <h2>Estimation and evaluation</h2>
            <p>
              For observability and linearization, read the three sections of
              <a href="https://docs.openvins.com/fej.html"> First-Estimate Jacobian Estimators</a> in
              order. Continue with Sections II–IV of <a href="https://pgeneva.com/downloads/papers/Chen2023IROS.pdf">Optimization-based VINS: Consistency, Marginalization, and FEJ</a>.
              Further readings are organized in <Link href="/learn/filtering-and-optimization/">Filtering and optimization</Link>.
            </p>
            <p>
              The <Link href="/evaluation/">Evaluation guide</Link> documents the
              trajectory comparison workflow and EPICA. For the published result
              tables, use the <Link href="/benchmark/protocol/">benchmark protocol</Link> and
              its source annotations.
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
              relevant study guides.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
