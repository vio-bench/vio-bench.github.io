import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { rankValues, csvText } from "../lib/leaderboards.ts";
const directory = new URL("../public/data/", import.meta.url);
const json = name => JSON.parse(readFileSync(new URL(name, directory), "utf8"));
const manifest = json("results-manifest.json");

test("public table package checksums and separate source revisions match the exports", () => {
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(manifest.sourceRevisions.trajectory, json("current-source-tables.json").source.revision);
  assert.equal(manifest.sourceRevisions.resources, json("current-efficiency.json").release.sourceRevision);
  assert.equal(manifest.sourceRevisions.sr, null);
  for (const [name, hash] of Object.entries(manifest.artifacts))
    assert.equal(createHash("sha256").update(readFileSync(new URL(name, directory))).digest("hex"), hash, name);
  assert.equal(manifest.counts.sourceTables, 94);
  assert.equal(manifest.counts.sourceCells, 7740);
  assert.equal(manifest.counts.resourceRecords, 166);
  assert.equal(manifest.counts.srExpectedRunSlots, 4266);
});

test("replaced website releases are absent from public assets and the download package", () => {
  for (const name of ["accuracy.json", "efficiency.json", "source-tables.json", "runtime.json", "runtime.csv", "results-bac8b9f.zip", "resource-updates.json"])
    assert.equal(existsSync(new URL(name, directory)), false, name);
  assert.deepEqual(new Set(manifest.download.members), new Set([...Object.keys(manifest.artifacts), "results-manifest.json"]));
  const report = JSON.parse(execFileSync("python3", ["-c", `import json,hashlib,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as z:
 print(json.dumps({name:hashlib.sha256(z.read(name)).hexdigest() for name in z.namelist()}))`, new URL(manifest.download.filename, directory).pathname], { encoding: "utf8" }));
  assert.deepEqual(Object.keys(report).sort(), [...manifest.download.members].sort());
  for (const [name, digest] of Object.entries(report))
    assert.equal(digest, createHash("sha256").update(readFileSync(new URL(name, directory))).digest("hex"), name);
});

test("public data files contain no private source locations or credential patterns", () => {
  for (const name of Object.keys(manifest.artifacts)) {
    const text = readFileSync(new URL(name, directory), "utf8");
    assert.doesNotMatch(text, /\/Users\/|\/private\/tmp\/|git\.overleaf\.com|69693ce4ccea6ac41795262e|ghp_[A-Za-z0-9]+|github_pat_/);
  }
});

test("shared ranking helper preserves true zero, ties and unranked missing values", () => {
  const input = [{ id: "missing", value: null }, { id: "zero", value: 0 }, { id: "b", value: 2 }, { id: "a", value: 2 }, { id: "last", value: 3 }];
  assert.deepEqual(rankValues(input).map(r => [r.id, r.rank]), [["zero", 1], ["b", 2], ["a", 2], ["last", 4], ["missing", null]]);
  assert.equal(input[0].id, "missing");
});

test("CSV text preserves missing values and quotes original source text", () => {
  assert.equal(csvText(["value", "source label"], [[null, "a,b"], [0, 'x"y']]), '"value","source label"\n,"a,b"\n"0","x""y"\n');
});
