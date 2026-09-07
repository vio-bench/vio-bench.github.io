import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import { AccuracyMatrix } from "@/components/accuracy-matrix";
import source from "@/public/data/accuracy.json";
import type { AccuracyData } from "@/lib/results-types";
const data = source as unknown as AccuracyData;
export const metadata = {
  title: "VIOBench results and leaderboards",
  description: "VIOBench trajectory accuracy, runtime and resource measurements, and original result tables.",
};
export default function Results() {
  return (
    <>
      <PageIntro
        eyebrow="RESULTS / VIOBENCH"
        title="Benchmark results"
        description="Trajectory accuracy and computational measurements from the Results report, indexed by dataset, camera configuration, and metric."
      />
      <div className="container page-content">
        <ResultsNavigation />
        <p className="result-release-note">
          Report revision <code>{data.source.revision.slice(0, 12)}</code> · 6 September 2026 ·{" "}
          <Link href="/benchmark/protocol/">Protocol and provenance</Link>
        </p>
        <p className="results-summary-text">
          The accuracy report contains 18 configurations and 98 sequence headers
          across five datasets. The overview uses the <code>epa-drift valid</code>{" "}
          selection, whose protocol remains a verification candidate. Each cell
          reports the mean of finite sequence values and its contributor count.
          Report sequence counts are distinct from attempted-run counts and
          successful-run counts.
        </p>
        <section className="matrix-section">
          <AccuracyMatrix
            datasets={data.datasets}
            configurations={[...data.configurations].sort((a, b) => a.displayOrder - b.displayOrder)}
            cells={data.cells}
          />
        </section>
        <div className="result-document-sections">
          <section>
            <h2>Runtime and resource measurements</h2>
            <p>
              The <Link href="/results/efficiency/">resource tables</Link> contain
              164 records for five profiling inputs on Desktop, Jetson Orin, and
              Jetson Nano. Each record retains the camera mode, native timing,
              CPU, memory, and available extended statistics. Instrumentation
              boundaries and platform conditions are documented in the{" "}
              <Link href="/benchmark/protocol/#resources">measurement notes</Link>.
            </p>
          </section>
          <section>
            <h2>Original tables and downloadable data</h2>
            <p>
              The <Link href="/results/tables/">source-table archive</Link> contains
              all 157 tables from the five Final dataset sections. Original ATE
              protocols, SR headings, RPE intervals, and source annotations remain
              separate. Historical input and platform fields that were not
              recorded remain unspecified.
            </p>
            <p>
              <a href="/data/results-bac8b9f.zip" download>Results data package (ZIP)</a>{" "}
              · <Link href="/evaluation/">Evaluation methods and EPICA</Link>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
