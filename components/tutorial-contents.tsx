import Link from "next/link";
import type { CSSProperties } from "react";
import chapters from "@/data/tutorials.json";

export function TutorialContents({ compact = false }: { compact?: boolean }) {
  const Heading = compact ? "h3" : "h2";
  const columnRows = Math.ceil(chapters.length / 2);

  return (
    <nav aria-label="Tutorial contents" className={compact ? "tutorial-contents compact" : "tutorial-contents"}>
      <ol style={{ "--tutorial-column-rows": columnRows } as CSSProperties}>
        {chapters.map((chapter, index) => (
          <li key={chapter.slug} className={index === 0 || index === columnRows ? "tutorial-column-start" : undefined}>
            <Link href={`/learn/${chapter.slug}/`}>
              <span className="tutorial-chapter-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <Heading>{chapter.title}</Heading>
                {!compact && <p>{chapter.summary}</p>}
              </div>
              <span className="tutorial-chapter-arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function TutorialChapterLinks({ activeSlug }: { activeSlug: string }) {
  return (
    <nav aria-label="Tutorial chapters" className="tutorial-chapter-links">
      {chapters.map((chapter, index) => (
        <Link key={chapter.slug} href={`/learn/${chapter.slug}/`}
          className={chapter.slug === activeSlug ? "active" : undefined}
          aria-current={chapter.slug === activeSlug ? "page" : undefined}>
          <span>{String(index + 1).padStart(2, "0")}</span> {chapter.title}
        </Link>
      ))}
    </nav>
  );
}
