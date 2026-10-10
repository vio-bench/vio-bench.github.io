import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
export const metadata = { title: "Trajectory error tables" };
export default function Accuracy() {
  return <>
    <PageIntro eyebrow="RESULTS / TRAJECTORY" title="Trajectory error tables" description="ATE and RPE tables are available by dataset, metric, and sequence group." />
    <div className="container page-content"><ResultsNavigation /><Link className="button" href="/results/tables/">Open trajectory tables →</Link></div>
  </>;
}
