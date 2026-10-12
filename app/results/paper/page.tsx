import { ResultsNavigation } from "@/components/results-shared";
import { PaperAccuracyExamples } from "@/components/paper-accuracy-examples";
import { PaperResourceTable } from "@/components/paper-resource-table";
import { PaperAlignmentResults } from "@/components/paper-alignment-results";

export const metadata = { title: "Results — Paper comparisons" };

export default function PaperResults() {
  return <>
    <header className="page-intro container results-header"><h1>Results</h1></header>
    <div className="container page-content results-workspace paper-results-page">
      <ResultsNavigation />
      <div className="paper-results-intro">
        <h2>Paper comparisons</h2>
      </div>
      <PaperAccuracyExamples />
      <PaperResourceTable />
      <PaperAlignmentResults />
    </div>
  </>;
}
