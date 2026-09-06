export type Point = { t: number; x: number; y: number };
export function reference(t: number): Point {
  return { t, x: 8 * Math.sin(t * 0.2) + 0.1 * t, y: 5 * Math.sin(t * 0.12) };
}
export function simulate({
  offset = 0,
  bias = 0,
  coverage = 100,
}: { offset?: number; bias?: number; coverage?: number } = {}) {
  if (
    !Number.isFinite(offset) ||
    !Number.isFinite(bias) ||
    !Number.isFinite(coverage) ||
    Math.abs(offset) > 0.5 ||
    bias < 0 ||
    bias > 0.02 ||
    coverage < 25 ||
    coverage > 100
  )
    throw new RangeError("Simulation parameters outside teaching range");
  const ref = Array.from({ length: 241 }, (_, i) => reference(i / 8));
  const end = (30 * coverage) / 100;
  const estimate = ref
    .filter((p) => p.t <= end)
    .map((p) => {
      const q = reference(p.t + offset);
      return { t: p.t, x: q.x + 0.5 * bias * p.t * p.t, y: q.y };
    });
  const squared = estimate.map(
    (p, i) => (p.x - ref[i].x) ** 2 + (p.y - ref[i].y) ** 2,
  );
  const rmse = Math.sqrt(squared.reduce((a, b) => a + b, 0) / squared.length);
  const actualEnd = estimate[estimate.length - 1].t;
  return {
    ref,
    estimate,
    rmse,
    coverage: (100 * actualEnd) / 30,
    end: actualEnd,
    matchedSamples: estimate.length,
  };
}
export function trajectoryCSV(result: ReturnType<typeof simulate>) {
  return [
    "time_s,reference_x_m,reference_y_m,estimate_x_m,estimate_y_m",
    ...result.ref.map((p, i) =>
      [
        p.t,
        p.x,
        p.y,
        result.estimate[i]?.x ?? "",
        result.estimate[i]?.y ?? "",
      ].join(","),
    ),
  ].join("\n");
}
