import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import { SourceTablesBrowser } from "@/components/source-tables-browser";
export const metadata = { title: "Complete Results source tables" };
export default function Tables() {
  return (
    <>
      <PageIntro
        eyebrow="RESULTS / COMPLETE SOURCE TABLES"
        title="Complete result tables"
        description="All 157 dataset tables from the committed Results report, organized by dataset, sequence group, and original metric heading. Values and annotations are transcribed as reported."
      />
      <div className="container page-content">
        <ResultsNavigation />
        <SourceTablesBrowser />
      </div>
    </>
  );
}
