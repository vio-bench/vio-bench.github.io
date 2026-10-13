import katex from "katex";

/** Use the same bundled LaTeX math fonts for prose symbols and equations. */
function renderMath(latex: string, displayMode: boolean) {
  return katex.renderToString(latex, {
    displayMode,
    throwOnError: true,
    strict: "error",
    trust: false,
    output: "htmlAndMathml",
  });
}

export function MathBlock({ latex }: { latex: string }) {
  return <div className="math-block" dangerouslySetInnerHTML={{ __html: renderMath(latex, true) }} />;
}

export function MathInline({ latex }: { latex: string }) {
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: renderMath(latex, false) }} />;
}

/** Authored prose uses \\( ... \\) delimiters; ordinary text stays React-escaped. */
export function MathText({ text }: { text: string }) {
  return <>{text.split(/(\\\([\s\S]*?\\\))/g).map((part, index) => (
    part.startsWith("\\(") && part.endsWith("\\)")
      ? <MathInline key={index} latex={part.slice(2, -2)} />
      : part
  ))}</>;
}
