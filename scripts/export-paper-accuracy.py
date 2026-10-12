#!/usr/bin/env python3
"""Export installed paper accuracy examples without evaluating trajectories.

Usage: python3 scripts/export-paper-accuracy.py --paper-root /path/to/paper
Changed installed objects or source hashes require a reviewed contract update.
This command writes only the new website ledger, never paper or result sources.
"""
import argparse
import csv
import hashlib
import json
import math
import re
from pathlib import Path

PAPER_REVISION = "8d6fa5bff03ef903c97cbbf6976cf9c1d9dfb96c"
TRAJECTORY_REVISION = "d11e47385afcf3745d17912654d3a22b4b8bb2ca"
BATCH = "20260909_030015"
# IDs are public, neutral locators. Private filesystem paths never enter JSON.
INPUTS = {
    "fig1-pdf": ("figures/accuracy_ate_rpe.pdf", "f9dad55eec4c59448bcc04bf28d56214b98f6d92c89b43f30213823b06327527"),
    "fig1-values": ("results/accuracy_joint/component_colors_20260910/plot_data.csv", "26468b2805353e7d9acc24a5d33fce1c9e00f940abf74f90eebd826b7d902338"),
    "mode-confirmation": ("results/fig1_accuracy/approved_horizontal_gtour_20260910/author_mode_confirmation.json", "a9f6ca8bf43db6e518bf5baffd2195157895f9f06c162a5ca0885258e10e7d45"),
    "fig2-pdf": ("figures/robustness_sr.pdf", "01cb4259128f07ae23264199daa1fd0fd3fc9ee1f4c0bcfc879c56767cb2d47c"),
    "fig2-values": ("results/robustness_sr/approved_horizontal_20260910/data/plot_data.csv", "ab8fae656ff9e57a7b1064533ae2dceb28802bd1792dbd9aa700ea58137f96af"),
    "sr-dataset-source": ("results/robustness_sr/coauthor_20260910/source/average_sr_by_dataset.csv", "2a850d02e34357bcc18c1ba843952d551a7edd6c87c2c31bbb5e249fb7afa6c9"),
    "sr-sequence-source": ("results/robustness_sr/coauthor_20260910/source/sr_by_sequence.csv", "148c26274508896eb7dacc6acd195491ccc3c66daab45883e67dabc8340f0998"),
    "fig4-pdf": ("figures/lessons_coverage.pdf", "b17803d5807949b1b5fb016116ea22d64be493b97c8e429ad176851b4b346e7d"),
    "fig4-values": ("results/lessons_accuracy/coverage_vertical_20260911/source/plot_data.csv", "4b4c4739651d2bd609efe09f12c56eb991afd54b2758331cf1f8a77727b0dd2b"),
    "fig4-pairs": ("results/lessons_accuracy/coverage_vertical_20260911/plot_pairs.csv", "c91af41334c76db8f633382f9969536f4f94968379d9f966b4baa41b334d962f"),
    "fig4-rendered-values": ("results/lessons_accuracy/coverage_vertical_20260911/rendered_values.csv", "baacb2f1489b26f5a7505eb0e7bffda9d7b8f3eb3785a91f27d781567c7956b0"),
    "table-iii-tex": ("tables/accuracy_components_example.tex", "3e78a01aea497097c3d8d11565158d8451dce395d7463d4442223e98f24cfdb1"),
    "table-iii-values": ("results/lessons_accuracy/components_20260911/table_data.csv", "db637ac5e234e9b70350d9bac8beb4df9b9e94b64aec88fe32de8a71a0312749"),
    "table-iv-tex": ("tables/ate_rpe_example.tex", "7fd410e2251009dc05e1e0d3446ae7ffd9dd9e51118985a1e26ce7ec01235e9c"),
    "table-iv-values": ("results/lessons_accuracy/ate_rpe_20260911/table_data.csv", "316c44f887dff5de02bf3e552e19f549416398693eb2b0b1721147d3fcfe93e0"),
}
DATASET_IDS = {"EuRoC": "euroc", "EuRoC MAV": "euroc", "UZH-FPV": "uzh-fpv", "AQUALOC": "aqualoc", "LaMAria": "lamaria", "GrandTour": "grandtour", "eurocmav": "euroc", "uzhfpv": "uzh-fpv", "aqualoc": "aqualoc", "lamaria": "lamaria", "grand_tour": "grandtour"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rows(path):
    with path.open(newline="") as stream:
        return list(csv.DictReader(stream))


def number(text):
    if text == "":
        return None
    value = float(text)
    return value if math.isfinite(value) else None


def integer(text):
    return int(text) if text != "" else None


def equal_number(a, b):
    return a == b or (a is not None and b is not None and math.isclose(a, b, rel_tol=1e-13, abs_tol=1e-13))


def source_ref(artifact, line):
    return {"artifactId": artifact, "row": integer(line) if str(line).isdigit() else None}


def selected_sequence(identifier):
    # Preserve the exact sequence identity shared by these installed sources.
    require(identifier in {"sequence_1_19", "sequence_1_20", "sequence_2_11", "sequence_2_12", "sequence_3_17", "sequence_3_18", "sequence_4_11"}, "Unreviewed Fig.4 sequence identity")
    return identifier


def table_numbers(text, starts):
    result = []
    for line in text.splitlines():
        if not any(line.startswith(prefix) for prefix in starts):
            continue
        tokens = [cell.strip() for cell in line.split("&")]
        values = []
        for cell in tokens[1:]:
            clean = re.sub(r"\\phantom\{[^{}]*\}", "", cell)
            match = re.search(r"(?<![A-Za-z])\d+(?:\.\d+)?", clean)
            if match:
                values.append(match[0])
        result.append(values)
    return result


def export(paper, website):
    for artifact, (relative, expected) in INPUTS.items():
        require(sha(paper / relative) == expected, "Reviewed paper-source hash mismatch: " + artifact)
    authority = json.loads((paper / INPUTS["mode-confirmation"][0]).read_text())
    require(authority["results_batch"] == BATCH and authority["confirmed_modes"] == {"ROVIO": "mono", "DM-VIO": "mono", "AirSLAM": "stereo"}, "Unreviewed mode assignments")
    current = json.loads((website / "public/data/current-results.json").read_text())
    tables = json.loads((website / "public/data/current-source-tables.json").read_text())
    require(current["release"]["sourceRevision"] == tables["source"]["revision"] == TRAJECTORY_REVISION, "Website and paper trajectory sources differ")
    require(current["release"]["batch"] == BATCH, "Mixed trajectory batches")
    configurations = {item["id"]: item for item in current["configurations"]}
    lookup = {(item["system"], item["mode"]): item["id"] for item in configurations.values()}
    means = {(item["configurationId"], item["datasetId"], item["metric"]): item for data in (current["accuracy"], current["rpe10"]) for item in data["aggregates"]}
    coverage = {(item["configurationId"], item["datasetId"]): item for item in current["coverage"]["aggregates"]}
    coverage_sequences = {(item["configurationId"], item["datasetId"], item["sequence"]): item for item in current["coverage"]["sequences"]}
    source_cells = {}
    for table in tables["tables"]:
        for row in table["rows"]:
            for column, raw in zip(table["columns"], row["cells"]):
                source_cells[(table["datasetId"], table["group"], table["metricFamily"], table["rpeLengthM"], row["method"], column)] = raw

    fig1 = []
    for index, row in enumerate(rows(paper / INPUTS["fig1-values"][0]), 2):
        cid = lookup.get((row["system"], row["mode"]))
        dataset = DATASET_IDS[row["dataset"]]
        require(row["results_batch"] == BATCH and row["results_commit"] == TRAJECTORY_REVISION and row["protocol"] == "epa-drift valid", "Mixed Fig.1 source")
        if cid is not None:
            supplied = means[(cid, dataset, row["metric"])]
            require(supplied["valueText"] == row["value"] and supplied["n"] == integer(row["n"]) and supplied["sequenceCount"] == int(row["N_report"]) and supplied["missingStatus"] == row["missing_status"], "Fig.1 and website mean differ")
        else:
            require(row["display_state"] == "no_record" and row["value"] == "", "Unreviewed configured Fig.1 cell")
        fig1.append({"configurationId": cid, "system": row["system"], "mode": row["mode"], "sourceMode": row["source_mode"], "datasetId": dataset,
            "panel": row["panel"], "metric": row["metric"], "unit": row["unit"], "value": number(row["value"]), "valueText": row["value"], "displayValue": row["main_label"],
            "n": integer(row["n"]), "sequenceCount": integer(row["N_report"]), "noncontributingSequences": integer(row["f_noncontributing"]),
            "displayState": row["display_state"], "missingStatus": row["missing_status"], "protocol": row["protocol"], "segmentLengthM": integer(row["segment_length_m"]),
            "statisticalUnit": "dataset mean of finite sequence RMSEs", "inputVariant": row["input_variant"], "platform": row["platform"], "source": source_ref("fig1-values", str(index))})
    require(len(fig1) == 352, "Expected all installed Fig.1 grid slots")

    fig2 = []
    for index, row in enumerate(rows(paper / INPUTS["fig2-values"][0]), 2):
        cid, dataset = row["method"], DATASET_IDS[row["dataset"]]
        supplied = coverage[(cid, dataset)]
        require(supplied["valueText"] == row["mean_SR"] and supplied["sequenceCount"] == int(row["N"]), "Fig.2 and designated SR source differ")
        for field, source_field in (("expectedRuns", "expected_runs"), ("validRuns", "valid_runs"), ("missingRuns", "missing_runs"), ("invalidRuns", "invalid_runs")):
            require(supplied[field] == int(row[source_field]), "Fig.2 SR counts differ")
        fig2.append({"configurationId": cid, "system": configurations[cid]["system"], "mode": row["mode"], "datasetId": dataset, "metric": "SR", "unit": "%",
            "value": number(row["mean_SR"]), "valueText": row["mean_SR"], "displayValue": row["label"], "sequenceCount": int(row["N"]),
            "expectedRunCount": int(row["expected_runs"]), "validRuns": int(row["valid_runs"]), "missingRuns": int(row["missing_runs"]), "invalidRuns": int(row["invalid_runs"]),
            "missingStatus": row["aggregate_state"], "protocol": "sr-three-expected-runs", "statisticalUnit": "dataset mean of three-slot sequence SR means",
            "inputVariant": row["input_variant"], "platform": row["platform"], "source": source_ref("fig2-values", str(index)), "valueSource": source_ref("sr-dataset-source", row["source_row"])})
    require(len(fig2) == 72, "Expected every installed Fig.2 SR mean")

    pairs = rows(paper / INPUTS["fig4-pairs"][0])
    rendered = {(row["system"], row["sequence"]): row for row in rows(paper / INPUTS["fig4-rendered-values"][0])}
    pair_keys = {(row["system"], row["sequence"]) for row in pairs}
    require(len(pairs) == len(pair_keys) == len(rendered) == 14 and set(rendered) == pair_keys, "Installed Fig.4 pair identity differs")
    for row in pairs:
        displayed = rendered[(row["system"], row["sequence"])]
        require(equal_number(float(row["position_ATE_m"]), float(displayed["position_ATE_m"])) and row["SR_percent"] == displayed["SR_percent"], "Fig.4 rendered values differ from plotting pairs")
    fig4 = []
    for index, row in enumerate(rows(paper / INPUTS["fig4-values"][0]), 2):
        key = (row["system"], row["sequence"])
        if key not in pair_keys:
            continue
        require(row["plotted"] == "True", "Fig.4 source selection differs")
        cid, dataset = row["system"], DATASET_IDS[row["dataset"]]
        sequence = selected_sequence(row["sequence"])
        metric = "position_ate" if row["metric"] == "position_ATE" else "SR"
        require(metric in ("position_ate", "SR"), "Unexpected Fig.4 metric")
        if metric == "position_ate":
            raw = source_cells[(dataset, row["group"], "ATE", None, cid, row["sequence"])]
            require(raw == row["raw_token"], "Fig.4 ATE differs from complete trajectory source")
            require(float(row["value"]) == float(next(item["position_ATE_m"] for item in pairs if (item["system"], item["sequence"]) == key)), "Fig.4 ATE value differs")
        else:
            supplied = coverage_sequences[(cid, dataset, sequence)]
            require(row["value"] == supplied["valueText"], "Fig.4 SR differs from designated sequence source")
        fig4.append({"configurationId": cid, "system": configurations[cid]["system"], "mode": row["mode"], "datasetId": dataset, "group": row["group"],
            "sequence": sequence, "displaySequence": sequence.removeprefix("sequence_"), "metric": metric, "unit": row["unit"], "value": number(row["value"]), "valueText": row["value"], "displayValue": row["display_value"],
            "raw": row["raw_token"], "sourceN": integer(row["n"]), "sourceNTotal": integer(row["N"]), "excludedRunCount": integer(row["excluded_runs"]),
            "missingStatus": row["missing_status"], "protocol": "epa-drift valid" if metric == "position_ate" else "sr-three-expected-runs", "statisticalUnit": row["statistic"],
            "source": source_ref("fig4-values", str(index))})
    require(len(fig4) == 28 and len({(row["configurationId"], row["sequence"], row["metric"]) for row in fig4}) == 28, "Expected all 28 installed Fig.4 values")

    table_iii = []
    for index, row in enumerate(rows(paper / INPUTS["table-iii-values"][0]), 2):
        cid, dataset = lookup[(row["system"], row["mode"])], DATASET_IDS[row["dataset"]]
        metric = {"position": "position_ate", "orientation": "orientation_ate", "translation": "translation_rpe", "rotation": "rotation_rpe"}[row["component"]]
        if row["metric"] == "ATE":
            require(means[(cid, dataset, metric)]["valueText"] == row["value"], "Table III ATE differs from Fig.1")
        else:
            raw = source_cells[(dataset, row["group"], "RPE", 10, cid, "Average")]
            pair = re.search(r"([-+]?\d+(?:\.\d+)?)\s*/\s*([-+]?\d+(?:\.\d+)?)", raw)
            require(pair and equal_number(float(pair[1 if row["component"] == "rotation" else 2]), float(row["value"])), "Table III group mean differs from source")
        table_iii.append({"configurationId": cid, "system": row["system"], "mode": row["mode"], "datasetId": dataset, "group": row["group"], "metric": metric, "unit": row["unit"],
            "value": number(row["value"]), "valueText": row["value"], "displayValue": row["display_value"], "n": int(row["n"]), "sequenceCount": int(row["N"]), "segmentLengthM": integer(row["segment_length_m"]),
            "protocol": row["protocol"], "missingStatus": row["missing_status"], "statisticalUnit": "dataset mean" if row["group"] == "All sequences" else "reported group mean",
            "source": source_ref("table-iii-values", str(index))})
    installed_iii = table_numbers((paper / INPUTS["table-iii-tex"][0]).read_text(), ("OpenVINS &", "OKVIS2-X &"))
    require(installed_iii == [[r["displayValue"] for r in table_iii[:4]], [r["displayValue"] for r in table_iii[4:]]], "Table III displayed numbers differ from installed table")
    require(len(table_iii) == 8, "Expected eight Table III numeric cells")

    table_iv = []
    for index, row in enumerate(rows(paper / INPUTS["table-iv-values"][0]), 2):
        cid, dataset = row["configuration_key"], DATASET_IDS[row["dataset"]]
        metric = "position_ate" if row["metric"] == "ATE" else "translation_rpe"
        length = integer(row["rpe_length_m"])
        require(source_cells[(dataset, row["group"], row["metric"], length, cid, "Average")] == row["raw_token"], "Table IV differs from complete source")
        table_iv.append({"configurationId": cid, "system": configurations[cid]["system"], "mode": row["mode"], "datasetId": dataset, "group": row["group"], "metric": metric, "unit": row["unit"],
            "value": number(row["value"]), "valueText": row["value"], "displayValue": row["display_value"], "raw": row["raw_token"], "n": int(row["n"]), "sequenceCount": int(row["N"]),
            "segmentLengthM": length, "protocol": row["protocol"], "missingStatus": row["missing_status"], "statisticalUnit": "reported group mean", "source": source_ref("table-iv-values", str(index))})
    installed_iv = table_numbers((paper / INPUTS["table-iv-tex"][0]).read_text(), ("Kimera-VIO &", "VINS-Fusion &"))
    require(installed_iv == [[table_iv[i]["displayValue"] for i in (0, 1, 4, 5)], [table_iv[i]["displayValue"] for i in (2, 3, 6, 7)]], "Table IV displayed numbers differ from installed table")
    require(len(table_iv) == 8, "Expected eight Table IV numeric cells")
    return {
        "schemaVersion": 1,
        "source": {"paperRevision": PAPER_REVISION, "trajectoryRevision": TRAJECTORY_REVISION, "batch": BATCH, "srAuthority": "designated-three-expected-run-export",
            "artifacts": [{"id": artifact, "fileId": artifact + (".pdf" if relative.endswith(".pdf") else ".tex" if relative.endswith(".tex") else ".json" if relative.endswith(".json") else ".csv"), "sha256": digest} for artifact, (relative, digest) in INPUTS.items()]},
        "objects": {
            "figure1": {"paperLabel": "Fig. 1", "records": fig1},
            "figure2": {"paperLabel": "Fig. 2", "records": fig2},
            "figure4": {"paperLabel": "Fig. 4", "records": fig4, "omittedSequence": "4_10", "selection": "Seven sequences displayed in the installed figure; complete source sequence results remain in the trajectory and SR browsers."},
            "tableIII": {"paperLabel": "Table III", "records": table_iii},
            "tableIV": {"paperLabel": "Table IV", "records": table_iv}},
        "counts": {"figure1GridSlots": 352, "figure2SRMeans": 72, "figure4Values": 28, "figure4ConfigurationSequencePairs": 14, "tableIIICells": 8, "tableIVCells": 8},
        "notes": [
            "Installed paper data are exported without re-evaluating, replacing, or recomputing source statistics. All inputs are checked against frozen SHA256 safeguards.",
            "Table III combines dataset-level EuRoC ATE means with reported LaMAria Medium group RPE means. Table IV contains reported group ATE and 10 m RPE means. These statistical levels remain separate.",
            "Fig. 4 ATE is a reported sequence RMSE; SR is the mean of exactly three expected run slots, with missing or invalid SR assigned an effective zero. ATE eligibility requires run SR at least 75%.",
            "Fig. 4 sourceN/sourceNTotal are original plotting-ledger fields for one sequence value, not eligible-run counts. ExcludedRunCount retains the separate ATE source annotation.",
            "n and sequenceCount in Tables III/IV and Fig.1 describe finite contributing sequences, not successful or attempted runs. Fig.2 validRuns means finite SR records, not successful executions.",
            "Display strings retain the installed paper rounding. Exact value strings, source annotations, missing states and source artifact locators remain in this ledger.",
            "ATE/RPE use drift-valid sources only. No epa-all values or old report SR tables are exported."]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--paper-root", required=True, type=Path)
    parser.add_argument("--website-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    output = args.output or args.website_root / "public/data/current-paper-accuracy.json"
    document = export(args.paper_root, args.website_root)
    text = json.dumps(document, ensure_ascii=False, allow_nan=False, separators=(",", ":")) + "\n"
    require(not re.search(r"/Users/|/home/|https?://|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text), "Private context in public export")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text)
    print(json.dumps(document["counts"], indent=2))


if __name__ == "__main__":
    main()
