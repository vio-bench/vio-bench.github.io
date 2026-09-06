import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, Table2, Timer } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import { AccuracyMatrix } from "@/components/accuracy-matrix";
import source from "@/public/data/accuracy.json";
import type { AccuracyData } from "@/lib/results-types";
const data = source as unknown as AccuracyData;
export const metadata = {
  title: "VIOBench results and leaderboards",
  description:
    "Explore VIOBench accuracy, runtime and resource measurements, and the full source result tables.",
};
export default function Results() {
  return (
    <>
      <PageIntro
        eyebrow="RESULTS / VIOBENCH"
        title="Compare the results in context."
        description="Explore accuracy, runtime, and resource measurements from the Results report. Select a dataset, camera configuration, and evaluation metric to inspect the reported values."
      />
      <div className="container page-content">
        <ResultsNavigation />
        <div className="release-strip">
          <span>
            <i className="status-dot" /> Results snapshot · 06 Sep 2026
          </span>
          <span>
            Source revision <code>{data.source.revision.slice(0, 12)}</code>
          </span>
          <Link href="/benchmark/protocol/">Protocol & provenance →</Link>
        </div>
        <div className="results-stat-grid">
          <div>
            <strong>5</strong>
            <span>dataset domains</span>
          </div>
          <div>
            <strong>98</strong>
            <span>report sequences</span>
          </div>
          <div>
            <strong>18</strong>
            <span>ATE configurations</span>
          </div>
          <div>
            <strong>164</strong>
            <span>resource records</span>
          </div>
        </div>
        <div className="path-grid results-entry-grid">
          {[
            {
              icon: ChartNoAxesCombined,
              title: "Accuracy leaderboard",
              body: "Position and orientation ATE, separated by dataset and camera mode. Drill down to individual sequences.",
              href: "/results/accuracy/",
              cta: "Compare accuracy",
            },
            {
              icon: Timer,
              title: "Runtime & resources",
              body: "Five fixed profiling inputs on Desktop, Jetson Orin, and Jetson Nano. Inspect native timing, CPU, and memory.",
              href: "/results/efficiency/",
              cta: "Compare resource use",
            },
            {
              icon: Table2,
              title: "All source tables",
              body: "Browse all 157 original result tables, including the ATE protocols, SR, and RPE intervals retained in the report.",
              href: "/results/tables/",
              cta: "Browse the full report",
            },
          ].map((c) => (
            <Link className="path-card" key={c.href} href={c.href}>
              <div className="card-top">
                <c.icon size={26} />
              </div>
              <h2>{c.title}</h2>
              <p>{c.body}</p>
              <span className="text-link">
                {c.cta}
                <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
        <section className="matrix-section">
          <AccuracyMatrix
            datasets={data.datasets}
            configurations={[...data.configurations].sort(
              (a, b) => a.displayOrder - b.displayOrder,
            )}
            cells={data.cells}
          />
        </section>
        <div className="callout">
          <strong>One source version, separate comparison conditions</strong>
          <p>
            The accuracy overview uses the approved <code>epa-drift valid</code>{" "}
            selection, still labeled a verification candidate. Resource
            measurements retain their native timing and input identities. Other
            reported protocols remain available in Source Tables and are not
            mixed into a combined score.
          </p>
          <p className="small">
            The report sequence count is not a count of planned attempts or
            successful runs. Source configuration, input, and platform fields
            that were not recorded remain unspecified.
          </p>
        </div>
      </div>
    </>
  );
}
