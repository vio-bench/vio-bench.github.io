"""Original pinhole-projection illustration for VIOverse tutorial 2.1.

Run: python3 scripts/draw-camera-projection.py --output-dir <directory>
Dependencies: matplotlib, numpy. Geometry is schematic, not benchmark data.
The two hollow locations are alternative depths for ONE observation.
"""
from pathlib import Path
import argparse
import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Polygon


def draw(output_dir):
    output_dir.mkdir(parents=True, exist_ok=True)
    plt.rcParams.update({
        "font.family": "cmr10", "mathtext.fontset": "cm",
        "font.size": 19, "svg.fonttype": "path", "pdf.fonttype": 42,
        "axes.formatter.use_mathtext": True,
    })
    fig = plt.figure(figsize=(7.8, 4.3), facecolor="white")
    ax = fig.add_axes([0.025, 0.025, 0.95, 0.95])
    ax.set(xlim=(-0.15, 10.85), ylim=(-0.25, 5.45), aspect="equal")
    ax.axis("off")
    black, blue, gray = "#171717", "#143fb5", "#777777"
    origin = np.array([0.90, 1.55])
    # A linear drawing projection of 3D camera coordinates; it does not
    # change the actual central-projection construction used below.
    view = np.array([[0.62, 0.0, 1.0], [-0.45, -0.92, 0.10]])

    def screen(point):
        return origin + view @ np.asarray(point, dtype=float)

    def arrow(a, b, color=black, lw=1.4, ms=13, **kwargs):
        ax.add_patch(FancyArrowPatch(a, b, arrowstyle="-|>", color=color,
                                    linewidth=lw, mutation_scale=ms,
                                    shrinkA=0, shrinkB=0, **kwargs))

    depth_plane = 2.0
    near = np.array([1.2, -1.7, 5.0])
    scale = 1.6
    far = scale * near
    image_point = near * depth_plane / near[2]
    assert np.allclose(near[:2] / near[2], far[:2] / far[2])
    assert np.isclose(image_point[2], depth_plane)

    corners = [screen([x, y, depth_plane]) for x, y in
               [(-1.15, -1.35), (1.15, -1.35), (1.15, 1.35), (-1.15, 1.35)]]
    ax.add_patch(Polygon(corners, closed=True, facecolor="#f3f4f5",
                         edgecolor=black, linewidth=1.15, zorder=1))
    ax.text(2.85, 3.57, "Virtual image plane", ha="center", va="bottom",
            fontsize=18)

    # The camera z axis is the optical axis; x/y follow the standard
    # optical convention. Perspective screen directions are schematic.
    arrow(origin, screen([0, 0, 9.3]), color=gray, lw=1.1, ms=12,
          linestyle=(0, (4, 4)), zorder=2)
    arrow(origin, screen([1.10, 0, 0]), zorder=5)
    arrow(origin, screen([0, 1.10, 0]), zorder=5)
    ax.text(*screen([1.35, 0, 0]), r"$X_C$", fontsize=19,
            ha="center", va="bottom")
    ax.text(*(screen([0, 1.30, 0]) + [-0.04, 0]), r"$Y_C$", fontsize=19,
            ha="right", va="center")
    ax.text(*(screen([0, 0, 9.3]) + [0.05, -0.05]), r"$Z_C$", fontsize=19,
            ha="left", va="center", color=gray)
    ax.text(7.8, 1.88, "Optical axis", color=gray, fontsize=17,
            ha="center", va="top")
    principal = screen([0, 0, depth_plane])
    ax.scatter(*principal, s=23, color=gray, zorder=5)
    ax.text(*(principal + [0.0, -0.27]), r"$(c_x,c_y)$", fontsize=17,
            color=gray, ha="center", va="top")
    ax.scatter(*origin, s=28, color=black, zorder=6)
    ax.text(0.58, 1.78, r"$O_C$", fontsize=22, ha="center", va="bottom")
    ax.text(0.88, -0.04, r"$\{C\}$", fontsize=22, ha="center", va="center")

    # Single ray with two alternative locations; no line connecting
    # separate observations or claim that both points are visible at once.
    arrow(origin, screen(far * 1.025), color=blue, lw=1.7, ms=13, zorder=3)
    ax.scatter(*screen(image_point), s=48, color=blue, zorder=7)
    ax.text(*(screen(image_point) + [-0.18, 0.28]), r"$\mathbf{z}_f$",
            fontsize=24, color=blue, ha="center", va="bottom")
    near_screen, far_screen = screen(near), screen(far)
    for point in (near_screen, far_screen):
        ax.scatter(*point, s=80, facecolors="white", edgecolors=black,
                   linewidths=1.35, zorder=7)
    ax.text(*(near_screen + [-0.10, 0.35]), r"${}^{C}\mathbf{p}_f$",
            fontsize=24, ha="center", va="bottom")
    ax.text(*(far_screen + [-0.10, 0.35]), r"$\lambda\,{}^{C}\mathbf{p}_f$",
            fontsize=24, ha="center", va="bottom")
    angle = np.degrees(np.arctan2(*(far_screen - origin)[::-1]))
    ax.text(4.47, 2.76, "Viewing ray", fontsize=18, color=blue,
            rotation=angle, rotation_mode="anchor", ha="left", va="bottom")

    # Export fixed geometry to preserve label sizes and layout.
    for extension in ("svg", "pdf", "png"):
        fig.savefig(output_dir / f"camera_projection.{extension}", dpi=220,
                    facecolor="white")
    plt.close(fig)
    caption = (
        "Pinhole projection shown on a virtual image plane in front of the "
        "camera center. The hollow points represent two possible depths for "
        "the same observation; both project to the same image coordinate. "
        "They are alternative geometric explanations, not two simultaneously "
        "visible objects. Measurement noise is omitted in this schematic."
    )
    (output_dir / "caption.txt").write_text(caption + "\n")
    (output_dir / "geometry.json").write_text(json.dumps({
        "camera_center": [0, 0, 0],
        "virtual_plane_Z": depth_plane,
        "candidate_position_camera": near.tolist(),
        "alternative_position_camera": far.tolist(),
        "lambda": scale,
        "image_plane_intersection": image_point.tolist(),
        "normalized_projection": (near[:2] / near[2]).tolist(),
        "figure_inches": [7.8, 4.3],
        "font": "Computer Modern Roman and mathematics; vector paths in SVG",
        "data_type": "Original schematic; no benchmark observations",
        "model_reference": "https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html",
    }, indent=2) + "\n")
    print(f"Created projection SVG/PDF/PNG in {output_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path,
                        default=Path(__file__).resolve().parents[1] / "public/images/tutorials")
    draw(parser.parse_args().output_dir)
