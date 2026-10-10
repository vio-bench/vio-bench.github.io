import { Suspense } from "react";
import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import { SourceTablesBrowser } from "@/components/source-tables-browser";
export const metadata = { title: "Trajectory error tables" };
export default function Tables() {
  return <>
    <PageIntro eyebrow="RESULTS / TRAJECTORY" title="Trajectory error tables" description="Reported ATE and RPE at 10, 20, 50, and 100 m. Filter by dataset, sequence group, method, and metric." />
    <div className="container page-content"><ResultsNavigation /><Suspense fallback={<p>Loading trajectory tables…</p>}><SourceTablesBrowser /></Suspense></div>
  </>;
}
