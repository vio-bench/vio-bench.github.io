"""Recover existing camera previews from the VIOverse video-source PPTX.

Usage: python3 scripts/build-homepage-previews.py /path/to/video-source.pptx
Dependencies: Pillow, imageio-ffmpeg
The source archive is read-only. No frames are synthesized, cropped, or retimed.
"""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import tempfile
import zipfile

from PIL import Image
import imageio_ffmpeg

ASSETS = [
    ("euroc", "EuRoC", "Indoor aerial flight", "image10.gif", None,
     "Camera frames from the EuRoC MAV dataset", "EuRoC MAV dataset / ETH ASL",
     "https://projects.asl.ethz.ch/datasets/euroc-mav/"),
    ("uzh-fpv", "UZH-FPV", "Aggressive flight", "image1.gif", None,
     "Left-camera frames from the UZH-FPV dataset", "UZH-FPV dataset / UZH RPG",
     "https://fpv.ifi.uzh.ch/"),
    ("aqualoc", "AQUALOC", "Underwater navigation", "image2.gif", "Harbor 07",
     "Underwater camera frames from AQUALOC Harbor 07", "AQUALOC dataset",
     "https://www.lirmm.fr/aqualoc/"),
    ("lamaria", "LaMAria", "Wearable sensing", "image3.gif", "R_02_easy",
     "Black-and-white camera preview from LaMAria R_02_easy", "LaMAria dataset",
     "https://lamaria.ethz.ch/slam_datasets"),
    ("grandtour", "GrandTour", "Legged field robotics", "grandtour_official_onboard.gif", "2024-10-01-11-29-55",
     "Onboard front-center camera frames from a GrandTour legged-robot recording", "GrandTour dataset / ETH RSL",
     "https://grand-tour.leggedrobotics.com/"),
]


def gif_info(path):
    with Image.open(path) as image:
        durations = []
        for i in range(image.n_frames):
            image.seek(i)
            image.load()
            durations.append(image.info.get("duration", 0))
        return image.size, len(durations), sum(durations)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    args = parser.parse_args()
    repository = Path(__file__).resolve().parents[1]
    destination = repository / "public/images/benchmark/inputs"
    destination.mkdir(parents=True, exist_ok=True)
    rows = []
    archive_hash = hashlib.sha256(args.source.read_bytes()).hexdigest()
    with zipfile.ZipFile(args.source) as archive, tempfile.TemporaryDirectory() as scratch:
        for dataset_id, label, domain, filename, sequence, alt, credit, source_page in ASSETS:
            original = Path(scratch) / filename
            original.write_bytes(archive.read("ppt/media/" + filename))
            source_size, source_frames, source_duration = gif_info(original)
            gif = destination / f"{dataset_id}.gif"
            filters = (
                "scale=360:-1:flags=lanczos,split[a][b];"
                "[a]palettegen=max_colors=128:stats_mode=diff[p];"
                "[b][p]paletteuse=dither=bayer:bayer_scale=3"
            )
            subprocess.run([
                imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error",
                "-i", str(original), "-filter_complex", filters,
                "-loop", "0", "-y", str(gif),
            ], check=True)
            size, frames, duration = gif_info(gif)
            if (frames, duration) != (source_frames, source_duration):
                raise ValueError(f"Frame count or duration changed for {dataset_id}")
            webp = destination / f"{dataset_id}.webp"
            webp_frames, frame_durations = [], []
            with Image.open(original) as image:
                for i in range(image.n_frames):
                    image.seek(i)
                    webp_frames.append(image.convert("RGB").resize(size, Image.Resampling.LANCZOS))
                    frame_durations.append(image.info.get("duration", 100))
            webp_frames[0].save(webp, save_all=True, append_images=webp_frames[1:],
                duration=frame_durations, loop=0, quality=82, method=6)
            _, webp_count, webp_duration = gif_info(webp)
            expected_count = sum(i == 0 or frame.tobytes() != webp_frames[i - 1].tobytes()
                for i, frame in enumerate(webp_frames))
            if (webp_count, webp_duration) != (expected_count, source_duration):
                raise ValueError(f"WebP removed distinct frames or changed duration for {dataset_id}")
            with Image.open(gif) as image:
                image.seek(0)
                image.convert("RGB").save(destination / f"{dataset_id}-poster.jpg", quality=92)
            rows.append({
                "datasetId": dataset_id, "label": label, "domain": domain,
                "gif": f"/images/benchmark/inputs/{dataset_id}.gif",
                "webp": f"/images/benchmark/inputs/{dataset_id}.webp",
                "poster": f"/images/benchmark/inputs/{dataset_id}-poster.jpg",
                "width": size[0], "height": size[1], "alt": alt,
                "credit": credit, "sourcePage": source_page, "sequence": sequence,
                "sourcePackage": args.source.name, "sourcePackageSha256": archive_hash,
                "embeddedAsset": "ppt/media/" + filename,
                "embeddedSha256": hashlib.sha256(original.read_bytes()).hexdigest(),
                "sourceDimensions": list(source_size), "frames": frames,
                "durationMs": duration, "derivativeSha256": hashlib.sha256(gif.read_bytes()).hexdigest(),
                "webpSha256": hashlib.sha256(webp.read_bytes()).hexdigest(),
                "webpEncodedFrames": webp_count, "webpDurationMs": webp_duration,
                "mappingEvidence": "Dataset labels and shapes in slide 2; source notes in slide 1",
                "purpose": "Dataset input preview; not a profiling result or estimator output",
            })
            print(f"{label}: {frames} original frames, {duration / 1000:g} s; GIF {gif.stat().st_size / 2**20:.2f} MiB, WebP {webp.stat().st_size / 2**20:.2f} MiB")
    (repository / "data/dataset-input-previews.json").write_text(json.dumps(rows, indent=2) + "\n")


if __name__ == "__main__":
    main()
