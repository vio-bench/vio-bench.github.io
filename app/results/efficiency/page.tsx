import { Suspense } from "react";
import { ResultsNavigation } from "@/components/results-shared";
import { EfficiencyLeaderboard } from "@/components/efficiency-leaderboard";

export const metadata = { title: "Results" };

export default function Efficiency() {
  return (
    <>
      <header className="page-intro container results-header"><h1>Results</h1></header>
      <div className="container page-content results-workspace">
        <ResultsNavigation />
        <Suspense fallback={<p>Loading resources…</p>}>
          <EfficiencyLeaderboard />
        </Suspense>
      </div>
    </>
  );
}
