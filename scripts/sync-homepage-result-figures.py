"""Copy approved paper overviews after checking their data sources.

Usage: python3 scripts/sync-homepage-result-figures.py /path/to/paper-checkout
Reads the paper; does not regenerate experiments, aggregates, or plots.
"""
from pathlib import Path
import argparse
import csv
from decimal import Decimal
import hashlib
import json
import re
import shutil
import xml.etree.ElementTree as ET


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_resource_marks(svg, points):
    ns = "{http://www.w3.org/2000/svg}"
    groups = {element.get("id"): element for element in ET.fromstring(svg).iter(ns + "g")}
    if {key for key in groups if key and key.startswith("point-")} != {point["point_id"] for point in points}:
        raise ValueError("Resource SVG and CSV point sets differ.")
    for point in points:
        group = groups[point["point_id"]]
        mark = group.find(".//" + ns + "use")
        path = group.find(".//" + ns + "path")
        color = re.search(r"fill:\s*([^;]+)", mark.get("style")).group(1)
        radius = float(re.match(r"M\s+0\s+([\d.]+)", path.get("d")).group(1))
        values = [(float(mark.get("x")), float(point["svg_x_pt"])),
                  (float(mark.get("y")), float(point["svg_y_pt"])),
                  (radius * 2, float(point["marker_diameter_pt"]))]
        if color != point["cpu_color_hex"] or any(abs(actual - expected) > 1e-5 for actual, expected in values):
            raise ValueError(f"Resource SVG mark differs from CSV: {point['point_id']}.")


def portable_resource_math(svg):
    # Original cmex10 'p' glyph = radicalbig, unitsPerEm 2048. Outline only
    # this encoded symbol so browsers need no local Computer Modern font.
    # The original VINS text, overbar, label position and all points stay intact.
    outline = 'M868 -2376 406 -1300 262 -1411 225 -1374 518 -1147 950 -2152 2013 63Q2023 82 2048 82Q2065 82 2077.0 70.0Q2089 58 2089 41Q2089 31 2087 27L944 -2357Q936 -2376 913 -2376Z'
    size = 7.011382 / 2048
    old = '''<text>
      <tspan style="font: 7.011382px 'cmex10'" x="0" y="-8.23875">p</tspan>'''
    new = f'<path d="{outline}" transform="translate(0 -8.23875) scale({size} {-size})"/>\n     <text>'
    if svg.count(old) != 5:
        raise ValueError("Unexpected resource math labels; inspect the SVG before importing it.")
    return svg.replace(old, new)


def check_resources(paper, root):
    package = paper / "results/efficiency_desktop_overview/polish_20260913"
    resource = json.loads((root / "public/data/current-efficiency.json").read_text())
    manifest = json.loads((package / "manifest.json").read_text())
    desktop = next(item for item in resource["release"]["resourceSourceProof"] if item["platform"] == "Desktop")
    if (manifest["source_commit"] != resource["release"]["sourceRevision"]
            or sha(package / "evidence/resource_pc.tex") != desktop["sha256"]):
        raise ValueError("Paper and website resource sources differ; do not copy the preview.")
    with (package / "data/plot_data.csv").open() as stream:
        points = list(csv.DictReader(stream))
    source_svg = (paper / "figures/efficiency_desktop_overview.svg").read_text()
    check_resource_marks(source_svg, points)
    check_resource_marks(portable_resource_math(source_svg), points)
    metrics = {
        "total_timing_ms": "nativeTotalMs",
        "cpu_utilization": "reportedCpuPercent",
        "process_memory_mib": "reportedProcessMemoryMiB",
    }
    identity = lambda row, sequence, variant: (
        row["system"], row["mode"], row["dataset"], row["platform"], row[sequence], row[variant]
    )
    rows = {
        identity(row, "sequence", "inputVariant"): row for row in resource["rows"]
        if row["platform"] == "Desktop" and row["mode"] == "mono"
        and all(row.get(metric) is not None for metric in metrics.values())
    }
    keys = [identity(point, "profiling_sequence", "input_variant") for point in points]
    if len(keys) != len(set(keys)) or set(keys) != set(rows):
        raise ValueError("Paper resource point identities do not match the website's available Desktop monocular values.")
    for point, key in zip(points, keys):
        row = rows[key]
        for source_metric, site_metric in metrics.items():
            if Decimal(point[source_metric]) != Decimal(str(row[site_metric])):
                raise ValueError(f"Paper and website resource values differ: {key}, {site_metric}.")
        # These two source labels identify the same already-reported SVO sum.
        timing = {"sum_of_reported_frontend_and_backend_means": "frontend_plus_backend"}.get(
            point["timing_definition"], point["timing_definition"]
        )
        if timing != row["timingDefinition"]:
            raise ValueError(f"Resource timing definitions differ: {key}.")
    return {
        "id": "resources", "label": "Reviewed resource source tables",
        "revision": resource["release"]["sourceRevision"],
        "files": [{"name": "resource_pc.tex", "sha256": desktop["sha256"]},
                  {"name": "resource-plot.csv", "sha256": sha(package / "data/plot_data.csv")}],
        "matchedDesktopMonocularPoints": len(points),
    }


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
    sources["resources"] = check_resources(paper, root)
    trajectory_caption = "Monocular and stereo configurations are shown separately."
    records = [
        ("coverage", "Valid-path coverage (SR)", paper / "figures/robustness_sr.svg", ["sr"],
         "Mean SR across the five datasets, with monocular and stereo configurations shown separately", trajectory_caption),
        ("trajectory", "Trajectory error (ATE / RPE)",
         paper / "results/accuracy_joint/component_colors_20260910/accuracy_ate_rpe.svg", ["ate", "rpe10"],
         "Position and orientation ATE and relative pose errors at a 10 m segment length across the five datasets", trajectory_caption),
        ("resources", "Runtime & resources", paper / "figures/efficiency_desktop_overview.svg", ["resources"],
         "Desktop monocular resource measurements on five fixed profiling inputs; axes show reported total time and process memory, and circle area and color show CPU utilization",
         "Desktop monocular measurements on one sequence per dataset. Axes show reported total time and process memory; circle area and color show CPU utilization. SVO time is the source-reported sum of frontend and backend means."),
    ]
    destination = root / "public/images/results"
    destination.mkdir(parents=True, exist_ok=True)
    previews = []
    for identity, label, source, source_ids, alt, caption in records:
        svg = source.read_text()
        if re.search(r"/Users/|/home/|/Volumes/", svg):
            raise ValueError("A figure contains a private filesystem path.")
        viewbox = [float(value) for value in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
        target = destination / f"overview-{identity}.svg"
        if identity == "resources":
            target.write_text(portable_resource_math(svg))
        else:
            shutil.copyfile(source, target)
        previews.append({
            "id": identity, "label": label, "image": f"/images/results/{target.name}",
            "alt": alt, "caption": caption, "width": viewbox[2], "height": viewbox[3],
            "sha256": sha(target), "paperSha256": sha(source), "paperSource": str(source.relative_to(paper)),
            "renderingAdjustments": ["Outlined five cmex10 radical glyphs for browser portability"] if identity == "resources" else [],
            "resultSources": [sources[key] for key in source_ids],
        })
        print(f"Copied {label}; paper and website data sources match.")
    (root / "data/homepage-result-figures.json").write_text(json.dumps(previews, indent=2) + "\n")


if __name__ == "__main__":
    main()
