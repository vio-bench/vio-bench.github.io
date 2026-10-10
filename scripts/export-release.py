#!/usr/bin/env python3
"""Build a deterministic public manifest and ZIP from the retained table exports.

Run node scripts/export-csv.mjs before this script after regenerating source JSON.
All ZIP members come from this explicit allowlist; no source package is copied.
"""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

FILES = ["current-results.json", "current-source-tables.json", "current-efficiency.json",
         "current-source-cells.csv", "current-sr-datasets.csv", "current-sr-sequences.csv",
         "current-sr-runs.csv", "current-resource-cells.csv"]


def build(directory, checked_on):
    read = lambda name: json.loads((directory / name).read_text())
    trajectory = read("current-results.json")
    tables = read("current-source-tables.json")
    resources = read("current-efficiency.json")
    name = "results-" + checked_on.replace("-", "") + ".zip"
    manifest = {"schemaVersion": 2, "checkedOn": checked_on,
        "sourceRevisions": {"trajectory": tables["source"]["revision"], "resources": resources["release"]["sourceRevision"], "sr": None},
        "sourceScope": "Trajectory ATE/RPE and resource tables retain their own source revisions. The designated SR CSV export has no supplied Git revision.",
        "artifacts": {file: hashlib.sha256((directory / file).read_bytes()).hexdigest() for file in FILES},
        "counts": {"sourceTables": len(tables["tables"]), "sourceMethodRows": tables["counts"]["methodRows"],
            "sourceCells": tables["counts"]["cells"], "srDatasetMeans": len(trajectory["coverage"]["aggregates"]),
            "srSequenceMeans": len(trajectory["coverage"]["sequences"]), "srExpectedRunSlots": len(trajectory["coverage"]["runs"]),
            "resourceRecords": len(resources["rows"])},
        "download": {"filename": name, "members": FILES + ["results-manifest.json"]}}
    (directory / "results-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    stamp = tuple(map(int, checked_on.split("-"))) + (0, 0, 0)
    with ZipFile(directory / name, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for filename in manifest["download"]["members"]:
            info = ZipInfo(filename, date_time=stamp)
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, (directory / filename).read_bytes(), compresslevel=9)
    print(json.dumps(manifest["counts"], indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", type=Path, default=Path(__file__).resolve().parents[1] / "public/data")
    parser.add_argument("--checked-on", default="2026-10-10")
    args = parser.parse_args()
    build(args.directory, args.checked_on)
