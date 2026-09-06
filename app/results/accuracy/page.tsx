import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import { AccuracyLeaderboard } from "@/components/accuracy-leaderboard";
export const metadata = { title: "Accuracy leaderboard" };
export default function Accuracy() {
  return (
    <>
      <PageIntro
        eyebrow="RESULTS / ACCURACY"
        title="Accuracy leaderboard"
        description="Compare reported position or orientation ATE within one dataset and camera mode. Open a result to inspect its contributing sequence values and source annotations."
      />
      <div className="container page-content">
        <ResultsNavigation />
        <AccuracyLeaderboard />
      </div>
    </>
  );
}
