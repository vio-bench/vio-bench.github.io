import { Suspense } from "react";
import { ResultsNavigation } from "@/components/results-shared";
import { CurrentResultsBrowser } from "@/components/current-results-browser";

export const metadata = { title: "Results — Path coverage (SR)" };

export default function CurrentResults() {
  return <>
    <header className="page-intro container results-header"><h1>Results</h1></header>
    <div className="container page-content results-workspace">
      <ResultsNavigation />
      <Suspense fallback={<p>Loading SR results…</p>}>
        <CurrentResultsBrowser />
      </Suspense>
    </div>
  </>;
}
