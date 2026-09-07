import citation from "@/data/project-citation.json";
import { CodeBlock } from "@/components/code-block";

export function ProjectCitation() {
  return (
    <section className="project-citation" aria-label="Cite VIOVERSE">
      <p>
        If you use VIOVERSE in your research, <strong>please cite:</strong>
      </p>
      <CodeBlock
        label="BibTeX"
        code={citation.bibtex}
        copyLabel="Copy BibTeX citation"
      />
    </section>
  );
}
