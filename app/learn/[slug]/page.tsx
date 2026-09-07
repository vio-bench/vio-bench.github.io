import Link from "next/link";
import { notFound } from "next/navigation";
import lessons from "@/data/tutorials.json";
import { PageIntro, SourceList } from "@/components/ui";
export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const l = lessons.find((l) => l.slug === slug);
  return { title: l?.title, description: l?.summary };
}
export default async function Lesson({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = lessons.findIndex((l) => l.slug === slug);
  if (index < 0) notFound();
  const l = lessons[index];
  return (
    <>
      <PageIntro
        eyebrow={`LEARN / LESSON ${String(index + 1).padStart(2, "0")} · ${l.duration} ESTIMATED`}
        title={l.title}
        description={l.summary}
      />
      <div className="container page-content article-layout">
        <aside className="sidebar">
          <strong>Tutorial contents</strong>
          {lessons.map((s, i) => (
            <Link
              className={s.slug === slug ? "active" : ""}
              aria-current={s.slug === slug ? "page" : undefined}
              key={s.slug}
              href={"/learn/" + s.slug + "/"}
            >
              {i + 1}. {s.title}
            </Link>
          ))}
        </aside>
        <article className="prose">
          <div className="callout">
            <strong>Learning objectives</strong>
            <ul>
              {l.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            {l.prerequisites.length > 0 && (
              <p className="small">
                Prerequisites:{" "}
                {l.prerequisites.map((p, i) => (
                  <span key={p}>
                    {i > 0 ? " · " : ""}
                    <Link href={"/learn/" + p + "/"}>
                      {lessons.find((s) => s.slug === p)?.title}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>
          {l.sections.map((s, i) => (
            <section key={s.title} id={"section-" + (i + 1)}>
              <h2>{s.title}</h2>
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {"equation" in s && s.equation && (
                <div className="equation">{s.equation}</div>
              )}
            </section>
          ))}
          <section className="exercise">
            <span className="eyebrow">WORKED EXAMPLE</span>
            <p>{l.exercise.question}</p>
            <details>
              <summary>Explanation</summary>
              <p>{l.exercise.answer}</p>
            </details>
          </section>
          <h2>References</h2>
          <SourceList sources={l.sources} />
          {slug === "trajectory-evaluation" && (
            <div className="callout">
              <strong>EPICA evaluation guide</strong>
              <p>
                Follow the <Link href="/evaluation/">Evaluation guide</Link> to
                prepare a trajectory pair, choose an alignment, run EPICA, and
                connect the output to the benchmark results.
              </p>
            </div>
          )}
          <nav className="lesson-nav" aria-label="Lesson navigation">
            {index > 0 ? (
              <Link href={"/learn/" + lessons[index - 1].slug + "/"}>
                ← Previous lesson
              </Link>
            ) : (
              <Link href="/learn/">← Learning path</Link>
            )}
            {index < lessons.length - 1 ? (
              <Link href={"/learn/" + lessons[index + 1].slug + "/"}>
                Next: {lessons[index + 1].title} →
              </Link>
            ) : (
              <Link href="/run/">Implementation guides →</Link>
            )}
          </nav>
        </article>
      </div>
    </>
  );
}
