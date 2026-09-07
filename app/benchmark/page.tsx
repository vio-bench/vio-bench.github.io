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
        title="VIOBench: scope and reported experiments"
        description="Reported trajectory errors and computational measurements for public VIO implementations, organized by dataset and configuration. Available input and evaluation metadata accompany each record."
      >
        <div className="button-row">
          <ButtonLink href="/results/">Benchmark results</ButtonLink>
          <ButtonLink href="/evaluation/" secondary>
            Evaluation with EPICA
          </ButtonLink>
        </div>
      </PageIntro>
      <div className="container page-content">
        <div className="benchmark-summary">
          <div>
            <span>System implementations</span>
            <strong>11 implementations</strong>
          </div>
          <div>
            <span>Datasets</span>
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
        <h2>Dataset inventory and reported results</h2>
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
            <h2>Experimental conditions and measurements</h2>
            <h3>Implementation and input configuration</h3>
            <p>
              A system name alone is insufficient. Retain camera mode, input
              conversion, calibration, estimator configuration, and software
              version. Mono and stereo records remain separate; uncertain
              historical modes are visibly marked in the accuracy views.
            </p>
            <h3>Trajectory metrics</h3>
            <p>
              The main accuracy view reports position and orientation ATE using
              the canonical <code>epa-drift valid</code> selection. It keeps
              finite-value counts and source failure annotations. Other ATE
              protocols, SR, and RPE tables are preserved under their original
              headings in the complete source archive.
            </p>
            <h3>Computational measurements</h3>
            <p>
              Resource records describe five fixed profiling sequences, not
              dataset-wide resource averages. They retain implementation-native
              total timing, CPU, and process memory. Individual records expose
              the extended source statistics and selected-run count.
            </p>
          </article>
          <aside className="benchmark-route">
            <span className="eyebrow">
              RESULTS AND IMPLEMENTATION DOCUMENTATION
            </span>
            <h2>Result tables and supporting documentation</h2>
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
                EPICA evaluation guide →
              </Link>
            </p>
          </aside>
        </div>
        <Callout title="Verification status">
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
