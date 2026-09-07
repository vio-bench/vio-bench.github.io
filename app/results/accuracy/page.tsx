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
        description="Dataset- and sequence-level position and orientation ATE for individual camera configurations, with contributor counts and source annotations."
      />
      <div className="container page-content">
        <ResultsNavigation />
        <AccuracyLeaderboard />
      </div>
    </>
  );
}
