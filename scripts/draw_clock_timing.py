"""Clock labels and host timing for one schematic measurement event.

Usage: python3 draw_clock_timing.py [--output-dir DIRECTORY]
The camera and IMU labels represent the same event at physical time zero.
The offset tau is a clock-label difference, never a transport duration.
"""
import argparse
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle

parser = argparse.ArgumentParser()
parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parent)
args = parser.parse_args()
out = args.output_dir.resolve()
out.mkdir(parents=True, exist_ok=True)

plt.rcParams.update({
    "font.family": "cmr10", "mathtext.fontset": "cm", "font.size": 10.7,
    "svg.fonttype": "path", "pdf.fonttype": 42,
    "axes.formatter.use_mathtext": True,
})
black, blue = "#202020", "#386f99"
fig = plt.figure(figsize=(6.6, 4.2), facecolor="white")
ax = fig.add_axes([0.012, 0.025, 0.976, 0.95])
ax.set_xlim(-11.2, 24.0)
ax.set_ylim(-0.43, 4.15)
ax.axis("off")

camera_y, imu_y, host_y, axis_y = 3.60, 2.77, 1.68, 0.12
clock_start, clock_end = -2.95, 22.6
event_time, receive, start, finish, output = 0.0, 6.0, 11.0, 19.0, 20.0

def arrow(x1, y1, x2, y2, **kwargs):
    p = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=kwargs.pop("arrowstyle", "-|>"),
                        mutation_scale=8, linewidth=0.7, color=black, **kwargs)
    ax.add_patch(p)
    return p

# A vertical guide identifies event correspondence, not latency.
ax.plot([event_time, event_time], [axis_y, camera_y], color=blue,
        linewidth=0.9, linestyle=(0, (3.2, 3.2)), zorder=1)

for y in (camera_y, imu_y, host_y):
    arrow(clock_start, y, clock_end, y, zorder=1)

for y in (camera_y, imu_y):
    ax.scatter([0], [y], s=21, color=blue, zorder=5)

# This example's image measurement time is the exposure midpoint.
ax.add_patch(Rectangle((-2, camera_y - 0.065), 4, 0.13,
                       facecolor="#e6eef4", edgecolor=blue,
                       linewidth=0.75, zorder=3))
ax.scatter([0], [camera_y], s=21, color=blue, zorder=5)

ax.text(-10.85, camera_y, r"Camera clock $t_C$", va="center", color=black)
ax.text(-10.85, imu_y, r"IMU clock $t_I$", va="center", color=black)
ax.text(-10.85, host_y, "Host timing", va="center", color=black)
ax.text(-10.85, host_y - 0.23, "Common time basis", va="center",
        fontsize=9.3, color=black)

ax.text(0.45, camera_y + 0.21, r"$10.000\ \mathrm{s}$", va="bottom", fontsize=12.2)
ax.text(3.1, camera_y - 0.21, r"Exposure: $-2$ to $+2$ ms", va="center", fontsize=10.0)
ax.text(0.45, imu_y + 0.19, r"$10.005\ \mathrm{s}$", va="bottom", fontsize=12.2)
ax.text(6.6, imu_y - 0.22, r"$t_I=t_C+\tau,\quad\tau=+5\ \mathrm{ms}$",
        va="center", fontsize=12.2)

# Queue and computation are distinct elapsed intervals on the mapped host clock.
bar_h = 0.19
ax.add_patch(Rectangle((receive, host_y - bar_h / 2), start - receive, bar_h,
                       facecolor="#f0f0f0", edgecolor=black, linewidth=0.65, zorder=3))
ax.add_patch(Rectangle((start, host_y - bar_h / 2), finish - start, bar_h,
                       facecolor=blue, edgecolor=blue, linewidth=0.65, zorder=3))
ax.scatter([0], [host_y], s=21, color=blue, zorder=5)
ax.scatter([receive], [host_y], s=15, color=black, zorder=5)
ax.scatter([output], [host_y], s=24, facecolors="white", edgecolors=black,
           linewidths=0.9, zorder=5)

ax.text(8.5, host_y + 0.25, "Queue\n6 to 11 ms", ha="center", va="bottom", linespacing=1.25)
ax.text(15.0, host_y + 0.25, "Processing\n11 to 19 ms", ha="center", va="bottom", linespacing=1.25)
ax.text(0.30, host_y - 0.28, "Reference\n0 ms", ha="left", va="top",
        fontsize=9.7, linespacing=1.18)
ax.text(6.0, host_y - 0.27, "Receive\n6 ms", ha="center", va="top",
        fontsize=9.8, linespacing=1.18)
ax.text(15.0, host_y - 0.29, r"$P=8\ \mathrm{ms}$", ha="center", va="top", fontsize=12.2)
ax.text(20.0, host_y - 0.27, "Output\n20 ms", ha="center", va="top",
        fontsize=9.8, linespacing=1.18)

# L is the complete reference-time-to-output interval, including post-processing.
latency_y = 0.61
arrow(0, latency_y, output, latency_y, arrowstyle="<->", zorder=2)
ax.text(10.0, latency_y + 0.075, r"Full latency $L=20\ \mathrm{ms}$",
        ha="center", va="bottom", fontsize=11.5,
        bbox={"facecolor": "white", "edgecolor": "none", "pad": 0.5})

arrow(clock_start, axis_y, clock_end, axis_y)
for tick in (-2, 0, 5, 10, 15, 20):
    ax.plot([tick, tick], [axis_y - 0.055, axis_y + 0.055], color=black, linewidth=0.7)
    ax.text(tick, axis_y - 0.10, str(tick), ha="center", va="top", fontsize=9.8)
ax.text(10.0, -0.39, "Relative physical time (ms)", ha="center", va="bottom", fontsize=10.7)

fig.canvas.draw()
renderer = fig.canvas.get_renderer()
boxes = [(t.get_text(), t.get_window_extent(renderer)) for t in ax.texts]
for name, box in boxes:
    assert box.x0 >= 0 and box.y0 >= 0, name
    assert box.x1 <= fig.bbox.width and box.y1 <= fig.bbox.height, name
overlap_pairs = []
for i, (n1, b1) in enumerate(boxes):
    for n2, b2 in boxes[i + 1:]:
        if b1.overlaps(b2):
            overlap_pairs.append([n1, n2])
assert not overlap_pairs, overlap_pairs

fig.savefig(out / "clock-and-host-timing.svg", facecolor="white")
fig.savefig(out / "clock-and-host-timing.png", dpi=100, facecolor="white")

caption = (
    "Clock labels and host timing for the same event, with image exposure referenced to its midpoint. "
    "The camera–IMU offset changes the event's clock label; it is not transport time. "
    "Host times use a common physical time basis. Processing takes 8 ms; full latency is 20 ms. "
    "All values are schematic, not benchmark measurements."
)
check = {
    "original_scientific_schematic": True,
    "benchmark_data": False,
    "canvas_inches": [6.6, 4.2],
    "png_pixels": [660, 420],
    "physical_event_time_ms": 0,
    "exposure_interval_ms": [-2, 2],
    "camera_event_label_seconds": 10.000,
    "imu_event_label_seconds": 10.005,
    "tau_seconds": 0.005,
    "clock_offset_is_transport_delay": False,
    "host_clock_mapped_to_common_physical_time": True,
    "receive_time_ms": receive,
    "queue_interval_ms": [receive, start],
    "processing_interval_ms": [start, finish],
    "processing_time_ms": finish - start,
    "output_time_ms": output,
    "full_output_latency_ms": output - event_time,
    "post_processing_interval_ms": [finish, output],
    "three_event_reference_markers_vertically_aligned": True,
    "label_boxes_inside_canvas": True,
    "label_overlap_pairs": overlap_pairs,
    "font": "Computer Modern Roman and mathematics; SVG labels are paths",
    "caption": caption,
}
assert check["processing_time_ms"] == 8
assert check["full_output_latency_ms"] == 20
assert abs(check["imu_event_label_seconds"] - check["camera_event_label_seconds"] - .005) < 1e-12
(out / "clock-and-host-timing-geometry.json").write_text(json.dumps(check, indent=2) + "\n")
(out / "clock-and-host-timing-caption.txt").write_text(caption + "\n")
figure = {
    "type": "figure", "src": "/images/tutorials/clock-and-host-timing.svg",
    "width": 660, "height": 420,
    "alt": "Three aligned timelines distinguish clock labels from output delay. One event at physical time zero has camera label 10.000 seconds and IMU label 10.005 seconds. Image exposure spans minus 2 to plus 2 milliseconds. Host reception is at 6 milliseconds, queueing from 6 to 11, processing from 11 to 19, and output at 20. Processing is 8 milliseconds; full latency is 20 milliseconds.",
    "caption": caption,
}
(out / "clock-and-host-timing-block.json").write_text(json.dumps(figure, indent=2) + "\n")
print(json.dumps(check, indent=2))
