"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const sections = [
  {
    label: "Tutorials",
    href: "/learn/",
    routes: ["/learn", "/run", "/systems", "/resources", "/references"],
  },
  {
    label: "Benchmark",
    href: "/benchmark/",
    routes: ["/benchmark", "/results"],
  },
  { label: "Evaluation", href: "/evaluation/", routes: ["/evaluation"] },
];

export function Navigation() {
  const path = usePathname().replace(/\/+$/, "") || "/";
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="menu-button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        id="navigation"
        className={open ? "nav is-open" : "nav"}
        aria-label="Main navigation"
      >
        {sections.map(({ label, href, routes }) => {
          const active = routes.some(
            (route) => path === route || path.startsWith(route + "/"),
          );
          return (
            <Link
              key={label}
              onClick={() => setOpen(false)}
              className={active ? "active" : ""}
              aria-current={
                active ? (path === href.slice(0, -1) ? "page" : "location") : undefined
              }
              href={href}
            >
              {label}
            </Link>
          );
        })}
        <a className="github-link" href="https://github.com/vio-bench">
          GitHub <ArrowUpRight size={15} />
        </a>
      </nav>
    </>
  );
}
