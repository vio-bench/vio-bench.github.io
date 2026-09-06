import test from "node:test";
import assert from "node:assert/strict";
import { simulate, reference, trajectoryCSV } from "../lib/trajectory.ts";
test("ideal path has zero error and full duration", () => {
  const r = simulate();
  assert.equal(r.rmse, 0);
  assert.equal(r.matchedSamples, 241);
  assert.equal(r.coverage, 100);
  assert.deepEqual(r.ref, r.estimate);
});
test("constant acceleration bias produces analytic quadratic displacement", () => {
  const r = simulate({ bias: 0.01 });
  const last = r.estimate.at(-1);
  assert.ok(Math.abs(last.x - r.ref.at(-1).x - 4.5) < 1e-12);
  assert.equal(last.y, r.ref.at(-1).y);
  const expected = Math.sqrt(
    r.ref.reduce((sum, p) => sum + (0.005 * p.t * p.t) ** 2, 0) / 241,
  );
  assert.ok(Math.abs(r.rmse - expected) < 1e-12);
});
test("positive time offset samples the path at t plus offset", () => {
  const r = simulate({ offset: 0.2 });
  assert.deepEqual(r.estimate[0], { ...reference(0.2), t: 0 });
  assert.ok(r.rmse > 0);
});
test("shortened output is missing, not perfect; observed duration stays explicit", () => {
  const full = simulate({ bias: 0.01 });
  const short = simulate({ bias: 0.01, coverage: 25 });
  assert.equal(short.end, 7.5);
  assert.equal(short.coverage, 25);
  assert.equal(short.matchedSamples, 61);
  assert.ok(short.rmse < full.rmse);
  const rows = trajectoryCSV(short).split("\n");
  assert.equal(rows.length, 242);
  assert.equal(rows.at(-1).split(",").slice(-2).join(","), ",");
  assert.notEqual(rows[61].split(",").at(-1), "");
});
test("CSV header carries seconds and meters; reference has all timestamps", () => {
  const rows = trajectoryCSV(simulate()).split("\n");
  assert.equal(
    rows[0],
    "time_s,reference_x_m,reference_y_m,estimate_x_m,estimate_y_m",
  );
  assert.equal(rows[1].split(",")[0], "0");
  assert.equal(rows.at(-1).split(",")[0], "30");
});
test("invalid or nonfinite controls cannot silently generate invalid results", () => {
  for (const p of [
    { offset: NaN },
    { bias: Infinity },
    { coverage: 0 },
    { offset: 1 },
    { bias: -1 },
  ])
    assert.throws(() => simulate(p), RangeError);
});
