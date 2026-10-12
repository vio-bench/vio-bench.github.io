"""Copy approved paper overviews after checking their data sources.

Usage: python3 scripts/sync-homepage-result-figures.py /path/to/paper-checkout
Reads the paper; does not regenerate experiments, aggregates, or plots.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re
import shutil


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paper", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    result = json.loads((root / "public/data/current-results.json").read_text())
    sources = {source["id"]: source for source in result["sources"]}
    paper = args.paper
    matched_sources = {
        "ate": paper / "results/accuracy_joint/component_colors_20260910/sources/ate/source_ate_plot.csv",
        "rpe10": paper / "results/accuracy_joint/component_colors_20260910/sources/rpe/rpe10_plot.csv",
        "sr": paper / "results/robustness_sr/approved_horizontal_20260910/source/average_sr_by_dataset.csv",
    }
    for key, path in matched_sources.items():
        expected = next(record["sha256"] for record in sources[key]["files"] if "aggregate" in record["name"])
        if sha(path) != expected:
            raise ValueError(f"Paper and website {key} sources differ; do not copy the preview.")
    records = [
        ("coverage", "Valid-path coverage (SR)", paper / "figures/robustness_sr.svg", ["sr"],
         "Mean SR across the five datasets, with monocular and stereo configurations shown separately"),
        ("trajectory", "Trajectory error (ATE / RPE)",
         paper / "results/accuracy_joint/component_colors_20260910/accuracy_ate_rpe.svg", ["ate", "rpe10"],
         "Position and orientation ATE and relative pose errors at a 10 m segment length across the five datasets"),
    ]
    destination = root / "public/images/results"
    destination.mkdir(parents=True, exist_ok=True)
    previews = []
    for identity, label, source, source_ids, alt in records:
        svg = source.read_text()
        if re.search(r"/Users/|/home/|/Volumes/", svg):
            raise ValueError("A figure contains a private filesystem path.")
        viewbox = [float(value) for value in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
        target = destination / f"overview-{identity}.svg"
        shutil.copyfile(source, target)
        previews.append({
            "id": identity, "label": label, "image": f"/images/results/{target.name}",
            "alt": alt, "width": viewbox[2], "height": viewbox[3],
            "sha256": sha(source), "paperSource": str(source.relative_to(paper)),
            "resultSources": [sources[key] for key in source_ids],
        })
        print(f"Copied {label}; paper and website data sources match.")
    (root / "data/homepage-result-figures.json").write_text(json.dumps(previews, indent=2) + "\n")


if __name__ == "__main__":
    main()
