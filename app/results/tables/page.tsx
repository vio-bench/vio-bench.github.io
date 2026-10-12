import { Suspense } from "react";
import { ResultsNavigation } from "@/components/results-shared";
import { SourceTablesBrowser } from "@/components/source-tables-browser";

export const metadata = { title: "Results — ATE & RPE" };

export default function Tables() {
  return (
    <>
      <header className="page-intro container results-header">
        <h1>Results</h1>
      </header>
      <div className="container page-content results-workspace trajectory-tables">
        <ResultsNavigation />
        <Suspense fallback={<p>Loading tables…</p>}>
          <SourceTablesBrowser />
        </Suspense>
      </div>
    </>
  );
}
