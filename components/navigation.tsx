"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
export function Navigation() {
  const path = usePathname();
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
        {[
          ["Tutorials", "/learn/"],
          ["Systems", "/systems/"],
          ["Run", "/run/"],
          ["Evaluation", "/evaluation/"],
          ["Benchmark", "/benchmark/"],
          ["Results", "/results/"],
          ["Resources", "/resources/"],
        ].map(
          ([label, href]) => (
            <Link
              key={label}
              onClick={() => setOpen(false)}
              className={
                path.startsWith(href) ? "active" : ""
              }
              aria-current={
                path.startsWith(href) ? "page" : undefined
              }
              href={href}
            >
              {label}
            </Link>
          ),
        )}
        <a className="github-link" href="https://github.com/vio-bench">
          GitHub <ArrowUpRight size={15} />
        </a>
      </nav>
    </>
  );
}
