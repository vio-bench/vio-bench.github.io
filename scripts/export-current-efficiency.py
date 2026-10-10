#!/usr/bin/env python3
"""Export the reviewed current resource tables without recomputing source values.

--source-package is the frozen resources/ directory containing rows.csv,
long.csv, manifest.json and source/. The neutral metadata supplies display identities and metric definitions only.
All values and counts come from the verified source files.
"""
import argparse
import copy
import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from decimal import Decimal

REVISION = "29a1fa93804899fac8bf17799b5bd101ae02d9a4"
HASHES = {"rows.csv": "2c26e9db39d2d31e6cc54d3f8cd1efd923e31346089076451ce4483776b149cd",
          "long.csv": "7b357adf55ea4a9e1d4102f8c9160b59271d14f31d5e8240807ccf5944a4a036",
          "manifest.json": "664a3b6a25df2dbdf89075c079481f4be60da9f80db10218e8c0dfde26561cd4"}
PRIMARY = {"nativeTotalMs", "reportedCpuPercent", "reportedProcessMemoryMiB"}
FIELDS = {
    ("native_tracking", "mean"): "nativeTrackingMeanMs",
    ("native_tracking", "std"): "nativeTrackingMeanWithinRunPopulationSdMs",
    ("native_estimation", "mean"): "nativeEstimationMeanMs",
    ("native_estimation", "std"): "nativeEstimationMeanWithinRunPopulationSdMs",
    ("native_total", "mean"): "nativeTotalMs",
    ("native_total", "std"): "nativeTotalMeanWithinRunPopulationSdMs",
    ("host_cpu", "mean"): "reportedCpuPercent",
    ("host_cpu", "std"): "reportedCpuMeanWithinRunPopulationSdPercent",
    ("host_cpu", "p95"): "reportedCpuMeanRunP95Percent",
    ("host_cpu", "peak"): "reportedCpuMeanRunPeakPercent",
    ("process_ram", "mean"): "reportedProcessMemoryMiB",
    ("process_ram", "std"): "reportedProcessMemoryMeanWithinRunPopulationSdMiB",
    ("process_ram", "p95"): "reportedProcessMemoryMeanRunP95MiB",
    ("process_ram", "peak"): "reportedProcessMemoryMeanRunPeakMiB",
    ("gpu_utilization", "mean"): "reportedGpuMeanPercent",
    ("gpu_utilization", "std"): "reportedGpuMeanWithinRunPopulationSdPercent",
    ("gpu_utilization", "p95"): "reportedGpuMeanRunP95Percent",
    ("gpu_utilization", "peak"): "reportedGpuMeanRunPeakPercent",
    ("gpu_memory", "baseline"): "reportedGpuMemoryMeanRunBaselineMiB",
    ("gpu_memory_delta", "mean"): "reportedGpuMemoryDeltaMeanMiB",
    ("gpu_memory_delta", "std"): "reportedGpuMemoryDeltaMeanWithinRunPopulationSdMiB",
    ("gpu_memory_delta", "p95"): "reportedGpuMemoryDeltaMeanRunP95MiB",
    ("gpu_memory_delta", "peak"): "reportedGpuMemoryDeltaMeanRunPeakMiB",
}
SYSTEM_ALIASES = {"Kimera": "Kimera-VIO", "SVO": "SVO Pro"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def identity(row, source=False):
    if source:
        return (row["platform"], "AQUALOC" if row["dataset"] == "Aqualoc" else row["dataset"],
                row["profiling_input"], SYSTEM_ALIASES.get(row["system"], row["system"]), row["mode"], row["input_variant"])
    return tuple(row[key] for key in ("platform", "dataset", "sequence", "system", "mode", "inputVariant"))


def export(package, metadata_path, verified_on):
    for name, expected in HASHES.items():
        require(sha(package / name) == expected, "Reviewed source hash mismatch: " + name)
    manifest = json.loads((package / "manifest.json").read_text())
    require(manifest["source_commit"] == REVISION, "Resource source revision mismatch")
    for name, spec in manifest["source_files"].items():
        require(Path(name).name == name and sha(package / "source" / name) == spec["sha256"], "Resource TeX source hash mismatch")
    metadata = json.loads(metadata_path.read_text())
    with (package / "rows.csv").open(newline="") as stream:
        source_rows = list(csv.DictReader(stream))
    with (package / "long.csv").open(newline="") as stream:
        stats = list(csv.DictReader(stream))
    require(len(source_rows) == 166 and len(stats) == 2909, "Unexpected full-source inventory")
    identity_by_key = {identity(row): row for row in metadata["identities"]}
    source_by_key = {identity(row, True): row for row in source_rows}
    require(len(identity_by_key) == len(source_by_key) == 166 and identity_by_key.keys() == source_by_key.keys(), "Source identity matrix differs; explicit new identity review required")
    require(set(FIELDS.values()) == set(metadata["metricDefinitions"]), "Reviewed metric schema mismatch")
    by_row = defaultdict(dict)
    row_keys = {row["row_id"]: row for row in source_rows}
    for stat in stats:
        require(stat["row_id"] in row_keys, "Statistic lacks a source row")
        parent = row_keys[stat["row_id"]]
        require(all(stat[key] == parent[key] for key in parent if key != "raw_row"), "Statistic identity differs from source row")
        field = FIELDS[(stat["metric"], stat["statistic"])]
        require(field not in by_row[stat["row_id"]], "Duplicate source statistic")
        require(stat["unit"] == metadata["metricDefinitions"][field]["unit"], "Metric unit mismatch")
        require(stat["status"] in ("reported", "unavailable"), "Unreviewed missing state")
        require(bool(stat["value"]) == (stat["status"] == "reported"), "Statistic value/status mismatch")
        by_row[stat["row_id"]][field] = stat
    rows = []
    for source in source_rows:
        row = copy.deepcopy(identity_by_key[identity(source, True)])
        row.update({"sourceRecordId": "eff-" + hashlib.sha256((REVISION + "|" + "|".join(identity(source, True))).encode()).hexdigest()[:20],
            "sourceRevision": REVISION, "sourceSelectedRuns": int(source["runs"]), "selectedRunException": int(source["runs"]) != 5,
            "metricStatus": {}, "extendedMetrics": {}, "extendedMetricStatus": {}, "sourceValues": {},
            "timingDefinition": "frontend_plus_backend" if source["system"] == "SVO" else "reported_native_total",
            "sourceEvidence": {"file": "source-" + hashlib.sha256(source["source_file"].encode()).hexdigest()[:16],
                "line": int(source["source_line"]), "rowSha256": hashlib.sha256(source["raw_row"].encode()).hexdigest(),
                "rawSystem": source["system"], "rawInputVariant": source["input_variant"]}})
        for field in FIELDS.values():
            stat = by_row[source["row_id"]].get(field)
            value = float(stat["value"]) if stat and stat["value"] else None
            status = ("reported" if stat["status"] == "reported" else "source_dash") if stat else "column_absent"
            require(stat is not None or (source["platform_slug"] != "pc" and "Gpu" in field), "Unexpected absent source column")
            if field in PRIMARY:
                row[field] = value
                row["metricStatus"][field] = status
            else:
                row["extendedMetrics"][field] = value
                row["extendedMetricStatus"][field] = status
            row["sourceValues"][field] = {"valueText": stat["value"] if stat else "", "rawToken": stat["raw_token"] if stat else "",
                "sourceMetric": stat["metric"] if stat else None, "sourceStatistic": stat["statistic"] if stat else None,
                "sourceStatus": stat["status"] if stat else "column_absent"}
        if row["timingDefinition"] == "frontend_plus_backend":
            text = lambda field: row["sourceValues"][field]["valueText"]
            require(Decimal(text("nativeTotalMs")) == Decimal(text("nativeTrackingMeanMs")) + Decimal(text("nativeEstimationMeanMs")), "Source SVO component total mismatch")
            require(row["extendedMetricStatus"]["nativeTotalMeanWithinRunPopulationSdMs"] == "source_dash", "Source SVO total SD must remain unavailable")
        rows.append(row)
    require(all(r["sourceSelectedRuns"] == 5 for r in rows), "Unexpected selected-run counts")
    states = Counter(s for r in rows for s in list(r["metricStatus"].values()) + list(r["extendedMetricStatus"].values()))
    require(states == {"reported": 2331, "source_dash": 578, "column_absent": 909}, "Resource state inventory differs")
    inputs = copy.deepcopy(metadata["inputs"])
    for item in inputs:
        matching = [r for r in rows if r["inputId"] == item["id"]]
        item.update({"sourceRows": len(matching), "platformCounts": dict(Counter(r["platform"] for r in matching))})
    systems = copy.deepcopy(metadata["systems"])
    for item in systems:
        item["sourceRows"] = sum(r["systemId"] == item["id"] for r in rows)
    summary = {"actualSourceRows": len(rows), "systems": len(systems), "inputs": len(inputs), "platforms": 3,
        "modeCounts": dict(Counter(r["mode"] for r in rows)), "platformCounts": dict(Counter(r["platform"] for r in rows)),
        "primaryFiniteValues": sum(r[k] is not None for r in rows for k in PRIMARY),
        "primarySourceDashValues": sum(r[k] is None for r in rows for k in PRIMARY),
        "selectedRunCounts": dict(Counter(str(r["sourceSelectedRuns"]) for r in rows)), "selectedRunExceptionRecordIds": [],
        "sourceStatisticSlots": len(stats), "reportedStatisticSlots": states["reported"],
        "sourceDashStatisticSlots": states["source_dash"], "absentColumnSlots": states["column_absent"],
        "omittedCombinationsNotSupplied": 7, "timingDefinitions": dict(Counter(r["timingDefinition"] for r in rows))}
    return {"schemaVersion": 1, "release": {
        "title": "Current source resource tables", "status": "reviewed-current-source-tables",
        "sourceRevision": REVISION, "verifiedOn": verified_on,
        "verification": "All 166 source rows and 2,909 available-column statistic slots match the reviewed source TeX. No source statistics are recomputed.",
        "resourceSourceProof": [{"platform": {"resource_pc.tex": "Desktop", "resource_orin.tex": "Jetson Orin", "resource_nano.tex": "Jetson Nano"}[name], "sha256": spec["sha256"]} for name, spec in manifest["source_files"].items()],
        "ledgerHashes": {"rows": HASHES["rows.csv"], "statistics": HASHES["long.csv"]}, "benchmarkRerun": False,
        "statisticalLevel": "unweighted mean of per-selected-run summary statistics, excluding missing metrics",
        "sourceSelectedRunsScope": "selected runs represented by a source row; not per-metric contributing runs or total attempts",
        "perMetricContributingRuns": None, "totalAttempts": None,
        "limitations": [
            "The supplied source has 166 rows across five fixed profiling inputs and three platforms. It is not a complete system/input/mode/platform matrix.",
            "Every displayed source row reports five selected runs. Metric-contributing run counts and total attempts are not supplied.",
            "Values average per-selected-run summaries with missing metrics excluded. Standard deviations average within-run population deviations; P95 and peaks average run summaries, not pooled samples or confidence intervals.",
            "All 20 SVO total means are source-reported frontend-plus-backend sums, not independently measured native totals or end-to-end latency. Their total standard deviations are unavailable because covariance is not supplied.",
            "Seven omitted combinations are described but their resource measurements and identities are not supplied here. They are not filled or diagnosed as failed. DM-VIO has no resource row in this snapshot.",
            "GPU columns are absent from Jetson tables; Desktop GPU dashes and absent columns remain distinct. Three Desktop rows report GPU readings.",
            "GrandTour uses the source-reported standard input; other input variants remain unspecified. Native timing boundaries differ by implementation; CPU normalization across platforms and memory RSS/PSS identity are unverified.",
            "Resource and trajectory tables have separate source revisions and run selections; matching system names do not establish matched executions.",
        ]}, "summary": summary, "metricDefinitions": metadata["metricDefinitions"], "inputs": inputs, "systems": systems,
        "rows": rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    root = Path(__file__).resolve().parents[1]
    parser.add_argument("--source-package", type=Path, required=True)
    parser.add_argument("--metadata", type=Path, default=root / "scripts/data/resource-metadata.json")
    parser.add_argument("--output", type=Path, default=root / "public/data/current-efficiency.json")
    parser.add_argument("--verified-on", default="2026-10-10")
    args = parser.parse_args()
    document = export(args.source_package, args.metadata, args.verified_on)
    text = json.dumps(document, ensure_ascii=False, allow_nan=False, separators=(",", ":")) + "\n"
    require(not re.search(r"/Users/|/home/|https?://|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:api[_-]?key|access[_-]?token)\s*[:=]", text), "Private source context in public export")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(text)
    print(json.dumps(document["summary"], indent=2))


if __name__ == "__main__":
    main()
