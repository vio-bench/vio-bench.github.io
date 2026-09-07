import citation from "@/data/project-citation.json";
import { CodeBlock } from "@/components/code-block";

export function ProjectCitation() {
  return (
    <section className="project-citation" aria-label="Cite VIOVERSE">
      <p>
        If you use VIOVERSE, its tutorials, or benchmark results in your
        research, please cite our accompanying manuscript:
      </p>
      <p className="citation-title">{citation.title}</p>
      <details>
        <summary>BibTeX</summary>
        <CodeBlock
          label="BIBTEX"
          code={citation.bibtex}
          copyLabel="Copy BibTeX citation"
        />
      </details>
    </section>
  );
}
