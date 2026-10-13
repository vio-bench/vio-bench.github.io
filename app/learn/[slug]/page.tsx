import Link from "next/link";
import { notFound } from "next/navigation";
import tutorialData from "@/data/tutorials.json";
import type { TutorialChapter } from "@/lib/tutorial-types";
import { PageIntro, SourceList } from "@/components/ui";
import { MathBlock, MathText } from "@/components/math-block";
import { TutorialChapterLinks } from "@/components/tutorial-contents";

const chapters = tutorialData as TutorialChapter[];

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
      <div className="container page-content article-layout tutorial-chapter-layout">
        <aside className="sidebar">
          <strong>Tutorial chapters</strong>
          <TutorialChapterLinks activeSlug={slug} />
        </aside>
        <article className="prose tutorial-article">
          <details className="tutorial-mobile-contents">
            <summary>Chapter {String(index + 1).padStart(2, "0")} of {chapters.length} · All chapters</summary>
            <TutorialChapterLinks activeSlug={slug} />
          </details>
          {chapter.sections.length > 2 && <details className="tutorial-section-contents">
            <summary>In this chapter</summary>
            <nav aria-label="Sections in this chapter">
              <ol>
                {chapter.sections.map((section) => (
                  <li key={section.id}><Link href={`#${section.id}`}>{section.title}</Link></li>
                ))}
              </ol>
            </nav>
          </details>}
          <div className="tutorial-body">
            {chapter.sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.content ? section.content.map((block, i) => {
                  if (block.type === "equation") return <MathBlock key={i} latex={block.latex} />;
                  if (block.type === "figure") return (
                    <figure className="tutorial-figure" key={i}>
                      <img src={block.src} alt={block.alt} width={block.width} height={block.height} />
                      <figcaption><MathText text={block.caption} /></figcaption>
                    </figure>
                  );
                  return <p key={i}>
                    <MathText text={block.text} />
                    {block.crossReference && <> <Link href={block.crossReference.url}>{block.crossReference.title}</Link>.</>}
                    {block.references && <span className="tutorial-citations">{" "}
                      {block.references.map((source, j) => <span key={source.url}>
                        {j > 0 && "; "}<a href={source.url}>{source.title}</a>
                      </span>)}.
                    </span>}
                  </p>;
                }) : section.paragraphs.map((paragraph, i) => <p key={i}><MathText text={paragraph} /></p>)}
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
          {(chapter.readings.length > 0 || chapter.related.length > 0) && <details className="chapter-references">
            <summary>References and supplementary reading</summary>
            <ol className="reference-list">
              {chapter.readings.map((reading, i) => (
                <li key={reading.title + reading.locator} id={`reading-${i + 1}`}>
                  <p>{reading.source}. {reading.url ? <a href={reading.url}>{reading.title}</a> : reading.title}.</p>
                  <p className="small">{reading.locator}</p>
                </li>
              ))}
            </ol>
            {chapter.related.length > 0 && <SourceList sources={chapter.related} />}
          </details>}
          <nav className="lesson-nav" aria-label="Chapter navigation">
            <Link href={index > 0 ? `/learn/${chapters[index - 1].slug}/` : "/learn/"}>
              <span>← {index > 0 ? "Previous chapter" : "Contents"}</span>
              {index > 0 ? chapters[index - 1].title : "Tutorial contents"}
            </Link>
            <Link href={index < chapters.length - 1 ? `/learn/${chapters[index + 1].slug}/` : "/learn/"}>
              <span>{index < chapters.length - 1 ? "Next chapter" : "Contents"} →</span>
              {index < chapters.length - 1 ? chapters[index + 1].title : "Tutorial contents"}
            </Link>
          </nav>
        </article>
      </div>
    </>
  );
}
