import Link from "next/link";
import { notFound } from "next/navigation";
import catalog from "@/data/systems.json";
import { PageIntro, ButtonLink, Callout, SourceList } from "@/components/ui";
export function generateStaticParams() {
  return catalog.systems.map((s) => ({ slug: s.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: catalog.systems.find((s) => s.id === slug)?.name };
}
export default async function System({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = catalog.systems.find((s) => s.id === slug);
  if (!s) notFound();
  return (
    <>
      <PageIntro
        eyebrow={`SYSTEMS / ${s.family.toUpperCase()}`}
        title={s.name}
        description={s.summary}
      >
        <div className="button-row">
          <ButtonLink href={s.upstreamUrl}>Public source code</ButtonLink>
          <ButtonLink href={s.docsUrl} secondary>
            Documentation
          </ButtonLink>
        </div>
      </PageIntro>
      <div className="container page-content">
        <article className="prose">
          <h2>Estimator formulation and implementation</h2>
          <p>{s.learnFocus}</p>
          <h2>Documented inputs</h2>
          <ul>
            {s.inputModes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <Callout title="Configuration scope">
            <p>{s.scopeNote}</p>
          </Callout>
          <p className="small">
            These are public upstream capabilities, not a statement that every
            mode has been run by VIOVERSE. Sources checked {s.sourceChecked}.
          </p>
          <h2>References</h2>
          <SourceList sources={s.sources} />
          <div className="lesson-nav">
            <Link href="/systems/">← All systems</Link>
            {s.id === "openvins" ? (
              <Link href="/run/openvins/">OpenVINS implementation guide →</Link>
            ) : (
              <Link href="/learn/filtering-and-optimization/">
                Estimation methods tutorial →
              </Link>
            )}
          </div>
        </article>
      </div>
    </>
  );
}
