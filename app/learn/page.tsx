import Link from "next/link";
import lessons from "@/data/tutorials.json";
import furtherReading from "@/data/further-reading.json";
import { PageIntro, Callout } from "@/components/ui";
export const metadata = { title: "Learn VIO" };
export default function Learn() {
  return (
    <>
      <PageIntro
        eyebrow="TUTORIALS / STUDY GUIDE"
        title="Studying visual–inertial odometry"
        description="A reading sequence through original papers, official derivations, course material, and implementation documentation."
      />
      <div className="container page-content">
        <Callout title="Sources and study sequence">
          <p>
            The study guides organize the original OpenVINS tutorials and
            derivations, together with papers by Guoquan Huang, Patrick Geneva,
            Chuchu Chen, Yulin Yang, and their coauthors. Each guide identifies
            specific source sections and a suggested reading order.
          </p>
          <p>
            For probability, linear algebra, and three-dimensional geometry,
            begin with the <a href="https://github.com/yangyulin/rise-tutorial#outline">RiSE course</a>,
            Lectures 1–2. Follow each source’s notation and assumptions; the{" "}
            <Link href="/references/">notation references</Link> identify the
            relevant definitions in OpenVINS.
          </p>
        </Callout>
        <p className="tutorial-resources">
          For implementation, see the <Link href="/run/">implementation guides</Link>{" "}
          and <Link href="/systems/">system documentation</Link>. Dataset
          downloads, calibration tools, and further reading are collected in{" "}
          <Link href="/resources/">Resources</Link>.
        </p>
        <div className="curriculum">
          {lessons.map((l, i) => (
            <Link
              className="lesson-card"
              href={"/learn/" + l.slug + "/"}
              key={l.slug}
            >
              <span className="lesson-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2>{l.title}</h2>
                <p>{l.summary}</p>
              </div>
            </Link>
          ))}
        </div>
        <section className="further-reading" aria-labelledby="further-reading-heading">
          <h2 id="further-reading-heading">Further reading by topic</h2>
          <p>
            The guides above provide an initial reading sequence. The sources
            below extend it to mathematical foundations, visual geometry,
            preintegration, and learning methods. Each entry points to the
            original material; the current guides are not a complete course.
          </p>
          <table>
            <caption>Selected original readings and their locations.</caption>
            <thead>
              <tr><th scope="col">Topic</th><th scope="col">Original material</th></tr>
            </thead>
            <tbody>
              {furtherReading.map((topic) => (
                <tr key={topic.topic}>
                  <th scope="row">{topic.topic}</th>
                  <td>
                    {topic.sources.map((source) => (
                      <div className="further-reading-source" key={source.url + source.locator}>
                        <a href={source.url}>{source.title}</a>
                        <p>{source.locator}</p>
                        {"scope" in source && <p>{source.scope}</p>}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
