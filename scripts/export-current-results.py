#!/usr/bin/env python3
"""Export the reviewed trajectory snapshot without evaluating or modifying sources.

Usage: python3 scripts/export-current-results.py --source-root /path/to/source
The source root is the benchmark paper checkout containing results/. Changed
source hashes require a new reviewed contract, never a replacement hash alone.
"""
import argparse
import csv
import hashlib
import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path

BATCH = "20260909_030015"
REVISION = "d11e47385afcf3745d17912654d3a22b4b8bb2ca"
INPUTS = {
    "ate-aggregate": ("fig1_accuracy/approved_horizontal_gtour_20260910/source_ate_plot.csv", "ad071fec2960aeea55aff2890a39363322d5d9169149187c84b473f104aac2e0"),
    "ate-sequence": ("corrected_20260909_030015/publication/ate_contributions.csv", "daff7261b48cf5defbf9fce6bf1fafc51187b07578ef6697b81a83a46533b028"),
    "rpe10-aggregate": ("rpe10/approved_heatmap_20260910/rpe10_plot.csv", "8b2d1614f246632bde00799f73ea13bbaf85801c2b529eefbbf710a6eb90e9b5"),
    "rpe10-sequence": ("rpe10/approved_heatmap_20260910/rpe10_sequence_data.csv", "a1b85c9cbe5e2e8f3e1ac6064bf88561e71f6314fd14c4d3db0e993efbc28a32"),
    "sr-aggregate": ("robustness_sr/coauthor_20260910/source/average_sr_by_dataset.csv", "2a850d02e34357bcc18c1ba843952d551a7edd6c87c2c31bbb5e249fb7afa6c9"),
    "sr-sequence": ("robustness_sr/coauthor_20260910/source/sr_by_sequence.csv", "148c26274508896eb7dacc6acd195491ccc3c66daab45883e67dabc8340f0998"),
    "sr-run": ("robustness_sr/coauthor_20260910/source/sr_by_run.csv", "4f6a8a40e9be681c492b5681126a6ead23786b81b26114b1613f6864f5041e0c"),
}
DATASETS = [
    {"id": "euroc", "label": "EuRoC", "sequenceCount": 11},
    {"id": "uzh-fpv", "label": "UZH-FPV", "sequenceCount": 15},
    {"id": "aqualoc", "label": "AQUALOC", "sequenceCount": 17},
    {"id": "lamaria", "label": "LaMAria", "sequenceCount": 21},
    {"id": "grandtour", "label": "GrandTour", "sequenceCount": 34},
]
DATASET_IDS = {"EuRoC MAV": "euroc", "eurocmav": "euroc", "UZH-FPV": "uzh-fpv", "uzhfpv": "uzh-fpv", "AQUALOC": "aqualoc", "aqualoc": "aqualoc", "LaMAria": "lamaria", "lamaria": "lamaria", "GrandTour": "grandtour", "grand_tour": "grandtour"}
MODE_CONFIRMATIONS = {"ROVIO": "mono", "DM-VIO": "mono", "AirSLAM": "stereo"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def number(value):
    if value in ("", None):
        return None
    parsed = float(value)
    return parsed if math.isfinite(parsed) else None


def integer(value):
    return int(value) if value not in ("", None) else None


def close(a, b):
    return math.isclose(a, b, rel_tol=1e-12, abs_tol=1e-10)


def source_locator(row):
    filename = row.get("source_file", "")
    return {"file": "source-" + hashlib.sha256(filename.encode()).hexdigest()[:16] if filename else None,
            "line": integer(row.get("source_line"))}


def read_inputs(root):
    rows = {}
    for name, (relative, expected_hash) in INPUTS.items():
        path = root / "results" / relative
        require(hashlib.sha256(path.read_bytes()).hexdigest() == expected_hash, "Reviewed source hash mismatch: " + name)
        with path.open(newline="") as stream:
            rows[name] = list(csv.DictReader(stream))
    mode_path = root / "results/fig1_accuracy/approved_horizontal_gtour_20260910/author_mode_confirmation.json"
    require(hashlib.sha256(mode_path.read_bytes()).hexdigest() == "a9f6ca8bf43db6e518bf5baffd2195157895f9f06c162a5ca0885258e10e7d45", "Mode authority hash mismatch")
    authority = json.loads(mode_path.read_text())
    require(authority["results_batch"] == BATCH and authority["confirmed_modes"] == MODE_CONFIRMATIONS, "Unexpected mode authority")
    return rows


def export(root, verified_on):
    rows = read_inputs(root)
    config_by_id = {}
    for row in rows["rpe10-aggregate"]:
        config = {"id": row["configuration_key"], "system": row["system"], "mode": row["mode"]}
        require(config_by_id.get(config["id"], config) == config, "Configuration identity conflict")
        config_by_id[config["id"]] = config
    config_lookup = {(c["system"], c["mode"]): c["id"] for c in config_by_id.values()}
    require(len(config_lookup) == len(config_by_id) == 18, "Expected 18 unique reviewed configurations")

    def identity(row, ate=False):
        if ate:
            mode = MODE_CONFIRMATIONS.get(row["system"]) if row["mode"] == "unspecified" else row["mode"]
            cid = config_lookup[(row["system"], mode)]
        else:
            cid = row.get("configuration_key", row.get("method"))
        require(cid in config_by_id, "Unreviewed configuration identity")
        return {"configurationId": cid, "datasetId": DATASET_IDS[row["dataset"]]}

    def aggregate(row, ate=False):
        require(row["protocol"] == "epa-drift valid", "Mixed accuracy protocols")
        require(row.get("repo_commit", row.get("result_commit")) == REVISION, "Mixed source revisions")
        result = {**identity(row, ate), "metric": row["metric"], "unit": row["unit"],
                  "value": number(row["value"]), "valueText": row["value"], "n": integer(row["n"]),
                  "sequenceCount": int(row["N_report"]), "missingStatus": row["missing_status"],
                  "contributingSequences": row["contributing_sequences"].split(" | " if ate else ";") if row["contributing_sequences"] else [],
                  "sourceId": "ate" if ate else "rpe10", "protocol": row["protocol"],
                  "inputVariant": row["input_variant"], "platform": row["platform"]}
        if not ate:
            result["segmentLengthM"] = int(row["segment_length_m"])
        return result

    accuracy = {"aggregates": [aggregate(r, True) for r in rows["ate-aggregate"]], "sequences": []}
    for row in rows["ate-sequence"]:
        require(row["protocol"] == "epa-drift valid" and row["repo_commit"] == REVISION, "Mixed ATE sequence source")
        require(row["source_star_semantics"] == "excluded_runs_sr_lt_75" or
                (row["missing_status"] == "absent_row" and not row["source_star_semantics"]), "Unexpected source annotation semantics")
        accuracy["sequences"].append({**identity(row, True), "group": row["group"], "sequence": row["sequence"],
            "metric": row["metric"], "unit": row["unit"], "value": number(row["value"]), "valueText": row["value"],
            "included": row["included"] == "True", "missingStatus": row["missing_status"], "raw": row["raw_pair"],
            "excludedRunCount": integer(row["source_star_count"]), "reportedRunCount": integer(row["source_reported_run_count"]),
            "reportedRunTotal": integer(row["source_reported_run_total"]), "expectedRunCount": integer(row["source_expected_run_count"]),
            "sourceId": "ate", "source": source_locator(row), "protocol": row["protocol"],
            "rawMode": row["mode"], "inputVariant": row["input_variant"], "platform": row["platform"]})

    rpe = {"aggregates": [aggregate(r) for r in rows["rpe10-aggregate"]], "sequences": []}
    for row in rows["rpe10-sequence"]:
        require(row["protocol"] == "epa-drift valid" and row["result_commit"] == REVISION and row["rpe_length_m"] == "10", "Mixed RPE protocol or length")
        rpe["sequences"].append({**identity(row), "group": row["group"], "sequence": row["sequence_or_average"],
            "metric": row["metric_component"], "unit": row["unit"], "value": number(row["component_value"]), "valueText": row["component_value"],
            "included": row["component_status"] == "finite", "missingStatus": row["component_status"], "raw": row["raw_token"],
            "sourceState": row["state"], "excludedRunCount": integer(row["star_count"]), "reportedRunCount": integer(row["reported_n"]),
            "reportedRunTotal": integer(row["reported_N"]), "expectedRunCount": 3, "segmentLengthM": 10,
            "sourceId": "rpe10", "source": source_locator(row), "protocol": row["protocol"],
            "rawMode": row["mode_explicit_in_key"], "inputVariant": row["input_variant"], "platform": row["platform"]})

    def sr_counts(row):
        return {"validRuns": int(row["valid_runs"]), "missingRuns": int(row["missing_runs"]), "invalidRuns": int(row["invalid_runs"])}

    coverage = {"unit": "%", "range": [0, 100], "aggregates": [], "sequences": [], "runs": []}
    for row in rows["sr-aggregate"]:
        coverage["aggregates"].append({**identity(row), "value": number(row["average_sr_percent"]),
            "valueText": row["average_sr_percent"], "sequenceCount": int(row["sequences"]), "expectedRuns": int(row["expected_runs"]),
            **sr_counts(row), "sourceId": "sr"})
    for row in rows["sr-sequence"]:
        coverage["sequences"].append({**identity(row), "group": row["group"], "sequence": row["sequence"],
            "value": number(row["average_sr_percent"]), "valueText": row["average_sr_percent"],
            "expectedRuns": 3, **sr_counts(row), "sourceId": "sr"})
    for row in rows["sr-run"]:
        coverage["runs"].append({**identity(row), "group": row["group"], "sequence": row["sequence"], "run": row["run"],
            "rawValue": number(row["raw_sr_percent"]), "rawValueText": row["raw_sr_percent"],
            "value": number(row["sr_percent"]), "effectiveValueText": row["sr_percent"], "status": row["status"], "sourceId": "sr"})

    qa = validate(accuracy, rpe, coverage)
    return {
        "schemaVersion": 1,
        "release": {"batch": BATCH, "sourceRevision": REVISION, "verifiedOn": verified_on,
                    "label": "Reviewed September 9 trajectory results; September 10 SR export",
                    "sourceRevisionScope": "ATE and RPE only; the SR export has no supplied Git revision."},
        "datasets": DATASETS, "configurations": list(config_by_id.values()),
        "protocols": {
            "accuracy": {"id": "epa-drift valid", "alignment": "SE(3), without scale fitting",
                "selectionDescription": "Only runs with SR ≥ 75% contribute to ATE/RPE. Retained error samples are pooled within each sequence to compute RMSE; dataset means equally weight finite sequence RMSEs. Group Average values are excluded.",
                "eligibilityThresholdPercent": 75, "expectedRunCount": 3,
                "metrics": [{"id": "position_ate", "label": "Position ATE", "unit": "m"}, {"id": "orientation_ate", "label": "Orientation ATE", "unit": "deg"}, {"id": "translation_rpe", "label": "Translational RPE · 10 m", "unit": "m"}, {"id": "rotation_rpe", "label": "Rotational RPE · 10 m", "unit": "deg"}],
                "rpeSegmentLengthM": 10, "rpeNormalizedByDistance": False,
                "countDescription": "n is the finite contributing sequence count; sequenceCount is the report sequence universe. Neither is a count of successful runs or attempted executions.",
                "annotationDescription": "Each source asterisk denotes a run excluded for SR < 75%. Do not derive attempted or qualifying run counts by subtracting asterisks from expected slots."},
            "coverage": {"id": "sr-three-expected-runs", "unit": "%", "range": [0, 100],
                "definition": "SR = 100 × valid reference-path distance / full reference-path distance. Valid portions belong to the retained tracking segment with the longest valid duration; invalid gaps are excluded.",
                "selectionDescription": "All finite SR values, including values below 75% and true zeros, are retained. Missing or invalid run-level SR contributes an effective zero. Average exactly three expected slots per sequence, then equally weight all expected sequences within a dataset.",
                "expectedRunCount": 3, "validStatusDescription": "valid means a finite usable SR measurement, not a successful execution or an SR ≥ 75% result."}},
        "sources": [{"id": sid, "label": label, "revision": REVISION if sid != "sr" else None, "batch": BATCH,
            "files": [{"name": role + ".csv", "sha256": INPUTS[role][1]} for role in roles]}
            for sid, label, roles in [("ate", "Reviewed ATE aggregate and contribution ledgers", ["ate-aggregate", "ate-sequence"]),
                ("rpe10", "Reviewed 10 m RPE aggregate and sequence ledgers", ["rpe10-aggregate", "rpe10-sequence"]),
                ("sr", "Designated SR dataset, sequence and run export", ["sr-aggregate", "sr-sequence", "sr-run"])]],
        "accuracy": accuracy, "rpe10": rpe, "coverage": coverage, "validation": qa,
        "limitations": [
            "Trajectory source tables do not specify the execution platform or input variant. These fields are not inferred from resource-profiling data.",
            "The 18 unreported dataset/configuration combinations have no SR row; they are not failures or zero scores. Accuracy grids retain these combinations with explicit missing states.",
            "ATE contains 3,528 component grid slots including absent configuration rows; RPE contains 2,844 component records from actual source rows. These are different ledger shapes, not different attempted-run counts.",
            "ATE and RPE contributor sets differ. Compare each metric with its own n and missing states.",
            "SR sequence/group identifiers preserve their source spelling; they are not automatically joined to ATE/RPE sequence identifiers.",
            "The three upstream inputs needed to replay original SR extraction are unavailable in this export. All supplied CSV layers reconcile independently; run slots do not establish that missing executions were attempted.",
            "Per-run ATE/RPE errors and raw trajectories are not included in the reviewed export. The run view exposes SR only.",
            "Numerical position-error and one-second relative-translation drift thresholds are not specified by these exported tables; no threshold values are inferred.",
            "This export preserves reviewed values and full-precision source strings; numerical precision remains limited by the original source reports. It does not rerun the evaluator.",
        ],
    }


def validate(accuracy, rpe, coverage):
    for data, expected_rows in [(accuracy, 3528), (rpe, 2844)]:
        require(len(data["aggregates"]) == 180 and len(data["sequences"]) == expected_rows, "Unexpected accuracy ledger size")
        grouped = defaultdict(list)
        keys = set()
        for row in data["sequences"]:
            key = tuple(row[k] for k in ("configurationId", "datasetId", "metric", "group", "sequence"))
            require(key not in keys, "Duplicate accuracy sequence key")
            keys.add(key)
            require(row["included"] == (row["value"] is not None), "Finite/inclusion mismatch")
            if row["included"]:
                grouped[key[:3]].append(row)
        for row in data["aggregates"]:
            values = grouped[(row["configurationId"], row["datasetId"], row["metric"])]
            require((row["n"] == len(values) or (row["n"] is None and not values and row["missingStatus"] == "no_configuration_records"))
                    and len(values) == len(row["contributingSequences"]), "Contributor count mismatch")
            require(row["value"] is None if not values else close(row["value"], sum(r["value"] for r in values) / len(values)), "Reviewed mean does not match sequence ledger")
            supplied = set(row["contributingSequences"])
            derived = {r["group"] + "/" + r["sequence"] if data is accuracy else r["sequence"] for r in values}
            require(supplied == derived, "Contributing sequence identities differ")
        require(sum(r["value"] is not None for r in data["aggregates"]) == 140, "Expected 140 finite reviewed means")
    run_groups = defaultdict(list)
    keys = set()
    for row in coverage["runs"]:
        key = tuple(row[k] for k in ("configurationId", "datasetId", "group", "sequence", "run"))
        require(key not in keys, "Duplicate run key")
        keys.add(key)
        run_groups[key[:4]].append(row)
        require(row["status"] in ("valid", "missing", "invalid"), "Unknown SR status")
        require(row["value"] is not None and 0 <= row["value"] <= 100, "Invalid effective SR")
        require(row["value"] == row["rawValue"] if row["status"] == "valid" else row["value"] == 0, "SR effective-zero contract violated")
    sequence_groups = defaultdict(list)
    sequence_keys = set()
    for row in coverage["sequences"]:
        key = tuple(row[k] for k in ("configurationId", "datasetId", "group", "sequence"))
        require(key not in sequence_keys, "Duplicate SR sequence key")
        sequence_keys.add(key)
        runs = run_groups[key]
        require({r["run"] for r in runs} == {"run1", "run2", "run3"} and len(runs) == 3, "Expected exactly three run slots")
        require(close(row["value"], sum(r["value"] for r in runs) / 3), "SR sequence mean mismatch")
        for status in ("valid", "missing", "invalid"):
            require(row[status + "Runs"] == sum(r["status"] == status for r in runs), "SR status count mismatch")
        sequence_groups[key[:2]].append(row)
    require(set(run_groups) == sequence_keys, "Unrepresented run groups")
    aggregate_keys = set()
    for row in coverage["aggregates"]:
        key = (row["configurationId"], row["datasetId"])
        require(key not in aggregate_keys, "Duplicate SR aggregate key")
        aggregate_keys.add(key)
        seqs = sequence_groups[key]
        require(len(seqs) == row["sequenceCount"] and row["expectedRuns"] == 3 * len(seqs), "SR denominator mismatch")
        require(close(row["value"], sum(r["value"] for r in seqs) / len(seqs)), "SR dataset mean mismatch")
        for status in ("valid", "missing", "invalid"):
            require(row[status + "Runs"] == sum(r[status + "Runs"] for r in seqs), "SR aggregate count mismatch")
    require(aggregate_keys == set(sequence_groups), "Unrepresented SR sequences")
    require((len(coverage["aggregates"]), len(coverage["sequences"]), len(coverage["runs"])) == (72, 1422, 4266), "Unexpected SR source shape")
    return {"sourceHashesVerified": True, "aggregateAndSequenceMeansReconciled": True,
            "ateAggregateSlots": 180, "ateSequenceComponentSlots": 3528, "rpeAggregateSlots": 180,
            "rpeSequenceComponentRows": 2844, "srAggregateRows": 72, "srSequenceRows": 1422, "srExpectedRunSlots": 4266,
            "srRunStates": dict(Counter(r["status"] for r in coverage["runs"]))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "public/data/current-results.json")
    parser.add_argument("--verified-on", default="2026-10-09")
    args = parser.parse_args()
    document = export(args.source_root, args.verified_on)
    text = json.dumps(document, ensure_ascii=False, allow_nan=False, separators=(",", ":")) + "\n"
    require(not re.search(r"/Users/|/home/|https?://|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:api[_-]?key|access[_-]?token)\s*[:=]", text),
            "Private source context in public export")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(text)
    print(json.dumps(document["validation"], indent=2))


if __name__ == "__main__":
    main()
