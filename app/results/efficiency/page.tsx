import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import { EfficiencyLeaderboard } from "@/components/efficiency-leaderboard";
export const metadata = { title: "Runtime and resource tables" };
export default function Efficiency() {
  return <>
    <PageIntro eyebrow="RESULTS / RESOURCES" title="Runtime and resource tables" description="Reported processing time, CPU, memory, and available GPU measurements for fixed profiling inputs on Desktop, Jetson Orin, and Jetson Nano." />
    <div className="container page-content"><ResultsNavigation /><EfficiencyLeaderboard /></div>
  </>;
}
