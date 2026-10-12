import type { SourceTable } from "./results-types.ts";
export type MotionComponent = "translation" | "rotation";
export function trajectoryIdentity(table: SourceTable) {
  return { family: table.metric.startsWith("RPE") ? "RPE" : "ATE", length: Number(table.metric.match(/,\s*(\d+)\s*m/)?.[1] ?? 0) };
}
export function trajectoryCell(raw: string, component: MotionComponent) {
  const stars = raw.match(/\^\{(\*+)\}/)?.[1] ?? "";
  const contribution = raw.match(/\((\d+\/\d+)\)/)?.[1] ?? "";
  const clean = raw.replace(/\$/g, "").replace(/\\text\{([^{}]*)\}/g, "$1").replace(/\^\{\*+\}/g, "").replace(/\{\\scriptsize\s+([^{}]*)\}/g, "$1").trim();
  const pair = clean.match(/^([^/\s]+)\s*\/\s*([^/\s]+)/);
  const token = pair ? pair[component === "rotation" ? 1 : 2] : clean.split(/\s/)[0];
  return { value: token === "--" || token === "-" ? "—" : token, stars, contribution,
    title: ["Source: " + clean, stars ? stars.length + " run(s) excluded for SR < 75%." : "", contribution ? "Reported contribution: " + contribution : ""].filter(Boolean).join(" ") };
}
