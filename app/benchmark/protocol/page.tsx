import Link from "next/link";
import snapshot from "@/public/data/runtime.json";
import { PageIntro, Callout } from "@/components/ui";
export const metadata = { title: "Measurement notes and provenance" };
export default function Protocol() {
  return (
    <>
      <PageIntro
        eyebrow="BENCHMARK / MEASUREMENT NOTES"
        title="Keep the context with the number."
        description="The definitions, provenance, and publication limits of the current VIOBench runtime snapshot."
      />
      <div className="container page-content">
        <article className="prose">
          <Callout title={snapshot.status}>
            <p>
              This page documents one published runtime snapshot. The learning
              material explains broader evaluation methods; it does not
              establish an adopted, comprehensive VIOBench evaluation protocol.
            </p>
          </Callout>
          <h2>Input and platform scope</h2>
          <p>
            The records describe monocular runs on LaMAria R_02_easy, with seven
            reported native-time values for Desktop, seven for Jetson Orin, and
            six for Jetson Nano. The source does not identify the input
            conversion variant.
          </p>
          <p>{snapshot.provenance.platformSpecification}</p>
          <h2>Timing and aggregation</h2>
          <p>
            <strong>{snapshot.metric.label}.</strong>{" "}
            {snapshot.metric.definition}
          </p>
          <p>{snapshot.aggregation}</p>
          <h2>Missing values stay missing</h2>
          <p>{snapshot.missingPolicy}</p>
          <ul>
            {snapshot.missingRecords.map((r) => (
              <li key={r.platform + r.system}>
                <strong>
                  {r.system} · {r.platform}:
                </strong>{" "}
                {r.meaning}
              </li>
            ))}
          </ul>
          <h2>What these records cannot establish</h2>
          <ul>
            {snapshot.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <h2>Provenance</h2>
          <p>{snapshot.provenance.verification}</p>
          <p>{snapshot.provenance.sourceVisibility}</p>
          <div className="equation">
            Snapshot: {snapshot.snapshotId}
            <br />
            Source revision: {snapshot.sourceRevision}
            <br />
            Retained source CSV SHA-256:
            <br />
            {snapshot.sourceCsvSha256}
          </div>
          <p className="small">
            The checksum identifies the retained input CSV, not the reformatted
            public CSV download. Source revision and checksum are traceability
            identifiers; the original source is not linked as a public artifact
            in this release.
          </p>
          <h2>Before making a broader comparison</h2>
          <p>
            Report the exact input streams and conversion, calibration,
            estimator mode, build, machine, timing boundary, number of attempted
            and evaluated runs, output coverage, and treatment of incomplete
            runs. For trajectory error, also state the physical pose frame,
            timestamp association, alignment type and fitting interval, and
            relative-error interval.
          </p>
          <p>
            Those details allow a reader to distinguish a fast reported
            component from a usable complete run. Future result releases should
            attach the per-run evidence and a fixed evaluation protocol.
          </p>
          <div className="lesson-nav">
            <Link href="/benchmark/">← Runtime explorer</Link>
            <Link href="/learn/runtime-and-platform/">
              Learn to measure runtime →
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
