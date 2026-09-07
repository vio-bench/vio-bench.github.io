import Link from "next/link";
import { notFound } from "next/navigation";
import tutorialData from "@/data/tutorials.json";
import type { StudyGuide } from "@/lib/tutorial-types";
import { PageIntro, SourceList } from "@/components/ui";

const guides: StudyGuide[] = tutorialData;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((entry) => entry.slug === slug);
  return { title: guide?.title, description: guide?.summary };
}

export default async function ReadingGuide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = guides.findIndex((entry) => entry.slug === slug);
  if (index < 0) notFound();
  const guide = guides[index];

  return (
    <>
      <PageIntro
        eyebrow={`TUTORIALS / READING GUIDE ${String(index + 1).padStart(2, "0")}`}
        title={guide.title}
        description={guide.summary}
      />
      <div className="container page-content article-layout">
        <aside className="sidebar">
          <strong>Study topics</strong>
          {guides.map((entry, i) => (
            <Link
              className={entry.slug === slug ? "active" : ""}
              aria-current={entry.slug === slug ? "page" : undefined}
              key={entry.slug}
              href={`/learn/${entry.slug}/`}
            >
              {i + 1}. {entry.title}
            </Link>
          ))}
          <Link href="/references/">Notation and primary references</Link>
        </aside>
        <article className="prose">
          <p className="reading-introduction">
            Follow the original material in the order below. Each entry identifies
            its source, the relevant section, and the topic to study.
          </p>
          {guide.prerequisites.length > 0 && (
            <p className="small">
              Suggested prior reading:{" "}
              {guide.prerequisites.map((prerequisite, i) => (
                <span key={prerequisite}>
                  {i > 0 ? " · " : ""}
                  <Link href={`/learn/${prerequisite}/`}>
                    {guides.find((entry) => entry.slug === prerequisite)?.title}
                  </Link>
                </span>
              ))}
            </p>
          )}
          <ol className="reading-sequence">
            {guide.readings.map((reading, i) => (
              <li key={reading.url + reading.locator} id={`reading-${i + 1}`}>
                <h2><a href={reading.url}>{reading.title}</a></h2>
                <p className="reading-source">{reading.source} · {reading.locator}</p>
                <p>{reading.focus}</p>
              </li>
            ))}
          </ol>
          <section>
            <h2>Related material</h2>
            <SourceList sources={guide.related} />
          </section>
          <nav className="lesson-nav" aria-label="Reading guide navigation">
            <Link href={index > 0 ? `/learn/${guides[index - 1].slug}/` : "/learn/"}>
              ← {index > 0 ? "Previous topic" : "Study overview"}
            </Link>
            <Link href={index < guides.length - 1 ? `/learn/${guides[index + 1].slug}/` : "/run/"}>
              {index < guides.length - 1 ? "Next topic" : "Implementation guides"} →
            </Link>
          </nav>
        </article>
      </div>
    </>
  );
}
