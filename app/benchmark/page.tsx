import Link from "next/link";
import { Download, ArrowRight } from "lucide-react";
import { PageIntro, Callout } from "@/components/ui";
import { RuntimeExplorer } from "@/components/runtime-explorer";
import snapshot from "@/public/data/runtime.json";
export const metadata = { title: "VIOBench runtime explorer" };
export default function Benchmark() {
  return (
    <>
      <PageIntro
        eyebrow="BENCHMARK / VIOBENCH"
        title="Explore a result. Understand its limits."
        description="Inspect a measured runtime snapshot across three platforms, with the input, metric definition, and missing-data policy alongside the numbers."
      />
      <div className="container page-content">
        <div className="benchmark-summary">
          <div>
            <span>Dataset / sequence</span>
            <strong>LaMAria · R_02_easy</strong>
          </div>
          <div>
            <span>Camera mode</span>
            <strong>Monocular</strong>
          </div>
          <div>
            <span>Published records</span>
            <strong>20 across 3 platforms</strong>
          </div>
          <div>
            <span>Snapshot date</span>
            <strong>06 Sep 2026</strong>
          </div>
        </div>
        <RuntimeExplorer />
        <div className="data-links">
          <a href="/data/runtime.csv" download>
            <Download size={14} /> Download CSV
          </a>
          <a href="/data/runtime.json" download>
            <Download size={14} /> Download JSON + metadata
          </a>
        </div>
        <Callout title="What is being compared">
          <p>
            {snapshot.metric.definition} {snapshot.aggregation}
          </p>
          <Link className="text-link" href="/benchmark/protocol/">
            Read the full measurement notes <ArrowRight size={16} />
          </Link>
        </Callout>
        <div className="feature-grid" style={{ marginTop: 35 }}>
          <div>
            <h2 style={{ fontSize: 25 }}>Read runtime with care</h2>
            <p>
              This is a fixed-input research snapshot. Exact platform
              specifications, build configurations, input conversion variant,
              and per-run artifacts are not included. Native timing is not a
              harmonized end-to-end latency measurement.
            </p>
            <p className="small">
              CPU normalization and the process-memory collector definition
              remain unconfirmed. CPU values can exceed 100%; memory values
              should not be treated as verified RSS or PSS.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: 25 }}>Pair speed with evidence</h2>
            <p>
              A fast partial trajectory can still be unusable. This release does
              not contain a public accuracy or coverage leaderboard. Use the
              learning path to understand alignment, relative error, and how
              missing output affects a comparison.
            </p>
            <Link className="text-link" href="/learn/trajectory-evaluation/">
              Learn how to evaluate a trajectory <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
