import Link from "next/link";
import { PageIntro, ButtonLink, Callout } from "@/components/ui";
import accuracy from "@/public/data/accuracy.json";
import resources from "@/public/data/efficiency.json";
export const metadata = { title: "VIOBench benchmark design" };
export default function Benchmark() {
  return (
    <>
      <PageIntro
        eyebrow="BENCHMARK / DESIGN & SCOPE"
        title="A cross-domain view of VIO systems."
        description="VIOBench brings together reported trajectory accuracy and computational measurements for public VIO implementations, with the input, configuration, and evaluation context kept alongside each result."
      >
        <div className="button-row">
          <ButtonLink href="/results/">Explore all results</ButtonLink>
          <ButtonLink href="/evaluation/" secondary>
            Evaluation with EPICA
          </ButtonLink>
        </div>
      </PageIntro>
      <div className="container page-content">
        <div className="benchmark-summary">
          <div>
            <span>Public system families</span>
            <strong>11 implementations</strong>
          </div>
          <div>
            <span>Dataset domains</span>
            <strong>5 datasets</strong>
          </div>
          <div>
            <span>Accuracy configurations</span>
            <strong>18 mono / stereo rows</strong>
          </div>
          <div>
            <span>Resource platforms</span>
            <strong>Desktop · Orin · Nano</strong>
          </div>
        </div>
        <h2>Dataset and result coverage</h2>
        <p>
          The trajectory report contains 98 sequence headers. The table below
          describes that report inventory, not the number of planned runs or
          successful attempts. Each accuracy cell retains its own number of
          finite sequence contributions.
        </p>
        <div className="table-scroll benchmark-scope-table">
          <table>
            <thead>
              <tr>
                <th scope="col">DATASET</th>
                <th scope="col">REPORT SEQUENCES</th>
                <th scope="col">FIXED RESOURCE INPUT</th>
                <th scope="col">RESULTS</th>
              </tr>
            </thead>
            <tbody>
              {accuracy.datasets.map((d) => {
                const input = resources.inputs.find(
                  (i) => i.dataset === d.name,
                );
                return (
                  <tr key={d.id}>
                    <th scope="row">{d.name}</th>
                    <td>{d.N_report}</td>
                    <td>{input?.sequence ?? "See resource records"}</td>
                    <td>
                      <Link
                        href={`/results/accuracy/?dataset=${d.id}&mode=mono&metric=position&sequence=all`}
                      >
                        Accuracy →
                      </Link>
                      {input && (
                        <>
                          <br />
                          <Link
                            href={`/results/efficiency/?input=${input.id}&platform=Desktop&mode=mono&metric=nativeTotalMs`}
                          >
                            Resources →
                          </Link>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="benchmark-overview-grid">
          <article>
            <h2>What a comparison identifies</h2>
            <h3>The implementation and its input</h3>
            <p>
              A system name alone is insufficient. Retain camera mode, input
              conversion, calibration, estimator configuration, and software
              version. Mono and stereo records remain separate; uncertain
              historical modes are visibly marked in the accuracy views.
            </p>
            <h3>The output being evaluated</h3>
            <p>
              The main accuracy view reports position and orientation ATE using
              the canonical <code>epa-drift valid</code> selection. It keeps
              finite-value counts and source failure annotations. Other ATE
              protocols, SR, and RPE tables are preserved under their original
              headings in the complete source archive.
            </p>
            <h3>The computation being measured</h3>
            <p>
              Resource records describe five fixed profiling sequences, not
              dataset-wide resource averages. They retain implementation-native
              total timing, CPU, and process memory. Individual records expose
              the extended source statistics and selected-run count.
            </p>
          </article>
          <aside className="benchmark-route">
            <span className="eyebrow">
              FROM THE REPORT TO A REPRODUCIBLE RUN
            </span>
            <h2>Follow the evidence.</h2>
            <p>
              Use the overview for the reported pattern, the leaderboard for a
              selected condition, and the row detail or source table for its
              underlying values.
            </p>
            <p>
              <Link className="text-link" href="/results/">
                Results overview →
              </Link>
            </p>
            <p>
              <Link className="text-link" href="/results/tables/">
                All 157 source tables →
              </Link>
            </p>
            <p>
              <Link className="text-link" href="/run/openvins/">
                OpenVINS implementation guide →
              </Link>
            </p>
            <p>
              <Link className="text-link" href="/evaluation/">
                Understand evaluation with EPICA →
              </Link>
            </p>
          </aside>
        </div>
        <Callout title="Publication status">
          <p>
            The website transcribes and organizes a committed Results snapshot.
            The accuracy protocol remains labeled a verification candidate;
            unspecified historical run fields remain unspecified. Displaying a
            result does not certify that all configurations share identical
            evaluated intervals, input files, or builds.
          </p>
        </Callout>
        <div className="data-links">
          <a href="/data/results-bac8b9f.zip" download>
            Download the complete published Results package (ZIP)
          </a>
          <Link href="/benchmark/protocol/">Definitions and provenance →</Link>
        </div>
      </div>
    </>
  );
}
