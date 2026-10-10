#!/usr/bin/env python3
"""Export the retained ATE/RPE source tables without recomputing any value.

Pass --source-package pointing to the frozen full trajectory package containing
trajectory_cells.csv, trajectory_manifest.json and trajectory_source/.
"""
import argparse
import csv
import hashlib
import json
import re
from collections import Counter, OrderedDict
from datetime import datetime, timezone
from pathlib import Path

REVISION = "d11e47385afcf3745d17912654d3a22b4b8bb2ca"
BATCH = "20260909_030015"
CSV_SHA256 = "c7e46093ccf3672f3272b4d57cbbd9093a9a835d10929d3cbdcf60795140fbf4"
MANIFEST_SHA256 = "54a90dc5c05a0adfba5434ff1d56987955266c9cd2a220d2d15888118354942d"
DATASETS = [("EuRoC MAV", "euroc"), ("UZH-FPV", "uzh-fpv"), ("AQUALOC", "aqualoc"), ("LaMAria", "lamaria"), ("GrandTour", "grandtour")]
DATASET_IDS = dict(DATASETS)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def export(package, checked_at):
    require(sha(package / "trajectory_manifest.json") == MANIFEST_SHA256, "Reviewed manifest hash mismatch")
    require(sha(package / "trajectory_cells.csv") == CSV_SHA256, "Reviewed raw-cell ledger hash mismatch")
    manifest = json.loads((package / "trajectory_manifest.json").read_text())
    require(manifest["source"]["result_commit"] == REVISION and manifest["source"]["results_batch"] == BATCH, "Source identity mismatch")
    for filename, digest in manifest["source"]["source_files"].items():
        require(Path(filename).name == filename, "Unexpected source member path")
        require(sha(package / "trajectory_source" / filename) == digest, "Frozen source-table hash mismatch")
    with (package / "trajectory_cells.csv").open(newline="") as stream:
        records = list(csv.DictReader(stream))
    require(len(records) == 11196, "Unexpected raw-cell inventory")
    grouped = OrderedDict()
    seen = set()
    for row in records:
        require(row["result_commit"] == REVISION and row["results_batch"] == BATCH, "Mixed source versions")
        require(row["cell_id"] not in seen, "Duplicate source cell")
        seen.add(row["cell_id"])
        require(row["source_sha256"] == manifest["source"]["source_files"][row["source_file"]], "Per-record source mismatch")
        grouped.setdefault(row["source_table"], []).append(row)
    require(len(grouped) == 136, "Unexpected complete source-table inventory")
    retained_records = [row for row in records if row["protocol"] != "epa-all" and row["metric"] != "SR"]
    tables = []
    for table_key, items in grouped.items():
        if items[0]["protocol"] == "epa-all" or items[0]["metric"] == "SR":
            continue
        first = items[0]
        columns = list(dict.fromkeys(row["sequence_or_average"] for row in items))
        require(columns[-1] == "Average", "Expected preserved Average column")
        methods = OrderedDict()
        for row in items:
            require(all(row[k] == first[k] for k in ("dataset", "group", "metric", "protocol", "rpe_length_m", "source_table_start")), "Mixed table identities")
            methods.setdefault(row["configuration_key"], []).append(row)
        public_rows = []
        for method, cells in methods.items():
            require([row["sequence_or_average"] for row in cells] == columns, "Source columns differ by method")
            public_rows.append({"method": method, "cells": [row["raw_token"] for row in cells]})
        heading = f'{first["metric"]} ({first["protocol"]})'
        if first["rpe_length_m"]:
            heading += f', {first["rpe_length_m"]} m'
        tables.append({"id": "table-" + hashlib.sha256(table_key.encode()).hexdigest()[:16],
            "datasetId": DATASET_IDS[first["dataset"]], "group": first["group"], "metric": heading,
            "columns": columns, "rows": public_rows, "metricFamily": first["metric"], "protocol": first["protocol"],
            "rpeLengthM": int(first["rpe_length_m"]) if first["rpe_length_m"] else None,
            "sourceStatus": "reported-source",
            "sourceArtifactId": "source-" + hashlib.sha256(first["source_file"].encode()).hexdigest()[:16],
            "sourceStartLine": int(first["source_table_start"])})
    require(len(tables) == 94 and sum(len(t["rows"]) for t in tables) == 1395, "Unexpected retained table/method-row inventory")
    require(sum(len(row["cells"]) for table in tables for row in table["rows"]) == len(retained_records) == 7740, "Retained source cells not mapped exactly once")
    return {
        "source": {"revision": REVISION, "checkedAt": checked_at,
            "status": "Selected Final ATE/RPE source tables. SR is supplied separately by the designated three-expected-run export.",
            "batch": BATCH, "ledgerSha256": CSV_SHA256,
            "sourceArtifacts": [{"id": "source-" + hashlib.sha256(name.encode()).hexdigest()[:16], "sha256": digest}
                                for name, digest in manifest["source"]["source_files"].items()]},
        "datasets": [{"id": identifier, "name": name} for name, identifier in DATASETS],
        "tables": tables,
        "notes": [
            "Every retained ATE/RPE table cell preserves its original metric, protocol, dataset, group and RPE segment length. No source Average is recomputed.",
            "SR uses the designated three-expected-run export. Earlier report SR tables are omitted.",
            "Error pairs are rotation in degrees / translation in metres. SR is a percentage of full reference-path length. RPE values are not divided by segment length.",
            "ATE and RPE use the retained drift-valid source protocol; no cross-protocol averages are computed.",
            "Raw cells preserve TeX delimiters, missing tokens, source precision, asterisks and parenthesized counts. Each asterisk denotes a run excluded for SR below 75%, not a diagnosed failure or successful-run count.",
            "Parenthesized counts refer to runs in sequence cells and sequences in Average cells. Expected runs do not establish attempted or contributing run counts.",
            "There are 94 trajectory tables, 1,395 method rows and 7,740 source cells, including 1,395 original group Average cells and 6,345 sequence cells.",
            "RPE coverage is 21 source groups at 10 m, 20 at 20 m, and 16 each at 50 m and 100 m. An absent length is unreported, not a zero error or a failed run.",
            "Source configuration keys are preserved. Trajectory execution platform and input variants are not specified by these tables; no values are borrowed from resource profiling.",
            "Resource profiling uses separate sources and releases. This archive contains trajectory results only.",
        ],
        "counts": {"tables": 94, "methodRows": 1395, "cells": 7740,
            "sequenceCells": sum(row["statistical_unit"] == "reported sequence" for row in retained_records),
            "averageCells": sum(row["statistical_unit"] == "reported group Average" for row in retained_records),
            "sourceCellStates": dict(Counter(row["state"] for row in retained_records))},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-package", required=True, type=Path)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "public/data/current-source-tables.json")
    parser.add_argument("--checked-at", default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    document = export(args.source_package, args.checked_at)
    text = json.dumps(document, ensure_ascii=False, allow_nan=False, separators=(",", ":")) + "\n"
    require(not re.search(r"/Users/|/home/|https?://|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:api[_-]?key|access[_-]?token)\s*[:=]", text), "Private source context in public export")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(text)
    print(json.dumps(document["counts"], indent=2))


if __name__ == "__main__":
    main()
