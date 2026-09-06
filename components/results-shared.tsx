"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function ResultsNavigation() {
  const path = usePathname();
  return (
    <nav className="results-nav" aria-label="Results sections">
      {[
        { href: "/results/", label: "Overview" },
        { href: "/results/accuracy/", label: "Accuracy leaderboard" },
        { href: "/results/efficiency/", label: "Runtime & resources" },
        { href: "/results/tables/", label: "All source tables" },
      ].map((x) => (
        <Link
          href={x.href}
          key={x.href}
          aria-current={path === x.href ? "page" : undefined}
          className={path === x.href ? "active" : ""}
        >
          {x.label}
        </Link>
      ))}
    </nav>
  );
}
export function downloadText(
  text: string,
  filename: string,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function updateQuery(values: Record<string, string>) {
  const url = new URL(window.location.href);
  url.search = "";
  for (const [key, value] of Object.entries(values))
    url.searchParams.set(key, value);
  window.history.replaceState(null, "", url);
}
export function formatResult(value: number | null) {
  if (value === null) return "—";
  if (value === 0) return "0";
  return Number(value.toPrecision(4)).toLocaleString("en-US", {
    maximumSignificantDigits: 4,
  });
}
export function formatReported(value: number | null) {
  return value === null ? "—" : String(value);
}
