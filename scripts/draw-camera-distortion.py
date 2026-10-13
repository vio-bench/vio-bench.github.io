"""Original radial-distortion schematic for VIOverse tutorial 3.1.

Run: python3 scripts/draw-camera-distortion.py --output-dir <directory>
Dependencies: matplotlib, numpy. Synthetic geometry, not benchmark data.
One pixel plane; hollow/filled pairs refer to the same environment point.
"""
from pathlib import Path
import argparse
import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle
from matplotlib.lines import Line2D


def draw(output_dir):
    output_dir.mkdir(parents=True, exist_ok=True)
    plt.rcParams.update({
        "font.family": "cmr10", "mathtext.fontset": "cm",
        "font.size": 20, "svg.fonttype": "path", "pdf.fonttype": 42,
        "axes.formatter.use_mathtext": True,
    })
    width, height = 640.0, 480.0
    fx = fy = 320.0
    principal = np.array([320.0, 240.0])
    k1 = -0.18
    ideal = np.array([
        [60, 60], [320, 20], [580, 60], [590, 240],
        [580, 420], [320, 460], [60, 420], [50, 240],
        [140, 100], [500, 100], [500, 380], [140, 380],
    ], dtype=float)
    normalized = (ideal - principal) / np.array([fx, fy])
    radius2 = np.sum(normalized ** 2, axis=1)
    scales = 1 + k1 * radius2
    distorted = principal + (normalized * scales[:, None]) * np.array([fx, fy])

    # Check the complete image field, rather than only the selected points.
    # The two Jacobian eigenvalues of this first-order radial map are
    # 1 + k1*r^2 (tangential) and 1 + 3*k1*r^2 (radial).
    corner_radius2 = np.sum((principal / np.array([fx, fy])) ** 2)
    min_tangential = 1 + k1 * corner_radius2
    min_radial = 1 + 3 * k1 * corner_radius2
    assert min_tangential > 0 and min_radial > 0
    assert np.all(scales > 0) and np.all(scales < 1)
    assert np.all(np.linalg.norm(distorted - principal, axis=1) <
                  np.linalg.norm(ideal - principal, axis=1))

    fig = plt.figure(figsize=(6.2, 5.0), facecolor="white")
    ax = fig.add_axes([0.04, 0.16, 0.92, 0.81])
    ax.set(xlim=(-60, 690), ylim=(515, -55), aspect="equal")
    ax.axis("off")
    black, blue, gray = "#171717", "#143fb5", "#777777"
    ax.add_patch(Rectangle((0, 0), width, height, facecolor="white",
                           edgecolor="#b4b4b4", linewidth=0.8))
    for u in (160, 320, 480):
        ax.plot([u, u], [0, height], color="#e8e8e8", lw=0.65, zorder=1.1)
    for v in (120, 240, 360):
        ax.plot([0, width], [v, v], color="#e8e8e8", lw=0.65, zorder=1.1)

    def axis_arrow(a, b):
        ax.add_patch(FancyArrowPatch(a, b, arrowstyle="-|>", color=black,
                                    linewidth=1.1, mutation_scale=12,
                                    shrinkA=0, shrinkB=0, clip_on=False))

    axis_arrow((0, -25), (width + 8, -25))
    axis_arrow((-25, 0), (-25, height + 8))
    ax.text(width + 18, -25, r"$u$", fontsize=23, va="center", ha="left")
    ax.text(-25, height + 23, r"$v$", fontsize=23, va="center", ha="center")

    # Arrows are ideal-to-distorted displacements in the same pixel plane.
    for start, end in zip(ideal, distorted):
        ax.add_patch(FancyArrowPatch(start, end, arrowstyle="-|>",
                                    color=gray, linewidth=0.9,
                                    mutation_scale=9, shrinkA=3.5, shrinkB=2.8,
                                    zorder=2))
    ax.scatter(ideal[:, 0], ideal[:, 1], s=40, facecolors="white",
               edgecolors=black, linewidths=1.05, zorder=4)
    ax.scatter(distorted[:, 0], distorted[:, 1], s=30, color=blue, zorder=5)
    ax.scatter(*principal, s=100, marker="+", color=black,
               linewidths=1.1, zorder=6)
    ax.text(principal[0], principal[1] + 33, r"$(c_x,c_y)$",
            fontsize=22, ha="center", va="center")

    handles = [
        Line2D([], [], marker="o", linestyle="none", markersize=6,
               markerfacecolor="white", markeredgecolor=black,
               markeredgewidth=1.0, label="Ideal pinhole"),
        Line2D([], [], marker="o", linestyle="none", markersize=5.5,
               markerfacecolor=blue, markeredgecolor=blue, label="With distortion"),
    ]
    fig.legend(handles=handles, loc="lower center", bbox_to_anchor=(0.5, 0.02),
               frameon=False, ncol=2, fontsize=17, handletextpad=0.5,
               columnspacing=1.4)
    for extension in ("svg", "pdf", "png"):
        fig.savefig(output_dir / f"camera-distortion.{extension}", dpi=220,
                    facecolor="white")
    plt.close(fig)

    geometry = {
        "data_type": "Original synthetic schematic; no calibration or benchmark observations",
        "model": "First-order radial distortion, x_d=x*(1+k1*r^2), y_d=y*(1+k1*r^2)",
        "model_reference": "https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html",
        "image_size_px": [width, height],
        "intrinsics_px": {"fx": fx, "fy": fy, "cx": principal[0], "cy": principal[1]},
        "k1": k1,
        "ideal_pixels": ideal.tolist(),
        "distorted_pixels": distorted.tolist(),
        "arrow_direction": "ideal to distorted",
        "noise": "omitted",
        "field_checks": {"max_radius_squared": corner_radius2,
                         "min_tangential_derivative": min_tangential,
                         "min_radial_derivative": min_radial},
        "figure_inches": [6.2, 5.0],
        "font": "Computer Modern Roman and mathematics; SVG labels are vector paths",
    }
    (output_dir / "geometry.json").write_text(json.dumps(geometry, indent=2) + "\n")
    print(f"Created radial-distortion SVG/PDF/PNG in {output_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path,
                        default=Path(__file__).resolve().parents[1] / "public/images/tutorials")
    draw(parser.parse_args().output_dir)
