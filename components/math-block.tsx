import katex from "katex";

/** Render repository-authored equations at build time, including accessible MathML. */
export function MathBlock({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: true,
    strict: "error",
    trust: false,
    output: "htmlAndMathml",
  });
  return <div className="math-block" dangerouslySetInnerHTML={{ __html: html }} />;
}
