import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import { EfficiencyLeaderboard } from "@/components/efficiency-leaderboard";
export const metadata = { title: "Runtime and resource leaderboard" };
export default function Efficiency() {
  return (
    <>
      <PageIntro
        eyebrow="RESULTS / EFFICIENCY"
        title="Runtime and resource use"
        description="Compare implementation-reported measurements for a fixed input, platform, and camera mode. All 164 source rows are available, including rows with missing native totals."
      />
      <div className="container page-content">
        <ResultsNavigation />
        <EfficiencyLeaderboard />
      </div>
    </>
  );
}
