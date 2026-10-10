import { PageIntro } from "@/components/ui";
import { ResultsNavigation } from "@/components/results-shared";
import { CurrentResultsBrowser } from "@/components/current-results-browser";
import data from "@/public/data/current-results.json";

export const metadata = { title: "Reference-path coverage tables" };

export default function CurrentResults() {
  return <>
    <PageIntro eyebrow="RESULTS / SR" title="Reference-path coverage" description="Valid reference-path fraction (SR) by dataset, sequence, and run." />
    <div className="container page-content">
      <ResultsNavigation />
      <CurrentResultsBrowser />
      <section className="result-document-sections" id="definitions">
        <h2>SR definition</h2>
        <p>{data.protocols.coverage.definition} {data.protocols.coverage.selectionDescription}</p>
        <p>Unlisted dataset/configuration combinations remain unreported. A valid SR measurement does not establish that a run completed. The SR denominator is independent of the contributing run counts used for trajectory error.</p>
      </section>
    </div>
  </>;
}
