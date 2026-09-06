import Link from "next/link";
import guide from "@/data/run-guide.json";
import { PageIntro, Callout, SourceList } from "@/components/ui";
import { CodeBlock } from "@/components/code-block";
export const metadata = { title: "Run OpenVINS on EuRoC" };
export default function OpenVINS() {
  return (
    <>
      <PageIntro
        eyebrow="RUN / YOUR FIRST LOCAL ESTIMATOR"
        title={guide.title}
        description={guide.subtitle}
      />
      <div className="container page-content article-layout">
        <aside className="sidebar">
          <strong>The local workflow</strong>
          {guide.steps.map((s) => (
            <a href={"#" + s.id} key={s.id}>
              {s.title}
            </a>
          ))}
          <a href="#troubleshooting">Troubleshooting</a>
          <Link href="/systems/">Browse other implementations</Link>
        </aside>
        <article className="prose">
          <Callout title={guide.environment}>
            <p>{guide.summary}</p>
            <p className="small">
              Commands reviewed {guide.sourceChecked}; source revision{" "}
              {guide.sourceRevision.slice(0, 12)}. This guide has not been
              executed as part of this website release.
            </p>
          </Callout>
          <h2>Before you begin</h2>
          <ul>
            {guide.prerequisites.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {guide.steps.map((s) => (
            <section id={s.id} key={s.id}>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
              {"preparationCode" in s && s.preparationCode && (
                <CodeBlock
                  code={s.preparationCode}
                  label="PREPARE THE FOLDER"
                />
              )}
              {"links" in s && s.links && <SourceList sources={s.links} />}{" "}
              {"code" in s && s.code && <CodeBlock code={s.code} />}{" "}
              {"terminals" in s &&
                s.terminals &&
                s.terminals.map((t) => (
                  <CodeBlock key={t.label} code={t.code} label={t.label} />
                ))}
              {"files" in s && s.files && (
                <ul>
                  {s.files.map((f) => (
                    <li key={f}>
                      <code>{f}</code>
                    </li>
                  ))}
                </ul>
              )}
              {"expected" in s && s.expected && (
                <Callout title="What to check">
                  <p>{s.expected}</p>
                </Callout>
              )}
              {"format" in s && <p className="small">{s.format}</p>}
              {"alignment" in s && <p>{s.alignment}</p>}
            </section>
          ))}
          <section id="troubleshooting">
            <h2>If something does not work</h2>
            {guide.checks.map((c) => (
              <details className="exercise" key={c.symptom}>
                <summary>{c.symptom}</summary>
                <p>{c.action}</p>
              </details>
            ))}
          </section>
          <h2>Keep going</h2>
          <ul>
            {guide.nextSteps.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="lesson-nav">
            <Link href="/learn/calibration-and-time/">
              Review calibration ←
            </Link>
            <Link href="/evaluation/">
              Evaluate with EPICA →
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
