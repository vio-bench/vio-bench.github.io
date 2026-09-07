import Link from "next/link";
import { notFound } from "next/navigation";
import tutorialData from "@/data/tutorials.json";
import type { TutorialChapter } from "@/lib/tutorial-types";
import { PageIntro, SourceList } from "@/components/ui";
import { MathBlock } from "@/components/math-block";

const chapters: TutorialChapter[] = tutorialData;

export function generateStaticParams() {
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = chapters.find((entry) => entry.slug === slug);
  return { title: chapter?.title, description: chapter?.summary };
}

export default async function Tutorial({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = chapters.findIndex((entry) => entry.slug === slug);
  if (index < 0) notFound();
  const chapter = chapters[index];

  return (
    <>
      <PageIntro
        eyebrow={`TUTORIALS / CHAPTER ${String(index + 1).padStart(2, "0")}`}
        title={chapter.title}
        description={chapter.summary}
      />
      <div className="container page-content article-layout">
        <aside className="sidebar">
          <strong>Tutorial chapters</strong>
          {chapters.map((entry, i) => (
            <Link
              className={entry.slug === slug ? "active" : ""}
              aria-current={entry.slug === slug ? "page" : undefined}
              key={entry.slug}
              href={`/learn/${entry.slug}/`}
            >
              {i + 1}. {entry.title}
            </Link>
          ))}
          <Link href="/references/">References and further reading</Link>
        </aside>
        <article className="prose">
          <div className="tutorial-body">
            {chapter.sections.length === 0 ? (
              <p className="tutorial-status">Chapter text is in preparation.</p>
            ) : chapter.sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                {section.equationLatex && <MathBlock latex={section.equationLatex} />}
                {section.references.length > 0 && <SourceList sources={section.references} />}
              </section>
            ))}
          </div>
          {chapter.prerequisites.length > 0 && (
            <p className="small">
              Related chapters:{" "}
              {chapter.prerequisites.map((prerequisite, i) => (
                <span key={prerequisite}>
                  {i > 0 ? " · " : ""}
                  <Link href={`/learn/${prerequisite}/`}>
                    {chapters.find((entry) => entry.slug === prerequisite)?.title}
                  </Link>
                </span>
              ))}
            </p>
          )}
          <details className="chapter-references">
            <summary>References and supplementary reading</summary>
            <ol className="reference-list">
              {chapter.readings.map((reading, i) => (
                <li key={reading.url + reading.locator} id={`reading-${i + 1}`}>
                  <p>{reading.source}. <a href={reading.url}>{reading.title}</a>.</p>
                  <p className="small">{reading.locator}</p>
                </li>
              ))}
            </ol>
            {chapter.related.length > 0 && <SourceList sources={chapter.related} />}
          </details>
          <nav className="lesson-nav" aria-label="Chapter navigation">
            <Link href={index > 0 ? `/learn/${chapters[index - 1].slug}/` : "/learn/"}>
              ← {index > 0 ? "Previous chapter" : "Tutorial contents"}
            </Link>
            <Link href={index < chapters.length - 1 ? `/learn/${chapters[index + 1].slug}/` : "/run/"}>
              {index < chapters.length - 1 ? "Next chapter" : "Implementation guides"} →
            </Link>
          </nav>
        </article>
      </div>
    </>
  );
}
