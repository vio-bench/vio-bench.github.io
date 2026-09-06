"use client";
import { useState } from "react";
export function CodeBlock({
  code,
  label = "BASH",
}: {
  code: string;
  label?: string;
}) {
  const [state, setState] = useState("Copy");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("Copied");
      setTimeout(() => setState("Copy"), 1800);
    } catch {
      setState("Select and copy below");
    }
  }
  return (
    <div className="code-block">
      <div className="code-label">{label}</div>
      <button onClick={copy} aria-label={"Copy " + label + " commands"}>
        <span role="status">{state}</span>
      </button>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
