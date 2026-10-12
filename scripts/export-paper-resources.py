#!/usr/bin/env python3
"""Transcribe the installed Table II and frozen Fig. 3 data, without profiling.

Python 3 standard library only. Run:
  python3 scripts/export-paper-resources.py --paper-root /path/to/paper
  python3 scripts/export-paper-resources.py --paper-root /path/to/paper --check

Inputs are hash-locked to the reviewed paper and resource release. A changed
input requires a newly reviewed source contract; it is never selected silently.
Only current-paper-resources.json is written. No plots or statistics are rerun.
"""

import argparse
import csv
from decimal import Decimal, ROUND_HALF_EVEN
import hashlib
import io
import json
from pathlib import Path
import re

PAPER_REVISION = "8d6fa5bff03ef903c97cbbf6976cf9c1d9dfb96c"
RESOURCE_REVISION = "29a1fa93804899fac8bf17799b5bd101ae02d9a4"
OLDER_FIGURE_REVISION = "d4790e471f5526f0e6d69607fba977bbea889544"
ARCHIVE_RECORDED_SHA = "20e547b78fc841921e0c08491ca6e2d9dc26916aa6f1646919663c8007f4b13b"
ROOT = Path(__file__).resolve().parents[1]
FULL_RESOURCE_FILE = ROOT / "public/data/current-efficiency.json"
FULL_RESOURCE_SHA = "e49b7c153254becb16294abcfa5570c9b6cb3335bce6563c9c528ac0c09c4c17"
R02_PACKAGE = "results/efficiency_r02/final_20260911"
FIGURE_PACKAGE = "results/efficiency_desktop_overview/polish_20260913"
INPUTS = {
    "paper/table-ii.tex": ("tables/r02_efficiency.tex", "5c4a8af00e9a8f205660745b412617c4ba457efe1fe41d72ee454159cfa4722f"),
    "table-ii/frozen-cell-ledger.csv": (R02_PACKAGE + "/data/table_data.csv", "ab8d06fb74b2248c7e4520770064c3b45e03b21de72f6368ecccb30ea42ba8c9"),
    "table-ii/archive-aggregates.csv": (R02_PACKAGE + "/evidence/r02_aggregates.csv", "bd3bd22e5861bec3e8bb1c14988cb00295d998b74e4773360f66cc43a6b90172"),
    "paper/figure-3.pdf": ("figures/efficiency_desktop_overview.pdf", "ab30aff4b2fe07ed71d1582e508d875bd6041f125c3bb6071234507b97c502bc"),
    "paper/figure-3.svg": ("figures/efficiency_desktop_overview.svg", "bb266e0ba4bfbf06c10a1c7f3efcb23a46b4a2f3aa48e5673cd1803b447fa730"),
    "figure-3/plot-data.csv": (FIGURE_PACKAGE + "/data/plot_data.csv", "bcadf24680239964b6e08f0db0b10304e23431f59089873baf7d71de7de3790a"),
    "figure-3/manifest.json": (FIGURE_PACKAGE + "/manifest.json", "655ea40b141037263228842ec70d11bca7a4ae784d92e50a5441792cd7596d77"),
    "figure-3/updated-resource-pc.tex": (FIGURE_PACKAGE + "/evidence/resource_pc.tex", "a2c1c41c613ecf013f71e5174d8b91c5a9504c73a4cc53ba40176ba996e4993a"),
}
SYSTEMS = ["sqrtVINS", "ROVIO", "OpenVINS", "ORB-SLAM3", "Kimera-VIO", "OKVIS2-X", "SVO Pro", "VINS-Fusion"]
FIELDS = ["desktop_time_ms", "orin_time_ratio", "nano_time_ratio", "desktop_cpu_percent", "orin_cpu_percent", "nano_cpu_percent"]
PLATFORMS = {"desktop": "Desktop", "orin": "Jetson Orin", "nano": "Jetson Nano"}
UPDATED_SVO = {"desktop_time_ms", "orin_time_ratio", "desktop_cpu_percent", "orin_cpu_percent"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def number(text):
    return float(text) if text else None


def count(text):
    return int(text) if text else None


def same_number(left, right):
    return Decimal(str(left)) == Decimal(str(right))


def rounded_two(text):
    return format(Decimal(text).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN), ".2f")


def read_inputs(paper_root):
    blobs, artifacts = {}, []
    for artifact_id, (relative, expected) in INPUTS.items():
        blob = (paper_root / relative).read_bytes()
        require(hashlib.sha256(blob).hexdigest() == expected, "Reviewed input hash mismatch: " + artifact_id)
        blobs[artifact_id] = blob
        artifacts.append({"id": artifact_id, "file": relative, "sha256": expected, "bytes": len(blob)})
    full_blob = FULL_RESOURCE_FILE.read_bytes()
    require(hashlib.sha256(full_blob).hexdigest() == FULL_RESOURCE_SHA, "Reviewed full-resource JSON hash mismatch")
    artifacts.append({"id": "resources/full-source-export.json", "file": "public/data/current-efficiency.json", "sha256": FULL_RESOURCE_SHA, "bytes": len(full_blob)})
    return blobs, artifacts, json.loads(full_blob)


def parse_csv(blob):
    return list(csv.DictReader(io.StringIO(blob.decode("utf-8-sig"))))


def installed_table(blob):
    rows = []
    for line_number, line in enumerate(blob.decode().splitlines(), 1):
        if "&" not in line:
            continue
        parts = [part.strip() for part in line.rstrip().removesuffix("\\\\").split("&")]
        system = "sqrtVINS" if parts[0] == "$\\sqrt{\\mathrm{VINS}}$" else parts[0]
        if system not in SYSTEMS:
            continue
        require(len(parts) == 7, "Table II has unexpected columns")
        values = [None if "textemdash" in token else token for token in parts[1:]]
        require(all(value is None or re.fullmatch(r"\d+\.\d{2}", value) for value in values), "Unexpected Table II display token")
        rows.append({"system": system, "line": line_number, "displayValues": values, "rawTokens": parts[1:]})
    require([row["system"] for row in rows] == SYSTEMS, "Installed Table II row order changed")
    return rows


def resource_row(rows, system, sequence, platform, mode="mono"):
    matches = [row for row in rows if row["system"] == system and row["sequence"] == sequence and row["platform"] == platform and row["mode"] == mode]
    require(len(matches) <= 1, "Ambiguous current resource identity")
    return matches[0] if matches else None


def numeric_comparison(cell, full_row, desktop_row):
    if full_row is None:
        require(cell["value"] is None, "Paper value lacks a current source row")
        return {"status": "source_record_absent", "recordId": None, "sameRunSetVerified": False}
    ratio = cell["metric"].endswith("_time_ratio")
    key = "nativeTotalMs" if ratio or cell["metric"] == "desktop_time_ms" else "reportedCpuPercent"
    source_text = full_row["sourceValues"][key]["valueText"]
    result = {"recordId": full_row["sourceRecordId"], "sourceRevision": full_row["sourceRevision"], "inputVariant": full_row["inputVariant"], "sourceValueText": source_text, "sameRunSetVerified": False, "status": "numeric_agreement"}
    if ratio:
        denominator_text = desktop_row["sourceValues"]["nativeTotalMs"]["valueText"]
        rounded_source_ratio = Decimal(source_text) / Decimal(denominator_text)
        result.update({"desktopRecordId": desktop_row["sourceRecordId"], "desktopSourceValueText": denominator_text, "ratioFromRoundedSourceMeans": str(rounded_source_ratio), "ratioFromRoundedSourceMeansDisplay": rounded_two(str(rounded_source_ratio)), "displayMatchesRatioFromRoundedSourceMeans": rounded_two(str(rounded_source_ratio)) == cell["displayValue"]})
        if cell["numeratorText"] and cell["denominatorText"]:
            require(rounded_two(cell["numeratorText"]) == source_text and rounded_two(cell["denominatorText"]) == denominator_text, "Approved ratio components do not round to the current report")
            result["approvedComponentsRoundToCurrentReport"] = True
        else:
            require(result["displayMatchesRatioFromRoundedSourceMeans"], "Retained ratio does not match current rounded source")
    else:
        require(rounded_two(cell["valueText"]) == source_text, "Paper measurement differs from current report")
    return result


def table_ledger(blobs, full):
    frozen = {(row["system"], row["metric"]): (line, row) for line, row in enumerate(parse_csv(blobs["table-ii/frozen-cell-ledger.csv"]), 2)}
    aggregates = {(row["system"], row["platform"]): row for row in parse_csv(blobs["table-ii/archive-aggregates.csv"])}
    require(len(frozen) == 48, "Expected 48 frozen Table II cell records")
    require(all(row["archive_sha256"] == ARCHIVE_RECORDED_SHA for _, row in frozen.values()), "Recorded archive checksum changed")
    rows, changed = [], []
    for installed in installed_table(blobs["paper/table-ii.tex"]):
        system, cells = installed["system"], {}
        desktop = resource_row(full["rows"], system, "R_02_easy", "Desktop")
        require(desktop is not None, "Table II system lacks a Desktop source row")
        for index, metric in enumerate(FIELDS):
            line, old = frozen[(system, metric)]
            display = installed["displayValues"][index]
            platform = PLATFORMS[old["platform"]]
            current = resource_row(full["rows"], system, "R_02_easy", platform)
            updated = system == "SVO Pro" and metric in UPDATED_SVO
            require(updated or (display or "") == old["displayed_value"], "Unapproved installed Table II change")
            require(not updated or (display or "") != old["displayed_value"], "Expected SVO replacement no longer differs")
            cell = {"metric": metric, "platform": platform, "displayValue": display or "—", "installedToken": installed["rawTokens"][index], "installedArtifactId": "paper/table-ii.tex", "installedLine": installed["line"], "unit": "×" if metric.endswith("_time_ratio") else "%" if "cpu" in metric else "ms"}
            if updated:
                changed.append(system + "/" + metric)
                require(current is not None, "Updated SVO cell lacks current source row")
                ratio = metric.endswith("_time_ratio")
                source_key = "nativeTotalMs" if ratio or metric == "desktop_time_ms" else "reportedCpuPercent"
                source_text = current["sourceValues"][source_key]["valueText"]
                cell.update({"value": number(display), "valueText": display, "sourceId": "resources/full-source-export.json", "sourceRevision": RESOURCE_REVISION, "sourceRecordId": current["sourceRecordId"], "sourceEvidence": current["sourceEvidence"], "sourceInputVariant": current["inputVariant"], "selectedRuns": current["sourceSelectedRuns"], "contributingRuns": None, "denominatorContributingRuns": None, "status": "reported_component_sum_ratio" if ratio else "reported_component_sum" if source_key == "nativeTotalMs" else "reported", "provenance": "updated_installed_cell_from_current_resource_source", "numeratorText": source_text if ratio else None, "denominatorText": desktop["sourceValues"]["nativeTotalMs"]["valueText"] if ratio else None, "ratioBasis": "source-reported rounded frontend-plus-backend means" if ratio else None, "ratioUsesUnroundedMeans": False if ratio else None, "archiveRecordedSha256": None, "cpuTailTrimSeconds": None})
                if ratio:
                    require(rounded_two(str(Decimal(cell["numeratorText"]) / Decimal(cell["denominatorText"]))) == display, "Updated SVO ratio differs from installed display")
                else:
                    require(display == source_text, "Updated SVO direct cell differs from current report")
            else:
                legacy = old["source"] == "previous_table.tex"
                ratio = metric.endswith("_time_ratio")
                cell.update({"value": number(old["value"]), "valueText": old["value"] or None, "sourceId": "table-ii/frozen-cell-ledger.csv", "sourceLine": line, "sourceRevision": None, "sourceRecordId": None, "sourceInputVariant": old["input_variant"], "selectedRuns": count(old["selected_runs"]), "contributingRuns": None if legacy else count(old["contributing_runs"]), "denominatorContributingRuns": None if legacy else count(old["denominator_contributing_runs"]), "recordedDenominatorContributingRuns": count(old["denominator_contributing_runs"]), "status": old["missing_status"], "provenance": "retained_previous_report_timing" if legacy else "approved_archive_cell", "numeratorText": old["numerator"] or None if ratio else None, "denominatorText": old["denominator"] or None if ratio else None, "ratioBasis": "retained previous-report ratio; unrounded components unavailable" if legacy and ratio else "approved unrounded per-run-summary means" if ratio and display else None, "ratioUsesUnroundedMeans": bool(old["numerator"] and old["denominator"]) if ratio else None, "archiveRecordedSha256": old["archive_sha256"] or None, "cpuTailTrimSeconds": number(old["cpu_tail_trim_s"])})
                if not legacy and display:
                    aggregate = aggregates[(system, old["platform"])]
                    aggregate_key = "native_total_ms" if ratio or metric == "desktop_time_ms" else "cpu_report_policy_mean_pct"
                    aggregate_value = old["numerator"] if ratio else old["value"]
                    require(same_number(aggregate[aggregate_key], aggregate_value), "Frozen cell and archive aggregate differ")
                    contributor_key = "native_total_contributing_runs" if ratio or metric == "desktop_time_ms" else "cpu_contributing_runs"
                    require(count(aggregate[contributor_key]) == cell["contributingRuns"], "Archived contributor count differs")
                    if ratio:
                        require(same_number(Decimal(old["numerator"]) / Decimal(old["denominator"]), old["value"]) or abs(float(Decimal(old["numerator"]) / Decimal(old["denominator"])) - float(old["value"])) < 1e-12, "Approved ratio components differ")
                if display:
                    require(rounded_two(old["value"]) == display, "Frozen precision does not produce installed display")
            cell["fullResourceComparison"] = numeric_comparison(cell, current, desktop)
            cells[metric] = cell
        rows.append({"systemId": desktop["systemId"], "system": "√VINS" if system == "sqrtVINS" else system, "sourceSystem": system, "mode": "mono", "cells": cells})
    require(len(changed) == 4, "Expected exactly four updated SVO cells")
    finite = sum(cell["value"] is not None for row in rows for cell in row["cells"].values())
    require(finite == 44, "Expected 44 finite Table II cells")
    return {"title": "Monocular native time and CPU on LaMAria R_02_easy", "installedArtifactId": "paper/table-ii.tex", "input": {"dataset": "LaMAria", "sequence": "R_02_easy", "mode": "mono", "inputVariant": "not stated in installed table; retained separately by cell source"}, "columns": FIELDS, "rows": rows, "summary": {"rows": 8, "cells": 48, "finiteCells": 44, "missingCells": 4, "updatedSvoCells": changed}, "notes": [
        "Displays transcribe the installed paper table. Archived means and their precision are retained when the installed cell still matches its approved ledger.",
        "Orin/Desktop and Nano/Desktop ratios use approved unrounded means where available. Computing ratios from the two-decimal resource report changes four rounded displays: √VINS/Orin, ROVIO/Orin, OpenVINS/Nano and VINS-Fusion/Nano.",
        "For archived cells, available metrics have five contributing runs except native timing for ORB-SLAM3/Orin and OKVIS2-X/Nano, which has four. Their CPU summaries have five. Selected-run counts and metric-contributing counts are different quantities.",
        "The four updated SVO cells use the current resource source: Desktop time and CPU, Orin ratio and CPU. SVO time is the reported frontend-plus-backend sum; its ratio uses rounded reported means. Each source row lists five selected runs, but per-metric contributing counts are not supplied.",
        "Kimera-VIO's three timing cells retain previous-report values; their unrounded timing basis and metric-contributing counts are unavailable. Its CPU cells have archived five-run evidence.",
        "A dash means the selected condition is absent in the table source, not zero time or CPU and not an execution-failure label.",
        "The archived cell ledger labels the input standard; current resource rows leave this input variant unspecified. Numerical agreement does not establish identical input variants or selected executions.",
        "The archive checksum is recorded in the frozen evidence ledger; the original archive file is not re-verified by this export. Native time is implementation-specific, not unified end-to-end latency. CPU percentages retain their reported accounting."
    ]}


def figure_ledger(blobs, full):
    rows = parse_csv(blobs["figure-3/plot-data.csv"])
    require(len(rows) == 39, "Expected 39 actual Fig. 3 points")
    points, revision_counts = [], {}
    for row in rows:
        current = resource_row(full["rows"], row["system"], row["profiling_sequence"], row["platform"], row["mode"])
        require(current is not None and current["inputVariant"] == row["input_variant"], "Fig. 3 identity differs from current export")
        require(row["selected_run_count"] == "5" and not row["contributing_runs"], "Fig. 3 contributor status changed")
        require(row["source_commit"] in [OLDER_FIGURE_REVISION, RESOURCE_REVISION], "Unexpected Fig. 3 revision")
        revision_counts[row["source_commit"]] = revision_counts.get(row["source_commit"], 0) + 1
        values = {}
        for metric, field in [("nativeTotalMs", "total_timing_ms"), ("reportedCpuPercent", "cpu_utilization"), ("reportedProcessMemoryMiB", "process_memory_mib")]:
            require(same_number(row[field], current["sourceValues"][metric]["valueText"]), "Fig. 3 value differs from current resource report")
            values[metric] = {"value": number(row[field]), "valueText": row[field], "status": row["missing_status"] if metric == "nativeTotalMs" else "reported", "numericAgreementWithFullResource": True}
        source_line = int(row["source_line"])
        if row["source_commit"] == RESOURCE_REVISION:
            require(row["system"] == "SVO Pro", "Unexpected current-revision Fig. 3 point")
            require(current["sourceEvidence"]["line"] == source_line, "Updated SVO source line differs")
        points.append({"pointId": row["point_id"], "system": "√VINS" if row["system"] == "sqrtVINS" else row["system"], "sourceSystem": row["system"], "systemId": current["systemId"], "mode": row["mode"], "platform": row["platform"], "dataset": row["dataset"], "sequence": row["profiling_sequence"], "inputVariant": row["input_variant"], "selectedRuns": int(row["selected_run_count"]), "contributingRuns": None, "contributingRunStatus": row["contributing_run_count_status"], "values": values, "timingDefinition": row["timing_definition"], "reportedFrontendMeanText": row["frontend_mean_ms"] or None, "reportedBackendMeanText": row["backend_mean_ms"] or None, "source": {"revision": row["source_commit"], "file": row["source_file"], "line": source_line, "page": row["source_page"] or None, "table": row["source_table"], "recordId": row["source_record_id"], "plotDataArtifactId": "figure-3/plot-data.csv", "sourceArtifactId": "figure-3/updated-resource-pc.tex" if row["source_commit"] == RESOURCE_REVISION else None}, "figureEncoding": {"label": row["figure_label"], "cpuColorHex": row["cpu_color_hex"], "circleAreaPt2Text": row["circle_area_pt2"], "markerDiameterPtText": row["marker_diameter_pt"], "svgXPtText": row["svg_x_pt"], "svgYPtText": row["svg_y_pt"]}, "fullResourceComparison": {"recordId": current["sourceRecordId"], "sourceRevision": current["sourceRevision"], "numericAgreement": True, "sameRunSetVerified": False, "sameSourceFileBytesVerified": row["source_commit"] == RESOURCE_REVISION}})
    require(revision_counts == {OLDER_FIGURE_REVISION: 34, RESOURCE_REVISION: 5}, "Expected 34 older-source and five updated Fig. 3 points")
    require(len({point["pointId"] for point in points}) == 39, "Duplicate Fig. 3 point ID")
    return {"title": "Desktop resources on five fixed profiling inputs", "installedPdfArtifactId": "paper/figure-3.pdf", "installedSvgArtifactId": "paper/figure-3.svg", "plotDataArtifactId": "figure-3/plot-data.csv", "points": points, "summary": {"points": 39, "values": 117, "numericAgreementCount": 117, "sourceRevisionPointCounts": revision_counts, "selectedRunsPerPoint": 5, "perMetricContributingRuns": None}, "notes": [
        "These records are the actual frozen plotting input for installed Fig. 3: 39 points and 117 reported resource means, not a newly selected full-source subset.",
        "All 117 values numerically agree with the current full-resource rows. Thirty-four points retain the older source revision; five SVO points use the current revision and byte-identical saved Desktop source evidence. Matching values do not establish matched run sets for either group.",
        "Each plotting row lists five selected source-row runs; per-metric contributors and total attempts are unavailable. GrandTour uses standard input, while the other input variants remain unspecified.",
        "SVO totals are the source-reported frontend-plus-backend means. Native timing is not unified end-to-end latency; process memory is not relabeled RSS and GPU resources are not represented by these points."
    ]}


def export(paper_root):
    blobs, artifacts, full = read_inputs(paper_root)
    require(full["release"]["sourceRevision"] == RESOURCE_REVISION, "Full-resource revision changed")
    require(len(full["rows"]) == 166 and full["summary"]["sourceStatisticSlots"] == 2909, "Full-resource scope changed")
    data = {"schemaVersion": 1, "release": {"title": "Installed paper resource figure and table", "paperRevision": PAPER_REVISION, "fullResourceRevision": RESOURCE_REVISION, "verifiedOn": "2026-10-12", "benchmarkRerun": False, "plotRerender": False, "authority": "Installed paper cells and frozen figure plotting records; source-specific precision and run counts remain separate."}, "artifacts": artifacts, "tableII": table_ledger(blobs, full), "figure3": figure_ledger(blobs, full), "fullResourceScope": {"sourceRows": 166, "sourcePresentStatisticSlots": 2909, "omittedCombinations": 7, "omittedCombinationIdentitiesAvailable": False, "note": "Seven combinations omitted by the full source are described without their identities or measurements. This ledger does not fabricate corresponding rows or classify them as failed."}}
    rendered = json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    require(not re.search(r"/Users/|/home/|https?://|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", rendered), "Private path, URL or email in public ledger")
    return rendered.encode("utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--paper-root", required=True, type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "public/data/current-paper-resources.json")
    parser.add_argument("--check", action="store_true", help="Verify deterministic output without writing")
    args = parser.parse_args()
    payload = export(args.paper_root)
    if args.check:
        require(args.output.read_bytes() == payload, "Installed paper resource ledger is stale")
        print("Checked: Table II 48 cells (44 finite); Fig. 3 39 points / 117 values; locked sources and deterministic export.")
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_bytes(payload)
        print("Exported: Table II 48 cells (44 finite); Fig. 3 39 points / 117 values. Full-resource JSON unchanged.")


if __name__ == "__main__":
    main()
