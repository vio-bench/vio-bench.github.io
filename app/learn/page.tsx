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
        description="A tutorial series by the VIOVERSE authors on measurement models, estimation, implementation, and evaluation."
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
        <p className="tutorial-resources">
          <Link href="/references/">Notation and references</Link> accompany
          the tutorial topics. Practical material is available in the{" "}
          <Link href="/run/">implementation guides</Link>,{" "}
          <Link href="/systems/">system documentation</Link>, and{" "}
          <Link href="/resources/">dataset and software resources</Link>.
        </p>
      </div>
    </>
  );
}
