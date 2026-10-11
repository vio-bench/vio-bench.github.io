import { Suspense } from "react";
import { ResultsNavigation } from "@/components/results-shared";
import { SourceTablesBrowser } from "@/components/source-tables-browser";

export const metadata = { title: "Trajectory error tables" };

export default function Tables() {
  return (
    <>
      <header className="page-intro container">
        <h1>Trajectory error tables</h1>
      </header>
      <div className="container page-content trajectory-tables">
        <ResultsNavigation />
        <Suspense fallback={<p>Loading tables…</p>}>
          <SourceTablesBrowser />
        </Suspense>
      </div>
    </>
  );
}
