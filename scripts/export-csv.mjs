import { readFile, writeFile } from "node:fs/promises";
const { records } = JSON.parse(
  await readFile("public/data/runtime.json", "utf8"),
);
const keys = Object.keys(records[0]);
const escape = (v) =>
  v == null ? "" : '"' + String(v).replaceAll('"', '""') + '"';
await writeFile(
  "public/data/runtime.csv",
  [
    keys.join(","),
    ...records.map((r) => keys.map((k) => escape(r[k])).join(",")),
  ].join("\n") + "\n",
);
console.log(`Exported ${records.length} measured records.`);
