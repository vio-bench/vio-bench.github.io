import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { trajectoryCell, trajectoryIdentity } from "../lib/trajectory-display.ts";

test("motion components keep source precision, exclusions and contributor counts", () => {
  const raw = "$1.758 / 0.122^{**}$";
  assert.equal(trajectoryCell(raw, "translation").value, "0.122");
  assert.equal(trajectoryCell(raw, "rotation").value, "1.758");
  assert.equal(trajectoryCell(raw, "translation").stars, "**");
  assert.equal(trajectoryCell("7.802 / 0.530 {\\scriptsize (5/6)}", "translation").contribution, "5/6");
  assert.equal(trajectoryCell("$\\text{--}^{***}$", "translation").value, "—");
  assert.equal(trajectoryCell("$\\text{--}^{***}$", "translation").stars, "***");
  assert.equal(trajectoryCell("$0.000 / 0.000$", "translation").value, "0.000");
});

test("all source pairs remain readable in both component views and all distances remain separate", () => {
  const data = JSON.parse(readFileSync(new URL("../public/data/current-source-tables.json", import.meta.url), "utf8"));
  for (const table of data.tables) {
    const id = trajectoryIdentity(table);
    assert.ok(id.family === "ATE" || id.family === "RPE");
    if (id.family === "RPE") assert.ok([10, 20, 50, 100].includes(id.length));
    for (const row of table.rows) for (const raw of row.cells) {
      for (const component of ["rotation", "translation"]) {
        const display = trajectoryCell(raw, component);
        assert.ok(display.value === "—" || Number.isFinite(Number(display.value)), raw);
        assert.equal(display.stars.length, (raw.match(/\^\{(\*+)\}/)?.[1] ?? "").length);
      }
    }
  }
});
