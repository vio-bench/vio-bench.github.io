"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import catalog from "@/data/systems.json";
export function SystemCatalog() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("All");
  const [mode, setMode] = useState("All");
  const shown = catalog.systems.filter(
    (s) =>
      (family === "All" || s.family === family) &&
      (mode === "All" ||
        s.inputModes.some((m) =>
          m.toLowerCase().includes(mode.toLowerCase()),
        )) &&
      [s.name, s.summary, ...s.inputModes]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="filters">
        <label className="field">
          Find a system
          <input
            type="search"
            placeholder="Search names or concepts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="field">
          Estimator family
          <select value={family} onChange={(e) => setFamily(e.target.value)}>
            <option>All</option>
            {Array.from(new Set(catalog.systems.map((s) => s.family))).map(
              (f) => (
                <option key={f}>{f}</option>
              ),
            )}
          </select>
        </label>
        <label className="field">
          Documented input
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option>All</option>
            <option>Mono</option>
            <option>Stereo</option>
          </select>
        </label>
        <span className="filter-count" role="status">
          {shown.length} of {catalog.systems.length} systems
        </span>
      </div>
      <div className="system-grid">
        {shown.map((s) => (
          <article className="system-card" key={s.id}>
            <span className="tag">{s.family}</span>
            <h2>
              <Link href={"/systems/" + s.id + "/"}>{s.name}</Link>
            </h2>
            <p className="description">{s.summary}</p>
            <p className="modes">{s.inputModes.join(" · ")}</p>
            <Link className="text-link" href={"/systems/" + s.id + "/"}>
              Implementation details <ArrowRight size={15} />
            </Link>
          </article>
        ))}
        {!shown.length && (
          <div className="empty">
            <h2>No matching systems</h2>
            <p>Try a broader term or reset the filters.</p>
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setFamily("All");
                setMode("All");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
