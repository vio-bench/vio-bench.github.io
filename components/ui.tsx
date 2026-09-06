import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
export function ButtonLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      className={"button " + (secondary ? "secondary" : "primary")}
      href={href}
    >
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-intro container">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
      {children}
    </section>
  );
}
export function SourceList({
  sources,
}: {
  sources: { title?: string; label?: string; url: string }[];
}) {
  return (
    <ul className="sources">
      {sources.map((s) => (
        <li key={s.url + s.title}>
          <a href={s.url}>
            {s.title || s.label} <ArrowUpRight size={14} />
          </a>
        </li>
      ))}
    </ul>
  );
}
export function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="callout">
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}
