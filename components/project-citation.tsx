import citation from "@/data/project-citation.json";
import { CodeBlock } from "@/components/code-block";

export function ProjectCitation() {
  return (
    <section className="project-citation" aria-label="Cite VIOVERSE and EPICA">
      <p>
        If you use VIOVERSE in your research, <strong>please cite:</strong>
      </p>
      <CodeBlock
        label="BibTeX"
        code={citation.bibtex}
        copyLabel="Copy BibTeX citation"
      />
      <div className="epica-citation">
        <p>
          If you use EPICA for trajectory evaluation, <strong>please also cite:</strong>
        </p>
        <CodeBlock
          label="BibTeX"
          code={citation.epica.bibtex}
          copyLabel="Copy EPICA BibTeX citation"
        />
      </div>
    </section>
  );
}
