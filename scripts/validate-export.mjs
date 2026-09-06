import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
const root = resolve("out");
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map(async (e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : join(dir, e.name),
      ),
    )
  ).flat();
}
const files = await walk(root);
const htmls = files.filter((f) => f.endsWith(".html"));
const errors = [];
const checked = new Set();
for (const file of htmls) {
  const text = await readFile(file, "utf8");
  if (!/<h1[ >]/.test(text)) errors.push(`${file}: no h1`);
  if (!/lang="en"/.test(text)) errors.push(`${file}: missing language`);
  if (/\/Users\/|\/private\/tmp\/|localhost:|127\.0\.0\.1/.test(text))
    errors.push(`${file}: private or development path`);
  const ids = new Set([...text.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of text.matchAll(/\b(?:href|src)="([^" ]+)"/g)) {
    const raw = m[1].replaceAll("&amp;", "&");
    if (raw.startsWith("#")) {
      if (raw.length > 1 && !ids.has(raw.slice(1)))
        errors.push(`${file}: missing anchor ${raw}`);
      continue;
    }
    if (!raw.startsWith("/") || raw.startsWith("//")) continue;
    const path = decodeURI(raw.split(/[?#]/)[0]);
    if (checked.has(path)) continue;
    checked.add(path);
    let target = join(root, path);
    if (path.endsWith("/")) target = join(target, "index.html");
    try {
      await stat(target);
    } catch {
      errors.push(`${file}: missing ${path}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Validated ${htmls.length} exported pages and ${checked.size} local URLs: headings, anchors, assets, and private-path scan passed.`,
);
