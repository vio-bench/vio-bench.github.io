import Link from "next/link";
import chapters from "@/data/tutorials.json";
import { PageIntro } from "@/components/ui";

export const metadata = { title: "VIO tutorials" };

export default function Learn() {
  return (
    <>
      <PageIntro
        eyebrow="TUTORIALS / CONTENTS"
        title="Visual–inertial odometry tutorials"
        description="A tutorial series on notation, measurement models, estimation, implementation, and evaluation."
      />
      <div className="container page-content">
        <p className="tutorial-status">Chapter text is in preparation.</p>
        <div className="curriculum">
          {chapters.map((chapter, i) => (
            <Link
              className="lesson-card"
              href={`/learn/${chapter.slug}/`}
              key={chapter.slug}
            >
              <span className="lesson-number">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2>{chapter.title}</h2>
                <p>{chapter.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
